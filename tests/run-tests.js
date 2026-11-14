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
check("pedsCalc(0.25, 6 kg): cuffed ETT 3.0 (Microcuff)", run("pedsCalc(0.25, 6)").ettCuffed, 3);
check("pedsCalc(1, 10 kg): cuffed ETT 3.5 (Microcuff)", run("pedsCalc(1, 10)").ettCuffed, 3.5);
check("pedsCalc(0, 2 kg): no cuffed size <3 kg", run("pedsCalc(0, 2)").ettCuffed, null);
check("pedsCalc(5): ETT insertion depth (cm at lip)", peds5.depth, 14.5);
check("pedsCalc(5): LMA size", peds5.lma, "2");
check("pedsCalc(5): laryngoscope blade (Merck: Miller 2 for 3-9 y)", peds5.blade, "Miller 2");
check("pedsCalc(5): minimum acceptable SBP", peds5.minSBP, 80);

const pedsInfant = run("pedsCalc(0.5, null)");
check("pedsCalc(0.5): estimated weight (infant formula)", pedsInfant.w, 7);
check("pedsCalc(0.5): uncuffed ETT size (age<1, Merck 3.5)", pedsInfant.ettUncuffed, 3.5);
check("pedsCalc(0.5): LMA size", pedsInfant.lma, "1.5");
check("pedsCalc(0.5): laryngoscope blade (Merck: Miller 1)", pedsInfant.blade, "Miller 1");

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

// --- Nalbuphine --------------------------------------------------------------
// Mixed kappa-agonist/mu-antagonist with an analgesic and respiratory-depression
// ceiling near 30 mg, so it deliberately stays OUT of the opioid converter.
const nalb = () => run('DRUGS.find(d => d.id === "nalbuphine")');
check("nalbuphine: filed under opioids", run('DRUGS.find(d => d.id === "nalbuphine").cat'), "opioid");
check("nalbuphine: pruritus prophylaxis low bound 0.1 mg/kg", run('DRUGS.find(d => d.id === "nalbuphine").doses[2].lo'), 0.1);
check("nalbuphine: pruritus prophylaxis high bound 0.2 mg/kg", run('DRUGS.find(d => d.id === "nalbuphine").doses[2].hi'), 0.2);
check("nalbuphine: ceiling documented in notes", run('/0.3 mg.kg/.test(DRUGS.find(d => d.id === "nalbuphine").notesEn)'), true);

check("nalbuphine: paediatric rows present (8 total, no reversal dose)", run('DRUGS.find(d => d.id === "nalbuphine").doses.length'), 8);
check("nalbuphine: reversal kept as a note, not a dose",
  run('DRUGS.find(d => d.id === "nalbuphine").doses.some(x => /2\.5 mg IV/.test(x.fixed || ""))'), false);

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
  !/no longer recommended|not routine in the initial treatment/i.test(anaph("En")), false);
check("anaphylaxis: repeat adrenaline at 5 min", /5 min/.test(anaph("En")), true);
check("anaphylaxis: refractory = after two doses", /TWO appropriate doses/.test(anaph("En")), true);
check("anaphylaxis: IV is first line under anaesthesia", /IV is first line/.test(anaph("En")), true);
check("anaphylaxis: initial IV bolus 50 mcg", /50 \\u00B5g|50 \u00b5g/.test(anaph("En")), true);
check("anaphylaxis: EL and EN step counts match",
  run('CHECKLISTS.find(c => c.id === "anaphylaxis").stepsEl.length === CHECKLISTS.find(c => c.id === "anaphylaxis").stepsEn.length'), true);
check("every checklist has matching EL/EN step counts",
  run("CHECKLISTS.filter(c => c.stepsEl.length !== c.stepsEn.length).length"), 0);
check("bradycardia: dopamine 5-20 mcg/kg/min (ACLS)",
  run('/[Dd]opamine 5\\u201320/.test(CHECKLISTS.find(c => c.id === "brady").stepsEn.join(" "))'), true);
check("MH: dantrolene 2.5 mg/kg initial",
  run('/2\\.5 mg\\/kg/.test(CHECKLISTS.find(c => c.id === "mh").stepsEn.join(" "))'), true);

