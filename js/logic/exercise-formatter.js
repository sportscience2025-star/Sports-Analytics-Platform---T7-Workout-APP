/**
 * js/logic/exercise-formatter.js
 * AI Workout Generator - Exercise Load, Tempo, Sets/Reps Formatting & Duration Estimation
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
     * Calcola e formatta serie, ripetizioni, recupero, RPE, tempo esecutivo e carico (% RM)
     * per ciascun esercizio in base allo sport e alla periodizzazione della fase.
     */
    window.WorkoutGeneratorAI.prototype._formatExerciseForPhase = function (ex, tier, params, phaseBlueprint, day) {
        const isMain = tier === 'Main' || ex.isMain;
        const isClinical = params.patientType === 'Clinico' || params.patientType === 'Clinico_Anziano';
        const sport = params.sportPraticato || params.sport;
        const isEndurance = !isClinical && sport === 'Endurance';
        const isBodybuilding = !isClinical && sport === 'Bodybuilding';
        const isTeamSport = !isClinical && sport === 'Sport di Squadra';
        const phaseId = phaseBlueprint.id;
        const isDeload = phaseBlueprint.isDeload;

        let sets = 3;
        let reps = '10';
        let rest = '90s';
        let rpe = phaseBlueprint.rpeCap || 8;
        let tempo = '2-0-2';
        let load = '70-75% RM';

        if (isClinical && ex.specs) {
            sets = parseInt(ex.specs.sets) || 3;
            reps = ex.specs.reps || '10';
            rest = ex.specs.rest || '90s';
            rpe = ex.specs.rpe || phaseBlueprint.rpeCap || 6;
            tempo = ex.specs.tempo || '2-0-2';
            load = ex.specs.load || 'A corpo libero';
        } else {
            const method = phaseBlueprint.periodizationMethod || 'LINEAR';
            
            if (isEndurance) {
                if (isDeload) {
                    sets = (phaseId === 2 || phaseId === 6) ? 2 : 3;
                    reps = '5';
                    rest = '2 min';
                    rpe = 7.5;
                    tempo = '3-1-1';
                    load = '80% RM';
                } else {
                    sets = isMain ? ((phaseId === 3 || phaseId === 7) ? 5 : 4) : 3;
                    reps = '5';
                    rest = '3 min';
                    rpe = 8;
                    tempo = '3-1-1';
                    load = '85% RM';
                }
            } else if (isBodybuilding) {
                sets = isDeload ? (isMain ? ((phaseId === 2 || phaseId === 6) ? 2 : 3) : 2) : (isMain ? ((phaseId === 3 || phaseId === 7) ? 5 : 4) : 3);
                reps = '10';
                rest = '75s';
                rpe = isDeload ? 7.5 : 8;
                tempo = '2-0-2';
                load = isDeload ? '70% RM' : ((phaseId === 3 || phaseId === 7) ? '78% RM' : (phaseId === 5 ? '80% RM' : '75% RM'));
            } else if (isTeamSport) {
                sets = isDeload ? (isMain ? ((phaseId === 2 || phaseId === 6) ? 2 : 3) : 2) : (isMain ? ((phaseId === 3 || phaseId === 7) ? 5 : 4) : 3);
                reps = isDeload ? '6' : '5';
                rest = isDeload ? '90s' : '2 min';
                rpe = isDeload ? 7.5 : 8;
                tempo = 'X-0-1';
                load = isDeload ? '65% RM' : '75% RM';
            } else if (method === 'LINEAR' || method === 'BLOCK') {
                sets = phaseBlueprint.sets || 3;
                reps = phaseBlueprint.reps || '10';
                rest = phaseBlueprint.rest || '90s';
                rpe = phaseBlueprint.rpeCap || 8;
                load = phaseBlueprint.load || '70-75% RM';
                tempo = isMain ? '3-0-1' : '2-0-2';
                
                if (!isDeload && load && load.includes('%')) {
                    if (params.strengthProfile === 'High') {
                        load = load.replace(/(\d+)%/, (m, p) => `${parseInt(p) + 5}%`);
                    } else if (params.level === 'Beginner') {
                        load = load.replace(/(\d+)%/, (m, p) => `${Math.max(50, parseInt(p) - 5)}%`);
                    }
                }
            } else if (method === 'DUP') {
                const dayFocus = (day && day.focus) || [];
                if (dayFocus.includes('Forza')) {
                    sets = 4;
                    reps = isMain ? '3-6' : '6-8';
                    rest = isMain ? '3 min' : '90s';
                    rpe = isMain ? 9 : 8;
                    load = isMain ? '80-85% RM' : '75% RM';
                    tempo = 'X-1-2';
                } else if (dayFocus.includes('Ipertrofia')) {
                    sets = 4;
                    reps = isMain ? '8-12' : '10-12';
                    rest = isMain ? '90s' : '75s';
                    rpe = isMain ? 8 : 7.5;
                    load = isMain ? '70-75% RM' : '65-70% RM';
                    tempo = '2-0-2';
                } else if (dayFocus.includes('Potenza') || dayFocus.includes('Resistenza')) {
                    sets = isMain ? 4 : 3;
                    reps = isMain ? '4-6' : '12-15';
                    rest = isMain ? '2 min' : '60s';
                    rpe = isMain ? 7.5 : 7;
                    load = isMain ? '55-60% RM' : '50-60% RM';
                    tempo = isMain ? 'X-0-1' : '2-0-2';
                } else {
                    sets = 3;
                    reps = '10';
                    rest = '90s';
                    rpe = 7.5;
                    load = '70% RM';
                    tempo = '2-0-2';
                }

                if (isDeload) {
                    sets = Math.max(2, Math.floor(sets * 0.6));
                    rpe = Math.min(rpe, 6);
                    if (load && load.includes('%')) {
                        const val = Math.max(10, parseInt(load) - 10);
                        load = `${val}% RM`;
                    }
                } else {
                    if (phaseId === 3 || phaseId === 7) {
                        if (load && load.includes('%')) {
                            const val = parseInt(load) + 3;
                            load = `${val}% RM`;
                        }
                    } else if (phaseId === 5) {
                        if (load && load.includes('%')) {
                            const val = parseInt(load) + 5;
                            load = `${val}% RM`;
                        }
                    }
                }
            } else if (method === 'CONJUGATE') {
                const isME = day && (day.name.includes('ME') || day.name.includes('Max Effort') || day.focus.includes('ME') || day.focus.includes('Max Effort'));
                const isDE = day && (day.name.includes('DE') || day.name.includes('Dynamic Effort') || day.focus.includes('DE') || day.focus.includes('Dynamic Effort'));

                if (isME) {
                    if (isMain) {
                        sets = 5;
                        reps = '3-5';
                        rest = '3 min';
                        rpe = 9.5;
                        load = '85-90% RM';
                        tempo = 'X-1-2';
                    } else {
                        sets = 3;
                        reps = '8-12';
                        rest = '90s';
                        rpe = 8;
                        load = '70-75% RM';
                        tempo = '2-0-2';
                    }
                } else if (isDE) {
                    if (isMain) {
                        sets = 9;
                        reps = '2-3';
                        rest = '45-60s';
                        rpe = 7.5;
                        load = '55-60% RM';
                        tempo = 'X-0-1';
                    } else {
                        sets = 3;
                        reps = '10-12';
                        rest = '75s';
                        rpe = 7.5;
                        load = '65-70% RM';
                        tempo = '2-0-2';
                    }
                } else {
                    sets = 3;
                    reps = '10';
                    rest = '90s';
                    rpe = 7.5;
                    load = '70% RM';
                    tempo = '2-0-2';
                }

                if (isDeload) {
                    if (isME) {
                        sets = 3;
                        reps = '10';
                        rest = '90s';
                        rpe = 6;
                        load = '60% RM';
                    } else {
                        sets = Math.max(2, Math.floor(sets * 0.6));
                        rpe = Math.min(rpe, 6);
                        if (load && load.includes('%')) {
                            const val = Math.max(10, parseInt(load) - 10);
                            load = `${val}% RM`;
                        }
                    }
                }
            } else if (method === 'POLARIZED') {
                const isHighIntensity = day && (day.name.includes('Zona 4-5') || day.focus.includes('Potenza') || day.focus.includes('Forza Massima') || day.focus.includes('Zona4-5'));

                if (isHighIntensity) {
                    if (isDeload) {
                        sets = 3;
                        reps = '15-20';
                        rest = '60s';
                        rpe = 5.5;
                        load = '50% RM';
                        tempo = '2-0-2';
                    } else {
                        sets = isMain ? 5 : 4;
                        reps = '1-5';
                        rest = '4 min';
                        rpe = 9.5;
                        load = '85-90% RM';
                        tempo = '3-0-1';
                    }
                } else {
                    sets = isDeload ? 2 : (isMain ? 4 : 3);
                    reps = '15-20';
                    rest = '45-60s';
                    rpe = isDeload ? 5 : 5.5;
                    load = '50-60% RM';
                    tempo = '2-0-2';
                }
            }
        }

        if (phaseBlueprint.rpeCap && !(isDeload && !isClinical)) {
            rpe = Math.min(rpe, phaseBlueprint.rpeCap);
        }

        let note = ex.modification || ex.note || null;
        if (phaseBlueprint.kneeROM < 95 && (ex.primaryMuscle?.includes('Gambe') || ex.muscles?.some(m => m.includes('Gambe')))) {
            note = `⚠️ Limitare flessione ginocchio a ${phaseBlueprint.kneeROM}° max. ` + (note || '');
        }

        return {
            ...ex,
            specs: { sets, reps, rest, rpe, tempo, load },
            isadapted: ex.modification || phaseBlueprint.kneeROM < 95 ? true : false,
            note: note
        };
    };

    /**
     * Stima la durata complessiva della sessione in minuti.
     */
    window.WorkoutGeneratorAI.prototype._calculateDuration = function (session) {
        const sets = session.reduce((acc, ex) => {
            if (ex.isWarmup) return acc + 2;
            return acc + (parseInt(ex.specs?.sets) || 1);
        }, 0);
        return Math.round(sets * 2.8) + 8;
    };

})();
