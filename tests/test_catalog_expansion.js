/**
 * Test Suite: Validazione Espansione Catalogo Esercizi (504 schede convalidate)
 * Verifica: conteggio esatto, assenza nulli/sparse array, unicità ID, assenza livello 'Pro',
 * copertura muscolare, filtri anatomici e motore di ordinamento.
 */
const fs = require('fs');
const path = require('path');

const EXPECTED_EXERCISE_COUNT = 504;
const MIN_STABILITY_COUNT = 20;
const MIN_CALF_COUNT = 15;

console.log('=== Inizio Test Suite: Espansione Catalogo Esercizi ===');

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
    'exercises.js',
    'init.js',
    'filters.js'
];

for (const df of dataFiles) {
    const filePath = path.join(projectRoot, 'js', 'data', df);
    if (!fs.existsSync(filePath)) {
        console.error(`Missing data file: ${filePath}`);
        process.exit(1);
    }
    const code = fs.readFileSync(filePath, 'utf8');
    eval(code);
    console.log(`PASS: Caricato modulo js/data/${df}`);
}

const exercises = global.window.App.exercises;

// 1. Conteggio totale
if (!exercises || exercises.length !== EXPECTED_EXERCISE_COUNT) {
    console.error(`FAIL: Attesi ${EXPECTED_EXERCISE_COUNT} esercizi, trovati: ${exercises ? exercises.length : 0}`);
    process.exit(1);
}
console.log(`PASS 1: Conteggio totale verificato (${exercises.length} esercizi)`);

// 2. Nessun elemento nullo o sparse slot
const nullSlots = exercises.filter(x => !x).length;
if (nullSlots > 0) {
    console.error(`FAIL: Rilevati ${nullSlots} elementi null o undefined nell'array`);
    process.exit(1);
}
console.log(`PASS 2: Zero elementi null o slot sparsi`);

// 3. Unicità ID
const seenIds = new Set();
const duplicateIds = [];
for (const ex of exercises) {
    if (!ex.id) {
        console.error(`FAIL: Esercizio senza ID: ${ex.name}`);
        process.exit(1);
    }
    if (seenIds.has(ex.id)) {
        duplicateIds.push(ex.id);
    }
    seenIds.add(ex.id);
}
if (duplicateIds.length > 0) {
    console.error(`FAIL: ID duplicati rilevati:`, duplicateIds);
    process.exit(1);
}
console.log(`PASS 3: Tutti i ${seenIds.size} ID sono rigorosamente univoci`);

// 4. Presenza campi obbligatori
for (const ex of exercises) {
    if (!ex.name || !ex.primaryMuscle || !ex.type || !ex.equipment || !ex.level || !ex.quality) {
        console.error(`FAIL: Esercizio ${ex.id} con campi obbligatori mancanti`);
        process.exit(1);
    }
}
console.log(`PASS 4: Campi obbligatori presenti su tutti gli esercizi`);

// 5. Assenza totale del livello 'Pro'
const proExercises = exercises.filter(ex => ex.level === 'Pro');
if (proExercises.length > 0) {
    console.error(`FAIL: Rilevati ${proExercises.length} esercizi con level: 'Pro'`);
    process.exit(1);
}
console.log(`PASS 5: Nessun esercizio con livello 'Pro' residuo`);

// 6. Test filtro Stabilità (con gestione accento)
const stabilityExs = global.window.App.getExercises({ quality: 'Stabilità' });
if (!stabilityExs || stabilityExs.length < MIN_STABILITY_COUNT) {
    console.error(`FAIL: Esercizi di Stabilità insufficienti: ${stabilityExs ? stabilityExs.length : 0}`);
    process.exit(1);
}
console.log(`PASS 6: Filtro qualità 'Stabilità' verificato (${stabilityExs.length} esercizi)`);

// 7. Test filtro per distretto muscolare arricchito (Polpacci)
const calfExs = global.window.App.getExercises({ muscle: 'polpacci' });
if (!calfExs || calfExs.length < MIN_CALF_COUNT) {
    console.error(`FAIL: Esercizi per polpacci insufficienti: ${calfExs ? calfExs.length : 0}`);
    process.exit(1);
}
console.log(`PASS 7: Filtro anatomico 'polpacci' verificato (${calfExs.length} esercizi)`);

// 8. Test ordinamento (A-Z per nome, per livello, per tipo)
const sortedNameAsc = global.window.App.getExercises({ sortBy: 'name_asc' });
if (sortedNameAsc[0].name.localeCompare(sortedNameAsc[sortedNameAsc.length - 1].name, 'it') >= 0) {
    console.error(`FAIL: Ordinamento alfabetico per nome fallito`);
    process.exit(1);
}

const sortedLevelAsc = global.window.App.getExercises({ sortBy: 'level_asc' });
if (sortedLevelAsc[0].level !== 'Principiante' || sortedLevelAsc[sortedLevelAsc.length - 1].level !== 'Avanzato') {
    console.error(`FAIL: Ordinamento per livello fallito (primo: ${sortedLevelAsc[0].level}, ultimo: ${sortedLevelAsc[sortedLevelAsc.length - 1].level})`);
    process.exit(1);
}

const sortedTypeAsc = global.window.App.getExercises({ sortBy: 'type_asc' });
if (sortedTypeAsc[0].type !== 'Multiarticolare' || sortedTypeAsc[sortedTypeAsc.length - 1].type !== 'Isometrico') {
    console.error(`FAIL: Ordinamento per tipo fallito (primo: ${sortedTypeAsc[0].type}, ultimo: ${sortedTypeAsc[sortedTypeAsc.length - 1].type})`);
    process.exit(1);
}
console.log(`PASS 8: Ordinamento verificato con successo su tutte le chiavi (Nome, Livello, Tipo)`);

console.log('\n=== TUTTI GLI 8 TEST DI VALIDAZIONE DEL CATALOGO SONO PASSATI CON SUCCESSO! ===');
