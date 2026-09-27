/**
 * T7 Workout - Unit Test for Core RAG Engine
 * Verifies document extraction, IndexedDB operations, Web Worker mock flow, and semantic search accuracy.
 */

const fs = require('fs');
const path = require('path');

// 1. Mock browser globals and environment if needed
if (typeof window === 'undefined') {
    global.window = { App: {} };
}
const win = typeof window !== 'undefined' ? window : global.window;
win.App = win.App || {};

// 2. Mock Worker to run fully locally, avoiding CDN network requests in tests
class MockWorker {
    constructor(workerPath) {
        this.workerPath = workerPath;
        this.onmessage = null;
        this.onerror = null;
        console.log(`[MockWorker] Initialized for path: ${workerPath}`);
    }

    postMessage(message) {
        const { type, payload, requestId } = message;
        console.log(`[MockWorker] Received postMessage type: ${type}`);

        // Simulate asynchronous response
        setTimeout(() => {
            if (!this.onmessage) return;

            try {
                if (type === 'INIT') {
                    this.onmessage({
                        data: {
                            type: 'INIT_DONE',
                            payload: { success: true },
                            requestId
                        }
                    });
                } else if (type === 'GENERATE_EMBEDDINGS') {
                    const { texts } = payload;
                    // Generate deterministic vectors of size 384 based on string content
                    const embeddings = texts.map(text => {
                        const vec = new Array(384).fill(0);
                        let charSum = 0;
                        for (let i = 0; i < text.length; i++) {
                            charSum += text.charCodeAt(i);
                        }
                        for (let j = 0; j < 384; j++) {
                            vec[j] = Math.sin(charSum + j);
                        }
                        // Normalize vector
                        let norm = 0;
                        for (let j = 0; j < 384; j++) norm += vec[j] * vec[j];
                        norm = Math.sqrt(norm);
                        if (norm > 0) {
                            for (let j = 0; j < 384; j++) vec[j] /= norm;
                        }
                        return vec;
                    });
                    this.onmessage({
                        data: {
                            type: 'GENERATE_EMBEDDINGS_DONE',
                            payload: { success: true, embeddings },
                            requestId
                        }
                    });
                } else if (type === 'SEMANTIC_SEARCH') {
                    const { queryEmbedding, chunks } = payload;
                    // Calculate genuine cosine similarity
                    const results = chunks.map(chunk => {
                        let dotProduct = 0.0;
                        let normA = 0.0;
                        let normB = 0.0;
                        const vecA = queryEmbedding;
                        const vecB = chunk.embedding;
                        for (let i = 0; i < vecA.length; i++) {
                            dotProduct += vecA[i] * vecB[i];
                            normA += vecA[i] * vecA[i];
                            normB += vecB[i] * vecB[i];
                        }
                        const score = (normA === 0 || normB === 0) ? 0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
                        return {
                            text: chunk.text,
                            score: score,
                            docName: chunk.docName || ""
                        };
                    });
                    // Sort descending
                    results.sort((a, b) => b.score - a.score);
                    this.onmessage({
                        data: {
                            type: 'SEMANTIC_SEARCH_DONE',
                            payload: { success: true, results },
                            requestId
                        }
                    });
                } else {
                    this.onmessage({
                        data: {
                            type: 'ERROR',
                            error: `Unknown mock worker message type: ${type}`,
                            requestId
                        }
                    });
                }
            } catch (err) {
                this.onmessage({
                    data: {
                        type: 'ERROR',
                        error: err.message,
                        requestId
                    }
                });
            }
        }, 10);
    }

    terminate() {
        console.log("[MockWorker] Terminated");
    }
}

// Override the global/window Worker constructor for this test
win.Worker = MockWorker;

