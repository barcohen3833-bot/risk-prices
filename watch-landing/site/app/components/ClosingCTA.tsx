'use client';

import { motion } from 'framer-motion';
import Reveal from './Reveal';

export default function ClosingCTA() {
  return (
    <section
      aria-labelledby="cta-title"
      style={{ width: '100%', background: '#000', textAlign: 'center', padding: 'clamp(6rem, 14vw, 11rem) 1.25rem', position: 'relative', overflow: 'hidden' }}
    >
      <Reveal as="p" className="label">שלך לגמרי</Reveal>
      <Reveal as="h2" index={1} className="display" style={{ fontSize: 'clamp(2.2rem, 5vw, 4.5rem)', margin: '1.5rem auto 1.5rem' }}>
        <span id="cta-title">מאה שנים של אומנות.<br /><em style={{ color: '#E5E5E5' }}>ביטוי אחד שלה.</em></span>
      </Reveal>
      <Reveal as="p" index={2} style={{ fontWeight: 300, color: '#E5E5E5', maxWidth: 480, margin: '0 auto 3rem', lineHeight: 1.7 }}>
        כל פרפטואל 40 מותאם ביד לבעליו. בואו לאחד המשווקים המורשים שלנו כדי למדוד אותו ולתאם התאמה אישית.
      </Reveal>
      <Reveal index={3} style={{ position: 'relative', display: 'inline-block' }}>
        <div
          aria-hidden
          style={{ position: 'absolute', inset: '-140px -220px', background: 'radial-gradient(ellipse, rgba(200,169,110,0.10) 0%, transparent 70%)', pointerEvents: 'none' }}
        />
        <motion.a
          className="btn btn-outline"
          href="#collection"
          style={{ position: 'relative' }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          למציאת משווק מורשה
        </motion.a>
      </Reveal>
    </section>
  );
}
