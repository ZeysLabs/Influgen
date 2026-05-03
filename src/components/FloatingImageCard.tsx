"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface FloatingImageCardProps {
  src: string;
  alt: string;
  size: number;
  layer: "back" | "mid" | "front";
  xPath: string[];
  yPath: string[];
  rotatePath: number[];
  scalePath: number[];
  duration: number;
  delay: number;
}

export default function FloatingImageCard({
  src,
  alt,
  size,
  layer,
  xPath,
  yPath,
  rotatePath,
  scalePath,
  duration,
  delay,
}: FloatingImageCardProps) {
  const layerStyles = useMemo(() => {
    if (layer === "back")
      return { opacity: 0.25, zIndex: 1, filter: "blur(3px)", boxShadow: "none" };
    if (layer === "mid")
      return {
        opacity: 0.6,
        zIndex: 2,
        filter: "blur(0.5px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      };
    return {
      opacity: 0.9,
      zIndex: 3,
      filter: "none",
      boxShadow: "0 0 30px rgba(110, 96, 238, 0.4), 0 8px 32px rgba(0,0,0,0.8)",
    };
  }, [layer]);

  return (
    <motion.div
      className="absolute rounded-[18px] overflow-hidden border border-white/10"
      style={{
        width: size,
        height: size * 1.15,
        pointerEvents: "none",
        zIndex: layerStyles.zIndex,
        boxShadow: layerStyles.boxShadow,
        filter: layerStyles.filter,
        marginLeft: -size / 2,
        marginTop: -(size * 1.15) / 2,
      }}
      initial={{
        opacity: 0,
        x: xPath[0],
        y: yPath[0],
        scale: scalePath[0] - 0.2,
      }}
      animate={{
        opacity: [0, layerStyles.opacity, layerStyles.opacity, layerStyles.opacity, 0],
        x: xPath,
        y: yPath,
        rotate: rotatePath,
        scale: scalePath,
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatType: "loop",
        ease: [0.4, 0, 0.2, 1], // cubic-bezier
        times: [0, 0.25, 0.5, 0.75, 1],
      }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
    </motion.div>
  );
}
