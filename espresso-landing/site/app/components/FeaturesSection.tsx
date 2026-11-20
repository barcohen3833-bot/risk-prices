import Reveal from './Reveal';
import { brand } from '../brand';

const S = { width: 34, height: 34, viewBox: '0 0 34 34', fill: 'none', stroke: '#C8A96E', strokeWidth: 1.2, 'aria-hidden': true } as const;

const icons: Record<string, React.ReactNode> = {
  pressure: <svg {...S}><path d="M5 24a12 12 0 1 1 24 0" /><path d="M17 24l6-8" /><circle cx="17" cy="24" r="1.8" /></svg>,
  clock: <svg {...S}><circle cx="17" cy="18" r="12" /><path d="M17 11v7l5 3" /></svg>,
  cup: <svg {...S}><path d="M6 12h18v6a9 9 0 0 1-18 0z" /><path d="M24 14h2.5a3.5 3.5 0 0 1 0 7H23" /><path d="M11 4c-1 2 1 3 0 5M16 4c-1 2 1 3 0 5" /></svg>,
  screen: <svg {...S}><rect x="5" y="6" width="24" height="15" rx="2" /><circle cx="10" cy="27" r="1.6" /><circle cx="17" cy="27" r="1.6" /><circle cx="24" cy="27" r="1.6" /></svg>,
  milk: <svg {...S}><path d="M10 9h12l-1 19H11z" /><path d="M22 13h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3" /><path d="M13 5c-1 1.5 1 2 0 3.5M18 5c-1 1.5 1 2 0 3.5" /></svg>,
  leaf: <svg {...S}><path d="M7 27C7 14 15 7 28 6c-1 13-8 21-21 21z" /><path d="M7 27l12-12" /></svg>,
  drop: <svg {...S}><path d="M17 4c5 7 8 11 8 15a8 8 0 0 1-16 0c0-4 3-8 8-15z" /><path d="M13 20a4 4 0 0 0 4 4" /></svg>,
  brass: <svg {...S}><rect x="8" y="5" width="18" height="24" rx="3" /><path d="M13 5v24M21 5v24" /></svg>,
};

export default function FeaturesSection() {
  const f = brand.features;
  return (
    <section id="features" className="section" aria-labelledby="features-title">
      <Reveal as="p" className="label">{f.label}</Reveal>
      <Reveal as="h2" index={1} className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', marginTop: '1.25rem', maxWidth: 760 }}>
        <span id="features-title">{f.title}</span>
      </Reveal>
      <div className="features-grid">
        {f.items.map((item, i) => (
          <Reveal as="article" key={item.title} index={i} className="feature">
            {icons[item.icon]}
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
