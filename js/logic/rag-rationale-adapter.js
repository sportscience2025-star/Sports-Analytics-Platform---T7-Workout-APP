/**
 * js/logic/rag-rationale-adapter.js
 * RAG Rationale Adapter — Semantic Bridge for Workout Wizard and Biomechanical Data Analysis.
 * Enhances coaching explanations with relevant peer-reviewed scientific citations without altering mathematical computations.
 */
(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);
    root.App = root.App || {};

    const MAX_WIZARD_EVIDENCE_ITEMS = 5;
    const MAX_ANALYSIS_EVIDENCE_ITEMS = 4;

    const RAGRationaleAdapter = {
        /**
         * Translates workout wizard parameters into a semantic search query string.
         * @param {Object} params - Workout wizard parameters
         * @returns {string} Structured semantic query
         */
        buildContextQuery(params) {
            if (!params) return '';
            const queryTokens = [];

            if (params.goal) {
                queryTokens.push(params.goal);
            }
            if (params.sport || params.sportPraticato) {
                queryTokens.push(params.sport || params.sportPraticato);
            }
            if (params.patientType) {
                queryTokens.push(params.patientType === 'Clinico' ? 'riabilitazione clinica' : 'prestazione atletica');
            }
            if (Array.isArray(params.injuries) && params.injuries.length > 0) {
                queryTokens.push('prevenzione ' + params.injuries.join(' '));
            }
            if (params.equipment && Array.isArray(params.equipment)) {
                queryTokens.push(params.equipment.slice(0, 3).join(' '));
            }

            return queryTokens.join(' ').trim();
        },

        /**
         * Queries the RAG knowledge bridge to retrieve relevant scientific sources for workout planning.
         * @param {Object} params - Workout wizard parameters
         * @param {number} [limit=5] - Maximum sources to retrieve
         * @returns {Array<Object>} Formatted evidence explanation objects
         */
        getEvidenceForWizard(params, limit = MAX_WIZARD_EVIDENCE_ITEMS) {
            const bridge = (root.App && root.App.RAGBridge) || (typeof window !== 'undefined' && window.App && window.App.RAGBridge);
            const query = this.buildContextQuery(params);

            let matches = [];
            if (bridge && typeof bridge.searchInMemory === 'function') {
                matches = bridge.searchInMemory(query, limit);
            }

            return matches.map(item => {
                const src = item.sourceMeta || {};
                const referenceText = `${src.authors || 'Autori'} (${src.year || ''}). ${src.journal || ''}.`;
                return {
                    category: src.area || 'Evidenza Scientifica',
                    title: src.title || 'Studio Scientifico',
                    studyType: src.studyType || 'Evidenza',
                    text: `${src.abstract || ''}\n\nRiferimento: ${referenceText} (${src.url || ''})`,
                    citations: [
                        {
                            title: `${src.authors || ''} (${src.year || ''}) - ${src.title || ''}`,
                            url: src.url || '#'
                        }
                    ],
                    sourceMetadata: {
                        id: src.id,
                        title: src.title,
                        authors: src.authors,
                        journal: src.journal,
                        year: src.year,
                        url: src.url,
                        studyType: src.studyType
                    }
                };
            });
        },

        /**
         * Enriches existing static explanations with semantically retrieved evidence, eliminating duplicates.
         * Preserves all program calculations unchanged.
         * @param {Array<Object>} existingExplanations - Explanations from static rules
         * @param {Object} params - Wizard parameters
         * @returns {Array<Object>} Combined explanations list
         */
        enrichExplanations(existingExplanations, params) {
            const semanticEvidence = this.getEvidenceForWizard(params, MAX_WIZARD_EVIDENCE_ITEMS);
            const seenTitles = new Set((existingExplanations || []).map(e => (e.title || '').toLowerCase()));

            const combined = [...(existingExplanations || [])];
            for (const item of semanticEvidence) {
                const titleKey = (item.title || '').toLowerCase();
                if (!seenTitles.has(titleKey)) {
                    seenTitles.add(titleKey);
                    combined.push(item);
                }
            }

            return combined;
        },

        /**
         * Retrieves scientific literature relevant to a specific dataset analyzed in Data Analysis.
         * @param {Object} datasetContext - Context extracted from loaded data (instrument, metrics, athlete, exercise)
         * @param {number} [limit=4] - Max items to return
         * @returns {Array<Object>} Array of relevant study records
         */
        getEvidenceForDataAnalysis(datasetContext, limit = MAX_ANALVIDENCE_ITEMS || MAX_ANALYSIS_EVIDENCE_ITEMS) {
            const bridge = (root.App && root.App.RAGBridge) || (typeof window !== 'undefined' && window.App && window.App.RAGBridge);
            if (!bridge || typeof bridge.searchInMemory !== 'function') return [];

            const queryParts = [];
            if (datasetContext.instrumentType) {
                if (datasetContext.instrumentType.includes('VBT') || datasetContext.instrumentType.includes('ENCODER')) {
                    queryParts.push('velocity based training vbt forza velocita 1RM perdita velocita');
                } else if (datasetContext.instrumentType.includes('JUMP') || datasetContext.instrumentType.includes('PEDANA')) {
                    queryParts.push('reactive strength index jump stiffness atterraggio pliometria');
                } else if (datasetContext.instrumentType.includes('GPS') || datasetContext.instrumentType.includes('SPRINT')) {
                    queryParts.push('sprint accelerazione forza orizzontale running economy');
                }
            }

            if (datasetContext.exercise) {
                queryParts.push(datasetContext.exercise);
            }
            if (datasetContext.detectedMetricNames && Array.isArray(datasetContext.detectedMetricNames)) {
                queryParts.push(datasetContext.detectedMetricNames.slice(0, 3).join(' '));
            }

            const query = queryParts.join(' ').trim() || 'velocity based training biomeccanica forza';
            const matches = bridge.searchInMemory(query, limit);

            return matches.map(m => m.sourceMeta || {
                title: m.text,
                abstract: m.text,
                url: '#'
            });
        }
    };

    root.App.RAGRationaleAdapter = RAGRationaleAdapter;
    if (typeof window !== 'undefined' && window.App) {
        window.App.RAGRationaleAdapter = RAGRationaleAdapter;
    }
})();
