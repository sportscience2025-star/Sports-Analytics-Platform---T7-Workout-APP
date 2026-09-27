const fs = require('fs');
const path = require('path');

// Mock browser environment
global.window = {};

// Load physics-engine.js
const physicsPath = path.join(__dirname, '..', 'js', 'physics-engine.js');
const physicsCode = fs.readFileSync(physicsPath, 'utf8');
eval(physicsCode);
const PhysicsEngine = global.window.PhysicsEngine;

console.log("=== REGRESSION EDGE CASES: PHYSICS ENGINE AUTO-SELECT ===");

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
    totalTests++;
    if (!condition) {
        console.error(`❌ [FAIL] ${message}`);
        throw new Error(`Assertion Failed: ${message}`);
    } else {
        console.log(`✅ [PASS] ${message}`);
        passedTests++;
    }
}

try {
    // 1. Null input
    assert(PhysicsEngine.autoSelectRegressionVBT(null) === null, "autoSelectRegressionVBT(null) should return null");

    // 2. Undefined input
    assert(PhysicsEngine.autoSelectRegressionVBT(undefined) === null, "autoSelectRegressionVBT(undefined) should return null");

    // 3. Empty dataset
    assert(PhysicsEngine.autoSelectRegressionVBT([]) === null, "autoSelectRegressionVBT([]) should return null");

    // 4. Single point (less than 2 points)
    assert(PhysicsEngine.autoSelectRegressionVBT([{ load: 40, velocity: 1.0 }]) === null, "autoSelectRegressionVBT with 1 point should return null");

    // 5. Two points (less than 3 points, should fallback to linear model)
    const twoPoints = [
        { load: 40, velocity: 1.0 },
        { load: 60, velocity: 0.8 }
    ];
    const res2 = PhysicsEngine.autoSelectRegressionVBT(twoPoints);
    assert(res2 !== null, "autoSelectRegressionVBT with 2 points should be non-null");
    assert(res2.modelType === 'linear', "autoSelectRegressionVBT with 2 points should return linear model");
    assert(Math.abs(res2.slope - (-0.01)) < 1e-6, "VBT slope is correct");

    // 6. Malformed data points (null/undefined/NaN inside list)
    const malformed = [
        { load: null, velocity: 1.0 },
        { load: 40, velocity: undefined },
        { load: 60, velocity: NaN },
        { load: 80, velocity: 0.6 }
    ];
    // After filtering, there is only 1 point: {load: 80, velocity: 0.6} (since others have null/undefined/NaN).
    // So it should return null.
    assert(PhysicsEngine.autoSelectRegressionVBT(malformed) === null, "autoSelectRegressionVBT with malformed points leaving <2 points should return null");

    console.log(`\n==================================================`);
    console.log(`🎯 REGRESSION EDGE CASES SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
    console.log(`==================================================\n`);
    process.exit(0);

} catch (err) {
    console.error("❌ Exception during edge cases verification:", err);
    process.exit(1);
}