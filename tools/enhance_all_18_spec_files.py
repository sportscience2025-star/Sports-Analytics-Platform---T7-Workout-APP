# -*- coding: utf-8 -*-
"""
Script di potenziamento completo dei 18 file di capitolato tecnico:
- Allineamento Badge Miro, Shape ID e Coordinate reali (inclusa correzione #02 e #08)
- Inserimento Mermaid sequenceDiagram asincrono a 4 corsie (Client UI <-> Gateway <-> Server <-> Silos) tra Sez 3 e Sez 4
- Inserimento Tabella KPI di Accettazione Operativa & Clinica nel Livello A di Sez 4
- Inserimento Matrice Errori HTTP & Resilienza standardizzata a 6 colonne nella Sez 6
"""
import os
import re

BASE_DIR = os.path.join("architecture-blueprint", "00-capitolato-tecnico-e-glossario")

SPECS = {
    "01": {
        "file": "01-software-1-flow-1a-consumer-onboarding.md",
        "badge_id": "3458764688417722706",
        "badge_pos": "X: -2570, Y: 260",
        "seq_title": "Sequence Diagram Asincrono del Ciclo di Vita (FLOW-1A)",
        "seq_code": r"""sequenceDiagram
    autonumber
    actor Utente as Thin Client UI (React 18)
    participant GW as API Gateway & Envoy (Corsia 2)
    participant SRV as Server Scatola Nera (Corsia 3)
    participant DB as Database Silo 1 (Corsia 4)

    Utente->>GW: POST /api/v1/auth/register-b2c (Email, Dati, X-Turnstile-Token)
    GW->>GW: Convalida Token Cloudflare Turnstile & Filtro Anti-Bot
    GW->>SRV: Inoltro payload registrazione verificata
    SRV->>SRV: Hash credenziali Argon2id & verifica maggiorenne (Age Gate)
    SRV->>DB: Inserimento anagrafica auth_users & athlete_profiles
    DB-->>SRV: Conferma transazione UUID utente
    SRV-->>GW: Emissione JWT Bearer (Tier 1) & Refresh Token HttpOnly
    GW-->>Utente: 201 Created (Redirect a Screening Sanitario)
    
    Utente->>GW: POST /api/v1/auth/parq-waiver (7 risposte booleane, firma SHA-256)
    GW->>SRV: Dispatch valutazione clinica
    SRV->>SRV: Calcolo BMR (Mifflin-St Jeor) & Valutazione Red Flags PAR-Q+
    SRV->>DB: Archiviazione immutabile health_waivers (Audit Trail)
    DB-->>SRV: Commit confermato
    alt Red Flags = 0 (Idoneità Piena)
        SRV-->>Utente: 200 OK (FULL_CLEARANCE, cautionMode: false, BMR calcolato)
    else Red Flags >= 1 (Idoneità Cautelativa)
        SRV-->>Utente: 200 OK (MEDICAL_CAUTION, cautionMode: true, filtri assiali attivi)
    end""",
        "kpi_table": r"""#### Indicatori di Accettazione Operativa & Clinica (KPI)
| Metrica / Parametro | Obiettivo Target | Tolleranza Accettabile | Azione Fallback / Allerta |
| :--- | :--- | :--- | :--- |
| **Conversione Onboarding** | $> 92\%$ utenti completati | $\ge 88\%$ | Trigger A/B test form semplificato |
| **Latenza Turnstile Challenge** | $< 350\text{ ms}$ | $\le 600\text{ ms}$ | Silent retry su endpoint secondario |
| **Accuratezza Calcolo BMR** | $100\%$ deterministico | $0\%$ scostamento | Ricalcolo server-side immediato |
| **Audit Log PAR-Q+ SHA-256** | $100\%$ manleve con hash | $0\%$ omissioni | Blocco emissione token e rollback |""",
        "error_table": r"""### Matrice Errori HTTP & Strategie di Resilienza
| HTTP Code | Codice Interno | Endpoint | Causa Scatenante | UX Feedback Visivo | Strategia di Resilienza & Fallback |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **400** | `ERR_INVALID_AGE` | `POST /register-b2c` | Data di nascita con età $< 18$ anni | Modale: *"Richiesta maggiore età per iscriversi"* | Blocco form con evidenziazione campo data |
| **401** | `ERR_AUTH_EXPIRED` | `POST /parq-waiver` | Token di sessione scaduto o revocato | Banner: *"Sessione scaduta, effettua nuovo accesso"* | Rinnovo automatico via Refresh Token HttpOnly |
| **403** | `ERR_BOT_DETECTED` | `POST /register-b2c` | Fallimento challenge Cloudflare Turnstile | Alert: *"Rilevata attività anomala. Riprova più tardi"* | Rigenerazione token challenge trasparente |
| **409** | `ERR_EMAIL_EXISTS` | `POST /register-b2c` | Indirizzo email già presente a sistema | Tooltip: *"Email già registrata. Accedi o recupera"* | Proposta switch a login 1-tap con Passkey |
| **429** | `ERR_RATE_LIMIT` | `POST /register-b2c` | Più di 5 tentativi di iscrizione/min per IP | Toast: *"Troppi tentativi. Attendi 60 secondi"* | Blocco temporaneo client con countdown timer |
| **500** | `ERR_BMR_COMPUTE` | `POST /parq-waiver` | Eccezione nel calcolo metabolico server | Banner ambrato: *"Profilo creato, calcolo in corso"* | Assegnazione BMR medio e job asincrono in coda |"""
    },
    "02": {
        "file": "02-software-1-flow-2a-personal-cockpit.md",
        "badge_id": "3458764688417722707",
        "badge_pos": "X: 27.35, Y: 179.87",
        "seq_title": "Sequence Diagram Asincrono del Ciclo di Vita (FLOW-2A)",
        "seq_code": r"""sequenceDiagram
    autonumber
    actor Utente as Thin Client UI (Three.js WebGL)
    participant GW as API Gateway & Redis Cache (Corsia 2)
    participant CDN as Cloud CDN / Cloud Run (Corsia 3)
    participant DB as Database Silo 1 (Corsia 4)

    Utente->>GW: GET /api/v1/catalog/exercises (muscle, pattern, search)
    alt Cache Hit (Edge Redis)
        GW-->>Utente: 200 OK (Catalog JSON compresso gzip, latenza < 15ms)
    else Cache Miss
        GW->>DB: Query catalog_exercises filtrata
        DB-->>GW: Righe esercizi & metadati biomeccanici
        GW->>GW: Memorizzazione cache Redis (TTL 24h)
        GW-->>Utente: 200 OK (Catalog JSON generato)
    end

    Utente->>Utente: Selezione Esercizio & Rilevamento WebGL 2.0
    alt WebGL Supportato e Memoria GPU Valida
        Utente->>CDN: GET /models3d/exercise_draco.glb
        CDN-->>Utente: Mesh 3D compressa (1-2 MB)
        Utente->>Utente: Decompressione Draco in Web Worker & OrbitControls
    else WebGL Assente o Crash Contesto GPU
        Utente->>CDN: GET /videos2d/exercise_fallback_60fps.mp4
        CDN-->>Utente: Stream video 2D H.265 in loop
        Utente->>Utente: Rendering graceful fallback 2D
    end

    Utente->>GW: POST /api/v1/catalog/favorites (exerciseId)
    GW->>DB: INSERT user_favorites (user_id, exercise_id)
    DB-->>GW: Commit completato
    GW-->>Utente: 200 OK (Stato preferito aggiornato)""",
        "kpi_table": r"""#### Indicatori di Accettazione Operativa & Clinica (KPI)
| Metrica / Parametro | Obiettivo Target | Tolleranza Accettabile | Azione Fallback / Allerta |
| :--- | :--- | :--- | :--- |
| **Framerate Rendering 3D** | $\ge 60\text{ FPS}$ stabili | $\ge 35\text{ FPS}$ | Attivazione Progressive LOD o fallback 2D |
| **Dimensione Mesh Draco** | $< 1.5\text{ MB}$ per modello | $\le 2.5\text{ MB}$ | Decimazione automatica dei poligoni |
| **Latenza Query Catalogo Edge** | $< 15\text{ ms}$ (Cache Hit) | $\le 50\text{ ms}$ | Servizio offline da Service Worker cache |
| **Reattività Debounce Ricerca** | $250\text{ ms}$ | $\pm 50\text{ ms}$ | Filtraggio istantaneo su array in-memory |""",
        "error_table": r"""### Matrice Errori HTTP & Strategie di Resilienza
| HTTP Code | Codice Interno | Endpoint | Causa Scatenante | UX Feedback Visivo | Strategia di Resilienza & Fallback |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **400** | `ERR_BAD_FILTER` | `GET /catalog/exercises` | Parametro di filtro muscolare non valido | Badge: *"Filtro non riconosciuto"* | Reset automatico ai filtri di default |
| **401** | `ERR_UNAUTHORIZED` | `GET /catalog/exercises` | Token JWT mancante o firma non valida | Redirect a schermata di login | Salvataggio stato ricerca in sessionStorage |
| **404** | `ERR_EXERCISE_404` | `GET /catalog/exercises/:id` | ID esercizio non presente nel database | Schermata: *"Esercizio rimosso dal catalogo"* | Reindirizzamento alla griglia generale |
| **429** | `ERR_CATALOG_FLOOD` | `GET /catalog/exercises` | Superamento soglia 60 chiamate/minuto | Toast: *"Rallenta le ricerche per favore"* | Applicazione debounce rinforzato client-side |
| **502** | `ERR_CDN_UNREACHABLE` | `GET /models3d/*.glb` | Asset CDN 3D momentaneamente non raggiungibile | Alert trasparente: *"Passaggio a vista 2D..."* | Fallback immediato a video MP4 compresso |
| **503** | `ERR_REDIS_DOWN` | `GET /catalog/exercises` | Cluster Redis temporaneamente offline | Nessun errore visibile all'utente | Fallback trasparente su query diretta PostgreSQL |"""
    },
    "03": {
        "file": "03-software-1-flow-3a-workout-player.md",
        "badge_id": "3458764688417722711",
        "badge_pos": "X: 2459, Y: 465",
        "seq_title": "Sequence Diagram Asincrono del Ciclo di Vita (FLOW-3A)",
        "seq_code": r"""sequenceDiagram
    autonumber
    actor Utente as Thin Client Player (Offline-First)
    participant IDB as IndexedDB Locale (Client)
    participant GW as API Gateway (Corsia 2)
    participant SRV as Server Scatola Nera (Corsia 3)
    participant DB as Database Silo 1 (Corsia 4)

    Utente->>IDB: Registrazione serie (setIndex, reps: 8, kg: 80, RPE: 8)
    IDB-->>Utente: Salvataggio locale confermato (< 5ms)
    Utente->>Utente: Calcolo sub-max 1RM (Epley) & Avvio Timer Recupero

    alt Connessione Online Attiva
        Utente->>GW: POST /api/v1/workout/sets (Payload serie)
        GW->>SRV: Dispatch validazione serie
        SRV->>DB: INSERT workout_sets & Aggiornamento tonnellaggio
        DB-->>SRV: Commit confermato
        SRV-->>Utente: 200 OK (Set memorizzato)
    else Connessione Assente (Offline Mode)
        Utente->>IDB: Accodamento in optimistic_sync_queue
        Note over Utente,IDB: Allenamento prosegue senza blocchi UI
        Utente->>Utente: Rilevamento evento 'online' di rete
        Utente->>GW: POST /api/v1/workout/sync-batch (Coda mutazioni pendenti)
        GW->>SRV: Elaborazione transazionale batch
        SRV->>DB: Scrittura massiva Silo 1 & Ricalcolo streak
        DB-->>SRV: Commit batch completato
        SRV-->>Utente: 200 OK (Coda svuotata con successo)
        Utente->>IDB: Svuotamento optimistic_sync_queue
    end""",
        "kpi_table": r"""#### Indicatori di Accettazione Operativa & Clinica (KPI)
| Metrica / Parametro | Obiettivo Target | Tolleranza Accettabile | Azione Fallback / Allerta |
| :--- | :--- | :--- | :--- |
| **Disponibilità Offline-First** | $100\%$ sessioni offline | $\ge 99.9\%$ | Persistenza garantita su IndexedDB |
| **Latenza Salvataggio Locale** | $< 5\text{ ms}$ | $\le 20\text{ ms}$ | Aggiornamento ottimistico dello stato UI |
| **Tempo Svuotamento Coda Sync** | $< 2\text{ s}$ dal ritorno online | $\le 5\text{ s}$ | Riprova con backoff esponenziale ($1, 2, 4, 8\text{s}$) |
| **Accuratezza Tonnellaggio** | $100\%$ deterministico | $0\%$ errore | Audit trail e ricalcolo asincrono server |""",
        "error_table": r"""### Matrice Errori HTTP & Strategie di Resilienza
| HTTP Code | Codice Interno | Endpoint | Causa Scatenante | UX Feedback Visivo | Strategia di Resilienza & Fallback |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **400** | `ERR_NEGATIVE_VALUES` | `POST /workout/sets` | Ripetizioni o carico negativi/nulli | Bordo rosso: *"Inserisci valori validi"* | Validazione client preventiva prima dell'invio |
| **401** | `ERR_SESSION_INVALID` | `POST /workout/sync-batch` | Token scaduto durante allenamento offline | Banner non intrusivo: *"Offline"* | Mantenimento dati in IndexedDB fino a re-login |
| **409** | `ERR_TIMESTAMP_CONFLICT` | `POST /workout/sync-batch` | Serie già registrata con timestamp identico | Nessun blocco visibile all'utente | Risoluzione conflitti via Last-Write-Wins (LWW) |
| **422** | `ERR_MALFORMED_SET` | `POST /workout/sets` | Formato JSON non conforme alla tipizzazione | Notifica: *"Errore di registrazione serie"* | Ripristino copia locale da IndexedDB |
| **500** | `ERR_STREAK_FAILURE` | `POST /workout/finish` | Errore calcolo giorni consecutivi | Icona ambrata: *"Streak in elaborazione"* | Job server differito e allineamento successivo |
| **503** | `ERR_SYNC_UNAVAILABLE` | `POST /workout/sync-batch` | Server temporaneamente sovraccarico | Icona nuvola arancione (coda pendente) | Accodamento per riprova automatica differita |"""
    },
    "04": {
        "file": "04-software-1-flow-4a-wearable-sync.md",
        "badge_id": "3458764688417722715",
        "badge_pos": "X: 4171, Y: 465",
        "seq_title": "Sequence Diagram Asincrono del Ciclo di Vita (FLOW-4A)",
        "seq_code": r"""sequenceDiagram
    autonumber
    actor Utente as Thin Client UI / Native Bridge
    participant WAPI as Apple HealthKit / Google Connect
    participant GW as API Gateway (Corsia 2)
    participant SRV as Server Scatola Nera (Corsia 3)
    participant DB as Database Silo 1 (Corsia 4)

    Utente->>WAPI: Richiesta estrazione dati (HRV rMSSD, FC Riposo, Ore Sonno)
    WAPI-->>Utente: Array campioni biometrici grezzi
    Utente->>GW: POST /api/v1/telemetry/wearable-sync (Array campioni + DeviceID)
    GW->>SRV: Inoltro pipeline telemetrica
    SRV->>SRV: Applicazione Filtro Outlier MAD (scarto battiti spuri)
    SRV->>SRV: Calcolo Training Readiness Composite Score (0-100)
    SRV->>DB: INSERT daily_readiness_logs (score, rMSSD, sleep_hours)
    DB-->>SRV: Commit completato
    SRV-->>Utente: 200 OK (readinessScore: 84, recommendation: "HIGH_INTENSITY_CLEAR")
    Utente->>Utente: Rendering quadrante Readiness & suggerimento carichi""",
        "kpi_table": r"""#### Indicatori di Accettazione Operativa & Clinica (KPI)
| Metrica / Parametro | Obiettivo Target | Tolleranza Accettabile | Azione Fallback / Allerta |
| :--- | :--- | :--- | :--- |
| **Scarto Outlier Sensore (MAD)** | $\ge 98\%$ artefatti rimossi | $\ge 95\%$ | Flagging dato con etichetta "low_confidence" |
| **Tempo Calcolo Readiness** | $< 120\text{ ms}$ | $\le 300\text{ ms}$ | Assegnazione punteggio medio personale 7gg |
| **Frequenza Sync Wearable** | Ogni 6 ore (in background) | Entro 12 ore | Invito gentile al sync manuale a schermo |
| **Privacy Dati Biometrici** | Cifratura AES-256 a riposo | $0\%$ compromissione | Blocco ingestione immediato in caso di anomalie |""",
        "error_table": r"""### Matrice Errori HTTP & Strategie di Resilienza
| HTTP Code | Codice Interno | Endpoint | Causa Scatenante | UX Feedback Visivo | Strategia di Resilienza & Fallback |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **400** | `ERR_UNSUPPORTED_DEV` | `POST /wearable-sync` | Formato dati da smartwatch non supportato | Dialog: *"Dispositivo non compatibile"* | Suggerimento esportazione formato standard Fit/GPX |
| **401** | `ERR_BRIDGE_AUTH` | `POST /wearable-sync` | Permessi Apple Health / Health Connect revocati | Banner: *"Autorizza l'accesso ai dati sanitari"* | Apertura impostazioni permessi del sistema operativo |
| **403** | `ERR_BIOMETRIC_DENIED`| `POST /wearable-sync` | Consenso Art. 9 GDPR non presente | Alert: *"Consenso biometrico necessario"* | Reindirizzamento al modulo consensi di profilo |
| **422** | `ERR_INSUFFICIENT_DATA`| `POST /wearable-sync` | Campioni HRV insufficienti per calcolo affidabile | Quadrante neutro: *"Dati sonno/HRV parziali"* | Utilizzo baseline anamnestica e richiesta RPE soggettivo |
| **500** | `ERR_MAD_ALGORITHM` | `POST /wearable-sync` | Eccezione nel modulo MAD per varianza nulla | Valore default ambrato: *"Readiness stimata"* | Fallback su media mobile aritmetica semplice |
| **504** | `ERR_HEALTH_TIMEOUT` | `POST /wearable-sync` | Timeout gateway durante elaborazione massiva | Toast: *"Sincronizzazione in corso in background"* | Elaborazione asincrona e notifica push al termine |"""
    },
    "05": {
        "file": "05-software-1-flow-5a-together-social-b2c.md",
        "badge_id": "3458764688417722718",
        "badge_pos": "X: 6048, Y: 465",
        "seq_title": "Sequence Diagram Asincrono del Ciclo di Vita (FLOW-5A)",
        "seq_code": r"""sequenceDiagram
    autonumber
    actor Utente as Thin Client UI (Together Feed)
    participant GW as API Gateway & Rate Limit (Corsia 2)
    participant REDIS as Redis Cluster ZSET (Corsia 3)
    participant SRV as Server Fan-Out Worker (Corsia 3)
    participant DB as Database Silo 1 (Corsia 4)

    Utente->>GW: GET /api/v1/social/feed?page=1&limit=20
    GW->>REDIS: ZREVRANGEBYSCORE timeline:user_id (Range timestamp)
    REDIS-->>GW: Lista ID post ordinati per freschezza (< 50ms)
    GW->>DB: Multi-get contenuti post & avatar autori
    DB-->>GW: Record post arricchiti
    GW-->>Utente: 200 OK (Feed timeline renderizzata)

    Utente->>GW: POST /api/v1/social/posts (Testo, Immagine, Traguardo)
    GW->>GW: Verifica Step-Up SMS & Controllo Spam
    GW->>SRV: Dispatch nuovo post
    SRV->>DB: INSERT social_posts in Silo 1
    DB-->>SRV: Post ID generato
    SRV->>REDIS: Fan-Out on Write (ZADD nelle timeline dei follower)
    REDIS-->>SRV: Fan-Out completato (< 500ms)
    SRV-->>Utente: 201 Created (Post pubblicato istantaneamente)""",
        "kpi_table": r"""#### Indicatori di Accettazione Operativa & Clinica (KPI)
| Metrica / Parametro | Obiettivo Target | Tolleranza Accettabile | Azione Fallback / Allerta |
| :--- | :--- | :--- | :--- |
| **Latenza Rendering Feed** | $< 50\text{ ms}$ (Redis ZSET) | $\le 100\text{ ms}$ | Query paginata diretta su PostgreSQL Silo 1 |
| **Velocità Fan-Out on Write** | $< 500\text{ ms}$ per 1.000 follower | $\le 1.5\text{ s}$ | Accodamento asincrono su Cloud Tasks |
| **Tasso Blocco Account Troll** | $> 99.5\%$ profili fake fermati | $\ge 98\%$ | Attivazione shadowban su analisi del testo |
| **Affidabilità Checkout Coach** | $> 97\%$ conversioni Stripe | $\ge 94\%$ | Notifica recupero carrello e webhook retry |""",
        "error_table": r"""### Matrice Errori HTTP & Strategie di Resilienza
| HTTP Code | Codice Interno | Endpoint | Causa Scatenante | UX Feedback Visivo | Strategia di Resilienza & Fallback |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **400** | `ERR_EMPTY_POST` | `POST /social/posts` | Contenuto post privo di testo e media | Bordo arancione: *"Scrivi un messaggio"* | Blocco pulsante di invio client-side |
| **401** | `ERR_LOGIN_REQUIRED` | `POST /social/posts` | Tentativo di interazione da utente anonimo | Modale: *"Accedi per commentare o postare"* | Reindirizzamento a login preservando bozza |
| **403** | `ERR_STEPUP_NEEDED` | `POST /social/posts` | Numero cellulare non verificato via SMS | Dialog: *"Verifica il telefono per tutelare la community"* | Avvio flusso modale Twilio SMS OTP |
| **429** | `ERR_SPAM_FLOOD` | `POST /social/posts` | Più di 3 post pubblicati in 60 secondi | Banner rosso: *"Stai postando troppo velocemente"* | Attivazione cooldown timer di 3 minuti |
| **500** | `ERR_FANOUT_FAILED` | `POST /social/posts` | Eccezione cluster Redis durante fan-out | Nessun errore bloccante per l'autore | Fallback su fan-out on read per i follower |
| **503** | `ERR_STRIPE_UNAVAIL` | `POST /marketplace/book`| Servizio pagamenti temporaneamente non raggiungibile| Avviso: *"Servizio cassa momentaneamente occupato"* | Salvataggio prenotazione in stato pendente |"""
    },
    "06": {
        "file": "06-software-1-flow-6a-movely-desk-care.md",
        "badge_id": "3458764688417722722",
        "badge_pos": "X: 7937, Y: 465",
        "seq_title": "Sequence Diagram Asincrono del Ciclo di Vita (FLOW-6A)",
        "seq_code": r"""sequenceDiagram
    autonumber
    actor Utente as Thin Client (Desk Worker)
    participant TMR as Timer Posturale Locale (Worker)
    participant GW as API Gateway (Corsia 2)
    participant SRV as Ergonomic Engine (Corsia 3)
    participant DB as Database Silo 1 (Corsia 4)

    Utente->>TMR: Avvio sessione lavorativa (Intervallo: 50 min)
    Note over Utente,TMR: Conteggio tempo continuo in background
    TMR-->>Utente: Trigger acustico e visivo: "Micro-Pausa Posturale"
    Utente->>Utente: Esecuzione routine 2 minuti (Mobilità cervicale & spalle)
    Utente->>GW: POST /api/v1/corporate/break-completed (RoutineID, Durata)
    GW->>SRV: Dispatch aggregazione anonima
    SRV->>SRV: Mascheramento K-Anonimato (Zero-Knowledge Shield)
    SRV->>DB: INSERT corporate_break_metrics (Dataset aggregato k >= 10)
    DB-->>SRV: Commit completato
    SRV-->>Utente: 200 OK (Streak personale incrementato, zero leak aziendale)""",
        "kpi_table": r"""#### Indicatori di Accettazione Operativa & Clinica (KPI)
| Metrica / Parametro | Obiettivo Target | Tolleranza Accettabile | Azione Fallback / Allerta |
| :--- | :--- | :--- | :--- |
| **Precisione Timer Sedentarietà** | $< 1\text{ s}$ deviazione per ora | $\le 5\text{ s}$ | Risincronizzazione continua su clock di sistema |
| **Garanzia K-Anonimato** | $k \ge 10$ lavoratori per cluster | $k \ge 5$ | Soppressione visualizzazione report al datore |
| **Avvio Routine Micro-Pausa** | $< 100\text{ ms}$ | $\le 250\text{ ms}$ | Pre-caching asset grafici nello storage locale |
| **Aderenza Pause Ergonomiche** | $> 60\%$ routine completate | $\ge 40\%$ | Posticipo automatico gentile (+15 min) |""",
        "error_table": r"""### Matrice Errori HTTP & Strategie di Resilienza
| HTTP Code | Codice Interno | Endpoint | Causa Scatenante | UX Feedback Visivo | Strategia di Resilienza & Fallback |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **400** | `ERR_BAD_INTERVAL` | `POST /corporate/config` | Intervallo postura impostato $< 15\text{ min}$ | Notifica: *"Intervallo minimo raccomandato: 20 min"* | Correzione automatica al valore soglia clinico |
| **401** | `ERR_CORP_TOKEN` | `POST /corporate/metrics`| Token convenzione aziendale scaduto | Banner neutro: *"Modalità personale attiva"* | Passaggio a salvataggio privato non aggregato |
| **403** | `ERR_PRIVACY_BREACH` | `GET /corporate/analytics`| Tentativo di visualizzare report con $k < 10$ | Schermata: *"Dati aggregati insufficienti (Privacy)"*| Blocco visualizzazione report al datore di lavoro |
| **404** | `ERR_ROUTINE_404` | `GET /corporate/routine` | ID routine ergonomica non trovato | Schermata: *"Caricamento routine standard..."* | Fallback su sequenza standard di stretching collo |
| **429** | `ERR_PING_LIMIT` | `POST /corporate/ping` | Troppi ping di presenza da browser aperti | Nessun disturbo all'utente | Silenziamento ping e throttle temporale |
| **500** | `ERR_KANONYMITY_FAIL`| `POST /corporate/metrics`| Errore nel job di anonimizzazione batch | Icona ambrata di sincronizzazione | Riprova asincrona su cluster di elaborazione |"""
    },
    "07": {
        "file": "07-software-2-flow-1b-pro-onboarding.md",
        "badge_id": "3458764688417722731",
        "badge_pos": "X: -2448, Y: 3090",
        "seq_title": "Sequence Diagram Asincrono del Ciclo di Vita (FLOW-1B)",
        "seq_code": r"""sequenceDiagram
    autonumber
    actor Pro as Professionista P.IVA (Client UI)
    participant GW as API Gateway & Anti-Spoof (Corsia 2)
    participant VIES as Registro Imprese / INI-PEC / SDI
    participant STRIPE as Stripe Connect & Identity 3D
    participant SRV as Server Scatola Nera (Corsia 3)
    participant DB as Database Silo 1 (Corsia 4)

    Pro->>GW: POST /api/v1/pro/verify-vat (Partita IVA, Codice Fiscale, SDI)
    GW->>VIES: Controllo in tempo reale esistenza & stato attivo P.IVA
    VIES-->>GW: P.IVA Valida & Ricerca Indirizzo PEC su INI-PEC
    GW->>VIES: Invio Two-Way OTP (6 cifre) a casella PEC ufficiale
    VIES-->>GW: OTP consegnato su PEC
    GW-->>Pro: 200 OK (OTP inviato su PEC ufficiale aziendale)

    Pro->>GW: POST /api/v1/pro/confirm-pec-otp (Codice OTP digitato)
    GW->>GW: Validazione codice OTP & Scudo Anti-Spoofing
    GW->>STRIPE: Avvio sessione Stripe Identity (Verifica Documento + Liveness 3D)
    STRIPE-->>Pro: Webview SDK Biometrico 3D
    Pro->>STRIPE: Upload CIE/Passaporto & Video Selfie dinamico
    STRIPE-->>GW: Webhook: Identity.verified & Connect Account Onboarded
    GW->>SRV: Provisioning profilo professionale Tier 2 (Rolling Reserve 14gg)
    SRV->>DB: INSERT pro_profiles & UPDATE auth_users (Role R2_COACH o R3_PHYSIO)
    DB-->>SRV: Commit completato
    SRV-->>Pro: 200 OK (Accesso Coach Hub Pro sbloccato)""",
        "kpi_table": r"""#### Indicatori di Accettazione Operativa & Clinica (KPI)
| Metrica / Parametro | Obiettivo Target | Tolleranza Accettabile | Azione Fallback / Allerta |
| :--- | :--- | :--- | :--- |
| **Tempo Validazione P.IVA** | $< 1.5\text{ s}$ (VIES / SDI) | $\le 3.5\text{ s}$ | Accreditamento provvisorio con audit differito |
| **Recapito OTP su INI-PEC** | $< 45\text{ s}$ | $\le 120\text{ s}$ | Re-invio manuale con limite 3 tentativi/ora |
| **Precisione Liveness Check 3D** | $> 99.8\%$ rilevamento spoof | $\ge 99.0\%$ | Invio a revisione manuale con operatore (24h) |
| **Tasso Frodi / False P.IVA** | $0\%$ tolleranza frode | $0\%$ | Blocco immediato del profilo e segnalazione |""",
        "error_table": r"""### Matrice Errori HTTP & Strategie di Resilienza
| HTTP Code | Codice Interno | Endpoint | Causa Scatenante | UX Feedback Visivo | Strategia di Resilienza & Fallback |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **400** | `ERR_INVALID_VAT` | `POST /pro/verify-vat` | Formato Partita IVA o Codice Destinatario SDI errato | Bordo rosso: *"Partita IVA o Codice SDI non validi"* | Validazione regex client-side preventiva |
| **401** | `ERR_PEC_OTP_WRONG` | `POST /pro/confirm-pec-otp`| Codice OTP digitato errato o scaduto (10 min) | Alert: *"Codice PEC non valido o scaduto"* | Possibilità di generare nuovo codice OTP |
| **403** | `ERR_VAT_INACTIVE` | `POST /pro/verify-vat` | Partita IVA cessata, sospesa o fallita | Modale: *"Partita IVA non attiva all'Agenzia Entrate"*| Blocco dell'onboarding professionale |
| **422** | `ERR_LIVENESS_FAIL` | `POST /pro/stripe-webhook`| Mancata corrispondenza selfie 3D e documento | Schermata: *"Verifica identità non superata"* | Richiesta nuovo documento in alta risoluzione |
| **429** | `ERR_OTP_FLOOD` | `POST /pro/verify-vat` | Più di 3 richieste di OTP all'ora sullo stesso CF | Toast: *"Limite richieste OTP raggiunto. Attendi"* | Throttle temporale con timer visibile |
| **502** | `ERR_VIES_OFFLINE` | `POST /pro/verify-vat` | Registro europeo VIES momentaneamente offline | Banner ambrato: *"Verifica differita in corso..."* | Accodamento verifica in background |"""
    },
    "08": {
        "file": "08-software-2-flow-2b-coach-hub.md",
        "badge_id": "3458764688417722736",
        "badge_pos": "X: 251.36, Y: 2940",
        "seq_title": "Sequence Diagram Asincrono del Ciclo di Vita (FLOW-2B)",
        "seq_code": r"""sequenceDiagram
    autonumber
    actor Coach as Coach Pro UI (WebRTC & Three.js)
    participant EDGE as MediaPipe BlazePose 3D (Mobile Edge)
    participant GW as API Gateway (Corsia 2)
    participant RAG as Multimodal RAG Engine (Corsia 3)
    participant DB as Database Silo 1 (Corsia 4)

    Coach->>Coach: Registrazione video esecuzione atleta (WebRTC camera)
    Coach->>EDGE: Frame video RGB real-time
    EDGE->>EDGE: Estrazione 33 landmark 3D & Tracciamento ottico bilanciere (Bar Path)
    EDGE-->>Coach: Coordinate cinematiche & angoli articolari calcolati

    Coach->>GW: POST /api/v1/coach/exercises/audit-ai (Cinematica + Note Coach)
    GW->>RAG: Inoltro dati per audit scientifico
    RAG->>RAG: Query su 322 fonti peer-reviewed (PubMed, Scopus)
    RAG->>RAG: Identificazione compensi biomeccanici (es. estensione lombare precoce)
    RAG-->>Coach: 200 OK (Report suggerimenti AI: Cues correttivi, muscoli stabilizzatori)
    
    Coach->>Coach: Revisione Side-by-Side (Video reale vs Avatar 3D) & Approvazione
    Coach->>GW: POST /api/v1/coach/exercises/custom (Esercizio validato)
    GW->>DB: INSERT custom_exercises in Silo 1 (Libreria personale coach)
    DB-->>GW: Commit completato
    GW-->>Coach: 201 Created (Esercizio pronto per prescrizione)""",
        "kpi_table": r"""#### Indicatori di Accettazione Operativa & Clinica (KPI)
| Metrica / Parametro | Obiettivo Target | Tolleranza Accettabile | Azione Fallback / Allerta |
| :--- | :--- | :--- | :--- |
| **Framerate BlazePose Edge** | $\ge 30\text{ FPS}$ in tempo reale | $\ge 20\text{ FPS}$ | Campionamento a 15 FPS su hardware datato |
| **Precisione Tracciamento Bar Path** | $\pm 5\text{ mm}$ errore spaziale | $\pm 12\text{ mm}$ | Calibrazione manuale diametro disco bilanciere |
| **Tempo Risposta RAG Multimodale** | $< 2.5\text{ s}$ per revisione | $\le 5.0\text{ s}$ | Restituzione checklist biomeccanica statica |
| **Accuratezza Angoli Articolari** | $\pm 2^\circ$ vs goniometro ottico | $\pm 5^\circ$ | Prompt di riposizionamento inquadratura video |""",
        "error_table": r"""### Matrice Errori HTTP & Strategie di Resilienza
| HTTP Code | Codice Interno | Endpoint | Causa Scatenante | UX Feedback Visivo | Strategia di Resilienza & Fallback |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **400** | `ERR_BAD_VIDEO_CODEC`| `POST /audit-ai` | Codec video non supportato dal motore CV | Notifica: *"Formato video non valido. Usa MP4/WebM"*| Transcodifica automatica client-side via WebCodecs |
| **401** | `ERR_TIER2_REQUIRED` | `POST /audit-ai` | Utente con piano Tier 1 tenta uso motore RAG Pro| Modale: *"Funzione riservata ad abbonamento Pro"* | Switch a piano Tier 2 con trial 14 giorni |
| **413** | `ERR_VIDEO_TOO_LARGE`| `POST /audit-ai` | Dimensione file video $> 100\text{ MB}$ | Alert: *"Video troppo lungo. Limita la clip a 30s"* | Compressione video e trim automatico client-side |
| **422** | `ERR_POSE_FAILED` | `POST /audit-ai` | Atleta parzialmente fuori dall'inquadratura | Overlay: *"Posiziona l'intero corpo nell'inquadratura"*| Guida grafica visiva a silhouette sullo schermo |
| **500** | `ERR_RAG_TIMEOUT` | `POST /audit-ai` | Timeout del motore semantico di letteratura | Banner ambrato: *"Analisi AI differita..."* | Notifica asincrona non appena la revisione è pronta |
| **504** | `ERR_CV_TIMEOUT` | `POST /audit-ai` | Server di inferenza video sovraccarico | Toast: *"Analisi in coda. Riceverai un alert"* | Elaborazione batch differita su Cloud Run |"""
    },
    "09": {
        "file": "09-software-2-flow-3b-macrocycle-ai-triage119.md",
        "badge_id": "3458764688417722743",
        "badge_pos": "X: 2459, Y: 2940",
        "seq_title": "Sequence Diagram Asincrono del Ciclo di Vita (FLOW-3B)",
        "seq_code": r"""sequenceDiagram
    autonumber
    actor Coach as Coach Pro UI
    participant GW as API Gateway (Corsia 2)
    participant TRIAGE as Clinical Triage 119 (Corsia 3)
    participant PERIOD as Periodization AI Engine (Corsia 3)
    participant DB as Database Silo 1 (Corsia 4)

    Coach->>GW: POST /api/v1/pro/macrocycle/generate (athleteId, DUP, obiettivi)
    GW->>DB: Query anamnesi e patologie diagnosticate all'atleta
    DB-->>GW: Profilo clinico (es. Lesione meniscale, Ernia L4-L5)
    GW->>TRIAGE: Inoltro dati anamnestici per Triage Clinico 119
    TRIAGE->>TRIAGE: Esecuzione ImpactCalculator (Esclusi, Adattati ROM, Disponibili)
    TRIAGE-->>PERIOD: Matrice esercizi ammissibili & vincoli angolari
    PERIOD->>PERIOD: Generazione Macrociclo DUP (Progressione carico & scarichi)
    PERIOD-->>Coach: 200 OK (Bozza macrociclo completa con note di sicurezza)

    Coach->>Coach: Revisione fine-tuning volumi e conferme
    Coach->>GW: POST /api/v1/pro/macrocycle/assign (Piano confermato)
    GW->>DB: INSERT athlete_macrocycles & workout_plans
    DB-->>GW: Commit completato
    GW-->>Coach: 201 Created (Scheda assegnata all'atleta)""",
        "kpi_table": r"""#### Indicatori di Accettazione Operativa & Clinica (KPI)
| Metrica / Parametro | Obiettivo Target | Tolleranza Accettabile | Azione Fallback / Allerta |
| :--- | :--- | :--- | :--- |
| **Zero Violazioni Cliniche** | $100\%$ rispetto vincoli patologia | $0\%$ eccezioni | Blocco perentorio generazione scheda |
| **Tempo Generazione DUP** | $< 800\text{ ms}$ per macrociclo 12 sett. | $\le 2.0\text{ s}$ | Caricamento template standard pre-validato |
| **Aderenza Fasi Ondulate** | $100\%$ conformità carichi DUP | $\pm 2.5\%$ | Normalizzazione pesi automatica server-side |
| **Copertura Clinica 119** | 119 condizioni mediche mappate | 119 condizioni attive | Rinvio a parere medico specialistico |""",
        "error_table": r"""### Matrice Errori HTTP & Strategie di Resilienza
| HTTP Code | Codice Interno | Endpoint | Causa Scatenante | UX Feedback Visivo | Strategia di Resilienza & Fallback |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **400** | `ERR_BAD_PERIOD_PARAM`| `POST /macrocycle/generate`| Settimane non congrue ($< 4$ o $> 52$) | Alert: *"Durata macrociclo consentita: 4-52 settimane"*| Correzione automatica della durata a 8 settimane |
| **401** | `ERR_UNAUTHORIZED` | `POST /macrocycle/generate`| Sessione coach scaduta durante la configurazione | Modale: *"Riconnetti per salvare il macrociclo"* | Salvataggio bozza in localStorage per non perdere dati |
| **403** | `ERR_CLINICAL_LOCK` | `POST /macrocycle/assign` | Coach tenta di forzare esercizio con Red Flag | Dialog rosso: *"Esercizio controindicato per patologia"*| Sostituzione forzata con variante clinica sicura |
| **404** | `ERR_ATHLETE_NOT_FOUND`| `POST /macrocycle/generate`| Atleta non presente o non associato al coach | Toast: *"Seleziona un atleta attivo dal tuo roster"* | Ritorno all'elenco atleti assegnati |
| **422** | `ERR_TRIAGE_CONFLICT` | `POST /macrocycle/generate`| Conflitto tra patologie multiple incompatibili | Avviso: *"Troppe restrizioni. Richiesto consulto medico"*| Limitazione a soli protocolli di mobilità protetta |
| **500** | `ERR_SOLVER_CRASH` | `POST /macrocycle/generate`| Timeout del risolutore di ottimizzazione carichi | Banner: *"Generazione standard in corso..."* | Assegnazione schema lineare classico di backup |"""
    },
    "10": {
        "file": "10-software-2-flow-4b-vbt-pap-biomechanics.md",
        "badge_id": "3458764688417722745",
        "badge_pos": "X: 4171, Y: 2940",
        "seq_title": "Sequence Diagram Asincrono del Ciclo di Vita (FLOW-4B)",
        "seq_code": r"""sequenceDiagram
    autonumber
    actor Atleta as Atleta / Coach (Encoder VBT / CV)
    participant GW as API Gateway (Corsia 2)
    participant VBT as VBT & Biomechanics Engine (Corsia 3)
    participant DB as Database Silo 1 (Corsia 4)

    Atleta->>GW: POST /api/v1/vbt/session-stream (Carichi kg, Velocità m/s per rep)
    GW->>VBT: Inoltro campioni telemetrici
    VBT->>VBT: Calcolo Mean Propulsive Velocity (MPV) & Scarto Outlier MAD
    VBT->>VBT: Regressione Lineare OLS Carico-Velocità & Calcolo R²
    VBT->>VBT: Stima 1RM teorico all'intersezione con MVT (es. 0.15 m/s)
    VBT->>VBT: Valutazione Potenziamento PAP & Indici Cohen's d / MDC 95%
    VBT->>DB: INSERT vbt_profiles & pap_evaluations
    DB-->>VBT: Commit completato
    VBT-->>Atleta: 200 OK (Stima 1RM: 142.5kg, R²: 0.98, PAP confermato)

    Atleta->>GW: GET /api/v1/vbt/export-excel?sessionId=...
    GW->>VBT: Generazione foglio Excel sbloccato (protected: false)
    VBT-->>Atleta: 200 OK (Download file .xlsx con formule native)""",
        "kpi_table": r"""#### Indicatori di Accettazione Operativa & Clinica (KPI)
| Metrica / Parametro | Obiettivo Target | Tolleranza Accettabile | Azione Fallback / Allerta |
| :--- | :--- | :--- | :--- |
| **Coefficiente OLS $R^2$** | $R^2 \ge 0.95$ | $R^2 \ge 0.90$ | Richiesta serie aggiuntiva di calibrazione |
| **Accuratezza Stima 1RM** | $\pm 2.5\text{ kg}$ errore medio | $\pm 5.0\text{ kg}$ | Rendering intervallo di confidenza al 95% |
| **Validazione Statistica PAP** | $d \ge 0.6$ (Cohen's d) | $d \ge 0.4$ | Notifica di mancato potenziamento acuto |
| **Generazione Excel Sbloccato**| $< 400\text{ ms}$ | $\le 1.0\text{ s}$ | Invio asincrono link download via email |""",
        "error_table": r"""### Matrice Errori HTTP & Strategie di Resilienza
| HTTP Code | Codice Interno | Endpoint | Causa Scatenante | UX Feedback Visivo | Strategia di Resilienza & Fallback |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **400** | `ERR_FEW_VBT_POINTS` | `POST /vbt/session-stream` | Meno di 3 carichi differenti registrati | Notifica: *"Esegui almeno 3 serie con carichi crescenti"*| Guida a schermo con carichi consigliati |
| **401** | `ERR_PRO_VBT_AUTH` | `POST /vbt/session-stream` | Modulo VBT non accessibile per account Tier 1 | Banner: *"Aggiorna a Pro per la telemetria VBT"* | Mostra demo con dati simulati |
| **422** | `ERR_POOR_FIT` | `POST /vbt/session-stream` | Correlazione $R^2 < 0.90$ (dati troppo dispersi) | Alert: *"Serie non costanti: tecnica o velocità instabile"*| Scarto automatico outlier e ricalcolo |
| **429** | `ERR_STREAM_FLOOD` | `POST /vbt/session-stream` | Frequenza campionamento encoder $> 100\text{ Hz}$ | Nessun disturbo all'utente | Downsampling a 50 Hz client-side |
| **500** | `ERR_EXCEL_ENGINE` | `GET /vbt/export-excel` | Errore libreria generazione Excel | Banner: *"Generazione in corso, riceverai il file"* | Fallback su esportazione immediata CSV |
| **503** | `ERR_SOLVER_BUSY` | `POST /vbt/session-stream` | Microservizio matematico sovraccarico | Icona ambrata: *"Calcolo in corso..."* | Esecuzione regressione lineare locale in JS |"""
    },
    "11": {
        "file": "11-software-2-flow-5b-together-pro-business.md",
        "badge_id": "3458764688417722746",
        "badge_pos": "X: 6048, Y: 2940",
        "seq_title": "Sequence Diagram Asincrono del Ciclo di Vita (FLOW-5B)",
        "seq_code": r"""sequenceDiagram
    autonumber
    actor Atleta as Atleta Remoto (Client UI)
    actor Coach as Coach Pro (Annotation Canvas)
    participant GW as API Gateway (Corsia 2)
    participant STRIPE as Stripe Connect Transfers (Corsia 3)
    participant SRV as Video Processing Engine (Corsia 3)
    participant DB as Database Silo 1 (Corsia 4)

    Atleta->>GW: POST /api/v1/pro/consultations/request (Upload clip video, Descrizione)
    GW->>DB: INSERT consultation_requests (Stato: PENDING_REVIEW)
    DB-->>Coach: Notifica push: "Nuovo video da revisionare"

    Coach->>GW: GET /api/v1/pro/consultations/:id/video
    GW-->>Coach: Stream WebRTC del video atleta
    Coach->>Coach: Disegno annotazioni grafiche (Vettori forza, angoli, audio-nota)
    Coach->>GW: POST /api/v1/pro/consultations/:id/submit-review (Canvas metadata)
    GW->>SRV: Compositing video con watermark forense e annotazioni
    SRV->>DB: UPDATE consultation_requests (COMPLETED) & Storage video annotato
    DB-->>GW: Commit completato
    GW->>STRIPE: Trigger payout Stripe Connect (Trattenuta commissione T7)
    STRIPE-->>Coach: Trasferimento fondi su conto bancario coach
    GW-->>Atleta: Notifica: "Video revisionato pronto con correzioni tecniche" """,
        "kpi_table": r"""#### Indicatori di Accettazione Operativa & Clinica (KPI)
| Metrica / Parametro | Obiettivo Target | Tolleranza Accettabile | Azione Fallback / Allerta |
| :--- | :--- | :--- | :--- |
| **Latenza Video WebRTC** | $< 150\text{ ms}$ | $\le 300\text{ ms}$ | Adattamento dinamico bitrate (Adaptive Bitrate) |
| **Sincronia Tratti Grafici** | $< 33\text{ ms}$ (1 frame @ 30fps) | $\le 66\text{ ms}$ | Interpolazione spline dei tratti a video |
| **Rendering Video Finale** | $< 15\text{ s}$ per 60s di clip | $\le 30\text{ s}$ | Rendering cloud asincrono con alert push |
| **Integrità Payout Stripe** | $100\%$ transazioni riconciliate | $0\%$ errore contabile | Blocco fondo e alert a team finance |""",
        "error_table": r"""### Matrice Errori HTTP & Strategie di Resilienza
| HTTP Code | Codice Interno | Endpoint | Causa Scatenante | UX Feedback Visivo | Strategia di Resilienza & Fallback |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **400** | `ERR_BAD_ANNOTATION` | `POST /submit-review` | Coordinate canvas non valide o fuori video | Toast: *"Tratto grafico fuori dai limiti del video"* | Correzione automatica ai bordi del viewport |
| **401** | `ERR_SESSION_TIMEOUT` | `POST /submit-review` | Sessione coach scaduta durante il disegno | Modale trasparente di re-autenticazione | Preservazione di tutti i tratti disegnati su canvas |
| **403** | `ERR_ACCESS_DENIED` | `GET /video` | Coach non assegnato alla specifica consulenza | Schermata: *"Non autorizzato a visionare questo video"*| Blocco accesso e registrazione log di sicurezza |
| **413** | `ERR_CANVAS_PAYLOAD` | `POST /submit-review` | Troppi metadati vettoriali disegnati ($> 10\text{ MB}$)| Alert: *"Disegno troppo complesso. Semplifica"* | Decimazione punti spline e compressione JSON |
| **500** | `ERR_TRANSCODE_FAIL` | `POST /submit-review` | Fallimento rendering video annotato | Notifica: *"Rendering in corso in background"* | Riprova asincrona su worker Cloud Tasks |
| **502** | `ERR_STRIPE_PAYOUT` | `POST /submit-review` | Rifiuto trasferimento bancario da Stripe | Notifica discreta a coach: *"Fondi in riserva"* | Riconciliazione automatica entro 12 ore |"""
    },
    "12": {
        "file": "12-software-2-flow-6b-physio-rehab-rom.md",
        "badge_id": "3458764688417722770",
        "badge_pos": "X: 7937, Y: 2940",
        "seq_title": "Sequence Diagram Asincrono del Ciclo di Vita (FLOW-6B)",
        "seq_code": r"""sequenceDiagram
    autonumber
    actor Paziente as Paziente / Atleta infortunato
    actor Fisio as Fisioterapista (Tier 2 Pro)
    participant CV as Goniometro Digitale AI (Client Edge)
    participant GW as API Gateway (Corsia 2)
    participant CLINIC as Clinical Safety Engine (Corsia 3)
    participant DB as Database Silo 1 (Corsia 4)

    Fisio->>GW: POST /api/v1/physio/prescribe-rehab (Protocollo cli_01..32, Limite ROM: 60°)
    GW->>DB: INSERT rehab_prescriptions
    DB-->>Paziente: Notifica: "Nuova seduta riabilitativa attiva"

    Paziente->>CV: Avvio esercizio di fronte a telecamera
    CV->>CV: Estrazione angoli articolari in tempo reale (< 2° errore)
    alt Angolo supera Limite Prescritto (> 60°)
        CV-->>Paziente: FREEZE & ALLARME ACUSTICO: "Barriera Motoria Raggiunta!"
    end

    Paziente->>Paziente: Inserimento livello dolore soggettivo Scala VAS (0-10)
    Paziente->>GW: POST /api/v1/physio/session-feedback (Angolo max, VAS: 5)
    GW->>CLINIC: Valutazione sicurezza clinica
    alt VAS >= 4 (Dolore Critico)
        CLINIC->>CLINIC: LOCK PROGRESSIONE CARICO & Alert immediato
        CLINIC->>DB: UPDATE rehab_status (ATTENZIONE_CLINICA)
        CLINIC-->>Fisio: Notifica urgente: "Paziente ha segnalato VAS >= 4"
    else VAS < 4 (Progressione Regolare)
        CLINIC->>DB: UPDATE rehab_status (PROGRESSIONE_CONVALIDATA)
    end
    CLINIC-->>Paziente: 200 OK (Feedback registrato con successo)""",
        "kpi_table": r"""#### Indicatori di Accettazione Operativa & Clinica (KPI)
| Metrica / Parametro | Obiettivo Target | Tolleranza Accettabile | Azione Fallback / Allerta |
| :--- | :--- | :--- | :--- |
| **Errore Goniometro AI** | $< 2.0^\circ$ deviazione angolare | $\le 4.0^\circ$ | Richiesta ricalibrazione piano inquadratura |
| **Reattività Barriera Motoria** | $< 100\text{ ms}$ al superamento ROM | $\le 200\text{ ms}$ | Allarme acustico e freeze immediato dell'avatar |
| **Rilevamento Dolore VAS $\ge 4$** | $100\%$ intercettazione | $0\%$ omissione | Lock automatico progressione terapeutica |
| **Convalida 32 Protocolli** | $100\%$ conformità linee FNOFI | $0\%$ deviazioni non autorizzate | Richiesta firma clinica obbligatoria del fisio |""",
        "error_table": r"""### Matrice Errori HTTP & Strategie di Resilienza
| HTTP Code | Codice Interno | Endpoint | Causa Scatenante | UX Feedback Visivo | Strategia di Resilienza & Fallback |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **400** | `ERR_INVALID_VAS` | `POST /session-feedback` | Valore scala VAS fuori scala ($< 0$ o $> 10$)| Bordo rosso: *"Indica un valore di dolore tra 0 e 10"*| Limitazione cursore a range consentito 0-10 |
| **401** | `ERR_PHYSIO_AUTH` | `POST /prescribe-rehab` | Abilitazione ordine sanitario non verificata | Modale: *"Verifica iscrizione all'albo richiesta"* | Blocco prescrizione protocolli clinici |
| **403** | `ERR_ROM_OVERRIDE` | `POST /prescribe-rehab` | Tentativo di rimuovere barriera motoria protetta | Dialog rosso: *"Impossibile superare limite post-operatorio"*| Richiesta motivazione clinica formale |
| **422** | `ERR_GONIOMETER_FAIL`| `POST /session-feedback` | Mancata rilevazione punti articolari nel video | Alert: *"Illuminazione insufficiente o arto coperto"*| Ripetizione test con guida a silhouette |
| **500** | `ERR_CLINIC_ENGINE` | `POST /session-feedback` | Eccezione nel modulo di calcolo progressione | Banner: *"Valutazione in corso dal tuo fisioterapista"*| Notifica manuale differita al professionista |
| **503** | `ERR_REHAB_DB_BUSY` | `POST /session-feedback` | Database clinico temporaneamente in lock | Toast: *"Salvataggio completato in locale"* | Sincronizzazione automatica al ripristino |"""
    },
    "13": {
        "file": "13-software-3-flow-1c-bunker-onboarding-kms.md",
        "badge_id": "3458764688417722778",
        "badge_pos": "X: -2925, Y: 6555",
        "seq_title": "Sequence Diagram Asincrono del Ciclo di Vita (FLOW-1C)",
        "seq_code": r"""sequenceDiagram
    autonumber
    actor ClubAdmin as Dirigente Club (Elite Tier 3)
    participant IDP as Enterprise IdP (SAML 2.0 / Okta)
    participant GW as API Gateway & mTLS Gate (Corsia 2)
    participant KMS as Google Cloud KMS (HSM Silo 2)
    participant WORM as WORM Storage Audit Log (Corsia 3)
    participant SILO2 as Bunker Database Silo 2 (Corsia 4)

    ClubAdmin->>GW: POST /api/v1/enterprise/kyb-verify (Dati REA, UBO, Camera Commercio)
    GW->>GW: Verifica conformità antiriciclaggio & Poteri di firma
    GW->>IDP: Handshake federazione SAML 2.0 SSO
    IDP-->>ClubAdmin: Challenge autenticazione FIDO2 Hardware Key
    ClubAdmin->>IDP: Tocco chiave fisica USB/NFC
    IDP-->>GW: SAML Assertion firmata digitalmente (Ruolo: DIRIGENTE_CLUB)

    GW->>KMS: Creazione Dedicated Key Ring per il Club (AES-256 GCM)
    KMS-->>GW: Chiave Master e certificati mTLS client emessi
    GW->>SILO2: Provisioning partizione Bunker cifrata a tenuta stagna
    SILO2-->>GW: Partizione pronta & isolamento verificato
    GW->>WORM: Scrittura immutabile log di conformità KYB e contratti
    WORM-->>GW: WORM Write Acknowledged (Immutabile)
    GW-->>ClubAdmin: 201 Created (Accesso Enterprise Bunker con mTLS sbloccato)""",
        "kpi_table": r"""#### Indicatori di Accettazione Operativa & Clinica (KPI)
| Metrica / Parametro | Obiettivo Target | Tolleranza Accettabile | Azione Fallback / Allerta |
| :--- | :--- | :--- | :--- |
| **Tempo Handshake SAML 2.0** | $< 600\text{ ms}$ | $\le 1.5\text{ s}$ | Fallback su autenticazione certificato mTLS |
| **Isolamento Silo 2 KMS** | Cifratura dedicata $100\%$ | $0\%$ commistione dati | Abort provisioning immediato con alert |
| **Immutabilità WORM Storage** | $100\%$ scritture protette | $0\%$ cancellazioni possibili | Allarme di sicurezza SOC prioritario |
| **Conformità KYB / UBO** | $100\%$ rispetto antiriciclaggio | $0\%$ irregolarità | Blocco contrattuale preventivo della società |""",
        "error_table": r"""### Matrice Errori HTTP & Strategie di Resilienza
| HTTP Code | Codice Interno | Endpoint | Causa Scatenante | UX Feedback Visivo | Strategia di Resilienza & Fallback |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **400** | `ERR_BAD_SAML_ASSERT`| `POST /saml/consume` | Asserzione XML SAML corrotta o firma non valida | Schermata: *"Errore federazione Single Sign-On"* | Richiesta ri-autenticazione tramite IdP aziendale |
| **401** | `ERR_MTLS_CERT_FAIL` | `ALL /enterprise/*` | Certificato client mTLS mancante, revocato o scaduto| Modale di sistema: *"Certificato di dispositivo non valido"*| Blocco connessione e notifica all'IT Admin del club |
| **403** | `ERR_KYB_REJECTED` | `POST /kyb-verify` | Firma societaria non corrispondente a visura REA | Dialog: *"Verifica poteri di firma Camera di Commercio fallita"*| Sospensione onboarding e verifica notarile |
| **409** | `ERR_BUNKER_EXISTS` | `POST /bunker/provision`| Partizione societaria già censita e attiva | Notifica: *"Bunker societario già esistente"* | Reindirizzamento a richiesta credenziali allo staff admin |
| **500** | `ERR_KMS_PROVISION` | `POST /bunker/provision`| Errore generazione Key Ring su Cloud KMS | Banner rosso: *"Errore crittografico. Riprova tra poco"* | Rollback provisioning e allarme a DevOps T7 |
| **503** | `ERR_WORM_UNAVAIL` | `POST /bunker/provision`| Archivio immutabile WORM non raggiungibile | Modale bloccante: *"Audit storage momentaneamente offline"*| Sospensione completamento fino a ripristino WORM |"""
    },
    "14": {
        "file": "14-software-3-flow-2c-multi-staff-cockpit.md",
        "badge_id": "3458764688417722783",
        "badge_pos": "X: -108, Y: 6235.66",
        "seq_title": "Sequence Diagram Asincrono del Ciclo di Vita (FLOW-2C)",
        "seq_code": r"""sequenceDiagram
    autonumber
    actor Staff as Multi-Staff Club (Head Coach, S&C, Medico)
    participant GW as API Gateway & RBAC Granulare (Corsia 2)
    participant VAULT as Secret Club Vault & Watermarking (Corsia 3)
    participant SIM as Digital Twin 3D Engine (Corsia 3)
    participant SILO2 as Bunker Database Silo 2 KMS (Corsia 4)

    Staff->>GW: POST /api/v1/enterprise/video/ingest-4k (Feed telecamere campo multiple)
    GW->>GW: Verifica mTLS & Permessi ruolo (R5_HEAD_COACH o R7_ANALYST)
    GW->>VAULT: Streaming 4K sincrono multi-camera
    VAULT->>VAULT: Sincronizzazione millimetrica stream & Applicazione Watermark dinamico anti-leak
    VAULT->>SILO2: Scrittura video cifrati in Vault isolato
    SILO2-->>VAULT: Commit cifratura confermato

    Staff->>GW: POST /api/v1/enterprise/digital-twin/simulate (athleteId, exerciseData)
    GW->>SIM: Richiesta estrazione sollecitazioni articolari
    SIM->>SIM: Calcolo momento torcente ginocchio & carico vertebrale
    SIM-->>Staff: 200 OK (Mappa termica tensioni muscolari su Digital Twin 3D)

    Staff->>GW: POST /api/v1/enterprise/sign-off (Doppia firma digitale Medico + Preparatore)
    GW->>SILO2: Registrazione congiunta nulla-osta tecnico-sanitario
    SILO2-->>Staff: 200 OK (Atleta abilitato nel piano settimanale di squadra)""",
        "kpi_table": r"""#### Indicatori di Accettazione Operativa & Clinica (KPI)
| Metrica / Parametro | Obiettivo Target | Tolleranza Accettabile | Azione Fallback / Allerta |
| :--- | :--- | :--- | :--- |
| **Sincronia Multi-Camera 4K** | $< 10\text{ ms}$ tra stream | $\le 30\text{ ms}$ | Genlock software con drop frame selettivo |
| **Watermark Forense Dinamico** | $100\%$ frame marcati | $0\%$ frame scoperti | Blocco riproduzione video non contrassegnati |
| **Simulazione Digital Twin 3D** | $< 3.0\text{ s}$ per esercizio | $\le 6.0\text{ s}$ | Elaborazione su modello cinematico a 14 nodi |
| **Validità Doppia Firma** | $100\%$ consensi congiunti | $0\%$ override singoli | Scheda atleta non attivabile senza entrambe le firme |""",
        "error_table": r"""### Matrice Errori HTTP & Strategie di Resilienza
| HTTP Code | Codice Interno | Endpoint | Causa Scatenante | UX Feedback Visivo | Strategia di Resilienza & Fallback |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **400** | `ERR_CAM_DESYNC` | `POST /video/ingest-4k` | Timecode tra flussi 4K disallineati $> 100\text{ ms}$ | Alert: *"Disallineamento temporale tra le telecamere"* | Risincronizzazione forzata su audio clock comune |
| **401** | `ERR_STAFF_EXPIRED` | `POST /sign-off` | Token sessione scaduto prima della firma congiunta | Modale rapido di riconnessione con impronta/FIDO2 | Mantenimento della bozza di nulla osta in memoria |
| **403** | `ERR_ROLE_UNAUTHORIZED`| `POST /sign-off` | Utente non abilitato alla firma medica/tecnica | Banner: *"Ruolo non autorizzato alla firma del documento"*| Blocco pulsante firma e registrazione audit log |
| **413** | `ERR_4K_BANDWIDTH` | `POST /video/ingest-4k` | Quota banda contemporanea superata | Toast: *"Banda satura. Switch a risoluzione 1080p"* | Transcodifica dinamica e upload differito 4K |
| **500** | `ERR_VAULT_ENCRYPT` | `POST /video/ingest-4k` | Eccezione nel modulo crittografico KMS del Vault | Banner rosso: *"Errore salvataggio criptato"* | Interruzione upload per evitare storage non cifrato |
| **504** | `ERR_TWIN_TIMEOUT` | `POST /digital-twin/sim` | Timeout durante computazione elementi finiti | Notifica: *"Simulazione complessa. Risultati a breve"*| Notifica push al termine del calcolo asincrono |"""
    },
    "15": {
        "file": "15-software-3-flow-3c-team-microcycle-mdx.md",
        "badge_id": "3458764688417722788",
        "badge_pos": "X: 2875, Y: 6567.76",
        "seq_title": "Sequence Diagram Asincrono del Ciclo di Vita (FLOW-3C)",
        "seq_code": r"""sequenceDiagram
    autonumber
    actor Coach as Head Coach & S&C (Tier 3)
    participant GW as API Gateway & Bunker Proxy (Corsia 2)
    participant SRV as Microcycle Engine & EWMA (Corsia 3)
    participant SILO2 as Bunker Database Silo 2 (Corsia 4)

    Coach->>GW: POST /api/v1/enterprise/microcycle/plan (MatchDay: Sabato, 30 atleti)
    GW->>SILO2: Query telemetria storica rosa (Carichi GPS, Minutaggio gare, ACWR)
    SILO2-->>GW: Dataset atleti (Titolari vs Panchinari, Doppi Ruoli)
    GW->>SRV: Dispatch algoritmo Microciclo MD-X
    SRV->>SRV: Calcolo giorni a ritroso (MD-4 Forza, MD-3 Velocità, MD-2 Reattività, MD-1 Rifinitura)
    SRV->>SRV: Calcolo decadimento esponenziale ACWR EWMA per ciascun giocatore
    SRV->>SRV: Differenziazione automatica: Scarico titolari vs Compensazione panchinari
    SRV-->>Coach: 200 OK (Planning settimanale rosa completo con alert fatica)

    Coach->>Coach: Assegnazione carichi personalizzati e conferme
    Coach->>GW: POST /api/v1/enterprise/microcycle/commit (Piani finali approvati)
    GW->>SILO2: Scrittura crittografata con chiave KMS Silo 2
    SILO2-->>Coach: 201 Created (Microciclo attivo nel Bunker della squadra)""",
        "kpi_table": r"""#### Indicatori di Accettazione Operativa & Clinica (KPI)
| Metrica / Parametro | Obiettivo Target | Tolleranza Accettabile | Azione Fallback / Allerta |
| :--- | :--- | :--- | :--- |
| **Compensazione Panchinari** | $100\%$ pareggio carico titolari | $\pm 5\%$ | Inserimento seduta metabolica specifica a fine gara |
| **Precisione ACWR EWMA** | Decadimento esponenziale $\lambda$ continuo| $\pm 0.01$ | Fallback su media mobile ponderata classica |
| **Isolamento Dati Bunker** | Zero leak verso Silo 1 social | $0\%$ compromissione | Blocco immediato pipeline e isolamento tenant |
| **Tempo Calcolo Rosa Completa** | $< 1.2\text{ s}$ per 30 atleti | $\le 3.0\text{ s}$ | Elaborazione distribuita parallela per reparto |""",
        "error_table": r"""### Matrice Errori HTTP & Strategie di Resilienza
| HTTP Code | Codice Interno | Endpoint | Causa Scatenante | UX Feedback Visivo | Strategia di Resilienza & Fallback |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **400** | `ERR_BAD_MATCH_DATE` | `POST /microcycle/plan` | Giorno gara non valido o microciclo $< 3$ giorni | Alert: *"Imposta un intervallo di almeno 3 giorni tra i match"*| Adattamento su modello microciclo compresso |
| **401** | `ERR_STAFF_UNAUTH` | `POST /microcycle/plan` | Credenziali di staff club non riconosciute | Redirect a login SAML 2.0 aziendale | Mantenimento parametri microciclo in bozza |
| **403** | `ERR_KMS_DENIED` | `POST /microcycle/commit`| Chiave Cloud KMS non autorizzata per la partizione| Modale rosso: *"Accesso al Bunker Silo 2 negato"* | Notifica di sicurezza immediata a IT Dirigenza |
| **422** | `ERR_ACWR_SPIKE` | `POST /microcycle/plan` | Giocatore con ACWR $> 1.8$ inserito a pieno carico| Dialog ambrato: *"Rischio infortuni elevato per 2 atleti"*| Proposta automatica di scarico personalizzato |
| **500** | `ERR_OPTIMIZER_CRASH`| `POST /microcycle/plan` | Errore matematico nel solutore di carichi squadra| Banner: *"Generazione standard in corso..."* | Assegnazione template MD-X classico certificato |
| **503** | `ERR_SILO2_LOCKED` | `POST /microcycle/commit`| Manutenzione ordinaria del database societario | Icona nuvola: *"Dati salvati in cache protetta"* | Accodamento e sincronizzazione appena online |"""
    },
    "16": {
        "file": "16-software-3-flow-4c-gps-adaptive-zscore.md",
        "badge_id": "3458764688417722792",
        "badge_pos": "X: 4587, Y: 6565.57",
        "seq_title": "Sequence Diagram Asincrono del Ciclo di Vita (FLOW-4C)",
        "seq_code": r"""sequenceDiagram
    autonumber
    actor GPS as Dispositivi GPS Campo (10-18 Hz)
    participant GW as API Gateway & Telemetry Ingest (Corsia 2)
    participant MATH as Osgnach & Z-Score Engine (Corsia 3)
    participant SILO2 as Bunker Database Silo 2 (Corsia 4)
    actor Analyst as Match Analyst / Preparatore

    GPS->>GW: POST /api/v1/enterprise/telemetry/gps-stream (Campioni raw 10-18Hz)
    GW->>MATH: Inoltro campioni posizione e accelerazione
    MATH->>MATH: Filtraggio DOP (Scarto campioni con DOP > 2.0)
    MATH->>MATH: Calcolo Potenza Metabolica Osgnach (W/kg) & Distanza High Metabolic Load
    MATH->>MATH: Fusione telemetria interna (HRV ed FC cardiaca)
    alt Nuovo Acquisto (Assenza Baseline 28 giorni)
        MATH->>MATH: Fallback Cold-Start: Ponderazione su media ruolo & dati antropometrici
    else Atleta con Storico Consolidato
        MATH->>MATH: Calcolo Z-Score Adattivo su media e deviazione standard personale a 28gg
    end
    MATH->>SILO2: INSERT gps_sessions & zscore_metrics (Cifratura Silo 2)
    SILO2-->>Analyst: Visualizzazione Dashboard Live & Allarmi Picchi Z-Score > 2.0
    Analyst->>GW: GET /api/v1/enterprise/telemetry/export-excel
    GW->>MATH: Compilazione file Excel senza password di protezione (protected: false)
    MATH-->>Analyst: 200 OK (Download file .xlsx per staff)""",
        "kpi_table": r"""#### Indicatori di Accettazione Operativa & Clinica (KPI)
| Metrica / Parametro | Obiettivo Target | Tolleranza Accettabile | Azione Fallback / Allerta |
| :--- | :--- | :--- | :--- |
| **Filtraggio Satellitare DOP** | Scarto $100\%$ campioni con DOP $> 2.0$ | DOP $\le 2.5$ | Interpolazione spline temporale |
| **Accuratezza Potenza Osgnach**| Conforme a modello di Prampero-Osgnach | $\pm 1.5\%$ deviazione | Stima basata su sole accelerazioni rettilinee |
| **Convergenza Cold-Start** | Baseline transitoria attiva da Giorno 1 | Media ruolo $\pm 10\%$ | Assegnazione baseline conservativa al 70% |
| **Frequenza GPS Supportata** | 10-18 Hz senza perdita di frame | $\ge 10\text{ Hz}$ | Ricampionamento lineare automatico a 10 Hz |""",
        "error_table": r"""### Matrice Errori HTTP & Strategie di Resilienza
| HTTP Code | Codice Interno | Endpoint | Causa Scatenante | UX Feedback Visivo | Strategia di Resilienza & Fallback |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **400** | `ERR_CORRUPT_GPS` | `POST /gps-stream` | File telemetria corrotto o checksum errato | Notifica: *"File telemetria non integro"* | Richiesta nuovo upload o ri-esportazione da docking |
| **401** | `ERR_DEVICE_UNAUTH` | `POST /gps-stream` | ID ricevitore GPS non registrato nel club | Alert: *"Dispositivo GPS non censito nel Bunker"*| Assegnazione provvisoria in quarantena |
| **422** | `ERR_SATELLITE_NOISE`| `POST /gps-stream` | Oltre il 50% dei campioni con DOP $> 3.0$ (Canyoning)| Avviso: *"Segnale GPS instabile nello stadio"* | Integrazione con soli dati accelerometrici IMU |
| **429** | `ERR_INGEST_OVERLOAD`| `POST /gps-stream` | Frequenza pacchetti superiore a capacità banda | Nessun disturbo all'utente | Buffer in memoria e throttling transitorio |
| **500** | `ERR_ZSCORE_FAULT` | `POST /gps-stream` | Varianza storica nulla (divisione per zero) | Icona ambrata: *"Z-Score stimato su media ruolo"*| Assegnazione deviazione standard predefinita |
| **504** | `ERR_PIPELINE_TIMEOUT`| `POST /gps-stream` | Timeout durante calcolo potenza metabolica | Toast: *"Calcolo in corso in background"* | Notifica push a completamento elaborazione |"""
    },
    "17": {
        "file": "17-software-3-flow-5c-tactical-video-cv.md",
        "badge_id": "3458764688417722803",
        "badge_pos": "X: 6464, Y: 6566.88",
        "seq_title": "Sequence Diagram Asincrono del Ciclo di Vita (FLOW-5C)",
        "seq_code": r"""sequenceDiagram
    autonumber
    actor Analyst as Match Analyst (Tactical Cockpit)
    participant GW as API Gateway & Anti-Leak (Corsia 2)
    participant YOLO as Modello YOLOv8 Detection (Corsia 3)
    participant VORONOI as Omografia & Voronoi Engine (Corsia 3)
    participant SILO2 as Bunker Database Silo 2 (Corsia 4)

    Analyst->>GW: POST /api/v1/enterprise/tactical/video-upload (Clip match da tribuna)
    GW->>YOLO: Streaming frame video
    YOLO->>YOLO: Rilevamento Real-Time 22 giocatori, arbitri e pallone (mAP@50 > 94%)
    YOLO-->>VORONOI: Coordinate bounding box (Pixel frame)
    VORONOI->>VORONOI: Applicazione Omografia Prospettica 2D (Rimappatura a coordinate campo)
    VORONOI->>VORONOI: Calcolo Tassellatura Voronoi (Aree controllo campo per squadra)
    VORONOI->>VORONOI: Estrazione Baricentro, Ampiezza e Profondità tattica
    VORONOI->>SILO2: INSERT tactical_metrics in Silo 2 (Zero Social Leakage)
    SILO2-->>Analyst: Rendering 2D Lavagna Tattica Zenitale Dinamica""",
        "kpi_table": r"""#### Indicatori di Accettazione Operativa & Clinica (KPI)
| Metrica / Parametro | Obiettivo Target | Tolleranza Accettabile | Azione Fallback / Allerta |
| :--- | :--- | :--- | :--- |
| **Accuratezza YOLOv8** | $\text{mAP@50} \ge 94\%$ | $\ge 90\%$ | Tracciamento inerziale con Filtro di Kalman |
| **Errore Omografia 2D** | $< 0.35\text{ m}$ errore reale sul campo | $\le 0.75\text{ m}$ | Ricalibrazione manuale dei 4 corner del campo |
| **Tempo Calcolo Voronoi** | $< 16\text{ ms}$ per frame ($60\text{ FPS}$)| $\le 33\text{ ms}$ ($30\text{ FPS}$) | Calcolo a keyframe alternati ogni 0.25s |
| **Zero Social Leakage** | $100\%$ confinamento Silo 2 | $0\%$ esportazioni pubbliche | Disabilitazione perentoria condivisione social |""",
        "error_table": r"""### Matrice Errori HTTP & Strategie di Resilienza
| HTTP Code | Codice Interno | Endpoint | Causa Scatenante | UX Feedback Visivo | Strategia di Resilienza & Fallback |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **400** | `ERR_HOMOGRAPHY_FAIL`| `POST /tactical/calibrate` | Punti di riferimento campo non visibili nel video | Alert: *"Impossibile rilevare le linee del campo"* | Richiesta click manuale sui 4 angoli del campo |
| **401** | `ERR_ANALYST_AUTH` | `POST /tactical/video` | Ruolo Match Analyst non riconosciuto dal Gateway | Redirect a login con certificato mTLS | Mantenimento della sessione video in locale |
| **413** | `ERR_MATCH_FILE_MAX` | `POST /tactical/video` | File video intero match supera quota ($> 5\text{ GB}$)| Dialog: *"Carica il video diviso per tempi (45 min)"*| Segmentazione automatica della clip prima dell'upload |
| **422** | `ERR_YOLO_OCCLUSION` | `POST /tactical/video` | Troppi giocatori sovrapposti in mischia d'area | Evidenziazione: *"Rilevamento incerto in area"* | Tracciamento predittivo Kalman per 1.5 secondi |
| **500** | `ERR_VORONOI_CRASH` | `POST /tactical/video` | Errore geometrico punti collineari nel Voronoi | Schermata: *"Mappa Voronoi non calcolabile"* | Rendering delle sole posizioni dei giocatori |
| **504** | `ERR_GPU_TIMEOUT` | `POST /tactical/video` | Server cluster GPU temporaneamente saturo | Toast: *"Analisi tattica in coda di elaborazione"*| Notifica push al termine del calcolo asincrono |"""
    },
    "18": {
        "file": "18-software-3-flow-6c-medical-room-research-silo3.md",
        "badge_id": "3458764688417722810",
        "badge_pos": "X: 8353, Y: 6573.44",
        "seq_title": "Sequence Diagram Asincrono del Ciclo di Vita (FLOW-6C)",
        "seq_code": r"""sequenceDiagram
    autonumber
    actor Medico as Medico Sociale (Silo 2 Bunker)
    actor HeadCoach as Responsabile Tecnico (S&C)
    participant EMR as Electronic Medical Record (Corsia 3)
    participant ETL as Pipeline De-Identificazione K-Anonimato (Corsia 3)
    participant SILO2 as Bunker Club Silo 2 (Corsia 4)
    participant SILO3 as Research Warehouse Silo 3 (Corsia 4)

    Medico->>EMR: Inserimento referto diagnostico protetto da segreto medico
    EMR->>SILO2: Scrittura criptata cartella sanitaria EMR
    SILO2-->>HeadCoach: Visualizzazione stato: "INIDONEO" (Diagnosi medica oscurata al 100%)

    Note over Medico,HeadCoach: Progressione riabilitativa Return-to-Play a 6 fasi
    Medico->>EMR: Firma digitale completamento Fase 6 (Idoneità clinica)
    HeadCoach->>EMR: Firma digitale tecnica (Test atletico in gruppo superato)
    EMR->>SILO2: Sblocco stato atleta: "DISPONIBILE PER GARA"

    ETL->>SILO2: Estrazione periodica dati biomeccanici e riabilitativi
    ETL->>ETL: Pipeline De-Identificazione: Rimozione PII, Hashing sale SHA-256, K-Anonimato
    ETL->>SILO3: Caricamento dati anonimi nel Research Warehouse universitario
    SILO3-->>ETL: Validazione ETL completata con successo""",
        "kpi_table": r"""#### Indicatori di Accettazione Operativa & Clinica (KPI)
| Metrica / Parametro | Obiettivo Target | Tolleranza Accettabile | Azione Fallback / Allerta |
| :--- | :--- | :--- | :--- |
| **Segreto Medico EMR** | $100\%$ diagnosi oscurate a staff tecnico| $0\%$ leak sanitario | Blocco immediato vista referti non autorizzati |
| **Validazione RTP 6 Fasi** | Doppia firma digitale obbligatoria | $0\%$ eccezioni consentite | Inidoneità automatica a scendere in campo |
| **Anonimizzazione Silo 3** | De-identificazione irreversibile HIPAA/GDPR| $0\%$ re-identificazione | Abort spedizione verso Research Data Lake |
| **Latenza Pipeline ETL Batch**| Conclusione entro $60\text{ min}$ (notturno) | Entro $180\text{ min}$ | Accodamento ritrasmissione a bassa priorità |""",
        "error_table": r"""### Matrice Errori HTTP & Strategie di Resilienza
| HTTP Code | Codice Interno | Endpoint | Causa Scatenante | UX Feedback Visivo | Strategia di Resilienza & Fallback |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **400** | `ERR_MALFORMED_EMR` | `POST /emr/records` | Struttura referto medico non conforme allo standard | Alert: *"Campi clinici obbligatori mancanti"* | Evidenziazione campi diagnostici da compilare |
| **401** | `ERR_DOCTOR_SIGN` | `POST /rtp/sign-off` | Firma digitale del medico non valida o scaduta | Modale: *"Rinnova il certificato di firma medica"* | Richiesta nuovo token di firma qualificato |
| **403** | `ERR_PRIVACY_VIOLATION`| `GET /emr/diagnosis`| Membro dello staff tecnico tenta di leggere diagnosi| Schermata rossa: *"Accesso negato: Segreto Medico"*| Logging di sicurezza e notifica al DPO societario |
| **409** | `ERR_RTP_SKIP_PHASE` | `POST /rtp/advance` | Tentativo di saltare una fase del protocollo RTP | Dialog: *"Impossibile avanzare senza completare fase precedente"*| Blocco avanzamento fino a doppia firma dello step |
| **500** | `ERR_ETL_DEIDENT_FAIL`| `POST /etl/research-sync`| Fallimento processo di hashing e de-identificazione | Nessun impatto clinico sul club | Interruzione trasferimento e isolamento dataset |
| **503** | `ERR_SILO3_OFFLINE` | `POST /etl/research-sync`| Research Warehouse accademico temporaneamente offline| Icona batch: *"Sincronizzazione ricerca differita"* | Retry automatico programmato nella notte successiva |"""
    }
}

