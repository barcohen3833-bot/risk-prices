// סרטון hero זמני, עד שיהיו קרדיטים ב-Higgsfield.
// מצייר בקבוק בושם (SVG) שמסתובב ואז מתפרק לחלקים, ומצלם כל פריים עם Playwright.
// התוצאה: hero.mp4 בתיקיית הפרויקט. אחרי זה מריצים: node tools/extract-frames.mjs
import { mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

// playwright מותקן גלובלית בסביבה (או מקומית)
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require(resolve(execSync("npm root -g").toString().trim(), "playwright"))); }

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmp = resolve(root, ".frames-tmp");
const N = 144; // 6 שניות ב-24fps
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

const html = `<!doctype html><html><head><style>
html,body{margin:0;background:#000;width:1920px;height:1080px;overflow:hidden}
svg{display:block}
</style></head><body>
<svg id="s" width="1920" height="1080" viewBox="0 0 1920 1080">
<defs>
  <radialGradient id="glow" cx="50%" cy="55%" r="45%"><stop offset="0" stop-color="#C8A96E" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <linearGradient id="gold" x1="0" x2="1"><stop offset="0" stop-color="#6b5226"/><stop offset=".35" stop-color="#f3dca4"/><stop offset=".55" stop-color="#C8A96E"/><stop offset="1" stop-color="#4a3818"/></linearGradient>
  <linearGradient id="glass" x1="0" x2="1"><stop offset="0" stop-color="#2a1606"/><stop offset=".25" stop-color="#8a4f12"/><stop offset=".5" stop-color="#c47a22"/><stop offset=".75" stop-color="#7a420c"/><stop offset="1" stop-color="#1e0f04"/></linearGradient>
  <linearGradient id="liquid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0a640" stop-opacity=".9"/><stop offset="1" stop-color="#5a2a05"/></linearGradient>
  <linearGradient id="shine" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <clipPath id="bodyclip"><rect x="-170" y="-150" width="340" height="380" rx="38"/></clipPath>
</defs>
<rect width="1920" height="1080" fill="#000"/>
<ellipse cx="660" cy="620" rx="900" ry="520" fill="url(#glow)"/>
<g id="dust"></g>
<g id="bottle" transform="translate(660 640)">
  <g id="body">
    <g id="bodyscale">
      <rect x="-170" y="-150" width="340" height="380" rx="38" fill="url(#glass)"/>
      <rect x="-150" y="-60" width="300" height="270" rx="26" fill="url(#liquid)" opacity=".55"/>
      <g clip-path="url(#bodyclip)"><rect id="sweep" x="-400" y="-160" width="120" height="420" fill="url(#shine)" transform="skewX(-18)"/></g>
      <rect x="-170" y="-150" width="340" height="380" rx="38" fill="none" stroke="#f3dca4" stroke-opacity=".35" stroke-width="2"/>
      <rect id="label" x="-95" y="-10" width="190" height="96" fill="#0b0805" stroke="url(#gold)" stroke-width="2"/>
      <text x="0" y="34" fill="#E8C98E" font-family="Georgia,serif" font-size="34" letter-spacing="10" text-anchor="middle">AUREL</text>
      <text x="0" y="66" fill="#C8A96E" font-family="Georgia,serif" font-style="italic" font-size="20" text-anchor="middle">Ambre Nuit</text>
    </g>
  </g>
  <g id="collar"><rect x="-70" y="-196" width="140" height="48" rx="6" fill="url(#gold)"/></g>
  <g id="stem"><rect x="-9" y="-250" width="18" height="60" fill="#d9d2c4"/><rect x="-26" y="-262" width="52" height="22" rx="5" fill="url(#gold)"/></g>
  <g id="cap"><rect x="-92" y="-372" width="184" height="176" rx="10" fill="url(#gold)"/><rect x="-92" y="-372" width="184" height="18" rx="6" fill="#f6e3b0" opacity=".5"/></g>
</g>
</svg>
<script>
const $=id=>document.getElementById(id);
const dust=$('dust');const P=[];
for(let i=0;i<70;i++){const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
  const a=Math.random()*Math.PI*2, r=0.35+Math.random()*0.65;
  c.setAttribute('fill', i%3? '#C8A96E':'#f3dca4'); dust.appendChild(c); P.push({c,a,r,s:1+Math.random()*2.5});}
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
window.frame=(p)=>{
  const orbit=Math.sin(p*Math.PI*1.1)*0.18;           // "סיבוב" עדין
  const e=ease(Math.max(0,Math.min(1,(p-0.45)/0.5)));  // פירוק מאמצע הסרטון
  const float=Math.sin(p*Math.PI*2)*8;
  const sx=1-Math.abs(orbit)*0.6;
  $('bodyscale').setAttribute('transform',\`scale(\${sx} 1) skewY(\${orbit*10})\`);
  $('body').setAttribute('transform',\`translate(\${e*0} \${float+e*120}) rotate(\${e*-4})\`);
  $('collar').setAttribute('transform',\`translate(\${e*-150} \${float-e*170}) rotate(\${e*-14})\`);
  $('stem').setAttribute('transform',\`translate(\${e*150} \${float-e*260}) rotate(\${e*12})\`);
  $('cap').setAttribute('transform',\`translate(0 \${float-e*250}) rotate(\${e*6}) scale(\${1+e*0.04})\`);
  $('label').setAttribute('transform',\`translate(0 \${e*-6})\`);
  $('sweep').setAttribute('x', -400 + p*900);
  $('bottle').setAttribute('transform',\`translate(660 \${640+e*10}) scale(\${0.92-e*0.14})\`);
  P.forEach(o=>{const d=e*o.r*720; o.c.setAttribute('cx',660+Math.cos(o.a)*d); o.c.setAttribute('cy',620+Math.sin(o.a)*d*0.62);
    o.c.setAttribute('r',o.s*e); o.c.setAttribute('opacity',e*(1-e*0.35));});
};
</script></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.setContent(html);
for (let i = 0; i < N; i++) {
  await page.evaluate((p) => window.frame(p), i / (N - 1));
  await page.screenshot({ path: resolve(tmp, `f_${String(i + 1).padStart(4, "0")}.png`) });
}
await browser.close();
execFileSync("ffmpeg", ["-v", "error", "-y", "-framerate", "24", "-i", resolve(tmp, "f_%04d.png"),
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", resolve(root, "hero.mp4")], { stdio: "inherit" });
rmSync(tmp, { recursive: true, force: true });
console.log("hero.mp4 (placeholder) ready");
