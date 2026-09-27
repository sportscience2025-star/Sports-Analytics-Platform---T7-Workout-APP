/**
 * tests/test_reviewer_adversarial.js
 * Comprehensive Adversarial Test Suite for js/parser modularization.
 * Tests edge cases, null/undefined inputs, boundary conditions, and contract compliance.
 */

const fs = require('fs');
const path = require('path');

// Setup environment
delete global.window;
eval(fs.readFileSync(path.join(__dirname, '../js/parser.js'), 'utf8'));
const DP = global.window.DataParser;

let errors = [];
let passCount = 0;

function check(desc, fn) {
    try {
        fn();
        passCount++;
    } catch (e) {
        errors.push(desc + ': ' + e.message);
    }
}

// 1. Exercise Dict & Normalization
check('normalizeExercise null/empty/undefined', () => {
    if (DP.normalizeExercise(null) !== 'Sconosciuto') throw new Error('null failed');
    if (DP.normalizeExercise(undefined) !== 'Sconosciuto') throw new Error('undefined failed');
    if (DP.normalizeExercise('') !== 'Sconosciuto') throw new Error('empty failed');
    if (DP.normalizeExercise('   ') !== 'Sconosciuto') throw new Error('whitespace failed');
});

check('normalizeExercise multilingual mappings', () => {
    if (DP.normalizeExercise('sentadilla frontal') !== 'Front Squat') throw new Error('Front squat ES');
    if (DP.normalizeExercise('bench press') !== 'Panca Piana') throw new Error('bench press EN');
    if (DP.normalizeExercise('stacco da terra') !== 'Stacco') throw new Error('stacco IT');
    if (DP.normalizeExercise('salto con contromovimento') !== 'CMJ') throw new Error('CMJ IT');
    if (DP.normalizeExercise('hip thrust') !== 'Hip Thrust') throw new Error('hip thrust');
    if (DP.normalizeExercise('trap bar deadlift') !== 'Trap Bar Deadlift') throw new Error('trap bar');
    if (DP.normalizeExercise('unlisted exercise') !== 'Unlisted exercise') throw new Error('Title case fallback');
});

// 2. Athlete Resolver
check('isGenericAthlete edge cases', () => {
    if (!DP.isGenericAthlete(null)) throw new Error('null');
    if (!DP.isGenericAthlete(undefined)) throw new Error('undefined');
    if (!DP.isGenericAthlete('')) throw new Error('empty');
    if (!DP.isGenericAthlete('   ')) throw new Error('spaces');
    if (!DP.isGenericAthlete('Sconosciuto')) throw new Error('Sconosciuto');
    if (!DP.isGenericAthlete('atleta')) throw new Error('atleta');
    if (!DP.isGenericAthlete('encoder')) throw new Error('encoder');
    if (DP.isGenericAthlete('Mario Rossi')) throw new Error('Mario Rossi false positive');
});

check('isEncodedId & extractReadableName', () => {
    if (!DP.isEncodedId('encoder_Mario_393636313639')) throw new Error('encoder_Mario_393636313639');
    if (!DP.isEncodedId('device-Luca-445566')) throw new Error('device-Luca-445566');
    if (DP.isEncodedId('Mario Rossi')) throw new Error('Mario Rossi false positive');
    if (DP.isEncodedId('')) throw new Error('empty string');
    if (DP.isEncodedId(null)) throw new Error('null');

    if (DP.extractReadableName('encoder_Mario_393636313639') !== 'Mario') throw new Error('extract Mario');
    if (DP.extractReadableName('sensor_Luca_Verdi_9988') !== 'Luca Verdi') throw new Error('extract Luca Verdi');
    if (DP.extractReadableName(null) !== 'Atleta') throw new Error('null fallback');
    if (DP.extractReadableName('') !== 'Atleta') throw new Error('empty fallback');
    if (DP.extractReadableName('encoder_unknown_123') !== 'Atleta') throw new Error('generic inner name fallback');
});

