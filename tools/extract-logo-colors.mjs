/**
 * Script UNA TANTUM — estrazione colori dominanti dai loghi dei brand.
 *
 * Uso:  node tools/extract-logo-colors.mjs   (script dev-only, fuori dai workspace)
 *
 * Per ogni logo in /public/assets stampa:
 *   - i colori più FREQUENTI (escludendo trasparenza e neutri grigi)
 *   - i colori più VIVIDI (saturazione × frequenza) = il candidato "accent" del brand
 *
 * Serve solo a scegliere i token colore in app/tokens.css. Non gira a runtime.
 * Dipendenza dev: sharp.
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, "..", "public", "assets");

const LOGOS = [
  { name: "GM Solar", file: "gm-solar-logo.png" },
  { name: "GMobility", file: "gmobility-logo.png" },
  { name: "Cavo Perfetto", file: "cavo-perfetto-logo.png" },
];

/** RGB → HSV (h in [0,360), s/v in [0,1]). */
function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

const toHex = (r, g, b) => "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");

async function analyze({ name, file }) {
  const { data, info } = await sharp(path.join(ASSETS, file))
    .resize(160, 160, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels; // 4 (RGBA)
  const buckets = new Map(); // chiave colore quantizzato → { count, r, g, b, s, v }

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 128) continue; // salta pixel trasparenti

    const { s, v } = rgbToHsv(r, g, b);
    // Quantizza a step di 24 per raggruppare tonalità simili.
    const q = 24;
    const key = `${Math.round(r / q)}-${Math.round(g / q)}-${Math.round(b / q)}`;
    const bucket = buckets.get(key);
    if (bucket) bucket.count++;
    else buckets.set(key, { count: 1, r, g, b, s, v });
  }

  const all = [...buckets.values()];
  const totale = all.reduce((sum, c) => sum + c.count, 0);

  // Colori cromatici = saturazione e luminosità sufficienti (esclude bianco/nero/grigi).
  const cromatici = all.filter((c) => c.s > 0.25 && c.v > 0.2);

  const perFrequenza = [...cromatici].sort((a, b) => b.count - a.count).slice(0, 5);
  const perVividezza = [...cromatici].sort((a, b) => b.s * b.count - a.s * a.count).slice(0, 5);

  const fmt = (c) =>
    `${toHex(c.r, c.g, c.b)}  sat ${(c.s * 100).toFixed(0)}%  val ${(c.v * 100).toFixed(0)}%  (${((c.count / totale) * 100).toFixed(1)}% px)`;

  console.log(`\n=== ${name}  (${file}) ===`);
  console.log("  Più frequenti (cromatici):");
  perFrequenza.forEach((c) => console.log("    " + fmt(c)));
  console.log("  Più vividi (candidato accent):");
  perVividezza.forEach((c) => console.log("    " + fmt(c)));
}

for (const logo of LOGOS) {
  try {
    await analyze(logo);
  } catch (err) {
    console.error(`Errore su ${logo.file}:`, err.message);
  }
}
console.log("");
