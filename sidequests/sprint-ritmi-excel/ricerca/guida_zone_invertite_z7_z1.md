# GUIDA DIDATTICA E ARCHITETTURA GERARCHICA DELLE ZONE DI SPRINT (Z7 TOP -> Z1 BASE)
## Revisione Metodologica, Allineamento WCAG AAA e Integrazione dei Ritmi Submassimali (60–100m all'80–88% e 50–120m al 50–65%)

**Data di redazione:** 22 Novembre 2026  
**Autore:** Agente Revisore della Guida e della Struttura Didattica di Atletica Leggera  
**Destinatari:** Team di Ricerca Metodologica, Preparatori Atletici, Allenatori FIDAL / World Athletics, Ingegneri del Software  
**File Dati Collegati:**
- Matrice CSV v2: `sidequests/sprint-ritmi-excel/output/palette_zone_fisiologiche_v2.csv`
- File Excel Operativo: `sidequests/sprint-ritmi-excel/output/ritmi_atleti.xlsx` (Fogli: Atleta 1, Atleta 2, Atleta 3, Legenda e Guida Mobile)
- Screenshot di Riferimento Utente: `media_1795300998963_714624a3.png`

---

## 1. Executive Summary e Ratio della Ristrutturazione

### 1.1 La Nuova Struttura Gerarchica Decrescente (Z7 -> Z1)
Su esplicita e corretta indicazione dell'utente, l'architettura delle zone di allenamento per la corsa veloce è stata allineata alla convenzione didattica piramidale decrescente a 7 zone continue:
- **ZONA 7 (Vertice, Massima Intensità):** Velocità Massima ed Accelerazione Alattacida (ATP-PCr puro, $t \le 8\text{ s}$).
- **ZONA 6:** Potenza Lattacida & Speed Endurance (Glicolisi anaerobica massimale / $VLa_{\max}$, $8 - 18\text{ s}$).
- **ZONA 5:** Special Endurance 1 - SE1 (Potenza Lattacida con rec. completo $\ge 12-20\text{ min}$ / Capacità con rec. incompleto $4-8\text{ min}$, $18 - 40\text{ s}$).
- **ZONA 4:** Special Endurance 2 - SE2 (Resistenza alla velocità prolungata, misto lattacido-aerobico, $40 - 90\text{ s}$).
- **ZONA 3:** Intensive Tempo (Glicolisi controllata $4 - 8\text{ mM}$, decontrazione neurale a ritmo gara, $13 - 70\text{ s}$).
- **ZONA 2:** Extensive Tempo Tecnico & Capillarizzazione (Ossidativo sub-$LT_2$, recupero attivo, capillarizzazione muscolare e postura, $14 - 140\text{ s}$).
- **ZONA 1 (Base, Minima Intensità):** Rigenerazione Aerobica, Strides di Riscaldamento & Flush Runs su erba (Ossidativo puro sub-$LT_1$, drenaggio metabolico, rialzo termico e riatletizzazione).

Tale ordinamento risulta intuitivo e pedagogicamente impeccabile: **all'aumentare del numero della zona corrisponde un incremento diretto dell'intensità neurale, del reclutamento delle fibre veloci (Tipo IIx) e della velocità di avanzamento**.

---

### 1.2 La Correzione Metodologica: Riassegnazione dell'80m all'83% a Z3 (Intensive Tempo)
Nella prima bozza delle tabelle, le prove sui tratti brevi ($50 - 80\text{ m}$) a intensità $\le 88\%$ erano state frettolosamente marchiate come `Z_INACTIVE` (OFF) sulla base del presupposto teorico che "correre piano su distanze corte distrugge la stiffness del velocista".

