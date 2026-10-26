# Capitolato Tecnico: Flow 6C – Medical Room EMR, Return-to-Play & Research Warehouse (T7 Elite Pro Teams)

## 1. Identificativo & Titolo Ufficiale
- **Badge Miro Board:** `#18` (Posizione: `X: 8353, Y: 6580`)
- **Codice Univoco:** `FLOW-6C`
- **Titolo Formale:** SOFTWARE 3 (B2B ENTERPRISE) - FLOW 6C: MEDICAL ROOM EMR, RETURN-TO-PLAY 6 FASI & RESEARCH LAKE SILO 3
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 3: High-Level Pro Teams & Enterprise, Colonna 6: Cartella Clinica EMR, RTP & Ricerca Silo 3)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-3-elite-club-enterprise/flow-6c-medical-room-research-silo3.mmd`
- **Riferimento Glossario:** [Glossario Tecnico Vivente](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/00-capitolato-tecnico-e-glossario/00-GLOSSARIO-TERMINI-TECNICI.md) (Voci: *Electronic Medical Record EMR, Protocollo Return to Play 6 Fasi, Segreto Medico Oscuramento Diagnosi, Silo 3 Research Warehouse, Pipeline ETL De-Identificazione, K-Anonimato Sanitario*).

---

## 2. Obiettivo di Business & Target Utente

### Guida Pratica per Non Tecnici: Cos'è questo modulo per un umano?
Quando un calciatore da 50 milioni di euro si infortuna, la pressione è enorme: l'allenatore vuole farlo rientrare subito in campo per la partita decisiva, i giornalisti chiedono notizie ogni ora, e il calciatore stesso ha fretta di giocare. Se però rientra anche solo 3 giorni troppo presto, il rischio di una ricaduta grave con stagione finita è altissimo. Inoltre, la legge sulla privacy sanitaria (GDPR e HIPAA) punisce severamente qualsiasi fuga di diagnosi mediche.  
**La Medical Room di T7** è l'ospedale di precisione del club:
- È accessibile **esclusivamente al Medico Sociale** con credenziali crittografiche blindate;
- Gestisce la cartella clinica con tutte le visite, ecografie e terapie farmacologiche;
- **Il Protocollo a 6 Fasi (Return to Play):** Il calciatore infortunato non può tornare a giocare a sorpresa: deve superare 6 gradini obbligatori certificati:
  1. *Fase 1:* Riposo e lettino fisioterapico;
  2. *Fase 2:* Palestra protetta e piscina;
  3. *Fase 3:* Corsa dritta sul campo da solo;
  4. *Fase 4:* Allenamento con la squadra ma con pettorina colorata speciale ("Vietato toccarlo");
  5. *Fase 5:* Contrasti pieni e partitella ad alta intensità;
  6. *Fase 6:* Idoneità ufficiale per la convocazione firmata digitalmente dal Medico Sociale;
- **Segreto Medico Assoluto:** L'allenatore e i dirigenti non vedono la cartella clinica: sullo schermo della dirigenza compare solo una semplice spia: *"Disponibile"* o *"Non Disponibile"*;
- **Il Ritorno della Scienza (Silo 3):** I dati delle lesioni e dei km percorsi (completamente ripuliti dai nomi dei giocatori) confluiscono nel magazzino di ricerca universitario per permettere alla scienza di inventare metodi sempre migliori per prevenire gli infortuni nel calcio.

### Specifiche di Business & Metriche
- **Target Utente:** Medici Sociali, Fisioterapisti di squadra, Ortopedici del club e Dipartimenti Accademici di Scienze Motorie (Tier 3 – B2B Enterprise & Ricerca).
- **Problema Risolto:** Standardizzare il reintegro degli infortunati con criteri oggettivi basati sull'evidenza scientifica (azzeramento recidive da rientro precoce $< 2\%$), garantendo la conformità legale GDPR Art. 9 sui dati di salute e alimentando il Research Warehouse de-identificato per le università.

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)

1. **Corsia 1: Thin Client UI/UX (Medical EMR Suite React 18):**
   - Cartella clinica elettronica con timeline degli infortuni ICD-11, diario delle terapie fisioterapiche giornaliere, cruscotto a 6 stadi del Return-to-Play con badge semaforici e interfaccia di oscuramento diagnosi verso l'Head Coach (solo stato binario "Available / Unavailable").
2. **Corsia 2: API Gateway & Medical Access Gate (Envoy mTLS):**
   - Controllo dell'identità sanitaria del Medico Sociale (`role: R4_TEAM_DOCTOR`), autenticazione a due fattori biometrica su dispositivo registrato e cifratura dei payload sanitari con chiave AES-GCM-256.
3. **Corsia 3: Server Scatola Nera (Clinical RTP Engine & De-identification Pipeline Cloud Run):**
   - Macchina a stati finiti (FSM) a 6 stadi per il Return-to-Play con convalida delle soglie metrologiche di salto (asimmetria LSI $< 10\%$) prima del passaggio di stadio;
   - *Pipeline ETL De-Identificatrice:* Algoritmo irreversibile di cancellazione PII (Direct Identifiers rimossi, date trasformate in finestre di età, dati GPS troncati con rumore gaussiano differenziale a garanzia di $k$-anonimato con $k \ge 5$).
4. **Corsia 4: Database Tripartito (Silo 2 Bunker Club & Silo 3 Research Warehouse):**
   - *Silo 2 (Bunker):* Cartelle cliniche proprietarie del club criptate con Cloud KMS societario;
   - *Silo 3 (Research Warehouse BigQuery / PostgreSQL):* Archivio aggregato anonimo accessibile ai ricercatori universitari tramite API accademiche protette.

---

## 4. Flusso Operativo Passo-Passo

### Livello A: User Journey Narrativo (La Storia dell'Utente)
1. **La Diagnosi Iniziale:** Il giorno dopo la partita, un calciatore avverte una fitta alla coscia. Il Medico Sociale esegue l'ecografia e apre la Medical Room di T7: registra la diagnosi *"Lesione di 1° grado al bicipite femorale destro"*.
2. **L'Oscuramento Tattico:** Immediatamente, sul tablet dell'Head Coach la casella del giocatore diventa arancione con la scritta: *"Non Disponibile per 18-21 giorni"*. L'allenatore non vede dettagli medici, proteggendo la riservatezza del calciatore.
3. **Il Percorso a 6 Fasi (Settimana per Settimana):**
   - *Giorni 1-5 (Fase 1):* Il medico segna le terapie con tecar e laser;
   - *Giorno 6 (Fase 2):* Il giocatore passa in palestra per esercizi isometrici;
   - *Giorno 12 (Fase 3):* Il calciatore rimette gli scarpini ed esegue corse in linea retta sul campo;
   - *Giorno 16 (Fase 4):* Il calciatore indossa la pettorina verde fluo in allenamento con i compagni: i compagni sanno che non possono contrastarlo;
   - *Giorno 19 (Fase 5):* Il giocatore partecipa alla partitella a tutto campo.
4. **Il Test della Verità (Limb Symmetry Index LSI):** Il medico fa saltare il calciatore sulla pedana: la gamba infortunata ha una forza pari al 94% della gamba sana (asimmetria $< 10\%$: test superato!).
5. **La Firma Digitale per la Partita (Fase 6):** Il Medico Sociale appone la sua firma digitale FIDO2: *"Idoneo alla convocazione"*. Sul tablet dell'Head Coach la spia diventa **Verde**: il giocatore può essere schierato per la domenica!
6. **Il Contributo alla Ricerca:** A fine stagione, il caso clinico (senza nome, senza squadra e senza date) confluisce nel Silo 3 universitario, aiutando la ricerca a prevenire le lesioni muscolari.

---

### Livello B: Trattazione Tecnica Nodi Operativi

1. `START` (Accesso Medico Sociale): Autenticazione mTLS e verifica del claim JWT `role: R4_TEAM_DOCTOR`.
2. `EMR_DASHBOARD` (Cartella Clinica Elettronica): Caricamento cartella clinica atleta: codifica diagnostica ICD-11, storico lesioni pregresse e diario trattamenti quotidiani.
3. `MEDICAL_VISIT_LOG` (Registrazione Visita & Terapie): Archiviazione referto clinico, terapie farmacologiche, fisioterapiche e caricamento referto ecografico/RM cifrato.
4. `STAFF_VISIBILITY_FILTER` (Filtro Segreto Medico): Il gateway maschera tutti i campi diagnostici sensibili verso i ruoli `R2_HEAD_COACH` e `R5_MATCH_ANALYST`, esponendo unicamente lo stato di convocabilità (`AVAILABLE`, `RESTRICTED_NO_CONTACT`, `UNAVAILABLE`) e i giorni stimati al rientro.
5. `RTP_STATE_MACHINE` (Evoluzione del Protocollo a 6 Stadi):
   - Transizione formale tra gli stadi da 1 a 6;
   - Verifica dei criteri di passaggio stadio (assenza di dolore $\text{VAS} = 0$, mobilità articolare completa e test di forza LSI $\ge 90\%$);
   - Solo il superamento metrologico autorizza la transizione allo stadio successivo.
6. `PHASE6_SIGNATURE` (Firma Digitale Idoneità Gara): Il Medico Sociale appone la firma crittografica SHA-256/RSA con chiave hardware societaria, certificando l'idoneità agonistica.
7. `DB_WRITE_SILO2_MEDICAL` (Archiviazione Bunker): Persistenza in `medical_records` nel Silo 2 protetto da Cloud KMS.
8. `ETL_SILO3_PIPELINE` (Pipeline di Anonimizzazione Irreversibile verso Silo 3):
   - Trigger asincrono notturno;
   - Sostituzione dell'identificativo con hash crittografico salato a senso unico (HMAC-SHA256 con chiave monouso distrutta);
   - Generalizzazione dell'età in fasce quinquennali (es. "25-29 anni");
   - Inserimento nel Research Warehouse Silo 3 (BigQuery).

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI

| Bivio Decisionale | Condizione Logica | Ramo SÌ / Positivo | Ramo NO / Negativo |
| :--- | :--- | :--- | :--- |
| `LSI_SYMMETRY` | Asimmetria arti nei salti LSI $\ge 90\%$? | Autorizza passaggio a Fase 5/6 | Mantieni atleta in lavoro differenziato |
| `STAGE6_MEDICAL_SIG` | Firma digitale del Medico Sociale apposta? | Calciatore convocabile per la gara | Atleta escluso dalla lista gara |
| `ROLE_SANITY_CHECK` | Utente possiede ruolo formale R4 (Medico)? | Mostra diagnosi e referti completi | Oscura diagnosi (solo Available/Unavail) |

### I 4 Stati di Interfaccia Utente (UI States):
1. **Empty State:** Infermeria vuota (nessun infortunato): badge verde brillante *"Rosa al 100% della disponibilità atletica (0 atleti in infermeria)"*.
2. **Loading State:** Crittografia e caricamento della risonanza magnetica ad alta risoluzione in $< 1.2\text{ secondi}$.
3. **Populated State:** Scheda infortunio attiva con barra di avanzamento a 6 stadi del Return-to-Play, grafico della forza simmetrica e registro visite.
4. **Error / Fallback State:**
   - *Tentativo di forzatura del rientro da parte dello staff tecnico:* Il sistema rifiuta la convocazione e avvisa l'Head Coach: *"Atleta non convocabile: manca la firma di idoneità clinica del Medico Sociale (Fase 6 non completata)"*.

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Specifiche Endpoint REST:

#### 1. Avanzamento Stadio Return-to-Play & Firma Digitale
- **Endpoint:** `POST /api/v1/club/medical/rtp-transition`
- **Headers:** `Authorization: Bearer <doctor_jwt>`, `X-Club-Tenant-ID: club_seriea_01`, `Content-Type: application/json`
- **Request Payload:**
```json
{
  "athleteId": "p_09_striker",
  "injuryId": "inj_2026_041",
  "targetStage": 6,
  "symmetryMetrics": { "lsiPercent": 93.8, "measuredVia": "CMJ_FORCE_PLATES" },
  "vasPainScore": 0.0,
  "doctorCryptographicSignature": "sig_rsa_doctor_sociale_7781f"
}
```
- **Responses:**
  - `200 OK`:
```json
{
  "injuryStatus": "RESOLVED_CLEARED_FOR_MATCH",
  "athleteAvailability": "AVAILABLE",
  "clearedAtUtc": "2026-10-26T12:00:00Z",
  "notifiedStaffRoles": ["R2_HEAD_COACH", "R1_ATHLETE"]
}
```

### Schema Relazionale (Database Silo 2 Bunker & Silo 3 Research):
- **Silo 2 (Bunker Club):**
  - `medical_injuries`: `id UUID PK`, `club_id VARCHAR(64)`, `athlete_id VARCHAR(64)`, `icd11_code VARCHAR(32)`, `current_rtp_stage INT DEFAULT 1`, `lsi_score NUMERIC(4,2)`, `doctor_signature VARCHAR(255)`.
- **Silo 3 (Research Warehouse BigQuery):**
  - `anonymized_injury_registry`: `record_id STRING PK`, `synthetic_hash STRING`, `sport_discipline STRING`, `age_bracket STRING`, `tactical_role STRING`, `icd11_category STRING`, `days_to_recovery INT`, `gps_load_prior_to_injury JSON`.

---

## 7. Ereditarietà di Tier & Differenziali di Fascia

- **Differenziali rispetto a Tier 1 e Tier 2:**  
  Nel Tier 1 si gestisce solo l'autocertificazione (PAR-Q+); nel Tier 2 il fisioterapista esegue il test ROM singolo con goniometro. **La Cartella Clinica EMR di squadra, il Return-to-Play formale a 6 stadi, l'oscuramento della diagnosi per il segreto medico e la pipeline di ricerca Silo 3 sono esclusivi del Tier 3 Enterprise**.
- **Tutela del Segreto Industriale e Accademico:**  
  Nessuna informazione medica personale esce dal bunker societario, e i dati trasferiti a Silo 3 sono totalmente de-identificati in conformità irreversibile con i più severi standard etici della ricerca medica internazionale.
