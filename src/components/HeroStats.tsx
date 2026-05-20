"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";

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
  return Math.floor(n).toLocaleString("en-US");
}

// ── LocalStorage helpers ───────────────────────────────────────
const LS_PREFIX = "influgen_stats_";

interface PersistedCounter {
  value: number;
  timestamp: number; // ms since epoch when value was last saved
}

interface PersistedDaily {
  value: number;
  date: string; // YYYY-MM-DD
  timestamp: number;
}

function loadCounter(key: string): PersistedCounter | null {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedCounter;
  } catch {
    return null;
  }
}

function saveCounter(key: string, value: number) {
  try {
    const data: PersistedCounter = { value, timestamp: Date.now() };
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(data));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

function loadDaily(key: string): PersistedDaily | null {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedDaily;
  } catch {
    return null;
  }
}

function saveDaily(key: string, value: number) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const data: PersistedDaily = { value, date: today, timestamp: Date.now() };
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(data));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

// ── Deterministic "active now" based on time of day ────────────
// Returns a smooth value between 50 and 150, using a sine-curve
// that peaks in the evening (~20:00) and dips midday (~12:00).
// Same time ⇒ same (or very similar) value across refreshes.
function getActiveNow(): number {
  const now = new Date();
  const minuteOfDay = now.getHours() * 60 + now.getMinutes();

  // Primary wave: peaks at ~20:00 (minute 1200), trough at ~08:00 (minute 480)
  const phase1 = Math.sin(((minuteOfDay - 480) / 1440) * 2 * Math.PI);
  // Secondary wave: small ripple for variation
  const phase2 = Math.sin(((minuteOfDay - 200) / 720) * 2 * Math.PI) * 0.25;

  // Combine: -1..+1 → 0..1 → 50..150
  const combined = (phase1 + phase2) / 1.25; // normalize to approx -1..1
  const normalized = (combined + 1) / 2; // 0..1
  const value = 50 + normalized * 100;

  // Add a tiny day-of-year seed so it's not identical every day
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const dayNoise = Math.sin(dayOfYear * 7.3) * 8;

  return Math.round(Math.max(50, Math.min(150, value + dayNoise)));
}

// ── Compute persisted counter with elapsed-time catch-up ───────
function computeCounter(
  key: string,
  seedValue: number,
  intervalMs: number
): number {
  const stored = loadCounter(key);
  if (!stored) {
    saveCounter(key, seedValue);
    return seedValue;
  }
  const elapsed = Date.now() - stored.timestamp;
  const increments = Math.floor(elapsed / intervalMs);
  const newValue = stored.value + increments;
  if (increments > 0) {
    saveCounter(key, newValue);
  }
  return newValue;
}

// ── Compute daily counter (resets each new day) ────────────────
function computeDaily(
  key: string,
  seedValue: number,
  intervalMs: number
): number {
  const today = new Date().toISOString().slice(0, 10);
  const stored = loadDaily(key);

  if (!stored || stored.date !== today) {
    // New day — start from a deterministic base
    // Use day-of-year to vary the starting point slightly
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86400000
    );
    const base = seedValue + (dayOfYear % 30) * 3;
    // Calculate how many minutes have passed today
    const now = new Date();
    const minutesToday = now.getHours() * 60 + now.getMinutes();
    const todayIncrements = Math.floor(
      (minutesToday * 60 * 1000) / intervalMs
    );
    const newValue = base + todayIncrements;
    saveDaily(key, newValue);
    return newValue;
  }

  const elapsed = Date.now() - stored.timestamp;
  const increments = Math.floor(elapsed / intervalMs);
  const newValue = stored.value + increments;
  if (increments > 0) {
    saveDaily(key, newValue);
  }
  return newValue;
}

// ── Animated number display component ──────────────────────────
function AnimatedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (from === to) return;

    const diff = to - from;
    const duration = Math.min(600, Math.abs(diff) * 150);
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + diff * eased);
      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        prevRef.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value]);

  return <span className={className}>{fmt(display)}</span>;
}

// ── Component ──────────────────────────────────────────────────
interface HeroStatsProps {
  data?: HeroStatsData;
}

