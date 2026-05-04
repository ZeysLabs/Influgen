"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  promptCategories,
  promptSections,
  globalTechnicalSections,
  GeneratedPrompt,
} from "@/lib/data";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Copy,
  X,
  Sparkles,
  PenLine,
  Check,
  Camera,
  ArrowUp,
  Film,
  Aperture,
  Palette,
  Plus,
  Undo2,
} from "lucide-react";

/* ── Category groups for filter pills ── */
const categoryGroups: Record<string, string[]> = {
  all: promptCategories.map((c) => c.id),
  people: ["fashion", "portrait", "beauty", "fitness", "lifestyle", "character"],
  environment: ["landscape", "interior", "architecture", "travel", "food-drink"],
  style: ["cinematic", "luxury", "jewelry", "automotive", "concept-art"],
  platform: ["product", "social-media", "e-commerce", "brand-campaign"],
  commercial: ["product", "e-commerce", "brand-campaign", "food-drink", "automotive"],
  art: ["cinematic", "concept-art", "character", "luxury", "jewelry"],
};

const groupLabels: Record<string, string> = {
  all: "All",
  people: "People",
  environment: "Environment",
  style: "Style",
  platform: "Platform",
  commercial: "Commercial",
  art: "Art",
};

const groupOrder = ["all", "people", "environment", "style", "platform", "commercial", "art"];

/* ── Emoji map for category icons ── */
const catEmoji: Record<string, string> = {
  fashion: "👗",
  portrait: "🎭",
  product: "📦",
  interior: "🏠",
  landscape: "🏔️",
  lifestyle: "☀️",
  beauty: "✨",
  cinematic: "🎬",
  "social-media": "📱",
  "food-drink": "🍽️",
  architecture: "🏛️",
  fitness: "🏋️",
  travel: "✈️",
  automotive: "🚗",
  jewelry: "💎",
  luxury: "👜",
  character: "🧙",
  "concept-art": "🎨",
  event: "🎉",
  "brand-campaign": "📢",
  "e-commerce": "🛒",
  pet: "🐕",
};

/* ── Category group names for display ── */
const categoryDisplayGroups: { label: string; ids: string[] }[] = [
  {
    label: "People & Character",
    ids: ["portrait", "fashion", "beauty", "fitness", "lifestyle", "character", "pet"],
  },
  {
    label: "Environment & Space",
    ids: ["landscape", "interior", "architecture", "travel", "food-drink"],
  },
  {
    label: "Visual Style",
    ids: ["cinematic", "luxury", "jewelry", "automotive", "concept-art", "event"],
  },
  {
    label: "Platform & Commerce",
    ids: ["product", "social-media", "e-commerce", "brand-campaign"],
  },
];

/* ── Accent color map ── */
const accentMap: Record<string, string> = {
  green: "#03e65b",
  violet: "#6e60ee",
  yellow: "#ffc533",
  crimson: "#ff3386",
  red: "#ff5d4b",
};

