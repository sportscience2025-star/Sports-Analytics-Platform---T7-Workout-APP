# Capitolato Tecnico: Flow 1C – Onboarding Enterprise & Bunker Club Isolation (T7 Elite Club Enterprise)

## 1. Identificativo & Titolo Ufficiale
- **Badge Miro Board:** `#13` (Posizione: `X: -2925, Y: 6580`)
- **Codice Univoco:** `FLOW-1C`
- **Titolo Formale:** SOFTWARE 3 (B2B ENTERPRISE) - FLOW 1C: ONBOARDING ENTERPRISE, FEDERAZIONE SSO & ACCESSO BLINDATO BUNKER CLUB KMS
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 3: High-Level Pro Teams & Enterprise, Colonna 1: Onboarding Enterprise & Bunker KMS)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-3-elite-club-enterprise/flow-1c-bunker-onboarding-kms.mmd`
- **Riferimento Glossario:** [Glossario Tecnico Vivente](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/00-capitolato-tecnico-e-glossario/00-GLOSSARIO-TERMINI-TECNICI.md) (Voci: *Silo 2 Bunker Club, Cloud KMS Envelope Encryption, Mutual TLS mTLS, SAML 2.0 SSO, FIDO2 Hardware Keys, WORM Audit Log*).

---

## 2. Obiettivo di Business & Target Utente

### Guida Pratica per Non Tecnici: Cos'è questo modulo per un umano?
Nello sport professionistico di massimo livello (come un club di calcio di Serie A, una franchigia NBA o una federazione olimpica), i dati dei giocatori valgono decine di milioni di euro. Se trapelano informazioni riservate sull'infortunio di un calciatore o sulla tattica di gara prima di una finale, il danno economico e sportivo è incalcolabile. I club non accetterebbero mai di salvare i propri dati su un cloud condiviso normale.  
**Il Bunker Club di T7** è una vera e propria cassaforte militare digitale:
- Ogni società sportiva ha una **partizione completamente separata e sigillata** (Silo 2);
- Tutti i dati sono protetti da una **chiave crittografica esclusiva della società** (Cloud KMS): nemmeno i programmatori o i proprietari di T7 possono aprire o leggere i dati del club;
- I dirigenti e lo staff accedono tramite le credenziali aziendali ufficiali (Single Sign-On aziendale Microsoft o Okta) e devono inserire una **chiavetta hardware di sicurezza (FIDO2)** nella porta del computer per confermare la propria presenza;
- **Ruoli Rigidissimi a Compartimenti Stagni:** L'allenatore vede la tattica e la forma fisica ma non la diagnosi medica segreta; il medico sociale gestisce le cartelle cliniche ma non tocca la parte economica; i calciatori vedono solo il proprio programma giornaliero senza poter curiosare sui compagni.

### Specifiche di Business & Metriche
- **Target Utente:** Società sportive professionistiche, federazioni nazionali e club d'élite (Tier 3 – B2B Enterprise).
- **Problema Risolto:** Azzerare il rischio di fughe di notizie (Zero Data Leaks), garantire la conformità al segreto industriale e sportivo e rispettare i protocolli GDPR Art. 9 sui dati sanitari degli atleti professionisti con certificati mTLS.

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)

1. **Corsia 1: Thin Client UI/UX (Enterprise Staff Cockpit React 18):**
   - Portale di login blindato con supporto mTLS certificato da browser/app, integrazione con chiavi fisiche hardware FIDO2/WebAuthn, cruscotto di amministrazione ruoli (Club Admin) e blocco anti-screenshot/anti-esfiltrazione su reti non autorizzate.
2. **Corsia 2: API Gateway & Enterprise Identity Broker (Envoy + Cloudflare Access):**
   - Negoziazione handshake Mutual TLS (mTLS con certificati X.509 emessi dall'Autorità di Certificazione del Club), federazione SAML 2.0 / OIDC con Microsoft Entra ID o Okta e firewall anti-intrusione WAF a tenuta stagna.
3. **Corsia 3: Server Scatola Nera (KMS Enclave & RBAC Multi-Staff Engine Cloud Run):**
   - Interfacciamento con Google Cloud Key Management Service (Cloud KMS) con Envelope Encryption (DEK generata e cifrata con KEK dedicata per-club), verifica della matrice a 8 ruoli e firma del registro di audit WORM immutabile.
4. **Corsia 4: Database Tripartito (Silo 2 - Encrypted Club Bunker Enclave PostgreSQL / Neon):**
   - Database per-tenant o partizione a Row-Level Security rigorosa con crittografia a riposo AES-256-GCM. Nessun canale di comunicazione con il Silo 1 social o con altri tenant.

---

## 4. Flusso Operativo Passo-Passo

### Livello A: User Journey Narrativo (La Storia dell'Utente)
1. **L'Arrivo al Centro Sportivo:** Lo staff del club (Allenatore, Preparatore, Medico Sociale) arriva al centro di allenamento e apre il computer o il tablet connesso alla rete privata societaria.
2. **L'Accesso Blindato (Senza Password Comuni):** Lo staff preme *"Accesso Istituzionale Club"*. Viene reindirizzato alla pagina aziendale sicura della società (Microsoft Entra ID). L'operatore inserisce la sua chiavetta USB di sicurezza (YubiKey) e tocca il sensore dorato con il dito.
3. **Il Riconoscimento del Certificato (mTLS):** Il server riconosce istantaneamente che quel dispositivo possiede il certificato digitale ufficiale emesso dal club.
4. **L'Apertura del Bunker Crittografico:** La chiave segreta societaria Cloud KMS apre la cassaforte Silo 2 del club per la sessione di lavoro.
5. **La Vista Personalizzata per Ciascun Ruolo:**
   - **L'Head Coach:** Vede la rosa dei convocabili, le percentuali di forma atletica e i video tattici della partita;
   - **Il Medico Sociale:** Vede la cartella clinica con le risonanze magnetiche, i referti ecografici e le date previste di rientro degli infortunati;
   - **Il Preparatore Atletico:** Vede i carichi GPS del giorno e i test di forza VBT;
   - **Il Calciatore (da App Mobile):** Vede solo l'orario di ritrovo al campo, la propria scheda personalizzata e compila il questionario di benessere mattutino.
6. **L'Audit Immutabile:** Ogni click o visualizzazione viene registrata in un registro indelebile (WORM): se qualcuno tentasse di scaricare dati non autorizzati, la dirigenza riceverebbe un allarme immediato.

---

### Livello B: Trattazione Tecnica Nodi Operativi

1. `START` (Inizio Onboarding Enterprise): Handshake TLS con validazione certificato client X.509 (`mTLS`) a livello di API Gateway Envoy.
2. `SSO_FEDERATION` (Federazione Identità SAML 2.0 / OIDC): Reindirizzamento verso l'IdP aziendale del club (Okta / Microsoft Entra ID). Asserzione dell'identità dello staff member.
3. `FIDO2_HARDWARE_CHECK` (Verifica Token Fisico FIDO2): Richiesta di attestazione hardware WebAuthn (chiave di sicurezza FIDO2 Level 2).
4. `GW_TOKEN_EXCHANGE` (Scambio Credenziali & RBAC):
   - Emissione token JWT Tier 3 con claim granulari: `tenant_id: club_juventus_fc`, `roles: ["R4_TEAM_DOCTOR", "R2_HEAD_COACH"]`;
   - Configurazione sessione blindata con scadenza forzata a 8 ore senza silent refresh automatico su reti non aziendali.
5. `KMS_UNWRAP_KEY` (Decrittazione Chiave Silo 2 via Cloud KMS):
   - Chiamata sicura verso Google Cloud KMS: `projects/t7-enterprise/locations/europe-west1/keyRings/club-vaults/cryptoKeys/key_juventus_fc`;
   - Decrittazione in memoria protetta della Data Encryption Key (DEK) del tenant.
6. `SILO2_MOUNT` (Inizializzazione Enclave Bunker Silo 2): Montaggio della connessione al database relazionale isolato con schema dedicato.
7. `STAFF_ROLE_SEGREGATION` (Segregazione Viste UI):
   - *R1 (Calciatore):* Restrizione `RLS WHERE athlete_id = current_user_id`;
   - *R2 (Head Coach):* Accesso a disponibilità, minutaggi e telemetria aggregata; oscuramento diagnosi mediche;
   - *R4 (Medico Sociale):* Accesso esclusivo a cartelle cliniche EMR, prescrizioni farmacologiche e firma digitale RTP;
   - *R5 (Match Analyst):* Accesso a clip tattiche 4K e dati di tracking geometrico.
8. `WORM_AUDIT_LOG` (Registro Audit Immutabile): Scrittura asincrona dell'evento di accesso su storage WORM (Write Once, Read Many) a norma ISO/IEC 27001 e HIPAA.
9. `ENTERPRISE_COCKPIT_READY` (Ingresso Cockpit di Squadra): Rendering del dashboard multi-staff (`FLOW-2C`).

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI

| Bivio Decisionale | Condizione Logica | Ramo SÌ / Positivo | Ramo NO / Negativo |
| :--- | :--- | :--- | :--- |
| `MTLS_HANDSHAKE` | Certificato X.509 client valido ed emesso dal Club CA? | Procedi a SSO aziendale | Rifiuto connessione a livello socket (`495 Cert Error`) |
| `FIDO2_ATTESTATION` | Chiave hardware fisica validata? | Autorizza rilascio JWT | Blocco accesso con alert security |
| `ROLE_PRIVILEGE` | Ruolo possiede autorizzazione cartella clinica? | Mostra referti sanitari | Oscura diagnosi medica (Mostra solo Disponibile/Non Disp.) |

### I 4 Stati di Interfaccia Utente (UI States):
1. **Empty State:** Primo avvio società: wizard per il Club Administrator per il caricamento delle licenze staff e l'integrazione con Microsoft Entra ID.
2. **Loading State:** Decrittazione della partizione Silo 2 in memoria protetta con indicatore di caricamento crittografico in $< 400\text{ ms}$.
3. **Populated State:** Dashboard societaria multi-ruolo con visualizzazione dello stato della prima squadra, dei giocatori infortunati e dei carichi di lavoro del giorno.
4. **Error / Fallback State:**
   - *Tentativo di accesso da IP o paese non autorizzato:* Blocco istantaneo dell'account, revoca dei certificati e invio notifica d'emergenza al Responsabile della Sicurezza del Club.

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Specifiche Endpoint REST:

#### 1. Autenticazione Federata mTLS & Scambio Chiave KMS
- **Endpoint:** `POST /api/v1/enterprise/auth/bunker-handshake`
- **Headers:** `X-Client-Cert-SHA256: string`, `Content-Type: application/json`
- **Request Payload:**
```json
{
  "clubTenantId": "club_seriea_01",
  "samlAssertionXml": "<saml2:Assertion>...</saml2:Assertion>",
  "fido2ChallengeResponse": { "clientDataJSON": "...", "authenticatorData": "...", "signature": "..." }
}
```
- **Responses:**
  - `200 OK`:
```json
{
  "sessionStatus": "BUNKER_MOUNTED",
  "tenantId": "club_seriea_01",
  "bearerToken": "eyJhbGciOi...",
  "assignedStaffRoles": ["R4_TEAM_DOCTOR"],
  "kmsSessionExpiresUtc": "2026-10-26T20:00:00Z"
}
```
  - `403 Forbidden`: Certificato revocato o ruolo non riconosciuto.

### Schema Relazionale (Database Silo 2 - Bunker Enclave PostgreSQL):
- `club_tenants`: `id VARCHAR(64) PK`, `club_name VARCHAR(128)`, `kms_key_resource_name TEXT NOT NULL`, `sso_metadata_url TEXT`, `created_at TIMESTAMPTZ`.
- `club_staff`: `id UUID PK`, `club_id VARCHAR(64) FK -> club_tenants.id`, `corporate_email VARCHAR(255)`, `role_code VARCHAR(32) NOT NULL`, `fido2_key_id VARCHAR(128)`, `is_active BOOLEAN DEFAULT TRUE`.
- `worm_audit_vault`: `id UUID PK`, `club_id VARCHAR(64)`, `actor_email VARCHAR(255)`, `action_performed VARCHAR(64)`, `target_resource VARCHAR(128)`, `client_ip INET`, `created_at TIMESTAMPTZ NOT NULL`.

---

## 7. Ereditarietà di Tier & Differenziali di Fascia

- **Ereditarietà da Tier 1 e Tier 2:**  
  Il club eredita tutte le logiche di catalogazione e allenamento dei tier inferiori, ma le colloca in un'infrastruttura di sicurezza radicalmente separata.
- **Esclusività Assoluta di Tier 3 Enterprise:**
  - Crittografia a tenuta stagna con chiavi hardware **Google Cloud KMS dedicate (CMEK)**;
  - Autenticazione a doppio fattore con certificati macchina **mTLS e chiavette fisiche FIDO2**;
  - Segregazione multi-staff con **audit log WORM a valore legale** per scongiurare fughe di notizie.
- **Divieto di Retrocessione:**  
  Nessuna di queste tecnologie enterprise può essere retrocessa a Tier 1 o Tier 2.
