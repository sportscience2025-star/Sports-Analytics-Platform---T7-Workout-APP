---
trigger: manual
---

# Regola: Progettazione Architetturale Miro, Flowchart & Specifiche Software House (DA USARE SOLO QUANDO SI LAVORA SU MIRO E NON IN NESSUN ALTRO CASO)

## 1. Principio Fondamentale, Non-Distruttività e Autonomia Architetturale

- **Ruolo dell'Agente:** Quando l'utente richiede di creare, aggiornare o espandere flowchart, schemi, flussi UI/UX, logiche o architetture dati per Miro e per la Software House, agisci come **Principal Solution Architect e Product Manager**. Traduci anche richieste discorsive o ad alto livello in schemi ingegneristici completi, deducendo autonomamente i dettagli tecnici mancanti (input/output API, tabelle DB, stati di errore, sicurezza e interconnessioni tra moduli).
- **Ispezione Preventiva e Zero Sovrascritture:** Prima di generare qualsiasi elemento su Miro o file architetturale:
  1. Verifica lo stato attuale della board Miro (tramite server MCP `miro`) e dei file già presenti nella cartella locale `E:\Nuove App Installate\Sports-Analytics-Platform---T7-Workout-APP\architecture-blueprint\`.
  2. Verifica il codice esistente della Beta (React + TypeScript) e lo storico Git per distinguere ciò che esiste già da ciò che va progettato ex novo.
  3. **NON sovrascrivere né cancellare mai** diagrammi, Frame o nodi già creati sulla board Miro: integra, collega o aggiorna in modo incrementale e ordinato.
- **Vincolo Assoluto Disco E:** Qualsiasi file di schema, codice Mermaid (`.mmd`), documentazione Markdown o cache deve essere salvato esclusivamente dentro `E:\Nuove App Installate\Sports-Analytics-Platform---T7-Workout-APP\`.

---

## 2. Visione del Prodotto e Architettura Inviolabile (Anti-Copia & Privacy)

Ogni schema progettato su Miro deve rispettare e riflettere rigorosamente questi 3 pilastri strutturali:

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

Per garantire leggibilità immediata agli ingegneri della Software House ed evitare disordine visivo:

1. **Forme Standardizzate Obbligatorie:**
   - **Rettangolo arrotondato:** Inizio / Fine del flusso (Start / End) o Trigger utente.
   - **Rettangolo standard:** Schermata UI ( nella corsia Client) o Processo/Calcolo (nella corsia Server).
   - **Rombo:** Nodo decisionale (`SE / ALLORA`) con frecce obbligatoriamente etichettate (`SÌ` / `NO` o condizione esplicita).
   - **Cilindro:** Lettura/Scrittura nel Database (specificando sempre quale dei 3 Silos è coinvolto).
2. **Struttura a 4 Corsie (Swimlanes) per ogni Flowchart Operativo:**
   Ogni flusso funzionale deve mostrare il passaggio attraverso 4 corsie distinte:
   - *Corsia 1: App Utente (Thin Client UI/UX)* -> *Corsia 2: API Gateway & Controllo Tier/Permessi* -> *Corsia 3: Server Segreto (Motori di Calcolo)* -> *Corsia 4: Database Tripartito (Silo 1, 2 o 3)*.
3. **Codice Colore Obbligatorio (Gap Analysis per Preventivo Software House):**
   - **VERDE (`AS-IS Pronto`):** Funzionalità o logica già presente e validata nella Beta React/TypeScript su disco `E:` (da migrare sul server).
   - **GIALLO (`Parziale / Refactor`):** Funzionalità abbozzata nella Beta o presente nello storico Git JS, da completare, tipizzare o collegare.
   - **ARANCIONE (`TO-BE Nuovo`):** Modulo, flusso o infrastruttura non ancora esistente, da sviluppare ex novo dalla Software House.
   - **ROSSO / VIOLA (`Vincolo Critico / ADR`):** Regola non negoziabile di sicurezza, privacy, validazione dimensionale fisica ($F$ in N, $P$ in W, Carico in kg) o requisito scientifico.
4. **Gestione Stati UI e Casi Limite (Edge Cases):**
   Non progettare mai solo il percorso ideale (*Happy Path*). Includi sempre nei flussi:
   - I 4 stati di ogni schermata principale: **Empty State** (nessun dato/primo avvio), **Loading State** (elaborazione server in corso), **Populated State** (vista normale), **Error/Fallback State** (dato mancante, file Excel malformato, assenza di baseline storica, prevenzione assoluta di `NaN`/`undefined`).

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

## 5. Protocollo di Evoluzione Continua (Gestione Nuove Idee e Moduli Futuri)

Il progetto è in continua evoluzione. Ogni volta che l'utente introduce una **nuova idea, una modifica o una funzionalità non ancora prevista**, l'agente DEVE applicare automaticamente questa checklist di propagazione in 6 punti senza lasciare parti scollegate:

1. **Classificazione Tier & Ruoli:** Definisci a quale livello di abbonamento (Tier 1, 2 o 3) appartiene la nuova funzione e quali ruoli possono vederla o modificarla.
2. **Innesto nella Navigazione (UI/UX):** Stabilisci dove si colloca nella barra di navigazione globale, con quanti click ci si arriva (obiettivo: max 2 click) e come mantiene la pulizia visiva in stile Apple.
3. **Interconnessione Cross-Modulo:** Identifica subito con quali moduli esistenti questa nuova funzione deve scambiarsi dati in automatico (chi le invia dati in ingresso e a chi invia notifiche o aggiornamenti in uscita).
4. **Separazione Client/Server:** Separa cosa vede l'utente sul telefono (Input/Output visivo) da quale calcolo o regola deve girare in segreto sul Server centrale.
5. **Impatto sul Database & Privacy:** Determina quali nuove tabelle o campi servono nell'ERD e in quale dei 3 Silos (Social pubblico, Bunker Club Pro o Ricerca Anonimizzata) devono finire i dati.
6. **Doppia Sincronizzazione (Miro MCP + File Mermaid Locali):**
   - Aggiorna o crea i blocchi corrispondenti sulla board di Miro tramite MCP rispettando le coordinate spaziali (per evitare sovrapposizioni di forme e frecce).
   - Salva o aggiorna sempre in parallelo il codice `.mmd` (Mermaid.js) e la specifica tecnica Markdown dentro `architecture-blueprint\`, così da avere sia la lavagna visiva aggiornata sia i diagrammi vettoriali pronti per la Software House.