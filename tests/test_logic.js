const fs = require('fs');
const path = require('path');

// 1. Mock browser environment globals
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
            // Post-chirurgiche
            { id: 'post_op_lca', name: 'Post-op LCA', category: 'post_chirurgiche', riskLevel: 'medium', description: 'Ricostruzione crociato anteriore.' },
            // Reumatologiche (R2 & R5)
            { id: 'artrite_reumatoide', name: 'Artrite Reumatoide', category: 'reumatologiche', riskLevel: 'medium', description: 'Patologia infiammatoria cronica.' },
            { id: 'raynaud_phenomenon', name: 'Fenomeno di Raynaud', category: 'reumatologiche', riskLevel: 'low', description: 'Vasospasmo dita scatenato dal freddo.' },
            // Condizioni per comorbilità (R3 & R5)
            { id: 'cervical_pain', name: 'Cervicalgia', category: 'colonna', riskLevel: 'low', description: 'Dolore cervicale.' },
            { id: 'lumbalgia', name: 'Lombalgia', category: 'colonna', riskLevel: 'low', description: 'Dolore lombare.' },
            { id: 'ernia_discale', name: 'Ernia Discale', category: 'colonna', riskLevel: 'medium', description: 'Ernia discale lombo-sacrale.' },
            { id: 'tendinite_rotulea', name: 'Tendinopatia Rotulea', category: 'arti_inferiori', riskLevel: 'low', description: 'Dolore tendine rotuleo.' },
            { id: 'meniscopatia', name: 'Meniscopatia', category: 'arti_inferiori', riskLevel: 'low', description: 'Sofferenza meniscale.' },
            // Speciali (R2)
            { id: 'gravidanza', name: 'Gravidanza', category: 'speciali', riskLevel: 'medium', description: 'Gravidanza 2° trimestre.' },
            // Sistemiche
            { id: 'hypertension', name: 'Ipertensione', category: 'sistemiche', riskLevel: 'medium', description: 'Ipertensione arteriosa.' },
            { id: 'diabetes_low', name: 'Diabete Lieve Controllato', category: 'sistemiche', riskLevel: 'low', description: 'Diabete controllato con dieta.' },
            // Neurologiche
            { id: 'parkinson_lieve', name: 'Parkinson Lieve', category: 'neurologiche', riskLevel: 'medium', description: 'Parkinson iniziale.' }
        ]
    }
};

// 2. Load logic.js in global context
const logicPath = path.join(__dirname, '..', 'js', 'logic.js');
if (!fs.existsSync(logicPath)) {
    console.error("Error: logic.js not found at", logicPath);
    process.exit(1);
}

const logicCode = fs.readFileSync(logicPath, 'utf8');
eval(logicCode);

const WorkoutGeneratorAI = global.window.WorkoutGeneratorAI;
if (!WorkoutGeneratorAI) {
    console.error("Error: WorkoutGeneratorAI class not found on window object.");
    process.exit(1);
}

const generator = new WorkoutGeneratorAI();

let passed = 0;
let failed = 0;

function assert(condition, name, info = '') {
    if (condition) {
        console.log(`  PASS  ${name}`);
        passed++;
    } else {
        console.error(`  FAIL  ${name} ${info}`);
        failed++;
    }
}

function section(title) {
    console.log(`\n── ${title} ─────────────────────────────────────`);
}

console.log("==========================================================");
console.log("   VERIFICATION SUITE: analyzeRiskProfile (logic.js)      ");
console.log("==========================================================");

// SECTION 1: Baseline & Initialization
section("1. Baseline & Constructor Properties");
assert(generator.thresholds && generator.thresholds.HIGH === 4 && generator.thresholds.MEDIUM === 2,
    "WorkoutGeneratorAI introduces configurable thresholds { HIGH: 4, MEDIUM: 2 }");
assert(generator.riskLevels && generator.riskLevels.LOW && generator.riskLevels.HIGH,
    "WorkoutGeneratorAI has defined riskLevels palette");

