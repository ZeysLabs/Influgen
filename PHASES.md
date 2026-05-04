# InfluGen — n8n Webhook Entegrasyonu Implementasyon Planı

> **Goal:** Uygulama içinden doğrudan image generation API kullanmak yerine, tüm görsel üretim akışını n8n workflow'una webhook üzerinden yönlendirmek. n8n'den dönen webhook ile üretilen görsel URL'si alınacak ve uygulamada gösterilecek.

**Mimari:** Next.js API route'ları aracılığıyla n8n webhook'una asenkron POST atılacak. n8n görseli ürettikten sonra geri dönüş webhook'u ile URL gönderecek. Frontend, server-side in-memory store üzerinden polling ile bu URL'yi alıp localStorage'a kaydedecek.

**Tech Stack:** Next.js 16 (App Router), TypeScript, n8n Webhook, In-Memory Store (development), localStorage (client-side persistence)

---

## Mevcut Durum Analizi

### Problemler

1. **`output: "export"` kullanılıyor** (`next.config.ts`): Bu ayar, production build'inde tüm sayfaları static HTML'e dönüştürür ve **API route'ları (`app/api/**`) devre dışı bırakır**. Mevcut `src/app/api/generate-image/route.ts` dosyası development'ta (`npm run dev`) çalışır ancak production'da (`next build` + static export) çalışmaz.

2. **Doğrudan API entegrasyonu:** Mevcut `generate-image` route'u `IMAGE_GENERATION_API_KEY` ve `IMAGE_GENERATION_PROVIDER` env değişkenlerini bekliyor. Bu mantık tamamen değişecek.

3. **Senkron akış:** Builder'da "Generate" butonuna basıldığında, istek anında bir yanıt bekleniyor (`imageUrl` veya `error`). n8n workflow'u asenkron çalışacağı için bu akış değişmeli.

4. **Dashboard bekleme durumu yok:** Dashboard'da bir prompt için görsel üretimi devam ederken "Generating..." gibi bir durum gösterilmiyor.

### Webhook Akışı (Hedef)

```
┌─────────────┐      POST /api/generate-image       ┌──────────────┐
│   Builder   │ ───────────────────────────────────> │  Next.js API │
│   (Client)  │                                    │   (Server)   │
└─────────────┘                                    └──────┬───────┘
       │                                                  │
       │  1. JSON payload oluştur                          │  2. n8n webhook'a POST at
       │     (category, selections, finalPrompt, etc.)     │     (promptId + callbackUrl)
       │                                                  │
       │                                                  ▼
       │                                           ┌──────────────┐
       │                                           │  n8n Workflow │
       │                                           │   (External)  │
       │                                           └──────┬───────┘
       │                                                  │
       │                                                  │ 3. Görsel üret
       │                                                  │    (Midjourney/SD vb.)
       │                                                  │
       │  5. Polling: GET /api/prompts/[id]               │ 4. POST /api/webhook/n8n
       │ <────────────────────────────────────────────────│    (promptId + imageUrl)
       │                                                  │
       ▼                                                  ▼
┌─────────────┐                                    ┌──────────────┐
│  Dashboard  │                                    │  In-Memory   │
│   (Client)  │                                    │    Store     │
└─────────────┘                                    └──────────────┘
```

### Payload Formatları

**n8n'e Giden (POST /api/generate-image → n8n):**
```json
{
  "promptId": "prompt-1714823456789",
  "category": "Fashion",
  "selections": {
    "subject": "Model",
    "gender": "Female",
    "outfit": "Evening"
  },
  "jsonPrompt": {
    "category": "Fashion",
    "subject": "Model",
    "gender": "Female",
    "outfit": "Evening",
    "lightingStyle": "Soft",
    "aspectRatio": "4:5"
  },
  "finalPrompt": "Fashion visual — subject: Model, gender: Female, outfit: Evening...",
  "callbackUrl": "https://influgen.app/api/webhook/n8n"
}
```

**n8n'den Gelen (POST /api/webhook/n8n):**
```json
{
  "promptId": "prompt-1714823456789",
  "imageUrl": "https://cdn.example.com/generated/fashion-123.png",
  "status": "completed"
}
```

---

## Phase 0: Altyapı Hazırlığı

**Hedef:** API route'ların çalışabilmesi için static export'u kaldırmak ve gerekli env değişkenlerini tanımlamak.

