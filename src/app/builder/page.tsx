"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { promptCategories, promptSections, globalTechnicalSections, GeneratedPrompt } from "@/lib/data";
import Header from "@/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ChevronIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    className={`w-5 h-5 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default function BuilderPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [builderMode, setBuilderMode] = useState<"categories" | "direct">("categories");
  const [directPrompt, setDirectPrompt] = useState("");

  const sections = useMemo(() => {
    return selectedCategory ? [...(promptSections[selectedCategory] || []), ...globalTechnicalSections] : [];
  }, [selectedCategory]);

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const jsonPrompt = useMemo(() => {
    if (!selectedCategory) return {};
    return {
      category: selectedCategory,
      ...selections,
    };
  }, [selectedCategory, selections]);

  const finalPrompt = useMemo(() => {
    if (!selectedCategory) return "";
    const categoryTitle = promptCategories.find((c) => c.id === selectedCategory)?.title || selectedCategory;
    const parts = Object.entries(selections).map(([key, value]) => `${key}: ${value}`);
    return `${categoryTitle} visual — ${parts.join(", ")}.`;
  }, [selectedCategory, selections]);

  const selectedCount = Object.keys(selections).length;

  const handleSelect = (sectionId: string, option: string) => {
    setSelections((prev) => ({ ...prev, [sectionId]: option }));
  };

  const [generateError, setGenerateError] = useState<string | null>(null);

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
      category: isDirect ? "Custom Prompt" : (promptCategories.find((c) => c.id === selectedCategory)?.title || selectedCategory || "Unknown"),
      selections: isDirect ? {} : { ...selections },
      jsonPrompt: isDirect ? { type: "direct", prompt: actualPrompt } : { ...jsonPrompt },
      finalPrompt: actualPrompt,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage immediately as pending
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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Prompt Builder
          </motion.h1>
          <motion.p
            className="text-[#999999] mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Choose a category and select attributes to generate a structured prompt.
          </motion.p>

          {!selectedCategory && (
            <>
              <div className="flex bg-[#151515] p-1.5 rounded-full w-fit mb-10 border border-white/10">
                <button
                  onClick={() => setBuilderMode("categories")}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                    builderMode === "categories"
                      ? "bg-[#2a2a2a] text-white shadow-sm"
                      : "text-[#999999] hover:text-[#cccccc]"
                  }`}
                >
                  Browse Categories
                </button>
                <button
                  onClick={() => setBuilderMode("direct")}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                    builderMode === "direct"
                      ? "bg-[#2a2a2a] text-white shadow-sm"
                      : "text-[#999999] hover:text-[#cccccc]"
                  }`}
                >
                  Write Prompt
                </button>
              </div>

              {builderMode === "categories" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {promptCategories.map((cat, i) => (
                    <motion.button
                      key={cat.id}
                      className="flex flex-col text-left p-6 rounded-[24px] border border-white/5 bg-gradient-to-b from-[#1a1a1a] to-[#121212] hover:border-white/20 hover:from-[#222222] hover:to-[#181818] transition-all duration-300 group shadow-lg hover:shadow-xl hover:-translate-y-1 h-full"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      <div className="flex items-start justify-between mb-4 w-full">
                        <span className="text-white font-semibold text-lg tracking-wide">{cat.title}</span>
                        <span className="text-xs text-[#999999] bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
                          {promptSections[cat.id]?.length || 0} sections
                        </span>
                      </div>
                      <p className="text-sm text-[#888888] leading-relaxed flex-grow">{cat.description}</p>
                      
                      <div className="mt-6 flex items-center text-[#03e65b] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span>Select category</span>
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-3xl"
                >
                  <h2 className="text-xl text-white font-semibold mb-2">Write your own prompt</h2>
                  <p className="text-sm text-[#999999] mb-6">Skip categories and describe exactly what you want to generate.</p>
                  
                  <div className="bg-[#151515] border border-white/10 rounded-[24px] p-6 mb-6 focus-within:border-white/30 transition-colors">
                    <textarea
                      value={directPrompt}
                      onChange={(e) => setDirectPrompt(e.target.value)}
                      placeholder="A cinematic portrait of a woman in a black coat, soft natural light, editorial photography, 85mm lens, shallow depth of field..."
                      className="w-full h-48 bg-transparent text-white placeholder-[#555555] resize-none outline-none text-lg leading-relaxed"
                    />
                  </div>

                  <div className="bg-[#151515] border border-white/10 rounded-[24px] p-6 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-medium">Ready to generate</h3>
                    </div>
                    <p className="text-sm text-[#777777] mb-6">Your direct prompt will be used instead of category-based selections.</p>
                    
                      {generateError && (
                        <div className="mb-4 p-4 rounded-[14px] border border-yellow-500/30 bg-yellow-500/5">
                          <p className="text-sm text-yellow-400">{generateError}</p>
                        </div>
                      )}

                    <button
                        onClick={handleGenerate}
                        disabled={!directPrompt.trim() || generating}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#03e65b] text-black font-semibold text-base hover:bg-[#02cc50] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {generating ? "Sending..." : "Generate Image"}
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          )}

          {selectedCategory && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelections({});
                  }}
                  className="text-sm text-[#999999] hover:text-white transition-colors"
                >
                  ← Back to categories
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {sections.map((section) => {
                    const isCollapsed = collapsedSections[section.id];
                    return (
                      <div
                        key={`${selectedCategory}-${section.id}`}
                        className="p-5 rounded-[18px] border border-white/10 bg-[#151515] overflow-hidden"
                      >
                        <div
                          className="flex justify-between items-center cursor-pointer select-none"
                          onClick={() => toggleSection(section.id)}
                        >
                          <h3 className="text-white font-semibold">{section.label}</h3>
                          <div className="text-white/50 hover:text-white/80 transition-colors">
                            <ChevronIcon collapsed={!!isCollapsed} />
                          </div>
                        </div>
                        <AnimatePresence initial={false}>
                          {!isCollapsed && (
                            <motion.div
                              initial={{ height: 0, opacity: 0, marginTop: 0 }}
                              animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                              exit={{ height: 0, opacity: 0, marginTop: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {section.options.map((opt) => {
                                  const isSelected = selections[section.id] === opt;
                                  return (
                                    <motion.button
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      key={opt}
                                      onClick={() => handleSelect(section.id, opt)}
                                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                                        isSelected
                                          ? "bg-[#03e65b]/10 text-[#03e65b] border-[#03e65b] shadow-[0_0_15px_rgba(3,230,91,0.2)]"
                                          : "bg-transparent text-[#e5e5e5] border-white/15 hover:border-white/40 hover:bg-white/5"
                                      }`}
                                    >
                                      {opt}
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <div className="p-5 rounded-[18px] border border-white/10 bg-[#151515]">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-semibold">Selections</h3>
                      <span className="text-xs text-[#03e65b] font-medium">{selectedCount} selected</span>
                    </div>
                    {selectedCount === 0 ? (
                      <p className="text-sm text-[#999999]">Select options to build your prompt.</p>
                    ) : (
                      <ul className="space-y-2">
                        {Object.entries(selections).map(([key, value]) => (
                          <li key={key} className="text-sm text-[#e5e5e5] flex justify-between">
                            <span className="text-[#999999]">{key}</span>
                            <span>{value}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>



                  <div className="p-5 rounded-[18px] border border-white/10 bg-[#151515]">
                    <h3 className="text-white font-semibold mb-3">Final Prompt</h3>
                    <p className="text-sm text-[#e5e5e5] leading-relaxed">
                      {finalPrompt || "Your final prompt will appear here."}
                    </p>
                  </div>

                  {generateError && (
                    <div className="p-4 rounded-[14px] border border-yellow-500/30 bg-yellow-500/5">
                      <p className="text-sm text-yellow-400">{generateError}</p>
                    </div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={selectedCount === 0 || generating}
                    className="w-full py-3.5 rounded-full bg-[#03e65b] text-black font-semibold text-base hover:bg-[#02cc50] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {generating ? "Sending..." : "Generate Image"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}
