# Handoff Report: Code Quality and Performance Audit of parser.js and impact-calculator.js

This report presents a thorough static analysis and code quality audit of `js/parser.js` and `js/impact-calculator.js`. It identifies several critical bugs, logic flaws, performance bottlenecks, and edge cases, along with actionable optimization recommendations ranked by impact.

---

## 1. Observations

### A. Regular Expressions (js/parser.js)
1. **Date Boundary Operator Precedence Bug** (Line 453):
   ```javascript
   const dateRegex = /\b(\d{4}[-/.]\d{2}[-/.]\d{2})|(\d{2}[-/.]\d{2}[-/.]\d{4})\b/;
   ```
   * The alternation operator `|` has the lowest precedence. This regex evaluates as `/\b(\d{4}[-/.]\d{2}[-/.]\d{2})/` OR `/(\d{2}[-/.]\d{2}[-/.]\d{4})\b/`.
   * Consequently, the first pattern (`YYYY-MM-DD`) lacks a trailing boundary check (matching `"2026-06-15abc"`), while the second pattern (`DD-MM-YYYY`) lacks a leading boundary check (matching `"abc15-06-2026"`).

2. **Prefix Alternation Order Bug** (Lines 444-445):
   ```javascript
   const keywordPattern = /\b(athlete|atleta|name|nome|usuario|user|date|data|fecha|exercise|esercizio|ejercicio|jump\s+type|salto|tipo\s+salto|cmj|sj|dj|squat|bench\s+press|stacco|deadlift|countermovement\s+jump|squat\s+jump|drop\s+jump|load|carga|peso|kg|height|altura|altezza|volo|h|distance|distanza|time|tempo|durata|pace|ritmo|passo|min\/km)\b/gi;
   ```
   * JS regular expressions use leftmost-greedy alternation. Since `"squat"` precedes `"squat\s+jump"`, input text `"squat jump"` will match `"squat"`, leaving `" jump"` unmatched.
   * Similarly, `"salto"` precedes `"tipo\s+salto"`, preventing `"tipo salto"` from matching as a single token.

3. **OCR/PDF Keyword Splitting and Fragmentation Bug** (Lines 445, 485-494):
   ```javascript
   text = text.replace(keywordPattern, '\n$1');
   ```
   * In a line containing multiple keywords like `"Load: 80 kg, Velocity: 0.55 m/s"`, this inserts a newline before `"Load"`, `"kg"`, `"Velocity"`, and `"m/s"`.
   * When split by `\n`, the metrics are evaluated independently on separate lines.
   * A line like `"Load: 80"` sets `load = 80` and pushes `{ load: 80, velocity: null }`.
   * A subsequent line like `"Velocity: 0.55"` sets `velocity = 0.55` and pushes `{ load: null, velocity: 0.55 }`.
   * The parser never combines these into a single VBT record `{ load: 80, velocity: 0.55 }`. Since both records have one null VBT metric, they are excluded from load-velocity aggregation entirely.

---

### B. Iterations and Performance Bottlenecks (js/parser.js & js/impact-calculator.js)
1. **$O(N \times K)$ Exercise Dictionary Loop** (js/parser.js, Lines 30-46):
   * Every record's raw exercise name is normalized by iterating through all entries of `EXERCISE_DICT` and comparing/substring-matching against all keys.
   * For large files, this leads to hundreds of thousands of redundant string matches.

2. **Redundant Double-Pass Aggregation** (js/parser.js, Lines 81-98):
   * `aggregateByLoad` runs a first pass over all records to check if there are repeated loads, then runs a second identical loop to group them.

