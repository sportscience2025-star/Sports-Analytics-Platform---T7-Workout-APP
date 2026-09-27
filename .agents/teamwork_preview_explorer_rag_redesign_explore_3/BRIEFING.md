# BRIEFING — 2026-07-16T15:21:00+02:00

## Mission
Explore the RAG codebase (index.html, js/rag-ui.js, js/rag-engine.js, css/style.css) to find technical jargon rendering and design a strategy to hide these details from standard view.

## 🔒 My Identity
- Archetype: teamwork_preview_explorer
- Roles: explorer, analyst
- Working directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/teamwork_preview_explorer_rag_redesign_explore_3
- Original parent: 4950284b-74d7-48fb-8676-7ad7d9a1c2e5
- Milestone: RAG redesign exploration

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Analyze requirements R1, R2, R3 (especially hiding "chunks", "vectors", and embeddings metadata details from standard view)

## Current Parent
- Conversation ID: 4950284b-74d7-48fb-8676-7ad7d9a1c2e5
- Updated: 2026-07-16T15:21:00+02:00

## Investigation State
- **Explored paths**: `index.html`, `js/rag-ui.js`, `js/rag-engine.js`, `js/rag-worker.js`, `css/style.css`
- **Key findings**: Identified occurrences of technical jargon in UI (chunks, vectors, similarity percentage scores). Identified layout misalignment for `.rag-card` (missing glassmorphism variables). Identified drag-and-drop flicker bug caused by event bubbling in child nodes.
- **Unexplored areas**: None

## Key Decisions Made
- Proposed a conditional "Developer Mode" toggle to switch between a clean standard view (hiding "frammenti", replacing percentages with relevance qualitative tags) and an advanced developer view.
- Outlined a CSS-only solution (`pointer-events: none`) to eliminate drag-and-drop flickering.

## Artifact Index
- e:/Nuove App Installate/App esercizi scienze motorie/.agents/teamwork_preview_explorer_rag_redesign_explore_3/handoff.md — Handoff report and proposed redesign strategy
