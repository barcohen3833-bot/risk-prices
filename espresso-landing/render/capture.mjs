// Renders the watch scene frame by frame with headless Chromium.
// usage: node capture.mjs <outDir> <frames> [w] [h] [onlyT,comma-separated]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = path.dirname(new URL(import.meta.url).pathname);
const [out = 'png', N = '144', W = '1920', H = '1080', only] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.jpg': 'image/jpeg' };
const srv = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(root) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const port = srv.address().port;

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: +W, height: +H } });
page.on('console', m => console.log('[page]', m.text()));
page.on('pageerror', e => console.log('[err]', e.message));
await page.goto(`http://localhost:${port}/${process.env.SCENE || "scene.html"}?w=${W}&h=${H}`);
await page.waitForFunction(() => window.ready, null, { timeout: 60000 });
const ts = only ? only.split(',').map(Number) : [...Array(+N).keys()].map(i => i / (+N - 1));
let i = 0;
for (const t of ts) {
  const data = await page.evaluate(t => { window.renderAt(t); return document.querySelector('canvas').toDataURL('image/png'); }, t);
  fs.writeFileSync(path.join(out, `f_${String(++i).padStart(4, '0')}.png`), Buffer.from(data.split(',')[1], 'base64'));
  if (i % 12 === 0) console.log('frame', i, '/', ts.length);
}
await browser.close(); srv.close();
console.log('done', i);
