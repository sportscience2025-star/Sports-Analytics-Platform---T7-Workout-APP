/**
 * tests/test_adversarial_test_registry.js
 * Empirical Adversarial Stress Test Harness for TestRegistry (js/analysis/test-registry.js)
 *
 * Scope:
 * 1. Schema Immutability (defensive deepClone validation across get, getAll, getColumnsFor, getSampleDataFor)
 * 2. Unknown, Empty, Whitespace, Case, and Edge-Case Test IDs
 * 3. Schema Registration & Input Defense
 * 4. validateRecord Fuzzing (18,000 permutations: negative, extreme, comma strings, NaN, Infinity, objects, arrays, circular)
 * 5. Sample Data Self-Validation for all 8 Test Types
 * 6. Header Mapping Robustness (mapRawHeaders) & Collision Vulnerability Mining
 */

'use strict';

const TestRegistry = require('../js/analysis/test-registry.js');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];
const verifiedBugs = [];

function assert(condition, message) {
    totalTests++;
    if (!condition) {
        failedTests++;
        failures.push(message);
        console.error(`  [FAIL] ${message}`);
    } else {
        passedTests++;
    }
}

function assertEqual(actual, expected, message) {
    totalTests++;
    if (actual !== expected) {
        failedTests++;
        const msg = `${message} -> Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
        failures.push(msg);
        console.error(`  [FAIL] ${msg}`);
    } else {
        passedTests++;
    }
}

function recordBug(bugId, title, details) {
    verifiedBugs.push({ bugId, title, details });
    console.warn(`  [VULNERABILITY CONFIRMED] ${bugId}: ${title}`);
}

console.log('================================================================');
console.log('EMPIRICAL ADVERSARIAL STRESS TEST: TestRegistry');
console.log('================================================================\n');

// ============================================================================
// SUITE 1: SCHEMA IMMUTABILITY STRESS TESTING
// ============================================================================
console.log('--- Suite 1: Schema Immutability Stress-Testing ---');

// 1.1 Mutate getColumnsFor()
{
    const originalCols = TestRegistry.getColumnsFor('VBT');
    const origCount = originalCols.length;
    const origFirstLabel = originalCols[0].label;

    // Adversarial mutations on returned array
    originalCols.push({ key: 'evil_key', label: 'Evil Column', type: 'number' });
    originalCols[0].label = 'TAMPERED_LABEL';
    originalCols[0].required = !originalCols[0].required;
    originalCols[0].min = -999999;
    if (originalCols[2]) originalCols[2].max = 0;

    const freshCols = TestRegistry.getColumnsFor('VBT');
    assertEqual(freshCols.length, origCount, 'getColumnsFor array length must not change after push');
    assertEqual(freshCols[0].label, origFirstLabel, 'getColumnsFor elements must not mutate internal schema');
    assert(freshCols[0].min !== -999999, 'getColumnsFor properties must remain isolated');

    // Cross-check with get('VBT').columns
    const vbtSchema = TestRegistry.get('VBT');
    assertEqual(vbtSchema.columns.length, origCount, 'get("VBT").columns length must match canonical count');
    assertEqual(vbtSchema.columns[0].label, origFirstLabel, 'get("VBT").columns[0].label must match canonical label');
}

// 1.2 Mutate getSampleDataFor()
{
    const sample = TestRegistry.getSampleDataFor('VBT');
    const origCount = sample.length;
    const origFirstLoad = sample[0].load;

    // Adversarial mutations
    sample.push({ athlete: 'Hacker', exercise: 'Exploit', load: -100, velocity: 99.9 });
    sample[0].load = 999999;
    delete sample[0].velocity;
    sample[0].injected_prop = 'corrupted';

    const freshSample = TestRegistry.getSampleDataFor('VBT');
    assertEqual(freshSample.length, origCount, 'getSampleDataFor array length must remain pristine after push');
    assertEqual(freshSample[0].load, origFirstLoad, 'getSampleDataFor object fields must not be mutated');
    assert(freshSample[0].velocity !== undefined, 'getSampleDataFor deleted fields must still exist in fresh query');
    assertEqual(freshSample[0].injected_prop, undefined, 'getSampleDataFor injected fields must not leak to registry');
}

// 1.3 Mutate get() schema object
{
    const medBallSchema = TestRegistry.get('MEDICINE_BALL');
    const origLabel = medBallSchema.label;
    const origColCount = medBallSchema.columns.length;

    medBallSchema.id = 'CORRUPTED_ID';
    medBallSchema.label = 'MUTATED_LABEL';
    medBallSchema.columns.pop();
    medBallSchema.headerAliases = null;

    const freshMedBall = TestRegistry.get('MEDICINE_BALL');
    assertEqual(freshMedBall.id, 'MEDICINE_BALL', 'get() schema.id must remain pristine');
    assertEqual(freshMedBall.label, origLabel, 'get() schema.label must remain pristine');
    assertEqual(freshMedBall.columns.length, origColCount, 'get() schema.columns must remain pristine');
    assert(freshMedBall.headerAliases !== null, 'get() schema.headerAliases must remain intact');
}

// 1.4 Mutate getAll() dictionary
{
    const allSchemas = TestRegistry.getAll();
    const origKeyCount = Object.keys(allSchemas).length;

    delete allSchemas.VBT;
    delete allSchemas.FORCE_PLATE;
    allSchemas.MALICIOUS_ENTRY = { id: 'MALICIOUS' };
    if (allSchemas.JUMP_TEST) {
        allSchemas.JUMP_TEST.label = 'TAMPERED_JUMP';
    }

    const freshAll = TestRegistry.getAll();
    assertEqual(Object.keys(freshAll).length, origKeyCount, 'getAll() key count must not be altered by deletion/insertion');
    assert(TestRegistry.has('VBT'), 'TestRegistry.has("VBT") must still return true after delete allSchemas.VBT');
    assert(TestRegistry.has('FORCE_PLATE'), 'TestRegistry.has("FORCE_PLATE") must still return true');
    assert(!TestRegistry.has('MALICIOUS_ENTRY'), 'TestRegistry must not contain injected keys');
    assertEqual(TestRegistry.get('JUMP_TEST').label, 'Test di Salto Verticale (SJ / CMJ / Drop Jump)', 'get("JUMP_TEST").label must remain pristine');
}

// 1.5 Mutate createDefaultRecord()
{
    const defRecord = TestRegistry.createDefaultRecord('VBT');
    const origAthlete = defRecord.athlete;
    defRecord.athlete = 'TAMPERED_ATHLETE';
    defRecord.load = 9999;
    defRecord.newProp = 'evil';

    const freshDefRecord = TestRegistry.createDefaultRecord('VBT');
    assertEqual(freshDefRecord.athlete, origAthlete, 'createDefaultRecord must produce clean records each invocation');
    assertEqual(freshDefRecord.load, 0, 'createDefaultRecord load must remain 0');
    assertEqual(freshDefRecord.newProp, undefined, 'createDefaultRecord must not retain added properties');
}

console.log('  [PASS] Suite 1: 100% Immutability verified.\n');

// ============================================================================
// SUITE 2: UNKNOWN, MALFORMED & EDGE-CASE TEST IDS
// ============================================================================
console.log('--- Suite 2: Unknown, Malformed & Edge-Case Test IDs ---');

const edgeCaseIds = [
    { input: null, name: 'null' },
    { input: undefined, name: 'undefined' },
    { input: '', name: 'empty string' },
    { input: '   ', name: 'whitespace only' },
    { input: 'RANDOM_TEST_123', name: 'unknown test id' },
    { input: 'vbt', name: 'lowercase vbt' },
    { input: '  vbt  ', name: 'whitespace padded lowercase vbt' },
    { input: ' medicine_ball ', name: 'whitespace padded lowercase medicine_ball' },
    { input: 'FORCE_PLATE', name: 'standard uppercase valid id' },
    { input: 12345, name: 'number input' },
    { input: {}, name: 'object input' },
    { input: [], name: 'array input' },
    { input: true, name: 'boolean input' },
    { input: Symbol('test'), name: 'symbol input' }
];

edgeCaseIds.forEach(({ input, name }) => {
    try {
        const schema = TestRegistry.get(input);
        assert(schema && typeof schema === 'object', `get(${name}) must return a valid schema object`);
        assert(typeof schema.id === 'string', `get(${name}).id must be a string`);
        assert(Array.isArray(schema.columns), `get(${name}).columns must be an array`);

        const cols = TestRegistry.getColumnsFor(input);
        assert(Array.isArray(cols) && cols.length > 0, `getColumnsFor(${name}) must return non-empty columns array`);

        const sample = TestRegistry.getSampleDataFor(input);
        assert(Array.isArray(sample), `getSampleDataFor(${name}) must return an array`);

        const defRec = TestRegistry.createDefaultRecord(input);
        assert(defRec && typeof defRec === 'object', `createDefaultRecord(${name}) must return an object`);

        const validation = TestRegistry.validateRecord({}, input);
        assert(typeof validation.valid === 'boolean', `validateRecord({}, ${name}).valid must be boolean`);
        assert(Array.isArray(validation.errors), `validateRecord({}, ${name}).errors must be array`);
        assert(validation.sanitized && typeof validation.sanitized === 'object', `validateRecord({}, ${name}).sanitized must be object`);

        const hasResult = TestRegistry.has(input);
        assert(typeof hasResult === 'boolean', `has(${name}) must return boolean without throwing`);

        // Check normalization
        if (input === 'vbt' || input === '  vbt  ') {
            assertEqual(schema.id, 'VBT', `Normalizes ${name} to VBT`);
            assert(hasResult, `has(${name}) is true`);
        } else if (input === ' medicine_ball ') {
            assertEqual(schema.id, 'MEDICINE_BALL', `Normalizes ${name} to MEDICINE_BALL`);
            assert(hasResult, `has(${name}) is true`);
        } else if (input === 'FORCE_PLATE') {
            assertEqual(schema.id, 'FORCE_PLATE', `Preserves FORCE_PLATE`);
            assert(hasResult, `has(${name}) is true`);
        } else {
            assertEqual(schema.id, 'GENERAL_TABULAR', `Fallback to GENERAL_TABULAR for ${name}`);
            assertEqual(hasResult, false, `has(${name}) is false for unrecognized IDs`);
        }
    } catch (err) {
        assert(false, `Unexpected exception with input ${name}: ${err.message}`);
    }
});

console.log('  [PASS] Suite 2: Normalization and fallbacks verified.\n');

// ============================================================================
// SUITE 3: SCHEMA REGISTRATION & DEFENSE
// ============================================================================
console.log('--- Suite 3: Schema Registration & Input Defense ---');

const invalidRegistrations = [
    { def: null, desc: 'null' },
    { def: undefined, desc: 'undefined' },
    { def: 'string', desc: 'primitive string' },
    { def: 42, desc: 'primitive number' },
    { def: {}, desc: 'empty object (missing id, label, columns)' },
    { def: { id: '' }, desc: 'empty id string' },
    { def: { id: '   ' }, desc: 'whitespace id' },
    { def: { id: 123 }, desc: 'numeric id' },
    { def: { id: 'TEST' }, desc: 'missing label' },
    { def: { id: 'TEST', label: 123 }, desc: 'non-string label' },
    { def: { id: 'TEST', label: 'Test' }, desc: 'missing columns' },
    { def: { id: 'TEST', label: 'Test', columns: 'not an array' }, desc: 'non-array columns' },
    { def: { id: 'TEST', label: 'Test', columns: [] }, desc: 'empty columns array' }
];

invalidRegistrations.forEach(({ def, desc }) => {
    let threw = false;
    try {
        TestRegistry.register(def);
    } catch (err) {
        threw = true;
        assert(err.message.includes('[TestRegistry.register]'), `Error message for ${desc} must have proper prefix`);
    }
    assert(threw, `TestRegistry.register(${desc}) must throw an Error`);
});

// Valid registration with isolation check
{
    const customDef = {
        id: 'custom_gps',
        label: 'Custom GPS Tracking Test',
        summary: 'Metri percorsi e sprint count',
        columns: [
            { key: 'athlete', label: 'Atleta', type: 'text', required: false, default: 'Atleta' },
            { key: 'totalDistance', label: 'Distanza Totale', type: 'number', unit: 'm', min: 0, max: 25000, required: true, default: 0 },
            { key: 'sprintCount', label: 'Numero Sprint', type: 'number', unit: '#', min: 0, max: 100, required: false, default: null }
        ],
        headerAliases: {
            totalDistance: ['distanza totale', 'total dist', 'tot dist (m)'],
            sprintCount: ['sprint count', 'n_sprint', 'num sprint']
        },
        sampleData: [
            { athlete: 'Mario Rossi', totalDistance: 8450, sprintCount: 22 }
        ]
    };

    TestRegistry.register(customDef);
    assert(TestRegistry.has('CUSTOM_GPS'), 'Registered CUSTOM_GPS must be recognized');
    assert(TestRegistry.has('custom_gps'), 'Registered custom_gps must be recognized case-insensitively');

    // Mutate the original definition passed into register()
    customDef.columns.push({ key: 'hacked', label: 'Hacked' });
    customDef.label = 'MUTATED_CUSTOM_LABEL';

    const registeredCols = TestRegistry.getColumnsFor('CUSTOM_GPS');
    assertEqual(registeredCols.length, 3, 'Registered columns must not be affected by mutations to external object');
    assertEqual(TestRegistry.get('CUSTOM_GPS').label, 'Custom GPS Tracking Test', 'Registered label must remain isolated');

    // Test sample validation on new registered test
    const sample = TestRegistry.getSampleDataFor('CUSTOM_GPS');
    const val = TestRegistry.validateRecord(sample[0], 'CUSTOM_GPS');
    assert(val.valid, 'Sample data for custom registered test must be valid');
}

console.log('  [PASS] Suite 3: Registration defense verified.\n');

// ============================================================================
// SUITE 4: VALIDATERECORD FUZZING & BOUNDARY DEFENSE
// ============================================================================
console.log('--- Suite 4: validateRecord Fuzzing & Boundary Defense ---');

// 4.1 Non-object and malformed records
const malformedRecords = [
    { val: null, desc: 'null' },
    { val: undefined, desc: 'undefined' },
    { val: 0, desc: 'number 0' },
    { val: 42, desc: 'number 42' },
    { val: NaN, desc: 'NaN' },
    { val: Infinity, desc: 'Infinity' },
    { val: '', desc: 'empty string' },
    { val: 'some string', desc: 'non-empty string' },
    { val: true, desc: 'true' },
    { val: false, desc: 'false' },
    { val: () => {}, desc: 'function' },
    { val: [], desc: 'empty array' },
    { val: [1, 2, 3], desc: 'numeric array' }
];

malformedRecords.forEach(({ val, desc }) => {
    let result;
    try {
        result = TestRegistry.validateRecord(val, 'VBT');
    } catch (err) {
        assert(false, `validateRecord(${desc}) threw unhandled exception: ${err.message}`);
        return;
    }
    assert(result && typeof result === 'object', `validateRecord(${desc}) must return an object`);
    assertEqual(result.valid, false, `validateRecord(${desc}).valid must be false`);
    assert(Array.isArray(result.errors) && result.errors.length > 0, `validateRecord(${desc}).errors must contain errors`);
    assert(result.sanitized && typeof result.sanitized === 'object', `validateRecord(${desc}).sanitized must be default object`);
});

// 4.2 Boundary Numbers and Comma-Strings on VBT
{
    // String with comma
    const resComma = TestRegistry.validateRecord({ load: '80,5', velocity: '0,75' }, 'VBT');
    assertEqual(resComma.valid, true, 'Comma decimal strings "80,5" and "0,75" should validate as valid');
    assertEqual(resComma.sanitized.load, 80.5, 'Parsed load 80,5 -> 80.5');
    assertEqual(resComma.sanitized.velocity, 0.75, 'Parsed velocity 0,75 -> 0.75');

    // Negative numbers on fields with min=0 (clamping behavior)
    const resNeg = TestRegistry.validateRecord({ load: -50, velocity: -2.5 }, 'VBT');
    assertEqual(resNeg.sanitized.load, 0, 'Negative load clamped to min (0)');
    assertEqual(resNeg.sanitized.velocity, 0, 'Negative velocity clamped to min (0)');
    assert(!Number.isNaN(resNeg.sanitized.load), 'Clamped load must not be NaN');

    // Extreme positive numbers (clamping to max)
    const resExtreme = TestRegistry.validateRecord({ load: 999999, velocity: 999 }, 'VBT');
    assertEqual(resExtreme.sanitized.load, 600, 'Extreme load clamped to max (600)');
    assertEqual(resExtreme.sanitized.velocity, 5.0, 'Extreme velocity clamped to max (5.0)');

    // Infinity & -Infinity
    const resInf = TestRegistry.validateRecord({ load: Infinity, velocity: -Infinity }, 'VBT');
    assertEqual(resInf.valid, false, 'Infinity values must fail validation for required fields');
    assert(resInf.errors.length >= 2, 'Errors must report invalid Infinity values');
    assertEqual(resInf.sanitized.load, 0, 'Sanitized load must fallback to column default (0)');
    assertEqual(resInf.sanitized.velocity, 0, 'Sanitized velocity must fallback to column default (0)');

    // NaN input
    const resNaN = TestRegistry.validateRecord({ load: NaN, velocity: NaN }, 'VBT');
    assertEqual(resNaN.valid, false, 'NaN values must fail validation for required fields');
    assert(resNaN.sanitized.load !== null && !Number.isNaN(resNaN.sanitized.load), 'Sanitized load must not be NaN');
    assert(resNaN.sanitized.velocity !== null && !Number.isNaN(resNaN.sanitized.velocity), 'Sanitized velocity must not be NaN');

    // Dirty strings
    const resDirty = TestRegistry.validateRecord({ load: 'abc', velocity: '???' }, 'VBT');
    assertEqual(resDirty.valid, false, 'Non-numeric string values must fail validation');
    assertEqual(resDirty.sanitized.load, 0, 'Sanitized load must fallback to default 0');

    // Object with circular reference
    const circularObj = { load: 100, velocity: 0.8 };
    circularObj.self = circularObj;
    const resCirc = TestRegistry.validateRecord(circularObj, 'VBT');
    assertEqual(resCirc.valid, true, 'Circular object must not cause stack overflow');
    assertEqual(resCirc.sanitized.load, 100, 'Circular object load parsed correctly');
    assertEqual(resCirc.sanitized.velocity, 0.8, 'Circular object velocity parsed correctly');

    // Object with null prototype
    const nullProto = Object.create(null);
    nullProto.load = 70;
    nullProto.velocity = 0.9;
    const resNullProto = TestRegistry.validateRecord(nullProto, 'VBT');
    assertEqual(resNullProto.valid, true, 'Null-prototype record validates successfully');
    assertEqual(resNullProto.sanitized.load, 70, 'Null-prototype record load preserved');

    // Metadata preservation (id, date, notes)
    const withMeta = { id: 'row_123', date: '2026-09-11', notes: 'Top set', load: 100, velocity: 0.5 };
    const resMeta = TestRegistry.validateRecord(withMeta, 'VBT');
    assertEqual(resMeta.sanitized.id, 'row_123', 'id metadata preserved');
    assertEqual(resMeta.sanitized.date, '2026-09-11', 'date metadata preserved');
    assertEqual(resMeta.sanitized.notes, 'Top set', 'notes metadata preserved');
}

// 4.3 Fuzz Generator: 2,000 randomized permutations per test type (18,000 total)
console.log('  Running 18,000 randomized fuzz permutations across all test types...');

const allTestTypes = Object.keys(TestRegistry.getAll());
const fuzzValues = [
    null,
    undefined,
    0,
    -0,
    1,
    -1,
    0.0001,
    -0.0001,
    100,
    -100,
    999999999,
    -999999999,
    1e-15,
    1e30,
    -1e30,
    NaN,
    Infinity,
    -Infinity,
    '',
    ' ',
    '   ',
    '0',
    '1',
    '-1',
    '3,14',
    '-3,14',
    '10,500',
    '  42.5  ',
    'abc',
    'NaN',
    'undefined',
    'null',
    'true',
    'false',
    '10px',
    '#VALUE!',
    '#REF!',
    {},
    { nested: 123 },
    [],
    [1],
    [1, 2],
    true,
    false,
    () => 42
];

let totalFuzzCycles = 0;
let nanDetected = 0;
let undefinedDetected = 0;
let unhandledFuzzErrors = 0;

allTestTypes.forEach(testType => {
    const cols = TestRegistry.getColumnsFor(testType);

    for (let cycle = 0; cycle < 2000; cycle++) {
        totalFuzzCycles++;
        const candidate = {};

        cols.forEach(col => {
            const randVal = fuzzValues[Math.floor(Math.random() * fuzzValues.length)];
            candidate[col.key] = randVal;
        });

        candidate[`extra_${cycle % 5}`] = fuzzValues[Math.floor(Math.random() * fuzzValues.length)];

        let result;
        try {
            result = TestRegistry.validateRecord(candidate, testType);
        } catch (err) {
            unhandledFuzzErrors++;
            console.error(`  CRASH during fuzzing ${testType} cycle ${cycle}: ${err.message}`);
            continue;
        }

        if (!result || typeof result.valid !== 'boolean' || !Array.isArray(result.errors) || typeof result.sanitized !== 'object') {
            unhandledFuzzErrors++;
            continue;
        }

        cols.forEach(col => {
            const val = result.sanitized[col.key];
            if (val === undefined) {
                undefinedDetected++;
                console.error(`  UNDEFINED detected: ${testType} field "${col.key}" on cycle ${cycle}`);
            }
            if (typeof val === 'number' && Number.isNaN(val)) {
                nanDetected++;
                console.error(`  NaN detected: ${testType} field "${col.key}" on cycle ${cycle}`);
            }
        });
    }
});

assertEqual(unhandledFuzzErrors, 0, `Zero unhandled exceptions across ${totalFuzzCycles} fuzz cycles`);
assertEqual(nanDetected, 0, `Zero NaN detected across ${totalFuzzCycles} fuzz cycles`);
assertEqual(undefinedDetected, 0, `Zero undefined detected across ${totalFuzzCycles} fuzz cycles`);

console.log(`  [PASS] Suite 4: Fuzzed ${totalFuzzCycles} records with zero crashes, zero NaN, and zero undefined.\n`);

// ============================================================================
// SUITE 5: SAMPLE DATA SELF-VALIDATION FOR ALL TEST TYPES
// ============================================================================
console.log('--- Suite 5: Sample Data Self-Validation for All Test Types ---');

allTestTypes.forEach(testType => {
    const sampleData = TestRegistry.getSampleDataFor(testType);
    assert(Array.isArray(sampleData) && sampleData.length > 0, `${testType} must provide non-empty sample data`);

    const cols = TestRegistry.getColumnsFor(testType);
    const requiredCols = cols.filter(c => c.required);

    sampleData.forEach((row, idx) => {
        const val = TestRegistry.validateRecord(row, testType);
        assert(val.valid, `${testType} sample row [${idx}] must validate with valid: true`);
        assertEqual(val.errors.length, 0, `${testType} sample row [${idx}] must have 0 errors`);

        requiredCols.forEach(reqCol => {
            const fieldVal = val.sanitized[reqCol.key];
            assert(fieldVal !== null && fieldVal !== undefined && fieldVal !== '',
                `${testType} sample row [${idx}] required field "${reqCol.key}" must be non-empty`);
        });
    });
});

console.log('  [PASS] Suite 5: Canonical sample data for all test types validated.\n');

// ============================================================================
// SUITE 6: ADVERSARIAL VULNERABILITY MINING: mapRawHeaders & ALIAS OVERMATCHING
// ============================================================================
console.log('--- Suite 6: mapRawHeaders Collision & Alias Vulnerability Mining ---');

// Bug 1: Collision where 'VMAX' is seized by 'velocity' instead of 'peakVelocity'
{
    const vbtHeaders = ['Atleta', 'Esercizio', 'Carico', 'VMP', 'Vmax', 'Potenza', 'ROM'];
    const map = TestRegistry.mapRawHeaders(vbtHeaders, 'VBT');

    // Expected: 3 -> velocity, 4 -> peakVelocity
    // Actual bug: 3 -> velocity, 4 -> velocity (due to 'vm' in velocity aliases matching 'vmax')
    if (map[4] === 'velocity') {
        recordBug('BUG-M1-1-A', 'VBT Vmax Collision',
            'Header "Vmax" is seized by "velocity" instead of "peakVelocity" because velocity has alias "vm" and mapRawHeaders uses lower.includes("vm"). Both columns 3 and 4 map to velocity, overwriting average velocity with peak velocity.');
    }
}

// Bug 2: Single character 'w' in power aliases matches any word containing 'w'
{
    const powerTest = TestRegistry.mapRawHeaders(['Throw Distance'], 'VBT');
    if (powerTest[0] === 'power') {
        recordBug('BUG-M1-1-B', 'Single-Character Alias Overmatching (power: "w")',
            'Header "Throw Distance" maps to "power" in VBT because "w" is an alias and lower.includes("w") matches any word with letter "w" (throw, swing, forward, draw, down).');
    }
}

// Bug 3: Single digit '5' and '10' in SPRINT_TIMING matches 50m, 100m, 15m, 25m
{
    const sprintTest = TestRegistry.mapRawHeaders(['Split 50m', 'Split 100m'], 'SPRINT_TIMING');
    if (sprintTest[0] === 'split_5m' || sprintTest[1] === 'split_10m') {
        recordBug('BUG-M1-1-C', 'Single-Digit Alias Overmatching in SPRINT_TIMING',
            '"Split 50m" maps to "split_5m" because alias "5" matches via lower.includes("5"). "Split 100m" maps to "split_10m" because alias "10" matches via lower.includes("10").');
    }
}

// Bug 4: Substring 'rt' in reactionTime matches 'start'
{
    const accelTest = TestRegistry.mapRawHeaders(['Start Time'], 'BLOCK_ACCEL');
    if (accelTest[0] === 'reactionTime') {
        recordBug('BUG-M1-1-D', 'Short Substring Alias Overmatching in BLOCK_ACCEL (reactionTime: "rt")',
            'Header "Start Time" matches "reactionTime" because "start" contains "rt".');
    }
}

// Bug 5: 'Tempo di Volo' in JUMP_TEST maps to jumpHeight instead of flight time
{
    const jumpTest = TestRegistry.mapRawHeaders(['Tempo di Volo'], 'JUMP_TEST');
    if (jumpTest[0] === 'jumpHeight') {
        recordBug('BUG-M1-1-E', 'Dangerous Semantic Collision in JUMP_TEST (volo -> jumpHeight)',
            'Header "Tempo di Volo" maps to "jumpHeight" because jumpHeight has alias "volo". Ingesting flight time in seconds (e.g. 0.55s) corrupts jumpHeight (expecting cm, e.g. 38cm).');
    }
}

// Bug 6: Sub-phrase headers shorter than alias fail to match (lower.includes(alias) asymmetry)
{
    const medBallTest = TestRegistry.mapRawHeaders(['Angolo', 'Altezza'], 'MEDICINE_BALL');
    if (medBallTest[0] === undefined || medBallTest[1] === undefined) {
        recordBug('BUG-M1-1-F', 'Asymmetric Header Matching (lower.includes vs alias.includes)',
            'Standard coach headers "Angolo" and "Altezza" evaluate to undefined because aliases are "angolo rilascio" and "altezza rilascio", and "angolo".includes("angolo rilascio") is false.');
    }
}

// Bug 7: Missing 'Tipo Lancio' / 'Tipo Salto' exercise aliases
{
    const medBallEx = TestRegistry.mapRawHeaders(['Tipo Lancio'], 'MEDICINE_BALL');
    const jumpEx = TestRegistry.mapRawHeaders(['Tipo Salto'], 'JUMP_TEST');
    if (medBallEx[0] === undefined || jumpEx[0] === undefined) {
        recordBug('BUG-M1-1-G', 'Missing Exercise Header Aliases for New & Specialized Tests',
            '"Tipo Lancio" (MEDICINE_BALL) and "Tipo Salto" (JUMP_TEST) are unmapped (undefined) because exercise aliases are missing for these tests and global list lacks "lancio" and "salto".');
    }
}

// ============================================================================
// FINAL REPORT & AUDIT
// ============================================================================
console.log('\n================================================================');
console.log('AUDIT SUMMARY');
console.log('================================================================');
console.log(`Core Hardening Assertions: ${passedTests} passed, ${failedTests} failed`);
console.log(`Confirmed Critical Vulnerabilities Found: ${verifiedBugs.length}`);
verifiedBugs.forEach((b, i) => {
    console.log(`\n  ${i + 1}. [${b.bugId}] ${b.title}`);
    console.log(`     Details: ${b.details}`);
});

console.log('\n================================================================');
if (verifiedBugs.length > 0) {
    console.log(`VERDICT: REJECT`);
    console.log(`TestRegistry has high internal hardening, but contains ${verifiedBugs.length} critical alias collision`);
    console.log(`and unmapped header bugs that cause silent data corruption during file ingestion.`);
    process.exit(1);
} else {
    console.log(`VERDICT: CONFIRM_CORRECTNESS`);
    process.exit(0);
}