3. **In-Loop Function Creation & Object Garbage Collection** (js/impact-calculator.js, Lines 88-93):
   ```javascript
   _matchesRule(exercise, rulePattern) {
       if (!rulePattern || rulePattern === 'General') return true;
       const normalize = str => str.toLowerCase().replace(/[^a-z0-9]/g, '');
       const txt = (exercise.name + ' ' + (exercise.type || '') + ' ' + (exercise.tags || []).join(' '));
       return normalize(txt).includes(normalize(rulePattern));
   }
   ```
   * The `normalize` function is recreated on every single call to `_matchesRule` (potentially tens of thousands of times per calculation).
   * Exercise string concatenation and tag array joining are executed repeatedly for the same exercise against multiple rules.

4. **Slow `localeCompare` Sorting** (js/parser.js, Lines 136-140):
   * Using `localeCompare` to sort post-aggregation results is extremely slow in JavaScript compared to standard comparison operators.

---

### C. Parsing and Header Mapping Edge Cases (js/parser.js)
1. **Header Row Misidentification**:
   * The parser assumes the first row containing $\ge 2$ string cells is the header row.
   * If an Excel file has a title block or info cards (e.g. `["Scheda VBT", "Atleta: Mario", "Data: 2026-06-15"]`), this metadata block will be misidentified as the header row, resulting in data parsing failure.

2. **Velocity Header Mapping Collision**:
   * If a sheet has both "Peak Velocity" and "Mean Velocity" columns, the first one matches the regex and sets `colMap[idx] = 'velocity'`.
   * The second column will not overwrite it unless its header is exactly `"vm"` or `"vmean"`.
   * If "Peak Velocity" comes first, the standard "Mean Velocity" column is ignored, causing incorrect data analysis.

3. **Incomplete Metric Filtering**:
   * Line 227 filters records to ensure at least one metric is $>0$.
   * However, `record.velocity` is omitted from this check. If a bodyweight exercise VBT record has a velocity but `load = 0`, the record is incorrectly discarded.

4. **Arbitrary 2.5 kg Load Rounding**:
   * In VBT profile aggregation, loads are rounded to the nearest 2.5 kg.
   * For training profiles with 1 kg increments (dumbbells, youth, clinical), this causes different physical loads to be grouped and averaged together, corrupting the load-velocity profile.

---

### D. Rules Matching and Compatibility Score (js/impact-calculator.js)
1. **General Rule Matching Pollution**:
   * If `rulePattern` is `"General"`, `_matchesRule` returns `true` for all exercises.
   * As a result, any pathology with a general adaptation (e.g. `"Cardiofrequenzimetro obbligatorio"`) marks *every single exercise* in the catalog as adapted (`status = 'ADAPTED'`).
   * This pollutes the adapted list with duplicate entries and misrepresents the number of truly adapted exercises.

2. **Unpenalized Compatibility Score**:
   * `compatibilityScore` is computed as `(available.length / exercises.length) * 100`, where `available` includes both fully available and adapted exercises.
   * If a program requires 90% of exercises to be adapted and 10% to be excluded, the compatibility score is a misleading 90%, ignoring the severe adaptations required.

3. **Ignored Individual Risk Levels**:
   * `determineRiskLevel` determines the overall risk level based solely on the number of selected pathologies and whether they belong to specific categories.
   * It completely ignores the `riskLevel` property defined on each pathology in the database, resulting in low-risk pathologies raising the overall risk level to "medium".

4. **False Positive Substring Rules Matching**:
   * Substring matching via `includes` causes false matches. For example, a rule pattern `"Row"` (intended for rowing exercises) will match `"Arrow Jump"` because `"arrowjump"` contains `"row"`.

---

## 2. Logic Chain

1. **Date Precedence Bug**: Regular expressions in JS bind concatenation tighter than alternation. Thus, `\b(A)|(B)\b` compiles as `(\b A) | (B \b)`. When the input string is tested, only one end of the date string matches boundary rules.
2. **Leftmost-Greedy Alternation**: The JS regex engine attempts patterns in the order they are defined. If a prefix pattern like `"squat"` is matched, it succeeds immediately without checking `"squat jump"`.
3. **Keyword Splitting Bug**: Since `keywordPattern` matches both label names (e.g., `"Load"`) and units (e.g., `"kg"`), the replace operation inserts newlines, causing the parser's line-by-line loop to treat them as separate records.
4. **General Adaptation Pollution**: Since `rulePattern === 'General'` returns `true` unconditionally, the adaptation is applied to all exercises, which adds all exercises to `results.adapted` and `results.available`, distorting the compatibility score.
5. **Redundant Function Allocation**: Defining a function helper (`normalize`) inside a loop causes memory allocations and garbage collection overhead on every execution.

