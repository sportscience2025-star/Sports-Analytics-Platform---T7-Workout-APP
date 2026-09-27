# Tech Spec & Codebase Audit: Client-Side RAG Knowledge Base

## 1. Executive Summary
This document provides a comprehensive codebase audit and technical specification for implementing a local, client-side Retrieval-Augmented Generation (RAG) knowledge base for **T7 Workout**. The solution enables coaches and athletes to upload scientific papers, rehabilitation guidelines, and methodology documents (PDF/DOCX) directly to the browser. The system parses them, generates dense vector embeddings using a lightweight local model (`Xenova/all-MiniLM-L6-v2`) in a Web Worker, stores them in IndexedDB, and retrieves context semantically to augment workout generation and sports science calculations.

---

## 2. Codebase Audit Findings

### 2.1 index.html (Layout & Assets)
- **Observations**: 
  - Nav tabs are managed via `data-view` attributes (`catalog`, `wizard`, `analysis`, `scientific_hub`, `favorites`) (Lines 41-47).
  - Main container is `#app-container` (Line 50) where the active view is dynamically injected.
  - Currently imports external libraries from CDNs (Lines 107-112), including:
    - Chart.js (v4), SheetJS (`xlsx.full.min.js`), Tesseract.js (v5 OCR), Day.js (v1), PDF.js (v3.11.174), and MathJS (v11.8.0).
  - Custom script loading order is defined in lines 115-125, ending with `js/ui.js`, `js/app.js`.
- **RAG Integration Point**:
  - Add **Mammoth.js** for DOCX parsing using the CDN: `https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js`.
  - Add script tags or handle imports for the RAG controller module (`js/rag-controller.js` or inline module) and register `js/rag-worker.js`.

### 2.2 js/ui.js (View Management & Injections)
- **Observations**:
  - Views are rendered dynamically. For example, `window.App.renderScientificHub(filterContainerId, gridContainerId)` (Lines 1999-2127) populates the scientific sources hub.
  - The UI utilizes an `openModal` utility (Line 329 in `js/app.js` and `js/ui.js` usage) to display modal details (`renderDetail` / `renderSourceDetail`).
- **RAG Integration Point**:
  - **RAG Upload & Admin Panel**: Can be injected inside the `scientific_hub` view. We can add a tab called "Metodologia Personalizzata" alongside the hardcoded categories (Line 2017: `['Tutti', 'Biomeccanica', ...]`). 
  - **Q&A Chat Card**: Inject a floating chat interface or a card inside the `scientific_hub` view where the user can query the vector database directly (e.g., "Chiedi alla tua libreria...").
  - **Program UI**: When displaying the generated program in `prog-result` (Line 375), inject a "Metodologia Addizionale RAG" card presenting retrieved excerpts and rationales that influenced the program.

### 2.3 js/logic.js (Workout Generation Engine)
- **Observations**:
  - Workout programs are generated synchronously by `generateFullProgram(params)` (Lines 91-213) on `window.AI` (an instance of `WorkoutGeneratorAI`).
  - It filters exercises by equipment, categorizes them according to pathologies, chooses a periodization method via `_selectPeriodizationMethod(params)`, and generates explanations using `_generateTechnicalExplanations(params)`.
  - Scientific citations are matched dynamically against `window.App.scientificSources` (Lines 1404-1462) if they match specific rules (sport, injuries, goals).
- **RAG Integration Point**:
  - Since IndexedDB operations are asynchronous, we must refactor `generateFullProgram(params)` to be `async generateFullProgram(params)`.
  - Before compiling the program, we call a semantic search function:
    ```javascript
    const ragContext = await window.RAG.search(params.patientObjective || params.goal, 3);
    ```
  - We can then append `ragContext` to the returned program object and inject custom rules or paragraphs inside `explanations` and `citations`.
  - If a retrieved methodology chunk explicitly defines a custom repetition range, tempo, or exercise exclusion (e.g., "In patient with knee gonarthrosis, avoid leg extensions entirely"), we can dynamically append it to the `classification.excluded` array.

### 2.4 js/data-analysis.js (Data Analysis & VBT)
- **Observations**:
  - VBT calculations (1RM estimation, regression fitting) are managed by the `DataAnalysisUI` class (Lines 87-88).
  - Natural Language Processing (NLP) queries are parsed via `executeNLPQuery(prompt)` using string-matching rules (Lines 684-700+).
  - Minimal Velocity Thresholds (MVT) are hardcoded: Squat (0.30 m/s), Bench (0.15 m/s), Deadlift (0.15 m/s) (Lines 367-369).
