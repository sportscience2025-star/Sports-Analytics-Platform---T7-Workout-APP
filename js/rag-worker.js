/**
 * T7 Workout - RAG Web Worker
 * Uses Transformers.js to compute embeddings on a background thread. Converte testi/documenti scientifici o schede 
 * in vettori numerici (embedding) che ne rappresentano il significato semantico.
Elabora i testi a lotti (batch size di 8) per ottimizzare le prestazioni e la memoria.
 */

// Load Transformers.js from CDN
importScripts('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');

let modelPromise = null;
let extractor = null;

/**
 * Initializes the feature-extraction pipeline.
 */
async function initModel() {
    if (modelPromise) return modelPromise;
    modelPromise = (async () => {
        try {

            // Configure transformers environment
            if (self.transformers && self.transformers.env) {
                self.transformers.env.allowLocalModels = false;
            }
            const tf = self.transformers;
            if (!tf) {
                throw new Error("Transformers library not found globally.");
            }
            extractor = await tf.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

            return true;
        } catch (error) {
            console.error("[RAG Worker] Failed to initialize model:", error);
            modelPromise = null;
            throw error;
        }
    })();
    return modelPromise;
}

/**
 * Computes cosine similarity between two vectors.
 */
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

// Handle incoming messages
self.onmessage = async function (event) {
    const { type, payload, requestId } = event.data;


    try {
        switch (type) {
            case 'INIT': {
                await initModel();
                self.postMessage({ type: 'INIT_DONE', payload: { success: true }, requestId });
                break;
            }
            case 'GENERATE_EMBEDDINGS': {
                await initModel();
                const { texts } = payload;
                if (!Array.isArray(texts)) {
                    throw new Error("texts must be an array");
                }
                const embeddings = [];
                const BATCH_SIZE = 8;
                for (let i = 0; i < texts.length; i += BATCH_SIZE) {
                    const batch = texts.slice(i, i + BATCH_SIZE);
                    for (const text of batch) {
                        const output = await extractor(text, { pooling: 'mean', normalize: true });
                        embeddings.push(Array.from(output.data));
                    }
                    // Yield to event loop between batches if needed
                    if (i + BATCH_SIZE < texts.length) {
                        await new Promise(resolve => setTimeout(resolve, 0));
                    }
                }
                self.postMessage({ type: 'GENERATE_EMBEDDINGS_DONE', payload: { success: true, embeddings }, requestId });
                break;
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
                // Sort by score descending
                results.sort((a, b) => b.score - a.score);
                self.postMessage({ type: 'SEMANTIC_SEARCH_DONE', payload: { success: true, results }, requestId });
                break;
            }
            default:
                throw new Error(`Unknown message type: ${type}`);
        }
    } catch (error) {
        console.error(`[RAG Worker] Error processing ${type}:`, error);
        self.postMessage({ type: 'ERROR', error: error.message, originalType: type, requestId });
    }
};
