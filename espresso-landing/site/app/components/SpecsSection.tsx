import Reveal from './Reveal';
import { brand } from '../brand';

export default function SpecsSection() {
  const s = brand.specs;
  return (
    <section className="section" aria-labelledby="specs-title" style={{ maxWidth: 960 }}>
      <Reveal as="p" className="label">{s.label}</Reveal>
      <Reveal as="h2" index={1} className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', marginTop: '1.25rem' }}>
        <span id="specs-title">{s.title}</span>
      </Reveal>
      <Reveal index={2}>
        <table className="specs">
          <caption style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{s.caption}</caption>
          <tbody>
            {s.rows.map(([k, v]) => (
              <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </section>
  );
}
