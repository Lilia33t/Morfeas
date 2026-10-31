// Screen test at phone width (360 px), at 100% and 130% text size.
// Opens every drug, tool, checklist and paediatric pane and fails if any text
// runs outside the screen or outside its card, or if any button is smaller than
// 44 x 44 px (touch target, Apple HIG; WCAG 2.5.5).
//
// Needs Playwright with Chromium:   npm i -D playwright && npx playwright install chromium
// Run from the repository folder:   node tests/ui-360.mjs
//
// React normally comes from cdnjs. Without internet access, put the two React
// 18.3.1 UMD files in a folder and pass it:  REACT_DIR=/path/to/folder node tests/ui-360.mjs
// (the integrity hashes in index.html are checked by the browser, so they must be the real files).
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const PORT = 8123;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".png": "image/png", ".woff": "font/woff", ".webmanifest": "application/manifest+json", ".json": "application/json" };
const server = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split("?")[0]).replace(/^\/Morfeas/, "");
  let f = path.join(ROOT, u.endsWith("/") ? u + "index.html" : u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" });
  res.end(fs.readFileSync(f));
}).listen(PORT);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2 });
if (process.env.REACT_DIR) {
  await ctx.route("https://cdnjs.cloudflare.com/**", (r) => {
    const name = r.request().url().includes("react-dom") ? "react-dom.production.min.js" : "react.production.min.js";
    r.fulfill({ status: 200, headers: { "content-type": "application/javascript", "access-control-allow-origin": "*" }, body: fs.readFileSync(path.join(process.env.REACT_DIR, name)) });
  });
}
// Skip the first-use notice and the "what's new" dialog.
await ctx.addInitScript(() => {
  try {
    const J = (v) => JSON.stringify({ v, exp: null });
    localStorage.setItem("aa_disclaimer_ok", J(2));
    localStorage.setItem("aa_seen_ver", J(99999));
  } catch (e) {}
});
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(`http://localhost:${PORT}/Morfeas/`);
await page.waitForSelector('div[style*="sticky"] button', { timeout: 20000 });

const tab = (i) => page.locator('div[style*="sticky"] button').nth(i);
const fill = async (label, v) => page.fill(`input[aria-label^="${label}"]`, v);
// Elements whose right edge passes the screen or their clipping card; horizontal scroll strips are allowed.
const overflow = () => page.evaluate(() => {
  const W = document.documentElement.clientWidth, bad = [];
  document.querySelectorAll("#root *").forEach((e) => {
    const r = e.getBoundingClientRect();
    if (!(r.width > 0) || e.children.length) return;
    let q = e.parentElement, lim = W, scroll = false;
    while (q) {
      const o = getComputedStyle(q).overflowX;
      if (o === "auto" || o === "scroll") { scroll = true; break; }
      if (o === "hidden") { lim = Math.min(lim, q.getBoundingClientRect().right); break; }
      q = q.parentElement;
    }
    if (!scroll && r.right > lim + 1) bad.push((e.innerText || "").slice(0, 50).replace(/\n/g, " "));
  });
  return { width: document.documentElement.scrollWidth, bad };
});
// Touch targets: buttons, links and checkboxes/radios/sliders (a checkbox counts with its label).
const small = () => page.evaluate(() => [...document.querySelectorAll("#root button, #root [role=button], #root a[href], #root input[type=checkbox], #root input[type=radio], #root input[type=range], #root select")]
  .map((b) => (b.type === "checkbox" || b.type === "radio") && b.closest("label") ? b.closest("label") : b)
  .filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && (r.height < 44 || r.width < 44); }).length);
const smallList = () => page.evaluate(() => [...document.querySelectorAll("#root button, #root [role=button], #root a[href], #root input[type=checkbox], #root input[type=radio], #root input[type=range], #root select")]
  .map((b) => (b.type === "checkbox" || b.type === "radio") && b.closest("label") ? b.closest("label") : b)
  .filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && (r.height < 44 || r.width < 44); })
  .map((b) => b.tagName + " " + Math.round(b.getBoundingClientRect().width) + "x" + Math.round(b.getBoundingClientRect().height) + " " + (b.getAttribute("aria-label") || b.innerText || b.getAttribute("href") || "").slice(0, 40)));

const failures = [];
let smallMax = 0;
const check = async (where) => {
  const o = await overflow();
  if (o.width > 360 || o.bad.length) failures.push(`${where}: ${o.bad.slice(0, 2).join(" | ") || "page wider than 360 px"}`);
  const sm = await small();
  if (sm > 0 && process.env.UI_LIST_SMALL) console.log(where, (await smallList()).join(" | "));
  smallMax = Math.max(smallMax, sm);
};
const openEach = async (where) => {
  const items = page.locator('#root div[style*="overflow: hidden"] > div[data-row] > button:first-child');
  const n = await items.count();
  for (let i = 0; i < n; i++) {
    await items.nth(i).click();
    await page.waitForTimeout(60);
    await check(`${where} #${i + 1} ${(await items.nth(i).innerText()).split("\n")[0]}`);
  }
  return n;
};

for (const zoomSteps of [0, 2]) {
  for (let k = 0; k < zoomSteps; k++) await page.click('[aria-label="Μεγαλύτερα γράμματα"]');
  const z = zoomSteps ? "130%" : "100%";
  await fill("Βάρος", "70"); await fill("Ηλικία", "45");
  await tab(0).click(); await check(`${z} home`);
  await tab(1).click(); const nd = await openEach(`${z} drug`);
  await tab(2).click();
  const groups = page.locator('#root button[style*="padding: 8px 4px 2px"]');
  for (let i = 0, n = await groups.count(); i < n; i++) await groups.nth(i).click();
  const nt = await openEach(`${z} tool`);
  await tab(4).click(); const nl = await openEach(`${z} checklist`);
  await fill("Βάρος", "18"); await fill("Ηλικία", "5");
  await tab(3).click();
  const panes = page.locator("#root button").filter({ hasText: /^(Προεγχειρητικά|Ζωτικά|Επείγοντα|Κρίσεις|Αναλγησία|Ανάπτυξη)$/ });
  const np = await panes.count();
  for (let i = 0; i < np; i++) { await panes.nth(i).click(); await page.waitForTimeout(80); await check(`${z} paediatric pane ${i + 1}`); }
  console.log(`${z}: ${nd} drugs, ${nt} tools, ${nl} checklists, ${np} paediatric panes checked`);
  for (let k = 0; k < zoomSteps; k++) await page.click('[aria-label="Μικρότερα γράμματα"]');
}

await browser.close();
server.close();
if (errors.length) failures.push("page errors: " + errors.slice(0, 3).join(" | "));
console.log(`Buttons under 44 px on the busiest screen: ${smallMax}`);
if (smallMax > 0) failures.push(`${smallMax} button(s) smaller than 44 x 44 px`);
if (failures.length) {
  console.log("UI 360 px FAILED:\n  - " + failures.slice(0, 20).join("\n  - "));
  process.exit(1);
}
console.log("UI 360 px OK: nothing runs outside the screen or its card; every button is at least 44 x 44 px");