const baseResult = generator.analyzeRiskProfile(['post_op_lca']);
assert(baseResult.level === 'HIGH', "Post-op LCA condition triggers HIGH risk level");
assert(baseResult.score === 2, "Post-op LCA with medium risk has weight 2", `got=${baseResult.score}`);

// SECTION 2: R1 Input Validation & Fallback
section("2. R1: Input Validation & Safe Fallback");
const resNull = generator.analyzeRiskProfile(null);
assert(resNull.level === 'LOW' && resNull.score === 0 && Array.isArray(resNull.pathologies) && resNull.pathologies.length === 0,
    "analyzeRiskProfile(null) returns LOW risk fallback without throwing");

const resUndefined = generator.analyzeRiskProfile(undefined);
assert(resUndefined.level === 'LOW' && resUndefined.score === 0,
    "analyzeRiskProfile(undefined) returns LOW risk fallback without throwing");

const resString = generator.analyzeRiskProfile("cervical_pain");
assert(resString.level === 'LOW' && resString.score === 0,
    "analyzeRiskProfile('string') returns LOW risk fallback without throwing");

const resObj = generator.analyzeRiskProfile({ id: 'cervical_pain' });
assert(resObj.level === 'LOW' && resObj.score === 0,
    "analyzeRiskProfile({}) returns LOW risk fallback without throwing");

const resEmpty = generator.analyzeRiskProfile([]);
assert(resEmpty.level === 'LOW' && resEmpty.score === 0 && resEmpty.pathologies.length === 0,
    "analyzeRiskProfile([]) returns LOW risk for empty selection");

// Test fallback when window.App.getConditions returns undefined
const originalGetConditions = global.window.App.getConditions;
global.window.App.getConditions = () => undefined;
const resNoConditions = generator.analyzeRiskProfile(['cervical_pain']);
assert(resNoConditions.level === 'LOW' && resNoConditions.score === 0,
    "analyzeRiskProfile gracefully handles window.App.getConditions() returning undefined");
global.window.App.getConditions = originalGetConditions; // Restore

// SECTION 3: R2 Critical Categories (reumatologiche & speciali)
section("3. R2: Critical Categories (reumatologiche & speciali)");

// Reumatologiche with riskLevel !== 'low'
const resReumMed = generator.analyzeRiskProfile(['artrite_reumatoide']);
assert(resReumMed.level === 'HIGH',
    "Reumatologiche with medium risk (artrite_reumatoide) triggers HIGH risk category",
    `got level=${resReumMed.level}, score=${resReumMed.score}`);

// Reumatologiche with riskLevel === 'low'
const resReumLow = generator.analyzeRiskProfile(['raynaud_phenomenon']);
assert(resReumLow.level === 'LOW' && resReumLow.score === 1,
    "Reumatologiche with low risk (raynaud_phenomenon) does NOT trigger high risk category",
    `got level=${resReumLow.level}, score=${resReumLow.score}`);

// Speciali category
const resSpec = generator.analyzeRiskProfile(['gravidanza']);
assert(resSpec.level === 'HIGH',
    "Speciali category condition (gravidanza) triggers HIGH risk category",
    `got level=${resSpec.level}, score=${resSpec.score}`);

// Sistemiche with low vs medium
const resSistLow = generator.analyzeRiskProfile(['diabetes_low']);
assert(resSistLow.level === 'LOW' && resSistLow.score === 1,
    "Sistemiche with low risk does not trigger high risk category",
    `got level=${resSistLow.level}, score=${resSistLow.score}`);

const resSistMed = generator.analyzeRiskProfile(['hypertension']);
assert(resSistMed.level === 'HIGH',
    "Sistemiche with medium risk triggers HIGH risk category",
    `got level=${resSistMed.level}, score=${resSistMed.score}`);

// Neurologiche category
const resNeuro = generator.analyzeRiskProfile(['parkinson_lieve']);
assert(resNeuro.level === 'HIGH',
    "Neurologiche condition triggers HIGH risk category",
    `got level=${resNeuro.level}, score=${resNeuro.score}`);

