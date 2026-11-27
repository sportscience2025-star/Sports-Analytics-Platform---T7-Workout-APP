# T7 WORKOUT PLATFORM — MASTER IMPLEMENTATION ROADMAP
## React 18 + TypeScript Strict Core Engineering Plan

> **Documento Autoritativo di Sviluppo Software (Core T7 Workout Platform)**  
> **Repository:** `Sports-Analytics-Platform---T7-Workout-APP`  
> **Tecnologia:** React 18, TypeScript strict (`allowJs: false`, `strict: true`), Dark Cockpit Design System, Service Worker PWA  
> **Fonti Architetturali:** `architecture-blueprint/` (Capitolati 18 Flowchart ZONA 4 + Colonna 7 Nutrizione, Glossario Tecnico, Master Flowchart Registry)  
> **Esclusioni di Perimetro:** Moduli Companion Standalone Movely Workplace (Flow M1) e Together Social Standalone (Flow TS1, TS2, TS3).

---

## INDICE DELLE MACRO-SEZIONI

1. [Macro-Sezione 1: Architectural Foundation, Typing System & Storage Engine (Layer 0)](#macro-sezione-1-architectural-foundation-typing-system--storage-engine-layer-0)
2. [Macro-Sezione 2: Global Navigation Shell & Apple-Grade UI System (Layer 1)](#macro-sezione-2-global-navigation-shell--apple-grade-ui-system-layer-1)
3. [Macro-Sezione 3: Identity, Onboarding & Anamnesi (Colonna 1 / Flow 1A, 1B, 1C)](#macro-sezione-3-identity-onboarding--anamnesi-colonna-1--flow-1a-1b-1c)
4. [Macro-Sezione 4: Catalogo Esercizi & Avatar 3D Multi-Tier (Colonna 2 / Flow 2A, 2B, 2C)](#macro-sezione-4-catalogo-esercizi--avatar-3d-multi-tier-colonna-2--flow-2a-2b-2c)
5. [Macro-Sezione 5: Programmazione, Workout Player & Readiness (Colonna 3 / Flow 3A, 3B, 3C)](#macro-sezione-5-programmazione-workout-player--readiness-colonna-3--flow-3a-3b-3c)
6. [Macro-Sezione 6: Data Analisi, Wearable & VBT/PAP (Colonna 4 / Flow 4A, 4B, 4C)](#macro-sezione-6-data-analisi-wearable--vbtpap-colonna-4--flow-4a-4b-4c)
7. [Macro-Sezione 7: Libreria Fonti Scientifiche & AI Studio (Colonna 5 / Flow 5A, 5B, 5C)](#macro-sezione-7-libreria-fonti-scientifiche--ai-studio-colonna-5--flow-5a-5b-5c)
8. [Macro-Sezione 8: Preferiti Multi-Tier (Colonna 6 / Flow 6A, 6B, 6C)](#macro-sezione-8-preferiti-multi-tier-colonna-6--flow-6a-6b-6c)
9. [Macro-Sezione 9: Diario Nutrizione e Stile di Vita (Colonna 7 / Flow NUT-1A, 2B, 3C)](#macro-sezione-9-diario-nutrizione-e-stile-di-vita-colonna-7--flow-nut-1a-2b-3c)
10. [Macro-Sezione 10: Integration, Service Worker PWA & System Certification (Layer 9)](#macro-sezione-10-integration-service-worker-pwa--system-certification-layer-9)

---

## MACRO-SEZIONE 1: Architectural Foundation, Typing System & Storage Engine (Layer 0)

### [x] TASK-001: Core Domain Types & SI Units Expansion
- **Descrizione:** Definizione delle interfacce TypeScript rigorose per il sistema Multi-Tier (Tier 1 Consumer, Tier 2 Pro Coach, Tier 3 Elite Club), ruoli RBAC (Utente Consumer, Preparatore P.IVA, Fisioterapista, Medico Sociale, Head S&C, Video Analyst, Ricercatore), contesto Atleta/Squadra, stato hardware telemetrico BLE, tipi del Diario Nutrizione e domini di Readiness.
- **File Target:**
  - `src/types/tier.ts` (Nuovo: definizione `TierLevel = 'tier1' | 'tier2' | 'tier3'`, `UserRole`, `TierFeaturePermissions`)
  - `src/types/athlete.ts` (Nuovo: interfacce `Athlete`, `Team`, `TacticalRole`, `ClinicalStatus`, `BaselineHistory`)
  - `src/types/device.ts` (Nuovo: `BleDeviceType`, `BleConnectionStatus`, `TelemetryFrame`)
  - `src/types/readiness.ts` (Nuovo: `PvtBMetrics`, `DecoupledSubScores`, `RobustZScoreWindow`, `InjuryRiskEvaluation`)
  - `src/types/nutrition.ts` (Nuovo: `BodyMetricsEntry`, `MealPlan`, `BiaMetrics`, `EnergyAvailabilityRecord`, `DopingBatchCheck`)
  - `src/types/index.ts` (Estensione barrel file con export ordinato)
- **Strategia & Strumenti:**
  - Skills: `react-ts-reverse-architect`, `sports-science-biometrics-guard`, `client-server-ip-isolation`.
  - Regole: Regola 01 (zero any, strict TS), Regola 02 (un file = una responsabilità, costanti in MAIUSCOLO).
- **Criteri di Accettazione & Validazione:**
  - `npm run typecheck` passa con zero errori.
  - `py test_check.py` passa con esito 100% positivo.
  - Nessun tipo `any`, tutti i campi opzionali espliciti, union type rigorosi.

### [x] TASK-002: Metrological Validator & SI Guard
- **Descrizione:** Implementazione del modulo runtime di validazione dimensionale per grandezze fisiche del Sistema Internazionale: Forza ($F$ in $\text{N}$), Potenza ($P$ in $\text{W}$), Velocità ($v$ in $\text{m/s}$), Carico ($L$ in $\text{kg}$), Angoli ($^{\circ}$). Sanitizzazione automatica per prevenire `NaN`, `Infinity` o `undefined` sia nei calcoli che nel rendering UI.
- **File Target:**
  - `src/utils/metrology-guard.ts` (Nuovo: funzioni di validazione `validateForceN`, `validatePowerW`, `validateVelocityMps`, `validateLoadKg`, `sanitizeNumeric`)
  - `src/utils/index.ts` (Nuovo: barrel file utilities)
- **Strategia & Strumenti:**
  - Skills: `sports-science-biometrics-guard`.
  - Regole: Regola 02 (costanti `DEFAULT_MIN_LOAD_KG`, `DEFAULT_MAX_LOAD_KG`, tolleranze).
- **Criteri di Accettazione & Validazione:**
  - Unit test matematici sui casi limite (`0`, negativi, `NaN`, `Infinity`).
  - `py test_check.py` e `npm run typecheck` con 0 errori.

### [x] TASK-003: Offline Storage Engine & IndexedDB Wrapper
- **Descrizione:** Creazione dell'infrastruttura IndexedDB tipizzata per il Thin Client PWA (ADR-01) con supporto a: esecuzione offline del Workout Player, salvataggio locale appunti dell'Area Studio, cache preferiti e Transaction Queue per sincronizzazione ottimistica.
- **File Target:**
  - `src/services/storage/indexeddb.ts` (Nuovo: wrapper `IndexedDBService` con store: `workout_sessions`, `study_notes`, `favorites_cache`, `offline_queue`)
  - `src/services/storage/sync-queue.ts` (Nuovo: gestore della coda transazioni offline verso API Gateway)
  - `src/services/storage/index.ts` (Nuovo: barrel file)
- **Strategia & Strumenti:**
  - Skills: `app-navigation-integrator`.
  - Regole: Regola 02 (gestione isolata store, costanti database versionate `DB_NAME = 't7_workout_offline_db'`, `DB_VERSION = 1`).
- **Criteri di Accettazione & Validazione:**
  - Test di scrittura/lettura asincrona, gestione store upgrade, fallback in caso di IndexedDB non supportato.
  - `py test_check.py` e `npm run typecheck` verificati.

### [x] TASK-004: Tier & RBAC Context Provider
- **Descrizione:** Implementazione del React Context globale per la gestione dello stato del Tier (Tier 1 Consumer, Tier 2 Pro Coach, Tier 3 Elite Club) con matrice di permessi deterministica, simulatore di switch rapido per collaudo e verifiche runtime di feature gating.
- **File Target:**
  - `src/context/TierContext.tsx` (Nuovo: `TierProvider`, `useTierContext`, simulatore switch Tier)
  - `src/hooks/useTier.ts` (Nuovo: hook per feature gating `hasAccess(featureId)`)
  - `src/context/index.ts` (Nuovo: barrel file contesti globali)
- **Strategia & Strumenti:**
  - Skills: `client-server-ip-isolation`, `app-navigation-integrator`.
  - Regole: Regola 01, Regola 02.
- **Criteri di Accettazione & Validazione:**
  - Switch immediato tra Tier 1, 2 e 3 con verifica dei flag di accesso per ciascuna colonna funzionale.
  - `py test_check.py` e `npm run typecheck` con 0 errori.

### [x] TASK-005: Global Athlete & Squad Context Provider
- **Descrizione:** Implementazione del React Context per il Selettore Permanente Globale di Contesto Atleta/Squadra (richiesto da ZONA 3 Schema 5 e ADR-01): switch atomico tra visione "Squadra Intera" (aggregata) e "Singolo Atleta" con persistenza dell'atleta selezionato e iniezione automatica in tutte le viste dell'applicazione.
- **File Target:**
  - `src/context/AthleteContext.tsx` (Nuovo: `AthleteProvider`, stato `selectedAthleteId`, `selectedTeamId`, `contextMode: 'team' | 'athlete'`)
  - `src/hooks/useAthleteContext.ts` (Nuovo: hook consumatore per componenti e viste)
- **Strategia & Strumenti:**
  - Skills: `app-navigation-integrator`.
  - Regole: Regola 02.
- **Criteri di Accettazione & Validazione:**
  - Selezione atleta a 2 click con propagazione immediata dello stato a tutte le feature.
  - `py test_check.py` e `npm run typecheck` con 0 errori.

### [x] TASK-006: Hardware & BLE Telemetry Context Provider
- **Descrizione:** Implementazione del React Context per il monitoraggio dello stato di connessione con la sensoristica di campo (encoder lineari Vitruve, cardiofrequenzimetri Polar H10, wearable T7 proprietari) con simulatore stream di telemetria per testing locale.
- **File Target:**
  - `src/context/BleContext.tsx` (Nuovo: stato connessione `connectedDevices`, stream `liveTelemetry`, metodi `connectDevice`, `disconnectDevice`)
  - `src/hooks/useBle.ts` (Nuovo: hook per la lettura telemetria nei componenti di analisi)
- **Strategia & Strumenti:**
  - Skills: `sports-science-biometrics-guard`.
  - Regole: Regola 02.
- **Criteri di Accettazione & Validazione:**
  - Simulatore BLE che emette pacchetti coerenti con ADR-03 (Forza in N, Potenza in W, Velocità in m/s).
  - `py test_check.py` e `npm run typecheck` verificati.

---

## MACRO-SEZIONE 2: Global Navigation Shell & Apple-Grade UI System (Layer 1)

### [x] TASK-007: Apple-Inspired Global Navigation Shell
- **Descrizione:** Implementazione del layout principale Dark Cockpit ispirato al design industriale Apple (ZONA 3 Schema 5, `zona3-05-global-navigation-shell.mmd`): Fixed Top Header con Selettore Permanente Atleta/Squadra a 2 click, Tier Badge Switcher interattivo, BLE Status Pill e Menu Profilo. Superfici glassmorphism (`backdrop-filter: blur(20px)`), contrasto elevato, zero emoji spontanee.
- **File Target:**
  - `src/components/layout/GlobalHeader.tsx` (Nuovo: testata fissa superiore)
  - `src/components/layout/ContextSelectorDropdown.tsx` (Nuovo: selettore rapido Atleta/Squadra con ricerca istantanea e indicatore status clinico)
  - `src/components/layout/TierBadgeSwitcher.tsx` (Nuovo: badge colorato del Tier attivo con modalita simulatore)
  - `src/components/layout/BleStatusPill.tsx` (Nuovo: pillola di stato BLE con indicatore colore verde/ambra/rosso)
  - `src/components/layout/GlobalNavigationShell.tsx` (Nuovo: layout master container)
  - `src/components/layout/index.ts` (Nuovo: barrel file layout)
- **Strategia & Strumenti:**
  - Skills: `app-navigation-integrator`, `ui-ux-pattern-extractor`.
  - Regole: Regola 01 (zero emoji), Regola 02 (costanti di spaziatura e z-index).
- **Criteri di Accettazione & Validazione:**
  - Rispetto rigoroso della "Regola dei 2 click": selezione atleta/squadra in $\le 2$ tocchi.
  - `py test_check.py` e `npm run typecheck` con esito 100% positivo.

### [ ] TASK-008: Adaptive Multi-Tier Navigation Bars
- **Descrizione:** Implementazione della barra laterale Desktop (Sidebar) e della barra inferiore Mobile (Bottom Nav) con visibilità adattiva dei 7 moduli canonici in base al Tier attivo, indicatori di stato attivo, badge contatori dinamici (es. preferiti salvati, alert clinici) e blocco con CTA Upgrade per i moduli non abilitati nel Tier corrente.
- **File Target:**
  - `src/components/layout/SidebarNav.tsx` (Nuovo: sidebar desktop responsive)
  - `src/components/layout/BottomNav.tsx` (Nuovo: bottom tab bar mobile touch-friendly)
  - `src/components/layout/TierUpgradeModal.tsx` (Nuovo: modale esplicativa per sblocco feature Tier superiore)
- **Strategia & Strumenti:**
  - Skills: `app-navigation-integrator`, `client-server-ip-isolation`.
  - Regole: Regola 02.
- **Criteri di Accettazione & Validazione:**
  - In Tier 1: visibili Catalogo, Programmazione Base, Data Analisi Base, Fonti Base, Preferiti Base, Nutrizione Base.
  - In Tier 2 e 3: sblocco progressivo delle funzioni avanzate.
  - `py test_check.py` e `npm run typecheck` con zero errori.

### [ ] TASK-009: Standard 4-State UI Infrastructure
- **Descrizione:** Implementazione dei componenti riutilizzabili per i 4 stati UI obbligatori da capitolato su ogni vista (CAPITOLATO_TECNICO Sezione 4):
  1. *Empty State:* Layout guidato con checklist interattiva (zero tabelle mute o schermate bianche);
  2. *Loading State:* Skeleton screens pulsanti hardware-accelerated con barra percentuale;
  3. *Populated State:* Container reattivo standardizzato;
  4. *Error / Fallback State:* Banner con spiegazione chiara, tasto 'Riprova' ed exponential backoff.
- **File Target:**
  - `src/components/common/EmptyState.tsx` (Nuovo: empty state con icona SVG, messaggio e action button)
  - `src/components/common/LoadingSkeleton.tsx` (Nuovo: scheletro grafico pulsante)
  - `src/components/common/ErrorFallback.tsx` (Nuovo: error boundary view con retry handler)
  - `src/components/common/index.ts` (Nuovo: barrel file componenti comuni)
- **Strategia & Strumenti:**
  - Skills: `app-navigation-integrator`.
  - Regole: Regola 01, Regola 02.
- **Criteri di Accettazione & Validazione:**
  - Nessuna pagina dell'app priva di gestione esplicita per i 4 stati.
  - `py test_check.py` e `npm run typecheck` verificati.

---

## MACRO-SEZIONE 3: Identity, Onboarding & Anamnesi (Colonna 1 / Flow 1A, 1B, 1C)

### [ ] TASK-010: Consumer Onboarding & Anamnesi Base (FLOW-1A #01 - Tier 1)
- **Descrizione:** Implementazione del flusso di benvenuto per atleti amatoriali: questionario PAR-Q guidato, raccolta anamnestica di base (obiettivi, frequenza allenamento, eventuali dolori articolari), firma della manleva digitale (Clickwrap Liability Waiver) e salvataggio profilo su Silo 1.
- **File Target:**
  - `src/features/onboarding/ConsumerOnboardingModal.tsx` (Nuovo: wizard modale a step)
  - `src/features/onboarding/ParqQuestionnaireForm.tsx` (Nuovo: 7 domande standard PAR-Q con semaforo idoneità)
  - `src/features/onboarding/ClickwrapWaiverSection.tsx` (Nuovo: accordo legale con checkbox obbligatorio e timestamp)
  - `src/features/onboarding/useConsumerOnboarding.ts` (Nuovo: logica di stato e salvataggio)
  - `src/features/onboarding/index.ts` (Nuovo: barrel file)
- **Strategia & Strumenti:**
  - Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`.
  - Regole: Regola 01, Regola 02.
- **Criteri di Accettazione & Validazione:**
  - Se una risposta PAR-Q è positiva, alert prioritario di consultazione medica prima di iniziare.
  - `py test_check.py` e `npm run typecheck` verificati.

### [ ] TASK-011: Pro Coach Onboarding & Setup Fiscale Anti-Frode (FLOW-1B #07 - Tier 2)
- **Descrizione:** Implementazione del flusso onboarding per professionisti P.IVA: validatore di formato Partita IVA / VIES, selezione codice ATECO sportivo o sanitario (Legge 3/2018), contrattualistica digitale coach-atleta, configurazione limite massimo 50 atleti gestiti.
- **File Target:**
  - `src/features/onboarding/ProOnboardingModal.tsx` (Nuovo: onboarding professionale)
  - `src/features/onboarding/FiscalVerificationForm.tsx` (Nuovo: validazione P.IVA, codice ATECO e anagrafica studio)
  - `src/features/onboarding/CoachAthleteContractSetup.tsx` (Nuovo: template contrattuale per gestione assistiti)
- **Strategia & Strumenti:**
  - Skills: `client-server-ip-isolation`.
  - Regole: Regola 02 (costante `MAX_PRO_ATHLETES_LIMIT = 50`).
- **Criteri di Accettazione & Validazione:**
  - Validazione regex P.IVA italiana ed europea VIES.
  - `py test_check.py` e `npm run typecheck` con zero errori.

### [ ] TASK-012: Enterprise Bunker Onboarding & Multi-Staff RBAC (FLOW-1C #13 - Tier 3)
- **Descrizione:** Implementazione dell'onboarding Enterprise per club e federazioni: configurazione bunker isolato su Silo 2, simulatore mTLS / SAML 2.0 per Single Sign-On aziendale, setup della gerarchia ruoli multi-staff (Staff Medico con segreto professionale, Head S&C, Preparatore, Fisioterapista, Video Analyst) con matrice di permessi differenziati.
- **File Target:**
  - `src/features/onboarding/EnterpriseOnboardingModal.tsx` (Nuovo: onboarding club d'élite)
  - `src/features/onboarding/MultiStaffRbacMatrix.tsx` (Nuovo: tabella gestione ruoli e permessi staff)
  - `src/features/onboarding/BunkerSecurityAuditView.tsx` (Nuovo: pannello audit sicurezza, KMS e access log)
- **Strategia & Strumenti:**
  - Skills: `client-server-ip-isolation`.
  - Regole: Regola 02.
- **Criteri di Accettazione & Validazione:**
  - Segregazione rigorosa dei permessi: Staff Medico abilitato ad accedere a referti EMR, staff tecnico escluso.
  - `py test_check.py` e `npm run typecheck` verificati.

---

## MACRO-SEZIONE 4: Catalogo Esercizi & Avatar 3D Multi-Tier (Colonna 2 / Flow 2A, 2B, 2C)

### [ ] TASK-013: Certified 3D Exercise Viewer & Biomechanics HUD (FLOW-2A #02 - Tier 1)
- **Descrizione:** Estensione del catalogo certificato a 328 esercizi (296 base in `src/data/exercises/` + 32 protocolli clinici ginocchio in `src/data/exercises/clinical-knee.ts`): integrazione del visualizzatore 3D Three.js con supporto Draco GLB compresso, OrbitControls con rotazione a 360°, evidenziazione dei distretti muscolari coinvolti (Target primario vs Sinergici vs Stabilizzatori), sezione schede tecniche "Why & Fix" con correzione posturale deterministica, vincolo read-only e zero upload video consentito.
- **File Target:**
  - `src/features/catalog/Exercise3DViewer.tsx` (Nuovo: canvas WebGL Three.js con OrbitControls e fallback SVG/Canvas 2D per gracefully degradation)
  - `src/features/catalog/MuscularHeatmapHUD.tsx` (Nuovo: visualizzatore grafico 2D/3D fasce muscolari coinvolte)
  - `src/features/catalog/WhyAndFixSection.tsx` (Nuovo: spiegazioni razionale biomeccanica ed errori comuni)
  - `src/features/catalog/ExerciseDetailModal.tsx` (Estensione con integrazione tab 3D e Why & Fix)
  - `src/features/catalog/useCatalog.ts` (Estensione con integrazione protocolli ginocchio `cli_01`..`cli_32`)
- **Strategia & Strumenti:**
  - Skills: `sports-science-biometrics-guard`, `app-navigation-integrator`.
  - Regole: Regola 01 (zero emoji), Regola 02.
- **Criteri di Accettazione & Validazione:**
  - Tutti i 328 esercizi visualizzabili con dettagli anatomici e filtri $O(1)$.
  - Graceful degradation: se WebGL non è disponibile, rendering dell'illustrazione vettoriale SVG.
  - `py test_check.py` e `npm run typecheck` verificati.

### [ ] TASK-014: Pro Custom Video Uploader & AI Coach Biomechanics (FLOW-2B #08 - Tier 2)
- **Descrizione:** Implementazione del caricamento di video personalizzati per il professionista: risoluzione massima 1080p a 60fps, editor video in-app con trimming inizio/fine, speed control (slow-motion 0.25x-0.75x, velocizzazione 1.25x-2.0x), inserimento punti di forza e debolezza con generazione assistita AI Rationale 70% ancorata ai 322 paper PubMed, vincolo di condivisione strettamente 1:1 con il singolo atleta assistito.
- **File Target:**
  - `src/features/catalog/ProVideoUploader.tsx` (Nuovo: upload form con validatore codec MP4/MOV e risoluzione $\le 1080p$)
  - `src/features/catalog/VideoEditorTrimmer.tsx` (Nuovo: component player HTML5 con scrubber di taglio e controllo velocità)
  - `src/features/catalog/AiCoachRationaleCard.tsx` (Nuovo: generatore note AI 70% ancorate alle evidenze scientifiche)
  - `src/features/catalog/OneToOneShareModal.tsx` (Nuovo: selettore vincolato per assegnazione a singolo atleta)
- **Strategia & Strumenti:**
  - Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`.
  - Regole: Regola 02 (costanti `MAX_PRO_VIDEO_RES = '1080p'`, `MAX_PRO_FPS = 60`).
- **Criteri di Accettazione & Validazione:**
  - Blocco upload video oltre 1080p e divieto di condivisione di massa a più atleti simultanei.
  - `py test_check.py` e `npm run typecheck` con zero errori.

### [ ] TASK-015: Elite Multi-Camera 4K & FEA Muscle Stress Suite (FLOW-2C #14 - Tier 3)
- **Descrizione:** Implementazione della suite video per club d'élite: sincronizzazione multi-camera fino a 4K Ultra HD (60/120fps), Dynamic Forensic Watermarking per tracciamento anti-leak, analisi FEA 3D (Finite Element Analysis) per la visualizzazione dello stress e della tensione delle fibre muscolari, workflow di approvazione e convalida a doppia firma congiunta Medico Sociale + Head S&C prima della pubblicazione nella vault ufficiale del club.
- **File Target:**
  - `src/features/catalog/MultiCamera4KPlayer.tsx` (Nuovo: griglia multi-angolare sincronizzata per telecamere da campo)
  - `src/features/catalog/DynamicWatermarkOverlay.tsx` (Nuovo: sovrimpressione forense dinamica con ID utente, club e timestamp)
  - `src/features/catalog/FeaStressVisualizer3D.tsx` (Nuovo: simulazione colorimetrica del carico sulle fibre muscolari)
  - `src/features/catalog/DualSignApprovalWorkflow.tsx` (Nuovo: interfaccia doppia firma digitale Medico + Coach)
- **Strategia & Strumenti:**
  - Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`.
  - Regole: Regola 02.
- **Criteri di Accettazione & Validazione:**
  - L'esercizio non diventa "Ufficiale di Club" finché entrambe le firme non sono apposte.
  - `py test_check.py` e `npm run typecheck` verificati.

---

## MACRO-SEZIONE 5: Programmazione, Workout Player & Readiness (Colonna 3 / Flow 3A, 3B, 3C)

### [ ] TASK-016: Base Workout Player & Pre-Built Library (FLOW-3A #03 - Tier 1)
- **Descrizione:** Implementazione della programmazione base per atleti amatoriali: archivio schede pre-confezionate per obiettivo (forza, ipertrofia, mobilità, prevenzione generica), Workout Player offline thin client su IndexedDB con timer recupero, audio feedback sintetizzato, checklist di avanzamento serie/ripetizioni ed esportazione in formato PDF Read-Only (nessuna modifica parametri consentita).
- **File Target:**
  - `src/features/programming/PrebuiltProgramsCatalog.tsx` (Nuovo: lista schede standardizzate con filtri tipologia)
  - `src/features/programming/WorkoutPlayerView.tsx` (Nuovo: interfaccia player di allenamento a schermo intero)
  - `src/features/programming/WorkoutRestTimer.tsx` (Nuovo: cronometro intervallato per recuperi)
  - `src/features/programming/useWorkoutExecution.ts` (Nuovo: hook per persistenza esecuzione su IndexedDB)
  - `src/features/programming/ReadOnlyPdfExport.ts` (Nuovo: esportazione PDF statica non editabile)
- **Strategia & Strumenti:**
  - Skills: `sports-science-biometrics-guard`, `app-navigation-integrator`.
  - Regole: Regola 01, Regola 02.
- **Criteri di Accettazione & Validazione:**
  - Player funzionante al 100% in modalità aereo/offline con persistenza su IndexedDB.
  - `py test_check.py` e `npm run typecheck` con 0 errori.

### [ ] TASK-017: Anamnestic 6-Month Periodization & Triage 119 (FLOW-3B #09 - Tier 2)
- **Descrizione:** Implementazione del generatore anamnestico di macrocicli per professionisti: acquisizione questionario anamnestico completo, motore `ImpactCalculator` per screening su 119 patologie categorizzate con cutoff binario (EXCLUDED, ADAPTED con vincoli di ROM, AVAILABLE), pianificazione fino a 6 mesi con modelli DUP o blocchi 12-16 settimane, scarico automatico del carico (-40%) ed esportazione multi-formato in 4 estensioni: PDF, Excel (.xlsx sbloccato `protected: false`), Word (.docx) e Notes.
- **File Target:**
  - `src/features/programming/AnamnesticTriageWizard.tsx` (Nuovo: wizard questionario clinico/atletico a step)
  - `src/features/programming/MacrocylePeriodizationView.tsx` (Nuovo: timeline interattiva 12-16 settimane con calcolo DUP e settimane di scarico)
  - `src/logic/anamnestic-triage-engine.ts` (Nuovo: motore di valutazione impatto clinico e filtri esercizi)
  - `src/features/programming/MultiFormatExporter.ts` (Nuovo: generatore export sbloccato in 4 formati)
- **Strategia & Strumenti:**
  - Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`.
  - Regole: Regola 02 (costanti `DELOAD_LOAD_REDUCTION = 0.40;`, `MAX_MESOCYCLE_WEEKS = 16;`).
- **Criteri di Accettazione & Validazione:**
  - Gli esercizi esclusi dalle 119 patologie vengono banditi dal generatore con indicazione della motivazione clinica.
  - File Excel generato con `protected: false` e colonna note sbloccata per il preparatore.
  - `py test_check.py` e `npm run typecheck` verificati.

### [ ] TASK-018: Team Microcycle MD-X & Coach Style Cloning (FLOW-3C #15 - Tier 3)
- **Descrizione:** Implementazione della programmazione microciclica di squadra basata sul modello MD-X (Match Day minus/plus: MD-4, MD-3, MD-2, MD-1, MD, MD+1, MD+2) con split automatico del carico tra Titolari (recupero attivo e monitoraggio affaticamento) e Panchinari/Riserve (stimolo compensativo ad alta intensità), estensione stagionale fino a 52 settimane e Chatbot 24/7 con clonazione del lessico e stile metodologico del coach tramite RAG.
- **File Target:**
  - `src/features/programming/TeamMicrocycleMDXView.tsx` (Nuovo: dashboard microciclo MD-X con switch Titolari/Panchinari)
  - `src/features/programming/AnnualSeasonPlanner.tsx` (Nuovo: pianificatore annuale 52 settimane per club)
  - `src/features/programming/CoachStyleChatbot.tsx` (Nuovo: interfaccia chat RAG addestrata su dispense e stile coach)
- **Strategia & Strumenti:**
  - Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`.
  - Regole: Regola 02.
- **Criteri di Accettazione & Validazione:**
  - Corretta associazione dei target di volume/intensità in funzione della vicinanza alla partita.
  - `py test_check.py` e `npm run typecheck` verificati.

### [ ] TASK-019: Readiness Section — The 6 Methodological Pillars (FLOW-3C #15 - Tier 3 ONLY)
- **Descrizione:** Implementazione della sezione Readiness d'élite basata sui 6 pilastri metodologici rigorosi:
  1. *Protocollo PVT-B (3 minuti):* Misurazione dell'attenzione sostenuta del SNC con stimolo visivo randomizzato (intervallo 2000-10000ms), calcolo del Median RT, velocità reciproca $1/\text{RT}$, variabilità intra-individuale, lapsus calibrati su baseline ($\text{RT} > 500\text{ms}$ o $2\times \text{baseline}$) e false starts;
  2. *Segregazione contestuale (Dual Testing Protocol):* Test Mattutino a Digiuno (recupero sistemico, sonno e tono vagale HRV) vs Pre-Sessione Acuta (arousal neuromuscolare immediato e prontezza pre-gara);
  3. *Decoupled Readiness Sub-Scores:* Esposizione disaccoppiata di 4 sotto-punteggi autonomi (Fisiologico, Neurocognitivo, Neuromuscolare, Tolleranza Carico) per prevenire il mascheramento di deficit acuti critici dietro un singolo punteggio medio composito;
  4. *Standardizzazione Robust Z-Score (MAD):* Normalizzazione non parametrica $Z = \frac{x - \text{mediana}}{1.4826 \times \text{MAD}}$ calcolata su rolling window a 28 giorni, totalmente immune da asimmetrie ed outlier;
  5. *Architettura Rischio Infortuni a Due Fasi:* Fase 1 Matrice Deterministica Red Flag (hard stop su asimmetria bilaterale $>15\%$, spike ACWR $>1.50$, deficit neurale PVT) -> Fase 2 Modello multivariato su serie storiche di squadra;
  6. *Supporto preventivo con modulazione mirata del carico:* Prescrizione selettiva degli stimoli (calo PVT $\rightarrow$ taglio sprint e carico cognitivo; calo HRV $\rightarrow$ taglio volume/densità; calo CMJ $\rightarrow$ stop pliometria ed eccentrici pesanti).
- **File Target:**
  - `src/features/readiness/PvtBTestModal.tsx` (Nuovo: test reattivo PVT-B da 3 minuti con tocco touch/tastiera ad alta precisione)
  - `src/features/readiness/DualTestingProtocolCard.tsx` (Nuovo: comparazione contestuale Mattutino vs Pre-Sessione)
  - `src/features/readiness/DecoupledSubScoresChart.tsx` (Nuovo: radar/bar chart neon per i 4 domini disaccoppiati)
  - `src/features/readiness/RobustZScoreEngine.ts` (Nuovo: calcolo non parametrico Z-Score con mediana e MAD su 28 giorni)
  - `src/features/readiness/TwoPhaseInjuryRiskModel.ts` (Nuovo: logica di valutazione rischio infortuni a due fasi)
  - `src/features/readiness/LoadModulationAdvisory.tsx` (Nuovo: prescrizione selettiva carichi con alert prioritari)
  - `src/features/readiness/ReadinessDashboardView.tsx` (Nuovo: vista completa Readiness per Atleta e Squadra)
  - `src/features/readiness/index.ts` (Nuovo: barrel file)
- **Strategia & Strumenti:**
  - Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`, `react-ts-reverse-architect`.
  - Regole: Regola 01, Regola 02 (costanti `PVT_DURATION_MS = 180000;`, `PVT_LAPSES_THRESHOLD_MS = 500;`, `MAD_FACTOR = 1.4826;`, `ROLLING_WINDOW_DAYS = 28;`).
- **Criteri di Accettazione & Validazione:**
  - Precisione temporale del test PVT con `performance.now()`.
  - Verifica matematica del calcolo MAD su dataset di test con outlier estremi.
  - `py test_check.py` e `npm run typecheck` verificati con 0 errori.

---

## MACRO-SEZIONE 6: Data Analisi, Wearable & VBT/PAP (Colonna 4 / Flow 4A, 4B, 4C)

### [ ] TASK-020: Determinist Goniometer & Angle Extraction (FLOW-4A #04 - Tier 1)
- **Descrizione:** Implementazione della revisione biomeccanica deterministica per atleti amatoriali: goniometro digitale manuale con posizionamento marker touch/mouse sui frame video per il calcolo trigonometrico puro degli angoli articolari principali (anca, ginocchio, caviglia), NO intelligenza artificiale, NO RAG, zero integrazione wearable, salvataggio opzionale nello storico personale su Silo 1.
- **File Target:**
  - `src/features/analysis/DeterministGoniometerView.tsx` (Nuovo: overlay interattivo su video/foto con marker trascinabili)
  - `src/features/analysis/TrigonometricAngleEngine.ts` (Nuovo: calcolo geometrico angoli tra tre vertici con arcotangente)
- **Strategia & Strumenti:**
  - Skills: `sports-science-biometrics-guard`.
  - Regole: Regola 02.
- **Criteri di Accettazione & Validazione:**
  - Calcolo accurato degli angoli in gradi sessagesimali ($0^{\circ} \dots 180^{\circ}$).
  - Nessuna chiamata o dipendenza da modelli AI o reti neurali.
  - `py test_check.py` e `npm run typecheck` con zero errori.

### [ ] TASK-021: AI 70% Real-Time Camera & T7 Wearable BLE (FLOW-4B #10 - Tier 2)
- **Descrizione:** Implementazione dell'analisi biomeccanica avanzata per professionisti: acquisizione live camera con feedback e correzioni sul momento (suggerimenti tecnici in tempo reale a schermo), limitazione della potenza computazionale al 70% (modelli interni T7), salvataggio video con correzioni trascritte nella sezione Data Analisi (NON nel catalogo), vincolo di condivisione 1:1, connessione Bluetooth BLE vincolata esclusivamente ai dispositivi wearable a marchio T7, analisi sommaria delle metriche di soglia del lattato.
- **File Target:**
  - `src/features/analysis/LiveCameraCorrectionView.tsx` (Nuovo: interfaccia camera con HUD di correzione esecutiva live)
  - `src/features/analysis/T7WearableSyncPanel.tsx` (Nuovo: pannello di scansione e accoppiamento BLE per sensori T7 proprietari)
  - `src/features/analysis/LactateThresholdEstimator.ts` (Nuovo: stima sommaria soglie aerobica e anaerobica)
  - `src/features/analysis/OneToOneAnalysisShareModal.tsx` (Nuovo: condivisione referto e video vincolata 1:1)
- **Strategia & Strumenti:**
  - Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`.
  - Regole: Regola 02.
- **Criteri di Accettazione & Validazione:**
  - Rifiuto dell'accoppiamento con wearable di terze parti (blocco vendor ID non T7 in Tier 2).
  - `py test_check.py` e `npm run typecheck` verificati.

### [ ] TASK-022: Universal VBT & Telemetry Market Hub (FLOW-4C #16 - Tier 3)
- **Descrizione:** Implementazione del modulo VBT universale per club d'élite: parser disomogeneo per encoder e sensori di mercato (Vitruve, GymAware, Beast, pedane di salto/forza Kistler/Hawkin), regressione lineare OLS e quadratica polinomiale con filtro residui IQR, calcolo $F_0, v_0, P_{\max}$ e stima $1\text{RM}$ al punto MVT ($0.30\text{ m/s}$) con intervallo di confidenza al 95%, test PAP con t-Student e soglia Minimal Detectable Change (MDC 95%).
- **File Target:**
  - `src/features/analysis/UniversalEncoderParser.ts` (Nuovo: normalizzazione tracciati CSV/Excel da qualsiasi strumento di mercato)
  - `src/features/analysis/ForceVelocityProfiler.tsx` (Nuovo: grafici neon per curva F-v, potenza e stima 1RM con CI 95%)
  - `src/features/analysis/PapMdcAnalysisView.tsx` (Nuovo: test Potentiation PAP con t-Student, Cohen d e MDC 95%)
- **Strategia & Strumenti:**
  - Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`.
  - Regole: Regola 02 (costanti `DEFAULT_MVT_VELOCITY_MPS = 0.30;`, `IQR_MULTIPLIER = 1.5;`).
- **Criteri di Accettazione & Validazione:**
  - Rispetto rigoroso dei contratti metrologici in `api-contracts-spec.json`.
  - `py test_check.py` e `npm run typecheck` con 0 errori.

### [ ] TASK-023: Team GPS/HRV Fusion, Dual-Role Weighting & Fallback Cold Start (FLOW-4C #16 - Tier 3)
- **Descrizione:** Implementazione degli algoritmi avanzati per il monitoraggio della rosa: fusione tra carico esterno GPS (metri totali, sprint ad alta intensità HSR, accelerazioni/decelerazioni) e carico interno (HRV rMSSD, frequenza cardiaca), ponderazione frazionaria del carico per atleti con doppio ruolo tattico (peso minuti giocati per posizione), algoritmo di fallback su mediana ponderata di ruolo per nuovi acquisti privi di baseline storica (<6 mesi), esportazione universale di report e presentazioni multi-formato (.xlsx sbloccato, .pdf, .docx, .pptx, .csv).
- **File Target:**
  - `src/features/analysis/GpsHrvFusionEngine.ts` (Nuovo: correlazione bivariata carico esterno/interno)
  - `src/features/analysis/DualRoleWeightingCalculator.ts` (Nuovo: normalizzazione carico su ruoli tattici multipli)
  - `src/features/analysis/ColdStartBaselineFallback.ts` (Nuovo: calcolo baseline sintetica per nuovi acquisti)
  - `src/features/analysis/FullExportEngine.ts` (Nuovo: esportatore universale multi-formato per staff tecnico)
- **Strategia & Strumenti:**
  - Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`.
  - Regole: Regola 02.
- **Criteri di Accettazione & Validazione:**
  - Validazione matematica dei pesi di frazionamento ruolo (somma pesi $= 1.0$).
  - `py test_check.py` e `npm run typecheck` verificati.

### [ ] TASK-024: Cross-Module Baseline Bridge & Private Role-Based RAG (FLOW-4C #16 - Tier 3)
- **Descrizione:** Implementazione del ponte bidirezionale che collega la Data Analisi alla Programmazione (#15) e al Catalogo Esercizi (#14): alimentazione della baseline dell'atleta nel RAG privato su Silo 2 Bunker KMS, gestione gerarchica Role-Based RAG dei permessi (Staff Medico vs Coach vs Atleta), Conflict Alert automatico per rilevare incongruenze tra schede di allenamento e referti sanitari/limiti articolari.
- **File Target:**
  - `src/features/analysis/CrossModuleBaselineBridge.ts` (Nuovo: sincronizzazione telemetria verso il motore di programmazione)
  - `src/features/analysis/RoleBasedRagGatekeeper.ts` (Nuovo: controllo accessi ai documenti RAG in base al ruolo)
  - `src/features/analysis/ConflictAlertBanner.tsx` (Nuovo: notifica visiva immediata di conflitto clinico/biomeccanico)
- **Strategia & Strumenti:**
  - Skills: `client-server-ip-isolation`, `sports-science-biometrics-guard`.
  - Regole: Regola 02.
- **Criteri di Accettazione & Validazione:**
  - Se un referto medico indica divieto di squat profondo, il sistema solleva Conflict Alert immediato se la scheda contiene squat con ROM intero.
  - `py test_check.py` e `npm run typecheck` verificati.

---

## MACRO-SEZIONE 7: Libreria Fonti Scientifiche & AI Studio (Colonna 5 / Flow 5A, 5B, 5C)

### [ ] TASK-025: Open Access Scientific Archive (FLOW-5A #05 - Tier 1)
- **Descrizione:** Implementazione dell'archivio pubblico di letteratura scientifica per atleti amatoriali: consultazione dei 322 paper PubMed con metadati completi (PMID, DOI, autori, rivista, abstract), filtri di ricerca per patologia, distretto muscolare e disciplina sportiva, consultazione read-only, blocco download/modifiche e divieto di accesso all'Area Studio, NO AI, NO RAG.
- **File Target:**
  - `src/features/sources/OpenAccessCatalogView.tsx` (Nuovo: lista filtrabile dei 322 studi scientifici)
  - `src/features/sources/SourcesFilterBar.tsx` (Nuovo: barra filtri per categoria, distretto e anno)
  - `src/features/sources/PaperDetailModal.tsx` (Estensione con visualizzazione metadati e link ufficiale DOI)
- **Strategia & Strumenti:**
  - Skills: `app-navigation-integrator`.
  - Regole: Regola 01, Regola 02.
- **Criteri di Accettazione & Validazione:**
  - Tutti i 322 paper ricercabili con query istantanea e visualizzazione abstract ufficiale.
  - `py test_check.py` e `npm run typecheck` con zero errori.

### [ ] TASK-026: Premium Synthesis & In-App Offline Study Area (FLOW-5B #11 - Tier 2)
- **Descrizione:** Implementazione della libreria scientifica professionale: accesso gratuito alle Schede Tecniche di Sintesi per studi internazionali a pagamento (metodologia, risultati chiave, applicazioni pratiche e link DOI nel pieno rispetto del copyright), form di segnalazione studi mancanti tramite DOI/PMID e invio di ricerche proprie alla Commissione Scientifica T7, Area Studio digitale in-app offline su IndexedDB con strumenti di annotazione (evidenziatore, penna, gomma, note) e creazione manuale di mappe concettuali a costo cloud zero.
- **File Target:**
  - `src/features/sources/PremiumSynthesisCard.tsx` (Nuovo: visualizzatore schede di sintesi strutturate)
  - `src/features/sources/StudyAreaDigitalDesk.tsx` (Nuovo: banco di lavoro digitale offline con canvas note e strumenti di evidenziazione)
  - `src/features/sources/ScientificCommissionSubmissionModal.tsx` (Nuovo: modulo invio proposte e studi inediti alla commissione)
- **Strategia & Strumenti:**
  - Skills: `app-navigation-integrator`.
  - Regole: Regola 02.
- **Criteri di Accettazione & Validazione:**
  - Appunti e mappe concettuali persistiti con successo su IndexedDB e accessibili offline.
  - `py test_check.py` e `npm run typecheck` verificati.

### [ ] TASK-027: Academic Quality Indicators & 1-Click RAG Sync (FLOW-5C #17 - Tier 3)
- **Descrizione:** Implementazione dell'AI Studio scientifico per club d'élite: visualizzazione badge di livello di evidenza scientifica CEBM Oxford (Livelli da I a V) e Quartili ISI JCR (Q1-Q4), bollettino settimanale delle novità accademiche filtrato per sport di interesse, sintesi, spiegazione e traduzione automatica AI al 100%, Chatbot scientifico contestuale per singolo studio e pulsante "1-Click Sync" per trasferire qualsiasi articolo o appunto direttamente al RAG privato su Silo 2 Bunker KMS.
- **File Target:**
  - `src/features/sources/CebmQualityBadges.tsx` (Nuovo: badge visivi CEBM Oxford I-V e JCR Q1-Q4)
  - `src/features/sources/WeeklyScientificBulletin.tsx` (Nuovo: feed rassegna stampa accademica settimanale)
  - `src/features/sources/StudyChatbotPanel.tsx` (Nuovo: chatbot documentale ancorato al singolo studio)
  - `src/features/sources/OneClickRagSyncButton.tsx` (Nuovo: pulsante e handler di sincronizzazione verso Bunker KMS)
- **Strategia & Strumenti:**
  - Skills: `client-server-ip-isolation`, `sports-science-biometrics-guard`.
  - Regole: Regola 02.
- **Criteri di Accettazione & Validazione:**
  - Classificazione corretta della gerarchia delle evidenze: Meta-analisi Livello 1 / Q1 in evidenza massima.
  - `py test_check.py` e `npm run typecheck` verificati.

---

## MACRO-SEZIONE 8: Preferiti Multi-Tier (Colonna 6 / Flow 6A, 6B, 6C)

### [ ] TASK-028: Linear Relational Bookmarks (FLOW-6A #06 - Tier 1)
- **Descrizione:** Implementazione del modulo Preferiti per atleti amatoriali: lista lineare piatta basata su puntatori relazionali deterministici su Silo 1 (`user_favorites`), salvataggio rapido di esercizi 3D (dal Catalogo #02) e schede pre-confezionate (dalla Programmazione #03), zero duplicazione media, contatore reattivo nell'header e nella navbar, divieto rigoroso di cartelle, tag, video custom o dati analitici.
- **File Target:**
  - `src/features/favorites/LinearFavoritesList.tsx` (Nuovo: lista lineare schede ed esercizi salvati)
  - `src/features/favorites/BookmarkToggleBtn.tsx` (Nuovo: pulsante a icona con stato attivo/disattivo)
  - `src/features/favorites/useLinearFavorites.ts` (Nuovo: hook reattivo per gestione bookmark su Silo 1)
- **Strategia & Strumenti:**
  - Skills: `app-navigation-integrator`.
  - Regole: Regola 01, Regola 02.
- **Criteri di Accettazione & Validazione:**
  - Aggiunta e rimozione preferiti istantanea con aggiornamento sincronizzato del badge numerico.
  - `py test_check.py` e `npm run typecheck` verificati.

### [ ] TASK-029: Thematic Folders, Custom Tags & Template Bookmarks (FLOW-6B #12 - Tier 2)
- **Descrizione:** Implementazione dei Preferiti professionali per preparatori P.IVA: organizzazione con cartelle tematiche e tag personalizzati, salvataggio di esercizi standard, propri video personalizzati 1080p, template di programmi riutilizzabili per nuovi clienti 1:1, fonti scientifiche e appunti digitali locali IndexedDB, architettura deterministica a puntatori relazionali su Silo 1 Pro, divieto di salvataggio per la Data Analisi (#10).
- **File Target:**
  - `src/features/favorites/ThematicFolderManager.tsx` (Nuovo: visualizzatore e gestore cartelle tematiche)
  - `src/features/favorites/CustomTagFilter.tsx` (Nuovo: barra filtri per tag definiti dall'utente)
  - `src/features/favorites/ProFavoritesView.tsx` (Nuovo: vista completa preferiti organizzati per cartelle e tipologie)
- **Strategia & Strumenti:**
  - Skills: `app-navigation-integrator`, `client-server-ip-isolation`.
  - Regole: Regola 02.
- **Criteri di Accettazione & Validazione:**
  - Creazione cartelle dinamiche, associazione tag multipli e filtro istantaneo per categoria.
  - `py test_check.py` e `npm run typecheck` verificati.

### [ ] TASK-030: Enterprise All-in-One Favorites, Team Pinning & Medical Secret RLS (FLOW-6C #18 - Tier 3)
- **Descrizione:** Implementazione dell'ecosistema Preferiti Enterprise per club d'élite: doppio livello con *Preferiti Personali* vs *Preferiti di Team/Staff* con **Pinning in evidenza** per tutta la squadra, albero gerarchico delle cartelle complesse (`ltree`), ricerca ibrida intelligente (Full-Text `tsvector` + semantica vettoriale `pgvector`), filtro silenzioso RBAC e PostgreSQL RLS per la tutela del Segreto Medico (GDPR Art. 9: referti clinici visibili esclusivamente allo Staff Medico, invisibili a preparatori e atleti senza divulgazione di esistenza).
- **File Target:**
  - `src/features/favorites/TeamPinningSection.tsx` (Nuovo: bacheca documenti, routine e video fissati in alto per il team)
  - `src/features/favorites/LtreeFolderTreeView.tsx` (Nuovo: navigatore ad albero gerarchico annidato)
  - `src/features/favorites/HybridSearchBar.tsx` (Nuovo: barra di ricerca ibrida testuale e concettuale)
  - `src/features/favorites/MedicalSecretRlsFilter.ts` (Nuovo: applicatore client-side delle regole di segregazione del segreto medico)
- **Strategia & Strumenti:**
  - Skills: `client-server-ip-isolation`, `sports-science-biometrics-guard`.
  - Regole: Regola 02.
- **Criteri di Accettazione & Validazione:**
  - Simulando il ruolo "Preparatore Atletico", i referti clinici salvati nei preferiti di team scompaiono silenziosamente senza errori runtime.
  - `py test_check.py` e `npm run typecheck` verificati.

---

## MACRO-SEZIONE 9: Diario Nutrizione e Stile di Vita (Colonna 7 / Flow NUT-1A, 2B, 3C)

### [ ] TASK-031: Consumer Body Metrics & Educational Nutritional Guides (FLOW-NUT-1A #23 - Tier 1)
- **Descrizione:** Implementazione del diario nutrizionale di base per utenti amatoriali: monitoraggio cronologico di peso corporeo e circonferenze (vita, fianchi, braccia, cosce), modelli di educazione alimentare pre-confezionati suddivisi per sport e stile alimentare (onnivoro, vegetariano, vegano), calcolatori manuali del fabbisogno calorico basale BMR (formule Mifflin-St Jeor e Harris-Benedict) e test del tasso di sudorazione pre/post seduta con calcolo liquidi di reintegro, guida agli integratori classificati per evidenza scientifica ISSN / AIS (Gruppi A, B, C, D), esportazione PDF statica non editabile.
- **File Target:**
  - `src/features/nutrition/BodyMetricsTracker.tsx` (Nuovo: tabella e grafici evolutivi di peso e circonferenze)
  - `src/features/nutrition/NutritionalGuideCard.tsx` (Nuovo: schede educative alimentari per sport e pattern nutrizionale)
  - `src/features/nutrition/HydrationSweatCalculator.ts` (Nuovo: calcolatore tasso di sudorazione pre/post con reintegro ml/h)
  - `src/features/nutrition/BmrCaloricCalculator.ts` (Nuovo: calcolatore BMR e TDEE deterministico)
  - `src/features/nutrition/SupplementsEvidenceGuide.tsx` (Nuovo: prontuario integratori con classificazione AIS A-D)
  - `src/features/nutrition/useConsumerNutrition.ts` (Nuovo: hook per persistenza diario su Silo 1)
  - `src/features/nutrition/NutritionView.tsx` (Nuovo: vista master Colonna 7)
  - `src/features/nutrition/index.ts` (Nuovo: barrel file)
- **Strategia & Strumenti:**
  - Skills: `sports-science-biometrics-guard`, `app-navigation-integrator`.
  - Regole: Regola 01, Regola 02.
- **Criteri di Accettazione & Validazione:**
  - Calcolo del reintegro idrico: formula $1.5 \times \text{peso perso (kg)}$ in litri entro 2-4 ore.
  - `py test_check.py` e `npm run typecheck` verificati.

### [ ] TASK-032: Pro Clinical vs Coach Nutrition & Body Composition BIA (FLOW-NUT-2B #24 - Tier 2)
- **Descrizione:** Implementazione della nutrizione professionale con tutela legale (Art. 348 c.p. e Legge 3/2018): sblocco automatico dell'editor di diete cliniche grammate per professionisti sanitari abilitati (Biologo Nutrizionista, Dietista, Medico) oppure attivazione della modalità protetta di Educazione Alimentare e Timing per Coach/PT, questionario anamnestico nutrizionale completo, studio della composizione corporea con plicometria Jackson-Pollock a 3 e 7 pliche e bioimpedenziometria vettoriale BIVA (massa grassa FM, massa magra FFM, acqua corporea totale TBW), pianificazione FFM-based su giornate tipo (Rest, Medium, High Load), filtro sicurezza integratori con blocco orario caffeina serale ed esportazione multi-formato con Excel (.xlsx sbloccato `protected: false`).
- **File Target:**
  - `src/features/nutrition/LegalRoleGatekeeper.tsx` (Nuovo: interruttore automatico tra Dieta Clinica Grammata ed Educazione Alimentare Coach)
  - `src/features/nutrition/NutritionalAnamnesisForm.tsx` (Nuovo: anamnesi storia ponderale, allergie e intolleranze)
  - `src/features/nutrition/BodyCompositionBiaView.tsx` (Nuovo: modulo plicometria Jackson-Pollock e grafici BIVA ellissi R-Xc)
  - `src/features/nutrition/FfmMealPlanner.tsx` (Nuovo: pianificatore pasti tarato su grammi proteici per kg di massa magra)
  - `src/features/nutrition/SupplementSafetyFilter.ts` (Nuovo: validatore posologia e blocco orario caffeina post 16:00)
- **Strategia & Strumenti:**
  - Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`.
  - Regole: Regola 02 (costante `CAFFEINE_CURFEW_HOUR = 16;`).
- **Criteri di Accettazione & Validazione:**
  - Se il profilo attivo è "Preparatore Atletico", l'app blocca la prescrizione di grammature rigide obbligando alla modalità per porzioni/timing educativi.
  - `py test_check.py` e `npm run typecheck` con zero errori.

### [ ] TASK-033: Dynamic Team Periodization, EA/REDs & Doping Batch Verification (FLOW-NUT-3C #25 - Tier 3)
- **Descrizione:** Implementazione della nutrizione dinamica d'élite: interconnessione totale bidirezionale con microcicli MD-X (#15) e telemetria GPS (#16) con adattamento automatico di carboidrati e timing peri-workout in base ai km percorsi, sincronizzazione della massa magra FFM con i parametri di potenza relativa (Watt/kg) in Data Analisi, monitoraggio continuo dell'Energy Availability ($EA = \frac{EI - EEE}{FFM}$) con semaforo prevenzione sindrome REDs, Red Flags Human-in-the-Loop (blocco automatico delle modifiche su cali ponderali repentini o amenorrea con alert prioritized a Medico e Nutrizionista), verifica automatica del lotto Batch ID contro database antidoping ufficiali (Informed Sport e Cologne List) e Chatbot nutrizionale RAG 24/7 con clonazione del protocollo del nutrizionista sociale.
- **File Target:**
  - `src/features/nutrition/DynamicEnergyAvailabilityEngine.ts` (Nuovo: calcolo continuo EA in $\text{kcal/kg FFM/die}$ con soglie cliniche $<30$ REDs)
  - `src/features/nutrition/RedFlagsHumanInTheLoopModal.tsx` (Nuovo: modale di blocco clinico su allarmi ponderali/ematochimici)
  - `src/features/nutrition/DopingBatchVerifier.ts` (Nuovo: validatore conformità lotti integratori per atleti professionisti)
  - `src/features/nutrition/NutritionalRagChatbot.tsx` (Nuovo: assistente 24/7 per pasti fuori casa sincronizzato con il bunker del club)
  - `src/features/nutrition/MdxNutritionSync.ts` (Nuovo: connettore bidirezionale carichi GPS $\leftrightarrow$ apporto glucidico)
- **Strategia & Strumenti:**
  - Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`.
  - Regole: Regola 02 (costanti `EA_RED_FLAG_THRESHOLD = 30.0;`, `EA_OPTIMAL_THRESHOLD = 45.0;`).
- **Criteri di Accettazione & Validazione:**
  - EA $<30\text{ kcal/kg FFM/die}$ attiva lo stato di allerta REDs con notifica immediata allo Staff Medico.
  - `py test_check.py` e `npm run typecheck` verificati con 0 errori.

---

## MACRO-SEZIONE 10: Integration, Service Worker PWA & System Certification (Layer 9)

### [ ] TASK-034: Global App Integration & Lazy Routing
- **Descrizione:** Aggiornamento di `src/App.tsx` e `src/main.tsx` per orchestrare tutti i 7 moduli core dell'applicazione (Catalogo 3D, Programmazione & Readiness, Data Analisi VBT/PAP, Libreria Fonti, Preferiti Multi-Tier, Diario Nutrizione e Onboarding), montare i Provider globali (`TierProvider`, `AthleteProvider`, `BleProvider`) ed erogare il layout master `GlobalNavigationShell`.
- **File Target:**
  - `src/App.tsx` (Aggiornamento completo architettura root)
  - `src/main.tsx` (Iniezione provider e ErrorBoundary)
- **Strategia & Strumenti:**
  - Skills: `app-navigation-integrator`.
  - Regole: Regola 01, Regola 02.
- **Criteri di Accettazione & Validazione:**
  - Navigazione fluida tra tutti i 7 moduli con memoria dello stato e rispetto dei vincoli di Tier.
  - `py test_check.py` e `npm run typecheck` con zero errori.

### [ ] TASK-035: Service Worker Cache Lifecycle & Offline PWA Assets
- **Descrizione:** Aggiornamento di `sw.js` con incremento della versione di cache per il rilascio, indicizzazione degli asset offline per il Thin Client Workout Player e gestione del manifest per l'installabilità PWA su desktop e dispositivi mobili.
- **File Target:**
  - `sw.js` (Incremento versione cache e aggiornamento `CORE_ASSETS`)
- **Strategia & Strumenti:**
  - Skills: `project-skill-policy`.
  - Regole: Regola 01.
- **Criteri di Accettazione & Validazione:**
  - Validazione `sw.js` in `py test_check.py`.
  - Funzionamento offline verificato.

### [ ] TASK-036: End-to-End Metrological & Architectural Audit
- **Descrizione:** Esecuzione del collaudo globale finale: verifica di conformità a tutti i contratti metrologici in `api-contracts-spec.json`, verifica dell'assenza totale di valori `NaN` o `Infinity`, test di conformità ADR-01 (Thin Client con formule proprietarie isolate) e audit del passaggio test su `py test_check.py` e `npm run typecheck`.
- **File Target:**
  - Verifica complessiva dell'intero repository `src/`.
- **Strategia & Strumenti:**
  - Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`, `react-ts-reverse-architect`.
  - Regole: Regola 01, Regola 06.
- **Criteri di Accettazione & Validazione:**
  - 100% test passati, 0 errori TypeScript, 0 regressioni sul catalogo esercizi, patologie e fonti.

---

## LOG DI AVANZAMENTO & SPRINT TRACKING

| Data | Task ID | Descrizione Operativa | Esito Test | Commit Hash | Note di Rilascio |
| :---: | :---: | :--- | :---: | :---: | :--- |
| 2026-11-22 | **FASE 1** | Redazione Ufficiale Master Implementation Roadmap | Superato (100%) | `c9725f0` | Definizione sequenza atomica di 36 task architetturali |
| 2026-11-22 | **TASK-001** | Core Domain Types & SI Units Expansion | Superato (100%) | `f14924d` | Implementazione types strict: tier, physics (SI), athlete, device, readiness, nutrition, index |
| 2026-11-22 | **TASK-002** | Metrological Validator & SI Guard | Superato (100%) | `d24a468` | Validatori SI, sanitizzazione hot-path, formatter ergonomico anti-jittering e test suite |
| 2026-11-22 | **TASK-003** | Offline Storage Engine & IndexedDB Wrapper | Superato (100%) | `e0a7b8e` | Storage engine 4 store, in-memory fallback, sync queue con idempotenza, zombie recovery e test |
| 2026-11-22 | **TASK-004** | Tier & RBAC Context Provider | Superato (100%) | `5f4d969` | React Context e Hook useTier per Tier 1/2/3, RBAC, GDPR Art. 9, Art. 348 c.p., silo resolution e test suite |
| 2026-11-22 | **TASK-005** | Global Athlete & Squad Context Provider | Superato (100%) | `b5e4592` | React Context e Hook useAthleteContext per Selettore Atleta/Squadra a 2-click, Tier 1 single mode e test suite |
| 2026-11-22 | **TASK-006** | Hardware & BLE Telemetry Context Provider | Superato (100%) | `b90b6d5` | React Context e Hook useBle per sensoristica BLE, Web Bluetooth API, simulatore 10 Hz e test suite |
| 2026-11-22 | **TASK-007** | Apple-Inspired Global Navigation Shell | Superato (100%) | `715347e` | Layout master glassmorphism Apple Dark Cockpit: GlobalHeader, ContextSelectorDropdown a 2-click, TierBadgeSwitcher, BleStatusPill e test suite |
| 2026-11-28 | **CONSOLIDATION** | Consolidation & Bugfix Sprint (TASK-001..007) | Superato (100%) | `faece7b` | Audit multi-agente Wave 1-3: fix UUID GATT, metrologia SI, IndexedDB/SyncQueue, RBAC/Art. 348 c.p., AthleteContext, BleContext, Shell WAI-ARIA, root wiring in App.tsx e tsconfig.test.json |
