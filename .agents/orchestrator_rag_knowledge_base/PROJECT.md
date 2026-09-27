# Project: Client-Side RAG Knowledge Base

## Architecture
- **RAG Core Engine** (`js/rag-engine.js`): Parses PDF, DOCX, XLSX documents on the client side, chunks text, generates embeddings locally using Transformers.js via a Web Worker (`js/rag-worker.js`), stores them in IndexedDB, and matches queries using cosine similarity.
- **RAG Web Worker** (`js/rag-worker.js`): Executes Transformers.js embedding calculations in a background thread to prevent UI blocking.
- **RAG UI Layer** (`js/rag-ui.js`, `index.html`, `css/style.css`): ChatGPT-like upload UI featuring drag & drop, progress bar, document listing, document deletion, and search trial panel.
- **AI & Analysis Integration** (`js/logic.js`, `js/data-analysis.js`): Queries the RAG engine for relevant methodologies to dynamically modify training templates (sets, reps, rest, volume, exercise rules) and data analysis default profiling boundaries.
- **Verification Suite** (`tests/test_rag.js`, `tests/runner.html`): Validates parsing, IndexedDB storing, Web Worker communication, and cosine similarity query matching.

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|-------------|--------|-----------------|
| 1 | Exploration & Technical Audit | Codebase audit of views, program logic, library availability, and planning | None | DONE | 3c76bdf5-7d71-4f17-9363-ec725605ffc7 |
| 2 | RAG Engine & Local Vector DB | Implement IndexedDB storage, doc parsing, local vectorizer Web Worker, and similarity search in `js/rag-engine.js` and `js/rag-worker.js` | M1 | DONE | 9beb8357-8556-40fd-977e-4f0a0d47a198 |
| 3 | UI Integration & AI Hook | Implement RAG view in `index.html`, `js/rag-ui.js` and integrate similarity context in `js/logic.js` + `js/data-analysis.js` | M2 | DONE | 02c6385c-655a-4d41-b8bd-aa83f1dff4d6 |
| 4 | Verification & Audit | Write `tests/test_rag.js`, execute test suites, run syntax validator, bump SW cache, and run Forensic Audit | M3 | IN_PROGRESS | 288722ed-5903-4dd9-9ea9-1388611f84e5 |

## Interface Contracts & Constraints
- **Offline-first**: Vector calculations and database lookups must operate fully offline.
- **IndexedDB DB Name**: `t7_rag_db`
- **IndexedDB Stores**:
  - `documents`: Stores `{ id, name, type, size, dateAdded }`
  - `chunks`: Stores `{ id, docId, docName, chunkIndex, text, embedding }`
- **RAG Engine API**:
  - `window.RAGEngine.addDocument(name, fileType, arrayBuffer)` -> parses, chunks, sends to worker for embeddings, saves to IndexedDB.
  - `window.RAGEngine.deleteDocument(docId)` -> deletes document and its chunks from IndexedDB.
  - `window.RAGEngine.queryMethodology(queryText, limit)` -> returns array of `{ text, score, docName }` ordered by similarity.
- **UI Binding Safety**: Ensure no NaN or undefined values ever render to the UI. Fallback to default metrics if RAG queries fail or return empty.
- **Syntax Check**: `py test_check.py` must run and output "All syntax checks passed."
- **Unit/Integration Tests**: `py run_all_js_tests.py` must run and pass.
