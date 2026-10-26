# Capitolato Tecnico: Flow 4C – GPS Telemetry & Adaptive Z-Score Fatigue Profiling (T7 Elite Pro Teams)

## 1. Identificativo & Titolo Ufficiale
- **Codice Univoco:** `FLOW-4C`
- **Titolo Ufficiale:** SOFTWARE 3 (B2B ENTERPRISE) - FLOW 4C: GPS TELEMETRY & ADAPTIVE Z-SCORE FATIGUE PROFILING
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 3: High-Level Pro Teams & Enterprise, Colonna 4: Telemetria GPS & Z-Score)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-3-elite-club-enterprise/flow-4c-gps-adaptive-zscore.mmd`

---

## 2. Obiettivo di Business & Target Utente
- **Target Utente:** Sport Scientist, Preparatori Atletici e Performance Analyst di club professionistici (Tier 3 – B2B Enterprise).
- **Problema Risolto:** L'analisi del carico esterno (GPS da campo ad alta frequenza, 10-18 Hz) e interno (HRV e frequenza cardiaca) produce milioni di datapoint che spesso confondono lo staff invece di chiarire le decisioni. Inoltre, confrontare valori assoluti tra atleti diversi genera errori metodologici gravi: un centrocampista che percorre $11\text{ km}$ può essere fresco, mentre un difensore centrale che ne percorre $9\text{ km}$ può essere esausto. T7 risolve questo problema tramite:
  1. Ingestion massiva ad alta frequenza dei tracciati GPS con filtro della precisione satellitare (DOP $< 2$);
  2. Calcolo della potenza metabolica media ($\text{W/kg}$), distanze di sprint ad alta intensità ($\text{HSR} > 19.8\text{ km/h}$) ed eventi impulsivi di accelerazione/decelerazione ($\ge 3\text{ m/s}^2$);
  3. Normalizzazione statistica individuale su finestra mobile rolling di 28 giorni tramite **Z-Score Adattivo**:
     $$Z = \frac{X - \mu_{28\text{gg}}}{\sigma_{28\text{gg}}}$$
  4. Fusione dello Z-Score esterno con l'indice cardiaco interno (HRV rMSSD mattutino);
  5. Algoritmo di fallback cold-start per nuovi acquisti privi di baseline storica ($< 6\text{ mesi}$).

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)
1. **Corsia 1: Thin Client UI/UX (Telemetry Dashboard - React 18):**
   - Pannello telemetria live da campo o post-allenamento, mappa di calore 2D (heatmap) renderizzata su canvas del terreno di gioco con traiettorie dei calciatori, grafico radar Z-Score multi-parametrico e banner di alert fatica per valori anomali ($Z > +2.0\sigma$).
2. **Corsia 2: API Gateway & High-Throughput Ingestion (Envoy / Kafka Ingestion):**
   - Ricezione batch ad altissima densità di dati (`/telemetry/gps-batch`), decompressione stream binario (10Hz / 18Hz da antenne Catapult / Statsports / Wimu) e validazione di integrità dei pacchetti.
3. **Corsia 3: Server Scatola Nera (Z-Score & Physiological Engine - Cloud Run GPU):**
   - Parser dei tracciati con scarto dei frame con scarsa triangolazione satellitare (Dilution of Precision DOP $\ge 2$), calcolo della potenza metabolica di Osgnach, computazione dello Z-Score rolling 28gg e fusione pesata con i parametri cardiovascolari.
4. **Corsia 4: Database Silo 2 (Bunker Club KMS Enclave - TimescaleDB / PostgreSQL):**
   - Tabelle ad altissime prestazioni per serie temporali georeferenziate `gps_sessions` e archivio indici di fatica `fatigue_zscores`.

---

## 4. Flusso Operativo Passo-Passo (Nodi Numerati)
1. **START (Ricezione Sessione GPS Campo):** Al termine dell'allenamento o della partita, i dispositivi GPS indossati dai calciatori scaricano i dati nella stazione di ricarica/antenna del club.
2. **LIVE_GPS_PANEL (Visualizzazione Pannello Telemetria):** L'analista apre la dashboard: visualizzazione metrica grezza (Distanza Totale TD in metri, metri percorsi in High Speed Running HSR $> 19.8\text{ km/h}$, distanza in Sprint $> 25.2\text{ km/h}$, numero di accelerazioni e decelerazioni ad alta intensità $> 3\text{ m/s}^2$).
3. **GW_GPS_BATCH & VALIDATE (Ingestion Gateway):** I pacchetti binari viaggiano verso l'API Gateway. Il sistema convalida il formato (10Hz/18Hz) e la completezza dei frame per ciascuna pettorina/dispositivo.
4. **SRV_PARSER (Filtro Precisione Satellitare DOP):** Il server Scatola Nera scansiona le coordinate GPS: i segmenti con perdita di triangolazione satellitare o riflessioni da stadio coperto ($\text{DOP} \ge 2$) vengono ripuliti tramite filtro di Kalman per evitare picchi di velocità fittizi.
5. **SRV_METABOLIC (Calcolo Potenza Metabolica):** Calcolo della spesa energetica istantanea e della potenza metabolica media ($\text{W/kg}$), tenendo conto che accelerare a bassa velocità richiede una potenza metabolica equivalente a uno sprint lanciato.
6. **SRV_ZSCORE_CALC (Algoritmo Z-Score Adattivo):**
   - Per ogni singolo atleta, il server estrae la media ($\mu_{28}$) e la deviazione standard ($\sigma_{28}$) registrate negli ultimi 28 giorni di lavoro per ciascun parametro (HSR, Accelerazioni, Potenza Metabolica).
   - Calcola il punteggio $Z$.
   - *Algoritmo Cold-Start Nuovi Acquisti:* Se il calciatore è stato acquistato da meno di 6 mesi e non possiede una baseline rolling consolidata, il server applica la **mediana ponderata del ruolo tattico** del club con un fattore di penalità cautelativo (+10% di stima della fatica) fino al raggiungimento di 20 sessioni complete.
7. **SRV_HRV_MERGE (Fusione con Carico Interno HRV):** Incrocio dello Z-Score cinematico con la variazione percentuale dell'HRV rMSSD mattutino. Se un calciatore ha corso uno Z-Score elevato ($+2.2\sigma$) e presenta un crollo contemporaneo dell'HRV ($-25\%$), l'indice di allarme sale a livello massimo.
8. **DB_WRITE_GPS & DB_WRITE_ZSCORE (Archiviazione Silo 2):** Scrittura delle tracce e dei punteggi normalizzati nel database criptato del club.
9. **HEATMAP_CANVAS & ZSCORE_RADAR (Visualizzazione Grafica nel Client):**
   - Rendering su canvas 2D del campo con la mappa di calore delle zone di campo presidiate dal calciatore;
   - Grafico Radar multi-assiale che sintetizza: Volume, Intensità, Potenza Metabolica, Decelerazioni e Recupero Cardiaco.
10. **FATIGUE_ALERT (Alert Sovraccarico Critico):** Se lo Z-Score composito supera $+2.0\sigma$ o $+2.5\sigma$, compare l'alert visivo rosso lampeggiante nel pannello dello staff, con raccomandazione di scarico preventivo sul microciclo (`flow-3c`).
11. **END_TELEMETRY_DONE (Fine Flusso):** Analisi telemetrica validata e profili atleti aggiornati in tempo reale.

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI
- **Decisione Integrità Frame (`GW_VALIDATE_PAYLOAD`):** Dati corretti $\implies$ Elaborazione; Frame incompleti $\implies$ Tentativo di interpolazione e log di allerta.
- **Decisione Baseline Atleta (`SRV_ZSCORE_CALC`):** Storico $> 28\text{ gg} \implies$ Z-Score individuale; Nuovo acquisto $\implies$ Fallback su mediana di ruolo.
- **Decisione Alert Fatica (`FATIGUE_ALERT`):** $Z > +2.0\sigma \implies$ Allarme rosso e notifica allo staff medico; $Z \le +2.0\sigma \implies$ Profilo verde/fisiologico.

### Gestione dei 4 Stati UI:
1. **Empty State:** Nessun file GPS scaricato dopo la seduta; indicatore dello stato di connessione delle antenne del campo in attesa del primo batch.
2. **Loading State:** Elaborazione parallela multi-thread su Cloud Run GPU per il parsing di 30 tracciati da 90 minuti ciascuno (circa 3 milioni di coordinate analizzate in $< 3\text{ secondi}$).
3. **Populated State:** Dashboard con radar Z-Score per tutti i titolari, heatmap sovrapposta al campo verde e tabella ordinabile per metri percorsi al minuto ($m/\text{min}$).
4. **Error / Fallback State:** Mancanza del dato HRV mattutino per dimenticanza dell'atleta; il radar segnala l'assenza del parametro interno e calcola lo Z-Score parziale sul solo carico esterno con avviso allo staff.

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Endpoint Principali:
- `POST /api/v1/club/telemetry/gps-batch`:
  - Input: `{ clubId: string, sessionId: string, samplingRateHz: 10, rawBinaryStreamUrl: string }`
  - Output: `{ processedAthletesCount: 26, outliersFilteredPercent: 1.2, status: 'success' }`
- `GET /api/v1/club/telemetry/z-scores?sessionId=sess_982`:
  - Output: `[{ athleteId: 'p_07', role: 'WINGER', metrics: { totalDistanceM: 10450, hsrDistanceM: 890, sprintDistanceM: 320, metabolicPowerAvgWkg: 10.8 }, zScores: { hsrZ: 2.3, sprintZ: 1.8, compositeFatigueZ: 2.4 }, alertLevel: 'HIGH_RISK' }]`

### Tabelle Database Coinvolte (Silo 2 - Enclave Club):
- `gps_sessions`: id, club_id, session_date, session_type ('TRAINING'|'MATCH'), weather_conditions, pitch_surface.
- `athlete_gps_metrics`: id, session_id, athlete_id, total_distance_m, hsr_m, sprint_m, accel_count, decel_count, avg_metabolic_power.
- `fatigue_zscores`: athlete_id, session_id, calculated_z, rolling_mean_28, rolling_std_28, cold_start_applied, alert_triggered.

---

## 7. Ereditarietà di Tier & Differenziali di Fascia
- **Ereditarietà da Tier 1 e Tier 2:** Espande l'aggregazione biometrica consumer (`flow-4a`) e la precisione metrologica VBT del professionista (`flow-4b`).
- **Esclusività Enterprise Tier 3:**
  - Il calcolo dello **Z-Score Adattivo rolling 28gg** normalizzato su base individuale;
  - L'algoritmo di **Fallback Cold-Start su Mediana Ponderata di Ruolo** per i nuovi acquisti;
  - L'analisi della **Potenza Metabolica di Osgnach** e la mappatura bidimensionale (Heatmap) da antenne GPS ad altissima frequenza ($10\text{-}18\text{ Hz}$).
- **Segregazione:** Dati conservati esclusivamente nel bunker Silo 2 crittografato con chiavi Cloud KMS.
