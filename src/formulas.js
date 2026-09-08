const bmiCalc = (w, h) => w && h ? w / (h / 100) ** 2 : null;
const lbmJames = (w, h, sex) => sex === "M" ? 1.1 * w - 128 * (w / h) ** 2 : 1.07 * w - 148 * (w / h) ** 2;
const ffmJan = (w, h, sex) => {
  const bmi = bmiCalc(w, h);
  return sex === "M" ? 9270 * w / (6680 + 216 * bmi) : 9270 * w / (8780 + 244 * bmi);
};
const ibwDevine = (h, sex) => {
  if (!h || h <= 0) return null;
  const inchesOver60 = h / 2.54 - 60;
  const base = sex === "M" ? 50 : 45.5;
  return base + 2.3 * inchesOver60;
};
const pbw = (h, sex) => ibwDevine(h, sex);
const abw = (w, h, sex) => {
  const ibw = ibwDevine(h, sex);
  if (!w || !ibw) return null;
  return ibw + 0.4 * (w - ibw);
};
const TCI_MODELS = [
  {
    id: "marsh",
    drug: "Propofol",
    name: "Marsh",
    requires: ["w"],
    targetType: "Cp / Ce (plasma \u03AE effect-site)",
    targetsEl: "\u0395\u03B9\u03C3\u03B1\u03B3\u03C9\u03B3\u03AE 4\u20138 \xB5g/mL \xB7 \u03A3\u03C5\u03BD\u03C4\u03AE\u03C1\u03B7\u03C3\u03B7 3\u20136 \xB5g/mL \xB7 \u039A\u03B1\u03C4\u03B1\u03C3\u03C4\u03BF\u03BB\u03AE 1\u20132.5 \xB5g/mL",
    targetsEn: "Induction 4\u20138 \xB5g/mL \xB7 Maintenance 3\u20136 \xB5g/mL \xB7 Sedation 1\u20132.5 \xB5g/mL",
    v1k: 0.228,
    // V1 = 0.228 L/kg
    rangeEl: "\u0395\u03BD\u03AE\u03BB\u03B9\u03BA\u03B5\u03C2. \u0394\u03B5\u03BD \u03C7\u03C1\u03B7\u03C3\u03B9\u03BC\u03BF\u03C0\u03BF\u03B9\u03B5\u03AF \u03B7\u03BB\u03B9\u03BA\u03AF\u03B1 \u2014 \u03B1\u03C1\u03B3\u03AE \u03AD\u03BD\u03B1\u03C1\u03BE\u03B7 ke0 (0.26/min). \u03A5\u03C0\u03B5\u03C1\u03B5\u03BA\u03C4\u03AF\u03BC\u03B7\u03C3\u03B7 \u03C3\u03B5 \u03C0\u03B1\u03C7\u03CD\u03C3\u03B1\u03C1\u03BA\u03BF\u03C5\u03C2/\u03B7\u03BB\u03B9\u03BA\u03B9\u03C9\u03BC\u03AD\u03BD\u03BF\u03C5\u03C2.",
    rangeEn: "Adults. Age-independent \u2014 slow ke0 (0.26/min). Overestimates in obese/elderly.",
    valid: (c) => c.w >= 12
  },
  {
    id: "schnider",
    drug: "Propofol",
    name: "Schnider",
    requires: ["w", "h", "a", "s"],
    targetType: "Ce (effect-site, \u03C0\u03C1\u03BF\u03C4\u03B9\u03BC\u03CE\u03BC\u03B5\u03BD\u03BF)",
    targetsEl: "\u0395\u03B9\u03C3\u03B1\u03B3\u03C9\u03B3\u03AE Ce 3\u20136 \xB5g/mL \xB7 \u03A3\u03C5\u03BD\u03C4\u03AE\u03C1\u03B7\u03C3\u03B7 2.5\u20134.5 \xB5g/mL \xB7 \u039A\u03B1\u03C4\u03B1\u03C3\u03C4\u03BF\u03BB\u03AE 1\u20132 \xB5g/mL",
    targetsEn: "Induction Ce 3\u20136 \xB5g/mL \xB7 Maintenance 2.5\u20134.5 \xB5g/mL \xB7 Sedation 1\u20132 \xB5g/mL",
    v1Fixed: 4.27,
    // L (fixed small V1 → small bolus)
    rangeEl: "Effect-site targeting. \u039C\u03B9\u03BA\u03C1\u03CC \u03C3\u03C4\u03B1\u03B8\u03B5\u03C1\u03CC V1 \u2192 \u03BC\u03B9\u03BA\u03C1\u03AC bolus. \u039F\u03A7\u0399 \u03C3\u03B5 \u03BD\u03BF\u03C3\u03BF\u03B3\u03CC\u03BD\u03BF \u03C0\u03B1\u03C7\u03C5\u03C3\u03B1\u03C1\u03BA\u03AF\u03B1 (\u03B1\u03C1\u03BD\u03B7\u03C4\u03B9\u03BA\u03CC LBM \u03C3\u03B5 \u03C5\u03C8\u03B7\u03BB\u03CC BMI).",
    rangeEn: "Effect-site targeting. Small fixed V1 \u2192 small boluses. NOT for morbid obesity (LBM goes negative at high BMI).",
    valid: (c) => {
      const lbm = lbmJames(c.w, c.h, c.s);
      const bmi = bmiCalc(c.w, c.h);
      const bad = c.s === "M" && bmi > 42 || c.s === "F" && bmi > 35;
      return c.w >= 30 && lbm > 0 && !bad;
    },
    warnEl: "\u03A5\u03C8\u03B7\u03BB\u03CC BMI: \u03C4\u03BF \u03BC\u03BF\u03BD\u03C4\u03AD\u03BB\u03BF Schnider \u03C7\u03AC\u03BD\u03B5\u03B9 \u03B1\u03BE\u03B9\u03BF\u03C0\u03B9\u03C3\u03C4\u03AF\u03B1 \u2014 \u03C0\u03C1\u03BF\u03C4\u03B9\u03BC\u03AE\u03C3\u03C4\u03B5 Eleveld.",
    warnEn: "High BMI: Schnider loses reliability \u2014 prefer Eleveld."
  },
  {
    id: "eleveld_prop",
    drug: "Propofol",
    name: "Eleveld (general purpose)",
    requires: ["w", "h", "a", "s"],
    targetType: "Ce (effect-site)",
    targetsEl: "\u0395\u03B9\u03C3\u03B1\u03B3\u03C9\u03B3\u03AE Ce 3\u20136 \xB5g/mL \xB7 \u03A3\u03C5\u03BD\u03C4\u03AE\u03C1\u03B7\u03C3\u03B7 2.5\u20134 \xB5g/mL \xB7 \u039A\u03B1\u03C4\u03B1\u03C3\u03C4\u03BF\u03BB\u03AE 1\u20132 \xB5g/mL",
    targetsEn: "Induction Ce 3\u20136 \xB5g/mL \xB7 Maintenance 2.5\u20134 \xB5g/mL \xB7 Sedation 1\u20132 \xB5g/mL",
    v1k: 0.12,
    rangeEl: "\u0395\u03BD\u03B9\u03B1\u03AF\u03BF \u03BC\u03BF\u03BD\u03C4\u03AD\u03BB\u03BF \u03B3\u03B9\u03B1 \u03CC\u03BB\u03BF \u03C4\u03BF \u03C6\u03AC\u03C3\u03BC\u03B1: \u03BD\u03B5\u03BF\u03B3\u03BD\u03AC \u2192 \u03B7\u03BB\u03B9\u03BA\u03B9\u03C9\u03BC\u03AD\u03BD\u03BF\u03C5\u03C2, \u03C6\u03C5\u03C3\u03B9\u03BF\u03BB\u03BF\u03B3\u03B9\u03BA\u03CC \u2192 \u03BD\u03BF\u03C3\u03BF\u03B3\u03CC\u03BD\u03BF \u03C0\u03B1\u03C7\u03CD\u03C3\u03B1\u03C1\u03BA\u03BF. \u03A0\u03C1\u03BF\u03C4\u03B9\u03BC\u03CE\u03BC\u03B5\u03BD\u03BF \u03C3\u03CD\u03B3\u03C7\u03C1\u03BF\u03BD\u03BF \u03BC\u03BF\u03BD\u03C4\u03AD\u03BB\u03BF.",
    rangeEn: "Single model across the spectrum: neonates \u2192 elderly, normal \u2192 morbidly obese. Preferred modern model.",
    valid: (c) => c.w >= 2
  },
  {
    id: "kataria",
    drug: "Propofol",
    name: "Kataria (\u03C0\u03B1\u03B9\u03B4\u03B9\u03B1\u03C4\u03C1\u03B9\u03BA\u03CC)",
    requires: ["w", "a"],
    targetType: "Cp (plasma)",
    targetsEl: "\u0395\u03B9\u03C3\u03B1\u03B3\u03C9\u03B3\u03AE 5\u20137 \xB5g/mL \xB7 \u03A3\u03C5\u03BD\u03C4\u03AE\u03C1\u03B7\u03C3\u03B7 3\u20135 \xB5g/mL",
    targetsEn: "Induction 5\u20137 \xB5g/mL \xB7 Maintenance 3\u20135 \xB5g/mL",
    v1k: 0.41,
    rangeEl: "\u03A0\u03B1\u03B9\u03B4\u03B9\u03AC 3\u201311 \u03B5\u03C4\u03CE\u03BD, >15 kg. \u03A0\u03B1\u03B9\u03B4\u03B9\u03AC \u03C7\u03C1\u03B5\u03B9\u03AC\u03B6\u03BF\u03BD\u03C4\u03B1\u03B9 \u03C5\u03C8\u03B7\u03BB\u03CC\u03C4\u03B5\u03C1\u03BF\u03C5\u03C2 \u03C3\u03C4\u03CC\u03C7\u03BF\u03C5\u03C2 (\u03BC\u03B5\u03B3\u03B1\u03BB\u03CD\u03C4\u03B5\u03C1\u03B7 \u03BA\u03AC\u03B8\u03B1\u03C1\u03C3\u03B7).",
    rangeEn: "Children 3\u201311 yr, >15 kg. Children need higher targets (greater clearance).",
    valid: (c) => c.a >= 1 && c.a <= 16 && c.w >= 12
  },
  {
    id: "paedfusor",
    drug: "Propofol",
    name: "Paedfusor (\u03C0\u03B1\u03B9\u03B4\u03B9\u03B1\u03C4\u03C1\u03B9\u03BA\u03CC)",
    requires: ["w", "a"],
    targetType: "Cp (plasma)",
    targetsEl: "\u0395\u03B9\u03C3\u03B1\u03B3\u03C9\u03B3\u03AE 4\u20136 \xB5g/mL \xB7 \u03A3\u03C5\u03BD\u03C4\u03AE\u03C1\u03B7\u03C3\u03B7 2.5\u20134 \xB5g/mL",
    targetsEn: "Induction 4\u20136 \xB5g/mL \xB7 Maintenance 2.5\u20134 \xB5g/mL",
    v1k: 0.4584,
    rangeEl: "\u03A0\u03B1\u03B9\u03B4\u03B9\u03AC 1\u201316 \u03B5\u03C4\u03CE\u03BD, 5\u201361 kg. \u0395\u03C0\u03B9\u03BA\u03C5\u03C1\u03C9\u03BC\u03AD\u03BD\u03BF \u03B3\u03B9\u03B1 \u03C0\u03B1\u03B9\u03B4\u03B9\u03B1\u03C4\u03C1\u03B9\u03BA\u03AE TIVA.",
    rangeEn: "Children 1\u201316 yr, 5\u201361 kg. Validated for pediatric TIVA.",
    valid: (c) => c.a >= 1 && c.a <= 16 && c.w >= 5 && c.w <= 61
  },
  {
    id: "minto",
    drug: "Remifentanil",
    name: "Minto",
    requires: ["w", "h", "a", "s"],
    targetType: "Ce (effect-site)",
    targetsEl: "\u0394\u03B9\u03B1\u03C3\u03C9\u03BB\u03AE\u03BD\u03C9\u03C3\u03B7 Ce 4\u20138 ng/mL \xB7 \u03A3\u03C5\u03BD\u03C4\u03AE\u03C1\u03B7\u03C3\u03B7 2\u20136 ng/mL \xB7 \u0391\u03C5\u03C4\u03CC\u03BC\u03B1\u03C4\u03B7 \u03B1\u03BD\u03B1\u03C0\u03BD\u03BF\u03AE 1\u20133 ng/mL",
    targetsEn: "Intubation Ce 4\u20138 ng/mL \xB7 Maintenance 2\u20136 ng/mL \xB7 Spont. breathing 1\u20133 ng/mL",
    v1Fixed: 5.1,
    rangeEl: "\u0392\u03B1\u03C3\u03AF\u03B6\u03B5\u03C4\u03B1\u03B9 \u03C3\u03B5 LBM (James). \u0394\u03CC\u03C3\u03B7 \u2193 \u03BC\u03B5 \u03B7\u03BB\u03B9\u03BA\u03AF\u03B1. \u039F\u03A7\u0399 \u03B1\u03BE\u03B9\u03CC\u03C0\u03B9\u03C3\u03C4\u03BF \u03C3\u03B5 \u03BD\u03BF\u03C3\u03BF\u03B3\u03CC\u03BD\u03BF \u03C0\u03B1\u03C7\u03C5\u03C3\u03B1\u03C1\u03BA\u03AF\u03B1 (LBM).",
    rangeEn: "LBM-based (James). Dose \u2193 with age. Unreliable in morbid obesity (LBM).",
    valid: (c) => {
      const lbm = lbmJames(c.w, c.h, c.s);
      return c.w >= 30 && lbm > 0;
    },
    warnEl: "\u039D\u03BF\u03C3\u03BF\u03B3\u03CC\u03BD\u03BF\u03C2 \u03C0\u03B1\u03C7\u03C5\u03C3\u03B1\u03C1\u03BA\u03AF\u03B1: \u03C4\u03BF LBM (James) \u03B3\u03AF\u03BD\u03B5\u03C4\u03B1\u03B9 \u03B1\u03BD\u03B1\u03BE\u03B9\u03CC\u03C0\u03B9\u03C3\u03C4\u03BF \u2014 \u03C0\u03C1\u03BF\u03C4\u03B9\u03BC\u03AE\u03C3\u03C4\u03B5 Eleveld.",
    warnEn: "Morbid obesity: James LBM unreliable \u2014 prefer Eleveld."
  },
  {
    id: "eleveld_remi",
    drug: "Remifentanil",
    name: "Eleveld (general purpose)",
    requires: ["w", "h", "a", "s"],
    targetType: "Ce (effect-site)",
    targetsEl: "\u0394\u03B9\u03B1\u03C3\u03C9\u03BB\u03AE\u03BD\u03C9\u03C3\u03B7 Ce 4\u20138 ng/mL \xB7 \u03A3\u03C5\u03BD\u03C4\u03AE\u03C1\u03B7\u03C3\u03B7 2\u20136 ng/mL \xB7 \u0391\u03C5\u03C4\u03CC\u03BC\u03B1\u03C4\u03B7 \u03B1\u03BD\u03B1\u03C0\u03BD\u03BF\u03AE 1\u20133 ng/mL",
    targetsEn: "Intubation Ce 4\u20138 ng/mL \xB7 Maintenance 2\u20136 ng/mL \xB7 Spont. breathing 1\u20133 ng/mL",
    v1k: 0.075,
    rangeEl: "\u0395\u03BD\u03B9\u03B1\u03AF\u03BF \u03BC\u03BF\u03BD\u03C4\u03AD\u03BB\u03BF \u03CC\u03BB\u03BF \u03C4\u03BF \u03C6\u03AC\u03C3\u03BC\u03B1 \u03B7\u03BB\u03B9\u03BA\u03AF\u03B1\u03C2/\u03B2\u03AC\u03C1\u03BF\u03C5\u03C2. \u03A0\u03C1\u03BF\u03C4\u03B9\u03BC\u03CE\u03BC\u03B5\u03BD\u03BF \u03C3\u03B5 \u03C0\u03B1\u03C7\u03CD\u03C3\u03B1\u03C1\u03BA\u03BF\u03C5\u03C2 & \u03AC\u03BA\u03C1\u03B1 \u03B7\u03BB\u03B9\u03BA\u03AF\u03B1\u03C2.",
    rangeEn: "Single model across age/weight spectrum. Preferred in obese & extremes of age.",
    valid: (c) => c.w >= 5
  },
  {
    id: "gepts",
    drug: "Sufentanil",
    name: "Gepts",
    requires: ["w"],
    targetType: "Cp (plasma)",
    targetsEl: "\u0394\u03B9\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC 0.2\u20130.5 ng/mL \xB7 \u039A\u03B1\u03C1\u03B4\u03B9\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE \u03AD\u03C9\u03C2 1 ng/mL",
    targetsEn: "Intraop 0.2\u20130.5 ng/mL \xB7 Cardiac up to 1 ng/mL",
    v1k: 0.164,
    rangeEl: "\u0395\u03BD\u03AE\u03BB\u03B9\u03BA\u03B5\u03C2. \u03A3\u03C4\u03B1\u03B8\u03B5\u03C1\u03BF\u03AF \u03C3\u03C5\u03BD\u03C4\u03B5\u03BB\u03B5\u03C3\u03C4\u03AD\u03C2 \u03B1\u03BD\u03AC kg.",
    rangeEn: "Adults. Fixed per-kg coefficients.",
    valid: (c) => c.w >= 20
  },
  {
    id: "maitre",
    drug: "Alfentanil",
    name: "Maitre",
    requires: ["w", "a", "s"],
    targetType: "Cp (plasma)",
    targetsEl: "\u0394\u03B9\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC 50\u2013200 ng/mL \xB7 \u0391\u03BD\u03B1\u03BB\u03B3\u03B7\u03C3\u03AF\u03B1 30\u2013100 ng/mL",
    targetsEn: "Intraop 50\u2013200 ng/mL \xB7 Analgesia 30\u2013100 ng/mL",
    v1k: 0.111,
    rangeEl: "\u0395\u03BD\u03AE\u03BB\u03B9\u03BA\u03B5\u03C2. \u03A0\u03C1\u03BF\u03C3\u03B1\u03C1\u03BC\u03BF\u03B3\u03AE \u03B3\u03B9\u03B1 \u03B7\u03BB\u03B9\u03BA\u03AF\u03B1 & \u03C6\u03CD\u03BB\u03BF.",
    rangeEn: "Adults. Adjusts for age & sex.",
    valid: (c) => c.w >= 20
  },
  {
    id: "hannivoort",
    drug: "Dexmedetomidine",
    name: "Hannivoort",
    requires: ["w"],
    targetType: "Cp (plasma)",
    targetsEl: "\u039A\u03B1\u03C4\u03B1\u03C3\u03C4\u03BF\u03BB\u03AE 0.4\u20131.2 ng/mL \xB7 \u0392\u03B1\u03B8\u03CD\u03C4\u03B5\u03C1\u03B7 1.2\u20132 ng/mL (\u03C0\u03B1\u03C1\u03B1\u03BA\u03BF\u03BB\u03BF\u03CD\u03B8\u03B7\u03C3\u03B7 \u03B2\u03C1\u03B1\u03B4\u03C5\u03BA\u03B1\u03C1\u03B4\u03AF\u03B1\u03C2)",
    targetsEn: "Sedation 0.4\u20131.2 ng/mL \xB7 Deeper 1.2\u20132 ng/mL (watch bradycardia)",
    v1k: 0.0934,
    rangeEl: "\u03A6\u03CC\u03C1\u03C4\u03B9\u03C3\u03B7 \u03C3\u03B5 10 min \u03B3\u03B9\u03B1 \u03B1\u03C0\u03BF\u03C6\u03C5\u03B3\u03AE \u03C5\u03C0\u03B5\u03C1\u03C4\u03B1\u03C3\u03B9\u03BA\u03AE\u03C2/\u03B2\u03C1\u03B1\u03B4\u03C5\u03BA\u03B1\u03C1\u03B4\u03B9\u03BA\u03AE\u03C2 \u03B1\u03C0\u03AC\u03BD\u03C4\u03B7\u03C3\u03B7\u03C2. ICU/\u03C0\u03B5\u03C1\u03B9\u03B5\u03C0\u03B5\u03BC\u03B2\u03B1\u03C4\u03B9\u03BA\u03AE \u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03BF\u03BB\u03AE.",
    rangeEn: "Load over 10 min to avoid hyper-/brady response. ICU/procedural sedation.",
    valid: (c) => c.w >= 30
  }
];
const TCI_DRUGS = ["Propofol", "Remifentanil", "Sufentanil", "Alfentanil", "Dexmedetomidine"];
const covLabel = { w: { el: "\u0392\u03AC\u03C1\u03BF\u03C2", en: "Weight" }, h: { el: "\u038E\u03C8\u03BF\u03C2", en: "Height" }, a: { el: "\u0397\u03BB\u03B9\u03BA\u03AF\u03B1", en: "Age" }, s: { el: "\u03A6\u03CD\u03BB\u03BF", en: "Sex" } };
const T = {
  el: {
    appName: "Morfeas",
    tabs: { meds: "\u03A6\u03AC\u03C1\u03BC\u03B1\u03BA\u03B1", tci: "TCI", tools: "\u0395\u03C1\u03B3\u03B1\u03BB\u03B5\u03AF\u03B1", peds: "\u03A0\u03B1\u03B9\u03B4\u03B9\u03AC", lists: "\u039B\u03AF\u03C3\u03C4\u03B5\u03C2" },
    patient: "\u0391\u03C3\u03B8\u03B5\u03BD\u03AE\u03C2",
    weight: "\u0392\u03AC\u03C1\u03BF\u03C2 (kg)",
    age: "\u0397\u03BB\u03B9\u03BA\u03AF\u03B1 (\u03AD\u03C4\u03B7)",
    height: "\u038E\u03C8\u03BF\u03C2 (cm)",
    sex: "\u03A6\u03CD\u03BB\u03BF",
    male: "\u0386\u03BD\u03B4\u03C1\u03B1\u03C2",
    female: "\u0393\u03C5\u03BD\u03B1\u03AF\u03BA\u03B1",
    tciTitle: "\u03A3\u03C4\u03BF\u03C7\u03BF\u03BA\u03B1\u03C4\u03B5\u03C5\u03B8\u03C5\u03BD\u03CC\u03BC\u03B5\u03BD\u03B7 \u0388\u03B3\u03C7\u03C5\u03C3\u03B7 (TCI)",
    covariates: "\u03A3\u03C5\u03BD\u03B4\u03B9\u03B1\u03BA\u03C5\u03BC\u03B1\u03BD\u03C4\u03AD\u03C2 \u03BC\u03BF\u03BD\u03C4\u03AD\u03BB\u03BF\u03C5",
    targeting: "\u03A3\u03C4\u03CC\u03C7\u03B5\u03C5\u03C3\u03B7",
    targetsHead: "\u03A3\u03C5\u03BD\u03B9\u03C3\u03C4\u03CE\u03BC\u03B5\u03BD\u03BF\u03B9 \u03C3\u03C4\u03CC\u03C7\u03BF\u03B9",
    bolusEst: "\u0395\u03BA\u03C4\u03AF\u03BC\u03B7\u03C3\u03B7 \u03B5\u03C6\u03CC\u03B4\u03BF\u03C5 (\u03C0\u03BB\u03AE\u03C1\u03C9\u03C3\u03B7 V1)",
    needCov: "\u03A3\u03C5\u03BC\u03C0\u03BB\u03B7\u03C1\u03CE\u03C3\u03C4\u03B5 \u03B3\u03B9\u03B1 \u03C4\u03BF \u03BC\u03BF\u03BD\u03C4\u03AD\u03BB\u03BF:",
    caution: "\u03A0\u03C1\u03BF\u03C3\u03BF\u03C7\u03AE",
    tciDisc: "\u039F\u03B9 \u03C3\u03C4\u03CC\u03C7\u03BF\u03B9 \u03B5\u03AF\u03BD\u03B1\u03B9 \u03B5\u03BD\u03B4\u03B5\u03B9\u03BA\u03C4\u03B9\u03BA\u03BF\u03AF \u2014 \u03C4\u03B9\u03C4\u03BB\u03BF\u03C0\u03BF\u03AF\u03B7\u03C3\u03B7 \u03C3\u03C4\u03B7\u03BD \u03BA\u03BB\u03B9\u03BD\u03B9\u03BA\u03AE \u03B1\u03C0\u03CC\u03BA\u03C1\u03B9\u03C3\u03B7/\u03B2\u03AC\u03B8\u03BF\u03C2 \u03B1\u03BD\u03B1\u03B9\u03C3\u03B8\u03B7\u03C3\u03AF\u03B1\u03C2.",
    searchDrug: "\u0391\u03BD\u03B1\u03B6\u03AE\u03C4\u03B7\u03C3\u03B7 \u03C6\u03B1\u03C1\u03BC\u03AC\u03BA\u03BF\u03C5\u2026",
    notes: "\u03A3\u03B7\u03BC\u03B5\u03B9\u03CE\u03C3\u03B5\u03B9\u03C2",
    ci: "\u0391\u03BD\u03C4\u03B5\u03BD\u03B4\u03B5\u03AF\u03BE\u03B5\u03B9\u03C2",
    maxLabel: "max",
    disclaimer: "\u0395\u03C1\u03B3\u03B1\u03BB\u03B5\u03AF\u03BF \u03C5\u03C0\u03BF\u03C3\u03C4\u03AE\u03C1\u03B9\u03BE\u03B7\u03C2 \u03B3\u03B9\u03B1 \u03B5\u03C0\u03B1\u03B3\u03B3\u03B5\u03BB\u03BC\u03B1\u03C4\u03AF\u03B5\u03C2 \u03C5\u03B3\u03B5\u03AF\u03B1\u03C2. \u0395\u03C0\u03B1\u03BB\u03B7\u03B8\u03B5\u03CD\u03C3\u03C4\u03B5 \u03BA\u03AC\u03B8\u03B5 \u03B4\u03CC\u03C3\u03B7 \u03C0\u03C1\u03B9\u03BD \u03C4\u03B7 \u03C7\u03BF\u03C1\u03AE\u03B3\u03B7\u03C3\u03B7 \u2014 \u03B4\u03B5\u03BD \u03C5\u03C0\u03BF\u03BA\u03B1\u03B8\u03B9\u03C3\u03C4\u03AC \u03C4\u03B7\u03BD \u03BA\u03BB\u03B9\u03BD\u03B9\u03BA\u03AE \u03BA\u03C1\u03AF\u03C3\u03B7.",
    weightNeeded: "\u0395\u03B9\u03C3\u03AC\u03B3\u03B5\u03C4\u03B5 \u03B2\u03AC\u03C1\u03BF\u03C2 \u03B3\u03B9\u03B1 \u03C5\u03C0\u03BF\u03BB\u03BF\u03B3\u03B9\u03C3\u03BC\u03CC \u03B4\u03CC\u03C3\u03B5\u03C9\u03BD"
  },
  en: {
    appName: "Morfeas",
    tabs: { meds: "Meds", tci: "TCI", tools: "Tools", peds: "Peds", lists: "Lists" },
    patient: "Patient",
    weight: "Weight (kg)",
    age: "Age (years)",
    height: "Height (cm)",
    sex: "Sex",
    male: "Male",
    female: "Female",
    tciTitle: "Target-Controlled Infusion (TCI)",
    covariates: "Model covariates",
    targeting: "Targeting",
    targetsHead: "Recommended targets",
    bolusEst: "Loading estimate (V1 fill)",
    needCov: "Required for this model:",
    caution: "Caution",
    tciDisc: "Targets are indicative \u2014 titrate to clinical response/depth of anesthesia.",
    searchDrug: "Search drug\u2026",
    notes: "Notes",
    ci: "Contraindications",
    maxLabel: "max",
    disclaimer: "Decision-support tool for healthcare professionals. Verify every dose before administration \u2014 does not replace clinical judgment.",
    weightNeeded: "Enter weight to calculate doses"
  }
};
const fmt = (n) => {
  if (n >= 100) return Math.round(n).toString();
  if (n >= 10) return (Math.round(n * 10) / 10).toString();
  return (Math.round(n * 100) / 100).toString();
};
function doseText(d, w, lang) {
  // Fixed-text doses are usually language-neutral (numbers and units), but
  // some carry wording; those supply fixedEn for the English UI.
  if (d.fixed) return lang === "en" && d.fixedEn ? d.fixedEn : d.fixed;
  const range = d.lo === d.hi ? `${d.lo}` : `${d.lo}\u2013${d.hi}`;
  let base = `${range} ${d.unit}`;
  if (!w) return base;
  const baseUnit = d.unit.replace(/^(mg|mcg|mL)\/kg/, "$1");
  let lo = d.lo * w, hi = d.hi * w;
  let capped = false;
  if (d.max) {
    if (lo > d.max) {
      lo = d.max;
      capped = true;
    }
    if (hi > d.max) {
      hi = d.max;
      capped = true;
    }
  }
  if (d.minAbs) {
    lo = Math.max(lo, d.minAbs);
    hi = Math.max(hi, d.minAbs);
  }
  const calc = lo === hi ? fmt(lo) : `${fmt(lo)}\u2013${fmt(hi)}`;
  return { base, calc: `${calc} ${baseUnit}`, capped };
}
// Palette. `S` is deliberately a *mutable* object: every component reads
// S.token at render time, so swapping the values in place and re-rendering
// re-themes the whole app without touching a single component.
//
// Tokens are semantic, not literal. "tintWarn" is the pale background behind a
// caution panel; in dark mode it is a deep amber rather than a pale one, so
// components never need to know which theme is active.
const LIGHT = {
  ink: "#1C2836",
  teal: "#1E3A5F",
  tealDark: "#14253F",
  onAccent: "#FFFFFF",
  monitor: "#7C90AB",
  bg: "#F4F6F9",
  card: "#FFFFFF",
  cardAlt: "#F8FAFC",
  line: "#E1E7EE",
  lineStrong: "#E4E9F0",
  red: "#BC4238",
  amber: "#A9661B",
  muted: "#49535F",
  // pale panels + their text
  tintInfo: "#E8F0F7",   tintInfoFg: "#1E3A5F",
  tintWarn: "#FBF0DD",   tintWarnFg: "#8A6320",
  tintWarnAlt: "#FBF3E6",
  tintDanger: "#FDECEC", tintDangerFg: "#B3403F",
  tintOk: "#E4F0EA",     tintOkFg: "#2F7355",
  tintOkAlt: "#3B8C6E",  tintOkSoft: "#6E8B6A",
  tintGuide: "#EDE8F5",  tintGuideFg: "#544A7D",
  tintNeutral: "#EEF2F7",
  tintSelected: "#E8EDF4"
};

