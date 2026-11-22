# BENCHMARK INDUSTRIALE: METROLOGIA, ERGONOMIA VISIVA E BOUNDS CHECKING FISIOLOGICO
## T7 Workout Sports Analytics Platform — TASK-002 Architectural Research Dossier

---

### METADATI DEL DOCUMENTO
- **Autore:** Scout Agent (Task-002 Research Pipeline)
- **Data:** 22 Novembre 2026
- **Target File:** `architecture-blueprint/04-ui-ux-apple-research/metrology_ui_ux_benchmark.md`
- **Contesto Operativo:** Layer 0 Architectural Foundation (TASK-002: Metrological Validator & SI Guard)
- **Riferimenti Normativi:** ISO 80000-1:2022 (Quantities and Units), BIPM SI Brochure 9th Edition, ADR-03 (Rigore Metrologico T7 Workout), IEEE 754-2019 (Floating-Point Arithmetic)
- **Sistemi di Riferimento Analizzati:** Apple Health / Fitness HIG, Garmin Connect / Firstbeat Analytics, Whoop 4.0 Ecosystem, Vald Performance (ForceDecks, ForceFrame, SmartSpeed), GymAware RS / Kinetic Performance, Vitruve VBT Ecosystem.

---

## 1. VISIONE GENERALE E OBIETTIVI METROLOGICI

La piattaforma **T7 Workout** e progettata per operare in contesti ad alto rendimento agonistico (Tier 2 Pro Coach, Tier 3 Elite Club Bunker) e clinico-riabilitativo (Return-to-Play, screening muscolo-scheletrico). In questi ambiti, un errore di calcolo numerico, la visualizzazione di valori spuri (`NaN`, `Infinity`, `undefined`) o la mancata distinzione tra grandezze fisiche affini (es. confondere massa in kg con forza peso in N) compromette l'attendibilita scientifica, puo indurre a prescrizioni di carico errate con rischio infortunistico e viola la direttiva architetturale **ADR-03**.

Il presente dossier analizza i migliori standard industriali di interfaccia utente, ergonomia dei dati numerici, signal processing e architettura software TypeScript per definire i criteri implementativi di `src/utils/metrology-guard.ts` e dei formattatori grafici del Dark Cockpit.

---

## 2. ERGONOMIA DEL DATO NUMERICO E FORMATTAZIONE DELLE GRANDEZZE FISICHE (SISTEMA INTERNAZIONALE)

### 2.1 Tabella di Comparazione Multi-Piattaforma

La seguente tabella sintetizza come i principali ecosistemi hardware e software professionali gestiscono la formattazione, la densita decimale, la separazione visiva delle unita e la renderizzazione delle grandezze fisiche:

