# Capitolato Tecnico: Flow 2C – Catalogo 3D, Video In-App & Libreria Club a 2 Livelli (T7 Elite Pro Teams)

## 1. Identificativo & Titolo Ufficiale
- **Codice Univoco:** `FLOW-2C`
- **Titolo Ufficiale:** SOFTWARE 3 (B2B ENTERPRISE) - FLOW 2C: CATALOGO 3D, VIDEO IN-APP & LIBRERIA CLUB A 2 LIVELLI
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 3: High-Level Pro Teams & Enterprise, Colonna 2: Catalogo Multi-Staff & Digital Twin)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-3-elite-club-enterprise/flow-2c-multi-staff-cockpit.mmd`

---

## 2. Obiettivo di Business & Target Utente
- **Target Utente:** Staff multidisciplinare di società sportive d'élite: Head Coach, Strength & Conditioning Coach (S&C), Medico Sociale, Fisioterapista della prima squadra e Match Analyst (Tier 3 – B2B Enterprise).
- **Problema Risolto:** Nei club di vertice, la prescrizione dell'allenamento non è mai un atto isolato di un singolo individuo, ma richiede una collaborazione sincronizzata tra staff tecnico e medico, tenendo conto dell'indice di carico acuto/cronico (ACWR) e del rischio infortuni. Inoltre, quando si crea un nuovo esercizio personalizzato o un protocollo correttivo, il club necessita di:
  1. Un **Digital Twin Biomeccanico** parametrizzato sulla reale struttura corporea del calciatore (altezza, lunghezza segmenti ossei, asimmetrie);
  2. Una **Libreria Club a Due Livelli** che distingua le bozze temporanee del singolo giocatore dagli esercizi ufficiali validati e condivisi con l'intera organizzazione;
  3. Un workflow di **Validazione Congiunta Obbligatoria (Co-Firma Medico Sociale + Head S&C)**;
  4. Protezione crittografica totale dei video e dei modelli nel bunker Silo 2 gestito via Cloud KMS.

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)
1. **Corsia 1: Thin Client UI/UX (Team Squad Cockpit - React 18 & WebGL):**
   - Navigazione catalogo rosa con telemetria Z-Score e carichi live, visualizzatore 3D avanzato con rendering delle forze di taglio articolari in Newton (N), modulo camera con Markerless Computer Vision ad alta precisione, modale revisione AI con citazione paper PubMed e cartella EMR, selettore di livello di salvataggio (Bozza Atleta vs Libreria Club), e pannello di co-firma congiunta.
2. **Corsia 2: API Gateway & RBAC Tier 3 (Envoy / mTLS Gateway):**
   - Autenticazione mTLS X.509 + token hardware FIDO2, verifica dei ruoli staff societari e feature gating di Tier 3.
3. **Corsia 3: Server Scatola Nera (Digital Twin & Multimodal RAG Engine - Cloud Run GPU):**
   - Calcolo del carico acuto/cronico (ACWR), motore RAG accademico (connessione ai 322 paper scientifici, PubMed e cartella clinica EMR societaria) e compilatore del Digital Twin con adattamento morfologico della mesh scheletrica.
4. **Corsia 4: Database Silo 2 (Bunker Club KMS Enclave - PostgreSQL Dedicated):**
   - Archivio rosa prima squadra, cronologia infortuni criptata, libreria club `club_exercise_library`, video criptati e audit trail WORM delle co-firme dello staff.

---

## 4. Flusso Operativo Passo-Passo (Nodi Numerati)
1. **START (Accesso Catalogo Team Cockpit):** Lo staff accede alla sezione Esercizi & Biomeccanica dal Cockpit societario.
2. **DEC_MODE (Selettore Operazione Staff):** Lo staff sceglie l'azione:
   - **Ramo 1:** Catalogo Rosa, Telemetria & Return to Play (RTP)
   - **Ramo 2:** Registra Video Atleta In-App & Libreria Club
   - **Ramo 3:** Nuovo Esercizio Solo-Testo

### Ramo 1: Consultazione Rosa & Gestione Rischio ACWR
3. **UI_SEARCH_TEAM (Consultazione Catalogo Rosa):** Lo staff consulta gli esercizi incrociando i dati di carico della rosa, lo Z-Score di fatica e il minutaggio settimanale.
4. **DEC_RISK (Verifica Indice di Rischio ACWR):** Il server Scatola Nera calcola il rapporto tra Carico Acuto (ultimi 7 giorni) e Carico Cronico (ultimi 28 giorni):
   - *Se ACWR $\le 1.5$ (Finestra Ottimale):* Viene mostrata la griglia `GRID_ELITE` con telemetria e idoneità confermata.
   - *Se ACWR > 1.5 (Spike Pericoloso di Sovraccarico):* Si attiva l'alert clinico `UI_ALERT_RTP`. Il sistema blocca gli esercizi ad alta intensità e reindirizza automaticamente l'atleta verso esercizi adattati del protocollo Return to Play (RTP a 6 Fasi).
5. **VIEWER_3D_ELITE (Visualizzatore 3D Elite & Digital Twin):** Esplorazione a 360° dell'avatar del calciatore con sovrimpressione in tempo reale dei vettori delle forze di taglio articolari (es. sollecitazione sul legamento crociato anteriore espressa in Newton).

### Ramo 2: Video Recording Markerless & Libreria Club a 2 Livelli
6. **UI_CAM_CAPTURE (Registrazione In-App Pro):** Lo staff registra il calciatore durante un gesto atletico specifico in campo o in palestra pesi (a 60 o 120 fps).
7. **UI_MARKERLESS (Markerless Computer Vision 3D):** Gli algoritmi di visione artificiale estraggono lo scheletro biomeccanico 3D ad alta precisione senza richiedere l'applicazione di marker adesivi sul corpo dell'atleta.
8. **UI_STAFF_DRAFT (Compilazione Bozza Staff):** Il preparatore inserisce gli appunti tecnici e le finalità biomeccaniche.
9. **DEC_AI_AUDIT_PRO (Attivazione Revisione Coerente AI):** Lo staff decide se attivare la revisione automatica:
   - Il server (`SRV_RAG_PRO`) interroga la letteratura scientifica internazionale (322 paper T7 + PubMed) e la cartella clinica EMR criptata del calciatore, verificando se il movimento rispetta i tempi biologici di guarigione e i pattern di forza.
   - Compare la modale `UI_DIFF_PRO` con il confronto ragionato tra bozza del preparatore e rilievi scientifici dell'AI.
10. **DEC_LIBRARY_TIER (Bivio Architettura di Salvataggio a 2 Livelli):**
    - **Livello 1 – Bozza Singolo Giocatore (`UI_LEVEL_ATHLETE`):** L'esercizio viene salvato come bozza temporanea personalizzata per il singolo atleta (es. "Esercizio correttivo valgismo ginocchio sinistro per Calciatore X"). Non è visibile al resto della rosa.
    - **Livello 2 – Libreria Ufficiale Club (`UI_LEVEL_CLUB`):** L'esercizio viene promosso a patrimonio della società sportiva, entrando nella libreria ufficiale condivisa tra tutti i preparatori e fisioterapisti del club.
11. **SRV_TWIN_SYNTH (Sintesi Digital Twin):** Il generatore modella la mesh 3D Draco sulle reali proporzioni antropometriche del calciatore e archivia il video crittografato tramite Google Cloud KMS in Silo 2 (`DB_KMS_SAVE`).
12. **VIEWER_TOGGLE_PRO:** L'esercizio è corredato dal toggle che permette di alternare il video reale alla visualizzazione del Digital Twin 3D.

### Ramo 3: Creazione Solo-Testo
13. **UI_TEXT_CREATE_PRO (Creazione Parametrica):** Compilazione solo-testo dei parametri tassonomici e delle traiettorie ideali, sintetizzati poi dal generatore cinematico.

### Fase Conclusiva: Validazione Congiunta Obbligatoria
14. **DEC_ACTION (Co-Firma Staff Medico-S&C):**
    - Un esercizio custom o un protocollo ad alta intensità non può essere assegnato a un atleta professionista se non riceve la **doppia approvazione digitale simultanea**:
      - 1ª Firma: Medico Sociale (Nulla osta clinico-funzionale);
      - 2ª Firma: Head Strength & Conditioning Coach (Approvazione metodologica).
15. **END_READY (Fine Flusso):** Esercizio integrato a pieno titolo nel sistema societario.

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI
- **Decisione Operazione Staff (`DEC_MODE`):** Consultazione Rosa vs Registrazione Video vs Solo-Testo.
- **Decisione Rischio Carico (`DEC_RISK`):** $\text{ACWR} \le 1.5 \implies$ Idoneità; $\text{ACWR} > 1.5 \implies$ Allarme sovraccarico + RTP.
- **Decisione Destinazione Libreria (`DEC_LIBRARY_TIER`):** Livello 1 (Bozza Singolo Atleta) vs Livello 2 (Libreria Ufficiale Club).
- **Decisione Co-Firma Staff (`DEC_ACTION`):** Entrambe le firme presenti $\implies$ Pubblicazione; Firma mancante $\implies$ Stato di attesa ("Pending Co-Signature").

### Gestione dei 4 Stati UI:
1. **Empty State:** Sezione libreria custom societaria vuota; invito allo staff a convertire le schede proprietarie in protocolli 3D.
2. **Loading State:** Rendering del Digital Twin e sintesi dei landmark con indicatore di caricamento crittografato.
3. **Populated State:** Griglia societaria con miniature 3D, badge di co-firma approvata (verde), indicatore di livello (Atleta vs Club) e Z-Score.
4. **Error / Fallback State:** Conflitto tra staff: il medico boccia l'esercizio per rischio articolare; l'esercizio viene congelato con motivazione medica allegata e notifica all'Head Coach.

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Endpoint Principali:
- `POST /api/v1/club/exercises/ai-audit`:
  - Input: `{ clubId: string, athleteId: string, pose3dLandmarks: Array<Object>, coachDraft: Object }`
  - Output: `{ academicEvaluation: string, emrRiskMatch: boolean, suggestedModifications: Object }`
- `POST /api/v1/club/exercises/kms-save`:
  - Input: `{ clubId: string, libraryTier: 'LEVEL_1_ATHLETE'|'LEVEL_2_CLUB', exercisePayload: Object, signatures: { doctorMtls: string, headCoachMtls: string } }`
  - Output: `{ exerciseId: string, kmsEncryptedPath: string, publishedToClub: boolean }`

### Tabelle Database Coinvolte (Silo 2 - Enclave Club):
- `club_exercise_library`: id, club_id, target_athlete_id (nullable se Tier 2), library_tier ('LEVEL_1'|'LEVEL_2'), model_glb_kms_path, video_kms_path.
- `staff_co_signatures`: id, exercise_id, doctor_user_id, doctor_signed_at, sc_coach_user_id, sc_coach_signed_at, audit_status ('APPROVED'|'PENDING'|'REJECTED').

---

## 7. Ereditarietà di Tier & Differenziali di Fascia
- **Ereditarietà Totale da Tier 1 e Tier 2:** Il Tier 3 eredita il 100% delle funzionalità di consultazione e visualizzazione del General User (`flow-2a`) e la videocamera in-app con revisione AI del Professionista (`flow-2b`).
- **Elevazione Enterprise Esclusiva:**
  - Sostituzione dell'avatar generico con il **Digital Twin parametrizzato sulla reale anatomia del calciatore**.
  - Passaggio dalla singola cartella coach alla **Libreria Club a 2 Livelli**.
  - Introduzione del vincolo non derogabile della **Co-Firma congiunta Medico Sociale + Head S&C**.
  - Crittografia a tenuta stagna nel bunker Silo 2 protetto da Cloud KMS.
