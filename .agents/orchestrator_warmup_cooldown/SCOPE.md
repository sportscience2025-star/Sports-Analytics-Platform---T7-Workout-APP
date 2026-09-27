# Scope: Personalized Warm-up (RAMP) & Cool-down Routines

## Architecture
- **Workout Generator** (`js/logic.js`): Generates full workout programs including warm-up (RAMP protocol) and cool-down routines dynamically based on user parameters.
- **UI layer** (`js/ui.js` and `index.html`): User interface that gathers input parameters like sport, level, patientType, and provides selections for target profiles.
- **Service Worker** (`sw.js`): Handles offline caching and must be bumped whenever JS/CSS are modified.
- **Verification Scripts** (`run_all_js_tests.py`, `test_check.py`): Run verification tests and syntax validations.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Codebase Exploration | Investigate logic.js, ui.js, index.html for profile selection and warm-up/cool-down structures. | None | PLANNED |
| 2 | Warm-up & Cool-down Logic | Implement personalized RAMP warm-up and cool-down routines inside logic.js for the 5 macro-profiles. | M1 | PLANNED |
| 3 | UI Menu Selections | Update HTML/JS UI menus to allow selection of the 5 macro-profiles and bind them to the generator. | M2 | PLANNED |
| 4 | Integration, Cache & Verification | Bump sw.js version, validate JS syntax, run tests and perform forensic audit. | M3 | PLANNED |

## Interface Contracts
### `ui.js` / UI layer ↔ `logic.js` / Generator
- Selected profile ("Calcio", "Basket", "Atletica Sprint", "Runner Amatoriale/Sedentario", "Pazienti Clinici/Anziani") passed via `params` (e.g. `params.sport`, `params.sportPraticato`, `params.patientType` or a new field) to `generateFullProgram(params)`.
- Generator functions `_addWarmupByPhase(phaseId, session, focus, isClinical, params)` and `_addCooldownByPhase(phaseId, session, isClinical, params)` return exercises matching `{ name, specs: { sets, reps, rest }, isWarmup: true }` or `{ name, specs: { sets, reps, rest }, isCardio: true }`.
