---
trigger: manual
---

# Regola: Architettura di Prodotto, Tiers, Ereditarietà a Cascata & Mappa Zone Miro Online

## 1. Principio Fondamentale: Priorità Operativa Miro Online

- **Priorità Assoluta Board Miro:** Ogni flowchart o architettura si progetta e modifica **DIRETTAMENTE sulla Board Miro online** (Board ID: `uXjVEbo6L2o=`, URL: `https://miro.com/app/board/uXjVEbo6L2o=`) tramite server MCP `miro` oppure, per deployment strutturati con connettori ortogonali `elbowed` e validazione geometrica, tramite script Node CJS dedicati sulle Miro REST API v2.
- **Sincronizzazione Locale & Git (Secondaria/Backup):** Il salvataggio di codice Mermaid (`.mmd`) e Markdown in `architecture-blueprint/`, con push su GitHub, garantisce l'allineamento tra Portatile (`C:\...`) e PC Fisso (`E:\...`).
- **Autonomia & Integrazione Non-Distruttiva:** L'agente opera come **Principal Solution Architect & Product Manager** in piena autonomia tecnica, preservando gli elementi validati e integrando senza sovrapposizioni.

---

## 2. Visione Prodotto & Architettura a 3 Fasce d'Abbonamento

Ogni schema rispetta rigorosamente il modello a 3 livelli applicativi (RBAC & Feature Gating):
1. **Tier 1 – Base (Free/Low-Cost):** Catalogo 3D read-only (zero video upload), Programmazione base pre-confezionata (NO integrazione Data Analisi), Data Analisi con sola revisione biomeccanica degli angoli principali (NO AI, NO RAG, NO wearable, NO correlazione con altre sezioni), **Social Movely B2C** e marketplace coach/fisio.
2. **Tier 2 – Pro (Partita IVA, Coach, Fisioterapisti):** Programmazione anamnestica fino a 6 mesi (multi-export e fonti scientifiche, NO RAG, NO Data Analisi), Data Analisi con angoli principali e specifici + considerazioni AI integrata, videocamera live AI con salvataggio in DB Data Analisi separato dal Catalogo, condivisione video/analisi con atleti, **modelli AI interni a potenza ridotta (70%)**, connessione **esclusiva ai wearable proprietari T7** per analisi sommaria delle metriche principali (NO RAG).
3. **Tier 3 – Elite Club & Ricerca (Società Sportive Pro & Università):** Sblocca il 100% dei vincoli di fascia: **modelli AI interni alla massima potenza (100%)** e analisi illimitate, connessione a **qualsiasi wearable, strumento o file esterno**, videocamera live AI con salvataggio video/correzioni nel Catalogo, export report/grafici/presentazioni in qualsiasi formato, **integrazione totale Data Analisi <-> Programmazione <-> Catalogo** (baseline atleta, PVT, Chatbot), e **RAG privato esclusivo Tier 3** (caricamento universale multi-formato incluse note vocali trascritte, isolamento `100% Private`, Role-Based RAG Medico/Preparatore/Atleta, clonazione stile coach, conflict check schede-referti, citazione fonti interne, memoria multi-stagione, multilingua/onboarding staff), **Encrypted Club Bunker** (KMS Silo 2) e **Research Hub** (Silo 3 solo su esplicito opt-in).

---

## 3. Regola Fondamentale di Ereditarietà Funzionale a Cascata (Top-Down)

I 18 flowchart della Zona 4 su Miro sono disposti verticalmente su 3 livelli:
- **Riga 1 (In alto):** General User / Casual (Tier 1)
- **Riga 2 (In mezzo):** Partita IVA / Coaches & Fisioterapisti (Tier 2)
- **Riga 3 (In basso):** High-Level Pro Teams & Professionisti d'Élite (Tier 3)