**Files:**
- Modify: `next.config.ts`
- Create: `.env.local.example`
- Modify: `.gitignore`

**Adımlar:**

- [x] **Step 1:** `next.config.ts`'ten `output: "export"` satırını kaldır
  ```typescript
  const nextConfig: NextConfig = {
    images: {
      unoptimized: true,
    },
  };
  ```
  **Not:** Bu değişiklik, uygulamanın artık bir Node.js sunucusu gerektirdiği anlamına gelir. Static hosting (Netlify static, GitHub Pages) yerine Vercel, Railway, Render gibi platformlar kullanılmalıdır.

- [x] **Step 2:** `.env.local.example` oluştur
  ```bash
  # n8n Webhook Configuration
  N8N_WEBHOOK_URL=http://http://5.175.136.114:5678/:5678/webhook-test/influgen-generate
  N8N_WEBHOOK_SECRET=123456

  # Application URL (for callback)
  APP_URL=http://localhost:3000
  ```

- [x] **Step 3:** `.gitignore` kontrol et (`.env*` zaten ignore ediliyor, ek işlem gerekmez)

---

## Phase 1: API Route'ları Oluşturma

**Hedef:** n8n ile iletişim kuracak 3 API endpoint'i oluşturmak.

**Files:**
- Modify: `src/app/api/generate-image/route.ts`
- Create: `src/app/api/webhook/n8n/route.ts`
- Create: `src/app/api/prompts/[id]/route.ts`
- Create: `src/lib/store.ts` (in-memory store)

### Task 1.1: In-Memory Store (`src/lib/store.ts`)

**Hedef:** n8n'den gelen webhook yanıtlarını geçici olarak saklamak.

**Not:** Bu store development ortamı içindir. Production'da Redis, Supabase veya başka bir persistence katmanı kullanılmalıdır.

```typescript
// src/lib/store.ts
export interface WebhookResponse {
  promptId: string;
  imageUrl?: string;
  status: "pending" | "completed" | "failed";
  error?: string;
  createdAt: string;
  updatedAt: string;
}

const store = new Map<string, WebhookResponse>();

export function setResponse(data: WebhookResponse) {
  store.set(data.promptId, data);
}

export function getResponse(promptId: string): WebhookResponse | undefined {
  return store.get(promptId);
}

export function createPending(promptId: string) {
  const now = new Date().toISOString();
  store.set(promptId, {
    promptId,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });
}
```

**Adımlar:**
- [x] **Step 1:** `src/lib/store.ts` dosyasını yukarıdaki içerikle oluştur
- [x] **Step 2:** TypeScript derleme hatası olup olmadığını kontrol et (`npm run build` veya `npx tsc --noEmit`)

### Task 1.2: Generate Image Route (`src/app/api/generate-image/route.ts`)

