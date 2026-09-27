/**
 * test_multi_instrument_excel.js
 * Test suite for Excel ingestion, fallback parsing (SheetJS, ExcelJS, CSV),
 * and sports science instrument auto-detection.
 */

const fs = require('fs');
const path = require('path');

// 1. Setup Mock Browser environment
global.window = {};

class MockFileReader {
    readAsArrayBuffer(file) {
        setTimeout(() => {
            if (this.onload) {
                const buf = (file instanceof Uint8Array || Buffer.isBuffer(file))
                    ? file
                    : (typeof file === 'string' ? Buffer.from(file, 'utf-8') : Buffer.from([]));
                this.onload({
                    target: {
                        result: new Uint8Array(buf).buffer
                    }
                });
            }
        }, 0);
    }
}
global.FileReader = MockFileReader;

// Genuine Mock XLSX reader supporting multiple sheets and formats
const mockXLSX = {
    read: (data, options) => {
        const str = Buffer.from(data).toString('utf-8');
        const lines = str.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const rows = lines.map(line => {
            return line.split(',').map(cell => {
                const trimmed = cell.trim().replace(/^["']|["']$/g, '');
                if (trimmed === '') return null;
                if (/^\d{4}[-/.]\d{2}[-/.]\d{2}$/.test(trimmed)) return trimmed;
                const isNumeric = /^-?\d+([.,]\d+)?$/.test(trimmed);
                const num = isNumeric ? parseFloat(trimmed.replace(',', '.')) : NaN;
                return isNaN(num) ? trimmed : num;
            });
        });
        return {
            SheetNames: ['Sheet1'],
            Sheets: {
                'Sheet1': rows
            }
        };
    },
    utils: {
        sheet_to_json: (sheet, options) => sheet
    }
};

global.window.XLSX = mockXLSX;
global.XLSX = mockXLSX;

// 2. Load DataParser from parser.js
const parserPath = path.join(__dirname, '..', 'js', 'parser.js');
const parserCode = fs.readFileSync(parserPath, 'utf8');
eval(parserCode);
const DataParser = global.window.DataParser;

function assert(cond, msg) {
    if (!cond) {
        throw new Error(`Assertion Failed: ${msg}`);
    }
}

async function runAllTests() {
    console.log("=== Running Multi-Instrument Excel Ingestion Tests ===");
    let passed = 0;

    // Test 1: VBT Encoders (Vitruve / GymAware)
    console.log("\n1. Testing VBT Encoder File Parsing...");
    const vbtCSV = `Atleta, Esercizio, Carico (kg), Velocità Media (m/s), Vmax, Potenza (W)
Mario Rossi, Back Squat, 60, 0.95, 1.35, 558
Mario Rossi, Back Squat, 80, 0.78, 1.12, 612
Mario Rossi, Back Squat, 100, 0.58, 0.88, 568
Mario Rossi, Back Squat, 120, 0.42, 0.65, 494`;

    const vbtRes = await DataParser.parseExcel(Buffer.from(vbtCSV));
    assert(vbtRes.instrumentType === 'VBT', `Expected VBT instrument, got ${vbtRes.instrumentType}`);
    assert(vbtRes.rawData.length === 4, `Expected 4 VBT records, got ${vbtRes.rawData.length}`);
    assert(vbtRes.rawData[0].load === 60 && vbtRes.rawData[0].velocity === 0.95, "First point should be 60kg @ 0.95 m/s");
    assert(vbtRes.rawData[0].peakVelocity === 1.35, "Peak velocity should be 1.35 m/s");
    console.log(`   ✅ VBT auto-detected: ${vbtRes.instrumentLabel} (${vbtRes.rawData.length} points)`);
    passed++;

    // Test 2: Pedane di Forza (Hawkin Dynamics / ForceDecks / Kistler)
    console.log("\n2. Testing Force Plate File Parsing...");
    const forcePlateCSV = `Atleta, Prova, Fz (N), Picco Forza, RFD (N/s), Impulso, Asimmetria %
Riccardo Bianchi, CMJ Force, 1850, 2450, 8500, 310, 4.2
Riccardo Bianchi, CMJ Force, 1920, 2520, 8900, 325, 3.8
Riccardo Bianchi, CMJ Force, 1880, 2480, 8650, 318, 4.0`;

    const fpRes = await DataParser.parseExcel(Buffer.from(forcePlateCSV));
    assert(fpRes.instrumentType === 'FORCE_PLATE', `Expected FORCE_PLATE instrument, got ${fpRes.instrumentType}`);
    assert(fpRes.rawData.length === 3, `Expected 3 records, got ${fpRes.rawData.length}`);
    assert(fpRes.rawData[0].forceZ === 1850, `Expected forceZ 1850, got ${fpRes.rawData[0].forceZ}`);
    assert(fpRes.rawData[0].peakForce === 2450, `Expected peakForce 2450, got ${fpRes.rawData[0].peakForce}`);
    assert(fpRes.rawData[0].rfd === 8500, `Expected RFD 8500, got ${fpRes.rawData[0].rfd}`);
    assert(fpRes.rawData[0].asymmetry === 4.2, `Expected asymmetry 4.2%, got ${fpRes.rawData[0].asymmetry}`);
    console.log(`   ✅ Force Plate auto-detected: ${fpRes.instrumentLabel}`);
    passed++;

    // Test 3: Accelerometri Partenze dai Blocchi (IMU)
    console.log("\n3. Testing Block Start Accelerometer File Parsing...");
    const blockCSV = `Atleta, Test, Tempo Reazione (ms), Tempo Spinta (s), Accel Orizzontale, Velocità Uscita
Luca Sprint, 60m Start, 142, 0.365, 8.45, 3.12
Luca Sprint, 60m Start, 138, 0.358, 8.72, 3.18`;

    const blockRes = await DataParser.parseExcel(Buffer.from(blockCSV));
    assert(blockRes.instrumentType === 'BLOCK_ACCEL', `Expected BLOCK_ACCEL, got ${blockRes.instrumentType}`);
    assert(blockRes.rawData.length === 2, `Expected 2 records, got ${blockRes.rawData.length}`);
    assert(blockRes.rawData[0].reactionTime === 142, "Reaction time should be 142 ms");
    assert(blockRes.rawData[0].pushDuration === 0.365, "Push duration should be 0.365 s");
    assert(blockRes.rawData[0].horizontalAccel === 8.45, "Horizontal accel should be 8.45 m/s²");
    console.log(`   ✅ Block Start Accelerometer auto-detected: ${blockRes.instrumentLabel}`);
    passed++;

    // Test 4: Fotocellule Sprint (Microgate Witty / Freelap)
    console.log("\n4. Testing Timing Gates (Fotocellule) File Parsing...");
    const sprintCSV = `Atleta, Prova, 5m, 10m, 20m, 30m, 60m
Andrea Velocista, Sprint Test, 1.05, 1.78, 2.95, 4.05, 7.12`;

    const sprintRes = await DataParser.parseExcel(Buffer.from(sprintCSV));
    assert(sprintRes.instrumentType === 'SPRINT_TIMING', `Expected SPRINT_TIMING, got ${sprintRes.instrumentType}`);
    assert(sprintRes.rawData[0].split_5m === 1.05, "5m split should be 1.05s");
    assert(sprintRes.rawData[0].split_10m === 1.78, "10m split should be 1.78s");
    assert(sprintRes.rawData[0].split_60m === 7.12, "60m split should be 7.12s");
    console.log(`   ✅ Timing Gates auto-detected: ${sprintRes.instrumentLabel}`);
    passed++;

    // Test 5: Videoanalisi Cinematica 2D (Kinovea / Dartfish / Tracker)
    console.log("\n5. Testing Video Analysis Kinematics File Parsing...");
    const kinCSV = `Frame, Tempo (s), Angolo Ginocchio (°), Angolo Anca (°), Velocità Angolare (°/s)
1, 0.00, 172.5, 175.0, 0
15, 0.25, 135.2, 140.1, -150
30, 0.50, 88.4, 92.5, 240
45, 0.75, 145.0, 152.0, 310
60, 1.00, 175.2, 176.8, 45`;

    const kinRes = await DataParser.parseExcel(Buffer.from(kinCSV));
    assert(kinRes.instrumentType === 'VIDEO_KINEMATICS', `Expected VIDEO_KINEMATICS, got ${kinRes.instrumentType}`);
    assert(kinRes.rawData.length === 5, `Expected 5 frame records, got ${kinRes.rawData.length}`);
    assert(kinRes.rawData[2].kneeAngle === 88.4, "Deepest knee angle should be 88.4°");
    assert(kinRes.rawData[3].angularVelocity === 310, "Angular velocity should be 310°/s");
    console.log(`   ✅ Kinematics auto-detected: ${kinRes.instrumentLabel}`);
    passed++;

    // Test 6: Vertical Jump Test (SJ, CMJ, DJ)
    console.log("\n6. Testing Vertical Jump Test File Parsing...");
    const jumpCSV = `Atleta, Esercizio, Altezza Salto (cm), Tempo Contatto (s), Caduta (cm)
Marco Rossi, SJ, 33.5, 0, 0
Marco Rossi, CMJ, 37.8, 0, 0
Marco Rossi, DJ, 40.2, 0.185, 30`;

    const jumpRes = await DataParser.parseExcel(Buffer.from(jumpCSV));
    assert(jumpRes.instrumentType === 'JUMP_TEST', `Expected JUMP_TEST, got ${jumpRes.instrumentType}`);
    assert(jumpRes.rawData.length === 3, `Expected 3 records, got ${jumpRes.rawData.length}`);
    const djRecord = jumpRes.rawData.find(r => r.exercise.toLowerCase() === 'dj');
    assert(djRecord && djRecord.jumpHeight === 40.2, "DJ height should be 40.2 cm");
    assert(djRecord && djRecord.contactTime === 0.185, "DJ contact time should be 0.185 s");
    console.log(`   ✅ Jump Test auto-detected: ${jumpRes.instrumentLabel}`);
    passed++;

    // Test 7: Fallback when window.XLSX is missing (CSV decoder fallback)
    console.log("\n7. Testing Fallback when SheetJS (window.XLSX) is absent...");
    const origXLSX = global.window.XLSX;
    delete global.window.XLSX;
    delete global.XLSX;

    const fallbackRes = await DataParser.parseExcel(Buffer.from(vbtCSV));
    assert(fallbackRes.rawData.length === 4, `Fallback should parse 4 rows, got ${fallbackRes.rawData.length}`);
    assert(fallbackRes.instrumentType === 'VBT', "Fallback should still detect instrument type");
    console.log("   ✅ Fallback parser successfully decoded file without window.XLSX!");
    passed++;

    // Restore XLSX
    global.window.XLSX = origXLSX;
    global.XLSX = origXLSX;

    // Test 8: Multi-Athlete VBT Raw File Ingestion (Vitruve / Speed4Lifts format)
    console.log("\n8. Testing Multi-Athlete VBT Raw File (Vitruve format with IDs & Vmp)...");
    const vitruveCSV = `Usuario, IDUsuario, Fecha, Ejercicio, IDEjercicio, Carga, Vmp, Vmax, Potencia, ROM, Perdida Vel, 1RM, % 1RM
Alessia, 104, 2026-05-10, Sentadilla paralela, 12, 50, 0.85, 1.15, 425, 48, 5.2, 85, 58.8
Alessia, 104, 2026-05-10, Sentadilla paralela, 12, 50, 0.83, 1.12, 415, 47, 6.1, 85, 58.8
Tommaso, 105, 2026-05-10, Stacco da terra, 15, 120, 0.52, 0.78, 624, 52, 8.0, 160, 75.0
Tommaso, 105, 2026-05-10, Stacco da terra, 15, 120, 0.50, 0.76, 600, 51, 9.2, 160, 75.0`;

    const vitruveRes = await DataParser.parseExcel(Buffer.from(vitruveCSV));
    console.log("DEBUG TEST 8 detected:", vitruveRes.instrumentType, "headers:", vitruveRes.headers, "detectedMetrics:", vitruveRes.detectedMetrics, "firstRecord:", vitruveRes.rawData[0]);
    assert(vitruveRes.instrumentType === 'VBT', `Expected VBT instrument, got ${vitruveRes.instrumentType}`);
    assert(vitruveRes.athletes.includes('Alessia'), "Athlete 'Alessia' must be found in athletes list");
    assert(vitruveRes.athletes.includes('Tommaso'), "Athlete 'Tommaso' must be found in athletes list");
    assert(!vitruveRes.athletes.includes('104'), "IDUsuario '104' must NEVER be in athletes list");
    assert(!vitruveRes.athletes.includes('105'), "IDUsuario '105' must NEVER be in athletes list");
    assert(vitruveRes.exercises.includes('Squat'), "Sentadilla paralela must be normalized to 'Squat'");
    assert(vitruveRes.exercises.includes('Stacco'), "Stacco da terra must be normalized to 'Stacco'");
    assert(!vitruveRes.exercises.includes('12'), "IDEjercicio '12' must NEVER be in exercises list");

    // Check aggregated records
    const alessiaSquat = vitruveRes.rawData.find(r => r.athlete === 'Alessia' && r.exercise === 'Squat');
    assert(alessiaSquat !== undefined, "Aggregated record for Alessia Squat should exist");
    assert(alessiaSquat.athleteRaw === 'Alessia', `athleteRaw must be 'Alessia', got ${alessiaSquat.athleteRaw}`);
    assert(alessiaSquat.repsCount === 2, `repsCount should be 2, got ${alessiaSquat.repsCount}`);
    assert(alessiaSquat.load === 50, `Load should be 50, got ${alessiaSquat.load}`);
    assert(Math.abs(alessiaSquat.velocity - 0.84) < 1e-3, `Velocity fallback from Vmp should be 0.84, got ${alessiaSquat.velocity}`);
    assert(Math.abs(alessiaSquat.propulsiveVelocity - 0.84) < 1e-3, `propulsiveVelocity should be 0.84, got ${alessiaSquat.propulsiveVelocity}`);
    assert(alessiaSquat.peakVelocity === 1.15, `peakVelocity should be 1.15 (max), got ${alessiaSquat.peakVelocity}`);
    assert(alessiaSquat.power === 420, `power should be 420 (mean), got ${alessiaSquat.power}`);
    assert(alessiaSquat.rom === 47.5, `rom should be 47.5 (mean), got ${alessiaSquat.rom}`);
    assert(Math.abs(alessiaSquat.fatigue - 5.65) < 1e-3, `fatigue should be 5.65, got ${alessiaSquat.fatigue}`);

    const tommasoStacco = vitruveRes.rawData.find(r => r.athlete === 'Tommaso' && r.exercise === 'Stacco');
    assert(tommasoStacco !== undefined, "Aggregated record for Tommaso Stacco should exist");
    assert(tommasoStacco.athleteRaw === 'Tommaso', `athleteRaw must be 'Tommaso', got ${tommasoStacco.athleteRaw}`);
    assert(tommasoStacco.peakVelocity === 0.78, "Tommaso peakVelocity should be 0.78");
    console.log("   ✅ Vitruve multi-athlete raw parsing and load aggregation verified!");
    passed++;

    // Test 9: Speed4Lifts Format and Exercise Dictionary Normalization
    console.log("\n9. Testing Speed4Lifts Format & Exercise Dictionary Normalization...");
    const s4lCSV = `atleta, id_atleta, fecha, ejercicio, id_ejercicio, carga, v_mp, v_max, potencia, rom, fatiga
Marco, id_001, 2026-05-12, squat parallelo, ex_01, 70, 0.75, 0.98, 525, 45, 4.0
Marco, id_001, 2026-05-12, deadlift, ex_02, 100, 0.60, 0.85, 600, 50, 5.0
Marco, id_001, 2026-05-12, mezzo squat, ex_03, 80, 0.90, 1.20, 720, 30, 3.5`;

    const s4lRes = await DataParser.parseExcel(Buffer.from(s4lCSV));
    assert(s4lRes.athletes.includes('Marco'), "Athlete 'Marco' must be parsed");
    assert(!s4lRes.athletes.includes('id_001'), "id_atleta must not overwrite athlete");
    assert(s4lRes.exercises.includes('Squat'), "squat parallelo normalized to Squat");
    assert(s4lRes.exercises.includes('Stacco'), "deadlift normalized to Stacco");
    assert(s4lRes.exercises.includes('Mezzo Squat'), "mezzo squat normalized to Mezzo Squat");
    assert(s4lRes.rawData[0].propulsiveVelocity === 0.75, "v_mp mapped to propulsiveVelocity");
    assert(s4lRes.rawData[0].velocity === 0.75, "v_mp fallback to velocity");
    assert(s4lRes.rawData[0].power === 525, "potencia mapped to power");
    assert(s4lRes.rawData[0].rom === 45, "rom mapped to rom");
    assert(s4lRes.rawData[0].fatigue === 4.0, "fatiga mapped to fatigue");
    console.log("   ✅ Speed4Lifts format and exercise dictionary normalization verified!");
    passed++;

    // Test 10: Medicine Ball Full Ingestion
    console.log("\n10. Testing Medicine Ball (Palla Medica) Full File Parsing...");
    const medballCSV = `Atleta, Esercizio, Peso Palla (kg), Distanza Lancio (m), Tempo di Volo (s), Angolo Rilascio (°)
Paolo Belli, Lancio Petto, 3.0, 10.2, 1.18, 44
Paolo Belli, Lancio Petto, 4.0, 8.5, 1.05, 43
Paolo Belli, Lancio Petto, 5.0, 7.2, 0.95, 42`;

    const mbRes = await DataParser.parseExcel(Buffer.from(medballCSV));
    assert(mbRes.instrumentType === 'MEDICINE_BALL', `Expected MEDICINE_BALL, got ${mbRes.instrumentType}`);
    assert(mbRes.rawData.length === 3, `Expected 3 records, got ${mbRes.rawData.length}`);
    assert(mbRes.rawData[0].ballMass === 3.0, `Expected ballMass 3.0, got ${mbRes.rawData[0].ballMass}`);
    assert(mbRes.rawData[0].throwDistance === 10.2, `Expected throwDistance 10.2, got ${mbRes.rawData[0].throwDistance}`);
    assert(mbRes.rawData[0].flightTime === 1.18, `Expected flightTime 1.18, got ${mbRes.rawData[0].flightTime}`);
    assert(mbRes.rawData[0].releaseAngle === 44, `Expected releaseAngle 44, got ${mbRes.rawData[0].releaseAngle}`);
    console.log(`   ✅ Medicine Ball auto-detected: ${mbRes.instrumentLabel}`);
    passed++;

    // Test 11: Medicine Ball Minimal Inputs (Carico + Distanza fallback)
    console.log("\n11. Testing Medicine Ball Minimal Fallback Parsing (Carico + Distanza)...");
    const mbMinimalCSV = `Atleta, Esercizio, Peso, Distanza
Sofia Neri, Overhead Throw, 3, 10
Sofia Neri, Overhead Throw, 3, 10.4
Sofia Neri, Overhead Throw, 3, 9.8`;

    const mbMinRes = await DataParser.parseExcel(Buffer.from(mbMinimalCSV));
    assert(mbMinRes.instrumentType === 'MEDICINE_BALL', `Expected MEDICINE_BALL, got ${mbMinRes.instrumentType}`);
    assert(mbMinRes.rawData.length === 3, `Expected 3 records (no VBT aggregation loss), got ${mbMinRes.rawData.length}`);
    assert(mbMinRes.rawData[0].ballMass === 3, `Expected ballMass 3, got ${mbMinRes.rawData[0].ballMass}`);
    assert(mbMinRes.rawData[0].throwDistance === 10, `Expected throwDistance 10, got ${mbMinRes.rawData[0].throwDistance}`);
    console.log("   ✅ Medicine Ball minimal inputs auto-detected and normalized!");
    passed++;

    console.log("\n==================================================");
    console.log(`ALL MULTI-INSTRUMENT EXCEL TESTS PASSED (${passed}/${passed})`);
    console.log("==================================================");
    return true;
}

runAllTests().catch(err => {
    console.error("Test failed with error:", err.message || err.stack || err);
    process.exit(1);
});
