# מחירון ביטוח ריסק (risk-prices)

אתר סטטי בעברית (RTL) שמשווה פרמיות ביטוח חיים (ריסק) של 11 חברות, גילאים 18–69, מין, עישון, סכום ביטוח, 10 או 20 שנה, חודשי או שנתי, עם דף כניסה, מצב כהה/בהיר ולוגואים.

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