**Hedef:** Builder'dan gelen JSON payload'u alıp n8n webhook'una POST atmak.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createPending } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { promptId, category, selections, jsonPrompt, finalPrompt } = body;

    // Validation
    if (!promptId || !category || !finalPrompt) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: promptId, category, finalPrompt" },
        { status: 400 }
      );
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { success: false, error: "N8N_WEBHOOK_URL is not configured." },
        { status: 500 }
      );
    }

    // Mark as pending in store
    createPending(promptId);

    // Prepare callback URL
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const callbackUrl = `${appUrl}/api/webhook/n8n`;

    // Send to n8n
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.N8N_WEBHOOK_SECRET && {
          "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET,
        }),
      },
      body: JSON.stringify({
        promptId,
        category,
        selections: selections || {},
        jsonPrompt: jsonPrompt || {},
        finalPrompt,
        callbackUrl,
      }),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error("n8n webhook error:", errorText);
      return NextResponse.json(
        { success: false, error: "Failed to trigger n8n workflow." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Generation started. Check dashboard for results.",
      promptId,
    });
  } catch (error) {
    console.error("Generate image error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
```

**Adımlar:**
- [x] **Step 1:** `src/app/api/generate-image/route.ts` dosyasını yukarıdaki içerikle güncelle
- [x] **Step 2:** `npm run dev` çalıştır ve Postman/Thunder Client ile test et:
  ```bash
  curl -X POST http://localhost:3000/api/generate-image \
    -H "Content-Type: application/json" \
    -d '{"promptId":"test-1","category":"Fashion","selections":{"subject":"Model"},"finalPrompt":"Test prompt","jsonPrompt":{"category":"Fashion"}}'
  ```
  **Expected:** `{ "success": true, "message": "...", "promptId": "test-1" }` (n8n webhook URL'si tanımlı değilse env hatası verecektir, bu normal)

### Task 1.3: n8n Webhook Callback (`src/app/api/webhook/n8n/route.ts`)

**Hedef:** n8n workflow'undan gelen POST isteğini alıp in-memory store'a kaydetmek.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { setResponse } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { promptId, imageUrl, status, error } = body;

    if (!promptId) {
      return NextResponse.json(
        { success: false, error: "promptId is required." },
        { status: 400 }
      );
    }

    // Optional: Validate webhook secret
    const secret = req.headers.get("X-Webhook-Secret");
    if (process.env.N8N_WEBHOOK_SECRET && secret !== process.env.N8N_WEBHOOK_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    setResponse({
      promptId,
      imageUrl,
      status: status || (imageUrl ? "completed" : "failed"),
      error,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { success: false, error: "Invalid request." },
      { status: 500 }
    );
  }
}
```

**Adımlar:**
- [x] **Step 1:** `src/app/api/webhook/n8n/route.ts` dosyasını yukarıdaki içerikle oluştur
- [x] **Step 2:** Test et:
  ```bash
  curl -X POST http://localhost:3000/api/webhook/n8n \
    -H "Content-Type: application/json" \
    -d '{"promptId":"test-1","imageUrl":"https://example.com/image.png","status":"completed"}'
  ```
  **Expected:** `{ "success": true }`

### Task 1.4: Prompt Status Endpoint (`src/app/api/prompts/[id]/route.ts`)

**Hedef:** Frontend'in polling yaparak görsel durumunu kontrol etmesini sağlamak.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getResponse } from "@/lib/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = getResponse(id);

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Prompt not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        promptId: data.promptId,
        status: data.status,
        imageUrl: data.imageUrl,
        error: data.error,
      },
    });
  } catch (error) {
    console.error("Get prompt error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
```

**Adımlar:**
- [x] **Step 1:** `src/app/api/prompts/[id]/route.ts` dosyasını yukarıdaki içerikle oluştur
- [x] **Step 2:** Önce Task 1.3'teki webhook'u çağır, sonra test et:
  ```bash
  curl http://localhost:3000/api/prompts/test-1
  ```
  **Expected:** `{ "success": true, "data": { "promptId": "test-1", "status": "completed", "imageUrl": "..." } }`

---

## Phase 2: Builder Güncellemeleri

**Hedef:** Builder'daki generate mantığını n8n webhook akışına uygun hale getirmek.

**Files:**
- Modify: `src/app/builder/page.tsx`
- Modify: `src/lib/data.ts` (opsiyonel — GeneratedPrompt tipine status eklemek)

### Task 2.1: GeneratedPrompt Tipine Status Ekleme (`src/lib/data.ts`)

```typescript
export type GeneratedPrompt = {
  id: string;
  category: string;
  selections: Record<string, string>;
  jsonPrompt: object;
  finalPrompt: string;
  generatedImageUrl?: string;
  status?: "pending" | "completed" | "failed";
  createdAt: string;
};
```

**Adımlar:**
- [x] **Step 1:** `src/lib/data.ts`'te `GeneratedPrompt` tipine `status?: "pending" | "completed" | "failed"` alanını ekle

### Task 2.2: Builder HandleGenerate Güncelleme

Mevcut `handleGenerate` fonksiyonu şunları yapacak:
1. `promptId` oluştur (`prompt-${Date.now()}`)
2. JSON payload oluştur (`jsonPrompt` zaten var)
3. `/api/generate-image`'e POST at
4. localStorage'a kaydet (`status: "pending"`)
5. Dashboard'a yönlendir

**Değişiklikler:**

```typescript
const handleGenerate = async () => {
  const isDirect = builderMode === "direct";
  if (isDirect && !directPrompt.trim()) return;
  if (!isDirect && !selectedCategory) return;

  setGenerating(true);
  setGenerateError(null);

  const promptId = `prompt-${Date.now()}`;
  const actualPrompt = isDirect ? directPrompt.trim() : finalPrompt;

  const newPrompt: GeneratedPrompt = {
    id: promptId,
    category: isDirect 
      ? "Custom Prompt" 
      : (promptCategories.find((c) => c.id === selectedCategory)?.title || selectedCategory || "Unknown"),
    selections: isDirect ? {} : { ...selections },
    jsonPrompt: isDirect 
      ? { type: "direct", prompt: actualPrompt } 
      : { ...jsonPrompt },
    finalPrompt: actualPrompt,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  // Save to localStorage immediately
  const existing = JSON.parse(localStorage.getItem("infulgen_prompts") || "[]");
  existing.unshift(newPrompt);
  localStorage.setItem("infulgen_prompts", JSON.stringify(existing));

  try {
    const res = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        promptId,
        category: newPrompt.category,
        selections: newPrompt.selections,
        jsonPrompt: newPrompt.jsonPrompt,
        finalPrompt: actualPrompt,
      }),
    });
    const data = await res.json();

    if (!data.success) {
      // Update status to failed in localStorage
      const updated = JSON.parse(localStorage.getItem("infulgen_prompts") || "[]");
      const idx = updated.findIndex((p: GeneratedPrompt) => p.id === promptId);
      if (idx !== -1) {
        updated[idx].status = "failed";
        localStorage.setItem("infulgen_prompts", JSON.stringify(updated));
      }
      setGenerateError(data.error || "Failed to start generation.");
    }
  } catch {
    setGenerateError("Could not connect to generation service.");
  }

  setGenerating(false);
  router.push("/dashboard");
};
```

**Adımlar:**
- [x] **Step 1:** `src/app/builder/page.tsx`'te `handleGenerate` fonksiyonunu yukarıdaki gibi güncelle
- [x] **Step 2:** Builder'da bir prompt oluştur ve Generate butonuna bas
- [x] **Step 3:** Network tab'inde `/api/generate-image`'e giden isteği ve yanıtı kontrol et
- [x] **Step 4:** Dashboard'a yönlendirildiğini doğrula

---

## Phase 3: Dashboard Polling

**Hedef:** Dashboard'da pending durumundaki prompt'ları periyodik olarak kontrol edip, n8n'den gelen görsel URL'sini almak ve göstermek.

**Files:**
- Modify: `src/app/dashboard/page.tsx`

### Task 3.1: Polling Hook Ekleme

Dashboard'a bir `useEffect` ekleyerek, `status === "pending"` olan prompt'ları her 5 saniyede bir `/api/prompts/${id}` endpoint'ine sorgulayacak.

**Değişiklikler:**

```typescript
// Dashboard page.tsx içine eklenecek
useEffect(() => {
  const pendingPrompts = prompts.filter((p) => p.status === "pending");
  if (pendingPrompts.length === 0) return;

  const interval = setInterval(async () => {
    const stored: GeneratedPrompt[] = JSON.parse(localStorage.getItem("infulgen_prompts") || "[]");
    let hasUpdate = false;

    for (const prompt of pendingPrompts) {
      try {
        const res = await fetch(`/api/prompts/${prompt.id}`);
        const data = await res.json();

        if (data.success && data.data) {
          const idx = stored.findIndex((p) => p.id === prompt.id);
          if (idx !== -1) {
            if (data.data.status === "completed" && data.data.imageUrl) {
              stored[idx].generatedImageUrl = data.data.imageUrl;
              stored[idx].status = "completed";
              hasUpdate = true;
            } else if (data.data.status === "failed") {
              stored[idx].status = "failed";
              hasUpdate = true;
            }
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }

    if (hasUpdate) {
      localStorage.setItem("infulgen_prompts", JSON.stringify(stored));
      setPrompts(stored);
      if (selectedPrompt && stored.find((p) => p.id === selectedPrompt.id)?.generatedImageUrl) {
        setSelectedPrompt(stored.find((p) => p.id === selectedPrompt.id) || null);
      }
    }
  }, 5000);

  return () => clearInterval(interval);
}, [prompts, selectedPrompt]);
```

### Task 3.2: UI Durum Göstergeleri

Dashboard'da pending/failed durumları için göstergeler ekle:

1. **History panelinde:** Pending prompt'ların yanında loading spinner göster
2. **Preview panelinde:** 
   - Pending: "Generating your visual..." mesajı + spinner
   - Failed: "Generation failed." mesajı + retry butonu (opsiyonel)

**Preview paneli değişikliği (mevcut "Awaiting Generation" yerine):**

```tsx
{imageUrl ? (
  // Mevcut görsel gösterimi
) : selectedPrompt?.status === "pending" ? (
  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
    <div className="w-10 h-10 border-2 border-[#03e65b] border-t-transparent rounded-full animate-spin mb-4" />
    <h4 className="text-white font-medium text-lg mb-2">Generating...</h4>
    <p className="text-sm text-[#777777] max-w-[250px]">
      Your visual is being crafted. This may take a few moments.
    </p>
  </div>
) : selectedPrompt?.status === "failed" ? (
  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
    <svg className="w-10 h-10 text-[#ff5d4b] mb-4" ... />
    <h4 className="text-white font-medium text-lg mb-2">Generation Failed</h4>
    <p className="text-sm text-[#777777] max-w-[250px]">
      Something went wrong. Please try again.
    </p>
  </div>
) : (
  // Mevcut "Awaiting Generation" placeholder
)}
```

**Adımlar:**
- [x] **Step 1:** Dashboard `useEffect` içine polling mekanizmasını ekle
- [x] **Step 2:** Preview paneline pending/failed durumlarını ekle
- [x] **Step 3:** Test akışı:
  1. Builder'da yeni prompt oluştur
  2. Dashboard'a yönlendir
  3. "Generating..." mesajının göründüğünü doğrula
  4. Terminal'den manuel webhook simüle et:
     ```bash
     curl -X POST http://localhost:3000/api/webhook/n8n \
       -H "Content-Type: application/json" \
       -d '{"promptId":"PROMPT_ID_BURAYA","imageUrl":"https://via.placeholder.com/512","status":"completed"}'
     ```
  5. Dashboard'un 5 saniye içinde görseli gösterdiğini doğrula

---

## Phase 4: Hata Yönetimi ve UI Polish

**Hedef:** Edge case'leri handle etmek ve kullanıcı deneyimini iyileştirmek.

### Task 4.1: Builder Hata Durumları

1. **n8n webhook URL tanımlı değilse:** Builder'da "Generation service is not configured." hatası göster
2. **Network hatası:** "Could not connect to generation service. Please check your connection."
3. **n8n 500 dönerse:** "The generation service is temporarily unavailable. Please try again later."

### Task 4.2: Dashboard Hata Durumları

1. **Polling sırasında network hatası:** Sessizce yeniden dene (exponential backoff önerilir ama MVP için sabit 5s yeterli)
2. **Prompt store'da bulunamazsa:** "This generation is no longer being tracked." mesajı

### Task 4.3: Loading State'ler

1. **Builder:** Generate butonu loading sırasında disabled + "Sending to n8n..." metni
2. **Dashboard:** History panelinde pending item'ların yanında küçük bir pulsing dot veya spinner

**History paneli değişikliği:**

```tsx
{prompt.generatedImageUrl ? (
  // Mevcut thumbnail
) : prompt.status === "pending" ? (
  <div className="w-10 h-10 rounded-lg flex-shrink-0 border border-[#03e65b]/30 flex items-center justify-center bg-[#03e65b]/5">
    <div className="w-4 h-4 border-2 border-[#03e65b] border-t-transparent rounded-full animate-spin" />
  </div>
) : (
  // Mevcut placeholder
)}
```

### Task 4.4: Cleanup

1. **Store cleanup:** In-memory store çok büyümesin. 24 saatten eski kayıtları temizleme mekanizması ekle (opsiyonel)
2. **Interval cleanup:** Dashboard unmount olduğunda polling interval'ı temizlendiğinden emin ol (zaten `useEffect` return'unda `clearInterval` var)

---

## Phase 5: Dokümantasyon

**Hedef:** README.md'yi güncelleyerek projeyi yeni bir geliştiricinin anlayabileceği şekilde detaylandırmak.

**Files:**
- Modify: `README.md`

### İçerik Yapısı

1. **Proje Tanımı:** InfluGen nedir? Ne yapar?
2. **Teknik Altyapı:** Next.js 16, React 19, Tailwind CSS v4, Framer Motion, n8n Webhook
3. **Mimari Diyagram:** Webhook akışı
4. **Kurulum:**
   - `npm install`
   - `.env.local` oluşturma
   - `npm run dev`
5. **Ortam Değişkenleri:** `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET`, `APP_URL`
6. **n8n Workflow Yapılandırması:** n8n tarafında beklenen input/output formatları
7. **Dosya Yapısı:** Kısa özet
8. **Özellikler:**
   - 22+ prompt kategorisi
   - 30-50+ section her kategoride
   - JSON formatında structured prompt export
   - n8n webhook entegrasyonu
   - Dashboard geçmiş yönetimi
   - Asenkron görsel üretim akışı
9. **Deploy Talimatları:** Vercel, Railway, Render vb.
10. **Katılım:** Katkıda bulunma kuralları

---

## Self-Review Checklist

### 1. Spec Coverage

| Gereksinim | İlgili Faz |
|---|---|
| Image generation API kullanılmayacak | Phase 1 (API route güncellemesi) |
| n8n webhook'a POST atılacak | Phase 1 (Task 1.2) |
| Seçimler JSON formatına dönüştürülecek | Phase 2 (Task 2.2) |
| n8n'den gelen webhook ile URL alınacak | Phase 1 (Task 1.3) |
| URL uygulamada gösterilecek | Phase 3 (Dashboard polling) |
| Pending/loading durumları gösterilecek | Phase 3, Phase 4 |

### 2. Placeholder Scan

- ✅ TBD/TODO yok
- ✅ Tüm adımlar somut
- ✅ Tüm kod blokları tam
- ✅ Tüm dosya yolları exact

### 3. Type Consistency

- ✅ `GeneratedPrompt` tipi `status` alanı ile güncellendi
- ✅ `WebhookResponse` tipi `promptId`, `imageUrl`, `status` alanlarını içeriyor
- ✅ Store fonksiyonları (`createPending`, `setResponse`, `getResponse`) tutarlı
- ✅ API route'ları aynı `promptId` formatını kullanıyor

---

## Execution Options

Plan tamamlandı. İki uygulama yaklaşımı var:

**1. Adım Adım Uygulama (Önerilen)** — Her fazı sırayla implemente et, her faz sonrası test et.

**2. Toplu Uygulama** — Tüm fazları tek seferde implemente et, sonunda test et.

> **Öneri:** Phase 0 ve Phase 1'i önce uygulayın, ardından Phase 2 ve Phase 3'ü ekleyin. Phase 4 UI polish'i en son yapın.

### n8n Tarafı Beklentileri

Bu planın çalışması için n8n workflow'unda şunların olması gerekir:

1. **Webhook Trigger:** `POST` metodu ile çalışan bir webhook node
2. **Input Parsing:** Gelen JSON'dan `promptId`, `category`, `selections`, `finalPrompt`, `callbackUrl` alanlarını okuma
3. **Image Generation:** Midjourney, Stable Diffusion, DALL-E vb. ile görsel üretim
4. **Image Upload:** Üretilen görseli bir CDN'e (S3, Cloudinary, Imgur vb.) yükleme ve public URL alma
5. **HTTP Request (Callback):** `callbackUrl`'e `POST` atma:
   ```json
   {
     "promptId": "{{ $json.promptId }}",
     "imageUrl": "{{ $json.imageUrl }}",
     "status": "completed"
   }
   ```
6. **Error Handling:** Hata durumunda da callback yapma:
   ```json
   {
     "promptId": "{{ $json.promptId }}",
     "status": "failed",
     "error": "{{ $json.error }}"
   }
   ```

### Production Notları

- **In-memory store** (`src/lib/store.ts`) development için yeterlidir ancak production'da **Redis**, **Supabase**, **PostgreSQL** veya benzeri bir persistence katmanı kullanılmalıdır. In-memory store sunucu restart edildiğinde veya multi-instance deployment'da veri kaybına yol açar.
- **Webhook Secret:** `N8N_WEBHOOK_SECRET` kullanımı opsiyoneldir ancak production'da **zorunlu** olmalıdır.
- **Polling sıklığı:** 5 saniye development için uygundur. Production'da WebSocket veya Server-Sent Events (SSE) düşünülebilir.
- **Static Export:** Kaldırıldı. Deploy ederken Node.js runtime gerektiren bir platform (Vercel, Railway, Render, DigitalOcean App Platform) seçilmelidir.
