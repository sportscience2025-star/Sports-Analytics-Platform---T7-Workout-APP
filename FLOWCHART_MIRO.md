# Flowchart Ufficiale dell'Architettura T7 Workout (Miro)

Questo documento traccia e collega il diagramma visuale completo dell'ecosistema **T7 Workout** realizzato sulla piattaforma online Miro.

## Link Diretto alla Board Miro
- **Board URL**: [FITNESS APP FLOWCHART](https://miro.com/app/board/uXjVEbo6L2o=)
- **ID Board**: `uXjVEbo6L2o=`
- **Stile Visivo**: Design ad alto contrasto conforme agli standard della Software House (header superiori categorizzati per colore, card con bordo colorato a contrasto, losanghe decisionali, connettori smart direzionali, e struttura a 3 sotto-colonne parallele per i workflow e i moduli complessi).

---

## Architettura a 3 Righe Sovrapposte (18 Flowchart Totali)

La board online è organizzata in una griglia ortogonale su 6 colonne fisse (lungo l'asse X) disposte su 3 righe orizzontali sovrapposte:

```
RIGA 1 (Y = 350..1850): I 6 FLOWCHART ORIGINALI (PRESERVATI)
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Colonna 1    │ Colonna 2    │ Colonna 3    │ Colonna 4    │ Colonna 5    │ Colonna 6    │
│ Onboarding   │ Hub Cockpit  │ Architettura │ Workflow VBT │ Together     │ Movely       │
│ X: -2200     │ X: -800      │ X: 600       │ X: 2150      │ X: 3799      │ X: 5448      │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘

RIGA 2 (Y = 2100..3600): SOFTWARE 2 — PARTITA IVA / PRO SPECIALIST (COACH / FISIO)
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ 1. Onboarding│ 2. Coach Hub │ 3. Archit.   │ 4. Workflow  │ 5. Together  │ 6. Physio    │
│ P.IVA & Albo │ Multi-Atleta │ B2B & Silo 1 │ DUP, VBT, PAP│ Pro Business │ Rehab & ROM  │
│ X: -2200     │ X: -800      │ X: 600       │ X: 2150      │ X: 3799      │ X: 5448      │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘

RIGA 3 (Y = 3850..5350): SOFTWARE 3 — TEAM DI ALTO LIVELLO / B2B ENTERPRISE (PRO CLUBS)
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ 1. Accesso   │ 2. Cockpit   │ 3. Bunker    │ 4. Workflow  │ 5. Tactical  │ 6. Medical   │
│ Bunker KMS   │ Multi-Staff  │ Silo 2 & 3   │ MD-X, GPS, CV│ Vision Campo │ Room EMR RTP │
│ X: -2200     │ X: -800      │ X: 600       │ X: 2150      │ X: 3799      │ X: 5448      │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## Dettaglio dei 18 Flowchart sulla Board

### RIGA 1: Software 1 — Consumer B2C / Persona Comune (Top, Y = 350..1850)
1. **Colonna 1 (X = -2200)**: `1. FLUSSO ACCESSO, ONBOARDING E ANAMNESI UTENTE CASUAL (T7 CONSUMER B2C)` (Blu `#0284c7`)
   - *Header & Welcome Screen*: Portale Atleta & Onboarding Consumer (zero-friction sign-in, screening PAR-Q+ & shield anti-scam).
   - *Bivio Auth*: Account Esistente vs Nuovo Atleta.
   - *Ramo Login Multi-Canale*: 1-Tap Passkey FaceID/TouchID, Social Sign-In (Apple/Google), Email+Password $\rightarrow$ Verifica sicurezza & anomalie $\rightarrow$ Accesso confermato Silo 1.
   - *Ramo Registrazione Anti-Frode B2C (4 Step)*:
     - **Step 1**: Scudo Cloudflare Turnstile invisibile anti-scraping & 1-Tap Sign-In (blocco domini disposable).
     - **Step 2**: Parametri Fisiologici (Sesso Biologico per BMR/calorie, Altezza, Peso, Spunta 18+) $\rightarrow$ Bivio Spunta 18+ & Consensi Privacy GDPR (ramo errore blocco immediato).
     - **Step 3 (Screening Sanitario)**: Questionario PAR-Q+ (7 Red Flags cardiorespiratorie/articolari) & Clickwrap Waiver medico $\rightarrow$ Bivio Red Flags:
       - *Positivo (Red Flags)*: Avviso Medico Obbligatorio (visita consigliata, adattamento schede a Low-Impact).
       - *Negativo (Idoneo)*: Idoneità Funzionale Piena (sblocco carichi completi & VBT).
     - **Step 4**: Provisioning & Rilascio JWT Tier 1 Base $\rightarrow$ Bivio Step-Up Community:
       - *Accesso Social Together / Movely*: Step-Up SMS OTP sul cellulare per azzerare spam e troll.
       - *Solo Allenamento Locale*: Ingresso diretto al Cockpit.
   - *Ingresso Cockpit Dashboard Atleta*: Sessione attiva Silo 1 $\rightarrow$ Connessione diretta a `➔ NAVIGA ALL'HUB CENTRALE (SEZIONE 2)`.
2. **Colonna 2 (X = -800)**: `2. HUB CENTRALE (DASHBOARD COCKPIT E NAVIGAZIONE VISTE)` (Viola `#7c3aed`)
3. **Colonna 3 (X = 600)**: `3. ARCHITETTURA DI SISTEMA E DATA REPOSITORY SCIENTIFICO` (Verde `#059669`)
4. **Colonna 4 (X = 2150)**: `4. WORKFLOW FUNZIONALI ALGORITMICI (VBT, PAP, WORKOUT BUILDER)` (Arancio `#d97706`)
5. **Colonna 5 (X = 3799)**: `Together app - funzione di social network per B2B e B2C` (Giallo `#fff6b6`)
6. **Colonna 6 (X = 5448)**: `Movely - iniziativa per i corsi agli impiegati aziendali in collaborazione per le aziende` (Celeste `#c6dcff`)

---

### RIGA 2: Software 2 — Partita IVA / Pro Specialist (Middle, Y = 2100..3600)
1. **Colonna 1 (X = -2200)**: `1. ONBOARDING PROFESSIONALE & SETUP FISCALE P.IVA (T7 PRO)`
   - *Top Header & Welcome*: Portale B2B Professionisti (Personal Trainer, Chinesiologi LM-67/L-22, Fisioterapisti).
   - *Bivio Auth*: Account Esistente vs Nuovo Studio.
   - *Ramo Login Pro*: Passkey WebAuthn FIDO2 / Email Argon2id $\rightarrow$ 2FA Obbligatoria (TOTP / SMS) & Anomaly Detection $\rightarrow$ Decrittazione Silo 1 & JWT.
   - *Ramo Registrazione Anti-Frode (5 Step)*:
     - **Step 1**: Credenziali Studio & Cloudflare Turnstile anti-bot (blocco domini email disposable + OTP email).
     - **Step 2**: Dati Fiscali (P.IVA 11 cifre, Codice Fiscale, SDI 7 car., Sede Legale) $\rightarrow$ Bivio Check VIES/AdE (ramo errore blocco immediato).
     - **Step 3 (Anti-Furto P.IVA)**: Interrogazione registro nazionale INI-PEC $\rightarrow$ Invio OTP alla casella PEC ufficiale $\rightarrow$ Bivio Check OTP (blocco anti-spoofing).
     - **Step 4 (Verifica Qualifica)**: Bivio Fisioterapia vs Chinesiologia/PT:
       - *4A Fisioterapisti*: Iscrizione Albo FNOFI / TSRM-PSTRP + Polizza RC Sanitaria $\rightarrow$ Sblocco Modulo Clinico `cli_01..32`.
       - *4B Chinesiologi / PT*: Laurea Scienze Motorie L-22/LM-67 / CONI + RC Sportiva $\rightarrow$ Sblocco DUP, VBT Vitruve, PAP e Prevenzione.
     - **Step 5**: Stripe Connect Custom & Stripe Identity KYC (Liveness 3D biometrico + Documento CIE/Passaporto) + IBAN Studio con Rolling Reserve anti-chargeback.
     - *Bivio KYC*: Accesso Sandbox/Bozza (creazione schede e test VBT, inviti atleti bloccati) vs Profilo Studio Verificato con Badge Blu (Full Tier 2 Pro).
   - *Ingresso Finale*: Coach Hub Cockpit con sessione attiva su Silo 1.
2. **Colonna 2 (X = -800)**: `2. COACH HUB MULTI-CLIENTE & GESTIONE ADERENZA`
   - Coach Cockpit $\rightarrow$ Selettore Rapido Atleti $\rightarrow$ 6 Viste Pro (Roster, DUP, VBT/PAP, PubMed, AI Kinesiologist, Export XLSX) $\rightarrow$ Alert Aderenza & RPE.
3. **Colonna 3 (X = 600)**: `3. ARCHITETTURA DI SISTEMA B2B & DATA REPOSITORY PRO`
   - Thin Client React 18 + BLE Vitruve $\rightarrow$ Feature-Driven $\rightarrow$ Motori Server: Physics VBT Hybrid, PAP Stats, 119 Triage, DUP Openpyxl $\rightarrow$ Catalogo 296 e 119 Patologie.
4. **Colonna 4 (X = 2150)**: `4. WORKFLOW FUNZIONALI SPECIALISTICI (TRIAGE 119, VBT OLS, PAP)`
   - *Workflow 1*: Generatore Macrocicli DUP 12-16 sett. con esclusione patologie ed export Excel `.xlsx` non protetto.
   - *Workflow 2*: Pipeline VBT da Encoder Lineare BLE (Vitruve), filtro outlier MAD, regressione ibrida AIC/$R^2_{adj}$, stima 1RM IC 95%.
   - *Workflow 3*: Analisi Salti PAP (CMJ/SJ), calcolo reattività RSI, $t$-test e soglia clinica MDC 95%.
5. **Colonna 5 (X = 3799)**: `Together Pro - Vetrina Professionale, Lead Generation & Video Review`
   - *Sub 1*: Profilo vetrina pubblico, pacchetti coaching e pricing.
   - *Sub 2*: Ingestion richieste clienti, preventivi Stripe e attivazione contratto.
   - *Sub 3*: Video revisione tecnica esecuzioni atleti con drawing tool per angoli articolari e note vocali.
6. **Colonna 6 (X = 5448)**: `Physio Rehab - Protocolli Riabilitativi, Misurazione ROM & Scala VAS`
   - *Sub 1*: Protocolli clinici riabilitativi `cli_01..32` (LCA, spalla, colonna).
   - *Sub 2*: Misurazione goniometrica ROM (gradi attiva/passiva) e Limb Symmetry Index (LSI > 90%).
   - *Sub 3*: Monitoraggio dolore scala VAS (0-10) con allarme de-escalation automatica se VAS > 4.

---

### RIGA 3: Software 3 — Team di Alto Livello / Elite Club (Bottom, Y = 3850..5350)
1. **Colonna 1 (X = -2200)**: `1. ACCESSO BLINDATO BUNKER CLUB & KMS SILO 2 (PRO TEAMS)`
   - Portale Bunker Serie A $\rightarrow$ Magic Link / QR Medico Sociale $\rightarrow$ Hardware FIDO2 Level 3 societaria $\rightarrow$ mTLS & IP Whitelist $\rightarrow$ Cockpit di Squadra.
2. **Colonna 2 (X = -800)**: `2. COCKPIT MULTI-STAFF INTEGRATO CON SEGREGAZIONE DEI RUOLI`
   - Team Cockpit $\rightarrow$ Selettore Ruoli R1..R8 $\rightarrow$ 6 Viste Squadra (Tattica Allenatore, Preparatore MD-X, Z-Score GPS, Match Analyst Video, Medico Sociale EMR, Ricerca Silo 3) $\rightarrow$ Oscuramento automatico dati sanitari ai non medici.
3. **Colonna 3 (X = 600)**: `3. ARCHITETTURA BUNKER ISOLATA (KMS SILO 2) & RESEARCH LAKE (SILO 3)`
   - Thin Client Staff $\rightarrow$ Cloud KMS Enclave $\rightarrow$ Motori Server: Team ACWR EWMA, Z-Score 28gg, Pitch Computer Vision (YOLO/Voronoi), Return-to-Play $\rightarrow$ Silo 2 (Bunker AES-256) + Silo 3 (Research Warehouse Anonimizzato).
4. **Colonna 4 (X = 2150)**: `4. WORKFLOW TATTICI & TELEMETRICI SQUADRA (MD-X, GPS, VIDEO CV)`
   - *Workflow 1*: Microciclo Gara MD-X ($MD-4 \rightarrow MD+1$), bilanciamento doppio ruolo, compensazione panchina e ACWR EWMA.
   - *Workflow 2*: Telemetria GPS campo (TD, HSR, Sprint), Z-Score rolling 28 giorni e fusione HRV mattutino.
   - *Workflow 3*: Video Computer Vision tattica (tracciamento coordinate giocatori 2D, diagrammi di Voronoi e spazi dominati).
5. **Colonna 5 (X = 3799)**: `Tactical Vision - Computer Vision Campo, Densità & Voronoi (Zero Social)`
   - *Sub 1*: Rilevamento coordinate giocatori (X,Y), baricentro medio e densità posizionale.
   - *Sub 2*: Proiezione omografica 2D del campo, compattezza squadra (m) e linee di pressione.
   - *Sub 3*: Dossier tattico confidenziale no-social archiviato in Silo 2 con watermark dinamico.
6. **Colonna 6 (X = 5448)**: `Medical Room - Cartella Clinica EMR, Return to Play & Research Silo 3`
   - *Sub 1*: Cartella clinica elettronica riservata con storico lesioni ed esami strumentali.
   - *Sub 2*: Stepper Return-to-Play a 6 fasi con firma digitale del Medico Sociale per idoneità.
   - *Sub 3*: Pipeline ETL di de-identificazione ($k$-anonimato $\ge 5$, $\ell$-diversità) per alimentare il data lake universitario Silo 3.
