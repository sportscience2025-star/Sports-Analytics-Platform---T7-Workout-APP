/**
 * proposed_physics-engine.js
 * Advanced mathematical and biomechanical engine for Velocity Based Training (VBT)
 * This is a proposed replacement file for js/physics-engine.js.
 */

(function () {
    'use strict';

    window.PhysicsEngine = class {
        
        /**
         * Calculate Linear Regression for Load-Velocity profile.
         * @param {Array} data Array of objects { load: number, velocity: number }
         * @returns {Object} { slope, intercept, rSquared, v0, f0, f0_N, pmax, predictLoad, predictVelocity }
         */
        static linearRegressionVBT(data) {
            if (!data || data.length < 2) {
                return null;
            }

            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
            const n = data.length;

            data.forEach(point => {
                const x = point.load;     // Independent variable: Load
                const y = point.velocity; // Dependent variable: Velocity
                sumX += x;
                sumY += y;
                sumXY += x * y;
                sumXX += x * x;
                sumYY += y * y;
            });

            // Calculate slope (m) and intercept (b): y = mx + b
            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;

            // Calculate R-squared
            const yMean = sumY / n;
            let totalSS = 0;
            let residualSS = 0;
            
            data.forEach(point => {
                const yPred = slope * point.load + intercept;
                totalSS += Math.pow(point.velocity - yMean, 2);
                residualSS += Math.pow(point.velocity - yPred, 2);
            });

            const rSquared = totalSS === 0 ? 1 : 1 - (residualSS / totalSS);

            // Biomechanical parameters:
            const v0 = intercept; // Velocity at zero load (y-intercept)
            const f0 = slope !== 0 ? -intercept / slope : 0; // Load (kg) at zero velocity (x-intercept)
            const f0_N = f0 * 9.81; // Force F0 in Newtons (F0_kg * 9.81 m/s^2)
            const pmax = 0.25 * f0_N * v0; // Max Power (Watts) = 0.25 * F0(N) * V0(m/s)

            return {
                slope,
                intercept,
                rSquared,
                v0,
                f0,
                f0_N,
                pmax,
                predictVelocity: (load) => slope * load + intercept,
                // If V = m*L + b => L = (V - b) / m
                predictLoad: (velocity) => (velocity - intercept) / slope
            };
        }

        /**
         * Estimate 1RM based on Minimum Velocity Threshold (MVT).
         * Typical MVT for Squat is ~0.30 m/s, Bench Press ~0.15 m/s.
         */
        static estimate1RM(regression, mvt = 0.30) {
            if (!regression) return 0;
            return Math.max(0, regression.predictLoad(mvt));
        }

        /**
         * Calculate Force (N) = Mass (kg) * (Gravity + Acceleration)
         * Since mean concentric acceleration can be complex to derive without time data,
         * we use a simplified static formula or rely on user-provided acceleration.
         * F = m * 9.81 (Static weight approximation)
         */
        static calculateForce(massKg) {
            return massKg * 9.81;
        }

        /**
         * Calculate Power (W) = Force (N) * Velocity (m/s)
         */
        static calculatePower(forceN, velocityMs) {
            return forceN * velocityMs;
        }

        /**
         * Generate a predictive training progression table based on 1RM.
         */
        static generateVBTProgression(oneRM, regression, weeks = 4) {
            const progression = [];
            
            // Standard generic progression percentages for a basic strength cycle
            const percentages = [0.70, 0.75, 0.80, 0.85];

            for (let i = 0; i < weeks; i++) {
                const targetPct = percentages[Math.min(i, percentages.length - 1)];
                const rawLoad = oneRM * targetPct;
                // Round down to the nearest multiple of 5 kg
                const roundedLoad = Math.floor(rawLoad / 5) * 5;
                const predictedVel = regression ? regression.predictVelocity(roundedLoad) : 0;
                
                progression.push({
                    week: i + 1,
                    percentage: (targetPct * 100).toFixed(0) + '%',
                    load: roundedLoad,
                    velocity: Math.max(0.1, predictedVel).toFixed(2),
                    force: Math.round(this.calculateForce(roundedLoad)),
                    power: Math.round(this.calculatePower(this.calculateForce(roundedLoad), predictedVel))
                });
            }

            return progression;
        }

        /**
         * Calculate Eccentric Utilization Ratio (EUR).
         * EUR = CMJ_Height / SJ_Height.
         * @param {number} cmjHeight CMJ Jump height
         * @param {number} sjHeight SJ Jump height
         * @returns {number} Eccentric Utilization Ratio, or 0 on invalid inputs
         */
        static calculateEUR(cmjHeight, sjHeight) {
            if (typeof cmjHeight !== 'number' || typeof sjHeight !== 'number' || isNaN(cmjHeight) || isNaN(sjHeight)) {
                return 0;
            }
            if (cmjHeight <= 0 || sjHeight <= 0) {
                return 0;
            }
            return cmjHeight / sjHeight;
        }

        /**
         * Calculate Reactive Strength Index (RSI).
         * RSI = Jump_Height (m) / Contact_Time (s).
         * @param {number} jumpHeight Jump height (cm or m)
         * @param {number} contactTime Contact time (s)
         * @returns {number} Reactive Strength Index, or 0 on invalid inputs
         */
        static calculateRSI(jumpHeight, contactTime) {
            if (typeof jumpHeight !== 'number' || typeof contactTime !== 'number' || isNaN(jumpHeight) || isNaN(contactTime)) {
                return 0;
            }
            if (jumpHeight <= 0 || contactTime <= 0) {
                return 0;
            }
            let heightM = jumpHeight;
            if (jumpHeight > 5) {
                heightM = jumpHeight / 100;
            }
            return heightM / contactTime;
        }

        /**
         * Evaluate Jump Performance based on EUR and RSI thresholds.
         * @param {number} eur Eccentric Utilization Ratio
         * @param {number} rsi Reactive Strength Index
         * @returns {string} Detailed qualitative evaluation
         */
        static evaluateJumpPerformance(eur, rsi) {
            let eurEval = "";
            if (!eur || eur <= 0) {
                eurEval = "N/A (Missing or invalid EUR data)";
            } else if (eur < 1.05) {
                eurEval = `Concentric Dominant (EUR = ${eur.toFixed(4)}). The athlete relies heavily on pure concentric force production and displays poor utilization of the stretch-shortening cycle (SSC). Suggests they would benefit from reactive/plyometric training to improve elastic energy storage.`;
            } else if (eur <= 1.15) {
                eurEval = `Balanced (EUR = ${eur.toFixed(4)}). The athlete displays an optimal transfer of energy through the stretch-shortening cycle (SSC). Standard 5-15% performance increase with countermovement.`;
            } else {
                eurEval = `SSC Dominant / Concentric Deficit (EUR = ${eur.toFixed(4)}). The athlete has excellent elastic storage/utilization but may lack absolute concentric rate of force development. Suggests targeting absolute concentric strength (e.g., dead stops, squat pauses).`;
            }

            let rsiEval = "";
            if (!rsi || rsi <= 0) {
                rsiEval = "N/A (Missing or invalid RSI data)";
            } else if (rsi < 1.5) {
                rsiEval = `Low (RSI = ${rsi.toFixed(4)}). Represents poor reactive capacity and muscle-tendon stiffness. Focus on landing mechanics, low-intensity plyometrics (pogo hops), and general strength.`;
            } else if (rsi < 2.0) {
                rsiEval = `Moderate (RSI = ${rsi.toFixed(4)}). Average reactive capacity. Athlete can benefit from progressive barrier jumps and moderate drop jump training.`;
            } else if (rsi <= 2.5) {
                rsiEval = `High (RSI = ${rsi.toFixed(4)}). Well-trained reactive capacity and solid tendon stiffness. Maintain and optimize at current drop height.`;
            } else {
                rsiEval = `Elite (RSI = ${rsi.toFixed(4)}). Exceptional tendon stiffness and reactive rebound capability. Implement advanced shock training or loaded plyometrics.`;
            }

            return `EUR Profile: ${eurEval}\n\nRSI Profile: ${rsiEval}`;
        }
    };
})();
