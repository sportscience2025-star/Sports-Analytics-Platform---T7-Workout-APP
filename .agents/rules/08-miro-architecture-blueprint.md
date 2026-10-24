---
trigger: manual
---

# Regola: Progettazione Architetturale Miro Online, Flowchart & Specifiche Software House

## 1. Principio Fondamentale: Priorità Operativa Miro Online

- **Priorità Assoluta Board Miro:** Ogni flowchart, logica architetturale o diagramma si progetta e modifica **DIRETTAMENTE sulla Board Miro online** (Board ID: `uXjVEbo6L2o=`, URL: `https://miro.com/app/board/uXjVEbo6L2o=`) tramite server MCP `miro` (`get-items-on-board`, `create-shape-item`, `create-connector`, `update-shape-item`, `create-frame`, `create-text-item`).
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
- **Thin Client (Guscio Visivo):** L'app mobile (iOS/Android) e Web (React/TS) gestisce solo UI/UX e input utente. **Divieto assoluto** di includere nel client formule matematiche, pesature RAG o logiche proprietarie.
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
5. **Standard di Tipografia, Spaziatura, Connettori Ortogonali & Leggibilità Aurea (FONDAMENTALE - GENERALE PER TUTTA LA BOARD):**
   - **Regola Generale Assoluta**: Questo standard di leggibilità, pulizia e spaziatura non si applica solo a singoli flowchart pilota, ma è **OBBLIGATORIO E GENERALE per tutti i 18 flowchart e qualsiasi elemento presente sull'intera board Miro online**.
   - **Divieto Assoluto di Linee che Attraversano Riquadri o Testi**: Nessun connettore o freccia deve MAI tagliare o passare sopra, sotto o attraverso riquadri, rombi o didascalie intermedie. Tutti i connettori devono essere ortogonali (`shape: 'elbowed'`), percorrere corsie libere dedicate (gutter non occupati) e agganciarsi ai bordi perimetrali corretti tramite punti di snap espliciti (`snapTo: top, bottom, left, right`).
   - **Eliminazione di Tratti Diagonali a Lunga Distanza (Laser Beams)**: È vietato collegare nodi distanti con connettori curvi diagonali che attraversano la board o blocchi di altri diagrammi. I passaggi inter-modulo si gestiscono con badge/card di transizione locali ben formattate, oppure con instradamenti perimetrali ortogonali puliti.
   - **Zero Testo Tagliato o Compresso**: All'interno di qualsiasi riquadro (rettangolo arrotondato) o rombo decisionale, il testo deve essere visibile al 100% senza alcuna riga tagliata, troncata o collassata. I rombi, a causa degli angoli inclinati, richiedono una superficie utile interna maggiore: dimensionarli sempre con larghezza abbondante (W >= 340-360px) e altezza adeguata (H >= 115-130px), oppure sintetizzare il testo centrale mantenendo font leggibile (12-14px).
   - **Etichette dei Connettori Orizzontali e con Spazio Libero**: Le scritte sulle frecce e sui connettori non devono MAI essere posizionate in verticale o sovrapporsi al bordo o al testo delle card sottostanti o sovrastanti (`textOrientation: 'horizontal'`). Garantire una distanza minima di 70-90px tra i nodi collegati in modo che le didascalie abbiano ampio respiro visivo orizzontale.
   - **Respiro Visivo e Larghezza Generosa**: Ispirarsi sempre allo standard ad alto respiro dei riquadri dell'Hub Centrale: forme larghe e spaziose (W >= 380-500px) per consentire al testo di andare a capo con naturalezza. Se necessario per far respirare il diagramma, espandere l'asse X o Y mantenendo allineamento simmetrico, ordine e facilità istantanea di lettura per chiunque consulti lo schema.

---

## 4. Organizzazione della Lavagna Miro (Le 6 Zone Architetturali)

Griglia ordinata da sinistra a destra sulla board Miro:
- **ZONA 0 (Living Technical Glossary & Terminology Board):** Area enciclopedica posta a monte degli schemi con definizioni chiare e semplificate per azzerare ambiguità tecniche.
- **ZONA 1 (Contesto, Tiers & ADR):** Matrice permessi RBAC (3 Tier $\times$ 8 Ruoli), Mappa Ecosistema esterno (Wearable Apple Health/Google Health Connect) e schede ADR.
- **ZONA 2 (Architettura C4: Client, Server & DB):** Diagramma C4 Thin Client + API Gateway + 5 Motori Server (VBT, Periodizzazione/Triage, Z-Score, RAG, Export Excel/PDF) + 3 Silos DB.
- **ZONA 3 (Navigazione Apple & Matrice Interconnessione):** Global Shell con Selettore di Contesto Globale (Atleta/Squadra attiva) ed Event Storming cross-modulo (Fisio -> Scheda; VBT -> 1RM; Match Analysis -> Z-Score).
- **ZONA 4 (Flowchart Operativi a 4 Swimlanes):** Flussi passo-passo dei processi applicativi core con i 4 stati UI.
- **ZONA 5 (Database ERD & Roadmap Software House):** Schema Entità-Relazione completo e matrice consuntiva Verde/Giallo/Arancione.

---

## 5. Regola del Glossario Tecnico Evolutivo (ZONA 0 - Living Glossary)

Per eliminare ambiguità e permettere a chiunque (Software House, preparatori, medici, nuovi agenti) di comprendere istantaneamente gli schemi:
1. **Collocazione:** Frame separato e visibile a sinistra sulla board Miro (`uXjVEbo6L2o=`), a monte degli schemi operativi.
2. **Aggiornamento Incrementale Obbligatorio:** Ad ogni introduzione o modifica di schemi con concetti specialistici, acronimi o formule, l'agente **DEVE contestualmente creare o aggiornare la relativa card** nel Glossario Tecnico. Vietate sigle non spiegate.
3. **Template Standard Card:**
   - *Termine Ufficiale & Acronimo:* Nome esteso e sigla.
   - *Spiegazione Semplificata:* Definizione concettuale chiara, senza tecnicismi oscuri.
   - *Ruolo Operativo in T7:* Dove interviene e perché è cruciale (es. "Protegge l'algoritmo lato server", "Previene infortuni normalizzando il carico").
   - *Zona/Diagramma di Riferimento:* Dove compare negli schemi.
4. **Archivio di Riferimento:** L'elenco completo e categorizzato dei termini (Architettura Cloud, Biomeccanica, Statistica/AI, Clinica) è formalizzato in `architecture-blueprint/00-GLOSSARIO-TERMINI-TECNICI.md`.