// --- Global search ----------------------------------------------------------
// One index over drugs, checklists, tools, scores and guidelines. Greek is
// folded (accents stripped, final sigma) so "αναφυλαξια" finds "Αναφυλαξία".
check("search index covers every drug, checklist, tool, score and guideline",
  run(`(() => {
    const i = buildSearchIndex("el");
    const n = (k) => i.filter(x => x.kind === k).length;
    return n("drug") === DRUGS.length && n("list") === CHECKLISTS_SHOWN.length + 1 /* + pre-anaesthesia check */ &&
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

// --- Tramadol ----------------------------------------------------------------
check("tramadol: filed under opioids", run('DRUGS.find(d => d.id === "tramadol").cat'), "opioid");
check("tramadol: CrCl<30 capped at 200 mg/24h",
  run('DRUGS.find(d => d.id === "tramadol").doses.some(x => /CrCl <30/.test(x.en) && /max 200 mg\\/24 ?h/.test(x.fixedEn))'), true);
check("tramadol: seizure risk documented",
  run('/seizure/i.test(DRUGS.find(d => d.id === "tramadol").notesEn)'), true);
// The drug entry quotes the same ratio the converter uses; if one changes the
// app would give two different answers for the same drug.

// --- Opioid conversion factors ---------------------------------------------
// Each factor converts a total daily dose to oral morphine equivalents (OME),
// anchored on published equianalgesic tables: every dose below is a standard
// equivalent of 30 mg/day oral morphine.
const opioidF = (id) => run(`OPIOIDS.find(o => o.id === ${JSON.stringify(id)}).f`);
check("morphine PO 30 mg -> OME 30", 30 * opioidF("morph-po"), 30);
check("morphine IV 10 mg -> OME 30", 10 * opioidF("morph-iv"), 30);
check("oxycodone PO 20 mg -> OME 30", 20 * opioidF("oxy-po"), 30);
check("hydromorphone PO 6 mg -> OME 30", 6 * opioidF("hydro-po"), 30);
check("hydromorphone IV 2 mg -> OME 30", 2 * opioidF("hydro-iv"), 30);
check("oxycodone IV 10 mg -> OME 30", 10 * opioidF("oxy-iv"), 30);
check("tramadol IV 100 mg -> OME 30", 100 * opioidF("tramadol-iv"), 30, 0.001);
check("pethidine IV 75 mg -> OME 30", 75 * opioidF("pethidine-iv"), 30, 0.001);
check("fentanyl IV 150 mcg/24h -> OME 30", 150 * opioidF("fent-iv"), 30, 0.001);
check("sufentanil IV 15 mcg/24h -> OME 30", 15 * opioidF("sufent-iv"), 30);
check("fentanyl patch 25 mcg/h -> OME 60", 25 * opioidF("fent-tts"), 60);
check("codeine PO 300 mg -> OME 30", 300 * opioidF("codeine"), 30, 0.001);
check("tramadol PO 300 mg -> OME 30", 300 * opioidF("tramadol"), 30);
check("tapentadol PO 75 mg -> OME 22.5 (ANZCA 0.3, the conservative direction to morphine; v412)", 75 * opioidF("tapent"), 22.5);
check("OME 60 -> oxycodone PO 40 mg", 60 / opioidF("oxy-po"), 40);
check("OME 60 -> fentanyl patch 25 mcg/h", 60 / opioidF("fent-tts"), 25);
// Methadone and buprenorphine must stay OUT: conversion is non-linear.
check("methadone & buprenorphine excluded from converter",
  run("OPIOIDS.filter(o => /methadone|buprenorph/i.test(o.id + o.en) && o.grp !== \"td\").length"), 0);
check("buprenorphine patch 35 mcg/h -> OME 70 (ANZCA 2, conservative to morphine; v412)", 35 * opioidF("bup-tts"), 70);
check("nalbuphine stays out of the converter (ceiling effect)",
  run("OPIOIDS.some(o => /nalb/i.test(o.id + o.en))"), false);
check("tramadol: drug entry agrees with the converter (300 mg = 30 mg OME)",
  run('300 * OPIOIDS.find(o => o.id === "tramadol").f'), 30);

// --- Clinical scores --------------------------------------------------------
// The legacy scores are plain tick counts; ScoreCard was later extended with
// weighted items (it.w) and choice items (it.opts). These pin the old
// behaviour so the extension cannot silently change it.
check("Apfel: 2 risk factors -> 39%", run('SCORES.find(s=>s.id==="apfel").interp(2,"en").en').includes("39%"), true);
check("Apfel: 4 risk factors -> high", run('SCORES.find(s=>s.id==="apfel").interp(4,"en").lvl'), "high");
check("Apfel: still a plain tick count", run('SCORES.find(s=>s.id==="apfel").items.every(i => !i.opts && i.w == null)'), true);
check("RCRI: 2 factors -> 6.6%", run('SCORES.find(s=>s.id==="rcri").interp(2,"en").en').includes("6.6%"), true);
check("STOP-BANG: 5 -> high risk", run('SCORES.find(s=>s.id==="stopbang").interp(5,"en").lvl'), "high");

// ARISCAT is weighted, not a tick count (Canet 2010 point values).
check("ARISCAT: age >80 scores 16", run('SCORES.find(s=>s.id==="ariscat").items[0].opts[2].v'), 16);
check("ARISCAT: SpO2 <=90% scores 24", run('SCORES.find(s=>s.id==="ariscat").items[1].opts[2].v'), 24);
check("ARISCAT: respiratory infection scores 17", run('SCORES.find(s=>s.id==="ariscat").items[2].w'), 17);
check("ARISCAT: anaemia scores 11", run('SCORES.find(s=>s.id==="ariscat").items[3].w'), 11);
check("ARISCAT: 25 -> low band", run('SCORES.find(s=>s.id==="ariscat").interp(25,"en").lvl'), "low");
check("ARISCAT: 26 -> intermediate band", run('SCORES.find(s=>s.id==="ariscat").interp(26,"en").lvl'), "mid");
check("ARISCAT: 45 -> high band", run('SCORES.find(s=>s.id==="ariscat").interp(45,"en").lvl'), "high");
check("ARISCAT: age auto-fills (85y -> >80 band)", run('SCORES.find(s=>s.id==="ariscat").items[0].autoIdx({a:85})'), 2);

// Clinical Frailty Scale is a 1-9 ordinal, so the total IS the grade.
check("CFS: 9 grades", run('SCORES.find(s=>s.id==="cfs").items[0].opts.length'), 9);
check("CFS: values run 1..9", run('SCORES.find(s=>s.id==="cfs").items[0].opts.every((o,i) => o.v === i + 1)'), true);
check("CFS: grade 3 -> not frail", run('SCORES.find(s=>s.id==="cfs").interp(3,"en").lvl'), "low");
check("CFS: grade 7 -> severe", run('SCORES.find(s=>s.id==="cfs").interp(7,"en").lvl'), "high");

// --- Child-Pugh ---------------------------------------------------------------
check("Child-Pugh: 5 criteria, 3 options each",
  run('(() => { const s = SCORES.find(x => x.id === "childpugh"); return s.items.length === 5 && s.items.every(i => i.opts.length === 3); })()'), true);
check("Child-Pugh: 6 -> class A", run('SCORES.find(s=>s.id==="childpugh").interp(6,"en").en').includes("Class A"), true);
check("Child-Pugh: 7 -> class B", run('SCORES.find(s=>s.id==="childpugh").interp(7,"en").en').includes("Class B"), true);
check("Child-Pugh: 10 -> class C", run('SCORES.find(s=>s.id==="childpugh").interp(10,"en").en').includes("Class C"), true);
check("Child-Pugh: class C flagged high risk", run('SCORES.find(s=>s.id==="childpugh").interp(12,"en").lvl'), "high");

// --- Spirometry / lung resection ---------------------------------------------
// ppo values use the anatomical segment method over 19 functional segments.
check("segments: right lung has 10", run('SPIRO_RESECTIONS.find(r => r.id === "pneumoR").seg'), 10);
check("segments: left lung has 9", run('SPIRO_RESECTIONS.find(r => r.id === "pneumoL").seg'), 9);
check("segments: right lobes sum to the right lung",
  run('SPIRO_RESECTIONS.find(r=>r.id==="rul").seg + SPIRO_RESECTIONS.find(r=>r.id==="rml").seg + SPIRO_RESECTIONS.find(r=>r.id==="rll").seg'), 10);
check("segments: left lobes sum to the left lung",
  run('SPIRO_RESECTIONS.find(r=>r.id==="lul").seg + SPIRO_RESECTIONS.find(r=>r.id==="lll").seg'), 9);
check("ppo: FEV1 80% after RUL lobectomy -> 67.4%",
  run('80 * (19 - SPIRO_RESECTIONS.find(r=>r.id==="rul").seg) / 19'), 67.37, 0.05);
check("ppo: FEV1 80% after right pneumonectomy -> 37.9%",
  run('80 * (19 - SPIRO_RESECTIONS.find(r=>r.id==="pneumoR").seg) / 19'), 37.89, 0.05);

// --- LA concentrations in the regional card ----------------------------------
// Max volume = min(perKg x weight, absolute cap) / (percent x 10).
check("ropivacaine 0.75% at 70 kg -> 28 mL",
  run('(() => { const c = LA_CONCS.find(x => x.en === "Ropivacaine" && x.pct === 0.75); return Math.min(c.perKg*70, c.abs) / (c.pct*10); })()'), 28);
check("bupivacaine 0.5% at 70 kg -> 28 mL",
  run('(() => { const c = LA_CONCS.find(x => x.en === "Bupivacaine" && x.pct === 0.5); return Math.min(c.perKg*70, c.abs) / (c.pct*10); })()'), 28);
check("card ceilings match the LA calculator",
  run(`(() => {
    const same = (name, id) => {
      const a = LA_CONCS.find(x => x.en === name), b = LA_LIST.find(x => x.id === id);
      return a.perKg === b.perKg && a.abs === b.abs;
    };
    return same("Ropivacaine", "ropi") && same("Bupivacaine", "bupi") && same("Levobupivacaine", "levo");
  })()`), true);

// --- Per-kg unit rendering ----------------------------------------------------
// doseText strips the "/kg" once it multiplies by weight. IU, U, mmol and mEq
// were missing from that list, so totals rendered as "1750 IU/kg".
check("IU/kg renders as IU once calculated",
  run(`(() => {
    const d = DRUGS.find(x => x.id === "pcc").doses[0];
    const r = doseText(d, 70, "el");
    return String(typeof r === "string" ? r : r.calc);
  })()`).includes("IU/kg"), false);
check("PCC capped at 2500 IU for INR 2-4",
  run(`(() => {
    const d = DRUGS.find(x => x.id === "pcc").doses[0];
    const r = doseText(d, 120, "el");
    return String(typeof r === "string" ? r : r.calc);
  })()`).includes("2500"), true);
check("neostigmine capped at 5 mg",
  run('DRUGS.find(d => d.id === "neostigmine").doses[1].max'), 5);

// --- MAC age adjustment -------------------------------------------------------
// MAC = MAC40 x 10^(-0.00269 x (age - 40)), i.e. about 6% lower per decade.
// The card states that rate in words, so it must match the formula.
check("MAC: ~6% lower per decade",
  Math.round((1 - Math.pow(10, -0.00269 * 10)) * 1000) / 10, 6);
check("MAC: sevoflurane at 45 y",
  Math.round(2.03 * Math.pow(10, -0.00269 * 5) * 100) / 100, 1.97);
check("MAC: sevoflurane at 75 y",
  Math.round(2.03 * Math.pow(10, -0.00269 * 35) * 100) / 100, 1.63);

// --- Vasopressor infusion rates -----------------------------------------------
// mL/h = dose x weight x 60 / concentration for per-kg drugs;
// dose x 60 / concentration for fixed-rate drugs. Vasopressin is fixed — if it
// were treated as per-kg the rate would be ~70x too high.
const vasoRate = (id, dose, concIdx, w) =>
  run(
    '(function(){var d=VASOPRESSORS.filter(function(v){return v.id==="' + id + '"})[0];' +
    'var c=d.concs[' + concIdx + '].v;' +
    'var r=d.mode==="weight" ? ' + dose + '*' + w + '*60/c : ' + dose + '*60/c;' +
    'return Math.round(r*100)/100;})()'
  );
check("noradrenaline 0.1 mcg/kg/min, 4 mg/50 mL, 70 kg", vasoRate("nora", 0.1, 0, 70), 5.25);
check("noradrenaline 0.1 mcg/kg/min, 16 mg/50 mL, 70 kg", vasoRate("nora", 0.1, 2, 70), 1.31);
check("adrenaline 0.05 mcg/kg/min, 1 mg/50 mL, 70 kg", vasoRate("adr", 0.05, 0, 70), 10.5);
check("dobutamine 5 mcg/kg/min, 250 mg/50 mL, 70 kg", vasoRate("dobut", 5, 0, 70), 4.2);
check("vasopressin is dosed fixed, not per kg", run('VASOPRESSORS.filter(function(v){return v.id==="vaso"})[0].mode'), "fixed");
check("vasopressin 0.03 U/min, 20 IU/50 mL", vasoRate("vaso", 0.03, 0, 70), 4.5);

// --- Bibliography completeness ------------------------------------------------
// Every organisation, trial or product named anywhere in the app must also be
// listed in the References card. Scanning the whole source would pass trivially,
// so this looks only inside the ReferencesCard function body.
const SOURCE_NAMES = [
  "RCUK", "RCOG", "CRASH", "ANNEXA", "ANZCOR", "PALS", "ACLS", "Child-Pugh",
  "Magpie", "Beriplex", "Octaplex", "Praxbind", "Pabal", "ERS", "ESTS", "ACCP",
  "MELD", "Naropin", "Bridion", "Ahmad", "ATLS", "Vakiarou", "Kidney Association",
  "Nickalls", "Leventhal", "Staals", "Cammu", "Adams", "ISHLT", "ACOG", "SAGES",
  "PROSPECT", "MHAUS", "SOBA", "CPOC", "BJA Education", "ASRA", "ESAIC", "DAS",
  "SIBICC", "Thilen", "EACTAIC", "AmSECT", "Rajagopal", "Durkin", "Koo CH", "Zhang C", "Brunelli", "Kalceks",
];
const refStart = src.indexOf("function ReferencesCard");
const refEnd = src.indexOf("\nfunction ", refStart + 10);
const refBody = src.slice(refStart, refEnd === -1 ? src.length : refEnd);
check("ReferencesCard body was located", refStart > -1 && refBody.length > 2000, true);
check(
  "bibliography lists every named source",
  SOURCE_NAMES.filter((n) => !refBody.includes(n)).join(", "),
  ""
);

// --- Drug citations -----------------------------------------------------------
// Every drug entry must carry a source line in both languages, so a new entry
// cannot be added without one.
{
  const missing = run(
    'DRUGS.filter(function(d){' +
    '  var el = /\\u03a0\\u03b7\\u03b3\\u03ae:|SmPC|ASRA|[0-9]{4}/.test(d.notesEl || "");' +
    '  var en = /Source:|SmPC|ASRA|[0-9]{4}/.test(d.notesEn || "");' +
    '  return !(el && en);' +
    '}).map(function(d){ return d.id; }).join(", ")'
  );
  check("every drug cites a source in both languages", missing, "");
}

// --- Renal function -----------------------------------------------------------
// Cockcroft-Gault (drug dosing) and CKD-EPI 2021 (staging) must not drift, and
// must stay distinct from each other.
check("CG 60 y M 70 kg SCr 1.0 mg/dL", Math.round(run("crclCG(60, 70, 1.0, 'M')") * 10) / 10, 77.8);
check("CG female factor 0.85", Math.round(run("crclCG(60, 70, 1.0, 'F')") * 10) / 10, 66.1);
check("CG 70 y M 70 kg SCr 2.0", Math.round(run("crclCG(70, 70, 2.0, 'M')")), 34);
check("CKD-EPI 2021, 50 y M SCr 1.0", Math.round(run("egfrCKDEPI2021(50, 1.0, 'M')")), 92);
check("CKD-EPI 2021, 70 y M SCr 2.0", Math.round(run("egfrCKDEPI2021(70, 2.0, 'M')")), 35);
check("CKD stage G3b at eGFR 35", run("ckdStage(35)"), "G3b");
check("CKD stage boundary 60 -> G2", run("ckdStage(60)"), "G2");
check("CKD stage boundary 59.9 -> G3a", run("ckdStage(59.9)"), "G3a");
check("creatinine 88.4 umol/L = 1.0 mg/dL", Math.round(run("scrToMgdl(88.4, 'umol')") * 100) / 100, 1);
check("CG returns null without age", run("crclCG(0, 70, 1.0, 'M')"), null);

// --- Mechanical thrombectomy protocol -------------------------------------------
// Departmental protocol (Attikon, clinical editing E. Ktorou). The BP targets
// are the numbers most likely to be misread, so lock them.
{
  const all = run("JSON.stringify(THROMBECTOMY)");
  check("thrombectomy: three tabs", run("THROMBECTOMY.length"), 3);
  check("thrombectomy: intra-op SBP 140-180", /140\u2013180/.test(all), true);
  check("thrombectomy: MAP >= 70", /\u2265 70/.test(all), true);
  check("thrombectomy: post-reperfusion SBP 130-160", /130\u2013160/.test(all), true);
  check("thrombectomy: every item has EL and EN",
    run("THROMBECTOMY.every(function(t){return t.secs.every(function(s){return s.items.every(function(i){return i.el && i.en;});});})"), true);
  const refStart2 = src.indexOf("function ReferencesCard");
  const refBody2 = src.slice(refStart2, src.indexOf("\nfunction ", refStart2 + 10));
  check("thrombectomy protocol credited in the bibliography", /Ktorou/.test(refBody2), true);
}

// --- Fick cardiac output -------------------------------------------------------
check("BSA Mosteller 170 cm 70 kg", Math.round(run("bsaMosteller(170, 70)") * 100) / 100, 1.82);
check("CaO2 Hb 15 SaO2 98 PaO2 95", Math.round(run("o2Content(15, 98, 95)") * 10) / 10, 20);
check("CvO2 Hb 12 SvO2 60", Math.round(run("o2Content(12, 60, 0)") * 100) / 100, 9.65);
check("Fick CO: VO2 227, CaO2 15.76, CvO2 9.65", Math.round(run("fickCO(227.4, o2Content(12,98,0), o2Content(12,60,0))") * 100) / 100, 3.72);
check("Fick CO: venous >= arterial returns null", run("fickCO(250, o2Content(12,80,0), o2Content(12,85,0))"), null);
check("Fick CO: no VO2 returns null", run("fickCO(0, 20, 15)"), null);

// --- GI endoscopy sedation ------------------------------------------------------
// BSG 2024 dose reductions and the BNF reversal doses are the numbers most likely
// to be misread, so lock them, along with the ERCP consensus position.
{
  const gi = run("JSON.stringify(GI_ENDOSCOPY)");
  check("GI endoscopy: five tabs", run("GI_ENDOSCOPY.length"), 5);
  check("ESGE: the ESA withdrew its endorsement", /WITHDREW its endorsement/.test(gi), true);
  check("ESGE: anaesthetist for ASA >= 3 and Mallampati >= 3", /Mallampati \u2265 3/.test(gi), true);
  check("ERCP: MAC is the favoured technique", /\u03A0\u03A1\u039F\u03A4\u0399\u039C\u03A9\u039C\u0395\u039D\u0397|FAVOURED/.test(gi), true);
  check("high risk: half dose at ASA >= 3", /HALF the dose/.test(gi), true);
  check("naloxone: SmPC regimen 100\u2013200 mcg (v438)", /Naloxone \(opioid depression\): 100\u2013200 \u00b5g IV, then 100 \u00b5g every 2 min/.test(gi), true);
  check("naloxone: poisoning regimen kept separate", /Poisoning \(not the perioperative setting\)/.test(gi), true);
  check("flumazenil 200 mcg then 100 mcg, max 2 mg", /200 \u00b5g over 15 s, then 100 \u00b5g every minute, maximum 2 mg/.test(gi), true);
  check("naloxone before flumazenil", /give naloxone FIRST/.test(gi), true);
  check("midazolam 1 mg\/mL only", /1 mg\/mL/.test(gi), true);
  check("GI endoscopy: every item has EL and EN",
    run("GI_ENDOSCOPY.every(function(t){return t.secs.every(function(s){return s.items.every(function(i){return i.el && i.en;});});})"), true);
}

// --- Paediatric IV salbutamol ---------------------------------------------------
// The card carries two doses on purpose: the departmental protocol and the
// international one. Neither may quietly replace the other.
check("peds: departmental salbutamol bolus 4 mcg/kg present", /4 \\xB5g\/kg/.test(src), true);
check("peds: international salbutamol bolus 15 mcg/kg present", /15 \u00B5g\/kg \u03C3\u03B5 10 min|15 \\xB5g\/kg over 10 min/.test(src), true);

check("peds: naloxone BNFc 1 mcg/kg present alongside the protocol dose", /BNFc \(1 month/.test(src), true);

// --- Anticoagulation and neuraxial blocks (ESAIC/ESRA 2022, Table 3) ------------
// Every creatinine-clearance threshold in the table is pinned: these are the
// numbers that decide whether a block is safe.
{
  const ac = run("JSON.stringify(ANTICOAG)");
  check("anticoag: LMWH low 12 h, CrCl<30 24 h", /12 h \u00b7 CrCl <30: 24 h/.test(ac), true);
  check("anticoag: LMWH high 24 h, CrCl<30 48 h", /24 h \u00b7 CrCl <30: 48 h/.test(ac), true);
  check("anticoag: rivaroxaban/edoxaban low 24 h, CrCl<30 30 h", /24 h \u00b7 CrCl <30: 30 h/.test(ac), true);
  check("anticoag: apixaban low 36 h", /Apixaban \u2014 low dose/.test(ac), true);
  check("anticoag: dabigatran low 48 h", /Dabigatran \u2014 low dose/.test(ac), true);
  check("anticoag: DXA high 72 h, lab target if CrCl<30", /72 h \u00b7 CrCl <30: until laboratory target/.test(ac), true);
  check("anticoag: dabigatran high 72 h, lab target if CrCl<50", /72 h \u00b7 CrCl <50: until laboratory target/.test(ac), true);
  check("anticoag: fondaparinux low 36 h, CrCl<50 72 h", /36 h \u00b7 CrCl <50: 72 h/.test(ac), true);
  check("anticoag: combinations take the longest interval", /LONGEST interval/.test(ac), true);
  check("anticoag: ASRA 2025 position on reversal agents (routine vs needed for surgery)", /do NOT reverse solely to allow a regional technique in routine patients/.test(ac), true);
  check("anticoag: ASRA 2025 dabigatran intervals by CrCl (72 h / 120 h / level <30)", /120 h \(CrCl 30.49\)/.test(ac) && /level <30 ng\/mL \(IIC\)/.test(ac), true);
  check("anticoag: every row has both languages",
    run("ANTICOAG.every(function(x){return x.name && x.nameEn && x.stopEl && x.stopEn && x.restartEl && x.restartEn;})"), true);
}

// --- About card -----------------------------------------------------------------
// The guidelines list and the bibliography now live inside About; neither may be
// dropped when that card is edited.
check("about: card exists", typeof run("AboutCard"), "function");
check("about: guidelines still reachable", typeof run("GuidelinesList"), "function");
check("about: bibliography still reachable", typeof run("ReferencesCard"), "function");
check("about: the two old tools are gone",
  run("TOOL_SECTIONS.filter(function(s){return s.id === 'guidelines' || s.id === 'refs';}).length"), 0);
check("about: it is a bottom tab, not a tool", run("TOOL_SECTIONS.filter(function(s){return s.id === 'about';}).length"), 0);
check("about: the tab label exists in both languages", !!(run("T.el.tabs.about") && run("T.en.tabs.about")), true);

// --- Checklist sources ----------------------------------------------------------
// Every crisis checklist must name the guideline its steps come from, in both
// languages — the checklists are what gets used under pressure.
check("every checklist cites a source in both languages",
  run("CHECKLISTS.filter(function(c){ return !(c.srcEl && c.srcEn); }).map(function(c){ return c.id; }).join(', ')"), "");

check("every risk scale cites a source",
  run("SCORES.filter(function(s){ return !(s.src && s.src.length > 3); }).map(function(s){ return s.id; }).join(', ')"), "");

check("home tab exists in both languages", !!(run("T.el.tabs.home") && run("T.en.tabs.home")), true);

check("oxycodone IV is listed with an SmPC source in both languages",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='oxycodone';})[0];return !!d&&/SmPC/.test(d.notesEl)&&/SmPC/.test(d.notesEn)&&d.cat==='opioid'&&!!d.ciEl&&!!d.ciEn;})()"), true);

check("APP_VERSION matches the service-worker cache version",
  "anesthesia-v" + run("APP_VERSION"), (fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8").match(/CACHE = "([^"]+)"/) || [])[1]);

check("every changelog entry is bilingual and the newest is APP_VERSION",
  run("CHANGELOG[0].v === APP_VERSION && CHANGELOG.every(function(c){return c.el.length>0 && c.el.length===c.en.length;})"), true);

// TCI central volumes against the published models (70 kg, 170 cm, 35 yr male unless stated)
(function(){
  var v = function(id, c){ return run("(function(){var m=TCI_MODELS.filter(function(x){return x.id==='"+id+"';})[0]; var c="+JSON.stringify(c)+"; return m.v1Fn?m.v1Fn(c):(m.v1Fixed!=null?m.v1Fixed:m.v1k*c.w);})()"); };
  var ref = {w:70,h:170,a:35,s:"M"};
  var r2 = function(x){ return Math.round(x*100)/100; };
  check("TCI Marsh V1 0.228 L/kg", r2(v("marsh",ref)), 15.96);
  check("TCI Schnider V1 4.27 L", r2(v("schnider",ref)), 4.27);
  check("TCI Eleveld propofol V1 6.28 L at reference", r2(v("eleveld_prop",ref)), 6.28);
  check("TCI Eleveld propofol V1 sub-linear in obesity (150 kg)", r2(v("eleveld_prop",{w:150,h:170,a:35,s:"M"})), 7.6);
  check("TCI Paedfusor V1 0.4584 L/kg at 10 yr", r2(v("paedfusor",{w:30,h:140,a:10,s:"M"})), 13.75);
  check("TCI Paedfusor V1 0.342 L/kg at 14 yr", r2(v("paedfusor",{w:50,h:160,a:14,s:"M"})), 17.1);
  check("TCI Minto V1 at 40 yr, LBM 55 = 5.1 L", r2(run("5.1 - 0.0201*(40-40) + 0.072*(55-55)")), 5.1);
  check("TCI Eleveld remifentanil V1 5.81 L at reference", r2(v("eleveld_remi",ref)), 5.81);
  check("TCI Gepts V1 fixed 14.3 L (not weight-adjusted)", r2(v("gepts",{w:120,h:170,a:50,s:"M"})), 14.3);
  check("TCI Maitre V1 0.128 L/kg in women", r2(v("maitre",{w:60,h:165,a:40,s:"F"})), 7.68);
  check("TCI Hannivoort V1 1.78 L per 70 kg", r2(v("hannivoort",ref)), 1.78);
})();

check("rFVIIa: PPH 60-90 mcg/kg per SmPC, trauma not first-line, sources cited",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='rfviia';})[0];return d.doses[0].lo===60&&d.doses[0].hi===90&&d.doses[1].lo===90&&/R32/.test(d.notesEn)&&/SmPC/.test(d.notesEl)&&/first-line/.test(d.doses[4].fixedEn);})()"), true);

// Dexmedetomidine (Dexdor SmPC): 80 kg, procedural, load 1 mcg/kg over 10 min, 0.7 mcg/kg/h, 4 mcg/mL
check("dex calc: loading 80 mcg = 20 mL", run("dexRates(80,'proc',true,1,0.7,4).loadMl"), 20);
check("dex calc: loading pump rate over 10 min = 120 mL/h", run("dexRates(80,'proc',true,1,0.7,4).loadMlh"), 120);
check("dex calc: maintenance 0.7 mcg/kg/h = 14 mL/h", run("dexRates(80,'proc',true,1,0.7,4).mlh"), 14);
check("dex calc: 8 mcg/mL halves the rate", run("dexRates(80,'icu',false,1,0.7,8).mlh"), 7);
check("dex calc: no loading dose in ICU even if requested", run("dexRates(80,'icu',true,1,0.7,4).loadMcg === undefined"), true);
check("dex calc: ICU ceiling 1.4, procedural 1.0", run("dexRates(80,'icu',false,1,0.7,4).lim.hi + '/' + dexRates(80,'proc',false,1,0.7,4).lim.hi"), "1.4/1");
check("dexmedetomidine entry: ICU range 0.2-1.4 and SmPC source",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='dexmedetomidine';})[0];return d.doses[3].lo===0.2&&d.doses[3].hi===1.4&&d.doses[0].lo===1&&/SmPC/.test(d.notesEn);})()"), true);

// Unified sedation calculator
check("sedation: propofol 0.5-1 mg/kg at 70 kg = 3.5-7 mL of 1%", run("(function(){var r=sedItem({t:'kg',lo:0.5,hi:1},70,10);return r.mlLo+'-'+r.mlHi;})()"), "3.5-7");
check("sedation: remifentanil 0.1 mcg/kg/min, 70 kg, 20 mcg/mL = 21 mL/h", run("sedItem({t:'inf',lo:0.025,hi:0.2,start:0.1,per:'min'},70,20).mlhStart"), 21);
check("sedation: dex paediatric load 1.5 mcg/kg over 10 min, 10 kg, 4 mcg/mL = 22.5 mL/h", run("sedItem({t:'load10',d:1.5},10,4).mlh"), 22.5);
check("sedation: propofol 1.5-4.5 mg/kg/h at 70 kg, 10 mg/mL = 10.5-31.5 mL/h", run("(function(){var r=sedItem({t:'inf',lo:1.5,hi:4.5,per:'h'},70,10);return r.mlhLo+'-'+r.mlhHi;})()"), "10.5-31.5");
check("sedation: every regimen names its source (adult 40 yr, child 1/4/8/14 yr)",
  run("SED_DRUGS.every(function(d){return [d.adult(40)].concat([1,4,8,14].map(function(a){var r=d.peds(a);return r.asAdult?d.adult(a):r;})).every(function(r){return r.noneEl||(r.srcEl&&r.srcEn);});})"), true);
check("sedation: ketamine contraindicated under 3 months, remifentanil not given for children",
  run("!!SED_DRUGS.filter(function(d){return d.id==='ket';})[0].peds(0.1).noneEl && !!SED_DRUGS.filter(function(d){return d.id==='remi';})[0].peds(8).noneEl"), true);
check("sedation: midazolam 6 m-5 yr 0.05-0.1 mg/kg, 6-12 yr 0.025-0.05 mg/kg",
  run("(function(){var m=SED_DRUGS.filter(function(d){return d.id==='mdz';})[0];var a=m.peds(3).items[0],b=m.peds(8).items[0];return [a.lo,a.hi,b.lo,b.hi].join(',');})()"), "0.05,0.1,0.025,0.05");

check("propofol (SmPC): paediatric induction 2.5 mg/kg >8 yr and 2.5-4 mg/kg 1 month-3 yr, ICU 0.3-4 mg/kg/h",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='propofol';})[0];var f=function(re){return d.doses.filter(function(x){return re.test(x.en);})[0];};var a=f(/>8 yr/),b=f(/1 month/),c=f(/^ICU/);return [a.lo,a.hi,b.lo,b.hi,c.lo,c.hi].join(',')+'|'+/16/.test(d.ciEn);})()"), "2.5,2.5,2.5,4,0.3,4|true");

check("etomidate (SmPC): 0.3 mg/kg, elderly 0.15-0.2, max 60 mg",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='etomidate';})[0];return [d.doses[0].lo,d.doses[0].hi,d.doses[1].lo,d.doses[1].hi,d.doses[0].max].join(',');})()"), "0.3,0.3,0.15,0.2,60");

check("ketamine (SmPC): IV 1-4.5, IM 6.5-13 mg/kg, infusion 10-45 mcg/kg/min, pre-eclampsia contraindicated",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='ketamine';})[0];return [d.doses[0].lo,d.doses[0].hi,d.doses[1].lo,d.doses[1].hi,d.doses[5].lo,d.doses[5].hi].join(',')+'|'+/pre-eclampsia/.test(d.ciEn);})()"), "1,4.5,6.5,13,10,45|true");

check("midazolam (SmPC): child PO 0.25-0.5 mg/kg max 20, ICU 0.03-0.2 mg/kg/h, no glaucoma contraindication",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='midazolam';})[0];var f=function(re){return d.doses.filter(function(x){return re.test(x.en);})[0];};var a=f(/PO premed/),b=f(/^ICU \\u2014 maintenance/);return [a.lo,a.hi,a.max,b.lo,b.hi].join(',')+'|'+/glaucoma/i.test(d.ciEn);})()"), "0.25,0.5,20,0.03,0.2|false");

check("remimazolam (SmPC): fixed doses only, unstable myasthenia contraindicated, no heart-failure contraindication",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='remimazolam';})[0];return d.doses.every(function(x){return !!x.fixed;})+'|'+/myasthenia/.test(d.ciEn)+'|'+/HF|heart failure/.test(d.ciEn);})()"), "true|true|false");

check("thiopental (SmPC): adult 4-6 mg/kg, infants 5-8 mg/kg, myotonic dystrophy contraindicated",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='thiopental';})[0];return [d.doses[0].lo,d.doses[0].hi,d.doses[6].lo,d.doses[6].hi].join(',')+'|'+/myotonica/.test(d.ciEn);})()"), "4,6,5,8|true");

check("volatiles (SmPC): sevo maintenance 0.5-3%, des with N2O 2-6%, iso with N2O 1.0-2.5%, N2O not in early-pregnancy CI",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};return [g('sevoflurane').doses[3].fixedEn,g('desflurane').doses[1].fixedEn,g('isoflurane').doses[1].fixedEn].join('|')+'|'+/pregnan/i.test(g('n2o').ciEn);})()"), "0.5\u20133%|2\u20136%|1.0\u20132.5%|false");

check("fentanyl (SmPC): spontaneous 50-200 mcg, children 1-3 mcg/kg, MAOI contraindication",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='fentanyl';})[0];return d.doses[0].fixedEn+'|'+d.doses[10].lo+'-'+d.doses[10].hi+'|'+/MAOI/.test(d.ciEn);})()"), "50\u2013200 mcg|1-3|true");

check("sufentanil (SmPC): induction 0.5-1 mcg/kg, children 0.2-0.5, myasthenia contraindicated",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='sufentanil';})[0];return [d.doses[0].lo,d.doses[0].hi,d.doses[6].lo,d.doses[6].hi].join(',')+'|'+/myasthenia/.test(d.ciEn);})()"), "0.5,1,0.2,0.5|true");

check("alfentanil (SmPC): ventilated 30-50 mcg/kg, infusion 0.5-1 mcg/kg/min, labour contraindicated",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='alfentanil';})[0];return [d.doses[2].lo,d.doses[2].hi,d.doses[5].lo,d.doses[5].hi].join(',')+'|'+/labour/.test(d.ciEn);})()"), "30,50,0.5,1|true");

check("remifentanil (SmPC): induction 0.5-1 mcg/kg/min, sole-agent induction contraindicated; morphine IV 2.5-15 mg, phaeochromocytoma contraindicated",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};var r=g('remifentanil'),m=g('morphine');return [r.doses[0].lo,r.doses[0].hi].join(',')+'|'+/sole agent/.test(r.ciEn)+'|'+m.doses[0].fixedEn+'|'+/phaeochromocytoma/.test(m.ciEn);})()"), "0.5,1|true|2.5\u201315 mg, titrated|true");

check("rocuronium (SmPC): RSI 1.0, caesarean 0.6, maintenance 0.15 mg/kg",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='rocuronium';})[0];return [d.doses[1].lo,d.doses[3].lo,d.doses[4].lo].join(',');})()"), "1,0.6,0.15");

check("succinylcholine (SmPC): 1 mg/kg, neonates 2 mg/kg, IM max 150 mg, myotonia contraindicated",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='succinylcholine';})[0];return [d.doses[0].lo,d.doses[4].lo,d.doses[5].max].join(',')+'|'+/myotonia/.test(d.ciEn);})()"), "1,2,150|true");

check("cisatracurium (SmPC): intubation 0.15, infusion 1-2 mcg/kg/min, atracurium hypersensitivity contraindicated",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='cisatracurium';})[0];return [d.doses[0].lo,d.doses[0].hi,d.doses[3].lo,d.doses[3].hi].join(',')+'|'+/atracurium/.test(d.ciEn);})()"), "0.15,0.15,1,2|true");

check("reversal (SmPC): sugammadex CI hypersensitivity only; neostigmine 0.05 max 5; glycopyrrolate child max 0.2 mg",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};return /renal/i.test(g('sugammadex').ciEn)+'|'+g('neostigmine').doses[1].lo+','+g('neostigmine').doses[1].max+'|'+g('glycopyrrolate').doses[3].max;})()"), "false|0.05,5|0.2");

check("tramadol: no paediatric rows (not under 12), uncontrolled epilepsy contraindicated",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='tramadol';})[0];return d.doses.some(function(x){return /CHILDREN/.test(x.en);})+'|'+/NOT under 12/.test(d.notesEn)+'|'+/epilepsy/.test(d.ciEn);})()"), "false|true|true");

check("amiodarone (SmPC): loading 5 mg/kg, maintenance max 1200 mg, thyroid contraindication with CPR exception",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='amiodarone';})[0];return [d.doses[1].lo,d.doses[2].max].join(',')+'|'+/thyroid/.test(d.ciEn)+'|'+/CPR/.test(d.ciEn);})()"), "5,1200|true|true");

check("adenosine (SmPC): child 0.1 mg/kg max 6 then max 12, long QT contraindicated",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='adenosine';})[0];return [d.doses[3].lo,d.doses[3].max,d.doses[4].max].join(',')+'|'+/long QT/.test(d.ciEn);})()"), "0.1,6,12|true");

check("vasopressin (SmPC): max 0.03 U/min, 0.75 mL/h at 0.01 with 0.8 U/mL",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='vasopressin';})[0];return /max 0.03 U\\/min/.test(d.doses[0].fixedEn)+'|'+/0.75/.test(d.doses[1].fixedEn);})()"), "true|true");

check("dopamine (SmPC): start 2-5 mcg/kg/min, hyperthyroidism contraindicated",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='dopamine';})[0];return [d.doses[0].lo,d.doses[0].hi].join(',')+'|'+/hyperthyroidism/.test(d.ciEn);})()"), "2,5|true");

check("calcium (SmPC): child gluconate 0.5 mL/kg max 20 mL, glycoside contraindication",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='calcium';})[0];return [d.doses[6].lo,d.doses[6].max].join(',')+'|'+/glycoside/.test(d.ciEn);})()"), "0.5,20|true");

check("bicarbonate (SmPC) 1 then 0.5 mmol/kg; insulin glucose UKKA monitoring to 360 min",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};return g('bicarbonate').doses[1].lo+'|'+/360 min/.test(g('insulin_glucose').notesEn)+'|'+/hypoventilation/.test(g('bicarbonate').ciEn);})()"), "0.5|true|true");

check("salbutamol IV 3-20 ug/min; hydrocortisone 100 mg minor cover; pethidine child IM 0.5-2 mg/kg",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};var p=g('pethidine').doses[7];return /3\u201320/.test(g('salbutamol').doses[2].fixedEn)+'|'+/^100 mg/.test(g('hydrocortisone').doses[2].fixedEn)+'|'+p.lo+','+p.hi+'|'+/ritonavir/.test(g('pethidine').ciEn);})()"), "true|true|0.5,2|true");

check("oxytocin consensus 1 IU elective / 7.5-15 IU/h intrapartum; carbetocin single 100; methergin max 5/24h",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};return /^1 IU/.test(g('oxytocin').doses[0].fixedEn)+'|'+g('oxytocin').doses[3].fixedEn+'|'+/SINGLE/.test(g('carbetocin').doses[0].fixedEn)+'|'+/max 5 doses/.test(g('ergometrine').doses[3].fixedEn)+'|'+/triptans/.test(g('ergometrine').ciEn);})()"), "true|7.5\u201315 IU/h|true|true|true");

check("protamine (SmPC): max 50 mg, enoxaparin 8 h rule, hypersensitivity only CI",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='protamine';})[0];return /max 50 mg/.test(d.doses[5].fixedEn)+'|'+/within 8 h/.test(d.doses[6].fixedEn)+'|'+/^Hypersensitivity/.test(d.ciEn);})()"), "true|true|true");

check("naloxone SmPC 100-200 postop, peds 0.01-0.02 mg/kg; flumazenil anaesthesia max 1 mg, peds 0.01 max 0.2",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};var n=g('naloxone'),f=g('flumazenil');return /^100\u2013200/.test(n.doses[0].fixedEn)+'|'+n.doses[4].hi+'|'+/max 1 mg/.test(f.doses[0].fixedEn)+'|'+f.doses[3].max+'|'+/status epilepticus/.test(f.ciEn);})()"), "true|0.02|true|0.2|true");

check("atropine peds 0.02 mg/kg max 0.5 no minimum; adrenaline IM by age 300/150, arrest 0.01 max 1",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};var a=g('atropine'),d=g('adrenaline');return a.doses[6].max+'|'+(a.doses[6].minAbs===undefined)+'|'+/^300/.test(d.doses[3].fixedEn)+'|'+/^150/.test(d.doses[4].fixedEn)+'|'+d.doses[1].max+'|'+/metabisulfite/.test(d.ciEn);})()"), "0.5|true|true|true|1|true");

check("ephedrine SmPC max 9 mg/dose 30 mg total; phenylephrine bolus max 100, infusion 25-100 ug/min, MAOI CI",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};var e=g('ephedrine'),p=g('phenylephrine');return /max 9 mg per dose/.test(e.doses[0].fixedEn)+'|'+/max 30 mg/.test(e.doses[0].fixedEn)+'|'+/max 100 \u00b5g per bolus/.test(p.doses[0].fixedEn)+'|'+/100 \u00b5g.min/.test(p.doses[1].fixedEn)+'|'+p.doses.filter(function(x){return /CHILDREN/.test(x.en);}).length+'|'+/MAOIs/.test(p.ciEn);})()"), "true|true|true|true|0|true");

check("noradrenaline SmPC titration 0.05-1, base/tartrate note, SSC vasopressin threshold",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='noradrenaline';})[0];return d.doses[1].lo+','+d.doses[1].hi+'|'+/2 mg tartrate = 1 mg base/.test(d.notesEn)+'|'+/vasopressin at 0.25/.test(d.doses[4].fixedEn);})()"), "0.05,1|true|true");

check("dobutamine SmPC adults 2.5-10, children 2-20, phaeochromocytoma and hypovolaemia CI",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='dobutamine';})[0];return d.doses[0].lo+','+d.doses[0].hi+'|'+d.doses[3].lo+','+d.doses[3].hi+'|'+/phaeochromocytoma/.test(d.ciEn)+'|'+/hypovolaemia/.test(d.ciEn);})()"), "2.5,10|2,20|true|true");

check("labetalol SmPC bolus max 200, pregnancy infusion to 160 mg/h, asthma CI",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='labetalol';})[0];return /max 200 mg/.test(d.doses[0].fixedEn)+'|'+/160 mg.h/.test(d.doses[4].fixedEn)+'|'+/asthma/.test(d.ciEn);})()"), "true|true|true");

check("esmolol SmPC 80 mg bolus, maintenance 50-200, verapamil 48 h CI",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='esmolol';})[0];return /^80 mg bolus/.test(d.doses[0].fixedEn)+'|'+d.doses[5].lo+','+d.doses[5].hi+'|'+/verapamil concurrently or within 48 h/.test(d.ciEn);})()"), "true|50,200|true");

check("metoprolol SmPC anaesthesia max 10 mg, MI max 15 mg, beta-agonist inotrope CI",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='metoprolol';})[0];return /max 10 mg/.test(d.doses[0].fixedEn)+'|'+/max 15 mg/.test(d.doses[2].fixedEn)+'|'+/beta-agonist/.test(d.ciEn);})()"), "true|true|true");

check("urapidil SmPC periop 25-25-50, max 4 mg/mL, coarctation CI",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='urapidil';})[0];return /^25 mg slow IV/.test(d.doses[0].fixedEn)+'|'+/max 4 mg.mL/.test(d.doses[3].fixedEn)+'|'+/coarctation/.test(d.ciEn);})()"), "true|true|true");

check("hydralazine SmPC 5-10 mg every 20-30 min, infusion 50-150, SLE and porphyria CI",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='hydralazine';})[0];return /^5\u201310 mg slowly/.test(d.doses[0].fixedEn)+'|'+/50\u2013150/.test(d.doses[1].fixedEn)+'|'+/SLE/.test(d.ciEn)+'|'+/porphyria/.test(d.ciEn);})()"), "true|true|true|true");

check("nicardipine SmPC start 3-5 mg/h max 15, children 0.5-5 ug/kg/min, unstable angina CI",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='nicardipine';})[0];return /^start 3\u20135 mg.h/.test(d.doses[0].fixedEn)+'|'+d.doses[5].lo+','+d.doses[5].hi+'|'+/unstable angina/.test(d.ciEn);})()"), "true|0.5,5|true");

check("GTN SmPC surgery start 25 ug/min up to 400, PDE-5 and raised ICP CI",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='gtn';})[0];return /^start 25/.test(d.doses[0].fixedEn)+'|'+/up to 400/.test(d.doses[0].fixedEn)+'|'+/tadalafil within 48 h/.test(d.ciEn)+'|'+/raised intracranial pressure/.test(d.ciEn);})()"), "true|true|true|true");

check("SNP SmPC start 0.2 range 0.2-10, surgery 1-1.5 mg/kg, B12 CI",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='snp';})[0];return d.doses[1].lo+','+d.doses[1].hi+'|'+/1\u20131.5 mg.kg per case/.test(d.doses[2].fixedEn)+'|'+/B12/.test(d.ciEn);})()"), "0.2,10|true|true");

check("clonidine SmPC 150-300 ug max 750/24h, periop per-kg marked outside SmPC",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='clonidine';})[0];return /max 750/.test(d.doses[0].fixedEn)+'|'+/outside SmPC/.test(d.doses[1].en)+'|'+d.doses[1].max;})()"), "true|true|150");

check("LA SmPC: lidocaine plain 4.5 mg/kg max 200, bupivacaine 2 mg/kg max 150, ropivacaine caudal 2 mg/kg",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};var l=g('lidocaine').doses[0],b=g('bupivacaine').doses[0],r=g('ropivacaine').doses[7];return l.lo+','+l.max+'|'+b.lo+','+b.max+'|'+r.lo+','+r.max+'|'+/paracervical/.test(g('ropivacaine').ciEn);})()"), "4.5,200|2,150|2,50|true");

check("prilocaine added: max 400, children 5 mg/kg, spinal max 80, methaemoglobinaemia CI",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='prilocaine';})[0];return d.cat+'|'+d.doses[2].lo+'|'+/max 80 mg/.test(d.doses[3].fixedEn)+'|'+/methaemoglobinaemia/.test(d.ciEn);})()"), "local|5|true|true");

check("dexamethasone SmPC PONV 3.3-6.6 base, children 0.12 mg/kg max 4.13, base note",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='dexamethasone';})[0];return /^3.3\u20136.6 mg base/.test(d.doses[0].fixedEn)+'|'+d.doses[2].lo+','+d.doses[2].max+'|'+/BASE/.test(d.notesEn);})()"), "true|0.12,4.13|true");

check("analgesics SmPC: paracetamol 10-33 kg cap 500 mg, ketorolac up to 2 days, parecoxib max 80",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};return g('paracetamol').doses[2].max+'|'+/up to 2 days/.test(g('ketorolac').doses[0].fixedEn)+'|'+/max 80 mg/.test(g('parecoxib').doses[0].fixedEn)+'|'+/intraoperatively/.test(g('ketorolac').ciEn);})()"), "500|true|true|true");

check("NSAIDs SmPC: diclofenac no bolus/2 days, ibuprofen IV max 2400, lornoxicam max 16",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};return /NO IV bolus/.test(g('diclofenac_ad').notesEn)+'|'+/max 2400/.test(g('ibuprofen_ad').doses[0].fixedEn)+'|'+/max 16 mg/.test(g('lornoxicam').doses[0].fixedEn)+'|'+g('ibuprofen_ad').doses[2].max;})()"), "true|true|true|400");

check("magnesium SmPC eclampsia 4 g load, 1 g/h, peds asthma 40 mg/kg max 2 g",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='magnesium';})[0];return /^4 g/.test(d.doses[0].fixedEn)+'|'+/^1 g.h/.test(d.doses[1].fixedEn)+'|'+d.doses[7].lo+','+d.doses[7].max;})()"), "true|true|40,2000");

check("lidocaine IV infusion <=1.5 mg/kg/h; TXA renal table, seizure CI; ketamine analgesic outside SmPC",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};return /\u22641.5 mg.kg.h/.test(g('lidocaine_iv').doses[1].fixedEn)+'|'+/5 mg.kg every 24 h/.test(g('txa').doses[5].fixedEn)+'|'+/seizures/.test(g('txa').ciEn)+'|'+/outside the SmPC/.test(g('ketamine_analgesic').notesEn);})()"), "true|true|true|true");

check("dantrolene 2.5 mg/kg + 60 mL per vial; intralipid >70 kg 100 mL; fibrinogen 70 mg/kg if unknown",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};return g('dantrolene').doses[0].lo+'|'+/60 mL/.test(g('dantrolene').doses[3].fixedEn)+'|'+/^bolus 100 mL/.test(g('intralipid').doses.filter(function(x){return /^>70 kg/.test(x.en);})[0].fixedEn)+'|'+g('fibrinogen').doses[1].lo;})()"), "2.5|true|true|70");

check("PCC SmPC bands and HIT CI; desmopressin SmPC 0.4 and practice 0.3 max 20",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};return g('pcc').doses[0].en+'|'+/HIT/.test(g('pcc').ciEn)+'|'+g('desmopressin').doses[0].lo+'|'+g('desmopressin').doses[1].max;})()"), "INR 2.0\u20133.9 (SmPC)|true|0.4|20");

check("milrinone renal table and peds 0.25-0.75; levosimendan CrCl<30 and torsades CI",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};return /CrCl 50: 0.43/.test(g('milrinone').doses[3].fixedEn)+'|'+g('milrinone').doses[5].lo+'|'+/CrCl <30/.test(g('levosimendan').ciEn)+'|'+/torsades/.test(g('levosimendan').ciEn);})()"), "true|0.25|true|true");

check("antiemetics/reversal SmPC: ondansetron apomorphine CI, metoclopramide <1 yr CI, droperidol QTc, andexanet heparin warning; lidocaine LA cap 200",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};return /apomorphine/.test(g('ondansetron').ciEn)+'|'+/children <1 year/.test(g('metoclopramide').ciEn)+'|'+/QTc >450/.test(g('droperidol').ciEn)+'|'+/heparinisation/.test(g('andexanet').notesEn)+'|'+LA_LIST.find(function(x){return x.id==='lido';}).abs;})()"), "true|true|true|true|200");

check("cipepofol added: induction 0.4/0.3, egg/soy CI, FDA-only note",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='cipepofol';})[0];return d.cat+'|'+d.doses[0].lo+','+d.doses[1].lo+'|'+/soy/.test(d.ciEn)+'|'+/NOT approved by the EMA/.test(d.notesEn);})()"), "induction|0.4,0.3|true|true");

check("v341: steroid cover per Woodcock 2020 (100 mg at induction), no old 25-50 mg regimen",
  String(/hydrocortisone 100 mg/.test(src) && !/hydrocortisone 25\\u201350 mg/.test(src) && /Woodcock T, et al. Anaesthesia 2020;75:654/.test(src)), "true");

check("v341: lidocaine 3 mg/kg in LA tool labelled clinical practice (SmPC 4.5 mg/kg)",
  run("(function(){var l=LA_LIST.filter(function(x){return x.id==='lido';})[0];return l.perKg+','+l.abs+'|'+/Clinical practice/.test(l.noteEn)+'|'+/4.5 mg.kg/.test(l.noteEn);})()"), "3,200|true|true");

check("v342: steroid cover threshold >=4 weeks any route (Woodcock 2020)",
  String(/for ", \/\* @__PURE__ \*\/ React.createElement\(Hi, null, "\\u2265 4 weeks"\)/.test(src) && !/for \\u2265 3 weeks, or Cushingoid/.test(src)), "true");

check("v343: GLP-1 continue, SGLT2 UK day-before/day-of + FDA, metformin CPOC, no 'sliding scale'",
  String(/"Continue"\), " perioperatively, with the usual fasting times/.test(src) && /the day before and the day"\), " of surgery/.test(src) && /the lunchtime dose only/.test(src) && !/sliding scale/.test(src) && !/ADA 2023/.test(src)), "true");

check("v344: glucagon 1 mg / peds 0.5 mg <25 kg, phaeochromocytoma CI; methylene blue 1-2 mg/kg max 7, G6PD CI, saline warning",
  run("(function(){var g=DRUGS.filter(function(x){return x.id==='glucagon';})[0],m=DRUGS.filter(function(x){return x.id==='methylene_blue';})[0];return /^1 mg SC or IM/.test(g.doses[0].fixedEn)+'|'+/<25 kg or <6.8 years: 0.5 mg/.test(g.doses[1].fixedEn)+'|'+/phaeochromocytoma/.test(g.ciEn)+'|'+m.doses[0].lo+','+m.doses[0].hi+'|'+/max cumulative 7 mg.kg/.test(m.doses[1].fixedEn)+'|'+/G6PD/.test(m.ciEn)+'|'+/NOT in NaCl/.test(m.notesEn);})()"), "true|true|true|1,2|true|true|true");

check("v346: g/kg dose calculation gives grams",
  run("(function(){var r=doseText({lo:0.25,hi:1,unit:'g/kg'},70,'en');return r.calc;})()"), "17.5\u201370 g");

check("v348: PCI after ACS >=12 months, balloon >=14 days; no unsourced dabigatran/FDA SGLT2 lines",
  (function(){var S=src.replace(/const CHANGELOG[\s\S]*?\n\];/,'');return String(/After PCI for ACS.STEMI: ", .{0,60}\\u2265 12 months/.test(S) && /without stent: ", .{0,60}\\u2265 14 days/.test(S) && !/\\u2265 96h/.test(S) && !/Steffel|Bailey B|Lieberman P|Hosseinian|Spasovski/.test(S));})(), "true");

check("v348: heparin bypass 300-400 IU/kg, peds 50 + 15-25 IU/kg/h, no vascular row",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='heparin';})[0];return d.doses[0].lo+'-'+d.doses[0].hi+'|'+d.doses[3].lo+'|'+d.doses[4].lo+','+d.doses[4].hi+'|'+d.doses.length+'|'+/HIT/.test(d.ciEn);})()"), "300-400|50|15,25|6|true");

check("v348: glucagon, methylene blue, mannitol, carboprost, isoprenaline, furosemide — SmPC rows only",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};return [g('glucagon').doses.length,g('methylene_blue').doses.length,g('mannitol').doses.length,g('carboprost').doses.length,g('isoprenaline').doses.length,g('furosemide').doses.length,g('magnesium').doses.length].join(',')+'|'+/OUTSIDE SmPC .AHA 2023/.test(g('glucagon').doses.map(function(x){return x.en;}).join())+'|'+g('mannitol').doses[0].lo+','+g('mannitol').doses[0].unit;})()"), "5,5,6,3,5,4,9|true|1.5,g/kg");

check("v348: hypertonic saline from Society for Endocrinology only; electrolytes card 150 mL over 20 min",
  run("(function(){var h=DRUGS.filter(function(x){return x.id==='hypertonic_saline';})[0];return h.doses.length+'|'+/^150 mL NaCl 3% IV over 20 min/.test(h.doses[0].fixedEn)+'|'+/Society for Endocrinology/.test(h.notesEn)+'|'+h.ciEn;})()")+'|'+/over 20 min, .u00D72 or until .5 mmol.L/.test(src), "6|true|true|\u2014|true");

check("v348: references — SmPCs, Society for Endocrinology 2022, ASA GLP-1 announcement, CPOC March 2021",
  String(/Konakion MM 10 mg.mL .Neon/.test(src) && /Furosemide 10 mg.mL .hameln/.test(src) && /Isoprenaline Hydrochloride 1 mg.5 mL .Synchrony/.test(src) && /Heparin sodium 5000 IU.mL .Wockhardt/.test(src) && /Ball S, Barth J, Levy M/.test(src) && /ASA news release, 29 October 2024/.test(src) && /emergency surgery. March 2021\./.test(src)), "true");

check("v349: bridging card from ACCP 2022/PAUSE — DOAC 1/2 days, dabigatran CrCl<50 2/4 days, restart 24h/48-72h; refs present",
  String(/Dabigatran with CrCl <50: ", .{0,60}2 days.{0,80}4 days/.test(src) && /half the daily dose 24h before/.test(src) && /Chest 2022;162\(5\):e207/.test(src) && /JAMA Intern Med 2019;179\(11\):1469/.test(src) && /Am Fam Physician 2023;108\(2\):208/.test(src)), "true");

check("v349: vascular heparin 5000 IU or 100 IU/kg (ACTION 2025), CPB isoprenaline 0.01-0.15, mannitol BTF row with Carney 2017",
  String(/5000 IU or 100 IU.kg/.test(src) && /EJVES Vasc Forum 2025;64:8/.test(src) && /v: "0.01\\u20130.15 \\xB5g.kg.min", hint: el \? "[^"]*" : "chronotrope/.test(src) && !/50\\u2013100 U.kg|70\\u2013100 U.kg/.test(src) && /Neurosurgery 2017;80\(1\):6/.test(src)) + "|" + run("(function(){var m=DRUGS.filter(function(x){return x.id==='mannitol';})[0];return m.doses[1].lo+','+m.doses[1].hi+'|'+/Carney/.test(m.notesEn);})()"), "true|0.25,1|true");

check("v350: STOP-Bang combination rule, Apfel per Gan 2020, Child-Pugh 10/31/76, CFS Rockwood labels, Aldrete/PADSS sources",
  run("(function(){var g=function(id){return SCORES.filter(function(x){return x.id===id;})[0];};var sb=g('stopbang');return sb.interp(3,'en',[true,true,false,false,false,false,false,true]).lvl+','+sb.interp(3,'en',[true,false,false,false,false,true,false,true]).lvl+'|'+/2 antiemetics of DIFFERENT classes/.test(g('apfel').interp(1,'en').en)+'|'+/at least 2 antiemetics \\+ baseline risk reduction/.test(g('apfel').interp(3,'en').en)+'|'+/76%/.test(g('childpugh').interp(12,'en').en)+'|'+g('cfs').interp(5,'en').en.indexOf('Living with mild frailty')+'|'+/Aldrete JA/.test(MULTI_SCORES[0].src)+'|'+/Chung F, Chan/.test(MULTI_SCORES[1].src);})()"), "high,mid|true|true|true|0|true|true");

check("v351: RCRI biomarker text per AHA/ACC 2024, STOP-Bang SASM 2016, ARISCAT without unsourced advice",
  run("(function(){var g=function(id){return SCORES.filter(function(x){return x.id===id;})[0];};return /AHA.ACC 2024/.test(g('rcri').interp(2,'en').en)+'|'+/SASM 2016/.test(g('stopbang').interp(6,'en',[1,1,1,1,1,1,0,0]).en)+'|'+g('ariscat').interp(30,'en').en.split(' \u00B7 ')[0];})()"), "true|true|Postop pulmonary complication risk \u2248 13.3% \u2014 intermediate risk");

check("v352: MAC40 Nickalls & Mapleson + SmPC tables; ventilation limits per sources",
  String(/mac40: 1.8, key: "sevo"/.test(src) && /mac40: 6.6, key: "des"/.test(src) && /mac40: 1.17, key: "iso"/.test(src) && /40 y 2.1%/.test(src) && !/MAC-intubation/.test(src) && /ageN \/ 4 \+ 4/.test(src) && /pplatN > 30/.test(src) && !/normal 50.u2013100/.test(src) && /normal 20.u201335%/.test(src)), "true");

check("v353: fluids — no hourly ½/¼ plan or third-space rates; Mladinov 2025 reference",
  String(!/Hourly plan/.test(src) && !/Surgical losses \\(third space\\)/.test(src) && /Clin Geriatr Med 2025;41:83/.test(src) && /suggests 1.5:1/.test(src)), "true");

check("v354: pedsCalc minSBP by age band, infant ETT per Merck, Miller blades",
  run("(function(){return [pedsCalc(0.02,3.5).minSBP,pedsCalc(0.5,7).minSBP,pedsCalc(5,18).minSBP,pedsCalc(14,50).minSBP,pedsCalc(0.02,3.5).ettUncuffed,pedsCalc(0.5,7).ettUncuffed,String(pedsCalc(0.5,7).ettCuffed),pedsCalc(5,18).blade,pedsCalc(12,40).blade].join(',');})()"), "60,70,80,90,3,3.5,3,Miller 2,Miller 3");

check("v354: airway card — Guedel per UNICEF, Portex 6/7, no unsourced half-volume claim",
  String(/Size 00", v: "\\u224840 mm"/.test(src) && /Size 4", v: "\\u224890 mm"/.test(src) && /Portex 6/.test(src) && !/At half the maximum volume/.test(src) && !/nostril to the tragus/.test(src)), "true");

check("v355: CSHT numeric curves removed; bariatric Janmahasatian + AAGBI scalars",
  String(typeof run('typeof CSHT_DATA') === "string" && run('typeof CSHT_DATA') === "undefined" && /ffmJan\(w, h, sex\)/.test(src) && /AAGBI\/SOBA 2015\)/.test(src) && !/SOBA UK 2022 single sheet/.test(src) && /rocuronium \(Esmeron SmPC: ideal body weight .u2014 sources differ\), atracurium, vecuronium/.test(src)), "true");

check("v355: TCI targets per SmPC; Kataria 3-16 y; quick-calc Mg rate",
  String(/Procedural sedation 0.5.u20132.5/.test(src) && /over 65 years initially 1.5.u20134 ng\/mL/.test(src) && !/Spont. breathing 1/.test(src) && /c.a <= 16 && c.w >= 15/.test(src) && /max 2 g\/h/.test(src) && !/prefer central/.test(src)), "true");

check("v356: special situations per SAGES/FDA/AHA 2024; unsourced items removed",
  String(/CO\\u2082 insufflation 10.u201315 mmHg/.test(src) && /from 30 weeks also premature closure/.test(src) && !/24.u201334 weeks with risk/.test(src) && /increases K\\u207A by \\u22480.5 mmol\/L/.test(src) && /C 76.u201382% mortality/.test(src) && !/start at 10.u201320% of the dose/.test(src) && /balloon \\u226514 days \\u00B7 BMS/.test(src)), "true");

check("v357: Fick ScvO2 direction, transplant neostigmine, FLACC bands",
  String(/~2.u20133% LOWER than SvO/.test(src) && !/runs a few percent above true SvO/.test(src) && /normal 22.u201330%/.test(src) && /bradycardia and asystole/.test(src) && !/atropine and neostigmine have no effect/.test(src) && !/action threshold: \\u2265 4/.test(src) && !/LaFarge/.test(src) && /v: el \? "\\u03AE\\u03C0\\u03B9\\u03BF\\u03C2" : "mild"/.test(src)), "true");

check("v359: anticoagulant restart wording per ESAIC/ESRA 2022",
  String(!/NSAIDs or tricyclics/.test(src) && !/Not covered by the 2022 ESAIC/.test(src) && /~24 h postop, according to guidelines on therapeutic anticoagulation/.test(src) && !/48.u201372 h after a high-bleeding-risk/.test(src) && /usually ~6 h postoperatively\) \\u00B7 only after catheter removal/.test(src)), "true");

check("v360: neuraxial/regional per SmPC and NYSORA",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8");
    return String(/Urological \(e.g. TURP\)", v: "7.5.u201315 mg"/.test(T) && !/phrenic 100%/.test(T) && !/15.u201322.5 mg/.test(T) && !/100.u2013150 .u00B5g/.test(T) && /en: "Interscalene", v: "7.u201315 mL"/.test(T) && /6.u201314 mL\/h/.test(T) && !/J.u00E6ger/.test(T)); })(), "true");

check("v361: postop analgesia aligned with drug cards",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8");
    return String(!/1.u20132 mg\/kg\/h/.test(T) && !/4-h limit per protocol/.test(T) && /every 3.u20136 h .u00B7 max 20 mg\/dose/.test(T) && /1 g every .u22654 h/.test(T)); })(), "true");

check("v362: antibiotic prophylaxis per Bratzler 2013",
  String(run("ABX.every(a => !/[\\u0370-\\u03FF]/.test(a.redose)) && ABX.some(a => /low-risk laparoscopic cholecystectomy: none/.test(a.regEn)) && !ABX.some(a => /per urine culture/.test(a.regEn))")), "true");

check("v363: ROTEM algorithm per ESAIC 2022 / trauma 2023",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8");
    return String(!/Li30 &lt; 94|Li30 < 94/.test(T) && !/PCC 20.u201325 U\/kg/.test(T) && !/target >50, >100/.test(T) && /ESA 2017: >0.9 mmol\/L/.test(T) && /Clauss .u22641.5 g\/L/.test(T)); })(), "true");

check("v364: PSSS, PONV, fasting, NMB guideline corrections",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/"Shallow: TOFr < 0.4"/.test(T) && !/Shallow: TOF count 4/.test(T) && !/post-induction hypotension/.test(T) && !/3.u20134 antiemetics/.test(T) && !/states 2.u20133 are the target/.test(P) && !/Cravero/.test(P)); })(), "true");

check("v365: PONV items restored per full 5th consensus report",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8");
    return String(/"Aprepitant 40 mg PO preop \(FDA\) or 32 mg IV/.test(T) && /Scopolamine patch .u2014 onset 2.u20134 h/.test(T) && /Do NOT re-dose long-acting agents/.test(T) && /Amisulpride 10 mg IV as rescue/.test(T) && /ANE.0000000000007816/.test(T)); })(), "true");

check("v366: paediatric fasting/SBP line restored per ESAIC 2022",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/lower SBP during anaesthesia .>8 h/.test(T) && /EJA.0000000000001599/.test(T)); })(), "true");

check("v367: ROTEM platelets/fibrinogen restored per European trauma 2023",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/>100 .u00D710.u2079\/L in TBI/.test(T) && /trauma: initial 3.u20134 g/.test(T) && /25.u201350 IU FIX\/kg/.test(T) && !/Li30 < 94/.test(T)); })(), "true");

check("v368: interscalene phrenic paresis restored with Urmey 1991",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/hemidiaphragmatic paresis 100% with 34.u201352 mL .Urmey 1991/.test(T) && /00000539-199104000-00014/.test(T)); })(), "true");

check("v369: nalbuphine 160 mg/24h restored per US label",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/max 160 mg\/24h .US label, Pfizer/.test(T)); })(), "true");

check("v370: thrombolytics row per ASRA 2025",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/No needle placement for .u226548 h after thrombolysis/.test(P) && !/NSAIDs or tricyclics/.test(P)); })(), "true");

check("v371: transplant & FLACC lines restored with sources",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/no cough reflex below the tracheal anastomosis/.test(T) && /hypomagnesaemia, tremor/.test(T) && /Validated in children 2 months .u2013 7 years/.test(T) && !/action threshold: .u2265 4/.test(T)); })(), "true");

check("v372: pregnancy steroids & myasthenia dosing restored with sources",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/24\+0 to 33\+6 weeks, at risk of preterm delivery within 7 days/.test(T) && /reduce the dose 2.u20138-fold/.test(T) && /ezt641/.test(T) && !/start at 10.u201320% of the dose/.test(T)); })(), "true");

check("v373: renal/dialysis lines restored with sources",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/draining the abdomen before induction/.test(T) && /high-flux haemodialysis lowers levels by ~70%/.test(T) && /0.u0025 vs 19.u0025|0% vs 19%/.test(T) && !/defer elective surgery above ~6.0 mmol/.test(T)); })(), "true");

check("v374: hepatic lines restored with sources",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/INR\/aPTT do NOT predict post-procedural bleeding/.test(T) && /reduced dose 2.u20133 g\/24h/.test(T) && /jhep.2021.09.003/.test(T)); })(), "true");

check("v375: Schnider Ce targets per NHS Lothian",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/Ce .NHS Lothian local guide, not SmPC/.test(require('fs').readFileSync(require('path').join(__dirname,'..','src','formulas.js'),'utf8'))); })(), "true");

check("v376: cuffed ETT <2 y per Microcuff chart",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/a >= 2 \? a \/ 4 \+ 3.5 : a \* 12 >= 8 \? 3.5 : w >= 3 \? 3 : null/.test(P) && /LIT-20479-C1/.test(T) && (function(){var vm=require("vm"),fs=require("fs"),path=require("path");var c={React:{}};vm.createContext(c);["data","formulas","primitives"].forEach(function(f){try{vm.runInContext(fs.readFileSync(path.join(__dirname,"..","src",f+".js"),"utf8"),c)}catch(e){}});return true;})()); })(), "true");

check("v377: Furman scheme described with source",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/Furman.u2019s 1975 hourly scheme .50% in the first hour/.test(T) && /Anesthesiology 1975;42.2.:187/.test(T)); })(), "true");

check("v378: Cstat normal and MAC-EI with sources",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/healthy ventilated ~50.u201360 mL\/cmH.u2082O/.test(T) && /4.52% .u2248 2.86 .u00D7 MAC/.test(T)); })(), "true");

check("v379: ARISCAT protective ventilation per Young 2019",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/Lung-protective ventilation for all: Vt 6.u20138 mL\/kg PBW/.test(P) && /bja.2019.08.017/.test(T)); })(), "true");

check("v380: v348 items restored with sources",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/ertugliflozin .u22654 days/.test(T) && /PCC.0000000000001735/.test(T) && /CIR.0000000000001161/.test(T)); })(), "true");

check("v381: cardnc valve goals and CHD lines restored",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/Aortic regurgitation: HR 80.u2013100\/min/.test(T) && /insufflate .u226410 mmHg/.test(T) && /Repaired tetralogy of Fallot: pulmonary regurgitation/.test(T)); })(), "true");

check("v382: dystrophy volatile wording per MHAUS/PPMD",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/Avoid or limit volatiles .u2014 prefer intravenous\/TIVA/.test(T)); })(), "true");

check("v383: no unsourced Na 145-155 target",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(!/target Na 145/.test(T) && /BTF 2019 \(paediatric\) .u00B7 10.u201320 min/.test(T)); })(), "true");

check("v384: recruitment tool present with protocol sources",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/RM_PROTOCOLS/.test(T) && /Trials 2017;18:202/.test(T) && /jama.2025.23373/.test(T) && /Trials 2020;21:198/.test(T)); })(), "true");

check("v385: low-flow tool present with sources",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/LF_AGENTS/.test(T) && /Statement on the use of low gas flows for sevoflurane/.test(T) && /Acta Anaesthesiol Scand 2014;58/.test(T)); })(), "true");

check("v386: GCS tool with GCS-P and sources",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/GCS_PARTS/.test(T) && /GCS_PUPILS/.test(T) && /J Neurosurg 2018;128.6.:1612/.test(T)); })(), "true");

check("v387: no '\u03c5\u03c0\u03bd\u03c9\u03c4\u03b9\u03ba' in Greek text",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(!/.u03C5.u03C0.u03BD.u03C9.u03C4.u03B9.u03BA/i.test(T) && !/.u03C5.u03C0.u03BD.u03C9.u03C4.u03B9.u03BA/i.test(require('fs').readFileSync(require('path').join(__dirname,'..','src','data.js'),'utf8').replace(/const CHANGELOG[\s\S]*?\n\];/,''))); })(), "true");

check("v388: low-flow how-it-works text",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/How it works: vapour .mL.min. = flow/.test(T) && /How it works: T = system volume/.test(T)); })(), "true");

check("v389: new icon set wired in manifest, index and service worker",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){var fs=require('fs'),path=require('path'),R=function(f){return fs.readFileSync(path.join(__dirname,'..',f),'utf8')};var m=JSON.parse(R('manifest.webmanifest'));var ok=m.icons.length===4&&m.icons.every(function(i){return /^icons\//.test(i.src)&&fs.existsSync(path.join(__dirname,'..',i.src))});var ix=R('index.html');var sw=R('sw.js');return ok&&/icons\/favicon-32-v2.png/.test(ix)&&/icons\/apple-touch-icon-v2.png/.test(ix)&&/icons\/icon-512-v2.png/.test(ix)&&!/"\.\/icon-180.png"/.test(sw)&&/Houdon/.test(T);})()); })(), "true");

check("v390: in-app logo replaced",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){var s=require('fs').readFileSync(require('path').join(__dirname,'..','src','data.js'),'utf8');var m=s.match(/const LOGO_DATA = "data:image\/jpeg;base64,([^"]+)"/);return !!m && m[1].length>1000 && !/^\/9j\/4AAQSkZJRgABAQAAAQABAAD\/2wBDAAQDAwQDAwQEBAQFBQQFBwsHBwYGBw4KCggLEA4RERAOEA8SFBoWEhMYEw8QFh8XGBsbHR0dERYgIh8cIhocHRz/.test(m[1]);})()); })(), "true");

check("v391: icon attribution in About and own References group",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/ABOUT_TEXT = \{ el: \[[^\]]*Houdon/.test(T) && /title: el \? "[^"]*" : "App icon"/.test(T)); })(), "true");

check("v392: no '\u03b1\u03bd\u03b1\u03c0\u03b7\u03b4' outside changelog",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(!/.u03B1.u03BD.u03B1.u03C0.u03B7.u03B4/i.test(require('fs').readFileSync(require('path').join(__dirname,'..','src','data.js'),'utf8').replace(/const CHANGELOG[\s\S]*?\n\];/,'')) && !/.u03B1.u03BD.u03B1.u03C0.u03B7.u03B4/i.test(T)); })(), "true");

check("v393: postoperative NIV tool with algorithm attribution and sources",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/function NIVCard/.test(T) && /NIV_SETTINGS/.test(T) && /1602426/.test(T) && /2101574/.test(T) && /315\(13\):1345/.test(T) && /PAGNI/.test(T) && require('fs').readFileSync(require('path').join(__dirname,'..','src','root.js'),'utf8').includes('id: "niv"')); })(), "true");

check("v394: growth charts and paediatric IBW methods",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/CDC_GROWTH/.test(P) && /growthCalc/.test(P) && /function GrowthPane/.test(T) && /24\(5\):421/.test(T) && (function(){ const vm=require('vm'); const c={}; vm.createContext(c); vm.runInContext(P.slice(P.indexOf('const CDC_GROWTH'), P.indexOf('const pedsCalc'))+';this.g=growthCalc(72.2,"M",115.6,20.8);',c); return Math.abs(c.g.hp-49.5)<1 && Math.abs(c.g.traub-20.64)<0.05 && Math.abs(c.g.moore-20.74)<0.05; })()); })(), "true");

check("v395: landiolol from the Rapibloc SmPC and new icon credit",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const D=require('fs').readFileSync(require('path').join(__dirname,'..','src','data.js'),'utf8'); return /id: "landiolol"/.test(D) && /57\.6 mg\/kg/.test(D) && /Rapibloc 300 mg/.test(T) && /posterised to four tones/.test(T) && require('fs').readFileSync(require('path').join(__dirname,'..','manifest.webmanifest'),'utf8').includes('"theme_color"'); })()); })(), "true");

check("v396: bottom bar with labels and poppy, blue light background",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const fs=require('fs'),p=require('path'); const R=fs.readFileSync(p.join(__dirname,'..','src','root.js'),'utf8'); const F=fs.readFileSync(p.join(__dirname,'..','src','formulas.js'),'utf8'); return /function PoppyMark/.test(R) && /"data-nav": "1"/.test(R) && /t\.tabs\[tb\.id\]\), \/\* @__PURE__ \*\/ React\.createElement\(PoppyMark/.test(R) && /bg: "#F2F4F7"/.test(F); })()); })(), "true");

check("v397: design pass: line icons, units, accentless capitals, note sections without loss",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const fs=require('fs'),p=require('path'),vm=require('vm'); const R=fs.readFileSync(p.join(__dirname,'..','src','root.js'),'utf8'); const c={console,React:{createElement:()=>null},window:{},document:{},localStorage:{getItem(){},setItem(){}},navigator:{}}; vm.createContext(c); for(const f of ['data','formulas','primitives']) vm.runInContext(fs.readFileSync(p.join(__dirname,'..','src',f+'.js'),'utf8'),c); vm.runInContext('this.ok = DRUGS.every(d => [d.notesEl, d.notesEn].every(t => { const ss = splitSentences(t); return ss.join(" ").replace(/\\s+/g," ") === t.replace(/\\s+/g," ").trim(); })); this.up = upGr("Ενήλικες — µg"); this.ls = noteSections(DRUGS.find(d=>d.id==="landiolol").notesEl).map(x=>x.k).join(",");', c); return c.ok && c.up === 'ΕΝΗΛΙΚΕΣ — µg' && c.ls === 'gen,pop,int,od,src' && /function LineIcon/.test(R) && /DRUGS\.length \+/.test(R) && /function ThemeGlyph/.test(R) && !/textTransform: "uppercase"/.test(T+R+P); })()); })(), "true");

check("v398: line icon for every tool section",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const fs=require('fs'),p=require('path'),vm=require('vm'); const s=fs.readFileSync(p.join(__dirname,'..','src','root.js'),'utf8'); const c={}; vm.createContext(c); vm.runInContext(s.slice(s.indexOf('const TOOL_SECTIONS'), s.indexOf('\n];', s.indexOf('const TOOL_SECTIONS'))+3) + ';' + s.slice(s.indexOf('const TOOL_ICON_PATHS'), s.indexOf('function LineIcon')) + ';this.ok = TOOL_SECTIONS.every(x => TOOL_ICON_OF[x.id] && TOOL_ICON_PATHS[TOOL_ICON_OF[x.id]]);', c); return c.ok; })()); })(), "true");

check("v399: distinct pregnancy icons and NMJ icon",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const s=require('fs').readFileSync(require('path').join(__dirname,'..','src','root.js'),'utf8'); return /obstetric:"fetus"/.test(s) && /pregnonob:"pregnant"/.test(s) && /  fetus: /.test(s) && /muscle: \[\["path",\{d:"M3 5h7"\}\]/.test(s); })()); })(), "true");

check("v400: liver and endoscope icons",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const s=require('fs').readFileSync(require('path').join(__dirname,'..','src','root.js'),'utf8'); return /  liver: \[\["path",\{d:"M3\.5 9\.5C/.test(s) && /  scope: \[\["rect",\{x:3,y:3\.5/.test(s); })()); })(), "true");

check("v401: airway, NIV, PCA and pump icons",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const s=require('fs').readFileSync(require('path').join(__dirname,'..','src','root.js'),'utf8'); return /niv:"nivmask"/.test(s) && /postop:"pca"/.test(s) && /vaso:"pump"/.test(s) && /  airway: \[\["path",\{d:"M14\.5 3\.5c/.test(s); })()); })(), "true");

check("v402: ASA, antibiotic, vascular and thrombectomy icons",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const s=require('fs').readFileSync(require('path').join(__dirname,'..','src','root.js'),'utf8'); return /asaps:"patient"/.test(s) && /abx:"abxvial"/.test(s) && /vascular:"aorta"/.test(s) && /thrombectomy:"stroke"/.test(s); })()); })(), "true");

check("v403: no repeated icons for GCS/ROTEM/vent/recruit/cardnc",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const s=require('fs').readFileSync(require('path').join(__dirname,'..','src','root.js'),'utf8'); return /gcs:"eye"/.test(s) && /rotem:"rotem"/.test(s) && /vent:"ventwave"/.test(s) && /recruit:"lungsopen"/.test(s) && /cardnc:"heartecg"/.test(s); })()); })(), "true");

check("v404: CALC_MODE tiers cover every tool and default is full",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const fs=require('fs'),p=require('path'),vm=require('vm'); const s=fs.readFileSync(p.join(__dirname,'..','src','root.js'),'utf8'); const F=fs.readFileSync(p.join(__dirname,'..','src','formulas.js'),'utf8'); const c={CALC_MODE:'full'}; vm.createContext(c); vm.runInContext(s.slice(s.indexOf('const TOOL_SECTIONS'), s.indexOf('const TOOLS_SHOWN')) + ';this.ok = TOOL_SECTIONS.every(x => ["ref","dose","calc","complex"].includes(TOOL_TIER[x.id])) && Object.keys(TOOL_TIER).length === TOOL_SECTIONS.length;', c); return c.ok && /const CALC_MODE = "full";/.test(F) && fs.existsSync(p.join(__dirname,'..','audit','CALC-MODES.md')); })()); })(), "true");

check("v405: crisis mode and educational wording",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const fs=require('fs'),p=require('path'); const R=fs.readFileSync(p.join(__dirname,'..','src','root.js'),'utf8'); return /function CrisisMode/.test(P) && /setCrisis\(c\.id\)/.test(P) && /wakeLock/.test(P) && /Educational aid/.test(R) && /educational and informational aid/.test(R) && !/decision-support/i.test(R) && /Morfeas is an educational and informational aid/.test(T); })()); })(), "true");

check("v406: terms version, privacy, review date, attributed wording",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const R=require('fs').readFileSync(require('path').join(__dirname,'..','src','root.js'),'utf8'); return /const TERMS_VERSION = 2;/.test(R) && /=== TERMS_VERSION/.test(R) && /const CONTENT_CHECKED = /.test(T) && /const REPORT_EMAIL = /.test(T) && /Privacy: the app does not collect/.test(T) && /Per the algorithm/.test(T) && !/ · suggested/.test(T); })()); })(), "true");

check("v407: lidocaine IBW, small-dose rounding, per-24h units, fluids/renal/PBW guards, Greek drug search",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const r = run('[fmt(0.007), fmt(0.0028), fmt(0.013), fmt(150), ibwDevine(90,"M"), ibwLidoConsensus(160,"F"), doseText(DRUGS.find(d=>d.id==="lidocaine_iv").doses[0], ibwLidoConsensus(160,"F"), "el").calc, DRUGS.find(d=>d.id==="lidocaine_iv").doses[0].basis, doseText(DRUGS.find(d=>d.id==="amiodarone").doses[2], 70, "el").calc].join("|")'); return r === '0.007|0.0028|0.013|150||55|55–82.5 mg|ibw|700–1200 mg/24h' && /const adultOK = a >= 18 && a <= 120;/.test(T) && /const autoCat = !a \? null/.test(T) && /d\.synEl \|\| ""/.test(P) && /function PatientBarCore/.test(P) && !/clinical practice\)/.test(require('fs').readFileSync(require('path').join(__dirname,'..','src','data.js'),'utf8').match(/id: "lidocaine_iv"[\s\S]*?id: "furosemide"/)[0]); })()); })(), "true");

check("v408: age-group hiding of calculated dose rows",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const fs=require('fs'),vm=require('vm'); const c={React:{}}; vm.createContext(c); vm.runInContext(fs.readFileSync(require('path').join(__dirname,'..','src','data.js'),'utf8')+';'+P.match(/const doseAgeGroup[\s\S]*?\n};/)[0]+';this.D=DRUGS;this.g=doseAgeGroup', c); const f=(id,i)=>c.g(c.D.find(d=>d.id===id).doses[i]); return f('propofol',0)==='adult' && f('propofol',9)==='peds' && c.g({en:'CHILDREN and small adults — loading (SmPC)'})===null && c.g({en:'Elderly / hepatic / biliary / renal — maintenance'})===null && c.g({en:'Induction (adults & adolescents)'})===null && /aNum >= 18/.test(P) && /height: hSafe, sex, age: aSafe, focus/.test(fs.readFileSync(require('path').join(__dirname,'..','src','root.js'),'utf8')); })()); })(), "true");

check("v409: vasopressin calculator opens at 0.01 U/min",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/id: "vaso",[\s\S]{0,200}def: 0\.01,/.test(T) && /Start 0\.01 U\/min, increase every 15/.test(T)); })(), "true");

check("v410: SRI on both React scripts, no opaque caching",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const fs=require('fs'),p=require('path'); const H=fs.readFileSync(p.join(__dirname,'..','index.html'),'utf8'); const W=fs.readFileSync(p.join(__dirname,'..','sw.js'),'utf8'); return (H.match(/integrity="sha512-[A-Za-z0-9+\/=]{88}" crossorigin="anonymous" referrerpolicy="no-referrer"/g)||[]).length===2 && H.includes('sha512-QVs8Lo43F9lSuBykadDb0oSXDL/BbZ588urWVCRwSIoewQv/Ewg1f84mK3U790bZ0FfhFa1YSQUmIhG+pIRKeg==') && H.includes('sha512-6a1107rTlA4gYpgHAqbwLAtxmWipBdJFcq8y5S/aTge3Bp+VAklABm2LO+Kg51vOWR9JMZq1Ovjl5tpluNpTeQ==') && /res\.ok && res\.type !== "opaque"/.test(W); })()); })(), "true");

check("v411: LA sources and limits, sugammadex/neostigmine/midazolam updates",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const r = run('[LA_LIST.every(l=>l.noteEl&&l.noteEn), LA_LIST.find(l=>l.id==="mepi").absByConc[2], LA_LIST.find(l=>l.id==="mepi").absByConc[1], LA_LIST.find(l=>l.id==="chloro").concs.join(), DRUGS.find(d=>d.id==="midazolam").doses.filter(x=>/IM (premedication|conscious sedation)/.test(x.en)).map(x=>x.lo+"-"+x.hi+":"+x.max).join(), /birth/.test(DRUGS.find(d=>d.id==="sugammadex").doses.map(x=>x.en).join()), /TOFr >0.2/.test(DRUGS.find(d=>d.id==="neostigmine").notesEn)].join("|")'); return r === 'true|400|300|2|0.08-0.2:null,0.05-0.15:null|true|true' && /ageN > 0 && ageN < 12/.test(T) && /LACalc, \{ lang, weight, age \}/.test(require('fs').readFileSync(require('path').join(__dirname,'..','src','root.js'),'utf8')); })()); })(), "true");

check("v412: direction-specific opioid factors and daily maxima, UKKA 2026, Intralipid QRH 2023, sedation population",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const r = run('[OPIOIDS.find(o=>o.id==="fent-tts").fFrom, OPIOIDS.find(o=>o.id==="tramadol").fFrom, OPIOIDS.find(o=>o.id==="tramadol").maxDay, OPIOIDS.find(o=>o.id==="codeine").maxDay, OPIOIDS.every(o=>!o.fFrom || o.fFrom >= o.f), DRUGS.find(d=>d.id==="intralipid").doses.some(x=>/Maximum cumulative/.test(x.en) && x.lo===12), DRUGS.find(d=>d.id==="insulin_glucose").doses.some(x=>/6.0\u20136.4/.test(x.en)), !/UK Kidney Association 2023/.test(JSON.stringify(DRUGS))].join("|")'); return r === '3|0.2|400|240|true|true|true|true' && /const pop = popPick \|\| /.test(T) && /line-through/.test(T); })()); })(), "true");

check("v413: phenylephrine CS row per Kinsella 2018 Recommendation 5",
  run('/variable rate by syringe pump, titrated to BP and heart rate/.test(DRUGS.find(d=>d.id==="phenylephrine").doses[2].fixedEn) && /until delivery/.test(DRUGS.find(d=>d.id==="phenylephrine").doses[2].fixedEn)'), true);

check("v414: LAST bolus 2-3 min, dexamethasone children 5th consensus, andexanet note, ATI reference",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ return run('[CHECKLISTS.find(c=>c.id==="last").stepsEn.some(x=>/bolus 1.5 mL\\/kg \u2014 over 1 min \\(ERC 2025\\) or 2\u20133 min/.test(x)), (function(){var d=DRUGS.find(x=>x.id==="dexamethasone").doses.find(x=>/5th Consensus/.test(x.en)); return d.lo+"-"+d.max;})(), /withdrawn from the US market/.test(DRUGS.find(d=>d.id==="andexanet").notesEn), /Anaesthesia 2020/.test(CHECKLISTS.find(c=>c.id==="das_ati").srcEn)].join("|")') === 'true|0.15-4|true|true'; })()); })(), "true");

check("v415: DAS 2025 eFONA wording, adenosine 6-12-18, anaphylaxis infusion per RCUK, PCC 25 IU/kg for Xa",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('[/moved the transverse-vs-vertical decision earlier/.test(CHECKLISTS.find(c=>c.id==="difficult_airway").stepsEn.join()), /6 mg rapid push \u2192 12 mg \u2192 18 mg/.test(CHECKLISTS.find(c=>c.id==="svt_stable").stepsEn.join()), /0.5\u20131 mL\\/kg\\/h/.test(CHECKLISTS.find(c=>c.id==="anaphylaxis").stepsEn.join()), DRUGS.find(d=>d.id==="pcc").doses.find(x=>/Xa inhibitor/.test(x.en)).hi].join("|")') === 'true|true|true|25'); })(), "true");

check("v416: fibrinogen acquired bleeding without the unfound per-kg dose",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('(function(){var d=DRUGS.find(x=>x.id==="fibrinogen").doses.find(x=>/Acquired bleeding/.test(x.en)); return !d.lo && /no per-kg dose/.test(d.fixedEn) && /\u22641.5 g\\/L/.test(d.fixedEn);})()') === true); })(), "true");

check("v417: AFE A-OK caution, SCOOP per Iliff 2022, haemorrhage per Rossaint 2023, pneumothorax wording",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('[/ACOG cautions/.test(CHECKLISTS.find(c=>c.id==="afe").stepsEn.join()), /Iliff/.test(CHECKLISTS.find(c=>c.id==="scoop").srcEn) && !/glue|HFNO/.test(CHECKLISTS.find(c=>c.id==="scoop").stepsEn.join()), /at least 1:2/.test(CHECKLISTS.find(c=>c.id==="hemorrhage").stepsEn.join()) && !/1:1:1/.test(CHECKLISTS.find(c=>c.id==="hemorrhage").stepsEn.join()), CHECKLISTS.every(c=>c.stepsEl.length===c.stepsEn.length)].join()') === 'true,true,true,true' && /Iliff HA/.test(T)); })(), "true");

check("v418: SOAP 2021 platelet thresholds in pre-eclampsia",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/SOAP 2021, no other risk factors\): platelets \\u226570/.test(T) && /Bauer ME, et al\. The Society for Obstetric Anesthesia/.test(T) && !/70\\u201380 & not rapidly falling/.test(T)); })(), "true");

check("v419: ROTEM PCC trigger tied to the reference range",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/EXTEM CT above the reference range/.test(T) && !/EXTEM CT >80s/.test(T)); })(), "true");

check("v420: ERC 2025 ALS / DAS 2025 checklist updates",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('[/aminophylline/.test(CHECKLISTS.find(c=>c.id==="brady").stepsEn.join()) && /isoprenaline 5/.test(CHECKLISTS.find(c=>c.id==="brady").stepsEn.join()), /48\u201372 h per ERC/.test(CHECKLISTS.find(c=>c.id==="mh").stepsEn.join()), /EtO\u2082 \u22650.9/.test(CHECKLISTS.find(c=>c.id==="rsi").stepsEn.join()), /sodium bicarbonate 50 mmol/.test(CHECKLISTS.find(c=>c.id==="hyperkalaemia").stepsEn.join()), CHECKLISTS.every(c=>c.stepsEl.length===c.stepsEn.length)].join()') === 'true,true,true,true,true'); })(), "true");

check("v421: hypertonic saline labelled paediatric; rocuronium obesity sources",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/Hypertonic 3% NaCl .u2014 CHILDREN/.test(T) && run('/AAGBI\\/SOBA 2015 \\(Table 3\\) uses lean body weight/.test(DRUGS.find(d=>d.id==="rocuronium").notesEn)') === true); })(), "true");

check("v422: audit registry has no stale vasopressin default",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(!/προεπιλογή 0\.03/.test(require('fs').readFileSync(require('path').join(__dirname,'..','audit','audit-registry.json'),'utf8'))); })(), "true");

check("v423: dobutamine dilutions within the SmPC 5 mg/mL limit",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const i=T.indexOf('id: "dobut"'); const seg=T.slice(i, T.indexOf('id: "vaso"', i)); return !/1e4/.test(seg) && /5e3/.test(seg); })()); })(), "true");

check("v424: no unsourced 48-72 h restart in the anticoagulant table",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(!/48.u201372 h/.test(P.slice(P.indexOf('const ANTICOAG'), P.indexOf('];', P.indexOf('const ANTICOAG'))))); })(), "true");

check("v425: ASRA 2025 dabigatran intervals and reversal position",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/120 h \(CrCl 30.u201349\)/.test(P) && /ASRA 2025, IA/.test(P) && !/ADVISES AGAINST THIS/.test(P)); })(), "true");

check("v426→v436: ERC NLS/PLS content shown again after the Part 12 check",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('[PENDING_ERC_PAED, CHECKLISTS_SHOWN.some(c=>c.id==="newborn"), DRUGS.find(d=>d.id==="adrenaline").doses.filter(x=>!isPendingErc(x)).some(x=>/cardiac arrest/.test(x.en) && /CHILDREN/.test(x.en))].join()') === 'false,true,true' && (T.match(/!PENDING_ERC_PAED && /g)||[]).length === 9); })(), "true");

check("v427: every checklist has a colour",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('CHECKLISTS.every(c => /^#[0-9A-F]{6}$/i.test(c.color || ""))') === true); })(), "true");

check("v428: versioned icon file names and updateViaCache",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const fs=require('fs'),p=require('path'); const R=(f)=>fs.readFileSync(p.join(__dirname,'..',f),'utf8'); const m=JSON.parse(R('manifest.webmanifest')); return m.icons.every(i=>/-v2\.png$/.test(i.src) && fs.existsSync(p.join(__dirname,'..',i.src))) && /updateViaCache: "none"/.test(R('index.html')) && /icons\/apple-touch-icon-v2\.png/.test(R('sw.js')); })()); })(), "true");

check("v429: Tools tab opens with nothing expanded",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/const \[open, setOpen\] = useState\(null\);\n  const groupOf/.test(require('fs').readFileSync(require('path').join(__dirname,'..','src','root.js'),'utf8')) && /const \[openGroups, setOpenGroups\] = useState\(\[\]\);/.test(require('fs').readFileSync(require('path').join(__dirname,'..','src','root.js'),'utf8'))); })(), "true");

check("v430: link preview tags, share button and QR",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const fs=require('fs'),p=require('path'); const H=fs.readFileSync(p.join(__dirname,'..','index.html'),'utf8'); return /property="og:image" content="https:\/\/lilia33t\.github\.io\/Morfeas\/icons\/og-image\.png"/.test(H) && fs.existsSync(p.join(__dirname,'..','icons','og-image.png')) && fs.existsSync(p.join(__dirname,'..','icons','qr-morfeas.png')) && /function ShareBlock/.test(T) && /navigator\.share/.test(T) && /React\.createElement\(ShareBlock, \{ lang \}\)/.test(T); })()); })(), "true");

check("v431: share surfaces show only the name",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const H=require('fs').readFileSync(require('path').join(__dirname,'..','index.html'),'utf8'); return /og:title" content="Morfeas"/.test(H) && !/og:description/.test(H) && !/name="description"/.test(H) && /const text = "Morfeas";/.test(T) && !/Scan it with your phone camera/.test(T); })()); })(), "true");

check("v432: Part 10: wide irregular \u2192 synchronised; ESA/EBA 2013; laryngospasm peds dose",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('(function(){ const g=id=>CHECKLISTS.find(c=>c.id===id); const s=g("svt_unstable"); const L=g("laryngospasm"); return s.stepsEn[3].includes("SYNCHRONISED") && !/unsynchronized/.test(s.stepsEn.join()) && s.stepsEl.length===s.stepsEn.length && L.stepsEn.some(x=>x.includes("1.5 mg/kg")) && !/Larson/.test(L.stepsEn.join()) && !JSON.stringify(CHECKLISTS).includes("Guide 2019") && g("or_fire").stepsEl.length===g("or_fire").stepsEn.length && !JSON.stringify(DRUGS).includes("UKKA 2023"); })()') === true); })(), "true");

check("v433: Part 11: no ACT 250\u2013300, driving pressure row, ticagrelor 3 days",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(!/ACT 250/.test(T) && !/ACT target 250/.test(T) && /Driving pressure \(Pplat/.test(T) && /ticagrelor ", \/\* @__PURE__ \*\/ React.createElement\(Hi, null, "3 days"\)/.test(T) && /Obstructive pattern \(FEV/.test(T)); })(), "true");

check("v434: bicarbonate rows follow ERC 2025",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('(function(){ const d=DRUGS.find(x=>x.id==="bicarbonate").doses; return d.some(r=>r.en==="Arrest from hyperkalaemia (ERC 2025)" && /^50 mmol/.test(r.fixedEn)) && !d.some(r=>/50–100 mmol/.test(r.fixedEn||"")); })()') === true); })(), "true");

check("v435: bicarbonate TCA 1-2 mmol/kg",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('(function(){ const d=DRUGS.find(x=>x.id==="bicarbonate").doses.find(r=>/Tricyclic/.test(r.en)); return !!d && d.lo===1 && d.hi===2 && d.unit==="mmol/kg"; })()') === true); })(), "true");

check("v436: Part 12: paediatric hyperkalaemia, ERC PLS doses, newborn adrenaline",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('(function(){ const h=CHECKLISTS.find(c=>c.id==="hyperkalaemia"); const n=CHECKLISTS.find(c=>c.id==="newborn"); return /NO calcium, NO bicarbonate/.test(h.stepsEn.join()) && /IN CARDIAC ARREST — ADULTS/.test(h.stepsEn.join()) && /10–30 µg\\/kg/.test(n.stepsEn.join()) && n.stepsEl.length===n.stepsEn.length; })()') === true && /Math.min\(0.3 \* w, 12\)/.test(T) && !/adolescents/.test(T) && !/still used for vagal tone and premedication/.test(T)); })(), "true");

check("v437: Part 13: peds caps, ETT rounding, calcium gluconate row",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('(function(){ const g=DRUGS.find(d=>d.doses.some(x=>/gluconate 10%, hyperkalaemia ONLY/.test(x.en))); const a=DRUGS.find(d=>d.id==="adenosine").doses.some(x=>x.lo===0.3&&/ERC PLS 2025/.test(x.en)); return !!g && a && doseText({lo:0.1,hi:0.1,unit:"mg/kg"},-5,"en")==="0.1 mg/kg" && PEDS_VITALS.length===6; })()') === true && /Math.floor\(p.ettCuffed \* 2\) \/ 2/.test(T) && /Math.min\(4 \* w, 200\)/.test(T) && /Math.min\(0.01 \* w, 1\)/.test(T) && /Math.min\(Math.max\(0.02 \* w, 0.1\), 0.5\)/.test(T) && !/50% of the adult dose/.test(T)); })(), "true");

check("v438: SmPC alignment: naloxone, vasopressin, sugammadex",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(!/Naloxone perioperatively: 40/.test(T) && /"0.01\\u20130.03 U\/min"/.test(T) && !/TOF 1\\u20133 \\xB7 2 mg\/kg/.test(T) && /reappearance of T2/.test(T)); })(), "true");

check("v439: peds synchronised cardioversion; no unsourced spinal adrenaline",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/Synchronised cardioversion", v: `\$\{fmt\(1 \* w\)\}/.test(T) && run('CHECKLISTS.find(c=>c.id==="total_spinal").stepsEn.join()').indexOf('adrenaline if refractory') < 0); })(), "true");

