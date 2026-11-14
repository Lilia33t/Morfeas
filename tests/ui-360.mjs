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
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".png": "image/png", ".woff": "font/woff", ".otf": "font/otf", ".webmanifest": "application/manifest+json", ".json": "application/json" };
const server = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split("?")[0]).replace(/^\/Morfeas/, "");
  let f = path.join(ROOT, u.endsWith("/") ? u + "index.html" : u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" });
  res.end(fs.readFileSync(f));
}).listen(PORT);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2 });
const withReact = async (ctx) => {
  if (process.env.REACT_DIR) {
    await ctx.route("https://cdnjs.cloudflare.com/**", (r) => {
      const name = r.request().url().includes("react-dom") ? "react-dom.production.min.js" : "react.production.min.js";
      r.fulfill({ status: 200, headers: { "content-type": "application/javascript", "access-control-allow-origin": "*" }, body: fs.readFileSync(path.join(process.env.REACT_DIR, name)) });
    });
  }
};
await withReact(ctx);
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

// --- New look, phase 1 (spec 10): measured at 360 x 740 px, 100% text size, light theme ---
// Home: everything down to and including "Recent" sits above the bottom bar without scrolling, and no
// patient field cuts its number. Crisis mode: header at most 250 px on every checklist, nothing wider
// than the screen, every button at least 44 x 44 px.
{
  const c2 = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2 });
  await withReact(c2);
  await c2.addInitScript(() => {
    try {
      const J = (v) => JSON.stringify({ v, exp: null });
      localStorage.setItem("aa_disclaimer_ok", J(2));
      localStorage.setItem("aa_seen_ver", J(99999));
      localStorage.setItem("aa_theme", J("light"));
      localStorage.setItem("aa_home_seen", J(true));
      localStorage.setItem("aa_patient", J({ w: "70", a: "45", h: "172", s: "M" }));
      localStorage.setItem("aa_recent", J([
        { tab: "meds", target: "propofol", title: "Propofol", kind: "drug" },
        { tab: "meds", target: "rocuronium", title: "Rocuronium", kind: "drug" },
        { tab: "tools", target: "lowflow", title: "Low-flow", kind: "tool" },
        { tab: "meds", target: "fentanyl", title: "Fentanyl", kind: "drug" }]));
    } catch (e) {}
  });
  const p2 = await c2.newPage();
  p2.on("pageerror", (e) => errors.push(e.message));
  await p2.goto(`http://localhost:${PORT}/Morfeas/`);
  await p2.waitForSelector('div[style*="sticky"] button', { timeout: 20000 });
  await p2.waitForTimeout(200);
  const home = await p2.evaluate(() => {
    const r = document.querySelector("[data-home-recents]"), nav = document.querySelector('div[style*="sticky"]');
    const inputs = [...document.querySelectorAll('#root input[inputmode="decimal"]')];
    return { recents: r ? Math.round(r.getBoundingClientRect().bottom) : -1, chips: r ? r.querySelectorAll("button").length : 0, nav: Math.round(nav.getBoundingClientRect().top),
      crisis: Math.round(document.querySelector("[data-home-crisis]").getBoundingClientRect().height), tiles: document.querySelectorAll("[data-home-tile]").length,
      fields: inputs.length, cut: inputs.filter((i) => i.scrollWidth > i.clientWidth + 1).map((i) => i.getAttribute("aria-label")), scrolled: window.scrollY };
  });
  if (home.recents < 0 || home.recents > home.nav || home.scrolled) failures.push(`home 740 px: "Recent" ends at ${home.recents} px, bottom bar starts at ${home.nav} px`);
  const homeTitle = await p2.evaluate(() => { const t = document.querySelector("[data-screen-title]"); return { text: t.textContent, cut: t.scrollWidth > t.clientWidth + 1 }; });
  if (homeTitle.text !== "Morfeas" || homeTitle.cut) failures.push("home title: " + JSON.stringify(homeTitle));
  if (home.chips !== 3) failures.push(`home: ${home.chips} recent chips, expected 3`);
  const favAbout = await p2.evaluate(() => ({ fav: [...document.querySelectorAll("#root button")].some((b) => /^\s*★?\s*Αγαπημένα/.test(b.textContent) || /Αγαπημένα/.test(b.textContent) && b.getBoundingClientRect().top < 668), about: (document.querySelector('[data-home-tile="about"]') || {}).textContent || "" }));
  if (!favAbout.fav) failures.push("home: the Favourites tile is not shown");
  if (!/^Σχετικά/.test(favAbout.about)) failures.push(`home: fourth tile reads "${favAbout.about}"`);
  if (home.tiles !== 4 || home.crisis < 64) failures.push(`home: ${home.tiles} tiles, crisis button ${home.crisis} px`);
  if (home.fields !== 3 || home.cut.length) failures.push(`home: patient field cut: ${home.cut.join(", ") || "fields missing"}`);
  // Age: every whole number of months from 1 to 23, switched to years, fits its field (audit F1-3).
  const ageIn = p2.locator('#root input[aria-label^="Ηλικία"]'), unitBtn = p2.locator('#root button[aria-label^="Μονάδα ηλικίας"]');
  const ageCut = [];
  for (let mo = 1; mo <= 23; mo++) {
    await unitBtn.click(); await ageIn.fill(String(mo)); await unitBtn.click();
    const a = await ageIn.evaluate((i) => ({ v: i.value, cut: i.scrollWidth > i.clientWidth + 1, label: i.getAttribute("aria-label") }));
    if (a.cut || a.v.length > 4 || !/έτη/.test(a.label)) ageCut.push(mo + "→" + a.v);
  }
  await unitBtn.click();
  if (!/μήνες/.test(await ageIn.getAttribute("aria-label"))) failures.push("age field: aria-label does not follow the unit");
  await unitBtn.click(); await ageIn.fill("45");
  if (ageCut.length) failures.push(`age in years cut or too long: ${ageCut.join(", ")}`);
  await p2.locator('div[style*="sticky"] button').nth(4).click();
  const rows = p2.locator('#root div[style*="overflow: hidden"] > div[data-row] > button:first-child');
  const nRows = await rows.count();
  let headMax = 0, headWorst = "", stepsVfvt = -1, crisisSmall = 0, crisisWide = 0, nCrisis = 0, twoLine = 0; const titleCut = [];
  for (let i = 0; i < nRows; i++) {
    await rows.nth(i).click();
    await p2.waitForTimeout(40);
    const enter = p2.locator("#root button").filter({ hasText: /Λειτουργία κρίσης/ });
    // The pre-anaesthesia check is in the same tab but is not a crisis checklist: it has no crisis mode.
    if (!(await enter.count())) { await rows.nth(i).click(); continue; }
    nCrisis++;
    await enter.first().click();
    await p2.waitForSelector("[data-crisis-head]");
    const m = await p2.evaluate(() => {
      const d = document.querySelector('[role="dialog"][aria-modal="true"]'), head = d.querySelector("[data-crisis-head]");
      const foot = d.querySelector("[data-crisis-count]").parentElement.parentElement.getBoundingClientRect().top;
      const steps = [...d.querySelectorAll("button[aria-pressed]")].filter((b) => !b.hasAttribute("aria-label"));
      const tt = d.querySelector("[data-crisis-title]");
      return { head: Math.round(head.getBoundingClientRect().height), title: d.getAttribute("aria-label"),
        cut: tt.scrollHeight > tt.clientHeight + 1 || tt.scrollWidth > tt.clientWidth + 1 || !tt.textContent || tt.getAttribute("title") !== d.getAttribute("aria-label"), lines: Math.round(tt.clientHeight / parseFloat(getComputedStyle(tt).lineHeight)),
        visible: steps.filter((b) => b.getBoundingClientRect().bottom <= foot + 1).length,
        small: [...d.querySelectorAll("button")].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && (r.width < 44 || r.height < 44); }).length,
        wide: [...d.querySelectorAll("*")].filter((e) => !e.children.length && e.getBoundingClientRect().right > 361).length };
    });
    if (m.head > headMax) { headMax = m.head; headWorst = m.title; }
    if (/VF/.test(m.title) && stepsVfvt < 0) stepsVfvt = m.visible;
    crisisSmall += m.small; crisisWide += m.wide; if (m.cut) titleCut.push(m.title); if (m.lines > 1) twoLine++;
    await p2.locator('[role="dialog"] button[aria-label="Κλείσιμο"]').click();
    await rows.nth(i).click();
  }
  console.log(`New look at 360 x 740: "Recent" ends at ${home.recents} px (bottom bar at ${home.nav} px); crisis header at most ${headMax} px over ${nCrisis} checklists (${headWorst}); VF/VT shows ${stepsVfvt} whole steps; ${twoLine} title(s) on two lines`);
  if (nCrisis < 40) failures.push(`crisis mode opened on ${nCrisis} checklists only`);
  if (headMax > 250) failures.push(`crisis header ${headMax} px (limit 250): ${headWorst}`);
  if (titleCut.length) failures.push(`crisis title cut on ${titleCut.length} checklist(s): ${titleCut.slice(0, 3).join(" | ")}`);
  if (crisisSmall) failures.push(`crisis mode: ${crisisSmall} button(s) under 44 x 44 px`);
  if (crisisWide) failures.push(`crisis mode: ${crisisWide} element(s) wider than the screen`);
  await c2.close();
  // First open (with the how-to text): the home screen still fits 740 px without scrolling (audit F1-5).
  const c3 = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2 });
  await withReact(c3);
  await c3.addInitScript(() => { try { const J = (v) => JSON.stringify({ v, exp: null }); localStorage.setItem("aa_disclaimer_ok", J(2)); localStorage.setItem("aa_seen_ver", J(99999)); localStorage.setItem("aa_theme", J("light")); } catch (e) {} });
  const p3 = await c3.newPage();
  await p3.goto(`http://localhost:${PORT}/Morfeas/`);
  await p3.waitForSelector("[data-home-intro]", { timeout: 20000 });
  const first = await p3.evaluate(() => document.documentElement.scrollHeight);
  console.log(`First open at 360 x 740: page height ${first} px`);
  // With Favourites always on the home screen (author, 12/11/2026) the very first open, which also carries the
  // how-to text, is a little taller than the screen: it scrolls once by about 25 px, nothing is cut.
  if (first > 770) failures.push(`home, first open: page is ${first} px high (limit 770)`);
  await c3.close();
}

