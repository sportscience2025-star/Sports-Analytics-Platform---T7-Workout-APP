# Plan: Fix local file:// CORS restrictions and Optimize RAG Chunking Strategy

## Phase 1: Exploration
- [ ] Task 1.1: Explore current implementation of the RAG engine in `js/rag-engine.js` and `js/rag-worker.js`.
- [ ] Task 1.2: Check current loading behavior of the `@xenova/transformers` model and the Web Worker initialization code.
- [ ] Task 1.3: Examine the current `chunkText` implementation in `js/rag-engine.js`.
- [ ] Task 1.4: Research advanced chunking strategies of top-tier AI models (OpenAI, Anthropic).

## Phase 2: Implementation Design
- [ ] Task 2.1: Propose a fallback mechanism for loading the RAG model directly on the main thread or via a Blob URL if opened using the `file://` protocol.
- [ ] Task 2.2: Propose optimized chunking logic (chunk size, overlap, character/semantic/recursive splitting) for `chunkText`.
- [ ] Task 2.3: Create draft modifications for `js/rag-engine.js` and `js/rag-worker.js`.

## Phase 3: Dispatch & Execution
- [ ] Task 3.1: Spawn an Explorer subagent to detail the changes.
- [ ] Task 3.2: Spawn a Worker subagent to apply the changes to `js/rag-engine.js`, `js/rag-worker.js`, and bump `sw.js` cache.
- [ ] Task 3.3: Synthesize and coordinate subagent outputs.

## Phase 4: Verification & Testing
- [ ] Task 4.1: Spawn Reviewer subagent to review the changes.
- [ ] Task 4.2: Spawn Challenger subagent to run JS tests (`py run_all_js_tests.py`, `py test_check.py`).
- [ ] Task 4.3: Run Forensic Auditor to ensure no cheating / compliance.
