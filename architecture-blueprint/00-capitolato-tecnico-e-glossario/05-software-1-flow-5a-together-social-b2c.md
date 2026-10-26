# Capitolato Tecnico: Flow 5A – Together Social Community & Coach Marketplace (T7 Consumer)

## 1. Identificativo & Titolo Ufficiale
- **Codice Univoco:** `FLOW-5A`
- **Titolo Ufficiale:** SOFTWARE 1 (B2C CONSUMER) - FLOW 5A: TOGETHER SOCIAL COMMUNITY & COACH MARKETPLACE
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 1: General User / Casual, Colonna 5: Community & Marketplace)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-1-consumer-b2c/flow-5a-together-social-b2c.mmd`

---

## 2. Obiettivo di Business & Target Utente
- **Target Utente:** Utenti comuni e atleti amatoriali che desiderano condividere i propri traguardi, confrontarsi con una community di appassionati ed esplorare il marketplace per ingaggiare coach, nutrizionisti o fisioterapisti certificati (Tier 1 – B2C).
- **Problema Risolto:** Evitare l'isolamento dell'atleta che si allena a casa o in palestra fornendo uno spazio sociale costruttivo (condivisione PR verificati e schede di allenamento) e un canale diretto, trasparente e sicuro per trovare professionisti dello sport con competenze certificate, prevenendo fake coaches e truffe commerciali.

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)
1. **Corsia 1: Thin Client UI/UX (Social & Marketplace - React 18):**
   - Feed community con post dinamici, badge traguardi, interazioni (like, commenti costruttivi), modale per condividere un nuovo PR appena superato, tab di esplorazione del marketplace dei coach con filtri per specialità e pulsante per inviare richieste di ingaggio.
2. **Corsia 2: API Gateway & Social Routing (Envoy / Kong):**
   - Smistamento richieste feed (`/feed`), pubblicazione post (`/posts`) e lead commerciali verso i coach (`/hire-request`), integrato con filtri di moderazione automatica dei contenuti e scudo anti-spam.
3. **Corsia 3: Server Scatola Nera (Social & Matching Engine - Cloud Run):**
   - Algoritmo di ranking del feed (priorità a traguardi degli amici stretti e contenuti scientificamente rilevanti), motore di matching geografico e tematico tra atleta e professionista, e dispatcher notifiche push/email.
4. **Corsia 4: Database Silo 1 (Social & Marketplace Relational Store - PostgreSQL):**
   - Tabelle pubbliche `social_posts`, `social_likes`, `social_comments` e tabella protetta `coaching_leads` per collegare la richiesta dell'atleta al tenant del coach prescelto.

---

## 4. Flusso Operativo Passo-Passo (Nodi Numerati)
1. **START (Accesso Sezione Together):** L'utente tocca la tab "Together" nella bottom bar di navigazione.
2. **FEED_VIEW (Visualizzazione Feed):** Il client invia una richiesta `GET /api/v1/social/feed` all'API Gateway (`GW_FEED_REQ`). Il server (`SRV_FEED_ALG`) calcola la lista dei post rilevanti ordinati per freschezza e interazioni dei contatti seguiti, leggendo da Silo 1 (`DB_POSTS`).
3. **SHARE_PR_MODAL (Condivisione Traguardo):** Quando un atleta supera un record (es. "Nuovo PR di Squat: 120 kg!"), può aprire la modale di condivisione e cliccare "Condividi con la Community".
4. **GW_SHARE_POST & GW_SPAM_CHECK (Controllo Qualità Post):** La richiesta `POST /api/v1/social/posts` attraversa il gateway. Se vengono rilevati link malevoli, linguaggio offensivo o pattern di spam, la richiesta viene bloccata con HTTP 422 (`GW_BLOCK`). Se approvata, il post viene salvato in `DB_POSTS` e appare immediatamente nel feed.
5. **MARKETPLACE_BROWSE (Esplorazione Vetrina Professionisti):** L'atleta passa alla tab "Trova un Coach". Può filtrare i professionisti per:
   - Disciplina: Powerlifting, Bodybuilding, Calisthenics, Riabilitazione Posturale, Corsa.
   - Città/Zona o Coaching Online a distanza.
   - Tariffe mensili trasparenti e recensioni verificate da allievi reali.
6. **HIRE_COACH_BTN (Richiesta Consulenza):** L'atleta seleziona il profilo del professionista desiderato e tocca "Invia Richiesta Coaching".
7. **CONFIRM_MODAL (Modale di Riepilogo):** L'atleta descrive brevemente i propri obiettivi (es. "Vorrei preparare una gara di mezza maratona in 6 mesi") e conferma l'invio.
8. **GW_COACH_LEAD (Creazione Lead Commerciale):** L'API Gateway inoltra la richiesta al motore di matching (`SRV_MATCH`).
9. **DB_LEADS (Persistenza Lead):** Viene creato un record formale in `coaching_leads` con stato `PENDING`.
10. **SRV_DISPATCH (Notifica al Professionista):** Il server invia una notifica push e un'email istituzionale al coach, segnalando un potenziale nuovo allievo.
11. **END_INTERACTION (Fine Flusso):** Post pubblicato con successo o richiesta di coaching inoltrata al professionista.

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI
- **Decisione Moderazione Contenuti (`GW_SPAM_CHECK`):** Conforme $\implies$ Pubblicazione; Flag Spam/Offensivo $\implies$ Blocco HTTP 422.
- **Decisione Tipologia Interazione:** Post su Feed Pubblico vs Ingaggio Diretto Professionista.

### Gestione dei 4 Stati UI:
1. **Empty State:** Nessun post recente nel feed locale; visualizzazione di post in evidenza dal canale ufficiale T7 Workout Academy e invito a seguire amici.
2. **Loading State:** Skeleton card con placeholder per avatar, testo e immagine durante l'infinite scrolling del feed.
3. **Populated State:** Feed dinamico con reazioni animate, schede tecniche allegate con anteprima 3D e contatore commenti.
4. **Error / Fallback State:** Fallimento di rete durante la pubblicazione di un commento; comparsa del pulsante "Riprova invio" con persistenza locale temporanea del testo digitato.

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Endpoint Principali:
- `GET /api/v1/social/feed?page=1&limit=20`:
  - Output: `[{ postId: string, author: { id, name, avatarUrl }, content: string, badgePr?: { exercise: string, loadKg: number }, likesCount: 42, commentsCount: 7 }]`
- `POST /api/v1/social/posts`: `{ authorId: string, text: string, attachedWorkoutId?: string }`
- `POST /api/v1/marketplace/hire-request`: `{ athleteId: string, coachId: string, goalDescription: string, preferredPackageId: string }` $\to$ `{ leadId: string, status: 'submitted' }`

### Tabelle Database Coinvolte (Silo 1):
- `social_posts`: id, author_id, text_content, media_url, workout_ref_id, pr_data (JSONB), created_at.
- `social_likes`: post_id, user_id, created_at.
- `social_comments`: id, post_id, author_id, comment_text, created_at.
- `coaching_leads`: id, athlete_id, coach_id, package_id, message, lead_status ('PENDING'|'ACCEPTED'|'REJECTED'), created_at.

---

## 7. Ereditarietà di Tier & Differenziali di Fascia
- **Integrazione B2C/B2B:** Questo flusso costituisce il ponte tra il mondo Consumer (Tier 1) e il mondo Professionale (Tier 2).
- **Propagazione a Cascata Top-Down:**
  - Nel Tier 2 (Partita IVA - `flow-5b`), il professionista riceve i lead generati da questo flusso nella propria dashboard business "Together Pro Business", risponde ai messaggi, accetta i contratti e revisiona i video degli allievi con strumenti avanzati di annotazione biomeccanica.
  - Nel Tier 3 (Elite Club - `flow-5c`), qualsiasi funzionalità di socializzazione pubblica o marketplace è **tassativamente rimossa**: i video e i dati tattici sono segregati a tenuta stagna nel bunker Silo 2 (Zero commistione social).
- **Differenziali:** Il General User consuma il marketplace e posta nella community; il professionista Tier 2 monetizza e gestisce il proprio portafoglio clienti; il Tier 3 è blindato enterprise.