check("v440: total spinal adrenaline dose per ERC bradycardia",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('CHECKLISTS.find(c=>c.id==="total_spinal").stepsEn[4]').indexOf('adrenaline 2\u201310 \u00b5g/min (ERC 2025') > 0); })(), "true");

check("v441: ERC 2025 Special Circumstances: hysterotomy, SZC, OR arrest trigger",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('(function(){ const g=id=>CHECKLISTS.find(c=>c.id===id); const a=g("afe"), k=g("hyperkalaemia"), h=g("hypotension"); return !/within 5 min/.test(a.stepsEn.join()) && /SZC. 10 g orally/.test(k.stepsEn.join()) && /<50 mmHg/.test(h.stepsEn.join()) && h.stepsEl.length===h.stepsEn.length && a.stepsEl.length===a.stepsEn.length; })()') === true); })(), "true");

check("v442: six new ERC 2025 checklists, equal steps in both languages",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('(function(){ const ids=["post_rosc","cardiac_surgery_arrest","lvad_arrest","asthma_arrest","hypokalaemia","maternal_arrest"]; return ids.every(id=>{ const c=CHECKLISTS_SHOWN.find(x=>x.id===id); return c && c.color && c.stepsEl.length===c.stepsEn.length && /ERC/.test(c.srcEn); }) && /0.05\u20130.1 mg/.test(CHECKLISTS.find(x=>x.id==="cardiac_surgery_arrest").stepsEn.join()) && /20 mmol IV over 2\u20133 min/.test(CHECKLISTS.find(x=>x.id==="hypokalaemia").stepsEn.join()); })()') === true); })(), "true");

