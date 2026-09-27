# Original User Request

## Initial Request — 2026-09-11T11:29:05+02:00

You are teamwork_preview_swe, the SWE Light orchestrator for this project.

## Your Identity & Workspace
- Your working directory: e:/Nuove App Installate/App esercizi scienze motorie/.agents/teamwork_preview_swe_1
- Project workspace: e:/Nuove App Installate/App esercizi scienze motorie
- Path to Original Request: e:/Nuove App Installate/App esercizi scienze motorie/.agents/ORIGINAL_REQUEST.md
- Project guidelines: e:/Nuove App Installate/App esercizi scienze motorie/.agents/AGENTS.md

## Task Description
Implement the improvements proposed in the analysis of the `analyzeRiskProfile` function in `js/logic.js` and update tests in `tests/test_logic.js`.

Requirements:
- R1. Validazione Input: Add checks at the start of `analyzeRiskProfile` to prevent TypeError if `selectedPathologyIds` is not a valid array or if `window.App.getConditions()` returns undefined (default/fallback to LOW risk).
- R2. Categorie Critiche: Extend the logic assigning `hasHighRiskCategory` to include `reumatologiche` (if `riskLevel` is not 'low') and `speciali` (per requirements / same logic as neurologiche/sistemiche).
- R3. Bonus Comorbilità: Add +1 to `riskScore` for each category that contains 2 or more active pathologies among those selected by the user.
- R4. Soglie Configurabili: Introduce `this.thresholds = { HIGH: 4, MEDIUM: 2 };` in the constructor of `WorkoutGeneratorAI` and update `analyzeRiskProfile` to use `this.thresholds.HIGH` and `this.thresholds.MEDIUM` instead of hardcoded numbers. Update the comment at line 41 in `logic.js`.
- R5. Testing & Verification: Update `tests/test_logic.js` with missing conditions (reumatologiche, comorbidity) in the initial mock, write at least 3 new test cases validating the changes, and run the test suite. Also run `py test_check.py` as required by project rules.
- Cache bump: Remember to increment the service worker cache version in `sw.js` when modifying JS files.

Please run the SWE Light loop, maintain your BRIEFING.md and progress.md in your working directory, ensure all tests pass, and report back when finished.

## 2026-09-11T11:09:01Z

# Teamwork Project Prompt

Rinnovare e potenziare l'architettura dell'area Analisi Dati della PWA T7 Workout realizzando un flusso unificato seamless (Dropzone compatta + Griglia tabellare reattiva editabile + Dashboard Chart.js/KPI live-binding con debounce a 250ms), maschere adattive polimorfiche estensibili a registro per tutti i tipi di test biomeccanici (incluso il nuovo test MEDICINE_BALL con cinematica balistica) ed esportazione Excel (.xlsx) strutturata a due fogli completamente sbloccata per il coach.

Working directory: e:/Nuove App Installate/App esercizi scienze motorie
Integrity mode: development

## Requirements

### R1. Flusso Unificato Seamless & Griglia Reattiva
- Eliminare la separazione in due tab distinti ("Carica File" vs "Inserimento Manuale").
- Creare un layout integrato seamless:
  1. Dropzone compatta in alto con selettore test e selettore atleta.
  2. Griglia tabellare reattiva direttamente sottostante: parte pulita con le intestazioni delle colonne del test selezionato e pulsante rapido "+ Aggiungi Prova/Riga" (con opzione per inserire rapidamente dati di esempio per test rapidi).
  3. Se l'utente trascina o seleziona un file (CSV, Excel), il parser auto-rileva lo strumento, imposta il tipo di test corretto e popola istantaneamente la griglia con i dati estratti.
  4. L'utente può editare direttamente qualsiasi cella, aggiungere o eliminare prove con effetto immediato sui dati.

