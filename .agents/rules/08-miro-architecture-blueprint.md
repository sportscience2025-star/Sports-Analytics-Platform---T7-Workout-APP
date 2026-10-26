---
trigger: manual
---

# Regola: Architettura di Prodotto, Tiers, Ereditarietà a Cascata & Mappa Zone Miro Online

## 1. Principio Fondamentale: Priorità Operativa Miro Online

- **Priorità Assoluta Board Miro:** Ogni flowchart, logica architetturale o diagramma si progetta e modifica **DIRETTAMENTE sulla Board Miro online** (Board ID: `uXjVEbo6L2o=`, URL: `https://miro.com/app/board/uXjVEbo6L2o=`) tramite server MCP `miro` (`get-items-on-board`, `create-shape-item`, `create-connector`, `update-shape-item`, `create-frame`, `create-text-item`).
- **Sincronizzazione Locale & Git (Secondaria/Backup):** Il salvataggio del codice Mermaid (`.mmd`) e Markdown in `architecture-blueprint/`, con commit e push su GitHub, garantisce il passaggio allineato e trasparente tra Portatile (`C:\...`) e PC Fisso (`E:\...`).
- **Autonomia & Integrazione Non-Distruttiva:** L'agente opera come **Principal Solution Architect & Product Manager** in piena autonomia tecnica. Prima di modificare, ispeziona gli elementi esistenti per preservare i diagrammi validati, integrando in modo ordinato senza sovrapposizioni visive.

---

## 2. Visione Prodotto & Architettura a 3 Fasce d'Abbonamento

Ogni schema deve rispettare rigorosamente il modello a 3 livelli applicativi (RBAC & Feature Gating):

1. **Tier 1 – Base (Free/Low-Cost - Utenti Comuni, Casual & Fitness Consumer):**
   - *Target:* Utenti singoli, amatori, frequentatori di palestre, atleti che si allenano in autonomia.
   - *Funzionalità:* Diario allenamento personale, catalogo esercizi standard, sincronizzazione wearable base (Apple Health, Google Health Connect), **Social Network Movely B2C** e marketplace per interagire o acquistare servizi da coach, fisioterapisti e nutrizionisti.
2. **Tier 2 – Pro (Partita IVA, Coach, Fisioterapisti, Personal Trainer, Studi Privati):**
   - *Target:* Professionisti dello sport e della riabilitazione con partita IVA che gestiscono un proprio portafoglio atleti/clienti.
   - *Funzionalità:* Tutto ciò che include il Tier 1, PIÙ: Generatore Macrocicli IA avanzato (DUP, Blocchi, Coniugata, Lineare, Polarizzata), Triage Clinico 119 patologie (`ImpactCalculator`), Schede Pre-Attivazione con video allegati, Analisi VBT (OLS 1RM, MVT) e salti (CMJ, Abalakov, PAP), Motore RAG scientifico personale, Export Excel `.xlsx` sbloccato e PDF interattivo per i propri clienti.
3. **Tier 3 – Elite Club & Ricerca (Società Sportive Pro, Squadre di Alto Livello & Università):**
   - *Target:* Club professionistici, federazioni olimpiche, staff multidisciplinari d'élite e dipartimenti accademici di scienze motorie.
   - *Funzionalità:* Tutto ciò che include il Tier 1 e il Tier 2, PIÙ: Multi-Staff collaborativo con permessi granulari (Head Coach, S&C Coach, Medico Sociale, Fisioterapista, Match Analyst, Dirigenza), Microciclo Squadra & Z-Score Adattivo (HRV/RPE + GPS con gestione doppio ruolo tattico e fallback cold-start nuovi acquisti), Video Analisi Biomeccanica/Tattica avanzata, **Encrypted Club Bunker** a tenuta stagna e accesso al **Research Hub** accademico de-identificato.

---

## 3. Regola Fondamentale di Ereditarietà Funzionale a Cascata (Top-Down)

I 18 flowchart dei processi operativi (Zona 4 della board Miro) sono strutturati verticalmente su 3 livelli (righe) corrispondenti alle 3 tipologie di software:
- **Riga 1 (In alto):** General User / Casual (Tier 1)
- **Riga 2 (In mezzo):** Partita IVA / Coaches & Fisioterapisti (Tier 2)
- **Riga 3 (In basso):** High-Level Pro Teams & Professionisti d'Élite (Tier 3)

