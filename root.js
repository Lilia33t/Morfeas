// Hoisted so the global search can index every tool without instantiating
// ToolsTab. ToolsTab reads the same array.
const TOOL_SECTIONS = [
  // Emergencies & scores
  { id: "crisis", group: "emergency", el: "\u039A\u03C1\u03AF\u03C3\u03B5\u03B9\u03C2 \u2014 \u0391\u03BB\u03B3\u03CC\u03C1\u03B9\u03B8\u03BC\u03BF\u03B9", en: "Crises \u2014 Algorithms", icon: "\u{1F6A8}", kw: "MH \u03BA\u03B1\u03BA\u03BF\u03AE\u03B8\u03B7\u03C2 \u03C5\u03C0\u03B5\u03C1\u03B8\u03B5\u03C1\u03BC\u03AF\u03B1 malignant hyperthermia LAST \u03B1\u03BD\u03B1\u03C6\u03C5\u03BB\u03B1\u03BE\u03AF\u03B1 anaphylaxis \u03B1\u03BB\u03B3\u03CC\u03C1\u03B9\u03B8\u03BC\u03BF\u03B9" },
  { id: "scores", group: "emergency", el: "\u039A\u03BB\u03AF\u03BC\u03B1\u03BA\u03B5\u03C2 \u03BA\u03B9\u03BD\u03B4\u03CD\u03BD\u03BF\u03C5", en: "Risk scores", icon: "\u{1F4CA}", kw: "Apfel PONV STOP-BANG OSA RCRI ARISCAT \u03C0\u03BD\u03B5\u03C5\u03BC\u03BF\u03BD\u03B9\u03BA\u03AD\u03C2 \u03B5\u03C0\u03B9\u03C0\u03BB\u03BF\u03BA\u03AD\u03C2 CFS frailty \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1 \u03BA\u03AF\u03BD\u03B4\u03C5\u03BD\u03BF\u03C2" },
  { id: "rotem", group: "emergency", el: "ROTEM / TEG (\u03B5\u03C1\u03BC\u03B7\u03BD\u03B5\u03AF\u03B1)", en: "ROTEM / TEG (interpretation)", icon: "\u{1FA78}", kw: "ROTEM TEG \u03B8\u03C1\u03BF\u03BC\u03B2\u03BF\u03B5\u03BB\u03B1\u03C3\u03C4\u03BF\u03B3\u03C1\u03B1\u03C6\u03AF\u03B1 EXTEM FIBTEM \u03C0\u03AE\u03BE\u03B7 coagulation \u03B1\u03B9\u03BC\u03BF\u03C1\u03C1\u03B1\u03B3\u03AF\u03B1" },
  // Subspecialties
  { id: "cardiac", group: "subspecialty", el: "\u039A\u03B1\u03C1\u03B4\u03B9\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE \u03B1\u03BD\u03B1\u03B9\u03C3\u03B8\u03B7\u03C3\u03AF\u03B1", en: "Cardiac anaesthesia", icon: "\u2764\uFE0F", kw: "\u03BA\u03B1\u03C1\u03B4\u03B9\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE cardiac CPB \u03B5\u03BE\u03C9\u03C3\u03C9\u03BC\u03B1\u03C4\u03B9\u03BA\u03AE \u03BA\u03C5\u03BA\u03BB\u03BF\u03C6\u03BF\u03C1\u03AF\u03B1 ACT" },
  { id: "obstetric", group: "subspecialty", el: "\u039C\u03B1\u03B9\u03B5\u03C5\u03C4\u03B9\u03BA\u03AE \u03B1\u03BD\u03B1\u03B9\u03C3\u03B8\u03B7\u03C3\u03AF\u03B1", en: "Obstetric anaesthesia", icon: "\u{1F930}", kw: "\u03BC\u03B1\u03B9\u03B5\u03C5\u03C4\u03B9\u03BA\u03AE obstetric \u03BA\u03B1\u03B9\u03C3\u03B1\u03C1\u03B9\u03BA\u03AE caesarean \u03C0\u03C1\u03BF\u03B5\u03BA\u03BB\u03B1\u03BC\u03C8\u03AF\u03B1 preeclampsia \u03B1\u03B9\u03BC\u03BF\u03C1\u03C1\u03B1\u03B3\u03AF\u03B1 PPH \u03C9\u03BA\u03C5\u03C4\u03BF\u03BA\u03AF\u03BD\u03B7" },
  { id: "thoracic", group: "subspecialty", el: "\u0398\u03C9\u03C1\u03B1\u03BA\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE \u03B1\u03BD\u03B1\u03B9\u03C3\u03B8\u03B7\u03C3\u03AF\u03B1", en: "Thoracic anaesthesia", icon: "\u{1FAC1}", kw: "\u03B8\u03C9\u03C1\u03B1\u03BA\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE thoracic DLT \u03B4\u03B9\u03C0\u03BB\u03BF\u03CD \u03B1\u03C5\u03BB\u03BF\u03CD one lung \u03BC\u03BF\u03BD\u03BF\u03C0\u03BD\u03B5\u03C5\u03BC\u03BF\u03BD\u03B9\u03BA\u03CC\u03C2 \u03B1\u03B5\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2 \u03C5\u03C0\u03BF\u03BE\u03AF\u03B1" },
  { id: "neuro", group: "subspecialty", el: "\u039D\u03B5\u03C5\u03C1\u03BF\u03B1\u03BD\u03B1\u03B9\u03C3\u03B8\u03B7\u03C3\u03AF\u03B1", en: "Neuroanaesthesia", icon: "\u{1F9E0}", kw: "\u03BD\u03B5\u03C5\u03C1\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE neuro ICP \u03B5\u03BD\u03B4\u03BF\u03BA\u03C1\u03AC\u03BD\u03B9\u03B1 \u03C0\u03AF\u03B5\u03C3\u03B7 \u03BC\u03B1\u03BD\u03BD\u03B9\u03C4\u03CC\u03BB\u03B7" },
  { id: "vascular", group: "subspecialty", el: "\u0391\u03B3\u03B3\u03B5\u03B9\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE \u03B1\u03BD\u03B1\u03B9\u03C3\u03B8\u03B7\u03C3\u03AF\u03B1", en: "Vascular anaesthesia", icon: "\u{1FAC0}", kw: "\u03B1\u03B3\u03B3\u03B5\u03B9\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE vascular \u03B1\u03BD\u03B5\u03CD\u03C1\u03C5\u03C3\u03BC\u03B1 aortic clamp \u03BA\u03B1\u03C1\u03C9\u03C4\u03AF\u03B4\u03B1" },
  { id: "bariatric", group: "subspecialty", el: "\u0392\u03B1\u03C1\u03B9\u03B1\u03C4\u03C1\u03B9\u03BA\u03CC\u03C2 / \u03A0\u03B1\u03C7\u03CD\u03C3\u03B1\u03C1\u03BA\u03BF\u03C2 \u03B1\u03C3\u03B8\u03B5\u03BD\u03AE\u03C2", en: "Bariatric / Obese patient", icon: "\u2696\uFE0F", kw: "\u03B2\u03B1\u03C1\u03B9\u03B1\u03C4\u03C1\u03B9\u03BA\u03AE bariatric \u03C0\u03B1\u03C7\u03C5\u03C3\u03B1\u03C1\u03BA\u03AF\u03B1 obesity IBW ABW OSA" },
  // Analgesia & regional
  { id: "postop", group: "analgesia", el: "\u039F\u03BE\u03B5\u03AF\u03B1 \u03BC\u03B5\u03C4\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AE \u03B1\u03BD\u03B1\u03BB\u03B3\u03B7\u03C3\u03AF\u03B1", en: "Acute postop analgesia", icon: "\u{1F489}", kw: "\u03BC\u03B5\u03C4\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AE \u03B1\u03BD\u03B1\u03BB\u03B3\u03B7\u03C3\u03AF\u03B1 postoperative analgesia \u03C0\u03BF\u03BB\u03C5\u03C4\u03C1\u03BF\u03C0\u03B9\u03BA\u03AE multimodal PCA" },
  { id: "neuraxial", group: "analgesia", el: "\u039D\u03B5\u03C5\u03C1\u03B1\u03BE\u03BF\u03BD\u03B9\u03BA\u03AE & \u03A0\u03B5\u03C1\u03B9\u03BF\u03C7\u03B9\u03BA\u03AE", en: "Neuraxial & Regional", icon: "\u{1F3AF}", kw: "\u03BD\u03B5\u03C5\u03C1\u03B1\u03BE\u03BF\u03BD\u03B9\u03BA\u03AE \u03C1\u03B1\u03C7\u03B9\u03B1\u03AF\u03B1 spinal \u03B5\u03C0\u03B9\u03C3\u03BA\u03BB\u03B7\u03C1\u03AF\u03B4\u03B9\u03BF\u03C2 epidural \u03C0\u03B5\u03C1\u03B9\u03BF\u03C7\u03B9\u03BA\u03AE regional block \u03B1\u03C0\u03BF\u03BA\u03BB\u03B5\u03B9\u03C3\u03BC\u03CC\u03C2 ESP TAP PECS serratus fascial plane \u03C0\u03B1\u03C1\u03B1\u03C3\u03C0\u03BF\u03BD\u03B4\u03C5\u03BB\u03B9\u03BA\u03CC\u03C2 paravertebral quadratus" },
  { id: "la", group: "analgesia", el: "\u038C\u03C1\u03B9\u03B1 \u03C4\u03BF\u03C0\u03B9\u03BA\u03CE\u03BD \u03B1\u03BD\u03B1\u03B9\u03C3\u03B8\u03B7\u03C4\u03B9\u03BA\u03CE\u03BD", en: "Local anesthetic limits", icon: "\u{1F9F4}", kw: "\u03C4\u03BF\u03C0\u03B9\u03BA\u03AC \u03B1\u03BD\u03B1\u03B9\u03C3\u03B8\u03B7\u03C4\u03B9\u03BA\u03AC local anaesthetic \u03BC\u03AD\u03B3\u03B9\u03C3\u03C4\u03B7 \u03B4\u03CC\u03C3\u03B7 max dose LAST \u03C4\u03BF\u03BE\u03B9\u03BA\u03CC\u03C4\u03B7\u03C4\u03B1 toxicity" },
  { id: "anticoag", group: "analgesia", el: "\u0391\u03BD\u03C4\u03B9\u03C0\u03B7\u03BA\u03C4\u03B9\u03BA\u03AC & \u039D\u03B5\u03C5\u03C1\u03B1\u03BE\u03BF\u03BD\u03B9\u03BA\u03CC\u03C2", en: "Anticoagulants & Neuraxial", icon: "\u{1FA78}", kw: "\u03B1\u03BD\u03C4\u03B9\u03C0\u03B7\u03BA\u03C4\u03B9\u03BA\u03AC anticoagulants DOAC \u03B7\u03C0\u03B1\u03C1\u03AF\u03BD\u03B7 heparin \u03B1\u03C3\u03C0\u03B9\u03C1\u03AF\u03BD\u03B7 clopidogrel \u03C7\u03C1\u03BF\u03BD\u03B9\u03C3\u03BC\u03CC\u03C2 ASRA" },
  // Calculators & pharmacology
  { id: "tci", group: "calc", el: "TCI / \u03A3\u03C4\u03BF\u03C7\u03B5\u03C5\u03BC\u03AD\u03BD\u03B7 \u03AD\u03B3\u03C7\u03C5\u03C3\u03B7", en: "TCI / Target-controlled", icon: "\u{1F4C9}", kw: "TCI Marsh Schnider Minto Eleveld propofol remifentanil \u03C3\u03C4\u03CC\u03C7\u03BF\u03C2 \u03C3\u03C5\u03B3\u03BA\u03AD\u03BD\u03C4\u03C1\u03C9\u03C3\u03B7 effect site" },
  { id: "quickcalc", group: "calc", el: "\u0393\u03C1\u03AE\u03B3\u03BF\u03C1\u03BF\u03B9 \u03C5\u03C0\u03BF\u03BB\u03BF\u03B3\u03B9\u03C3\u03C4\u03AD\u03C2", en: "Quick calculators", icon: "\u{1F9EE}", kw: "\u03B3\u03C1\u03AE\u03B3\u03BF\u03C1\u03BF\u03B9 \u03C5\u03C0\u03BF\u03BB\u03BF\u03B3\u03B9\u03C3\u03BC\u03BF\u03AF BMI IBW ABW LBM \u03B9\u03B4\u03B1\u03BD\u03B9\u03BA\u03CC \u03B2\u03AC\u03C1\u03BF\u03C2" },
  { id: "mac", group: "calc", el: "MAC \u03C0\u03C4\u03B7\u03C4\u03B9\u03BA\u03CE\u03BD (\u03BA\u03B1\u03C4\u03AC \u03B7\u03BB\u03B9\u03BA\u03AF\u03B1)", en: "Volatile MAC (age-adjusted)", icon: "\u{1F4A8}", kw: "MAC \u03B5\u03BB\u03AC\u03C7\u03B9\u03C3\u03C4\u03B7 \u03BA\u03C5\u03C8\u03B5\u03BB\u03B9\u03B4\u03B9\u03BA\u03AE \u03C3\u03C5\u03B3\u03BA\u03AD\u03BD\u03C4\u03C1\u03C9\u03C3\u03B7 \u03C0\u03C4\u03B7\u03C4\u03B9\u03BA\u03AC volatile" },
  { id: "vaso", group: "calc", el: "\u0388\u03B3\u03C7\u03C5\u03C3\u03B7 \u03B1\u03B3\u03B3\u03B5\u03B9\u03BF\u03C3\u03C5\u03C3\u03C0\u03B1\u03C3\u03C4\u03B9\u03BA\u03CE\u03BD", en: "Vasopressor infusions", icon: "\u{1F489}", kw: "\u03B1\u03B3\u03B3\u03B5\u03B9\u03BF\u03C3\u03C5\u03C3\u03C0\u03B1\u03C3\u03C4\u03B9\u03BA\u03AC vasopressors \u03B9\u03BD\u03CC\u03C4\u03C1\u03BF\u03C0\u03B1 noradrenaline \u03AD\u03B3\u03C7\u03C5\u03C3\u03B7 infusion" },
  { id: "vent", group: "calc", el: "\u0391\u03B5\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2 & \u039C\u03B7\u03C7\u03B1\u03BD\u03B9\u03BA\u03AE \u03C0\u03BD\u03B5\u03CD\u03BC\u03BF\u03BD\u03B1", en: "Ventilation & Lung mechanics", icon: "\u{1FAC1}", kw: "\u03B1\u03B5\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2 ventilation PBW \u03B1\u03BD\u03B1\u03C0\u03BD\u03B5\u03CC\u03BC\u03B5\u03BD\u03BF\u03C2 \u03CC\u03B3\u03BA\u03BF\u03C2 tidal volume driving pressure Pplat PEEP compliance \u03B5\u03BD\u03B4\u03BF\u03C4\u03B9\u03BA\u03CC\u03C4\u03B7\u03C4\u03B1 ARDS A-a \u03BD\u03B5\u03BA\u03C1\u03CC\u03C2 \u03C7\u03CE\u03C1\u03BF\u03C2 dead space RSBI" },
  { id: "tof", group: "calc", el: "TOF / \u039D\u03B5\u03C5\u03C1\u03BF\u03BC\u03C5\u03CA\u03BA\u03CC\u03C2 \u03B1\u03C0\u03BF\u03BA\u03BB\u03B5\u03B9\u03C3\u03BC\u03CC\u03C2", en: "TOF / Neuromuscular block", icon: "\u26A1", kw: "TOF train of four \u03BD\u03B5\u03C5\u03C1\u03BF\u03BC\u03C5\u03CA\u03BA\u03CC\u03C2 \u03B1\u03C0\u03BF\u03BA\u03BB\u03B5\u03B9\u03C3\u03BC\u03CC\u03C2 neuromuscular block \u03B1\u03BD\u03B1\u03C3\u03C4\u03C1\u03BF\u03C6\u03AE reversal sugammadex \u03C3\u03BF\u03C5\u03B3\u03BA\u03B1\u03BC\u03B1\u03B4\u03AD\u03BE\u03B7 \u03BD\u03B5\u03BF\u03C3\u03C4\u03B9\u03B3\u03BC\u03AF\u03BD\u03B7 PTC TOFr" },
  { id: "opioid", group: "calc", el: "\u039C\u03B5\u03C4\u03B1\u03C4\u03C1\u03BF\u03C0\u03AE \u03BF\u03C0\u03B9\u03BF\u03B5\u03B9\u03B4\u03CE\u03BD", en: "Opioid conversion", icon: "\u{1F48A}", kw: "\u03BC\u03B5\u03C4\u03B1\u03C4\u03C1\u03BF\u03C0\u03AE \u03BF\u03C0\u03B9\u03BF\u03B5\u03B9\u03B4\u03CE\u03BD opioid conversion equianalgesic \u03B9\u03C3\u03BF\u03B1\u03BD\u03B1\u03BB\u03B3\u03B7\u03C3\u03AF\u03B1 OME morphine equivalent \u03C7\u03C1\u03CC\u03BD\u03B9\u03BF\u03C2 \u03C0\u03CC\u03BD\u03BF\u03C2 chronic pain patch \u03C7\u03C1\u03CC\u03BD\u03B9\u03BF\u03C2 \u03C0\u03CC\u03BD\u03BF\u03C2 \u03BF\u03BE\u03C5\u03BA\u03C9\u03B4\u03CC\u03BD\u03B7 \u03C5\u03B4\u03C1\u03BF\u03BC\u03BF\u03C1\u03C6\u03CC\u03BD\u03B7 \u03C4\u03C1\u03B1\u03BC\u03B1\u03B4\u03CC\u03BB\u03B7 \u03C4\u03B1\u03C0\u03B5\u03BD\u03C4\u03B1\u03B4\u03CC\u03BB\u03B7 \u03BA\u03C9\u03B4\u03B5\u0390\u03BD\u03B7 \u03BC\u03B5\u03B8\u03B1\u03B4\u03CC\u03BD\u03B7 \u03B2\u03BF\u03C5\u03C0\u03C1\u03B5\u03BD\u03BF\u03C1\u03C6\u03AF\u03BD\u03B7" },
  { id: "fluids", group: "calc", el: "\u03A5\u03B3\u03C1\u03AC & \u0391\u03AF\u03BC\u03B1 (\u03C0\u03B5\u03C1\u03B9\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC)", en: "Fluids & Blood (periop)", icon: "\u{1F4A7}", kw: "\u03C5\u03B3\u03C1\u03AC fluids maintenance 4-2-1 \u03CC\u03B3\u03BA\u03BF\u03C2 \u03B1\u03AF\u03BC\u03B1\u03C4\u03BF\u03C2 EBV \u03B5\u03C0\u03B9\u03C4\u03C1\u03B5\u03C0\u03CC\u03BC\u03B5\u03BD\u03B7 \u03B1\u03C0\u03CE\u03BB\u03B5\u03B9\u03B1 ABL \u03BC\u03B5\u03C4\u03AC\u03B3\u03B3\u03B9\u03C3\u03B7 transfusion" },
  { id: "csht", group: "calc", el: "Context-Sensitive Half-Time", en: "Context-Sensitive Half-Time", icon: "\u23F1", kw: "context sensitive half time \u03C7\u03C1\u03CC\u03BD\u03BF\u03C2 \u03B7\u03BC\u03B9\u03B6\u03C9\u03AE\u03C2 \u03B1\u03C6\u03CD\u03C0\u03BD\u03B9\u03C3\u03B7 emergence" },
  // Perioperative & reference
  { id: "periop", group: "reference", el: "\u03A0\u03B5\u03C1\u03B9\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AE \u03B9\u03B1\u03C4\u03C1\u03B9\u03BA\u03AE", en: "Perioperative medicine", icon: "\u{1FAC0}", kw: "\u03C0\u03B5\u03C1\u03B9\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC \u03C6\u03AC\u03C1\u03BC\u03B1\u03BA\u03B1 \u03B4\u03B9\u03B1\u03B2\u03AE\u03C4\u03B7\u03C2 diabetes GLP-1 SGLT2 \u03B9\u03BD\u03C3\u03BF\u03C5\u03BB\u03AF\u03BD\u03B7 \u03C3\u03C4\u03B5\u03C1\u03BF\u03B5\u03B9\u03B4\u03AE steroid bridging stent DAPT" },
  { id: "abx", group: "reference", el: "\u0391\u03BD\u03C4\u03B9\u03B2\u03B9\u03BF\u03C4\u03B9\u03BA\u03AE \u03C0\u03C1\u03BF\u03C6\u03CD\u03BB\u03B1\u03BE\u03B7", en: "Antibiotic prophylaxis", icon: "\u{1F9EB}", kw: "\u03B1\u03BD\u03C4\u03B9\u03B2\u03B9\u03BF\u03C4\u03B9\u03BA\u03AC antibiotics \u03C0\u03C1\u03BF\u03C6\u03CD\u03BB\u03B1\u03BE\u03B7 prophylaxis \u03BB\u03BF\u03AF\u03BC\u03C9\u03BE\u03B7" },
  { id: "guidelines", group: "reference", el: "\u039A\u03B1\u03C4\u03B5\u03C5\u03B8\u03C5\u03BD\u03C4\u03AE\u03C1\u03B9\u03B5\u03C2", en: "Guidelines", icon: "\u{1F4D6}", kw: "\u03BA\u03B1\u03C4\u03B5\u03C5\u03B8\u03C5\u03BD\u03C4\u03AE\u03C1\u03B9\u03B5\u03C2 \u03BF\u03B4\u03B7\u03B3\u03AF\u03B5\u03C2 guidelines PONV \u03BD\u03B7\u03C3\u03C4\u03B5\u03AF\u03B1 fasting \u03C0\u03B5\u03C1\u03B9\u03BF\u03C7\u03B9\u03BA\u03AE ASA 2026 \u03BD\u03B5\u03C5\u03C1\u03BF\u03BC\u03C5\u03CA\u03BA\u03CC\u03C2 NMB ESAIC" },
  { id: "refs", group: "reference", el: "\u03A0\u03B7\u03B3\u03AD\u03C2 & \u0392\u03B9\u03B2\u03BB\u03B9\u03BF\u03B3\u03C1\u03B1\u03C6\u03AF\u03B1", en: "Sources & References", icon: "\u{1F4DA}", kw: "\u03C0\u03B7\u03B3\u03AD\u03C2 references \u03B2\u03B9\u03B2\u03BB\u03B9\u03BF\u03B3\u03C1\u03B1\u03C6\u03AF\u03B1 sources" }
];

