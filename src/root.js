// Hoisted so the global search can index every tool without instantiating
// ToolsTab. ToolsTab reads the same array.
const TOOL_SECTIONS = [
  // Emergencies & scores
  { id: "crisis", group: "emergency", el: "\u039A\u03C1\u03AF\u03C3\u03B5\u03B9\u03C2 \u2014 \u0391\u03BB\u03B3\u03CC\u03C1\u03B9\u03B8\u03BC\u03BF\u03B9", en: "Crises \u2014 Algorithms", icon: "\u{1F6A8}", kw: "MH \u03BA\u03B1\u03BA\u03BF\u03AE\u03B8\u03B7\u03C2 \u03C5\u03C0\u03B5\u03C1\u03B8\u03B5\u03C1\u03BC\u03AF\u03B1 malignant hyperthermia LAST \u03B1\u03BD\u03B1\u03C6\u03C5\u03BB\u03B1\u03BE\u03AF\u03B1 anaphylaxis \u03B1\u03BB\u03B3\u03CC\u03C1\u03B9\u03B8\u03BC\u03BF\u03B9" },
  { id: "airwaysizes", group: "emergency", el: "\u0391\u03B5\u03C1\u03B1\u03B3\u03C9\u03B3\u03CC\u03C2 \u2014 \u03B5\u03BA\u03C4\u03AF\u03BC\u03B7\u03C3\u03B7 & \u03BC\u03B5\u03B3\u03AD\u03B8\u03B7", en: "Airway \u2014 assessment & sizes", icon: "\u{1F62E}", kw: "\u03B1\u03B5\u03C1\u03B1\u03B3\u03C9\u03B3\u03CC\u03C2 airway \u03BB\u03B1\u03C1\u03C5\u03B3\u03B3\u03B9\u03BA\u03AE \u03BC\u03AC\u03C3\u03BA\u03B1 LMA \u03BC\u03B5\u03B3\u03AD\u03B8\u03B7 sizes cuff Guedel \u03C3\u03C4\u03BF\u03BC\u03B1\u03C4\u03BF\u03C6\u03B1\u03C1\u03C5\u03B3\u03B3\u03B9\u03BA\u03CC\u03C2 oropharyngeal \u03C1\u03B9\u03BD\u03BF\u03C6\u03B1\u03C1\u03C5\u03B3\u03B3\u03B9\u03BA\u03CC\u03C2 nasopharyngeal NPA \u03C6\u03BF\u03CD\u03C3\u03BA\u03C9\u03BC\u03B1 Mallampati \u039C\u03B1\u03BB\u03BB\u03B1\u03BC\u03C0\u03AC\u03C4\u03B9 Cormack Lehane \u03BB\u03B1\u03C1\u03C5\u03B3\u03B3\u03BF\u03C3\u03BA\u03CC\u03C0\u03B7\u03C3\u03B7 \u03B5\u03BA\u03C4\u03AF\u03BC\u03B7\u03C3\u03B7 \u03B1\u03B5\u03C1\u03B1\u03B3\u03C9\u03B3\u03BF\u03CD" },
  { id: "scores", group: "emergency", el: "\u039A\u03BB\u03AF\u03BC\u03B1\u03BA\u03B5\u03C2 \u03BA\u03B9\u03BD\u03B4\u03CD\u03BD\u03BF\u03C5", en: "Risk scores", icon: "\u{1F4CA}", kw: "Apfel PONV STOP-BANG OSA RCRI ARISCAT \u03C0\u03BD\u03B5\u03C5\u03BC\u03BF\u03BD\u03B9\u03BA\u03AD\u03C2 \u03B5\u03C0\u03B9\u03C0\u03BB\u03BF\u03BA\u03AD\u03C2 CFS frailty \u03B5\u03C5\u03B8\u03C1\u03B1\u03C5\u03C3\u03C4\u03CC\u03C4\u03B7\u03C4\u03B1 \u03BA\u03AF\u03BD\u03B4\u03C5\u03BD\u03BF\u03C2" },
  { id: "gcs", group: "emergency", el: "Glasgow Coma Scale (GCS / GCS-P)", en: "Glasgow Coma Scale (GCS / GCS-P)", icon: "\u{1F9E0}", kw: "Glasgow GCS GCS-P \u03BA\u03BB\u03AF\u03BC\u03B1\u03BA\u03B1 \u03BA\u03CE\u03BC\u03B1\u03C4\u03BF\u03C2 \u03B5\u03C0\u03AF\u03C0\u03B5\u03B4\u03BF \u03C3\u03C5\u03BD\u03B5\u03AF\u03B4\u03B7\u03C3\u03B7\u03C2 \u03BA\u03CC\u03C1\u03B5\u03C2 pupils coma" },
  { id: "asaps", group: "emergency", el: "ASA \u2014 \u03C6\u03C5\u03C3\u03B9\u03BA\u03AE \u03BA\u03B1\u03C4\u03AC\u03C3\u03C4\u03B1\u03C3\u03B7", en: "ASA physical status", icon: "\u{1F3F7}\uFE0F", kw: "ASA physical status \u03C4\u03B1\u03BE\u03B9\u03BD\u03CC\u03BC\u03B7\u03C3\u03B7 \u03C6\u03C5\u03C3\u03B9\u03BA\u03AE \u03BA\u03B1\u03C4\u03AC\u03C3\u03C4\u03B1\u03C3\u03B7 \u03B5\u03C0\u03B5\u03AF\u03B3\u03BF\u03C5\u03C3\u03B1 emergency \u03C0\u03C1\u03BF\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AE \u03B5\u03BA\u03C4\u03AF\u03BC\u03B7\u03C3\u03B7" },
  { id: "rotem", group: "emergency", el: "ROTEM / TEG (\u03B5\u03C1\u03BC\u03B7\u03BD\u03B5\u03AF\u03B1)", en: "ROTEM / TEG (interpretation)", icon: "\u{1FA78}", kw: "ROTEM TEG \u03B8\u03C1\u03BF\u03BC\u03B2\u03BF\u03B5\u03BB\u03B1\u03C3\u03C4\u03BF\u03B3\u03C1\u03B1\u03C6\u03AF\u03B1 EXTEM FIBTEM \u03C0\u03AE\u03BE\u03B7 coagulation \u03B1\u03B9\u03BC\u03BF\u03C1\u03C1\u03B1\u03B3\u03AF\u03B1" },
  // Subspecialties
  { id: "cardiac", group: "subspecialty", el: "\u039A\u03B1\u03C1\u03B4\u03B9\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE \u03B1\u03BD\u03B1\u03B9\u03C3\u03B8\u03B7\u03C3\u03AF\u03B1", en: "Cardiac anaesthesia", icon: "\u2764\uFE0F", kw: "\u03BA\u03B1\u03C1\u03B4\u03B9\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE cardiac CPB \u03B5\u03BE\u03C9\u03C3\u03C9\u03BC\u03B1\u03C4\u03B9\u03BA\u03AE \u03BA\u03C5\u03BA\u03BB\u03BF\u03C6\u03BF\u03C1\u03AF\u03B1 ACT" },
  { id: "cardnc", group: "subspecialty", el: "\u039A\u03B1\u03C1\u03B4\u03B9\u03BF\u03C0\u03AC\u03B8\u03B5\u03B9\u03B1 \u03C3\u03B5 \u03BC\u03B7 \u03BA\u03B1\u03C1\u03B4\u03B9\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE \u03B5\u03C0\u03AD\u03BC\u03B2\u03B1\u03C3\u03B7", en: "Cardiac disease in non-cardiac surgery", icon: "\u2764\uFE0F", kw: "\u03B2\u03B1\u03BB\u03B2\u03B9\u03B4\u03BF\u03C0\u03AC\u03B8\u03B5\u03B9\u03B1 \u03C3\u03C4\u03AD\u03BD\u03C9\u03C3\u03B7 \u03B1\u03BF\u03C1\u03C4\u03B9\u03BA\u03AE\u03C2 \u03B2\u03B1\u03BB\u03B2\u03AF\u03B4\u03B1\u03C2 \u03BC\u03B9\u03C4\u03C1\u03BF\u03B5\u03B9\u03B4\u03BF\u03CD\u03C2 \u03B1\u03BD\u03B5\u03C0\u03AC\u03C1\u03BA\u03B5\u03B9\u03B1 aortic stenosis mitral regurgitation HOCM \u03C5\u03C0\u03B5\u03C1\u03C4\u03C1\u03BF\u03C6\u03B9\u03BA\u03AE \u03BC\u03C5\u03BF\u03BA\u03B1\u03C1\u03B4\u03B9\u03BF\u03C0\u03AC\u03B8\u03B5\u03B9\u03B1 \u03C3\u03C4\u03B5\u03C6\u03B1\u03BD\u03B9\u03B1\u03AF\u03B1 \u03BD\u03CC\u03C3\u03BF\u03C2 \u03C3\u03C4\u03AD\u03BD\u03C4 stent DAPT \u03B1\u03C3\u03C0\u03B9\u03C1\u03AF\u03BD\u03B7 \u03AD\u03BC\u03C6\u03C1\u03B1\u03B3\u03BC\u03B1 \u03C4\u03C1\u03BF\u03C0\u03BF\u03BD\u03AF\u03BD\u03B7 Fontan \u03C3\u03C5\u03B3\u03B3\u03B5\u03BD\u03AE\u03C2 \u03BA\u03B1\u03C1\u03B4\u03B9\u03BF\u03C0\u03AC\u03B8\u03B5\u03B9\u03B1 congenital ACHD \u03BC\u03BF\u03BD\u03AE\u03C1\u03B7\u03C2 \u03BA\u03BF\u03B9\u03BB\u03AF\u03B1 fenestration \u03C0\u03BD\u03B5\u03C5\u03BC\u03BF\u03BD\u03B9\u03BA\u03AD\u03C2 \u03B1\u03BD\u03C4\u03B9\u03C3\u03C4\u03AC\u03C3\u03B5\u03B9\u03C2 PVR \u03C0\u03C1\u03BF\u03C6\u03CC\u03C1\u03C4\u03B9\u03C3\u03B7" },
  { id: "obstetric", group: "subspecialty", el: "\u039C\u03B1\u03B9\u03B5\u03C5\u03C4\u03B9\u03BA\u03AE \u03B1\u03BD\u03B1\u03B9\u03C3\u03B8\u03B7\u03C3\u03AF\u03B1", en: "Obstetric anaesthesia", icon: "\u{1F930}", kw: "\u03BC\u03B1\u03B9\u03B5\u03C5\u03C4\u03B9\u03BA\u03AE obstetric \u03BA\u03B1\u03B9\u03C3\u03B1\u03C1\u03B9\u03BA\u03AE caesarean \u03C0\u03C1\u03BF\u03B5\u03BA\u03BB\u03B1\u03BC\u03C8\u03AF\u03B1 preeclampsia \u03B1\u03B9\u03BC\u03BF\u03C1\u03C1\u03B1\u03B3\u03AF\u03B1 PPH \u03C9\u03BA\u03C5\u03C4\u03BF\u03BA\u03AF\u03BD\u03B7" },
  { id: "thoracic", group: "subspecialty", el: "\u0398\u03C9\u03C1\u03B1\u03BA\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE \u03B1\u03BD\u03B1\u03B9\u03C3\u03B8\u03B7\u03C3\u03AF\u03B1", en: "Thoracic anaesthesia", icon: "\u{1FAC1}", kw: "\u03B8\u03C9\u03C1\u03B1\u03BA\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE thoracic DLT \u03B4\u03B9\u03C0\u03BB\u03BF\u03CD \u03B1\u03C5\u03BB\u03BF\u03CD one lung \u03BC\u03BF\u03BD\u03BF\u03C0\u03BD\u03B5\u03C5\u03BC\u03BF\u03BD\u03B9\u03BA\u03CC\u03C2 \u03B1\u03B5\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2 \u03C5\u03C0\u03BF\u03BE\u03AF\u03B1" },
  { id: "neuro", group: "subspecialty", el: "\u039D\u03B5\u03C5\u03C1\u03BF\u03B1\u03BD\u03B1\u03B9\u03C3\u03B8\u03B7\u03C3\u03AF\u03B1", en: "Neuroanaesthesia", icon: "\u{1F9E0}", kw: "\u03BD\u03B5\u03C5\u03C1\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE neuro ICP \u03B5\u03BD\u03B4\u03BF\u03BA\u03C1\u03AC\u03BD\u03B9\u03B1 \u03C0\u03AF\u03B5\u03C3\u03B7 \u03BC\u03B1\u03BD\u03BD\u03B9\u03C4\u03CC\u03BB\u03B7" },
  { id: "thrombectomy", group: "subspecialty", el: "\u039C\u03B7\u03C7\u03B1\u03BD\u03B9\u03BA\u03AE \u03B8\u03C1\u03BF\u03BC\u03B2\u03B5\u03BA\u03C4\u03BF\u03BC\u03AE (\u0391\u0395\u0395)", en: "Mechanical thrombectomy (stroke)", icon: "\u23F0", kw: "\u03BC\u03B7\u03C7\u03B1\u03BD\u03B9\u03BA\u03AE \u03B8\u03C1\u03BF\u03BC\u03B2\u03B5\u03BA\u03C4\u03BF\u03BC\u03AE thrombectomy \u0391\u0395\u0395 stroke \u03B9\u03C3\u03C7\u03B1\u03B9\u03BC\u03B9\u03BA\u03CC \u03B5\u03B3\u03BA\u03B5\u03C6\u03B1\u03BB\u03B9\u03BA\u03CC NIHSS ASPECTS mTICI Rankin mRS penumbra \u03BD\u03B5\u03C5\u03C1\u03BF\u03B1\u03BA\u03C4\u03B9\u03BD\u03BF\u03BB\u03BF\u03B3\u03AF\u03B1 \u03B1\u03B3\u03B3\u03B5\u03B9\u03BF\u03B3\u03C1\u03AC\u03C6\u03BF\u03C2 time is brain" },
  { id: "giendo", group: "subspecialty", el: "\u0395\u03BD\u03B4\u03BF\u03C3\u03BA\u03BF\u03C0\u03AE\u03C3\u03B5\u03B9\u03C2 \u03C0\u03B5\u03C0\u03C4\u03B9\u03BA\u03BF\u03CD", en: "GI endoscopy", icon: "\u{1F52C}", kw: "\u03B5\u03BD\u03B4\u03BF\u03C3\u03BA\u03CC\u03C0\u03B7\u03C3\u03B7 endoscopy ERCP EUS \u03BA\u03BF\u03BB\u03BF\u03BD\u03BF\u03C3\u03BA\u03CC\u03C0\u03B7\u03C3\u03B7 colonoscopy \u03B3\u03B1\u03C3\u03C4\u03C1\u03BF\u03C3\u03BA\u03CC\u03C0\u03B7\u03C3\u03B7 gastroscopy \u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03BF\u03BB\u03AE sedation MAC \u03C0\u03B5\u03C0\u03C4\u03B9\u03BA\u03CC \u03B5\u03BD\u03C4\u03B5\u03C1\u03BF\u03C3\u03BA\u03CC\u03C0\u03B7\u03C3\u03B7 enteroscopy TNE Entonox \u03C6\u03BB\u03BF\u03C5\u03BC\u03B1\u03B6\u03B5\u03BD\u03AF\u03BB\u03B7 \u03BD\u03B1\u03BB\u03BF\u03BE\u03CC\u03BD\u03B7 BSG" },
  { id: "vascular", group: "subspecialty", el: "\u0391\u03B3\u03B3\u03B5\u03B9\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE \u03B1\u03BD\u03B1\u03B9\u03C3\u03B8\u03B7\u03C3\u03AF\u03B1", en: "Vascular anaesthesia", icon: "\u{1FAC0}", kw: "\u03B1\u03B3\u03B3\u03B5\u03B9\u03BF\u03C7\u03B5\u03B9\u03C1\u03BF\u03C5\u03C1\u03B3\u03B9\u03BA\u03AE vascular \u03B1\u03BD\u03B5\u03CD\u03C1\u03C5\u03C3\u03BC\u03B1 aortic clamp \u03BA\u03B1\u03C1\u03C9\u03C4\u03AF\u03B4\u03B1" },
  { id: "renal", group: "subspecialty", el: "\u039D\u03B5\u03C6\u03C1\u03B9\u03BA\u03AE \u03BD\u03CC\u03C3\u03BF\u03C2 \u03C4\u03B5\u03BB\u03B9\u03BA\u03BF\u03CD \u03C3\u03C4\u03B1\u03B4\u03AF\u03BF\u03C5 & \u03B1\u03B9\u03BC\u03BF\u03BA\u03AC\u03B8\u03B1\u03C1\u03C3\u03B7", en: "ESRD & dialysis", icon: "\u{1FAD8}", kw: "\u03BD\u03B5\u03C6\u03C1\u03B9\u03BA\u03AE \u03B1\u03BD\u03B5\u03C0\u03AC\u03C1\u03BA\u03B5\u03B9\u03B1 ESRD CKD dialysis \u03B1\u03B9\u03BC\u03BF\u03BA\u03AC\u03B8\u03B1\u03C1\u03C3\u03B7 \u03C0\u03B5\u03C1\u03B9\u03C4\u03BF\u03BD\u03B1\u03CA\u03BA\u03AE \u03BA\u03AC\u03B8\u03B1\u03C1\u03C3\u03B7 \u03C6\u03AF\u03C3\u03C4\u03BF\u03C5\u03BB\u03B1 fistula AV \u03C5\u03C0\u03B5\u03C1\u03BA\u03B1\u03BB\u03B9\u03B1\u03B9\u03BC\u03AF\u03B1 \u03BA\u03AC\u03BB\u03B9\u03BF \u03BF\u03C5\u03C1\u03B1\u03B9\u03BC\u03AF\u03B1 \u03B1\u03C4\u03C1\u03B1\u03BA\u03BF\u03CD\u03C1\u03B9\u03BF \u03C3\u03B9\u03C3\u03B1\u03C4\u03C1\u03B1\u03BA\u03BF\u03CD\u03C1\u03B9\u03BF sugammadex \u03BC\u03B5\u03C4\u03B1\u03BC\u03CC\u03C3\u03C7\u03B5\u03C5\u03C3\u03B7 \u03BD\u03B5\u03C6\u03C1\u03BF\u03CD eGFR CrCl" },
  { id: "hepatic", group: "subspecialty", el: "\u0397\u03C0\u03B1\u03C4\u03B9\u03BA\u03AE \u03BD\u03CC\u03C3\u03BF\u03C2 / \u03BA\u03AF\u03C1\u03C1\u03C9\u03C3\u03B7", en: "Liver disease & cirrhosis", icon: "\u{1F7E8}", kw: "\u03B7\u03C0\u03B1\u03C4\u03B9\u03BA\u03AE \u03BD\u03CC\u03C3\u03BF\u03C2 \u03BA\u03AF\u03C1\u03C1\u03C9\u03C3\u03B7 liver cirrhosis Child-Pugh MELD \u03B1\u03C3\u03BA\u03AF\u03C4\u03B7\u03C2 \u03B5\u03B3\u03BA\u03B5\u03C6\u03B1\u03BB\u03BF\u03C0\u03AC\u03B8\u03B5\u03B9\u03B1 \u03C0\u03CD\u03BB\u03B1\u03B9\u03B1 \u03C5\u03C0\u03AD\u03C1\u03C4\u03B1\u03C3\u03B7 \u03B7\u03C0\u03B1\u03C4\u03BF\u03BD\u03B5\u03C6\u03C1\u03B9\u03BA\u03CC \u03C0\u03AE\u03BE\u03B7 INR" },
  { id: "immuno", group: "subspecialty", el: "\u0391\u03BD\u03BF\u03C3\u03BF\u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03BF\u03BB\u03AE & \u03BC\u03B5\u03C4\u03B1\u03BC\u03CC\u03C3\u03C7\u03B5\u03C5\u03C3\u03B7", en: "Immunosuppression & transplant", icon: "\u{1F9EC}", kw: "\u03B1\u03BD\u03BF\u03C3\u03BF\u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03BF\u03BB\u03AE immunosuppression \u03BC\u03B5\u03C4\u03B1\u03BC\u03CC\u03C3\u03C7\u03B5\u03C5\u03C3\u03B7 transplant \u03C4\u03B1\u03BA\u03C1\u03CC\u03BB\u03B9\u03BC\u03BF\u03C5\u03C2 \u03BA\u03C5\u03BA\u03BB\u03BF\u03C3\u03C0\u03BF\u03C1\u03AF\u03BD\u03B7 tacrolimus ciclosporin \u03B1\u03B6\u03B1\u03B8\u03B5\u03B9\u03BF\u03C0\u03C1\u03AF\u03BD\u03B7 \u03BC\u03C5\u03BA\u03BF\u03C6\u03B1\u03B9\u03BD\u03BF\u03BB\u03B9\u03BA\u03CC sirolimus everolimus \u03B1\u03C0\u03CC\u03C1\u03C1\u03B9\u03C8\u03B7 \u03B1\u03C0\u03BF\u03BD\u03B5\u03C5\u03C1\u03C9\u03BC\u03AD\u03BD\u03B7 \u03BA\u03B1\u03C1\u03B4\u03B9\u03AC" },
  { id: "neuromuscular", group: "subspecialty", el: "\u039D\u03B5\u03C5\u03C1\u03BF\u03BC\u03C5\u03CA\u03BA\u03AD\u03C2 \u03BD\u03CC\u03C3\u03BF\u03B9", en: "Neuromuscular disease", icon: "\u{1F9BE}", kw: "\u03BC\u03C5\u03B1\u03C3\u03B8\u03AD\u03BD\u03B5\u03B9\u03B1 myasthenia gravis Lambert-Eaton \u03BC\u03C5\u03BF\u03C0\u03AC\u03B8\u03B5\u03B9\u03B1 \u03BC\u03C5\u03CA\u03BA\u03AE \u03B4\u03C5\u03C3\u03C4\u03C1\u03BF\u03C6\u03AF\u03B1 Duchenne \u03C1\u03B1\u03B2\u03B4\u03BF\u03BC\u03C5\u03CC\u03BB\u03C5\u03C3\u03B7 \u03C3\u03BF\u03C5\u03BA\u03BA\u03B9\u03BD\u03C5\u03BB\u03BF\u03C7\u03BF\u03BB\u03AF\u03BD\u03B7 sugammadex \u03C0\u03C5\u03C1\u03B9\u03B4\u03BF\u03C3\u03C4\u03B9\u03B3\u03BC\u03AF\u03BD\u03B7 TOF" },
  { id: "pregnonob", group: "subspecialty", el: "\u0395\u03B3\u03BA\u03C5\u03BC\u03BF\u03C3\u03CD\u03BD\u03B7 \u2014 \u03BC\u03B7 \u03BC\u03B1\u03B9\u03B5\u03C5\u03C4\u03B9\u03BA\u03AE \u03B5\u03C0\u03AD\u03BC\u03B2\u03B1\u03C3\u03B7", en: "Pregnancy — non-obstetric surgery", icon: "\u{1F930}", kw: "\u03B5\u03B3\u03BA\u03C5\u03BC\u03BF\u03C3\u03CD\u03BD\u03B7 pregnancy \u03BC\u03B7 \u03BC\u03B1\u03B9\u03B5\u03C5\u03C4\u03B9\u03BA\u03AE non-obstetric \u03B1\u03BF\u03C1\u03C4\u03BF\u03BA\u03BF\u03AF\u03BB\u03B7 \u03C3\u03C5\u03BC\u03C0\u03AF\u03B5\u03C3\u03B7 RSI \u03AD\u03BC\u03B2\u03C1\u03C5\u03BF \u03C0\u03BB\u03B1\u03BA\u03BF\u03CD\u03BD\u03C4\u03B1\u03C2 \u03C4\u03C1\u03AF\u03BC\u03B7\u03BD\u03BF \u03BB\u03B1\u03C0\u03B1\u03C1\u03BF\u03C3\u03BA\u03CC\u03C0\u03B7\u03C3\u03B7 \u03B8\u03C1\u03BF\u03BC\u03B2\u03BF\u03C0\u03C1\u03BF\u03C6\u03CD\u03BB\u03B1\u03BE\u03B7" },
  { id: "bariatric", group: "subspecialty", el: "\u0392\u03B1\u03C1\u03B9\u03B1\u03C4\u03C1\u03B9\u03BA\u03CC\u03C2 / \u03A0\u03B1\u03C7\u03CD\u03C3\u03B1\u03C1\u03BA\u03BF\u03C2 \u03B1\u03C3\u03B8\u03B5\u03BD\u03AE\u03C2", en: "Bariatric / Obese patient", icon: "\u2696\uFE0F", kw: "\u03B2\u03B1\u03C1\u03B9\u03B1\u03C4\u03C1\u03B9\u03BA\u03AE bariatric \u03C0\u03B1\u03C7\u03C5\u03C3\u03B1\u03C1\u03BA\u03AF\u03B1 obesity IBW ABW OSA" },
  // Analgesia & regional
  { id: "postop", group: "analgesia", el: "\u039F\u03BE\u03B5\u03AF\u03B1 \u03BC\u03B5\u03C4\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AE \u03B1\u03BD\u03B1\u03BB\u03B3\u03B7\u03C3\u03AF\u03B1", en: "Acute postop analgesia", icon: "\u{1F489}", kw: "\u03BC\u03B5\u03C4\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AE \u03B1\u03BD\u03B1\u03BB\u03B3\u03B7\u03C3\u03AF\u03B1 postoperative analgesia \u03C0\u03BF\u03BB\u03C5\u03C4\u03C1\u03BF\u03C0\u03B9\u03BA\u03AE multimodal PCA" },
  { id: "painscales", group: "analgesia", el: "\u039A\u03BB\u03AF\u03BC\u03B1\u03BA\u03B5\u03C2 \u03C0\u03CC\u03BD\u03BF\u03C5", en: "Pain scales", icon: "\u{1F623}", kw: "\u03BA\u03BB\u03AF\u03BC\u03B1\u03BA\u03B5\u03C2 \u03C0\u03CC\u03BD\u03BF\u03C5 pain scale NRS VAS FLACC CPOT \u03B1\u03BE\u03B9\u03BF\u03BB\u03CC\u03B3\u03B7\u03C3\u03B7 \u03C0\u03CC\u03BD\u03BF\u03C5 \u03BC\u03B7 \u03BB\u03B5\u03BA\u03C4\u03B9\u03BA\u03BF\u03AF \u03C0\u03B1\u03B9\u03B4\u03B9\u03AC \u0392\u0391\u0399 \u03B4\u03B9\u03B1\u03C3\u03C9\u03BB\u03B7\u03BD\u03C9\u03BC\u03AD\u03BD\u03BF\u03C2" },
  { id: "neuraxial", group: "analgesia", el: "\u039D\u03B5\u03C5\u03C1\u03B1\u03BE\u03BF\u03BD\u03B9\u03BA\u03AE & \u03A0\u03B5\u03C1\u03B9\u03BF\u03C7\u03B9\u03BA\u03AE", en: "Neuraxial & Regional", icon: "\u{1F3AF}", kw: "\u03BD\u03B5\u03C5\u03C1\u03B1\u03BE\u03BF\u03BD\u03B9\u03BA\u03AE \u03C1\u03B1\u03C7\u03B9\u03B1\u03AF\u03B1 spinal \u03B5\u03C0\u03B9\u03C3\u03BA\u03BB\u03B7\u03C1\u03AF\u03B4\u03B9\u03BF\u03C2 epidural \u03C0\u03B5\u03C1\u03B9\u03BF\u03C7\u03B9\u03BA\u03AE regional block \u03B1\u03C0\u03BF\u03BA\u03BB\u03B5\u03B9\u03C3\u03BC\u03CC\u03C2 ESP TAP PECS serratus fascial plane \u03C0\u03B1\u03C1\u03B1\u03C3\u03C0\u03BF\u03BD\u03B4\u03C5\u03BB\u03B9\u03BA\u03CC\u03C2 paravertebral quadratus" },
  { id: "la", group: "analgesia", el: "\u038C\u03C1\u03B9\u03B1 \u03C4\u03BF\u03C0\u03B9\u03BA\u03CE\u03BD \u03B1\u03BD\u03B1\u03B9\u03C3\u03B8\u03B7\u03C4\u03B9\u03BA\u03CE\u03BD", en: "Local anesthetic limits", icon: "\u26A0\uFE0F", kw: "\u03C4\u03BF\u03C0\u03B9\u03BA\u03AC \u03B1\u03BD\u03B1\u03B9\u03C3\u03B8\u03B7\u03C4\u03B9\u03BA\u03AC local anaesthetic \u03BC\u03AD\u03B3\u03B9\u03C3\u03C4\u03B7 \u03B4\u03CC\u03C3\u03B7 max dose LAST \u03C4\u03BF\u03BE\u03B9\u03BA\u03CC\u03C4\u03B7\u03C4\u03B1 toxicity" },
  { id: "anticoag", group: "analgesia", el: "\u0391\u03BD\u03C4\u03B9\u03C0\u03B7\u03BA\u03C4\u03B9\u03BA\u03AC & \u039D\u03B5\u03C5\u03C1\u03B1\u03BE\u03BF\u03BD\u03B9\u03BA\u03CC\u03C2", en: "Anticoagulants & Neuraxial", icon: "\u{1FA78}", kw: "\u03B1\u03BD\u03C4\u03B9\u03C0\u03B7\u03BA\u03C4\u03B9\u03BA\u03AC anticoagulants DOAC \u03B7\u03C0\u03B1\u03C1\u03AF\u03BD\u03B7 heparin \u03B1\u03C3\u03C0\u03B9\u03C1\u03AF\u03BD\u03B7 clopidogrel \u03C7\u03C1\u03BF\u03BD\u03B9\u03C3\u03BC\u03CC\u03C2 ASRA" },
  // Calculators & pharmacology
  { id: "tci", group: "calc", el: "TCI / \u03A3\u03C4\u03BF\u03C7\u03B5\u03C5\u03BC\u03AD\u03BD\u03B7 \u03AD\u03B3\u03C7\u03C5\u03C3\u03B7", en: "TCI / Target-controlled", icon: "\u{1F4C9}", kw: "TCI Marsh Schnider Minto Eleveld propofol remifentanil \u03C3\u03C4\u03CC\u03C7\u03BF\u03C2 \u03C3\u03C5\u03B3\u03BA\u03AD\u03BD\u03C4\u03C1\u03C9\u03C3\u03B7 effect site" },
  { id: "quickcalc", group: "calc", el: "\u0393\u03C1\u03AE\u03B3\u03BF\u03C1\u03BF\u03B9 \u03C5\u03C0\u03BF\u03BB\u03BF\u03B3\u03B9\u03C3\u03C4\u03AD\u03C2", en: "Quick calculators", icon: "\u{1F9EE}", kw: "\u03B3\u03C1\u03AE\u03B3\u03BF\u03C1\u03BF\u03B9 \u03C5\u03C0\u03BF\u03BB\u03BF\u03B3\u03B9\u03C3\u03BC\u03BF\u03AF BMI IBW ABW LBM \u03B9\u03B4\u03B1\u03BD\u03B9\u03BA\u03CC \u03B2\u03AC\u03C1\u03BF\u03C2" },
  { id: "renalcalc", group: "calc", el: "\u039D\u03B5\u03C6\u03C1\u03B9\u03BA\u03AE \u03BB\u03B5\u03B9\u03C4\u03BF\u03C5\u03C1\u03B3\u03AF\u03B1 (CrCl / eGFR)", en: "Renal function (CrCl / eGFR)", icon: "\u{1F9EA}", kw: "GFR eGFR CrCl \u03BA\u03AC\u03B8\u03B1\u03C1\u03C3\u03B7 \u03BA\u03C1\u03B5\u03B1\u03C4\u03B9\u03BD\u03AF\u03BD\u03B7\u03C2 creatinine clearance Cockcroft Gault CKD-EPI \u03BD\u03B5\u03C6\u03C1\u03B9\u03BA\u03AE \u03BB\u03B5\u03B9\u03C4\u03BF\u03C5\u03C1\u03B3\u03AF\u03B1 renal function \u03BA\u03C1\u03B5\u03B1\u03C4\u03B9\u03BD\u03AF\u03BD\u03B7 \u03A7\u039D\u039D CKD \u03C3\u03C4\u03AC\u03B4\u03B9\u03BF" },
  { id: "mac", group: "calc", el: "MAC \u03C0\u03C4\u03B7\u03C4\u03B9\u03BA\u03CE\u03BD (\u03BA\u03B1\u03C4\u03AC \u03B7\u03BB\u03B9\u03BA\u03AF\u03B1)", en: "Volatile MAC (age-adjusted)", icon: "\u{1F4A8}", kw: "MAC \u03B5\u03BB\u03AC\u03C7\u03B9\u03C3\u03C4\u03B7 \u03BA\u03C5\u03C8\u03B5\u03BB\u03B9\u03B4\u03B9\u03BA\u03AE \u03C3\u03C5\u03B3\u03BA\u03AD\u03BD\u03C4\u03C1\u03C9\u03C3\u03B7 \u03C0\u03C4\u03B7\u03C4\u03B9\u03BA\u03AC volatile" },
  { id: "vaso", group: "calc", el: "\u0388\u03B3\u03C7\u03C5\u03C3\u03B7 \u03B1\u03B3\u03B3\u03B5\u03B9\u03BF\u03C3\u03C5\u03C3\u03C0\u03B1\u03C3\u03C4\u03B9\u03BA\u03CE\u03BD", en: "Vasopressor infusions", icon: "\u{1F489}", kw: "\u03B1\u03B3\u03B3\u03B5\u03B9\u03BF\u03C3\u03C5\u03C3\u03C0\u03B1\u03C3\u03C4\u03B9\u03BA\u03AC vasopressors \u03B9\u03BD\u03CC\u03C4\u03C1\u03BF\u03C0\u03B1 noradrenaline \u03AD\u03B3\u03C7\u03C5\u03C3\u03B7 infusion" },
  { id: "sedcalc", group: "calc", el: "\u039A\u03B1\u03C4\u03B1\u03C3\u03C4\u03BF\u03BB\u03AE \u03B5\u03C0\u03B5\u03BC\u03B2\u03AC\u03C3\u03B5\u03C9\u03BD \u2014 \u03B4\u03CC\u03C3\u03B5\u03B9\u03C2 & \u03C1\u03C5\u03B8\u03BC\u03BF\u03AF", en: "Procedural sedation — doses & rates", icon: "\u{1F4A4}", kw: "\u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03BF\u03BB\u03AE sedation \u03B4\u03B5\u03BE\u03BC\u03B5\u03B4\u03B5\u03C4\u03BF\u03BC\u03B9\u03B4\u03AF\u03BD\u03B7 dexdor \u03C0\u03C1\u03BF\u03C0\u03BF\u03C6\u03CC\u03BB\u03B7 propofol \u03BC\u03B9\u03B4\u03B1\u03B6\u03BF\u03BB\u03AC\u03BC\u03B7 midazolam \u03BA\u03B5\u03C4\u03B1\u03BC\u03AF\u03BD\u03B7 ketamine \u03C1\u03B5\u03BC\u03B9\u03C6\u03B5\u03BD\u03C4\u03B1\u03BD\u03AF\u03BB\u03B7 remifentanil \u03C6\u03B1\u03B9\u03BD\u03C4\u03B1\u03BD\u03CD\u03BB\u03B7 fentanyl \u03AD\u03B3\u03C7\u03C5\u03C3\u03B7 \u03C1\u03C5\u03B8\u03BC\u03CC\u03C2 mL/h \u03C6\u03CC\u03C1\u03C4\u03B9\u03C3\u03B7 \u03C0\u03B1\u03B9\u03B4\u03B9\u03AC MAC" },
  { id: "vent", group: "calc", el: "\u0391\u03B5\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2 & \u039C\u03B7\u03C7\u03B1\u03BD\u03B9\u03BA\u03AE \u03C0\u03BD\u03B5\u03CD\u03BC\u03BF\u03BD\u03B1", en: "Ventilation & Lung mechanics", icon: "\u{1FAC1}", kw: "\u03B1\u03B5\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2 ventilation PBW \u03B1\u03BD\u03B1\u03C0\u03BD\u03B5\u03CC\u03BC\u03B5\u03BD\u03BF\u03C2 \u03CC\u03B3\u03BA\u03BF\u03C2 tidal volume driving pressure Pplat PEEP compliance \u03B5\u03BD\u03B4\u03BF\u03C4\u03B9\u03BA\u03CC\u03C4\u03B7\u03C4\u03B1 ARDS A-a \u03BD\u03B5\u03BA\u03C1\u03CC\u03C2 \u03C7\u03CE\u03C1\u03BF\u03C2 dead space RSBI" },
  { id: "recruit", group: "calc", el: "Recruitment manoeuvres (\u03B5\u03C0\u03B9\u03C3\u03C4\u03C1\u03AC\u03C4\u03B5\u03C5\u03C3\u03B7 \u03BA\u03C5\u03C8\u03B5\u03BB\u03AF\u03B4\u03C9\u03BD)", en: "Recruitment manoeuvres", icon: "\u{1FAC1}", kw: "recruitment manoeuvre maneuver RM PEEP \u03B5\u03C0\u03B9\u03C3\u03C4\u03C1\u03AC\u03C4\u03B5\u03C5\u03C3\u03B7 \u03BA\u03C5\u03C8\u03B5\u03BB\u03AF\u03B4\u03C9\u03BD \u03B1\u03C4\u03B5\u03BB\u03B5\u03BA\u03C4\u03B1\u03C3\u03AF\u03B1 PROVHILO PROBESE PROTHOR DESIGNATION iPROVE driving pressure" },
  { id: "lowflow", group: "calc", el: "Low-flow \u03B1\u03BD\u03B1\u03B9\u03C3\u03B8\u03B7\u03C3\u03AF\u03B1", en: "Low-flow anaesthesia", icon: "\u267B\uFE0F", kw: "low flow minimal flow metabolic flow \u03C7\u03B1\u03BC\u03B7\u03BB\u03AE \u03C1\u03BF\u03AE \u03C6\u03C1\u03AD\u03C3\u03BA\u03C9\u03BD \u03B1\u03B5\u03C1\u03AF\u03C9\u03BD \u03C3\u03B5\u03B2\u03BF\u03C6\u03BB\u03BF\u03C5\u03C1\u03AC\u03BD\u03B9\u03BF compound A \u03B1\u03C0\u03BF\u03C1\u03C1\u03BF\u03C6\u03B7\u03C4\u03AE\u03C2 \u03BA\u03B1\u03C4\u03B1\u03BD\u03AC\u03BB\u03C9\u03C3\u03B7 \u03C0\u03C4\u03B7\u03C4\u03B9\u03BA\u03BF\u03CD \u03C0\u03B5\u03C1\u03B9\u03B2\u03AC\u03BB\u03BB\u03BF\u03BD" },
  { id: "niv", group: "calc", el: "\u039C\u03B7 \u03B5\u03C0\u03B5\u03BC\u03B2\u03B1\u03C4\u03B9\u03BA\u03CC\u03C2 \u03B1\u03B5\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2 \u03BC\u03B5\u03C4\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC (\u039C\u0395\u039C\u0391)", en: "Postoperative non-invasive ventilation", icon: "\u{1F637}", kw: "NIV \u039C\u0395\u039C\u0391 \u03BC\u03B7 \u03B5\u03C0\u03B5\u03BC\u03B2\u03B1\u03C4\u03B9\u03BA\u03CC\u03C2 \u03B1\u03B5\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2 CPAP BiPAP HFNC \u03BC\u03B5\u03C4\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AE \u03B1\u03BD\u03B1\u03C0\u03BD\u03B5\u03C5\u03C3\u03C4\u03B9\u03BA\u03AE \u03B1\u03BD\u03B5\u03C0\u03AC\u03C1\u03BA\u03B5\u03B9\u03B1 \u039F\u0391\u0391 \u03C5\u03C0\u03BF\u03BE\u03B1\u03B9\u03BC\u03AF\u03B1 NIVAS \u0394\u03B9\u03B1\u03BC\u03B1\u03BD\u03C4\u03AC\u03BA\u03B7" },
  { id: "fickco", group: "calc", el: "\u039A\u03B1\u03C1\u03B4\u03B9\u03B1\u03BA\u03AE \u03C0\u03B1\u03C1\u03BF\u03C7\u03AE (Fick / SvO\u2082)", en: "Cardiac output (Fick / SvO\u2082)", icon: "\u{1F493}", kw: "\u03BA\u03B1\u03C1\u03B4\u03B9\u03B1\u03BA\u03AE \u03C0\u03B1\u03C1\u03BF\u03C7\u03AE cardiac output CO CI Fick SvO2 ScvO2 \u03BA\u03BF\u03C1\u03B5\u03C3\u03BC\u03CC\u03C2 \u03BC\u03B9\u03BA\u03C4\u03BF\u03CD \u03C6\u03BB\u03B5\u03B2\u03B9\u03BA\u03BF\u03CD \u03B1\u03AF\u03BC\u03B1\u03C4\u03BF\u03C2 DO2 VO2 O2ER \u03B1\u03C0\u03CC\u03BB\u03B7\u03C8\u03B7 \u03BF\u03BE\u03C5\u03B3\u03CC\u03BD\u03BF\u03C5 \u03B5\u03C0\u03B9\u03C6\u03AC\u03BD\u03B5\u03B9\u03B1 \u03C3\u03CE\u03BC\u03B1\u03C4\u03BF\u03C2 BSA" },
  { id: "spiro", group: "calc", el: "\u03A3\u03C0\u03B9\u03C1\u03BF\u03BC\u03AD\u03C4\u03C1\u03B7\u03C3\u03B7 & \u03B5\u03BA\u03C4\u03BF\u03BC\u03AE \u03C0\u03BD\u03B5\u03CD\u03BC\u03BF\u03BD\u03B1", en: "Spirometry & lung resection", icon: "\u{1FA7B}", kw: "\u03C3\u03C0\u03B9\u03C1\u03BF\u03BC\u03AD\u03C4\u03C1\u03B7\u03C3\u03B7 spirometry FEV1 FVC DLCO ppoFEV1 ppoDLCO GOLD \u03B1\u03C0\u03BF\u03C6\u03C1\u03B1\u03BA\u03C4\u03B9\u03BA\u03CC \u03C0\u03B5\u03C1\u03B9\u03BF\u03C1\u03B9\u03C3\u03C4\u03B9\u03BA\u03CC \u03BB\u03BF\u03B2\u03B5\u03BA\u03C4\u03BF\u03BC\u03AE \u03C0\u03BD\u03B5\u03C5\u03BC\u03BF\u03BD\u03B5\u03BA\u03C4\u03BF\u03BC\u03AE VO2max CPET shuttle walk \u03C3\u03BA\u03AC\u03BB\u03B1 \u03B1\u03BD\u03B1\u03C0\u03BD\u03B5\u03C5\u03C3\u03C4\u03B9\u03BA\u03AE \u03BB\u03B5\u03B9\u03C4\u03BF\u03C5\u03C1\u03B3\u03AF\u03B1" },
  { id: "tof", group: "calc", el: "TOF / \u039D\u03B5\u03C5\u03C1\u03BF\u03BC\u03C5\u03CA\u03BA\u03CC\u03C2 \u03B1\u03C0\u03BF\u03BA\u03BB\u03B5\u03B9\u03C3\u03BC\u03CC\u03C2", en: "TOF / Neuromuscular block", icon: "\u26A1", kw: "TOF train of four \u03BD\u03B5\u03C5\u03C1\u03BF\u03BC\u03C5\u03CA\u03BA\u03CC\u03C2 \u03B1\u03C0\u03BF\u03BA\u03BB\u03B5\u03B9\u03C3\u03BC\u03CC\u03C2 neuromuscular block \u03B1\u03BD\u03B1\u03C3\u03C4\u03C1\u03BF\u03C6\u03AE reversal sugammadex \u03C3\u03BF\u03C5\u03B3\u03BA\u03B1\u03BC\u03B1\u03B4\u03AD\u03BE\u03B7 \u03BD\u03B5\u03BF\u03C3\u03C4\u03B9\u03B3\u03BC\u03AF\u03BD\u03B7 PTC TOFr" },
  { id: "opioid", group: "calc", el: "\u039C\u03B5\u03C4\u03B1\u03C4\u03C1\u03BF\u03C0\u03AE \u03BF\u03C0\u03B9\u03BF\u03B5\u03B9\u03B4\u03CE\u03BD", en: "Opioid conversion", icon: "\u{1F48A}", kw: "\u03BC\u03B5\u03C4\u03B1\u03C4\u03C1\u03BF\u03C0\u03AE \u03BF\u03C0\u03B9\u03BF\u03B5\u03B9\u03B4\u03CE\u03BD opioid conversion equianalgesic \u03B9\u03C3\u03BF\u03B1\u03BD\u03B1\u03BB\u03B3\u03B7\u03C3\u03AF\u03B1 OME morphine equivalent \u03C7\u03C1\u03CC\u03BD\u03B9\u03BF\u03C2 \u03C0\u03CC\u03BD\u03BF\u03C2 chronic pain patch \u03C7\u03C1\u03CC\u03BD\u03B9\u03BF\u03C2 \u03C0\u03CC\u03BD\u03BF\u03C2 \u03BF\u03BE\u03C5\u03BA\u03C9\u03B4\u03CC\u03BD\u03B7 \u03C5\u03B4\u03C1\u03BF\u03BC\u03BF\u03C1\u03C6\u03CC\u03BD\u03B7 \u03C4\u03C1\u03B1\u03BC\u03B1\u03B4\u03CC\u03BB\u03B7 \u03C4\u03B1\u03C0\u03B5\u03BD\u03C4\u03B1\u03B4\u03CC\u03BB\u03B7 \u03BA\u03C9\u03B4\u03B5\u0390\u03BD\u03B7 \u03BC\u03B5\u03B8\u03B1\u03B4\u03CC\u03BD\u03B7 \u03B2\u03BF\u03C5\u03C0\u03C1\u03B5\u03BD\u03BF\u03C1\u03C6\u03AF\u03BD\u03B7" },
  { id: "fluids", group: "calc", el: "\u03A5\u03B3\u03C1\u03AC & \u0391\u03AF\u03BC\u03B1 (\u03C0\u03B5\u03C1\u03B9\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC)", en: "Fluids & Blood (periop)", icon: "\u{1F4A7}", kw: "\u03C5\u03B3\u03C1\u03AC fluids maintenance 4-2-1 \u03CC\u03B3\u03BA\u03BF\u03C2 \u03B1\u03AF\u03BC\u03B1\u03C4\u03BF\u03C2 EBV \u03B5\u03C0\u03B9\u03C4\u03C1\u03B5\u03C0\u03CC\u03BC\u03B5\u03BD\u03B7 \u03B1\u03C0\u03CE\u03BB\u03B5\u03B9\u03B1 ABL \u03BC\u03B5\u03C4\u03AC\u03B3\u03B3\u03B9\u03C3\u03B7 transfusion" },
  { id: "csht", group: "calc", el: "Context-Sensitive Half-Time", en: "Context-Sensitive Half-Time", icon: "\u23F1", kw: "context sensitive half time \u03C7\u03C1\u03CC\u03BD\u03BF\u03C2 \u03B7\u03BC\u03B9\u03B6\u03C9\u03AE\u03C2 \u03B1\u03C6\u03CD\u03C0\u03BD\u03B9\u03C3\u03B7 emergence" },
  // Perioperative & reference
  { id: "periop", group: "reference", el: "\u03A0\u03B5\u03C1\u03B9\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AE \u03B9\u03B1\u03C4\u03C1\u03B9\u03BA\u03AE", en: "Perioperative medicine", icon: "\u{1F4CB}", kw: "\u03C0\u03B5\u03C1\u03B9\u03B5\u03B3\u03C7\u03B5\u03B9\u03C1\u03B7\u03C4\u03B9\u03BA\u03AC \u03C6\u03AC\u03C1\u03BC\u03B1\u03BA\u03B1 \u03B4\u03B9\u03B1\u03B2\u03AE\u03C4\u03B7\u03C2 diabetes GLP-1 SGLT2 \u03B9\u03BD\u03C3\u03BF\u03C5\u03BB\u03AF\u03BD\u03B7 \u03C3\u03C4\u03B5\u03C1\u03BF\u03B5\u03B9\u03B4\u03AE steroid bridging stent DAPT" },
  { id: "gastricus", group: "reference", el: "Γαστρικό υπερηχογράφημα", en: "Gastric ultrasound", icon: "\u{1F50E}", kw: "\u03B3\u03B1\u03C3\u03C4\u03C1\u03B9\u03BA\u03CC \u03C5\u03C0\u03B5\u03C1\u03B7\u03C7\u03BF\u03B3\u03C1\u03AC\u03C6\u03B7\u03BC\u03B1 gastric ultrasound POCUS \u03C5\u03C0\u03AD\u03C1\u03B7\u03C7\u03BF\u03C2 \u03C3\u03C4\u03BF\u03BC\u03AC\u03C7\u03B9 \u03C3\u03C4\u03CC\u03BC\u03B1\u03C7\u03BF\u03C2 \u03AC\u03BD\u03C4\u03C1\u03BF antrum CSA \u03BD\u03B7\u03C3\u03C4\u03B5\u03AF\u03B1 fasting \u03B5\u03B9\u03C3\u03C1\u03CC\u03C6\u03B7\u03C3\u03B7 aspiration \u03C0\u03BB\u03AE\u03C1\u03B5\u03C2 \u03C3\u03C4\u03BF\u03BC\u03AC\u03C7\u03B9 full stomach GLP-1 Perlas I-AIM" },
  { id: "abx", group: "reference", el: "\u0391\u03BD\u03C4\u03B9\u03B2\u03B9\u03BF\u03C4\u03B9\u03BA\u03AE \u03C0\u03C1\u03BF\u03C6\u03CD\u03BB\u03B1\u03BE\u03B7", en: "Antibiotic prophylaxis", icon: "\u{1F9EB}", kw: "\u03B1\u03BD\u03C4\u03B9\u03B2\u03B9\u03BF\u03C4\u03B9\u03BA\u03AC antibiotics \u03C0\u03C1\u03BF\u03C6\u03CD\u03BB\u03B1\u03BE\u03B7 prophylaxis \u03BB\u03BF\u03AF\u03BC\u03C9\u03BE\u03B7" }
];
// Function tiers used by CALC_MODE (and listed in audit/CALC-MODES.md):
//   ref = reference text/tables or published scores · dose = weight-based doses from SmPC/guidelines
//   calc = simple formula calculators · complex = models, infusion rates, conversions, decision algorithms
const TOOL_TIER = {
  crisis: "dose", airwaysizes: "ref", scores: "ref", gcs: "ref", asaps: "ref", rotem: "dose",
  cardiac: "dose", cardnc: "ref", obstetric: "dose", thoracic: "dose", neuro: "dose", thrombectomy: "ref",
  giendo: "ref", vascular: "dose", renal: "ref", hepatic: "ref", immuno: "ref", neuromuscular: "ref",
  pregnonob: "ref", bariatric: "calc", postop: "dose", painscales: "ref", neuraxial: "dose", la: "dose",
  anticoag: "ref", tci: "complex", quickcalc: "dose", renalcalc: "calc", mac: "calc", vaso: "complex",
  sedcalc: "complex", vent: "calc", recruit: "complex", lowflow: "calc", niv: "complex", fickco: "calc",
  spiro: "calc", tof: "dose", opioid: "complex", fluids: "calc", csht: "ref", periop: "ref", gastricus: "calc", abx: "dose"
};
const toolVisible = (id) => CALC_MODE === "full" ? true : CALC_MODE === "simple" ? TOOL_TIER[id] !== "complex" : (TOOL_TIER[id] === "ref" || TOOL_TIER[id] === "dose");
const TOOLS_SHOWN = TOOL_SECTIONS.filter((s) => toolVisible(s.id));