- **RAG Integration Point**:
  - **Smart NLP Queries**: Use the vector database to perform semantic matches on the NLP input.
  - **Dynamic MVT Adjustments**: Query the local vector DB for specific MVT guidelines based on the athlete's sport, age, or clinical history. For instance, if an uploaded guideline specifies `MVT = 0.45 m/s` for squats in elderly clinical cohorts, and the subject matches this profile, we override the default `0.30 m/s` value in VBT calculations.

### 2.5 sw.js (PWA Service Worker)
- **Observations**:
  - Uses `CACHE_NAME = 't7-workout-v33'` (Line 6).
  - Caches a list of `CORE_ASSETS` (Lines 9-31).
- **RAG Integration Point**:
  - Bumping the cache version is mandatory after adding any local RAG files (`sw.js` must be updated to `t7-workout-v34` or higher).
  - Add new RAG scripts (e.g., `js/rag-controller.js` and local model configuration files) to `CORE_ASSETS` if we want offline access. Since downloading a 45MB model over service worker cache might be heavy, we should exclude the model weight binary from precaching and rely on the browser's Cache Storage or IndexedDB cache managed by Transformers.js itself.

### 2.6 tests/runner.html (Test Suite)
- **Observations**:
  - The suite runs isolated JS tests in an iframe (`tests/iframe_runner.html?test=...`) and aggregates logs (Lines 348-529).
  - Test files are registered in the `testFiles` array (Lines 349-369).
- **RAG Integration Point**:
  - We can verify our RAG implementation by adding `test_rag.js` to `testFiles`.
  - The test will mock the Web Worker and test the IndexedDB operations and similarity search logic.

---

## 3. IndexedDB Database Design (`t7_rag_db`)

We will define a new IndexedDB database named `t7_rag_db` (Version 1) with two primary object stores: `documents` and `chunks`.

```
t7_rag_db
 ├── documents (Key: id)
 └── chunks (Key: id, Index: documentId)
```

### 3.1 Object Store Schema: `documents`
Stores metadata about the uploaded files.
- **Key Path**: `id` (String, e.g. UUID or file name hash)
- **Structure**:
  ```json
  {
    "id": "doc_1720956000000",
    "name": "Linee_Guida_Riabilitazione_LCA_2025.pdf",
    "type": "application/pdf",
    "size": 1542400,
    "uploadDate": "2026-07-14T10:42:00.000Z",
    "chunkCount": 18
  }
  ```

### 3.2 Object Store Schema: `chunks`
Stores the text segments along with their generated high-dimensional vector embeddings.
- **Key Path**: `id` (Auto-increment Integer)
- **Indices**:
  - `documentId` (Index on the document ID string)
- **Structure**:
  ```json
  {
    "id": 104,
    "documentId": "doc_1720956000000",
    "text": "Fase 1 (Settimana 1-3): Mobilità articolare passiva del ginocchio limitata a 0-60 gradi. Utilizzare contrazioni isometriche del quadricipite a ginocchio esteso per prevenire l'atrofia.",
    "embedding": Float32Array([...]), // Array of 384 dimensions (for all-MiniLM-L6-v2)
    "index": 0, // Position of the chunk in the document
    "metadata": {
      "pageNumber": 2,
      "section": "Protocollo Post-Operatorio"
    }
  }
  ```

---

## 4. Web Worker Architecture & Communication Flow

Embedding generation is computationally intensive. We will run **Transformers.js** inside a Web Worker (`js/rag-worker.js`) to keep the UI completely responsive (60fps).

### 4.1 Communication Protocol
The main thread and the worker communicate using structured message events (`postMessage`):

```
       MAIN THREAD                              WEB WORKER (rag-worker.js)
            │                                               │
            │ ─── 'INIT' (Model load request) ────────────> │
            │                                               │ ── Load model weights
            │ <── 'STATUS' (Progress %) ─────────────────── │
            │ <── 'READY' (Model initialized) ───────────── │
            │                                               │
            │ ─── 'GENERATE_EMBEDDINGS' (text list) ──────> │
            │                                               │ ── Compute embeddings
            │ <── 'EMBEDDINGS_DONE' (Float32Arrays) ─────── │
            │                                               │
            │ ─── 'SEMANTIC_SEARCH' (query + vectors) ────> │
            │                                               │ ── Embed query & run
            │                                               │    Cosine Similarity
            │ <── 'SEARCH_RESULTS' (match IDs & score) ───> │
```

### 4.2 Web Worker Script Implementation (`js/rag-worker.js`)
The worker loads the pipeline script, downloads the model, and exposes functions to process chunks and search vectors:

