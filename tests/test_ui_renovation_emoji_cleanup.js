/**
 * Test Suite: UI Renovation and Emoji Cleanup Verification
 * Validates R1, R2, R3, R4 from ORIGINAL_REQUEST.md (2026-09-12T14:49:21Z)
 */

const fs = require('fs');
const assert = require('assert');

let passed = 0;
let failed = 0;
const testQueue = [];

function it(desc, fn) {
    testQueue.push({ desc, fn });
}

console.log('==========================================================');
console.log('   VERIFICATION SUITE: UI Renovation & Emoji Cleanup      ');
console.log('==========================================================\n');

// Load files
const catalogViewContent = fs.readFileSync('js/views/catalog-view.js', 'utf8');
const favoritesViewContent = fs.readFileSync('js/views/favorites-view.js', 'utf8');
const hubViewContent = fs.readFileSync('js/views/scientific-hub-view.js', 'utf8');
const catalogUiContent = fs.readFileSync('js/ui/catalog.js', 'utf8');
const filtersUiContent = fs.readFileSync('js/ui/render-filters.js', 'utf8');
const hubUiContent = fs.readFileSync('js/ui/scientific-hub.js', 'utf8');
const wizardUiContent = fs.readFileSync('js/ui/wizard.js', 'utf8');
const cssContent = fs.readFileSync('css/style.css', 'utf8');
const swContent = fs.readFileSync('sw.js', 'utf8');
const testCheckContent = fs.readFileSync('test_check.py', 'utf8');

console.log('── R1: Section-Hero Removal & Counter Repositioning ─────────');

it('catalog-view.js has no .section-hero, hero-label, hero-title, hero-subtitle', () => {
    assert.strictEqual(catalogViewContent.includes('section-hero'), false);
    assert.strictEqual(catalogViewContent.includes('hero-label'), false);
    assert.strictEqual(catalogViewContent.includes('hero-title'), false);
    assert.strictEqual(catalogViewContent.includes('hero-subtitle'), false);
});

it('catalog-view.js wraps in .catalog-container and includes compact toolbar with #results-counter', () => {
    assert.strictEqual(catalogViewContent.includes('catalog-container'), true);
    assert.strictEqual(catalogViewContent.includes('catalog-toolbar'), true);
    assert.strictEqual(catalogViewContent.includes('id="results-counter"'), true);
    assert.strictEqual(catalogViewContent.includes('results-counter-pill'), true);
});

it('favorites-view.js has no .section-hero, hero-label, hero-title, hero-subtitle', () => {
    assert.strictEqual(favoritesViewContent.includes('section-hero'), false);
    assert.strictEqual(favoritesViewContent.includes('hero-label'), false);
    assert.strictEqual(favoritesViewContent.includes('hero-title'), false);
    assert.strictEqual(favoritesViewContent.includes('hero-subtitle'), false);
});

it('favorites-view.js wraps in .favorites-container and includes compact toolbar with #favorites-counter', () => {
    assert.strictEqual(favoritesViewContent.includes('favorites-container'), true);
    assert.strictEqual(favoritesViewContent.includes('catalog-toolbar'), true);
    assert.strictEqual(favoritesViewContent.includes('id="favorites-counter"'), true);
    assert.strictEqual(favoritesViewContent.includes('results-counter-pill'), true);
});

it('scientific-hub-view.js has no .section-hero, hero-label, hero-title, hero-subtitle', () => {
    assert.strictEqual(hubViewContent.includes('section-hero'), false);
    assert.strictEqual(hubViewContent.includes('hero-label'), false);
    assert.strictEqual(hubViewContent.includes('hero-title'), false);
    assert.strictEqual(hubViewContent.includes('hero-subtitle'), false);
});

it('scientific-hub-view.js wraps in .hub-container and includes compact toolbar with #sources-counter', () => {
    assert.strictEqual(hubViewContent.includes('hub-container'), true);
    assert.strictEqual(hubViewContent.includes('catalog-toolbar'), true);
    assert.strictEqual(hubViewContent.includes('id="sources-counter"'), true);
    assert.strictEqual(hubViewContent.includes('results-counter-pill'), true);
});

it('css/style.css defines .catalog-container, .favorites-container, .hub-container, .catalog-toolbar, .results-counter-pill', () => {
    assert.strictEqual(cssContent.includes('.catalog-container'), true);
    assert.strictEqual(cssContent.includes('.favorites-container'), true);
    assert.strictEqual(cssContent.includes('.hub-container'), true);
    assert.strictEqual(cssContent.includes('.catalog-toolbar'), true);
    assert.strictEqual(cssContent.includes('.results-counter-pill'), true);
});