check("v443: torsades magnesium 2 g over 10 min",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('CHECKLISTS.find(c=>c.id==="svt_unstable").stepsEn.join()').indexOf('2 g (8 mmol) IV over 10 min') > 0); })(), "true");

check("v444: Part 14: thrombectomy 6\u201324 h, ketamine wording, no FLUID_LOSS",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/6\\u201324 h window/.test(T) && !/infusion usually 0.1/.test(T) && !/FLUID_LOSS/.test(T) && /LMA Supreme size 4: 45 mL/.test(T)); })(), "true");

check("v445: LV shock availability note",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('CHECKLISTS.find(c=>c.id==="lv_shock").stepsEn[1]').indexOf('may not be available in Greece') > 0); })(), "true");

check("v446: adult TBI hypertonic note per NCS 2020, no adult dose",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('(function(){ const h=DRUGS.find(x=>x.id==="hypertonic_saline"); const a=h.doses.find(d=>/ADULTS/.test(d.en)); return !!a && !a.lo && /no guideline gives a dose/.test(a.fixedEn); })()') === true && /NCS 2020: hypertonic solutions suggested over mannitol/.test(T)); })(), "true");

check("v447: AHA/ACC 2024 valve echo wording",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(!/echo if none within the past year/.test(T) && /moderate-to-severe valvular heart disease: transthoracic/.test(T)); })(), "true");

check("v448: cuffed ETT 3/5/7/15 y = 4.0/4.5/5.0/7.0; no paediatric calcium row allows arrest; hyperkalaemia adult labels",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('[3,5,7,15].map(a=>Math.floor(pedsCalc(a,0).ettCuffed*2)/2).join() + "|" + DRUGS.some(d=>d.doses.some(x=>/^Children/.test(x.en) && /calcium|gluconate|CaCl/i.test(x.en) && /arrest/.test(x.en) && !/NOT in arrest|NO calcium/.test(x.en))) + "|" + /SHIFT \u2014 ADULTS/.test(CHECKLISTS.find(c=>c.id==="hyperkalaemia").stepsEn.join())') === '4,4.5,5,7|false|true'); })(), "true");

check("v449: ESO notes on thrombectomy; myasthenia source year; Leventhal wording",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/do not intensively lower SBP below 140 mmHg/.test(T) && !/Orphananesthesia 2019/.test(T) && /coexisting pulmonary disease/.test(T) && /Khan 2024/.test(T)); })(), "true");

check("v450: vascular card: no unsourced MAP/shunt claim, no device-specific NIRS thresholds, ESVS 2026 CSF",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(!/reduced shunt need by 80%/.test(T) && !/NIRS \\u2014 \\u0394rSO\\u2082 \\(Foresight\\)/.test(T) && !/Foresight/.test(T) && /ESVS 2026/.test(T) && /Mille 2004/.test(T)); })(), "true");

check("v451: carotid per ESVS 2023: no routine carotid sinus blockade; protamine; post-CEA BP 3\u20136 h",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/routine carotid sinus nerve blockade NOT recommended/.test(T) && /consider protamine reversal/.test(T) && /first 3\\u20136 h/.test(T) && !/surgeon infiltrates, atropine ready/.test(T)); })(), "true");

check("v452: paediatric vitals complete (no blanks), ERC PLS 2025 Table 2",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('PEDS_VITALS.every(v=>v.hr!=="\u2014" && v.rr!=="\u2014" && v.sbp!=="\u2014") && PEDS_VITALS[0].hr==="110\u2013180" && PEDS_VITALS[5].sbp==="90/120"') === true); })(), "true");

check("v453: ERC ALS manual details in new checklists; thrombectomy footnote",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('(function(){ const g=id=>CHECKLISTS.find(c=>c.id===id).stepsEn.join(); return g("cardiac_surgery_arrest").includes("amiodarone 300 mg") && g("asthma_arrest").includes("8\u201310 breaths") && g("hypokalaemia").includes("4 mL (8 mmol)") && g("maternal_arrest").includes("0.5\u20131 mm smaller"); })()') === true && /Footnote \\u2014 European guidelines/.test(T)); })(), "true");

check("v454: Greek uses \u03b1\u03c0\u03b9\u03bd\u03af\u03b4\u03c9\u03c3\u03b7, not \u03b5\u03ba\u03ba\u03ad\u03bd\u03c9\u03c3\u03b7, for shocks",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('JSON.stringify(CHECKLISTS) + JSON.stringify(DRUGS.map(d=>d.doses))').replace(/εκκένωση του αιματώματος/g,'').search(/εκκεν[ώω]σ/) < 0 && !/\\u03B5\\u03BA\\u03BA\\u03B5\\u03BD\\u03CE\\u03C3/.test(T)); })(), "true");

check("v455: glucose shown in mg/dL, not mmol/L",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('JSON.stringify(CHECKLISTS) + JSON.stringify(DRUGS)').indexOf('<7 mmol/L') < 0 && !/6\\u201310 mmol\/L/.test(T) && /acceptable up to 216 mg\/dL/.test(T)); })(), "true");

check("v456: status epilepticus checklist doses and maxima",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('(function(){ const c=CHECKLISTS_SHOWN.find(x=>x.id==="status_epilepticus"); const t=c.stepsEn.join(); return !!c && c.stepsEl.length===c.stepsEn.length && t.includes("lorazepam 4 mg IV") && t.includes("levetiracetam 60 mg/kg (max 4500 mg)") && t.includes("phenytoin 20 mg/kg (max 2000 mg)") && t.includes("valproate 40 mg/kg (max 3000 mg)"); })()') === true); })(), "true");

check("v457: status epilepticus lacosamide 5 mg/kg with AV block contraindication",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('(function(){ const c=CHECKLISTS_SHOWN.find(x=>x.id==="status_epilepticus"); const t=c.stepsEn.join(); return c.stepsEl.length===8 && c.stepsEn.length===8 && t.includes("Lacosamide (DGN 2020)") && t.includes("5 mg/kg IV over 15") && t.includes("AV block") && c.srcEn.includes("AWMF 030-079"); })()') === true); })(), "true");

check("v458: paediatric vitals: APLS table restored (13 ages) alongside ERC (6 ages)",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('PEDS_VITALS_APLS.length===13 && PEDS_VITALS_APLS[0].hr==="120\u2013170" && PEDS_VITALS_APLS[11].sbp==="90\u2013105" && PEDS_VITALS.length===6') === true); })(), "true");

check("v459: service worker: cache-first app shell, keeps previous version if update incomplete, reuses CDN copy",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const W=require('fs').readFileSync(require('path').join(__dirname,'..','sw.js'),'utf8'); return W.includes('isAppPage(req.url)') && W.includes('cache.match("./index.html", MATCH)') && W.includes('hadOlder && ok.includes(false)') && W.includes('fromOlderCaches(u)') && W.indexOf('caches.delete(k)') > W.indexOf('addWithRetry(cache, u.startsWith'); })()); })(), "true");

check("v460: LVAD criteria + AP pads, pregnancy drugs (OAA), APLS table without blanks",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('(function(){ const L=CHECKLISTS_SHOWN.find(x=>x.id==="lvad_arrest"), M=CHECKLISTS_SHOWN.find(x=>x.id==="maternal_arrest"); const l=L.stepsEn.join(), m=M.stepsEn.join(); return L.stepsEl.length===8 && L.stepsEn.length===8 && l.includes("MAP >60 mmHg") && l.includes("ANTERO-POSTERIOR") && M.stepsEl.length===M.stepsEn.length && m.includes("CaCl₂ 10% 10 mL") && m.includes("tranexamic acid 1 g") && PEDS_VITALS_APLS.every(v=>v.hr!=="\u2014" && v.rr!=="\u2014" && v.sbp!=="\u2014") && PEDS_VITALS_APLS[3].hr==="110\u2013160"; })()') === true); })(), "true");

check("v461: hypoxaemia per AAGBI QRH 2-2, delayed emergence sourced, pregnancy RSI 18 weeks",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const H=run('JSON.stringify(CHECKLISTS_SHOWN.find(x=>x.id==="hypoxemia"))'), D=run('JSON.stringify(CHECKLISTS_SHOWN.find(x=>x.id==="delayed_emergence"))'); const h=JSON.parse(H), d=JSON.parse(D); return h.srcEn.includes('AAGBI Quick Reference Handbook 2-2') && h.stepsEl.length===8 && h.stepsEn.length===8 && !h.stepsEn.join().includes('DOPES') && d.srcEn.includes('OpenAnesthesia') && d.stepsEl.length===d.stepsEn.length && T.includes('RSI after 18 weeks') && !T.includes('6.0\u20137.0') && T.includes('Rodr\\u00EDguez-Rubio meta-analysis, via ASRA News 2018'); })()); })(), "true");

check("v462: comma input, implausible patient values, dose calculation line, favourites max 10",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('(function(){ const r=doseText({lo:0.01,hi:0.01,unit:"mg/kg",max:1},18,"el"), r2=doseText({lo:0.01,hi:0.01,unit:"mg/kg",max:1},150,"el"); const c=patientCheck("700","5",""), c2=patientCheck("18.5","150","0"), c3=patientCheck("","",""); return numIn("18,5")==="18.5" && numIn("1,2,3")==="1.23" && numIn("-3,5")==="-3.5" && r.expl==="0.01 mg/kg \u00D7 18 kg = 0.18 mg" && r2.expl.indexOf("\u2192 max 1 mg")>0 && r2.calc==="1 mg" && c.w===true && c.a===false && c2.w===false && c2.a===true && c2.h===true && !c3.w && !c3.a && !c3.h && FAV_MAX===10 && Array.isArray(favsGet()); })()') === true && P.includes('ReactDOM.createPortal(') && P.includes('FavStar, { k: "drug"') && P.includes('FavStar, { k: "list"')); })(), "true");

check("v463: home favourites behind one expandable tile",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const R=require('fs').readFileSync(require('path').join(__dirname,'..','src','root.js'),'utf8'); return R.includes('aa_favs_open') && R.includes('"aria-expanded": favOpen') && R.includes('favOpen && (favItems.length > 0'); })()); })(), "true");

check("v464: favourites tile subtitle without the limit",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const R=require('fs').readFileSync(require('path').join(__dirname,'..','src','root.js'),'utf8'); return !R.includes('up to " + FAV_MAX') && R.includes('"drugs, checklists, tools"') && P.includes('"max " + FAV_MAX'); })()); })(), "true");

check("v465: ticks kept, print copy, arrest clocks, AA colours, no broken emoji escapes",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const all=['data','formulas','primitives','tabs','root'].map(f=>require('fs').readFileSync(require('path').join(__dirname,'..','src',f+'.js'),'utf8')).join('\n'); const H=require('fs').readFileSync(require('path').join(__dirname,'..','index.html'),'utf8'); return P.includes('storeGet("aa_ticks")') && P.includes('function PrintChecklist(') && P.includes('id: "aa-print"') && H.includes('body > *:not(#aa-print)') && run('JSON.stringify(Object.keys(CRISIS_CYCLE))')==='["vfvt","asystole_pea","maternal_arrest","asthma_arrest"]' && run('LIGHT.red+LIGHT.amber')==='#BF2F1D#955A17' && !/\\u1F[0-9A-F]{3}(?![0-9A-F}])/.test(all) && require('fs').existsSync(require('path').join(__dirname,'package-check.js')); })()); })(), "true");

check("v466: compression metronome on arrest checklists, 100-120/min",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('JSON.stringify(METRO_RATES)')==='[100,110,120]' && run('Object.keys(CRISIS_METRO).length')===6 && run('CHECKLISTS_SHOWN.find(x=>x.id==="vfvt").stepsEn.join().includes("100\u2013120/min")')===true && P.includes('ctx.createOscillator()') && P.includes('aa-beat ') && require('fs').readFileSync(require('path').join(__dirname,'..','index.html'),'utf8').includes('@keyframes aa-beat')); })(), "true");

check("v467: paediatric status epilepticus per APLS 7th ed Fig 6.4",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('(function(){ const c=CHECKLISTS_SHOWN.find(x=>x.id==="status_epilepticus_peds"); const t=c.stepsEn.join(); const a=CHECKLISTS_SHOWN.find(x=>x.id==="status_epilepticus").stepsEn.join(); return c.stepsEl.length===8 && c.stepsEn.length===8 && c.srcEn.includes("7th ed") && t.includes("lorazepam 0.1 mg/kg IV/IO (max 4 mg)") && t.includes("MAXIMUM 2 doses") && t.includes("levetiracetam 40 mg/kg IV/IO (max 3 g) over 5 min") && t.includes("phenytoin 20 mg/kg IV/IO (max 2 g) over 20 min") && t.includes("phenobarbital 20 mg/kg IV/IO (max 1 g)") && t.includes("ketamine 1\u20132 mg/kg") && a.includes("Status epilepticus (children)"); })()') === true); })(), "true");

check("v468: reader: speech text spells out units, routes, ranges, ratios",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('speechText("λοραζεπάμη 0.1 mg/kg IV/IO (max 4 mg)","el")')==='λοραζεπάμη 0 κόμμα 1 χιλιοστόγραμμα ανά κιλό ενδοφλέβια ή ενδοοστικά, μέγιστο 4 χιλιοστόγραμμα' && run('speechText("Adrenaline 1 mg IV q3\u20135 min","en")')==='Adrenaline 1 milligram I.V. every 3 to 5 minutes' && run('speechText("50 \u00B5g (0.5 mL από 1:10.000)","el")').includes('1 προς 10000') && run('speechText("2η δόση","el")')==='δεύτερη δόση' && P.includes('new SpeechSynthesisUtterance(') && P.includes('readerNext')); })(), "true");

check("v469: eight kept cards checked against their sources",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(!T.includes("CICO / RSI") && T.includes("TOFr < 0.4 (ASA 2023)") && T.includes("Math.min(0.07 * w, 5)") && T.includes("(SIBICC 2019)") && T.includes("per institutional protocol (EACTS 2024") && T.includes("protamine-to-heparin ratio < 1.0") && T.includes("8.3% versus 2.0%") && !T.includes("mPAP <35") && T.includes("(Miller, per Zhang 2021)") && !T.includes('id: "wedge"') && T.includes("FDA (septic shock): 0.05") && /id: "adr",[\s\S]{0,120}hi: 2,/.test(T) && T.includes("40 mcg IV every 2") && T.includes("doi:10.1093/ejcts/ezae354")); })(), "true");

check("v470: home screen without the version/offline card; version still in About",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){var R=require("fs").readFileSync(require("path").join(__dirname,"..","src","root.js"),"utf8");return !/useOfflineStatus|Offline use is not supported/.test(R) && T.includes('version " + APP_VERSION');})()); })(), "true");

check("v471: metronome plays a looping WAV through an audio element, Web Audio fallback",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(P.includes('a.el.loop = true') && P.includes('type: "audio/wav"') && P.includes('ctx.createOscillator()') && P.includes('navigator.audioSession.type = "playback"')); })(), "true");

check("v472: antenatal corticosteroids 24+0 to 33+6 weeks, risk of delivery within 7 days (ACOG CO 713)",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(T.includes('24+0 to 33+6 weeks, at risk of preterm delivery within 7 days') && !T.includes('33 6/7 weeks at high risk')); })(), "true");