### A. Principio della Cascata del Valore (I Tier Superiori Ereditano Tutto)
I software professionali (Tier 2 e 3) **ereditano le capacità core dei livelli inferiori**, ma eventuali **limiti tecnici, blocchi di accesso o restrizioni di gating** propri di Tier 1 (es. NO AI) o Tier 2 (es. solo wearable T7, DB separato dal Catalogo, AI 70%, NO RAG) non si propagano come divieti al livello superiore, bensì vengono **sbloccati ed estesi** nel Tier 3.

### B. Direzione Rigorosa di Propagazione (Top-Down):
1. **Modifiche al Tier 1 (General User):** **Propagazione a cascata totale e automatica** su Tier 2 e Tier 3.
2. **Modifiche al Tier 2 (Partita IVA):** **Propagazione esclusiva verso il basso** su Tier 3; mai verso il Tier 1.
3. **Modifiche al Tier 3 (Pro Teams):** **Isolamento completo:** funzionalità enterprise (KMS Silo 2, contratti KYB, SSO SAML) confinate al Tier 3.

### C. Autonomia Operativa dell'Agente
Su ogni modifica all'interno di una colonna funzionale, l'agente propaga le capacità core sui livelli sottostanti della stessa colonna nel rispetto dei limiti/sblocchi di ciascun Tier. La propagazione verso **altre colonne funzionali** già consolidate avviene solo su mandato esplicito dell'utente (altrimenti viene registrata come debito architetturale da allineare in fase dedicata).

---

## 4. Tutela IP & Architettura a 3 Camere Stagne

### A. Separazione "Thin Client" vs Server "Scatola Nera"
- **Thin Client (UI/UX):** React 18 / Mobile gestiscono esclusivamente rendering e interazione. **Divieto assoluto** di formule matematiche, pesature RAG o algoritmi proprietari nel client.
- **Server Cloud Centrale (Scatola Nera):** Tutti gli algoritmi e i **modelli AI interni proprietari T7** (inferenza Tier 2 a capacità ridotta 70%, inferenza Tier 3 a capacità massima 100%, analisi biomeccanica/live camera CV, motore Role-Based RAG Tier 3, motori biometrici) risiedono esclusivamente su infrastruttura privata T7 isolata, senza condivisione dati verso modelli esterni di terze parti in assenza di richiesta esplicita.

### B. Database a 3 Camere Stagne (Multi-Tenant Isolation)
1. **Silo 1 – Public, Social & Movely B2B/B2C:** Utenti Tier 1/2, profili pubblici, social feed e marketplace; in Tier 2 l'archivio video/analisi di Data Analisi e il Catalogo Esercizi risiedono su **database/schemi logici separati**.
2. **Silo 2 – Encrypted Club Bunkers (Tier 3):** Partizioni isolate per club con chiavi Cloud KMS dedicate e isolamento Role-Based per il RAG (Medico, Preparatore, Atleta).
3. **Silo 3 – De-identified Research Warehouse:** Pipeline ETL con anonimizzazione irreversibile per il Research Hub, attivata **esclusivamente su esplicito opt-in** del cliente/club (mai di default).

---

## 5. Organizzazione della Lavagna Miro (Le 6 Zone Architetturali)

Griglia ordinata da sinistra a destra sulla board Miro (`uXjVEbo6L2o=`):
- **ZONA 0 (Living Technical Glossary):** Area enciclopedica a monte per azzerare ambiguità tecniche.
- **ZONA 1 (Contesto, Tiers & ADR):** Matrice RBAC (3 Tier × 8 Ruoli), Mappa Wearable e schede ADR.
- **ZONA 2 (Architettura C4):** Thin Client + API Gateway + 5 Motori Server + 3 Silos DB.
- **ZONA 3 (Navigazione Apple & Event Storming):** Global Shell con Selettore di Contesto ed Event Storming.
- **ZONA 4 (Flowchart Operativi a 4 Swimlanes):** 18 processi distribuiti sui 3 Tier e 6 Colonne Funzionali (Regola 10).
- **ZONA 5 (Database ERD & Roadmap):** Schema ERD completo e matrice consuntiva di capitolato.

