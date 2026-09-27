# Context

## Goal
The goal of this task is to:
1. Fix the document upload bug in the RAG section caused by local `file://` CORS restrictions by modifying `js/rag-engine.js` and `js/rag-worker.js`.
2. Optimize the document chunking strategy in `js/rag-engine.js` (`chunkText` function) based on research of industry-leading AI models (like OpenAI, Anthropic).

## Code Base Info
- `js/rag-engine.js`: Handles RAG operations, including loading the Web Worker or initializing transformers, chunking text, and interacting with the worker.
- `js/rag-worker.js`: The Web Worker script that loads `@xenova/transformers` and processes embeddings in a separate thread.
- `sw.js`: Service worker. Must bump its cache version whenever JS/CSS/assets are changed.
- Tests: `py run_all_js_tests.py` and `py test_check.py` need to be run to check correctness.

## Constraints
- Modify only strictly necessary files.
- Avoid any file modifications outside the project directory.
- Verify using Forensic Auditor to ensure no cheating.
