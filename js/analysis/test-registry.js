/**
 * js/analysis/test-registry.js
 * Centralized, extensible registry for all biomechanical and sports science test types.
 * Supports VBT, Force Plate, Block Accel, Sprint Photocells, 2D Kinematics,
 * Vertical Jumps, Medicine Ball Throws, and General Tabular Fallback.
 *
 * Environment: Browser (window.TestRegistry) and Node.js (module.exports)
 * Tier 1/2 Literature: González-Badillo (2010), McMahon (2018), Bezodis (2019),
 * Morin & Samozino (2016), Escamilla (2001), Bosco (1983), Sayers (1999), Harman (1995).
 */

(function () {
    'use strict';

    /**
     * Deep clone helper to guarantee immutability of registered schemas and returned objects.
     * Preserves functions while cloning arrays and objects.
     * @param {*} obj
     * @returns {*}
     */
    function deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            const arrCopy = [];
            for (let i = 0; i < obj.length; i++) {
                arrCopy.push(deepClone(obj[i]));
            }
            return arrCopy;
        }

        const copy = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const val = obj[key];
                if (typeof val === 'function') {
                    copy[key] = val; // Keep function references intact
                } else if (val !== null && typeof val === 'object') {
                    copy[key] = deepClone(val);
                } else {
                    copy[key] = val;
                }
            }
        }
        return copy;
    }

    /**
     * Sanitizes numerical values defensively.
     * Converts comma decimal strings, checks finiteness, enforces bounds.
     * @param {*} value
     * @param {number|null} min
     * @param {number|null} max
     * @param {number|null} fallback
     * @returns {number|null}
     */
    function sanitizeNumber(value, min = null, max = null, fallback = null) {
        if (value === null || value === undefined || value === '') {
            return fallback;
        }
        let num = typeof value === 'number' ? value : parseFloat(String(value).trim().replace(',', '.'));
        if (isNaN(num) || !isFinite(num)) {
            return fallback;
        }
        if (min !== null && num < min) {
            num = min;
        }
        if (max !== null && num > max) {
            num = max;
        }
        return num;
    }

    /**
     * Pre-defined Canonical Test Definitions (8 biometrical instruments)
     */
    const INITIAL_SCHEMAS = {

        // 1. VBT - Linear Encoders (Vitruve, GymAware, Speed4Lifts, RepOne)
        VBT: {
            id: 'VBT',
            label: 'Encoder Lineare VBT (Vitruve / GymAware / Speed4Lifts / RepOne)',
            summary: 'Profilo Carico-Velocità, stima 1RM e carichi target',
            category: 'strength_power',
            defaultExercise: 'Panca Piana',
            primaryMetric: 'velocity',
            secondaryMetric: 'load',
            requiresAthlete: true,
            requiresExercise: true,
            columns: [
                { key: 'athlete', label: 'Atleta', type: 'text', placeholder: 'Nome Atleta', default: 'Atleta', required: false },
                { key: 'exercise', label: 'Esercizio', type: 'text', placeholder: 'es. Panca Piana', default: 'Panca Piana', required: false },
                { key: 'load', label: 'Carico', type: 'number', unit: 'kg', min: 0, max: 600, step: 0.5, placeholder: 'es. 60', required: true, default: 0 },
                { key: 'velocity', label: 'Velocità Media (Vmp)', type: 'number', unit: 'm/s', min: 0, max: 5.0, step: 0.01, placeholder: 'es. 0.85', required: true, default: 0 },
                { key: 'peakVelocity', label: 'Picco Velocità', type: 'number', unit: 'm/s', min: 0, max: 7.0, step: 0.01, placeholder: 'es. 1.25', required: false, default: null },
                { key: 'power', label: 'Potenza', type: 'number', unit: 'W', min: 0, max: 10000, step: 1, placeholder: 'es. 550', required: false, default: null },
                { key: 'rom', label: 'ROM', type: 'number', unit: 'cm', min: 0, max: 250, step: 0.5, placeholder: 'es. 38', required: false, default: null }
            ],
            headerAliases: {
                load: ['carico', 'peso', 'load', 'carga', 'weight', 'kg', 'carico (kg)', 'load (kg)'],
                velocity: ['velocita', 'velocità', 'velocity', 'vm', 'vmean', 'v_mean', 'mpv', 'vmp', 'mean velocity', 'velocità media'],
                peakVelocity: ['vmax', 'peak_velocity', 'v_max', 'vpeak', 'picco velocità', 'velocità picco', 'peak velocity'],
                power: ['potenza', 'power', 'watt', 'w', 'pmean', 'p_mean', 'potenza media', 'potencia'],
                rom: ['rom', 'range of motion', 'spostamento', 'escursione', 'displacement', 'rom (cm)']
            },
            sampleData: [
                { athlete: 'Mario Rossi', exercise: 'Panca Piana', load: 40, velocity: 1.15, peakVelocity: 1.45, power: 460, rom: 38.5 },
                { athlete: 'Mario Rossi', exercise: 'Panca Piana', load: 60, velocity: 0.92, peakVelocity: 1.22, power: 552, rom: 39.0 },
                { athlete: 'Mario Rossi', exercise: 'Panca Piana', load: 80, velocity: 0.68, peakVelocity: 0.95, power: 544, rom: 38.0 },
                { athlete: 'Mario Rossi', exercise: 'Panca Piana', load: 100, velocity: 0.45, peakVelocity: 0.65, power: 450, rom: 37.5 }
            ]
        },

        // 2. FORCE_PLATE - Force Plates (Hawkin Dynamics, ForceDecks, Kistler)
        FORCE_PLATE: {
            id: 'FORCE_PLATE',
            label: 'Pedana di Forza (Hawkin Dynamics / ForceDecks / Kistler)',
            summary: 'Curva forza-tempo verticale, RFD, picco di forza e impulso',
            category: 'kinetics',
            defaultExercise: 'CMJ Force Plate',
            primaryMetric: 'peakForce',
            secondaryMetric: 'rfd',
            requiresAthlete: true,
            requiresExercise: true,
            columns: [
                { key: 'athlete', label: 'Atleta', type: 'text', placeholder: 'Nome Atleta', default: 'Atleta', required: false },
                { key: 'exercise', label: 'Tipo Prova', type: 'text', placeholder: 'es. CMJ', default: 'CMJ', required: false },
                { key: 'peakForce', label: 'Picco di Forza', type: 'number', unit: 'N', min: 0, max: 15000, step: 1, placeholder: 'es. 2200', required: true, default: 0 },
                { key: 'meanForce', label: 'Forza Media (Fz)', type: 'number', unit: 'N', min: 0, max: 10000, step: 1, placeholder: 'es. 1450', required: false, default: null },
                { key: 'rfd', label: 'RFD (Sviluppo Forza)', type: 'number', unit: 'N/s', min: 0, max: 60000, step: 10, placeholder: 'es. 6500', required: false, default: null },
                { key: 'impulse', label: 'Impulso Verticale', type: 'number', unit: 'N·s', min: 0, max: 2500, step: 0.1, placeholder: 'es. 295.0', required: false, default: null },
                { key: 'rsimod', label: 'RSI-mod', type: 'number', unit: 'm/s', min: 0, max: 3.0, step: 0.01, placeholder: 'es. 0.52', required: false, default: null },
                { key: 'asymmetry', label: 'Asimmetria L/R', type: 'number', unit: '%', min: -50, max: 50, step: 0.1, placeholder: 'es. 2.5', required: false, default: null }
            ],
            headerAliases: {
                peakForce: ['peak force', 'picco forza', 'picco di forza', 'fmax', 'f_max', 'max force', 'forza max', 'forza massima'],
                meanForce: ['mean force', 'forza media', 'fmean', 'f_mean', 'average force', 'fz', 'force_z', 'vertical force', 'forza verticale'],
                rfd: ['rfd', 'rate of force development', 'sviluppo forza', 'tasso forza', 'rfd (n/s)'],
                impulse: ['impulso', 'impulse', 'vertical impulse', 'impulso verticale', 'impulse (n*s)'],
                rsimod: ['rsimod', 'rsi_mod', 'rsi mod', 'rsi-mod', 'modified rsi', 'rsi modificato'],
                asymmetry: ['asymmetry', 'asimmetria', 'l/r asymmetry', 'asi %', 'asym', 'asimmetria (%)']
            },
            sampleData: [
                { athlete: 'Mario Rossi', exercise: 'CMJ', peakForce: 2180, meanForce: 1420, rfd: 6450, impulse: 288.5, rsimod: 0.49, asymmetry: 3.2 },
                { athlete: 'Mario Rossi', exercise: 'CMJ', peakForce: 2290, meanForce: 1480, rfd: 6820, impulse: 299.0, rsimod: 0.53, asymmetry: 2.8 },
                { athlete: 'Mario Rossi', exercise: 'CMJ', peakForce: 2320, meanForce: 1510, rfd: 7100, impulse: 305.2, rsimod: 0.55, asymmetry: 1.9 }
            ]
        },

        // 3. BLOCK_ACCEL - Starting Block IMU / Accelerometers
        BLOCK_ACCEL: {
            id: 'BLOCK_ACCEL',
            label: 'Accelerometro / IMU Blocchi di Partenza',
            summary: 'Accelerazione orizzontale e triassiale, tempo di reazione e spinta sui blocchi',
            category: 'sprint_acceleration',
            defaultExercise: 'Partenza dai Blocchi',
            primaryMetric: 'horizontalAccel',
            secondaryMetric: 'reactionTime',
            requiresAthlete: true,
            requiresExercise: true,
            columns: [
                { key: 'athlete', label: 'Atleta', type: 'text', placeholder: 'Nome Atleta', default: 'Atleta', required: false },
                { key: 'exercise', label: 'Prova / Assetto', type: 'text', placeholder: 'es. Blocchi 100m', default: 'Blocchi 100m', required: false },
                { key: 'horizontalAccel', label: 'Acc. Orizzontale', type: 'number', unit: 'm/s²', min: 0, max: 35, step: 0.05, placeholder: 'es. 10.2', required: true, default: 0 },
                { key: 'reactionTime', label: 'Tempo Reazione', type: 'number', unit: 's', min: 0.05, max: 0.50, step: 0.001, placeholder: 'es. 0.140', required: true, default: 0.15 },
                { key: 'pushDuration', label: 'Durata Spinta', type: 'number', unit: 's', min: 0.10, max: 1.00, step: 0.005, placeholder: 'es. 0.360', required: false, default: null },
                { key: 'exitVelocity', label: 'Velocità Uscita', type: 'number', unit: 'm/s', min: 0, max: 12.0, step: 0.01, placeholder: 'es. 3.65', required: false, default: null },
                { key: 'accelX', label: 'Acc. X (Longitudinale)', type: 'number', unit: 'm/s²', min: -10, max: 40, step: 0.05, placeholder: 'es. 10.2', required: false, default: null },
                { key: 'accelY', label: 'Acc. Y (Laterale)', type: 'number', unit: 'm/s²', min: -15, max: 15, step: 0.05, placeholder: 'es. 0.8', required: false, default: null },
                { key: 'accelZ', label: 'Acc. Z (Verticale)', type: 'number', unit: 'm/s²', min: -10, max: 30, step: 0.05, placeholder: 'es. 5.2', required: false, default: null }
            ],
            headerAliases: {
                horizontalAccel: ['accel orizzontale', 'horizontal accel', 'a_horiz', 'ahoriz', 'accel_h', 'ax_horiz', 'accel horiz', 'acc orizzontale'],
                reactionTime: ['tempo reazione', 'reaction time', 'tempo di reazione', 'rt (ms)', 'rt (s)', 'rt', 'tempo_reazione'],
                pushDuration: ['tempo spinta', 'push time', 'push duration', 'block time', 'tempo sui blocchi', 'durata spinta', 'durata_spinta'],
                exitVelocity: ['velocita uscita', 'exit velocity', 'v_exit', 'v exit', 'velocita blocco', 'v_blocco'],
                accelX: ['accel_x', 'accel x', 'acceleration x', 'acc x', 'ax (m/s2)', 'ax (g)', 'ax'],
                accelY: ['accel_y', 'accel y', 'acceleration y', 'acc y', 'ay (m/s2)', 'ay (g)', 'ay'],
                accelZ: ['accel_z', 'accel z', 'acceleration z', 'acc z', 'az (m/s2)', 'az (g)', 'az']
            },
            sampleData: [
                { athlete: 'Mario Rossi', exercise: 'Blocchi 100m', horizontalAccel: 9.85, reactionTime: 0.142, pushDuration: 0.365, exitVelocity: 3.60, accelX: 9.85, accelY: 0.82, accelZ: 5.12 },
                { athlete: 'Mario Rossi', exercise: 'Blocchi 100m', horizontalAccel: 10.20, reactionTime: 0.138, pushDuration: 0.355, exitVelocity: 3.68, accelX: 10.20, accelY: 0.74, accelZ: 5.30 },
                { athlete: 'Mario Rossi', exercise: 'Blocchi 100m', horizontalAccel: 10.45, reactionTime: 0.134, pushDuration: 0.348, exitVelocity: 3.75, accelX: 10.45, accelY: 0.65, accelZ: 5.42 }
            ]
        },

        // 4. SPRINT_TIMING - Photocells & Sprint Gates (Microgate Witty, Freelap, Brower)
        SPRINT_TIMING: {
            id: 'SPRINT_TIMING',
            label: 'Fotocellule Sprint (Microgate Witty / Freelap / Brower)',
            summary: 'Intertempi, progressione di velocità e profilo Samozino-Morin',
            category: 'sprint_timing',
            defaultExercise: 'Sprint 60m',
            primaryMetric: 'split_60m',
            secondaryMetric: 'split_10m',
            requiresAthlete: true,
            requiresExercise: true,
            columns: [
                { key: 'athlete', label: 'Atleta', type: 'text', placeholder: 'Nome Atleta', default: 'Atleta', required: false },
                { key: 'exercise', label: 'Test Distanza', type: 'text', placeholder: 'es. Sprint 60m', default: 'Sprint 60m', required: false },
                { key: 'split_5m', label: '0-5m', type: 'number', unit: 's', min: 0.5, max: 3.0, step: 0.001, placeholder: 'es. 1.050', required: false, default: null },
                { key: 'split_10m', label: '0-10m', type: 'number', unit: 's', min: 1.0, max: 4.0, step: 0.001, placeholder: 'es. 1.740', required: false, default: null },
                { key: 'split_20m', label: '0-20m', type: 'number', unit: 's', min: 2.0, max: 6.0, step: 0.001, placeholder: 'es. 2.920', required: false, default: null },
                { key: 'split_30m', label: '0-30m', type: 'number', unit: 's', min: 3.0, max: 8.0, step: 0.001, placeholder: 'es. 4.010', required: false, default: null },
                { key: 'split_60m', label: '0-60m', type: 'number', unit: 's', min: 5.5, max: 15.0, step: 0.001, placeholder: 'es. 7.150', required: false, default: null },
                { key: 'cumulativeTime', label: 'Tempo Totale', type: 'number', unit: 's', min: 0, max: 30.0, step: 0.001, placeholder: 'es. 7.150', required: true, default: 0 }
            ],
            headerAliases: {
                split_5m: ['5', '5m', '5 m', '0-5m', 'split 5m', 'split 5 m', 't 5m', 't5m'],
                split_10m: ['10', '10m', '10 m', '0-10m', 'split 10m', 'split 10 m', 't 10m', 't10m'],
                split_20m: ['20', '20m', '20 m', '0-20m', 'split 20m', 'split 20 m', 't 20m', 't20m'],
                split_30m: ['30', '30m', '30 m', '0-30m', 'split 30m', 'split 30 m', 't 30m', 't30m'],
                split_60m: ['60', '60m', '60 m', '0-60m', 'split 60m', 'split 60 m', 't 60m', 't60m'],
                cumulativeTime: ['tempo totale', 'cumulative time', 'total time', 'tempo cumulativo', 't_tot', 'time', 'tempo'],
                splitTime: ['tempo parziale', 'split time', 'intertempo', 't_split', 'tempo split', 'split']
            },
            sampleData: [
                { athlete: 'Mario Rossi', exercise: 'Sprint 60m', split_5m: 1.052, split_10m: 1.745, split_20m: 2.920, split_30m: 4.015, split_60m: 7.150, cumulativeTime: 7.150 },
                { athlete: 'Mario Rossi', exercise: 'Sprint 60m', split_5m: 1.038, split_10m: 1.718, split_20m: 2.882, split_30m: 3.965, split_60m: 7.080, cumulativeTime: 7.080 },
                { athlete: 'Mario Rossi', exercise: 'Sprint 60m', split_5m: 1.030, split_10m: 1.705, split_20m: 2.860, split_30m: 3.940, split_60m: 7.035, cumulativeTime: 7.035 }
            ]
        },

        // 5. VIDEO_KINEMATICS - 2D Videoanalysis (Kinovea, Dartfish, Tracker)
        VIDEO_KINEMATICS: {
            id: 'VIDEO_KINEMATICS',
            label: 'Videoanalisi Cinematica 2D (Kinovea / Dartfish / Tracker)',
            summary: 'Cinematica articolare, traiettorie marker e velocità angolari',
            category: 'kinematics',
            defaultExercise: 'Cinematica Squat',
            primaryMetric: 'kneeAngle',
            secondaryMetric: 'angularVelocity',
            requiresAthlete: true,
            requiresExercise: false,
            columns: [
                { key: 'athlete', label: 'Atleta', type: 'text', placeholder: 'Nome Atleta', default: 'Atleta', required: false },
                { key: 'frame', label: 'Frame', type: 'number', unit: '#', min: 0, max: 100000, step: 1, placeholder: 'es. 1', required: true, default: 1 },
                { key: 'time', label: 'Tempo', type: 'number', unit: 's', min: 0, max: 1000, step: 0.001, placeholder: 'es. 0.020', required: true, default: 0 },
                { key: 'kneeAngle', label: 'Ginocchio', type: 'number', unit: '°', min: 0, max: 180, step: 0.1, placeholder: 'es. 90.0', required: false, default: null },
                { key: 'hipAngle', label: 'Anca', type: 'number', unit: '°', min: 0, max: 180, step: 0.1, placeholder: 'es. 85.0', required: false, default: null },
                { key: 'ankleAngle', label: 'Caviglia', type: 'number', unit: '°', min: 0, max: 180, step: 0.1, placeholder: 'es. 70.0', required: false, default: null },
                { key: 'trunkAngle', label: 'Tronco', type: 'number', unit: '°', min: -45, max: 120, step: 0.1, placeholder: 'es. 35.0', required: false, default: null },
                { key: 'angularVelocity', label: 'Velocità Angolare', type: 'number', unit: '°/s', min: -2000, max: 2000, step: 1, placeholder: 'es. 150', required: false, default: null }
            ],
            headerAliases: {
                frame: ['frame', 'fotogramma', 'quadro', 'n_frame', 'frame_idx'],
                time: ['time', 'tempo', 'timestamp', 'sec', 't (s)'],
                kneeAngle: ['angolo ginocchio', 'knee angle', 'knee_angle', 'ginocchio (°)', 'ginocchio (deg)', 'knee'],
                hipAngle: ['angolo anca', 'hip angle', 'hip_angle', 'anca (°)', 'anca (deg)', 'hip'],
                ankleAngle: ['angolo caviglia', 'ankle angle', 'ankle_angle', 'caviglia (°)', 'caviglia (deg)', 'ankle'],
                trunkAngle: ['angolo tronco', 'trunk angle', 'trunk_angle', 'tronco (°)', 'tronco (deg)', 'trunk'],
                angularVelocity: ['velocita angolare', 'angular velocity', 'ang_vel', 'omega', 'deg/s', '°/s', 'vel_angolare']
            },
            sampleData: [
                { athlete: 'Mario Rossi', frame: 1, time: 0.00, kneeAngle: 172.5, hipAngle: 168.0, ankleAngle: 88.5, trunkAngle: 12.0, angularVelocity: 0 },
                { athlete: 'Mario Rossi', frame: 15, time: 0.25, kneeAngle: 132.0, hipAngle: 128.5, ankleAngle: 78.0, trunkAngle: 25.4, angularVelocity: -162 },
                { athlete: 'Mario Rossi', frame: 30, time: 0.50, kneeAngle: 88.0, hipAngle: 84.2, ankleAngle: 68.5, trunkAngle: 38.0, angularVelocity: 4 },
                { athlete: 'Mario Rossi', frame: 45, time: 0.75, kneeAngle: 135.2, hipAngle: 131.0, ankleAngle: 79.5, trunkAngle: 24.1, angularVelocity: 188 },
                { athlete: 'Mario Rossi', frame: 60, time: 1.00, kneeAngle: 171.8, hipAngle: 167.5, ankleAngle: 88.0, trunkAngle: 12.5, angularVelocity: 15 }
            ]
        },

        // 6. JUMP_TEST - Vertical Jump Tests (SJ, CMJ, Drop Jump)
        JUMP_TEST: {
            id: 'JUMP_TEST',
            label: 'Test di Salto Verticale (SJ / CMJ / Drop Jump)',
            summary: 'Altezza salto, indici di forza reattiva (RSI) ed EUR',
            category: 'jumping',
            defaultExercise: 'CMJ',
            primaryMetric: 'jumpHeight',
            secondaryMetric: 'rsi',
            requiresAthlete: true,
            requiresExercise: true,
            columns: [
                { key: 'athlete', label: 'Atleta', type: 'text', placeholder: 'Nome Atleta', default: 'Atleta', required: false },
                { key: 'exercise', label: 'Tipo Salto', type: 'text', placeholder: 'es. CMJ, SJ, DJ', default: 'CMJ', required: false },
                { key: 'jumpHeight', label: 'Altezza Salto', type: 'number', unit: 'cm', min: 5, max: 120, step: 0.1, placeholder: 'es. 38.5', required: true, default: 0 },
                { key: 'contactTime', label: 'Tempo Contatto', type: 'number', unit: 'ms', min: 50, max: 1000, step: 1, placeholder: 'es. 190', required: false, default: null },
                { key: 'dropHeight', label: 'Altezza Caduta', type: 'number', unit: 'cm', min: 0, max: 100, step: 5, placeholder: 'es. 30', required: false, default: null },
                { key: 'rsi', label: 'RSI (Indice Forza Reattiva)', type: 'number', unit: 'm/s', min: 0, max: 5.0, step: 0.01, placeholder: 'es. 2.05', required: false, default: null },
                { key: 'eur', label: 'EUR (CMJ/SJ Ratio)', type: 'number', unit: 'ratio', min: 0.5, max: 2.0, step: 0.01, placeholder: 'es. 1.12', required: false, default: null }
            ],
            headerAliases: {
                jumpHeight: ['altezza salto', 'jump height', 'altura salto', 'volo', 'h(cm)', 'h (cm)', 'jump_h', 'h_salto', 'altezza', 'height'],
                contactTime: ['tempo contatto', 'contact time', 'tiempo contacto', 'contatto', 'contact_time', 'tc (s)', 'tc(s)', 'tc (ms)', 'tc', 'ct'],
                dropHeight: ['altezza caduta', 'drop height', 'altura caida', 'caduta', 'drop_height', 'drop_h'],
                rsi: ['rsi', 'reactive strength index', 'indice forza reattiva', 'forza reattiva'],
                eur: ['eur', 'eccentric utilization ratio', 'ratio cmj/sj', 'eur ratio']
            },
            sampleData: [
                { athlete: 'Mario Rossi', exercise: 'SJ', jumpHeight: 34.2, contactTime: null, dropHeight: 0, rsi: null, eur: 1.00 },
                { athlete: 'Mario Rossi', exercise: 'CMJ', jumpHeight: 38.5, contactTime: null, dropHeight: 0, rsi: null, eur: 1.12 },
                { athlete: 'Mario Rossi', exercise: 'DJ 30cm', jumpHeight: 36.2, contactTime: 182, dropHeight: 30, rsi: 1.99, eur: null },
                { athlete: 'Mario Rossi', exercise: 'DJ 45cm', jumpHeight: 35.0, contactTime: 205, dropHeight: 45, rsi: 1.71, eur: null }
            ]
        },

        // 7. MEDICINE_BALL - Medicine Ball Throw (NEW TEST TYPE - Ballistic Kinematics)
        MEDICINE_BALL: {
            id: 'MEDICINE_BALL',
            label: 'Lancio Palla Medica (Cinematica Balistica & Potenza)',
            summary: 'Cinematica balistica, velocità di uscita, potenza media e picco (Sayers/Harman)',
            category: 'ballistics_power',
            defaultExercise: 'Seated Chest Pass',
            primaryMetric: 'exitVelocity',
            secondaryMetric: 'meanPower',
            requiresAthlete: true,
            requiresExercise: true,
            columns: [
                { key: 'athlete', label: 'Atleta', type: 'text', placeholder: 'Nome Atleta', default: 'Atleta', required: false },
                { key: 'exercise', label: 'Tipo Lancio', type: 'text', placeholder: 'es. Seated Chest Pass', default: 'Seated Chest Pass', required: false },
                { key: 'mass', label: 'Massa Palla', type: 'number', unit: 'kg', min: 0.5, max: 20.0, step: 0.5, placeholder: 'es. 3.0', required: true, default: 3.0 },
                { key: 'distance', label: 'Distanza Lancio', type: 'number', unit: 'm', min: 1.0, max: 40.0, step: 0.05, placeholder: 'es. 10.0', required: true, default: 10.0 },
                { key: 'flightTime', label: 'Tempo di Volo', type: 'number', unit: 's', min: 0.1, max: 5.0, step: 0.01, placeholder: 'Opzionale', required: false, default: null },
                { key: 'releaseAngle', label: 'Angolo Rilascio', type: 'number', unit: '°', min: 10, max: 80, step: 0.5, placeholder: '45° def', required: false, default: 45 },
                { key: 'releaseHeight', label: 'Altezza Rilascio', type: 'number', unit: 'm', min: 0, max: 2.5, step: 0.05, placeholder: '1.0m def', required: false, default: 1.0 },
                { key: 'pushDuration', label: 'Tempo Spinta', type: 'number', unit: 's', min: 0.05, max: 1.0, step: 0.01, placeholder: '0.18s def', required: false, default: 0.18 },
                { key: 'exitVelocity', label: 'Velocità Stimata (v0)', type: 'number', unit: 'm/s', readonly: true, step: 0.01, placeholder: 'Auto-calcolata', required: false, default: null },
                { key: 'meanPower', label: 'Potenza Media (Pmean)', type: 'number', unit: 'W', readonly: true, step: 1, placeholder: 'Auto-calcolata', required: false, default: null }
            ],
            headerAliases: {
                mass: ['massa', 'mass', 'peso palla', 'massa palla', 'palla medica', 'ball mass', 'ball weight', 'ball_mass', 'medball_kg', 'peso_palla', 'ball_wt', 'peso'],
                distance: ['distanza lancio', 'throw distance', 'distanza', 'distance', 'lancio (m)', 'dist (m)', 'gittata', 'range', 'dist'],
                flightTime: ['tempo volo', 'flight time', 'tempo di volo', 't_volo', 'flight_time', 't_flight', 'volo (s)'],
                releaseAngle: ['angolo rilascio', 'release angle', 'angolo di rilascio', 'launch angle', 'angle', 'angolo (°)', 'theta'],
                releaseHeight: ['altezza rilascio', 'release height', 'altezza di rilascio', 'h0', 'h_release', 'release_h'],
                pushDuration: ['tempo spinta', 'push time', 'push duration', 'durata spinta', 't_push', 't_spinta'],
                exitVelocity: ['velocita uscita', 'exit velocity', 'v0', 'launch velocity', 'velocita lancio', 'velocita stimata', 'v_exit'],
                meanPower: ['potenza media', 'mean power', 'p_mean', 'potenza stimata', 'pmean', 'potenza (w)']
            },
            sampleData: [
                { athlete: 'Mario Rossi', exercise: 'Seated Chest Pass', mass: 3.0, distance: 10.0, flightTime: null, releaseAngle: 45, releaseHeight: 1.0, pushDuration: 0.18, exitVelocity: 9.91, meanPower: 818 },
                { athlete: 'Mario Rossi', exercise: 'Seated Chest Pass', mass: 4.0, distance: 8.5, flightTime: null, releaseAngle: 45, releaseHeight: 1.0, pushDuration: 0.18, exitVelocity: 9.17, meanPower: 934 },
                { athlete: 'Mario Rossi', exercise: 'Overhead Backward', mass: 5.0, distance: 12.0, flightTime: 1.35, releaseAngle: 42, releaseHeight: 1.8, pushDuration: 0.20, exitVelocity: 10.74, meanPower: 1442 }
            ]
        },

        // 8. GENERAL_TABULAR - Fallback Tabular Structure
        GENERAL_TABULAR: {
            id: 'GENERAL_TABULAR',
            label: 'Dati Tabellari Grezzi',
            summary: 'Dati tabellari generici con rilevamento dinamico colonne',
            category: 'general',
            defaultExercise: 'Dati Generali',
            primaryMetric: 'col1',
            secondaryMetric: 'col2',
            requiresAthlete: true,
            requiresExercise: false,
            columns: [
                { key: 'athlete', label: 'Atleta', type: 'text', placeholder: 'Nome Atleta', default: 'Atleta', required: false },
                { key: 'exercise', label: 'Esercizio / Serie', type: 'text', placeholder: 'Attività', default: 'Serie 1', required: false },
                { key: 'col1', label: 'Valore 1', type: 'number', unit: '', min: null, max: null, step: 0.1, placeholder: 'es. 10.5', required: false, default: 0 },
                { key: 'col2', label: 'Valore 2', type: 'number', unit: '', min: null, max: null, step: 0.1, placeholder: 'es. 25.0', required: false, default: 0 },
                { key: 'col3', label: 'Valore 3', type: 'number', unit: '', min: null, max: null, step: 0.1, placeholder: 'es. 105.2', required: false, default: 0 },
                { key: 'col4', label: 'Note', type: 'text', unit: '', placeholder: 'Note coach', required: false, default: '' }
            ],
            headerAliases: {
                col1: ['valore 1', 'val1', 'var1', 'dato 1', 'col1', 'valore_1'],
                col2: ['valore 2', 'val2', 'var2', 'dato 2', 'col2', 'valore_2'],
                col3: ['valore 3', 'val3', 'var3', 'dato 3', 'col3', 'valore_3'],
                col4: ['note', 'notes', 'osservazioni', 'commenti', 'col4']
            },
            sampleData: [
                { athlete: 'Mario Rossi', exercise: 'Test Generale 1', col1: 10.5, col2: 25.0, col3: 105.2, col4: 'Prova standard' },
                { athlete: 'Mario Rossi', exercise: 'Test Generale 2', col1: 11.2, col2: 27.5, col3: 112.0, col4: 'Incremento positivo' },
                { athlete: 'Mario Rossi', exercise: 'Test Generale 3', col1: 12.0, col2: 30.0, col3: 118.5, col4: 'Massimo carico' }
            ]
        },

        // 9. PAP_ANALYSIS - Post-Activation Potentiation & Advanced Neuromuscular Profiling
        PAP_ANALYSIS: {
            id: 'PAP_ANALYSIS',
            label: 'Post-Activation Potentiation (Studio PAP & Profilo Neuromuscolare)',
            summary: 'Analisi PRE-POST, soglie MDC 95%, scomposizione RSI, inferenza e prescrizione coach',
            category: 'jumping',
            defaultExercise: 'Depth Jump 2x6',
            primaryMetric: 'rsi',
            secondaryMetric: 'jumpHeight',
            requiresAthlete: true,
            requiresExercise: true,
            columns: [
                { key: 'athlete', label: 'Atleta', type: 'text', placeholder: 'Nome Atleta', default: 'F. Azzolina', required: false },
                { key: 'exercise', label: 'Protocollo / Salto', type: 'text', placeholder: 'es. Depth Jump 2x6', default: 'Depth Jump 2x6', required: false },
                { key: 'jumpHeight', label: 'Altezza Salto', type: 'number', unit: 'cm', min: 5, max: 120, step: 0.1, placeholder: 'es. 44.2', required: true, default: 0 },
                { key: 'contactTime', label: 'Tempo Contatto', type: 'number', unit: 's', min: 0.05, max: 1.0, step: 0.001, placeholder: 'es. 0.142', required: false, default: null },
                { key: 'rsi', label: 'RSI (Forza Reattiva)', type: 'number', unit: 'm/s', min: 0, max: 5.0, step: 0.01, placeholder: 'es. 2.55', required: false, default: null },
                { key: 'flightTime', label: 'Tempo Volo', type: 'number', unit: 's', min: 0.1, max: 1.5, step: 0.001, placeholder: 'es. 0.600', required: false, default: null }
            ],
            headerAliases: {
                jumpHeight: ['altezza', 'altezza salto', 'jump height', 'altura', 'h (cm)', 'h(cm)'],
                contactTime: ['tempo contatto', 'contact time', 'tc', 'tc (s)', 'tc(s)', 'tc (ms)'],
                rsi: ['rsi', 'reactive strength index', 'reattivita', 'reattività'],
                flightTime: ['tempo volo', 'flight time', 'tf', 'tf (s)', 'tf(s)']
            },
            sampleData: [
                { athlete: 'F. Azzolina', exercise: 'Depth Jump 2x6', jumpHeight: 44.19, contactTime: 0.142, rsi: 2.55, flightTime: 0.600 },
                { athlete: 'G. Masut', exercise: '60 m dash', jumpHeight: 46.90, contactTime: 0.199, rsi: 2.27, flightTime: 0.618 }
            ]
        }
    };

    /**
     * TestRegistry Class
     */
    class RegistryManager {
        constructor() {
            this._schemas = {};
            // Initialize with deep clones of canonical schemas
            for (const key in INITIAL_SCHEMAS) {
                if (Object.prototype.hasOwnProperty.call(INITIAL_SCHEMAS, key)) {
                    this._schemas[key] = deepClone(INITIAL_SCHEMAS[key]);
                }
            }
        }

        /**
         * Normalizes testId string to standard uppercase key.
         * @param {string} testId
         * @returns {string}
         */
        _normalizeId(testId) {
            if (!testId || typeof testId !== 'string') return 'GENERAL_TABULAR';
            const clean = testId.trim().toUpperCase();
            return this._schemas[clean] ? clean : 'GENERAL_TABULAR';
        }

        /**
         * Registers or updates a test type schema.
         * @param {Object} testDefinition
         */
        register(testDefinition) {
            if (!testDefinition || typeof testDefinition !== 'object') {
                throw new Error('[TestRegistry.register] Il parametro testDefinition deve essere un oggetto valido.');
            }
            if (!testDefinition.id || typeof testDefinition.id !== 'string') {
                throw new Error('[TestRegistry.register] La definizione del test deve contenere una proprietà "id" stringa non vuota.');
            }
            if (!testDefinition.label || typeof testDefinition.label !== 'string') {
                throw new Error('[TestRegistry.register] La definizione del test deve contenere una proprietà "label".');
            }
            if (!Array.isArray(testDefinition.columns) || testDefinition.columns.length === 0) {
                throw new Error('[TestRegistry.register] La definizione del test deve contenere un array "columns" con almeno una colonna.');
            }

            const id = testDefinition.id.trim().toUpperCase();
            this._schemas[id] = deepClone(testDefinition);
            this._schemas[id].id = id;
        }

        /**
         * Checks whether a testId is registered.
         * @param {string} testId
         * @returns {boolean}
         */
        has(testId) {
            if (!testId || typeof testId !== 'string') return false;
            return Object.prototype.hasOwnProperty.call(this._schemas, testId.trim().toUpperCase());
        }

        /**
         * Retrieves the schema for a test type.
         * Falls back gracefully to GENERAL_TABULAR if testId is not registered.
         * Returns a defensive deep clone to prevent mutation.
         * @param {string} testId
         * @returns {Object}
         */
        get(testId) {
            const key = this._normalizeId(testId);
            return deepClone(this._schemas[key]);
        }

        /**
         * Returns all registered test schemas as a dictionary of deep clones.
         * @returns {Object}
         */
        getAll() {
            return deepClone(this._schemas);
        }

        /**
         * Returns the list of metadata for all registered test types (for UI selectors).
         * @returns {Array<{ id: string, label: string, summary: string, category: string }>}
         */
        getTypes() {
            return Object.values(this._schemas).map(s => ({
                id: s.id,
                label: s.label,
                summary: s.summary || '',
                category: s.category || 'general'
            }));
        }

        /**
         * Returns deep clone of columns for the specified testId.
         * @param {string} testId
         * @returns {Array<Object>}
         */
        getColumnsFor(testId) {
            const schema = this.get(testId);
            return deepClone(schema.columns || []);
        }

        /**
         * Returns deep clone of sample data rows for the specified testId.
         * @param {string} testId
         * @returns {Array<Object>}
         */
        getSampleDataFor(testId) {
            const schema = this.get(testId);
            return deepClone(schema.sampleData || []);
        }

        /**
         * Maps an array of raw column headers to standard internal keys.
         * Prioritizes schema-specific aliases, then generic headers.
         * @param {Array<string>} headers Raw headers from file
         * @param {string} [testId] Optional testId to prioritize
         * @returns {Object} { [columnIndex]: internalKey }
         */
        mapRawHeaders(headers, testId) {
            if (!Array.isArray(headers)) return {};
            const colMap = {};
            const schema = testId ? this.get(testId) : null;
            const aliases = (schema && schema.headerAliases) ? schema.headerAliases : {};

            // Common global header rules (athlete, exercise, date, session, etc.)
            headers.forEach((header, idx) => {
                if (header === null || header === undefined) return;
                const lower = String(header).toLowerCase().trim();
                if (!lower) return;

                // 1. Check schema-specific aliases first
                let matched = false;
                for (const internalKey in aliases) {
                    const aliasList = aliases[internalKey];
                    if (Array.isArray(aliasList)) {
                        for (let i = 0; i < aliasList.length; i++) {
                            const alias = aliasList[i].toLowerCase();
                            if (lower === alias || lower.includes(alias)) {
                                colMap[idx] = internalKey;
                                matched = true;
                                break;
                            }
                        }
                    }
                    if (matched) break;
                }
                if (matched) return;

                // 2. Global common matches
                if (['athlete', 'atleta', 'nome', 'cognome', 'usuario', 'name', 'user'].some(k => lower === k || lower.includes(k)) &&
                    !lower.includes('exercise') && !lower.includes('esercizio') && !lower.includes('id')) {
                    colMap[idx] = 'athlete';
                } else if (['exercise', 'esercizio', 'ejercicio', 'attività', 'test', 'lift', 'drill'].some(k => lower === k || lower.includes(k)) &&
                    !lower.includes('id')) {
                    colMap[idx] = 'exercise';
                } else if (lower.includes('data') || lower.includes('date') || lower.includes('timestamp')) {
                    colMap[idx] = 'date';
                }
            });

            return colMap;
        }

        /**
         * Validates and sanitizes a record against the column definitions of the given test type.
         * Ensures zero NaN and zero undefined in sanitized output.
         * @param {Object} record
         * @param {string} testId
         * @returns {{ valid: boolean, errors: Array<string>, sanitized: Object }}
         */
        validateRecord(record, testId) {
            const schema = this.get(testId);
            const columns = schema.columns || [];
            const errors = [];
            const sanitized = {};

            if (!record || typeof record !== 'object') {
                return {
                    valid: false,
                    errors: ['Il record fornito non è un oggetto valido.'],
                    sanitized: this.createDefaultRecord(testId)
                };
            }

            columns.forEach(col => {
                const key = col.key;
                const rawVal = record[key];

                if (col.type === 'number') {
                    const num = sanitizeNumber(rawVal, col.min !== undefined ? col.min : null, col.max !== undefined ? col.max : null, null);
                    if (num === null) {
                        if (col.required) {
                            errors.push(`Campo obbligatorio "${col.label}" mancante o non numerico.`);
                        }
                        sanitized[key] = col.default !== undefined ? col.default : null;
                    } else {
                        sanitized[key] = num;
                    }
                } else {
                    // String / text field
                    if (rawVal === null || rawVal === undefined || String(rawVal).trim() === '') {
                        if (col.required) {
                            errors.push(`Campo obbligatorio "${col.label}" mancante.`);
                        }
                        sanitized[key] = col.default !== undefined ? col.default : '';
                    } else {
                        sanitized[key] = String(rawVal).trim();
                    }
                }
            });

            // Preserve extra metadata if present
            if (record.id !== undefined) sanitized.id = record.id;
            if (record.date !== undefined) sanitized.date = record.date;
            if (record.notes !== undefined) sanitized.notes = record.notes;

            return {
                valid: errors.length === 0,
                errors,
                sanitized
            };
        }

        /**
         * Creates a default empty/template record row for the specified test type.
         * @param {string} testId
         * @param {Object} [overrides] Optional property overrides
         * @returns {Object}
         */
        createDefaultRecord(testId, overrides = {}) {
            const schema = this.get(testId);
            const record = {};
            (schema.columns || []).forEach(col => {
                if (col.default !== undefined) {
                    record[col.key] = col.default;
                } else if (col.type === 'number') {
                    record[col.key] = col.required ? 0 : null;
                } else {
                    record[col.key] = '';
                }
            });
            if (overrides && typeof overrides === 'object') {
                Object.assign(record, overrides);
            }
            return record;
        }
    }

    // Singleton instance
    const TestRegistryInstance = new RegistryManager();

    // Export pattern: Browser & Node.js CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TestRegistryInstance;
    }
    if (typeof window !== 'undefined') {
        window.TestRegistry = TestRegistryInstance;
    }
    if (typeof global !== 'undefined') {
        global.TestRegistry = TestRegistryInstance;
    }

})();
