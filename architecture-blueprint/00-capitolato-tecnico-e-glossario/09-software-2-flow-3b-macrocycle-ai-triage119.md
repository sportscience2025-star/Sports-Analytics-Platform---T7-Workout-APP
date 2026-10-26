# Capitolato Tecnico: Flow 3B – AI Macrocycle Generator with 119 Clinical Triage (T7 Pro Coach)

## 1. Identificativo & Titolo Ufficiale
- **Codice Univoco:** `FLOW-3B`
- **Titolo Ufficiale:** SOFTWARE 2 (B2B PRO P.IVA) - FLOW 3B: AI MACROCYCLE GENERATOR WITH 119 CLINICAL TRIAGE
- **Board Miro Online:** `uXjVEbo6L2o=` (Zona 4, Riga 2: Partita IVA / Coaches & Fisioterapisti, Colonna 3: Programmazione & Macrocicli)
- **Diagramma Sorgente:** `architecture-blueprint/02-miro-zones-and-swimlanes/18-flowcharts/software-2-pro-b2b/flow-3b-macrocycle-ai-triage119.mmd`

---

## 2. Obiettivo di Business & Target Utente
- **Target Utente:** Preparatori atletici, coach di forza e condizionamento e personal trainer con atleti agonisti o clienti con quadri clinici complessi (Tier 2 – B2B Freelance).
- **Problema Risolto:** Costruire una programmazione di 12-16 settimane richiede ore di calcoli matematici per modulare volumi, carichi ondulati (DUP) e settimane di scarico (-40/50%), con il rischio critico di prescrivere esercizi dannosi per articolazioni o rachide compromessi. T7 automatizza la generazione di macrocicli strutturati incrociandoli con il motore medico `ImpactCalculator` su 119 patologie codificate (discopatie, lesioni tendinee, instabilità di spalla), fornendo un'esportazione in Excel (.xlsx) completamente sbloccata per consentire al coach di annotare note sul campo senza barriere software.

---

## 3. Attori & Architettura a 4 Corsie (Swimlanes)
1. **Corsia 1: Thin Client UI/UX (Programming Wizard - React 18):**
   - Wizard a 4 step guidati: 1. Selezione atleta dal roster; 2. Matrice patologica 119 condizioni; 3. Modello di periodizzazione; 4. Durata e frequenza settimanale. Visualizzazione grafica delle settimane, badge di rischio e pulsante per export Excel sbloccato.
2. **Corsia 2: API Gateway & Pipeline Audit (Envoy / Kong):**
   - Verifica autorizzazione JWT Tier 2, rate limiting su calcoli ad alta intensità computazionale e smistamento verso i container server dedicati.
3. **Corsia 3: Server Scatola Nera (119 Triage & Openpyxl Engine - Cloud Run):**
   - Esecuzione dell'algoritmo `ImpactCalculator` (generazione automatica di blacklist e limitazioni ROM per l'atleta), calcolo matematico della progressione carichi (DUP, Coniugata, Blocchi, Lineare) e compilazione del file Excel nativo formattato tramite libreria Openpyxl.
4. **Corsia 4: Database Silo 1 (Pro Programming Repository - PostgreSQL):**
   - Lettura del catalogo 296 esercizi e delle matrici patologiche; scrittura del piano approvato in `macrocycles` e `mesocycles`.

---

## 4. Flusso Operativo Passo-Passo (Nodi Numerati)
1. **START (Avvio Wizard Programmazione):** Il coach apre la sezione "Crea Nuovo Piano" dal proprio hub.
2. **STEP1_ATHLETE (Selezione Atleta):** Il coach sceglie l'atleta dal proprio roster. Il sistema estrae automaticamente i suoi dati biometrici, l'esperienza di allenamento e i massimali storici 1RM.
3. **STEP2_PATHOLOGY (Checklist Clinica 119 Patologie):** Presentazione della matrice interattiva suddivisa nei 5 distretti anatomici (Colonna, Arti Superiori, Arti Inferiori, Patologie Sistemiche, Condizioni Neurologiche Speciali). Il coach seleziona le condizioni attive (es. "Ernia discale L5-S1" o "Conflitto sub-acromiale spalla destra").
4. **STEP3_MODEL (Selezione Modello di Periodizzazione):** Scelta dell'approccio metodologico:
   - *DUP (Daily Undulating Periodization):* Ondulazione continua di ipertrofia, forza e potenza all'interno della stessa settimana.
   - *Periodizzazione a Blocchi (Verkhoshansky / Issurin):* Fasi concentrate di Accumulazione, Trasformazione e Realizzazione.
   - *Metodo Coniugato (Westside Barbell):* Alternanza di Max Effort (ME) e Dynamic Effort (DE).
   - *Periodizzazione Lineare Tradizionale.*