### R2. Architettura a Registro & Maschere Adattive Polimorfiche
- Realizzare un'architettura modulare a registro aperta (`TestRegistry`) che definisca per ogni tipo di strumento: id, etichetta leggibile, colonne della griglia (nome, tipo, unità di misura, placeholder, step, validazione), mapping dati grezzi e regole di calcolo.
- Supportare nativamente con maschere e colonne dedicate i seguenti strumenti:
  - **VBT (Encoder Lineari)**: Carico (kg), Velocità Media Propulsiva (m/s), Picco Velocità (m/s), Potenza (W), ROM (cm).
  - **Pedana di Forza (Force Plate)**: Fz (N), Picco di Forza (N), RFD (N/s), Impulso (N·s), RSI-mod.
  - **Accelerometri / IMU Blocchi di Partenza**: Accelerazione Orizzontale (m/s²), Triassiale (X, Y, Z), Tempo di Reazione (s), Durata Spinta (s).
  - **Fotocellule Sprint**: Split intermedi (5m, 10m, 20m, 30m, 60m), Tempi cumulativi, Profilo Samozino-Morin.
  - **Videoanalisi Cinematica 2D**: Angoli articolari (Ginocchio, Anca, Caviglia, Tronco), Velocità angolare (°/s).
  - **Test di Salto Verticale (SJ, CMJ, Drop Jump)**: Altezza Salto (cm), Tempo di Contatto (ms), Drop Height (cm), RSI, EUR.
  - **Test con Palla Medica (MEDICINE_BALL - NUOVO TIPO)**: Peso palla (kg), Distanza lancio (m), Tempo di volo (s), Angolo rilascio (°), Velocità stimata (m/s), Potenza stimata (W).
  - **Dati Tabellari Grezzi (General Tabular)**: Fallback dinamico a colonne generiche rilevate dal file.
- Il motore fisico per `MEDICINE_BALL` deve calcolare velocità di uscita $v_0$ e potenza media $P_{mean}$ (Sayers/Harman) supportando sia l'inserimento completo (con tempo di volo e/o angolo reale) sia i fallback biomeccanici automatici standard (angolo 45°, altezza rilascio 1.0m, tempo di spinta 0.18s) se l'utente inserisce solo Peso (kg) e Distanza (m).

### R3. Live-Binding in Tempo Reale con Debounce a 250ms
- Qualsiasi modifica nella griglia (digitazione in una cella, aggiunta o rimozione riga) attiva un listener con debounce di 250ms che ricalcola automaticamente metriche fisiche, box KPI e grafici Chart.js, senza richiedere pulsanti manuali "Calcola".
- Gestione non bloccante e robusta dei dati parziali: se l'utente sta digitando o ha inserito un numero parziale di prove (es. 1 solo punto per VBT), mostrare badge informativo di avanzamento e metriche istantanee della singola prova, prevenendo categoricamente crash, valori `NaN` o stringhe `"undefined"` a video.

### R4. Esportazione Fogli Excel Sbloccata (.xlsx)
- Inserire nella barra degli strumenti della tabella un pulsante dedicato "Esporta Foglio Excel (.xlsx)".
- Generare tramite libreria già inclusa (SheetJS o ExcelJS) una cartella di lavoro a 2 fogli:
  - Foglio 1: "Dati Prove" contenente l'intera tabella dati formattata, completamente sbloccata (zero celle protette, zero password).
  - Foglio 2: "Sintesi Biomeccanica & KPI" con i valori riepilogativi, medie, picchi, indici calcolati e una sezione chiara con spazio libero per note e osservazioni del coach.

### R5. Organizzazione Modulare del Codice & Multi-Agent Safety Rules
- Suddividere il codice in modo strutturato e pulito creando una cartella dedicata (es. `js/analysis/` o moduli specifici: `test-registry.js`, `reactive-grid.js`, `medicine-ball-physics.js`, `analysis-exporter.js`), orchestrati da `js/data-analysis.js`.
- Preservare in `js/data-analysis.js` tutti gli identificatori, metodi e stringhe richiesti da `test_check.py` per garantire piena retrocompatibilità.
- Incrementare la versione della cache in `sw.js` (es. `t7-workout-v65`) e allineare `test_check.py`.
- Nessun utilizzo di emoji spontanee nel codice e nelle UI create.

## Acceptance Criteria

