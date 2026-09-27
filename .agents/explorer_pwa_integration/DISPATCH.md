# Task Assignment: Explorer PWA & Integration

## Objective
Analyze how `js/knowledge-base.js` and `window.App.scientificSources` are loaded, cached, and consumed across the project:
1. Examine `index.html`: how is `js/knowledge-base.js` included (script tag location, order with respect to other scripts).
2. Examine `sw.js`: current `CACHE_NAME` (expected `t7-workout-v68`), `CORE_ASSETS` entry for `knowledge-base.js`.
3. Examine `test_check.py`: cache version assertions, delimiter checks, file list checks.
4. Examine all consumers of `scientificSources` or `knowledge-base.js` across the codebase (`grep_search` for `scientificSources`, `knowledge-base.js`, `getSources`, etc.).
5. Detail the exact plan for modularizing `js/knowledge-base.js` into:
   - `js/data/sources/atletica.js`
   - `js/data/sources/sollevamento-pesi.js`
   - `js/data/sources/fisiologia.js`
   - `js/data/sources/vbt.js`
   - `js/data/sources/biomeccanica.js`
   - `js/data/sources/clinico.js`
   - `js/data/sources/sport-squadra.js`
   - `js/data/sources/index.js` (entry-point aggregator exposing `window.App.scientificSources`)
   And determine how `index.html` should load them in standard browser environment (without ES modules / bundler), or whether `index.js` or `index.html` loads them.
6.- Write your full report to `report.md` and your handoff summary in `handoff.md` in this directory.

## 2026-09-14T12:52:29Z
You are Explorer 2 (PWA & Integration Explorer).
Your working directory is: e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pwa_integration
Read your assignment in e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pwa_integration/DISPATCH.md
Also read ORIGINAL_REQUEST.md at: e:/Nuove App Installate/App esercizi scienze motorie/.agents/ORIGINAL_REQUEST.md
And project guidelines at: e:/Nuove App Installate/App esercizi scienze motorie/.agents/AGENTS.md

Investigate PWA integration and consumers of `scientificSources`:
- Inspect index.html, sw.js, test_check.py, and all JS files consuming `scientificSources` or referencing `knowledge-base.js`.
- Detail the exact architecture for modularizing `js/knowledge-base.js` into 7 thematic area files under `js/data/sources/` plus `js/data/sources/index.js`.
- Specify the exact script loading order in index.html, CORE_ASSETS updates in sw.js, cache name bump (t7-workout-v68 -> t7-workout-v69), and updates to test_check.py.
- Write your full report to e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pwa_integration/report.md and summary handoff in handoff.md.
- Send a message back to parent when done.
