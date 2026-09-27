/**
 * test_bryan_mann_stress.js
 * Adversarial stress testing suite for PhysicsEngine.generateBryanMannVBTTable and VBT calculations.
 */

const fs = require('fs');
const path = require('path');

// 1. Mock browser environment if running in Node-like environment
if (typeof window === 'undefined') {
    global.window = {};
}

// Load physics-engine.js if PhysicsEngine is not yet defined
if (typeof window.PhysicsEngine === 'undefined') {
    const physicsPath = path.join(__dirname, '..', 'js', 'physics-engine.js');
    const physicsCode = fs.readFileSync(physicsPath, 'utf8');
    eval(physicsCode);
}

const PhysicsEngine = window.PhysicsEngine;

console.log("=== EMPIRICAL CHALLENGER: BRYAN MANN VBT TABLE STRESS TEST SUITE ===");

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
    totalTests++;
    if (!condition) {
        console.error(`❌ [FAIL] ${message}`);
    } else {
        console.log(`✅ [PASS] ${message}`);
        passedTests++;
    }
}

// Helper to create a standard regression mock
function createMockRegression(slope = -0.01, intercept = 1.4) {
    return {
        modelType: 'linear',
        slope: slope,
        intercept: intercept,
        rSquared: 0.98,
        v0: intercept,
        f0: (Math.abs(slope) > 1e-6) ? -intercept / slope : 0,
        f0_N: ((Math.abs(slope) > 1e-6) ? -intercept / slope : 0) * 9.81,
        pmax: 500,
        pmaxLoad: 70,
        pmaxVelocity: 0.7,
        predictVelocity: (load) => slope * load + intercept,
        predictLoad: (vel) => (Math.abs(slope) < 1e-9) ? 0 : (vel - intercept) / slope
    };
}

// =========================================================================
// TEST SUITE 1: Edge Cases for 1RM and Missing Regression Objects
// =========================================================================
console.log("\n--- SUITE 1: 1RM Edge Cases & Missing Regression ---");

const validReg = createMockRegression();

// Test 1.1: Zero 1RM
const resZero = PhysicsEngine.generateBryanMannVBTTable(0, validReg);
assert(Array.isArray(resZero) && resZero.length === 0, "Zero 1RM (oneRM = 0) returns empty array []");

// Test 1.2: Negative 1RM
const resNeg = PhysicsEngine.generateBryanMannVBTTable(-50, validReg);
assert(Array.isArray(resNeg) && resNeg.length === 0, "Negative 1RM (oneRM = -50) returns empty array []");

// Test 1.3: Missing Regression Object (null / undefined)
const resNullReg = PhysicsEngine.generateBryanMannVBTTable(100, null);
assert(Array.isArray(resNullReg) && resNullReg.length === 0, "Null regression object returns empty array []");

const resUndefReg = PhysicsEngine.generateBryanMannVBTTable(100, undefined);
assert(Array.isArray(resUndefReg) && resUndefReg.length === 0, "Undefined regression object returns empty array []");

// Test 1.4: Infinite 1RM values
const resInfNeg = PhysicsEngine.generateBryanMannVBTTable(-Infinity, validReg);
assert(Array.isArray(resInfNeg) && resInfNeg.length === 0, "-Infinity 1RM returns empty array []");

const resInfPos = PhysicsEngine.generateBryanMannVBTTable(Infinity, validReg);
assert(Array.isArray(resInfPos) && resInfPos.length === 5, "+Infinity 1RM handled via internal fallback, returns 5 rows");
if (resInfPos.length === 5) {
    let hasNaNOrInf = false;
    resInfPos.forEach(row => {
        if (!Number.isFinite(row.load2_5kg) || !Number.isFinite(row.forceN) || !Number.isFinite(row.powerW) || !Number.isFinite(row.velocity)) {
            hasNaNOrInf = true;
        }
    });
    assert(!hasNaNOrInf, "+Infinity 1RM rows contain finite numeric values (zero NaN/Infinity)");
}

// Test 1.5: Non-number inputs for 1RM (strings, objects, NaN)
const resNaN = PhysicsEngine.generateBryanMannVBTTable(NaN, validReg);
assert(Array.isArray(resNaN) && resNaN.length === 0, "NaN 1RM returns empty array []");

const resStr = PhysicsEngine.generateBryanMannVBTTable("100", validReg);
assert(Array.isArray(resStr) && resStr.length === 0, "String 1RM ('100') rejected by type guard, returns empty array []");


