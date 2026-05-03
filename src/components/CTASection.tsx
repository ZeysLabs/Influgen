"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-24 md:py-32 bg-black relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-10 blur-[120px]" style={{ background: "radial-gradient(circle, #6e60ee 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
      </div>

      <motion.div
        className="relative z-10 max-w-3xl mx-auto px-6 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to structure your next visual?
        </h2>
        <p className="text-[#999999] text-base md:text-lg mb-10 max-w-xl mx-auto">
          Join creators who build precise AI prompts without guessing.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/builder"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#03e65b] text-black font-semibold text-base hover:bg-[#02cc50] transition-colors"
          >
            Start Building
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-white/20 text-white font-medium text-base hover:bg-white/10 transition-colors"
          >
            View Dashboard
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