export default function HeroStats({ data = SEED_STATS }: HeroStatsProps) {
  // ── Live stat state ────────────────────────────────────────
  const [joinedUsers, setJoinedUsers] = useState(data.joinedUsers);
  const [generatedPrompts, setGeneratedPrompts] = useState(
    data.generatedPrompts
  );
  const [activeNow, setActiveNow] = useState(data.activeNow);
  const [todayPrompts, setTodayPrompts] = useState(data.todayPrompts);
  const [generatedImages, setGeneratedImages] = useState(data.generatedImages);

  // Static values — no dynamic behavior
  const activeCategories = data.activeCategories;
  const readyTemplates = data.readyTemplates;

  // ── Initialize from localStorage on mount ──────────────────
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Compute initial values from persisted state
    setJoinedUsers(
      computeCounter("joinedUsers", data.joinedUsers, 75 * 60 * 1000)
    ); // ~75 min avg
    setGeneratedPrompts(
      computeCounter("generatedPrompts", data.generatedPrompts, 3 * 60 * 1000)
    ); // ~3 min avg
    setGeneratedImages(
      computeCounter("generatedImages", data.generatedImages, 5 * 60 * 1000)
    ); // 5 min
    setTodayPrompts(
      computeDaily("todayPrompts", data.todayPrompts, 10 * 60 * 1000)
    ); // ~10 min avg
    setActiveNow(getActiveNow());
    setMounted(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Live intervals ─────────────────────────────────────────
  // Users joined: +1 every 45–120 min (use 75 min fixed interval for tick)
  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => {
      setJoinedUsers((prev) => {
        const next = prev + 1;
        saveCounter("joinedUsers", next);
        return next;
      });
    }, 75 * 60 * 1000);
    return () => clearInterval(id);
  }, [mounted]);

  // Prompts created: +1 every 2–4 min (use 3 min fixed interval)
  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => {
      setGeneratedPrompts((prev) => {
        const next = prev + 1;
        saveCounter("generatedPrompts", next);
        return next;
      });
    }, 3 * 60 * 1000);
    return () => clearInterval(id);
  }, [mounted]);

  // Images generated: +1 every 5 min
  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => {
      setGeneratedImages((prev) => {
        const next = prev + 1;
        saveCounter("generatedImages", next);
        return next;
      });
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [mounted]);

  // Prompts generated today: +1 every 8–15 min (use 10 min)
  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => {
      setTodayPrompts((prev) => {
        const next = prev + 1;
        saveDaily("todayPrompts", next);
        return next;
      });
    }, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [mounted]);

  // Active now: recalculate every 60s
  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => {
      setActiveNow(getActiveNow());
    }, 60_000);
    return () => clearInterval(id);
  }, [mounted]);

  // ── Stat cards array ───────────────────────────────────────
  const statCards = [
    {
      id: "stat-today-prompts",
      value: todayPrompts,
      label: "prompts generated today",
    },
    {
      id: "stat-active-categories",
      value: activeCategories,
      label: "active categories",
    },
    {
      id: "stat-ready-templates",
      value: readyTemplates,
      label: "ready templates",
    },
    {
      id: "stat-generated-images",
      value: generatedImages,
      label: "images generated",
    },
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
          <AnimatedNumber value={joinedUsers} className="text-white font-bold" />{" "}
          users joined
        </span>

        <span className="hidden sm:inline text-white/15 select-none">•</span>

        <span className="text-sm text-[#e5e5e5] font-medium whitespace-nowrap">
          <AnimatedNumber
            value={generatedPrompts}
            className="text-white font-bold"
          />{" "}
          prompts created
        </span>

        <span className="hidden sm:inline text-white/15 select-none">•</span>

        <span className="text-sm text-[#e5e5e5] font-medium whitespace-nowrap inline-flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full bg-[#03e65b] shrink-0"
            style={{ boxShadow: "0 0 6px 1px rgba(3,230,91,0.55)" }}
          />
          <AnimatedNumber value={activeNow} className="text-white font-bold" />{" "}
          active now
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
            transition={{
              duration: 0.5,
              delay: 0.9 + i * 0.1,
              ease: "easeOut",
            }}
          >
            <AnimatedNumber
              value={card.value}
              className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none"
            />
            <span className="mt-1.5 text-xs sm:text-sm text-[#999] font-medium">
              {card.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
