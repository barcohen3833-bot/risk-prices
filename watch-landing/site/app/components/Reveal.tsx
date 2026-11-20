'use client';

import { motion } from 'framer-motion';

const EASE = [0.25, 0, 0, 1] as const;

// Scroll-triggered fade-in: y 24 -> 0, opacity 0 -> 1, once.
export default function Reveal({ children, index = 0, as = 'div', className, style }: {
  children: React.ReactNode; index?: number; as?: 'div' | 'p' | 'h2' | 'article';
  className?: string; style?: React.CSSProperties;
}) {
  const M = motion[as];
  return (
    <M
      className={className}
      style={style}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: EASE, delay: index * 0.1 }}
    >
      {children}
    </M>
  );
}
