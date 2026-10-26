# Capitolato Tecnico: Flow 4B – Biomechanical VBT & PAP Jump Analysis (T7 Pro Coach & Fisio)

## 1. Identificativo & Titolo Ufficiale
- **Codice Univoco:** `FLOW-4B`
- **Titolo Ufficiale:** SOFTWARE 2 (B2B PRO P.IVA) - FLOW 4B: BIOMECHANICAL VBT & PAP JUMP ANALYSIS
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 2: Partita IVA / Coaches & Fisioterapisti, Colonna 4: VBT & Valutazione Biomeccanica)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-2-pro-b2b/flow-4b-vbt-pap-biomechanics.mmd`

---

## 2. Obiettivo di Business & Target Utente
- **Target Utente:** Preparatori atletici, coach di pesistica e fisioterapisti dello sport che utilizzano strumenti metrologici sul campo (Tier 2 – B2B Freelance).
- **Problema Risolto:** Eliminare la pericolosità e l'imprecisione dei test massimali diretti ($1\text{RM}$ a cedimento). T7 si interfaccia via Bluetooth con trasduttori lineari di velocità (encoder Vitruve, GymAware, Speed4Lifts) e pedane di salto (CMJ, Abalakov) per:
  1. Tracciare la Mean Propulsive Velocity (MPV in $\text{m/s}$) durante carichi sub-massimali;
  2. Filtrare metrologicamente gli outlier (ripetizioni sporche o rimbalzi);
  3. Stimare il massimale $1\text{RM}$ con intervallo di confidenza al 95% sul punto di velocità minima (MVT $= 0.30\text{ m/s}$);
  4. Analizzare il potenziamento post-attivazione (PAP) tramite test di Student e calcolo della soglia di cambiamento minimamente rilevabile (MDC 95%).

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)
1. **Corsia 1: Thin Client UI/UX (Biomechanics Dashboard - React 18):**
   - Modulo di connessione Web Bluetooth API (BLE), selettore del test (VBT vs PAP), dashboard di esecuzione con feedback acustico della velocità per ogni ripetizione, alert per outlier scartati e rendering grafici interattivi Chart.js neon (profilo Forza-Velocità, curva di Potenza parabolica e trend temporale PAP a 4', 8' e 12').
2. **Corsia 2: API Gateway & Streaming Ingestion (Envoy / WebSocket Gateway):**
   - Ricezione dello stream di campionamento raw dal sensore ($\ge 100\text{ Hz}$), validazione dell'integrità dei frame e protezione da jitter/perdite di pacchetti.
3. **Corsia 3: Server Scatola Nera (Physics & Regression Engine - Cloud Run):**
   - Motore statistico avanzato: filtro robusto MAD (Median Absolute Deviation) per eliminare rimbalzi anomali, fitting ibrido (confronto tra regressione lineare OLS e quadratica polinomiale con selezione tramite criterio AIC e $R^2_{\text{adj}}$), calcolo grandezze SI ($F_0$ in N, $v_0$ in m/s, $P_{\max}$ in W) e motore inferenziale PAP (t-Student, dimensione dell'effetto Cohen's $d$, MDC 95%).
4. **Corsia 4: Database Silo 1 (Pro Biomechanics Archive - PostgreSQL):**
   - Tabella `vbt_trials` per le serie e i parametri dell'equazione e `pap_tests` per le risposte neuromuscolari nel tempo.

---

## 4. Flusso Operativo Passo-Passo (Nodi Numerati)
1. **START (Setup Test Biomeccanico):** Il coach posiziona l'encoder sul bilanciere o la pedana di salto a terra e seleziona l'atleta sul tablet/smartphone.
2. **BLE_CONNECT (Connessione Web Bluetooth):** Il client aggancia il dispositivo BLE (es. Vitruve Core) tramite interfaccia Web Bluetooth nativa del browser.
3. **TEST_CHOICE (Scelta Protocollo):**
   - **Ramo A: Velocity Based Training (VBT)**
   - **Ramo B: Post-Activation Potentiation (PAP)**

### Ramo A: Esecuzione Protocollo VBT
4. **VBT_EXEC (Serie Incrementali):** L'atleta esegue 4 serie progressive (es. 40%, 60%, 75%, 85% del presunto massimale) a massima intenzione di spinta esplosiva.
5. **GW_STREAM & VALIDATE (Ingestion Gateway):** I dati di spostamento/tempo viaggiano verso l'API Gateway. Se il campionamento scende sotto i 100Hz o vi sono frame corrotti, il client avvisa l'utente (`OUTLIER_ALERT`).
6. **SRV_MAD_FILTER (Filtro Outlier MAD):** Il server Scatola Nera calcola la deviazione assoluta dalla mediana sui residui di velocità. Le ripetizioni con MAD $> 3$ (es. perdita di contatto del cordino o decelerazione anticipata) vengono automaticamente scartate con motivazione metrologica esplicita.
7. **SRV_HYBRID_FIT (Regressione Ibrida Intelligente):** Il motore adatta contemporaneamente una retta lineare ($v = a - b \cdot F$) e una parabola polinomiale di 2° grado, selezionando il modello matematico con il miglior compromesso tra varianza spiegata e penalizzazione di complessità (Akaike Information Criterion - AIC).
8. **SRV_METRICS (Calcolo Parametri Meccanici):** Estrazione di:
   - Velocità a carico zero ($v_0$ in $\text{m/s}$);
   - Forza teorica massima ($F_0$ in $\text{N}$);
   - Potenza massima di picco ($P_{\max}$ in $\text{W}$);
   - Stima $1\text{RM}$ al punto di velocità minima di transizione (MVT $= 0.30\text{ m/s}$ per la panca piana) con Intervallo di Confidenza al 95%.
9. **DB_WRITE_VBT (Salvataggio Risultati):** Archiviazione permanente della sessione VBT in Silo 1.

### Ramo B: Esecuzione Protocollo PAP
10. **PAP_EXEC (Protocollo di Potenziamento):**
    - Step 1: Salto CMJ di riferimento (Baseline);
    - Step 2: Carico condizionante ad alta intensità (es. 3 ripetizioni di Squat al 90% 1RM);
    - Step 3: Salti CMJ di re-test a 4, 8 e 12 minuti di recupero passivo.
11. **SRV_PAP_STATS (Statistica Avanzata PAP):** Il server esegue il test t di Student appaiato, calcola la dimensione dell'effetto (Cohen's $d$) e verifica se l'incremento di altezza del salto supera la soglia di cambiamento reale (Minimal Detectable Change - $\text{MDC}_{95} = \text{SEM} \times 1.96 \times \sqrt{2}$).
12. **DB_WRITE_PAP (Salvataggio PAP):** Persistenza dei tempi di volo, altezza in cm e indice di risposta del sistema nervoso.

### Conclusione del Flusso
13. **CHART_RENDER (Visualizzazione Grafica nel Client):** Rendering immediato su grafici Chart.js:
    - Retta di carico-velocità con zona di lavoro ottimale (Zone di Bryan Mann: Forza-Velocità, Potenza, Forza Massima);
    - Curva di potenza a campana;
    - Istogramma del potenziamento PAP con evidenziazione del minuto ideale per la prestazione di gara.
14. **END_BIOMEC (Fine Flusso):** Sessione biomeccanica convalidata e pronta per l'aggiornamento automatico dei carichi nella programmazione.

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI
- **Decisione Tipologia Test (`TEST_CHOICE`):** VBT (Curva F-V) vs PAP (Salto Verticale).
- **Decisione Integrità Frame (`GW_VALIDATE_STREAM`):** Campionamento $\ge 100\text{ Hz} \implies$ Calcolo; Dati corrotti $\implies$ Scarto + Avviso.
- **Decisione Modello Matematico (`SRV_HYBRID_FIT`):** Minore AIC $\implies$ Lineare OLS vs Polinomiale.

### Gestione dei 4 Stati UI:
1. **Empty State:** Nessun test eseguito nella giornata; visualizzazione prompt "Connetti il tuo encoder Bluetooth per avviare il test della velocità".
2. **Loading State:** Elaborazione numerica server-side in tempo reale tra una serie e l'altra con latenza $< 250\text{ ms}$.
3. **Populated State:** Dashboard biomeccanica completa con retta tracciata, punti sperimentali con bande di errore IC 95% e caselle metriche ($F_0, v_0, P_{\max}$).
4. **Error / Fallback State:**
   - Ripetizione eseguita male (rimbalzo sul petto): segnale acustico di errore e notifica a video "Ripetizione 3 non valida: rimbalzo anomalo scartato".
   - Disconnessione Bluetooth: banner di riconnessione automatica con ripristino delle serie già registrate.

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Endpoint Principali:
- `POST /api/v1/pro/biomechanics/vbt-calculate`:
  - Input: `{ athleteId: string, exerciseId: 'bench_press', rawTrials: [{ loadKg: 60, timesMs: [320, 315] }, { loadKg: 80, timesMs: [450, 460] }] }`
  - Output: `{ estimated1RMKg: 104.2, confidenceInterval95: [101.8, 106.6], f0Newtons: 1022.0, v0Mps: 1.42, pMaxWatts: 362.8, r2Adj: 0.984 }`
- `POST /api/v1/pro/biomechanics/pap-evaluate`:
  - Input: `{ baselineJumpCm: 38.2, postJumpsCm: { min4: 39.5, min8: 41.2, min12: 38.9 }, athleteId: string }`
  - Output: `{ potentiationDetected: true, optimalWindowMinutes: 8, cohensD: 0.82, mdcSurpassed: true }`

### Tabelle Database Coinvolte (Silo 1):
- `vbt_trials`: id, athlete_id, pro_id, exercise_id, fitted_model, est_1rm_kg, f0_n, v0_mps, pmax_w, test_date.
- `pap_tests`: id, athlete_id, baseline_cm, peak_cm, optimal_minute, cohens_d, is_responder.

---

## 7. Ereditarietà di Tier & Differenziali di Fascia
- **Differenziali rispetto a Tier 1:** Il General User registra solo kg e ripetizioni senza conoscere la velocità esecutiva; il Tier 2 ha a disposizione l'infrastruttura metrologica Bluetooth e i modelli fisici di Hill ed equazioni di moto.
- **Propagazione verso Tier 3:** Nel Tier 3 (Elite Club - `flow-4c`), i dati VBT si fondono con la telemetria GPS e con il carico cronico ACWR, calcolando l'indice di affaticamento neuromuscolare pre-gara all'interno della rosa della squadra.
