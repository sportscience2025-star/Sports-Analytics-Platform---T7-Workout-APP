# T7 WORKOUT PLATFORM — MASTER IMPLEMENTATION ROADMAP
## React 18 + TypeScript Strict Core Engineering Plan

> **Documento Autoritativo di Sviluppo Software (Core T7 Workout Platform)**  
> **Repository:** `Sports-Analytics-Platform---T7-Workout-APP`  
> **Tecnologia:** React 18, TypeScript strict (`allowJs: false`, `strict: true`), Dark Cockpit Design System, Service Worker PWA  
> **Fonti Architetturali:** `architecture-blueprint/` (Capitolati 25 Flowchart ZONA 4 + Colonna 7 Nutrizione, Glossario Tecnico Vivente, Master Flowchart Registry)  
> **Specifiche UI/UX & Benchmark Biomeccanico:** `ui-research/biomechanics-video-analysis-spec.md` (Kinepose-grade kinematics & HUD tokens)  
> **Perimetro Strategico di Rilascio:** Sviluppo completo e prioritario del **Core di T7 Workout PWA** (45 Task totali). Le Companion Apps *Movely Workplace* (FLOW-M1) e *Together Social* (FLOW-TS1/2/3) sono gestite esclusivamente come **ponti di connessione e interfacce di integrazione** (App Switcher 3-in-1, Codice Azienda onboarding, export Card Certificata T7 e Dossier Salute SSO). Il modulo *Match Analisi* è confermato come aggiornamento successivo (*Fase 2*).

---

## INDICE DELLE MACRO-SEZIONI