// SECTION 4: R3 Comorbidity Bonus
section("4. R3: Comorbidity Bonus Logic");

// 2 low-risk conditions in DIFFERENT categories: 1 + 1 = 2, bonus = 0
const resDiffCats = generator.analyzeRiskProfile(['cervical_pain', 'tendinite_rotulea']);
assert(resDiffCats.score === 2,
    "2 pathologies in different categories do not receive comorbidity bonus (score=2)",
    `got score=${resDiffCats.score}`);
assert(resDiffCats.level === 'MEDIUM',
    "Score 2 reaches MEDIUM risk threshold",
    `got level=${resDiffCats.level}`);

// 2 low-risk conditions in the SAME category: 1 + 1 = 2 + 1 (bonus) = 3
const resSameCat = generator.analyzeRiskProfile(['cervical_pain', 'lumbalgia']);
assert(resSameCat.score === 3,
    "2 pathologies in same category ('colonna') receive +1 comorbidity bonus (score=3)",
    `got score=${resSameCat.score}`);
assert(resSameCat.level === 'MEDIUM',
    "Score 3 reaches MEDIUM risk threshold without critical category",
    `got level=${resSameCat.level}`);

// 3 conditions in same category ('colonna': 1 + 1 + 2 = 4 + 1 bonus = 5)
const res3SameCat = generator.analyzeRiskProfile(['cervical_pain', 'lumbalgia', 'ernia_discale']);
assert(res3SameCat.score === 5,
    "3 pathologies in same category receive single +1 bonus for that category (score=5)",
    `got score=${res3SameCat.score}`);
assert(res3SameCat.level === 'HIGH',
    "Score 5 reaches HIGH risk threshold",
    `got level=${res3SameCat.level}`);

// Multiple categories with comorbidity (2 in colonna + 2 in arti_inferiori): 1+1 + 1+1 = 4 + 2 bonus = 6
const resMultiComorbidity = generator.analyzeRiskProfile([
    'cervical_pain', 'lumbalgia',
    'tendinite_rotulea', 'meniscopatia'
]);
assert(resMultiComorbidity.score === 6,
    "2 categories each with 2 active pathologies receive +2 total comorbidity bonus (score=6)",
    `got score=${resMultiComorbidity.score}`);
assert(resMultiComorbidity.level === 'HIGH',
    "Score 6 is HIGH risk level",
    `got level=${resMultiComorbidity.level}`);

// SECTION 5: R4 Configurable Thresholds
section("5. R4: Configurable Thresholds");

// Custom thresholds: higher tolerance
generator.thresholds = { HIGH: 5, MEDIUM: 3 };

// Score 2 was MEDIUM under default threshold (2), now LOW under threshold (3)
const resThresholdLow = generator.analyzeRiskProfile(['cervical_pain', 'tendinite_rotulea']);
assert(resThresholdLow.score === 2 && resThresholdLow.level === 'LOW',
    "With custom MEDIUM threshold 3, score 2 resolves to LOW level",
    `score=${resThresholdLow.score}, level=${resThresholdLow.level}`);

// Score 4 was HIGH under default threshold (4), now MEDIUM under high threshold (5)
// (Using cervical_pain [1] + lumbalgia [1] + bonus [1] + tendinite_rotulea [1] = 4, no critical category)
const resThresholdMed = generator.analyzeRiskProfile(['cervical_pain', 'lumbalgia', 'tendinite_rotulea']);
assert(resThresholdMed.score === 4 && resThresholdMed.level === 'MEDIUM',
    "With custom HIGH threshold 5, score 4 resolves to MEDIUM level instead of HIGH",
    `score=${resThresholdMed.score}, level=${resThresholdMed.level}`);

// Restore default thresholds
generator.thresholds = { HIGH: 4, MEDIUM: 2 };
const resRestored = generator.analyzeRiskProfile(['cervical_pain', 'tendinite_rotulea']);
assert(resRestored.level === 'MEDIUM',
    "Restoring default thresholds { HIGH: 4, MEDIUM: 2 } restores expected risk level",
    `level=${resRestored.level}`);