check('extractAthleteFromFilename', () => {
    if (DP.extractAthleteFromFilename('Mario_Rossi_vbt_2026-06-15.xlsx') !== 'Mario Rossi') throw new Error('filename Mario Rossi');
    if (DP.extractAthleteFromFilename('Luca-Verdi-export-raw-data.csv') !== 'Luca Verdi') throw new Error('filename Luca Verdi');
    if (DP.extractAthleteFromFilename('2026-06-15_12345.xlsx') !== null) throw new Error('numbers only');
    if (DP.extractAthleteFromFilename('vbt_test_session_20260615.xlsx') !== null) throw new Error('noise words only');
    if (DP.extractAthleteFromFilename(null) !== null) throw new Error('null filename');
});

// 3. Load Aggregator
check('aggregateByLoad empty & no repeats', () => {
    const resEmpty = DP.aggregateByLoad([]);
    if (resEmpty.originalN !== 0 || resEmpty.wasAggregated !== false) throw new Error('empty array');

    const single = [{ athlete: 'A', exercise: 'Squat', load: 100, velocity: 0.50 }];
    const resSingle = DP.aggregateByLoad(single);
    if (resSingle.wasAggregated !== false || resSingle.aggregated.length !== 1) throw new Error('single item');
});

check('aggregateByLoad IQR outlier removal (n >= 4)', () => {
    const reps = [
        { athlete: 'A', exercise: 'Squat', load: 100, velocity: 0.50 },
        { athlete: 'A', exercise: 'Squat', load: 100, velocity: 0.51 },
        { athlete: 'A', exercise: 'Squat', load: 100, velocity: 0.49 },
        { athlete: 'A', exercise: 'Squat', load: 100, velocity: 2.80 } // extreme outlier
    ];
    const resAgg = DP.aggregateByLoad(reps);
    if (!resAgg.wasAggregated) throw new Error('wasAggregated false');
    if (resAgg.aggregated.length !== 1) throw new Error('aggregated length !== 1');
    if (resAgg.aggregated[0].velocity > 0.60) throw new Error('IQQ outlier not filtered, velocity=' + resAgg.aggregated[0].velocity);
});

check('aggregateByLoad non-VBT preservation', () => {
    const mixed = [
        { athlete: 'A', exercise: 'CMJ', jumpHeight: 40, load: null, velocity: null },
        { athlete: 'A', exercise: 'Squat', load: 80, velocity: 0.7 },
        { athlete: 'A', exercise: 'Squat', load: 80, velocity: 0.72 }
    ];
    const resMixed = DP.aggregateByLoad(mixed);
    if (resMixed.aggregated.length !== 2) throw new Error('length expected 2, got ' + resMixed.aggregated.length);
    const cmj = resMixed.aggregated.find(r => r.exercise === 'CMJ');
    if (!cmj || cmj.jumpHeight !== 40) throw new Error('CMJ was lost or corrupted');
});

// 4. Header Mapper
check('readCSVRows delimiters & decimal formats', () => {
    const csvSemicolon = 'Data;Carico;Velocita;Atleta\n2026-06-15;80;0,55;Mario Rossi\n2026-06-15;90;0,45;Mario Rossi';
    const rowsSemi = DP._readCSVRows(csvSemicolon);
    if (rowsSemi.length !== 3) throw new Error('semicolon rows length');
    if (rowsSemi[1][1] !== 80 || rowsSemi[1][2] !== 0.55) throw new Error('comma decimal parsing: ' + JSON.stringify(rowsSemi[1]));

    const tsv = 'Data\tCarico\tVelocita\n2026-06-15\t80\t0.55';
    const rowsTsv = DP._readCSVRows(tsv);
    if (rowsTsv.length !== 2 || rowsTsv[1][1] !== 80) throw new Error('tsv parsing');
});

