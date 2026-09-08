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
    } }, "\u21BA ", lang === "el" ? "\u0395\u03C0\u03B1\u03BD\u03B1\u03C6\u03BF\u03C1\u03AC" : "Reset")));
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
  const v1Of = (m) => m.v1Fixed != null ? m.v1Fixed : m.v1k != null && c.w ? m.v1k * c.w : null;
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
    } }, /* @__PURE__ */ React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700, fontSize: 15.5, color: S.ink } }, m.name), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: S.muted, fontWeight: 600 } }, m.targetType)), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 8 } }, !ready && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: S.amber } }, "\u26A0"), ready && !valid && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: S.amber } }, "!"), valid && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: S.teal } }, "\u25CF"), /* @__PURE__ */ React.createElement("span", { style: { color: S.muted, fontWeight: 600, fontSize: 18, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .15s" } }, "\u203A"))), isOpen && /* @__PURE__ */ React.createElement("div", { style: { padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 10 } }, !ready && /* @__PURE__ */ React.createElement("div", { style: { background: S.tintNeutral, borderRadius: 10, padding: "9px 12px", fontSize: 13, color: S.amber, fontWeight: 600 } }, t.needCov, " ", missing.map((r) => covLabel[r][lang]).join(", ")), /* @__PURE__ */ React.createElement("div", { style: { background: S.bg, borderRadius: 10, padding: "9px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: S.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 } }, t.targetsHead), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: S.ink, lineHeight: 1.5 } }, lang === "el" ? m.targetsEl : m.targetsEn)), ready && v1 && /* @__PURE__ */ React.createElement("div", { style: { background: S.bg, borderRadius: 10, padding: "9px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: S.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 } }, t.bolusEst), /* @__PURE__ */ React.createElement(BolusRows, { drug, v1, lang }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: S.muted, fontWeight: 600, marginTop: 4 } }, "V1 \u2248 ", fmt(v1), " L \xB7 ", lang === "el" ? "\u03C0\u03BF\u03C3\u03CC\u03C4\u03B7\u03C4\u03B1 = \u03C3\u03C4\u03CC\u03C7\u03BF\u03C2 \xD7 V1 (\u03BF \u03B1\u03BB\u03B3\u03CC\u03C1\u03B9\u03B8\u03BC\u03BF\u03C2 TCI \u03C4\u03BF \u03B1\u03BD\u03B1\u03BB\u03B1\u03BC\u03B2\u03AC\u03BD\u03B5\u03B9)" : "amount = target \xD7 V1 (your TCI pump handles this)")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: S.ink, lineHeight: 1.45 } }, /* @__PURE__ */ React.createElement("strong", { style: { color: S.teal } }, lang === "el" ? "\u03A0\u03B5\u03B4\u03AF\u03BF" : "Range", ": "), lang === "el" ? m.rangeEl : m.rangeEn), ready && !valid && (m.warnEl || m.warnEn) && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: S.amber, lineHeight: 1.45, fontWeight: 600 } }, "\u26A0 ", lang === "el" ? m.warnEl || "\u0395\u03BA\u03C4\u03CC\u03C2 \u03B5\u03CD\u03C1\u03BF\u03C5\u03C2 \u03B5\u03C0\u03B9\u03BA\u03CD\u03C1\u03C9\u03C3\u03B7\u03C2" : m.warnEn || "Outside validation range"), ready && !valid && !(m.warnEl || m.warnEn) && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: S.amber, lineHeight: 1.45, fontWeight: 600 } }, "\u26A0 ", lang === "el" ? "\u0391\u03C3\u03B8\u03B5\u03BD\u03AE\u03C2 \u03B5\u03BA\u03C4\u03CC\u03C2 \u03B5\u03CD\u03C1\u03BF\u03C5\u03C2 \u03B5\u03C0\u03B9\u03BA\u03CD\u03C1\u03C9\u03C3\u03B7\u03C2 \u03C4\u03BF\u03C5 \u03BC\u03BF\u03BD\u03C4\u03AD\u03BB\u03BF\u03C5." : "Patient outside the model's validation range.")));
  }));
}
function Chip({ label, val }) {
  return /* @__PURE__ */ React.createElement("div", { style: { background: S.card, borderRadius: 10, padding: "6px 11px", boxShadow: `inset 0 0 0 1.5px ${S.line}` } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: S.muted, fontWeight: 600 } }, label, " "), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5, color: S.ink, fontWeight: 800, fontVariantNumeric: "tabular-nums" } }, val));
}
function BolusRows({ drug, v1, lang }) {
  const sets = {
    Propofol: { unit: "\xB5g/mL", massUnit: "mg", div: 1e3, pts: [{ el: "\u0395\u03B9\u03C3\u03B1\u03B3\u03C9\u03B3\u03AE", en: "Induction", c: 4 }, { el: "\u03A3\u03C5\u03BD\u03C4\u03AE\u03C1\u03B7\u03C3\u03B7", en: "Maint.", c: 3 }] },
    Remifentanil: { unit: "ng/mL", massUnit: "\xB5g", div: 1e3, pts: [{ el: "\u0394\u03B9\u03B1\u03C3\u03C9\u03BB\u03AE\u03BD\u03C9\u03C3\u03B7", en: "Intubation", c: 6 }, { el: "\u03A3\u03C5\u03BD\u03C4\u03AE\u03C1\u03B7\u03C3\u03B7", en: "Maint.", c: 4 }] },
    Sufentanil: { unit: "ng/mL", massUnit: "\xB5g", div: 1e3, pts: [{ el: "\u0394\u03B9\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC", en: "Intraop", c: 0.4 }] },
    Alfentanil: { unit: "ng/mL", massUnit: "\xB5g", div: 1e3, pts: [{ el: "\u0394\u03B9\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC", en: "Intraop", c: 100 }] },
    Dexmedetomidine: { unit: "ng/mL", massUnit: "\xB5g", div: 1e3, pts: [{ el: "\u039A\u03B1\u03C4\u03B1\u03C3\u03C4\u03BF\u03BB\u03AE", en: "Sedation", c: 0.8 }] }
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
    name: "PADSS",
    items: [
      { el: "\u0396\u03C9\u03C4\u03B9\u03BA\u03AC \u03C3\u03B7\u03BC\u03B5\u03AF\u03B1 (vs \u03C0\u03C1\u03BF\u03B5\u03B3\u03C7.)", en: "Vital signs (vs preop)", opts: [
        { v: 2, el: "\xB120%", en: "\xB120%" },
        { v: 1, el: "\xB120\u201340%", en: "\xB120\u201340%" },
        { v: 0, el: ">\xB140%", en: ">\xB140%" }
      ] },
      { el: "\u0392\u03AC\u03B4\u03B9\u03C3\u03B7", en: "Ambulation", opts: [
        { v: 2, el: "\u03A3\u03C4\u03B1\u03B8\u03B5\u03C1\u03AE, \u03C7\u03C9\u03C1\u03AF\u03C2 \u03B6\u03AC\u03BB\u03B7", en: "Steady, no dizziness" },
        { v: 1, el: "\u039C\u03B5 \u03B2\u03BF\u03AE\u03B8\u03B5\u03B9\u03B1", en: "With assistance" },
        { v: 0, el: "\u0391\u03B4\u03C5\u03BD\u03B1\u03BC\u03AF\u03B1 \u03B2\u03AC\u03B4\u03B9\u03C3\u03B7\u03C2", en: "Unable" }
      ] },
      { el: "\u039D\u03B1\u03C5\u03C4\u03AF\u03B1/\u0388\u03BC\u03B5\u03C4\u03BF\u03C2", en: "Nausea/Vomiting", opts: [
        { v: 2, el: "\u0395\u03BB\u03AC\u03C7\u03B9\u03C3\u03C4\u03B7", en: "Minimal" },
        { v: 1, el: "\u039C\u03AD\u03C4\u03C1\u03B9\u03B1 (\u03B5\u03BB\u03AD\u03B3\u03C7\u03B5\u03C4\u03B1\u03B9)", en: "Moderate (controlled)" },
        { v: 0, el: "\u03A3\u03BF\u03B2\u03B1\u03C1\u03AE/\u03B5\u03C0\u03AF\u03BC\u03BF\u03BD\u03B7", en: "Severe/persistent" }
      ] },
      { el: "\u03A0\u03CC\u03BD\u03BF\u03C2", en: "Pain", opts: [
        { v: 2, el: "\u0391\u03C0\u03BF\u03B4\u03B5\u03BA\u03C4\u03CC\u03C2 (PO \u03B1\u03BD\u03B1\u03BB\u03B3\u03B7\u03C3\u03AF\u03B1)", en: "Acceptable (PO analgesia)" },
        { v: 1, el: "\u039F\u03C1\u03B9\u03B1\u03BA\u03AC \u03B1\u03C0\u03BF\u03B4\u03B5\u03BA\u03C4\u03CC\u03C2", en: "Marginally acceptable" },
        { v: 0, el: "\u039C\u03B7 \u03B1\u03C0\u03BF\u03B4\u03B5\u03BA\u03C4\u03CC\u03C2", en: "Unacceptable" }
      ] },
      { el: "\u03A7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE \u03B1\u03B9\u03BC\u03BF\u03C1\u03C1\u03B1\u03B3\u03AF\u03B1", en: "Surgical bleeding", opts: [
        { v: 2, el: "\u0395\u03BB\u03AC\u03C7\u03B9\u03C3\u03C4\u03B7", en: "Minimal" },
        { v: 1, el: "\u039C\u03AD\u03C4\u03C1\u03B9\u03B1", en: "Moderate" },
        { v: 0, el: "\u03A3\u03BF\u03B2\u03B1\u03C1\u03AE", en: "Severe" }
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
  {
    name: "\u0391\u03C3\u03C0\u03B9\u03C1\u03AF\u03BD\u03B7 / NSAIDs",
    nameEn: "Aspirin / NSAIDs",
    stopEl: "\u03A7\u03C9\u03C1\u03AF\u03C2 \u03C0\u03B5\u03C1\u03B9\u03BF\u03C1\u03B9\u03C3\u03BC\u03CC",
    stopEn: "No restriction",
    restartEl: "\u03A7\u03C9\u03C1\u03AF\u03C2 \u03C0\u03B5\u03C1\u03B9\u03BF\u03C1\u03B9\u03C3\u03BC\u03CC",
    restartEn: "No restriction",
    noteEl: "\u039C\u03BF\u03BD\u03BF\u03B8\u03B5\u03C1\u03B1\u03C0\u03B5\u03AF\u03B1 \u2014 \u03CC\u03C7\u03B9 \u03C3\u03B5 \u03C3\u03C5\u03BD\u03B4\u03C5\u03B1\u03C3\u03BC\u03CC \u03BC\u03B5 \u03AC\u03BB\u03BB\u03B1 \u03B1\u03BD\u03C4\u03B9\u03B8\u03C1\u03BF\u03BC\u03B2\u03C9\u03C4\u03B9\u03BA\u03AC.",
    noteEn: "Monotherapy \u2014 not combined with other antithrombotics."
  },
  {
    name: "UFH \u03C0\u03C1\u03BF\u03C6\u03C5\u03BB\u03B1\u03BA\u03C4\u03B9\u03BA\u03AE (SC \u226415.000 IU/24h)",
    nameEn: "UFH prophylactic (SC \u226415,000 IU/24h)",
    stopEl: "4\u20136 h",
    stopEn: "4\u20136 h",
    restartEl: "1 h \u03BC\u03B5\u03C4\u03AC",
    restartEn: "1 h after",
    noteEl: "\u0388\u03BB\u03B5\u03B3\u03C7\u03BF\u03C2 \u03B1\u03B9\u03BC\u03BF\u03C0\u03B5\u03C4\u03B1\u03BB\u03AF\u03C9\u03BD \u03B1\u03BD >4 \u03B7\u03BC\u03AD\u03C1\u03B5\u03C2 (HIT).",
    noteEn: "Platelet count if >4 days (HIT)."
  },
  {
    name: "UFH \u03B8\u03B5\u03C1\u03B1\u03C0\u03B5\u03C5\u03C4\u03B9\u03BA\u03AE (IV)",
    nameEn: "UFH therapeutic (IV)",
    stopEl: "4\u20136 h + \u03C6\u03C5\u03C3\u03B9\u03BF\u03BB\u03BF\u03B3\u03B9\u03BA\u03CC aPTT",
    stopEn: "4\u20136 h + normal aPTT",
    restartEl: "1 h \u03BC\u03B5\u03C4\u03AC",
    restartEn: "1 h after",
    noteEl: "\u0391\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1: 4\u20136 h \u03B1\u03C0\u03CC \u03C4\u03B5\u03BB\u03B5\u03C5\u03C4\u03B1\u03AF\u03B1 \u03B4\u03CC\u03C3\u03B7.",
    noteEn: "Catheter removal: 4\u20136 h after last dose."
  },
  {
    name: "LMWH \u03C0\u03C1\u03BF\u03C6\u03C5\u03BB\u03B1\u03BA\u03C4\u03B9\u03BA\u03AE (\u03C0.\u03C7. \u03B5\u03BD\u03BF\u03BE\u03B1\u03C0\u03B1\u03C1\u03AF\u03BD\u03B7 40 mg)",
    nameEn: "LMWH prophylactic (e.g. enoxaparin 40 mg)",
    stopEl: "12 h",
    stopEn: "12 h",
    restartEl: "4 h \u03BC\u03B5\u03C4\u03AC (\u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1 \u226512 h \u03B1\u03C0\u03CC \u03B4\u03CC\u03C3\u03B7)",
    restartEn: "4 h after (catheter removal \u226512 h post-dose)",
    noteEl: "ESAIC: 12 h \u03C0\u03C1\u03BF \u03C0\u03B1\u03C1\u03B1\u03BA\u03AD\u03BD\u03C4\u03B7\u03C3\u03B7\u03C2/\u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7\u03C2.",
    noteEn: "ESAIC: 12 h before puncture/removal."
  },
  {
    name: "LMWH \u03B8\u03B5\u03C1\u03B1\u03C0\u03B5\u03C5\u03C4\u03B9\u03BA\u03AE (1 mg/kg \xD72 \u03AE 1.5 mg/kg \xD71)",
    nameEn: "LMWH therapeutic (1 mg/kg bid or 1.5 mg/kg od)",
    stopEl: "24 h",
    stopEn: "24 h",
    restartEl: "24 h \u03BC\u03B5\u03C4\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC (\u22654 h \u03B1\u03C0\u03CC \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1)",
    restartEn: "24 h postop (\u22654 h after catheter removal)",
    noteEl: "\u03A3\u03BA\u03AD\u03C8\u03B7 anti-Xa \u03C3\u03B5 \u03BD\u03B5\u03C6\u03C1\u03B9\u03BA\u03AE \u03B1\u03BD\u03B5\u03C0\u03AC\u03C1\u03BA\u03B5\u03B9\u03B1/\u03B1\u03BA\u03C1\u03B1\u03AF\u03B1 \u03B2\u03AC\u03C1\u03B7.",
    noteEn: "Consider anti-Xa in renal failure/extremes of weight."
  },
  {
    name: "\u0392\u03B1\u03C1\u03C6\u03B1\u03C1\u03AF\u03BD\u03B7 / \u0391\u03C3\u03B5\u03BD\u03BF\u03BA\u03BF\u03C5\u03BC\u03B1\u03C1\u03CC\u03BB\u03B7",
    nameEn: "Warfarin / Acenocoumarol",
    stopEl: "5 \u03B7\u03BC\u03AD\u03C1\u03B5\u03C2 + INR \u22641.4",
    stopEn: "5 days + INR \u22641.4",
    restartEl: "\u039C\u03B5\u03C4\u03AC \u03C4\u03B7\u03BD \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1",
    restartEn: "After catheter removal",
    noteEl: "\u039A\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1\u03C2: \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03BC\u03B5 INR <1.5.",
    noteEn: "Catheter: remove with INR <1.5."
  },
  {
    name: "\u03A1\u03B9\u03B2\u03B1\u03C1\u03BF\u03BE\u03B1\u03BC\u03C0\u03AC\u03BD\u03B7",
    nameEn: "Rivaroxaban",
    stopEl: "72 h",
    stopEn: "72 h",
    restartEl: "6 h \u03BC\u03B5\u03C4\u03AC",
    restartEn: "6 h after",
    noteEl: "\u039F\u03A7\u0399 \u03BC\u03B5 \u03C0\u03B1\u03C1\u03B1\u03BC\u03AD\u03BD\u03BF\u03BD\u03C4\u03B1 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1. \u03A0\u03B1\u03C1\u03AC\u03C4\u03B1\u03C3\u03B7 \u03C3\u03B5 \u03A7\u039D\u039D.",
    noteEn: "NOT with indwelling catheter. Extend in CKD."
  },
  {
    name: "\u0391\u03C0\u03B9\u03BE\u03B1\u03BC\u03C0\u03AC\u03BD\u03B7",
    nameEn: "Apixaban",
    stopEl: "72 h",
    stopEn: "72 h",
    restartEl: "6 h \u03BC\u03B5\u03C4\u03AC",
    restartEn: "6 h after",
    noteEl: "\u039F\u03A7\u0399 \u03BC\u03B5 \u03C0\u03B1\u03C1\u03B1\u03BC\u03AD\u03BD\u03BF\u03BD\u03C4\u03B1 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1.",
    noteEn: "NOT with indwelling catheter."
  },
  {
    name: "\u0395\u03BD\u03C4\u03BF\u03BE\u03B1\u03BC\u03C0\u03AC\u03BD\u03B7",
    nameEn: "Edoxaban",
    stopEl: "72 h",
    stopEn: "72 h",
    restartEl: "6 h \u03BC\u03B5\u03C4\u03AC",
    restartEn: "6 h after",
    noteEl: "\u039F\u03A7\u0399 \u03BC\u03B5 \u03C0\u03B1\u03C1\u03B1\u03BC\u03AD\u03BD\u03BF\u03BD\u03C4\u03B1 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1.",
    noteEn: "NOT with indwelling catheter."
  },
  {
    name: "\u039D\u03C4\u03B1\u03BC\u03C0\u03B9\u03B3\u03BA\u03B1\u03C4\u03C1\u03AC\u03BD\u03B7",
    nameEn: "Dabigatran",
    stopEl: "72 h (CrCl \u226580) \xB7 96 h (50\u201379) \xB7 120 h (30\u201349)",
    stopEn: "72 h (CrCl \u226580) \xB7 96 h (50\u201379) \xB7 120 h (30\u201349)",
    restartEl: "6 h \u03BC\u03B5\u03C4\u03AC",
    restartEn: "6 h after",
    noteEl: "\u039D\u03B5\u03C6\u03C1\u03B9\u03BA\u03AE \u03BA\u03AC\u03B8\u03B1\u03C1\u03C3\u03B7 \u2014 \u03B5\u03BE\u03B1\u03C4\u03BF\u03BC\u03AF\u03BA\u03B5\u03C5\u03C3\u03B7. \u0391\u03BD\u03C4\u03AF\u03B4\u03BF\u03C4\u03BF: idarucizumab.",
    noteEn: "Renal clearance \u2014 individualize. Antidote: idarucizumab."
  },
  {
    name: "\u03A6\u03BF\u03BD\u03C4\u03B1\u03C0\u03B1\u03C1\u03B9\u03BD\u03BF\u03CD\u03BE\u03B7",
    nameEn: "Fondaparinux",
    stopEl: "36\u201342 h",
    stopEn: "36\u201342 h",
    restartEl: "6\u201312 h \u03BC\u03B5\u03C4\u03AC",
    restartEn: "6\u201312 h after",
    noteEl: "\u0391\u03C0\u03BF\u03C6\u03C5\u03B3\u03AE \u03C0\u03B1\u03C1\u03B1\u03BC\u03AD\u03BD\u03BF\u03BD\u03C4\u03BF\u03C2 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1.",
    noteEn: "Avoid indwelling catheter."
  },
  {
    name: "\u039A\u03BB\u03BF\u03C0\u03B9\u03B4\u03BF\u03B3\u03C1\u03AD\u03BB\u03B7",
    nameEn: "Clopidogrel",
    stopEl: "5\u20137 \u03B7\u03BC\u03AD\u03C1\u03B5\u03C2",
    stopEn: "5\u20137 days",
    restartEl: "\u0386\u03BC\u03B5\u03C3\u03B1 (\u03C6\u03CC\u03C1\u03C4\u03B9\u03C3\u03B7 \u22656 h \u03B1\u03C0\u03CC \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1)",
    restartEn: "Immediately (loading \u22656 h after catheter removal)",
    noteEl: "\u03A3\u03C5\u03BD\u03B5\u03BD\u03BD\u03CC\u03B7\u03C3\u03B7 \u03BC\u03B5 \u03BA\u03B1\u03C1\u03B4\u03B9\u03BF\u03BB\u03CC\u03B3\u03BF \u03B5\u03C0\u03AF \u03C0\u03C1\u03CC\u03C3\u03C6\u03B1\u03C4\u03BF\u03C5 stent.",
    noteEn: "Discuss with cardiology if recent stent."
  },
  {
    name: "\u03A0\u03C1\u03B1\u03C3\u03BF\u03C5\u03B3\u03C1\u03AD\u03BB\u03B7",
    nameEn: "Prasugrel",
    stopEl: "7\u201310 \u03B7\u03BC\u03AD\u03C1\u03B5\u03C2",
    stopEn: "7\u201310 days",
    restartEl: "\u22656 h \u03B1\u03C0\u03CC \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1",
    restartEn: "\u22656 h after catheter removal",
    noteEl: "",
    noteEn: ""
  },
  {
    name: "\u03A4\u03B9\u03BA\u03B1\u03B3\u03BA\u03C1\u03B5\u03BB\u03CC\u03C1\u03B7",
    nameEn: "Ticagrelor",
    stopEl: "5\u20137 \u03B7\u03BC\u03AD\u03C1\u03B5\u03C2",
    stopEn: "5\u20137 days",
    restartEl: "\u22656 h \u03B1\u03C0\u03CC \u03B1\u03C6\u03B1\u03AF\u03C1\u03B5\u03C3\u03B7 \u03BA\u03B1\u03B8\u03B5\u03C4\u03AE\u03C1\u03B1",
    restartEn: "\u22656 h after catheter removal",
    noteEl: "",
    noteEn: ""
  },
  {
    name: "\u0398\u03C1\u03BF\u03BC\u03B2\u03BF\u03BB\u03C5\u03C4\u03B9\u03BA\u03AC",
    nameEn: "Thrombolytics",
    stopEl: "48 h + \u03C6\u03C5\u03C3\u03B9\u03BF\u03BB\u03BF\u03B3\u03B9\u03BA\u03AE \u03C0\u03AE\u03BE\u03B7",
    stopEn: "48 h + normal coagulation",
    restartEl: "\u0391\u03C0\u03BF\u03C6\u03C5\u03B3\u03AE \u03B3\u03B9\u03B1 10 \u03B7\u03BC\u03AD\u03C1\u03B5\u03C2 \u03BC\u03B5\u03C4\u03AC \u03B1\u03C0\u03CC \u03C0\u03B1\u03C1\u03B1\u03BA\u03AD\u03BD\u03C4\u03B7\u03C3\u03B7",
    restartEn: "Avoid for 10 days after puncture",
    noteEl: "\u039D\u03B5\u03C5\u03C1\u03B1\u03BE\u03BF\u03BD\u03B9\u03BA\u03CC\u03C2 \u03B3\u03B5\u03BD\u03B9\u03BA\u03AC \u03B1\u03BD\u03C4\u03B5\u03BD\u03B4\u03B5\u03AF\u03BA\u03BD\u03C5\u03C4\u03B1\u03B9.",
    noteEn: "Neuraxial generally contraindicated."
  }
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
    redose: "\u039A\u03B5\u03C6\u03B1\u03B6\u03BF\u03BB\u03AF\u03BD\u03B7 q4h"
  },
  {
    el: "\u0393\u03B5\u03BD\u03B9\u03BA\u03AE (\u03C7\u03BF\u03BB\u03BF\u03BA\u03C5\u03C3\u03C4\u03B5\u03BA\u03C4\u03BF\u03BC\u03AE, \u03BA\u03AE\u03BB\u03B7)",
    en: "General (cholecystectomy, hernia)",
    regEl: "\u039A\u03B5\u03C6\u03B1\u03B6\u03BF\u03BB\u03AF\u03BD\u03B7 2 g IV",
    regEn: "Cefazolin 2 g IV",
    altEl: "\u039A\u03BB\u03B9\u03BD\u03B4\u03B1\u03BC\u03C5\u03BA\u03AF\u03BD\u03B7 \xB1 \u03B3\u03B5\u03BD\u03C4\u03B1\u03BC\u03B9\u03BA\u03AF\u03BD\u03B7",
    altEn: "Clindamycin \xB1 gentamicin",
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
    regEl: "\u039A\u03B5\u03C6\u03B1\u03B6\u03BF\u03BB\u03AF\u03BD\u03B7 2 g IV \u03AE \u03C3\u03B9\u03C0\u03C1\u03BF\u03C6\u03BB\u03BF\u03BE\u03B1\u03C3\u03AF\u03BD\u03B7 400 mg (\u03B2\u03AC\u03C3\u03B5\u03B9 \u03BF\u03CD\u03C1\u03C9\u03BD/\u03BA\u03B1\u03BB\u03BB\u03B9\u03AD\u03C1\u03B3\u03B5\u03B9\u03B1\u03C2)",
    regEn: "Cefazolin 2 g IV or ciprofloxacin 400 mg (per urine culture)",
    altEl: "\u0393\u03B5\u03BD\u03C4\u03B1\u03BC\u03B9\u03BA\u03AF\u03BD\u03B7 \xB1 \u03BA\u03BB\u03B9\u03BD\u03B4\u03B1\u03BC\u03C5\u03BA\u03AF\u03BD\u03B7",
    altEn: "Gentamicin \xB1 clindamycin",
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
  const ettUncuffed = a >= 1 ? a / 4 + 4 : a * 12 < 6 ? 3.5 : 4;
  const ettCuffed = a >= 1 ? a / 4 + 3.5 : 3;
  const depth = a >= 1 ? a / 2 + 12 : ettUncuffed * 3;
  const lma = w < 5 ? "1" : w < 10 ? "1.5" : w < 20 ? "2" : w < 30 ? "2.5" : w < 50 ? "3" : w < 70 ? "4" : "5";
  const blade = a < 1 ? "Miller 0\u20131" : a < 3 ? "Mac/Miller 1" : a < 8 ? "Mac 2" : "Mac 2\u20133";
  const minSBP = 70 + 2 * a;
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
    id: "apfel",
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
        el: `\u039A\u03AF\u03BD\u03B4\u03C5\u03BD\u03BF\u03C2 PONV \u2248 ${risk}% \u2014 ${n <= 1 ? "\u03A7\u03B1\u03BC\u03B7\u03BB\u03CC\u03C2: 0\u20131 \u03B1\u03BD\u03C4\u03B9\u03B5\u03BC\u03B5\u03C4\u03B9\u03BA\u03AC" : n === 2 ? "\u039C\u03AD\u03C4\u03C1\u03B9\u03BF\u03C2: 2 \u03B1\u03BD\u03C4\u03B9\u03B5\u03BC\u03B5\u03C4\u03B9\u03BA\u03AC" : "\u03A5\u03C8\u03B7\u03BB\u03CC\u03C2: 2\u20133 \u03B1\u03BD\u03C4\u03B9\u03B5\u03BC\u03B5\u03C4\u03B9\u03BA\u03AC + TIVA, \u03B1\u03C0\u03BF\u03C6\u03C5\u03B3\u03AE \u03C0\u03C4\u03B7\u03C4\u03B9\u03BA\u03CE\u03BD/N2O"}`,
        en: `PONV risk \u2248 ${risk}% \u2014 ${n <= 1 ? "Low: 0\u20131 antiemetics" : n === 2 ? "Moderate: 2 antiemetics" : "High: 2\u20133 antiemetics + TIVA, avoid volatiles/N2O"}`
      };
    }
  },
  {
    id: "stopbang",
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
    interp: (n, lang) => {
      const lvl = n <= 2 ? "low" : n <= 4 ? "mid" : "high";
      return {
        lvl,
        el: n <= 2 ? "\u03A7\u03B1\u03BC\u03B7\u03BB\u03CC\u03C2 \u03BA\u03AF\u03BD\u03B4\u03C5\u03BD\u03BF\u03C2 \u03A3\u0391\u03A5" : n <= 4 ? "\u0395\u03BD\u03B4\u03B9\u03AC\u03BC\u03B5\u03C3\u03BF\u03C2 \u03BA\u03AF\u03BD\u03B4\u03C5\u03BD\u03BF\u03C2 \u03A3\u0391\u03A5 \u2014 \u03BA\u03BB\u03B9\u03BD\u03B9\u03BA\u03AE \u03C3\u03C5\u03C3\u03C7\u03AD\u03C4\u03B9\u03C3\u03B7" : "\u03A5\u03C8\u03B7\u03BB\u03CC\u03C2 \u03BA\u03AF\u03BD\u03B4\u03C5\u03BD\u03BF\u03C2 \u03A3\u0391\u03A5 \u2014 \u03C0\u03C1\u03BF\u03C3\u03BF\u03C7\u03AE \u03C3\u03B5 \u03BF\u03C0\u03B9\u03BF\u03B5\u03B9\u03B4\u03AE/\u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03BF\u03BB\u03AE, \u03C3\u03BA\u03AD\u03C8\u03B7 CPAP & \u03C0\u03B1\u03C1\u03B1\u03C4\u03B5\u03C4\u03B1\u03BC\u03AD\u03BD\u03B7\u03C2 \u03C0\u03B1\u03C1\u03B1\u03BA\u03BF\u03BB\u03BF\u03CD\u03B8\u03B7\u03C3\u03B7\u03C2",
        en: n <= 2 ? "Low OSA risk" : n <= 4 ? "Intermediate OSA risk \u2014 clinical correlation" : "High OSA risk \u2014 caution with opioids/sedation, consider CPAP & extended monitoring"
      };
    }
  },
  {
    id: "rcri",
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
      const risk = n === 0 ? "0.4%" : n === 1 ? "0.9%" : n === 2 ? "6.6%" : "\u226511%";
      const lvl = n <= 1 ? "low" : n === 2 ? "mid" : "high";
      return {
        lvl,
        el: `\u039A\u03AF\u03BD\u03B4\u03C5\u03BD\u03BF\u03C2 \u03BC\u03B5\u03B9\u03B6\u03CC\u03BD\u03C9\u03BD \u03BA\u03B1\u03C1\u03B4\u03B9\u03B1\u03BA\u03CE\u03BD \u03B5\u03C0\u03B9\u03C0\u03BB\u03BF\u03BA\u03CE\u03BD \u2248 ${risk}${n >= 2 ? " \u2014 \u03C3\u03BA\u03AD\u03C8\u03B7 \u03B2\u03B9\u03BF\u03B4\u03B5\u03B9\u03BA\u03C4\u03CE\u03BD (BNP/\u03C4\u03C1\u03BF\u03C0\u03BF\u03BD\u03AF\u03BD\u03B7) & \u03B2\u03B5\u03BB\u03C4\u03B9\u03C3\u03C4\u03BF\u03C0\u03BF\u03AF\u03B7\u03C3\u03B7\u03C2" : ""}`,
        en: `Major cardiac complication risk \u2248 ${risk}${n >= 2 ? " \u2014 consider biomarkers (BNP/troponin) & optimization" : ""}`
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
      { el: "\u0394\u03B9\u03AC\u03C1\u03BA\u03B5\u03B9\u03B1 \u03B5\u03C0\u03AD\u03BC\u03B2\u03B1\u03C3\u03B7\u03C2", en: "Duration of surgery", opts: [{ el: "<2 h", en: "<2 h", v: 0 }, { el: "2\u20133 h", en: "2\u20133 h", v: 16 }, { el: ">3 h", en: ">3 h", v: 23 }] },
      { el: "\u0395\u03C0\u03B5\u03AF\u03B3\u03BF\u03C5\u03C3\u03B1 \u03B5\u03C0\u03AD\u03BC\u03B2\u03B1\u03C3\u03B7", en: "Emergency procedure", w: 8 }
    ],
    interp: (n, lang) => {
      const lvl = n < 26 ? "low" : n < 45 ? "mid" : "high";
      const pct = n < 26 ? "1.6%" : n < 45 ? "13.3%" : "42.1%";
      return {
        lvl,
        el: `\u039A\u03AF\u03BD\u03B4\u03C5\u03BD\u03BF\u03C2 \u03BC\u03B5\u03C4\u03B5\u03B3\u03C7. \u03C0\u03BD\u03B5\u03C5\u03BC\u03BF\u03BD\u03B9\u03BA\u03CE\u03BD \u03B5\u03C0\u03B9\u03C0\u03BB\u03BF\u03BA\u03CE\u03BD \u2248 ${pct} \u2014 ${n < 26 ? "\u03C7\u03B1\u03BC\u03B7\u03BB\u03CC\u03C2 \u03BA\u03AF\u03BD\u03B4\u03C5\u03BD\u03BF\u03C2" : n < 45 ? "\u03B5\u03BD\u03B4\u03B9\u03AC\u03BC\u03B5\u03C3\u03BF\u03C2 \u2014 \u03C0\u03C1\u03BF\u03C3\u03C4\u03B1\u03C4\u03B5\u03C5\u03C4\u03B9\u03BA\u03CC\u03C2 \u03B1\u03B5\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2, \u03C6\u03C5\u03C3\u03B9\u03BF\u03B8\u03B5\u03C1\u03B1\u03C0\u03B5\u03AF\u03B1" : "\u03C5\u03C8\u03B7\u03BB\u03CC\u03C2 \u2014 \u03B4\u03B9\u03BF\u03C1\u03B8\u03CE\u03C3\u03C4\u03B5 \u03B1\u03BD\u03B1\u03B9\u03BC\u03AF\u03B1/\u03BB\u03BF\u03AF\u03BC\u03C9\u03BE\u03B7 \u03C0\u03C1\u03B9\u03BD, \u03B1\u03BD \u03B5\u03AF\u03BD\u03B1\u03B9 \u03B5\u03BA\u03BB\u03B5\u03BA\u03C4\u03B9\u03BA\u03AE"}`,
        en: `Postop pulmonary complication risk \u2248 ${pct} \u2014 ${n < 26 ? "low risk" : n < 45 ? "intermediate risk \u2014 protective ventilation, physiotherapy" : "high risk \u2014 optimise anaemia/infection first if elective"}`
      };
    },
    src: "Canet J \u03BA.\u03AC., Anesthesiology 2010;113:1338\u201350. \u03A0\u03B5\u03C1\u03B9\u03BB\u03B1\u03BC\u03B2\u03AC\u03BD\u03B5\u03B9 \u03C4\u03C1\u03BF\u03C0\u03BF\u03C0\u03BF\u03B9\u03AE\u03C3\u03B9\u03BC\u03BF\u03C5\u03C2 \u03C0\u03B1\u03C1\u03AC\u03B3\u03BF\u03BD\u03C4\u03B5\u03C2 (\u03B1\u03BD\u03B1\u03B9\u03BC\u03AF\u03B1, \u03C0\u03C1\u03CC\u03C3\u03C6\u03B1\u03C4\u03B7 \u03BB\u03BF\u03AF\u03BC\u03C9\u03BE\u03B7) \u2014 \u03C7\u03C1\u03AE\u03C3\u03B9\u03BC\u03BF \u03B3\u03B9\u03B1 \u03C4\u03BF\u03BD \u03C7\u03C1\u03BF\u03BD\u03B9\u03C3\u03BC\u03CC \u03B5\u03BA\u03BB\u03B5\u03BA\u03C4\u03B9\u03BA\u03CE\u03BD \u03B5\u03C0\u03B5\u03BC\u03B2\u03AC\u03C3\u03B5\u03C9\u03BD."
  },
  {
    id: "cfs",
    name: "Clinical Frailty Scale (\u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1)",
    items: [
      { el: "\u039A\u03BB\u03AF\u03BC\u03B1\u03BA\u03B1 \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1\u03C2 (1\u20139)", en: "Clinical Frailty Scale (1\u20139)", opts: [{ el: "1 \u03A0\u03BF\u03BB\u03CD \u03B9\u03BA\u03B1\u03BD\u03CC\u03C2", en: "1 Very fit", v: 1 }, { el: "2 \u0399\u03BA\u03B1\u03BD\u03CC\u03C2", en: "2 Fit", v: 2 }, { el: "3 \u03A4\u03B1 \u03BA\u03B1\u03C4\u03B1\u03C6\u03AD\u03C1\u03BD\u03B5\u03B9 \u03BA\u03B1\u03BB\u03AC", en: "3 Managing well", v: 3 }, { el: "4 \u03A0\u03BF\u03BB\u03CD \u03AE\u03C0\u03B9\u03B1 \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1", en: "4 Very mild frailty", v: 4 }, { el: "5 \u0389\u03C0\u03B9\u03B1 \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1", en: "5 Mildly frail", v: 5 }, { el: "6 \u039C\u03AD\u03C4\u03C1\u03B9\u03B1 \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1", en: "6 Moderately frail", v: 6 }, { el: "7 \u03A3\u03BF\u03B2\u03B1\u03C1\u03AE \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1", en: "7 Severely frail", v: 7 }, { el: "8 \u03A0\u03BF\u03BB\u03CD \u03C3\u03BF\u03B2\u03B1\u03C1\u03AE", en: "8 Very severely frail", v: 8 }, { el: "9 \u03A4\u03B5\u03BB\u03B9\u03BA\u03CC \u03C3\u03C4\u03AC\u03B4\u03B9\u03BF", en: "9 Terminally ill", v: 9 }] }
    ],
    interp: (n, lang) => {
      const lvl = n <= 3 ? "low" : n <= 5 ? "mid" : "high";
      return {
        lvl,
        el: n <= 3 ? "\u039F\u03C7\u03B9 \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C2" : n === 4 ? "\u03A0\u03BF\u03BB\u03CD \u03AE\u03C0\u03B9\u03B1 \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1 \u2014 \u03C0\u03B5\u03C1\u03B1\u03B9\u03C4\u03AD\u03C1\u03C9 \u03B5\u03BA\u03C4\u03AF\u03BC\u03B7\u03C3\u03B7" : n <= 6 ? "\u0389\u03C0\u03B9\u03B1\u2013\u03BC\u03AD\u03C4\u03C1\u03B9\u03B1 \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1 \u2014 \u03B1\u03C5\u03BE\u03B7\u03BC\u03AD\u03BD\u03BF\u03C2 \u03BA\u03AF\u03BD\u03B4\u03C5\u03BD\u03BF\u03C2 \u03C0\u03B1\u03C1\u03B1\u03BB\u03B7\u03C1\u03AE\u03BC\u03B1\u03C4\u03BF\u03C2 \u03BA\u03B1\u03B9 \u03C0\u03C4\u03C9\u03C7\u03AE\u03C2 \u03AD\u03BA\u03B2\u03B1\u03C3\u03B7\u03C2\u00B7 \u03C3\u03BA\u03AD\u03C8\u03B7 \u03B3\u03B7\u03C1\u03B9\u03B1\u03C4\u03C1\u03B9\u03BA\u03AE\u03C2 \u03B5\u03BA\u03C4\u03AF\u03BC\u03B7\u03C3\u03B7\u03C2 \u03BA\u03B1\u03B9 prehabilitation" : "\u03A3\u03BF\u03B2\u03B1\u03C1\u03AE \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1 \u2014 \u03C5\u03C8\u03B7\u03BB\u03CC\u03C2 \u03BA\u03AF\u03BD\u03B4\u03C5\u03BD\u03BF\u03C2\u00B7 \u03C3\u03C5\u03B6\u03AE\u03C4\u03B7\u03C3\u03B7 \u03C3\u03C4\u03CC\u03C7\u03C9\u03BD \u03C6\u03C1\u03BF\u03BD\u03C4\u03AF\u03B4\u03B1\u03C2 \u03BA\u03B1\u03B9 \u03BA\u03B1\u03C4\u03B1\u03BB\u03BB\u03B7\u03BB\u03CC\u03C4\u03B7\u03C4\u03B1\u03C2 \u03C4\u03B7\u03C2 \u03B5\u03C0\u03AD\u03BC\u03B2\u03B1\u03C3\u03B7\u03C2",
        en: n <= 3 ? "Not frail" : n === 4 ? "Very mild frailty \u2014 assess further" : n <= 6 ? "Mild\u2013moderate frailty \u2014 higher risk of delirium and poor outcome; consider geriatric review and prehabilitation" : "Severe frailty \u2014 high risk; discuss goals of care and whether surgery is appropriate"
      };
    },
    src: "ESAIC 2025 \u2014 \u03A0\u03C1\u03BF\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AE \u03B5\u03BA\u03C4\u03AF\u03BC\u03B7\u03C3\u03B7 \u03B5\u03BD\u03B7\u03BB\u03AF\u03BA\u03C9\u03BD \u03C3\u03B5 \u03B5\u03BA\u03BB\u03B5\u03BA\u03C4\u03B9\u03BA\u03AE \u03BC\u03B7 \u03BA\u03B1\u03C1\u03B4\u03B9\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE \u03B5\u03C0\u03AD\u03BC\u03B2\u03B1\u03C3\u03B7 \u2014 \u03C3\u03CD\u03C3\u03C4\u03B1\u03C3\u03B7 1C (\u03B9\u03C3\u03C7\u03C5\u03C1\u03AE). \u03A3\u03C5\u03BD\u03B4\u03C5\u03B1\u03C3\u03BC\u03CC\u03C2 CFS + ASA \u03B2\u03B5\u03BB\u03C4\u03B9\u03CE\u03BD\u03B5\u03B9 \u03C4\u03B7\u03BD \u03C0\u03C1\u03CC\u03B3\u03BD\u03C9\u03C3\u03B7."
  }
];
const LA_LIST = [
  { id: "lido", name: "Lidocaine", perKg: 3, abs: 300, concs: [0.5, 1, 1.5, 2] },
  { id: "lido_epi", name: "Lidocaine + Epi", perKg: 7, abs: 500, concs: [0.5, 1, 1.5, 2] },
  { id: "mepi", name: "Mepivacaine", perKg: 4.4, abs: 350, concs: [1, 1.5, 2] },
  { id: "prilo", name: "Prilocaine", perKg: 6, abs: 400, concs: [0.5, 1, 2] },
  { id: "bupi", name: "Bupivacaine", perKg: 2, abs: 150, concs: [0.25, 0.5] },
  { id: "levo", name: "Levobupivacaine", perKg: 2, abs: 150, concs: [0.25, 0.5] },
  { id: "ropi", name: "Ropivacaine", perKg: 3, abs: 225, concs: [0.2, 0.375, 0.5, 0.75, 1] },
  { id: "chloro", name: "Chloroprocaine", perKg: 11, abs: 800, concs: [1, 2, 3] }
];
const CSHT_DATA = {
  Propofol: [[30, 5], [60, 10], [120, 15], [240, 20], [480, 28], [600, 32]],
  Remifentanil: [[30, 3], [600, 4]],
  Fentanyl: [[30, 15], [60, 30], [120, 75], [180, 130], [240, 200], [360, 270], [480, 300], [600, 305]],
  Alfentanil: [[30, 25], [60, 40], [90, 55], [120, 58], [240, 60], [600, 60]],
  Sufentanil: [[30, 15], [60, 20], [120, 25], [240, 30], [480, 60], [600, 80]]
};
const cshtAt = (drug, mins) => {
  const pts = CSHT_DATA[drug];
  if (mins <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (mins <= pts[i][0]) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      return y0 + (mins - x0) / (x1 - x0) * (y1 - y0);
    }
  }
  return pts[pts.length - 1][1];
};
