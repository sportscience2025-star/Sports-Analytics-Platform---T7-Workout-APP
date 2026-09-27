const fs = require('fs');
const path = require('path');

// Mock browser environment globals
global.window = { App: {} };
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};

const projectRoot = path.resolve(__dirname, '../');

function loadModule(relPath) {
    const filePath = path.join(projectRoot, relPath);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Error: File not found at ${filePath}`);
        process.exit(1);
    }
    const code = fs.readFileSync(filePath, 'utf8');
    eval(code);
}

console.log("=== Loading System Modules for Stress Verification ===");
loadModule('js/data.js');
loadModule('js/knowledge-base.js');
loadModule('js/logic.js');
console.log("✅ All core modules loaded successfully.\n");

function assert(condition, message) {
    if (!condition) {
        console.error(`❌ Assertion Failed: ${message}`);
        throw new Error(`Assertion Failed: ${message}`);
    }
}

const ai = new window.WorkoutGeneratorAI();

// -----------------------------------------------------------------------------
// PART 1: Standard Permutation Stress Harness (240 Combinations)
// -----------------------------------------------------------------------------
const sports = ['Endurance', 'Bodybuilding', 'Sport di Squadra'];
const weekOptions = [4, 8, 12, 16];
const profiles = [
    { name: 'Atleta Healthy', patientType: 'Atleta', injuries: [] },
    { name: 'Atleta Post-Op LCA', patientType: 'Atleta', injuries: ['post_op_lca'] },
    { name: 'Clinico Post-Op LCA', patientType: 'Clinico', injuries: ['post_op_lca'] },
    { name: 'Clinico Tendinite Rotulea', patientType: 'Clinico', injuries: ['patellar_tendonitis'] },
    { name: 'Clinico Misto (Gonartrosi + Ernia Lumbare)', patientType: 'Clinico', injuries: ['gonarthrosis', 'lumbar_hernia'] }
];
const goals = [
    { name: 'Hypertrophy', goal: 'Hypertrophy' },
    { name: 'Strength', goal: 'Strength' },
    { name: 'Power', goal: 'Power' },
    { name: 'Resistenza', goal: 'Resistenza' }
];

async function runAll() {
    let totalPermutations = 0;
    let passedPermutations = 0;
    let citationsCheckedTotal = 0;

    console.log("=== Part 1: Starting Program Generation Permutation Stress Test ===");

    for (const sport of sports) {
        for (const weeks of weekOptions) {
            for (const profile of profiles) {
                for (const goalObj of goals) {
                    totalPermutations++;
                    const testLabel = `[#${totalPermutations}] Sport:${sport} | Weeks:${weeks} | Profile:${profile.name} | Goal:${goalObj.name}`;
                    
                    const params = {
                        patientType: profile.patientType,
                        weeks: weeks,
                        days: 3,
                        sportPraticato: sport,
                        sport: sport,
                        goal: goalObj.goal,
                        level: 'Intermediate',
                        equipment: 'Full',
                        injuries: profile.injuries
                    };

                    let program;
                    try {
                        program = await ai.generateFullProgram(params);
                    } catch (err) {
                        console.error(`❌ Exception generated during program synthesis for ${testLabel}:`, err.message);
                        process.exit(1);
                    }

                    assert(program !== null && typeof program === 'object', `${testLabel} -> program object must be non-null object`);
                    assert(Array.isArray(program.phases) && program.phases.length > 0, `${testLabel} -> program.phases must be non-empty array`);

                    assert(typeof program.summaryRationale === 'string', `${testLabel} -> summaryRationale must be string`);
                    assert(program.summaryRationale.trim().length > 50, `${testLabel} -> summaryRationale is empty or too short (length: ${program.summaryRationale.length})`);
                    
                    const rat = program.summaryRationale;
                    assert(!rat.includes('undefined'), `${testLabel} -> summaryRationale contains 'undefined'`);
                    assert(!rat.includes('null'), `${testLabel} -> summaryRationale contains 'null'`);
                    assert(!rat.includes('[object Object]'), `${testLabel} -> summaryRationale contains '[object Object]'`);
                    
                    assert(rat.includes('periodizzazione') || rat.includes('Periodizzazione') || rat.includes('programmazione') || rat.includes('Programmazione') || rat.includes('scheda') || rat.includes('Scheda'), `${testLabel} -> summaryRationale missing periodization narrative structure`);
                    assert(rat.includes(`${weeks}`), `${testLabel} -> summaryRationale missing duration weeks (${weeks})`);

                    if (profile.patientType === 'Clinico') {
                        assert(rat.includes('clinico') || rat.includes('paziente') || rat.includes('tutela') || rat.includes('riabilitativa'), `${testLabel} -> summaryRationale missing clinical context narrative`);
                    }
                    if (profile.injuries.some(id => id.includes('lca') || id.includes('rotulea') || id.includes('gonarthrosis'))) {
                        assert(rat.includes('ginocchio') || rat.includes('articolare') || rat.includes('ROM'), `${testLabel} -> summaryRationale missing knee biomechanical protection narrative`);
                    }
                    if (goalObj.goal === 'Hypertrophy' || goalObj.goal === 'Strength' || goalObj.goal === 'Power') {
                        assert(rat.includes('Velocity-Based Training') || rat.includes('VBT') || rat.includes('velocità') || rat.includes('RPE'), `${testLabel} -> summaryRationale missing VBT/Intensity strategy narrative`);
                    }

                    assert(Array.isArray(program.citations), `${testLabel} -> program.citations must be an array`);
                    
                    for (const cit of program.citations) {
                        citationsCheckedTotal++;
                        assert(typeof cit.title === 'string' && cit.title.trim().length > 0, `${testLabel} -> citation item title must be non-empty string`);
                        assert(typeof cit.authors === 'string', `${testLabel} -> citation item authors must be string`);
                        assert(cit.abstract === undefined, `${testLabel} -> citation item MUST NOT expose raw abstract property`);
                        assert(cit.title.length < 300, `${testLabel} -> citation title appears to contain raw abstract text (length > 300)`);
                        assert(cit.authors.length < 400, `${testLabel} -> citation authors appears to contain raw abstract text (length > 400)`);
                        assert(!cit.title.includes("Studio fondamentale") && !cit.title.includes("Ricerche pietra miliare"), `${testLabel} -> citation title contains raw abstract commentary text`);
                    }

                    passedPermutations++;
                }
            }
        }
    }

    // -----------------------------------------------------------------------------
    // PART 2: Adversarial & Extreme Boundary Testing
    // -----------------------------------------------------------------------------
    console.log("\n=== Part 2: Adversarial & Extreme Boundary Testing ===");

    const adversarialCases = [
        { name: 'Extreme 24 Weeks', params: { patientType: 'Atleta', weeks: 24, days: 4, sport: 'Bodybuilding', goal: 'Hypertrophy', level: 'Advanced', equipment: 'Full', injuries: [] } },
        { name: 'Zero Weeks (Fallback)', params: { patientType: 'Atleta', weeks: 0, days: 3, sport: 'Endurance', goal: 'Resistenza', level: 'Intermediate', equipment: 'Minimal', injuries: [] } },
        { name: 'Multi-Pathology Overload (5 pathologies)', params: { patientType: 'Clinico', weeks: 12, days: 2, sport: 'N/A', goal: 'Health', level: 'Beginner', equipment: 'Minimal', injuries: ['post_op_lca', 'cervical_pain', 'lumbar_hernia', 'patellar_tendonitis', 'gonarthrosis'] } },
        { name: 'Unknown Sport Custom', params: { patientType: 'Atleta', weeks: 8, days: 3, sport: 'CrossFit / Hybrid', goal: 'Power', level: 'Elite', equipment: 'Full', injuries: [] } }
    ];

    let adversarialPassed = 0;
    for (const adv of adversarialCases) {
        const label = `[Adv #${adversarialPassed + 1}: ${adv.name}]`;
        const program = await ai.generateFullProgram(adv.params);
        
        assert(program !== null && typeof program === 'object', `${label} -> program object must be non-null`);
        assert(typeof program.summaryRationale === 'string' && program.summaryRationale.length > 50, `${label} -> summaryRationale must be valid non-empty string`);
        assert(!program.summaryRationale.includes('undefined') && !program.summaryRationale.includes('null'), `${label} -> summaryRationale contains invalid placeholders`);
        assert(Array.isArray(program.citations), `${label} -> citations must be array`);
        
        program.citations.forEach(cit => {
            assert(cit.abstract === undefined, `${label} -> abstract property must be undefined in citation`);
        });
        
        adversarialPassed++;
        console.log(`✅ Passed adversarial test: ${adv.name}`);
    }

    console.log("\n=========================================================");
    console.log(`🎉 STRESS VERIFICATION COMPLETE!`);
    console.log(`- Standard Permutations Evaluated: ${totalPermutations} (100% Passed)`);
    console.log(`- Adversarial Boundary Cases Evaluated: ${adversarialCases.length} (100% Passed)`);
    console.log(`- Total Citation Array Items Validated: ${citationsCheckedTotal}`);
    console.log(`- Summary Rationale Cohesion & Integrity Rate: 100%`);
    console.log(`- Citation Cleanliness & Abstract Omission Rate: 100%`);
    console.log("=========================================================\n");
}

runAll().catch(err => {
    console.error("Fatal error during stress tests:", err);
    process.exit(1);
});