### Funzionalità Flusso Unificato & Griglia
- [ ] La UI di Data Analisi non presenta più tab separati: la dropzone è integrata sopra la griglia tabellare reattiva.
- [ ] Selezionando uno qualsiasi degli 8 tipi di test, la griglia adatta istantaneamente le colonne, le intestazioni e le unità di misura al tipo selezionato.
- [ ] Il pulsante "+ Aggiungi Prova/Riga" inserisce una nuova riga con input predisposti; il pulsante di rimozione elimina la riga selezionata.
- [ ] Il caricamento di un file popola direttamente la griglia con i valori rilevati e seleziona il test corretto.

### Motore Fisico & Test Medicine Ball
- [ ] Il tipo `MEDICINE_BALL` è presente nel registro test e riconosciuto sia da selezione manuale che da file.
- [ ] Inserendo Peso = 3 kg e Distanza = 10 m, il sistema calcola automaticamente velocità di rilascio coerente (~9.9 m/s) e potenza stimata senza errori.
- [ ] Inserendo anche tempo di volo e angolo reale, il calcolo della cinematica riflette i valori effettivi inseriti.

### Live Binding & Reattività
- [ ] Modificando un valore numerico in una cella, dopo 250ms di inattività i box KPI e i grafici Chart.js si aggiornano automaticamente.
- [ ] Inserendo dati parziali, l'interfaccia non mostra mai stringhe "undefined" o crash di script.

### Esportazione Excel
- [ ] Il pulsante di esportazione scarica un file `.xlsx` valido con 2 fogli ("Dati Prove" e "Sintesi Biomeccanica & KPI").
- [ ] Nessuna cella è bloccata e nessuna protezione o password è impostata nel foglio generato.

### Validazione & Test
- [ ] `py test_check.py` viene eseguito e termina con esito positivo ("All syntax checks passed.").
- [ ] Viene creata ed eseguita con successo una suite di test dedicata (es. `tests/test_analysis_reactive_grid.js`) che verifica programmaticamente: registro test, calcoli balistici palla medica, reattività del modello dati ed export Excel.
## 2026-09-11T21:59:48Z

# Teamwork Project Prompt

Scomporre il file `js/parser.js` (1332 righe, monolitico) in 6 moduli specializzati dentro la cartella `js/parser/`, mantenendo la piena compatibilità con l'orchestratore `js/parser.js` (pattern analogo a `js/ui.js` e `js/logic.js`), garantendo l'esecuzione sia in ambiente browser che nei test runner Node.js (`eval`/`loadModule`).

Working directory: e:/Nuove App Installate/App esercizi scienze motorie
Integrity mode: development

This is a single self-contained fix; keep it small and focused.

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

### Struttura & Modularità
- [ ] La cartella `js/parser/` contiene esattamente i 6 file specializzati indicati.
- [ ] `js/parser.js` ha una dimensione snella (< 150 righe) e funge da orchestratore.
- [ ] Tutti i moduli espongono le relative proprietà su `window` per retrocompatibilità e testing.
- [ ] Nessun numero magico nel codice: costanti dichiarate in MAIUSCOLO (`IQR_MIN_REPS = 4`, ecc.).
- [ ] Commenti obbligatori presenti su ogni funzione/metodo.
- [ ] Zero emoji spontanee nel codice e nei log.

### Funzionalità & Compatibilità
- [ ] In ambiente Node.js (`eval(fs.readFileSync('js/parser.js'))`), `window.DataParser` espone tutti i metodi e le funzionalità precedenti senza errori.
- [ ] Le suite di test esistenti per il parser (`tests/test_parsing.js`, `tests/test_stress_parser.js`, `tests/test_parser_empirical_stress.js`) vengono eseguite e superano tutti i test con esito positivo.

### Validazione Sintattica & PWA
- [ ] `py test_check.py` viene eseguito e termina con `All syntax checks passed.` (Exit 0).
- [ ] `sw.js` contiene la versione cache `t7-workout-v66` e include i 6 file in `CORE_ASSETS`.

## 2026-09-12T14:49:21Z

# Teamwork Project Prompt

Rinnovare l'interfaccia utente della PWA T7 Workout eliminando i blocchi ridondanti `section-hero` (label, h1, subtitle) in tutte le viste dell'applicazione, riposizionando i contatori informativi nella toolbar dei filtri, eseguendo una pulizia chirurgica delle emoji (rimozione di tutte le decorative e borderline, eliminazione di recupero e deload, conservazione esclusiva di preferiti e indicatori clinico-funzionali) e riadattando gli spazi verticali per massimizzare l'usabilità.

