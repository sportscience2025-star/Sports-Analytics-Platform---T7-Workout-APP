<original_task>
Scomporre il file `js/parser.js` (1332 righe, monolitico) in 6 moduli specializzati dentro la cartella `js/parser/`, mantenendo la piena compatibilità con l'orchestratore `js/parser.js` (pattern analogo a `js/ui.js` e `js/logic.js`), garantendo l'esecuzione sia in ambiente browser che nei test runner Node.js (`eval`/`loadModule`).

## Requirements

### R1. Creazione dei 6 Moduli Specialistici (`js/parser/`)
1. **`js/parser/exercise-dict.js`**:
   - `EXERCISE_DICT`: array multilingue (IT/ES/EN).
   - `normalizeExercise(raw)`: normalizzazione con match esatto, sottostringa e fallback title-case.
   - Espone: `window._parserExerciseDict` e `window._parserNormalizeExercise`.
2. **`js/parser/athlete-resolver.js`**:
   - Costante `DEVICE_KEYWORDS`.
   - `isGenericAthlete(name)`, `isDeviceToken(part)`, `isEncodedId(name)`, `extractReadableName(encodedId)`.
   - `extractAthleteFromFilename(filename)`: estrazione nome atleta pulito da nome file.
   - Espone: `window._parserAthleteResolver = { isGenericAthlete, isEncodedId, extractReadableName, extractAthleteFromFilename, isDeviceToken }`.
3. **`js/parser/load-aggregator.js`**:
   - Costanti: `const IQR_MIN_REPS = 4;`, `const IQR_FENCE_FACTOR = 1.5;`, `const TRIM_RATIO = 0.1;`, `const LOAD_ROUND_STEP = 2.5;`.
   - `aggregateByLoad(records)`: aggregazione per carico, rimozione outlier IQR (se n≥4), media trimmed 10%, ordinamento.
   - Espone: `window._parserAggregateByLoad`.
4. **`js/parser/header-mapper.js`**:
   - `readCSVRows(text)`: parsing CSV/TSV con rilevamento automatico delimitatore.
   - `mapHeaders(headers)`: mappatura delle 29 famiglie semantiche verso chiavi interne standard.
   - Espone: `window._parserHeaderMapper = { readCSVRows, mapHeaders }`.
5. **`js/parser/instrument-detector.js`**:
   - `detectInstrumentType(records, headers, extraContext)`: classificazione in 8 strumenti (`VBT`, `FORCE_PLATE`, `BLOCK_ACCEL`, `SPRINT_TIMING`, `MEDICINE_BALL`, `VIDEO_KINEMATICS`, `JUMP_TEST`, `GENERAL_TABULAR`).
   - Espone: `window._parserInstrumentDetector = { detectInstrumentType }`.
6. **`js/parser/file-readers.js`**:
   - `parseExcel(file)`: parsing a 3 livelli (SheetJS -> ExcelJS -> native CSV).
   - `parsePDF(file)`: estrazione PDF via PDF.js.
   - `parseImageOCR(file, progressCallback)`: OCR via Tesseract.js.
   - `_parseTextData(text)` e `_extractPairsFromText(text)`: parsing euristico testo grezzo.
   - Espone: `window._parserFileReaders = { parseExcel, parsePDF, parseImageOCR, parseTextData, extractPairsFromText }`.

### R2. Orchestratore Leggero (`js/parser.js`)
- Pattern conforme a `js/ui.js` e `js/logic.js`.
- Se `typeof require !== 'undefined'`, carica in sequenza i 6 file via `fs.readFileSync` ed `eval`.
- Assembla e definisce la classe `window.DataParser` con tutti i metodi statici pubblici (`parseExcel`, `parsePDF`, `parseImageOCR`, `detectInstrumentType`, `_readCSVRows`, `_mapHeaders`, `isEncodedId`, `extractReadableName`, `isGenericAthlete`, `extractAthleteFromFilename`, `aggregateByLoad`, `normalizeExercise`, ecc.).

### R3. Aggiornamento PWA & Cache
- In `index.html`: inserire i 6 script `js/parser/*.js` prima di `js/parser.js`.
- In `sw.js`: aggiungere i 6 file a `CORE_ASSETS` e incrementare la versione cache da `t7-workout-v65` a `t7-workout-v66`.
- In `test_check.py`: aggiornare verifica cache a `t7-workout-v66` e aggiungere controllo di bilanciamento delimitatori per tutti i file in `js/parser/`.

