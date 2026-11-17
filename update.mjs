// Pulls life-insurance (risk) premiums for ages 18-69 from the Capital Market Authority calculator,
// plus company logos, then builds docs/index.html. Runs slowly on purpose: the site blocks fast bursts.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const BASE = "https://life.cma.gov.il";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const today = new Date();
const out = {}, logos = {};
const unesc = s => s.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");

async function calc(age, gender, smoking) {
  const birth = new Date(Date.UTC(today.getUTCFullYear() - age, today.getUTCMonth(), today.getUTCDate()));
  const body = { CalculationType:84300001, PremiumType:84100001, NumberOfInsured:84200001,
    ListOfInsured:[{ Gender:gender, BirthDate:birth.toISOString(), IsSmoking:smoking, ID:1, Age:age }],
    ListOfTracks:[], DesiredSum:1000000, DesiredPeriod:20, SortField:"", SortDirection:"asc" };
  for (let k = 0; k < 4; k++) {
    try {
      const r = await fetch(BASE + "/RiskParameters/CalculateRiskRates", { method:"POST", headers:{ "Content-Type":"application/json", "User-Agent":"Mozilla/5.0", "X-Requested-With":"XMLHttpRequest" }, body: JSON.stringify(body) });
      const html = await r.text();
      const tag = html.match(/<[^>]*id="graphInfo"[^>]*>/);
      const m = tag && tag[0].match(/data-graphresults="([^"]*)"/);
      const rows = m ? JSON.parse(unesc(m[1])) : [];
      for (const im of html.matchAll(/<img[^>]*alt="([^"]+)"[^>]*src="\/Content\/Images\/Companies\/(\d+)\.png/g)) if (!im[1].startsWith("//")) logos[im[1]] = Number(im[2]);
      return rows.map(c => [c.CompanyName, c.MonthlyPremiumsDec.map(v => Math.round(+v * 100) / 100)]);
    } catch (e) { await sleep(5000 * (k + 1)); }
  }
  throw new Error("failed " + age + "/" + gender + "/" + smoking);
}

for (let age = 18; age <= 69; age++)
  for (const [g, gk] of [[84400001,"m"],[84400002,"f"]])
    for (const s of [false, true]) {
      out[age + "|" + gk + "|" + (s ? 1 : 0)] = await calc(age, g, s);
      await sleep(3000);
      process.stdout.write(age + gk + (s ? 1 : 0) + " ");
    }
const logoData = {};
for (const [name, id] of Object.entries(logos)) {
  const buf = Buffer.from(await (await fetch(BASE + "/Content/Images/Companies/" + id + ".png")).arrayBuffer());
  logoData[name] = "data:image/png;base64," + buf.toString("base64");
  await sleep(1000);
}
// sanity check: refuse to overwrite good data with a broken run
const filled = Object.values(out).filter(v => v.length).length;
if (filled < 150) { console.error("too few profiles (" + filled + "), keeping old data"); process.exit(1); }
writeFileSync("data.json", JSON.stringify({ fetchedAt: today.toISOString(), prices: out, logos: logoData }));
console.log("\nok", filled, "profiles");

// ---- build the page from template.html (discounts live inside it, block DISCOUNTS) ----
const comp = [], D = {};
for (const [k, rows] of Object.entries(out).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))) {
  if (!rows.length) continue;
  D[k] = rows.map(([name, arr]) => { if (!comp.includes(name)) comp.push(name); return [comp.indexOf(name), arr]; });
}
const date = today.toLocaleDateString("he-IL", { timeZone: "Asia/Jerusalem" });
let t = readFileSync("template.html", "utf8");
t = t.replace("__DATA__", () => JSON.stringify(D)).replace("__COMPANIES__", () => JSON.stringify(comp))
     .replace("__LOGOS__", () => JSON.stringify(logoData)).split("__DATE__").join(date);
const i = t.indexOf('<div class="wrap"');
const html = "<!doctype html>\n<html lang=\"he\" dir=\"rtl\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">\n" + t.slice(0, i) + "</head><body>\n" + t.slice(i) + "</body></html>";
mkdirSync("docs", { recursive: true });
writeFileSync("docs/index.html", html);
console.log("built docs/index.html", html.length, "bytes");
