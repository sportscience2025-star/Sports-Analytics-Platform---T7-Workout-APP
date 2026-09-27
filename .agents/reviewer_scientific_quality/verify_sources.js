/**
 * verify_sources.js
 * Independent, exhaustive verification script for Reviewer 2.
 */
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..', '..');
const sourcesDir = path.join(repoRoot, 'js', 'data', 'sources');

console.log('====================================================');
console.log('INDEPENDENT VERIFICATION OF SCIENTIFIC SOURCES');
console.log('====================================================');

const areaFiles = {
    'atletica.js': { area: 'Atletica Leggera', expectedCount: 35, windowKey: 'atletica' },
    'sollevamento-pesi.js': { area: 'Sollevamento Pesi', expectedCount: 31, windowKey: 'sollevamentoPesi' },
    'fisiologia.js': { area: 'Fisiologia', expectedCount: 47, windowKey: 'fisiologia' },
    'vbt.js': { area: 'VBT', expectedCount: 28, windowKey: 'vbt' },
    'biomeccanica.js': { area: 'Biomeccanica', expectedCount: 40, windowKey: 'biomeccanica' },
    'clinico.js': { area: 'Clinico', expectedCount: 40, windowKey: 'clinico' },
    'sport-squadra.js': { area: 'Sport di Squadra', expectedCount: 39, windowKey: 'sportSquadra' }
};

const findings = [];
function addFinding(severity, message, details = {}) {
    findings.push({ severity, message, details });
    console.log(`[${severity.toUpperCase()}] ${message}`);
}

// 1. Check individual area files and evaluate them
const individualSources = new Map();
let totalSourceCount = 0;

for (const [fileName, spec] of Object.entries(areaFiles)) {
    const filePath = path.join(sourcesDir, fileName);
    if (!fs.existsSync(filePath)) {
        addFinding('critical', `File missing: ${fileName}`);
        continue;
    }
    const content = fs.readFileSync(filePath, 'utf8');

    // Create fresh sandbox window
    const sandbox = { window: { App: { Sources: {} } } };
    try {
        const fn = new Function('window', 'globalThis', 'global', content);
        fn(sandbox.window, sandbox.window, sandbox.window);
    } catch (e) {
        addFinding('critical', `Execution error in ${fileName}: ${e.message}`);
        continue;
    }

    const areaList = sandbox.window.App.Sources[spec.windowKey];
    if (!Array.isArray(areaList)) {
        addFinding('critical', `window.App.Sources.${spec.windowKey} is not an array in ${fileName}`);
        continue;
    }

    if (areaList.length !== spec.expectedCount) {
        addFinding('major', `Count mismatch in ${fileName}: expected ${spec.expectedCount}, found ${areaList.length}`);
    } else {
        console.log(`[PASS] ${fileName}: Count matches expected ${spec.expectedCount}`);
    }

    totalSourceCount += areaList.length;
    individualSources.set(fileName, areaList);
}

console.log(`\nTotal sources across 7 area files: ${totalSourceCount}`);
if (totalSourceCount !== 260) {
    addFinding('critical', `Total count across area files is ${totalSourceCount}, expected 260`);
} else {
    console.log('[PASS] Total count across area files is exactly 260 (>= 250)');
}

// 2. Load via index.js aggregator
let aggregatedSources = [];
try {
    const sandbox = { window: { App: {} }, process: process, console: console };
    const indexPath = path.join(sourcesDir, 'index.js');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    const fn = new Function('window', 'globalThis', 'global', 'require', '__dirname', indexContent);
    fn(sandbox.window, sandbox.window, sandbox.window, require, sourcesDir);
    aggregatedSources = sandbox.window.App.scientificSources;
    console.log(`[PASS] index.js aggregator loaded ${aggregatedSources.length} sources`);
} catch (e) {
    addFinding('critical', `index.js aggregator execution failed: ${e.message}`);
}

