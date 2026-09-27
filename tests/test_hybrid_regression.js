const fs = require('fs');
const path = require('path');

// Mock browser window object
global.window = {};

// Load physics-engine.js dynamically
const physicsPath = path.join(__dirname, '..', 'js', 'physics-engine.js');
const physicsCode = fs.readFileSync(physicsPath, 'utf8');
eval(physicsCode);
const PhysicsEngine = global.window.PhysicsEngine;

let passed = 0, failed = 0;

function assert(condition, name, info = '') {
    if (condition) {
        console.log(`  ✅ PASS  ${name}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL  ${name}  ${info}`);
        failed++;
    }
}

function assertClose(actual, expected, tol, name) {
    const err = Math.abs(actual - expected);
    const relErr = expected !== 0 ? err / Math.abs(expected) : err;
    assert(relErr <= tol, name, `actual=${actual}, expected=${expected}, relErr=${(relErr * 100).toFixed(4)}%`);
}

function section(title) {
    console.log(`\n── ${title} ─────────────────────────────────────`);
}

console.log("==========================================================");
console.log("   VERIFICATION SUITE: HYBRID REGRESSION & PRECISION      ");
console.log("==========================================================");

// 1. Dynamic Model Selection
section("1. Dynamic Model Selection (Linear vs Quadratic)");

// Straight linear dataset (Squat)
const straightDataset = [
    { load: 40,  velocity: 0.960 },
    { load: 60,  velocity: 0.840 },
    { load: 80,  velocity: 0.720 },
    { load: 100, velocity: 0.600 },
    { load: 120, velocity: 0.480 },
    { load: 140, velocity: 0.360 }
];
const modelStraight = PhysicsEngine.autoSelectRegressionVBT(straightDataset);
assert(modelStraight !== null, "Model result is not null for straight dataset");
assert(modelStraight.modelType === 'linear', "Straight dataset selects 'linear' model", `got=${modelStraight.modelType}`);

// Curvilinear dataset with prominent second-order curvature
const curvedDataset = [
    { load: 30,  velocity: 1.150 },
    { load: 50,  velocity: 0.980 },
    { load: 70,  velocity: 0.820 },
    { load: 90,  velocity: 0.640 },
    { load: 110, velocity: 0.440 },
    { load: 130, velocity: 0.210 }
];
const modelCurved = PhysicsEngine.autoSelectRegressionVBT(curvedDataset);
assert(modelCurved !== null, "Model result is not null for curved dataset");
assert(modelCurved.modelType === 'quadratic', "Curvilinear dataset selects 'quadratic' model", `got=${modelCurved.modelType}`);

// Small sample dataset (n = 3) - should force linear regression despite curvature
const smallDataset = [
    { load: 40, velocity: 0.900 },
    { load: 80, velocity: 0.650 },
    { load: 120, velocity: 0.300 }
];
const modelSmall = PhysicsEngine.autoSelectRegressionVBT(smallDataset);
assert(modelSmall !== null, "Model result is not null for small dataset (n=3)");
assert(modelSmall.modelType === 'linear', "Small sample (n=3) defaults to 'linear' model", `got=${modelSmall.modelType}`);


// 2. 95% Confidence Interval for 1RM
section("2. 1RM 95% Confidence Interval Calculation");

const rm1Result = PhysicsEngine.estimate1RM(modelStraight, 0.30, { detailed: true });
assert(typeof rm1Result === 'object', "estimate1RM with {detailed: true} returns object");
assert(rm1Result.estimated > 0, "Estimated 1RM is positive", `estimated=${rm1Result.estimated}`);
assert(rm1Result.margin > 0, "CI 95% margin is calculated and non-zero", `margin=${rm1Result.margin}`);
assert(Array.isArray(rm1Result.ci95) && rm1Result.ci95.length === 2, "ci95 is a tuple [min, max]");
assert(rm1Result.ci95[0] < rm1Result.estimated && rm1Result.ci95[1] > rm1Result.estimated, "Estimated 1RM is strictly within [ci95Min, ci95Max]");
assert(Math.abs((rm1Result.ci95Max - rm1Result.estimated) - rm1Result.margin) < 1e-6, "Margin equals ci95Max - estimated");


// 3. Biomechanical Parameters Accuracy
section("3. Biomechanical Parameters (F0, V0, Pmax)");

const analysis = PhysicsEngine.analyzeLoadVelocity(straightDataset);
assert(analysis !== null, "analyzeLoadVelocity returns analysis object");
assert(analysis.v0 > 0, "V0 is positive", `V0=${analysis.v0}`);
assert(analysis.f0 > 0, "F0 is positive", `F0=${analysis.f0}`);
assert(analysis.pmax > 0, "Pmax is positive", `Pmax=${analysis.pmax}`);
assert(analysis.rm1 && analysis.rm1.estimated > 0, "Interface contract rm1.estimated is present and positive");
assert(analysis.rm1.margin > 0, "Interface contract rm1.margin is present and non-zero");


// 4. Median Absolute Deviation (MAD) Outlier Removal
section("4. Robust Residual MAD Outlier Filtering");

const noisyDatasetWithOutlier = [
    ...straightDataset,
    { load: 70, velocity: 1.60 } // Severe outlier
];
const quadWithOutlier = PhysicsEngine.quadraticRegressionVBT(noisyDatasetWithOutlier);
assert(quadWithOutlier !== null, "Quadratic regression executes on dataset with outlier");
assert(quadWithOutlier.outlierCount >= 1, "MAD filter successfully identified and removed outlier", `outlierCount=${quadWithOutlier.outlierCount}`);


// SUMMARY
console.log('\n══════════════════════════════════════════════════');
console.log(`  RESULTS: ${passed} PASS  /  ${failed} FAIL  /  ${passed + failed} TOTAL`);
if (failed === 0) {
    console.log('  ✅ ALL TESTS PASSED — Milestone 1 implementation verified.');
} else {
    console.error(`  ❌ ${failed} TESTS FAILED — check formulas.`);
    process.exit(1);
}