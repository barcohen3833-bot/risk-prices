"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CHECKOUT_URL, formatPrice, product } from "@/lib/store";

/**
 * חלון תשלום: Apple Pay + כרטיס אשראי (Visa / Mastercard).
 *
 * מצב הדגמה (CHECKOUT_URL ריק): שום נתון לא נשלח ולא נשמר. השדות קיימים רק לתצוגה,
 * ובלחיצה על "תשלום" מוצגת הודעת הצלחה של הדגמה.
 * מצב אמיתי (יש CHECKOUT_URL): כל כפתור מעביר לדף התשלום המאובטח של חברת הסליקה,
 * שם מזינים את פרטי הכרטיס. האתר עצמו אף פעם לא מקבל מספרי כרטיס.
 */
export const LIVE = CHECKOUT_URL.startsWith("https://");

const AppleLogo = () => (
  <svg width="17" height="20" viewBox="0 0 17 20" fill="currentColor" aria-hidden="true">
    <path d="M14.1 10.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4.1zM11.6 3c.7-.9 1.2-2 1-3.2-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.1 1.2.1 2.3-.6 3.1-1.5z" />
  </svg>
);

export const VisaMark = () => (
  <svg width="46" height="28" viewBox="0 0 46 28" role="img" aria-label="Visa">
    <rect width="46" height="28" rx="4" fill="#fff" />
    <text x="23" y="19" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontStyle="italic" fontSize="13" fill="#1A1F71">VISA</text>
  </svg>
);

export const MastercardMark = () => (
  <svg width="46" height="28" viewBox="0 0 46 28" role="img" aria-label="Mastercard">
    <rect width="46" height="28" rx="4" fill="#fff" />
    <circle cx="19" cy="14" r="8" fill="#EB001B" />
    <circle cx="27" cy="14" r="8" fill="#F79E1B" />
    <path d="M23 7.3a8 8 0 0 1 0 13.4 8 8 0 0 1 0-13.4z" fill="#FF5F00" />
  </svg>
);

export const ApplePayMark = () => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 2, background: "#fff", color: "#000", borderRadius: 4, height: 28, padding: "0 8px", fontWeight: 500, fontSize: 14, fontFamily: "-apple-system,Helvetica,Arial,sans-serif", direction: "ltr" }} aria-label="Apple Pay">
    <AppleLogo />Pay
  </span>
);

const digits = (s: string) => s.replace(/\D/g, "");
const fmtCard = (s: string) => digits(s).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
const fmtExp = (s: string) => {
  const d = digits(s).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};
const brandOf = (n: string) => (/^4/.test(n) ? "visa" : /^(5[1-5]|2[2-7])/.test(n) ? "mc" : null);