| Piattaforma | Grandezze Chiave Gestite | Risoluzione Decimale | Separazione Valore/Unita | Tipografia Numerica | Strategia Streaming Live |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Apple Health / Fitness** | Frequenza cardiaca, Potenza ciclistica, Cadenza, Velocita, Calorie | HR: 0 dec. (bpm)<br>Potenza: 0 dec. (W)<br>Velocita: 1 dec. (km/h o m/s)<br>Distanza: 2 dec. (km/m) | Spazio sottile rigido (`\u202F`), etichetta unita resa come caption secondaria (`#86868b`) | SF Pro Text / SF Compact con `tabular-nums` obbligatorio | Smorzamento esponenziale (EMA $\alpha = 0.25$) per stabilizzare la lettura visiva |
| **Garmin Connect / Firstbeat** | HRV (rMSSD), Potenza (Running/Cycling), VO2max, Passo, Cadenza | rMSSD: 0 dec. (ms)<br>Potenza: 0 dec. (W)<br>Passo: mm:ss/km<br>Cadenza: 0 dec. (spm) | Unita in linea adiacente con font-size scalato all'80% del valore, contrasto medio | Roboto / Garmin Custom Condensed, spaziatura tabulare | Finestra mobile a 3 secondi per evitare fluttuazioni caotiche a display |
| **Whoop 4.0** | Strain (0-21), Recovery (0-100%), HRV, Frequenza respiratoria, Sonno | Strain: 1 dec.<br>Recovery: 0 dec. (%)<br>HRV: 0 dec. (ms)<br>Respirazione: 1 dec. (rpm) | Valore hero in alto (font 48px), pill orizzontale sottostante con etichetta e unita | Custom Bold Display con cifre fisse mono-space su base Dark `#121212` | Aggiornamento a blocchi discreti (batch sleep/recovery processing) |
| **Vald Performance (ForceDecks)** | Forza picco ($F_z$), Forza asimmetria, Impulso concentrico ($J$), RFD | Forza: 0 dec. ($N$)<br>Asimmetria: 1 dec. (%)<br>Impulso: 1 dec. ($N\cdot s$)<br>RFD: 0 dec. ($N/s$) | Notazione ISO: numero grande, unita esplicita in grassetto attenuato (es. `2840 N`) | DIN Pro / Segoe UI Tabular, griglie dense a 4 o 6 metriche simultanee | Acquisizione a 1000 Hz, downstream decimato a 60 Hz per l'interfaccia grafica |
| **GymAware RS** | Velocita media propulsiva (MPV), Velocita picco, Potenza picco, Lavoro | Velocita: 2 dec. (m/s)<br>Potenza: 0 dec. (W)<br>Lavoro: 0 dec. (J)<br>Spostamento: 1 dec. (cm) | Box ad altissimo contrasto (giallo/nero o bianco/nero), unita in basso a destra | Helvetica Neue Heavy Tabular per visibilita a 5-10 metri di distanza | Trigger su soglia di spostamento ($> 15\text{ cm}$) e display istantaneo a fine rep |
| **Vitruve (Speed4Lifts)** | Mean Propulsive Velocity (MPV), ROM, Perdita velocita (Velocity Loss) | MPV: 2 dec. (m/s)<br>Perdita: 1 dec. (%)<br>ROM: 0 dec. (mm/cm)<br>Potenza: 0 dec. (W) | Valore centrale prominente, badge colorato di zona VBT (ipertrofia/forza/potenza) | San Francisco Rounded Tabular, Dark UI con accenti neon cromatici | Elaborazione continua con filtro Butterworth passa-basso a 10 Hz |

---

### 2.2 Standard di Notazione Metrologica per T7 Workout (ADR-03)

In aderenza alle raccomandazioni BIPM e ISO 80000-1, T7 Workout applica standard univoci di formattazione per ciascuna dimensione fisica:

#### A. Forza ($F$ in Newton — $\text{N}$)
- **Simbolo SI:** $\text{N}$ (maiuscolo, mai "kg", "kgf" o "kp").
- **Precisione Decimale:** 
  - Per $F \ge 100\text{ N}$: 0 decimali (es. `2450 N`, `12480 N`).
  - Per $F < 100\text{ N}$ (es. test di forza di presa o dinamometria isometrica digitale fine): 1 decimale (es. `45.8 N`).
- **Separatore delle Migliaia:** Spazio sottile non interrompibile (`\u202F` o `&thinsp;`), mai punto o virgola (evita conflitti tra convenzione anglosassone `1,000` e continentale `1.000`).

#### B. Potenza ($P$ in Watt — $\text{W}$)
- **Simbolo SI:** $\text{W}$ (maiuscolo, mai "W/h" o "J").
- **Precisione Decimale:** 
  - Potenza assoluta: 0 decimali (es. `1150 W`, `4200 W`).
  - Potenza specifica normalizzata per peso corporeo ($P_{\text{rel}}$): 1 decimale (es. `14.8 W/kg`).
- **Separatore delle Migliaia:** Spazio sottile (`\u202F`).

#### C. Velocita ($v$ in metri al secondo — $\text{m/s}$)
- **Simbolo SI:** $\text{m/s}$ (minuscolo, slash standard; mai "mps" o "m/sec").
- **Precisione Decimale:** Tassativamente 2 decimali (es. `0.82 m/s`, `1.30 m/s`). Nelle scienze del VBT (González-Badillo et al., 2017), una variazione di `0.05 m/s` corrisponde a un salto del 5% di 1RM; arrotondare a 1 decimale distruggerebbe la sensibilita diagnostica.

