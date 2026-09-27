/**
 * test_empirical_challenger.js
 * Empirical stress-test script written by Challenger 5 to verify computations,
 * unpacking logic, and data bindings in js/data-analysis.js and js/physics-engine.js.
 */

const fs = require('fs');
const path = require('path');

// Setup global window context
global.window = global;

// Root project path
const rootDir = path.resolve(__dirname, '..', '..');

// Load physics engine code
const physicsPath = path.join(rootDir, 'js', 'physics-engine.js');
const physicsCode = fs.readFileSync(physicsPath, 'utf8');
eval(physicsCode);
const PhysicsEngine = global.window.PhysicsEngine;

let testCount = 0;
let passCount = 0;
let failCount = 0;

function assert(condition, testName, detail = '') {
    testCount++;
    if (condition) {
        passCount++;
        console.log(`  ✅ [PASS] ${testName}`);
    } else {
        failCount++;
        console.error(`  ❌ [FAIL] ${testName} ${detail}`);
    }
}

function isNumericAndNotNaN(val) {
    return typeof val === 'number' && !isNaN(val) && isFinite(val);
}

console.log('==========================================================');
console.log('   CHALLENGER 5 EMPIRICAL VERIFICATION & STRESS TEST      ');
console.log('==========================================================\n');

// ------------------------------------------------------------------
// SECTION 1: PhysicsEngine.estimate1RM detailed unpacking in renderVBTDashboard
// ------------------------------------------------------------------
console.log('── 1. Unpacking estimate1RM ({ detailed: true }) in renderVBTDashboard ──');

// Standard reference dataset
const stdData = [
    { load: 40, velocity: 1.15 },
    { load: 60, velocity: 0.95 },
    { load: 80, velocity: 0.75 },
    { load: 100, velocity: 0.55 }
];

const regStd = PhysicsEngine.linearRegressionVBT(stdData);
assert(regStd !== null, 'Standard linear regression returns valid object');

const mvt = 0.30;
const oneRM = PhysicsEngine.estimate1RM(regStd, mvt, { detailed: true });

assert(typeof oneRM === 'object' && oneRM !== null, 'estimate1RM with detailed:true returns object');
assert(isNumericAndNotNaN(oneRM.value), 'oneRM.value is valid number');
assert(isNumericAndNotNaN(oneRM.estimated), 'oneRM.estimated is valid number');
assert(isNumericAndNotNaN(oneRM.margin), 'oneRM.margin is valid number');
assert(isNumericAndNotNaN(oneRM.ci95Min), 'oneRM.ci95Min is valid number');
assert(isNumericAndNotNaN(oneRM.ci95Max), 'oneRM.ci95Max is valid number');
assert(Array.isArray(oneRM.ci95) && oneRM.ci95.length === 2, 'oneRM.ci95 is a 2-element tuple');

// Unpacking logic from data-analysis.js line 743-744
const oneRMVal = (oneRM && typeof oneRM === 'object') ? (oneRM.value ?? oneRM.estimated) : oneRM;
const rounded1RM = Math.round(oneRMVal / 2.5) * 2.5;

assert(isNumericAndNotNaN(oneRMVal), 'oneRMVal unpacked successfully');
assert(isNumericAndNotNaN(rounded1RM), 'rounded1RM is valid number');
assert(rounded1RM > 0, 'rounded1RM is positive for standard data');

// Simulating KPI dashboard HTML binding formatting (lines 767-768)
const formattedMargin = oneRM.margin != null ? oneRM.margin.toFixed(1) : '0.0';
const formattedCiMin  = oneRM.ci95Min != null ? oneRM.ci95Min.toFixed(1) : rounded1RM.toFixed(1);
const formattedCiMax  = oneRM.ci95Max != null ? oneRM.ci95Max.toFixed(1) : rounded1RM.toFixed(1);
const formattedVal    = oneRMVal.toFixed(2);

