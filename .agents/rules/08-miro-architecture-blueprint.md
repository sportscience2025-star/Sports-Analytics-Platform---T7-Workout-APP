---
trigger: manual
---

# Regola: Progettazione Architetturale Miro Online, Flowchart & Specifiche Software House

## 1. Principio Fondamentale: Priorità Operativa Miro Online

- **Priorità Assoluta Board Miro:** Ogni flowchart, logica architetturale o diagramma si progetta e modifica **DIRETTAMENTE sulla Board Miro online** (Board ID: `uXjVEbo6L2o=`, URL: `https://miro.com/app/board/uXjVEbo6L2o=`) tramite il server MCP `miro` (`get-items-on-board`, `create-shape-item`, `create-connector`, `update-shape-item`, `create-frame`, `create-text-item`).
- **Sincronizzazione Locale & Git (Secondaria/Backup):** Il salvataggio del codice Mermaid (`.mmd`) e Markdown in `architecture-blueprint/`, con commit e push su GitHub, garantisce il passaggio allineato e trasparente tra Portatile (`C:\...`) e PC Fisso (`E:\...`).
- **Autonomia & Integrazione Non-Distruttiva:** L'agente opera come **Principal Solution Architect & Product Manager** in piena autonomia tecnica. Prima di modificare, ispeziona gli elementi esistenti per preservare i diagrammi validati, integrando in modo ordinato senza sovrapposizioni visive.

---

## 2. Visione Prodotto & Architettura Inviolabile (Tutela IP & Privacy)

Ogni schema deve rispettare rigorosamente questi 3 pilastri non negoziabili:

### A. Modello a 3 Fasce d'Abbonamento (RBAC & Feature Gating)
1. **Tier 1 – Base (Free/Low-Cost - Amatori & Fitness):** Diario allenamento base, catalogo esercizi, sync wearable base, **Social Network** e **Marketplace Movely B2C** (collaborazione con preparatori, fisio, nutrizionisti).
2. **Tier 2 – Pro (P.IVA, Coach, Fisioterapisti, Squadre Dilettanti):** Generatore Macrocicli IA (DUP, Blocchi, Coniugata, Lineare, Polarizzata), Triage Clinico 119 patologie (`ImpactCalculator`), Schede Pre-Attivazione con video allegati, Analisi VBT (OLS 1RM, MVT) e salti (CMJ, Abalakov, PAP), Motore RAG scientifico personale, Export Excel `.xlsx` sbloccato e PDF interattivo.
3. **Tier 3 – Elite Club & Ricerca (Società Sportive Pro & Università):** Multi-Staff collaborativo (Coach, S&C, Medico, Fisio, Match Analyst), Microciclo Squadra & Z-Score Adattivo (HRV/RPE + GPS con gestione doppio ruolo e fallback cold-start nuovi acquisti), Video Analisi Biomeccanica/Tattica, Bunker Privacy dedicato e **Research Hub** accademico de-identificato.

### B. Separazione "Thin Client" vs Server "Scatola Nera" (Tutela IP)
- **Thin Client (Client Guscio Visivo):** L'app mobile (iOS/Android) e Web (React/TS) gestisce solo UI/UX e input utente. **Divieto assoluto** di includere nel client formule matematiche, pesature RAG o logiche proprietarie.
- **Server Cloud Centrale (Scatola Nera):** Tutti gli algoritmi (regressione OLS VBT, calcolo Z-Score, triage clinico, RAG gerarchico moltiplicatori 1.3 / 1.1 / 1.0, video tracking) risiedono sul server e comunicano via API criptate I/O.

### C. Database a 3 Camere Stagne (Multi-Tenant Isolation)
1. **Silo 1 – Public, Social & Movely B2B/B2C:** Dati utenti Tier 1/2, feed social, networking professionale.
2. **Silo 2 – Encrypted Club Bunkers (Tier 3):** Partizioni isolate e criptate per singolo club (Cloud KMS). Nessuna commistione con dati social o di altre squadre.
3. **Silo 3 – De-identified Research Warehouse:** Pipeline ETL con anonimizzazione automatica irreversibile per studi accademici nel Research Hub.

---

## 3. Standard Visivi, Notazione ISO, Swimlanes & Codice Colore

1. **Forme ISO Standard:**
   - *Rettangolo arrotondato:* Start / End o Trigger utente.
   - *Rettangolo standard:* Schermata UI (corsia Client) o Processo/Calcolo (corsia Server).
   - *Rombo:* Decisione condizionale (`SE/ALLORA`) con frecce etichettate (`SÌ`/`NO`).
   - *Cilindro:* Persistenza DB (con indicazione esplicita del Silo 1, 2 o 3).
2. **Struttura a 4 Swimlanes (Corsie Obbligatorie per ogni Flowchart):**
   - *Corsia 1: App Utente (Thin Client UI/UX)* ->
   - *Corsia 2: API Gateway & Controllo Tier/RBAC* ->
   - *Corsia 3: Server Segreto (Motori di Calcolo Proprietà Intellettuale)* ->
   - *Corsia 4: Database Tripartito (Silo 1, 2 o 3)*.
