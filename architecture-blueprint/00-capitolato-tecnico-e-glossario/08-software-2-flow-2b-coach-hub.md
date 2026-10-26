# Capitolato Tecnico: Flow 2B – Catalogo 3D, Video In-App & Revisione AI (T7 Pro Coach & Fisio)

## 1. Identificativo & Titolo Ufficiale
- **Codice Univoco:** `FLOW-2B`
- **Titolo Ufficiale:** SOFTWARE 2 (B2B PRO P.IVA) - FLOW 2B: CATALOGO 3D, VIDEO IN-APP & REVISIONE AI
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 2: Partita IVA / Coaches & Fisioterapisti, Colonna 2: Catalogo Professionale & Custom AI)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-2-pro-b2b/flow-2b-coach-hub.mmd`

---

## 2. Obiettivo di Business & Target Utente
- **Target Utente:** Preparatori atletici, personal trainer e fisioterapisti che gestiscono atleti e pazienti (Tier 2 – B2B Freelance).
- **Problema Risolto:** I professionisti necessitano sia di consultare rapidamente gli esercizi della piattaforma incrociandoli con lo stato clinico dei propri atleti, sia di creare **esercizi custom inediti o altamente personalizzati**. T7 consente al coach di:
  1. Registrare l'atleta sul campo tramite videocamera in-app;
  2. Estrarre in tempo reale i keypoint articolari 3D (MediaPipe a 33 landmark);
  3. Redigere una bozza tecnica preliminare;
  4. Sottoporre la bozza a una **"Revisione Coerente AI"** basata su un RAG multimodale evidence-based (322 paper scientifici + PubMed + video benchmark) con modale comparativa "Diff";
  5. Scegliere la conservazione privacy (video criptato su cloud vs sola estrazione 3D anonimizzata);
  6. Disporre di uno switch "Video Reale vs Avatar 3D" e di un limitatore goniometrico del Range of Motion (ROM).

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)
1. **Corsia 1: Thin Client UI/UX (Coach & Fisio Cockpit - React 18 & WebGL):**
   - Bivio operativo a 3 rami (Consultazione, Registrazione Video In-App, Creazione Solo-Testo), canvas con visualizzatore 3D Three.js dotato di slider touch per limitare il ROM articolare (es. blocco flessione ginocchio a $90^{\circ}$), modulo fotocamera con overlay scheletrico in tempo reale, form di bozza, modale "Diff" comparativa con approvazione selettiva delle modifiche AI, e toggle di visualizzazione.
2. **Corsia 2: API Gateway & Feature Gating Tier 2 (Envoy / Kong):**
   - Verifica token JWT Tier 2, blocco categorico per utenti Tier 1 dei percorsi di creazione (`GW_AUTH_CREATE`), endpoint per l'invio della bozza alla revisione AI (`/ai-audit`) e per la sintesi della mesh 3D (`/synthesize-3d`).
3. **Corsia 3: Server Scatola Nera (Multimodal RAG & 3D Synthesis Engine - Cloud Run GPU):**
   - Motore di Triage Clinico (esclusione esercizi con sovraccarico assiale per patologie attive dell'atleta), Multimodal RAG evidence-based per la revisione tecnica del testo e generatore cinematico di file Draco GLB compatibili con Three.js.
4. **Corsia 4: Database Silo 2 (Pro Tenant Dedicated Enclave - PostgreSQL):**
   - Tabella `catalog_exercises` per gli esercizi di sistema, archivio `custom_exercises` del singolo professionista, file video criptati AES-256 e audit trail delle revisioni.

---

## 4. Flusso Operativo Passo-Passo (Nodi Numerati)
1. **START (Accesso Catalogo Coach Hub):** Il coach o fisioterapista apre la sezione Catalogo dal proprio pannello professionale.
2. **DEC_MODE (Selettore Operazione):** Il professionista seleziona una delle tre modalità operative disponibili:
   - **Ramo 1:** Consulta Catalogo & Prescrizione
   - **Ramo 2:** Registra Video Atleta In-App
   - **Ramo 3:** Nuovo Esercizio Solo-Testo

### Ramo 1: Consultazione & Prescrizione Clinica
3. **UI_SEARCH (Consultazione Catalogo):** Ricerca sui 328 esercizi di base con filtri clinici avanzati per le 119 patologie dell'anamnesi.
4. **DEC_SAFETY (Verifica Compatibilità Clinica):** L'API interroga lo storico infortuni dell'atleta selezionato:
   - *Se compatibile:* Mostra la scheda in `GRID_PRO` con il limitatore ROM disponibile.
   - *Se a rischio:* Compare l'alert rosso `UI_ALERT` ("Rischio sovraccarico per discopatia L4-L5") che propone automaticamente 3 alternative biomeccanicamente sicure (es. Hip Thrust con elastico anziché Stacco da terra).
5. **VIEWER_3D & UI_PRESCRIPTION:** Visualizzazione dell'avatar 3D, impostazione del blocco angolare di sicurezza sul touch screen (es. divieto di estensione oltre i $15^{\circ}$) e assegnazione immediata alla scheda dell'atleta (`END_READY`).

### Ramo 2: Video Recording In-App & Revisione Coerente AI
6. **UI_CAM_RECORD (Registrazione In-App):** Il coach inquadra l'atleta mentre esegue l'esercizio specifico. L'app registra il video a 60 fps.
7. **UI_EDGE_POSE (Edge Computer Vision MediaPipe):** In locale sul dispositivo, l'algoritmo MediaPipe estrae le coordinate 3D dei 33 landmark corporei per l'intero arco di movimento.
8. **UI_DRAFT_FORM (Bozza del Coach):** Il coach compila rapidamente i punti chiave: Nome esercizio, Punti di forza (es. "Ottimo controllo scapolare"), Punti deboli (es. "Tendenza a perdere la curvatura lombare in buca") e Cues verbali.
9. **DEC_AI_AUDIT (Richiesta Revisione Coerente AI):** Il coach può decidere se procedere con la propria bozza oppure premere il pulsante "Revisione Coerente AI".
   - *Se NO:* Si passa direttamente alla scelta di conservazione video.
   - *Se SÌ:* La bozza e il tracciamento pose vengono inviati all'endpoint `GW_AUDIT_REQ`.
10. **SRV_RAG_AUDIT (Elaborazione Server RAG Multimodale):** Il server analizza la cinematica estratta e il testo del coach, interrogando i 322 paper scientifici del database T7, banche dati PubMed e video benchmark convalidati. L'AI genera una proposta di ottimizzazione (corregge termini biomeccanici imprecisi, evidenzia angoli critici di rischio e standardizza le fasi concentrica/eccentrica).
11. **UI_DIFF_MODAL (Modale Diff Comparativa):** Il coach visualizza una schermata "Diff" affiancata (Bozza Originale vs Proposta AI) sezione per sezione:
    - Può cliccare su "Accetta proposta", "Modifica manualmente" o "Mantieni mia formulazione".
12. **DEC_KEEP_VIDEO (Opzione Privacy GDPR & Spazio Cloud):**
    - *Opzione A (Video Reale Criptato):* Il video sorgente viene compresso, crittografato e caricato nel cloud storage privato del professionista.
    - *Opzione B (Solo 3D - Zero Video):* A tutela della privacy dell'atleta o per risparmiare traffico dati, il video grezzo viene distrutto localmente dopo aver salvato esclusivamente la cinematica scheletrica 3D.
13. **SRV_3D_SYNTH (Generatore Cinematico 3D):** Il server compila la mesh 3D in formato standard Draco `.glb`, applicando la colorazione muscolare e i vettori di forza.
14. **VIEWER_TOGGLE (Scheda Esercizio Custom Creata):** L'esercizio è ora nel catalogo privato del coach. Una levetta permette di passare istantaneamente dalla vista video reale all'avatar 3D stilizzato.

### Ramo 3: Creazione Manuale Solo-Testo
15. **UI_TEXT_CREATE (Creazione Descrittiva):** Se non è possibile filmare l'atleta, il coach compila un form descrittivo completo di pattern motorio, muscoli target e fasi temporali.
16. **GW_AUTH_CREATE (Verifica Abilitazione Tier 2):** L'API Gateway verifica che l'utente sia un professionista Tier 2 (per utenti Tier 1 l'accesso è bloccato con messaggio di upgrade).
17. **GW_SYNTH_REQ & PERSISTENZA:** Il generatore cinematico sintetizza l'animazione 3D teorica basandosi sulla libreria di pattern e salva l'esercizio nel catalogo dello studio (`DB_CUSTOM_SAVE`).
18. **END_READY (Fine Flusso):** Esercizio operativo e utilizzabile per tutte le programmazioni future.

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI
- **Decisione Operazione (`DEC_MODE`):** Consultazione vs Registrazione Video vs Solo-Testo.
- **Decisione Sicurezza Clinica (`DEC_SAFETY`):** Idoneo $\implies$ Griglia Pro; Conflitto patologia $\implies$ `UI_ALERT` + 3 alternative sicure.
- **Decisione Revisione AI (`DEC_AI_AUDIT`):** SÌ $\implies$ RAG Multimodale + Modale Diff; NO $\implies$ Procedi a salvataggio bozza.
- **Decisione Privacy Video (`DEC_KEEP_VIDEO`):** Cloud Criptato vs Distruzione Video & Solo Mesh 3D.
- **Decisione Gating Creazione (`GW_AUTH_CREATE`):** Tier 2 $\implies$ Autorizzato; Tier 1 $\implies$ Accesso Negato.

### Gestione dei 4 Stati UI:
1. **Empty State:** Catalogo custom vuoto per un nuovo studio; card tutorial "Come creare il tuo primo esercizio personalizzato in 60 secondi".
2. **Loading State:** Barra di caricamento durante l'elaborazione del video e l'analisi dei 33 landmark con stima del tempo residuo.
3. **Populated State:** Griglia professionale con badge "Verificato AI", etichette di conformità ROM e toggle rapido Video/3D.
4. **Error / Fallback State:**
   - Inquadratura video non conforme (corpo parzialmente fuori campo): prompt a schermo "Allontana la fotocamera: piedi o testa non visibili".
   - Conflitto RAG AI: se la proposta AI stravolge il senso della bozza, il coach può scartare con un solo click l'intera revisione mantenendo intatta la propria bozza.

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Endpoint Principali:
- `POST /api/v1/pro/exercises/ai-audit`:
  - Input: `{ rawTextDraft: { title, weaknesses, strengths, cues }, landmarks3d: Array<Array<{x,y,z,visibility}>>, athleteId: string }`
  - Output: `{ suggestions: { title, correctedWeaknesses, scientificCues, citedSources: [{ pmid: string, title: string }] }, diffSummary: string }`
- `POST /api/v1/pro/exercises/custom-save`:
  - Input: `{ proId: string, athleteId?: string, exerciseData: Object, keepVideoRaw: boolean, meshGlbPayload: string }`
  - Output: `{ customExerciseId: string, status: 'published_in_studio_catalog' }`

### Tabelle Database Coinvolte (Silo 2 - Pro Enclave):
- `custom_exercises`: id, pro_id, athlete_id, title, description, landmarks_json, model_glb_url, raw_video_encrypted_url, is_ai_audited, rom_constraints (JSONB).
- `exercise_audit_history`: id, exercise_id, original_draft, ai_proposed_diff, approved_diff, timestamp.

---

## 7. Ereditarietà di Tier & Differenziali di Fascia
- **Ereditarietà Totale da Tier 1:** Il Tier 2 incorpora integralmente il catalogo di 328 esercizi e la tecnologia WebGL Three.js con OrbitControls del General User (`flow-2a`).
- **Propagazione a Cascata verso Tier 3:** Tutte le funzionalità introdotte in questo flusso (In-App Camera, MediaPipe 33 Landmark, Revisione Coerente AI con Diff comparativa, Privacy Toggle Video/3D) **vengono ereditate automaticamente dal Tier 3 (Elite Pro Teams - `flow-2c`)**, dove si arricchiscono con il Digital Twin personalizzato sul calciatore e la gestione della Libreria Club a 2 livelli.
- **Differenziali:** Il General User (Tier 1) non può registrare video né generare esercizi custom; il Professionista (Tier 2) crea esercizi per il proprio studio; l'Elite Club (Tier 3) gestisce la validazione congiunta Medico-S&C e archivia nel bunker societario protetto da Cloud KMS.
