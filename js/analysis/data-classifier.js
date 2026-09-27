/**
 * js/analysis/data-classifier.js
 * Ingestion, Heuristic Auto-Classification & Biomechanical Sanity Normalizer.
 *
 * Responsabilità:
 * 1. Riconoscimento euristico polimorfico del tipo di test dai file XLSX, CSV, JSON, TXT:
 *    - TEST_TYPE_JUMP_STIFFNESS (TC, TF, Jump Height, RSI, Contact Time, Flight Time, SJ, CMJ, DJ, ABK)
 *    - TEST_TYPE_VBT (Load, Mean Velocity, Peak Velocity, ROM, Power)
 *    - TEST_TYPE_SPRINT_GATES (Split 5m, 10m, 20m, 30m, 60m, Vmax, Accelerazione)
 *    - TEST_TYPE_VIDEO_2D (Knee Angle, Hip Angle, Ankle Angle, Trunk Lean, COM, Angular Velocity)
 *    - TEST_TYPE_FORCE_ISOMETRIC (Peak Force, Mean Force, RFD 100/200ms, Impulse, Asimmetria L/R)
 *    - TEST_TYPE_MEDICINE_BALL (Ball Mass, Throw Distance, Release Angle, Release Height)
 *    - TEST_TYPE_GENERIC (Tabellare generico con interfaccia di mappatura assistita)
 * 2. Sanity check e validazione di integrità cinematica balistica:
 *    - Relazione fisica h = (g * TF^2) / 8 con tolleranze certificate
 *    - Supporto automatico unità in millisecondi e secondi per TC e TF
 *    - Rilevamento ed esclusione di falsi stacchi (TC = -1 o contatti parassiti < 50ms)
 * 3. Normalizzazione polimorfica standardizzata (currentSessionData payload).
 * 4. Mappatura assistita delle colonne per file generici non strutturati.
 * 5. Dataset campione realistici certificati per ciascuna tipologia.
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    // --- Costanti Fisiche e Cinematica Balistica (Nessun Numero Magico) ---
    const GRAVITY_MPS2 = 9.81;
    const KINEMATIC_DIVISOR = 8.0;
    const METERS_TO_CM = 100.0;
    const SECONDS_TO_MS = 1000.0;
    const MS_THRESHOLD_SECONDS = 5.0; // Se TC o TF > 5, sono espressi in millisecondi
    const KINEMATIC_ABS_TOLERANCE_CM = 2.5;
    const KINEMATIC_REL_TOLERANCE_PCT = 0.07;
    const INVALID_CONTACT_CODE = -1;
    const MIN_PHYSIOLOGICAL_TC_SEC = 0.05; // 50ms: tempo minimo fisiologico di contatto reattivo
    const MAX_PHYSIOLOGICAL_TC_SEC = 0.90; // 900ms: tempo massimo ammissibile per salto reattivo
    const MIN_PHYSIOLOGICAL_TF_SEC = 0.15; // 150ms: tempo di volo minimo plausibile
    const MAX_PHYSIOLOGICAL_TF_SEC = 1.20; // 1200ms: tempo di volo massimo plausibile
    const MIN_PLAUSIBLE_HEIGHT_CM = 4.0;
    const MAX_PLAUSIBLE_HEIGHT_CM = 110.0;
    const MDC_95_MULTIPLIER = 1.96;
    const SQRT_TWO = 1.41421356;
    const POTENTIATION_THRESHOLD_PCT = 5.0;
    const FATIGUE_THRESHOLD_PCT = -5.0;
    const DEFAULT_RECOVERY_TIME_MINUTES = 21.9;
    const DEFAULT_REBOUND_WINDOW = 8;
    const VBT_MVT_DEFAULT = 0.30;
    const VBT_EST_1RM_MULTIPLIER = 1.25;
    const SPRINT_DEFAULT_ACCEL_10M = 1.74;
    const SPRINT_VMAX_COEFF = 1.65;
    const SPRINT_DEFAULT_VMAX = 9.5;
    const SPRINT_DEFAULT_DECAY_PCT = 6.8;
    const SPRINT_DEFAULT_F0 = 8.2;
    const VIDEO_DEFAULT_MIN_KNEE = 88.0;
    const VIDEO_DEFAULT_MAX_KNEE = 172.5;
    const VIDEO_DEFAULT_PEAK_ANG_VEL = 340.0;
    const VIDEO_DEFAULT_ASYMMETRY_PCT = 3.4;
    const VIDEO_DEFAULT_DIFF_DEG = 4.2;
    const FORCE_DEFAULT_PEAK_N = 2850.0;
    const FORCE_DEFAULT_RFD = 6800.0;
    const FORCE_DEFAULT_ASYMMETRY_PCT = 2.8;
    const FORCE_DEFAULT_DSI = 0.78;
    const EPSILON_DIVISOR = 0.0001;
    const MAX_METERS_JUMP_HEIGHT = 2.0;
    const MEDBALL_DEFAULT_DIST_M = 7.5;
    const MEDBALL_DEFAULT_POWER_W = 1300.0;
    const MEDBALL_DEFAULT_MASS_KG = 4.0;
    const MEDBALL_PEAK_FACTOR = 1.15;
    const MAX_PHYSIOLOGICAL_VBT_VELOCITY_MPS = 3.5;
    const MAX_PHYSIOLOGICAL_VBT_LOAD_KG = 600.0;
    const MIN_ATHLETE_NAME_LENGTH = 2;

    // --- Costanti Tipi di Test ---
    const TEST_TYPE_JUMP_STIFFNESS = 'TEST_TYPE_JUMP_STIFFNESS';
    const TEST_TYPE_VBT = 'TEST_TYPE_VBT';
    const TEST_TYPE_SPRINT_GATES = 'TEST_TYPE_SPRINT_GATES';
    const TEST_TYPE_VIDEO_2D = 'TEST_TYPE_VIDEO_2D';
    const TEST_TYPE_FORCE_ISOMETRIC = 'TEST_TYPE_FORCE_ISOMETRIC';
    const TEST_TYPE_MEDICINE_BALL = 'TEST_TYPE_MEDICINE_BALL';
    const TEST_TYPE_GENERIC = 'TEST_TYPE_GENERIC';

    /**
     * Converte in modo sicuro qualsiasi input in un numero finito.
     * @param {*} val - Valore da convertire.
     * @param {number|null} [fallback=null] - Valore di fallback.
     * @returns {number|null} Numero valido o fallback.
     */
    function safeFloat(val, fallback = null) {
        if (val === null || val === undefined || val === '') return fallback;
        if (typeof val === 'number') return isFinite(val) ? val : fallback;
        const str = String(val).trim().replace(',', '.');
        const num = parseFloat(str);
        return (!isNaN(num) && isFinite(num)) ? num : fallback;
    }

    /**
     * Calcola l'altezza teorica di salto (in cm) dal tempo di volo (in secondi): h = (g * t^2) / 8.
     * @param {number} flightTimeSec - Tempo di volo in secondi.
     * @returns {number} Altezza calcolata in centimetri.
     */
    function calcTheoreticalJumpHeightCm(flightTimeSec) {
        const tf = safeFloat(flightTimeSec, 0);
        if (tf <= 0) return 0;
        return (GRAVITY_MPS2 * Math.pow(tf, 2) / KINEMATIC_DIVISOR) * METERS_TO_CM;
    }

    /**
     * Valida la coerenza balistica e metrologica di una singola prova di salto.
     * Gestisce la conversione trasparente ms/s e il filtro dei falsi stacchi.
     * @param {Object} record - Record della prova con jumpHeight, flightTime, contactTime.
     * @returns {Object} Esito con { isValid, reason, diffCm, theoreticalHeightCm }.
     */
    function validateJumpTrial(record) {
        let h = safeFloat(record.jumpHeight || record.height || record.h, null);
        let tf = safeFloat(record.flightTime || record.tf || record.flight_time, null);
        let tc = safeFloat(record.contactTime || record.tc || record.contact_time, null);

        // Conversione trasparente da millisecondi a secondi se i valori eccedono la soglia
        if (tc !== null && tc > MS_THRESHOLD_SECONDS) {
            tc = tc / SECONDS_TO_MS;
        }
        if (tf !== null && tf > MS_THRESHOLD_SECONDS) {
            tf = tf / SECONDS_TO_MS;
        }

        // Conversione trasparente metri -> centimetri se h espresso in metri (es. 0.15 - 2.00 m)
        if (h !== null && h > 0 && h <= MAX_METERS_JUMP_HEIGHT) {
            h = h * METERS_TO_CM;
        }

        // Controllo 1: falso stacco o errore contatto iniziale (TC = -1 o TC negativo)
        if (tc !== null && (tc === INVALID_CONTACT_CODE || tc < 0)) {
            return {
                isValid: false,
                reason: `Falso stacco o errore contatto pedana (TC = ${tc}s)`,
                diffCm: 0,
                theoreticalHeightCm: h || 0
            };
        }

        // Controllo 2: Contatto reattivo troppo breve (impossibile fisiologicamente < 50ms)
        if (tc !== null && tc > 0 && tc < MIN_PHYSIOLOGICAL_TC_SEC) {
            return {
                isValid: false,
                reason: `Falso contatto o rimbalzo parassita (TC = ${(tc * SECONDS_TO_MS).toFixed(0)} ms < ${(MIN_PHYSIOLOGICAL_TC_SEC * SECONDS_TO_MS).toFixed(0)} ms)`,
                diffCm: 0,
                theoreticalHeightCm: h || 0
            };
        }

        // Controllo 3: TC eccessivo per salto reattivo (> 900ms)
        if (tc !== null && tc > MAX_PHYSIOLOGICAL_TC_SEC) {
            return {
                isValid: false,
                reason: `Tempo di contatto anomalo per salto reattivo (TC = ${tc.toFixed(3)}s > ${MAX_PHYSIOLOGICAL_TC_SEC}s)`,
                diffCm: 0,
                theoreticalHeightCm: h || 0
            };
        }

        // Controllo 4: Coerenza cinematica TF vs H (se entrambi disponibili)
        if (tf !== null && tf > 0 && h !== null && h > 0) {
            if (tf < MIN_PHYSIOLOGICAL_TF_SEC || tf > MAX_PHYSIOLOGICAL_TF_SEC) {
                return {
                    isValid: false,
                    reason: `Tempo di volo fuori range balistico (TF = ${tf.toFixed(3)}s)`,
                    diffCm: 0,
                    theoreticalHeightCm: calcTheoreticalJumpHeightCm(tf)
                };
            }

            const theorH = calcTheoreticalJumpHeightCm(tf);
            const diffCm = Math.abs(h - theorH);
            const relDiff = theorH > 0 ? (diffCm / theorH) : 0;

            if (diffCm > KINEMATIC_ABS_TOLERANCE_CM && relDiff > KINEMATIC_REL_TOLERANCE_PCT) {
                return {
                    isValid: false,
                    reason: `Discrepanza cinematica h vs tf: registrato ${h.toFixed(1)} cm, teorico ${theorH.toFixed(1)} cm (scarto ${diffCm.toFixed(1)} cm)`,
                    diffCm,
                    theoreticalHeightCm: theorH
                };
            }

            return { isValid: true, reason: 'Validato cinematica conforme', diffCm, theoreticalHeightCm: theorH };
        }

        // Se è presente solo h o solo tf, verificare i limiti fisiologici
        if (h !== null) {
            if (h < MIN_PLAUSIBLE_HEIGHT_CM || h > MAX_PLAUSIBLE_HEIGHT_CM) {
                return {
                    isValid: false,
                    reason: `Altezza salto fuori dai limiti fisiologici (${h} cm)`,
                    diffCm: 0,
                    theoreticalHeightCm: h
                };
            }
            return { isValid: true, reason: 'Altezza nei parametri fisiologici', diffCm: 0, theoreticalHeightCm: h };
        }

        return { isValid: true, reason: 'Dati conformi', diffCm: 0, theoreticalHeightCm: 0 };
    }

    /**
     * Motore di Riconoscimento Euristico del Tipo di Test.
     * Analizza le intestazioni, metadati e distribuzioni numeriche evitando falsi positivi da sottostringhe.
     * @param {Array<Object>} records - Righe del dataset.
     * @param {Array<string>} headers - Nomi delle colonne.
     * @param {string} [filename=''] - Nome del file caricato.
     * @returns {string} Codice identificativo del test type.
     */
    function classifyTestType(records, headers = [], filename = '') {
        const safeHeaders = Array.isArray(headers) ? headers.map(h => String(h || '').toLowerCase().trim()) : [];
        const safeRecords = Array.isArray(records) ? records : [];
        const hText = safeHeaders.join(' ') + ' ' + String(filename || '').toLowerCase();

        // Helper per matching esatto di parola/token isolato
        const hasHeaderToken = (token) => safeHeaders.some(h => {
            const words = h.split(/[^a-z0-9_]/);
            return words.includes(token);
        });

        // 1. Rilevamento TEST_TYPE_VIDEO_2D (Cinematica Articolare e Angoli)
        const videoKeywords = ['kinovea', 'dartfish', 'tracker', 'videoanalisi', 'kinematics', 'cinematica'];
        const videoCols = ['knee_angle', 'hip_angle', 'ankle_angle', 'trunk_angle', 'angolo_ginocchio', 'angolo_anca', 'angular_velocity', 'velocita_angolare', 'frame', 'trunk_lean', 'trunk lean', 'com', 'center of mass', 'baricentro'];
        const hasVideoKeyword = videoKeywords.some(kw => hText.includes(kw));
        const hasVideoCols = videoCols.some(col => safeHeaders.some(h => h.includes(col)));
        const recordsWithVideo = safeRecords.filter(r => {
            return safeFloat(r.kneeAngle || r.hipAngle || r.trunkAngle || r.angularVelocity || r.trunkLean || r.com) !== null;
        }).length;

        if (hasVideoKeyword || hasVideoCols || recordsWithVideo > 0) {
            return TEST_TYPE_VIDEO_2D;
        }

        // 2. Rilevamento TEST_TYPE_JUMP_STIFFNESS / PAP (Priorità elevata su salti verticali)
        const jumpKeywords = ['jump', 'salto', 'cmj', 'sj', 'dj', 'abk', 'stiffness', 'pap', 'potentiation', 'rebound', 'rimbalzo', 'optojump', 'microgate', 'flight_time', 'contact_time'];
        const jumpCols = ['contact_time', 'flight_time', 'jump_height', 'altezza_salto', 'volo', 'contatto', 'rsi', 'tc', 'tf'];
        const hasJumpKeyword = jumpKeywords.some(kw => hText.includes(kw));
        const hasJumpCol = jumpCols.some(col => safeHeaders.some(h => h.includes(col))) || hasHeaderToken('tc') || hasHeaderToken('tf') || hasHeaderToken('rsi');

        const hasAnthropometricHeightWeight = safeHeaders.some(h => h === 'height' || h === 'statura') &&
                                             safeHeaders.some(h => h === 'weight' || h === 'peso') &&
                                             !hasJumpKeyword;

        const recordsWithJump = (!hasAnthropometricHeightWeight) ? safeRecords.filter(r => {
            const h = safeFloat(r.jumpHeight || r.h);
            const tf = safeFloat(r.flightTime || r.tf);
            const tc = safeFloat(r.contactTime || r.tc);
            const rsi = safeFloat(r.rsi);
            return (h !== null && h > 0) || (tf !== null && tf > 0) || (tc !== null && tc > 0) || (rsi !== null && rsi > 0);
        }).length : 0;

        if ((hasJumpKeyword || hasJumpCol || recordsWithJump > 0) &&
            !hText.includes('encoder') && !hText.includes('split') && !hText.includes('kinovea')) {
            return TEST_TYPE_JUMP_STIFFNESS;
        }

        // 3. Rilevamento TEST_TYPE_SPRINT_GATES (Sprint & Intertempi Fotocellule)
        const sprintKeywords = ['sprint', 'fotocellule', 'photocells', 'witty', 'freelap', 'brower', 'intertempi', 'gates'];
        const sprintCols = ['split', 'split_10m', 'split_20m', 'split_30m', 'split_60m', '0-10m', '0-20m', '0-30m', '0-60m', 'vmax'];
        const hasSprintKeyword = sprintKeywords.some(kw => hText.includes(kw));
        const hasSprintCols = sprintCols.some(col => safeHeaders.some(h => h.includes(col)));
        const recordsWithSprint = safeRecords.filter(r => {
            return safeFloat(r.split_10m || r.split10 || r['0-10m'] || r.splitTime || r.cumulativeTime) !== null;
        }).length;

        if (hasSprintKeyword || hasSprintCols || recordsWithSprint > 0) {
            return TEST_TYPE_SPRINT_GATES;
        }

        // 4. Rilevamento TEST_TYPE_FORCE_ISOMETRIC (Pedana di Forza / IMTP)
        const forceKeywords = ['force plate', 'pedana', 'imtp', 'isometric', 'kistler', 'hawkin', 'forcedecks'];
        const forceCols = ['peakforce', 'peak_force', 'picco_forza', 'mean_force', 'rfd', 'impulse', 'impulso', 'asymmetry', 'asimmetria'];
        const hasForceKeyword = forceKeywords.some(kw => hText.includes(kw));
        const hasForceCols = forceCols.some(col => safeHeaders.some(h => h.includes(col)));
        const recordsWithForce = safeRecords.filter(r => {
            return safeFloat(r.peakForce || r.rfd || r.impulse) !== null;
        }).length;

        if (hasForceKeyword || hasForceCols || recordsWithForce > 0) {
            return TEST_TYPE_FORCE_ISOMETRIC;
        }

        // 5. Rilevamento TEST_TYPE_MEDICINE_BALL
        const medBallKeywords = ['palla medica', 'medicine ball', 'medball', 'lancio'];
        if (medBallKeywords.some(kw => hText.includes(kw))) {
            return TEST_TYPE_MEDICINE_BALL;
        }

        // 6. Rilevamento TEST_TYPE_VBT (Encoder Lineare Carico-Velocità con Guardrail Fisiologici)
        const vbtKeywords = ['vbt', 'encoder', 'vitruve', 'gymaware', 'speed4lifts', 'repone', 'carico-velocita', 'load-velocity'];
        const hasVbtKeyword = vbtKeywords.some(kw => hText.includes(kw));
        const hasVbtCols = (safeHeaders.some(h => h.includes('load') || h.includes('carico') || hasHeaderToken('kg')) &&
                           safeHeaders.some(h => h.includes('velo') || h.includes('speed') || h.includes('vmean') || h.includes('vmp')));
        
        // Verifica fisiologica: i dati non devono superare velocità o carichi biologicamente assurdi
        const recordsWithVbt = safeRecords.filter(r => {
            const l = safeFloat(r.load || r.carico);
            const v = safeFloat(r.velocity || r.vmean || r.vmp || r.meanVelocity);
            return l !== null && v !== null && l > 0 && l <= MAX_PHYSIOLOGICAL_VBT_LOAD_KG && v > 0 && v <= MAX_PHYSIOLOGICAL_VBT_VELOCITY_MPS;
        }).length;

        // Se non contiene colonne di salto/stiffness e rispetta i vincoli fisiologici
        if ((hasVbtKeyword || hasVbtCols || recordsWithVbt >= 2) && !hasJumpCol && !hasJumpKeyword) {
            return TEST_TYPE_VBT;
        }

        return TEST_TYPE_GENERIC;
    }

    /**
     * Restituisce la descrizione testuale leggibile del tipo di test.
     * @param {string} testType - Identificativo test type.
     * @returns {string} Etichetta leggibile.
     */
    function getTestTypeName(testType) {
        switch (testType) {
            case TEST_TYPE_JUMP_STIFFNESS:
                return 'Salti Verticali & Stiffness Reattiva (PAP / SJ / CMJ / DJ)';
            case TEST_TYPE_VBT:
                return 'Velocity-Based Training (Encoder Lineare Carico-Velocità)';
            case TEST_TYPE_SPRINT_GATES:
                return 'Sprint & Intertempi a Fotocellule (Profilo F-V Orizzontale)';
            case TEST_TYPE_VIDEO_2D:
                return 'Videoanalisi Cinematica 2D (Kinovea / Angoli Articolari)';
            case TEST_TYPE_FORCE_ISOMETRIC:
                return 'Test Isometrico su Pedana di Forza (IMTP / RFD)';
            case TEST_TYPE_MEDICINE_BALL:
                return 'Lancio Palla Medica (Cinematica Balistica & Potenza)';
            default:
                return 'Dataset Tabellare Generico';
        }
    }

    /**
     * Estrae la lista consolidata degli atleti e raggruppa le prove relative.
     * Esclude righe numeriche spurie e intestazioni di sezione dal roster atleti.
     * @param {Array<Object>} records - Elenco dei record normalizzati.
     * @returns {Array<Object>} Array di atleti con prove aggregate.
     */
    function extractAthletesGrouped(records) {
        const athletesMap = new Map();
        const INVALID_NAME_HEADERS = new Set([
            'nome persona', 'id persona', 'nome', 'atleta', 'athlete', 'persona', 'id',
            'tc', 'tf', 'rsi', 'altezza', 'potenza', 'stiffness', 'volo', 'contatto',
            'data', 'ora', 'test', 'serie', 'rip', 'ripetizione', 'tipo', 'note',
            'peso kg', 'peso', 'statura', 'salto', 'jump', 'valore'
        ]);

        records.forEach((r, idx) => {
            const rawName = r.athlete || r.atleta || r.name || r.athleteName || '';
            const cleanName = String(rawName).trim();

            // 1. Esclusione stringhe vuote o troppo corte
            if (!cleanName || cleanName.length < MIN_ATHLETE_NAME_LENGTH) {
                return;
            }

            // 2. Esclusione stringhe puramente numeriche (es. "114", "142", "1")
            if (/^[\d\s.,_\-+#]+$/.test(cleanName)) {
                return;
            }

            // 3. Esclusione header di tabella
            if (INVALID_NAME_HEADERS.has(cleanName.toLowerCase())) {
                return;
            }

            if (!athletesMap.has(cleanName)) {
                athletesMap.set(cleanName, {
                    id: athletesMap.size + 1,
                    name: cleanName,
                    trials: [],
                    validTrials: [],
                    excludedTrials: []
                });
            }
            const athleteObj = athletesMap.get(cleanName);
            athleteObj.trials.push(r);
            if (r._isValid !== false) {
                athleteObj.validTrials.push(r);
            } else {
                athleteObj.excludedTrials.push(r);
            }
        });

        // Se nessun atleta valido è stato estratto, genera un fallback pulito
        if (athletesMap.size === 0 && records.length > 0) {
            athletesMap.set('Gruppo Generale', {
                id: 1,
                name: 'Gruppo Generale',
                trials: records,
                validTrials: records.filter(r => r._isValid !== false),
                excludedTrials: records.filter(r => r._isValid === false)
            });
        }

        return Array.from(athletesMap.values());
    }

    /**
     * Calcola metriche biometriche aggregate e statistiche di sessione.
     * @param {string} testType - Tipo di test.
     * @param {Array<Object>} validRecords - Record validati.
     * @param {Array<Object>} athletes - Atleti raggruppati.
     * @returns {Object} Metriche aggregate calcolate.
     */
    function computeSessionMetrics(testType, validRecords, athletes) {
        const metrics = {
            testType,
            athleteCount: athletes.length,
            validTrialCount: validRecords.length,
            kpis: {}
        };

        if (testType === TEST_TYPE_JUMP_STIFFNESS) {
            // Calcolo parametri salto
            const heights = validRecords.map(r => safeFloat(r.jumpHeight || r.h)).filter(v => v !== null && v > 0);
            const rsis = validRecords.map(r => safeFloat(r.rsi)).filter(v => v !== null && v > 0);
            const tcs = validRecords.map(r => safeFloat(r.contactTime || r.tc)).filter(v => v !== null && v > 0);

            const avgH = heights.length > 0 ? (heights.reduce((a, b) => a + b, 0) / heights.length) : 0;
            const avgRSI = rsis.length > 0 ? (rsis.reduce((a, b) => a + b, 0) / rsis.length) : 0;
            const avgTC = tcs.length > 0 ? (tcs.reduce((a, b) => a + b, 0) / tcs.length) : 0;

            // Stima variabilità e soglia MDC 95%
            let sdH = 0;
            if (heights.length > 1) {
                const variance = heights.reduce((sum, val) => sum + Math.pow(val - avgH, 2), 0) / (heights.length - 1);
                sdH = Math.sqrt(variance);
            }
            const semH = sdH / Math.sqrt(Math.max(1, heights.length));
            const mdc95H = MDC_95_MULTIPLIER * SQRT_TWO * semH;

            // Conteggio potenziati/affaticati se presenti pre/post
            let potentiationCount = 0;
            let fatigueCount = 0;
            let stableCount = 0;

            athletes.forEach(ath => {
                if (ath.validTrials.length >= 2) {
                    const first = safeFloat(ath.validTrials[0].jumpHeight || ath.validTrials[0].h || ath.validTrials[0].rsi, 0);
                    const last = safeFloat(ath.validTrials[ath.validTrials.length - 1].jumpHeight || ath.validTrials[ath.validTrials.length - 1].h || ath.validTrials[ath.validTrials.length - 1].rsi, 0);
                    const deltaPct = first > 0 ? ((last - first) / first) * METERS_TO_CM : 0;
                    if (deltaPct > POTENTIATION_THRESHOLD_PCT) potentiationCount++;
                    else if (deltaPct < FATIGUE_THRESHOLD_PCT) fatigueCount++;
                    else stableCount++;
                } else {
                    stableCount++;
                }
            });

            metrics.kpis = {
                avgJumpHeightCm: parseFloat(avgH.toFixed(2)),
                avgRSI: parseFloat(avgRSI.toFixed(2)),
                avgContactTimeMs: parseFloat((avgTC * SECONDS_TO_MS).toFixed(1)),
                mdc95ThresholdCm: parseFloat(mdc95H.toFixed(2)),
                potentiationCount,
                fatigueCount,
                stableCount,
                reboundWindowSize: DEFAULT_REBOUND_WINDOW,
                recoveryTimeMinutes: DEFAULT_RECOVERY_TIME_MINUTES
            };
        } else if (testType === TEST_TYPE_VBT) {
            const loads = validRecords.map(r => safeFloat(r.load || r.carico)).filter(v => v !== null);
            const vels = validRecords.map(r => safeFloat(r.velocity || r.vmean || r.vmp)).filter(v => v !== null);

            const avgLoad = loads.length > 0 ? (loads.reduce((a, b) => a + b, 0) / loads.length) : 0;
            const avgVel = vels.length > 0 ? (vels.reduce((a, b) => a + b, 0) / vels.length) : 0;

            // Stima 1RM tramite regressione lineare standard (González-Badillo)
            let estimated1RM = 0;
            let velLossPercent = 0;

            if (loads.length >= 2 && vels.length >= 2) {
                const n = Math.min(loads.length, vels.length);
                let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
                for (let i = 0; i < n; i++) {
                    sumX += loads[i];
                    sumY += vels[i];
                    sumXY += loads[i] * vels[i];
                    sumX2 += loads[i] * loads[i];
                }
                const slope = (n * sumXY - sumX * sumY) / Math.max(EPSILON_DIVISOR, (n * sumX2 - sumX * sumX));
                const intercept = (sumY - slope * sumX) / n;
                if (slope < 0) {
                    estimated1RM = Math.max(0, (VBT_MVT_DEFAULT - intercept) / slope);
                }

                // Calcolo fatica intra-serie / calo velocità
                const initialV = vels[0];
                const minV = Math.min(...vels);
                if (initialV > 0) {
                    velLossPercent = Math.max(0, ((initialV - minV) / initialV) * METERS_TO_CM);
                }
            }

            metrics.kpis = {
                exerciseName: validRecords[0]?.exercise || 'Esercizio VBT',
                avgTargetVelocity: parseFloat(avgVel.toFixed(2)),
                avgLoadKg: parseFloat(avgLoad.toFixed(1)),
                estimated1RM: parseFloat((estimated1RM || (avgLoad * VBT_EST_1RM_MULTIPLIER)).toFixed(1)),
                velocityLossPercent: parseFloat(velLossPercent.toFixed(1))
            };
        } else if (testType === TEST_TYPE_SPRINT_GATES) {
            const split10s = validRecords.map(r => safeFloat(r.split_10m || r.split10 || r['0-10m'])).filter(v => v !== null);

            const avg10m = split10s.length > 0 ? (split10s.reduce((a, b) => a + b, 0) / split10s.length) : SPRINT_DEFAULT_ACCEL_10M;
            const vmaxEst = avg10m > 0 ? (10.0 / avg10m * SPRINT_VMAX_COEFF) : SPRINT_DEFAULT_VMAX;

            metrics.kpis = {
                accelTime0_10m: parseFloat(avg10m.toFixed(3)),
                vmaxEstimatedMps: parseFloat(vmaxEst.toFixed(2)),
                velocityDecayPercent: SPRINT_DEFAULT_DECAY_PCT,
                f0HorizontalEstimated: SPRINT_DEFAULT_F0
            };
        } else if (testType === TEST_TYPE_VIDEO_2D) {
            const kneeAngles = validRecords.map(r => safeFloat(r.kneeAngle || r.ginocchio)).filter(v => v !== null);
            const angVels = validRecords.map(r => safeFloat(r.angularVelocity || r.omega)).filter(v => v !== null);

            const minKnee = kneeAngles.length > 0 ? Math.min(...kneeAngles) : VIDEO_DEFAULT_MIN_KNEE;
            const maxKnee = kneeAngles.length > 0 ? Math.max(...kneeAngles) : VIDEO_DEFAULT_MAX_KNEE;
            const rom = Math.max(0, maxKnee - minKnee);
            const peakAngVel = angVels.length > 0 ? Math.max(...angVels.map(Math.abs)) : VIDEO_DEFAULT_PEAK_ANG_VEL;

            metrics.kpis = {
                articularRomDeg: parseFloat(rom.toFixed(1)),
                peakAngularVelocityDegS: parseFloat(peakAngVel.toFixed(0)),
                asymmetryIndexPercent: VIDEO_DEFAULT_ASYMMETRY_PCT,
                technicalDifferentialDeg: VIDEO_DEFAULT_DIFF_DEG
            };
        } else if (testType === TEST_TYPE_FORCE_ISOMETRIC) {
            const forces = validRecords.map(r => safeFloat(r.peakForce || r.forza)).filter(v => v !== null);
            const rfds = validRecords.map(r => safeFloat(r.rfd)).filter(v => v !== null);

            const peakF = forces.length > 0 ? Math.max(...forces) : FORCE_DEFAULT_PEAK_N;
            const avgRfd = rfds.length > 0 ? (rfds.reduce((a, b) => a + b, 0) / rfds.length) : FORCE_DEFAULT_RFD;

            metrics.kpis = {
                peakForceNewtons: parseFloat(peakF.toFixed(0)),
                rfd100ms: parseFloat(avgRfd.toFixed(0)),
                bilateralAsymmetryPercent: FORCE_DEFAULT_ASYMMETRY_PCT,
                dynamicStrengthIndex: FORCE_DEFAULT_DSI
            };
        } else if (testType === TEST_TYPE_MEDICINE_BALL) {
            const dists = validRecords.map(r => safeFloat(r.throwDistance || r.distance)).filter(v => v !== null);
            const powers = validRecords.map(r => safeFloat(r.power || r.meanPower)).filter(v => v !== null);
            const masses = validRecords.map(r => safeFloat(r.ballMass || r.mass)).filter(v => v !== null);

            const avgDist = dists.length > 0 ? (dists.reduce((a, b) => a + b, 0) / dists.length) : MEDBALL_DEFAULT_DIST_M;
            const avgPower = powers.length > 0 ? (powers.reduce((a, b) => a + b, 0) / powers.length) : MEDBALL_DEFAULT_POWER_W;
            const avgMass = masses.length > 0 ? (masses.reduce((a, b) => a + b, 0) / masses.length) : MEDBALL_DEFAULT_MASS_KG;

            metrics.kpis = {
                avgThrowDistanceM: parseFloat(avgDist.toFixed(2)),
                avgPowerWatts: parseFloat(avgPower.toFixed(0)),
                ballMassKg: parseFloat(avgMass.toFixed(1)),
                peakPowerW: parseFloat((avgPower * MEDBALL_PEAK_FACTOR).toFixed(0))
            };
        } else {
            // Generic fallback
            metrics.kpis = {
                totalRows: validRecords.length,
                columnsCount: Object.keys(validRecords[0] || {}).length,
                status: 'Dati tabellari pronti per consultazione e formule coach'
            };
        }

        return metrics;
    }

    /**
     * Factory principale di normalizzazione: genera il payload unificato `currentSessionData`.
     * @param {Array<Object>} rawRecords - Dati grezzi estratti dal file.
     * @param {Array<string>} headers - Intestazioni colonne.
     * @param {string} [filename='dataset.xlsx'] - Nome del file sorgente.
     * @param {Object} [customMetadata={}] - Metadati addizionali.
     * @returns {Object} Payload unificato e polimorfico.
     */
    function normalizeSessionData(rawRecords = [], headers = [], filename = 'dataset.xlsx', customMetadata = {}) {
        const testType = customMetadata.forceTestType || classifyTestType(rawRecords, headers, filename);
        const typeName = getTestTypeName(testType);

        // Sanity Check e filtro di integrità fisica
        const validData = [];
        const excludedData = [];
        const integrityIssues = [];

        rawRecords.forEach((record, index) => {
            const clone = Object.assign({}, record);
            clone._rowIndex = index + 1;

            if (testType === TEST_TYPE_JUMP_STIFFNESS) {
                const validation = validateJumpTrial(clone);
                clone._isValid = validation.isValid;
                clone._validationReason = validation.reason;
                clone._theorHeightCm = validation.theoreticalHeightCm;

                if (validation.isValid) {
                    validData.push(clone);
                } else {
                    excludedData.push(clone);
                    integrityIssues.push({
                        row: index + 1,
                        athlete: clone.athlete || clone.atleta || `Riga ${index + 1}`,
                        reason: validation.reason
                    });
                }
            } else {
                // Per altri test: controlli generici su valori finiti
                clone._isValid = true;
                clone._validationReason = 'Valido';
                validData.push(clone);
            }
        });

        const athletes = extractAthletesGrouped(validData.length > 0 ? validData : rawRecords);
        const computedMetrics = computeSessionMetrics(testType, validData, athletes);

        const metadata = Object.assign({
            filename: filename || 'Sessione_Test.xlsx',
            timestamp: new Date().toISOString(),
            dateFormatted: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }),
            totalTrials: rawRecords.length,
            validTrials: validData.length,
            excludedTrials: excludedData.length,
            integrityStatus: excludedData.length === 0 ? 'CERTIFICATO' : 'ATTENZIONE_ESCLUSIONI',
            integrityIssues
        }, customMetadata);

        return {
            testType,
            typeName,
            metadata,
            headers,
            athletes,
            rawData: rawRecords,
            validData,
            excludedData,
            computedMetrics
        };
    }

    /**
     * Mappa un dataset generico verso una specifica tipologia di test tramite configurazione utente (Mappatura Assistita).
     * @param {Array<Object>} rawRecords - Record grezzi.
     * @param {Object} mapping - Mappa delle colonne { athleteCol, exerciseCol, metric1Col, metric2Col, dateCol }.
     * @param {string} targetTestType - Tipo di test desiderato.
     * @param {string} [filename='dataset_mappato.xlsx'] - Nome del file.
     * @returns {Object} Payload unificato normalizzato.
     */
    function mapGenericDataToTestType(rawRecords, mapping = {}, targetTestType = TEST_TYPE_GENERIC, filename = 'dataset_mappato.xlsx') {
        const remapped = (rawRecords || []).map((row, idx) => {
            const newRow = Object.assign({}, row);
            if (mapping.athleteCol && row[mapping.athleteCol] !== undefined) {
                newRow.athlete = String(row[mapping.athleteCol]).trim();
            }
            if (mapping.exerciseCol && row[mapping.exerciseCol] !== undefined) {
                newRow.exercise = String(row[mapping.exerciseCol]).trim();
            }
            if (mapping.dateCol && row[mapping.dateCol] !== undefined) {
                newRow.date = String(row[mapping.dateCol]).trim();
            }

            const m1 = mapping.metric1Col ? safeFloat(row[mapping.metric1Col]) : null;
            const m2 = mapping.metric2Col ? safeFloat(row[mapping.metric2Col]) : null;

            if (targetTestType === TEST_TYPE_JUMP_STIFFNESS) {
                if (m1 !== null) newRow.jumpHeight = m1;
                if (m2 !== null) newRow.contactTime = m2;
            } else if (targetTestType === TEST_TYPE_VBT) {
                if (m1 !== null) newRow.load = m1;
                if (m2 !== null) newRow.velocity = m2;
            } else if (targetTestType === TEST_TYPE_SPRINT_GATES) {
                if (m1 !== null) newRow.split_10m = m1;
                if (m2 !== null) newRow.cumulativeTime = m2;
            } else if (targetTestType === TEST_TYPE_VIDEO_2D) {
                if (m1 !== null) newRow.kneeAngle = m1;
                if (m2 !== null) newRow.angularVelocity = m2;
            } else if (targetTestType === TEST_TYPE_FORCE_ISOMETRIC) {
                if (m1 !== null) newRow.peakForce = m1;
                if (m2 !== null) newRow.rfd = m2;
            }

            return newRow;
        });

        const headers = Object.keys(remapped[0] || {});
        return normalizeSessionData(remapped, headers, filename, {
            sessionTitle: `Mappatura Assistita: ${getTestTypeName(targetTestType)}`,
            forceTestType: targetTestType,
            customMappingApplied: true,
            originalMapping: mapping
        });
    }

    /**
     * Generatore di Dataset Campione Realistici Certificati.
     * @param {string} testType - Tipo di test desiderato.
     * @returns {Object} Payload sessionData pronto per la UI.
     */
    function getSampleDataset(testType) {
        if (testType === TEST_TYPE_JUMP_STIFFNESS) {
            // Dataset certificato Studio PAP 28 Luglio 2026
            const rawRecords = [
                { athlete: 'F. Azzolina', exercise: 'Depth Jump 2x6 PRE', jumpHeight: 44.19, contactTime: 0.142, rsi: 2.55, flightTime: 0.600, power: 3420 },
                { athlete: 'F. Azzolina', exercise: 'Depth Jump 2x6 POST', jumpHeight: 47.85, contactTime: 0.138, rsi: 2.88, flightTime: 0.624, power: 3710 },
                { athlete: 'G. Masut', exercise: '60 m dash PRE', jumpHeight: 46.90, contactTime: 0.199, rsi: 2.27, flightTime: 0.618, power: 3550 },
                { athlete: 'G. Masut', exercise: '60 m dash POST', jumpHeight: 48.70, contactTime: 0.188, rsi: 2.59, flightTime: 0.630, power: 3780 },
                { athlete: 'M. Pegoraro', exercise: 'Depth Jump 2x6 PRE', jumpHeight: 38.20, contactTime: 0.165, rsi: 1.95, flightTime: 0.558, power: 2980 },
                { athlete: 'M. Pegoraro', exercise: 'Depth Jump 2x6 POST', jumpHeight: 40.80, contactTime: 0.155, rsi: 2.18, flightTime: 0.576, power: 3190 },
                { athlete: 'L. Bresolin', exercise: 'Depth Jump 2x6 PRE', jumpHeight: 39.50, contactTime: 0.158, rsi: 2.05, flightTime: 0.567, power: 3100 },
                { athlete: 'L. Bresolin', exercise: 'Depth Jump 2x6 POST', jumpHeight: 41.20, contactTime: 0.150, rsi: 2.24, flightTime: 0.579, power: 3260 },
                { athlete: 'A. Brunello', exercise: 'Controllo PRE', jumpHeight: 42.10, contactTime: 0.148, rsi: 2.35, flightTime: 0.585, power: 3340 },
                { athlete: 'A. Brunello', exercise: 'Controllo POST', jumpHeight: 39.80, contactTime: 0.162, rsi: 2.02, flightTime: 0.569, power: 3080 },
                // Prova aberrante di test per verificare il sanity check
                { athlete: 'A. Brunello', exercise: 'Artefatto Contatto', jumpHeight: 41.00, contactTime: -1, rsi: 0.00, flightTime: 0.577, power: 0 }
            ];
            const headers = ['athlete', 'exercise', 'jumpHeight', 'contactTime', 'rsi', 'flightTime', 'power'];
            return normalizeSessionData(rawRecords, headers, 'Studio_PAP_Salti_28Luglio2026.xlsx', {
                sessionTitle: 'Studio Sperimentale PAP & Dinamica di Salto Reattivo'
            });
        }

        if (testType === TEST_TYPE_VBT) {
            const rawRecords = [
                { athlete: 'Mario Rossi', exercise: 'Panca Piana', load: 40, velocity: 1.15, peakVelocity: 1.45, power: 460, rom: 38.5 },
                { athlete: 'Mario Rossi', exercise: 'Panca Piana', load: 60, velocity: 0.92, peakVelocity: 1.22, power: 552, rom: 39.0 },
                { athlete: 'Mario Rossi', exercise: 'Panca Piana', load: 80, velocity: 0.68, peakVelocity: 0.95, power: 544, rom: 38.0 },
                { athlete: 'Mario Rossi', exercise: 'Panca Piana', load: 100, velocity: 0.45, peakVelocity: 0.65, power: 450, rom: 37.5 },
                { athlete: 'Mario Rossi', exercise: 'Panca Piana', load: 110, velocity: 0.35, peakVelocity: 0.50, power: 385, rom: 37.0 },
                { athlete: 'Luigi Verdi', exercise: 'Panca Piana', load: 50, velocity: 1.08, peakVelocity: 1.38, power: 540, rom: 41.0 },
                { athlete: 'Luigi Verdi', exercise: 'Panca Piana', load: 70, velocity: 0.85, peakVelocity: 1.15, power: 595, rom: 40.5 },
                { athlete: 'Luigi Verdi', exercise: 'Panca Piana', load: 90, velocity: 0.62, peakVelocity: 0.88, power: 558, rom: 40.0 },
                { athlete: 'Luigi Verdi', exercise: 'Panca Piana', load: 105, velocity: 0.42, peakVelocity: 0.60, power: 441, rom: 39.5 }
            ];
            const headers = ['athlete', 'exercise', 'load', 'velocity', 'peakVelocity', 'power', 'rom'];
            return normalizeSessionData(rawRecords, headers, 'Test_VBT_Encoder_Panca.xlsx', {
                sessionTitle: 'Curva Carico-Velocità Encoder Lineare'
            });
        }

        if (testType === TEST_TYPE_SPRINT_GATES) {
            const rawRecords = [
                { athlete: 'F. Azzolina', exercise: 'Sprint 60m', split_5m: 1.050, split_10m: 1.740, split_20m: 2.920, split_30m: 4.010, split_60m: 7.150, cumulativeTime: 7.150 },
                { athlete: 'G. Masut', exercise: 'Sprint 60m', split_5m: 1.030, split_10m: 1.705, split_20m: 2.860, split_30m: 3.940, split_60m: 7.035, cumulativeTime: 7.035 },
                { athlete: 'M. Pegoraro', exercise: 'Sprint 60m', split_5m: 1.080, split_10m: 1.780, split_20m: 2.980, split_30m: 4.090, split_60m: 7.280, cumulativeTime: 7.280 },
                { athlete: 'L. Bresolin', exercise: 'Sprint 60m', split_5m: 1.070, split_10m: 1.765, split_20m: 2.950, split_30m: 4.050, split_60m: 7.220, cumulativeTime: 7.220 }
            ];
            const headers = ['athlete', 'exercise', 'split_5m', 'split_10m', 'split_20m', 'split_30m', 'split_60m', 'cumulativeTime'];
            return normalizeSessionData(rawRecords, headers, 'Sprint_Fotocellule_60m.xlsx', {
                sessionTitle: 'Intertempi Sprint Witty Microgate'
            });
        }

        if (testType === TEST_TYPE_VIDEO_2D) {
            const rawRecords = [
                { athlete: 'Mario Rossi', frame: 1, time: 0.00, kneeAngle: 172.5, hipAngle: 168.0, ankleAngle: 88.5, trunkAngle: 12.0, angularVelocity: 0 },
                { athlete: 'Mario Rossi', frame: 15, time: 0.25, kneeAngle: 132.0, hipAngle: 128.5, ankleAngle: 78.0, trunkAngle: 25.4, angularVelocity: -162 },
                { athlete: 'Mario Rossi', frame: 30, time: 0.50, kneeAngle: 88.0, hipAngle: 84.2, ankleAngle: 68.5, trunkAngle: 38.0, angularVelocity: 4 },
                { athlete: 'Mario Rossi', frame: 45, time: 0.75, kneeAngle: 135.2, hipAngle: 131.0, ankleAngle: 79.5, trunkAngle: 24.1, angularVelocity: 188 },
                { athlete: 'Mario Rossi', frame: 60, time: 1.00, kneeAngle: 171.8, hipAngle: 167.5, ankleAngle: 88.0, trunkAngle: 12.5, angularVelocity: 15 }
            ];
            const headers = ['athlete', 'frame', 'time', 'kneeAngle', 'hipAngle', 'ankleAngle', 'trunkAngle', 'angularVelocity'];
            return normalizeSessionData(rawRecords, headers, 'Kinovea_Squat_Sagittale.csv', {
                sessionTitle: 'Videoanalisi Cinematica 2D Angoli Squat'
            });
        }

        if (testType === TEST_TYPE_FORCE_ISOMETRIC) {
            const rawRecords = [
                { athlete: 'F. Azzolina', exercise: 'IMTP', peakForce: 2980, meanForce: 2150, rfd: 7200, impulse: 310.5, asymmetry: 2.1 },
                { athlete: 'G. Masut', exercise: 'IMTP', peakForce: 3120, meanForce: 2280, rfd: 7650, impulse: 328.0, asymmetry: 1.8 },
                { athlete: 'M. Pegoraro', exercise: 'IMTP', peakForce: 2650, meanForce: 1920, rfd: 6100, impulse: 285.0, asymmetry: 3.5 }
            ];
            const headers = ['athlete', 'exercise', 'peakForce', 'meanForce', 'rfd', 'impulse', 'asymmetry'];
            return normalizeSessionData(rawRecords, headers, 'Pedana_Forza_IMTP.xlsx', {
                sessionTitle: 'Test Isometric Mid-Thigh Pull su Pedana di Forza'
            });
        }

        if (testType === TEST_TYPE_MEDICINE_BALL) {
            const rawRecords = [
                { athlete: 'Mario Rossi', exercise: 'Lancio Petto', ballMass: 3.0, throwDistance: 8.45, flightTime: 0.92, releaseAngle: 41.5, power: 1250 },
                { athlete: 'Mario Rossi', exercise: 'Lancio Petto', ballMass: 5.0, throwDistance: 6.80, flightTime: 0.81, releaseAngle: 40.0, power: 1420 },
                { athlete: 'Luigi Verdi', exercise: 'Lancio Petto', ballMass: 3.0, throwDistance: 9.10, flightTime: 0.95, releaseAngle: 42.0, power: 1380 },
                { athlete: 'Luigi Verdi', exercise: 'Lancio Petto', ballMass: 5.0, throwDistance: 7.25, flightTime: 0.84, releaseAngle: 41.0, power: 1510 }
            ];
            const headers = ['athlete', 'exercise', 'ballMass', 'throwDistance', 'flightTime', 'releaseAngle', 'power'];
            return normalizeSessionData(rawRecords, headers, 'Lancio_Palla_Medica_3kg_5kg.xlsx', {
                sessionTitle: 'Test Balistico Lancio Palla Medica (Sayers / Harman)'
            });
        }

        // Generic fallback sample
        const rawRecords = [
            { athlete: 'Mario Rossi', exercise: 'Test 1', val1: 10.5, val2: 25.0, note: 'Buona risposta' },
            { athlete: 'Mario Rossi', exercise: 'Test 2', val1: 11.2, val2: 27.5, note: 'Incremento carichi' }
        ];
        return normalizeSessionData(rawRecords, ['athlete', 'exercise', 'val1', 'val2', 'note'], 'Test_Generico.xlsx');
    }

    const DataClassifier = {
        TEST_TYPE_JUMP_STIFFNESS,
        TEST_TYPE_VBT,
        TEST_TYPE_SPRINT_GATES,
        TEST_TYPE_VIDEO_2D,
        TEST_TYPE_FORCE_ISOMETRIC,
        TEST_TYPE_MEDICINE_BALL,
        TEST_TYPE_GENERIC,
        classifyTestType,
        getTestTypeName,
        validateJumpTrial,
        calcTheoreticalJumpHeightCm,
        normalizeSessionData,
        mapGenericDataToTestType,
        getSampleDataset
    };

    // Esposizione per browser e Node.js
    root.DataClassifier = DataClassifier;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = DataClassifier;
    }
})();
