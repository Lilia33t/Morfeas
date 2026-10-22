function PatientBar(props) {
  const w = parseFloat(props.weight) || 0, h = parseFloat(props.height) || 0, a = parseFloat(props.age) || 0;
  const el = props.lang === "el";
  const bad = [];
  if (w && (w < 0.3 || w > 300)) bad.push(el ? "\u03B2\u03AC\u03C1\u03BF\u03C2" : "weight");
  if (h && (h < 25 || h > 230)) bad.push(el ? "\u03CD\u03C8\u03BF\u03C2" : "height");
  if (a && a > 120) bad.push(el ? "\u03B7\u03BB\u03B9\u03BA\u03AF\u03B1" : "age");
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(PatientBarCore, props), bad.length ? /* @__PURE__ */ React.createElement("div", { role: "alert", style: { fontSize: 12, color: S.red, fontWeight: 700, padding: "4px 4px 0" } }, "\u26A0 ", el ? "\u0395\u03BB\u03AD\u03B3\u03BE\u03C4\u03B5: " : "Check: ", bad.join(", "), el ? " \u03B5\u03BA\u03C4\u03CC\u03C2 \u03BB\u03BF\u03B3\u03B9\u03BA\u03CE\u03BD \u03BF\u03C1\u03AF\u03C9\u03BD" : " outside plausible limits") : null);
}
function PatientBarCore({ lang, weight, setWeight, age, setAge, height, setHeight, sex, setSex }) {
  const t = T[lang];
  const fieldStyle = { ...inputStyle, background: S.cardAlt, border: `1.5px solid ${S.line}`, color: S.ink, padding: "8px 6px", fontSize: 14 };
  const [ageUnit, setAgeUnit] = useState("y");
  const ageDisplay = age === "" ? "" : ageUnit === "m" ? String(Math.round(parseFloat(age) * 12 * 100) / 100) : age;
  const onAgeChange = (val) => {
    if (val === "") {
      setAge("");
      return;
    }
    const num = parseFloat(val);
    if (isNaN(num)) {
      setAge(val);
      return;
    }
    setAge(ageUnit === "m" ? String(num / 12) : val);
  };
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, background: S.card, padding: "10px 12px", borderRadius: 16, boxShadow: "0 1px 3px rgba(80,64,48,0.06)", border: `1.5px solid ${S.line}` } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React.createElement("svg", { width: "24", height: "24", viewBox: "0 0 26 26", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("polyline", { points: "1,15 6,15 8,8 11,21 14,11 16,15 25,15", fill: "none", stroke: S.teal, strokeWidth: "2", strokeLinejoin: "round", strokeLinecap: "round" })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative", flex: 1.15, minWidth: 0 } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      inputMode: "decimal",
      value: weight,
      onChange: (e) => setWeight(e.target.value),
      placeholder: t.weight,
      "aria-label": t.weight,
      style: { ...fieldStyle, width: "100%", paddingRight: 25 }
    }
  ), /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true", style: { position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 9.5, fontWeight: 700, color: S.muted, pointerEvents: "none" } }, "kg")), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", flex: 1.1, minWidth: 0 } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      inputMode: "decimal",
      value: ageDisplay,
      onChange: (e) => onAgeChange(e.target.value),
      placeholder: ageUnit === "m" ? lang === "el" ? "\u0397\u03BB\u03B9\u03BA\u03AF\u03B1 (\u03BC)" : "Age (mo)" : t.age,
      "aria-label": t.age,
      style: { ...fieldStyle, width: "100%", paddingRight: 25 }
    }
  ), /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true", style: { position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 9.5, fontWeight: 700, color: S.muted, pointerEvents: "none" } }, ageUnit === "m" ? (lang === "el" ? "\u03BC\u03AE\u03BD." : "mo") : (lang === "el" ? "\u03AD\u03C4\u03B7" : "y"))), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", flex: 1.1, minWidth: 0 } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      inputMode: "decimal",
      value: height,
      onChange: (e) => setHeight(e.target.value),
      placeholder: t.height,
      "aria-label": t.height,
      style: { ...fieldStyle, width: "100%", paddingRight: 25 }
    }
  ), /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true", style: { position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 9.5, fontWeight: 700, color: S.muted, pointerEvents: "none" } }, "cm")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setSex(sex === "M" ? "F" : "M"),
      "aria-label": t.sex,
      style: {
        ...fieldStyle,
        flex: "0 0 40px",
        minWidth: 40,
        padding: "4px 6px",
        cursor: "pointer",
        fontWeight: 800,
        color: S.teal,
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        lineHeight: 1
      }
    },
    sex === "M" ? "\u2642" : "\u2640"
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, paddingLeft: 32 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5, color: S.muted, fontWeight: 600 } }, lang === "el" ? "\u039C\u03BF\u03BD\u03AC\u03B4\u03B1 \u03B7\u03BB\u03B9\u03BA\u03AF\u03B1\u03C2:" : "Age unit:"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", background: S.tintNeutral, borderRadius: 8, padding: 2 } }, [["y", lang === "el" ? "\u0388\u03C4\u03B7" : "Years"], ["m", lang === "el" ? "\u039C\u03AE\u03BD\u03B5\u03C2" : "Months"]].map(([u, lbl]) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: u,
      onClick: () => setAgeUnit(u),
      style: {
        border: "none",
        borderRadius: 6,
        padding: "4px 14px",
        fontSize: 12.5,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "inherit",
        background: ageUnit === u ? S.teal : "transparent",
        color: ageUnit === u ? S.card : S.muted
      }
    },
    lbl
  )))));
}
// Split a drug's notes into labelled groups at display time. The stored text is unchanged; only its
// sentences are grouped (original order kept inside each group). Nothing is added or removed.
const NOTE_ABBR = /(?:^|[\s(])(?:\u03C0\.\u03C7|\u03BA\.\u03AC|\u03BA\.\u03BB\u03C0|\u03BA\.\u03BF\.\u03BA|e\.g|i\.e|vs|approx|ca|cf|resp|no|fig|ref|Dr|St|\u0392\u03BB|\u03B2\u03BB|\u03B1\u03BD\u03B1\u03B8|rev|\u03AD\u03BA\u03B4|ed|vol|\u03C3\u03B5\u03BB|pp?)$/i;
function splitSentences(text) {
  const out = []; let start = 0, depth = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(" || ch === "[") depth++;
    else if ((ch === ")" || ch === "]") && depth > 0) depth--;
    else if ((ch === "." || ch === "!" || ch === "?") && depth === 0) {
      const after = text.slice(i + 1);
      const m = /^\s+(?=[\u00AB"(\[]?[A-Z\u0391-\u03A9\u0386\u0388\u0389\u038A\u038C\u038E\u038F>\u2265\u2264<0-9])/.exec(after);
      if (!m) continue;
      const before = text.slice(start, i);
      if (NOTE_ABBR.test(before)) continue;
      if (/^\s+\d/.test(after) && /(?:^|\s)[A-Za-z\u0391-\u03A9\u03B1-\u03C9\u03AC-\u03CE]{1,5}$/.test(before)) continue;
      out.push(text.slice(start, i + 1).trim()); start = i + 1 + m[0].length; i = start - 1;
    }
  }
  const rest = text.slice(start).trim(); if (rest) out.push(rest);
  return out;
}
const NOTE_TITLES = { gen: { el: "\u0393\u03B5\u03BD\u03B9\u03BA\u03AC", en: "General" }, pop: { el: "\u0395\u03B9\u03B4\u03B9\u03BA\u03BF\u03AF \u03C0\u03BB\u03B7\u03B8\u03C5\u03C3\u03BC\u03BF\u03AF", en: "Special populations" }, int: { el: "\u0391\u03BB\u03BB\u03B7\u03BB\u03B5\u03C0\u03B9\u03B4\u03C1\u03AC\u03C3\u03B5\u03B9\u03C2", en: "Interactions" }, od: { el: "\u03A5\u03C0\u03B5\u03C1\u03B4\u03BF\u03C3\u03BF\u03BB\u03BF\u03B3\u03AF\u03B1", en: "Overdose" }, src: { el: "\u03A0\u03B7\u03B3\u03AE", en: "Source" } };
const NOTE_GROUPS = [
  { k: "src", el: "\u03A0\u03B7\u03B3\u03AE", en: "Source", re: /^(\u03A0\u03B7\u03B3(\u03AE|\u03AD\u03C2)|Sources?)(?=[\s:])/ },
  { k: "od", el: "\u03A5\u03C0\u03B5\u03C1\u03B4\u03BF\u03C3\u03BF\u03BB\u03BF\u03B3\u03AF\u03B1", en: "Overdose", re: /^(\u03A5\u03C0\u03B5\u03C1\u03B4\u03BF\u03C3\u03BF\u03BB\u03BF\u03B3|\u0391\u03BD\u03C4\u03AF\u03B4\u03BF\u03C4\u03BF|Overdos|Antidote)/i },
  { k: "int", el: "\u0391\u03BB\u03BB\u03B7\u03BB\u03B5\u03C0\u03B9\u03B4\u03C1\u03AC\u03C3\u03B5\u03B9\u03C2", en: "Interactions", re: /^(\u0391\u03BB\u03BB\u03B7\u03BB\u03B5\u03C0\u03B9\u03B4\u03C1|Interact)/i },
  { k: "pop", el: "\u0395\u03B9\u03B4\u03B9\u03BA\u03BF\u03AF \u03C0\u03BB\u03B7\u03B8\u03C5\u03C3\u03BC\u03BF\u03AF", en: "Special populations", re: /^(\u039A\u03CD\u03B7\u03C3\u03B7|\u0395\u03B3\u03BA\u03C5\u03BC\u03BF\u03C3|\u0398\u03B7\u03BB\u03B1\u03C3\u03BC|\u03A0\u03B1\u03B9\u03B4\u03B9\u03AC|\u03A0\u03B1\u03B9\u03B4\u03B9|\u039D\u03B5\u03BF\u03B3\u03BD|\u0392\u03C1\u03AD\u03C6|\u0397\u03BB\u03B9\u03BA\u03B9\u03C9\u03BC\u03AD\u03BD|(\u039D\u03B5\u03C6\u03C1\u03B9\u03BA|\u0397\u03C0\u03B1\u03C4\u03B9\u03BA)(\u03AE|\u03AD\u03C2)(\s+(\u03B1\u03BD\u03B5\u03C0\u03AC\u03C1\u03BA\u03B5\u03B9\u03B1|\u03B4\u03C5\u03C3\u03BB\u03B5\u03B9\u03C4\u03BF\u03C5\u03C1\u03B3\u03AF\u03B1|\u03BD\u03CC\u03C3\u03BF\u03C2|\u03BD\u03CC\u03C3\u03BF|\u03AE\s)|\s*[:(\/,])|\u03A0\u03B1\u03C7\u03C5\u03C3\u03B1\u03C1\u03BA|[<>\u2265\u2264]\s?\d+\s?(\u03B5\u03C4\u03CE\u03BD|\u03AD\u03C4\u03B7)|Pregnan|Breast|Lactat|Child|Paediatric|Pediatric|Neonat|Infant|Elderly|Older|(Renal|Hepatic)(\s+(impairment|failure|dysfunction|disease|insufficiency|or\s)|\s*[:(\/,])|Obes|[<>\u2265\u2264]\s?\d+\s?(y|years))/i }
];
function noteSections(text) {
  if (!text) return null;
  const groups = { gen: [], pop: [], int: [], od: [], src: [] };
  for (const s of splitSentences(text)) { const g = NOTE_GROUPS.find((x) => x.re.test(s)); groups[g ? g.k : "gen"].push(s); }
  const order = ["gen", "pop", "int", "od", "src"];
  const used = order.filter((k) => groups[k].length);
  if (used.length < 2) return null;
  const strip = /^(\u0391\u03BB\u03BB\u03B7\u03BB\u03B5\u03C0\u03B9\u03B4\u03C1\u03AC\u03C3\u03B5\u03B9\u03C2|Interactions|\u03A5\u03C0\u03B5\u03C1\u03B4\u03BF\u03C3\u03BF\u03BB\u03BF\u03B3\u03AF\u03B1|Overdose|\u03A0\u03B7\u03B3\u03AE|\u03A0\u03B7\u03B3\u03AD\u03C2|Sources?)\s*:\s*/;
  return used.map((k) => ({ k, text: groups[k].join(" ").replace(k === "gen" || k === "pop" ? /^$/ : strip, "") }));
}

// Bold the dose figures (number + unit) inside free-text dose lines so they stand out at a glance.
const EMPH_RE = /((?:[≥≤<>~]\s?)?\d+(?:[.,]\d+)?(?:\s?[–-]\s?\d+(?:[.,]\d+)?)?\s?(?:µg\/kg\/min|mcg\/kg\/min|µg\/kg\/h|mcg\/kg\/h|mg\/kg\/(?:ημέρα|day|h)|µg\/kg|mcg\/kg|mg\/kg|IU\/kg|U\/kg|mL\/kg|mg\/mL|µg\/mL|mL\/h|mg\/h|mg\/min|µg\/min|mmol|mg|µg|mcg|mL|IU|g\b|min\b|h\b|s\b|%|cmH₂O))/g;
function emphNums(text) {
  if (typeof text !== "string") return text;
  const parts = text.split(EMPH_RE);
  if (parts.length === 1) return text;
  // A figure glued to a word (e.g. "G5%") is part of a name, not a dose: leave it plain.
  return parts.map((p, i) => i % 2 === 1 && !/[A-Za-z\u0370-\u03FF]$/.test(parts[i - 1]) ? React.createElement("b", { key: i, style: { fontWeight: 800, color: S.teal, whiteSpace: "nowrap" } }, p) : p);
}
// Age group of a calculated dose row, read from its English label: rows naming only children/neonates/infants are
// paediatric, rows naming only adults (or exactly "Elderly") are adult; anything else (unlabelled, or both) applies to all ages.
const doseAgeGroup = (ds) => {
  const t = ds.en || "";
  const p = /\b(children|neonates?|newborns?|infants?)\b/i.test(t), a = /\badults?\b/i.test(t) || /^elderly$/i.test(t.trim());
  if (p && !a) return "peds";
  if (a && !p && !/adolescent/i.test(t)) return "adult";
  return null;
};
function MedsTab({ lang, weight, height, sex, age, focus }) {
  const t = T[lang];
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState(null);
  // A global-search pick lands here: clear any local filter so the chosen
  // drug is definitely visible, then open it.
  useEffect(() => {
    if (!focus) return;
    setQ("");
    setCat("all");
    setOpen(focus.id);
  }, [focus]);
  // An item opened deep in a long list looks like nothing happened, so
  // bring it into view. Guarded: scrollIntoView options are not universal
  // and the node may not be mounted on the same tick as the state change.
  const focusRef = useRef(null);
  useEffect(() => {
    if (!focus || !focusRef.current) return;
    const el = focusRef.current;
    const t = setTimeout(() => {
      try { el.scrollIntoView({ block: "start", behavior: "smooth" }); }
      catch (e) { try { el.scrollIntoView(); } catch (e2) {} }
    }, 60);
    return () => clearTimeout(t);
  }, [focus, open]);
  const w = parseFloat(weight) || 0;
  const hNum = parseFloat(height) || 0;
  // Doses marked basis:"ibw" are calculated on the source's ideal body weight, never on actual weight.
  const wIbw = w > 0 ? ibwLidoConsensus(hNum, sex) || 0 : 0;
  const aNum = parseFloat(age) || 0;
  // With an age entered, a row for the other age group keeps its text but shows no calculated value.
  const offAge = (ds) => { const g = doseAgeGroup(ds); return aNum > 0 && (g === "peds" && aNum >= 18 || g === "adult" && aNum < 18) ? g : null; };
  const wFor = (ds) => offAge(ds) ? 0 : ds.basis === "ibw" ? wIbw : w;
  const ql = q.toLowerCase();
  const list = DRUGS.filter(
    (d) => (cat === "all" || d.cat === cat) && (d.name.toLowerCase().includes(ql) || (d.synEl || "").toLowerCase().includes(ql))
  );
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" } }, CATS.map((c) => /* @__PURE__ */ React.createElement("button", { key: c.id, onClick: () => setCat(c.id), style: {
    padding: "6px 12px",
    borderRadius: 99,
    border: "none",
    whiteSpace: "nowrap",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    background: cat === c.id ? S.teal : S.card,
    color: cat === c.id ? S.card : S.muted,
    boxShadow: cat === c.id ? "none" : `inset 0 0 0 1.5px ${S.line}`
  } }, c[lang]))), !w && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: S.amber, fontWeight: 600, padding: "2px 4px" } }, "\u2696 ", t.weightNeeded), list.map((d) => {
    const isOpen = open === d.id;
    return /* @__PURE__ */ React.createElement("div", { key: d.id, ref: focus && focus.id === d.id ? focusRef : null, style: { background: S.card, borderRadius: 14, border: `1.5px solid ${isOpen ? S.teal : S.line}`, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setOpen(isOpen ? null : d.id), style: {
      width: "100%",
      padding: "13px 14px",
      background: "none",
      border: "none",
      cursor: "pointer",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontFamily: "inherit"
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700, fontSize: 15.5, color: S.ink } }, d.name), /* @__PURE__ */ React.createElement("span", { style: { color: S.muted, fontWeight: 600, fontSize: 18, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .15s" } }, "\u203A")), isOpen && /* @__PURE__ */ React.createElement("div", { style: { padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 10 } }, d.doses.filter((ds) => !isPendingErc(ds)).map((ds, i) => {
      const wd = wFor(ds);
      const dt = doseText(ds, wd, lang);
      const isStr = typeof dt === "string";
      const og = w > 0 && !ds.fixed ? offAge(ds) : null;
      const ageNote = og ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: S.muted, fontWeight: 600 } }, og === "peds" ? (lang === "el" ? "\u0394\u03B5\u03BD \u03C5\u03C0\u03BF\u03BB\u03BF\u03B3\u03AF\u03B6\u03B5\u03C4\u03B1\u03B9 \u2014 \u03B3\u03C1\u03B1\u03BC\u03BC\u03AE \u03B3\u03B9\u03B1 \u03C0\u03B1\u03B9\u03B4\u03B9\u03AC, \u03B1\u03C3\u03B8\u03B5\u03BD\u03AE\u03C2 \u226518 \u03B5\u03C4\u03CE\u03BD" : "Not calculated \u2014 paediatric row, patient \u226518 years") : (lang === "el" ? "\u0394\u03B5\u03BD \u03C5\u03C0\u03BF\u03BB\u03BF\u03B3\u03AF\u03B6\u03B5\u03C4\u03B1\u03B9 \u2014 \u03B3\u03C1\u03B1\u03BC\u03BC\u03AE \u03B3\u03B9\u03B1 \u03B5\u03BD\u03AE\u03BB\u03B9\u03BA\u03B5\u03C2, \u03B1\u03C3\u03B8\u03B5\u03BD\u03AE\u03C2 <18 \u03B5\u03C4\u03CE\u03BD" : "Not calculated \u2014 adult row, patient <18 years")) : null;
      const ibwNote = !og && ds.basis === "ibw" && w > 0 ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: wd ? S.muted : S.amber, fontWeight: 700 } }, wd ? (lang === "el" ? "\u03A5\u03C0\u03BF\u03BB\u03BF\u03B3\u03B9\u03C3\u03BC\u03CC\u03C2 \u03C3\u03B5 \u03B9\u03B4\u03B1\u03BD\u03B9\u03BA\u03CC \u03B2\u03AC\u03C1\u03BF\u03C2 %s kg (consensus: \u03CD\u03C8\u03BF\u03C2 \u2212 100 \u2642 / \u2212 105 \u2640)" : "Calculated on ideal body weight %s kg (consensus: height \u2212 100 \u2642 / \u2212 105 \u2640)").replace("%s", fmt(wd)) + (wd > w ? (lang === "el" ? " \u00B7 \u03C4\u03BF \u03C0\u03C1\u03B1\u03B3\u03BC\u03B1\u03C4\u03B9\u03BA\u03CC \u03B2\u03AC\u03C1\u03BF\u03C2 \u03B5\u03AF\u03BD\u03B1\u03B9 \u03BC\u03B9\u03BA\u03C1\u03CC\u03C4\u03B5\u03C1\u03BF" : " \u00B7 actual weight is lower") : "") : (lang === "el" ? "\u03A3\u03C5\u03BC\u03C0\u03BB\u03B7\u03C1\u03CE\u03C3\u03C4\u03B5 \u03CD\u03C8\u03BF\u03C2 \u03B3\u03B9\u03B1 \u03C5\u03C0\u03BF\u03BB\u03BF\u03B3\u03B9\u03C3\u03BC\u03CC \u03C3\u03B5 \u03B9\u03B4\u03B1\u03BD\u03B9\u03BA\u03CC \u03B2\u03AC\u03C1\u03BF\u03C2" : "Enter height to calculate on ideal body weight")) : null;
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { background: S.bg, borderRadius: 10, padding: "9px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: S.muted, fontWeight: 600, letterSpacing: 0.4 } }, upGr(ds[lang])), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 4 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14.5, color: S.ink } }, isStr ? emphNums(dt) : dt.base), !isStr && wd > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 800, fontSize: 16.5, color: dt.capped ? S.amber : S.teal, fontVariantNumeric: "tabular-nums" } }, "= ", dt.calc, dt.capped ? ` (${t.maxLabel})` : "")), ageNote, ibwNote, ds.max && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: S.muted, fontWeight: 600 } }, t.maxLabel, ": ", ds.max, " ", ds.unit.replace("/kg", "")));
    }), (() => {
      const ns = noteSections(lang === "el" ? d.notesEl : d.notesEn);
      if (!ns) return /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: S.ink, lineHeight: 1.45 } }, /* @__PURE__ */ React.createElement("strong", { style: { color: S.teal } }, t.notes, ": "), lang === "el" ? d.notesEl : d.notesEn);
      return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, color: S.teal, fontSize: 13.5, marginBottom: 6 } }, t.notes), ns.map((g) => /* @__PURE__ */ React.createElement("div", { key: g.k, style: { background: S.bg, borderRadius: 10, padding: "8px 12px", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, fontWeight: 800, color: S.teal, letterSpacing: 0.4, marginBottom: 2 } }, upGr(NOTE_TITLES[g.k][lang])), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: S.ink, lineHeight: 1.45 } }, g.text))));
    })(), (lang === "el" ? d.ciEl : d.ciEn) !== "\u2014" && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: S.red, lineHeight: 1.45 } }, /* @__PURE__ */ React.createElement("strong", null, t.ci, ": "), lang === "el" ? d.ciEl : d.ciEn), w > 0 && d.doses.some((ds) => typeof doseText(ds, w, lang) !== "string") && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: S.amber, fontWeight: 600, lineHeight: 1.4 } }, lang === "el" ? "\u26A0 \u03A5\u03C0\u03BF\u03BB\u03BF\u03B3\u03B9\u03C3\u03BC\u03AD\u03BD\u03B5\u03C2 \u03C4\u03B9\u03BC\u03AD\u03C2 \u03C3\u03C4\u03BF \u03C0\u03C1\u03B1\u03B3\u03BC\u03B1\u03C4\u03B9\u03BA\u03CC \u03B2\u03AC\u03C1\u03BF\u03C2 \u03C4\u03B7\u03C2 \u03B3\u03C1\u03B1\u03BC\u03BC\u03AE\u03C2 \u03B1\u03C3\u03B8\u03B5\u03BD\u03BF\u03CD\u03C2, \u03B5\u03BA\u03C4\u03CC\u03C2 \u03B1\u03BD \u03B1\u03BD\u03B1\u03B3\u03C1\u03AC\u03C6\u03B5\u03C4\u03B1\u03B9 \u03AC\u03BB\u03BB\u03BF \u2014 \u03B5\u03C0\u03B1\u03BB\u03B7\u03B8\u03B5\u03CD\u03C3\u03C4\u03B5 \u03C0\u03C1\u03B9\u03BD \u03C4\u03B7 \u03C7\u03BF\u03C1\u03AE\u03B3\u03B7\u03C3\u03B7." : "\u26A0 Calculated on the actual weight in the patient bar unless stated otherwise \u2014 verify before administration.")));
  }));
}
// Crisis mode: one checklist full-screen, large text, high contrast, running timer and event marks,
// screen kept awake where the browser allows it. Steps share the tick state of the Lists tab.
function CrisisMode({ c, lang, done, toggle, onClose }) {
  const el = lang === "el";
  const steps = el ? c.stepsEl : c.stepsEn;
  const [t0] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [marks, setMarks] = useState([]);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    let lock = null;
    try { if (navigator.wakeLock && navigator.wakeLock.request) navigator.wakeLock.request("screen").then((l) => { lock = l; }).catch(() => {}); } catch (e) {}
    return () => { clearInterval(id); try { lock && lock.release(); } catch (e) {} };
  }, []);
  const mmss = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); };
  const nDone = steps.filter((_, i) => done[c.id + ":" + i]).length;
  const next = steps.findIndex((_, i) => !done[c.id + ":" + i]);
  const lastMark = marks.length ? marks[marks.length - 1] : null;
  const BG = "#0E1B30", CARD = "#17294A", INK = "#FFFFFF", MUTED = "#B9C8DC";
  const btn = { border: "none", borderRadius: 12, fontFamily: "inherit", fontWeight: 800, cursor: "pointer" };
  return React.createElement("div", { role: "dialog", "aria-modal": "true", "aria-label": el ? c.titleEl : c.titleEn, style: { position: "fixed", inset: 0, zIndex: 10000, background: BG, color: INK, display: "flex", flexDirection: "column", fontFamily: "'Morfeas Sans', -apple-system, system-ui, sans-serif" } },
    React.createElement("div", { style: { padding: "calc(12px + env(safe-area-inset-top, 0px)) 16px 10px", borderBottom: "4px solid " + c.color } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
        React.createElement("span", { style: { width: 14, height: 14, borderRadius: 99, background: c.color, flexShrink: 0 } }),
        React.createElement("div", { style: { flex: 1, fontSize: 19, fontWeight: 800, lineHeight: 1.2 } }, el ? c.titleEl : c.titleEn),
        React.createElement("button", { onClick: onClose, "aria-label": el ? "\u039A\u03BB\u03B5\u03AF\u03C3\u03B9\u03BC\u03BF" : "Close", style: { ...btn, background: CARD, color: INK, fontSize: 20, width: 44, height: 44 } }, "\u2715")),
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginTop: 10 } },
        React.createElement("div", { style: { fontSize: 40, fontWeight: 800, fontVariantNumeric: "tabular-nums", letterSpacing: 1, lineHeight: 1 } }, mmss(now - t0)),
        React.createElement("div", { style: { flex: 1, fontSize: 12.5, color: MUTED, fontWeight: 600, lineHeight: 1.35 } }, lastMark ? (el ? "\u0391\u03C0\u03CC \u03C4\u03B7 \u03C3\u03AE\u03BC\u03B1\u03BD\u03C3\u03B7 " : "Since mark ") + marks.length + ": " : (el ? "\u03A7\u03C1\u03CC\u03BD\u03BF\u03C2 \u03B1\u03C0\u03CC \u03C4\u03B7\u03BD \u03AD\u03BD\u03B1\u03C1\u03BE\u03B7" : "Time since start"), lastMark && React.createElement("b", { style: { color: INK, fontSize: 18, fontVariantNumeric: "tabular-nums" } }, mmss(now - lastMark))),
        React.createElement("button", { onClick: () => setMarks((m) => [...m, Date.now()]), style: { ...btn, background: c.color, color: "#FFFFFF", fontSize: 14, padding: "12px 14px" } }, el ? "\u23F1 \u03A3\u03AE\u03BC\u03B1\u03BD\u03C3\u03B7" : "\u23F1 Mark")),
      React.createElement("div", { style: { height: 6, borderRadius: 99, background: CARD, marginTop: 10, overflow: "hidden" } }, React.createElement("div", { style: { width: (100 * nDone / steps.length) + "%", height: "100%", background: c.color } }))),
    React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "12px 12px 8px", display: "flex", flexDirection: "column", gap: 8 } },
      steps.map((s, i) => {
        const checked = !!done[c.id + ":" + i];
        const isNext = i === next;
        return React.createElement("button", { key: i, onClick: () => toggle(c.id, i), style: { ...btn, display: "flex", alignItems: "flex-start", gap: 12, textAlign: "left", padding: "14px 14px", background: isNext ? "#22406E" : CARD, boxShadow: isNext ? "inset 0 0 0 2px " + c.color : "none", color: checked ? MUTED : INK, fontWeight: 600 } },
          React.createElement("span", { style: { width: 30, height: 30, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: checked ? c.color : "transparent", boxShadow: checked ? "none" : "inset 0 0 0 2px " + MUTED, fontSize: checked ? 18 : 14, fontWeight: 900, color: checked ? "#FFFFFF" : MUTED } }, checked ? "\u2713" : i + 1),
          React.createElement("span", { style: { fontSize: 18, lineHeight: 1.4, flex: 1, textDecoration: checked ? "line-through" : "none" } }, s));
      })),
    React.createElement("div", { style: { padding: "8px 16px calc(10px + env(safe-area-inset-bottom, 0px))", fontSize: 11, color: MUTED, fontWeight: 600, lineHeight: 1.4 } }, nDone + "/" + steps.length + (el ? " \u03B2\u03AE\u03BC\u03B1\u03C4\u03B1" : " steps") + (c.srcEl ? " \u00B7 " + (el ? "\u03A0\u03B7\u03B3\u03AE: " + c.srcEl : "Source: " + c.srcEn) : "")));
}
function ChecklistTab({ lang, focus }) {
  const [crisis, setCrisis] = useState(null);
  const [open, setOpen] = useState(null);
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [done, setDone] = useState({});
  useEffect(() => {
    if (!focus) return;
    setQ("");
    setCat("all");
    setOpen(focus.id);
  }, [focus]);
  // An item opened deep in a long list looks like nothing happened, so
  // bring it into view. Guarded: scrollIntoView options are not universal
  // and the node may not be mounted on the same tick as the state change.
  const focusRef = useRef(null);
  useEffect(() => {
    if (!focus || !focusRef.current) return;
    const el = focusRef.current;
    const t = setTimeout(() => {
      try { el.scrollIntoView({ block: "start", behavior: "smooth" }); }
      catch (e) { try { el.scrollIntoView(); } catch (e2) {} }
    }, 60);
    return () => clearTimeout(t);
  }, [focus, open]);
  const t = T[lang];
  const toggleStep = (id, i) => {
    const k = `${id}:${i}`;
    setDone((d) => ({ ...d, [k]: !d[k] }));
  };
  const resetList = (id, n) => {
    setDone((d) => {
      const nd = { ...d };
      for (let i = 0; i < n; i++) delete nd[`${id}:${i}`];
      return nd;
    });
  };
  const countDone = (id, n) => {
    let c = 0;
    for (let i = 0; i < n; i++) if (done[`${id}:${i}`]) c++;
    return c;
  };
  const list = CHECKLISTS_SHOWN.filter((c) => {
    const title = (lang === "el" ? c.titleEl : c.titleEn).toLowerCase();
    return (cat === "all" || c.cat === cat) && title.includes(q.toLowerCase());
  });
  const crisisC = crisis ? CHECKLISTS.find((x) => x.id === crisis) : null;
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, crisisC && /* @__PURE__ */ React.createElement(CrisisMode, { c: crisisC, lang, done, toggle: toggleStep, onClose: () => setCrisis(null) }), /* @__PURE__ */ React.createElement(
    "input",
    {
      value: q,
      onChange: (e) => setQ(e.target.value),
      placeholder: lang === "el" ? "\u0391\u03BD\u03B1\u03B6\u03AE\u03C4\u03B7\u03C3\u03B7 \u03BA\u03B1\u03C4\u03AC\u03C3\u03C4\u03B1\u03C3\u03B7\u03C2\u2026" : "Search emergency\u2026",
      style: inputStyle
    }
  ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" } }, CL_CATS.map((c) => /* @__PURE__ */ React.createElement("button", { key: c.id, ref: focus && focus.id === c.id ? focusRef : null, onClick: () => setCat(c.id), style: {
    padding: "6px 12px",
    borderRadius: 99,
    border: "none",
    whiteSpace: "nowrap",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    background: cat === c.id ? S.teal : S.card,
    color: cat === c.id ? S.card : S.muted,
    boxShadow: cat === c.id ? "none" : `inset 0 0 0 1.5px ${S.line}`
  } }, c[lang]))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: S.muted, fontWeight: 600, padding: "0 2px", lineHeight: 1.4 } }, lang === "el" ? "\u0392\u03AC\u03C3\u03B5\u03B9 Stanford Emergency Manual, DAS 2025 (\u03B1\u03B5\u03C1\u03B1\u03B3\u03C9\u03B3\u03CC\u03C2), DAS/BAETS/ENT-UK (SCOOP), AHA-ACLS, ASRA LAST, MHAUS & ESAIC." : "Based on Stanford Emergency Manual, DAS 2025 (airway), DAS/BAETS/ENT-UK (SCOOP), AHA-ACLS, ASRA LAST, MHAUS & ESAIC."), list.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { color: S.muted, fontWeight: 600, fontSize: 14, textAlign: "center", padding: 20 } }, lang === "el" ? "\u0394\u03B5\u03BD \u03B2\u03C1\u03AD\u03B8\u03B7\u03BA\u03B5 \u03BA\u03B1\u03C4\u03AC\u03C3\u03C4\u03B1\u03C3\u03B7." : "No emergency found."), list.map((c) => {
    const isOpen = open === c.id;
    const steps = lang === "el" ? c.stepsEl : c.stepsEn;
    const nDone = countDone(c.id, steps.length);
    const complete = nDone === steps.length;
    return /* @__PURE__ */ React.createElement("div", { key: c.id, style: { background: S.card, borderRadius: 14, border: `1.5px solid ${isOpen ? c.color : S.line}`, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setOpen(isOpen ? null : c.id), style: {
      width: "100%",
      padding: "14px",
      background: "none",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontFamily: "inherit",
      textAlign: "left"
    } }, /* @__PURE__ */ React.createElement("span", { style: { width: 10, height: 10, borderRadius: 99, background: c.color, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700, fontSize: 15.5, color: S.ink, flex: 1 } }, lang === "el" ? c.titleEl : c.titleEn), nDone > 0 && /* @__PURE__ */ React.createElement("span", { style: {
      fontSize: 12,
      fontWeight: 800,
      fontVariantNumeric: "tabular-nums",
      color: complete ? S.card : S.teal,
      background: complete ? S.teal : S.lineStrong,
      borderRadius: 99,
      padding: "3px 9px"
    } }, nDone, "/", steps.length), /* @__PURE__ */ React.createElement("span", { style: { color: S.muted, fontWeight: 600, fontSize: 18, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .15s" } }, "\u203A")), isOpen && /* @__PURE__ */ React.createElement("div", { style: { padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 6 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setCrisis(c.id), style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 14px", marginBottom: 4, borderRadius: 12, border: "none", background: c.color, color: "#FFFFFF", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" } }, "\u26F6 ", lang === "el" ? "\u039B\u03B5\u03B9\u03C4\u03BF\u03C5\u03C1\u03B3\u03AF\u03B1 \u03BA\u03C1\u03AF\u03C3\u03B7\u03C2 \u2014 \u03C0\u03BB\u03AE\u03C1\u03B7\u03C2 \u03BF\u03B8\u03CC\u03BD\u03B7" : "Crisis mode — full screen"), steps.map((s, i) => {
      const checked = !!done[`${c.id}:${i}`];
      return /* @__PURE__ */ React.createElement("button", { key: i, onClick: () => toggleStep(c.id, i), style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        textAlign: "left",
        background: checked ? S.tintSelected : S.bg,
        border: "none",
        cursor: "pointer",
        borderRadius: 10,
        padding: "10px 12px",
        fontFamily: "inherit"
      } }, /* @__PURE__ */ React.createElement("span", { style: {
        width: 22,
        height: 22,
        borderRadius: 7,
        flexShrink: 0,
        marginTop: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: checked ? S.teal : S.card,
        boxShadow: checked ? "none" : `inset 0 0 0 2px ${S.line}`,
        color: S.onAccent,
        fontSize: 14,
        fontWeight: 900
      } }, checked ? "\u2713" : ""), /* @__PURE__ */ React.createElement("span", { style: {
        fontSize: 14.5,
        lineHeight: 1.45,
        flex: 1,
        color: checked ? S.muted : S.ink,
        textDecoration: checked ? "line-through" : "none"
      } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 800, color: checked ? S.muted : c.color, marginRight: 6 } }, i + 1, "."), s));
    }), /* @__PURE__ */ React.createElement("button", { onClick: () => resetList(c.id, steps.length), style: {
      alignSelf: "flex-end",
      marginTop: 4,
      padding: "7px 16px",
      borderRadius: 9,
      border: `1.5px solid ${S.line}`,
      background: S.card,
      color: S.muted,
      fontWeight: 700,
      fontSize: 13,
      cursor: "pointer",
      fontFamily: "inherit"
    } }, "\u21BA ", lang === "el" ? "\u0395\u03C0\u03B1\u03BD\u03B1\u03C6\u03BF\u03C1\u03AC" : "Reset"), c.srcEl && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, color: S.muted, fontWeight: 600, lineHeight: 1.45, marginTop: 4, paddingTop: 6, borderTop: "1px solid " + S.line } }, (lang === "el" ? "\u03A0\u03B7\u03B3\u03AE: " : "Source: ") + (lang === "el" ? c.srcEl : c.srcEn))));
  }));
}
function TCITab({ lang, weight, age, height, sex }) {
  const t = T[lang];
  const [drug, setDrug] = useState("Propofol");
  const [openModel, setOpenModel] = useState(null);
  const c = {
    w: parseFloat(weight) || 0,
    h: parseFloat(height) || 0,
    a: parseFloat(age) || 0,
    s: sex
  };
  const bmi = bmiCalc(c.w, c.h);
  const lbm = c.w && c.h ? lbmJames(c.w, c.h, c.s) : null;
  const ffm = c.w && c.h ? ffmJan(c.w, c.h, c.s) : null;
  const ibw = c.h ? ibwDevine(c.h, c.s) : null;
  const adjBW = c.w && c.h ? abw(c.w, c.h, c.s) : null;
  const models = TCI_MODELS.filter((m) => m.drug === drug);
  const v1Of = (m) => m.v1Fn ? m.v1Fn(c) : m.v1Fixed != null ? m.v1Fixed : m.v1k != null && c.w ? m.v1k * c.w : null;
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 18, color: S.ink } }, t.tciTitle), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: S.muted, fontWeight: 600, marginTop: 2 } }, t.tciDisc)), (bmi || lbm) && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, bmi && /* @__PURE__ */ React.createElement(Chip, { label: "BMI", val: `${fmt(bmi)} kg/m\xB2` }), lbm && lbm > 0 && /* @__PURE__ */ React.createElement(Chip, { label: "LBM (James)", val: `${fmt(lbm)} kg` }), ffm && /* @__PURE__ */ React.createElement(Chip, { label: "FFM (Jan.)", val: `${fmt(ffm)} kg` }), ibw && /* @__PURE__ */ React.createElement(Chip, { label: "IBW (Devine)", val: `${fmt(ibw)} kg` }), adjBW && /* @__PURE__ */ React.createElement(Chip, { label: "ABW", val: `${fmt(adjBW)} kg` })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" } }, TCI_DRUGS.map((dr) => /* @__PURE__ */ React.createElement("button", { key: dr, onClick: () => {
    setDrug(dr);
    setOpenModel(null);
  }, style: {
    padding: "7px 13px",
    borderRadius: 99,
    border: "none",
    whiteSpace: "nowrap",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    background: drug === dr ? S.teal : S.card,
    color: drug === dr ? S.card : S.muted,
    boxShadow: drug === dr ? "none" : `inset 0 0 0 1.5px ${S.line}`
  } }, dr))), models.map((m) => {
    const isOpen = openModel === m.id;
    const missing = m.requires.filter((r) => !c[r] || r === "w" && c.w <= 0);
    const ready = missing.length === 0;
    const valid = ready && m.valid(c);
    const v1 = ready ? v1Of(m) : null;
    const edge = !ready ? S.line : !valid ? S.amber : S.teal;
    return /* @__PURE__ */ React.createElement("div", { key: m.id, style: { background: S.card, borderRadius: 14, border: `1.5px solid ${isOpen ? edge : S.line}`, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setOpenModel(isOpen ? null : m.id), style: {
      width: "100%",
      padding: "13px 14px",
      background: "none",
      border: "none",
      cursor: "pointer",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontFamily: "inherit",
      textAlign: "left"
    } }, /* @__PURE__ */ React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700, fontSize: 15.5, color: S.ink } }, m.name), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: S.muted, fontWeight: 600 } }, m.targetType)), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 8 } }, !ready && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: S.amber } }, "\u26A0"), ready && !valid && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: S.amber } }, "!"), valid && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: S.teal } }, "\u25CF"), /* @__PURE__ */ React.createElement("span", { style: { color: S.muted, fontWeight: 600, fontSize: 18, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .15s" } }, "\u203A"))), isOpen && /* @__PURE__ */ React.createElement("div", { style: { padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 10 } }, !ready && /* @__PURE__ */ React.createElement("div", { style: { background: S.tintNeutral, borderRadius: 10, padding: "9px 12px", fontSize: 13, color: S.amber, fontWeight: 600 } }, t.needCov, " ", missing.map((r) => covLabel[r][lang]).join(", ")), /* @__PURE__ */ React.createElement("div", { style: { background: S.bg, borderRadius: 10, padding: "9px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: S.muted, fontWeight: 700, letterSpacing: 0.4, marginBottom: 3 } }, upGr(t.targetsHead)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: S.ink, lineHeight: 1.5 } }, lang === "el" ? m.targetsEl : m.targetsEn)), ready && v1 > 0 && !m.noBolus && /* @__PURE__ */ React.createElement("div", { style: { background: S.bg, borderRadius: 10, padding: "9px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: S.muted, fontWeight: 700, letterSpacing: 0.4 } }, upGr(t.bolusEst)), /* @__PURE__ */ React.createElement(BolusRows, { drug, v1, lang }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: S.muted, fontWeight: 600, marginTop: 4 } }, "V1 \u2248 ", fmt(v1), " L \xB7 ", lang === "el" ? "\u03C0\u03BF\u03C3\u03CC\u03C4\u03B7\u03C4\u03B1 = \u03C3\u03C4\u03CC\u03C7\u03BF\u03C2 \xD7 V1 (\u03BF \u03B1\u03BB\u03B3\u03CC\u03C1\u03B9\u03B8\u03BC\u03BF\u03C2 TCI \u03C4\u03BF \u03B1\u03BD\u03B1\u03BB\u03B1\u03BC\u03B2\u03AC\u03BD\u03B5\u03B9)" : "amount = target \xD7 V1 (your TCI pump handles this)")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: S.ink, lineHeight: 1.45 } }, /* @__PURE__ */ React.createElement("strong", { style: { color: S.teal } }, lang === "el" ? "\u03A0\u03B5\u03B4\u03AF\u03BF" : "Range", ": "), lang === "el" ? m.rangeEl : m.rangeEn), ready && !valid && (m.warnEl || m.warnEn) && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: S.amber, lineHeight: 1.45, fontWeight: 600 } }, "\u26A0 ", lang === "el" ? m.warnEl || "\u0395\u03BA\u03C4\u03CC\u03C2 \u03B5\u03CD\u03C1\u03BF\u03C5\u03C2 \u03B5\u03C0\u03B9\u03BA\u03CD\u03C1\u03C9\u03C3\u03B7\u03C2" : m.warnEn || "Outside validation range"), ready && !valid && !(m.warnEl || m.warnEn) && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: S.amber, lineHeight: 1.45, fontWeight: 600 } }, "\u26A0 ", lang === "el" ? "\u0391\u03C3\u03B8\u03B5\u03BD\u03AE\u03C2 \u03B5\u03BA\u03C4\u03CC\u03C2 \u03B5\u03CD\u03C1\u03BF\u03C5\u03C2 \u03B5\u03C0\u03B9\u03BA\u03CD\u03C1\u03C9\u03C3\u03B7\u03C2 \u03C4\u03BF\u03C5 \u03BC\u03BF\u03BD\u03C4\u03AD\u03BB\u03BF\u03C5." : "Patient outside the model's validation range.")));
  }), React.createElement("div", { style: { fontSize: 10.5, color: S.muted, fontWeight: 600, lineHeight: 1.45, paddingTop: 6, borderTop: "1px solid " + S.line } }, lang === "el" ? "\u03A0\u03B7\u03B3\u03AD\u03C2 \u03BC\u03BF\u03BD\u03C4\u03AD\u03BB\u03C9\u03BD: Marsh, Br J Anaesth 1991 \u00B7 Schnider, Anesthesiology 1998 \u00B7 Eleveld, Br J Anaesth 2018 (\u03C0\u03C1\u03BF\u03C0\u03BF\u03C6\u03CC\u03BB\u03B7) \u00B7 Kataria, Anesthesiology 1994 \u00B7 Absalom & Kenny, Br J Anaesth 2005 (Paedfusor) \u00B7 Minto, Anesthesiology 1997 \u00B7 Eleveld, Anesthesiology 2017 (\u03C1\u03B5\u03BC\u03B9\u03C6\u03B5\u03BD\u03C4\u03B1\u03BD\u03AF\u03BB\u03B7) \u00B7 Gepts, Anesthesiology 1995 \u00B7 Maitre, Anesthesiology 1987 \u00B7 Hannivoort, Anesthesiology 2015. \u03A4\u03BF V1 \u03B5\u03AF\u03BD\u03B1\u03B9 \u03B5\u03BA\u03C4\u03AF\u03BC\u03B7\u03C3\u03B7 \u03C4\u03BF\u03C5 \u03BC\u03BF\u03BD\u03C4\u03AD\u03BB\u03BF\u03C5 \u03B3\u03B9\u03B1 \u03C0\u03C1\u03BF\u03C3\u03B1\u03BD\u03B1\u03C4\u03BF\u03BB\u03B9\u03C3\u03BC\u03CC \u2014 \u03C4\u03B1 \u03C0\u03C1\u03B1\u03B3\u03BC\u03B1\u03C4\u03B9\u03BA\u03AC \u03C1\u03C5\u03B8\u03BC\u03CC \u03BA\u03B1\u03B9 \u03C0\u03BF\u03C3\u03CC\u03C4\u03B7\u03C4\u03B1 \u03C4\u03B1 \u03C5\u03C0\u03BF\u03BB\u03BF\u03B3\u03AF\u03B6\u03B5\u03B9 \u03B7 \u03B1\u03BD\u03C4\u03BB\u03AF\u03B1. \u039F\u03B9 \u03C5\u03BB\u03BF\u03C0\u03BF\u03B9\u03AE\u03C3\u03B5\u03B9\u03C2 \u03B4\u03B9\u03B1\u03C6\u03AD\u03C1\u03BF\u03C5\u03BD \u03BC\u03B5\u03C4\u03B1\u03BE\u03CD \u03BA\u03B1\u03C4\u03B1\u03C3\u03BA\u03B5\u03C5\u03B1\u03C3\u03C4\u03CE\u03BD (\u03C0.\u03C7. ke0, \u03B1\u03C1\u03C4\u03B7\u03C1\u03B9\u03B1\u03BA\u03CC/\u03C6\u03BB\u03B5\u03B2\u03B9\u03BA\u03CC \u03B1\u03AF\u03BC\u03B1)." : "Model sources: Marsh, Br J Anaesth 1991 \u00B7 Schnider, Anesthesiology 1998 \u00B7 Eleveld, Br J Anaesth 2018 (propofol) \u00B7 Kataria, Anesthesiology 1994 \u00B7 Absalom & Kenny, Br J Anaesth 2005 (Paedfusor) \u00B7 Minto, Anesthesiology 1997 \u00B7 Eleveld, Anesthesiology 2017 (remifentanil) \u00B7 Gepts, Anesthesiology 1995 \u00B7 Maitre, Anesthesiology 1987 \u00B7 Hannivoort, Anesthesiology 2015. V1 is the model estimate, for orientation only \u2014 the pump calculates the actual rates and amounts. Implementations differ between manufacturers (e.g. ke0, arterial vs venous)."));
}
function Chip({ label, val }) {
  return /* @__PURE__ */ React.createElement("div", { style: { background: S.card, borderRadius: 10, padding: "6px 11px", boxShadow: `inset 0 0 0 1.5px ${S.line}` } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: S.muted, fontWeight: 600 } }, label, " "), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5, color: S.ink, fontWeight: 800, fontVariantNumeric: "tabular-nums" } }, val));
}
function BolusRows({ drug, v1, lang }) {
  const sets = {
    Propofol: { unit: "\xB5g/mL", massUnit: "mg", div: 1e3, pts: [{ el: "\u0395\u03B9\u03C3\u03B1\u03B3\u03C9\u03B3\u03AE", en: "Induction", c: 4 }, { el: "\u03A3\u03C5\u03BD\u03C4\u03AE\u03C1\u03B7\u03C3\u03B7", en: "Maint.", c: 3 }] },
    Remifentanil: { unit: "ng/mL", massUnit: "\xB5g", div: 1e3, pts: [{ el: "\u0394\u03B9\u03B1\u03C3\u03C9\u03BB\u03AE\u03BD\u03C9\u03C3\u03B7", en: "Intubation", c: 6 }, { el: "\u03A3\u03C5\u03BD\u03C4\u03AE\u03C1\u03B7\u03C3\u03B7", en: "Maint.", c: 4 }] }
  };
  const s = sets[drug];
  if (!s) return null;
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 3, marginTop: 4 } }, s.pts.map((p, i) => {
    const massPerMl = p.c;
    const totalRawMass = massPerMl * v1 * 1e3;
    const display = drug === "Propofol" ? totalRawMass / 1e3 : totalRawMass / 1e3;
    return /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", justifyContent: "space-between", fontSize: 13.5 } }, /* @__PURE__ */ React.createElement("span", { style: { color: S.ink } }, p[lang === "el" ? "el" : "en"], " ", /* @__PURE__ */ React.createElement("span", { style: { color: S.muted, fontWeight: 600 } }, "(", p.c, " ", s.unit, ")")), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 800, color: S.teal, fontVariantNumeric: "tabular-nums" } }, "\u2248 ", fmt(display), " ", s.massUnit));
  }));
}
const MULTI_SCORES = [
  {
    id: "aldrete",
    src: "Aldrete JA. The post-anesthesia recovery score revisited. J Clin Anesth 1995;7:89\u201391 \u2014 \u22659: \u03AD\u03BE\u03BF\u03B4\u03BF\u03C2 \u03B1\u03C0\u03CC \u03C4\u03B7 \u03C6\u03AC\u03C3\u03B7 \u0399.",
    name: "Aldrete",
    items: [
      { el: "\u039A\u03B9\u03BD\u03B7\u03C4\u03B9\u03BA\u03CC\u03C4\u03B7\u03C4\u03B1", en: "Activity", opts: [
        { v: 2, el: "\u039A\u03B9\u03BD\u03B5\u03AF 4 \u03AC\u03BA\u03C1\u03B1", en: "Moves 4 limbs" },
        { v: 1, el: "\u039A\u03B9\u03BD\u03B5\u03AF 2 \u03AC\u03BA\u03C1\u03B1", en: "Moves 2 limbs" },
        { v: 0, el: "\u039A\u03B1\u03BC\u03AF\u03B1 \u03BA\u03AF\u03BD\u03B7\u03C3\u03B7", en: "No movement" }
      ] },
      { el: "\u0391\u03BD\u03B1\u03C0\u03BD\u03BF\u03AE", en: "Respiration", opts: [
        { v: 2, el: "\u0392\u03B1\u03B8\u03B9\u03AC \u03B1\u03BD\u03B1\u03C0\u03BD\u03BF\u03AE/\u03B2\u03AE\u03C7\u03B1\u03C2", en: "Deep breath/cough" },
        { v: 1, el: "\u0394\u03CD\u03C3\u03C0\u03BD\u03BF\u03B9\u03B1/\u03B5\u03C0\u03B9\u03C0\u03CC\u03BB\u03B1\u03B9\u03B7", en: "Dyspnea/shallow" },
        { v: 0, el: "\u0386\u03C0\u03BD\u03BF\u03B9\u03B1", en: "Apnea" }
      ] },
      { el: "\u039A\u03C5\u03BA\u03BB\u03BF\u03C6\u03BF\u03C1\u03AF\u03B1 (\u0391\u03A0 vs \u03C0\u03C1\u03BF\u03B5\u03B3\u03C7.)", en: "Circulation (BP vs preop)", opts: [
        { v: 2, el: "\xB120%", en: "\xB120%" },
        { v: 1, el: "\xB120\u201350%", en: "\xB120\u201350%" },
        { v: 0, el: ">\xB150%", en: ">\xB150%" }
      ] },
      { el: "\u03A3\u03C5\u03BD\u03B5\u03AF\u03B4\u03B7\u03C3\u03B7", en: "Consciousness", opts: [
        { v: 2, el: "\u03A0\u03BB\u03AE\u03C1\u03C9\u03C2 \u03BE\u03CD\u03C0\u03BD\u03B9\u03BF\u03C2", en: "Fully awake" },
        { v: 1, el: "\u0391\u03C6\u03C5\u03C0\u03BD\u03AF\u03C3\u03B9\u03BC\u03BF\u03C2 \u03C3\u03C4\u03B7 \u03C6\u03C9\u03BD\u03AE", en: "Arousable to voice" },
        { v: 0, el: "\u0394\u03B5\u03BD \u03B1\u03C0\u03B1\u03BD\u03C4\u03AC", en: "Unresponsive" }
      ] },
      { el: "SpO2", en: "SpO2", opts: [
        { v: 2, el: ">92% \u03C3\u03B5 \u03B1\u03AD\u03C1\u03B1", en: ">92% on air" },
        { v: 1, el: "\u03A7\u03C1\u03B5\u03B9\u03AC\u03B6\u03B5\u03C4\u03B1\u03B9 O2 \u03B3\u03B9\u03B1 >90%", en: "Needs O2 for >90%" },
        { v: 0, el: "<90% \u03BC\u03B5 O2", en: "<90% with O2" }
      ] }
    ],
    interp: (n) => ({
      lvl: n >= 9 ? "low" : "mid",
      el: n >= 9 ? "\u22659: \u039A\u03C1\u03B9\u03C4\u03AE\u03C1\u03B9\u03B1 \u03B5\u03BE\u03CC\u03B4\u03BF\u03C5 \u03B1\u03C0\u03CC \u03B1\u03BD\u03AC\u03BD\u03B7\u03C8\u03B7 (\u03C6\u03AC\u03C3\u03B7 \u0399)" : "<9: \u03A3\u03C5\u03BD\u03AD\u03C7\u03B9\u03C3\u03B7 \u03C0\u03B1\u03C1\u03B1\u03BA\u03BF\u03BB\u03BF\u03CD\u03B8\u03B7\u03C3\u03B7\u03C2 \u03C3\u03C4\u03B7\u03BD \u03B1\u03BD\u03AC\u03BD\u03B7\u03C8\u03B7",
      en: n >= 9 ? "\u22659: PACU phase-I discharge criteria met" : "<9: Continue PACU monitoring"
    })
  },
  {
    id: "padss",
    src: "Chung F, Chan VWS, Ong D. A post-anesthetic discharge scoring system for home readiness after ambulatory surgery. J Clin Anesth 1995;7:500\u20136 \u2014 \u22659 \u03B3\u03B9\u03B1 \u03AD\u03BE\u03BF\u03B4\u03BF\u00B7 \u03BF\u03C1\u03B9\u03C3\u03BC\u03BF\u03AF \u03BA\u03B1\u03C4\u03AC StatPearls (Modified Aldrete/PADSS).",
    name: "PADSS",
    items: [
      { el: "\u0396\u03C9\u03C4\u03B9\u03BA\u03AC \u03C3\u03B7\u03BC\u03B5\u03AF\u03B1 (vs \u03C0\u03C1\u03BF\u03B5\u03B3\u03C7.)", en: "Vital signs (vs preop)", opts: [
        { v: 2, el: "\xB120%", en: "\xB120%" },
        { v: 1, el: "\xB120\u201340%", en: "\xB120\u201340%" },
        { v: 0, el: ">\xB140%", en: ">\xB140%" }
      ] },
      { el: "\u0392\u03AC\u03B4\u03B9\u03C3\u03B7", en: "Ambulation", opts: [
        { v: 2, el: "\u03A3\u03C4\u03B1\u03B8\u03B5\u03C1\u03CC \u03B2\u03AC\u03B4\u03B9\u03C3\u03BC\u03B1, \u03C7\u03C9\u03C1\u03AF\u03C2 \u03B6\u03AC\u03BB\u03B7", en: "Steady gait, no dizziness" },
        { v: 1, el: "\u03A7\u03C1\u03B5\u03B9\u03AC\u03B6\u03B5\u03C4\u03B1\u03B9 \u03B2\u03BF\u03AE\u03B8\u03B5\u03B9\u03B1", en: "Requires assistance" },
        { v: 0, el: "\u0391\u03B4\u03C5\u03BD\u03B1\u03BC\u03AF\u03B1 \u03B2\u03AC\u03B4\u03B9\u03C3\u03B7\u03C2", en: "Unable to ambulate" }
      ] },
      { el: "\u039D\u03B1\u03C5\u03C4\u03AF\u03B1/\u0388\u03BC\u03B5\u03C4\u03BF\u03C2", en: "Nausea/Vomiting", opts: [
        { v: 2, el: "\u0395\u03BB\u03AC\u03C7\u03B9\u03C3\u03C4\u03B7 \u2014 \u03C7\u03C9\u03C1\u03AF\u03C2 \u03B8\u03B5\u03C1\u03B1\u03C0\u03B5\u03AF\u03B1", en: "Minimal \u2014 no treatment needed" },
        { v: 1, el: "\u039C\u03AD\u03C4\u03C1\u03B9\u03B1 \u2014 \u03B1\u03C0\u03BF\u03C4\u03B5\u03BB\u03B5\u03C3\u03BC\u03B1\u03C4\u03B9\u03BA\u03AE \u03B8\u03B5\u03C1\u03B1\u03C0\u03B5\u03AF\u03B1", en: "Moderate \u2014 treatment effective" },
        { v: 0, el: "\u03A3\u03BF\u03B2\u03B1\u03C1\u03AE \u2014 \u03BC\u03B7 \u03B1\u03C0\u03BF\u03C4\u03B5\u03BB\u03B5\u03C3\u03BC\u03B1\u03C4\u03B9\u03BA\u03AE \u03B8\u03B5\u03C1\u03B1\u03C0\u03B5\u03AF\u03B1", en: "Severe \u2014 treatment not effective" }
      ] },
      { el: "\u03A0\u03CC\u03BD\u03BF\u03C2", en: "Pain", opts: [
        { v: 2, el: "VAS 0\u20133", en: "VAS 0\u20133" },
        { v: 1, el: "VAS 4\u20136", en: "VAS 4\u20136" },
        { v: 0, el: "VAS 7\u201310", en: "VAS 7\u201310" }
      ] },
      { el: "\u03A7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE \u03B1\u03B9\u03BC\u03BF\u03C1\u03C1\u03B1\u03B3\u03AF\u03B1", en: "Surgical bleeding", opts: [
        { v: 2, el: "\u0395\u03BB\u03AC\u03C7\u03B9\u03C3\u03C4\u03B7 \u2014 \u03C7\u03C9\u03C1\u03AF\u03C2 \u03B1\u03BB\u03BB\u03B1\u03B3\u03AE \u03B5\u03C0\u03AF\u03B4\u03B5\u03C3\u03B7\u03C2", en: "Minimal \u2014 no dressing change" },
        { v: 1, el: "\u039C\u03AD\u03C4\u03C1\u03B9\u03B1 \u2014 \u03AD\u03C9\u03C2 2 \u03B1\u03BB\u03BB\u03B1\u03B3\u03AD\u03C2, \u03C7\u03C9\u03C1\u03AF\u03C2 \u03AC\u03BB\u03BB\u03B7 \u03B1\u03B9\u03BC\u03BF\u03C1\u03C1\u03B1\u03B3\u03AF\u03B1", en: "Moderate \u2014 up to 2 changes, no further bleeding" },
        { v: 0, el: "\u03A3\u03BF\u03B2\u03B1\u03C1\u03AE \u2014 >3 \u03B1\u03BB\u03BB\u03B1\u03B3\u03AD\u03C2, \u03C3\u03C5\u03BD\u03B5\u03C7\u03AF\u03B6\u03B5\u03B9", en: "Severe \u2014 >3 changes, continues to bleed" }
      ] }
    ],
    interp: (n) => ({
      lvl: n >= 9 ? "low" : "mid",
      el: n >= 9 ? "\u22659: \u039A\u03B1\u03C4\u03AC\u03BB\u03BB\u03B7\u03BB\u03BF\u03C2 \u03B3\u03B9\u03B1 \u03AD\u03BE\u03BF\u03B4\u03BF \u03C3\u03C4\u03BF \u03C3\u03C0\u03AF\u03C4\u03B9 (\u03BC\u03B5 \u03C3\u03C5\u03BD\u03BF\u03B4\u03CC)" : "<9: \u0394\u03B5\u03BD \u03C0\u03BB\u03B7\u03C1\u03BF\u03AF \u03BA\u03C1\u03B9\u03C4\u03AE\u03C1\u03B9\u03B1 \u03B5\u03BE\u03CC\u03B4\u03BF\u03C5",
      en: n >= 9 ? "\u22659: Fit for home discharge (with escort)" : "<9: Discharge criteria not met"
    })
  }
];
const ANTICOAG = [
  { name: "\u0391\u03C3\u03C0\u03B9\u03C1\u03AF\u03BD\u03B7 \u03C7\u03B1\u03BC\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7 (<200 mg)", nameEn: "Aspirin low dose (<200 mg)", stopEl: "\u03A7\u03C9\u03C1\u03AF\u03C2 \u03C0\u03B5\u03C1\u03B9\u03BF\u03C1\u03B9\u03C3\u03BC\u03CC", stopEn: "No restriction", restartEl: "\u03A3\u03C4\u03BF\u03BD \u03C3\u03C5\u03BD\u03AE\u03B8\u03B7 \u03B5\u03C0\u03CC\u03BC\u03B5\u03BD\u03BF \u03C7\u03C1\u03CC\u03BD\u03BF", restartEn: "At the routinely prescribed next time point", noteEl: "\u0394\u03B5\u03BD \u03B1\u03C0\u03BF\u03C4\u03B5\u03BB\u03B5\u03AF \u03B1\u03BD\u03C4\u03AD\u03BD\u03B4\u03B5\u03B9\u03BE\u03B7 (1C). \u03A0\u03C1\u03BF\u03C4\u03B9\u03BC\u03AC\u03C4\u03B1\u03B9 \u03B5\u03C6\u03AC\u03C0\u03B1\u03BE \u03C1\u03B1\u03C7\u03B9\u03B1\u03AF\u03B1 \u03B1\u03BD\u03C4\u03AF \u03B3\u03B9\u03B1 \u03B5\u03C0\u03B9\u03C3\u03BA\u03BB\u03B7\u03C1\u03AF\u03B4\u03B9\u03BF (1C). \u03A7\u03C9\u03C1\u03AF\u03C2 \u03B5\u03C1\u03B3\u03B1\u03C3\u03C4\u03B7\u03C1\u03B9\u03B1\u03BA\u03CC \u03AD\u03BB\u03B5\u03B3\u03C7\u03BF.", noteEn: "Not a contraindication (1C). Single-shot spinal preferred over epidural (1C). No testing." },
  { name: "\u0391\u03C3\u03C0\u03B9\u03C1\u03AF\u03BD\u03B7 \u03C5\u03C8\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7 (\u2265200 mg)", nameEn: "Aspirin high dose (\u2265200 mg)", stopEl: "3 \u03B7\u03BC\u03AD\u03C1\u03B5\u03C2 (\u03BC\u03B5 \u03C6\u03C5\u03C3\u03B9\u03BF\u03BB\u03BF\u03B3\u03B9\u03BA\u03AC \u03B1\u03B9\u03BC\u03BF\u03C0\u03B5\u03C4\u03AC\u03BB\u03B9\u03B1) \u03AD\u03C9\u03C2 7 \u03B7\u03BC\u03AD\u03C1\u03B5\u03C2", stopEn: "3 days (with normal platelet count) to 7 days", restartEl: "\u22656 h", restartEn: "\u22656 h", noteEl: "1C. \u0395\u03BE\u03B5\u03C4\u03AC\u03C3\u03C4\u03B5 \u03B4\u03BF\u03BA\u03B9\u03BC\u03B1\u03C3\u03AF\u03B5\u03C2 \u03BB\u03B5\u03B9\u03C4\u03BF\u03C5\u03C1\u03B3\u03AF\u03B1\u03C2 \u03B1\u03B9\u03BC\u03BF\u03C0\u03B5\u03C4\u03B1\u03BB\u03AF\u03C9\u03BD.", noteEn: "1C. Consider platelet function tests." },
  { name: "\u039A\u03BB\u03BF\u03C0\u03B9\u03B4\u03BF\u03B3\u03C1\u03AD\u03BB\u03B7", nameEn: "Clopidogrel", stopEl: "5\u20137 \u03B7\u03BC\u03AD\u03C1\u03B5\u03C2", stopEn: "5\u20137 days", restartEl: "75 mg: \u03C7\u03C9\u03C1\u03AF\u03C2 \u03BA\u03B1\u03B8\u03C5\u03C3\u03C4\u03AD\u03C1\u03B7\u03C3\u03B7 \u00B7 300 mg: 2 \u03B7\u03BC\u03AD\u03C1\u03B5\u03C2", restartEn: "75 mg: without delay \u00B7 300 mg: 2 days", noteEl: "1C. \u039C\u03B5 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1 in situ, \u03B7 \u03B5\u03C0\u03CC\u03BC\u03B5\u03BD\u03B7 \u03B4\u03CC\u03C3\u03B7 \u03BC\u03CC\u03BD\u03BF \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7\u03BD \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03AE \u03C4\u03BF\u03C5.", noteEn: "1C. With a catheter in situ, the next dose only after removal." },
  { name: "\u03A0\u03C1\u03B1\u03C3\u03BF\u03C5\u03B3\u03C1\u03AD\u03BB\u03B7", nameEn: "Prasugrel", stopEl: "7 \u03B7\u03BC\u03AD\u03C1\u03B5\u03C2", stopEn: "7 days", restartEl: "\u226524 h", restartEn: "\u226524 h", noteEl: "1C. \u039C\u03B5 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1 in situ, \u03B7 \u03B5\u03C0\u03CC\u03BC\u03B5\u03BD\u03B7 \u03B4\u03CC\u03C3\u03B7 \u03BC\u03CC\u03BD\u03BF \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7\u03BD \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03AE \u03C4\u03BF\u03C5.", noteEn: "1C. With a catheter in situ, the next dose only after removal." },
  { name: "\u03A4\u03B9\u03BA\u03B1\u03B3\u03BA\u03C1\u03B5\u03BB\u03CC\u03C1\u03B7", nameEn: "Ticagrelor", stopEl: "5 \u03B7\u03BC\u03AD\u03C1\u03B5\u03C2", stopEn: "5 days", restartEl: "\u226524 h", restartEn: "\u226524 h", noteEl: "1C. \u039C\u03B5 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1 in situ, \u03B7 \u03B5\u03C0\u03CC\u03BC\u03B5\u03BD\u03B7 \u03B4\u03CC\u03C3\u03B7 \u03BC\u03CC\u03BD\u03BF \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7\u03BD \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03AE \u03C4\u03BF\u03C5.", noteEn: "1C. With a catheter in situ, the next dose only after removal." },
  { name: "\u0391\u03BD\u03C4\u03B1\u03B3\u03C9\u03BD\u03B9\u03C3\u03C4\u03AD\u03C2 \u03B2\u03B9\u03C4. \u039A (VKA)", nameEn: "Vitamin K antagonists (VKA)", stopEl: "\u039C\u03AD\u03C7\u03C1\u03B9 \u03C6\u03C5\u03C3\u03B9\u03BF\u03BB\u03BF\u03B3\u03B9\u03BA\u03CC INR \u00B7 \u03B1\u03C3\u03B5\u03BD\u03BF\u03BA\u03BF\u03C5\u03BC\u03B1\u03C1\u03CC\u03BB\u03B7 ~3 \u03B7\u03BC. \u00B7 \u03B2\u03B1\u03C1\u03C6\u03B1\u03C1\u03AF\u03BD\u03B7 5 \u03B7\u03BC. \u00B7 \u03C6\u03B1\u03B9\u03BD\u03C0\u03C1\u03BF\u03BA\u03BF\u03C5\u03BC\u03CC\u03BD\u03B7 7 \u03B7\u03BC.", stopEn: "Until INR normal \u00B7 acenocoumarol ~3 d \u00B7 warfarin 5 d \u00B7 phenprocoumon 7 d", restartEl: "\u039C\u03CC\u03BD\u03BF \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7\u03BD \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03C4\u03BF\u03C5 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1", restartEn: "Only after catheter removal", noteEl: "\u03A3\u03C4\u03CC\u03C7\u03BF\u03C2 INR \u03C3\u03C4\u03BF \u03C6\u03C5\u03C3\u03B9\u03BF\u03BB\u03BF\u03B3\u03B9\u03BA\u03CC \u03B5\u03CD\u03C1\u03BF\u03C2 \u03C4\u03BF\u03C5 \u03B5\u03C1\u03B3\u03B1\u03C3\u03C4\u03B7\u03C1\u03AF\u03BF\u03C5 (\u03C0.\u03C7. 1.1) \u2014 1C. INR <1.5 \u03BC\u03C0\u03BF\u03C1\u03B5\u03AF \u03BD\u03B1 \u03B3\u03AF\u03BD\u03B5\u03B9 \u03B4\u03B5\u03BA\u03C4\u03CC \u03B1\u03C4\u03BF\u03BC\u03B9\u03BA\u03AC (2C). \u0395\u03BD\u03B4\u03B9\u03AC\u03BC\u03B5\u03C3\u03B1 \u03B5\u03C0\u03B9\u03C4\u03C1\u03AD\u03C0\u03B5\u03C4\u03B1\u03B9 \u03C7\u03B1\u03BC\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7 LMWH \u03BC\u03B5 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1 in situ.", noteEn: "Target INR within the local laboratory normal range (e.g. 1.1) \u2014 1C. INR <1.5 may be acceptable individually (2C). Low-dose LMWH may be used in the interim with a catheter in situ." },
  { name: "LMWH \u03C7\u03B1\u03BC\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7 (\u226450 IU anti-Xa/kg/24h, \u03B5\u03BD\u03BF\u03BE\u03B1\u03C0\u03B1\u03C1\u03AF\u03BD\u03B7 40 mg/24h)", nameEn: "LMWH low dose (\u226450 IU anti-Xa/kg/day, enoxaparin 40 mg/day)", stopEl: "12 h \u00B7 CrCl <30: 24 h (\u03AE \u03BC\u03B9\u03C3\u03AE \u03B4\u03CC\u03C3\u03B7)", stopEn: "12 h \u00B7 CrCl <30: 24 h (or halve the dose)", restartEl: "\u039A\u03B1\u03C4\u03AC \u03C4\u03B9\u03C2 \u03BF\u03B4\u03B7\u03B3\u03AF\u03B5\u03C2 \u03C0\u03C1\u03BF\u03C6\u03CD\u03BB\u03B1\u03BE\u03B7\u03C2 \u03A6\u0398\u0395 (\u03C3\u03C5\u03BD\u03AE\u03B8\u03C9\u03C2 ~6 h \u03BC\u03B5\u03C4\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC)", restartEn: "Per VTE prophylaxis guidelines (usually ~6 h postoperatively)", noteEl: "1C. \u03A7\u03C9\u03C1\u03AF\u03C2 \u03B5\u03C1\u03B3\u03B1\u03C3\u03C4\u03B7\u03C1\u03B9\u03B1\u03BA\u03CC \u03AD\u03BB\u03B5\u03B3\u03C7\u03BF. \u03A3\u03B5 \u03B5\u03C0\u03AF\u03C4\u03BF\u03BA\u03B5\u03C2: 10\u201312 h (1C).", noteEn: "1C. No testing. In parturients: 10\u201312 h (1C)." },
  { name: "LMWH \u03C5\u03C8\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7 (>50 IU anti-Xa/kg/24h)", nameEn: "LMWH high dose (>50 IU anti-Xa/kg/day)", stopEl: "24 h \u00B7 CrCl <30: 48 h (\u03AE \u03BC\u03B9\u03C3\u03AE \u03B4\u03CC\u03C3\u03B7)", stopEn: "24 h \u00B7 CrCl <30: 48 h (or halve the dose)", restartEl: "~24 h \u03BC\u03B5\u03C4\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC, \u03BA\u03B1\u03C4\u03AC \u03C4\u03B9\u03C2 \u03BF\u03B4\u03B7\u03B3\u03AF\u03B5\u03C2 \u03B8\u03B5\u03C1\u03B1\u03C0\u03B5\u03C5\u03C4\u03B9\u03BA\u03AE\u03C2 \u03B1\u03BD\u03C4\u03B9\u03C0\u03B7\u03BE\u03AF\u03B1\u03C2 (\u03C0.\u03C7. EHRA) \u00B7 \u03BC\u03CC\u03BD\u03BF \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7\u03BD \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03C4\u03BF\u03C5 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1", restartEn: "~24 h postop, according to guidelines on therapeutic anticoagulation (e.g. EHRA) \u00B7 only after catheter removal", noteEl: "1C. \u03A3\u03C4\u03CC\u03C7\u03BF\u03C2 anti-Xa \u22640.1 IU/mL, \u03B9\u03B4\u03AF\u03C9\u03C2 \u03C3\u03B5 CrCl <30. \u039C\u03AD\u03C4\u03C1\u03B7\u03C3\u03B7 anti-Xa \u03BA\u03B1\u03B9 \u03C3\u03B5 \u03B7\u03BB\u03B9\u03BA\u03B9\u03C9\u03BC\u03AD\u03BD\u03BF\u03C5\u03C2, \u03B5\u03CD\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03BF\u03C5\u03C2 \u03AE \u03C0\u03BF\u03BB\u03CD \u03C7\u03B1\u03BC\u03B7\u03BB\u03CC \u03B2\u03AC\u03C1\u03BF\u03C2 (2C).", noteEn: "1C. Target anti-Xa \u22640.1 IU/mL, especially if CrCl <30. Also measure anti-Xa in older, frail or very low body weight patients (2C)." },
  { name: "UFH \u03C7\u03B1\u03BC\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7 (SC \u2264200 IU/kg/24h, IV \u2264100 IU/kg/24h)", nameEn: "UFH low dose (SC \u2264200 IU/kg/day, IV \u2264100 IU/kg/day)", stopEl: "4 h", stopEn: "4 h", restartEl: "1 h \u03B3\u03B9\u03B1 IV \u03C3\u03B5 \u03B1\u03B3\u03B3\u03B5\u03B9\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE", restartEn: "1 h for IV in vascular surgery", noteEl: "1C. \u03A7\u03C9\u03C1\u03AF\u03C2 \u03B5\u03C1\u03B3\u03B1\u03C3\u03C4\u03B7\u03C1\u03B9\u03B1\u03BA\u03CC \u03AD\u03BB\u03B5\u03B3\u03C7\u03BF.", noteEn: "1C. No testing." },
  { name: "UFH \u03C5\u03C8\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7", nameEn: "UFH high dose", stopEl: "IV: 6 h \u00B7 SC: 12 h \u2014 \u03BA\u03B1\u03B9 \u03C6\u03C5\u03C3\u03B9\u03BF\u03BB\u03BF\u03B3\u03B9\u03BA\u03CC aPTT/anti-Xa/ACT", stopEn: "IV: 6 h \u00B7 SC: 12 h \u2014 and normal aPTT/anti-Xa/ACT", restartEl: "\u039C\u03CC\u03BD\u03BF \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7\u03BD \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03C4\u03BF\u03C5 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1", restartEn: "Only after catheter removal", noteEl: "2C. \u0395\u03BD\u03B4\u03B9\u03AC\u03BC\u03B5\u03C3\u03B1 \u03B5\u03C0\u03B9\u03C4\u03C1\u03AD\u03C0\u03B5\u03C4\u03B1\u03B9 \u03C7\u03B1\u03BC\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7 UFH \u03AE LMWH \u03BC\u03B5 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1 in situ.", noteEn: "2C. Low-dose UFH or LMWH may be used in the interim with a catheter in situ." },
  { name: "\u03A6\u03BF\u03BD\u03C4\u03B1\u03C0\u03B1\u03C1\u03B9\u03BD\u03BF\u03CD\u03BE\u03B7 \u03C7\u03B1\u03BC\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7 (2.5 mg/24h)", nameEn: "Fondaparinux low dose (2.5 mg/day)", stopEl: "36 h \u00B7 CrCl <50: 72 h (\u03AE \u03BC\u03B5\u03AF\u03C9\u03C3\u03B7 \u03C3\u03B5 1.5 mg/24h)", stopEn: "36 h \u00B7 CrCl <50: 72 h (or reduce to 1.5 mg/day)", restartEl: "\u039A\u03B1\u03C4\u03AC \u03C4\u03B9\u03C2 \u03BF\u03B4\u03B7\u03B3\u03AF\u03B5\u03C2 \u03C0\u03C1\u03BF\u03C6\u03CD\u03BB\u03B1\u03BE\u03B7\u03C2 \u03A6\u0398\u0395", restartEn: "Per VTE prophylaxis guidelines", noteEl: "1C. \u03A7\u03C9\u03C1\u03AF\u03C2 \u03B5\u03C1\u03B3\u03B1\u03C3\u03C4\u03B7\u03C1\u03B9\u03B1\u03BA\u03CC \u03AD\u03BB\u03B5\u03B3\u03C7\u03BF.", noteEn: "1C. No testing." },
  { name: "\u03A6\u03BF\u03BD\u03C4\u03B1\u03C0\u03B1\u03C1\u03B9\u03BD\u03BF\u03CD\u03BE\u03B7 \u03C5\u03C8\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7 (>2.5 mg/24h)", nameEn: "Fondaparinux high dose (>2.5 mg/day)", stopEl: "\u0394\u0395\u039D \u03C3\u03C5\u03BD\u03B9\u03C3\u03C4\u03AC\u03C4\u03B1\u03B9 \u03BD\u03B5\u03C5\u03C1\u03B1\u03BE\u03BF\u03BD\u03B9\u03BA\u03AE \u00B7 \u03B1\u03BD \u03B1\u03BD\u03B1\u03C0\u03CC\u03C6\u03B5\u03C5\u03BA\u03C4\u03BF ~4 \u03B7\u03BC\u03AD\u03C1\u03B5\u03C2", stopEn: "Neuraxial NOT recommended \u00B7 if unavoidable ~4 days", restartEl: "\u039A\u03B1\u03C4\u03AC \u03C4\u03B9\u03C2 \u03BF\u03B4\u03B7\u03B3\u03AF\u03B5\u03C2 \u03B8\u03B5\u03C1\u03B1\u03C0\u03B5\u03C5\u03C4\u03B9\u03BA\u03AE\u03C2 \u03B1\u03BD\u03C4\u03B9\u03C0\u03B7\u03BE\u03AF\u03B1\u03C2", restartEn: "Per therapeutic anticoagulation guidelines", noteEl: "1C. \u0391\u03BD \u03B5\u03AF\u03BD\u03B1\u03B9 \u03B1\u03BD\u03B1\u03C0\u03CC\u03C6\u03B5\u03C5\u03BA\u03C4\u03BF, \u03C3\u03C4\u03CC\u03C7\u03BF\u03C2 \u03B2\u03B1\u03B8\u03BC\u03BF\u03BD\u03BF\u03BC\u03B7\u03BC\u03AD\u03BD\u03BF anti-Xa \u22640.1 IU/mL (2C).", noteEn: "1C. If unavoidable, target calibrated anti-Xa \u22640.1 IU/mL (2C)." },
  { name: "\u03A1\u03B9\u03B2\u03B1\u03C1\u03BF\u03BE\u03B1\u03BC\u03C0\u03AC\u03BD\u03B7 / \u0395\u03BD\u03C4\u03BF\u03BE\u03B1\u03BC\u03C0\u03AC\u03BD\u03B7 \u2014 \u03C7\u03B1\u03BC\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7", nameEn: "Rivaroxaban / Edoxaban \u2014 low dose", stopEl: "24 h \u00B7 CrCl <30: 30 h", stopEn: "24 h \u00B7 CrCl <30: 30 h", restartEl: "\u039A\u03B1\u03C4\u03AC \u03C4\u03B9\u03C2 \u03BF\u03B4\u03B7\u03B3\u03AF\u03B5\u03C2 \u03C0\u03C1\u03BF\u03C6\u03CD\u03BB\u03B1\u03BE\u03B7\u03C2 \u03A6\u0398\u0395 (\u03C3\u03C5\u03BD\u03AE\u03B8\u03C9\u03C2 ~6 h \u03BC\u03B5\u03C4\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC) \u00B7 \u03BC\u03CC\u03BD\u03BF \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7\u03BD \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03C4\u03BF\u03C5 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1", restartEn: "Per VTE prophylaxis guidelines (usually ~6 h postoperatively) \u00B7 only after catheter removal", noteEl: "1C. \u03A7\u03C9\u03C1\u03AF\u03C2 \u03B5\u03C1\u03B3\u03B1\u03C3\u03C4\u03B7\u03C1\u03B9\u03B1\u03BA\u03CC \u03AD\u03BB\u03B5\u03B3\u03C7\u03BF. \u03A7\u03B1\u03BC\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7 = \u03C0\u03C1\u03BF\u03C6\u03CD\u03BB\u03B1\u03BE\u03B7 \u03A6\u0398\u0395 \u03BC\u03B5\u03C4\u03AC \u03B1\u03C0\u03CC \u03BF\u03C1\u03B8\u03BF\u03C0\u03B1\u03B9\u03B4\u03B9\u03BA\u03AE \u03AE \u03C0\u03B1\u03C1\u03B1\u03C4\u03B5\u03C4\u03B1\u03BC\u03AD\u03BD\u03B7 \u03C0\u03C1\u03CC\u03BB\u03B7\u03C8\u03B7 \u03C5\u03C0\u03BF\u03C4\u03C1\u03BF\u03C0\u03AE\u03C2.", noteEn: "1C. No testing. Low dose = VTE prophylaxis after orthopaedic surgery or extended prevention of recurrence." },
  { name: "\u0391\u03C0\u03B9\u03BE\u03B1\u03BC\u03C0\u03AC\u03BD\u03B7 \u2014 \u03C7\u03B1\u03BC\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7", nameEn: "Apixaban \u2014 low dose", stopEl: "36 h", stopEn: "36 h", restartEl: "\u039A\u03B1\u03C4\u03AC \u03C4\u03B9\u03C2 \u03BF\u03B4\u03B7\u03B3\u03AF\u03B5\u03C2 \u03C0\u03C1\u03BF\u03C6\u03CD\u03BB\u03B1\u03BE\u03B7\u03C2 \u03A6\u0398\u0395 (\u03C3\u03C5\u03BD\u03AE\u03B8\u03C9\u03C2 ~6 h \u03BC\u03B5\u03C4\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC) \u00B7 \u03BC\u03CC\u03BD\u03BF \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7\u03BD \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03C4\u03BF\u03C5 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1", restartEn: "Per VTE prophylaxis guidelines (usually ~6 h postoperatively) \u00B7 only after catheter removal", noteEl: "1C. \u03A7\u03C9\u03C1\u03AF\u03C2 \u03B5\u03C1\u03B3\u03B1\u03C3\u03C4\u03B7\u03C1\u03B9\u03B1\u03BA\u03CC \u03AD\u03BB\u03B5\u03B3\u03C7\u03BF.", noteEn: "1C. No testing." },
  { name: "\u0386\u03BC\u03B5\u03C3\u03BF\u03B9 \u03B1\u03BD\u03B1\u03C3\u03C4\u03BF\u03BB\u03B5\u03AF\u03C2 Xa \u2014 \u03C5\u03C8\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7 (\u03C1\u03B9\u03B2\u03B1\u03C1\u03BF\u03BE\u03B1\u03BC\u03C0\u03AC\u03BD\u03B7, \u03B1\u03C0\u03B9\u03BE\u03B1\u03BC\u03C0\u03AC\u03BD\u03B7, \u03B5\u03BD\u03C4\u03BF\u03BE\u03B1\u03BC\u03C0\u03AC\u03BD\u03B7)", nameEn: "Direct Xa inhibitors \u2014 high dose (rivaroxaban, apixaban, edoxaban)", stopEl: "72 h \u00B7 CrCl <30: \u03BC\u03AD\u03C7\u03C1\u03B9 \u03B5\u03C1\u03B3\u03B1\u03C3\u03C4\u03B7\u03C1\u03B9\u03B1\u03BA\u03CC \u03C3\u03C4\u03CC\u03C7\u03BF", stopEn: "72 h \u00B7 CrCl <30: until laboratory target", restartEl: "~24 h \u03BC\u03B5\u03C4\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC, \u03BA\u03B1\u03C4\u03AC \u03C4\u03B9\u03C2 \u03BF\u03B4\u03B7\u03B3\u03AF\u03B5\u03C2 \u03B8\u03B5\u03C1\u03B1\u03C0\u03B5\u03C5\u03C4\u03B9\u03BA\u03AE\u03C2 \u03B1\u03BD\u03C4\u03B9\u03C0\u03B7\u03BE\u03AF\u03B1\u03C2 (\u03C0.\u03C7. EHRA) \u00B7 \u03BC\u03CC\u03BD\u03BF \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7\u03BD \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03C4\u03BF\u03C5 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1", restartEn: "~24 h postop, according to guidelines on therapeutic anticoagulation (e.g. EHRA) \u00B7 only after catheter removal", noteEl: "1C. \u03A3\u03C4\u03CC\u03C7\u03BF\u03C2 \u03B5\u03C0\u03AF\u03C0\u03B5\u03B4\u03BF <30 ng/mL \u03AE anti-Xa \u22640.1 IU/mL. \u039C\u03AD\u03C4\u03C1\u03B7\u03C3\u03B7 \u03C3\u03C5\u03BD\u03B9\u03C3\u03C4\u03AC\u03C4\u03B1\u03B9 \u03C3\u03B5 CrCl <30 (2C).", noteEn: "1C. Target level <30 ng/mL or anti-Xa \u22640.1 IU/mL. Measurement advised if CrCl <30 (2C)." },
  { name: "\u039D\u03C4\u03B1\u03BC\u03C0\u03B9\u03B3\u03BA\u03B1\u03C4\u03C1\u03AC\u03BD\u03B7 \u2014 \u03C7\u03B1\u03BC\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7", nameEn: "Dabigatran \u2014 low dose", stopEl: "48 h", stopEn: "48 h", restartEl: "\u039A\u03B1\u03C4\u03AC \u03C4\u03B9\u03C2 \u03BF\u03B4\u03B7\u03B3\u03AF\u03B5\u03C2 \u03C0\u03C1\u03BF\u03C6\u03CD\u03BB\u03B1\u03BE\u03B7\u03C2 \u03A6\u0398\u0395 (\u03C3\u03C5\u03BD\u03AE\u03B8\u03C9\u03C2 ~6 h \u03BC\u03B5\u03C4\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC) \u00B7 \u03BC\u03CC\u03BD\u03BF \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7\u03BD \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03C4\u03BF\u03C5 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1", restartEn: "Per VTE prophylaxis guidelines (usually ~6 h postoperatively) \u00B7 only after catheter removal", noteEl: "1C. \u03A7\u03C9\u03C1\u03AF\u03C2 \u03B5\u03C1\u03B3\u03B1\u03C3\u03C4\u03B7\u03C1\u03B9\u03B1\u03BA\u03CC \u03AD\u03BB\u03B5\u03B3\u03C7\u03BF.", noteEn: "1C. No testing." },
  { name: "\u039D\u03C4\u03B1\u03BC\u03C0\u03B9\u03B3\u03BA\u03B1\u03C4\u03C1\u03AC\u03BD\u03B7 \u2014 \u03C5\u03C8\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7", nameEn: "Dabigatran \u2014 high dose", stopEl: "72 h \u00B7 CrCl <50: \u03BC\u03AD\u03C7\u03C1\u03B9 \u03B5\u03C1\u03B3\u03B1\u03C3\u03C4\u03B7\u03C1\u03B9\u03B1\u03BA\u03CC \u03C3\u03C4\u03CC\u03C7\u03BF", stopEn: "72 h \u00B7 CrCl <50: until laboratory target", restartEl: "~24 h \u03BC\u03B5\u03C4\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC, \u03BA\u03B1\u03C4\u03AC \u03C4\u03B9\u03C2 \u03BF\u03B4\u03B7\u03B3\u03AF\u03B5\u03C2 \u03B8\u03B5\u03C1\u03B1\u03C0\u03B5\u03C5\u03C4\u03B9\u03BA\u03AE\u03C2 \u03B1\u03BD\u03C4\u03B9\u03C0\u03B7\u03BE\u03AF\u03B1\u03C2 (\u03C0.\u03C7. EHRA) \u00B7 \u03BC\u03CC\u03BD\u03BF \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7\u03BD \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03C4\u03BF\u03C5 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1", restartEn: "~24 h postop, according to guidelines on therapeutic anticoagulation (e.g. EHRA) \u00B7 only after catheter removal", noteEl: "1C. \u03A3\u03C4\u03CC\u03C7\u03BF\u03C2 \u03B5\u03C0\u03AF\u03C0\u03B5\u03B4\u03BF <30 ng/mL \u03AE \u03C6\u03C5\u03C3\u03B9\u03BF\u03BB\u03BF\u03B3\u03B9\u03BA\u03CC\u03C2 \u03C7\u03C1\u03CC\u03BD\u03BF\u03C2 \u03B8\u03C1\u03BF\u03BC\u03B2\u03AF\u03BD\u03B7\u03C2. \u039C\u03AD\u03C4\u03C1\u03B7\u03C3\u03B7 \u03C3\u03B5 CrCl <50 (2C). ESAIC/ESRA: \u03B7 \u03C0\u03BB\u03AE\u03C1\u03B7\u03C2 \u03B1\u03BD\u03B1\u03C3\u03C4\u03C1\u03BF\u03C6\u03AE \u03BC\u03B5 \u03B9\u03B4\u03B1\u03C1\u03BF\u03C5\u03C3\u03B9\u03B6\u03BF\u03C5\u03BC\u03AC\u03BC\u03C0\u03B7 \u03B5\u03C0\u03B9\u03C4\u03C1\u03AD\u03C0\u03B5\u03B9 \u03BD\u03B5\u03C5\u03C1\u03B1\u03BE\u03BF\u03BD\u03B9\u03BA\u03AE \u03C3\u03B5 \u03B5\u03C0\u03B5\u03AF\u03B3\u03BF\u03BD (2C). ASRA 2025: \u039F\u03A7\u0399 \u03B1\u03BD\u03B1\u03C3\u03C4\u03C1\u03BF\u03C6\u03AE \u03BC\u03CC\u03BD\u03BF \u03B3\u03B9\u03B1 \u03BD\u03B1 \u03B3\u03AF\u03BD\u03B5\u03B9 \u03C0\u03B5\u03C1\u03B9\u03BF\u03C7\u03B9\u03BA\u03AE \u03C3\u03B5 \u03C3\u03C5\u03BD\u03AE\u03B8\u03B5\u03B9\u03C2 \u03B1\u03C3\u03B8\u03B5\u03BD\u03B5\u03AF\u03C2 (IIC)\u00B7 \u03B1\u03BD \u03B7 \u03B1\u03BD\u03B1\u03C3\u03C4\u03C1\u03BF\u03C6\u03AE \u03C7\u03C1\u03B5\u03B9\u03AC\u03B6\u03B5\u03C4\u03B1\u03B9 \u03B3\u03B9\u03B1 \u03C4\u03B7\u03BD \u03AF\u03B4\u03B9\u03B1 \u03C4\u03B7\u03BD \u03B5\u03C0\u03AD\u03BC\u03B2\u03B1\u03C3\u03B7, \u03B7 \u03C0\u03B5\u03C1\u03B9\u03BF\u03C7\u03B9\u03BA\u03AE \u03BC\u03C0\u03BF\u03C1\u03B5\u03AF \u03BD\u03B1 \u03B5\u03BE\u03B5\u03C4\u03B1\u03C3\u03C4\u03B5\u03AF \u03BC\u03B5\u03C4\u03AC \u03B1\u03C0\u03CC \u03C0\u03BB\u03AE\u03C1\u03B7 \u03B1\u03BD\u03B1\u03C3\u03C4\u03C1\u03BF\u03C6\u03AE. \u0394\u03B9\u03B1\u03C3\u03C4\u03AE\u03BC\u03B1\u03C4\u03B1 ASRA 2025: \u226572 h (CrCl \u226550) \u00B7 120 h (CrCl 30\u201349) \u00B7 CrCl <30: \u03CC\u03C7\u03B9, \u03B5\u03BA\u03C4\u03CC\u03C2 \u03B1\u03BD \u03B5\u03C0\u03AF\u03C0\u03B5\u03B4\u03BF <30 ng/mL (IIC).", noteEn: "1C. Target level <30 ng/mL or normal thrombin time. Measure if CrCl <50 (2C). ESAIC/ESRA: full reversal with idarucizumab permits neuraxial procedures in an emergency (2C). ASRA 2025: do NOT reverse solely to allow a regional technique in routine patients (IIC); if reversal is needed for the surgery itself, regional may be considered after full reversal. ASRA 2025 intervals: \u226572 h (CrCl \u226550) \u00B7 120 h (CrCl 30\u201349) \u00B7 CrCl <30: not unless level <30 ng/mL (IIC)." },
  { name: "\u03A3\u03C5\u03BD\u03B4\u03C5\u03B1\u03C3\u03BC\u03BF\u03AF \u03B1\u03BD\u03C4\u03B9\u03B8\u03C1\u03BF\u03BC\u03B2\u03C9\u03C4\u03B9\u03BA\u03CE\u03BD", nameEn: "Combinations of antithrombotic drugs", stopEl: "\u03A4\u03BF \u039C\u0395\u0393\u0391\u039B\u03A5\u03A4\u0395\u03A1\u039F \u03B4\u03B9\u03AC\u03C3\u03C4\u03B7\u03BC\u03B1 \u03B1\u03C0\u03CC \u03C4\u03B1 \u03B5\u03C0\u03B9\u03BC\u03AD\u03C1\u03BF\u03C5\u03C2 \u03C6\u03AC\u03C1\u03BC\u03B1\u03BA\u03B1", stopEn: "The LONGEST interval of the individual drugs", restartEl: "\u039A\u03B1\u03C4\u03AC \u03C4\u03B9\u03C2 \u03BF\u03B4\u03B7\u03B3\u03AF\u03B5\u03C2 \u03B8\u03B5\u03C1\u03B1\u03C0\u03B5\u03C5\u03C4\u03B9\u03BA\u03AE\u03C2 \u03B1\u03BD\u03C4\u03B9\u03C0\u03B7\u03BE\u03AF\u03B1\u03C2 (~24 h)", restartEn: "Per therapeutic anticoagulation guidelines (~24 h)", noteEl: "1C. \u039C\u03B5\u03C4\u03C1\u03AC \u03C4\u03BF \u03BC\u03B5\u03B3\u03B1\u03BB\u03CD\u03C4\u03B5\u03C1\u03BF \u03B4\u03B9\u03AC\u03C3\u03C4\u03B7\u03BC\u03B1 \u03B1\u03C0\u03CC \u03C4\u03B1 \u03B5\u03C0\u03B9\u03BC\u03AD\u03C1\u03BF\u03C5\u03C2 \u03C6\u03AC\u03C1\u03BC\u03B1\u03BA\u03B1.", noteEn: "1C. The longest interval of the individual drugs applies." },
  { name: "\u0398\u03C1\u03BF\u03BC\u03B2\u03BF\u03BB\u03C5\u03C4\u03B9\u03BA\u03AC", nameEn: "Thrombolytics", stopEl: "\u038C\u03C7\u03B9 \u03B2\u03B5\u03BB\u03CC\u03BD\u03B1 \u03B3\u03B9\u03B1 \u226548 h \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7 \u03B8\u03C1\u03BF\u03BC\u03B2\u03CC\u03BB\u03C5\u03C3\u03B7 \u00B7 \u03C4\u03B5\u03BA\u03BC\u03B7\u03C1\u03AF\u03C9\u03C3\u03B7 \u03C6\u03C5\u03C3\u03B9\u03BF\u03BB\u03BF\u03B3\u03B9\u03BA\u03BF\u03CD \u03B5\u03BB\u03AD\u03B3\u03C7\u03BF\u03C5 \u03C0\u03AE\u03BE\u03B7\u03C2 (\u03BC\u03B5 \u03B9\u03BD\u03C9\u03B4\u03BF\u03B3\u03CC\u03BD\u03BF) (ASRA 2025, IA)", stopEn: "No needle placement for \u226548 h after thrombolysis \u00B7 document normal clotting studies incl. fibrinogen (ASRA 2025, IA)", restartEl: "\u0395\u03BE\u03B1\u03C4\u03BF\u03BC\u03B9\u03BA\u03B5\u03C5\u03BC\u03AD\u03BD\u03B1, \u03B4\u03B9\u03B5\u03C0\u03B9\u03C3\u03C4\u03B7\u03BC\u03BF\u03BD\u03B9\u03BA\u03AC", restartEn: "Individualised, multidisciplinary", noteEl: "\u0397 ESAIC/ESRA 2022 \u03B4\u03B5\u03BD \u03B4\u03AF\u03BD\u03B5\u03B9 \u03C3\u03CD\u03C3\u03C4\u03B1\u03C3\u03B7. ASRA 2025: \u03BD\u03B5\u03C5\u03C1\u03BF\u03BB\u03BF\u03B3\u03B9\u03BA\u03CC\u03C2 \u03AD\u03BB\u03B5\u03B3\u03C7\u03BF\u03C2 \u03B1\u03BD\u03AC ~2 h \u03B3\u03B9\u03B1 \u226548 h\u00B7 \u03B3\u03B9\u03B1 \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1 \u03B4\u03B5\u03BD \u03C5\u03C0\u03AC\u03C1\u03C7\u03B5\u03B9 \u03BF\u03C1\u03B9\u03C3\u03C4\u03B9\u03BA\u03AE \u03C3\u03CD\u03C3\u03C4\u03B1\u03C3\u03B7 \u2014 \u03BC\u03AD\u03C4\u03C1\u03B7\u03C3\u03B7 \u03B9\u03BD\u03C9\u03B4\u03BF\u03B3\u03CC\u03BD\u03BF\u03C5.", noteEn: "ESAIC/ESRA 2022 gives no recommendation. ASRA 2025: neurological checks every ~2 h for \u226548 h; no definitive recommendation for catheter removal \u2014 measure fibrinogen." }
];
const ABX = [
  {
    el: "\u039A\u03B1\u03C1\u03B4\u03B9\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE / \u0398\u03C9\u03C1\u03B1\u03BA\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE",
    en: "Cardiac / Thoracic",
    regEl: "\u039A\u03B5\u03C6\u03B1\u03B6\u03BF\u03BB\u03AF\u03BD\u03B7 2 g IV (3 g \u2265120 kg)",
    regEn: "Cefazolin 2 g IV (3 g \u2265120 kg)",
    altEl: "\u0392\u03B1\u03BD\u03BA\u03BF\u03BC\u03C5\u03BA\u03AF\u03BD\u03B7 15 mg/kg \u03AE \u03BA\u03BB\u03B9\u03BD\u03B4\u03B1\u03BC\u03C5\u03BA\u03AF\u03BD\u03B7 900 mg",
    altEn: "Vancomycin 15 mg/kg or clindamycin 900 mg",
    redose: "q4h"
  },
  {
    el: "\u039F\u03C1\u03B8\u03BF\u03C0\u03B1\u03B9\u03B4\u03B9\u03BA\u03AE (\u03B1\u03C1\u03B8\u03C1\u03BF\u03C0\u03BB\u03B1\u03C3\u03C4\u03B9\u03BA\u03AE/\u03BA\u03B1\u03C4\u03AC\u03B3\u03BC\u03B1\u03C4\u03B1)",
    en: "Orthopedic (arthroplasty/fractures)",
    regEl: "\u039A\u03B5\u03C6\u03B1\u03B6\u03BF\u03BB\u03AF\u03BD\u03B7 2 g IV \u2014 \u03C0\u03C1\u03BF\u03C3\u03B8\u03AE\u03BA\u03B7 \u03B2\u03B1\u03BD\u03BA\u03BF\u03BC\u03C5\u03BA\u03AF\u03BD\u03B7\u03C2 \u03B5\u03C0\u03AF MRSA",
    regEn: "Cefazolin 2 g IV \u2014 add vancomycin if MRSA risk",
    altEl: "\u0392\u03B1\u03BD\u03BA\u03BF\u03BC\u03C5\u03BA\u03AF\u03BD\u03B7 \u03AE \u03BA\u03BB\u03B9\u03BD\u03B4\u03B1\u03BC\u03C5\u03BA\u03AF\u03BD\u03B7",
    altEn: "Vancomycin or clindamycin",
    redose: "q4h"
  },
  {
    el: "\u03A0\u03B1\u03C7\u03AD\u03BF\u03C2 \u03B5\u03BD\u03C4\u03AD\u03C1\u03BF\u03C5 / \u039F\u03C1\u03B8\u03BF\u03CD (\u03BA\u03BF\u03BB\u03BF\u03BF\u03C1\u03B8\u03B9\u03BA\u03AE)",
    en: "Colorectal",
    regEl: "\u039A\u03B5\u03C6\u03B1\u03B6\u03BF\u03BB\u03AF\u03BD\u03B7 2 g + \u039C\u03B5\u03C4\u03C1\u03BF\u03BD\u03B9\u03B4\u03B1\u03B6\u03CC\u03BB\u03B7 500 mg IV",
    regEn: "Cefazolin 2 g + Metronidazole 500 mg IV",
    altEl: "\u039A\u03BB\u03B9\u03BD\u03B4\u03B1\u03BC\u03C5\u03BA\u03AF\u03BD\u03B7 + \u03B3\u03B5\u03BD\u03C4\u03B1\u03BC\u03B9\u03BA\u03AF\u03BD\u03B7/\u03B1\u03B6\u03C4\u03C1\u03B5\u03BF\u03BD\u03AC\u03BC\u03B7",
    altEn: "Clindamycin + gentamicin/aztreonam",
    redose: "q4h"
  },
  {
    el: "\u03A7\u03BF\u03BB\u03BF\u03BA\u03C5\u03C3\u03C4\u03B5\u03BA\u03C4\u03BF\u03BC\u03AE / \u03BA\u03AE\u03BB\u03B7",
    en: "Cholecystectomy / hernia",
    regEl: "\u039A\u03B5\u03C6\u03B1\u03B6\u03BF\u03BB\u03AF\u03BD\u03B7 2 g IV \u00B7 \u03B5\u03BA\u03BB\u03B5\u03BA\u03C4\u03B9\u03BA\u03AE \u03BB\u03B1\u03C0\u03B1\u03C1\u03BF\u03C3\u03BA\u03BF\u03C0\u03B9\u03BA\u03AE \u03C7\u03BF\u03BB\u03BF\u03BA\u03C5\u03C3\u03C4\u03B5\u03BA\u03C4\u03BF\u03BC\u03AE \u03C7\u03B1\u03BC\u03B7\u03BB\u03BF\u03CD \u03BA\u03B9\u03BD\u03B4\u03CD\u03BD\u03BF\u03C5: \u03BA\u03B1\u03BC\u03AF\u03B1",
    regEn: "Cefazolin 2 g IV \u00B7 elective low-risk laparoscopic cholecystectomy: none",
    altEl: "\u039A\u03AE\u03BB\u03B7: \u03BA\u03BB\u03B9\u03BD\u03B4\u03B1\u03BC\u03C5\u03BA\u03AF\u03BD\u03B7 \u03AE \u03B2\u03B1\u03BD\u03BA\u03BF\u03BC\u03C5\u03BA\u03AF\u03BD\u03B7 \u00B7 \u03C7\u03BF\u03BB\u03B7\u03C6\u03CC\u03C1\u03B1: \u03BA\u03BB\u03B9\u03BD\u03B4\u03B1\u03BC\u03C5\u03BA\u03AF\u03BD\u03B7 \u03AE \u03B2\u03B1\u03BD\u03BA\u03BF\u03BC\u03C5\u03BA\u03AF\u03BD\u03B7 + \u03B1\u03BC\u03B9\u03BD\u03BF\u03B3\u03BB\u03C5\u03BA\u03BF\u03C3\u03AF\u03B4\u03B7, \u03B1\u03B6\u03C4\u03C1\u03B5\u03BF\u03BD\u03AC\u03BC\u03B7 \u03AE \u03BA\u03B9\u03BD\u03BF\u03BB\u03CC\u03BD\u03B7",
    altEn: "Hernia: clindamycin or vancomycin \u00B7 biliary: clindamycin or vancomycin + aminoglycoside, aztreonam or fluoroquinolone",
    redose: "q4h"
  },
  {
    el: "\u039A\u03B1\u03B9\u03C3\u03B1\u03C1\u03B9\u03BA\u03AE \u03C4\u03BF\u03BC\u03AE",
    en: "Cesarean section",
    regEl: "\u039A\u03B5\u03C6\u03B1\u03B6\u03BF\u03BB\u03AF\u03BD\u03B7 2 g IV \u03C0\u03C1\u03BF \u03C4\u03BF\u03BC\u03AE\u03C2 (3 g \u2265120 kg)",
    regEn: "Cefazolin 2 g IV before incision (3 g \u2265120 kg)",
    altEl: "\u039A\u03BB\u03B9\u03BD\u03B4\u03B1\u03BC\u03C5\u03BA\u03AF\u03BD\u03B7 + \u03B3\u03B5\u03BD\u03C4\u03B1\u03BC\u03B9\u03BA\u03AF\u03BD\u03B7",
    altEn: "Clindamycin + gentamicin",
    redose: "q4h"
  },
  {
    el: "\u03A5\u03C3\u03C4\u03B5\u03C1\u03B5\u03BA\u03C4\u03BF\u03BC\u03AE",
    en: "Hysterectomy",
    regEl: "\u039A\u03B5\u03C6\u03B1\u03B6\u03BF\u03BB\u03AF\u03BD\u03B7 2 g IV",
    regEn: "Cefazolin 2 g IV",
    altEl: "\u039A\u03BB\u03B9\u03BD\u03B4\u03B1\u03BC\u03C5\u03BA\u03AF\u03BD\u03B7/\u03BC\u03B5\u03C4\u03C1\u03BF\u03BD\u03B9\u03B4\u03B1\u03B6\u03CC\u03BB\u03B7 + \u03B3\u03B5\u03BD\u03C4\u03B1\u03BC\u03B9\u03BA\u03AF\u03BD\u03B7",
    altEn: "Clindamycin/metronidazole + gentamicin",
    redose: "q4h"
  },
  {
    el: "\u039F\u03C5\u03C1\u03BF\u03BB\u03BF\u03B3\u03B9\u03BA\u03AE (\u03BC\u03B5 \u03B5\u03AF\u03C3\u03BF\u03B4\u03BF \u03C3\u03C4\u03BF \u03BF\u03C5\u03C1\u03BF\u03C0\u03BF\u03B9\u03B7\u03C4\u03B9\u03BA\u03CC)",
    en: "Urologic (entering urinary tract)",
    regEl: "\u039A\u03B5\u03C6\u03B1\u03B6\u03BF\u03BB\u03AF\u03BD\u03B7 2 g IV \u00B7 \u03B5\u03C1\u03B3\u03B1\u03BB\u03B5\u03B9\u03B1\u03BA\u03AD\u03C2 \u03BA\u03B1\u03C4\u03CE\u03C4\u03B5\u03C1\u03BF\u03C5 \u03BF\u03C5\u03C1\u03BF\u03C0\u03BF\u03B9\u03B7\u03C4\u03B9\u03BA\u03BF\u03CD \u03BC\u03B5 \u03C0\u03B1\u03C1\u03AC\u03B3\u03BF\u03BD\u03C4\u03B5\u03C2 \u03BA\u03B9\u03BD\u03B4\u03CD\u03BD\u03BF\u03C5: \u03BA\u03B9\u03BD\u03BF\u03BB\u03CC\u03BD\u03B7, TMP-SMX \u03AE \u03BA\u03B5\u03C6\u03B1\u03B6\u03BF\u03BB\u03AF\u03BD\u03B7",
    regEn: "Cefazolin 2 g IV \u00B7 lower-tract instrumentation with risk factors: fluoroquinolone, TMP-SMX or cefazolin",
    altEl: "\u039A\u03B9\u03BD\u03BF\u03BB\u03CC\u03BD\u03B7 \u03AE \u03B1\u03BC\u03B9\u03BD\u03BF\u03B3\u03BB\u03C5\u03BA\u03BF\u03C3\u03AF\u03B4\u03B7 \u00B1 \u03BA\u03BB\u03B9\u03BD\u03B4\u03B1\u03BC\u03C5\u03BA\u03AF\u03BD\u03B7",
    altEn: "Fluoroquinolone or aminoglycoside \u00B1 clindamycin",
    redose: "q4h"
  },
  {
    el: "\u039D\u03B5\u03C5\u03C1\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE (\u03BA\u03C1\u03B1\u03BD\u03B9\u03BF\u03C4\u03BF\u03BC\u03AF\u03B1/\u03C3\u03C0\u03BF\u03BD\u03B4\u03C5\u03BB\u03B9\u03BA\u03AE)",
    en: "Neurosurgery (craniotomy/spine)",
    regEl: "\u039A\u03B5\u03C6\u03B1\u03B6\u03BF\u03BB\u03AF\u03BD\u03B7 2 g IV",
    regEn: "Cefazolin 2 g IV",
    altEl: "\u0392\u03B1\u03BD\u03BA\u03BF\u03BC\u03C5\u03BA\u03AF\u03BD\u03B7 \u03AE \u03BA\u03BB\u03B9\u03BD\u03B4\u03B1\u03BC\u03C5\u03BA\u03AF\u03BD\u03B7",
    altEn: "Vancomycin or clindamycin",
    redose: "q4h"
  },
  {
    el: "\u0391\u03B3\u03B3\u03B5\u03B9\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE",
    en: "Vascular",
    regEl: "\u039A\u03B5\u03C6\u03B1\u03B6\u03BF\u03BB\u03AF\u03BD\u03B7 2 g IV",
    regEn: "Cefazolin 2 g IV",
    altEl: "\u0392\u03B1\u03BD\u03BA\u03BF\u03BC\u03C5\u03BA\u03AF\u03BD\u03B7 \u03AE \u03BA\u03BB\u03B9\u03BD\u03B4\u03B1\u03BC\u03C5\u03BA\u03AF\u03BD\u03B7",
    altEn: "Vancomycin or clindamycin",
    redose: "q4h"
  },
  {
    el: "\u03A9\u03A1\u039B (clean-contaminated)",
    en: "ENT (clean-contaminated)",
    regEl: "\u039A\u03B5\u03C6\u03B1\u03B6\u03BF\u03BB\u03AF\u03BD\u03B7 2 g + \u03BC\u03B5\u03C4\u03C1\u03BF\u03BD\u03B9\u03B4\u03B1\u03B6\u03CC\u03BB\u03B7 \u03AE \u03B1\u03BC\u03C0\u03B9\u03BA\u03B9\u03BB\u03BB\u03AF\u03BD\u03B7-\u03C3\u03BF\u03C5\u03BB\u03BC\u03C0\u03B1\u03BA\u03C4\u03AC\u03BC\u03B7 3 g",
    regEn: "Cefazolin 2 g + metronidazole or ampicillin-sulbactam 3 g",
    altEl: "\u039A\u03BB\u03B9\u03BD\u03B4\u03B1\u03BC\u03C5\u03BA\u03AF\u03BD\u03B7 900 mg",
    altEn: "Clindamycin 900 mg",
    redose: "q4h"
  }
];
// CDC growth charts \u2014 LMS parameters [Agemos, L, M, S] from the CDC data files (cdc.gov/growthcharts/cdc-data-files.htm),
// read via the RestoredCDC.org mirror; every row verified: P95 (and P5 for infant weight) recomputed from L, M, S matches the file.
// Females 2\u201320 y are incomplete (stature to 192.5, weight to 188.5, BMI to 160.5 months) \u2014 the mirror truncates the files.
const CDC_GROWTH = {
  len: { 1: [[0.0,1.267004226,49.98888408,0.053112191],[0.5,0.511237696,52.6959753,0.048692684],[1.5,-0.45224446,56.62842855,0.04411683],[2.5,-0.990594599,59.60895343,0.041795583],[3.5,-1.285837689,62.07700027,0.040454126],[4.5,-1.43031238,64.2168641,0.039633879],[5.5,-1.47657547,66.1253149,0.039123813],[6.5,-1.456837849,67.8601799,0.038811994],[7.5,-1.391898768,69.45908458,0.038633209],[8.5,-1.29571459,70.94803912,0.038546833],[9.5,-1.177919048,72.34586111,0.038526262],[10.5,-1.045326049,73.6666541,0.038553387],[11.5,-0.902800887,74.92129717,0.038615501],[12.5,-0.753908107,76.11837536,0.038703461],[13.5,-0.601263523,77.26479911,0.038810557],[14.5,-0.446805039,78.36622309,0.038931784],[15.5,-0.291974772,79.4273405,0.039063356],[16.5,-0.13784767,80.45209492,0.039202382],[17.5,0.014776155,81.44383603,0.039346629],[18.5,0.165304169,82.40543643,0.039494365],[19.5,0.313301809,83.33938063,0.039644238],[20.5,0.458455471,84.24783394,0.039795189],[21.5,0.600544631,85.13269658,0.039946388],[22.5,0.739438953,85.9956488,0.040097181],[23.5,0.875000447,86.8381751,0.04024706],[24.5,1.00720807,87.66160934,0.040395626],[25.5,0.837251351,88.45247282,0.040577525],[26.5,0.681492975,89.22326434,0.040723122],[27.5,0.538779654,89.97549228,0.040833194],[28.5,0.407697153,90.71040853,0.040909059],[29.5,0.286762453,91.42907762,0.040952433],[30.5,0.174489485,92.13242379,0.04096533],[31.5,0.069444521,92.82127167,0.040949976],[32.5,-0.029720564,93.49637946,0.040908737],[33.5,-0.124251789,94.15846546,0.040844062],[34.5,-0.215288396,94.80822923,0.040758431],[35.5,-0.30385434,95.44636981,0.040654312]], 2: [[0.0,-1.295960857,49.28639612,0.05008556],[0.5,-0.809249882,51.68358057,0.046818545],[1.5,-0.050782985,55.28612813,0.0434439],[2.5,0.476851407,58.09381906,0.041716103],[3.5,0.843299612,60.45980763,0.040705173],[4.5,1.097562257,62.53669656,0.040079765],[5.5,1.272509641,64.40632762,0.039686845],[6.5,1.390428859,66.11841553,0.039444555],[7.5,1.466733925,67.70574419,0.039304738],[8.5,1.512301976,69.19123614,0.03923711],[9.5,1.534950767,70.59163924,0.039221665],[10.5,1.540390875,71.91961673,0.039244672],[11.5,1.532852892,73.1850104,0.03929642],[12.5,1.51550947,74.39564379,0.039369875],[13.5,1.490765028,75.5578544,0.039459832],[14.5,1.460458255,76.67685871,0.039562382],[15.5,1.426006009,77.75700986,0.039674542],[16.5,1.388507095,78.80198406,0.03979401],[17.5,1.348818127,79.81491852,0.039918994],[18.5,1.307609654,80.79851532,0.040048084],[19.5,1.265408149,81.75512092,0.040180162],[20.5,1.222627732,82.6867881,0.04031434],[21.5,1.179594365,83.59532461,0.040449904],[22.5,1.136564448,84.48233206,0.040586283],[23.5,1.093731947,85.34923624,0.040723015],[24.5,1.051272912,86.1973169,0.040859727],[25.5,1.041951175,87.09026318,0.041142161],[26.5,1.012592236,87.95714182,0.041349399],[27.5,0.970541909,88.7960184,0.041500428],[28.5,0.921129988,89.6055115,0.041610508],[29.5,0.868221392,90.38476689,0.041691761],[30.5,0.81454413,91.13341722,0.04175368],[31.5,0.761957977,91.8515436,0.041803562],[32.5,0.711660228,92.5396352,0.041846882],[33.5,0.664323379,93.19854429,0.041887626],[34.5,0.620285102,93.82945392,0.041928568],[35.5,0.57955631,94.43382278,0.041971514]] },
  wtInf: { 1: [[0.0,1.815151075,3.530203168,0.152385273],[0.5,1.547523128,4.003106424,0.146025021],[1.5,1.068795548,4.879525083,0.136478767],[2.5,0.695973505,5.672888765,0.129677511],[3.5,0.41981509,6.391391982,0.124717085],[4.5,0.219866801,7.041836432,0.121040119],[5.5,0.077505598,7.630425182,0.1182712],[6.5,-0.02190761,8.162951035,0.116153695],[7.5,-0.0894409,8.644832479,0.114510349],[8.5,-0.1334091,9.081119817,0.113217163],[9.5,-0.1600954,9.476500305,0.11218624],[10.5,-0.17429685,9.835307701,0.111354536],[11.5,-0.1797189,10.16153567,0.110676413],[12.5,-0.179254,10.45885399,0.110118635],[13.5,-0.17518447,10.7306256,0.109656941],[14.5,-0.16932268,10.97992482,0.109273653],[15.5,-0.1631139,11.20955529,0.10895596],[16.5,-0.15770999,11.4220677,0.108694678],[17.5,-0.15402279,11.61977698,0.108483324],[18.5,-0.15276214,11.80477902,0.108317416],[19.5,-0.15446658,11.9789663,0.108193944],[20.5,-0.15952202,12.14404334,0.108110954],[21.5,-0.16817926,12.30154103,0.108067236],[22.5,-0.1805668,12.45283028,0.108062078],[23.5,-0.19670196,12.59913494,0.108095077],[24.5,-0.21650121,12.74154396,0.108166005],[25.5,-0.23979048,12.88102276,0.108274705],[26.5,-0.26631585,13.01842382,0.108421024],[27.5,-0.29575496,13.1544966,0.108604769],[28.5,-0.32772936,13.28989667,0.108825681],[29.5,-0.36181746,13.42519408,0.109083423],[30.5,-0.39756808,13.56088113,0.109377581],[31.5,-0.43452025,13.69737858,0.109707646],[32.5,-0.47218875,13.83504622,0.110073084],[33.5,-0.51012309,13.97418199,0.110473238],[34.5,-0.54788557,14.1150324,0.1109074],[35.5,-0.5850701,14.25779618,0.111374787],[36.0,-0.60333785,14.32994444,0.111620652]], 2: [[0.0,1.509187507,3.39918645,0.142106724],[0.5,1.357944315,3.79752846,0.138075916],[1.5,1.105537708,4.544776513,0.131733888],[2.5,0.902596648,5.230584214,0.126892697],[3.5,0.734121414,5.859960798,0.123025182],[4.5,0.590235275,6.437587751,0.119840911],[5.5,0.464391566,6.967850457,0.117166868],[6.5,0.352164071,7.454854109,0.11489384],[7.5,0.250497889,7.902436186,0.112949644],[8.5,0.15724751,8.314178377,0.11128469],[9.5,0.070885725,8.693418423,0.109863709],[10.5,-0.00968493,9.043261854,0.10866078],[11.5,-0.085258,9.366593571,0.10765621],[12.5,-0.15640945,9.666089185,0.106834517],[13.5,-0.22355869,9.944226063,0.106183085],[14.5,-0.28701346,10.20329397,0.105691242],[15.5,-0.34699919,10.4454058,0.105349631],[16.5,-0.40368918,10.67250698,0.105149754],[17.5,-0.45721877,10.88638558,0.105083666],[18.5,-0.50770077,11.08868151,0.105143752],[19.5,-0.55523599,11.28089537,0.105322575],[20.5,-0.59992113,11.46439708,0.10561278],[21.5,-0.64185418,11.64043402,0.106007025],[22.5,-0.6811381,11.81013895,0.106497957],[23.5,-0.71788283,11.97453748,0.107078197],[24.5,-0.75220617,12.13455528,0.107740346],[25.5,-0.78423359,12.2910249,0.108477009],[26.5,-0.81409743,12.44469237,0.109280822],[27.5,-0.8419355,12.59622335,0.110144488],[28.5,-0.86788939,12.74620911,0.111060814],[29.5,-0.89210264,12.89517218,0.112022758],[30.5,-0.91471881,13.04357164,0.113023466],[31.5,-0.93587966,13.19180827,0.114056316],[32.5,-0.95572344,13.34022934,0.115114952],[33.5,-0.97438101,13.48913357,0.116193337],[34.5,-0.99198075,13.63877446,0.11728575],[35.5,-1.00864074,13.78936547,0.118386847],[36.0,-1.01665314,13.86507382,0.118939087]] },
  stat: { 1: [[24.0,0.941523967,86.45220101,0.040321528],[24.5,1.00720807,86.86160934,0.040395626],[25.5,0.837251351,87.65247282,0.040577525],[26.5,0.681492975,88.42326434,0.040723122],[27.5,0.538779654,89.17549228,0.040833194],[28.5,0.407697153,89.91040853,0.040909059],[29.5,0.286762453,90.62907762,0.040952433],[30.5,0.174489485,91.33242379,0.04096533],[31.5,0.069444521,92.02127167,0.040949976],[32.5,-0.029720564,92.69637946,0.040908737],[33.5,-0.124251789,93.35846546,0.040844062],[34.5,-0.215288396,94.00822923,0.040758431],[35.5,-0.30385434,94.64636981,0.040654312],[36.5,-0.390918369,95.27359106,0.04053412],[37.5,-0.254801167,95.91474929,0.040572876],[38.5,-0.125654535,96.54734328,0.04061691],[39.5,-0.00316735,97.17191309,0.040666414],[40.5,0.11291221,97.78897727,0.040721467],[41.5,0.222754969,98.3990283,0.040782045],[42.5,0.326530126,99.00254338,0.040848042],[43.5,0.42436156,99.599977,0.040919281],[44.5,0.516353108,100.191764,0.040995524],[45.5,0.602595306,100.7783198,0.041076485],[46.5,0.683170764,101.3600411,0.041161838],[47.5,0.758158406,101.9373058,0.041251224],[48.5,0.827636736,102.5104735,0.041344257],[49.5,0.891686306,103.0798852,0.041440534],[50.5,0.95039153,103.645864,0.041539635],[51.5,1.003830006,104.208713,0.041641136],[52.5,1.05213569,104.7687256,0.041744602],[53.5,1.0953669,105.3261638,0.041849607],[54.5,1.133652119,105.8812823,0.041955723],[55.5,1.167104213,106.4343146,0.042062532],[56.5,1.195845353,106.9854769,0.042169628],[57.5,1.220004233,107.534968,0.042276619],[58.5,1.239715856,108.0829695,0.042383129],[59.5,1.255121285,108.6296457,0.042488804],[60.5,1.266367398,109.1751441,0.042593311],[61.5,1.273606657,109.7195954,0.042696342],[62.5,1.276996893,110.2631136,0.042797615],[63.5,1.276701119,110.8057967,0.042896877],[64.5,1.272887366,111.3477265,0.042993904],[65.5,1.265728536,111.8889694,0.043088503],[66.5,1.255402281,112.4295761,0.043180513],[67.5,1.242090871,112.9695827,0.043269806],[68.5,1.225981067,113.5090108,0.043356287],[69.5,1.207263978,114.0478678,0.043439893],[70.5,1.186140222,114.5861486,0.043520597],[71.5,1.162796198,115.1238315,0.043598407],[72.5,1.137442868,115.6608862,0.043673359],[73.5,1.110286487,116.1972691,0.043745523],[74.5,1.081536236,116.732925,0.043815003],[75.5,1.05140374,117.2677879,0.043881929],[76.5,1.020102497,117.8017819,0.043946461],[77.5,0.987847213,118.3348215,0.044008785],[78.5,0.954853043,118.8668123,0.044069112],[79.5,0.921334742,119.397652,0.044127675],[80.5,0.887505723,119.9272309,0.044184725],[81.5,0.85357703,120.455433,0.044240532],[82.5,0.819756239,120.9821362,0.044295379],[83.5,0.786246296,121.5072136,0.044349559],[84.5,0.753244292,122.0305342,0.044403374],[85.5,0.720940222,122.5519634,0.04445713],[86.5,0.689515708,123.0713645,0.044511135],[87.5,0.659142731,123.588599,0.044565693],[88.5,0.629997853,124.1035312,0.044621104],[89.5,0.602203984,124.6160161,0.044677662],[90.5,0.575908038,125.1259182,0.044735646],[91.5,0.55123134,125.6331012,0.044795322],[92.5,0.528279901,126.1374319,0.044856941],[93.5,0.507143576,126.6387804,0.04492073],[94.5,0.487895344,127.1370217,0.044986899],[95.5,0.470590753,127.6320362,0.045055632],[96.5,0.455267507,128.1237104,0.045127088],[97.5,0.441945241,128.6119383,0.045201399],[98.5,0.430625458,129.096622,0.045278671],[99.5,0.421291648,129.5776723,0.045358979],[100.5,0.413909588,130.0550101,0.045442372],[101.5,0.408427813,130.5285669,0.045528869],[102.5,0.404778262,130.9982857,0.045618459],[103.5,0.402877077,131.4641218,0.045711105],[104.5,0.402625561,131.9260439,0.045806742],[105.5,0.40391127,132.3840348,0.045905281],[106.5,0.406609232,132.838092,0.046006604],[107.5,0.410583274,133.2882291,0.046110573],[108.5,0.415687443,133.7344759,0.046217028],[109.5,0.421767514,134.1768801,0.04632579],[110.5,0.428662551,134.6155076,0.046436662],[111.5,0.436206531,135.0504433,0.04654943],[112.5,0.44423,135.4817925,0.046663871],[113.5,0.45256176,135.9096813,0.046779748],[114.5,0.461030578,136.3342577,0.046896817],[115.5,0.469466904,136.7556923,0.047014827],[116.5,0.477704608,137.1741794,0.047133525],[117.5,0.48558272,137.5899378,0.047252654],[118.5,0.492947182,138.0032114,0.047371961],[119.5,0.499652617,138.4142703,0.047491194],[120.5,0.505564115,138.8234114,0.047610108],[121.5,0.510559047,139.2309592,0.047728463],[122.5,0.514528903,139.6372663,0.04784603],[123.5,0.517381177,140.042714,0.047962592],[124.5,0.519041285,140.4477127,0.048077942],[125.5,0.519454524,140.8527022,0.048191889],[126.5,0.518588072,141.2581515,0.048304259],[127.5,0.516433004,141.6645592,0.048414893],[128.5,0.513006312,142.072452,0.048523648],[129.5,0.508352901,142.4823852,0.048630402],[130.5,0.502547502,142.8949403,0.04873505],[131.5,0.495696454,143.3107241,0.048837504],[132.5,0.487939275,143.7303663,0.048937694],[133.5,0.479449924,144.1545167,0.049035564],[134.5,0.470437652,144.5838414,0.049131073],[135.5,0.461147305,145.0190192,0.049224189],[136.5,0.451858946,145.4607359,0.049314887],[137.5,0.442886661,145.9096784,0.049403145],[138.5,0.434576385,146.3665278,0.049488934],[139.5,0.427302633,146.8319513,0.049572216],[140.5,0.421464027,147.3065929,0.049652935],[141.5,0.417477538,147.7910635,0.049731004],[142.5,0.415771438,148.2859294,0.0498063],[143.5,0.416777012,148.7917006,0.04987865],[144.5,0.420919142,149.3088178,0.049947823],[145.5,0.428606007,149.8376391,0.050013518],[146.5,0.440218167,150.3784267,0.050075353],[147.5,0.456097443,150.9313331,0.050132858],[148.5,0.476536014,151.4963887,0.050185471],[149.5,0.501766234,152.0734897,0.050232532],[150.5,0.531951655,152.6623878,0.050273285],[151.5,0.567179725,153.2626819,0.050306885],[152.5,0.607456565,153.8738124,0.050332406],[153.5,0.652704121,154.495058,0.05034886],[154.5,0.702759868,155.1255365,0.050355216],[155.5,0.757379106,155.7642086,0.050350423],[156.5,0.816239713,156.4098858,0.050333444],[157.5,0.878947416,157.0612415,0.050303283],[158.5,0.945053486,157.7168289,0.050259018],[159.5,1.014046108,158.3750929,0.050199837],[160.5,1.085383319,159.034399,0.050125062],[161.5,1.158487278,159.6930501,0.05003418],[162.5,1.232768816,160.3493168,0.049926861],[163.5,1.307628899,161.0014586,0.049802977],[164.5,1.382473225,161.6477515,0.04966261],[165.5,1.456720479,162.2865119,0.049506051],[166.5,1.529810247,162.9161202,0.049333801],[167.5,1.601219573,163.535045,0.049146553],[168.5,1.670433444,164.1418486,0.04894519],[169.5,1.736995571,164.7352199,0.048730749],[170.5,1.800483802,165.3139755,0.048504404],[171.5,1.860518777,165.8770715,0.048267442],[172.5,1.916765525,166.4236087,0.04802123],[173.5,1.968934444,166.9528354,0.047767192],[174.5,2.016781776,167.4641466,0.047506783],[175.5,2.060109658,167.9570814,0.047241456],[176.5,2.098765817,168.4313175,0.04697265],[177.5,2.132642948,168.8866644,0.046701759],[178.5,2.16167779,169.3230548,0.046430122],[179.5,2.185849904,169.7405351,0.046159004],[180.5,2.205180153,170.139255,0.045889585],[181.5,2.219728869,170.5194567,0.045622955],[182.5,2.2295937,170.881464,0.045360101],[183.5,2.234907144,171.2256717,0.045101913],[184.5,2.235833767,171.5525345,0.044849174],[185.5,2.232567138,171.8625576,0.044602566],[186.5,2.2253265,172.1562865,0.044362674],[187.5,2.214353232,172.4342983,0.044129985],[188.5,2.199905902,172.6971935,0.043904897],[189.5,2.182262864,172.9455898,0.043687723],[190.5,2.161704969,173.180112,0.043478698],[191.5,2.138524662,173.4013896,0.043277987],[192.5,2.113023423,173.6100518,0.043085685],[193.5,2.085490286,173.8067179,0.042901835],[194.5,2.0562195,173.9919998,0.042726424],[195.5,2.025496648,174.1664951,0.042559396],[196.5,1.993598182,174.3307855,0.042400652],[197.5,1.960789092,174.4854344,0.042250063],[198.5,1.927320937,174.6309856,0.042107465],[199.5,1.89343024,174.7679617,0.041972676],[200.5,1.859337259,174.8968634,0.041845488],[201.5,1.825245107,175.0181691,0.041725679],[202.5,1.791339209,175.1323345,0.041613015],[203.5,1.757787065,175.2397926,0.041507249],[204.5,1.724738292,175.340954,0.041408129],[205.5,1.692324905,175.4362071,0.041315398],[206.5,1.660661815,175.5259191,0.041228796],[207.5,1.629847495,175.6104358,0.04114806],[208.5,1.599964788,175.690083,0.041072931],[209.5,1.571081817,175.7651671,0.04100315],[210.5,1.543252982,175.8359757,0.040938463],[211.5,1.516519998,175.9027788,0.040878617],[212.5,1.490912963,175.9658293,0.040823368],[213.5,1.466451429,176.0253641,0.040772475],[214.5,1.44314546,176.081605,0.040725706],[215.5,1.420996665,176.1347593,0.040682834],[216.5,1.399999187,176.1850208,0.04064364],[217.5,1.380140651,176.2325707,0.040607913],[218.5,1.361403047,176.2775781,0.040575448],[219.5,1.343763564,176.3202008,0.040546051],[220.5,1.327195355,176.3605864,0.040519532],[221.5,1.311668242,176.3988725,0.040495713],[222.5,1.297149359,176.4351874,0.040474421],[223.5,1.283603728,176.469651,0.040455493],[224.5,1.270994782,176.5023751,0.040438773],[225.5,1.25928483,176.533464,0.040424111],[226.5,1.248435461,176.5630153,0.040411366],[227.5,1.23840791,176.5911197,0.040400405],[228.5,1.229163362,176.6178621,0.040391101],[229.5,1.220663228,176.6433219,0.040383334],[230.5,1.212869374,176.6675729,0.04037699],[231.5,1.20574431,176.6906844,0.040371962],[232.5,1.199251356,176.712721,0.040368149],[233.5,1.19335477,176.733743,0.040365456],[234.5,1.188019859,176.753807,0.040363795],[235.5,1.183213059,176.7729657,0.04036308],[236.5,1.178901998,176.7912687,0.040363233],[237.5,1.175055543,176.8087622,0.040364179],[238.5,1.171643828,176.8254895,0.04036585],[239.5,1.16863827,176.8414914,0.04036818],[240.0,1.167279219,176.8492322,0.040369574]], 2: [[24.0,1.07244896,84.97555512,0.040791394],[24.5,1.051272912,85.3973169,0.040859727],[25.5,1.041951175,86.29026318,0.041142161],[26.5,1.012592236,87.15714182,0.041349399],[27.5,0.970541909,87.9960184,0.041500428],[28.5,0.921129988,88.8055115,0.041610508],[29.5,0.868221392,89.58476689,0.041691761],[30.5,0.81454413,90.33341722,0.04175368],[31.5,0.761957977,91.0515436,0.041803562],[32.5,0.711660228,91.7396352,0.041846882],[33.5,0.664323379,92.39854429,0.041887626],[34.5,0.620285102,93.02945392,0.041928568],[35.5,0.57955631,93.63382278,0.041971514],[36.5,0.54198094,94.21335709,0.042017509],[37.5,0.511429832,94.79643239,0.042104522],[38.5,0.482799937,95.37391918,0.042199507],[39.5,0.455521041,95.94692677,0.042300333],[40.5,0.429150288,96.51644912,0.042405225],[41.5,0.403351725,97.08337211,0.042512706],[42.5,0.377878239,97.6484807,0.042621565],[43.5,0.352555862,98.21246579,0.042730809],[44.5,0.327270297,98.77593069,0.042839638],[45.5,0.301955463,99.33939735,0.042947412],[46.5,0.276583851,99.9033122,0.043053626],[47.5,0.251158446,100.4680516,0.043157889],[48.5,0.225705996,101.033927,0.043259907],[49.5,0.20027145,101.6011898,0.043359463],[50.5,0.174913356,102.1700358,0.043456406],[51.5,0.149700081,102.7406094,0.043550638],[52.5,0.12470671,103.3130077,0.043642107],[53.5,0.100012514,103.8872839,0.043730791],[54.5,0.075698881,104.4634511,0.043816701],[55.5,0.051847635,105.0414853,0.043899867],[56.5,0.02853967,105.6213287,0.043980337],[57.5,0.005853853,106.2028921,0.044058171],[58.5,-0.016133871,106.7860583,0.04413344],[59.5,-0.037351181,107.3706841,0.044206218],[60.5,-0.057729947,107.9566031,0.044276588],[61.5,-0.077206672,108.5436278,0.044344632],[62.5,-0.09572283,109.1315521,0.044410436],[63.5,-0.113225128,109.7201531,0.044474084],[64.5,-0.129665689,110.3091934,0.044535662],[65.5,-0.145002179,110.8984228,0.044595254],[66.5,-0.159197885,111.4875806,0.044652942],[67.5,-0.172221748,112.0763967,0.044708809],[68.5,-0.184048358,112.6645943,0.044762936],[69.5,-0.194660215,113.2518902,0.044815402],[70.5,-0.204030559,113.8380006,0.044866288],[71.5,-0.212174408,114.4226317,0.044915672],[72.5,-0.219069129,115.0054978,0.044963636],[73.5,-0.224722166,115.5863089,0.045010259],[74.5,-0.229140412,116.1647782,0.045055624],[75.5,-0.232335686,116.7406221,0.045099817],[76.5,-0.234324563,117.3135622,0.045142924],[77.5,-0.235128195,117.8833259,0.045185036],[78.5,-0.234772114,118.4496481,0.045226249],[79.5,-0.233286033,119.0122722,0.045266662],[80.5,-0.230703633,119.5709513,0.045306383],[81.5,-0.227062344,120.1254495,0.045345524],[82.5,-0.222403111,120.6755427,0.045384203],[83.5,-0.216770161,121.22102,0.045422551],[84.5,-0.210210748,121.7616844,0.045460702],[85.5,-0.202774891,122.2973542,0.045498803],[86.5,-0.194515104,122.827864,0.045537012],[87.5,-0.185486099,123.3530652,0.045575495],[88.5,-0.175744476,123.8728276,0.045614432],[89.5,-0.165348396,124.38704,0.045654016],[90.5,-0.15435722,124.8956114,0.04569445],[91.5,-0.142831123,125.398472,0.045735953],[92.5,-0.130830669,125.895574,0.045778759],[93.5,-0.118416354,126.3868929,0.045823114],[94.5,-0.105648092,126.8724284,0.04586928],[95.5,-0.092584657,127.3522056,0.045917535],[96.5,-0.079283065,127.8262759,0.045968169],[97.5,-0.065797888,128.2947187,0.04602149],[98.5,-0.0521805,128.757642,0.046077818],[99.5,-0.03847825,129.2151839,0.046137487],[100.5,-0.024733545,129.6675143,0.046200842],[101.5,-0.010982868,130.1148354,0.04626824],[102.5,0.002744306,130.5573839,0.046340046],[103.5,0.016426655,130.995432,0.046416629],[104.5,0.030052231,131.4292887,0.046498361],[105.5,0.043619747,131.8593015,0.046585611],[106.5,0.05713988,132.2858574,0.046678741],[107.5,0.070636605,132.7093845,0.046778099],[108.5,0.08414848,133.1303527,0.04688401],[109.5,0.097729873,133.5492749,0.046996769],[110.5,0.111452039,133.9667073,0.047116633],[111.5,0.125404005,134.3832499,0.047243801],[112.5,0.13969316,134.7995463,0.047378413],[113.5,0.154445482,135.2162826,0.047520521],[114.5,0.169805275,135.634186,0.047670085],[115.5,0.185934346,136.0540223,0.047826946],[116.5,0.203010488,136.4765925,0.04799081],[117.5,0.2212252,136.9027281,0.048161228],[118.5,0.240780542,137.3332846,0.04833757],[119.5,0.261885086,137.7691339,0.048519011],[120.5,0.284748919,138.2111552,0.048704503],[121.5,0.309577733,138.6602228,0.048892759],[122.5,0.336566048,139.1171933,0.049082239],[123.5,0.365889711,139.5828898,0.049271137],[124.5,0.397699038,140.0580848,0.049457371],[125.5,0.432104409,140.5434787,0.049638596],[126.5,0.46917993,141.0396832,0.049812203],[127.5,0.508943272,141.5471945,0.049975355],[128.5,0.551354277,142.0663731,0.050125012],[129.5,0.596307363,142.59742,0.050257992],[130.5,0.643626542,143.1403553,0.050371024],[131.5,0.693062173,143.6949981,0.050460835],[132.5,0.744289752,144.2609497,0.050524236],[133.5,0.79691098,144.8375809,0.050558224],[134.5,0.85045728,145.4240246,0.050560083],[135.5,0.904395871,146.0191748,0.050527494],[136.5,0.958138449,146.621692,0.050458634],[137.5,1.011054559,147.2300177,0.050352269],[138.5,1.062474568,147.8423918,0.050207825],[139.5,1.111727029,148.4568879,0.050025434],[140.5,1.158135105,149.0714413,0.049805967],[141.5,1.201050821,149.6838943,0.049551023],[142.5,1.239852328,150.2920328,0.049262895],[143.5,1.274006058,150.8936469,0.048944504],[144.5,1.303044695,151.4865636,0.048599314],[145.5,1.326605954,152.0686985,0.048231224],[146.5,1.344443447,152.6380955,0.047844442],[147.5,1.356437773,153.1929631,0.047443362],[148.5,1.362602695,153.7317031,0.04703243],[149.5,1.363085725,154.2529332,0.046616026],[150.5,1.358162799,154.755501,0.046198356],[151.5,1.348227142,155.2384904,0.04578335],[152.5,1.333772923,155.7012216,0.045374597],[153.5,1.315374704,156.1432438,0.044975281],[154.5,1.293664024,156.564323,0.044588148],[155.5,1.269304678,156.9644258,0.044215488],[156.5,1.242968236,157.3436995,0.043859135],[157.5,1.21531127,157.7024507,0.04352048],[158.5,1.186955477,158.0411233,0.043200497],[159.5,1.158471522,158.3602756,0.042899776],[160.5,1.130367088,158.6605588,0.042618565],[161.5,1.103079209,158.9426964,0.042356812],[162.5,1.076970655,159.2074654,0.042114211],[163.5,1.052329922,159.455679,0.041890247],[164.5,1.029374161,159.688172,0.04168424],[165.5,1.008254396,159.9057871,0.041495379],[166.5,0.989062282,160.1093647,0.041322765],[167.5,0.971837799,160.299733,0.041165437],[168.5,0.95657215,160.4776996,0.041022401],[169.5,0.94324228,160.6440526,0.040892651],[170.5,0.931767062,160.7995428,0.040775193],[171.5,0.922058291,160.9448916,0.040669052],[172.5,0.914012643,161.0807857,0.040573288],[173.5,0.907516917,161.2078755,0.040487005],[174.5,0.902452436,161.3267744,0.040409354],[175.5,0.898698641,161.4380593,0.040339537],[176.5,0.896143482,161.5422726,0.040276811],[177.5,0.894659668,161.639917,0.040220488],[178.5,0.89413892,161.7314645,0.040169932],[179.5,0.894475371,161.8173534,0.040124562],[180.5,0.895569834,161.8979913,0.040083845],[181.5,0.897330209,161.9737558,0.040047295],[182.5,0.899671635,162.0449969,0.040014473],[183.5,0.902516442,162.1120386,0.03998498],[184.5,0.905793969,162.17518,0.039958458],[185.5,0.909440266,162.2346979,0.039934584],[186.5,0.913397733,162.2908474,0.039913066],[187.5,0.91761471,162.343864,0.039893644],[188.5,0.922045055,162.3939652,0.039876087],[189.5,0.926647697,162.4413513,0.039860185],[190.5,0.931386217,162.4862071,0.039845754],[191.5,0.93622842,162.5287029,0.039832629],[192.5,0.941145943,162.5689958,0.039820663]] },
  wt: { 1: [[24.0,-0.20615245,12.6707633,0.108125811],[24.5,-0.216501213,12.74154396,0.108166006],[25.5,-0.239790488,12.88102276,0.108274706],[26.5,-0.266315853,13.01842382,0.108421025],[27.5,-0.295754969,13.1544966,0.10860477],[28.5,-0.327729368,13.28989667,0.108825681],[29.5,-0.361817468,13.42519408,0.109083424],[30.5,-0.397568087,13.56088113,0.109377581],[31.5,-0.434520252,13.69737858,0.109707646],[32.5,-0.472188756,13.83504622,0.110073084],[33.5,-0.510116627,13.97418299,0.110473254],[34.5,-0.547885579,14.1150324,0.1109074],[35.5,-0.58507011,14.25779618,0.111374787],[36.5,-0.621319726,14.40262749,0.111874514],[37.5,-0.656295986,14.54964614,0.112405687],[38.5,-0.689735029,14.69893326,0.112967254],[39.5,-0.721410388,14.85054151,0.11355811],[40.5,-0.751175223,15.00449143,0.114176956],[41.5,-0.778904279,15.16078454,0.114822482],[42.5,-0.804515498,15.31940246,0.115493292],[43.5,-0.828003255,15.48030313,0.116187777],[44.5,-0.849380372,15.64343309,0.116904306],[45.5,-0.86869965,15.80872535,0.117641148],[46.5,-0.886033992,15.97610456,0.118396541],[47.5,-0.901507878,16.14548194,0.119168555],[48.5,-0.915241589,16.31676727,0.11995532],[49.5,-0.927377772,16.4898646,0.120754916],[50.5,-0.938069819,16.66467529,0.121565421],[51.5,-0.94747794,16.84109948,0.122384927],[52.5,-0.955765694,17.01903746,0.123211562],[53.5,-0.963096972,17.1983908,0.124043503],[54.5,-0.969633434,17.37906341,0.124878992],[55.5,-0.975532355,17.56096245,0.125716348],[56.5,-0.980937915,17.74400082,0.126554022],[57.5,-0.986006518,17.92809121,0.127390453],[58.5,-0.99086694,18.11315625,0.128224294],[59.5,-0.995644402,18.29912286,0.129054277],[60.5,-1.000453886,18.48592413,0.129879257],[61.5,-1.005399668,18.67349965,0.130698212],[62.5,-1.010575003,18.86179576,0.131510245],[63.5,-1.016061941,19.05076579,0.132314586],[64.5,-1.021931241,19.24037019,0.133110593],[65.5,-1.028242376,19.43057662,0.133897752],[66.5,-1.035043608,19.62136007,0.134675673],[67.5,-1.042372125,19.8127028,0.13544409],[68.5,-1.050254232,20.0045944,0.13620286],[69.5,-1.058705595,20.19703171,0.136951959],[70.5,-1.067731529,20.39001872,0.137691478],[71.5,-1.077321193,20.58356862,0.138421673],[72.5,-1.087471249,20.77769565,0.139142773],[73.5,-1.098152984,20.97242631,0.139855242],[74.5,-1.10933408,21.16779192,0.140559605],[75.5,-1.120974043,21.36383013,0.141256489],[76.5,-1.133024799,21.56058467,0.141946613],[77.5,-1.145431351,21.75810506,0.142630785],[78.5,-1.158132499,21.95644627,0.143309898],[79.5,-1.171061612,22.15566842,0.143984924],[80.5,-1.184141975,22.35583862,0.144656953],[81.5,-1.197307185,22.55702268,0.145327009],[82.5,-1.210475099,22.75929558,0.145996289],[83.5,-1.223565263,22.9627344,0.146666],[84.5,-1.236497304,23.16741888,0.147337375],[85.5,-1.249186293,23.37343341,0.148011715],[86.5,-1.261555446,23.58086145,0.148690256],[87.5,-1.273523619,23.78979096,0.149374297],[88.5,-1.285013783,24.00031064,0.150065107],[89.5,-1.295952066,24.21251028,0.150763933],[90.5,-1.306268473,24.42648043,0.151471982],[91.5,-1.31589753,24.642312,0.152190413],[92.5,-1.324778843,24.86009596,0.152920322],[93.5,-1.332857581,25.07992303,0.153662731],[94.5,-1.340080195,25.30188584,0.154418635],[95.5,-1.346412105,25.52606977,0.155188768],[96.5,-1.351813296,25.75256528,0.155973912],[97.5,-1.356253969,25.9814599,0.156774684],[98.5,-1.359710858,26.2128399,0.157591579],[99.5,-1.362167159,26.44679027,0.158424964],[100.5,-1.363612378,26.68339457,0.159275071],[101.5,-1.364042106,26.92273494,0.160141995],[102.5,-1.363457829,27.16489199,0.161025689],[103.5,-1.361865669,27.40994539,0.161925976],[104.5,-1.35928261,27.65796978,0.162842452],[105.5,-1.355720571,27.90904433,0.163774719],[106.5,-1.351202536,28.16324264,0.164722138],[107.5,-1.345754408,28.42063744,0.165683945],[108.5,-1.339405453,28.68130005,0.166659247],[109.5,-1.332188093,28.94530029,0.167647017],[110.5,-1.324137479,29.21270645,0.168646104],[111.5,-1.315291073,29.48358527,0.169655235],[112.5,-1.30568824,29.75800198,0.170673022],[113.5,-1.295369867,30.03602021,0.17169797],[114.5,-1.284374967,30.31770417,0.17272854],[115.5,-1.272750864,30.60311107,0.173762961],[116.5,-1.260539193,30.89230072,0.174799493],[117.5,-1.247783611,31.18532984,0.175836284],[118.5,-1.234527763,31.48225315,0.176871417],[119.5,-1.220815047,31.78312329,0.177902912],[120.5,-1.206688407,32.08799062,0.17892874],[121.5,-1.19219015,32.39690313,0.17994683],[122.5,-1.177361786,32.7099062,0.180955078],[123.5,-1.162243894,33.02704244,0.181951361],[124.5,-1.146876007,33.34835148,0.182933537],[125.5,-1.131296524,33.67386973,0.183899465],[126.5,-1.115542634,34.00363017,0.184847006],[127.5,-1.099650267,34.33766207,0.185774041],[128.5,-1.083654055,34.67599076,0.18667847],[129.5,-1.067587314,35.01863732,0.187558229],[130.5,-1.051482972,35.36561737,0.18841128],[131.5,-1.035367321,35.71694723,0.189235738],[132.5,-1.019277299,36.07262569,0.190029545],[133.5,-1.003235326,36.43265996,0.190790973],[134.5,-0.987269866,36.79704392,0.191518224],[135.5,-0.971406609,37.1657671,0.192209619],[136.5,-0.955670107,37.53881268,0.192863569],[137.5,-0.940083834,37.91615721,0.193478582],[138.5,-0.924670244,38.2977703,0.194053274],[139.5,-0.909450843,38.6836143,0.194586368],[140.5,-0.894446258,39.07364401,0.195076705],[141.5,-0.879676305,39.46780643,0.195523246],[142.5,-0.865160071,39.86604044,0.195925079],[143.5,-0.850915987,40.26827652,0.196281418],[144.5,-0.836961905,40.67443658,0.196591612],[145.5,-0.823315176,41.08443363,0.19685514],[146.5,-0.809992726,41.49817164,0.19707162],[147.5,-0.797011132,41.91554528,0.197240806],[148.5,-0.784386693,42.33643978,0.197362591],[149.5,-0.772135506,42.76073078,0.197437004],[150.5,-0.760273528,43.18828419,0.19746421],[151.5,-0.748815968,43.61895703,0.197444522],[152.5,-0.737780398,44.0525931,0.197378345],[153.5,-0.727181568,44.48903027,0.197266263],[154.5,-0.717035494,44.92809483,0.197108968],[155.5,-0.707358338,45.36960315,0.196907274],[156.5,-0.698166437,45.81336172,0.196662115],[157.5,-0.689476327,46.25916729,0.196374538],[158.5,-0.68130475,46.70680701,0.196045701],[159.5,-0.673668658,47.15605863,0.195676862],[160.5,-0.666585194,47.60669074,0.19526938],[161.5,-0.660069969,48.05846572,0.19482473],[162.5,-0.654142602,48.51113138,0.19434441],[163.5,-0.648819666,48.96443224,0.193830046],[164.5,-0.644118611,49.41810374,0.193283319],[165.5,-0.640056805,49.87187409,0.192705974],[166.5,-0.636651424,50.32546478,0.192099812],[167.5,-0.633919328,50.77859121,0.191466681],[168.5,-0.631876912,51.23096332,0.190808471],[169.5,-0.63053994,51.68228625,0.190127105],[170.5,-0.629923353,52.13226113,0.18942453],[171.5,-0.630041066,52.58058583,0.188702714],[172.5,-0.630905733,53.02695588,0.187963636],[173.5,-0.632528509,53.47106525,0.187209281],[174.5,-0.634918779,53.91260737,0.18644163],[175.5,-0.638083884,54.35127608,0.185662657],[176.5,-0.642028835,54.78676659,0.184874323],[177.5,-0.646756013,55.21877657,0.184078567],[178.5,-0.652262297,55.64701131,0.183277339],[179.5,-0.658551638,56.07116407,0.182472427],[180.5,-0.665609025,56.49095862,0.181665781],[181.5,-0.673425951,56.90610886,0.18085918],[182.5,-0.681987284,57.31634059,0.180054395],[183.5,-0.691273614,57.72138846,0.179253153],[184.5,-0.701261055,58.12099696,0.178457127],[185.5,-0.711921092,58.51492143,0.177667942],[186.5,-0.723218488,58.90293208,0.176887192],[187.5,-0.735121189,59.28479948,0.176116307],[188.5,-0.747580416,59.66032626,0.175356814],[189.5,-0.760550666,60.02931704,0.174610071],[190.5,-0.773984558,60.39158721,0.173877336],[191.5,-0.787817728,60.74698785,0.173159953],[192.5,-0.801993069,61.09536847,0.172459052],[193.5,-0.816446409,61.43660077,0.171775726],[194.5,-0.831110299,61.77057372,0.171110986],[195.5,-0.845914498,62.09719399,0.170465756],[196.5,-0.860786514,62.41638628,0.169840869],[197.5,-0.875652181,62.72809362,0.169237063],[198.5,-0.890436283,63.03227756,0.168654971],[199.5,-0.905063185,63.32891841,0.168095124],[200.5,-0.91945749,63.61801537,0.16755794],[201.5,-0.933544683,63.89958662,0.167043722],[202.5,-0.947251765,64.17366943,0.166552654],[203.5,-0.960507855,64.44032016,0.166084798],[204.5,-0.973244762,64.69961427,0.16564009],[205.5,-0.985397502,64.95164625,0.165218341],[206.5,-0.996904762,65.1965295,0.164819236],[207.5,-1.007705555,65.43440186,0.16444238],[208.5,-1.017756047,65.66540015,0.164087103],[209.5,-1.027002713,65.88970117,0.163752791],[210.5,-1.035402243,66.10749114,0.163438661],[211.5,-1.042916356,66.31897311,0.163143825],[212.5,-1.049511871,66.52436618,0.162867311],[213.5,-1.055160732,66.72390443,0.162608072],[214.5,-1.059840019,66.91783563,0.162365006],[215.5,-1.063531973,67.10641956,0.162136973],[216.5,-1.066224038,67.28992603,0.161922819],[217.5,-1.067908908,67.46863255,0.161721398],[218.5,-1.068589885,67.64281378,0.16153153],[219.5,-1.068261146,67.8127675,0.161352313],[220.5,-1.066933756,67.97877331,0.161182785],[221.5,-1.064620976,68.14111022,0.161022184],[222.5,-1.061341755,68.30004741,0.160869943],[223.5,-1.057116957,68.4558454,0.160725793],[224.5,-1.051988979,68.60872174,0.160589574],[225.5,-1.04599033,68.75889263,0.1604617],[226.5,-1.039168248,68.90653028,0.160342924],[227.5,-1.031579574,69.05176427,0.160234478],[228.5,-1.023291946,69.19467288,0.160138158],[229.5,-1.014385118,69.33527376,0.160056393],[230.5,-1.004952366,69.47351373,0.159992344],[231.5,-0.995101924,69.60925782,0.159949989],[232.5,-0.984958307,69.74227758,0.159934231],[233.5,-0.974663325,69.87223885,0.159951004],[234.5,-0.964376555,69.99868896,0.160007394],[235.5,-0.954274945,70.12104381,0.160111769],[236.5,-0.944551187,70.23857482,0.160273918],[237.5,-0.935410427,70.35039626,0.160505203],[238.5,-0.927059784,70.45546105,0.160818788],[239.5,-0.919718461,70.55252127,0.161229617],[240.0,-0.91648762,70.59761453,0.161476792]], 2: [[24.0,-0.73533951,12.05503983,0.107399495],[24.5,-0.75220657,12.13455523,0.107740345],[25.5,-0.78423366,12.2910249,0.10847701],[26.5,-0.81409582,12.44469258,0.109280828],[27.5,-0.841935504,12.59622335,0.110144488],[28.5,-0.867889398,12.74620911,0.111060815],[29.5,-0.892102647,12.89517218,0.112022759],[30.5,-0.914718817,13.04357164,0.113023467],[31.5,-0.935876584,13.19180874,0.114056328],[32.5,-0.955723447,13.34022934,0.115114953],[33.5,-0.974383363,13.48913319,0.116193327],[34.5,-0.991980756,13.63877446,0.11728575],[35.5,-1.008640742,13.78936547,0.118386848],[36.5,-1.024471278,13.94108332,0.119491669],[37.5,-1.039573604,14.09407175,0.120595658],[38.5,-1.054039479,14.24844498,0.121694676],[39.5,-1.067946784,14.40429169,0.12278503],[40.5,-1.081374153,14.56167529,0.1238634],[41.5,-1.094381409,14.72064045,0.124926943],[42.5,-1.107021613,14.88121352,0.125973221],[43.5,-1.119338692,15.04340553,0.127000212],[44.5,-1.131367831,15.20721443,0.128006292],[45.5,-1.143135936,15.37262729,0.128990225],[46.5,-1.15466215,15.53962221,0.129951143],[47.5,-1.165958392,15.70817017,0.130888527],[48.5,-1.177029925,15.87823668,0.131802186],[49.5,-1.187871001,16.04978452,0.132692269],[50.5,-1.198484073,16.2227706,0.133559108],[51.5,-1.208853947,16.39715363,0.134403386],[52.5,-1.218965087,16.57289122,0.13522599],[53.5,-1.228798212,16.74994187,0.136028014],[54.5,-1.238330855,16.92826587,0.136810739],[55.5,-1.247537914,17.10782615,0.137575606],[56.5,-1.256392179,17.28858894,0.138324193],[57.5,-1.264864846,17.47052444,0.139058192],[58.5,-1.272926011,17.65360733,0.139779387],[59.5,-1.28054514,17.83781722,0.140489635],[60.5,-1.287691525,18.02313904,0.141190842],[61.5,-1.294332076,18.20956418,0.141884974],[62.5,-1.300441561,18.3970876,0.142573939],[63.5,-1.305989011,18.58571243,0.143259709],[64.5,-1.310946941,18.77544728,0.143944216],[65.5,-1.315289534,18.966307,0.144629359],[66.5,-1.318992925,19.15831267,0.14531699],[67.5,-1.322035315,19.35149163,0.146008903],[68.5,-1.324398133,19.54587708,0.146706813],[69.5,-1.326064539,19.74150854,0.147412363],[70.5,-1.327020415,19.93843145,0.148127109],[71.5,-1.327256387,20.13669623,0.148852482],[72.5,-1.326763834,20.33635961,0.149589838],[73.5,-1.325538668,20.53748298,0.1503404],[74.5,-1.323579654,20.74013277,0.151105277],[75.5,-1.320888012,20.94438028,0.151885464],[76.5,-1.317468695,21.15030093,0.152681819],[77.5,-1.313331446,21.35797332,0.15349505],[78.5,-1.308487081,21.56748045,0.154325756],[79.5,-1.302948173,21.77890902,0.155174414],[80.5,-1.296733913,21.99234686,0.15604132],[81.5,-1.289863329,22.20788541,0.156926667],[82.5,-1.282358762,22.4256177,0.157830504],[83.5,-1.274244931,22.64563824,0.158752743],[84.5,-1.265548787,22.86804258,0.159693163],[85.5,-1.256299378,23.09292679,0.16065141],[86.5,-1.24653066,23.32038549,0.161626956],[87.5,-1.236266832,23.55051871,0.162619308],[88.5,-1.225551344,23.78341652,0.1636276],[89.5,-1.214410914,24.01917703,0.1646511],[90.5,-1.202884389,24.25789074,0.165688808],[91.5,-1.191007906,24.49964778,0.166739662],[92.5,-1.178818621,24.74453536,0.167802495],[93.5,-1.166354376,24.99263735,0.168876037],[94.5,-1.153653688,25.24403371,0.169958922],[95.5,-1.140751404,25.49880264,0.171049756],[96.5,-1.127684095,25.7570168,0.172147043],[97.5,-1.114490244,26.01874261,0.173249185],[98.5,-1.101204848,26.28404312,0.174354569],[99.5,-1.087863413,26.55297507,0.175461512],[100.5,-1.074500927,26.82558904,0.176568284],[101.5,-1.061151213,27.1019295,0.177673124],[102.5,-1.047847141,27.38203422,0.178774242],[103.5,-1.034620551,27.66593402,0.179869829],[104.5,-1.021502197,27.9536524,0.180958063],[105.5,-1.008521695,28.24520531,0.182037118],[106.5,-0.995707494,28.54060085,0.183105172],[107.5,-0.983086844,28.83983907,0.18416041],[108.5,-0.970685789,29.14291171,0.185201039],[109.5,-0.958529157,29.44980208,0.186225287],[110.5,-0.946640568,29.76048479,0.187231416],[111.5,-0.935042447,30.0749257,0.188217723],[112.5,-0.923756041,30.39308176,0.18918255],[113.5,-0.912801445,30.71490093,0.190124286],[114.5,-0.902197638,31.0403221,0.191041375],[115.5,-0.891962513,31.36927506,0.191932319],[116.5,-0.882112919,31.7016805,0.192795682],[117.5,-0.872664706,32.03744999,0.193630095],[118.5,-0.863632768,32.37648607,0.19443426],[119.5,-0.855031092,32.71868225,0.195206948],[120.5,-0.846872805,33.06392318,0.195947008],[121.5,-0.839170224,33.4120847,0.196653365],[122.5,-0.831934903,33.76303402,0.197325023],[123.5,-0.825177688,34.1166299,0.197961065],[124.5,-0.818908758,34.47272283,0.198560655],[125.5,-0.813137675,34.83115524,0.199123037],[126.5,-0.807873433,35.19176177,0.199647538],[127.5,-0.803122613,35.55437176,0.200133598],[128.5,-0.79889771,35.91879976,0.200580618],[129.5,-0.795203499,36.28486194,0.200988216],[130.5,-0.792047959,36.65236365,0.201356017],[131.5,-0.789435274,37.02110818,0.201683791],[132.5,-0.787374433,37.39088668,0.201971282],[133.5,-0.785870695,37.76148905,0.202218375],[134.5,-0.784929893,38.1326991,0.202425006],[135.5,-0.784557605,38.50429603,0.202591183],[136.5,-0.78475917,38.87605489,0.20271698],[137.5,-0.785539703,39.24774707,0.202802535],[138.5,-0.786904102,39.61914076,0.202848049],[139.5,-0.788858208,39.98999994,0.202853758],[140.5,-0.791403051,40.36009244,0.202820053],[141.5,-0.794546352,40.72917544,0.202747236],[142.5,-0.79829102,41.09701099,0.202635758],[143.5,-0.802640891,41.46335907,0.202486098],[144.5,-0.807599577,41.82797963,0.202298783],[145.5,-0.813170461,42.19063313,0.202074385],[146.5,-0.819356692,42.55108107,0.201813521],[147.5,-0.826161176,42.90908653,0.201516851],[148.5,-0.833586038,43.2644155,0.201185082],[149.5,-0.841634949,43.61683402,0.200818928],[150.5,-0.850307441,43.9661169,0.200419208],[151.5,-0.859607525,44.31203579,0.199986681],[152.5,-0.869534339,44.65437319,0.199522233],[153.5,-0.880088651,44.99291356,0.199026736],[154.5,-0.891270585,45.32744704,0.198501096],[155.5,-0.903079458,45.65777013,0.197946255],[156.5,-0.915513542,45.98368656,0.197363191],[157.5,-0.928569454,46.30500858,0.196752931],[158.5,-0.942245864,46.62155183,0.196116472],[159.5,-0.956537923,46.93314404,0.19545489],[160.5,-0.971440492,47.23962058,0.194769279],[161.5,-0.986947308,47.54082604,0.194060758],[162.5,-1.003050887,47.83661466,0.193330477],[163.5,-1.019742425,48.12685082,0.192579614],[164.5,-1.037011698,48.41140938,0.191809374],[165.5,-1.054846957,48.69017613,0.191020995],[166.5,-1.073234825,48.9630481,0.190215739],[167.5,-1.092160195,49.22993391,0.189394901],[168.5,-1.111606122,49.49075409,0.188559804],[169.5,-1.131553723,49.74544132,0.187711798],[170.5,-1.151982079,49.99394068,0.186852266],[171.5,-1.172868141,50.23620985,0.185982617],[172.5,-1.19418462,50.47222213,0.185104331],[173.5,-1.215907492,50.70195581,0.184218803],[174.5,-1.238005268,50.92540942,0.183327556],[175.5,-1.260445591,51.14259229,0.182432113],[176.5,-1.283193626,51.3535268,0.181534018],[177.5,-1.306212032,51.55824831,0.180634839],[178.5,-1.329460945,51.75680513,0.179736168],[179.5,-1.35289798,51.94925841,0.178839614],[180.5,-1.376478254,52.13568193,0.177946804],[181.5,-1.400154426,52.31616197,0.177059379],[182.5,-1.423876772,52.49079703,0.17617899],[183.5,-1.447593267,52.65969757,0.175307296],[184.5,-1.471249702,52.82298572,0.174445958],[185.5,-1.494789826,52.9807949,0.173596636],[186.5,-1.518155513,53.13326946,0.172760982],[187.5,-1.541286949,53.28056425,0.17194064],[188.5,-1.564122852,53.42284417,0.171137232]] },
  bmi: { 1: [[24.0,-2.01118107,16.57502768,0.080592465],[24.5,-1.982373595,16.54777487,0.080127429],[25.5,-1.924100169,16.49442763,0.079233994],[26.5,-1.86549793,16.44259552,0.078389356],[27.5,-1.807261899,16.3922434,0.077593501],[28.5,-1.750118905,16.34333654,0.076846462],[29.5,-1.69481584,16.29584097,0.076148308],[30.5,-1.642106779,16.24972371,0.075499126],[31.5,-1.592744414,16.20495268,0.074898994],[32.5,-1.547442391,16.16149871,0.074347997],[33.5,-1.506902601,16.11933258,0.073846139],[34.5,-1.471770047,16.07842758,0.07339337],[35.5,-1.442628957,16.03875896,0.072989551],[36.5,-1.419991255,16.00030401,0.072634432],[37.5,-1.404277619,15.96304277,0.072327649],[38.5,-1.39586317,15.92695418,0.07206864],[39.5,-1.394935252,15.89202582,0.071856805],[40.5,-1.401671596,15.85824093,0.071691278],[41.5,-1.416100312,15.82558822,0.071571093],[42.5,-1.438164899,15.79405728,0.071495113],[43.5,-1.467669032,15.76364255,0.071462106],[44.5,-1.504376347,15.73433668,0.071470646],[45.5,-1.547942838,15.70613566,0.071519218],[46.5,-1.597896397,15.67904062,0.071606277],[47.5,-1.653732283,15.65305192,0.071730167],[48.5,-1.714869347,15.62817269,0.071889214],[49.5,-1.780673181,15.604408,0.072081737],[50.5,-1.850468473,15.58176458,0.072306081],[51.5,-1.923551865,15.56025067,0.072560637],[52.5,-1.999220429,15.5398746,0.07284384],[53.5,-2.076707178,15.52064993,0.073154324],[54.5,-2.155348017,15.50258427,0.073490667],[55.5,-2.234438552,15.48568973,0.073851672],[56.5,-2.313321723,15.46997718,0.074236235],[57.5,-2.391381273,15.45545692,0.074643374],[58.5,-2.468032491,15.44213961,0.075072264],[59.5,-2.542781541,15.43003207,0.075522104],[60.5,-2.61516595,15.41914163,0.07599225],[61.5,-2.684789516,15.40947356,0.076482128],[62.5,-2.751316949,15.40103139,0.076991232],[63.5,-2.81445945,15.39381785,0.077519149],[64.5,-2.87402476,15.38783094,0.07806539],[65.5,-2.92984048,15.38306945,0.078629592],[66.5,-2.981796828,15.37952958,0.079211369],[67.5,-3.029831343,15.37720582,0.079810334],[68.5,-3.073924224,15.37609107,0.080426086],[69.5,-3.114093476,15.37617677,0.081058206],[70.5,-3.15039004,15.37745304,0.081706249],[71.5,-3.182893018,15.37990886,0.082369741],[72.5,-3.21170511,15.38353217,0.083048178],[73.5,-3.23694834,15.38831005,0.083741021],[74.5,-3.25876011,15.39422883,0.0844477],[75.5,-3.277281546,15.40127496,0.085167651],[76.5,-3.292683774,15.40943252,0.085900184],[77.5,-3.305124073,15.41868691,0.086644667],[78.5,-3.314768951,15.42902273,0.087400421],[79.5,-3.321785992,15.44042439,0.088166744],[80.5,-3.326345795,15.45287581,0.088942897],[81.5,-3.328602731,15.46636218,0.089728202],[82.5,-3.328725277,15.48086704,0.090521875],[83.5,-3.32687018,15.49637465,0.091323162],[84.5,-3.323188896,15.51286936,0.092131305],[85.5,-3.317827016,15.53033563,0.092945544],[86.5,-3.310923871,15.54875807,0.093765118],[87.5,-3.302612272,15.56812143,0.09458927],[88.5,-3.293018361,15.58841065,0.095417247],[89.5,-3.282260813,15.60961101,0.096248301],[90.5,-3.270454609,15.63170735,0.097081694],[91.5,-3.257703616,15.65468563,0.097916698],[92.5,-3.244108214,15.67853139,0.098752593],[93.5,-3.229761713,15.70323052,0.099588675],[94.5,-3.214751287,15.72876911,0.100424251],[95.5,-3.199158184,15.75513347,0.101258643],[96.5,-3.18305795,15.78231007,0.102091189],[97.5,-3.166520664,15.8102856,0.102921245],[98.5,-3.1496103,15.83904708,0.103748189],[99.5,-3.132389637,15.86858123,0.104571386],[100.5,-3.114911153,15.89887562,0.105390269],[101.5,-3.097226399,15.92991765,0.106204258],[102.5,-3.079383079,15.96169481,0.107012788],[103.5,-3.061423765,15.99419489,0.107815327],[104.5,-3.043386071,16.02740607,0.108611374],[105.5,-3.025310003,16.0613159,0.109400388],[106.5,-3.007225737,16.09591292,0.110181915],[107.5,-2.989164598,16.13118532,0.110955478],[108.5,-2.971148225,16.16712234,0.111720691],[109.5,-2.953208047,16.20371168,0.112477059],[110.5,-2.935363951,16.24094239,0.1132242],[111.5,-2.917635157,16.27880346,0.113961734],[112.5,-2.900039803,16.31728385,0.114689291],[113.5,-2.882593796,16.35637267,0.115406523],[114.5,-2.865311266,16.39605916,0.116113097],[115.5,-2.848204697,16.43633265,0.116808702],[116.5,-2.831285052,16.47718256,0.117493042],[117.5,-2.81456189,16.51859843,0.11816584],[118.5,-2.79804347,16.56056987,0.118826835],[119.5,-2.781736856,16.60308661,0.119475785],[120.5,-2.765648008,16.64613844,0.120112464],[121.5,-2.749782197,16.68971518,0.120736656],[122.5,-2.734142443,16.73380695,0.121348181],[123.5,-2.718732873,16.77840363,0.121946849],[124.5,-2.703555506,16.82349538,0.122532501],[125.5,-2.688611957,16.86907238,0.123104991],[126.5,-2.673903164,16.91512487,0.123664186],[127.5,-2.659429443,16.96164317,0.124209969],[128.5,-2.645190534,17.00861766,0.124742239],[129.5,-2.631185649,17.05603879,0.125260905],[130.5,-2.617413511,17.10389705,0.125765895],[131.5,-2.603872392,17.15218302,0.126257147],[132.5,-2.590560148,17.20088732,0.126734613],[133.5,-2.577474253,17.25000062,0.12719826],[134.5,-2.564611831,17.29951367,0.127648067],[135.5,-2.551969684,17.34941726,0.128084023],[136.5,-2.539539972,17.39970308,0.128506192],[137.5,-2.527325681,17.45036072,0.128914497],[138.5,-2.515320235,17.50138161,0.129309001],[139.5,-2.503519447,17.55275674,0.129689741],[140.5,-2.491918934,17.60447714,0.130056765],[141.5,-2.480514136,17.6565339,0.130410133],[142.5,-2.469300331,17.70891811,0.130749913],[143.5,-2.458272656,17.76162094,0.131076187],[144.5,-2.447426113,17.81463359,0.131389042],[145.5,-2.436755595,17.86794729,0.131688579],[146.5,-2.426255887,17.92155332,0.131974905],[147.5,-2.415921689,17.97544299,0.132248138],[148.5,-2.405747619,18.02960765,0.132508403],[149.5,-2.395728233,18.08403868,0.132755834],[150.5,-2.385858029,18.1387275,0.132990575],[151.5,-2.376131459,18.19366555,0.133212776],[152.5,-2.366542942,18.24884431,0.133422595],[153.5,-2.357086871,18.3042553,0.133620197],[154.5,-2.347757625,18.35989003,0.133805756],[155.5,-2.338549576,18.41574009,0.133979452],[156.5,-2.3294571,18.47179706,0.13414147],[157.5,-2.320474586,18.52805255,0.134292005],[158.5,-2.311596446,18.5844982,0.134431256],[159.5,-2.302817124,18.64112567,0.134559427],[160.5,-2.294131107,18.69792663,0.134676731],[161.5,-2.285532933,18.75489278,0.134783385],[162.5,-2.277017201,18.81201584,0.134879611],[163.5,-2.268578584,18.86928753,0.134965637],[164.5,-2.260211837,18.92669959,0.135041695],[165.5,-2.251911809,18.98424378,0.135108024],[166.5,-2.243673453,19.04191185,0.135164867],[167.5,-2.235491842,19.09969557,0.135212469],[168.5,-2.227362173,19.15758672,0.135251083],[169.5,-2.21927979,19.21557707,0.135280963],[170.5,-2.211240187,19.27365839,0.135302371],[171.5,-2.203239029,19.33182247,0.135315568],[172.5,-2.195272161,19.39006106,0.135320824],[173.5,-2.187335625,19.44836594,0.135318407],[174.5,-2.179425674,19.50672885,0.135308594],[175.5,-2.171538789,19.56514153,0.135291662],[176.5,-2.163671689,19.62359571,0.135267891],[177.5,-2.155821357,19.6820831,0.135237567],[178.5,-2.147985046,19.74059538,0.135200976],[179.5,-2.140160305,19.7991242,0.135158409],[180.5,-2.132344989,19.85766121,0.135110159],[181.5,-2.124537282,19.916198,0.135056522],[182.5,-2.116735712,19.97472615,0.134997797],[183.5,-2.108939167,20.03323719,0.134934285],[184.5,-2.10114692,20.09172262,0.134866291],[185.5,-2.093358637,20.15017387,0.134794121],[186.5,-2.085574403,20.20858236,0.134718085],[187.5,-2.077794735,20.26693944,0.134638494],[188.5,-2.070020599,20.32523642,0.134555663],[189.5,-2.062253431,20.38346455,0.13446991],[190.5,-2.054495145,20.44161501,0.134381553],[191.5,-2.046748156,20.49967894,0.134290916],[192.5,-2.039015385,20.5576474,0.134198323],[193.5,-2.031300282,20.6155114,0.134104101],[194.5,-2.023606828,20.67326189,0.134008581],[195.5,-2.015942013,20.73088905,0.133912066],[196.5,-2.008305745,20.7883851,0.133814954],[197.5,-2.000706389,20.84574003,0.133717552],[198.5,-1.993150137,20.90294449,0.1336202],[199.5,-1.985643741,20.95998909,0.133523244],[200.5,-1.97819451,21.01686433,0.133427032],[201.5,-1.970810308,21.07356067,0.133331914],[202.5,-1.96349954,21.1300685,0.133238245],[203.5,-1.956271141,21.18637813,0.133146383],[204.5,-1.949134561,21.24247982,0.13305669],[205.5,-1.942099744,21.29836376,0.132969531],[206.5,-1.935177101,21.35402009,0.132885274],[207.5,-1.92837748,21.40943891,0.132804292],[208.5,-1.921712136,21.46461026,0.132726962],[209.5,-1.915192685,21.51952414,0.132653664],[210.5,-1.908831065,21.57417053,0.132584784],[211.5,-1.902639482,21.62853937,0.132520711],[212.5,-1.896630358,21.68262062,0.132461838],[213.5,-1.890816268,21.73640419,0.132408563],[214.5,-1.885209876,21.78988003,0.132361289],[215.5,-1.879823505,21.84303819,0.132320427],[216.5,-1.874670324,21.8958685,0.132286382],[217.5,-1.869760299,21.94836168,0.1322596],[218.5,-1.865113245,22.00050569,0.132240418],[219.5,-1.860734944,22.05229242,0.13222933],[220.5,-1.85663384,22.10371305,0.132226801],[221.5,-1.852827186,22.15475603,0.132233201],[222.5,-1.849323204,22.20541249,0.132248993],[223.5,-1.846131607,22.255673,0.132274625],[224.5,-1.843261294,22.30552831,0.132310549],[225.5,-1.840720248,22.3549693,0.132357221],[226.5,-1.83851544,22.40398706,0.132415103],[227.5,-1.83665586,22.45257182,0.132484631],[228.5,-1.835138046,22.50071778,0.132566359],[229.5,-1.833972004,22.54841437,0.132660699],[230.5,-1.833157751,22.59565422,0.132768153],[231.5,-1.83269562,22.64242956,0.132889211],[232.5,-1.832584342,22.68873292,0.133024368],[233.5,-1.832820974,22.73455713,0.133174129],[234.5,-1.833400825,22.7798953,0.133338999],[235.5,-1.834317405,22.82474087,0.133519496],[236.5,-1.83555752,22.86908912,0.133716192],[237.5,-1.837119466,22.91293151,0.133929525],[238.5,-1.838987063,22.95626373,0.134160073],[239.5,-1.841146139,22.99908062,0.134408381],[240.0,-1.84233016,23.02029424,0.134539365],[240.5,-1.843580575,23.04137734,0.134675001]], 2: [[24.0,-0.98660853,16.42339664,0.085451785],[24.5,-1.024496827,16.38804056,0.085025838],[25.5,-1.102698353,16.3189719,0.084214052],[26.5,-1.18396635,16.25207985,0.083455124],[27.5,-1.268071036,16.18734669,0.082748284],[28.5,-1.354751525,16.12475448,0.082092737],[29.5,-1.443689692,16.06428762,0.081487717],[30.5,-1.53454192,16.00593001,0.080932448],[31.5,-1.626928093,15.94966631,0.080426175],[32.5,-1.720434829,15.89548197,0.079968176],[33.5,-1.814635262,15.84336179,0.079557735],[34.5,-1.909076262,15.79329146,0.079194187],[35.5,-2.003296102,15.7452564,0.078876895],[36.5,-2.096828937,15.69924188,0.078605255],[37.5,-2.189211877,15.65523282,0.078378696],[38.5,-2.279991982,15.61321371,0.078196674],[39.5,-2.368732949,15.57316843,0.078058667],[40.5,-2.455021314,15.53508019,0.077964169],[41.5,-2.538471972,15.49893145,0.077912684],[42.5,-2.618732901,15.46470384,0.077903716],[43.5,-2.695488973,15.43237817,0.077936763],[44.5,-2.768464816,15.40193436,0.078011309],[45.5,-2.837426693,15.37335154,0.078126817],[46.5,-2.902178205,15.34660842,0.078282739],[47.5,-2.962580386,15.32168181,0.078478449],[48.5,-3.018521987,15.29854897,0.078713325],[49.5,-3.069936555,15.27718618,0.078986694],[50.5,-3.116795864,15.2575692,0.079297841],[51.5,-3.159107331,15.23967338,0.079646006],[52.5,-3.196911083,15.22347371,0.080030389],[53.5,-3.230276759,15.20894491,0.080450145],[54.5,-3.259300182,15.19606152,0.080904391],[55.5,-3.284099963,15.18479799,0.081392203],[56.5,-3.30481415,15.17512871,0.081912623],[57.5,-3.321596954,15.16702811,0.082464661],[58.5,-3.334615646,15.16047068,0.083047295],[59.5,-3.344047622,15.15543107,0.083659478],[60.5,-3.35007771,15.15188405,0.084300139],[61.5,-3.352893805,15.14980479,0.0849682],[62.5,-3.352691376,15.14916825,0.085662539],[63.5,-3.34966438,15.14994984,0.086382035],[64.5,-3.343998803,15.15212585,0.087125591],[65.5,-3.335889574,15.15567186,0.087892047],[66.5,-3.325522491,15.16056419,0.088680264],[67.5,-3.31307846,15.16677947,0.089489106],[68.5,-3.298732648,15.17429464,0.090317434],[69.5,-3.282653831,15.18308694,0.091164117],[70.5,-3.265003896,15.1931339,0.092028028],[71.5,-3.245937506,15.20441335,0.092908048],[72.5,-3.225606516,15.21690296,0.093803033],[73.5,-3.204146115,15.2305815,0.094711916],[74.5,-3.181690237,15.24542745,0.095633595],[75.5,-3.158363475,15.26141966,0.096566992],[76.5,-3.134282833,15.27853728,0.097511046],[77.5,-3.109557879,15.29675967,0.09846471],[78.5,-3.084290931,15.31606644,0.099426955],[79.5,-3.058577292,15.33643745,0.100396769],[80.5,-3.032505499,15.35785274,0.101373159],[81.5,-3.0061576,15.38029261,0.10235515],[82.5,-2.979609448,15.40373754,0.103341788],[83.5,-2.952930993,15.42816819,0.104332139],[84.5,-2.926186592,15.45356545,0.105325289],[85.5,-2.899435307,15.47991037,0.106320346],[86.5,-2.872731211,15.50718419,0.10731644],[87.5,-2.846123683,15.53536829,0.108312721],[88.5,-2.819657704,15.56444426,0.109308364],[89.5,-2.793374145,15.5943938,0.110302563],[90.5,-2.767310047,15.6251988,0.111294537],[91.5,-2.741498897,15.65684126,0.112283526],[92.5,-2.715970894,15.68930333,0.113268793],[93.5,-2.690753197,15.7225673,0.114249622],[94.5,-2.665870146,15.75661555,0.115225321],[95.5,-2.641343436,15.79143062,0.116195218],[96.5,-2.617192204,15.82699517,0.117158667],[97.5,-2.593430614,15.86329241,0.118115073],[98.5,-2.570076037,15.90030484,0.119063807],[99.5,-2.547141473,15.93801545,0.12000429],[100.5,-2.524635245,15.97640787,0.120935994],[101.5,-2.502569666,16.01546483,0.121858355],[102.5,-2.48095189,16.05516984,0.12277087],[103.5,-2.459785573,16.09550688,0.123673085],[104.5,-2.439080117,16.13645881,0.124564484],[105.5,-2.418838304,16.17800955,0.125444639],[106.5,-2.399063683,16.22014281,0.126313121],[107.5,-2.379756861,16.26284277,0.127169545],[108.5,-2.360920527,16.30609316,0.128013515],[109.5,-2.342557728,16.34987759,0.128844639],[110.5,-2.324663326,16.39418118,0.129662637],[111.5,-2.307240716,16.43898741,0.130467138],[112.5,-2.290287663,16.48428082,0.131257852],[113.5,-2.273803847,16.53004554,0.132034479],[114.5,-2.257782149,16.57626713,0.132796819],[115.5,-2.242227723,16.62292864,0.133544525],[116.5,-2.227132805,16.67001572,0.134277436],[117.5,-2.212495585,16.71751288,0.134995324],[118.5,-2.19831275,16.76540496,0.135697996],[119.5,-2.184580762,16.81367689,0.136385276],[120.5,-2.171295888,16.86231366,0.137057004],[121.5,-2.158454232,16.91130036,0.137713039],[122.5,-2.146051754,16.96062216,0.138353254],[123.5,-2.134084303,17.0102643,0.138977537],[124.5,-2.122547629,17.06021213,0.139585795],[125.5,-2.111437411,17.11045106,0.140177947],[126.5,-2.100749266,17.16096656,0.140753927],[127.5,-2.090478774,17.21174424,0.141313686],[128.5,-2.080621484,17.26276973,0.141857186],[129.5,-2.071172932,17.31402878,0.142384404],[130.5,-2.062128649,17.3655072,0.142895332],[131.5,-2.053484173,17.4171909,0.143389972],[132.5,-2.045235058,17.46906585,0.143868341],[133.5,-2.03737688,17.52111811,0.144330469],[134.5,-2.029906684,17.57333347,0.144776372],[135.5,-2.022817914,17.62569869,0.145206138],[136.5,-2.016107084,17.67819987,0.145619819],[137.5,-2.009769905,17.7308234,0.146017491],[138.5,-2.003802134,17.78355575,0.146399239],[139.5,-1.998199572,17.83638347,0.146765161],[140.5,-1.992958064,17.88929321,0.147115364],[141.5,-1.988073505,17.94227168,0.147449967],[142.5,-1.983541835,17.9953057,0.147769097],[143.5,-1.979359041,18.04838216,0.148072891],[144.5,-1.975521156,18.10148804,0.148361495],[145.5,-1.972024258,18.15461039,0.148635067],[146.5,-1.968864465,18.20773639,0.148893769],[147.5,-1.966037938,18.26085325,0.149137776],[148.5,-1.963540872,18.31394832,0.14936727],[149.5,-1.961369499,18.36700902,0.149582439],[150.5,-1.959520079,18.42002284,0.149783482],[151.5,-1.9579889,18.47297739,0.149970604],[152.5,-1.956772271,18.52586035,0.15014402],[153.5,-1.95586652,18.57865951,0.15030395],[154.5,-1.955267984,18.63136275,0.150450621],[155.5,-1.954973011,18.68395801,0.15058427],[156.5,-1.954977947,18.73643338,0.150705138],[157.5,-1.955279136,18.788777,0.150813475],[158.5,-1.955872909,18.84097713,0.150909535],[159.5,-1.956755579,18.89302212,0.150993582],[160.5,-1.957923436,18.94490041,0.151065883]] }
};
// LMS formulas as given on the CDC data-files page: X = M(1+LSZ)^(1/L); Z = ((X/M)^L \u2212 1)/(LS).
const lmsZ = (x, L, M, S) => (L === 0 ? Math.log(x / M) / S : (Math.pow(x / M, L) - 1) / (L * S));
const lmsX = (z, L, M, S) => (L === 0 ? M * Math.exp(S * z) : M * Math.pow(1 + L * S * z, 1 / L));
// Standard normal CDF (Abramowitz & Stegun 7.1.26).
const normCdf = (z) => { const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2); return z >= 0 ? (1 + y) / 2 : (1 - y) / 2; };
// CDC: ages are listed at the half-month point for the whole month (e.g. 48.5 covers 48.0 to <49.0).
const cdcRow = (tab, sex, mo) => { const rows = tab && tab[sex]; if (!rows || !(mo >= 0)) return null; const k = Math.floor(mo) + 0.5; return rows.find((r) => Math.abs(r[0] - k) < 1e-9) || null; };
// Age (months) at which the child's height equals the median (M) \u2014 linear between the half-month rows.
const cdcHeightAge = (tab, sex, h) => { const rows = (tab[sex] || []).filter((r) => r[0] % 1 !== 0); for (let i = 0; i < rows.length - 1; i++) { const a = rows[i], b = rows[i + 1]; if (h >= a[2] && h <= b[2]) return a[0] + (b[0] - a[0]) * (h - a[2]) / (b[2] - a[2]); } return null; };
const cdcMedianAt = (tab, sex, mo) => { const rows = (tab[sex] || []).filter((r) => r[0] % 1 !== 0); for (let i = 0; i < rows.length - 1; i++) { const a = rows[i], b = rows[i + 1]; if (mo >= a[0] && mo <= b[0]) return a[2] + (b[2] - a[2]) * (mo - a[0]) / (b[0] - a[0]); } return null; };
const growthCalc = (mo, sex, h, w) => {
  const s = sex === "F" ? 2 : 1;
  const inf = mo < 36;
  const HT = inf ? CDC_GROWTH.len : CDC_GROWTH.stat, WT = inf ? CDC_GROWTH.wtInf : CDC_GROWTH.wt;
  const hr = cdcRow(HT, s, mo), wr = cdcRow(WT, s, mo), br = inf ? null : cdcRow(CDC_GROWTH.bmi, s, mo);
  const r = { inf, s, hr, wr, br };
  if (hr && h > 0) { r.hz = lmsZ(h, hr[1], hr[2], hr[3]); r.hp = normCdf(r.hz) * 100; }
  if (wr && w > 0) { r.wz = lmsZ(w, wr[1], wr[2], wr[3]); r.wp = normCdf(r.wz) * 100; }
  if (br && h > 0 && w > 0) { r.bmi = w / Math.pow(h / 100, 2); r.bz = lmsZ(r.bmi, br[1], br[2], br[3]); r.bp = normCdf(r.bz) * 100; }
  if (h > 0) {
    const ha = cdcHeightAge(HT, s, h); r.heightAge = ha;
    r.mclaren = ha != null ? cdcMedianAt(WT, s, ha) : null;
    r.moore = r.hz != null && wr ? lmsX(r.hz, wr[1], wr[2], wr[3]) : null;
    r.bmiM = br && !inf ? br[2] * Math.pow(h / 100, 2) : null;
    r.traub = 2.396 * Math.exp(0.01863 * h);
  }
  return r;
};
const pedsCalc = (ageY, wIn) => {
  const a = ageY || 0;
  // APLS UK age-band weight estimation. The older single formula
  // (age + 4) * 2 underestimated weight by ~33% on average in children
  // 1-16y and was withdrawn; these three bands replaced it.
  //   <1y   : (0.5 x age in months) + 4
  //   1-5y  : (2 x age in years) + 8
  //   6-12y : (3 x age in years) + 7
  // Above 12y the age-based bands stop being reliable, so the 6-12y
  // formula is carried on as the least-bad estimate; a measured weight
  // should always be preferred and the card flags estimates as such.
  const estWeight = a < 1 ? 4 + a * 12 * 0.5 : a <= 5 ? 2 * a + 8 : 3 * a + 7;
  const w = wIn || estWeight;
  const est = !wIn;
  // <1 y: Merck Manual table (term neonate 3.0, <12 months 3.5); no verified cuffed size
  // below 1 y. Formulas (age/4 + 4, age/4 + 3.5, age/2 + 12) are given for children >=2 y.
  const ettUncuffed = a >= 1 ? a / 4 + 4 : a * 12 < 1 ? 3 : 3.5;
  // Cuffed <2 y: Microcuff manufacturer chart (LIT-20479-C1): term >=3 kg to <8 months 3.0 mm,
  // 8 months to <2 years 3.5 mm; age/4 + 3.5 from 2 y.
  const ettCuffed = a >= 2 ? a / 4 + 3.5 : a * 12 >= 8 ? 3.5 : w >= 3 ? 3 : null;
  const depth = a >= 1 ? a / 2 + 12 : ettUncuffed * 3;
  const lma = w < 5 ? "1" : w < 10 ? "1.5" : w < 20 ? "2" : w < 30 ? "2.5" : w < 50 ? "3" : w < 70 ? "4" : "5";
  // Merck Manual paediatric table (Miller): term neonate 0, <3 y 1, 3-9 y 2, >=10 y 3
  const blade = a * 12 < 1 ? "Miller 0" : a < 3 ? "Miller 1" : a < 10 ? "Miller 2" : "Miller 3";
  // PALS hypotension: term neonate <60, infant <70, 1-10 y <70 + 2 x age, >10 y <90
  const minSBP = a * 12 < 1 ? 60 : a < 1 ? 70 : a <= 10 ? 70 + 2 * a : 90;
  return { w, est, ettUncuffed, ettCuffed, depth, lma, blade, minSBP };
};
const maint421 = (w) => w <= 10 ? 4 * w : w <= 20 ? 40 + 2 * (w - 10) : 60 + (w - 20);
const EBV_CATS = [
  { id: "preterm", el: "\u03A0\u03C1\u03CC\u03C9\u03C1\u03BF \u03BD\u03B5\u03BF\u03B3\u03BD\u03CC", en: "Preterm neonate", v: 95 },
  { id: "neonate", el: "\u03A4\u03B5\u03BB\u03B5\u03B9\u03CC\u03BC\u03B7\u03BD\u03BF \u03BD\u03B5\u03BF\u03B3\u03BD\u03CC", en: "Term neonate", v: 88 },
  { id: "infant", el: "\u0392\u03C1\u03AD\u03C6\u03BF\u03C2 (<1 \u03AD\u03C4\u03BF\u03C5\u03C2)", en: "Infant (<1 yr)", v: 80 },
  { id: "child", el: "\u03A0\u03B1\u03B9\u03B4\u03AF", en: "Child", v: 75 },
  { id: "adultM", el: "\u0395\u03BD\u03AE\u03BB\u03B9\u03BA\u03B1\u03C2 \u2642", en: "Adult \u2642", v: 70 },
  { id: "adultF", el: "\u0395\u03BD\u03AE\u03BB\u03B9\u03BA\u03B1\u03C2 \u2640", en: "Adult \u2640", v: 65 }
];
const SCORES = [
  {
    id: "apfel", src: "Apfel CC, L\u00E4\u00E4r\u00E4 E, Koivuranta M, Greim CA, Roewer N. A simplified risk score for predicting postoperative nausea and vomiting. Anesthesiology 1999;91:693\u2013700. doi:10.1097/00000542-199909000-00022 \u00B7 Gan TJ, et al. Fourth consensus guidelines for the management of PONV. Anesth Analg 2020;131:411\u201348",
    name: "Apfel (PONV)",
    items: [
      { el: "\u0393\u03C5\u03BD\u03B1\u03B9\u03BA\u03B5\u03AF\u03BF \u03C6\u03CD\u03BB\u03BF", en: "Female sex", auto: (p) => p.s === "F" },
      { el: "\u039C\u03B7 \u03BA\u03B1\u03C0\u03BD\u03B9\u03C3\u03C4\u03AE\u03C2/-\u03C4\u03C1\u03B9\u03B1", en: "Non-smoker", auto: null },
      { el: "\u0399\u03C3\u03C4\u03BF\u03C1\u03B9\u03BA\u03CC PONV \u03AE \u03BD\u03B1\u03C5\u03C4\u03AF\u03B1\u03C2 \u03C4\u03B1\u03BE\u03B9\u03B4\u03B9\u03BF\u03CD", en: "History of PONV or motion sickness", auto: null },
      { el: "\u039C\u03B5\u03C4\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC \u03BF\u03C0\u03B9\u03BF\u03B5\u03B9\u03B4\u03AE", en: "Postoperative opioids", auto: null }
    ],
    interp: (n, lang) => {
      const risk = [10, 21, 39, 61, 79][n];
      const lvl = n <= 1 ? "low" : n === 2 ? "mid" : "high";
      return {
        lvl,
        el: `\u039A\u03AF\u03BD\u03B4\u03C5\u03BD\u03BF\u03C2 PONV \u2248 ${risk}% — ${n === 0 ? "\u03BA\u03B1\u03BD\u03AD\u03BD\u03B1\u03C2 \u03C0\u03B1\u03C1\u03AC\u03B3\u03BF\u03BD\u03C4\u03B1\u03C2: \u03B7 Gan 2020 \u03B4\u03B5\u03BD \u03B4\u03AF\u03BD\u03B5\u03B9 \u03C3\u03C5\u03B3\u03BA\u03B5\u03BA\u03C1\u03B9\u03BC\u03AD\u03BD\u03BF \u03B1\u03C1\u03B9\u03B8\u03BC\u03CC" : n <= 2 ? "1\u20132 \u03C0\u03B1\u03C1\u03AC\u03B3\u03BF\u03BD\u03C4\u03B5\u03C2: \u03C4\u03BF\u03C5\u03BB\u03AC\u03C7\u03B9\u03C3\u03C4\u03BF\u03BD 2 \u03B1\u03BD\u03C4\u03B9\u03B5\u03BC\u03B5\u03C4\u03B9\u03BA\u03AC (Gan 2020)" : ">2 \u03C0\u03B1\u03C1\u03AC\u03B3\u03BF\u03BD\u03C4\u03B5\u03C2: 3\u20134 \u03B1\u03BD\u03C4\u03B9\u03B5\u03BC\u03B5\u03C4\u03B9\u03BA\u03AC\u00B7 \u03C3\u03B5 \u03B3\u03B5\u03BD\u03B9\u03BA\u03AE, \u03C3\u03BA\u03AD\u03C8\u03B7 TIVA \u03BC\u03B5 \u03C0\u03C1\u03BF\u03C0\u03BF\u03C6\u03CC\u03BB\u03B7 \u03BA\u03B1\u03B9 \u03B1\u03C0\u03BF\u03C6\u03C5\u03B3\u03AE \u03C0\u03C4\u03B7\u03C4\u03B9\u03BA\u03CE\u03BD (Gan 2020)"}`,
        en: `PONV risk \u2248 ${risk}% \u2014 ${n === 0 ? "no factors: Gan 2020 gives no specific number" : n <= 2 ? "1\u20132 factors: at least 2 antiemetics (Gan 2020)" : ">2 factors: 3\u20134 antiemetics; if GA, consider propofol TIVA and avoid volatiles (Gan 2020)"}`
      };
    }
  },
  {
    id: "stopbang", src: "Chung F, Yegneswaran B, Liao P, \u03BA.\u03AC. STOP questionnaire: a tool to screen patients for obstructive sleep apnea. Anesthesiology 2008;108:812\u201321. doi:10.1097/ALN.0b013e31816d83e4 \u00B7 Chung F \u03BA.\u03AC., Br J Anaesth 2012;108:768\u201375 (\u03C5\u03C8\u03B7\u03BB\u03CC \u03C3\u03BA\u03BF\u03C1 = \u03C5\u03C8\u03B7\u03BB\u03AE \u03C0\u03B9\u03B8\u03B1\u03BD\u03CC\u03C4\u03B7\u03C4\u03B1 \u0391\u0391\u03A5) \u00B7 \u039A\u03C1\u03B9\u03C4\u03AE\u03C1\u03B9\u03B1 \u03C5\u03C8\u03B7\u03BB\u03BF\u03CD \u03BA\u03B9\u03BD\u03B4\u03CD\u03BD\u03BF\u03C5: 5\u20138, \u03AE \u22652 STOP + \u03AC\u03C1\u03C1\u03B5\u03BD \u03C6\u03CD\u03BB\u03BF / BMI >35 / \u03BB\u03B1\u03B9\u03BC\u03CC\u03C2 >40 cm (stopbang.ca)",
    name: "STOP-BANG (OSA)",
    items: [
      { el: "\u03A1\u03BF\u03C7\u03B1\u03BB\u03B7\u03C4\u03CC (\u03B4\u03C5\u03BD\u03B1\u03C4\u03CC)", en: "Snoring (loud)", auto: null },
      { el: "\u039A\u03CC\u03C0\u03C9\u03C3\u03B7/\u03C5\u03C0\u03BD\u03B7\u03BB\u03AF\u03B1 \u03B7\u03BC\u03AD\u03C1\u03B1\u03C2", en: "Tiredness/daytime sleepiness", auto: null },
      { el: "\u03A0\u03B1\u03C1\u03B1\u03C4\u03B7\u03C1\u03B7\u03B8\u03B5\u03AF\u03C3\u03B5\u03C2 \u03AC\u03C0\u03BD\u03BF\u03B9\u03B5\u03C2", en: "Observed apneas", auto: null },
      { el: "\u0391\u03C1\u03C4\u03B7\u03C1\u03B9\u03B1\u03BA\u03AE \u03C5\u03C0\u03AD\u03C1\u03C4\u03B1\u03C3\u03B7", en: "Blood Pressure (HTN)", auto: null },
      { el: "BMI > 35 kg/m\xB2", en: "BMI > 35 kg/m\xB2", auto: (p) => p.bmi != null && p.bmi > 35 },
      { el: "\u0397\u03BB\u03B9\u03BA\u03AF\u03B1 > 50", en: "Age > 50", auto: (p) => p.a > 50 },
      { el: "\u03A0\u03B5\u03C1\u03AF\u03BC\u03B5\u03C4\u03C1\u03BF\u03C2 \u03C4\u03C1\u03B1\u03C7\u03AE\u03BB\u03BF\u03C5 > 40 cm", en: "Neck circumference > 40 cm", auto: null },
      { el: "\u0386\u03C1\u03C1\u03B5\u03BD \u03C6\u03CD\u03BB\u03BF", en: "Male gender", auto: (p) => p.s === "M" }
    ],
    interp: (n, lang, st) => {
      const stop = st ? [0, 1, 2, 3].filter((x) => st[x]).length : 0;
      const combo = st && stop >= 2 && (st[7] || st[4] || st[6]);
      const lvl = n <= 2 ? "low" : n <= 4 && !combo ? "mid" : "high";
      return {
        lvl,
        el: lvl === "low" ? "\u03A7\u03B1\u03BC\u03B7\u03BB\u03CC\u03C2 \u03BA\u03AF\u03BD\u03B4\u03C5\u03BD\u03BF\u03C2 \u03A3\u0391\u03A5" : lvl === "mid" ? "\u039C\u03AD\u03C4\u03C1\u03B9\u03BF\u03C2 \u03BA\u03AF\u03BD\u03B4\u03C5\u03BD\u03BF\u03C2 \u03A3\u0391\u03A5" : (n <= 4 ? "\u22652 \u03B5\u03C1\u03C9\u03C4\u03AE\u03C3\u03B5\u03B9\u03C2 STOP + \u03AC\u03C1\u03C1\u03B5\u03BD \u03C6\u03CD\u03BB\u03BF, BMI >35 \u03AE \u03BB\u03B1\u03B9\u03BC\u03CC\u03C2 >40 cm \u2192 " : "") + "\u03A5\u03C8\u03B7\u03BB\u03CC\u03C2 \u03BA\u03AF\u03BD\u03B4\u03C5\u03BD\u03BF\u03C2 \u03A3\u0391\u03A5 \u2014 SASM 2016: \u03BC\u03C0\u03BF\u03C1\u03B5\u03AF \u03BD\u03B1 \u03B1\u03C5\u03BE\u03AC\u03BD\u03B5\u03B9 \u03C4\u03B7 \u03BC\u03B5\u03C4\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AE \u03BD\u03BF\u03C3\u03B7\u03C1\u03CC\u03C4\u03B7\u03C4\u03B1\u00B7 \u03CC\u03C7\u03B9 \u03B1\u03BA\u03CD\u03C1\u03C9\u03C3\u03B7 \u03AE \u03B1\u03BD\u03B1\u03B2\u03BF\u03BB\u03AE \u03BC\u03CC\u03BD\u03BF \u03B3\u03B9\u03B1 \u03B5\u03C0\u03AF\u03C3\u03B7\u03BC\u03B7 \u03B4\u03B9\u03AC\u03B3\u03BD\u03C9\u03C3\u03B7, \u03B1\u03BD \u03BF\u03B9 \u03C3\u03C5\u03BD\u03BD\u03BF\u03C3\u03B7\u03C1\u03CC\u03C4\u03B7\u03C4\u03B5\u03C2 \u03B5\u03AF\u03BD\u03B1\u03B9 \u03C1\u03C5\u03B8\u03BC\u03B9\u03C3\u03BC\u03AD\u03BD\u03B5\u03C2 \u03BA\u03B1\u03B9 \u03C5\u03C0\u03AC\u03C1\u03C7\u03BF\u03C5\u03BD \u03BC\u03AD\u03C4\u03C1\u03B1 \u03BC\u03B5\u03C4\u03C1\u03B9\u03B1\u03C3\u03BC\u03BF\u03CD\u00B7 \u03C3\u03C5\u03BD\u03AD\u03C7\u03B9\u03C3\u03B7 \u03C4\u03B7\u03C2 PAP \u03C0\u03BF\u03C5 \u03AE\u03B4\u03B7 \u03C7\u03C1\u03B7\u03C3\u03B9\u03BC\u03BF\u03C0\u03BF\u03B9\u03B5\u03AF\u00B7 \u03AD\u03BD\u03B1\u03C1\u03BE\u03B7 PAP \u03C3\u03B5 \u03C0\u03B9\u03B8\u03B1\u03BD\u03AE \u03A3\u0391\u03A5 \u03BA\u03B1\u03C4\u03AC \u03C0\u03B5\u03C1\u03AF\u03C0\u03C4\u03C9\u03C3\u03B7",
        en: lvl === "low" ? "Low OSA risk" : lvl === "mid" ? "Moderate OSA risk" : (n <= 4 ? "\u22652 STOP items + male sex, BMI >35 or neck >40 cm \u2192 " : "") + "High OSA risk \u2014 SASM 2016: may increase postoperative morbidity; no need to cancel or delay only for a formal diagnosis if comorbidities are optimised and mitigation strategies are in place; continue prescribed PAP in hospital; starting PAP in suspected OSA case by case"
      };
    }
  },
  {
    id: "rcri", src: "Lee TH, Marcantonio ER, Mangione CM, \u03BA.\u03AC. Derivation and prospective validation of a simple index for prediction of cardiac risk of major noncardiac surgery. Circulation 1999;100:1043\u20139",
    name: "RCRI (Lee)",
    items: [
      { el: "\u0395\u03C0\u03AD\u03BC\u03B2\u03B1\u03C3\u03B7 \u03C5\u03C8\u03B7\u03BB\u03BF\u03CD \u03BA\u03B9\u03BD\u03B4\u03CD\u03BD\u03BF\u03C5 (\u03B5\u03BD\u03B4\u03BF\u03B8\u03C9\u03C1\u03B1\u03BA\u03B9\u03BA\u03AE/\u03B5\u03BD\u03B4\u03BF\u03BA\u03BF\u03B9\u03BB\u03B9\u03B1\u03BA\u03AE/\u03B1\u03B3\u03B3\u03B5\u03B9\u03B1\u03BA\u03AE \u03AC\u03BD\u03C9 \u03B2\u03BF\u03C5\u03B2\u03C9\u03BD\u03B9\u03BA\u03BF\u03CD)", en: "High-risk surgery (intrathoracic/intraperitoneal/suprainguinal vascular)", auto: null },
      { el: "\u0399\u03C3\u03C7\u03B1\u03B9\u03BC\u03B9\u03BA\u03AE \u03BA\u03B1\u03C1\u03B4\u03B9\u03BF\u03C0\u03AC\u03B8\u03B5\u03B9\u03B1", en: "Ischemic heart disease", auto: null },
      { el: "\u03A3\u03C5\u03BC\u03C6\u03BF\u03C1\u03B7\u03C4\u03B9\u03BA\u03AE \u03BA\u03B1\u03C1\u03B4\u03B9\u03B1\u03BA\u03AE \u03B1\u03BD\u03B5\u03C0\u03AC\u03C1\u03BA\u03B5\u03B9\u03B1", en: "Congestive heart failure", auto: null },
      { el: "\u0391\u03B3\u03B3\u03B5\u03B9\u03B1\u03BA\u03AE \u03B5\u03B3\u03BA\u03B5\u03C6\u03B1\u03BB\u03B9\u03BA\u03AE \u03BD\u03CC\u03C3\u03BF\u03C2 (\u0391\u0395\u0395/\u03A0\u0399\u0395)", en: "Cerebrovascular disease (CVA/TIA)", auto: null },
      { el: "\u0399\u03BD\u03C3\u03BF\u03C5\u03BB\u03B9\u03BD\u03BF\u03B8\u03B5\u03C1\u03B1\u03C0\u03B5\u03C5\u03CC\u03BC\u03B5\u03BD\u03BF\u03C2 \u03A3\u0394", en: "Insulin-treated diabetes", auto: null },
      { el: "\u039A\u03C1\u03B5\u03B1\u03C4\u03B9\u03BD\u03AF\u03BD\u03B7 > 2 mg/dL (177 \xB5mol/L)", en: "Creatinine > 2 mg/dL (177 \xB5mol/L)", auto: null }
    ],
    interp: (n, lang) => {
      const risk = n === 0 ? "0.4%" : n === 1 ? "0.9%" : n === 2 ? "6.6%" : "11%";
      const lvl = n <= 1 ? "low" : n === 2 ? "mid" : "high";
      return {
        lvl,
        el: `\u039A\u03AF\u03BD\u03B4\u03C5\u03BD\u03BF\u03C2 \u03BC\u03B5\u03B9\u03B6\u03CC\u03BD\u03C9\u03BD \u03BA\u03B1\u03C1\u03B4\u03B9\u03B1\u03BA\u03CE\u03BD \u03B5\u03C0\u03B9\u03C0\u03BB\u03BF\u03BA\u03CE\u03BD \u2248 ${risk}${n >= 2 ? " \u2014 AHA/ACC 2024: \u03C3\u03B5 \u03B1\u03C5\u03BE\u03B7\u03BC\u03AD\u03BD\u03BF \u03BA\u03AF\u03BD\u03B4\u03C5\u03BD\u03BF \u03BC\u03B5 \u03C0\u03C4\u03C9\u03C7\u03AE \u03BB\u03B5\u03B9\u03C4\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE \u03B9\u03BA\u03B1\u03BD\u03CC\u03C4\u03B7\u03C4\u03B1 \u03C0\u03C1\u03B9\u03BD \u03B1\u03C0\u03CC \u03B5\u03C0\u03AD\u03BC\u03B2\u03B1\u03C3\u03B7 \u03B1\u03C5\u03BE\u03B7\u03BC\u03AD\u03BD\u03BF\u03C5 \u03BA\u03B9\u03BD\u03B4\u03CD\u03BD\u03BF\u03C5, \u03BC\u03C0\u03BF\u03C1\u03B5\u03AF \u03BD\u03B1 \u03B5\u03BE\u03B5\u03C4\u03B1\u03C3\u03C4\u03B5\u03AF BNP/NT-proBNP (\u03AE \u03C4\u03C1\u03BF\u03C0\u03BF\u03BD\u03AF\u03BD\u03B7)" : ""}`,
        en: `Major cardiac complication risk \u2248 ${risk}${n >= 2 ? " \u2014 AHA/ACC 2024: at elevated risk with poor exercise capacity before elevated-risk surgery, BNP/NT-proBNP (or troponin) may be considered" : ""}`
      };
    }
  },
  {
    id: "ariscat",
    name: "ARISCAT (\u03C0\u03BD\u03B5\u03C5\u03BC. \u03B5\u03C0\u03B9\u03C0\u03BB\u03BF\u03BA\u03AD\u03C2)",
    items: [
      { el: "\u0397\u03BB\u03B9\u03BA\u03AF\u03B1", en: "Age", opts: [{ el: "\u226450", en: "\u226450", v: 0 }, { el: "51\u201380", en: "51\u201380", v: 3 }, { el: ">80", en: ">80", v: 16 }], autoIdx: (p) => p.a > 80 ? 2 : p.a > 50 ? 1 : 0 },
      { el: "\u03A0\u03C1\u03BF\u03B5\u03B3\u03C7. SpO\u2082 (\u03B1\u03AD\u03C1\u03B1\u03C2 \u03B4\u03C9\u03BC\u03B1\u03C4\u03AF\u03BF\u03C5)", en: "Preop SpO\u2082 (room air)", opts: [{ el: "\u226596%", en: "\u226596%", v: 0 }, { el: "91\u201395%", en: "91\u201395%", v: 8 }, { el: "\u226490%", en: "\u226490%", v: 24 }] },
      { el: "\u0391\u03BD\u03B1\u03C0\u03BD\u03B5\u03C5\u03C3\u03C4\u03B9\u03BA\u03AE \u03BB\u03BF\u03AF\u03BC\u03C9\u03BE\u03B7 \u03C4\u03BF\u03BD \u03C4\u03B5\u03BB\u03B5\u03C5\u03C4\u03B1\u03AF\u03BF \u03BC\u03AE\u03BD\u03B1", en: "Respiratory infection in the last month", w: 17 },
      { el: "\u03A0\u03C1\u03BF\u03B5\u03B3\u03C7. \u03B1\u03BD\u03B1\u03B9\u03BC\u03AF\u03B1 (Hb \u226410 g/dL)", en: "Preop anaemia (Hb \u226410 g/dL)", w: 11 },
      { el: "\u03A4\u03BF\u03BC\u03AE", en: "Surgical incision", opts: [{ el: "\u03A0\u03B5\u03C1\u03B9\u03C6\u03B5\u03C1\u03B9\u03BA\u03AE", en: "Peripheral", v: 0 }, { el: "\u0386\u03BD\u03C9 \u03BA\u03BF\u03B9\u03BB\u03AF\u03B1", en: "Upper abdominal", v: 15 }, { el: "\u0395\u03BD\u03B4\u03BF\u03B8\u03C9\u03C1\u03B1\u03BA\u03B9\u03BA\u03AE", en: "Intrathoracic", v: 24 }] },
      { el: "\u0394\u03B9\u03AC\u03C1\u03BA\u03B5\u03B9\u03B1 \u03B5\u03C0\u03AD\u03BC\u03B2\u03B1\u03C3\u03B7\u03C2", en: "Duration of surgery", opts: [{ el: "\u22642 h", en: "\u22642 h", v: 0 }, { el: "2\u20133 h", en: "2\u20133 h", v: 16 }, { el: ">3 h", en: ">3 h", v: 23 }] },
      { el: "\u0395\u03C0\u03B5\u03AF\u03B3\u03BF\u03C5\u03C3\u03B1 \u03B5\u03C0\u03AD\u03BC\u03B2\u03B1\u03C3\u03B7", en: "Emergency procedure", w: 8 }
    ],
    interp: (n, lang) => {
      const lvl = n < 26 ? "low" : n < 45 ? "mid" : "high";
      const pct = n < 26 ? "1.6%" : n < 45 ? "13.3%" : "42.1%";
      return {
        lvl,
        el: `\u039A\u03AF\u03BD\u03B4\u03C5\u03BD\u03BF\u03C2 \u03BC\u03B5\u03C4\u03B5\u03B3\u03C7. \u03C0\u03BD\u03B5\u03C5\u03BC\u03BF\u03BD\u03B9\u03BA\u03CE\u03BD \u03B5\u03C0\u03B9\u03C0\u03BB\u03BF\u03BA\u03CE\u03BD \u2248 ${pct} — ${n < 26 ? "\u03C7\u03B1\u03BC\u03B7\u03BB\u03CC\u03C2 \u03BA\u03AF\u03BD\u03B4\u03C5\u03BD\u03BF\u03C2" : n < 45 ? "\u03B5\u03BD\u03B4\u03B9\u03AC\u03BC\u03B5\u03C3\u03BF\u03C2 \u03BA\u03AF\u03BD\u03B4\u03C5\u03BD\u03BF\u03C2" : "\u03C5\u03C8\u03B7\u03BB\u03CC\u03C2 \u03BA\u03AF\u03BD\u03B4\u03C5\u03BD\u03BF\u03C2"} \u00B7 \u03A0\u03C1\u03BF\u03C3\u03C4\u03B1\u03C4\u03B5\u03C5\u03C4\u03B9\u03BA\u03CC\u03C2 \u03B1\u03B5\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2 \u03C3\u03B5 \u03CC\u03BB\u03BF\u03C5\u03C2: Vt 6\u20138 mL/kg PBW, PEEP 5 cmH\u2082O \u03B5\u03BE\u03B1\u03C4\u03BF\u03BC\u03B9\u03BA\u03B5\u03C5\u03BC\u03AD\u03BD\u03B7, FiO\u2082 \u22640.4 \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7 \u03B4\u03B9\u03B1\u03C3\u03C9\u03BB\u03AE\u03BD\u03C9\u03C3\u03B7 (Young 2019)`,
        en: `Postop pulmonary complication risk \u2248 ${pct} \u2014 ${n < 26 ? "low risk" : n < 45 ? "intermediate risk" : "high risk"} \u00B7 Lung-protective ventilation for all: Vt 6\u20138 mL/kg PBW, PEEP 5 cmH\u2082O individualised, FiO\u2082 \u22640.4 after intubation (Young 2019)`
      };
    },
    src: "Canet J \u03BA.\u03AC., Anesthesiology 2010;113:1338\u201350 \u00B7 Young CC \u03BA.\u03AC., Br J Anaesth 2019 (doi:10.1016/j.bja.2019.08.017)."
  },
  {
    id: "cfs",
    name: "Clinical Frailty Scale (\u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1)",
    items: [
      { el: "\u039A\u03BB\u03AF\u03BC\u03B1\u03BA\u03B1 \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1\u03C2 (1\u20139)", en: "Clinical Frailty Scale (1\u20139)", opts: [{ el: "1 \u03A0\u03BF\u03BB\u03CD \u03B9\u03BA\u03B1\u03BD\u03CC\u03C2", en: "1 Very fit", v: 1 }, { el: "2 \u0399\u03BA\u03B1\u03BD\u03CC\u03C2", en: "2 Fit", v: 2 }, { el: "3 \u03A4\u03B1 \u03BA\u03B1\u03C4\u03B1\u03C6\u03AD\u03C1\u03BD\u03B5\u03B9 \u03BA\u03B1\u03BB\u03AC", en: "3 Managing well", v: 3 }, { el: "4 \u0396\u03B5\u03B9 \u03BC\u03B5 \u03C0\u03BF\u03BB\u03CD \u03AE\u03C0\u03B9\u03B1 \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1", en: "4 Living with very mild frailty", v: 4 }, { el: "5 \u0396\u03B5\u03B9 \u03BC\u03B5 \u03AE\u03C0\u03B9\u03B1 \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1", en: "5 Living with mild frailty", v: 5 }, { el: "6 \u0396\u03B5\u03B9 \u03BC\u03B5 \u03BC\u03AD\u03C4\u03C1\u03B9\u03B1 \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1", en: "6 Living with moderate frailty", v: 6 }, { el: "7 \u0396\u03B5\u03B9 \u03BC\u03B5 \u03C3\u03BF\u03B2\u03B1\u03C1\u03AE \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1", en: "7 Living with severe frailty", v: 7 }, { el: "8 \u0396\u03B5\u03B9 \u03BC\u03B5 \u03C0\u03BF\u03BB\u03CD \u03C3\u03BF\u03B2\u03B1\u03C1\u03AE \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1", en: "8 Living with very severe frailty", v: 8 }, { el: "9 \u03A4\u03B5\u03BB\u03B9\u03BA\u03CC \u03C3\u03C4\u03AC\u03B4\u03B9\u03BF \u03B6\u03C9\u03AE\u03C2", en: "9 Terminally ill", v: 9 }] }
    ],
    interp: (n, lang) => {
      const L = [["\u03A0\u03BF\u03BB\u03CD \u03B9\u03BA\u03B1\u03BD\u03CC\u03C2", "Very fit"], ["\u0399\u03BA\u03B1\u03BD\u03CC\u03C2", "Fit"], ["\u03A4\u03B1 \u03BA\u03B1\u03C4\u03B1\u03C6\u03AD\u03C1\u03BD\u03B5\u03B9 \u03BA\u03B1\u03BB\u03AC", "Managing well"], ["\u0396\u03B5\u03B9 \u03BC\u03B5 \u03C0\u03BF\u03BB\u03CD \u03AE\u03C0\u03B9\u03B1 \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1", "Living with very mild frailty"], ["\u0396\u03B5\u03B9 \u03BC\u03B5 \u03AE\u03C0\u03B9\u03B1 \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1", "Living with mild frailty"], ["\u0396\u03B5\u03B9 \u03BC\u03B5 \u03BC\u03AD\u03C4\u03C1\u03B9\u03B1 \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1", "Living with moderate frailty"], ["\u0396\u03B5\u03B9 \u03BC\u03B5 \u03C3\u03BF\u03B2\u03B1\u03C1\u03AE \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1", "Living with severe frailty"], ["\u0396\u03B5\u03B9 \u03BC\u03B5 \u03C0\u03BF\u03BB\u03CD \u03C3\u03BF\u03B2\u03B1\u03C1\u03AE \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1", "Living with very severe frailty"], ["\u03A4\u03B5\u03BB\u03B9\u03BA\u03CC \u03C3\u03C4\u03AC\u03B4\u03B9\u03BF \u03B6\u03C9\u03AE\u03C2", "Terminally ill"]];
      const lvl = n <= 3 ? "low" : n === 4 ? "mid" : "high";
      return {
        lvl,
        el: L[n - 1][0] + (n >= 4 ? " \u2014 \u03B7 \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1 \u03C0\u03C1\u03BF\u03B2\u03BB\u03AD\u03C0\u03B5\u03B9 \u03C4\u03B7 \u03BC\u03B5\u03C4\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AE \u03AD\u03BA\u03B2\u03B1\u03C3\u03B7\u00B7 \u03B3\u03B7\u03C1\u03B9\u03B1\u03C4\u03C1\u03B9\u03BA\u03AE \u03B5\u03BA\u03C4\u03AF\u03BC\u03B7\u03C3\u03B7 \u03CC\u03C0\u03BF\u03C5 \u03B5\u03AF\u03BD\u03B1\u03B9 \u03B4\u03C5\u03BD\u03B1\u03C4\u03CC (ESAIC 2025)" : ""),
        en: L[n - 1][1] + (n >= 4 ? " \u2014 frailty predicts postoperative outcomes; geriatric assessment where possible (ESAIC 2025)" : "")
      };
    },
    src: "Rockwood K, Theou O. Using the Clinical Frailty Scale in allocating scarce health care resources. Can Geriatr J 2020;23:254\u20139 \u00B7 Lamperti M, et al. ESAIC 2025, Eur J Anaesthesiol 2025;42:1\u201335 \u2014 R9.1\u20139.3 (1C): \u03C7\u03C1\u03AE\u03C3\u03B7 \u03C4\u03B7\u03C2 CFS \u03B3\u03B9\u03B1 \u03C0\u03C1\u03CC\u03B2\u03BB\u03B5\u03C8\u03B7 \u03C4\u03B7\u03C2 \u03BC\u03B5\u03C4\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AE\u03C2 \u03AD\u03BA\u03B2\u03B1\u03C3\u03B7\u03C2."
  },
  {
    id: "childpugh",
    name: "Child-Pugh (\u03B7\u03C0\u03B1\u03C4\u03B9\u03BA\u03AE \u03B1\u03BD\u03B5\u03C0\u03AC\u03C1\u03BA\u03B5\u03B9\u03B1)",
    items: [
      { el: "\u03A7\u03BF\u03BB\u03B5\u03C1\u03C5\u03B8\u03C1\u03AF\u03BD\u03B7 (mg/dL)", en: "Bilirubin (mg/dL)", opts: [{ el: "<2", en: "<2", v: 1 }, { el: "2\u20133", en: "2\u20133", v: 2 }, { el: ">3", en: ">3", v: 3 }] },
      { el: "\u0391\u03BB\u03B2\u03BF\u03C5\u03BC\u03AF\u03BD\u03B7 (g/dL)", en: "Albumin (g/dL)", opts: [{ el: ">3.5", en: ">3.5", v: 1 }, { el: "2.8\u20133.5", en: "2.8\u20133.5", v: 2 }, { el: "<2.8", en: "<2.8", v: 3 }] },
      { el: "INR", en: "INR", opts: [{ el: "<1.7", en: "<1.7", v: 1 }, { el: "1.7\u20132.3", en: "1.7\u20132.3", v: 2 }, { el: ">2.3", en: ">2.3", v: 3 }] },
      { el: "\u0391\u03C3\u03BA\u03AF\u03C4\u03B7\u03C2", en: "Ascites", opts: [{ el: "\u039A\u03B1\u03BD\u03AD\u03BD\u03B1\u03C2", en: "None", v: 1 }, { el: "\u0389\u03C0\u03B9\u03BF\u03C2 \u03AE \u03B5\u03BB\u03B5\u03B3\u03C7\u03CC\u03BC\u03B5\u03BD\u03BF\u03C2 \u03BC\u03B5 \u03B4\u03B9\u03BF\u03C5\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC", en: "Mild or controlled by diuretics", v: 2 }, { el: "\u03A4\u03BF\u03C5\u03BB\u03AC\u03C7\u03B9\u03C3\u03C4\u03BF\u03BD \u03BC\u03AD\u03C4\u03C1\u03B9\u03BF\u03C2 \u03C0\u03B1\u03C1\u03AC \u03C4\u03B1 \u03B4\u03B9\u03BF\u03C5\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC", en: "At least moderate despite diuretics", v: 3 }] },
      { el: "\u0395\u03B3\u03BA\u03B5\u03C6\u03B1\u03BB\u03BF\u03C0\u03AC\u03B8\u03B5\u03B9\u03B1", en: "Encephalopathy", opts: [{ el: "\u039A\u03B1\u03BC\u03AF\u03B1", en: "None", v: 1 }, { el: "\u0392\u03B1\u03B8\u03BC\u03CC\u03C2 I\u2013II", en: "Grade I\u2013II", v: 2 }, { el: "\u0392\u03B1\u03B8\u03BC\u03CC\u03C2 III\u2013IV", en: "Grade III\u2013IV", v: 3 }] }
    ],
    interp: (n, lang) => {
      const cls = n <= 6 ? "A" : n <= 9 ? "B" : "C";
      const lvl = n <= 6 ? "low" : n <= 9 ? "mid" : "high";
      const mort = n <= 6 ? "10%" : n <= 9 ? "31%" : "76%";
      return {
        lvl,
        el: `\u039A\u03B1\u03C4\u03B7\u03B3\u03BF\u03C1\u03AF\u03B1 ${cls} \u00b7 \u03B8\u03BD\u03B7\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1 \u03C3\u03B5 \u03BA\u03BF\u03B9\u03BB\u03B9\u03B1\u03BA\u03AE \u03B5\u03C0\u03AD\u03BC\u03B2\u03B1\u03C3\u03B7 ${mort}`,
        en: `Class ${cls} \u00b7 mortality for abdominal surgery ${mort}`
      };
    },
    src: "\u03A4\u03BF \u03B1\u03C0\u03BF\u03C4\u03AD\u03BB\u03B5\u03C3\u03BC\u03B1 5\u201315: A 5\u20136, B 7\u20139, C 10\u201315 (Merck Manual). \u0398\u03BD\u03B7\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1 \u03BC\u03B5\u03C4\u03AC \u03B1\u03C0\u03CC \u03BA\u03BF\u03B9\u03BB\u03B9\u03B1\u03BA\u03AD\u03C2 \u03B5\u03C0\u03B5\u03BC\u03B2\u03AC\u03C3\u03B5\u03B9\u03C2 10/31/76% (Garrison RN, et al., Ann Surg 1984;199:648\u201355) \u2014 \u03B1\u03BD\u03B1\u03B4\u03C1\u03BF\u03BC\u03B9\u03BA\u03AE \u03BC\u03B5\u03BB\u03AD\u03C4\u03B7, \u03B5\u03BD\u03B4\u03B5\u03B9\u03BA\u03C4\u03B9\u03BA\u03AE. \u03A4\u03BF MELD \u03C0\u03C1\u03BF\u03C4\u03B9\u03BC\u03AC\u03C4\u03B1\u03B9 \u03B3\u03B9\u03B1 \u03C0\u03B9\u03BF \u03BB\u03B5\u03C0\u03C4\u03BF\u03BC\u03B5\u03C1\u03AE \u03B4\u03B9\u03B1\u03B2\u03AC\u03B8\u03BC\u03B9\u03C3\u03B7."
  }
,
  {
    id: "psss",
    name: "PSSS (\u03C0\u03B1\u03B9\u03B4\u03B9\u03B1\u03C4\u03C1\u03B9\u03BA\u03AE \u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03BF\u03BB\u03AE)",
    items: [
      { el: "\u039A\u03B1\u03C4\u03AC\u03C3\u03C4\u03B1\u03C3\u03B7 \u03BA\u03B1\u03C4\u03AC \u03C4\u03B7\u03BD \u03B5\u03C0\u03AD\u03BC\u03B2\u03B1\u03C3\u03B7", en: "Observed state during the procedure", opts: [{ el: "0 \u00B7 \u03A0\u03B1\u03B8\u03BF\u03BB\u03BF\u03B3\u03B9\u03BA\u03AC \u03B6\u03C9\u03C4\u03B9\u03BA\u03AC \u03C0\u03BF\u03C5 \u03B1\u03C0\u03B1\u03B9\u03C4\u03BF\u03CD\u03BD \u03AC\u03BC\u03B5\u03C3\u03B7 \u03C0\u03B1\u03C1\u03AD\u03BC\u03B2\u03B1\u03C3\u03B7 (\u03C0.\u03C7. SpO\u2082 <90%, \u03C5\u03C0\u03CC\u03C4\u03B1\u03C3\u03B7, \u03B2\u03C1\u03B1\u03B4\u03C5\u03BA\u03B1\u03C1\u03B4\u03AF\u03B1)", en: "0 \u00B7 Abnormal physiology requiring acute intervention (e.g. SpO\u2082 <90%, hypotension, bradycardia)", v: 0 }, { el: "1 \u00B7 \u0392\u03B1\u03B8\u03B9\u03AC \u03BA\u03BF\u03B9\u03BC\u03B9\u03C3\u03BC\u03AD\u03BD\u03BF, \u03C6\u03C5\u03C3\u03B9\u03BF\u03BB\u03BF\u03B3\u03B9\u03BA\u03AC \u03B6\u03C9\u03C4\u03B9\u03BA\u03AC, \u03B1\u03BB\u03BB\u03AC \u03C7\u03C1\u03B5\u03B9\u03AC\u03B6\u03B5\u03C4\u03B1\u03B9 \u03C5\u03C0\u03BF\u03C3\u03C4\u03AE\u03C1\u03B9\u03BE\u03B7 \u03B1\u03B5\u03C1\u03B1\u03B3\u03C9\u03B3\u03BF\u03CD (\u03BA\u03B5\u03BD\u03C4\u03C1\u03B9\u03BA\u03AE \u03AE \u03B1\u03C0\u03BF\u03C6\u03C1\u03B1\u03BA\u03C4\u03B9\u03BA\u03AE \u03AC\u03C0\u03BD\u03BF\u03B9\u03B1)", en: "1 \u00B7 Deeply asleep with normal vital signs, but requiring airway intervention or assistance (central or obstructive apnoea)", v: 1 }, { el: "2 \u00B7 \u0389\u03C3\u03C5\u03C7\u03BF (\u03BA\u03BF\u03B9\u03BC\u03B9\u03C3\u03BC\u03AD\u03BD\u03BF \u03AE \u03BE\u03CD\u03C0\u03BD\u03B9\u03BF), \u03B1\u03BA\u03AF\u03BD\u03B7\u03C4\u03BF, \u03C7\u03C9\u03C1\u03AF\u03C2 \u03C3\u03CD\u03C3\u03C0\u03B1\u03C3\u03B7 \u03C0\u03C1\u03BF\u03C3\u03CE\u03C0\u03BF\u03C5 \u03AE \u03C0\u03B1\u03C1\u03AC\u03C0\u03BF\u03BD\u03BF \u2014 \u0399\u0394\u0391\u039D\u0399\u039A\u0397 \u039A\u0391\u03A4\u0391\u03A3\u03A4\u0391\u03A3\u0397", en: "2 \u00B7 Quiet (asleep or awake), not moving, no frown or brow furrow, no verbalised complaint \u2014 IDEAL STATE", v: 2 }, { el: "3 \u00B7 \u0388\u03BA\u03C6\u03C1\u03B1\u03C3\u03B7 \u03C0\u03CC\u03BD\u03BF\u03C5 \u03AE \u03AC\u03B3\u03C7\u03BF\u03C5\u03C2 \u03C3\u03C4\u03BF \u03C0\u03C1\u03CC\u03C3\u03C9\u03C0\u03BF, \u03B1\u03BB\u03BB\u03AC \u03C7\u03C9\u03C1\u03AF\u03C2 \u03BA\u03AF\u03BD\u03B7\u03C3\u03B7 \u03C0\u03BF\u03C5 \u03BD\u03B1 \u03B5\u03BC\u03C0\u03BF\u03B4\u03AF\u03B6\u03B5\u03B9 \u2014 \u03B4\u03B5\u03BD \u03C7\u03C1\u03B5\u03B9\u03AC\u03B6\u03B5\u03C4\u03B1\u03B9 \u03C3\u03C5\u03B3\u03BA\u03C1\u03AC\u03C4\u03B7\u03C3\u03B7", en: "3 \u00B7 Pain or anxiety on the face (may verbalise discomfort) but not moving or impeding the procedure \u2014 no restraint needed", v: 3 }, { el: "4 \u00B7 \u039A\u03B9\u03BD\u03B5\u03AF\u03C4\u03B1\u03B9 \u03BA\u03B1\u03B9 \u03C7\u03C1\u03B5\u03B9\u03AC\u03B6\u03B5\u03C4\u03B1\u03B9 \u03AE\u03C0\u03B9\u03B1 \u03B1\u03BA\u03B9\u03BD\u03B7\u03C4\u03BF\u03C0\u03BF\u03AF\u03B7\u03C3\u03B7 \u03B3\u03B9\u03B1 \u03C4\u03BF\u03C0\u03BF\u03B8\u03AD\u03C4\u03B7\u03C3\u03B7 \u2014 \u03C7\u03C9\u03C1\u03AF\u03C2 \u03BA\u03BB\u03AC\u03BC\u03B1 \u03AE \u03C6\u03C9\u03BD\u03AD\u03C2", en: "4 \u00B7 Moving, requiring gentle immobilisation for positioning \u2014 no crying or shouting", v: 4 }, { el: "5 \u00B7 \u039A\u03B9\u03BD\u03B5\u03AF\u03C4\u03B1\u03B9 \u03AD\u03C4\u03C3\u03B9 \u03CE\u03C3\u03C4\u03B5 \u03BD\u03B1 \u03B5\u03BC\u03C0\u03BF\u03B4\u03AF\u03B6\u03B5\u03B9 \u03C4\u03B7\u03BD \u03B5\u03C0\u03AD\u03BC\u03B2\u03B1\u03C3\u03B7 \u03BA\u03B1\u03B9 \u03B1\u03C0\u03B1\u03B9\u03C4\u03B5\u03AF \u0392\u0399\u0391\u0399\u0397 \u03B1\u03BA\u03B9\u03BD\u03B7\u03C4\u03BF\u03C0\u03BF\u03AF\u03B7\u03C3\u03B7 (\u03B7 \u03B2\u03B1\u03B8\u03BC\u03BF\u03BB\u03CC\u03B3\u03B7\u03C3\u03B7 \u03B2\u03B1\u03C3\u03AF\u03B6\u03B5\u03C4\u03B1\u03B9 \u03C3\u03C4\u03B7\u03BD \u03BA\u03AF\u03BD\u03B7\u03C3\u03B7)", en: "5 \u00B7 Moving in a way that impedes the proceduralist, requiring FORCEFUL immobilisation (scored on movement)", v: 5 }] }
    ],
    interp: (n) => {
      if (n === 2) return { lvl: "low",  el: "\u0399\u03B4\u03B1\u03BD\u03B9\u03BA\u03AE \u03BA\u03B1\u03C4\u03AC\u03C3\u03C4\u03B1\u03C3\u03B7 \u2014 \u03C7\u03C9\u03C1\u03AF\u03C2 \u03C0\u03CC\u03BD\u03BF, \u03C7\u03C9\u03C1\u03AF\u03C2 \u03BA\u03AF\u03BD\u03B7\u03C3\u03B7, \u03C6\u03C5\u03C3\u03B9\u03BF\u03BB\u03BF\u03B3\u03B9\u03BA\u03AC \u03B6\u03C9\u03C4\u03B9\u03BA\u03AC", en: "Ideal state \u2014 no pain, no movement, normal vital signs" };
      if (n === 3) return { lvl: "low",  el: "\u0394\u03C5\u03C3\u03C6\u03BF\u03C1\u03AF\u03B1 (\u03C0\u03CC\u03BD\u03BF\u03C2/\u03AC\u03B3\u03C7\u03BF\u03C2) \u03C7\u03C9\u03C1\u03AF\u03C2 \u03BA\u03AF\u03BD\u03B7\u03C3\u03B7 \u2014 \u03B9\u03B4\u03B1\u03BD\u03B9\u03BA\u03AE \u03B5\u03AF\u03BD\u03B1\u03B9 \u03B7 \u03BA\u03B1\u03C4\u03AC\u03C3\u03C4\u03B1\u03C3\u03B7 2", en: "Discomfort (pain/anxiety) without movement \u2014 state 2 is the ideal" };
      if (n === 4) return { lvl: "mid",  el: "\u0391\u03BD\u03B5\u03C0\u03B1\u03C1\u03BA\u03AE\u03C2 \u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03BF\u03BB\u03AE \u2014 \u03BA\u03AF\u03BD\u03B7\u03C3\u03B7 \u03C0\u03BF\u03C5 \u03B1\u03C0\u03B1\u03B9\u03C4\u03B5\u03AF \u03AE\u03C0\u03B9\u03B1 \u03B1\u03BA\u03B9\u03BD\u03B7\u03C4\u03BF\u03C0\u03BF\u03AF\u03B7\u03C3\u03B7", en: "Inadequate sedation \u2014 movement needing gentle immobilisation" };
      if (n === 5) return { lvl: "high", el: "\u0391\u03BD\u03B5\u03C0\u03B1\u03C1\u03BA\u03AE\u03C2 \u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03BF\u03BB\u03AE \u2014 \u03B7 \u03B5\u03C0\u03AD\u03BC\u03B2\u03B1\u03C3\u03B7 \u03B5\u03BC\u03C0\u03BF\u03B4\u03AF\u03B6\u03B5\u03C4\u03B1\u03B9\u00B7 \u03B5\u03C0\u03B1\u03BD\u03B5\u03BA\u03C4\u03B9\u03BC\u03AE\u03C3\u03C4\u03B5 \u03C4\u03B7\u03BD \u03C4\u03B5\u03C7\u03BD\u03B9\u03BA\u03AE", en: "Inadequate sedation \u2014 the procedure is impeded; reassess the technique" };
      if (n === 1) return { lvl: "high", el: "\u03A5\u03C0\u03B5\u03C1\u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03BF\u03BB\u03AE \u2014 \u03B1\u03C0\u03B1\u03B9\u03C4\u03B5\u03AF\u03C4\u03B1\u03B9 \u03C5\u03C0\u03BF\u03C3\u03C4\u03AE\u03C1\u03B9\u03BE\u03B7 \u03B1\u03B5\u03C1\u03B1\u03B3\u03C9\u03B3\u03BF\u03CD", en: "Over-sedation \u2014 airway support required" };
      return { lvl: "high", el: "\u03A5\u03C0\u03B5\u03C1\u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03BF\u03BB\u03AE \u03BC\u03B5 \u03B1\u03B9\u03BC\u03BF\u03B4\u03C5\u03BD\u03B1\u03BC\u03B9\u03BA\u03AE/\u03B1\u03BD\u03B1\u03C0\u03BD\u03B5\u03C5\u03C3\u03C4\u03B9\u03BA\u03AE \u03B5\u03C0\u03B9\u03B2\u03AC\u03C1\u03C5\u03BD\u03C3\u03B7 \u2014 \u03B5\u03C0\u03B5\u03BC\u03B2\u03B5\u03AF\u03C4\u03B5 \u03C4\u03CE\u03C1\u03B1", en: "Over-sedation with physiological compromise \u2014 intervene now" };
    },
    src: "Validation of the Pediatric Sedation State Scale. Pediatrics, \u039C\u03AC\u03B9\u03BF\u03C2 2017. \u0391\u03BE\u03B9\u03BF\u03C0\u03B9\u03C3\u03C4\u03AF\u03B1 \u03BC\u03B5\u03C4\u03B1\u03BE\u03CD \u03C0\u03B1\u03C1\u03B1\u03C4\u03B7\u03C1\u03B7\u03C4\u03CE\u03BD ICC 0.994. \u0399\u03B4\u03B1\u03BD\u03B9\u03BA\u03AE \u03BA\u03B1\u03C4\u03AC\u03C3\u03C4\u03B1\u03C3\u03B7: 2 (\u03BA\u03B1\u03B9 \u03C3\u03C4\u03CC\u03C7\u03BF\u03C2 \u03C3\u03B5 \u03C0\u03C1\u03C9\u03C4\u03CC\u03BA\u03BF\u03BB\u03BB\u03B1 \u03BA\u03BB\u03B9\u03BD\u03B9\u03BA\u03CE\u03BD \u03BC\u03B5\u03BB\u03B5\u03C4\u03CE\u03BD). \u0391\u03BE\u03B9\u03BF\u03BB\u03BF\u03B3\u03B5\u03AF \u03C4\u03B7\u03BD \u03BA\u03B1\u03C4\u03AC\u03C3\u03C4\u03B1\u03C3\u03B7 \u03C4\u03B7 \u03C3\u03C4\u03B9\u03B3\u03BC\u03AE \u03C4\u03B7\u03C2 \u03B5\u03C0\u03AD\u03BC\u03B2\u03B1\u03C3\u03B7\u03C2, \u03CC\u03C7\u03B9 \u03BC\u03CC\u03BD\u03BF \u03C4\u03BF \u03B2\u03AC\u03B8\u03BF\u03C2 \u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03BF\u03BB\u03AE\u03C2."
  }
];
// Adult limits. Each row names its source (SmPC or clinical practice) in noteEl/noteEn.
const LA_LIST = [
  { id: "lido", name: "Lidocaine", perKg: 3, abs: 200, concs: [0.5, 1, 1.5, 2], noteEl: "\u039A\u03BB\u03B9\u03BD\u03B9\u03BA\u03AE \u03C0\u03C1\u03B1\u03BA\u03C4\u03B9\u03BA\u03AE (\u03C3\u03C5\u03BD\u03C4\u03B7\u03C1\u03B7\u03C4\u03B9\u03BA\u03CC) 3 mg/kg \u00B7 SmPC: 4.5 mg/kg, max 200 mg (Lidocaine 1%, hameln)", noteEn: "Clinical practice (conservative) 3 mg/kg \u00B7 SmPC: 4.5 mg/kg, max 200 mg (Lidocaine 1%, hameln)" },
  { id: "lido_epi", name: "Lidocaine + Epi", perKg: 7, abs: 500, concs: [0.5, 1, 1.5, 2], noteEl: "SmPC: max 500 mg (Lidocaine 2% + adrenaline 1:200.000, Aspen) \u00B7 7 mg/kg \u03BA\u03B1\u03C4\u03AC ASRA", noteEn: "SmPC: max 500 mg (Lidocaine 2% + adrenaline 1:200,000, Aspen) \u00B7 7 mg/kg per ASRA" },
  { id: "mepi", name: "Mepivacaine", perKg: 4.4, abs: 300, absByConc: { 1: 300, 2: 400 }, concs: [1, 2], noteEl: "SmPC Mepivaca\u00EDna Normon: \u03B1\u03C0\u03BF\u03BA\u03BB\u03B5\u03B9\u03C3\u03BC\u03BF\u03AF \u03AD\u03C9\u03C2 300 mg (1%) / 400 mg (2%), \u03B4\u03B9\u03AE\u03B8\u03B7\u03C3\u03B7 \u03AD\u03C9\u03C2 200 mg \u2014 \u03C7\u03C9\u03C1\u03AF\u03C2 \u03CC\u03C1\u03B9\u03BF \u03B1\u03BD\u03AC kg \u03C3\u03B5 \u03B5\u03BD\u03AE\u03BB\u03B9\u03BA\u03B5\u03C2\u00B7 \u03C4\u03BF 4.4 mg/kg \u03B5\u03AF\u03BD\u03B1\u03B9 \u03B1\u03C0\u03CC \u03C4\u03BF Scandonest SmPC (\u03BF\u03B4\u03BF\u03BD\u03C4\u03B9\u03B1\u03C4\u03C1\u03B9\u03BA\u03CC)", noteEn: "Mepivaca\u00EDna Normon SmPC: blocks up to 300 mg (1%) / 400 mg (2%), infiltration up to 200 mg \u2014 no per-kg adult limit; 4.4 mg/kg is from the Scandonest SmPC (dental)" },
  { id: "prilo", name: "Prilocaine", perKg: 6, abs: 400, concs: [0.5, 1, 2], noteEl: "SmPC: max 400 mg (Prilocaine 1%, Aspen) \u00B7 6 mg/kg: \u03BA\u03BB\u03B9\u03BD\u03B9\u03BA\u03AE \u03C0\u03C1\u03B1\u03BA\u03C4\u03B9\u03BA\u03AE", noteEn: "SmPC: max 400 mg (Prilocaine 1%, Aspen) \u00B7 6 mg/kg: clinical practice" },
  { id: "bupi", name: "Bupivacaine", perKg: 2, abs: 150, concs: [0.25, 0.5], noteEl: "SmPC: 150 mg \u03B5\u03C6\u03AC\u03C0\u03B1\u03BE, \u22642 mg/kg \u03B1\u03BD\u03AC 4 h (Marcain, Aspen)", noteEn: "SmPC: 150 mg single dose, \u22642 mg/kg in any 4 h (Marcain, Aspen)" },
  { id: "levo", name: "Levobupivacaine", perKg: 2, abs: 150, concs: [0.25, 0.5], noteEl: "SmPC Chirocaine: 150 mg \u03B5\u03C6\u03AC\u03C0\u03B1\u03BE, 400 mg/24 h \u2014 \u03B4\u03B5\u03BD \u03B4\u03AF\u03BD\u03B5\u03B9 \u03CC\u03C1\u03B9\u03BF \u03B1\u03BD\u03AC kg \u03C3\u03B5 \u03B5\u03BD\u03AE\u03BB\u03B9\u03BA\u03B5\u03C2\u00B7 \u03C4\u03BF 2 mg/kg \u03B5\u03AF\u03BD\u03B1\u03B9 \u03C3\u03C5\u03BD\u03C4\u03B7\u03C1\u03B7\u03C4\u03B9\u03BA\u03AE \u03C3\u03CD\u03BC\u03B2\u03B1\u03C3\u03B7 \u03C4\u03B7\u03C2 \u03B5\u03C6\u03B1\u03C1\u03BC\u03BF\u03B3\u03AE\u03C2", noteEn: "Chirocaine SmPC: 150 mg single dose, 400 mg/24 h \u2014 no per-kg adult limit; 2 mg/kg is an app conservative convention" },
  { id: "ropi", name: "Ropivacaine", perKg: 3, abs: 225, concs: [0.2, 0.375, 0.5, 0.75, 1], noteEl: "\u039A\u03BB\u03B9\u03BD\u03B9\u03BA\u03AE \u03C0\u03C1\u03B1\u03BA\u03C4\u03B9\u03BA\u03AE 3 mg/kg, max 225 mg \u00B7 SmPC Naropin: \u03B5\u03C6\u03AC\u03C0\u03B1\u03BE 300 mg \u03AD\u03B3\u03B9\u03BD\u03B5 \u03BA\u03B1\u03BB\u03AC \u03B1\u03BD\u03B5\u03BA\u03C4\u03AE", noteEn: "Clinical practice 3 mg/kg, max 225 mg \u00B7 Naropin SmPC: a single 300 mg dose was well tolerated" },
  { id: "chloro", name: "Chloroprocaine", perKg: 11, abs: 800, concs: [2], noteEl: "SmPC Ampres 20 mg/mL (\u03BA\u03C5\u03BA\u03BB\u03BF\u03C6\u03BF\u03C1\u03B5\u03AF \u03C3\u03C4\u03B7\u03BD \u0395\u03BB\u03BB\u03AC\u03B4\u03B1): \u03C0\u03B5\u03C1\u03B9\u03BD\u03B5\u03C5\u03C1\u03B9\u03BA\u03CC\u03C2 \u03B1\u03C0\u03BF\u03BA\u03BB\u03B5\u03B9\u03C3\u03BC\u03CC\u03C2 \u03C3\u03B5 \u03B5\u03BD\u03AE\u03BB\u03B9\u03BA\u03B5\u03C2, max 11 mg/kg, \u2264800 mg \u00B7 \u03C0\u03B1\u03B9\u03B4\u03B9\u03AC: \u03B4\u03B5\u03BD \u03AD\u03C7\u03B5\u03B9 \u03C4\u03B5\u03BA\u03BC\u03B7\u03C1\u03B9\u03C9\u03B8\u03B5\u03AF", noteEn: "Ampres 20 mg/mL SmPC (authorised in Greece): perineural block in adults, max 11 mg/kg, \u2264800 mg \u00B7 children: not established" }
];
