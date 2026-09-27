# Handoff Report — Reviewer M3-1 Evaluation

## Verdict
**REJECTED** (R1 failed edge cases / boundary conditions; R3 approved).

---

## 1. Observation

### R1 Observation (`js/parser.js`)
- In `js/parser.js` lines 592–605:
```javascript
static extractAthleteFromFilename(filename) {
    if (!filename || typeof filename !== 'string') return null;
    let clean = filename.replace(/\.[^/.]+$/, '');
    clean = clean.replace(/\b\d{4}[-/._]\d{2}[-/._]\d{2}\b/g, '')
                 .replace(/\b\d{2}[-/._]\d{2}[-/._]\d{4}\b/g, '')
                 .replace(/\b\d{8}\b/g, '')
                 .replace(/\b(19|20)\d{2}\b/g, '');
    clean = clean.replace(/[-_.]/g, ' ');
    const noiseRegex = /\b(encoder|dati|data|export|report|vbt|test|session|sessione|allenamento|workout|backup|raw|file|profilo|mvt|1rm|load|velocity)\b/gi;
    clean = clean.replace(noiseRegex, '');
    clean = clean.replace(/\s+/g, ' ').trim();
    if (!clean || /^\d+$/.test(clean)) return null;
    return clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}
```
- Line 594 uses `filename.replace(/\.[^/.]+$/, '')` to strip extensions.
- Lines 595–598 run regex date removals with `\b` (word boundary) before line 599 replaces delimiters `[-_.]` with spaces.
- Execution of test cases against `extractAthleteFromFilename`:
  - `Mario_Rossi_2024-05-10.xlsx` returns `"Mario Rossi 2024 05 10"` (expected `"Mario Rossi"`).
  - `Luca_Verdi_20240510.csv` returns `"Luca Verdi 20240510"` (expected `"Luca Verdi"`).
  - `Giuseppe_Garibaldi_report_15-06-2026.xlsx` returns `"Giuseppe Garibaldi 15 06"` (expected `"Giuseppe Garibaldi"`).
  - `Marco_Rossi.data.final.xlsx` returns `"Marco Rossi Final"` (expected `"Marco Rossi"`).

### R3 Observation (`js/data-analysis.js`)
- In `js/data-analysis.js` lines 453–459:
```javascript
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        const file = e.target.files[0];
        e.target.value = '';
        this.handleFile(file);
    }
});
```
- In `js/data-analysis.js` lines 467–478 (`handleFile`):
```javascript
async handleFile(file) {
    this.cleanup();
    this.parseResult = null;
    const dashboard = document.getElementById('dashboard-container');
    if (dashboard) {
        dashboard.innerHTML = `<div style="padding: 2rem; border: 1px dashed var(--border); border-radius: 12px; text-align: center; color: var(--text-muted);">Elaborazione in corso...</div>`;
    }
    const nlpSection = document.getElementById('nlp-section');
    if (nlpSection) nlpSection.style.display = 'none';
    const quickActions = document.getElementById('quick-actions');
    if (quickActions) quickActions.innerHTML = '';
...
```

---

## 2. Logic Chain

### Logic Chain for R1 (Athlete Name Parsing)
1. **Word boundary semantics in JS Regex**: In JavaScript regular expressions, `\w` includes alphanumeric characters and the underscore `_` (`[a-zA-Z0-9_]`). A word boundary `\b` matches only at transitions between a `\w` character and a non-`\w` character (or start/end of string).
2. **Failure on underscore-separated dates**: In common export filenames such as `Mario_Rossi_2024-05-10.xlsx`, the character immediately preceding the date `2024` is `_`. Because both `_` and `2` belong to `\w`, there is no word boundary between them. Consequently, `\b\d{4}[-/._]\d{2}[-/._]\d{2}\b` fails to match `_2024-05-10`.
3. **Leaking numbers into athlete name**: Line 599 subsequently replaces `_` and `-` with spaces, turning `_2024-05-10` into ` 2024 05 10`. Since numbers are not matched by `noiseRegex` in line 600, the date numbers are retained, yielding `"Mario Rossi 2024 05 10"` as the parsed athlete name.
4. **Impact**: When Excel or export files omit an explicit athlete column in their rows and rely on filename fallback parsing, the system pollutes athlete names with date components.

### Logic Chain for R3 (Second File Reload Fix)
1. **Browser File Input Behavior**: HTML `<input type="file">` elements do not trigger a `change` event if a user selects the exact same file again or re-selects a file without the input value changing.
2. **Resetting Input Value**: In `js/data-analysis.js` line 456, `e.target.value = ''` immediately clears the file input value after obtaining the file object. This ensures subsequent file selections always trigger `change`.
3. **Complete State Reset**: `handleFile` invokes `this.cleanup()` (destroying active Chart.js instances and removing floating tooltips), resets `this.parseResult = null`, replaces `#dashboard-container` content with a loading state, and hides NLP sections before parsing. This prevents stale state contamination between reloads.

---

## 3. Caveats
- Tests were verified using Python simulation of JS execution environment and static code analysis due to headless server environment constraints.
- No integrity violations (hardcoded results or dummy facades) were detected in source files.

---

## 4. Conclusion
- **R3 (Second File Reload Fix)** is **APPROVED**. The state reset and input clearing logic are robust and correctly implemented.
- **R1 (Athlete Name Parsing)** is **REJECTED**. The filename parsing logic fails on standard underscore-delimited dates and multi-extension filenames, leaking raw numbers into athlete names.
- **Actionable Fix Recommendation for R1**: In `extractAthleteFromFilename`, perform delimiter normalization (`clean = clean.replace(/[-_.]/g, ' ')`) BEFORE applying date stripping, or use non-word-boundary matching patterns (e.g. `(?:\s|^|_)\d{4}[-/._]\d{2}[-/._]\d{2}(?:\s|$|_)`).

---

## 5. Verification Method

### How to verify R1 bug:
Run the following script using Python to observe the date leakage in JS parsing logic:
```bash
py -c "import re; fn='Mario_Rossi_2024-05-10.xlsx'; clean=re.sub(r'\.[^/.]+$','',fn); clean=re.sub(r'\b\d{4}[-/._]\d{2}[-/._]\d{2}\b','',clean); clean=re.sub(r'[-_.]',' ',clean); print(clean)"
```
Output will show `Mario Rossi 2024 05 10` instead of `Mario Rossi`.

### How to verify R3 fix:
Inspect `js/data-analysis.js` lines 453-459 and 467-478 to confirm `e.target.value = ''` and `this.cleanup()` call chain.