### Matrice delle 6 Colonne Funzionali della ZONA 4
1. **Colonna 1: Identity, Security & Anti-Frode:** Consumer WebAuthn (Tier 1), P.IVA/VIES (Tier 2), Enterprise Bunker KMS (Tier 3).
2. **Colonna 2: 3D Catalog, Kinematics & Computer Vision:** Catalogo 3D & Avatar Zero-Upload (Tier 1), Catalogo 3D, Video 1080p, Speed Control & AI Coach 1:1 (Tier 2), Catalogo 3D, Multi-Camera 4K, Suite Tattica, Broadcast & Stress Muscolare (Tier 3).
3. **Colonna 3: Periodization, Triage & Workout Execution:** Player IndexedDB (Tier 1), DUP & Triage 119 patologie (Tier 2), Microciclo MD-X Bunker Silo 2 (Tier 3).
4. **Colonna 4: Data Analisi (Biomeccanica, Live Camera AI, Wearable T7/Multi-Device & RAG Tier 3):** Revisione Biomeccanica Angoli Principali NO AI (Tier 1), Data Analisi AI 70%, Live Camera DB Separato & Wearable T7 (Tier 2), Data Analisi AI 100%, Any-Device, Export Totale & Role-Based RAG (Tier 3).
5. **Colonna 5: Social Community, Marketplace & Tactical Vision:** Together Social Fan-Out (Tier 1), Together Pro WebRTC (Tier 2), Tactical Vision Voronoi CV (Tier 3).
6. **Colonna 6: Rehab ROM, Clinical Desk-Care & Research Lake:** Desk-Care ergonomia (Tier 1), Physio Rehab ROM/VAS (Tier 2), Medical Room Silo 3 Lake (Tier 3).

---

## 6. Regola del Glossario Tecnico Evolutivo (ZONA 0 - Living Glossary)

1. **Collocazione:** Frame a monte a sinistra sulla board Miro (`uXjVEbo6L2o=`).
2. **Aggiornamento Incrementale Obbligatorio:** Ad ogni novità concettuale, aggiornare contestualmente la scheda nel glossario. Vietate sigle non spiegate.
3. **Template Card:** Termine & Acronimo, Sintesi Concettuale (ELI5 <= 10 parole), Ruolo Operativo in T7, Zona di Riferimento.
4. **Archivio Master:** Formalizzato in `architecture-blueprint/00-capitolato-tecnico-e-glossario/00-GLOSSARIO-TERMINI-TECNICI.md`.

---

## 7. Regola Fondamentale del Capitolato Tecnico Markdown Speculare per i 18 Flowchart

Ogni diagramma di flusso su Miro possiede una documentazione tecnica speculare in Markdown (`.md`) custodita in `architecture-blueprint/00-capitolato-tecnico-e-glossario/`.

### A. Cartella Ufficiale di Consegna & Tabella Master dei 18 Flowchart

#### Tabella Master Ufficiale di Corrispondenza (18 Badge Miro Online)

L'inventario completo a 10 colonne (Badge #01–#18, Codici FLOW-1A–6C, Nodi ISO, Miro Shape ID univoci, coordinate reali X/Y, sorgenti Mermaid `.mmd` e file di capitolato `.md`) è formalizzato nel registro unico: [MASTER-FLOWCHART-REGISTRY.md](MASTER-FLOWCHART-REGISTRY.md).

