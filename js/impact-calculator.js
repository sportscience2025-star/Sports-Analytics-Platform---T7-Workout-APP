/**
 * IMPACT CALCULATOR ENGINE
 * Calculates excluded/adapted exercises based on selected clinical conditions.
 */

class ImpactCalculator {
    constructor(exercises, selectedConditions = []) {
        this.exercises = exercises;
        this.selectedConditions = selectedConditions;
        this.results = {
            excluded: [],
            adapted: [],
            available: [],
            riskLevel: 'low',
            compatibilityScore: 100
        };
    }

    calculate(newConditions) {
        if (newConditions) this.selectedConditions = newConditions;

        // Reset results
        this.results = {
            excluded: [],
            adapted: [],
            available: [],
            riskLevel: 'low',
            compatibilityScore: 100
        };

        if (this.selectedConditions.length === 0) {
            this.results.available = [...this.exercises];
            return this.results;
        }

        // Get full condition objects matching selected IDs
        const allConditions = window.App.getConditions();
        const activePathologies = allConditions.filter(c => this.selectedConditions.includes(c.id));   // "guarda" nel database generale dell'app per recuperare l'enciclopedia di tutti gli infortuni e patologie esistenti

        this.exercises.forEach(exercise => {         //richiama tutti gli esercizi disponibili
            let status = 'AVAILABLE';
            let excludeReason = [];
            let adaptationsList = [];

            for (const path of activePathologies) {
                if (path.exclusions && path.exclusions.some(r => this._matchesRule(exercise, r))) {
                    status = 'EXCLUDED';
                    excludeReason.push(`${path.name}: Escluso`);         // esercizio escluso
                    break;
                }
                if (path.adaptations) {
                    path.adaptations.forEach(r => {
                        if (this._matchesRule(exercise, r.pattern)) {
                            if (status !== 'EXCLUDED') {
                                status = 'ADAPTED';
                                adaptationsList.push(`${path.name}: ${r.modification}`);     // se prima era stato escluso e poi cambiato in adattato per qualche motivo
                            }
                        }
                    });
                }
            }

            if (status === 'EXCLUDED') {
                this.results.excluded.push({
                    ...exercise,
                    excludeReason: excludeReason.join(', ')           // esercizio che viene escluso e si dice la ragione per cui viene escluso
                });
            } else if (status === 'ADAPTED') {
                this.results.adapted.push({
                    ...exercise,
                    adaptations: adaptationsList
                });
                this.results.available.push(exercise);          // esercizio adattato e ideo solo in questo formato per il paziente
            } else {
                this.results.available.push(exercise);          // l'esercizio è disponibile perchè ha superato tutti i controlli
            }
        });

        // Compute Layout Metrics
        this.results.compatibilityScore = this.exercises.length > 0
            ? Math.round((this.results.available.length / this.exercises.length) * 100)
            : 100;

        // D. Incoerenza interna con impact-calculator.js: utilizzo dell'algoritmo centralizzato
        if (window.AI && typeof window.AI.analyzeRiskProfile === 'function') {
            const profile = window.AI.analyzeRiskProfile(this.selectedConditions);
            this.results.riskLevel = profile.level.toLowerCase();
        } else {
            // Fallback (non dovrebbe mai verificarsi)
            this.results.riskLevel = activePathologies.length >= 3 ? 'high' :
                activePathologies.length >= 2 ? 'medium' : 'low';
        }

        return this.results;
    }

    _matchesRule(exercise, rulePattern) {
        if (!rulePattern) return false; // No pattern = no match (safe default)
        const normalize = str => str.toLowerCase().replace(/[^a-z0-9]/g, '');
        const txt = (exercise.name + ' ' + (exercise.type || '') + ' ' + (exercise.tags || []).join(' '));
        return normalize(txt).includes(normalize(rulePattern));
    }
}

// Expose globally
window.ImpactCalculator = ImpactCalculator;

