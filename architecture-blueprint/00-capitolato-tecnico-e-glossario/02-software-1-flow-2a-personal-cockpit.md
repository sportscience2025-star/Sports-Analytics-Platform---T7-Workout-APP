# Capitolato Tecnico: Flow 2A – Catalogo Esercizi & Avatar Biomeccanico 3D (T7 Consumer)

## 1. Identificativo & Titolo Ufficiale
- **Badge Miro Board:** `#02` (Posizione: `X: 27.35, Y: 179.87`, Miro Shape ID: `3458764688417722707`)
- **Codice Univoco:** `FLOW-2A`
- **Titolo Formale:** SOFTWARE 1 (B2C CONSUMER) - FLOW 2A: CATALOGO ESERCIZI & AVATAR BIOMECCANICO 3D
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 1: General User / Casual, Colonna 2: Catalogo Esercizi & 3D)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-1-consumer-b2c/flow-2a-personal-cockpit.mmd`
- **Riferimento Glossario:** [Glossario Tecnico Vivente](00-GLOSSARIO-TERMINI-TECNICI.md) (Voci: [Thin Client](00-GLOSSARIO-TERMINI-TECNICI.md#thin-client-guscio-visivo), [WebGL 3D Avatar](00-GLOSSARIO-TERMINI-TECNICI.md#gltf-glb-compressione-google-draco-mesh), [Google Draco Compression](00-GLOSSARIO-TERMINI-TECNICI.md#draco-geometry-compression-progressive-lod), [Time Under Tension TUT](00-GLOSSARIO-TERMINI-TECNICI.md#fasi-biomeccaniche-concentrica-vs-eccentrica-tut-time-under-tension), [Graceful Degradation](00-GLOSSARIO-TERMINI-TECNICI.md#graceful-degradation-webgl-performance-fallback), [Video Ingest Tiers](00-GLOSSARIO-TERMINI-TECNICI.md#video-ingest-tiers-policy-tier-1-zero-upload-tier-2-1080p-tier-3-4k8k))..

---

## 2. Obiettivo di Business & Target Utente

### Guida Pratica per Non Tecnici: Cos'è questo modulo per un umano?
Quante volte in palestra capita di trovarsi davanti a un esercizio nuovo e chiedersi: *"Come si fa senza farsi male alla schiena? Quali muscoli devo sentire bruciare?"*. Questo modulo è l'enciclopedia visiva vivente di T7 Workout. Al posto di noiose foto o video muti e sfuocati, l'atleta ha a disposizione un **Avatar Biomeccanico 3D** che si può ruotare a 360 gradi toccando lo schermo dello smartphone:
- I muscoli che lavorano di più si colorano di **rosso acceso**;
- Quelli secondari di supporto si colorano di **giallo**;
- I muscoli che mantengono la postura stabile si illuminano di **azzurro**.

Inoltre, una speciale guida *"Why & Fix"* mostra gli errori più comuni (es. ginocchia che crollano all'interno nello squat o schiena inarcata) e spiega subito con parole semplici come correggerli per non farsi male. Se lo smartphone è un po' vecchio o non regge la grafica 3D, l'app passa automaticamente e senza scatti a un video ad alta definizione a 60 fotogrammi al secondo.

#### Politica Architetturale Tier 1 (Zero Video Upload):
Per preservare la purezza dell'esperienza utente, contenere i costi di storage su Silo 1 e mantenere una netta separazione di business con i piani superiori:
1. **Zero Upload Video:** L'utente consumer non effettua riprese o caricamento di video personali in-app (funzionalità riservata a Tier 2 e Tier 3);
2. **Consultazione 100% Biomeccanica 3D:** Accesso completo e senza limiti alla libreria certificata di 328 esercizi visualizzabili tramite Avatar 3D Google Draco con rotazione orbitale a 360°;
3. **Graceful Degradation 2D:** Su smartphone datati o privi di WebGL, il sistema commuta istantaneamente su video 2D pre-renderizzato in MP4 a 60fps con 3 prospettive fisse;
4. **Why & Fix Interattivo:** Schede didattiche sui principali errori biomeccanici (in rosso/giallo) per garantire la massima sicurezza d'allenamento senza rischi lesivi.

### Specifiche di Business & Metriche
- **Target Utente:** Utenti amatoriali, appassionati di fitness e chiunque voglia apprendere la corretta tecnica esecutiva o archiviare la propria esecuzione (Tier 1 – Casual Consumer).
- **Problema Risolto:** Ridurre drasticamente gli infortuni da errata esecuzione, fornire feedback visivo istantaneo tra video personale e avatar 3D, e mantenere reattività immediata anche con upload mobile.

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)

1. **Corsia 1: Thin Client UI/UX (React 18 + WebGL Three.js):**
   - Modulo di ricerca ed esplorazione con debounce di 250ms;
   - Canvas 3D interattivo con controlli orbitali touch (`OrbitControls`);
   - Mappatura cromatica fasce muscolari (Agonisti, Sinergisti, Fissatori);
   - Guida Why & Fix sugli errori tecnici frequenti.
2. **Corsia 2: API Gateway & Feature Gating (Envoy Gateway + Redis Cache Cluster):**
   - Validazione token JWT Tier 1 con abilitazione esclusiva alla consultazione catalogo;
   - Caching edge su CDN Cloudflare (TTL 24 ore) delle risposte JSON di catalogo con latenza $< 15\text{ ms}$.
3. **Corsia 3: Server Scatola Nera (3D Mesh Delivery Cloud Run):**
   - Distribuzione mesh tridimensionali compresse con Google Draco (`.glb` con compressione $> 80\%`);
   - Calcolo delle timeline del Time Under Tension (fase eccentrica, fermo isometrico, fase concentrica).