| Colonna Funzionale | Tier 1 (Consumer) | Tier 2 (Pro P.IVA) | Tier 3 (Elite Club) |
| :--- | :--- | :--- | :--- |
| **Col 1: Identity & Anti-Frode** | #01 `FLOW-1A` Onboarding | #07 `FLOW-1B` Fiscale P.IVA | #13 `FLOW-1C` Bunker KMS |
| **Col 2: 3D Catalog & CV** | #02 `FLOW-2A` Catalogo 3D & Avatar | #08 `FLOW-2B` Video 1080p, Speed & AI Coach | #14 `FLOW-2C` Multi-Camera 4K & Suite Tattica |
| **Col 3: Programmazione Esercizi & Readiness** | #03 `FLOW-3A` Programmazione Base & Export PDF | #09 `FLOW-3B` Programmazione Anamnesi 6M & RTP | #15 `FLOW-3C` Programmazione Annuale RAG & Readiness Section |
| **Col 4: Data Analisi** | #04 `FLOW-4A` Biomeccanica Angoli Principali NO AI | #10 `FLOW-4B` Biomeccanica AI 70% & Wearable T7 | #16 `FLOW-4C` Biomeccanica AI 100%, Multi-Device & Role-Based RAG |
| **Col 5: Social & Tactical Vision** | #05 `FLOW-5A` Together Social | #11 `FLOW-5B` Together Pro | #17 `FLOW-5C` Tactical Voronoi |
| **Col 6: Rehab ROM & Desk-Care** | #06 `FLOW-6A` Movely Desk-Care | #12 `FLOW-6B` Physio Rehab ROM | #18 `FLOW-6C` Medical Room Lake |

### B. Standard Obbligatorio di Ciascun File di Capitolato (.md) — "Doppio Livello di Lettura"

Ogni file garantisce il **Doppio Livello di Lettura** (chiarezza operativa per coach/medici e rigore ingegneristico per sviluppatori) articolandosi in 7 sezioni:
1. **Identificativo & Titolo:** Codice, Badge Miro, Shape ID, coordinate X/Y e link al Glossario.
2. **Obiettivo di Business:** Sintesi del valore applicativo e guida per l'utente finale.
3. **Attori & 4 Corsie (Swimlanes):** Thin Client, API Gateway/RBAC, Server Scatola Nera, DB Silo con Sequence Diagram Asincrono Mermaid.
4. **Flusso Passo-Passo (Livello A Narrativo + KPI e Livello B Deep-Dive):** Journey operativo, tabella KPI e logiche tecniche dei microservizi.
5. **Rami Decisionali & 4 Stati UI:** Branching booleano e gestione stati Empty, Loading, Populated, Error/Fallback.
6. **Contratti Dati & Error Matrix:** JSON tipizzati e Matrice Errori HTTP a 6 colonne (`HTTP Code`, `Codice Interno`, `Endpoint`, `Causa`, `UX Feedback`, `Resilienza`).
7. **Ereditarietà di Tier:** Funzionalità ereditate e differenziali esclusivi di fascia.

### C. Regola Vincolante di Manutenzione Continua ad Ogni Modifica Futura (FONDAMENTALE)
Ad ogni futura lavorazione o modifica:
1. **Board Miro:** Modificare online (`uXjVEbo6L2o=`) rispettando la Regola 10 (routing ortogonale, zero box-crossing).
2. **Mermaid Locale:** Sincronizzare il file `.mmd` in `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/`.
3. **Capitolato Markdown:** Aggiornare contestualmente il file `.md` corrispondente in `architecture-blueprint/00-capitolato-tecnico-e-glossario/`.
4. **Glossario Vivente:** Inserire o aggiornare i nuovi termini specialistici in `00-GLOSSARIO-TERMINI-TECNICI.md`.
5. **Cascata Top-Down:** Propagare le modifiche di Tier 1 su Tier 2 e 3; quelle di Tier 2 su Tier 3 all'interno della stessa colonna funzionale, sbloccando i vincoli di gating nei livelli superiori.
6. **Sanzione di Blocco:** Nessun commit o PR è valido se board Miro, file `.md`, diagrammi Mermaid `.mmd` e glossario della colonna di lavoro non sono allineati al 100%.
