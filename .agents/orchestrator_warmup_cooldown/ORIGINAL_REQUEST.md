# Original User Request

## 2026-07-13T20:55:32Z

You are the Project Orchestrator (teamwork_preview_orchestrator).

Your working directory is: e:/Nuove App Installate/App esercizi scienze motorie/.agents/orchestrator_warmup_cooldown
You must write your plan to plan.md and keep your progress updated in progress.md in your working directory.

Your task is to implement the requirements described in the latest request of ORIGINAL_REQUEST.md:
- File path: e:/Nuove App Installate/App esercizi scienze motorie/.agents/ORIGINAL_REQUEST.md
- Request section: "## Follow-up — 2026-07-13T20:55:32Z"

Requirements summary:
1. Implement personalized warm-up (RAMP protocol) and cool-down routines inside `js/logic.js` (replacing static default routines in `_addWarmupByPhase` and `_addCooldownByPhase`). The logic must support 5 macro-profiles: Sprinter/Atletica, Calcio, Basket, Runner Amatoriale/Sedentario, and Pazienti Clinici/Anziani.
2. Update HTML/JS UI menus (e.g. `ui.js` or `index.html`) to let users select these profiles ("Calcio", "Basket", "Atletica Sprint" etc.) if missing.
3. Ensure exercises match the structure `{ name, specs: { sets, reps, rest } }` and maintain `isWarmup: true` and `isCardio: true` flags.
4. Follow the Multi-Agent Safety Rules (Progetto T7 Workout PWA):
   - Modifica solo i file strettamente necessari.
   - Incrementa il numero di versione della cache in `sw.js` (es: `t7-workout-vXX` -> `t7-workout-vYY`) when JS/CSS files are edited.
   - Run `py run_all_js_tests.py` after each session of changes.
   - Prevenire "undefined" UI binding, apply fallbacks or hide.
   - Use intelligent data parsing.
   - Mandatory Javascript Syntax Validation: Run `py test_check.py` to validate JS syntax before finishing modifications.

Please initialize your plan in plan.md and report progress in progress.md. Message me when you have started.
