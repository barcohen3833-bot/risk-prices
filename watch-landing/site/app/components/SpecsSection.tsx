import Reveal from './Reveal';

const specs: [string, string][] = [
  ['Reference No.', 'VR-4005-RG'],
  ['Case Diameter', '40 mm, 11.6 mm thick'],
  ['Case Material', '18 ct rose gold, polished and satin-finished'],
  ['Bezel', 'Fluted, 18 ct rose gold'],
  ['Movement', 'Calibre V-3255, self-winding, 31 jewels'],
  ['Power Reserve', 'Approximately 70 hours'],
  ['Accuracy', '−2 / +2 seconds per day, after casing'],
  ['Crystal', 'Domed sapphire, anti-reflective on the underside'],
  ['Water Resistance', '100 metres / 330 feet'],
  ['Dial', 'Chocolate sunburst, applied rose-gold indices'],
  ['Bracelet', 'Three-piece links, concealed folding clasp'],
];

export default function SpecsSection() {
  return (
    <section className="section" aria-labelledby="specs-title" style={{ maxWidth: 960 }}>
      <Reveal as="p" className="label">Technical Specifications</Reveal>
      <Reveal as="h2" index={1} className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', marginTop: '1.25rem' }}>
        <span id="specs-title">The architecture of precision.</span>
      </Reveal>
      <Reveal index={2}>
        <table className="specs">
          <caption className="label" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
            Vérane Perpétuel 40 specifications
          </caption>
          <tbody>
            {specs.map(([k, v]) => (
              <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </section>
  );
}
