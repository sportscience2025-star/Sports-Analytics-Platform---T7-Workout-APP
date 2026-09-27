# Plan - Personalized Warm-up & Cool-down

## Goal
Implement personalized warm-up (RAMP protocol) and cool-down routines supporting 5 macro-profiles inside `js/logic.js` and integrate them with the UI (`index.html`/`js/ui.js`).

## Requirements Checklist
- [ ] R1: Personalized warm-up routines in `js/logic.js` for 5 profiles:
  - Sprinter/Atletica (skip, mobility hip/flexors, plyometric power)
  - Calcio (carioca, lunges, ladder drills, foam roller cool-down)
  - Basket (defensive slides, ankle mobility, vertical jumps, Achilles stretch)
  - Runner Amatoriale/Sedentario (light walk/run, leg swings, calf stretch)
  - Pazienti Clinici/Anziani (low resistance cyclette, active ROM seated, pain-free stretching)
- [ ] R2: Dynamic cool-down routines matching the same profiles.
- [ ] R3: Update HTML/JS menus in `index.html` and/or `js/ui.js` to allow selecting these profiles.
- [ ] R4: Exercises must match `{ name, specs: { sets, reps, rest } }` with `isWarmup: true` and `isCardio: true` flags.
- [ ] R5: Cache bump in `sw.js`.
- [ ] R6: Syntax validation using `py test_check.py` and test execution using `py run_all_js_tests.py`.

## Execution Plan
1. **Milestone 1: Exploration**
   - Dispatch `teamwork_preview_explorer` to identify the current structure of `js/logic.js` for warm-ups/cool-downs, how `js/ui.js` and `index.html` gather the sport/profile selection, and how tests are structured.
2. **Milestone 2: Implementation of Routines**
   - Dispatch `teamwork_preview_worker` to write the personalized routines in `js/logic.js`.
3. **Milestone 3: UI Menu Update**
   - Dispatch `teamwork_preview_worker` to update UI selectors in `index.html` and `js/ui.js` to allow selection of the 5 macro-profiles and ensure they propagate correctly.
4. **Milestone 4: Cache & Verification**
   - Dispatch `teamwork_preview_worker` to bump cache version in `sw.js`.
   - Dispatch `teamwork_preview_reviewer` to check logic correctness.
   - Dispatch `teamwork_preview_challenger` to verify that selecting Calcio, Basket, Atletica, etc., yields the correct routines, and that clinical patients get low-impact options.
   - Dispatch `teamwork_preview_auditor` to check syntax (`py test_check.py`) and run test suite (`py run_all_js_tests.py`).
