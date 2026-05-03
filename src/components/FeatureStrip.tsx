"use client";

import { motion } from "framer-motion";
import { FileJson, Palette, Rocket, ShieldCheck } from "lucide-react";

const features = [
  { icon: FileJson, label: "Structured JSON prompts" },
  { icon: Palette, label: "Visual attribute selection" },
  { icon: Rocket, label: "Campaign-ready output" },
  { icon: ShieldCheck, label: "Prompt consistency" },
];

export default function FeatureStrip() {
  return (
    <section className="py-12 bg-[#0a0a0a] border-y border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.label}
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <feature.icon className="w-5 h-5 text-[#03e65b] shrink-0" />
              <span className="text-sm md:text-base text-[#e5e5e5] font-medium">{feature.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
