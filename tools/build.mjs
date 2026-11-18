// Builds the static site into docs/ from data.json + template.html + src/.
// Usage: node tools/build.mjs   (run from the repo root)
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { createHash } from "node:crypto";

const SITE = "https://barcohen3833-bot.github.io/risk-prices/";
const REPO = "https://github.com/barcohen3833-bot/risk-prices";
const read = p => readFileSync(p, "utf8");
const data = JSON.parse(read("data.json"));

// ---- data.js: compact prices + logos (only safe PNG data URIs) ----
const comp = [], D = {};
for (const [k, rows] of Object.entries(data.prices).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))) {
  if (!/^\d{2}\|[mf]\|[01]$/.test(k) || !rows.length) continue;
  D[k] = rows.map(([name, arr]) => {
    name = String(name).slice(0, 60);
    if (!comp.includes(name)) comp.push(name);
    return [comp.indexOf(name), arr.map(v => Math.round(+v * 100) / 100)];
  });
}
const logos = {};
for (const n of comp) { const s = data.logos?.[n]; if (typeof s === "string" && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(s)) logos[n] = s; }
const date = new Date(data.fetchedAt).toLocaleDateString("he-IL", { timeZone: "Asia/Jerusalem" });
const dataJs = "window.RISK=" + JSON.stringify({ DATA: D, COMPANIES: comp, LOGOS: logos, DATE: date }) + ";\n";
// ---- Supabase config (public URL + publishable/anon key; security comes from RLS in supabase/setup.sql) ----
let cfg = {}; try { cfg = JSON.parse(read("config.json")); } catch {}
const sbUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(cfg.supabaseUrl || "") ? cfg.supabaseUrl : "";
const sbKey = sbUrl && /^[A-Za-z0-9._-]{20,400}$/.test(cfg.supabaseKey || "") ? cfg.supabaseKey : "";
const configJs = "window.RISK_SB=" + JSON.stringify(sbKey ? { url: sbUrl, key: sbKey } : null) + ";\n";
const ver = createHash("sha256").update(dataJs + configJs + read("src/app.js") + read("src/agent.js") + read("src/app.css") + read("template.html")).digest("hex").slice(0, 10);

// ---- security headers that a static host allows via <meta> (GitHub Pages can't set real headers) ----
const CSP = ["default-src 'none'", "script-src 'self'", "style-src 'self' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com", "img-src 'self' data:", "manifest-src 'self'", (sbKey ? `connect-src ${sbUrl}` : "connect-src 'none'"),
  "base-uri 'none'", "form-action 'none'", "object-src 'none'", "upgrade-insecure-requests"].join("; ");

const header = path => `<a class="skip" href="#main">דלג לתוכן</a>
<header class="site-h"><div class="wrap top">
  <a class="brand" href="./${path ? "" : "#"}" id="home-link"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2 4 7v8c0 7.5 5 13.2 12 15 7-1.8 12-7.5 12-15V7z" fill="var(--accent)"/><path d="m10.5 16 4 4 7-8" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><span>מחירון ביטוח ריסק</span></a>
  <div class="tbtns"><button type="button" class="theme hide" id="back">→ דף הבית</button><a class="theme agent-link" href="agent.html"><span class="lg">כניסת </span>סוכנים</a><button type="button" class="theme" id="a11y-btn" aria-expanded="false" aria-controls="a11y">♿ נגישות</button><button type="button" class="theme" id="theme" aria-label="מצב תצוגה"></button></div>
</div>
<div class="a11y" id="a11y" hidden role="group" aria-label="תפריט נגישות">
  <button type="button" data-a="font+">הגדלת טקסט</button><button type="button" data-a="font-">הקטנת טקסט</button><button type="button" data-a="contrast">ניגודיות גבוהה</button><button type="button" data-a="links">הדגשת קישורים</button><button type="button" data-a="motion">עצירת הנפשות</button><button type="button" data-a="reset">איפוס</button><a href="accessibility.html">הצהרת נגישות</a>
</div></header>`;