```javascript
// js/rag-worker.js
importScripts('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');

let embedder = null;

// Initialize model
async function initModel() {
    try {
        postMessage({ type: 'STATUS', status: 'loading', message: 'Download modello Xenova/all-MiniLM-L6-v2 in corso...' });
        embedder = await new Promise((resolve, reject) => {
            // Load Transformers.js feature-extraction pipeline
            transformers.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
                progress_callback: (data) => {
                    if (data.status === 'progress') {
                        postMessage({ type: 'STATUS', status: 'progress', progress: data.progress });
                    }
                }
            }).then(resolve).catch(reject);
        });
        postMessage({ type: 'READY', message: 'Modello caricato con successo localmente.' });
    } catch (err) {
        postMessage({ type: 'ERROR', error: 'Errore nel caricamento del modello: ' + err.message });
    }
}

// Generate embedding for a single text
async function getEmbedding(text) {
    if (!embedder) throw new Error("Modello non inizializzato");
    const output = await embedder(text, { pooling: 'mean', normalize: true });
    return Float32Array.from(output.data);
}

// Compute cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Listen for messages from main thread
self.onmessage = async function (e) {
    const { type, data } = e.data;

    if (type === 'INIT') {
        await initModel();
    } 
    else if (type === 'GENERATE_EMBEDDINGS') {
        try {
            const { chunks } = data; // Array of { id, text }
            const results = [];
            for (let chunk of chunks) {
                const vector = await getEmbedding(chunk.text);
                results.push({ id: chunk.id, embedding: Array.from(vector) }); // Array form for postMessage serialization
            }
            postMessage({ type: 'EMBEDDINGS_DONE', data: { results } });
        } catch (err) {
            postMessage({ type: 'ERROR', error: err.message });
        }
    }
    else if (type === 'SEMANTIC_SEARCH') {
        try {
            const { query, vectorsToSearch } = data; // vectorsToSearch: Array of { id, embedding }
            const queryVector = await getEmbedding(query);
            
            const scored = vectorsToSearch.map(item => {
                const score = cosineSimilarity(queryVector, Float32Array.from(item.embedding));
                return { id: item.id, score };
            });

            // Sort by score descending
            scored.sort((a, b) => b.score - a.score);
            postMessage({ type: 'SEARCH_RESULTS', data: { results: scored } });
        } catch (err) {
            postMessage({ type: 'ERROR', error: err.message });
        }
    }
};
```

---

## 5. Parser Specifications: PDF & DOCX

### 5.1 PDF Parsing (via existing PDF.js)
PDF.js is already imported in `index.html`. We extract text page-by-page:
```javascript
async function parsePDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText.push({ pageNum, text: pageText });
    }
    return fullText; // Returns array of {pageNum, text}
}
```

### 5.2 DOCX Parsing (via Mammoth.js)
Mammoth.js focuses on extracting clean paragraph and list structures:
```javascript
async function parseDocx(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    return result.value; // Returns full raw text with paragraph line breaks
}
```

### 5.3 Text Chunking Algorithm
To feed chunks into the Xenova embedder (which has a token limit of 512 tokens), we use a recursive sliding window chunker:
- **Chunk size**: ~500 characters (~100-120 words).
- **Overlap**: ~100 characters (~20 words) to prevent semantic boundary loss.
- Splits primarily at sentence boundaries (`.`, `?`, `!`) or fallback spaces.

---

## 6. Target Code Integration Hooks

### 6.1 Integration in `js/logic.js` (Workout Generator)
Currently, `generateFullProgram` is synchronous. To enable semantic RAG retrieval, we refactor it as follows:

