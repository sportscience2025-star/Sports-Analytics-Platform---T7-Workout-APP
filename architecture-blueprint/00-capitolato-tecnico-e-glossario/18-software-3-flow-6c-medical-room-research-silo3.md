# Capitolato Tecnico: Flow 6C – Medical Room EMR, Return-to-Play & Research Warehouse (T7 Elite Pro Teams)

## 1. Identificativo & Titolo Ufficiale
- **Codice Univoco:** `FLOW-6C`
- **Titolo Ufficiale:** SOFTWARE 3 (B2B ENTERPRISE) - FLOW 6C: MEDICAL ROOM EMR, RETURN-TO-PLAY & RESEARCH WAREHOUSE (SILO 3)
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 3: High-Level Pro Teams & Enterprise, Colonna 6: Infermeria, RTP & Research Hub)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-3-elite-club-enterprise/flow-6c-medical-room-research-silo3.mmd`

---

## 2. Obiettivo di Business & Target Utente
- **Target Utente:** Medico Sociale, Staff Sanitario, Fisioterapisti di prima squadra, Head Coach, Preparatori Atletici e Ricercatori Accademici universitari accreditati (Tier 3 – B2B Enterprise).
- **Problema Risolto:** Nei club professionistici, il reinserimento in squadra di un calciatore dopo un infortunio grave (es. rottura del legamento crociato o lesione muscolare di 2° grado) è il momento a più alto rischio di recidiva. Le decisioni non possono basarsi su impressioni soggettive, ma richiedono un rigoroso protocollo evidence-based:
  1. **Cartella EMR Societaria Blindata:** Storico referti, esami strumentali (Risonanze Magnetiche, Ecografie) e terapie;
  2. **Protocollo Return to Play (RTP) a 6 Fasi Standardizzate**, con passaggio di fase condizionato a criteri oggettivi e misurabili (Limb Symmetry Index LSI $\ge 90\%$, assenza di dolore, test VBT e salti validati);
  3. **Firma Digitale Esclusiva del Medico Sociale:** Nessun preparatore o allenatore può forzare il rientro dell'atleta senza autorizzazione medica formale;
  4. **Pipeline ETL Notturna verso Silo 3 (Research Warehouse):** Trasferimento automatico di dati biomeccanici e clinici de-identificati (con rimozione irreversibile di ogni dato personale PII e garanzia di k-anonimato $k \ge 5$) verso il magazzino accademico per studi universitari, alimentando il progresso delle scienze motorie senza violare la privacy o il segreto sportivo del club.

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)
1. **Corsia 1: Thin Client UI/UX (Medical Room & Research Portal - React 18):**
   - Cartella clinica elettronica (EMR) dell'atleta protetta da permessi sanitari esclusivi, stepper interattivo delle 6 Fasi RTP, visualizzatore esami strumentali (DICOM/PDF), pulsante di firma digitale qualificata per il Medico Sociale, toggle di consenso alla ricerca accademica e schermata di blocco RTP in caso di mancato superamento dei requisiti fisici.
2. **Corsia 2: API Gateway & Medical Authorization (Envoy / Zero-Trust Gate):**
   - Ricezione della richiesta di avanzamento fase (`/rtp/advance`), verifica crittografica della firma digitale del Medico Sociale (`R3_TEAM_DOCTOR`) ed endpoint di esportazione batch per la ricerca (`/research/etl-export`).
3. **Corsia 3: Server Scatola Nera (RTP Validator & Anonymization ETL - Cloud Run):**
   - Motore di validazione clinica: verifica che l'indice di simmetria tra arto leso e arto sano (Limb Symmetry Index) superi il $90\%$ nei test di salto e dinamometria; pipeline ETL asincrona di anonimizzazione irreversibile (K-anonimato $k \ge 5$ e $l$-diversità); dispatcher automatico delle notifiche allo staff tecnico (Head Coach e Preparatore Atletico).
4. **Corsia 4: Database a Doppio Silo (Silo 2 Bunker + Silo 3 Research Warehouse):**
   - **Silo 2 (Bunker Club KMS):** Memorizza la cartella clinica nominativa in chiaro e i referti sanitari protetti dalle chiavi Cloud KMS societarie.
   - **Silo 3 (De-identified Research Lake):** Riceve esclusivamente serie temporali numeriche standardizzate, aggregate per ruolo tattico e disciplina, totalmente prive di identificativi anagrafici.

---

## 4. Flusso Operativo Passo-Passo (Nodi Numerati)
1. **START (Accesso Cartella Clinica EMR):** Il Medico Sociale o il Fisioterapista capo accede alla sezione Medica dal Cockpit societario.
2. **EMR_VIEW (Consultazione Cartella Clinica Elettronica):** Visualizzazione dello storico infortuni dell'atleta, diagnosi ecografica/RMN e cartella riabilitativa corrente.
3. **RTP_STEPPER (Stepper Return to Play a 6 Fasi):** Il percorso riabilitativo è scandito da 6 milestone inderogabili:
   - **Fase 1 – Riposo Acuto & Controllo Infiammatorio:** Risoluzione dell'ematoma, drenaggio e controllo del dolore ($\text{VAS} \le 2$);
   - **Fase 2 – Terapie Fisioterapiche & Lavoro Isometrico:** Recupero dell'escursione articolare passiva (ROM completo) e attivazione neuromuscolare;
   - **Fase 3 – Lavoro Differenziato sul Campo (Low-Impact):** Corsa lineare su terreno sintetico/erba, cambi di direzione blandi ed esercizi a catena cinetica chiusa;
   - **Fase 4 – Allenamento con il Gruppo Senza Contatto:** Partecipazione alle esercitazioni tecniche e possessi palla con pettorina differenziata ("jolly" senza contrasti fisici);
   - **Fase 5 – Allenamento Completo in Gruppo con Contatto:** Partecipazione a partitelle, contrasti e simulazioni ad alta intensità di gara;
   - **Fase 6 – Idoneità Agonistica alla Gara:** Rilascio del certificato per la convocazione ufficiale per il Match Day.
4. **DOC_SIGN_BTN (Richiesta Passaggio di Fase con Firma Medica):** Al completamento degli obiettivi terapeutici di una fase, il Medico Sociale tocca "Approva e Firma Passaggio Fase".
5. **GW_RTP_UPDATE & GW_DOC_VERIFY (Verifica Gateway):** L'API Gateway verifica la firma digitale del Medico:
   - *Se la firma non è valida o l'operatore non è il Medico Sociale autorizzato:* L'operazione viene respinta con blocco immediato (`RTP_BLOCKED`).
   - *Se la firma è valida:* La richiesta passa all'audit clinico del server Scatola Nera.
6. **SRV_RTP_AUDIT (Audit Criteri Funzionali Oggettivi):**
   - Il server interroga i test di salto e dinamometria: calcola il **Limb Symmetry Index**:
     $$\text{LSI} = \left(\frac{\text{Performance Arto Leso}}{\text{Performance Arto Sano}}\right) \times 100$$
   - *Se LSI < 90% o il dolore VAS è $> 2$:* Il server blocca l'avanzamento (`RTP_BLOCKED`), costringendo l'atleta a proseguire il lavoro di rinforzo differenziato nella fase attuale.
   - *Se LSI $\ge 90\%$ e tutti i criteri sono soddisfatti:* La milestone viene ufficialmente approvata.
7. **DB_WRITE_S2 (Aggiornamento Bunker Silo 2):** Registrazione della milestone con marca temporale immutabile nella cartella clinica del club.
8. **SRV_NOTIF_STAFF (Notifica Automatica allo Staff Tecnico):** Il server Scatola Nera notifica tempestivamente l'Head Coach e l'Head S&C: *"Calciatore X autorizzato al passaggio a Fase 4 (In Gruppo Senza Contatto). Modificare la pettorina di allenamento"*.
9. **RESEARCH_OPTIN (Consenso Ricerca Accademica):** Se la società sportiva ha aderito all'iniziativa di ricerca scientifica universitaria (e l'atleta ha espresso il consenso GDPR Art. 9), si attiva la pipeline di ricerca.
10. **SRV_DE_ID_ETL (Pipeline De-Identificazione Irreversibile):**
    - Vengono eliminati: Nome, Cognome, Data di nascita esatta, Nome del club e riferimenti geografici;
    - I parametri vengono trasformati tramite hashing one-way non reversibile (SHA-256 con salt segreto);
    - Viene garantito il $k$-anonimato ($k \ge 5$, ogni record è indistinguibile da almeno altri 4 atleti per età, ruolo e disciplina);
    - I dati numerici (tempi di recupero LCA, gradi di mobilità, metriche VBT pre e post lesione) vengono esportati in Silo 3 (`DB_WRITE_S3`).
11. **END_MEDICAL_SYNC (Fine Flusso):** Atleta avanzato di fase nel pieno rispetto dei criteri clinici e patrimonio scientifico di Silo 3 alimentato.

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI
- **Decisione Firma Medica (`GW_DOC_VERIFY`):** Medico Sociale R3 $\implies$ Convalida; Ruolo differente $\implies$ Accesso Negato.
- **Decisione Criteri Funzionali (`SRV_RTP_AUDIT`):** $\text{LSI} \ge 90\% \text{ e VAS} \le 2 \implies$ Passaggio Fase Concesso; Criteri Insufficienti $\implies$ Blocco `RTP_BLOCKED`.
- **Decisione Consenso Ricerca (`RESEARCH_OPTIN`):** Consenso Attivo $\implies$ Trigger Pipeline ETL De-ID Silo 3; Disattivo $\implies$ Nessun dato esce da Silo 2.

### Gestione dei 4 Stati UI:
1. **Empty State:** Calciatore integro senza infortuni registrati; indicatore verde "Piena Idoneità Agonistica Attiva" con archivio test muscolari preventivi.
2. **Loading State:** Elaborazione della verifica LSI e firma crittografica con animazione protetta in $< 400\text{ ms}$.
3. **Populated State:** Stepper orizzontale a 6 blocchi con milestone superate colorate in verde scuro, fase attiva in blu neon e fasi future in grigio, con schede degli esami RMN allegati.
4. **Error / Fallback State:**
   - Mancato superamento LSI: modale rossa di stop clinico con dettaglio del deficit (es. "Deficit di forza quadricipite destro: LSI all'81% rispetto al target del 90%").
   - Esame strumentale non caricato: blocco del passaggio a Fase 5 finché non viene allegata l'ecografia di controllo cicatriziale.

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Endpoint Principali:
- `POST /api/v1/club/medical/rtp/advance`:
  - Input: `{ clubId: string, athleteId: string, currentPhase: 3, targetPhase: 4, lsiPercentage: 92.4, vasScore: 1, doctorSignatureCertificate: string }`
  - Output: `{ advancementApproved: true, newPhase: 4, notifiedStaffRoles: ['HEAD_COACH', 'SC_COACH'], milestoneSavedAt: string }`
- `POST /api/v1/club/research/etl-export`:
  - Input: `{ clubId: string, cohortFilter: 'ACL_RECONSTRUCTION_2025_2026' }`
  - Output: `{ exportedRecordsCount: 4, anonymizedLakeBatchId: 'batch_silo3_892', kAnonymityScore: 7 }`

### Tabelle Database Coinvolte (Doppio Silo):
- **Silo 2 (Bunker Club KMS):**
  - `medical_records`: id, club_id, athlete_id, diagnosis_text, injury_date, expected_recovery_days, rtp_current_phase (1-6).
  - `rtp_milestones`: id, medical_record_id, phase_completed, lsi_score, approved_by_doctor_id, signature_timestamp.
- **Silo 3 (De-identified Research Lake):**
  - `research_injury_timeseries`: synthetic_athlete_hash, sport_discipline ('FOOTBALL'), tactical_role_category ('DEFENDER'), injury_category ('ACL'), days_to_full_rtp, lsi_recovery_curve (JSONB).

---

## 7. Ereditarietà di Tier & Differenziali di Fascia
- **Ereditarietà da Tier 1 e Tier 2:**
  - Eredita l'impostazione clinica dei protocolli speciali (`flow-6b`), ma ne supera la gestione individuale del singolo studio privato.
- **Funzionalità Esclusive Enterprise Tier 3:**
  - **Processo RTP a 6 Fasi con co-responsabilità Medico-Staff Tecnico** e allerta automatica in campo;
  - **Integrazione con il Silo 3 Research Warehouse** tramite pipeline ETL anonimizzatrice certificata a prova di reverse-engineering;
  - **Segregazione dei dati sanitari**: l'allenatore non ha visibilità sui referti medici riservati (RMN, cartelle cliniche) custoditi in Silo 2, ma riceve unicamente il semaforo operativo (Idoneo / Non Idoneo / Fase RTP attiva).