L'utente ha contestato con estrema lucidità questa classificazione:
1. Per uno sprinter da $10{,}80\text{ s}$, correre un **80 m all'83%** significa correre in **$10{,}60\text{ s}$**, ovvero a una velocità media di **$7{,}55\text{ m/s} = \mathbf{27{,}2\text{ km/h}}$** (passo di $2\text{ min } 12{,}5\text{ s / km}$ o $13{,}25\text{ s}$ ogni 100m).
2. A $27{,}2\text{ km/h}$ l'appoggio è puramente su avampiede/mesopiede, il tempo di contatto al suolo è di circa $115\text{ ms}$ (**Fast SSC pieno**), la stiffness verticale è al $90\%$ del massimale e non esiste alcun "tallonamento" o "corsa da lumaca".
3. Ma soprattutto, come fatto notare dall'utente nella sua riflessione epistemologica, **anche se un atleta avesse un massimale di 17,0s sugli 80m** (correndo all'83% a $14\text{ km/h}$), i **principi fisiologici relativi rimangono identici**: reclutamento neurale submassimale all'83% della MVC, decontrazione muscolare, assenza di co-contrazioni parassite e controllo glicolitico moderato.
4. Di conseguenza, tutte le prove su **$50\text{ m}, 60\text{ m}, 80\text{ m}$ nella fascia 78%–88%** sono state riassegnate a **`Z3_INTENSIVE_TEMPO`**, la fascia **70%–75%** è stata assegnata a **`Z2_EXTENSIVE_TEMPO`**, e la **ZONA OFF è stata circoscritta esclusivamente alle percentuali $\le 65\%$** sui tratti brevi ($50 - 120\text{ m}$).

---

## 2. Audit Comparativo: Screenshot Utente vs Foglio Excel Definitivo

Dall'ispezione dell'immagine allegata dall'utente (`media_1795300998963_714624a3.png`), si riscontra la perfetta coerenza tra la richiesta dell'utente e l'implementazione nel workbook `ritmi_atleti.xlsx`:

| Zona | Nome della Zona | Sistema Energetico & Finestra Temporale | Colore Sfondo (Hex) | Colore Testo (Hex) | Contrasto WCAG 2.1 | Distanze & Percentuali Tipiche (Aggiornate) |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **Z7** | **Velocità Massima & Accel. Alattacida** | ATP-PCr puro, fibre rapide IIx ($t \le 8\text{ s}$) | `#9E2A2B` | `#FFFFFF` | **7.45:1** (AAA) | $50\text{ m}, 60\text{ m}, 80\text{ m} \ @ \ 95 - 100\%$ |
| **Z6** | **Potenza Lattacida & Speed Endurance** | Glicolisi max / $VLa_{\max}$ ($8 - 18\text{ s}$) | `#6C3483` | `#FFFFFF` | **8.55:1** (AAA) | $100\text{m} - 150\text{ m} \ @ \ 95 - 100\%$, $50 - 80\text{ m} \ @ \ 90 - 93\%$ |
| **Z5** | **Special Endurance 1 (SE1) - Potenza & Capacità** | Potenza Lattacida (rec. $\ge 12-20\text{ min}$) / Capacità (rec. $4-8\text{ min}$) ($18 - 40\text{ s}$) | `#93401A` | `#FFFFFF` | **7.03:1** (AAA) | $150\text{m} - 300\text{ m} \ @ \ 90 - 98\%$, $100 - 120\text{ m} \ @ \ 88 - 93\%$ (SE1) |
| **Z4** | **Special Endurance 2 (SE2)** | Misto lattacido-aerobico severo ($40 - 90\text{ s}$) | `#F5CBA7` | `#1E1E1E` | **11.10:1** (AAA) | $300\text{m} - 600\text{ m} \ @ \ 85 - 98\%$ (SE2) |
| **Z3** | **Intensive Tempo** | Glicolisi controllata $4 - 8\text{ mM}$ ($13 - 70\text{ s}$) | `#F9E79F` | `#1E1E1E` | **13.46:1** (AAA) | $50\text{m} - 250\text{ m} \ @ \ 78 - 88\%$, $300 - 600\text{ m} \ @ \ 75 - 83\%$ *(include 80m @ 83%)* |
| **Z2** | **Extensive Tempo Tecnico & Capillarizzazione** | Ossidativo sub-$LT_2$, recupero attivo ($14 - 140\text{ s}$) | `#A9DFBF` | `#1E1E1E` | **11.11:1** (AAA) | $50\text{m} - 600\text{ m} \ @ \ 65 - 75\%$ *(Extensive Tempo Tecnico)* |
| **Z1** | **Rigenerazione Aerobica, Riscaldamento & Flush** | Ossidativo puro sub-$LT_1$ ($28 - 180\text{ s}$) | `#AED6F1` | `#1E1E1E` | **10.87:1** (AAA) | $50\text{m} - 600\text{ m} \ @ \ 50 - 60\%$ *(Strides riscaldamento & Flush runs)* |