// SECTION 6: Robustness & Adversarial Edge Cases
section("6. Robustness & Adversarial Edge Cases");

// 6.1 Exception thrown by window.App.getConditions()
global.window.App.getConditions = () => { throw new Error('DB initialization error'); };
const resThrow = generator.analyzeRiskProfile(['cervical_pain']);
assert(resThrow.level === 'LOW' && resThrow.score === 0 && Array.isArray(resThrow.pathologies),
    "analyzeRiskProfile catches exceptions from getConditions() and returns safe LOW fallback");
global.window.App.getConditions = originalGetConditions;

// 6.2 Passing pathology objects with .id property
const resObjects = generator.analyzeRiskProfile([{ id: 'cervical_pain' }, { id: 'lumbalgia' }]);
assert(resObjects.score === 3 && resObjects.level === 'MEDIUM' && resObjects.pathologies.length === 2,
    "analyzeRiskProfile handles array of pathology objects { id: '...' } with comorbidity bonus",
    `got score=${resObjects.score}, level=${resObjects.level}`);

// 6.3 Case-insensitive riskLevel (e.g. 'HIGH')
const mockConditionsWithCase = [
    ...originalGetConditions(),
    { id: 'custom_upper_high', name: 'Custom High', category: 'altro', riskLevel: 'HIGH', description: 'Uppercase' }
];
global.window.App.getConditions = () => mockConditionsWithCase;
const resUpperRisk = generator.analyzeRiskProfile(['custom_upper_high']);
assert(resUpperRisk.level === 'HIGH' && resUpperRisk.score === 3,
    "analyzeRiskProfile correctly handles uppercase riskLevel 'HIGH'",
    `got score=${resUpperRisk.score}, level=${resUpperRisk.level}`);
global.window.App.getConditions = originalGetConditions;

// 6.4 Non-finite / NaN thresholds fallback
generator.thresholds = { HIGH: NaN, MEDIUM: NaN };
const resNanThreshold = generator.analyzeRiskProfile(['cervical_pain', 'lumbalgia']); // score 3
assert(resNanThreshold.level === 'MEDIUM',
    "analyzeRiskProfile falls back to defaults when thresholds contain NaN",
    `got level=${resNanThreshold.level}`);
generator.thresholds = { HIGH: 4, MEDIUM: 2 }; // restore

// 6.5 CategoryCounts prototype key resilience (e.g. 'toString')
const mockProtoConditions = [
    { id: 'proto_1', name: 'Proto 1', category: 'toString', riskLevel: 'low' },
    { id: 'proto_2', name: 'Proto 2', category: 'toString', riskLevel: 'low' }
];
global.window.App.getConditions = () => mockProtoConditions;
const resProto = generator.analyzeRiskProfile(['proto_1', 'proto_2']);
assert(resProto.score === 3 && !isNaN(resProto.score),
    "analyzeRiskProfile handles special category names (e.g. toString) without prototype issues",
    `got score=${resProto.score}`);
global.window.App.getConditions = originalGetConditions;

// 6.6 Missing generator.riskLevels fallback palette
const savedRiskLevels = generator.riskLevels;
generator.riskLevels = null;
const resNoRiskLevels = generator.analyzeRiskProfile(['cervical_pain']);
assert(resNoRiskLevels.details && resNoRiskLevels.details.label === 'Basso Rischio' && resNoRiskLevels.details.color === '#10b981',
    "analyzeRiskProfile provides valid fallback details when generator.riskLevels is null");
generator.riskLevels = savedRiskLevels; // restore

// 6.7 Healthy user with empty selection or unknown ID remains LOW even if thresholds are { HIGH: 0, MEDIUM: 0 }
generator.thresholds = { HIGH: 0, MEDIUM: 0 };
const resZeroThreshEmpty = generator.analyzeRiskProfile([]);
assert(resZeroThreshEmpty.level === 'LOW' && resZeroThreshEmpty.score === 0,
    "analyzeRiskProfile([]) strictly returns LOW even if thresholds are { HIGH: 0, MEDIUM: 0 }",
    `got level=${resZeroThreshEmpty.level}`);

