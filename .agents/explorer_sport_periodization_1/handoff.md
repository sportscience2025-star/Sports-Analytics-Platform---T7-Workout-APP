# R1 (Sport-Specific Periodization Logic) Exploration Report

## 1. Observation
I investigated the AI program generation engine in `js/logic.js`, the user interface wizard in `js/ui.js`, and the exercise/pathology catalog in `js/data.js`. The key code sections observed are detailed below:

### A. Initialization of `WorkoutGeneratorAI`
The class `WorkoutGeneratorAI` is defined globally as `window.WorkoutGeneratorAI` inside an IIFE (Immediately Invoked Function Expression) in `js/logic.js`:
```javascript
// js/logic.js, Line 9-16
window.WorkoutGeneratorAI = class {
    constructor() {
        this.riskLevels = {
            LOW: { color: '#10b981', label: 'Basso Rischio' },
            MEDIUM: { color: '#f59e0b', label: 'Rischio Moderato' },
            HIGH: { color: '#ef4444', label: 'Alto Rischio' }
        };
    }
...
// js/logic.js, Line 725
window.AI = new window.WorkoutGeneratorAI();
```

### B. Execution Path of `generateFullProgram(params)`
The main entry point for program generation is `generateFullProgram(params)` (lines 71-104), which executes the following steps:
1. **Risk Analysis**: `const riskProfile = this.analyzeRiskProfile(params.injuries || []);`
2. **Exercise Classification**: `const classification = this.classifyExercises(exercises, riskProfile.pathologies);`
3. **Equipment Filtering**: Filters valid exercises using `this._checkEquipment(ex, params.equipment)`.
4. **Phase Generation**: Calls `this._generatePhases(params, validExercises, classification, riskProfile)`.
5. **Timeline Generation**: Calls `this._getProgressionTable(params, phases)`.
6. **Return**: Returns a program object with metadata, phase-by-phase schedules, progression tables, and clinical safety notes.

### C. Build Process of Phases and Split Structures
In `_generatePhases` (lines 119-217), phases and split structures are generated. Currently, the phase blueprints are hardcoded as a static array of **6 phases** (totaling 12 weeks):
* For clinical patients (`isClinical = true`), it hardcodes a 6-phase rehabilitation progression (Isometric $\rightarrow$ Eccentric $\rightarrow$ Dynamic) (lines 127-134).
* For athletic/fitness users, it hardcodes 6 phases focusing on GPP $\rightarrow$ Accumulation $\rightarrow$ Peak $\rightarrow$ Test (lines 136-143).
* Split structures are generated per phase using `this._getSplitStructureForPhase(blueprint.id, daysCount, isClinical)` (lines 220-361), which alternates workout splits (e.g., Full Body vs. PPL vs. Upper/Lower) depending on the phase to satisfy the non-consecutiveness and variety rules.

### D. Redundant Double-Formatting and Broken Progression
There is an inconsistency in how exercises are formatted and how progression is applied. In `_generatePhases`, each exercise is processed:
```javascript
// js/logic.js, Line 168-197
day.exercises.forEach(ex => {
    if (ex.isWarmup || ex.isCardio) return;

    // Apply phase-specific progression to sets, reps, and loads
    let sets = parseInt(ex.specs.sets) || 3;
    let reps = ex.specs.reps;
    
    if (blueprint.isDeload) {
        sets = Math.max(2, sets - 1);
    } else if (blueprint.id === 3) {
        sets += 1; // Accumulation: extra volume
    } else if (blueprint.id === 5) {
        // Peak: lower volume, higher intensity
        if (reps.includes('-')) {
            const parts = reps.split('-');
            reps = `${Math.max(1, parseInt(parts[0]) - 2)}-${Math.max(2, parseInt(parts[1]) - 2)}`;
        } else { ... }
    }

    // Re-format specs based on the phase blueprint
    const formattedEx = this._formatExerciseForPhase({ ...ex, specs: { ...ex.specs, sets, reps } }, ex.isMain ? 'Main' : 'Accessory', params, blueprint);
    
    ex.specs = formattedEx.specs;
    ex.isadapted = formattedEx.isadapted;
    ex.note = formattedEx.note;
});
```
However, `_formatExerciseForPhase` (lines 549-598) *completely discards* the incoming `specs.sets` and `specs.reps` and overwrites them with hardcoded values:
```javascript
// js/logic.js, Line 550-577
_formatExerciseForPhase(ex, tier, params, phaseBlueprint) {
    let sets = 3, reps = '10', rest = '90s', rpe = phaseBlueprint.rpeCap || 8, tempo = '2-0-2';
    const isMain = tier === 'Main';
    const goal = params.goal;
    const isDeload = phaseBlueprint.isDeload;

    if (isDeload) {
        sets = 3;
        reps = '12';
        rest = '60-75s';
        rpe = Math.min(rpe, 5);
        tempo = '3-0-3';
    } else if (goal === 'Strength') {
        sets = isMain ? 4 : 3;
        reps = isMain ? '5' : '8';
        ...
```
Furthermore, `_buildDynamicSession` also calls `_formatExerciseForPhase` before returning exercises to the loop, causing redundant double-formatting. Because of this, the sets/reps modifications in the phase generation loop (e.g., volume accumulation in Phase 3 or peak in Phase 5) have **no actual effect** in the final program.