// 3. Mock external dependencies to test extraction flow offline
win.pdfjsLib = {
    GlobalWorkerOptions: {},
    getDocument: (options) => {
        return {
            promise: Promise.resolve({
                numPages: 2,
                getPage: (pageNum) => {
                    return Promise.resolve({
                        getTextContent: () => {
                            return Promise.resolve({
                                items: [{ str: `Questo è il paragrafo PDF della pagina ${pageNum}` }]
                            });
                        }
                    });
                }
            })
        };
    }
};

win.XLSX = {
    read: (data, options) => {
        return {
            SheetNames: ['Sheet1'],
            Sheets: {
                'Sheet1': {}
            }
        };
    },
    utils: {
        sheet_to_csv: (sheet) => {
            return "Parametro,Valore\nFrequenza di scarico,50%\nVolume di allenamento,Alto";
        }
    }
};

win.mammoth = {
    extractRawText: (options) => {
        return Promise.resolve({
            value: "Mammoth DOCX: Le progressioni di carico e intensità nell'ipertrofia funzionale."
        });
    }
};

// 4. Load the RAG Engine code
const ragEnginePath = path.join(__dirname, '..', 'js', 'rag-engine.js');
const ragEngineCode = fs.readFileSync(ragEnginePath, 'utf8');
eval(ragEngineCode);

const RAGEngine = win.RAGEngine || win.App.RAG;

// Assertions Helper
function assert(condition, message) {
    if (!condition) {
        console.error(`❌ [FAIL] ${message}`);
        if (typeof process !== 'undefined' && process.exit) {
            process.exit(1);
        } else {
            throw new Error(message);
        }
    } else {
        console.log(`✅ [PASS] ${message}`);
    }
}

// Helper to convert string to ArrayBuffer
function stringToArrayBuffer(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str).buffer;
}

// Helper to inspect IndexedDB content
function inspectStore(storeName) {
    return RAGEngine.dbPromise.then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = (e) => resolve(e.target.result || []);
            request.onerror = (e) => reject(e.target.error);
        });
    });
}

// Clean stores before testing
function clearDB() {
    return RAGEngine.dbPromise.then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['documents', 'chunks'], 'readwrite');
            transaction.objectStore('documents').clear();
            transaction.objectStore('chunks').clear();
            transaction.oncomplete = () => resolve();
            transaction.onerror = (e) => reject(e.target.error);
        });
    });
}