1. [Macro-Sezione 1: Architectural Foundation, Typing System & Storage Engine (Layer 0)](#macro-sezione-1-architectural-foundation-typing-system--storage-engine-layer-0) — `TASK-001`..`TASK-006` `[x]`
2. [Macro-Sezione 2: Global Navigation Shell & Apple-Grade UI System (Layer 1)](#macro-sezione-2-global-navigation-shell--apple-grade-ui-system-layer-1) — `TASK-007`..`TASK-008` `[x]`, `TASK-009` `[ ]`
3. [Macro-Sezione 3: Home Control Room, Identity & Onboarding Multi-Tier (Colonna 1 / Flow 1A, 1B, 1C + Home)](#macro-sezione-3-home-control-room-identity--onboarding-multi-tier-colonna-1--flow-1a-1b-1c--home) — `TASK-010`..`TASK-013` `[ ]`
4. [Macro-Sezione 4: Gestione Roster, Cartella Clinica & Comunicazioni Interne](#macro-sezione-4-gestione-roster-cartella-clinica--comunicazioni-interne) — `TASK-014`..`TASK-016` `[ ]`
5. [Macro-Sezione 5: Catalogo Esercizi & Avatar 3D Multi-Tier (Colonna 2 / Flow 2A, 2B, 2C)](#macro-sezione-5-catalogo-esercizi--avatar-3d-multi-tier-colonna-2--flow-2a-2b-2c) — `TASK-017`..`TASK-019` `[ ]`
6. [Macro-Sezione 6: Programmazione, Workout Player & Readiness (Colonna 3 / Flow 3A, 3B, 3C)](#macro-sezione-6-programmazione-workout-player--readiness-colonna-3--flow-3a-3b-3c) — `TASK-020`..`TASK-023` `[ ]`
7. [Macro-Sezione 7: Data Analisi, Video Biomeccanica, VBT & Telemetria (Colonna 4 / Flow 4A, 4B, 4C)](#macro-sezione-7-data-analisi-video-biomeccanica-vbt--telemetria-colonna-4--flow-4a-4b-4c) — `TASK-024`..`TASK-029` `[ ]`
8. [Macro-Sezione 8: Libreria Fonti Scientifiche & AI Studio (Colonna 5 / Flow 5A, 5B, 5C)](#macro-sezione-8-libreria-fonti-scientifiche--ai-studio-colonna-5--flow-5a-5b-5c) — `TASK-030`..`TASK-032` `[ ]`
9. [Macro-Sezione 9: Preferiti Multi-Tier (Colonna 6 / Flow 6A, 6B, 6C)](#macro-sezione-9-preferiti-multi-tier-colonna-6--flow-6a-6b-6c) — `TASK-033`..`TASK-035` `[ ]`
10. [Macro-Sezione 10: Diario Nutrizione e Stile di Vita (Colonna 7 / Flow NUT-1A, 2B, 3C)](#macro-sezione-10-diario-nutrizione-e-stile-di-vita-colonna-7--flow-nut-1a-2b-3c) — `TASK-036`..`TASK-038` `[ ]`
11. [Macro-Sezione 11: Profilo Personale, Hub Dispositivi, Monetizzazione & Bridges (Layer 8)](#macro-sezione-11-profilo-personale-hub-dispositivi-monetizzazione--bridges-layer-8) — `TASK-039`..`TASK-042` `[ ]`
12. [Macro-Sezione 12: Integration, Service Worker PWA & System Certification (Layer 9)](#macro-sezione-12-integration-service-worker-pwa--system-certification-layer-9) — `TASK-043`..`TASK-045` `[ ]`

---

## MACRO-SEZIONE 1: Architectural Foundation, Typing System & Storage Engine (Layer 0)

### [x] TASK-001: Core Domain Types & SI Units Expansion
- **Descrizione:** Definizione delle interfacce TypeScript rigorose per il sistema Multi-Tier (Tier 1 Consumer, Tier 2 Pro Coach, Tier 3 Elite Club), ruoli RBAC (Utente Consumer, Preparatore P.IVA, Fisioterapista, Medico Sociale, Head S&C, Video Analyst, Ricercatore), contesto Atleta/Squadra, stato hardware telemetrico BLE, tipi del Diario Nutrizione e domini di Readiness.
- **File Target:**
  - `src/types/tier.ts` (Definizione `TierLevel = 'tier1' | 'tier2' | 'tier3'`, `UserRole`, `TierFeaturePermissions`)
  - `src/types/athlete.ts` (Interfacce `Athlete`, `Team`, `TacticalRole`, `ClinicalStatus`, `BaselineHistory`)
  - `src/types/device.ts` (`BleDeviceType`, `BleConnectionStatus`, `TelemetryFrame`)
  - `src/types/readiness.ts` (`PvtBMetrics`, `DecoupledSubScores`, `RobustZScoreWindow`, `InjuryRiskEvaluation`)
  - `src/types/nutrition.ts` (`BodyMetricsEntry`, `MealPlan`, `BiaMetrics`, `EnergyAvailabilityRecord`, `DopingBatchCheck`)
  - `src/types/index.ts` (Barrel file con export ordinato)
- **Strategia & Strumenti:** Skills: `react-ts-reverse-architect`, `sports-science-biometrics-guard`, `client-server-ip-isolation`. Regole: 01, 02.
- **Criteri di Accettazione & Validazione:** `npm run typecheck` e `py test_check.py` 100% positivi. Zero `any`.

### [x] TASK-002: Metrological Validator & SI Guard
- **Descrizione:** Implementazione del modulo runtime di validazione dimensionale per grandezze fisiche del Sistema Internazionale: Forza ($F$ in $\text{N}$), Potenza ($P$ in $\text{W}$), Velocità ($v$ in $\text{m/s}$), Carico ($L$ in $\text{kg}$), Angoli ($^{\circ}$). Sanitizzazione automatica per prevenire `NaN`, `Infinity` o `undefined` sia nei calcoli che nel rendering UI.
- **File Target:**
  - `src/utils/metrology-guard.ts` (`validateForceN`, `validatePowerW`, `validateVelocityMps`, `validateLoadKg`, `sanitizeNumeric`)
  - `src/utils/number-format.ts` (`formatMetricWithUnit`, `formatForce`, `formatPower`, `formatVelocity`, `formatAngle`)
  - `src/utils/index.ts` (Barrel file utilities)
- **Strategia & Strumenti:** Skills: `sports-science-biometrics-guard`. Regole: 01, 02.
- **Criteri di Accettazione & Validazione:** Unit test matematici sui casi limite (`0`, negativi, `NaN`, `Infinity`). `py test_check.py` superato.

### [x] TASK-003: Offline Storage Engine & IndexedDB Wrapper
- **Descrizione:** Creazione dell'infrastruttura IndexedDB tipizzata per il Thin Client PWA (ADR-01) con supporto a: esecuzione offline del Workout Player, salvataggio locale appunti dell'Area Studio, cache preferiti e Transaction Queue per sincronizzazione ottimistica.
- **File Target:**
  - `src/services/storage/indexeddb.ts` (`IndexedDBService` con store: `workout_sessions`, `study_notes`, `favorites_cache`, `offline_queue`)
  - `src/services/storage/sync-queue.ts` (Gestore della coda transazioni offline verso API Gateway)
  - `src/services/storage/index.ts` (Barrel file storage)
- **Strategia & Strumenti:** Skills: `app-navigation-integrator`. Regole: 02.
- **Criteri di Accettazione & Validazione:** Test di lettura/scrittura asincrona, fallback in-memory, zombie recovery. `py test_check.py` superato.

### [x] TASK-004: Tier & RBAC Context Provider
- **Descrizione:** Implementazione del React Context globale per la gestione dello stato del Tier (Tier 1 Consumer, Tier 2 Pro Coach, Tier 3 Elite Club) con matrice di permessi deterministica, simulatore di switch rapido per collaudo e verifiche runtime di feature gating.
- **File Target:**
  - `src/context/TierContext.tsx` (`TierProvider`, `useTierContext`, simulatore switch Tier)
  - `src/hooks/useTier.ts` (Hook per feature gating `hasAccess(featureId)`)
  - `src/context/index.ts` (Barrel file contesti globali)
- **Strategia & Strumenti:** Skills: `client-server-ip-isolation`, `app-navigation-integrator`. Regole: 01, 02.
- **Criteri di Accettazione & Validazione:** Switch immediato tra Tier 1, 2 e 3 con verifica flag d'accesso per ciascuna colonna. `py test_check.py` superato.

### [x] TASK-005: Global Athlete & Squad Context Provider
- **Descrizione:** Implementazione del React Context per il Selettore Permanente Globale di Contesto Atleta/Squadra (richiesto da ZONA 3 Schema 5 e ADR-01): switch atomico tra visione "Squadra Intera" (aggregata) e "Singolo Atleta" con persistenza dell'atleta selezionato e iniezione automatica in tutte le viste dell'applicazione.
- **File Target:**
  - `src/context/AthleteContext.tsx` (`AthleteProvider`, stato `selectedAthleteId`, `selectedTeamId`, `contextMode: 'team' | 'athlete'`)
  - `src/hooks/useAthleteContext.ts` (Hook consumatore per componenti e viste)
- **Strategia & Strumenti:** Skills: `app-navigation-integrator`. Regole: 02.
- **Criteri di Accettazione & Validazione:** Selezione atleta a 2 click con propagazione immediata dello stato a tutte le feature. `py test_check.py` superato.

### [x] TASK-006: Hardware & BLE Telemetry Context Provider
- **Descrizione:** Implementazione del React Context per il monitoraggio dello stato di connessione con la sensoristica di campo (encoder lineari Vitruve, cardiofrequenzimetri Polar H10, wearable T7 proprietari) con simulatore stream di telemetria per testing locale.
- **File Target:**
  - `src/context/BleContext.tsx` (Stato connessione `connectedDevices`, stream `liveTelemetry`, metodi `connectDevice`, `disconnectDevice`)
  - `src/hooks/useBle.ts` (Hook per la lettura telemetria nei componenti di analisi)
- **Strategia & Strumenti:** Skills: `sports-science-biometrics-guard`. Regole: 02.
- **Criteri di Accettazione & Validazione:** Simulatore BLE che emette pacchetti coerenti con ADR-03 (Forza in N, Potenza in W, Velocità in m/s). `py test_check.py` superato.

---

## MACRO-SEZIONE 2: Global Navigation Shell & Apple-Grade UI System (Layer 1)

### [x] TASK-007: Apple-Inspired Global Navigation Shell
- **Descrizione:** Implementazione del layout principale Dark Cockpit ispirato al design industriale Apple (ZONA 3 Schema 5, `zona3-05-global-navigation-shell.mmd`): Fixed Top Header con Selettore Permanente Atleta/Squadra a 2 click, Tier Badge Switcher interattivo, BLE Status Pill e Menu Profilo. Superfici glassmorphism (`backdrop-filter: blur(20px)`), contrasto elevato, zero emoji spontanee.
- **File Target:**
  - `src/components/layout/GlobalHeader.tsx` (Testata fissa superiore)
  - `src/components/layout/ContextSelectorDropdown.tsx` (Selettore rapido Atleta/Squadra con ricerca istantanea e indicatore status clinico)
  - `src/components/layout/TierBadgeSwitcher.tsx` (Badge colorato del Tier attivo con modalità simulatore)
  - `src/components/layout/BleStatusPill.tsx` (Pillola di stato BLE con indicatore colore verde/ambra/rosso)
  - `src/components/layout/GlobalNavigationShell.tsx` (Layout master container)
  - `src/components/layout/index.ts` (Barrel file layout)
- **Strategia & Strumenti:** Skills: `app-navigation-integrator`, `ui-ux-pattern-extractor`. Regole: 01, 02.
- **Criteri di Accettazione & Validazione:** Rispetto rigoroso della "Regola dei 2 click": selezione atleta/squadra in $\le 2$ tocchi. `py test_check.py` superato.

### [x] TASK-008: Adaptive Multi-Tier Navigation Bars
- **Descrizione:** Implementazione della barra laterale Desktop (Sidebar) e della barra inferiore Mobile (Bottom Nav) con visibilità adattiva dei moduli canonici in base al Tier attivo, indicatori di stato attivo, badge contatori dinamici (es. preferiti salvati, alert clinici) e blocco con CTA Upgrade per i moduli non abilitati nel Tier corrente.
- **File Target:**
  - `src/components/layout/SidebarNav.tsx` (Sidebar desktop responsive)
  - `src/components/layout/BottomNav.tsx` (Bottom tab bar mobile touch-friendly)
  - `src/components/layout/TierUpgradeModal.tsx` (Modale esplicativa per sblocco feature Tier superiore)
- **Strategia & Strumenti:** Skills: `app-navigation-integrator`, `client-server-ip-isolation`. Regole: 02.
- **Criteri di Accettazione & Validazione:** In Tier 1 visibili i moduli base; in Tier 2 e 3 sblocco progressivo delle funzioni avanzate. `py test_check.py` superato.

### [x] TASK-009: Standard 4-State UI Infrastructure
- **Dipendenze:** Richiede: `TASK-007`, `TASK-008`.
- **Descrizione & Obiettivo Funzionale:** Implementazione dei componenti riutilizzabili per i 4 stati UI obbligatori da capitolato su ogni vista della piattaforma (CAPITOLATO_TECNICO Sezione 4):
  1. *Empty State:* Layout guidato con checklist interattiva (zero tabelle mute o schermate bianche);
  2. *Loading State:* Skeleton screens pulsanti hardware-accelerated con barra percentuale;
  3. *Populated State:* Container reattivo standardizzato ad alto contrasto Dark Cockpit;
  4. *Error / Fallback State:* Banner con spiegazione chiara, tasto 'Riprova' ed exponential backoff.
- **Riferimenti Architetturali:** `CAPITOLATO_TECNICO_SOFTWARE_HOUSE.md` (Sez. 4), `apple-navigation-design-system.md`, `00-GLOSSARIO-TERMINI-TECNICI.md`.
- **File Target in `src/`:**
  - `src/components/common/EmptyState.tsx` (Empty state con icona SVG lineare, titolo, spiegazione e pulsante di azione)
  - `src/components/common/LoadingSkeleton.tsx` (Scheletro grafico pulsante con shimmer gradient CSS)
  - `src/components/common/ErrorFallback.tsx` (Error boundary view con retry handler e log diagnostico)
  - `src/components/common/index.ts` (Barrel file componenti comuni)
- **Strategia & Strumenti:** Skills: `app-navigation-integrator`. Regole: Regola 01 (zero emoji), Regola 02 (costanti in MAIUSCOLO).
- **Vincoli di Sicurezza & Isolamento:** Prevenzione assoluta di stringhe `"undefined"` o crash non gestiti a schermo.
- **Criteri di Accettazione & Collaudo:** Nessuna pagina dell'app priva di gestione esplicita per i 4 stati. Test suite in `tests/layout-shell.test.ts`. `py test_check.py` e `npm run typecheck` verificati con 0 errori.

---

## MACRO-SEZIONE 3: Home Control Room, Identity & Onboarding Multi-Tier (Colonna 1 / Flow 1A, 1B, 1C + Home)

### [x] TASK-010: Home Dashboard & Control Room Cockpit
- **Dipendenze:** Richiede: `TASK-005`, `TASK-007`, `TASK-009`.
- **Descrizione & Obiettivo Funzionale:** Implementazione della schermata di atterraggio principale all'apertura dell'app (Home / Control Room):
  - *Riepilogo Giornata:* Sessione di allenamento pianificata del giorno con pulsante rapido "Avvia Sessione";
  - *Ultimi Allenamenti Conclusi:* Lista delle Card Certificate T7 recenti con indicatori di volume (tonnellaggio in kg), durata e PR battuti;
  - *Widget Calendario Stagionale:* Visualizzazione microciclo corrente e prossimi test atletici o gare;
  - *Alert Prioritari di Squadra (Tier 3):* Box segnalazioni urgenti su cali Readiness, spike ACWR $>1.50$ o Red Flags nutrizionali/cliniche;
  - Regola aurea dei 2 click: accesso a qualsiasi sezione operativa entro 2 tocchi dalla dashboard.
- **Riferimenti Architetturali:** Master Flowchart (Home/Control Room), `00-MASTER-EXECUTION-PLAN.md`, `00-GLOSSARIO-TERMINI-TECNICI.md#control-room-home-dashboard`.
- **File Target in `src/`:**
  - `src/features/home/ControlRoomView.tsx` (Vista principale Home/Control Room)
  - `src/features/home/DailyWorkoutCard.tsx` (Card sessione del giorno con quick action)
  - `src/features/home/CertifiedT7CardsHistory.tsx` (Carosello storico Card Certificate T7)
  - `src/features/home/TeamHealthAlertsBanner.tsx` (Banner allarmi prioritari salute rosa Tier 3)
  - `src/features/home/index.ts` (Barrel file modulo Home)
- **Strategia & Strumenti:** Skills: `app-navigation-integrator`, `sports-science-biometrics-guard`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Rispetto dei Tier: gli alert di squadra e i dati aggregati sono visibili solo a Tier 3 e ruoli staff autorizzati.
- **Criteri di Accettazione & Collaudo:** Switch istantaneo tra visualizzazione atleta singolo e squadra. `py test_check.py` e `npm run typecheck` 100% OK.

### [ ] TASK-011: Consumer Onboarding, Codice Azienda & Anamnesi Base (FLOW-1A #01 - Tier 1)
- **Dipendenze:** Richiede: `TASK-004`, `TASK-009`.
- **Descrizione & Obiettivo Funzionale:** Implementazione del flusso di benvenuto per atleti amatoriali:
  - Bivio di registrazione standard vs inserimento **Codice Azienda** (bridge verso Movely con setting atterraggio guidato in Fase 1);
  - Questionario PAR-Q+ guidato a 7 domande con semaforo di idoneità all'esercizio;
  - Raccolta anamnestica di base (obiettivi fitness, frequenza settimanale, dolori articolari pregressi);
  - Firma della manleva digitale (*Clickwrap Liability Waiver*) con timestamp e consenso GDPR Art. 9;
  - Salvataggio profilo su Silo 1 Consumer PostgreSQL.
- **Riferimenti Architetturali:** `01-software-1-flow-1a-consumer-onboarding.md`, `MASTER-FLOWCHART-REGISTRY.md` (#01), `00-GLOSSARIO-TERMINI-TECNICI.md#codice-azienda-onboarding-movely-bridge`.
- **File Target in `src/`:**
  - `src/features/onboarding/ConsumerOnboardingModal.tsx` (Wizard a step con progress bar)
  - `src/features/onboarding/CompanyCodeStep.tsx` (Validatore codice azienda per bridge welfare Movely)
  - `src/features/onboarding/ParqQuestionnaireForm.tsx` (Form PAR-Q+ con alert su risposte positive)
  - `src/features/onboarding/ClickwrapWaiverSection.tsx` (Sezione legale con checkbox obbligatorio e log)
  - `src/features/onboarding/useConsumerOnboarding.ts` (Hook di stato e transizione)
  - `src/features/onboarding/index.ts` (Barrel file onboarding)
- **Strategia & Strumenti:** Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Se il PAR-Q+ presenta risposte positive, blocco con alert prioritario di consulto medico. Salvataggio esclusivo su Silo 1.
- **Criteri di Accettazione & Collaudo:** Validazione corretta delle risposte e del codice azienda. `py test_check.py` superato.

### [ ] TASK-012: Pro Coach Onboarding, ATECO & Setup Fiscale Anti-Frode (FLOW-1B #07 - Tier 2)
- **Dipendenze:** Richiede: `TASK-004`, `TASK-011`.
- **Descrizione & Obiettivo Funzionale:** Implementazione del flusso onboarding per professionisti P.IVA:
  - Validazione formale Partita IVA italiana ed europea VIES;
  - Selezione e verifica Codice ATECO sportivo (es. 85.51.00) o sanitario/riabilitativo (es. 86.90.29 Fisioterapia, Biologia/Nutrizione);
  - Verifica Albi Professionali sanitari (FNOFI, TSRM-PSTRP, ONB) o certificazione ORCID ID per ricercatori indipendenti;
  - Setup contrattualistica digitale coach-atleta con manleva professionale;
  - Configurazione del tetto massimo di 50 atleti gestiti (`MAX_PRO_ATHLETES_LIMIT = 50`) su Silo 1 Pro.
- **Riferimenti Architetturali:** `07-software-2-flow-1b-pro-onboarding.md`, `MASTER-FLOWCHART-REGISTRY.md` (#07), `00-GLOSSARIO-TERMINI-TECNICI.md`.
- **File Target in `src/`:**
  - `src/features/onboarding/ProOnboardingModal.tsx` (Wizard onboarding professionale a step)
  - `src/features/onboarding/FiscalVerificationForm.tsx` (Form P.IVA, codice ATECO, SDI e Albo)
  - `src/features/onboarding/CoachAthleteContractSetup.tsx` (Template contrattuale per assegnazione assistiti)
  - `src/features/onboarding/useProOnboarding.ts` (Hook logica fiscale e salvataggio su Silo 1 Pro)
- **Strategia & Strumenti:** Skills: `client-server-ip-isolation`. Regole: 01, 02 (costante `MAX_PRO_ATHLETES_LIMIT = 50`).
- **Vincoli di Sicurezza & Isolamento:** Salvataggio su Silo 1 Pro (PostgreSQL isolato). Rispetto dei limiti di legge (Art. 348 c.p.).
- **Criteri di Accettazione & Collaudo:** Regex P.IVA / VIES valida; blocco oltre 50 atleti. `py test_check.py` e `npm run typecheck` verificati.

### [ ] TASK-013: Enterprise Bunker Onboarding, SAML/KMS & Censimento Organico RBAC (FLOW-1C #13 - Tier 3)
- **Dipendenze:** Richiede: `TASK-004`, `TASK-012`.
- **Descrizione & Obiettivo Funzionale:** Implementazione dell'onboarding Enterprise per club sportivi professionistici, federazioni e centri di ricerca:
  - Inizializzazione della partizione isolata su **Silo 2 Bunker KMS** con cifratura dedicata a riposo;
  - Simulatore federazione identità SAML 2.0 / Okta e autenticazione hardware FIDO2 / mTLS;
  - **Censimento Organico RBAC:** interfaccia di registrazione massiva dell'organigramma del club (Staff Medico con segreto professionale, Head S&C, Preparatore, Fisioterapista, Video Analyst, Nutrizionista, Rosa Giocatori);
  - Matrice granulare dei permessi con segregazione ermetica dei dati sanitari (EMR visibile solo al Medico).
- **Riferimenti Architetturali:** `13-software-3-flow-1c-bunker-onboarding-kms.md`, `MASTER-FLOWCHART-REGISTRY.md` (#13), `00-GLOSSARIO-TERMINI-TECNICI.md#censimento-organico-rbac`.
- **File Target in `src/`:**
  - `src/features/onboarding/EnterpriseOnboardingModal.tsx` (Wizard onboarding club a step)
  - `src/features/onboarding/RosterCensusImportTable.tsx` (Tabella censimento massivo atleti e staff con ruoli)
  - `src/features/onboarding/MultiStaffRbacMatrix.tsx` (Configuratore matrice permessi RBAC multi-ruolo)
  - `src/features/onboarding/BunkerSecurityAuditView.tsx` (Pannello audit crittografia KMS, log accessi e conformità)
- **Strategia & Strumenti:** Skills: `client-server-ip-isolation`, `react-ts-reverse-architect`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Isolamento Silo 2 Bunker KMS. Nessun accesso a referti sanitari per preparatori o dirigenti privi di ruolo medico.
- **Criteri di Accettazione & Collaudo:** Verifica segregazione permessi staff. `py test_check.py` e `npm run typecheck` superati.

---

## MACRO-SEZIONE 4: Gestione Roster, Cartella Clinica & Comunicazioni Interne

### [ ] TASK-014: Roster Management, Cartella Clinica EMR & Semaforo RTP
- **Dipendenze:** Richiede: `TASK-005`, `TASK-013`.
- **Descrizione & Obiettivo Funzionale:** Implementazione dell'archivio centrale della rosa per coach e staff (distinto dal profilo personale):
  - *Gestione Roster:* Elenco atleti con filtri per ruolo tattico, stato contrattuale, gruppo di lavoro Tier 3 e ricerca istantanea;
  - *Cartella Clinica EMR & Registro Infortuni:* Diario clinico per medici e fisioterapisti con registrazione lesioni, data evento, diagnosi, articolazioni coinvolte e terapie in corso;
  - *Semaforo RTP (Disponibilità Clinico-Sportiva):* Indicatore dinamico Verde (Disponibile), Giallo (Lavoro differenziato / limitazioni ROM), Rosso (Non disponibile per infortunio acuto);
  - Blocco automatico di schede ad alto impatto per atleti con semaforo Giallo o Rosso (integrazione con ImpactCalculator).
- **Riferimenti Architetturali:** Master Flowchart (Gestione Roster & Cartella Atleta), `00-GLOSSARIO-TERMINI-TECNICI.md#semaforo-rtp-disponibilita-clinico-sportiva`, ex-#18.
- **File Target in `src/`:**
  - `src/features/roster/RosterListView.tsx` (Vista master gestione rosa e gruppi atleti)
  - `src/features/roster/AthleteMedicalRecordDrawer.tsx` (Pannello cartella clinica EMR riservato al personale medico)
  - `src/features/roster/InjuryRegisterTable.tsx` (Registro infortuni e storico lesioni per atleta)
  - `src/features/roster/RtpStatusTrafficLight.tsx` (Componente visuale semaforo disponibilità campo con tooltip clinico)
  - `src/features/roster/index.ts` (Barrel file modulo roster)
- **Strategia & Strumenti:** Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Rispetto del segreto medico (GDPR Art. 9): i dettagli diagnostici sono visibili solo a profili medici (FNOFI/TSRM/FNOMCEO); i coach vedono solo il semaforo e le limitazioni motorie.
- **Criteri di Accettazione & Collaudo:** Verifica cambio stato semaforo e applicazione filtri clinici. `py test_check.py` e `npm run typecheck` superati.

### [ ] TASK-015: Centro Notifiche, Approvazioni Human-in-the-Loop & Chat Privata Staff/Atleta
- **Dipendenze:** Richiede: `TASK-004`, `TASK-014`.
- **Descrizione & Obiettivo Funzionale:** Implementazione dei canali di comunicazione interna protetta e approvazione:
  - *Centro Notifiche e Approvazioni (Inbox):* Pannello notifiche per coach e medici con badge reattivo: arrivo nuovi video da revisionare, notifiche test PVT completati, anomalie HRV e allarmi Red Flags;
  - *Workflow Human-in-the-Loop:* Richieste di approvazione per la pubblicazione di esercizi in Secret Vault di club (doppia firma Medico + Coach) e convalida progressione Return to Play;
  - *Chat Privata Cifrata:* Canale di messaggistica istantanea bidirezionale 1:1 tra coach e singolo atleta (Tier 2/3) e chat di gruppo riservata allo staff tecnico-sanitario (Tier 3), isolata da feed social.
- **Riferimenti Architetturali:** Master Flowchart (Inbox & Chat Privata), `00-GLOSSARIO-TERMINI-TECNICI.md#centro-notifiche-e-approvazioni-inbox`.
- **File Target in `src/`:**
  - `src/features/communications/InboxApprovalsPanel.tsx` (Drawer notifiche e approvazioni Human-in-the-Loop)
  - `src/features/communications/DualSignApprovalCard.tsx` (Componente firma digitale congiunta Medico + S&C)
  - `src/features/communications/PrivateStaffChatView.tsx` (Interfaccia messaggistica sicura 1:1 e di gruppo)
  - `src/features/communications/useCommunications.ts` (Hook gestione messaggi e notifiche con cache locale)
  - `src/features/communications/index.ts` (Barrel file comunicazioni)
- **Strategia & Strumenti:** Skills: `client-server-ip-isolation`, `app-navigation-integrator`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Isolamento assoluto dei messaggi sanitari dai canali social. Divieto di condivisione di massa in Tier 2.
- **Criteri di Accettazione & Collaudo:** Notifiche reattive con contatore badge; doppia firma funzionante. `py test_check.py` superato.

### [ ] TASK-016: Calendario & Pianificazione Stagionale
- **Dipendenze:** Richiede: `TASK-010`, `TASK-014`.
- **Descrizione & Obiettivo Funzionale:** Implementazione del modulo temporale che trasforma microcicli e macrocicli in date reali:
  - Vista mensile, settimanale e giornaliera (Daily Agenda);
  - Pianificazione per Team d'Élite: collocazione delle partite ufficiali (Match Day), sedute di scarico (MD-1, MD+1), allenamenti ad alta intensità (MD-3, MD-4) e finestre per test atletici (PVT, VBT, saliva/lattato);
  - Gestione appuntamenti per professionisti P.IVA (Tier 2): calendario prenotazioni clienti 1:1 e sedute studio;
  - Sincronizzazione con il Daily Workout della Control Room (`TASK-010`).
- **Riferimenti Architetturali:** Master Flowchart (Calendario e Pianificazione Stagionale), `zona3-06-ui-wireflow.mmd`.
- **File Target in `src/`:**
  - `src/features/calendar/SeasonCalendarView.tsx` (Vista master calendario con switch Mese/Settimana/Giorno)
  - `src/features/calendar/MatchDayEventBadge.tsx` (Badge evento categorizzato: Match, Allenamento, Test, Riposo)
  - `src/features/calendar/ScheduleSessionModal.tsx` (Modale pianificazione evento con assegnazione atleta/squadra)
  - `src/features/calendar/useSeasonSchedule.ts` (Hook gestione eventi temporali con persistenza locale)
  - `src/features/calendar/index.ts` (Barrel file calendario)
- **Strategia & Strumenti:** Skills: `app-navigation-integrator`, `sports-science-biometrics-guard`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Il calendario della squadra è visibile solo a membri autorizzati dello staff Tier 3.
- **Criteri di Accettazione & Collaudo:** Navigazione fluida tra date, drag-and-drop o riallocazione oraria. `py test_check.py` superato.

---

## MACRO-SEZIONE 5: Catalogo Esercizi & Avatar 3D Multi-Tier (Colonna 2 / Flow 2A, 2B, 2C)

### [ ] TASK-017: Certified 3D Exercise Viewer & Biomechanics HUD (FLOW-2A #02 - Tier 1)
- **Dipendenze:** Richiede: `TASK-002`, `TASK-009`.
- **Descrizione & Obiettivo Funzionale:** Estensione del catalogo certificato a 328 esercizi (296 base + 32 protocolli clinici ginocchio `cli_01..cli_32` accessibili come schede riabilitative standard):
  - Visualizzatore 3D Three.js con supporto compressione Draco GLB orbitabile a 360° (OrbitControls);
  - Evidenziazione colorimetrica fasce muscolari (Muscular Heatmap HUD: target primario, sinergici, stabilizzatori);
  - Sezione schede tecniche "Why & Fix" con spiegazioni posturali ed errori comuni da evitare;
  - Ricerca multi-distretto per singolo muscolo, distretto, categoria e attrezzatura;
  - Vincolo read-only: **zero video upload** consentito in questa fascia.
- **Riferimenti Architetturali:** `02-software-1-flow-2a-personal-cockpit.md`, `MASTER-FLOWCHART-REGISTRY.md` (#02), `ui-research/biomechanics-video-analysis-spec.md`.
- **File Target in `src/`:**
  - `src/features/catalog/Exercise3DViewer.tsx` (Canvas WebGL Three.js con OrbitControls e fallback SVG 2D)
  - `src/features/catalog/MuscularHeatmapHUD.tsx` (Visualizzatore grafico 2D/3D fasce muscolari con legenda anatomica)
  - `src/features/catalog/WhyAndFixSection.tsx` (Pannello spiegazione tecnica con cues biomeccanici)
  - `src/features/catalog/ExerciseDetailModal.tsx` (Estensione modale dettaglio con tab 3D integrato)
  - `src/features/catalog/useCatalog.ts` (Estensione hook per caricamento asincrono modelli e tutti i 328 esercizi)
- **Strategia & Strumenti:** Skills: `sports-science-biometrics-guard`, `app-navigation-integrator`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Graceful degradation su dispositivi non WebGL. Nessun caricamento video utente.
- **Criteri di Accettazione & Collaudo:** Tutti i 328 esercizi visualizzabili con dettagli anatomici. `py test_check.py` e `npm run typecheck` verificati con 0 errori.

### [ ] TASK-018: Pro Custom Video Uploader, Trimmer & AI Coach Biomechanics (FLOW-2B #08 - Tier 2)
- **Dipendenze:** Richiede: `TASK-012`, `TASK-017`.
- **Descrizione & Obiettivo Funzionale:** Implementazione del caricamento di video personalizzati per professionisti:
  - Risoluzione massima 1080p Full HD a 60fps con downscaling automatico WebCodecs se sorgente $>1080\text{p}$;
  - Editor video integrato: timeline con trimming millimetrico (`startMs`, `endMs`) e controllo velocità playback variabile (slow-motion 0.25x, 0.5x, 0.75x; velocizzazione 1.25x, 1.5x, 2.0x);
  - Form compilazione manuale punti di forza e debolezza con integrazione AI didattica (RAG 70% su 322 paper PubMed con modale Diff);
  - Scheda esercizio con toggle istantaneo *"Video 1080p Reale vs Modello 3D"*;
  - **Vincolo rigoroso di condivisione 1:1:** salvataggio su Silo 1 Pro e assegnazione a singolo allievo (blocco broadcast multi-atleta).
- **Riferimenti Architetturali:** `08-software-2-flow-2b-coach-hub.md`, `MASTER-FLOWCHART-REGISTRY.md` (#08), `ui-research/biomechanics-video-analysis-spec.md`.
- **File Target in `src/`:**
  - `src/features/catalog/ProVideoUploader.tsx` (Form upload drag-and-drop con validatore formato MP4/MOV e risoluzione)
  - `src/features/catalog/VideoEditorTrimmer.tsx` (Component player HTML5 con filmstrip scrubber e controlli velocità)
  - `src/features/catalog/AiCoachRationaleCard.tsx` (Generatore note AI 70% ancorate a evidenze PubMed con modale Diff)
  - `src/features/catalog/OneToOneShareModal.tsx` (Selettore cliente vincolato a 1 singolo atleta con warning Tier 3)
- **Strategia & Strumenti:** Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`. Regole: 01, 02 (costante `MAX_PRO_VIDEO_RES = '1080p'`).
- **Vincoli di Sicurezza & Isolamento:** Salvataggio su Silo 1 Pro. Blocco gateway 403 se destinatari $>1$.
- **Criteri di Accettazione & Collaudo:** Trimming frame-accurate; divieto di condivisione contemporanea multipla. `py test_check.py` superato.

### [ ] TASK-019: Elite Multi-Camera 4K & FEA Muscle Stress Suite (FLOW-2C #14 - Tier 3)
- **Dipendenze:** Richiede: `TASK-013`, `TASK-018`.
- **Descrizione & Obiettivo Funzionale:** Implementazione della suite video d'élite per club professionistici:
  - Sincronizzazione multi-camera fino a 4K Ultra HD (60/120fps) con timecode SMPTE tra telecamere da campo;
  - Dynamic Forensic Watermarking anti-leak in sovrimpressione con ID utente, ID club e timestamp;
  - **Analisi 3D dello stress muscolare (FEA):** simulazione agli elementi finiti con mappa cromatica delle sollecitazioni sulle fibre muscolari durante l'esecuzione;
  - Gruppi di lavoro dedicati con condivisione broadcast alla rosa e caricamento multiplo dello stesso esercizio su più atleti con correzioni AI personalizzate;
  - Flusso a **doppia firma digitale congiunta Medico Sociale + Head S&C** prima della pubblicazione nella Secret Vault del club su Silo 2 Bunker KMS.
- **Riferimenti Architetturali:** `14-software-3-flow-2c-multi-staff-cockpit.md`, `MASTER-FLOWCHART-REGISTRY.md` (#14), `00-GLOSSARIO-TERMINI-TECNICI.md#fea-analisi-stress-fibre-muscolari-3d`.
- **File Target in `src/`:**
  - `src/features/catalog/MultiCamera4KPlayer.tsx` (Griglia multi-angolare sincronizzata SMPTE con scrubber 120fps)
  - `src/features/catalog/DynamicWatermarkOverlay.tsx` (Overlay forense canvas dinamico per prevenzione fughe video)
  - `src/features/catalog/FeaStressVisualizer3D.tsx` (Simulatore 3D tensione fibre muscolari con scala di sforzo MPa)
  - `src/features/catalog/DualSignApprovalWorkflow.tsx` (Workflow e modale per approvazione congiunta Medico + Coach)
- **Strategia & Strumenti:** Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Isolamento Silo 2 Bunker KMS. Esercizio sbloccato solo con entrambe le firme apposte.
- **Criteri di Accettazione & Collaudo:** Verifica watermark dinamico e sincronizzazione multi-camera. `py test_check.py` superato.

---

## MACRO-SEZIONE 6: Programmazione, Workout Player & Readiness (Colonna 3 / Flow 3A, 3B, 3C)

### [ ] TASK-020: Base Workout Player, PR Live Tracking & Card Certificata T7 (FLOW-3A #03 - Tier 1)
- **Dipendenze:** Richiede: `TASK-003`, `TASK-017`.
- **Descrizione & Obiettivo Funzionale:** Implementazione della programmazione base per atleti amatoriali:
  - Archivio schede pre-confezionate standardizzate per sport e obiettivo (consultabili in-app o esportabili in PDF statico non modificabile);
  - **Workout Player Offline ("Avvia Sessione"):** timer di recupero audio/visivo, spunta serie, inserimento carichi reali (kg) e reps effettive su IndexedDB;
  - **PR (Personal Record) Live Tracking:** rilevamento automatico in background dei carichi record battuti e calcolo del tonnellaggio totale sollevato ($\text{serie} \times \text{reps} \times \text{kg}$);
  - **Card Certificata T7 (Bridge verso Together Social):** generazione a fine sessione della scheda riassuntiva con badge certificato T7, con bivio di salvataggio privato nello storico o export social con filtro privacy dati.
- **Riferimenti Architetturali:** `03-software-1-flow-3a-workout-player.md`, `MASTER-FLOWCHART-REGISTRY.md` (#03), `00-GLOSSARIO-TERMINI-TECNICI.md#card-certificata-t7-post-workout-sharing`.
- **File Target in `src/`:**
  - `src/features/programming/PrebuiltProgramsCatalog.tsx` (Catalogo schede pre-confezionate con barra filtri)
  - `src/features/programming/WorkoutPlayerView.tsx` (Interfaccia player a schermo intero per esecuzione in palestra)
  - `src/features/programming/WorkoutRestTimer.tsx` (Cronometro recuperi con avviso acustico web audio sintetizzato)
  - `src/features/programming/PersonalRecordDetector.ts` (Motore di tracciamento PR e tonnellaggio seduta)
  - `src/features/programming/CertifiedT7CardModal.tsx` (Modale di riepilogo con generazione Card T7 e selettore privacy Together)
  - `src/features/programming/ReadOnlyPdfExport.ts` (Esportatore PDF statico non editabile)
- **Strategia & Strumenti:** Skills: `sports-science-biometrics-guard`, `app-navigation-integrator`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Funzionamento offline garantito su IndexedDB. Nessuna connessione a data analisi o AI.
- **Criteri di Accettazione & Collaudo:** Calcolo corretto del tonnellaggio; generazione Card T7 con dati certificati. `py test_check.py` superato.

### [ ] TASK-021: Anamnestic 6-Month Periodization & Triage 119 (FLOW-3B #09 - Tier 2)
- **Dipendenze:** Richiede: `TASK-012`, `TASK-020`.
- **Descrizione & Obiettivo Funzionale:** Implementazione del generatore anamnestico di macrocicli per professionisti:
  - Acquisizione questionario anamnestico completo (storia clinica, caratteristiche atleta, infortuni pregressi);
  - Motore `ImpactCalculator` per screening su 119 patologie categorizzate con cutoff binario: `EXCLUDED` (vietato con razionale clinico), `ADAPTED` (limitazioni di ROM), `AVAILABLE` (consentito);
  - Pianificazione periodizzata fino a 6 mesi (24 settimane) con modelli DUP (Daily Undulating Periodization) o blocchi 12-16 settimane e settimane di scarico programmate (-40% volume);
  - Personalizzazione manuale totale di serie, reps, carichi ed esercizi con spiegazioni AI approfondite ancorate a fonti scientifiche con link DOI;
  - **Esportazione multi-formato in 4 estensioni:** PDF, Excel (.xlsx totalmente sbloccato `protected: false`), Word (.docx) e Notes;
  - Vincoli Tier 2: schede prive di video interni, NO chatbot, NO RAG, salvataggio su Silo 1 Pro.
- **Riferimenti Architetturali:** `09-software-2-flow-3b-macrocycle-ai-triage119.md`, `MASTER-FLOWCHART-REGISTRY.md` (#09), `00-GLOSSARIO-TERMINI-TECNICI.md`.
- **File Target in `src/`:**
  - `src/features/programming/AnamnesticTriageWizard.tsx` (Wizard questionario clinico/atletico a step)
  - `src/features/programming/MacrocylePeriodizationView.tsx` (Timeline interattiva 6 mesi con DUP e scarico programmato)
  - `src/logic/anamnestic-triage-engine.ts` (Motore di triage su 119 condizioni con regole di esclusione)
  - `src/features/programming/MultiFormatExporter.ts` (Generatore export sbloccato in 4 formati: XLSX, PDF, DOCX, Notes)
- **Strategia & Strumenti:** Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`. Regole: 01, 02, 05 (Excel `protected: false`).
- **Vincoli di Sicurezza & Isolamento:** Gli esercizi esclusi dalle 119 patologie non possono comparire nella scheda generata. Excel privo di password o celle bloccate.
- **Criteri di Accettazione & Collaudo:** Verifica esclusione esercizi a rischio; export XLSX 100% editabile. `py test_check.py` superato.

### [ ] TASK-022: Team Microcycle MD-X, Coach Style Cloning & 52-Week Season (FLOW-3C #15 - Tier 3)
- **Dipendenze:** Richiede: `TASK-013`, `TASK-021`.
- **Descrizione & Obiettivo Funzionale:** Implementazione della programmazione stagionale d'élite per club:
  - *Modello Microciclico MD-X:* Struttura settimanale calibrata sul Match Day (MD-4, MD-3, MD-2, MD-1, MD, MD+1, MD+2) con split automatico del carico tra Titolari (recupero attivo e monitoraggio fatica) e Panchinari/Riserve (stimolo compensativo ad alta intensità per pareggio metabolico);
  - Pianificazione annuale completa estesa all'intera stagione agonistica (fino a 52 settimane);
  - Integrazione diretta con Data Analisi per carichi, antropometria e test storici;
  - Condivisione schede all'atleta con video 4K dimostrativi ed errori da evitare;
  - **Clonazione dello stile del coach (Style-Cloning tramite RAG):** l'AI apprende il lessico, i principi metodologici e le dispense interne dell'allenatore redigendo spiegazioni conformi;
  - Protocolli avanzati di riabilitazione e Return to Play (RTP) convalidati con lo staff medico.
- **Riferimenti Architetturali:** `15-software-3-flow-3c-team-microcycle-mdx.md`, `MASTER-FLOWCHART-REGISTRY.md` (#15), `00-GLOSSARIO-TERMINI-TECNICI.md#microciclo-md-x-modello-titolari-vs-panchinari`.
- **File Target in `src/`:**
  - `src/features/programming/TeamMicrocycleMDXView.tsx` (Dashboard microciclo MD-X con switch Titolari vs Panchinari)
  - `src/features/programming/AnnualSeasonPlanner.tsx` (Pianificatore annuale 52 settimane per club)
  - `src/features/programming/CoachStyleCloningCard.tsx` (Configuratore lessico e principi del coach per RAG)
  - `src/features/programming/RtpRehabProtocolPlanner.tsx` (Pianificatore protocolli Return to Play a 6 fasi congiunto)
- **Strategia & Strumenti:** Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Salvataggio su Silo 2 Bunker KMS. Dati protetti da crittografia a livello di tenant.
- **Criteri di Accettazione & Collaudo:** Calcolo corretto dei target MD-X in base alla vicinanza al match. `py test_check.py` superato.

### [ ] TASK-023: Readiness Section — I 6 Pilastri Metodologici (FLOW-3C #15 - Tier 3 ONLY)
- **Dipendenze:** Richiede: `TASK-006`, `TASK-022`.
- **Descrizione & Obiettivo Funzionale:** Implementazione della sezione Readiness d'élite basata sui 6 pilastri scientifici non negoziabili:
  1. *Protocollo PVT-B (3 minuti):* Misurazione dell'attenzione sostenuta del SNC con stimolo visivo randomizzato (intervallo 2000-10000ms), Median RT, velocità reciproca $1/\text{RT}$, variabilità intra-individuale, lapsus calibrati su baseline ($\text{RT} > 500\text{ms}$ o $2\times \text{baseline}$) e false starts;
  2. *Segregazione contestuale (Dual Testing Protocol):* Test Mattutino a Digiuno (recupero sistemico, sonno e tono vagale HRV rMSSD) vs Pre-Sessione Acuta (arousal neuromuscolare e prontezza pre-gara);
  3. *Decoupled Readiness Sub-Scores (4 Domini Indipendenti):* Esposizione separata di 4 punteggi autonomi (Fisiologico, Neurocognitivo, Neuromuscolare, Tolleranza Carico) per prevenire il mascheramento di deficit acuti;
  4. *Standardizzazione Robust Z-Score (MAD):* Normalizzazione non parametrica $Z = \frac{x - \text{mediana}}{1.4826 \times \text{MAD}}$ calcolata su rolling window a 28 giorni, totalmente immune da asimmetrie ed outlier;
  5. *Architettura Rischio Infortuni a Due Fasi:* Fase 1 Matrice Deterministica Red Flag (hard stop su asimmetria $>15\%$, spike ACWR $>1.50$, deficit neurale PVT) $\rightarrow$ Fase 2 Modello multivariato su serie storiche longitudinali di squadra;
  6. *Supporto preventivo AI con modulazione mirata del carico:* Prescrizione selettiva degli stimoli (calo PVT $\rightarrow$ taglio sprint e carico cognitivo; calo HRV $\rightarrow$ taglio volume/densità; calo CMJ $\rightarrow$ stop pliometria ed eccentrici pesanti).
- **Riferimenti Architetturali:** `15-software-3-flow-3c-team-microcycle-mdx.md` (Sez. Readiness), `00-GLOSSARIO-TERMINI-TECNICI.md#pvt-b-brief-psychomotor-vigilance-task-3-min`.
- **File Target in `src/`:**
  - `src/features/readiness/PvtBTestModal.tsx` (Test reattivo PVT-B da 3 minuti con tocco touch/tastiera ad alta precisione temporale `performance.now()`)
  - `src/features/readiness/DualTestingProtocolCard.tsx` (Comparatore contestuale Mattutino vs Pre-Sessione)
  - `src/features/readiness/DecoupledSubScoresChart.tsx` (Radar/bar chart per i 4 domini disaccoppiati)
  - `src/features/readiness/RobustZScoreEngine.ts` (Calcolo non parametrico Z-Score con mediana e MAD su rolling window a 28 giorni)
  - `src/features/readiness/TwoPhaseInjuryRiskModel.ts` (Modello a due fasi con hard stop deterministico)
  - `src/features/readiness/LoadModulationAdvisory.tsx` (Pannello prescrizione selettiva carichi con alert prioritari)
  - `src/features/readiness/ReadinessDashboardView.tsx` (Dashboard master Readiness Atleta e Squadra)
  - `src/features/readiness/index.ts` (Barrel file readiness)
- **Strategia & Strumenti:** Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`, `react-ts-reverse-architect`. Regole: 01, 02 (costanti `PVT_DURATION_MS = 180000;`, `MAD_FACTOR = 1.4826;`, `ROLLING_WINDOW_DAYS = 28;`).
- **Vincoli di Sicurezza & Isolamento:** Algoritmi predittivi protetti server-side (ADR-01). Esclusiva Tier 3.
- **Criteri di Accettazione & Collaudo:** Verifica matematica MAD con dataset sintetico di outlier; timing PVT sub-millisecondo. `py test_check.py` superato.

---

## MACRO-SEZIONE 7: Data Analisi, Video Biomeccanica, VBT & Telemetria (Colonna 4 / Flow 4A, 4B, 4C)

### [ ] TASK-024: Determinist Goniometer & Angle Extraction (FLOW-4A #04 - Tier 1)
- **Dipendenze:** Richiede: `TASK-002`, `TASK-009`.
- **Descrizione & Obiettivo Funzionale:** Implementazione della revisione biomeccanica deterministica per atleti amatoriali:
  - Video player locale HTML5 con fermo immagine e controllo frame-by-frame;
  - Goniometro digitale manuale 2D (modalità `ANGLE` da benchmark Kinepose): posizionamento drag-and-drop di 3 marker touch/mouse sui vertici articolari (es. trocantere, condilo femorale, malleolo laterale);
  - Calcolo trigonometrico puro con arcocoseno del prodotto scalare per angoli articolari principali (anca, ginocchio, caviglia, gomito);
  - Tabella readout angolare in sola lettura in gradi sessagesimali (`tabular-nums`);
  - Vincoli inviolabili Tier 1: **Zero AI, Zero RAG, Zero Wearable, nessuna correlazione con programmazione o altre sezioni**, salvataggio opzionale su Silo 1.
- **Riferimenti Architetturali:** `04-software-1-flow-4a-wearable-sync.md`, `MASTER-FLOWCHART-REGISTRY.md` (#04), `ui-research/biomechanics-video-analysis-spec.md`.
- **File Target in `src/`:**
  - `src/features/analysis/DeterministGoniometerView.tsx` (Overlay canvas interattivo su frame video con marker trascinabili)
  - `src/features/analysis/TrigonometricAngleEngine.ts` (Calcolo geometrico angoli tra 3 coordinate con formula algebrica deterministica)
  - `src/features/analysis/JointAngleReadoutCard.tsx` (Card readout angolare in font tabulare con unità obbligatoria `°`)
- **Strategia & Strumenti:** Skills: `sports-science-biometrics-guard`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Nessuna chiamata a modelli neurali o API esterne. Nessun wearable collegabile.
- **Criteri di Accettazione & Collaudo:** Calcolo corretto dell'angolo tra vettori ($0^{\circ} \dots 180^{\circ}$). `py test_check.py` e `npm run typecheck` verificati con 0 errori.

### [ ] TASK-025: AI 70% Real-Time Live Camera & T7 Wearable BLE (FLOW-4B #10 - Tier 2)
- **Dipendenze:** Richiede: `TASK-006`, `TASK-024`.
- **Descrizione & Obiettivo Funzionale:** Implementazione dell'analisi biomeccanica avanzata per professionisti:
  - Acquisizione live camera WebRTC a 60fps con overlay scheletrico 2D in tempo reale (Skeleton Pose Overlay);
  - Controllo sul momento dell'esercizio con considerazioni e suggerimenti correttivi dell'AI T7 a potenza 70% (modelli interni T7 dedicati);
  - **Salvataggio esclusivo in Data Analisi Silo 1 Pro:** il video e le correzioni trascritte vengono salvate in `pro_analysis_sessions` (**divieto assoluto di salvataggio nel Catalogo Esercizi**, database separati);
  - Condivisione video e analisi vincolata al rapporto **strettamente 1:1** con il singolo atleta assistito;
  - **Compatibilità esclusiva Wearable marchio T7:** filtro di accettazione BLE limitato unicamente a dispositivi proprietari T7; analisi sommaria delle metriche di soglia del lattato (2.0 e 4.0 mmol/L).
- **Riferimenti Architetturali:** `10-software-2-flow-4b-vbt-pap-biomechanics.md`, `MASTER-FLOWCHART-REGISTRY.md` (#10), `ui-research/biomechanics-video-analysis-spec.md`.
- **File Target in `src/`:**
  - `src/features/analysis/LiveCameraCorrectionView.tsx` (Interfaccia camera WebRTC con skeleton pose overlay e badge di correzione live)
  - `src/features/analysis/T7WearableSyncPanel.tsx` (Pannello BLE con filtro vendor hardware proprietario T7)
  - `src/features/analysis/LactateThresholdEstimator.ts` (Algoritmo stima sommaria soglie aerobica/anaerobica)
  - `src/features/analysis/OneToOneAnalysisShareModal.tsx` (Modale di condivisione analisi vincolata a singolo allievo)
- **Strategia & Strumenti:** Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Rifiuto di sensori di terze parti in Tier 2. Nessun salvataggio verso il Catalogo Esercizi.
- **Criteri di Accettazione & Collaudo:** Connessione sensori T7 verificata; blocco condivisione broadcast. `py test_check.py` superato.

### [ ] TASK-026: Universal VBT & Profilo Forza-Velocità
- **Dipendenze:** Richiede: `TASK-002`, `TASK-025`.
- **Descrizione & Obiettivo Funzionale:** Implementazione del modulo VBT unificato (Velocity Based Training) integrato in Data Analisi per Tier 2 e Tier 3:
  - *Parser Universale Disomogeneo:* Importazione e normalizzazione tracciati CSV/Excel da qualsiasi encoder o strumento di mercato (Vitruve, GymAware, Beast, Speed4Lifts, pedane di forza);
  - *Modellazione Matematica VBT:* Regressione lineare OLS e quadratica polinomiale con filtro outlier IQR sui residui di velocità;
  - Calcolo $F_0$, $v_0$, $P_{\max}$ e stima $1\text{RM}$ al punto MVT ($0.30\text{ m/s}$) con intervallo di confidenza al 95%;
  - Tabella delle Zone di Allenamento di Bryan Mann (Velocità Massima, Forza-Velocità, Potenza, Forza Submassimale);
  - *Test PAP (Post-Activation Potentiation):* Confronto pre/post condizionamento con t-Student appaiato, Cohen's $d$ e soglia Minimal Detectable Change (MDC 95%).
- **Riferimenti Architetturali:** `CAPITOLATO_TECNICO_SOFTWARE_HOUSE.md` (Sez. 3 Modulo M05), `api-contracts-spec.json`, `00-GLOSSARIO-TERMINI-TECNICI.md#vbt-velocity-based-training`.
- **File Target in `src/`:**
  - `src/features/analysis/UniversalEncoderParser.ts` (Parser euristico colonne temporali, carichi e velocità da CSV/XLSX)
  - `src/features/analysis/ForceVelocityProfiler.tsx` (Grafici neon Chart.js per curva F-V lineare/polinomiale e potenza)
  - `src/features/analysis/PapMdcAnalysisView.tsx` (Modulo collaudo PAP con calcolo t-Student e MDC 95%)
  - `src/features/analysis/useVbtAnalysis.ts` (Estensione hook VBT con supporto multi-set e test PAP)
- **Strategia & Strumenti:** Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`. Regole: 01, 02 (costanti `DEFAULT_MVT_VELOCITY_MPS = 0.30;`, `IQR_MULTIPLIER = 1.5;`).
- **Vincoli di Sicurezza & Isolamento:** Calcoli OLS e 1RM conformi ad ADR-01 (logica protetta server-side / sanitizer).
- **Criteri di Accettazione & Collaudo:** Rispetto dei test case matematici in `api-contracts-spec.json`. `py test_check.py` superato.

### [ ] TASK-027: Kinepose Kinematic Viewport & Sprint Gait Cockpit (FLOW-4C #16 - Tier 3)
- **Dipendenze:** Richiede: `TASK-024`, `TASK-025`.
- **Descrizione & Obiettivo Funzionale:** Implementazione della suite cinematica Kinepose-grade completa per club d'élite:
  - **Split-Screen Kinematic Viewport (`VIDEO | STICKMAN`):** layout 16:9 con handle centrale dorato draggabile (`#fbbf24`), stream video ad alta frequenza (60/120fps) affiancato al gemello cinematico vettoriale a fondo nero puro (`#020408`);
  - **Griglia Prospettica Suolo Calibrata (10m..1m):** tracciamento prospettico al suolo e drop-line verticale CoM terminata da marker d'appoggio bilaterale (`#22c55e` destro / `#eab308` sinistro);
  - **Hero KPI Strip:** 4 card orizzontali (`10 M TIME` in ambra pieno, `CONTACT` GCT in ms, `FLIGHT` in ms, `STEP` in m);
  - **Precision Filmstrip Timeline & Stepper:** thumbnail dei frame, playhead con bracket ambra, readout `FRAME 146 / 2.435 s` e toolbar (`TAG`, `ANGLE`, toggle Griglia, toggle Stickman, Snapshot PNG);
  - **Sprint Profile Card:** classificazione **`DRIVER`** vs **`BOUNCER`** con polar radar chart e metrica Duty Factor (`44% GROUND`);
  - **Stride Waveform Card:** curve bilaterali L/R sovrapposte su ciclo del passo (`20%..100%`) con medie aggregate;
  - **Bilateral Joint Angles Matrix (4x2):** confronto frame-accurate di Knee, Hip, Ankle, Elbow destro e sinistro in `tabular-nums`.
- **Riferimenti Architetturali:** `ui-research/biomechanics-video-analysis-spec.md`, `16-software-3-flow-4c-gps-adaptive-zscore.md`, `00-GLOSSARIO-TERMINI-TECNICI.md#gct-ground-contact-time`.
- **File Target in `src/`:**
  - `src/features/analysis/video-biomechanics/SplitKinematicViewport.tsx` (Viewport a schermo diviso con handle draggabile e sync frame)
  - `src/features/analysis/video-biomechanics/GroundPerspectiveGridOverlay.tsx` (Canvas omografico griglia metrica 10m..1m)
  - `src/features/analysis/video-biomechanics/HeroKpiStrip.tsx` (Quartetto card KPI orizzontali ad alto contrasto)
  - `src/features/analysis/video-biomechanics/FilmstripTimelineScrubber.tsx` (Filmstrip timeline con playhead e marker eventi)
  - `src/features/analysis/video-biomechanics/SprintProfileRadarCard.tsx` (Card Driver/Bouncer con target polar chart)
  - `src/features/analysis/video-biomechanics/StrideWaveformCard.tsx` (Grafico estensione ciclo del passo bilaterale L/R)
  - `src/features/analysis/video-biomechanics/BilateralJointMatrix.tsx` (Matrice 4x2 Knee, Hip, Ankle, Elbow in font tabulare)
  - `src/features/analysis/video-biomechanics/index.ts` (Barrel file video biomeccanica)
- **Strategia & Strumenti:** Skills: `ui-ux-pattern-extractor`, `sports-science-biometrics-guard`, `client-server-ip-isolation`. Regole: 01, 02, 03.
- **Vincoli di Sicurezza & Isolamento:** Esclusiva Tier 3. Zero emoji (solo icone SVG lineari). Unità SI obbligatorie (`ms`, `m`, `s`, `°`).
- **Criteri di Accettazione & Collaudo:** Drag fluido dello split handle; sincronizzazione al millisecondo video-stickman. `py test_check.py` superato.

### [ ] TASK-028: Team GPS/HRV Fusion, Dual-Role Weighting & Fallback Cold Start (FLOW-4C #16 - Tier 3)
- **Dipendenze:** Richiede: `TASK-026`, `TASK-027`.
- **Descrizione & Obiettivo Funzionale:** Implementazione degli algoritmi avanzati per il monitoraggio del carico della rosa:
  - *Fusione GPS/HRV:* Correlazione bivariata tra carico esterno (distanza totale, sprint ad alta intensità HSR, accelerazioni/decelerazioni da qualsiasi GPS di mercato) e carico interno (frequenza cardiaca, HRV rMSSD);
  - *Ponderazione Doppio Ruolo Tattico:* Normalizzazione del carico per atleti con collocazione duplice in campo tramite media pesata sui minuti giocati per posizione ($\text{Baseline} = w_1 \cdot B_1 + w_2 \cdot B_2$ con $w_1 + w_2 = 1.0$);
  - *Fallback Cold Start per Nuovi Acquisti:* Algoritmo di ripiego su mediana di ruolo della squadra con intervallo di confidenza allargato ($\pm 20\%$) per atleti tesserati da meno di 6 mesi;
  - *Esportazione Universale Multi-Formato:* Generatore di report tecnici e presentazioni in formato .xlsx sbloccato (`protected: false`), .pdf, .docx, .pptx e .csv.
- **Riferimenti Architetturali:** `16-software-3-flow-4c-gps-adaptive-zscore.md`, `CAPITOLATO_TECNICO_SOFTWARE_HOUSE.md` (Sez. 3 Modulo M06), `00-GLOSSARIO-TERMINI-TECNICI.md#z-weighting-gestione-doppio-ruolo-tattico`.
- **File Target in `src/`:**
  - `src/features/analysis/GpsHrvFusionEngine.ts` (Motore correlazione carico esterno GPS e carico interno fisiologico)
  - `src/features/analysis/DualRoleWeightingCalculator.ts` (Calcolatore pesi percentuali per atleti con doppio ruolo tattico)
  - `src/features/analysis/ColdStartBaselineFallback.ts` (Generatore baseline provvisoria di ruolo per nuovi acquisti)
  - `src/features/analysis/FullExportEngine.ts` (Esportatore universale multi-formato per staff tecnico e dirigenza)
- **Strategia & Strumenti:** Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`. Regole: 01, 02, 05.
- **Vincoli di Sicurezza & Isolamento:** Salvataggio su Silo 2 Bunker KMS. Prevenzione totale di divisioni per zero o valori `NaN` in assenza di baseline.
- **Criteri di Accettazione & Collaudo:** Verifica matematica somma pesi doppio ruolo $= 1.0$; export XLSX 100% sbloccato. `py test_check.py` superato.

### [ ] TASK-029: Cross-Module Baseline Bridge & Private Role-Based RAG (FLOW-4C #16 - Tier 3)
- **Dipendenze:** Richiede: `TASK-023`, `TASK-028`.
- **Descrizione & Obiettivo Funzionale:** Implementazione del ponte bidirezionale che collega la Data Analisi alla Programmazione (#15) e al Catalogo Esercizi (#14):
  - *Cross-Module Baseline Bridge:* I dati di potenza VBT, i tempi PVT e i profili cinematici alimentano in tempo reale la baseline dell'atleta e guidano la generazione automatica delle schede;
  - *Facoltà Salvataggio nel Catalogo di Club:* Possibilità per lo staff di salvare video con correzioni trascritte sia in Data Analisi sia direttamente nel Catalogo Esercizi del club;
  - *RAG Privato Esclusivo Tier 3 (8 Pilastri Fondamentali):* Caricamento universale multi-formato (PDF, Excel, note vocali), isolamento 100% Private nel Bunker Silo 2 KMS, citazione fonti interne, memoria storica multi-stagione e traduzione multilingua;
  - *Role-Based RAG:* Segregazione automatica dei dati per ruolo (Staff Medico vs Coach vs Atleta);
  - *Conflict Alert Automatico:* Rilevamento in tempo reale di incongruenze tra schede di allenamento e referti medici/limiti articolari presenti nel RAG.
- **Riferimenti Architetturali:** `16-software-3-flow-4c-gps-adaptive-zscore.md` (Sez. RAG), `MASTER-FLOWCHART-REGISTRY.md` (#16), `00-GLOSSARIO-TERMINI-TECNICI.md#role-based-rag-controllo-accessi-gerarchico-medico-s-c-atleta`.
- **File Target in `src/`:**
  - `src/features/analysis/CrossModuleBaselineBridge.ts` (Sincronizzatore telemetria verso motore di programmazione e readiness)
  - `src/features/analysis/RoleBasedRagGatekeeper.ts` (Filtro gerarchico consultazione documenti RAG basato su RBAC)
  - `src/features/analysis/ConflictAlertBanner.tsx` (Banner visivo immediato di allarme per conflitti tra scheda e referto medico)
  - `src/features/analysis/ClubVaultExerciseSaver.ts` (Connettore per esportazione clip con correzioni nella vault di club)
- **Strategia & Strumenti:** Skills: `client-server-ip-isolation`, `sports-science-biometrics-guard`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Dati medici sensibili esclusi dalla vista dei coach. RAG operativo in enclave protetta.
- **Criteri di Accettazione & Collaudo:** Scatto immediato del Conflict Alert se la scheda viola una prescrizione clinica. `py test_check.py` superato.

---

## MACRO-SEZIONE 8: Libreria Fonti Scientifiche & AI Studio (Colonna 5 / Flow 5A, 5B, 5C)

### [ ] TASK-030: Open Access Scientific Archive (FLOW-5A #05 - Tier 1)
- **Dipendenze:** Richiede: `TASK-009`.
- **Descrizione & Obiettivo Funzionale:** Implementazione dell'archivio pubblico di letteratura scientifica per atleti amatoriali:
  - Consultazione dell'archivio dei 322 paper PubMed con metadati completi (PMID, DOI, autori, rivista, anno, abstract);
  - Barra di ricerca testuale e filtri avanzati per patologia, distretto muscolare, categoria di allenamento e anno di pubblicazione;
  - Accesso esclusivo agli studi pubblici e gratuiti (Open Access);
  - Vincoli Tier 1: sola lettura, nessun accesso alle Schede di Sintesi Premium, blocco download/modifiche e divieto di accesso all'Area Studio, **NO AI, NO RAG**.
- **Riferimenti Architetturali:** `05-software-1-flow-5a-together-social-b2c.md`, `MASTER-FLOWCHART-REGISTRY.md` (#05), `00-GLOSSARIO-TERMINI-TECNICI.md#open-access-papers-studi-scientifici-pubblici-e-gratuiti`.
- **File Target in `src/`:**
  - `src/features/sources/OpenAccessCatalogView.tsx` (Lista filtrabile dei 322 paper con paginazione e ricerca rapida)
  - `src/features/sources/SourcesFilterBar.tsx` (Barra filtri multidistretto, sport e anno)
  - `src/features/sources/PaperDetailModal.tsx` (Modale con metadati completi, abstract e link ufficiale DOI)
- **Strategia & Strumenti:** Skills: `app-navigation-integrator`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Nessuna chiamata a modelli AI; visualizzazione in sola lettura.
- **Criteri di Accettazione & Collaudo:** Tutti i 322 paper ricercabili con latenza $<50\text{ ms}$. `py test_check.py` superato.

### [ ] TASK-031: Premium Synthesis, Commissione & In-App Offline Study Area (FLOW-5B #11 - Tier 2)
- **Dipendenze:** Richiede: `TASK-003`, `TASK-030`.
- **Descrizione & Obiettivo Funzionale:** Implementazione della libreria scientifica professionale per preparatori e fisioterapisti P.IVA:
  - Accesso gratuito alle **Schede Tecniche di Sintesi** relative a studi internazionali a pagamento/privati (metodologia, risultati chiave, applicazioni pratiche e link DOI nel pieno rispetto del copyright);
  - Segnalazione studi mancanti tramite DOI/PMID e form di invio ricerche, tesi o casi studio inediti alla **Commissione Scientifica T7**;
  - **Area Studio Digitale In-App (Offline su IndexedDB):** banco di lavoro digitale con strumenti di studio (evidenziatore, matita, gomma, note testuali) e creazione manuale di mappe concettuali e riassunti a costo cloud zero;
  - Vincoli Tier 2: NO AI, NO RAG (salvataggio locale su IndexedDB in `study_notes`).
- **Riferimenti Architetturali:** `11-software-2-flow-5b-together-pro-business.md`, `MASTER-FLOWCHART-REGISTRY.md` (#11), `00-GLOSSARIO-TERMINI-TECNICI.md#area-studio-digitale-in-app-offline-indexeddb`.
- **File Target in `src/`:**
  - `src/features/sources/PremiumSynthesisCard.tsx` (Visualizzatore schede di sintesi strutturate copyright-safe)
  - `src/features/sources/StudyAreaDigitalDesk.tsx` (Canvas per appunti, evidenziazione PDF e mappe concettuali)
  - `src/features/sources/ScientificCommissionSubmissionModal.tsx` (Modale invio proposte e studi inediti alla commissione)
  - `src/features/sources/useStudyArea.ts` (Hook per gestione e persistenza note su IndexedDB)
- **Strategia & Strumenti:** Skills: `app-navigation-integrator`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Funzionamento offline su IndexedDB. Dati personali del professionista protetti in locale.
- **Criteri di Accettazione & Collaudo:** Persistenza appunti verificata su IndexedDB. `py test_check.py` superato.

### [ ] TASK-032: Academic Quality Indicators, Bollettino & 1-Click RAG Sync (FLOW-5C #17 - Tier 3)
- **Dipendenze:** Richiede: `TASK-029`, `TASK-031`.
- **Descrizione & Obiettivo Funzionale:** Implementazione dell'AI Studio scientifico d'élite per club e ricercatori:
  - Visualizzazione indicatori di qualità accademica: livelli di evidenza **CEBM Oxford (Livelli da I a V)** e Quartili **ISI JCR (Q1-Q4)**;
  - **Bollettino Settimanale Accademico:** feed rassegna stampa settimanale filtrato per discipline sportive praticate dal club;
  - **AI Studio 100%:** sintesi istantanea, spiegazione didattica semplificata e traduzione tecnica automatica multilingua degli studi scientifici;
  - Chatbot documentale interattivo contestuale al singolo studio;
  - **Integrazione diretta RAG (1-Click Sync):** pulsante per trasferire qualsiasi articolo o appunto dell'Area Studio direttamente nel database RAG del club (Bunker Silo 2 KMS), connettendo la ricerca alla Programmazione (#15) e alla Data Analisi (#16).
- **Riferimenti Architetturali:** `17-software-3-flow-5c-tactical-video-cv.md`, `MASTER-FLOWCHART-REGISTRY.md` (#17), `00-GLOSSARIO-TERMINI-TECNICI.md#indicatori-di-qualita-scientifica-cebm-oxford-e-quartili-jcr`.
- **File Target in `src/`:**
  - `src/features/sources/CebmQualityBadges.tsx` (Badge visivi livello evidenza CEBM Oxford I-V e Quartili JCR Q1-Q4)
  - `src/features/sources/WeeklyScientificBulletin.tsx` (Feed rassegna stampa accademica settimanale personalizzata)
  - `src/features/sources/StudyChatbotPanel.tsx` (Chatbot documentale contestuale ancorato al singolo studio)
  - `src/features/sources/OneClickRagSyncButton.tsx` (Pulsante e handler sincronizzazione diretta verso Bunker KMS)
- **Strategia & Strumenti:** Skills: `client-server-ip-isolation`, `sports-science-biometrics-guard`. Regole: 01, 02, 04.
- **Vincoli di Sicurezza & Isolamento:** Salvataggio su Silo 2 Bunker KMS. Classificazione evidenze conforme a Regola 04.
- **Criteri di Accettazione & Collaudo:** Sincronizzazione 1-click funzionante; badge CEBM/JCR visualizzati correttamente. `py test_check.py` superato.

---

## MACRO-SEZIONE 9: Preferiti Multi-Tier (Colonna 6 / Flow 6A, 6B, 6C)

### [ ] TASK-033: Linear Relational Bookmarks (FLOW-6A #06 - Tier 1)
- **Dipendenze:** Richiede: `TASK-017`, `TASK-020`.
- **Descrizione & Obiettivo Funzionale:** Implementazione dell'archivio Preferiti per atleti amatoriali:
  - Lista lineare piatta basata su puntatori relazionali deterministici su Silo 1 (`user_favorites`), zero duplicazione media;
  - Salvataggio rapido di esercizi 3D (dal Catalogo #02) e schede pre-confezionate (dalla Programmazione #03);
  - Aggiornamento istantaneo del contatore badge numerico nella Global Navigation Shell e nella navbar;
  - Vincoli inviolabili Tier 1: NO sottocartelle, NO tag, NO fonti scientifiche, NO video custom, NO template, NO Data Analisi.
- **Riferimenti Architetturali:** `06-software-1-flow-6a-movely-desk-care.md`, `MASTER-FLOWCHART-REGISTRY.md` (#06), `00-GLOSSARIO-TERMINI-TECNICI.md#lista-lineare-preferiti-tier-1-base`.
- **File Target in `src/`:**
  - `src/features/favorites/LinearFavoritesList.tsx` (Lista lineare piatta di schede ed esercizi salvati)
  - `src/features/favorites/BookmarkToggleBtn.tsx` (Pulsante icona segnalibro con stato attivo/disattivo reattivo)
  - `src/features/favorites/useLinearFavorites.ts` (Hook reattivo per gestione bookmark e contatore)
- **Strategia & Strumenti:** Skills: `app-navigation-integrator`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Nessuna sottocartella ammessa; puntatori leggeri su Silo 1.
- **Criteri di Accettazione & Collaudo:** Aggiunta/rimozione immediata preferito e allineamento contatore badge. `py test_check.py` superato.

### [ ] TASK-034: Thematic Folders, Custom Tags & Template Bookmarks (FLOW-6B #12 - Tier 2)
- **Dipendenze:** Richiede: `TASK-018`, `TASK-021`, `TASK-031`, `TASK-033`.
- **Descrizione & Obiettivo Funzionale:** Implementazione dei Preferiti professionali per preparatori e fisioterapisti P.IVA:
  - Organizzazione avanzata tramite **Cartelle Tematiche** e **Tag personalizzati** (es. "Protocolli Ipertrofia", "Articoli Nutrizione");
  - Salvataggio di esercizi standard, propri video personalizzati 1080p, template di programmi riutilizzabili per nuovi clienti 1:1, fonti scientifiche e appunti digitali locali IndexedDB;
  - Architettura a puntatori relazionali su Silo 1 Pro (`pro_favorite_folders`, `pro_favorite_tags`, `pro_favorite_pointers`);
  - Vincoli Tier 2: **Data Analisi (#10) NON salvabile nei Preferiti**, divieto di condivisione di squadra (solo 1:1).
- **Riferimenti Architetturali:** `12-software-2-flow-6b-physio-rehab-rom.md`, `MASTER-FLOWCHART-REGISTRY.md` (#12), `00-GLOSSARIO-TERMINI-TECNICI.md#cartelle-tematiche-tag-personalizzati-preferiti-pro`.
- **File Target in `src/`:**
  - `src/features/favorites/ThematicFolderManager.tsx` (Gestore cartelle tematiche con modale creazione e colori)
  - `src/features/favorites/CustomTagFilter.tsx` (Barra filtri per tag personalizzati)
  - `src/features/favorites/ProFavoritesView.tsx` (Vista completa preferiti per cartelle, template e tipologie)
- **Strategia & Strumenti:** Skills: `app-navigation-integrator`, `client-server-ip-isolation`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Salvataggio su Silo 1 Pro. Esclusione dei dati analitici e blocco condivisione broadcast.
- **Criteri di Accettazione & Collaudo:** Creazione cartelle dinamica; associazione tag multipli. `py test_check.py` superato.

### [ ] TASK-035: Enterprise All-in-One Favorites, Team Pinning & Medical Secret RLS (FLOW-6C #18 - Tier 3)
- **Dipendenze:** Richiede: `TASK-019`, `TASK-022`, `TASK-029`, `TASK-032`, `TASK-034`.
- **Descrizione & Obiettivo Funzionale:** Implementazione dell'hub Preferiti Enterprise All-in-One per club professionistici:
  - Salvataggio di qualsiasi risorsa: video 4K, programmi stagionali complessi, report Data Analisi, articoli scientifici, documenti staff e RAG;
  - **Doppio Livello di Preferiti:** *Preferiti Personali* (visibili solo al singolo) vs *Preferiti di Team/Staff* (condivisi, con **Team Pinning** in alto di documenti e routine cruciali);
  - Albero gerarchico cartelle complesse (`PostgreSQL ltree`) indicizzato GiST;
  - Ricerca ibrida intelligente (Full-Text `tsvector` + semantica vettoriale `pgvector`);
  - **Filtro Silenzioso RBAC & PostgreSQL RLS (Tutela Segreto Medico GDPR Art. 9):** i referti clinici salvati nei preferiti di team sono visibili ESCLUSIVAMENTE allo Staff Medico, scomparendo silenziosamente per preparatori e atleti senza divulgazione di esistenza.
- **Riferimenti Architetturali:** `18-software-3-flow-6c-medical-room-research-silo3.md`, `MASTER-FLOWCHART-REGISTRY.md` (#18), `00-GLOSSARIO-TERMINI-TECNICI.md#doppio-livello-preferiti-personali-vs-team-staff-pinning`.
- **File Target in `src/`:**
  - `src/features/favorites/TeamPinningSection.tsx` (Bacheca documenti e routine fissate in evidenza per tutta la squadra)
  - `src/features/favorites/LtreeFolderTreeView.tsx` (Navigatore ad albero gerarchico annidato `ltree`)
  - `src/features/favorites/HybridSearchBar.tsx` (Barra ricerca ibrida testuale e semantica)
  - `src/features/favorites/MedicalSecretRlsFilter.ts` (Filtro silenzioso client-side per segregazione segreto medico)
- **Strategia & Strumenti:** Skills: `client-server-ip-isolation`, `sports-science-biometrics-guard`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Salvataggio su Silo 2 Bunker KMS. Nessun errore o trapelamento di metadati clinici a utenti non autorizzati.
- **Criteri di Accettazione & Collaudo:** Simulando il ruolo Preparatore, i referti medici salvati scompaiono silenziosamente. `py test_check.py` superato.

---

## MACRO-SEZIONE 10: Diario Nutrizione e Stile di Vita (Colonna 7 / Flow NUT-1A, 2B, 3C)

### [ ] TASK-036: Consumer Body Metrics & Educational Nutritional Guides (FLOW-NUT-1A #23 - Tier 1)
- **Dipendenze:** Richiede: `TASK-001`, `TASK-009`.
- **Descrizione & Obiettivo Funzionale:** Implementazione del diario nutrizionale di base per utenti amatoriali:
  - Monitoraggio cronologico del peso corporeo e delle circonferenze (vita, fianchi, braccia, cosce) con grafici evolutivi;
  - Modelli di educazione alimentare pre-confezionati con filtri per sport e regime alimentare (onnivoro, vegetariano, vegano);
  - Calcolatori manuali del fabbisogno calorico basale BMR (formule validate Mifflin-St Jeor e Harris-Benedict) e calcolo TDEE;
  - Test del tasso di sudorazione pre/post seduta con calcolo liquidi di reintegro ($1.5 \times \text{peso perso}$ in litri);
  - Guida scientifica agli integratori con classificazione oggettiva ISSN / AIS (Gruppi A, B, C, D);
  - Esportazione PDF statica in sola lettura; vincoli Tier 1: **Zero AI, Zero Wearable, nessun legame con Programmazione o Data Analisi**.
- **Riferimenti Architetturali:** `23-software-1-flow-nut-1a-consumer-nutrition.md`, `MASTER-FLOWCHART-REGISTRY.md` (#23), `00-GLOSSARIO-TERMINI-TECNICI.md#diario-nutrizione-e-stile-di-vita`.
- **File Target in `src/`:**
  - `src/features/nutrition/BodyMetricsTracker.tsx` (Tabella e grafici evolutivi di peso e circonferenze)
  - `src/features/nutrition/NutritionalGuideCard.tsx` (Schede educative alimentari pre-confezionate)
  - `src/features/nutrition/BmrCaloricCalculator.ts` (Calcolatore BMR e TDEE deterministico)
  - `src/features/nutrition/HydrationSweatCalculator.ts` (Calcolatore tasso di sudorazione e reintegro idrico)
  - `src/features/nutrition/SupplementsEvidenceGuide.tsx` (Prontuario integratori con tassonomia AIS A-D)
  - `src/features/nutrition/NutritionView.tsx` (Vista master modulo Nutrizione)
  - `src/features/nutrition/index.ts` (Barrel file nutrizione)
- **Strategia & Strumenti:** Skills: `sports-science-biometrics-guard`, `app-navigation-integrator`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Salvataggio su Silo 1 Consumer. Nessuna comunicazione con altri moduli.
- **Criteri di Accettazione & Collaudo:** Calcolo idratazione e BMR verificati matematicamente. `py test_check.py` superato.

### [ ] TASK-037: Pro Clinical vs Coach Nutrition & Body Composition BIA (FLOW-NUT-2B #24 - Tier 2)
- **Dipendenze:** Richiede: `TASK-012`, `TASK-036`.
- **Descrizione & Obiettivo Funzionale:** Implementazione della nutrizione professionale con tutela legale (Art. 348 c.p. e Legge 3/2018):
  - **Split di Ruolo Legale:** sblocco automatico editor diete cliniche grammate per professionisti sanitari abilitati (Biologo Nutrizionista, Dietista, Medico), o attivazione della modalità protetta di Educazione Alimentare e Timing Energetico per Preparatori Atletici e Personal Trainer;
  - Studio completo della composizione corporea: plicometria Jackson-Pollock a 3 e 7 pliche, bioimpedenziometria convenzionale e vettoriale (BIVA) con ellissi di tolleranza R-Xc, massa grassa FM e massa magra FFM;
  - Questionario anamnestico nutrizionale completo (storia ponderale, allergie certificate, intolleranze);
  - Pianificazione multi-giorno tarata sui grammi proteici per kg di massa magra reale ($g/\text{kg FFM}$) su giornate tipo (Rest, Medium, High Load);
  - Filtro sicurezza integratori con blocco orario caffeina (curfew ore 16:00);
  - Importazione dispendio calorico limitata **esclusivamente a wearable a marchio T7**;
  - Esportazione multi-formato con Excel (.xlsx sbloccato `protected: false`).
- **Riferimenti Architetturali:** `24-software-2-flow-nut-2b-pro-nutrition.md`, `MASTER-FLOWCHART-REGISTRY.md` (#24), `00-GLOSSARIO-TERMINI-TECNICI.md#tutela-legale-nutrizione-legge-3-2018-art-348-c-p`.
- **File Target in `src/`:**
  - `src/features/nutrition/LegalRoleGatekeeper.tsx` (Gatekeeper che commuta tra Dieta Clinica Grammata ed Educazione Alimentare Coach)
  - `src/features/nutrition/BodyCompositionBiaView.tsx` (Modulo plicometria Jackson-Pollock e grafici BIVA vettoriale R-Xc)
  - `src/features/nutrition/FfmMealPlanner.tsx` (Pianificatore pasti FFM-based su giornate tipo con timing peri-workout)
  - `src/features/nutrition/SupplementSafetyFilter.ts` (Validatore dosaggi e blocco orario caffeina post 16:00)
- **Strategia & Strumenti:** Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`. Regole: 01, 02, 05.
- **Vincoli di Sicurezza & Isolamento:** Salvataggio su Silo 1 Pro. Se il profilo è Preparatore, blocco prescrizione grammata rigida.
- **Criteri di Accettazione & Collaudo:** Verifica split di ruolo legale; calcolo BIVA corretto; export XLSX sbloccato. `py test_check.py` superato.

### [ ] TASK-038: Dynamic Team Periodization, EA/REDs & Doping Batch Verification (FLOW-NUT-3C #25 - Tier 3)
- **Dipendenze:** Richiede: `TASK-013`, `TASK-022`, `TASK-037`.
- **Descrizione & Obiettivo Funzionale:** Implementazione della nutrizione dinamica d'élite per club professionistici:
  - *Interconnessione Totale Ecosistema (All-in-One):* Collegamento bidirezionale con microcicli MD-X (#15) e telemetria GPS (#16), adattando automaticamente apporto glucidico e timing in base ai km percorsi;
  - Sincronizzazione della massa magra FFM con i parametri di potenza relativa (Watt/kg) in Data Analisi;
  - **Monitoraggio Continuo Energy Availability (EA):** calcolo continuo $EA = \frac{EI - EEE}{FFM}$ in $\text{kcal/kg FFM/die}$ con semaforo prevenzione sindrome REDs ($<30$ allarme rosso);
  - **Red Flags Cliniche Human-in-the-Loop:** blocco immediato degli adattamenti automatici su cali ponderali repentini, disidratazione o amenorrea, con alert prioritized a Medico Sociale e Nutrizionista;
  - **Verifica Antidoping per Lotto (Batch ID):** controllo API su database ufficiali (Informed Sport / Cologne List) per certificazione lotti integratori;
  - Chatbot nutrizionale RAG 24/7 con clonazione dello stile e dei protocolli del nutrizionista di squadra per pasti fuori sede.
- **Riferimenti Architetturali:** `25-software-3-flow-nut-3c-elite-nutrition.md`, `MASTER-FLOWCHART-REGISTRY.md` (#25), `00-GLOSSARIO-TERMINI-TECNICI.md#energy-availability-ea-sindrome-reds`.
- **File Target in `src/`:**
  - `src/features/nutrition/DynamicEnergyAvailabilityEngine.ts` (Calcolo continuo EA e semaforo prevenzione REDs)
  - `src/features/nutrition/RedFlagsHumanInTheLoopModal.tsx` (Modale di blocco clinico Human-in-the-Loop con alert medico)
  - `src/features/nutrition/DopingBatchVerifier.ts` (Validatore conformità lotti integratori contro database antidoping)
  - `src/features/nutrition/NutritionalRagChatbot.tsx` (Assistente nutrizionale 24/7 sincronizzato con il bunker RAG del club)
  - `src/features/nutrition/MdxNutritionSync.ts` (Connettore carichi GPS microciclo $\leftrightarrow$ fabbisogno glucidico)
- **Strategia & Strumenti:** Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`. Regole: 01, 02 (costante `EA_RED_FLAG_THRESHOLD = 30.0;`).
- **Vincoli di Sicurezza & Isolamento:** Salvataggio su Silo 2 Bunker KMS. Alert automatico al personale medico in caso di EA $<30$.
- **Criteri di Accettazione & Collaudo:** Trigger corretto allarme REDs; verifica lotto antidoping. `py test_check.py` superato.

---

## MACRO-SEZIONE 11: Profilo Personale, Hub Dispositivi, Monetizzazione & Bridges (Layer 8)

### [ ] TASK-039: Profilo Personale Utente, Dossier Salute & App Switcher 3-in-1 Bridge
- **Dipendenze:** Richiede: `TASK-010`, `TASK-011`, `TASK-014`.
- **Descrizione & Obiettivo Funzionale:** Implementazione dell'area personale dell'utente loggato:
  - *Mio Storico Allenamenti & Card T7:* Archivio cronologico delle sessioni completate e delle Card Certificate T7 con filtri e statistiche personali;
  - *Mio Dossier Salute & Anamnesi Personale:* Sezione riservata per consultazione referti medici, esami del sangue, certificato medico e piani nutrizionali/terapeutici (punto di convergenza in cui atterra anche il lavoratore che proviene da Movely via Single Sign-On);
  - *App Switcher "3-in-1" Bridge (Fase 1):* Selettore di navigazione concettuale per passare con 1 click tra T7 Workout, Movely (welfare) e Together (community) con gestione dello stato SSO e informativa di transizione.
- **Riferimenti Architetturali:** Master Flowchart (Livello 3: Profilo Personale Utente & App Switcher), `00-GLOSSARIO-TERMINI-TECNICI.md#app-switcher-3-in-1-fase-1-bridge`.
- **File Target in `src/`:**
  - `src/features/profile/UserProfileView.tsx` (Vista master profilo personale)
  - `src/features/profile/PersonalWorkoutHistory.tsx` (Archivio personale sessioni con badge Card T7)
  - `src/features/profile/HealthDossierSection.tsx` (Dossier salute personale conforme a GDPR Art. 9)
  - `src/features/profile/AppSwitcherBridgeModal.tsx` (Modale switch rapido verso Movely e Together Social)
  - `src/features/profile/index.ts` (Barrel file modulo profilo)
- **Strategia & Strumenti:** Skills: `app-navigation-integrator`, `client-server-ip-isolation`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Dati sanitari del Dossier Salute protetti da cifratura at-rest e accessibili solo con credenziali personali.
- **Criteri di Accettazione & Collaudo:** Visualizzazione corretta storico e dossier salute; switch 3-in-1 funzionante. `py test_check.py` superato.

### [ ] TASK-040: Device Manager Hub & Hardware Telemetry Matrix
- **Dipendenze:** Richiede: `TASK-006`, `TASK-025`, `TASK-028`.
- **Descrizione & Obiettivo Funzionale:** Implementazione dell'hub unificato di gestione hardware e sensoristica da campo:
  - Scansione, accoppiamento Web Bluetooth e monitoraggio stato batteria e latenza di tutti i sensori;
  - Applicazione rigorosa della matrice di feature gating hardware:
    - *Tier 1 Consumer:* Zero wearable collegabili (interfaccia disabilitata con messaggio di gating);
    - *Tier 2 Pro P.IVA:* Connessione consentita **esclusivamente a wearable proprietari a marchio T7** (rifiuto dispositivi terzi);
    - *Tier 3 Elite Club:* Connessione universale (Any-Device: Vitruve, GymAware, Polar H10, Garmin, Catapult, pedane Kistler/Hawkin);
  - Diagnostica di trasmissione real-time e log dei pacchetti telemetrici conforme ad ADR-03.
- **Riferimenti Architetturali:** Master Flowchart (Hub Dispositivi e Integrazioni), `00-GLOSSARIO-TERMINI-TECNICI.md#device-manager-hub-dispositivi`.
- **File Target in `src/`:**
  - `src/features/devices/DeviceManagerView.tsx` (Vista master pannello gestione dispositivi)
  - `src/features/devices/DeviceScannerModal.tsx` (Modale scansione BLE con filtri vendor ID in base al Tier)
  - `src/features/devices/DeviceTelemetryDiagnostics.tsx` (Pannello telemetria live con frame rate, jitter e pacchetti persi)
  - `src/features/devices/index.ts` (Barrel file device manager)
- **Strategia & Strumenti:** Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Blocco accoppiamento sensori terzi in Tier 1 e Tier 2. Normalizzazione metrologica conforme ad ADR-03.
- **Criteri di Accettazione & Collaudo:** Verifica gating hardware per ciascun Tier; diagnostica BLE funzionante. `py test_check.py` superato.

### [ ] TASK-041: Pannello Abbonamenti, Token AI Manager, Store T7 & Pubblicità Tier-Gated
- **Dipendenze:** Richiede: `TASK-004`, `TASK-039`.
- **Descrizione & Obiettivo Funzionale:** Implementazione della sezione amministrativa, economica e pubblicitaria:
  - *Gestione Abbonamento:* Visualizzazione piano attivo (Tier 1/2/3), upgrade immediato e gestione fatturazione;
  - *Token AI Manager (Tier 2):* Contatore reattivo dei Token AI consumati e residui per inferenza al 70%, con ricarica pacchetti aggiuntivi;
  - *Portafoglio Token Premio:* Visualizzazione crediti/token guadagnati come volontario di ricerca per sblocco mesi gratuiti;
  - *Store Ufficiale T7:* Vetrina prodotti per l'acquisto dell'hardware wearable proprietario a marchio T7;
  - *Gestione Pubblicità Tier-Gated:* Componente banner pubblicitario condizionale: annunci sportivi contestuali visibili solo in Tier 1 Consumer, annunci tecnici selezionati in Tier 2 Pro, e **totale rimozione delle pubblicità (Zero Ads)** in Tier 3 Elite.
- **Riferimenti Architetturali:** Master Flowchart (Pannello Abbonamenti, Token e Store / Gestione Pubblicità), `00-GLOSSARIO-TERMINI-TECNICI.md#gestione-pubblicita-tier-gated`.
- **File Target in `src/`:**
  - `src/features/monetization/SubscriptionsPanelView.tsx` (Pannello gestione abbonamento e switch di fascia)
  - `src/features/monetization/AiTokenUsageMeter.tsx` (Contatore visuale consumo token AI per Tier 2)
  - `src/features/monetization/T7HardwareStoreSection.tsx` (Vetrina e-commerce per acquisto bracciale wearable T7)
  - `src/features/monetization/TierGatedAdBanner.tsx` (Slot pubblicitario reattivo condizionato dal Tier attivo)
  - `src/features/monetization/index.ts` (Barrel file monetizzazione)
- **Strategia & Strumenti:** Skills: `client-server-ip-isolation`, `app-navigation-integrator`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** In Tier 3 il componente `TierGatedAdBanner` non renderizza alcun elemento DOM.
- **Criteri di Accettazione & Collaudo:** Verifica scomparsa banner pubblicitari in Tier 3; contatore token funzionante. `py test_check.py` superato.

### [ ] TASK-042: Persistent Floating FAB Chatbot AI 24/7 (Tier 3 ONLY)
- **Dipendenze:** Richiede: `TASK-022`, `TASK-029`, `TASK-038`.
- **Descrizione & Obiettivo Funzionale:** Implementazione dell'assistente intelligente globale flottante riservato a club d'élite:
  - Pulsante Flottante (Floating Action Button - FAB) sempre visibile in basso a destra sopra le sezioni *Catalogo*, *Programmazione*, *Libreria Fonti* e *Nutrizione*;
  - Drawer di chat interattivo 24/7 con animazione fluida GPU-accelerated;
  - Addestramento contestuale via RAG sul singolo atleta selezionato, sullo stile metodologico del coach e sui protocolli del club;
  - Risposta in tempo reale a domande su esecuzione esercizi, varianti sicure per atleti infortunati e consigli nutrizionali peri-workout fuori sede.
- **Riferimenti Architetturali:** Master Flowchart (Pulsante Flottante Solo Tier 3 Chatbot AI 24/7), `00-GLOSSARIO-TERMINI-TECNICI.md`.
- **File Target in `src/`:**
  - `src/features/chatbot/FloatingAiChatbotFab.tsx` (Pulsante FAB flottante con badge animato)
  - `src/features/chatbot/GlobalAiChatbotDrawer.tsx` (Drawer di chat contestuale con streaming testo)
  - `src/features/chatbot/useGlobalChatbot.ts` (Hook per gestione messaggi e iniezione contesto atleta/modulo)
  - `src/features/chatbot/index.ts` (Barrel file chatbot)
- **Strategia & Strumenti:** Skills: `client-server-ip-isolation`, `app-navigation-integrator`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Esclusiva Tier 3 (il pulsante FAB non viene renderizzato in Tier 1 o Tier 2).
- **Criteri di Accettazione & Collaudo:** Verifica comparsa FAB solo in Tier 3; apertura e chiusura drawer responsive. `py test_check.py` superato.

---

## MACRO-SEZIONE 12: Integration, Service Worker PWA & System Certification (Layer 9)

### [ ] TASK-043: Global App Integration & Lazy Routing
- **Dipendenze:** Richiede: `TASK-008`, `TASK-010`, `TASK-014`, `TASK-016`, `TASK-017`, `TASK-020`, `TASK-024`, `TASK-030`, `TASK-033`, `TASK-036`, `TASK-039`, `TASK-040`, `TASK-041`, `TASK-042`.
- **Descrizione & Obiettivo Funzionale:** Aggiornamento architetturale di `src/App.tsx` e `src/main.tsx` per orchestrare tutti i moduli core della piattaforma:
  - Montaggio coordinato dei Provider globali (`TierProvider`, `AthleteProvider`, `BleProvider`);
  - Routing reattivo History API / hash URL a 7+ macro-sezioni:
    1. *Home / Control Room* (`#home` / `#control-room`)
    2. *Catalogo 3D* (`#catalogo`)
    3. *Programmazione & Player* (`#programmazione`)
    4. *Data Analisi & Biomeccanica* (`#analisi`)
    5. *Libreria Fonti* (`#fonti`)
    6. *Preferiti* (`#preferiti`)
    7. *Diario Nutrizione* (`#nutrizione`)
    8. *Roster & Clinica* (`#roster`)
    9. *Calendario* (`#calendario`)
    10. *Profilo & Impostazioni* (`#profilo`)
  - Sub-navigazione desktop fluida e Bottom Navigation mobile a icone SVG native;
  - Integrazione persistente del Floating FAB Chatbot AI per Tier 3 e slot pubblicitari condizionali.
- **Riferimenti Architetturali:** `CAPITOLATO_TECNICO_SOFTWARE_HOUSE.md` (Sez. 4), `apple-navigation-design-system.md`.
- **File Target in `src/`:**
  - `src/App.tsx` (Orchestrazione completa viste e router modulare)
  - `src/main.tsx` (Root rendering con ErrorBoundary e provider)
- **Strategia & Strumenti:** Skills: `app-navigation-integrator`. Regole: 01, 02.
- **Vincoli di Sicurezza & Isolamento:** Nessuna perdita di stato nel cambio vista; rispetto rigoroso dei permessi di Tier.
- **Criteri di Accettazione & Collaudo:** Navigazione fluida tra tutti i moduli con aggiornamento URL hash. `py test_check.py` e `npm run typecheck` superati con 0 errori.

### [ ] TASK-044: Service Worker Cache Lifecycle & Offline PWA Assets
- **Dipendenze:** Richiede: `TASK-043`.
- **Descrizione & Obiettivo Funzionale:** Aggiornamento del Service Worker `sw.js` per il rilascio di produzione:
  - Incremento controllato della versione di cache (es. da `v125` a nuova versione);
  - Aggiornamento della lista degli asset precacheati in `CORE_ASSETS` (inclusi modelli 3D base, icone e fogli di stile);
  - Verifica della strategia cache-first per asset statici e network-first con fallback offline per API;
  - Funzionamento completo offline per il Workout Player e per l'Area Studio locale su IndexedDB;
  - Validazione manifest per l'installabilità PWA come app autonoma su iOS/iPadOS, Android e Desktop.
- **Riferimenti Architetturali:** Regola 01 (aggiornamento cache per rilasci), `00-GLOSSARIO-TERMINI-TECNICI.md#service-worker-offline-first-cache-storage-api`.
- **File Target in `src/` e root:**
  - `sw.js` (Incremento cache version e aggiornamento asset manifest)
  - `index.html` (Verifica meta tag PWA, theme-color e viewport)
- **Strategia & Strumenti:** Skills: `project-skill-policy`. Regole: 01.
- **Vincoli di Sicurezza & Isolamento:** Bypass del service worker su localhost in sviluppo.
- **Criteri di Accettazione & Collaudo:** Test di installabilità PWA ed esecuzione offline verificata in `py test_check.py`.

### [ ] TASK-045: End-to-End Metrological & Architectural Audit
- **Dipendenze:** Richiede: Tutte le task da `TASK-001` a `TASK-044`.
- **Descrizione & Obiettivo Funzionale:** Collaudo sistemico finale di certificazione dell'intera piattaforma T7 Workout:
  - *Audit Metrologico Inviolabile:* Verifica di tutte le grandezze fisiche a schermo (Forza in N, Potenza in W, Velocità in m/s, Carico in kg, Distanza in m, Angoli in °, Tempo in s/ms);
  - *Certificazione Anti-Anomalie:* Garanzia di zero valori `NaN`, `Infinity` o `undefined` sia nei calcoli che nel DOM;
  - *Verifica Conformità ADR-01 (Thin Client):* Nessun algoritmo proprietario o pesatura segreta esposta nel bundle client;
  - *Verifica Riservatezza Silos:* Isolamento garantito tra Silo 1 Consumer, Silo 1 Pro e Silo 2 Bunker KMS;
  - *Esecuzione Suite di Validazione:* Esecuzione integrale di `py test_check.py` e `npm run typecheck` con successo al 100%.
- **Riferimenti Architetturali:** `CAPITOLATO_TECNICO_SOFTWARE_HOUSE.md` (Sez. 6), `00-MASTER-EXECUTION-PLAN.md`, `metrology_ui_ux_benchmark.md`.
- **File Target in `src/`:**
  - Audit completo dell'intero albero `src/`, `tests/` e configurazioni di build.
- **Strategia & Strumenti:** Skills: `sports-science-biometrics-guard`, `client-server-ip-isolation`, `react-ts-reverse-architect`. Regole: 01, 02, 03, 04, 05, 06, 08.
- **Vincoli di Sicurezza & Isolamento:** 100% test superati, 0 errori TypeScript strict, 0 regressioni sul catalogo esercizi, patologie e fonti.
- **Criteri di Accettazione & Collaudo:** Validazione con esito positivo su tutte le 14+ suite di `py test_check.py`.

---

## LOG DI AVANZAMENTO & SPRINT TRACKING

| Data | Task ID | Descrizione Operativa | Esito Test | Commit Hash | Note di Rilascio |
| :---: | :---: | :--- | :---: | :---: | :--- |
| 2026-11-22 | **FASE 1** | Redazione Ufficiale Master Implementation Roadmap | Superato (100%) | `c9725f0` | Definizione sequenza atomica di task architetturali |
| 2026-11-22 | **TASK-001** | Core Domain Types & SI Units Expansion | Superato (100%) | `f14924d` | Implementazione types strict: tier, physics (SI), athlete, device, readiness, nutrition, index |
| 2026-11-22 | **TASK-002** | Metrological Validator & SI Guard | Superato (100%) | `d24a468` | Validatori SI, sanitizzazione hot-path, formatter ergonomico anti-jittering e test suite |
| 2026-11-22 | **TASK-003** | Offline Storage Engine & IndexedDB Wrapper | Superato (100%) | `e0a7b8e` | Storage engine 4 store, in-memory fallback, sync queue con idempotenza, zombie recovery e test |
| 2026-11-22 | **TASK-004** | Tier & RBAC Context Provider | Superato (100%) | `5f4d969` | React Context e Hook useTier per Tier 1/2/3, RBAC, GDPR Art. 9, Art. 348 c.p., silo resolution e test suite |
| 2026-11-22 | **TASK-005** | Global Athlete & Squad Context Provider | Superato (100%) | `b5e4592` | React Context e Hook useAthleteContext per Selettore Atleta/Squadra a 2-click, Tier 1 single mode e test suite |
| 2026-11-22 | **TASK-006** | Hardware & BLE Telemetry Context Provider | Superato (100%) | `b90b6d5` | React Context e Hook useBle per sensoristica BLE, Web Bluetooth API, simulatore 10 Hz e test suite |
| 2026-11-22 | **TASK-007** | Apple-Inspired Global Navigation Shell | Superato (100%) | `715347e` | Layout master glassmorphism Apple Dark Cockpit: GlobalHeader, ContextSelectorDropdown a 2-click, TierBadgeSwitcher, BleStatusPill e test suite |
| 2026-11-28 | **CONSOLIDATION** | Consolidation & Bugfix Sprint (TASK-001..007) | Superato (100%) | `faece7b` | Audit multi-agente Wave 1-3: fix UUID GATT, metrologia SI, IndexedDB/SyncQueue, RBAC/Art. 348 c.p., AthleteContext, BleContext, Shell WAI-ARIA, root wiring in App.tsx e tsconfig.test.json |
| 2026-11-28 | **TASK-008** | Adaptive Multi-Tier Navigation Bars | Superato (100%) | `faece7b` | Sub-navigazione desktop a 6 schede con contatore badge e bottom-nav mobile touch-friendly integrata in App.tsx |
| 2026-11-28 | **RE-ARCHITECT** | Revisione Totale Roadmap & Benchmark Kinepose (TASK-009..045) | Superato (100%) | *In Corso* | Refactoring totale Roadmap su 45 Task Prompt-Ready, allineamento Glossario (197 termini) e dossier UI/UX video biomeccanica |
| 2026-11-28 | **TASK-009** | Standard 4-State UI Infrastructure | Superato (100%) | `ae92dbc` | EmptyState (checklist interattiva), LoadingSkeleton (GPU translate3d + progressbar), ErrorFallback (exponential backoff + offline), ViewStateContainer, SW v127 e tests/ui-states.test.ts |
| 2026-11-28 | **TASK-010** | Home Dashboard & Control Room Cockpit | Superato (100%) | `in progress` | ControlRoomView con ViewStateContainer, DailyWorkoutCard (kg/min/RTP), CertifiedT7CardsHistory (filtro privacy share), MicrocycleCalendarWidget, TeamHealthAlertsBanner (Tier 3 staff + ACWR > 1.50) e tests/home-control-room.test.ts |
