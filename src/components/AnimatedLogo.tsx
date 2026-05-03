"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnimatedLogo() {
  const [view, setView] = useState<"logo" | "text">("logo");

  useEffect(() => {
    const interval = setInterval(() => {
      setView((prev) => (prev === "logo" ? "text" : "logo"));
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  const variants = {
    initial: { x: 40, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  };

  const transition = {
    duration: 1.0,
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number], // cubic-bezier
  };

  return (
    <div className="relative flex items-center overflow-hidden w-[140px] md:w-[160px] h-[40px]">
      <AnimatePresence>
        {view === "logo" && (
          <motion.img
            key="logo"
            src="/res/logo.png"
            alt="InfluGen Logo"
            className="absolute left-0 h-[30px] md:h-[40px] w-auto object-contain"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
          />
        )}
        {view === "text" && (
          <motion.span
            key="text"
            className="absolute left-0 text-white font-bold uppercase tracking-[0.2em] text-[15px] md:text-[17px] whitespace-nowrap drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
          >
            INFLUGEN
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