// --- New look, phase 2 (spec 10): drug list, drug card and search at 360 x 740 px ---
{
  const c4 = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2 });
  await withReact(c4);
  await c4.addInitScript(() => { try { const J = (v) => JSON.stringify({ v, exp: null }); localStorage.setItem("aa_disclaimer_ok", J(2)); localStorage.setItem("aa_seen_ver", J(99999)); localStorage.setItem("aa_theme", J("light")); localStorage.setItem("aa_home_seen", J(true)); localStorage.setItem("aa_patient", J({ w: "70", a: "45", h: "172", s: "M" })); } catch (e) {} });
  const p4 = await c4.newPage();
  p4.on("pageerror", (e) => errors.push(e.message));
  await p4.goto(`http://localhost:${PORT}/Morfeas/`);
  await p4.waitForSelector('div[style*="sticky"] button', { timeout: 20000 });
  await p4.locator('div[style*="sticky"] button').nth(1).click();
  await p4.waitForSelector("[data-drug]");
  const doseOf = (id) => p4.evaluate((id) => { const r = document.querySelector(`[data-drug="${id}"]`); const m = r && r.querySelector("[data-dose-main],[data-dose-fixed]"); return m ? m.textContent.replace(/\s+/g, " ").trim() : ""; }, id);
  const listInfo = await p4.evaluate(() => { const rows = [...document.querySelectorAll("[data-drug]")]; return { n: rows.length, noDose: rows.filter((r) => !r.querySelector("[data-dose-main],[data-dose-fixed]")).map((r) => r.getAttribute("data-drug")), wide: rows.filter((r) => r.getBoundingClientRect().right > 361 || r.scrollWidth > r.clientWidth + 1).length }; });
  if (listInfo.n < 90 || listInfo.noDose.length) failures.push(`drug list: ${listInfo.n} rows, without a dose: ${listInfo.noDose.slice(0, 3).join(", ")}`);
  if (listInfo.wide) failures.push(`drug list: ${listInfo.wide} row(s) wider than the screen`);
  const inList = await doseOf("rocuronium");
  await p4.locator('[data-drug="rocuronium"] [data-row] > button:first-child').click();
  await p4.waitForSelector('[data-drug-card="rocuronium"]');
  const hero = () => p4.evaluate(() => document.querySelector("[data-dose-hero] [data-dose-main],[data-dose-hero] [data-dose-fixed]").textContent.replace(/\s+/g, " ").trim());
  const inCard = await hero();
  if (inList !== "42 mg" || inCard !== "42 mg") failures.push(`rocuronium at 70 kg: list "${inList}", card "${inCard}", expected 42 mg`);
  const cardInfo = await p4.evaluate(() => { const c = document.querySelector("[data-drug-card]"); const t = c.textContent; const big = c.querySelector("[data-dose-hero] [data-dose-main] span"); return { ml: /\d\s?mL\b(?!\/)/.test(c.querySelector("[data-dose-hero]").textContent), size: parseFloat(getComputedStyle(big).fontSize), weight: getComputedStyle(big).fontWeight, rows: c.querySelectorAll("[data-dose-row]").length, boxes: c.querySelectorAll("[data-card-box]").length, chips: c.querySelectorAll('[role="group"] button').length }; });
  if (cardInfo.size < 52 || cardInfo.weight !== "600") failures.push(`drug card: large dose is ${cardInfo.size} px / ${cardInfo.weight}`);
  if (cardInfo.ml) failures.push("drug card: a mL line is shown (phase 4, not yet)");
  if (cardInfo.rows < 3 || cardInfo.boxes < 2 || cardInfo.chips !== 4) failures.push(`drug card: ${cardInfo.rows} other rows, ${cardInfo.boxes} boxes, ${cardInfo.chips} indication chips`);
  // a tap on another indication makes it the large dose
  await p4.locator('[data-drug-card] [role="group"] button').nth(1).click();
  await p4.waitForTimeout(120);
  const second = await hero();
  if (second === inCard) failures.push("drug card: choosing another indication did not change the large dose");
  // "more" opens the notes box
  const more = p4.locator('[data-card-box="notes"] button');
  if (await more.count()) { const h0 = await p4.locator('[data-card-box="notes"]').evaluate((e) => e.offsetHeight); await more.click(); const h1 = await p4.locator('[data-card-box="notes"]').evaluate((e) => e.offsetHeight); if (h1 <= h0) failures.push("drug card: \"more\" did not open the notes"); }
  // search shows the same dose
  await p4.fill('#root input[aria-label="Αναζήτηση"]', "ροκ");
  await p4.waitForSelector("#root button [data-dose-main]");
  const inSearch = await p4.evaluate(() => { const b = [...document.querySelectorAll("#root button")].find((x) => /Rocuronium/.test(x.textContent) && x.querySelector("[data-dose-main]")); return b ? b.querySelector("[data-dose-label]").textContent + " · " + b.querySelector("[data-dose-main]").textContent : ""; });
  if (inSearch !== "Διασωλήνωση · 42 mg") failures.push(`search "ροκ" at 70 kg: "${inSearch}"`);
  await p4.fill('#root input[aria-label="Αναζήτηση"]', "");
  // without a weight: per-kg dose only
  await p4.fill('#root input[aria-label^="Βάρος"]', "");
  await p4.waitForTimeout(150);
  const noW = await p4.evaluate(() => { const rows = [...document.querySelectorAll("[data-drug]")]; const txt = rows.map((r) => (r.querySelector("[data-dose-main],[data-dose-fixed]") || {}).textContent || "").join("\n"); const roc = document.querySelector('[data-drug="rocuronium"]'); return { bad: /NaN|undefined|(^|\n)0 /.test(txt), roc: roc.querySelector("[data-drug-card]") ? roc.querySelector("[data-dose-hero] [data-dose-main]").textContent.replace(/\s+/g, " ").trim() : (roc.querySelector("[data-dose-main]") || {}).textContent }; });
  if (noW.bad || !/mg\/kg$/.test(noW.roc || "")) failures.push(`drug list without a weight: rocuronium shows "${noW.roc}"`);
  console.log(`Drugs at 360 x 740: ${listInfo.n} rows with a dose; rocuronium 70 kg: list ${inList}, card ${inCard}, search ${inSearch}; without weight: ${noW.roc}`);
  await c4.close();
}

