const fs = require('fs');
const path = require('path');

console.log("=== Running R2 and R4 Empirical Verification Test Suite ===\n");

function assert(condition, message) {
    if (!condition) {
        console.error("❌ Assertion Failed:", message);
        process.exit(1);
    }
    console.log("✅ Success:", message);
}