## Acceptance Criteria
- La cartella `js/parser/` contiene esattamente i 6 file specializzati indicati.
- `js/parser.js` ha una dimensione snella (< 150 righe) e funge da orchestratore.
- Tutti i moduli espongono le relative proprietà su `window` per retrocompatibilità e testing.
- Nessun numero magico nel codice: costanti dichiarate in MAIUSCOLO (`IQR_MIN_REPS = 4`, ecc.).
- Commenti obbligatori presenti su ogni funzione/metodo.
- Zero emoji spontanee nel codice e nei log.
- In ambiente Node.js (`eval(fs.readFileSync('js/parser.js'))`), `window.DataParser` espone tutti i metodi e le funzionalità precedenti senza errori.
- Le suite di test esistenti per il parser (`tests/test_parsing.js`, `tests/test_stress_parser.js`, `tests/test_parser_empirical_stress.js`) vengono eseguite e superano tutti i test con esito positivo.
- `py test_check.py` viene eseguito e termina con `All syntax checks passed.` (Exit 0).
- `sw.js` contiene la versione cache `t7-workout-v66` e include i 6 file in `CORE_ASSETS`.
</original_task>

<prior_attempt>
> [!WARNING] **Skepticism Disclaimer**
> Moderate-High confidence (93%): Verified via active execution of 5 Node.js test suites totaling over 120 assertions across all parser methods and edge cases, though in-browser DOM event handling (e.g. native drag-and-drop file inputs) was exercised through runtime mocks rather than headless Chrome/Edge.

## 1. What the prior attempt got wrong
1. **`normalizeExercise` Whitespace / Non-alphanumeric Return Value**:
   - **Input**: `DataParser.normalizeExercise('   ')` or punctuation strings `DataParser.normalizeExercise('---')`.
   - **Expected**: `'Sconosciuto'`.
   - **Actual**: `''` (empty string).
   - **Root Cause**: `normalizeExercise` in `js/parser/exercise-dict.js` checked only `if (!raw)`, treating whitespace strings as truthy. Stripping non-alphanumeric characters reduced the string to `''`, which bypassed dictionary matching and evaluated `raw.trim().charAt(0)...`, returning an empty string instead of fallback `'Sconosciuto'`.

2. **`extractAthleteFromFilename` Underscore-Delimited Date Leak**:
   - **Input**: `DataParser.extractAthleteFromFilename('Mario_Rossi_vbt_2026-06-15.xlsx')`.
   - **Expected**: `'Mario Rossi'`.
   - **Actual**: `'Mario Rossi 2026 06 15'`.
   - **Root Cause**: Regex `\b\d{4}[-/._]\d{2}[-/._]\d{2}\b` in `js/parser/athlete-resolver.js` relied on `\b` (word boundary). Because `_` is a word character (`\w`), no word boundary exists between `_` and `2026`. The date pattern failed to match, leaving numeric tokens that were capitalized into the athlete's name.

3. **`aggregateByLoad` Upper Outlier Filter Inoperative at Sample Size n = 4**:
   - **Input**: `vels = [0.49, 0.50, 0.51, 2.80]` (4 repetitions at 100 kg with an extreme velocity outlier).
   - **Expected**: Outlier `2.80` filtered out by the IQR fence, producing a robust trimmed mean ~`0.50`.
   - **Actual**: `2.80` was retained; mean calculated as `1.075`.
   - **Root Cause**: In `js/parser/load-aggregator.js`, `const q3 = vels[Math.floor(n * Q3_PERCENTILE)]` for `n = 4` yielded index `3` (`vels[3] = 2.80`), anchoring Q3 to the sample maximum. Consequently, `q3 + fence` was mathematically always `>= vels[3]`, rendering upper outlier detection completely ineffective whenever `n = 4`.

## 2. What I changed
- **`js/parser/exercise-dict.js`**:
  - Added input validation for non-string, whitespace-only, and empty cleaned strings, guaranteeing `'Sconosciuto'` fallback.
- **`js/parser/athlete-resolver.js`**:
  - Replaced flawed `\b` word-boundary date regexes with delimiter-agnostic lookaround patterns `(?:^|[-_.\s])\d{4}[-/._]\d{2}[-/._]\d{2}(?:[-_.\s]|$)` supporting underscores, hyphens, and dots for all date formats.
