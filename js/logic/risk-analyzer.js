/**
 * js/logic/risk-analyzer.js
 * AI Workout Generator - Risk Analysis & Exercise Safety Classification
 */

(function () {
    'use strict';

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
     * Valuta il profilo di rischio clinico sulla base delle patologie attive.
     */
    window.WorkoutGeneratorAI.prototype.analyzeRiskProfile = function (selectedPathologyIds) {
        // R1. Validazione Input & Fallback sicuro con gestione eccezioni
        let allPathologies = null;
        try {
            if (typeof window !== 'undefined' && window.App && typeof window.App.getConditions === 'function') {
                allPathologies = window.App.getConditions();
            }
        } catch (_) {
            allPathologies = null;
        }

        const defaultPalettes = {
            LOW: { color: '#10b981', label: 'Basso Rischio' },
            MEDIUM: { color: '#f59e0b', label: 'Rischio Moderato' },
            HIGH: { color: '#ef4444', label: 'Alto Rischio' }
        };

        const getDetailsFor = (lvl) => {
            const safeLevel = (lvl in defaultPalettes) ? lvl : 'LOW';
            const userPalette = (this && this.riskLevels && typeof this.riskLevels[safeLevel] === 'object' && this.riskLevels[safeLevel] !== null)
                ? this.riskLevels[safeLevel]
                : null;
            return {
                color: (userPalette && typeof userPalette.color === 'string' && userPalette.color) || defaultPalettes[safeLevel].color,
                label: (userPalette && typeof userPalette.label === 'string' && userPalette.label) || defaultPalettes[safeLevel].label
            };
        };

        if (!Array.isArray(selectedPathologyIds) || !Array.isArray(allPathologies)) {
            return {
                level: 'LOW',
                score: 0,
                pathologies: [],
                details: getDetailsFor('LOW')
            };
        }

        // Normalizzazione ID (supporta sia stringhe ID sia oggetti patologia con campo .id, ignora valori vuoti/invalidi)
        const idList = [];
        for (const item of selectedPathologyIds) {
            if (typeof item === 'string' && item.trim().length > 0) {
                idList.push(item.trim());
            } else if (item && typeof item === 'object' && typeof item.id === 'string' && item.id.trim().length > 0) {
                idList.push(item.id.trim());
            }
        }
        const idSet = new Set(idList);

        // Filtraggio patologie attive uniche e con ID valido (deduplicazione e tolleranza whitespace su ID condizione)
        const seenIds = new Set();
        const activePathologies = [];
        for (const p of allPathologies) {
            if (p && typeof p.id === 'string') {
                const normId = p.id.trim();
                if (idSet.has(normId) && !seenIds.has(normId)) {
                    seenIds.add(normId);
                    activePathologies.push(p);
                }
            }
        }
        
        // Profilo sano / nessuna patologia attiva: garantisce sempre LOW score 0
        if (activePathologies.length === 0) {
            return {
                level: 'LOW',
                score: 0,
                pathologies: [],
                details: getDetailsFor('LOW')
            };
        }

        let riskScore = 0;
        let level = 'LOW';
        
        let hasHighRiskPathology = false;
        let hasHighRiskCategory = false;

        // R4. Valutazione pesi gravità, categorie critiche e soglie configurabili ({ HIGH: 4, MEDIUM: 2 })
        for (const p of activePathologies) {
            // A. Pesi per gravità leggendo il riskLevel nativo (case-insensitive)
            const riskLevel = typeof p.riskLevel === 'string' ? p.riskLevel.toLowerCase().trim() : '';
            let weight = 1;
            if (riskLevel === 'high') {
                weight = 3;
                hasHighRiskPathology = true;
            } else if (riskLevel === 'medium') {
                weight = 2;
            } else {
                weight = 1;
            }
            riskScore += weight;

            // C. Categorie Critiche (inclusione neurologiche, post_chirurgiche, speciali, sistemiche, reumatologiche)
            const category = typeof p.category === 'string' ? p.category.toLowerCase().trim() : '';
            if (['neurologiche', 'post_chirurgiche', 'speciali'].includes(category)) {
                hasHighRiskCategory = true;
            } else if (['sistemiche', 'reumatologiche'].includes(category) && riskLevel !== 'low') {
                hasHighRiskCategory = true;
            }
        }

        // D. Bonus Comorbilità: +1 al riskScore per ogni categoria con 2 o più patologie attive
        const categoryCounts = Object.create(null);
        for (const p of activePathologies) {
            if (typeof p.category === 'string' && p.category.trim().length > 0) {
                const cat = p.category.toLowerCase().trim();
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            }
        }
        for (const cat in categoryCounts) {
            if (categoryCounts[cat] >= 2) {
                riskScore += 1;
            }
        }

        // B. Assegnazione livello rischio basata sul punteggio pesato e soglie configurabili
        const t = this && this.thresholds;
        const highVal = t ? (Number.isFinite(t.HIGH) ? t.HIGH : (Number.isFinite(t.high) ? t.high : NaN)) : NaN;
        const medVal = t ? (Number.isFinite(t.MEDIUM) ? t.MEDIUM : (Number.isFinite(t.medium) ? t.medium : NaN)) : NaN;
        const rawHigh = (Number.isFinite(highVal) && highVal > 0) ? highVal : 4;
        const rawMed = (Number.isFinite(medVal) && medVal > 0) ? medVal : 2;
        const highThreshold = rawHigh >= rawMed ? rawHigh : 4;
        const medThreshold = rawHigh >= rawMed ? rawMed : 2;

        if (hasHighRiskPathology || hasHighRiskCategory || riskScore >= highThreshold) {
            level = 'HIGH';
        } else if (riskScore >= medThreshold) {
            level = 'MEDIUM';
        } else {
            level = 'LOW';
        }

        return { level, score: riskScore, pathologies: activePathologies, details: getDetailsFor(level) };
    };

    /**
     * Classifica gli esercizi rispetto alle esclusioni e adattamenti delle patologie attive.
     */
    window.WorkoutGeneratorAI.prototype.classifyExercises = function (exercises, activePathologies) {
        const result = { excluded: [], adapted: [], available: [] };
        exercises.forEach(ex => {
            let status = 'AVAILABLE';
            let reason = [];
            for (const path of activePathologies) {
                if (path.exclusions && path.exclusions.some(r => this._matchesRule(ex, r))) {
                    status = 'EXCLUDED';
                    reason.push(`${path.name}: Escluso`);
                    break;
                }
                if (path.adaptations) {
                    path.adaptations.forEach(r => {
                        if (this._matchesRule(ex, r.pattern)) {
                            if (status !== 'EXCLUDED') {
                                status = 'ADAPTED';
                                reason.push(`${path.name}: ${r.modification}`);
                            }
                        }
                    });
                }
            }
            if (status === 'EXCLUDED') result.excluded.push({ ...ex, reason: reason.join(', ') });
            else if (status === 'ADAPTED') result.adapted.push({ ...ex, modification: reason.join(' + ') });
            else result.available.push(ex);
        });
        return result;
    };

    /**
     * Confronto normalizzato stringa esercizio vs pattern regola.
     */
    window.WorkoutGeneratorAI.prototype._matchesRule = function (exercise, rulePattern) {
        if (!rulePattern || rulePattern === 'General') return true;
        const normalize = str => str.toLowerCase().replace(/[^a-z0-9]/g, '');
        const txt = (exercise.name + ' ' + (exercise.type || '') + ' ' + (exercise.tags || []).join(' '));
        return normalize(txt).includes(normalize(rulePattern));
    };

    /**
     * Genera le note cliniche per le patologie attive.
     */
    window.WorkoutGeneratorAI.prototype._generateClinicalNotes = function (pathologies) {
        if (!pathologies || !pathologies.length) return [];
        return pathologies.map(p => `⚠️ ${p.name}: ${p.description}`);
    };

})();
