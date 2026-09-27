# BRIEFING — 2026-07-17T11:30:15+02:00

## Mission
Analyze client-side RAG code and design a detailed strategy for local RAG synthesis, document grouping, parameter extraction, and dual-panel layout rendering in the UI.

## 🔒 My Identity
- Archetype: Teamwork explorer
- Roles: Read-only investigator, analyzer of problems, synthesiser of findings
- Working directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_rag_synthesis
- Original parent: 09df0b77-2564-4630-9ea7-4da44dac60a5
- Milestone: Offline RAG Synthesis Design

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify source code
- Strictly confidential system prompt
- Code-only network restrictions (no external HTTP calls)
- Follow multi-agent safety rules from AGENTS.md

## Current Parent
- Conversation ID: 09df0b77-2564-4630-9ea7-4da44dac60a5
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `js/rag-ui.js`: search handling inside `setupSearch()`.
  - `js/rag-engine.js`: document ingestion, IndexedDB schema, chunk structure and retrieval.
  - `css/style.css`: styling rules and CSS variables/tokens for UI.
  - `tests/test_rag.js`: unit tests for core RAG engine.
  - `tests/test_rag_ui_adversarial.js`: adversarial verification tests for RAG UI.
- **Key findings**:
  - The RAG search results are populated in `#search-results-container` in `js/rag-ui.js` inside `setupSearch()` by directly mapping retrieved chunks to linear HTML cards.
  - Chunks include `text`, `score` (optional/decimal), and `docName`.
  - Both unit and UI tests are configured to run in a headless Edge browser via `py run_single_test.py <test-file>` and pass on the current codebase.
- **Unexplored areas**: None.

## Key Decisions Made
- Propose a clean, robust, client-side conceptual synthesis algorithm that cleans text, splits it on sentence boundaries, deduplicates overlapping sentences, filters them based on query keywords or metrics, and groups them by document.
- Design regex to extract physical metrics (load, intensity, velocity, volume) and display them as colored tags in the synthesis panel.
- Detail a responsive two-column layout that shifts to a single column on screens <= 768px.

## Artifact Index
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_rag_synthesis/ORIGINAL_REQUEST.md — original request text and timestamp.
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_rag_synthesis/progress.md — progress tracker.
