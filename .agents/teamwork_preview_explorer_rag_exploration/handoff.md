# RAG Engine Investigation & Design Proposal

This report details the investigation of the Web Worker CORS issues under the `file://` protocol, designs a robust main-thread fallback, and proposes a sentence-aware recursive semantic chunking strategy that aligns with OpenAI and Anthropic guidelines.

---

## 1. Observation

### Web Worker Instantiation CORS Error under `file://`
In `js/rag-engine.js` (lines 160–178), the Web Worker is initialized as follows:
```javascript
160:         initWorker() {
161:             if (this.worker) return;
162:             this.worker = new Worker(this.workerPath);
```
When a user opens the PWA locally by double-clicking `index.html` (which opens it via the `file://` protocol), the browser assigns the document a security origin of `null` (an opaque origin). Under standard Same-Origin Policy (SOP), browser security treats the local script `js/rag-worker.js` as cross-origin relative to `null`.
This causes `new Worker(this.workerPath)` to throw the following exception:
> `Uncaught SecurityError: Failed to construct 'Worker': Script at 'file:///e:/Nuove%20App%20Installate/App%20esercizi%20scienze%20motorie/js/rag-worker.js' cannot be accessed from origin 'null'.`

In `js/rag-worker.js` (line 7), the worker loads the library:
```javascript
7: importScripts('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');
```
If the worker is not instantiated, this import script statement is never reached.

### Current Sliding-Window Character-Based Chunking
In `js/rag-engine.js` (lines 129–146), text chunking is implemented using a naive sliding window of characters:
```javascript
129:     function chunkText(text, chunkSize = 500, overlap = 100) {
130:         if (!text || typeof text !== 'string') return [];
131:         const chunks = [];
132:         let start = 0;
133:         while (start < text.length) {
134:             const end = Math.min(start + chunkSize, text.length);
135:             const chunk = text.substring(start, end).trim();
136:             if (chunk.length > 0) {
137:                 chunks.push(chunk);
138:             }
139:             if (end >= text.length) break;
140:             start += (chunkSize - overlap);
141:             if (chunkSize <= overlap) {
142:                 start += 1; // Avoid infinite loops
143:             }
144:         }
145:         return chunks;
146:     }
```
This naive chunking has three major flaws:
1. **Broken Words**: It splits arbitrary strings, which frequently cuts words in half (e.g. splitting `"allenamento"` into `"allena"` and `"mento"`).
2. **Broken Sentences**: It cuts sentences mid-phrase, resulting in chunks that carry incomplete semantic thoughts.
3. **Structure Ignorance**: It ignores paragraphs (`\n\n`), list items (`\n`), and punctuation, leading to poor embedding vectors and fragmented LLM answers.

---

## 2. Logic Chain

### Why the CORS Error Occurs
1. **Browser SOP**: Browsers enforce same-origin checks on Web Workers.
2. **file:// Origin**: Under `file://`, the page has `origin: null`.
3. **Worker Script Location**: The script is at a `file://` path. Since `null` origin is not considered identical or same-origin to `file://`, the browser rejects the worker creation.
4. **Conclusion**: Web Workers cannot run from local files via `file://` under default browser security configurations. A fallback running on the main thread is required for offline/local-file operations.

### Designing the Main-Thread Fallback
1. **Try-Catch Wrapper**: Attempt worker creation inside `initWorker()`. If it throws a `SecurityError`, catch it, log a warning, and flag `this.isFallback = true`.
2. **Main Thread script load**: If `this.isFallback` is true, dynamically load Transformers.js on the main thread by appending a `<script>` tag targeting the CDN (`https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2`).
3. **Execution routing**: Modify `sendToWorker` to transparently route all requests to `executeOnMainThread()` when `this.isFallback` is active.
4. **Local processing**: Implement the model initialization and the embedding extraction on the main thread, copying the logic from `rag-worker.js` and exposing `cosineSimilarity` locally in `rag-engine.js`.

