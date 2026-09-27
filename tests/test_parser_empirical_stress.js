/**
 * test_parser_empirical_stress.js
 * Adversarial Empirical Test Harness for js/parser.js
 * 
 * Executed by Challenger M1-2:
 * 1. False-positive prevention across all instruments
 * 2. Medicine Ball edge-cases (minimal, full, mixed case, extra whitespace, IT/EN)
 * 3. Repeated trials data integrity (identical ball weights not merged by aggregateByLoad)
 * 4. Header collision avoidance (Tempo di Volo vs jumpHeight, Angolo Rilascio vs VIDEO_KINEMATICS)
 * 5. Robustness against malformed/adversarial inputs
 */

const fs = require('fs');
const path = require('path');

// Setup Node / Browser compatibility environment
global.window = global;
global.window.window = global;

// Mock FileReader
class MockFileReader {
    readAsArrayBuffer(file) {
        setTimeout(() => {
            if (this.onload) {
                let buf;
                if (file instanceof Uint8Array || (typeof Buffer !== 'undefined' && Buffer.isBuffer(file))) {
                    buf = file;
                } else if (typeof file === 'string') {
                    buf = Buffer.from(file, 'utf-8');
                } else {
                    buf = new Uint8Array(0);
                }
                this.onload({ target: { result: new Uint8Array(buf).buffer } });
            }
        }, 0);
    }
}
global.FileReader = MockFileReader;

