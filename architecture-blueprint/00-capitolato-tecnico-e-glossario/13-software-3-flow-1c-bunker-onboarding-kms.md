# Capitolato Tecnico: Flow 1C – Onboarding Enterprise & Bunker Club Isolation (T7 Elite Club Enterprise)

## 1. Identificativo & Titolo Ufficiale
- **Codice Univoco:** `FLOW-1C`
- **Titolo Ufficiale:** SOFTWARE 3 (B2B ENTERPRISE) - FLOW 1C: ONBOARDING ENTERPRISE & BUNKER CLUB ISOLATION (PRO TEAMS & FEDERAZIONI)
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 3: High-Level Pro Teams & Enterprise, Colonna 1: Onboarding Enterprise & Bunker)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-3-elite-club-enterprise/flow-1c-bunker-onboarding-kms.mmd`

---

## 2. Obiettivo di Business & Target Utente
- **Target Utente:** Società sportive professionistiche (Serie A, Premier League, NBA, EuroLeague), federazioni sportive nazionali e comitati olimpici (Tier 3 – B2B Enterprise).
- **Problema Risolto:** Le società sportive di vertice gestiscono asset milionari (atleti professionisti), cartelle cliniche riservate, contratti e dati tattici altamente confidenziali. Qualsiasi fuga di dati verso club concorrenti o verso il pubblico provocherebbe danni economici e sportivi incalcolabili. T7 realizza un **Encrypted Club Bunker** a tenuta stagna:
  1. Accreditamento societario tramite visura camerale KYB (Codice ATECO sportivo 93.12 e matricola federale CONI/Federazione);
  2. Verifica di titolarità del dominio internet ufficiale e firma digitale eIDAS Level 3 del Legale Rappresentante;
  3. Contrattualistica Enterprise conforme al GDPR Art. 9 (trattamento dati sanitari e biometrici speciali);
  4. Accesso blindato per lo Staff con mTLS (certificati hardware X.509), Single Sign-On aziendale (Microsoft Entra ID / Okta) e chiavi di sicurezza hardware FIDO2;
  5. Accesso blindato per l'Atleta con Secure Enclave hardware e blocco assoluto di screenshot e intercettazioni;
  6. Isolamento crittografico assoluto del Database Silo 2 tramite chiavi hardware dedicate gestite via Google Cloud KMS (CMEK).

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)
1. **Corsia 1: Thin Client UI/UX (Portale Istituzionale Club & App Mobile Atleta):**
   - Portale desktop per lo staff dirigenziale e tecnico, interfaccia SSO federata, wizard contrattuale a 6 passaggi, gestione deleghe per gli 8 ruoli RBAC (Head Coach, S&C Coach, Medico Sociale, Fisioterapista, Match Analyst, Dirigenza, Atleta) e app mobile atleta protetta da Secure Enclave con vista a silos (il calciatore visualizza unicamente il proprio piano senza accedere ai dati dei compagni).
2. **Corsia 2: API Gateway & Enterprise Security Perimeter (Envoy / mTLS Gateway):**
   - Identity Broker SAML 2.0 / OIDC, terminazione e validazione dei certificati client mTLS X.509, filtro IP Whitelist del Centro Sportivo, verifica KYB e rilascio token JWT Tier 3 con claim di ruolo crittografici.
3. **Corsia 3: Server Scatola Nera (Bunker Provisioning Engine - Cloud Run Isolated):**
   - Verifica record DNS TXT aziendali, convalida firme digitali qualificate con marca temporale, orchestratore Google Cloud KMS per il provisioning di chiavi crittografiche hardware uniche per ciascun club e scrittura log immutabili WORM (Write Once, Read Many).
4. **Corsia 4: Database Silo 2 (Bunker Club KMS Enclave - PostgreSQL Dedicated):**
   - Partizione logica o fisica del database completamente isolata e criptata a riposo con algoritmo AES-256-GCM. Cartella clinica EMR visibile esclusivamente al Medico Sociale.

---

## 4. Flusso Operativo Passo-Passo (Nodi Numerati)
1. **START (Accesso T7 Elite Club):** Accesso al portale enterprise o all'applicazione mobile societaria.
2. **CLUB_PORTAL & CHECK_CLUB (Verifica Stato Società):**
   - **Ramo A:** Club già registrato ed enclave attiva $\implies$ Accesso Diretto (Staff vs Atleta).
   - **Ramo B:** Nuova società sportiva $\implies$ Accreditamento Enterprise & Provisioning Bunker.

### Ramo A: Accesso al Bunker del Club Già Attivo
3. **ROLE_CHECK (Bivio Canale di Accesso Pro):**
   - *Canale Staff Tecnico / Medico / Dirigenza:*
     - L'operatore si autentica tramite SSO aziendale federato (`STAFF_LOGIN` con Microsoft 365 / Okta).
     - L'API Gateway (`GW_MTLS_VALID`) verifica che la richiesta provenga da un dispositivo aziendale dotato di certificato mTLS X.509 e connesso alla rete IP sicura del Centro Sportivo.
     - L'autenticazione richiede l'inserimento della chiavetta hardware FIDO2 (es. YubiKey).
     - Il server Scatola Nera aggancia la chiave KMS del club (`SRV_KMS_DECRYPT`) e sblocca la partizione Silo 2 emettendo il token di sessione protetto (`GW_JWT_ISSUER`).
   - *Canale Giocatore / Calciatore:*
     - L'atleta accede dalla propria app mobile con Passkey biometrica (Face ID) (`ATHLETE_LOGIN`).
     - L'app esegue l'attestazione hardware del dispositivo (`ATHLETE_ATTEST`), inibendo catture schermo (anti-screenshot), registrazione video dello schermo e intercettazioni di rete.
     - Viene caricata la vista isolata (`ATHLETE_READY`): l'atleta vede solo la propria scheda giornaliera e i propri dati GPS, con divieto categorico di vedere carichi o parametri dei compagni di squadra.
4. **COCKPIT_READY & EXIT_SEZ2:** Ingresso nel Cockpit della prima squadra e transizione all'Hub Centrale.

### Ramo B: Accreditamento Istituzionale Nuovo Club Anti-Spoofing
5. **STEP1_DOMAIN (Richiesta Accreditamento & Dominio):** Inserimento della denominazione ufficiale del club, matricola federale (es. matricola FIGC/Lega Calcio) e dominio email aziendale esclusivo (es. `@club.com`).
6. **STEP2_KYB (Verifica KYB Telematica & Visura Camerale):** Il sistema effettua una visura telematica automatica su Registro Imprese e banche dati federali:
   - Controlla la corrispondenza del codice ATECO 93.12 (Attività di club sportivi professionistici).
   - *Se la società è inesistente o si tratta di un tentativo di spoofing:* Blocco immediato e irreversibile con allarme di sicurezza (`ERR_SPOOFING`).
   - *Se la società è conforme:* Si passa alla verifica del Legale Rappresentante.
7. **STEP3_DNS (Verifica DNS TXT & Legale Rappresentante):**
   - Il server Scatola Nera (`SRV_CHALLENGE_DNS`) genera una stringa casuale crittografica che il reparto IT della società sportiva deve inserire come record DNS TXT sul proprio dominio.
   - Il Legale Rappresentante (Presidente o Amministratore Delegato) firma l'attestazione con identità digitale qualificata eIDAS Level 3 (SPID professionale / CIE / Firma Digitale CAdES/PAdES).
8. **STEP4_CONTRACTS (Firma Digitale Contrattualistica Enterprise):** Sottoscrizione contrattuale digitale con validità legale piena:
   - Master Services Agreement (MSA) con garanzia di SLA al 99.9%;
   - Data Processing Agreement (DPA) conforme al GDPR Art. 28;
   - Business Associate Agreement (BAA) per il trattamento dei dati sanitari (GDPR Art. 9).
9. **SRV_KMS_PROVISION (Provisioning Bunker Cloud KMS):** Il server ordina a Google Cloud KMS la creazione di un Key Ring dedicato e di una Customer Managed Encryption Key (CMEK). Nessun dipendente di T7 Workout può accedere a tale chiave senza autorizzazione congiunta.
10. **DB_ENCLAVE_INIT (Inizializzazione Silo 2 Criptata):** Viene creata la partizione Silo 2 del club crittografata con AES-256-GCM.
11. **STEP6_DELEGATES (Gestione Deleghe Multi-Staff & Invito Rosa):** Il Legale Rappresentante delega il Medico Sociale come Super-Admin Sanitario e l'Head Coach come Super-Admin Tecnico. Il Medico Sociale genera i link sicuri e cifrati per invitare i giocatori della rosa.
12. **COCKPIT_READY (Bunker Operativo):** La società sportiva è pienamente attiva e protetta.

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI
- **Decisione Tipologia Utente (`ROLE_CHECK`):** Staff Tecnico (mTLS + FIDO2 + Corporate SSO) vs Giocatore (App Mobile + Secure Enclave + Vista Isolata).
- **Decisione KYB Federale (`GW_KYB_CHECK`):** Conforme $\implies$ Verifica DNS e contratti; Fallita $\implies$ Blocco anti-spoofing immediato.
- **Decisione Infrastruttura Crittografica:** Chiave Cloud KMS generata e attiva $\implies$ Partizione Silo 2 pronta.

### Gestione dei 4 Stati UI:
1. **Empty State:** Portale al primo avvio dopo il provisioning; checklist interattiva per l'Head Coach e il Medico Sociale (Inserimento rosa, associazione maglie/ruoli, collegamento antenne GPS da campo).
2. **Loading State:** Decrittazione della partizione Silo 2 all'avvio sessione con indicatore di sicurezza hardware attivo.
3. **Populated State:** Cockpit blindato di prima squadra con badge crittografico "Silo 2 Bunker Protetto da Cloud KMS", numero membri staff attivi e telemetria live della rosa.
4. **Error / Fallback State:**
   - Accesso da IP non autorizzato: schermata nera di blocco "Accesso consentito solo dalla rete interna del Centro Sportivo o VPN autorizzata".
   - Certificato mTLS revocato o scaduto: revoca immediata della sessione con disconnessione forzata.

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Endpoint Principali:
- `POST /api/v1/enterprise/onboarding/kyb-verify`:
  - Input: `{ clubRegistrationNumber: string, vatNumber: string, corporateDomain: string }`
  - Output: `{ kybPassed: true, dnsChallengeTxt: string, legalRepresentativeName: string }`
- `POST /api/v1/enterprise/onboarding/provision-bunker`:
  - Input: `{ clubId: string, signedContractsHash: string, eidasSignatureToken: string }`
  - Output: `{ silo2PartitionId: string, kmsKeyResourceName: string, status: 'enclave_active' }`
- `POST /api/v1/enterprise/auth/staff-session`: Autenticazione mTLS/FIDO2 $\to$ JWT Tier 3 con claims `{ tenantId, staffRole: 'R1_HEAD_COACH'|'R3_TEAM_DOCTOR', permissions: [...] }`

### Tabelle Database Coinvolte (Silo 2 - Enclave Criptata):
- `club_organizations`: id, legal_name, federal_id, corporate_domain, kms_key_arn, status ('ACTIVE').
- `club_staff_roster`: id, club_id, user_email, role_code, mtls_cert_fingerprint, fido2_credential_id.
- `club_athlete_roster`: id, club_id, player_number, tactical_role, secondary_tactical_role, medical_clearance_status.
- `bunker_audit_worm`: id, timestamp, operator_role, action_type, payload_hash (Immutabile WORM).

---

## 7. Ereditarietà di Tier & Differenziali di Fascia
- **Vertice della Gerarchia (Tier 3 Enterprise):** Eredita l'intera filosofia di sicurezza anti-frode del Tier 1 (`flow-1a`) e della Partita IVA (`flow-1b`), ma la eleva a standard di sicurezza bancaria e governativa:
  - Non basta un controllo P.IVA: occorre visura KYB camerale con codice ATECO sportivo e verifica CONI.
  - Non basta una password con 2FA: si esigono certificati mTLS hardware, FIDO2 e Corporate SSO aziendale.
  - I dati non risiedono in partizioni condivise: risiedono nel **Silo 2 Encrypted Club Bunker**, crittografato con chiavi Cloud KMS gestite dal club.
- **Isolamento Verso l'Alto:** Questo flusso è assolutamente precluso a utenti amatoriali (Tier 1) e professionisti singoli (Tier 2).