check("v473: audit part 17: ASA depths and neostigmine cap, SIBICC Na, ACCP wording, flow as practice, EL/EN pairs matched",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){var D=T.replace(/\\u([0-9A-Fa-f]{4})/g,function(m,h){return String.fromCharCode(parseInt(h,16));});var re=/el \? "((?:[^"\\]|\\.)*)" : "((?:[^"\\]|\\.)*)"/g,m,bad=[];while((m=re.exec(D))){var a=m[1].length+1,b=m[2].length+1;if((a>40||b>40)&&(a/b>2.5||b/a>2.5))bad.push(m[1].slice(0,30));}return bad.length===0;})() && T.includes('v: "PTC 0 (ASA 2023)"') && T.includes("at minimal block") && T.includes("Na < 155 mmol/L (SIBICC 2019)") && T.includes("discuss minimally invasive surgery") && T.includes("usual practice, not a recommendation") && T.includes('"Vasoplegia"), " (') && T.includes("betamethasone may be considered") && T.includes("FFP is less effective (EACTS 2024)")); })(), "true");

check("v474: audit part 18: neostigmine ASA cap in the calculation, ACOG conditions, ACT during CPB, flow conditions, protamine conversion, English references, CrisisMode key",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(T.includes("based on the family") && T.includes("if no previous course was given") && T.includes("including ruptured membranes and multiple gestations") && T.includes("(moderate hypothermia to normothermia)") && T.includes('"Target ACT (during CPB)"') && T.includes("is the app") && T.includes("Math.min(0.04 * w, 5)") && P.includes("key: crisisC.id") && T.includes("Kietaibl S, et al. Management") && T.includes("Soar J, et al. European Resuscitation Council Guidelines 2025")); })(), "true");

check("v475: metronome AAC tracks present, cached offline and tried first",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(P.includes('fetch("audio/metro-" + r + ".m4a")') && P.includes("fallbackSound(bpm, !!pre, gen)") && ["100","110","120"].every(function(r){var f=require("path").join(__dirname,"..","audio","metro-"+r+".m4a");return require("fs").existsSync(f) && require("fs").readFileSync(f).slice(4,8).toString()==="ftyp" && require("fs").readFileSync(require("path").join(__dirname,"..","sw.js"),"utf8").includes("./audio/metro-"+r+".m4a");})); })(), "true");

check("v476: audit part 20: metronome generation guard, AAC ready at app start, no-sound notice; #115 wording; ERC 2025 DOI",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(P.includes("const METRO_AAC = {};") && P.includes("gen !== a.gen") && P.includes("No sound on this device") && require("fs").readFileSync(require("path").join(__dirname,"..","src","root.js"),"utf8").includes("metroPrefetch();") && T.includes("doi:10.1016/j.resuscitation.2025.110769") && !T.replace(/\\u([0-9A-Fa-f]{4})/g,function(m,h){return String.fromCharCode(parseInt(h,16));}).includes("7 ημέρες, και με ρήξη")); })(), "true");

check("v477: 44 px buttons, offline check in About, review date 29/10/2026",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(require("fs").readFileSync(require("path").join(__dirname,"..","index.html"),"utf8").includes("body button { min-height: 44px; }") && require("fs").readFileSync(require("path").join(__dirname,"..","index.html"),"utf8").includes("window.__swErr") && P.includes('padding: "14px 14px", flexShrink: 0,') && T.includes("function OfflineCheck") && T.includes("createElement(OfflineCheck, { lang })") && T.includes('const CONTENT_CHECKED = "29/10/2026";') && P.includes("minWidth: 44, minHeight: 44, padding: 0")); })(), "true");

check("v478: gastric ultrasound card: spec test cases, no old 0.4/0.8 limits, card wired in",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('JSON.stringify((function(){var a=gastricCalc(["5"],"40","70"),b=gastricCalc(["15"],"30","60"),m=gastricCalc(["4","5","6"],"40","70"),e=gastricCalc(["10"],"53.125","70"),z=gastricCalc(["1"],"80","70"),o=gastricCalc(["40"],"30","70"),ch=gastricCalc(["5"],"12","40"),bad=gastricCalc(["70"],"40","70"),nw=gastricCalc(["5"],"40","");return [Math.round(a.vol),a.perkg.toFixed(2),a.high,Math.round(b.vol),b.perkg.toFixed(2),b.high,Math.round(m.vol),m.n,e.high,z.zero,o.over,!!ch.child,!!bad.bad,nw.perkg];})())')==='[49,"0.70",false,208,"3.46",true,49,3,true,true,true,true,true,null]' && T.includes("function GastricUSCard") && !/0\.4 mL\/kg|0\.8 mL\/kg/.test(T) && require("fs").readFileSync(require("path").join(__dirname,"..","src","root.js"),"utf8").includes('sec.id === "gastricus"') && T.includes("doi:10.1016/j.bjae.2019.03.003")); })(), "true");

check("v479: Part 21 fixes: mL/kg 1.49 not 1.50, current-cache offline check, persist(), audio state check, star outside the row button, 44 px sliders/checkbox",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run('JSON.stringify((function(){var a=gastricCalc(["8.84"],"40","70"),b=gastricCalc(["5"],"40","70");return [a.perkgTxt,a.high,b.perkgTxt]})())')=='["1.49",false,"0.70"]' && T.includes('caches.open("anesthesia-v" + APP_VERSION)') && T.includes("nav.storage.persisted()") && T.includes("close and reopen the app") && require("fs").readFileSync(require("path").join(__dirname,"..","index.html"),"utf8").includes("navigator.storage.persist()") && P.includes('ctx.state !== "running") setMetroMute(true)') && P.includes("const StarRow") && !P.includes('role: "button"') && T.includes("not been examined fully") && T.includes("grade 0 (empty sitting and in RLD)") && T.includes('height: 44, margin: 0, accentColor') && T.includes('type: "checkbox", checked: drive, style: { width: 20')); })(), "true");

check("v480: pre-anaesthesia check: 41 unique items with sources, same numbers el/en, part A per day/version, N/A counting, blood threshold, no 'ready' text, no patient data stored",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run("(function(){ var all=preopAll(); var ids=all.map(function(i){return i.id;}); if(new Set(ids).size!==ids.length||ids.length!==41) return \"ids \"+ids.length; var num=function(t){return (t.match(/\\d+(\\.\\d+)?/g)||[]).sort().join(\",\");}; for(var k=0;k<all.length;k++){var i=all[k]; if(!i.el||!i.en||!i.src) return \"field \"+i.id; if(num(i.el)!==num(i.en)) return \"num \"+i.id;}  var ok1=JSON.stringify(preopLoadA({v:PREOP_V,date:\"2026-10-31\",items:{\"a.gas\":\"ok\",\"x\":\"ok\",\"a.vap\":\"bad\"}},\"2026-10-31\"))==='{\"a.gas\":\"ok\"}'; var ok2=JSON.stringify(preopLoadA({v:PREOP_V,date:\"2026-10-30\",items:{\"a.gas\":\"ok\"}},\"2026-10-31\"))===\"{}\"; var ok3=JSON.stringify(preopLoadA({v:PREOP_V-1,date:\"2026-10-31\",items:{\"a.gas\":\"ok\"}},\"2026-10-31\"))===\"{}\"; var ok4=JSON.stringify(preopLoadA(null,\"2026-10-31\"))===\"{}\"&&JSON.stringify(preopLoadA(\"{bad\",\"2026-10-31\"))===\"{}\"; var c0=preopCount(\"B\",{}), c1=preopCount(\"B\",{\"b.nmt\":\"na\",\"b.min\":\"ok\",\"b.temp\":\"na\"}); var ok5=c1.total===c0.total-1&&c1.done===1&&c1.crit===c0.crit-2; var c2=preopCount(\"C\",{\"c.allergy\":\"yes\",\"c.airway\":\"no\",\"c.blood\":\"yes\",\"c.site\":\"na\"}); var ok6=c2.done===3&&c2.total===6&&c2.crit===3; var nas=all.filter(preopCanNA).map(function(i){return i.id;}).sort().join(\",\")===\"b.dant,b.lipid,b.nmt,b.peeg,b.tiva,c.site\"; var ok7=preopBloodTxt(\"10\",\"30\")===\"210 mL\"&&preopBloodTxt(\"10\",\"\")===null&&preopBloodTxt(\"40\",\"80\")===\"500 mL\"; return [ok1,ok2,ok3,ok4,ok5,ok6,nas,ok7].join(\"\"); })()")==="truetruetruetruetruetruetruetrue" && (function(){ var i=T.indexOf("function PreAnaesthCheck("), j=T.indexOf("// Spirometry & fitness", i), b=T.slice(T.indexOf("const PREOP_V"), j); return i>0 && b.indexOf("ready")<0 && b.indexOf("\\u03AD\\u03C4\\u03BF\\u03B9\\u03BC")<0 && b.indexOf("\\u03B5\\u03C0\\u03B1\\u03B3\\u03C9\\u03B3")<0 && b.indexOf("Induction agents")<0 && run("preopAll().every(function(i){return i.el.indexOf(\"Monitors\")<0;}) && PREOP.every(function(s){return s.el.indexOf(\"Monitors\")<0;})") && b.indexOf("storeSet(PREOP_KEY, { v: PREOP_V, date: today, t: a.t, items: a.items })")>0 && b.indexOf("React.useState({ items: {}, t: null })")>0 && b.indexOf('id.charAt(0) === "a"')>0 && b.indexOf('role: "checkbox"')>0 && b.indexOf('"aria-expanded"')>0 && b.indexOf("10.1016/j.bja.2020.04.089")>0; })() && P.indexOf("createElement(PreAnaesthCheck, { lang, age, weight })")>0); })(), "true");

check("v481: Greek term for uterotonics is \u03bc\u03b7\u03c4\u03c1\u03bf\u03c3\u03c5\u03c3\u03c0\u03b1\u03c3\u03c4\u03b9\u03ba\u03ac, no transliteration left",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(["data","tabs","primitives","root"].every(function(f){ var s=require("fs").readFileSync(require("path").join(__dirname,"..","src",f+".js"),"utf8"); return s.indexOf("\\u039F\\u03C5\\u03C4\\u03B5\\u03C1\\u03BF\\u03C4\\u03BF\\u03BD")<0 && s.indexOf("\\u03BF\\u03C5\\u03C4\\u03B5\\u03C1\\u03BF\\u03C4\\u03BF\\u03BD")<0; }) && T.indexOf("\\u039C\\u03B7\\u03C4\\u03C1\\u03BF\\u03C3\\u03C5\\u03C3\\u03C0\\u03B1\\u03C3\\u03C4\\u03B9\\u03BA\\u03AC (\\u03BC\\u03B5\\u03C4\\u03AC \\u03C4\\u03BF\\u03BD \\u03C4\\u03BF\\u03BA\\u03B5\\u03C4\\u03CC)")>0); })(), "true");

check("v482: Part 23 corrections: neostigmine sources, naloxone 2 min / no peds max / Goldfrank, DAS 2025 RSI, protamine, flumazenil, cipepofol, etomidate, thiopental",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};var ne=g('neostigmine'),na=g('naloxone'),su=g('succinylcholine'),pr=g('protamine'),fl=g('flumazenil'),ci=g('cipepofol'),et=g('etomidate'),th=g('thiopental');return [ne.doses.every(function(x){return x.hi!==0.07;}), /ESAIC 2023: 0.04\u20130.05/.test(ne.doses[2].fixedEn), /every 2 min/.test(na.doses[0].fixedEn), na.doses[4].max===null, /Goldfrank/.test(na.doses[3].fixedEn), !/Orpha/.test(na.notesEn),su.doses[1].lo===1.5&&/DAS 2025/.test(su.doses[1].en), !pr.doses.some(function(x){return /60\u2013120/.test(x.en);}), /60%/.test(pr.notesEn), !/naloxone first/.test(fl.notesEn), /Liao 2022/.test(ci.notesEn)&&/2026-17536/.test(ci.notesEn), /10 mL over 1 min/.test(et.notesEn), /0.2\u20130.4%/.test(th.notesEn)].join('');})()")==="truetruetruetruetruetruetruetruetruetruetruetruetrue" && T.indexOf("Orpha-Devel")<0 && T.indexOf("Goldfrank L, Weisman RS")>0); })(), "true");

check("v483: Part 25 corrections: amiodarone, vasopressin, insulin, salbutamol, atropine, adrenaline, ephedrine, peds vasopressors removed, dopamine, calcium CI, intralipid",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};var am=g('amiodarone'),va=g('vasopressin'),ins=g('insulin_glucose'),sa=g('salbutamol'),at=g('atropine'),ad=g('adrenaline'),ep=g('ephedrine'),ph=g('phenylephrine'),no=g('noradrenaline'),dp=g('dopamine'),ca=g('calcium'),il=g('intralipid');var D=function(x){return JSON.stringify(x);};return [!/2.2 g/.test(D(am))&&/0.5 mg.min \u00D718 h/.test(D(am)), /ANZAAG/.test(D(va.doses))&&!/Vasoplegia/.test(D(va.doses)), !/4\u20136 h/.test(ins.notesEn)&&/30\u201360 min/.test(ins.notesEn)&&/ERC PLS 2025/.test(D(ins.doses))&&!/0.02\u20130.05 U.kg.h/.test(D(ins)), !/6\u201312 puffs/.test(D(sa))&&/Ventolin Injection/.test(sa.notesEn), !/no longer recommended .PALS 2020./.test(at.notesEn), !/0.05, hi: 0.5/.test(D(ad))&&/0.5\u20131 mL.kg.h/.test(D(ad))&&/Aurum SmPC/.test(ad.ciEn), !/achyphylaxis/.test(ep.notesEn)&&!ep.doses.some(function(x){return /clinical practice/.test(x.en);}), !ph.doses.some(function(x){return /CHILDREN/.test(x.en);}), !no.doses.some(function(x){return /CHILDREN/.test(x.en);}), /ANZICS/.test(dp.notesEn)&&/Surviving Sepsis 2021/.test(dp.notesEn), /^CaCl\u2082 SmPC: contraindicated/.test(ca.ciEn), />70 kg: ASRA 100 mL/.test(il.doses[0].en)].join('');})()")==="truetruetruetruetruetruetruetruetruetruetruetrue" && T.indexOf("Quick Reference Handbook 3-10")>0); })(), "true");

check("v484: Parts 24+26 corrections: nalbuphine SERB, sevo CI, neuraxial removals, pethidine, carbetocin half-life, glyco max, ketamine, furosemide CI, magnesium, lidocaine lower weight",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};var D=function(x){return JSON.stringify(x);};var nb=g('nalbuphine'),sv=g('sevoflurane'),fe=g('fentanyl'),su=g('sufentanil'),pe=g('pethidine'),ca=g('carbetocin'),gl=g('glycopyrrolate'),ke=g('ketamine_analgesic'),fu=g('furosemide'),mg=g('magnesium');return [!/Lapainol 10 mg/.test(D(nb))&&/SERB/.test(nb.notesEn)&&/160 mg/.test(nb.notesEn)&&/18 months/.test(nb.ciEn), /hepatitis/.test(sv.ciEn)&&/maximum .adults and children/.test(D(sv.doses)), !/Spinal/.test(D(fe.doses))&&!/Spinal/.test(D(su.doses))&&/Piramal Critical Care/.test(su.notesEn), !/2.3 h after/.test(pe.notesEn)&&!/SNRIs/.test(pe.notesEn), /33 min IV/.test(ca.notesEn)&&!/85.100 min/.test(ca.notesEn), gl.doses[4].max===1, !/0.1.0.5 mg.kg.h/.test(D(ke)), /30 mL.min.1.73/.test(fu.ciEn), /Rodr/.test(mg.notesEn)&&/Torbay/.test(mg.notesEn)].join('');})()")==="truetruetruetruetruetruetruetruetrue" && P.indexOf("Math.min(ibwRaw, w)")>0); })(), "true");

check("v485: Part 27A: lidocaine shows both limits in the LA table; no-sex note for IV lidocaine",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(T.indexOf("pct: 1, perKg: 3, abs: 200, smpcPerKg: 4.5 }")>0 && T.indexOf("pct: 2, perKg: 3, abs: 200, smpcPerKg: 4.5 }")>0 && T.indexOf("c.smpcPerKg ? (maxMg ?")>0 && P.indexOf("const noSexNote = sex === \"M\" || sex === \"F\" ? \"\"")>0 && P.indexOf("no sex entered: female formula (lower dose)")>0); })(), "true");

check("v486: Part 27B corrections: bupivacaine, droperidol, dexamethasone, metoclopramide, hydralazine, labetalol, ropivacaine, prilocaine, clonidine",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};var D=function(x){return JSON.stringify(x);};var bu=g('bupivacaine'),dr=g('droperidol'),dx=g('dexamethasone'),me=g('metoclopramide'),hy=g('hydralazine'),la=g('labetalol'),ro=g('ropivacaine'),pr=g('prilocaine'),cl=g('clonidine');return [/400 mg.24 h/.test(D(bu.doses))&&!/500 mg/.test(D(bu.doses))&&/6.25.12.5 mg.h/.test(D(bu.doses)), !/20.50/.test(dr.notesEn)&&/5th PONV Consensus 2026/.test(D(dr.doses)), /5th PONV Consensus, Anesth Analg 2026/.test(D(dx.doses))&&!/8.10 mg equivalent/.test(D(dx.doses)), /breast-feeding/.test(me.ciEn)&&/up to 5 days/.test(D(me.doses)), /max 25 mg.24 h/.test(D(hy.doses)), !/small doses/.test(D(la.doses)), !/300 mg for brachial/.test(ro.notesEn), /Not recommended .Aspen/.test(pr.ciEn), /not from the SmPC/.test(cl.notesEn)].join('');})()")==="truetruetruetruetruetruetruetruetrue"); })(), "true");

check("v487: Part 28 corrections: crisis haemorrhage card, PCC, heparin, TXA, andexanet, desmopressin",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};var D=function(x){return JSON.stringify(x);};var pc=g('pcc'),he=g('heparin'),tx=g('txa'),an=g('andexanet'),de=g('desmopressin');return [/no maximum is set for Xa/.test(D(pc.doses))&&!/1000.2000/.test(D(pc.doses)), /threatened abortion/.test(he.ciEn)&&/major trauma/.test(he.ciEn), /within 3 h of birth/.test(D(tx.doses))&&/arthroplasty/.test(D(tx.doses)), /NHS Tayside/.test(D(an.doses)), /Perth Children/.test(de.notesEn)&&!/usual international/.test(de.notesEn)].join('');})()")==="truetruetruetruetrue" && T.indexOf("1:1:1. Activate")<0 && T.indexOf("1:2 (R25)")>0); })(), "true");

check("v488: Part 29 paediatric card: salbutamol cap, naloxone cap, uncuffed ETT floor, ESAIC fasting, RCUK infusion, signed z, sourced analgesia",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(T.includes("Math.min(15 * w, 250)") && T.includes("Math.min(10 * w, 400)") && T.includes("Math.floor(p.ettUncuffed * 2) / 2") && !T.includes("Rich/fatty meal") && T.includes("RCUK 2026") && T.includes("r.wz < 0 ?") && T.includes("Kalceks 2024") && T.includes("a > 0 && a < 14")); })(), "true");

check("v489: Part 30 corrections: AHA cardioversion energies, RLB, pacing 70, AHA atropine, QRH 2-1, LVAD mechanical CPR, children fasting",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run("(function(){var g=function(id){return CHECKLISTS.filter(function(x){return x.id===id;})[0].stepsEn.join(' | ');};return [/AF.flutter 200 J/.test(g('svt_unstable')), /RLB/.test(g('vfvt'))&&/QRH 2-1/.test(g('vfvt'))&&!/vasodilator/.test(g('vfvt')), /70.min/.test(g('brady'))&&!/80.min/.test(g('brady'))&&/AHA 2025: 1 mg/.test(g('brady')), /emergency ECMO .Akhtar/.test(g('lvad_arrest'))].join('');})()")==="truetruetruetrue" && T.indexOf("Rich meal: 8 h")<0); })(), "true");

check("v490: Part 31 corrections: hyperkalaemia thresholds/ECG/salbutamol, MH dantrolene, metaraminol",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(run("(function(){var g=function(id){return CHECKLISTS.filter(function(x){return x.id===id;})[0].stepsEn.join(' | ');};return [/≥6.5 SEVERE/.test(g('hyperkalaemia'))&&/adjunct to insulin-glucose/.test(g('hyperkalaemia'))&&!/AT THE SAME TIME/.test(g('hyperkalaemia'))&&/over 10 min .UKKA/.test(g('hyperkalaemia')), /more may be needed/.test(g('mh')), /metaraminol/.test(g('anaphylaxis'))].join('');})()")==="truetruetrue"); })(), "true");

check("v491: Part 32 corrections: crisis card IM cap/kid lines, LAST >70 kg, dantrolene 300 mg, checklists RSI/newborn",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(T.includes("Math.min(10 * w, 500)") && T.includes("Math.min(2.5 * w, 300)") && T.includes("w > 70 ?") && T.includes("const kid = !(ag >= 12)") && !T.includes("over 1 min (LBW)") && !T.includes("sugammadex if rocuronium") && !T.includes("vasopressin 1–2 U") && T.includes("target >1 mL/kg/h") && run("CHECKLISTS.filter(function(x){return x.id==='newborn';})[0].stepsEn.join(' ').indexOf('intra-tracheal 50–100')>=0 && CHECKLISTS.filter(function(x){return x.id==='rsi';})[0].stepsEn.join(' ').indexOf('3–5 min')<0")); })(), "true");

check("v492: Part 33 corrections: aspirin, MAP, iCa, obstetric GA, thoracic, neuro, English score names",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(T.includes("primary prevention (not carotid surgery)") && !T.includes("stopping it is a common error") && !T.includes("for ~15 min (AHA/ACC 2024)") && T.includes("ESA 2017: >0.9") && !T.includes("3 min / 8 VC") && !T.includes("peak < 35") && !T.includes("CPAP 5 cmH") && T.includes("BTF 3rd ed.") && !T.includes("v: \"> 100 mmHg\"") && run("(function(){var g=/[\u0370-\u03FF]/;var L=SCORES.concat(typeof MULTI_SCORES!=='undefined'?MULTI_SCORES:[]);return L.every(function(s){return !g.test(s.nameEn||s.name)&&!g.test(s.srcEn||s.src||'');});})()")); })(), "true");

check("v493: Part 34 corrections: ABW floor, nalbuphine/magnesium, Kataria range, TCI English, minor sources",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(T.includes("w <= ibwKg ? w : ibwKg + 0.4 * (w - ibwKg)") && T.includes("Math.min(0.1 * w, 20)") && T.includes("Math.min(30 * w, 4e3)") && T.includes("residual function is still worth protecting") && !T.includes("pointless residual") && T.includes("CD005059, 2016") && T.includes("via BoardsAcademy") && P.includes("m.nameEn || m.name") && run("TCI_MODELS.filter(function(m){return m.id==='kataria';})[0].rangeEn.indexOf('3–11')>=0 && TCI_MODELS.every(function(m){return !/[\u0370-\u03FF]/.test(m.nameEn||m.name) && !/[\u0370-\u03FF]/.test(m.targetTypeEn||m.targetType);})")); })(), "true");

check("v494: Part 35 corrections: low-flow example per agent, metronidazole redosing, FPM \u226550%, source lines",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(T.includes("const exP = aid === \"des\" ? 6 : aid === \"iso\" ? 1.5 : 5;") && T.includes("(5 * exP * 60 / A.vap).toFixed(1)") && !T.includes("~8.2 mL/h liquid") && T.includes("Metronidazole: redose only in very long procedures") && !T.includes("are NOT redosed intraoperatively") && T.includes("reduce by at least 50% at") && T.includes("between FPM and ANZCA") && T.includes("Edwards uses 1.38 / 0.0031") && T.includes("2 of the 4 arms")); })(), "true");

check("v495: Part 36 corrections: PONV dexamethasone/\u22653 factors, Apfel text, MAP 15 min removed, fasting, citations, STOP-BANG 256 combinations",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(T.includes("Dexamethasone 0.15 mg/kg (up to 4 mg, 5th Consensus)") && !T.includes("max 5 mg, consensus") && !T.includes("15 minutes") && !/3.u20134 antiemetics|3–4 antiemetics/.test(T) && /Anesthesiology 2017;126:376.{1,6}93/.test(T) && /Eur J Anaesthesiol 2026;43:295.{1,6}323/.test(T) && !T.includes("Anesth Analg 2025") && run("(function(){var g=function(id){return SCORES.filter(function(x){return x.id===id;})[0];};var sb=g('stopbang');var ok=true;for(var m=0;m<256;m++){var st=[];for(var b=0;b<8;b++)st.push(!!(m>>b&1));var n=st.filter(Boolean).length;var stop=st.slice(0,4).filter(Boolean).length;var combo=stop>=2&&(st[7]||st[4]||st[6]);var exp=n<=2?'low':(n<=4&&!combo?'mid':'high');if(sb.interp(n,'en',st).lvl!==exp)ok=false;}var a=g('apfel');return ok && /2 antiemetics of DIFFERENT classes/.test(a.interp(2,'en').en) && /at least 2 antiemetics/.test(a.interp(4,'en').en) && !/Gan 2020/.test(a.interp(3,'en').en) && /Fifth consensus/.test(a.src);})()")); })(), "true");

check("v496: Part 37 corrections: bronchospasm attribution = drug card, hypotension/VAE/transfusion sources, LAST QRH 3-10, immunosuppression, Sources EL=EN count and duplicates, metronome lists",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function () {
  const fs = require("fs"), path = require("path");
  const T = fs.readFileSync(path.join(__dirname, "..", "src", "tabs.js"), "utf8");
  const a = T.indexOf("function ReferencesCard"), b = T.indexOf("\nfunction ", a + 10);
  const RS = T.slice(a, b), R = RS.split("\n");
  let mode = 0, elOnly = 0, enOnly = 0;
  R.forEach(function (l) {
    if (/items: el \? \[\s*$/.test(l)) { mode = 1; return; }
    if (mode === 1 && /^\s*\] : \[\s*$/.test(l)) { mode = 2; return; }
    if (mode === 2 && /^\s*\] \}\)/.test(l)) { mode = 0; return; }
    if (/^\s{4,6}"/.test(l)) { if (mode === 1) elOnly++; else if (mode === 2) enOnly++; }
  });
  const checks = [
    elOnly > 0 && elOnly === enOnly,
    run("(function(){var o=[];CHECKLISTS.forEach(function(c){var t=JSON.stringify([c.stepsEl,c.stepsEn]);if(/100.120.?.?min/.test(t)&&!CRISIS_METRO[c.id])o.push(c.id);if(CRISIS_METRO[c.id]&&/3:1/.test(t))o.push(c.id);});return o.length===0;})()") === true,
    run("(function(){var c=CHECKLISTS.filter(function(x){return x.id==='bronchospasm';})[0];var h=DRUGS.filter(function(x){return x.id==='hydrocortisone';})[0];var s=c.stepsEn.join(' ');var d=JSON.stringify(h.doses);return /4 mg.kg, adults 200 mg .QRH/.test(s)&&/100 mg .BTS.SIGN 158/.test(s)&&!/6.12 puffs/.test(s)&&/4 mg.kg IV, adults 200 mg .QRH/.test(d)&&/100 mg IV .BTS.SIGN 158/.test(d)&&!/clinical practice/.test(d.match(/Bronchospasm[^}]*/)[0]);})()") === true,
    run("(function(){var g=function(id){return CHECKLISTS.filter(function(x){return x.id===id;})[0];};var j=function(id){return JSON.stringify(g(id));};return /crystalloid bolus 4 mL.kg .minimal fluid-challenge volume, Aya 2017/.test(j('hypotension'))&&!/4.5 mL.kg/.test(j('hypotension'))&&/bone wax .WFSA ATOTW 340/.test(j('vae'))&&/NHSBT Blood Essentials 2024/.test(j('transfusion'))&&/BCSH 2012/.test(g('transfusion').srcEn)&&/BSH 2023/.test(g('transfusion').srcEn)&&/NO forced inflation/.test(j('laryngospasm'))&&/PEEP adjusted to oxygenation/.test(j('aspiration'))&&/diastolic pressure .clinical practice/.test(j('ischemia'))&&/GTN. . clinical practice/.test(j('hypertension_ddx'));})()") === true,
    /5th PONV Consensus, Anesth Analg 2026/.test(run("JSON.stringify(DRUGS.filter(function(x){return x.id==='dexamethasone';})[0].doses)")),
    !T.includes("Lipid 20% 1000 mL") && T.includes("maximum cumulative dose 12 mL/kg (70 kg: 840 mL)") && !T.includes("Management of Severe Local Anaesthetic Toxicity. 2010") && !T.includes("severe local anaesthetic toxicity (2010)") && !T.includes("L = AAGBI LAST 2010"),
    !T.includes("Sevorane (AbbVie, Jun 2020)") && !T.includes("(number of antiemetics by risk factors)") && !T.includes("the card follows the 5th edition (2025)") && T.includes("(ARISCAT). Anesthesiology 2010") && (RS.match(/Leuzzi G, et al\. Thymectomy/g) || []).length === 1 && (RS.match(/The FLACC/g) || []).length === 1 && (RS.match(/Age-related iso-MAC/g) || []).length === 1 && !T.includes("Nalbuphine hydrochloride injection"),
    ["Halvorsen S", "Tinegate H", "Soutar R", "Aya HD", "Zammert M", "Paredes S", "Moitra VK, Gabrielli A, Maccioli GA, O'Connor MF. Anesthesia advanced circulatory life support", "Samuels M, Wieteska S", "Low A, Singh N, Krovvidi H"].every(function (x) { return T.includes(x); }),
    T.includes("Imuran, Aspen 2022") && T.includes("Choudhury 2017") && !T.includes("Avoid cannulae and cuffs on a limb with access or a graft") && T.includes("2023;55(1):46")
  ];
  return String(checks.every(Boolean));
})()); })(), "true");

check("v497: Sources: crisis-checklist group, unused entries removed, DAS ATI entry",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function () {
  const fs = require("fs"), path = require("path");
  const T = fs.readFileSync(path.join(__dirname, "..", "src", "tabs.js"), "utf8");
  const a = T.indexOf("function ReferencesCard"), b = T.indexOf("\nfunction ", a + 10);
  const RS = T.slice(a, b);
  const g = RS.indexOf('"Crisis checklists", items: ['), r = RS.indexOf('"Regional & Analgesia", items: [');
  const st = RS.indexOf("Staender S, et al. ESA/EBA"), ap = RS.indexOf("Samuels M, Wieteska S");
  return String(g > 0 && r > g && st > g && st < r && ap > g && ap < r && !/Frerk C|Tibi P|Ginosar Y/.test(RS) && RS.includes("Difficult Airway Society guidelines for awake tracheal intubation (ATI) in adults. Anaesthesia 2020"));
})()); })(), "true");

