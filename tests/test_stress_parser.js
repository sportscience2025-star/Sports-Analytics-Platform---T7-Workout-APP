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

// 2. Mock XLSX to support JSON structures directly
const mockXLSX = {
    read: (data, options) => {
        const str = Buffer.from(data).toString('utf-8');
        try {
            const parsed = JSON.parse(str);
            if (parsed && parsed.sheets) {
                return {
                    SheetNames: Object.keys(parsed.sheets),
                    Sheets: parsed.sheets
                };
            }
        } catch (e) {
            // Not JSON, fallback to CSV parsing
        }

        // CSV parsing fallback
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

// 3. Load DataParser
const parserPath = path.join(__dirname, '..', 'js', 'parser.js');
const parserCode = fs.readFileSync(parserPath, 'utf8');
eval(parserCode);
const DataParser = global.window.DataParser;

// Helper to run a test case and print results
async function runTestCase(name, sheetData, expectSuccess, validationFn) {
    console.log(`\n--- Test Case: ${name} ---`);
    const buffer = Buffer.from(JSON.stringify({ sheets: { 'Sheet1': sheetData } }), 'utf-8');
    
    try {
        const result = await DataParser.parseExcel(buffer);
        if (!expectSuccess) {
            console.error(`❌ Expected failure (rejection) but parser succeeded.`);
            return false;
        }
        console.log(`✅ Parser completed successfully.`);
        if (validationFn) {
            try {
                validationFn(result);
                console.log(`✅ Validation passed.`);
                return true;
            } catch (valErr) {
                console.error(`❌ Validation failed:`, valErr.message);
                return false;
            }
        }
        return true;
    } catch (err) {
        if (expectSuccess) {
            console.error(`❌ Expected success but parser failed/rejected:`, err.message || err);
            return false;
        } else {
            console.log(`✅ Parser rejected as expected:`, err.message || err);
            if (validationFn) {
                try {
                    validationFn(err);
                    console.log(`✅ Error validation passed.`);
                    return true;
                } catch (valErr) {
                    console.error(`❌ Error validation failed:`, valErr.message);
                    return false;
                }
            }
            return true;
        }
    }
}

async function runAll() {
    let passed = 0;
    let total = 0;

    // Test Scenario 1: Standard good data
    total++;
    const standardData = [
        ["Atleta", "Esercizio", "Carga", "vm", "Data"],
        ["Mario Rossi", "Squat", 80, 0.55, "2026-06-15"],
        ["Luca Verdi", "Bench Press", 60, 0.75, "2026-06-15"]
    ];
    if (await runTestCase("Standard Good Data", standardData, true, (res) => {
        if (res.rawData.length !== 2) throw new Error(`Expected 2 records, got ${res.rawData.length}`);
        if (res.rawData[0].athlete !== "Mario Rossi") throw new Error("Incorrect athlete name");
        if (res.rawData[0].load !== 80) throw new Error("Incorrect load");
        if (res.rawData[0].velocity !== 0.55) throw new Error("Incorrect velocity");
    })) passed++;

    // Test Scenario 2: No columns matching (missing header match)
    total++;
    const noMatchingHeaders = [
        ["Foo", "Bar", "Baz"],
        [1, 2, 3],
        [4, 5, 6]
    ];
    if (await runTestCase("No Columns Matching", noMatchingHeaders, false, (err) => {
        if (!err.message.includes("Nessun dato utile trovato")) {
            throw new Error(`Unexpected error message: ${err.message}`);
        }
    })) passed++;

    // Test Scenario 3: Sparse sheet with undefined/null rows in header search area
    total++;
    const sparseData = [];
    sparseData[0] = null; // null row in JSON representation of undefined
    sparseData[1] = ["Atleta", "Esercizio", "Carga", "vm", "Data"];
    sparseData[2] = ["Mario Rossi", "Squat", 80, 0.55, "2026-06-15"];
    if (await runTestCase("Sparse Sheet with Undefined Rows", sparseData, true, (res) => {
        if (res.rawData.length !== 1) throw new Error(`Expected 1 record, got ${res.rawData.length}`);
        if (res.rawData[0].athlete !== "Mario Rossi") throw new Error("Incorrect athlete name");
    })) passed++;

    // Test Scenario 4: Non-numeric values in numeric fields
    total++;
    const nonNumericData = [
        ["Atleta", "Esercizio", "Carga", "vm", "Data"],
        ["Mario Rossi", "Squat", "broken", 0.55, "2026-06-15"],
        ["Luca Verdi", "Squat", 80, "N/A", "2026-06-15"],
        ["Gianni Neri", "Squat", "100,5", "0.45", "2026-06-15"]
    ];
    if (await runTestCase("Non-numeric Values in Numeric Fields", nonNumericData, true, (res) => {
        const rossi = res.rawData.find(r => r.athlete === "Mario Rossi");
        const verdi = res.rawData.find(r => r.athlete === "Luca Verdi");
        const neri = res.rawData.find(r => r.athlete === "Gianni Neri");

        if (rossi) throw new Error("Mario Rossi record should have been filtered out because load is invalid/not > 0");
        if (!verdi) throw new Error("Luca Verdi record should be included because load is 80");
        if (verdi.velocity !== null) throw new Error(`Luca Verdi velocity should be null, got ${verdi.velocity}`);
        if (!neri) throw new Error("Gianni Neri record should be included");
        if (neri.load !== 100.5) throw new Error(`Gianni Neri load should be 100.5, got ${neri.load}`);
        if (neri.velocity !== 0.45) throw new Error(`Gianni Neri velocity should be 0.45, got ${neri.velocity}`);
    })) passed++;

    // Test Scenario 5: Row with mismatch length (fewer columns or extra columns)
    total++;
    const mismatchLengthData = [
        ["Atleta", "Esercizio", "Carga", "vm", "Data"],
        ["Mario Rossi", "Squat"],
        ["Luca Verdi", "Squat", 80, 0.55, "2026-06-15", "extra1", "extra2"]
    ];
    if (await runTestCase("Mismatched Row Lengths", mismatchLengthData, true, (res) => {
        const rossi = res.rawData.find(r => r.athlete === "Mario Rossi");
        const verdi = res.rawData.find(r => r.athlete === "Luca Verdi");

        if (rossi) throw new Error("Mario Rossi should be filtered out (no load/metrics)");
        if (!verdi) throw new Error("Luca Verdi should be present");
        if (verdi.load !== 80) throw new Error("Luca Verdi load should be 80");
    })) passed++;

    // Test Scenario 6: All empty/invalid records (no valid metrics)
    total++;
    const allInvalidData = [
        ["Atleta", "Esercizio", "Carga", "vm", "Data"],
        ["Mario Rossi", "Squat", 0, 0.55, "2026-06-15"],
        ["Luca Verdi", "Squat", -10, 0.75, "2026-06-15"]
    ];
    if (await runTestCase("All Invalid/Filtered Records", allInvalidData, false, (err) => {
        if (!err.message.includes("Nessun dato utile trovato")) {
            throw new Error(`Unexpected error message: ${err.message}`);
        }
    })) passed++;

    // Test Scenario 7: Header mapping precedence bug (drop height vs jump height)
    total++;
    const dropHeightHeaders = [
        ["Atleta", "Esercizio", "altezza caduta", "drop height", "altura caida", "caduta"],
        ["Mario Rossi", "Squat", 10, 20, 30, 40]
    ];
    if (await runTestCase("Drop Height Header Mapping", dropHeightHeaders, true, (res) => {
        const record = res.rawData[0];
        console.log("Mapped record for drop height headers:", record);
        // The headers "altezza caduta", "drop height", "altura caida" should map to 'dropHeight'.
        // But because they contain substring matches like "altezza", "height", "altura", they mistakenly map to 'jumpHeight'.
        // Let's assert if they mapped incorrectly.
        if (record.jumpHeight !== null) {
            throw new Error(`Precedence Bug Confirmed: drop height headers mapped to jumpHeight instead of dropHeight! jumpHeight=${record.jumpHeight}, dropHeight=${record.dropHeight}`);
        }
    })) passed++;

    console.log(`\n=== Stress Test Results: ${passed} / ${total} passed ===`);
    if (passed === total) {
        console.log("PASS");
        process.exit(0);
    } else {
        console.log("FAIL");
        process.exit(1);
    }
}

runAll().catch(err => {
    console.error("Test execution failed:", err);
    process.exit(1);
});