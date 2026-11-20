import Reveal from './Reveal';

const specs: [string, string][] = [
  ['מספר דגם', 'VR-4005-RG'],
  ['קוטר המארז', '40 מ״מ, עובי 11.6 מ״מ'],
  ['חומר המארז', 'זהב אדום 18 קראט, מלוטש ומוברש'],
  ['בזל', 'מחורץ, זהב אדום 18 קראט'],
  ['מנגנון', 'קליבר V-3255, מילוי עצמי, 31 אבני חן'],
  ['רזרבת כוח', 'כ-70 שעות'],
  ['דיוק', 'עד ±2 שניות ביממה, אחרי ההרכבה במארז'],
  ['זכוכית', 'ספיר קמור, ציפוי נגד השתקפויות בצד הפנימי'],
  ['עמידות במים', '100 מטר'],
  ['לוח', 'שוקולד בגימור קרני שמש, סימוני שעות מזהב אדום'],
  ['רצועה', 'חוליות בשלוש שורות, אבזם מתקפל נסתר'],
];

export default function SpecsSection() {
  return (
    <section className="section" aria-labelledby="specs-title" style={{ maxWidth: 960 }}>
      <Reveal as="p" className="label">מפרט טכני</Reveal>
      <Reveal as="h2" index={1} className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', marginTop: '1.25rem' }}>
        <span id="specs-title">הארכיטקטורה של הדיוק.</span>
      </Reveal>
      <Reveal index={2}>
        <table className="specs">
          <caption className="label" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
            המפרט של וראן פרפטואל 40
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