4. **Corsia 4: Database Tripartito (Silo 1 - PostgreSQL & Public Storage):**
   - Tabelle `catalog_exercises` (328 record biomeccanici ufficiali) e `user_favorites` (preferiti utente).

---

### Sequence Diagram Asincrono del Ciclo di Vita (FLOW-2A)

```mermaid
sequenceDiagram
    autonumber
    actor Utente as Utente Consumer (Thin Client WebGL)
    participant GW as API Gateway & Gating Tier 1 (Corsia 2)
    participant CDN as CDN 3D Cloud Run (Corsia 3)
    participant DB as Database Silo 1 (Corsia 4)

    Utente->>GW: GET /api/v1/catalog/exercises (muscle, pattern, search)
    GW-->>Utente: 200 OK (Catalog JSON compresso, latenza < 15ms)
    Utente->>CDN: GET /models3d/exercise_draco.glb
    CDN-->>Utente: Mesh 3D compressa Draco (1-2 MB)
    Utente->>Utente: OrbitControls 360° & Fasce Muscolari
    Utente->>GW: POST /api/v1/user/favorites (exercise_id)
    GW->>DB: INSERT user_favorites (user_id, exercise_id)
    DB-->>GW: Commit confermato
    GW-->>Utente: 201 Created (Esercizio aggiunto ai preferiti)
```

---

## 4. Flusso Operativo Passo-Passo

### Livello A: User Journey Narrativo (La Storia dell'Utente)
1. **L'Apertura del Catalogo:** Dalla barra in basso dell'app, l'utente tocca l'icona *"Catalogo Esercizi"*.
2. **La Ricerca Dinamica:** L'atleta esplora i 328 esercizi filtrando per distretto muscolare o digitando il nome con debounce istantaneo a 250ms.
3. **Lo Studio Biomeccanico 3D:** L'utente visualizza l'Avatar 3D orbitale, osserva l'attivazione muscolare differenziata (rosso agonisti, giallo sinergisti, ciano stabilizzatori) e legge i consigli di correzione posturale "Why & Fix".
4. **L'Azione Finale:** Con un tocco salva l'esercizio nei Preferiti su Silo 1 o lo aggiunge alla scheda d'allenamento odierna inviandolo al Workout Player.

