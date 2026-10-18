# AUDIT ARCHITETTURALE E RADIOGRAFIA AS-IS DEL PROGETTO (BETA REACT 18 + TS)
## T7 Workout — Sports Analytics Platform

---

## 1. INTRODUZIONE ED OBIETTIVI DELL'AUDIT

Il presente documento costituisce la radiografia tecnica dello stato attuale ("AS-IS") dell'applicazione **T7 Workout (Sports Analytics Platform)**, validata ed eseguita a partire dall'analisi dell'albero dei sorgenti in `src/`, dello storico Git (`git log`, commit di migrazione `25928fd`) e delle dipendenze di runtime.
L'obiettivo e fornire alla Software House incaricata dello sviluppo industriale una base di conoscenza trasparente su cosa e gia implementato e collaudato (VERDE), cosa richiede refactoring/completamento (GIALLO) e quali componenti strutturali devono essere sviluppati ex novo (ARANCIONE / ROSSO).

---

## 2. METRICHE CHIAVE E CENSIMENTO DEL DATA LAYER

- **Linguaggio e Framework:** TypeScript 5.4+ (Strict Mode attivo), React 18.3.1, Vite 5.2.
- **File TypeScript censiti in `src/`:** 108 file organizzati secondo il paradigma Feature-Driven.
- **Validazione sintattica:** 100% superata tramite `py test_check.py` (zero errori di bilanciamento o token errati).

