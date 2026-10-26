# Capitolato Tecnico: Flow 3C – Squad Microcycle Planning & Match Day Loads (T7 Elite Pro Teams)

## 1. Identificativo & Titolo Ufficiale
- **Codice Univoco:** `FLOW-3C`
- **Titolo Ufficiale:** SOFTWARE 3 (B2B ENTERPRISE) - FLOW 3C: SQUAD MICROCYCLE PLANNING & MATCH DAY LOADS (MD-X TO MD+X)
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 3: High-Level Pro Teams & Enterprise, Colonna 3: Microciclo Squadra & Match Day)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-3-elite-club-enterprise/flow-3c-team-microcycle-mdx.mmd`

---

## 2. Obiettivo di Business & Target Utente
- **Target Utente:** Head Coach, Preparatore Atletico (Head S&C), Match Analyst e Staff Tecnico di squadre professionistiche di vertice (Tier 3 – B2B Enterprise).
- **Problema Risolto:** Nello sport professionistico moderno con impegni ravvicinati (campionato e coppe infrasettimanali), l'allenamento deve essere strutturato in relazione temporale esatta rispetto al giorno della gara (**Match Day - MD**). Inoltre, è fondamentale:
  1. Modulare i carichi giornalieri secondo la periodizzazione tattica (da MD-4 a MD+1);
  2. Gestire atleti con **Doppio Ruolo Tattico** (es. terzino che gioca anche esterno alto, con richieste metaboliche differenti);
  3. Calcolare la **Compensazione Carichi Panchina (Bench Compensation)**: i calciatori non impiegati o con basso minutaggio in partita devono svolgere un lavoro metabolico/neuromuscolare compensativo su MD+1 per evitare il decondizionamento fisico;
  4. Mantenere l'ACWR di squadra e dei singoli atleti nella finestra ottimale di sicurezza ($0.8 - 1.3$), prevenendo gli infortuni muscolari da spike anomalo ($> 1.5$).

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)
1. **Corsia 1: Thin Client UI/UX (Tactical Microcycle Planner - React 18):**
   - Timeline interattiva della settimana basata su Match Day (MD-4 Forza, MD-3 Intensità Tattica, MD-2 Velocità, MD-1 Rifinitura, MD Gara, MD+1 Scarico/Compensazione), modale configurazione doppio ruolo tattico con slider di ponderazione, pannello compensazione riserve, grafico ACWR di squadra e pulsante di convalida piano con co-firma digitale dello staff.
2. **Corsia 2: API Gateway & Signature Verification (Envoy / mTLS Gateway):**
   - Ricezione della pianificazione di microciclo (`/microcycles/plan`), verifica delle credenziali mTLS e controllo bloccante della presenza della doppia firma valida (Preparatore Atletico + Primo Allenatore).
3. **Corsia 3: Server Scatola Nera (Team Load Engine - Cloud Run):**
   - Calcolo matematico dell'ACWR mediante media mobile esponenziale ponderata (EWMA - Exponentially Weighted Moving Average), algoritmo di generazione del lavoro compensativo per i subentrati/panchinari, e bilanciamento metabolico per doppi ruoli.
4. **Corsia 4: Database Silo 2 (Bunker Club KMS Enclave - PostgreSQL Dedicated):**
   - Tabelle `squad_microcycles`, `player_loads`, `tactical_roles` e registro audit trail WORM in Silo 2 crittografato.

---

## 4. Flusso Operativo Passo-Passo (Nodi Numerati)
1. **START (Avvio Pianificazione Microciclo Squadra):** L'Head S&C e l'allenatore aprono il modulo di pianificazione settimanale.
2. **TIMELINE_MD (Impostazione Timeline Match Day):** La settimana viene strutturata attorno alla data del match:
   - **MD-4 (Forza & Tensione Muscolare):** Focus su carichi elevati, forza massimale in palestra pesi e accelerazioni brevi su spazi ridotti;
   - **MD-3 (Intensità Tattica & Resistenza):** Partite a tema su campo ridotto (SSG - Small Sided Games) con elevato accumulo di potenza metabolica;
   - **MD-2 (Velocità & Spazi Ampi):** Esercitazioni tattiche su campo esteso (LSG), sprint lineari oltre i $25.2\text{ km/h}$ e recuperi completi;
   - **MD-1 (Rifinitura & Attivazione Neuromuscolare):** Seduta breve (40-45 minuti), schemi su palla inattiva e stimoli di reattività;
   - **MD (Match Day - Gara):** Prestazione agonistica ufficiale (90 minuti);
   - **MD+1 (Scarico Titolari & Compensazione Riserve):** Protocollo rigenerativo per chi ha giocato $> 60\text{ minuti}$.
3. **ROLE_MODAL (Configurazione Doppio Ruolo Tattico):** Per i calciatori polivalenti (es. Terzino sinistro / Ala offensiva), lo staff imposta la pesatura frazionaria (es. 60% terzino, 40% ala). Il server ricalcola i target di metri percorsi ad alta intensità (HSR) e sprint attesi in funzione delle richieste del ruolo.
4. **BENCH_COMPENSATION (Compensazione Carichi Panchina):** Il sistema identifica automaticamente i giocatori con minutaggio $< 30\text{ minuti}$ nella gara di MD. Su MD+1, mentre i titolari svolgono crioterapia e scarico attivo, l'algoritmo formula per le riserve una seduta intensiva sul campo per pareggiare il volume metabolico della partita (distanza, accelerazioni e sprint equivalenti).
5. **ACWR_CHART & ALERT_SPIKE (Monitoraggio Curva di Carico):** Il grafico renderizza l'ACWR EWMA per ogni calciatore. Se un atleta supera la soglia critica ($> 1.5$), compare l'allarme visivo rosso `ALERT_SPIKE`, che impone una rimodulazione dei volumi nei giorni MD-3 e MD-2.
6. **APPROVE_BTN (Convalida e Doppia Firma Staff):** L'Head Coach e l'Head S&C convalidano il microciclo apponendo le rispettive firme digitali qualificate mTLS.
7. **GW_PLAN_SAVE & GW_CO_SIGN (Controllo Gateway):** L'API Gateway verifica che entrambe le firme siano autentiche e valide. Se una firma manca, il piano rimane in stato di bozza e non viene propagato alla squadra.
8. **SRV_ACWR_CALC & SRV_BENCH_LOAD (Elaborazione Server):** I motori di calcolo consolidano i target di carico individuale per ciascun giocatore della rosa.
9. **DB_SAVE_PLAN (Archiviazione Silo 2):** Scrittura del microciclo nel bunker criptato della società.
10. **END_MICROCYCLE_READY (Fine Flusso):** Il microciclo è approvato e i carichi giornalieri compaiono automaticamente sulle app individuali dei singoli atleti della rosa.

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI
- **Decisione Doppia Firma (`GW_CO_SIGN`):** Entrambe le firme valide $\implies$ Distribuzione piano; Firma mancante $\implies$ Ritorno a bozza.
- **Decisione Spike ACWR (`ALERT_SPIKE`):** $\text{ACWR} > 1.5 \implies$ Alert infortuni e taglio carichi; $0.8 \le \text{ACWR} \le 1.3 \implies$ Carico ottimale.

### Gestione dei 4 Stati UI:
1. **Empty State:** Inizio settimana senza piano impostato; la timeline suggerisce il template standard a 1 gara settimanale o 2 gare settimanali (ciclo domenica-mercoledì-domenica).
2. **Loading State:** Calcolo della matrice EWMA per tutti i 30 atleti della rosa con barra di elaborazione in <500ms.
3. **Populated State:** Vista a scacchiera settimanale della squadra, con codice colore per intensità di carico (Rosso, Arancione, Giallo, Verde, Blu) per ciascun giocatore.
4. **Error / Fallback State:** Mancata ricezione dei dati di minutaggio della gara: prompt per l'inserimento rapido manuale dei minuti giocati da ciascun atleta prima di elaborare MD+1.

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Endpoint Principali:
- `POST /api/v1/club/microcycles/plan`:
  - Input: `{ clubId: string, matchDate: 'YYYY-MM-DD', daysConfig: Array<{ dayCode: 'MD-4'|'MD-3'|'MD-2'|'MD-1'|'MD'|'MD+1', focus: string, plannedVolumePercentage: number }>, dualRoleAthletes: [{ athleteId: string, primaryRoleWeight: 0.6, secondaryRoleWeight: 0.4 }] }`
  - Output: `{ microcycleId: string, squadAverageAcwr: 1.12, highRiskAthletes: [] }`

### Tabelle Database Coinvolte (Silo 2 - Enclave Club):
- `squad_microcycles`: id, club_id, match_day_date, cycle_status ('DRAFT'|'APPROVED'), head_coach_signature, sc_coach_signature, approved_at.
- `player_loads`: id, microcycle_id, athlete_id, day_code, planned_td_meters, planned_hsr_meters, acwr_ewma, compensation_completed.

---

## 7. Ereditarietà di Tier & Differenziali di Fascia
- **Ereditarietà da Tier 2:** Integra la metodologia scientifica di modulazione dei carichi del generatore macrocicli (`flow-3b`).
- **Funzionalità Esclusiva Tier 3 Enterprise:** La pianificazione centrata sui Match Day (MD-X), la compensazione metabolica delle riserve post-gara, il bilanciamento per doppio ruolo tattico e la doppia firma congiunta mTLS **sono logiche esclusive del Tier 3**, inapplicabili a utenti singoli o clienti di palestre private.
