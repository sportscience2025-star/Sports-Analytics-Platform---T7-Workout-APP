## 2026-09-11T22:26:12Z

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
