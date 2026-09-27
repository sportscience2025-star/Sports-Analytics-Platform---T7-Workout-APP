/**
 * physics-engine.js
 * Advanced mathematical and biomechanical engine for Velocity Based Training (VBT).
 * Based on Samozino et al. (2012, 2016) F-V profile methodology and standard VBT literature.
 */

(function () {
    'use strict';

    window.PhysicsEngine = class {

        /**
         * Calculate Linear Regression for Load-Velocity profile.
         * V = a*L + b  (slope=a negative, intercept=b positive)
         * F0 = x-intercept (load at V=0): L = -b/a
         * V0 = y-intercept (velocity at L=0): V = b
         * Pmax = F0_N * V0 / 4  (theoretical max power at optimal load F0/2)
         *
         * @param {Array} data Array of { load: number (kg), velocity: number (m/s) }
         * @returns {Object} Full regression result with biomechanical parameters
         */
        static linearRegressionVBT(data) {
            if (!data || data.length < 2) return null;

            // --- Filter out NaN/Infinity values from input ---
            data = data.filter(pt =>
                typeof pt.load === 'number' && isFinite(pt.load) &&
                typeof pt.velocity === 'number' && isFinite(pt.velocity)
            );
            if (data.length < 2) return null;

            // --- Outlier removal: IQR-based on velocity residuals (requires >= 4 points) ---
            let cleanData = data;
            if (data.length >= 5) {
                cleanData = this._removeOutliersIQR(data);
                // Safety: ensure at least 3 points remain
                if (cleanData.length < 3) cleanData = data;
            }

            const n = cleanData.length;
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;

            cleanData.forEach(pt => {
                sumX  += pt.load;
                sumY  += pt.velocity;
                sumXY += pt.load * pt.velocity;
                sumXX += pt.load * pt.load;
                sumYY += pt.velocity * pt.velocity;
            });

            // Guard: collinear loads (all same load) -> denominator = 0
            const denominator = n * sumXX - sumX * sumX;
            if (Math.abs(denominator) < 1e-9) {
                return {
                    slope: 0, intercept: 0, rSquared: 0,
                    v0: 0, f0: 0, f0_N: 0, pmax: 0, pmaxLoad: 0, pmaxVelocity: 0,
                    see: 0,
                    n, outlierCount: data.length - n,
                    equation: 'Dati insufficienti (carichi identici)',
                    qualityLabel: 'Profilo non valido',
                    predictVelocity: () => 0,
                    predictLoad: () => 0,
                    residuals: []
                };
            }

            // OLS slope and intercept
            let slope     = (n * sumXY - sumX * sumY) / denominator;
            if (Math.abs(slope) < 1e-4) {
                slope = 0;
            }
            const intercept = (sumY - slope * sumX) / n;

            // R-squared
            const yMean = sumY / n;
            let totalSS = 0, residualSS = 0;
            const residuals = [];
            cleanData.forEach(pt => {
                const yPred = slope * pt.load + intercept;
                const res   = pt.velocity - yPred;
                residuals.push({ load: pt.load, velocity: pt.velocity, predicted: yPred, residual: res });
                totalSS    += Math.pow(pt.velocity - yMean, 2);
                residualSS += Math.pow(res, 2);
            });
            const rSquared = totalSS < 1e-12
                ? 1
                : Math.max(0, Math.min(1, 1 - residualSS / totalSS));

            // Standard error of estimate (SEE) for confidence
            const see = n > 2 ? Math.sqrt(residualSS / (n - 2)) : 0;

            // --- Biomechanical parameters ---
            // V0: theoretical velocity at zero load (y-intercept) [m/s]
            const v0 = intercept;

            // F0: theoretical maximal force = load at zero velocity (x-intercept) [kg]
            // V = slope*L + intercept = 0 => L = -intercept / slope
            const f0 = (Math.abs(slope) > 1e-6 && intercept > 1e-6)
                ? -intercept / slope
                : 0;

            // F0 in Newtons (weight force, assuming gravity = 9.81 m/s²)
            const f0_N = f0 * 9.81;

            // Pmax: Theoretical maximum mechanical power [W]
            // For a linear F-V profile: Pmax = F0(N) * V0 / 4
            // (occurs at load = F0/2 and velocity = V0/2)
            const pmax = (f0_N > 0 && v0 > 0) ? (f0_N * v0) / 4 : 0;

            // Load at Pmax = F0/2 [kg]
            const pmaxLoad = f0 / 2;

            // Velocity at Pmax = V0/2 [m/s]
            const pmaxVelocity = v0 / 2;

            // F-V Imbalance: ratio of actual Pmax load to F0/2
            // Sfvp = (Pmax_load_actual - F0/2) / F0/2 * 100
            // Here: slope gives optimal load = -b/(2a) so Sfvp = 0 for a perfectly symmetric profile
            // We calculate the load of max power empirically from the actual data
            const loadAtMaxPower = this._findEmpiricalPmaxLoad(cleanData, slope, intercept);
            const sfvp = f0 > 0 ? ((loadAtMaxPower - pmaxLoad) / pmaxLoad) * 100 : 0;

            // --- Quality labels ---
            let qualityLabel;
            if      (rSquared >= 0.98) qualityLabel = '⭐ Eccellente (R²≥0.98)';
            else if (rSquared >= 0.95) qualityLabel = '✅ Ottima (R²≥0.95)';
            else if (rSquared >= 0.90) qualityLabel = '⚠️ Buona (R²≥0.90)';
            else if (rSquared >= 0.80) qualityLabel = '⚠️ Accettabile (R²≥0.80)';
            else                       qualityLabel = '❌ Bassa (R²<0.80) – Rieseguire test';

            // F-V Profile bias interpretation
            let fvBias;
            if      (sfvp >  15) fvBias = 'Orientato alla Forza (+' + sfvp.toFixed(0) + '%) → Lavorare sulla velocità/potenza';
            else if (sfvp < -15) fvBias = 'Orientato alla Velocità (' + sfvp.toFixed(0) + '%) → Lavorare sulla forza massimale';
            else                 fvBias = 'Profilo Bilanciato (' + sfvp.toFixed(0) + '%) → Ottimale per la potenza';

            const rSquaredAdj = n > 2 ? Math.max(0, 1 - ((1 - rSquared) * (n - 1)) / (n - 2)) : rSquared;

            return {
                modelType: 'linear',
                coefficients: { c0: intercept, c1: slope, c2: 0 },
                slope,
                intercept,
                rSquared,
                rSquaredAdj,
                see,
                v0,
                f0,
                f0_N,
                pmax,
                pmaxLoad,
                pmaxVelocity,
                sfvp,
                n,
                outlierCount: data.length - n,
                meanV: yMean,
                ssVV: totalSS,
                equation: `V = ${slope.toFixed(4)}·L + ${intercept.toFixed(4)}`,
                qualityLabel,
                fvBias,
                residuals,
                predictVelocity: (load) => slope * load + intercept,
                predictLoad:     (vel)  => (Math.abs(slope) < 1e-9) ? 0 : (vel - intercept) / slope
            };
        }

        /**
         * Calculate Median of an array of numbers.
         * @private
         */
        static _median(sortedArr) {
            const len = sortedArr.length;
            if (len === 0) return 0;
            const mid = Math.floor(len / 2);
            return len % 2 !== 0 ? sortedArr[mid] : (sortedArr[mid - 1] + sortedArr[mid]) / 2;
        }

        /**
         * Remove velocity outliers using Median Absolute Deviation (MAD) on residuals.
         * Falls back to raw data if dataset is too small or MAD is 0.
         * @private
         */
        static _removeOutliersMAD(data) {
            if (!data || data.length < 4) return data;

            const n = data.length;
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
            data.forEach(pt => { sumX += pt.load; sumY += pt.velocity; sumXY += pt.load * pt.velocity; sumXX += pt.load * pt.load; });
            const denom = n * sumXX - sumX * sumX;
            if (Math.abs(denom) < 1e-9) return data;
            const slope = (n * sumXY - sumX * sumY) / denom;
            const intercept = (sumY - slope * sumX) / n;

            const residuals = data.map(pt => pt.velocity - (slope * pt.load + intercept));
            const sortedRes = [...residuals].sort((a, b) => a - b);
            const medianRes = this._median(sortedRes);

            const absDevs = residuals.map(r => Math.abs(r - medianRes));
            const sortedDevs = [...absDevs].sort((a, b) => a - b);
            const mad = this._median(sortedDevs);

            if (mad < 1e-9) return data;

            const filtered = data.filter((pt, i) => {
                const modZ = (0.6745 * Math.abs(residuals[i] - medianRes)) / mad;
                return modZ <= 2.5;
            });

            return filtered.length >= 3 ? filtered : data;
        }

        /**
         * Remove velocity outliers using IQR method on regression residuals.
         * @private
         */
        static _removeOutliersIQR(data) {
            if (!data || data.length < 4) return data;
            const n = data.length;
            const velocities = data.map(pt => pt.velocity);
            const sorted = [...velocities].sort((a, b) => a - b);
            const q1 = sorted[Math.floor(n * 0.25)];
            const q3 = sorted[Math.floor(n * 0.75)];
            const iqr = q3 - q1;
            const fence_upper = q3 + 1.5 * iqr;
            const fence_lower = q1 - 1.5 * iqr;

            return data.filter(pt => pt.velocity >= fence_lower && pt.velocity <= fence_upper);
        }


        /**
         * Solve 3x3 linear system A * C = B using Cramer's Rule.
         * @private
         */
        static _solve3x3(A, B) {
            const det3 = (M) =>
                M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) -
                M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) +
                M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);

            const d = det3(A);
            if (Math.abs(d) < 1e-12) return null;

            const replaceCol = (M, col, V) => M.map((row, i) => row.map((val, j) => (j === col ? V[i] : val)));

            const c0 = det3(replaceCol(A, 0, B)) / d;
            const c1 = det3(replaceCol(A, 1, B)) / d;
            const c2 = det3(replaceCol(A, 2, B)) / d;

            return [c0, c1, c2];
        }

        /**
         * Calculate Quadratic Polynomial Regression for Load-Velocity profile.
         * V = c2 * L^2 + c1 * L + c0
         *
         * @param {Array} data Array of { load: number, velocity: number }
         * @returns {Object} Full quadratic regression result
         */
        static quadraticRegressionVBT(data) {
            if (!data || data.length < 3) return null;

            let cleanData = data;
            if (data.length >= 4) {
                cleanData = this._removeOutliersMAD(data);
                if (cleanData.length < 3) cleanData = data;
            }

            const n = cleanData.length;
            let sL0 = n, sL1 = 0, sL2 = 0, sL3 = 0, sL4 = 0;
            let sV0 = 0, sLV = 0, sL2V = 0;

            cleanData.forEach(pt => {
                const l = pt.load;
                const v = pt.velocity;
                const l2 = l * l;
                sL1 += l;
                sL2 += l2;
                sL3 += l2 * l;
                sL4 += l2 * l2;
                sV0 += v;
                sLV += l * v;
                sL2V += l2 * v;
            });

            const A = [
                [sL0, sL1, sL2],
                [sL1, sL2, sL3],
                [sL2, sL3, sL4]
            ];
            const B = [sV0, sLV, sL2V];

            const coeffs = this._solve3x3(A, B);
            if (!coeffs) return null;

            const [c0, c1, c2] = coeffs;

            const yMean = sV0 / n;
            let totalSS = 0, residualSS = 0;
            const residuals = [];

            cleanData.forEach(pt => {
                const yPred = c2 * pt.load * pt.load + c1 * pt.load + c0;
                const res = pt.velocity - yPred;
                residuals.push({ load: pt.load, velocity: pt.velocity, predicted: yPred, residual: res });
                totalSS += Math.pow(pt.velocity - yMean, 2);
                residualSS += Math.pow(res, 2);
            });

            const rSquared = totalSS < 1e-12 ? 1 : Math.max(0, Math.min(1, 1 - residualSS / totalSS));
            const p = 2;
            const rSquaredAdj = n > (p + 1)
                ? Math.max(0, 1 - ((1 - rSquared) * (n - 1)) / (n - p - 1))
                : rSquared;

            const see = n > (p + 1) ? Math.sqrt(residualSS / (n - p - 1)) : 0;

            const v0 = c0;

            let f0 = 0;
            if (Math.abs(c2) < 1e-7) {
                f0 = (Math.abs(c1) > 1e-6 && c0 > 1e-6) ? -c0 / c1 : 0;
            } else {
                const disc = c1 * c1 - 4 * c2 * c0;
                if (disc >= 0) {
                    const root1 = (-c1 - Math.sqrt(disc)) / (2 * c2);
                    const root2 = (-c1 + Math.sqrt(disc)) / (2 * c2);
                    const validRoots = [root1, root2].filter(r => r > 0);
                    f0 = validRoots.length > 0 ? Math.min(...validRoots) : 0;
                }
            }
            const f0_N = f0 * 9.81;

            let pmaxLoad = f0 > 0 ? f0 / 2 : 0;
            const pDisc = 4 * c1 * c1 - 12 * c2 * c0;
            if (Math.abs(c2) > 1e-7 && pDisc >= 0) {
                const pr1 = (-2 * c1 - Math.sqrt(pDisc)) / (6 * c2);
                const pr2 = (-2 * c1 + Math.sqrt(pDisc)) / (6 * c2);
                const validP = [pr1, pr2].filter(r => r > 0 && r < (f0 || 1000));
                if (validP.length > 0) pmaxLoad = validP[0];
            }
            const pmaxVel = c2 * pmaxLoad * pmaxLoad + c1 * pmaxLoad + c0;
            const pmax = (f0_N > 0 && pmaxVel > 0) ? pmaxLoad * 9.81 * pmaxVel : 0;

            const loadAtMaxPower = this._findEmpiricalPmaxLoadQuad(cleanData, c2, c1, c0);
            let sfvp = f0 > 0 ? ((loadAtMaxPower - pmaxLoad) / pmaxLoad) * 100 : 0;
            if (!Number.isFinite(sfvp)) sfvp = 0;

            let qualityLabel;
            if      (rSquaredAdj >= 0.98) qualityLabel = '⭐ Eccellente (R²adj≥0.98)';
            else if (rSquaredAdj >= 0.95) qualityLabel = '✅ Ottima (R²adj≥0.95)';
            else if (rSquaredAdj >= 0.90) qualityLabel = '⚠️ Buona (R²adj≥0.90)';
            else if (rSquaredAdj >= 0.80) qualityLabel = '⚠️ Accettabile (R²adj≥0.80)';
            else                          qualityLabel = '❌ Bassa (R²adj<0.80) – Rieseguire test';

            let fvBias;
            if      (sfvp >  15) fvBias = 'Orientato alla Forza (+' + sfvp.toFixed(0) + '%) → Lavorare sulla velocità/potenza';
            else if (sfvp < -15) fvBias = 'Orientato alla Velocità (' + sfvp.toFixed(0) + '%) → Lavorare sulla forza massimale';
            else                 fvBias = 'Profilo Bilanciato (' + sfvp.toFixed(0) + '%) → Ottimale per la potenza';

            return {
                modelType: 'quadratic',
                coefficients: { c0, c1, c2 },
                slope: c1,
                intercept: c0,
                rSquared,
                rSquaredAdj,
                see,
                v0,
                f0,
                f0_N,
                pmax,
                pmaxLoad,
                pmaxVelocity: pmaxVel,
                sfvp,
                n,
                outlierCount: data.length - n,
                meanV: yMean,
                ssVV: totalSS,
                equation: `V = ${c2 >= 0 ? '+' : ''}${c2.toFixed(5)}·L² ${c1 >= 0 ? '+' : ''}${c1.toFixed(4)}·L + ${c0.toFixed(4)}`,
                qualityLabel,
                fvBias,
                residuals,
                predictVelocity: (load) => c2 * load * load + c1 * load + c0,
                predictLoad: (vel) => {
                    if (Math.abs(c2) < 1e-7) return (Math.abs(c1) < 1e-9) ? 0 : (vel - c0) / c1;
                    const d = c1 * c1 - 4 * c2 * (c0 - vel);
                    if (d < 0) return 0;
                    const r1 = (-c1 - Math.sqrt(d)) / (2 * c2);
                    const r2 = (-c1 + Math.sqrt(d)) / (2 * c2);
                    const valid = [r1, r2].filter(r => r >= 0);
                    return valid.length > 0 ? Math.min(...valid) : 0;
                }
            };
        }

        /**
         * Find load at empirical maximum power for quadratic model.
         * @private
         */
        static _findEmpiricalPmaxLoadQuad(data, c2, c1, c0) {
            const loads = data.map(d => d.load);
            const minLoad = loads.reduce((a, b) => Math.min(a, b), Infinity);
            const maxLoad = loads.reduce((a, b) => Math.max(a, b), -Infinity);
            let maxP = 0, bestLoad = (minLoad + maxLoad) / 2;
            const step = Math.max(0.1, (maxLoad - minLoad) / 500);
            for (let L = minLoad; L <= maxLoad; L += step) {
                const V = c2 * L * L + c1 * L + c0;
                if (V <= 0) break;
                const P = L * 9.81 * V;
                if (P > maxP) { maxP = P; bestLoad = L; }
            }
            return bestLoad;
        }

        /**
         * Find load at empirical maximum power by scanning the data range.
         * @private
         */
        static _findEmpiricalPmaxLoad(data, slope, intercept) {
            const loads = data.map(d => d.load);
            const minLoad = loads.reduce((a, b) => Math.min(a, b), Infinity);
            const maxLoad = loads.reduce((a, b) => Math.max(a, b), -Infinity);
            let maxP = 0, bestLoad = (minLoad + maxLoad) / 2;
            const step = Math.max(0.1, (maxLoad - minLoad) / 500);
            for (let L = minLoad; L <= maxLoad; L += step) {
                const V = slope * L + intercept;
                if (V <= 0) break;
                const P = L * 9.81 * V;
                if (P > maxP) { maxP = P; bestLoad = L; }
            }
            return bestLoad;
        }

        /**
         * Automatically select the optimal regression model (Linear vs Quadratic)
         * based on sample size and Adjusted R².
         * @param {Array} data Array of { load: number, velocity: number }
         * @returns {Object} Selected regression model result
         */
        static autoSelectRegressionVBT(data) {
            if (!data || data.length < 2) return null;

            let cleanData = data;
            if (data.length >= 4) {
                cleanData = this._removeOutliersMAD(data);
                if (cleanData.length < 3) cleanData = data;
            }

            const n = cleanData.length;
            const linReg = this.linearRegressionVBT(cleanData);

            if (n < 4 || !linReg) {
                return linReg;
            }

            const quadReg = this.quadraticRegressionVBT(cleanData);
            if (!quadReg) return linReg;

            const r2Gain = quadReg.rSquaredAdj - linReg.rSquaredAdj;
            const isPhysical = quadReg.coefficients.c2 <= 0.0001 && quadReg.f0 > 0 && quadReg.v0 > 0;

            if (r2Gain > 0.003 && isPhysical) {
                return quadReg;
            }

            return linReg;
        }

        /**
         * Estimate 1RM based on Minimum Velocity Threshold (MVT) with 95% Confidence Interval.
         * Typical MVT for Squat is ~0.30 m/s, Bench Press ~0.15 m/s, Deadlift ~0.15 m/s.
         * @param {Object} regression - Result from linearRegressionVBT or quadraticRegressionVBT
         * @param {number} mvt - Minimum Velocity Threshold (m/s)
         * @param {Object} options - Options object (e.g. { detailed: true })
         * @returns {number|Object} Estimated 1RM object/number
         */
        static estimate1RM(regression, mvt = 0.30, options = {}) {
            if (!regression) return 0;
            const slope = regression.slope !== undefined ? regression.slope : (regression.coefficients ? regression.coefficients.c1 : 0);
            const v0 = regression.v0 !== undefined ? regression.v0 : regression.intercept;

            if (v0 <= 0 || mvt <= 0 || mvt >= v0) {
                if (options && options.detailed) {
                    return { value: 0, ci95Min: 0, ci95Max: 0, margin: 0, estimated: 0, ci95: [0, 0] };
                }
                return 0;
            }

            let est = 0;
            if (typeof regression.predictLoad === 'function') {
                est = Math.max(0, regression.predictLoad(mvt));
            } else if (Math.abs(slope) > 1e-9) {
                est = Math.max(0, (mvt - v0) / slope);
            }

            if (isNaN(est) || est <= 0) {
                if (options && options.detailed) {
                    return { value: 0, ci95Min: 0, ci95Max: 0, margin: 0, estimated: 0, ci95: [0, 0] };
                }
                return 0;
            }

            const see = regression.see || 0.01;
            const n = regression.n || 5;
            const meanV = regression.meanV || 0.60;
            const ssVV = regression.ssVV || 0.10;

            let effSlope = Math.abs(slope);
            if (regression.modelType === 'quadratic' && regression.coefficients) {
                const { c2, c1 } = regression.coefficients;
                effSlope = Math.abs(2 * c2 * est + c1) || effSlope;
            }
            if (effSlope < 1e-5) effSlope = 1e-5;

            const se1RM = (see / effSlope) * Math.sqrt(1 + (1 / n) + (Math.pow(mvt - meanV, 2) / Math.max(1e-6, ssVV)));

            const df = Math.max(1, n - (regression.modelType === 'quadratic' ? 3 : 2));
            const tTable = { 1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571, 6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228 };
            const tCrit = tTable[df] || (df > 30 ? 1.96 : 2.0 + 2.0 / df);

            const margin = tCrit * se1RM;
            const ci95Min = Math.max(0, est - margin);
            const ci95Max = est + margin;

            const numObj = new Number(est);
            numObj.value = est;
            numObj.estimated = est;
            numObj.ci95Min = ci95Min;
            numObj.ci95Max = ci95Max;
            numObj.margin = margin;
            numObj.ci95 = [ci95Min, ci95Max];

            if (options && options.detailed) {
                return {
                    value: est,
                    estimated: est,
                    ci95Min,
                    ci95Max,
                    margin,
                    ci95: [ci95Min, ci95Max]
                };
            }

            return numObj;
        }

        /**
         * Generate a complete load-velocity table for all standard %1RM zones.
         * @param {number} oneRM - Estimated 1RM in kg
         * @param {Object} regression - Regression result
         * @returns {Array} Array of zone objects
         */
        static generateLoadVelocityTable(oneRM, regression) {
            if (!oneRM || oneRM <= 0 || !regression) return [];

            // Standard intensity zones from VBT literature (Gonzalez-Badillo, Pareja-Blanco et al.)
            const zones = [
                { pct: 0.30, zone: 'Potenza Balistica',   color: '#06b6d4' },
                { pct: 0.40, zone: 'Potenza Alta',         color: '#10b981' },
                { pct: 0.50, zone: 'Potenza Moderata',     color: '#84cc16' },
                { pct: 0.55, zone: 'Ibrida Forza-Vel.',    color: '#a3e635' },
                { pct: 0.60, zone: 'Ibrida Forza-Vel.',    color: '#eab308' },
                { pct: 0.65, zone: 'Forza-Velocità',       color: '#f59e0b' },
                { pct: 0.70, zone: 'Forza-Velocità',       color: '#f97316' },
                { pct: 0.75, zone: 'Forza-Resistenza',     color: '#f87171' },
                { pct: 0.80, zone: 'Forza Sub-Max',        color: '#f43f5e' },
                { pct: 0.85, zone: 'Forza Sub-Max',        color: '#fb7185' },
                { pct: 0.90, zone: 'Forza Massimale',      color: '#f472b6' },
                { pct: 0.95, zone: 'Forza Massimale',      color: '#ff3385' },
                { pct: 1.00, zone: '1RM (MVT)',             color: '#ff3366' },
            ];

            return zones.map(z => {
                const loadRaw  = oneRM * z.pct;
                const load5    = Math.round(loadRaw / 2.5) * 2.5; // round to 2.5 kg
                const load5kg  = Math.round(loadRaw / 5)   * 5;   // round to 5 kg
                const vel      = regression.predictVelocity(loadRaw);
                const velClamped = Math.max(0, vel);
                const forceN   = loadRaw * 9.81;
                const power    = forceN * velClamped;
                return {
                    pct: (z.pct * 100).toFixed(0) + '%',
                    zone: z.zone,
                    color: z.color,
                    loadRaw: loadRaw.toFixed(1),
                    load5kg: load5kg,
                    load2_5kg: load5,
                    velocity: velClamped.toFixed(3),
                    forceN: forceN.toFixed(0),
                    power: power.toFixed(0)
                };
            });
        }

        /**
         * Generate a load-velocity table based on fixed round velocity steps (1.0 down to 0.3 m/s).
         * @param {number} oneRM - Estimated 1RM in kg
         * @param {Object} regression - Regression result
         * @returns {Array} Array of velocity step objects
         */
        static generateVelocityStepsTable(oneRM, regression) {
            if (!regression || typeof regression.predictLoad !== 'function') return [];
            const velocities = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];

            return velocities.map(vTarget => {
                const rawVal = regression.predictLoad(vTarget);
                const loadRaw = (isNaN(rawVal) || !isFinite(rawVal)) ? 0 : Math.max(0, rawVal);
                const load2_5kg = Math.round(loadRaw / 2.5) * 2.5;
                const pct1RM = (oneRM && oneRM > 0) ? (loadRaw / oneRM) * 100 : 0;

                return {
                    velocity: vTarget.toFixed(1),
                    loadRaw: loadRaw.toFixed(1),
                    load2_5kg: load2_5kg,
                    pct: pct1RM.toFixed(1) + '%'
                };
            });
        }

        /**
         * Generate VBT training progression (weekly blocks).
         * @param {number} oneRM
         * @param {Object} regression
         * @param {number} weeks
         * @returns {Array}
         */
        static generateVBTProgression(oneRM, regression, weeks = 4) {
            if (isNaN(oneRM) || oneRM <= 0) oneRM = 0;
            const progression = [];
            const percentages = [0.70, 0.75, 0.80, 0.85, 0.88, 0.90];

            for (let i = 0; i < weeks; i++) {
                const targetPct = percentages[Math.min(i, percentages.length - 1)];
                const rawLoad   = oneRM * targetPct;
                const roundedLoad = Math.floor(rawLoad / 5) * 5;
                let predictedVel = regression ? regression.predictVelocity(roundedLoad) : 0;
                if (isNaN(predictedVel)) predictedVel = 0;
                const clampedVel  = Math.max(0.05, predictedVel);
                const forceN      = roundedLoad * 9.81;
                const power       = forceN * clampedVel;

                progression.push({
                    week:       i + 1,
                    percentage: (targetPct * 100).toFixed(0) + '%',
                    load:       roundedLoad,
                    velocity:   clampedVel.toFixed(3),
                    forceN:     forceN.toFixed(0),
                    force:      Math.round(forceN),
                    power:      Math.round(power),
                    powerW:     power.toFixed(0)
                });
            }

            return progression;
        }

        /**
         * Calculate Force (N) = Mass (kg) × g
         */
        static calculateForce(massKg) {
            return massKg * 9.81;
        }

        /**
         * Calculate Power (W) = Force (N) × Velocity (m/s)
         */
        static calculatePower(forceN, velocityMs) {
            return forceN * velocityMs;
        }

        /**
         * Calculate Eccentric Utilization Ratio (EUR) = CMJ / SJ
         */
        static calculateEUR(cmjHeight, sjHeight) {
            if (typeof cmjHeight !== 'number' || typeof sjHeight !== 'number' ||
                isNaN(cmjHeight) || isNaN(sjHeight) || cmjHeight <= 0 || sjHeight <= 0) return 0;
            return cmjHeight / sjHeight;
        }

        /**
         * Calculate Reactive Strength Index (RSI) = Jump Height (m) / Contact Time (s)
         */
        static calculateRSI(jumpHeight, contactTime) {
            if (typeof jumpHeight !== 'number' || typeof contactTime !== 'number' ||
                isNaN(jumpHeight) || isNaN(contactTime) || jumpHeight <= 0 || contactTime <= 0) return 0;
            // Auto-convert cm to m if needed (threshold 3.0 to protect jumps in meters)
            const heightM = jumpHeight > 3.0 ? jumpHeight / 100 : jumpHeight;
            return heightM / contactTime;
        }

        /**
         * Evaluate Jump Performance based on EUR and RSI thresholds.
         * Thresholds from literature (Bosco, Young et al.)
         */
        static evaluateJumpPerformance(eur, rsi) {
            let eurEval = '';
            if (!eur || eur <= 0) {
                eurEval = 'N/A (Dato EUR mancante)';
            } else if (eur < 1.05) {
                eurEval = `Dominanza Concentrica (EUR = ${eur.toFixed(4)}). L'atleta dipende principalmente dalla produzione di forza concentrica e non sfrutta adeguatamente il ciclo di allungamento-accorciamento (SSC). Suggerisce allenamento reattivo e pliometrico per migliorare lo stoccaggio di energia elastica.`;
            } else if (eur <= 1.15) {
                eurEval = `Profilo Bilanciato (EUR = ${eur.toFixed(4)}). Trasferimento ottimale di energia attraverso il ciclo SSC. Incremento tipico del 5-15% di performance con il contromovimento.`;
            } else {
                eurEval = `Dominanza SSC / Deficit Concentrico (EUR = ${eur.toFixed(4)}). L'atleta ha un eccellente utilizzo dell'elasticità ma può presentare un deficit nella produzione assoluta di forza concentrica. Suggerisce lavoro con squat isometrici o con pausa.`;
            }

            let rsiEval = '';
            if (!rsi || rsi <= 0) {
                rsiEval = 'N/A (Dato RSI mancante)';
            } else if (rsi < 1.5) {
                rsiEval = `Basso (RSI = ${rsi.toFixed(4)}). Capacità reattiva e rigidità muscolo-tendinea scarse. Focus su meccanica di atterraggio, pliometria a bassa intensità (pogo hops) e forza generale.`;
            } else if (rsi < 2.0) {
                rsiEval = `Moderato (RSI = ${rsi.toFixed(4)}). Capacità reattiva media. L'atleta può beneficiare di salti a ostacoli progressivi e drop jump moderato.`;
            } else if (rsi <= 2.5) {
                rsiEval = `Alto (RSI = ${rsi.toFixed(4)}). Buona capacità reattiva e rigidità tendinea. Mantenere e ottimizzare all'altezza di caduta attuale.`;
            } else {
                rsiEval = `Elite (RSI = ${rsi.toFixed(4)}). Eccezionale rigidità tendinea e capacità di rimbalzo reattivo. Implementare shock training avanzato o pliometria appesantita.`;
            }

            return `Profilo EUR: ${eurEval}\n\nProfilo RSI: ${rsiEval}`;
        }

        /**
         * Generate full Bryan Mann VBT Force Zones table.
         * Classifies load (% 1RM) and velocity into 5 Bryan Mann force zones.
         * Dynamically adjusts velocity threshold boundaries based on exerciseName/MVT profile.
         * @param {number} oneRM - Estimated 1RM in kg
         * @param {Object} regression - Regression model result
         * @param {string} exerciseName - Name of the exercise
         * @returns {Array} Array of Bryan Mann zone row objects
         */
        static generateBryanMannVBTTable(oneRM, regression, exerciseName = '') {
            if (typeof oneRM !== 'number' || isNaN(oneRM) || oneRM <= 0 || !regression) {
                return [];
            }

            const exStr = typeof exerciseName === 'string' ? exerciseName.toLowerCase() : '';
            const isBenchOrLowMVT = exStr.includes('bench') || exStr.includes('panca') || exStr.includes('stacco') || exStr.includes('deadlift') || exStr.includes('chest') || exStr.includes('distensioni');

            const zones = [
                {
                    zone: 'Forza Assoluta',
                    pctRange: '>90%',
                    medianPct: 0.95,
                    targetVelocity: isBenchOrLowMVT ? '<0.35 m/s' : '<0.50 m/s',
                    color: '#f43f5e'
                },
                {
                    zone: 'Forza Accelerativa',
                    pctRange: '80-90%',
                    medianPct: 0.85,
                    targetVelocity: isBenchOrLowMVT ? '0.35 - 0.60 m/s' : '0.50 - 0.75 m/s',
                    color: '#f59e0b'
                },
                {
                    zone: 'Forza-Velocità',
                    pctRange: '60-80%',
                    medianPct: 0.70,
                    targetVelocity: isBenchOrLowMVT ? '0.60 - 0.85 m/s' : '0.75 - 1.00 m/s',
                    color: '#eab308'
                },
                {
                    zone: 'Velocità-Forza',
                    pctRange: '30-60%',
                    medianPct: 0.45,
                    targetVelocity: isBenchOrLowMVT ? '0.85 - 1.15 m/s' : '1.00 - 1.30 m/s',
                    color: '#10b981'
                },
                {
                    zone: 'Forza Iniziale',
                    pctRange: '<30%',
                    medianPct: 0.225,
                    targetVelocity: isBenchOrLowMVT ? '>1.15 m/s' : '>1.30 m/s',
                    color: '#06b6d4'
                }
            ];

            return zones.map(z => {
                let loadRaw = oneRM * z.medianPct;
                if (typeof loadRaw !== 'number' || isNaN(loadRaw) || !isFinite(loadRaw)) loadRaw = 0;

                let load2_5kg = Math.round(loadRaw / 2.5) * 2.5;
                if (typeof load2_5kg !== 'number' || isNaN(load2_5kg) || !isFinite(load2_5kg)) load2_5kg = 0;

                let velocity = 0;
                if (regression && typeof regression.predictVelocity === 'function') {
                    const pv = regression.predictVelocity(load2_5kg);
                    if (typeof pv === 'number' && !isNaN(pv) && isFinite(pv)) {
                        velocity = Math.max(0, pv);
                    }
                }

                let forceN = this.calculateForce ? this.calculateForce(load2_5kg) : load2_5kg * 9.81;
                if (typeof forceN !== 'number' || isNaN(forceN) || !isFinite(forceN)) forceN = 0;

                let powerW = this.calculatePower ? this.calculatePower(forceN, velocity) : forceN * velocity;
                if (typeof powerW !== 'number' || isNaN(powerW) || !isFinite(powerW)) powerW = 0;

                return {
                    zone: z.zone || '',
                    pctRange: z.pctRange || '',
                    targetVelocity: z.targetVelocity || '',
                    medianPct: (z.medianPct * 100).toFixed(1) + '%',
                    loadRaw: loadRaw,
                    load2_5kg: load2_5kg,
                    velocity: velocity,
                    forceN: forceN,
                    powerW: powerW,
                    color: z.color || '#ffffff'
                };
            });
        }

        /**
         * High-level wrapper: runs auto-select regression + 1RM estimation in one call.
         * Returns a unified analysis object matching the interface contract expected by tests and UI.
         * @param {Array} data - Array of {load, velocity} points
         * @param {Object} options - Optional config: { mvt: number (default 0.30) }
         * @returns {Object|null} Analysis object with modelType, regression params, rm1 details, or null on failure
         */
        static analyzeLoadVelocity(data, options = {}) {
            const mvt = (options && typeof options.mvt === 'number') ? options.mvt : 0.30;
            const regression = PhysicsEngine.autoSelectRegressionVBT(data);
            if (!regression) return null;

            const rm1 = PhysicsEngine.estimate1RM(regression, mvt, { detailed: true });

            return {
                modelType: regression.modelType || 'linear',
                slope: regression.slope,
                intercept: regression.intercept,
                r2: regression.r2,
                f0: regression.f0,
                v0: regression.v0,
                pmax: regression.pmax,
                outlierCount: regression.outlierCount || 0,
                regression: regression,
                rm1: rm1
            };
        }
    };
})();