// 3. Schema Completeness & Quality Checks
console.log('\n--- Checking Schema Completeness & Scientific Quality ---');
const requiredFields = ['id', 'title', 'authors', 'journal', 'year', 'area', 'abstract', 'url', 'rules'];

const idSet = new Map(); // id -> source
const normalizedTitleSet = new Map(); // normalized title -> source
const pmidSet = new Map(); // pmid -> source

// Italian stop words to check language
const italianMarkers = ['il', 'la', 'di', 'e', 'in', 'per', 'con', 'del', 'della', 'dei', 'delle', 'questo', 'studio', 'risultati', 'allenamento', 'forza', 'prestazione', 'atleti', 'carico', 'velocità', 'muscolare', 'riduzione', 'incremento', 'fisiologico', 'adattamento', 'clinico', 'riabilitazione', 'esercizi', 'movimento', 'articolare', 'gruppo'];

const controlledPatientTypes = new Set(['Atleta', 'Clinico']);

let abstractWordCounts = [];
let abstractItalianScoreFails = [];
let invalidUrls = [];
let invalidYears = [];
let invalidRules = [];
let invalidPatientTypes = [];

for (const s of aggregatedSources) {
    // Check 9 required fields
    for (const f of requiredFields) {
        if (s[f] === undefined || s[f] === null || s[f] === '') {
            addFinding('critical', `Missing or empty field '${f}' in source ${s.id || 'UNKNOWN'}`);
        }
    }

    // Check ID format
    if (!/^sci_[a-z0-9_]+$/.test(s.id)) {
        addFinding('minor', `Non-standard ID format in ${s.id}`);
    }

    // Check ID uniqueness
    if (idSet.has(s.id)) {
        addFinding('critical', `DUPLICATE ID detected: '${s.id}'`, {
            first: idSet.get(s.id).title,
            duplicate: s.title
        });
    } else {
        idSet.set(s.id, s);
    }

    // Check Title uniqueness & quality
    if (typeof s.title === 'string') {
        const normTitle = s.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normTitle.length < 10) {
            addFinding('major', `Suspiciously short title in ${s.id}: "${s.title}"`);
        }
        if (/lorem|placeholder|todo|tbd|dummy|test\s+title/i.test(s.title)) {
            addFinding('critical', `INTEGRITY VIOLATION: Placeholder in title for ${s.id}: "${s.title}"`);
        }
        if (normalizedTitleSet.has(normTitle)) {
            const existing = normalizedTitleSet.get(normTitle);
            addFinding('major', `DUPLICATE TITLE detected: "${s.title}"`, {
                id1: existing.id,
                id2: s.id,
                title: s.title
            });
        } else {
            normalizedTitleSet.set(normTitle, s);
        }
    }

    // Check Year
    if (typeof s.year !== 'number' || s.year < 1950 || s.year > 2026) {
        invalidYears.push({ id: s.id, year: s.year });
    }

    // Check URL
    if (typeof s.url !== 'string' || !s.url.startsWith('https://')) {
        invalidUrls.push({ id: s.id, url: s.url });
    } else {
        // Extract PMID if PubMed
        const pmidMatch = s.url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/);
        if (pmidMatch) {
            const pmid = pmidMatch[1];
            if (pmidSet.has(pmid)) {
                const existing = pmidSet.get(pmid);
                addFinding('major', `DUPLICATE PMID detected: ${pmid}`, {
                    id1: existing.id,
                    id2: s.id,
                    title1: existing.title,
                    title2: s.title
                });
            } else {
                pmidSet.set(pmid, s);
            }
        }
    }

    // Check Abstract Language & Quality
    if (typeof s.abstract === 'string') {
        const words = s.abstract.toLowerCase().split(/\s+/);
        abstractWordCounts.push(words.length);
        if (words.length < 15) {
            addFinding('major', `Abstract too short (${words.length} words) in ${s.id}`);
        }
        const placeholderMatch = s.abstract.match(/\b(lorem|ipsum|placeholder|todo|tbd|dummy)\b/i);
        if (placeholderMatch) {
            addFinding('critical', `INTEGRITY VIOLATION: Placeholder '${placeholderMatch[0]}' in abstract for ${s.id}`);
        }
        // Count Italian markers
        const itCount = words.filter(w => italianMarkers.includes(w)).length;
        if (itCount < 2) {
            abstractItalianScoreFails.push({ id: s.id, abstractSnippet: s.abstract.slice(0, 80), itWords: itCount });
        }
    }

    // Check rules and patientTypes
    if (typeof s.rules !== 'object' || s.rules === null) {
        invalidRules.push(s.id);
    } else {
        const pts = s.rules.patientTypes;
        if (!pts) {
            addFinding('critical', `Missing rules.patientTypes in ${s.id}`);
        } else {
            const ptArr = Array.isArray(pts) ? pts : [pts];
            const allValid = ptArr.every(pt => controlledPatientTypes.has(pt));
            if (!allValid || ptArr.length === 0) {
                invalidPatientTypes.push({ id: s.id, patientTypes: pts });
            }
        }
    }
}