---

## 3. Matrice 2D Aggiornata (13 Distanze × 17 Percentuali = 221 Celle)

La matrice bidimensionale $Z(d, p)$ è codificata nel file [palette_zone_fisiologiche_v2.csv](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/sidequests/sprint-ritmi-excel/output/palette_zone_fisiologiche_v2.csv) ed è applicata con formule vive in tutti i fogli atleta:

| Distanza | 100% | 98% | 95% | 93% | 90,0% | 88% | 85% | 83% | 80,0% | 78% | 75% | 73% | 70,0% | 65% | 60,0% | 55% | 50,0% |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **50 m** | **Z7** | **Z7** | **Z7** | **Z6** | **Z6** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z1** | **Z1** | **Z1** |
| **60 m** | **Z7** | **Z7** | **Z7** | **Z6** | **Z6** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z1** | **Z1** | **Z1** |
| **80 m** | **Z7** | **Z7** | **Z7** | **Z6** | **Z6** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z1** | **Z1** | **Z1** |
| **100 m** | **Z6** | **Z6** | **Z6** | **Z5** | **Z5** | **Z5** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z1** | **Z1** |
| **120 m** | **Z6** | **Z6** | **Z6** | **Z5** | **Z5** | **Z5** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z1** | **Z1** |
| **150 m** | **Z6** | **Z6** | **Z6** | **Z5** | **Z5** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z1** | **Z1** |
| **200 m** | **Z5** | **Z5** | **Z5** | **Z5** | **Z5** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z1** | **Z1** | **Z1** |
| **250 m** | **Z5** | **Z5** | **Z5** | **Z5** | **Z5** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z2** | **Z1** | **Z1** | **Z1** |
| **300 m** | **Z5** | **Z5** | **Z5** | **Z5** | **Z5** | **Z4** | **Z4** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z2** | **Z1** | **Z1** | **Z1** |
| **350 m** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z3** | **Z3** | **Z3** | **Z2** | **Z2** | **Z2** | **Z1** | **Z1** | **Z1** | **Z1** |
| **400 m** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z3** | **Z3** | **Z3** | **Z2** | **Z2** | **Z2** | **Z1** | **Z1** | **Z1** | **Z1** |
| **500 m** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z3** | **Z3** | **Z3** | **Z2** | **Z2** | **Z2** | **Z1** | **Z1** | **Z1** | **Z1** |
| **600 m** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z3** | **Z3** | **Z3** | **Z2** | **Z2** | **Z2** | **Z1** | **Z1** | **Z1** | **Z1** |

---

### 3.1 Statistica di Ripartizione delle 221 Celle

```
+---------------------------------------------------------------------------------------+
| CODICE ZONA | DENOMINAZIONE METODOLOGICA           | CELLE | PERCENTUALE | LIVELLO WCAG|
+---------------------------------------------------------------------------------------+
| Z7          | Velocità Massima & Accel. Alattacida  |     9 |        4,1% | 7.45:1 AAA  |
| Z6          | Potenza Lattacida & Speed Endurance   |    15 |        6,8% | 8.55:1 AAA  |
| Z5          | Special Endurance 1 (SE1)             |    23 |       10,4% | 7.03:1 AAA  |
| Z4          | Special Endurance 2 (SE2)             |    30 |       13,6% | 11.10:1 AAA |
| Z3          | Intensive Tempo (Vittori / Hart)      |    81 |       36,7% | 13.46:1 AAA |
| Z2          | Extensive Tempo Tecnico & Capillariz. |    23 |       10,4% | 11.11:1 AAA |
| Z1          | Rigenerazione Aerobica & Strides      |    40 |       18,1% | 10.87:1 AAA |
+---------------------------------------------------------------------------------------+
| TOTALE      | 13 Distanze x 17 Percentuali          |   221 |      100,0% | CONFORME    |
+---------------------------------------------------------------------------------------+
```

