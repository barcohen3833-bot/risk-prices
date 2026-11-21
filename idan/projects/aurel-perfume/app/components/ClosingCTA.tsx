import Reveal from "./Reveal";
import BuyButton from "./BuyButton";

export default function ClosingCTA() {
  return (
    <section id="buy" style={{ background: "#000", textAlign: "center", padding: "clamp(6rem,12vw,10rem) 1.25rem", position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" style={{ position: "absolute", left: "50%", bottom: "8%", width: 760, height: 420, transform: "translateX(-50%)", background: "radial-gradient(ellipse, rgba(200,169,110,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
      <Reveal><p className="label">שלך בלבד</p></Reveal>
      <Reveal i={1}>
        <h2 className="display" style={{ fontSize: "clamp(2.2rem,5vw,4.5rem)", lineHeight: 1.15, margin: "1.2rem 0 1.4rem" }}>
          ריח אחד.<br />
          <em style={{ color: "var(--body)" }}>זיכרון לכל החיים.</em>
        </h2>
      </Reveal>
      <Reveal i={2}>
        <p style={{ color: "var(--body)", maxWidth: 480, margin: "0 auto 2.6rem", lineHeight: 1.75 }}>
          כמות מוגבלת בכל אצווה. משלוח מבוטח עד הבית, ו-14 יום להחזרה לבקבוק שלא נפתח.
        </p>
      </Reveal>
      <Reveal i={3} style={{ position: "relative" }}>
        <BuyButton ghost />
      </Reveal>
    </section>
  );
}