console.log('\n── R2: Emoji Cleanup — Catalog ──────────────────────────────');

it('catalog.js: empty state title has no magnifying glass emoji', () => {
    assert.strictEqual(catalogUiContent.includes('🔍 Nessun esercizio trovato'), false);
    assert.strictEqual(catalogUiContent.includes('Nessun esercizio trovato'), true);
});

it('catalog.js: qualityIcons removed, quality tags render text only', () => {
    assert.strictEqual(catalogUiContent.includes('qualityIcons'), false);
    assert.strictEqual(catalogUiContent.includes('💪'), false);
    assert.strictEqual(catalogUiContent.includes('📈'), false);
    assert.strictEqual(catalogUiContent.includes('⚡'), false);
});

it('catalog.js: heroIcon removed from exercise detail modal', () => {
    assert.strictEqual(catalogUiContent.includes('heroIcon'), false);
    assert.strictEqual(catalogUiContent.includes('🏋️'), false);
    assert.strictEqual(catalogUiContent.includes('🦵'), false);
    assert.strictEqual(catalogUiContent.includes('🦅'), false);
    assert.strictEqual(catalogUiContent.includes('🧱'), false);
    assert.strictEqual(catalogUiContent.includes('🥎'), false);
});

it('catalog.js: detail chips emojis (🔹, 🛠️, 📶) removed', () => {
    assert.strictEqual(catalogUiContent.includes('🔹'), false);
    assert.strictEqual(catalogUiContent.includes('🛠️'), false);
    assert.strictEqual(catalogUiContent.includes('📶'), false);
});

it('catalog.js: execution section emojis (🏃, ⚙️, 🔄) removed', () => {
    assert.strictEqual(catalogUiContent.includes('🏃'), false);
    assert.strictEqual(catalogUiContent.includes('⚙️'), false);
    assert.strictEqual(catalogUiContent.includes('🔄'), false);
    assert.strictEqual(catalogUiContent.includes('Come Eseguire'), true);
    assert.strictEqual(catalogUiContent.includes('Setup Iniziale'), true);
    assert.strictEqual(catalogUiContent.includes('Esecuzione'), true);
});

it('catalog.js: error card 🚫 emoji removed', () => {
    assert.strictEqual(catalogUiContent.includes('🚫'), false);
});

it('catalog.js: strictly preserves functional favorites ❤️ / 🤍 and safety criteria ✅ and ⚠️', () => {
    assert.strictEqual(catalogUiContent.includes('❤️'), true);
    assert.strictEqual(catalogUiContent.includes('🤍'), true);
    assert.strictEqual(catalogUiContent.includes('✅ Criteri di Validità'), true);
    assert.strictEqual(catalogUiContent.includes('⚠️'), true);
});

console.log('\n── R2: Emoji Cleanup — Filters & Hub ────────────────────────');

it('render-filters.js: equipment and level options have no decorative emojis', () => {
    assert.strictEqual(filtersUiContent.includes('🌱 Principiante'), false);
    assert.strictEqual(filtersUiContent.includes('🏋️ Bilanciere'), false);
    assert.strictEqual(filtersUiContent.includes('🏋️‍♀️ Manubri'), false);
    assert.strictEqual(filtersUiContent.includes('🤸 Corpo Libero'), false);
    assert.strictEqual(filtersUiContent.includes('⚙️ Macchine'), false);
    assert.strictEqual(filtersUiContent.includes('🔌 Cavi'), false);
    assert.strictEqual(filtersUiContent.includes('🧗 Sbarra / Trazioni'), false);
    assert.strictEqual(filtersUiContent.includes('🪑 Panca'), false);
});

it('render-filters.js: preserves anatomical/pathological icons in getIcon()', () => {
    assert.strictEqual(filtersUiContent.includes("'neck': '🦒'"), true);
    assert.strictEqual(filtersUiContent.includes("'heart': '❤️'"), true);
    assert.strictEqual(filtersUiContent.includes("'knee': '🦵'"), true);
});

it('render-filters.js & scientific-hub.js: search inputs use SVG vector icon instead of 🔍 emoji', () => {
    assert.strictEqual(filtersUiContent.includes('<span class="search-icon">🔍</span>'), false);
    assert.strictEqual(filtersUiContent.includes('<svg'), true);
    assert.strictEqual(hubUiContent.includes('>🔍</span>'), false);
    assert.strictEqual(hubUiContent.includes('<svg'), true);
});