const resZeroThreshUnknown = generator.analyzeRiskProfile(['non_existent_condition_id']);
assert(resZeroThreshUnknown.level === 'LOW' && resZeroThreshUnknown.score === 0,
    "analyzeRiskProfile(['unknown_id']) strictly returns LOW even if thresholds are { HIGH: 0, MEDIUM: 0 }",
    `got level=${resZeroThreshUnknown.level}`);
generator.thresholds = { HIGH: 4, MEDIUM: 2 }; // restore

// 6.8 Inverted or negative thresholds safely fall back to defaults { HIGH: 4, MEDIUM: 2 }
generator.thresholds = { HIGH: -1, MEDIUM: -2 };
const resNegThreshold = generator.analyzeRiskProfile(['cervical_pain']); // score 1
assert(resNegThreshold.level === 'LOW' && resNegThreshold.score === 1,
    "Negative thresholds fall back to default, score 1 resolves to LOW",
    `got level=${resNegThreshold.level}`);

generator.thresholds = { HIGH: 1, MEDIUM: 5 }; // inverted
const resInvertedThreshold = generator.analyzeRiskProfile(['cervical_pain']); // score 1
assert(resInvertedThreshold.level === 'LOW' && resInvertedThreshold.score === 1,
    "Inverted thresholds fall back to defaults, preventing false high escalation",
    `got level=${resInvertedThreshold.level}`);
generator.thresholds = { HIGH: 4, MEDIUM: 2 }; // restore

// 6.9 Array containing [undefined, {}] does not match malformed conditions without ID
const mockCondsWithMalformed = [
    { name: 'Malformed Condition Without ID', category: 'colonna', riskLevel: 'low' },
    ...originalGetConditions()
];
global.window.App.getConditions = () => mockCondsWithMalformed;
const resMalformedInput = generator.analyzeRiskProfile([undefined, {}, { otherKey: 123 }, '']);
assert(resMalformedInput.level === 'LOW' && resMalformedInput.score === 0 && resMalformedInput.pathologies.length === 0,
    "analyzeRiskProfile safely ignores undefined/empty IDs and avoids matching conditions without ID");
global.window.App.getConditions = originalGetConditions; // restore

// 6.10 Category casing and whitespace normalization (e.g. ' Speciali ', 'COLONNA')
const mockCaseConditions = [
    { id: 'case_spec_1', name: 'Case Special', category: '  Speciali  ', riskLevel: 'medium' },
    { id: 'case_col_1', name: 'Case Col 1', category: 'COLONNA', riskLevel: 'low' },
    { id: 'case_col_2', name: 'Case Col 2', category: ' colonna ', riskLevel: 'low' }
];
global.window.App.getConditions = () => mockCaseConditions;
const resCaseCategory = generator.analyzeRiskProfile(['case_spec_1']);
assert(resCaseCategory.level === 'HIGH',
    "Category '  Speciali  ' with leading whitespace/casing correctly triggers critical category");

const resCaseComorbid = generator.analyzeRiskProfile(['case_col_1', 'case_col_2']);
assert(resCaseComorbid.score === 3,
    "Category casing/whitespace variation in same category correctly receives comorbidity bonus (score=3)",
    `got score=${resCaseComorbid.score}`);
global.window.App.getConditions = originalGetConditions; // restore

// 6.11 Partial riskLevels palette missing color/label returns guaranteed fallback values
generator.riskLevels = {
    LOW: { color: '' }, // empty color
    MEDIUM: {},        // missing color and label
    HIGH: null
};
const resPartialPalette = generator.analyzeRiskProfile(['cervical_pain']); // LOW
assert(typeof resPartialPalette.details.color === 'string' && resPartialPalette.details.color.length > 0 &&
       typeof resPartialPalette.details.label === 'string' && resPartialPalette.details.label.length > 0,
    "analyzeRiskProfile guarantees non-empty color and label even with partial/corrupted riskLevels palette");
