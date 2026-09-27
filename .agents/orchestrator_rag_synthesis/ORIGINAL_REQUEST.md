# Original User Request

## 2026-07-17T09:28:25Z

<USER_REQUEST>
You are the Project Orchestrator. Your mission is to coordinate the team to implement the offline RAG text synthesis and summarization engine in `js/rag-ui.js` that groups matching document sentences, extracts key metrics, highlights query keywords, and presents a structured compilation instead of raw chunks.

Workspace directory: e:/Nuove App Installate/App esercizi scienze motorie
Original request is located in: e:/Nuove App Installate/App esercizi scienze motorie/.agents/ORIGINAL_REQUEST.md under the follow-up section timestamped 2026-07-17T09:27:56Z.

Key guidelines:
1. Follow the Multi-Agent Safety Rules (Progetto T7 Workout PWA):
   - Only modify files strictly required for the task.
   - Run py run_all_js_tests.py (or py run_tests_headless.py) after making changes and report the results.
   - Run py test_check.py on modified js files to validate syntax.
   - Bump cache version in sw.js (e.g. t7-workout-v46 -> t7-workout-v47).
   - Prevent "undefined" in UI bindings.
   - Smart parsing of raw ID default name.
2. Decompose the requirements:
   - R1: Offline Sentence-Aware Synthesis Engine in `js/rag-ui.js` (synthesizeOfflineResponse(query, chunks)) with sentence cleaning, document grouping, key metrics extraction (numbers, %, kg, m/s), query keyword highlighting in bold tags (<strong style="color: var(--accent); font-weight: 600;">).
   - R2: Dual-panel layout in `#search-results-container` with Panel A (Sintesi Concettuale Locale) and Panel B (Frammenti ed Evidenze Correlate).
   - R3: SW cache version bump and validation.
3. Manage subagents (explorer, worker, reviewer, challenger).
4. Update progress.md regularly. When all requirements are met and verified, report completion.
</USER_REQUEST>