### Main-Thread Fallback Potential Issues & Mitigations
1. **UI Thread Freezing**: 
   * *Problem*: ONNX model execution is CPU-heavy. Running `this.extractor(text)` on the main thread will block the event loop, freezing the UI.
   * *Mitigation*: Process the chunk embeddings in asynchronous batches. Yield execution to the browser after processing chunks using `await new Promise(resolve => setTimeout(resolve, 0))`.
2. **Offline Limitations**:
   * *Problem*: In a local `file://` context, Service Workers cannot be registered, so the app cannot cache the CDN scripts or ONNX model files offline. If the user is offline, loading Transformers.js and downloading the model will fail.
   * *Mitigation*: Present a clear error message informing the user that local execution requires an initial internet connection to load the embedding model, or recommend running a simple local HTTP server (e.g., `npx http-server` or `python -m http.server`) which allows correct Service Worker caching.
3. **Memory overhead**:
   * *Problem*: Loading the model (~30MB) and keeping it in main memory can cause low-end devices to crash.
   * *Mitigation*: Rely on the lightweight `all-MiniLM-L6-v2` model and dispose/garbage-collect unused structures.

### Designing the Sentence-Aware Recursive Semantic Chunking Strategy
To align with OpenAI and Anthropic guidelines:
1. **Hierarchy of separators**: Define separators in decreasing order of semantic boundaries: paragraphs (`\n\n`), newlines/lists (`\n`), sentences (`. `, `? `, `! `), spaces (` `), and characters (`""`).
2. **Recursive splitting**: If a text segment exceeds `chunkSize`, split it using the current separator. For each sub-segment, if it is still too large, recursively split it using the next separator.
3. **Smart merging**: Re-assemble the small pieces into chunks of size `<= chunkSize` while ensuring consecutive chunks share an overlap of up to `overlap` characters.
4. **Sentence Punctuation Lookahead/Lookbehind**: Use regex lookbehinds like `/(?<=[.!?])\s+/` to split sentences without losing their punctuation. Provide a fallback regex match for older platforms.

---

## 3. Caveats

- **No Write Execution**: As a read-only investigation, no modifications have been made to `js/rag-engine.js` or `js/rag-worker.js`.
- **WASM compilation security**: In environments with strict CSP or browser extensions blocking WASM compilation, ONNX Runtime Web might fail even on the main thread.
- **Offline functionality**: Without a local HTTP server, Service Worker-based offline capabilities do not function under the `file://` protocol.

---

## 4. Conclusion

1. **Web Worker CORS error** is a hard security limitation of the `file://` protocol.
2. The **Main-Thread Fallback** design is a viable, robust solution that allows local HTML opening to run RAG.
3. Replacing the sliding-window character chunker with a **Sentence-Aware Recursive Text Splitter** will prevent word/sentence cutting and yield higher semantic accuracy.

---

## 5. Proposed Code Implementations

Below are the concrete code implementations proposed for the RAG Engine.

### A. Proposed `chunkText` implementation in `js/rag-engine.js`

