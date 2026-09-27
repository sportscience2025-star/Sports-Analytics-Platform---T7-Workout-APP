/**
 * js/rag-knowledge-bridge.js
 * RAG Knowledge Bridge — Automatic sync and bridge between Scientific Sources Knowledge Base and RAG Vector Engine.
 * Enables neural and hybrid semantic search across built-in literature for Workout Wizard and Data Analysis.
 */
(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);
    root.App = root.App || {};

    const KB_INDEX_VERSION_KEY = 't7_kb_indexed_version';
    const CURRENT_KB_VERSION = 'v79_322_sources';
    const DEFAULT_SEARCH_LIMIT = 5;

    let isIndexing = false;
    let isInitialized = false;

    const RAGKnowledgeBridge = {
        /**
         * Returns whether the knowledge bridge is initialized and ready.
         * @returns {boolean} True if ready
         */
        isReady() {
            return isInitialized;
        },

        /**
         * Checks if the built-in knowledge base is already indexed in IndexedDB.
         * If missing or version mismatch, initiates background indexing.
         * @param {Function} [onProgress] - Optional progress callback
         * @returns {Promise<boolean>} True if indexing completed or already up to date
         */
        async init(onProgress) {
            if (isInitialized) return true;
            if (isIndexing) return false;

            const rag = (typeof window !== 'undefined' && window.RAGEngine) || root.RAGEngine || (root.App && root.App.RAG);
            if (!rag) {
                console.warn('[RAG Bridge] RAGEngine not yet available, delaying init.');
                return false;
            }

            const sources = (root.App && root.App.scientificSources) || (typeof window !== 'undefined' && window.ScientificKnowledgeBase) || root.ScientificKnowledgeBase || [];
            if (!sources || sources.length === 0) {
                console.warn('[RAG Bridge] Scientific sources database empty or uninitialized.');
                return false;
            }

            const storedVersion = localStorage.getItem(KB_INDEX_VERSION_KEY);
            if (storedVersion === CURRENT_KB_VERSION) {
                isInitialized = true;
                return true;
            }

            isIndexing = true;
            try {
                console.log(`[RAG Bridge] Syncing ${sources.length} scientific sources with RAG vector engine...`);
                await rag.indexKnowledgeBase(sources, (pct, status) => {
                    if (typeof onProgress === 'function') onProgress(pct, status);
                });
                localStorage.setItem(KB_INDEX_VERSION_KEY, CURRENT_KB_VERSION);
                isInitialized = true;
                console.log('[RAG Bridge] Scientific sources successfully indexed in local vector store.');
                return true;
            } catch (err) {
                console.warn('[RAG Bridge] Error during background knowledge base indexing:', err);
                return false;
            } finally {
                isIndexing = false;
            }
        },

        /**
         * Performs semantic or lexical query on scientific evidence.
         * @param {string} queryText - Search query
         * @param {number} [limit=5] - Number of results to return
         * @returns {Promise<Array<Object>>} Top matched scientific sources with scores
         */
        async searchEvidence(queryText, limit = DEFAULT_SEARCH_LIMIT) {
            if (!queryText || !queryText.trim()) return [];

            const rag = root.window.RAGEngine || (root.window.App && root.window.App.RAG);
            if (rag && typeof rag.semanticSearch === 'function') {
                try {
                    const results = await rag.semanticSearch(queryText, limit, 'builtin_kb');
                    if (results && results.length > 0) {
                        return results;
                    }
                } catch (err) {
                    console.warn('[RAG Bridge] Semantic search query failed, using fast local matcher:', err);
                }
            }

            // High-speed fallback: Lexical relevance scoring on in-memory sources
            return this.searchInMemory(queryText, limit);
        },

        /**
         * In-memory keyword relevance scoring fallback.
         * @param {string} queryText - Query text
         * @param {number} limit - Max results
         * @returns {Array<Object>} Filtered and scored source records
         */
        searchInMemory(queryText, limit = DEFAULT_SEARCH_LIMIT) {
            const sources = (root.App && root.App.scientificSources) || (typeof window !== 'undefined' && window.App && window.App.scientificSources) || [];
            if (!sources.length) return [];

            const terms = queryText.toLowerCase().split(/\s+/).filter(t => t.length > 2);
            if (!terms.length) return sources.slice(0, limit);

            const scored = sources.map(s => {
                let score = 0;
                const titleLower = (s.title || '').toLowerCase();
                const abstractLower = (s.abstract || '').toLowerCase();
                const areaLower = (s.area || '').toLowerCase();
                const authorsLower = (s.authors || '').toLowerCase();

                terms.forEach(term => {
                    if (titleLower.includes(term)) score += 4;
                    if (abstractLower.includes(term)) score += 2;
                    if (areaLower.includes(term)) score += 3;
                    if (authorsLower.includes(term)) score += 1;
                });

                return {
                    sourceType: 'builtin_kb',
                    text: `[${s.area} | ${s.studyType || 'Studio'}] ${s.title} (${s.year}). ${s.abstract}`,
                    similarity: score / (terms.length * 4),
                    sourceMeta: s
                };
            });

            scored.sort((a, b) => b.similarity - a.similarity);
            return scored.filter(item => item.similarity > 0).slice(0, limit);
        },

        /**
         * Resolves the most pertinent scientific sources given an athletic or training context.
         * @param {Object} context - Context object { goal, sport, patientType, injuries, vbtMetrics }
         * @param {number} [limit=5] - Max count
         * @returns {Promise<Array<Object>>} Matching evidence sources
         */
        async getRelevantSourcesForContext(context, limit = DEFAULT_SEARCH_LIMIT) {
            if (!context) return [];
            const parts = [];
            if (context.goal) parts.push(context.goal);
            if (context.sport) parts.push(context.sport);
            if (context.patientType) parts.push(context.patientType);
            if (Array.isArray(context.injuries) && context.injuries.length) {
                parts.push(context.injuries.join(' '));
            }
            if (context.keywords) parts.push(context.keywords);

            const query = parts.join(' ').trim();
            if (!query) return this.searchInMemory('', limit);
            return this.searchEvidence(query, limit);
        }
    };

    // Auto-init on page load or idle time
    if (typeof window !== 'undefined') {
        window.addEventListener('load', () => {
            if ('requestIdleCallback' in window) {
                window.requestIdleCallback(() => RAGKnowledgeBridge.init());
            } else {
                setTimeout(() => RAGKnowledgeBridge.init(), 1500);
            }
        });
    }

    root.App.RAGBridge = RAGKnowledgeBridge;
    if (typeof window !== 'undefined' && window.App) {
        window.App.RAGBridge = RAGKnowledgeBridge;
    }
})();
