# Capitolato Tecnico: Flow 4A – Workflow Funzionali & Wearable Health Sync (T7 Consumer)

## 1. Identificativo & Titolo Ufficiale
- **Badge Miro Board:** `#04` (Posizione: `X: 4171, Y: 465`)
- **Codice Univoco:** `FLOW-4A`
- **Titolo Formale:** SOFTWARE 1 (B2C CONSUMER) - FLOW 4A: WORKFLOW FUNZIONALI & WEARABLE HEALTH SYNC
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 1: General User / Casual, Colonna 4: Workflow Funzionali & Wearables)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-1-consumer-b2c/flow-4a-wearable-sync.mmd`
- **Riferimento Glossario:** [Glossario Tecnico Vivente](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/00-capitolato-tecnico-e-glossario/00-GLOSSARIO-TERMINI-TECNICI.md) (Voci: *Apple HealthKit, Google Health Connect, Heart Rate Variability HRV, rMSSD, Training Readiness Score, Filtro Outlier*).

---

## 2. Obiettivo di Business & Target Utente

### Guida Pratica per Non Tecnici: Cos'è questo modulo per un umano?
Chi si allena indossa quasi sempre uno smartwatch al polso: Apple Watch, Garmin, braccialetti Fitbit o anelli Oura. Spesso però questi orologi danno solo numeri freddi e confusi: *"Hai dormito 6 ore e mezza, il battito a riposo è 58, hai fatto 8.000 passi"*. Cosa significa tutto questo per l'allenamento di oggi? Posso spingere forte sui pesi o è meglio fare una camminata rilassante?  
Questo modulo è il **ponte intelligente tra il tuo orologio e la tua scheda di allenamento**:
- Si collega in 1 secondo a Apple Salute o Google Health Connect rispettando al 100% la tua privacy;
- Legge le ore di sonno, i passi e la qualità del recupero cardiaco (HRV);
- Trasforma questi dati complessi in un semplice **"Indice di Prontezza Giornaliero" (Readiness da 1 a 100)**:
  - *Sopra 75 (Verde):* Sei in forma smagliante, oggi puoi spingere al massimo!
  - *Sotto 50 (Arancione/Giallo):* Il tuo corpo è stanco, l'app ti consiglia di alleggerire i carichi del 10% per evitare contratture.

### Specifiche di Business & Metriche
- **Target Utente:** Persone comuni e atleti amatoriali dotati di smartwatch o smartband (Tier 1 – Casual Consumer).
- **Problema Risolto:** Prevenire il sovrallenamento (Overtraining) e gli infortuni muscolari negli amatori che tendono a ignorare la stanchezza fisica, fornendo raccomandazioni quotidiane di autoregolazione del carico basate su dati biometrici oggettivi.

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)

1. **Corsia 1: Thin Client UI/UX (React Native Health Module / Web Health Connect):**
   - Schermata di autorizzazione permessi granulari (Sonno, Battito a riposo, Passi, HRV), widget circolare "Readiness Index" neon con semaforo visivo e grafici a barre dei trend settimanali.
2. **Corsia 2: API Gateway & Biometric Ingestion Gateway (Envoy):**
   - Ricezione batch crittografata dei parametri biometrici mattutini (`/telemetry/wearable-sync`), validazione token JWT Tier 1 e controllo di coerenza temporale dei timestamp.
3. **Corsia 3: Server Scatola Nera (Biometric Readiness Engine Cloud Run):**
   - Filtraggio dei dati anomali (es. picchi cardiaci da orologio slacciato), estrazione della deviazione del parametro $r\text{MSSD}$ (variabilità cardiaca) rispetto alla media personale degli ultimi 7 giorni e calcolo dell'algoritmo di Prontezza:
     $$\text{Readiness Score} = 0.40 \cdot \Delta\text{HRV}_{\text{norm}} + 0.35 \cdot \text{SleepScore} + 0.25 \cdot \text{RecoveryHR}$$
4. **Corsia 4: Database Tripartito (Silo 1 - PostgreSQL):**
   - Tabella `athlete_daily_biometrics` con partizionamento mensile per serie storiche e memorizzazione dell'indice di prontezza calcolato.

---

## 4. Flusso Operativo Passo-Passo

### Livello A: User Journey Narrativo (La Storia dell'Utente)
1. **Il Collegamento dell'Orologio:** Nelle impostazioni dell'app o al primo avvio, l'atleta tocca *"Collega il tuo Smartwatch"*. Compare la finestra ufficiale del telefono (Apple o Android) che chiede: *"Consenti a T7 di leggere sonno e battito cardiaco?"*. L'utente dà il consenso.
2. **La Mattina al Risveglio:** L'atleta apre l'app. Senza dover toccare nulla, l'app legge in un istante che stanotte ha dormito 7 ore e 45 minuti e che il suo cuore ha recuperato bene.
3. **Il Verdetto di Prontezza:** La schermata mostra un anello verde con il punteggio: **86 / 100 - "Super Recupero!"**.
4. **L'Adattamento della Scheda:** Sotto al punteggio compare una raccomandazione pratica: *"Il tuo sistema nervoso è fresco e riposato. L'allenamento di gambe di oggi è confermato con i carichi pieni!"*.
5. **Cosa succede se sei stanco?** Se l'atleta ha dormito 4 ore o ha la febbre, il punteggio scende ad esempio a **42 / 100 - "Fatica Elevata"**. L'app non blocca l'allenamento, ma suggerisce con dolcezza: *"Oggi il tuo cuore è affaticato. Abbiamo ridotto le serie del 20% e inserito 10 minuti di mobilità per farti recuperare senza stress"*.

---

### Livello B: Trattazione Tecnica Nodi Operativi

1. `START` (Trigger Sincronizzazione): Apertura app mattutina o trigger in background tramite BackgroundFetch API del sistema operativo.
2. `PERMISSION_CHECK` (Controllo Autorizzazioni HealthKit/HealthConnect):
   - Se permessi mancanti $\implies$ rendering modal con spiegazione trasparente del trattamento dati;
   - Se concessi $\implies$ interrogazione API native per la finestra temporale $[T - 24\text{h}, T]$.
3. `READ_RAW_METRICS` (Lettura Parametri Sensore): Estrazione di:
   - Ore totali di sonno e fasi (Deep, REM, Light);
   - Frequenza cardiaca a riposo (Resting Heart Rate in $bpm$);
   - Heart Rate Variability ($r\text{MSSD}$ in $ms$);
   - Passi giornalieri cumulati.
4. `GW_PAYLOAD_VALIDATE` (Validazione Gateway): Invio payload compresso a Corsia 2. Controllo integrità crittografica e verifica che i timestamp rientrino nelle 24h.
5. `SRV_OUTLIER_CLEAN` (Pulizia Dati Rumorosi): Il server scarta letture fisiologicamente impossibili (es. battito a riposo $< 30\text{ bpm}$ o $> 220\text{ bpm}$, ore di sonno $> 20\text{ h}$).
6. `SRV_READINESS_CALC` (Calcolo Algoritmo di Prontezza):
   - Computazione dello Z-Score individuale dell'HRV su rolling window a 7 giorni:
     $$Z_{\text{HRV}} = \frac{r\text{MSSD}_{\text{today}} - \mu_{7\text{d}}}{\sigma_{7\text{d}}}$$
   - Fusione pesata con il punteggio del sonno per ottenere il valore finale $[0, 100]$.
7. `DB_WRITE_METRICS` (Archiviazione Silo 1): Scrittura dei parametri in `athlete_daily_biometrics`.
8. `DEC_SCORE_THRESHOLD` (Bivio Autoregolazione Allenamento):
   - *Se Readiness $\ge 70$ (Verde):* Caricamento scheda ordinaria a intensità nominale (`FULL_VOLUME_OK`);
   - *Se Readiness tra 50 e 69 (Giallo):* Suggerimento di mantenere i carichi invariati senza tentare massimali;
   - *Se Readiness $< 50$ (Arancione/Rosso):* Alert `RECOVERY_ADAPTATION` con proposta di taglio del $15\text{-}20\%$ sul volume complessivo (Auto-regulation).
9. `RENDER_DASHBOARD` (Visualizzazione UI): Aggiornamento dell'anello neon nel Cockpit e invio notifica push discreta.

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI

| Bivio Decisionale | Condizione Logica | Ramo SÌ / Positivo | Ramo NO / Negativo |
| :--- | :--- | :--- | :--- |
| `PERMISSION_CHECK` | Permessi Apple/Google Health concessi? | Lettura dati smartwatch | Modal richiesta consensi |
| `SRV_OUTLIER_CLEAN` | Dati biometrici nel range fisiologico? | Elabora Readiness Score | Scarta campione anomalo |
| `DEC_SCORE_THRESHOLD` | Readiness Score $\ge 70$? | Scheda a volume pieno | Rimodulazione cautelativa del carico |

### I 4 Stati di Interfaccia Utente (UI States):
1. **Empty State:** Nessun wearable connesso: comparsa di una card illustrata *"Connetti Apple Watch o Garmin per scoprire quanto sei in forma oggi"*.
2. **Loading State:** Anello rotante con animazione fluida a 60fps durante la lettura dei campioni da HealthKit ($< 500\text{ ms}$).
3. **Populated State:** Anello completo con punteggio chiaro, grafico a linee dell'andamento dell'HRV degli ultimi 7 giorni e consiglio personalizzato del giorno.
4. **Error / Fallback State:**
   - *Utente ha dormito senza smartwatch:* L'app non segnala errore ma mostra: *"Nessun dato del sonno per stanotte. Puoi inserire manualmente come ti senti (da 1 a 5 stelline)"*.

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Specifiche Endpoint REST:

#### 1. Ingestion Metriche Wearable Giornaliere
- **Endpoint:** `POST /api/v1/telemetry/wearable-sync`
- **Headers:** `Authorization: Bearer <jwt_token>`, `Content-Type: application/json`
- **Request Payload:**
```json
{
  "athleteId": "ath_c0192a",
  "source": "APPLE_HEALTH_KIT",
  "syncTimestampUtc": "2026-10-26T07:15:00Z",
  "metrics": {
    "sleepMinutes": 465,
    "restingHeartRateBpm": 54,
    "hrvRmssdMs": 68.4,
    "stepCountYesterday": 10420
  }
}
```
- **Responses:**
  - `200 OK`:
```json
{
  "status": "success",
  "calculatedReadinessScore": 84,
  "trafficLight": "GREEN",
  "adaptationAdvice": "Condizioni eccellenti. Nessuna limitazione al programma del giorno.",
  "volumeMultiplier": 1.0
}
```
  - `400 Bad Request`: Parametri fuori scala o mancanti.

### Schema Relazionale (Database Silo 1 - PostgreSQL):
- `athlete_daily_biometrics`: `id UUID PK`, `athlete_id UUID FK -> athlete_profiles.id`, `log_date DATE NOT NULL`, `source VARCHAR(32)`, `sleep_minutes INT`, `resting_hr_bpm INT`, `hrv_rmssd_ms NUMERIC(5,2)`, `readiness_score INT`, `created_at TIMESTAMPTZ`, `UNIQUE (athlete_id, log_date)`.

---

## 7. Ereditarietà di Tier & Differenziali di Fascia

- **Funzionalità Base (Tier 1):** Sincronizzazione wearable consumer via HealthKit/HealthConnect e calcolo del Readiness Score a 3 colori.
- **Propagazione verso Tier 2 (`FLOW-4B`):**  
  Nel Tier 2, la prontezza non si basa solo sul polso ma viene verificata sul campo con trasduttori lineari di velocità (VBT) e pedane di salto (PAP), calcolando il massimale $1\text{RM}$ giornaliero reale.
- **Propagazione verso Tier 3 (`FLOW-4C`):**  
  Nei club professionistici, il dato cardiaco mattutino ($r\text{MSSD}$) si fonde con i dati delle pettorine GPS a 18Hz e con lo Z-Score rolling a 28 giorni di tutta la squadra, con protezione crittografica blindata Cloud KMS nel Silo 2.