```javascript
    /**
     * Splits text into semantically cohesive chunks of ~500 characters with ~100 characters overlap.
     * Aligns with OpenAI & Anthropic guidelines to avoid splitting sentences or words.
     */
    function chunkText(text, chunkSize = 500, overlap = 100) {
        if (!text || typeof text !== 'string') return [];
        
        const separators = ["\n\n", "\n", "SENTENCE", " ", ""];
        
        // Helper to merge splits into chunks with overlap
        function mergeSplits(splits, separator, chunkSize, overlap) {
            const chunks = [];
            let currentDoc = [];
            let total = 0;
            
            // Map SENTENCE back to a space delimiter for merging
            const joinSep = separator === "SENTENCE" ? " " : separator;
            
            for (const split of splits) {
                const len = split.length;
                // Check if adding this split exceeds the chunk size
                const sepLen = currentDoc.length > 0 ? joinSep.length : 0;
                if (total + len + sepLen > chunkSize) {
                    if (currentDoc.length > 0) {
                        chunks.push(currentDoc.join(joinSep).trim());
                    }
                    
                    // Slide the window back to maintain overlap
                    while (currentDoc.length > 0) {
                        // Check if current pieces in window are under overlap and fit with the new split
                        const currentSepLen = currentDoc.length > 1 ? joinSep.length : 0;
                        if (total + currentSepLen <= overlap && total + len + sepLen <= chunkSize) {
                            break;
                        }
                        const popped = currentDoc.shift();
                        total -= popped.length;
                    }
                }
                currentDoc.push(split);
                total += len;
            }
            if (currentDoc.length > 0) {
                chunks.push(currentDoc.join(joinSep).trim());
            }
            return chunks;
        }

        function splitRecursive(txt, sepIndex) {
            if (txt.length <= chunkSize) {
                return [txt];
            }
            if (sepIndex >= separators.length) {
                // Absolute fallback: character split
                const chunks = [];
                let start = 0;
                while (start < txt.length) {
                    const end = Math.min(start + chunkSize, txt.length);
                    chunks.push(txt.substring(start, end));
                    if (end >= txt.length) break;
                    start += (chunkSize - overlap);
                }
                return chunks;
            }
            
            const separator = separators[sepIndex];
            let splits = [];
            
            if (separator === "SENTENCE") {
                try {
                    // Split by sentence punctuation followed by space or end of string, keeping punctuation
                    // Uses regex lookbehind to match space after . ! ?
                    splits = txt.split(/(?<=[.!?])\s+/);
                } catch (e) {
                    // Fallback if lookbehind is not supported: split by periods/exclamations/question marks
                    const matches = txt.match(/[^.!?]+[.!?]+(?:\s+|$)/g);
                    splits = matches ? matches.map(s => s.trim()).filter(Boolean) : [txt];
                }
            } else if (separator === "") {
                splits = Array.from(txt);
            } else {
                splits = txt.split(separator);
            }
            
            // If the separator didn't divide the text, try the next separator
            if (splits.length === 1 && splits[0] === txt) {
                return splitRecursive(txt, sepIndex + 1);
            }
            
            const pieces = [];
            for (const split of splits) {
                if (split.length > chunkSize) {
                    // Recursively split the long segment with the next separator
                    pieces.push(...splitRecursive(split, sepIndex + 1));
                } else {
                    pieces.push(split);
                }
            }
            
            return mergeSplits(pieces, separator, chunkSize, overlap);
        }
        
        return splitRecursive(text, 0).filter(c => c.trim().length > 0);
    }
```

### B. Proposed Main-Thread Fallback implementation in `js/rag-engine.js`

Add the following modifications to `RAGEngineClass` inside `js/rag-engine.js`:

