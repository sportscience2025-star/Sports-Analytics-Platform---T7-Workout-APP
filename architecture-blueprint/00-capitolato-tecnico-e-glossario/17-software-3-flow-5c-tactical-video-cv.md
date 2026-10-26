# Capitolato Tecnico: Flow 5C – Confidential Tactical Video Computer Vision (T7 Elite Pro Teams)

## 1. Identificativo & Titolo Ufficiale
- **Codice Univoco:** `FLOW-5C`
- **Titolo Ufficiale:** SOFTWARE 3 (B2B ENTERPRISE) - FLOW 5C: CONFIDENTIAL TACTICAL VIDEO COMPUTER VISION (PITCH ANALYSIS)
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 3: High-Level Pro Teams & Enterprise, Colonna 5: Video Analisi Tattica & Computer Vision)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-3-elite-club-enterprise/flow-5c-tactical-video-cv.mmd`

---

## 2. Obiettivo di Business & Target Utente
- **Target Utente:** Match Analyst, Tattici, Head Coach e Staff Tecnico di club professionistici (Tier 3 – B2B Enterprise).
- **Problema Risolto:** L'analisi tattica tradizionale delle partite e degli allenamenti richiede ore di "tagging manuale" e non fornisce metriche geometriche oggettive sullo spazio occupato sul campo. Inoltre, i video tattici delle sedute a porte chiuse contengono schemi segreti e strategie di palla inattiva che non devono mai fuoriuscire dal club. T7 implementa un sistema di **Visione Artificiale Markerless Confidenziale**:
  1. Caricamento video multi-camera sincronizzato a 60-120 fps;
  2. Rilevamento automatico delle coordinate $(X,Y)$ di tutti i 22 calciatori tramite modelli deep learning YOLO e pose estimation;
  3. **Trasformazione Omografica:** Proiezione prospettica dal punto di vista della telecamera al piano bidimensionale calibrato del campo di gioco ($105\text{m} \times 68\text{m}$);
  4. Calcolo geometrico dei **Diagrammi di Voronoi** per quantificare lo spazio dominato da ciascun reparto;
  5. Calcolo della compattezza di squadra (distanza tra linea difensiva e offensiva) e del baricentro dinamico;
  6. **Sicurezza Anti-Leak Inderogabile:** Watermark dinamico in sovrimpressione con dati dell'operatore connesso e blocco totale dell'accesso dall'esterno della rete del club.

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)
1. **Corsia 1: Thin Client UI/UX (Tactical Video Suite - React 18 & WebGL):**
   - Player video multi-camera a 60 fps sincronizzato, sovrimpressione delle bounding box dei calciatori e dei vettori di corsa, overlay grafico metriche tattiche (linee di pressione, baricentro, compattezza in metri), cassetto di tagging eventi (transizioni positive/negative, recuperi palla, duelli aerei) e watermark di sicurezza dinamico antifuga ("STRETTAMENTE RISERVATO - NON DIFFONDIBILE").
2. **Corsia 2: API Gateway & Secure Streaming (Envoy / Zero-Trust Gateway):**
   - Ricezione upload video tattico ad alto bitrate (`/video/upload-tactical`), verifica ferrea dell'origine della richiesta (blocco immediato se la chiamata non proviene dalla rete interna protetta del Centro Sportivo o dalla VPN crittografata autorizzata). **Zero integrazioni con social o canali pubblici.**
3. **Corsia 3: Server Scatola Nera (Computer Vision & Tactics Engine - Cloud Run GPU):**
   - Pipeline di Computer Vision accelerata su GPU: detection e tracking dei giocatori (ByteTrack/YOLOv8), calcolo della matrice di omografia per proiettare i pixel video in coordinate metriche reali sul terreno di gioco e partizionamento spaziale con diagrammi di Voronoi.
4. **Corsia 4: Database Silo 2 (Bunker Club KMS Enclave - PostgreSQL Dedicated):**
   - Tabelle ad alta densità `tactical_coordinates` (coordinate spaziali per ogni frame video) e `match_tactical_events` (tag con minutaggio e clip associate), protette da crittografia a riposo Cloud KMS.

---

## 4. Flusso Operativo Passo-Passo (Nodi Numerati)
1. **START (Caricamento Video Tattico Gara / Allenamento):** Il Match Analyst carica le registrazioni multi-angolari (telecamera panoramica tattica e telecamera ravvicinata di campo) sulla piattaforma.
2. **GW_VIDEO_UPLOAD & GW_CHECK_INTERNAL (Controllo Sicurezza di Rete):** L'API Gateway verifica che l'indirizzo IP di provenienza appartenga alla subnet interna del Centro Sportivo societario:
   - *Se la richiesta proviene da rete esterna non protetta:* La richiesta viene rigettata all'istante (`GW_BLOCKED`), impedendo la manipolazione o la visualizzazione di filmati riservati da postazioni non autorizzate.
   - *Se la richiesta è conforme:* Il video viene instradato verso i cluster GPU di calcolo.
3. **SRV_CV_DETECTION (Computer Vision YOLO & Pose Tracking):** Gli algoritmi di deep learning analizzano ciascun frame a 60 fps, identificando le sagome dei calciatori, distinguendo le due squadre in base ai colori sociali delle maglie e tracciando i baricentri corporei.
4. **SRV_HOMOGRAPHY (Trasformazione Omografica 2D):**
   - Tramite l'identificazione delle linee del campo (linea di metà campo, aree di rigore, cerchio centrale), il server calcola la matrice di trasformazione prospettica $H$.
   - Converte le coordinate pixel $(u,v)$ del fotogramma video in metri reali $(X,Y)$ sul terreno di gioco.
5. **SRV_VORONOI (Calcolo Diagrammi di Voronoi):** Il server partiziona la superficie del campo di gioco in poligoni di dominanza spaziale: ogni punto del terreno appartiene al calciatore più vicino. Ciò consente di quantificare istantaneamente:
   - Superficie dominata dalla squadra (es. 58% del campo occupato);
   - Distanza tra le linee di reparto (es. squadra lunga $> 35\text{ metri}$, squadra compatta $< 25\text{ metri}$);
   - Posizione del Baricentro di squadra (metri rispetto alla linea di porta).
6. **DB_WRITE_COORDS & DB_WRITE_TAGS (Archiviazione Silo 2):** Scrittura delle serie di coordinate e degli eventi nel bunker crittografato societario.
7. **PLAYER_CANVAS & METRIC_OVERLAY (Visualizzazione Tattica nel Client):**
   - Il player visualizza il video con i poligoni di Voronoi in trasparenza neon semitrasparente;
   - Linee di connessione tra i difensori e indicatori di compattezza numerica;
   - Bounding box colorate sui calciatori con velocità istantanea in $\text{km/h}$.
8. **CONFIDENTIAL_LOCK (Watermark Dinamico Anti-Fuga):** In sovrimpressione sul video scorre costantemente un watermark trasparente con: Nome del club, Cognome dell'operatore connesso, Indirizzo IP e Timestamp al secondo. In caso di screenshot o ripresa con smartphone, la fonte della fuga di notizie è immediatamente identificabile ed esposta a procedimenti legali e contrattuali.
9. **TAG_DRAWER & EXPORT_REPORT_BTN (Tagging & Dossier Tecnico):** L'analista inserisce tag rapidi ("Pressing Alto Riuscito", "Perdita Palla Costruzione Bassa") ed esporta il dossier tecnico multimediale per l'Head Coach in vista della riunione tecnica pre-partita.
10. **END_TACTICAL_DONE (Fine Flusso):** Analisi tattica completata e blindata nel bunker del club.

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI
- **Decisione Rete Sicura (`GW_CHECK_INTERNAL`):** IP Rete Interna Club $\implies$ Elaborazione Video; Rete Esterna $\implies$ Blocco d'accesso assoluto.
- **Decisione Visualizzazione:** Overlay Poligoni Voronoi vs Linee di Reparto vs Video Grezzo.

### Gestione dei 4 Stati UI:
1. **Empty State:** Nessun video caricato per la seduta corrente; visualizzazione box drag-and-drop con istruzioni di calibrazione delle telecamere tattiche.
2. **Loading State:** Elaborazione dell'omografia e della detection YOLO con barra di avanzamento e anteprima dei frame processati.
3. **Populated State:** Player multi-camera sincronizzato a 60 fps con controlli di rallentatore ($0.25\times, 0.5\times, 1\times$), poligoni di Voronoi dinamici e timeline con indicatori colorati dei tag tattici.
4. **Error / Fallback State:** Condizioni meteo estreme (nebbia o pioggia battente) che oscurano le linee del campo; il sistema richiede all'analista di cliccare manualmente sui 4 vertici del campo (calibrazione manuale dell'omografia a 4 punti).

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Endpoint Principali:
- `POST /api/v1/club/video/upload-tactical`:
  - Input: `{ clubId: string, matchDate: 'YYYY-MM-DD', videoFileUrl: string, cameraAngle: 'PANORAMIC_TACTICAL' }`
  - Output: `{ videoJobId: string, status: 'processing_cv' }`
- `GET /api/v1/club/video/tactical-frames?jobId=cv_108&timeSec=142.5`:
  - Output: `{ timestamp: 142.5, players: [{ number: 9, team: 'HOME', xMeters: 42.1, yMeters: 18.5, voronoiAreaM2: 184.2 }], teamCompactnessM: 23.4, teamBarycenterM: 52.8 }`

### Tabelle Database Coinvolte (Silo 2 - Enclave Club):
- `tactical_video_sessions`: id, club_id, match_name, recording_date, camera_setup, kms_video_storage_path.
- `tactical_coordinates`: id, session_id, frame_index, timestamp_ms, player_id, x_coord_m, y_coord_m, velocity_kmh.
- `match_tactical_events`: id, session_id, event_type ('HIGH_PRESS'|'TURNOVER'|'AERIAL_DUEL'), start_time_ms, end_time_ms, analyst_notes.

---

## 7. Ereditarietà di Tier & Differenziali di Fascia
- **Differenziali rispetto a Tier 1 e Tier 2:**
  - Nel Tier 1 (`flow-5a`) vi è un social network pubblico;
  - Nel Tier 2 (`flow-5b`) vi è un player per singoli allievi con annotazioni commerciali;
  - Nel Tier 3 (`flow-5c`) qualsiasi logica social o pubblica è **tassativamente cancellata**. Il sistema si trasforma in un'infrastruttura di intelligence militare/sportiva confinata nella rete fisica del club con computer vision d'avanguardia (Voronoi e omografia metrica 2D).
- **Protezione Proprietà Intellettuale:** Il watermark dinamico e la crittografia Silo 2 impediscono l'esfiltrazione delle tattiche societarie.
