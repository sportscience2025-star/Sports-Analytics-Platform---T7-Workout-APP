# RAG Redesign execution plan

## Objectives
1. **R1: Navigation & Content Updates**: Rename top-right nav to "RAG". Add description in RAG section.
2. **R2: Premium UX/UI Redesign**: Apply glassmorphism styling (`backdrop-filter: blur`, subtle border highlights), match existing styling, fix drag & drop interactions and visual bugs.
3. **R3: Streamlined Interface**: Hide technical jargon ("chunks", "vectors", embeddings metadata) from standard view.
4. **Project Rules**:
   - Bump cache version in `sw.js`.
   - Run tests using `py run_all_js_tests.py` (or similar test script).
   - Check JS syntax using `py test_check.py`.

## Phases
1. **Phase 1: Exploration**: Spawn `teamwork_preview_explorer` to inspect `index.html`, `js/rag-ui.js`, `js/rag-engine.js`, `css/style.css`, and other files to find current layout and navigation.
2. **Phase 2: Decomposition**: Update `PROJECT.md` or create `SCOPE.md` with explicit interfaces and milestones.
3. **Phase 3: Implementation & Review**:
   - Spawn `teamwork_preview_worker` to execute changes.
   - Run syntax tests and run headless test scripts.
   - Spawn `teamwork_preview_reviewer` to review changes.
   - Spawn `teamwork_preview_challenger` to verify drag & drop UX.
4. **Phase 4: Integrity & Completion**:
   - Spawn `teamwork_preview_auditor` to audit integrity.
   - Deliver final handoff to parent.