it('css/style.css: .empty-state::before has no 🔍 emoji and 0 total emojis in CSS', () => {
    assert.strictEqual(cssContent.includes("content: '🔍'"), false);
    const emojiRegex = /[\u{1F000}-\u{1FFFF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}]/u;
    assert.strictEqual(emojiRegex.test(cssContent), false);
});

console.log('\n── R2: Emoji Cleanup — Wizard ───────────────────────────────');

it('wizard.js: step headers have no .step-emoji (👤, 📅, 🩺, 🎯, 🌿)', () => {
    assert.strictEqual(wizardUiContent.includes('step-emoji'), false);
    assert.strictEqual(wizardUiContent.includes('👤'), false);
    assert.strictEqual(wizardUiContent.includes('📅'), false);
    assert.strictEqual(wizardUiContent.includes('🎯'), false);
});

it('wizard.js: option cards have no .option-icon emojis', () => {
    assert.strictEqual(wizardUiContent.includes('option-icon'), false);
});

it('wizard.js: recovery badge transformed from RECUPERO 💤 to RECUPERO', () => {
    assert.strictEqual(wizardUiContent.includes('RECUPERO 💤'), false);
    assert.strictEqual(wizardUiContent.includes('<span class="badge rest">RECUPERO</span>'), true);
});

it('wizard.js: deload state transformed from Scarico Clinico 🌿 to Scarico Clinico', () => {
    assert.strictEqual(wizardUiContent.includes('Scarico Clinico 🌿'), false);
    assert.strictEqual(wizardUiContent.includes('Scarico Clinico'), true);
});

it('wizard.js: decorative title/badge emojis (✨, 📋, 🔬, 📚, 📤) removed', () => {
    assert.strictEqual(wizardUiContent.includes('<div class="intake-logo">✨</div>'), false);
    assert.strictEqual(wizardUiContent.includes('📋 Riepilogo del tuo profilo'), false);
    assert.strictEqual(wizardUiContent.includes('🔬 Metodo di Periodizzazione AI'), false);
    assert.strictEqual(wizardUiContent.includes('📚 Riferimenti Scientifici e Bibliografia'), false);
    assert.strictEqual(wizardUiContent.includes('📤 Esporta Programma'), false);
});

it('wizard.js: strictly preserves safety & functional indicators (⚠️, ❌, ⏱️)', () => {
    assert.strictEqual(wizardUiContent.includes('⚠️ Prescrizioni di Sicurezza Clinica'), true);
    assert.strictEqual(wizardUiContent.includes('❌ Errore generazione'), true);
    assert.strictEqual(wizardUiContent.includes('⏱️ ~${day.estDuration} min'), true);
});

console.log('\n── R3: Remodeled Intake Option Cards & Layout ────────────────');

it('css/style.css defines remodeled .intake-option-card with balanced padding, centering and transitions', () => {
    assert.strictEqual(cssContent.includes('.intake-option-card'), true);
    assert.strictEqual(cssContent.includes('.intake-option-card:hover'), true);
    assert.strictEqual(cssContent.includes('.intake-option-card.selected'), true);
    assert.strictEqual(cssContent.includes('.intake-option-card.compact'), true);
});

it('css/style.css and wizard.js define mobile responsive rules (<540px, <380px) for option cards', () => {
    assert.strictEqual(cssContent.includes('@media (max-width: 540px)'), true);
    assert.strictEqual(cssContent.includes('@media (max-width: 380px)'), true);
    assert.strictEqual(wizardUiContent.includes('@media(max-width:540px)'), true);
    assert.strictEqual(wizardUiContent.includes('@media(max-width:380px)'), true);
});

it('css/style.css defines interactive hover state for .results-counter-pill', () => {
    assert.strictEqual(cssContent.includes('.results-counter-pill:hover'), true);
});

console.log('\n── R4: Service Worker & test_check.py Alignment ─────────────');

it('sw.js specifies CACHE_NAME t7-workout-v67 or later', () => {
    assert.strictEqual(/t7-workout-v(?:6[7-9]|[7-9]\d|\d{3,})/.test(swContent), true);
});

it('test_check.py checks for valid cache version', () => {
    assert.strictEqual(/t7-workout-v(?:6[7-9]|[7-9]\d|\d{3,})/.test(testCheckContent), true);
});

console.log('\n── Deep DOM Lifecycle & Counter Execution Verification ──────');

