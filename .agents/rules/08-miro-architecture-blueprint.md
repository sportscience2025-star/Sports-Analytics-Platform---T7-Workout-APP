---
trigger: model_decision
description: "Attivare quando si progetta o modifica la board Miro (uXjVEbo6L2o=), i 18 flowchart, i Piani di Abbonamento (Tier 1/2/3), la cascata Top-Down, la separazione Thin Client/Server/3 Silos DB, il Glossario o i capitolati in architecture-blueprint."
---

# Regola 08: Architettura Prodotto, Piani di Abbonamento, Tutela IP e Board Miro

## Scopo
Proteggere la struttura commerciale e tecnica dell'applicazione (3 Piani di Abbonamento, segreto industriale sul Server e 3 Database separati) e garantire che Board Miro, diagrammi locali e capitolati restino sempre allineati al 100%.

> **Nota terminologica:** In questo file "Tier 1 / Tier 2 / Tier 3" indica i **Piani di Abbonamento Software** (Utente Base, Pro P.IVA, Elite Club), distinti dai livelli di autorevolezza scientifica della Regola 04.

## Cosa l'AI NON può fare (Divieti assoluti)
- **Mai mettere formule o algoritmi segreti nel client:** nel codice scaricato dall'utente (React 18 / Mobile "Thin Client") è vietato inserire formule matematiche proprietarie, pesature RAG, logica AI o chiavi di calcolo. Tutto ciò risiede solo sul Server cloud isolato ("Scatola Nera"), senza inviare dati a modelli terzi esterni salvo richiesta esplicita.
- **Mai far risalire funzioni Enterprise verso i piani bassi:** funzioni esclusive del Tier 3 (es. 4K, broadcast, stress muscolare, AI 100%, RAG privato, Bunker KMS, SSO/KYB) restano confinate al Tier 3 e non risalgono mai al Tier 2 o Tier 1.
- **Mai mescolare i 3 Database (3 Camere Stagne):**
  - **Silo 1 (Public/Social/Movely):** utenti Tier 1/2 e social; in Tier 2, archivio Data Analisi e Catalogo Esercizi restano su database/schemi logici separati.
  - **Silo 2 (Encrypted Club Bunkers - Tier 3):** partizioni isolate per club con chiavi KMS dedicate e RAG separato per ruolo (Medico, Preparatore, Atleta).
  - **Silo 3 (De-identified Research Warehouse):** anonimizzazione irreversibile per ricerca, **vietata di default** e attivabile solo su consenso esplicito (`opt-in`) del cliente/club.
- **Mai propagare modifiche su altre colonne senza mandato:** la propagazione verso colonne funzionali diverse da quella modificata avviene solo su ordine esplicito dell'utente (altrimenti registrarla come debito architetturale).
- **Divieto di chiusura disallineata:** nessun commit o PR è valido se Board Miro, file `.mmd`, capitolato `.md` e Glossario Vivente della colonna toccata non sono sincronizzati al 100%.

## Cosa l'AI DEVE fare (Obblighi operativi)

### 1. Priorità Miro Online & Sincronizzazione Git
- Progettare e modificare **direttamente sulla Board Miro online** (`uXjVEbo6L2o=`, URL `https://miro.com/app/board/uXjVEbo6L2o=`) via server MCP `miro` oppure script Node `.cjs` sulle REST API v2.
- Salvare i sorgenti Mermaid (`.mmd`) e i capitolati Markdown (`.md`) in `architecture-blueprint/` su Git come specchio/backup multi-dispositivo, operando senza distruggere elementi già validati.

### 2. Vincoli invarianti dei 3 Piani di Abbonamento (RBAC & Feature Gating)
*(I dettagli operativi dei singoli flussi risiedono nel registro master e nei rispettivi `.md` di capitolato.)*
- **Tier 1 – Base (Consumer):** Catalogo 3D sola lettura (zero upload/editing video), Programmazione pre-confezionata (no Data Analisi, export PDF fisso), Data Analisi solo angoli principali (no AI, no RAG, no wearable), Social Movely B2C.
- **Tier 2 – Pro (Partita IVA, Coach, Fisio):** Catalogo personalizzato max 1080p, editing e condivisione 1:1 (no broadcast), Programmazione anamnestica fino a 6 mesi con multi-export e fonti scientifiche (no RAG, no Data Analisi), Data Analisi con AI ridotta (70%) + soli wearable proprietari T7 + DB Data Analisi separato dal Catalogo.
- **Tier 3 – Elite Club & Ricerca:** Sblocca i vincoli di fascia: video 4K, broadcast e analisi stress muscolare; AI alla massima potenza (100%); qualsiasi wearable/file esterno; integrazione totale Data Analisi <-> Programmazione <-> Catalogo (inclusa Readiness Section: PVT, HRV, rischio infortuni, Z-score); RAG privato multi-formato isolato per ruolo; Bunker KMS (Silo 2) e Research Hub (Silo 3 solo opt-in).