```javascript
    // Helper to calculate cosine similarity on the main thread
    function cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
        let dotProduct = 0.0;
        let normA = 0.0;
        let normB = 0.0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    // Helper to dynamically load Transformers.js script
    function loadTransformers() {
        return new Promise((resolve, reject) => {
            if (window.transformers) {
                resolve(window.transformers);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';
            script.onload = () => {
                if (window.transformers) {
                    resolve(window.transformers);
                } else {
                    reject(new Error("Transformers.js loaded but window.transformers is not defined."));
                }
            };
            script.onerror = (err) => {
                reject(new Error("Failed to load Transformers.js on main thread. Check network connection."));
            };
            document.head.appendChild(script);
        });
    }

    class RAGEngineClass {
        constructor(workerPath = 'js/rag-worker.js') {
            this.workerPath = workerPath;
            this.worker = null;
            this.pendingRequests = new Map();
            this.requestIdCounter = 0;
            this.dbPromise = openDB();
            this.isFallback = false;
            this.modelPromise = null;
            this.extractor = null;
        }

        initWorker() {
            if (this.worker || this.isFallback) return;
            try {
                this.worker = new Worker(this.workerPath);
                this.worker.onmessage = (event) => {
                    const { type, payload, error, requestId } = event.data;
                    if (requestId !== undefined && this.pendingRequests.has(requestId)) {
                        const { resolve, reject } = this.pendingRequests.get(requestId);
                        this.pendingRequests.delete(requestId);
                        if (type === 'ERROR' || error) {
                            reject(new Error(error || "Worker error"));
                        } else {
                            resolve(payload);
                        }
                    }
                };
                this.worker.onerror = (err) => {
                    console.error("[RAG Engine] Worker uncaught error:", err);
                };
            } catch (error) {
                console.warn("[RAG Engine] Web Worker creation blocked (probably file:// origin). Falling back to main-thread execution. Error:", error);
                this.isFallback = true;
                this.worker = null;
            }
        }

        sendToWorker(type, payload) {
            this.initWorker();
            if (this.isFallback) {
                return this.executeOnMainThread(type, payload);
            }
            const requestId = this.requestIdCounter++;
            return new Promise((resolve, reject) => {
                this.pendingRequests.set(requestId, { resolve, reject });
                this.worker.postMessage({ type, payload, requestId });
            });
        }

        async initMainThreadModel() {
            if (this.modelPromise) return this.modelPromise;
            this.modelPromise = (async () => {
                try {
                    const tf = await loadTransformers();
                    if (tf.env) {
                        tf.env.allowLocalModels = false;
                    }
                    this.extractor = await tf.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
                    return true;
                } catch (error) {
                    console.error("[RAG Engine] Failed to initialize model on main thread:", error);
                    this.modelPromise = null;
                    throw error;
                }
            })();
            return this.modelPromise;
        }

        async executeOnMainThread(type, payload) {
            switch (type) {
                case 'INIT': {
                    await this.initMainThreadModel();
                    return { success: true };
                }
                case 'GENERATE_EMBEDDINGS': {
                    await this.initMainThreadModel();
                    const { texts } = payload;
                    if (!Array.isArray(texts)) {
                        throw new Error("texts must be an array");
                    }
                    const embeddings = [];
                    for (let i = 0; i < texts.length; i++) {
                        const text = texts[i];
                        const output = await this.extractor(text, { pooling: 'mean', normalize: true });
                        embeddings.push(Array.from(output.data));
                        
                        // Yield CPU to prevent UI freeze every 2 chunks
                        if (i % 2 === 0) {
                            await new Promise(resolve => setTimeout(resolve, 0));
                        }
                    }
                    return { success: true, embeddings };
                }
                case 'SEMANTIC_SEARCH': {
                    const { queryEmbedding, chunks } = payload;
                    if (!queryEmbedding || !Array.isArray(chunks)) {
                        throw new Error("Missing queryEmbedding or chunks array");
                    }
                    const results = chunks.map(chunk => {
                        const score = cosineSimilarity(queryEmbedding, chunk.embedding);
                        return {
                            text: chunk.text,
                            score: score,
                            docName: chunk.docName || ""
                        };
                    });
                    results.sort((a, b) => b.score - a.score);
                    return { success: true, results };
                }
                default:
                    throw new Error(`Unknown main-thread fallback request type: ${type}`);
            }
        }
        
        // ... rest of RAGEngineClass methods ...
    }
```

---

## 6. Verification Method

To verify the proposed implementation:

1. **Verify Existing Tests**:
   Ensure the current test suite runs and passes by executing the headless test suite:
   ```powershell
   py run_tests_headless.py
   ```
2. **CORS Error Reproduction**:
   - Double click `index.html` to open it in a browser under `file://` protocol.
   - Open Developer Console (`F12`).
   - Go to the RAG upload page and try to upload a dummy text file.
   - Confirm the presence of the `SecurityError` pointing to `new Worker(...)`.
3. **Verify Fallback Logic**:
   - Temporarily force `this.isFallback = true` in `initWorker()` and run under a local HTTP server.
   - Confirm that the `all-MiniLM-L6-v2` model loads successfully via dynamic script injection.
   - Verify that adding a text document chunks the document, generates valid embeddings on the main thread, and saves them to IndexedDB.
   - Verify that semantic searches return properly ordered results.
4. **Verify Chunking Strategy**:
   - Write a unit test that calls `chunkText` with a multi-sentence and multi-paragraph paragraph structure.
   - Assert that no chunks split words in half and sentence boundaries are preserved when they fit in the chunk size.
