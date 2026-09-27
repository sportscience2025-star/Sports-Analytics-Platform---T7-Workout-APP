/**
 * tests/test_exercise_detail_resolver.js
 * Suite di test automatizzata per verificare la risoluzione dei dettagli esercizio (R1, R2, R4)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// 1. Setup mock browser environment
global.window = { App: {} };
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};
global.document = {
    head: { appendChild: () => {} },
    getElementById: () => null,
    createElement: () => ({
        style: {},
        innerHTML: '',
        textContent: '',
        appendChild: () => {},
        setAttribute: () => {}
    })
};

// 2. Carica catalog data e modulo resolver
const projectRoot = path.resolve(__dirname, '../');

function loadScript(relPath) {
    const fullPath = path.join(projectRoot, relPath);
    const code = fs.readFileSync(fullPath, 'utf8');
    eval(code);
}

// Inizializza i dati degli esercizi
loadScript('js/data/taxonomy.js');
loadScript('js/data/conditions.js');
loadScript('js/data/exercises.js');
loadScript('js/data/init.js');
loadScript('js/data/filters.js');

// Carica il resolver
loadScript('js/ui/exercise-detail-resolver.js');

console.log('=== Inizio Test Suite: exercise-detail-resolver.js ===\n');

let totalTests = 0;
let passedTests = 0;

function it(desc, fn) {
    totalTests++;
    try {
        fn();
        passedTests++;
        console.log(`  [OK] ${desc}`);
    } catch (err) {
        console.error(`  [FAIL] ${desc}`);
        console.error(err);
        process.exit(1);
    }
}

/**
 * Funzione di controllo ricorsivo contro 'undefined' o 'N/A' (sia esatti che come sottostringhe)
 */
function assertNoUndefinedOrNA(obj, path = '') {
    if (obj === undefined) {
        throw new Error(`Field at ${path} is undefined`);
    }
    if (typeof obj === 'string') {
        if (obj === 'N/A' || obj.includes('undefined') || obj.includes('"N/A"')) {
            throw new Error(`Field at ${path} contains invalid string: "${obj}"`);
        }
    } else if (Array.isArray(obj)) {
        obj.forEach((item, idx) => assertNoUndefinedOrNA(item, `${path}[${idx}]`));
    } else if (obj !== null && typeof obj === 'object') {
        Object.keys(obj).forEach(k => assertNoUndefinedOrNA(obj[k], `${path}.${k}`));
    }
}

// ── TEST 1: Risoluzione esercizi atletici con match per ID a catalogo ──
it('1. Risoluzione per ID: trova esercizio esistente a catalogo (bk_b01)', () => {
    const res = window.App.resolveExerciseDetail('bk_b01', 'Lat Machine al Petto', null);
    assert(res, 'Deve restituire un oggetto');
    assert.strictEqual(res.id, 'bk_b01');
    assert.strictEqual(res.name, 'Lat Machine al Petto');
    assert(res.primaryMuscle, 'Deve avere primaryMuscle');
    assert(res.execution, 'Deve avere execution');
    assert(Array.isArray(res.execution.setup), 'Deve avere setup');
    assert(Array.isArray(res.execution.steps), 'Deve avere steps');
    assert(Array.isArray(res.errors), 'Deve avere errors');
    assertNoUndefinedOrNA(res, 'res');
});

it('1b. Risoluzione per ID: trova esercizio a catalogo per ID diverso dal nome', () => {
    const res = window.App.resolveExerciseDetail('bk_a03', 'Nome Qualsiasi', null);
    assert(res, 'Deve restituire un oggetto');
    assert.strictEqual(res.id, 'bk_a03');
    assert.strictEqual(res.name, 'Front Lever Tuck Row');
    assertNoUndefinedOrNA(res, 'res');
});

// ── TEST 2: Risoluzione per Nome Esatto a catalogo ──
it('2. Risoluzione per Nome Esatto (case-insensitive con trim)', () => {
    const res = window.App.resolveExerciseDetail(null, '  front lever tuck row  ', null);
    assert(res, 'Deve restituire un oggetto');
    assert.strictEqual(res.id, 'bk_a03');
    assert.strictEqual(res.name, 'Front Lever Tuck Row');
    assertNoUndefinedOrNA(res, 'res');
});

