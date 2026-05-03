"use client";

import { motion } from "framer-motion";


interface VideoShowcaseProps {
  title: string;
  subtitle?: string;
  reverse?: boolean;
  videoSrc?: string;
}

export default function VideoShowcase({ title, subtitle, reverse = false, videoSrc }: VideoShowcaseProps) {
  return (
    <section className="relative py-20 md:py-28 bg-black overflow-hidden">
      <div className={`max-w-6xl mx-auto px-6 flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-12 md:gap-16`}>
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: reverse ? 40 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">{title}</h3>
          {subtitle && <p className="text-[#999999] text-base md:text-lg">{subtitle}</p>}
        </motion.div>

        <motion.div
          className="flex-1 w-full"
          initial={{ opacity: 0, x: reverse ? -40 : 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="relative aspect-video rounded-[18px] overflow-hidden border border-white/10 bg-[#151515] shadow-2xl group cursor-pointer hover:border-white/20 transition-colors">
            {videoSrc ? (
              <video
                className="h-full w-full object-cover"
                src={videoSrc}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-black/40">
                <span className="text-sm text-white/50">
                  Second video coming soon
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