check('mapHeaders precedence on all 29 families', () => {
    const headers = [
        'session_id', 'id_ejercicio', 'user_id', 'device_id', 'atleta', 'data',
        'altezza rilascio', 'tempo di volo', 'angolo rilascio', 'peso palla', 'distanza lancio',
        'velocita stimata', 'potenza stimata', 'drop height', 'jump height', 'tempo contatto',
        'fmax', 'fmean', 'forza sx', 'forza dx', 'asymmetry', 'rfd', 'impulso', 'rsimod',
        'fz', 'tempo reazione', 'durata spinta', 'accel orizzontale', 'accel risultante',
        'accel x', 'split 5m', 'split 10m', 'split 20m', 'split 30m', 'split 60m',
        'angolo ginocchio', 'angolo anca', 'angolo caviglia', 'angolo tronco', 'angolo',
        'velocita angolare', 'frame', 'coord x', 'coord y', 'velocita lineare',
        'vmax', 'vmp', 'potencia', 'rom', 'fatiga', '% 1rm', '1rm', 'exercise', 'carga', 'vm',
        'distanza', 'tempo', 'ritmo', 'rsi', 'eur'
    ];
    const mapped = DP._mapHeaders(headers);

    const expectedMappings = {
        0: 'sessionId', 1: 'exerciseId', 2: 'athleteRawId', 3: 'deviceId', 4: 'athlete', 5: 'date',
        6: 'releaseHeight', 7: 'flightTime', 8: 'releaseAngle', 9: 'ballMass', 10: 'throwDistance',
        11: 'exitVelocity', 12: 'power', 13: 'dropHeight', 14: 'jumpHeight', 15: 'contactTime',
        16: 'peakForce', 17: 'meanForce', 18: 'leftForce', 19: 'rightForce', 20: 'asymmetry',
        21: 'rfd', 22: 'impulse', 23: 'rsimod', 24: 'forceZ', 25: 'reactionTime',
        26: 'pushDuration', 27: 'horizontalAccel', 28: 'resultantAccel', 29: 'accelX',
        30: 'split_5m', 31: 'split_10m', 32: 'split_20m', 33: 'split_30m', 34: 'split_60m',
        35: 'kneeAngle', 36: 'hipAngle', 37: 'ankleAngle', 38: 'trunkAngle', 39: 'jointAngle',
        40: 'angularVelocity', 41: 'frame', 42: 'coordX', 43: 'coordY', 44: 'linearVelocity',
        45: 'peakVelocity', 46: 'propulsiveVelocity', 47: 'power', 48: 'rom', 49: 'fatigue',
        50: 'percentOneRm', 51: 'oneRm', 52: 'exercise', 53: 'load', 54: 'velocity',
        55: 'distance', 56: 'time', 57: 'pace', 58: 'rsi', 59: 'eur'
    };

    for (const [idx, expected] of Object.entries(expectedMappings)) {
        if (mapped[idx] !== expected) {
            throw new Error('Index ' + idx + ' (' + headers[idx] + '): expected ' + expected + ', got ' + mapped[idx]);
        }
    }
});

