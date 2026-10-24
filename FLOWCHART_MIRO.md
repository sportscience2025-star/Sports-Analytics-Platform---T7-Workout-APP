# Flowchart Ufficiale dell'Architettura T7 Workout (Miro)

Questo documento traccia e collega il diagramma visuale completo dell'ecosistema **T7 Workout** realizzato sulla piattaforma online Miro.

## Link Diretto alla Board Miro
- **Board URL**: [FITNESS APP FLOWCHART](https://miro.com/app/board/uXjVEbo6L2o=)
- **ID Board**: `uXjVEbo6L2o=`
- **Stile Visivo**: Design ad alto contrasto conforme ISO 5807 (sfondi categorizzati per corsia, testo scuro `#0f172a`, bordi colorati netti, connettori smart con etichette chiare).

---

## Architettura Multi-Software a 18 Flowchart (3 Prodotti $\times$ 6 Pilastri)

La board online è organizzata in una matrice ortogonale cartesiana con una colonna introduttiva (**Zona 0**) e 3 macro-righe orizzontali corrispondenti ai **3 Software distinti per 3 mercati target differenti**, sviluppati lungo i medesimi **6 Pilastri Funzionali**:

```
[ ZONA 0: Living Glossary & RBAC Matrix (X: -2600, Y: 5200) ]

RIGA 1 (Y = 2600): SOFTWARE 1 — CONSUMER EDITION (B2C)
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│  Flow 1A     │  Flow 2A     │  Flow 3A     │  Flow 4A     │  Flow 5A     │  Flow 6A     │
│  Onboarding  │  Cockpit     │  Workout     │  Wearables   │  Social B2C  │  Desk-Care   │
│  X: 0        │  X: 2200     │  X: 4400     │  X: 6600     │  X: 8800     │  X: 11000    │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘

RIGA 2 (Y = 5200): SOFTWARE 2 — PRO / SPECIALIST EDITION (B2B P.IVA)
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│  Flow 1B     │  Flow 2B     │  Flow 3B     │  Flow 4B     │  Flow 5B     │  Flow 6B     │
│  Onboarding  │  Coach Hub   │  Macrocicli  │  VBT & PAP   │  Pro Biz     │  Physio Rehab│
│  X: 0        │  X: 2200     │  X: 4400     │  X: 6600     │  X: 8800     │  X: 11000    │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘

RIGA 3 (Y = 7800): SOFTWARE 3 — ELITE CLUB & RESEARCH (B2B ENTERPRISE)
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│  Flow 1C     │  Flow 2C     │  Flow 3C     │  Flow 4C     │  Flow 5C     │  Flow 6C     │
│  Bunker Auth │  Team Staff  │  MD-X Squad  │  GPS Z-Score │  Tactical CV │  Medical EMR │
│  X: 0        │  X: 2200     │  X: 4400     │  X: 6600     │  X: 8800     │  X: 11000    │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## Standard a 4 Corsie (Swimlanes ISO 5807)

Ciascuno dei 18 flowchart è suddiviso verticalmente in 4 corsie architetturali standardizzate:
1. **Lane 1: Thin Client UI/UX Layer** (`#f0f9ff` / `#0284c7`): Interfaccia utente PWA / Mobile, form reattivi, player di allenamento, grafici Chart.js e canvas interattivi.
2. **Lane 2: API Gateway & Feature Gating** (`#faf5ff` / `#7c3aed`): Autenticazione, validazione WebAuthn/OAuth, rate-limiting, controllo quote e claim JWT (Ruoli R1..R8, Tier 1..3).
3. **Lane 3: Server Black Box / IP Algorithms** (`#ecfdf5` / `#059669`): Motori di calcolo biomeccanico proprietario, regressione ibrida VBT, triage clinico 119 patologie, ACWR EWMA, Z-Score rolling 28gg e pipeline Computer Vision.
4. **Lane 4: Multi-Tenant Database Layer** (`#fff1f2` / `#e11d48`): Segregazione in 3 Silos:
   - **Silo 1**: Dati relazionali, profili utenti, anagrafiche P.IVA e social.
   - **Silo 2**: Bunker KMS crittografato AES-256-GCM isolato per i club professionistici.
   - **Silo 3**: Research Data Warehouse anonimizzato per la ricerca scientifica.

---

## Indice Dettagliato dei 18 Flowchart

### Software 1: Consumer Edition (B2C - Amatori & Sportivi)
- **Flow 1A: Fast Consumer Onboarding (30s)**:
  - Accesso rapido biometrico (Passkey FIDO2) o Social (Apple/Google). Zero attriti, nessuna richiesta di Codice Fiscale, anamnesi clinica differita al primo workout (Just-in-Time). Emissione JWT Tier 1 e scrittura su Silo 1.
  - File sorgente: [flow-1a-consumer-onboarding.mmd](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-1-consumer-b2c/flow-1a-consumer-onboarding.mmd)
- **Flow 2A: Personal Athlete Cockpit & Diary**:
  - Home dashboard personale con scheda allenamento odierna, calcolo readiness giornaliera (RPE + sonno), contatore streak di costanza e calendario storico mensile.
  - File sorgente: [flow-2a-personal-cockpit.mmd](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-1-consumer-b2c/flow-2a-personal-cockpit.mmd)
- **Flow 3A: Interactive Workout Player & Logging**:
  - Esecuzione interattiva dell'allenamento con target serie/reps/kg, countdown timer di recupero con beep e vibrazione, salvataggio locale IndexedDB offline-first e calcolo automatico volume totale e record personali (PR).
  - File sorgente: [flow-3a-workout-player.mmd](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-1-consumer-b2c/flow-3a-workout-player.mmd)
- **Flow 4A: Wearable Health Sync & Trends**:
  - Connessione con Apple HealthKit / Google Health Connect. Aggregazione sonno, passi e frequenza cardiaca a riposo con correlazione sul carico di allenamento.
  - File sorgente: [flow-4a-wearable-sync.mmd](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-1-consumer-b2c/flow-4a-wearable-sync.mmd)
- **Flow 5A: Together Social Community & Coach Marketplace**:
  - Feed social per condivisione record PR, badge di traguardo e commenti con moderazione anti-spam. Sezione Marketplace per ingaggiare Personal Trainer certificati.
  - File sorgente: [flow-5a-together-social-b2c.mmd](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-1-consumer-b2c/flow-5a-together-social-b2c.mmd)
- **Flow 6A: Movely Desk-Care & Active Micro-Pauses**:
  - Rilevamento sedentarieta lavorativa (>50 min), notifica micro-pause attive di 2 minuti con esercizi mirati di scarico posturale per cervicale, spalle e lombare.
  - File sorgente: [flow-6a-movely-desk-care.mmd](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-1-consumer-b2c/flow-6a-movely-desk-care.mmd)

---

### Software 2: Pro Specialist Edition (B2B - Partite IVA / Coach / Fisioterapisti)
- **Flow 1B: Professional Onboarding & Stripe Connect**:
  - Onboarding professionale con validazione P.IVA (VIES/AdE), verifica certificazioni/albo, setup conto incassi Stripe Connect per pagamenti clienti e personalizzazione branding dello studio.
  - File sorgente: [flow-1b-pro-onboarding.mmd](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-2-pro-b2b/flow-1b-pro-onboarding.mmd)
- **Flow 2B: Coach Multi-Athlete Roster & Adherence Hub**:
  - Gestione del parco clienti/atleti con indice di aderenza percentuale, allarmi clinici per dolori o RPE elevato imprevisto e inviti atleti con token sicuro.
  - File sorgente: [flow-2b-coach-hub.mmd](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-2-pro-b2b/flow-2b-coach-hub.mmd)
- **Flow 3B: AI Macrocycle Generator with 119 Clinical Triage**:
  - Generatore di programmazione avanzata a 5 fasi con triage automatico delle 119 patologie cliniche, modelli DUP 12-16 settimane ed esportazione della scheda in Excel `.xlsx` non protetto e PDF.
  - File sorgente: [flow-3b-macrocycle-ai-triage119.mmd](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-2-pro-b2b/flow-3b-macrocycle-ai-triage119.mmd)
- **Flow 4B: Biomechanical VBT & PAP Jump Analysis**:
  - Connessione Web Bluetooth con encoder lineare (Vitruve BLE) o pedana salti. Filtraggio outlier MAD, regressione ibrida VBT con selezione automatica AIC/$R^2_{adj}$, stima 1RM con IC 95% e statistica PAP con Minimal Detectable Change (MDC 95%).
  - File sorgente: [flow-4b-vbt-pap-biomechanics.mmd](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-2-pro-b2b/flow-4b-vbt-pap-biomechanics.mmd)
- **Flow 5B: Together Pro Business & Remote Client Review**:
  - Vetrina pubblica del professionista con pacchetti di coaching e gestione lead in entrata. Player di revisione video asincrona con tool per disegnare angoli articolari ed evidenziare cues tecnici.
  - File sorgente: [flow-5b-together-pro-business.mmd](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-2-pro-b2b/flow-5b-together-pro-business.mmd)
- **Flow 6B: Physio Rehab Protocols & ROM Tracking**:
  - Modulo sanitario fisioterapico con protocolli specifici `cli_01`..`cli_32` (LCA, spalla, colonna), misurazione ROM goniometrica, monitoraggio dolore su scala VAS con allarme di de-escalation automatica se VAS > 4.
  - File sorgente: [flow-6b-physio-rehab-rom.mmd](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-2-pro-b2b/flow-6b-physio-rehab-rom.mmd)

---

### Software 3: Elite Club & Research (B2B Enterprise - Squadre Professionistiche)
- **Flow 1C: Bunker Club Onboarding & KMS Silo 2 Enclave**:
  - Accesso blindato per società di Serie A / Leghe Pro tramite Magic Link o QR biometrico generato dal Medico Sociale nel Bunker KMS, certificati mTLS, IP whitelist societaria e crittografia AES-256 a riposo.
  - File sorgente: [flow-1c-bunker-onboarding-kms.mmd](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-3-elite-club-enterprise/flow-1c-bunker-onboarding-kms.mmd)
- **Flow 2C: Multi-Staff Squad Cockpit & Role Segregation**:
  - Cockpit unificato con proiezioni di vista segregate per ruolo (Vista Tattica per Allenatore, Vista Carichi per Preparatore, Cartella Clinica per Medico Sociale, Vista Video per Match Analyst), con oscuramento automatico dei dati sanitari al personale non medico.
  - File sorgente: [flow-2c-multi-staff-cockpit.mmd](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-3-elite-club-enterprise/flow-2c-multi-staff-cockpit.mmd)
- **Flow 3C: Squad Microcycle Planning & Match Day Loads (MD-X -> MD+X)**:
  - Pianificazione del microciclo settimanale di squadra orientato alla partita, compensazione carichi per i panchinari non impiegati, gestione del doppio ruolo tattico e monitoraggio dell'indice ACWR tramite EWMA con soglia di allerta spike > 1.5.
  - File sorgente: [flow-3c-team-microcycle-mdx.mmd](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-3-elite-club-enterprise/flow-3c-team-microcycle-mdx.mmd)
- **Flow 4C: GPS Telemetry & Adaptive Z-Score Fatigue Profiling**:
  - Ingestion batch ad alto rendimento di dati GPS da campo (Distanza Totale, High Speed Running >19.8 km/h, Sprint >25.2 km/h). Normalizzazione con Z-Score adattivo su finestra mobile a 28 giorni e fusione con HRV cardiaco mattutino.
  - File sorgente: [flow-4c-gps-adaptive-zscore.mmd](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-3-elite-club-enterprise/flow-4c-gps-adaptive-zscore.mmd)
- **Flow 5C: Confidential Tactical Video Computer Vision**:
  - Video analisi sul campo basata su Computer Vision (YOLO e Pose Estimation). Trasformazione omografica delle coordinate sul campo 2D, diagrammi di Voronoi per il controllo degli spazi e compattezza della squadra. Riservatezza assoluta, zero canali social.
  - File sorgente: [flow-5c-tactical-video-cv.mmd](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-3-elite-club-enterprise/flow-5c-tactical-video-cv.mmd)
- **Flow 6C: Medical Room EMR & Research Warehouse (Silo 3)**:
  - Gestione della cartella clinica elettronica riservata della squadra, protocollo Return-to-Play a 6 stadi con firma digitale del Medico Sociale, e pipeline ETL di de-identificazione ($k$-anonimato $\ge 5$, $\ell$-diversità) per alimentare il data lake di ricerca universitaria in Silo 3.
  - File sorgente: [flow-6c-medical-room-research-silo3.mmd](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-3-elite-club-enterprise/flow-6c-medical-room-research-silo3.mmd)