### 3. Cascata Funzionale Top-Down (Riga 1 -> Riga 2 -> Riga 3 su Miro)
- **Modifiche Tier 1:** scendono automaticamente su Tier 2 e Tier 3.
- **Modifiche Tier 2:** scendono solo su Tier 3 (mai verso Tier 1).
- **Sblocco dei limiti:** le capacità core scendono verso il basso, mentre i divieti di fascia inferiore (es. no AI in Tier 1, solo wearable T7 / AI 70% in Tier 2) vengono sbloccati nei livelli superiori.

### 4. Mappa delle 6 Zone Miro & Tabella Unificata dei 18 Flowchart (Zona 4)
Le 6 Zone da sinistra a destra sulla board: **Zona 0** (Living Glossary), **Zona 1** (Contesto, Tiers & ADR), **Zona 2** (Architettura C4), **Zona 3** (Navigazione Apple & Event Storming), **Zona 4** (18 Flowchart a 4 Swimlanes, standard grafici in Regola 10), **Zona 5** (Database ERD & Roadmap).

Inventario completo (ID Miro, coordinate X/Y, `.mmd` e `.md`) nel registro unico: [MASTER-FLOWCHART-REGISTRY.md](../../architecture-blueprint/00-capitolato-tecnico-e-glossario/MASTER-FLOWCHART-REGISTRY.md).

| Colonna Funzionale (Zona 4) | Tier 1 (Consumer) | Tier 2 (Pro P.IVA) | Tier 3 (Elite Club) |
| :--- | :--- | :--- | :--- |
| **Col 1: Identity & Anti-Frode** | #01 `FLOW-1A` Onboarding WebAuthn | #07 `FLOW-1B` Fiscale P.IVA/VIES | #13 `FLOW-1C` Bunker KMS |
| **Col 2: Catalogo Esercizi & CV** | #02 `FLOW-2A` Catalogo 3D & Avatar | #08 `FLOW-2B` Video 1080p, Speed & AI Coach | #14 `FLOW-2C` Multi-Camera 4K & Stress Muscolare |
| **Col 3: Programmazione & Readiness** | #03 `FLOW-3A` Schede Base & Export PDF | #09 `FLOW-3B` Anamnesi 6M, RTP & Fonti AI | #15 `FLOW-3C` Piano Annuale RAG & Readiness Section |
| **Col 4: Data Analisi** | #04 `FLOW-4A` Angoli Principali NO AI | #10 `FLOW-4B` AI 70%, Live Cam DB Separato & Wearable T7 | #16 `FLOW-4C` AI 100%, Any-Device, Full Export & Role-Based RAG |
| **Col 5: Social & Tactical Vision** | #05 `FLOW-5A` Together Social B2C | #11 `FLOW-5B` Together Pro WebRTC | #17 `FLOW-5C` Tactical Voronoi CV |
| **Col 6: Rehab ROM & Desk-Care** | #06 `FLOW-6A` Movely Desk-Care | #12 `FLOW-6B` Physio Rehab ROM/VAS | #18 `FLOW-6C` Medical Room Silo 3 Lake |

### 5. Glossario Vivente, Capitolati a Doppio Livello & Manutenzione Continua
- **Glossario (Zona 0):** aggiornare sempre [00-GLOSSARIO-TERMINI-TECNICI.md](../../architecture-blueprint/00-capitolato-tecnico-e-glossario/00-GLOSSARIO-TERMINI-TECNICI.md) e la board Miro per ogni nuovo termine (scheda: Termine/Acronimo, sintesi <= 10 parole, Ruolo in T7, Zona). Vietate sigle non spiegate.
- **Standard `.md` (7 sezioni a Doppio Livello — operativo + tecnico):** (1) Identificativo & Titolo, (2) Obiettivo di Business, (3) Attori & 4 Corsie + Sequence Diagram Mermaid, (4) Flusso passo-passo (Livello A Narrativo + KPI / Livello B Deep-Dive), (5) Rami decisionali & 4 Stati UI, (6) Contratti dati JSON & Matrice Errori HTTP a 6 colonne, (7) Ereditarietà di Tier.
- **Sequenza obbligatoria ad ogni modifica:** (1) Aggiorna Board Miro online (Regola 10) -> (2) Aggiorna `.mmd` in `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/` -> (3) Aggiorna `.md` e `MASTER-FLOWCHART-REGISTRY.md` -> (4) Aggiorna Glossario Vivente -> (5) Applica cascata Top-Down nella colonna -> (6) Verifica allineamento 100% prima del commit.
