const fs = require('fs');
const path = require('path');

// =========================================================================
// 1. Mock browser environment globals
// =========================================================================
global.window = {
    App: {
        getExercises: () => [
            { id: 'ex_squat', name: 'Squat con Bilanciere', type: 'Compound', primaryMuscle: 'Gambe', muscles: ['Gambe'], quality: 'Forza', equipment: 'Barbell', specs: { sets: 3, reps: '10', rest: '90s' } },
            { id: 'ex_curl', name: 'Curl Bicipiti', type: 'Isolation', primaryMuscle: 'Bicipiti', muscles: ['Bicipiti'], quality: 'Ipertrofia', equipment: 'Dumbbell', specs: { sets: 3, reps: '12', rest: '60s' } }
        ],
        getConditions: () => [
            { id: 'post_op_lca', name: 'Post-op LCA', category: 'post_chirurgiche', description: 'Ricostruzione crociato anteriore.' },
            { id: 'patellar_tendonitis', name: 'Tendinite Rotulea', category: 'tendinopatie', description: 'Infiammazione del tendine rotuleo.' }
        ],
        openModal: (content) => {
            global.lastModalContent = content;
        }
    },
    localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
    }
};

// Mock setTimeout to run synchronously
global.setTimeout = (cb, delay) => {
    cb();
    return 1;
};
global.clearTimeout = (id) => {};

// Mock document for loading ui.js
const gridInnerHTML = { value: '' };
const filterInnerHTML = { value: '' };
let inputListener = null;
let chipListeners = [];

const mockGridContainer = {
    get innerHTML() {
        return gridInnerHTML.value;
    },
    set innerHTML(val) {
        gridInnerHTML.value = val;
    },
    appendChild: (child) => {
        if (child.innerHTML) {
            gridInnerHTML.value += child.innerHTML;
        }
    }
};

const mockFilterContainer = {
    get innerHTML() {
        return filterInnerHTML.value;
    },
    set innerHTML(val) {
        filterInnerHTML.value = val;
    },
    querySelectorAll: (selector) => {
        if (selector === '.chip-filter') {
            return [
                {
                    getAttribute: (attr) => attr === 'data-category' ? 'Tutti' : 'Tutti',
                    style: {},
                    addEventListener: (event, cb) => {
                        chipListeners.push({ category: 'Tutti', callback: cb });
                    }
                }
            ];
        }
        return [];
    }
};

const mockSearchInput = {
    value: '',
    addEventListener: (event, cb) => {
        if (event === 'input') {
            inputListener = cb;
        }
    }
};

global.document = {
    getElementById: (id) => {
        if (id === 'filter-container') return mockFilterContainer;
        if (id === 'grid-container') return mockGridContainer;
        if (id === 'source-filter-search') return mockSearchInput;
        if (id === 'sources-counter') return { set innerHTML(val) {} };
        return null;
    },
    createElement: (tag) => {
        return {
            style: {},
            addEventListener: (event, cb) => {},
            set innerHTML(val) {
                this.innerHTMLValue = val;
            },
            get innerHTML() {
                return this.innerHTMLValue || '';
            }
        };
    },
    querySelectorAll: (selector) => []
};

// Load modules
const kbPath = path.join(__dirname, '..', 'js', 'knowledge-base.js');
const logicPath = path.join(__dirname, '..', 'js', 'logic.js');
const uiPath = path.join(__dirname, '..', 'js', 'ui.js');

const kbCode = fs.readFileSync(kbPath, 'utf8');
const logicCode = fs.readFileSync(logicPath, 'utf8');
const uiCode = fs.readFileSync(uiPath, 'utf8');

eval(kbCode);
eval(logicCode);
eval(uiCode);

const WorkoutGeneratorAI = global.window.WorkoutGeneratorAI;

console.log("=== Running Adversarial Challenger Test Suite ===\n");

function assert(condition, message) {
    if (!condition) {
        console.error("❌ Assertion Failed:", message);
        process.exit(1);
    }
    console.log("✅ Success:", message);
}