5. **STEP4_DURATION (Durata & Frequenza):** Impostazione della durata del ciclo (da 8 a 16 settimane) e della frequenza (da 3 a 5 giorni/settimana), con posizionamento delle settimane di scarico (riduzione volume del 40-50% a intensità invariata).
6. **BTN_GENERATE (Pulsante CTA Genera Piano):** Il coach preme il pulsante di calcolo. La richiesta viene inviata all'endpoint `GW_GEN_REQ`.
7. **GW_AUTH_CHECK (Verifica Gateway):** Convalida del token JWT Tier 2.
8. **SRV_TRIAGE_AUDIT (Audit Motore 119 Patologie):** Il server Scatola Nera scansiona l'intero catalogo esercizi incrociandolo con le patologie selezionate:
   - Applica cutoff esponenziali sui carichi assiali e articolari.
   - Assegna a ciascun esercizio lo status: `EXCLUDED` (vietato), `ADAPTED` (concessa variazione con ROM protetto) o `AVAILABLE` (sicuro).
   - Genera l'alert visivo `ALERT_CONTRA` ("3 esercizi esclusi per conflitto patologia rachide: Squat con bilanciere sostituito con Belt Squat").
9. **SRV_DUP_CALC & SRV_SESSION_BUILDER (Generatore di Sessioni):** Il server calcola le serie, ripetizioni, percentuali $\%1\text{RM}$ e target RPE per ogni singola seduta, strutturando la sessione in Warmup dinamico, Esercizi primari, Accessori e Decompressione.
10. **DB_SAVE_MACRO (Persistenza Piano):** Il macrociclo finito viene salvato in Silo 1.
11. **RESULT_VIEW (Visualizzazione Risultato):** Il client renderizza la vista interattiva: calendario settimanale, grafici a barre dei volumi per gruppo muscolare e schede dettagliate per ogni giorno.
12. **BTN_EXPORT_XLSX & SRV_OPENPYXL (Esportazione Excel Sbloccato):**
    - Toccando "Esporta Excel", il server compila tramite Openpyxl un file `.xlsx` professionale multi-tab con fogli dedicati (Riepilogo, Settimana per Settimana, Registro Pesi sul Campo).
    - **Requisito Inderogabile:** Il file Excel è totalmente privo di password (`protected: false`), permettendo al coach di modificarlo liberamente su tablet o stamparlo.
13. **END_EXPORTED (Fine Flusso):** Piano attivo, assegnato al cliente ed esportato con successo.

---

## 5. Rami Decisionali & Gestione dei 4 Stati UI
- **Decisione Patologie (`SRV_TRIAGE_AUDIT`):** Conflitto rilevato $\implies$ Esclusione automatica + Proposta alternativa; Nessun conflitto $\implies$ Catalogo standard.
- **Decisione Modello Periodizzazione:** DUP vs Blocchi vs Coniugata vs Lineare.
- **Decisione Destinazione:** Consultazione in-app vs Export Excel (.xlsx) sbloccato.

### Gestione dei 4 Stati UI:
1. **Empty State:** Nessun macrociclo creato per l'atleta selezionato; prompt che illustra i vantaggi della pianificazione a lungo termine con pulsante "Avvia Wizard".
2. **Loading State:** Animazione con avanzamento a step ("Analisi 119 patologie...", "Calcolo curve di carico DUP...", "Costruzione sedute...").
3. **Populated State:** Dashboard del macrociclo con griglia a 16 settimane navigabile, colori distinti per fasi di carico e scarico e indicatori di tonnellaggio previsto.
4. **Error / Fallback State:** Conflitto clinico totale (es. patologia multipla grave che esclude l'intero distretto gambe); il sistema mostra un warning rosso raccomandando un protocollo di riabilitazione fisioterapica prima della forza.

---

## 6. Contratti Dati, Parametri I/O & Database Silo

### Endpoint Principali:
- `POST /api/v1/pro/programming/generate`:
  - Input: `{ athleteId: string, pathologyIds: string[], model: 'DUP'|'BLOCKS'|'CONJUGATE', durationWeeks: 12, frequencyDays: 4, targetGoals: ['strength', 'hypertrophy'] }`
  - Output: `{ macrocycleId: string, weeks: Array<Object>, excludedExercisesCount: 3, substitutedList: [{ original: 'Back Squat', replacement: 'Belt Squat', reason: 'Spinal Compression' }] }`
- `POST /api/v1/pro/programming/export-xlsx`:
  - Input: `{ macrocycleId: string }`
  - Output: Binary stream `.xlsx` MIME type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.

### Tabelle Database Coinvolte (Silo 1):
- `macrocycles`: id, pro_id, athlete_id, model_type, total_weeks, start_date, status ('ACTIVE'|'ARCHIVED').
- `mesocycles`: id, macrocycle_id, phase_name, week_start, week_end, volume_target_kg.
- `planned_workouts`: id, mesocycle_id, week_number, day_number, session_structure (JSONB).

---

## 7. Ereditarietà di Tier & Differenziali di Fascia
- **Differenziali rispetto a Tier 1:** Il General User compila solo un diario a posteriori o seleziona schede preconfezionate; il Tier 2 ha a disposizione il motore matematico industriale di periodizzazione e il triage clinico delle 119 patologie.
- **Propagazione verso Tier 3:** Nel Tier 3 (Elite Club - `flow-3c`), questo motore costituisce la base algoritmica, arricchita dalla gestione del microciclo di squadra sincronizzato con il calendario gare (MD-X / MD+X), dalla gestione differenziata titolari/riserve e dal bilanciamento per atleti con doppio ruolo tattico.
