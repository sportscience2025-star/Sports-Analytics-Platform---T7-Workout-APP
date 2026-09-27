/**
 * js/knowledge-base.js
 * Backward Compatibility Facade & Orchestrator for Scientific Knowledge Base.
 * In Node.js test environments, delegates loading to js/data/sources/index.js.
 * In browser environments, ensures window.ScientificKnowledgeBase is bound.
 */
(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);
    root.App = root.App || {};

    // In Node.js / test runner environments, dynamically load the modular sources aggregator
    if (typeof require !== 'undefined') {
        const fs = require('fs');
        const path = require('path');
        const baseDir = typeof __dirname !== 'undefined' ? __dirname : '.';
        const candidates = [
            path.join(baseDir, 'js', 'data', 'sources', 'index.js'),
            path.join(baseDir, 'data', 'sources', 'index.js'),
            path.join(baseDir, '..', 'js', 'data', 'sources', 'index.js'),
            path.join(process.cwd(), 'js', 'data', 'sources', 'index.js'),
            'js/data/sources/index.js',
            'data/sources/index.js'
        ];
        for (const c of candidates) {
            try {
                if (fs.existsSync(c)) {
                    eval(fs.readFileSync(c, 'utf8'));
                    break;
                }
            } catch (e) {
                console.error('[KnowledgeBase Facade] Error loading', c, e);
            }
        }
    }

    const sources = (root.App && root.App.scientificSources) || [];
    root.ScientificKnowledgeBase = sources;
    if (typeof window !== 'undefined') {
        window.ScientificKnowledgeBase = sources;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = root.ScientificKnowledgeBase;
    }
})();