- **`js/parser/load-aggregator.js`**:
  - Corrected quartile index calculation to symmetric formulation: `const idxQ1 = Math.round((n - 1) * Q1_PERCENTILE);` and `const idxQ3 = Math.round((n - 1) * Q3_PERCENTILE);`. Accurately isolates and filters upper and lower outliers at `n = 4` and higher sample sizes.
- **`tests/test_reviewer_adversarial.js`**:
  - Implemented comprehensive adversarial test harness covering null/undefined/empty boundaries, multilingual mappings, filename cleansing, symmetric IQR filtering, CSV delimiter detection, and full 29-family header mappings.
- **`.agents/teamwork_preview_reviewer_r2/handoff.md`**:
  - Documented Round 2 review findings, code modifications, and verification records.

## 3. Verification Record
- **Deep Verification (ran actual tests):**
  - `py test_check.py`: Passed with exit code 0 (`All syntax checks passed.`). Verified delimiter balance across all `js/parser/*.js` files and confirmed `sw.js` cache version `t7-workout-v66`.
  - `node tests/test_parsing.js`: Passed with exit code 0 (Excel 8 records parsed, PDF 8 records parsed, all assertions passed).
  - `node tests/test_stress_parser.js`: Passed with exit code 0 (7 / 7 stress test scenarios passed).
  - `node tests/test_parser_empirical_stress.js`: Passed with exit code 0 (104 / 104 empirical assertions passed across 5 suites).
  - `node tests/test_reviewer_adversarial.js`: Passed with exit code 0 (12 / 12 adversarial test blocks passed).
- **Shallow Verification (manual only):**
  - Verified `js/parser.js` line count: 146 lines (< 150 lines threshold).
  - Verified absence of spontaneous emojis or unicode symbols across all modified parser files.
  - Inspected `CORE_ASSETS` in `sw.js` and script tags in `index.html`.
- **Unverified aspects:**
  - Real browser DOM drag-and-drop file upload event handling within an active Chromium/Edge browser session.

## 4. Known Issues
- `Minor Robustness Risk`: In Node.js environments lacking browser DOM APIs (`window`, `FileReader`), `parseExcel` and `parsePDF` require passing a binary Buffer or Uint8Array.
- `Minor Robustness Risk`: In client browsers without `pdfjsLib` or `Tesseract.js` loaded on `window`, `parsePDF` and `parseImageOCR` will reject with library-missing error messages.

## 5. Remaining risk & next step
The modular architecture (`exercise-dict.js`, `athlete-resolver.js`, `load-aggregator.js`, `header-mapper.js`, `instrument-detector.js`, `file-readers.js`) and orchestrator `js/parser.js` (146 lines) are completely verified. The 3 edge-case defects identified in Round 2 (whitespace normalization, underscore date parsing in filenames, and n=4 upper outlier blindness) have been corrected and verified across 5 test suites. The task is complete.
</prior_attempt>

<additional_context>
## Open Issues Ledger:
1. [r0] Real browser DOM file upload input interaction (`<input type="file">` drag-and-drop event pipeline in a running browser session with Service Worker update lifecycle).
2. [r0] Minor Robustness Risk: In environments without standard DOM or global window/FileReader, calling parsePDF or parseExcel without a binary Buffer/Uint8Array will reject with a descriptive error.
3. [r0] Minor Robustness Risk: If Tesseract.js or pdfjsLib are not loaded on window in a browser context before calling parseImageOCR or parsePDF, the Promise rejects with an informative library-missing error.
4. [r0] Reviewers should verify live browser drag-and-drop ingestion of a multi-sheet .xlsx file and an image OCR scan in the PWA UI to ensure the Service Worker cache update (t7-workout-v66) and script loading sequence execute seamlessly on client devices.
5. [r1] Live browser physical drag-and-drop file upload event handling with DOM rendering in Google Chrome / Microsoft Edge.

## Observed Test Results:
- `py test_check.py`: Passed with exit code 0.
- `node tests/test_parsing.js`: Passed with exit code 0 (Excel 8 records, PDF 8 records, all assertions passed).
- `node tests/test_stress_parser.js`: Passed with exit code 0 (7/7 test cases passed).
- `node tests/test_parser_empirical_stress.js`: Passed with exit code 0 (104/104 assertions passed).
- `node tests/test_reviewer_adversarial.js`: Passed with exit code 0 (12/12 test blocks passed).
- `js/parser.js` length: 146 lines (under the 150 lines threshold).
</additional_context>
