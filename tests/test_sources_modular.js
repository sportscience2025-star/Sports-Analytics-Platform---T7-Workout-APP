/**
 * tests/test_sources_modular.js
 * Comprehensive automated verification for Scientific Sources Modularization (Task 1).
 * Validates 12 area files, aggregator index.js, facade knowledge-base.js, studyType presence, and dual-environment execution.
 */

const fs = require('fs');
const path = require('path');

console.log("=== Scientific Sources Modularization Test Suite (12 Modules) ===\n");

function assert(condition, message) {
    if (!condition) {
        console.error("FAIL:", message);
        process.exit(1);
    }
    console.log("PASS:", message);
}

// -----------------------------------------------------------------------------
// Test 1: Physical File Existence
// -----------------------------------------------------------------------------
console.log("\n--- Test 1: Physical File Existence ---");
const expectedFiles = [
    'js/data/sources/atletica.js',
    'js/data/sources/sollevamento-pesi.js',
    'js/data/sources/fisiologia.js',
    'js/data/sources/vbt.js',
    'js/data/sources/biomeccanica.js',
    'js/data/sources/clinico.js',
    'js/data/sources/sport-squadra.js',
    'js/data/sources/riabilitazione.js',
    'js/data/sources/nutrizione-sportiva.js',
    'js/data/sources/prevenzione-infortuni.js',
    'js/data/sources/psicologia-sport.js',
    'js/data/sources/sport-individuali.js',
    'js/data/sources/index.js',
    'js/knowledge-base.js'
];

for (const relPath of expectedFiles) {
    const fullPath = path.join(__dirname, '..', relPath);
    assert(fs.existsSync(fullPath), `File exists: ${relPath}`);
}

// -----------------------------------------------------------------------------
// Test 2: Delimiter Balance Across All Files
// -----------------------------------------------------------------------------
console.log("\n--- Test 2: Delimiter Balance Check ---");
for (const relPath of expectedFiles) {
    const fullPath = path.join(__dirname, '..', relPath);
    const content = fs.readFileSync(fullPath, 'utf8');
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    const openBrackets = (content.match(/\[/g) || []).length;
    const closeBrackets = (content.match(/\]/g) || []).length;

    assert(openBraces === closeBraces, `${relPath} braces balanced (${openBraces}/${closeBraces})`);
    assert(openParens === closeParens, `${relPath} parens balanced (${openParens}/${closeParens})`);
    assert(openBrackets === closeBrackets, `${relPath} brackets balanced (${openBrackets}/${closeBrackets})`);
}

// -----------------------------------------------------------------------------
// Test 3: Node.js Loading via aggregator (js/data/sources/index.js)
// -----------------------------------------------------------------------------
console.log("\n--- Test 3: Node.js Dynamic Loading via index.js ---");
global.window = { App: {} };
const indexPath = path.join(__dirname, '..', 'js', 'data', 'sources', 'index.js');
eval(fs.readFileSync(indexPath, 'utf8'));

assert(Array.isArray(global.window.App.scientificSources), "window.App.scientificSources is an Array");
assert(global.window.App.scientificSources.length === 322, `Total sources count is 322 (got ${global.window.App.scientificSources.length})`);
assert(global.window.ScientificKnowledgeBase === global.window.App.scientificSources, "window.ScientificKnowledgeBase aliases window.App.scientificSources");

// -----------------------------------------------------------------------------
// Test 4: Thematic Area Distribution across all 12 areas
// -----------------------------------------------------------------------------
console.log("\n--- Test 4: Thematic Area Distribution ---");
const expectedDist = {
    atletica: { area: 'Atletica Leggera', count: 35 },
    sollevamentoPesi: { area: 'Sollevamento Pesi', count: 31 },
    fisiologia: { area: 'Fisiologia', count: 47 },
    vbt: { area: 'VBT', count: 28 },
    biomeccanica: { area: 'Biomeccanica', count: 40 },
    clinico: { area: 'Clinico', count: 40 },
    sportSquadra: { area: 'Sport di Squadra', count: 39 },
    riabilitazione: { area: 'Riabilitazione', count: 16 },
    nutrizioneSportiva: { area: 'Nutrizione Sportiva', count: 13 },
    prevenzioneInfortuni: { area: 'Prevenzione Infortuni', count: 13 },
    psicologiaSport: { area: 'Psicologia dello Sport', count: 9 },
    sportIndividuali: { area: 'Sport Individuali', count: 11 }
};

const sourcesObj = global.window.App.Sources;
assert(sourcesObj !== undefined, "window.App.Sources is defined");

let totalFromAreas = 0;
for (const [key, spec] of Object.entries(expectedDist)) {
    const list = sourcesObj[key];
    assert(Array.isArray(list), `window.App.Sources.${key} is an Array`);
    assert(list.length === spec.count, `window.App.Sources.${key} count is ${spec.count} (got ${list ? list.length : 0})`);
    const matchingArea = list.every(item => item.area === spec.area);
    assert(matchingArea, `All items in ${key} have area === '${spec.area}'`);
    totalFromAreas += list.length;
}
assert(totalFromAreas === 322, `Sum of all 12 thematic areas is exactly 322 (got ${totalFromAreas})`);