assert(!formattedMargin.includes('NaN'), 'Formatted margin contains no NaN');
assert(!formattedCiMin.includes('NaN'), 'Formatted ciMin contains no NaN');
assert(!formattedCiMax.includes('NaN'), 'Formatted ciMax contains no NaN');
assert(!formattedVal.includes('NaN'), 'Formatted oneRMVal contains no NaN');

// Load velocity table generation (line 745)
const zoneTable = PhysicsEngine.generateLoadVelocityTable(oneRMVal, regStd);
assert(Array.isArray(zoneTable) && zoneTable.length > 0, 'zoneTable generated successfully');

let tableHasNaN = false;
zoneTable.forEach(row => {
    if (Object.values(row).some(v => String(v).includes('NaN'))) tableHasNaN = true;
});
assert(!tableHasNaN, 'Load velocity table contains ZERO NaN values across all columns');

// VBT progression generation (line 746)
const progression = PhysicsEngine.generateVBTProgression(oneRMVal, regStd, 6);
assert(Array.isArray(progression) && progression.length === 6, 'progression generated successfully');

let progressionHasNaN = false;
progression.forEach(row => {
    if (Object.values(row).some(v => String(v).includes('NaN'))) progressionHasNaN = true;
});
assert(!progressionHasNaN, 'VBT progression table contains ZERO NaN values');

// ------------------------------------------------------------------
// SECTION 2: Edge Cases — Zero Confidence Bounds & Zero SEE
// ------------------------------------------------------------------
console.log('\n── 2. Datasets with Zero Confidence Bounds / Zero SEE ──');

// Perfect linear dataset (zero residual error)
const perfectData = [
    { load: 50, velocity: 1.0 },
    { load: 100, velocity: 0.6 }
];
const regPerfect = PhysicsEngine.linearRegressionVBT(perfectData);
assert(regPerfect.see === 0, 'Perfect dataset has see === 0');

const oneRMPerfect = PhysicsEngine.estimate1RM(regPerfect, 0.30, { detailed: true });
const oneRMValPerfect = (oneRMPerfect && typeof oneRMPerfect === 'object') ? (oneRMPerfect.value ?? oneRMPerfect.estimated) : oneRMPerfect;
const rounded1RMPerfect = Math.round(oneRMValPerfect / 2.5) * 2.5;

assert(isNumericAndNotNaN(oneRMValPerfect), 'Perfect dataset unpacks valid oneRMVal');
assert(isNumericAndNotNaN(rounded1RMPerfect), 'Perfect dataset unpacks valid rounded1RM');
assert(isNumericAndNotNaN(oneRMPerfect.margin), 'Perfect dataset margin is valid number');
// physics-engine.js line 522 uses `const see = regression.see || 0.01;` to enforce a conservative 0.01 floor when see is 0.
assert(oneRMPerfect.margin > 0, 'Perfect dataset applies safe conservative SEE floor (0.01), producing positive margin');
assert(oneRMPerfect.ci95Min < oneRMPerfect.value && oneRMPerfect.ci95Max > oneRMPerfect.value, 'Perfect dataset produces valid CI bounds around estimated value');

const tablePerfect = PhysicsEngine.generateLoadVelocityTable(oneRMValPerfect, regPerfect);
assert(tablePerfect.length > 0, 'Perfect dataset load velocity table generated');
let tablePerfectHasNaN = false;
tablePerfect.forEach(row => {
    if (Object.values(row).some(v => String(v).includes('NaN'))) tablePerfectHasNaN = true;
});
assert(!tablePerfectHasNaN, 'Perfect dataset load velocity table has ZERO NaN values');

// ------------------------------------------------------------------
// SECTION 3: Edge Cases — Unphysical or Degenerate Datasets
// ------------------------------------------------------------------
console.log('\n── 3. Unphysical & Degenerate Datasets ──');