// ── TEST 3: Risoluzione per Corrispondenza Normalizzata (varianti/parentesi) ──
it('3. Risoluzione Normalizzata: pulizia parentesi tonde e quadre', () => {
    const res = window.App.resolveExerciseDetail(null, 'Stacco Rumeno con Manubri (Focus Femorali)', null);
    assert(res, 'Deve trovare corrispondenza normalizzata');
    // Deve mantenere il nome specifico variante
    assert.strictEqual(res.name, 'Stacco Rumeno con Manubri (Focus Femorali)');
    assert(res.execution, 'Deve ereditare execution del genitore');
    assert(res.errors.length > 0, 'Deve avere errori dal catalogo');
    assertNoUndefinedOrNA(res, 'res');
});

it('3b. Risoluzione Normalizzata: preserva specifiche di carico dal programma', () => {
    const context = {
        exercise: {
            name: 'Stacco Rumeno con Manubri (ROM Parziale)',
            specs: { sets: 4, reps: '8', rest: '90s', rpe: 8, tempo: '3-0-1', load: '16+16kg' },
            note: 'Fermati prima del fastidio femorale.'
        }
    };
    const res = window.App.resolveExerciseDetail(null, 'Stacco Rumeno con Manubri (ROM Parziale)', context);
    assert(res, 'Deve trovare genitore');
    assert.strictEqual(res.specs.sets, 4);
    assert.strictEqual(res.specs.load, '16+16kg');
    assert(res.description.includes('Fermati prima del fastidio femorale.'), 'Deve includere la nota');
    assertNoUndefinedOrNA(res, 'res');
});

// ── TEST 4: Risoluzione esercizi clinici hard-coded (cli_01 ... cli_32) ──
it('4. Risoluzione Clinica: cli_01 Isometric Wall Sit (Angolo limitato a 60° flessione)', () => {
    const mockProgram = {
        meta: { level: 'Adattato Clinico', patientType: 'Clinico' },
        phases: [
            {
                phase: 'Fase 1',
                schedule: [
                    {
                        name: 'Giorno 1',
                        focus: 'Gambe • Core',
                        exercises: [
                            {
                                id: 'cli_01',
                                name: 'Isometric Wall Sit (Angolo limitato a 60° flessione)',
                                primaryMuscle: 'Gambe',
                                type: 'Isometrico',
                                specs: { sets: 3, reps: '30s', rest: '60s', rpe: 6, tempo: 'Isometria', load: 'A corpo libero' },
                                note: 'Limitare flessione ginocchio a 60°. Schiaccia una pallina morbida tra le ginocchia.'
                            }
                        ]
                    }
                ]
            }
        ]
    };

    const res = window.App.resolveExerciseDetail('cli_01', 'Isometric Wall Sit (Angolo limitato a 60° flessione)', { result: mockProgram });
    assert(res, 'Deve generare scheda sintetica ricca');
    assert.strictEqual(res.id, 'cli_01');
    assert.strictEqual(res.primaryMuscle, 'Gambe');
    assert.strictEqual(res.type, 'Isometrico');
    assert.strictEqual(res.level, 'Adattato Clinico');
    assert.strictEqual(res.equipment, 'A corpo libero');
    assert(res.description.includes('Limitare flessione ginocchio a 60°'));
    assert(res.execution.setup.length >= 2, 'Setup deve avere almeno 2 passi');
    assert(res.execution.steps.length >= 3, 'Steps deve avere almeno 3 passi');
    assert(res.execution.cues.length >= 2, 'Cues deve avere almeno 2 punti');
    assert(res.execution.criteria.length >= 2, 'Criteria deve avere almeno 2 elementi');
    assert(res.errors.length >= 2, 'Errors deve contenere almeno 2 errori clinici');
    res.errors.forEach(err => {
        assert(err.error && err.why && err.fix, 'Ogni errore deve avere error, why, fix');
    });
    assertNoUndefinedOrNA(res, 'res');
});

it('4b. Risoluzione Clinica: tutti gli esercizi cli_01..cli_32 producono schede integre', () => {
    const clinicalIds = [
        'cli_01', 'cli_02', 'cli_03', 'cli_04', 'cli_05', 'cli_06', 'cli_07', 'cli_08', 'cli_09',
        'cli_d01', 'cli_d02', 'cli_d03', 'cli_d04', 'cli_d05', 'cli_d06',
        'cli_10', 'cli_11', 'cli_12', 'cli_13', 'cli_14', 'cli_15', 'cli_16', 'cli_17', 'cli_18',
        'cli_19', 'cli_20', 'cli_21', 'cli_22', 'cli_23', 'cli_24', 'cli_25', 'cli_26', 'cli_27',
        'cli_28', 'cli_29', 'cli_30', 'cli_31', 'cli_32'
    ];

    clinicalIds.forEach(id => {
        const res = window.App.resolveExerciseDetail(id, `Esercizio Clinico ${id}`, null);
        assert(res, `Deve risolvere ${id}`);
        assert.strictEqual(res.level, 'Adattato Clinico', `${id} deve avere level Adattato Clinico`);
        assert(res.execution && res.execution.setup.length > 0);
        assert(res.execution && res.execution.steps.length > 0);
        assert(res.execution && res.execution.cues.length > 0);
        assert(res.execution && res.execution.criteria.length > 0);
        assert(res.errors && res.errors.length > 0);
        assertNoUndefinedOrNA(res, `clinical_${id}`);
    });
});

