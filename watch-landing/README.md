# Vérane Perpétuel 40 – דף נחיתה עם סרטון שנשלט בגלילה

הדגמה של המדריך "Build $5K Websites Using Claude Code". מותג השעון (Vérane) בדיוני.

## מה יש כאן
- `render/` – יצירת הסרטון. `scene.html` הוא שעון תלת־ממדי (three.js) שמסתובב ומתפרק; `capture.mjs` מצלם אותו פריים־פריים ב-Chromium. התוצאה: `render/hero.mp4` (6 שניות, 24fps, 1920×1080).
- `frames/` – 144 פריימים שחולצו מהסרטון עם ffmpeg (שלב 2 במדריך).
- `site/` – פרויקט Next.js 15 + React 19 + Framer Motion + TypeScript (שלבים 3–7).

## הרצה
```bash
cd site
npm install
npm run dev        # http://localhost:3000
npm run build      # בונה אתר סטטי לתיקייה out/
node relativize.mjs  # (לא חובה) נתיבים יחסיים, כדי שהאתר יעבוד מכל תיקייה / zip
```

## יצירת סרטון מחדש
```bash
cd render && npm install
node capture.mjs ../png 144 1920 1080
ffmpeg -framerate 24 -i ../png/f_%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 hero.mp4
ffmpeg -i hero.mp4 -vf "fps=24,scale=1920:-1" -q:v 3 ../frames/frame_%04d.jpg
cp -r ../frames ../site/public/frames   # ולעדכן FRAME_COUNT ב-site/app/frames.ts
```

## התאמה ללקוח
מחליפים את הסרטון בסרטון של המוצר על רקע שחור (למשל מ-Higgsfield או Kling), מחלצים פריימים, מעדכנים `FRAME_COUNT`, ומשנים טקסטים ב-`site/app/components/`. אם המוצר בסרטון לא נמצא ב-61% מרוחב הפריים, לעדכן `WATCH_X` ב-`ScrollHero.tsx`.
