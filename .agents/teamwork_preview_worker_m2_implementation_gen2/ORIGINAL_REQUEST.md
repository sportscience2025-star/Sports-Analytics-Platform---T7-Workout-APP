## 2026-07-14T13:10:06Z
Implement Milestone 2: Core RAG Engine & Local Vector DB (Phase A).
You need to create:
1. `js/rag-engine.js`:
   - Initialize IndexedDB: database name `t7_rag_db` (version 1), with stores `documents` (key path: `id`) and `chunks` (key path: `id` autoIncrement, index on `documentId`).
   - Implement `addDocument(name, fileType, arrayBuffer)`:
     - Extraction from PDF using the preloaded PDF.js (`window.pdfjsLib`).
     - Extraction from Excel using the preloaded SheetJS (`window.XLSX`).
     - Extraction from DOCX using Mammoth.js. Mammoth.js must be loaded dynamically or via a CDN script tag in `index.html`. You should inject CDN script for Mammoth: `https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js`.
     - Chunking algorithm: split text into chunks of ~500 characters with ~100 characters overlap.
     - Communicate with Web Worker `js/rag-worker.js` to compute embeddings for chunks.
     - Save metadata to `documents` store and chunk text & embedding vectors (as arrays) to `chunks` store.
   - Implement `deleteDocument(docId)`: remove document from `documents` and all corresponding chunks from `chunks`.
   - Implement `semanticSearch(queryText, limit)`:
     - Query Web Worker to get query embedding.
     - Fetch all chunk embeddings from IndexedDB `chunks`.
     - Send query embedding & all chunks to Web Worker to compute cosine similarity and return top matches (sorted descending by similarity score).
     - Return array of `{ text, score, docName }`.
   - Expose the API globally under `window.App.RAG` or `window.RAGEngine`.

2. `js/rag-worker.js`:
   - Load Transformers.js from CDN: `importScripts('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');`
   - Load and initialize model `Xenova/all-MiniLM-L6-v2` for feature-extraction.
   - Handle messages:
     - `INIT`: Initialize model.
     - `GENERATE_EMBEDDINGS`: Take text chunks, generate embeddings, and postMessage them back.
     - `SEMANTIC_SEARCH`: Take query embedding and candidate chunks, compute cosine similarity, and postMessage sorted scores back.

3. `tests/test_rag.js`:
   - Write a unit test script verifying RAG engine.
   - It should mock the Web Worker if running in Node.js context, or test IndexedDB storage and vector search.
   - Since tests in `run_all_js_tests.py` are run inside a browser (via iframe runner in Chrome/Edge), you can execute the real IndexedDB operations and mock or run the worker.
   - Assert document parsing, store/retrieve, and similarity search correctness.

4. `tests/runner.html`:
   - Register `test_rag.js` in the list of test files so it runs automatically in the suite.

5. `sw.js`:
   - Bump cache version (e.g. `t7-workout-v33` -> `t7-workout-v34`).
   - Register the new RAG files (`js/rag-engine.js`, `js/rag-worker.js`, etc.) in `CORE_ASSETS` so they are cached.

Steps:
1. Analyze `sw.js`, `tests/runner.html`, and `index.html`.
2. Write `js/rag-worker.js` and `js/rag-engine.js`.
3. Create `tests/test_rag.js` and update `tests/runner.html`.
4. Run `py test_check.py` to verify JS syntax.
5. Run `py run_all_js_tests.py` and verify all tests pass.
6. Write your handoff report to `handoff.md` and report back to the orchestrator.