generator.riskLevels = savedRiskLevels; // restore

// 6.12 Sarcopenia behavior validation: category 'speciali' with riskLevel 'low'
const mockSarcopenia = [
    ...originalGetConditions(),
    { id: 'sarcopenia', name: 'Sarcopenia', category: 'speciali', riskLevel: 'low' }
];
global.window.App.getConditions = () => mockSarcopenia;
const resSarcopenia = generator.analyzeRiskProfile(['sarcopenia']);
assert(resSarcopenia.level === 'HIGH' && resSarcopenia.score === 1,
    "Sarcopenia in 'speciali' triggers HIGH level per critical category specification with score 1",
    `got level=${resSarcopenia.level}, score=${resSarcopenia.score}`);
global.window.App.getConditions = originalGetConditions; // restore

// 6.13 Detached invocation without 'this' context (callbacks / destructuring)
const detachedAnalyze = generator.analyzeRiskProfile;
const resDetached = detachedAnalyze(['cervical_pain']);
assert(resDetached.level === 'LOW' && resDetached.score === 1 && resDetached.details && resDetached.details.label === 'Basso Rischio',
    "Detached analyzeRiskProfile invocation evaluates safely without this context",
    `got level=${resDetached.level}, score=${resDetached.score}`);

const resDetachedNull = detachedAnalyze(null);
assert(resDetachedNull.level === 'LOW' && resDetachedNull.score === 0,
    "Detached analyzeRiskProfile(null) fallback evaluates safely without throwing");

// 6.14 Database condition ID with leading/trailing whitespace
const mockWhitespaceCond = [
    { id: '  cervical_pain  ', name: 'Cervicalgia Spaces', category: 'colonna', riskLevel: 'low' }
];
global.window.App.getConditions = () => mockWhitespaceCond;
const resWhitespace = generator.analyzeRiskProfile(['cervical_pain']);
assert(resWhitespace.score === 1 && resWhitespace.pathologies.length === 1,
    "Conditions with whitespace in ID are correctly matched and trimmed",
    `got score=${resWhitespace.score}, matched=${resWhitespace.pathologies.length}`);
global.window.App.getConditions = originalGetConditions; // restore

// 6.15 Database containing duplicate conditions deduplicated to prevent false comorbidity bonus
const mockDuplicateConds = [
    { id: 'cervical_pain', name: 'Cervicalgia 1', category: 'colonna', riskLevel: 'low' },
    { id: 'cervical_pain', name: 'Cervicalgia 2', category: 'colonna', riskLevel: 'low' }
];
global.window.App.getConditions = () => mockDuplicateConds;
const resDupDB = generator.analyzeRiskProfile(['cervical_pain']);
assert(resDupDB.score === 1 && resDupDB.level === 'LOW' && resDupDB.pathologies.length === 1,
    "Duplicate condition records in database are deduplicated without false comorbidity bonus",
    `got score=${resDupDB.score}, level=${resDupDB.level}, count=${resDupDB.pathologies.length}`);
global.window.App.getConditions = originalGetConditions; // restore

// 6.16 Thresholds configured with lowercase keys { high, medium }
generator.thresholds = { high: 5, medium: 3 };
const resLowerThresh = generator.analyzeRiskProfile(['cervical_pain', 'tendinite_rotulea']); // score 2
assert(resLowerThresh.score === 2 && resLowerThresh.level === 'LOW',
    "Thresholds with lowercase keys { high: 5, medium: 3 } are properly supported",
    `got score=${resLowerThresh.score}, level=${resLowerThresh.level}`);
generator.thresholds = { HIGH: 4, MEDIUM: 2 }; // restore

// Summary
console.log("\n==========================================================");
console.log(`TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log("==========================================================");

if (failed > 0) {
    process.exit(1);
} else {
    process.exit(0);
}