const fs = require('fs');
const path = require('path');

// 1. Mock browser environment
global.window = {};

// Load physics-engine.js
const physicsPath = path.join(__dirname, '..', '..', 'js', 'physics-engine.js');
const physicsCode = fs.readFileSync(physicsPath, 'utf8');
eval(physicsCode);
const PhysicsEngine = global.window.PhysicsEngine;

console.log("=== EMPIRICAL CHALLENGER: PHYSICS ENGINE VERIFICATION SUITE ===");

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

// Pseudo-random number generator for deterministic seedable tests (Box-Muller transform for normal distribution)
function createRng(seed = 123456789) {
    let s = seed;
    return function() {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
}

function normalRandom(rng, mean = 0, stdDev = 1) {
    let u1 = rng();
    let u2 = rng();
    while (u1 <= 1e-15) u1 = rng(); // Avoid log(0)
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
}

// =========================================================================
// TEST SUITE 1: Interface & Basic Parameter Correctness
// =========================================================================
console.log("\n--- SUITE 1: Interface & Fundamental Math ---");

const linearData = [
    { load: 40, velocity: 1.0 },
    { load: 60, velocity: 0.8 },
    { load: 80, velocity: 0.6 },
    { load: 100, velocity: 0.4 }
];

const linRes = PhysicsEngine.linearRegressionVBT(linearData);
assert(linRes !== null, "Linear regression returned valid object");
assert(Math.abs(linRes.slope - (-0.01)) < 1e-5, `Slope correct (-0.01): got ${linRes.slope}`);
assert(Math.abs(linRes.intercept - 1.4) < 1e-5, `Intercept correct (1.4): got ${linRes.intercept}`);
assert(Math.abs(linRes.f0 - 140) < 1e-4, `F0 correct (140 kg): got ${linRes.f0}`);
assert(Math.abs(linRes.v0 - 1.4) < 1e-4, `V0 correct (1.4 m/s): got ${linRes.v0}`);
assert(Math.abs(linRes.pmax - (140 * 9.81 * 1.4 / 4)) < 1e-2, `Pmax formula correct: got ${linRes.pmax.toFixed(2)}W`);

const rm1Res = PhysicsEngine.estimate1RM(linRes, 0.30, { detailed: true });
assert(Math.abs(rm1Res.estimated - 110) < 1e-4, `1RM estimation correct (110 kg at MVT 0.30): got ${rm1Res.estimated}`);
assert(rm1Res.ci95Min < rm1Res.estimated && rm1Res.ci95Max > rm1Res.estimated, "95% CI bounds properly encapsulate point estimate");

// Check analyzeLoadVelocity wrapper interface contract
const analysis = PhysicsEngine.analyzeLoadVelocity(linearData, { mvt: 0.30 });
assert(analysis.modelType === 'linear', "analyzeLoadVelocity returns modelType");
assert(analysis.rm1 && Math.abs(analysis.rm1.estimated - 110) < 1e-4, "analyzeLoadVelocity rm1 structure matches contract");

// =========================================================================
// TEST SUITE 2: Stress-Testing Noisy Datasets & Outlier Removal
// =========================================================================
console.log("\n--- SUITE 2: Noisy Datasets & Outlier Filtering ---");

// Test 2.1: Single severe outlier handling in linear regression (IQR filter)
const noisyWithOutlier = [
    { load: 40, velocity: 1.0 },
    { load: 50, velocity: 0.9 },
    { load: 60, velocity: 0.8 },
    { load: 70, velocity: 0.7 },
    { load: 80, velocity: 1.8 } // Outlier!
];
const cleanLin = PhysicsEngine.linearRegressionVBT(noisyWithOutlier);
assert(cleanLin.outlierCount === 1, `IQR outlier removal detected 1 outlier: got ${cleanLin.outlierCount}`);
assert(Math.abs(cleanLin.slope - (-0.01)) < 1e-4, `Filtered slope is accurate to noise-free model: got ${cleanLin.slope}`);

// Test 2.2: Double filtering empirical audit in autoSelectRegressionVBT
// autoSelect apply MAD filter on raw data, then passes to linearRegressionVBT which applies IQR filter!
const testDoubleFilterData = [
    { load: 30, velocity: 1.1 },
    { load: 40, velocity: 1.0 },
    { load: 50, velocity: 0.9 },
    { load: 60, velocity: 0.8 },
    { load: 70, velocity: 0.7 },
    { load: 80, velocity: 0.6 }
];
const autoRes = PhysicsEngine.autoSelectRegressionVBT(testDoubleFilterData);
assert(autoRes !== null, "autoSelectRegressionVBT operates smoothly on 6-point dataset");

// =========================================================================
// TEST SUITE 3: Model Switching Sensitivity (Linear vs Quadratic)
// =========================================================================
console.log("\n--- SUITE 3: Model Switching Sensitivity (Linear vs Quadratic) ---");

// Test 3.1: True Linear with Gaussian noise across small sample sizes
const rng3 = createRng(42);
let falseQuadraticDetections_n4 = 0;
let falseQuadraticDetections_n6 = 0;
const SIM_TRIALS = 500;

for (let t = 0; t < SIM_TRIALS; t++) {
    // True linear model: V = -0.01 * L + 1.4  (1RM = 110kg at 0.3m/s)
    // Noise std dev = 0.03 m/s
    const loads4 = [40, 60, 80, 100];
    const data4 = loads4.map(l => ({ load: l, velocity: -0.01 * l + 1.4 + normalRandom(rng3, 0, 0.03) }));
    const model4 = PhysicsEngine.autoSelectRegressionVBT(data4);
    if (model4.modelType === 'quadratic') falseQuadraticDetections_n4++;

    const loads6 = [30, 45, 60, 75, 90, 100];
    const data6 = loads6.map(l => ({ load: l, velocity: -0.01 * l + 1.4 + normalRandom(rng3, 0, 0.03) }));
    const model6 = PhysicsEngine.autoSelectRegressionVBT(data6);
    if (model6.modelType === 'quadratic') falseQuadraticDetections_n6++;
}

console.log(`  📊 False Quadratic Selection rate (Noise=0.03 m/s):`);
console.log(`     - n=4 points: ${(falseQuadraticDetections_n4 / SIM_TRIALS * 100).toFixed(1)}% (${falseQuadraticDetections_n4}/${SIM_TRIALS})`);
console.log(`     - n=6 points: ${(falseQuadraticDetections_n6 / SIM_TRIALS * 100).toFixed(1)}% (${falseQuadraticDetections_n6}/${SIM_TRIALS})`);

assert(falseQuadraticDetections_n4 / SIM_TRIALS < 0.35, "False quadratic switching for n=4 is under acceptable threshold (<35%)");

// Test 3.2: Non-physical curvature test (c2 > 0 check)
// Let's create data with upwards curvature: velocity increases faster as load increases
const invertedCurve = [
    { load: 40, velocity: 0.5 },
    { load: 60, velocity: 0.6 },
    { load: 80, velocity: 0.8 },
    { load: 100, velocity: 1.1 }
];
const quadInv = PhysicsEngine.quadraticRegressionVBT(invertedCurve);
const autoInv = PhysicsEngine.autoSelectRegressionVBT(invertedCurve);
console.log(`  🔍 Inverted curvature c2: ${quadInv ? quadInv.coefficients.c2.toFixed(6) : 'null'}, selected model: ${autoInv ? autoInv.modelType : 'null'}`);
assert(autoInv.modelType === 'linear', "Inverted/non-physical curve correctly rejected by autoSelectRegressionVBT (falls back to linear)");

// =========================================================================
// TEST SUITE 4: 95% Confidence Interval Accuracy & Coverage
// =========================================================================
console.log("\n--- SUITE 4: 95% Confidence Interval Empirical Coverage ---");

// We test Monte Carlo coverage of estimate1RM 95% CI.
// True parameter: Linear profile with slope = -0.008, intercept = 1.30.
// MVT = 0.30 m/s => True 1RM = (0.30 - 1.30) / (-0.008) = 125.0 kg.
const TRUE_SLOPE = -0.008;
const TRUE_INTERCEPT = 1.30;
const MVT = 0.30;
const TRUE_1RM = (MVT - TRUE_INTERCEPT) / TRUE_SLOPE; // 125 kg

function testCiCoverage(nPoints, noiseStd, trials = 1000) {
    const rng = createRng(nPoints * 1000 + Math.round(noiseStd * 100));
    let coveredCount = 0;
    let totalMargin = 0;
    let validTrials = 0;

    const baseLoads = [];
    const minL = 40, maxL = 100;
    for (let i = 0; i < nPoints; i++) {
        baseLoads.push(minL + (i / (nPoints - 1)) * (maxL - minL));
    }

    for (let t = 0; t < trials; t++) {
        const sample = baseLoads.map(l => ({
            load: l,
            velocity: TRUE_SLOPE * l + TRUE_INTERCEPT + normalRandom(rng, 0, noiseStd)
        }));

        const reg = PhysicsEngine.linearRegressionVBT(sample);
        if (!reg || reg.slope >= 0) continue;

        const rm1Obj = PhysicsEngine.estimate1RM(reg, MVT, { detailed: true });
        if (!rm1Obj || rm1Obj.estimated <= 0) continue;

        validTrials++;
        totalMargin += rm1Obj.margin;

        if (TRUE_1RM >= rm1Obj.ci95Min && TRUE_1RM <= rm1Obj.ci95Max) {
            coveredCount++;
        }
    }

    const coveragePct = (coveredCount / validTrials) * 100;
    const avgMargin = totalMargin / validTrials;
    return { coveragePct, avgMargin, validTrials };
}

console.log(`  🎯 Monte Carlo 1RM CI Verification (True 1RM = ${TRUE_1RM} kg, MVT = ${MVT} m/s):`);

const res_n4_low = testCiCoverage(4, 0.02, 1000);
console.log(`     - n=4 points, noise=0.02 m/s: Coverage = ${res_n4_low.coveragePct.toFixed(1)}% (Target: ~95%), Avg Margin = ±${res_n4_low.avgMargin.toFixed(2)} kg`);

const res_n5_mod = testCiCoverage(5, 0.04, 1000);
console.log(`     - n=5 points, noise=0.04 m/s: Coverage = ${res_n5_mod.coveragePct.toFixed(1)}% (Target: ~95%), Avg Margin = ±${res_n5_mod.avgMargin.toFixed(2)} kg`);

const res_n8_mod = testCiCoverage(8, 0.04, 1000);
console.log(`     - n=8 points, noise=0.04 m/s: Coverage = ${res_n8_mod.coveragePct.toFixed(1)}% (Target: ~95%), Avg Margin = ±${res_n8_mod.avgMargin.toFixed(2)} kg`);

assert(res_n5_mod.coveragePct >= 88.0 && res_n5_mod.coveragePct <= 99.0, `95% CI coverage for n=5 is statistically valid (${res_n5_mod.coveragePct.toFixed(1)}%)`);
assert(res_n8_mod.coveragePct >= 90.0 && res_n8_mod.coveragePct <= 99.0, `95% CI coverage for n=8 is statistically valid (${res_n8_mod.coveragePct.toFixed(1)}%)`);

// =========================================================================
// TEST SUITE SUMMARY
// =========================================================================
console.log(`\n==================================================`);
console.log(`🎯 EMPIRICAL CHALLENGE SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log(`==================================================\n`);

if (passedTests === totalTests) {
    console.log("PASS");
    process.exit(0);
} else {
    console.error("FAIL");
    process.exit(1);
}
