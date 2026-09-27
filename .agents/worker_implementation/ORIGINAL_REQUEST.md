## 2026-07-13T20:59:35Z

Your working directory for coordination metadata is: e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_implementation
Your role is to implement the requested features, restore tests, and run validation.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Detailed Tasks:
1. Repair Corrupted Test Files:
   - Copy `tests/test_adversarial_physics.js` from `.agents/challenger_m1_1/test_adversarial_physics.js`, updating the `physicsPath` on line 8 to `path.join(__dirname, '..', 'js', 'physics-engine.js')`.
   - Clean up `tests/test_chart_verification.js`. You can extract the clean code contained inside line 1 by writing a python script to process it (replacing literal \n with newlines) and save it, or write a clean Chart.js verification mock test script.
   - Copy `tests/test_periodization_stress.js` from `.agents/challenger_redesign_2/test_program_generation_stress.js`, updating `projectRoot` on line 12 to `path.resolve(__dirname, '../')`.
   - Fix `tests/test_regression_edge_cases.js` by writing a clean unit test checking PhysicsEngine.autoSelectRegressionVBT under edge cases (empty dataset, <3 points, null/undefined inputs).
   - Verify that running tests via `py run_tests_headless.py` runs successfully (though some logic tests might still fail before your implementation).

2. Implement Personalized Warm-up & Cool-down in `js/logic.js`:
   - Change `_addWarmupByPhase(phaseId, session, focus, isClinical)` to `_addWarmupByPhase(phaseId, session, focus, isClinical, params)`.
   - Change `_addCooldownByPhase(phaseId, session, isClinical)` to `_addCooldownByPhase(phaseId, session, isClinical, params)`.
   - In `_generatePhases`, pass `params` as the fifth argument to both functions.
   - Implement dynamic warm-up and cool-down routines matching:
     * Sprinter/Atletica (when `params.sportPraticato === 'Atletica Leggera'`)
     * Calcio (when `params.sportPraticato === 'Calcio'`)
     * Basket (when `params.sportPraticato === 'Basketball'`)
     * Runner Amatoriale/Sedentario (when `params.patientType === 'Sedentario'`)
     * Pazienti Clinici/Anziani (when `params.patientType === 'Clinico_Anziano'` or `params.patientType === 'Clinico'` or `params.patientType === 'Anziano'`)
     * Fallback to the original routines if no match.
   - Ensure exercise objects match the structure `{ name, specs: { sets, reps, rest } }` (reps/sets/rest can have custom values matching the prompt) and maintain `isWarmup: true` and `isCardio: true` flags.
   - Update all `params.patientType === 'Clinico'` checks in `js/logic.js` to also check for `'Clinico_Anziano'`.

3. Update UI Selection Cards in `js/ui.js`:
   - Under `patientType` option cards, add:
     * Value `"Sedentario"` with label "Runner Amatoriale/Sedentario" and icon 🏃♂️
     * Value `"Clinico_Anziano"` with label "Pazienti Clinici / Anziani" and icon 🩺👵
   - Under `sportPraticato` option cards, add:
     * Value `"Calcio"` with label "Calcio"
     * Value `"Basketball"` with label "Basket"
     * Value `"Atletica Leggera"` with label "Atletica Sprint"

4. Bump Cache Version in `sw.js`:
   - Increment the value of `CACHE_NAME` (e.g. 't7-workout-v31' -> 't7-workout-v32').

5. Validate & Run Tests:
   - Run `py test_check.py` to validate JS syntax.
   - Run `py run_all_js_tests.py` or `py run_tests_headless.py` and verify all 17 tests pass successfully.
   - Write your report in `handoff.md` and message the orchestrator when complete.
