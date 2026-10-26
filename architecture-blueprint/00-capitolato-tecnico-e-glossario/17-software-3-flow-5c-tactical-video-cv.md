# Capitolato Tecnico: Flow 5C – Confidential Tactical Video & Voronoi Computer Vision (T7 Elite Pro Teams)

## 1. Identificativo & Titolo Ufficiale
- **Badge Miro Board:** `#17` (Posizione: `X: 6464, Y: 6580`)
- **Codice Univoco:** `FLOW-5C`
- **Titolo Formale:** SOFTWARE 3 (B2B ENTERPRISE) - FLOW 5C: TACTICAL VISION, COMPUTER VISION SUL CAMPO & DIAGRAMMI DI VORONOI
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 3: High-Level Pro Teams & Enterprise, Colonna 5: Tactical Vision & Computer Vision)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-3-elite-club-enterprise/flow-5c-tactical-video-cv.mmd`
- **Riferimento Glossario:** [Glossario Tecnico Vivente](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/architecture-blueprint/00-capitolato-tecnico-e-glossario/00-GLOSSARIO-TERMINI-TECNICI.md) (Voci: *Tactical Vision Computer Vision, Omografia Prospettica 2D, Diagrammi di Voronoi Campo, Modello YOLOv8 Object Detection, Zero Social Leakage, Baricentro Squadra*).

---

## 2. Obiettivo di Business & Target Utente

### Guida Pratica per Non Tecnici: Cos'è questo modulo per un umano?
Nel calcio moderno le partite si vincono o si perdono per questione di spazi: una squadra che resta compatta e non lascia buchi tra centrocampo e difesa è quasi impossibile da battere. Gli allenatori passano ore e ore a rivedere i video delle partite, disegnando frecce a mano sui filmati.  
**Tactical Vision di T7** è l'occhio bionico dell'allenatore:
- Prende i filmati delle telecamere fisse dello stadio o del centro sportivo;
- Grazie all'Intelligenza Artificiale (Computer Vision), riconosce all'istante ogni singolo giocatore delle due squadre e la posizione della palla;
- Schiaccia la prospettiva della telecamera e trasforma il video in una **mappa 2D dall'alto (Bird's Eye View)** perfetta al millimetro;
- Disegna sul campo i celebri **Poligoni di Voronoi**: colora le zone di campo controllate dalla tua squadra e quelle lasciate agli avversari;
- Calcola in automatico la **compattezza della squadra** (quanto è corta la squadra tra primo difensore e ultimo attaccante) e il baricentro medio;
- **Zero Social:** Nessuna immagine o dato di questo modulo può essere condiviso sui social: tutto rimane blindato nel bunker del club per la riunione tecnica prima della partita.

### Specifiche di Business & Metriche
- **Target Utente:** Head Coach, Vice Allenatori e Match Analyst di club professionistici (Tier 3 – B2B Enterprise).
- **Problema Risolto:** Automatizzare la match analysis tattica in tempo reale eliminando decine di ore di montaggio video manuale e fornendo parametri oggettivi di densità e pressione per battere gli avversari.

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)

1. **Corsia 1: Thin Client UI/UX (Tactical Vision Canvas React 18):**
   - Interfaccia per il Match Analyst: player video sincronizzato con canvas 2D del terreno di gioco, sovrimpressione interattiva dei poligoni di Voronoi, linee di pressing dinamiche, tracciamento del baricentro medio e pannello di esportazione del Dossier Tattico per l'Head Coach.
2. **Corsia 2: API Gateway & Video Feed Gateway (Envoy Private VPC):**
   - Connessione protetta con mTLS societario, ricezione flussi video 4K/60fps dalla regia stadio, blocco assoluto di endpoint verso social network esterni e filtro anti-scraping.
3. **Corsia 3: Server Scatola Nera (Computer Vision & Homography Engine Cloud Run GPU):**
   - Rete neurale YOLOv8x per object detection (calciatori squadra A, squadra B, arbitro, pallone);
   - Algoritmo di tracciamento multi-target ByteTrack;
   - *Matrice di Omografia Prospettica $3 \times 3$ ($H$):* Mappatura dei punti immagine $(u, v)$ sul piano reale del campo $(X, Y)$ in metri;
   - *Tassellazione di Voronoi:* Calcolo geometrico delle aree di influenza tramite triangolazione di Delaunay;
   - Sincronizzazione dei vettori di velocità video con i dati dei sensori GPS a 18Hz (`FLOW-4C`).
4. **Corsia 4: Database Tripartito (Silo 2 - Enclave Bunker PostgreSQL):**
   - Tabelle `tactical_match_sessions`, `pitch_space_control` e `tactical_dossiers` protette da chiavi Cloud KMS societarie.

---

## 4. Flusso Operativo Passo-Passo

### Livello A: User Journey Narrativo (La Storia dell'Utente)
1. **L'Acquisizione del Video di Gara:** Durante o al termine del primo tempo, il Match Analyst carica il flusso video registrato dalla telecamera tattica posta sulla tribuna dello stadio.
2. **Il Riconoscimento Istantaneo dei Giocatori:** L'Intelligenza Artificiale scansiona ogni fotogramma: riconosce i calciatori della maglia di casa, gli avversari e il pallone, assegnando a ciascuno una casella di tracciamento che non si perde nemmeno nei contrasti.
3. **La Trasformazione 2D dall'Alto:** L'app raddrizza la prospettiva angolata dello stadio e genera una perfetta visuale piana del campo, come in un videogioco tattico.
4. **I Poligoni di Voronoi (Il Controllo dello Spazio):** Sullo schermo compaiono tessere geometriche colorate:
   - Ogni porzione di campo si colora del colore della squadra il cui giocatore è più vicino a quello spazio;
   - L'analista vede all'istante che gli avversari hanno lasciato **25 metri di spazio libero tra terzino e difensore centrale**;
5. **La Compattezza della Squadra:** Un grafico laterale mostra: *"La nostra squadra è lunga 31 metri: compattezza perfetta. Al 38° minuto però il baricentro si è abbassato di 12 metri sotto la pressione avversaria"*.
6. **La Relazione per l'Allenatore nell'Intervallo:** In 60 secondi il sistema compila un **Dossier Tattico Sintetico** di 3 pagine con le 5 clip video più significative e le mappe di calore, che l'Head Coach può mostrare ai giocatori nello spogliatoio tra primo e secondo tempo per correggere la tattica.

---

### Livello B: Trattazione Tecnica Nodi Operativi

1. `START` (Acquisizione Flusso Video Gara): Ricezione stream RTSP/HLS 4K da telecamera panoramica fissa posta in tribuna stadio.
2. `GW_FEED_INGEST` (Ingestion Gateway Privato): Instradamento su rete privata isolata. Verifica assenza di canali verso internet pubblico (No-Social Filter).
3. `SRV_YOLO_DETECT` (Rilevamento Giocatori & Palla):
   - Modello YOLOv8x ottimizzato con TensorRT su GPU NVIDIA L4;
   - Identificazione di 23 classi: 11 squadra casa, 11 squadra ospite, 1 pallone.
4. `SRV_HOMOGRAPHY_CALC` (Trasformazione Omografica Prospettica 2D):
   - Riconoscimento automatico delle linee del campo (linee laterali, area di rigore, cerchio di centrocampo);
   - Calcolo della matrice di omografia planare $H$ tale che:
     $$\begin{bmatrix} X \\ Y \\ 1 \end{bmatrix} \sim H \begin{bmatrix} u \\ v \\ 1 \end{bmatrix}$$
   - Conversione delle coordinate pixel in coordinate metriche reali sul terreno $(X, Y) \in [-52.5, 52.5] \times [-34.0, 34.0]\text{ metri}$.
5. `SRV_VORONOI_TESSELLATION` (Calcolo Diagrammi di Controllo Spazi):
   - Per ogni giocatore $i$ sul piano $2D$, calcolo della regione di Voronoi:
     $$V_i = \{ p \in \text{Pitch} \mid d(p, x_i) < d(p, x_j) \, \forall j \neq i \}$$
   - Calcolo della percentuale di superficie dominata da ciascun team e della densità attorno al pallone.
6. `SRV_COMPACTNESS & CENTROID` (Calcolo Baricentro e Compattezza):
   - Baricentro squadra: media aritmetica delle posizioni $(X, Y)$ dei 10 giocatori di movimento;
   - Compattezza: distanza euclidea tra la linea difensiva media e la linea offensiva media.
7. `SRV_GPS_SYNC` (Sincronizzazione con Telemetria GPS): Fusione delle coordinate video con i timestamp delle pettorine GPS a 18Hz (`FLOW-4C`) per verificare velocità e potenza metabolica sui corridoi di gioco.
8. `DB_WRITE_TACTICAL` (Archiviazione Silo 2 Criptata): Salvataggio delle serie temporali dei dati posizionali con chiave Cloud KMS del club.
9. `TACTICAL_DOSSIER_GEN` (Generazione Dossier Tattico per Head Coach): Esportazione dashboard interattiva con clip sincronizzate e watermark forense per la riunione tecnica.

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI

| Bivio Decisionale | Condizione Logica | Ramo SÌ / Positivo | Ramo NO / Negativo |
| :--- | :--- | :--- | :--- |
| `HOMOGRAPHY_CONFIDENCE` | Riconoscimento linee campo $> 95\%$? | Omografia 2D automatica | Calibrazione manuale su 4 punti d'angolo |
| `PRESSING_TRIGGER` | Densità difensiva avversaria $> 4$ giocatori in $15\text{ m}$? | Trigger evento "Pressing Alto Rilevato" | Fase di transizione ordinaria |
| `NO_SOCIAL_GUARD` | Richiesta export verso canali pubblici? | Blocco immediato violazione sicurezza | Consegna autorizzata al solo Head Coach |

### I 4 Stati di Interfaccia Utente (UI States):
1. **Empty State:** Nessun video caricato per la partita: interfaccia in attesa con schema del campo vuoto e spia di connessione alle telecamere dello stadio.
2. **Loading State:** Elaborazione della sequenza video con barra di tracking neuronale GPU a 60fps in tempo reale.
3. **Populated State:** Vista tattica immersiva: campo 2D con tessere di Voronoi colorate in tempo reale, traiettoria della palla con scia al neon e baricentro di squadra evidenziato.
4. **Error / Fallback State:**
   - *Nebbia o visibilità ridotta in campo:* Il sistema segnala l'abbassamento di confidenza visiva e commuta automaticamente sui dati dei sensori GPS a 18Hz per mantenere il tracking posizionale.

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Specifiche Endpoint REST:

#### 1. Ingestion Clip Tattica & Calcolo Voronoi
- **Endpoint:** `POST /api/v1/club/tactical/process-clip`
- **Headers:** `Authorization: Bearer <staff_jwt>`, `X-Club-Tenant-ID: club_seriea_01`, `Content-Type: application/json`
- **Request Payload:**
```json
{
  "matchId": "match_20261026_juve_milan",
  "clipTimeRange": { "startSec": 1240, "endSec": 1285 },
  "videoStreamUrl": "rtsp://camera-stadium-lan/tactical_high.stream",
  "calculateVoronoi": true,
  "syncGpsSessionId": "gps_sess_20261026_match"
}
```
- **Responses:**
  - `200 OK`:
```json
{
  "clipAnalysisId": "tact_clip_9921",
  "teamDominancePercent": { "homeTeam": 58.4, "awayTeam": 41.6 },
  "teamCompactnessMeters": 31.2,
  "centroidPosition": { "xMeters": 14.2, "yMeters": -2.1 },
  "pressingTriggerDetected": true,
  "dossierExportUrl": "https://vault.club-seriea-01.t7workout.app/tactical/dossier_9921.pdf"
}
```

### Schema Relazionale (Database Silo 2 - Bunker Enclave):
- `tactical_match_sessions`: `id UUID PK`, `club_id VARCHAR(64)`, `opponent_team VARCHAR(128)`, `match_date DATE`, `video_raw_vault_ref TEXT`, `created_at TIMESTAMPTZ`.
- `pitch_space_control`: `id UUID PK`, `session_id UUID FK -> tactical_match_sessions.id`, `timecode_ms BIGINT`, `voronoi_polygons JSONB`, `home_compactness_m NUMERIC(5,2)`, `away_compactness_m NUMERIC(5,2)`.

---

## 7. Ereditarietà di Tier & Differenziali di Fascia

- **Isolamento Totale:**  
  Il modulo Tactical Vision **è rigorosamente esclusivo di Tier 3 Enterprise** ed è totalmente inesistente nel Tier 1 e Tier 2.
- **Politica Zero Social:**  
  Mentre il Tier 1 e il Tier 2 usano il video per la condivisione social o il coaching commerciale, nel Tier 3 i video di gara e le metriche di Voronoi sono considerati **segreto industriale sportivo**, blindati nel bunker Silo 2 con chiavi Cloud KMS e divieto hardware assoluto di esportazione verso reti esterne.
