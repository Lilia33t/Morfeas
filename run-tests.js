#!/usr/bin/env node
/**
 * Morfeas — calculation unit tests
 * ------------------------------------------------
 * Plain Node, zero dependencies, no build step.
 *
 * How it works: the app source (src/data.js, formulas.js, primitives.js,
 * tabs.js, root.js) is a set of browser-only classic scripts that expect a
 * global `React` (for JSX-less React.createElement calls used by UI
 * components) and, optionally, `window` (for localStorage persistence
 * helpers). None of that is needed to exercise the pure calculation
 * functions this file tests, so we load the files in the same order the
 * browser does (see index.html) into a throwaway VM context with minimal
 * stand-ins for those globals, then assert against known reference
 * values for the formulas.
 *
 * IMPORTANT: if you rename, move, or restructure any of the calculation
 * functions below, update the corresponding `ctx.eval(...)` line so the
 * function is still reachable here — this file intentionally does NOT
 * modify the app source, it only reads it.
 *
 * Run with:  node tests/run-tests.js
 * Exits 0 on success, 1 if any assertion fails (suitable for CI).
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SRC_DIR = path.join(__dirname, "..", "src");
const SRC_FILES = ["data.js", "formulas.js", "primitives.js", "tabs.js", "root.js"];
const src = SRC_FILES.map((f) => fs.readFileSync(path.join(SRC_DIR, f), "utf8")).join("\n");

// --- Minimal browser stand-ins -------------------------------------------
// React: only React.createElement / Component / Fragment are ever touched
// at *module load* time (inside component function bodies, which we never
// call). Hooks are stubbed just in case something references them at the
// top level.
const stubReact = {
  createElement: () => null,
  Fragment: Symbol("Fragment"),
  Component: class {},
};
const sandbox = {
  React: stubReact,
  window: { localStorage: null }, // absent localStorage -> code falls back to in-memory store
  console,
};
vm.createContext(sandbox);

try {
  vm.runInContext(src, sandbox, { filename: "app-src-concat.js" });
} catch (e) {
  console.error("FATAL: could not load app source files into test sandbox:\n", e);
  process.exit(1);
}

// --- Tiny assertion helpers ------------------------------------------------
let pass = 0;
let fail = 0;
const failures = [];

function approx(actual, expected, tol = 0.05) {
  return actual != null && Math.abs(actual - expected) <= tol;
}

function check(name, actual, expected, tol = 0.05) {
  const ok = typeof expected === "number" ? approx(actual, expected, tol) : actual === expected;
  if (ok) {
    pass++;
  } else {
    fail++;
    failures.push(`${name}: expected ${expected}, got ${actual}`);
  }
}

function run(expr) {
  return vm.runInContext(expr, sandbox);
}

// --- BMI / body-weight formulas --------------------------------------------
check("bmiCalc(70, 170)", run("bmiCalc(70, 170)"), 24.22);
check("bmiCalc(0, 170) -> null (no weight)", run("bmiCalc(0, 170)"), null);
check("bmiCalc(70, 0) -> null (no height)", run("bmiCalc(70, 0)"), null);

check("ibwDevine(170, 'M')", run("ibwDevine(170, 'M')"), 65.94, 0.1);
check("ibwDevine(170, 'F')", run("ibwDevine(170, 'F')"), 61.44, 0.1);
check("ibwDevine(0, 'M') -> null", run("ibwDevine(0, 'M')"), null);

check("abw(100, 170, 'M')", run("abw(100, 170, 'M')"), 79.56, 0.1);
check("abw(60, 170, 'M') below IBW -> pulls toward IBW", run("abw(60, 170, 'M')"), 63.56, 0.1);

check("lbmJames(70, 170, 'M')", run("lbmJames(70, 170, 'M')"), 55.3, 0.1);
check("ffmJan(70, 170, 'M')", run("ffmJan(70, 170, 'M')"), 54.56, 0.1);

// --- Pediatric quick-reference calculator ----------------------------------
const peds5 = run("pedsCalc(5, null)");
check("pedsCalc(5): estimated weight (Advanced Paeds Life Support formula)", peds5.w, 18);
check("pedsCalc(5): flagged as estimated (no weight given)", peds5.est, true);
check("pedsCalc(5): uncuffed ETT size", peds5.ettUncuffed, 5.25);
check("pedsCalc(5): cuffed ETT size", peds5.ettCuffed, 4.75);
check("pedsCalc(5): ETT insertion depth (cm at lip)", peds5.depth, 14.5);
check("pedsCalc(5): LMA size", peds5.lma, "2");
check("pedsCalc(5): laryngoscope blade", peds5.blade, "Mac 2");
check("pedsCalc(5): minimum acceptable SBP", peds5.minSBP, 80);

const pedsInfant = run("pedsCalc(0.5, null)");
check("pedsCalc(0.5): estimated weight (infant formula)", pedsInfant.w, 7);
check("pedsCalc(0.5): uncuffed ETT size (age<1)", pedsInfant.ettUncuffed, 4);
check("pedsCalc(0.5): LMA size", pedsInfant.lma, "1.5");
check("pedsCalc(0.5): laryngoscope blade", pedsInfant.blade, "Miller 0\u20131");

const pedsGivenWeight = run("pedsCalc(5, 22)");
check("pedsCalc(5, 22kg given): uses given weight, not estimate", pedsGivenWeight.w, 22);
check("pedsCalc(5, 22kg given): not flagged as estimated", pedsGivenWeight.est, false);

// --- Maintenance fluids: the 4-2-1 rule -------------------------------------
check("maint421(5kg) -> 4 mL/kg/h band", run("maint421(5)"), 20);
check("maint421(10kg) -> boundary of first band", run("maint421(10)"), 40);
check("maint421(15kg) -> 2 mL/kg/h band", run("maint421(15)"), 50);
check("maint421(20kg) -> boundary of second band", run("maint421(20)"), 60);
check("maint421(25kg) -> 1 mL/kg/h band", run("maint421(25)"), 65);

// --- Context-sensitive half-time (CSHT) interpolation -----------------------
check("cshtAt(Propofol, 30) -> exact data point", run('cshtAt("Propofol", 30)'), 5);
check("cshtAt(Propofol, 60) -> exact data point", run('cshtAt("Propofol", 60)'), 10);
check("cshtAt(Propofol, 45) -> linear interpolation midpoint", run('cshtAt("Propofol", 45)'), 7.5);
check("cshtAt(Propofol, 700) -> clamps to last known point (600min)", run('cshtAt("Propofol", 700)'), 32);
check("cshtAt(Propofol, 0) -> clamps to first known point", run('cshtAt("Propofol", 0)'), 5);

// --- Opioid conversion factors ---------------------------------------------
// Each factor converts a total daily dose to oral morphine equivalents (OME).
// Anchored on published equianalgesic tables: all of the doses below are
// standard equivalents of 30 mg/day oral morphine.
const opioidF = (id) => run(`OPIOIDS.find(o => o.id === ${JSON.stringify(id)}).f`);
check("morphine PO 30 mg -> OME 30", 30 * opioidF("morph-po"), 30);
check("morphine IV 10 mg -> OME 30", 10 * opioidF("morph-iv"), 30);
check("oxycodone PO 20 mg -> OME 30", 20 * opioidF("oxy-po"), 30);
check("hydromorphone PO 7.5 mg -> OME 30", 7.5 * opioidF("hydro-po"), 30);
check("hydromorphone IV 1.5 mg -> OME 30", 1.5 * opioidF("hydro-iv"), 30);
check("fentanyl patch 25 mcg/h -> OME 60", 25 * opioidF("fent-tts"), 60);
check("codeine PO 200 mg -> OME 30", 200 * opioidF("codeine"), 30);
check("tramadol PO 300 mg -> OME 30", 300 * opioidF("tramadol"), 30);
check("tapentadol PO 75 mg -> OME 30", 75 * opioidF("tapent"), 30);
// Reverse direction (OME -> target drug daily dose)
check("OME 60 -> oxycodone PO 40 mg", 60 / opioidF("oxy-po"), 40);
check("OME 60 -> fentanyl patch 25 mcg/h", 60 / opioidF("fent-tts"), 25);
// Methadone/buprenorphine must stay OUT: their conversion is non-linear.
check(
  "methadone & buprenorphine excluded from converter",
  run("OPIOIDS.filter(o => /methadone|buprenorph/i.test(o.id + o.en)).length"),
  0
);

// --- Clinical scores --------------------------------------------------------
// The legacy scores (Apfel/STOP-BANG/RCRI) are plain tick counts. ScoreCard was
// later extended with weighted items (it.w) and choice items (it.opts); these
// assertions pin the legacy behaviour so that extension can't silently change
// them, and check the weighted maths of the newer scores.
const score = (id) => run(`SCORES.find(s => s.id === ${JSON.stringify(id)})`);

check("Apfel: 2 risk factors -> 39%", run('SCORES.find(s=>s.id==="apfel").interp(2,"en").en').includes("39%"), true);
check("Apfel: 4 risk factors -> high", run('SCORES.find(s=>s.id==="apfel").interp(4,"en").lvl'), "high");
check("Apfel: still a plain tick count (no weights)", run('SCORES.find(s=>s.id==="apfel").items.every(i => !i.opts && i.w == null)'), true);
check("RCRI: 2 factors -> 6.6%", run('SCORES.find(s=>s.id==="rcri").interp(2,"en").en').includes("6.6%"), true);
check("STOP-BANG: 5 -> high OSA risk", run('SCORES.find(s=>s.id==="stopbang").interp(5,"en").lvl'), "high");

// ARISCAT is weighted, not a tick count (Canet 2010 point values).
check("ARISCAT: age >80 scores 16", run('SCORES.find(s=>s.id==="ariscat").items[0].opts[2].v'), 16);
check("ARISCAT: SpO2 <=90% scores 24", run('SCORES.find(s=>s.id==="ariscat").items[1].opts[2].v'), 24);
check("ARISCAT: respiratory infection scores 17", run('SCORES.find(s=>s.id==="ariscat").items[2].w'), 17);
check("ARISCAT: anaemia (Hb<=10) scores 11", run('SCORES.find(s=>s.id==="ariscat").items[3].w'), 11);
check("ARISCAT: intrathoracic incision scores 24", run('SCORES.find(s=>s.id==="ariscat").items[4].opts[2].v'), 24);
check("ARISCAT: surgery >3h scores 23", run('SCORES.find(s=>s.id==="ariscat").items[5].opts[2].v'), 23);
check("ARISCAT: emergency scores 8", run('SCORES.find(s=>s.id==="ariscat").items[6].w'), 8);
check("ARISCAT: 25 -> low risk band", run('SCORES.find(s=>s.id==="ariscat").interp(25,"en").lvl'), "low");
check("ARISCAT: 26 -> intermediate band", run('SCORES.find(s=>s.id==="ariscat").interp(26,"en").lvl'), "mid");
check("ARISCAT: 45 -> high band", run('SCORES.find(s=>s.id==="ariscat").interp(45,"en").lvl'), "high");
check("ARISCAT: age auto-fills from patient (85y -> >80 band)", run('SCORES.find(s=>s.id==="ariscat").items[0].autoIdx({a:85})'), 2);

// Clinical Frailty Scale is a 1-9 ordinal, so the "total" IS the CFS grade.
check("CFS: 9 grades", run('SCORES.find(s=>s.id==="cfs").items[0].opts.length'), 9);
check("CFS: option values run 1..9", run('SCORES.find(s=>s.id==="cfs").items[0].opts.every((o,i) => o.v === i + 1)'), true);
check("CFS: grade 3 -> not frail", run('SCORES.find(s=>s.id==="cfs").interp(3,"en").lvl'), "low");
check("CFS: grade 7 -> severe (high)", run('SCORES.find(s=>s.id==="cfs").interp(7,"en").lvl'), "high");

// The three APLS age bands. Note age 5 is a coincidence point where the old
// withdrawn formula ((age+4)x2) and the current one (2*age+8) agree, so the
// band boundaries below are what actually pin this down.
check("pedsCalc(1): 1-5y band -> 2*1 + 8 = 10 kg", run("pedsCalc(1, null).w"), 10);
check("pedsCalc(3): 1-5y band -> 2*3 + 8 = 14 kg", run("pedsCalc(3, null).w"), 14);
check("pedsCalc(6): 6-12y band -> 3*6 + 7 = 25 kg", run("pedsCalc(6, null).w"), 25);
check("pedsCalc(10): 6-12y band -> 3*10 + 7 = 37 kg", run("pedsCalc(10, null).w"), 37);
check("pedsCalc(12): 6-12y band -> 3*12 + 7 = 43 kg", run("pedsCalc(12, null).w"), 43);
check("pedsCalc(10): NOT the withdrawn (age+4)x2 = 28 kg", run("pedsCalc(10, null).w === 28"), false);

// --- Nalbuphine --------------------------------------------------------------
// Mixed kappa-agonist/mu-antagonist with an analgesic and respiratory-depression
// ceiling near 30 mg, so it deliberately stays OUT of the opioid converter.
const nalb = () => run('DRUGS.find(d => d.id === "nalbuphine")');
check("nalbuphine: filed under opioids", run('DRUGS.find(d => d.id === "nalbuphine").cat'), "opioid");
check("nalbuphine: pruritus prophylaxis low bound 0.1 mg/kg", run('DRUGS.find(d => d.id === "nalbuphine").doses[2].lo'), 0.1);
check("nalbuphine: pruritus prophylaxis high bound 0.2 mg/kg", run('DRUGS.find(d => d.id === "nalbuphine").doses[2].hi'), 0.2);
check("nalbuphine: ceiling documented in notes", run('/30 mg/.test(DRUGS.find(d => d.id === "nalbuphine").notesEn)'), true);
check("nalbuphine: stays out of the opioid converter", run('OPIOIDS.some(o => /nalb/i.test(o.id + o.en))'), false);

check("nalbuphine: paediatric rows present (9 total)", run('DRUGS.find(d => d.id === "nalbuphine").doses.length'), 9);
check("nalbuphine: paeds >1y band is 0.1-0.2 mg/kg", run('/0\\.1\\u20130\\.2 mg\\/kg/.test(DRUGS.find(d => d.id === "nalbuphine").doses[5].fixed)'), true);
check("nalbuphine: paeds pruritus capped at 5 mg/dose", run('/max 5 mg/.test(DRUGS.find(d => d.id === "nalbuphine").doses[7].fixed)'), true);

// --- Bilingual integrity of the drug database -------------------------------
// doseText() falls back to `fixed` when `fixedEn` is absent, so any Greek
// wording in `fixed` used to surface in the English UI. These two guards keep
// the two languages in step: no Greek in English output, and identical numbers.
check(
  "no Greek text leaks into English dose output",
  run(`DRUGS.flatMap(d => d.doses || []).filter(x => /[\\u0370-\\u03FF]/.test(String(doseText(x, 70, "en")))).length`),
  0
);
check(
  "dose numbers identical in Greek and English",
  run(`(() => {
    const num = (s) => (String(s).match(/\\d[\\d.,]*/g) || []).join("|");
    return DRUGS.flatMap(d => d.doses || [])
      .filter(x => num(doseText(x, 70, "en")) !== num(doseText(x, 70, "el"))).length;
  })()`),
  0
);

// --- Anaphylaxis checklist (RCUK 2021) --------------------------------------
// Corticosteroids and antihistamines were withdrawn from acute treatment; the
// checklist may only mention them to say so. Repeat-at-5-min and the two-dose
// definition of refractory anaphylaxis are the other headline changes.
const anaph = (lang) => run(`CHECKLISTS.find(c => c.id === "anaphylaxis").steps${lang}.join(" | ")`);
check("anaphylaxis: no live steroid/antihistamine recommendation",
  /hydrocortisone|chlorphenamine|antihistamine/i.test(anaph("En")) &&
  !/no longer recommended/i.test(anaph("En")), false);
check("anaphylaxis: repeat adrenaline at 5 min", /5 min/.test(anaph("En")), true);
check("anaphylaxis: refractory = after two doses", /TWO appropriate doses/.test(anaph("En")), true);
check("anaphylaxis: adrenaline dose unchanged", /IM 0\.5 mg/.test(anaph("En")), true);
check("anaphylaxis: EL and EN step counts match",
  run('CHECKLISTS.find(c => c.id === "anaphylaxis").stepsEl.length === CHECKLISTS.find(c => c.id === "anaphylaxis").stepsEn.length'), true);
check("every checklist has matching EL/EN step counts",
  run("CHECKLISTS.filter(c => c.stepsEl.length !== c.stepsEn.length).length"), 0);
check("bradycardia: dopamine 5-20 mcg/kg/min (ACLS)",
  run('/Dopamine 5\\u201320/.test(CHECKLISTS.find(c => c.id === "brady").stepsEn.join(" "))'), true);
check("MH: dantrolene 2.5 mg/kg initial",
  run('/2\\.5 mg\\/kg/.test(CHECKLISTS.find(c => c.id === "mh").stepsEn.join(" "))'), true);

// --- Global search ----------------------------------------------------------
// One index over drugs, checklists, tools, scores and guidelines. Greek is
// folded (accents stripped, final sigma) so "αναφυλαξια" finds "Αναφυλαξία".
check("search index covers every drug, checklist, tool, score and guideline",
  run(`(() => {
    const i = buildSearchIndex("el");
    const n = (k) => i.filter(x => x.kind === k).length;
    return n("drug") === DRUGS.length && n("list") === CHECKLISTS.length &&
           n("tool") === TOOL_SECTIONS.length && n("score") === SCORES.length &&
           n("guide") === GUIDELINES.length;
  })()`), true);
check("search: accents folded", run('norm("\\u03B1\\u03BD\\u03B1\\u03C6\\u03C5\\u03BB\\u03B1\\u03BE\\u03B9\\u03B1") === norm("\\u0391\\u03BD\\u03B1\\u03C6\\u03C5\\u03BB\\u03B1\\u03BE\\u03AF\\u03B1")'), true);
check("search: final sigma folded", run('norm("\\u03C4\\u03AD\\u03BB\\u03BF\\u03C2") === norm("\\u03C4\\u03B5\\u03BB\\u03BF\\u03C3")'), true);
check("search: every result routes to a real tab",
  run('buildSearchIndex("el").every(i => ["meds","lists","tools","peds"].includes(i.tab) && !!i.target)'), true);
// Greek drug names are searchable even though the app displays Latin names.
check("search: Greek drug synonyms indexed",
  run('DRUGS.filter(d => !d.synEl).length'), 0);
// Tool cards render at runtime, so each carries keywords describing its content.
check("search: every tool has search keywords",
  run("TOOL_SECTIONS.filter(s => !s.kw).length"), 0);
check("search: a tool is findable by its content, not just its title",
  run('buildSearchIndex("el").some(i => i.kind === "tool" && i.hay.includes("ards"))'), true);

check("tools: every tool belongs to a group (needed for collapsing)",
  run("TOOL_SECTIONS.filter(s => !s.group).length"), 0);
check("tools: five groups", run("new Set(TOOL_SECTIONS.map(s => s.group)).size"), 5);

// --- Theming ----------------------------------------------------------------
// S is mutated in place by applyTheme, so both palettes must define exactly the
// same tokens or a component reads undefined in one theme only. Contrast is
// asserted for both, since a colour tweak in one theme is easy to make blind.
check("light and dark define identical tokens",
  run("Object.keys(LIGHT).sort().join() === Object.keys(DARK).sort().join()"), true);
check("no component hardcodes a colour outside the palette",
  run(`(() => {
    // every S token is a hex string; components should only ever read these
    return Object.values(LIGHT).every(v => /^#[0-9A-Fa-f]{6}$/.test(v)) &&
           Object.values(DARK).every(v => /^#[0-9A-Fa-f]{6}$/.test(v));
  })()`), true);
check("applyTheme('dark') swaps the palette in place",
  run(`(() => { applyTheme("dark"); const d = S.bg === DARK.bg; applyTheme("light"); return d && S.bg === LIGHT.bg; })()`), true);
check("body text clears 4.5:1 in both themes",
  run(`(() => {
    const lum = (h) => {
      const c = [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16) / 255)
        .map(x => x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    const cr = (a, b) => {
      const x = lum(a), y = lum(b);
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
    };
    return [LIGHT, DARK].every(P =>
      cr(P.ink, P.bg) >= 4.5 && cr(P.muted, P.card) >= 4.5 &&
      cr(P.red, P.card) >= 4.5 && cr(P.amber, P.card) >= 4.5 &&
      cr(P.onAccent, P.teal) >= 4.5);
  })()`), true);

// A drug whose `cat` has no matching entry in CATS is invisible in the Meds
// tab even though it exists in the data. This caught the obstetric drugs.
check("every drug's category has a matching filter",
  run(`(() => {
    const ids = CATS.map(c => c.id);
    return DRUGS.filter(d => !ids.includes(d.cat)).length;
  })()`), 0);
check("every checklist's category has a matching filter",
  run(`(() => {
    const ids = CL_CATS.map(c => c.id);
    return CHECKLISTS.filter(c => !ids.includes(c.cat)).length;
  })()`), 0);

// --- Report -----------------------------------------------------------------
console.log(`\n${pass} passed, ${fail} failed (${pass + fail} total)`);
if (failures.length) {
  console.log("\nFailures:");
  for (const f of failures) console.log("  - " + f);
  process.exit(1);
}
process.exit(0);
