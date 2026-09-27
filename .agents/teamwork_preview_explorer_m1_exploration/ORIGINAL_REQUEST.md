## 2026-07-14T10:42:28Z
Perform a read-only codebase audit and tech spec analysis to implement a client-side RAG knowledge base.
You must read and analyze:
- `index.html` (view layout, CDN imports, scripts list)
- `js/ui.js` (how views are managed, where and how to inject RAG view panel/card, view navigation)
- `js/logic.js` (how workout programs are generated, how we can hook into program generation to retrieve local methodology context from IndexedDB and augment the templates)
- `js/data-analysis.js` (how calculations are managed and shown, how we can query local vector DB to adjust calculations/metrics/defaults)
- `sw.js` (how cache versioning works)
- `tests/runner.html` (how test suite is run and how to register new tests)

Verify if other libraries are needed (like mammoth.js for DOCX parsing) and what CDN to use.
Design the IndexedDB database structure (`t7_rag_db` with `documents` and `chunks` stores) and how Web Worker communication will flow for local embedding generation using Transformers.js (model `Xenova/all-MiniLM-L6-v2`).

Write your detailed findings to `analysis.md` and a clean, self-contained handoff to `handoff.md` in your working directory. Ensure you report back with a message pointing to these files and summarizing your findings. Do not modify any source code files.