function ToolsTab({ lang, weight, age, height, sex, focus, onUse }) {
  const [open, setOpen] = useState("scores");
  // 26 tools in one scroll is a lot to skim, so groups collapse. The group
  // holding the currently open tool starts expanded; a local search or a
  // global-search jump expands whatever it needs to reveal.
  const groupOf = (id) => (TOOL_SECTIONS.find((s) => s.id === id) || {}).group;
  const [openGroups, setOpenGroups] = useState(() => {
    const g = groupOf("scores");
    return g ? [g] : [];
  });
  const toggleGroup = (id) =>
    setOpenGroups((gs) => gs.includes(id) ? gs.filter((x) => x !== id) : gs.concat(id));
  useEffect(() => {
    if (!focus) return;
    setOpen(focus.id);
    const g = groupOf(focus.id);
    if (g) setOpenGroups((gs) => gs.includes(g) ? gs : gs.concat(g));
  }, [focus]);
  // Bring the opened tool into view — groups expand above it and push it down.
  const focusRef = useRef(null);
  useEffect(() => {
    if (!focus || !focusRef.current) return;
    const el = focusRef.current;
    const t = setTimeout(() => {
      try { el.scrollIntoView({ block: "start", behavior: "smooth" }); }
      catch (e) { try { el.scrollIntoView(); } catch (e2) {} }
    }, 80);
    return () => clearTimeout(t);
  }, [focus, open, openGroups]);
  const patient = {
    w: parseFloat(weight) || 0,
    a: parseFloat(age) || 0,
    s: sex,
    bmi: bmiCalc(parseFloat(weight) || 0, parseFloat(height) || 0)
  };
  const sections = TOOL_SECTIONS;
  const GROUPS = [
    { id: "emergency", el: "\u0395\u03C0\u03B5\u03AF\u03B3\u03BF\u03BD\u03C4\u03B1 & \u039A\u03BB\u03AF\u03BC\u03B1\u03BA\u03B5\u03C2", en: "Emergencies & Scores" },
    { id: "subspecialty", el: "\u03A5\u03C0\u03BF\u03B5\u03B9\u03B4\u03B9\u03BA\u03CC\u03C4\u03B7\u03C4\u03B5\u03C2", en: "Subspecialties" },
    { id: "analgesia", el: "\u0391\u03BD\u03B1\u03BB\u03B3\u03B7\u03C3\u03AF\u03B1 & \u03A0\u03B5\u03C1\u03B9\u03BF\u03C7\u03B9\u03BA\u03AE", en: "Analgesia & Regional" },
    { id: "calc", el: "\u03A5\u03C0\u03BF\u03BB\u03BF\u03B3\u03B9\u03C3\u03C4\u03AD\u03C2 & \u03A6\u03B1\u03C1\u03BC\u03B1\u03BA\u03BF\u03BB\u03BF\u03B3\u03AF\u03B1", en: "Calculators & Pharmacology" },
    { id: "reference", el: "\u03A0\u03B5\u03C1\u03B9\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC & \u03A0\u03B7\u03B3\u03AD\u03C2", en: "Perioperative & Reference" }
  ];
  const [scoreOpen, setScoreOpen] = useState("apfel");
  const allScores = [...SCORES, ...MULTI_SCORES];
  const [q, setQ] = useState("");
  const [favs, setFavs] = useState(() => storeGet("aa_tool_favs") || []);
  const toggleFav = (id, e) => {
    e.stopPropagation();
    const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
    setFavs(next);
    storeSet("aa_tool_favs", next);
  };
  const query = q.trim().toLowerCase();
  const matches = (sec) => !query || sec.el.toLowerCase().includes(query) || sec.en.toLowerCase().includes(query);
  const favSections = sections.filter((s) => favs.includes(s.id));
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      value: q,
      onChange: (e) => setQ(e.target.value),
      placeholder: lang === "el" ? "\u{1F50D} \u0391\u03BD\u03B1\u03B6\u03AE\u03C4\u03B7\u03C3\u03B7 \u03B5\u03C1\u03B3\u03B1\u03BB\u03B5\u03AF\u03BF\u03C5\u2026" : "\u{1F50D} Search tools\u2026",
      style: { ...inputStyle, fontSize: 14.5, padding: "11px 36px 11px 13px" }
    }
  ), q && /* @__PURE__ */ React.createElement("button", { onClick: () => setQ(""), style: { position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", color: S.muted, fontWeight: 600, fontSize: 18, cursor: "pointer", fontFamily: "inherit" } }, "\xD7")), !query && favSections.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 12, color: S.muted, letterSpacing: 0.6, textTransform: "uppercase", padding: "4px 4px 0" } }, "\u2B50 ", lang === "el" ? "\u0391\u03B3\u03B1\u03C0\u03B7\u03BC\u03AD\u03BD\u03B1" : "Favourites"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, favSections.map((sec) => /* @__PURE__ */ React.createElement("button", { key: "fav-" + sec.id, onClick: () => { setOpen(sec.id); if (onUse) onUse(sec); const g = groupOf(sec.id); if (g) setOpenGroups((gs) => gs.includes(g) ? gs : gs.concat(g)); }, style: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    borderRadius: 10,
    border: `1.5px solid ${open === sec.id ? S.teal : S.line}`,
    background: S.card,
    fontSize: 13,
    fontWeight: 700,
    color: S.ink,
    cursor: "pointer",
    fontFamily: "inherit"
  } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15 } }, sec.icon), sec[lang])))), GROUPS.map((grp) => {
    const groupSecs = sections.filter((s) => s.group === grp.id && matches(s));
    if (groupSecs.length === 0) return null;
    return /* @__PURE__ */ React.createElement("div", { key: grp.id, style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => toggleGroup(grp.id), style: { display: "flex", alignItems: "center", gap: 8, width: "100%", background: "none", border: "none", padding: "8px 4px 2px", cursor: "pointer", fontFamily: "inherit", textAlign: "left" } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 800, fontSize: 12, color: S.muted, letterSpacing: 0.6, textTransform: "uppercase" } }, grp[lang]), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: S.muted, background: S.bg, borderRadius: 20, padding: "1px 7px" } }, groupSecs.length), /* @__PURE__ */ React.createElement("span", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement("span", { style: { color: S.muted, fontWeight: 700, fontSize: 16, transform: (query || openGroups.includes(grp.id)) ? "rotate(90deg)" : "none", transition: "transform .15s" } }, "\u203A")), (query || openGroups.includes(grp.id)) && groupSecs.map((sec) => {
      const isOpen = open === sec.id;
      const isFav = favs.includes(sec.id);
      return /* @__PURE__ */ React.createElement("div", { key: sec.id, ref: focus && focus.id === sec.id ? focusRef : null, style: { background: S.card, borderRadius: 14, border: `1.5px solid ${isOpen ? S.teal : S.line}`, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => { const next = isOpen ? null : sec.id; setOpen(next); if (next && onUse) onUse(sec); }, style: {
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
      } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 17 } }, sec.icon), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700, fontSize: 15.5, color: S.ink, flex: 1 } }, sec[lang]), /* @__PURE__ */ React.createElement("span", { onClick: (e) => toggleFav(sec.id, e), style: { fontSize: 17, cursor: "pointer", color: isFav ? S.amber : S.line } }, "\u2605"), /* @__PURE__ */ React.createElement("span", { style: { color: S.muted, fontWeight: 600, fontSize: 18, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .15s" } }, "\u203A")), isOpen && /* @__PURE__ */ React.createElement("div", { style: { padding: "0 14px 14px" } }, sec.id === "scores" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 5, flexWrap: "wrap" } }, allScores.map((sc) => /* @__PURE__ */ React.createElement("button", { key: sc.id, onClick: () => setScoreOpen(sc.id), style: {
        flex: "1 1 28%",
        padding: "7px 4px",
        borderRadius: 9,
        border: "none",
        fontSize: 11.5,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "inherit",
        background: scoreOpen === sc.id ? S.ink : S.bg,
        color: scoreOpen === sc.id ? S.card : S.muted
      } }, sc.name))), SCORES.filter((sc) => sc.id === scoreOpen).map((sc) => /* @__PURE__ */ React.createElement(ScoreCard, { key: `${sc.id}-${weight}-${age}-${sex}-${height}`, sc, lang, patient })), MULTI_SCORES.filter((sc) => sc.id === scoreOpen).map((sc) => /* @__PURE__ */ React.createElement(MultiScoreCard, { key: sc.id, sc, lang }))), sec.id === "guidelines" && /* @__PURE__ */ React.createElement(GuidelinesList, { lang }), sec.id === "crisis" && /* @__PURE__ */ React.createElement(CrisisCard, { lang, weight }), sec.id === "periop" && /* @__PURE__ */ React.createElement(PeriopMedCard, { lang }), sec.id === "quickcalc" && /* @__PURE__ */ React.createElement(QuickCalcCard, { lang, weight }), sec.id === "mac" && /* @__PURE__ */ React.createElement(MACCard, { lang, age }), sec.id === "postop" && /* @__PURE__ */ React.createElement(PostopAnalgesiaCard, { lang, weight }), sec.id === "neuraxial" && /* @__PURE__ */ React.createElement(NeuraxialCard, { lang, weight }), sec.id === "rotem" && /* @__PURE__ */ React.createElement(ROTEMCard, { lang, weight }), sec.id === "cardiac" && /* @__PURE__ */ React.createElement(CardiacCard, { lang, weight }), sec.id === "obstetric" && /* @__PURE__ */ React.createElement(ObstetricCard, { lang, weight }), sec.id === "thoracic" && /* @__PURE__ */ React.createElement(ThoracicCard, { lang, weight }), sec.id === "refs" && /* @__PURE__ */ React.createElement(ReferencesCard, { lang }), sec.id === "vent" && /* @__PURE__ */ React.createElement(VentilationCalc, { lang, height, sex }), sec.id === "tof" && /* @__PURE__ */ React.createElement(TOFCard, { lang, weight }), sec.id === "opioid" && /* @__PURE__ */ React.createElement(OpioidConvertCard, { lang }), sec.id === "bariatric" && /* @__PURE__ */ React.createElement(BariatricCard, { lang, weight, height, sex }), sec.id === "vaso" && /* @__PURE__ */ React.createElement(VasopressorCalc, { lang, weight }), sec.id === "anticoag" && /* @__PURE__ */ React.createElement(AnticoagList, { lang }), sec.id === "fluids" && /* @__PURE__ */ React.createElement(FluidsCalc, { lang, weight, age, sex }), sec.id === "abx" && /* @__PURE__ */ React.createElement(AbxList, { lang, weight }), sec.id === "la" && /* @__PURE__ */ React.createElement(LACalc, { lang, weight }), sec.id === "csht" && /* @__PURE__ */ React.createElement(CSHTCalc, { lang }), sec.id === "neuro" && /* @__PURE__ */ React.createElement(NeuroCard, { lang, weight }), sec.id === "vascular" && /* @__PURE__ */ React.createElement(VascularCard, { lang, weight }), sec.id === "tci" && /* @__PURE__ */ React.createElement(TCITab, { lang, weight, age, height, sex })));
    }));
  }));
}
function AnesthesiaAssistant() {
  useEffect(() => {
    if (document.getElementById("commissioner-font")) return;
    const l = document.createElement("link");
    l.id = "commissioner-font";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Commissioner:wght@400;600;700;800&display=swap&subset=greek,latin";
    document.head.appendChild(l);
  }, []);
  const [lang, setLang] = useState(() => storeGet("aa_lang") || "el");
  // "auto" follows the phone; the other two are explicit overrides. Theatres
  // are often dim, and a white screen at 3am ruins dark adaptation.
  const [theme, setTheme] = useState(() => storeGet("aa_theme") || "auto");
  const [sysDark, setSysDark] = useState(() => {
    try { return window.matchMedia("(prefers-color-scheme: dark)").matches; }
    catch (e) { return false; }
  });
  useEffect(() => {
    let mq;
    try { mq = window.matchMedia("(prefers-color-scheme: dark)"); } catch (e) { return; }
    const onChange = (e) => setSysDark(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else if (mq.removeListener) mq.removeListener(onChange);
    };
  }, []);
  const effectiveTheme = theme === "auto" ? (sysDark ? "dark" : "light") : theme;
  // Applied during render, before any child reads S.
  applyTheme(effectiveTheme);
  useEffect(() => {
    storeSet("aa_theme", theme);
    try {
      document.body.style.background = S.bg;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", S.bg);
    } catch (e) {}
  }, [theme, effectiveTheme]);
  const cycleTheme = () => setTheme(theme === "auto" ? "light" : theme === "light" ? "dark" : "auto");
  const themeIcon = theme === "auto" ? "\u25D0" : theme === "light" ? "\u2600\uFE0F" : "\u{1F319}";
  const themeLabel = theme === "auto"
    ? (lang === "el" ? "\u0398\u03AD\u03BC\u03B1: \u03B1\u03C5\u03C4\u03CC\u03BC\u03B1\u03C4\u03BF" : "Theme: auto")
    : theme === "light" ? (lang === "el" ? "\u0398\u03AD\u03BC\u03B1: \u03C6\u03C9\u03C4\u03B5\u03B9\u03BD\u03CC" : "Theme: light")
    : (lang === "el" ? "\u0398\u03AD\u03BC\u03B1: \u03C3\u03BA\u03BF\u03C4\u03B5\u03B9\u03BD\u03CC" : "Theme: dark");
  const [tab, setTab] = useState("meds");
  // Global search: `gq` is the query, `focus` tells the destination tab which
  // item to open. The nonce makes repeat picks of the same item re-fire.
  const [gq, setGq] = useState("");
  const [focus, setFocus] = useState(null);
  // Recently used: favourites have to be curated up front, which is no help
  // the first time you need something. This just remembers the last few.
  const [recents, setRecents] = useState(() => storeGet("aa_recent") || []);
  const remember = (entry) => setRecents((rs) => {
    const next = [entry].concat(rs.filter((r) => !(r.tab === entry.tab && r.target === entry.target))).slice(0, 6);
    storeSet("aa_recent", next);
    return next;
  });
  const jumpTo = (r) => {
    setTab(r.tab);
    setFocus({ id: r.target, n: Date.now() });
    setGq("");
    remember(r);
  };
  const pickResult = (it) => {
    jumpTo({ tab: it.tab, target: it.target, title: it.title, kind: it.kind });
  };
  const [accepted, setAccepted] = useState(() => storeGet("aa_disclaimer_ok") === true);
  const [weight, setWeight] = useState(() => (storeGet("aa_patient") || {}).w || "");
  const [age, setAge] = useState(() => (storeGet("aa_patient") || {}).a || "");
  const [height, setHeight] = useState(() => (storeGet("aa_patient") || {}).h || "");
  const [sex, setSex] = useState(() => (storeGet("aa_patient") || {}).s || "M");
  useEffect(() => {
    if (weight || age || height) {
      storeSet("aa_patient", { w: weight, a: age, h: height, s: sex }, PATIENT_TTL);
    } else {
      storeDel("aa_patient");
    }
  }, [weight, age, height, sex]);
  useEffect(() => {
    storeSet("aa_lang", lang);
  }, [lang]);
  const t = T[lang];
  const tabs = [
    { id: "meds", icon: "\u{1F48A}" },
    { id: "tools", icon: "\u{1F9EE}" },
    { id: "peds", icon: "\u{1F9D2}" },
    { id: "lists", icon: "\u{1F6A8}" }
  ];
  if (!accepted) {
    return /* @__PURE__ */ React.createElement("div", { style: {
      fontFamily: "'Commissioner', 'Segoe UI', system-ui, -apple-system, sans-serif",
      background: S.bg,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 20px",
      maxWidth: 560,
      margin: "0 auto"
    } }, /* @__PURE__ */ React.createElement("img", { src: LOGO_DATA, alt: "", style: { width: 84, height: 84, borderRadius: 20, marginBottom: 16 } }), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 900, fontSize: 20, color: S.ink, textAlign: "center", marginBottom: 4 } }, "Morfeas"), /* @__PURE__ */ React.createElement("div", { style: { background: S.card, borderRadius: 16, padding: "18px 18px", border: `1.5px solid ${S.line}`, marginTop: 16, boxShadow: "0 2px 10px rgba(20,37,63,.06)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 15, color: S.red, marginBottom: 8 } }, lang === "el" ? "\u26A0 \u03A3\u03B7\u03BC\u03B1\u03BD\u03C4\u03B9\u03BA\u03AE \u03C0\u03C1\u03BF\u03B5\u03B9\u03B4\u03BF\u03C0\u03BF\u03AF\u03B7\u03C3\u03B7" : "\u26A0 Important notice"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: S.ink, lineHeight: 1.6 } }, lang === "el" ? /* @__PURE__ */ React.createElement(React.Fragment, null, "\u03A4\u03BF \u03B5\u03C1\u03B3\u03B1\u03BB\u03B5\u03AF\u03BF \u03B1\u03C5\u03C4\u03CC \u03C0\u03C1\u03BF\u03BF\u03C1\u03AF\u03B6\u03B5\u03C4\u03B1\u03B9 ", /* @__PURE__ */ React.createElement("strong", null, "\u03B1\u03C0\u03BF\u03BA\u03BB\u03B5\u03B9\u03C3\u03C4\u03B9\u03BA\u03AC \u03B3\u03B9\u03B1 \u03B5\u03BE\u03B5\u03B9\u03B4\u03B9\u03BA\u03B5\u03C5\u03BC\u03AD\u03BD\u03BF\u03C5\u03C2 \u03B5\u03C0\u03B1\u03B3\u03B3\u03B5\u03BB\u03BC\u03B1\u03C4\u03AF\u03B5\u03C2 \u03C5\u03B3\u03B5\u03AF\u03B1\u03C2"), " \u03C9\u03C2 \u03B2\u03BF\u03AE\u03B8\u03B7\u03BC\u03B1 \u03C5\u03C0\u03BF\u03C3\u03C4\u03AE\u03C1\u03B9\u03BE\u03B7\u03C2 \u03B1\u03C0\u03CC\u03C6\u03B1\u03C3\u03B7\u03C2 \u03BA\u03B1\u03B9 \u03B5\u03BA\u03C0\u03B1\u03AF\u03B4\u03B5\u03C5\u03C3\u03B7\u03C2.", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("strong", null, "\u0394\u03B5\u03BD \u03C5\u03C0\u03BF\u03BA\u03B1\u03B8\u03B9\u03C3\u03C4\u03AC \u03C4\u03B7\u03BD \u03BA\u03BB\u03B9\u03BD\u03B9\u03BA\u03AE \u03BA\u03C1\u03AF\u03C3\u03B7."), " \u038C\u03BB\u03B5\u03C2 \u03BF\u03B9 \u03B4\u03CC\u03C3\u03B5\u03B9\u03C2, \u03BF\u03B9 \u03C5\u03C0\u03BF\u03BB\u03BF\u03B3\u03B9\u03C3\u03BC\u03BF\u03AF \u03BA\u03B1\u03B9 \u03BF\u03B9 \u03C0\u03C1\u03BF\u03C4\u03AC\u03C3\u03B5\u03B9\u03C2 \u03C0\u03C1\u03AD\u03C0\u03B5\u03B9 \u03BD\u03B1 ", /* @__PURE__ */ React.createElement("strong", null, "\u03B5\u03C0\u03B1\u03BB\u03B7\u03B8\u03B5\u03CD\u03BF\u03BD\u03C4\u03B1\u03B9 \u03B1\u03BD\u03B5\u03BE\u03AC\u03C1\u03C4\u03B7\u03C4\u03B1"), " \u03BC\u03B5 \u03AD\u03B3\u03BA\u03C5\u03C1\u03B5\u03C2 \u03C0\u03B7\u03B3\u03AD\u03C2 \u03BA\u03B1\u03B9 \u03C4\u03B1 \u03C4\u03BF\u03C0\u03B9\u03BA\u03AC \u03C0\u03C1\u03C9\u03C4\u03CC\u03BA\u03BF\u03BB\u03BB\u03B1 \u03C0\u03C1\u03B9\u03BD \u03B1\u03C0\u03CC \u03BA\u03AC\u03B8\u03B5 \u03B5\u03C6\u03B1\u03C1\u03BC\u03BF\u03B3\u03AE \u03C3\u03B5 \u03B1\u03C3\u03B8\u03B5\u03BD\u03AE.", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("br", null), "\u039F \u03B4\u03B7\u03BC\u03B9\u03BF\u03C5\u03C1\u03B3\u03CC\u03C2 \u03B4\u03B5\u03BD \u03C6\u03AD\u03C1\u03B5\u03B9 \u03B5\u03C5\u03B8\u03CD\u03BD\u03B7 \u03B3\u03B9\u03B1 \u03BF\u03C0\u03BF\u03B9\u03B1\u03B4\u03AE\u03C0\u03BF\u03C4\u03B5 \u03B2\u03BB\u03AC\u03B2\u03B7 \u03C0\u03C1\u03BF\u03BA\u03CD\u03C8\u03B5\u03B9 \u03B1\u03C0\u03CC \u03C4\u03B7 \u03C7\u03C1\u03AE\u03C3\u03B7 \u03C4\u03BF\u03C5. \u0397 \u03B5\u03C5\u03B8\u03CD\u03BD\u03B7 \u03BA\u03AC\u03B8\u03B5 \u03BA\u03BB\u03B9\u03BD\u03B9\u03BA\u03AE\u03C2 \u03B1\u03C0\u03CC\u03C6\u03B1\u03C3\u03B7\u03C2 \u03C0\u03B1\u03C1\u03B1\u03BC\u03AD\u03BD\u03B5\u03B9 \u03C3\u03C4\u03BF\u03BD \u03B8\u03B5\u03C1\u03AC\u03C0\u03BF\u03BD\u03C4\u03B1 \u03B9\u03B1\u03C4\u03C1\u03CC.", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: S.muted, fontWeight: 600, fontSize: 12 } }, "\u039C\u03B7\u03BD \u03B5\u03B9\u03C3\u03AC\u03B3\u03B5\u03C4\u03B5 \u03B1\u03BD\u03B1\u03B3\u03BD\u03C9\u03C1\u03AF\u03C3\u03B9\u03BC\u03B1 \u03C3\u03C4\u03BF\u03B9\u03C7\u03B5\u03AF\u03B1 \u03B1\u03C3\u03B8\u03B5\u03BD\u03CE\u03BD (\u03BF\u03BD\u03CC\u03BC\u03B1\u03C4\u03B1, \u0391\u039C\u039A\u0391).")) : /* @__PURE__ */ React.createElement(React.Fragment, null, "This tool is intended ", /* @__PURE__ */ React.createElement("strong", null, "solely for qualified healthcare professionals"), " as a decision-support and educational aid.", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("strong", null, "It does not replace clinical judgement."), " All doses, calculations and suggestions must be ", /* @__PURE__ */ React.createElement("strong", null, "independently verified"), " against authoritative sources and local protocols before any application to a patient.", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("br", null), "The author accepts no liability for any harm arising from its use. Responsibility for every clinical decision remains with the treating clinician.", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: S.muted, fontWeight: 600, fontSize: 12 } }, "Do not enter identifiable patient data (names, IDs)."))), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setAccepted(true);
          storeSet("aa_disclaimer_ok", true);
        },
        style: {
          width: "100%",
          marginTop: 16,
          padding: "13px",
          borderRadius: 12,
          border: "none",
          background: S.teal,
          color: S.onAccent,
          fontWeight: 800,
          fontSize: 15,
          cursor: "pointer",
          fontFamily: "inherit"
        }
      },
      lang === "el" ? "\u039A\u03B1\u03C4\u03B1\u03BD\u03BF\u03CE & \u0391\u03C0\u03BF\u03B4\u03AD\u03C7\u03BF\u03BC\u03B1\u03B9" : "I understand & accept"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setLang(lang === "el" ? "en" : "el"),
        style: {
          width: "100%",
          marginTop: 8,
          padding: "8px",
          borderRadius: 10,
          border: "none",
          background: "transparent",
          color: S.muted,
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
          fontFamily: "inherit"
        }
      },
      lang === "el" ? "English" : "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC"
    )));
  }
  return /* @__PURE__ */ React.createElement("div", { style: {
    fontFamily: "'Commissioner', 'Segoe UI', system-ui, -apple-system, sans-serif",
    background: S.bg,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    maxWidth: 560,
    margin: "0 auto"
  } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 16px 10px", display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 9 } }, /* @__PURE__ */ React.createElement("img", { src: LOGO_DATA, alt: "", style: { width: 30, height: 30, borderRadius: 8, flexShrink: 0, boxShadow: "0 1px 4px rgba(20,37,63,.15)" } }), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 900, fontSize: 16.5, color: S.ink, letterSpacing: -0.3, lineHeight: 1.2 } }, "Morfeas")), /* @__PURE__ */ React.createElement("button", { onClick: () => setLang(lang === "el" ? "en" : "el"), style: {
    padding: "5px 12px",
    borderRadius: 99,
    border: `1.5px solid ${S.line}`,
    background: S.card,
    fontWeight: 700,
    fontSize: 13,
    color: S.teal,
    cursor: "pointer",
    fontFamily: "inherit"
  } }, lang === "el" ? "EN" : "\u0395\u039B"), /* @__PURE__ */ React.createElement("button", { onClick: cycleTheme, title: themeLabel, "aria-label": themeLabel, style: { padding: "6px 10px", borderRadius: 10, border: `1.5px solid ${S.line}`, background: S.card, fontWeight: 700, fontSize: 13, color: S.teal, cursor: "pointer", fontFamily: "inherit", marginLeft: 6 } }, themeIcon)), /* @__PURE__ */ React.createElement(PatientBar, { lang, weight, setWeight, age, setAge, height, setHeight, sex, setSex })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, padding: "4px 16px 16px", overflowY: "auto" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, background: S.card, border: `1.5px solid ${gq ? S.teal : S.line}`, borderRadius: 12, padding: "0 10px", marginBottom: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, opacity: 0.55 } }, "\u{1F50D}"), /* @__PURE__ */ React.createElement("input", { value: gq, onChange: (e) => setGq(e.target.value), placeholder: lang === "el" ? "\u0391\u03BD\u03B1\u03B6\u03AE\u03C4\u03B7\u03C3\u03B7 \u03C6\u03B1\u03C1\u03BC\u03AC\u03BA\u03C9\u03BD, \u03B5\u03C0\u03B5\u03B9\u03B3\u03CC\u03BD\u03C4\u03C9\u03BD, \u03B5\u03C1\u03B3\u03B1\u03BB\u03B5\u03AF\u03C9\u03BD\u2026" : "Search drugs, emergencies, tools\u2026", style: { flex: 1, border: "none", outline: "none", background: "transparent", padding: "11px 0", fontSize: 14.5, fontFamily: "inherit", color: S.ink, minWidth: 0 } }), gq && /* @__PURE__ */ React.createElement("button", { onClick: () => setGq(""), "aria-label": lang === "el" ? "\u039A\u03B1\u03B8\u03B1\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2 \u03B1\u03BD\u03B1\u03B6\u03AE\u03C4\u03B7\u03C3\u03B7\u03C2" : "Clear search", style: { border: "none", background: "none", color: S.muted, fontWeight: 700, fontSize: 18, cursor: "pointer", fontFamily: "inherit", padding: "0 2px" } }, "\xD7")), recents.length > 0 && gq.trim().length < 2 && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: S.muted, padding: "0 2px 5px" } }, "\u{1F551} " + (lang === "el" ? "\u03A0\u03C1\u03CC\u03C3\u03C6\u03B1\u03C4\u03B1" : "Recent")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 } }, recents.map((r, i) => /* @__PURE__ */ React.createElement("button", { key: r.tab + r.target + i, onClick: () => jumpTo(r), style: { flexShrink: 0, maxWidth: 190, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", background: S.card, border: `1.5px solid ${S.line}`, borderRadius: 20, padding: "6px 12px", fontSize: 12.5, fontWeight: 700, color: S.ink, cursor: "pointer", fontFamily: "inherit" } }, r.title)))), gq.trim().length >= 2 ? /* @__PURE__ */ React.createElement(SearchResults, { lang, query: gq, onPick: pickResult }) : /* @__PURE__ */ React.createElement(React.Fragment, null, tab === "meds" && /* @__PURE__ */ React.createElement(MedsTab, { lang, weight, focus }), tab === "tools" && /* @__PURE__ */ React.createElement(ToolsTab, { lang, weight, age, height, sex, focus, onUse: (sec) => remember({ tab: "tools", target: sec.id, title: sec[lang], kind: "tool" }) }), tab === "peds" && /* @__PURE__ */ React.createElement(PedsCard, { lang, weight, age }), tab === "lists" && /* @__PURE__ */ React.createElement(ChecklistTab, { lang, focus }))), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 16px 8px", fontSize: 11, color: S.muted, fontWeight: 600, lineHeight: 1.4, textAlign: "center" } }, t.disclaimer), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 16px 8px", fontSize: 10, color: S.muted, fontWeight: 600, lineHeight: 1.5, textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700 } }, lang === "el" ? "\u0394\u03B7\u03BC\u03B9\u03BF\u03C5\u03C1\u03B3\u03AF\u03B1: Efstathia Pistioli, MD" : "Created by Efstathia Pistioli, MD"), /* @__PURE__ */ React.createElement("br", null), "\xA9 ", (/* @__PURE__ */ new Date()).getFullYear(), " Efstathia Pistioli, MD. ", lang === "el" ? "\u039C\u03B5 \u03B5\u03C0\u03B9\u03C6\u03CD\u03BB\u03B1\u03BE\u03B7 \u03C0\u03B1\u03BD\u03C4\u03CC\u03C2 \u03B4\u03B9\u03BA\u03B1\u03B9\u03CE\u03BC\u03B1\u03C4\u03BF\u03C2." : "All rights reserved."), /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    borderTop: `1.5px solid ${S.line}`,
    background: S.card,
    position: "sticky",
    bottom: 0
  } }, tabs.map((tb) => /* @__PURE__ */ React.createElement("button", { key: tb.id, onClick: () => setTab(tb.id), style: {
    flex: 1,
    padding: "8px 1px 10px",
    border: "none",
    background: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    fontFamily: "inherit",
    minWidth: 0,
    borderTop: tab === tb.id ? `2.5px solid ${S.teal}` : "2.5px solid transparent"
  } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 18 } }, tb.icon), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: tab === tb.id ? S.teal : S.muted, whiteSpace: "nowrap" } }, t.tabs[tb.id])))));
}