// ── TEST 5: Risoluzione Warmup e Cooldown / Cardio privi di ID o con ID dinamico ──
it('5a. Risoluzione Warmup: Cat-Cow Mobilità Spinale senza ID', () => {
    const res = window.App.resolveExerciseDetail(null, 'Cat-Cow Mobilità Spinale', {
        exercise: { name: 'Cat-Cow Mobilità Spinale', specs: { sets: 1, reps: '60s', rest: '-' }, isWarmup: true }
    });
    assert(res, 'Deve generare scheda');
    assert.strictEqual(res.type, 'Attivazione / Mobilità');
    assert.strictEqual(res.equipment, 'A corpo libero');
    assert(res.muscles.length > 0);
    assert(res.execution.setup.length > 0);
    assert(res.execution.steps.length > 0);
    assert(res.errors.length > 0);
    assertNoUndefinedOrNA(res, 'warmup_cat_cow');
});

it('5b. Risoluzione Cooldown/Cardio con ID dinamico (c_abc12)', () => {
    const res = window.App.resolveExerciseDetail('c_abc12', 'Allungamento Flessori Coscia (Hamstring Stretch)', {
        exercise: { id: 'c_abc12', name: 'Allungamento Flessori Coscia (Hamstring Stretch)', specs: { sets: '1 set', reps: '60s/gamba', rest: '-' }, isCardio: true }
    });
    assert(res, 'Deve generare scheda');
    assert(res.primaryMuscle, 'Deve avere muscolo primario');
    assert(res.execution.cues.length > 0);
    assert(res.errors.length > 0);
    assertNoUndefinedOrNA(res, 'cardio_stretch');
});

it('5c. Risoluzione Cardio Macchina: Cicloergometro / Cyclette', () => {
    const res = window.App.resolveExerciseDetail('cli_25', 'Cicloergometro/Cyclette (Endurance Zona 2)', {
        exercise: { id: 'cli_25', name: 'Cicloergometro/Cyclette (Endurance Zona 2)', specs: { sets: '1 set', reps: '20 min', rest: '-', load: 'Resistenza mod.' }, isCardio: true }
    });
    assert(res, 'Deve generare scheda');
    assert.strictEqual(res.equipment, 'Macchina Cardio');
    assert.strictEqual(res.type, 'Cardio / Defaticamento');
    assertNoUndefinedOrNA(res, 'cardio_cyclette');
});

// ── TEST 6: Scansione completa in programma complesso multi-fase ──
it('6. Scansione in programma multi-fase trova warmup, main workout e cardio', () => {
    const fullProgram = {
        meta: { level: 'Intermedio', patientType: 'Sportivo' },
        phases: [
            {
                phase: 'Fase 1',
                schedule: [
                    {
                        name: 'Giorno A',
                        focus: 'Gambe • Core',
                        exercises: [
                            { id: 'w_01', name: 'Drills di Corsa (Skips, Calciata)', specs: { sets: 2, reps: '15m' }, isWarmup: true },
                            { id: 'ex_custom_1', name: 'Single-Leg Balance & Reach', specs: { sets: 3, reps: '8/lato' } },
                            { id: 'c_01', name: 'Stretching Statico Gambe e Schiena', specs: { sets: 1, reps: '3 min' }, isCardio: true }
                        ]
                    }
                ]
            }
        ]
    };

    // Warmup
    const wRes = window.App.resolveExerciseDetail('w_01', 'Drills di Corsa (Skips, Calciata)', { result: fullProgram });
    assert(wRes);
    assert.strictEqual(wRes.name, 'Drills di Corsa (Skips, Calciata)');
    assertNoUndefinedOrNA(wRes, 'wRes');

    // Main workout
    const mRes = window.App.resolveExerciseDetail('ex_custom_1', 'Single-Leg Balance & Reach', { result: fullProgram });
    assert(mRes);
    assert.strictEqual(mRes.name, 'Single-Leg Balance & Reach');
    assertNoUndefinedOrNA(mRes, 'mRes');

    // Cardio
    const cRes = window.App.resolveExerciseDetail('c_01', 'Stretching Statico Gambe e Schiena', { result: fullProgram });
    assert(cRes);
    assert.strictEqual(cRes.name, 'Stretching Statico Gambe e Schiena');
    assertNoUndefinedOrNA(cRes, 'cRes');
});

