// שלב 2: מחלץ פריימים מ-hero.mp4 ל-public/frames ומעדכן את lib/frames.ts
// שימוש: node tools/extract-frames.mjs [path/to/hero.mp4]
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, readdirSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const video = resolve(process.argv[2] || resolve(root, "hero.mp4"));
if (!existsSync(video)) {
  console.error("לא נמצא סרטון:", video);
  process.exit(1);
}

const info = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0",
  "-show_entries", "stream=r_frame_rate,nb_frames:format=duration", "-of", "json", video]).toString();
console.log("ffprobe:", JSON.parse(info));

const out = resolve(root, "public/frames");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
execFileSync("ffmpeg", ["-v", "error", "-i", video, "-vf", "fps=24,scale=1920:-1", "-q:v", "3",
  resolve(out, "frame_%04d.jpg")], { stdio: "inherit" });

const FRAME_COUNT = readdirSync(out).filter((f) => f.endsWith(".jpg")).length;
writeFileSync(resolve(root, "lib/frames.ts"),
  `// נוצר אוטומטית ע"י tools/extract-frames.mjs\nexport const FRAME_COUNT = ${FRAME_COUNT};\n`);
if (video !== resolve(root, "public/hero.mp4")) copyFileSync(video, resolve(root, "public/hero.mp4"));
console.log(`FRAME_COUNT = ${FRAME_COUNT}`);