3. **Codice Colore Gap Analysis (Capitolato Software House):**
   - **VERDE (`AS-IS Pronto`):** Già implementato e validato nella Beta React/TS (da migrare su server).
   - **GIALLO (`Parziale / Refactor`):** Abbozzato o presente nel legacy JS, da completare/tipizzare.
   - **ARANCIONE (`TO-BE Nuovo`):** Da sviluppare ex novo dalla Software House.
   - **ROSSO/VIOLA (`ADR / Vincolo Critico`):** Requisito non negoziabile di sicurezza, privacy o validazione fisica ($F$ in N, $P$ in W, Carico in kg).
4. **Gestione dei 4 Stati UI & Edge Cases:**
   Includere sempre in ogni flusso: **Empty State** (nessun dato), **Loading State** (chiamata server), **Populated State** (vista ordinaria), **Error/Fallback State** (dati mancanti, credenziali errate, cold-start senza baseline, prevenzione tassativa di `NaN`/`undefined`).

---

## 4. Organizzazione della Lavagna Miro (Le Zone Architetturali)

Griglia ordinata da sinistra a destra sulla board Miro:
- **ZONA 0 (Living Technical Glossary & Terminology Board):** Area enciclopedica evolutiva a monte dei flussi. Contiene le definizioni semplificate e il contesto d'uso di tutti i termini tecnici per facilitare la lettura degli schemi.
- **ZONA 1 (Contesto, Tiers & ADR):** Matrice permessi RBAC (3 Tier $\times$ 8 Ruoli), Mappa Ecosistema esterno (Wearable Apple Health/Google Health Connect) e schede ADR.
- **ZONA 2 (Architettura C4: Client, Server & DB):** Diagramma C4 Thin Client + API Gateway + 5 Motori di Calcolo Server (VBT, Periodizzazione/Triage, Z-Score Microciclo, RAG Scientifico, Document I/O) + 3 Silos DB.
- **ZONA 3 (Navigazione Apple & Matrice Interconnessione):** Global Shell con Selettore di Contesto Globale (Atleta/Squadra attiva) ed Event Storming cross-modulo (Fisio -> Scheda; VBT -> 1RM; Match Analysis -> Z-Score).
- **ZONA 4 (Flowchart Operativi a 4 Swimlanes):** Flussi passo-passo dei processi applicativi core con i 4 stati UI.
- **ZONA 5 (Database ERD & Roadmap Software House):** Schema Entità-Relazione completo e matrice consuntiva Verde/Giallo/Arancione.

---

## 5. Regola del Glossario Tecnico Evolutivo (ZONA 0 - Living Glossary)

Per eliminare ambiguità e permettere a chiunque (Software House, preparatori, medici, nuovi agenti) di comprendere istantaneamente gli schemi:

1. **Collocazione Dedicata:** Un frame separato e visibile sulla board Miro (`uXjVEbo6L2o=`), a monte degli schemi operativi.
2. **Aggiornamento Incrementale Obbligatorio:** Ad ogni introduzione o modifica di schemi che contengono concetti specialistici, acronimi o formule, l'agente o lo sviluppatore **DEVE contestualmente creare o aggiornare la relativa scheda/card** nel Glossario Tecnico prima di concludere il lavoro. Vietate sigle non spiegate.
3. **Template Standard Card:**
   - *Termine Ufficiale & Acronimo:* Nome esteso e sigla.
   - *Spiegazione Semplificata:* Definizione concettuale chiara, senza tecnicismi oscuri.
   - *Ruolo Operativo in T7:* Dove interviene e perché è cruciale (es. "Protegge l'algoritmo lato server", "Previene infortuni normalizzando il carico").
   - *Zona/Diagramma di Riferimento:* Dove compare negli schemi.
4. **4 Categorie Visive nel Glossario:**
   - *Architettura Software & Cloud:* Thin Client, API Gateway, Cloud KMS, Multi-Tenant Isolation, RBAC, Feature Gating, Silos DB, Swimlanes, C4.
   - *Biomeccanica & Valutazione:* VBT, MVT, PAP, Curva Forza-Velocità, CMJ, Abalakov, Valgismo Dinamico.
   - *Statistica, Algoritmi & AI:* Z-Score Adattivo, Z-Weighting, RAG Scientifico ($\times 1.3 / \times 1.1 / \times 1.0$), Regressione OLS, Filtro Outlier IQR, Cold-Start Fallback.
   - *Metodologia & Clinica:* DUP, Periodizzazione a Blocchi/Coniugata, Triage 119 Patologie, Return To Play, ImpactCalculator.

---

## 6. Protocollo Operativo: Board Miro Online & Sincronizzazione

Per ogni intervento:

1. **Azione Primaria su Miro Online (MCP miro):**
   - Opera direttamente sulla board `uXjVEbo6L2o=` (`get-items-on-board`, `create-shape-item`, `create-connector`, `update-shape-item`, `create-frame`, `create-text-item`).
   - Rispetta le 4 swimlanes, i codici colore (Verde/Giallo/Arancione/Rosso) e le forme ISO.
   - **Check Glossario Obbligatorio:** Aggiorna la Zona 0 per ogni nuovo termine o metrica introdotta.
2. **Azione Secondaria Sync Locale & Git (Portatile $\leftrightarrow$ Fisso):**
   - Aggiorna i file Mermaid `.mmd` e documentazione Markdown in `architecture-blueprint/` (incluso `architecture-blueprint/00-GLOSSARIO-TERMINI-TECNICI.md`).
   - Esegui commit e push su GitHub (`git add`, `git commit`, `git push origin main`) per garantire allineamento istantaneo su entrambi i PC.