// 5. Instrument Detector
check('detectInstrumentType all 8 categories', () => {
    if (DP.detectInstrumentType([{ load: 80, velocity: 0.55 }], ['Load', 'Velocity']).type !== 'VBT') throw new Error('VBT');
    if (DP.detectInstrumentType([{ forceZ: 1500, peakForce: 2200 }], ['Fz', 'Peak Force']).type !== 'FORCE_PLATE') throw new Error('FORCE_PLATE');
    if (DP.detectInstrumentType([{ horizontalAccel: 8.5, pushDuration: 0.35 }], ['AccelH', 'Push Time']).type !== 'BLOCK_ACCEL') throw new Error('BLOCK_ACCEL');
    if (DP.detectInstrumentType([{ split_10m: 1.85, split_30m: 4.10 }], ['10m', '30m']).type !== 'SPRINT_TIMING') throw new Error('SPRINT_TIMING');
    if (DP.detectInstrumentType([{ ballMass: 3, throwDistance: 10 }], ['Peso Palla', 'Distanza Lancio']).type !== 'MEDICINE_BALL') throw new Error('MEDICINE_BALL');
    if (DP.detectInstrumentType([{ kneeAngle: 95, hipAngle: 80 }], ['Knee Angle', 'Hip Angle']).type !== 'VIDEO_KINEMATICS') throw new Error('VIDEO_KINEMATICS');
    if (DP.detectInstrumentType([{ jumpHeight: 45, contactTime: 0.2 }], ['Jump Height', 'Contact Time']).type !== 'JUMP_TEST') throw new Error('JUMP_TEST');
    if (DP.detectInstrumentType([], []).type !== 'GENERAL_TABULAR') throw new Error('GENERAL_TABULAR');
});

// 6. File Readers text parsing
check('extractPairsFromText & parseTextData', () => {
    const rawPairs = DP._extractPairsFromText('80kg 0.55ms\n90kg 0.45m/s\n100kg 0.35m/s\n');
    if (rawPairs.length !== 3) throw new Error('pairs count <x>');
    if (rawPairs[0].load !== 80 || rawPairs[0].velocity !== 0.55) throw new Error('pairs 0');

    const textData = DP._parseTextData('Atleta: Mario Rossi\nEsercizio: Squat\nData: 2026-06-15\n80kg 0.55m/s\n90kg 0.45m/s');
    if (textData.athletes[0] !== 'Mario Rossi') throw new Error('athlete');
    if (textData.exercises[0] !== 'Squat') throw new Error('exercise');
    if (textData.rawData.length !== 2) throw new Error('rawData length');
});

// 7. Round 3 Adversarial Discoveries & Regression Protections
check('Round 3: aggregateByLoad string numbers & null athlete sort', () => {
    // String numbers shouldn't evaluate to NaN
    const stringReps = [
        { athlete: 'A', exercise: 'Squat', load: '80', velocity: '0.50' },
        { athlete: 'A', exercise: 'Squat', load: '80', velocity: '0.52' }
    ];
    const resString = DP.aggregateByLoad(stringReps);
    if (isNaN(resString.aggregated[0].velocity)) throw new Error('string velocities resulted in NaN');
    if (Math.abs(resString.aggregated[0].velocity - 0.51) > 0.001) throw new Error('mean velocity incorrect: ' + resString.aggregated[0].velocity);

    // Null athlete or exercise sort safety
    const nullReps = [
        { athlete: 'Zeta', exercise: 'Squat', load: 80, velocity: 0.50 },
        { athlete: 'Zeta', exercise: 'Squat', load: 80, velocity: 0.52 },
        { athlete: null, exercise: 'Squat', load: 80, velocity: 0.54 },
        { athlete: null, exercise: 'Squat', load: 80, velocity: 0.56 }
    ];
    const resNull = DP.aggregateByLoad(nullReps);
    if (!resNull.wasAggregated || resNull.aggregated.length !== 2) throw new Error('null athlete sort crashed or miscounted');
});

check('Round 3: mapHeaders and readCSVRows boundary robustness', () => {
    if (typeof DP._mapHeaders(null) !== 'object' || Object.keys(DP._mapHeaders(null)).length !== 0) throw new Error('mapHeaders(null)');
    if (typeof DP._mapHeaders(undefined) !== 'object') throw new Error('mapHeaders(undefined)');
    if (typeof DP._mapHeaders(123) !== 'object') throw new Error('mapHeaders(123)');

    if (!Array.isArray(DP._readCSVRows(null)) || DP._readCSVRows(null).length !== 0) throw new Error('readCSVRows(null)');
    if (!Array.isArray(DP._readCSVRows(undefined)) || DP._readCSVRows(undefined).length !== 0) throw new Error('readCSVRows(undefined)');

    // Text cells starting with numbers must NOT be truncated into numbers
    const mixedCSV = 'Athlete,Exercise,Notes\nMario,3D Motion,10 reps done';
    const parsedRows = DP._readCSVRows(mixedCSV);
    if (parsedRows[1][1] !== '3D Motion') throw new Error('Alphanumeric cell 3D Motion was mangled: ' + parsedRows[1][1]);
    if (parsedRows[1][2] !== '10 reps done') throw new Error('Alphanumeric cell 10 reps done was mangled: ' + parsedRows[1][2]);
});

