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
> I am confident that the modularization preserves the exact functional behavior in both Node.js and browser runtimes because all 104 assertions in the empirical stress test passed and all 15 static facade methods were explicitly tested, though full browser UI file drag-and-drop interaction was not verified with an active DOM renderer.

## 1. What I changed
- `js/parser/exercise-dict.js`: Created module with `EXERCISE_DICT` (multilingual IT/ES/EN dictionary) and `normalizeExercise(raw)`, exposing `window._parserExerciseDict` and `window._parserNormalizeExercise`.
- `js/parser/athlete-resolver.js`: Created module with `DEVICE_KEYWORDS`, `MIN_HEX_TOKEN_LENGTH`, `isGenericAthlete`, `isDeviceToken`, `isEncodedId`, `extractReadableName`, and `extractAthleteFromFilename`, exposing `window._parserAthleteResolver`.
- `js/parser/load-aggregator.js`: Created module with constants (`IQR_MIN_REPS = 4`, `IQR_FENCE_FACTOR = 1.5`, `TRIM_RATIO = 0.1`, `LOAD_ROUND_STEP = 2.5`, percentiles, decimal precisions) and `aggregateByLoad(records)` with IQR outlier rejection and 10% trimmed mean, exposing `window._parserAggregateByLoad`.
- `js/parser/header-mapper.js`: Created module with `readCSVRows(text)` (delimiter auto-detection) and `mapHeaders(headers)` (29 semantic header families with strict precedence), exposing `window._parserHeaderMapper`.
- `js/parser/instrument-detector.js`: Created module with `detectInstrumentType(records, headers, extraContext)` classifying the 8 measurement instruments (`VBT`, `FORCE_PLATE`, `BLOCK_ACCEL`, `SPRINT_TIMING`, `MEDICINE_BALL`, `VIDEO_KINEMATICS`, `JUMP_TEST`, `GENERAL_TABULAR`), exposing `window._parserInstrumentDetector`.
- `js/parser/file-readers.js`: Created module with uppercase constants (`MAX_HEADER_SEARCH_ROWS = 15`, `MIN_STRING_CELLS_FOR_HEADER = 2`, etc.), 3-tier `parseExcel`, `parsePDF`, `parseImageOCR`, `_parseTextData`, and `_extractPairsFromText`, exposing `window._parserFileReaders`.
- `js/parser.js`: Refactored monolithic file (1332 lines) into a lean orchestrator of 145 lines (< 150 lines). Loads the 6 modules dynamically via `fs.readFileSync` and `eval` when executed in Node.js environments and defines `window.DataParser` with all 15 static methods for complete backward compatibility.
- `index.html`: Injected `<script>` tags for the 6 `js/parser/*.js` modules immediately prior to `js/parser.js`.
- `sw.js`: Added the 6 parser modules to `CORE_ASSETS` and bumped cache version from `t7-workout-v65` to `t7-workout-v66`.
- `test_check.py`: Updated cache assertion to `t7-workout-v66` and added delimiter balance check ({}, (), []) for all 6 modular parser files plus `js/parser.js`.

## 2. Why
- Satisfies requirement R1 by cleanly splitting the monolithic 1332-line parser into single-responsibility modules matching the architecture of `js/ui.js` and `js/logic.js`.
- Satisfies requirement R2 by keeping `js/parser.js` under 150 lines as a robust facade for browser and Node.js environments (`eval`/`loadModule`).
- Satisfies requirement R3 and project PWA rules by bumping cache version to `t7-workout-v66`, adding modular scripts to `index.html` and `sw.js`, and extending `test_check.py`.

## 3. Verification Record
- **Deep Verification (ran actual tests):**
  - `py test_check.py`: Passed with exit code 0. Validated `js/data-analysis.js` requirements, `sw.js` cache version `t7-workout-v66`, and delimiter balancing across all `js/logic/` and `js/parser/` files.
  - `node tests/test_parser_empirical_stress.js`: 104/104 assertions passed with exit code 0 across all 5 test suites (cross-instrument discrimination, medicine ball physics, repeated trials aggregation integrity, header collisions, adversarial malformed inputs).
  - `node tests/test_parsing.js`: Loaded and executed with exit code 0. Also executed internal `runTests()` asserting both sample Excel and PDF extraction data with 100% success.
  - `node tests/test_stress_parser.js`: Loaded and executed with exit code 0.
  - Custom Node contract verification script: Explicitly verified presence and functionality of all 15 static methods on `window.DataParser` and verified individual `window._parser*` exports.
- **Shallow Verification (manual run only):**
  - Inspected line counts: `js/parser.js` has 145 lines (< 150 lines target).
  - Inspected delimiter balance across all 7 parser files (braces, parentheses, brackets all match).
- **Unverified aspects:**
  - Real browser DOM file upload input interaction (`<input type="file">` drag-and-drop event pipeline in a running browser session with Service Worker update lifecycle).

## 4. Known Issues
- `Minor Robustness Risk`: In environments without standard DOM or global `window`/`FileReader`, calling `parsePDF` or `parseExcel` without a binary Buffer/Uint8Array will reject with a descriptive error.
- `Minor Robustness Risk`: If `Tesseract.js` or `pdfjsLib` are not loaded on `window` in a browser context before calling `parseImageOCR` or `parsePDF`, the Promise rejects with an informative library-missing error.

## 5. Untested Edge Cases & Next Step
- Reviewers should verify live browser drag-and-drop ingestion of a multi-sheet `.xlsx` file and an image OCR scan in the PWA UI to ensure the Service Worker cache update (`t7-workout-v66`) and script loading sequence execute seamlessly on client devices.
</prior_attempt>

<additional_context>
## Open Issues Ledger:
1. Real browser DOM file upload input interaction (`<input type="file">` drag-and-drop event pipeline in a running browser session with Service Worker update lifecycle).
2. Minor Robustness Risk: In environments without standard DOM or global window/FileReader, calling parsePDF or parseExcel without a binary Buffer/Uint8Array will reject with a descriptive error.
3. Minor Robustness Risk: If Tesseract.js or pdfjsLib are not loaded on window in a browser context before calling parseImageOCR or parsePDF, the Promise rejects with an informative library-missing error.
4. Reviewers should verify live browser drag-and-drop ingestion of a multi-sheet .xlsx file and an image OCR scan in the PWA UI to ensure the Service Worker cache update (t7-workout-v66) and script loading sequence execute seamlessly on client devices.

## Observed Test Results:
- `py test_check.py`: Passed with exit code 0.
- `node tests/test_parsing.js`: Passed with exit code 0.
- `node tests/test_stress_parser.js`: Passed with exit code 0.
- `node tests/test_parser_empirical_stress.js`: 104/104 assertions passed with exit code 0.
- `js/parser.js` length: 146 lines (under the 150 lines threshold).
</additional_context>
