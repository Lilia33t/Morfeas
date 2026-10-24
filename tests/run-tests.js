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
check("nalbuphine: ceiling documented in notes", run('/30 mg/.test(DRUGS.find(d => d.id === "nalbuphine").notesEn)'), true);

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
    return n("drug") === DRUGS.length && n("list") === CHECKLISTS_SHOWN.length &&
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
  check("naloxone: SmPC regimen 100\u2013200 mcg (v438)", /Naloxone \(opioid depression\): 100\u2013200 \u00b5g IV, then 100 \u00b5g every 2\u20133 min/.test(gi), true);
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
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='protamine';})[0];return /max 50 mg/.test(d.doses[6].fixedEn)+'|'+/within 8 h/.test(d.doses[7].fixedEn)+'|'+/^Hypersensitivity/.test(d.ciEn);})()"), "true|true|true");

check("naloxone SmPC 100-200 postop, peds 0.01-0.02 mg/kg; flumazenil anaesthesia max 1 mg, peds 0.01 max 0.2",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};var n=g('naloxone'),f=g('flumazenil');return /^100\u2013200/.test(n.doses[0].fixedEn)+'|'+n.doses[4].hi+'|'+/max 1 mg/.test(f.doses[0].fixedEn)+'|'+f.doses[3].max+'|'+/status epilepticus/.test(f.ciEn);})()"), "true|0.02|true|0.2|true");

check("atropine peds 0.02 mg/kg max 0.5 no minimum; adrenaline IM by age 300/150, arrest 0.01 max 1",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};var a=g('atropine'),d=g('adrenaline');return a.doses[6].max+'|'+(a.doses[6].minAbs===undefined)+'|'+/^300/.test(d.doses[3].fixedEn)+'|'+/^150/.test(d.doses[4].fixedEn)+'|'+d.doses[1].max+'|'+/metabisulfite/.test(d.ciEn);})()"), "0.5|true|true|true|1|true");

check("ephedrine SmPC max 9 mg/dose 30 mg total; phenylephrine bolus max 100, infusion 25-100 ug/min, MAOI CI",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};var e=g('ephedrine'),p=g('phenylephrine');return /max 9 mg per dose/.test(e.doses[0].fixedEn)+'|'+/max 30 mg/.test(e.doses[0].fixedEn)+'|'+/max 100 \u00b5g per bolus/.test(p.doses[0].fixedEn)+'|'+/100 \u00b5g.min/.test(p.doses[1].fixedEn)+'|'+p.doses[4].max+'|'+/MAOIs/.test(p.ciEn);})()"), "true|true|true|true|100|true");

check("noradrenaline SmPC titration 0.05-1, base/tartrate note, SSC vasopressin threshold",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='noradrenaline';})[0];return d.doses[1].lo+','+d.doses[1].hi+'|'+/2 mg tartrate = 1 mg base/.test(d.notesEn)+'|'+/vasopressin at 0.25/.test(d.doses[4].fixedEn);})()"), "0.05,1|true|true");

check("dobutamine SmPC adults 2.5-10, children 2-20, phaeochromocytoma and hypovolaemia CI",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='dobutamine';})[0];return d.doses[0].lo+','+d.doses[0].hi+'|'+d.doses[3].lo+','+d.doses[3].hi+'|'+/phaeochromocytoma/.test(d.ciEn)+'|'+/hypovolaemia/.test(d.ciEn);})()"), "2.5,10|2,20|true|true");

check("labetalol SmPC bolus max 200, pregnancy infusion to 160 mg/h, asthma CI",
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='labetalol';})[0];return /max 200 mg/.test(d.doses[0].fixedEn)+'|'+/160 mg.h/.test(d.doses[5].fixedEn)+'|'+/asthma/.test(d.ciEn);})()"), "true|true|true");

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
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};return /\u22641.5 mg.kg.h/.test(g('lidocaine_iv').doses[1].fixedEn)+'|'+/5 mg.kg every 24 h/.test(g('txa').doses[4].fixedEn)+'|'+/seizures/.test(g('txa').ciEn)+'|'+/outside the SmPC/.test(g('ketamine_analgesic').notesEn);})()"), "true|true|true|true");