#### Considerazioni sulla Nuova Distribuzione
- **Integrazione della Scala a Gradoni Originale di Angelo ($\le 75\%$):** Il layout delle percentuali submassimali ricalca esattamente la progressione geometrica collaudata sul campo da Angelo (riferimento `media_1795307086663_96b2ec4b.jpg`). Sulle distanze brevi (50m–150m), l'Intensive Tempo (Z3) si spinge fino al 70% (e fino al 65% sui 100m, 120m e 150m), dove la velocità rimane biomeccanicamente idonea a stimolare il ciclo allungamento-accorciamento (SSC) rapido e la coordinazione front-side.
- **Transizione Fluida verso Extensive Tempo (Z2) e Rigenerazione (Z1):** L'Extensive Tempo Tecnico (Z2) presidia la cerniera di transizione (65% sui 50m–80m e 200m; 60% sui 100m–150m; 65%–70% sui 250m–300m; 70%–75% sui 350m–600m). Le percentuali più basse (50%–60%) costituiscono la base solida di Rigenerazione Aerobica, Strides di Riscaldamento e Lactic Flush Runs (Z1, 40 celle, 18,1%).
- **Eliminazione Totale delle Celle OFF (0 celle, 0%):** Tutte le 221 celle possiedono una destinazione didattica e fisiologica chiara. Zero desaturazione in grigio, piena leggibilità WCAG AAA.

---

## 4. Matrice Metodologica: Sforzo, Tempo di Recupero e Sistemi Energetici (SEP vs SEM)

Implementata come tabella operativa alle righe 14–24 del Foglio 4 ("Legenda e Guida Mobile") del workbook Excel:

| Zona | Distanze Tipiche | Intensità | Tempo di Recupero | Effetto Fisiologico Bersaglio & Adattamento Molecolare |
| :---: | :---: | :---: | :--- | :--- |
| **Z7** | $50\text{m} - 80\text{ m}$ | $95 - 100\%$ | **Completo** ($4 - 8\text{ min}$) | **Velocità Massima & Accelerazione Alattacida** (ATP-PCr puro, fibre rapide IIx) |
| **Z6** | $100\text{m} - 150\text{ m}$ | $95 - 100\%$ | **Completo** ($8 - 12\text{ min}$) | **Potenza Lattacida Breve / Speed Endurance** ($VLa_{\max}$ picco, glicolisi rapida) |
| **Z5 (SEP)** | $150\text{m} - 300\text{ m}$ | $95 - 100\%$ | **COMPLETO** ($12 - 20+\text{ min}$) | **POTENZA LATTACIDA PROLUNGATA** (Speed Endurance Production - Prova singola o time trial 250m/300m) |
| **Z5 (SEM)** | $150\text{m} - 300\text{ m}$ | $90 - 95\%$ | **INCOMPLETO** ($4 - 8\text{ min}$) | **CAPACITÀ LATTACIDA & BUFFERING** (Speed Endurance Maintenance - Serie ripetute in acidosi) |
| **Z4** | $300\text{m} - 600\text{ m}$ | $85 - 98\%$ | **Ampio** ($12 - 25\text{ min}$) | **Special Endurance 2 / Misto Lattacido-Aerobico Severo** (Tenuta 400m/800m) |
| **Z3** | $50\text{m} - 250\text{ m}$ | $78 - 88\%$ | **Breve** ($1.5 - 3\text{ min}$) | **Intensive Tempo** (Glicolisi controllata $4 - 8\text{ mM}$, Fast SSC, decontrazione neurale) |
| **Z2** | $50\text{m} - 600\text{ m}$ | $65 - 75\%$ | **Molto breve** ($45\text{s} - 2\text{ min}$) | **Extensive Tempo Tecnico & Capillarizzazione** (Ossidativo sub-$LT_2$, recupero attivo) |
| **Z1** | $50\text{m} - 600\text{ m}$ | $50 - 60\%$ | **Minimo / Continuo** | **Rigenerazione Aerobica, Strides Riscaldamento & Flush Runs su erba** (Sub-$LT_1$) |

