"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FRAME_COUNT, product } from "@/lib/store";
import BuyButton from "./BuyButton";

const src = (i: number) => `frames/frame_${String(i + 1).padStart(4, "0")}.jpg`;

export default function ScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const container = containerRef.current!;
    const ctx = canvas.getContext("2d")!;
    const images: HTMLImageElement[] = [];
    let currentIdx = -1;
    let raf = 0;

    const size = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };

    const draw = (i: number) => {
      const img = images[i];
      if (!img || !img.complete || !img.naturalWidth) return;
      const cw = canvas.width, ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      currentIdx = i;
    };

    size();
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = src(i);
      if (i === 0) img.onload = () => draw(0);
      images.push(img);
    }

    const loop = () => {
      const top = container.getBoundingClientRect().top;
      const progress = Math.max(0, Math.min(1, -top / (container.offsetHeight - window.innerHeight)));
      const target = Math.round(progress * (FRAME_COUNT - 1));
      if (target !== currentIdx) draw(target);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onResize = () => {
      size();
      const i = currentIdx < 0 ? 0 : currentIdx;
      currentIdx = -1;
      draw(i);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const fade = (d: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.8 + d * 0.15, duration: 0.9, ease: "easeOut" as const },
  });

  return (
    <div ref={containerRef} style={{ height: "300vh", position: "relative" }}>
      <div style={{ position: "sticky", top: 0, width: "100vw", height: "100vh", overflow: "hidden", background: "#000" }}>
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} aria-hidden="true" />
        <div
          style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end",
            padding: "clamp(1.5rem,6vw,5rem)", pointerEvents: "none",
            background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 50%, transparent 100%)",
          }}
        >
          <motion.p className="label latin" {...fade(0)}>{product.est}</motion.p>
          <motion.h1 className="latin" {...fade(1)} style={{ fontWeight: 400, fontSize: "clamp(2.4rem,6vw,5.5rem)", lineHeight: 1.05, margin: ".6rem 0 1rem", direction: "ltr", textAlign: "right" }}>
            {product.brand} <em style={{ color: "var(--accent)" }}>{product.name}</em>
          </motion.h1>
          <motion.p {...fade(2)} style={{ color: "var(--body)", maxWidth: 460, fontSize: "1.1rem", lineHeight: 1.7, marginBottom: "2rem" }}>
            {product.tagline}
          </motion.p>
          <motion.div {...fade(3)}>
            <BuyButton />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