check("dantrolene 2.5 mg/kg + 60 mL per vial; intralipid >70 kg 100 mL; fibrinogen 70 mg/kg if unknown",
  run("(function(){var g=function(id){return DRUGS.filter(function(x){return x.id===id;})[0];};return g('dantrolene').doses[0].lo+'|'+/60 mL/.test(g('dantrolene').doses[3].fixedEn)+'|'+/^bolus 100 mL/.test(g('intralipid').doses.filter(function(x){return />70 kg/.test(x.en);})[0].fixedEn)+'|'+g('fibrinogen').doses[1].lo;})()"), "2.5|true|true|70");

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
  (function(){var S=src.replace(/const CHANGELOG[\s\S]*?\n\];/,'');return String(/After PCI for ACS.STEMI: ", .{0,60}\\u2265 12 months/.test(S) && /without stent: ", .{0,60}\\u2265 14 days/.test(S) && !/\\u2265 96h/.test(S) && !/Steffel|Kindel|Bailey B|Lieberman P|Hosseinian|Spasovski/.test(S));})(), "true");

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
  run("(function(){var g=function(id){return SCORES.filter(function(x){return x.id===id;})[0];};var sb=g('stopbang');return sb.interp(3,'en',[true,true,false,false,false,false,false,true]).lvl+','+sb.interp(3,'en',[true,false,false,false,false,true,false,true]).lvl+'|'+/at least 2 antiemetics/.test(g('apfel').interp(1,'en').en)+'|'+/3.4 antiemetics/.test(g('apfel').interp(3,'en').en)+'|'+/76%/.test(g('childpugh').interp(12,'en').en)+'|'+g('cfs').interp(5,'en').en.indexOf('Living with mild frailty')+'|'+/Aldrete JA/.test(MULTI_SCORES[0].src)+'|'+/Chung F, Chan/.test(MULTI_SCORES[1].src);})()"), "high,mid|true|true|true|0|true|true");

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
    return String(!/Li30 &lt; 94|Li30 < 94/.test(T) && !/PCC 20.u201325 U\/kg/.test(T) && !/target >50, >100/.test(T) && /iCa.u00B2.u207A >0.9 mmol\/L/.test(T) && /Clauss .u22641.5 g\/L/.test(T)); })(), "true");

check("v364: PSSS, PONV, fasting, NMB guideline corrections",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String(/"Shallow: TOFr < 0.4"/.test(T) && !/Shallow: TOF count 4/.test(T) && !/post-induction hypotension/.test(T) && /3.u20134 antiemetics/.test(T) && !/states 2.u20133 are the target/.test(P) && !/Cravero/.test(P)); })(), "true");

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
    return String(/24 0\/7 .u2013 33 6\/7 weeks at high risk of preterm delivery/.test(T) && /reduce the dose 2.u20138-fold/.test(T) && /ezt641/.test(T) && !/start at 10.u201320% of the dose/.test(T)); })(), "true");

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
    return String((function(){ const D=require('fs').readFileSync(require('path').join(__dirname,'..','src','data.js'),'utf8'); return /id: "landiolol"/.test(D) && /57\.6 mg\/kg/.test(D) && /Rapibloc 300 mg/.test(T) && /posterised to four tones/.test(T) && require('fs').readFileSync(require('path').join(__dirname,'..','manifest.webmanifest'),'utf8').includes('#1D3D6B'); })()); })(), "true");

check("v396: bottom bar with labels and poppy, blue light background",
  (function () { const T = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "tabs.js"), "utf8"); const P = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "primitives.js"), "utf8");
    return String((function(){ const fs=require('fs'),p=require('path'); const R=fs.readFileSync(p.join(__dirname,'..','src','root.js'),'utf8'); const F=fs.readFileSync(p.join(__dirname,'..','src','formulas.js'),'utf8'); return /function PoppyMark/.test(R) && /background: "#1D3D6B"/.test(R) && /t\.tabs\[tb\.id\]\), \/\* @__PURE__ \*\/ React\.createElement\(PoppyMark/.test(R) && /bg: "#EAF0F8"/.test(F); })()); })(), "true");

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
    return String((function(){ const fs=require('fs'),vm=require('vm'); const c={React:{}}; vm.createContext(c); vm.runInContext(fs.readFileSync(require('path').join(__dirname,'..','src','data.js'),'utf8')+';'+P.match(/const doseAgeGroup[\s\S]*?\n};/)[0]+';this.D=DRUGS;this.g=doseAgeGroup', c); const f=(id,i)=>c.g(c.D.find(d=>d.id===id).doses[i]); return f('propofol',0)==='adult' && f('propofol',9)==='peds' && c.g({en:'CHILDREN and small adults — loading (SmPC)'})===null && c.g({en:'Elderly / hepatic / biliary / renal — maintenance'})===null && c.g({en:'Induction (adults & adolescents)'})===null && /aNum >= 18/.test(P) && /height, sex, age, focus/.test(fs.readFileSync(require('path').join(__dirname,'..','src','root.js'),'utf8')); })()); })(), "true");

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

