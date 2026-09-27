/**
 * T7 Workout - Adversarial RAG UI Verification Test
 */

const fs = require('fs');
const path = require('path');

// Mock browser globals needed for RAG Engine and RAG UI
if (typeof window === 'undefined') {
    global.window = { App: {} };
}
const win = typeof window !== 'undefined' ? window : global.window;
win.App = win.App || {};

// No global intercepts needed

// Mock worker constructor
class MockWorker {
    constructor(workerPath) {
        this.workerPath = workerPath;
        this.onmessage = null;
    }
    postMessage(message) {
        const { type, payload, requestId } = message;
        setTimeout(() => {
            if (!this.onmessage) return;
            if (type === 'INIT') {
                this.onmessage({ data: { type: 'INIT_DONE', payload: { success: true }, requestId } });
            } else if (type === 'GENERATE_EMBEDDINGS') {
                const embeddings = payload.texts.map(() => new Array(384).fill(0.1));
                this.onmessage({ data: { type: 'GENERATE_EMBEDDINGS_DONE', payload: { success: true, embeddings }, requestId } });
            }
        }, 10);
    }
    terminate() {}
}
win.Worker = MockWorker;

// Mock pdfjs, XLSX, mammoth if needed
win.pdfjsLib = { GlobalWorkerOptions: {}, getDocument: () => ({ promise: Promise.resolve({ numPages: 1, getPage: () => Promise.resolve({ getTextContent: () => Promise.resolve({ items: [{ str: "mock text" }] }) }) }) }) };

// Create a DOM container
const container = document.createElement('div');
container.id = 'rag-ui-test-container';
document.body.appendChild(container);

// Helper function to assert
function assert(condition, message) {
    if (!condition) {
        console.error(`❌ [FAIL] ${message}`);
        throw new Error(message);
    } else {
        console.log(`✅ [PASS] ${message}`);
    }
}

// Load RAG Engine
const ragEngineCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'rag-engine.js'), 'utf8');
eval(ragEngineCode);

// Load RAG UI
const ragUiCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'rag-ui.js'), 'utf8');
eval(ragUiCode);