### A. Principio della Cascata del Valore (I Tier Superiori Ereditano Tutto)
I software per Partita IVA (Tier 2) e per Team d'Élite (Tier 3) sono pacchetti a pagamento di fascia superiore, con canoni e responsabilità progressivamente più alti. Pertanto, **devono necessariamente possedere e comprendere tutte le funzionalità di base offerte al General User**, potenziate con le logiche professionali del rispettivo livello.

### B. Direzione Rigorosa di Propagazione (Top-Down):

1. **Modifiche o Aggiunte al Tier 1 (General User):**
   - **PROPAGAZIONE A CASCATA TOTALE E AUTOMATICA:** Qualsiasi nuova funzione, schermata UI, opzione di catalogo, meccanismo di login/onboarding o logica applicativa introdotta o modificata nel flowchart del General User (Riga 1) **DEVE essere automaticamente aggiornata e integrata anche nei flowchart sottostanti della Partita IVA (Riga 2) e dei Pro Teams (Riga 3)**.
2. **Modifiche o Aggiunte al Tier 2 (Partita IVA):**
   - **PROPAGAZIONE ESCLUSIVA VERSO IL BASSO:** Qualsiasi funzionalità professionale aggiunta al Tier 2 (es. gestione atleti, triage clinico, export referti) **si propaga automaticamente al Tier 3 (Pro Teams)**, ma **NON deve mai essere propagata verso l'alto al Tier 1 (General User)**.
3. **Modifiche o Aggiunte al Tier 3 (Pro Teams):**
   - **ISOLAMENTO COMPLETO:** Funzionalità enterprise specifiche per i team di alto livello (es. contrattualistica sportiva KYB, federazione SSO aziendale, Cloud KMS Silo 2, Z-Score di squadra) rimangono **strettamente confinate al Tier 3** e non devono mai toccare né Tier 2 né Tier 1.

### C. Autonomia Operativa dell'Agente
Quando l'utente richiede una modifica o l'implementazione di un flusso per il General User o per la Partita IVA, l'agente ha il dovere di **applicare contestualmente la propagazione a cascata sui livelli sottostanti**, garantendo coerenza architetturale e simmetria funzionale sull'intera board Miro senza attendere richieste ridondanti.

---

## 4. Tutela IP & Architettura a 3 Camere Stagne

### A. Separazione "Thin Client" vs Server "Scatola Nera" (Tutela IP)
- **Thin Client (Guscio Visivo):** L'app mobile (iOS/Android) e Web (React/TS) gestisce esclusivamente UI/UX e interazione utente. **Divieto assoluto** di includere nel client formule matematiche, pesature RAG o algoritmi proprietari.
- **Server Cloud Centrale (Scatola Nera):** Tutti gli algoritmi (regressione OLS VBT, calcolo Z-Score, triage clinico, RAG gerarchico con moltiplicatori 1.3 / 1.1 / 1.0, video tracking) risiedono sul server e comunicano via API criptate I/O con token di sessione.

### B. Database a 3 Camere Stagne (Multi-Tenant Isolation)
1. **Silo 1 – Public, Social & Movely B2B/B2C:** Dati utenti Tier 1 e Tier 2, profili pubblici, feed social e networking del marketplace.
2. **Silo 2 – Encrypted Club Bunkers (Tier 3):** Partizioni isolate e criptate per singolo club sportivo (chiavi Cloud KMS dedicate). Nessuna commistione con dati social o di altre organizzazioni.
3. **Silo 3 – De-identified Research Warehouse:** Pipeline ETL con anonimizzazione automatica irreversibile a tutela della privacy per studi accademici nel Research Hub.

---

## 5. Organizzazione della Lavagna Miro (Le 6 Zone Architetturali)

Griglia ordinata da sinistra a destra sulla board Miro online (`uXjVEbo6L2o=`):
- **ZONA 0 (Living Technical Glossary & Terminology Board):** Area enciclopedica posta a monte degli schemi con definizioni chiare e semplificate per azzerare ambiguità tecniche.
- **ZONA 1 (Contesto, Tiers & ADR):** Matrice permessi RBAC (3 Tier $\times$ 8 Ruoli), Mappa Ecosistema esterno (Wearable Apple Health/Google Health Connect) e schede Architecture Decision Record (ADR).
- **ZONA 2 (Architettura C4: Client, Server & DB):** Diagramma C4 Thin Client + API Gateway + 5 Motori Server (VBT, Periodizzazione/Triage, Z-Score, RAG, Export Excel/PDF) + 3 Silos DB.
- **ZONA 3 (Navigazione Apple & Matrice Interconnessione):** Global Shell con Selettore di Contesto Globale (Atleta/Squadra attiva) ed Event Storming cross-modulo (Fisio $\to$ Scheda; VBT $\to$ 1RM; Match Analysis $\to$ Z-Score).
- **ZONA 4 (Flowchart Operativi a 4 Swimlanes sui 3 Livelli):** Flussi operativi dei processi applicativi distribuiti sulle 3 righe verticali (General User, Partita IVA, Pro Teams) e strutturati su 6 Colonne Funzionali nel pieno rispetto della Regola 10 per layout e routing.
- **ZONA 5 (Database ERD & Roadmap Software House):** Schema Entità-Relazione completo e matrice consuntiva di capitolato.

