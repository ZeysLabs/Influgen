# InfluGen

**InfluGen** is an AI-powered visual prompt builder and campaign management platform. It transforms creative decisions into structured JSON prompts, then delegates actual image generation to external n8n workflows via webhooks.

Rather than embedding image generation APIs directly (OpenAI, Midjourney, Stable Diffusion), InfluGen acts as a **structured prompt orchestrator**: you select visual attributes, the app builds a precise JSON payload, and an n8n workflow handles the actual generation and returns the result.

---

## What InfluGen Does

1. **Structured Prompt Building** — Choose from 22+ visual categories (Fashion, Portrait, Product, Interior, Landscape, Beauty, Cinematic, etc.) and 30–50+ attribute sections per category.

2. **JSON Export** — Every selection becomes a structured JSON object that can be consumed by any downstream system.

3. **n8n Webhook Integration** — One click sends the structured payload to an n8n workflow, which generates the image and sends the result back.

4. **Dashboard & History** — Track pending generations, view completed images, copy final prompts, and manage your creative history.

5. **Campaign Templates** — Start from curated presets for common visual styles.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19, TypeScript |
| **Styling** | Tailwind CSS v4, PostCSS |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Fonts** | Geist (Sans + Mono) via `next/font` |
| **Orchestration** | n8n Webhooks |
| **Persistence** | localStorage (client-side), In-Memory Store (server-side, development) |

---

## Architecture

```
┌─────────────┐      POST /api/generate-image       ┌──────────────┐
│   Builder   │ ───────────────────────────────────> │  Next.js API │
│   (Client)  │     { category, selections,        │   (Server)   │
│             │       finalPrompt, callbackUrl }   └──────┬───────┘
└─────────────┘                                          │
       │                                                 │ POST to n8n
       │                                                 │ with promptId
       │                                                 ▼
       │                                          ┌──────────────┐
       │                                          │  n8n Workflow │
       │                                          │  (External)   │
       │                                          └──────┬───────┘
       │                                                 │
       │                                                 │ 1. Parse JSON payload
       │                                                 │ 2. Generate image
       │                                                 │    (Midjourney/SD/etc.)
       │                                                 │ 3. Upload to CDN
       │                                                 │
       │  5. Poll: GET /api/prompts/[id]                │ 4. POST callback
       │ <────────────────────────────────────────────────│    { promptId, imageUrl }
       │                                                 │
       ▼                                                 ▼
┌─────────────┐                                    ┌──────────────┐
│  Dashboard  │                                    │  In-Memory   │
│   (Client)  │                                    │    Store     │
└─────────────┘                                    └──────────────┘
```

### Why Webhooks?

Image generation is asynchronous and can take 10–60 seconds. Instead of blocking the UI or managing complex API keys for every provider, InfluGen:

- Sends a **structured JSON payload** to n8n
- Lets n8n handle provider selection, retry logic, image upload, and error handling
- Receives the **generated image URL** back via webhook
- Displays the result in the dashboard

This makes InfluGen **provider-agnostic**: you can switch from Midjourney to Stable Diffusion to DALL-E without touching the frontend code.

---

## Project Structure

