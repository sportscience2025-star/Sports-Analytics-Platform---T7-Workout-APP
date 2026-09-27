const fs = require('fs');
const path = require('path');

// 1. Mock browser APIs
global.window = {};

class MockFileReader {
    readAsArrayBuffer(file) {
        setTimeout(() => {
            if (this.onload) {
                this.onload({
                    target: {
                        result: new Uint8Array(file).buffer
                    }
                });
            }
        }, 0);
    }
}
global.FileReader = MockFileReader;

const mockXLSX = {
    read: (data, options) => {
        const str = Buffer.from(data).toString('utf-8');
        const lines = str.split('\n').map(l => l.trim()).filter(Boolean);
        const rows = lines.map(line => {
            return line.split(',').map(cell => {
                const trimmed = cell.trim();
                if (trimmed === '') return null;
                if (/^\d{4}[-/.]\d{2}[-/.]\d{2}$/.test(trimmed)) {
                    return trimmed;
                }
                const num = parseFloat(trimmed);
                return isNaN(num) ? trimmed : num;
            });
        });
        return {
            SheetNames: ['Sheet1'],
            Sheets: {
                'Sheet1': rows
            }
        };
    },
    utils: {
        sheet_to_json: (sheet, options) => {
            return sheet;
        }
    }
};
global.window.XLSX = mockXLSX;
global.XLSX = mockXLSX;

// Load physics-engine.js and parser.js
const physicsPath = path.join(__dirname, '..', 'js', 'physics-engine.js');
const physicsCode = fs.readFileSync(physicsPath, 'utf8');
eval(physicsCode);
const PhysicsEngine = global.window.PhysicsEngine;

const parserPath = path.join(__dirname, '..', 'js', 'parser.js');
const parserCode = fs.readFileSync(parserPath, 'utf8');
eval(parserCode);
const DataParser = global.window.DataParser;

function assertClose(actual, expected, maxErrorPct = 1, name = "") {
    const errorPct = Math.abs((actual - expected) / expected) * 100;
    if (errorPct > maxErrorPct) {
        console.error(`❌ Check failed for ${name}: expected approx ${expected}, got ${actual} (error ${errorPct.toFixed(4)}%)`);
        process.exit(1);
    } else {
        console.log(`✅ ${name} verified: ${actual} (expected: ${expected}, error: ${errorPct.toFixed(4)}%)`);
    }
}

// --- Test generateBryanMannVBTTable ---
console.log("\n--- Testing generateBryanMannVBTTable ---");
const mockReg = {
    predictVelocity: (load) => Math.max(0, 1.4 - 0.011 * load)
};
const squatTable = PhysicsEngine.generateBryanMannVBTTable(100, mockReg, 'Squat');
if (!Array.isArray(squatTable) || squatTable.length !== 5) {
    console.error("❌ Bryan Mann table length invalid!");
    process.exit(1);
}
if (squatTable[0].targetVelocity !== '<0.50 m/s' || squatTable[0].zone !== 'Forza Assoluta') {
    console.error("❌ Squat Bryan Mann zone 0 mismatch:", squatTable[0]);
    process.exit(1);
}
console.log("✅ Squat Bryan Mann table verified (5 zones, correct target velocities)");

const benchTable = PhysicsEngine.generateBryanMannVBTTable(100, mockReg, 'Bench Press');
if (benchTable[0].targetVelocity !== '<0.35 m/s') {
    console.error("❌ Bench Press Bryan Mann dynamic velocity threshold mismatch:", benchTable[0]);
    process.exit(1);
}
console.log("✅ Bench Press dynamic velocity thresholds verified (<0.35 m/s)");

for (const row of benchTable) {
    if (typeof row.load2_5kg !== 'number' || isNaN(row.load2_5kg) ||
        typeof row.forceN !== 'number' || isNaN(row.forceN) ||
        typeof row.powerW !== 'number' || isNaN(row.powerW)) {
        console.error("❌ NaN or invalid binding property found in row:", row);
        process.exit(1);
    }
}
console.log("✅ Strict binding property validation passed (no NaN/undefined)");