#### D. Carico e Massa ($m, L$ in chilogrammi — $\text{kg}$)
- **Simbolo SI:** $\text{kg}$ (entrambi minuscoli, mai "KG", "Kg" o "kgs").
- **Precisione Decimale:** Tassativamente 1 decimale (es. `102.5 kg`, `70.0 kg`). Giustificazione: le micropiastre standard da gara pesano 0.5 kg, 1.25 kg e 2.5 kg. Omettere il decimale troncherebbe o falserebbe il carico effettivo di lavoro.

#### E. Angoli Articolari ($\theta$ in gradi sessagesimali — $^{\circ}$)
- **Simbolo:** Simbolo di grado `$^{\circ}$` adiacente al numero senza spazio intermedio (es. `85°`, `135°`).
- **Precisione Decimale:** 
  - Goniometria statica o range di movimento passivo (ROM): 0 decimali (es. `120°`).
  - Tracciamento video computazionale 2D/3D (MediaPipe / Pose estimation): 1 decimale con filtro passa-basso per assorbire il tremolio dei landmark (es. `87.4°`).

#### F. Tempi ($t$ in secondi — $\text{s}$ e millisecondi — $\text{ms}$)
- **Simboli SI:** $\text{s}$ (secondi) e $\text{ms}$ (millisecondi). Mai "sec", "msec", "min." non standard.
- **Precisione Decimale:**
  - Sprint e tempi parziali fotocellule ($t < 60\text{ s}$): 2 decimali (es. `4.28 s`).
  - Tempi di contatto a terra (CT) e tempi di volo (FT) nel salto verticale: 0 decimali in millisecondi (es. `212 ms`, `540 ms`).
  - Tempo di reazione psicomotoria (PVT test): 0 decimali in millisecondi (es. `245 ms`).

#### G. Frequenza Cardiaca e Variabilita ($HR$ in $\text{bpm}$, $\text{HRV}$ in $\text{ms}$)
- **Frequenza Cardiaca:** 0 decimali con unita `bpm` (es. `162 bpm`).
- **HRV rMSSD:** Root Mean Square of Successive Differences espressa rigorosamente in millisecondi interi senza decimali (es. `64 ms`), in accordo con le linee guida Task Force of the European Society of Cardiology and the North American Society of Pacing and Electrophysiology (1996).

---

### 2.3 Regole Tipografiche e CSS di Ingegneria Visiva

