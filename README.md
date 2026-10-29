# Morfeas — Anesthesia Assistant

Bilingual (Greek/English) clinical reference PWA for anaesthesia: drug doses,
TCI, scores, ventilation, emergency checklists, paediatrics.
Live at <https://lilia33t.github.io/Morfeas/>. Works offline once it has been
opened online.

© 2026 Efstathia Pistioli, MD. All rights reserved (see `LICENSE`).

## Structure

| File | Contents |
|---|---|
| `index.html` | App shell, boot screen, service-worker registration, update banner |
| `sw.js` | Service worker — offline cache (see *Offline* below) |
| `manifest.webmanifest` | PWA manifest (name, icons, colours) |
| `src/data.js` | `APP_VERSION`, release notes, drug database, emergency checklists |
| `src/formulas.js` | BMI/IBW/ABW/LBM/FFM, TCI models, colour palette, translations |
| `src/primitives.js` | Shared UI components, risk scores, LA and anticoagulant tables |
| `src/tabs.js` | Clinical cards, guidelines, References card |
| `src/root.js` | Tool registry, app shell, search |
| `tests/run-tests.js` | Unit tests — run before every deploy |
| `tests/audit-check.js` | Checks the audit registry against the code |
| `tests/package-check.js` | Every needed file is present (folder, and optionally a zip) |
| `tests/ui-360.mjs` | Playwright screen test at 360 px, 100% and 130% text size |
| `audit/audit-registry.json` | One entry per card/checklist/drug: status, versions, unverified points |
| `audit/AUDIT.md` | Human-readable report generated from the registry |
| `audit/CALC-MODES.md` | Calculation modes |
| `fonts/`, `icons/` | Self-hosted typeface and app icons |

The source files are plain classic scripts (no bundler, no ES modules), loaded
in the order shown in `index.html`; the order matters. Greek text is stored as
`\uXXXX` escapes.

## Offline

`sw.js` keeps one cache per version, named `anesthesia-v<N>`.

- **Opening the app** serves the stored copy at once, without waiting for the
  network. A weak signal no longer makes it hang, and a hospital Wi-Fi login
  page can no longer replace the app.
- **Other files** are served from the current version's cache first, then the
  network.
- **Updates:** the browser checks `sw.js` when the app is opened or brought to
  the foreground, and hourly. A changed `CACHE` name installs the new version
  in full and shows the "New version — tap to refresh" banner. Files are never
  updated one by one, so versions cannot mix.
- **Incomplete downloads:** if an update cannot fetch every file, the install is
  refused and the previous version keeps working offline; the browser tries
  again later.
- **React** (18.3.1 UMD) loads from cdnjs with SRI hashes. If the CDN does not
  answer during an update, the identical copy held by the previous version is
  reused. Self-hosting these two files would remove the CDN dependency
  entirely (open item).

**If `sw.js` is not uploaded, phones never see the new version** — they keep the
old cache. After deploying, <https://lilia33t.github.io/Morfeas/sw.js> must
show the new `anesthesia-v<N>`.

On iPhone, the home-screen app and Safari keep separate copies: open the app
from its icon once while online after each update.

## Releasing a version

1. Make the change, with its source written on the changed line (see
   *Conventions*).
2. Set `APP_VERSION` in `src/data.js` and `CACHE` in `sw.js` to the same number
   (`anesthesia-v<N>`); a test enforces this.
3. Add a release-notes entry (Greek and English) at the top of `CHANGELOG` in
   `src/data.js`.
4. Add one test for the change in `tests/run-tests.js`.
5. Update `audit/audit-registry.json` (status, version, unverified points) and
   regenerate `audit/AUDIT.md`.
6. Run the tests — they must pass with 0 failures:

   ```bash
   node tests/run-tests.js
   node tests/audit-check.js
   node tests/package-check.js            # add a zip path to check the zip too
   node tests/ui-360.mjs                  # needs Playwright + Chromium (see the file)
   ```

7. Upload **all** changed files to the repository, **including `sw.js`** and
   `index.html`, keeping the folder structure (`src/`, `audit/`, `tests/`,
   `icons/`). GitHub Pages deploys automatically.
8. Check `sw.js` on the live site (step above).

Do **not** create a new repository — it breaks the address of installed apps.

## Calculation safety and display

- **Implausible patient values** (weight outside 0.3–300 kg, height outside
  25–230 cm, age over 120) are flagged in red and are **not passed on** to any
  tab: no dose is calculated from them (`patientCheck` in `src/formulas.js`).
