import Reveal from './Reveal';

const S = { width: 34, height: 34, viewBox: '0 0 34 34', fill: 'none', stroke: '#C8A96E', strokeWidth: 1.2, 'aria-hidden': true } as const;

const features = [
  {
    title: 'Perpetual Movement',
    copy: 'A self-winding calibre whose rotor turns with every movement of the wrist, holding seventy hours of reserve.',
    icon: <svg {...S}><circle cx="17" cy="17" r="13" /><path d="M17 4a13 13 0 0 1 0 26" /><circle cx="17" cy="17" r="2.5" /></svg>,
  },
  {
    title: 'Rose Gold, Cast In-House',
    copy: 'An 18 ct alloy blended in our own foundry, its warm hue sealed against the fading that time brings to lesser golds.',
    icon: <svg {...S}><path d="M6 13h22l-11 15z" /><path d="M6 13l5-7h12l5 7" /><path d="M11 6l6 7 6-7" /></svg>,
  },
  {
    title: 'Sealed to 100 Metres',
    copy: 'A screw-down crown and caseback close the watch like a vault, from the sea at dawn to the boardroom at dusk.',
    icon: <svg {...S}><path d="M17 4c5 7 8 11 8 15a8 8 0 0 1-16 0c0-4 3-8 8-15z" /><path d="M13 20a4 4 0 0 0 4 4" /></svg>,
  },
  {
    title: 'Three-Piece Bracelet',
    copy: 'Polished centre links between brushed outer rows, each one finished by hand and joined by a concealed clasp.',
    icon: <svg {...S}><rect x="6" y="5" width="22" height="7" rx="2" /><rect x="6" y="14" width="22" height="7" rx="2" /><rect x="6" y="23" width="22" height="7" rx="2" /><path d="M13 5v25M21 5v25" /></svg>,
  },
  {
    title: 'Certified Chronometer',
    copy: 'Every movement is regulated in six positions and tested for fifteen days, keeping to within two seconds a day.',
    icon: <svg {...S}><circle cx="17" cy="19" r="11" /><path d="M17 19V12M17 19l5 3M14 4h6M17 4v4" /></svg>,
  },
  {
    title: 'Sunburst Dial',
    copy: 'Chocolate lacquer over a brushed base, so the light turns across the dial as the hours pass beneath it.',
    icon: <svg {...S}><circle cx="17" cy="17" r="5" /><path d="M17 3v5M17 26v5M3 17h5M26 17h5M7 7l3.5 3.5M23.5 23.5L27 27M27 7l-3.5 3.5M10.5 23.5L7 27" /></svg>,
  },
];

export default function FeaturesSection() {
  return (
    <section id="collection" className="section" aria-labelledby="features-title">
      <Reveal as="p" className="label">Crafted Without Compromise</Reveal>
      <Reveal as="h2" index={1} className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', marginTop: '1.25rem', maxWidth: 720 }}>
        <span id="features-title">Every component, considered alone.</span>
      </Reveal>
      <div className="features-grid">
        {features.map((f, i) => (
          <Reveal as="article" key={f.title} index={i} className="feature">
            {f.icon}
            <h3>{f.title}</h3>
            <p>{f.copy}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