1. **Allineamento Tabulare Obbligatorio:**  
   Ogni elemento numerico visualizzato in tabelle, card di monitoraggio live, drawer biometrici o stream da sensori deve includere la proprieta CSS:
   ```css
   font-variant-numeric: tabular-nums;
   font-feature-settings: "tnum" 1, "zero" 1;
   ```
   Questo impedisce il cosiddetto *layout jitter* (spostamento oscillatorio dell'interfaccia a ogni cambio di cifra decimale quando lo zero o l'uno hanno larghezze diverse rispetto all'otto).

2. **Separazione Semantica DOM (Valore vs Unita):**  
   Non concatenare mai numero e unita in un'unica stringa grezza all'interno dello stesso nodo di testo (es. no `<div>120.5 kg</div>`). Il valore deve essere isolabile per motivi di accessibilita (screen reader), internazionalizzazione e styling differenziato:
   ```html
   <span class="t7-metric" role="group" aria-label="Velocita media: 0.82 metri al secondo">
     <span class="t7-metric__value">0.82</span>
     <span class="t7-metric__unit" aria-hidden="true">m/s</span>
   </span>
   ```

3. **Gerarchia Dimensionale:**  
   Il glifo dell'unita di misura deve possedere una dimensione compresa tra il **40% e il 55%** dell'altezza del valore principale, con allineamento baseline o sub-baseline e opacita compresa tra il 60% e il 75% (`color: var(--text-secondary); opacity: 0.75;`).

---

## 3. SANITIZZAZIONE AUTOMATICA, TOLLERANZE E BOUNDS CHECKING FISIOLOGICO

### 3.1 Mappatura dei Limiti Fisiologici e Biomeccanici Umani

Nello sviluppo software sportivo, i numeri non sono semplici scalari matematici: rappresentano fenomeni fisici legati alla fisiologia umana. L'inclusione di costanti non documentate ("numeri magici") e vietata dalla Regola 02. Ogni limite implementato nei validatori possiede un fondamento biomeccanico preciso:

```
+----------------------------------------------------------------------------------------------------+
|                                    BOUNDS FISIOLOGICI NOMINALI                                     |
+----------------------+--------------------+--------------------+-----------------------------------+
| Grandezza            | Minimo Valido      | Massimo Valido     | Razionale Scientifico / Fonte     |
+----------------------+--------------------+--------------------+-----------------------------------+
| Carico / Massa ($L$) | 0.0 kg             | 1000.0 kg          | Limite superiore parametrato sul  |
|                      |                    |                    | record mondiale assoluto di sol-  |
|                      |                    |                    | levamento (stacco 501 kg / leg    |
|                      |                    |                    | press eccentrica 800+ kg). Valori |
|                      |                    |                    | negativi non fisici.              |
+----------------------+--------------------+--------------------+-----------------------------------+
| Velocita ($v$)       | 0.00 m/s           | 12.50 m/s          | Da velocita propulsiva minima al  |
|                      |                    |                    | punto MVT (0.15 m/s) fino al      |
|                      |                    |                    | picco assoluto umano di sprint    |
|                      |                    |                    | (Usain Bolt, 12.42 m/s a 67.9m).  |
|                      |                    |                    | VBT con bilanciere: max 4.00 m/s. |
+----------------------+--------------------+--------------------+-----------------------------------+
| Forza ($F$)          | 0.0 N              | 15000.0 N          | Picco registrato su pedane di     |
|                      |                    |                    | forza piezoelettriche per atleti  |
|                      |                    |                    | elite in Drop Jump da 60 cm o     |
|                      |                    |                    | Isometric Mid-Thigh Pull (IMTP).  |
+----------------------+--------------------+--------------------+-----------------------------------+
| Potenza ($P$)        | 0.0 W              | 10000.0 W          | Picco anaerobico alattacido su    |
|                      |                    |                    | cicloergometro o pedana per pista |
|                      |                    |                    | ciclisti sprint / pesisti elite   |
|                      |                    |                    | (normale 3000-7500 W).            |
+----------------------+--------------------+--------------------+-----------------------------------+
| Angolo Ginocchio     | 0.0°               | 165.0°             | Escursione fisiologica articolare |
| (Flesso-estensione)  |                    |                    | umana (da iperestensione limite   |
|                      |                    |                    | 0° a flessione massima attiva).   |
+----------------------+--------------------+--------------------+-----------------------------------+
| Tempo PVT            | 100 ms             | 2000 ms            | < 100 ms: anticipazione involon-  |
|                      |                    |                    | taria non fisiologica; > 2000 ms: |
|                      |                    |                    | microsleep o lapse attentivo.     |
+----------------------+--------------------+--------------------+-----------------------------------+
| Frequenza Cardiaca   | 30 bpm             | 240 bpm            | Bradicardia estrema atleti endu-  |
|                      |                    |                    | rance (30-35 bpm) fino al picco   |
|                      |                    |                    | massimale teorico giovanile.      |
+----------------------+--------------------+--------------------+-----------------------------------+
| HRV rMSSD            | 5 ms               | 300 ms             | Rango clinico ammissibile per la  |
|                      |                    |                    | variabilita neuro-vegetativa.     |
+----------------------+--------------------+--------------------+-----------------------------------+
```

---

### 3.2 Gestione Inviolabile di Anomalie Numeriche (IEEE 754)

In JavaScript/TypeScript, le operazioni matematiche tra numeri a virgola mobile possono generare valori sentinella che mandano in crash il motore di rendering o corrompono il database. Il modulo `metrology-guard.ts` deve applicare una sanitizzazione a 4 livelli:

```
[Flusso Dati Grezzo (Sensore / Input Utente)]
                    |
                    v
    +-------------------------------+
    | 1. Finitezza & Nullability    | ---> Se null/undef/NaN/Infinity: Return Result.failure()
    |    (Number.isFinite check)    |
    +-------------------------------+
                    | (Valore finito valido)
                    v
    +-------------------------------+
    | 2. Zero-Division Guard        | ---> Protezione denominatore (epsilon = 1e-7)
    |    (Time > 0, Massa > 0)      |
    +-------------------------------+
                    | (Rapporto matematico sicuro)
                    v
    +-------------------------------+
    | 3. Bounds Checking Fisiologico| ---> Se oltre soglia max: Flag OUT_OF_BOUNDS / Clamping
    |    [MIN_VAL, MAX_VAL]         |
    +-------------------------------+
                    | (Fisicamente plausibile)
                    v
    +-------------------------------+
    | 4. Outlier Filtering Statistico| ---> Tukey's IQR Fences / Hampel MAD Filter
    |    (Serie storiche / VBT reps)|
    +-------------------------------+
                    | (Dato Pulito e Certificato)
                    v
      [Branded Type: Newtons / Watts / MetersPerSecond]
```

#### Regola dello Zero-Division Guard:
Non eseguire mai una divisione per tempo $\Delta t$ o per massa $m$ senza aver prima verificato:
$$\Delta t > \varepsilon \quad \text{con } \varepsilon = 10^{-7}\text{ s}$$
In caso di $\Delta t \le \varepsilon$, la funzione deve restituire uno stato di errore formale (`DIVISION_BY_ZERO_PREVENTED`), senza mai propagare `Infinity` al layer superiore.

#### Strategia di Clamping vs Rigetto Completo:
- **Clamping (Limitazione Controllata):** Consentita esclusivamente per minimi scostamenti dovuti a quantizzazione o jitter del sensore (es. una velocita registrata di `-0.02 m/s` durante la fase statica di setup sul bilanciere viene clampata a `0.00 m/s`).
- **Rigetto Formale (Rejection with Diagnostic):** Obbligatorio per scostamenti superiori al 15% rispetto ai limiti fisici (es. una lettura di velocita di `18.5 m/s` da encoder a filo staccatosi accidentalmente viene rigettata con codice `HARDWARE_TETHER_SLIP_DETECTED`).

---

## 4. FALLBACK VISIVI E MICRO-COPY NEI COCKPIT AD ALTO CONTRASTO

### 4.1 Dizionario dei Placeholder Standard nel Dark Cockpit

Nel Cockpit Dark (`#090d16` canvas, `#0f172a` surface) ispirato al design industriale Apple, e vietato mostrare spazi vuoti, valori stringa `"undefined"`, `"null"`, o zeri arbitrari che potrebbero essere scambiati per prestazioni reali (es. visualizzare `0 W` fa credere che l'atleta non stia spingendo, mentre il sensore potrebbe essere scollegato).

| Stato del Sistema | Placeholder Grafico | Tipografia / Stile | Micro-Copy Esplicativo Sottostante |
| :--- | :--- | :--- | :--- |
| **Dato Non Disponibile** (Nessun test eseguito) | `--` | Em-dash o doppio trattino tabulare (`font-variant-numeric: tabular-nums`) colore `--text-secondary` (`#94a3b8`) | *"Nessun dato registrato nel microciclo"* |
| **In Attesa di Inizio Esercizio** (Sensore pronto) | `--` | Lampeggio pulsante lento (opacita da 0.4 a 1.0 ogni 2s) | *"Pronto: attendere segnale acustico"* |
| **In Calibrazione / Tare in Corso** | `CALIBRATING` | Badge compatto pill con micro-spinner SVG, colore `--neon-cyan` (`#38bdf8`) | *"Azzeramento pedane in corso: mantenere l'atleta immobile"* |
| **Fase di Calibrazione Storica** (< 6 mesi dati) | Valore numerico della Mediana di Ruolo | Testo numerico in corsivo o con contorno tratteggiato | *"Baseline di ruolo provvisoria (3/10 sessioni registrate)"* |
| **Hardware Scollegato / BLE Dropped** | `OFFLINE` | Badge pill con bordo rosso attenuato (`rgba(244,63,94,0.3)`) | *"Sensore disconnesso: verificare ricarica o ricollegare"* |
| **Outlier Rilevato e Rimosso** | `--` con icona warning | Icona a triangolo discreto con popover al passaggio | *"Ripetizione 4 esclusa: rumore di scorrimento cavo"* |

---

### 4.2 Codifica Cromatica Semantica per Scostamento e Affaticamento

I cockpit ad alte prestazioni adottano una codifica tricolore o quadricolore rigorosa per indicare lo scostamento statistico (Z-score) e il degrado della prestazione in tempo reale:

```
[SCALA SEMANTICA COCKPIT T7 WORKOUT]

+--------------------+------------------------+-----------------------+-----------------------------+
| Livello Allerta    | Token Colore HEX       | Range Z-Score         | Significato Biomeccanico    |
+--------------------+------------------------+-----------------------+-----------------------------+
| OPTIMAL (Verde)    | --neon-emerald #10b981 | Z >= -0.5             | Condizione eccellente,      |
|                    |                        | Loss < 10%            | velocita target mantenuta.  |
+--------------------+------------------------+-----------------------+-----------------------------+
| CAUTION (Ambra)    | --neon-amber #f59e0b   | -1.5 <= Z < -0.5      | Affaticamento neuromusco-   |
|                    |                        | 10% <= Loss <= 20%    | lare moderato, monitorare.  |
+--------------------+------------------------+-----------------------+-----------------------------+
| CRITICAL (Rosso)   | --neon-rose #f43f5e    | Z < -1.5              | Perdita esplosivita severa, |
|                    |                        | Loss > 20%            | interruzione serie (stop).  |
+--------------------+------------------------+-----------------------+-----------------------------+
| ANALYTIC (Viola)   | --neon-purple #a855f7  | N/A                   | Statistica PAP potenziata,  |
|                    |                        |                       | coefficiente di regressione.|
+--------------------+------------------------+-----------------------+-----------------------------+
| INFORMATIVE (Ciano)| --neon-cyan #38bdf8    | N/A                   | Connessione BLE, modalita   |
|                    |                        |                       | telemetrica, VBT attivo.    |
+--------------------+------------------------+-----------------------+-----------------------------+
```

---

## 5. ARCHITETTURA SOFTWARE E PATTERN TYPESCRIPT PER TASK-002

### 5.1 Pattern dei Validatori Funzionali Puri (Result / Validation Type)

Per evitare eccezioni non gestite nel runtime del browser e garantire la massima velocita di esecuzione (senza overhead da garbage collection), i validatori devono essere **funzioni pure** prive di side-effects, basate sul pattern `Result<T, E>` discriminato:

```typescript
/**
 * Codici di errore standardizzati per anomalie metrologiche.
 */
export type MetrologyErrorCode =
  | 'NON_FINITE_VALUE'
  | 'NEGATIVE_VALUE_PROHIBITED'
  | 'OUT_OF_PHYSIOLOGICAL_BOUNDS'
  | 'DIVISION_BY_ZERO'
  | 'STATISTICAL_OUTLIER'
  | 'INSUFFICIENT_DATA_FOR_METRIC';

/**
 * Risultato tipizzato dell'operazione di validazione metrologica.
 */
export type ValidationResult<T> =
  | {
      readonly isValid: true;
      readonly value: T;
      readonly status: 'OPTIMAL' | 'ACCEPTABLE' | 'CLAMPED';
      readonly warning?: string;
    }
  | {
      readonly isValid: false;
      readonly rawValue: unknown;
      readonly errorCode: MetrologyErrorCode;
      readonly message: string;
      readonly fallbackDisplay: string;
    };
```

---

### 5.2 Safe Numeric Formatter con Caching delle Istanze `Intl`

L'istanziazione ripetuta di `Intl.NumberFormat` ad ogni frame (60-120 fps) e una delle cause primarie di frame drop nelle Single Page Application. La soluzione ottimale prevede un pool pre-allocato di formattatori immutabili:

```typescript
/**
 * Pool di formattatori numerici thread-safe e performanti.
 */
const FORMATTER_CACHE = new Map<string, Intl.NumberFormat>();

function getCachedFormatter(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}_${JSON.stringify(options)}`;
  let formatter = FORMATTER_CACHE.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    FORMATTER_CACHE.set(key, formatter);
  }
  return formatter;
}
```

---

### 5.3 Proposta di Specifica per `src/utils/metrology-guard.ts`

Il modulo deve importare i Branded Types definiti in TASK-001 (`src/types/physics.ts`) ed esportare guardie, validatori e formattatori sicuri:

```typescript
import {
  Newtons,
  Watts,
  MetersPerSecond,
  Kilograms,
  Degrees,
  Milliseconds,
  Seconds,
  asNewtons,
  asWatts,
  asMetersPerSecond,
  asKilograms,
  asDegrees,
  asMilliseconds,
  asSeconds,
  STANDARD_GRAVITY_MPS2,
  MIN_VALID_LOAD_KG,
  MAX_VALID_LOAD_KG,
  MIN_VALID_VELOCITY_MPS,
  MAX_VALID_VELOCITY_MPS,
} from '../types/physics';

