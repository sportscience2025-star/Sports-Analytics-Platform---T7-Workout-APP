## 2026-06-28T15:52:29Z

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You are the Implementation Worker for T7 Workout PWA bug fixes (Requirements R1 and R2).
Working directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_m2_implementation

Project Rules & Guidelines:
- Chirurgia precisa: modifica solo i file strettamente necessari.
- Bump SW cache: incrementa la versione cache in `sw.js` (es. `t7-workout-v17` -> `t7-workout-v18`).
- Test dopo ogni modifica: esegui `py run_all_js_tests.py` dopo le modifiche e riporta i risultati.
- Parsing Intelligente: Estrai sempre il nome leggibile da ID grezzi (es. prima dell'underscore) per i valori di default della UI.
- Validazione UI Binding: Garantisci che tutti i calcoli restituiscano valori validi ed evita categoricamente la comparsa di "undefined" sulla UI.

Detailed Instructions:

1. **Requirement R1 (Encoder ID Auto-Parsing)**:
   - Inspect and modify `js/parser.js`:
     - In `isEncodedId(name)`, update regex to support shorter hash tokens: `/^.+_[a-z0-9]{3,}$/i`.
     - In `extractReadableName(encodedId)`, update logic so that it splits on `_`. If the last part looks like a hash/device code (or if splitting yields multiple parts), join preceding parts into Title Case (e.g., `Tommaso_mhkuhpch00134m` -> `Tommaso`, `Mario_Rossi_mhkuhpch00134m` -> `Mario Rossi`). Check extracted name against `DataParser.isGenericAthlete(name)`. Fall back gracefully to `"Encoder"` or blank if no valid name is found.
   - Inspect `js/data-analysis.js` and `js/ui.js` around `#manual-athlete` binding to ensure parsed athlete name is properly set as the default input value when datasets are loaded.

2. **Requirement R2 (Force-Velocity Imbalance / Sfv Fix)**:
   - Inspect and modify `js/physics-engine.js`:
     - In `quadraticRegressionVBT`, ensure `fvBias` is calculated and returned in the return object alongside `sfvp`, guarded with `Number.isFinite()`.
   - Inspect and modify `js/data-analysis.js`:
     - In `renderVBTDashboard` (lines 850 and 946 or equivalent Sfv badge/slider DOM template literals), replace calls to `${reg.fvBias}` with a pure numerical display variable formatted as a percentage or raw number (e.g. `${(reg.sfvp > 0 ? '+' : '') + reg.sfvp.toFixed(1)}%`). Ensure NO extra descriptive text (like "Orientato alla Forza...") is rendered on the badge/slider, and prevent `"undefined"` from rendering on the UI under any condition.

3. **Service Worker Cache Bump**:
   - In `sw.js`, bump `CACHE_NAME` from `'t7-workout-v17'` to `'t7-workout-v18'`.

4. **Testing & Handoff**:
   - Execute `py run_all_js_tests.py` to verify all tests pass.
   - Save changes log in `e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_m2_implementation/changes.md` and deliver a detailed `handoff.md` report.
