/**
 * deep_audit.js
 * Adversarial deep-dive audit of the 260 scientific sources.
 */
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..', '..');
const sourcesDir = path.join(repoRoot, 'js', 'data', 'sources');

// Load all sources via index.js aggregator
const sandbox = { window: { App: {} }, process: process, console: console };
const indexPath = path.join(sourcesDir, 'index.js');
const indexContent = fs.readFileSync(indexPath, 'utf8');
const fn = new Function('window', 'globalThis', 'global', 'require', '__dirname', indexContent);
fn(sandbox.window, sandbox.window, sandbox.window, require, sourcesDir);
const sources = sandbox.window.App.scientificSources;

const baselineData = JSON.parse(fs.readFileSync(path.join(repoRoot, '.agents', 'worker_research_group_b', 'existing_sources.json'), 'utf8'));
const baselineIds = new Set(baselineData.ids);

console.log(`Auditing ${sources.length} sources (${baselineIds.size} baseline, ${sources.length - baselineIds.size} new)...`);

// 1. Vocabulary audit
const patientTypesSet = new Set();
const sportsSet = new Set();
const goalsSet = new Set();
const injuriesSet = new Set();

const newSources = [];
const baselineSources = [];

sources.forEach(s => {
    if (baselineIds.has(s.id)) {
        baselineSources.push(s);
    } else {
        newSources.push(s);
    }

    if (s.rules) {
        if (s.rules.patientTypes) {
            const arr = Array.isArray(s.rules.patientTypes) ? s.rules.patientTypes : [s.rules.patientTypes];
            arr.forEach(pt => patientTypesSet.add(pt));
        }
        if (s.rules.sports) {
            s.rules.sports.forEach(sp => sportsSet.add(sp));
        }
        if (s.rules.goals) {
            s.rules.goals.forEach(g => goalsSet.add(g));
        }
        if (s.rules.injuries) {
            s.rules.injuries.forEach(inj => injuriesSet.add(inj));
        }
    }
});

console.log('\n--- Patient Types ---');
console.log(Array.from(patientTypesSet));

console.log('\n--- Sports Vocabulary ---');
console.log(Array.from(sportsSet).sort());

console.log('\n--- Goals Vocabulary ---');
console.log(Array.from(goalsSet).sort());

console.log('\n--- Injuries Vocabulary Count ---');
console.log(`Total unique injury tags: ${injuriesSet.size}`);

// 2. Abstract similarity & duplicate check
console.log('\n--- Abstract Duplicate Check ---');
const abstractMap = new Map();
let duplicateAbstracts = 0;
sources.forEach(s => {
    const trimmed = s.abstract.trim();
    if (abstractMap.has(trimmed)) {
        console.log(`DUPLICATE ABSTRACT found: ${s.id} matches ${abstractMap.get(trimmed).id}`);
        duplicateAbstracts++;
    } else {
        abstractMap.set(trimmed, s);
    }
});
if (duplicateAbstracts === 0) {
    console.log('[PASS] Zero duplicate abstracts detected across all 260 sources.');
}

// 3. New sources scientific quality audit
console.log('\n--- Auditing 99 New Sources Specifically ---');
const journalsNew = new Map();
let pmidCount = 0;
let doiCount = 0;
let otherUrlCount = 0;

newSources.forEach(s => {
    journalsNew.set(s.journal, (journalsNew.get(s.journal) || 0) + 1);
    if (s.url.includes('pubmed.ncbi.nlm.nih.gov')) {
        pmidCount++;
    } else if (s.url.includes('doi.org')) {
        doiCount++;
    } else {
        otherUrlCount++;
    }
});

console.log(`New sources URL breakdown: ${pmidCount} PubMed, ${doiCount} DOI, ${otherUrlCount} other`);
console.log(`New sources Journals count: ${journalsNew.size} unique journals`);
console.log('Top Journals in New Sources:');
const sortedJournals = Array.from(journalsNew.entries()).sort((a, b) => b[1] - a[1]);
sortedJournals.slice(0, 10).forEach(([j, c]) => console.log(`  ${j}: ${c}`));

// 4. Abstract word count statistics
const wordCounts = sources.map(s => s.abstract.split(/\s+/).length);
const minWords = Math.min(...wordCounts);
const maxWords = Math.max(...wordCounts);
const avgWords = (wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length).toFixed(1);
console.log(`\nAbstract word count stats: Min = ${minWords}, Max = ${maxWords}, Avg = ${avgWords}`);

// 5. Check if any new source has missing/invalid rules fields
let newMissingSports = 0;
let newMissingGoals = 0;
newSources.forEach(s => {
    if (!s.rules.sports || s.rules.sports.length === 0) newMissingSports++;
    if (!s.rules.goals || s.rules.goals.length === 0) newMissingGoals++;
});
console.log(`New sources without sports rules: ${newMissingSports}/${newSources.length} (clinical/general sources often omit sport)`);
console.log(`New sources without goals rules: ${newMissingGoals}/${newSources.length}`);

// Write report output
fs.writeFileSync(path.join(__dirname, 'audit_metrics.json'), JSON.stringify({
    totalSources: sources.length,
    baselineCount: baselineSources.length,
    newCount: newSources.length,
    patientTypes: Array.from(patientTypesSet),
    sports: Array.from(sportsSet),
    goals: Array.from(goalsSet),
    injuriesCount: injuriesSet.size,
    duplicateAbstracts,
    urlStats: { pmidCount, doiCount, otherUrlCount },
    abstractStats: { minWords, maxWords, avgWords },
    topJournals: sortedJournals.slice(0, 15)
}, null, 2));