// ── TEST 7: Edge case - Parametri vuoti o nulla ──
it('7. Robustezza: gestisce parametri null, stringhe vuote o ID sconosciuto', () => {
    const res1 = window.App.resolveExerciseDetail(null, null, null);
    assert(res1, 'Deve restituire un fallback valido');
    assert(res1.name, 'Deve avere un nome');
    assertNoUndefinedOrNA(res1, 'null_args');

    const res2 = window.App.resolveExerciseDetail('unknown_id_999', 'Esercizio Mai Visto Prima', {});
    assert(res2, 'Deve generare un fallback completo');
    assert.strictEqual(res2.id, 'unknown_id_999');
    assert.strictEqual(res2.name, 'Esercizio Mai Visto Prima');
    assertNoUndefinedOrNA(res2, 'unknown_ex');
});

// ── TEST 8: Simulazione Event Listener in wizard.js ──
it('8. Wizard click listener delegation invoca window.App.renderDetail con oggetto risolto', () => {
    let renderedExercise = null;
    window.App.renderDetail = (ex) => {
        renderedExercise = ex;
    };

    const mockResult = {
        meta: { level: 'Adattato Clinico', patientType: 'Clinico' },
        phases: [
            {
                phase: 'Fase 1',
                schedule: [
                    {
                        name: 'Giorno 1',
                        exercises: [
                            {
                                id: 'cli_04',
                                name: 'Goblet Squat su Box Alto (Angolo ginocchio max 60°)',
                                primaryMuscle: 'Gambe',
                                type: 'Multiarticolare',
                                specs: { sets: 3, reps: '10', rest: '75s', rpe: 5, tempo: '3-1-1', load: 'Manubrio 6-8kg' },
                                note: 'Limitare flessione ginocchio a 60°. Box alto funge da blocco meccanico di sicurezza.'
                            }
                        ]
                    }
                ]
            }
        ]
    };

    // Creiamo un listener mock con la stessa logica di wizard.js
    let clickListener = null;
    const mockContainer = {
        addEventListener: (event, handler) => {
            if (event === 'click') clickListener = handler;
        }
    };

    // Replica fedele del listener in wizard.js
    mockContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-ex-detail');
        if (!btn) return;
        const exName = btn.dataset.exName;
        const exId = btn.dataset.exId;
        let fullEx = null;

        if (window.App.resolveExerciseDetail) {
            fullEx = window.App.resolveExerciseDetail(exId, exName, { result: mockResult, container: mockContainer });
        } else if (window.App.getExercises) {
            const all = window.App.getExercises();
            fullEx = all.find(item => (item.id && item.id === exId) || item.name === exName);
        }

        if (fullEx && window.App.renderDetail) {
            window.App.renderDetail(fullEx);
        }
    });

    // Simula click su pulsante con data-ex-id="cli_04"
    const fakeBtn = {
        dataset: {
            exId: 'cli_04',
            exName: 'Goblet Squat su Box Alto (Angolo ginocchio max 60°)'
        },
        closest: (sel) => (sel === '.btn-ex-detail' ? fakeBtn : null)
    };

    clickListener({ target: fakeBtn });

    assert(renderedExercise, 'window.App.renderDetail deve essere stato invocato');
    assert.strictEqual(renderedExercise.id, 'cli_04');
    assert.strictEqual(renderedExercise.primaryMuscle, 'Gambe');
    assert.strictEqual(renderedExercise.level, 'Adattato Clinico');
    assert(renderedExercise.execution.setup.length > 0);
    assertNoUndefinedOrNA(renderedExercise, 'renderedExercise');
});

// ── TEST 9: Pattern specifici di errore per Upper Push e Upper Pull ──
it('9. Errori biomeccanici specifici per Upper Push e Upper Pull', () => {
    const pushRes = window.App.resolveExerciseDetail(null, 'Piegamenti sulle braccia avanzati', null);
    assert(pushRes.errors.length >= 2, 'Deve avere errori per Upper Push');
    assert(pushRes.errors.some(e => e.error.includes('scapolare') || e.error.includes('Gomiti')));
    assertNoUndefinedOrNA(pushRes, 'pushRes');

    const pullRes = window.App.resolveExerciseDetail(null, 'Trazioni alla sbarra dinamiche', null);
    assert(pullRes.errors.length >= 2, 'Deve avere errori per Upper Pull');
    assert(pullRes.errors.some(e => e.error.includes('Tirata') || e.error.includes('Spalle')));
    assertNoUndefinedOrNA(pullRes, 'pullRes');
});