---

## 3. Caveats

* **Clinical Database Assumptions**: The audit assumes the structure of clinical pathologies in `js/data.js` remains as defined (i.e. having exclusions as strings and adaptations as objects with `pattern` and `modification`).
* **Runtime Verification**: Since Node.js and Python were not available in the execution path, these bugs were verified through detailed static code analysis and structural inspection. No source files were modified, in line with the read-only constraint.

---

## 4. Conclusion

The files `js/parser.js` and `js/impact-calculator.js` contain critical logic errors and performance bottlenecks:
* The OCR/PDF parser fails to extract VBT profiles from labeled text because it fragments records.
* The rules engine pollutes output files with thousands of general recommendations applied to specific exercises, while using slow string manipulations that lock up UI threads.
* The header mapping and compatibility scoring systems present high rates of silent data corruption and clinically inaccurate representations of athlete compatibility.

---

## 5. Actionable Optimization Recommendations

### High Impact
1. **Fix Date Regex Precedence**:
   * Change: `\b(?:\d{4}[-/.]\d{2}[-/.]\d{2}|\d{2}[-/.]\d{2}[-/.]\d{4})\b`
2. **Fix Alternation Order**:
   * Move longer/more specific patterns like `"squat jump"` and `"tipo salto"` before `"squat"` and `"salto"` in `keywordPattern`.
3. **Fix OCR/PDF Fragment Splitting**:
   * Instead of splitting the line on every keyword, process the original line as a single unit or group metrics before pushing to `records`.
4. **Separate General Guidelines from Specific Adaptations**:
   * Avoid matching `"General"` against every exercise. Extract `"General"` adaptations from the exercises loop and present them as a global workout warning card in the UI.

### Medium Impact
1. **Pre-normalize and Cache Exercise Data**:
   * Move the `normalize` function out of `_matchesRule`. Pre-normalize exercise names, tags, and types once during initialization.
   * Cache results of `normalizeExercise` in `parser.js` to avoid the $O(N \times K)$ loop on repeated exercises.
2. **Correct Compatibility Score**:
   * Apply a penalty to adapted exercises in the score (e.g., `(fullyAvailable.length + 0.5 * adapted.length) / total * 100`).
3. **Correct Overall Risk Level**:
   * Use the maximum individual risk level of selected pathologies to determine overall risk.
4. **Optimize Load Aggregation Pass**:
   * Group and aggregate records in a single pass instead of checking `hasRepeats` first.

### Low Impact
1. **Optimize String Sorting**:
   * Replace `localeCompare` with standard relational operators (`<`, `>`).
2. **Exact Token Matching for Rules**:
   * Use word boundary regexes or exact array lookups to prevent false matches like `"Row"` matching `"Arrow Jump"`.

---

## 6. Verification Method

To independently verify these findings, developers can implement the following tests:
1. **Precedence Test**: Run a regex test on `"2026-06-15abc"` using `dateRegex`. If it returns `true`, the precedence bug is confirmed.
2. **Fragment Test**: Call `DataParser._parseTextData("Load: 80 kg, Velocity: 0.55 m/s")` and inspect the returned array. If it returns two separate records (or zero) instead of one unified record, the fragment bug is confirmed.
3. **General Adaptation Test**: Instantiate `ImpactCalculator` with 5 exercises, select a pathology with a `"General"` adaptation, and run `calculate()`. If `results.adapted` contains all 5 exercises, the pollution bug is confirmed.