### Matrice delle 6 Colonne Funzionali della ZONA 4
La Zona 4 organizza i 18 diagrammi di flusso incrociando i 3 Tier applicativi (righe verticali) con 6 Colonne Funzionali tematiche specializzate:
1. **Colonna 1: Identity, Security & Anti-Frode:**
   - *Tier 1 (FLOW-1A):* Accesso consumer, onboarding biometrico, anamnesi e verifica bot (WebAuthn/Turnstile).
   - *Tier 2 (FLOW-1B):* Onboarding Pro, verifica fiscale P.IVA (VIES/AdE) e contrattualistica digitale anti-frode.
   - *Tier 3 (FLOW-1C):* Onboarding Enterprise Bunker, federazione SAML 2.0 / SSO e crittografia Cloud KMS multi-tenant.
2. **Colonna 2: 3D Catalog, Kinematics & Computer Vision:**
   - *Tier 1 (FLOW-2A):* Catalogo interattivo 3D con OrbitControls e animazioni Draco ad alte prestazioni.
   - *Tier 2 (FLOW-2B):* Coach Hub, revisione esecuzione tramite Optical Bar Path Tracking da video streaming WebRTC.
   - *Tier 3 (FLOW-2C):* Multi-Staff Cockpit, sincronizzazione multi-camera 4K e Secret Club Vault a tenuta stagna.
3. **Colonna 3: Periodization, Triage & Workout Execution:**
   - *Tier 1 (FLOW-3A):* Thin Client Workout Player con timer recupero, audio feedback e caching offline IndexedDB.
   - *Tier 2 (FLOW-3B):* Macrocicli IA (DUP, Coniugata, Blocchi) e motore di Triage Clinico 119 patologie.
   - *Tier 3 (FLOW-3C):* Microciclo Squadra MD-X (gestione titolari vs panchinari) integrato su Bunker Silo 2.
4. **Colonna 4: Telemetry, Wearable Sync, VBT & GPS:**
   - *Tier 1 (FLOW-4A):* Sync wearable consumer (HealthKit, Health Connect) e Readiness Composite Score.
   - *Tier 2 (FLOW-4B):* Biomeccanica VBT avanzata (regressione OLS 1RM, MVT), salti CMJ/Abalakov e potenziamento PAP.
   - *Tier 3 (FLOW-4C):* Telemetria GPS da campo (potenza metabolica Osgnach, filtraggio DOP) e Z-Score Adattivo a 28 giorni.
5. **Colonna 5: Social Community, Marketplace & Tactical Vision:**
   - *Tier 1 (FLOW-5A):* Together Social B2C, timeline a ventaglio (Fan-Out on Write) e vetrina coach/fisio.
   - *Tier 2 (FLOW-5B):* Together Pro Business, pacchetti di consulenza e videocall WebRTC protette.
   - *Tier 3 (FLOW-5C):* Tactical Vision, tracking YOLOv8, omografia prospettica 2D e diagrammi di Voronoi per il controllo del campo.
6. **Colonna 6: Rehab ROM, Clinical Desk-Care & Research Lake:**
   - *Tier 1 (FLOW-6A):* Movely Desk-Care, prevenzione sedentarietà e micro-pause ergonomiche da ufficio.
   - *Tier 2 (FLOW-6B):* Physio Rehab, goniometro markerless AI, scala VAS 0-10 e 32 protocolli riabilitativi.
   - *Tier 3 (FLOW-6C):* Medical Room EMR a segreto medico e pipeline ETL de-identificata verso Silo 3 Research Warehouse.

---

## 6. Regola del Glossario Tecnico Evolutivo (ZONA 0 - Living Glossary)