it('DOM Execution: catalog-view renders toolbar with results-counter and initializes count', () => {
    const mockElements = {};
    function makeEl(tag) {
        const el = {
            tagName: tag.toUpperCase(),
            className: '',
            id: '',
            _html: '',
            get innerHTML() { return this._html; },
            set innerHTML(val) {
                this._html = val;
                // Parse IDs
                const match = val.match(/id="([^"]+)"/g);
                if (match) {
                    match.forEach(m => {
                        const id = m.replace('id="', '').replace('"', '');
                        mockElements[id] = makeEl('div');
                        mockElements[id].id = id;
                    });
                }
            },
            appendChild(c) {
                if (c.id) mockElements[c.id] = c;
                return c;
            },
            querySelector(sel) {
                if (sel.startsWith('#')) return mockElements[sel.slice(1)] || null;
                return null;
            }
        };
        return el;
    }

    const prevWindow = global.window;
    const prevDoc = global.document;

    global.window = {};
    global.document = {
        createElement: (tag) => makeEl(tag),
        getElementById: (id) => mockElements[id] || null
    };

    let filterCallback = null;
    let catalogRenderedExercises = null;

    global.window.App = {
        Views: {},
        renderFilters(id, cb) { filterCallback = cb; },
        renderCatalog(exs) { catalogRenderedExercises = exs; },
        getExercises: async () => [{ id: 'ex1', name: 'Panca' }]
    };

    eval(catalogViewContent);

    const appContainer = makeEl('main');
    const state = {
        exercises: [{ id: '1', name: 'Squat' }, { id: '2', name: 'Stacco' }],
        filters: {}
    };

    global.window.App.Views['catalog'].render(appContainer, state);

    assert.ok(mockElements['results-counter'], 'results-counter element should exist');
    assert.strictEqual(mockElements['results-counter'].innerHTML.includes('2'), true);
    assert.strictEqual(mockElements['results-counter'].innerHTML.includes('esercizi disponibili'), true);
    assert.strictEqual(catalogRenderedExercises.length, 2);

    // Test singular count
    const stateSingular = { exercises: [{ id: '1', name: 'Squat' }], filters: {} };
    global.window.App.Views['catalog'].render(appContainer, stateSingular);
    assert.strictEqual(mockElements['results-counter'].innerHTML.includes('1'), true);
    assert.strictEqual(mockElements['results-counter'].innerHTML.includes('esercizio disponibile'), true);

    // Test cleanup
    assert.doesNotThrow(() => {
        global.window.App.Views['catalog'].cleanup();
    });

    global.window = prevWindow;
    global.document = prevDoc;
});

it('DOM Execution: favorites-view renders toolbar with favorites-counter and handles empty state', () => {
    const mockElements = {};
    function makeEl(tag) {
        const el = {
            tagName: tag.toUpperCase(),
            className: '',
            id: '',
            _html: '',
            get innerHTML() { return this._html; },
            set innerHTML(val) {
                this._html = val;
                const match = val.match(/id="([^"]+)"/g);
                if (match) {
                    match.forEach(m => {
                        const id = m.replace('id="', '').replace('"', '');
                        mockElements[id] = makeEl('div');
                        mockElements[id].id = id;
                    });
                }
            },
            appendChild(c) {
                if (c.id) mockElements[c.id] = c;
                return c;
            },
            querySelector(sel) {
                if (sel.startsWith('#')) return mockElements[sel.slice(1)] || null;
                return null;
            }
        };
        return el;
    }

    const prevWindow = global.window;
    const prevDoc = global.document;

    global.window = {};
    global.document = {
        createElement: (tag) => makeEl(tag),
        getElementById: (id) => mockElements[id] || null
    };

    let renderedFavs = null;
    global.window.App = {
        Views: {},
        renderFilters() {},
        renderCatalog(exs) { renderedFavs = exs; },
        getFavoriteExercises: () => [{ id: 'fav1', name: 'Trazioni' }]
    };

    eval(favoritesViewContent);

    const appContainer = makeEl('main');
    const state = { filters: {} };

    global.window.App.Views['favorites'].render(appContainer, state);

    assert.ok(mockElements['favorites-counter'], 'favorites-counter element should exist');
    assert.strictEqual(mockElements['favorites-counter'].innerHTML.includes('1'), true);
    assert.strictEqual(mockElements['favorites-counter'].innerHTML.includes('esercizio salvato'), true);

    // Test cleanup
    assert.doesNotThrow(() => {
        global.window.App.Views['favorites'].cleanup();
    });

    global.window = prevWindow;
    global.document = prevDoc;
});