const footer = `<footer class="site-f"><div class="wrap">
  <nav aria-label="קישורים"><a href="./">דף הבית</a><a href="accessibility.html">הצהרת נגישות</a><a href="privacy.html">מדיניות פרטיות</a><a href="terms.html">תנאי שימוש</a><a href="${REPO}/issues" target="_blank" rel="noopener noreferrer">דיווח על תקלה</a></nav>
  <p><b>מקור המחירים והלוגואים:</b> <a href="https://life.cma.gov.il/" target="_blank" rel="noopener noreferrer">מחשבון ביטוח חיים של רשות שוק ההון</a>, נשלף ב-${date}. אלה המחירים המרביים שהחברות דיווחו, לפני הנחות ולפני חיתום רפואי, עבור מיליון ₪ (סכומים אחרים מחושבים באופן יחסי).</p>
  <p><b>הנחות:</b> אחוזי ההנחה נקבעים על ידך בלשונית "הנחות". ערכי ברירת המחדל לחלק מהחברות לקוחים מ<a href="https://www.poenta.co.il/article/regulations-discounts-life-insurance/" target="_blank" rel="noopener noreferrer">פואנטה, 25.10.2026</a>, ומתייחסים למסלולים מסוימים, ולכן המחיר אחרי הנחה הוא הערכה בלבד.</p>
  <p>המידע אינו ייעוץ ביטוחי ואינו הצעה לביטוח. המחיר הסופי נקבע בהצעה מחברת הביטוח או מסוכן ביטוח מורשה.</p>
  <p class="mut">© ${new Date().getFullYear()} מחירון ביטוח ריסק</p>
</div></footer>`;

function page(src, outName) {
  let t = read(src).replace(/<!--\/HEAD-->\s*/, "");
  const m = t.match(/<!--HEAD title="([^"]*)" desc="([^"]*)" path="([^"]*)"-->/);
  const [, title, desc, path] = m; t = t.replace(m[0], "");
  t = t.replace(/<!--INCLUDE ([^>]+)-->/g, (_, p) => read(p.trim()));
  t = t.replace("<!--SITEHEADER-->", header(path)).replace("<!--SITEFOOTER-->", footer);
  if (!t.includes('id="main"')) t = header(path) + `<main id="main" class="wrap doc" tabindex="-1">${t}</main>` + footer + `<script src="app.js?v=${ver}"></script>`;
  const url = SITE + (outName === "index.html" ? "" : outName);
  const html = `<!doctype html>
<html lang="he" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
${outName === "agent.html" ? '<meta name="robots" content="noindex">\n' : ""}<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:locale" content="he_IL"><meta property="og:title" content="${title}"><meta property="og:description" content="${desc}"><meta property="og:url" content="${url}">
<meta name="theme-color" content="#0E7466">
<link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="manifest" href="manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&family=Rubik:wght@500;700&display=swap">
<link rel="stylesheet" href="app.css?v=${ver}">
</head><body${outName === "index.html" ? ' class="home-page"' : ""}>
${t.split("__DATE__").join(date).split("__VER__").join(ver)}
</body></html>
`;
  const out = outName === "404.html" ? html.replace(/(href|src)="(?!https?:|#|mailto:|\/)(\.\/)?/g, '$1="/risk-prices/') : html;
  writeFileSync("docs/" + outName, out);
  return html.length;
}

mkdirSync("docs/.well-known", { recursive: true });
writeFileSync("docs/data.js", dataJs);
writeFileSync("docs/config.js", configJs);
copyFileSync("src/agent.js", "docs/agent.js");
copyFileSync("src/app.js", "docs/app.js");
copyFileSync("src/app.css", "docs/app.css");
const sizes = { "index.html": page("template.html", "index.html") };
for (const p of ["accessibility", "privacy", "terms", "404", "agent"]) sizes[p + ".html"] = page(`src/pages/${p}.html`, p + ".html");

writeFileSync("docs/favicon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M16 2 4 7v8c0 7.5 5 13.2 12 15 7-1.8 12-7.5 12-15V7z" fill="#0E7466"/><path d="m10.5 16 4 4 7-8" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>\n`);
writeFileSync("docs/manifest.webmanifest", JSON.stringify({ name: "מחירון ביטוח ריסק", short_name: "מחירון ריסק", lang: "he", dir: "rtl", start_url: "./", display: "standalone", background_color: "#F3F6F7", theme_color: "#0E7466", icons: [{ src: "favicon.svg", sizes: "any", type: "image/svg+xml" }] }, null, 1));
writeFileSync("docs/robots.txt", `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
const today = new Date().toISOString().slice(0, 10);
writeFileSync("docs/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${["", "accessibility.html", "privacy.html", "terms.html"].map(p => `<url><loc>${SITE}${p}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`);
const exp = new Date(Date.now() + 365 * 864e5).toISOString();
writeFileSync("docs/.well-known/security.txt", `Contact: ${REPO}/security/advisories/new\nContact: ${REPO}/issues\nExpires: ${exp}\nPreferred-Languages: he, en\nCanonical: ${SITE}.well-known/security.txt\n`);
writeFileSync("docs/.nojekyll", "");
console.log("built", Object.entries(sizes).map(([k, v]) => `${k} ${(v / 1024).toFixed(0)}KB`).join(", "), "| data.js", (dataJs.length / 1024).toFixed(0) + "KB", "| v" + ver);
