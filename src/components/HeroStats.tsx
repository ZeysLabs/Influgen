"use client";

import { motion } from "framer-motion";

// ── Seed / default data ────────────────────────────────────────
// Replace these with real API values when backend is ready.
// Every key maps 1-to-1 with the future backend fields.

export interface HeroStatsData {
  joinedUsers: number;
  generatedPrompts: number;
  activeNow: number;
  todayPrompts: number;
  activeCategories: number;
  readyTemplates: number;
  generatedImages: number;
}

export const SEED_STATS: HeroStatsData = {
  joinedUsers: 2_847,
  generatedPrompts: 18_347,
  activeNow: 47,
  todayPrompts: 312,
  activeCategories: 18,
  readyTemplates: 48,
  generatedImages: 9_240,
};

// ── Avatar initials (placeholder until real profile images) ────
const AVATAR_INITIALS = [
  { id: "avatar-ak", initials: "AK", color: "#6e60ee" },
  { id: "avatar-sl", initials: "SL", color: "#03e65b" },
  { id: "avatar-mf", initials: "MF", color: "#ffc533" },
  { id: "avatar-jp", initials: "JP", color: "#ff3386" },
  { id: "avatar-tw", initials: "TW", color: "#ff5d4b" },
];

// ── Helpers ────────────────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

// ── Component ──────────────────────────────────────────────────
interface HeroStatsProps {
  data?: HeroStatsData;
}

export default function HeroStats({ data = SEED_STATS }: HeroStatsProps) {
  const statCards = [
    { id: "stat-today-prompts", value: data.todayPrompts, label: "prompts generated today" },
    { id: "stat-active-categories", value: data.activeCategories, label: "active categories" },
    { id: "stat-ready-templates", value: data.readyTemplates, label: "ready templates" },
    { id: "stat-generated-images", value: data.generatedImages, label: "images generated" },
  ];

  return (
    <motion.div
      className="mt-12 w-full max-w-3xl mx-auto flex flex-col items-center gap-6"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
    >
      {/* ── Social proof pill ─────────────────────────────────── */}
      <div
        className="inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-3 px-6 py-3.5 rounded-full"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {/* Overlapping avatars */}
        <div className="flex items-center -space-x-2.5">
          {AVATAR_INITIALS.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[11px] font-bold text-white ring-2 ring-black/80 select-none"
              style={{ background: a.color }}
              title={a.initials}
            >
              {a.initials}
            </span>
          ))}
        </div>

        {/* Metrics */}
        <span className="text-sm text-[#e5e5e5] font-medium whitespace-nowrap">
          <strong className="text-white">{fmt(data.joinedUsers)}</strong> users joined
        </span>

        <span className="hidden sm:inline text-white/15 select-none">•</span>

        <span className="text-sm text-[#e5e5e5] font-medium whitespace-nowrap">
          <strong className="text-white">{fmt(data.generatedPrompts)}</strong> prompts created
        </span>

        <span className="hidden sm:inline text-white/15 select-none">•</span>

        <span className="text-sm text-[#e5e5e5] font-medium whitespace-nowrap inline-flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full bg-[#03e65b] shrink-0"
            style={{ boxShadow: "0 0 6px 1px rgba(3,230,91,0.55)" }}
          />
          <strong className="text-white">{fmt(data.activeNow)}</strong> active now
        </span>
      </div>

      {/* ── Stats cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
        {statCards.map((card, i) => (
          <motion.div
            key={card.id}
            className="flex flex-col items-center justify-center rounded-2xl py-5 px-4 text-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 + i * 0.1, ease: "easeOut" }}
          >
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">
              {fmt(card.value)}
            </span>
            <span className="mt-1.5 text-xs sm:text-sm text-[#999] font-medium">
              {card.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
