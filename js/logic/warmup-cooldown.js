/**
 * js/logic/warmup-cooldown.js
 * AI Workout Generator - Warmup and Cooldown Protocols by Clinical State & Sport
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
     * Inietta esercizi di attivazione e riscaldamento specifico in testa alla seduta.
     */
    window.WorkoutGeneratorAI.prototype._addWarmupByPhase = function (phaseId, session, focus, isClinical, params = {}) {
        let warmups = [];
        const patientType = params.patientType || '';
        const sportPraticato = params.sportPraticato || params.sport || '';

        if (patientType === 'Clinico' || patientType === 'Clinico_Anziano' || patientType === 'Anziano' || isClinical) {
            if (phaseId === 1) {
                warmups = [
                    { name: 'Cat-Cow Mobilità Spinale', specs: { sets: 1, reps: '60s', rest: '-' }, isWarmup: true },
                    { name: 'Ponte Glutei a Terra (Bipodalico)', specs: { sets: 2, reps: '15', rest: '30s' }, isWarmup: true },
                    { name: 'Bird-dog Attivazione Core', specs: { sets: 2, reps: '10/lato', rest: '30s' }, isWarmup: true }
                ];
            } else if (phaseId === 3 || phaseId === 7) {
                warmups = [
                    { name: 'Step-up su Box Basso (10cm)', specs: { sets: 2, reps: '10/lato', rest: '30s' }, isWarmup: true },
                    { name: 'Clamshells Attivazione Anca', specs: { sets: 2, reps: '12/lato', rest: '30s' }, isWarmup: true }
                ];
            } else if (phaseId === 5) {
                warmups = [
                    { name: 'Squat Corpo Libero (ROM controllato 80°)', specs: { sets: 2, reps: '10', rest: '30s' }, isWarmup: true },
                    { name: 'Ponti Glutei Bipodalici dinamici', specs: { sets: 2, reps: '12', rest: '30s' }, isWarmup: true }
                ];
            } else {
                warmups = [
                    { name: 'Cat-Cow Gatto-Cammello', specs: { sets: 1, reps: '60s', rest: '-' }, isWarmup: true },
                    { name: 'Bird-dog controllato', specs: { sets: 2, reps: '8/lato', rest: '30s' }, isWarmup: true }
                ];
            }
        } else if (sportPraticato === 'Atletica Leggera') {
            warmups = [
                { name: 'Drills di Corsa (Skips, Calciata)', specs: { sets: 2, reps: '15m', rest: '30s' }, isWarmup: true },
                { name: 'Affondi Dinamici con Torsione', specs: { sets: 2, reps: '8/lato', rest: '30s' }, isWarmup: true },
                { name: 'Ponti Glutei Monopodalici', specs: { sets: 2, reps: '10/lato', rest: '30s' }, isWarmup: true }
            ];
        } else if (sportPraticato === 'Calcio') {
            warmups = [
                { name: 'Corsa a Navetta e Cambi Direzione soft', specs: { sets: 1, reps: '5 min', rest: '-' }, isWarmup: true },
                { name: 'Single-Leg Balance & Reach', specs: { sets: 2, reps: '10/lato', rest: '30s' }, isWarmup: true },
                { name: 'Affondi Laterali Dinamici', specs: { sets: 2, reps: '10/lato', rest: '30s' }, isWarmup: true }
            ];
        } else if (sportPraticato === 'Basketball') {
            warmups = [
                { name: 'Circonduzioni Spalle ed Extrarotatori', specs: { sets: 2, reps: '12', rest: '30s' }, isWarmup: true },
                { name: 'Saltelli Monopodalici e Landing Control', specs: { sets: 2, reps: '8/lato', rest: '30s' }, isWarmup: true },
                { name: 'Thoracic Spine Rotation (Thread the Needle)', specs: { sets: 2, reps: '8/lato', rest: '30s' }, isWarmup: true }
            ];
        } else if (patientType === 'Sedentario') {
            warmups = [
                { name: 'Camminata a Passo Svelto', specs: { sets: 1, reps: '5 min', rest: '-' }, isWarmup: true },
                { name: 'Circonduzioni Anca e Caviglie', specs: { sets: 1, reps: '60s', rest: '-' }, isWarmup: true },
                { name: 'Plank Facilitato sulle Ginocchia', specs: { sets: 2, reps: '30s', rest: '30s' }, isWarmup: true }
            ];
        } else {
            warmups = [
                { name: 'Mobilità Articolare Multi-snodo', specs: { sets: 1, reps: '5 min', rest: '-' }, isWarmup: true },
                { name: 'Attivazione Core & Stabilità', specs: { sets: 2, reps: '12 reps', rest: '30s' }, isWarmup: true }
            ];
        }
        return [...warmups.map(w => ({ ...w, id: 'w_' + Math.random().toString(36).substr(2, 5) })), ...session];
    };

    /**
     * Accoda esercizi di defaticamento, mobilità e allungamento al termine della seduta.
     */
    window.WorkoutGeneratorAI.prototype._addCooldownByPhase = function (phaseId, session, isClinical, params = {}) {
        let cooldowns = [];
        const patientType = params.patientType || '';
        const sportPraticato = params.sportPraticato || params.sport || '';

        if (patientType === 'Clinico' || patientType === 'Clinico_Anziano' || patientType === 'Anziano' || isClinical) {
            if (phaseId === 1 || phaseId === 2) {
                cooldowns = [
                    { name: 'Allungamento Flessori Coscia (Hamstring Stretch)', specs: { sets: '1 set', reps: '60s/gamba', rest: '-' }, isCardio: true },
                    { name: 'Allungamento Polpacci a muro', specs: { sets: '1 set', reps: '60s/gamba', rest: '-' }, isCardio: true }
                ];
            } else if (phaseId === 3 || phaseId === 4) {
                cooldowns = [
                    { name: 'Allungamento Flessori assistito con elastico', specs: { sets: '1 set', reps: '60s/lato', rest: '-' }, isCardio: true },
                    { name: 'Allungamento Psoas in ginocchio', specs: { sets: '1 set', reps: '60s/lato', rest: '-' }, isCardio: true }
                ];
            } else {
                cooldowns = [
                    { name: 'Cobra Stretch estensione colonna', specs: { sets: '1 set', reps: '60s', rest: '-' }, isCardio: true },
                    { name: 'Allungamento Piriforme a terra', specs: { sets: '1 set', reps: '60s/lato', rest: '-' }, isCardio: true }
                ];
            }
        } else if (sportPraticato === 'Atletica Leggera') {
            cooldowns = [
                { name: 'Stretching Statico Polpacci e Ischiocrurali', specs: { sets: '1 set', reps: '60s/lato', rest: '-' }, isCardio: true },
                { name: 'Stretching Psoas e Quadricipiti', specs: { sets: '1 set', reps: '60s/lato', rest: '-' }, isCardio: true }
            ];
        } else if (sportPraticato === 'Calcio') {
            cooldowns = [
                { name: 'Allungamento Adduttori e Quadricipiti', specs: { sets: '1 set', reps: '60s/lato', rest: '-' }, isCardio: true },
                { name: 'Child\'s Pose (Allungamento Schiena)', specs: { sets: '1 set', reps: '90s', rest: '-' }, isCardio: true }
            ];
        } else if (sportPraticato === 'Basketball') {
            cooldowns = [
                { name: 'Allungamento Dorsali al Muro', specs: { sets: '1 set', reps: '60s', rest: '-' }, isCardio: true },
                { name: 'Allungamento Polpacci e Fascia Plantare', specs: { sets: '1 set', reps: '60s/lato', rest: '-' }, isCardio: true }
            ];
        } else if (patientType === 'Sedentario') {
            cooldowns = [
                { name: 'Camminata Defaticante lenta', specs: { sets: '1 set', reps: '5 min', rest: '-' }, isCardio: true },
                { name: 'Stretching Statico Gambe e Schiena', specs: { sets: '1 set', reps: '3 min', rest: '-' }, isCardio: true }
            ];
        } else {
            cooldowns = [
                { name: 'Defaticamento attivo su cyclette / camminata', specs: { sets: '5 min', reps: 'Zona 1', rest: '-' }, isCardio: true },
                { name: 'Allungamento statico generale', specs: { sets: '1 set', reps: '4 min', rest: '-' }, isCardio: true }
            ];
        }
        return [...session, ...cooldowns.map(c => ({ ...c, id: 'c_' + Math.random().toString(36).substr(2, 5) }))];
    };

})();
