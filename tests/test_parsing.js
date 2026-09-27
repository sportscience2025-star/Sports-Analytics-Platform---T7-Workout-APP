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

// 2. Mock XLSX with a genuine CSV parser
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

// 3. Mock pdfjsLib with a genuine PDF stream extractor
const mockPdfjsLib = {
    GlobalWorkerOptions: {},
    getDocument: (options) => {
        const pdfBuffer = Buffer.from(options.data);
        const pdfStr = pdfBuffer.toString('utf-8');
        
        const streamRegex = /stream([\s\S]*?)endstream/g;
        let match;
        let fullText = "";
        
        while ((match = streamRegex.exec(pdfStr)) !== null) {
            const streamData = match[1];
            const tjRegex = /\((.*?)\)\s*Tj/g;
            let tjMatch;
            while ((tjMatch = tjRegex.exec(streamData)) !== null) {
                fullText += tjMatch[1] + "\n";
            }
        }
        
        return {
            promise: Promise.resolve({
                numPages: 1,
                getPage: (pageNum) => {
                    return Promise.resolve({
                        getTextContent: () => {
                            const items = fullText.split('\n').map(line => ({ str: line }));
                            return Promise.resolve({ items });
                        }
                    });
                }
            })
        };
    }
};
global.window.pdfjsLib = mockPdfjsLib;
global.pdfjsLib = mockPdfjsLib;

// 4. Load DataParser from parser.js
const parserPath = path.join(__dirname, '..', 'js', 'parser.js');
const parserCode = fs.readFileSync(parserPath, 'utf8');
eval(parserCode);
const DataParser = global.window.DataParser;