---

#### Indicatori di Accettazione Operativa & Clinica (KPI)
| Metrica / Parametro | Obiettivo Target | Tolleranza Accettabile | Azione Fallback / Allerta |
| :--- | :--- | :--- | :--- |
| **Risoluzione Max Video Ingest** | $1080\text{p}$ ($1920\times 1080$) | $\le 1080\text{p}$ | Downscaling automatico via WebCodecs su upload |
| **Tempo di Trimming Client** | $< 1.0\text{ s}$ per clip 30s | $\le 2.5\text{ s}$ | Trimming su I-Frame (Keyframe Lossless Slice) |
| **Framerate Rendering 3D** | $\ge 60\text{ FPS}$ stabili | $\ge 35\text{ FPS}$ | Attivazione Progressive LOD o fallback 2D |
| **Latenza Query Catalogo Edge** | $< 15\text{ ms}$ (Cache Hit) | $\le 50\text{ ms}$ | Servizio offline da Service Worker cache |

---

### Livello B: Trattazione Tecnica Nodi Operativi

1. `START` (Accesso Catalogo): Montaggio componente `CatalogFeatureView` con stato di sessione Tier 1.
2. `DEC_MODE_CONSUMER` (Bivio Modalità Utente):
   - *Ramo A:* Consultazione Catalogo Globale 3D $\to$ `DEC_SEARCH`;
   - *Ramo B:* Registrazione / Upload Video Personale $\to$ `UI_VIDEO_CAPTURE_1080P`.
3. `UI_VIDEO_CAPTURE_1080P` (Acquisizione Video Consumer):
   - Invoca `getUserMedia({ video: { width: { max: 1920 }, height: { max: 1080 }, frameRate: { max: 60 } } })`;
   - Blocco software per impedire stream 2K o 4K in ingresso.
4. `DEC_VIDEO_TRIM_BASE` (Decisione Taglio Clip): Se l'utente desidera rimuovere i secondi di setup $\to$ `UI_TRIM_BASE`; altrimenti upload diretto.
5. `UI_TRIM_BASE` (Lossless Client Trimming): Utilizzo di `mp4box.js` / `WebCodecs VideoDecoder` per estrarre la porzione compresa tra `startTrimMs` ed `endTrimMs`.
6. `RULE_LOCK_SPEED_AS_IS` (Vincolo di Velocità & No Edit):
   - Il motore di playback forza `playbackRate = 1.0`;
   - Disabilitati strumenti di annotazione, disegno o filtri colore.
7. `GW_UPLOAD_VIDEO` (Upload a Silo 1): Chiamata `POST /api/v1/user/personal-videos` con payload MP4 compresso.
8. `UI_COMPARE_AVATAR_1080P` (Confronto Split-Screen): Rendering del video personale 1080p affiancato al modello Draco 3D.
9. `DEC_ACTION` (Azione Finale): Salvataggio nei preferiti (`DB_FAV_SAVE`) o transizione al player (`FLOW-3A`).

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI

| Bivio Decisionale | Condizione Logica | Ramo SÌ / Positivo | Ramo NO / Negativo |
| :--- | :--- | :--- | :--- |
| `DEC_MODE_CONSUMER` | Utente sceglie video personale? | Acquisizione Video 1080p (`UI_VIDEO_CAPTURE_1080P`) | Ricerca ed esplorazione 3D (`DEC_SEARCH`) |
| `DEC_VIDEO_TRIM_BASE`| Utente richiede taglio clip? | Interfaccia trim base (`UI_TRIM_BASE`) | Upload as-is diretto (`GW_UPLOAD_VIDEO`) |
| `DEC_WEBGL` | Supporto WebGL 2.0 e GPU attivo? | Render 3D interattivo (`VIEWER_3D`) | Fallback video 2D pre-renderizzato (`FALLBACK_2D`) |
| `DEC_ACTION` | Azione post-consultazione? | Aggiungi a Preferiti (`DB_FAV_WRITE`) | Invia al Player (`FLOW-3A`) |

