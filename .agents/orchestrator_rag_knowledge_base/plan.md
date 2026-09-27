# Plan: Client-Side RAG Knowledge Base

## Mission
Implement a client-side Retrieval-Augmented Generation (RAG) knowledge base for local document upload, vector search, and contextual augmentation in the T7 Workout PWA.

## Milestones

### Milestone 1: Exploration and Technical Audit
- **Objective**: Audit current UI views, program generation code (`js/logic.js`), data analysis code (`js/data-analysis.js`), and existing tests.
- **Worker**: `teamwork_preview_explorer` (Conv ID: [TBD])
- **Deliverables**: Technical audit report (`analysis.md`) specifying injection points for UI, logic integration hooks, Web Worker architecture, and CDN imports.

### Milestone 2: Core RAG Engine & Local Vector Database
- **Objective**: Implement client-side document parsing, text chunking, local vector database (IndexedDB), and similarity search.
- **Worker**: `teamwork_preview_worker` (Conv ID: [TBD])
- **Details**:
  - Store documents and embeddings in IndexedDB (`t7_rag_db`).
  - Parsers for PDF (using pdf.js), Excel (using xlsx.js), and Word (using mammoth.js).
  - Offload local embeddings generation using Transformers.js to a Web Worker (`js/rag-worker.js`) with model `Xenova/all-MiniLM-L6-v2`.
  - Implement cosine similarity search on embeddings.
- **Verification**: Internal programmatic tests.

### Milestone 3: UI Integration and AI Contextual Augmentation
- **Objective**: Create the RAG UI dashboard and integrate retrieval context into program generation and data analysis.
- **Worker**: `teamwork_preview_worker` (Conv ID: [TBD])
- **Details**:
  - Add RAG navigation item and view container in `index.html`.
  - Implement drag-and-drop file upload with a progress bar, document list, and query testing in `js/rag-ui.js`.
  - Update `js/logic.js` to query the local vector DB during program generation and append/use the retrieved guidelines.
  - Update `js/data-analysis.js` to query the local vector DB and adjust analysis defaults or metrics.
  - Bump PWA Service Worker cache version in `sw.js`.

### Milestone 4: Verification and Forensic Audit
- **Objective**: Create a comprehensive offline test suite, check JavaScript syntax, verify functionality, and perform a forensic integrity check.
- **Workers**: `teamwork_preview_reviewer` (Conv ID: [TBD]), `teamwork_preview_challenger` (Conv ID: [TBD]), `teamwork_preview_auditor` (Conv ID: [TBD])
- **Details**:
  - Write test file `tests/test_rag.js` and register it in `tests/runner.html`.
  - Execute `py test_check.py` to validate Javascript syntax integrity.
  - Execute `py run_all_js_tests.py` to verify that all unit/integration tests pass.
  - Run Forensic Audit to confirm clean implementation.

## Multi-Agent Safety Rules
- **Precision surgery**: Edit only the necessary files. Do not perform global refactoring.
- **Bump SW cache**: Increment version in `sw.js` (e.g. `t7-workout-v20` -> `t7-workout-v21`).
- **No syntax errors**: Ensure `py test_check.py` runs with zero syntax errors.
- **Prevent "undefined"**: Validate UI binding variables before injecting into the UI.
- **Zero test regressions**: Ensure `py run_all_js_tests.py` runs and passes 100%.