async function runTests() {
    console.log("=== Running DataParser Tests ===");

    // A. Parse Excel
    console.log("\nParsing Excel file: sample_messy_data.xlsx...");
    const xlsxBuffer = fs.readFileSync(path.join(__dirname, '../test_data/sample_messy_data.xlsx'));
    const excelResult = await DataParser.parseExcel(xlsxBuffer);
    
    console.log(`Excel parsed successfully: ${excelResult.rawData.length} records found.`);
    console.log("Athletes:", excelResult.athletes);
    console.log("Exercises:", excelResult.exercises);

    // Assertions for Excel
    assert(excelResult.athletes.includes("Mario Rossi"), "Athlete 'Mario Rossi' should be found in Excel");
    assert(excelResult.athletes.includes("Luca Verdi"), "Athlete 'Luca Verdi' should be found in Excel");
    assert(excelResult.exercises.some(e => e.toLowerCase() === "cmj"), "Exercise 'CMJ' should be found in Excel");
    assert(excelResult.exercises.some(e => e.toLowerCase() === "sj"), "Exercise 'SJ' should be found in Excel");
    assert(excelResult.exercises.some(e => e.toLowerCase() === "dj"), "Exercise 'DJ' should be found in Excel");
    assert(excelResult.exercises.some(e => e.toLowerCase() === "squat"), "Exercise 'Squat' should be found in Excel");
    
    // Check specific records in Excel
    const cmjExcel = excelResult.rawData.find(r => r.athlete === "Mario Rossi" && r.exercise.toLowerCase() === "cmj");
    assert(cmjExcel !== undefined, "CMJ record for Mario Rossi should exist in Excel");
    assert(cmjExcel.jumpHeight === 38.5, `CMJ jumpHeight should be 38.5, got ${cmjExcel.jumpHeight}`);
    assert(cmjExcel.contactTime === 0.22, `CMJ contactTime should be 0.22, got ${cmjExcel.contactTime}`);
    assert(cmjExcel.dropHeight === 0, `CMJ dropHeight should be 0, got ${cmjExcel.dropHeight}`);
    assert(cmjExcel.date === "2026-06-15", `CMJ Excel record date should be '2026-06-15', got ${cmjExcel.date}`);

    const djExcel = excelResult.rawData.find(r => r.athlete === "Mario Rossi" && r.exercise.toLowerCase() === "dj");
    assert(djExcel !== undefined, "DJ record for Mario Rossi should exist in Excel");
    assert(djExcel.jumpHeight === 42.1, `DJ jumpHeight should be 42.1, got ${djExcel.jumpHeight}`);
    assert(djExcel.contactTime === 0.18, `DJ contactTime should be 0.18, got ${djExcel.contactTime}`);
    assert(djExcel.dropHeight === 30.0, `DJ dropHeight should be 30.0, got ${djExcel.dropHeight}`);

    const squatsExcel = excelResult.rawData.filter(r => r.athlete === "Luca Verdi" && r.exercise.toLowerCase() === "squat");
    assert(squatsExcel.length >= 5, `Should find at least 5 Squat records, found ${squatsExcel.length}`);
    assert(squatsExcel[0].load === 80 && squatsExcel[0].velocity === 0.55, "First Squat VBT metrics should be 80kg @ 0.55m/s");
    assert(squatsExcel[4].load === 100 && squatsExcel[4].velocity === 0.35, "Fifth Squat VBT metrics should be 100kg @ 0.35m/s");

    // B. Parse PDF
    console.log("\nParsing PDF file: sample_messy_data.pdf...");
    const pdfBuffer = fs.readFileSync(path.join(__dirname, '../test_data/sample_messy_data.pdf'));
    const pdfResult = await DataParser.parsePDF(pdfBuffer);

    console.log(`PDF parsed successfully: ${pdfResult.rawData.length} records found.`);
    console.log("Athletes:", pdfResult.athletes);
    console.log("Exercises:", pdfResult.exercises);

    // Assertions for PDF
    assert(pdfResult.athletes.includes("Mario Rossi"), "Athlete 'Mario Rossi' should be found in PDF");
    assert(pdfResult.athletes.includes("Luca Verdi"), "Athlete 'Luca Verdi' should be found in PDF");
    assert(pdfResult.exercises.some(e => e.toLowerCase() === "cmj"), "Exercise 'CMJ' should be found in PDF");
    assert(pdfResult.exercises.some(e => e.toLowerCase() === "sj"), "Exercise 'SJ' should be found in PDF");
    assert(pdfResult.exercises.some(e => e.toLowerCase() === "dj"), "Exercise 'DJ' should be found in PDF");
    assert(pdfResult.exercises.some(e => e.toLowerCase() === "squat"), "Exercise 'Squat' should be found in PDF");
    
    // Check specific records in PDF
    const cmjPdf = pdfResult.rawData.find(r => r.athlete === "Mario Rossi" && r.exercise.toLowerCase() === "cmj");
    assert(cmjPdf !== undefined, "CMJ record for Mario Rossi should exist in PDF");
    assert(cmjPdf.jumpHeight === 38.5, `CMJ jumpHeight should be 38.5, got ${cmjPdf.jumpHeight}`);
    assert(cmjPdf.contactTime === 0.22, `CMJ contactTime should be 0.22, got ${cmjPdf.contactTime}`);
    assert(cmjPdf.date === "2026-06-15", `CMJ PDF record date should be '2026-06-15', got ${cmjPdf.date}`);

    const squatsPdf = pdfResult.rawData.filter(r => r.athlete === "Luca Verdi" && r.exercise.toLowerCase() === "squat");
    assert(squatsPdf.length >= 5, `Should find at least 5 Squat records in PDF, found ${squatsPdf.length}`);
    assert(squatsPdf[0].load === 80 && squatsPdf[0].velocity === 0.55, "First Squat VBT metrics should be 80kg @ 0.55m/s");
    assert(squatsPdf[4].load === 100 && squatsPdf[4].velocity === 0.35, "Fifth Squat VBT metrics should be 100kg @ 0.35m/s");

    console.log("\n✅ All assertions passed successfully!");

    // Output parsed output to a structured JSON file
    const combinedOutput = {
        excelParsed: excelResult,
        pdfParsed: pdfResult
    };
    fs.writeFileSync(path.join(__dirname, '../test_data/parsed_output.json'), JSON.stringify(combinedOutput, null, 4), 'utf8');
    console.log("Parsed data output successfully written to parsed_output.json.");
}

function assert(condition, message) {
    if (!condition) {
        console.error("Assertion Failed:", message);
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error("Test execution failed:", err);
    process.exit(1);
});