```
influgen/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Root layout (Geist font, metadata)
│   │   ├── page.tsx             # Landing page (Hero, Features, Pricing, FAQ, CTA)
│   │   ├── globals.css          # Tailwind theme + custom design tokens
│   │   ├── builder/page.tsx     # Prompt builder (22 categories, section selection)
│   │   ├── dashboard/page.tsx   # History + output preview with polling
│   │   ├── templates/page.tsx   # Curated preset templates
│   │   ├── settings/page.tsx    # User preferences (placeholder)
│   │   ├── api/
│   │   │   ├── generate-image/route.ts   # Forwards payload to n8n webhook
│   │   │   ├── webhook/n8n/route.ts      # Receives n8n callback
│   │   │   └── prompts/[id]/route.ts     # Polling endpoint for status
│   ├── components/              # React components
│   │   ├── Header.tsx           # Navigation + mobile menu
│   │   ├── AnimatedHero.tsx     # Hero with floating images + motion background
│   │   ├── FloatingImageField.tsx   # Floating image animation layer
│   │   ├── PricingSection.tsx   # Free / Pro / Agency plans
│   │   ├── FAQSection.tsx       # Accordion FAQ
│   │   └── ...
│   └── lib/
│       ├── data.ts              # Prompt categories, sections, types
│       ├── images.ts            # Hero image assets
│       └── store.ts             # In-memory webhook response store
├── public/res/                  # Image assets (logo, hero images)
├── next.config.ts               # Next.js config (SSR mode)
├── postcss.config.mjs           # Tailwind v4 PostCSS plugin
└── .env.local                   # Environment variables (not committed)
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- An n8n instance with a configured webhook workflow (see [n8n Setup](#n8n-setup))

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd influgen

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Edit .env.local with your values
# N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/influgen-generate
# N8N_WEBHOOK_SECRET=your-secret-here
# APP_URL=http://localhost:3000

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

> **Note:** This project uses **SSR mode** (not static export). API routes require a Node.js runtime. Deploy to Vercel, Railway, Render, or any platform that supports Next.js server-side rendering.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `N8N_WEBHOOK_URL` | Yes | The n8n webhook URL to trigger image generation |
| `N8N_WEBHOOK_SECRET` | No | Optional secret for webhook authentication |
| `APP_URL` | Yes | Your app's public URL (used for callback URLs) |

---

## n8n Setup

Your n8n workflow must:

1. **Receive a POST request** at the configured `N8N_WEBHOOK_URL`
2. **Parse the incoming JSON:**
   ```json
   {
     "promptId": "prompt-1714823456789",
     "category": "Fashion",
     "selections": { "subject": "Model", "gender": "Female" },
     "jsonPrompt": { "category": "Fashion", "subject": "Model" },
     "finalPrompt": "Fashion visual — subject: Model, gender: Female...",
     "callbackUrl": "https://your-app.com/api/webhook/n8n"
   }
   ```
3. **Generate an image** using your preferred provider (Midjourney, Stable Diffusion, DALL-E, etc.)
4. **Upload the image** to a CDN (S3, Cloudinary, Imgur, etc.)
5. **Send a POST callback** to `callbackUrl`:
   ```json
   {
     "promptId": "prompt-1714823456789",
     "imageUrl": "https://cdn.example.com/generated/image.png",
     "status": "completed"
   }
   ```
6. **Handle errors** by sending:
   ```json
   {
     "promptId": "prompt-1714823456789",
     "status": "failed",
     "error": "Error message"
   }
   ```

---

## Features

### Prompt Builder
- **22+ Categories:** Fashion, Portrait, Product, Interior, Landscape, Lifestyle, Beauty, Cinematic, Social Media, Food & Drink, Architecture, Fitness, Travel, Automotive, Jewelry, Luxury, Character, Concept Art, Event, Brand Campaign, E-commerce, Pet
- **30–50+ Sections per Category:** Subject, lighting, background, pose, style, era, and more
- **Global Technical Sections:** Depth of field, lighting style, film style, aspect ratio, color grading, resolution feel (applied to all categories)
- **Two Modes:** Browse categories or write a direct prompt
- **Real-time Preview:** See your final prompt update as you select attributes
- **JSON Export:** Structured JSON payload for every selection

### Dashboard
- **History Panel:** Collapsible sidebar with all generated prompts
- **Selections Detail:** View every attribute you selected
- **Final Prompt:** Copy-ready prompt text
- **Output Preview:** Generated image display with hover effects
- **Polling:** Automatically checks for completed images every 5 seconds
- **Status Indicators:** Pending (spinner), Completed (image), Failed (error state)

### Templates
- 6 curated presets: Evening Fashion Editorial, Dramatic Male Portrait, Luxury Cosmetics Product, Modern Living Room, Golden Hour Landscape, Cozy Lifestyle Morning

### Landing Page
- Animated hero with floating images and motion background
- Feature strip with key value propositions
- Video showcase sections
- Pricing tiers (Free, Pro, Agency)
- FAQ accordion
- Call-to-action section

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#000000` | Primary background |
| Subtle Surface | `#151515` | Card backgrounds |
| Elevated Surface | `#232323` | Hover states |
| Muted Ash | `#999999` | Secondary text |
| Ghostly Gray | `#e5e5e5` | Primary text |
| Luminous Green | `#03e65b` | Primary action, accents |
| Deep Violet | `#6e60ee` | Hero accent, active links |
| Electric Yellow | `#ffc533` | Secondary accent |
| Vivid Crimson | `#ff3386` | Decorative |
| Sunset Red | `#ff5d4b` | Error states |

---

## Development Notes

### Why No Static Export?

Previous versions used `output: "export"` for static hosting. This was removed because:
- API routes (`app/api/**`) are required for the n8n webhook flow
- Server-side in-memory store (or future Redis/DB) needs a running server
- Polling endpoints must be active

### Client-Side Storage

Prompt history is stored in `localStorage` under the key `infulgen_prompts`. This is a deliberate choice for the MVP:
- No user authentication required
- Instant feedback
- Works offline

For production with multi-device support, migrate to a backend database (Supabase, PostgreSQL, etc.).

### Image Assets

The `public/res/` directory contains 36 hero images and a logo. These are used in:
- Landing page floating image animation
- Template previews

Replace these with your own assets for production.

---

## License

@2026 All Rights Reserved by Zeys Labs

---

Built with [Next.js](https://nextjs.org) and [n8n](https://n8n.io).
