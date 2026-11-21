"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { formatPrice, product } from "@/lib/store";
import Checkout, { ApplePayMark, MastercardMark, VisaMark } from "./Checkout";

/** כפתור רכישה: פותח חלון תשלום עם Apple Pay וכרטיס אשראי (Visa / Mastercard) */
export default function BuyButton({ ghost = false, showIcons = true }: { ghost?: boolean; showIcons?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className={`btn${ghost ? " btn-ghost" : ""}`}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        לרכישה · {formatPrice(product.price)}
      </motion.button>

      {showIcons && (
        <div className="pay-icons" aria-label="אמצעי תשלום: Apple Pay, Visa, Mastercard">
          <ApplePayMark />
          <VisaMark />
          <MastercardMark />
        </div>
      )}

      <Checkout open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
