"use client";
import { useRef } from "react";
import { motion, useInView, type MotionStyle } from "framer-motion";

/** fade-in בגלילה: y 24→0, opacity 0→1, stagger 100ms, once */
export default function Reveal({ children, i = 0, style }: { children: React.ReactNode; i?: number; style?: MotionStyle }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      style={style}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: i * 0.1, ease: [0.25, 0, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}