// Catches render/runtime errors anywhere in the tree below it so a bug in one
// tab (e.g. a bad calculator input) can't blank the whole app. Shows a
// friendly bilingual message with a reset button instead of a white screen.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("AnesthesiaAssistant crashed:", error, info);
  }
  handleReset() {
    this.setState({ hasError: false, error: null });
  }
  handleReload() {
    window.location.reload();
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    const lang = storeGet("aa_lang") || "el";
    const el = lang === "el";
    return /* @__PURE__ */ React.createElement("div", { style: {
      fontFamily: "'Commissioner', 'Segoe UI', system-ui, -apple-system, sans-serif",
      background: S.bg,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 20px",
      textAlign: "center",
      maxWidth: 560,
      margin: "0 auto",
      boxSizing: "border-box"
    } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 40, marginBottom: 10 } }, "\u26A0\uFE0F"), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 17, color: S.ink, marginBottom: 8 } }, el ? "\u039A\u03AC\u03C4\u03B9 \u03C0\u03AE\u03B3\u03B5 \u03C3\u03C4\u03C1\u03B1\u03B2\u03AC" : "Something went wrong"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: S.muted, fontWeight: 600, lineHeight: 1.6, marginBottom: 18 } }, el ? "\u03A0\u03B1\u03C1\u03BF\u03C5\u03C3\u03B9\u03AC\u03C3\u03C4\u03B7\u03BA\u03B5 \u03C3\u03C6\u03AC\u03BB\u03BC\u03B1 \u03C3\u03B5 \u03B1\u03C5\u03C4\u03AE \u03C4\u03B7\u03BD \u03BF\u03B8\u03CC\u03BD\u03B7. \u03A4\u03B1 \u03B4\u03B5\u03B4\u03BF\u03BC\u03AD\u03BD\u03B1 \u03B1\u03C3\u03B8\u03B5\u03BD\u03BF\u03CD\u03C2 \u03BA\u03B1\u03B9 \u03BF\u03B9 \u03C1\u03C5\u03B8\u03BC\u03AF\u03C3\u03B5\u03B9\u03C2 \u03C3\u03B1\u03C2 \u03B4\u03B5\u03BD \u03C7\u03AC\u03B8\u03B7\u03BA\u03B1\u03BD." : "This screen ran into an error. Your patient data and settings were not lost."), this.state.error && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: S.muted, fontWeight: 600, background: S.card, border: `1px solid ${S.line}`, borderRadius: 10, padding: "8px 10px", marginBottom: 16, maxWidth: "100%", overflowWrap: "break-word", fontFamily: "monospace" } }, String(this.state.error && this.state.error.message || this.state.error)), /* @__PURE__ */ React.createElement("button", { onClick: () => this.handleReset(), style: { width: "100%", padding: "13px", borderRadius: 12, border: "none", background: S.teal, color: S.onAccent, fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", marginBottom: 8 } }, el ? "\u0394\u03BF\u03BA\u03B9\u03BC\u03AE \u03BE\u03B1\u03BD\u03AC" : "Try again"), /* @__PURE__ */ React.createElement("button", { onClick: () => this.handleReload(), style: { width: "100%", padding: "11px", borderRadius: 12, border: `1.5px solid ${S.line}`, background: S.card, color: S.ink, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" } }, el ? "\u03A0\u03BB\u03AE\u03C1\u03B7\u03C2 \u03B1\u03BD\u03B1\u03BD\u03AD\u03C9\u03C3\u03B7 \u03B5\u03C6\u03B1\u03C1\u03BC\u03BF\u03B3\u03AE\u03C2" : "Reload the app"));
  }
}
