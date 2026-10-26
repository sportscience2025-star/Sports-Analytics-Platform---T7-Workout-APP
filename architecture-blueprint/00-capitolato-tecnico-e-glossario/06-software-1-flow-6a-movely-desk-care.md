# Capitolato Tecnico: Flow 6A – Movely Desk-Care & Active Micro-Pauses (T7 Consumer)

## 1. Identificativo & Titolo Ufficiale
- **Codice Univoco:** `FLOW-6A`
- **Titolo Ufficiale:** SOFTWARE 1 (B2C CONSUMER) - FLOW 6A: MOVELY DESK-CARE & ACTIVE MICRO-PAUSES
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 1: General User / Casual, Colonna 6: Salute & Desk-Care)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-1-consumer-b2c/flow-6a-movely-desk-care.mmd`

---

## 2. Obiettivo di Business & Target Utente
- **Target Utente:** Lavoratori sedentari, impiegati, programmatori e studenti che trascorrono molte ore seduti alla scrivania o al computer (Tier 1 – B2C).
- **Problema Risolto:** Combattere i danni della postura fissa prolungata (cervicalgie, lombalgie, rigidità scapolare e affaticamento visivo) attraverso un timer di background non invasivo che suggerisce micro-pause attive di 2 minuti con sequenze di decompressione articolare ed esercizi di mobilità eseguibili direttamente sul posto di lavoro senza attrezzi.

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)
1. **Corsia 1: Thin Client UI/UX (Desk-Care - React Native / Web Worker):**
   - Background timer di sedentarietà (50 minuti di inattività/lavoro al PC), notifiche push locali/web, schermata interattiva con 3 micro-esercizi guidati da animazioni biomeccaniche fluide, countdown di 120 secondi e popup celebrativo dello streak posturale.
2. **Corsia 2: API Gateway & Log Sync (Envoy / Kong):**
   - Ricezione della chiamata di completamento micro-pausa (`/complete-break`), verifica dello stato attivo dell'account consumer e protezione anti-spam.
3. **Corsia 3: Server Scatola Nera (Postural Health Engine - Cloud Run):**
   - Algoritmo di rotazione dei pattern articolari per evitare sovraccarichi ripetitivi (alternanza tra estensione toracica, mobilità cervicale, retroversione di bacino e allungamento flessori d'anca) e calcolo dell'Indice di Benessere Posturale giornaliero.
4. **Corsia 4: Database Silo 1 (Consumer Wellness Partition - PostgreSQL):**
   - Tabella `deskcare_logs` per il tracciamento delle pause effettuate e `postural_streaks` per il conteggio dei giorni consecutivi di abitudini posturali sane.

---

## 4. Flusso Operativo Passo-Passo (Nodi Numerati)
1. **START (Timer Sedentarietà Attivo):** L'utente attiva la funzione "Desk-Care" dalle impostazioni dell'app o la lascia attiva in background durante l'orario d'ufficio.
2. **TIMER_TRIGGER (Rilevamento 50 Minuti di Sedentarietà):** Il Web Worker o il sensore dell'orologio rileva 50 minuti continuativi di inattività o lavoro alla scrivania.
   - *Se il tempo non è ancora trascorso:* Il timer continua il conteggio silenzioso in background.
   - *Se i 50 minuti sono trascorsi:* Si attiva il prompt successivo.
3. **NOTIF_PROMPT (Notifica Push):** Compare un avviso sonoro e visivo discreto sul dispositivo: *"È ora di una pausa attiva di 2 minuti! Proteggi il tuo rachide"*.
4. **MODAL_EXERCISES (Schermata Esercizi Movely):** Toccando la notifica, si apre la modale Desk-Care con 3 micro-esercizi selezionati:
   - *Distretto 1:* Decompressione cervicale (chin tuck e inclinazioni laterali controllate).
   - *Distretto 2:* Mobilità toracica e apertura scapolare ("Wall Angel" o rotazioni su sedia).
   - *Distretto 3:* Sblocco del bacino e allungamento dello psoas (estensioni dell'anca in piedi).
5. **TIMER_2MIN (Timer Guidato 120s):** L'utente avvia la sequenza. Una figura stilizzata neon illustra il movimento e guida il ritmo respiratorio per 40 secondi per ciascun esercizio.
6. **BTN_DONE (Pulsante 'Pausa Completata'):** Al termine dei 120 secondi, l'utente conferma il completamento della routine.
7. **GW_SYNC & GW_CHECK_TIER (Validazione Gateway):** L'API Gateway riceve la richiesta `POST /api/v1/deskcare/complete-break` e convalida la sessione utente.
8. **SRV_ROTATE & SRV_POSTURE_SCORE (Elaborazione Server):** Il server aggiorna l'algoritmo di rotazione (in modo che la pausa successiva proponga esercizi diversi) e ricalcola il punteggio posturale della giornata (da 0 a 100).
9. **DB_SAVE_BREAK (Persistenza Silo 1):** Scrittura del log orario nella tabella `deskcare_logs` e incremento del contatore di regolarità in `postural_streaks`.
10. **STREAK_POPUP (Popup Motivazionale):** L'app mostra un feedback gratificante: *"Ottimo lavoro! Streak Posturale: 5 giorni consecutivi"* con badge cumulativo.
11. **END_CARE (Fine Flusso):** Micro-pausa completata e timer dei 50 minuti resettato per il ciclo successivo.

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI
- **Decisione Timer (`TIMER_TRIGGER`):** < 50 min $\implies$ Standby silenzioso; $\ge 50\text{ min} \implies$ Notifica push attiva.
- **Decisione Gating Tier (`GW_CHECK_TIER`):** Account attivo $\implies$ Registrazione log e punteggio; Token non valido $\implies$ Fallback anonimo locale.

### Gestione dei 4 Stati UI:
1. **Empty State:** Prima attivazione di Desk-Care; schermata con guida all'ergonomia da ufficio e configurazione degli orari lavorativi (es. 09:00 - 18:00).
2. **Loading State:** Transizione istantanea tra le 3 pose animate dell'avatar.
3. **Populated State:** Dashboard giornaliera con orologio circolare a spicchi che mostra quante micro-pause sono state completate su quelle raccomandate.
4. **Error / Fallback State:** Notifiche bloccate dal sistema operativo; l'app mostra un banner interno con istruzioni per consentire le notifiche o attivare la vibrazione silenziosa.

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Endpoint Principali:
- `POST /api/v1/deskcare/complete-break`:
  - Input: `{ athleteId: string, durationSeconds: 120, routineId: 'routine_cervico_toracica_01', clientTimestamp: string }`
  - Output: `{ status: 'success', currentStreakDays: 5, dailyPostureScore: 92, nextBreakSuggestedInMinutes: 50 }`

### Tabelle Database Coinvolte (Silo 1):
- `deskcare_logs`: id, athlete_id, routine_id, completed_at, duration_sec.
- `postural_streaks`: athlete_id, current_streak_days, max_streak_days, last_break_date.

---

## 7. Ereditarietà di Tier & Differenziali di Fascia
- **Modulo Consumer di Benessere Quotidiano:** Progettato per aumentare la retention e il benessere fisico generale dei singoli utenti amatoriali.
- **Propagazione a Cascata Top-Down:**
  - Nel Tier 2 (Partita IVA - `flow-6b`), questo modulo si evolve nella vera e propria Cartella Clinica Fisioterapica (EMR), con misurazione goniometrica degli angoli di mobilità (ROM in gradi) e protocolli clinici Return-to-Play (`cli_01`..`cli_32`).
  - Nel Tier 3 (Elite Club - `flow-6c`), si trasforma nell'Infermeria Medica Federata e nel registro infortuni societario collegato al Research Warehouse accademico (Silo 3).
- **Differenziali:** Il General User esegue micro-pause preventive di mobilità libera; il fisioterapista e il medico monitorano parametri clinici con valenza medico-legale.
