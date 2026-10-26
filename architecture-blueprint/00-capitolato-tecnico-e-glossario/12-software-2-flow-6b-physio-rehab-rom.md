# Capitolato Tecnico: Flow 6B – Physio Rehab Protocols & ROM Tracking (T7 Pro Fisio)

## 1. Identificativo & Titolo Ufficiale
- **Codice Univoco:** `FLOW-6B`
- **Titolo Ufficiale:** SOFTWARE 2 (B2B PRO P.IVA) - FLOW 6B: PHYSIO REHAB PROTOCOLS & ROM TRACKING
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 2: Partita IVA / Coaches & Fisioterapisti, Colonna 6: Riabilitazione Clinica & ROM)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-2-pro-b2b/flow-6b-physio-rehab-rom.mmd`

---

## 2. Obiettivo di Business & Target Utente
- **Target Utente:** Fisioterapisti, medici dello sport, chinesiologi clinici e riabilitatori titolari di Partita IVA e regolarmente iscritti agli Albi professionali sanitari (Tier 2 – B2B Freelance).
- **Problema Risolto:** Digitalizzare la cartella clinica riabilitativa (EMR) e standardizzare i protocolli di recupero funzionale post-infortunio o post-operatorio. Il modulo gestisce i 32 protocolli scientifici speciali di recupero articolare (`cli_01`..`cli_32`), traccia l'escursione articolare oggettiva (Range of Motion - ROM in gradi sessagesimali), monitora la percezione del dolore su scala analogico-visiva (VAS 0-10) e calcola la derivata settimanale di recupero, attivando de-escalation automatiche del carico in caso di infiammazione acuta.

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)
1. **Corsia 1: Thin Client UI/UX (Clinic & Physio Module - React 18):**
   - Selettore paziente dal roster clinico, libreria dei 32 protocolli riabilitativi specifici, goniometro digitale per l'inserimento dell'angolo ROM (flesso-estensione, abduzione, intrarotazione), slider ergonomico della scala VAS del dolore, pulsante di salvataggio seduta e grafici a doppio asse (Guadagno ROM vs Riduzione VAS).
2. **Corsia 2: API Gateway & Medical Compliance (Envoy / RBAC Gate):**
   - Controllo rigoroso del ruolo sanitario: verifica che l'utente possieda i permessi `R3_PHYSIO` o `R4_DOCTOR`. In caso contrario, la richiesta viene respinta con HTTP 403 Forbidden (`GW_ACCESS_DENIED`), impedendo a utenti non abilitati la prescrizione di protocolli terapeutici.
3. **Corsia 3: Server Scatola Nera (ROM Recovery Algorithm - Cloud Run):**
   - Calcolo della derivata temporale di recupero (% di guadagno articolare a settimana), verifica della soglia di sicurezza algoritmica sul dolore (se $\text{VAS} > 4$ durante il movimento protetto si attiva una de-escalation con alert clinico), e validazione del superamento delle milestone di fase.
4. **Corsia 4: Database Silo 1 (Pro Clinical Records Partition - PostgreSQL):**
   - Tabelle sanitarie conformi al GDPR con crittografia a livello di colonna: `physio_sessions`, `rom_logs`, `vas_scores`.

---

## 4. Flusso Operativo Passo-Passo (Nodi Numerati)
1. **START (Accesso Scheda Riabilitativa):** Il fisioterapista seleziona la sezione "Clinica & Riabilitazione" dalla cartella del paziente.
2. **SELECT_PATIENT (Selezione Paziente):** Scelta del paziente/atleta con visualizzazione dell'anamnesi, data dell'intervento chirurgico o diagnosi strumentale (es. "Ricostruzione LCA ginocchio destro, 6ª settimana post-op").
3. **PROTOCOL_PICKER (Selettore Protocolli Riabilitativi):** Il professionista seleziona il percorso terapeutico validato tra i 32 protocolli di sistema (`cli_01`..`cli_32`), ad esempio:
   - `cli_01`: Riabilitazione Fase Precoce LCA (Controllo gonfiore ed estensione completa);
   - `cli_12`: Sindrome Femororotulea (Rinforzo VMO e catena cinetica chiusa);
   - `cli_25`: Lesione Cuffia dei Rotatori (Mobilità passiva assistita e stabilizzazione periscapolare).
4. **ROM_MEASURE (Misurazione Goniometrica ROM):** Inserimento dell'escursione articolare attiva e passiva in gradi sessagesimali (es. Flessione ginocchio: $115^{\circ}$, Estensione: $0^{\circ}$).
5. **VAS_SLIDER (Valutazione Dolore):** Il paziente indica il livello di dolore avvertito durante il test sull'apposito slider da 0 (dolore completamente assente) a 10 (dolore insopportabile).
6. **REHAB_SESSION_SAVE (Salvataggio Seduta Fisioterapica):** Il terapeuta annota le terapie manuali eseguite, la risposta infiammatoria e tocca "Salva Seduta Clinica".
7. **GW_REHAB_LOG & GW_ROLE_CHECK (Verifica Autorizzazione Sanitaria):** L'API Gateway verifica la presenza dell'iscrizione all'Albo TSRM-PSTRP/FNOFI validata durante l'onboarding (`flow-1b`):
   - *Se non autorizzato:* Viene restituito HTTP 403 Forbidden (`GW_ACCESS_DENIED`).
   - *Se autorizzato:* La richiesta viene inoltrata al server Scatola Nera.
8. **SRV_ROM_DERIVATIVE (Calcolo Derivata di Recupero):** Il server confronta i gradi attuali con le 3 sedute precedenti per determinare il tasso di progressione articolare ($\Delta \text{Gradi} / \text{settimana}$).
9. **SRV_SAFETY_LIMIT (Controllo Soglia Dolore & Sicurezza):**
   - *Se VAS > 4:* Il server rileva un'infiammazione acuta anomala. Attiva la de-escalation del carico (`SRV_DEESCALATE`), bloccando la progressione agli esercizi con carico e notificando al fisioterapista la necessità di un protocollo decongestionante.
   - *Se VAS $\le$ 4:* Il server convalida la tolleranza al carico e verifica se sono soddisfatti i criteri per il passaggio alla milestone riabilitativa successiva (`SRV_MILESTONE_PASS`).
10. **DB_WRITE_PHYSIO (Archiviazione Clinica Protetta):** Scrittura della sessione e dei dati biometrici in Silo 1.
11. **PROGRESS_GRAPH (Rendering Grafico di Guarigione):** Visualizzazione immediata nel client dell'evoluzione temporale: retta crescente del ROM articolare e retta decrescente del dolore VAS.
12. **END_REHAB_SAVED (Fine Flusso):** Seduta clinica archiviata a norma di legge e milestone riabilitativa aggiornata.

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI
- **Decisione Ruolo Sanitario (`GW_ROLE_CHECK`):** Ruolo Medico/Fisio autorizzato $\implies$ Accesso; Ruolo non abilitato $\implies$ HTTP 403 bloccante.
- **Decisione Tolleranza Dolore (`SRV_SAFETY_LIMIT`):** $\text{VAS} > 4 \implies$ De-escalation e allerta clinico; $\text{VAS} \le 4 \implies$ Avanzamento milestone.

### Gestione dei 4 Stati UI:
1. **Empty State:** Paziente appena preso in carico senza storico; visualizzazione della timeline a 6 fasi con checklist dei requisiti preliminari da soddisfare.
2. **Loading State:** Calcolo istantaneo delle curve di mobilità senza rallentamenti dell'interfaccia.
3. **Populated State:** Grafico combinato (area verde per ROM, linea rossa per dolore) con evidenziazione del range fisiologico target da raggiungere.
4. **Error / Fallback State:** Regressione acuta del paziente (calo del ROM improvviso di oltre $15^{\circ}$); comparsa di un alert rosso lampeggiante con indicazione di stop terapeutico e richiesta di esame strumentale.

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Endpoint Principali:
- `POST /api/v1/pro/physio/rehab-session`:
  - Input: `{ patientId: string, protocolId: 'cli_01', romActiveDeg: 115, romPassiveDeg: 120, vasScore: 2, jointTarget: 'knee_right', notes: string }`
  - Output: `{ sessionId: string, recoveryRateDegPerWeek: +7.5, safetyAlert: false, milestoneApproved: true, nextPhase: 'Phase 2: Closed Kinetic Chain' }`

### Tabelle Database Coinvolte (Silo 1):
- `physio_sessions`: id, patient_id, physio_id, protocol_id, session_date, clinical_notes.
- `rom_logs`: id, session_id, joint_tested, movement_plane, rom_degrees, is_passive.
- `vas_scores`: id, session_id, score_value (0-10), assessment_moment ('PRE_SESSION'|'PEAK'|'POST_SESSION').

---

## 7. Ereditarietà di Tier & Differenziali di Fascia
- **Differenziali rispetto a Tier 1:** Il General User accede solo alla funzione amatoriale di micro-pause posturali (`flow-6a`); il Tier 2 ha a disposizione l'intera suite clinica conforme ai protocolli ortopedici ed evidence-based.
- **Propagazione verso Tier 3:** Nel Tier 3 (Elite Club - `flow-6c`), questo modulo si integra direttamente nell'Infermeria Medica Societaria, collegando i criteri di ROM e assenza di dolore alle 6 fasi formali del Return to Play (RTP) per il rilascio dell'idoneità agonistica alla gara, con esportazione anonimizzata verso il Research Warehouse (Silo 3).