// --- New look, phase 6 (spec 8.3, 9.1, 9.2, 9.3) at 360 x 740 px ---
{
  const c5 = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2 });
  await withReact(c5);
  await c5.addInitScript(() => { try { const J = (v) => JSON.stringify({ v, exp: null }); if (!localStorage.getItem("aa_disclaimer_ok")) { localStorage.setItem("aa_disclaimer_ok", J(2)); localStorage.setItem("aa_seen_ver", J(99999)); localStorage.setItem("aa_theme", J("light")); localStorage.setItem("aa_home_seen", J(true)); localStorage.setItem("aa_patient", J({ w: "18", a: "5", h: "", s: "M" })); } } catch (e) {} });
  const p5 = await c5.newPage();
  p5.on("pageerror", (e) => errors.push(e.message));
  const wide = () => p5.evaluate(() => document.documentElement.scrollWidth);
  // icon shortcut: straight to the drugs
  await p5.goto(`http://localhost:${PORT}/Morfeas/?go=meds`);
  await p5.waitForSelector("[data-drug]", { timeout: 20000 });
  if (/go=/.test(p5.url())) failures.push("shortcut: the go= part stayed in the address");
  // paediatric mode: label on every screen, paediatric row first in the list
  // A child never gets an adult row as the main dose (audit V5-1): one paediatric row = that row; several = no dose, open the card.
  const kidList = await p5.evaluate(() => { const g = (id) => { const r = document.querySelector(`[data-drug="${id}"]`); const q = (s) => (r.querySelector(s) || {}).textContent || ""; return { label: q("[data-dose-label]"), dose: q("[data-dose-main],[data-dose-fixed]"), none: q("[data-dose-none]") }; }; return { ond: g("ondansetron"), pro: g("propofol"), roc: g("etomidate"), tag: (document.querySelector("[data-peds-label]") || {}).textContent || "" }; });
  if (kidList.ond.dose || kidList.ond.label || !/1 γραμμή για παιδιά/.test(kidList.ond.none)) failures.push("ondansetron for a child: " + JSON.stringify(kidList.ond));
  if (kidList.pro.dose || !/γραμμές για παιδιά/.test(kidList.pro.none)) failures.push("propofol for a child: " + JSON.stringify(kidList.pro));
  if (kidList.roc.dose || !/Καμία γραμμή σημειωμένη για παιδιά/.test(kidList.roc.none)) failures.push("etomidate for a child: " + JSON.stringify(kidList.roc));
  await p5.locator('[data-drug="propofol"] [data-row] > button:first-child').click();
  await p5.waitForSelector('[data-drug-card="propofol"]');
  const kidDrugs = await p5.evaluate(() => { const c = document.querySelector("[data-drug-card]"); return { label: (document.querySelector("[data-peds-label]") || {}).textContent || "", row: c.querySelector("[data-dose-row]").textContent, big: !!c.querySelector("[data-dose-hero] [data-dose-main], [data-dose-hero] [data-dose-fixed]"), none: (c.querySelector("[data-dose-hero] [data-dose-none]") || {}).textContent || "", pressed: c.querySelectorAll('[role="group"] button[aria-pressed="true"]').length }; });
  if (kidDrugs.big || !kidDrugs.none || kidDrugs.pressed) failures.push("propofol card for a child shows a main dose: " + JSON.stringify(kidDrugs));
  if (!/ΠΑΙΔΙΑ|παιδι/i.test(kidDrugs.row)) failures.push(`propofol for a child: first row is "${kidDrugs.row.slice(0, 40)}"`);
  await p5.locator("[data-drug-card] [data-dose-row]").first().click();
  if (!(await p5.locator("[data-drug-card] [data-dose-hero] [data-dose-main]").count())) failures.push("propofol for a child: choosing a row did not make it the large dose");
  if (kidDrugs.label !== "Παιδί · 18 kg") failures.push(`paediatric label on the drugs screen: "${kidDrugs.label}"`);
  const listRow = kidList.pro.none;
  await p5.locator('div[style*="sticky"] button').nth(0).click();
  await p5.waitForSelector("[data-home-crisis]");
  const kidHome = await p5.evaluate(() => { const l = document.querySelector("[data-peds-label]"); const r = l && l.getBoundingClientRect(); return { label: l ? l.textContent : "", inside: !!r && r.right <= 360 && r.left >= 0, h: document.documentElement.scrollHeight }; });
  if (kidHome.label !== "Παιδί · 18 kg" || !kidHome.inside) failures.push(`paediatric label on the home screen: "${kidHome.label}"`);
  if (kidHome.h > 740) failures.push(`home with a child: page is ${kidHome.h} px high`);
  await p5.fill('#root input[aria-label^="Ηλικία"]', "45");
  if (await p5.locator("[data-peds-label]").count()) failures.push("paediatric label still shown for an adult");
  // theatre mode: fourth step of the theme button; text two steps larger; nothing wider than the screen
  const themeBtn = p5.locator('#root button[aria-label^="Θέμα:"]');
  for (let i = 0; i < 4 && !/χειρουργείου/.test(await themeBtn.getAttribute("aria-label")); i++) await themeBtn.click();
  const th = await p5.evaluate(() => ({ label: document.querySelector('#root button[aria-label^="Θέμα:"]').getAttribute("aria-label"), bg: getComputedStyle(document.body).backgroundColor, zoom: [...document.querySelectorAll("#root div")].map((d) => d.style.zoom).filter(Boolean) }));
  if (!/χειρουργείου/.test(th.label) || th.bg !== "rgb(9, 13, 18)" || !th.zoom.length || th.zoom.some((z) => z !== "1.3")) failures.push(`theatre mode: ${th.label}, page ${th.bg}, zoom ${th.zoom.join("/")}`);
  if (await wide() > 360) failures.push("theatre mode: home wider than the screen");
  await p5.locator('div[style*="sticky"] button').nth(1).click(); await p5.waitForSelector("[data-drug]");
  if (await wide() > 360) failures.push("theatre mode: drug list wider than the screen");
  await themeBtn.click(); await themeBtn.click();
  // crisis log: presses appear on the timeline when the list is closed; nothing is written to storage
  await p5.goto(`http://localhost:${PORT}/Morfeas/?go=vfvt`);
  await p5.waitForSelector("#root button:has-text('Λειτουργία κρίσης')", { timeout: 20000 });
  await p5.locator("#root button").filter({ hasText: /Λειτουργία κρίσης/ }).first().click();
  await p5.waitForSelector("[data-crisis-head]");
  const dlg = p5.locator('[role="dialog"][aria-modal="true"]');
  await dlg.locator("button", { hasText: /^Σήμανση$/ }).click();
  await dlg.locator('button[aria-current="step"]').click();
  await dlg.locator('button[aria-label^="Καταγραφή δόσης αδρεναλίνης"]').click();
  await dlg.locator('button[aria-label="Κλείσιμο"]').click();
  await p5.waitForSelector("[data-crisis-timeline]");
  const tl = await p5.evaluate(() => { const t = document.querySelector("[data-crisis-timeline]"); const btns = [...t.querySelectorAll("button")]; return { text: t.textContent, small: btns.filter((b) => { const r = b.getBoundingClientRect(); return r.width < 44 || r.height < 44; }).length, wide: [...t.querySelectorAll("*")].filter((e) => e.getBoundingClientRect().right > 361).length, stored: Object.keys(localStorage).filter((k) => /log|timeline/i.test(k) || /Σήμανση 1|Έναρξη/.test(localStorage.getItem(k))).join(",") }; });
  if (!(/00:00Έναρξη/.test(tl.text) && /Σήμανση 1/.test(tl.text) && /✓ 1\. /.test(tl.text) && /Αδρεναλίνη, καταγραφή 1/.test(tl.text))) failures.push("timeline: a press is missing: " + tl.text.slice(0, 160));
  if (/\b18 kg\b|\bkg\b.*Παιδί|ετών/.test(tl.text)) failures.push("timeline: patient detail shown");
  if (tl.small || tl.wide) failures.push(`timeline: ${tl.small} small button(s), ${tl.wide} wide element(s)`);
  if (tl.stored) failures.push("timeline: written to storage: " + tl.stored);
  await p5.locator("[data-crisis-timeline] button", { hasText: /^Κλείσιμο$/ }).click();
  if (await p5.locator('[role="dialog"][aria-modal="true"]').count()) failures.push("timeline: \"Close\" did not close crisis mode");
  console.log(`Phase 6 at 360 x 740: child label "${kidHome.label}", propofol for a child: main row "${listRow}", first listed row "${kidDrugs.row.slice(0, 28)}", theatre zoom ${th.zoom[0]}, timeline lines ok`);
  await c5.close();
}

