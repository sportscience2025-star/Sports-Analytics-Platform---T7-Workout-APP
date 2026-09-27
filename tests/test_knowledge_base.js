const fs = require('fs');
const path = require('path');

// =========================================================================
// 1. Mock browser environment globals
// =========================================================================
global.window = {
    App: {
        getExercises: () => [
            { id: 'ex_squat', name: 'Squat con Bilanciere', type: 'Multiarticolare', primaryMuscle: 'Gambe', muscles: ['Gambe'], quality: 'Forza', equipment: 'Bilanciere', specs: { sets: 3, reps: '10', rest: '90s' } },
            { id: 'ex_rdl', name: 'Stacco Rumeno', type: 'Multiarticolare', primaryMuscle: 'Gambe', muscles: ['Gambe'], quality: 'Forza', equipment: 'Bilanciere', specs: { sets: 3, reps: '10', rest: '90s' } },
            { id: 'ex_bench', name: 'Panca Piana', type: 'Multiarticolare', primaryMuscle: 'Petto', muscles: ['Petto'], quality: 'Forza', equipment: 'Bilanciere', specs: { sets: 3, reps: '10', rest: '90s' } },
            { id: 'ex_curl', name: 'Curl Bicipiti', type: 'Isolamento', primaryMuscle: 'Bicipiti', muscles: ['Bicipiti'], quality: 'Ipertrofia', equipment: 'Manubri', specs: { sets: 3, reps: '12', rest: '60s' } },
            { id: 'ex_leg_ext', name: 'Leg Extension', type: 'Isolamento', primaryMuscle: 'Gambe', muscles: ['Gambe'], quality: 'Ipertrofia', equipment: 'Macchine', specs: { sets: 3, reps: '12', rest: '60s' } },
            { id: 'ex_press', name: 'Military Press', type: 'Multiarticolare', primaryMuscle: 'Spalle', muscles: ['Spalle'], quality: 'Forza', equipment: 'Bilanciere', specs: { sets: 3, reps: '10', rest: '90s' } },
            { id: 'ex_pullup', name: 'Trazioni Sbarra', type: 'Multiarticolare', primaryMuscle: 'Schiena', muscles: ['Schiena'], quality: 'Forza', equipment: 'Sbarra Trazioni', specs: { sets: 3, reps: '8', rest: '120s' } }
        ],
        getConditions: () => [
            { id: 'post_op_lca', name: 'Post-op LCA', category: 'post_chirurgiche', description: 'Ricostruzione crociato anteriore.' },
            { id: 'patellar_tendonitis', name: 'Tendinite Rotulea', category: 'tendinopatie', description: 'Infiammazione del tendine rotuleo.' }
        ]
    }
};

// Assertion helper
function assert(condition, message) {
    if (!condition) {
        console.error("❌ Assertion Failed:", message);
        process.exit(1);
    }
}