# Capitolato Tecnico: Flow 1A – Accesso, Onboarding & Anamnesi Anti-Frode (T7 Consumer)

## 1. Identificativo & Titolo Ufficiale
- **Codice Univoco:** `FLOW-1A`
- **Titolo Ufficiale:** SOFTWARE 1 (B2C CONSUMER) - FLOW 1A: ACCESSO, ONBOARDING & ANAMNESI ANTI-FRODE (T7 CONSUMER)
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 1: General User / Casual, Colonna 1: Onboarding & Accesso)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-1-consumer-b2c/flow-1a-consumer-onboarding.mmd`

---

## 2. Obiettivo di Business & Target Utente
- **Target Utente:** Utenti comuni, atleti amatoriali, appassionati di fitness e frequentatori di palestre che si allenano in autonomia (Tier 1 – B2C Free / Low-Cost).
- **Problema Risolto:** Permettere un accesso rapido e user-friendly (1-tap biometrico / social / magic link) eliminando le barriere all'ingresso, ma garantendo al contempo:
  1. Protezione anti-bot e anti-scraping della piattaforma;
  2. Raccolta conforme dei dati biometrici e del sesso biologico per il calcolo metabolico;
  3. Screening sanitario preliminare obbligatorio (PAR-Q+) con manleva medico-legale certificata su log immutabile;
  4. Protezione della community da spam/troll tramite step-up telefonico su richiesta di partecipazione al social.

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)
1. **Corsia 1: Thin Client UI/UX (Mobile App React Native / PWA React 18):**
   - Gestione Welcome Screen, form dinamico di registrazione a 4 step, integrazione WebAuthn / Passkey, questionario interattivo PAR-Q+ a 7 item e dashboard di benvenuto.
2. **Corsia 2: API Gateway & Access Control (Envoy / Kong + Cloudflare Turnstile):**
   - Validazione token biometrici/OAuth, rate limiting su IP, verifica del challenge anti-bot invisibile Turnstile, blocco domini email temporanei/usa-e-getta, emissione token JWT Tier 1 e gestione OTP Twilio.
3. **Corsia 3: Server Scatola Nera (Consumer Engine - Microservizi Cloud Run):**
   - Calcolo algoritmo BMR (Mifflin-St Jeor), filtro algoritmico del catalogo esercizi in caso di red flags sanitarie, inizializzazione partizione utente e streak giornaliero.
4. **Corsia 4: Database Silo 1 (Consumer Public & Social Partition - PostgreSQL):**
   - Persistenza anagrafica cifrata (Argon2id), profilo fisiologico, log immutabile delle manleve e timestamp di accettazione termini.

---

## 4. Flusso Operativo Passo-Passo (Nodi Numerati)

### Ramo A: Accesso Utente Esistente (Login)
1. **START (Apertura App Consumer):** L'utente avvia l'applicazione mobile o apre la Web App su browser.
2. **SPLASH (Welcome Screen):** Viene renderizzata la schermata di benvenuto con il logo T7 Workout e la scelta tra accesso e nuova registrazione.
3. **AUTH_FORK (Decisione Account):** L'utente sceglie se effettuare il login o creare un nuovo account.
4. **LOGIN_VIEW (Schermata Login):** Autenticazione biometrica 1-tap via Passkey (Face ID / Touch ID) oppure Social Sign-In (Apple / Google) o Email + Password.
5. **LOGIN_SEC (Sicurezza & Anomaly Detection):** Il client esegue un controllo di integrità del dispositivo e, in caso di accesso da nuovo dispositivo/IP anomalo, richiede una verifica a 2 fattori (OTP via email/SMS).
6. **GW_AUTH_VALIDATE (Validazione Gateway):** L'API Gateway verifica la firma WebAuthn o convalida il token OAuth con Apple/Google.
7. **GW_JWT_EMIT (Rilascio Token):** Viene generato un token JWT firmato con ruolo `R1_ATHLETE` (Tier 1) e iniettato un cookie di sessione HttpOnly per il silent refresh.
8. **COCKPIT_READY (Ingresso Cockpit):** L'utente atterra direttamente sulla propria dashboard di allenamento.

### Ramo B: Registrazione Nuovo Utente Anti-Frode
9. **REG_STEP1 (Scudo Anti-Bot & Autenticazione):** L'utente inserisce le credenziali base o seleziona 1-Tap Sign-In. Un token invisibile Cloudflare Turnstile attesta l'umanità della richiesta senza captchas invasivi.
10. **GW_BOT_FILTER (Verifica Anti-Bot):** L'API Gateway contatta le API Cloudflare. Se il challenge fallisce (bot/crawler), l'operazione viene interrotta con `ERR_AGE`. Se positivo, il flusso prosegue.
11. **GW_RATE_LIMIT (Controllo Reputazione IP):** Verifica che l'IP non sia in blacklist per spam e che il dominio email non sia disposable.
12. **REG_STEP2 (Parametri Fisiologici):** Raccolta guidata di: Sesso Biologico (indispensabile per equazioni di massa magra e metabolismo), Altezza (cm), Peso corporeo (kg) e data di nascita con check 18+.
13. **AGE_GATE (Controllo Maggiore Età & Termini):** Se l'utente è minorenne o non accetta i termini di servizio e il trattamento privacy, la registrazione viene bloccata (`ERR_AGE`).
14. **REG_STEP3 (Screening Sanitario PAR-Q+):** Presentazione dei 7 quesiti standard del Physical Activity Readiness Questionnaire (dolori toracici, svenimenti, problemi articolari, pressione arteriosa). L'utente firma digitalmente (clickwrap waiver) la presa d'atto delle proprie condizioni.
15. **GW_PARQ_AUDIT (Audit Log Immutabile):** L'API Gateway serializza le risposte e il timestamp dell'accettazione nella tabella di manleva medico-legale `health_waivers`.
16. **PARQ_GATE (Verifica Risposte Sanitarie):**
    - *Se l'utente risponde SÌ ad almeno una domanda (Red Flag):* Viene mostrato il banner `PARQ_ALERT` che raccomanda una visita medica e il server (`SRV_TRIAGE_FILTER`) imposta automaticamente il profilo in modalità cautelativa, limitando il catalogo ad attività a basso impatto.
    - *Se l'utente risponde NO a tutte le domande:* Viene concessa l'idoneità funzionale piena (`PARQ_OK`) e il server (`SRV_BMR_CALC`) calcola il BMR teorico con formula Mifflin-St Jeor.
17. **REG_STEP4 (Provisioning & Profilazione):** Il server inizializza la partizione utente in Silo 1 (`SRV_PROVISION_B2C`), memorizza il profilo e genera il token JWT Tier 1.
18. **SOCIAL_GATE (Opzione Partecipazione Community Together):**
    - Se l'atleta desidera pubblicare post, interagire nella community o contattare coach nel marketplace, viene richiesto uno Step-Up telefonico (`STEP_UP_SMS` tramite Twilio) per prevenire bot e troll anonimi.
    - Se l'atleta desidera utilizzare l'app esclusivamente come diario personale di allenamento, il numero di telefono non è richiesto.
19. **NAV_HUB (Navigazione Hub Centrale):** Conclusione del flusso con transizione alla schermata principale dell'applicazione.

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI
- **Decisione Account (`AUTH_FORK`):** Login (utente noto) vs Registrazione (nuovo atleta).
- **Decisione Età e Consensi (`AGE_GATE`):** Checkbox 18+ obbligatoria. Errore bloccante immediato se non flaggata.
- **Decisione PAR-Q+ (`PARQ_GATE`):** Red Flag $\ge 1 \implies$ Alert medico + Triage low-impact; Red Flag $= 0 \implies$ Piena idoneità.
- **Decisione Community (`SOCIAL_GATE`):** Social $\implies$ OTP SMS; Solo Diario $\implies$ Accesso diretto.

### Gestione dei 4 Stati UI:
1. **Empty State:** Prima apertura dell'app con form pulito, campi pre-compilati via browser autofill o Apple/Google credentials.
2. **Loading State:** Transizione a skeleton screen durante la verifica Turnstile e il provisioning del profilo.
3. **Populated State:** Dashboard atleta attiva con streak giornaliero (0 giorni), peso registrato e banner di idoneità.
4. **Error / Fallback State:**
   - Errore Bot/Turnstile: blocco form con invito a riprovare da connessione affidabile.
   - Errore PAR-Q+: banner ambrato persistente nella parte alta del cockpit per ricordare la visita medica.

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Endpoint Principali:
- `POST /api/v1/auth/login`: `{ provider: 'passkey'|'oauth'|'password', credentials: { ... } }` $\to$ `{ jwtToken: string, athleteId: string }`
- `POST /api/v1/auth/register-b2c`: `{ email, birthDate, biologicalSex, heightCm, weightKg, turnstileToken }`
- `POST /api/v1/auth/parq-waiver`: `{ athleteId, answers: boolean[7], waiverSigned: true, clientTimestamp }`
- `POST /api/v1/auth/step-up-sms`: `{ athleteId, phoneNumber }` $\to$ invio codice OTP 6 cifre

### Tabelle Database Coinvolte (Silo 1):
- `auth_users`: ID, email, hash Argon2id o provider ID, stato account, role (`R1_ATHLETE`).
- `athlete_profiles`: ID utente, altezza, peso, sesso biologico, BMR calcolato, restrizione low-impact (`true`/`false`).
- `health_waivers`: ID manleva, ID utente, array risposte PAR-Q+, IP client, timestamp SHA-256 immutabile.

---

## 7. Ereditarietà di Tier & Differenziali di Fascia
- **Ereditarietà verso l'alto:** Questo flusso rappresenta la base consumer gratuita. Non eredita funzionalità da altri tier.
- **Propagazione verso il basso (Cascata Top-Down):** I meccanismi di sicurezza anti-bot (Cloudflare Turnstile), la validazione biometrica WebAuthn e l'architettura a 4 corsie costituiscono la base ereditata e potenziata dai flussi professionali Tier 2 (`flow-1b`) ed enterprise Tier 3 (`flow-1c`).
- **Differenziali:** Il General User effettua un'autocertificazione (PAR-Q+); la Partita IVA richiede validazione fiscale e liveness 3D; l'Elite Club richiede certificati mTLS, KYB camerale e FIDO2 hardware.
