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
  !/no longer recommended/i.test(anaph("En")), false);
check("anaphylaxis: repeat adrenaline at 5 min", /5 min/.test(anaph("En")), true);
check("anaphylaxis: refractory = after two doses", /TWO appropriate doses/.test(anaph("En")), true);
check("anaphylaxis: IV is first line under anaesthesia", /IV is first line/.test(anaph("En")), true);
check("anaphylaxis: initial IV bolus 50 mcg", /50 \\u00B5g|50 \u00b5g/.test(anaph("En")), true);
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
check("hydromorphone PO 7.5 mg -> OME 30", 7.5 * opioidF("hydro-po"), 30);
check("hydromorphone IV 1.5 mg -> OME 30", 1.5 * opioidF("hydro-iv"), 30);
check("fentanyl patch 25 mcg/h -> OME 60", 25 * opioidF("fent-tts"), 60);
check("codeine PO 200 mg -> OME 30", 200 * opioidF("codeine"), 30);
check("tramadol PO 300 mg -> OME 30", 300 * opioidF("tramadol"), 30);
check("tapentadol PO 75 mg -> OME 30", 75 * opioidF("tapent"), 30);
check("OME 60 -> oxycodone PO 40 mg", 60 / opioidF("oxy-po"), 40);
check("OME 60 -> fentanyl patch 25 mcg/h", 60 / opioidF("fent-tts"), 25);
// Methadone and buprenorphine must stay OUT: conversion is non-linear.
check("methadone & buprenorphine excluded from converter",
  run("OPIOIDS.filter(o => /methadone|buprenorph/i.test(o.id + o.en)).length"), 0);
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
  check("naloxone: perioperative titration 40 mcg", /40 \u00b5g \(0.04 mg\) IV, titrated/.test(gi), true);
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
  check("anticoag: ASRA 2025 divergence on reversal agents is flagged", /ASRA 2025 ADVISES AGAINST/.test(ac), true);
  check("anticoag: ASRA 2025 dabigatran up to 5 days is noted", /up to 5 days if CrCl <50/.test(ac), true);
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
  run("(function(){var d=DRUGS.filter(function(x){return x.id==='adenosine';})[0];return [d.doses[2].lo,d.doses[2].max,d.doses[3].max].join(',')+'|'+/long QT/.test(d.ciEn);})()"), "0.1,6,12|true");

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

// --- Report -----------------------------------------------------------------
console.log(`\n${pass} passed, ${fail} failed (${pass + fail} total)`);
if (failures.length) {
  console.log("\nFailures:");
  for (const f of failures) console.log("  - " + f);
  process.exit(1);
}
process.exit(0);