function ToolsTab({ lang, weight, age, height, sex, focus, onUse }) {
  // Nothing is open on arrival: every group starts collapsed and no tool is expanded. A local
  // search or a global-search jump expands whatever it needs to reveal.
  const [open, setOpen] = useState(null);
  const groupOf = (id) => (TOOL_SECTIONS.find((s) => s.id === id) || {}).group;
  const [openGroups, setOpenGroups] = useState([]);
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
  const sections = TOOLS_SHOWN;
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
  const fav = useFavs();
  const favs = fav.favs.filter((f) => f.k === "tool").map((f) => f.id);
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
  ), q && /* @__PURE__ */ React.createElement("button", { onClick: () => setQ(""), "aria-label": lang === "el" ? "\u039A\u03B1\u03B8\u03B1\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2 \u03B1\u03BD\u03B1\u03B6\u03AE\u03C4\u03B7\u03C3\u03B7\u03C2" : "Clear search", style: { position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", color: S.muted, fontWeight: 600, fontSize: 18, cursor: "pointer", fontFamily: "inherit" } }, "\xD7")), !query && favSections.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 12, color: S.muted, letterSpacing: 0.6, padding: "4px 4px 0" } }, upGr("\u2B50 "),upGr(lang === "el" ? "\u0391\u03B3\u03B1\u03C0\u03B7\u03BC\u03AD\u03BD\u03B1" : "Favourites")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, favSections.map((sec) => /* @__PURE__ */ React.createElement("button", { key: "fav-" + sec.id, onClick: () => { setOpen(sec.id); if (onUse) onUse(sec); const g = groupOf(sec.id); if (g) setOpenGroups((gs) => gs.includes(g) ? gs : gs.concat(g)); }, style: {
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
  } }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", color: S.teal } }, TOOL_ICON_OF[sec.id] ? /* @__PURE__ */ React.createElement(LineIcon, { name: TOOL_ICON_OF[sec.id], size: 16 }) : sec.icon), sec[lang])))), GROUPS.map((grp) => {
    const groupSecs = sections.filter((s) => s.group === grp.id && matches(s));
    if (groupSecs.length === 0) return null;
    return /* @__PURE__ */ React.createElement("div", { key: grp.id, style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => toggleGroup(grp.id), style: { display: "flex", alignItems: "center", gap: 8, width: "100%", background: "none", border: "none", padding: "8px 4px 2px", minHeight: 44, cursor: "pointer", fontFamily: "inherit", textAlign: "left" } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 800, fontSize: 12, color: S.muted, letterSpacing: 0.6 } }, upGr(grp[lang])), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: S.muted, background: S.bg, borderRadius: 20, padding: "1px 7px" } }, groupSecs.length), /* @__PURE__ */ React.createElement("span", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement("span", { style: { color: S.muted, fontWeight: 700, fontSize: 16, transform: (query || openGroups.includes(grp.id)) ? "rotate(90deg)" : "none", transition: "transform .15s" } }, "\u203A")), (query || openGroups.includes(grp.id)) && groupSecs.map((sec) => {
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
      } }, /* @__PURE__ */ React.createElement("span", { style: { width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", background: S.tintSelected, color: S.teal } }, TOOL_ICON_OF[sec.id] ? /* @__PURE__ */ React.createElement(LineIcon, { name: TOOL_ICON_OF[sec.id], size: 20 }) : sec.icon), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700, fontSize: 15.5, color: S.ink, flex: 1, minWidth: 0, overflowWrap: "anywhere" } }, sec[lang]), /* @__PURE__ */ React.createElement(FavStar, { k: "tool", id: sec.id, lang, fav }), /* @__PURE__ */ React.createElement("span", { style: { color: S.muted, fontWeight: 600, fontSize: 18, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .15s" } }, "\u203A")), isOpen && /* @__PURE__ */ React.createElement("div", { style: { padding: "0 14px 14px" } }, sec.id === "asaps" && /* @__PURE__ */ React.createElement(ASACard, { lang }), sec.id === "scores" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 5, flexWrap: "wrap" } }, allScores.map((sc) => /* @__PURE__ */ React.createElement("button", { key: sc.id, onClick: () => setScoreOpen(sc.id), style: {
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
      } }, sc.name))), SCORES.filter((sc) => sc.id === scoreOpen).map((sc) => /* @__PURE__ */ React.createElement(ScoreCard, { key: `${sc.id}-${weight}-${age}-${sex}-${height}`, sc, lang, patient })), MULTI_SCORES.filter((sc) => sc.id === scoreOpen).map((sc) => /* @__PURE__ */ React.createElement(MultiScoreCard, { key: sc.id, sc, lang }))), sec.id === "crisis" && /* @__PURE__ */ React.createElement(CrisisCard, { lang, weight }), sec.id === "airwaysizes" && /* @__PURE__ */ React.createElement(AirwaySizesCard, { lang }), sec.id === "periop" && /* @__PURE__ */ React.createElement(PeriopMedCard, { lang }), sec.id === "renalcalc" && /* @__PURE__ */ React.createElement(RenalFunctionCalc, { lang, weight, age, height, sex }), sec.id === "quickcalc" && /* @__PURE__ */ React.createElement(QuickCalcCard, { lang, weight }), sec.id === "mac" && /* @__PURE__ */ React.createElement(MACCard, { lang, age }), sec.id === "painscales" && /* @__PURE__ */ React.createElement(PainScalesCard, { lang }), sec.id === "postop" && /* @__PURE__ */ React.createElement(PostopAnalgesiaCard, { lang, weight }), sec.id === "neuraxial" && /* @__PURE__ */ React.createElement(NeuraxialCard, { lang, weight }), sec.id === "rotem" && /* @__PURE__ */ React.createElement(ROTEMCard, { lang, weight }), sec.id === "cardiac" && /* @__PURE__ */ React.createElement(CardiacCard, { lang, weight }), sec.id === "cardnc" && /* @__PURE__ */ React.createElement(CardiacNonCardiacCard, { lang }), sec.id === "obstetric" && /* @__PURE__ */ React.createElement(ObstetricCard, { lang, weight }), sec.id === "thoracic" && /* @__PURE__ */ React.createElement(ThoracicCard, { lang, weight }), sec.id === "fickco" && /* @__PURE__ */ React.createElement(FickCOCalc, { lang, weight, height }), sec.id === "sedcalc" && React.createElement(SedationCalc, { lang, weight, age }), sec.id === "vent" && /* @__PURE__ */ React.createElement(VentilationCalc, { lang, height, sex, age }), sec.id === "recruit" && /* @__PURE__ */ React.createElement(RecruitmentCard, { lang, height, sex, weight }), sec.id === "lowflow" && /* @__PURE__ */ React.createElement(LowFlowCard, { lang }), sec.id === "gcs" && /* @__PURE__ */ React.createElement(GCSCard, { lang }), sec.id === "niv" && /* @__PURE__ */ React.createElement(NIVCard, { lang }), sec.id === "spiro" && /* @__PURE__ */ React.createElement(SpirometryCard, { lang }), sec.id === "tof" && /* @__PURE__ */ React.createElement(TOFCard, { lang, weight }), sec.id === "opioid" && /* @__PURE__ */ React.createElement(OpioidConvertCard, { lang }), sec.id === "bariatric" && /* @__PURE__ */ React.createElement(BariatricCard, { lang, weight, height, sex }), sec.id === "vaso" && /* @__PURE__ */ React.createElement(VasopressorCalc, { lang, weight }), sec.id === "anticoag" && /* @__PURE__ */ React.createElement(AnticoagList, { lang }), sec.id === "fluids" && /* @__PURE__ */ React.createElement(FluidsCalc, { lang, weight, age, sex }), sec.id === "abx" && /* @__PURE__ */ React.createElement(AbxList, { lang, weight }), sec.id === "gastricus" && /* @__PURE__ */ React.createElement(GastricUSCard, { lang, weight, age }), sec.id === "la" && /* @__PURE__ */ React.createElement(LACalc, { lang, weight, age }), sec.id === "csht" && /* @__PURE__ */ React.createElement(CSHTCalc, { lang }), sec.id === "giendo" && /* @__PURE__ */ React.createElement(GIEndoscopyCard, { lang }), sec.id === "thrombectomy" && /* @__PURE__ */ React.createElement(ThrombectomyCard, { lang }), sec.id === "neuro" && /* @__PURE__ */ React.createElement(NeuroCard, { lang, weight }), sec.id === "vascular" && /* @__PURE__ */ React.createElement(VascularCard, { lang, weight }), sec.id === "renal" && /* @__PURE__ */ React.createElement(RenalCard, { lang }), sec.id === "hepatic" && /* @__PURE__ */ React.createElement(HepaticCard, { lang }), sec.id === "immuno" && /* @__PURE__ */ React.createElement(ImmunosuppressionCard, { lang }), sec.id === "neuromuscular" && /* @__PURE__ */ React.createElement(NeuromuscularCard, { lang }), sec.id === "pregnonob" && /* @__PURE__ */ React.createElement(PregnancyNonObstetricCard, { lang }), sec.id === "tci" && /* @__PURE__ */ React.createElement(TCITab, { lang, weight, age, height, sex })));
    }));
  }));
}
const TAB_IDS = ["home", "meds", "tci", "tools", "peds", "lists", "about"];