Working directory: e:/Nuove App Installate/App esercizi scienze motorie
Integrity mode: development

This is a single self-contained fix; keep it small and focused.

## Requirements

### R1. Rimozione Blocchi Section-Hero & Riposizionamento Contatori
- Rimuovere i blocchi HTML `.section-hero` (contenenti `hero-label`, `hero-title`, `hero-subtitle`) da tutte le schermate che li contengono (`js/views/catalog-view.js`, `js/views/favorites-view.js`, `js/views/scientific-hub-view.js`).
- Preservare gli elementi contatore (`#results-counter`, `#favorites-counter`, `#sources-counter`) e riposizionarli in una toolbar compatta subito sopra/a fianco dei filtri come pill/badge elegante (es. `.results-counter-pill`), garantendo che le funzioni JS che ne aggiornano il testo tramite ID DOM continuino a funzionare senza modifiche o errori.
- Riadattare nel CSS (`css/style.css`) il padding e margin superiore dei container delle viste (`.catalog-container`, `.favorites-container`, `.hub-container`, ecc.) eliminando l'ingombro di ~160px della vecchia hero per portare subito above-the-fold gli elementi operativi (ricerca e filtri).

### R2. Pulizia Rigorosa delle Emoji (Borderline & Decorative)
- **Da rimuovere categoricamente**:
  - `js/ui/catalog.js`:
    - Rimuovere emoji qualità (`qualityIcons`: `💪`, `📈`, `⚡`, `✨`) lasciando solo il testo della qualità (`Forza`, `Ipertrofia`, `Potenza`).
    - Rimuovere l'icona gigante `heroIcon` (`🏋️`, `🦵`, `💪`, `🦅`, `🧱`, `🥎`) dalla modale di dettaglio esercizio.
    - Rimuovere le emoji dai chip di dettaglio (`🔹`, `🛠️`, `📶`).
    - Rimuovere le emoji dai titoli di esecuzione (`🏃` in "Come Eseguire", `⚙️` in "Setup Iniziale", `🔄` in "Esecuzione").
    - Rimuovere `🚫` dentro le card di errore (`.error-card`).
    - Rimuovere `🔍` dal titolo empty state ("Nessun esercizio trovato").
  - `js/ui/render-filters.js`:
    - Rimuovere le emoji dalle opzioni di attrezzatura (`Bilanciere`, `Manubri`, `Corpo Libero`, `Macchine`, `Cavi`, `Sbarra / Trazioni`, `Panca`) e livello (`Principiante`).
    - Sostituire l'emoji `🔍` nel campo di ricerca con un'icona vettoriale SVG monocromatica sottile.
  - `js/ui/scientific-hub.js`:
    - Sostituire l'emoji `🔍` nel campo di ricerca con la medesima icona vettoriale SVG.
  - `css/style.css`:
    - Rimuovere l'emoji `🔍` dallo pseudo-elemento `.empty-state::before` (`content: '🔍'`).
  - `js/ui/wizard.js`:
    - Rimuovere le emoji `.step-emoji` dagli header dei 5 step (`👤`, `📅`, `🩺`, `🎯`, `🌿`), lasciando il titolo dello step e la descrizione puliti e ben allineati.
    - Rimuovere tutte le emoji `.option-icon` dalle opzioni di selezione (Step 1 tipo soggetto ed esperienza; Step 2 attrezzatura e cardio; Step 4 obiettivi; Step 5 sonno, stress, nutrizione, attività).
    - Rimuovere `💤` dal badge del giorno di recupero: trasformare `RECUPERO 💤` in `RECUPERO`.
    - Rimuovere `🌿` dallo stato di deload: trasformare `Scarico Clinico 🌿` in `Scarico Clinico`.
    - Rimuovere emoji decorative dai titoli e badge (`✨` logo intake sidebar, `📋` riepilogo profilo, `🔬` periodizzazione AI, `📚` bibliografia scientifica, `📤` esporta programma).

