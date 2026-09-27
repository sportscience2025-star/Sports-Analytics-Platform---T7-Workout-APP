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

console.log("=== Loading System Modules for New Profiles Verification ===");
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

let passed = 0;
let failed = 0;

async function testCase(name, fn) {
    try {
        await fn();
        console.log(`✅ PASS: ${name}`);
        passed++;
    } catch (e) {
        console.error(`❌ FAIL: ${name} - ${e.message}`);
        failed++;
    }
}

async function runAll() {
    // Test 1: Clinico_Anziano
    await testCase("Clinico_Anziano profile produces CLINICAL periodization and warmups", async () => {
        const params = {
            patientType: 'Clinico_Anziano',
            days: '3',
            level: 'Intermediate',
            goal: 'Forza',
            weeks: '4',
            injuries: []
        };
        const program = await ai.generateFullProgram(params);
        assert(program !== null, "Program generated");
        assert(program.periodization.method === 'CLINICAL', "Should select CLINICAL periodization");
        
        // Check warmup in Phase 1 Day 1
        const p1d1 = program.phases[0].schedule[0];
        const warmup = p1d1.exercises.filter(ex => ex.isWarmup);
        assert(warmup.length > 0, "Warmup should be present");
        assert(warmup.some(w => w.name.includes("Cat-Cow Mobilità Spinale")), "Warmup should include spinal mobility");
        
        // Check cooldown in Phase 1 Day 1
        const cooldown = p1d1.exercises.filter(ex => ex.isCardio);
        assert(cooldown.length > 0, "Cooldown should be present");
        assert(cooldown.some(c => c.name.includes("Allungamento Flessori Coscia")), "Cooldown should include hamstring stretch");
    });

    // Test 2: Sedentario
    await testCase("Sedentario profile produces sedentario-specific warmup/cooldown", async () => {
        const params = {
            patientType: 'Sedentario',
            days: '2',
            level: 'Beginner',
            goal: 'Forza',
            weeks: '4',
            injuries: []
        };
        const program = await ai.generateFullProgram(params);
        const p1d1 = program.phases[0].schedule[0];
        
        const warmup = p1d1.exercises.filter(ex => ex.isWarmup);
        assert(warmup.some(w => w.name.includes("Camminata a Passo Svelto")), "Warmup should include Camminata a Passo Svelto");
        
        const cooldown = p1d1.exercises.filter(ex => ex.isCardio);
        assert(cooldown.some(c => c.name.includes("Camminata Defaticante lenta")), "Cooldown should include Camminata Defaticante lenta");
    });

    // Test 3: Calcio
    await testCase("Calcio sport produces soccer-specific warmup/cooldown", async () => {
        const params = {
            patientType: 'Atleta',
            sportPraticato: 'Calcio',
            days: '3',
            level: 'Intermediate',
            goal: 'Forza',
            weeks: '4',
            injuries: []
        };
        const program = await ai.generateFullProgram(params);
        const p1d1 = program.phases[0].schedule[0];
        
        const warmup = p1d1.exercises.filter(ex => ex.isWarmup);
        assert(warmup.some(w => w.name.includes("Corsa a Navetta")), "Warmup should include Corsa a Navetta");
        
        const cooldown = p1d1.exercises.filter(ex => ex.isCardio);
        assert(cooldown.some(c => c.name.includes("Allungamento Adduttori")), "Cooldown should include Allungamento Adduttori");
    });

    // Test 4: Basketball
    await testCase("Basketball sport produces basketball-specific warmup/cooldown", async () => {
        const params = {
            patientType: 'Atleta',
            sportPraticato: 'Basketball',
            days: '3',
            level: 'Intermediate',
            goal: 'Forza',
            weeks: '4',
            injuries: []
        };
        const program = await ai.generateFullProgram(params);
        const p1d1 = program.phases[0].schedule[0];
        
        const warmup = p1d1.exercises.filter(ex => ex.isWarmup);
        assert(warmup.some(w => w.name.includes("Circonduzioni Spalle")), "Warmup should include Circonduzioni Spalle");
        
        const cooldown = p1d1.exercises.filter(ex => ex.isCardio);
        assert(cooldown.some(c => c.name.includes("Allungamento Dorsali al Muro")), "Cooldown should include Allungamento Dorsali al Muro");
    });

    // Test 5: Atletica Leggera
    await testCase("Atletica Leggera sport produces athletics-specific warmup/cooldown", async () => {
        const params = {
            patientType: 'Atleta',
            sportPraticato: 'Atletica Leggera',
            days: '3',
            level: 'Advanced',
            goal: 'Forza',
            weeks: '4',
            injuries: []
        };
        const program = await ai.generateFullProgram(params);
        const p1d1 = program.phases[0].schedule[0];
        
        const warmup = p1d1.exercises.filter(ex => ex.isWarmup);
        assert(warmup.some(w => w.name.includes("Drills di Corsa")), "Warmup should include Drills di Corsa");
        
        const cooldown = p1d1.exercises.filter(ex => ex.isCardio);
        assert(cooldown.some(c => c.name.includes("Stretching Statico Polpacci")), "Cooldown should include Stretching Statico Polpacci");
    });

    console.log(`\n══════════════════════════════════════════════════`);
    console.log(`  RESULTS: ${passed} PASS  /  ${failed} FAIL`);
    if (failed === 0) {
        console.log('  ✅ ALL TESTS PASSED');
        if (global.process) global.process.exit(0);
    } else {
        console.error(`  ❌ ${failed} TESTS FAILED`);
        if (global.process) global.process.exit(1);
    }
}

runAll();