// Costanti fisiologiche aggiuntive con razionale documentato
export const MIN_VALID_FORCE_N = 0.0;
export const MAX_VALID_FORCE_N = 15000.0; // Vald ForceDecks max impact
export const MIN_VALID_POWER_W = 0.0;
export const MAX_VALID_POWER_W = 10000.0; // Peak cycling/sprint ergometer
export const ZERO_DIVISION_EPSILON = 1e-7;

/**
 * Sanitizza un valore numerico primitivo garantendo l'assenza di NaN o Infinity.
 * In caso di valore invalido, restituisce il fallback designato.
 */
export function sanitizeNumeric(value: unknown, fallback = 0.0): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return value;
}

/**
 * Valida e promuove a Branded Type 'Newtons' con bounds checking rigoroso.
 */
export function validateForceN(raw: unknown): ValidationResult<Newtons> {
  const val = sanitizeNumeric(raw, Number.NaN);
  if (!Number.isFinite(val)) {
    return {
      isValid: false,
      rawValue: raw,
      errorCode: 'NON_FINITE_VALUE',
      message: 'La forza deve essere un numero reale finito.',
      fallbackDisplay: '-- N',
    };
  }
  if (val < MIN_VALID_FORCE_N || val > MAX_VALID_FORCE_N) {
    return {
      isValid: false,
      rawValue: val,
      errorCode: 'OUT_OF_PHYSIOLOGICAL_BOUNDS',
      message: `Forza ${val} N fuori dai limiti fisiologici [${MIN_VALID_FORCE_N}, ${MAX_VALID_FORCE_N}].`,
      fallbackDisplay: '-- N',
    };
  }
  return {
    isValid: true,
    value: asNewtons(val),
    status: 'OPTIMAL',
  };
}

