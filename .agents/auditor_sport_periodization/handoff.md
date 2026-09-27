# Forensic Audit Report — Sport Periodization Implementation

**Work Product**: Sport Periodization module (`js/logic.js`, `js/ui.js`, `index.html`, and `test_logic.js`)
**Profile**: General Project
**Verdict**: CLEAN

---

## 1. Observations

### R1. Sport-Specific Periodization Logic
- **Dynamic Weeks**: Weeks are calculated dynamically in `js/logic.js:136-137`:
  ```javascript
  const weeksTotal = parseInt(params.weeks) || 12;
  const numPhases = Math.ceil(weeksTotal / 4) * 2;
  ```
  Phases alternate between load (odd) and deload (even), with the week mapping computed dynamically in `js/logic.js:139-148`:
  ```javascript
  const getWeeksString = (id) => {
      if (id % 2 === 1) {
          const start = (id - 1) * 2 + 1;
          const end = (id - 1) * 2 + 3;
          return `Settimane ${start}-${end}`;
      } else {
          const w = id * 2;
          return `Settimana ${w}`;
      }
  };
  ```
- **Endurance Cap and Multi-Joint Prioritization**: If the sport is Endurance, the training frequency is limited to 1-2 days per week, and isolation exercises are filtered out. Heavy load (85% RM), low reps (5), and controlled tempo (3-1-1) are enforced (`js/logic.js:92-93`, `503-508`, `595-601`):
  ```javascript
  const sport = params.sportPraticato || params.sport;
  const isEndurance = !isClinical && sport === 'Endurance';
  const daysCount = isEndurance ? Math.min(2, parseInt(params.days) || 2) : parseInt(params.days) || 3;
  ...
  if (isEndurance) {
      const onlyCompounds = cands.filter(ex => ex.type === 'Multiarticolare');
      if (onlyCompounds.length > 0) {
          cands = onlyCompounds;
      }
  }
  ...
  if (isEndurance) {
      sets = isMain ? 4 : 3;
      reps = '5';
      rest = '2.5 min';
      tempo = '3-1-1';
      load = '85% RM';
      rpe = 8.5;
  }
  ```
- **Bodybuilding Configuration**: Hypertrophy parameters (reps = 10, load = 75% RM, rest = 75s) are applied and isolation exercises are allowed (`js/logic.js:602-608`).
- **Deload Volume Drop**: In deload phases, the number of sets is reduced to 60% of the preceding load phase sets (a 40% reduction in volume), and the load is reduced by a small 5% margin to maintain high intensity, with RPE capped at 7.5 (`js/logic.js:654-658`, `666-670`):
  ```javascript
  let precedingSets = sets;
  if (phaseId === 4 || phaseId === 8) {
      precedingSets += 1;
  }
  sets = Math.max(2, Math.floor(precedingSets * 0.6));
  ...
  const val = Math.max(10, parseInt(load) - 5);
  load = `${val}% RM`;
  rpe = 7.5;
  ```

### R2. Coach-Friendly Unlocked Excel Export
- In `js/ui.js:1009-1130`, `_exportProgramToExcel` creates sheets for general info, timeline, individual phases, and explanations using SheetJS (`XLSX`). The sheets are exported as a flat grid structure without any protection, password, or cell locking.

### R3. AI Technical Explanations
- In `js/logic.js:814-868`, `_generateTechnicalExplanations` dynamically compiles a list of explanations for the periodization structure, sport selections, and clinical constraints. These are displayed in the UI result screen and exported in a separate tab in Excel.

### R4. Wizard UI Update
- In `js/ui.js:97-110`, a card grid selector was added to the intake wizard (Step 1) to capture the sport selection (`sportPraticato`), toggleable depending on whether the subject type is "Atleta".

### R5. Test Execution
- Executing `test_logic.js` using Node.js completes successfully with all 6 dynamic test blocks passing:
  ```
  === Running WorkoutGeneratorAI Tests ===
  --- Testing Dynamic Program Weeks ---
  ✅ Success: Weeks 4 yielded 2 phases.
  ✅ Success: Weeks 8 yielded 4 phases.
  ✅ Success: Weeks 12 yielded 6 phases.
  ✅ Success: Weeks 16 yielded 8 phases.
  --- Weeks test passed successfully ---
  ...
  --- All tests passed successfully! ---
  ```
- No hardcoded test passes or fake results exist in `test_logic.js` or `js/logic.js`. The assertions compute values dynamically (e.g. calculating set drop percentages: `(p3AvgSets - p4AvgSets) / p3AvgSets` which results in a `42.1%` drop).

---

## 2. Logic Chain

1. **Authenticity of Implementation**: The logic of `js/logic.js` maps inputs (weeks, sport, goal, level) directly to outputs. Biomechanical variables like volume (sets), load, tempo, and exercise constraints are adjusted dynamically.
2. **Absence of Hardcoded Results**: The test script `test_logic.js` imports `js/logic.js` and validates the actual program generated on-the-fly, confirming that the structures are dynamically constructed.
3. **Unlocked Excel Integrity**: Code review of `_exportProgramToExcel` confirms there are no `.protect` or cell-locking properties used, producing a fully unlocked, coach-friendly sheet.
4. **Conclusion**: Since the implementation matches all requirements dynamically without shortcutting or hardcoding results, it is CLEAN under Development Mode.

---

## 3. Caveats

1. **System Environment**: Node.js was not globally available in the standard system PATH. The tests were run using a local `node.exe` discovered in `C:\Program Files\RStudio\resources\app\bin\node\node.exe`.
2. **Hanging Bug in VBT Stress Tests**: During VBT regression edge cases stress testing (`test_regression_edge_cases.js`), Test 11 ("Extremely high weights") causes an infinite/very long loop. This is due to `_findEmpiricalPmaxLoad` in `js/physics-engine.js` using a hardcoded `0.5` increment step to scan between extremely high ranges (e.g., `1e10` to `2e10`), requiring 20 billion iterations. This was flagged but did not block the audit of the sport periodization implementation.
3. **VBT Header Parser Discrepancy**: In `test_load_velocity.js` Section 9, two tests fail (`Jump "H (cm)" → jumpHeight` and `Jump "TC (s)" → contactTime`) because both the real `js/parser.js` and the test simulation map headers using strict equality checks (`lower === 'h'` / `lower === 'tc'`) which fails when headers contain units like `'h (cm)'` and `'tc (s)'`. This belongs to a prior VBT module and does not impact the Periodization module under audit.

---

## 4. Conclusion

The sport periodization module is authentic, fully dynamic, and implements all requested features (sport periodization models, volume/intensity scaling in deload, unlocked Excel sheet structure, wizard UI sport capture, and dynamic technical explanations). No hardcoded cheats or facade implementations are present. **Verdict: CLEAN**.

---

## 5. Verification Method

To verify the audit results independently:
1. Run the test script `test_logic.js` using a Node.js runtime:
   ```powershell
   & "C:\Program Files\RStudio\resources\app\bin\node\node.exe" test_logic.js
   ```
2. Inspect `js/logic.js` at lines 136-148 to verify dynamic week/phase mapping.
3. Inspect `js/ui.js` at lines 1009-1130 to verify that no sheet protection is active during Excel export.