- **Da conservare rigorosamente (Safety & Funzionali)**:
  - `js/ui/catalog.js`: stato preferiti `❤️` (attivo) e `🤍` (inattivo).
  - `js/ui/catalog.js`: criteri di validità tecnica `✅`.
  - `js/ui/catalog.js` & `js/ui/wizard.js`: warning clinici, alert di sicurezza ed esercizi adattati `⚠️`.
  - `js/ui/wizard.js`: errore fatale generazione programma `❌`.
  - `js/ui/wizard.js`: durata stimata sessione `⏱️`.
  - `js/ui/render-filters.js`: icone anatomiche patologiche in `getIcon()`.

### R3. Riadattamento Ergonomico del Layout & Option Cards
- Rimodellare lo stile delle `.intake-option-card` nel wizard in `css/style.css` affinché, rimosse le emoji, abbiano una composizione visiva proporzionata: tipografia bilanciata, padding coerente, allineamento centrato e transizioni morbide sui bordi/accent in stato `:hover` e `.selected`.
- Assicurare che su schermi desktop e mobile il layout delle viste Catalogo, Preferiti e Fonti Scientifiche sfrutti al meglio lo spazio verticale recuperato, garantendo un'esperienza utente fluida, moderna ed ergonomica.

### R4. PWA, Service Worker & Validazione Sintattica
- Incrementare la versione della cache in `sw.js` da `t7-workout-v66` a `t7-workout-v67`.
- Allineare la verifica cache in `test_check.py` a `t7-workout-v67`.
- Eseguire `py test_check.py` per confermare l'assoluta assenza di errori di sintassi JS o delimitatori sbilanciati.

## Acceptance Criteria

### UI & Section Layout
- [ ] I blocchi `.section-hero` (label, h1, subtitle) sono stati eliminati da `catalog-view.js`, `favorites-view.js` e `scientific-hub-view.js`.
- [ ] I contatori `#results-counter`, `#favorites-counter` e `#sources-counter` sono visibili e integrati nella toolbar subito sopra/a fianco dei filtri.
- [ ] La logica di aggiornamento dinamico dei contatori (al cambio filtri o ricerca) continua a funzionare perfettamente senza errori console.

### Pulizia Emoji
- [ ] Nessuna emoji decorativa è presente nei dropdown attrezzatura o livello in `render-filters.js`.
- [ ] L'emoji `🔍` nei campi di ricerca è sostituita da un'icona vettoriale SVG pulita.
- [ ] Nessuna emoji `💤` compare nei giorni di recupero del programma generato.
- [ ] Nessuna emoji `🌿` compare nello stato di deload / scarico clinico.
- [ ] Nessuna emoji `.option-icon` o `.step-emoji` compare nel wizard di programmazione.
- [ ] I pulsanti preferiti mantengono `❤️` / `🤍` e i warning clinici mantengono `⚠️`.

### Verifica e Test
- [ ] `py test_check.py` termina con `All syntax checks passed.` (Exit 0).
- [ ] Le suite di test esistenti continuano a passare con successo.

## 2026-09-12T19:43:36Z

# Teamwork Project Prompt

Implementare la correzione del pulsante `btn-ex-detail` nella vista Programmazione (`js/ui/wizard.js`), creando un modulo dedicato `js/ui/exercise-detail-resolver.js` che adotta una strategia di risoluzione multi-livello (ID, nome esatto normalizzato, sottostringa/base) e un generatore di scheda sintetica avanzata e strutturata per tutti gli esercizi (warmup, clinici, cardio) non presenti nel catalogo locale, garantendo che al click di ogni freccetta si apra sempre il modal `renderDetail` completo, informativo e privo di campi vuoti o N/A.

Working directory: e:/Nuove App Installate/App esercizi scienze motorie
Integrity mode: development

This is a single self-contained fix; keep it small and focused.

## Requirements

