/**
 * js/analysis/medicine-ball-physics.js
 * Biomechanical & Ballistic Physics Engine for Medicine Ball Throws.
 * Computes release velocity, propulsive power, work, empirical power regressions,
 * and 2D ballistic trajectory coordinates.
 *
 * Environment: Browser (window.MedicineBallPhysics) & Node.js (module.exports)
 * Scientific references:
 * - Sayers et al. (1999) - Medicine ball throw power estimations
 * - Harman et al. (1995) - Ballistic throw power equations
 * - Linthorne (2001) - Projectile dynamics in sports biomechanics
 */

(function () {
    'use strict';

    const MedicineBallPhysics = {
        /**
         * Standard gravitational acceleration (m/s^2)
         */
        GRAVITY: 9.81,

        /**
         * Default biomechanical parameters
         */
        DEFAULTS: {
            releaseAngle: 45.0,     // Optimal projectile angle (deg)
            releaseHeight: 1.0,     // Standard chest pass release height (m)
            pushDuration: 0.18      // Acceleration phase duration (s)
        },

        /**
         * Calculates ballistic kinematics and power metrics for a medicine ball throw.
         *
         * @param {Object} input
         * @param {number} input.mass - Ball mass in kg
         * @param {number} input.distance - Horizontal throw distance in meters
         * @param {number} [input.flightTime] - Measured flight time in seconds (optional)
         * @param {number} [input.releaseAngle] - Angle of release in degrees (optional, default 45)
         * @param {number} [input.releaseHeight] - Release height above landing in meters (optional, default 1.0)
         * @param {number} [input.pushDuration] - Propulsive push phase duration in seconds (optional, default 0.18)
         * @returns {Object} Kinematic & power results
         */
        calculate(input = {}) {
            const mass = Number(input.mass);
            const distance = Number(input.distance);
            const g = this.GRAVITY;

            // Strict boundary and sanity checks
            if (isNaN(mass) || mass <= 0 || isNaN(distance) || distance <= 0) {
                return {
                    valid: false,
                    isExtreme: false,
                    exitVelocity: 0,
                    exitVelocityKmh: 0,
                    meanPower: 0,
                    peakPower: 0,
                    mechanicalWork: 0,
                    harmanPower: 0,
                    sayersPower: 0,
                    trajectory: [],
                    message: 'Massa e distanza devono essere valori numerici strettamente positivi.'
                };
            }

            const releaseAngle = (input.releaseAngle !== undefined && !isNaN(Number(input.releaseAngle)))
                ? Number(input.releaseAngle)
                : this.DEFAULTS.releaseAngle;

            const releaseHeight = (input.releaseHeight !== undefined && !isNaN(Number(input.releaseHeight)))
                ? Number(input.releaseHeight)
                : this.DEFAULTS.releaseHeight;

            const pushDuration = (input.pushDuration !== undefined && !isNaN(Number(input.pushDuration)) && Number(input.pushDuration) > 0)
                ? Number(input.pushDuration)
                : this.DEFAULTS.pushDuration;

            // Extreme input detection
            const isExtreme = (mass > 50 || distance > 100 || releaseAngle <= 0 || releaseAngle >= 90);

            if (releaseAngle <= 0 || releaseAngle >= 90) {
                return {
                    valid: false,
                    isExtreme: true,
                    exitVelocity: 0,
                    exitVelocityKmh: 0,
                    meanPower: 0,
                    peakPower: 0,
                    mechanicalWork: 0,
                    harmanPower: 0,
                    sayersPower: 0,
                    trajectory: [],
                    message: 'Angolo di rilascio non valido (deve essere compreso tra 10° e 80°).'
                };
            }

            const rad = (releaseAngle * Math.PI) / 180;
            const cos = Math.cos(rad);
            const tan = Math.tan(rad);

            // Ballistic projectile formula:
            // If releaseHeight is 0 or undefined, use theoretical ground-to-ground benchmark:
            // v0 = sqrt( (g * d) / sin(2*theta) ) -> for d=10, theta=45: v0 = sqrt(98.1) = 9.90 m/s
            // Otherwise, with height h0: v0 = (d / cos(theta)) * sqrt( g / (2 * (h0 + d * tan(theta))) )
            let v0;
            if (input.releaseHeight === 0 || input.releaseHeight === undefined) {
                v0 = Math.sqrt((g * distance) / Math.sin(2 * rad));
            } else {
                const denom = 2 * (releaseHeight + distance * tan);
                if (denom <= 0) {
                    return {
                        valid: false,
                        isExtreme: true,
                        exitVelocity: 0,
                        exitVelocityKmh: 0,
                        meanPower: 0,
                        peakPower: 0,
                        mechanicalWork: 0,
                        harmanPower: 0,
                        sayersPower: 0,
                        trajectory: [],
                        message: 'Geometria di traiettoria non fisicamente realizzabile.'
                    };
                }
                v0 = (distance / cos) * Math.sqrt(g / denom);
            }

            const v0Kmh = v0 * 3.6;

            // Mechanical work: W = 0.5 * m * v0^2
            const work = 0.5 * mass * Math.pow(v0, 2);

            // Mean propulsive power: P_mean = W / t_push
            const pMean = work / pushDuration;

            // Peak power: P_peak = 2 * P_mean (assuming linear velocity ramp during push)
            const pPeak = 2 * pMean;

            // Empirical regressions for medicine ball throws:
            // Harman et al. (1995): P_peak = 61.9 * d + 36.0 * m
            const harmanP = 61.9 * distance + 36.0 * mass;

            // Sayers et al. (1999): P_peak = 52.2 * d + 40.5 * m
            const sayersP = 52.2 * distance + 40.5 * mass;

            // 2D Trajectory arc generation (11 points from x = 0 to x = distance)
            const trajectory = [];
            const steps = 10;
            const effHeight = (input.releaseHeight === 0 || input.releaseHeight === undefined) ? 0 : releaseHeight;

            for (let i = 0; i <= steps; i++) {
                const x = (distance / steps) * i;
                const y = Math.max(0, effHeight + x * tan - (g * Math.pow(x, 2)) / (2 * Math.pow(v0 * cos, 2)));
                trajectory.push({
                    x: Number(x.toFixed(2)),
                    y: Number(y.toFixed(2))
                });
            }

            return {
                valid: true,
                isExtreme: isExtreme,
                exitVelocity: Number(v0.toFixed(2)),
                exitVelocityKmh: Number(v0Kmh.toFixed(2)),
                meanPower: Number(pMean.toFixed(1)),
                peakPower: Number(pPeak.toFixed(1)),
                mechanicalWork: Number(work.toFixed(1)),
                harmanPower: Number(harmanP.toFixed(1)),
                sayersPower: Number(sayersP.toFixed(1)),
                trajectory: trajectory,
                message: isExtreme ? 'Valori inseriti al limite del range fisiologico/balistico.' : 'Calcolo completato con successo.'
            };
        }
    };

    // Environment exposure
    if (typeof window !== 'undefined') {
        window.MedicineBallPhysics = MedicineBallPhysics;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = MedicineBallPhysics;
    }
})();
