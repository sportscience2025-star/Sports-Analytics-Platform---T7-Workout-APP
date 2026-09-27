/**
 * js/parser/instrument-detector.js
 * Automatic sports science measurement instrument classification.
 * Classifica il dataset in 8 categorie strumentali in base alle metriche presenti nei record e nelle intestazioni.
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    /**
     * Classifica automaticamente lo strumento di misura biomeccanico o sport science.
     * Supporta: VBT, FORCE_PLATE, BLOCK_ACCEL, SPRINT_TIMING, MEDICINE_BALL, VIDEO_KINEMATICS, JUMP_TEST, GENERAL_TABULAR.
     * @param {Array<Object>} records - Array di record estratti dal file.
     * @param {Array<string>} headers - Array delle intestazioni del foglio.
     * @param {Object} [extraContext={}] - Metadati di contesto ausiliari (nomi fogli, nome file).
     * @returns {Object} Oggetto con { type, label, summary, metrics }.
     */
    function detectInstrumentType(records, headers, extraContext = {}) {
        const safeRecords = Array.isArray(records) ? records : [];
        const safeHeaders = Array.isArray(headers) ? headers : [];
        const hStr = safeHeaders.map(h => String(h).toLowerCase()).join(' ');
        const isNum = v => typeof v === 'number' && !isNaN(v) && isFinite(v);

        // 1. Rilevamento metriche VBT (Encoder)
        const vbtCount = safeRecords.filter(r => isNum(r.load) && r.load > 0 &&
            ((isNum(r.velocity) && r.velocity > 0) ||
             (isNum(r.peakVelocity) && r.peakVelocity > 0) ||
             (isNum(r.propulsiveVelocity) && r.propulsiveVelocity > 0) ||
             (isNum(r.power) && r.power > 0))).length;
        const hasVbtHeaders = /\b(vmean|v_mean|vm|vmp|mpv|vmax|mean_?velocity|mean_?speed|velocit|velocity|speed|encoder|vitruve|gymaware|speed4lifts|repone)\b/i.test(hStr) ||
            (/\b(load|carico|peso|carga)\b/i.test(hStr) && /\b(vmean|v_mean|vm|vmp|mpv|vmax|mean_?velocity|mean_?speed|velocit|velocity|speed)\b/i.test(hStr));

        // 2. Pedana di Forza (Force Plate - Kistler, Hawkin Dynamics, ForceDecks)
        const forceCount = safeRecords.filter(r => (isNum(r.forceZ) && Math.abs(r.forceZ) > 0) ||
            (isNum(r.peakForce) && r.peakForce > 0) ||
            (isNum(r.rfd) && r.rfd > 0) ||
            (isNum(r.impulse) && r.impulse > 0) ||
            (isNum(r.rsimod) && r.rsimod > 0) ||
            (isNum(r.leftForce) && r.leftForce > 0)).length;
        const hasForceHeaders = /\b(f_?z|forza_?verticale|vertical_?force|kistler|hawkin|forcedecks|rfd|impulso|impulse|fz\s*\(n\)|forza\s*\(n\)|force\s*\(n\))\b/i.test(hStr);
        if (forceCount > 0 || (hasForceHeaders && safeRecords.length > 0 && vbtCount === 0)) {
            return {
                type: 'FORCE_PLATE',
                label: 'Pedana di Forza (Hawkin Dynamics / ForceDecks / Kistler)',
                summary: 'Curva forza-tempo verticale, RFD, picco di forza e impulso',
                metrics: ['forceZ', 'peakForce', 'rfd', 'impulse', 'rsimod']
            };
        }

        // 3. Accelerometro / IMU Blocchi di Partenza (Block Start)
        const accelCount = safeRecords.filter(r => (isNum(r.horizontalAccel) && Math.abs(r.horizontalAccel) > 0) ||
            (isNum(r.resultantAccel) && Math.abs(r.resultantAccel) > 0) ||
            (isNum(r.accelX) && Math.abs(r.accelX) > 0) ||
            (isNum(r.accelY) && Math.abs(r.accelY) > 0) ||
            (isNum(r.reactionTime) && r.reactionTime > 0) ||
            (isNum(r.pushDuration) && r.pushDuration > 0)).length;
        const hasAccelHeaders = /\b(accel|acceleraz|blocco|blocchi|block_?start|a_?horiz|reaction_?time|tempo_?reazione|push_?duration)\b/i.test(hStr);
        if (accelCount > 0 || (hasAccelHeaders && safeRecords.length > 0 && vbtCount === 0)) {
            return {
                type: 'BLOCK_ACCEL',
                label: 'Accelerometro / IMU Blocchi di Partenza',
                summary: 'Accelerazione orizzontale e triassiale, tempo di reazione e spinta sui blocchi',
                metrics: ['horizontalAccel', 'accelX', 'accelY', 'accelZ', 'reactionTime', 'pushDuration', 'exitVelocity']
            };
        }

        // 4. Fotocellule Sprint (Timing Gates - Microgate Witty, Freelap, Brower)
        const sprintCount = safeRecords.filter(r => (isNum(r.splitDistance) && r.splitDistance > 0) ||
            (isNum(r.splitTime) && r.splitTime > 0) ||
            (isNum(r.cumulativeTime) && r.cumulativeTime > 0) ||
            (isNum(r.split_5m) && r.split_5m > 0) ||
            (isNum(r.split_10m) && r.split_10m > 0) ||
            (isNum(r.split_20m) && r.split_20m > 0) ||
            (isNum(r.split_30m) && r.split_30m > 0) ||
            (isNum(r.split_60m) && r.split_60m > 0)).length;
        const hasSprintHeaders = /\b(split|fotocellul|timing|witty|freelap|intertempo|traguardo|gate|0-5m|0-10m|0-20m|0-30m|0-60m|5m|10m|20m|30m|60m)\b/i.test(hStr);
        if (sprintCount > 0 || (hasSprintHeaders && safeRecords.length > 0 && vbtCount === 0)) {
            return {
                type: 'SPRINT_TIMING',
                label: 'Fotocellule Sprint (Microgate Witty / Freelap / Brower)',
                summary: 'Intertempi, progressione di velocità e profilo Samozino-Morin',
                metrics: ['splitTime', 'splitDistance', 'cumulativeTime', 'splitVelocity']
            };
        }

        // 5. Lancio Palla Medica (Medicine Ball Throws - Cinematica Balistica & Potenza)
        const medBallCount = safeRecords.filter(r =>
            (isNum(r.ballMass) && r.ballMass > 0) ||
            (isNum(r.throwDistance) && r.throwDistance > 0) ||
            ((isNum(r.flightTime) && r.flightTime > 0) && (isNum(r.throwDistance) || isNum(r.ballMass) || /\b(palla|ball|lancio|throw)\b/i.test(hStr))) ||
            (isNum(r.releaseAngle) && r.releaseAngle > 0) ||
            (isNum(r.releaseHeight) && r.releaseHeight > 0) ||
            ((isNum(r.load) && r.load > 0) && (isNum(r.distance) && r.distance > 0))
        ).length;

        const hasMedBallHeaders = /\b(palla_?medica|medicine_?ball|medball|peso_?palla|ball_?mass|ball_?weight|massa_?palla|distanza_?lancio|throw_?dist(ance)?|distanza_?palla|angolo_?rilascio|release_?angle|angolo_?lancio|altezza_?rilascio|release_?height)\b/i.test(hStr) ||
            (/\b(lancio|throw)\b/i.test(hStr) && /\b(tempo_?volo|flight_?time)\b/i.test(hStr));

        const hasMedBallExercise = safeRecords.some(r => {
            const ex = (r.exercise || '').toLowerCase();
            return /palla_?medica|medicine_?ball|medball|lancio|throw/i.test(ex);
        });

        const hasMedBallContext = Boolean(
            (extraContext && extraContext.sheetNames && extraContext.sheetNames.some(s => /palla_?medica|medicine_?ball|medball|lancio/i.test(s))) ||
            (extraContext && extraContext.filename && /palla_?medica|medicine_?ball|medball|lancio/i.test(extraContext.filename))
        );

        if ((medBallCount > 0 || hasMedBallHeaders || hasMedBallExercise || hasMedBallContext) && vbtCount === 0) {
            return {
                type: 'MEDICINE_BALL',
                label: 'Lancio Palla Medica (Cinematica & Potenza Balistica)',
                summary: 'Cinematica balistica, velocità di uscita, tempo di volo e potenza propulsiva stimata',
                metrics: ['ballMass', 'throwDistance', 'flightTime', 'releaseAngle', 'releaseHeight', 'exitVelocity', 'meanPower', 'peakPower']
            };
        }

        // 6. Videoanalisi Cinematica 2D (Kinovea / Dartfish / Tracker)
        const kinCount = safeRecords.filter(r => isNum(r.kneeAngle) || isNum(r.hipAngle) || isNum(r.ankleAngle) ||
            isNum(r.trunkAngle) || isNum(r.jointAngle) || isNum(r.angularVelocity) ||
            (isNum(r.frame) && (isNum(r.coordX) || isNum(r.coordY)))).length;
        const hasKinHeaders = /\b(kinovea|dartfish|tracker|angolo|angle|joint|ginocchio|knee|anca|hip|caviglia|ankle|tronco|trunk|marker|deg|°)\b/i.test(hStr);
        if (kinCount > 0 || (hasKinHeaders && safeRecords.length > 0 && vbtCount === 0)) {
            return {
                type: 'VIDEO_KINEMATICS',
                label: 'Videoanalisi Cinematica 2D (Kinovea / Dartfish / Tracker)',
                summary: 'Cinematica articolare, traiettorie marker e velocità angolari',
                metrics: ['kneeAngle', 'hipAngle', 'ankleAngle', 'trunkAngle', 'jointAngle', 'angularVelocity']
            };
        }

        // 7. Post-Activation Potentiation (Studio PAP & Profilo Neuromuscolare)
        const isPapExplicit = /\b(pap|potentiation|post[-_ ]activation|potenziamento)\b/i.test(hStr) ||
            Boolean(extraContext && extraContext.filename && /pap|potenziamento|post[-_ ]activation/i.test(extraContext.filename)) ||
            Boolean(root.PAPBenchmarkData && typeof root.PAPBenchmarkData.isPAPDataset === 'function' && root.PAPBenchmarkData.isPAPDataset(safeRecords, safeHeaders));

        if (isPapExplicit && vbtCount === 0) {
            return {
                type: 'PAP_ANALYSIS',
                label: 'Post-Activation Potentiation (Studio PAP & Profilo Neuromuscolare)',
                summary: 'Analisi PRE-POST, soglie MDC 95%, scomposizione RSI, inferenza e prescrizione coach',
                metrics: ['jumpHeight', 'contactTime', 'rsi', 'flightTime', 'power']
            };
        }

        // 8. Test di Salto Verticale (SJ, CMJ, Drop Jump)
        const jumpCount = safeRecords.filter(r => (isNum(r.jumpHeight) && r.jumpHeight > 0) ||
            (isNum(r.contactTime) && r.contactTime > 0) ||
            (isNum(r.dropHeight) && r.dropHeight > 0)).length;
        const hasJumpExercise = safeRecords.some(r => {
            const ex = (r.exercise || '').toLowerCase();
            return ex === 'cmj' || ex === 'sj' || ex === 'dj' || ex.includes('jump') || ex.includes('salto');
        });
        const hasJumpHeaders = /\b(altezza_?salto|jump_?height|drop_?height|caduta|tempo_?contatto|contact_?time|volo|flight_?time)\b/i.test(hStr) ||
            (/\b(cmj|sj|dj)\b/i.test(hStr) && !/\b(serie|reps|note)\b/i.test(hStr));
        if ((jumpCount > 0 || (hasJumpHeaders && safeRecords.length > 0)) && vbtCount === 0) {
            return {
                type: 'JUMP_TEST',
                label: 'Test di Salto Verticale (SJ / CMJ / Drop Jump)',
                summary: 'Altezza salto, indici di forza reattiva (RSI) ed EUR',
                metrics: ['jumpHeight', 'contactTime', 'dropHeight', 'rsi', 'eur']
            };
        }

        // 8. Encoder Lineare VBT (Vitruve / GymAware / Speed4Lifts / RepOne)
        if (vbtCount > 0 || hasVbtHeaders) {
            return {
                type: 'VBT',
                label: 'Encoder Lineare VBT (Vitruve / GymAware / Speed4Lifts / RepOne)',
                summary: 'Profilo Carico-Velocità, stima 1RM e carichi target',
                metrics: ['load', 'velocity', 'peakVelocity', 'power']
            };
        }

        // 9. Fallback Dati Tabellari Generali
        return {
            type: 'GENERAL_TABULAR',
            label: 'Dati Tabellari Grezzi',
            summary: 'Dati tabellari rilevati',
            metrics: []
        };
    }

    const instrumentDetector = {
        detectInstrumentType
    };

    // Esposizione per ambiente browser e test runner Node.js
    root._parserInstrumentDetector = instrumentDetector;
    if (typeof window !== 'undefined') {
        window._parserInstrumentDetector = instrumentDetector;
    }
})();