### 2.1 Catalogo Esercizi (296 Esercizi Codificati)
Il repository contiene 296 esercizi formalmente strutturati con metadati anatomici, catene cinetiche, pattern motori e coefficienti di carico assiale in `src/data/exercises/`:
1. `arms.ts`: Bicipiti, tricipiti, avambracci (flessione, estensione, pronosupinazione).
2. `back.ts`: Gran dorsale, trapezio, romboidi, erettori spinali (trazione verticale, orizzontale).
3. `chest.ts`: Gran pettorale, piccolo pettorale, dentato anteriore (spinta orizzontale, inclinata, dip).
4. `core.ts`: Retto dell'addome, obliqui, trasverso, anti-estensione, anti-rotazione, anti-flessione laterale.
5. `legs.ts`: Quadricipiti, ischiocrurali, glutei, polpacci (accosciata, cerniera d'anca, spinta monopodalica).
6. `shoulders.ts`: Deltoide anteriore, laterale, posteriore, cuffia dei rotatori (spinta verticale, alzate).
7. `clinical-knee.ts`: 32 protocolli specifici per la riabilitazione del ginocchio (`cli_01` fino a `cli_32`), suddivisi per patologia (LCA, femoro-rotulea, menisco, tendinopatia rotulea) e fase di carico progressivo.

### 2.2 Tassonomia Clinica (119 Condizioni Patologiche)
Il layer clinico in `src/data/conditions/` censisce 119 condizioni patologiche categorizzate in 5 distretti:
1. `colonna.ts`: Ernie discali (L4-L5, L5-S1), protrusioni, spondilolistesi, stenosi del canale, lombalgie aspecifiche, iperlordosi, ipercifosi, scoliosi strutturate.
2. `arti-inferiori.ts`: Lesioni legamentose (LCA, LCP, LCM, LCL), sindrome femoro-rotulea, meniscopatie, tendinopatia achillea, pubalgia, fascite plantare, impingement femoro-acetabolare.
3. `arti-superiori.ts`: Lesioni della cuffia dei rotatori, impingement sub-acromiale, instabilita gleno-omerale, SLAP lesion, epicondilite, epitrocleite, tunnel carpale.
4. `sistemiche.ts`: Ipertensione arteriosa, diabete mellito tipo 1 e 2, osteoporosi, fibromialgia, asma da sforzo.
5. `neurologiche-speciali.ts`: Sclerosi multipla in fase remittente, esiti di ictus con emiparesi lieve, morbo di Parkinson lieve-moderato.

Ogni condizione mappa:
- Gravita clinica (scala ordinale 1..5).
- Controindicazioni assolute e relative.
- ROM (Range of Motion) consentiti e proibiti in gradi articolari.
- Pattern motori vietati o raccomandati.

### 2.3 Archivio Evidenze Scientifiche (322 Fonti Peer-Reviewed)
In `src/data/sources.ts` sono catalogati 322 articoli scientifici di riferimento internazionale (PubMed Indexed) completi di:
- Titolo, autori, rivista accreditata, anno di pubblicazione.
- Identificativi univoci: DOI e PMID.
- Tag tematici: VBT, PAP, Periodizzazione, Biomeccanica, Riabilitazione, Ipertrofia, Z-Score.

---

## 3. AUDIT DEI MOTORI FUNZIONANTI NELLA BETA

### 3.1 Physics & VBT Engine (`src/physics/physics-engine.ts`)
- **Modellazione Carico-Velocita:** Regressione lineare Ordinary Least Squares (OLS) $v = a \cdot L + b$ e regressione quadratica polinomiale $v = a \cdot L^2 + b \cdot L + c$.
- **Rilevamento e Filtraggio Outlier:** Calcolo dei residui di velocita rispetto alla retta preliminare; scarto delle ripetizioni anomale che superano la soglia statistica IQR (Interquartile Range).
- **Stima 1RM:** Calcolo del massimale teorico al raggiungimento della Minimal Velocity Threshold (MVT = 0.30 m/s per panca/squat, configurabile per esercizio) con intervallo di confidenza al 95% (IC 95%).
- **Curva Forza-Velocita e Potenza:** Calcolo di $F_0$ (Forza massima teorica a velocita zero in N), $v_0$ (Velocita massima teorica a carico zero in m/s) e $P_{\max} = \frac{F_0 \cdot v_0}{4}$ in Watt.
- **Zone di Bryan Mann:** Classificazione automatica delle zone di allenamento VBT:
  - Absolute Strength (< 0.50 m/s)
  - Accelerative Strength (0.50 - 0.75 m/s)
  - Strength-Speed (0.75 - 1.00 m/s)
  - Speed-Strength (1.00 - 1.30 m/s)
  - Starting Strength (> 1.30 m/s)

### 3.2 PAP Stats Engine (`src/physics/pap-stats-engine.ts`)
- **Statistica Inferenziale:** Test t di Student per campioni appaiati e indipendenti.
- **Effect Size:** Calcolo della d di Cohen e correzione di Hedges (Hedges' g) per campioni ridotti ($N < 20$).
- **Metrologia Clinico-Sportiva:** Calcolo del Minimal Detectable Change (MDC 95%) per discriminare il reale miglioramento pre-post condizionamento rispetto all'errore di misura strumentale.
- **Scomposizione RSI:** Reactive Strength Index calcolato come rapporto tra altezza di volo e tempo di contatto al suolo.

### 3.3 Risk Analyzer & Triage Patologico (`src/logic/risk-analyzer.ts`)
- Analisi incrociata tra le patologie selezionate per l'atleta e gli esercizi pianificati.
- Calcolo dello score cumulativo di rischio articolare e assiale.

### 3.4 Periodization Wizard (`src/logic/periodization.ts`)
- Modelli di programmazione: Daily Undulating Periodization (DUP), Block Periodization, Linear, Conjugate.
- Generazione della sessione e calcolo del volume/intensita settimanale.

### 3.5 RAG & Evidence Synthesis (`src/features/rag/`)
- Vector store in-memory con cosine similarity search.
- Chunking semantico di documenti caricati dal coach.
- Sintesi evidence-based con citazioni PMID dirette.

---

## 4. AUDIT DELLO STORICO GIT (LOGICHE PRE-MIGRAZIONE DA RECUPERARE)

Dall'ispezione del commit pre-migrazione `25928fd~1` (legacy JavaScript puro), emergono tre logiche algoritmiche fondamentali da reincorporare nei microservizi backend:

1. **`js/impact-calculator.js` (Cutoff Binario ed Esponenziale):**
   - Nel codice legacy, l'impatto patologico non era solo un punteggio cumulativo, ma applicava una matrice di cutoff a 3 livelli:
     - `EXCLUDED` (rosso): esercizio categoricamente bloccato se il vettore di carico comprime il segmento lesionato (es. Squat su discopatia attiva).
     - `ADAPTED` (giallo): esercizio consentito con riduzione del ROM (es. Leg Extension tra 45 e 90 gradi per ricostruzione LCA).
     - `AVAILABLE` (verde): esercizio privo di controindicazioni.
   - Questa logica va pienamente ripristinata nel microservizio `Engine 2 (Periodization & Impact Service)`.

2. **`js/parser/*` (Heuristic Header Detection):**
   - Il parser legacy gestiva file CSV ed Excel disomogenei provenienti dai principali encoder sul mercato (Vitruve, Beast, GymAware, Speed4Lifts), normalizzando automaticamente le colonne di mean velocity, peak velocity, rom e duration anche in presenza di intestazioni non standard o localizzate in lingue diverse.

3. **`js/rag-engine.js` (Gerarchia delle Fonti con Moltiplicatori di Peso):**
   - Le fonti scientifiche venivano moltiplicate in base al livello di evidenza:
     - Revisioni sistematiche e Meta-analisi (Cochrane, PRISMA): Peso x1.3
     - Trial clinici controllati randomizzati (RCT): Peso x1.1
     - Studi osservazionali o opinioni di esperti: Peso x1.0

---

## 5. DIAGNOSI CRITICA DEL CLIENT ATTUALE E LIMITI DA SUPERARE

1. **Assenza di Isolamento IP:** Tutti i calcoli (OLS, $1\text{RM}$, DUP, RAG) sono eseguiti nel client React via browser. Qualsiasi utente puo ispezionare il bundle JavaScript e copiare le formule proprietarie. E obbligatorio migrare tutti i motori nel Server Scatola Nera (ADR-01).
2. **Architettura Database Inesistente a Livello Centrale:** I dati sono salvati in LocalStorage/IndexedDB locale dell'utente. Manca la separazione nei 3 Silos (Social, Bunker Club, Research Warehouse) (ADR-02).
3. **Mancanza del Selettore Globale di Contesto:** La navigazione attuale richiede frequenti selezioni ridondanti. Serve una shell con Selettore Globale Atleta/Squadra fisso in alto a persistenza garantita.
4. **Mancanza di Gestione Fallback e Casi Limite:** Nuovi acquisti senza 6 mesi di storico non hanno baseline per lo Z-Score; atleti con doppio ruolo tattico necessitano di pesatura frazionaria dei minuti di gioco.
