/**
 * js/logic.js - AI Workout Generator Engine (Root Orchestrator)
 * Carica e integra in sequenza i moduli specialistici da js/logic/:
 * - risk-analyzer.js (Analisi rischio e classificazione esercizi)
 * - periodization.js (Selezione metodo e tassonomia split)
 * - phase-builder.js (Architettura delle fasi e progressione)
 * - session-builder.js (Sedute cliniche ginocchio e dinamiche atleti)
 * - exercise-formatter.js (Dosaggio carichi, serie, rep, tempo e durata)
 * - warmup-cooldown.js (Riscaldamento e defaticamento)
 * - rationale-generator.js (Rationale 4 pilastri e spiegazioni bibliografiche)
 * - data-persistence.js (Esportazione e importazione backup JSON)
 *
 * Mantiene la compatibilità al 100% con ambienti browser e test runner (Node.js).
 */

(function () {
    'use strict';

    window.App = window.App || {};

    // Supporto per esecuzione in ambienti Node.js / test runner (eval via loadModule)
    if (typeof require !== 'undefined') {
        const fs = require('fs');
        const path = require('path');
        const baseDir = typeof __dirname !== 'undefined' ? __dirname : '.';
        const candidates = [
            path.join(baseDir, 'logic'),
            path.join(baseDir, 'js', 'logic'),
            path.join(baseDir, '..', 'js', 'logic'),
            'js/logic',
            'logic'
        ];
        let logicDir = null;
        for (const c of candidates) {
            try {
                if (fs.existsSync(path.join(c, 'risk-analyzer.js'))) {
                    logicDir = c;
                    break;
                }
            } catch (e) {}
        }
        if (logicDir) {
            const files = [
                'risk-analyzer.js',
                'periodization.js',
                'phase-builder.js',
                'session-builder.js',
                'exercise-formatter.js',
                'warmup-cooldown.js',
                'rationale-generator.js',
                'data-persistence.js'
            ];
            for (const f of files) {
                const p = path.join(logicDir, f);
                try {
                    if (fs.existsSync(p)) {
                        const code = fs.readFileSync(p, 'utf8');
                        eval(code);
                    }
                } catch (e) {
                    console.error('[Logic Loader] Errore caricamento', p, e);
                }
            }
        }
    }

    // Assicura l'inizializzazione della classe base
    window.WorkoutGeneratorAI = window.WorkoutGeneratorAI || class {
        constructor() {
            this.riskLevels = {
                LOW: { color: '#10b981', label: 'Basso Rischio' },
                MEDIUM: { color: '#f59e0b', label: 'Rischio Moderato' },
                HIGH: { color: '#ef4444', label: 'Alto Rischio' }
            };
            this.thresholds = { HIGH: 4, MEDIUM: 2 };
        }
    };

    /**
     * Motore principale di generazione del programma (Dynamic Multi-Phase Engine V4).
     * Coordina analisi del rischio, RAG semantico, costruzione fasi, progressione e citazioni.
     */
    window.WorkoutGeneratorAI.prototype.generateFullProgram = async function (params) {
        // 1. Risk Analysis & Classification
        const exercises = (window.App?.getExercises?.()) || [];
        const riskProfile = this.analyzeRiskProfile(params.injuries || []);
        const classification = this.classifyExercises(exercises, riskProfile.pathologies);

        // Retrieve relevant methodology chunks from RAG engine
        let ragContexts = [];
        if (window.RAGEngine && typeof window.RAGEngine.semanticSearch === 'function') {
            const queryText = (params.patientObjective || '') + ' ' + (params.goal || '');
            try {
                ragContexts = await window.RAGEngine.semanticSearch(queryText, 3);
            } catch (e) {
                console.warn('[WorkoutGeneratorAI] RAG semanticSearch failed:', e);
            }
        }

        // Check if any chunk suggests avoiding certain exercises
        ragContexts.forEach(chunk => {
            const textLower = (chunk.text || '').toLowerCase();
            exercises.forEach(ex => {
                const exNameLower = (ex.name || '').toLowerCase();
                if (exNameLower && (
                    textLower.includes(`evitare ${exNameLower}`) ||
                    textLower.includes(`evita ${exNameLower}`) ||
                    textLower.includes(`evitato ${exNameLower}`) ||
                    textLower.includes(`escludere ${exNameLower}`)
                )) {
                    if (!classification.excluded.some(item => item.name === ex.name)) {
                        classification.excluded.push({
                            ...ex,
                            reason: `RAG Recommendation: Evitare per indicazioni in ${chunk.docName || 'documentazione scientifica'}`
                        });
                        classification.available = classification.available.filter(item => item.name !== ex.name);
                        classification.adapted = classification.adapted.filter(item => item.name !== ex.name);
                    }
                }
            });
        });

        // 2. Filter Pool
        let validExercises = [...classification.available, ...classification.adapted];
        validExercises = validExercises.filter(ex => this._checkEquipment(ex, params.equipment));

        // 3. Generate the Phases
        const phases = this._generatePhases(params, validExercises, classification, riskProfile);

        // 4. Generate Progression Timeline Rows
        const progression = this._getProgressionTable(params, phases);

        // 5. Generate Technical Explanations & Structured Citations
        const explanations = this._generateTechnicalExplanations(params);

        // Append retrieved RAG chunks to explanations
        ragContexts.forEach((chunk, index) => {
            explanations.push({
                category: 'Metodologia RAG',
                title: `Evidenza RAG: ${chunk.docName || 'Documentazione scientifica'}`,
                text: `Estratto rilevante (Rilevanza: ${(chunk.score * 100).toFixed(1)}%):\n\n"${chunk.text}"`,
                citations: [
                    {
                        title: `Documento RAG: ${chunk.docName || 'Documentazione scientifica'}`,
                        url: ''
                    }
                ],
                sourceMetadata: {
                    id: `rag_${index}_${Date.now()}`,
                    title: `Evidenza RAG: ${chunk.docName || 'Documentazione scientifica'}`,
                    authors: 'RAG Knowledge Base',
                    journal: `Similarity Score: ${(chunk.score).toFixed(4)}`,
                    year: new Date().getFullYear().toString(),
                    area: 'Metodologia RAG',
                    url: ''
                }
            });
        });

        const citations = [];
        explanations.forEach(exp => {
            if (exp.sourceMetadata) {
                if (!citations.some(x => x.id === exp.sourceMetadata.id)) {
                    citations.push({
                        id: exp.sourceMetadata.id,
                        title: exp.sourceMetadata.title,
                        authors: exp.sourceMetadata.authors,
                        year: exp.sourceMetadata.year,
                        journal: exp.sourceMetadata.journal,
                        area: exp.category || 'Scienza dello Sport',
                        url: exp.sourceMetadata.url
                    });
                }
            } else if (exp.citations) {
                exp.citations.forEach(c => {
                    if (!citations.some(x => x.url === c.url)) {
                        citations.push({
                            id: c.id || c.title,
                            title: c.title,
                            authors: c.authors || '',
                            year: c.year || '',
                            journal: c.journal || '',
                            area: c.area || exp.category || 'Scienza dello Sport',
                            url: c.url
                        });
                    }
                });
            }
        });

        const isClinical = params.patientType === 'Clinico' || params.patientType === 'Clinico_Anziano';
        const sport = params.sportPraticato || params.sport;
        const isEndurance = !isClinical && sport === 'Endurance';
        const daysCount = isEndurance ? Math.min(2, parseInt(params.days) || 2) : parseInt(params.days) || 3;

        const method = this._selectPeriodizationMethod(params);
        const summaryRationale = this._generateSummaryRationale(params, method, riskProfile);
        const periodizationDetails = this.periodizationDetails || {};

        return {
            meta: {
                splitName: this._getSplitName(daysCount),
                riskLevel: riskProfile.level,
                goal: params.goal,
                level: params.level,
                patientType: params.patientType || 'Atleta',
                sportPraticato: sport || 'N/A',
                days: daysCount,
                weeks: parseInt(params.weeks) || 12,
                equipment: params.equipment || 'Full Gym',
                pathologyNames: riskProfile.pathologies.map(p => p.name || p.id).filter(Boolean)
            },
            periodization: periodizationDetails[method] || periodizationDetails['LINEAR'],
            summaryRationale: typeof summaryRationale === 'string' ? summaryRationale : summaryRationale.fullText,
            rationaleStructured: typeof summaryRationale === 'object' ? summaryRationale.structured : null,
            phases: phases,
            progression: progression,
            notes: this._generateClinicalNotes(riskProfile.pathologies),
            explanations: explanations,
            citations: citations
        };
    };

    /**
     * Suggerisce fino a 5 esercizi alternativi compatibili per la funzione Swap.
     * Usa scoring multi-criterio: muscoli, type, pattern inferito, quality, equipment.
     * @param {Object} exercise - Esercizio originale da sostituire
     * @param {Object} context - { params, riskProfile } dal programma corrente
     * @returns {Array<{exercise: Object, reason: string}>} Alternative ordinate per compatibilita
     */
    window.WorkoutGeneratorAI.prototype.suggestSwapAlternatives = function (exercise, context) {
        const MIN_SCORE_THRESHOLD = 3;
        const MAX_SUGGESTIONS = 5;
        const allExercises = (window.App && typeof window.App.getExercises === 'function') ? window.App.getExercises() : [];
        if (!exercise) return [];
        const exId = exercise.id;
        const pool = allExercises.filter(ex => ex && (exId ? ex.id !== exId : ex.name !== exercise.name));

        const ctx = context || {};

        // Filtra via esercizi esclusi per rischio clinico
        let safePool = pool;
        let activePathologies = [];
        if (ctx.riskProfile && Array.isArray(ctx.riskProfile.pathologies) && ctx.riskProfile.pathologies.length > 0) {
            const allConds = (window.App && typeof window.App.getConditions === 'function') ? window.App.getConditions() : [];
            activePathologies = ctx.riskProfile.pathologies.map(p => {
                if (p && Array.isArray(p.exclusions)) return p;
                const searchKey = typeof p === 'string' ? p : (p?.id || p?.name);
                if (!searchKey) return null;
                return allConds.find(c => c.id === searchKey || c.name === searchKey) || p;
            }).filter(Boolean);
        }

        if (activePathologies.length > 0 && typeof this.classifyExercises === 'function') {
            const classification = this.classifyExercises(pool, activePathologies);
            safePool = [...(classification.available || []), ...(classification.adapted || [])];
        }

        // Filtra per equipment
        if (ctx.params && ctx.params.equipment && typeof this._checkEquipment === 'function') {
            safePool = safePool.filter(ex => this._checkEquipment(ex, ctx.params.equipment));
        }

        const originalPattern = window.App.inferMovementPattern ? window.App.inferMovementPattern(exercise) : 'GENERAL';
        const origPm = String(exercise.primaryMuscle || '').trim().toLowerCase();
        const origType = String(exercise.type || '').trim().toLowerCase();
        const origQuality = String(exercise.quality || '').trim().toLowerCase();
        const origEquip = String(exercise.equipment || '').trim().toLowerCase();
        const origMuscles = (exercise.muscles || []).map(m => String(m || '').trim().toLowerCase());

        const scored = safePool.map(ex => {
            let score = 0;
            const reasons = [];

            const candPm = String(ex.primaryMuscle || '').trim().toLowerCase();
            const candType = String(ex.type || '').trim().toLowerCase();
            const candQuality = String(ex.quality || '').trim().toLowerCase();
            const candEquip = String(ex.equipment || '').trim().toLowerCase();
            const candMuscles = (ex.muscles || []).map(m => String(m || '').trim().toLowerCase());

            // Criterio 1: primaryMuscle identico (+3)
            if (candPm && origPm && candPm === origPm) {
                score += 3;
                reasons.push('Stesso muscolo primario');
            }

            // Criterio 2: overlap array muscles (+2 per match)
            const muscleOverlap = candMuscles.filter(m => m && origMuscles.includes(m)).length;
            score += muscleOverlap * 2;
            if (muscleOverlap > 0) {
                reasons.push(muscleOverlap + ' muscoli in comune');
            }

            // Criterio 3: type identico (+2)
            if (candType && origType && candType === origType) {
                score += 2;
                reasons.push('Stesso tipo di movimento');
            }

            // Criterio 4: pattern motorio identico (+3)
            const candidatePattern = window.App.inferMovementPattern ? window.App.inferMovementPattern(ex) : 'GENERAL';
            if (candidatePattern === originalPattern && originalPattern !== 'GENERAL') {
                score += 3;
                reasons.push('Stesso pattern motorio');
            }

            // Criterio 5: quality identica (+1)
            if (candQuality && origQuality && candQuality === origQuality) {
                score += 1;
                reasons.push('Stessa qualità atletica');
            }

            // Criterio 6: equipment identico (+1)
            if (candEquip && origEquip && candEquip === origEquip) {
                score += 1;
            }

            return { exercise: ex, score: score, reasons: reasons };
        })
        .filter(s => s.score >= MIN_SCORE_THRESHOLD)
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_SUGGESTIONS);

        return scored.map(({ exercise: ex, reasons }) => ({
            exercise: ex,
            reason: reasons.length > 0 ? reasons.slice(0, 2).join(', ') : 'Alternativa compatibile'
        }));
    };

    // Singleton globale
    window.AI = new window.WorkoutGeneratorAI();

})();
