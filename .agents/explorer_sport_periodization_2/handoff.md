# Handoff Report — Excel Export and Wizard UI Update

This report details the findings and implementation strategy for updating the UI Wizard (adding "Sport Praticato" and handling weeks dynamically) and the Excel Export function (converting it to a clean, simple, unlocked grid structure using SheetJS).

## 1. Observations

### 1.1 Excel Export Logic
- **File & Location**: `js/ui.js` line 943 to 1086 (function `_exportProgramToExcel(result)`).
- **Current Mechanism**:
  - The code compiles a raw string in Microsoft XML SpreadsheetML format.
  - It defines a list of `<Styles>` (e.g. `sTitle`, `sLabel`, `sNote`, `sH`, `sD`, `sPhaseTitle`, `sDayHeader`, `sWarmup`, `sCardio`) and merges cells across columns (e.g., `ss:MergeAcross="8"` for phase title on line 992 and day header on line 1005).
  - It creates a Blob with MIME type `application/vnd.ms-excel;charset=UTF-8` and triggers a download with a `.xls` extension (line 1081):
    ```javascript
    a.download = `Programma_${goalName}_${dateStr}.xls`;
    ```
- **External Libraries**: `index.html` loads SheetJS (xlsx.full.min.js) globally on line 95:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>
  ```
  However, `_exportProgramToExcel` does not use the `XLSX` global variable. It manually writes XML strings.

### 1.2 Wizard UI Weeks Parameter
- **File & Location**: `js/ui.js` lines 208 to 212.
- **Status**: The input options for weeks (4, 8, 12, 16) are already defined in the wizard template as a radio option cards grid:
  ```javascript
  ${[['4','4 settimane','Sprint rapido'],['8','8 settimane','Ciclo standard'],['12','12 settimane','Pianificazione completa'],['16','16 settimane','Prep. avanzata']].map(([v,la,desc])=>`<label class="intake-option-card compact ${(saved.weeks||'12')===v?'selected':''}"><input type="radio" name="weeks" value="${v}" ${(saved.weeks||'12')===v?'checked':''}><strong>${la}</strong><small>${desc}</small></label>`).join('')}
  ```
- **Limitation**: The program generator engine in `js/logic.js` (line 71, `generateFullProgram(params)`) gets `params.weeks` but the actual periodization phase generation (lines 127-143) is hardcoded with fixed 12-week phases:
  - Phase 1: Weeks 1-3
  - Phase 2: Week 4
  - Phase 3: Weeks 5-7
  - Phase 4: Week 8
  - Phase 5: Weeks 9-11
  - Phase 6: Week 12

### 1.3 Wizard UI "Sport Praticato"
- **Status**: Currently, there is no dropdown or field group for "Sport Praticato" in `index.html` or `js/ui.js`.
- **Collector**: `collectData()` in `js/ui.js` (lines 364-383) collects parameters, but lacks a sport parameter.

---

## 2. Logic Chain

### 2.1 Transitioning to SheetJS (xlsx)
1. **Observation**: SheetJS (`window.XLSX`) is already loaded in `index.html` (line 95) and used in `js/parser.js` (line 167) for reading.
2. **Problem**: Manual SpreadsheetML XML strings saved with a `.xls` extension trigger Microsoft Excel security alerts ("The file format and extension of ... don't match") because modern Excel treats HTML/XML tables with `.xls` extensions as suspicious. The current layout also uses merged cells and custom styling that makes copy-pasting or sorting difficult for coaches.
3. **Solution**: Rewrite `_exportProgramToExcel(result)` using `XLSX.utils.book_new()`, `XLSX.utils.aoa_to_sheet()`, and `XLSX.writeFile()` to write a native `.xlsx` file. A native `.xlsx` file will open without security warnings, and SheetJS worksheets are completely unlocked/unprotected by default, solving the coach friendliness requirement (R2).
4. **Proposed Grid Layout**:
   - Tab 1: **Info Generali** (Flat, unmerged rows listing client level, objective, sport, equipment, and pathlogy list).
   - Tab 2: **Timeline Periodizzazione** (A table showing Phase, Weeks, Volume, Intensity, and Focus).
   - Tab 3+: **Fase 1, Fase 2, etc.** (One sheet per Phase).
     - Each sheet lists training days vertically.
     - Column Headers: `Esercizio`, `Serie`, `Ripetizioni`, `Carico`, `Note Coach`.
     - No merged cells. Days are introduced by a simple row, followed by header and the list of exercises, then an empty row. This is clean, tabular, and print-ready.

### 2.2 Implementing Dynamic Periodization Weeks
1. **Observation**: `params.weeks` is collected by the wizard but ignored during phase structure definition.
2. **Solution**: Create a dynamic week allocation structure in `js/logic.js` to distribute 4, 8, 12, or 16 weeks across the 6 phases.
3. **Allocation Strategy**:
   - **4 Weeks**: Phase 1 (2w), Phase 3 (1w), Phase 5 (1w). Deload phases (2, 4, 6) are allocated 0 weeks and filtered out.
   - **8 Weeks**: Phase 1 (2w), Phase 2 (1w), Phase 3 (2w), Phase 4 (1w), Phase 5 (1w), Phase 6 (1w).
   - **12 Weeks**: Phase 1 (3w), Phase 2 (1w), Phase 3 (3w), Phase 4 (1w), Phase 5 (3w), Phase 6 (1w).
   - **16 Weeks**: Phase 1 (4w), Phase 2 (1w), Phase 3 (4w), Phase 4 (1w), Phase 5 (4w), Phase 6 (2w).
4. **Implementation**:
   - Dynamically build the `phaseBlueprints` in `_generatePhases` based on a lookup dictionary mapping the selected weeks parameter. Filter out phases with `0` weeks.

### 2.3 Integrating "Sport Praticato"
1. **Observation**: Currently missing from Step 1 "Chi sei?".
2. **Solution**:
   - Add a dropdown group in Step 1 under the "Esperienza di Allenamento" group.
   - Dynamically toggle visibility of this field: show it only if "Tipo di Soggetto" (patientType) is selected as "Atleta".
   - Collect it in `collectData()` as `sportPraticato` and store it in `localStorage` and `params`.
   - Update `_formatExerciseForPhase` in `js/logic.js` to adjust training specs (sets, reps, rest, load, and tempo) depending on the sport:
     - **Bodybuilding**: Hypertrophy focus (moderate reps, 8-12, standard tempo).
     - **Endurance**: High-rep muscular endurance (12-20 reps, shorter rest, slow eccentric tempo).
     - **Sport di Squadra** (Team Sports): Power and rate of force development (explosive concentric tempo `X-0-1`, low-to-moderate reps 6-8, power recovery 2-3 mins).

---

## 3. Caveats
- **Browser Execution Only**: This is a pure front-end application. SheetJS (`window.XLSX`) is expected to be available globally in the browser. If the CDN fails, the export will crash. It is recommended to verify the network status or bundle SheetJS locally if offline execution is required (though SheetJS is already in `index.html` via CDN).
- **Sheet Styles**: The basic SheetJS community edition (loaded in `index.html`) does not support advanced cell styling (colors, borders, fonts) in the free version. The output will be a clean, unstyled tabular grid, which is exactly what is needed for a "simple, clean, unlocked grid structure easy to print or edit".

---

## 4. Conclusion & Implementation Proposals

### 4.1 UI Update Proposal (Wizard Form)

**In `js/ui.js` - Step 1 HTML:**
Insert the "Sport Praticato" dropdown after "Esperienza di Allenamento" (around line 105):
```html
<div class="intake-field-group" id="sport-field-group">
    <label class="intake-label">Sport Praticato</label>
    <select name="sportPraticato" class="intake-select" style="width: 100%; padding: 0.75rem; border-radius: 10px; border: 1px solid var(--border); background: rgba(0,0,0,.2); color: var(--text-primary);">
        <option value="Bodybuilding" ${saved.sportPraticato === 'Bodybuilding' ? 'selected' : ''}>Bodybuilding / Fitness</option>
        <option value="Endurance" ${saved.sportPraticato === 'Endurance' ? 'selected' : ''}>Sport di Endurance (Corsa, Ciclismo, Triatlon)</option>
        <option value="Sport di Squadra" ${saved.sportPraticato === 'Sport di Squadra' ? 'selected' : ''}>Sport di Squadra / Agilità (Calcio, Basket, Volley)</option>
    </select>
