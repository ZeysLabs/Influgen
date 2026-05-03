"use client";

import { motion } from "framer-motion";
import FloatingImageField from "./FloatingImageField";
import MotionBackground from "./MotionBackground";
import HeroStats from "./HeroStats";
import Link from "next/link";

export default function AnimatedHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <MotionBackground />
      <FloatingImageField />

      {/* Text readability overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          InfluGen AI —{" "}
          <span className="text-[#6e60ee]">The epitome of perfection</span>
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg md:text-xl text-[#e5e5e5] max-w-2xl mx-auto mb-10 drop-shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          Craft cinematic AI visuals through structured direction. Infulgen transforms creative decisions into precise JSON prompts and high-end visual outcomes.
        </motion.p>

        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <div className="relative group inline-block">
            {/* Animated Aura Glow */}
            <motion.div
              className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#60a5fa] to-[#818cf8] blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-500"
              animate={{
                scale: [1, 1.04, 1],
                opacity: [0.3, 0.4, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Main Button */}
            <Link
              href="/builder"
              className="relative inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white text-black font-semibold text-base hover:bg-[#fafafa] transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              Start Building
            </Link>
          </div>
        </motion.div>

        <HeroStats />
      </div>
    </section>
  );
}
