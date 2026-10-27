---
trigger: manual
---

# Regola: Architettura di Prodotto, Tiers, Ereditarietà a Cascata & Mappa Zone Miro Online

## 1. Principio Fondamentale: Priorità Operativa Miro Online

- **Priorità Assoluta Board Miro:** Ogni flowchart o architettura si progetta e modifica **DIRETTAMENTE sulla Board Miro online** (Board ID: `uXjVEbo6L2o=`, URL: `https://miro.com/app/board/uXjVEbo6L2o=`) tramite server MCP `miro` (`get-items-on-board`, `create-shape-item`, `create-connector`, `update-shape-item`, `create-frame`, `create-text-item`).
- **Sincronizzazione Locale & Git (Secondaria/Backup):** Il salvataggio di codice Mermaid (`.mmd`) e Markdown in `architecture-blueprint/`, con push su GitHub, garantisce l'allineamento tra Portatile (`C:\...`) e PC Fisso (`E:\...`).
- **Autonomia & Integrazione Non-Distruttiva:** L'agente opera come **Principal Solution Architect & Product Manager** in piena autonomia tecnica, preservando gli elementi validati e integrando senza sovrapposizioni.

---

## 2. Visione Prodotto & Architettura a 3 Fasce d'Abbonamento

Ogni schema rispetta rigorosamente il modello a 3 livelli applicativi (RBAC & Feature Gating):
1. **Tier 1 – Base (Free/Low-Cost):** Diario allenamento, catalogo 3D standard, sync wearable (HealthKit, Health Connect), **Social Movely B2C** e marketplace coach/fisio.
2. **Tier 2 – Pro (Partita IVA, Coach, Fisioterapisti):** Include Tier 1, PIÙ: Macrocicli IA avanzati (DUP, Blocchi), Triage Clinico 119 patologie (`ImpactCalculator`), pre-attivazione video, VBT (OLS 1RM, MVT), salti (CMJ, PAP), RAG scientifico personale, Export `.xlsx` e PDF interattivo.
3. **Tier 3 – Elite Club & Ricerca (Società Sportive Pro & Università):** Include Tier 1 e 2, PIÙ: Multi-Staff collaborativo granulare, Microciclo Squadra & Z-Score Adattivo 28gg (doppio ruolo tattico, fallback cold-start), Video AI/Voronoi (YOLOv8), **Encrypted Club Bunker** (KMS Silo 2) e accesso de-identificato al **Research Hub** accademico (Silo 3).

---

## 3. Regola Fondamentale di Ereditarietà Funzionale a Cascata (Top-Down)

I 18 flowchart della Zona 4 su Miro sono disposti verticalmente su 3 livelli:
- **Riga 1 (In alto):** General User / Casual (Tier 1)
- **Riga 2 (In mezzo):** Partita IVA / Coaches & Fisioterapisti (Tier 2)
- **Riga 3 (In basso):** High-Level Pro Teams & Professionisti d'Élite (Tier 3)

### A. Principio della Cascata del Valore (I Tier Superiori Ereditano Tutto)
I software professionali (Tier 2 e 3) **comprendono tutte le funzioni di base del Tier 1**, arricchite con le logiche specialistiche di fascia.

### B. Direzione Rigorosa di Propagazione (Top-Down):
1. **Modifiche al Tier 1 (General User):** **Propagazione a cascata totale e automatica** su Tier 2 e Tier 3.
2. **Modifiche al Tier 2 (Partita IVA):** **Propagazione esclusiva verso il basso** su Tier 3; mai verso il Tier 1.
3. **Modifiche al Tier 3 (Pro Teams):** **Isolamento completo:** funzionalità enterprise (KMS Silo 2, contratti KYB, SSO SAML) confinate al Tier 3.

### C. Autonomia Operativa dell'Agente
Su ogni modifica a monte, l'agente **propaga contestualmente le logiche sui livelli sottostanti**, preservando la simmetria architetturale di Miro.

---

## 4. Tutela IP & Architettura a 3 Camere Stagne

### A. Separazione "Thin Client" vs Server "Scatola Nera"
- **Thin Client (UI/UX):** React 18 / Mobile gestiscono esclusivamente rendering e interazione. **Divieto assoluto** di formule matematiche, pesature RAG o algoritmi proprietari nel client.
- **Server Cloud Centrale (Scatola Nera):** Tutti gli algoritmi (regressione OLS VBT, Z-Score, triage clinico, RAG 1.3/1.1/1.0, tracking CV) risiedono su microservizi cloud sicuri comunicanti via API criptate con token di sessione.

### B. Database a 3 Camere Stagne (Multi-Tenant Isolation)
1. **Silo 1 – Public, Social & Movely B2B/B2C:** Utenti Tier 1/2, profili pubblici, social feed e marketplace.
2. **Silo 2 – Encrypted Club Bunkers (Tier 3):** Partizioni isolate per club con chiavi Cloud KMS dedicate.
3. **Silo 3 – De-identified Research Warehouse:** Pipeline ETL con anonimizzazione irreversibile per il Research Hub.

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
2. **Colonna 2: 3D Catalog, Kinematics & Computer Vision:** Three.js Draco (Tier 1), Bar Path Tracking WebRTC (Tier 2), Multi-Camera 4K Vault (Tier 3).
3. **Colonna 3: Periodization, Triage & Workout Execution:** Player IndexedDB (Tier 1), DUP & Triage 119 patologie (Tier 2), Microciclo MD-X Bunker Silo 2 (Tier 3).
4. **Colonna 4: Telemetry, Wearable Sync, VBT & GPS:** Wearable HealthKit (Tier 1), Biomeccanica VBT/PAP (Tier 2), GPS Osgnach & Z-Score Adattivo 28gg (Tier 3).
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

L'inventario completo a 9 colonne (Badge #01–#18, Codici FLOW-1A–6C, Miro Shape ID univoci, coordinate reali X/Y, sorgenti Mermaid `.mmd` e file di capitolato `.md`) è formalizzato nel registro unico: [MASTER-FLOWCHART-REGISTRY.md](MASTER-FLOWCHART-REGISTRY.md).

| Colonna Funzionale | Tier 1 (Consumer) | Tier 2 (Pro P.IVA) | Tier 3 (Elite Club) |
| :--- | :--- | :--- | :--- |
| **Col 1: Identity & Anti-Frode** | #01 `FLOW-1A` Onboarding | #07 `FLOW-1B` Fiscale P.IVA | #13 `FLOW-1C` Bunker KMS |
| **Col 2: 3D Catalog & CV** | #02 `FLOW-2A` Catalogo 3D | #08 `FLOW-2B` Video AI Coach | #14 `FLOW-2C` Multi-Camera 4K |
| **Col 3: Periodization & Triage** | #03 `FLOW-3A` Workout Player | #09 `FLOW-3B` DUP & Triage 119 | #15 `FLOW-3C` Microciclo MD-X |
| **Col 4: Telemetry, VBT & GPS** | #04 `FLOW-4A` Wearable Sync | #10 `FLOW-4B` VBT & Salti PAP | #16 `FLOW-4C` GPS & Z-Score |
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
5. **Cascata Top-Down:** Propagare le modifiche di Tier 1 su Tier 2 e 3; quelle di Tier 2 su Tier 3.
6. **Sanzione di Blocco:** Nessun commit o PR è valido se board Miro, file `.md` e glossario non sono allineati al 100%.
