## 2026-07-16T13:21:49Z

You are teamwork_preview_worker. Your working directory is e:/Nuove App Installate/App esercizi scienze motorie/.agents/teamwork_preview_worker_rag_redesign_implementation.
Your parent is 4950284b-74d7-48fb-8676-7ad7d9a1c2e5.

MANDATORY INTEGRITY WARNING:
> DO NOT CHEAT. All implementations must be genuine. DO NOT
> hardcode test results, create dummy/facade implementations, or
> circumvent the intended task. A Forensic Auditor will independently
> verify your work. Integrity violations WILL be detected and your
> work WILL be rejected.

### Objective
Redesign the RAG (Retrieval-Augmented Generation) section of the T7 Workout PWA per requirements R1, R2, and R3.

### Scope of Work
1. **R1: Navigation & Copy Updates**:
   - In `index.html`, rename the desktop navigation link and mobile bottom navigation button for the RAG view from "Knowledge Base RAG" or "RAG KB" to exactly "RAG".
   - In `js/rag-ui.js`, add a glassmorphic info banner explaining what RAG is, how it works, and how it improves the local AI assistant. Update hero section text to coach-centric, user-friendly copy.
2. **R2: Premium UX/UI Redesign**:
   - In `css/style.css`, update `.rag-card` and other RAG elements to use standard design variables for glassmorphism (`backdrop-filter: var(--glass-blur)`, `background: var(--glass-bg)`, `border: 1px solid var(--glass-border)`).
   - Resolve drag-and-drop flickering by applying `pointer-events: none` on child elements of `.drag-drop-zone` in `css/style.css`.
   - Clear the input value upon file selection `fileInput.value = ''` in `js/rag-ui.js` to allow re-uploading the same file after deletion.
   - Clean up inline styles from `js/rag-ui.js` template layouts and move them to structured CSS classes in `css/style.css` (e.g. search input fields, buttons, chunk result cards).
3. **R3: Streamlined Interface (Jargon Removal + Developer Mode)**:
   - Hide technical terms like chunk counts, similarity percentages, and vector details from standard view.
   - Introduce a new state variable `state.devMode` (default `false`) inside `RAGUI` in `js/rag-ui.js`.
   - Add a premium styled toggle or checkbox ("Vista Avanzata" / "Developer Mode") to switch between Standard and Developer View.
   - Standard View: Hides chunks (shows "Pronto" / "Indicizzato"), rephrases progress loaders to non-technical terms, and shows qualitative "Relevance Badges" (e.g., "Rilevanza Alta" for scores >= 0.8, "Rilevanza Media" for scores 0.65-0.8, etc.) instead of exact cosine similarity percentages.
   - Developer View: Displays exact chunk counts, exact similarity percentages (like `94.2%`), and detailed progress logs.
4. **Project Rules**:
   - Bump cache version in `sw.js` (e.g. `t7-workout-v38` -> `t7-workout-v39` or whatever is currently defined).
   - Before completing, execute `py test_check.py` to ensure JavaScript syntax integrity.
   - Execute `py run_all_js_tests.py` and document results.

Write your changes and handoff report to e:/Nuove App Installate/App esercizi scienze motorie/.agents/teamwork_preview_worker_rag_redesign_implementation/handoff.md and notify the parent via send_message.
