"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CHECKOUT_URL, formatPrice, product } from "@/lib/store";

/** כפתור רכישה: מוביל לדף התשלום של חברת הסליקה (כרטיס אשראי, Apple Pay ועוד) */
export default function BuyButton({ ghost = false, showIcons = true }: { ghost?: boolean; showIcons?: boolean }) {
  const [notice, setNotice] = useState(false);
  const ready = CHECKOUT_URL.startsWith("https://");

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
      <motion.a
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className={`btn${ghost ? " btn-ghost" : ""}`}
        href={ready ? CHECKOUT_URL : "#buy"}
        target={ready ? "_blank" : undefined}
        rel={ready ? "noopener noreferrer" : undefined}
        onClick={(e) => {
          if (!ready) {
            e.preventDefault();
            setNotice(true);
          }
        }}
      >
        לרכישה · {formatPrice(product.price)}
      </motion.a>

      {showIcons && (
        <div className="pay-icons" aria-label="אמצעי תשלום">
          <span>Apple Pay</span>
          <span>Visa</span>
          <span>Mastercard</span>
          <span>Amex</span>
          <span>Google Pay</span>
        </div>
      )}

      {notice && (
        <p role="status" style={{ marginTop: ".9rem", color: "var(--body)", fontSize: ".85rem", maxWidth: 360, textAlign: "center" }}>
          התשלום עדיין לא חובר. צריך להדביק קישור תשלום ב-<code>lib/store.ts</code>.
        </p>
      )}
    </div>
  );
}
