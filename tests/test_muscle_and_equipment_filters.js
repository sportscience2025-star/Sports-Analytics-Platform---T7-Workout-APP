/**
 * Test Suite: Validazione Filtri Muscolari, Attrezzatura e Ricerca
 */
const assert = require('assert');
const fs = require('fs');

global.window = global;
global.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
};

// Carica moduli dati e filtri
eval(fs.readFileSync('js/data/taxonomy.js', 'utf8'));
eval(fs.readFileSync('js/data/conditions.js', 'utf8'));
eval(fs.readFileSync('js/data/exercises.js', 'utf8'));
eval(fs.readFileSync('js/data/init.js', 'utf8'));
eval(fs.readFileSync('js/data/filters.js', 'utf8'));

console.log('=== Inizio Test Filtri Catalogo ===');

// 1. Test Filtro Muscolo: Pettorali
const pettorali = window.App.getExercises({ muscle: 'Pettorali' });
assert.ok(pettorali.length > 0, 'Pettorali deve restituire esercizi');
console.log('  [PASS] Filtro "Pettorali": trovati', pettorali.length, 'esercizi');

// 2. Test Tutti i Muscoli della Tassonomia
const taxonomy = window.App.MUSCLE_TAXONOMY;
for (const [key, group] of Object.entries(taxonomy)) {
    // Macro label
    const macroRes = window.App.getExercises({ muscle: group.label });
    assert.ok(macroRes.length > 0, `Macro gruppo ${group.label} deve restituire esercizi`);
    
    // Sub-muscles
    for (const sub of group.muscles) {
        const subRes = window.App.getExercises({ muscle: sub });
        assert.ok(subRes.length > 0, `Sotto-muscolo ${sub} deve restituire esercizi (trovati: ${subRes.length})`);
    }
}
console.log('  [PASS] Tutti i 19 muscoli della tassonomia restituiscono esercizi con successo');

// 3. Test Attrezzatura Panca e altre categorie
const panca = window.App.getExercises({ equipment: 'Panca' });
assert.ok(panca.length > 0, 'Attrezzatura "Panca" deve restituire esercizi con panca');
console.log('  [PASS] Filtro Attrezzatura "Panca": trovati', panca.length, 'esercizi');

const bilanciere = window.App.getExercises({ equipment: 'Bilanciere' });
assert.ok(bilanciere.length > 0, 'Bilanciere deve restituire esercizi');
console.log('  [PASS] Filtro Attrezzatura "Bilanciere": trovati', bilanciere.length, 'esercizi');

// 4. Test Ricerca Testuale con Sinonimi Anatomici
const searchPettorali = window.App.getExercises({ search: 'pettorali' });
assert.ok(searchPettorali.length > 0, 'Ricerca "pettorali" deve trovare esercizi per il petto');
console.log('  [PASS] Ricerca per "pettorali": trovati', searchPettorali.length, 'esercizi');

const searchSquat = window.App.getExercises({ search: 'squat' });
assert.ok(searchSquat.length > 0, 'Ricerca "squat" deve trovare esercizi');
console.log('  [PASS] Ricerca per "squat": trovati', searchSquat.length, 'esercizi');

// 5. Test Preferiti
const exSample = window.App.exercises[0];
window.App.toggleFavorite(exSample.id);
const favs = window.App.getFavoriteExercises();
assert.strictEqual(favs.length, 1);
assert.strictEqual(favs[0].id, exSample.id);
console.log('  [PASS] Toggle preferiti e getFavoriteExercises funzionano regolarmente');

console.log('\n=== Tutti i test sui filtri sono superati al 100%! ===\n');
