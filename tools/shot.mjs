/**
 * @descrizione  Screenshot dev-only via puppeteer-core + Chrome di sistema.
 *   Emula prefers-reduced-motion:reduce → IntroOverlay off, auto-scroll off,
 *   le scene immersive mostrano lo STATO FINALE statico (così la pagina sta
 *   ferma e si può catturare una sezione precisa). Uso:
 *     node tools/shot.mjs <url> <outPng> [selettoreCss] [vw] [vh]
 */
import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const [, , url, out, sel, show, vw = "1440", vh = "900"] = process.argv;

if (!url || !out) {
  console.error("uso: node tools/shot.mjs <url> <outPng> [selettore] [vw] [vh]");
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", `--window-size=${vw},${vh}`],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: Number(vw), height: Number(vh) });
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 600));
  if (sel) {
    await page.$eval(sel, (el) => el.scrollIntoView({ block: "start" }));
    await new Promise((r) => setTimeout(r, 900));
  }
  if (show) {
    await page.$eval(show, (el) => {
      el.style.opacity = "1";
      el.style.visibility = "visible";
    });
    await new Promise((r) => setTimeout(r, 200));
  }
  await page.screenshot({ path: out });
  console.log("shot:", out);
} finally {
  await browser.close();
}