### E. Current Deload Weeks Logic
Currently, deload weeks are forced to:
* `sets = 3`, `reps = '12'` (which increases volume compared to a Strength goal's 5 reps).
* `load = '50-60% RM'` (which drops intensity dramatically).
* `rpe = 5` and `tempo = '3-0-3'` (slowing execution and reducing neuromuscular drive).
This constitutes a traditional, low-load active recovery strategy and does not satisfy the requirements for a high-intensity, low-volume deload.

### F. Wizard UI inputs in `js/ui.js`
In `js/ui.js` (lines 33-507), the wizard captures:
* Patient Type, Experience Level, Days, Equipment, Strength Profile, Cardio Conditioning, Injuries, Pain Scale, Goal, Program Weeks, lifestyle factors (sleep, stress, nutrition, activity).
However, **there is currently no field to capture "Sport Praticato" (Sport Played)**. The UI must be updated to include this dropdown/cards selector.

---

## 2. Logic Chain

### A. Dynamic Program Length Scaling
* **Objective**: Scale program length dynamically to 4, 8, 12, or 16 weeks while tiling load/deload blocks (e.g., 3 weeks load + 1 week deload).
* **Reasoning**:
  * A 4-week block (3 weeks load + 1 week deload) is a standard mesocycle.
  * This matches all options: 4 weeks (1 mesocycle), 8 weeks (2 mesocycles), 12 weeks (3 mesocycles), 16 weeks (4 mesocycles).
  * Rather than using a hardcoded array of 6 phases, we should dynamically generate the blueprints based on `weeks / 4`.
  * For each mesocycle $i$:
    * Load Phase: Weeks $4i - 3$ to $4i - 1$.
    * Deload Phase: Week $4i$.
  * To support this, `_generatePhases` must build the phase blueprints array on the fly.
  * The progression table (`_getProgressionTable`) will naturally scale because it maps directly over the generated phase array.

### B. Integrating "Sport Praticato"
* **Objective**: Allow the user to select Endurance, Sport di Squadra, or Bodybuilding and adjust the generator's results.
* **Reasoning**:
  * We need a new input selector in Step 4 ("Obiettivi") of `renderWizard` in `js/ui.js` for "Sport Praticato", saving it as `sport` in local storage and passing it to the generator.
  * Under the hood, the selected sport should dictate:
    1. **Exercise Selection Priority**: Prioritize movement patterns specific to the sport (rotational/explosive/plyometric for Team Sports; core/single-leg/posterior-chain for Endurance; hypertrophy/bilateral for Bodybuilding). We can score and sort candidate exercises before selection rather than modifying the static database.
    2. **Default Exercise Specifications**: Endurance requires high reps (15-20), low rest (45-60s), and slow controlled tempos (3-0-1). Team Sports require low-to-medium reps (4-6 main, 8-10 accessory), explosive concentric tempos (X-0-X), and long rest (2-3 min) to maximize speed and power output. Bodybuilding follows traditional hypertrophy/strength ranges.

### C. Sports Science Compliant Deload Logic
* **Objective**: Reduce volume by 40-50% in deload weeks while keeping intensity/load high.
* **Reasoning**:
  * A reduction in volume of 40-50% is achieved by reducing the number of sets. For example, if a training set is 4, the deload set should be 2. If it is 3, it should be 2 (a 33% reduction is safer than dropping to 1 set, which might be too low, but we can target $\approx 40\%$ by setting `sets = Math.max(2, Math.floor(sets * 0.6))`).
  * Keeping intensity high means maintaining the %RM or reducing it minimally (e.g. keep the same %RM or reduce by only 5% RM), keeping the RPE high but controlled (RPE 7-7.5 to avoid neurological failure), and keeping the reps the same or slightly lower to manage fatigue.
  * Crucially, this high-intensity deload should only apply to **Athletic** users. **Clinical** patients should retain the existing clinical active recovery deload (low load, low RPE, mobility focused) to ensure tissue healing and decompression.
  * To fix the broken progression and double-formatting issues, all set/rep/load calculations (including base goals, sport overrides, phase-specific progressions, and deload volume/intensity adjustments) should be consolidated directly inside `_formatExerciseForPhase`, which becomes the single source of truth.

---

## 3. Caveats
* **Scope**: I performed a read-only investigation and did not write or edit any source files (e.g., `js/logic.js`, `js/ui.js`, `index.html`) or execute any code.
* **Database Schema**: I assumed that the structure of the exercise database in `js/data.js` remains unchanged, and that we can leverage existing fields like `primaryMuscle`, `muscles`, `quality`, `type`, and text content in names/descriptions to filter and prioritize exercises dynamically.
* **Test coverage**: There are currently no unit tests for the workout generator logic, so verification relies on programmatic testing or manual verification in the UI.

---

## 4. Conclusion & Implementation Plan
Implementing R1 (Sport-Specific Periodization Logic) is highly feasible and requires updating two files: `js/ui.js` and `js/logic.js`. The proposed changes are structured below:

### Step 1: UI Input in `js/ui.js`
1. Add the "Sport Praticato" radio group in Step 4 ("Obiettivi") of `window.App.renderWizard`:
```html
<div class="intake-field-group">
    <label class="intake-label">Sport di Riferimento / Attività</label>
    <div class="intake-cards-grid cols-3">
        <label class="intake-option-card ${(saved.sport||'Bodybuilding')==='Bodybuilding'?'selected':''}">
            <input type="radio" name="sport" value="Bodybuilding" ${(saved.sport||'Bodybuilding')==='Bodybuilding'?'checked':''}><span class="option-icon">🏋️</span><strong>Bodybuilding / Fitness</strong><small>Ipertrofia muscolare e forza estetica</small></label>
        <label class="intake-option-card ${saved.sport==='Endurance'?'selected':''}">
            <input type="radio" name="sport" value="Endurance" ${saved.sport==='Endurance'?'checked':''}><span class="option-icon">🏃</span><strong>Endurance / Corsa / Bici</strong><small>Resistenza aerobica e prevenzione infortuni</small></label>
        <label class="intake-option-card ${saved.sport==='Sport di Squadra'?'selected':''}">
            <input type="radio" name="sport" value="Sport di Squadra" ${saved.sport==='Sport di Squadra'?'checked':''}><span class="option-icon">⚽</span><strong>Sport di Squadra</strong><small>Potenza esplosiva, scatti e agilità</small></label>
    </div>
</div>
```
2. Update the `collectData()` function to extract `sport: get('sport') || 'Bodybuilding'`.
3. Save the `sport` param in the `t7_prog_params` localStorage item.
4. Pass the `sport` parameter into the `params` object inside `generateProgram()`.
5. Update `renderSummary()` to display the selected sport.

### Step 2: Dynamic Weeks and Phase Blueprinting in `js/logic.js`
In `_generatePhases(params, validExercises, classification, riskProfile)`, replace the hardcoded phase blueprints with a dynamic generator loop:
```javascript
const weeksTotal = parseInt(params.weeks) || 12;
const numMesocycles = Math.round(weeksTotal / 4);
const phaseBlueprints = [];

for (let i = 1; i <= numMesocycles; i++) {
    const startWeek = (i - 1) * 4 + 1;
    const endWeek = i * 4;
    
    // Load Phase (Weeks 1-3, 5-7, 9-11, 13-15)
    phaseBlueprints.push(this._getLoadPhaseBlueprint(2 * i - 1, i, `Settimane ${startWeek}-${endWeek - 1}`, params));

    // Deload Phase (Weeks 4, 8, 12, 16)
    phaseBlueprints.push(this._getDeloadPhaseBlueprint(2 * i, i, `Settimana ${endWeek}`, params));
}
```
Create the helpers `_getLoadPhaseBlueprint` and `_getDeloadPhaseBlueprint` (defined in the next section) to return the correct names, focuses, knee ROM limits, and objectives based on `isClinical`, `params.sport`, `params.goal`, and `mesoIndex`.

### Step 3: Sport-Specific Exercise Prioritization in `js/logic.js`
In `_buildDynamicSession`, sort the candidate exercises based on the selected sport before choosing them:
```javascript
// Inside _buildDynamicSession
cands = this._sortCandidatesForSport(cands, params.sport || 'Bodybuilding');
const topCands = cands.slice(0, 3); // Pick from top matches to keep sport focus
const pick = this._pickRandom(topCands, session);
```
Add the sorting helper `_sortCandidatesForSport`:
```javascript
_sortCandidatesForSport(cands, sport) {
    if (sport === 'Endurance') {
        return cands.sort((a, b) => {
            const score = ex => {
                let s = 0;
                const name = (ex.name || '').toLowerCase();
                if (name.includes('plank') || name.includes('monolaterale') || name.includes('single-leg') || name.includes('step-up')) s += 10;
                if (name.includes('core') || name.includes('glutei') || name.includes('rdl') || name.includes('romanian')) s += 5;
                if (ex.type === 'Isometrico') s += 3;
                return s;
            };
            return score(b) - score(a);
        });
    }
    if (sport === 'Sport di Squadra') {
        return cands.sort((a, b) => {
            const score = ex => {
                let s = 0;
                const name = (ex.name || '').toLowerCase();
                if (ex.quality === 'Potenza' || ex.type === 'Potenza') s += 10;
                if (name.includes('jump') || name.includes('swing') || name.includes('esplosivo') || name.includes('plyo') || name.includes('lateral')) s += 8;
                if (name.includes('rotazion') || name.includes('monopodalico')) s += 5;
                return s;
            };
            return score(b) - score(a);
        });
    }
    // Bodybuilding / Default
    return cands.sort((a, b) => {
        const score = ex => {
            let s = 0;
            if (ex.quality === 'Ipertrofia') s += 5;
            if (ex.type === 'Multiarticolare') s += 3;
            return s;
        };
        return score(b) - score(a);
    });
}
```

### Step 4: Consolidated Exercise Specs Formatting in `js/logic.js`
In `_generatePhases`, remove the redundant double-formatting loop and set/rep progressors.
Refactor `_formatExerciseForPhase` to consolidate all base goals, sport overrides, phase progressions, and deload volume reductions:
```javascript
_formatExerciseForPhase(ex, tier, params, phaseBlueprint) {
    let sets = 3, reps = '10', rest = '90s', rpe = phaseBlueprint.rpeCap || 8, tempo = '2-0-2';
    const isMain = tier === 'Main';
    const goal = params.goal;
    const isDeload = phaseBlueprint.isDeload;
    const isClinical = params.patientType === 'Clinico';
    const mesoIndex = Math.floor((phaseBlueprint.id - 1) / 2) + 1;

    // 1. Establish base training specs based on Goal and Sport
    if (goal === 'Strength') {
        sets = isMain ? 4 : 3;
        reps = isMain ? '5' : '8';
        rest = isMain ? '3 min' : '90s';
        tempo = 'X-1-2';
        rpe = Math.min(rpe, isMain ? 9 : 8);
    } else if (goal === 'Hypertrophy') {
        sets = isMain ? 4 : 3;
        reps = isMain ? '8-10' : '10-12';
        rest = isMain ? '90s' : '60s';
        tempo = '2-0-2';
    } else if (goal === 'Power') {
        sets = isMain ? 4 : 3;
        reps = isMain ? '3-5' : '8';
        rest = '2-3 min';
        tempo = 'X-X-X';
    } else if (goal === 'Resistenza' || params.sport === 'Endurance') {
        sets = isMain ? 4 : 3;
        reps = isMain ? '15-20' : '12-15';
        rest = isMain ? '60s' : '45s';
        tempo = '3-0-1';
        rpe = Math.min(rpe, isMain ? 7 : 6);
    }

    // Sport di Squadra overrides for athletic power/RFD
    if (!isClinical && params.sport === 'Sport di Squadra') {
        sets = isMain ? 4 : 3;
        reps = isMain ? '4-6' : '8-10';
        rest = isMain ? '2-3 min' : '90s';
        tempo = isMain ? 'X-0-X' : '2-0-2';
        rpe = Math.min(rpe, 8);
    }

    // 2. Base Load %RM estimation
    let load = '70-75% RM';
    if (params.strengthProfile === 'High') load = '80-85% RM';
    if (params.level === 'Beginner') load = '60-65% RM';
    if (params.sport === 'Endurance' || goal === 'Resistenza') {
        load = params.level === 'Beginner' ? '40-50% RM' : '50-60% RM';
    }

    // 3. Apply Phase-Specific Load/Volume Progression (only for Load weeks)
    if (!isDeload && !isClinical) {
        if (mesoIndex === 2) {
            // Accumulation: add 1 set
            sets += 1; 
        } else if (mesoIndex === 3) {
            // Peak: lower reps, higher load
            if (reps.includes('-')) {
                const parts = reps.split('-');
                reps = `${Math.max(2, parseInt(parts[0]) - 2)}-${Math.max(4, parseInt(parts[1]) - 2)}`;
            } else {
                const val = parseInt(reps);
                if (!isNaN(val)) reps = `${Math.max(2, val - 2)}`;
            }
            rpe = Math.min(rpe + 0.5, 9.5);
            load = this._adjustLoadPct(load, 5); // +5% RM
        } else if (mesoIndex === 4) {
            // Overreach: max intensity
            if (reps.includes('-')) {
                const parts = reps.split('-');
                reps = `${Math.max(2, parseInt(parts[0]) - 2)}-${Math.max(4, parseInt(parts[1]) - 2)}`;
            } else {
                const val = parseInt(reps);
                if (!isNaN(val)) reps = `${Math.max(2, val - 2)}`;
            }
            rpe = Math.min(rpe + 1.0, 9.5);
            load = this._adjustLoadPct(load, 10); // +10% RM
        }
    }

    // 4. Apply Deload adjustments
    if (isDeload) {
        if (isClinical) {
            // Clinical Active Recovery: low load, low RPE, slower tempo
            sets = 3;
            reps = '12';
            rest = '60-75s';
            rpe = Math.min(rpe, 5);
            tempo = '3-0-3';
            load = '50-60% RM';
        } else {
            // Athletic Deload: high intensity, low volume
            // Reduce volume by 40-50% (sets reduced by 40-50%)
            sets = Math.max(2, Math.floor(sets * 0.6)); 
            
            // Reduce reps slightly to manage fatigue
            if (reps.includes('-')) {
                const parts = reps.split('-');
                reps = `${Math.max(2, parseInt(parts[0]) - 2)}-${Math.max(4, parseInt(parts[1]) - 2)}`;
            } else {
                const val = parseInt(reps);
                if (!isNaN(val)) reps = `${Math.max(2, val - 2)}`;
            }
            
            // Keep RPE high but controlled (avoid failure, leave reps in reserve)
            rpe = Math.min(rpe, 7.5);
            
            // Keep load high (training load or slightly lower by 5% RM)
            load = this._adjustLoadPct(load, -5); 
            // Keep rest periods and tempo same as normal training to maintain intensity
        }
    }

    // Apply Knee ROM constraint to specifications notes
    let note = ex.modification || null;
    if (phaseBlueprint.kneeROM < 95 && (ex.primaryMuscle?.includes('Gambe') || ex.muscles?.some(m => m.includes('Gambe')))) {
        note = `⚠️ Limitare flessione ginocchio a ${phaseBlueprint.kneeROM}° max. ` + (note || '');
    }

    return {
        ...ex,
        specs: { sets, reps, rest, rpe, tempo, load },
        isadapted: ex.modification || phaseBlueprint.kneeROM < 95 ? true : false,
        note: note
    };
}

// Utility helper to adjust % RM string
_adjustLoadPct(loadStr, deltaPct) {
    if (!loadStr || !loadStr.includes('%')) return loadStr;
    const parts = loadStr.split('%')[0].split('-');
    if (parts.length === 2) {
        const min = Math.max(40, parseInt(parts[0]) + deltaPct);
        const max = Math.max(45, parseInt(parts[1]) + deltaPct);
        return `${min}-${max}% RM`;
    }
    const val = parseInt(loadStr);
    if (!isNaN(val)) {
        return `${Math.max(40, val + deltaPct)}% RM`;
    }
    return loadStr;
}
```

### Step 5: Update Progression Table Logic in `js/logic.js`
In `_getProgressionTable(params, phases)` (lines 686-716), adapt the display table values using `mesoIndex` rather than static phase IDs:
```javascript
_getProgressionTable(params, phases) {
    return phases.map(phase => {
        const mesoIndex = Math.floor((phase.id - 1) / 2) + 1;
        let vol = "Medio";
        let intensity = "70-75% RM";

        if (phase.isDeload) {
            if (params.patientType === 'Clinico') {
                vol = "Basso";
                intensity = "RPE 5 (Scarico)";
            } else {
                vol = "Basso (Volume -40%)";
                intensity = "Medio-Alta (Intensità Conservata)";
            }
        } else {
            if (mesoIndex === 1) {
                vol = "Moderato";
                intensity = params.patientType === 'Clinico' ? "RPE 6 (Isometria)" : "65-70% RM";
            } else if (mesoIndex === 2) {
                vol = "Alto (Accumulo)";
                intensity = params.patientType === 'Clinico' ? "RPE 7 (Eccentrico)" : "75-80% RM";
            } else if (mesoIndex === 3) {
                vol = "Basso-Medio";
                intensity = params.patientType === 'Clinico' ? "RPE 7.5-8 (Dinamico)" : "80-85% RM (Picco)";
            } else {
                vol = "Basso (Overreach)";
                intensity = params.patientType === 'Clinico' ? "RPE 8.5 (Funzionale)" : "85-90% RM (Massimo)";
            }
        }

        return {
            weeks: phase.weeks,
            phase: phase.name.split(':')[1].trim(),
            vol: vol,
            int: intensity,
            note: phase.focus
        };
    });
}
```

---

## 5. Verification Method
To verify the implementation of R1 independently:

### A. Automatic Test Script
Create a new Node.js test file `test_logic.js` at the root of the project that runs the workout generator programmatically and asserts the outputs:
```javascript
/**
 * test_logic.js
 * Programmatic test script verifying R1 (Sport-Specific Periodization Logic)
 */
const assert = require('assert').strict;

// Mock window and global environment
global.window = {};
global.localStorage = {
    getItem: () => null,
    setItem: () => null
};

// Load dependencies
require('./js/data.js');
require('./js/logic.js');

const ai = window.AI;

function testDynamicScaling() {
    console.log('Testing program length dynamic scaling...');
    [4, 8, 12, 16].forEach(weeks => {
        const program = ai.generateFullProgram({
            days: 3,
            goal: 'Hypertrophy',
            level: 'Intermediate',
            equipment: 'Full',
            patientType: 'Atleta',
            weeks: weeks.toString()
        });

        // 1. Check metadata
        assert.equal(program.meta.weeks.toString(), weeks.toString());

        // 2. Check total weeks in phases matches expectations
        const totalWeeksInPhases = program.phases.reduce((sum, phase) => {
            if (phase.weeks.includes('-')) {
                const parts = phase.weeks.match(/\d+/g);
                return sum + (parseInt(parts[1]) - parseInt(parts[0]) + 1);
            }
            return sum + 1; // single week deload
        }, 0);
        assert.equal(totalWeeksInPhases, weeks, `Expected phase weeks sum to equal ${weeks}`);
        
        // 3. Check load/deload tiling (odd are load, even are deload)
        program.phases.forEach((phase, index) => {
            const isDeloadExpected = (index % 2 === 1);
            assert.equal(phase.isDeload, isDeloadExpected, `Phase at index ${index} should have isDeload = ${isDeloadExpected}`);
        });
    });
    console.log('✅ Dynamic scaling tests passed.');
}

function testHighIntensityDeload() {
    console.log('Testing athletic high-intensity low-volume deload...');
    const program = ai.generateFullProgram({
        days: 3,
        goal: 'Strength',
        level: 'Intermediate',
        equipment: 'Full',
        patientType: 'Atleta',
        weeks: '12'
    });

    const loadPhase = program.phases[0];   // Phase 1 (Load)
    const deloadPhase = program.phases[1]; // Phase 2 (Deload)

    // Select same day / exercise to compare
    const loadDay = loadPhase.schedule[0];
    const deloadDay = deloadPhase.schedule[0];

    const loadMainEx = loadDay.exercises.find(e => !e.isWarmup && !e.isCardio && e.name.toLowerCase().includes('squat'));
    const deloadMainEx = deloadDay.exercises.find(e => !e.isWarmup && !e.isCardio && e.name.toLowerCase().includes('squat'));

    if (loadMainEx && deloadMainEx) {
        // Volume (sets) must be reduced by 40-50%
        const loadSets = loadMainEx.specs.sets;
        const deloadSets = deloadMainEx.specs.sets;
        assert.ok(deloadSets < loadSets, `Deload sets (${deloadSets}) should be less than load sets (${loadSets})`);
        assert.ok(deloadSets >= 2, 'Deload sets should be at least 2');

        // Intensity must remain high
        const deloadLoad = deloadMainEx.specs.load;
        assert.ok(deloadLoad.includes('% RM'), 'Deload load should still be written in % RM');
        const pctMatch = deloadLoad.match(/\d+/);
        if (pctMatch) {
            const pctVal = parseInt(pctMatch[0]);
            assert.ok(pctVal >= 60, `Deload load intensity (${pctVal}%) must remain high (>=60% RM)`);
        }
        
        // RPE must remain controlled but high
        assert.ok(deloadMainEx.specs.rpe >= 6 && deloadMainEx.specs.rpe <= 7.5, `Deload RPE (${deloadMainEx.specs.rpe}) must remain high but controlled`);
    }
    console.log('✅ High-intensity deload tests passed.');
}

function testSportSpecificSelection() {
    console.log('Testing sport-specific exercise selection and specs...');
    
    // 1. Endurance Program
    const enduranceProg = ai.generateFullProgram({
        days: 3,
        goal: 'Resistenza',
        level: 'Intermediate',
        equipment: 'Full',
        patientType: 'Atleta',
        sport: 'Endurance',
        weeks: '8'
    });
    
    // Check that endurance programs default to high reps and lower rest
    enduranceProg.phases[0].schedule[0].exercises.forEach(ex => {
        if (!ex.isWarmup && !ex.isCardio) {
            const reps = ex.specs.reps;
            assert.ok(reps.includes('15') || reps.includes('12') || reps.includes('20'), `Endurance reps (${reps}) should be high`);
            assert.ok(ex.specs.rest === '60s' || ex.specs.rest === '45s', `Endurance rest (${ex.specs.rest}) should be short`);
        }
    });

    // 2. Team Sports Program
    const teamSportsProg = ai.generateFullProgram({
        days: 3,
        goal: 'Power',
        level: 'Intermediate',
        equipment: 'Full',
        patientType: 'Atleta',
        sport: 'Sport di Squadra',
        weeks: '8'
    });

    // Check that team sports programs have explosive tempo and longer rest
    const mainEx = teamSportsProg.phases[0].schedule[0].exercises.find(e => !e.isWarmup && !e.isCardio);
    if (mainEx) {
        assert.equal(mainEx.specs.tempo, 'X-0-X', 'Team sports main exercise tempo should be explosive (X-0-X)');
        assert.equal(mainEx.specs.rest, '2-3 min', 'Team sports main exercise rest should be long (2-3 min)');
    }
    
    console.log('✅ Sport-specific tests passed.');
}

// Run tests
try {
    testDynamicScaling();
    testHighIntensityDeload();
    testSportSpecificSelection();
    console.log('\n⭐ ALL R1 EXPLORATION TESTS PASSED SUCCESSFULLY! ⭐');
} catch (e) {
    console.error('\n❌ TEST FAILED:', e.message);
    process.exit(1);
}
```

### B. Execution
Run the verification script from the terminal:
```powershell
node test_logic.js
```
The implementation is validated if all assertions run and output `ALL R1 EXPLORATION TESTS PASSED SUCCESSFULLY!`.

### C. Invalidation Conditions
The verification fails and R1 is considered broken if:
1. The generated phase weeks do not add up to the requested number of weeks (4, 8, 12, or 16).
2. Any athletic deload week sets are equal to or greater than the load week sets.
3. Any athletic deload week intensity drops below 60% RM or forces 12 reps on strength goals.
4. "Sport di Squadra" exercises do not use explosive tempo parameters or "Endurance" does not use high repetitions.
5. Pathologies selected do not filter out excluded movements.