### R1. Modulo Dedicato di Risoluzione (`js/ui/exercise-detail-resolver.js`)
- Creare il file `js/ui/exercise-detail-resolver.js` esponendo `window.App.resolveExerciseDetail(exId, exName, context)`:
  1. **Ricerca per ID**: cerca in `window.App.getExercises()` se `exId` corrisponde.
  2. **Ricerca per Nome Esatto**: confronto case-insensitive e con trim su `exName`.
  3. **Ricerca per Corrispondenza Normalizzata / Sottostringa**: pulizia di varianti tra parentesi (es. `(RDL)`, `(ROM limitato...)`, `(Bipodalico)`) o prefissi/suffissi per trovare l'esercizio genitore nel catalogo, conservando però le note specifiche di carico del programma.
  4. **Fallback Sintetico Avanzato**: se l'esercizio non esiste a catalogo (es. codici clinici `cli_01...cli_32`, attivazioni warmup, defaticamenti cardio), recuperare l'oggetto esercizio dal programma generato (`window.App.currentProgram` o `window.App.state.currentProgram` o dal contesto passato) e costruire un oggetto esercizio completo per `renderDetail`:
     - `name`: nome completo dell'esercizio.
     - `primaryMuscle`: dal campo `primaryMuscle` dell'esercizio o dal focus del giorno.
     - `muscles`: array contenente `primaryMuscle` ed eventuali muscoli secondari dedotti.
     - `type`: dal campo `type` dell'esercizio o dedotto (`Attivazione / Mobilità`, `Multiarticolare`, `Isolamento`, `Cardio / Defaticamento`).
     - `equipment`: dedotto dal carico o dal nome (es. `Bilanciere`, `Manubri`, `Cavi`, `Elastico`, `A corpo libero`).
     - `level`: `Adattato Clinico` o livello desunto dal programma.
     - `description`: generata combinando `ex.note` e le specifiche di carico (`ex.specs`).
     - `execution`: oggetto con:
       - `context`: spiegazione dell'obiettivo biomeccanico/clinico dell'esercizio.
       - `setup`: istruzioni di posizionamento iniziale.
       - `steps`: array di passi esecutivi dettagliati e coerenti con l'esercizio.
       - `cues`: focus mentale, respirazione e stabilità articolare.
       - `criteria`: criteri di validità tecnica della ripetizione.
     - `errors`: array di oggetti `{ error, why, fix }` con errori frequenti da evitare per quel pattern motorio.
     - `tagline`: sintesi del focus esecutivo.

### R2. Integrazione nel Listener di `wizard.js`
- Modificare il listener `click` su `.btn-ex-detail` in `js/ui/wizard.js` (funzione `renderProgramResult`, righe ~1133-1150) affinché interroghi `window.App.resolveExerciseDetail(exId, exName, { result, container })` e passi il risultato a `window.App.renderDetail(fullEx)`.
- Garantire che la ricerca nel programma scansioni tutte le fasi (`result.phases`), tutti i giorni di ciascuna fase (`phase.schedule`) e tutti gli esercizi (`day.exercises`, compresi warmup, workout principale e cardio).

### R3. Integrazione PWA, Orchestratore UI & Service Worker
- Aggiornare `js/ui.js` per includere `exercise-detail-resolver.js` nella sequenza di caricamento Node.js (`files` array).
- Aggiornare `index.html` inserendo `<script src="js/ui/exercise-detail-resolver.js"></script>` subito prima di `wizard.js`.
- Aggiornare `sw.js` includendo `./js/ui/exercise-detail-resolver.js` in `CORE_ASSETS` e incrementare la versione cache da `t7-workout-v67` a `t7-workout-v68`.
- Aggiornare `test_check.py` per verificare la cache `t7-workout-v68` e il bilanciamento delimitatori su `exercise-detail-resolver.js`.

### R4. Suite di Test Automatizzata & Validazione
- Creare ed eseguire la suite di test `tests/test_exercise_detail_resolver.js` che verifica:
  1. Risoluzione di esercizi atletici con match per ID.
  2. Risoluzione di esercizi con nome variante/parentesi tramite match normalizzato.
  3. Risoluzione di esercizi clinici hard-coded (`cli_01`...`cli_32`) con generazione della scheda sintetica ricca.
  4. Risoluzione di esercizi warmup e cardio privi di ID o con ID generati dinamicamente.
  5. Integrità dei campi della scheda sintetica (`execution.setup`, `steps`, `cues`, `criteria`, `errors`, assenza di stringhe `undefined` o `N/A`).
  6. Esecuzione corretta di `py test_check.py` con esito positivo (Exit 0).

## Acceptance Criteria

