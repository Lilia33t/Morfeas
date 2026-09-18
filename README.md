# Morfeas — Anesthesia Assistant

Bilingual (Greek/English) clinical reference PWA for anaesthesia.
Works offline once installed.

## Structure

| File | Contents |
|---|---|
| `src/data.js` | Drug database, emergency checklists |
| `src/formulas.js` | BMI/IBW/ABW/LBM/FFM, TCI models, colour palette, translations |
| `src/primitives.js` | Shared UI components, risk scores, LA and anticoagulant tables |
| `src/tabs.js` | Clinical cards, guidelines, references |
| `src/root.js` | Tool registry, app shell, search |
| `sw.js` | Service worker (cache-first, offline) |
| `tests/run-tests.js` | Unit tests — run before every deploy |

## Deploying

```bash
node tests/run-tests.js     # must pass with 0 failures
```

Then:

1. **Bump `CACHE` in `sw.js`** (`anesthesia-vNN`) — without this, users keep the old cached version.
2. Push to the GitHub repo; Pages deploys automatically.
3. Do **not** create a new repo — it breaks the URL of already-installed PWAs.

## Conventions

- **Ideal body weight uses Devine everywhere.** Do not mix in Broca.
- **Glucose is displayed in mg/dL**; potassium, calcium, magnesium and sodium stay in mmol/L.
- **One spelling per drug** in display text. Alternative Greek spellings belong in
  `synEl` / search keywords only, so search still matches either form.
- Every clinical card ends with a **source line**, in both languages.
- Any source named in a card must also appear in the **References card** —
  a test enforces this.
- Greek and English dose text must contain the **same numbers**; a test enforces this too.

## Known gaps

- 53 of 81 drug entries have no verified citation. They are mostly standard
  agents (volatiles, opioids, relaxants), but they have not been checked against
  a primary source.
