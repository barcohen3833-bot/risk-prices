import Reveal from "./Reveal";

const icon = (d: string) => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const features = [
  { label: "תווי ראש: ברגמוט וזעפרן", text: "פתיחה חמה ומתובלת. הברגמוט הקלבררי מאיר, והזעפרן מוסיף עומק כבר בשנייה הראשונה.", d: "M12 3c3 4 5 6.5 5 9.5a5 5 0 0 1-10 0C7 9.5 9 7 12 3z" },
  { label: "תווי לב: ורד טאיפי ואוד", text: "ורד מיובש של טאיף לצד אוד עשן. הלב של הבושם, רך מצד אחד וכהה מצד שני.", d: "M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" },
  { label: "תווי בסיס: ענבר ווניל שחור", text: "ענבר, ווניל מדגסקר מותסס ומעט עור. זה מה שנשאר על העור עד הבוקר.", d: "M4 18h16M6 18V9l6-5 6 5v9M10 18v-5h4v5" },
  { label: "ריכוז 22%", text: "Eau de Parfum בריכוז גבוה מהמקובל. 10–12 שעות על העור, ויותר על בגדים.", d: "M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" },
  { label: "בקבוק זכוכית בעבודת יד", text: "זכוכית עבה בגוון ענבר, צוואר מוזהב ופקק מתכת כבד. בקבוק שנשאר על השיש גם כשהוא ריק.", d: "M9 2h6v3H9zM8 5h8v3H8zM6 8h12v13H6z" },
  { label: "אריזה ומשלוח", text: "קופסת מתנה קשיחה עם כרטיס אישי. משלוח מבוטח עד הבית, 2–4 ימי עסקים.", d: "M3 7l9-4 9 4v10l-9 4-9-4V7zM3 7l9 4 9-4M12 11v10" },
];

export default function FeaturesSection() {
  return (
    <section className="section">
      <Reveal><p className="label">מורכב בלי פשרות</p></Reveal>
      <Reveal i={1}>
        <h2 className="display" style={{ fontSize: "clamp(2rem,4vw,3.5rem)", margin: "1rem 0 3.5rem", lineHeight: 1.15 }}>
          שלוש שכבות. ריח אחד שלא שוכחים.
        </h2>
      </Reveal>
      <div className="grid-features" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2.5rem 2rem" }}>
        {features.map((f, i) => (
          <Reveal key={f.label} i={i} style={{ borderTop: "1px solid var(--border)", paddingTop: "1.75rem" }}>
            {icon(f.d)}
            <h3 style={{ fontWeight: 500, fontSize: "1.1rem", margin: "1.1rem 0 .6rem" }}>{f.label}</h3>
            <p style={{ color: "var(--body)", lineHeight: 1.75 }}>{f.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