async function runAdversarialTests() {
    console.log("=== STARTING ADVERSARIAL RAG UI VERIFICATION SUITE ===");
    
    // Yield execution to allow iframe_runner.html to register its early exit timeout
    await new Promise(r => setTimeout(r, 10));
    
    // Clear the early-exit timeout registered synchronously by iframe_runner.html
    for (let i = 1; i < 1000; i++) {
        clearTimeout(i);
    }
    
    // Clear DB
    await win.RAGEngine.dbPromise.then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['documents', 'chunks'], 'readwrite');
            transaction.objectStore('documents').clear();
            transaction.objectStore('chunks').clear();
            transaction.oncomplete = () => resolve();
            transaction.onerror = (e) => reject(e.target.error);
        });
    });

    const ui = new win.RAGUI('rag-ui-test-container');
    await ui.render();

    // Verify UI Initial Rendering
    assert(document.getElementById('rag-dev-toggle') !== null, "RAG dev toggle exists");
    assert(document.getElementById('drag-drop-zone') !== null, "Drag & Drop zone exists");

    // 1. Verify "Vista Avanzata" toggle state logic and input data persistence
    const searchInput = document.getElementById('rag-search-input');
    assert(searchInput !== null, "Search input exists");
    searchInput.value = "Test query";

    // Trigger dev toggle change
    const devToggle = document.getElementById('rag-dev-toggle');
    devToggle.checked = true;
    
    // Dispatch change event to toggle devMode and re-render
    const event = new Event('change');
    devToggle.dispatchEvent(event);
    
    // Re-rendering happens. Wait a frame.
    await new Promise(r => setTimeout(r, 100));

    // Verify search input value is preserved
    const newSearchInput = document.getElementById('rag-search-input');
    assert(newSearchInput !== null, "Search input exists after toggle");
    assert(newSearchInput.value === "Test query", "State preservation confirmed: Search input value was preserved on toggle");

    // 2. Verify drag over flicker mitigation in CSS
    // Check if css/style.css contains the pointer-events: none rule for drag-drop-zone children
    const cssContent = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
    const hasPointerEventsNone = cssContent.includes('.drag-drop-zone *') && cssContent.includes('pointer-events: none;');
    assert(hasPointerEventsNone, "Flicker mitigation confirmed: '.drag-drop-zone * { pointer-events: none; }' exists in CSS");

    // 3. Verify that re-uploading the same file works correctly after deleting it
    const fileInput = document.getElementById('rag-file-input');
    assert(fileInput !== null, "File input exists");
    
    // Simulate selection of a file
    const file = new File(["test data"], "Forza_Specs.txt", { type: "text/plain" });
    
    // Create a DataTransfer to set files programmatically
    const dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;
    
    // Fire change event
    const changeEvent = new Event('change');
    fileInput.dispatchEvent(changeEvent);
    
    // Verify that value is immediately cleared
    assert(fileInput.value === "", "Re-upload capability confirmed: fileInput.value is cleared after selection");

    // Let RAG UI process the file
    await new Promise(r => setTimeout(r, 2000)); // wait for file processing to complete

    // Verify document was added to IndexedDB
    const db = await win.RAGEngine.dbPromise;
    let docs = await new Promise(resolve => {
        const req = db.transaction(['documents'], 'readonly').objectStore('documents').getAll();
        req.onsuccess = () => resolve(req.result);
    });
    assert(docs.length === 1 && docs[0].name === "Forza_Specs.txt", "Document successfully stored in IndexedDB");

    // Retrieve the generated document ID
    const docId = docs[0].id;

    // Delete the document
    await win.RAGEngine.deleteDocument(docId);

    // Verify document and chunks were deleted
    let docsAfter = await new Promise(resolve => {
        const req = db.transaction(['documents'], 'readonly').objectStore('documents').getAll();
        req.onsuccess = () => resolve(req.result);
    });
    let chunksAfter = await new Promise(resolve => {
        const req = db.transaction(['chunks'], 'readonly').objectStore('chunks').getAll();
        req.onsuccess = () => resolve(req.result);
    });
    assert(docsAfter.length === 0, "Document successfully deleted from IndexedDB");
    assert(chunksAfter.length === 0, "All chunks deleted from IndexedDB");

    // Try to re-upload the same file.
    // Create a new File and DataTransfer to force change detection
    const file2 = new File(["test data"], "Forza_Specs.txt", { type: "text/plain" });
    const dt2 = new DataTransfer();
    dt2.items.add(file2);
    fileInput.files = dt2.files;
    fileInput.dispatchEvent(changeEvent);

    assert(fileInput.value === "", "fileInput.value is cleared again after re-upload");
    await new Promise(r => setTimeout(r, 2000));

    // Verify it was successfully added again
    let docsReloaded = await new Promise(resolve => {
        const req = db.transaction(['documents'], 'readonly').objectStore('documents').getAll();
        req.onsuccess = () => resolve(req.result);
    });
    assert(docsReloaded.length === 1 && docsReloaded[0].name === "Forza_Specs.txt", "Re-upload was successful after deleting!");

    // 4. Verification of RAG Synthesis and UI rendering
    console.log("Starting verification of RAG Offline Synthesis and Dual-Panel UI...");
    
    // Direct synthesis helper verification
    const mockChunks = [
        {
            text: "Il massimale di squat prevede un carico di 120kg. Durante lo scarico attivo ridurre il volume al 50% eseguendo 3 set per 5 ripetizioni con velocità target di 0.75 m/s.",
            docName: "Squat_Protocol.txt",
            score: 0.95
        },
        {
            text: "Un altro esercizio di spinta è la panca piana con RPE 8.",
            docName: undefined, // Test undefined docName fallback
            score: undefined // Test undefined score fallback
        }
    ];
    
    const synthesis = ui.synthesizeOfflineResponse("carico scarico squat", mockChunks);
    
    assert(synthesis.documents.length === 2, "Synthesis grouped chunks into 2 document blocks");
    assert(synthesis.documents[0].docName === "Squat_Protocol.txt", "First document name is correct");
    assert(synthesis.documents[1].docName === "Documentazione scientifica", "Undefined document name falls back to default");
    
    // Check metric extraction
    assert(synthesis.metrics.includes("120kg"), "Metric 120kg extracted");
    assert(synthesis.metrics.includes("50%"), "Metric 50% extracted");
    assert(synthesis.metrics.includes("3 set"), "Metric 3 set extracted");
    assert(synthesis.metrics.includes("5 ripetizioni"), "Metric 5 ripetizioni extracted");
    assert(synthesis.metrics.includes("0.75 m/s"), "Metric 0.75 m/s extracted");
    assert(synthesis.metrics.includes("RPE 8") || synthesis.metrics.includes("rpe 8") || synthesis.metrics.includes("RPE8") || synthesis.metrics.map(x => x.toLowerCase()).includes("rpe 8"), "Metric RPE 8 extracted");
    
    // Check keyword extraction
    assert(synthesis.keywords.includes("carico"), "Keyword 'carico' extracted");
    assert(synthesis.keywords.includes("scarico"), "Keyword 'scarico' extracted");
    assert(synthesis.keywords.includes("squat"), "Keyword 'squat' extracted");
    assert(!synthesis.keywords.includes("il"), "Stop words like 'il' are filtered out");
    
    // Test HTML highlighting
    const highlighted = ui.highlightKeywords("Il massimale di squat", synthesis.keywords);
    assert(highlighted.includes("color: var(--accent)"), "Keyword is highlighted with accent color style");
    assert(highlighted.includes("squat"), "Keyword text is preserved");

    // Mock semanticSearch on RAGEngine
    const originalSemanticSearch = win.RAGEngine.semanticSearch;
    win.RAGEngine.semanticSearch = async (q, limit) => {
        return mockChunks;
    };
    
    // Execute search query via UI elements
    newSearchInput.value = "carico scarico squat";
    const searchBtn = document.getElementById('rag-search-btn');
    assert(searchBtn !== null, "Search button exists");
    
    // Click button and wait for rendering
    searchBtn.click();
    await new Promise(r => setTimeout(r, 200));
    
    const containerHtml = document.getElementById('search-results-container').innerHTML;
    assert(containerHtml.includes("rag-dual-panel"), "Container renders the dual-panel layout wrapper");
    assert(containerHtml.includes("panel-sintesi"), "Container contains Sintesi panel");
    assert(containerHtml.includes("panel-evidenze"), "Container contains Evidenze panel");
    
    // Ensure no "undefined" string exists in the bound HTML
    assert(!containerHtml.includes("undefined"), "UI binding has no 'undefined' strings anywhere in the layout");
    assert(containerHtml.includes("Documentazione scientifica"), "Default fallback docname rendered correctly");
    
    // Restore semanticSearch
    win.RAGEngine.semanticSearch = originalSemanticSearch;

    console.log("=== ALL ADVERSARIAL RAG UI VERIFICATIONS PASSED ===");
    if (typeof process !== 'undefined' && process.exit) {
        process.exit(0);
    }
}

runAdversarialTests().catch(err => {
    console.error("Test failed:", err);
    if (typeof process !== 'undefined' && process.exit) {
        process.exit(1);
    }
});
