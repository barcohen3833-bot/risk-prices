// Generates src/guilloche.svg: a security-print rosette (overlapping hypotrochoid/epitrochoid curves).
import { writeFileSync } from "node:fs";
const C = 600, paths = [];
function curve(R, r, d, scale, turns, steps, rot = 0) {
  let s = "";
  for (let k = 0; k <= steps; k++) {
    const t = (k / steps) * Math.PI * 2 * turns;
    const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
    const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
    const a = rot, X = x * Math.cos(a) - y * Math.sin(a), Y = x * Math.sin(a) + y * Math.cos(a);
    s += (k ? " " : "M") + Math.round(C + X * scale) + " " + Math.round(C + Y * scale);
  }
  return s;
}
// outer band: dense waves
for (let i = 0; i < 3; i++) paths.push([curve(1, 1 / 48, 0.055 + i * 0.008, 2*(262 - i * 7), 1, 1500, i * 0.012), 0.55]);
// main rosette: 3 nested families
for (let i = 0; i < 6; i++) paths.push([curve(1, 13 / 36, 0.62, 2*(190 - i * 3.4), 13, 1500, i * 0.04), 0.5]);
for (let i = 0; i < 4; i++) paths.push([curve(1, 7 / 30, 0.48, 2*(120 - i * 4), 7, 900, i * 0.07), 0.55]);
// inner ring
for (let i = 0; i < 3; i++) paths.push([curve(1, 1 / 30, 0.08 + i * 0.012, 2*(66 - i * 4), 1, 600, i * 0.05), 0.6]);
const body = paths.map(([d, w]) => `<path d="${d}" stroke-width="${w*2}"/>`).join("");
writeFileSync("src/guilloche.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" fill="none" stroke="#000" stroke-linejoin="round">${body}</svg>\n`);
console.log("guilloche.svg", (body.length / 1024).toFixed(0) + "KB");
