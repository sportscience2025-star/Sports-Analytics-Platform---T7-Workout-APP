const fs = require('fs');
const path = require('path');

// =========================================================================
// 1. Mock browser environment globals
// =========================================================================
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
            { id: 'post_op_lca', name: 'Post-op LCA', category: 'post_chirurgiche', description: 'Ricostruzione crociato anteriore.' },
            { id: 'patellar_tendonitis', name: 'Tendinite Rotulea', category: 'tendinopatie', description: 'Infiammazione del tendine rotuleo.' }
        ]
    }
};

// Assertion helper
function assert(condition, message) {
    if (!condition) {
        console.error("❌ Assertion Failed:", message);
        process.exit(1);
    }
}

// Helper to check if file exists and load it
function loadModule(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found at ${filePath}`);
        process.exit(1);
    }
    const code = fs.readFileSync(filePath, 'utf8');
    eval(code);
}

// Load knowledge-base.js (assuming it will be in the js/ folder relative to project root)
// For testing in root directory, we mock the path relative to __dirname
const projectRoot = __dirname.includes('.agents') 
    ? path.join(__dirname, '..', '..') 
    : __dirname;

const kbPath = path.join(projectRoot, 'js', 'knowledge-base.js');
const logicPath = path.join(projectRoot, 'js', 'logic.js');

console.log("=== Loading modules ===");
loadModule(kbPath);
loadModule(logicPath);
console.log("✅ Modules loaded successfully.\n");

const WorkoutGeneratorAI = global.window.WorkoutGeneratorAI;
const ScientificKnowledgeBase = global.window.ScientificKnowledgeBase;

function runTests() {
    console.log("=== Running Scientific Hub Integrity & Validation Tests ===\n");

    // =========================================================================
    // REQUIREMENT R1: Internal Scientific Database (Physiology & Biomechanics)
    // =========================================================================
    console.log("--- Testing R1: Database Scientifico Interno ---");
    
    // 1.1 Verify ScientificKnowledgeBase structure
    assert(Array.isArray(ScientificKnowledgeBase), "ScientificKnowledgeBase must be an array");
    assert(ScientificKnowledgeBase.length >= 5, `ScientificKnowledgeBase should contain at least 5 sources, got ${ScientificKnowledgeBase.length}`);
    console.log(`✅ Success: Found ${ScientificKnowledgeBase.length} sources in the database.`);

    // 1.2 Verify mandatory fields for all sources
    const requiredKeys = ['id', 'title', 'authors', 'journal', 'year', 'area', 'abstract', 'url', 'rules'];
    const uniqueIds = new Set();

    ScientificKnowledgeBase.forEach((source, index) => {
        assert(source.id, `Source at index ${index} is missing 'id'`);
        assert(!uniqueIds.has(source.id), `Duplicate source ID found: ${source.id}`);
        uniqueIds.add(source.id);

        requiredKeys.forEach(key => {
            assert(source[key] !== undefined, `Source ${source.id} is missing key: '${key}'`);
        });

        // Verify URL format
        assert(typeof source.url === 'string' && source.url.startsWith('http'), `Source ${source.id} has invalid URL: ${source.url}`);
        
        // Verify rules structure
        assert(typeof source.rules === 'object' && source.rules !== null, `Source ${source.id} rules must be an object`);
    });
    console.log("✅ Success: All sources have valid IDs, URLs, rules objects, and mandatory keys.");

    // 1.3 Verify the 5 mandatory scientific sources exist
    const mandatoryAuthors = [
        "González-Badillo",
        "Samozino",
        "Pareja-Blanco",
        "Escamilla",
        "Seiler"
    ];

    mandatoryAuthors.forEach(author => {
        const found = ScientificKnowledgeBase.some(source => 
            source.authors.toLowerCase().includes(author.toLowerCase()) || 
            source.title.toLowerCase().includes(author.toLowerCase())
        );
        assert(found, `Mandatory source by or referencing '${author}' was not found in ScientificKnowledgeBase`);
        console.log(`✅ Success: Verified presence of mandatory source: ${author}`);
    });
    console.log("--- R1 tests passed successfully ---\n");


    // =========================================================================
    // REQUIREMENT R2: Generazione Spiegazioni AI Arricchite
    // =========================================================================
    console.log("--- Testing R2: Generazione Spiegazioni AI Arricchite ---");
    const ai = new WorkoutGeneratorAI();

    // 2.1 Scenario A: Sport = Endurance (Should cite Seiler 2010 and relate to Polarized Training / 80/20)
    console.log("Testing Scenario A: Sport = Endurance...");
    const enduranceProgram = ai.generateFullProgram({
        patientType: 'Atleta',
        weeks: 8,
        days: 2,
        sportPraticato: 'Endurance',
        goal: 'Strength',
        level: 'Intermediate',
        equipment: 'Full'
    });

    assert(enduranceProgram.explanations && enduranceProgram.explanations.length > 0, "Endurance program should contain explanations");
    
    // Check for Seiler citation
    const citesSeiler = enduranceProgram.explanations.some(exp => 
        (exp.text && exp.text.toLowerCase().includes("seiler")) ||
        (exp.title && exp.title.toLowerCase().includes("seiler"))
    );
    assert(citesSeiler, "Endurance program must contain a citation/reference to Seiler's work in explanations");
    console.log("✅ Success: Endurance program correctly cites Seiler.");

    // 2.2 Scenario B: Sport = Bodybuilding (Should cite Pareja-Blanco 2017 and relate to Velocity Loss / Hypertrophy)
    console.log("Testing Scenario B: Sport = Bodybuilding...");
    const bodybuildingProgram = ai.generateFullProgram({
        patientType: 'Atleta',
        weeks: 12,
        days: 4,
        sportPraticato: 'Bodybuilding',
        goal: 'Hypertrophy',
        level: 'Intermediate',
        equipment: 'Full'
    });

    assert(bodybuildingProgram.explanations && bodybuildingProgram.explanations.length > 0, "Bodybuilding program should contain explanations");
    
    // Check for Pareja-Blanco citation
    const citesParejaBlanco = bodybuildingProgram.explanations.some(exp => 
        (exp.text && exp.text.toLowerCase().includes("pareja-blanco")) ||
        (exp.title && exp.title.toLowerCase().includes("pareja-blanco"))
    );
    assert(citesParejaBlanco, "Bodybuilding program must contain a citation/reference to Pareja-Blanco's work in explanations");
    console.log("✅ Success: Bodybuilding program correctly cites Pareja-Blanco.");

    // 2.3 Scenario C: PatientType = Clinico with Knee Pathology (Should cite Escamilla and restrict knee ROM)
    console.log("Testing Scenario C: PatientType = Clinico (Knee Pathology)...");
    const clinicalKneeProgram = ai.generateFullProgram({
        patientType: 'Clinico',
        weeks: 8,
        days: 3,
        injuries: ['post_op_lca'], // Knee pathology
        goal: 'Strength',
        level: 'Beginner',
        equipment: 'Full'
    });

    assert(clinicalKneeProgram.explanations && clinicalKneeProgram.explanations.length > 0, "Clinical knee program should contain explanations");
    
    // Check for Escamilla citation
    const citesEscamilla = clinicalKneeProgram.explanations.some(exp => 
        (exp.text && exp.text.toLowerCase().includes("escamilla")) ||
        (exp.title && exp.title.toLowerCase().includes("escamilla"))
    );
    assert(citesEscamilla, "Clinical program for knee pathologies must contain a citation/reference to Escamilla's work in explanations");
    
    // Check knee ROM limitation in early phases
    let foundKneeROMLimitNote = false;
    clinicalKneeProgram.phases.forEach(phase => {
        // Phase 1 (first phase) is knee rehabilitation phase.
        // It should have knee ROM limited (e.g. <= 60 degrees).
        phase.schedule.forEach(day => {
            if (day.isRest) return;
            day.exercises.forEach(ex => {
                if (ex.note && ex.note.includes("Limitare flessione ginocchio") && ex.note.includes("60°")) {
                    foundKneeROMLimitNote = true;
                }
            });
        });
    });
    assert(foundKneeROMLimitNote, "Clinical program with knee injuries must apply knee ROM limits (e.g., 60° max in Phase 1) to exercises");
    console.log("✅ Success: Clinical knee program correctly cites Escamilla and applies ROM limits.");

    // 2.4 Scenario D: VBT Profiling / Strength (Should cite González-Badillo 2010 and/or Samozino)
    console.log("Testing Scenario D: Strength / VBT Goal...");
    const strengthProgram = ai.generateFullProgram({
        patientType: 'Atleta',
        weeks: 12,
        days: 3,
        sportPraticato: 'Generic',
        goal: 'Strength',
        level: 'Advanced',
        equipment: 'Full'
    });

    assert(strengthProgram.explanations && strengthProgram.explanations.length > 0, "Strength program should contain explanations");
    
    const citesVbtOrFv = strengthProgram.explanations.some(exp => 
        (exp.text && (exp.text.toLowerCase().includes("gonzález-badillo") || exp.text.toLowerCase().includes("samozino"))) ||
        (exp.title && (exp.title.toLowerCase().includes("gonzález-badillo") || exp.title.toLowerCase().includes("samozino")))
    );
    assert(citesVbtOrFv, "Strength program must contain VBT (González-Badillo) or Force-Velocity (Samozino) citations in explanations");
    console.log("✅ Success: Strength program correctly cites VBT/Force-Velocity literature.");

    // 2.5 Verify that citations list contains working URLs and is appended to the generated explanations
    console.log("Testing bibliography links in generated program output...");
    let hasBibliographicalSection = false;
    
    // Check if bibliography is appended either to each explanation, or in a separate citations list
    if (bodybuildingProgram.citations && Array.isArray(bodybuildingProgram.citations)) {
        assert(bodybuildingProgram.citations.length >= 2, "Program should contain at least two citations in the bibliography");
        bodybuildingProgram.citations.forEach(cit => {
            assert(cit.title && cit.url && cit.url.startsWith("http"), "Citation must have title and valid http/https URL");
        });
        hasBibliographicalSection = true;
    } else {
        // Alternately, check if the citations are embedded in explanations as objects or formatted strings
        bodybuildingProgram.explanations.forEach(exp => {
            if (exp.citations && Array.isArray(exp.citations)) {
                exp.citations.forEach(cit => {
                    assert(cit.title && cit.url && cit.url.startsWith("http"), "Explanation citation must have title and valid http/https URL");
                });
                hasBibliographicalSection = true;
            } else if (exp.text && (exp.text.includes("http://") || exp.text.includes("https://") || exp.text.includes("doi.org") || exp.text.includes("pubmed"))) {
                hasBibliographicalSection = true;
            }
        });
    }
    assert(hasBibliographicalSection, "Program output must contain bibliographical citations with functional URL/PubMed/DOI links");
    console.log("✅ Success: Bibliography list/citation links are present and correct.");

    console.log("--- R2 tests passed successfully ---\n");

    console.log("🎉 All tests passed successfully! The scientific database and dynamic AI citation-linking logic meet all requirements.");
}

runTests();