Per eliminare ambiguità e permettere a chiunque (Software House, preparatori, medici, nuovi agenti) di comprendere istantaneamente gli schemi:
1. **Collocazione:** Frame separato e ben visibile a sinistra sulla board Miro (`uXjVEbo6L2o=`), a monte degli schemi operativi.
2. **Aggiornamento Incrementale Obbligatorio:** Ad ogni introduzione o modifica di schemi con concetti specialistici, acronimi o formule, l'agente **DEVE contestualmente creare o aggiornare la relativa card** nel Glossario Tecnico. Vietate sigle non spiegate.
3. **Template Standard Card:**
   - *Termine Ufficiale & Acronimo:* Nome esteso e sigla.
   - *Spiegazione Semplificata:* Definizione concettuale chiara, senza tecnicismi oscuri.
   - *Ruolo Operativo in T7:* Dove interviene e perché è cruciale (es. "Protegge l'algoritmo lato server", "Previene infortuni normalizzando il carico").
   - *Zona/Diagramma di Riferimento:* Dove compare negli schemi.
4. **Archivio di Riferimento Locale:** L'elenco completo e categorizzato dei termini (Architettura Cloud, Biomeccanica, Statistica/AI, Clinica) è formalizzato e custodito in `architecture-blueprint/00-capitolato-tecnico-e-glossario/00-GLOSSARIO-TERMINI-TECNICI.md`.

---

## 7. Regola Fondamentale del Capitolato Tecnico Markdown Speculare per i 18 Flowchart

Per garantire che la Software House, i programmatori e gli stakeholder ricevano un capitolato applicativo privo di ambiguità e direttamente fruibile in fase di sviluppo, ogni diagramma di flusso della board Miro possiede una documentazione tecnica speculare in formato Markdown (`.md`).

### A. Cartella Ufficiale di Consegna & Tabella Master dei 18 Flowchart
Tutti i file di spiegazione e il glossario vivente sono custoditi nella cartella dedicata:
`architecture-blueprint/00-capitolato-tecnico-e-glossario/`

La cartella contiene tassativamente:
1. `00-GLOSSARIO-TERMINI-TECNICI.md` (Dizionario enciclopedico delle 11 categorie tecnologiche).
2. I **18 file markdown di capitolato tecnico esplicativo** (uno per ciascun diagramma Miro dei 3 Software e delle 6 Colonne), corrispondenti ai 18 badge ufficiali posizionati sulla board Miro:

#### Tabella Master Ufficiale di Corrispondenza (18 Badge Miro Online)

