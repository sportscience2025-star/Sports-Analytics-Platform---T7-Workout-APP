/**
 * audit_empirical.js
 * Independent Forensic Audit Suite for Milestone 1
 * Targets: js/analysis/test-registry.js, js/parser.js, tests/test_multi_instrument_excel.js
 */

const fs = require('fs');
const path = require('path');

console.log("===============================================================");
console.log("=== FORENSIC AUDIT: M1 INTEGRITY & CHEATING DETECTION SUITE ===");
console.log("===============================================================\n");

let auditFailures = [];
let checksPassed = 0;

function reportCheck(name, pass, detail) {
    if (pass) {
        checksPassed++;
        console.log(`[PASS] ${name}: ${detail}`);
    } else {
        auditFailures.push({ name, detail });
        console.error(`[FAIL] ${name}: ${detail}`);
    }
}

// -----------------------------------------------------------------------------
// CHECK 1: Static Source Code Analysis for Hardcoded Test Strings & Names
// -----------------------------------------------------------------------------
console.log("--- Phase 1: Static Source Code Analysis ---");

const testRegistryPath = path.resolve(__dirname, '../../js/analysis/test-registry.js');
const parserPath = path.resolve(__dirname, '../../js/parser.js');

const testRegistryCode = fs.readFileSync(testRegistryPath, 'utf8');
const parserCode = fs.readFileSync(parserPath, 'utf8');

// List of athlete names used in test suites
const testNames = [
    "Paolo Belli",
    "Sofia Neri",
    "Riccardo Bianchi",
    "Luca Sprint",
    "Andrea Velocista"
];

// Check if any test athlete names are hardcoded in test-registry.js or parser.js
testNames.forEach(name => {
    const inRegistry = testRegistryCode.toLowerCase().includes(name.toLowerCase());
    reportCheck(
        `Absence of test name "${name}" in test-registry.js`,
        !inRegistry,
        inRegistry ? `Found forbidden hardcoded test name "${name}"` : 'Clean'
    );

    const inParser = parserCode.toLowerCase().includes(name.toLowerCase());
    reportCheck(
        `Absence of test name "${name}" in parser.js`,
        !inParser,
        inParser ? `Found forbidden hardcoded test name "${name}"` : 'Clean'
    );
});

// Check for environment sniffing keywords
const sniffingKeywords = ['process.env', 'NODE_ENV', '__karma__', 'isTestEnvironment', 'test_multi_instrument'];
sniffingKeywords.forEach(kw => {
    const inRegistry = testRegistryCode.includes(kw);
    reportCheck(
        `Absence of environment sniffing keyword "${kw}" in test-registry.js`,
        !inRegistry,
        inRegistry ? `Found sniffing keyword "${kw}"` : 'Clean'
    );

    const inParser = parserCode.includes(kw);
    reportCheck(
        `Absence of environment sniffing keyword "${kw}" in parser.js`,
        !inParser,
        inParser ? `Found sniffing keyword "${kw}"` : 'Clean'
    );
});

// Check for facade/stub patterns (e.g. return true, return false, return null only bodies)
const facadeRegex = /function\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{\s*return\s+(true|false|null|0|""|'')\s*;\s*\}/g;
const facadesInRegistry = testRegistryCode.match(facadeRegex);
reportCheck(
    'Facade function detection in test-registry.js',
    !facadesInRegistry || facadesInRegistry.length === 0,
    facadesInRegistry ? `Found potential facade functions: ${JSON.stringify(facadesInRegistry)}` : 'No dummy facade functions found'
);

// -----------------------------------------------------------------------------
// CHECK 2: TestRegistry Genuine Functionality & Dynamic Extensibility
// -----------------------------------------------------------------------------
console.log("\n--- Phase 2: Behavioral & Dynamic Evaluation of TestRegistry ---");

const TestRegistry = require('../../js/analysis/test-registry.js');

const EXPECTED_TYPES = [
    'VBT', 'FORCE_PLATE', 'BLOCK_ACCEL', 'SPRINT_TIMING',
    'VIDEO_KINEMATICS', 'JUMP_TEST', 'MEDICINE_BALL', 'GENERAL_TABULAR'
];

reportCheck(
    'TestRegistry defines all 8 required canonical test types',
    EXPECTED_TYPES.every(t => TestRegistry.has(t)),
    `All 8 types present (${EXPECTED_TYPES.join(', ')})`
);

// Immutability check
const origVbt = TestRegistry.get('VBT');
origVbt.columns.push({ key: 'HACKED_COLUMN' });
origVbt.label = "HACKED_LABEL";
const freshVbt = TestRegistry.get('VBT');
reportCheck(
    'TestRegistry.get returns defensive deep clone (immutability)',
    !freshVbt.columns.some(c => c.key === 'HACKED_COLUMN') && freshVbt.label !== "HACKED_LABEL",
    'Registry schemas are protected against external mutation'
);

