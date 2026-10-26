# Capitolato Tecnico: Flow 1B – Onboarding & Setup Fiscale Anti-Frode (T7 Pro Partita IVA)

## 1. Identificativo & Titolo Ufficiale
- **Codice Univoco:** `FLOW-1B`
- **Titolo Ufficiale:** SOFTWARE 2 (B2B PRO P.IVA) - FLOW 1B: ONBOARDING & SETUP FISCALE ANTI-FRODE (T7 PRO)
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 2: Partita IVA / Coaches & Fisioterapisti, Colonna 1: Onboarding Fiscale)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-2-pro-b2b/flow-1b-pro-onboarding.mmd`

---

## 2. Obiettivo di Business & Target Utente
- **Target Utente:** Professionisti dello sport, preparatori atletici, chinesiologi, personal trainer e fisioterapisti titolari di Partita IVA o studi privati (Tier 2 – B2B Freelance).
- **Problema Risolto:** Proteggere la piattaforma e gli atleti da truffe, prestanome, abusivismo professionale nel settore sanitario e riciclaggio di denaro (card laundering). Il flusso implementa un rigoroso funnel anti-frode multi-livello che verifica la reale esistenza della Partita IVA sui registri statali (VIES / Agenzia delle Entrate), ne attesta la titolarità tramite verifica PEC a due vie (INI-PEC), accerta l'iscrizione all'albo/titoli accademici e convalida l'identità biometrica dell'operatore con scansione 3D Liveness (Stripe Identity).

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)
1. **Corsia 1: Thin Client UI/UX (Pro Web & Mobile - React 18):**
   - Form di autenticazione WebAuthn FIDO2 con 2FA obbligatoria, wizard di registrazione fiscale a 5 passaggi, gestione codici di verifica PEC, selettore qualifica professionale (Fisioterapista Sanitario vs Chinesiologo / PT), componente SDK Stripe Identity e cockpit con stato di verifica (Sandbox vs Badge Blu Verificato).
2. **Corsia 2: API Gateway & Security Enforcement (Envoy / Kong):**
   - Rate limiting stringente per IP/ASN, chiamate telematiche di verifica VIES, lookup su Registro Nazionale INI-PEC, feature gating sanitario (sblocco protocolli clinici `cli_01`..`cli_32` vincolato all'Albo) e gestione dei webhook Stripe Identity.
3. **Corsia 3: Server Scatola Nera (Anti-Scam & Pro Tenant Engine - Cloud Run):**
   - Algoritmo euristico anti-spoofing, provisioning del tenant professionale isolato in Silo 1, impostazione delle riserve di sicurezza a garanzia dei pagamenti (rolling reserve) e rilascio quota atleti.
4. **Corsia 4: Database Silo 1 (Pro Multi-Tenant Partition - PostgreSQL):**
   - Tabelle `pro_tenants`, `studio_profiles`, audit log immutabile delle visure fiscali e record Stripe Connect per i pagamenti.

---

## 4. Flusso Operativo Passo-Passo (Nodi Numerati)

### Ramo A: Accesso Professionista Già Registrato
1. **START (Accesso Professionista):** Il coach o fisioterapista apre l'app Pro o il portale Web dedicato.
2. **AUTH_FORK (Verifica Esistenza Account):** Selezione tra Login e Nuova Registrazione Studio.
3. **LOGIN_VIEW & LOGIN_2FA (Login Sicuro a Due Fattori):** Inserimento credenziali o Passkey biometrica, seguito tassativamente dall'autenticazione a due fattori (TOTP Authenticator o SMS OTP).
4. **GW_LOGIN_AUTH & GW_SESSION_ISSUE (Rilascio Sessione Pro):** L'API Gateway convalida le credenziali e rilascia il token JWT Tier 2 con i claims di ruolo (`R2_COACH` o `R3_PHYSIO`).
5. **PRO_COCKPIT_READY (Ingresso Coach Hub):** Accesso immediato alla dashboard con gestione atleti, programmazione e VBT.

### Ramo B: Registrazione Nuovo Studio Anti-Frode
6. **REG_STEP1 (Credenziali Studio & Scudo Anti-Bot):** Raccolta email aziendale, password ad alta entropia e verifica invisibile Cloudflare Turnstile.
7. **REG_STEP2 (Dati Fiscali Aziendali):** Inserimento di: Ragione Sociale, Partita IVA a 11 cifre, Codice Fiscale, Codice Destinatario SDI per fatturazione elettronica e indirizzo sede legale.
8. **GW_VAT_CHECK (Verifica Telematica P.IVA):** L'API Gateway interroga in tempo reale l'anagrafe tributaria (VIES per operatori comunitari e Agenzia delle Entrate per P.IVA italiane).
   - *Se la P.IVA è inesistente, cessata o non corrisponde alla ragione sociale:* Viene generato l'allarme bloccante `ERR_VAT` e la registrazione viene interrotta.
   - *Se la P.IVA è valida e attiva:* Il flusso prosegue verso il cross-check di titolarità.
9. **GW_PEC_LOOKUP & REG_STEP3 (Verifica Titolarità INI-PEC):** L'API Gateway esegue un lookup automatico nel Registro Nazionale delle Imprese e Professionisti (INI-PEC) per estrarre l'indirizzo PEC certificato associato a quella Partita IVA. Il server invia un codice OTP segreto a 6 cifre sulla casella PEC del professionista. L'utente deve digitarlo nel client (`REG_STEP3`).
10. **GW_PEC_VERIFY (Controllo OTP PEC):**
    - *Se il codice è errato o non pervenuto:* Blocco anti-spoofing immediato (`ERR_PEC`). Ciò impedisce a chiunque di registrarsi utilizzando la Partita IVA di un terzo professionista all'insaputa di quest'ultimo.
    - *Se il codice è confermato:* La titolarità legale della Partita IVA è accertata al 100%.
11. **ROLE_FORK (Bivio Qualifica Professionale):**
    - *Opzione A: Fisioterapista / Sanitario (`STEP4A_FISIO`):* Inserimento numero iscrizione Ordine Professionale TSRM-PSTRP / FNOFI e polizza assicurativa RC Sanitaria obbligatoria.
    - *Opzione B: Chinesiologo / Preparatore Atletico / Personal Trainer (`STEP4B_PT`):* Estremi laurea magistrale (LM-67 / LM-68) o certificazione CONI/SNaQ e assicurazione RC Sportiva.
12. **GW_ROLE_GATE (Clinical Feature Gating):** Il sistema sblocca i 32 protocolli riabilitativi speciali per il ginocchio (`cli_01`..`cli_32`) **esclusivamente per gli utenti con Albo Sanitario verificato**. I preparatori atletici hanno accesso al catalogo sportivo completo e alla periodizzazione, ma non alla diagnosi clinica.
13. **REG_STEP5 (Verifica Biometrica 3D Liveness Stripe Identity):** Per scongiurare il furto d'identità tramite prestanome, l'operatore inquadra il proprio documento d'identità (CIE o Passaporto) ed esegue un video-selfie con micro-movimenti della testa per certificare la presenza fisica in vita ("3D Liveness Check"). Inserisce inoltre l'IBAN dello studio per gli incassi.
14. **SRV_ANTI_SPOOF & PROVISIONING:** Il server centrale analizza i metadati, attiva la protezione anti-card-laundering (blocco pagamenti da carte anonime e rolling reserve del 5% per 90 giorni) e inizializza il tenant del professionista in Silo 1.
15. **KYC_FORK (Stato Validazione KYC):**
    - *Durante la revisione dei documenti (Pending KYC):* Il professionista accede in `SANDBOX_VIEW` (può esplorare il VBT e testare i generatori di macrocicli, ma non può ancora invitare atleti né riscuotere denaro).
    - *A validazione completata (Verified):* Il profilo ottiene il `VERIFIED_BADGE` (Spunta Blu Professionista Certificato), abilitando la licenza Pro Tier 2 completa, il link pubblico d'invito atleti e i pagamenti Stripe Connect.
16. **PRO_COCKPIT_READY (Cockpit Attivo):** Il professionista è pienamente operativo sulla piattaforma.

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI
- **Decisione Login vs Registrazione (`AUTH_FORK`):** Login 2FA vs Funnel registrazione a 5 step.
- **Decisione Validità Fiscale (`GW_VAT_CHECK`):** P.IVA Valida $\implies$ Lookup PEC; P.IVA Non Valida $\implies$ `ERR_VAT` bloccante.
- **Decisione Titolarità PEC (`GW_PEC_VERIFY`):** OTP Confermato $\implies$ Bivio ruoli; OTP Errato $\implies$ `ERR_PEC` blocco anti-spoofing.
- **Decisione Qualifica (`ROLE_FORK`):** Sanitario (Albo FNOFI) $\implies$ Sblocco EMR `cli_01..32`; Sportivo $\implies$ Licenza Coach VBT.
- **Decisione Stato KYC (`KYC_FORK`):** In attesa $\implies$ Sandbox protetta; Approvato $\implies$ Badge Blu e licenza piena.

### Gestione dei 4 Stati UI:
1. **Empty State:** Schermata iniziale del wizard con barra di avanzamento a 5 icone (Credenziali, Fisco, PEC, Ruolo, Identità).
2. **Loading State:** Animazione di verifica telematica con messaggio "Interrogazione registri Agenzia delle Entrate e VIES in corso...".
3. **Populated State:** Dashboard studio con riepilogo della Partita IVA validata, codice SDI memorizzato e lista atleti gestibili.
4. **Error / Fallback State:**
   - Fallimento verifica PEC: modale che permette di richiedere un nuovo codice OTP o di verificare se la casella PEC dello studio è piena.
   - Piattaforma Stripe non raggiungibile: salvataggio bozza e notifica asincrona via email non appena i servizi di identity sono ripristinati.

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Endpoint Principali:
- `POST /api/v1/pro/auth/vat-verify`:
  - Input: `{ vatNumber: string, countryCode: 'IT', companyName: string }`
  - Output: `{ isValid: true, certifiedPecEmail: 's***@pec.it', sdiCode: string }`
- `POST /api/v1/pro/auth/pec-confirm`: `{ vatNumber: string, otpCode: string }` $\to$ `{ verified: true }`
- `POST /api/v1/pro/auth/stripe-identity-session`: `{ proId: string, returnUrl: string }` $\to$ `{ clientSecret: string }`

### Tabelle Database Coinvolte (Silo 1):
- `pro_tenants`: id, company_name, vat_number, sdi_code, pec_email, verified_at, role_category ('COACH'|'PHYSIO').
- `studio_profiles`: pro_id, legal_address, iban, stripe_account_id, kyc_status ('PENDING'|'VERIFIED'|'REJECTED').
- `pro_audit_logs`: id, pro_id, event_type, ip_address, raw_verification_hash, created_at.

---

## 7. Ereditarietà di Tier & Differenziali di Fascia
- **Ereditarietà verso il basso (Cascata Top-Down):** Questo flusso eredita i meccanismi di base di sicurezza del General User (`flow-1a`) e introduce il gold standard di verifica fiscale B2B. A sua volta, il Tier 3 (Enterprise Club - `flow-1c`) **eredita tutta questa rigorosa infrastruttura**, potenziandola con controlli camerali federati CONI, certificati mTLS X.509 e segregazione crittografica Cloud KMS nel bunker Silo 2.
- **Differenziali:** Il Tier 1 si registra con email e 1-tap; il Tier 2 esige Partita IVA accertata, PEC a due vie, Albo e liveness 3D; il Tier 3 richiede contratti enterprise KYB e federazione SSO.