console.log(`Abstract Italian check: ${abstractItalianScoreFails.length} failed`);
if (abstractItalianScoreFails.length > 0) {
    console.log('Failed Italian check:', abstractItalianScoreFails);
}
console.log(`Invalid patientTypes: ${invalidPatientTypes.length}`);
if (invalidPatientTypes.length > 0) {
    console.log('Invalid patientTypes:', invalidPatientTypes);
}
console.log(`Invalid URLs: ${invalidUrls.length}`);
if (invalidUrls.length > 0) {
    console.log('Invalid URLs:', invalidUrls);
}
console.log(`Invalid years: ${invalidYears.length}`);
if (invalidYears.length > 0) {
    console.log('Invalid years:', invalidYears);
}

// 4. Baseline preservation check
console.log('\n--- Checking Baseline Preservation (161 original sources) ---');
const baselinePath = path.join(repoRoot, '.agents', 'worker_research_group_b', 'existing_sources.json');
let baselinePreservedCount = 0;
let missingBaselineIds = [];

if (fs.existsSync(baselinePath)) {
    const baselineData = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    const baselineIds = baselineData.ids;
    console.log(`Loaded ${baselineIds.length} baseline IDs from existing_sources.json`);

    for (const bId of baselineIds) {
        if (idSet.has(bId)) {
            baselinePreservedCount++;
        } else {
            missingBaselineIds.push(bId);
        }
    }

    console.log(`Baseline preservation: ${baselinePreservedCount}/${baselineIds.length}`);
    if (missingBaselineIds.length > 0) {
        addFinding('critical', `MISSING BASELINE SOURCES (${missingBaselineIds.length}): ${missingBaselineIds.join(', ')}`);
    } else {
        console.log('[PASS] 100% of baseline sources (161/161) are preserved in the new corpus!');
    }
} else {
    addFinding('major', 'existing_sources.json not found to verify baseline preservation');
}

// Summary of Findings
console.log('\n====================================================');
console.log('VERIFICATION SUMMARY');
console.log('====================================================');
console.log(`Total Findings: ${findings.length}`);
const criticalCount = findings.filter(f => f.severity === 'critical').length;
const majorCount = findings.filter(f => f.severity === 'major').length;
const minorCount = findings.filter(f => f.severity === 'minor').length;
console.log(`Critical: ${criticalCount}, Major: ${majorCount}, Minor: ${minorCount}`);

fs.writeFileSync(path.join(__dirname, 'verification_results.json'), JSON.stringify({
    totalSourceCount,
    aggregatedCount: aggregatedSources.length,
    baselinePreservedCount,
    missingBaselineIds,
    invalidPatientTypes,
    abstractItalianScoreFails,
    invalidUrls,
    invalidYears,
    findings
}, null, 2));

console.log('Saved detailed verification results to verification_results.json');