// =========================================================================
// TEST SUITE 2: Regression Slopes & Malformed Regression Objects
// =========================================================================
console.log("\n--- SUITE 2: Regression Slopes & Malformed Objects ---");

// Test 2.1: Steep negative slope causing predicted velocity < 0
const steepReg = createMockRegression(-0.03, 1.0); // At load 50kg, V = -0.5 m/s
const resSteep = PhysicsEngine.generateBryanMannVBTTable(100, steepReg);
assert(resSteep.length === 5, "Steep negative slope returns 5 Bryan Mann zones");
let velocityClamped = true;
resSteep.forEach(row => {
    if (row.velocity < 0 || isNaN(row.velocity)) velocityClamped = false;
});
assert(velocityClamped, "Negative predicted velocities are safely clamped to >= 0");

// Test 2.2: Zero regression slope (flat curve)
const flatReg = createMockRegression(0, 1.2);
const resFlat = PhysicsEngine.generateBryanMannVBTTable(100, flatReg);
assert(resFlat.length === 5, "Zero regression slope returns 5 rows");

// Test 2.3: Malformed regression object (empty object {})
const resEmptyObj = PhysicsEngine.generateBryanMannVBTTable(100, {});
assert(resEmptyObj.length === 5, "Empty regression object {} handled gracefully, returns 5 rows");
assert(resEmptyObj[0].velocity === 0 && resEmptyObj[0].powerW === 0, "Velocity and power default to 0 when predictVelocity missing");

// Test 2.4: Malformed predictVelocity returning NaN, Infinity, undefined
const badPredictReg = {
    predictVelocity: (l) => NaN
};
const resBadPredict = PhysicsEngine.generateBryanMannVBTTable(100, badPredictReg);
assert(resBadPredict.length === 5, "Regression returning NaN velocity handled gracefully");
assert(resBadPredict[0].velocity === 0, "NaN velocity safely defaults to 0");

const infPredictReg = {
    predictVelocity: (l) => Infinity
};
const resInfPredict = PhysicsEngine.generateBryanMannVBTTable(100, infPredictReg);
assert(resInfPredict[0].velocity === 0, "Infinity velocity safely defaults to 0");


// =========================================================================
// TEST SUITE 3: Comprehensive Output Row Verification (Zero NaN / undefined)
// =========================================================================
console.log("\n--- SUITE 3: Row Output Schema & String Formatting Verification ---");

const test1RMList = [40, 70, 100, 150, 220];
const testExercises = ['Bench Press', 'Squat', 'Deadlift', 'Panca Piana', 'Stacco da Terra', 'Tirate', '', null, 123];

let totalRowsChecked = 0;
let invalidRowsFound = 0;

test1RMList.forEach(oneRM => {
    testExercises.forEach(ex => {
        const table = PhysicsEngine.generateBryanMannVBTTable(oneRM, validReg, ex);
        if (!Array.isArray(table) || table.length !== 5) {
            invalidRowsFound++;
            return;
        }
        table.forEach(row => {
            totalRowsChecked++;
            // Verify properties exist and are not undefined
            const requiredKeys = ['zone', 'pctRange', 'targetVelocity', 'medianPct', 'loadRaw', 'load2_5kg', 'velocity', 'forceN', 'powerW', 'color'];
            requiredKeys.forEach(k => {
                if (row[k] === undefined || row[k] === null) {
                    invalidRowsFound++;
                }
            });

            // Verify numeric string formatted representations (as used in UI rendering)
            const loadStr = String(row.load2_5kg);
            const velStr = String(row.velocity);
            const forceStr = String(row.forceN);
            const powerStr = String(row.powerW);

            if (loadStr.includes('NaN') || loadStr.includes('undefined') ||
                velStr.includes('NaN') || velStr.includes('undefined') ||
                forceStr.includes('NaN') || forceStr.includes('undefined') ||
                powerStr.includes('NaN') || powerStr.includes('undefined')) {
                invalidRowsFound++;
            }
        });
    });
});

assert(totalRowsChecked > 0, `Checked ${totalRowsChecked} rows across multiple 1RM values and exercise profiles`);
assert(invalidRowsFound === 0, `Zero NaN or undefined found across all ${totalRowsChecked} generated rows`);

// =========================================================================
// TEST SUITE SUMMARY
// =========================================================================
console.log(`\n==================================================`);
console.log(`🎯 BRYAN MANN VBT STRESS TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log(`==================================================\n`);

if (typeof process !== 'undefined' && process.exit) {
    process.exit(passedTests === totalTests ? 0 : 1);
}
