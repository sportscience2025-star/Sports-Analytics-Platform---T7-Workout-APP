# Capitolato Tecnico: Flow 2A – Catalogo Esercizi & Avatar Biomeccanico 3D (T7 Consumer)

## 1. Identificativo & Titolo Ufficiale
- **Codice Univoco:** `FLOW-2A`
- **Titolo Ufficiale:** SOFTWARE 1 (B2C CONSUMER) - FLOW 2A: CATALOGO ESERCIZI & AVATAR BIOMECCANICO 3D
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 1: General User / Casual, Colonna 2: Catalogo Esercizi & 3D)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-1-consumer-b2c/flow-2a-personal-cockpit.mmd`

---

## 2. Obiettivo di Business & Target Utente
- **Target Utente:** Utenti comuni e atleti amatoriali che desiderano consultare gli esercizi, comprendere la corretta esecuzione tecnica, visualizzare il coinvolgimento muscolare nello spazio 3D e salvare i propri esercizi preferiti.
- **Problema Risolto:** Superare le limitazioni dei vecchi cataloghi basati su foto statiche o video muti. T7 fornisce un avatar 3D interattivo esplorabile a 360° con OrbitControls, evidenziazione cromatica dei muscoli agonisti/antagonisti/stabilizzatori e protocollo di correzione errori biomeccanici ("Why & Fix"), garantendo al tempo stesso una fluida degradazione a video 2D su dispositivi datati.

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)
1. **Corsia 1: Thin Client UI/UX (React 18 + WebGL / Three.js):**
   - Schermata catalogo con ricerca testuale istantanea (debounce 250ms), chip di filtro multidistretto (gruppo muscolare, pattern motorio, attrezzatura), griglia dinamica di ExerciseCard, canvas 3D interattivo con controlli touch e protocollo tecnico.
2. **Corsia 2: API Gateway & Feature Gating (Envoy / Kong + Redis Cache):**
   - Endpoint protetto con token JWT Tier 1, verifica dei permessi di lettura pubblica, caching a livello edge (Redis TTL 24h) per azzerare la latenza di caricamento dei 328 esercizi.
3. **Corsia 3: Server Scatola Nera (CDN 3D & Streaming Cinematico Cloud Run):**
   - Distribuzione ottimizzata delle mesh tridimensionali compresse con Google Draco (`.glb`), calcolo delle coordinate articolari cinematiche e timeline delle fasi concentrica/eccentrica/isometrica (TUT).
4. **Corsia 4: Database Silo 1 (Consumer Relational Data Store - PostgreSQL):**
   - Tabella `catalog_exercises` con indici vettoriali e full-text, e tabella `user_favorites` per la memorizzazione dei preferiti dell'atleta.

---

## 4. Flusso Operativo Passo-Passo (Nodi Numerati)
1. **START (Accesso Catalogo):** L'utente tocca la voce "Catalogo Esercizi" dalla barra di navigazione o dalla home dell'app.
2. **DEC_SEARCH (Bivio Modalità di Ricerca):** L'utente può scegliere tra navigazione esplorativa per filtri oppure digitazione diretta nel campo di ricerca.
3. **UI_FILTERS (Filtri Dinamici Multidistretto):** Selezione per distretto anatomico (Pettorali, Dorso, Spalle, Braccia, Gambe, Core, Clinico), pattern (Spinta, Trazione, Accosciata, Cerniera d'anca) o attrezzatura (Bilanciere, Manubri, Cavi, Macchinari, Corpo Libero).
4. **UI_SEARCH (Ricerca Full-Text Istantanea):** Barra di ricerca con debounce di 250 millisecondi per interrogare istantaneamente il catalogo completo di 328 esercizi.
5. **GW_FETCH (Chiamata Gateway):** Inoltro richiesta `GET /api/v1/catalog/exercises` con parametri di query e validazione JWT.
6. **GW_CACHE (Controllo Cache Edge Redis):**
   - *Cache Hit:* Risposta immediata in <15ms servita dall'edge.
   - *Cache Miss:* Interrogazione del database (`DB_QUERY`) e popolamento cache.
7. **DEC_RESULTS (Esito Query):**
   - *Match Trovati:* Transizione a `GRID_POPULATED` con elenco di schede esercizio.
   - *Zero Match:* Visualizzazione di `UI_EMPTY` con suggerimento di parole chiave simili o reset dei filtri.
8. **GRID_POPULATED (Rendering Griglia):** Renderizzazione fluida di ExerciseCard con badge biomeccanici, preview del movimento e livello di difficoltà.
9. **DEC_WEBGL (Verifica Supporto Grafico):** Al tap su un esercizio, il client verifica la disponibilità del contesto WebGL e dell'accelerazione hardware GPU del dispositivo.
   - *Se WebGL è supportato:* Il server scarica il modello compresso Draco (`SRV_3D_STREAM`) e la cinematica (`SRV_KINEMATICS`), avviando il `VIEWER_3D`.
   - *Se WebGL non è supportato o fallisce:* Il sistema attiva la degradazione morbida (`FALLBACK_2D`), caricando il video pre-renderizzato in MP4 a 60fps con sprite loop.
10. **VIEWER_3D (Visualizzatore Biomeccanico 3D):**
    - Interazione a 360° con gesture touch (rotazione, pan, tilt zenitale/dal basso).
    - Mappatura cromatica fasce muscolari: **Rosso** (motori primari), **Giallo** (sinergici/secondari), **Ciano** (stabilizzatori isometrici).
    - Timeline TUT (Time Under Tension) con cursore sincrono sulle fasi concentrica ed eccentrica.
11. **UI_PROTOCOL (Protocollo Tecnico & Correzione Errori):** Tab esplicativa con punti chiave di setup, traiettoria ideale e confronto tra esecuzione corretta ed errori tipici ("Why & Fix").
12. **DEC_ACTION (Azione Post-Consultazione):** L'utente può:
    - Salvare l'esercizio nei Preferiti (`GW_FAV` $\to$ `DB_FAV_SAVE`).
    - Avviare direttamente la sessione di allenamento caricando l'esercizio nel Workout Player (`TRANSITION_PLAYER`).
13. **END_READY (Fine Flusso):** Esercizio assimilato dall'atleta e pronto per l'esecuzione.

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI
- **Decisione Modalità Ricerca (`DEC_SEARCH`):** Filtri anatomici vs Ricerca testuale full-text.
- **Decisione Cache Gateway (`GW_CACHE`):** Cache Hit (Edge) vs Cache Miss (DB query).
- **Decisione Risultati (`DEC_RESULTS`):** Griglia popolata vs Empty State con suggerimenti.
- **Decisione Rendering 3D (`DEC_WEBGL`):** WebGL attivo $\implies$ Three.js 3D; WebGL assente $\implies$ Video MP4 60fps 2D.
- **Decisione Azione Utente (`DEC_ACTION`):** Salva Preferito vs Avvia Workout.

### Gestione dei 4 Stati UI:
1. **Empty State:** Ricerca senza risultati; mostra icona lente vuota, pulsante "Resetta tutti i filtri" e 4 esercizi correlati suggeriti.
2. **Loading State:** Skeleton card pulsanti con effetto glassmorphism durante il fetch dei dati e spinner circolare durante il download della mesh `.glb`.
3. **Populated State:** Griglia fluida con miniature, indicatori visivi di muscoli coinvolti e badge di sicurezza.
4. **Error / Fallback State:**
   - Fallback WebGL: passaggio automatico trasparente al video 2D senza interruzioni per l'utente.
   - Offline Mode: caricamento del catalogo pre-salvato in IndexedDB tramite Service Worker (`sw.js`).

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Endpoint Principali:
- `GET /api/v1/catalog/exercises?muscle=chest&pattern=push&q=bench`:
  - Output: `[{ id: 'ex_01', name: 'Panca Piana con Bilanciere', primaryMuscles: ['pectoralis_major'], modelGlbUrl: 'cdn/.../ex_01.glb', video2dUrl: 'cdn/.../ex_01.mp4', tut: { conc: 1.5, ecc: 3.0 } }]`
- `POST /api/v1/user/favorites`: `{ athleteId: string, exerciseId: string, note?: string }` $\to$ `{ status: 'saved' }`

### Tabelle Database Coinvolte (Silo 1):
- `catalog_exercises`: id, name_it, district, pattern, primary_muscles (JSONB), secondary_muscles (JSONB), cues (JSONB), model_url, video_url.
- `user_favorites`: user_id, exercise_id, created_at, custom_notes.

---

## 7. Ereditarietà di Tier & Differenziali di Fascia
- **Base Funzionale di Partenza:** Il Flow 2A definisce l'infrastruttura di consultazione 3D e protocollo biomeccanico standard dell'intera piattaforma.
- **Propagazione a Cascata Top-Down:**
  - Il Tier 2 (Partita IVA - `flow-2b`) **eredita al 100%** tutta la pipeline di visualizzazione 3D, filtri e ricerca del General User, a cui AGGIUNGE la videocamera in-app per filmare l'atleta, l'Edge Pose Estimation a 33 landmark, la bozza coach e la "Revisione Coerente AI".
  - Il Tier 3 (Elite Club - `flow-2c`) **eredita a sua volta tutto quanto sopra**, aggiungendovi il Digital Twin biometrico personalizzato sul singolo calciatore e la Libreria Club a 2 livelli con archiviazione crittografata in Silo 2 (Bunker KMS).
- **Limitazioni Tier 1:** L'utente comune può solo consultare ed eseguire; non può registrare o inserire esercizi custom nel catalogo (funzionalità riservata ai professionisti).
