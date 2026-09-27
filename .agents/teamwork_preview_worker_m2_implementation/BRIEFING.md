# BRIEFING — 2026-07-14T12:44:00+02:00

## Mission
Implement Milestone 2: Core RAG Engine & Local Vector DB (Phase A).

## 🔒 My Identity
- Archetype: implementer/qa/specialist
- Roles: implementer, qa, specialist
- Working directory: e:\Nuove App Installate\App esercizi scienze motorie\.agents\teamwork_preview_worker_m2_implementation
- Original parent: 005570d7-ca9f-4798-a5e7-93201e91241a
- Milestone: Milestone 2: Core RAG Engine & Local Vector DB (Phase A)

## 🔒 Key Constraints
- CODE_ONLY network mode. No external network requests.
- No cheating or facade implementations.
- Must run `py test_check.py` and `py run_all_js_tests.py` to verify and report.
- Cache version bump in `sw.js` and register new files.
- UI validation to prevent "undefined".

## Current Parent
- Conversation ID: 005570d7-ca9f-4798-a5e7-93201e91241a
- Updated: not yet

## Task Summary
- **What to build**: RAG Engine with IndexedDB storage and vector search (with Transformers.js in Web Worker).
- **Success criteria**: All JS tests pass, PDF/XLSX/DOCX parsing works (Mammoth.js loaded via CDN), chunking, query embedding generation, and cosine similarity matches return correctly.
- **Interface contracts**: window.App.RAG or window.RAGEngine
- **Code layout**: js/rag-engine.js, js/rag-worker.js, tests/test_rag.js, tests/runner.html, sw.js

## Key Decisions Made
- Use Xenova/all-MiniLM-L6-v2 inside js/rag-worker.js via Xenova's Transformers.js CDN.
- Store chunk text and embedding array in IndexedDB chunks.

## Artifact Index
- [TBD]