// 5. Test Suite Execution
async function runTests() {
    console.log("=== STARTING T7 WORKOUT RAG ENGINE TEST SUITE ===");

    try {
        // Step 0: Clear DB
        await clearDB();
        console.log("Database cleared for test run.");

        // Test 1: Initialize model via worker INIT
        const initResult = await RAGEngine.init();
        assert(initResult === true, "RAG Engine worker initialization completed successfully");

        // Test 2: Ingest Text Document
        const txtContent = "Allenamento della forza: intensità elevata tra 80% e 90% del 1RM. " +
                           "Pausa consigliata tra le serie: 3-5 minuti. " +
                           "Esercizi multiarticolari fondamentali come squat, panca e stacco.";
        const txtBuffer = stringToArrayBuffer(txtContent);
        
        const docId1 = await RAGEngine.addDocument("Forza_Specs.txt", "TXT", txtBuffer);
        assert(typeof docId1 === 'string' && docId1.startsWith('doc_'), `Document added successfully, ID: ${docId1}`);

        // Verify it was stored in IndexedDB documents and chunks
        const docs = await inspectStore('documents');
        assert(docs.length === 1, `IndexedDB documents has 1 document (got ${docs.length})`);
        assert(docs[0].name === "Forza_Specs.txt", `Document name matches: Forza_Specs.txt`);
        assert(docs[0].fileType === "TXT", `Document fileType matches: TXT`);

        const chunks = await inspectStore('chunks');
        assert(chunks.length > 0, `IndexedDB chunks has chunks stored (got ${chunks.length})`);
        assert(chunks[0].documentId === docId1, "Chunk documentId matches");
        assert(chunks[0].text.includes("Allenamento della forza"), "Chunk text content is correct");
        assert(Array.isArray(chunks[0].embedding) && chunks[0].embedding.length === 384, "Embedding is valid 384-dimensional array");

        // Test 3: Ingest PDF Document (via mock pdfjsLib)
        const pdfBuffer = stringToArrayBuffer("PDF Dummy Buffer");
        const docId2 = await RAGEngine.addDocument("Scienze_Motorie.pdf", "PDF", pdfBuffer);
        
        const currentDocs = await inspectStore('documents');
        assert(currentDocs.length === 2, `IndexedDB documents has 2 documents (got ${currentDocs.length})`);
        
        const currentChunks = await inspectStore('chunks');
        const pdfChunks = currentChunks.filter(c => c.documentId === docId2);
        assert(pdfChunks.length > 0, "PDF chunks generated");
        assert(pdfChunks[0].text.includes("Questo è il paragrafo PDF"), "PDF extracted text matches mocked content");

        // Test 4: Ingest Excel Document (via mock XLSX)
        const xlsBuffer = stringToArrayBuffer("Excel Dummy Buffer");
        const docId3 = await RAGEngine.addDocument("Programma_Scarico.xlsx", "XLSX", xlsBuffer);
        
        const excelChunks = (await inspectStore('chunks')).filter(c => c.documentId === docId3);
        assert(excelChunks.length > 0, "Excel chunks generated");
        assert(excelChunks[0].text.includes("Frequenza di scarico"), "Excel extracted text matches mocked content");

        // Test 5: Ingest Word Document (via mock mammoth)
        const docxBuffer = stringToArrayBuffer("DOCX Dummy Buffer");
        const docId4 = await RAGEngine.addDocument("Ipertrofia_Funzionale.docx", "DOCX", docxBuffer);
        
        const docxChunks = (await inspectStore('chunks')).filter(c => c.documentId === docId4);
        assert(docxChunks.length > 0, "DOCX chunks generated");
        assert(docxChunks[0].text.toLowerCase().includes("ipertrofia"), "Word extracted text matches mocked content");

        // Test 6: Semantic Search sorted order and scoring
        // Since we mock, let's query for "Squat e panca"
        const searchResults = await RAGEngine.semanticSearch("Squat e panca", 3);
        assert(searchResults.length > 0, `Semantic search returned results (got ${searchResults.length})`);
        console.log("Search Results:", searchResults);

        // Verify sorted descending order
        let lastScore = 2.0; // Higher than max possible cosine similarity
        for (let i = 0; i < searchResults.length; i++) {
            const item = searchResults[i];
            assert(item.score <= lastScore, `Results correctly ordered descending: index ${i} score ${item.score} <= last score ${lastScore}`);
            assert(typeof item.text === 'string' && item.text.length > 0, "Result item contains text");
            assert(typeof item.docName === 'string' && item.docName.length > 0, "Result item contains docName");
            lastScore = item.score;
        }

        // Test 7: Delete Document
        await RAGEngine.deleteDocument(docId1);
        const docsAfterDelete = await inspectStore('documents');
        assert(docsAfterDelete.length === 3, `Documents count after delete is 3 (got ${docsAfterDelete.length})`);
        
        const chunksAfterDelete = await inspectStore('chunks');
        const deletedChunksCount = chunksAfterDelete.filter(c => c.documentId === docId1).length;
        assert(deletedChunksCount === 0, `All chunks for deleted document were removed (count: ${deletedChunksCount})`);

        console.log("=== ALL RAG ENGINE TESTS PASSED SUCCESSFULLY ===");
        if (typeof process !== 'undefined' && process.exit) {
            process.exit(0);
        }

    } catch (err) {
        console.error("❌ Test Suite failed with error:", err);
        console.error(err.stack);
        if (typeof process !== 'undefined' && process.exit) {
            process.exit(1);
        } else {
            throw err;
        }
    }
}

// Run the suite
runTests();