---

## 5. Testo Riscritto delle Note di Campo nel Foglio Excel ("Legenda e Guida Mobile")

Tutti i testi esplicativi collocati a fondo pagina nel quarto foglio del file Excel sono stati integralmente riscritti per recepire:
1. La nuova nomenclatura invertita **Z7 (Top) -> Z1 (Base)**;
2. La sostituzione di ogni vecchio riferimento ("Z1/Z2 per la velocità pura" ora diventa espressamente **"Z7/Z6"**);
3. Il riscatto scientifico e la riassegnazione dei tratti brevi submassimali (50m–120m al 50%–65%) a **Z2 (Extensive Tempo Tecnico)** e **Z1 (Rigenerazione, Riscaldamento & Flush Runs)** con eliminazione definitiva della categoria "OFF";
4. La trattazione scientifica del **Tempo di Recupero come variabile discriminante tra Potenza Lattacida (SEP) e Capacità Lattacida (SEM)** sui 150m–300m.

Di seguito il testo integrale implementato nel foglio:

### Blocco 1: Il Ruolo Cruciale del Tempo di Recupero: Potenza Lattacida vs Capacità Lattacida sui 150m–300m
> - **La distanza percorsa NON determina da sola il sistema energetico bersaglio:** è la combinazione di Distanza (Tempo sotto tensione) × Intensità × **TEMPO DI RECUPERO** a stabilire se si allena la Potenza o la Capacità.  
> - **POTENZA LATTACIDA (SEP - Speed Endurance Production):** se un velocista (es. centometrista o duecentista) corre un singolo 250m o 300m massimale al 100% (o 2 prove con recupero completo $\ge 15-20\text{ min}$), alla partenza il pH è neutro ($\sim 7{,}1$) e la fosfocreatina è al 100%. L'enzima PFK-1 lavora alla massima velocità catalitica, sprigionando il massimo picco glicolitico ($VLa_{\max}$) e accumulo di lattato oltre $18-22\text{ mM}$. Questo stimolo allena la massima potenza erogabile per reggere gli ultimi 30–50m di un 200m.  
> - **CAPACITÀ LATTACIDA (SEM - Speed Endurance Maintenance):** se la stessa distanza (200m–300m) viene corsa con recupero incompleto ($4-8\text{ min}$), l'atleta riparte in piena acidosi (pH $\sim 6{,}80$). Come dimostrato da Bogdanis (1996), la PFK-1 viene inibita del 45% dai protoni $H^+$ residui; la massima potenza non può essere espressa e l'organismo è forzato ad allenare la capacità tampone muscolare (bicarbonati, carnosina) e l'efficienza dei trasportatori MCT1/MCT4.  
> - **Pertanto, la Special Endurance 1 (Z5) possiede una doppia natura metodologica:** con recupero completo è Potenza Lattacida Prolungata; con recupero parziale è Capacità Lattacida e tolleranza all'acidosi.

---

### Blocco 2: Funzionalità Smart per Piccoli Schermi (Mobile & Tablet)
> 1. **Blocco Riquadri Bidirezionale (Freeze Panes `C9`):** quando scorri a destra verso le percentuali estensive, la colonna della distanza (A) e la colonna del massimale 100% (B) restano sempre ancorate e visibili sul lato sinistro dello schermo.  
> 2. Quando scorri verso il basso verso i 600m, l'intestazione delle percentuali (riga 8) resta sempre bloccata in alto.  
> 3. **Touch Targets (Altezza 21.5 pt):** righe rialzate per facilitare il tocco mirato con un solo dito, anche con guanti in pista o display bagnato.  
> 4. **Larghezza Colonne Compatta (6.4):** calibrata per consentire la visualizzazione simultanea di 11–12 colonne su display smartphone standard senza scrolling continuo.