| Badge | Tier | Colonna Funzionale | Codice | Titolo Flowchart | Miro Shape ID | Coordinate Reali (X, Y) | File Capitolato (.md) | Sorgente Mermaid (.mmd) |
| :---: | :---: | :--- | :---: | :--- | :---: | :---: | :--- | :--- |
| **#01** | Tier 1 | Col 1: Identity & Anti-Frode | `FLOW-1A` | Accesso, Onboarding & Anamnesi | `3458764688417722706` | `X: -2570, Y: 260` | `01-software-1-flow-1a-consumer-onboarding.md` | `flow-1a-consumer-onboarding.mmd` |
| **#02** | Tier 1 | Col 2: 3D Catalog & Kinematics | `FLOW-2A` | Catalogo Esercizi & Avatar 3D | `3458764688417722707` | `X: 27.35, Y: 179.87` | `02-software-1-flow-2a-personal-cockpit.md` | `flow-2a-personal-cockpit.mmd` |
| **#03** | Tier 1 | Col 3: Workout Player Thin Client | `FLOW-3A` | Thin Client & Workout Player | `3458764688417722711` | `X: 2459, Y: 465` | `03-software-1-flow-3a-workout-player.md` | `flow-3a-workout-player.mmd` |
| **#04** | Tier 1 | Col 4: Wearable Sync & Readiness | `FLOW-4A` | Wearable Health Sync & Readiness | `3458764688417722715` | `X: 4171, Y: 465` | `04-software-1-flow-4a-wearable-sync.md` | `flow-4a-wearable-sync.mmd` |
| **#05** | Tier 1 | Col 5: Together Social Community | `FLOW-5A` | Together Social & Coach Market | `3458764688417722718` | `X: 6048, Y: 465` | `05-software-1-flow-5a-together-social-b2c.md` | `flow-5a-together-social-b2c.mmd` |
| **#06** | Tier 1 | Col 6: Movely Desk-Care & Pause | `FLOW-6A` | Movely Desk-Care Ergonomia | `3458764688417722722` | `X: 7937, Y: 465` | `06-software-1-flow-6a-movely-desk-care.md` | `flow-6a-movely-desk-care.mmd` |
| **#07** | Tier 2 | Col 1: Setup Fiscale P.IVA Anti-Frode | `FLOW-1B` | Onboarding Pro & Setup Fiscale | `3458764688417722731` | `X: -2448, Y: 3090` | `07-software-2-flow-1b-pro-onboarding.md` | `flow-1b-pro-onboarding.mmd` |
| **#08** | Tier 2 | Col 2: Video AI & Revisione Coach | `FLOW-2B` | Catalogo 3D & Revisione AI | `3458764688417722736` | `X: 251.36, Y: 2940` | `08-software-2-flow-2b-coach-hub.md` | `flow-2b-coach-hub.mmd` |
| **#09** | Tier 2 | Col 3: Macrocicli IA & Triage 119 | `FLOW-3B` | Macrocicli DUP & Triage 119 | `3458764688417722743` | `X: 2459, Y: 2940` | `09-software-2-flow-3b-macrocycle-ai-triage119.md` | `flow-3b-macrocycle-ai-triage119.mmd` |
| **#10** | Tier 2 | Col 4: Biomeccanica VBT & Salti PAP | `FLOW-4B` | Biomeccanica VBT & Salti PAP | `3458764688417722745` | `X: 4171, Y: 2940` | `10-software-2-flow-4b-vbt-pap-biomechanics.md` | `flow-4b-vbt-pap-biomechanics.mmd` |
| **#11** | Tier 2 | Col 5: Together Pro Vetrina Business | `FLOW-5B` | Together Pro Business & Video | `3458764688417722746` | `X: 6048, Y: 2940` | `11-software-2-flow-5b-together-pro-business.md` | `flow-5b-together-pro-business.mmd` |
| **#12** | Tier 2 | Col 6: Physio Rehab Goniometro ROM | `FLOW-6B` | Physio Rehab ROM & Scala VAS | `3458764688417722770` | `X: 7937, Y: 2940` | `12-software-2-flow-6b-physio-rehab-rom.md` | `flow-6b-physio-rehab-rom.mmd` |
| **#13** | Tier 3 | Col 1: Onboarding Enterprise KMS | `FLOW-1C` | Onboarding Enterprise KMS | `3458764688417722778` | `X: -2925, Y: 6555` | `13-software-3-flow-1c-bunker-onboarding-kms.md` | `flow-1c-bunker-onboarding-kms.mmd` |
| **#14** | Tier 3 | Col 2: Multi-Camera 4K & Club Vault | `FLOW-2C` | Catalogo 3D Multi-Camera 4K | `3458764688417722783` | `X: -108, Y: 6235.66` | `14-software-3-flow-2c-multi-staff-cockpit.md` | `flow-2c-multi-staff-cockpit.mmd` |
| **#15** | Tier 3 | Col 3: Bunker Silo 2 & Microciclo MD-X | `FLOW-3C` | Bunker Silo 2 & Microciclo MD-X | `3458764688417722788` | `X: 2875, Y: 6567.76` | `15-software-3-flow-3c-team-microcycle-mdx.md` | `flow-3c-team-microcycle-mdx.mmd` |
| **#16** | Tier 3 | Col 4: Telemetria GPS & Z-Score 28gg | `FLOW-4C` | GPS Telemetry & Adaptive Z-Score | `3458764688417722792` | `X: 4587, Y: 6565.57` | `16-software-3-flow-4c-gps-adaptive-zscore.md` | `flow-4c-gps-adaptive-zscore.mmd` |
| **#17** | Tier 3 | Col 5: Tactical Vision & Voronoi CV | `FLOW-5C` | Tactical Vision & Voronoi CV | `3458764688417722803` | `X: 6464, Y: 6566.88` | `17-software-3-flow-5c-tactical-video-cv.md` | `flow-5c-tactical-video-cv.mmd` |
| **#18** | Tier 3 | Col 6: Medical Room EMR & Silo 3 Lake | `FLOW-6C` | Medical Room EMR & Silo 3 Lake | `3458764688417722810` | `X: 8353, Y: 6573.44` | `18-software-3-flow-6c-medical-room-research-silo3.md` | `flow-6c-medical-room-research-silo3.mmd` |

