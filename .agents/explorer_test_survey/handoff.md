# Report di Indagine Infrastruttura di Test, SW Cache e Validazione

## 1. Observation

### 1.1 `test_check.py`
- **File**: `e:/Nuove App Installate/App esercizi scienze motorie/test_check.py` (82 righe totali).
- **Controllo presenza file ed elementi chiave (righe 3-38)**:
  Verifica che `js/data-analysis.js` esista e contenga esattamente 24 token/stringhe obbligatorie:
  1. `vbtZonesPlugin`
  2. `filter-athlete-select`
  3. `filter-exercise-select`
  4. `filter-exercise-pills`
  5. `getAthletes`
  6. `getExercisesForAthlete`
  7. `renderFilterBar`
  8. `selectAthleteAndExercise`
  9. `syncManualInputsWithSelection`
  10. `renderDashboardForSelection`
  11. `generateQuickActions`
  12. `executeNLPQuery`
  13. `power-curve-chart`
  14. `vbt-chart`
  15. `#00f0ff`
  16: `neonGlowPlugin`
  17. `Pmax`
  18. `Lopt`
  19. `Vopt`
  20. `Forza Massima`
  21. `Forza-Velocità`
  22. `Velocità-Forza`
  23. `Velocità Pura`
  24. `1RM Stimato`
  Se anche solo uno di questi token è assente, lo script fallisce con `sys.exit(1)`.
- **Controllo versione Cache SW (righe 40-46)**:
  ```python
  with open("sw.js", "r", encoding="utf-8") as f:
      sw_code = f.read()

  if "t7-workout-v64" not in sw_code:
      print("FAILED: sw.js does not contain expected CACHE_NAME")
      sys.exit(1)
  ```
  La verifica del nome cache in `sw.js` è una corrispondenza esatta per la stringa `"t7-workout-v64"`.
- **Controllo bilanciamento delimitatori su file modulari di logica (righe 48-79)**:
  Verifica il bilanciamento di `{ }`, `( )`, `[ ]` per:
  - `js/logic/risk-analyzer.js`
  - `js/logic/periodization.js`
  - `js/logic/phase-builder.js`
  - `js/logic/session-builder.js`
  - `js/logic/exercise-formatter.js`
  - `js/logic/warmup-cooldown.js`
  - `js/logic/rationale-generator.js`
  - `js/logic/data-persistence.js`
  - `js/logic.js`