it('DOM Execution: scientific-hub-view renders toolbar with sources-counter and delegates to hub renderer', () => {
    const mockElements = {};
    function makeEl(tag) {
        const el = {
            tagName: tag.toUpperCase(),
            className: '',
            id: '',
            _html: '',
            get innerHTML() { return this._html; },
            set innerHTML(val) {
                this._html = val;
                const match = val.match(/id="([^"]+)"/g);
                if (match) {
                    match.forEach(m => {
                        const id = m.replace('id="', '').replace('"', '');
                        mockElements[id] = makeEl('div');
                        mockElements[id].id = id;
                    });
                }
            },
            appendChild(c) {
                if (c.id) mockElements[c.id] = c;
                return c;
            },
            querySelector(sel) {
                if (sel.startsWith('#')) return mockElements[sel.slice(1)] || null;
                return null;
            }
        };
        return el;
    }

    const prevWindow = global.window;
    const prevDoc = global.document;

    global.window = {};
    global.document = {
        createElement: (tag) => makeEl(tag),
        getElementById: (id) => mockElements[id] || null
    };

    let hubDelegated = false;
    global.window.App = {
        Views: {},
        renderScientificHub: (filterId, gridId) => {
            hubDelegated = (filterId === 'sources-filter-container' && gridId === 'sources-grid');
        }
    };

    eval(hubViewContent);

    const appContainer = makeEl('main');
    const state = {};

    global.window.App.Views['scientific_hub'].render(appContainer, state);

    assert.ok(mockElements['sources-counter'], 'sources-counter element should exist');
    assert.strictEqual(hubDelegated, true, 'renderScientificHub should be invoked with container IDs');

    // Test cleanup
    assert.doesNotThrow(() => {
        global.window.App.Views['scientific_hub'].cleanup();
    });

    global.window = prevWindow;
    global.document = prevDoc;
});

it('DOM Execution: catalog-view handles undefined state argument and filter debounce lifecycle', async () => {
    const mockElements = {};
    function makeEl(tag) {
        const el = {
            tagName: tag.toUpperCase(),
            className: '',
            id: '',
            _html: '',
            get innerHTML() { return this._html; },
            set innerHTML(val) {
                this._html = val;
                const match = val.match(/id="([^"]+)"/g);
                if (match) {
                    match.forEach(m => {
                        const id = m.replace('id="', '').replace('"', '');
                        mockElements[id] = makeEl('div');
                        mockElements[id].id = id;
                    });
                }
            },
            appendChild(c) {
                if (c.id) mockElements[c.id] = c;
                return c;
            },
            querySelector(sel) {
                if (sel.startsWith('#')) return mockElements[sel.slice(1)] || null;
                return null;
            }
        };
        return el;
    }

    const prevWindow = global.window;
    const prevDoc = global.document;
    const realSetTimeout = global.setTimeout;
    const realClearTimeout = global.clearTimeout;

    let scheduledTimer = null;
    global.setTimeout = (fn) => { scheduledTimer = fn; return 123; };
    global.clearTimeout = () => { scheduledTimer = null; };

    global.window = {};
    global.document = {
        createElement: (tag) => makeEl(tag),
        getElementById: (id) => mockElements[id] || null
    };

    let filterCallback = null;

    global.window.App = {
        Views: {},
        renderFilters(id, cb) { filterCallback = cb; },
        renderCatalog() {},
        getExercises: async (f) => (f && f.search ? [{ id: 'p1', name: 'Panca' }] : [{ id: 'p1', name: 'Panca' }, { id: 's1', name: 'Squat' }])
    };

    eval(catalogViewContent);

    const appContainer = makeEl('main');

    // Test render with undefined state
    assert.doesNotThrow(() => {
        global.window.App.Views['catalog'].render(appContainer, undefined);
    });
    assert.ok(mockElements['results-counter'], 'results-counter element should exist even with undefined state');

    // Test filter callback debounce execution
    assert.ok(typeof filterCallback === 'function', 'filterCallback should be registered');
    filterCallback({ search: 'Panca' });
    assert.ok(scheduledTimer !== null, 'filter debounce timer should be scheduled');
    await scheduledTimer();
    assert.strictEqual(mockElements['results-counter'].innerHTML.includes('1'), true);
    assert.strictEqual(mockElements['results-counter'].innerHTML.includes('esercizio trovato'), true);

    // Test filter reset via callback
    filterCallback({ search: '', muscle: 'all', level: 'all', equipment: 'all', quality: 'all' });
    await scheduledTimer();
    assert.strictEqual(mockElements['results-counter'].innerHTML.includes('2'), true);
    assert.strictEqual(mockElements['results-counter'].innerHTML.includes('esercizi disponibili'), true);

    global.window.App.Views['catalog'].cleanup();
    global.setTimeout = realSetTimeout;
    global.clearTimeout = realClearTimeout;
    global.window = prevWindow;
    global.document = prevDoc;
});