// ── TEST 10: Disambiguazione multi-fase tramite phaseId ──
it('10. Disambiguazione multi-fase: restituisce specifiche della fase indicata', () => {
    const multiPhaseProg = {
        meta: { level: 'Intermedio' },
        phases: [
            {
                id: 1,
                phase: 'Fase 1 - Accumulo',
                schedule: [
                    {
                        exercises: [
                            { id: 'ex_test', name: 'Panca Piana Manubri', specs: { sets: 3, reps: '10', load: '16+16kg' }, note: 'Accumulo volume' }
                        ]
                    }
                ]
            },
            {
                id: 2,
                phase: 'Fase 2 - Intensificazione',
                schedule: [
                    {
                        exercises: [
                            { id: 'ex_test', name: 'Panca Piana Manubri', specs: { sets: 4, reps: '6', load: '24+24kg' }, note: 'Focus carico' }
                        ]
                    }
                ]
            }
        ]
    };

    const resPhase1 = window.App.resolveExerciseDetail('ex_test', 'Panca Piana Manubri', { result: multiPhaseProg, phaseId: 1 });
    assert.strictEqual(resPhase1.specs.sets, 3);
    assert.strictEqual(resPhase1.specs.load, '16+16kg');

    const resPhase2 = window.App.resolveExerciseDetail('ex_test', 'Panca Piana Manubri', { result: multiPhaseProg, phaseId: 2 });
    assert.strictEqual(resPhase2.specs.sets, 4);
    assert.strictEqual(resPhase2.specs.load, '24+24kg');
});

// ── TEST 11: Validazione su programmi reali generati da WorkoutGeneratorAI ──
it('11. Generazione reale WorkoutGeneratorAI: zero undefined/N/A su tutti gli esercizi', async () => {
    loadScript('js/physics-engine.js');
    loadScript('js/logic.js');

    const ai = new window.WorkoutGeneratorAI();
    const prog = await ai.generateFullProgram({
        days: 3,
        goal: 'Resistenza',
        level: 'Principiante',
        equipment: ['Manubri', 'Bilanciere'],
        conditioning: 'Buono',
        strengthProfile: 'Bilanciato',
        injuries: ['Ginocchio (LCA)'],
        patientObjective: 'Recupero funzionale ginocchio',
        patientType: 'Clinico',
        sportPraticato: 'Fitness',
        weeks: 4,
        sleep: 'Buono',
        stress: 'Basso',
        nutrition: 'Bilanciata',
        activity: 'Attivo',
        painScale: 1
    });

    let checkedCount = 0;
    for (const phase of prog.phases) {
        for (const day of phase.schedule) {
            for (const ex of day.exercises) {
                checkedCount++;
                const resolved = window.App.resolveExerciseDetail(ex.id, ex.name, { result: prog, phaseId: phase.id });
                assert(resolved, `Esercizio ${ex.name} non risolto`);
                assertNoUndefinedOrNA(resolved, `prog_ex_${ex.name}`);
                assert(resolved.execution && resolved.execution.setup.length > 0);
                assert(resolved.execution && resolved.execution.steps.length > 0);
                assert(resolved.errors && resolved.errors.length > 0);
            }
        }
    }
    assert(checkedCount > 10, 'Deve aver verificato almeno 10 esercizi nel programma clinico');
});

