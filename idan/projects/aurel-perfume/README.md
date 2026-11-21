# AUREL · Ambre Nuit – דף נחיתה לבושם יוקרה

נבנה ע"י עידן לפי `idan/PROMPT.md`.

## מצב נוכחי
- ✅ האתר המלא: Hero שנשלט בגלילה, תווי ריח, מפרט, כפתור סיום. עברית, RTL, מותאם לנייד.
- ⏳ **הסרטון זמני**: בקבוק מצויר (`tools/placeholder-frames.mjs`), כי בחשבון Higgsfield יש 0 קרדיטים.
  כשיהיו קרדיטים (בערך 66 קרדיטים: 2 תמונות ועוד סרטון 8 שניות ב-1080p), עידן ייצור סרטון אמיתי ויחליף:
  `node tools/extract-frames.mjs path/to/hero.mp4`
- ⏳ **תשלום**: כפתור "לרכישה" מוכן. חסר רק קישור תשלום ב-`lib/store.ts` → `CHECKOUT_URL`.

## חיבור תשלום (אשראי + Apple Pay)
Stripe לא פותח חשבונות לעסקים ישראליים, לכן משתמשים בחברת סליקה ישראלית. אצל כולן יש דף תשלום עם אשראי ו-Apple Pay:
- **Grow (משולם)**, **PayPlus**, **Cardcom**, **Tranzila**

פותחים חשבון, יוצרים "לינק תשלום" למוצר (₪890), מדביקים את הקישור ב-`CHECKOUT_URL` ובונים מחדש.

## הרצה
```
npm install
npm run dev        # http://localhost:3000
npm run build      # אתר סטטי בתיקיית out/ → להעלאה ל-Vercel / Netlify
```