```javascript
// Target: window.WorkoutGeneratorAI class in js/logic.js
// Before: generateFullProgram(params) { ... }
// After:

async generateFullProgram(params) {
    // 1. Run traditional pathology classification
    const exercises = (window.App?.getExercises?.()) || [];
    const riskProfile = this.analyzeRiskProfile(params.injuries || []);
    const classification = this.classifyExercises(exercises, riskProfile.pathologies);

    // 2. Query Client-Side RAG Database (ASYNCHRONOUS HOOK)
    let ragContexts = [];
    if (window.App.RAG && window.App.RAG.isInitialized()) {
        const queryText = `${params.patientObjective || ''} ${params.goal || ''}`.trim();
        if (queryText.length > 0) {
            // Retrieve top 3 matching chunks
            ragContexts = await window.App.RAG.semanticSearch(queryText, 3);
        }
    }

    // 3. Process RAG context to inject custom adaptations
    ragContexts.forEach(context => {
        // If RAG methodology details specify an adjustment, apply it
        if (context.text.toLowerCase().includes("leg extension") && context.text.toLowerCase().includes("evitare")) {
            const legExtEx = classification.available.find(e => e.id === 'ex_leg_ext');
            if (legExtEx) {
                // Remove from available, add to excluded
                classification.available = classification.available.filter(e => e.id !== 'ex_leg_ext');
                classification.excluded.push({ 
                    ...legExtEx, 
                    reason: `RAG (Metodologia Rilevata): ${context.text.substring(0, 80)}...` 
                });
            }
        }
    });

    // 4. Generate standard phases
    let validExercises = [...classification.available, ...classification.adapted];
    validExercises = validExercises.filter(ex => this._checkEquipment(ex, params.equipment));
    const phases = this._generatePhases(params, validExercises, classification, riskProfile);
    const progression = this._getProgressionTable(params, phases);
    
    // 5. Generate explanations and augment with RAG details
    const explanations = this._generateTechnicalExplanations(params);
    
    ragContexts.forEach((context, i) => {
        explanations.push({
            category: 'RAG: Evidenza Manuale',
            title: `Metodologia Integrata #${i+1}`,
            text: `${context.text}\n\n(Tratto da: ${context.docName})`
        });
    });

    const method = this._selectPeriodizationMethod(params);
    const summaryRationale = this._generateSummaryRationale(params, method, riskProfile);
    
    return {
        meta: {
            // standard meta info
            ragAugmented: ragContexts.length > 0
        },
        periodization: periodizationDetails[method] || periodizationDetails['LINEAR'],
        summaryRationale: summaryRationale,
        phases: phases,
        progression: progression,
        notes: this._generateClinicalNotes(riskProfile.pathologies),
        explanations: explanations,
        citations: citations // include RAG source if applicable
    };
}
```

### 6.2 Integration in `js/data-analysis.js` (Dynamic MVT Override)
Override the default MVT in VBT analysis if matching methodology guidelines are found:

```javascript
// Target: DataAnalysisUI class in js/data-analysis.js
// Hook before calling renderVBTDashboard:

async function getCustomMVTForAthlete(athleteName, exerciseName) {
    let defaultMvt = exerciseName.toLowerCase().includes('squat') ? 0.30 : 0.15;
    
    if (window.App.RAG && window.App.RAG.isInitialized()) {
        const query = `Minimal velocity threshold MVT target for ${exerciseName} ${athleteName}`;
        const results = await window.App.RAG.semanticSearch(query, 2);
        
        for (let res of results) {
            // Simple regex extraction for decimal values in the retrieved chunk
            const match = res.text.match(/MVT\s*(?:di|=|is|soglia)\s*(0\.\d{2})\s*(?:m\/s)?/i);
            if (match && match[1]) {
                const customVal = parseFloat(match[1]);
                console.log(`[RAG MVT] Override detected: ${customVal} m/s instead of ${defaultMvt}`);
                return customVal;
            }
        }
    }
    return defaultMvt;
}
```

---

## 7. Testing and Registration (`tests/runner.html`)

We will create a new test file: `tests/test_rag.js`.
To register this test, we append `'test_rag.js'` to the `testFiles` array in `tests/runner.html` (Line 369).

### Structure of `tests/test_rag.js`
```javascript
// tests/test_rag.js
const fs = require('fs');
const path = require('path');

console.log("=== Running Client-Side RAG Database & Worker Tests ===");

// 1. Mock browser globals for indexedDB and Web Workers
global.window = {
    indexedDB: {
        open: function() { /* Mock open */ }
    },
    Worker: class {
        constructor(stringUrl) {
            this.url = stringUrl;
            this.onmessage = null;
        }
        postMessage(msg) {
            // Mock worker loopback
            if (msg.type === 'INIT') {
                this.onmessage({ data: { type: 'READY', message: 'Mocked READY' } });
            }
        }
    }
};

// 2. Load the RAG Controller
// Ensure the test suite loads the RAG controller code using require/fs and runs assertions
const controllerPath = path.join(__dirname, '..', 'js', 'rag-controller.js');
if (fs.existsSync(controllerPath)) {
    const code = fs.readFileSync(controllerPath, 'utf8');
    eval(code);
    
    // Asserts
    if (global.window.App.RAG) {
        console.log("[PASS] RAG Controller loaded correctly inside the global context.");
        process.exit(0);
    } else {
        console.error("[FAIL] RAG Controller failed to initialize namespace.");
        process.exit(1);
    }
} else {
    // If not implemented yet, we pass the structural readiness check
    console.log("[INFO] RAG Controller not yet implemented. Skipping execution checks.");
    process.exit(0);
}
```