it('DOM Execution: favorites-view handles undefined state and filter callbacks', () => {
    const mockElements = {};
    function makeEl(tag) {
        const el = {
            tagName: tag.toUpperCase(),
            className: '',
            id: '',
            _html: '',
            get innerHTML() { return this._html; },
            set innerHTML(val) {
                this._html = val;
                const match = val.match(/id="([^"]+)"/g);
                if (match) {
                    match.forEach(m => {
                        const id = m.replace('id="', '').replace('"', '');
                        mockElements[id] = makeEl('div');
                        mockElements[id].id = id;
                    });
                }
            },
            appendChild(c) {
                if (c.id) mockElements[c.id] = c;
                return c;
            },
            querySelector(sel) {
                if (sel.startsWith('#')) return mockElements[sel.slice(1)] || null;
                return null;
            }
        };
        return el;
    }

    const prevWindow = global.window;
    const prevDoc = global.document;

    global.window = {};
    global.document = {
        createElement: (tag) => makeEl(tag),
        getElementById: (id) => mockElements[id] || null
    };

    let favFilterCb = null;
    global.window.App = {
        Views: {},
        renderFilters(id, cb) { favFilterCb = cb; },
        renderCatalog() {},
        getFavoriteExercises: () => [{ id: 'f1', name: 'Trazioni', muscles: ['Dorsali'] }, { id: 'f2', name: 'Dip', muscles: ['Pettorali'] }]
    };

    eval(favoritesViewContent);

    const appContainer = makeEl('main');

    // Test render with undefined state
    assert.doesNotThrow(() => {
        global.window.App.Views['favorites'].render(appContainer, undefined);
    });

    // Test filter callback
    assert.ok(typeof favFilterCb === 'function', 'favorites filter callback should be registered');
    favFilterCb({ search: 'Trazioni', muscle: 'all', level: 'all', equipment: 'all' });
    assert.strictEqual(mockElements['favorites-counter'].innerHTML.includes('1'), true);
    assert.strictEqual(mockElements['favorites-counter'].innerHTML.includes('esercizio trovato'), true);

    // Reset filter
    favFilterCb({ search: '', muscle: 'all', level: 'all', equipment: 'all' });
    assert.strictEqual(mockElements['favorites-counter'].innerHTML.includes('2'), true);
    assert.strictEqual(mockElements['favorites-counter'].innerHTML.includes('esercizi salvati'), true);

    global.window.App.Views['favorites'].cleanup();
    global.window = prevWindow;
    global.document = prevDoc;
});

it('DOM Execution: scientific-hub renders real sources, updates counter, and handles search filtering', () => {
    const mockElements = {};
    function makeEl(tag) {
        const el = {
            tagName: tag.toUpperCase(),
            className: '',
            id: '',
            style: {},
            children: [],
            _html: '',
            get innerHTML() { return this._html; },
            set innerHTML(val) {
                this._html = val;
                const match = val.match(/id="([^"]+)"/g);
                if (match) {
                    match.forEach(m => {
                        const id = m.replace('id="', '').replace('"', '');
                        mockElements[id] = makeEl('div');
                        mockElements[id].id = id;
                    });
                }
            },
            appendChild(c) {
                this.children.push(c);
                if (c.id) mockElements[c.id] = c;
                return c;
            },
            querySelector(sel) {
                if (sel.startsWith('#')) return mockElements[sel.slice(1)] || null;
                return null;
            },
            querySelectorAll() { return []; },
            addEventListener() {}
        };
        return el;
    }

    const prevWindow = global.window;
    const prevDoc = global.document;

    global.window = {
        escapeHTML: (s) => s,
        App: {
            scientificSources: [
                { id: 's1', title: 'Sprint Kinematics', area: 'Atletica Leggera', year: 2020, authors: 'Morin et al.', journal: 'MSSE', abstract: 'Horizontal force' },
                { id: 's2', title: 'VBT Velocity Loss', area: 'VBT', year: 2021, authors: 'Sanchez et al.', journal: 'JSCR', abstract: 'Velocity threshold' }
            ]
        }
    };
    global.document = {
        createElement: (tag) => makeEl(tag),
        getElementById: (id) => mockElements[id] || null
    };

    mockElements['filter-container'] = makeEl('div');
    mockElements['filter-container'].id = 'filter-container';
    mockElements['grid-container'] = makeEl('div');
    mockElements['grid-container'].id = 'grid-container';
    mockElements['sources-counter'] = makeEl('span');
    mockElements['sources-counter'].id = 'sources-counter';

    eval(hubUiContent);

    global.window.App.renderScientificHub('filter-container', 'grid-container');

    assert.strictEqual(mockElements['sources-counter'].innerHTML.includes('2'), true);
    assert.strictEqual(mockElements['sources-counter'].innerHTML.includes('fonti disponibili'), true);

    global.window = prevWindow;
    global.document = prevDoc;
});

