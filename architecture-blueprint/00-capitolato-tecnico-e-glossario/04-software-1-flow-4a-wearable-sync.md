# Capitolato Tecnico: Flow 4A – Wearable Health Sync & Trends (T7 Consumer)

## 1. Identificativo & Titolo Ufficiale
- **Codice Univoco:** `FLOW-4A`
- **Titolo Ufficiale:** SOFTWARE 1 (B2C CONSUMER) - FLOW 4A: WEARABLE HEALTH SYNC & TRENDS
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 1: General User / Casual, Colonna 4: Valutazione & Wearable)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-1-consumer-b2c/flow-4a-wearable-sync.mmd`

---

## 2. Obiettivo di Business & Target Utente
- **Target Utente:** Utenti amatoriali e atleti consumer dotati di smartwatch o fitness tracker (Apple Watch, Garmin, Fitbit, Google Pixel Watch, Whoop) (Tier 1 – B2C).
- **Problema Risolto:** Centralizzare automaticamente i parametri fisiologici del recupero senza richiedere all'utente noiose compilazioni manuali. L'app aggrega frequenza cardiaca a riposo (RHR), variabilità cardiaca (HRV rMSSD), ore e qualità del sonno (fasi profonda e REM) e passi giornalieri, fornendo un punteggio di prontezza semplice e un consiglio algoritmico ("Insight") su come regolare l'intensità dell'allenamento del giorno.

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)
1. **Corsia 1: Thin Client UI/UX (Wearable Integration - React Native / Web):**
   - Schermata impostazioni sincronizzazione, modale autorizzazioni native Apple HealthKit / Google Health Connect, dashboard grafici trend settimanali/mensili e toast di notifica insight.
2. **Corsia 2: API Gateway & Wearable Webhooks (Envoy / OAuth Gateway):**
   - Ricezione payload webhook e batch di sincronizzazione, verifica token OAuth 2.0 dei provider terzi (Garmin Connect / Whoop Cloud), validazione firma e rate limiting.
3. **Corsia 3: Server Scatola Nera (Wearable Biometric Engine - Cloud Run):**
   - Aggregazione temporale dei parametri grezzi, normalizzazione metrologica (esclusione spike da movimento), correlazione tra carico della sessione precedente e qualità del recupero notturno, e generazione del testo insight.
4. **Corsia 4: Database Silo 1 (Consumer Timeseries Partition - PostgreSQL):**
   - Tabella `biometrics_daily` con serie temporali indicizzate per atleta e data.

---

## 4. Flusso Operativo Passo-Passo (Nodi Numerati)
1. **START (Accesso Impostazioni Connessione Dispositivi):** L'utente apre il menu "Dispositivi e Salute" nel proprio profilo.
2. **MODAL_SYNC (Modale Selezione Provider):** Presentazione delle opzioni supportate: Apple Health (iOS), Health Connect (Android), Garmin Connect Cloud.
3. **PERM_REQUEST (Richiesta Autorizzazioni Biometriche):** Il sistema operativo apre il popup nativo richiedendo il consenso granulare alla lettura di: Frequenza cardiaca, Dati sonno, Passi e Consumo calorico a riposo.
   - *Se i permessi vengono negati (`PERM_DENIED`):* L'app mostra un banner esplicativo con istruzioni per riattivare i permessi dalle impostazioni di sistema e disabilita temporaneamente la scheda trend.
   - *Se i permessi vengono concessi:* L'app avvia il job di estrazione dati e contatta l'API Gateway (`GW_INGEST`).
4. **GW_TOKEN_VALID (Verifica Gateway):** L'API Gateway convalida la firma del payload o il token di autorizzazione OAuth. Se non valido, restituisce HTTP 403 Forbidden (`GW_REJECT`). Se valido, inoltra i dati al server di calcolo.
5. **SRV_AGGREGATE (Aggregazione Server Scatola Nera):** Il server normalizza le letture disomogenee: calcola la media ponderata della frequenza cardiaca a riposo notturna, quantifica le ore di sonno effettivo (scorporando i risvegli notturni) e somma i passi giornalieri.
6. **DB_STORE (Salvataggio Serie Temporale):** Persistenza delle metriche aggregate nella tabella `biometrics_daily` di Silo 1.
7. **SRV_CORRELATE & SRV_GEN_INSIGHT (Motore di Correlazione):** Il server incrocia i dati del sonno e dell'HRV con il tonnellaggio sollevato negli ultimi 3 giorni. Genera un messaggio sintetico comprensibile per l'utente comune (es. *"Recupero ottimale: sonno profondo +15% rispetto alla tua media. Oggi puoi spingere sui carichi"* oppure *"Frequenza cardiaca a riposo elevata: valuta una seduta leggera o stretching"*).
8. **DASH_TRENDS & INSIGHT_TOAST (Visualizzazione Client):** Renderizzazione dei grafici a linee e barre nel cockpit atleta con notifica toast dell'insight consigliato.
9. **END_SYNCED (Fine Flusso):** Dashboard biometrica aggiornata e sincronizzata.

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI
- **Decisione Permessi OS (`PERM_REQUEST`):** Concesso $\implies$ Ingestion dati; Negato $\implies$ Banner errore e fallback manuale.
- **Decisione Token OAuth (`GW_TOKEN_VALID`):** Firma valida $\implies$ Aggregazione; Firma non valida $\implies$ HTTP 403.

### Gestione dei 4 Stati UI:
1. **Empty State:** Nessun dispositivo collegato; visualizzazione card esplicativa dei benefici della sincronizzazione con pulsante prominente "Collega Smartwatch".
2. **Loading State:** Spinner di sincronizzazione durante la lettura dei campioni da HealthKit/Health Connect.
3. **Populated State:** Grafici interattivi Chart.js neon (verde/cianico) con media mobile a 7 giorni di FC a riposo e barre delle ore di sonno.
4. **Error / Fallback State:** Connessione revocata dal provider esterno; notifica con pulsante "Riconnetti account Garmin/Apple".

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Endpoint Principali:
- `POST /api/v1/integrations/wearables/sync`:
  - Input: `{ athleteId: string, provider: 'apple_health'|'health_connect'|'garmin', date: 'YYYY-MM-DD', metrics: { restingHrBpm: 56, hrvRmssdMs: 62, sleepTotalMinutes: 460, sleepDeepMinutes: 95, stepsCount: 8400 } }`
  - Output: `{ status: 'synced', dailyScore: 84, insightText: string }`

### Tabelle Database Coinvolte (Silo 1):
- `biometrics_daily`: athlete_id, metric_date, resting_hr_bpm, hrv_rmssd_ms, sleep_minutes, sleep_quality_score, steps_count, calculated_readiness_score, created_at.

---

## 7. Ereditarietà di Tier & Differenziali di Fascia
- **Base Biometrica Consumer:** Sincronizzazione aggregata giornaliera per l'orientamento amatoriale.
- **Propagazione a Cascata Top-Down:**
  - Nel Tier 2 (Partita IVA - `flow-4b`), questi dati alimentano la scheda dell'atleta visibile al coach per decidere la periodizzazione DUP e verificare la readiness prima della sessione VBT.
  - Nel Tier 3 (Elite Club - `flow-4c`), i dati wearable vengono fusi matematicamente con la telemetria GPS ad alta frequenza (10-18Hz) per calcolare lo Z-Score composito di fatica su rolling window di 28 giorni.
- **Differenziali:** Il General User riceve un consiglio qualitativo testuale; i livelli superiori elaborano matrici statistiche inferenziali di scostamento sigma ($\sigma$).
