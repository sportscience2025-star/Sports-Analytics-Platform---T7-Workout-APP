## 2026-07-16T15:39:27Z
Implement local Web Worker bypass for file:// protocol and optimize RAG chunking in js/rag-engine.js.
Specifically:
1. Integrate the main-thread fallback in js/rag-engine.js that catches SecurityError or detects file:// protocol, loads Transformers.js dynamically via CDN (https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2), processes embeddings on the main thread using CPU yielding (setTimeout(resolve, 0)), and implements cosine similarity locally.
2. Replace chunkText in js/rag-engine.js with the proposed sentence-aware recursive splitting strategy that matches OpenAI/Anthropic guidelines (never splitting words, keeping sentence/paragraph structure where possible, and sliding back for overlap).
3. Bump the Service Worker cache version in sw.js (from t7-workout-v39 to t7-workout-v40).
4. Run py test_check.py to verify syntax check passes, and py run_all_js_tests.py to verify that all RAG tests pass successfully.
5. Write your handoff report to e:\Nuove App Installate\App esercizi scienze motorie\.agents\teamwork_preview_worker_rag_implementation\handoff.md and send a message back when done.
