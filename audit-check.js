// Audit coverage check for Morfeas.
// Compares audit/audit-registry.json with what the app actually contains
// (tools, drugs, checklists, scores, guidelines, peds tab) and writes a
// readable report to audit/AUDIT.md.
//   node tests/audit-check.js          -> report + AUDIT.md, exit 1 if coverage gaps
//   require('./audit-check').coverage() -> { missing, orphan, counts, pending, kept }
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");

function appInventory() {
  const ctx = { console, React: { createElement() {} }, window: {}, document: {}, navigator: {},
    localStorage: { getItem() {}, setItem() {} } };
  vm.createContext(ctx);
  for (const f of ["data", "formulas", "primitives", "tabs"]) vm.runInContext(read("src/" + f + ".js"), ctx);
  const g = (e) => vm.runInContext(e, ctx);
  const root = read("src/root.js");
  const a = root.indexOf("const TOOL_SECTIONS"), b = root.indexOf("];", a);
  const tools = [...root.slice(a, b).matchAll(/\{ id: "([^"]+)", group:/g)].map((m) => m[1]);
  return {
    tool: tools,
    drug: g("DRUGS.map(d => d.id)"),
    checklist: g("CHECKLISTS.map(c => c.id)"),
    score: g("SCORES.map(s => s.id).concat(MULTI_SCORES.map(s => s.id))"),
    guideline: g("GUIDELINES.map(x => x.id)"),
    tab: ["peds"],
    appVersion: g("APP_VERSION")
  };
}

function coverage() {
  const reg = JSON.parse(read("audit/audit-registry.json"));
  const inv = appInventory();
  const key = (t, id) => t + ":" + id;
  const regKeys = new Map(reg.items.map((i) => [key(i.type, i.id), i]));
  const appKeys = new Set();
  for (const t of ["tool", "drug", "checklist", "score", "guideline", "tab"]) for (const id of inv[t]) appKeys.add(key(t, id));
  const missing = [...appKeys].filter((k) => !regKeys.has(k));          // in app, not in registry
  const orphan = [...regKeys.keys()].filter((k) => !appKeys.has(k));    // in registry, not in app
  const by = (s) => reg.items.filter((i) => i.status === s);
  return { reg, inv, missing, orphan, pending: by("pending"), kept: by("reviewed-kept"),
    reviewed: by("reviewed"), excluded: by("excluded") };
}

function report(c) {
  const L = [];
  const lab = { tool: "Εργαλείο", drug: "Φάρμακο", checklist: "Checklist", score: "Κλίμακα", guideline: "Οδηγία", tab: "Καρτέλα" };
  const nm = (i) => `${lab[i.type] || i.type} · ${i.name || i.id}`;
  L.push(`# Μητρώο ελέγχου Morfeas — v${c.inv.appVersion}`, "");
  L.push(`Ενημέρωση μητρώου: ${c.reg.updated} · Σύνολο εγγραφών: ${c.reg.items.length}`, "");
  L.push(`- Ελέγχθηκαν με πηγές: **${c.reviewed.length}**`);
  L.push(`- Ελέγχθηκαν, μένουν ως έχουν με απόφασή σου: **${c.kept.length}**`);
  L.push(`- Δεν έχουν ελεγχθεί ακόμα: **${c.pending.length}**`);
  L.push(`- Εκτός ελέγχου: **${c.excluded.length}**`, "");
  if (c.missing.length) { L.push("## ⚠ Νέα στοιχεία της εφαρμογής χωρίς εγγραφή", ""); c.missing.forEach((k) => L.push("- " + k)); L.push(""); }
  if (c.orphan.length) { L.push("## ⚠ Εγγραφές που δεν υπάρχουν πια στην εφαρμογή", ""); c.orphan.forEach((k) => L.push("- " + k)); L.push(""); }
  L.push("## Δεν έχουν ελεγχθεί ακόμα", "");
  c.pending.forEach((i) => L.push(`- ${nm(i)}${i.note ? " — " + i.note : ""}`));
  L.push("", "## Ελέγχθηκαν, μένουν ως έχουν — σημεία χωρίς επιβεβαίωση", "");
  c.kept.forEach((i) => { L.push(`### ${nm(i)} (v${(i.versions || []).join(", v")})`); (i.unverified || []).forEach((u) => L.push("- " + u)); if (i.sources) L.push("", "Πηγές που διαβάστηκαν: " + i.sources.join(" · ")); L.push(""); });
  const other = c.reviewed.filter((i) => i.unverified && i.unverified.length);
  if (other.length) { L.push("## Ελέγχθηκαν — σημεία που στηρίζονται μόνο σε δευτερεύουσα πηγή", ""); other.forEach((i) => { L.push(`### ${nm(i)}`); i.unverified.forEach((u) => L.push("- " + u)); L.push(""); }); }
  L.push("## Ελέγχθηκαν με πηγές", "");
  for (const t of ["tool", "tab", "score", "checklist", "drug"]) {
    const xs = c.reviewed.filter((i) => i.type === t);
    if (xs.length) L.push(`**${lab[t]} (${xs.length}):** ` + xs.map((i) => `${i.name || i.id} (v${(i.versions || []).slice(-1)[0]})`).join(", "), "");
  }
  if (c.excluded.length) { L.push("## Εκτός ελέγχου", ""); c.excluded.forEach((i) => L.push(`- ${nm(i)} — ${i.note || ""}`)); }
  return L.join("\n") + "\n";
}

if (require.main === module) {
  const c = coverage();
  fs.writeFileSync(path.join(ROOT, "audit/AUDIT.md"), report(c));
  console.log(`Reviewed ${c.reviewed.length} · kept ${c.kept.length} · pending ${c.pending.length} · excluded ${c.excluded.length}`);
  if (c.pending.length) console.log("Pending: " + c.pending.map((i) => i.type + ":" + i.id).join(", "));
  if (c.missing.length) console.log("MISSING from registry: " + c.missing.join(", "));
  if (c.orphan.length) console.log("ORPHAN registry entries: " + c.orphan.join(", "));
  console.log("Report written to audit/AUDIT.md");
  process.exit(c.missing.length || c.orphan.length ? 1 : 0);
}
module.exports = { coverage, report };