- **Comando di esecuzione**: `py test_check.py` (su Windows, il comando `python` potrebbe non puntare all'alias PATH corretto, mentre `py` invoca il Python launcher registrato ed esce con codice 0).

### 1.2 `sw.js` (Service Worker)
- **File**: `e:/Nuove App Installate/App esercizi scienze motorie/sw.js` (139 righe).
- **Versione cache corrente (riga 6)**: `const CACHE_NAME = 't7-workout-v64';`.
- **Elenco asset pre-caching (`CORE_ASSETS`, righe 9-61)**:
  Contiene 41 voci, inclusi CSS, immagini e tutti i file JS modulari di logica, UI e viste:
  - `./js/data-analysis.js` (riga 45).
  - I file modulari della cartella `js/analysis/` (es. `test-registry.js`, `reactive-grid.js`, `medicine-ball-physics.js`, `analysis-exporter.js`) non sono ancora presenti in `CORE_ASSETS`.
- **Bypass per i test (riga 103)**:
  `if (request.url.includes('/tests/')) return;`
  Gli script nella cartella `/tests/` sono esplicitamente esclusi dal caching del Service Worker.

### 1.3 Struttura dei Test in `tests/`
- **Totale file**: 39 file nella cartella `tests/`.
- **Modalita di esecuzione disponibili**:
  1. **Esecuzione diretta Node.js**: I file di test principali (es. `tests/test_logic.js`, `tests/test_multi_instrument_excel.js`, `tests/test_data_modular.js`, `tests/test_views_modular.js`) sono scritti in standard CommonJS/Node.js (`require('fs')`, `path`, `global.window = {}`, `eval(...)`, `process.exit(code)`). Esecuzione verificata: `node tests/test_multi_instrument_excel.js` e `node tests/test_data_modular.js` terminano con codice 0.
  2. **Esecuzione Browser via iframe**: `tests/runner.html` itera sull'array `testFiles` e avvia ogni test all'interno di un iframe caricando `tests/iframe_runner.html?test=<nome_file>`. `iframe_runner.html` implementa un polyfill trasparente per le API Node.js nel browser (`fs.readFileSync` sincrono via XMLHttpRequest, `path.join`, `window.Buffer`, `window.process.exit`, intercettazione messaggi per comunicare a `runner.html`).
  3. **Stato del file `tests/test_analysis.js`**: Attualmente è uno scheletro incompleto di appena 12 righe, che non implementa alcun test reale per la sezione analisi dati.
  4. **Librerie Excel nel runtime**: `exceljs` e `xlsx` non sono pacchetti npm locali in `node_modules` (il progetto usa CDN nel browser). Nei test Node.js esistenti (es. `tests/test_multi_instrument_excel.js`), viene istanziato un mock leggero (`mockXLSX`) per consentire l'esecuzione offline e autonoma.

---

## 2. Logic Chain

1. **Retrocompatibilita vincolante di `js/data-analysis.js`**:
   `test_check.py` esegue una scansione testuale diretta di `js/data-analysis.js`. Quando il codice viene modularizzato creando la sottocartella `js/analysis/`, `js/data-analysis.js` deve fungere da orchestratore mantenendo inalterati i 24 identificatori/metodi (ad es. `vbtZonesPlugin`, `filter-athlete-select`, `renderFilterBar`, `selectAthleteAndExercise`, `syncManualInputsWithSelection`, `renderDashboardForSelection`, `generateQuickActions`, `executeNLPQuery`, ecc.).
2. **Allineamento obbligatorio Cache Bumping**:
   Battere la cache a `t7-workout-v65` in `sw.js` senza aggiornare la riga 44 di `test_check.py` genererebbe un fallimento immediato (`FAILED: sw.js does not contain expected CACHE_NAME`). Entrambi i file devono essere aggiornati in sincronia atomica.
3. **Integrazione dei Nuovi Moduli in `sw.js` e `index.html`**:
   I file che verranno creati in `js/analysis/` (`test-registry.js`, `reactive-grid.js`, `medicine-ball-physics.js`, `analysis-exporter.js`):
   - Devono essere inclusi nei `CORE_ASSETS` di `sw.js` affinche l'applicazione rimanga funzionante offline al 100%.
   - Devono essere inclusi con tag `<script>` in `index.html` prima di `js/data-analysis.js`.
4. **Estensione della validazione sintattica in `test_check.py`**:
   `test_check.py` esegue il bilanciamento delle parentesi solo su `logic_files`. E raccomandato estendere questa scansione anche ai nuovi file di `js/analysis/` (`analysis_files`), garantendo che qualsiasi errore sintattico venga intercettato prima del deploy.
5. **Architettura ideale per `tests/test_analysis_reactive_grid.js`**:
   Per integrarsi sia nella pipeline da terminale (`node tests/test_analysis_reactive_grid.js`) che nel runner visivo (`tests/runner.html` via `iframe_runner.html`), la nuova suite deve:
   - Configurare `global.window` e i mock minimi per l'ambiente browser.
   - Caricare ed eseguire i moduli (`js/physics-engine.js`, `js/parser.js`, `js/analysis/test-registry.js`, `js/analysis/medicine-ball-physics.js`, `js/analysis/reactive-grid.js`, `js/analysis/analysis-exporter.js`).
   - Fornire un mock/stub per ExcelJS (qualora eseguito in Node senza browser) o delegare alle librerie se presenti.
   - Articolarsi in 4 sezioni di asserzioni rigorose e verificabili.

---

## 3. Caveats

- **Ambiente Node vs Browser**: Nei test eseguiti puramente sotto Node.js da CLI non sono presenti per impostazione predefinita `document` completo o canvas di `Chart.js`. I test focalizzati sul modello dati reattivo, sulle formule fisiche e sulla struttura dei fogli Excel devono testare le classi e i metodi logici (`TestRegistry`, `MedicineBallPhysics`, `ReactiveGridModel`, `AnalysisExporter`) senza dipendere obbligatoriamente dall'effettivo rendering grafico di Chart.js nel DOM reale, oppure fornendo mock leggeri per `document.createElement`.
- **CDN ExcelJS**: Poiche `exceljs` non risiede in `node_modules`, `AnalysisExporter` deve essere progettato con pattern difensivo: supportare sia `window.ExcelJS` (browser) che un fallback o costruttore compatibile iniettabile nei test.
- **Nessuna modifica al codice sorgente in questa fase**: In ossequio al ruolo di Teamwork Explorer, questa indagine e strettamente di sola lettura; non sono stati modificati i file di produzione.

---

## 4. Conclusion & Recommendations

### 4.1 Modifiche Richieste per Cache Bumping e Validazione Sintassi
1. In `sw.js`:
   - Incrementare `const CACHE_NAME = 't7-workout-v65';` (riga 6).
   - Aggiungere a `CORE_ASSETS` (dopo riga 45):
     ```javascript
     './js/analysis/test-registry.js',
     './js/analysis/reactive-grid.js',
     './js/analysis/medicine-ball-physics.js',
     './js/analysis/analysis-exporter.js',
     ```
2. In `test_check.py`:
   - Aggiornare il controllo della versione cache (riga 44):
     ```python
     if "t7-workout-v65" not in sw_code:
         print("FAILED: sw.js does not contain expected CACHE_NAME")
         sys.exit(1)
     ```
   - Aggiungere il controllo del bilanciamento delimitatori sui file di analisi:
     ```python
     analysis_files = [
         "js/analysis/test-registry.js",
         "js/analysis/reactive-grid.js",
         "js/analysis/medicine-ball-physics.js",
         "js/analysis/analysis-exporter.js"
     ]
     for af in analysis_files:
         if os.path.exists(af):
             with open(af, "r", encoding="utf-8") as f:
                 c = f.read()
                 if c.count('{') != c.count('}'):
                     print(f"FAILED: Mismatched braces in {af}")
                     sys.exit(1)
                 if c.count('(') != c.count(')'):
                     print(f"FAILED: Mismatched parentheses in {af}")
                     sys.exit(1)
                 if c.count('[') != c.count(']'):
                     print(f"FAILED: Mismatched brackets in {af}")
                     sys.exit(1)
     ```

### 4.2 Struttura Dettagliata per `tests/test_analysis_reactive_grid.js`

La suite deve coprire programmaticamente i 4 pilastri del requisito con asserzioni esaustive:

#### Sezione 1: `TestRegistry` & Polimorfismo Strumenti
- **Registrazione di tutti gli 8 tipi di test**:
  - `VBT` (Encoder Lineari)
  - `FORCE_PLATE` (Pedana di Forza)
  - `BLOCK_ACCEL` (Accelerometri Blocchi)
  - `SPRINT_TIMING` (Fotocellule Sprint)
  - `VIDEO_KINEMATICS` (Videoanalisi 2D)
  - `JUMP_TEST` (Salto Verticale)
  - `MEDICINE_BALL` (Palla Medica)
  - `GENERAL_TABULAR` (Dati Tabellari Grezzi)
- **Verifica definizioni colonne**:
  - Ogni tipo registrato deve restituire un array di colonne con proprietà: `key`, `label`, `unit`, `type`, `step`/`placeholder`, `required`.
  - Verifica della corretta differenziazione: es. `MEDICINE_BALL` espone colonne `ballWeight` (kg), `distance` (m), `flightTime` (s), `releaseAngle` (°), `estimatedVelocity` (m/s), `estimatedPower` (W).
  - Validazione dei tipi di dati: input non validi (es. stringhe vuote, numeri negativi) scartati o segnalati correttamente.

#### Sezione 2: `MedicineBallPhysics` (Motore Fisico Balistico)
- **Calcolo balistico nominale**:
  - Con Peso = 3 kg, Distanza = 10 m, parametri standard (angolo 45°, altezza rilascio 1.0 m o 0 m):
    - Velocità di uscita stimata $v_0$ coerente con la cinematica balistica (~9.4 - 9.9 m/s).
    - Potenza media calcolata secondo il lavoro meccanico o la formula Sayers/Harman ($P_{mean} = \frac{\frac{1}{2} m v_0^2}{t_{push}}$, con $t_{push} = 0.18$ s, potenza risultante ~800 W).
- **Calcolo con parametri avanzati espliciti**:
  - Inserimento di tempo di volo $t_v$ misurato e angolo $\theta$ personalizzato: il motore deve calcolare la velocità reale $v_0 = \frac{d}{t_v \cos\theta}$ o la componente parabolica effettiva.
- **Robustezza ed Edge Cases**:
  - Palla con peso $\le 0$ o distanza $\le 0$: restituzione sicura di 0 o `null`, senza eccezioni non gestite.
  - Nessun valore `NaN` o stringa `"undefined"` generata in alcuna combinazione di input parziale.

#### Sezione 3: `ReactiveGridModel` & Reattività con Debounce a 250ms
- **Operazioni sul modello dati**:
  - `addRow(data)`: aggiunge una riga rispettando le colonne del test corrente.
  - `removeRow(index)`: elimina la riga specificata e notifica gli ascoltatori.
  - `updateCell(rowIndex, colKey, value)`: aggiorna il valore e attiva il calcolo reattivo.
  - `changeTestType(newType)`: trasforma lo schema colonne conservando o adattando le righe.
- **Debounce 250ms**:
  - Esecuzione di 5 digitazioni consecutive a intervalli di 50ms: verificare con un timer asincrono che il ricalcolo delle metriche venga scatenato una sola volta dopo 250ms di inattività.
- **Gestione Dati Parziali**:
  - Inserimento di una sola riga incompleta: il modello non deve bloccarsi ne generare `NaN`, deve fornire un indicatore di avanzamento ("1 prova registrata") e metriche istantanee safe.

#### Sezione 4: `AnalysisExporter` (Esportazione Excel Sbloccata)
- **Verifica Cartella di Lavoro a 2 Fogli**:
  - Foglio 1 denominato `"Dati Prove"`.
  - Foglio 2 denominato `"Sintesi Biomeccanica & KPI"`.
- **Verifica Protezione e Password (Multi-Agent Safety Rules)**:
  - Nessun foglio protetto (`worksheet.protect` mai chiamato).
  - Nessuna cella bloccata (`locked: false` o assenza di protezione attiva).
  - Nessuna password impostata.
- **Verifica Contenuti**:
  - Foglio 1 contiene intestazioni formattate e tutte le righe della tabella.
  - Foglio 2 contiene i KPI riepilogativi (medie, picchi) e l'area note riservata all'allenatore.

### 4.3 Registrazione in `runner.html`
Aggiungere `'test_analysis_reactive_grid.js'` nell'array `testFiles` di `tests/runner.html` per consentire l'esecuzione con un clic nel test runner HTML della PWA.

---

## 5. Verification Method

Per verificare in modo indipendente le conclusioni di questo report:

1. **Verifica sintassi e vincoli attuali**:
   ```bash
   py test_check.py
   ```
   *Esito atteso attuale*: "Validating js/data-analysis.js... All syntax checks passed."
2. **Verifica presenza token in `js/data-analysis.js`**:
   Ispezionare `js/data-analysis.js` con ricerca testuale per i 24 identificatori elencati nella Sezione 1.1.
3. **Verifica versione cache in `sw.js`**:
   Ispezionare riga 6 di `sw.js` (`CACHE_NAME = 't7-workout-v64'`).
4. **Verifica esecuzione test in Node.js**:
   ```bash
   node tests/test_multi_instrument_excel.js
   node tests/test_data_modular.js
   node tests/test_logic.js
   ```
   *Esito atteso*: Tutti i test completano con successo (exit code 0).
5. **Condizione di invalidazione**:
   Qualora un agente modificasse `sw.js` portando la cache a `t7-workout-v65` senza aggiornare `test_check.py`, il comando `py test_check.py` fallirebbe immediatamente.
