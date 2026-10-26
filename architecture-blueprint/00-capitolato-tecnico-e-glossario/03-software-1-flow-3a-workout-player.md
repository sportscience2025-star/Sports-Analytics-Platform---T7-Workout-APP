# Capitolato Tecnico: Flow 3A – Interactive Workout Player & Logging (T7 Consumer)

## 1. Identificativo & Titolo Ufficiale
- **Codice Univoco:** `FLOW-3A`
- **Titolo Ufficiale:** SOFTWARE 1 (B2C CONSUMER) - FLOW 3A: INTERACTIVE WORKOUT PLAYER & LOGGING
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 1: General User / Casual, Colonna 3: Workout Player & Logging)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-1-consumer-b2c/flow-3a-workout-player.mmd`

---

## 2. Obiettivo di Business & Target Utente
- **Target Utente:** Atleti amatoriali e frequentatori di palestre durante la sessione di allenamento attiva (Tier 1 – B2C).
- **Problema Risolto:** Fornire un assistente digitale da palestra chiaro, focalizzato e privo di distrazioni. Il player guida l'utente serie per serie con video miniatura, memorizzazione immediata dei carichi effettivi sollevati, timer di recupero automatico con segnali sonori/aptici, calcolo del volume totale (tonnellaggio) e rilevamento istantaneo di nuovi Record Personali (PR), garantendo piena operatività anche in assenza di rete (punti ciechi in palestra o scantinati).

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)
1. **Corsia 1: Thin Client UI/UX (Workout Player - React 18):**
   - Schermata esecuzione esercizio a schermo intero, player video loop compatto, tastierino numerico ottimizzato per input rapido di Carico (kg) e Ripetizioni, timer di recupero flottante con alert audio/vibrazione, richiesta RPE finale su scala 1-10 e card riassuntiva di fine allenamento.
2. **Corsia 2: API Gateway & Log Sync (Envoy / Kong + Service Worker):**
   - Ricezione asincrona degli eventi serie completata (`/set-done`) e chiusura sessione (`/complete`), controllo stato online/offline con accodamento in cache IndexedDB locale.
3. **Corsia 3: Server Scatola Nera (Volume & PR Engine - Cloud Run):**
   - Calcolo del tonnellaggio totale ($\sum \text{Carico} \times \text{Ripetizioni}$), stima del massimale teorico $1\text{RM}$ tramite formula di Epley/Brzycki, rilevamento superamento record storico e calcolo indice di fatica neuromuscolare cumulata.
4. **Corsia 4: Database Silo 1 (Consumer Relational Data Store - PostgreSQL):**
   - Scrittura log di sessione (`completed_workouts`), dettaglio serie (`workout_sets`) e aggiornamento della bacheca record (`athlete_records`).

---

## 4. Flusso Operativo Passo-Passo (Nodi Numerati)
1. **START (Avvio Sessione):** L'atleta tocca il pulsante "Inizia Workout" da una scheda salvata o da una sessione libera.
2. **PLAYER_VIEW (Schermata Esercizio Attivo):** Viene caricato il primo esercizio della sequenza: visualizzazione miniatura video animata, target di riferimento (es. 4 serie da 8 ripetizioni con 80 kg) e cronometro generale di seduta.
3. **SET_LOG (Input Serie Effettuata):** L'utente inserisce i chilogrammi effettivamente caricati e le ripetizioni completate per la serie corrente.
4. **BTN_DONE_SET (Pulsante Serie Completata):** L'atleta tocca il pulsante verde di conferma serie.
5. **REST_TIMER (Avvio Timer di Recupero):** Si attiva il countdown di riposo (es. 90 secondi configurabili). Il display mostra il tempo residuo a cerchio progressivo e, al raggiungimento dello zero, emette un beep sonoro distinto e una vibrazione aptica sul dispositivo mobile.
6. **LOOP ESERCIZI:** Il flusso ritorna a `PLAYER_VIEW` per la serie successiva o passa al prossimo esercizio in scaletta.
7. **SESSION_FINISH (Fine Allenamento):** Al termine dell'ultimo esercizio, l'atleta tocca "Termina Sessione". Viene presentata la richiesta di feedback RPE (Rate of Perceived Exertion) su scala da 1 (estremamente leggero) a 10 (massimale assoluto / cedimento).
8. **GW_ONLINE (Verifica Connettività):**
   - *Se la connessione è assente (Offline):* L'evento viene memorizzato istantaneamente in IndexedDB (`OFFLINE_BADGE`). Una coda di background sync lo trasmetterà non appena il segnale tornerà attivo.
   - *Se la connessione è attiva (Online):* L'evento viene trasmesso all'API Gateway (`GW_LOG_FINISH`).
9. **SRV_VOLUME & SRV_FATIGUE (Elaborazione Server Scatola Nera):** Il server calcola il volume complessivo della seduta, il carico medio per gruppo muscolare e l'affaticamento cumulato.
10. **SRV_PR_DETECT (Rilevamento Nuovo Record Personale):**
    - Se l'atleta ha sollevato un carico superiore al record storico su quell'esercizio (o ha ottenuto un $1\text{RM}$ stimato maggiore), il server genera il badge celebrativo (`SRV_BADGE`) e aggiorna la tabella `athlete_records`.
    - Se non vi sono record superati, la sessione viene archiviata ordinariamente.
11. **SUMMARY_CARD (Card Riepilogo Finale):** Renderizzazione della schermata di chiusura con: Tonnellaggio totale (es. $4.250\text{ kg}$), Durata complessiva (es. $54\text{ minuti}$), Numero serie valide e badge di eventuali nuovi PR sbloccati.
12. **END_LOGGED (Fine Flusso):** Allenamento registrato con successo nel diario personale.

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI
- **Decisione Connettività (`GW_ONLINE`):** Connessione presente $\implies$ Sync immediato; Rete assente $\implies$ Coda offline IndexedDB.
- **Decisione Record Personale (`SRV_PR_DETECT`):** Carico/Stima > Storico $\implies$ Generazione Badge PR + Notifica; Altrimenti $\implies$ Archiviazione ordinaria.

### Gestione dei 4 Stati UI:
1. **Empty State:** Avvio sessione vuota (nessun esercizio pianificato); invito a selezionare esercizi dal catalogo con pulsante rapido "+ Aggiungi Esercizio".
2. **Loading State:** Transizione istantanea tra esercizi senza attese grazie al pre-caching locale degli asset grafici.
3. **Populated State:** Workout attivo con riempimento grafico delle serie completate (check verdi), timer ad alto contrasto e indicatore di intensità.
4. **Error / Fallback State:** Mancanza totale di connessione; compare un badge arancione "Modalità Offline attiva: i tuoi dati sono al sicuro e verranno sincronizzati automaticamente".

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Endpoint Principali:
- `POST /api/v1/workouts/session/set-done`:
  - Input: `{ sessionId: string, exerciseId: string, setNumber: number, loadKg: number, reps: number, rpeSub?: number }`
  - Output: `{ status: 'ok', nextSetRestSeconds: 90 }`
- `POST /api/v1/workouts/session/complete`:
  - Input: `{ sessionId: string, overallRpe: number, durationSeconds: number, athleteNotes?: string }`
  - Output: `{ totalTonnageKg: 4250, newRecords: [{ exerciseId: 'ex_01', metric: '1RM_estimated', value: 105.5 }] }`

### Tabelle Database Coinvolte (Silo 1):
- `completed_workouts`: id, athlete_id, session_date, duration_sec, total_tonnage_kg, session_rpe, sync_status.
- `workout_sets`: id, session_id, exercise_id, set_index, load_kg, reps_completed, is_pr.
- `athlete_records`: athlete_id, exercise_id, max_load_kg, max_estimated_1rm, achieved_at.

---

## 7. Ereditarietà di Tier & Differenziali di Fascia
- **Funzionalità Base del Player:** Costituisce il nucleo di tracciamento utilizzato da tutti gli utenti della piattaforma.
- **Propagazione a Cascata Top-Down:**
  - Nel Tier 2 (Partita IVA - `flow-4b`), questo flusso base viene arricchito con la ricezione in streaming dei dati da encoder lineari Bluetooth (Vitruve / GymAware) e con il calcolo in tempo reale della Mean Propulsive Velocity (MPV in m/s).
  - Nel Tier 3 (Elite Club - `flow-3c`), il logging si integra direttamente con la telemetria GPS e con il calcolo del carico microciclo (MD-X).
- **Differenziali:** Il General User inserisce i dati manualmente (kg e ripetizioni); i livelli superiori ricevono i dati da sensori hardware automatici.
