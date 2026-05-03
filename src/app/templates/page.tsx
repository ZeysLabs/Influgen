"use client";

import { motion } from "framer-motion";
import Header from "@/components/Header";
import Link from "next/link";

const templates = [
  { id: "t1", title: "Evening Fashion Editorial", category: "Fashion", image: "/res/1.png" },
  { id: "t2", title: "Dramatic Male Portrait", category: "Portrait", image: "/res/2.png" },
  { id: "t3", title: "Luxury Cosmetics Product", category: "Product", image: "/res/3.png" },
  { id: "t4", title: "Modern Living Room", category: "Interior", image: "/res/4.png" },
  { id: "t5", title: "Golden Hour Landscape", category: "Landscape", image: "/res/5.png" },
  { id: "t6", title: "Cozy Lifestyle Morning", category: "Lifestyle", image: "/res/6.png" },
];

export default function TemplatesPage() {
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
            Templates
          </motion.h1>
          <motion.p
            className="text-[#999999] mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Start from a curated preset and customize it in the builder.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((t, i) => (
              <motion.div
                key={t.id}
                className="rounded-[18px] border border-white/10 bg-[#151515] overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={t.image}
                    alt={t.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <div className="text-xs text-[#03e65b] font-medium mb-1 uppercase tracking-wider">{t.category}</div>
                  <h3 className="text-white font-semibold mb-4">{t.title}</h3>
                  <Link
                    href="/builder"
                    className="inline-flex items-center justify-center w-full px-5 py-2.5 rounded-full border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    Use Template
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