/* ─── Page ─── */
export default function BuilderPage() {
  const router = useRouter();

  /* Views */
  const [view, setView] = useState<"categories" | "builder" | "direct">("categories");

  /* Category selection */
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  /* Builder state */
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  /* Direct prompt */
  const [directPrompt, setDirectPrompt] = useState("");

  /* Write prompt helper states (must be at top level, not inside conditional) */
  const [activeTagTab, setActiveTagTab] = useState<"lighting" | "mood" | "camera" | "style" | "color">("lighting");
  const [helperBlocks, setHelperBlocks] = useState<Record<string, boolean>>({
    tags: true,
    templates: true,
    recent: true,
  });

  /* Refs */
  const attrMainRef = useRef<HTMLDivElement>(null);

  /* ── Derived data ── */
  const sections = useMemo(() => {
    if (!selectedCategory) return [];
    return [...(promptSections[selectedCategory] || []), ...globalTechnicalSections];
  }, [selectedCategory]);

  const totalSelected = useMemo(() => {
    return Object.values(selections).reduce((a, v) => a + (v?.length || 0), 0);
  }, [selections]);

  const sectionsDone = useMemo(() => {
    return Object.keys(selections).filter((k) => selections[k]?.length > 0).length;
  }, [selections]);

  const progressPct = useMemo(() => {
    if (sections.length === 0) return 0;
    return Math.round((sectionsDone / sections.length) * 100);
  }, [sectionsDone, sections.length]);

  const finalPrompt = useMemo(() => {
    if (!selectedCategory || totalSelected === 0) return "";
    const catTitle = promptCategories.find((c) => c.id === selectedCategory)?.title || selectedCategory;
    const parts: string[] = [];
    sections.forEach((sec) => {
      const vals = selections[sec.id];
      if (vals && vals.length > 0) parts.push(vals.join(", "));
    });
    return `${catTitle} visual — ${parts.join(", ")}.`;
  }, [selectedCategory, selections, sections, totalSelected]);

  /* ── Scroll spy for section nav ── */
  useEffect(() => {
    if (view !== "builder") return;
    const main = attrMainRef.current;
    if (!main) return;

    const onScroll = () => {
      let currentId = sections[0]?.id;
      for (const sec of sections) {
        const el = document.getElementById(`sec-${sec.id}`);
        if (el && el.getBoundingClientRect().top < 240) {
          currentId = sec.id;
        }
      }
      setActiveSectionId(currentId);
    };
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, [view, sections]);

  /* ── Handlers ── */
  const openBuilder = (catId: string) => {
    setSelectedCategory(catId);
    setSelections({});
    setCollapsedSections({});
    setGenerateError(null);
    setView("builder");
    setActiveSectionId(null);
  };

  const goBack = () => {
    setView("categories");
    setSelectedCategory(null);
    setSelections({});
    setGenerateError(null);
  };

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleOpt = (secId: string, val: string) => {
    setSelections((prev) => {
      const arr = prev[secId] ? [...prev[secId]] : [];
      const idx = arr.indexOf(val);
      if (idx === -1) {
        arr.push(val);
      } else {
        arr.splice(idx, 1);
      }
      const next = { ...prev, [secId]: arr };
      if (arr.length === 0) delete next[secId];
      return next;
    });
  };

  const removeChip = (secId: string, val: string) => {
    toggleOpt(secId, val);
  };

  const clearAll = () => {
    setSelections({});
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`sec-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSectionId(id);
    }
  };

  const copyPrompt = () => {
    if (!finalPrompt) return;
    navigator.clipboard.writeText(finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  /* ── Generate handler (from original) ── */
  const handleGenerate = async () => {
    const isDirect = view === "direct";
    if (isDirect && !directPrompt.trim()) return;
    if (!isDirect && !selectedCategory) return;

    setGenerating(true);
    setGenerateError(null);

    const promptId = `prompt-${Date.now()}`;
    const actualPrompt = isDirect ? directPrompt.trim() : finalPrompt;
    const catTitle = isDirect
      ? "Custom Prompt"
      : promptCategories.find((c) => c.id === selectedCategory)?.title || selectedCategory || "Unknown";

    // Build selections for storage (first value per section for compatibility)
    const flatSelections: Record<string, string> = {};
    if (!isDirect) {
      Object.entries(selections).forEach(([k, vals]) => {
        if (vals.length > 0) flatSelections[k] = vals.join(", ");
      });
    }

    const newPrompt: GeneratedPrompt = {
      id: promptId,
      category: catTitle,
      selections: isDirect ? {} : flatSelections,
      jsonPrompt: isDirect
        ? { type: "direct", prompt: actualPrompt }
        : { category: selectedCategory, ...flatSelections },
      finalPrompt: actualPrompt,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

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

  /* ── Filtered categories ── */
  const filteredCategories = useMemo(() => {
    let cats = [...promptCategories];
    if (activeFilter !== "all") {
      const allowed = categoryGroups[activeFilter] || [];
      cats = cats.filter((c) => allowed.includes(c.id));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      cats = cats.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    return cats;
  }, [activeFilter, searchQuery]);

  /* ── Render helpers ── */
  const isSectionDone = (secId: string) =>
    (selections[secId]?.length || 0) > 0;

  /* ═══════════════════════════════════════════
     VIEW: CATEGORIES
  ═══════════════════════════════════════════ */
  if (view === "categories") {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-black pt-24 pb-16 px-6">
          <div className="max-w-[960px] mx-auto">
            {/* Header */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-[26px] font-bold text-white mb-1.5">
                Prompt Builder
              </h1>
              <p className="text-[13.5px] text-[#888888]">
                Choose a category and select attributes to generate a structured prompt.
              </p>
            </motion.div>

            {/* Tab bar */}
            <motion.div
              className="flex gap-1 bg-[#111111] border border-white/[0.07] rounded-xl p-1 w-fit mb-7"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <button
                onClick={() => setView("categories")}
                className="px-5 py-[7px] rounded-lg text-[13px] font-medium bg-[#1e1e1e] text-white transition-all"
              >
                Browse Categories
              </button>
              <button
                onClick={() => setView("direct")}
                className="px-5 py-[7px] rounded-lg text-[13px] font-medium text-[#888888] hover:text-white transition-all"
              >
                Write Prompt
              </button>
            </motion.div>

            {/* Search */}
            <motion.div
              className="relative mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories…"
                className="w-full bg-[#111111] border border-white/[0.07] rounded-lg py-2.5 pl-10 pr-4 text-[13.5px] text-white placeholder-[#555555] outline-none focus:border-white/20 transition-colors"
              />
            </motion.div>

            {/* Filter pills */}
            <motion.div
              className="flex gap-1.5 flex-wrap mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {groupOrder.map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`px-3.5 py-[5px] rounded-full text-[12px] border transition-all ${
                    activeFilter === key
                      ? "bg-[#171717] border-white/[0.14] text-white"
                      : "border-white/[0.07] text-[#888888] hover:border-white/[0.14] hover:text-white"
                  }`}
                >
                  {groupLabels[key]}
                </button>
              ))}
            </motion.div>

            {/* Category groups */}
            <AnimatePresence mode="wait">
              {categoryDisplayGroups.map((group) => {
                const groupCats = group.ids
                  .map((id) => filteredCategories.find((c) => c.id === id))
                  .filter(Boolean);
                if (groupCats.length === 0) return null;

                return (
                  <motion.div
                    key={group.label}
                    className="mb-7"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="text-[10.5px] uppercase tracking-[0.1em] text-[#555555] font-medium mb-2.5 pl-0.5">
                      {group.label}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {groupCats.map((cat) => {
                        const secCount = promptSections[cat!.id]?.length || 0;
                        const accent = accentMap[cat!.accent || "green"];
                        return (
                          <motion.button
                            key={cat!.id}
                            onClick={() => openBuilder(cat!.id)}
                            className="flex items-center gap-3.5 bg-[#111111] border border-white/[0.07] rounded-[14px] px-4 py-3.5 text-left transition-all hover:bg-[#171717] hover:border-white/[0.14] active:scale-[0.99]"
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                              style={{ background: `${accent}15` }}
                            >
                              <span>{catEmoji[cat!.id] || "✨"}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[14px] font-medium text-white mb-0.5">
                                {cat!.title}
                              </div>
                              <div className="text-[12px] text-[#888888] truncate">
                                {cat!.description}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span className="text-[10.5px] text-[#555555] bg-[#1e1e1e] border border-white/[0.07] px-2 py-0.5 rounded-full whitespace-nowrap">
                                {secCount} sections
                              </span>
                              <ChevronRight className="w-3 h-3 text-[#555555]" />
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredCategories.length === 0 && (
              <div className="text-center py-16">
                <p className="text-[#555555] text-sm">No categories found.</p>
              </div>
            )}
          </div>
        </main>
      </>
    );
  }

  /* ═══════════════════════════════════════════
     VIEW: WRITE PROMPT (from WRITE_PROMPT.html)
  ═══════════════════════════════════════════ */
  if (view === "direct") {
    const charCount = directPrompt.length;
    const isReady = charCount > 0;

    const quickTools = [
      { label: "Realistic", text: "photorealistic, ", icon: <Camera className="w-3 h-3" /> },
      { label: "Quality", text: "8K ultra-detailed, ", icon: <ArrowUp className="w-3 h-3" /> },
      { label: "Film grain", text: "film grain, ", icon: <Film className="w-3 h-3" /> },
      { label: "Shallow DOF", text: "shallow depth of field, ", icon: <Aperture className="w-3 h-3" /> },
      { label: "Cinematic grade", text: "cinematic color grade, ", icon: <Palette className="w-3 h-3" /> },
    ];

    const suggChips = [
      "golden hour lighting",
      "shallow depth of field",
      "film grain",
      "cinematic color grade",
      "35mm analog",
      "dramatic shadows",
      "editorial lighting",
      "soft bokeh",
      "hyperrealistic",
      "award-winning photography",
    ];

    const tagTabs = ["lighting", "mood", "camera", "style", "color"] as const;
    const tagData: Record<string, string[]> = {
      lighting: ["natural light", "golden hour", "studio strobe", "rembrandt", "split light", "soft box", "backlit", "rim light", "neon glow", "candlelight", "overcast", "blue hour"],
      mood: ["editorial", "intimate", "dramatic", "ethereal", "melancholic", "nostalgic", "playful", "mysterious", "empowering", "raw", "luxurious", "serene"],
      camera: ["85mm", "35mm", "50mm", "telephoto", "wide angle", "macro", "fisheye", "tilt-shift", "anamorphic", "drone aerial", "handheld"],
      style: ["photorealistic", "hyperrealistic", "film grain", "analog", "high fashion", "documentary", "minimalist", "maximalist", "street", "fine art"],
      color: ["warm tones", "cool tones", "desaturated", "vibrant", "monochrome", "muted pastel", "earth tones", "jewel tones", "duotone", "cross-processed"],
    };

    const templates = [
      { title: "Editorial Portrait", text: "A cinematic portrait of a woman in soft natural window light, 85mm lens, shallow depth of field, film grain, warm tone, editorial mood", tag: "Portrait" },
      { title: "Street Fashion", text: "Urban street photography, male subject in streetwear, golden hour backlight, 35mm analog film, gritty texture, candid moment, high contrast", tag: "Fashion" },
      { title: "Product Flat Lay", text: "Luxury product shot, minimalist flat lay, soft diffused light, white marble surface, ultra-detailed, e-commerce photography, 8K quality", tag: "Product" },
      { title: "Epic Landscape", text: "Dramatic cinematic landscape, golden hour, sweeping mountain vista, anamorphic lens flare, desaturated earth tones, atmospheric haze, award-winning photography", tag: "Landscape" },
    ];

    const recents = [
      "Beauty macro shot, close-up glam makeup, shimmering highlight, studio ring light, warm skin tones, ultra-sharp",
      "Fitness athlete, dynamic pose, outdoor gym, late afternoon sun, motion blur, high energy, sportswear, 8K photorealistic",
      "Minimal interior, Scandinavian style, morning diffused light, neutral palette, architectural photography, wide angle",
    ];

    const appendText = (text: string) => {
      setDirectPrompt((prev) => {
        const trimmed = prev.trim();
        if (!trimmed) return text;
        return trimmed + (trimmed.endsWith(",") || trimmed.endsWith(" ") ? "" : ", ") + text;
      });
    };

    const enhancePrompt = () => {
      if (!directPrompt.trim()) return;
      const extras = [
        ", photorealistic, ultra-detailed, professional photography, award-winning",
        ", cinematic lighting, shallow depth of field, 8K quality, editorial",
        ", film grain, atmospheric haze, hyperrealistic, moody color grade",
      ];
      setDirectPrompt((prev) => prev + extras[Math.floor(Math.random() * extras.length)]);
    };

    const clearEditor = () => setDirectPrompt("");
    const useTemplate = (text: string) => setDirectPrompt(text);

    return (
      <>
        <Header />
        <main className="min-h-screen bg-black pt-16 flex flex-col" style={{ height: "100vh" }}>
          {/* ── Topbar ── */}
          <div className="flex items-center gap-4 px-6 py-2.5 border-b border-white/[0.07] bg-black flex-shrink-0">
            <button
              onClick={() => setView("categories")}
              className="flex items-center gap-1.5 text-[13px] text-[#888888] hover:text-white hover:bg-[#111111] px-2.5 py-1 rounded-md transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <div className="w-px h-[18px] bg-white/[0.07]" />
            <div className="text-[14px] font-semibold text-white">Write Prompt</div>
            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={clearEditor}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/[0.07] text-[12.5px] text-[#888888] hover:text-white hover:bg-[#111111] transition-all"
              >
                Clear
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(directPrompt); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/[0.07] text-[12.5px] text-[#888888] hover:text-white hover:bg-[#111111] transition-all"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
              <button
                onClick={handleGenerate}
                disabled={!isReady || generating}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#03e65b] text-black text-[12.5px] font-semibold hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {generating ? "Sending…" : "Generate Image"}
              </button>
            </div>
          </div>

          {/* ── 2-column body ── */}
          <div className="flex flex-1 overflow-hidden">
            {/* LEFT: Editor canvas */}
            <div className="flex flex-col flex-1 overflow-hidden border-r border-white/[0.07]">
              {/* Toolbar */}
              <div className="flex items-center gap-1 px-5 h-11 border-b border-white/[0.07] flex-shrink-0 bg-white/[0.015]">
                {quickTools.map((tool) => (
                  <button
                    key={tool.label}
                    onClick={() => appendText(tool.text)}
                    className="flex items-center gap-1 px-2.5 py-[5px] rounded-md text-[12px] text-[#888888] hover:text-white hover:bg-[#111111] transition-all whitespace-nowrap"
                  >
                    {tool.icon}
                    {tool.label}
                  </button>
                ))}
                <div className="w-px h-[18px] bg-white/[0.07] mx-1.5" />
                <button
                  onClick={clearEditor}
                  className="flex items-center gap-1 px-2.5 py-[5px] rounded-md text-[12px] text-[#888888] hover:text-white hover:bg-[#111111] transition-all"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
                <span className={`ml-auto font-mono text-[11px] ${charCount > 400 ? "text-[#ffc533]" : "text-[#555555]"}`}>
                  {charCount} / 500
                </span>
              </div>

              {/* Writing canvas */}
              <div className="flex-1 relative overflow-hidden flex flex-col">
                <textarea
                  value={directPrompt}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v.length <= 500) setDirectPrompt(v);
                  }}
                  placeholder="A cinematic portrait of a woman in a black coat, soft natural light, editorial photography, 85mm lens, shallow depth of field…"
                  spellCheck={false}
                  className="flex-1 bg-transparent border-none outline-none resize-none px-8 py-7 text-[15px] text-white placeholder-[#555555] leading-[1.8] caret-[#03e65b]"
                />
              </div>

              {/* Quick-add strip */}
              <div className="flex items-center gap-[7px] px-5 py-2 border-t border-white/[0.07] flex-shrink-0 overflow-x-auto bg-white/[0.01] custom-scrollbar-x">
                <span className="text-[11px] text-[#555555] whitespace-nowrap flex-shrink-0">Add →</span>
                {suggChips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => appendText(chip + ", ")}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/[0.07] bg-[#111111] text-[11.5px] text-[#888888] hover:text-white hover:bg-[#171717] hover:border-white/[0.14] transition-all whitespace-nowrap flex-shrink-0"
                  >
                    <Plus className="w-2.5 h-2.5 text-[#555555]" />
                    {chip}
                  </button>
                ))}
              </div>

              {/* Status bar */}
              <div className="flex items-center gap-4 px-5 h-8 border-t border-white/[0.07] flex-shrink-0 bg-black">
                <div className="flex items-center gap-1.5 text-[11px] text-[#555555]">
                  <span className={`w-[5px] h-[5px] rounded-full ${isReady ? "bg-[#03e65b]" : "bg-[#555555]"}`} />
                  <span>{isReady ? "Ready to generate" : "Ready to write"}</span>
                </div>
                <div className="ml-auto text-[11px] text-[#555555]">
                  Mode: <strong className="text-[#888888] ml-1">Free text</strong>
                </div>
              </div>
            </div>

            {/* RIGHT: Helper panel */}
            <div className="hidden lg:flex flex-col w-[296px] overflow-y-auto custom-scrollbar">
              {/* Quick Tags */}
              <div className="border-b border-white/[0.07]">
                <button
                  onClick={() => setHelperBlocks((p) => ({ ...p, tags: !p.tags }))}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-[10.5px] uppercase tracking-[0.08em] text-[#555555] font-medium">Quick Tags</span>
                  <ChevronDown className={`w-3 h-3 text-[#555555] transition-transform ${helperBlocks.tags ? "" : "-rotate-90"}`} />
                </button>
                {helperBlocks.tags && (
                  <div className="px-4 pb-3.5">
                    <div className="flex gap-1 flex-wrap mb-2.5">
                      {tagTabs.map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTagTab(tab)}
                          className={`px-2.5 py-1 rounded-full text-[11px] border transition-all capitalize ${
                            activeTagTab === tab
                              ? "bg-[#171717] border-white/[0.14] text-white"
                              : "border-white/[0.07] text-[#888888] hover:text-white hover:border-white/[0.14]"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-[5px]">
                      {tagData[activeTagTab].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => appendText(tag + ", ")}
                          className="px-2.5 py-1 rounded-md border border-white/[0.07] bg-[#171717] text-[11.5px] text-[#888888] hover:text-white hover:bg-[#1e1e1e] hover:border-white/[0.14] transition-all"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Starter Templates */}
              <div className="border-b border-white/[0.07]">
                <button
                  onClick={() => setHelperBlocks((p) => ({ ...p, templates: !p.templates }))}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-[10.5px] uppercase tracking-[0.08em] text-[#555555] font-medium">Starter Templates</span>
                  <ChevronDown className={`w-3 h-3 text-[#555555] transition-transform ${helperBlocks.templates ? "" : "-rotate-90"}`} />
                </button>
                {helperBlocks.templates && (
                  <div className="px-4 pb-3.5">
                    {templates.map((t) => (
                      <button
                        key={t.title}
                        onClick={() => useTemplate(t.text)}
                        className="w-full text-left bg-[#171717] border border-white/[0.07] rounded-lg p-3 mb-1.5 hover:border-white/[0.14] hover:bg-[#1e1e1e] transition-all last:mb-0"
                      >
                        <div className="text-[12.5px] font-medium text-white mb-[3px]">{t.title}</div>
                        <div className="text-[11.5px] text-[#888888] leading-relaxed italic line-clamp-2">
                          {t.text}
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="inline-block text-[10px] text-[#555555] bg-[#1e1e1e] border border-white/[0.07] px-1.5 py-px rounded-full">
                            {t.tag}
                          </span>
                          <span className="text-[10.5px] text-[#03e65b]">Use →</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Prompts */}
              <div>
                <button
                  onClick={() => setHelperBlocks((p) => ({ ...p, recent: !p.recent }))}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-[10.5px] uppercase tracking-[0.08em] text-[#555555] font-medium">Recent Prompts</span>
                  <ChevronDown className={`w-3 h-3 text-[#555555] transition-transform ${helperBlocks.recent ? "" : "-rotate-90"}`} />
                </button>
                {helperBlocks.recent && (
                  <div className="px-4 pb-3.5">
                    {recents.map((text, i) => (
                      <button
                        key={i}
                        onClick={() => useTemplate(text)}
                        className="w-full text-left flex items-start gap-2 py-2 border-b border-white/[0.07] last:border-b-0 hover:bg-white/[0.02] transition-colors group"
                      >
                        <Undo2 className="w-3 h-3 text-[#555555] mt-0.5 flex-shrink-0" />
                        <span className="text-[11.5px] text-[#888888] leading-relaxed line-clamp-2 group-hover:text-white transition-colors">
                          {text}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <style jsx global>{`
          .custom-scrollbar-x::-webkit-scrollbar { display: none; }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </>
    );
  }

  /* ═══════════════════════════════════════════
     VIEW: BUILDER (3-column layout)
  ═══════════════════════════════════════════ */
  const catTitle = promptCategories.find((c) => c.id === selectedCategory)?.title || selectedCategory || "";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black pt-16 flex flex-col" style={{ height: "100vh" }}>
        {/* ── Top bar ── */}
        <div className="flex items-center gap-4 px-6 py-2.5 border-b border-white/[0.07] bg-black flex-shrink-0">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-[13px] text-[#888888] hover:text-white hover:bg-[#111111] px-2.5 py-1 rounded-md transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <div className="w-px h-[18px] bg-white/[0.07]" />
          <div className="text-[14px] font-semibold text-white">{catTitle}</div>
          <div className="ml-auto flex items-center gap-2.5 text-[12px] text-[#888888]">
            <span>
              {sectionsDone} / {sections.length} sections
            </span>
            <div className="w-[120px] h-[3px] bg-[#171717] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#03e65b] rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── 3-column body ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT: Section navigator */}
          <div className="hidden lg:flex flex-col w-[200px] border-r border-white/[0.07] overflow-y-auto py-4 px-3 custom-scrollbar">
            <div className="text-[10px] uppercase tracking-[0.1em] text-[#555555] px-2 mb-2">
              Sections
            </div>
            {sections.map((sec) => {
              const done = isSectionDone(sec.id);
              const active = activeSectionId === sec.id;
              const count = selections[sec.id]?.length || 0;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`flex items-center gap-2 px-2 py-[7px] rounded-md text-[12.5px] transition-all mb-px ${
                    active
                      ? "bg-[#171717] text-white"
                      : done
                      ? "text-[#888888] hover:bg-[#111111] hover:text-white"
                      : "text-[#888888] hover:bg-[#111111] hover:text-white"
                  }`}
                >
                  <span
                    className={`w-[6px] h-[6px] rounded-full border-[1.5px] flex-shrink-0 transition-colors ${
                      done
                        ? "bg-[#03e65b] border-[#03e65b]"
                        : active
                        ? "border-white"
                        : "border-[#555555]"
                    }`}
                  />
                  <span className="flex-1 text-left truncate">{sec.label}</span>
                  {count > 0 && (
                    <span className="text-[10px] text-[#03e65b] bg-[#03e65b]/10 rounded-full px-1.5 py-px">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* CENTER: Attribute sections */}
          <div
            ref={attrMainRef}
            className="flex-1 overflow-y-auto py-5 px-4 md:px-6 custom-scrollbar"
          >
            {sections.map((sec) => {
              const isCollapsed = collapsedSections[sec.id];
              const count = selections[sec.id]?.length || 0;
              const hasSel = count > 0;

              return (
                <motion.div
                  key={sec.id}
                  id={`sec-${sec.id}`}
                  className={`bg-[#111111] border rounded-[14px] mb-2.5 overflow-hidden transition-colors ${
                    hasSel ? "border-[#03e65b]/20" : "border-white/[0.07]"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Header */}
                  <button
                    onClick={() => toggleSection(sec.id)}
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[13.5px] font-medium text-white">
                        {sec.label}
                      </span>
                      {hasSel && (
                        <span className="text-[11px] text-[#03e65b] bg-[#03e65b]/10 px-2 py-0.5 rounded-full">
                          {count} selected
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#555555] transition-transform duration-200 ${
                        isCollapsed ? "-rotate-90" : ""
                      }`}
                    />
                  </button>

                  {/* Body */}
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-wrap gap-[7px] px-5 pb-4">
                          {sec.options.map((opt) => {
                            const isSelected = selections[sec.id]?.includes(opt);
                            return (
                              <button
                                key={opt}
                                onClick={() => toggleOpt(sec.id, opt)}
                                className={`px-3.5 py-[7px] rounded-lg text-[12.5px] border transition-all select-none ${
                                  isSelected
                                    ? "bg-[#03e65b]/10 border-[#03e65b]/25 text-[#03e65b] font-medium"
                                    : "bg-[#171717] border-white/[0.07] text-[#888888] hover:border-white/[0.14] hover:text-white hover:bg-[#1e1e1e]"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* RIGHT: Sidebar */}
          <div className="hidden md:flex flex-col w-[280px] border-l border-white/[0.07] overflow-hidden">
            {/* Top */}
            <div className="px-4 py-4 border-b border-white/[0.07] flex-shrink-0">
              <div className="text-[11px] uppercase tracking-[0.08em] text-[#555555] font-medium mb-2.5">
                Selections
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[22px] font-bold text-white leading-none">
                    {totalSelected}
                  </div>
                  <div className="text-[12px] text-[#888888] mt-0.5">
                    attributes selected
                  </div>
                </div>
                {totalSelected > 0 && (
                  <button
                    onClick={clearAll}
                    className="px-2.5 py-1 rounded-md border border-white/[0.07] text-[11.5px] text-[#888888] hover:text-white hover:border-white/[0.14] transition-all"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Chips scroll */}
            <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
              {totalSelected === 0 ? (
                <p className="text-[12.5px] text-[#555555] pt-2">
                  Select options to build your prompt.
                </p>
              ) : (
                sections.map((sec) => {
                  const vals = selections[sec.id];
                  if (!vals || vals.length === 0) return null;
                  return (
                    <div key={sec.id} className="mb-3">
                      <div className="text-[10px] text-[#555555] uppercase tracking-[0.08em] mb-1">
                        {sec.label}
                      </div>
                      <div className="flex flex-wrap gap-[5px]">
                        {vals.map((v) => (
                          <span
                            key={v}
                            className="inline-flex items-center gap-1 bg-[#171717] border border-[#03e65b]/25 rounded-md px-2 py-1 text-[11.5px] text-[#03e65b]"
                          >
                            {v}
                            <button
                              onClick={() => removeChip(sec.id, v)}
                              className="w-3.5 h-3.5 rounded-full bg-[#03e65b]/15 flex items-center justify-center hover:bg-[#03e65b]/30 transition-colors"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom: Prompt + CTA */}
            <div className="px-4 py-3.5 border-t border-white/[0.07] flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-[0.08em] text-[#555555] font-medium">
                  Generated Prompt
                </span>
                {finalPrompt && (
                  <button
                    onClick={copyPrompt}
                    className={`inline-flex items-center gap-1 px-2 py-[3px] rounded-md border text-[11px] transition-all ${
                      copied
                        ? "text-[#03e65b] border-[#03e65b]/30"
                        : "text-[#888888] border-white/[0.07] hover:text-white hover:border-white/[0.14]"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="bg-[#111111] border border-white/[0.07] rounded-lg p-3 text-[12px] text-[#888888] leading-relaxed min-h-[72px] mb-3">
                {finalPrompt ? (
                  <span className="text-[#888888]">{finalPrompt}</span>
                ) : (
                  <span className="italic text-[#555555]">
                    Select attributes to generate your prompt…
                  </span>
                )}
              </div>

              {generateError && (
                <div className="mb-3 p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
                  <p className="text-xs text-yellow-400">{generateError}</p>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={totalSelected === 0 || generating}
                className="w-full py-2.5 rounded-lg bg-[#03e65b] text-black text-[13.5px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {generating ? "Sending…" : "Generate Image"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Global scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
      `}</style>
    </>
  );
}
