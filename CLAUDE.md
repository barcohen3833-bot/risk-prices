# מחירון ביטוח ריסק (risk-prices)

אתר סטטי בעברית (RTL) שמשווה פרמיות ביטוח חיים (ריסק) של 11 חברות, גילאים 18–69, מין, עישון, וסכום ביטוח. דף הבית: טופס בדיקה + קרוסלת לוגואים של החברות (בלי מחירים ובלי כפתורי עצירה/חצים, לבקשת המשתמש). עיצוב "תעודת פוליסה" בגוונים חמים: קלף, חום-אגוז, כפתור בורדו, מסגרות זהב, רוזטת גיליוש מאחורי הלוגואים (`tools/guilloche.mjs` יוצר `src/guilloche.svg`), גופנים Frank Ruhl Libre + IBM Plex Sans Hebrew (בלוק "design v3" בסוף app.css), בלי בחירת 10/20 שנה (פנימית 20). לקוח משאיר פרטים ("שיחה עם סוכן") והפנייה עוברת בתור (round-robin) לסוכן פעיל.

## Supabase וסוכנים
- `config.json` – `supabaseUrl` + `supabaseKey` (מפתח publishable/anon, ציבורי). ריק = הטופס והכניסה מושבתים. build כותב `docs/config.js` ומוסיף את הכתובת ל-CSP connect-src.
- `supabase/setup.sql` – טבלאות agents/leads/insurer_contacts, RLS, פונקציה `submit_lead` (היחידה שפתוחה לאנונימי). המשתמש הראשון שנרשם = מנהל פעיל; אחרים ממתינים לאישור מנהל.
- `src/pages/agent.html` + `src/agent.js` – כניסה/הרשמה/איפוס, פניות, מיילים של מפיקים (המנהל מעדכן; לא להמציא כתובות), ניהול סוכנים. "הקמת פוליסה" מוצג רק לסוכן מחובר.
- אין Python במחשב (רק stub של Store) – לסקריפטים להשתמש ב-node.

## קבצים
- `template.html` – דף הבית (HTML בלבד, עם סימונים `<!--HEAD ...-->`, `<!--INCLUDE ...-->`, `<!--SITEHEADER-->`, `<!--SITEFOOTER-->`).
- `src/app-section.html` – אזור הטבלאות/השוואה/הנחות. `src/app.js` – כל ה-JS (הנחות שפורסמו בבלוק `PUBLISHED`, מקור: poenta.co.il; הנחות שהמשתמש בוחר נשמרות ב-localStorage `risk-disc`). `src/app.css` – העיצוב. `src/pages/` – נגישות, פרטיות, תנאי שימוש, 404.
- `tools/build.mjs` – בונה את `docs/` (index, דפים, data.js, app.js/css, favicon, manifest, robots, sitemap, security.txt). אבטחה: CSP מחמיר ב-meta, בלי סקריפטים או style inline, frame-buster ב-JS.
- `data.json` – המחירים שנשלפו (`prices`: `"גיל|m/f|0/1"` ← `[[חברה, 20 פרמיות חודשיות]]`, `logos`: data URI לכל חברה, `fetchedAt`).
- `docs/index.html` – האתר הבנוי (GitHub Pages מתיקיית /docs).
- `update.mjs` – סקריפט משיכה ובנייה. **לא עובד בשרת**: האתר של הרשות מוגן ב-AWS WAF ומחזיר 202 ריק. אין לעקוף את ההגנה (אין להתחזות לדפדפן).
- `tools/pull-in-browser.js` – משיכה מתוך דפדפן אמיתי של המשתמש בעמוד life.cma.gov.il (כ-15 דקות, 2.5 שניות בין בקשות). (`tools/build.py` ישן, לא בשימוש.)

## מקור הנתונים
מחשבון ריסק של רשות שוק ההון: `POST /RiskParameters/CalculateRiskRates`, התשובה כוללת `#graphInfo[data-graphresults]`. המחירים מרביים, לפני הנחה ולפני חיתום, מחיר למיליון ₪ (סכומים אחרים יחסיים). גילאים 67–69 אין הצעות ל-20 שנה; 66 – 3 חברות.

## איך מעדכנים מחירים
1. פותחים את life.cma.gov.il בדפדפן של המשתמש (דפדפן מובנה), מריצים `tools/pull-in-browser.js`, מחכים עד `__R.finished`.
2. שומרים את `__R.data` ל-JSON, משלבים ב-`data.json` (`prices`), מרעננים `fetchedAt` והלוגואים.
3. בונים: `node tools/build.mjs` ומעלים את כל `docs/`.

## העדפות משתמש
בר, מדבר עברית. לא רוצה לעבוד ב-PowerShell – Claude מריץ הכול בצ'אט. תשובות בעברית, קצרות וברורות.