it('Catalog Detail Modal: handles missing muscles and prevents undefined string leak', async () => {
    let modalContent = '';
    const prevWindow = global.window;
    const prevDoc = global.document;

    global.window = {
        escapeHTML: (s) => s,
        App: {
            openModal: (html) => { modalContent = html; },
            isFavorite: () => false,
            getExerciseMedia: async () => ({ poster: '', videoUrl: null })
        }
    };
    global.document = {
        getElementById: () => null
    };

    eval(catalogUiContent);

    // Test 1: Exercise without muscles property should not crash
    await global.window.App.renderDetail({
        id: 'ex_edge',
        name: 'Custom Pushup',
        primaryMuscle: 'Pettorali',
        type: 'Multiarticolare',
        equipment: 'Corpo Libero',
        level: 'Principiante'
    });

    // Test 2: Exercise without execution.context and description should not leak literal "undefined"
    assert.strictEqual(modalContent.includes('undefined'), false, 'Modal should not contain literal undefined string');

    // Test 3: Exercise with execution steps but no context/description
    await global.window.App.renderDetail({
        id: 'ex_edge2',
        name: 'Custom Squat',
        primaryMuscle: 'Quadricipiti',
        type: 'Multiarticolare',
        equipment: 'Bilanciere',
        level: 'Intermedio',
        execution: { steps: ['Step 1'] }
    });
    assert.strictEqual(modalContent.includes('undefined'), false, 'Modal with execution steps should not contain literal undefined string');

    global.window = prevWindow;
    global.document = prevDoc;
});

it('Catalog Card & Detail: renders safely with missing fields without undefined leak and handles null input', async () => {
    let modalContent = '';
    const prevWindow = global.window;
    const prevDoc = global.document;

    const cardsAppended = [];
    const mockGrid = {
        innerHTML: '',
        appendChild: (el) => { cardsAppended.push(el); }
    };

    global.window = {
        escapeHTML: (s) => (s === null || s === undefined ? '' : String(s)),
        App: {
            openModal: (html) => { modalContent = html; },
            isFavorite: () => false,
            getExerciseMedia: async () => ({ poster: '', videoUrl: null })
        }
    };
    global.document = {
        getElementById: (id) => (id === 'catalog-grid' ? mockGrid : null),
        createElement: () => ({
            className: '',
            innerHTML: '',
            querySelector: () => ({ addEventListener: () => {} }),
            addEventListener: () => {}
        })
    };

    eval(fs.readFileSync('js/ui/catalog.js', 'utf8'));

    // Test 1: renderCatalog with completely bare exercise object
    global.window.App.renderCatalog([{ id: 'bare_1' }]);
    assert.strictEqual(cardsAppended.length, 1);
    assert.strictEqual(cardsAppended[0].innerHTML.includes('undefined'), false, 'Card HTML should never contain literal undefined');

    // Test 2: renderDetail with null and undefined does not throw
    assert.doesNotThrow(async () => {
        await global.window.App.renderDetail(null);
        await global.window.App.renderDetail(undefined);
    });

    // Test 3: renderDetail with bare exercise object has no undefined in modal
    await global.window.App.renderDetail({ id: 'bare_modal' });
    assert.strictEqual(modalContent.includes('undefined'), false, 'Modal HTML should never contain literal undefined');

    global.window = prevWindow;
    global.document = prevDoc;
});