### B. Standard Obbligatorio di Ciascun File di Capitolato (.md) — "Doppio Livello di Lettura"
Ciascuno dei 18 file deve garantire il principio fondamentale del **"Doppio Livello di Lettura"**: chiarezza operativa immediata per stakeholder non tecnici (preparatori atletici, medici sociali, coach) e massimo rigore ingegneristico per la Software House. Ogni file è articolato nelle seguenti 7 sezioni obbligatorie:

1. **Identificativo, Badge & Titolo Ufficiale:** Nome formale, codice univoco del diagramma, Miro Shape ID e coordinate verificate sulla board Miro (`uXjVEbo6L2o=`), con riferimento esplicito alle voci del Glossario.
2. **Obiettivo di Business & Guida Pratica per Non-Tecnici:** Sintesi chiara e accessibile: chi utilizza il modulo, quale problema concreto risolve sul campo, e guida passo-passo per l'utente finale.
3. **Attori & Architettura a 4 Corsie (Swimlanes):**
   - *Corsia 1: Thin Client UI/UX (React 18 / Mobile)*
   - *Corsia 2: API Gateway & RBAC (Feature Gating)*
   - *Corsia 3: Server Scatola Nera (Microservizi di Calcolo)*
   - *Corsia 4: Database Tripartito (Silo 1 Social, Silo 2 Club Bunker KMS, Silo 3 Research Warehouse)*
   - *Sequence Diagram Asincrono (Mermaid):* Diagramma di sequenza asincrono a 4 partecipanti a cavallo tra Sezione 3 e 4 che modella il ciclo di vita della richiesta, handshake, elaborazione server e commit sul DB Silo.
4. **Flusso Operativo Passo-Passo (Doppio Livello A & B):**
   - **Livello A — Narrative User Journey & Guida Operativa (Non-Tecnica):** Descrizione narrativa fluida dell'esperienza utente dall'accesso alla schermata finale, con tabella dei KPI di accettazione operativa e clinica.
   - **Livello B — Engineering & Architectural Deep-Dive (Software House):** Analisi ingegneristica puntuale nodo per nodo con logiche di microservizio, controlli di sicurezza, tolleranza ai guasti e validazione dei parametri.
5. **Rami Decisionali & Gestione dei 4 Stati UI:**
   - Dettaglio di tutte le condizioni booleane (`SÌ` / `NO`), cutoff e soglie numeriche.
   - Specifiche per Empty State, Loading State, Populated State e Error/Fallback State.
6. **Contratti Dati, Parametri I/O & Matrice Errori HTTP Normalizzata:**
   - Specifiche API complete (endpoint, payload JSON di richiesta, response JSON tipizzata).
   - Matrice di Resilienza ed Errori HTTP standardizzata a 6 colonne (`HTTP Code`, `Codice Interno`, `Endpoint`, `Causa`, `UX Feedback`, `Fallback/Resilienza`).
7. **Ereditarietà di Tier & Differenziali di Fascia:**
   - Funzionalità ereditate a cascata dai livelli inferiori (per Tier 2 e Tier 3).
   - Elementi esclusivi di fascia e divieto assoluto di retrocessione a livelli inferiori.

### C. Regola Vincolante di Manutenzione Continua ad Ogni Modifica Futura (FONDAMENTALE)
Ad ogni futura lavorazione, modifica o aggiunta di funzionalità su Miro:
1. **Aggiornamento Board Miro:** Modificare forme e connettori sulla board online (`uXjVEbo6L2o=`) rispettando la Regola 10 (routing ortogonale, zero box-crossing).
2. **Aggiornamento Codice Mermaid Locale:** Sincronizzare il file sorgente `.mmd` corrispondente in `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/`.
3. **Aggiornamento Speculare del File Markdown:** **È FATTO OBBLIGO TASSATIVO** di aggiornare contestualmente il rispettivo file `.md` nella cartella `architecture-blueprint/00-capitolato-tecnico-e-glossario/`, riflettendo immediatamente le nuove logiche introdotte.
4. **Aggiornamento del Glossario Vivente:** Se sono stati introdotti nuovi termini tecnici, formule o sigle, inserire o aggiornare la scheda nel file `00-GLOSSARIO-TERMINI-TECNICI.md`.
5. **Applicazione della Cascata Top-Down:** Se la modifica riguarda Tier 1 (General User), aggiornare automaticamente i diagrammi e i file markdown di Tier 2 e Tier 3; se riguarda Tier 2, aggiornare Tier 3.
6. **Sanzione di Blocco:** Nessuna sessione di lavoro o pull request può essere considerata conclusa se i file `.md` di capitolato e il glossario non sono perfettamente allineati con i diagrammi grafici.