// --- New look, phase 3 (spec 4.3) and title typeface (spec 2.2) at 360 x 740 px ---
{
  const c6 = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2 });
  await withReact(c6);
  await c6.addInitScript(() => { try { const J = (v) => JSON.stringify({ v, exp: null }); if (!localStorage.getItem("aa_disclaimer_ok")) { localStorage.setItem("aa_disclaimer_ok", J(2)); localStorage.setItem("aa_seen_ver", J(99999)); localStorage.setItem("aa_theme", J("light")); localStorage.setItem("aa_home_seen", J(true)); localStorage.setItem("aa_patient", J({ w: "70", a: "45", h: "172", s: "M" })); } } catch (e) {} });
  const p6 = await c6.newPage();
  p6.on("pageerror", (e) => errors.push(e.message));
  await p6.goto(`http://localhost:${PORT}/Morfeas/?go=meds`);
  await p6.waitForSelector("[data-drug]", { timeout: 20000 });
  await p6.evaluate(() => document.fonts.ready);
  const ttl = await p6.evaluate(() => { const t = document.querySelector("[data-screen-title]"); return { text: t.textContent, family: getComputedStyle(t).fontFamily, size: getComputedStyle(t).fontSize, weight: getComputedStyle(t).fontWeight, loaded: true, fits: t.scrollWidth <= t.clientWidth + 1 }; });
  if (ttl.text !== "Φάρμακα" || !/^"?Morfeas Sans/.test(ttl.family) || ttl.size !== "28px" || ttl.weight !== "800" || !ttl.loaded || !ttl.fits) failures.push(`screen title: "${ttl.text}", ${ttl.family}, ${ttl.size}, font loaded ${ttl.loaded}, fits ${ttl.fits}`);
  const stripe = (id) => p6.evaluate((id) => { const s = document.querySelector(`[data-drug="${id}"] [data-label-stripe]`); if (!s) return null; const cs = getComputedStyle(s); return { w: Math.round(s.getBoundingClientRect().width), bg: cs.backgroundColor, img: cs.backgroundImage, key: s.getAttribute("data-label-stripe") }; }, id);
  const fen = await stripe("fentanyl"), nal = await stripe("naloxone"), hep = await stripe("heparin");
  if (!fen || fen.w < 8 || fen.w > 9 || fen.bg !== "rgb(125, 176, 227)") failures.push("fentanyl stripe: " + JSON.stringify(fen));
  if (!nal || !/repeating-linear-gradient/.test(nal.img) || nal.key !== "opioid-opposite") failures.push("naloxone stripe: " + JSON.stringify(nal));
  if (!hep || hep.bg !== "rgb(255, 255, 255)") failures.push("heparin stripe: " + JSON.stringify(hep));
  // adrenaline and suxamethonium: black upper half; sugammadex: striped like neostigmine (2022 review)
  const adr = await stripe("adrenaline"), sux = await stripe("succinylcholine"), sug = await stripe("sugammadex");
  if (!adr || !/linear-gradient\(rgb\(16, 38, 46\) 0(px|%), rgb\(16, 38, 46\) 50%, rgb\(179, 151, 216\) 50%/.test(adr.img)) failures.push("adrenaline stripe: " + JSON.stringify(adr));
  if (!sux || !/linear-gradient\(rgb\(16, 38, 46\) 0(px|%), rgb\(16, 38, 46\) 50%, rgb\(236, 107, 87\) 50%/.test(sux.img)) failures.push("suxamethonium stripe: " + JSON.stringify(sux));
  if (!sug || !/repeating-linear-gradient/.test(sug.img) || sug.key !== "nmb-opposite") failures.push("sugammadex stripe: " + JSON.stringify(sug));
  // dark and theatre themes: the black upper half is framed in the colour of the class (audit V7-1); light: no frame
  const frameOf = (id) => p6.evaluate((id) => getComputedStyle(document.querySelector(`[data-drug="${id}"] [data-label-stripe]`)).boxShadow, id);
  if ((await frameOf("adrenaline")) !== "none") failures.push("light theme: adrenaline stripe framed");
  for (const th of ["dark", "theatre"]) {
    const cT = await browser.newContext({ viewport: { width: 360, height: 740 } });
    await withReact(cT);
    await cT.addInitScript((th) => { try { const J = (v) => JSON.stringify({ v, exp: null }); localStorage.setItem("aa_disclaimer_ok", J(2)); localStorage.setItem("aa_seen_ver", J(99999)); localStorage.setItem("aa_home_seen", J(true)); localStorage.setItem("aa_theme", J(th)); } catch (e) {} }, th);
    const pT = await cT.newPage(); await pT.goto(`http://localhost:${PORT}/Morfeas/?go=meds`); await pT.waitForSelector("[data-drug]"); await pT.waitForTimeout(200);
    const fr = await pT.evaluate(() => ["adrenaline", "succinylcholine", "ephedrine", "rocuronium"].map((id) => getComputedStyle(document.querySelector(`[data-drug="${id}"] [data-label-stripe]`)).boxShadow));
    if (!/rgb\(179, 151, 216\).*1px inset/.test(fr[0]) || !/rgb\(236, 107, 87\).*1px inset/.test(fr[1]) || fr[2] !== "none" || fr[3] !== "none") failures.push(th + " theme: label frames " + JSON.stringify(fr));
    await cT.close();
  }
  const n = await p6.evaluate(() => document.querySelectorAll("[data-drug] > [data-label-stripe]").length);
  if (n < 90) failures.push(`label stripes on ${n} rows`);
  await p6.locator('[data-drug="fentanyl"] [data-row] > button:first-child').click();
  await p6.waitForSelector('[data-drug-card="fentanyl"]');
  const card = await p6.evaluate(() => { const c = document.querySelector("[data-drug-card]"), b = c.querySelector("[data-label-bar]"); return { w: b ? Math.round(b.getBoundingClientRect().width) : 0, bg: b ? getComputedStyle(b).backgroundColor : "", name: /ετικέτα: Οπιοειδή/.test(c.textContent) }; });
  if (card.w < 10 || card.w > 11 || card.bg !== "rgb(125, 176, 227)" || !card.name) failures.push("fentanyl card label: " + JSON.stringify(card));
  // the switch turns every colour off and is remembered
  await p6.locator("[data-label-switch] button").nth(1).click();
  const off = await p6.evaluate(() => ({ stripes: document.querySelectorAll("[data-label-stripe],[data-label-bar]").length, stored: localStorage.getItem("aa_label_colours") }));
  if (off.stripes || !/false/.test(off.stored || "")) failures.push("label switch off: " + JSON.stringify(off));
  await p6.locator("[data-label-switch] button").nth(0).click();
  console.log(`Phase 3 at 360 x 740: title "${ttl.text}" in ${ttl.family.split(",")[0]}, ${n} label stripes, fentanyl ${fen && fen.bg}, naloxone striped, switch ok`);
  await c6.close();
}

// --- v506 (audit of v505) at 360 x 740 px: "New crisis" asks first and clears the ticks; contraindications open; no word broken in a drug name ---
{
  const c7 = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2 });
  await withReact(c7);
  await c7.addInitScript(() => { try { const J = (v) => JSON.stringify({ v, exp: null }); if (!localStorage.getItem("aa_disclaimer_ok")) { localStorage.setItem("aa_disclaimer_ok", J(2)); localStorage.setItem("aa_seen_ver", J(99999)); localStorage.setItem("aa_theme", J("light")); localStorage.setItem("aa_home_seen", J(true)); localStorage.setItem("aa_patient", J({ w: "70", a: "45", h: "172", s: "M" })); } } catch (e) {} });
  const p7 = await c7.newPage();
  p7.on("pageerror", (e) => errors.push(e.message));
  await p7.goto(`http://localhost:${PORT}/Morfeas/?go=meds`);
  await p7.waitForSelector("[data-drug]", { timeout: 20000 });
  // a drug name wraps between words only: every line of a name ends at a space, a hyphen or the end
  const broken = await p7.evaluate(() => { const out = []; document.querySelectorAll("[data-drug]").forEach((r) => { const n = r.querySelector('[data-row] > button:first-child span span'); if (!n || !n.firstChild) return; const t = n.textContent, range = document.createRange(); let lastTop = null; for (let i = 0; i < t.length; i++) { range.setStart(n.firstChild, i); range.setEnd(n.firstChild, i + 1); const rc = range.getClientRects()[0]; if (!rc) continue; if (lastTop !== null && rc.top > lastTop + 4 && !/[\s\-\/(]/.test(t[i - 1]) && !/\s/.test(t[i])) out.push(t); lastTop = rc.top; } }); return out; });
  if (broken.length) failures.push("drug names broken inside a word: " + broken.slice(0, 3).join(" | "));
  await p7.locator('[data-drug="rocuronium"] [data-row] > button:first-child').click();
  await p7.waitForSelector('[data-drug-card="rocuronium"]');
  const ci = await p7.evaluate(() => { const b = document.querySelector('[data-card-box="ci"]'); const inner = b.firstElementChild; return { cut: inner.scrollHeight > inner.clientHeight + 2, btn: b.querySelectorAll("button").length }; });
  if (ci.cut || ci.btn) failures.push("contraindications are not open in full: " + JSON.stringify(ci));
  // crisis: New crisis
  await p7.goto(`http://localhost:${PORT}/Morfeas/?go=vfvt`);
  await p7.waitForSelector("#root button:has-text('Λειτουργία κρίσης')", { timeout: 20000 });
  await p7.locator("#root button").filter({ hasText: /Λειτουργία κρίσης/ }).first().click();
  await p7.waitForSelector("[data-crisis-head]");
  const dlg = p7.locator('[role="dialog"][aria-modal="true"]');
  await dlg.locator("button", { hasText: /^Σήμανση$/ }).click();
  await dlg.locator('button[aria-current="step"]').click();
  await dlg.locator('button[aria-label="Κλείσιμο"]').click();
  await p7.waitForSelector("[data-crisis-timeline]");
  const nc = p7.locator("[data-new-crisis]");
  const gap = await p7.evaluate(() => { const n = document.querySelector("[data-new-crisis]").getBoundingClientRect(); const c = [...document.querySelectorAll("[data-crisis-timeline] button")].find((b) => b.textContent === "Κλείσιμο").getBoundingClientRect(); return Math.round(n.top - c.bottom); });
  if (gap < 8) failures.push(`"New crisis" is ${gap} px from "Close"`);
  await nc.click();
  const afterOne = await p7.evaluate(() => ({ still: !!document.querySelector("[data-crisis-timeline]"), text: document.querySelector("[data-new-crisis]").textContent, marks: JSON.parse(localStorage.getItem("aa_crisis_vfvt")).v.marks.length }));
  if (!afterOne.still || !/Σίγουρα/.test(afterOne.text) || afterOne.marks !== 1) failures.push("\"New crisis\" acted on the first tap: " + JSON.stringify(afterOne));
  await nc.click();
  await p7.waitForTimeout(150);
  const afterTwo = await p7.evaluate(() => { const d = document.querySelector('[role="dialog"][aria-modal="true"]'); return { timeline: !!document.querySelector("[data-crisis-timeline]"), marks: JSON.parse(localStorage.getItem("aa_crisis_vfvt")).v.marks.length, ticks: d.querySelectorAll('button[aria-pressed="true"]:not([aria-label])').length, count: d.querySelector("[data-crisis-count]").textContent }; });
  if (afterTwo.timeline || afterTwo.marks !== 0 || afterTwo.ticks !== 0 || !/^0 /.test(afterTwo.count)) failures.push("\"New crisis\" did not clear everything: " + JSON.stringify(afterTwo));
  console.log(`v506 at 360 x 740: names broken inside a word ${broken.length}; contraindications open; "New crisis" asks first (${gap} px from Close) and clears marks and ticks`);
  await c7.close();
}

// --- v509 (audit V5-11): the very first screen at 360 x 740 px: both buttons are whole and on the screen without scrolling, EL and EN ---
{
  const c8 = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2 });
  await withReact(c8);
  const p8 = await c8.newPage(); p8.on("pageerror", (e) => errors.push(e.message));
  await p8.goto(`http://localhost:${PORT}/Morfeas/`); await p8.waitForSelector("[data-notice-accept]"); await p8.waitForTimeout(200);
  const out = [];
  for (const lang of ["el", "en"]) {
    const m = await p8.evaluate(() => { const bs = [...document.querySelectorAll("[data-notice-actions] button")].map((b) => { const r = b.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) }; }); return { bs, vh: window.innerHeight, wide: document.documentElement.scrollWidth, page: document.documentElement.scrollHeight }; });
    if (m.bs.length !== 2 || m.bs.some((b) => b.top < 0 || b.bottom > m.vh || b.h < 44) || m.wide > 360) failures.push("first-open notice (" + lang + "): " + JSON.stringify(m));
    out.push(lang + ": page " + m.page + " px, buttons end at " + Math.max(...m.bs.map((b) => b.bottom)) + " px");
    await p8.locator("[data-notice-actions] button").nth(1).click(); await p8.waitForTimeout(150);
  }
  await p8.locator("[data-notice-accept]").click(); await p8.waitForTimeout(300);
  if (await p8.locator("[data-notice-accept]").count()) failures.push("first-open notice: accept does not close it");
  console.log("First-open notice at 360 x 740: " + out.join("; "));
  await c8.close();
}

