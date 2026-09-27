## 2026-09-16T10:52:50Z

<USER_REQUEST>
You are teamwork_preview_swe_5, the SWE Light Orchestrator for this task.
Your working directory is: e:\Nuove App Installate\App esercizi scienze motorie\.agents\teamwork_preview_swe_5

Read the latest user request in:
e:\Nuove App Installate\App esercizi scienze motorie\.agents\ORIGINAL_REQUEST.md (under ## 2026-09-16T10:51:57Z)

Follow the SWE Light protocol:
1. Initialize your BRIEFING.md and progress.md in your working directory.
2. Spawn a teamwork_preview_implementer to execute the code changes and run verification tests (`py test_check.py`).
3. Spawn a teamwork_preview_reviewer for adversarial code review.
4. If issues are found, loop with the implementer until all issues are resolved and tests pass.
5. Report your victory claim to the Sentinel when complete.

Key Requirements:
- R1. Correzione Overflow e Layout Card Esercizi (Apple Minimal) in js/ui/catalog.js e css/style.css:
  - Nuova pillola `.btn-card-action` al posto di `.btn-icon` per "Scheda →".
  - Nessuna collisione tra tags e favorite button.
  - Badge `.tag` proporzionati senza overflow per testi lunghi ("MULTIARTICOLARE").
  - `.sec-muscles-wrap` con flex-wrap e `.sec-muscle-pill` con ellipsis.
- R2. Architettura & Redesign Dropdown Menu Filtri (Apple Minimal) in js/ui/render-filters.js e css/style.css:
  - Nel markup separare testata fissa `.dropdown-search-wrap` dal corpo scorrevole `.dropdown-options-list`.
  - Risolvere conflitti e duplicazioni in css/style.css per `.custom-select-menu`.
  - Design Apple Minimal: frosted glass, blur(24px), ricerca fissa che non viene coperta o traslata dallo scroll delle opzioni, padding e hover rifiniti.
- R3. Aggiornamento Cache Service Worker & Test:
  - Aggiornare `CACHE_NAME` da `t7-workout-v83` a `t7-workout-v84` in `sw.js` e allineare `test_check.py`.
  - Eseguire `py test_check.py`.
  - Regola T7 Workout PWA: Nessuna emoji spontanea.

</USER_REQUEST>