export default function Checkout({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [qty, setQty] = useState(1);
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [done, setDone] = useState<null | "apple" | "card">(null);
  const [err, setErr] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // מנקים את השדות בכל סגירה, כדי שלא יישאר שום דבר בזיכרון
  useEffect(() => {
    if (!open) { setCard(""); setExp(""); setCvv(""); setName(""); setDone(null); setErr(""); setQty(1); }
  }, [open]);

  const total = product.price * qty;
  const brand = brandOf(digits(card));

  const goLive = () => window.open(CHECKOUT_URL, "_blank", "noopener,noreferrer");

  const payApple = () => (LIVE ? goLive() : setDone("apple"));
  const payCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (LIVE) return goLive();
    if (digits(card).length < 15 || exp.length < 5 || cvv.length < 3 || name.trim().length < 2) {
      setErr("נא למלא את כל השדות");
      return;
    }
    setErr("");
    setDone("card");
  };

  const input: React.CSSProperties = {
    width: "100%", background: "#0d0d0d", border: "1px solid rgba(255,255,255,.14)", color: "#fff",
    padding: ".85rem .9rem", fontSize: "1rem", fontFamily: "inherit", borderRadius: 6, outline: "none",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="ov"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,.78)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", padding: "1rem", overflowY: "auto" }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog" aria-modal="true" aria-labelledby="co-title" tabIndex={-1}
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 440, background: "#070707", border: "1px solid var(--border)", borderRadius: 14, padding: "1.6rem", position: "relative", outline: "none", textAlign: "right" }}
          >
            <button onClick={onClose} aria-label="סגירה" style={{ position: "absolute", top: 12, left: 14, background: "none", border: 0, color: "var(--dim)", fontSize: 26, cursor: "pointer", lineHeight: 1 }}>×</button>

            {!LIVE && (
              <p style={{ background: "rgba(200,169,110,.1)", border: "1px solid var(--border)", color: "var(--accent-hover)", fontSize: ".8rem", padding: ".5rem .75rem", borderRadius: 6, marginBottom: "1.1rem", textAlign: "center" }}>
                מצב הדגמה: לא יבוצע חיוב, ושום פרט לא נשלח
              </p>
            )}

            {done ? (
              <div style={{ textAlign: "center", padding: "2rem 0 1rem" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", border: "1px solid var(--accent)", display: "grid", placeItems: "center", margin: "0 auto 1.2rem", color: "var(--accent)", fontSize: 30 }}>✓</div>
                <h3 className="display" style={{ fontSize: "1.8rem", marginBottom: ".5rem" }}>תודה על ההזמנה</h3>
                <p style={{ color: "var(--body)" }}>
                  {done === "apple" ? "שולם ב-Apple Pay" : `שולם בכרטיס ${brand === "visa" ? "Visa" : brand === "mc" ? "Mastercard" : ""} ••••${digits(card).slice(-4)}`} · {formatPrice(total)}
                </p>
                <p style={{ color: "var(--dim)", fontSize: ".85rem", marginTop: ".6rem" }}>(הדגמה, לא בוצע חיוב אמיתי)</p>
                <button className="btn" style={{ marginTop: "1.6rem" }} onClick={onClose}>סגירה</button>
              </div>
            ) : (
              <>
                <h3 id="co-title" className="display" style={{ fontSize: "1.6rem", marginBottom: "1rem" }}>תשלום</h3>

                {/* סיכום הזמנה */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".9rem 0", borderTop: "1px solid rgba(255,255,255,.08)", borderBottom: "1px solid rgba(255,255,255,.08)", marginBottom: "1.2rem" }}>
                  <div>
                    <div className="latin" style={{ fontSize: "1.05rem" }}>{product.brand} {product.name}</div>
                    <div style={{ color: "var(--dim)", fontSize: ".85rem" }}><bdi>{product.volume}</bdi> · <bdi>{product.type}</bdi></div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                    <button aria-label="הפחתה" onClick={() => setQty((q) => Math.max(1, q - 1))} style={qtyBtn}>−</button>
                    <span aria-live="polite" style={{ minWidth: 18, textAlign: "center" }}>{qty}</span>
                    <button aria-label="הוספה" onClick={() => setQty((q) => Math.min(5, q + 1))} style={qtyBtn}>+</button>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.4rem", fontSize: "1.05rem" }}>
                  <span style={{ color: "var(--body)" }}>סה״כ (כולל משלוח)</span>
                  <strong style={{ color: "var(--accent-hover)", fontWeight: 500 }}>{formatPrice(total)}</strong>
                </div>

                {/* Apple Pay */}
                <button onClick={payApple} aria-label="תשלום ב-Apple Pay"
                  style={{ width: "100%", height: 50, background: "#fff", color: "#000", border: 0, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 21, fontWeight: 500, fontFamily: "-apple-system,Helvetica,Arial,sans-serif", cursor: "pointer", direction: "ltr" }}>
                  <AppleLogo /> Pay
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: ".8rem", margin: "1.3rem 0", color: "var(--dim)", fontSize: ".8rem" }}>
                  <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,.1)" }} />
                  או תשלום בכרטיס אשראי
                  <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,.1)" }} />
                </div>

                {/* כרטיס אשראי */}
                <form onSubmit={payCard} noValidate autoComplete="off">
                  <label style={lbl}>
                    מספר כרטיס
                    <div style={{ position: "relative" }}>
                      <input style={{ ...input, direction: "ltr", textAlign: "left", paddingRight: "6.5rem" }} inputMode="numeric" autoComplete="off" placeholder="1234 5678 9012 3456"
                        value={card} onChange={(e) => setCard(fmtCard(e.target.value))} />
                      <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 4 }}>
                        <span style={{ opacity: brand && brand !== "visa" ? 0.25 : 1 }}><VisaMark /></span>
                        <span style={{ opacity: brand && brand !== "mc" ? 0.25 : 1 }}><MastercardMark /></span>
                      </span>
                    </div>
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".8rem" }}>
                    <label style={lbl}>
                      תוקף
                      <input style={{ ...input, direction: "ltr", textAlign: "left" }} inputMode="numeric" autoComplete="off" placeholder="MM/YY" value={exp} onChange={(e) => setExp(fmtExp(e.target.value))} />
                    </label>
                    <label style={lbl}>
                      CVV
                      <input style={{ ...input, direction: "ltr", textAlign: "left" }} inputMode="numeric" autoComplete="off" placeholder="123" value={cvv} onChange={(e) => setCvv(digits(e.target.value).slice(0, 4))} />
                    </label>
                  </div>
                  <label style={lbl}>
                    שם בעל הכרטיס
                    <input style={input} autoComplete="off" placeholder="ישראל ישראלי" value={name} onChange={(e) => setName(e.target.value)} />
                  </label>
                  {err && <p role="alert" style={{ color: "#f0a0a0", fontSize: ".85rem", marginBottom: ".6rem" }}>{err}</p>}
                  <button type="submit" className="btn" style={{ width: "100%", justifyContent: "center", marginTop: ".4rem" }}>
                    תשלום {formatPrice(total)}
                  </button>
                </form>

                <p style={{ color: "var(--dim)", fontSize: ".75rem", textAlign: "center", marginTop: "1rem", lineHeight: 1.6 }}>
                  🔒 תשלום מאובטח · משלוח מבוטח עד הבית · 14 יום להחזרה
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const lbl: React.CSSProperties = { display: "grid", gap: ".4rem", fontSize: ".85rem", color: "var(--body)", marginBottom: ".9rem" };
const qtyBtn: React.CSSProperties = { width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--border)", background: "transparent", color: "var(--accent)", cursor: "pointer", fontSize: 16, lineHeight: 1 };
