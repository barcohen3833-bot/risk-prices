// Rewrites absolute /_next/ paths in out/ to relative ones, so the static
// export works from any sub-path (zip handoff, file hosting, previews).
import fs from 'node:fs';
import path from 'node:path';
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
for (const f of walk('out')) {
  const ext = path.extname(f);
  if (!['.html', '.js', '.css', '.txt'].includes(ext)) continue;
  let s = fs.readFileSync(f, 'utf8'), o = s;
  if (ext === '.css') s = s.replaceAll('url(/_next/static/media/', 'url(../media/');
  else s = s.replaceAll('"/_next/', '"./_next/').replaceAll("'/_next/", "'./_next/");
  if (s !== o) fs.writeFileSync(f, s);
}
console.log('relativized');