// Mock SheetJS (XLSX)
const MockXLSX = {
    read: (data, options) => {
        let str = '';
        if (typeof Buffer !== 'undefined' && Buffer.isBuffer(data)) {
            str = data.toString('utf-8');
        } else if (data instanceof Uint8Array || data instanceof ArrayBuffer) {
            str = new TextDecoder('utf-8').decode(data);
        } else {
            str = String(data);
        }

        // Support JSON structure mock if passed
        try {
            const parsed = JSON.parse(str);
            if (parsed && parsed.sheets) {
                return {
                    SheetNames: Object.keys(parsed.sheets),
                    Sheets: parsed.sheets
                };
            }
        } catch (e) {}

        // CSV parsing fallback
        const lines = str.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const delim = str.includes(';') && (str.match(/;/g) || []).length >= (str.match(/,/g) || []).length ? ';' : ',';
        const rows = lines.map(line => line.split(delim).map(c => {
            const trimmed = c.trim().replace(/^["']|["']$/g, '');
            if (trimmed === '') return null;
            if (/^\d{4}[-/.]\d{2}[-/.]\d{2}$/.test(trimmed)) return trimmed;
            const num = parseFloat(trimmed.replace(',', '.'));
            return isNaN(num) ? trimmed : num;
        }));

        return {
            SheetNames: ['Sheet1'],
            Sheets: { 'Sheet1': rows }
        };
    },
    utils: {
        sheet_to_json: (sheet) => sheet
    }
};
global.window.XLSX = MockXLSX;
global.XLSX = MockXLSX;

// Physics engine specification oracle for Medicine Ball
global.window.MedicineBallPhysics = {
    calculate: (input) => {
        const mass = Number(input.mass);
        const distance = Number(input.distance);
        const g = 9.81;
        const releaseAngle = (input.releaseAngle !== undefined && !isNaN(Number(input.releaseAngle))) ? Number(input.releaseAngle) : 45.0;
        const releaseHeight = (input.releaseHeight !== undefined && !isNaN(Number(input.releaseHeight))) ? Number(input.releaseHeight) : 1.0;
        const pushDuration = (input.pushDuration !== undefined && !isNaN(Number(input.pushDuration)) && Number(input.pushDuration) > 0) ? Number(input.pushDuration) : 0.18;

        if (isNaN(mass) || mass <= 0 || isNaN(distance) || distance <= 0) {
            return { valid: false, exitVelocity: 0, meanPower: 0, peakPower: 0 };
        }
        if (releaseAngle <= 0 || releaseAngle >= 90) {
            return { valid: false, exitVelocity: 0, meanPower: 0, peakPower: 0 };
        }

        const rad = (releaseAngle * Math.PI) / 180;
        const cos = Math.cos(rad);
        const tan = Math.tan(rad);

        let v0;
        if (input.flightTime && Number(input.flightTime) > 0) {
            // From flight time: vx = d / t_flight, v0 = vx / cos(theta)
            const vx = distance / Number(input.flightTime);
            v0 = vx / cos;
        } else if (input.releaseHeight === 0 || input.releaseHeight === undefined) {
            v0 = Math.sqrt((g * distance) / Math.sin(2 * rad));
        } else {
            const denom = 2 * (releaseHeight + distance * tan);
            if (denom <= 0) return { valid: false, exitVelocity: 0, meanPower: 0, peakPower: 0 };
            v0 = (distance / cos) * Math.sqrt(g / denom);
        }

        const work = 0.5 * mass * Math.pow(v0, 2);
        const pMean = work / pushDuration;
        const pPeak = 2 * pMean;

        return {
            valid: true,
            exitVelocity: parseFloat(v0.toFixed(2)),
            meanPower: parseFloat(pMean.toFixed(1)),
            peakPower: parseFloat(pPeak.toFixed(1))
        };
    }
};

// Load js/parser.js
const parserPath = path.join(__dirname, '..', 'js', 'parser.js');
const parserCode = fs.readFileSync(parserPath, 'utf8');
eval(parserCode);
const DataParser = global.window.DataParser;

// Test Runner Framework
let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;
const failureDetails = [];

function assert(condition, message, details = '') {
    totalAssertions++;
    if (condition) {
        passedAssertions++;
        console.log(`  [PASS] ${message}`);
    } else {
        failedAssertions++;
        console.error(`  [FAIL] ${message} ${details ? `(${details})` : ''}`);
        failureDetails.push({ message, details });
    }
}

async function parseRows(rows, filename = 'test.xlsx') {
    const buffer = Buffer.from(JSON.stringify({ sheets: { 'Sheet1': rows } }), 'utf-8');
    buffer.name = filename;
    return await DataParser.parseExcel(buffer);
}

async function parseCsvText(csvText, filename = 'test.csv') {
    const buffer = Buffer.from(csvText, 'utf-8');
    buffer.name = filename;
    return await DataParser.parseExcel(buffer);
}

// ============================================================================
// SUITE 1: FALSE-POSITIVE PREVENTION (Cross-Instrument Discrimination)
// ============================================================================
async function runSuite1() {
    console.log('\n=============================================================');
    console.log('SUITE 1: FALSE-POSITIVE PREVENTION (Cross-Instrument Discrimination)');
    console.log('=============================================================');

    // 1.1 VBT
    {
        const vbtRows = [
            ["Atleta", "Esercizio", "Carico", "Velocità", "Picco Velocità", "Potenza", "ROM"],
            ["Marco", "Squat", 60, 0.95, 1.35, 558, 48],
            ["Marco", "Squat", 80, 0.78, 1.12, 612, 49],
            ["Marco", "Squat", 100, 0.58, 0.88, 568, 47]
        ];
        const res = await parseRows(vbtRows, 'vbt_session.xlsx');
        assert(res.instrumentType === 'VBT', `VBT must be detected as VBT (Got: ${res.instrumentType})`);
        assert(res.instrumentType !== 'MEDICINE_BALL', `VBT must NOT be detected as MEDICINE_BALL`);
        assert(res.rawData.length === 3, `VBT retains all 3 load points`);
    }

    // 1.2 Force Plate
    {
        const fpRows = [
            ["Atleta", "Time", "Fz", "Picco di Forza", "RFD", "Impulso", "RSI-mod"],
            ["Luca", 0.1, 1850, 2450, 8500, 310, 0.45],
            ["Luca", 0.2, 1920, 2520, 8900, 325, 0.48]
        ];
        const res = await parseRows(fpRows, 'force_plate.xlsx');
        assert(res.instrumentType === 'FORCE_PLATE', `Force Plate must be detected as FORCE_PLATE (Got: ${res.instrumentType})`);
        assert(res.instrumentType !== 'MEDICINE_BALL', `Force Plate must NOT be detected as MEDICINE_BALL`);
    }

    // 1.3 Force Plate Dual (Asymmetry)
    {
        const fpDual = [
            ["Atleta", "Fz", "Fz Left", "Fz Right", "Asimmetria"],
            ["Luca", 1850, 920, 930, 1.1],
            ["Luca", 1920, 950, 970, 2.1]
        ];
        const res = await parseRows(fpDual, 'hawkin_dual.xlsx');
        assert(res.instrumentType === 'FORCE_PLATE', `Force Plate Dual must be detected as FORCE_PLATE (Got: ${res.instrumentType})`);
        assert(res.instrumentType !== 'MEDICINE_BALL', `Force Plate Dual must NOT be detected as MEDICINE_BALL`);
    }

    // 1.4 Jump Test (Optojump with Tempo di Volo!)
    {
        const jumpRows = [
            ["Atleta", "Esercizio", "Altezza Salto", "Tempo di Volo", "Tempo Contatto", "RSI"],
            ["Giovanni", "CMJ", 38.5, 0.56, 195, 1.97],
            ["Giovanni", "SJ", 32.1, 0.51, null, null]
        ];
        const res = await parseRows(jumpRows, 'optojump_export.xlsx');
        assert(res.instrumentType === 'JUMP_TEST', `Optojump jump test with 'Tempo di Volo' must be detected as JUMP_TEST (Got: ${res.instrumentType})`);
        assert(res.instrumentType !== 'MEDICINE_BALL', `Optojump jump test must NOT be misclassified as MEDICINE_BALL`);
        assert(res.rawData[0].jumpHeight === 38.5, `jumpHeight mapped correctly (38.5)`);
        assert(res.rawData[0].flightTime === 0.56, `flightTime mapped to flightTime (0.56)`);
    }

    // 1.5 Jump Test (Drop Jump with drop height)
    {
        const djRows = [
            ["Atleta", "Esercizio", "Altezza Caduta", "Altezza Salto", "Tempo Contatto"],
            ["Giovanni", "DJ", 30, 34.2, 180],
            ["Giovanni", "DJ", 40, 32.0, 195]
        ];
        const res = await parseRows(djRows, 'drop_jump.xlsx');
        assert(res.instrumentType === 'JUMP_TEST', `Drop jump must be detected as JUMP_TEST (Got: ${res.instrumentType})`);
        assert(res.instrumentType !== 'MEDICINE_BALL', `Drop jump must NOT be detected as MEDICINE_BALL`);
        assert(res.rawData[0].dropHeight === 30, `dropHeight mapped correctly (30)`);
    }

    // 1.6 Video Kinematics (Joint Angles)
    {
        const kinRows = [
            ["Frame", "Time", "Angolo Ginocchio", "Angolo Anca", "Velocità Angolare"],
            [1, 0.04, 92.5, 85.0, 450],
            [2, 0.08, 98.2, 89.1, 480]
        ];
        const res = await parseRows(kinRows, 'kinovea_angles.xlsx');
        assert(res.instrumentType === 'VIDEO_KINEMATICS', `Kinovea joint angles must be detected as VIDEO_KINEMATICS (Got: ${res.instrumentType})`);
        assert(res.instrumentType !== 'MEDICINE_BALL', `Kinovea joint angles must NOT be detected as MEDICINE_BALL`);
        assert(res.rawData[0].kneeAngle === 92.5, `kneeAngle mapped correctly (92.5)`);
    }

    // 1.7 Video Kinematics (Marker Coordinates)
    {
        const kinCoords = [
            ["Frame", "Time", "X (px)", "Y (px)", "Velocita Lineare"],
            [1, 0.04, 120.5, 340.2, 2.1],
            [2, 0.08, 125.1, 335.0, 2.4]
        ];
        const res = await parseRows(kinCoords, 'tracker_coords.xlsx');
        assert(res.instrumentType === 'VIDEO_KINEMATICS', `Tracker coordinates must be detected as VIDEO_KINEMATICS (Got: ${res.instrumentType})`);
        assert(res.instrumentType !== 'MEDICINE_BALL', `Tracker coordinates must NOT be detected as MEDICINE_BALL`);
    }

    // 1.8 Sprint Timing
    {
        const sprintRows = [
            ["Atleta", "Split 5m", "Split 10m", "Split 20m", "Split 30m"],
            ["Matteo", 1.05, 1.82, 3.05, 4.18],
            ["Davide", 1.08, 1.86, 3.10, 4.25]
        ];
        const res = await parseRows(sprintRows, 'witty_sprint.xlsx');
        assert(res.instrumentType === 'SPRINT_TIMING', `Photocell sprint must be detected as SPRINT_TIMING (Got: ${res.instrumentType})`);
        assert(res.instrumentType !== 'MEDICINE_BALL', `Sprint must NOT be detected as MEDICINE_BALL`);
    }

    // 1.9 Block Starts (IMU Accelerometers)
    {
        const blockRows = [
            ["Atleta", "Tempo Reazione", "Durata Spinta", "Accel Orizzontale", "Acc X", "Acc Y", "Acc Z"],
            ["Matteo", 0.145, 0.38, 8.5, 7.2, 3.4, 1.8],
            ["Davide", 0.152, 0.40, 8.2, 6.9, 3.2, 1.7]
        ];
        const res = await parseRows(blockRows, 'block_starts.xlsx');
        assert(res.instrumentType === 'BLOCK_ACCEL', `Block start IMU must be detected as BLOCK_ACCEL (Got: ${res.instrumentType})`);
        assert(res.instrumentType !== 'MEDICINE_BALL', `Block start must NOT be detected as MEDICINE_BALL`);
    }
}

// ============================================================================
// SUITE 2: MEDICINE BALL EDGE-CASES
// ============================================================================
async function runSuite2() {
    console.log('\n=============================================================');
    console.log('SUITE 2: MEDICINE BALL EDGE-CASES (Minimal, Full, Case, Whitespace, IT/EN)');
    console.log('=============================================================');

    // 2.1 Minimal Italian inputs ("Peso" + "Distanza")
    {
        const minimalIt = [
            ["Atleta", "Peso", "Distanza"],
            ["Mario", 3.0, 10.0]
        ];
        const res = await parseRows(minimalIt, 'lancio_palla.xlsx');
        assert(res.instrumentType === 'MEDICINE_BALL', `Minimal 'Peso' + 'Distanza' detected as MEDICINE_BALL (Got: ${res.instrumentType})`);
        assert(res.rawData.length === 1, `1 record parsed`);
        const rec = res.rawData[0];
        assert(rec.ballMass === 3.0, `ballMass populated from load fallback (Got: ${rec.ballMass})`);
        assert(rec.throwDistance === 10.0, `throwDistance populated from distance fallback (Got: ${rec.throwDistance})`);
        assert(typeof rec.exitVelocity === 'number' && rec.exitVelocity > 9.0, `exitVelocity computed by physics engine (Got: ${rec.exitVelocity})`);
        assert(typeof rec.meanPower === 'number' && rec.meanPower > 500, `meanPower computed by physics engine (Got: ${rec.meanPower})`);
    }

    // 2.2 Minimal English inputs ("Load" + "Distance")
    {
        const minimalEn = [
            ["Athlete", "Load", "Distance"],
            ["John", 4.0, 8.5]
        ];
        const res = await parseRows(minimalEn, 'medicine_ball_throw.xlsx');
        assert(res.instrumentType === 'MEDICINE_BALL', `Minimal 'Load' + 'Distance' in medball file detected as MEDICINE_BALL (Got: ${res.instrumentType})`);
        const rec = res.rawData[0];
        assert(rec.ballMass === 4.0, `ballMass is 4.0`);
        assert(rec.throwDistance === 8.5, `throwDistance is 8.5`);
    }

    // 2.3 Full Italian inputs ("Peso Palla", "Distanza", "Tempo Volo", "Angolo Rilascio", "Altezza Rilascio")
    {
        const fullIt = [
            ["Atleta", "Peso Palla", "Distanza Lancio", "Tempo di Volo", "Angolo di Rilascio", "Altezza di Rilascio"],
            ["Paolo", 3.0, 10.0, 1.42, 45, 1.05]
        ];
        const res = await parseRows(fullIt, 'test_palla_medica.xlsx');
        assert(res.instrumentType === 'MEDICINE_BALL', `Full Italian inputs detected as MEDICINE_BALL`);
        const rec = res.rawData[0];
        assert(rec.ballMass === 3.0, `ballMass is 3.0`);
        assert(rec.throwDistance === 10.0, `throwDistance is 10.0`);
        assert(rec.flightTime === 1.42, `flightTime is 1.42`);
        assert(rec.releaseAngle === 45, `releaseAngle is 45`);
        assert(rec.releaseHeight === 1.05, `releaseHeight is 1.05`);
        assert(rec.exitVelocity > 0, `exitVelocity calculated with actual flight time`);
    }

    // 2.4 Full English inputs ("Ball Mass", "Throw Distance", "Flight Time", "Release Angle", "Release Height")
    {
        const fullEn = [
            ["Athlete", "Ball Mass", "Throw Distance", "Flight Time", "Release Angle", "Release Height"],
            ["Sarah", 3.5, 9.2, 1.35, 43, 1.10]
        ];
        const res = await parseRows(fullEn, 'mb_test.xlsx');
        assert(res.instrumentType === 'MEDICINE_BALL', `Full English inputs detected as MEDICINE_BALL`);
        const rec = res.rawData[0];
        assert(rec.ballMass === 3.5, `ballMass is 3.5`);
        assert(rec.throwDistance === 9.2, `throwDistance is 9.2`);
        assert(rec.flightTime === 1.35, `flightTime is 1.35`);
        assert(rec.releaseAngle === 43, `releaseAngle is 43`);
        assert(rec.releaseHeight === 1.10, `releaseHeight is 1.10`);
    }

    // 2.5 Mixed case headers ("pEsO PaLLa", "dIsTaNzA", "tEmPo dI VoLo", "aNgOlO Di rILaScIo")
    {
        const mixedCase = [
            ["aTlEtA", "pEsO PaLLa", "dIsTaNzA", "tEmPo dI VoLo", "aNgOlO Di rILaScIo"],
            ["Elena", 3.0, 9.8, 1.39, 44]
        ];
        const res = await parseRows(mixedCase, 'mixed_case.xlsx');
        assert(res.instrumentType === 'MEDICINE_BALL', `Mixed case headers detected as MEDICINE_BALL`);
        const rec = res.rawData[0];
        assert(rec.ballMass === 3.0, `Mixed case ballMass is 3.0`);
        assert(rec.throwDistance === 9.8, `Mixed case throwDistance is 9.8`);
        assert(rec.flightTime === 1.39, `Mixed case flightTime is 1.39`);
        assert(rec.releaseAngle === 44, `Mixed case releaseAngle is 44`);
    }

    // 2.6 Extra whitespace and tabs in headers
    {
        const whitespaceHeaders = [
            ["  Atleta  ", "\tPeso Palla \t", "   Distanza Lancio   ", "  Tempo di Volo  ", "  Angolo Rilascio\r\n"],
            ["Elena", 3.0, 9.8, 1.39, 44]
        ];
        const res = await parseRows(whitespaceHeaders, 'whitespace.xlsx');
        assert(res.instrumentType === 'MEDICINE_BALL', `Whitespace in headers handled cleanly`);
        const rec = res.rawData[0];
        assert(rec.ballMass === 3.0, `Whitespace ballMass is 3.0`);
        assert(rec.throwDistance === 9.8, `Whitespace throwDistance is 9.8`);
        assert(rec.flightTime === 1.39, `Whitespace flightTime is 1.39`);
        assert(rec.releaseAngle === 44, `Whitespace releaseAngle is 44`);
    }

    // 2.7 Comma as decimal delimiter in CSV
    {
        const csvComma = "Atleta;Peso Palla;Distanza Lancio;Tempo di Volo\nMario;3,5;10,2;1,45\n";
        const res = await parseCsvText(csvComma, 'comma_decimal.csv');
        assert(res.instrumentType === 'MEDICINE_BALL', `CSV with semicolon and comma decimal detected as MEDICINE_BALL`);
        const rec = res.rawData[0];
        assert(rec.ballMass === 3.5, `Comma decimal parsed: ballMass is 3.5 (Got: ${rec.ballMass})`);
        assert(rec.throwDistance === 10.2, `Comma decimal parsed: throwDistance is 10.2 (Got: ${rec.throwDistance})`);
        assert(rec.flightTime === 1.45, `Comma decimal parsed: flightTime is 1.45 (Got: ${rec.flightTime})`);
    }

    // 2.8 Pre-calculated or estimated velocity and power headers
    {
        const estHeaders = [
            ["Atleta", "Peso Palla", "Distanza Lancio", "Velocita Stimata", "Potenza Stimata"],
            ["Mario", 3.0, 10.0, 9.90, 818.0]
        ];
        const res = await parseRows(estHeaders, 'estimated_medball.xlsx');
        assert(res.instrumentType === 'MEDICINE_BALL', `Estimated velocity & power headers detected as MEDICINE_BALL`);
        const rec = res.rawData[0];
        assert(rec.exitVelocity === 9.90, `exitVelocity mapped from 'Velocita Stimata' (Got: ${rec.exitVelocity})`);
        assert(rec.power === 818.0, `power mapped from 'Potenza Stimata' (Got: ${rec.power})`);
    }
}

// ============================================================================
// SUITE 3: REPEATED TRIALS & `aggregateByLoad` INTEGRITY
// ============================================================================
async function runSuite3() {
    console.log('\n=============================================================');
    console.log('SUITE 3: REPEATED TRIALS & aggregateByLoad INTEGRITY');
    console.log('=============================================================');

    // 3.1 5 consecutive throws with identical ball weight (3.0 kg) using "Peso Palla" + "Distanza"
    {
        const throws5 = [
            ["Atleta", "Peso Palla", "Distanza Lancio"],
            ["Mario", 3.0, 9.8],
            ["Mario", 3.0, 10.1],
            ["Mario", 3.0, 10.2],
            ["Mario", 3.0, 9.9],
            ["Mario", 3.0, 10.4]
        ];
        const res = await parseRows(throws5, 'lanci_3kg.xlsx');
        assert(res.rawData.length === 5, `Repeated trials: exactly 5 distinct rows retained (Got: ${res.rawData.length})`);
        assert(res.aggregationInfo === null, `aggregationInfo is null (was NOT merged by aggregateByLoad)`);
        const distances = res.rawData.map(r => r.throwDistance);
        assert(distances.includes(9.8) && distances.includes(10.1) && distances.includes(10.2) && distances.includes(9.9) && distances.includes(10.4),
            `All 5 distinct distances retained intact: [${distances.join(', ')}]`);
    }

    // 3.2 5 consecutive throws with minimal headers ("Peso" + "Distanza") and identical load (3.0 kg)
    {
        const throws5Minimal = [
            ["Atleta", "Peso", "Distanza"],
            ["Mario", 3.0, 9.8],
            ["Mario", 3.0, 10.1],
            ["Mario", 3.0, 10.2],
            ["Mario", 3.0, 9.9],
            ["Mario", 3.0, 10.4]
        ];
        const res = await parseRows(throws5Minimal, 'lanci_minimal.xlsx');
        assert(res.rawData.length === 5, `Minimal headers repeated trials: exactly 5 distinct rows retained (Got: ${res.rawData.length})`);
        assert(res.aggregationInfo === null, `Minimal headers aggregationInfo is null (not merged)`);
        const distances = res.rawData.map(r => r.throwDistance);
        assert(distances.includes(9.8) && distances.includes(10.4), `Distances preserved: [${distances.join(', ')}]`);
        const masses = res.rawData.map(r => r.ballMass);
        assert(masses.every(m => m === 3.0), `All 5 rows have ballMass === 3.0`);
    }

    // 3.3 Multi-athlete repeated trials (Athlete A & Athlete B both throwing 3.0 kg and 4.0 kg)
    {
        const multiAthleteThrows = [
            ["Atleta", "Peso Palla", "Distanza Lancio"],
            ["Mario", 3.0, 9.8],
            ["Mario", 3.0, 10.1],
            ["Mario", 4.0, 8.2],
            ["Mario", 4.0, 8.5],
            ["Luca", 3.0, 8.9],
            ["Luca", 3.0, 9.1],
            ["Luca", 4.0, 7.5],
            ["Luca", 4.0, 7.8]
        ];
        const res = await parseRows(multiAthleteThrows, 'multi_athlete_mb.xlsx');
        assert(res.rawData.length === 8, `Multi-athlete repeated throws: all 8 rows retained (Got: ${res.rawData.length})`);
        assert(res.athletes.length === 2, `Detected 2 athletes: [${res.athletes.join(', ')}]`);
        const marioThrows = res.rawData.filter(r => r.athlete === 'Mario');
        const lucaThrows = res.rawData.filter(r => r.athlete === 'Luca');
        assert(marioThrows.length === 4, `Mario has 4 distinct throws`);
        assert(lucaThrows.length === 4, `Luca has 4 distinct throws`);
    }

    // 3.4 Direct verification of DataParser.aggregateByLoad function contract
    {
        // When VBT records have repeated loads and velocities: MUST aggregate
        const rawVbt = [
            { athlete: 'Mario', exercise: 'Squat', load: 80, velocity: 0.70, repsCount: 1 },
            { athlete: 'Mario', exercise: 'Squat', load: 80, velocity: 0.72, repsCount: 1 },
            { athlete: 'Mario', exercise: 'Squat', load: 80, velocity: 0.71, repsCount: 1 }
        ];
        // DataParser uses local aggregateByLoad inside parseExcel, but we can verify parseExcel behavior
        const vbtRows = [
            ["Atleta", "Esercizio", "Carico", "Velocità"],
            ["Mario", "Squat", 80, 0.70],
            ["Mario", "Squat", 80, 0.72],
            ["Mario", "Squat", 80, 0.71]
        ];
        const vbtRes = await parseRows(vbtRows, 'vbt_repeats.xlsx');
        assert(vbtRes.aggregationInfo !== null, `VBT repeated loads are aggregated (Got: ${vbtRes.aggregationInfo})`);
        assert(vbtRes.rawData.length === 1, `VBT 3 reps merged into 1 aggregated point`);
    }
}

// ============================================================================
// SUITE 4: HEADER COLLISION AVOIDANCE
// ============================================================================
async function runSuite4() {
    console.log('\n=============================================================');
    console.log('SUITE 4: HEADER COLLISION AVOIDANCE');
    console.log('=============================================================');

    // 4.1 "Tempo di Volo" collision test:
    // In Jump Test: "Tempo di Volo" must NOT map to jumpHeight
    {
        const jumpTestHeaders = [
            ["Atleta", "Esercizio", "Altezza Salto", "Tempo di Volo", "Tempo Contatto"],
            ["Luca", "CMJ", 41.5, 0.58, 205]
        ];
        const res = await parseRows(jumpTestHeaders, 'jump_tof.xlsx');
        assert(res.instrumentType === 'JUMP_TEST', `Jump test with 'Tempo di Volo' is classified as JUMP_TEST (Got: ${res.instrumentType})`);
        const rec = res.rawData[0];
        assert(rec.jumpHeight === 41.5, `'Altezza Salto' mapped to jumpHeight=41.5 (Got: ${rec.jumpHeight})`);
        assert(rec.jumpHeight !== 0.58, `'Tempo di Volo' (0.58) did NOT overwrite jumpHeight!`);
        assert(rec.flightTime === 0.58, `'Tempo di Volo' mapped to flightTime=0.58`);
    }

    // 4.2 "Angolo Rilascio" collision test:
    // In Medicine Ball: "Angolo Rilascio" must NOT trigger VIDEO_KINEMATICS
    {
        const medBallAngle = [
            ["Atleta", "Peso Palla", "Distanza Lancio", "Angolo Rilascio"],
            ["Luca", 3.0, 10.2, 45]
        ];
        const res = await parseRows(medBallAngle, 'mb_angle.xlsx');
        assert(res.instrumentType === 'MEDICINE_BALL', `'Angolo Rilascio' must trigger MEDICINE_BALL (Got: ${res.instrumentType})`);
        assert(res.instrumentType !== 'VIDEO_KINEMATICS', `'Angolo Rilascio' must NOT trigger VIDEO_KINEMATICS`);
        const rec = res.rawData[0];
        assert(rec.releaseAngle === 45, `'Angolo Rilascio' mapped to releaseAngle=45 (Got: ${rec.releaseAngle})`);
        assert(rec.jointAngle === null, `jointAngle is null (not mapped)`);
        assert(rec.kneeAngle === null, `kneeAngle is null (not mapped)`);
    }

    // 4.3 "Altezza Rilascio" collision test:
    // "Altezza Rilascio" must map to releaseHeight, NOT jumpHeight
    {
        const medBallHeight = [
            ["Atleta", "Peso Palla", "Distanza Lancio", "Altezza Rilascio"],
            ["Luca", 3.0, 10.2, 1.10]
        ];
        const res = await parseRows(medBallHeight, 'mb_release_height.xlsx');
        assert(res.instrumentType === 'MEDICINE_BALL', `Classified as MEDICINE_BALL`);
        const rec = res.rawData[0];
        assert(rec.releaseHeight === 1.10, `'Altezza Rilascio' mapped to releaseHeight=1.10 (Got: ${rec.releaseHeight})`);
        assert(rec.jumpHeight === null, `jumpHeight is strictly null`);
    }

    // 4.4 Video Kinematics collision test:
    // "Angolo Ginocchio" and "Angolo Tronco" must NOT trigger MEDICINE_BALL
    {
        const videoKin = [
            ["Frame", "Time", "Angolo Ginocchio", "Angolo Tronco", "Angolo (°)", "Velocità Angolare"],
            [1, 0.04, 110.5, 42.0, 110.5, 320]
        ];
        const res = await parseRows(videoKin, 'video_kin.xlsx');
        assert(res.instrumentType === 'VIDEO_KINEMATICS', `Classified as VIDEO_KINEMATICS (Got: ${res.instrumentType})`);
        assert(res.instrumentType !== 'MEDICINE_BALL', `Must NOT trigger MEDICINE_BALL`);
        const rec = res.rawData[0];
        assert(rec.releaseAngle === null, `releaseAngle is null in Video Kinematics`);
        assert(rec.kneeAngle === 110.5, `kneeAngle mapped correctly (110.5)`);
        assert(rec.trunkAngle === 42.0, `trunkAngle mapped correctly (42.0)`);
    }
}

// ============================================================================
// SUITE 5: ROBUSTNESS & ADVERSARIAL BOUNDARIES
// ============================================================================
async function runSuite5() {
    console.log('\n=============================================================');
    console.log('SUITE 5: ROBUSTNESS & ADVERSARIAL BOUNDARIES');
    console.log('=============================================================');

    // 5.1 Non-numeric strings in numeric columns ("N/A", "error")
    {
        const dirtyRows = [
            ["Atleta", "Peso Palla", "Distanza Lancio", "Tempo di Volo"],
            ["Mario", "3.0", "10.0", "1.42"],
            ["Mario", "CORRUPT", 10.5, 1.45], // missing mass
            ["Mario", 3.0, "N/A", 1.40],     // missing distance
            ["Mario", 3.0, 10.2, "ERROR"]    // valid mass & distance, corrupted time
        ];
        const res = await parseRows(dirtyRows, 'dirty_medball.xlsx');
        assert(res.instrumentType === 'MEDICINE_BALL', `Dirty medball detected as MEDICINE_BALL`);
        // Row 1: valid
        // Row 2: CORRUPT mass -> has distance 10.5, hasValidData is true (throwDistance > 0)
        // Row 3: N/A distance -> has ballMass 3.0, hasValidData is true (ballMass > 0)
        // Row 4: valid mass & distance, flightTime is null
        const validBoth = res.rawData.filter(r => r.ballMass > 0 && r.throwDistance > 0);
        assert(validBoth.length === 2, `2 rows have both valid ballMass & throwDistance (Got: ${validBoth.length})`);
        const row4 = res.rawData.find(r => r.throwDistance === 10.2);
        assert(row4 && row4.flightTime === null, `Row 4 'ERROR' flightTime gracefully parsed as null`);
    }

    // 5.2 Negative or zero mass/distance rows
    {
        const nonPositiveRows = [
            ["Atleta", "Peso Palla", "Distanza Lancio"],
            ["Mario", -3.0, -10.0], // Both negative -> filtered out
            ["Mario", 0, 0],        // Both zero -> filtered out
            ["Mario", -3.0, 10.0],  // Invalid mass, valid distance -> kept as partial row, exitVelocity must be null
            ["Mario", 3.0, -10.0],  // Valid mass, invalid distance -> kept as partial row, exitVelocity must be null
            ["Mario", 3.0, 10.0]    // Fully valid -> physics computed
        ];
        const res = await parseRows(nonPositiveRows, 'negative_medball.xlsx');
        assert(res.rawData.length === 3, `Completely invalid rows filtered out, partial rows kept for grid editing (Expected 3, Got: ${res.rawData.length})`);
        
        const partialMass = res.rawData.find(r => r.throwDistance === 10.0 && r.ballMass === -3.0);
        assert(partialMass && partialMass.exitVelocity === null, `Partial row with negative mass has null exitVelocity (no invalid physics)`);
        
        const partialDist = res.rawData.find(r => r.throwDistance === -10.0 && r.ballMass === 3.0);
        assert(partialDist && partialDist.exitVelocity === null, `Partial row with negative distance has null exitVelocity (no invalid physics)`);

        const fullyValid = res.rawData.find(r => r.throwDistance === 10.0 && r.ballMass === 3.0);
        assert(fullyValid && typeof fullyValid.exitVelocity === 'number' && fullyValid.exitVelocity > 9.0, `Fully valid row has calculated exitVelocity (${fullyValid ? fullyValid.exitVelocity : null})`);
    }

    // 5.3 Empty file or header-only file: must reject with descriptive error
    {
        let caughtErr = null;
        try {
            await parseRows([["Peso Palla", "Distanza Lancio"]], 'empty.xlsx');
        } catch (e) {
            caughtErr = e;
        }
        assert(caughtErr !== null, `Header-only file rejected`);
        assert(caughtErr && caughtErr.message.includes('Nessun dato utile'), `Rejection message indicates no useful data: '${caughtErr ? caughtErr.message : ''}'`);
    }

    // 5.4 Encoded athlete ID handling in Medicine Ball test
    {
        const encodedAthleteRows = [
            ["Atleta", "Peso Palla", "Distanza Lancio"],
            ["encoder_Riccardo_393636313639", 3.0, 10.2],
            ["Tommaso_mhkuhpch00l34m", 3.0, 9.8]
        ];
        const res = await parseRows(encodedAthleteRows, 'encoded_athletes.xlsx');
        assert(res.athletes.includes("Riccardo"), `Encoded ID extracted to 'Riccardo' (Got: [${res.athletes.join(', ')}])`);
        assert(res.athletes.includes("Tommaso"), `Encoded ID extracted to 'Tommaso' (Got: [${res.athletes.join(', ')}])`);
        assert(res.hasEncodedIds === true, `Flag hasEncodedIds is true`);
    }
}

// ============================================================================
// MAIN RUNNER
// ============================================================================
async function main() {
    console.log('=================================================================');
    console.log('=== EMPIRICAL CHALLENGER M1-2: PARSER STRESS TEST SUITE       ===');
    console.log('=================================================================');

    try {
        await runSuite1();
        await runSuite2();
        await runSuite3();
        await runSuite4();
        await runSuite5();
    } catch (err) {
        console.error('\n[UNHANDLED ERROR IN HARNESS]:', err);
        process.exit(1);
    }

    console.log('\n=================================================================');
    console.log(`TOTAL ASSERTIONS: ${totalAssertions}`);
    console.log(`PASSED: ${passedAssertions}`);
    console.log(`FAILED: ${failedAssertions}`);
    console.log('=================================================================');

    if (failedAssertions === 0) {
        console.log('\n>>> VERDICT: CONFIRM_CORRECTNESS <<<');
        process.exit(0);
    } else {
        console.log('\n>>> VERDICT: REJECT <<<');
        console.log('Failures:');
        failureDetails.forEach(f => console.log(`  - ${f.message}: ${f.details}`));
        process.exit(1);
    }
}

main();
