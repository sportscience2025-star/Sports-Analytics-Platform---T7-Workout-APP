---
trigger: manual
---

# Regola: Progettazione Architetturale Miro Online, Flowchart & Specifiche Software House (PRIORITÀ BOARD MIRO ONLINE)

## 1. Principio Fondamentale: Priorità Operativa sulla Board Miro Online

- **Priorità Assoluta Board Miro Online:** Quando si lavora su schemi, flowchart, flussi UI/UX, logiche architetturali o diagrammi, **la priorità operativa è lavorare DIRETTAMENTE sulla Board di Miro online** (Board ID: `uXjVEbo6L2o=`, URL: `https://miro.com/app/board/uXjVEbo6L2o=`) tramite il server MCP `miro` (utilizzando il token di accesso e gli strumenti dedicati: lettura elementi, creazione forme, connettori, frame e testi).
- **Ruolo della Sincronizzazione Locale & GitHub (Secondario):** La generazione dei file locali (codice Mermaid `.mmd` e documentazione Markdown in `architecture-blueprint/`) e il salvataggio su GitHub (`git add`, `git commit`, `git push`) sono un'attività di **backup e sincronizzazione secondaria**. Servono a garantire che, quando si passa dal Portatile (`C:\Users\srigo\Sports-Analytics-Platform---T7-Workout-APP`) al PC Fisso (`E:\Nuove App Installate\Sports-Analytics-Platform---T7-Workout-APP`), il repository contenga lo storico completo e aggiornato di tutto ciò che è stato realizzato sulla board online.
- **Autorizzazione Utente & Autonomia Operativa:** L'agente ha autorizzazione esplicita ad agire come **Principal Solution Architect e Product Manager** direttamente sulla board Miro online. Può ispezionare gli elementi esistenti (`get-items-on-board`), aggiungere nuovi nodi, aggiornare testi e creare collegamenti in piena autonomia tecnica.
- **Integrazione Non-Distruttiva e Ordinata:** Prima di intervenire sulla board Miro, ispeziona lo stato attuale dei frame e degli elementi per non cancellare o sovrascrivere diagrammi validati. Integra, collega o aggiorna in modo incrementale e pulito, mantenendo spaziature adeguate ed evitando sovrapposizioni visive.

---

## 2. Visione del Prodotto e Architettura Inviolabile (Anti-Copia & Privacy)

Ogni schema progettato o aggiornato su Miro online deve rispettare e riflettere rigorosamente questi 3 pilastri strutturali:

### A. Modello a 3 Fasce d'Abbonamento (RBAC & Feature Gating)
1. **Tier 1 – Base (€0 / Low-Cost - Utenti Palestra & Amatori):** Diario allenamento, catalogo esercizi base, sincronizzazione salute/wearable base, **Social Network** (condivisione esperienze allenamento/nutrizione) e **Marketplace B2C (Movely)** per cercare e collaborare con Nutrizionisti, Fisioterapisti e Preparatori.
2. **Tier 2 – Pro / Partite IVA (Preparatori, Fisioterapisti, Nutrizionisti, Squadre Dilettanti):** Sblocca Generatore Macrocicli IA (DUP, Blocchi, Lineare, Polarizzata, Coniugata), Triage clinico patologie (`ImpactCalculator`), Schede di Pre-Attivazione con esercizi custom e video dimostrativi allegati, Data Analisi VBT e test di salto (CMJ, Abalakov, PAP), Motore RAG personale (che apprende lo stile del professionista), Export Excel `.xlsx` totalmente sbloccato e PDF interattivo, Vetrina B2B/B2C.
3. **Tier 3 – Elite Teams & Ricerca Scientifica (Società Sportive Pro & Università):** Sblocca ambiente Multi-Staff collaborativo (Allenatore, Preparatore, Medico, Fisioterapista, Match Analyst), Analisi Microciclo Squadra & Z-Score adattivo (carico interno HRV/RPE/HRR + carico esterno GPS/Sprint con gestione doppio ruolo tattico e fallback nuovi acquisti senza baseline), Video Analisi Biomeccanica e Match/Tactical Analysis, Bunker Privacy isolato per singolo Club e **Research Hub** per studi accademici.