// Dynamic 9th custom test type registration
const customSchema = {
    id: 'ROWING_ERGOMETER',
    label: 'Rowing Ergometer (Concept2)',
    summary: 'Pace / 500m, stroke rate, and stroke power',
    category: 'endurance_power',
    columns: [
        { key: 'athlete', label: 'Atleta', type: 'text', default: 'Atleta' },
        { key: 'split500', label: 'Pace 500m', type: 'number', min: 60, max: 240, required: true, default: 105.0 },
        { key: 'strokeRate', label: 'Cadenza', type: 'number', min: 10, max: 60, required: true, default: 30 },
        { key: 'powerWatts', label: 'Potenza', type: 'number', min: 0, max: 2000, required: false, default: 350 }
    ]
};
TestRegistry.register(customSchema);
reportCheck(
    'TestRegistry dynamically accepts custom test type registration',
    TestRegistry.has('ROWING_ERGOMETER'),
    'Successfully registered ROWING_ERGOMETER'
);

// Dynamic validation check on custom schema
const customValidation = TestRegistry.validateRecord({
    athlete: '  Rowing Champion  ',
    split500: '112,5', // comma string
    strokeRate: 32,
    powerWatts: 420
}, 'ROWING_ERGOMETER');

reportCheck(
    'TestRegistry validates and sanitizes comma decimals on dynamic test type',
    customValidation.valid && customValidation.sanitized.split500 === 112.5 && customValidation.sanitized.athlete === 'Rowing Champion',
    `Sanitized: split500=${customValidation.sanitized.split500}, athlete="${customValidation.sanitized.athlete}"`
);

// Dynamic clamping and error handling on out-of-bounds inputs
const oobValidation = TestRegistry.validateRecord({
    split500: 300, // max is 240
    strokeRate: 'INVALID_NUM'
}, 'ROWING_ERGOMETER');

reportCheck(
    'TestRegistry clamps out-of-bounds numbers and reports invalid required numbers',
    oobValidation.sanitized.split500 === 240 && !oobValidation.valid && oobValidation.errors.length > 0,
    `Clamped 300 to 240, caught error on strokeRate: ${oobValidation.errors[0]}`
);

// Dynamic header mapping with messy raw headers
const messyHeaders = ['  NOME ATLETA ', 'PESO PALLA (KG) ', ' DISTANZA (M)', 'ANGOLO RILASCIO (DEG)', 'TEMPO VOLO (S)'];
const mappedHeaders = TestRegistry.mapRawHeaders(messyHeaders, 'MEDICINE_BALL');
reportCheck(
    'TestRegistry.mapRawHeaders maps messy domain headers dynamically',
    mappedHeaders[0] === 'athlete' && mappedHeaders[1] === 'mass' && mappedHeaders[2] === 'distance' && mappedHeaders[3] === 'releaseAngle' && mappedHeaders[4] === 'flightTime',
    `Mapped keys: ${JSON.stringify(mappedHeaders)}`
);

// -----------------------------------------------------------------------------
// CHECK 3: DataParser Dynamic Classification & Content-Based Detection
// -----------------------------------------------------------------------------
console.log("\n--- Phase 3: DataParser Dynamic Classification & Sniffing Resistance ---");

// Setup minimal mock environment for parser.js
global.window = {};
eval(parserCode);
const DataParser = global.window.DataParser;

// Test with 100% synthetic, randomized athlete names and numbers
const rndSuffix = Math.floor(Math.random() * 1000000);
const syntheticAthlete = `RandomAthlete_${rndSuffix}`;

// 1. Force Plate synthetic records (no test-specific keywords in athlete name or filename)
const synthForceRecords = [
    { athlete: syntheticAthlete, forceZ: 1500 + Math.random() * 500, peakForce: 2300, rfd: 7200, impulse: 310 }
];
const synthForceHeaders = ['Atleta', 'Fz (N)', 'Picco Forza', 'RFD', 'Impulso'];
const detectedForce = DataParser.detectInstrumentType(synthForceRecords, synthForceHeaders, { filename: 'generic_export.xlsx' });
reportCheck(
    'DataParser detects FORCE_PLATE based purely on synthetic records and headers',
    detectedForce.type === 'FORCE_PLATE',
    `Detected: ${detectedForce.type} (${detectedForce.label})`
);

// 2. Sprint Timing synthetic records
const synthSprintRecords = [
    { athlete: syntheticAthlete, split_5m: 1.04, split_10m: 1.72, split_20m: 2.89, cumulativeTime: 7.05 }
];
const synthSprintHeaders = ['Atleta', '5m', '10m', '20m', 'Tempo Totale'];
const detectedSprint = DataParser.detectInstrumentType(synthSprintRecords, synthSprintHeaders, { filename: 'unrelated_file.csv' });
reportCheck(
    'DataParser detects SPRINT_TIMING based purely on synthetic records and headers',
    detectedSprint.type === 'SPRINT_TIMING',
    `Detected: ${detectedSprint.type} (${detectedSprint.label})`
);

// 3. Block Accel synthetic records
const synthBlockRecords = [
    { athlete: syntheticAthlete, horizontalAccel: 9.8, reactionTime: 0.145, pushDuration: 0.355 }
];
const synthBlockHeaders = ['Atleta', 'Accel Orizzontale', 'Tempo Reazione', 'Durata Spinta'];
const detectedBlock = DataParser.detectInstrumentType(synthBlockRecords, synthBlockHeaders, {});
reportCheck(
    'DataParser detects BLOCK_ACCEL based purely on synthetic records and headers',
    detectedBlock.type === 'BLOCK_ACCEL',
    `Detected: ${detectedBlock.type} (${detectedBlock.label})`
);

