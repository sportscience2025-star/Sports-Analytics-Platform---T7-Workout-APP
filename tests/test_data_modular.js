const fs = require('fs');
const path = require('path');

console.log('=== Verifying Modular Data Layer (js/data/*.js) ===');

// Setup mock window & environment
global.window = global.window || {};
global.window.App = global.window.App || {};
global.localStorage = {
    _store: {},
    getItem: function (key) { return this._store[key] || null; },
    setItem: function (key, val) { this._store[key] = String(val); },
    removeItem: function (key) { delete this._store[key]; }
};

const projectRoot = path.resolve(__dirname, '..');
const dataFiles = [
    'taxonomy.js',
    'conditions.js',
    'exercises.js',
    'init.js',
    'filters.js'
];

for (const df of dataFiles) {
    const filePath = path.join(projectRoot, 'js', 'data', df);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Missing data file: ${filePath}`);
        if (typeof process !== 'undefined' && process.exit) process.exit(1);
        throw new Error(`File missing: ${df}`);
    }
    const code = fs.readFileSync(filePath, 'utf8');
    eval(code);
    console.log(`PASS: Loaded js/data/${df}`);
}

// 1. Taxonomy assertions
if (!global.window.App.MUSCLE_TAXONOMY) {
    console.error('❌ window.App.MUSCLE_TAXONOMY is missing');
    process.exit(1);
}
if (!global.window.App.MUSCLE_TAXONOMY.Chest || !global.window.App.MUSCLE_TAXONOMY.Chest.muscles) {
    console.error('❌ window.App.MUSCLE_TAXONOMY missing Chest');
    process.exit(1);
}
console.log('✅ Taxonomy verified');

// 2. Conditions assertions
const conditions = global.window.App.getConditions();
if (!conditions || !Array.isArray(conditions) || conditions.length < 100) {
    console.error('❌ Clinical conditions missing or too few:', conditions ? conditions.length : null);
    process.exit(1);
}
const seenIds = new Set();
for (const c of conditions) {
    if (!c.id || seenIds.has(c.id)) {
        console.error(`❌ Duplicate or invalid condition ID: ${c.id}`);
        process.exit(1);
    }
    seenIds.add(c.id);
}
console.log(`✅ Clinical conditions verified (${conditions.length} unique conditions, getConditions in place)`);

// 3. Exercises & Init assertions
if (!global.window.App.exercises || global.window.App.exercises.length < 300) {
    console.error('❌ Exercises array missing or too few:', global.window.App.exercises ? global.window.App.exercises.length : null);
    process.exit(1);
}
if (!global.window.App._dataInitialized) {
    console.error('❌ window.App._dataInitialized is false');
    process.exit(1);
}
console.log(`✅ Exercises repository & initData verified (${global.window.App.exercises.length} exercises)`);

// 4. Filtering assertions
if (typeof global.window.App.getExercises !== 'function') {
    console.error('❌ window.App.getExercises is not a function');
    process.exit(1);
}
const all = global.window.App.getExercises();
if (all.length !== global.window.App.exercises.length) {
    console.error(`❌ getExercises() count mismatch: ${all.length} vs ${global.window.App.exercises.length}`);
    process.exit(1);
}
const squats = global.window.App.getExercises({ search: 'squat' });
if (squats.length === 0) {
    console.error('❌ getExercises({ search: "squat" }) returned 0 results');
    process.exit(1);
}
const forzaExs = global.window.App.getExercises({ quality: 'Forza' });
if (forzaExs.length === 0) {
    console.error('❌ getExercises({ quality: "Forza" }) returned 0 results');
    process.exit(1);
}
console.log(`✅ Filters verified (Search: ${squats.length} squats, Quality: ${forzaExs.length} Forza exercises)`);

// 5. Favorites assertions
if (typeof global.window.App.toggleFavorite !== 'function') {
    console.error('❌ window.App.toggleFavorite is not a function');
    process.exit(1);
}
const testId = global.window.App.exercises[0].id;
global.window.App.toggleFavorite(testId);
if (!global.window.App.isFavorite(testId)) {
    console.error(`❌ isFavorite(${testId}) failed after toggle`);
    process.exit(1);
}
const favs = global.window.App.getFavoriteExercises();
if (favs.length !== 1 || favs[0].id !== testId) {
    console.error('❌ getFavoriteExercises mismatch');
    process.exit(1);
}
global.window.App.toggleFavorite(testId); // untoggle
console.log('✅ Favorites management verified');

console.log('ALL MODULAR DATA LAYER TESTS PASSED!');
if (typeof process !== 'undefined' && process.exit) {
    process.exit(0);
}