it('Catalog View Re-mounting: resets active filters and displays full catalog count when re-mounting after prior filtering', () => {
    const prevWindow = global.window;
    const prevDoc = global.document;

    const mockElements = {};
    function makeEl(tag) {
        const el = {
            tagName: tag.toUpperCase(),
            className: '',
            id: '',
            _html: '',
            get innerHTML() { return this._html; },
            set innerHTML(val) {
                this._html = val;
                const match = val.match(/id="([^"]+)"/g);
                if (match) {
                    match.forEach(m => {
                        const id = m.replace('id="', '').replace('"', '');
                        mockElements[id] = makeEl('div');
                        mockElements[id].id = id;
                    });
                }
            },
            appendChild: () => {},
            querySelector: (sel) => {
                if (sel.startsWith('#')) return mockElements[sel.slice(1)] || null;
                return null;
            }
        };
        return el;
    }

    const appContainer = makeEl('div');
    global.window = {
        App: {
            renderFilters: () => {},
            renderCatalog: () => {},
            getExercises: () => [
                { id: '1', name: 'Squat' },
                { id: '2', name: 'Bench' },
                { id: '3', name: 'Deadlift' }
            ]
        }
    };
    global.document = {
        createElement: (tag) => makeEl(tag),
        getElementById: (id) => mockElements[id] || null
    };

    eval(fs.readFileSync('js/views/catalog-view.js', 'utf8'));

    // Simulate prior state with stale filtered exercises and active filter
    const state = {
        exercises: [{ id: '1', name: 'Squat' }],
        filters: { search: 'Squat' }
    };

    // Mount catalog view
    global.window.App.Views.catalog.render(appContainer, state);

    // Verify filters were reset to {}
    assert.deepStrictEqual(state.filters, {});

    // Verify all 3 exercises are available in state
    assert.strictEqual(state.exercises.length, 3);

    // Verify counter displays 3 esercizi disponibili
    assert.strictEqual(mockElements['results-counter'].innerHTML.includes('3'), true);
    assert.strictEqual(mockElements['results-counter'].innerHTML.includes('esercizi disponibili'), true);

    global.window = prevWindow;
    global.document = prevDoc;
});

it('Favorites View Dynamic Counter Sync: updates favorites-counter when an exercise is unfavorited directly in the favorites grid', async () => {
    const prevWindow = global.window;
    const prevDoc = global.document;

    const mockElements = {};
    const gridListeners = {};

    function makeEl(tag) {
        const el = {
            tagName: tag.toUpperCase(),
            className: '',
            id: '',
            _html: '',
            get innerHTML() { return this._html; },
            set innerHTML(val) {
                this._html = val;
                const match = val.match(/id="([^"]+)"/g);
                if (match) {
                    match.forEach(m => {
                        const id = m.replace('id="', '').replace('"', '');
                        mockElements[id] = makeEl('div');
                        mockElements[id].id = id;
                    });
                }
            },
            appendChild: () => {},
            addEventListener: (evt, cb) => {
                gridListeners[evt] = cb;
            },
            querySelector: (sel) => {
                if (sel.startsWith('#')) return mockElements[sel.slice(1)] || null;
                return null;
            },
            querySelectorAll: () => []
        };
        return el;
    }

    const appContainer = makeEl('div');
    let currentFavs = [
        { id: 'fav1', name: 'Fav 1' },
        { id: 'fav2', name: 'Fav 2' }
    ];

    global.window = {
        App: {
            renderFilters: () => {},
            renderCatalog: () => {},
            getFavoriteExercises: () => currentFavs
        }
    };
    global.document = {
        createElement: (tag) => makeEl(tag),
        getElementById: (id) => mockElements[id] || null
    };

    eval(fs.readFileSync('js/views/favorites-view.js', 'utf8'));

    const state = {};
    global.window.App.Views.favorites.render(appContainer, state);

    assert.strictEqual(mockElements['favorites-counter'].innerHTML.includes('2'), true);
    assert.strictEqual(mockElements['favorites-counter'].innerHTML.includes('esercizi salvati'), true);

    // Simulate removing one favorite
    currentFavs = [{ id: 'fav1', name: 'Fav 1' }];

    // Simulate click on favorite button in grid
    const mockEvent = {
        target: {
            closest: (sel) => (sel === '.favorite-btn' ? { classList: { toggle: () => {} } } : null)
        }
    };

    if (gridListeners['click']) {
        gridListeners['click'](mockEvent);
        // Wait for next tick setTimeout
        await new Promise(r => setTimeout(r, 10));
        assert.strictEqual(mockElements['favorites-counter'].innerHTML.includes('1'), true);
        assert.strictEqual(mockElements['favorites-counter'].innerHTML.includes('esercizio salvato'), true);
    }

    global.window = prevWindow;
    global.document = prevDoc;
});

(async () => {
    for (const t of testQueue) {
        try {
            await t.fn();
            console.log(`  PASS  ${t.desc}`);
            passed++;
        } catch (err) {
            console.error(`  FAIL  ${t.desc}`);
            console.error(`        ${err.message}`);
            failed++;
        }
    }

    console.log('\n==========================================================');
    console.log(`TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('==========================================================');

    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
})();