// Collinear loads (all same load)
const collinearData = [
    { load: 60, velocity: 1.0 },
    { load: 60, velocity: 0.8 }
];
const regCollinear = PhysicsEngine.linearRegressionVBT(collinearData);
const oneRMCollinear = PhysicsEngine.estimate1RM(regCollinear, 0.30, { detailed: true });
const oneRMValCollinear = (oneRMCollinear && typeof oneRMCollinear === 'object') ? (oneRMCollinear.value ?? oneRMCollinear.estimated) : oneRMCollinear;
const rounded1RMCollinear = Math.round(oneRMValCollinear / 2.5) * 2.5;

assert(oneRMValCollinear === 0, 'Collinear dataset results in 1RM === 0');
assert(rounded1RMCollinear === 0, 'Collinear dataset results in rounded1RM === 0');
assert(isNumericAndNotNaN(rounded1RMCollinear), 'Collinear rounded1RM is valid number');

const tableCollinear = PhysicsEngine.generateLoadVelocityTable(oneRMValCollinear, regCollinear);
assert(Array.isArray(tableCollinear) && tableCollinear.length === 0, 'Collinear dataset table returns empty array safely');

const progCollinear = PhysicsEngine.generateVBTProgression(oneRMValCollinear, regCollinear, 6);
assert(progCollinear.length === 6, 'Collinear progression returns 6 rows safely');
let progCollinearHasNaN = false;
progCollinear.forEach(row => {
    if (Object.values(row).some(v => String(v).includes('NaN'))) progCollinearHasNaN = true;
});
assert(!progCollinearHasNaN, 'Collinear progression table has ZERO NaN values');

// Unphysical MVT (mvt >= v0)
const oneRMUnphysicalMVT = PhysicsEngine.estimate1RM(regStd, 2.50, { detailed: true });
const oneRMValUnphysicalMVT = (oneRMUnphysicalMVT && typeof oneRMUnphysicalMVT === 'object') ? (oneRMUnphysicalMVT.value ?? oneRMUnphysicalMVT.estimated) : oneRMUnphysicalMVT;
assert(oneRMValUnphysicalMVT === 0, 'Unphysical MVT returns 1RM === 0');
assert(oneRMUnphysicalMVT.margin === 0, 'Unphysical MVT margin is 0');
assert(oneRMUnphysicalMVT.ci95Min === 0 && oneRMUnphysicalMVT.ci95Max === 0, 'Unphysical MVT CI bounds are 0');

// ------------------------------------------------------------------
// SECTION 4: Missing Optional Fields in Regression Object
// ------------------------------------------------------------------
console.log('\n── 4. Missing Optional Fields in Regression Object ──');

const partialReg = {
    slope: -0.01,
    intercept: 1.5,
    v0: 1.5,
    f0: 150,
    f0_N: 1471.5,
    pmax: 551.8,
    modelType: 'linear'
    // Missing: see, n, meanV, ssVV, predictLoad, predictVelocity
};

const oneRMPartial = PhysicsEngine.estimate1RM(partialReg, 0.30, { detailed: true });
const oneRMValPartial = (oneRMPartial && typeof oneRMPartial === 'object') ? (oneRMPartial.value ?? oneRMPartial.estimated) : oneRMPartial;
const rounded1RMPartial = Math.round(oneRMValPartial / 2.5) * 2.5;

assert(isNumericAndNotNaN(oneRMValPartial), 'Partial regression object unpacks valid oneRMVal');
assert(isNumericAndNotNaN(rounded1RMPartial), 'Partial regression object unpacks valid rounded1RM');
assert(isNumericAndNotNaN(oneRMPartial.margin), 'Partial regression object calculates valid margin using defaults');

// ------------------------------------------------------------------
// SUMMARY
// ------------------------------------------------------------------
console.log('\n══════════════════════════════════════════════════');
console.log(`  RESULTS: ${passCount} PASS  /  ${failCount} FAIL  /  ${testCount} TOTAL`);
if (failCount === 0) {
    console.log('  ✅ ALL STANDALONE EMPIRICAL TESTS PASSED');
} else {
    console.log('  ❌ SOME TESTS FAILED');
}
console.log('══════════════════════════════════════════════════\n');
