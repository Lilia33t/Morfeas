function PatientBar({ lang, weight, setWeight, age, setAge, height, setHeight, sex, setSex }) {
  const t = T[lang];
  const fieldStyle = { ...inputStyle, background: S.cardAlt, border: `1.5px solid ${S.line}`, color: S.ink, padding: "8px 8px", fontSize: 14 };
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
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, background: S.card, padding: "10px 12px", borderRadius: 16, boxShadow: "0 1px 3px rgba(80,64,48,0.06)", border: `1.5px solid ${S.line}` } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React.createElement("svg", { width: "24", height: "24", viewBox: "0 0 26 26", style: { flexShrink: 0 } }, /* @__PURE__ */ React.createElement("polyline", { points: "1,15 6,15 8,8 11,21 14,11 16,15 25,15", fill: "none", stroke: S.teal, strokeWidth: "2", strokeLinejoin: "round", strokeLinecap: "round" })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      inputMode: "decimal",
      value: weight,
      onChange: (e) => setWeight(e.target.value),
      placeholder: t.weight,
      "aria-label": t.weight,
      style: { ...fieldStyle, flex: 1.2, minWidth: 0 }
    }
  ), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      inputMode: "decimal",
      value: ageDisplay,
      onChange: (e) => onAgeChange(e.target.value),
      placeholder: ageUnit === "m" ? lang === "el" ? "\u0397\u03BB\u03B9\u03BA\u03AF\u03B1 (\u03BC)" : "Age (mo)" : t.age,
      "aria-label": t.age,
      style: { ...fieldStyle, flex: 1, minWidth: 0 }
    }
  ), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      inputMode: "decimal",
      value: height,
      onChange: (e) => setHeight(e.target.value),
      placeholder: t.height,
      "aria-label": t.height,
      style: { ...fieldStyle, flex: 1.1, minWidth: 0 }
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setSex(sex === "M" ? "F" : "M"),
      "aria-label": t.sex,
      style: {
        ...fieldStyle,
        flex: 0.6,
        minWidth: 42,
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
function MedsTab({ lang, weight, focus }) {
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
  const list = DRUGS.filter(
    (d) => (cat === "all" || d.cat === cat) && d.name.toLowerCase().includes(q.toLowerCase())
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
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700, fontSize: 15.5, color: S.ink } }, d.name), /* @__PURE__ */ React.createElement("span", { style: { color: S.muted, fontWeight: 600, fontSize: 18, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .15s" } }, "\u203A")), isOpen && /* @__PURE__ */ React.createElement("div", { style: { padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 10 } }, d.doses.map((ds, i) => {
      const dt = doseText(ds, w, lang);
      const isStr = typeof dt === "string";
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { background: S.bg, borderRadius: 10, padding: "9px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: S.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 } }, ds[lang]), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 4 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14.5, color: S.ink } }, isStr ? dt : dt.base), !isStr && w > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 800, fontSize: 16.5, color: dt.capped ? S.amber : S.teal, fontVariantNumeric: "tabular-nums" } }, "= ", dt.calc, dt.capped ? ` (${t.maxLabel})` : "")), ds.max && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: S.muted, fontWeight: 600 } }, t.maxLabel, ": ", ds.max, " ", ds.unit.split("/")[0]));
    }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: S.ink, lineHeight: 1.45 } }, /* @__PURE__ */ React.createElement("strong", { style: { color: S.teal } }, t.notes, ": "), lang === "el" ? d.notesEl : d.notesEn), (lang === "el" ? d.ciEl : d.ciEn) !== "\u2014" && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: S.red, lineHeight: 1.45 } }, /* @__PURE__ */ React.createElement("strong", null, t.ci, ": "), lang === "el" ? d.ciEl : d.ciEn), w > 0 && d.doses.some((ds) => typeof doseText(ds, w, lang) !== "string") && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: S.amber, fontWeight: 600, lineHeight: 1.4 } }, lang === "el" ? "\u26A0 \u03A5\u03C0\u03BF\u03BB\u03BF\u03B3\u03B9\u03C3\u03BC\u03AD\u03BD\u03B5\u03C2 \u03C4\u03B9\u03BC\u03AD\u03C2 \u03C3\u03C4\u03BF \u03B2\u03AC\u03C1\u03BF\u03C2 \u2014 \u03B5\u03C0\u03B1\u03BB\u03B7\u03B8\u03B5\u03CD\u03C3\u03C4\u03B5 \u03C0\u03C1\u03B9\u03BD \u03C4\u03B7 \u03C7\u03BF\u03C1\u03AE\u03B3\u03B7\u03C3\u03B7." : "\u26A0 Weight-calculated values \u2014 verify before administration.")));
  }));
}
function ChecklistTab({ lang, focus }) {
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
  const list = CHECKLISTS.filter((c) => {
    const title = (lang === "el" ? c.titleEl : c.titleEn).toLowerCase();
    return (cat === "all" || c.cat === cat) && title.includes(q.toLowerCase());
  });
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement(
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
    } }, nDone, "/", steps.length), /* @__PURE__ */ React.createElement("span", { style: { color: S.muted, fontWeight: 600, fontSize: 18, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .15s" } }, "\u203A")), isOpen && /* @__PURE__ */ React.createElement("div", { style: { padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 6 } }, steps.map((s, i) => {
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
    } }, /* @__PURE__ */ React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700, fontSize: 15.5, color: S.ink } }, m.name), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: S.muted, fontWeight: 600 } }, m.targetType)), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 8 } }, !ready && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: S.amber } }, "\u26A0"), ready && !valid && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: S.amber } }, "!"), valid && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: S.teal } }, "\u25CF"), /* @__PURE__ */ React.createElement("span", { style: { color: S.muted, fontWeight: 600, fontSize: 18, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .15s" } }, "\u203A"))), isOpen && /* @__PURE__ */ React.createElement("div", { style: { padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 10 } }, !ready && /* @__PURE__ */ React.createElement("div", { style: { background: S.tintNeutral, borderRadius: 10, padding: "9px 12px", fontSize: 13, color: S.amber, fontWeight: 600 } }, t.needCov, " ", missing.map((r) => covLabel[r][lang]).join(", ")), /* @__PURE__ */ React.createElement("div", { style: { background: S.bg, borderRadius: 10, padding: "9px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: S.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 } }, t.targetsHead), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: S.ink, lineHeight: 1.5 } }, lang === "el" ? m.targetsEl : m.targetsEn)), ready && v1 > 0 && !m.noBolus && /* @__PURE__ */ React.createElement("div", { style: { background: S.bg, borderRadius: 10, padding: "9px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: S.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 } }, t.bolusEst), /* @__PURE__ */ React.createElement(BolusRows, { drug, v1, lang }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: S.muted, fontWeight: 600, marginTop: 4 } }, "V1 \u2248 ", fmt(v1), " L \xB7 ", lang === "el" ? "\u03C0\u03BF\u03C3\u03CC\u03C4\u03B7\u03C4\u03B1 = \u03C3\u03C4\u03CC\u03C7\u03BF\u03C2 \xD7 V1 (\u03BF \u03B1\u03BB\u03B3\u03CC\u03C1\u03B9\u03B8\u03BC\u03BF\u03C2 TCI \u03C4\u03BF \u03B1\u03BD\u03B1\u03BB\u03B1\u03BC\u03B2\u03AC\u03BD\u03B5\u03B9)" : "amount = target \xD7 V1 (your TCI pump handles this)")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: S.ink, lineHeight: 1.45 } }, /* @__PURE__ */ React.createElement("strong", { style: { color: S.teal } }, lang === "el" ? "\u03A0\u03B5\u03B4\u03AF\u03BF" : "Range", ": "), lang === "el" ? m.rangeEl : m.rangeEn), ready && !valid && (m.warnEl || m.warnEn) && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: S.amber, lineHeight: 1.45, fontWeight: 600 } }, "\u26A0 ", lang === "el" ? m.warnEl || "\u0395\u03BA\u03C4\u03CC\u03C2 \u03B5\u03CD\u03C1\u03BF\u03C5\u03C2 \u03B5\u03C0\u03B9\u03BA\u03CD\u03C1\u03C9\u03C3\u03B7\u03C2" : m.warnEn || "Outside validation range"), ready && !valid && !(m.warnEl || m.warnEn) && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: S.amber, lineHeight: 1.45, fontWeight: 600 } }, "\u26A0 ", lang === "el" ? "\u0391\u03C3\u03B8\u03B5\u03BD\u03AE\u03C2 \u03B5\u03BA\u03C4\u03CC\u03C2 \u03B5\u03CD\u03C1\u03BF\u03C5\u03C2 \u03B5\u03C0\u03B9\u03BA\u03CD\u03C1\u03C9\u03C3\u03B7\u03C2 \u03C4\u03BF\u03C5 \u03BC\u03BF\u03BD\u03C4\u03AD\u03BB\u03BF\u03C5." : "Patient outside the model's validation range.")));
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
  { name: "LMWH \u03C5\u03C8\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7 (>50 IU anti-Xa/kg/24h)", nameEn: "LMWH high dose (>50 IU anti-Xa/kg/day)", stopEl: "24 h \u00B7 CrCl <30: 48 h (\u03AE \u03BC\u03B9\u03C3\u03AE \u03B4\u03CC\u03C3\u03B7)", stopEn: "24 h \u00B7 CrCl <30: 48 h (or halve the dose)", restartEl: "~24 h (48\u201372 h \u03BC\u03B5\u03C4\u03AC \u03B1\u03C0\u03CC \u03B5\u03C0\u03AD\u03BC\u03B2\u03B1\u03C3\u03B7 \u03C5\u03C8\u03B7\u03BB\u03BF\u03CD \u03B1\u03B9\u03BC\u03BF\u03C1\u03C1\u03B1\u03B3\u03B9\u03BA\u03BF\u03CD \u03BA\u03B9\u03BD\u03B4\u03CD\u03BD\u03BF\u03C5) \u00B7 \u03BC\u03CC\u03BD\u03BF \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7\u03BD \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03C4\u03BF\u03C5 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1", restartEn: "~24 h (48\u201372 h after a high-bleeding-risk procedure) \u00B7 only after catheter removal", noteEl: "1C. \u03A3\u03C4\u03CC\u03C7\u03BF\u03C2 anti-Xa \u22640.1 IU/mL, \u03B9\u03B4\u03AF\u03C9\u03C2 \u03C3\u03B5 CrCl <30. \u039C\u03AD\u03C4\u03C1\u03B7\u03C3\u03B7 anti-Xa \u03BA\u03B1\u03B9 \u03C3\u03B5 \u03B7\u03BB\u03B9\u03BA\u03B9\u03C9\u03BC\u03AD\u03BD\u03BF\u03C5\u03C2, \u03B5\u03CD\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03BF\u03C5\u03C2 \u03AE \u03C0\u03BF\u03BB\u03CD \u03C7\u03B1\u03BC\u03B7\u03BB\u03CC \u03B2\u03AC\u03C1\u03BF\u03C2 (2C).", noteEn: "1C. Target anti-Xa \u22640.1 IU/mL, especially if CrCl <30. Also measure anti-Xa in older, frail or very low body weight patients (2C)." },
  { name: "UFH \u03C7\u03B1\u03BC\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7 (SC \u2264200 IU/kg/24h, IV \u2264100 IU/kg/24h)", nameEn: "UFH low dose (SC \u2264200 IU/kg/day, IV \u2264100 IU/kg/day)", stopEl: "4 h", stopEn: "4 h", restartEl: "1 h \u03B3\u03B9\u03B1 IV \u03C3\u03B5 \u03B1\u03B3\u03B3\u03B5\u03B9\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE", restartEn: "1 h for IV in vascular surgery", noteEl: "1C. \u03A7\u03C9\u03C1\u03AF\u03C2 \u03B5\u03C1\u03B3\u03B1\u03C3\u03C4\u03B7\u03C1\u03B9\u03B1\u03BA\u03CC \u03AD\u03BB\u03B5\u03B3\u03C7\u03BF.", noteEn: "1C. No testing." },
  { name: "UFH \u03C5\u03C8\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7", nameEn: "UFH high dose", stopEl: "IV: 6 h \u00B7 SC: 12 h \u2014 \u03BA\u03B1\u03B9 \u03C6\u03C5\u03C3\u03B9\u03BF\u03BB\u03BF\u03B3\u03B9\u03BA\u03CC aPTT/anti-Xa/ACT", stopEn: "IV: 6 h \u00B7 SC: 12 h \u2014 and normal aPTT/anti-Xa/ACT", restartEl: "\u039C\u03CC\u03BD\u03BF \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7\u03BD \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03C4\u03BF\u03C5 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1", restartEn: "Only after catheter removal", noteEl: "2C. \u0395\u03BD\u03B4\u03B9\u03AC\u03BC\u03B5\u03C3\u03B1 \u03B5\u03C0\u03B9\u03C4\u03C1\u03AD\u03C0\u03B5\u03C4\u03B1\u03B9 \u03C7\u03B1\u03BC\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7 UFH \u03AE LMWH \u03BC\u03B5 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1 in situ.", noteEn: "2C. Low-dose UFH or LMWH may be used in the interim with a catheter in situ." },
  { name: "\u03A6\u03BF\u03BD\u03C4\u03B1\u03C0\u03B1\u03C1\u03B9\u03BD\u03BF\u03CD\u03BE\u03B7 \u03C7\u03B1\u03BC\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7 (2.5 mg/24h)", nameEn: "Fondaparinux low dose (2.5 mg/day)", stopEl: "36 h \u00B7 CrCl <50: 72 h (\u03AE \u03BC\u03B5\u03AF\u03C9\u03C3\u03B7 \u03C3\u03B5 1.5 mg/24h)", stopEn: "36 h \u00B7 CrCl <50: 72 h (or reduce to 1.5 mg/day)", restartEl: "\u039A\u03B1\u03C4\u03AC \u03C4\u03B9\u03C2 \u03BF\u03B4\u03B7\u03B3\u03AF\u03B5\u03C2 \u03C0\u03C1\u03BF\u03C6\u03CD\u03BB\u03B1\u03BE\u03B7\u03C2 \u03A6\u0398\u0395", restartEn: "Per VTE prophylaxis guidelines", noteEl: "1C. \u03A7\u03C9\u03C1\u03AF\u03C2 \u03B5\u03C1\u03B3\u03B1\u03C3\u03C4\u03B7\u03C1\u03B9\u03B1\u03BA\u03CC \u03AD\u03BB\u03B5\u03B3\u03C7\u03BF.", noteEn: "1C. No testing." },
  { name: "\u03A6\u03BF\u03BD\u03C4\u03B1\u03C0\u03B1\u03C1\u03B9\u03BD\u03BF\u03CD\u03BE\u03B7 \u03C5\u03C8\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7 (>2.5 mg/24h)", nameEn: "Fondaparinux high dose (>2.5 mg/day)", stopEl: "\u0394\u0395\u039D \u03C3\u03C5\u03BD\u03B9\u03C3\u03C4\u03AC\u03C4\u03B1\u03B9 \u03BD\u03B5\u03C5\u03C1\u03B1\u03BE\u03BF\u03BD\u03B9\u03BA\u03AE \u00B7 \u03B1\u03BD \u03B1\u03BD\u03B1\u03C0\u03CC\u03C6\u03B5\u03C5\u03BA\u03C4\u03BF ~4 \u03B7\u03BC\u03AD\u03C1\u03B5\u03C2", stopEn: "Neuraxial NOT recommended \u00B7 if unavoidable ~4 days", restartEl: "\u039A\u03B1\u03C4\u03AC \u03C4\u03B9\u03C2 \u03BF\u03B4\u03B7\u03B3\u03AF\u03B5\u03C2 \u03B8\u03B5\u03C1\u03B1\u03C0\u03B5\u03C5\u03C4\u03B9\u03BA\u03AE\u03C2 \u03B1\u03BD\u03C4\u03B9\u03C0\u03B7\u03BE\u03AF\u03B1\u03C2", restartEn: "Per therapeutic anticoagulation guidelines", noteEl: "1C. \u0391\u03BD \u03B5\u03AF\u03BD\u03B1\u03B9 \u03B1\u03BD\u03B1\u03C0\u03CC\u03C6\u03B5\u03C5\u03BA\u03C4\u03BF, \u03C3\u03C4\u03CC\u03C7\u03BF\u03C2 \u03B2\u03B1\u03B8\u03BC\u03BF\u03BD\u03BF\u03BC\u03B7\u03BC\u03AD\u03BD\u03BF anti-Xa \u22640.1 IU/mL (2C).", noteEn: "1C. If unavoidable, target calibrated anti-Xa \u22640.1 IU/mL (2C)." },
  { name: "\u03A1\u03B9\u03B2\u03B1\u03C1\u03BF\u03BE\u03B1\u03BC\u03C0\u03AC\u03BD\u03B7 / \u0395\u03BD\u03C4\u03BF\u03BE\u03B1\u03BC\u03C0\u03AC\u03BD\u03B7 \u2014 \u03C7\u03B1\u03BC\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7", nameEn: "Rivaroxaban / Edoxaban \u2014 low dose", stopEl: "24 h \u00B7 CrCl <30: 30 h", stopEn: "24 h \u00B7 CrCl <30: 30 h", restartEl: "\u039A\u03B1\u03C4\u03AC \u03C4\u03B9\u03C2 \u03BF\u03B4\u03B7\u03B3\u03AF\u03B5\u03C2 \u03C0\u03C1\u03BF\u03C6\u03CD\u03BB\u03B1\u03BE\u03B7\u03C2 \u03A6\u0398\u0395 (\u03C3\u03C5\u03BD\u03AE\u03B8\u03C9\u03C2 ~6 h \u03BC\u03B5\u03C4\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC) \u00B7 \u03BC\u03CC\u03BD\u03BF \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7\u03BD \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03C4\u03BF\u03C5 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1", restartEn: "Per VTE prophylaxis guidelines (usually ~6 h postoperatively) \u00B7 only after catheter removal", noteEl: "1C. \u03A7\u03C9\u03C1\u03AF\u03C2 \u03B5\u03C1\u03B3\u03B1\u03C3\u03C4\u03B7\u03C1\u03B9\u03B1\u03BA\u03CC \u03AD\u03BB\u03B5\u03B3\u03C7\u03BF. \u03A7\u03B1\u03BC\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7 = \u03C0\u03C1\u03BF\u03C6\u03CD\u03BB\u03B1\u03BE\u03B7 \u03A6\u0398\u0395 \u03BC\u03B5\u03C4\u03AC \u03B1\u03C0\u03CC \u03BF\u03C1\u03B8\u03BF\u03C0\u03B1\u03B9\u03B4\u03B9\u03BA\u03AE \u03AE \u03C0\u03B1\u03C1\u03B1\u03C4\u03B5\u03C4\u03B1\u03BC\u03AD\u03BD\u03B7 \u03C0\u03C1\u03CC\u03BB\u03B7\u03C8\u03B7 \u03C5\u03C0\u03BF\u03C4\u03C1\u03BF\u03C0\u03AE\u03C2.", noteEn: "1C. No testing. Low dose = VTE prophylaxis after orthopaedic surgery or extended prevention of recurrence." },
  { name: "\u0391\u03C0\u03B9\u03BE\u03B1\u03BC\u03C0\u03AC\u03BD\u03B7 \u2014 \u03C7\u03B1\u03BC\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7", nameEn: "Apixaban \u2014 low dose", stopEl: "36 h", stopEn: "36 h", restartEl: "\u039A\u03B1\u03C4\u03AC \u03C4\u03B9\u03C2 \u03BF\u03B4\u03B7\u03B3\u03AF\u03B5\u03C2 \u03C0\u03C1\u03BF\u03C6\u03CD\u03BB\u03B1\u03BE\u03B7\u03C2 \u03A6\u0398\u0395 (\u03C3\u03C5\u03BD\u03AE\u03B8\u03C9\u03C2 ~6 h \u03BC\u03B5\u03C4\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC) \u00B7 \u03BC\u03CC\u03BD\u03BF \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7\u03BD \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03C4\u03BF\u03C5 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1", restartEn: "Per VTE prophylaxis guidelines (usually ~6 h postoperatively) \u00B7 only after catheter removal", noteEl: "1C. \u03A7\u03C9\u03C1\u03AF\u03C2 \u03B5\u03C1\u03B3\u03B1\u03C3\u03C4\u03B7\u03C1\u03B9\u03B1\u03BA\u03CC \u03AD\u03BB\u03B5\u03B3\u03C7\u03BF.", noteEn: "1C. No testing." },
  { name: "\u0386\u03BC\u03B5\u03C3\u03BF\u03B9 \u03B1\u03BD\u03B1\u03C3\u03C4\u03BF\u03BB\u03B5\u03AF\u03C2 Xa \u2014 \u03C5\u03C8\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7 (\u03C1\u03B9\u03B2\u03B1\u03C1\u03BF\u03BE\u03B1\u03BC\u03C0\u03AC\u03BD\u03B7, \u03B1\u03C0\u03B9\u03BE\u03B1\u03BC\u03C0\u03AC\u03BD\u03B7, \u03B5\u03BD\u03C4\u03BF\u03BE\u03B1\u03BC\u03C0\u03AC\u03BD\u03B7)", nameEn: "Direct Xa inhibitors \u2014 high dose (rivaroxaban, apixaban, edoxaban)", stopEl: "72 h \u00B7 CrCl <30: \u03BC\u03AD\u03C7\u03C1\u03B9 \u03B5\u03C1\u03B3\u03B1\u03C3\u03C4\u03B7\u03C1\u03B9\u03B1\u03BA\u03CC \u03C3\u03C4\u03CC\u03C7\u03BF", stopEn: "72 h \u00B7 CrCl <30: until laboratory target", restartEl: "~24 h (48\u201372 h \u03BC\u03B5\u03C4\u03AC \u03B1\u03C0\u03CC \u03B5\u03C0\u03AD\u03BC\u03B2\u03B1\u03C3\u03B7 \u03C5\u03C8\u03B7\u03BB\u03BF\u03CD \u03B1\u03B9\u03BC\u03BF\u03C1\u03C1\u03B1\u03B3\u03B9\u03BA\u03BF\u03CD \u03BA\u03B9\u03BD\u03B4\u03CD\u03BD\u03BF\u03C5) \u00B7 \u03BC\u03CC\u03BD\u03BF \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7\u03BD \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03C4\u03BF\u03C5 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1", restartEn: "~24 h (48\u201372 h after a high-bleeding-risk procedure) \u00B7 only after catheter removal", noteEl: "1C. \u03A3\u03C4\u03CC\u03C7\u03BF\u03C2 \u03B5\u03C0\u03AF\u03C0\u03B5\u03B4\u03BF <30 ng/mL \u03AE anti-Xa \u22640.1 IU/mL. \u039C\u03AD\u03C4\u03C1\u03B7\u03C3\u03B7 \u03C3\u03C5\u03BD\u03B9\u03C3\u03C4\u03AC\u03C4\u03B1\u03B9 \u03C3\u03B5 CrCl <30 (2C).", noteEn: "1C. Target level <30 ng/mL or anti-Xa \u22640.1 IU/mL. Measurement advised if CrCl <30 (2C)." },
  { name: "\u039D\u03C4\u03B1\u03BC\u03C0\u03B9\u03B3\u03BA\u03B1\u03C4\u03C1\u03AC\u03BD\u03B7 \u2014 \u03C7\u03B1\u03BC\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7", nameEn: "Dabigatran \u2014 low dose", stopEl: "48 h", stopEn: "48 h", restartEl: "\u039A\u03B1\u03C4\u03AC \u03C4\u03B9\u03C2 \u03BF\u03B4\u03B7\u03B3\u03AF\u03B5\u03C2 \u03C0\u03C1\u03BF\u03C6\u03CD\u03BB\u03B1\u03BE\u03B7\u03C2 \u03A6\u0398\u0395 (\u03C3\u03C5\u03BD\u03AE\u03B8\u03C9\u03C2 ~6 h \u03BC\u03B5\u03C4\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC) \u00B7 \u03BC\u03CC\u03BD\u03BF \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7\u03BD \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03C4\u03BF\u03C5 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1", restartEn: "Per VTE prophylaxis guidelines (usually ~6 h postoperatively) \u00B7 only after catheter removal", noteEl: "1C. \u03A7\u03C9\u03C1\u03AF\u03C2 \u03B5\u03C1\u03B3\u03B1\u03C3\u03C4\u03B7\u03C1\u03B9\u03B1\u03BA\u03CC \u03AD\u03BB\u03B5\u03B3\u03C7\u03BF.", noteEn: "1C. No testing." },
  { name: "\u039D\u03C4\u03B1\u03BC\u03C0\u03B9\u03B3\u03BA\u03B1\u03C4\u03C1\u03AC\u03BD\u03B7 \u2014 \u03C5\u03C8\u03B7\u03BB\u03AE \u03B4\u03CC\u03C3\u03B7", nameEn: "Dabigatran \u2014 high dose", stopEl: "72 h \u00B7 CrCl <50: \u03BC\u03AD\u03C7\u03C1\u03B9 \u03B5\u03C1\u03B3\u03B1\u03C3\u03C4\u03B7\u03C1\u03B9\u03B1\u03BA\u03CC \u03C3\u03C4\u03CC\u03C7\u03BF", stopEn: "72 h \u00B7 CrCl <50: until laboratory target", restartEl: "~24 h (48\u201372 h \u03BC\u03B5\u03C4\u03AC \u03B1\u03C0\u03CC \u03B5\u03C0\u03AD\u03BC\u03B2\u03B1\u03C3\u03B7 \u03C5\u03C8\u03B7\u03BB\u03BF\u03CD \u03B1\u03B9\u03BC\u03BF\u03C1\u03C1\u03B1\u03B3\u03B9\u03BA\u03BF\u03CD \u03BA\u03B9\u03BD\u03B4\u03CD\u03BD\u03BF\u03C5) \u00B7 \u03BC\u03CC\u03BD\u03BF \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7\u03BD \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03C4\u03BF\u03C5 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1", restartEn: "~24 h (48\u201372 h after a high-bleeding-risk procedure) \u00B7 only after catheter removal", noteEl: "1C. \u03A3\u03C4\u03CC\u03C7\u03BF\u03C2 \u03B5\u03C0\u03AF\u03C0\u03B5\u03B4\u03BF <30 ng/mL \u03AE \u03C6\u03C5\u03C3\u03B9\u03BF\u03BB\u03BF\u03B3\u03B9\u03BA\u03CC\u03C2 \u03C7\u03C1\u03CC\u03BD\u03BF\u03C2 \u03B8\u03C1\u03BF\u03BC\u03B2\u03AF\u03BD\u03B7\u03C2. \u039C\u03AD\u03C4\u03C1\u03B7\u03C3\u03B7 \u03C3\u03B5 CrCl <50 (2C). ESAIC/ESRA: \u03B7 \u03C0\u03BB\u03AE\u03C1\u03B7\u03C2 \u03B1\u03BD\u03B1\u03C3\u03C4\u03C1\u03BF\u03C6\u03AE \u03BC\u03B5 \u03B9\u03BD\u03C4\u03B1\u03C1\u03BF\u03C5\u03C3\u03B9\u03B6\u03BF\u03C5\u03BC\u03AC\u03BC\u03C0\u03B7 \u03B5\u03C0\u03B9\u03C4\u03C1\u03AD\u03C0\u03B5\u03B9 \u03BD\u03B5\u03C5\u03C1\u03B1\u03BE\u03BF\u03BD\u03B9\u03BA\u03AE \u03C3\u03B5 \u03B5\u03C0\u03B5\u03AF\u03B3\u03BF\u03BD (2C) \u2014 \u0397 ASRA 2025 \u03A3\u03A5\u039D\u0399\u03A3\u03A4\u0391 \u03A4\u039F \u0391\u039D\u03A4\u0399\u0398\u0395\u03A4\u039F. \u0394\u03B9\u03B1\u03C3\u03C4\u03AE\u03BC\u03B1\u03C4\u03B1 ASRA 2025: 72\u2013120 h \u03B1\u03BD\u03AC\u03BB\u03BF\u03B3\u03B1 \u03BC\u03B5 CrCl, \u03AD\u03C9\u03C2 5 \u03B7\u03BC\u03AD\u03C1\u03B5\u03C2 \u03B1\u03BD CrCl <50.", noteEn: "1C. Target level <30 ng/mL or normal thrombin time. Measure if CrCl <50 (2C). ESAIC/ESRA: full reversal with idarucizumab permits neuraxial procedures in an emergency (2C) \u2014 ASRA 2025 ADVISES AGAINST THIS. ASRA 2025 intervals: 72\u2013120 h depending on CrCl, up to 5 days if CrCl <50." },
  { name: "\u03A3\u03C5\u03BD\u03B4\u03C5\u03B1\u03C3\u03BC\u03BF\u03AF \u03B1\u03BD\u03C4\u03B9\u03B8\u03C1\u03BF\u03BC\u03B2\u03C9\u03C4\u03B9\u03BA\u03CE\u03BD", nameEn: "Combinations of antithrombotic drugs", stopEl: "\u03A4\u03BF \u039C\u0395\u0393\u0391\u039B\u03A5\u03A4\u0395\u03A1\u039F \u03B4\u03B9\u03AC\u03C3\u03C4\u03B7\u03BC\u03B1 \u03B1\u03C0\u03CC \u03C4\u03B1 \u03B5\u03C0\u03B9\u03BC\u03AD\u03C1\u03BF\u03C5\u03C2 \u03C6\u03AC\u03C1\u03BC\u03B1\u03BA\u03B1", stopEn: "The LONGEST interval of the individual drugs", restartEl: "\u039A\u03B1\u03C4\u03AC \u03C4\u03B9\u03C2 \u03BF\u03B4\u03B7\u03B3\u03AF\u03B5\u03C2 \u03B8\u03B5\u03C1\u03B1\u03C0\u03B5\u03C5\u03C4\u03B9\u03BA\u03AE\u03C2 \u03B1\u03BD\u03C4\u03B9\u03C0\u03B7\u03BE\u03AF\u03B1\u03C2 (~24 h)", restartEn: "Per therapeutic anticoagulation guidelines (~24 h)", noteEl: "1C. \u039C\u03B5\u03C4\u03C1\u03AC \u03C4\u03BF \u03BC\u03B5\u03B3\u03B1\u03BB\u03CD\u03C4\u03B5\u03C1\u03BF \u03B4\u03B9\u03AC\u03C3\u03C4\u03B7\u03BC\u03B1 \u03B1\u03C0\u03CC \u03C4\u03B1 \u03B5\u03C0\u03B9\u03BC\u03AD\u03C1\u03BF\u03C5\u03C2 \u03C6\u03AC\u03C1\u03BC\u03B1\u03BA\u03B1.", noteEn: "1C. The longest interval of the individual drugs applies." },
  { name: "\u0398\u03C1\u03BF\u03BC\u03B2\u03BF\u03BB\u03C5\u03C4\u03B9\u03BA\u03AC", nameEn: "Thrombolytics", stopEl: "\u038C\u03C7\u03B9 \u03B2\u03B5\u03BB\u03CC\u03BD\u03B1 \u03B3\u03B9\u03B1 \u226548 h \u03BC\u03B5\u03C4\u03AC \u03C4\u03B7 \u03B8\u03C1\u03BF\u03BC\u03B2\u03CC\u03BB\u03C5\u03C3\u03B7 \u00B7 \u03C4\u03B5\u03BA\u03BC\u03B7\u03C1\u03AF\u03C9\u03C3\u03B7 \u03C6\u03C5\u03C3\u03B9\u03BF\u03BB\u03BF\u03B3\u03B9\u03BA\u03BF\u03CD \u03B5\u03BB\u03AD\u03B3\u03C7\u03BF\u03C5 \u03C0\u03AE\u03BE\u03B7\u03C2 (\u03BC\u03B5 \u03B9\u03BD\u03C9\u03B4\u03BF\u03B3\u03CC\u03BD\u03BF) (ASRA 2025)", stopEn: "No needle placement for \u226548 h after thrombolysis \u00B7 document normal clotting studies incl. fibrinogen (ASRA 2025)", restartEl: "\u0395\u03BE\u03B1\u03C4\u03BF\u03BC\u03B9\u03BA\u03B5\u03C5\u03BC\u03AD\u03BD\u03B1, \u03B4\u03B9\u03B5\u03C0\u03B9\u03C3\u03C4\u03B7\u03BC\u03BF\u03BD\u03B9\u03BA\u03AC", restartEn: "Individualised, multidisciplinary", noteEl: "\u0397 ESAIC/ESRA 2022 \u03B4\u03B5\u03BD \u03B4\u03AF\u03BD\u03B5\u03B9 \u03C3\u03CD\u03C3\u03C4\u03B1\u03C3\u03B7. ASRA 2025: \u03BD\u03B5\u03C5\u03C1\u03BF\u03BB\u03BF\u03B3\u03B9\u03BA\u03CC\u03C2 \u03AD\u03BB\u03B5\u03B3\u03C7\u03BF\u03C2 \u03B1\u03BD\u03AC ~2 h \u03B3\u03B9\u03B1 \u226548 h\u00B7 \u03B3\u03B9\u03B1 \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1 \u03B4\u03B5\u03BD \u03C5\u03C0\u03AC\u03C1\u03C7\u03B5\u03B9 \u03BF\u03C1\u03B9\u03C3\u03C4\u03B9\u03BA\u03AE \u03C3\u03CD\u03C3\u03C4\u03B1\u03C3\u03B7 \u2014 \u03BC\u03AD\u03C4\u03C1\u03B7\u03C3\u03B7 \u03B9\u03BD\u03C9\u03B4\u03BF\u03B3\u03CC\u03BD\u03BF\u03C5.", noteEn: "ESAIC/ESRA 2022 gives no recommendation. ASRA 2025: neurological checks every ~2 h for \u226548 h; no definitive recommendation for catheter removal \u2014 measure fibrinogen." }
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
const LA_LIST = [
  { id: "lido", name: "Lidocaine", perKg: 3, abs: 200, concs: [0.5, 1, 1.5, 2], noteEl: "\u039A\u03BB\u03B9\u03BD\u03B9\u03BA\u03AE \u03C0\u03C1\u03B1\u03BA\u03C4\u03B9\u03BA\u03AE (\u03C3\u03C5\u03BD\u03C4\u03B7\u03C1\u03B7\u03C4\u03B9\u03BA\u03CC) \u00B7 SmPC: 4.5 mg/kg, max 200 mg", noteEn: "Clinical practice (conservative) \u00B7 SmPC: 4.5 mg/kg, max 200 mg" },
  { id: "lido_epi", name: "Lidocaine + Epi", perKg: 7, abs: 500, concs: [0.5, 1, 1.5, 2] },
  { id: "mepi", name: "Mepivacaine", perKg: 4.4, abs: 350, concs: [1, 1.5, 2] },
  { id: "prilo", name: "Prilocaine", perKg: 6, abs: 400, concs: [0.5, 1, 2] },
  { id: "bupi", name: "Bupivacaine", perKg: 2, abs: 150, concs: [0.25, 0.5] },
  { id: "levo", name: "Levobupivacaine", perKg: 2, abs: 150, concs: [0.25, 0.5] },
  { id: "ropi", name: "Ropivacaine", perKg: 3, abs: 225, concs: [0.2, 0.375, 0.5, 0.75, 1] },
  { id: "chloro", name: "Chloroprocaine", perKg: 11, abs: 800, concs: [1, 2, 3] }
];