def enhance_all():
    print(f"Inizio potenziamento completo di {len(SPECS)} file di capitolato...")
    for key, item in SPECS.items():
        fpath = os.path.join(BASE_DIR, item["file"])
        if not os.path.exists(fpath):
            print(f"File non trovato: {fpath}")
            continue

        with open(fpath, "r", encoding="utf-8") as fp:
            content = fp.read()

        # 1. Normalizza la riga del Badge Miro Board con Shape ID e Coordinate reali
        new_badge_line = f"- **Badge Miro Board:** `#{key}` (Posizione: `{item['badge_pos']}`, Miro Shape ID: `{item['badge_id']}`)"
        content = re.sub(r"- \*\*Badge Miro Board:\*\* `#[0-9]+` \(Posizione:[^\)]+\)", new_badge_line, content)

        # 2. Inserimento o sostituzione Sequence Diagram tra Sezione 3 e Sezione 4
        seq_block = f"### {item['seq_title']}\n\n```mermaid\n{item['seq_code'].strip()}\n```\n"
        if "sequenceDiagram" in content:
            # Sostituisci blocco sequenceDiagram esistente
            content = re.sub(r"### Sequence Diagram[^\n]*\n\n```mermaid\nsequenceDiagram[\s\S]*?```\n", lambda m: seq_block, content)
        else:
            # Inserisci prima di '## 4. Flusso Operativo Passo-Passo'
            target_s4 = "## 4. Flusso Operativo Passo-Passo"
            if target_s4 in content:
                parts = content.split(target_s4)
                content = parts[0].rstrip() + "\n\n" + seq_block + "\n---\n\n" + target_s4 + parts[1]

        # 3. Inserimento o sostituzione Tabella KPI in Livello A
        kpi_block = item["kpi_table"].strip()
        if "Indicatori di Accettazione Operativa & Clinica (KPI)" in content:
            # Sostituisci tabella KPI esistente
            content = re.sub(r"#### Indicatori di Accettazione Operativa & Clinica \(KPI\)[\s\S]*?(?=\n---|### Livello B)", lambda m: kpi_block + "\n\n", content)
        else:
            # Inserisci prima di '### Livello B:'
            target_b = "### Livello B: Trattazione Tecnica Nodi Operativi"
            if target_b in content:
                parts = content.split(target_b)
                content = parts[0].rstrip() + "\n\n---\n\n" + kpi_block + "\n\n---\n\n" + target_b + parts[1]

        # 4. Inserimento o sostituzione Matrice Errori HTTP in Sezione 6
        err_block = item["error_table"].strip()
        if "Matrice Errori HTTP & Strategie di Resilienza" in content:
            # Sostituisci tabella errori esistente
            content = re.sub(r"### Matrice Errori HTTP & Strategie di Resilienza[\s\S]*?(?=\n---|## 7\.)", lambda m: err_block + "\n\n", content)
        else:
            # Inserisci prima di '## 7. Ereditarietà di Tier & Differenziali di Fascia'
            target_s7 = "## 7. Ereditarietà di Tier & Differenziali di Fascia"
            if target_s7 in content:
                parts = content.split(target_s7)
                content = parts[0].rstrip() + "\n\n" + err_block + "\n\n---\n\n" + target_s7 + parts[1]

        # Pulizia di doppie linee divisorie '---'
        content = re.sub(r"(\n---\n)+", "\n---\n\n", content)

        with open(fpath, "w", encoding="utf-8") as fp:
            fp.write(content)
        print(f"File {key} ({item['file']}) aggiornato con successo!")

if __name__ == "__main__":
    enhance_all()
