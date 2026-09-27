const fs = require('fs');
const path = require('path');

// Load DataParser directly from js/parser.js
global.window = {};
const parserPath = path.resolve(__dirname, '../../js/parser.js');
const parserCode = fs.readFileSync(parserPath, 'utf8');
eval(parserCode);
const DataParser = global.window.DataParser;

const testCases = [
    // Requirement R1 explicit examples
    { id: "Tommaso_mhkuhpch00134m", desc: "Single name with long token" },
    { id: "Mario_Rossi_mhkuhpch00134m", desc: "Multi-word name with long token" },
    { id: "Tommaso_vbt01", desc: "Short device token" },
    { id: "encoder_123456", desc: "Generic encoder token" },
    
    // Additional structural & edge cases
    { id: "", desc: "Empty string" },
    { id: "   ", desc: "Whitespace string" },
    { id: null, desc: "Null input" },
    { id: undefined, desc: "Undefined input" },
    { id: 12345, desc: "Numeric input" },
    
    // Multi-word without random tokens (stress test for isEncodedId & extractReadableName)
    { id: "Mario_Rossi", desc: "Multi-word name formatted with underscore (no hex token)" },
    { id: "Gianni_Maria_Verdi", desc: "3-part name with underscores" },
    
    // Special characters & boundary tests
    { id: "_mhkuhpch00134m", desc: "Leading underscore only" },
    { id: "Tommaso_", desc: "Trailing underscore only" },
    { id: "Tommaso_a", desc: "Underscore with 1-char token" },
    { id: "Tommaso_ab", desc: "Underscore with 2-char token" },
    { id: "Tommaso_abc", desc: "Underscore with 3-char token" },
    { id: "Tommaso@Gym_mhkuhpch00134m", desc: "Special character @ in name" },
    { id: "Anna-Maria_mhkuhpch00134m", desc: "Hyphenated name with token" },
    { id: "Encoder", desc: "Literal 'Encoder' string" },
    { id: "UNKNOWN_123", desc: "Generic unknown token" }
];

console.log("=========================================================");
console.log(" EMPIRICAL VERIFICATION RESULTS FOR REQUIREMENT R1 ");
console.log("=========================================================\n");

const results = [];

testCases.forEach((tc, index) => {
    const isEncoded = DataParser.isEncodedId(tc.id);
    const readable = DataParser.extractReadableName(tc.id);
    const res = {
        index: index + 1,
        desc: tc.desc,
        input: tc.id === undefined ? "undefined" : JSON.stringify(tc.id),
        isEncodedId: isEncoded,
        extractReadableName: readable
    };
    results.push(res);
    console.log(`Test #${res.index}: [${res.desc}]`);
    console.log(`  Input:                ${res.input}`);
    console.log(`  isEncodedId():        ${res.isEncodedId}`);
    console.log(`  extractReadableName(): "${res.extractReadableName}"`);
    console.log("---------------------------------------------------------");
});

// Save JSON summary for automated reporting
fs.writeFileSync(path.join(__dirname, 'test_results.json'), JSON.stringify(results, null, 2));
console.log("\nSaved raw results to test_results.json");
