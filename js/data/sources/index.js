/**
 * js/data/sources/index.js
 * Root Aggregator & Entry Point for Scientific Sources Database.
 * Combines 12 thematic modules into window.App.scientificSources and window.ScientificKnowledgeBase.
 */
(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);
    root.App = root.App || {};
    root.App.Sources = root.App.Sources || {};

    // Support Node.js test runners (eval / loadModule)
    if (typeof require !== 'undefined') {
        const fs = require('fs');
        const path = require('path');
        const baseDir = typeof __dirname !== 'undefined' ? __dirname : '.';
        const candidates = [
            baseDir,
            path.join(baseDir, 'sources'),
            path.join(baseDir, 'js', 'data', 'sources'),
            path.join(baseDir, '..', 'js', 'data', 'sources'),
            path.join(baseDir, 'data', 'sources'),
            path.join(process.cwd(), 'js', 'data', 'sources'),
            'js/data/sources',
            'data/sources'
        ];
        let sourcesDir = null;
        for (const c of candidates) {
            try {
                if (fs.existsSync(path.join(c, 'atletica.js'))) {
                    sourcesDir = c;
                    break;
                }
            } catch (e) {}
        }
        if (sourcesDir) {
            const files = [
                'atletica.js',
                'sollevamento-pesi.js',
                'fisiologia.js',
                'vbt.js',
                'biomeccanica.js',
                'clinico.js',
                'sport-squadra.js',
                'riabilitazione.js',
                'nutrizione-sportiva.js',
                'prevenzione-infortuni.js',
                'psicologia-sport.js',
                'sport-individuali.js'
            ];
            for (const f of files) {
                const p = path.join(sourcesDir, f);
                try {
                    if (fs.existsSync(p)) {
                        const code = fs.readFileSync(p, 'utf8');
                        eval(code);
                    }
                } catch (e) {
                    console.error('[Sources Loader] Error loading', p, e);
                }
            }
        }
    }

    const s = root.App.Sources || {};
    const rawList = [
        ...(s.atletica || []),
        ...(s.sollevamentoPesi || []),
        ...(s.fisiologia || []),
        ...(s.vbt || []),
        ...(s.biomeccanica || []),
        ...(s.clinico || []),
        ...(s.sportSquadra || []),
        ...(s.riabilitazione || []),
        ...(s.nutrizioneSportiva || []),
        ...(s.prevenzioneInfortuni || []),
        ...(s.psicologiaSport || []),
        ...(s.sportIndividuali || [])
    ];

    /**
     * Helper to infer study type if not explicitly tagged.
     * @param {Object} item - Source object
     * @returns {string} Standardized study type
     */
    function inferStudyType(item) {
        if (item.studyType) return item.studyType;
        const text = ((item.title || '') + ' ' + (item.abstract || '')).toLowerCase();
        if (text.includes('meta-anal') || text.includes('meta analysis')) return 'Meta-analisi';
        if (text.includes('systematic review') || text.includes('revisione sistematica')) return 'Revisione Sistematica';
        if (text.includes('position stand') || text.includes('guideline') || text.includes('consensus') || text.includes('linee guida')) return 'Linee Guida';
        return 'RCT';
    }

    // Deduplicate by id preserving ordering and assign studyType
    const seenIds = new Set();
    const aggregated = [];
    for (const item of rawList) {
        if (item && item.id && !seenIds.has(item.id)) {
            seenIds.add(item.id);
            if (!item.studyType) {
                item.studyType = inferStudyType(item);
            }
            aggregated.push(item);
        }
    }

    // Expose primary global APIs
    root.App.scientificSources = aggregated;
    root.ScientificKnowledgeBase = aggregated;
    if (typeof window !== 'undefined') {
        window.App = window.App || {};
        window.App.scientificSources = aggregated;
        window.ScientificKnowledgeBase = aggregated;
    }

    /**
     * Retrieve all peer-reviewed scientific sources registered in the database.
     * @returns {Array<Object>} Complete array of scientific source objects.
     */
    root.App.getScientificSources = function () {
        return root.App.scientificSources;
    };

    /**
     * Retrieve scientific sources filtered by specific disciplinary area.
     * @param {string} area - Disciplinary area name or 'Tutti' for all areas.
     * @returns {Array<Object>} Array of matching source objects.
     */
    root.App.getScientificSourcesByArea = function (area) {
        if (!area || area === 'Tutti') {
            return root.App.scientificSources;
        }
        return root.App.scientificSources.filter(s => s.area === area);
    };

    /**
     * Retrieve list of unique disciplinary areas available.
     * @returns {Array<string>} Array of distinct area names.
     */
    root.App.getScientificAreas = function () {
        const set = new Set();
        (root.App.scientificSources || []).forEach(s => {
            if (s.area) set.add(s.area);
        });
        return Array.from(set);
    };

    if (typeof window !== 'undefined' && window.App) {
        window.App.getScientificSources = root.App.getScientificSources;
        window.App.getScientificSourcesByArea = root.App.getScientificSourcesByArea;
        window.App.getScientificAreas = root.App.getScientificAreas;
    }
})();
