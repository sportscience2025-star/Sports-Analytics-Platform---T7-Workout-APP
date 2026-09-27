## 2026-06-16T11:32:07Z
You are teamwork_preview_worker. Your working directory is e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_sport_periodization.
Your task is to implement the follow-up requirements R1, R2, R3, and R4 in the codebase.

### MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

### Files to Modify:
1. `js/logic.js` (AI program generation engine)
2. `js/ui.js` (UI wizard, Excel export, explanations rendering)
3. `index.html` (add styling or adjust wizard script loads if needed)

### Detailed Implementation Requirements:

#### R1. Sport-Specific Periodization Logic (in `js/logic.js`):
1. **Dynamic Program Weeks (4, 8, 12, 16 weeks)**:
   - Instead of the hardcoded 12-week blueprint, dynamically calculate the mesocycles based on `weeksTotal = parseInt(params.weeks) || 12`.
   - Each mesocycle is a 4-week block composed of 3 weeks load + 1 week deload.
   - Map weeks as follows:
     - **4 Weeks**: 1 mesocycle. Phase 1 (Weeks 1-2 load, 2 weeks), Phase 2 (Week 3 load, 1 week), Phase 3 (Week 4 deload, 1 week). Wait, to keep it simple, tile them as: Phase 1 (Weeks 1-3 load), Phase 2 (Week 4 deload). If the total weeks is 4, we have Phase 1 (3 weeks) and Phase 2 (1 week).
     - **8 Weeks**: Phase 1 (Weeks 1-3 load), Phase 2 (Week 4 deload), Phase 3 (Weeks 5-7 load), Phase 4 (Week 8 deload).
     - **12 Weeks**: Phase 1 (Weeks 1-3 load), Phase 2 (Week 4 deload), Phase 3 (Weeks 5-7 load), Phase 4 (Week 8 deload), Phase 5 (Weeks 9-11 load), Phase 6 (Week 12 deload).
     - **16 Weeks**: Phase 1 (Weeks 1-3 load), Phase 2 (Week 4 deload), Phase 3 (Weeks 5-7 load), Phase 4 (Week 8 deload), Phase 5 (Weeks 9-11 load), Phase 6 (Week 12 deload), Phase 7 (Weeks 13-15 load), Phase 8 (Week 16 deload).
   - Dynamically build the `phaseBlueprints` array inside `_generatePhases` based on `weeks` count. Tile 3-week load and 1-week deload blocks.
   - For clinical patients, map similarly but use clinical phase names and focuses. For 16 weeks clinical, append Phase 7 (Weeks 13-15: Forza Funzionale & Propriocezione Avanzata) and Phase 8 (Week 16: Ritorno all'Attività & Scarico). For 4 weeks clinical, generate Phase 1 (Weeks 1-3) and Phase 2 (Week 4).
2. **"Sport Praticato" Logic**:
   - Support `Endurance`, `Bodybuilding`, and `Sport di Squadra` parameters.
   - **Endurance**:
     - Override training frequency `daysCount` to be 1-2 sessions/week (e.g. `Math.min(2, parseInt(params.days) || 2)`).
     - Prioritize functional multi-joint exercises (e.g. Squat, Deadlift, Romanian Deadlift, Press, Pull-ups). Filter or score multi-joint exercises higher and avoid/exclude isolation/hypertrophy exercises (e.g. Leg Extension, Bicep Curls).
     - Generate specs: low reps (3-6 reps), heavy loads (>85% 1RM), 3-4 sets, longer rest (2-3 min) to recover, controlled tempo (e.g., 3-1-1). Avoid high-volume hypertrophy ranges.
   - **Bodybuilding**:
     - Prioritize isolation exercises (e.g., Leg Extension, Lateral Raises, Arm curls) and traditional hypertrophy splits.
     - Generate specs: moderate loads (70-80% RM), high volume (8-12 reps), 3-4 sets, shorter rest (60-90s).
   - **Sport di Squadra** (Team Sports):
     - Prioritize explosive power, unilateral work, and plyometrics (e.g. jumps, swings).
     - Generate specs: explosive tempo (e.g., X-0-X or X-0-1), 60-80% RM loads, 4-6 reps for main lifts and 8-10 for accessories, 2-3 min rest.
3. **Sports Science Compliant Deloads**:
   - For Athletic users: during deload weeks, volume (sets) must drop by 40-50% (e.g., `sets = Math.max(2, Math.round(sets * 0.5))` or `Math.max(2, Math.floor(sets * 0.6))`) compared to preceding load weeks, while maintaining intensity/load (keep the same %RM or reduce by only 5% RM, keep RPE high but controlled at 7-7.5, and keep reps the same or slightly lower, rather than increasing them to 12).
   - For Clinical patients: retain traditional active recovery deloads (low load, low RPE, mobility-focused) to facilitate tissue healing.
4. **Double-Formatting Bug**:
   - Ensure all sets, reps, loads, tempos, and rests are formatted and progressed in a single place (`_formatExerciseForPhase`) as the single source of truth, rather than being overwritten or discarded.

#### R2. Coach-Friendly Unlocked Excel Export (in `js/ui.js`):
- Rewrite `_exportProgramToExcel(result)` to generate a native `.xlsx` file using SheetJS (`XLSX` which is loaded globally in `index.html` on line 95).
- Structure:
  - Sheet 1: **Info Generali** (Flat list of client parameters, sport, goal, pathology list, no merged cells).
  - Sheet 2: **Timeline** (Macrocycle overview: Fase, Settimane, Volume, Intensità, Focus).
  - Sheet 3+: **Fase 1**, **Fase 2**, etc. (One sheet per phase. Vertical layout of days. Columns: `Esercizio`, `Serie`, `Ripetizioni`, `Carico`, `Note Coach`). No merged cells.
  - Sheet Last: **Spiegazioni Tecniche** (List category, title, and AI explanation text).
- Ensure the sheet is completely unlocked (no sheets or cells are protected/password-locked).

#### R3. AI Technical Explanations (in `js/logic.js` & `js/ui.js`):
- Add `_generateTechnicalExplanations(params)` in `WorkoutGeneratorAI` returning an array of `{ category, title, text }` explaining specific non-intuitive programming choices based on selected sport, goal, and pathologies (e.g., why multi-joint high-load is used for endurance, why explosive tempo is used for team sports, why isometrics are used for clinical knee pathologies).
- Append explanations in `generateFullProgram` return object as `explanations`.
- Display explanations in the UI under the timeline table in a section: `🧠 Spiegazione Tecnica della Programmazione (R3)`.
- Style it so it is readable and formats cleanly in PDF/print mode (it must NOT be hidden under `@media print`).
- Export explanations in the "Spiegazioni Tecniche" sheet of the Excel workbook.

#### R4. Wizard UI Update (in `js/ui.js` & `index.html`):
- Add the dropdown or radio-group "Sport Praticato" (Endurance, Sport di Squadra, Bodybuilding) in Step 1 of the Wizard in `js/ui.js`.
- Show the field ONLY when Subject Type ("Tipo di Soggetto") is "Atleta / Fitness" (or "Atleta"). Hide it if "Clinico" or "Senior" is selected.
- Update `collectData()` to fetch the sport field, save it to `localStorage` (in the `t7_prog_params` object as `sportPraticato`), and pass it to the generator params.

### Verification and Verification Tests:
1. Write a programmatic verification script `test_logic.js` at the project root to run Node.js-based tests verifying the dynamic week scaling, deload volume drops, and sport-specific repetitions/loads.
2. Run `node test_logic.js` and verify it passes.
3. Run the existing tests: `node test_parsing.js`, `node test_analysis.js`, `node test_load_velocity.js` to ensure zero regressions.
4. Provide the test outputs and verification results in your handoff report.