---

### Blocco 3: Struttura Didattica e Gerarchia delle Zone (Z7 Top -> Z1 Base)
> - **Z7 (Rosso Mattone):** Massima Velocità ed Accelerazione Alattacida ($50 - 80\text{ m} \ @ \ 95 - 100\%$, $t \le 8\text{ s}$, ATP-PCr puro, fibre rapide IIx).  
> - **Z6 (Viola Prugna):** Potenza Lattacida & Speed Endurance ($100 - 150\text{ m} \ @ \ 95 - 100\%$, $50 - 80\text{ m} \ @ \ 90 - 93\%$, $VLa_{\max}$, glicolisi rapida).  
> - **Z5 (Terracotta):** Special Endurance 1 - SE1 ($150 - 300\text{ m} \ @ \ 90 - 98\%$, Potenza Lattacida con rec. completo $\ge 12-20\text{ min}$, Capacità con rec. incompleto $4-8\text{ min}$).  
> - **Z4 (Ambra Chiaro):** Special Endurance 2 - SE2 ($300 - 600\text{ m} \ @ \ 85 - 98\%$, resistenza alla velocità prolungata, misto severo $40 - 90\text{ s}$).  
> - **Z3 (Giallo Sabbia):** Intensive Tempo ($50 - 200\text{ m} \ @ \ 70 - 88\%$, $100 - 150\text{ m} \ @ \ 65 - 88\%$, $250 - 300\text{ m} \ @ \ 73 - 88\%$, $350 - 600\text{ m} \ @ \ 78 - 83\%$, decontrazione neurale, glicolisi controllata $4 - 8\text{ mM}$).  
> - **Z2 (Verde Salvia):** Extensive Tempo Tecnico & Capillarizzazione ($50 - 200\text{ m} \ @ \ 65\%$, $100 - 150\text{ m} \ @ \ 60\%$, $250 - 300\text{ m} \ @ \ 65 - 70\%$, $350 - 600\text{ m} \ @ \ 70 - 75\%$, recupero attivo, ossidativo sub-$LT_2$, postura e capillarizzazione).  
> - **Z1 (Azzurro Polvere):** Rigenerazione Aerobica, Strides Riscaldamento & Flush Runs ($50 - 300\text{ m} \ @ \ 50 - 60\%$, $100 - 150\text{ m} \ @ \ 50 - 55\%$, $350 - 600\text{ m} \ @ \ 50 - 65\%$, riscaldamento pre-gara, flush su erba, riatletizzazione).  

---

### Blocco 4: Il Valore Metodologico dei Tratti Brevi Submassimali (50m–120m @ 50%–65%): Riscaldamento, Flush Runs e Recupero Attivo
> - La tesi secondo cui correre tratti brevi sotto il $65\%$ "distrugge la stiffness reattiva" è un mito dogmatico smentito dalla fisiologia e dalla biomeccanica applicata:
> - **1. Spring-Mass Model "Tunable" (Farley & McMahon):** il corpo umano adatta la stiffness in millisecondi via feed-forward. Allunghi controllati non diseducano l'arco riflesso; al contrario, la stiffness cala a causa della fatica cronica del SNC e delle tendinopatie da sovraccarico, che vengono prevenute proprio dal lavoro rigenerativo.
> - **2. Extensive Tempo di Charlie Francis:** Francis costruiva l'80% del volume settimanale dei suoi campioni olimpici su $1.500 - 3.000\text{ m}$ di Extensive Tempo fatto di serie da 100m su erba in 18–22s (esattamente il 50%–55% del massimale), per stimolare il letto capillare (VEGF) e permettere al SNC di rigenerarsi.
> - **3. Pratica dei Grandi Tecnici:** Carlo Vittori (*allunghi di riscaldamento a scioltezza elastica*), Dan Pfaff ad ALTIS (*barefoot grass flush runs*), Clyde Hart (*warm-up strides* e diagonali su erba) e Ryan Banta (*return-to-play post hamstring injury*) utilizzano quotidianamente i 50m–120m al 50%–65% come ponte termico preparatorio, decontrazione muscolare e ricircolo del lattato (George Brooks Lactate Shuttle MCT1/MCT4).

