# קאלורה אונו – דף נחיתה למכונת אספרסו (עברית, RTL)

דף מוצר שבו גוללים ורואים: מכונת אספרסו → כוס מוחלקת מתחת לפיה → האספרסו נמזג לתוכה, עם קרמה ואדים, והמצלמה מתקרבת. המותג "קאלורה" בדיוני.

## להתאמה ללקוח אמיתי
1. **טקסטים**: כל הטקסט נמצא בקובץ אחד, `site/app/brand.ts` (שם, כותרות, יתרונות, מפרט, כפתורים).
2. **סרטון**: מחליפים בסרטון של המוצר האמיתי על רקע שחור (צילום, Kling, Higgsfield), ואז:
   ```bash
   ffmpeg -i hero.mp4 -vf "fps=24,scale=1920:-1" -q:v 3 site/public/frames/frame_%04d.jpg
   ```
   ומעדכנים את `FRAME_COUNT` ב-`site/app/frames.ts`. אם המוצר לא נמצא בערך ב-36% מרוחב הפריים (משמאל), לעדכן `SUBJECT_X` ב-`ScrollHero.tsx`.
3. שם מותג, לוגו ועיצוב של חברה אמיתית – רק באישור שלה.

## הרצה
```bash
cd site && npm install && npm run dev   # http://localhost:3000
npm run build                           # אתר סטטי ב-out/ (להעלאה ל-Vercel/Netlify)
```

## יצירת הסרטון מחדש (render/)
`scene.html` – סצנת three.js; `capture.mjs` מצלם אותה פריים־פריים:
```bash
cd render && npm install
node capture.mjs ../png 192 1920 1080
ffmpeg -framerate 24 -i ../png/f_%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 hero.mp4
```
