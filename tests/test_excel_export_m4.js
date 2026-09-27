/**
 * Test Suite: ExcelJS Export Upgrade Stress & Edge Case Verification (Milestone 4)
 */

(function () {
    console.log("=== STARTING MILESTONE 4 EXCEL EXPORT EMPIRICAL STRESS TESTS ===");

    let testsPassed = 0;
    let testsFailed = 0;
    const failures = [];

    function assert(condition, message) {
        if (condition) {
            console.log(`✅ [PASS] ${message}`);
            testsPassed++;
        } else {
            console.error(`❌ [FAIL] ${message}`);
            testsFailed++;
            failures.push(message);
        }
    }

    async function runTests() {
        if (typeof ExcelJS === 'undefined') {
            console.error("ExcelJS library is missing in window environment!");
            if (typeof process !== 'undefined' && process.exit) process.exit(1);
            return;
        }

        // -------------------------------------------------------------
        // TEST 1: Multi-line notes and long exercise names (>60 chars)
        // -------------------------------------------------------------
        console.log("\n--- Scenario 1: Multi-line notes & long exercise names (>60 chars) ---");
        try {
            const longName = "Panca Piana Con Bilanciere E Inclinazione A 30 Gradi Con Fermo Al Petto Di 2 Secondi E Concentrica Esplosiva Per Max Reclutamento";
            const multiLineNote = "Line 1: Mantieni l'addome contratto.\nLine 2: Fermo 2 sec al petto.\nLine 3: Spingi in modo esplosivo.";

            const mockResult1 = {
                meta: { level: 'Advanced', patientType: 'Atleta', goal: 'Strength', weeks: 4, days: 3 },
                phases: [{
                    name: 'Fase 1: Forza Massima',
                    weeks: '1-4',
                    focus: 'Forza Submassimale',
                    objective: 'Sviluppo forza',
                    schedule: [{
                        name: 'Giorno 1',
                        exercises: [{
                            name: longName,
                            type: 'Principale',
                            specs: { sets: 4, reps: 5, rest: '180s', rpe: 8, tempo: '3-1-X-0', load: '85%' },
                            note: multiLineNote
                        }]
                    }]
                }]
            };

            const wb1 = new ExcelJS.Workbook();
            // Call internal ExcelJS generator logic manually or via function
            await _exportWithExcelJS(mockResult1);
            assert(true, "Scenario 1 executed without uncaught exceptions");
        } catch (err) {
            assert(false, `Scenario 1 failed with error: ${err.message}`);
        }

        // -------------------------------------------------------------
        // TEST 2: Undefined or missing specs fields
        // -------------------------------------------------------------
        console.log("\n--- Scenario 2: Undefined / missing specs fields ---");
        try {
            const mockResult2 = {
                meta: { level: undefined, patientType: null, goal: 'undefined' },
                phases: [{
                    name: 'Fase 1',
                    schedule: [{
                        name: 'Giorno 1',
                        exercises: [
                            { name: 'Stacco', specs: {} }, // Empty specs
                            { name: 'Affondi', specs: { sets: undefined, reps: null, rest: 'undefined', rpe: '', load: 'null' } }, // undefined/null strings
                            { name: 'Plank' } // No specs property at all
                        ]
                    }]
                }]
            };

            // Inspect how safeVal converts missing values
            await _exportWithExcelJS(mockResult2);
            assert(true, "Scenario 2 executed without throwing uncaught exceptions");
        } catch (err) {
            assert(false, `Scenario 2 failed with error: ${err.message}`);
        }

        // -------------------------------------------------------------
        // TEST 3: 5+ phases and long phase names (>31 chars with collision)
        // -------------------------------------------------------------
        console.log("\n--- Scenario 3: 5+ phases with long phase names (>31 chars) ---");
        try {
            // Test 3a: 5 phases with distinct long names (>31 chars) sharing same prefix
            const longPrefix = "Fase 1: Accumulazione Ipertrofica Clinica "; // 42 chars prefix
            const mockResult3Collision = {
                meta: { level: 'Intermediate', goal: 'Hypertrophy' },
                phases: [
                    { name: longPrefix + "Blocco A", schedule: [] },
                    { name: longPrefix + "Blocco B", schedule: [] },
                    { name: longPrefix + "Blocco C", schedule: [] },
                    { name: longPrefix + "Blocco D", schedule: [] },
                    { name: longPrefix + "Blocco E", schedule: [] }
                ]
            };

            let duplicateNameCaught = false;
            try {
                await _exportWithExcelJS(mockResult3Collision);
            } catch (err) {
                duplicateNameCaught = true;
                console.warn(`⚠️ [BUG DETECTED] Duplicate sheet name collision when phase names exceed 31 chars: "${err.message}"`);
            }

            if (duplicateNameCaught) {
                assert(false, "EXCELJS CRASH BUG DETECTED: 5+ phases with long names (>31 chars) sharing same first 31 chars cause duplicate worksheet name exception in ExcelJS!");
            } else {
                assert(true, "5+ phases with long names processed without duplicate sheet name errors");
            }
        } catch (err) {
            assert(false, `Scenario 3 unexpected exception: ${err.message}`);
        }

        // -------------------------------------------------------------
        // TEST 4: Deload phases and rest days
        // -------------------------------------------------------------
        console.log("\n--- Scenario 4: Deload phases & Rest days ---");
        try {
            const mockResult4 = {
                meta: { level: 'Intermediate', goal: 'Hypertrophy' },
                phases: [{
                    name: 'Fase 4: Deload / Scarico Attivo',
                    weeks: '4',
                    focus: 'Recupero Neurale',
                    schedule: [
                        { name: 'Giorno 1', isRest: true },
                        {
                            name: 'Giorno 2',
                            exercises: [{ name: 'Leg Extension Light', isWarmup: true, specs: { sets: 2, reps: 15 } }]
                        },
                        { name: 'Giorno 3', isRest: true }
                    ]
                }]
            };

            await _exportWithExcelJS(mockResult4);
            assert(true, "Scenario 4 processed deload phases & rest days successfully");
        } catch (err) {
            assert(false, `Scenario 4 failed with error: ${err.message}`);
        }

        // -------------------------------------------------------------
        // TEST 5: Adapted exercises (adaptedFrom, adaptationReason)
        // -------------------------------------------------------------
        console.log("\n--- Scenario 5: Adapted exercises (adaptedFrom, adaptationReason) ---");
        try {
            const mockResult5 = {
                meta: { level: 'Intermediate', goal: 'Rehab' },
                phases: [{
                    name: 'Fase 1: Riabilitazione',
                    schedule: [{
                        name: 'Giorno 1',
                        exercises: [{
                            name: 'Leg Press 45°',
                            isadapted: true,
                            adaptedFrom: 'Squat Bilanciere',
                            adaptationReason: 'Sostituito per Ernia del Disco L4-L5: riduzione carico assiale sulla colonna',
                            specs: { sets: 3, reps: 10, rest: '90s' }
                            // note is missing/undefined!
                        }]
                    }]
                }]
            };

            await _exportWithExcelJS(mockResult5);
            assert(true, "Scenario 5 executed without uncaught exceptions");
        } catch (err) {
            assert(false, `Scenario 5 failed with error: ${err.message}`);
        }

        console.log("\n=== TEST SUITE SUMMARY ===");
        console.log(`Passed: ${testsPassed} | Failed: ${testsFailed}`);

        if (typeof process !== 'undefined' && process.exit) {
            process.exit(testsFailed === 0 ? 0 : 1);
        }
    }

    runTests();
})();
