## 2026-07-17T09:30:35Z
You are the RAG Synthesis Worker. Your task is to:
1. Read the Explorer's handoff report at `e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_rag_synthesis/handoff.md` to understand the designed architecture and code snippets.
2. Implement `synthesizeOfflineResponse(query, chunks)` and its helpers (`splitIntoSentences(text)`, `extractKeywords(query)`, `containsQueryKeywords(sentence, keywords)`, `containsMetrics(text)`, `extractMetrics(text)`, `highlightKeywords(text, keywords)`) in `js/rag-ui.js`.
3. In `js/rag-ui.js`, update `setupSearch()` to utilize `synthesizeOfflineResponse(query, chunks)` and render the dual-panel layout in `#search-results-container`. Make sure to avoid "undefined" strings in UI binding by validating properties (like `chunk.docName` or `chunk.text`) and fallback to reasonable defaults.
4. Add the layout and responsive styles for `.rag-dual-panel` to `css/style.css`.
5. Execute the syntax validation script: `py test_check.py` to ensure JS integrity.
6. Run the headless unit tests: `py run_tests_headless.py` (specifically verifying RAG-related tests like `tests/test_rag.js` and `tests/test_rag_ui_adversarial.js`).
7. Increment the Service Worker cache version in `sw.js` (e.g. from the current version to version + 1) to ensure the client PWA downloads the new scripts.
8. Document your changes, build/test command outputs, and verify that the layout and functionality are correct. Write your handoff report to `.agents/worker_rag_synthesis/handoff.md`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your working directory is: e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_rag_synthesis
