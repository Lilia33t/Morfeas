const bmiCalc = (w, h) => w && h ? w / (h / 100) ** 2 : null;
const lbmJames = (w, h, sex) => sex === "M" ? 1.1 * w - 128 * (w / h) ** 2 : 1.07 * w - 148 * (w / h) ** 2;
const ffmJan = (w, h, sex) => {
  const bmi = bmiCalc(w, h);
  return sex === "M" ? 9270 * w / (6680 + 216 * bmi) : 9270 * w / (8780 + 244 * bmi);
};
// Al-Sallami fat-free mass (used by the Eleveld models): Janmahasatian with an
// age/maturation factor. Al-Sallami et al., Clin Pharmacokinet 2015.
const ffmAlSallami = (w, h, sex, age) => {
  const bmi = w / Math.pow(h / 100, 2);
  return sex === "M"
    ? (0.88 + 0.12 / (1 + Math.pow(age / 13.4, -12.7))) * (9270 * w) / (6680 + 216 * bmi)
    : (1.11 - 0.11 / (1 + Math.pow(age / 7.1, -1.1))) * (9270 * w) / (8780 + 244 * bmi);
};
const ibwDevine = (h, sex) => {
  if (!h || h <= 0) return null;
  const inchesOver60 = h / 2.54 - 60;
  const base = sex === "M" ? 50 : 45.5;
  const v = base + 2.3 * inchesOver60;
  // Devine is an adult formula; below ~100 cm it goes negative, which must never reach a calculation.
  return v > 0 ? v : null;
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
    targetsEl: "\u0395\u03C0\u03B1\u03B3\u03C9\u03B3\u03AE: \u03B1\u03C1\u03C7\u03B9\u03BA\u03CC\u03C2 \u03C3\u03C4\u03CC\u03C7\u03BF\u03C2 4 \u00B5g/mL \u03BC\u03B5 \u03C0\u03C1\u03BF\u03BD\u03AC\u03C1\u03BA\u03C9\u03C3\u03B7, 6 \u00B5g/mL \u03C7\u03C9\u03C1\u03AF\u03C2 \u00B7 \u03C7\u03B1\u03BC\u03B7\u03BB\u03CC\u03C4\u03B5\u03C1\u03BF\u03C2 >55 \u03B5\u03C4\u03CE\u03BD \u00B7 \u03A3\u03C5\u03BD\u03C4\u03AE\u03C1\u03B7\u03C3\u03B7 3\u20136 \u00B5g/mL \u00B7 \u039A\u03B1\u03C4\u03B1\u03C3\u03C4\u03BF\u03BB\u03AE \u03B5\u03C0\u03B5\u03BC\u03B2\u03AC\u03C3\u03B5\u03C9\u03BD 0.5\u20132.5 \u00B5g/mL (\u03C7\u03B1\u03BC\u03B7\u03BB\u03AC \u03C3\u03B5 \u03B7\u03BB\u03B9\u03BA\u03B9\u03C9\u03BC\u03AD\u03BD\u03BF\u03C5\u03C2 ASA 3\u20134) \u00B7 \u039C\u0395\u0398 0.2\u20132 \u00B5g/mL (SmPC Diprivan, \u03C3\u03CD\u03C3\u03C4\u03B7\u03BC\u03B1 Diprifusor)",
    targetsEn: "Induction: initial target 4 \u00B5g/mL premedicated, 6 \u00B5g/mL unpremedicated \u00B7 lower over 55 years \u00B7 Maintenance 3\u20136 \u00B5g/mL \u00B7 Procedural sedation 0.5\u20132.5 \u00B5g/mL (low end in elderly ASA 3\u20134) \u00B7 ICU 0.2\u20132 \u00B5g/mL (Diprivan SmPC, Diprifusor system)",
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
    targetsEl: "Ce (\u03C4\u03BF\u03C0\u03B9\u03BA\u03CC\u03C2 \u03BF\u03B4\u03B7\u03B3\u03CC\u03C2 NHS Lothian, \u03CC\u03C7\u03B9 SmPC): \u03B3\u03C1\u03AE\u03B3\u03BF\u03C1\u03B7 \u03B5\u03C0\u03B1\u03B3\u03C9\u03B3\u03AE 4\u20136 \u00B5g/mL \u00B7 \u03B2\u03C1\u03B1\u03B4\u03B5\u03AF\u03B1 1\u20133 \u00B5g/mL \u03BC\u03B5 \u03B2\u03AE\u03BC\u03B1\u03C4\u03B1 0.5\u20131 \u00B7 \u03C3\u03C5\u03BD\u03C4\u03AE\u03C1\u03B7\u03C3\u03B7 3\u20136 \u00B5g/mL (2.5\u20134 \u03BC\u03B5 \u03BF\u03C0\u03B9\u03BF\u03B5\u03B9\u03B4\u03AD\u03C2) \u00B7 \u03B1\u03C6\u03CD\u03C0\u03BD\u03B9\u03C3\u03B7 1\u20132 \u00B5g/mL \u00B7 \u03C4\u03B9\u03C4\u03BB\u03BF\u03C0\u03BF\u03AF\u03B7\u03C3\u03B7 \u03C3\u03C4\u03BF \u03BA\u03BB\u03B9\u03BD\u03B9\u03BA\u03CC \u03B1\u03C0\u03BF\u03C4\u03AD\u03BB\u03B5\u03C3\u03BC\u03B1",
    targetsEn: "Ce (NHS Lothian local guide, not SmPC): rapid induction 4\u20136 \u00B5g/mL \u00B7 slow 1\u20133 \u00B5g/mL in 0.5\u20131 steps \u00B7 maintenance 3\u20136 \u00B5g/mL (2.5\u20134 with an opioid) \u00B7 waking 1\u20132 \u00B5g/mL \u00B7 titrate to clinical effect",
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
    targetsEl: "\u03A7\u03C9\u03C1\u03AF\u03C2 \u03B5\u03C0\u03B9\u03B2\u03B5\u03B2\u03B1\u03B9\u03C9\u03BC\u03AD\u03BD\u03BF\u03C5\u03C2 \u03C3\u03C4\u03CC\u03C7\u03BF\u03C5\u03C2 \u03B1\u03C0\u03CC \u03C0\u03B7\u03B3\u03AE \u2014 \u03C4\u03B9\u03C4\u03BB\u03BF\u03C0\u03BF\u03AF\u03B7\u03C3\u03B7 \u03C3\u03C4\u03BF \u03BA\u03BB\u03B9\u03BD\u03B9\u03BA\u03CC \u03B1\u03C0\u03BF\u03C4\u03AD\u03BB\u03B5\u03C3\u03BC\u03B1 \u03BA\u03B1\u03B9 \u03BA\u03B1\u03C4\u03AC \u03C4\u03BF \u03C4\u03BF\u03C0\u03B9\u03BA\u03CC \u03C0\u03C1\u03C9\u03C4\u03CC\u03BA\u03BF\u03BB\u03BB\u03BF.",
    targetsEn: "No source-verified targets \u2014 titrate to clinical effect and local protocol.",
    v1Fn: (c) => 6.2831 * (c.w / (c.w + 33.553)) / (70 / (70 + 33.553)),
    // Eleveld 2018: V1ref 6.28 L (arterial), sigmoid in weight, E50 33.6 kg
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
    targetsEl: "\u03A7\u03C9\u03C1\u03AF\u03C2 \u03B5\u03C0\u03B9\u03B2\u03B5\u03B2\u03B1\u03B9\u03C9\u03BC\u03AD\u03BD\u03BF\u03C5\u03C2 \u03C3\u03C4\u03CC\u03C7\u03BF\u03C5\u03C2 \u03B1\u03C0\u03CC \u03C0\u03B7\u03B3\u03AE \u2014 \u03C4\u03B9\u03C4\u03BB\u03BF\u03C0\u03BF\u03AF\u03B7\u03C3\u03B7 \u03C3\u03C4\u03BF \u03BA\u03BB\u03B9\u03BD\u03B9\u03BA\u03CC \u03B1\u03C0\u03BF\u03C4\u03AD\u03BB\u03B5\u03C3\u03BC\u03B1 \u03BA\u03B1\u03B9 \u03BA\u03B1\u03C4\u03AC \u03C4\u03BF \u03C4\u03BF\u03C0\u03B9\u03BA\u03CC \u03C0\u03C1\u03C9\u03C4\u03CC\u03BA\u03BF\u03BB\u03BB\u03BF.",
    targetsEn: "No source-verified targets \u2014 titrate to clinical effect and local protocol.",
    v1k: 0.41,
    rangeEl: "Παιδιά 3–16 ετών, ≥15 kg (NYSORA).",
    rangeEn: "Children 3\u201316 yr, \u226515 kg (NYSORA).",
    valid: (c) => c.a >= 3 && c.a <= 16 && c.w >= 15
  },
  {
    id: "paedfusor",
    drug: "Propofol",
    name: "Paedfusor (\u03C0\u03B1\u03B9\u03B4\u03B9\u03B1\u03C4\u03C1\u03B9\u03BA\u03CC)",
    requires: ["w", "a"],
    targetType: "Cp (plasma)",
    targetsEl: "\u03A7\u03C9\u03C1\u03AF\u03C2 \u03B5\u03C0\u03B9\u03B2\u03B5\u03B2\u03B1\u03B9\u03C9\u03BC\u03AD\u03BD\u03BF\u03C5\u03C2 \u03C3\u03C4\u03CC\u03C7\u03BF\u03C5\u03C2 \u03B1\u03C0\u03CC \u03C0\u03B7\u03B3\u03AE \u2014 \u03C4\u03B9\u03C4\u03BB\u03BF\u03C0\u03BF\u03AF\u03B7\u03C3\u03B7 \u03C3\u03C4\u03BF \u03BA\u03BB\u03B9\u03BD\u03B9\u03BA\u03CC \u03B1\u03C0\u03BF\u03C4\u03AD\u03BB\u03B5\u03C3\u03BC\u03B1 \u03BA\u03B1\u03B9 \u03BA\u03B1\u03C4\u03AC \u03C4\u03BF \u03C4\u03BF\u03C0\u03B9\u03BA\u03CC \u03C0\u03C1\u03C9\u03C4\u03CC\u03BA\u03BF\u03BB\u03BB\u03BF.",
    targetsEn: "No source-verified targets \u2014 titrate to clinical effect and local protocol.",
    v1Fn: (c) => c.w * (c.a < 13 ? 0.4584 : c.a < 14 ? 0.4 : c.a < 15 ? 0.342 : c.a < 16 ? 0.284 : 0.22857),
    // V1 0.4584 L/kg at 1-12 yr, falling to 0.229 L/kg at 16 yr
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
    targetsEl: "\u0395\u03C0\u03B1\u03B3\u03C9\u03B3\u03AE & \u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B5\u03AF\u03BF 3\u20138 ng/mL \u00B7 \u03AD\u03C9\u03C2 15 ng/mL \u03C3\u03B5 \u03B9\u03B4\u03B9\u03B1\u03AF\u03C4\u03B5\u03C1\u03B1 \u03B5\u03C0\u03CE\u03B4\u03C5\u03BD\u03B1 \u03B5\u03C1\u03B5\u03B8\u03AF\u03C3\u03BC\u03B1\u03C4\u03B1 \u00B7 >65 \u03B5\u03C4\u03CE\u03BD \u03B1\u03C1\u03C7\u03B9\u03BA\u03AC 1.5\u20134 ng/mL \u00B7 TCI \u03BC\u03B5 \u03B1\u03C5\u03C4\u03CC\u03BC\u03B1\u03C4\u03B7 \u03B1\u03BD\u03B1\u03C0\u03BD\u03BF\u03AE: \u03B4\u03B5\u03BD \u03C5\u03C0\u03AC\u03C1\u03C7\u03B5\u03B9 \u03C4\u03B5\u03BA\u03BC\u03B7\u03C1\u03AF\u03C9\u03C3\u03B7 (SmPC Ultiva)",
    targetsEn: "Induction & surgery 3\u20138 ng/mL \u00B7 up to 15 ng/mL for particularly stimulating procedures \u00B7 over 65 years initially 1.5\u20134 ng/mL \u00B7 TCI with spontaneous ventilation: no documentation to support it (Ultiva SmPC)",
    v1Fn: (c) => 5.1 - 0.0201 * (c.a - 40) + 0.072 * (lbmJames(c.w, c.h, c.s) - 55),
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
    targetsEl: "\u03A7\u03C9\u03C1\u03AF\u03C2 \u03B5\u03C0\u03B9\u03B2\u03B5\u03B2\u03B1\u03B9\u03C9\u03BC\u03AD\u03BD\u03BF\u03C5\u03C2 \u03C3\u03C4\u03CC\u03C7\u03BF\u03C5\u03C2 \u03B1\u03C0\u03CC \u03C0\u03B7\u03B3\u03AE \u2014 \u03C4\u03B9\u03C4\u03BB\u03BF\u03C0\u03BF\u03AF\u03B7\u03C3\u03B7 \u03C3\u03C4\u03BF \u03BA\u03BB\u03B9\u03BD\u03B9\u03BA\u03CC \u03B1\u03C0\u03BF\u03C4\u03AD\u03BB\u03B5\u03C3\u03BC\u03B1 \u03BA\u03B1\u03B9 \u03BA\u03B1\u03C4\u03AC \u03C4\u03BF \u03C4\u03BF\u03C0\u03B9\u03BA\u03CC \u03C0\u03C1\u03C9\u03C4\u03CC\u03BA\u03BF\u03BB\u03BB\u03BF.",
    targetsEn: "No source-verified targets \u2014 titrate to clinical effect and local protocol.",
    v1Fn: (c) => 5.81 * (ffmAlSallami(c.w, c.h, c.s, c.a) / ffmAlSallami(70, 170, "M", 35)) * Math.exp(-0.00554 * (c.a - 35)),
    // Eleveld 2017: V1ref 5.81 L, scaled by fat-free mass and age
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
    targetsEl: "\u03A7\u03C9\u03C1\u03AF\u03C2 \u03B5\u03C0\u03B9\u03B2\u03B5\u03B2\u03B1\u03B9\u03C9\u03BC\u03AD\u03BD\u03BF\u03C5\u03C2 \u03C3\u03C4\u03CC\u03C7\u03BF\u03C5\u03C2 \u03B1\u03C0\u03CC \u03C0\u03B7\u03B3\u03AE \u2014 \u03C4\u03B9\u03C4\u03BB\u03BF\u03C0\u03BF\u03AF\u03B7\u03C3\u03B7 \u03C3\u03C4\u03BF \u03BA\u03BB\u03B9\u03BD\u03B9\u03BA\u03CC \u03B1\u03C0\u03BF\u03C4\u03AD\u03BB\u03B5\u03C3\u03BC\u03B1 \u03BA\u03B1\u03B9 \u03BA\u03B1\u03C4\u03AC \u03C4\u03BF \u03C4\u03BF\u03C0\u03B9\u03BA\u03CC \u03C0\u03C1\u03C9\u03C4\u03CC\u03BA\u03BF\u03BB\u03BB\u03BF.",
    targetsEn: "No source-verified targets \u2014 titrate to clinical effect and local protocol.",
    v1Fixed: 14.3,
    // Gepts 1995: Vc 14.3 L, not weight-adjusted
    rangeEl: "\u0397\u03BB\u03B9\u03BA\u03AF\u03B1 \u226512 \u03B5\u03C4\u03CE\u03BD. \u03A4\u03BF \u03BC\u03BF\u03BD\u03C4\u03AD\u03BB\u03BF \u0394\u0395\u039D \u03C0\u03C1\u03BF\u03C3\u03B1\u03C1\u03BC\u03CC\u03B6\u03B5\u03C4\u03B1\u03B9 \u03C3\u03C4\u03BF \u03B2\u03AC\u03C1\u03BF\u03C2 (Vc 14.3 L \u03B3\u03B9\u03B1 \u03CC\u03BB\u03BF\u03C5\u03C2).",
    rangeEn: "Age 12 years and over. The model is NOT weight-adjusted (Vc 14.3 L for everyone).",
    valid: (c) => !c.a || c.a >= 12
  },
  {
    id: "maitre",
    drug: "Alfentanil",
    name: "Maitre",
    requires: ["w", "a", "s"],
    targetType: "Cp (plasma)",
    targetsEl: "\u03A7\u03C9\u03C1\u03AF\u03C2 \u03B5\u03C0\u03B9\u03B2\u03B5\u03B2\u03B1\u03B9\u03C9\u03BC\u03AD\u03BD\u03BF\u03C5\u03C2 \u03C3\u03C4\u03CC\u03C7\u03BF\u03C5\u03C2 \u03B1\u03C0\u03CC \u03C0\u03B7\u03B3\u03AE \u2014 \u03C4\u03B9\u03C4\u03BB\u03BF\u03C0\u03BF\u03AF\u03B7\u03C3\u03B7 \u03C3\u03C4\u03BF \u03BA\u03BB\u03B9\u03BD\u03B9\u03BA\u03CC \u03B1\u03C0\u03BF\u03C4\u03AD\u03BB\u03B5\u03C3\u03BC\u03B1 \u03BA\u03B1\u03B9 \u03BA\u03B1\u03C4\u03AC \u03C4\u03BF \u03C4\u03BF\u03C0\u03B9\u03BA\u03CC \u03C0\u03C1\u03C9\u03C4\u03CC\u03BA\u03BF\u03BB\u03BB\u03BF.",
    targetsEn: "No source-verified targets \u2014 titrate to clinical effect and local protocol.",
    v1Fn: (c) => (c.s === "F" ? 0.128 : 0.111) * c.w,
    // Maitre 1987: V1 0.111 L/kg, x1.15 in women
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
    targetsEl: "\u03A7\u03C9\u03C1\u03AF\u03C2 \u03B5\u03C0\u03B9\u03B2\u03B5\u03B2\u03B1\u03B9\u03C9\u03BC\u03AD\u03BD\u03BF\u03C5\u03C2 \u03C3\u03C4\u03CC\u03C7\u03BF\u03C5\u03C2 \u03B1\u03C0\u03CC \u03C0\u03B7\u03B3\u03AE \u2014 \u03C4\u03B9\u03C4\u03BB\u03BF\u03C0\u03BF\u03AF\u03B7\u03C3\u03B7 \u03C3\u03C4\u03BF \u03BA\u03BB\u03B9\u03BD\u03B9\u03BA\u03CC \u03B1\u03C0\u03BF\u03C4\u03AD\u03BB\u03B5\u03C3\u03BC\u03B1 \u03BA\u03B1\u03B9 \u03BA\u03B1\u03C4\u03AC \u03C4\u03BF \u03C4\u03BF\u03C0\u03B9\u03BA\u03CC \u03C0\u03C1\u03C9\u03C4\u03CC\u03BA\u03BF\u03BB\u03BB\u03BF.",
    targetsEn: "No source-verified targets \u2014 titrate to clinical effect and local protocol.",
    v1k: 0.0254,
    // Hannivoort 2015: V1 1.78 L per 70 kg (allometric, total body weight)
    noBolus: true,
    rangeEl: "\u03A5\u03B3\u03B9\u03B5\u03AF\u03C2 \u03B5\u03B8\u03B5\u03BB\u03BF\u03BD\u03C4\u03AD\u03C2. \u03A0\u03BF\u03BB\u03CD \u03BC\u03B9\u03BA\u03C1\u03CC V1 (1.78 L/70 kg) \u2014 \u03B7 \u03B1\u03C1\u03C7\u03B9\u03BA\u03AE \u03C0\u03BF\u03C3\u03CC\u03C4\u03B7\u03C4\u03B1 \u03B4\u03B5\u03BD \u03B1\u03BD\u03C4\u03B9\u03C3\u03C4\u03BF\u03B9\u03C7\u03B5\u03AF \u03C3\u03B5 \u03B4\u03CC\u03C3\u03B7 \u03C6\u03CC\u03C1\u03C4\u03B9\u03C3\u03B7\u03C2, \u03B3\u03B9\u2019 \u03B1\u03C5\u03C4\u03CC \u03B4\u03B5\u03BD \u03B5\u03BC\u03C6\u03B1\u03BD\u03AF\u03B6\u03B5\u03C4\u03B1\u03B9. \u03A6\u03CC\u03C1\u03C4\u03B9\u03C3\u03B7 \u03C3\u03B5 10 min \u03B3\u03B9\u03B1 \u03B1\u03C0\u03BF\u03C6\u03C5\u03B3\u03AE \u03C5\u03C0\u03B5\u03C1\u03C4\u03B1\u03C3\u03B9\u03BA\u03AE\u03C2/\u03B2\u03C1\u03B1\u03B4\u03C5\u03BA\u03B1\u03C1\u03B4\u03B9\u03BA\u03AE\u03C2 \u03B1\u03C0\u03AC\u03BD\u03C4\u03B7\u03C3\u03B7\u03C2. \u03A0\u03B5\u03C1\u03B9\u03B5\u03C0\u03B5\u03BC\u03B2\u03B1\u03C4\u03B9\u03BA\u03AE \u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03BF\u03BB\u03AE.",
    rangeEn: "Healthy volunteers. Very small V1 (1.78 L/70 kg) \u2014 the initial amount is not a loading dose, so it is not shown. Load over 10 min to avoid a hypertensive/bradycardic response. Procedural sedation.",
    valid: (c) => c.w >= 30
  }
];
const TCI_DRUGS = ["Propofol", "Remifentanil", "Sufentanil", "Alfentanil", "Dexmedetomidine"];
const covLabel = { w: { el: "\u0392\u03AC\u03C1\u03BF\u03C2", en: "Weight" }, h: { el: "\u038E\u03C8\u03BF\u03C2", en: "Height" }, a: { el: "\u0397\u03BB\u03B9\u03BA\u03AF\u03B1", en: "Age" }, s: { el: "\u03A6\u03CD\u03BB\u03BF", en: "Sex" } };
const T = {
  el: {
    appName: "Morfeas",
    tabs: { home: "\u0391\u03C1\u03C7\u03B9\u03BA\u03AE", meds: "\u03A6\u03AC\u03C1\u03BC\u03B1\u03BA\u03B1", tci: "TCI", tools: "\u0395\u03C1\u03B3\u03B1\u03BB\u03B5\u03AF\u03B1", peds: "\u03A0\u03B1\u03B9\u03B4\u03B9\u03AC", lists: "\u039B\u03AF\u03C3\u03C4\u03B5\u03C2", about: "\u03A3\u03C7\u03B5\u03C4\u03B9\u03BA\u03AC" },
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
    disclaimer: "\u0395\u03BA\u03C0\u03B1\u03B9\u03B4\u03B5\u03C5\u03C4\u03B9\u03BA\u03CC \u03BA\u03B1\u03B9 \u03B5\u03BD\u03B7\u03BC\u03B5\u03C1\u03C9\u03C4\u03B9\u03BA\u03CC \u03B2\u03BF\u03AE\u03B8\u03B7\u03BC\u03B1 \u03B3\u03B9\u03B1 \u03B5\u03C0\u03B1\u03B3\u03B3\u03B5\u03BB\u03BC\u03B1\u03C4\u03AF\u03B5\u03C2 \u03C5\u03B3\u03B5\u03AF\u03B1\u03C2. \u0395\u03C0\u03B1\u03BB\u03B7\u03B8\u03B5\u03CD\u03C3\u03C4\u03B5 \u03BA\u03AC\u03B8\u03B5 \u03B4\u03CC\u03C3\u03B7 \u03C0\u03C1\u03B9\u03BD \u03C4\u03B7 \u03C7\u03BF\u03C1\u03AE\u03B3\u03B7\u03C3\u03B7 \u2014 \u03B4\u03B5\u03BD \u03C5\u03C0\u03BF\u03BA\u03B1\u03B8\u03B9\u03C3\u03C4\u03AC \u03C4\u03B7\u03BD \u03BA\u03BB\u03B9\u03BD\u03B9\u03BA\u03AE \u03BA\u03C1\u03AF\u03C3\u03B7.",
    weightNeeded: "\u0395\u03B9\u03C3\u03AC\u03B3\u03B5\u03C4\u03B5 \u03B2\u03AC\u03C1\u03BF\u03C2 \u03B3\u03B9\u03B1 \u03C5\u03C0\u03BF\u03BB\u03BF\u03B3\u03B9\u03C3\u03BC\u03CC \u03B4\u03CC\u03C3\u03B5\u03C9\u03BD"
  },
  en: {
    appName: "Morfeas",
    tabs: { home: "Home", meds: "Meds", tci: "TCI", tools: "Tools", peds: "Peds", lists: "Lists", about: "About" },
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
    disclaimer: "Educational and informational aid for healthcare professionals. Verify every dose before administration \u2014 does not replace clinical judgment.",
    weightNeeded: "Enter weight to calculate doses"
  }
};
const fmt = (n) => {
  if (n >= 100) return Math.round(n).toString();
  if (n >= 10) return (Math.round(n * 10) / 10).toString();
  if (n >= 1) return (Math.round(n * 100) / 100).toString();
  // Below 1, keep two significant figures so neonatal doses (e.g. 0.007 mg) are neither rounded up nor shown as 0.
  if (n > 0) return Number(n.toPrecision(2)).toString();
  return "0";
};
// IV lidocaine consensus (Foo et al., Anaesthesia 2021): "ideal body weight = (height in cm - 100) for men; and (height in cm - 105) for women".
const ibwLidoConsensus = (h, sex) => {
  if (!(h > 0)) return null;
  const v = sex === "M" ? h - 100 : h - 105;
  return v > 0 ? v : null;
};
function doseText(d, w, lang) {
  // Fixed-text doses are usually language-neutral (numbers and units), but
  // some carry wording; those supply fixedEn for the English UI.
  if (d.fixed) return lang === "en" && d.fixedEn ? d.fixedEn : d.fixed;
  const range = d.lo === d.hi ? `${d.lo}` : `${d.lo}\u2013${d.hi}`;
  let base = `${range} ${d.unit}`;
  if (!(w > 0)) return base;
  const baseUnit = d.unit.replace(/^(mg|mcg|g|mL|IU|U|mmol|mEq)\/kg/, "$1");
  let lo = d.lo * w, hi = d.hi * w;
  const rawLo = lo, rawHi = hi;
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
  // How the number was reached, so a wrong weight is visible at a glance.
  // Language-neutral (numbers, units, "max"/"min") on purpose.
  const raw = rawLo === rawHi ? fmt(rawLo) : `${fmt(rawLo)}\u2013${fmt(rawHi)}`;
  let expl = `${range} ${d.unit} \xD7 ${fmt(w)} kg = ${raw} ${baseUnit}`;
  if (capped) expl += ` \u2192 max ${d.max} ${baseUnit}`;
  if (d.minAbs && (rawLo < d.minAbs || rawHi < d.minAbs)) expl += ` \u2192 min ${d.minAbs} ${baseUnit}`;
  return { base, calc: `${calc} ${baseUnit}`, capped, expl };
}
// Greek keyboards type a comma for the decimal point. Number fields are plain
// text fields (inputMode "decimal") run through this: comma -> point, one
// separator, digits only, an optional leading minus.
function numIn(v) {
  let s = String(v == null ? "" : v).trim().replace(/,/g, ".");
  const neg = s.charAt(0) === "-";
  s = s.replace(/[^0-9.]/g, "");
  const i = s.indexOf(".");
  if (i >= 0) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, "");
  return (neg ? "-" : "") + s;
}
// Read-aloud ("reader" role, as in the QRH): turns a checklist step into text a phone voice
// pronounces well \u2014 units, routes and symbols spelled out. Plain regular expressions only
// (no look-behind), so older iPhones can still load the app.
const SPEECH_RULES = {
  el: [
    [/[\u2080-\u2089]/g, (d) => String("\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089".indexOf(d))],
    [/(^|[^\d])([1-5])(\u03B7|\u03B7\u03C2)(?![\u03B1-\u03C9\u03AC-\u03CE])/g, (m, a, n, e) => a + ["\u03C0\u03C1\u03CE\u03C4\u03B7", "\u03B4\u03B5\u03CD\u03C4\u03B5\u03C1\u03B7", "\u03C4\u03C1\u03AF\u03C4\u03B7", "\u03C4\u03AD\u03C4\u03B1\u03C1\u03C4\u03B7", "\u03C0\u03AD\u03BC\u03C0\u03C4\u03B7"][n - 1] + (e === "\u03B7\u03C2" ? "\u03C2" : "")],
    [/&/g, " \u03BA\u03B1\u03B9 "],
    [/([^\s\d])\s?\u2013\s?(\d)/g, "$1 \u03AD\u03C9\u03C2 $2"],
    [/q\s?(\d+)\s?[\u2013-]\s?(\d+)\s?min/g, "\u03BA\u03AC\u03B8\u03B5 $1 \u03AD\u03C9\u03C2 $2 \u03BB\u03B5\u03C0\u03C4\u03AC"],
    [/q\s?(\d+)\s?min/g, "\u03BA\u03AC\u03B8\u03B5 $1 \u03BB\u03B5\u03C0\u03C4\u03AC"],
    [/(\u00B5g|\u03BCg|mcg)\/kg\/min/g, " \u03BC\u03B9\u03BA\u03C1\u03BF\u03B3\u03C1\u03B1\u03BC\u03BC\u03AC\u03C1\u03B9\u03B1 \u03B1\u03BD\u03AC \u03BA\u03B9\u03BB\u03CC \u03B1\u03BD\u03AC \u03BB\u03B5\u03C0\u03C4\u03CC"],
    [/mg\/kg\/h/g, " \u03C7\u03B9\u03BB\u03B9\u03BF\u03C3\u03C4\u03CC\u03B3\u03C1\u03B1\u03BC\u03BC\u03B1 \u03B1\u03BD\u03AC \u03BA\u03B9\u03BB\u03CC \u03C4\u03B7\u03BD \u03CE\u03C1\u03B1"],
    [/(\u00B5g|\u03BCg|mcg)\/kg/g, " \u03BC\u03B9\u03BA\u03C1\u03BF\u03B3\u03C1\u03B1\u03BC\u03BC\u03AC\u03C1\u03B9\u03B1 \u03B1\u03BD\u03AC \u03BA\u03B9\u03BB\u03CC"],
    [/mg\/kg/g, " \u03C7\u03B9\u03BB\u03B9\u03BF\u03C3\u03C4\u03CC\u03B3\u03C1\u03B1\u03BC\u03BC\u03B1 \u03B1\u03BD\u03AC \u03BA\u03B9\u03BB\u03CC"],
    [/mL\/kg/g, " \u03C7\u03B9\u03BB\u03B9\u03BF\u03C3\u03C4\u03CC\u03BB\u03B9\u03C4\u03C1\u03B1 \u03B1\u03BD\u03AC \u03BA\u03B9\u03BB\u03CC"],
    [/J\/kg/g, " \u03C4\u03B6\u03AC\u03BF\u03C5\u03BB \u03B1\u03BD\u03AC \u03BA\u03B9\u03BB\u03CC"],
    [/L\/min/g, " \u03BB\u03AF\u03C4\u03C1\u03B1 \u03B1\u03BD\u03AC \u03BB\u03B5\u03C0\u03C4\u03CC"],
    [/cmH2O/g, " \u03B5\u03BA\u03B1\u03C4\u03BF\u03C3\u03C4\u03AC \u03BD\u03B5\u03C1\u03BF\u03CD"],
    [/mmHg/g, " \u03C7\u03B9\u03BB\u03B9\u03BF\u03C3\u03C4\u03AC \u03C5\u03B4\u03C1\u03B1\u03C1\u03B3\u03CD\u03C1\u03BF\u03C5"],
    [/kPa/g, " \u03BA\u03B9\u03BB\u03BF\u03C0\u03B1\u03C3\u03BA\u03AC\u03BB"],
    [/mmol/g, " \u03BC\u03B9\u03BB\u03B9\u03BC\u03CC\u03BB"],
    [/(\d)\s?(\u00B5g|\u03BCg|mcg)(?![A-Za-z])/g, "$1 \u03BC\u03B9\u03BA\u03C1\u03BF\u03B3\u03C1\u03B1\u03BC\u03BC\u03AC\u03C1\u03B9\u03B1"],
    [/(\d)\s?mg(?![A-Za-z])/g, "$1 \u03C7\u03B9\u03BB\u03B9\u03BF\u03C3\u03C4\u03CC\u03B3\u03C1\u03B1\u03BC\u03BC\u03B1"],
    [/(\d)\s?mL(?![A-Za-z])/g, "$1 \u03C7\u03B9\u03BB\u03B9\u03BF\u03C3\u03C4\u03CC\u03BB\u03B9\u03C4\u03C1\u03B1"],
    [/(\d)\s?kg(?![A-Za-z])/g, "$1 \u03BA\u03B9\u03BB\u03AC"],
    [/(\d)\s?g(?![A-Za-z])/g, "$1 \u03B3\u03C1\u03B1\u03BC\u03BC\u03AC\u03C1\u03B9\u03B1"],
    [/(\d)\s?cm(?![A-Za-z])/g, "$1 \u03B5\u03BA\u03B1\u03C4\u03BF\u03C3\u03C4\u03AC"],
    [/(\d)\s?J(?![A-Za-z])/g, "$1 \u03C4\u03B6\u03AC\u03BF\u03C5\u03BB"],
    [/(\d)\s?(IU|U)(?![A-Za-z])/g, "$1 \u03BC\u03BF\u03BD\u03AC\u03B4\u03B5\u03C2"],
    [/\/min/g, " \u03B1\u03BD\u03AC \u03BB\u03B5\u03C0\u03C4\u03CC"],
    [/(\d)\s?min(?![A-Za-z])/g, "$1 \u03BB\u03B5\u03C0\u03C4\u03AC"],
    [/(\d)\s?s(?![A-Za-z])/g, "$1 \u03B4\u03B5\u03C5\u03C4\u03B5\u03C1\u03CC\u03BB\u03B5\u03C0\u03C4\u03B1"],
    [/(\d)\s?h(?![A-Za-z])/g, "$1 \u03CE\u03C1\u03B5\u03C2"],
    [/\bIV\/IO\b/g, "\u03B5\u03BD\u03B4\u03BF\u03C6\u03BB\u03AD\u03B2\u03B9\u03B1 \u03AE \u03B5\u03BD\u03B4\u03BF\u03BF\u03C3\u03C4\u03B9\u03BA\u03AC"],
    [/\bIV\b/g, "\u03B5\u03BD\u03B4\u03BF\u03C6\u03BB\u03AD\u03B2\u03B9\u03B1"],
    [/\bIO\b/g, "\u03B5\u03BD\u03B4\u03BF\u03BF\u03C3\u03C4\u03B9\u03BA\u03AC"],
    [/\bIM\b/g, "\u03B5\u03BD\u03B4\u03BF\u03BC\u03C5\u03CA\u03BA\u03AC"],
    [/\bSC\b/g, "\u03C5\u03C0\u03BF\u03B4\u03CC\u03C1\u03B9\u03B1"],
    [/\bmax\b/g, "\u03BC\u03AD\u03B3\u03B9\u03C3\u03C4\u03BF"],
    [/\bO2\b/g, "\u03BF\u03BE\u03C5\u03B3\u03CC\u03BD\u03BF"],
    [/(^|[^\d.])1\s+(\u03BB\u03B5\u03C0\u03C4\u03AC|\u03BC\u03B9\u03BA\u03C1\u03BF\u03B3\u03C1\u03B1\u03BC\u03BC\u03AC\u03C1\u03B9\u03B1|\u03B3\u03C1\u03B1\u03BC\u03BC\u03AC\u03C1\u03B9\u03B1|\u03C7\u03B9\u03BB\u03B9\u03BF\u03C3\u03C4\u03CC\u03B3\u03C1\u03B1\u03BC\u03BC\u03B1|\u03C7\u03B9\u03BB\u03B9\u03BF\u03C3\u03C4\u03CC\u03BB\u03B9\u03C4\u03C1\u03B1|\u03BA\u03B9\u03BB\u03AC|\u03CE\u03C1\u03B5\u03C2|\u03B4\u03B5\u03C5\u03C4\u03B5\u03C1\u03CC\u03BB\u03B5\u03C0\u03C4\u03B1|\u03BC\u03BF\u03BD\u03AC\u03B4\u03B5\u03C2)/g, (m, a, u) => a + "1 " + { "\u03BB\u03B5\u03C0\u03C4\u03AC": "\u03BB\u03B5\u03C0\u03C4\u03CC", "\u03BC\u03B9\u03BA\u03C1\u03BF\u03B3\u03C1\u03B1\u03BC\u03BC\u03AC\u03C1\u03B9\u03B1": "\u03BC\u03B9\u03BA\u03C1\u03BF\u03B3\u03C1\u03B1\u03BC\u03BC\u03AC\u03C1\u03B9\u03BF", "\u03B3\u03C1\u03B1\u03BC\u03BC\u03AC\u03C1\u03B9\u03B1": "\u03B3\u03C1\u03B1\u03BC\u03BC\u03AC\u03C1\u03B9\u03BF", "\u03C7\u03B9\u03BB\u03B9\u03BF\u03C3\u03C4\u03CC\u03B3\u03C1\u03B1\u03BC\u03BC\u03B1": "\u03C7\u03B9\u03BB\u03B9\u03BF\u03C3\u03C4\u03CC\u03B3\u03C1\u03B1\u03BC\u03BC\u03BF", "\u03C7\u03B9\u03BB\u03B9\u03BF\u03C3\u03C4\u03CC\u03BB\u03B9\u03C4\u03C1\u03B1": "\u03C7\u03B9\u03BB\u03B9\u03BF\u03C3\u03C4\u03CC\u03BB\u03B9\u03C4\u03C1\u03BF", "\u03BA\u03B9\u03BB\u03AC": "\u03BA\u03B9\u03BB\u03CC", "\u03CE\u03C1\u03B5\u03C2": "\u03CE\u03C1\u03B1", "\u03B4\u03B5\u03C5\u03C4\u03B5\u03C1\u03CC\u03BB\u03B5\u03C0\u03C4\u03B1": "\u03B4\u03B5\u03C5\u03C4\u03B5\u03C1\u03CC\u03BB\u03B5\u03C0\u03C4\u03BF", "\u03BC\u03BF\u03BD\u03AC\u03B4\u03B5\u03C2": "\u03BC\u03BF\u03BD\u03AC\u03B4\u03B1" }[u]],
    [/1:(\d+)\.(\d{3})(?!\d)/g, "1 \u03C0\u03C1\u03BF\u03C2 $1$2"],
    [/1:(\d+)/g, "1 \u03C0\u03C1\u03BF\u03C2 $1"],
    [/(\d)\.(\d)/g, "$1 \u03BA\u03CC\u03BC\u03BC\u03B1 $2"],
    [/(\d)\s?[\u2013-]\s?(\d)/g, "$1 \u03AD\u03C9\u03C2 $2"],
    [/%/g, " \u03C4\u03BF\u03B9\u03C2 \u03B5\u03BA\u03B1\u03C4\u03CC"],
    [/\u2265/g, " \u03C4\u03BF\u03C5\u03BB\u03AC\u03C7\u03B9\u03C3\u03C4\u03BF\u03BD "],
    [/\u2264/g, " \u03AD\u03C9\u03C2 "],
    [/>/g, " \u03C0\u03AC\u03BD\u03C9 \u03B1\u03C0\u03CC "],
    [/</g, " \u03BA\u03AC\u03C4\u03C9 \u03B1\u03C0\u03CC "],
    [/\u00B1/g, " \u03BC\u03B5 \u03AE \u03C7\u03C9\u03C1\u03AF\u03C2 "],
    [/~/g, " \u03C0\u03B5\u03C1\u03AF\u03C0\u03BF\u03C5 "],
    [/\u2192/g, ", \u03BC\u03B5\u03C4\u03AC, "],
    [/[\u00B7\u2022]/g, ". "],
    [/\s?[\u2014\u2013]\s?/g, ", "],
    [/[()\u00AB\u00BB"]/g, ", "],
    [/\//g, " \u03AE "]
  ],
  en: [
    [/[\u2080-\u2089]/g, (d) => String("\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089".indexOf(d))],
    [/&/g, " and "],
    [/([^\s\d])\s?\u2013\s?(\d)/g, "$1 to $2"],
    [/q\s?(\d+)\s?[\u2013-]\s?(\d+)\s?min/g, "every $1 to $2 minutes"],
    [/q\s?(\d+)\s?min/g, "every $1 minutes"],
    [/(\u00B5g|\u03BCg|mcg)\/kg\/min/g, " micrograms per kilogram per minute"],
    [/mg\/kg\/h/g, " milligrams per kilogram per hour"],
    [/(\u00B5g|\u03BCg|mcg)\/kg/g, " micrograms per kilogram"],
    [/mg\/kg/g, " milligrams per kilogram"],
    [/mL\/kg/g, " millilitres per kilogram"],
    [/J\/kg/g, " joules per kilogram"],
    [/L\/min/g, " litres per minute"],
    [/cmH2O/g, " centimetres of water"],
    [/mmHg/g, " millimetres of mercury"],
    [/kPa/g, " kilopascals"],
    [/mmol/g, " millimoles"],
    [/(\d)\s?(\u00B5g|\u03BCg|mcg)(?![A-Za-z])/g, "$1 micrograms"],
    [/(\d)\s?mg(?![A-Za-z])/g, "$1 milligrams"],
    [/(\d)\s?mL(?![A-Za-z])/g, "$1 millilitres"],
    [/(\d)\s?kg(?![A-Za-z])/g, "$1 kilograms"],
    [/(\d)\s?g(?![A-Za-z])/g, "$1 grams"],
    [/(\d)\s?cm(?![A-Za-z])/g, "$1 centimetres"],
    [/(\d)\s?J(?![A-Za-z])/g, "$1 joules"],
    [/(\d)\s?(IU|U)(?![A-Za-z])/g, "$1 units"],
    [/\/min/g, " per minute"],
    [/(\d)\s?min(?![A-Za-z])/g, "$1 minutes"],
    [/(\d)\s?s(?![A-Za-z])/g, "$1 seconds"],
    [/(\d)\s?h(?![A-Za-z])/g, "$1 hours"],
    [/\bIV\/IO\b/g, "I.V. or I.O."],
    [/\bIV\b/g, "I.V."],
    [/\bIO\b/g, "I.O."],
    [/\bIM\b/g, "I.M."],
    [/\bSC\b/g, "subcutaneous"],
    [/\bmax\b/g, "maximum"],
    [/(^|[^\d.])1\s+(milligrams|micrograms|grams|millilitres|kilograms|minutes|seconds|hours|units|joules)/g, (m, a, u) => a + "1 " + u.slice(0, -1)],
    [/1:(\d+)[.,](\d{3})(?!\d)/g, "1 in $1$2"],
    [/1:(\d+)/g, "1 in $1"],
    [/(\d)\s?[\u2013-]\s?(\d)/g, "$1 to $2"],
    [/%/g, " percent"],
    [/\u2265/g, " at least "],
    [/\u2264/g, " up to "],
    [/>/g, " more than "],
    [/</g, " less than "],
    [/\u00B1/g, " with or without "],
    [/~/g, " about "],
    [/\u2192/g, ", then, "],
    [/[\u00B7\u2022]/g, ". "],
    [/\s?[\u2014\u2013]\s?/g, ", "],
    [/[()\u00AB\u00BB\u201C\u201D"]/g, ", "],
    [/\//g, " or "]
  ]
};
function speechText(s, lang) {
  let t = String(s == null ? "" : s);
  for (const [re, rep] of SPEECH_RULES[lang === "en" ? "en" : "el"]) t = t.replace(re, rep);
  return t.replace(/\s+/g, " ").replace(/\s([,.:])/g, "$1").replace(/,(\s*,)+/g, ",").replace(/,\s*([.:])/g, "$1").replace(/\.(\s*\.)+/g, ".").replace(/^[\s,.]+|[\s,]+$/g, "").trim();
}
// Plausible patient values. Outside them no dose is calculated at all: a
// typo (700 kg, 0 kg, 150 years) must not produce a confident number.
const PATIENT_LIMITS = { w: [0.3, 300], h: [25, 230], a: [0, 120] };
function patientCheck(weight, age, height) {
  const w = parseFloat(weight), a = parseFloat(age), h = parseFloat(height);
  const out = (v, r) => !isNaN(v) && (v < r[0] || v > r[1]);
  return {
    w: String(weight).trim() !== "" && (isNaN(w) || out(w, PATIENT_LIMITS.w) || w === 0),
    a: String(age).trim() !== "" && (isNaN(a) || out(a, PATIENT_LIMITS.a)),
    h: String(height).trim() !== "" && (isNaN(h) || out(h, PATIENT_LIMITS.h) || h === 0)
  };
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
  bg: "#EAF0F8",
  card: "#FFFFFF",
  cardAlt: "#F8FAFC",
  line: "#E1E7EE",
  lineStrong: "#E4E9F0",
  // Text colours meet WCAG AA (4.5:1) on every light background they are used on.
  red: "#B54036",
  amber: "#955A17",
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

// Greek capitals carry no accents: uppercase in JS (CSS text-transform keeps the tonos in Chromium).
const UNIT_TOKENS = /^(?:\u00B5g|mcg|mg|ng|g|kg|mL|ml|L|dL|mmol|mol|min|h|s|IU|U|mEq|cmH\u2082O|mmHg)$/;
const upGr = (x) => typeof x === "string" ? x.split(/(\s+|[()\/,\u00B7:;\u2013\u2014-])/).map((tok) => UNIT_TOKENS.test(tok) ? tok : tok.normalize("NFD").replace(/[\u0301\u0342]/g, "").normalize("NFC").split("\u00B5").map((p) => p.toUpperCase()).join("\u00B5")).join("") : x;
// Build-time switch for what the app calculates (see audit/CALC-MODES.md):
//   "full"      — everything (current app)
//   "simple"    — hides complex calculators/decision tools (TCI, infusion rates, sedation rates,
//                 opioid conversion, recruitment protocol, NIV algorithm, paediatric growth/IBW)
//   "reference" — additionally no weight-based totals and no formula calculators: doses shown as
//                 mg/kg / ranges from the sources only
const CALC_MODE = "full";
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

// --- Renal function ------------------------------------------------------------
// Cockcroft-Gault gives creatinine clearance (mL/min), which is what drug SmPCs
// use for dose adjustment. CKD-EPI 2021 gives eGFR (mL/min/1.73 m²) for staging;
// it is the race-free equation (Inker et al., NEJM 2021). They are NOT
// interchangeable, and diverge most in the elderly and at extremes of weight.
const scrToMgdl = (scr, unit) => (unit === "umol" ? scr / 88.4 : scr);
const crclCG = (age, weightKg, scrMgdl, sex) => {
  if (!(age > 0) || !(weightKg > 0) || !(scrMgdl > 0)) return null;
  const v = ((140 - age) * weightKg) / (72 * scrMgdl);
  return sex === "F" ? v * 0.85 : v;
};
const egfrCKDEPI2021 = (age, scrMgdl, sex) => {
  if (!(age > 0) || !(scrMgdl > 0)) return null;
  const female = sex === "F";
  const k = female ? 0.7 : 0.9;
  const a = female ? -0.241 : -0.302;
  const r = scrMgdl / k;
  return 142 * Math.pow(Math.min(r, 1), a) * Math.pow(Math.max(r, 1), -1.2) *
    Math.pow(0.9938, age) * (female ? 1.012 : 1);
};
const ckdStage = (egfr) => {
  if (egfr == null) return null;
  if (egfr >= 90) return "G1";
  if (egfr >= 60) return "G2";
  if (egfr >= 45) return "G3a";
  if (egfr >= 30) return "G3b";
  if (egfr >= 15) return "G4";
  return "G5";
};

// --- Oxygen delivery and Fick cardiac output ------------------------------------
// CaO2 = 1.34 x Hb x SaO2 + 0.003 x PaO2 (mL O2/dL). Fick: CO = VO2 / (CaO2 - CvO2).
// VO2 is either measured or ASSUMED at 125 mL/min/m2; the
// assumption is the main source of error, particularly under anaesthesia, where
// VO2 falls, and in sepsis or fever, where it rises.
const bsaMosteller = (heightCm, weightKg) =>
  heightCm > 0 && weightKg > 0 ? Math.sqrt((heightCm * weightKg) / 3600) : null;
const o2Content = (hbGdl, satPct, po2) => {
  if (!(hbGdl > 0) || !(satPct > 0)) return null;
  return 1.34 * hbGdl * (satPct / 100) + 0.003 * (po2 > 0 ? po2 : 0);
};
const fickCO = (vo2, caO2, cvO2) => {
  if (!(vo2 > 0) || caO2 == null || cvO2 == null) return null;
  const avd = caO2 - cvO2;                 // mL O2/dL
  return avd > 0 ? vo2 / (avd * 10) : null; // L/min
};
