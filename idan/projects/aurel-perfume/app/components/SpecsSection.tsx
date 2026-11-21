import Reveal from "./Reveal";
import { formatPrice, product } from "@/lib/store";

const specs: [string, string][] = [
  ["שם", `${product.brand} ${product.name}`],
  ["סוג", product.type],
  ["נפח", product.volume],
  ["ריכוז", "22% תמצית"],
  ["משפחת ריח", "אוריינטלי · ענברי · עצי"],
  ["תווי ראש", "ברגמוט, זעפרן, פלפל ורוד"],
  ["תווי לב", "ורד טאיפי, אוד, יסמין סמבק"],
  ["תווי בסיס", "ענבר, ווניל שחור, עור, מושק"],
  ["עמידות", "10–12 שעות"],
  ["מחיר", formatPrice(product.price)],
];

export default function SpecsSection() {
  return (
    <section className="section" style={{ maxWidth: 960 }}>
      <Reveal><p className="label">מפרט</p></Reveal>
      <Reveal i={1}>
        <h2 className="display" style={{ fontSize: "clamp(2rem,4vw,3.5rem)", margin: "1rem 0 3rem" }}>הארכיטקטורה של ריח.</h2>
      </Reveal>
      <div>
        {specs.map(([k, v], i) => (
          <Reveal key={k} i={i * 0.5}>
            <div className="spec-row" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem", padding: "1.15rem 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <span style={{ color: "var(--accent)", fontWeight: 400 }}>{k}</span>
              <span style={{ color: "var(--body)" }}>{v}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
