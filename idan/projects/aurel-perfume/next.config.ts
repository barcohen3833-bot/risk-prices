import type { NextConfig } from "next";

// output: "export" → אתר סטטי (תיקיית out/) שאפשר להעלות ל-Vercel / Netlify / GitHub Pages
const config: NextConfig = { output: "export", images: { unoptimized: true } };
export default config;