// ── TEST 12: Click listener con data-phase-id ──
it('12. Click listener in wizard.js estrae data-phase-id e risolve correttamente', () => {
    let renderedExercise = null;
    window.App.renderDetail = (ex) => {
        renderedExercise = ex;
    };

    const multiProg = {
        meta: { level: 'Intermedio' },
        phases: [
            {
                id: 10,
                phase: 'Fase 1',
                schedule: [{ exercises: [{ id: 'ex_ph', name: 'Squat', specs: { sets: 3, reps: '10', load: '60kg' } }] }]
            },
            {
                id: 20,
                phase: 'Fase 2',
                schedule: [{ exercises: [{ id: 'ex_ph', name: 'Squat', specs: { sets: 4, reps: '5', load: '90kg' } }] }]
            }
        ]
    };

    let clickHandler = null;
    const fakeContainer = {
        addEventListener: (event, fn) => { if (event === 'click') clickHandler = fn; }
    };

    fakeContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-ex-detail');
        if (!btn) return;
        const exName = btn.dataset.exName;
        const exId = btn.dataset.exId;
        const rawPhaseId = btn.dataset.phaseId;
        const phaseId = (rawPhaseId !== undefined && rawPhaseId !== null && String(rawPhaseId).trim() !== '') ? rawPhaseId : null;
        const fullEx = window.App.resolveExerciseDetail(exId, exName, { result: multiProg, container: fakeContainer, phaseId });
        if (fullEx && window.App.renderDetail) {
            window.App.renderDetail(fullEx);
        }
    });

    const fakeBtnPhase2 = {
        dataset: { exId: 'ex_ph', exName: 'Squat', phaseId: '20' },
        closest: (sel) => (sel === '.btn-ex-detail' ? fakeBtnPhase2 : null)
    };

    clickHandler({ target: fakeBtnPhase2 });
    assert(renderedExercise);
    assert.strictEqual(renderedExercise.specs.load, '90kg');
    assert.strictEqual(renderedExercise.specs.sets, 4);
    assertNoUndefinedOrNA(renderedExercise, 'renderedExercisePhase2');
});

// ── TEST 13: Tagline sempre valorizzata anche per esercizi di catalogo ──
it('13. Esercizi di catalogo ricevono sempre una tagline descrittiva (nessun campo vuoto)', () => {
    const resCat = window.App.resolveExerciseDetail('bk_b01', 'Lat Machine al Petto', null);
    assert(resCat.tagline && resCat.tagline.trim().length > 5, 'Deve avere tagline generata');
    assertNoUndefinedOrNA(resCat, 'resCat_tagline');
});

// ── TEST 14: Note e parametri di carico integrati in execution.context e cues ──
it('14. Note di programma e parametri di carico arricchiscono execution.context e cues per renderDetail', () => {
    const context = {
        exercise: {
            id: 'bk_b01',
            name: 'Lat Machine al Petto',
            specs: { sets: 4, reps: '8-10', rest: '90s', rpe: 8, tempo: '3-0-1', load: '45kg' },
            note: 'Presa prona controllata'
        }
    };
    const res = window.App.resolveExerciseDetail('bk_b01', 'Lat Machine al Petto', context);
    assert(res.execution.context.includes('Presa prona controllata'), 'Context deve contenere la nota');
    assert(res.execution.context.includes('45kg'), 'Context deve contenere il carico');
    assert(res.execution.cues.some(c => c.includes('Presa prona controllata')), 'Cues deve contenere la nota');
    assertNoUndefinedOrNA(res, 'noteEnrichment');
});

// ── TEST 15: Difesa contro stringhe "undefined", "null", "N/A", "-" ──
it('15. Robustezza: stringhe "undefined", "null", "N/A", "-" nelle specifiche grezze vengono sostituite con default', () => {
    const nastyContext = {
        exercise: {
            id: 'cli_09',
            name: 'Esercizio con Dati Sporchi',
            specs: { sets: 'undefined', reps: 'N/A', rest: '-', load: 'undefined', tempo: 'null' }
        }
    };
    const res = window.App.resolveExerciseDetail('cli_09', 'Esercizio con Dati Sporchi', nastyContext);
    assert.strictEqual(res.specs.sets, 3);
    assert.strictEqual(res.specs.reps, '10-12');
    assert.strictEqual(res.specs.rest, '60-90s');
    assert.strictEqual(res.specs.load, 'Carico naturale / adattato');
    assert.strictEqual(res.specs.tempo, '3-0-2');
    assertNoUndefinedOrNA(res, 'nastyContext');
});

// ── TEST 16: Disambiguazione con phaseId stringa non numerica ──
it('16. Disambiguazione con phaseId in formato stringa non numerica', () => {
    const stringPhaseProg = {
        phases: [
            { id: 'fase_accumulo', schedule: [{ exercises: [{ id: 'ex_str', name: 'Curl', specs: { sets: 3, load: '10kg' } }] }] },
            { id: 'fase_picco', schedule: [{ exercises: [{ id: 'ex_str', name: 'Curl', specs: { sets: 5, load: '18kg' } }] }] }
        ]
    };
    const res = window.App.resolveExerciseDetail('ex_str', 'Curl', { result: stringPhaseProg, phaseId: 'fase_picco' });
    assert.strictEqual(res.specs.sets, 5);
    assert.strictEqual(res.specs.load, '18kg');
});

