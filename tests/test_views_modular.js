const fs = require('fs');
const path = require('path');

console.log('=== Verifying Modular Views (js/views/*.js) ===');

// Setup mock window & App
global.window = global.window || {};
global.window.App = global.window.App || {};
global.window.App.Views = global.window.App.Views || {};
global.window.App.renderFilters = () => {};
global.window.App.renderCatalog = () => {};
global.window.App.getExercises = async () => [];
global.window.App.getFavoriteExercises = () => [];
global.window.App.renderWizard = () => {};
global.window.App.renderProgramResult = () => {};
global.window.App.renderScientificHub = () => {};

// Load view scripts
const viewFiles = [
    'catalog-view.js',
    'wizard-view.js',
    'analysis-view.js',
    'favorites-view.js',
    'scientific-hub-view.js',
    'rag-view.js'
];

for (const vf of viewFiles) {
    const filePath = path.join(__dirname, '..', 'js', 'views', vf);
    const code = fs.readFileSync(filePath, 'utf8');
    eval(code);
}

// Assertions
const views = ['catalog', 'wizard', 'analysis', 'favorites', 'scientific_hub', 'rag'];

for (const v of views) {
    if (!global.window.App.Views[v]) {
        console.error(`❌ View '${v}' is not registered on App.Views`);
        if (typeof process !== 'undefined' && process.exit) process.exit(1);
        throw new Error(`View '${v}' is not registered`);
    }
    if (typeof global.window.App.Views[v].render !== 'function') {
        console.error(`❌ View '${v}' does not define a render method`);
        if (typeof process !== 'undefined' && process.exit) process.exit(1);
        throw new Error(`View '${v}' missing render`);
    }
    if (typeof global.window.App.Views[v].cleanup !== 'function') {
        console.error(`❌ View '${v}' does not define a cleanup method`);
        if (typeof process !== 'undefined' && process.exit) process.exit(1);
        throw new Error(`View '${v}' missing cleanup`);
    }
    console.log(`✅ View '${v}' verified (render & cleanup present)`);
}

console.log('ALL MODULAR VIEWS VERIFIED SUCCESSFULLY!');
if (typeof process !== 'undefined' && process.exit) {
    process.exit(0);
}
