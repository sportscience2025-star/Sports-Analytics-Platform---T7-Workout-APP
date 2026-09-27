# Teamwork Preview Reviewer Round 2 - Handoff

## 1. Adversarial Scrutiny & Defects Identified in Prior Attempt

### Defect 1: normalizeExercise non-string / whitespace failure
- Input: DataParser.normalizeExercise('   ') or non-alphanumeric punctuation DataParser.normalizeExercise('---').
- Expected: Return 'Sconosciuto' fallback.
- Actual: Returned empty string ''.
- Root Cause: normalizeExercise only checked if (!raw), treating non-empty whitespace as truthy. Subsequent regex cleaning reduced the string to '', which bypassed dictionary matching and fell through to raw.trim().charAt(0)..., resulting in ''.

### Defect 2: extractAthleteFromFilename Underscore-Delimited Date Leak
- Input: DataParser.extractAthleteFromFilename('Mario_Rossi_vbt_2026-06-15.xlsx').
- Expected: 'Mario Rossi'.
- Actual: 'Mario Rossi 2026 06 15'.
- Root Cause: Regex \b\d{4}[-/._]\d{2}[-/._]\d{2}\b relied on \b (word boundary). Since _ is a word character (\w), there is no word boundary between _ and 2026. The date failed to match, was converted to space-separated numbers, and was retained as part of the athlete name.

### Defect 3: aggregateByLoad Upper Outlier Filter Blindness at n = 4
- Input: vels = [0.49, 0.50, 0.51, 2.80] (load = 100 kg, 4 repetitions).
- Expected: Extreme outlier 2.80 filtered out by IQR fence, yielding robust mean ~0.50.
- Actual: 2.80 was retained; mean calculated as 1.075.
- Root Cause: Math.floor(n * 0.75) for n = 4 yielded index 3, which is the maximum element in vels[0..3]. When q3 is anchored to the maximum element, q3 + fence is mathematically always >= vels[3], making upper outlier detection completely inoperative for sample size 4.

## 2. Modifications Applied
1. js/parser/exercise-dict.js:
   - Added if (!raw || typeof raw !== 'string') return 'Sconosciuto';
   - Added whitespace and empty cleaned string guards.
2. js/parser/athlete-resolver.js:
   - Replaced flawed word-boundary date regexes with delimiter-agnostic patterns supporting leading/trailing underscores, hyphens, and dots for standard, european, compact, and year dates.
3. js/parser/load-aggregator.js:
   - Updated quartile index calculation to symmetric formulation:
     const idxQ1 = Math.round((n - 1) * Q1_PERCENTILE);
     const idxQ3 = Math.round((n - 1) * Q3_PERCENTILE);
     Accurately detects both upper and lower outliers at n = 4 and larger samples.
4. tests/test_reviewer_adversarial.js:
   - Created comprehensive test suite validating all 6 modular components and facade against adversarial edge cases.

## 3. Verification Record
- py test_check.py: Passed with exit code 0.
- node tests/test_parsing.js: Passed with exit code 0.
- node tests/test_stress_parser.js: Passed with exit code 0 (7 / 7 test scenarios).
- node tests/test_parser_empirical_stress.js: Passed with exit code 0 (104 / 104 assertions).
- node tests/test_reviewer_adversarial.js: Passed with exit code 0 (12 / 12 test blocks).