// Line icons (drawn for Morfeas) replacing emoji in the home tiles and the bottom bar.
const LINE_ICONS = {
  home: [["path", { d: "M3.5 11 12 4l8.5 7" }], ["path", { d: "M5.5 9.5V20h13V9.5" }], ["path", { d: "M10 20v-5.5h4V20" }]],
  pill: [["rect", { x: 2.8, y: 8, width: 18.4, height: 8, rx: 4, transform: "rotate(-40 12 12)" }], ["path", { d: "M9.2 9.2l5.6 5.6", transform: "rotate(5 12 12)" }]],
  calc: [["rect", { x: 5, y: 3, width: 14, height: 18, rx: 2.5 }], ["rect", { x: 8, y: 6, width: 8, height: 3.5, rx: 0.8 }], ["path", { d: "M8.5 13h.01M12 13h.01M15.5 13h.01M8.5 16.5h.01M12 16.5h.01M15.5 16.5h.01", strokeWidth: 2.6 }]],
  child: [["circle", { cx: 12, cy: 7, r: 3.2 }], ["path", { d: "M6.5 21v-3.5a5.5 5.5 0 0 1 11 0V21" }], ["path", { d: "M10.2 6.6h.01M13.8 6.6h.01", strokeWidth: 2 }]],
  alert: [["path", { d: "M12 3.5 21.5 20h-19z" }], ["path", { d: "M12 10v4.5" }], ["path", { d: "M12 17.3h.01", strokeWidth: 2.6 }]],
  info: [["circle", { cx: 12, cy: 12, r: 9 }], ["path", { d: "M12 11v6" }], ["path", { d: "M12 7.6h.01", strokeWidth: 2.6 }]]
};
const TOOL_ICON_PATHS = {
  airway: [["path",{d:"M14.5 3.5c-2.5 0-5 1.5-6 4L7 11l-2 1.5 2 1v2.5a2.5 2.5 0 0 0 2.5 2.5H11v3"}],["path",{d:"M14.5 3.5c3.5 0 6 2.5 6 6 0 2.5-1.5 4.5-3.5 5.5V21"}],["path",{d:"M13 13v8"}]],
  chart: [["path",{d:"M4 20h16"}],["rect",{x:6,y:11,width:3,height:7,rx:.6}],["rect",{x:11,y:7,width:3,height:11,rx:.6}],["rect",{x:16,y:4,width:3,height:14,rx:.6}]],
  brain: [["path",{d:"M12 5.5a3 3 0 0 0-5.6-1.2A3 3 0 0 0 4 8a3 3 0 0 0 .3 4.9A3.2 3.2 0 0 0 7.6 18 3 3 0 0 0 12 19.5z"}],["path",{d:"M12 5.5a3 3 0 0 1 5.6-1.2A3 3 0 0 1 20 8a3 3 0 0 1-.3 4.9 3.2 3.2 0 0 1-3.3 5.1A3 3 0 0 1 12 19.5z"}],["path",{d:"M12 5.5v14"}]],
  tag: [["path",{d:"M3.5 12.5V4.5h8l9 9-8 8z"}],["circle",{cx:8,cy:9,r:1.4}]],
  drop: [["path",{d:"M12 3.5c3.5 4.5 6 7.6 6 10.5a6 6 0 0 1-12 0c0-2.9 2.5-6 6-10.5z"}]],
  heart: [["path",{d:"M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"}]],
  pregnant: [["circle",{cx:11,cy:4,r:2}],["path",{d:"M9.5 7.5c-1 1.5-1.5 3.5-1 5.5l1 3.5-1 4.5"}],["path",{d:"M11 7.5c.8 1.3 1 2.5.8 3.6 2.7.6 4.7 2.6 4.7 5 0 2-1.6 3.4-3.8 3.4"}],["path",{d:"M9.5 16.5h3"}]],
  fetus: [["circle",{cx:12,cy:12,r:8.5}],["circle",{cx:13.5,cy:9,r:2.3}],["path",{d:"M12 11.2c-2.5 1-3.5 3.2-2.8 5.3.6 1.8 2.6 2.3 4.2 1.4 1.3-.8 1.6-2.3.8-3.3"}]],
  lungs: [["path",{d:"M12 4v7"}],["path",{d:"M12 11l-2.5 2"}],["path",{d:"M12 11l2.5 2"}],["path",{d:"M9 7.5c-3 .5-5 4.5-5 9 0 2 1 3 2.5 3S9 18.5 9 17z"}],["path",{d:"M15 7.5c3 .5 5 4.5 5 9 0 2-1 3-2.5 3S15 18.5 15 17z"}]],
  clock: [["circle",{cx:12,cy:12,r:8.5}],["path",{d:"M12 7.5V12l3 2"}]],
  scope: [["rect",{x:3,y:3.5,width:7,height:5,rx:1.5}],["path",{d:"M6.5 8.5v2.5c0 3 3 4 6 4s5.5 1 5.5 3.5"}],["circle",{cx:18,cy:19.5,r:1.4}],["path",{d:"M8 6h.01",strokeWidth:2.4}]],
  vessel: [["path",{d:"M12 3v7"}],["path",{d:"M12 10c0 3-5 3.5-5 10.5"}],["path",{d:"M12 10c0 3 5 3.5 5 10.5"}]],
  kidney: [["path",{d:"M15 4c-3.5 0-6 3.5-6 8s2.5 8 6 8c2.5 0 4-2 4-4.5 0-2-1.5-2.5-1.5-3.5S19 10.5 19 8.5C19 6 17.5 4 15 4z"}],["path",{d:"M9 12H5.5"}]],
  liver: [["path",{d:"M3.5 9.5C3.5 7 5 6 7.5 6c4 0 9-1.2 11.5-.2 1.6.6 1.6 2.6.4 4.3C16.8 14 10.5 18.5 7.5 18.5 5 18.5 3.5 15.5 3.5 9.5z"}],["path",{d:"M11.5 6.3c-.5 3 .3 6.5 2.3 9"}],["path",{d:"M9 18.3c.5-1.8 1.7-3 3.2-3.6"}]],
  dna: [["path",{d:"M7 3c0 6 10 6 10 12s-10 3-10 6"}],["path",{d:"M17 3c0 6-10 6-10 12"}],["path",{d:"M17 21c0-2-2-3-4-4"}],["path",{d:"M8.5 7h7M8.5 17h7"}]],
  muscle: [["path",{d:"M3 5h7"}],["path",{d:"M10 5c2 0 3 1.5 3 3.5"}],["path",{d:"M10.5 10.5h5"}],["rect",{x:4,y:13,width:16,height:7,rx:3.5}],["path",{d:"M8 13.3v6.4M12 13v7M16 13.3v6.4"}]],
  scale: [["path",{d:"M12 4v16"}],["path",{d:"M5 7h14"}],["path",{d:"M8 20h8"}],["path",{d:"M5 7l-2.5 6a2.5 2.5 0 0 0 5 0z"}],["path",{d:"M19 7l-2.5 6a2.5 2.5 0 0 0 5 0z"}]],
  syringe: [["path",{d:"M17.5 3.5l3 3"}],["path",{d:"M19 5l-11 11"}],["path",{d:"M14.5 4.5l5 5"}],["path",{d:"M11 8l1.5 1.5M8.5 10.5L10 12"}],["path",{d:"M8 16l-1.5 1.5-3 3"}],["path",{d:"M5.5 13l5.5 5.5"}]],
  face: [["circle",{cx:12,cy:12,r:8.5}],["path",{d:"M9 9.5h.01M15 9.5h.01",strokeWidth:2.4}],["path",{d:"M8.5 16c1-1.3 2.2-2 3.5-2s2.5.7 3.5 2"}]],
  target: [["circle",{cx:12,cy:12,r:8.5}],["circle",{cx:12,cy:12,r:4.5}],["circle",{cx:12,cy:12,r:.8,fill:"currentColor"}]],
  vial: [["path",{d:"M9 3h6"}],["path",{d:"M10 3v4.5L6 18a2 2 0 0 0 1.9 2.5h8.2A2 2 0 0 0 18 18L14 7.5V3"}],["path",{d:"M8 14h8"}]],
  trend: [["path",{d:"M4 20h16M4 4v16"}],["path",{d:"M6.5 7c3 0 3.5 6 6.5 7.5S17 16 20 16"}]],
  calc: [["rect",{x:5,y:3,width:14,height:18,rx:2.5}],["rect",{x:8,y:6,width:8,height:3.5,rx:.8}],["path",{d:"M8.5 13h.01M12 13h.01M15.5 13h.01M8.5 16.5h.01M12 16.5h.01M15.5 16.5h.01",strokeWidth:2.6}]],
  flask: [["path",{d:"M9.5 3h5"}],["path",{d:"M10.5 3v6l-5 9.5A1.8 1.8 0 0 0 7.1 21h9.8a1.8 1.8 0 0 0 1.6-2.5l-5-9.5V3"}],["path",{d:"M7.5 15h9"}]],
  wind: [["path",{d:"M3.5 9h11a2.5 2.5 0 1 0-2.5-2.5"}],["path",{d:"M3.5 13h14a2.5 2.5 0 1 1-2.5 2.5"}],["path",{d:"M3.5 17h6"}]],
  moon: [["path",{d:"M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"}]],
  recycle: [["path",{d:"M20 12a8 8 0 0 1-14 5.3"}],["path",{d:"M4 12a8 8 0 0 1 14-5.3"}],["path",{d:"M18.5 3v4h-4"}],["path",{d:"M5.5 21v-4h4"}]],
  mask: [["path",{d:"M5 9c2.5-1.5 4.5-2 7-2s4.5.5 7 2v4c0 3-3.5 5-7 5s-7-2-7-5z"}],["path",{d:"M5 10.5H2.5M19 10.5h2.5"}],["path",{d:"M9 11h6M9.5 14h5"}]],
  pulse: [["path",{d:"M3 12h4l2-5 3 10 2.5-7 1.5 2h5"}]],
  wave: [["path",{d:"M4 20h16M4 4v16"}],["path",{d:"M6 18c1-9 2.5-12 4-12s2 6 4 9 4 3 6 3"}]],
  bolt: [["path",{d:"M13 3 5.5 13.5H12L10.5 21 18.5 10H12z"}]],
  pill: [["rect",{x:2.8,y:8,width:18.4,height:8,rx:4,transform:"rotate(-40 12 12)"}],["path",{d:"M9.2 9.2l5.6 5.6",transform:"rotate(5 12 12)"}]],
  clipboard: [["rect",{x:5,y:4.5,width:14,height:16.5,rx:2}],["rect",{x:9,y:3,width:6,height:3.5,rx:1}],["path",{d:"M8.5 11h7M8.5 14.5h7M8.5 18h4"}]],
  bacteria: [["rect",{x:5,y:8,width:14,height:8,rx:4,transform:"rotate(-20 12 12)"}],["path",{d:"M4 7 2.5 5.5M20 17l1.5 1.5M8 4.5 7.5 2.5M16 19.5l.5 2"}],["path",{d:"M10 12h.01M13.5 11h.01",strokeWidth:2.4}]],
  bag: [["path",{d:"M7 3.5h10v10a5 5 0 0 1-10 0z"}],["path",{d:"M7 8h10"}],["path",{d:"M12 18.5v3"}]],
  gauge: [["path",{d:"M3.5 16a8.5 8.5 0 0 1 17 0"}],["path",{d:"M12 16l4-5"}],["path",{d:"M3.5 19.5h17"}],["circle",{cx:12,cy:16,r:1}]],
  nivmask: [["path",{d:"M14.5 3.5c-2.5 0-5 1.5-6 4L7 11l-2 1.5 2 1v2.5a2.5 2.5 0 0 0 2.5 2.5H11v3"}],["path",{d:"M14.5 3.5c3.5 0 6 2.5 6 6 0 2.5-1.5 4.5-3.5 5.5V21"}],["path",{d:"M8.5 7.5 3.5 10v6l4 1.5"}],["path",{d:"M3.5 13H1.5"}]],
  pca: [["rect",{x:4,y:3.5,width:11,height:14,rx:2}],["rect",{x:6.5,y:6,width:6,height:3.5,rx:.6}],["circle",{cx:9.5,cy:13.5,r:1.6}],["path",{d:"M15 12h2.5c1.5 0 2.5 1 2.5 2.5V21"}],["path",{d:"M8 17.5V21"}]],
  pump: [["rect",{x:2.5,y:8,width:19,height:9,rx:2}],["rect",{x:5,y:10.5,width:9,height:4,rx:1}],["path",{d:"M14 12.5h3.5M17.5 11v3"}],["path",{d:"M19.5 17v3.5"}]],
  patient: [["circle",{cx:9,cy:7,r:3}],["path",{d:"M3.5 20v-1.5a5.5 5.5 0 0 1 11 0V20"}],["rect",{x:15,y:9,width:6,height:8,rx:1.2}],["path",{d:"M16.8 12h2.4M16.8 14.5h2.4"}]],
  stomach: [["path",{d:"M9 3v3.5c0 1.2-.6 2-1.6 2.7C5.6 10.4 4.5 12.2 4.5 14.5c0 3.6 3 6 7 6 4.5 0 8-3.2 8-8 0-3.3-2-5.5-4.7-5.5-1.8 0-2.8 1-3.3 2.3"}],["path",{d:"M15 3v3.5"}]],
  abxvial: [["path",{d:"M9 3.5h6"}],["path",{d:"M10 3.5v3.5h4V3.5"}],["rect",{x:8,y:7,width:8,height:13.5,rx:2}],["path",{d:"M8 11h8"}],["path",{d:"M10.5 15h3M12 13.5v3"}]],
  aorta: [["path",{d:"M6 21V11a6 6 0 0 1 12 0v4"}],["path",{d:"M9.5 21V11a2.5 2.5 0 0 1 5 0v4"}],["path",{d:"M9 6.3V3M12 5V2.5M15 6.3V3"}]],
  stroke: [["path",{d:"M12 5.5a3 3 0 0 0-5.6-1.2A3 3 0 0 0 4 8a3 3 0 0 0 .3 4.9A3.2 3.2 0 0 0 7.6 18 3 3 0 0 0 12 19.5z"}],["path",{d:"M12 5.5a3 3 0 0 1 5.6-1.2A3 3 0 0 1 20 8a3 3 0 0 1-.3 4.9 3.2 3.2 0 0 1-3.3 5.1A3 3 0 0 1 12 19.5z"}],["path",{d:"M14 10l2-1.5M14 10l-1 3 3 1.5"}],["circle",{cx:14,cy:10,r:.9,fill:"currentColor"}]],
  eye: [["path",{d:"M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"}],["circle",{cx:12,cy:12,r:3}],["circle",{cx:12,cy:12,r:.9,fill:"currentColor"}]],
  rotem: [["path",{d:"M2.5 12h4c2.5 0 3.5-5.5 7-5.5 3 0 5 2 8 2.5"}],["path",{d:"M2.5 12h4c2.5 0 3.5 5.5 7 5.5 3 0 5-2 8-2.5"}]],
  ventwave: [["path",{d:"M3 4v16h18"}],["path",{d:"M5 17h1.5l1-8h4l1 8h1.5l1-8h4l1 8"}]],
  lungsopen: [["path",{d:"M12 6v6"}],["path",{d:"M10 7.5c-2.5.5-4 3.5-4 7 0 1.5.8 2.5 2 2.5s2-1 2-2z"}],["path",{d:"M14 7.5c2.5.5 4 3.5 4 7 0 1.5-.8 2.5-2 2.5s-2-1-2-2z"}],["path",{d:"M3.5 12H1.5M22.5 12h-2M4.5 6.5 3 5M19.5 6.5 21 5M4.5 18 3 19.5M19.5 18l1.5 1.5"}]],
  heartecg: [["path",{d:"M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"}],["path",{d:"M6.5 12.5h3l1.2-2.5 2 5 1.3-2.5h3.5"}]],
  alert: [["path",{d:"M12 3.5 21.5 20h-19z"}],["path",{d:"M12 10v4.5"}],["path",{d:"M12 17.3h.01",strokeWidth:2.6}]],
  timer: [["circle",{cx:12,cy:13.5,r:7.5}],["path",{d:"M12 13.5V10M10 2.5h4M18.5 6.5l1.5-1.5"}]]
};
const TOOL_ICON_OF = { crisis:"alert", airwaysizes:"airway", scores:"chart", gcs:"eye", asaps:"patient", rotem:"rotem", cardiac:"heart", cardnc:"heartecg", obstetric:"fetus", thoracic:"lungs", neuro:"brain", thrombectomy:"stroke", giendo:"scope", vascular:"aorta", renal:"kidney", hepatic:"liver", immuno:"dna", neuromuscular:"muscle", pregnonob:"pregnant", bariatric:"scale", postop:"pca", painscales:"face", neuraxial:"target", la:"gauge", anticoag:"drop", tci:"trend", quickcalc:"calc", renalcalc:"flask", mac:"wind", vaso:"pump", sedcalc:"moon", vent:"ventwave", recruit:"lungsopen", lowflow:"recycle", niv:"nivmask", fickco:"pulse", spiro:"wave", tof:"bolt", opioid:"pill", fluids:"bag", csht:"timer", periop:"clipboard", gastricus:"stomach", abx:"abxvial" };
function LineIcon({ name, size }) {
  const parts = LINE_ICONS[name] || TOOL_ICON_PATHS[name] || [];
  return /* @__PURE__ */ React.createElement("svg", { width: size || 24, height: size || 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, parts.map(([tag, props], i) => React.createElement(tag, { key: i, ...props })));
}
const FAV_ICON = { drug: "pill", list: "alert" };
function HomeScreen({ lang, go, openFav }) {
  const el = lang === "el";
  const fav = useFavs();
  const favItems = fav.favs.map((f) => ({ f, info: favInfo(f, lang) })).filter((x) => x.info).slice(0, FAV_MAX);
  const KIND = { drug: el ? "\u03A6\u03AC\u03C1\u03BC\u03B1\u03BA\u03BF" : "Drug", list: el ? "\u039B\u03AF\u03C3\u03C4\u03B1" : "Checklist", tool: el ? "\u0395\u03C1\u03B3\u03B1\u03BB\u03B5\u03AF\u03BF" : "Tool" };
  const TILES = [
    { id: "lists", icon: "alert", el: "\u039B\u03AF\u03C3\u03C4\u03B5\u03C2 \u03BA\u03C1\u03AF\u03C3\u03B5\u03C9\u03BD", en: "Crisis checklists", subEl: CHECKLISTS_SHOWN.length + " \u03BB\u03AF\u03C3\u03C4\u03B5\u03C2 \u03B2\u03AE\u03BC\u03B1 \u03C0\u03C1\u03BF\u03C2 \u03B2\u03AE\u03BC\u03B1", subEn: CHECKLISTS_SHOWN.length + " step-by-step checklists", urgent: true },
    { id: "meds", icon: "pill", el: "\u03A6\u03AC\u03C1\u03BC\u03B1\u03BA\u03B1", en: "Drugs", subEl: DRUGS.length + " \u03C6\u03AC\u03C1\u03BC\u03B1\u03BA\u03B1, \u03B4\u03CC\u03C3\u03B5\u03B9\u03C2 \u03C3\u03C4\u03BF \u03B2\u03AC\u03C1\u03BF\u03C2", subEn: DRUGS.length + " drugs, weight-based doses" },
    { id: "tools", icon: "calc", el: "\u0395\u03C1\u03B3\u03B1\u03BB\u03B5\u03AF\u03B1", en: "Tools", subEl: TOOLS_SHOWN.length + " \u03BA\u03AC\u03C1\u03C4\u03B5\u03C2 & \u03C5\u03C0\u03BF\u03BB\u03BF\u03B3\u03B9\u03C3\u03C4\u03AD\u03C2", subEn: TOOLS_SHOWN.length + " cards & calculators" },
    { id: "peds", icon: "child", el: "\u03A0\u03B1\u03B9\u03B4\u03B9\u03B1\u03C4\u03C1\u03B9\u03BA\u03AE \u03BA\u03AC\u03C1\u03C4\u03B1", en: "Paediatric card", subEl: "\u03B1\u03B5\u03C1\u03B1\u03B3\u03C9\u03B3\u03CC\u03C2, \u03B6\u03C9\u03C4\u03B9\u03BA\u03AC, \u03B5\u03C0\u03B5\u03AF\u03B3\u03BF\u03BD\u03C4\u03B1", subEn: "airway, vitals, emergencies" },
    { id: "about", icon: "info", el: "\u03A3\u03C7\u03B5\u03C4\u03B9\u03BA\u03AC & \u03C0\u03B7\u03B3\u03AD\u03C2", en: "About & sources", subEl: "\u03BF\u03B4\u03B7\u03B3\u03AF\u03B5\u03C2, \u03B2\u03B9\u03B2\u03BB\u03B9\u03BF\u03B3\u03C1\u03B1\u03C6\u03AF\u03B1, \u03CC\u03C1\u03B9\u03B1", subEn: "guidelines, references, limits" }
  ];
  // Favourites live behind one tile that opens into a list (remembered per phone).
  const [favOpen, setFavOpen] = useState(() => storeGet("aa_favs_open") === true);
  const toggleFavOpen = () => { const v = !favOpen; setFavOpen(v); storeSet("aa_favs_open", v); };
  return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
    React.createElement("div", { style: { fontSize: 12.5, color: S.muted, fontWeight: 600, lineHeight: 1.5, marginBottom: 2 } },
      el ? "\u0394\u03B9\u03B1\u03BB\u03AD\u03BE\u03C4\u03B5 \u03B5\u03BD\u03CC\u03C4\u03B7\u03C4\u03B1, \u03AE \u03C7\u03C1\u03B7\u03C3\u03B9\u03BC\u03BF\u03C0\u03BF\u03B9\u03AE\u03C3\u03C4\u03B5 \u03C4\u03B7\u03BD \u03B1\u03BD\u03B1\u03B6\u03AE\u03C4\u03B7\u03C3\u03B7 \u03C0\u03B1\u03C1\u03B1\u03C0\u03AC\u03BD\u03C9 \u03B3\u03B9\u03B1 \u03BD\u03B1 \u03C0\u03AC\u03C4\u03B5 \u03BA\u03B1\u03C4\u03B5\u03C5\u03B8\u03B5\u03AF\u03B1\u03BD \u03C3\u03B5 \u03C6\u03AC\u03C1\u03BC\u03B1\u03BA\u03BF, \u03B4\u03CC\u03C3\u03B7 \u03AE \u03BB\u03AF\u03C3\u03C4\u03B1." : "Pick a section, or use the search box above to jump straight to a drug, dose or checklist."),
    React.createElement("div", { style: { background: S.card, border: "1px solid " + (favOpen ? S.amber : S.line), borderRadius: 14, overflow: "hidden" } },
      React.createElement("button", { onClick: toggleFavOpen, "aria-expanded": favOpen ? "true" : "false",
        style: { display: "flex", alignItems: "center", gap: 14, textAlign: "left", width: "100%", background: "none", color: S.ink, border: "none", padding: "14px 16px", cursor: "pointer", fontFamily: "inherit" } },
        React.createElement("span", { style: { width: 44, height: 44, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: S.tintWarn, color: S.amber, fontSize: 24, lineHeight: 1 } }, "\u2605"),
        React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 } },
          React.createElement("span", { style: { fontWeight: 800, fontSize: 15.5 } }, (el ? "\u0391\u03B3\u03B1\u03C0\u03B7\u03BC\u03AD\u03BD\u03B1" : "Favourites") + " (" + favItems.length + ")"),
          React.createElement("span", { style: { fontSize: 12.5, color: S.muted, fontWeight: 600 } }, el ? "\u03C6\u03AC\u03C1\u03BC\u03B1\u03BA\u03B1, \u03BB\u03AF\u03C3\u03C4\u03B5\u03C2, \u03B5\u03C1\u03B3\u03B1\u03BB\u03B5\u03AF\u03B1" : "drugs, checklists, tools")),
        React.createElement("span", { style: { fontSize: 18, color: S.muted, fontWeight: 700, transform: favOpen ? "rotate(90deg)" : "none", transition: "transform .15s" } }, "\u203A")),
      favOpen && (favItems.length > 0
        ? React.createElement("div", { style: { display: "flex", flexDirection: "column", borderTop: "1px solid " + S.line } },
          favItems.map(({ f, info }, n) => React.createElement("button", {
            key: f.k + ":" + f.id, onClick: () => openFav({ tab: info.tab, target: f.id, title: info.title, kind: info.kind }),
            style: { display: "flex", alignItems: "center", gap: 12, textAlign: "left", width: "100%", background: "none", color: S.ink, border: "none", borderTop: n ? "1px solid " + S.line : "none", padding: "10px 16px", cursor: "pointer", fontFamily: "inherit", minHeight: 52 } },
            React.createElement("span", { style: { width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: f.k === "list" ? S.tintDanger : S.tintSelected, color: f.k === "list" ? (info.color || S.red) : S.teal } }, React.createElement(LineIcon, { name: f.k === "tool" ? (TOOL_ICON_OF[f.id] || "calc") : FAV_ICON[f.k], size: 19 })),
            React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: 1, flex: 1, minWidth: 0 } },
              React.createElement("span", { style: { fontWeight: 700, fontSize: 15, overflowWrap: "anywhere" } }, info.title),
              React.createElement("span", { style: { fontSize: 12, color: S.muted, fontWeight: 600 } }, KIND[f.k])),
            React.createElement(FavStar, { k: f.k, id: f.id, lang, fav }),
            React.createElement("span", { style: { fontSize: 18, color: S.muted, fontWeight: 700 } }, "\u203A"))))
        : React.createElement("div", { style: { fontSize: 13, color: S.muted, fontWeight: 600, lineHeight: 1.45, borderTop: "1px solid " + S.line, padding: "12px 16px" } },
          el ? "\u2606 \u03A0\u03B1\u03C4\u03AE\u03C3\u03C4\u03B5 \u03C4\u03BF \u03B1\u03C3\u03C4\u03AD\u03C1\u03B9 \u03C3\u03B5 \u03AD\u03BD\u03B1 \u03C6\u03AC\u03C1\u03BC\u03B1\u03BA\u03BF, \u03BC\u03B9\u03B1 \u03BB\u03AF\u03C3\u03C4\u03B1 \u03AE \u03AD\u03BD\u03B1 \u03B5\u03C1\u03B3\u03B1\u03BB\u03B5\u03AF\u03BF \u03BA\u03B1\u03B9 \u03B8\u03B1 \u03B5\u03BC\u03C6\u03B1\u03BD\u03AF\u03B6\u03B5\u03C4\u03B1\u03B9 \u03B5\u03B4\u03CE." : "\u2606 Tap the star on a drug, a checklist or a tool and it will appear here."))),
    TILES.filter((x) => TAB_IDS.indexOf(x.id) >= 0).map((x) => React.createElement("button", {
      key: x.id, onClick: () => go(x.id),
      style: { display: "flex", alignItems: "center", gap: 14, textAlign: "left", width: "100%",
        background: x.urgent ? S.tintDanger : S.card, color: x.urgent ? S.tintDangerFg : S.ink,
        border: "1px solid " + (x.urgent ? S.red : S.line), borderRadius: 14, padding: "14px 16px",
        cursor: "pointer", fontFamily: "inherit" } },
      React.createElement("span", { style: { width: 44, height: 44, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: x.urgent ? S.card : S.tintSelected, color: x.urgent ? S.red : S.teal } }, React.createElement(LineIcon, { name: x.icon, size: 26 })),
      React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: 2, flex: 1 } },
        React.createElement("span", { style: { fontWeight: 800, fontSize: 15.5 } }, el ? x.el : x.en),
        React.createElement("span", { style: { fontSize: 12.5, color: x.urgent ? S.tintDangerFg : S.muted, fontWeight: 600 } }, el ? x.subEl : x.subEn)),
      React.createElement("span", { style: { fontSize: 18, color: S.muted, fontWeight: 700 } }, "\u203A"))));
}
// Recent chips store the title in the language active when they were used;
// look it up again so they follow a language switch.
function recentTitle(r, lang) {
  const el = lang === "el";
  try {
    if (r.kind === "tool") { const s = TOOL_SECTIONS.find((x) => x.id === r.target); if (s) return el ? s.el : s.en; }
    if (r.kind === "list") { const c = CHECKLISTS.find((x) => x.id === r.target); if (c) return el ? c.titleEl : c.titleEn; }
  } catch (e) {}
  return r.title;
}
// Bump when the acceptance text changes: everyone sees the notice again once.
const TERMS_VERSION = 2;
function AnesthesiaAssistant() {
  const [lang, setLang] = useState(() => storeGet("aa_lang") || "el");
  // Metronome click tracks: read once at start so they are ready before any crisis screen opens.
  useEffect(() => { try { metroPrefetch(); } catch (e) {} }, []);
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
  const [tab, setTab] = useState("home");
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
  const [accepted, setAccepted] = useState(() => storeGet("aa_disclaimer_ok") === TERMS_VERSION);
  // What's new: shown once after an update. A first-time user (not yet
  // accepted) gets nothing; their version is recorded on acceptance.
  const [whatsNew, setWhatsNew] = useState(() => {
    if (storeGet("aa_disclaimer_ok") !== TERMS_VERSION) return null;
    const seen = Number(storeGet("aa_seen_ver")) || 276;
    if (seen >= APP_VERSION) return null;
    const items = CHANGELOG.filter((c) => c.v > seen).slice(0, 3);
    return items.length ? items : null;
  });
  const dismissWhatsNew = () => { storeSet("aa_seen_ver", APP_VERSION); setWhatsNew(null); };
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
  // Implausible patient values are not passed on: no tab calculates with them.
  const chk = patientCheck(weight, age, height);
  const wSafe = chk.w ? "" : weight, aSafe = chk.a ? "" : age, hSafe = chk.h ? "" : height;
  // Text size: the whole screen (not the bottom bar) is scaled with CSS zoom.
  const FS_LEVELS = [1, 1.15, 1.3];
  const [fs, setFs] = useState(() => { const v = Number(storeGet("aa_fontscale")); return FS_LEVELS.indexOf(v) >= 0 ? v : 1; });
  useEffect(() => { storeSet("aa_fontscale", fs); }, [fs]);
  const fsStep = (d) => { const i = FS_LEVELS.indexOf(fs) + d; if (i >= 0 && i < FS_LEVELS.length) setFs(FS_LEVELS[i]); };
  // Screen readers pronounce the page in its declared language.
  useEffect(() => { try { document.documentElement.lang = lang; } catch (e) {} }, [lang]);
  const tabs = [
    { id: "home", icon: "home" },
    { id: "meds", icon: "pill" },
    { id: "tools", icon: "calc" },
    { id: "peds", icon: "child" },
    { id: "lists", icon: "alert" }
  ];
  if (!accepted) {
    return /* @__PURE__ */ React.createElement("div", { style: {
      fontFamily: "'Morfeas Sans', -apple-system, system-ui, 'Segoe UI', sans-serif",
      background: S.bg,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 20px",
      maxWidth: 560,
      margin: "0 auto"
    } }, /* @__PURE__ */ React.createElement("img", { src: LOGO_DATA, alt: "", style: { width: 84, height: 84, borderRadius: 20, marginBottom: 16 } }), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 900, fontSize: 20, color: S.ink, textAlign: "center", marginBottom: 4 } }, "Morfeas"), /* @__PURE__ */ React.createElement("div", { style: { background: S.card, borderRadius: 16, padding: "18px 18px", border: `1.5px solid ${S.line}`, marginTop: 16, boxShadow: "0 2px 10px rgba(20,37,63,.06)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 15, color: S.red, marginBottom: 8 } }, lang === "el" ? "\u26A0 \u03A3\u03B7\u03BC\u03B1\u03BD\u03C4\u03B9\u03BA\u03AE \u03C0\u03C1\u03BF\u03B5\u03B9\u03B4\u03BF\u03C0\u03BF\u03AF\u03B7\u03C3\u03B7" : "\u26A0 Important notice"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: S.ink, lineHeight: 1.6 } }, lang === "el" ? /* @__PURE__ */ React.createElement(React.Fragment, null, "\u03A4\u03BF \u03B5\u03C1\u03B3\u03B1\u03BB\u03B5\u03AF\u03BF \u03B1\u03C5\u03C4\u03CC \u03C0\u03C1\u03BF\u03BF\u03C1\u03AF\u03B6\u03B5\u03C4\u03B1\u03B9 ", /* @__PURE__ */ React.createElement("strong", null, "\u03B1\u03C0\u03BF\u03BA\u03BB\u03B5\u03B9\u03C3\u03C4\u03B9\u03BA\u03AC \u03B3\u03B9\u03B1 \u03B5\u03BE\u03B5\u03B9\u03B4\u03B9\u03BA\u03B5\u03C5\u03BC\u03AD\u03BD\u03BF\u03C5\u03C2 \u03B5\u03C0\u03B1\u03B3\u03B3\u03B5\u03BB\u03BC\u03B1\u03C4\u03AF\u03B5\u03C2 \u03C5\u03B3\u03B5\u03AF\u03B1\u03C2"), " \u03C9\u03C2 \u03B5\u03BA\u03C0\u03B1\u03B9\u03B4\u03B5\u03C5\u03C4\u03B9\u03BA\u03CC \u03BA\u03B1\u03B9 \u03B5\u03BD\u03B7\u03BC\u03B5\u03C1\u03C9\u03C4\u03B9\u03BA\u03CC \u03B2\u03BF\u03AE\u03B8\u03B7\u03BC\u03B1. \u0394\u03B5\u03BD \u03C0\u03C1\u03BF\u03BF\u03C1\u03AF\u03B6\u03B5\u03C4\u03B1\u03B9 \u03B3\u03B9\u03B1 \u03B4\u03B9\u03AC\u03B3\u03BD\u03C9\u03C3\u03B7 \u03AE \u03B8\u03B5\u03C1\u03B1\u03C0\u03B5\u03AF\u03B1.", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("strong", null, "\u0394\u03B5\u03BD \u03C5\u03C0\u03BF\u03BA\u03B1\u03B8\u03B9\u03C3\u03C4\u03AC \u03C4\u03B7\u03BD \u03BA\u03BB\u03B9\u03BD\u03B9\u03BA\u03AE \u03BA\u03C1\u03AF\u03C3\u03B7."), " \u038C\u03BB\u03B5\u03C2 \u03BF\u03B9 \u03B4\u03CC\u03C3\u03B5\u03B9\u03C2, \u03BF\u03B9 \u03C5\u03C0\u03BF\u03BB\u03BF\u03B3\u03B9\u03C3\u03BC\u03BF\u03AF \u03BA\u03B1\u03B9 \u03BF\u03B9 \u03C0\u03BB\u03B7\u03C1\u03BF\u03C6\u03BF\u03C1\u03AF\u03B5\u03C2 \u03C0\u03C1\u03AD\u03C0\u03B5\u03B9 \u03BD\u03B1 ", /* @__PURE__ */ React.createElement("strong", null, "\u03B5\u03C0\u03B1\u03BB\u03B7\u03B8\u03B5\u03CD\u03BF\u03BD\u03C4\u03B1\u03B9 \u03B1\u03BD\u03B5\u03BE\u03AC\u03C1\u03C4\u03B7\u03C4\u03B1"), " \u03BC\u03B5 \u03AD\u03B3\u03BA\u03C5\u03C1\u03B5\u03C2 \u03C0\u03B7\u03B3\u03AD\u03C2 \u03BA\u03B1\u03B9 \u03C4\u03B1 \u03C4\u03BF\u03C0\u03B9\u03BA\u03AC \u03C0\u03C1\u03C9\u03C4\u03CC\u03BA\u03BF\u03BB\u03BB\u03B1 \u03C0\u03C1\u03B9\u03BD \u03B1\u03C0\u03CC \u03BA\u03AC\u03B8\u03B5 \u03B5\u03C6\u03B1\u03C1\u03BC\u03BF\u03B3\u03AE \u03C3\u03B5 \u03B1\u03C3\u03B8\u03B5\u03BD\u03AE.", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("br", null), "\u0394\u0395\u039D \u03C0\u03C1\u03BF\u03BF\u03C1\u03AF\u03B6\u03B5\u03C4\u03B1\u03B9 \u03B3\u03B9\u03B1 \u03C4\u03B7 \u03B4\u03B9\u03AC\u03B3\u03BD\u03C9\u03C3\u03B7 \u03B9\u03B1\u03C4\u03C1\u03B9\u03BA\u03CE\u03BD \u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03AC\u03C3\u03B5\u03C9\u03BD, \u03BF\u03CD\u03C4\u03B5 \u03C5\u03C0\u03BF\u03BA\u03B1\u03B8\u03B9\u03C3\u03C4\u03AC \u03C4\u03B7\u03BD \u03B9\u03B1\u03C4\u03C1\u03B9\u03BA\u03AE \u03B3\u03BD\u03CE\u03BC\u03B7 \u03B5\u03B9\u03B4\u03B9\u03BA\u03B5\u03C5\u03BC\u03AD\u03BD\u03BF\u03C5 \u03B9\u03B1\u03C4\u03C1\u03BF\u03CD. \u0394\u03B9\u03B1\u03C4\u03AF\u03B8\u03B5\u03C4\u03B1\u03B9 \u03B4\u03C9\u03C1\u03B5\u03AC\u03BD \u03BA\u03B1\u03B9 \u03C3\u03C4\u03B7\u03BD \u03BA\u03B1\u03C4\u03AC\u03C3\u03C4\u03B1\u03C3\u03B7 \u03C0\u03BF\u03C5 \u03B2\u03C1\u03AF\u03C3\u03BA\u03B5\u03C4\u03B1\u03B9, \u03C7\u03C9\u03C1\u03AF\u03C2 \u03BA\u03B1\u03BC\u03AF\u03B1 \u03B4\u03AD\u03C3\u03BC\u03B5\u03C5\u03C3\u03B7 \u03B3\u03B9\u03B1 \u03C4\u03B7\u03BD \u03BF\u03C1\u03B8\u03CC\u03C4\u03B7\u03C4\u03B1 \u03C4\u03BF\u03C5 \u03C0\u03B5\u03C1\u03B9\u03B5\u03C7\u03BF\u03BC\u03AD\u03BD\u03BF\u03C5 \u2014 \u03B5\u03BD\u03B4\u03AD\u03C7\u03B5\u03C4\u03B1\u03B9 \u03BD\u03B1 \u03C0\u03B5\u03C1\u03B9\u03AD\u03C7\u03B5\u03B9 \u03C3\u03C6\u03AC\u03BB\u03BC\u03B1\u03C4\u03B1. \u0397 \u03B5\u03C5\u03B8\u03CD\u03BD\u03B7 \u03BA\u03AC\u03B8\u03B5 \u03BA\u03BB\u03B9\u03BD\u03B9\u03BA\u03AE\u03C2 \u03B1\u03C0\u03CC\u03C6\u03B1\u03C3\u03B7\u03C2 \u03C0\u03B1\u03C1\u03B1\u03BC\u03AD\u03BD\u03B5\u03B9 \u03C3\u03C4\u03BF\u03BD \u03B8\u03B5\u03C1\u03AC\u03C0\u03BF\u03BD\u03C4\u03B1 \u03B9\u03B1\u03C4\u03C1\u03CC.", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: S.muted, fontWeight: 600, fontSize: 12 } }, "\u039C\u03B7\u03BD \u03B5\u03B9\u03C3\u03AC\u03B3\u03B5\u03C4\u03B5 \u03B1\u03BD\u03B1\u03B3\u03BD\u03C9\u03C1\u03AF\u03C3\u03B9\u03BC\u03B1 \u03C3\u03C4\u03BF\u03B9\u03C7\u03B5\u03AF\u03B1 \u03B1\u03C3\u03B8\u03B5\u03BD\u03CE\u03BD (\u03BF\u03BD\u03CC\u03BC\u03B1\u03C4\u03B1, \u0391\u039C\u039A\u0391).")) : /* @__PURE__ */ React.createElement(React.Fragment, null, "This tool is intended ", /* @__PURE__ */ React.createElement("strong", null, "solely for qualified healthcare professionals"), " as an educational and informational aid. It is not intended for diagnosis or treatment.", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("strong", null, "It does not replace clinical judgement."), " All doses, calculations and information must be ", /* @__PURE__ */ React.createElement("strong", null, "independently verified"), " against authoritative sources and local protocols before any application to a patient.", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("br", null), "It is NOT intended for the diagnosis of medical conditions, nor as a substitute for medical advice provided by board-certified physicians. It is provided free of charge and as is, with no assurance as to the accuracy of its content \u2014 it may contain errors. Responsibility for every clinical decision remains with the treating clinician.", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: S.muted, fontWeight: 600, fontSize: 12 } }, "Do not enter identifiable patient data (names, IDs)."))), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setAccepted(true);
          storeSet("aa_disclaimer_ok", TERMS_VERSION);
          storeSet("aa_seen_ver", APP_VERSION);
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
    fontFamily: "'Morfeas Sans', -apple-system, system-ui, 'Segoe UI', sans-serif",
    background: S.bg,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    maxWidth: 560,
    margin: "0 auto"
  } }, whatsNew && React.createElement("div", { role: "dialog", "aria-modal": "true", style: {
    position: "fixed", left: 0, right: 0, top: 0, bottom: 0, zIndex: 9999,
    background: "rgba(10,20,30,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18
  } }, React.createElement("div", { style: {
    background: S.card, color: S.ink, borderRadius: 18, padding: "20px 18px", maxWidth: 420, width: "100%",
    maxHeight: "80vh", overflowY: "auto", boxShadow: "0 12px 40px rgba(0,0,0,.35)",
    fontFamily: "'Morfeas Sans', -apple-system, system-ui, 'Segoe UI', sans-serif"
  } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 18, marginBottom: 10 } },
    "\u2728 " + (lang === "el" ? "\u03A4\u03B9 \u03BD\u03AD\u03BF \u03C5\u03C0\u03AC\u03C1\u03C7\u03B5\u03B9" : "What\u2019s new")),
    whatsNew.map((c) => React.createElement("div", { key: c.v, style: { marginBottom: 10 } },
      React.createElement("ul", { style: { margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.5 } },
        (lang === "el" ? c.el : c.en).map((x, i) => React.createElement("li", { key: i }, x))))),
    React.createElement("button", { onClick: dismissWhatsNew, style: {
      width: "100%", marginTop: 8, padding: "12px", borderRadius: 12, border: "none", background: S.teal,
      color: S.onAccent, fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit"
    } }, lang === "el" ? "\u0395\u03BD\u03C4\u03AC\u03BE\u03B5\u03B9" : "Got it"))), /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 16px 10px", display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 9 } }, /* @__PURE__ */ React.createElement("img", { src: LOGO_DATA, alt: "", style: { width: 30, height: 30, borderRadius: 8, flexShrink: 0, boxShadow: "0 1px 4px rgba(20,37,63,.15)" } }), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 900, fontSize: 16.5, color: S.ink, letterSpacing: -0.3, lineHeight: 1.2 } }, "Morfeas")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setLang(lang === "el" ? "en" : "el"), style: {
    padding: "5px 12px",
    minHeight: 44,
    minWidth: 44,
    borderRadius: 99,
    border: `1.5px solid ${S.line}`,
    background: S.card,
    fontWeight: 700,
    fontSize: 13,
    color: S.teal,
    cursor: "pointer",
    fontFamily: "inherit"
  } }, lang === "el" ? "EN" : "\u0395\u039B"), /* @__PURE__ */ React.createElement("button", { onClick: cycleTheme, title: themeLabel, "aria-label": themeLabel, style: { padding: "6px 10px", minWidth: 44, minHeight: 44, borderRadius: 10, border: `1.5px solid ${S.line}`, background: S.card, fontWeight: 700, fontSize: 13, color: S.teal, cursor: "pointer", fontFamily: "inherit", marginLeft: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 44, minHeight: 44 } }, /* @__PURE__ */ React.createElement(ThemeGlyph, { mode: theme })), React.createElement("button", { onClick: () => fsStep(-1), disabled: fs <= FS_LEVELS[0], "aria-label": lang === "el" ? "\u039C\u03B9\u03BA\u03C1\u03CC\u03C4\u03B5\u03C1\u03B1 \u03B3\u03C1\u03AC\u03BC\u03BC\u03B1\u03C4\u03B1" : "Smaller text", title: lang === "el" ? "\u039C\u03B9\u03BA\u03C1\u03CC\u03C4\u03B5\u03C1\u03B1 \u03B3\u03C1\u03AC\u03BC\u03BC\u03B1\u03C4\u03B1" : "Smaller text", style: { padding: "0 8px", minWidth: 44, minHeight: 44, borderRadius: 10, border: `1.5px solid ${S.line}`, background: S.card, fontWeight: 800, fontSize: 12, color: S.teal, cursor: "pointer", fontFamily: "inherit", marginLeft: 6, minWidth: 44, minHeight: 44, opacity: fs <= FS_LEVELS[0] ? 0.4 : 1 } }, "A\u2212"), React.createElement("button", { onClick: () => fsStep(1), disabled: fs >= FS_LEVELS[FS_LEVELS.length - 1], "aria-label": lang === "el" ? "\u039C\u03B5\u03B3\u03B1\u03BB\u03CD\u03C4\u03B5\u03C1\u03B1 \u03B3\u03C1\u03AC\u03BC\u03BC\u03B1\u03C4\u03B1" : "Larger text", title: lang === "el" ? "\u039C\u03B5\u03B3\u03B1\u03BB\u03CD\u03C4\u03B5\u03C1\u03B1 \u03B3\u03C1\u03AC\u03BC\u03BC\u03B1\u03C4\u03B1" : "Larger text", style: { padding: "0 8px", minWidth: 44, minHeight: 44, borderRadius: 10, border: `1.5px solid ${S.line}`, background: S.card, fontWeight: 800, fontSize: 15, color: S.teal, cursor: "pointer", fontFamily: "inherit", marginLeft: 6, minWidth: 44, minHeight: 44, opacity: fs >= FS_LEVELS[FS_LEVELS.length - 1] ? 0.4 : 1 } }, "A+"))), /* @__PURE__ */ React.createElement("div", { style: { zoom: fs } }, /* @__PURE__ */ React.createElement(PatientBar, { lang, weight, setWeight, age, setAge, height, setHeight, sex, setSex }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, padding: "4px 16px 16px", overflowY: "auto", zoom: fs } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, background: S.card, border: `1.5px solid ${gq ? S.teal : S.line}`, borderRadius: 12, padding: "0 10px", marginBottom: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, opacity: 0.55 } }, "\u{1F50D}"), /* @__PURE__ */ React.createElement("input", { value: gq, onChange: (e) => setGq(e.target.value), placeholder: lang === "el" ? "\u0391\u03BD\u03B1\u03B6\u03AE\u03C4\u03B7\u03C3\u03B7 \u03C6\u03B1\u03C1\u03BC\u03AC\u03BA\u03C9\u03BD, \u03B5\u03C0\u03B5\u03B9\u03B3\u03CC\u03BD\u03C4\u03C9\u03BD, \u03B5\u03C1\u03B3\u03B1\u03BB\u03B5\u03AF\u03C9\u03BD\u2026" : "Search drugs, emergencies, tools\u2026", style: { flex: 1, border: "none", outline: "none", background: "transparent", padding: "11px 0", fontSize: 14.5, fontFamily: "inherit", color: S.ink, minWidth: 0 } }), gq && /* @__PURE__ */ React.createElement("button", { onClick: () => setGq(""), "aria-label": lang === "el" ? "\u039A\u03B1\u03B8\u03B1\u03C1\u03B9\u03C3\u03BC\u03CC\u03C2 \u03B1\u03BD\u03B1\u03B6\u03AE\u03C4\u03B7\u03C3\u03B7\u03C2" : "Clear search", style: { border: "none", background: "none", color: S.muted, fontWeight: 700, fontSize: 18, cursor: "pointer", fontFamily: "inherit", padding: "0 2px" } }, "\xD7")), recents.length > 0 && gq.trim().length < 2 && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: S.muted, padding: "0 2px 5px" } }, "\u{1F551} " + (lang === "el" ? "\u03A0\u03C1\u03CC\u03C3\u03C6\u03B1\u03C4\u03B1" : "Recent")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 } }, recents.map((r, i) => /* @__PURE__ */ React.createElement("button", { key: r.tab + r.target + i, onClick: () => jumpTo(r), style: { flexShrink: 0, maxWidth: 190, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", background: S.card, border: `1.5px solid ${S.line}`, borderRadius: 20, padding: "6px 12px", fontSize: 12.5, fontWeight: 700, color: S.ink, cursor: "pointer", fontFamily: "inherit" } }, recentTitle(r, lang))))), gq.trim().length >= 2 ? /* @__PURE__ */ React.createElement(SearchResults, { lang, query: gq, onPick: pickResult }) : /* @__PURE__ */ React.createElement(React.Fragment, null, tab === "home" && /* @__PURE__ */ React.createElement(HomeScreen, { lang, go: setTab, openFav: jumpTo }), tab === "meds" && /* @__PURE__ */ React.createElement(MedsTab, { lang, weight: CALC_MODE === "reference" ? "" : wSafe, height: hSafe, sex, age: aSafe, focus, wBad: chk.w }), tab === "tools" && /* @__PURE__ */ React.createElement(ToolsTab, { lang, weight: CALC_MODE === "reference" ? "" : wSafe, age: aSafe, height: hSafe, sex, focus, onUse: (sec) => remember({ tab: "tools", target: sec.id, title: sec[lang], kind: "tool" }) }), tab === "peds" && /* @__PURE__ */ React.createElement(PedsCard, { lang, weight: wSafe, age: aSafe, height: hSafe, sex, wBad: chk.w }), tab === "lists" && /* @__PURE__ */ React.createElement(ChecklistTab, { lang, focus }), tab === "about" && /* @__PURE__ */ React.createElement(AboutCard, { lang }))), /* @__PURE__ */ React.createElement("div", { style: { padding: "2px 16px 6px", fontSize: 10, color: S.muted, fontWeight: 600, lineHeight: 1.4, textAlign: "center" } }, lang === "el" ? "\u0395\u03BA\u03C0\u03B1\u03B9\u03B4\u03B5\u03C5\u03C4\u03B9\u03BA\u03CC \u03B2\u03BF\u03AE\u03B8\u03B7\u03BC\u03B1 \u00B7 \u0395\u03C0\u03B1\u03BB\u03B7\u03B8\u03B5\u03CD\u03C3\u03C4\u03B5 \u03BA\u03AC\u03B8\u03B5 \u03B4\u03CC\u03C3\u03B7 \u03C0\u03C1\u03B9\u03BD \u03C4\u03B7 \u03C7\u03BF\u03C1\u03AE\u03B3\u03B7\u03C3\u03B7" : "Educational aid · Verify every dose before administration", CALC_MODE === "full" ? "" : CALC_MODE === "simple" ? (lang === "el" ? " \u00B7 \u03BB\u03B5\u03B9\u03C4\u03BF\u03C5\u03C1\u03B3\u03AF\u03B1 \u03B1\u03C0\u03BB\u03CE\u03BD \u03C5\u03C0\u03BF\u03BB\u03BF\u03B3\u03B9\u03C3\u03BC\u03CE\u03BD" : " · simple-calculation mode") : (lang === "el" ? " \u00B7 \u03BB\u03B5\u03B9\u03C4\u03BF\u03C5\u03C1\u03B3\u03AF\u03B1 \u03B1\u03BD\u03B1\u03C6\u03BF\u03C1\u03AC\u03C2 (\u03C7\u03C9\u03C1\u03AF\u03C2 \u03C5\u03C0\u03BF\u03BB\u03BF\u03B3\u03B9\u03C3\u03BC\u03BF\u03CD\u03C2 \u03C3\u03C4\u03BF \u03B2\u03AC\u03C1\u03BF\u03C2)" : " · reference mode (no weight-based calculations)"), " \xB7 \xA9 ", (/* @__PURE__ */ new Date()).getFullYear(), " Efstathia Pistioli, MD"), /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    background: "#1D3D6B",
    position: "sticky",
    bottom: 0,
    padding: "6px 4px calc(8px + env(safe-area-inset-bottom, 0px))"
  } }, tabs.map((tb) => /* @__PURE__ */ React.createElement("button", { key: tb.id, onClick: () => setTab(tb.id), "aria-label": t.tabs[tb.id], "aria-current": tab === tb.id ? "page" : void 0, title: t.tabs[tb.id], style: {
    flex: 1,
    padding: "4px 1px 0",
    border: "none",
    background: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    fontFamily: "inherit",
    minWidth: 0,
    color: tab === tb.id ? "#FFFFFF" : "#B9C8DC"
  } }, /* @__PURE__ */ React.createElement(LineIcon, { name: tb.icon, size: 24 }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: tab === tb.id ? 800 : 600, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" } }, t.tabs[tb.id]), /* @__PURE__ */ React.createElement(PoppyMark, { on: tab === tb.id })))));
}

// Small drawn poppy marking the active tab (echoes the poppies of the app icon).
// Theme button icon drawn as SVG (the text glyph for "auto" rendered clipped on some phones).
function ThemeGlyph({ mode }) {
  const c = S.teal;
  const p = { width: 18, height: 18, viewBox: "0 0 24 24", "aria-hidden": "true" };
  if (mode === "light") return /* @__PURE__ */ React.createElement("svg", p, /* @__PURE__ */ React.createElement("circle", { cx: 12, cy: 12, r: 4.5, fill: c }), [0, 45, 90, 135, 180, 225, 270, 315].map((a) => /* @__PURE__ */ React.createElement("line", { key: a, x1: 12, y1: 2.5, x2: 12, y2: 5.5, stroke: c, strokeWidth: 2, strokeLinecap: "round", transform: "rotate(" + a + " 12 12)" })));
  if (mode === "dark") return /* @__PURE__ */ React.createElement("svg", p, /* @__PURE__ */ React.createElement("path", { d: "M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z", fill: c }));
  return /* @__PURE__ */ React.createElement("svg", p, /* @__PURE__ */ React.createElement("circle", { cx: 12, cy: 12, r: 8.5, fill: "none", stroke: c, strokeWidth: 2 }), /* @__PURE__ */ React.createElement("path", { d: "M12 3.5a8.5 8.5 0 0 1 0 17z", fill: c }));
}
function PoppyMark({ on }) {
  return /* @__PURE__ */ React.createElement("svg", { width: 10, height: 10, viewBox: "-10 -10 20 20", "aria-hidden": "true", style: { visibility: on ? "visible" : "hidden", marginTop: 1 } },
    /* @__PURE__ */ React.createElement("g", { fill: "#D93A2E" },
      /* @__PURE__ */ React.createElement("ellipse", { cx: 0, cy: -4.2, rx: 4.6, ry: 4.4 }),
      /* @__PURE__ */ React.createElement("ellipse", { cx: 4.2, cy: 0, rx: 4.4, ry: 4.6 }),
      /* @__PURE__ */ React.createElement("ellipse", { cx: 0, cy: 4.2, rx: 4.6, ry: 4.4 }),
      /* @__PURE__ */ React.createElement("ellipse", { cx: -4.2, cy: 0, rx: 4.4, ry: 4.6 })),
    /* @__PURE__ */ React.createElement("circle", { r: 2.3, fill: "#1A1A1A" }));
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
      fontFamily: "'Morfeas Sans', -apple-system, system-ui, 'Segoe UI', sans-serif",
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