// Same identity, inverted luminance. The navy accent lightens so it still
// reads as the app's colour against a dark ground, and text on the accent
// flips to near-black.
const DARK = {
  ink: "#E9EEF4",
  teal: "#8FB4DC",
  tealDark: "#A9C7E6",
  onAccent: "#0E1620",
  monitor: "#8FA3BC",
  bg: "#111820",
  card: "#1A2330",
  cardAlt: "#212C3B",
  line: "#2E3A49",
  lineStrong: "#3A485A",
  red: "#F08379",
  amber: "#E8A75A",
  muted: "#A6B3C2",
  tintInfo: "#1E2E42",   tintInfoFg: "#A8C8E8",
  tintWarn: "#3A2E1B",   tintWarnFg: "#EDBF7C",
  tintWarnAlt: "#332A1A",
  tintDanger: "#3B2222", tintDangerFg: "#F2938A",
  tintOk: "#1C3129",     tintOkFg: "#8ED0B0",
  tintOkAlt: "#7CC4A4",  tintOkSoft: "#9CBF98",
  tintGuide: "#2B2740",  tintGuideFg: "#BDB2E0",
  tintNeutral: "#232E3D",
  tintSelected: "#26344A"
};

const S = { ...LIGHT };
function applyTheme(mode) {
  Object.assign(S, mode === "dark" ? DARK : LIGHT);
}
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: `1.5px solid ${S.line}`,
  fontSize: 15,
  outline: "none",
  background: "#fff",
  color: S.ink,
  boxSizing: "border-box",
  fontFamily: "inherit"
};
const _mem = {};
function storeSet(key, value, ttlMs) {
  const rec = JSON.stringify({ v: value, exp: ttlMs ? Date.now() + ttlMs : null });
  _mem[key] = rec;
  try {
    window.localStorage.setItem(key, rec);
  } catch (e) {
  }
}
function storeGet(key) {
  let raw = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch (e) {
  }
  if (raw == null) raw = _mem[key] || null;
  if (raw == null) return null;
  try {
    const rec = JSON.parse(raw);
    if (rec.exp && Date.now() > rec.exp) {
      storeDel(key);
      return null;
    }
    return rec.v;
  } catch (e) {
    return null;
  }
}
function storeDel(key) {
  delete _mem[key];
  try {
    window.localStorage.removeItem(key);
  } catch (e) {
  }
}
const PATIENT_TTL = 60 * 60 * 1e3;
