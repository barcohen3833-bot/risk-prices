'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FRAME_COUNT } from '../frames';

const WATCH_X = 0.39;
const framePath =(i: number) => `frames/frame_${String(i + 1).padStart(4, '0')}.jpg`;

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: 'easeOut' as const },
});

export default function ScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const images: HTMLImageElement[] = [];
    let currentIdx = -1;
    let raf = 0;

    // 1. Canvas sized to its box, scaled for devicePixelRatio.
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { clientWidth: w, clientHeight: h } = canvas;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };

    // 2. Cover-fit draw, black behind the image.
    const draw = (idx: number) => {
      const img = images[idx];
      if (!img || !img.complete || !img.naturalWidth) return false;
      const cw = canvas.width, ch = canvas.height;
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale, dh = ih * scale;
      // When the sides are cropped (portrait screens), keep the watch – which sits
      // at ~39% of the frame width – in the middle instead of the frame centre.
      const dx = Math.min(0, Math.max(cw - dw, cw / 2 - dw * WATCH_X));
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, (ch - dh) / 2, dw, dh);
      currentIdx = idx;
      return true;
    };

    size();

    // 3. Preload every frame; draw frame 0 as soon as it arrives.
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.src = framePath(i);
      if (i === 0) img.onload = () => { if (currentIdx === -1) draw(0); };
      images.push(img);
    }

    // 4. rAF loop – no scroll listener.
    const tick = () => {
      const top = container.getBoundingClientRect().top;
      const progress = Math.max(0, Math.min(1, -top / (container.offsetHeight - window.innerHeight)));
      const target = Math.round(progress * (FRAME_COUNT - 1));
      if (target !== currentIdx) draw(target);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // 5. Resize: re-size canvas and redraw the current frame.
    const onResize = () => {
      size();
      const idx = currentIdx < 0 ? 0 : currentIdx;
      currentIdx = -1;
      draw(idx);
    };
    window.addEventListener('resize', onResize);

    // 6. Cleanup.
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ height: '300vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="שעון וראן פרפטואל 40 מסתובב על רקע שחור ומתפרק לחלקיו תוך כדי גלילה"
          style={{ display: 'block', width: '100%', height: '100%' }}
        />
        <div
          style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            padding: 'clamp(1.5rem, 6vw, 5rem)', pointerEvents: 'none',
            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 50%, transparent 100%)',
          }}
        >
          <motion.p className="label" {...fade(0.8)}>ז׳נבה · מאז 1905</motion.p>
          <motion.h1
            className="display"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 5.5rem)', margin: '1rem 0 1.25rem', color: '#fff' }}
            {...fade(0.9)}
          >
            וראן פרפטואל 40
          </motion.h1>
          <motion.p style={{ fontWeight: 300, color: '#E5E5E5', maxWidth: 460, lineHeight: 1.7, marginBottom: '2rem' }} {...fade(1.0)}>
            זהב אדום, לוח שוקולד מבריק ומנגנון שאפשר לראות מתפרק, חלק אחר חלק.
          </motion.p>
          <motion.div {...fade(1.1)}>
            <a className="btn" href="#collection">לגלות את הקולקציה</a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
