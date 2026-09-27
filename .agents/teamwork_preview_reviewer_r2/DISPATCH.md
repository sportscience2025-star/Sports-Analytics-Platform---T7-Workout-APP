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
> High confidence (96%): Verified through active execution of all 4 test suites (104 empirical stress assertions, 7 stress parser scenarios, and full Excel/PDF extraction tests) in Node.js, though real-device browser DOM drag-and-drop ingestion was verified via mock runners rather than a headless browser instance.

## 1. What the prior attempt got wrong
1. **Uninvoked Test Runners Masking Failures**:
   - **Input**: Executing `node tests/test_parsing.js` and `node tests/test_stress_parser.js`.
   - **Expected**: Automated test suites execute, run assertions, and output verification logs with exit code 0 upon pass.
   - **Actual**: Both scripts loaded without executing any tests, returning empty stdout and exit code 0.
   - **Root Cause**: Neither file invoked its main test function (`runTests()` in `test_parsing.js` and `runAll()` in `test_stress_parser.js`). The prior attempt claimed `runTests()` was executed with 100% success, but the invocation was missing from the committed test files.

2. **VBT Non-positive/Corrupt Load Filtering Failure (Scenarios 4 and 6 in `test_stress_parser.js`)**:
   - **Input**: Excel data containing a load column (`"Carga"`) with corrupt non-numeric values (`"broken"`) or non-positive loads (`0`, `-10`) paired with valid velocities (`0.55`, `0.75`).
   - **Expected**: Rows lacking a valid positive load (`load > 0`) must be rejected/filtered out in VBT datasets, and if all rows are filtered, `DataParser.parseExcel` must reject with `Error("Nessun dato utile trovato nel file Excel.")`.
   - **Actual**: The parser accepted rows with corrupt/zero/negative loads because `(record.velocity !== null && record.velocity > 0)` was evaluated as an independent `OR` clause in `hasValidData`, causing Scenario 4 (`Non-numeric Values in Numeric Fields`) to fail validation and Scenario 6 (`All Invalid/Filtered Records`) to succeed instead of rejecting.
   - **Root Cause**: In `js/parser/file-readers.js`, `hasValidData` did not enforce that in datasets defining a `load` column (`hasLoadCol = Object.values(colMap).includes('load')`), a VBT record strictly requires `record.load !== null && record.load > 0`. A velocity measurement without a positive load is invalid for VBT profiles.

## 2. What I changed
- **`js/parser/file-readers.js`**:
  - Added detection of whether the current sheet contains a mapped load column: `const hasLoadCol = Object.values(colMap).includes('load');`.
  - Enforced `hasValidVbt` logic: when `hasLoadCol` is true, VBT validity strictly requires `(record.load !== null && record.load > 0)`. If false, falls back to checking velocity and derived metrics.
  - Removed redundant standalone VBT metric checks from `hasValidData` to prevent bypass of load validation.
- **`tests/test_parsing.js`**:
  - Added invocation `runTests().catch(...)` at the end of the file to execute the Excel and PDF extraction assertions upon running `node tests/test_parsing.js`.
- **`tests/test_stress_parser.js`**:
  - Added invocation `runAll().catch(...)` at the end of the file to execute all 7 stress test scenarios upon running `node tests/test_stress_parser.js`.
- **`.agents/teamwork_preview_reviewer_r1/handoff.md`**:
  - Documented findings, code modifications, and complete verification records for Round 1 review.

## 3. Verification Record
- **Deep Verification (ran actual tests):**
  - `py test_check.py`: Passed with exit code 0 (`Validating js/data-analysis.js... All syntax checks passed.`). Validated delimiter balance across all `js/parser/` and `js/logic/` files and verified `sw.js` cache version `t7-workout-v66`.
  - `node tests/test_parsing.js`: Passed with exit code 0 (`Excel parsed successfully: 8 records found.`, `PDF parsed successfully: 8 records found.`, `All assertions passed successfully!`).
  - `node tests/test_stress_parser.js`: Passed with exit code 0 (7 / 7 test cases passed: Standard Good Data, No Columns Matching, Sparse Sheet with Undefined Rows, Non-numeric Values in Numeric Fields, Mismatched Row Lengths, All Invalid/Filtered Records, Drop Height Header Mapping).
  - `node tests/test_parser_empirical_stress.js`: Passed with exit code 0 (104 / 104 assertions passed across all 5 empirical suites: Cross-Instrument Discrimination, Medicine Ball Edge Cases, Repeated Trials & aggregateByLoad Integrity, Header Collision Avoidance, Robustness & Adversarial Boundaries).
- **Shallow Verification (manual only):**
  - Verified `js/parser.js` line count: 146 lines (< 150 lines threshold).
  - Verified absence of spontaneous emojis or unicode symbols across all 7 parser files.
  - Inspected `sw.js` `CORE_ASSETS` and `index.html` script inclusions for correct load ordering.
- **Unverified aspects:**
  - Live browser physical drag-and-drop file upload event handling with DOM rendering in Google Chrome / Microsoft Edge.

## 4. Known Issues
- `Minor Robustness Risk`: In Node.js environments lacking browser APIs (`window`, `FileReader`), `parseExcel` and `parsePDF` require passing a binary Buffer or Uint8Array.
- `Minor Robustness Risk`: In client browsers without `pdfjsLib` or `Tesseract.js` loaded on `window`, `parsePDF` and `parseImageOCR` will reject with library-missing error messages.

## 5. Remaining risk & next step
The modularization of `js/parser/` into 6 single-responsibility modules (`exercise-dict.js`, `athlete-resolver.js`, `load-aggregator.js`, `header-mapper.js`, `instrument-detector.js`, `file-readers.js`) plus the lightweight facade `js/parser.js` (146 lines) is complete and verified. The hidden VBT load-filtering bug was resolved, test runners were properly hooked up, and all 4 test suites pass with 100% success. The implementation is complete and ready for deployment.
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
- `js/parser.js` length: 146 lines (under the 150 lines threshold).
</additional_context>
