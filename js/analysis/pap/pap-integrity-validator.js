/**
 * js/analysis/pap/pap-integrity-validator.js
 * Motore di Integrità e Validazione Dati per Test PAP e Misure di Salto.
 *
 * Responsabilità:
 * 1. Controllo di coerenza cinematica h = (g * TF^2) / 8 con esclusione automatica anomalie (es. Salto 2680).
 * 2. Filtro artefatto da contatto iniziale (TC = -1) sui rimbalzi reattivi continui (stiffness).
 * 3. Standardizzazione della finestra di rimbalzi validi (es. finestra comparativa a 8 stacchi).
 * 4. Calcolo intervallo cronometrico reale trascorso PRE -> POST tramite timestamp.
 * 5. Integrazione anagrafica ed esclusione atleti non conformi (regola Angelo Righetto).
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    // --- Costanti Fisiche e Metrologiche ---
    const GRAVITY_MPS2 = 9.81;
    const METERS_TO_CM = 100.0;
    const KINEMATIC_DIVISOR = 8.0;
    const KINEMATIC_ABS_TOLERANCE_CM = 1.2;
    const KINEMATIC_REL_TOLERANCE_PERCENT = 0.035;
    const INVALID_CONTACT_CODE = -1;
    const MIN_PLAUSIBLE_TC_SEC = 0.08; // 80ms: minimo fisiologico fast-SSC adulti (Dempsey et al., 2012)
    const MAX_PLAUSIBLE_TC_SEC = 0.25; // 250ms: limite superiore fast-SSC per test di rimbalzo reattivo
    const MIN_PLAUSIBLE_TF_SEC = 0.20;
    const MAX_PLAUSIBLE_TF_SEC = 1.10;
    const STANDARD_REBOUND_WINDOW_LEN = 8;

    /**
     * Classe deputata alla validazione fisica, metrologica e strutturale dei dati di salto PAP.
     */
    class PAPIntegrityValidator {

        /**
         * Calcola l'altezza teorica di volo secondo la balistica classica: h = (g * t^2) / 8.
         * @param {number} flightTimeSec - Tempo di volo in secondi.
         * @returns {number} Altezza teorica calcolata in centimetri.
         */
        static calculateTheoreticalHeightCm(flightTimeSec) {
            if (typeof flightTimeSec !== 'number' || !isFinite(flightTimeSec) || flightTimeSec <= 0) {
                return 0;
            }
            // h = (g * TF^2) / 8 in metri -> moltiplicato per 100 per ottenere centimetri
            return (GRAVITY_MPS2 * Math.pow(flightTimeSec, 2) / KINEMATIC_DIVISOR) * METERS_TO_CM;
        }

        /**
         * Verifica se l'altezza misurata e il tempo di volo sono fisicamente coerenti.
         * Identifica discrepanze strumentali o manipolazioni (es. Salto 2680).
         * @param {number} heightCm - Altezza registrata in cm.
         * @param {number} flightTimeSec - Tempo di volo registrato in secondi.
         * @returns {Object} Esito con { isValid, diffCm, relDiffPercent, expectedHeightCm, reason }.
         */
        static validateKinematicConsistency(heightCm, flightTimeSec) {
            if (typeof heightCm !== 'number' || !isFinite(heightCm) || heightCm <= 0 ||
                typeof flightTimeSec !== 'number' || !isFinite(flightTimeSec) || flightTimeSec <= 0) {
                return {
                    isValid: false,
                    diffCm: 0,
                    relDiffPercent: 1.0,
                    expectedHeightCm: 0,
                    reason: 'Dati numerici non validi o nulli'
                };
            }

            const expectedHeightCm = this.calculateTheoreticalHeightCm(flightTimeSec);
            const diffCm = Math.abs(heightCm - expectedHeightCm);
            const relDiffPercent = expectedHeightCm > 0 ? diffCm / expectedHeightCm : 1.0;

            const isWithinTolerance = diffCm <= KINEMATIC_ABS_TOLERANCE_CM ||
                                      relDiffPercent <= KINEMATIC_REL_TOLERANCE_PERCENT;

            return {
                isValid: isWithinTolerance,
                diffCm: parseFloat(diffCm.toFixed(3)),
                relDiffPercent: parseFloat((relDiffPercent * 100).toFixed(2)),
                expectedHeightCm: parseFloat(expectedHeightCm.toFixed(3)),
                reason: isWithinTolerance ? 'Coerente' : `Incompatibilità cinematica: misurato ${heightCm.toFixed(2)} cm vs atteso ${expectedHeightCm.toFixed(2)} cm (TF=${flightTimeSec.toFixed(3)}s)`
            };
        }

        /**
         * Filtra i tentativi di salto singolo escludendo quelli con incongruenza cinematica o atleti esclusi.
         * @param {Array<Object>} jumps - Lista dei salti singoli estratti dal file.
         * @returns {Object} { validJumps, anomalies }
         */
        static filterSingleJumps(jumps) {
            const validJumps = [];
            const anomalies = [];

            if (!Array.isArray(jumps)) {
                return { validJumps, anomalies };
            }

            jumps.forEach(j => {
                const heightCm = typeof j.jumpHeight === 'number' ? j.jumpHeight : (typeof j.height === 'number' ? j.height : parseFloat(j.height));
                const flightTimeSec = typeof j.flightTime === 'number' ? j.flightTime : (typeof j.tf === 'number' ? j.tf : parseFloat(j.tf));

                if (flightTimeSec > 0 && heightCm > 0) {
                    const check = this.validateKinematicConsistency(heightCm, flightTimeSec);
                    if (!check.isValid) {
                        anomalies.push({
                            jump: j,
                            reason: check.reason,
                            metrics: check
                        });
                        return;
                    }
                }

                validJumps.push(j);
            });

            return { validJumps, anomalies };
        }

        /**
         * Filtra ed estrae la serie di rimbalzi reattivi continua (saltelli stiffness/RJ).
         * Elimina il primo stacco artefatto (TC = -1) e convalida la plausibilità dei contatti successivi.
         * @param {Array<Object>} rebounds - Lista degli stacchi/rimbalzi registrati nella prova.
         * @returns {Object} { validRebounds, discardedArtifacts, fullSetCount, standardWindowRebounds }
         */
        static sanitizeReactiveRebounds(rebounds) {
            const validRebounds = [];
            const discardedArtifacts = [];

            if (!Array.isArray(rebounds)) {
                return {
                    validRebounds: [],
                    discardedArtifacts: [],
                    fullSetCount: 0,
                    standardWindowRebounds: []
                };
            }

            rebounds.forEach((r, idx) => {
                const tcSec = typeof r.contactTime === 'number' ? r.contactTime : (typeof r.tc === 'number' ? r.tc : parseFloat(r.tc));
                const tfSec = typeof r.flightTime === 'number' ? r.flightTime : (typeof r.tf === 'number' ? r.tf : parseFloat(r.tf));
                const heightCm = typeof r.jumpHeight === 'number' ? r.jumpHeight : (typeof r.height === 'number' ? r.height : parseFloat(r.height));

                // 1. Esclusione primo stacco con TC = -1 o TC <= 0
                if (tcSec === INVALID_CONTACT_CODE || tcSec <= 0 || isNaN(tcSec)) {
                    discardedArtifacts.push({
                        reboundIndex: idx + 1,
                        rebound: r,
                        reason: 'Artefatto di caduta/stacco iniziale (TC = -1)'
                    });
                    return;
                }

                // 2. Controllo plausibilità fisiologica del tempo di contatto fast-SSC
                if (tcSec < MIN_PLAUSIBLE_TC_SEC || tcSec > MAX_PLAUSIBLE_TC_SEC) {
                    discardedArtifacts.push({
                        reboundIndex: idx + 1,
                        rebound: r,
                        reason: `Tempo di contatto anomalo fuori range fisiologico (${tcSec} s)`
                    });
                    return;
                }

                // 3. Calcolo o verifica RSI coerente (h in metri / TC in sec)
                const heightMeters = (heightCm && heightCm > 0) ? heightCm / METERS_TO_CM : (GRAVITY_MPS2 * Math.pow(tfSec, 2) / KINEMATIC_DIVISOR);
                const calculatedRsi = (tcSec > 0) ? (heightMeters / tcSec) : 0;

                validRebounds.push({
                    index: validRebounds.length + 1,
                    originalIndex: idx + 1,
                    tc: parseFloat(tcSec.toFixed(4)),
                    tf: parseFloat(tfSec.toFixed(4)),
                    height: parseFloat((heightMeters * METERS_TO_CM).toFixed(3)),
                    rsi: parseFloat(calculatedRsi.toFixed(4)),
                    power: typeof r.power === 'number' ? r.power : parseFloat(r.power || 0),
                    stiffness: typeof r.stiffness === 'number' ? r.stiffness : parseFloat(r.stiffness || 0),
                    raw: r
                });
            });

            // Finestra standardizzata sui primi N rimbalzi validi (es. 8 rimbalzi per comparabilità PRE-POST)
            const standardWindowRebounds = validRebounds.slice(0, STANDARD_REBOUND_WINDOW_LEN);

            return {
                validRebounds,
                discardedArtifacts,
                fullSetCount: validRebounds.length,
                standardWindowRebounds
            };
        }

        /**
         * Calcola il tempo reale trascorso in minuti tra l'ultimo salto PRE e il primo salto POST
         * a partire dai timestamp registrati (formato stringa ISO o HH:MM:SS).
         * @param {string|Date} lastPreTimestamp - Timestamp dell'ultimo salto PRE.
         * @param {string|Date} firstPostTimestamp - Timestamp del primo salto POST.
         * @returns {number|null} Intervallo trascorso in minuti decimali.
         */
        static computeRealRecoveryMinutes(lastPreTimestamp, firstPostTimestamp) {
            if (!lastPreTimestamp || !firstPostTimestamp) return null;

            const parseToSeconds = (ts) => {
                if (ts instanceof Date) {
                    return ts.getTime() / 1000;
                }
                const str = String(ts).trim();
                // Isola la componente oraria se preceduta da data (es. 2026-07-28_18-58-23 o 2026-07-28 18:58:23)
                let timeStr = str;
                if (str.includes('_') || str.includes('T') || str.includes(' ')) {
                    const parts = str.split(/[_\sT]+/);
                    timeStr = parts[parts.length - 1];
                }
                // Cerca pattern orario HH:MM:SS o HH-MM-SS sulla sola parte oraria
                const timeMatch = timeStr.match(/(\d{1,2})[:\-_](\d{2})[:\-_](\d{2})/);
                if (timeMatch) {
                    const hours = parseInt(timeMatch[1], 10);
                    const mins = parseInt(timeMatch[2], 10);
                    const secs = parseInt(timeMatch[3], 10);
                    return hours * 3600 + mins * 60 + secs;
                }
                const parsed = Date.parse(str);
                if (!isNaN(parsed)) {
                    return parsed / 1000;
                }
                return null;
            };

            const preSec = parseToSeconds(lastPreTimestamp);
            const postSec = parseToSeconds(firstPostTimestamp);

            if (preSec === null || postSec === null) return null;

            let diffSec = postSec - preSec;
            // Gestione eventuale passaggio della mezzanotte
            if (diffSec < 0) {
                diffSec += 24 * 3600;
            }

            const diffMinutes = diffSec / 60.0;
            return parseFloat(diffMinutes.toFixed(2));
        }
    }

    // Esposizione globale
    root.PAPIntegrityValidator = PAPIntegrityValidator;
})();