// -----------------------------------------------------------------------------
// Test 5: ID Uniqueness and Schema Completeness
// -----------------------------------------------------------------------------
console.log("\n--- Test 5: ID Uniqueness & Schema Validation ---");
const seenIds = new Set();
const requiredFields = ['id', 'title', 'authors', 'year', 'journal', 'area', 'abstract', 'url', 'rules', 'studyType'];
const validStudyTypes = new Set(['Meta-analisi', 'RCT', 'Revisione Sistematica', 'Linee Guida']);

for (const item of global.window.App.scientificSources) {
    assert(!seenIds.has(item.id), `ID is unique: ${item.id}`);
    seenIds.add(item.id);

    for (const f of requiredFields) {
        assert(item[f] !== undefined && item[f] !== null, `Field '${f}' present in ${item.id}`);
    }

    assert(validStudyTypes.has(item.studyType), `Valid studyType for ${item.id}: '${item.studyType}'`);
    assert(typeof item.year === 'number' && item.year >= 1950 && item.year <= 2026, `Valid year for ${item.id}: ${item.year}`);
    assert(typeof item.url === 'string' && item.url.startsWith('http'), `Valid URL for ${item.id}: ${item.url}`);
    assert(typeof item.rules === 'object' && item.rules !== null, `Rules object present for ${item.id}`);
}

// -----------------------------------------------------------------------------
// Test 6: Helper Methods getScientificSources, getScientificSourcesByArea, getScientificAreas
// -----------------------------------------------------------------------------
console.log("\n--- Test 6: Helper Methods ---");
assert(typeof global.window.App.getScientificSources === 'function', "getScientificSources is a function");
assert(typeof global.window.App.getScientificSourcesByArea === 'function', "getScientificSourcesByArea is a function");
assert(typeof global.window.App.getScientificAreas === 'function', "getScientificAreas is a function");

assert(global.window.App.getScientificSources().length === 322, "getScientificSources() returns 322 items");
assert(global.window.App.getScientificSourcesByArea('Tutti').length === 322, "getScientificSourcesByArea('Tutti') returns 322 items");
assert(global.window.App.getScientificSourcesByArea().length === 322, "getScientificSourcesByArea() without args returns 322 items");

const areas = global.window.App.getScientificAreas();
assert(areas.length === 12, `getScientificAreas() returns 12 distinct areas (got ${areas.length})`);

for (const spec of Object.values(expectedDist)) {
    const filtered = global.window.App.getScientificSourcesByArea(spec.area);
    assert(filtered.length === spec.count, `getScientificSourcesByArea('${spec.area}') returns ${spec.count} items (got ${filtered.length})`);
}

// -----------------------------------------------------------------------------
// Test 7: Backward-Compatibility Facade (js/knowledge-base.js)
// -----------------------------------------------------------------------------
console.log("\n--- Test 7: Backward-Compatibility Facade ---");
const freshWindow = { App: {} };
global.window = freshWindow;

const kbPath = path.join(__dirname, '..', 'js', 'knowledge-base.js');
eval(fs.readFileSync(kbPath, 'utf8'));

assert(Array.isArray(global.window.App.scientificSources), "Facade: window.App.scientificSources is an Array");
assert(global.window.App.scientificSources.length === 322, `Facade: window.App.scientificSources length is 322 (got ${global.window.App.scientificSources.length})`);
assert(global.window.ScientificKnowledgeBase.length === 322, `Facade: window.ScientificKnowledgeBase length is 322 (got ${global.window.ScientificKnowledgeBase.length})`);

// -----------------------------------------------------------------------------
// Test 8: Browser-Environment Sequential Loading Simulation (No require)
// -----------------------------------------------------------------------------
console.log("\n--- Test 8: Browser-Environment Sequential Loading Simulation ---");
const browserWindow = { App: {} };
const browserScriptFiles = [
    'js/data/sources/atletica.js',
    'js/data/sources/sollevamento-pesi.js',
    'js/data/sources/fisiologia.js',
    'js/data/sources/vbt.js',
    'js/data/sources/biomeccanica.js',
    'js/data/sources/clinico.js',
    'js/data/sources/sport-squadra.js',
    'js/data/sources/riabilitazione.js',
    'js/data/sources/nutrizione-sportiva.js',
    'js/data/sources/prevenzione-infortuni.js',
    'js/data/sources/psicologia-sport.js',
    'js/data/sources/sport-individuali.js',
    'js/data/sources/index.js',
    'js/knowledge-base.js'
];

(function () {
    const backupRequire = global.require;
    try {
        global.window = browserWindow;
        for (const sf of browserScriptFiles) {
            const code = fs.readFileSync(path.join(__dirname, '..', sf), 'utf8');
            const fn = new Function('window', 'global', code);
            fn(browserWindow, browserWindow);
        }
    } finally {
        global.require = backupRequire;
    }
})();

assert(Array.isArray(browserWindow.App.scientificSources), "Browser sim: window.App.scientificSources is an Array");
assert(browserWindow.App.scientificSources.length === 322, `Browser sim: window.App.scientificSources length is 322 (got ${browserWindow.App.scientificSources.length})`);
assert(browserWindow.ScientificKnowledgeBase.length === 322, "Browser sim: window.ScientificKnowledgeBase length is 322");

console.log("\n=========================================================");
console.log("SUCCESS: All 8 Scientific Sources Modularization Tests Passed!");
console.log("=========================================================\n");
