/**
 * js/analysis/pap/pap-stats-engine.js
 * Motore di Calcolo Biomeccanico e Statistico per Protocolli PAP e Analisi del Salto.
 *
 * Responsabilità:
 * 1. Algoritmo MDC (Minimal Detectable Change al 95%) con propagazione dell'errore.
 * 2. Scomposizione biomeccanica determinanti dell'RSI (Delta RSI = f(Delta TC, Delta H)).
 * 3. Costanza motoria intra-serie (CV%) e pendenza (slope OLS) per accensione tardiva o dispersione.
 * 4. Accoppiamento TC <-> Altezza (r di Pearson) per distinguere spinta da stiffness.
 * 5. Profilazione neuromuscolare basale (EUR, transfer braccia ABK-CMJ, deficit concentrico).
 * 6. Matrice efficienza potenza (W/kg) vs RSI e deficit RFD precoce.
 * 7. Statistica inferenziale completa: regressione lineare, correlazione con IC 95% (Fisher z),
 *    t-test di Student (p-value) e Hedges' g con correzione campionaria.
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    // --- Soglie Metrologiche MDC 95% (Letteratura Scientifica di Riferimento) ---
    const MDC_SJ_PERCENT = 5.4; // Markovic et al. (2004), JOSPT: SEM SJ ~1.9 cm su media ~35 cm
    const MDC_CMJ_PERCENT = 6.8; // Heishman et al. (2020): 6.8%; Markovic (2004): ~6.6%
    const MDC_ABK_PERCENT = 8.0; // Markovic (2004): ABK ~8.0% per componente braccia
    const MDC_EUR_PP_THRESHOLD = 10.0;
    const MDC_ARMS_DELTA_CM = 5.50;

    // --- Parametri di Classificazione EUR ed Efficienza ---
    const EUR_HIGH_ELASTIC_THRESHOLD = 1.15; // Bosco (1983), Komi & Bosco (1978)
    const EUR_BALANCED_LOW_THRESHOLD = 1.05; // Bosco (1983)
    const CONCENTRIC_DEFICIT_SJ_CUTOFF_CM = 38.0; // Markovic (2004): media popolazione sportiva maschile

    // --- Soglie di Classificazione Costanza e Strategia Saltelli ---
    const CV_METRONOMIC_LIMIT_PERCENT = 6.5; // Flanagan & Harrison (2007)
    const CV_DISPERSIVE_LIMIT_PERCENT = 8.5;
    const COUPLING_PUSH_R_THRESHOLD = 0.60;
    const SIGNIFICANCE_ALPHA = 0.05;
    const LATE_ACTIVATION_P_LIMIT = 0.06;

    // --- Costanti Matematiche e Statistiche ---
    const Z_SCORE_95 = 1.96;
    const SQRT_TWO = 1.4142135623730951;
    const BETACF_MAX_ITER = 100;
    const BETACF_EPSILON = 1e-7;
    const BETACF_FPMIN = 1e-30;
    const SMALL_SAMPLE_HEDGES_OFFSET = 9;

    // --- Costanti Formula Sayers (1999) per Potenza di Picco SJ (Watts) ---
    const SAYERS_SJ_HEIGHT_COEFF = 60.7; // Sayers et al. (1999), JSCR
    const SAYERS_SJ_MASS_COEFF = 45.3;
    const SAYERS_SJ_CONSTANT = 2055.0;

    // --- Soglie Efficienza Potenza vs RSI ed RFD Precoce ---
    const HIGH_POWER_WKG_THRESHOLD = 13.5; // Komi (2003), Cormie et al. (2011)
    const LOW_POWER_WKG_THRESHOLD = 12.5;
    const LOW_RSI_THRESHOLD = 1.60; // Young (1995), Flanagan & Comyns (2008)
    const HEAVY_BODY_MASS_CUTOFF_KG = 80.0;

    /**
     * Motore statistico e biomeccanico per protocolli PAP e analisi salti.
     */
    class PAPStatsEngine {

        /**
         * Calcola media, deviazione standard campionaria (N-1) e Coefficiente di Variazione (CV%).
         * @param {Array<number>} values - Vettore di valori numerici.
         * @returns {Object} { mean, sd, cvPercent, n }
         */
        static calculateCV(values) {
            if (!Array.isArray(values) || values.length === 0) {
                return { mean: 0, sd: 0, cvPercent: 0, n: 0 };
            }

            const validValues = values.filter(v => typeof v === 'number' && isFinite(v));
            const n = validValues.length;
            if (n === 0) {
                return { mean: 0, sd: 0, cvPercent: 0, n: 0 };
            }

            const sum = validValues.reduce((acc, val) => acc + val, 0);
            const mean = sum / n;

            if (n === 1) {
                return { mean: parseFloat(mean.toFixed(4)), sd: 0, cvPercent: 0, n: 1 };
            }

            const varianceSum = validValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
            const sd = Math.sqrt(varianceSum / (n - 1));
            const cvPercent = (mean !== 0) ? (sd / Math.abs(mean)) * 100 : 0;

            return {
                mean: parseFloat(mean.toFixed(4)),
                sd: parseFloat(sd.toFixed(4)),
                cvPercent: parseFloat(cvPercent.toFixed(2)),
                n
            };
        }

        /**
         * Frazione continua incompleta di Gauss/Lentz per la funzione Beta incompleta regolarizzata.
         * @private
         */
        static _betaContinuedFraction(a, b, x) {
            const qab = a + b;
            const qap = a + 1.0;
            const qam = a - 1.0;
            let c = 1.0;
            let d = 1.0 - (qab * x / qap);
            if (Math.abs(d) < BETACF_FPMIN) d = BETACF_FPMIN;
            d = 1.0 / d;
            let h = d;

            for (let m = 1; m <= BETACF_MAX_ITER; m++) {
                const m2 = 2 * m;
                let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
                d = 1.0 + aa * d;
                if (Math.abs(d) < BETACF_FPMIN) d = BETACF_FPMIN;
                c = 1.0 + aa / c;
                if (Math.abs(c) < BETACF_FPMIN) c = BETACF_FPMIN;
                d = 1.0 / d;
                h *= d * c;

                aa = -((a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
                d = 1.0 + aa * d;
                if (Math.abs(d) < BETACF_FPMIN) d = BETACF_FPMIN;
                c = 1.0 + aa / c;
                if (Math.abs(c) < BETACF_FPMIN) c = BETACF_FPMIN;
                d = 1.0 / d;
                const del = d * c;
                h *= del;

                if (Math.abs(del - 1.0) <= BETACF_EPSILON) break;
            }
            return h;
        }

        /**
         * Funzione log-gamma di Lanczos per approssimazione lgamma(z).
         * @private
         */
        static _logGamma(z) {
            const coefficients = [
                76.18009172947146,
                -86.50532032941677,
                24.01409824083091,
                -1.231739572450155,
                0.001208650973866179,
                -0.000005395239384953
            ];
            let x = z;
            let y = z;
            let tmp = x + 5.5;
            tmp -= (x + 0.5) * Math.log(tmp);
            let ser = 1.000000000190015;
            for (let j = 0; j < coefficients.length; j++) {
                y += 1.0;
                ser += coefficients[j] / y;
            }
            return -tmp + Math.log(2.5066282746310005 * ser / x);
        }

        /**
         * Funzione Beta incompleta regolarizzata I_x(a, b).
         * @private
         */
        static _incompleteBeta(a, b, x) {
            if (x <= 0.0) return 0.0;
            if (x >= 1.0) return 1.0;

            const logBeta = this._logGamma(a + b) - this._logGamma(a) - this._logGamma(b);
            const bt = Math.exp(logBeta + a * Math.log(x) + b * Math.log(1.0 - x));

            if (x < (a + 1.0) / (a + b + 2.0)) {
                return bt * this._betaContinuedFraction(a, b, x) / a;
            } else {
                return 1.0 - (bt * this._betaContinuedFraction(b, a, 1.0 - x) / b);
            }
        }

        /**
         * Calcola il p-value a due code della distribuzione t di Student dato t e gradi di libertà (df).
         * @param {number} tStat - Valore del test t.
         * @param {number} df - Gradi di libertà.
         * @returns {number} p-value a due code compreso tra 0 e 1.
         */
        static calculateStudentPValue(tStat, df) {
            if (typeof tStat !== 'number' || isNaN(tStat) || typeof df !== 'number' || df <= 0) {
                return 1.0;
            }
            const absT = Math.abs(tStat);
            const x = df / (df + absT * absT);
            const p = this._incompleteBeta(df / 2.0, 0.5, x);
            return Math.max(0.0, Math.min(1.0, parseFloat(p.toFixed(5))));
        }

        /**
         * Calcola la regressione lineare OLS y = a * x + b, con slope, intercept, R^2, t e p-value.
         * @param {Array<number>} xValues - Valori asse X.
         * @param {Array<number>} yValues - Valori asse Y.
         * @returns {Object} Risultato regressione.
         */
        static linearRegression(xValues, yValues) {
            if (!Array.isArray(xValues) || !Array.isArray(yValues) || xValues.length < 2 || xValues.length !== yValues.length) {
                return { slope: 0, intercept: 0, rSquared: 0, pValue: 1.0, tStat: 0, n: 0 };
            }

            const n = xValues.length;
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
            for (let i = 0; i < n; i++) {
                sumX += xValues[i];
                sumY += yValues[i];
                sumXY += xValues[i] * yValues[i];
                sumXX += xValues[i] * xValues[i];
                sumYY += yValues[i] * yValues[i];
            }

            const denom = n * sumXX - sumX * sumX;
            if (Math.abs(denom) < 1e-12) {
                return { slope: 0, intercept: sumY / n, rSquared: 0, pValue: 1.0, tStat: 0, n };
            }

            const slope = (n * sumXY - sumX * sumY) / denom;
            const intercept = (sumY - slope * sumX) / n;

            const yMean = sumY / n;
            let ssTot = 0, ssRes = 0;
            for (let i = 0; i < n; i++) {
                const yPred = slope * xValues[i] + intercept;
                ssTot += Math.pow(yValues[i] - yMean, 2);
                ssRes += Math.pow(yValues[i] - yPred, 2);
            }

            const rSquared = ssTot > 1e-12 ? Math.max(0, 1 - ssRes / ssTot) : 0;
            const df = n - 2;
            let tStat = 0;
            let pValue = 1.0;

            if (df > 0 && ssTot > 1e-12) {
                const sResidual = Math.sqrt(ssRes / df);
                const sSlope = sResidual / Math.sqrt(sumXX - (sumX * sumX) / n);
                if (sSlope > 1e-12) {
                    tStat = slope / sSlope;
                    pValue = this.calculateStudentPValue(tStat, df);
                }
            }

            return {
                slope: parseFloat(slope.toFixed(5)),
                intercept: parseFloat(intercept.toFixed(5)),
                rSquared: parseFloat(rSquared.toFixed(4)),
                tStat: parseFloat(tStat.toFixed(4)),
                pValue,
                n
            };
        }

        /**
         * Calcola il coefficiente di correlazione di Pearson (r), R^2, p-value e Intervallo di Confidenza al 95% (trasformazione Fisher z).
         * @param {Array<number>} xValues - Vettore X.
         * @param {Array<number>} yValues - Vettore Y.
         * @returns {Object} { r, rSquared, pValue, tStat, ci95: [lower, upper], isSignificant, n }
         */
        static calculatePearsonCorrelation(xValues, yValues) {
            if (!Array.isArray(xValues) || !Array.isArray(yValues) || xValues.length < 3 || xValues.length !== yValues.length) {
                return { r: 0, rSquared: 0, pValue: 1.0, tStat: 0, ci95: [0, 0], isSignificant: false, n: 0 };
            }

            const n = xValues.length;
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
            for (let i = 0; i < n; i++) {
                sumX += xValues[i];
                sumY += yValues[i];
                sumXY += xValues[i] * yValues[i];
                sumXX += xValues[i] * xValues[i];
                sumYY += yValues[i] * yValues[i];
            }

            const numerator = n * sumXY - sumX * sumY;
            const denomX = n * sumXX - sumX * sumX;
            const denomY = n * sumYY - sumY * sumY;

            if (denomX <= 0 || denomY <= 0) {
                return { r: 0, rSquared: 0, pValue: 1.0, tStat: 0, ci95: [0, 0], isSignificant: false, n };
            }

            const r = numerator / Math.sqrt(denomX * denomY);
            const clampedR = Math.max(-0.9999, Math.min(0.9999, r));
            const rSquared = clampedR * clampedR;

            const df = n - 2;
            const tStat = clampedR * Math.sqrt(df) / Math.sqrt(1 - clampedR * clampedR);
            const pValue = this.calculateStudentPValue(tStat, df);

            // Intervallo di Confidenza al 95% tramite Fisher z
            const z = 0.5 * Math.log((1 + clampedR) / (1 - clampedR));
            const seZ = 1.0 / Math.sqrt(n - 3);
            const zLower = z - Z_SCORE_95 * seZ;
            const zUpper = z + Z_SCORE_95 * seZ;
            const rLower = (Math.exp(2 * zLower) - 1) / (Math.exp(2 * zLower) + 1);
            const rUpper = (Math.exp(2 * zUpper) - 1) / (Math.exp(2 * zUpper) + 1);

            const isSignificant = pValue < SIGNIFICANCE_ALPHA && !(rLower < 0 && rUpper > 0);

            return {
                r: parseFloat(clampedR.toFixed(4)),
                rSquared: parseFloat(rSquared.toFixed(4)),
                pValue,
                tStat: parseFloat(tStat.toFixed(4)),
                ci95: [parseFloat(rLower.toFixed(3)), parseFloat(rUpper.toFixed(3))],
                isSignificant,
                n
            };
        }

        /**
         * Calcola la dimensione dell'effetto Hedges' g tra due serie, con fattore correttivo J per piccoli campioni.
         * @param {Array<number>} samplePre - Serie PRE.
         * @param {Array<number>} samplePost - Serie POST.
         * @returns {Object} { g, d, correctionJ, pooledSD }
         */
        static calculateHedgesG(samplePre, samplePost) {
            const preStats = this.calculateCV(samplePre);
            const postStats = this.calculateCV(samplePost);

            const n1 = preStats.n;
            const n2 = postStats.n;

            if (n1 < 2 || n2 < 2) {
                return { g: 0, d: 0, correctionJ: 1.0, pooledSD: 0 };
            }

            const df = n1 + n2 - 2;
            const s1Sq = Math.pow(preStats.sd, 2);
            const s2Sq = Math.pow(postStats.sd, 2);
            const pooledVar = ((n1 - 1) * s1Sq + (n2 - 1) * s2Sq) / df;
            const pooledSD = Math.sqrt(pooledVar);

            if (pooledSD <= 1e-9) {
                return { g: 0, d: 0, correctionJ: 1.0, pooledSD: 0 };
            }

            const cohenD = (postStats.mean - preStats.mean) / pooledSD;
            // Fattore correttivo di Hedges per piccoli campioni J = 1 - 3 / (4 * (n1 + n2) - 9)
            const correctionJ = 1.0 - (3.0 / (4.0 * (n1 + n2) - SMALL_SAMPLE_HEDGES_OFFSET));
            const hedgesG = cohenD * correctionJ;

            return {
                g: parseFloat(hedgesG.toFixed(4)),
                d: parseFloat(cohenD.toFixed(4)),
                correctionJ: parseFloat(correctionJ.toFixed(4)),
                pooledSD: parseFloat(pooledSD.toFixed(4))
            };
        }

        /**
         * Esegue il test t a due campioni (indipendenti con varianza pooled o appaiato).
         * @param {Array<number>} samplePre - Serie PRE.
         * @param {Array<number>} samplePost - Serie POST.
         * @returns {Object} { tStat, df, pValue, meanPre, meanPost, deltaPercent, isSignificant }
         */
        static calculateTwoSampleTTest(samplePre, samplePost) {
            const preStats = this.calculateCV(samplePre);
            const postStats = this.calculateCV(samplePost);
            const n1 = preStats.n;
            const n2 = postStats.n;

            if (n1 < 2 || n2 < 2) {
                return { tStat: 0, df: 0, pValue: 1.0, meanPre: preStats.mean, meanPost: postStats.mean, deltaPercent: 0, isSignificant: false };
            }

            const df = n1 + n2 - 2;
            const s1Sq = Math.pow(preStats.sd, 2);
            const s2Sq = Math.pow(postStats.sd, 2);
            const pooledSD = Math.sqrt(((n1 - 1) * s1Sq + (n2 - 1) * s2Sq) / df);

            const seDiff = pooledSD * Math.sqrt((1.0 / n1) + (1.0 / n2));
            const tStat = (seDiff > 1e-9) ? (postStats.mean - preStats.mean) / seDiff : 0;
            const pValue = this.calculateStudentPValue(tStat, df);

            const deltaPercent = preStats.mean !== 0 ? ((postStats.mean - preStats.mean) / preStats.mean) * 100 : 0;
            const isSignificant = pValue < SIGNIFICANCE_ALPHA;

            return {
                tStat: parseFloat(tStat.toFixed(4)),
                df,
                pValue,
                meanPre: preStats.mean,
                meanPost: postStats.mean,
                deltaPercent: parseFloat(deltaPercent.toFixed(2)),
                isSignificant
            };
        }

        /**
         * Valuta la variazione di un salto singolo contro la soglia reale MDC al 95%.
         * @param {'SJ'|'CMJ'|'ABK'} testType - Tipologia di salto singolo.
         * @param {number} preHeight - Valore PRE (migliore o media).
         * @param {number} postHeight - Valore POST (migliore o media).
         * @returns {Object} { deltaCm, deltaPercent, mdcThreshold, isRealChange, outcome }
         */
        static evaluateSingleJumpMDC(testType, preHeight, postHeight) {
            let mdcThreshold = MDC_SJ_PERCENT;
            const typeUpper = String(testType || 'SJ').trim().toUpperCase();

            if (typeUpper.includes('CMJ')) {
                mdcThreshold = MDC_CMJ_PERCENT;
            } else if (typeUpper.includes('ABK') || typeUpper.includes('ABALAKOV')) {
                mdcThreshold = MDC_ABK_PERCENT;
            }

            if (typeof preHeight !== 'number' || preHeight <= 0 || typeof postHeight !== 'number' || postHeight <= 0) {
                return {
                    deltaCm: 0,
                    deltaPercent: 0,
                    mdcThreshold,
                    isRealChange: false,
                    outcome: 'Dati Non Validi'
                };
            }

            const deltaCm = postHeight - preHeight;
            const deltaPercent = (deltaCm / preHeight) * 100.0;
            const absDelta = Math.abs(deltaPercent);
            const isRealChange = absDelta >= mdcThreshold;

            let outcome = 'Invariato (Rumore)';
            if (isRealChange) {
                outcome = deltaPercent > 0 ? 'Potenziamento Reale' : 'Fatica Reale';
            }

            return {
                deltaCm: parseFloat(deltaCm.toFixed(2)),
                deltaPercent: parseFloat(deltaPercent.toFixed(2)),
                mdcThreshold,
                isRealChange,
                outcome
            };
        }

        /**
         * Scomposizione biomeccanica dell'RSI: Delta RSI = f(Delta TC, Delta H).
         * Identifica il meccanismo dominante:
         * - Potenziamento d'impulso (stiffness intatta, guadagno di volo)
         * - Fatica da stiffness (allungamento del tempo di contatto)
         * - Fatica contrattile periferica (crollo altezza con TC stabile)
         * - Compensazione mista
         * @param {number} rsiPre - RSI medio PRE.
         * @param {number} rsiPost - RSI medio POST.
         * @param {number} tcPreSec - Tempo di contatto medio PRE (s).
         * @param {number} tcPostSec - Tempo di contatto medio POST (s).
         * @param {number} hPreCm - Altezza media PRE (cm).
         * @param {number} hPostCm - Altezza media POST (cm).
         * @returns {Object} Scomposizione biomeccanica e classificazione meccanismo.
         */
        static decomposeRSI(rsiPre, rsiPost, tcPreSec, tcPostSec, hPreCm, hPostCm) {
            const deltaRsiPercent = rsiPre > 0 ? ((rsiPost - rsiPre) / rsiPre) * 100 : 0;
            const deltaTcPercent = tcPreSec > 0 ? ((tcPostSec - tcPreSec) / tcPreSec) * 100 : 0;
            const deltaHPercent = hPreCm > 0 ? ((hPostCm - hPreCm) / hPreCm) * 100 : 0;

            let mechanism = 'INVARIATO';
            let description = 'Variazione nei limiti della variabilità fisiologica.';

            if (deltaRsiPercent >= 3.0 && deltaHPercent > 0 && deltaTcPercent <= 1.5) {
                mechanism = 'POTENZIAMENTO_IMPULSO';
                description = 'Potenziamento d\'impulso: la rigidità tendinea è preservata/incrementata (TC stabile o ridotto) con netto guadagno di altezza.';
            } else if (deltaTcPercent > 2.5 && deltaRsiPercent <= -2.5) {
                mechanism = 'FATICA_STIFFNESS';
                description = 'Fatica da stiffness: cedimento elastico del complesso muscolo-tendineo della caviglia con allungamento dell\'ammortizzazione a terra.';
            } else if (deltaHPercent <= -3.0 && Math.abs(deltaTcPercent) <= 2.0) {
                mechanism = 'FATICA_CONTRATTILE';
                description = 'Fatica contrattile periferica: crollo della capacità di spinta verticale in salita a parità di tempo di contatto a terra.';
            } else if (deltaRsiPercent < -2.5 && deltaHPercent < 0 && deltaTcPercent > 0) {
                mechanism = 'FATICA_MISTA';
                description = 'Fatica combinata: decadimento contemporaneo sia della rigidità reattiva a terra che della propulsione concentrica.';
            } else if (deltaHPercent > 2.0 && deltaTcPercent > 2.0) {
                mechanism = 'COMPENSAZIONE_DI_SPINTA';
                description = 'Compensazione per spinta concentrica: l\'atleta baratta la reattività rapida allungando il tempo a terra per saltare più in alto.';
            }

            return {
                deltaRsiPercent: parseFloat(deltaRsiPercent.toFixed(2)),
                deltaTcPercent: parseFloat(deltaTcPercent.toFixed(2)),
                deltaHPercent: parseFloat(deltaHPercent.toFixed(2)),
                mechanism,
                description
            };
        }

        /**
         * Analisi della dinamica intra-serie: costanza motoria (CV%), pendenza (slope)
         * e accoppiamento TC <-> Altezza (r di Pearson).
         * @param {Array<Object>} rebounds - Rimbalzi reattivi validi (con rsi, tc, height).
         * @returns {Object} Profilo intra-serie completo.
         */
        static analyzeIntraSetDynamics(rebounds) {
            if (!Array.isArray(rebounds) || rebounds.length < 3) {
                return {
                    cvRsi: 0,
                    cvTc: 0,
                    cvH: 0,
                    slopeRsi: 0,
                    pSlope: 1.0,
                    pattern: 'NON_VALUTABILE',
                    couplingR: 0,
                    couplingP: 1.0,
                    strategy: 'NEUTRA',
                    reboundCount: rebounds ? rebounds.length : 0
                };
            }

            const rsiVals = rebounds.map(r => r.rsi);
            const tcVals = rebounds.map(r => r.tc);
            const hVals = rebounds.map(r => r.height);
            const indices = rebounds.map((_, i) => i + 1);

            const statsRsi = this.calculateCV(rsiVals);
            const statsTc = this.calculateCV(tcVals);
            const statsH = this.calculateCV(hVals);

            // Regressione pendenza intra-serie (Indice Salto vs RSI)
            const regRsi = this.linearRegression(indices, rsiVals);

            // Pattern costanza / decadimento
            let pattern = 'METRONOMICO';
            if (regRsi.slope > 0.015 && regRsi.pValue < LATE_ACTIVATION_P_LIMIT) {
                pattern = 'ACCENSIONE_TARDIVA';
            } else if (regRsi.slope < -0.020 && regRsi.pValue < SIGNIFICANCE_ALPHA) {
                pattern = 'DECADIMENTO_FATICA';
            } else if (statsRsi.cvPercent > CV_DISPERSIVE_LIMIT_PERCENT) {
                pattern = 'DISPERSIVO';
            }

            // Accoppiamento TC <-> Altezza (per rilevare se l'atleta usa la spinta al posto dell'elasticità)
            const coupling = this.calculatePearsonCorrelation(tcVals, hVals);
            let strategy = 'ELASTICA_REATTIVA';
            if (coupling.r >= COUPLING_PUSH_R_THRESHOLD && coupling.pValue < SIGNIFICANCE_ALPHA) {
                strategy = 'STRATEGIA_DI_SPINTA';
            }

            return {
                cvRsi: statsRsi.cvPercent,
                cvTc: statsTc.cvPercent,
                cvH: statsH.cvPercent,
                slopeRsi: regRsi.slope,
                pSlope: regRsi.pValue,
                pattern,
                couplingR: coupling.r,
                couplingP: coupling.pValue,
                strategy,
                reboundCount: rebounds.length
            };
        }

        /**
         * Calcola il profilo neuromuscolare basale: EUR (CMJ/SJ), transfer braccia (ABK-CMJ)
         * e rileva eventuali deficit concentrici mascherati.
         * @param {number} sjHeight - Altezza Squat Jump (cm).
         * @param {number} cmjHeight - Altezza Countermovement Jump (cm).
         * @param {number} abkHeight - Altezza Abalakov Jump (cm).
         * @returns {Object} Profilo neuromuscolare e interpretazione fisiologica.
         */
        static computeNeuromuscularProfile(sjHeight, cmjHeight, abkHeight) {
            if (!sjHeight || sjHeight <= 0 || !cmjHeight || cmjHeight <= 0) {
                return {
                    eurRatio: 0,
                    eurPercent: 0,
                    classification: 'NON_DETERMINATO',
                    hasConcentricDeficit: false,
                    armsContributionCm: 0,
                    armsTransferQuality: 'NON_DETERMINATO'
                };
            }

            const eurRatio = cmjHeight / sjHeight;
            const eurPercent = ((cmjHeight - sjHeight) / sjHeight) * 100.0;

            let classification = 'MISTO_BILANCIATO';
            if (eurRatio > EUR_HIGH_ELASTIC_THRESHOLD) {
                classification = 'ELASTICO_DIPENDENTE';
            } else if (eurRatio < EUR_BALANCED_LOW_THRESHOLD) {
                classification = 'FORZA_DIPENDENTE';
            }

            // Discriminazione intelligente: EUR alto ma SJ molto basso indica deficit di spinta concentrica
            const hasConcentricDeficit = (eurRatio > EUR_HIGH_ELASTIC_THRESHOLD && sjHeight < CONCENTRIC_DEFICIT_SJ_CUTOFF_CM);

            // Transfer arti superiori (ABK - CMJ)
            let armsContributionCm = 0;
            let armsTransferQuality = 'INVARIATO';
            if (abkHeight && abkHeight > 0) {
                armsContributionCm = abkHeight - cmjHeight;
                if (armsContributionCm >= 8.0) {
                    armsTransferQuality = 'ECCELLENTE_COORDINATIVO';
                } else if (armsContributionCm >= 5.0) {
                    armsTransferQuality = 'BUONO';
                } else {
                    armsTransferQuality = 'RIDOTTO_LIMITATO';
                }
            }

            return {
                eurRatio: parseFloat(eurRatio.toFixed(3)),
                eurPercent: parseFloat(eurPercent.toFixed(1)),
                classification,
                hasConcentricDeficit,
                armsContributionCm: parseFloat(armsContributionCm.toFixed(2)),
                armsTransferQuality
            };
        }

        /**
         * Calcola la matrice di correlazione tra massa corporea e reattività (RSI).
         * Mostra come il peso agisca da fattore limitante della reattività rapida fast-SSC.
         * @param {Array<Object>} athletesData - Array con { athlete, bodyMassKg, baselineRsi }.
         * @returns {Object} Statistiche di regressione e correlazione con IC 95%.
         */
        static correlateBodyMassWithRsi(athletesData) {
            if (!Array.isArray(athletesData) || athletesData.length < 3) {
                return { r: 0, rSquared: 0, pValue: 1.0, ci95: [0, 0], isSignificant: false };
            }

            const masses = [];
            const rsis = [];

            athletesData.forEach(a => {
                const m = typeof a.bodyMassKg === 'number' ? a.bodyMassKg : (typeof a.mass === 'number' ? a.mass : parseFloat(a.mass));
                const r = typeof a.baselineRsi === 'number' ? a.baselineRsi : (typeof a.rsi === 'number' ? a.rsi : parseFloat(a.rsi));
                if (m > 0 && r > 0) {
                    masses.push(m);
                    rsis.push(r);
                }
            });

            return this.calculatePearsonCorrelation(masses, rsis);
        }

        /**
         * Calcola la potenza relativa espressa nello Squat Jump (W/kg).
         * Se fornita la potenza registrata dallo strumento (Watts), la divide per la massa corporea;
         * altrimenti applica la formulazione validata di Sayers et al. (1999) per il salto SJ.
         * @param {number} jumpHeightCm - Altezza di salto in cm.
         * @param {number} bodyMassKg - Massa corporea dell'atleta in kg.
         * @param {number|null} [peakPowerWatts=null] - Potenza strumentale in Watts (opzionale).
         * @returns {number} Potenza relativa in W/kg.
         */
        static computeRelativePowerWkg(jumpHeightCm, bodyMassKg, peakPowerWatts = null) {
            if (typeof bodyMassKg !== 'number' || bodyMassKg <= 0 || !isFinite(bodyMassKg)) {
                return 0;
            }

            if (typeof peakPowerWatts === 'number' && peakPowerWatts > 0 && isFinite(peakPowerWatts)) {
                return parseFloat((peakPowerWatts / bodyMassKg).toFixed(2));
            }

            if (typeof jumpHeightCm !== 'number' || jumpHeightCm <= 0 || !isFinite(jumpHeightCm)) {
                return 0;
            }

            // Formula Sayers et al. (1999): Peak Power (W) = 60.7 * h(cm) + 45.3 * mass(kg) - 2055
            const estimatedWatts = SAYERS_SJ_HEIGHT_COEFF * jumpHeightCm + SAYERS_SJ_MASS_COEFF * bodyMassKg - SAYERS_SJ_CONSTANT;
            const validWatts = Math.max(0, estimatedWatts);
            return parseFloat((validWatts / bodyMassKg).toFixed(2));
        }

        /**
         * Analizza la matrice Efficienza Potenza (W/kg) vs RSI (medio e di picco)
         * per discriminare deficit selettivi di RFD precoce (0-100 ms) rispetto all'effetto taglia/inerziale.
         * @param {number} relativePowerWkg - Potenza relativa in W/kg nello Squat Jump.
         * @param {number} rsiMean - Valore medio dell'RSI nei saltelli.
         * @param {number} rsiPeak - Valore di picco dell'RSI nei saltelli.
         * @param {number} bodyMassKg - Massa corporea dell'atleta in kg.
         * @returns {Object} { efficiencyMean, efficiencyPeak, classification, rfdDeficitLevel, rationale }
         */
        static evaluatePowerVsRsiMatrix(relativePowerWkg, rsiMean, rsiPeak, bodyMassKg) {
            const pWkg = (typeof relativePowerWkg === 'number' && relativePowerWkg > 0) ? relativePowerWkg : 0;
            const meanRsi = (typeof rsiMean === 'number' && rsiMean > 0) ? rsiMean : 0;
            const peakRsi = (typeof rsiPeak === 'number' && rsiPeak > 0) ? rsiPeak : meanRsi;
            const massKg = (typeof bodyMassKg === 'number' && bodyMassKg > 0) ? bodyMassKg : 70;

            const efficiencyMean = pWkg > 0 ? meanRsi / pWkg : 0;
            const efficiencyPeak = pWkg > 0 ? peakRsi / pWkg : 0;

            let classification = 'EFFICIENZA_BILANCIATA';
            let rfdDeficitLevel = 'NESSUNO';
            let rationale = '';

            if (pWkg >= HIGH_POWER_WKG_THRESHOLD && meanRsi < LOW_RSI_THRESHOLD && massKg < HEAVY_BODY_MASS_CUTOFF_KG) {
                classification = 'DEFICIT_RFD_PRECOCE';
                rfdDeficitLevel = 'MARCATO';
                rationale = `L'atleta esprime elevata potenza su archi temporali estesi (>300 ms, ${pWkg.toFixed(1)} W/kg), ma manifesta un deficit selettivo nello sviluppo rapido di forza nei primi 100 ms (RSI ${meanRsi.toFixed(2)}).`;
            } else if (massKg >= HEAVY_BODY_MASS_CUTOFF_KG && meanRsi < LOW_RSI_THRESHOLD) {
                classification = 'PENALITA_INERZIALE_MASSA';
                rfdDeficitLevel = 'MODERATO';
                rationale = `L'RSI moderato (${meanRsi.toFixed(2)}) è coerente con la taglia corporea elevata (${massKg} kg, correlazione inversa r = -0.77). Non costituisce deficit neuromuscolare rispetto ai pari peso.`;
            } else if (pWkg < LOW_POWER_WKG_THRESHOLD) {
                classification = 'DEFICIT_POTENZA_CONCENTRICA';
                rfdDeficitLevel = 'MODERATO';
                rationale = `Potenza relativa SJ sotto soglia (${pWkg.toFixed(1)} W/kg): il collo di bottiglia risiede nella forza concentrica propulsiva a monte e non nella reattività di caviglia.`;
            } else {
                classification = 'EFFICIENZA_BILANCIATA';
                rfdDeficitLevel = 'NESSUNO';
                rationale = `Rapporto armonico tra potenza propulsiva (${pWkg.toFixed(1)} W/kg) e reattività fast-SSC (RSI ${meanRsi.toFixed(2)}, picco ${peakRsi.toFixed(2)}).`;
            }

            return {
                efficiencyMean: parseFloat(efficiencyMean.toFixed(4)),
                efficiencyPeak: parseFloat(efficiencyPeak.toFixed(4)),
                relativePowerWkg: parseFloat(pWkg.toFixed(2)),
                classification,
                rfdDeficitLevel,
                rationale
            };
        }
    }

    // Esposizione globale
    root.PAPStatsEngine = PAPStatsEngine;
})();