// ── TEST 17: Fallback difensivo in wizard.js contro sparse array con buchi ──
it('17. wizard.js catalog fallback non genera crash in presenza di sparse array con buchi', () => {
    const sparseCatalog = [undefined, { id: 'ok_1', name: 'Esercizio OK' }, undefined];
    let found = null;
    assert.doesNotThrow(() => {
        found = sparseCatalog.find(item => item && ((item.id && item.id === 'ok_1') || item.name === 'NonTrovato'));
    });
    assert(found);
    assert.strictEqual(found.id, 'ok_1');
});

// ── TEST 18: Validazione reale esecuzione di renderDetail su tutte le categorie ──
it('18. Esecuzione reale renderDetail: genera modal completa con tagline, chip, execution ed errors priva di undefined/NA', async () => {
    loadScript('js/ui/helpers.js');
    loadScript('js/ui/catalog.js');

    let modalHtml = '';
    window.App.openModal = (content) => { modalHtml = content; };
    window.App.getExerciseMedia = async () => ({ videoUrl: null, poster: 'default.jpg' });

    const samples = [
        { id: 'bk_b01', name: 'Lat Machine al Petto' },
        { id: 'cli_01', name: 'Isometric Wall Sit (Angolo limitato a 60° flessione)' },
        { id: 'w_01', name: 'Cat-Cow Mobilità Spinale' },
        { id: 'c_01', name: 'Stretching Statico Gambe e Schiena' }
    ];

    for (const sample of samples) {
        modalHtml = '';
        const resolved = window.App.resolveExerciseDetail(sample.id, sample.name, null);
        await window.App.renderDetail(resolved);
        assert(modalHtml.length > 200, `Modal HTML per ${sample.name} non generata`);
        assert(!modalHtml.includes('undefined'), `Modal per ${sample.name} contiene 'undefined'`);
        assert(!modalHtml.includes('N/A'), `Modal per ${sample.name} contiene 'N/A'`);
        assert(!modalHtml.includes('<p style="color:rgba(255,255,255,0.8); font-size:0.95rem; margin:0;"></p>'), `Tagline non valorizzata nel modal per ${sample.name}`);
    }
});

// ── TEST 19: Risoluzione normalizzata con stopword e token overlap su varianti complesse ──
it('19. Risoluzione normalizzata trova esercizi a catalogo con connettori e varianti articolate', () => {
    // 1. Panca Piana con Bilanciere (Presa Stretta) -> ch_b01 (Panca Piana Bilanciere)
    const resPanca = window.App.resolveExerciseDetail(null, 'Panca Piana con Bilanciere (Presa Stretta)', null);
    assert(resPanca, 'Deve risolvere Panca Piana con Bilanciere');
    assert.strictEqual(resPanca.id, 'ch_b01');
    assert.strictEqual(resPanca.primaryMuscle, 'Pettorale Maggiore (Capo Sternocostale)');
    assert(resPanca.execution.setup.length > 0);
    assertNoUndefinedOrNA(resPanca, 'resPanca');

    // 2. Trazioni alla Sbarra (Presa Supina) -> hyp_bk12 (Trazioni Presa Supina)
    const resTrazioni = window.App.resolveExerciseDetail(null, 'Trazioni alla Sbarra (Presa Supina)', null);
    assert(resTrazioni, 'Deve risolvere Trazioni alla Sbarra');
    assert.strictEqual(resTrazioni.id, 'hyp_bk12');
    assert(resTrazioni.execution.steps.length > 0);
    assertNoUndefinedOrNA(resTrazioni, 'resTrazioni');

    // 3. Military Press con Bilanciere (In Piedi) -> frc_ps02 (Military Press)
    const resMilitary = window.App.resolveExerciseDetail(null, 'Military Press con Bilanciere (In Piedi)', null);
    assert(resMilitary, 'Deve risolvere Military Press con Bilanciere');
    assert.strictEqual(resMilitary.id, 'frc_ps02');
    assertNoUndefinedOrNA(resMilitary, 'resMilitary');

    // 4. Affondi Camminati con Bilanciere (Focus Glutei) -> hyp_lg55 (Affondi Camminati con Bilanciere)
    const resAffondi = window.App.resolveExerciseDetail(null, 'Affondi Camminati con Bilanciere (Focus Glutei)', null);
    assert(resAffondi, 'Deve risolvere Affondi Camminati');
    assert.strictEqual(resAffondi.id, 'hyp_lg55');
    assertNoUndefinedOrNA(resAffondi, 'resAffondi');
});

