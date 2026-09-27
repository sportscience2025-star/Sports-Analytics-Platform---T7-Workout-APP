# Task Assignment: Sources Modularizer Worker

## Objective
Implement Milestone 3:
1. Create `js/data/sources/` directory.
2. Ingest existing 161 sources from `js/knowledge-base.js` and the 99 new sources from:
   - `.agents/worker_research_group_a/sources_group_a.json` (43 sources)
   - `.agents/worker_research_group_b/sources_group_b.json` (28 sources)
   - `.agents/worker_research_group_c/sources_group_c.json` (28 sources)
3. Generate the 7 modular source files in `js/data/sources/`:
   - `atletica.js` (35 sources total: 21 existing + 14 new)
   - `sollevamento-pesi.js` (31 sources total: 17 existing + 14 new)
   - `fisiologia.js` (47 sources total: 33 existing + 14 new)
   - `vbt.js` (28 sources total: 13 existing + 15 new)
   - `biomeccanica.js` (40 sources total: 26 existing + 14 new)
   - `clinico.js` (40 sources total: 26 existing + 14 new)
   - `sport-squadra.js` (39 sources total: 25 existing + 14 new)
   Total: exactly 260 scientific sources.
   Each file must expose `window.App.Sources.<area>` using uppercase constants, proper comments, no emojis.
4. Create `js/data/sources/index.js`:
   - Aggregates all 7 source arrays into `window.App.scientificSources` and `window.ScientificKnowledgeBase`.
   - Dual-environment support: in Node.js (`if (typeof require !== 'undefined')`), loads and evals the 7 source files if not already loaded.
5. Transform `js/knowledge-base.js` into a clean compatibility facade:
   - In Node.js: loads `js/data/sources/index.js` via `fs.readFileSync` and `eval` to preserve backward compatibility for tests (`test_periodization_stress.js`, `test_new_profiles.js`, `test_adversarial_challenger.js`, `test_adversarial_scientific_hub.js`).
6. Update `index.html`:
   - Replace `<script src="js/knowledge-base.js"></script>` at line 145 with the 7 modular scripts, `index.js`, and `knowledge-base.js`.
7. Update `sw.js`:
   - Bump cache version: `const CACHE_NAME = 't7-workout-v77';`
   - Add all 8 paths (`./js/data/sources/*.js`) to `CORE_ASSETS`, keeping `./js/knowledge-base.js`.
8. Update `test_check.py`:
   - Update cache version assertion to `t7-workout-v77`.
   - Add `sources_files` to delimiter balance checks.
9. Verify with `py test_check.py` and run dependent Node.js test suites.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-09-14T13:08:41Z
You are Worker Sources Modularizer.
Your working directory is: e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_sources_modularizer
Read your assignment in e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_sources_modularizer/DISPATCH.md
Also read ORIGINAL_REQUEST.md at: e:/Nuove App Installate/App esercizi scienze motorie/.agents/ORIGINAL_REQUEST.md
And project guidelines at: e:/Nuove App Installate/App esercizi scienze motorie/.agents/AGENTS.md
And the architecture plan at: e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pwa_integration/report.md

Your task is to implement the modularization of scientific sources:
1. Extract existing 161 sources from `js/knowledge-base.js`.
2. Load new 99 sources from:
   - e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_research_group_a/sources_group_a.json
   - e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_research_group_b/sources_group_b.json
   - e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_research_group_c/sources_group_c.json
3. Create `js/data/sources/` and write the 7 area files: `atletica.js`, `sollevamento-pesi.js`, `fisiologia.js`, `vbt.js`, `biomeccanica.js`, `clinico.js`, `sport-squadra.js`.
4. Create `js/data/sources/index.js` (aggregator exposing window.App.scientificSources and window.ScientificKnowledgeBase, with Node.js fallback).
5. Update `js/knowledge-base.js` as a facade delegating to `js/data/sources/index.js`.
6. Update `index.html` (replace line 145 with the 8 new files + facade).
7. Update `sw.js` (bump cache to `t7-workout-v77` and add the 8 files to `CORE_ASSETS`).
8. Update `test_check.py` (bump check to `t7-workout-v77` and add new files to delimiter checks).
9. Run `py test_check.py` and run dependent Node.js test suites.
10. Write report.md and handoff.md in your working directory. Send message to parent when done.