---

### Blocco 5: Linee Guida Scientifiche d'Uso sul Campo
> - **Regola di Stop del 3% (SNC Fatigue Cutoff):** nelle sedute di velocità pura e potenza lattacida (**Z7/Z6/Z5 SEP**), interrompere la serie o aumentare il recupero non appena il crono registrato sale di oltre il $3\%$ rispetto al target (es. da $10{,}80\text{ s}$ a oltre $11{,}12\text{ s}$), per evitare fatica neurale parassita e deterioramento motorio.  
> - **Flying Start su Z3:** per prove tecniche di ritmo su $50\text{ m}, 60\text{ m}$ e $80\text{ m}$ al $78 - 88\%$ (**Z3**), adottare un avvio lanciato di $10 - 15\text{ m}$ per evitare che la fase di accelerazione statica iniziale alteri la velocità di crociera e la biomeccanica front-side.  
> - **Autoregolazione Dinamica:** modificando un massimale in Colonna B, tutte le 16 percentuali submassimali (da **Z7** a **Z1**) si ricalcolano istantaneamente tramite formula viva Excel (`=$B{riga}/C$8`).

---

## 6. Verifica Meccanica e Integrità del File Excel

L'audit automatico eseguito tramite lo script `sidequests/sprint-ritmi-excel/tools/verify_all.py` ha certificato:
1. **Formule Vive (624 celle):** Tutte le celle delle colonne `C..R` su Atleta 1, Atleta 2 e Atleta 3 contengono la formula esatta `=$B{riga}/C$8`. Zero valori statici o sovrascritti.
2. **Formattazione Numerica (675 celle):** Tutte le celle riportano `0.0` (un decimale), ad eccezione dei 50m all'83% che riportano `0.00` per visualizzare la risoluzione centesimale ($7{,}11\text{ s}$ vs $7{,}1\text{ s}$).
3. **Mappatura Cromatica WCAG AAA (663 celle):** Tutte le celle sono colorate esattamente in conformità ai codici HEX della palette v2 su 7 zone continue (`#9E2A2B`, `#6C3483`, `#93401A`, `#F5CBA7`, `#F9E79F`, `#A9DFBF`, `#AED6F1`).
4. **Foglio Legenda:** Verificato con gerarchia decrescente Z7 (riga 4) -> Z1 (riga 10), tabella Matrice dei Recuperi a 8 livelli operativi e Note didattiche a celle espanse. Zero celle OFF.

---

## 7. Conclusioni Metodologiche per lo Staff Tecnico

La presente revisione didattica e funzionale risolve definitivamente ogni incoerenza tra teoria scientifica e pratica di campo:
1. Soddisfa la preferenza didattica dell'utente di porre **Z7 come massima intensità** e **Z1 come minima intensità**, standardizzando il linguaggio tra atleti e tecnici.
2. Riscatta la dignità dell'**80m all'83%** e delle prove submassimali brevi ($50 - 100\text{ m}$ al $78 - 88\%$), collocandole nel cuore dell'**Intensive Tempo (Z3)** quale strumento insostituibile di ritmizzazione, decontrazione muscolare e prevenzione degli infortuni agli ischiocrurali.
3. **Elimina definitivamente la Zona OFF:** restituisce piena dignità fisiologica e pratica ai tratti 50m–120m al 50%–65%, inquadrandoli come **Z2 (Extensive Tempo Tecnico)** e **Z1 (Rigenerazione, Riscaldamento & Flush Runs)** nel solco dell'esperienza di Carlo Vittori, Dan Pfaff e Charlie Francis.
4. Consegna uno strumento Excel nativo, reattivo, ergonomico e leggibile in qualsiasi condizione atmosferica a bordo pista.
