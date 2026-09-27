# Milestone 4 Empirical Challenge Report: ExcelJS Export Upgrade

**Target File**: `js/ui.js` (`_exportProgramToExcel` / `_exportWithExcelJS`)  
**Tester**: Challenger 1 (Empirical Challenger)  
**Date**: 2026-07-25  
**Overall Risk Assessment**: **HIGH**

---

## Executive Summary

An empirical stress-testing suite was executed against the ExcelJS export implementation (`_exportProgramToExcel` / `_exportWithExcelJS`) in `js/ui.js`. Testing evaluated edge cases including multi-line notes, long exercise names (>60 chars), undefined/missing `specs` fields, multi-phase macrocycles with long sheet names (>31 chars), deload/rest days, and clinically adapted exercises.

While core formatting, text wrapping, and null/undefined sanitization perform well, empirical testing identified **1 CRITICAL BROWSER CRASH BUG** and **1 CLINICAL INFORMATION OMISSION ISSUE**.

---

## Stress Test Results Matrix

| Scenario | Input Edge Case | Expected Behavior | Actual Behavior | Result |
| :--- | :--- | :--- | :--- | :---: |
| **Scenario 1** | Long exercise name (>60 chars) & multi-line coach notes (`\n`) | Clean rendering with text wrapping (`wrapText: true`), proper column width | Columns 2 & 11 set to width 32 & 38 with `wrapText: true`. Multi-line strings render without breaking layout. | **PASS** |
| **Scenario 2** | Undefined/missing `specs` fields (`sets`, `reps`, `load`, `rest`, `rpe`, `tempo`), `null`, or `"undefined"` strings | Robust fallbacks (`safeVal`), no uncaught exceptions, no `"undefined"` text in cells | `safeVal` converts all `undefined`, `null`, `""`, `"undefined"`, and `"null"` to `'N/A'`. Zero `"undefined"` strings found. | **PASS** |
| **Scenario 3a** | 5+ phases with distinct names (>31 chars) | Sheet names truncated safely to <= 31 chars without throwing exceptions | Truncated to <= 31 chars successfully (e.g. `"Fase 1- Adattamento Anatomico G"`). | **PASS** |
| **Scenario 3b** | 5+ phases with long names (>31 chars) sharing the first 31 chars (Name Collision) | Unique sheet names generated for all worksheets without collision | `ExcelJS.Workbook.addWorksheet()` throws uncaught exception: `Worksheet name already exists: Fase 1- Programma Clinico Avanz`. **Export fails completely.** | **FAIL (CRITICAL)** |
| **Scenario 4** | Deload phases (`isDeload`) & Rest days (`isRest: true`) | Merged rest day row across columns A:K with distinct emerald styling | Rest day rows merged A:K with height 26, styled with dark emerald fill (`#059669`) and white bold text. | **PASS** |
| **Scenario 5** | Adapted exercises (`isadapted: true`, `adaptedFrom`, `adaptationReason`) | Column 10 shows "SÌ", Column 11 shows adaptation reason & source exercise | Column 10 shows "SÌ", but Column 11 shows `"N/A"` because `ex.note` is undefined. `adaptationReason` and `adaptedFrom` are **omitted**. | **FAIL (OMISSION)** |

---

## Detailed Findings & Critical Failure Modes

### 1. [CRITICAL] Sheet Name Collision Crash on 5+ Long Phase Names (>31 chars)
- **Assumption Challenged**: Truncating phase names with `substring(0, 31)` produces valid, unique Excel worksheet names.
- **Root Cause** (`js/ui.js:1493-1495`):
  ```javascript
  const rawPhaseName = safeVal(phase.name, `Fase ${phase.id || phaseIdx + 1}`);
  const sheetName = rawPhaseName.replace(/[\[\]\*\/\\\?:]/g, '-').substring(0, 31);
  const wsPhase = workbook.addWorksheet(sheetName, { views: [{ showGridLines: true }] });
  ```
- **Attack Scenario**: When a program contains multiple phases whose names exceed 31 characters and share the same 31-character prefix (e.g., `"Fase 1: Programma Clinico Avanzato - Blocco A"` and `"Fase 1: Programma Clinico Avanzato - Blocco B"`), `substring(0, 31)` truncates both to `"Fase 1- Programma Clinico Avanz"`.
- **Blast Radius**: `workbook.addWorksheet()` throws `Error: Worksheet name already exists: Fase 1- Programma Clinico Avanz`. The export process terminates abruptly with an uncaught promise rejection, leaving the user with an unhandled UI error and no exported Excel file.
- **Recommended Mitigation**:
  Implement a deduplication tracker for sheet names:
  ```javascript
  const usedSheetNames = new Set(['Info Generali', 'Timeline', 'Spiegazioni Tecniche']);
  phases.forEach((phase, phaseIdx) => {
      let rawName = safeVal(phase.name, `Fase ${phase.id || phaseIdx + 1}`).replace(/[\[\]\*\/\\\?:]/g, '-');
      let sheetName = rawName.substring(0, 31);
      let counter = 1;
      while (usedSheetNames.has(sheetName)) {
          const suffix = ` (${counter})`;
          sheetName = rawName.substring(0, 31 - suffix.length) + suffix;
          counter++;
      }
      usedSheetNames.add(sheetName);
      const wsPhase = workbook.addWorksheet(sheetName, { views: [{ showGridLines: true }] });
  });
  ```

---

### 2. [HIGH] Information Omission for Adapted Exercises (`adaptedFrom`, `adaptationReason`)
- **Assumption Challenged**: Coach notes (`ex.note`) contain all relevant information for adapted exercises.
- **Root Cause** (`js/ui.js:1655`):
  ```javascript
  const rowValues = [
      ...
      isAdaptedStr,
      safeVal(ex.note || ex.coachNotes || ex.notes)
  ];
  ```
- **Attack Scenario**: When the clinical engine adapts an exercise (e.g., replacing Squat with Leg Press due to L4-L5 Herniation), it sets `ex.isadapted = true`, `ex.adaptedFrom = "Squat Bilanciere"`, and `ex.adaptationReason = "Sostituito per Ernia del Disco L4-L5"`. If `ex.note` is missing, `safeVal(ex.note || ex.coachNotes || ex.notes)` returns `'N/A'`.
- **Blast Radius**: The exported Excel sheet marks the exercise as `Adattato? = SÌ`, but the `Note Coach` column displays `'N/A'`. The practitioner or athlete loses the clinical rationale and the original exercise reference.
- **Recommended Mitigation**:
  Construct the note text dynamically to include adaptation details when present:
  ```javascript
  let noteText = ex.note || ex.coachNotes || ex.notes;
  if (!noteText && (ex.adaptationReason || ex.adaptedFrom)) {
      const parts = [];
      if (ex.adaptedFrom) parts.push(`Adattato da: ${ex.adaptedFrom}`);
      if (ex.adaptationReason) parts.push(`Motivo: ${ex.adaptationReason}`);
      noteText = parts.join(' | ');
  }
  ```

---

## Verification Harness Commands

To independently reproduce and verify these findings, run:
```bash
# 1. Run syntax verification
py test_check.py

# 2. Run empirical Excel export stress harness in headless Chrome
py tools/run_m4_excel_harness.py
```