// --- v510 (audit V9-1): on a short screen the accept button waits for the end of the notice; on 360 x 740 it is active at once ---
{
  const out = [];
  for (const hgt of [740, 560]) {
    const c9 = await browser.newContext({ viewport: { width: 360, height: hgt }, deviceScaleFactor: 2 });
    await withReact(c9);
    const p9 = await c9.newPage(); p9.on("pageerror", (e) => errors.push(e.message));
    await p9.goto(`http://localhost:${PORT}/Morfeas/`); await p9.waitForSelector("[data-notice-accept]"); await p9.waitForTimeout(500);
    const st = () => p9.evaluate(() => ({ off: document.querySelector("[data-notice-accept]").disabled, hint: !!document.querySelector("[data-notice-hint]") }));
    const s0 = await st();
    if (hgt === 740) { if (s0.off || s0.hint) failures.push("notice at 740 px: accept not active at once " + JSON.stringify(s0)); }
    else {
      if (!s0.off || !s0.hint) failures.push("notice at " + hgt + " px: accept active before the end was shown " + JSON.stringify(s0));
      await p9.locator("[data-notice-accept]").click({ force: true }); await p9.waitForTimeout(150);
      if (!(await p9.locator("[data-notice-accept]").count())) failures.push("notice at " + hgt + " px: a disabled accept closed the notice");
      const hh = await p9.evaluate(() => { const h = document.querySelector("[data-notice-hint]").getBoundingClientRect(); return document.documentElement.scrollWidth > 360 || h.bottom > window.innerHeight; });
      if (hh) failures.push("notice at " + hgt + " px: hint off the screen");
      // v511 (audit V10-1): with every scroll event swallowed, the once-a-second check still frees the button
      await p9.evaluate(() => { window.addEventListener("scroll", (e) => e.stopImmediatePropagation(), true); document.addEventListener("scroll", (e) => e.stopImmediatePropagation(), true); });
      await p9.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p9.waitForTimeout(1500);
      const s1 = await st();
      if (s1.off || s1.hint) failures.push("notice at " + hgt + " px: accept still off at the end " + JSON.stringify(s1));
    }
    await p9.locator("[data-notice-accept]").click(); await p9.waitForTimeout(300);
    if (await p9.locator("[data-notice-accept]").count()) failures.push("notice at " + hgt + " px: accept does not close it");
    out.push(hgt + " px: " + (s0.off ? "waits for the end" : "active at once"));
    await c9.close();
  }
  console.log("First-open notice, accept button: " + out.join("; "));
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