check('Round 3: detectInstrumentType null records safety', () => {
    const resNull = DP.detectInstrumentType(null, null);
    if (resNull.type !== 'GENERAL_TABULAR') throw new Error('detectInstrumentType(null, null) should return GENERAL_TABULAR');
    const resUndefined = DP.detectInstrumentType(undefined, undefined);
    if (resUndefined.type !== 'GENERAL_TABULAR') throw new Error('detectInstrumentType(undefined, undefined) should return GENERAL_TABULAR');
});

check('Round 3: extractAthleteFromFilename numeric and generic filtering', () => {
    if (DP.extractAthleteFromFilename('2026-06-15_12_34.xlsx') !== null) throw new Error('numeric space tokens returned non-null');
    if (DP.extractAthleteFromFilename('vbt_backup_atleta.xlsx') !== null) throw new Error('generic atleta returned non-null');
    if (DP.extractAthleteFromFilename('9999_8888.csv') !== null) throw new Error('pure numbers returned non-null');
});

check('Round 3: text parsers non-string type safety', () => {
    if (DP._extractPairsFromText(null).length !== 0) throw new Error('_extractPairsFromText(null)');
    if (DP._extractPairsFromText(undefined).length !== 0) throw new Error('_extractPairsFromText(undefined)');
    if (DP._extractPairsFromText(12345).length !== 0) throw new Error('_extractPairsFromText(number)');

    if (DP._parseTextData(null).rawData.length !== 0) throw new Error('_parseTextData(null)');
    if (DP._parseTextData(undefined).rawData.length !== 0) throw new Error('_parseTextData(undefined)');
    if (DP._parseTextData(12345).rawData.length !== 0) throw new Error('_parseTextData(number)');
});

check('Round 3: file readers null input rejection', async () => {
    let pExcelFailed = false, pPdfFailed = false, pOcrFailed = false;
    try { await DP.parseExcel(null); } catch (e) { pExcelFailed = true; }
    try { await DP.parsePDF(null); } catch (e) { pPdfFailed = true; }
    try { await DP.parseImageOCR(null); } catch (e) { pOcrFailed = true; }
    if (!pExcelFailed) throw new Error('parseExcel(null) did not reject');
    if (!pPdfFailed) throw new Error('parsePDF(null) did not reject');
    if (!pOcrFailed) throw new Error('parseImageOCR(null) did not reject');
});

check('Round 3: public static aliases on DataParser', () => {
    if (typeof DP.readCSVRows !== 'function') throw new Error('DP.readCSVRows missing');
    if (typeof DP.mapHeaders !== 'function') throw new Error('DP.mapHeaders missing');
    if (typeof DP.parseTextData !== 'function') throw new Error('DP.parseTextData missing');
    if (typeof DP.extractPairsFromText !== 'function') throw new Error('DP.extractPairsFromText missing');

    const mapped = DP.mapHeaders(['Carico', 'Velocita']);
    if (mapped[0] !== 'load' || mapped[1] !== 'velocity') throw new Error('DP.mapHeaders output');
});

console.log('\n=== Adversarial Verification Results: ' + passCount + ' passed, ' + errors.length + ' failed ===');
if (errors.length > 0) {
    console.error('FAILURES:', errors);
    process.exit(1);
} else {
    console.log('ALL ADVERSARIAL CHECKS PASSED');
    process.exit(0);
}
