const fs = require('fs');
const path = require('path');

// 1. Mock browser environment globals
global.window = {};

// 2. Load proposed_physics-engine.js inside global/window context
const physicsPath = path.join(__dirname, 'proposed_physics-engine.js');
if (!fs.existsSync(physicsPath)) {
    console.error("Error: proposed_physics-engine.js not found at", physicsPath);
    process.exit(1);
}
const physicsCode = fs.readFileSync(physicsPath, 'utf8');
eval(physicsCode);

const PhysicsEngine = global.window.PhysicsEngine;
if (!PhysicsEngine) {
    console.error("Error: PhysicsEngine class could not be loaded from proposed_physics-engine.js.");
    process.exit(1);
}

// Helper assertion functions
function assert(condition, message) {
    if (!condition) {
        console.error("❌ Assertion Failed:", message);
        process.exit(1);
    }
}

function assertClose(actual, expected, margin = 1e-4, name = "") {
    const diff = Math.abs(actual - expected);
    if (diff > margin) {
        console.error(`❌ Assertion Failed for ${name}: Expected ${expected.toFixed(6)} (margin ${margin}), but got ${actual.toFixed(6)}`);
        process.exit(1);
    } else {
        console.log(`   ✅ Asserted ${name}: ${actual.toFixed(6)} is close to ${expected.toFixed(6)}`);
    }
}

function runTests() {
    console.log("=== Running Proposed PhysicsEngine VBT Biomechanical Equations Test ===");
    console.log("Literature Dataset: Back Squat");
    console.log("Loads: [60, 90, 120, 135] kg");
    console.log("Velocities: [1.00, 0.75, 0.50, 0.38] m/s\n");

    const vbtDataset = [
        { load: 60, velocity: 1.00 },
        { load: 90, velocity: 0.75 },
        { load: 120, velocity: 0.50 },
        { load: 135, velocity: 0.38 }
    ];

    const regression = PhysicsEngine.linearRegressionVBT(vbtDataset);
    assert(regression !== null, "Regression result should not be null");

    // Theoretical analytical expectations:
    // Slope (m) ≈ -0.0082824858757
    // Intercept (b) ≈ 1.4961016949
    // R-squared (R2) ≈ 0.999799863
    // V0 (max velocity at 0 load) = intercept = 1.4961016949 m/s
    // F0 (max load at 0 velocity) = -intercept / slope ≈ 180.634372 kg
    // F0_N (max force in Newtons) = F0 * 9.81 ≈ 1772.02319 N
    // Pmax (max power in Watts) = 0.25 * F0_N * V0 ≈ 662.779 W
    // 1RM (MVT = 0.30 m/s) = (0.30 - intercept) / slope ≈ 144.413446 kg

    const expectedSlope = -0.0082824858757;
    const expectedIntercept = 1.4961016949;
    const expectedRSquared = 0.999799863;
    const expectedV0 = 1.4961016949;
    const expectedF0 = 180.634372;
    const expectedF0_N = 1772.02319;
    const expectedPmax = 662.779;
    const expected1RM = 144.413446;

    console.log("--- Verifying Biomechanical Parameters ---");
    assertClose(regression.slope, expectedSlope, 1e-6, "Slope (m)");
    assertClose(regression.intercept, expectedIntercept, 1e-6, "Intercept (b)");
    assertClose(regression.rSquared, expectedRSquared, 1e-6, "R-Squared (R2)");
    assertClose(regression.v0, expectedV0, 1e-6, "V0 (theoretical max velocity)");
    assertClose(regression.f0, expectedF0, 1e-5, "F0 in kg (theoretical max load)");
    assertClose(regression.f0_N, expectedF0_N, 1e-4, "F0 in Newtons (theoretical max force)");
    assertClose(regression.pmax, expectedPmax, 1e-3, "Pmax in Watts (theoretical max power)");

    console.log("\n--- Verifying 1RM Predictions ---");
    const computed1RM = PhysicsEngine.estimate1RM(regression, 0.30);
    assertClose(computed1RM, expected1RM, 1e-5, "1RM at MVT = 0.30 m/s");

    console.log("\n--- Verifying Power Curve (P(L) = g * L * (m*L + b)) ---");
    // Let's verify that power at L = F0 / 2 is indeed equal to Pmax
    const loadAtPmax = regression.f0 / 2; // = 90.317186 kg
    const forceAtPmax = loadAtPmax * 9.81; // = 886.0116 N
    const velocityAtPmax = regression.predictVelocity(loadAtPmax); // = 0.74805 m/s
    const computedPowerAtPmax = forceAtPmax * velocityAtPmax;
    assertClose(computedPowerAtPmax, regression.pmax, 1e-4, "Power at L_Pmax = F0/2");

    console.log("\n🎉 All biomechanical formula tests passed successfully!");
}

try {
    runTests();
} catch (err) {
    console.error("❌ Test run failed with error:", err);
    process.exit(1);
}