</div>
```

**In `js/ui.js` - Toggle Visibility Logic:**
Inside `renderWizard` (around line 421):
```javascript
const patientTypeRadios = container.querySelectorAll('input[name="patientType"]');
const sportGroup = container.querySelector('#sport-field-group');
const toggleSportGroup = () => {
    const selectedType = container.querySelector('input[name="patientType"]:checked')?.value;
    if (sportGroup) {
        sportGroup.style.display = selectedType === 'Atleta' ? 'flex' : 'none';
    }
};
patientTypeRadios.forEach(radio => radio.addEventListener('change', toggleSportGroup));
toggleSportGroup(); // Initial call
```

**In `js/ui.js` - `collectData()` and Save Logic:**
Add parameter mapping:
```javascript
// collectData
sportPraticato: container.querySelector('[name="sportPraticato"]')?.value || 'Bodybuilding'

// generateProgram() local storage save
localStorage.setItem('t7_prog_params', JSON.stringify({
    ...
    sportPraticato: d.sportPraticato
}));
```

### 4.2 Excel Export Rewrite Proposal (SheetJS)

**In `js/ui.js` - replace `_exportProgramToExcel`:**
```javascript
function _exportProgramToExcel(result) {
    if (!window.XLSX) {
        alert("Errore: Libreria SheetJS non caricata.");
        return;
    }

    const meta = result.meta || {};
    const phases = result.phases || [];
    const progression = result.progression || [];
    const createdDate = new Date().toLocaleDateString('it-IT');

    // Create Workbook
    const wb = XLSX.utils.book_new();

    // 1. Cover / Info Sheet
    const coverData = [
        ["📋 PROGRAMMA DI ALLENAMENTO PERSONALIZZATO"],
        [],
        ["Parametro", "Valore"],
        ["Data generazione", createdDate],
        ["Livello atleta", meta.level || ''],
        ["Soggetto", meta.patientType || 'Standard'],
        ["Sport Praticato", result.meta.sportPraticato || 'Bodybuilding'],
        ["Obiettivo", meta.goal || ''],
        ["Durata", (meta.weeks || 12) + " settimane"],
        ["Giorni/settimana", meta.days || ''],
        ["Attrezzatura", meta.equipment || ''],
        ["Livello Rischio", meta.riskLevel || 'LOW'],
        [],
        ["Patologie / Condizioni", (meta.pathologyNames || []).join(', ') || 'Nessuna'],
        [],
        ["Generato da Workout AI - App Scienze Motorie"]
    ];
    const wsCover = XLSX.utils.aoa_to_sheet(coverData);
    wsCover['!cols'] = [{ wch: 25 }, { wch: 45 }];
    XLSX.utils.book_append_sheet(wb, wsCover, "Info Generali");

    // 2. Timeline Sheet
    const timelineData = [
        ["Fase", "Settimane", "Volume", "Intensità", "Focus / Note"]
    ];
    progression.forEach(p => {
        timelineData.push([p.phase || '', p.weeks || '', p.vol || '', p.int || '', p.note || '']);
    });
    const wsTimeline = XLSX.utils.aoa_to_sheet(timelineData);
    wsTimeline['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 45 }];
    XLSX.utils.book_append_sheet(wb, wsTimeline, "Timeline");

    // 3. Phase Sheets
    phases.forEach(phase => {
        const sheetData = [];
        sheetData.push([`Fase ${phase.id}: ${phase.name || ''}`]);
        sheetData.push([`Settimane: ${phase.weeks || ''} | Focus: ${phase.focus || ''}`]);
        sheetData.push([`Obiettivo: ${phase.objective || ''}`]);
        sheetData.push([]); // Space

        (phase.schedule || []).forEach(day => {
            if (day.isRest) {
                sheetData.push([`🛌 ${day.name || 'Riposo'} — RIPOSO`]);
                sheetData.push([]);
                return;
            }

            sheetData.push([`💪 ${day.name || ''} | Focus: ${Array.isArray(day.focus) ? day.focus.join(', ') : day.focus || ''}`]);
            sheetData.push(["Esercizio", "Serie", "Ripetizioni", "Carico", "Note Coach"]);

            (day.exercises || []).forEach(ex => {
                let noteParts = [];
                if (ex.specs?.rest) noteParts.push(`Recupero: ${ex.specs.rest}`);
                if (ex.specs?.rpe) noteParts.push(`RPE: ${ex.specs.rpe}`);
                if (ex.specs?.tempo) noteParts.push(`Tempo: ${ex.specs.tempo}`);
                if (ex.isadapted) noteParts.push("Adattato per limitazioni");
                if (ex.note) noteParts.push(ex.note);

                sheetData.push([
                    ex.name || '',
                    ex.specs?.sets || '',
                    ex.specs?.reps || '',
                    ex.specs?.load || '',
                    noteParts.join(' | ')
                ]);
            });
            sheetData.push([]); // Blank row between days
        });

        const wsPhase = XLSX.utils.aoa_to_sheet(sheetData);
        wsPhase['!cols'] = [{ wch: 30 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 55 }];
        
        // Ensure sheet is completely unlocked (no !protect properties)
        XLSX.utils.book_append_sheet(wb, wsPhase, `Fase ${phase.id}`.substring(0, 31));
    });

    // Write file
    const goalName = (meta.goal || 'Programma').replace(/\s+/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Programma_${goalName}_${dateStr}.xlsx`);
}
```

### 4.3 Periodization & Sport Logic Update Proposal

**In `js/logic.js` - dynamic week scaling in `_generatePhases`:**
Define allocation mappings inside the WorkoutGeneratorAI module:
```javascript
const weekAllocations = {
    4: [
        { weeksStr: "Settimane 1-2", weeksCount: 2 },
        { weeksStr: "", weeksCount: 0 },
        { weeksStr: "Settimana 3", weeksCount: 1 },
        { weeksStr: "", weeksCount: 0 },
        { weeksStr: "Settimana 4", weeksCount: 1 },
        { weeksStr: "", weeksCount: 0 }
    ],
    8: [
        { weeksStr: "Settimane 1-2", weeksCount: 2 },
        { weeksStr: "Settimana 3", weeksCount: 1 },
        { weeksStr: "Settimane 4-5", weeksCount: 2 },
        { weeksStr: "Settimana 6", weeksCount: 1 },
        { weeksStr: "Settimana 7", weeksCount: 1 },
        { weeksStr: "Settimana 8", weeksCount: 1 }
    ],
    12: [
        { weeksStr: "Settimane 1-3", weeksCount: 3 },
        { weeksStr: "Settimana 4", weeksCount: 1 },
        { weeksStr: "Settimane 5-7", weeksCount: 3 },
        { weeksStr: "Settimana 8", weeksCount: 1 },
        { weeksStr: "Settimane 9-11", weeksCount: 3 },
        { weeksStr: "Settimana 12", weeksCount: 1 }
    ],
    16: [
        { weeksStr: "Settimane 1-4", weeksCount: 4 },
        { weeksStr: "Settimana 5", weeksCount: 1 },
        { weeksStr: "Settimane 6-9", weeksCount: 4 },
        { weeksStr: "Settimana 10", weeksCount: 1 },
        { weeksStr: "Settimane 11-14", weeksCount: 4 },
        { weeksStr: "Settimane 15-16", weeksCount: 2 }
    ]
};
```
Then, update `_generatePhases` (line 126):
```javascript
            const selectedWeeks = parseInt(params.weeks) || 12;
            const allocation = weekAllocations[selectedWeeks] || weekAllocations[12];

            const blueprintsBase = isClinical ? clinicalBlueprints : standardBlueprints;
            const phaseBlueprints = blueprintsBase.map((bp, idx) => {
                const alloc = allocation[idx];
                return {
                    ...bp,
                    weeks: alloc.weeksStr,
                    weeksCount: alloc.weeksCount
                };
            }).filter(p => p.weeksCount > 0);
```

**In `js/logic.js` - dynamic sport routing in `_formatExerciseForPhase`:**
Update parameter formatting (around line 580):
```javascript
            // Apply sport-specific formatting overrides for Athletes
            if (params.patientType === 'Atleta') {
                if (params.sportPraticato === 'Endurance') {
                    if (!isDeload) {
                        reps = isMain ? '12-15' : '15-20';
                        rest = isMain ? '75s' : '45-60s';
                        tempo = '3-0-2'; // slow controlled eccentric
                        load = '50-60% RM';
                    }
                } else if (params.sportPraticato === 'Sport di Squadra') {
                    if (!isDeload) {
                        reps = isMain ? '6-8' : '8-10';
                        tempo = 'X-0-1'; // explosive concentric intent
                        rest = isMain ? '2 min' : '90s';
                        load = isMain ? '75-80% RM' : '70-75% RM';
                    }
                }
            }
```

And in `generateFullProgram` (line 88), pass `sportPraticato` in the metadata:
```javascript
            return {
                meta: {
                    ...
                    weeks: params.weeks || 12,
                    sportPraticato: params.sportPraticato || 'Bodybuilding',
                    ...
                },
                ...
            };
```

---

## 5. Verification Method

To verify these changes after implementation:

1. **Verify UI Dropdown (Sport Praticato)**:
   - Load the application in a web browser.
   - Click "Programmazione" in the navigation bar to launch the Wizard.
   - On Step 1 ("Chi sei?"), select "Atleta / Fitness" and confirm that the "Sport Praticato" dropdown appears. Select "Sport di Squadra" or "Sport di Endurance".
   - Select "Paziente Clinico" or "Senior" and confirm that the "Sport Praticato" dropdown is hidden.
   
2. **Verify Weeks Customization**:
   - In Step 4 of the Wizard, select a duration (e.g., 8 weeks).
   - Generate the program and inspect the result view: verify that the timeline shows exactly 8 weeks total and has appropriately mapped phases (Phase 1 to 6 with condensed week schedules).

3. **Verify Excel Export File Integrity**:
   - Generate a program and click "Excel (.xlsx)".
   - Verify that the downloaded file has the extension `.xlsx` (not `.xls`).
   - Open the file in Microsoft Excel. Ensure no security warnings are shown.
   - Verify that there are sheets for "Info Generali", "Timeline", and each active Phase (e.g., Fase 1, Fase 2, etc.).
   - Confirm that the exercise grids have the columns: `Esercizio`, `Serie`, `Ripetizioni`, `Carico`, `Note Coach`.
   - Confirm that no cells are protected and the user can type or format anywhere in the sheets.
