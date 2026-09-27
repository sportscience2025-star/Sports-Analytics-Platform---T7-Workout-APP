/**
 * Test: Verifica Modularizzazione UI (js/ui/*.js)
 * Controlla che tutti i moduli UI siano caricabili e espongano le funzioni attese.
 */
const fs = require('fs');
const path = require('path');

// Mock browser environment
global.window = { App: {} };
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};
global.document = {
    getElementById: () => ({
        innerHTML: '',
        set innerHTML(v) {},
        classList: { remove: () => {}, add: () => {} },
        querySelectorAll: () => [],
        querySelector: () => null,
        scrollIntoView: () => {},
        addEventListener: () => {},
        appendChild: () => {},
        style: {}
    }),
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: (tag) => ({
        style: {},
        className: '',
        innerHTML: '',
        textContent: '',
        addEventListener: () => {},
        appendChild: () => {},
        setAttribute: () => {},
        querySelectorAll: () => [],
        querySelector: () => null,
        dataset: {}
    }),
    body: {
        appendChild: () => {},
        removeChild: () => {}
    },
    createTextNode: () => ({})
};

const projectRoot = path.resolve(__dirname, '../');

function loadModule(relPath) {
    const filePath = path.join(projectRoot, relPath);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Error: File not found at ${filePath}`);
        process.exit(1);
    }
    const code = fs.readFileSync(filePath, 'utf8');
    eval(code);
}

console.log("=== Verifying Modular UI Layer (js/ui/*.js) ===\n");

// 1. Check all files exist
const uiFiles = [
    'js/ui/helpers.js',
    'js/ui/favorites.js',
    'js/ui/wizard.js',
    'js/ui/export.js',
    'js/ui/render-filters.js',
    'js/ui/add-exercise-modal.js',
    'js/ui/catalog.js',
    'js/ui/scientific-hub.js'
];

let passed = 0;
let failed = 0;

uiFiles.forEach(f => {
    const fullPath = path.join(projectRoot, f);
    if (fs.existsSync(fullPath)) {
        console.log(`✅ PASS: File exists - ${f}`);
        passed++;
    } else {
        console.error(`❌ FAIL: File not found - ${f}`);
        failed++;
    }
});

// 2. Load all modules via orchestrator (same as production)
try {
    loadModule('js/ui.js');
    console.log("✅ PASS: ui.js orchestrator loaded all sub-modules");
    passed++;
} catch (e) {
    console.error(`❌ FAIL: ui.js orchestrator failed: ${e.message}`);
    failed++;
}

// 3. Verify key functions are exposed
const expectedFunctions = [
    { path: 'window.escapeHTML', fn: () => window.escapeHTML },
    { path: 'window.App.initNumberSteppers', fn: () => window.App.initNumberSteppers },
    { path: 'window.updateFavoritesBadge', fn: () => window.updateFavoritesBadge },
    { path: 'window.App.clearCurrentProgram', fn: () => window.App.clearCurrentProgram },
    { path: 'window.App.resetWizardWithConfirmation', fn: () => window.App.resetWizardWithConfirmation },
    { path: 'window.App.renderWizard', fn: () => window.App.renderWizard },
    { path: 'window.App.renderProgramResult', fn: () => window.App.renderProgramResult },
    { path: 'window.App.renderFilters', fn: () => window.App.renderFilters },
    { path: 'window.App.renderAddExerciseModal', fn: () => window.App.renderAddExerciseModal },
    { path: 'window.App.renderCatalog', fn: () => window.App.renderCatalog },
    { path: 'window.App.renderDetail', fn: () => window.App.renderDetail },
    { path: 'window.App.renderScientificHub', fn: () => window.App.renderScientificHub },
    { path: 'window.App.renderSourceDetail', fn: () => window.App.renderSourceDetail },
    { path: 'window._exportProgramToExcel', fn: () => window._exportProgramToExcel }
];

expectedFunctions.forEach(({ path: name, fn }) => {
    try {
        const val = fn();
        if (typeof val === 'function') {
            console.log(`✅ PASS: ${name} is a function`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${name} is ${typeof val}, expected function`);
            failed++;
        }
    } catch (e) {
        console.error(`❌ FAIL: ${name} threw error: ${e.message}`);
        failed++;
    }
});

// 4. Verify escapeHTML works correctly
try {
    const result = window.escapeHTML('<script>alert("xss")</script>');
    if (result.includes('&lt;') && result.includes('&gt;') && result.includes('&quot;')) {
        console.log("✅ PASS: escapeHTML correctly escapes dangerous characters");
        passed++;
    } else {
        console.error(`❌ FAIL: escapeHTML produced unexpected output: ${result}`);
        failed++;
    }
} catch (e) {
    console.error(`❌ FAIL: escapeHTML threw error: ${e.message}`);
    failed++;
}

// Results
console.log(`\n══════════════════════════════════════════════════`);
if (failed > 0) {
    console.error(`  RESULTS: ${passed} PASS  /  ${failed} FAIL`);
    console.error(`  ❌ ${failed} TESTS FAILED`);
    process.exit(1);
} else {
    console.log(`  RESULTS: ${passed} PASS  /  ${failed} FAIL`);
    console.log(`  ✅ ALL TESTS PASSED`);
}