### Funzionalità di Risoluzione
- [ ] Il click su `.btn-ex-detail` di qualsiasi esercizio (Warmup, Allenamento Principale, Cardio) apre il modal `renderDetail` con la scheda dell'esercizio.
- [ ] Gli esercizi presenti nel catalogo mostrano la scheda ufficiale del catalogo.
- [ ] Gli esercizi con varianti nel nome trovano la scheda di catalogo corrispondente se disponibile.
- [ ] Gli esercizi clinici e di attivazione non presenti a catalogo generano una scheda sintetica con tutti i blocchi popolati (titolo, muscolo, chip, setup, esecuzione, cue, criteri ed errori).
- [ ] Nessuna scheda dettaglio mostra campi con valori `undefined` o placeholder vuoti `N/A`.

### Architettura & Integrazione
- [ ] Il file `js/ui/exercise-detail-resolver.js` è creato e modulare, con commenti per ogni funzione e costanti in MAIUSCOLO.
- [ ] `js/ui.js`, `index.html` e `sw.js` includono il nuovo modulo.
- [ ] La versione della cache in `sw.js` è `t7-workout-v68`.

### Validazione e Test
- [ ] `node tests/test_exercise_detail_resolver.js` passa al 100%.
- [ ] `py test_check.py` viene eseguito e termina con `All syntax checks passed.`.

## 2026-09-14T12:51:12Z

Sei l'agente coordinatore (Team Coordinator).

Il tuo compito è completare il **Task 1** dell'Implementation Plan descritto in dettaglio nel file `C:\Users\ptomm\.gemini\antigravity\brain\573bb3b8-38a8-4ebe-9f4a-1cecf21c1c4b\prompt_draft.md`.

In sintesi, devi:
1. Leggere attentamente il file `prompt_draft.md` e seguire le sue istruzioni.
2. Invocare i sub-agenti necessari (es. `research` o `self`) per ricercare ~90 nuove fonti scientifiche nelle 7 aree tematiche e formattarle in JSON.
3. Raccogliere i risultati e dividere l'attuale `js/knowledge-base.js` in più file modulari all'interno della cartella `js/data/sources/` (es. `atletica.js`, `fisiologia.js`, ecc.).
4. Creare l'entry-point aggregatore `js/data/sources/index.js` che definisce `window.App.scientificSources`.
5. Aggiornare `index.html` (rimuovendo il vecchio script e inserendo i nuovi file), e incrementare la versione del service worker in `sw.js` (sia la variabile `CACHE_NAME` che i nuovi percorsi in `CORE_ASSETS`) e in `test_check.py`.
6. Eseguire `py test_check.py` per validare le modifiche.

Assicurati che non vi siano duplicati e rispetta le regole di progetto del T7 Workout PWA.

## 2026-09-16T10:51:57Z

This is a single self-contained fix; keep it small and focused.
Refactoring grafico, correzione dell'overflow visivo nelle card esercizi e redesign dei menu a tendina filtri secondo standard moderni di design in stile Apple Minimal (frosted glass, gerarchia tipografica chiara, nessun testo troncato, menu fluttuanti rifiniti).

Working directory: e:\Nuove App Installate\App esercizi scienze motorie
Integrity mode: development

## Requirements

### R1. Correzione Overflow e Layout Card Esercizi (Apple Minimal)
- In `js/ui/catalog.js`:
  - Nel rendering delle card in `renderCatalog`:
    - Sostituire il pulsante `<button class="btn-icon" title="Vedi dettagli esercizio">Scheda →</button>` con un pulsante moderno a pillola `.btn-card-action`: `<button class="btn-card-action" title="Vedi dettagli esercizio"><span>Scheda</span><span class="action-arrow">→</span></button>`.
    - Assicurare che `.card-tags` e il favorite button convivano senza collisioni (es. favorite button in absolute top-right oppure header flex con wrap e spazio per il cuore).
