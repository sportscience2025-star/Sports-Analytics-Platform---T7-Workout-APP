# Adversarial Analysis & Validation Report

## Challenge Summary

**Overall risk assessment**: HIGH

Through systematic, automated, and manual adversarial testing, we have uncovered critical security vulnerabilities, mathematical/logic discrepancies between tests and implementation, and parsing errors when handling units in column headers.

---

## Challenges

### [High] Challenge 1: Cross-Site Scripting (XSS) in Libreria Fonti rendering

- **Assumption challenged**: Assumed that the scientific sources database is a static, trustable internal dataset that does not require HTML escaping.
- **Attack scenario**: If external scientific sources are imported, loaded dynamically from JSON feeds, or modified by users, malicious scripts or elements can be injected. For example, setting a title to `<script>alert('XSS')</script>Title` or an abstract to `Abstract <img src=x onerror=alert(1)>` leads to direct execution when rendered.
- **Blast radius**: Arbitrary JavaScript execution in the user's browser session, potentially compromising localStorage, sessionStorage, and user data.
- **Mitigation**: Escape all dynamic fields (`source.title`, `source.authors`, `source.journal`, `source.abstract`, and `source.url`) before injecting them into the DOM using `element.textContent` or a sanitization function instead of directly interpolating into `innerHTML`.

### [High] Challenge 2: Excel Header Mapping Failures for Jump Height and Contact Time

- **Assumption challenged**: Assumed that simple exact matches (`lower === 'h'` or `lower === 'tc'`) are sufficient to map short headers.
- **Attack scenario**: Real-world spreadsheets from force plates or jump apps often label columns as `H (cm)` or `TC (s)`. Standardizing and lowercasing them yields `h (cm)` and `tc (s)`. The exact equality check fails to match these, and they do not contain multi-word substrings like `jump height` or `contact time`.
- **Blast radius**: The parser fails to extract jump height and contact time from standard spreadsheet files, causing jump data to be discarded.
- **Mitigation**: Update the matching rules in `js/parser.js` to look for substring patterns, regular expressions, or start-with conditions, such as:
  ```javascript
  else if (lower === 'h' || lower.startsWith('h ') || lower.includes('altezza') || lower.includes('jump height') || lower.includes('altura')) { ... }
  ```

### [Medium] Challenge 3: Mismatch in Endurance Reps Periodization Logic

- **Assumption challenged**: Assumed that the `POLARIZED` periodization method respects the requirement of low-reps (3-6 reps) and heavy loads (>=80% RM) for endurance athletes on all training days.
- **Attack scenario**: Under the `POLARIZED` method, the generator schedules low-intensity Zone 1-2 days. On these days, the formatter falls back to light loads (50-60% RM) and high reps (15-20 reps), which directly contradicts the scientific consensus (e.g. Ronnestad & Mujika) that endurance athletes should train with heavy loads and low reps to prevent hypertrophy. This mismatch triggers failures in the test suite.
- **Blast radius**: Fails the test assertions in `test_periodization_stress.js`, blocking automated builds.
- **Mitigation**: Align the formatting logic in `js/logic.js` for `isEndurance` to ensure that multi-joint exercises maintain heavy loads and low reps even under polarized scheduling, or adjust the test expectations if high reps on Zone 1-2 days are scientifically justified.

### [Medium] Challenge 4: Missing Zero-Slope Regression Truncation Guard

- **Assumption challenged**: Assumed that very flat slopes below `1e-4` in the VBT profile are truncated to `0` for stability.
- **Attack scenario**: The test suite in `test_vbt_math_stress.js` asserts that a very flat slope (e.g. `1e-8`) gets truncated to `0`. However, the implementation in `physics-engine.js` has no truncation check. It calculates the slope as `1.0526e-8` and returns it directly.
- **Blast radius**: Triggers test failures in `test_vbt_math_stress.js`.
- **Mitigation**: Add a truncation check in `PhysicsEngine.linearRegressionVBT` to set the slope to `0` if its absolute value falls below `1e-4` or similar threshold, or update the test suite assertions.

### [Low] Challenge 5: Non-Multiple-of-4 Periodization Weeks Quirk

- **Assumption challenged**: Assumed that the periodization engine can generate any custom weeks duration.
- **Attack scenario**: When the user requests a week duration that is not a multiple of 4 (e.g., `weeks = 1`, `weeks = 5`), the generator rounds up the generated phases (e.g., generating 4 weeks for `weeks = 1`, and 8 weeks for `weeks = 5`). Additionally, negative week inputs generate negative ranges like `Settimane 1--1`.
- **Blast radius**: The generated program timeline does not match the user's requested week count.
- **Mitigation**: Implement logic to truncate or scale the generated phases to match the exact requested week count, and validate that `weeks` is positive before phase generation.

---

## Stress Test Results

- **Empty search query `""`** → Returns all sources → Returns all sources → **PASS**
- **RegExp characters `.*+?^${}()|[]\`** → Empty state without crash → Empty state without crash → **PASS**
- **SQL Injection `' OR '1'='1`** → Empty state without crash → Empty state without crash → **PASS**
- **XSS Script `<script>alert(1)</script>`** → Empty state without crash → Empty state without crash → **PASS**
- **Extremely long query (10000 chars)** → Empty state without crash → Empty state without crash → **PASS**
- **Zero weeks input `weeks = 0`** → Falls back to 12 weeks → Falls back to 12 weeks → **PASS**
- **Negative weeks `weeks = -4` (DUP)** → Generates 0 phases without crash → Generates 0 phases without crash → **PASS**
- **Negative weeks `weeks = -4` (LINEAR)** → Generates 4 phases with negative week ranges → Generates 4 phases with negative week ranges → **PASS**
- **Invalid sport `sport = 'Quidditch'`** → Falls back to DUP → Falls back to DUP → **PASS**
- **Null injuries array (Clinico)** → Handled successfully → Handled successfully → **PASS**

---

## Unchallenged Areas

- **PDF Ingestion Logic** — Insufficient context to test OCR-related PDF corruption dynamically.