### I 4 Stati di Interfaccia Utente (UI States):
1. **Empty State:** Nessun video personale registrato: card *"Registra la tua prima esecuzione per confrontarla con l'omino 3D"* con icona fotocamera.
2. **Loading State:** Barra di avanzamento trimming istantaneo con indicatore *"Rifilatura clip in corso sul dispositivo..."*.
3. **Populated State:** Vista a doppio pannello: Video registrato 1080p a sinistra e Avatar 3D navigabile a destra con pulsante di sincronizzazione loop.
4. **Error / Fallback State:**
   - *File video eccedente 1080p:* Compressione e downscaling automatico a 1080p prima dell'invio.

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Specifiche Endpoint REST:

#### 1. Upload Video Esecuzione Personale (Tier 1)
- **Endpoint:** `POST /api/v1/user/personal-videos`
- **Headers:** `Authorization: Bearer <consumer_jwt>`, `Content-Type: multipart/form-data`
- **Request Form Data:**
  - `videoFile`: File binario MP4 (max 50 MB, risoluzione max 1080p, 60fps);
  - `exerciseId`: "ch_barbell_bench_press_01";
  - `trimStartMs`: 1200;
  - `trimEndMs`: 24500;
  - `playbackSpeed`: 1.0 (vincolato da backend).
- **Responses:**
  - `201 Created`:
```json
{
  "videoId": "vid_usr_88291a",
  "resolution": "1080p",
  "playbackSpeedLocked": 1.0,
  "videoUrl": "https://storage.t7workout.app/silo1/personal-videos/vid_usr_88291a.mp4",
  "exerciseId": "ch_barbell_bench_press_01",
  "createdAt": "2026-11-02T22:30:00Z"
}
```

---

### Matrice Errori HTTP & Strategie di Resilienza
| HTTP Code | Codice Interno | Endpoint | Causa Scatenante | UX Feedback Visivo | Strategia di Resilienza & Fallback |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **400** | `ERR_RES_EXCEEDED` | `POST /user/personal-videos` | Risoluzione $> 1080\text{p}$ | Alert: *"Risoluzione massima 1080p per account standard"* | Downscaling automatico via WebCodecs client |
| **403** | `ERR_EDIT_FORBIDDEN` | `POST /user/personal-videos` | Tentativo di inviare speed rate $\ne 1.0$ | Toast: *"Funzionalità slow-motion riservata a Tier Pro"* | Reset automatico della velocità a 1.0x |
| **413** | `ERR_VIDEO_TOO_LARGE` | `POST /user/personal-videos` | File $> 50\text{ MB}$ | Notifica: *"Video troppo pesante. Esegui il trim della clip"* | Apertura automatica del pannello di trimming base |

---

## 7. Ereditarietà di Tier & Differenziali di Fascia

- **Funzionalità Base (Tier 1):** Consultazione del catalogo 328 esercizi, visualizzatore 3D WebGL con muscoli primari/secondari, registrazione video personale max 1080p as-is, velocità fissa 1.0x e trimming base inizio/fine.
- **Ereditarietà verso Tier 2 (`FLOW-2B`):**  
  Il professionista (P.IVA) eredita il modulo di registrazione, sbloccando la risoluzione **2K (1440p)**, lo **slider di velocità (slow-motion 0.25x e accelerazione 2.0x)**, l'estrazione scheletrica 3D con MediaPipe a 33 keypoints e l'audit scientifico AI con RAG accademico.
- **Ereditarietà verso Tier 3 (`FLOW-2C`):**  
  I club d'élite ereditano la pipeline video portandola a risoluzione **4K/8K High-Speed a 120fps**, con sincronizzazione **multi-camera SMPTE**, scrubbing millimetrico frame-by-frame, suite di editing tattico con Telestrator, Forensic Watermarking anti-leak e archiviazione nel Secret Club Vault.
