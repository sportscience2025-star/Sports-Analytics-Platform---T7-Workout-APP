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
- **ZONA 4 (Flowchart Operativi a 4 Swimlanes sui 3 Livelli):** Flussi operativi dei processi applicativi distribuiti sulle 3 righe verticali (General User, Partita IVA, Pro Teams) nel pieno rispetto della Regola 10 per layout e routing.
- **ZONA 5 (Database ERD & Roadmap Software House):** Schema Entità-Relazione completo e matrice consuntiva di capitolato.

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
4. **Archivio di Riferimento Locale:** L'elenco completo e categorizzato dei termini (Architettura Cloud, Biomeccanica, Statistica/AI, Clinica) è formalizzato in `architecture-blueprint/00-GLOSSARIO-TERMINI-TECNICI.md`.
