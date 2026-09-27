/**
 * js/parser/load-aggregator.js
 * Robust aggregation of repeated load measurements for VBT.
 * Raggruppa le ripetizioni per (atleta, esercizio, carico arrotondato a 2.5kg),
 * applica filtraggio outlier con IQR (se n >= 4) e calcola media trimmed 10%.
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    /**
     * Numero minimo di ripetizioni necessarie per calcolare quartili e filtro IQR.
     */
    const IQR_MIN_REPS = 4;

    /**
     * Fattore moltiplicativo dello scarto interquartile (1.5 * IQR per outlier moderati).
     */
    const IQR_FENCE_FACTOR = 1.5;

    /**
     * Percentuale di taglio per la media trimmed (10% su ciascuna coda).
     */
    const TRIM_RATIO = 0.1;

    /**
     * Passo di arrotondamento standard per carichi su bilanciere (2.5 kg).
     */
    const LOAD_ROUND_STEP = 2.5;

    /**
     * Percentile per il primo quartile (Q1).
     */
    const Q1_PERCENTILE = 0.25;

    /**
     * Percentile per il terzo quartile (Q3).
     */
    const Q3_PERCENTILE = 0.75;

    /**
     * Soglia minima per media aritmetica semplice.
     */
    const MIN_REPS_FOR_SIMPLE_MEAN = 2;

    /**
     * Cifre decimali per velocità media e propulsiva.
     */
    const VELOCITY_DECIMAL_PLACES = 4;

    /**
     * Cifre decimali per metriche derivate (potenza, ROM, fatica).
     */
    const METRIC_DECIMAL_PLACES = 2;

    /**
     * Aggrega ripetizioni multiple dello stesso carico per lo stesso atleta ed esercizio.
     * Rimuove outlier di velocità e calcola medie robuste dei parametri VBT.
     * @param {Array<Object>} records - Array di record grezzi estratti.
     * @returns {Object} { aggregated, originalN, aggregatedN, wasAggregated }.
     */
    function aggregateByLoad(records) {
        if (!records || !Array.isArray(records) || records.length === 0) {
            return { aggregated: [], originalN: 0, wasAggregated: false };
        }

        // Verifica se è necessaria l'aggregazione (almeno un carico ripetuto con velocità valida)
        const vbtRecords = records
            .map(r => ({
                ...r,
                load: typeof r.load === 'number' ? r.load : parseFloat(r.load),
                velocity: typeof r.velocity === 'number' ? r.velocity : parseFloat(r.velocity)
            }))
            .filter(r => !isNaN(r.load) && r.load > 0 && !isNaN(r.velocity) && r.velocity > 0);
        if (vbtRecords.length === 0) {
            return { aggregated: records, originalN: records.length, wasAggregated: false };
        }

        const keyCount = {};
        for (const r of vbtRecords) {
            const rounded = Math.round(r.load / LOAD_ROUND_STEP) * LOAD_ROUND_STEP;
            const key = `${r.athlete}|||${r.exercise}|||${rounded}`;
            keyCount[key] = (keyCount[key] || 0) + 1;
        }

        const hasRepeats = Object.values(keyCount).some(c => c > 1);
        if (!hasRepeats) {
            return { aggregated: records, originalN: records.length, wasAggregated: false };
        }

        // Raggruppamento per chiave univoca
        const groups = {};
        for (const r of vbtRecords) {
            const roundedLoad = Math.round(r.load / LOAD_ROUND_STEP) * LOAD_ROUND_STEP;
            const key = `${r.athlete}|||${r.exercise}|||${roundedLoad}`;
            if (!groups[key]) {
                groups[key] = {
                    athlete: r.athlete,
                    exercise: r.exercise,
                    load: roundedLoad,
                    velocities: [],
                    reps: []
                };
            }
            groups[key].velocities.push(r.velocity);
            groups[key].reps.push(r);
        }

        // Calcolo media robusta per ciascun gruppo
        const aggregated = Object.values(groups).map(g => {
            const vels = [...g.velocities].sort((a, b) => a - b);
            const n = vels.length;
            let meanVel;

            if (n >= IQR_MIN_REPS) {
                // Rimozione outlier basata su IQR
                const idxQ1 = Math.round((n - 1) * Q1_PERCENTILE);
                const idxQ3 = Math.round((n - 1) * Q3_PERCENTILE);
                const q1 = vels[idxQ1];
                const q3 = vels[idxQ3];
                const iqr = q3 - q1;
                const fence = IQR_FENCE_FACTOR * iqr;
                const clean = vels.filter(v => v >= q1 - fence && v <= q3 + fence);

                if (clean.length > 0) {
                    // Media trimmed 10% sui valori depurati da outlier
                    const trim = Math.floor(clean.length * TRIM_RATIO);
                    const trimmed = clean.slice(trim, clean.length - trim);
                    meanVel = trimmed.length > 0
                        ? trimmed.reduce((a, b) => a + b, 0) / trimmed.length
                        : clean.reduce((a, b) => a + b, 0) / clean.length;
                } else {
                    meanVel = vels.reduce((a, b) => a + b, 0) / n;
                }
            } else if (n >= MIN_REPS_FOR_SIMPLE_MEAN) {
                // Media semplice per campioni ridotti (2 o 3 ripetizioni)
                meanVel = vels.reduce((a, b) => a + b, 0) / n;
            } else {
                meanVel = vels[0];
            }

            const firstRep = g.reps[0] || {};

            // Picco di velocità: massimo del gruppo
            const peakVels = g.reps.map(r => typeof r.peakVelocity === 'number' ? r.peakVelocity : parseFloat(r.peakVelocity)).filter(v => !isNaN(v) && v > 0);
            const peakVelocity = peakVels.length > 0 ? Math.max(...peakVels) : (firstRep.peakVelocity || null);

            // Potenza: media dei valori validi nel gruppo
            const powers = g.reps.map(r => typeof r.power === 'number' ? r.power : parseFloat(r.power)).filter(p => !isNaN(p) && p > 0);
            const power = powers.length > 0
                ? parseFloat((powers.reduce((a, b) => a + b, 0) / powers.length).toFixed(METRIC_DECIMAL_PLACES))
                : (firstRep.power || null);

            // Velocità propulsiva (Vmp): media del gruppo se disponibile
            const propVels = g.reps.map(r => typeof r.propulsiveVelocity === 'number' ? r.propulsiveVelocity : parseFloat(r.propulsiveVelocity)).filter(v => !isNaN(v) && v > 0);
            const propulsiveVelocity = propVels.length > 0
                ? parseFloat((propVels.reduce((a, b) => a + b, 0) / propVels.length).toFixed(VELOCITY_DECIMAL_PLACES))
                : (firstRep.propulsiveVelocity || null);

            // Range of Motion (ROM): media del gruppo se disponibile
            const roms = g.reps.map(r => typeof r.rom === 'number' ? r.rom : parseFloat(r.rom)).filter(v => !isNaN(v) && v > 0);
            const rom = roms.length > 0
                ? parseFloat((roms.reduce((a, b) => a + b, 0) / roms.length).toFixed(METRIC_DECIMAL_PLACES))
                : (firstRep.rom || null);

            // Fatica: media del gruppo se disponibile
            const fatigues = g.reps.map(r => typeof r.fatigue === 'number' ? r.fatigue : parseFloat(r.fatigue)).filter(v => !isNaN(v));
            const fatigue = fatigues.length > 0
                ? parseFloat((fatigues.reduce((a, b) => a + b, 0) / fatigues.length).toFixed(METRIC_DECIMAL_PLACES))
                : (firstRep.fatigue || null);

            return {
                athlete: g.athlete,
                athleteRaw: firstRep.athleteRaw || g.athlete,
                athleteRawId: firstRep.athleteRawId || null,
                exercise: g.exercise,
                exerciseId: firstRep.exerciseId || null,
                sessionId: firstRep.sessionId || null,
                deviceId: firstRep.deviceId || null,
                date: firstRep.date || null,
                load: g.load,
                velocity: parseFloat(meanVel.toFixed(VELOCITY_DECIMAL_PLACES)),
                peakVelocity: peakVelocity,
                propulsiveVelocity: propulsiveVelocity,
                power: power,
                rom: rom,
                fatigue: fatigue,
                oneRm: firstRep.oneRm || null,
                percentOneRm: firstRep.percentOneRm || null,
                repsCount: n,
                // Force Plates
                forceZ: null, peakForce: null, meanForce: null, rfd: null, impulse: null, rsimod: null, leftForce: null, rightForce: null, asymmetry: null,
                // Block Start Accelerometers
                accelX: null, accelY: null, accelZ: null, horizontalAccel: null, resultantAccel: null, reactionTime: null, pushDuration: null, exitVelocity: null,
                // Timing Gates / Fotocellule
                splitDistance: null, splitTime: null, cumulativeTime: null, splitVelocity: null,
                split_5m: null, split_10m: null, split_20m: null, split_30m: null, split_60m: null,
                // Kinematics
                frame: null, time: null, kneeAngle: null, hipAngle: null, ankleAngle: null, trunkAngle: null, jointAngle: null, angularVelocity: null, coordX: null, coordY: null, linearVelocity: null,
                // Vertical Jump
                jumpHeight: null, contactTime: null, dropHeight: null, rsi: null, eur: null,
                // Medicine Ball Throws
                ballMass: null, throwDistance: null, flightTime: null, releaseAngle: null, releaseHeight: null,
                // Running / General
                distance: null, pace: null
            };
        });

        // Ordinamento per atleta, esercizio e carico crescente
        aggregated.sort((a, b) => {
            const athA = String(a.athlete || '');
            const athB = String(b.athlete || '');
            if (athA !== athB) return athA.localeCompare(athB);
            const exA = String(a.exercise || '');
            const exB = String(b.exercise || '');
            if (exA !== exB) return exA.localeCompare(exB);
            return (a.load || 0) - (b.load || 0);
        });

        // I record non-VBT (es. salti, corsa) vengono preservati integri
        const nonVbt = records.filter(r => {
            const l = typeof r.load === 'number' ? r.load : parseFloat(r.load);
            const v = typeof r.velocity === 'number' ? r.velocity : parseFloat(r.velocity);
            return !(l > 0 && v > 0);
        });

        return {
            aggregated: [...aggregated, ...nonVbt],
            originalN: records.length,
            aggregatedN: aggregated.length,
            wasAggregated: true
        };
    }

    // Esposizione per ambiente browser e test runner Node.js
    root._parserAggregateByLoad = aggregateByLoad;
    if (typeof window !== 'undefined') {
        window._parserAggregateByLoad = aggregateByLoad;
    }
})();