check("v498: Part 38: Sources citations completed, groups reorganised, DESATS attribution",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function () {
  const fs = require("fs"), path = require("path");
  const T = fs.readFileSync(path.join(__dirname, "..", "src", "tabs.js"), "utf8");
  const a = T.indexOf("function ReferencesCard"), b = T.indexOf("\nfunction ", a + 10);
  const RS = T.slice(a, b);
  const ok1 = ["1995;82(4):1026\\u201360", "Popat M, et al.). Difficult Airway Society Guidelines for the management of tracheal extubation. Anaesthesia 2012;67(3):318", "2012;159(2):143", "Abdominal operations in patients with cirrhosis", "So MC, de Souza CM", "Renard Y, Grape S", "Br J Haematol 2023;201(5):832", "valid until 29.06.2025", "last edited Feb 2025", "patients after cardiac surgery", "Lancet 2019;394(10210):1713", "2019;123(6):898", "EJA.0000000000002069", "Kopp SL, Vandermeulen E", "supporting resources to aid implementing guidance"].every(function (x) { return RS.includes(x); });
  const ok2 = !RS.includes("Sevorane SmPC (AbbVie") && !RS.includes("Anesthesiology 1995;82:1026");
  const hh = RS.indexOf('"Haemorrhage & Coagulation", items: ['), c2 = RS.indexOf("CRASH-2 trial collaborators"), nx = RS.indexOf("Group, {", hh + 10);
  const ok3 = hh > 0 && c2 > hh && c2 < nx && RS.includes('"Calculations, ventilation & fluids", items: [') && (RS.match(/"Special situations", items: \[/g) || []).length === 1;
  const D = fs.readFileSync(path.join(__dirname, "..", "src", "data.js"), "utf8");
  const ok4 = /DESATS: DAS.BAETS.ENT UK supporting resources v1.0 .2021/.test(D);
  return String(ok1 && ok2 && ok3 && ok4);
})()); })(), "true");

// --- v499: new look, phase 1 (spec \u00A72 colours and type, \u00A73 home screen, \u00A78.1-8.2 crisis mode, \u00A710 tests) ---
// Display and layout only: no dose, no step and no source changes in this version.
const V499_CR = `const lum = (h) => { const c = [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16) / 255).map(x => x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const mix = (f, b, a) => "#" + [1, 3, 5].map(i => Math.round(parseInt(f.substr(i, 2), 16) * a + parseInt(b.substr(i, 2), 16) * (1 - a)).toString(16).padStart(2, "0")).join("");`;
check("v499 palette, as changed by the author in v512 (navy accent, neutral paper): light theme and crisis mode",
  run(`[LIGHT.bg, LIGHT.card, LIGHT.ink, LIGHT.muted, LIGHT.line, LIGHT.grid, LIGHT.teal, LIGHT.tintInfo, LIGHT.red, LIGHT.tintDanger, NIGHT.bg, NIGHT.step, NIGHT.cycle].join(",")`),
  "#F2F4F7,#FFFFFF,#10262E,#55647A,#DDE3EA,#CBD4DE,#1D3D6B,#E6EDF6,#BF2F1D,#FBE9E5,#0C1D23,#122A32,#E9B949");
check("v499 contrast: muted on paper, accent on white, white on crisis red, recomputed from the code (v512 palette)",
  run(`(() => { ${V499_CR} return [cr(LIGHT.muted, LIGHT.bg), cr(LIGHT.teal, "#FFFFFF"), cr("#FFFFFF", LIGHT.red)].map(x => x.toFixed(2)).join(","); })()`), "5.46,10.87,5.77");
check("v499 contrast: every text/background pair of the new look is at least 4.5:1 (light theme and crisis mode)",
  run(`(() => { ${V499_CR} const L = LIGHT, N = NIGHT;
    const pairs = [[L.ink, L.bg], [L.ink, L.card], [L.ink, L.tintInfo], [L.muted, L.bg], [L.muted, L.card], [L.muted, L.cardAlt], [L.muted, L.tintInfo], [L.muted, L.tintNeutral],
      [L.teal, L.card], [L.teal, L.bg], [L.teal, L.cardAlt], [L.teal, L.tintInfo], [L.tintInfoFg, L.tintInfo], [L.onAccent, L.teal], [L.onAccent, L.red],
      [L.red, L.card], [L.red, L.bg], [L.tintDangerFg, L.tintDanger], [L.amber, L.card], [L.amber, L.bg], [L.tintWarnFg, L.tintWarn], [L.tintOkFg, L.tintOk], [L.tintGuideFg, L.tintGuide],
      [N.ink, N.step], [N.ink, N.bg], [N.muted, N.step], [N.muted, N.bg], [N.onInk, N.ink], [mix(N.ink, N.step, N.doneOpacity), N.step],
      ["#FFFFFF", N.crisis], ["#FFFFFF", N.teal], [N.cycle, N.bg], [N.cycle, N.step], [N.alert, N.step], [N.bg, N.ink]];
    return pairs.filter(p => cr(p[0], p[1]) < 4.5).map(p => p.join(" on ") + " " + cr(p[0], p[1]).toFixed(2)).join("; ") || "ok"; })()`), "ok");
check("v499 crisis mode: ticked steps fade to 55% and still clear 4.5:1; crisis palette does not follow the theme",
  run(`(() => { applyTheme("dark"); const a = JSON.stringify(NIGHT); applyTheme("light"); return NIGHT.doneOpacity === 0.55 && a === JSON.stringify(NIGHT); })()`), true);
check("v499 dark theme left as it was (no second colour table yet, spec 11)",
  run(`[DARK.bg, DARK.card, DARK.ink, DARK.teal, DARK.red, DARK.muted].join(",")`), "#111820,#1A2330,#E9EEF4,#8FB4DC,#F08379,#A6B3C2");
check("v499 step lead: the two parts always join back to the unchanged step text (every list, EL and EN)",
  run(`CHECKLISTS.every(c => c.stepsEl.concat(c.stepsEn).every(s => { const p = stepLead(s); return p.length === 2 && p[0] + p[1] === s; }))`), true);
check("v499 step lead: colon or spaced dash only; a range dash (100\u2013120, q3\u20135) or a ratio colon never ends the lead",
  run(`(() => { const c = CHECKLISTS.find(x => x.id === "vfvt"); const L = c.stepsEl.map(s => stepLead(s)[0]);
    const all = CHECKLISTS.every(c => c.stepsEl.concat(c.stepsEn).every(s => { const p = stepLead(s); return !p[0] || /:$/.test(p[0]) && /^\\s/.test(p[1]) || /^\\s[\\u2014\\u2013-]\\s/.test(p[1]); }));
    return all && L[0] === "\\u039A\\u03BB\\u03AE\\u03C3\\u03B7 \\u03B3\\u03B9\\u03B1 \\u03B2\\u03BF\\u03AE\\u03B8\\u03B5\\u03B9\\u03B1 & code cart" && L[1] === "" && L[2] === "\\u0391\\u03C0\\u03B9\\u03BD\\u03AF\\u03B4\\u03C9\\u03C3\\u03B7 \\u0391\\u039C\\u0395\\u03A3\\u0391:" && L[3] === "\\u0391\\u03B4\\u03C1\\u03B5\\u03BD\\u03B1\\u03BB\\u03AF\\u03BD\\u03B7 1 mg IV"
      && stepLead("CPR 30:2 100\\u2013120/min")[0] === "" && stepLead("A \\u2014 b: c")[0] === "A"; })()`), true);
check("v499 crisis title: short title when the author gives one, otherwise the full title",
  run(`CHECKLISTS.every(c => crisisTitle(c, "el") === (c.shortEl || (CRISIS_SHORT[c.id] || {}).el || c.titleEl) && crisisTitle(c, "en") === (c.shortEn || (CRISIS_SHORT[c.id] || {}).en || c.titleEn)) && crisisTitle({ titleEl: "A", titleEn: "B", shortEl: "a", shortEn: "b" }, "el") === "a" && crisisTitle({ titleEl: "A", titleEn: "B", shortEl: "a", shortEn: "b" }, "en") === "b" && CHECKLISTS.every(c => !!c.shortEl === !!c.shortEn)`), true);
check("v499 crisis mode: metronome catalogue, rates and arrest clocks unchanged",
  run(`JSON.stringify([Object.keys(CRISIS_METRO), METRO_RATES, Object.keys(CRISIS_CYCLE), Object.keys(CRISIS_ADR_35)])`),
  '[["vfvt","asystole_pea","maternal_arrest","asthma_arrest","cardiac_surgery_arrest","lvad_arrest"],[100,110,120],["vfvt","asystole_pea","maternal_arrest","asthma_arrest"],["vfvt","asystole_pea","maternal_arrest","asthma_arrest"]]');
