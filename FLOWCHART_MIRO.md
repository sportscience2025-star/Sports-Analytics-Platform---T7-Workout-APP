# Flowchart Ufficiale dell'Architettura T7 Workout (Miro)

Questo documento traccia e collega il diagramma visuale completo dell'applicazione **T7 Workout** realizzato sulla piattaforma Miro.

## Link Diretto alla Board Miro
- **Board URL**: [FITNESS APP FLOWCHART](https://miro.com/app/board/uXjVEbo6L2o=)
- **ID Board**: `uXjVEbo6L2o=`
- **Stile Visivo**: Design ad alto contrasto (sfondi chiari categorizzati, testo scuro `#0f172a`, bordi colorati netti).

---

## Mappa delle 4 Macro-Sezioni nel Flowchart

### 1. Flusso di Accesso, Onboarding & Anamnesi Utente (Architettura Progressiva Just-in-Time)
- **Welcome / Splash Screen**: Accesso all'applicazione T7 Workout PWA.
- **Bivio Decisionale**: Selezione tra utente già registrato o nuova utenza.
- **Percorso Login**:
  - Inserimento credenziali multi-canale: Passkey Biometrica (Face ID / Touch ID / FIDO2), 1-Tap Google/Apple Sign-In o classica Email/Password.
  - Validazione crittografica (Argon2id / WebAuthn challenge), emissione token JWT con claims (Ruolo R1..R8 e Tier) e gestione Silent Refresh Token in cookie sicuro `HttpOnly; SameSite=Strict`.
  - Caricamento profilo atleta esistente e reindirizzamento immediato al Cockpit.
- **Percorso Registrazione Progressiva (Zero-Friction)**:
  - **Bivio Persona (Step 0)**: Scelta tra *"Sono un Atleta / Sportivo"* (percorso B2C rapido) vs *"Sono un Professionista / Staff Tecnico"* (P.IVA, albo, ruoli R2..R7).
  - **Registrazione Rapida (Step 1)**: Nome, Email, Password o registrazione Passkey in 30 secondi. Consenso Termini di Servizio base (GDPR Art. 6). Codice Fiscale opzionale (richiesto solo in fatturazione Tier 2/3 o cartella clinica formale, garantendo fruibilità internazionale).
  - **Canale Riservato Club Elite (Tier 3)**: Onboarding via Invito protetto (Magic Link / QR Code generato dal Medico Sociale nel Bunker KMS Silo 2); l'atleta attiva l'account in 1 tocco biometrico con cartella clinica già predisposta.
  - **Anamnesi Clinico-Sportiva Differita (Just-in-Time)**: Lo screening sulle 119 patologie (rachide, spalla, ginocchio, sistemiche), i gradi di mobilità (ROM) e i 32 protocolli clinici non bloccano il primo accesso all'app. Vengono richiesti *Just-in-Time* solo quando l'atleta richiede la generazione della prima scheda di allenamento con IA o accede al modulo clinico/physio.
- **Convergenza**: Ingresso unico unificato alla Dashboard principale (Cockpit) con profilo in memoria e Auto-Login.

---

### 2. Hub Centrale (Dashboard Cockpit & Navigazione Viste)
- **Home Dashboard Cockpit**: Hub centrale post-autenticazione con status atleta, quick card prossimo allenamento, widget rapido trend VBT e ricerca globale.
- **Router di Navigazione**: Sincronizzazione con URL Hash verso le 6 viste canoniche:
  1. *Catalogo Esercizi View* (`#catalogo`): 296 esercizi, filtri muscolari, protocolli clinici ginocchio (`cli_01`..`32`).
  2. *Programmazione Wizard View* (`#programmazione`): Stepper guidato a 5 fasi, frequenza settimanale, incrocio con 119 patologie.
  3. *Data Analisi View* (`#analisi`): Dashboard Chart.js con 4 grafici interattivi (F-V Curve, Power Curve, Jump Heights PAP, RSI Trials).
  4. *Libreria Fonti View* (`#fonti`): Archivio 322 studi scientifici peer-reviewed con indicizzazione PubMed (PMID).
  5. *Knowledge RAG AI Specialist View* (`#rag`): Assistente AI specialistico basato su evidenze e citazioni.
  6. *Preferiti & Profilo View* (`#preferiti`): Gestione schede salvate e storico anamnestico.
- **Componenti Trasversali**: `ExerciseCard` con badge rischio cromatici, Glowing Canvas neon responsive, modali alert controindicazioni e notifiche Service Worker.

---

### 3. Architettura di Sistema & Data Repository
- **Runtime Client**: React 18 + Vite (TypeScript strict), Service Worker (`sw.js`) Offline-First, IndexedDB & LocalStorage.
- **Architettura Feature-Driven**: `src/features/` (catalog, programming, analysis, sources, rag, favorites).
- **Motori di Calcolo Biomeccanico**:
  - *Physics Engine*: Load-Velocity profiling, Hybrid Regression (Lineare vs Quadratica con selezione $R^2_{adj}$/AIC), outlier filter MAD/IQR, stima 1RM con IC 95%.
  - *PAP Stats Engine*: Jump CMJ/SJ, reattività RSI, $t$-test di Student, $d$ di Cohen, Minimal Detectable Change (MDC 95%).
  - *Risk Analyzer Engine*: Matrice pesata su 119 patologie, blacklist automatica esercizi vietati, limitazioni articolari (ROM).
  - *Periodization & Session Builder*: Modelli DUP, a blocchi, lineare, coniugata, progressione carichi, warmup dinamico e cooldown.
- **Data Repository**: 296 Esercizi codificati, 119 Patologie cliniche e 322 Fonti PubMed (PMID).

---

### 4. Workflow Funzionali Algoritmici (I 3 Flussi Chiave)
- **Workflow 1: Generatore Schede & Clinica**:
  Input Atleta $\rightarrow$ Selezione Patologie $\rightarrow$ Risk Engine Audit $\rightarrow$ Scelta Periodizzazione $\rightarrow$ Session Builder $\rightarrow$ Esportazione Scheda Definitiva (Web/PDF/CSV).
- **Workflow 2: Pipeline Biomeccanica VBT**:
  Raccolta Dati VBT $\rightarrow$ MAD Outlier Filtering $\rightarrow$ Hybrid Regression Fit $\rightarrow$ Calcolo Parametri ($V_0, F_0, P_{max}$) $\rightarrow$ Stima 1RM con IC 95% $\rightarrow$ Chart.js Neon Rendering.
- **Workflow 3: Analisi PAP & Salti**:
  Baseline Jump Test $\rightarrow$ Stimolo Condizionante $\rightarrow$ Rilevazioni Post-PAP (4', 8', 12') $\rightarrow$ PAP Stats Analysis ($t$-test, Cohen's $d$) $\rightarrow$ Soglia Clinica MDC 95% $\rightarrow$ Profilo PAP Ottimale per l'Atleta.