- In `css/style.css`:
  - Modificare `.exercise-card`: aggiungere `position: relative; overflow: hidden;` e padding armonioso.
  - Modificare `.card-header`: consentire il wrapping con `flex-wrap: wrap; gap: 0.35rem;` o posizionare `.favorite-btn` in absolute in alto a destra (`position: absolute; top: 1rem; right: 1rem;`) con padding-right adeguato per `.card-tags` (`padding-right: 2.25rem;`).
  - Modificare i badge `.tag`: ridurre leggermente `font-size: 0.68rem; padding: 0.2rem 0.55rem; letter-spacing: 0.03em; line-height: 1.2;` in modo che badge lunghi come `MULTIARTICOLARE` non saturino la larghezza.
  - Definire lo stile del nuovo pulsante `.btn-card-action`:
    ```css
    .btn-card-action {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.45rem 0.9rem;
        border-radius: 9999px;
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.25);
        color: var(--primary);
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    .btn-card-action:hover {
        background: var(--primary);
        color: #ffffff;
        border-color: var(--primary);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    ```
  - Modificare `.sec-muscles-wrap` e `.sec-muscle-pill`:
    `max-width: 100%; flex-wrap: wrap;` e `.sec-muscle-pill { white-space: nowrap; max-width: 100%; text-overflow: ellipsis; overflow: hidden; }`.

### R2. Architettura & Redesign Dropdown Menu Filtri (Apple Minimal)
- In `js/ui/render-filters.js`:
  - Nel markup del dropdown `#menu-muscle`, separare la testata di ricerca dal corpo delle opzioni:
    ```html
    <div class="custom-select-menu hidden" id="menu-muscle">
        <div class="dropdown-search-wrap">
            <svg class="search-input-icon" ...></svg>
            <input type="text" class="dropdown-search-input" id="search-muscle-input" placeholder="Cerca muscolo..." />
        </div>
        <div class="dropdown-options-list">
            ... opzioni e header gruppi ...
        </div>
    </div>
    ```
  - Negli altri dropdown (`menu-level`, `menu-equipment`, `menu-quality`, `menu-sort`), racchiudere parimenti le opzioni in `.dropdown-options-list` (o garantire che il menu senza search bar sia stilizzato in modo uniforme).
  - Aggiornare i selettori di evento (ad es. chiusura, selezione opzione, ricerca) per funzionare perfettamente sia su `#menu-muscle` che su `.dropdown-options-list`.
- In `css/style.css`:
  - Rimuovere la duplicazione o conflitti di `.custom-select-menu` tra linee 406-520 e 3934-4030.
  - Impostare su `.custom-select-menu`:
    `min-width: 280px; max-width: 360px; padding: 0; overflow: hidden; display: flex; flex-direction: column; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 12px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);`
  - Impostare su `.dropdown-search-wrap`:
    `padding: 0.65rem 0.85rem; background: rgba(30, 41, 59, 0.8); border-bottom: 1px solid rgba(255, 255, 255, 0.08); flex-shrink: 0;` (NON scorre! Rimane fisso in testata senza elementi che scorrono sopra o sotto).
  - Impostare su `.dropdown-options-list`:
    `max-height: 280px; overflow-y: auto; padding: 0.35rem; overscroll-behavior: contain;` con scrollbar discreta.
  - Voci `.custom-option`: padding `0.55rem 0.75rem`, `border-radius: 8px`, hover con `background: rgba(255, 255, 255, 0.08)` o tinta primaria morbida, testo nitido.

### R3. Aggiornamento Cache Service Worker & Test di Progetto
- Incrementare `CACHE_NAME` da `t7-workout-v83` a `t7-workout-v84` in `sw.js`.
- Aggiornare la riga corrispondente in `test_check.py`.
- Eseguire `py test_check.py` per confermare l'assenza di errori sintattici e l'allineamento della cache.
- Non aggiungere emoji spontanee nella UI.

## Acceptance Criteria
- [ ] Tutti i 504 esercizi hanno badge e testi completamente contenuti nelle card, senza sbordamenti.
- [ ] Il pulsante Scheda ha aspetto a pillola moderna e non un cerchio distorto.
- [ ] La barra di ricerca nel dropdown "Muscolo" è fissa e nessuna voce ("Medio Gluteo" o altre) scorre sopra di essa.
- [ ] Il menu a tendina ha larghezza sufficiente e look Apple frosted glass elegante.
- [ ] `py test_check.py` passa con esito positivo e cache allineata a `t7-workout-v84`.