/**
 * Esegue una divisione sicura proteggendo dal denominatore nullo o degenere.
 */
export function safeDivide(numerator: number, denominator: number, fallback = 0.0): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || Math.abs(denominator) < ZERO_DIVISION_EPSILON) {
    return fallback;
  }
  return numerator / denominator;
}
```

---

## 6. RACCOMANDAZIONI OPERATIVE PER L'IMPLEMENTAZIONE DI TASK-002

1. **Creazione di `src/utils/metrology-guard.ts`:**
   - Incorporare i costruttori sicuri per tutte le grandezze fisiche (Forza, Potenza, Velocita, Carico, Angoli, Tempi, Frequenza Cardiaca).
   - Esporre funzioni di formattazione grafica per UI (`formatForceN`, `formatPowerW`, `formatVelocityMps`, `formatLoadKg`, `formatDegrees`, `formatTime`).
2. **Creazione di `src/utils/number-format.ts`:**
   - Gestione del rendering DOM accessibile (separazione atomica tra glifo numerico ed etichetta unita).
   - Supporto ai placeholder `--` e `N/D` con corretta formattazione tabulare.
3. **Verifica Rigorosa con Suite di Test:**
   - Test unitari su tutti i casi patologici (`NaN`, `+Infinity`, `-Infinity`, `-0`, denominatori nulli, stringhe non parsabili, carichi negativi).
   - Conformita con `py test_check.py` e `npm run typecheck` con zero errori.

---

### FINE DOSSIER BENCHMARK TASK-002