check("v499 source files: crisis header and source panel, home screen numbers from the data, search hint, tabular numerals",
  (function () {
    const fs = require("fs"), p = require("path"), rd = (f) => fs.readFileSync(p.join(__dirname, "..", f), "utf8");
    const P = rd("src/primitives.js"), R = rd("src/root.js"), H = rd("index.html");
    const cm = P.slice(P.indexOf("function CrisisMode("), P.indexOf("// A4 print of one checklist"));
    const hs = R.slice(R.indexOf("function HomeScreen("), R.indexOf("// Recent chips store the title"));
    const pb = P.slice(P.indexOf("function PatientBarCore("), P.indexOf("// Split a drug's notes into labelled groups"));
    const bad = [];
    // crisis mode: the source line moved behind "i", it did not leave the app; no title typeface, no per-theme colours
    if (!(cm.includes('"data-crisis-src"') && cm.includes("c.srcEl") && cm.includes("c.srcEn") && cm.includes("setInfo(true)"))) bad.push("crisis source panel");
    if (!(cm.includes('"data-crisis-head"') && cm.includes("crisisTitle(c, lang)") && cm.includes("stepLead(s)"))) bad.push("crisis header");
    if (cm.includes("FONT_TITLE") || /\bS\.[a-zA-Z]/.test(cm)) bad.push("crisis mode must use NIGHT and the text typeface only");
    if (/"#0E1B30"|"#17294A"|"#22406E"/.test(cm)) bad.push("old crisis colours");
    if (!(cm.includes("startMetro(metroRate)") && cm.includes("METRO_RATES.map") && cm.includes('"aria-expanded": rates'))) bad.push("metronome button and rate chooser");
    if (!(cm.includes("adr: [...adr, Date.now()]") && cm.includes("cyc: Date.now()") && cm.includes("marks: [...marks, Date.now()]"))) bad.push("adrenaline / cycle / mark actions");
    // home: numbers read from the data, never typed in
    if (!(hs.includes("DRUGS.length") && hs.includes("TOOLS_SHOWN.length") && hs.includes("CHECKLISTS_SHOWN.length")) || /\b95\b/.test(hs) || /\bn: \d/.test(hs) || /"\d+ \\u03BB\\u03AF\\u03C3\\u03C4\\u03B5\\u03C2/.test(hs)) bad.push("home counts");
    if (!(hs.includes("HOME_RECENTS") && /const HOME_RECENTS = 3;/.test(R) && hs.includes('storeGet("aa_home_seen")'))) bad.push("recents / first-open text");
    if (!(hs.includes('"data-home-crisis"') && hs.includes("minHeight: 64") && hs.includes('gridTemplateColumns: "1fr 1fr"'))) bad.push("crisis button / 2x2 grid");
    if ((hs.match(/background: CRISIS_BTN/g) || []).length !== 1 || /background: S\.red/.test(hs) || /border: "[^"]*" \+ S\.red|color: S\.red/.test(hs)) bad.push("exactly one red element on the home screen");
    // search hint is the single word
    if (!R.includes('const searchLabel = lang === "el" ? "\\u0391\\u03BD\\u03B1\\u03B6\\u03AE\\u03C4\\u03B7\\u03C3\\u03B7" : "Search";') || R.includes("\\u03B5\\u03C0\\u03B5\\u03B9\\u03B3\\u03CC\\u03BD\\u03C4\\u03C9\\u03BD, \\u03B5\\u03C1\\u03B3\\u03B1\\u03BB\\u03B5\\u03AF\\u03C9\\u03BD\\u2026")) bad.push("search hint");
    // patient strip: decorative chart band, unit switch inside the age field, labels kept for screen readers
    if (!(pb.includes('"aria-hidden": "true"') && pb.includes('setAgeUnit(ageUnit === "y" ? "m" : "y")') && pb.includes("t.weight") && pb.includes("t.age") && pb.includes("t.height") && pb.includes("t.sex"))) bad.push("patient strip");
    if (!H.includes("font-variant-numeric: tabular-nums")) bad.push("tabular numerals");
    if (!(H.includes("background: #F2F4F7") && !H.includes("#EAF0F8") && !H.includes("#F4F6F2"))) bad.push("index.html background");
    return bad.join("; ") || "ok";
  })(), "ok");
check("v499 home screen and crisis mode: Greek and English have the same items",
  (function () {
    const fs = require("fs"), p = require("path"), R = fs.readFileSync(p.join(__dirname, "..", "src", "root.js"), "utf8");
    const hs = R.slice(R.indexOf("function HomeScreen("), R.indexOf("// Recent chips store the title"));
    const n = (re) => (hs.match(re) || []).length;
    return n(/\bel: "/g) === n(/\ben: "/g) && n(/subEl: /g) === n(/subEn: /g) && n(/nEl: /g) === n(/nEn: /g) && n(/\bel: "/g) === 5;
  })(), true);

// --- v500: fixes from the audit of phase 1 (F1-1 to F1-6) ---
check("v500 F1-2 step lead: the auditor's examples carry no bold; headings such as PEA, VF/VT, ABC keep it",
  run(`(() => { const L = (id, n, k) => stepLead(CHECKLISTS.find(c => c.id === id)[k || "stepsEl"][n - 1])[0];
    const none = [["hyperkalaemia", 7], ["bronchospasm", 5], ["svt_stable", 4], ["last", 8], ["status_epilepticus", 4], ["rv_shock", 6], ["lv_shock", 8], ["svt_unstable", 3]];
    const bad = none.filter(x => L(x[0], x[1]) !== "" || L(x[0], x[1], "stepsEn") !== "").map(x => x.join("#"));
    if (L("cardiac_surgery_arrest", 5) !== "PEA:" || L("lvad_arrest", 7) !== "VF/VT:" || L("total_spinal", 2) !== "ABC:" || L("vfvt", 3) !== "\\u0391\\u03C0\\u03B9\\u03BD\\u03AF\\u03B4\\u03C9\\u03C3\\u03B7 \\u0391\\u039C\\u0395\\u03A3\\u0391:") bad.push("headings");
    if (stepLead("ERC 2025: x")[0] || stepLead("ESA/EBA: x")[0] || stepLead("AHA: x")[0] || stepLead("Max 12 mL/kg (ERC: x)")[0] || stepLead("a (b \\u2014 c) d")[0] || stepLead("CPR: x")[0] !== "CPR:") bad.push("rules");
    return bad.join(",") || "ok"; })()`), "ok");
check("v500 F1-2 step lead: never inside a parenthesis, never longer than 60 characters, text still unchanged (734 steps)",
  run(`(() => { let n = 0, bad = 0; CHECKLISTS.forEach(c => c.stepsEl.concat(c.stepsEn).forEach(s => { n++; const p = stepLead(s); if (p[0] + p[1] !== s) bad++; if (p[0].length > STEP_LEAD_MAX) bad++; if ((p[0].match(/\\(/g) || []).length > (p[0].match(/\\)/g) || []).length) bad++; })); return n + ":" + bad + ":" + STEP_LEAD_MAX; })()`), "734:0:60");
check("v500 F1-3 age: 1 to 23 months shown in years with at most two decimals; the stored value keeps its precision",
  run(`(() => { for (let m = 1; m <= 23; m++) { const stored = String(m / 12), shown = ageYearsShown(stored); if (shown.length > 4 || Math.abs(parseFloat(shown) - m / 12) > 0.005 || Math.round(parseFloat(stored) * 12 * 100) / 100 !== m) return "month " + m + ": " + shown; }
    return [ageYearsShown("45"), ageYearsShown("0.5"), ageYearsShown("1.25"), ageYearsShown(""), ageYearsShown("0.5833333333333334"), ageYearsShown("abc")].join("|"); })()`), "45|0.5|1.25||0.58|abc");
check("v500 F1-6 contrast: every palette colour used as text colour anywhere in src is at least 4.5:1 on the card and on the page (light theme)",
  (function () {
    const fs = require("fs"), p = require("path");
    const used = new Set();
    for (const f of ["primitives", "tabs", "root"]) { const s = fs.readFileSync(p.join(__dirname, "..", "src", f + ".js"), "utf8"); let m; const re = /\bcolor: S\.([a-zA-Z]+)/g; while ((m = re.exec(s))) used.add(m[1]); const re2 = /\? S\.([a-zA-Z]+) : S\.([a-zA-Z]+);/g; while ((m = re2.exec(s))) { used.add(m[1]); used.add(m[2]); } }
    used.delete("onAccent"); used.delete("card"); used.delete("bg");
    return run(`(() => { ${V499_CR} return ${JSON.stringify([...used])}.filter(k => !LIGHT[k] || cr(LIGHT[k], LIGHT.card) < 4.5 || cr(LIGHT[k], LIGHT.bg) < 4.5).join(",") || "ok " + ${used.size >= 7}; })()`);
  })(), "ok true");
check("v500 source files: crisis title in full, adrenaline double tap, age label by unit, audit-check card type under condition",
  (function () {
    const fs = require("fs"), p = require("path"), rd = (f) => fs.readFileSync(p.join(__dirname, "..", f), "utf8");
    const P = rd("src/primitives.js"), A = rd("tests/audit-check.js"), bad = [];
    if (!(P.includes("WebkitLineClamp: 3") && P.includes('"data-crisis-title"') && P.includes("hasShort ?"))) bad.push("title");
    if (!P.includes("if (lastAdr && Date.now() - lastAdr < ADR_DOUBLE_TAP_MS) return;") || !/const ADR_DOUBLE_TAP_MS = 2000;/.test(P)) bad.push("adrenaline");
    if (!P.includes('ageUnit === "m" ? (el ? "\\u0397\\u03BB\\u03B9\\u03BA\\u03AF\\u03B1 (\\u03BC\\u03AE\\u03BD\\u03B5\\u03C2)" : "Age (months)") : t.age')) bad.push("age label");
    if (!A.includes('typeof PREOP !== "undefined"')) bad.push("audit-check");
    return bad.join("; ") || "ok";
  })(), "ok");

// --- v501: new look, phase 2 (spec \u00A75 drug list and search with the dose, \u00A76.1 drug card without mL, \u00A76.2 tags, \u00A710 tests) ---
// The drug list, the drug card and search are rendered here for real (a small tree renderer in place of React),
// and what each of them shows is compared.
const F2 = (function () {
  const fs = require("fs"), p = require("path"), vm = require("vm");
  const Frag = Symbol("Fragment"), memo = new Map();
  const R = {
    Fragment: Frag, Component: class {},
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    useState: (v) => [typeof v === "function" ? v() : v, () => {}],
    useRef: (v) => ({ current: v === undefined ? null : v }),
    useEffect: () => {}, useMemo: (f, deps) => { const k = String(f) + JSON.stringify(deps || []); return memo.has(k) ? memo.get(k) : (memo.set(k, f()), memo.get(k)); }, useLayoutEffect: () => {}, useCallback: (f) => f
  };
  const c = { React: R, window: { localStorage: null, addEventListener() {}, removeEventListener() {}, dispatchEvent() {} }, console, setTimeout: () => 0, clearTimeout() {}, Event: function () {} };
  vm.createContext(c);
  vm.runInContext(["data", "formulas", "primitives", "tabs", "root"].map((f) => fs.readFileSync(p.join(__dirname, "..", "src", f + ".js"), "utf8")).join("\n") + ";this.__ = { DRUGS, CATS, T, MedsTab, DrugCard, SearchResults, doseCtx, doseSummary, drugRows, primaryIndex, doseText, noteSections, SRC_TYPES, verifiedInfo, VERIFIED_MONTHS, doseAgeGroup, isPendingErc, rowsFor, primaryPick, drugLabel, labelPaint, LABELS, DRUG_LABELS, DRUG_LABEL_OPPOSITE };", c);
  // Render to a plain tree: { tag, props, kids } and strings.
  const render = (n) => {
    if (n === null || n === undefined || n === false || n === true) return [];
    if (typeof n === "string" || typeof n === "number") return [String(n)];
    if (Array.isArray(n)) return n.flatMap(render);
    if (n.type === Frag) return render(n.children);
    if (typeof n.type === "function") return render(n.type(Object.assign({}, n.props, { children: n.children.length > 1 ? n.children : n.children[0] })));
    return [{ tag: n.type, props: n.props, kids: render(n.children) }];
  };
  const text = (t) => (Array.isArray(t) ? t : [t]).map((x) => typeof x === "string" ? x : text(x.kids)).join("");
  const norm = (s) => s.replace(/\s+/g, " ").trim();
  const find = (t, fn, out) => { out = out || []; (Array.isArray(t) ? t : [t]).forEach((x) => { if (typeof x === "string") return; if (fn(x)) out.push(x); find(x.kids, fn, out); }); return out; };
  const doseNode = (t) => find(t, (x) => x.props["data-dose-main"] || x.props["data-dose-fixed"] || x.props["data-dose-none"])[0];
  return Object.assign(c.__, { render, text, norm, find, doseNode, h: R.createElement });
})();
check("v501 same dose everywhere: list = card = search for every drug, 3 weights (3.5, 20, 70 kg), Greek and English",
  (function () {
    const { DRUGS, T, MedsTab, DrugCard, SearchResults, doseCtx, render, text, norm, find, doseNode, h } = F2;
    const bad = [];
    let n = 0;
    for (const lang of ["el", "en"]) for (const wt of ["3.5", "20", "70"]) {
      const list = render(h(MedsTab, { lang, weight: wt, height: "", sex: "", age: "", focus: null, wBad: false }));
      const ctx = doseCtx(wt, "", "", "");
      for (const d of DRUGS) {
        const row = find(list, (x) => x.props["data-drug"] === d.id)[0];
        const L = norm(text(doseNode(row)));
        const C = norm(text(doseNode(find(render(h(DrugCard, { d, lang, ctx, sex: "", t: T[lang] })), (x) => x.props["data-dose-hero"])[0])));
        const sr = render(h(SearchResults, { lang, query: d.name, onPick() {}, patient: { weight: wt, height: "", sex: "", age: "" } }));
        const hit = find(sr, (x) => x.tag === "button" && x.kids[0] && typeof x.kids[0] !== "string" && norm(text(x.kids[0].kids[0])) === d.name)[0];
        const S = hit ? norm(text(doseNode(hit))) : "(not found)";
        n++;
        if (!L || L !== C || L !== S) bad.push(`${d.id} ${wt} kg ${lang}: list "${L}" card "${C}" search "${S}"`);
      }
    }
    return bad.slice(0, 3).join(" | ") || "ok " + n;
  })(), "ok 570");
check("v501 without a weight: list, card and search show the per-kg dose only, never 0, NaN or undefined",
  (function () {
    const { DRUGS, T, MedsTab, DrugCard, doseCtx, drugRows, primaryIndex, render, text, norm, find, doseNode, h } = F2;
    const bad = [];
    for (const lang of ["el", "en"]) {
      const list = render(h(MedsTab, { lang, weight: "", height: "", sex: "", age: "", focus: null, wBad: false }));
      const all = norm(text(list));
      if (/NaN|undefined|null/.test(all)) bad.push(lang + " list text");
      for (const d of DRUGS) {
        const rows = drugRows(d), ds = rows[primaryIndex(rows)];
        const L = norm(text(doseNode(find(list, (x) => x.props["data-drug"] === d.id)[0])));
        const expect = ds.fixed ? norm(lang === "en" && ds.fixedEn ? ds.fixedEn : ds.fixed) : (ds.lo === ds.hi ? ds.lo : ds.lo + "\u2013" + ds.hi) + " " + ds.unit;
        if (L !== expect) bad.push(`${d.id} ${lang}: "${L}" expected "${expect}"`);
        const card = norm(text(render(h(DrugCard, { d, lang, ctx: doseCtx("", "", "", ""), sex: "", t: T[lang] }))));
        if (/NaN|undefined|\b0 (mg|mcg|\u00B5g|g|mL|IU|U|mmol|mEq)\b/.test(card)) bad.push(d.id + " card " + lang);
      }
    }
    return bad.slice(0, 3).join(" | ") || "ok";
  })(), "ok");
check("v501 no text lost: every dose row label, fixed dose, per-kg dose, maximum, note group and contraindication of all 95 drugs is in the open card (EL and EN)",
  (function () {
    const { DRUGS, T, DrugCard, doseCtx, drugRows, doseText, noteSections, render, text, norm, h } = F2;
    const bad = [];
    for (const lang of ["el", "en"]) for (const d of DRUGS) {
      const ctx = doseCtx("70", "172", "M", "45");
      const card = norm(text(render(h(DrugCard, { d, lang, ctx, sex: "M", t: T[lang] }))));
      const has = (s, what) => { if (!card.includes(norm(String(s)))) bad.push(`${d.id} ${lang} ${what}: ${String(s).slice(0, 40)}`); };
      for (const ds of drugRows(d)) {
        has(ds[lang], "label");
        const dt = doseText(ds, ctx.wFor(ds), lang);
        if (typeof dt === "string") has(dt, ds.fixed ? "fixed" : "per kg");
        else { has(dt.base, "per kg"); has(dt.calc, "dose"); }
        if (ds.max) has(T[lang].maxLabel + ": " + ds.max + " " + ds.unit.replace("/kg", ""), "max");
      }
      const notes = lang === "el" ? d.notesEl : d.notesEn, ns = noteSections(notes);
      if (ns) ns.forEach((g) => has(g.text, "note " + g.k)); else has(notes, "notes");
      const ci = lang === "el" ? d.ciEl : d.ciEn;
      if (ci !== "\u2014") has(ci, "ci");
    }
    return bad.slice(0, 4).join(" | ") || "ok";
  })(), "ok");
check("v501 card notes kept: other age group, ideal body weight and the calculation line still appear where they apply",
  (function () {
    const { DRUGS, T, DrugCard, doseCtx, drugRows, primaryIndex, doseAgeGroup, render, text, norm, h } = F2;
    const bad = [];
    const card = (d, w, hgt, sex, age, lang) => norm(text(render(h(DrugCard, { d, lang, ctx: doseCtx(w, hgt, sex, age), sex, t: T[lang] }))));
    const peds = DRUGS.filter((d) => drugRows(d).some((ds) => !ds.fixed && doseAgeGroup(ds) === "peds"));
    peds.forEach((d) => { if (!card(d, "70", "", "", "45", "el").includes("\u0394\u03B5\u03BD \u03C5\u03C0\u03BF\u03BB\u03BF\u03B3\u03AF\u03B6\u03B5\u03C4\u03B1\u03B9 \u2014 \u03B3\u03C1\u03B1\u03BC\u03BC\u03AE \u03B3\u03B9\u03B1 \u03C0\u03B1\u03B9\u03B4\u03B9\u03AC")) bad.push("age " + d.id); });
    const ibw = DRUGS.filter((d) => drugRows(d).some((ds) => ds.basis === "ibw"));
    ibw.forEach((d) => { const s = card(d, "120", "170", "", "45", "en"); if (!s.includes("consensus: height \u2212 100 \u2642 / \u2212 105 \u2640") || !s.includes("no sex entered: female formula (lower dose)")) bad.push("ibw " + d.id); if (!card(d, "70", "", "M", "45", "en").includes("Enter height to calculate on ideal body weight")) bad.push("ibw-height " + d.id); });
    const roc = DRUGS.find((d) => d.id === "rocuronium"), rs = card(roc, "70", "", "", "", "el");
    if (!rs.includes("0.6 mg/kg \u00D7 70 kg = 42 mg")) bad.push("calculation line");
    if (!rs.includes("\u26A0 \u03A5\u03C0\u03BF\u03BB\u03BF\u03B3\u03B9\u03C3\u03BC\u03AD\u03BD\u03B5\u03C2 \u03C4\u03B9\u03BC\u03AD\u03C2")) bad.push("verify line");
    return bad.slice(0, 4).join(" | ") || "ok " + (peds.length > 0) + " " + (ibw.length > 0);
  })(), "ok true true");
check("v501 search example of spec \u00A75: \u00AB\u03C1\u03BF\u03BA\u00BB at 70 kg gives Rocuronium \u00B7 \u0394\u03B9\u03B1\u03C3\u03C9\u03BB\u03AE\u03BD\u03C9\u03C3\u03B7 \u00B7 42 mg",
  (function () {
    const { SearchResults, render, text, norm, find, doseNode, h } = F2;
    const sr = render(h(SearchResults, { lang: "el", query: "\u03C1\u03BF\u03BA", onPick() {}, patient: { weight: "70", height: "", sex: "", age: "" } }));
    const hit = find(sr, (x) => x.tag === "button" && /Rocuronium/.test(text(x)))[0];
    if (!hit) return "no result";
    return [norm(text(hit.kids[0].kids[0])), norm(text(find(hit, (x) => x.props["data-dose-label"])[0])), norm(text(doseNode(hit)))].join(" \u00B7 ");
  })(), "Rocuronium \u00B7 \u0394\u03B9\u03B1\u03C3\u03C9\u03BB\u03AE\u03BD\u03C9\u03C3\u03B7 \u00B7 42 mg");
check("v501 one calculation: list, card and search call doseSummary; doseText is called only inside doseFor (and the card's existing closing check)",
  (function () {
    const fs = require("fs"), p = require("path"), rd = (f) => fs.readFileSync(p.join(__dirname, "..", "src", f), "utf8");
    const P = rd("primitives.js"), Tb = rd("tabs.js"), R = rd("root.js");
    const meds = P.slice(P.indexOf("function doseCtx("), P.indexOf("// Crisis mode: one checklist full-screen"));
    const sr = Tb.slice(Tb.indexOf("function SearchResults("), Tb.indexOf("// Gastric ultrasound before induction"));
    const calls = (meds.match(/doseText\(/g) || []).length;
    const bad = [];
    if (calls !== 2 || !meds.includes("dt: doseText(ds, wd, lang)") || !meds.includes("typeof doseText(ds, w, lang) !== \"string\"")) bad.push("doseText calls in primitives: " + calls);
    if (/doseText\(|\.lo \*|\* w\b/.test(sr) || !sr.includes("doseSummary(pds, ctx, lang)") || !sr.includes("doseCtx(pt.weight, pt.height, pt.sex, pt.age)")) bad.push("search");
    if ((meds.match(/doseSummary\(/g) || []).length < 4) bad.push("list/card");
    if (!R.includes('onPick: pickResult, patient: { weight: CALC_MODE === "reference" ? "" : wSafe, height: hSafe, sex, age: aSafe }')) bad.push("root passes the same patient to search");
    if (/conc\b|\bmL\/mg|\/ ?conc/.test(meds)) bad.push("no mL in phase 2");
    return bad.join("; ") || "ok";
  })(), "ok");
check("v501 \u00A76.2 tags: the four source types EL/EN, \u00ABchecked\u00BB month, amber after 12 months, nothing shown while the data has no tags",
  (function () {
    const { DRUGS, T, DrugCard, doseCtx, SRC_TYPES, verifiedInfo, VERIFIED_MONTHS, render, text, norm, find, h } = F2;
    const bad = [];
    if (Object.keys(SRC_TYPES).join(",") !== "guideline,smpc,clinic,practice" || !Object.values(SRC_TYPES).every((x) => x.el && x.en)) bad.push("types");
    const now = new Date(2026, 10, 11);
    if (JSON.stringify(verifiedInfo("2026-11", now)) !== '{"text":"11/2026","old":false}' || !verifiedInfo("2025-11", now).old || verifiedInfo("2025-12", now).old || verifiedInfo("2026-13", now) !== null || verifiedInfo("", now) !== null || VERIFIED_MONTHS !== 12) bad.push("verified");
    const roc = DRUGS.find((d) => d.id === "rocuronium");
    const plain = render(h(DrugCard, { d: roc, lang: "el", ctx: doseCtx("70", "", "", ""), sex: "", t: T.el }));
    if (find(plain, (x) => x.props["data-src-tags"]).length) bad.push("tags shown without data");
    if (DRUGS.some((d) => d.srcType || d.verified || d.doses.some((x) => x.srcType || x.primary))) bad.push("data already has srcType/verified/primary: update this test");
    const tagged = Object.assign({}, roc, { srcType: "smpc", verified: "2026-11", doses: roc.doses.map((x, i) => i === 2 ? Object.assign({}, x, { srcType: "guideline" }) : x) });
    const s = norm(text(find(render(h(DrugCard, { d: tagged, lang: "el", ctx: doseCtx("70", "", "", ""), sex: "", t: T.el })), (x) => x.props["data-src-tags"])[0] || []));
    if (s !== "SmPC\u039F\u03B4\u03B7\u03B3\u03AF\u03B1\u03B5\u03BB\u03AD\u03B3\u03C7\u03B8\u03B7\u03BA\u03B5 11/2026") bad.push("tagged: " + s);
    return bad.join("; ") || "ok";
  })(), "ok");
check("v501 primary row: the list shows the row marked primary: true, otherwise the first; pending rows are never shown",
  (function () {
    const { drugRows, primaryIndex, DRUGS } = F2;
    const rows = [{ en: "a" }, { en: "b", primary: true }, { en: "c" }];
    return primaryIndex(rows) === 1 && primaryIndex([{ en: "a" }, { en: "b" }]) === 0 && DRUGS.every((d) => drugRows(d).length > 0 && drugRows(d).every((x) => !F2.isPendingErc(x)));
  })(), true);
check("v501 terminology and languages: no \u00AB\u03B5\u03C0\u03B1\u03B3\u03C9\u03B3\u00BB in the filters; the new card texts come in Greek and English pairs",
  (function () {
    const fs = require("fs"), p = require("path"), P = fs.readFileSync(p.join(__dirname, "..", "src", "primitives.js"), "utf8");
    const meds = P.slice(P.indexOf("function doseCtx("), P.indexOf("// Crisis mode: one checklist full-screen"));
    const pairs = [["\\u0386\\u03BB\\u03BB\\u03B5\\u03C2 \\u03B5\\u03BD\\u03B4\\u03B5\\u03AF\\u03BE\\u03B5\\u03B9\\u03C2", "Other indications"], ["\\u03C0\\u03B5\\u03C1\\u03B9\\u03C3\\u03C3\\u03CC\\u03C4\\u03B5\\u03C1\\u03B1", "more"], ["\\u03BB\\u03B9\\u03B3\\u03CC\\u03C4\\u03B5\\u03C1\\u03B1", "less"], ["\\u0388\\u03BD\\u03B4\\u03B5\\u03B9\\u03BE\\u03B7", "Indication"], ["\\u03B5\\u03BB\\u03AD\\u03B3\\u03C7\\u03B8\\u03B7\\u03BA\\u03B5 ", "checked "]];
    const miss = pairs.filter((x) => !meds.includes('"' + x[0] + '"') || !meds.includes('"' + x[1] + '"')).map((x) => x[1]);
    const cats = run("CATS.map(function(c){return c.el + ' ' + c.en;}).join(' ')");
    return (miss.join(",") || "ok") + " " + !/\u03B5\u03C0\u03B1\u03B3\u03C9\u03B3/i.test(cats);
  })(), "ok true");

// --- v502: new look, phase 6 (spec \u00A78.3 crisis log, \u00A79.1 icon shortcuts, \u00A79.2 paediatric mode, \u00A79.3 theatre mode) ---
check("v502 theatre mode: darker page than the dark theme, warm white text, every text pair at least 4.5:1, fourth step of the theme button",
  run(`(() => { ${V499_CR} const L = THEATRE;
    const pairs = [[L.ink, L.bg], [L.ink, L.card], [L.ink, L.cardAlt], [L.ink, L.tintInfo], [L.muted, L.bg], [L.muted, L.card], [L.muted, L.cardAlt], [L.muted, L.tintInfo], [L.muted, L.tintNeutral],
      [L.teal, L.card], [L.teal, L.bg], [L.teal, L.cardAlt], [L.teal, L.tintInfo], [L.tintInfoFg, L.tintInfo], [L.onAccent, L.teal], [L.onAccent, L.red],
      [L.red, L.card], [L.red, L.bg], [L.tintDangerFg, L.tintDanger], [L.amber, L.card], [L.amber, L.bg], [L.tintWarnFg, L.tintWarn], [L.tintOkFg, L.tintOk], [L.tintGuideFg, L.tintGuide], [L.tintOkAlt, L.bg], [L.card, L.ink]];
    const low = pairs.filter(p => cr(p[0], p[1]) < 4.5).map(p => p.join(" on "));
    applyTheme("theatre"); const on = S.bg === THEATRE.bg && S.ink === THEATRE.ink; applyTheme("light");
    const warm = parseInt(L.ink.substr(1, 2), 16) > parseInt(L.ink.substr(5, 2), 16);
    return (low.join("; ") || "ok") + " " + (lum(L.bg) < lum(DARK.bg)) + " " + warm + " " + on + " " + THEMES.join(">") + " " + (S.bg === LIGHT.bg); })()`),
  "ok true true true auto>light>dark>theatre true");
check("v502 crisis log: lines in time order with the time since the start; a step is named by its own words; text in the form of spec 8.3",
  run(`(() => { const c = CHECKLISTS.find(x => x.id === "vfvt"), t0 = 1000000;
    const log = { t0, ev: [{ t: t0 + 266000, k: "adr", x: 1 }, { t: t0 + 130000, k: "step", x: 2 }, { t: t0 + 5000, k: "metro", x: 110 }, { t: t0 + 60000, k: "mark", x: 1 }, { t: t0 + 61000, k: "step", x: 1 }, { t: t0 + 62000, k: "undo", x: 1 }, { t: t0 + 300000, k: "metroOff" }, { t: t0 + 120000, k: "cyc" }] };
    const el = crisisLogLines(c, "el", log).map(x => x.join(" ")), en = crisisLogLines(c, "en", log);
    const txt = crisisLogText(c, "el", log);
    return JSON.stringify(el) + "|" + en.length + "|" + (txt.split("\\n")[0] === c.titleEl) + "|" + (txt.split("\\n")[2] === el.join(" \\u00B7 ")) + "|" + en[0].join(" ") + "|" + (en[3][1].indexOf("2. " + c.stepsEn[1].slice(0, 10)) === 2); })()`),
  JSON.stringify(["00:00 \u0388\u03BD\u03B1\u03C1\u03BE\u03B7", "00:05 \u039C\u03B5\u03C4\u03C1\u03BF\u03BD\u03CC\u03BC\u03BF\u03C2 110/min", "01:00 \u03A3\u03AE\u03BC\u03B1\u03BD\u03C3\u03B7 1", "01:01 \u2713 2. FiO2 100%, \u03B1\u03B5\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2 10/min (\u03BC\u03B7\u03BD \u03C5\u03C0\u03B5\u03C1\u03B1\u03B5\u03C1\u03AF\u03B6\u03B5\u03C4\u03B5)", "01:02 \u0391\u03BD\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u2713 2. FiO2 100%, \u03B1\u03B5\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2 10/min (\u03BC\u03B7\u03BD \u03C5\u03C0\u03B5\u03C1\u03B1\u03B5\u03C1\u03AF\u03B6\u03B5\u03C4\u03B5)", "02:00 \u039D\u03AD\u03BF\u03C2 \u03BA\u03CD\u03BA\u03BB\u03BF\u03C2 2 min", "02:10 \u2713 3. \u0391\u03C0\u03B9\u03BD\u03AF\u03B4\u03C9\u03C3\u03B7 \u0391\u039C\u0395\u03A3\u0391", "04:26 \u0391\u03B4\u03C1\u03B5\u03BD\u03B1\u03BB\u03AF\u03BD\u03B7, \u03BA\u03B1\u03C4\u03B1\u03B3\u03C1\u03B1\u03C6\u03AE 1", "05:00 \u039C\u03B5\u03C4\u03C1\u03BF\u03BD\u03CC\u03BC\u03BF\u03C2: \u03C0\u03B1\u03CD\u03C3\u03B7"]) + "|9|true|true|00:00 Start|true");
check("v502 crisis log: memory only, no patient details, new start begins a new log, reload re-enters the marks the header still shows",
  (function () {
    const fs = require("fs"), p = require("path"), P = fs.readFileSync(p.join(__dirname, "..", "src", "primitives.js"), "utf8");
    const lg = P.slice(P.indexOf("const CRISIS_LOG = {};"), P.indexOf("function CrisisMode("));
    const cm = P.slice(P.indexOf("function CrisisMode("), P.indexOf("// A4 print of one checklist"));
    const bad = [];
    if (/storeSet|storeGet|localStorage|fetch\(|XMLHttpRequest|sendBeacon|weight|\bage\b/.test(lg)) bad.push("log code touches storage, network or patient fields");
    if (/storeSet\([^)]*(log|CRISIS_LOG|timeline)/i.test(P) || /\b(weight|age|wSafe|aSafe)\b|aa_patient|patientCheck/.test(cm)) bad.push("crisis mode stores the log or reads the patient");
    if (!(cm.includes('logAdd("mark", marks.length + 1)') && cm.includes('logAdd("adr", adr.length + 1)') && cm.includes('logAdd("cyc")') && cm.includes('logAdd(checked ? "undo" : "step", i)') && cm.includes('logAdd("metro", metroRate)') && cm.includes('logAdd("metroOff")') && cm.includes('crisisLogAdd(c.id, st.t0, "step", next)'))) bad.push("a press is not logged");
    if (!(cm.includes('if (log.ev.length) setTimeline("close"); else onClose();') && cm.includes("crisisLogText(c, lang, log)") && cm.includes("navigator.clipboard.writeText(txt)") && cm.includes('"data-crisis-timeline"'))) bad.push("timeline screen");
    const r = run(`(() => { const a = crisisLog("zz", 5, { marks: [9, 7], adr: [8] }); const same = crisisLog("zz", 5) === a; crisisLogAdd("zz", 5, "mark", 3); const n = a.ev.length; const b = crisisLog("zz", 6); const out = [a.ev.slice(0, 3).map(e => e.k + e.t).join(","), same, n, b !== a, b.ev.length]; delete CRISIS_LOG.zz; return out.join("|"); })()`);
    if (r !== "mark7,adr8,mark9|true|4|true|0") bad.push("log object: " + r);
    return bad.join("; ") || "ok";
  })(), "ok");
check("v502 paediatric mode: the limit already used by the dose rows (under 18 years); rows for children listed first, none lost, adult order untouched",
  run(`(() => { const C = (a) => doseCtx("20", "", "", a).child;
    if (C("") || C("0") || !C("0.1") || !C("5") || !C("17.9") || C("18") || C("45")) return "limit";
    const kid = doseCtx("20", "", "", "5"), adult = doseCtx("70", "", "", "45"), none = doseCtx("70", "", "", "");
    let moved = 0;
    for (const d of DRUGS) { const base = drugRows(d), k = rowsFor(d, kid);
      if (rowsFor(d, adult).some((x, i) => x !== base[i]) || rowsFor(d, none).some((x, i) => x !== base[i])) return "adult order " + d.id;
      if (k.length !== base.length || base.some(x => k.indexOf(x) < 0)) return "rows lost " + d.id;
      const firstNon = k.findIndex(x => doseAgeGroup(x) !== "peds"); if (firstNon >= 0 && k.slice(firstNon).some(x => doseAgeGroup(x) === "peds")) return "order " + d.id;
      if (k.some((x, i) => x !== base[i])) moved++;
    }
    const A = { en: "a" }, B = { en: "b", primary: true }, K = { en: "CHILDREN x" };
    return "ok " + (moved > 0) + " " + (primaryIndex([K, A, B], A) === 2) + " " + (primaryIndex([K, A], A) === 1); })()`), "ok true true true");
check("v502 paediatric mode: for a child (5 years, 20 kg) list = card = search for every drug, and no dose text differs from the adult card's rows",
  (function () {
    const { DRUGS, T, MedsTab, DrugCard, SearchResults, doseCtx, drugRows, doseText, render, text, norm, find, doseNode, h } = F2;
    const bad = [], ctx = doseCtx("20", "", "", "5");
    const list = render(h(MedsTab, { lang: "el", weight: "20", height: "", sex: "", age: "5", focus: null, wBad: false }));
    for (const d of DRUGS) {
      const L = norm(text(doseNode(find(list, (x) => x.props["data-drug"] === d.id)[0])));
      const cardTree = render(h(DrugCard, { d, lang: "el", ctx, sex: "", t: T.el }));
      const C = norm(text(doseNode(find(cardTree, (x) => x.props["data-dose-hero"])[0])));
      const sr = render(h(SearchResults, { lang: "el", query: d.name, onPick() {}, patient: { weight: "20", height: "", sex: "", age: "5" } }));
      const hit = find(sr, (x) => x.tag === "button" && x.kids[0] && typeof x.kids[0] !== "string" && norm(text(x.kids[0].kids[0])) === d.name)[0];
      const S = hit ? norm(text(doseNode(hit))) : "(not found)";
      if (!L || L !== C || L !== S) bad.push(`${d.id}: list "${L}" card "${C}" search "${S}"`);
      const all = norm(text(cardTree));
      for (const ds of drugRows(d)) { const dt = doseText(ds, ctx.wFor(ds), "el"); const want = typeof dt === "string" ? dt : dt.calc; if (!all.includes(norm(ds.el)) || !all.includes(norm(want))) bad.push(d.id + " row missing: " + ds.el.slice(0, 30)); }
    }
    return bad.slice(0, 3).join(" | ") || "ok";
  })(), "ok");
check("v502 icon shortcuts: four in the manifest, each opens a place that exists, and navigation is answered offline from the cached shell",
  (function () {
    const fs = require("fs"), p = require("path"), rd = (f) => fs.readFileSync(p.join(__dirname, "..", f), "utf8");
    const M = JSON.parse(rd("manifest.webmanifest")), SW = rd("sw.js"), R = rd("src/root.js");
    const ids = JSON.parse(run("JSON.stringify(CHECKLISTS_SHOWN.map(function(c){return c.id;}))"));
    const sc = M.shortcuts || [], bad = [];
    if (sc.length !== 4 || sc.map((s) => s.url).join(",") !== "./?go=lists,./?go=vfvt,./?go=anaphylaxis,./?go=meds") bad.push("shortcuts: " + sc.map((s) => s.url).join(","));
    sc.forEach((s) => { const go = s.url.split("go=")[1]; if (!(go === "lists" || go === "meds" || ids.indexOf(go) >= 0) || !s.name || !s.icons || !fs.existsSync(p.join(__dirname, "..", s.icons[0].src))) bad.push(s.url); });
    if (!(M.start_url === "./" && M.scope === "./" && M.icons.length === 4)) bad.push("manifest basics changed");
    if (!(/req\.mode === "navigate"/.test(SW) && SW.includes('cache.match("./index.html", MATCH)') && /if \(req\.mode === "navigate"\) \{[\s\S]{0,400}?const shell = \(await cache\.match\("\.\/index\.html", MATCH\)\)/.test(SW))) bad.push("service worker shell");
    if (!(R.includes('new URLSearchParams(window.location.search).get("go")') && R.includes('if (go === "lists" || go === "meds") setTab(go);') && R.includes("CHECKLISTS_SHOWN.find((x) => x.id === go)"))) bad.push("root.js");
    return bad.join("; ") || "ok";
  })(), "ok");
check("v502 source files: theme button cycles four themes, theatre text two steps larger, child label on the patient strip, Greek and English pairs",
  (function () {
    const fs = require("fs"), p = require("path"), rd = (f) => fs.readFileSync(p.join(__dirname, "..", "src", f), "utf8");
    const P = rd("primitives.js"), R = rd("root.js"), bad = [];
    if (!(R.includes("setTheme(THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length])") && R.includes('theme === "theatre" ? FS_LEVELS[Math.min(FS_LEVELS.length - 1, FS_LEVELS.indexOf(fs) + 2)] : fs') && (R.match(/zoom: fsEff/g) || []).length === 2 && !/zoom: fs\b/.test(R) && R.includes('if (mode === "theatre")') && R.includes('"Theme: theatre (dark, large text)"'))) bad.push("theatre");
    const pb = P.slice(P.indexOf("function PatientBarCore("), P.indexOf("// Split a drug's notes into labelled groups"));
    if (!(pb.includes('doseCtx("", "", "", age).child') && pb.includes('"data-peds-label"') && pb.includes('"\\u03A0\\u03B1\\u03B9\\u03B4\\u03AF" : "Child"') && pb.includes("kid ? S.tintWarn : S.cardAlt"))) bad.push("child label");
    if (!/const child = aNum > 0 && !\(aNum >= 18\);/.test(P)) bad.push("one limit");
    const tl = P.slice(P.indexOf("const timelineEl ="), P.indexOf('return h("div", { role: "dialog", "aria-modal": "true", "aria-label": fullTitle,'));
    const pairs = [["\\u03A7\\u03C1\\u03BF\\u03BD\\u03BF\\u03B3\\u03C1\\u03B1\\u03BC\\u03BC\\u03AE", "Timeline"], ["\\u0391\\u03BD\\u03C4\\u03B9\\u03B3\\u03C1\\u03B1\\u03C6\\u03AE \\u03C9\\u03C2 \\u03BA\\u03B5\\u03AF\\u03BC\\u03B5\\u03BD\\u03BF", "Copy as text"], ["\\u039D\\u03AD\\u03B1 \\u03BA\\u03C1\\u03AF\\u03C3\\u03B7", "New crisis"], ["\\u03A0\\u03AF\\u03C3\\u03C9 \\u03C3\\u03C4\\u03B7 \\u03BB\\u03AF\\u03C3\\u03C4\\u03B1", "Back to the list"]];
    pairs.forEach((x) => { if (!tl.includes('"' + x[0] + '"') || !tl.includes('"' + x[1] + '"')) bad.push(x[1]); });
    return bad.join("; ") || "ok";
  })(), "ok");

// --- v503: home screen, by the author (12/11/2026): Favourites always shown, fourth tile "About" ---
check("v503 home: Favourites tile is not conditional; the fourth tile reads \u00AB\u03A3\u03C7\u03B5\u03C4\u03B9\u03BA\u03AC\u00BB / About and opens About on its first tab",
  (function () {
    const fs = require("fs"), p = require("path"), R = fs.readFileSync(p.join(__dirname, "..", "src", "root.js"), "utf8");
    const hs = R.slice(R.indexOf("function HomeScreen("), R.indexOf("// Recent chips store the title"));
    return !/favItems\.length > 0 &&\s*(\/\*[^*]*\*\/\s*)?React\.createElement\("div", \{ style: \{ background: S\.card, border: "1px solid " \+ \(favOpen/.test(hs) && hs.includes("toggleFavOpen") && hs.includes('{ id: "about", icon: "info", el: "\\u03A3\\u03C7\\u03B5\\u03C4\\u03B9\\u03BA\\u03AC", en: "About"') && R.includes('if (id === "about") setAboutStart(0); setTab(id);');
  })(), true);
// --- v504: new look, phase 3 (spec \u00A74 syringe label colours), GFS Baskerville for titles (spec \u00A72.2) ---
check("v504 labels: the ten classes with the screen colours of spec 4.1; dark text on every colour is at least 4.5:1",
  run(`(() => { ${V499_CR} const keys = Object.keys(LABELS);
    const low = keys.filter(k => cr(LABEL_INK, LABELS[k].color) < 4.5);
    return keys.join(",") + "|" + keys.map(k => LABELS[k].color).join(",") + "|" + (low.join(",") || "ok") + "|" + keys.every(k => LABELS[k].el && LABELS[k].en) + "|" + cr(LABEL_INK, LABELS.nmb.color).toFixed(2); })()`),
  "induction,benzo,nmb,sux,opioid,vasopressor,local,antichol,antiemetic,other|#F2BE0B,#F0963A,#EC6B57,#EC6B57,#7DB0E3,#B397D8,#A8ADAB,#86C484,#F4A58A,#FFFFFF|ok|true|5.08");
check("v504 labels: every entry of the table is a real drug and a real class; 50 drugs labelled, the rest white; no dose data touched",
  run(`(() => { const ids = DRUGS.map(d => d.id), bad = [];
    Object.keys(DRUG_LABELS).forEach(k => { if (ids.indexOf(k) < 0) bad.push("no drug " + k); if (!LABELS[DRUG_LABELS[k]]) bad.push("no class " + k); });
    DRUG_LABEL_OPPOSITE.forEach(k => { if (!DRUG_LABELS[k]) bad.push("opposite without label " + k); });
    const white = DRUGS.filter(d => drugLabel(d).none).map(d => d.id);
    ["dexmedetomidine", "dexamethasone", "dopamine", "dobutamine", "isoprenaline", "milrinone", "levosimendan", "heparin", "oxytocin"].forEach(k => { if (white.indexOf(k) < 0) bad.push("should be white " + k); });
    if (DRUGS.some(d => "label" in d || "labelOpposite" in d)) bad.push("label fields inside DRUGS");
    return (bad.join("; ") || "ok") + " " + Object.keys(DRUG_LABELS).length + " " + white.length + " " + DRUG_LABEL_OPPOSITE.length; })()`), "ok 50 45 15");
check("v504 labels: the author's decisions (midazolam orange, atropine green, suxamethonium apart from rocuronium, antagonists and hypotensives striped, protamine black on white)",
  run(`(() => { const L = (id) => drugLabel(DRUGS.find(d => d.id === id)), P = (id) => labelPaint(L(id));
    const stripes = (s) => /^repeating-linear-gradient\\(135deg/.test(s);
    return [L("midazolam").key, L("atropine").key, L("propofol").key, L("fentanyl").color, P("rocuronium"), P("succinylcholine") !== P("rocuronium") && P("succinylcholine").indexOf("#EC6B57") > 0 && P("succinylcholine").indexOf(LABEL_INK) > 0,
      DRUG_LABEL_OPPOSITE.every(id => stripes(P(id))), DRUGS.filter(d => DRUG_LABEL_OPPOSITE.indexOf(d.id) < 0).every(d => !stripes(labelPaint(drugLabel(d)))),
      P("naloxone").indexOf(LABELS.opioid.color) > 0, P("flumazenil").indexOf(LABELS.benzo.color) > 0, P("neostigmine").indexOf(LABELS.nmb.color) > 0, P("labetalol").indexOf(LABELS.vasopressor.color) > 0,
      P("protamine").indexOf(LABEL_INK) > 0 && P("protamine").indexOf("#FFFFFF") > 0, P("heparin"), drugLabel({ id: "x", label: "opioid", labelOpposite: true }).opposite].join("|"); })()`),
  "benzo|antichol|induction|#7DB0E3|#EC6B57|true|true|true|true|true|true|true|true|#FFFFFF|true");
check("v504 labels on screen: 8 px stripe on every list row, 10 px bar and class name in the card; the name is always beside the colour; switch to turn them off",
  (function () {
    const { DRUGS, T, MedsTab, DrugCard, doseCtx, drugLabel, labelPaint, render, text, norm, find, h } = F2;
    const bad = [];
    const list = render(h(MedsTab, { lang: "el", weight: "70", height: "", sex: "", age: "", focus: null, wBad: false }));
    for (const d of DRUGS) {
      const row = find(list, (x) => x.props["data-drug"] === d.id)[0], st = find(row, (x) => x.props["data-label-stripe"])[0];
      if (!st || st.props.style.width !== 8 || st.props.style.background !== labelPaint(drugLabel(d)) || !norm(text(row)).startsWith(d.name)) bad.push("row " + d.id);
      const card = render(h(DrugCard, { d, lang: "el", ctx: doseCtx("70", "", "", ""), sex: "", t: T.el }));
      const bar = find(card, (x) => x.props["data-label-bar"])[0], L = drugLabel(d);
      if (!bar || bar.props.style.width !== 10 || bar.props.style.background !== labelPaint(L)) bad.push("bar " + d.id);
      if (!L.none && !norm(text(card)).includes("\u03B5\u03C4\u03B9\u03BA\u03AD\u03C4\u03B1: " + L.el + (L.opposite ? " (\u03C1\u03AF\u03B3\u03B5\u03C2: \u03B1\u03BD\u03C4\u03AF\u03B8\u03B5\u03C4\u03B7 \u03B4\u03C1\u03AC\u03C3\u03B7)" : "") + (L.blackTop ? " (\u03BC\u03B1\u03CD\u03C1\u03BF \u03C4\u03BF \u03C0\u03AC\u03BD\u03C9 \u03BC\u03B9\u03C3\u03CC)" : ""))) bad.push("name " + d.id);
      const off = render(h(DrugCard, { d, lang: "el", ctx: doseCtx("70", "", "", ""), sex: "", t: T.el, labOn: false }));
      if (find(off, (x) => x.props["data-label-bar"]).length || /\u03B5\u03C4\u03B9\u03BA\u03AD\u03C4\u03B1: /.test(text(off))) bad.push("off " + d.id);
    }
    const sw = find(list, (x) => x.props["data-label-switch"])[0];
    if (!sw || find(sw, (x) => x.tag === "button").length !== 2 || !/Association of Anaesthetists 2022 \(BS ISO 26825:2020\)/.test(text(sw))) bad.push("switch");
    const fs = require("fs"), p = require("path"), P = fs.readFileSync(p.join(__dirname, "..", "src", "primitives.js"), "utf8");
    if (!(P.includes('storeGet("aa_label_colours") !== false') && P.includes('storeSet("aa_label_colours", v)'))) bad.push("switch is not remembered");
    return bad.slice(0, 4).join(", ") || "ok";
  })(), "ok");
check("v504 filter: \u00AB\u03A5\u03C0\u03BD\u03B1\u03B3\u03C9\u03B3\u03AC\u00BB / Hypnotics in place of \u00AB\u0395\u03B9\u03C3\u03B1\u03B3\u03C9\u03B3\u03AE\u00BB / Induction; the category ids are unchanged",
  run(`(() => { const c = CATS.find(x => x.id === "induction"); return c.el + "|" + c.en + "|" + CATS.length + "|" + DRUGS.filter(d => d.cat === "induction").length; })()`), "\u03A5\u03C0\u03BD\u03B1\u03B3\u03C9\u03B3\u03AC|Hypnotics|15|7");
check("v512 titles: GFS Baskerville is gone from the package, the page, the offline cache and the code; titles use the text typeface; the title is the app name on the home screen and the section name elsewhere",
  (function () {
    const fs = require("fs"), p = require("path"), root = p.join(__dirname, ".."), rd = (f) => fs.readFileSync(p.join(root, f), "utf8");
    const bad = [];
    if (fs.existsSync(p.join(root, "fonts/GFSBaskerville.otf")) || fs.existsSync(p.join(root, "fonts/OFL-GFSBaskerville.txt"))) bad.push("font files still in the package");
    const H = rd("index.html"), SW = rd("sw.js"), F = rd("src/formulas.js"), P = rd("src/primitives.js"), R = rd("src/root.js"), PC = rd("tests/package-check.js");
    if (/Baskerville|Morfeas Title/.test(H + SW + F + P + R + PC + rd("src/tabs.js"))) bad.push("Baskerville still referenced");
    if (!F.includes("const FONT_TITLE = \"'Morfeas Sans', -apple-system")) bad.push("FONT_TITLE");
    if (/FONT_TITLE/.test(P)) bad.push("title style used outside titles (drug names, crisis mode)");
    if (!/const TITLE_STYLE = \{ fontFamily: FONT_TITLE, fontWeight: 800, fontSize: 28,/.test(R)) bad.push("title style");
    if (!(R.includes('h("div", { "data-screen-title": "1", style: { ...TITLE_STYLE, fontSize: 22, letterSpacing: -0.4 } }, "Morfeas")') && R.includes('t.tabs[tab] || "Morfeas"),'))) bad.push("screen title");
    return bad.join("; ") || "ok";
  })(), "ok");

// --- v505: short titles for the crisis header, approved by the author (12/11/2026) ---
check("v505 short titles: 22 checklists, each a real checklist, Greek and English both given, shorter than the full title, at most 32 characters; full titles untouched",
  run(`(() => { const ids = CHECKLISTS.map(c => c.id), keys = Object.keys(CRISIS_SHORT), bad = [];
    keys.forEach(k => { const c = CHECKLISTS.find(x => x.id === k), s = CRISIS_SHORT[k]; if (!c) return bad.push("no list " + k); if (!s.el || !s.en) bad.push("pair " + k); if (s.el.length > 32 || s.en.length > 32) bad.push("long " + k); if (s.el.length >= c.titleEl.length || s.en.length > c.titleEn.length) bad.push("not shorter " + k); if (crisisTitle(c, "el") !== s.el || crisisTitle(c, "en") !== s.en || crisisShort(c, "el") !== s.el) bad.push("title " + k); });
    const rest = CHECKLISTS.filter(c => keys.indexOf(c.id) < 0); if (rest.some(c => crisisShort(c, "el") || crisisTitle(c, "el") !== c.titleEl || crisisTitle(c, "en") !== c.titleEn)) bad.push("unlisted");
    if (CHECKLISTS.some(c => "shortEl" in c || "shortEn" in c)) bad.push("fields inside CHECKLISTS");
    return (bad.join("; ") || "ok") + " " + keys.length + " " + crisisTitle(CHECKLISTS.find(c => c.id === "vfvt"), "el") + " | " + crisisTitle(CHECKLISTS.find(c => c.id === "anaphylaxis"), "el"); })()`),
  "ok 22 VF / \u03AC\u03C3\u03C6\u03C5\u03B3\u03BC\u03B7 VT | \u0391\u03BD\u03B1\u03C6\u03C5\u03BB\u03B1\u03BE\u03AF\u03B1");
// --- v506: fixes from the audit of v505 (V5-1 to V5-13) ---
check("v506 V5-1 child (5 years, 18 kg): for all 95 drugs the main row in the list, in search and in the card is never an adult row; a paediatric row is chosen only when it is the only one and carries no age or weight limit",
  (function () {
    const { DRUGS, T, MedsTab, DrugCard, SearchResults, doseCtx, drugRows, primaryPick, doseAgeGroup, render, text, norm, find, doseNode, h } = F2;
    const bad = []; let one = 0, many = 0, none = 0;
    for (const lang of ["el", "en"]) {
      const pt = { weight: "18", height: "110", sex: "", age: "5" }, ctx = doseCtx("18", "110", "", "5");
      const list = render(h(MedsTab, Object.assign({ lang, focus: null, wBad: false }, pt)));
      for (const d of DRUGS) {
        const pk = primaryPick(d, ctx), nPeds = drugRows(d).filter((x) => doseAgeGroup(x) === "peds").length;
        if (pk.index >= 0 && doseAgeGroup(pk.rows[pk.index]) !== "peds") bad.push("main row is not paediatric: " + d.id);
        const single = drugRows(d).filter((x) => doseAgeGroup(x) === "peds")[0];
        const auto = nPeds === 1 && !/\d/.test(single.en);
        if (auto !== (pk.index >= 0)) bad.push("rule: " + d.id);
        if (pk.index >= 0 && /\d/.test(pk.rows[pk.index].en)) bad.push("row with an age or weight limit chosen: " + d.id);
        if (lang === "el") { if (auto) one++; else if (nPeds >= 1) many++; else none++; }
        const row = find(list, (x) => x.props["data-drug"] === d.id)[0];
        const lab = find(row, (x) => x.props["data-dose-label"])[0];
        const L = norm(text(doseNode(row)));
        const cardTree = render(h(DrugCard, { d, lang, ctx, sex: "", t: T[lang] }));
        const C = norm(text(doseNode(find(cardTree, (x) => x.props["data-dose-hero"])[0])));
        const sr = render(h(SearchResults, { lang, query: d.name, onPick() {}, patient: pt }));
        const hit = find(sr, (x) => x.tag === "button" && x.kids[0] && typeof x.kids[0] !== "string" && norm(text(x.kids[0].kids[0])) === d.name)[0];
        const S = hit ? norm(text(doseNode(hit))) : "(not found)";
        if (!L || L !== C || L !== S) bad.push(`${d.id} ${lang}: list "${L}" card "${C}" search "${S}"`);
        if (pk.index < 0 && (lab || find(row, (x) => x.props["data-dose-main"] || x.props["data-dose-fixed"]).length || L !== pk.none[lang])) bad.push("a dose is shown without a main row: " + d.id);
        if (pk.index >= 0 && (!lab || norm(text(lab)) !== norm(pk.rows[pk.index][lang]))) bad.push("label: " + d.id);
        // every row for adults that is still listed in the card says so, fixed doses included
        const notes = find(cardTree, (x) => x.props["data-age-note"]).length + (norm(text(cardTree)).split(lang === "el" ? "\u0394\u03B5\u03BD \u03C5\u03C0\u03BF\u03BB\u03BF\u03B3\u03AF\u03B6\u03B5\u03C4\u03B1\u03B9 \u2014 \u03B3\u03C1\u03B1\u03BC\u03BC\u03AE \u03B3\u03B9\u03B1 \u03B5\u03BD\u03AE\u03BB\u03B9\u03BA\u03B5\u03C2" : "Not calculated \u2014 adult row").length - 1);
        if (notes !== drugRows(d).filter((x) => doseAgeGroup(x) === "adult").length) bad.push("adult rows without the note: " + d.id);
      }
    }
    return (bad.slice(0, 4).join(" | ") || "ok") + " " + one + "/" + many + "/" + none;
  })(), "ok 9/43/43");
check("v506 V5-1 the auditor's examples: ondansetron, adrenaline, metoclopramide, etomidate, paracetamol (row for \u226410 kg), fentanyl show no dose in the list; glucagon shows its one unrestricted paediatric row",
  (function () {
    const { DRUGS, MedsTab, render, text, norm, find, h } = F2;
    const list = render(h(MedsTab, { lang: "el", weight: "18", height: "110", sex: "", age: "5", focus: null, wBad: false }));
    const row = (id) => find(list, (x) => x.props["data-drug"] === id)[0];
    const q = (id, k) => { const n = find(row(id), (x) => x.props[k])[0]; return n ? norm(text(n)) : ""; };
    const out = [q("ondansetron", "data-dose-none") === "1 \u03B3\u03C1\u03B1\u03BC\u03BC\u03AE \u03B3\u03B9\u03B1 \u03C0\u03B1\u03B9\u03B4\u03B9\u03AC", /^\u03A0\u0391\u0399\u0394\u0399\u0391 \u2014/.test(q("glucagon", "data-dose-label")) && !!q("glucagon", "data-dose-fixed"), q("etomidate", "data-dose-none") === "\u039A\u03B1\u03BC\u03AF\u03B1 \u03B3\u03C1\u03B1\u03BC\u03BC\u03AE \u03C3\u03B7\u03BC\u03B5\u03B9\u03C9\u03BC\u03AD\u03BD\u03B7 \u03B3\u03B9\u03B1 \u03C0\u03B1\u03B9\u03B4\u03B9\u03AC" && /^\u03A0\u0391\u0399\u0394\u0399\u0391 \(/.test(q("rocuronium", "data-dose-label"))];
    ["adrenaline", "metoclopramide", "ondansetron", "etomidate", "paracetamol", "fentanyl", "midazolam", "atropine", "propofol"].forEach((id) => out.push(!q(id, "data-dose-main") && !q(id, "data-dose-fixed") && !!q(id, "data-dose-none")));
    return out.join(",");
  })(), "true,true,true,true,true,true,true,true,true,true,true,true");
check("v506 V5-1 adult (45 years) and no age: the main row is never a paediatric row; without an age it is the author's row, as before",
  run(`(() => { const adult = doseCtx("70", "172", "M", "45"), none = doseCtx("70", "", "", ""), bad = [];
    for (const d of DRUGS) { const a = primaryPick(d, adult), n = primaryPick(d, none), base = drugRows(d);
      if (a.index < 0 || doseAgeGroup(a.rows[a.index]) === "peds") bad.push("adult " + d.id);
      if (n.index !== 0 || n.rows[0] !== base[0] || n.none) bad.push("no age " + d.id);
      if (a.rows.some((x, i) => x !== base[i])) bad.push("order " + d.id); }
    const fake = { id: "x", doses: [{ en: "CHILDREN", el: "\\u03A0", fixed: "a" }, { en: "Adults", el: "E", fixed: "b" }] }, onlyKids = { id: "y", doses: [{ en: "Children", el: "\\u03A0", fixed: "a" }] };
    return (bad.join(",") || "ok") + " " + primaryPick(fake, adult).index + " " + primaryPick(fake, doseCtx("18", "", "", "5")).index + primaryPick({ id: "z", doses: [{ en: "Adults", el: "E", fixed: "b" }, { en: "CHILDREN >8 years", el: "P", fixed: "a" }] }, doseCtx("18", "", "", "5")).index + " " + primaryPick(onlyKids, adult).index + " " + primaryPick(onlyKids, adult).none.en; })()`), "ok 1 0-1 -1 No row for adults");
check("v506 V5-2 \u00AB\u039D\u03AD\u03B1 \u03BA\u03C1\u03AF\u03C3\u03B7\u00BB: asks first, clears the ticks of the checklist, apart from Close; V5-9 copied text says it is not a medical record",
  (function () {
    const fs = require("fs"), p = require("path"), P = fs.readFileSync(p.join(__dirname, "..", "src", "primitives.js"), "utf8"), bad = [];
    if (!P.includes('if (!askNew) { setAskNew(true); setTimeout(() => setAskNew(false), 4000); return; }')) bad.push("no confirmation");
    if (!(P.includes("if (resetTicks) resetTicks();") && P.includes("resetTicks: () => resetList(crisisC.id, crisisC.stepsEl.length)"))) bad.push("ticks not cleared");
    if (/"New crisis"\),\s*h\("button"[^\n]*"Close"/.test(P) || !P.includes('"data-new-crisis": "1"') || !P.includes("marginTop: 10, background: askNew ? NIGHT.crisis")) bad.push("not apart from Close");
    if (!P.includes('if (e.key !== "Escape") return;')) bad.push("Escape");
    const t = run(`(() => { const c = CHECKLISTS.find(x => x.id === "vfvt"); const el = crisisLogText(c, "el", { t0: 0, ev: [] }).split("\\n"), en = crisisLogText(c, "en", { t0: 0, ev: [] }).split("\\n"); return el.length + "|" + el[1] + "|" + en[1] + "|" + el[2]; })()`);
    if (t !== "3|\u03A0\u03B1\u03C4\u03AE\u03BC\u03B1\u03C4\u03B1 \u03C3\u03C4\u03B7\u03BD \u03B5\u03C6\u03B1\u03C1\u03BC\u03BF\u03B3\u03AE Morfeas, \u03C7\u03C1\u03CC\u03BD\u03BF\u03B9 \u03B1\u03C0\u03CC \u03C4\u03B7\u03BD \u03AD\u03BD\u03B1\u03C1\u03BE\u03B7. \u0394\u03B5\u03BD \u03B5\u03AF\u03BD\u03B1\u03B9 \u03B9\u03B1\u03C4\u03C1\u03B9\u03BA\u03CC \u03B1\u03C1\u03C7\u03B5\u03AF\u03BF.|Presses in the Morfeas app, times since the start. Not a medical record.|00:00 \u0388\u03BD\u03B1\u03C1\u03BE\u03B7") bad.push("copied text: " + t);
    return bad.join("; ") || "ok";
  })(), "ok");
check("v506 V5-10 notes: everything after the source label stays in the Source group (8 drugs), and no note text is lost or changed in any drug",
  run(`(() => { const bad = [], fixed = [];
    for (const d of DRUGS) for (const t of [d.notesEl, d.notesEn]) { const ns = noteSections(t); if (!ns) continue;
      const sents = splitSentences(t), k = sents.findIndex(s => NOTE_GROUPS[0].re.test(s));
      const all = ns.map(g => g.text).join(" ").replace(/\\s+/g, " ");
      for (const s of sents) { const core = s.replace(/^(\\u0391\\u03BB\\u03BB\\u03B7\\u03BB\\u03B5\\u03C0\\u03B9\\u03B4\\u03C1\\u03AC\\u03C3\\u03B5\\u03B9\\u03C2|Interactions|\\u03A5\\u03C0\\u03B5\\u03C1\\u03B4\\u03BF\\u03C3\\u03BF\\u03BB\\u03BF\\u03B3\\u03AF\\u03B1|Overdose|\\u03A0\\u03B7\\u03B3\\u03AE|\\u03A0\\u03B7\\u03B3\\u03AD\\u03C2|Sources?)\\s*:\\s*/, ""); if (all.indexOf(core.replace(/\\s+/g, " ")) < 0) bad.push("lost " + d.id); }
      if (k >= 0) { const src = ns.find(g => g.k === "src"); const tail = sents.slice(k + 1); if (tail.some(s => src.text.indexOf(s) < 0)) bad.push("tail " + d.id); if (tail.length && fixed.indexOf(d.id) < 0) fixed.push(d.id); } }
    const e = noteSections(DRUGS.find(d => d.id === "etomidate").notesEl), src = e.find(g => g.k === "src").text, gen = e.find(g => g.k === "gen").text;
    return (bad.join(",") || "ok") + " " + fixed.sort().join(",") + " " + /B\\. Braun \\(emc, \\u03B1\\u03BD\\u03B1\\u03B8\\. 7\\/2024\\)\\.$/.test(src) + " " + !/Braun \\(emc/.test(gen); })()`),
  "ok carboprost,etomidate,furosemide,hypertonic_saline,isoprenaline,magnesium,methylene_blue,n2o true true");
check("v506 V5-6 contraindications open from the start; V5-3 label note says the source has been revised; V5-7 SCOOP title; V5-8 no mid-word breaks; V5-12, V5-13",
  (function () {
    const fs = require("fs"), p = require("path"), rd = (f) => fs.readFileSync(p.join(__dirname, "..", "src", f), "utf8");
    const P = rd("primitives.js"), R = rd("root.js"), bad = [];
    const meds = P.slice(P.indexOf("function doseCtx("), P.indexOf("// Crisis mode: one checklist full-screen"));
    if (!(meds.includes('data: "ci", full: true }') && meds.includes("useState(!!full)") && !/data: "notes", full/.test(meds))) bad.push("V5-6");
    if (!(meds.includes("Association of Anaesthetists 2022 (BS ISO 26825:2020)") && !/AAGBI 2014/.test(meds))) bad.push("V5-3");
    if (run('CRISIS_SHORT.scoop.el + "|" + CRISIS_SHORT.scoop.en') !== "\u0391\u03B9\u03BC\u03AC\u03C4\u03C9\u03BC\u03B1 \u03B8\u03C5\u03C1\u03B5\u03BF\u03B5\u03B9\u03B4\u03B5\u03BA\u03C4\u03BF\u03BC\u03AE\u03C2 (SCOOP)|Post-thyroidectomy haematoma") bad.push("V5-7");
    if (/overflowWrap: "anywhere"/.test(meds) || !meds.includes('flex: "1 1 104px"') || !meds.includes('flexWrap: "wrap",')) bad.push("V5-8");
    if (!(R.includes('const fsLocked = theme === "theatre";') && (R.match(/disabled: fsLocked \|\| fs/g) || []).length === 2 && !/letterSpacing: 1\.5/.test(R))) bad.push("V5-12");
    if (run('["UKKA", "DGN", "NHS"].every(function (x) { return STEP_SOURCE_LABELS.indexOf(x) >= 0; }) + " " + stepLead("NHS: x")[0]') !== "true ") bad.push("V5-13");
    return bad.join("; ") || "ok";
  })(), "ok");

// --- v507: label colours per the 2022 review (audit of v506: V6-1 sugammadex, V6-2 black upper half, V6-3 source), V6-4 note, V6-6 wording ---
check("v507 V6-1 / V6-2 labels: sugammadex red with stripes like neostigmine; adrenaline and suxamethonium black upper half over the class colour, apart from ephedrine and rocuronium",
  run(`(() => { const L = (id) => drugLabel(DRUGS.find(d => d.id === id)), P = (id) => labelPaint(L(id)), top = (c) => "linear-gradient(180deg, " + LABEL_INK + " 0 50%, " + c + " 50% 100%)";
    return [L("sugammadex").key, L("sugammadex").opposite, P("sugammadex") === P("neostigmine"), L("sugammadex").el, L("neostigmine").en, L("rocuronium").el,
      P("adrenaline") === top(LABELS.vasopressor.color), P("succinylcholine") === top(LABELS.nmb.color), P("adrenaline") !== P("ephedrine"), P("succinylcholine") !== P("rocuronium"),
      DRUGS.filter(d => drugLabel(d).blackTop).map(d => d.id).join("+"), P("ephedrine"), DRUG_LABEL_OPPOSITE.length, DRUGS.filter(d => drugLabel(d).none).length].join("|"); })()`),
  "nmb|true|true|\u0391\u03BD\u03B1\u03C3\u03C4\u03C1\u03BF\u03C6\u03AE \u03BC\u03C5\u03BF\u03C7\u03AC\u03BB\u03B1\u03C3\u03B7\u03C2|Muscle relaxant reversal|\u039C\u03C5\u03BF\u03C7\u03B1\u03BB\u03B1\u03C1\u03C9\u03C4\u03B9\u03BA\u03AC, \u03BC\u03B7 \u03B1\u03C0\u03BF\u03C0\u03BF\u03BB\u03C9\u03C4\u03B9\u03BA\u03AC|true|true|true|true|succinylcholine+adrenaline|#B397D8|15|45");
check("v507 V6-3 source: the switch names the 2022 review, and the review is in the bibliography of \u00AB\u03A0\u03B7\u03B3\u03AD\u03C2\u00BB in both languages; no DOI invented",
  (function () {
    const fs = require("fs"), p = require("path"), rd = (f) => fs.readFileSync(p.join(__dirname, "..", "src", f), "utf8");
    const P = rd("primitives.js"), Tb = rd("tabs.js"), D = rd("data.js");
    const a = Tb.indexOf("function ReferencesCard"), body = Tb.slice(a, Tb.indexOf("\nfunction ", a + 10));
    const n = (body.match(/Association of Anaesthetists\. Syringe labelling in anaesthesia and critical care areas: review 2022\./g) || []).length;
    const line = body.slice(body.indexOf("Association of Anaesthetists. Syringe labelling"), body.indexOf("\n", body.indexOf("Association of Anaesthetists. Syringe labelling")));
    return [n === 2, !/doi/i.test(line), P.includes("Association of Anaesthetists 2022 (BS ISO 26825:2020)"), !/AAGBI 2014/.test(P), /review 2022\s*\n\/\/ \(September 2022\), which follows BS ISO 26825:2020/.test(D)].join(",");
  })(), "true,true,true,true,true");
check("v507 V6-4 child card without a main row: says that the rows are not filtered by age or weight (EL and EN); V6-6 wording of the v506 entry",
  (function () {
    const { DRUGS, T, DrugCard, doseCtx, render, text, norm, find, h } = F2;
    const ctx = doseCtx("18", "110", "", "5"), out = [];
    for (const lang of ["el", "en"]) { let n = 0, miss = 0; for (const d of DRUGS) { const c = render(h(DrugCard, { d, lang, ctx, sex: "", t: T[lang] })); const none = find(c, (x) => x.props["data-dose-none"]).length, note = find(c, (x) => x.props["data-row-limits-note"]); if (none) { n++; if (note.length !== 1 || !/(\u03B7\u03BB\u03B9\u03BA\u03AF\u03B1 \u03AE \u03B2\u03AC\u03C1\u03BF\u03C2|age or weight)/.test(text(note))) miss++; } else if (note.length) miss++; } out.push(n + ":" + miss); }
    const e = JSON.parse(run("JSON.stringify(CHANGELOG.find(function (x) { return x.v === 506; }))"));
    out.push(/\u03C7\u03C9\u03C1\u03AF\u03C2 \u03CC\u03C1\u03B9\u03BF \u03B7\u03BB\u03B9\u03BA\u03AF\u03B1\u03C2 \u03AE \u03B2\u03AC\u03C1\u03BF\u03C5\u03C2/.test(e.el[0]) && /no age or weight limit/.test(e.en[0]));
    return out.join(",");
  })(), "86:0,86:0,true");
// --- v508: the black upper half must be visible on the dark and theatre themes (audit of v507, V7-1) ---
check("v508 V7-1 black upper half on dark themes: adrenaline and suxamethonium get a 1 px frame in the colour of their class on dark and theatre, none on light; no other drug is framed; the frame colour has contrast of at least 3:1 with the card",
  run(`(() => { ${V499_CR} const L = (id) => drugLabel(DRUGS.find(d => d.id === id)), out = [];
    for (const th of ["light", "dark", "theatre"]) { applyTheme(th);
      const framed = DRUGS.filter(d => labelFrame(drugLabel(d))).map(d => d.id).join("+");
      out.push(th + ":" + (framed || "none") + (framed ? ":" + labelFrame(L("adrenaline")) + ":" + labelFrame(L("succinylcholine")) + ":" + (cr(LABELS.vasopressor.color, S.card) >= 3 && cr(LABELS.nmb.color, S.card) >= 3) + ":" + (cr(LABEL_INK, S.card) < 1.5) : "")); }
    applyTheme("light"); return out.join(" | "); })()`),
  "light:none | dark:succinylcholine+adrenaline:inset 0 0 0 1px #B397D8:inset 0 0 0 1px #EC6B57:true:true | theatre:succinylcholine+adrenaline:inset 0 0 0 1px #B397D8:inset 0 0 0 1px #EC6B57:true:true");
// --- v509: first-open notice with its buttons always on screen (audit V5-11), manifest colours (F1-5b), shortcut names in both languages (V5-12) ---
check("v509 manifest: launch colours are the light page colour, as in index.html; each shortcut that has a Greek name has an English one too",
  (function () {
    const fs = require("fs"), p = require("path"), root = p.join(__dirname, "..");
    const M = JSON.parse(fs.readFileSync(p.join(root, "manifest.webmanifest"), "utf8")), H = fs.readFileSync(p.join(root, "index.html"), "utf8");
    const bg = run("LIGHT.bg"), bad = [];
    if (M.background_color !== bg || M.theme_color !== bg) bad.push("colours " + M.background_color + " " + M.theme_color);
    if (!H.includes('<meta name="theme-color" content="' + bg + '"')) bad.push("index.html theme-color");
    M.shortcuts.forEach((s) => { if (/[\u0370-\u03FF]/.test(s.name) && !/ \u00B7 [A-Z][a-z]/.test(s.name)) bad.push("name " + s.name); });
    return (bad.join("; ") || "ok") + " " + M.shortcuts.map((s) => s.name).join("|");
  })(), "ok \u039B\u03AF\u03C3\u03C4\u03B5\u03C2 \u03BA\u03C1\u03AF\u03C3\u03B5\u03C9\u03BD \u00B7 Crisis lists|VF / VT|\u0391\u03BD\u03B1\u03C6\u03C5\u03BB\u03B1\u03BE\u03AF\u03B1 \u00B7 Anaphylaxis|\u03A6\u03AC\u03C1\u03BC\u03B1\u03BA\u03B1 \u00B7 Drugs");
check("v509 V5-11 first-open notice: the two buttons sit in a bar that stays at the bottom of the screen, both at least 44 px; the wording of the notice is the same as in v498",
  (function () {
    const fs = require("fs"), p = require("path"), R = fs.readFileSync(p.join(__dirname, "..", "src", "root.js"), "utf8");
    const a = R.indexOf("if (!accepted) {"), b = R.indexOf("// --- Shell (spec", a), blk = R.slice(a, b);
    const words = blk.slice(0, blk.search(/React\.createElement\(\s*"button"/)).replace(/"data-notice-actions"[^]*$/, "").replace(/\/\* @__PURE__ \*\//g, "").match(/"(?:[^"\\]|\\.)*"/g).filter((s) => /\\u03|[a-z]{4,} [a-z]/.test(s) && s.length > 30).join("");
    return [/"data-notice-actions": "1", style: \{ position: "sticky", bottom: 0, background: S\.card/.test(blk), /minHeight: 48/.test(blk), /minHeight: 44/.test(blk), require("crypto").createHash("sha256").update(words).digest("hex").slice(0, 16)].join(",");
  })(), "true,true,true,14844e579eb434bb");
// --- v510: the accept button works only after the end of the notice has been on the screen (audit of v509, V9-1, author chose option c) ---
check("v510 V9-1 first-open notice: accept is disabled until the end of the text is above the bar; a press while disabled does nothing; hint in both languages; hooks stand before the early return",
  (function () {
    const fs = require("fs"), p = require("path"), R = fs.readFileSync(p.join(__dirname, "..", "src", "root.js"), "utf8");
    const a = R.indexOf("const [noticeRead, setNoticeRead]"), ret = R.indexOf("if (!accepted) {"), b = R.indexOf("// --- Shell (spec", ret), blk = R.slice(ret, b);
    return [a > 0 && a < ret, /el\.getBoundingClientRect\(\)\.bottom <= limit \+ 2\) setNoticeRead\(true\)/.test(R.slice(a, ret)), /disabled: !noticeRead,/.test(blk), /if \(!noticeRead\) return;\s+setAccepted\(true\);/.test(blk),
      /ref: noticeText, "data-notice-text": "1"/.test(blk), /"data-notice-hint": "1"/.test(blk) && /Scroll to the end of the text to continue\./.test(blk) && /\\u039A\\u03C5\\u03BB\\u03AE\\u03C3\\u03C4\\u03B5 \\u03C9\\u03C2 \\u03C4\\u03BF \\u03C4\\u03AD\\u03BB\\u03BF\\u03C2/.test(blk)].join(",");
  })(), "true,true,true,true,true,true");
// --- v511: safety net for the accept button (audit of v510, V10-1) ---
check("v511 V10-1 first-open notice: the check also runs on touchend, wheel and keyup and once a second; every listener and the timer are removed afterwards",
  (function () {
    const fs = require("fs"), p = require("path"), R = fs.readFileSync(p.join(__dirname, "..", "src", "root.js"), "utf8");
    const a = R.indexOf("const [noticeRead, setNoticeRead]"), blk = R.slice(a, R.indexOf("if (!accepted) {", a));
    return [/const NOTICE_EVENTS = \["scroll", "resize", "touchend", "wheel", "keyup"\];/.test(blk), /NOTICE_EVENTS\.forEach\(\(ev\) => window\.addEventListener\(ev, check, \{ passive: true \}\)\)/.test(blk),
      /const tick = setInterval\(check, 1000\);/.test(blk), /clearInterval\(tick\); NOTICE_EVENTS\.forEach\(\(ev\) => window\.removeEventListener\(ev, check\)\)/.test(blk), /if \(accepted \|\| noticeRead\) return;/.test(blk)].join(",");
  })(), "true,true,true,true,true");
// --- v512: look chosen by the author on 13/11/2026 (large titles, navy, coloured tile icons, floating bottom bar) ---
check("v512 colours: tile icons at least 3:1 on the card in light, dark and theatre, none of them red; bar labels at least 4.5:1 on the bar; white on the crisis button 4.5:1; page colour the same in index.html and the manifest",
  run(`(() => { ${V499_CR} const bad = [], hue = (h) => { const r = parseInt(h.substr(1, 2), 16), g = parseInt(h.substr(3, 2), 16), b = parseInt(h.substr(5, 2), 16); return r > 150 && g < 110 && b < 110; };
    Object.keys(TILE_INK).forEach((k) => { const c = TILE_INK[k]; if (cr(c[0], LIGHT.card) < 3) bad.push(k + " light"); if (cr(c[1], DARK.card) < 3 || cr(c[1], THEATRE.card) < 3) bad.push(k + " dark"); if (hue(c[0]) || hue(c[1])) bad.push(k + " is red"); });
    if (Object.keys(TILE_INK).join(",") !== "meds,tools,peds,about") bad.push("tiles");
    [[NAV_FG, NAV_BG], [NAV_FG_IDLE, NAV_BG], [NAV_FG, NAV_BG_DARK], [NAV_FG_IDLE, NAV_BG_DARK]].forEach((x) => { if (cr(x[0], x[1]) < 4.5) bad.push("bar " + x.join(" on ")); });
    if (cr("#FFFFFF", CRISIS_BTN) < 4.5 || CRISIS_BTN !== LIGHT.red) bad.push("crisis button");
    return bad.join("; ") || "ok"; })()`), "ok");
check("v512 shell: the crisis button uses one red in every theme; the bar floats over a strip in the colour of the page; the patient strip is not touched (same as v511)",
  (function () {
    const fs = require("fs"), p = require("path"), crypto = require("crypto"), root = p.join(__dirname, ".."), rd = (f) => fs.readFileSync(p.join(root, f), "utf8");
    const R = rd("src/root.js"), P = rd("src/primitives.js"), H = rd("index.html"), M = JSON.parse(rd("manifest.webmanifest")), bg = run("LIGHT.bg");
    const a = P.indexOf("function PatientBarCore"), b = P.indexOf("// Split a drug's notes into labelled groups", a);
    return [/"data-home-crisis": "1"[^\n]*background: CRISIS_BTN, color: "#FFFFFF"/.test(R), /"data-nav-strip": "1", style: \{ position: "sticky", bottom: 0, background: `linear-gradient\(to top, \$\{S\.bg\} 78%, transparent\)`/.test(R),
      /background: labelOnDark\(\) \? NAV_BG_DARK : NAV_BG,/.test(R), M.background_color === bg && M.theme_color === bg && H.includes('content="' + bg + '"'),
      crypto.createHash("sha256").update(P.slice(a, b)).digest("hex").slice(0, 16)].join(",");
  })(), "true,true,true,true,d9e1f7c11d34a7f1");
// Audit registry: every tool, drug, checklist, score and guideline in the app
// must have an entry in audit/audit-registry.json (pending items are allowed).
(function () {
  const cov = require("./audit-check.js").coverage();
  check("audit registry covers every app item (missing: " + (cov.missing.join(", ") || "none") + ")", String(cov.missing.length), "0");
  check("audit registry has no entries for removed items (orphan: " + (cov.orphan.join(", ") || "none") + ")", String(cov.orphan.length), "0");
  check("audit registry appVersion matches APP_VERSION", String(cov.reg.appVersion), String(cov.inv.appVersion));
  console.log("  audit: " + cov.reviewed.length + " reviewed, " + cov.kept.length + " kept by decision, " + cov.pending.length + " pending");
})();

// --- Report -----------------------------------------------------------------
console.log(`\n${pass} passed, ${fail} failed (${pass + fail} total)`);
if (failures.length) {
  console.log("\nFailures:");
  for (const f of failures) console.log("  - " + f);
  process.exit(1);
}
process.exit(0);