### B. Separazione "Thin Client" vs Server Esterno "Scatola Nera" (Tutela IP)
- **Divieto di Logica sul Client:** L'applicazione scaricata sullo smartphone (iOS/Android) o aperta via Web (React/TS) deve essere progettata nei diagrammi esclusivamente come **Thin Client (Guscio Visivo)**. Non deve contenere formule matematiche, algoritmi di periodizzazione, pesature RAG o database completi.
- **Server Centrale "Scatola Nera" (Backend API):** Tutti gli algoritmi proprietari (regressione OLS VBT, calcolo Z-Score, `ImpactCalculator`, selettore periodizzazione, RAG con moltiplicatori gerarchici delle fonti scientifiche Tier 1 $\times 1.3$, Tier 2 $\times 1.1$, Tier 3 $\times 1.0$, Video/Match Analysis) devono risiedere sul Server Cloud esterno e comunicare con l'app solo tramite chiamate API criptate di Input/Output ("botta e risposta").

### C. Database Centralizzato a 3 Camere Stagne (Multi-Tenant Isolation)
Nei diagrammi dati e infrastrutturali, la persistenza deve essere sempre tripartita:
1. **Silo 1 – Public, Social & Movely B2B/B2C DB:** Dati utenti Tier 1/2, post social, rete professionale e collaborazioni.
2. **Silo 2 – Encrypted Club Bunkers (Tier 3):** Partizioni isolate (Tenant Isolation) e criptate per ciascuna società sportiva professionistica. Nessun dato medico, biometrico, GPS o tattico di un club può avere punti di contatto con il Social Network o con altri club.
3. **Silo 3 – De-identified Research Warehouse:** Pipeline con filtro di anonimizzazione automatica che rimuove qualsiasi dato identificativo prima di rendere disponibili i dataset biometrici/statistici ai ricercatori nel Research Hub.

---

## 3. Standard Visivi, Notazione ISO, Swimlanes e Codice Colore su Miro

Per garantire leggibilità immediata agli ingegneri della Software House ed evitare disordine visivo sulla board:

1. **Forme Standardizzate Obbligatorie:**
   - **Rettangolo arrotondato:** Inizio / Fine del flusso (Start / End) o Trigger utente.
   - **Rettangolo standard:** Schermata UI (nella corsia Client) o Processo/Calcolo (nella corsia Server).
   - **Rombo:** Nodo decisionale (`SE / ALLORA`) con frecce obbligatoriamente etichettate (`SÌ` / `NO` o condizione esplicita).
   - **Cilindro:** Lettura/Scrittura nel Database (specificando sempre quale dei 3 Silos è coinvolto).
2. **Struttura a 4 Corsie (Swimlanes) per ogni Flowchart Operativo:**
   Ogni flusso funzionale deve mostrare il passaggio attraverso 4 corsie distinte:
   - *Corsia 1: App Utente (Thin Client UI/UX)* -> *Corsia 2: API Gateway & Controllo Tier/Permessi* -> *Corsia 3: Server Segreto (Motori di Calcolo)* -> *Corsia 4: Database Tripartito (Silo 1, 2 o 3)*.
3. **Codice Colore Obbligatorio (Gap Analysis per Preventivo Software House):**
   - **VERDE (`AS-IS Pronto`):** Funzionalità o logica già presente e validata nella Beta React/TypeScript (da migrare sul server).
   - **GIALLO (`Parziale / Refactor`):** Funzionalità abbozzata nella Beta o presente nello storico Git JS, da completare, tipizzare o collegare.
   - **ARANCIONE (`TO-BE Nuovo`):** Modulo, flusso o infrastruttura non ancora esistente, da sviluppare ex novo dalla Software House.
   - **ROSSO / VIOLA (`Vincolo Critico / ADR`):** Regola non negoziabile di sicurezza, privacy, validazione dimensionale fisica ($F$ in N, $P$ in W, Carico in kg) o requisito scientifico.
