const assert = require('assert');
const fs = require('fs');
const path = require('path');
global.window = { App: {} };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.document = {
    head: { appendChild: () => {} },
    getElementById: () => null,
    createElement: () => ({ style: {}, innerHTML: '', textContent: '', appendChild: () => {}, setAttribute: () => {} })
};
const root = path.resolve('.');
function load(file) { eval(fs.readFileSync(path.join(root, file), 'utf8')); }
load('js/data/taxonomy.js');
load('js/data/conditions.js');
load('js/data/exercises.js');
load('js/data/init.js');
load('js/data/filters.js');
load('js/ui/exercise-detail-resolver.js');

console.log('--- STARTING ADVERSARIAL STRESS TESTING ---');
function assertNoLeaks(res, label) {
    assert(res, label + ': result must be truthy');
    assert(typeof res === 'object', label + ': result must be object');
    const checkString = (s, field) => {
        if (typeof s === 'string') {
            assert(!s.includes('undefined'), label + '.' + field + ' contains undefined: ' + s);
            assert(!s.includes('[object Object]'), label + '.' + field + ' contains [object Object]: ' + s);
            assert(s !== 'N/A' && !s.includes('"N/A"'), label + '.' + field + ' contains N/A: ' + s);
        }
    };
    checkString(res.id, 'id');
    checkString(res.name, 'name');
    checkString(res.primaryMuscle, 'primaryMuscle');
    checkString(res.type, 'type');
    checkString(res.equipment, 'equipment');
    checkString(res.level, 'level');
    checkString(res.tagline, 'tagline');
    checkString(res.description, 'description');
    if (res.execution) {
        checkString(res.execution.context, 'execution.context');
        assert(Array.isArray(res.execution.setup), label + ': setup must be array');
        res.execution.setup.forEach((x, i) => checkString(x, 'execution.setup[' + i + ']'));
        assert(Array.isArray(res.execution.steps), label + ': steps must be array');
        res.execution.steps.forEach((x, i) => checkString(x, 'execution.steps[' + i + ']'));
        assert(Array.isArray(res.execution.cues), label + ': cues must be array');
        res.execution.cues.forEach((x, i) => checkString(x, 'execution.cues[' + i + ']'));
        assert(Array.isArray(res.execution.criteria), label + ': criteria must be array');
        res.execution.criteria.forEach((x, i) => checkString(x, 'execution.criteria[' + i + ']'));
    }
    if (res.errors) {
        assert(Array.isArray(res.execution.criteria), label + ': criteria must be array');
        res.errors.forEach((err, i) => {
            checkString(err.error, 'errors[' + i + '].error');
            checkString(err.why, 'errors[' + i + '].why');
            checkString(err.fix, 'errors[' + i + '].fix');
        });
    }
    if (res.specs) {
        checkString(res.specs.sets, 'specs.sets');
        checkString(res.specs.reps, 'specs.reps');
        checkString(res.specs.rest, 'specs.rest');
        checkString(res.specs.load, 'specs.load');
        checkString(res.specs.tempo, 'specs.tempo');
    }
}


function testSuite() {
    console.log('1. Testing non-string primitive types...');
    const primitives = [[123, 456], [true, false], [0, 0], [-1, -99], [NaN, Infinity]];
    primitives.forEach(([ id, name ], idx) => {
        const res = window.App.resolveExerciseDetail(id, name, null);
        assertNoLeaks(res, 'primitive_' + idx);
    });
    console.log('   Passed.');

    console.log('2. Testing empty and sparse schedules objects...');
    const sparseProgram = {
        phases: [
            { schedule: null },
            { schedule: [ { exercises: null }, { exercises: [ {id: 'bad1'} ] } ] },
            {
                id: 'valid_phase',
                schedule: [{ focus: '   ', exercises: [{ id: 'found_me', name: 'Exercise Under Chaos', specs: null, note: null }] }]
            }
        ]
    };
    const resChaos = window.App.resolveExerciseDetail('found_me', 'Exercise Under Chaos', { result: sparseProgram });
    assertNoLeaks(resChaos, 'corrupted_schedule');
    assert.strictEqual(resChaos.id, 'found_me');
    console.log('   Passed.');

    console.log('4. Testing resolution of all 296 catalog exercises...');
    const allEx = window.App.getExercises();
    let catResolved = 0;
    allEx.forEach((ex, idx) => {
        if (!ex) return;
        const res = window.App.resolveExerciseDetail(ex.id, ex.name, null);
        assertNoLeaks(res, 'catalog_ex_' + idx + '_' + ex.id);
        assert(res.tagline && res.tagline.length > 5, 'Empty tagline for ' + ex.id);
        catResolved++;
    });
    console.log('   Passed (' + catResolved + ' exercises verified).');

    console.log('5. Testing resolution of cli_01 to cli_32 with various patient types...');
    const patientTypes = ['Clinico', 'Clinico_Anziano', 'Sportivo', 'Sedentario'];
    for (let i = 1; i <= 32; i++) {
        const numStr = (i < 10 ? '0' : '') + i;
        const cliId = 'cli_' + numStr;
        const pType = patientTypes[i % patientTypes.length];
        const res = window.App.resolveExerciseDetail(cliId, 'Esercizio Adattato Clinico ' + cliId, {
            program: { meta: { patientType: pType, level: 'Adattato Clinico' } }
        });
        assertNoLeaks(res, 'clinical_' + cliId);
        assert.strictEqual(res.level, 'Adattato Clinico');
    }
    console.log('   Passed.');

    console.log('\n[=== ALL ADVERSARIAL STRESS TESTS SUCCESSFULLY PASSED! ===]');
}

testSuite();
