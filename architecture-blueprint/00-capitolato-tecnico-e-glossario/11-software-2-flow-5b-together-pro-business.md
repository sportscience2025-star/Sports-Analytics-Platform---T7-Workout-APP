# Capitolato Tecnico: Flow 5B – Together Pro Business & Remote Client Review (T7 Pro Coach)

## 1. Identificativo & Titolo Ufficiale
- **Codice Univoco:** `FLOW-5B`
- **Titolo Ufficiale:** SOFTWARE 2 (B2B PRO P.IVA) - FLOW 5B: TOGETHER PRO BUSINESS & REMOTE CLIENT REVIEW
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 2: Partita IVA / Coaches & Fisioterapisti, Colonna 5: Marketplace & Video Review Remota)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-2-pro-b2b/flow-5b-together-pro-business.mmd`

---

## 2. Obiettivo di Business & Target Utente
- **Target Utente:** Personal trainer, preparatori atletici online e studi di consulenza sportiva (Tier 2 – B2B Freelance).
- **Problema Risolto:** Gestire l'intero ciclo commerciale del coaching a distanza in un unico ambiente protetto:
  1. Pubblicazione della vetrina professionale con pacchetti e tariffe trasparenti;
  2. Ricezione e accettazione delle richieste di allievi provenienti dalla community B2C;
  3. Gestione dei pagamenti con protezione anti-chargeback (Stripe Escrow);
  4. Strumento avanzato di **Video Review Asincrona**: il coach riceve i video registrati dagli allievi durante le sedute, disegna in sovrimpressione linee di forza e angoli articolari, aggiunge note vocali sincronizzate al millisecondo e rilascia feedback correttivi professionali.

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)
1. **Corsia 1: Thin Client UI/UX (Pro Business Suite - React 18):**
   - Editor vetrina pubblica del professionista, inbox richieste di coaching con azioni Accetta/Rifiuta, coda di revisione video con player interattivo a frame singolo (60 fps), strumenti di disegno canvas (goniometro articolare, frecce di traiettoria, cerchi di stabilità) e registrazione memo vocale.
2. **Corsia 2: API Gateway & Media Upload (Envoy / CDN Signed URLs):**
   - Generazione di URL firmati crittograficamente per il caricamento video sicuro, endpoint gestione lead (`/leads/{id}/respond`) e rilascio feedback (`/video-reviews/{id}/feedback`).
3. **Corsia 3: Server Scatola Nera (Contract & Media Engine - Cloud Run):**
   - Attivazione formale del contratto di coaching tra coach e allievo (con assegnazione automatica del piano nel diario del cliente), transcodifica video con fusione dei metadati grafici/vocali in un formato compresso e dispatcher notifiche push immediate.
4. **Corsia 4: Database Silo 1 (Pro Business Data Store - PostgreSQL):**
   - Tabella `pro_showcase` per le informazioni del profilo pubblico, `coaching_packages` per i listini e `video_feedbacks` per l'archiviazione delle revisioni tecniche e delle note vocali.

---

## 4. Flusso Operativo Passo-Passo (Nodi Numerati)
1. **START (Accesso Gestione Business):** Il professionista apre la sezione "Business & Allievi" dal menu principale.
2. **PROFILE_EDITOR (Gestione Vetrina):** Il coach definisce la propria biografia, i titoli di studio (Laurea Scienze Motorie, certificazioni), la galleria fotografica, i pacchetti di consulenza mensili/trimestrali e le recensioni verificate. L'invio aggiorna `DB_PRO_PROFILE` via `GW_SAVE_PROFILE`.
3. **INBOX_LEADS (Gestione Richieste Allievo):** Quando un utente consumer invia una richiesta dal marketplace (generata nel `flow-5a`), essa atterra in questa casella:
   - Il coach legge gli obiettivi e lo storico dell'atleta.
   - Può cliccare su "Accetta Richiesta" o "Rifiuta con motivazione".
   - All'accettazione, il server Scatola Nera (`SRV_CONTRACT_BIND`) crea il legame contrattuale e associa il profilo dell'atleta al roster attivo del coach.
4. **VIDEO_REVIEW_QUEUE (Coda Revisione Esecuzioni Video):** Lista delle clip video inviate dagli atleti per il controllo della tecnica esecutiva (es. "Controllo alzata Stacco da terra 140 kg").
5. **VIDEO_CANVAS (Player con Tool di Sovrimpressione):** Il coach apre il video dell'atleta su un player professionale:
   - Scorrimento avanti/indietro fotogramma per fotogramma (scrubbing a 60 fps).
   - Strumenti di annotazione su canvas trasparente: tracciamento della traiettoria del bilanciere (bar path), misurazione dell'angolo di flessione del ginocchio e della colonna vertebrale.
   - Registrazione nota vocale sincronizzata: il coach parla sopra il video evidenziando i punti critici.
6. **SEND_FEEDBACK_BTN (Invio Feedback):** Il coach conferma l'invio della revisione all'atleta.
7. **GW_MEDIA_FEEDBACK & AUTH (Verifica Gateway):** L'API Gateway autentica la richiesta tramite URL firmato e autorizzazione JWT.
8. **SRV_TRANSCODE (Elaborazione Server):** Il server Scatola Nera esporta il video arricchito con le annotazioni vettoriali e la traccia audio, generando un player compatto visualizzabile dall'atleta.
9. **DB_VIDEO_REVIEWS (Archiviazione Silo 1):** Persistenza delle note e dei dati temporali nella tabella `video_feedbacks`.
10. **SRV_NOTIF_DISPATCH (Notifica Push Istantanea):** Il server invia una notifica push sullo smartphone dell'allievo: *"Il tuo coach Marco ha revisionato il tuo video di Stacco da terra. Guarda le correzioni"*.
11. **END_BIZ_DONE (Fine Flusso):** Feedback consegnato con successo e sessione registrata.

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI
- **Decisione Lead Inbox (`INBOX_LEADS`):** Accetta cliente $\implies$ Binding contrattuale e invito roster; Rifiuta $\implies$ Notifica cortese e rilascio credito allievo.
- **Decisione Media Auth (`GW_MEDIA_AUTH`):** Token firmato valido $\implies$ Transcodifica; Token scaduto $\implies$ Rigenerazione credenziale.

### Gestione dei 4 Stati UI:
1. **Empty State:** Coda video vuota; messaggio distensivo "Nessun video in attesa di revisione: i tuoi allievi sono aggiornati!".
2. **Loading State:** Elaborazione della transcodifica video con barra percentuale durante l'upload dei vettori di annotazione.
3. **Populated State:** Interfaccia video fluida con controlli multimediali professionali, forme geometriche personalizzabili e traccia audio visibile come waveform.
4. **Error / Fallback State:** Fallimento di connessione durante la registrazione del memo vocale; salvataggio della bozza locale su IndexedDB con opzione di re-invio senza perdere le forme disegnate.

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Endpoint Principali:
- `PUT /api/v1/pro/profile/showcase`:
  - Input: `{ proId: string, bio: string, specialties: string[], pricingPackages: [{ title: string, priceEur: number, durationMonths: number }] }`
- `POST /api/v1/pro/video-reviews/{id}/feedback`:
  - Input: `{ reviewId: string, athleteId: string, annotations: [{ timestampSec: number, type: 'angle'|'path'|'text', data: Object }], voiceAudioUrl?: string }`
  - Output: `{ status: 'delivered', notifiedAt: string }`

### Tabelle Database Coinvolte (Silo 1):
- `pro_showcase`: pro_id, bio, specialties (ARRAY), packages_json, is_accepting_new_clients.
- `coaching_contracts`: id, pro_id, athlete_id, start_date, end_date, monthly_fee_eur, status ('ACTIVE'|'PAUSED'|'TERMINATED').
- `video_feedbacks`: id, contract_id, athlete_id, original_video_url, annotated_payload (JSONB), voice_memo_url, created_at.

---

## 7. Ereditarietà di Tier & Differenziali di Fascia
- **Integrazione con Tier 1:** Risponde direttamente alle richieste originate dal flusso consumer `flow-5a`, consentendo al professionista di monetizzare le proprie competenze.
- **Propagazione verso Tier 3:** Nel Tier 3 (Elite Club - `flow-5c`), l'analisi video si eleva a livello di Computer Vision markerless per l'intera squadra sul campo di gara (rilevamento spaziature e diagrammi di Voronoi), ma **viene totalmente depurata da qualsiasi componente commerciale o di marketplace pubblico**.
- **Differenziali:** Il Tier 2 gestisce un rapporto 1-a-1 con singoli clienti paganti; il Tier 3 opera su scala di squadra e staff multidisciplinare all'interno del bunker societario.