4. **Gestione Stati UI e Casi Limite (Edge Cases):**
   Non progettare mai solo il percorso ideale (*Happy Path*). Includi sempre nei flussi:
   - I 4 stati di ogni schermata principale: **Empty State** (nessun dato/primo avvio), **Loading State** (elaborazione server in corso), **Populated State** (vista normale), **Error/Fallback State** (dato mancante, credenziali errate, assenza di baseline storica, prevenzione assoluta di `NaN`/`undefined`).

---

## 4. Organizzazione della Lavagna Miro (Le 5 Zone Architetturali)

Mantieni la board Miro ordinata da sinistra verso destra secondo questa griglia a 5 Zone:
- **ZONA 1 (Contesto, Tiers & ADR):** Matrice permessi Tier 1/2/3, Mappa Ecosistema esterno (Input/Output file, Wearable Apple Health/Health Connect) e schede ADR (*Architecture Decision Records*).
- **ZONA 2 (Architettura C4: Client, Server & DB):** Schema dell'infrastruttura Thin Client + API Gateway + i 5 Motori Server-Side (*Biomechanics/VBT, Periodization/Clinical Triage, Team Microcycle/Z-Score, RAG/Scientific Evidence, Document I/O Excel/PDF*) + i 3 Silos Database.
- **ZONA 3 (Navigazione Stile Apple & Matrice Interconnessione Moduli):**
  - *Global Navigation Shell:* Barra di navigazione pulita e adattiva con **Selettore di Contesto Globale** (Atleta attivo / Squadra attiva) che aggiorna istantaneamente tutti i moduli senza ricaricamenti o perdita di stato.
  - *Event Storming Cross-Modulo:* Frecce parlanti che mostrano come un'azione in un modulo aggiorna automaticamente gli altri (es. Infortunio/Readiness in *Clinica* -> filtra esercizi in *Programmazione*; Test in *VBT* -> aggiorna `%1RM` nella *Scheda*; *Match Analysis/GPS* -> aggiorna *Z-Score* e avvisa *Fisio/Coach*; collaborazione in *Social/Movely* -> invia scheda/dieta nel diario cliente).
- **ZONA 4 (Flowchart Operativi a Swimlanes):** Diagrammi passo-passo dei processi core dell'applicazione.
- **ZONA 5 (Database ERD & Roadmap Software House):** Schema Entità-Relazione completo di tutte le tabelle dati e matrice riassuntiva Verde/Giallo/Arancione per il capitolato tecnico.

---

## 5. Protocollo Operativo: Board Miro Online e Sincronizzazione

Ogni volta che si introducono o aggiornano diagrammi, funzionalità o flussi:

1. **Azione Primaria su Miro Online (MCP miro):**
   - Interroga ed elabora direttamente gli elementi sulla lavagna Miro online (`uXjVEbo6L2o=`) via MCP (`get-items-on-board`, `create-shape-item`, `create-connector`, `update-shape-item`, `create-frame`).
   - Assicura che le forme rispettino le 4 swimlanes, la corretta attribuzione dei colori (Arancione per moduli nuovi, Verde solo per codice pronto) e i testi chiari senza nodi ridondanti.
2. **Azione Secondaria di Allineamento Locale & Git (Passaggio Portatile $\leftrightarrow$ Fisso):**
   - Salva o aggiorna in parallelo il codice `.mmd` (Mermaid.js) e le specifiche Markdown nella cartella di lavoro `architecture-blueprint/`.
   - Esegui commit e push su GitHub (`git add`, `git commit`, `git push origin main`), in modo che il lavoro effettuato sul portatile sia immediatamente disponibile per il riallineamento (`git pull origin main`) sul PC fisso (e viceversa), preservando la piena continuità del lavoro tra dispositivi.
