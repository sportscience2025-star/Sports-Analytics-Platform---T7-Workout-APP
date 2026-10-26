# Capitolato Tecnico: Flow 4B – Biomechanical VBT & PAP Jump Analysis (T7 Pro Coach & Fisio)

## 1. Identificativo & Titolo Ufficiale
- **Badge Miro Board:** `#10` (Posizione: `X: 4171, Y: 2940`)
- **Codice Univoco:** `FLOW-4B`
- **Titolo Formale:** SOFTWARE 2 (B2B PRO P.IVA) - FLOW 4B: BIOMECHANICAL VBT & PAP JUMP ANALYSIS
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 2: Partita IVA / Coaches & Fisioterapisti, Colonna 4: VBT & Valutazione Biomeccanica)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-2-pro-b2b/flow-4b-vbt-pap-biomechanics.mmd`
- **Riferimento Glossario:** [Glossario Tecnico Vivente](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/00-capitolato-tecnico-e-glossario/00-GLOSSARIO-TERMINI-TECNICI.md) (Voci: *Velocity Based Training VBT, Mean Propulsive Velocity MPV, Minimum Velocity Threshold MVT, Post-Activation Potentiation PAP, Minimal Detectable Change MDC 95%, Filtro Outlier MAD*).

---

## 2. Obiettivo di Business & Target Utente

### Guida Pratica per Non Tecnici: Cos'è questo modulo per un umano?
Per decenni, per sapere quanto peso un atleta potesse sollevare al massimo (il famoso "Massimale" o $1\text{RM}$), bisognava caricarlo al massimo possibile finché non riusciva più a fare un'altra ripetizione ("cedimento muscolare"). Questo metodo è **estremamente pericoloso**: rischia di strappare muscoli o causare lesioni articolari, e non tiene conto del fatto che oggi un atleta potrebbe essere stanco o stressato.  
**Il Modulo Biomeccanico VBT & PAP di T7** porta la scienza di laboratorio sul campo:
- Si collega via Bluetooth con i sensori di velocità da bilanciere (encoder come Vitruve, GymAware o Speed4Lifts) e le pedane di salto;
- L'atleta esegue 4 serie con pesi normali e non pericolosi (es. 50 kg, 70 kg, 85 kg), spingendo più veloce che può;
- Su ogni ripetizione, l'app emette un suono e mostra a caratteri cubitali la velocità in metri al secondo (es. *"0.82 m/s"*);
- Se l'atleta fa rimbalzare il bilanciere sul petto per imbrogliare, l'app riconosce l'errore e scarta la ripetizione;
- In tempo reale, il server traccia una retta matematica e dice con certezza: *"Il tuo massimale di oggi è 112 kg con un'accuratezza del 98%"*, **senza aver rischiato alcun infortunio**;
- Nei salti, calcola il protocollo PAP (Potenziamento Post-Attivazione): dice all'atleta se un carico pesante prima della gara lo rende più esplosivo e **quanti minuti esatti deve aspettare** (es. 8 minuti) prima di saltare per ottenere il massimo record personale!

### Specifiche di Business & Metriche
- **Target Utente:** Preparatori atletici di pesistica e sport di squadra, personal trainer specializzati nella forza e fisioterapisti dello sport (Tier 2 – Pro P.IVA).
- **Problema Risolto:** Eliminare totalmente la necessità di eseguire test massimali a cedimento (Zero Infortuni da Test), standardizzando il tracciamento metrologico del profilo Forza-Velocità e verificando se i miglioramenti nel salto sono statisticamente reali o semplice rumore casuale (MDC 95%).

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)

1. **Corsia 1: Thin Client UI/UX (Biomechanics Dashboard React 18):**
   - Interfaccia Web Bluetooth API (BLE nativo da browser Chrome/Edge), selettore test (VBT vs Salti PAP), contatore di serie incrementali a video, feedback sonoro immediato della velocità a ogni ripetizione, alert per rimbalzi anomali e grafici neon Chart.js (Retta F-V, Curva di Potenza parabolica, Trend temporale PAP a 4', 8', 12').
2. **Corsia 2: API Gateway & Streaming Ingestion (Envoy WebSocket Gateway):**
   - Streaming a bassa latenza ($< 50\text{ ms}$) dei dati di campionamento raw dal sensore ($\ge 100\text{ Hz}$), validazione dei frame binari e protezione da jitter o cadute di pacchetti BLE.
3. **Corsia 3: Server Scatola Nera (Physics & Regression Engine Cloud Run):**
   - *Filtro MAD:* Eliminazione statistica degli outlier basata sulla Median Absolute Deviation dei residui;
   - *Fitting Ibrido OLS/Polinomiale:* Regressione lineare ($v = a - b \cdot F$) confrontata con modello quadratico, selezionando il modello con il minor indice AIC (Akaike Information Criterion) ed $R^2_{\text{adj}}$;
   - *Unità di Misura SI:* Calcolo rigoroso di $F_0$ in Newton ($N$), $v_0$ in metri al secondo ($m/s$), $P_{\max}$ in Watt ($W$) e stima $1\text{RM}$ al punto di velocità minima MVT ($0.30\text{ m/s}$ su panca, $0.32\text{ m/s}$ su squat);
   - *Motore PAP:* Test t di Student appaiato, dimensione dell'effetto Cohen's $d$ e calcolo della soglia di cambiamento reale $\text{MDC}_{95} = \text{SEM} \times 1.96 \times \sqrt{2}$.
4. **Corsia 4: Database Tripartito (Silo 1 Pro - PostgreSQL):**
   - Tabelle `vbt_trials` per la memorizzazione dei coefficienti di Hill e dell'equazione di moto, e `pap_jump_tests` per la risposta neuromuscolare temporale.

---

## 4. Flusso Operativo Passo-Passo

### Livello A: User Journey Narrativo (La Storia dell'Utente)
1. **L'Aggancio del Sensore:** Il coach accende il sensore Vitruve o GymAware sul bilanciere e tocca *"Connetti Bluetooth"* sul tablet. L'app si illumina di verde: *"Sensore agganciato a 100Hz"*.
2. **La Scelta del Protocollo:** Il coach sceglie se eseguire il **Test di Velocità (VBT)** o il **Test di Salto (PAP)**.
3. **L'Esecuzione delle Serie VBT:**
   - L'atleta esegue 3 ripetizioni veloci con 50 kg. L'app emette un tono alto: *"Velocità media: 0.94 m/s"*;
   - Il coach sale a 70 kg. L'atleta spinge: *"Velocità media: 0.76 m/s"*;
   - Si sale a 90 kg: *"Velocità media: 0.52 m/s"*.
4. **Cosa succede se l'atleta sbaglia?** Se alla terza ripetizione il bilanciere rimbalza sul torace, l'app suona con un doppio bip sordo: *"Ripetizione scartata per rimbalzo anomalo (Filtro MAD)"*, garantendo che il dato non venga falsato.
5. **Il Verdetto della Potenza:** Il coach guarda lo schermo: una splendida retta neon mostra il profilo dell'atleta:
   - *"Massimale 1RM stimato: 108.5 kg (Intervallo di sicurezza: 106 - 111 kg)"*;
   - *"Potenza di picco massima: 485 Watt raggiunta al 55% del carico"*.
6. **Il Test di Salto PAP (Per la Gara):** Se si sceglie il protocollo PAP, l'atleta fa un salto di prova su pedana (es. 40 cm), poi esegue 3 ripetizioni pesanti di squat, e risalta dopo 4, 8 e 12 minuti. L'app scopre che all'8° minuto il salto sale a 43.5 cm: *"L'atleta è un Responder! Finestra ideale per la gara: 8 minuti dopo il riscaldamento"*.

---

### Livello B: Trattazione Tecnica Nodi Operativi

1. `START` (Setup Test Biomeccanico): Inizializzazione modulo `BiomechanicsView` e verifica permessi Web Bluetooth sul client.
2. `BLE_CONNECT` (Accoppiamento Sensore): Scansione servizi GATT BLE (`0x180D` o custom UUID fornitore), aggancio stream dati e calibrazione dello zero orizzontale.
3. `TEST_CHOICE` (Bivio Tipologia Protocollo):
   - *Ramo A: Velocity Based Training (Curva F-V e 1RM)* $\to$ `VBT_EXEC`;
   - *Ramo B: Post-Activation Potentiation (Salti Verticali)* $\to$ `PAP_EXEC`.
4. `VBT_EXEC` (Esecuzione Serie Incrementali): Esecuzione di 3-4 serie progressive ($40\%, 60\%, 75\%, 85\%$) con massima accelerazione concentrica intenzionale.
5. `GW_STREAM_VALIDATE` (Ingestion & Jitter Check): L'API Gateway riceve la serie temporale di spostamento/tempo. Se la frequenza effettiva $< 100\text{ Hz} \implies$ alert degrado qualità segnale.
6. `SRV_MAD_FILTER` (Filtro Outlier Metrologico):
   - Calcolo della mediana delle velocità per serie e della deviazione assoluta dalla mediana (MAD);
   - Le ripetizioni con residuo $> 3 \cdot \text{MAD}$ vengono etichettate come invalide con motivazione analitica.
7. `SRV_HYBRID_FIT` (Fitting Matematico Ibrido):
   - Adattamento simultaneo del modello lineare ($v = a - b \cdot F$) e del modello polinomiale di 2° grado ($v = a - b \cdot F - c \cdot F^2$);
   - Calcolo del criterio di informazione di Akaike:
     $$\text{AIC} = 2k - 2\ln(L)$$
   - Selezione automatica del modello con minor AIC e miglior $R^2_{\text{adj}}$.
8. `SRV_METRICS_CALC` (Estrazione Grandezze SI):
   - Forza teorica a velocità zero ($F_0$ in $N$);
   - Velocità teorica a carico zero ($v_0$ in $m/s$);
   - Potenza meccanica massima ($P_{\max} = \frac{F_0 \cdot v_0}{4}$ in $W$);
   - Calcolo $1\text{RM}$ al punto di velocità minima di transizione (MVT) con intervallo di confidenza al 95%.
9. `PAP_EXEC & STATS` (Protocollo di Potenziamento Neuromuscolare):
   - Misurazione tempo di volo salto CMJ pre-stimolo ($h = \frac{g \cdot t^2}{8}$);
   - Esecuzione carico condizionante pesante (Squat 85% 1RM);
   - Re-test salti a intervalli di $4, 8, 12\text{ minuti}$;
   - Calcolo dimensione effetto Cohen's $d$ e superamento soglia $\text{MDC}_{95}$.
10. `CHART_RENDER` (Visualizzazione Client): Grafici Chart.js neon con bande di errore IC 95% e zone di velocità di Bryan Mann (Forza-Velocità, Forza Esplosiva, Forza Massima).
11. `DB_WRITE_VBT` (Salvataggio Silo 1): Archiviazione permanente in `pro_vbt_sessions`.

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI

| Bivio Decisionale | Condizione Logica | Ramo SÌ / Positivo | Ramo NO / Negativo |
| :--- | :--- | :--- | :--- |
| `TEST_CHOICE` | Protocollo selezionato? | VBT (Curva F-V e 1RM) | PAP (Salti Verticali) |
| `SRV_MAD_FILTER` | Residuo ripetizione $\le 3 \cdot \text{MAD}$? | Ripetizione valida per il fitting | Outlier scartato con segnale acustico |
| `SRV_HYBRID_FIT` | AIC Modello Lineare $<$ AIC Polinomiale? | Retta di Hill Lineare OLS | Parabola Quadratica Polinomiale |
| `PAP_MDC_CHECK` | Incremento altezza salto $> \text{MDC}_{95}$? | Atleta classificato come "Responder" | "Non-Responder" (nessun potenziamento) |

### I 4 Stati di Interfaccia Utente (UI States):
1. **Empty State:** Nessun sensore collegato: card centrale con pulsante lampeggiante *"Accendi il tuo encoder Bluetooth e premi Connetti"*.
2. **Loading State:** Elaborazione numerica server-side in tempo reale tra una serie e l'altra con latenza $< 120\text{ ms}$.
3. **Populated State:** Dashboard biomeccanica completa: punti sperimentali sui grafici, retta tracciata con intervallo di confidenza ombreggiato e caselle metriche ($F_0, v_0, P_{\max}$).
4. **Error / Fallback State:**
   - *Perdita di connessione Bluetooth a metà serie:* Banner di riconnessione automatica senza perdita delle serie già registrate nella sessione.

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Specifiche Endpoint REST:

#### 1. Calcolo Profilo VBT & Stima 1RM con IC 95%
- **Endpoint:** `POST /api/v1/pro/biomechanics/vbt-calculate`
- **Headers:** `Authorization: Bearer <pro_jwt>`, `Content-Type: application/json`
- **Request Payload:**
```json
{
  "athleteId": "ath_c0192a",
  "exerciseId": "ch_barbell_bench_press_01",
  "customMvtMps": 0.30,
  "trials": [
    { "loadKg": 50.0, "meanVelocityMps": 0.96, "peakVelocityMps": 1.28 },
    { "loadKg": 70.0, "meanVelocityMps": 0.75, "peakVelocityMps": 1.02 },
    { "loadKg": 85.0, "meanVelocityMps": 0.58, "peakVelocityMps": 0.81 },
    { "loadKg": 95.0, "meanVelocityMps": 0.44, "peakVelocityMps": 0.63 }
  ]
}
```
- **Responses:**
  - `200 OK`:
```json
{
  "estimated1RMKg": 107.4,
  "confidenceInterval95": [105.1, 109.7],
  "fittedModel": "LINEAR_OLS",
  "r2Adj": 0.991,
  "f0Newtons": 1052.8,
  "v0Mps": 1.48,
  "pMaxWatts": 389.5,
  "optimalPowerLoadKg": 58.0
}
```

#### 2. Valutazione Potenziamento Post-Attivazione (PAP)
- **Endpoint:** `POST /api/v1/pro/biomechanics/pap-evaluate`
- **Request Payload:**
```json
{
  "athleteId": "ath_c0192a",
  "baselineJumpCm": 38.5,
  "postJumps": {
    "minute4Cm": 39.2,
    "minute8Cm": 42.1,
    "minute12Cm": 39.0
  }
}
```
- **Responses:**
  - `200 OK`:
```json
{
  "isResponder": true,
  "optimalWindowMinutes": 8,
  "cohensD": 0.86,
  "mdc95Surpassed": true,
  "peakHeightGainPercent": 9.35
}
```

### Schema Relazionale (Database Silo 1 - PostgreSQL):
- `pro_vbt_sessions`: `id UUID PK`, `pro_id UUID FK -> pro_profiles.id`, `athlete_id UUID FK -> athlete_profiles.id`, `exercise_id VARCHAR(64)`, `est_1rm_kg NUMERIC(5,2)`, `f0_n NUMERIC(6,2)`, `v0_mps NUMERIC(4,2)`, `pmax_w NUMERIC(6,2)`, `r2_adj NUMERIC(4,3)`, `created_at TIMESTAMPTZ`.
- `pro_pap_trials`: `id UUID PK`, `athlete_id UUID FK -> athlete_profiles.id`, `baseline_cm NUMERIC(4,2)`, `peak_cm NUMERIC(4,2)`, `optimal_minute INT`, `cohens_d NUMERIC(4,3)`, `is_responder BOOLEAN`, `created_at TIMESTAMPTZ`.

---

## 7. Ereditarietà di Tier & Differenziali di Fascia

- **Differenziali rispetto a Tier 1:**  
  Nel Tier 1 l'atleta inserisce solo serie e ripetizioni manuali senza telemetria. Il **collegamento Bluetooth a encoder VBT, il fitting di Hill e l'analisi statistica PAP sono esclusivi di Tier 2**.
- **Propagazione verso Tier 3 (`FLOW-4C`):**  
  Nel Tier 3 (Elite Club), i dati VBT del bilanciere si fondono con i sensori GPS da campo a 18Hz e con il monitoraggio cardiaco dell'HRV, calcolando l'indice di affaticamento neuromuscolare della rosa della squadra prima di ogni partita.
