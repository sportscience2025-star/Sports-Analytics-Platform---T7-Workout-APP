const fs = require('fs');
const path = require('path');

console.log("=== ADVERSARIAL & EXTREME INPUTS VALIDATION SUITE ===");

// 1. Mock Browser Environment
global.localStorage = {
    getItem: (key) => null,
    setItem: (key, val) => {},
    removeItem: (key) => {},
    clear: () => {}
};
global.sessionStorage = {
    getItem: (key) => null,
    setItem: (key, val) => {},
    removeItem: (key) => {},
    clear: () => {}
};

const listeners = {};
const children = [];

const mockElements = {
    'filter-container': {
        innerHTML: '',
        querySelectorAll: (selector) => {
            if (selector === '.chip-filter') {
                return [
                    { getAttribute: () => 'Tutti', style: {}, addEventListener: (event, fn) => { listeners['click_Tutti'] = fn; } },
                    { getAttribute: () => 'Biomeccanica', style: {}, addEventListener: (event, fn) => { listeners['click_Biomeccanica'] = fn; } },
                    { getAttribute: () => 'Fisiologia', style: {}, addEventListener: (event, fn) => { listeners['click_Fisiologia'] = fn; } },
                    { getAttribute: () => 'VBT', style: {}, addEventListener: (event, fn) => { listeners['click_VBT'] = fn; } },
                    { getAttribute: () => 'Clinico', style: {}, addEventListener: (event, fn) => { listeners['click_Clinico'] = fn; } }
                ];
            }
            return [];
        }
    },
    'grid-container': {
        innerHTML: '',
        appendChild: (child) => {
            children.push(child);
        }
    },
    'source-filter-search': {
        value: '',
        addEventListener: (event, fn) => {
            listeners['input_search'] = fn;
        }
    },
    'sources-counter': {
        innerHTML: ''
    }
};

global.window = {};
global.document = {
    getElementById: (id) => {
        return mockElements[id] || null;
    },
    createElement: (tag) => {
        return {
            style: {},
            addEventListener: (event, fn) => {}
        };
    }
};

// 2. Load knowledge-base.js and ui.js
const kbPath = path.join(__dirname, '..', 'js', 'knowledge-base.js');
const uiPath = path.join(__dirname, '..', 'js', 'ui.js');

if (!fs.existsSync(kbPath) || !fs.existsSync(uiPath)) {
    console.error("❌ Required js files not found!");
    process.exit(1);
}