// 4. Video Kinematics synthetic records
const synthKinRecords = [
    { athlete: syntheticAthlete, frame: 1, kneeAngle: 120.5, hipAngle: 115.0, angularVelocity: 140 }
];
const synthKinHeaders = ['Atleta', 'Frame', 'Angolo Ginocchio', 'Angolo Anca', 'Velocità Angolare'];
const detectedKin = DataParser.detectInstrumentType(synthKinRecords, synthKinHeaders, {});
reportCheck(
    'DataParser detects VIDEO_KINEMATICS based purely on synthetic records and headers',
    detectedKin.type === 'VIDEO_KINEMATICS',
    `Detected: ${detectedKin.type} (${detectedKin.label})`
);

// 5. Jump Test synthetic records
const synthJumpRecords = [
    { athlete: syntheticAthlete, exercise: 'CMJ', jumpHeight: 38.5, contactTime: null, dropHeight: 0 }
];
const synthJumpHeaders = ['Atleta', 'Esercizio', 'Altezza Salto', 'Tempo Contatto'];
const detectedJump = DataParser.detectInstrumentType(synthJumpRecords, synthJumpHeaders, {});
reportCheck(
    'DataParser detects JUMP_TEST based purely on synthetic records and headers',
    detectedJump.type === 'JUMP_TEST',
    `Detected: ${detectedJump.type} (${detectedJump.label})`
);

// 6. Medicine Ball Minimal Fallback: load + distance, zero velocity, NO medball in filename
const synthMbMinRecords = [
    { athlete: syntheticAthlete, exercise: 'Overhead Throw', load: 4.0, distance: 9.5, velocity: null }
];
const synthMbMinHeaders = ['Atleta', 'Esercizio', 'Peso', 'Distanza'];
const detectedMbMin = DataParser.detectInstrumentType(synthMbMinRecords, synthMbMinHeaders, { filename: 'misleading_vbt_name.csv' });
reportCheck(
    'DataParser detects MEDICINE_BALL on minimal (weight + distance) without sniffing misleading filename',
    detectedMbMin.type === 'MEDICINE_BALL',
    `Detected: ${detectedMbMin.type} despite misleading filename "misleading_vbt_name.csv"`
);

// 7. General Tabular Fallback: arbitrary unrelated columns
const synthGenRecords = [
    { athlete: syntheticAthlete, col1: 42, col2: 99 }
];
const synthGenHeaders = ['Atleta', 'Metrica Alfa', 'Metrica Beta'];
const detectedGen = DataParser.detectInstrumentType(synthGenRecords, synthGenHeaders, {});
reportCheck(
    'DataParser falls back to GENERAL_TABULAR when data matches no biomechanical instruments',
    detectedGen.type === 'GENERAL_TABULAR',
    `Detected: ${detectedGen.type}`
);

// 8. Test Encoded ID extraction dynamically with arbitrary IDs
const testEncoded1 = "encoder_Gianluigi_5544332211aabbcc";
const testEncoded2 = "Alessio_mhkuhpch00l34m";
const testEncoded3 = "device_99999_Massimo_sensor";
const testEncoded4 = "sensor_445566"; // generic only

reportCheck(
    'DataParser extracts readable name from arbitrary encoded ID (Case 1)',
    DataParser.extractReadableName(testEncoded1) === 'Gianluigi',
    `Extracted "${DataParser.extractReadableName(testEncoded1)}" from ${testEncoded1}`
);
reportCheck(
    'DataParser extracts readable name from arbitrary encoded ID (Case 2)',
    DataParser.extractReadableName(testEncoded2) === 'Alessio',
    `Extracted "${DataParser.extractReadableName(testEncoded2)}" from ${testEncoded2}`
);
reportCheck(
    'DataParser extracts readable name from arbitrary encoded ID (Case 3)',
    DataParser.extractReadableName(testEncoded3) === 'Massimo',
    `Extracted "${DataParser.extractReadableName(testEncoded3)}" from ${testEncoded3}`
);
reportCheck(
    'DataParser falls back to "Atleta" when ID contains only device/sensor tokens',
    DataParser.extractReadableName(testEncoded4) === 'Atleta',
    `Extracted "${DataParser.extractReadableName(testEncoded4)}" from ${testEncoded4}`
);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log("\n===============================================================");
console.log(`FORENSIC EMPIRICAL AUDIT COMPLETED: ${checksPassed} checks passed, ${auditFailures.length} failures.`);
console.log("===============================================================");

if (auditFailures.length > 0) {
    console.error("FAILURES DETECTED:");
    auditFailures.forEach(f => console.error(` - ${f.name}: ${f.detail}`));
    process.exit(1);
} else {
    console.log("VERDICT: CLEAN — Zero cheating, zero hardcoding, zero dummy facades detected.");
    process.exit(0);
}
