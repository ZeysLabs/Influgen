"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { GeneratedPrompt } from "@/lib/data";

export default function DashboardPage() {
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<GeneratedPrompt | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  useEffect(() => {
    const stored: GeneratedPrompt[] = JSON.parse(localStorage.getItem("infulgen_prompts") || "[]");
    setPrompts(stored);
    if (stored.length > 0) setSelectedPrompt(stored[0]);

    // Auto-collapse history on mobile
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsHistoryOpen(false);
    }
  }, []);

  // Polling: check pending prompts every 5 seconds
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
        if (selectedPrompt) {
          const updatedSelected = stored.find((p) => p.id === selectedPrompt.id);
          if (updatedSelected) setSelectedPrompt(updatedSelected);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [prompts, selectedPrompt]);

  const imageUrl = selectedPrompt?.generatedImageUrl;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-8">
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Dashboard
            </motion.h1>
            <motion.p
              className="text-[#999999] text-base"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Review, manage, and retrieve your generated visual concepts.
            </motion.p>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
            
            {/* COLUMN 1: History Panel (Mobile: Order 3) */}
            <div className="order-3 lg:order-1 lg:col-span-3">
              <div className="bg-[#111111] border border-white/10 rounded-[24px] overflow-hidden flex flex-col max-h-[800px] shadow-lg">
                <button 
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  className="w-full flex items-center justify-between p-5 bg-[#151515] hover:bg-[#1a1a1a] transition-colors border-b border-white/5 focus:outline-none focus-visible:bg-[#1a1a1a]"
                >
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-semibold text-white uppercase tracking-wider">History</h2>
                    <span className="text-[10px] font-bold text-black bg-white px-2 py-0.5 rounded-full">
                      {prompts.length}
                    </span>
                  </div>
                  <motion.svg 
                    animate={{ rotate: isHistoryOpen ? 180 : 0 }}
                    className="w-5 h-5 text-[#999999]" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>
                
                <AnimatePresence initial={false}>
                  {isHistoryOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: "auto", opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden flex-1 flex flex-col"
                    >
                      <div className="p-3 overflow-y-auto space-y-2 flex-1 custom-dark-scrollbar">
                        <style dangerouslySetInnerHTML={{__html: `
                          .custom-dark-scrollbar::-webkit-scrollbar {
                            width: 6px;
                          }
                          .custom-dark-scrollbar::-webkit-scrollbar-track {
                            background: rgba(10, 10, 10, 0.5);
                            border-radius: 8px;
                          }
                          .custom-dark-scrollbar::-webkit-scrollbar-thumb {
                            background: #222222;
                            border-radius: 8px;
                          }
                          .custom-dark-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: #333333;
                          }
                          .custom-dark-scrollbar {
                            scrollbar-width: thin;
                            scrollbar-color: #222222 transparent;
                          }
                        `}} />
                        {prompts.length === 0 ? (
                          <div className="p-6 text-center">
                            <p className="text-sm text-[#999999]">No prompts yet.</p>
                            <p className="text-xs text-[#666666] mt-2">Your history will appear here.</p>
                          </div>
                        ) : (
                          prompts.map((prompt) => {
                            const isActive = selectedPrompt?.id === prompt.id;
                            return (
                              <button
                                key={prompt.id}
                                onClick={() => setSelectedPrompt(prompt)}
                                className={`w-full text-left p-4 rounded-[16px] border transition-all duration-200 group flex items-center gap-4 ${
                                  isActive
                                    ? "bg-[#1a1a1a] border-white/20 shadow-sm"
                                    : "bg-transparent border-transparent hover:bg-[#151515] hover:border-white/5"
                                }`}
                              >
                                {prompt.generatedImageUrl ? (
                                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                                    <img src={prompt.generatedImageUrl} alt="thumb" className="w-full h-full object-cover" />
                                  </div>
                                ) : prompt.status === "pending" ? (
                                  <div className="w-10 h-10 rounded-lg flex-shrink-0 border border-[#03e65b]/30 flex items-center justify-center bg-[#03e65b]/5">
                                    <div className="w-4 h-4 border-2 border-[#03e65b] border-t-transparent rounded-full animate-spin" />
                                  </div>
                                ) : prompt.status === "failed" ? (
                                  <div className="w-10 h-10 rounded-lg flex-shrink-0 border border-[#ff5d4b]/30 flex items-center justify-center bg-[#ff5d4b]/5">
                                    <svg className="w-4 h-4 text-[#ff5d4b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className={`w-10 h-10 rounded-lg flex-shrink-0 border flex items-center justify-center transition-colors ${isActive ? 'bg-[#222222] border-white/10' : 'bg-[#151515] border-white/5'}`}>
                                    <svg className="w-4 h-4 text-[#666666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <rect x="3" y="3" width="18" height="18" rx="2" />
                                      <path d="M21 15l-5-5L5 21" />
                                    </svg>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className={`font-medium text-sm truncate transition-colors ${isActive ? "text-white" : "text-[#bbbbbb] group-hover:text-white"}`}>
                                    {prompt.category || "Direct Prompt"}
                                  </div>
                                  <div className="text-xs text-[#777777] mt-1 font-mono">
                                    {new Date(prompt.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* COLUMN 2: Details Panel (Mobile: Order 2) */}
            <div className="order-2 lg:order-2 lg:col-span-4 space-y-6">
              {selectedPrompt ? (
                <>
                  <div className="p-6 rounded-[24px] border border-white/10 bg-[#111111] hover:border-white/15 transition-colors shadow-lg">
                    <h3 className="text-white font-semibold mb-6 text-lg tracking-wide">Selections</h3>
                    {Object.keys(selectedPrompt.selections).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4">
                        {Object.entries(selectedPrompt.selections).map(([key, value]) => (
                          <div key={key} className="flex flex-col space-y-1.5">
                            <span className="text-[11px] text-[#666666] uppercase tracking-widest font-bold">{key}</span>
                            <span className="text-sm text-[#e5e5e5] font-medium leading-snug break-words">{value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-[#666666] italic">Direct prompt entry (no structured selections).</div>
                    )}
                  </div>

                  <div className="p-6 rounded-[24px] border border-white/10 bg-[#111111] hover:border-white/15 transition-colors shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold text-lg tracking-wide">Final Prompt</h3>
                      <button 
                        onClick={() => navigator.clipboard.writeText(selectedPrompt.finalPrompt)}
                        className="text-xs font-medium text-[#999999] hover:text-white flex items-center gap-1.5 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </button>
                    </div>
                    <div className="bg-[#151515] rounded-[16px] p-4 border border-white/5">
                      <p className="text-sm text-[#e5e5e5] leading-relaxed break-words font-mono">
                        {selectedPrompt.finalPrompt}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-10 rounded-[24px] border border-white/10 bg-[#111111] text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                  <svg className="w-10 h-10 text-[#444444] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-[#999999] font-medium">No details available</p>
                  <p className="text-sm text-[#666666] mt-1">Select an item from history.</p>
                </div>
              )}
            </div>

            {/* COLUMN 3: Generated Preview Panel (Mobile: Order 1) */}
            <div className="order-1 lg:order-3 lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <div className="p-6 rounded-[24px] border border-white/10 bg-[#111111] hover:border-white/15 transition-colors shadow-2xl">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-white font-semibold text-lg tracking-wide">Output Preview</h3>
                    {imageUrl ? (
                      <span className="text-[11px] font-bold text-[#03e65b] bg-[#03e65b]/10 border border-[#03e65b]/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Generated
                      </span>
                    ) : selectedPrompt?.status === "pending" ? (
                      <span className="text-[11px] font-bold text-[#ffc533] bg-[#ffc533]/10 border border-[#ffc533]/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Generating
                      </span>
                    ) : selectedPrompt?.status === "failed" ? (
                      <span className="text-[11px] font-bold text-[#ff5d4b] bg-[#ff5d4b]/10 border border-[#ff5d4b]/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Failed
                      </span>
                    ) : null}
                  </div>
                  
                  <div className="aspect-[4/5] rounded-[16px] overflow-hidden border border-white/5 bg-[#0a0a0a] relative group">
                    {imageUrl ? (
                      <>
                        <img
                          src={imageUrl}
                          alt="Generated output"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      </>
                    ) : selectedPrompt?.status === "pending" ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-12 h-12 mb-4 rounded-full border-2 border-[#03e65b] border-t-transparent animate-spin" />
                        <h4 className="text-white font-medium text-lg mb-2">Generating...</h4>
                        <p className="text-sm text-[#777777] max-w-[250px]">
                          Your visual is being crafted. This may take a few moments.
                        </p>
                      </div>
                    ) : selectedPrompt?.status === "failed" ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-12 h-12 mb-4 rounded-full bg-[#ff5d4b]/10 border border-[#ff5d4b]/20 flex items-center justify-center">
                          <svg className="w-6 h-6 text-[#ff5d4b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <h4 className="text-white font-medium text-lg mb-2">Generation Failed</h4>
                        <p className="text-sm text-[#777777] max-w-[250px]">
                          Something went wrong. Please try again.
                        </p>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[url('/res/noise.png')] bg-repeat opacity-90">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#ffffff]/5 to-transparent mix-blend-overlay" />
                        <div className="w-20 h-20 mb-6 rounded-full bg-[#151515] border border-white/10 flex items-center justify-center shadow-lg relative z-10">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#666666]">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                          </svg>
                        </div>
                        <h4 className="text-white font-medium text-lg relative z-10 mb-2">Awaiting Generation</h4>
                        <p className="text-sm text-[#777777] max-w-[250px] relative z-10">
                          Select a prompt from history or create a new one in the builder.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
