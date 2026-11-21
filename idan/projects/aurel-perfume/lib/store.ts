// ─────────────────────────────────────────────────────────────
// הגדרות החנות. רוב השינויים נעשים רק בקובץ הזה.
// ─────────────────────────────────────────────────────────────

/**
 * קישור לדף התשלום (Payment Link) מחברת הסליקה.
 * בדף הזה הלקוח משלם בכרטיס אשראי, ב-Apple Pay (ובחלק מהחברות גם ב-Google Pay / ביט).
 *
 * חברות סליקה ישראליות עם Apple Pay: Grow (משולם), PayPlus, Cardcom, Tranzila.
 * יוצרים אצלן "דף תשלום" או "לינק תשלום" למוצר ומדביקים כאן את הכתובת.
 * (בעסק עם חשבון Stripe מחוץ לישראל אפשר להדביק כאן Stripe Payment Link.)
 *
 * כל עוד השדה ריק, כפתור הרכישה פותח הודעה שהרכישה עדיין לא חוברה.
 */
export const CHECKOUT_URL = "";

/** כמה פריימים יש ב-public/frames (מתעדכן אוטומטית ע"י tools/extract-frames.mjs) */
export { FRAME_COUNT } from "./frames";

export const product = {
  brand: "AUREL",
  name: "Ambre Nuit",
  type: "Eau de Parfum",
  volume: "100 מ״ל",
  price: 890,
  currency: "₪",
  tagline: "ענבר, עוד ווניל שחור. ריח שנשאר בחדר הרבה אחרי שיצאת ממנו.",
  est: "Maison de Parfum · Est. 2026",
};

export const formatPrice = (n: number) =>
  `${product.currency}${n.toLocaleString("he-IL")}`;