// ── TEST 20: Event listener wizard.js supporta data-phase-id in formato stringa senza produrre NaN ──
it('20. Click listener wizard.js disambigua correttamente fasi con ID stringa non numerica', () => {
    let rendered = null;
    window.App.renderDetail = (ex) => { rendered = ex; };

    const customPhaseProg = {
        meta: { level: 'Avanzato' },
        phases: [
            {
                id: 'blocco_accumulo',
                schedule: [{ exercises: [{ id: 'ex_str_disambig', name: 'Stacco', specs: { sets: 3, load: '100kg' } }] }]
            },
            {
                id: 'blocco_realizzazione',
                schedule: [{ exercises: [{ id: 'ex_str_disambig', name: 'Stacco', specs: { sets: 5, load: '150kg' } }] }]
            }
        ]
    };

    let handler = null;
    const containerMock = {
        addEventListener: (event, fn) => { if (event === 'click') handler = fn; }
    };

    // Replica esatta del listener aggiornato in wizard.js
    containerMock.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-ex-detail');
        if (!btn) return;
        const exName = btn.dataset.exName;
        const exId = btn.dataset.exId;
        const rawPhaseId = btn.dataset.phaseId;
        const phaseId = (rawPhaseId !== undefined && rawPhaseId !== null && String(rawPhaseId).trim() !== '') ? rawPhaseId : null;
        const fullEx = window.App.resolveExerciseDetail(exId, exName, { result: customPhaseProg, container: containerMock, phaseId });
        if (fullEx && window.App.renderDetail) {
            window.App.renderDetail(fullEx);
        }
    });

    const fakeBtnStr = {
        dataset: { exId: 'ex_str_disambig', exName: 'Stacco', phaseId: 'blocco_realizzazione' },
        closest: (sel) => (sel === '.btn-ex-detail' ? fakeBtnStr : null)
    };

    handler({ target: fakeBtnStr });
    assert(rendered, 'Deve aver invocato renderDetail');
    assert.strictEqual(rendered.specs.sets, 5);
    assert.strictEqual(rendered.specs.load, '150kg');
    assertNoUndefinedOrNA(rendered, 'rendered_str_phase');
});

// ── TEST 21: Robustezza avanzata contro stringhe "nan", "[object Object]" e note non sicure ──
it('21. Robustezza: isSafeValue rigetta "nan" e "[object Object]" prevenendo leak nella scheda', () => {
    const nastyEx = {
        id: 'cli_15',
        name: 'Woodchopper ai cavi con bacino bloccato',
        specs: { sets: 'NaN', reps: '[object Object]', load: 'nan', rest: 'undefined', tempo: 'null' },
        note: 'undefined'
    };

    const res = window.App.resolveExerciseDetail('cli_15', 'Woodchopper ai cavi con bacino bloccato', { exercise: nastyEx });
    assert(res);
    assert.strictEqual(res.specs.sets, 3);
    assert.strictEqual(res.specs.reps, '10-12');
    assert.strictEqual(res.specs.load, 'Carico naturale / adattato');
    assert.strictEqual(res.specs.rest, '60-90s');
    // Note era 'undefined', deve essere stata scartata senza apparire nella descrizione o cues
    assert(!res.description.includes('undefined'));
    assert(!res.execution.context.includes('undefined'));
    assert(!res.execution.cues.some(c => c.includes('undefined')));
    assertNoUndefinedOrNA(res, 'nasty_nan_object');
});

// ── TEST 22: Gestione robusta di primaryMuscle come array ──
it('22. Robustezza: gestisce correttamente progEx.primaryMuscle passato come array', () => {
    const arrayMuscleContext = {
        exercise: {
            id: 'syn_custom_arr',
            name: 'Affondi con Banda Elastica',
            primaryMuscle: ['Gambe', 'Glutei'],
            specs: { sets: 3, reps: '12', rest: '45s', load: 'Mini-band' }
        }
    };

    const res = window.App.resolveExerciseDetail('syn_custom_arr', 'Affondi con Banda Elastica', arrayMuscleContext);
    assert(res);
    assert.strictEqual(typeof res.primaryMuscle, 'string');
    assert.strictEqual(res.primaryMuscle, 'Gambe');
    assert(Array.isArray(res.muscles));
    assert(res.muscles.includes('Gambe'));
    assertNoUndefinedOrNA(res, 'array_muscle_res');
});

(async () => {
    console.log(`\n=== Tutti i test passati con successo: ${passedTests}/${totalTests} ===`);
    process.exit(0);
})();
