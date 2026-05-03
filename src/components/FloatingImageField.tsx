"use client";

import { useState, useEffect } from "react";
import FloatingImageCard from "./FloatingImageCard";
import { heroImages } from "@/lib/images";

function getCount(width: number) {
  if (width < 768) return 8; // Mobile
  if (width < 1024) return 16; // Tablet
  return 24; // Desktop
}

function generateMotionConfig(count: number) {
  const shuffled = [...heroImages].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  const configs: any[] = [];

  for (let i = 0; i < count; i++) {
    const region = i % 4;
    
    // p0: off-screen
    // p1, p2: inside the visible quadrant
    // p3: off-screen
    let offX1=0, offY1=0, offX2=0, offY2=0;
    let minX=0, maxX=0, minY=0, maxY=0;

    switch (region) {
      case 0: // Top-Left
        minX = -5; maxX = 28; minY = -5; maxY = 30;
        offX1 = -40; offY1 = -20; offX2 = 10; offY2 = -40;
        break;
      case 1: // Bottom-Left
        minX = -5; maxX = 28; minY = 65; maxY = 100;
        offX1 = -40; offY1 = 120; offX2 = -10; offY2 = 120;
        break;
      case 2: // Top-Right
        minX = 72; maxX = 105; minY = -5; maxY = 30;
        offX1 = 140; offY1 = -20; offX2 = 120; offY2 = 40;
        break;
      case 3: // Bottom-Right
        minX = 72; maxX = 105; minY = 65; maxY = 100;
        offX1 = 140; offY1 = 120; offX2 = 90; offY2 = 140;
        break;
    }

    const p0 = { x: offX1 + Math.random()*15 - 7.5, y: offY1 + Math.random()*15 - 7.5 };
    const p1 = { x: minX + Math.random()*(maxX-minX), y: minY + Math.random()*(maxY-minY) };
    const p2 = { x: minX + Math.random()*(maxX-minX), y: minY + Math.random()*(maxY-minY) };
    const p3 = { x: offX2 + Math.random()*15 - 7.5, y: offY2 + Math.random()*15 - 7.5 };

    const xPath = [`${p0.x}vw`, `${p1.x}vw`, `${p2.x}vw`, `${p3.x}vw`, `${p0.x}vw`];
    const yPath = [`${p0.y}vh`, `${p1.y}vh`, `${p2.y}vh`, `${p3.y}vh`, `${p0.y}vh`];

    const rotatePath = [
      Math.random() * 40 - 20,
      Math.random() * 10 - 5,
      Math.random() * 10 - 5,
      Math.random() * 40 - 20,
      Math.random() * 40 - 20,
    ];

    const layerRand = Math.random();
    let layer: "back" | "mid" | "front" = "mid";
    if (layerRand < 0.3) layer = "back";
    else if (layerRand < 0.7) layer = "mid";
    else layer = "front";

    let baseSize = 150;
    if (layer === "back") baseSize = 100 + Math.random() * 40;
    if (layer === "mid") baseSize = 160 + Math.random() * 50;
    if (layer === "front") baseSize = 220 + Math.random() * 60;

    const scalePath = [
      0.6,
      0.9 + Math.random() * 0.2,
      0.9 + Math.random() * 0.2,
      0.6,
      0.6
    ];

    let duration = 0;
    if (layer === "back") duration = 28 + Math.random() * 12;
    if (layer === "mid") duration = 20 + Math.random() * 10;
    if (layer === "front") duration = 14 + Math.random() * 8;

    const delay = Math.random() * 12;

    configs.push({
      src: selected[i],
      alt: `Visual ${i + 1}`,
      size: baseSize,
      layer,
      xPath,
      yPath,
      rotatePath,
      scalePath,
      duration,
      delay,
    });
  }

  return configs;
}

export default function FloatingImageField() {
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    let currentCategory = getCount(window.innerWidth);
    setImages(generateMotionConfig(currentCategory));

    const handleResize = () => {
      const newCategory = getCount(window.innerWidth);
      if (newCategory !== currentCategory) {
        currentCategory = newCategory;
        setImages(generateMotionConfig(newCategory));
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ pointerEvents: "none", zIndex: 0 }}
      aria-hidden="true"
    >
      {images.map((img, i) => (
        <FloatingImageCard key={`${img.src}-${i}`} {...img} />
      ))}
    </div>
  );
}