- **Number fields** are text fields with `inputMode="decimal"`, read through
  `numIn()`: the Greek keyboard comma becomes the decimal point. Do not add
  `type="number"` fields.
- **Every weight-based drug dose shows its calculation**
  (`0.01 mg/kg × 18 kg = 0.18 mg → max 1 mg`), from `doseText().expl`.
- **Text size** (A− / A+): 100%, 115%, 130%, applied with CSS `zoom` to the
  patient bar and the content; the bottom bar and crisis mode are not scaled.
  New layouts must not overflow at 360 px width at 130%.
- **Favourites**: drugs, checklists and tools in one list (`aa_favs`), at most
  10, behind one expandable tile on the home screen and at the top of each tab.
- **Checklists** keep their ticks for 12 hours (`aa_ticks`), with a Clear
  button, and print on A4 (`PrintChecklist`, `@media print` in `index.html`).
- **Crisis mode** keeps its timer and marks for 12 hours per checklist. The
  standard-ALS arrest lists (VF/VT, asystole/PEA, pregnancy, asthma) add a
  2-minute cycle clock and the time since the last adrenaline (amber 3–5 min,
  red >5 min), as the lists themselves state (ERC 2025).
- **Reader** (crisis mode): the phone's text-to-speech reads the highlighted
  step; "Done → next" ticks it and reads the next one. `speechText()` in
  `src/formulas.js` spells out units, routes, ranges and ratios for the voice
  (no regex look-behind, so older iPhones can still load the app). Voice
  commands ("next") are not implemented: speech recognition needs internet in
  most browsers.
- **Colours**: text colours meet WCAG AA (4.5:1) on their backgrounds in both
  themes.

## Conventions

- **Sources:** every clinical card and checklist ends with a source line, in
  both languages. Every changed value names its source next to it. Nothing is
  added from memory, and no source is invented; if a source cannot be read,
  the point is left out and recorded as unverified in the registry.
- Any source named in a card must also appear in the **References card** — a
  test enforces this.
- Greek and English dose text must contain the **same numbers**; a test
  enforces this too.
- **Ideal body weight uses Devine everywhere.** Do not mix in Broca.
- **Glucose is displayed in mg/dL**; potassium, calcium, magnesium and sodium
  stay in mmol/L.
- **Terminology (Greek):** «απινίδωση» (not «εκκένωση/σοκ»); «ανάταξη» for
  synchronised cardioversion; «υπναγωγό».
- **One spelling per drug** in display text. Alternative Greek spellings belong in
  `synEl` / search keywords only, so search still matches either form.
- Cards kept as they are by the author's decision are marked "kept by
  decision" in the registry, with their open points. In v469 the eight such
  cards were checked point by point against their sources; cardiac, thoracic,
  neuro, spirometry and TOF were corrected with her approval and are now
  ordinary reviewed entries. Vascular (carotid clamp pressure), vasoactives
  (dilutions) and the sedation calculator (naloxone 40 µg) stay "kept by
  decision".

## Known gaps

The current list is in `audit/AUDIT.md`, generated from the registry. In
summary:

- All drug entries carry a source line in both languages, enforced by a test.
  Dose ranges, ceilings and the major warnings were checked against the SmPC or
  the named guideline; not every secondary detail in the notes was re-derived
  from source.
- Some points rest on secondary sources or a single study (marked in the
  registry), e.g. Riazi 2008 via Renard 2025, the carotid clamp blood-pressure
  target (no guideline gives a number).
- ERC 2025 Special Circumstances: the full text was not accessible; the LVAD
  details come from the British societies guideline (Akhtar 2024) and the
  pregnancy drug doses from the OAA Quick Reference Handbook.
- Paediatric status epilepticus follows the APLS 7th edition algorithm (Fig. 6.4).
- Display at 360 px width is checked in Chromium by `tests/ui-360.mjs` (every
  tool, drug, checklist and paediatric pane, at 100% and 130%), but not yet on
  a real phone or in Safari.
- Many buttons are smaller than the recommended 44 px touch target (reported by
  `tests/ui-360.mjs` as a warning).

## Typeface

Commissioner (SIL Open Font License, `fonts/OFL-Commissioner.txt`) is self-hosted in `fonts/commissioner.woff` as a variable-weight (300–800) Latin + Greek subset, under the family name "Morfeas Sans" so that a locally installed font or a failed Google Fonts download cannot replace it.
