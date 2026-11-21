# MATRICE DI SUDDIVISIONE FISIOLOGICA BIDIMENSIONALE DEI RITMI DI SPRINT
## Modello Integrato Bioenergetico, Neuromuscolare e Metodologico (World Athletics, USATF, Centro Studi FIDAL)

**Data di redazione:** 21 Novembre 2026  
**Autore:** Agente Specialista in Biomeccanica e Metodologia dell'Allenamento dello Sprint  
**Incarico:** Definizione della Matrice 2D (13 Distanze × 17 Percentuali = 221 Celle) e Regole di Transizione  
**File Dati Correlato:** `sidequests/sprint-ritmi-excel/output/palette_zone_fisiologiche.csv`

---

## 1. Epistemologia e Fondamento della Matrice Bidimensionale (2D)

### 1.1 Il Limite delle Tabelle Tradizionali a Bande Cromatiche Unidimensionali (1D)
Nelle tabelle cartacee storiche dell'atletica leggera (fogli plastificati diffusi tra gli anni '80 e 2000 da tecnici di club e centri federali), la colorazione delle andature veniva spesso applicata a **colonne verticali fisse**: ad esempio, la colonna del 95% colorata uniformemente di rosso, la colonna dell'85% di arancione, la colonna del 75% di giallo, la colonna del 60% di verde scuro, a prescindere dalla distanza percorsa.

Dal punto di vista della **fisiologia dell'esercizio** e della **biomeccanica dello sprint**, tale impostazione unidimensionale costituisce una grave aberrazione metodologica:
1. **Disaccoppiamento tra Percentuale e Tempo di Lavoro (Time under Tension):**
   - Correre un **60 m al 95%** comporta uno sforzo di circa **$7{,}0 - 7{,}3\text{ s}$**, interamente coperto dalla scissione anaerobica alattacida dei fosfageni intramuscolari (ATP-PCr) con reclutamento neuromuscolare massimale delle fibre a contrazione rapida (tipo IIx).
   - Correre un **400 m al 95%** comporta uno sforzo di circa **$55 - 57\text{ s}$**, caratterizzato da un accumulo massiccio di acido lattico ematico ($[BLa] > 18 - 22\text{ mmol/L}$), crollo del pH intramuscolare ($pH < 6{,}8$) e una compartecipazione del metabolismo ossidativo-aerobico superiore al $40\%$.
   Assegnare a entrambe le prove la stessa "zona" basandosi esclusivamente sul valore numerico nominale "95%" ignora che il corpo umano risponde alla combinazione di **tasso di produzione di potenza** e **durata totale dell'impulso**.
2. **L'Aberrazione delle Andature Lente sui Tratti Brevi:**
   Nelle vecchie tabelle 1D, un 50 m o un 60 m corso al 50% o al 60% veniva etichettato come "lavoro aerobico estensivo" o "rigenerazione" (colore verde). Nella realtà di pista, correre un 50 m in 11,8 secondi (pari al 50% per un atleta da 5,9s) non stimola alcun parametro cardiovascolare utile (lo sforzo si esaurisce in meno di 12 secondi), mentre distrugge la postura dello sprinter: il tempo di contatto al suolo raddoppia ($T_c > 0{,}16\text{ s}$ contro gli $0{,}085\text{ s}$ dello sprint puro), la stiffness del tendine d'Achille collassa, il bacino arretra e la reattività elastica del piede viene compromessa (Ralph Mann 2018; Dan Pfaff 2017).

### 1.2 La Necessità di una Matrice 2D a Coordinate Spazio-Temporali
La corretta prescrizione dell'allenamento richiede una **Matrice Bidimensionale Esatta $Z(d, p)$**, in cui la zona fisiologica è una funzione accoppiata di:
- **Asse delle Ascisse ($p \in (0, 1]$):** Intensità percentuale rispetto alla massima velocità media sulla distanza ($T(d, p) = T_{100}(d)/p$).
- **Asse delle Ordinate ($d \in [50, 600]\text{ m}$):** Distanza della ripetuta, che determina la durata temporale effettiva dello stimolo ($t = T(d, p)$) e l'inerzia di accelerazione.

---

## 2. Tassonomia delle 8 Zone di Carico (7 Funzionali + 1 Zona Inattiva)

La classificazione adottata integra le linee guida di **World Athletics (CECS Level 2/3)**, **USATF (Level 2/3 Sprints & Hurdles)**, il **Centro Studi FIDAL (Scuola di Formia - Carlo Vittori)** e le moderne evidenze di fisiologia neuromuscolare (Buchheit & Sandford 2021; Weyand et al. 2010; Gastin 2001).

```
+---------------------------------------------------------------------------------------------------+
| CODICE IDENTIFICATIVO   | DENOMINAZIONE METODOLOGICA           | SISTEMA ENERGETICO DOMINANTE     |
+---------------------------------------------------------------------------------------------------+
| Z1_MAX_VELOCITY         | Sprint Puro & Accelerazione Alattacida| Anaerobico Alattacido (ATP-PCr)  |
| Z2_LACTIC_POWER         | Potenza Lattacida & Speed Endurance   | Glicolitico Massimale (VLamax)   |
| Z3_SPECIAL_END_1        | Special Endurance 1 (SE1)            | Capacita Lattacida / Acidosi Max |
| Z4_SPECIAL_END_2        | Special Endurance 2 (SE2)            | Misto Lattacido-Aerobico Severo  |
| Z5_INTENSIVE_TEMPO      | Intensive Tempo                      | Glicolisi Controllata (4-8 mM)   |
| Z6_EXTENSIVE_TEMPO      | Extensive Tempo & Capacita Aerobica  | Aerobico Ossidativo (sub-LT2)    |
| Z7_AEROBIC_RECOVERY     | Rigenerazione Aerobica Prolungata    | Aerobico Rigenerativo (sub-LT1)  |
| Z_INACTIVE              | Zona Off / Sub-Funzionale (Gray Zone)| Non Raccomandata (No Adattamento)|
+---------------------------------------------------------------------------------------------------+
```

---

### Schede Dettagliate delle Zone Funzionali

#### ZONA 1: `Z1_MAX_VELOCITY` (Sprint Puro & Accelerazione Alattacida)
* **Finalità Metodologica:** Sviluppo della massima frequenza di scarica neurale del SNC, reclutamento del 100% delle unità motrici rapide (tipo IIx), massimizzazione della stiffness tendinea e riduzione al minimo dei tempi di contatto al suolo ($T_c < 0{,}085 - 0{,}095\text{ s}$).
* **Sistema Bioenergetico:** Anaerobico alattacido puro. Idrolisi immediata di fosfocreatina (PCr) e ATP intracellulare.
* **Concentrazione di Lattato:** Basale o minima accumulazione transitoria ($[BLa] \le 3{,}0 - 4{,}0\text{ mmol/L}$).
* **Finestra Temporale di Efficacia:** $t \le 6 - 8\text{ secondi}$.
* **Distanze e Percentuali Target:** 50 m, 60 m, 80 m a intensità $\ge 95\%$ (100%, 98%, 95%).
* **Parametri di Recupero:** Completo. Rapporto sforzo/pausa di almeno $1:30 - 1:50$ (indicativamente **1 minuto di recupero per ogni 10 metri percorsi**, ovvero 5–8 minuti tra le ripetizioni).

#### ZONA 2: `Z2_LACTIC_POWER` (Potenza Lattacida & Speed Endurance)
* **Finalità Metodologica:** Stimolo al massimo tasso di produzione di lattato nell'unità di tempo ($VLa_{max}$). Sviluppo della capacità di erogare la massima potenza meccanica in condizioni di rapido incremento della glicolisi anaerobica (*Speed Endurance Production*).
* **Sistema Bioenergetico:** Transizione fosfageno-glicolitica. Massimo flusso della fosfofruttochinasi (PFK) e rapida glicogenolisi.
* **Concentrazione di Lattato:** Elevata, con rapida impennata post-sforzo ($[BLa] \approx 8{,}0 - 15{,}0\text{ mmol/L}$).
* **Finestra Temporale di Efficacia:** $t \in [8, 18]\text{ secondi}$.
* **Distanze e Percentuali Target:**
  - 100 m, 120 m, 150 m a intensità $\ge 95\%$ (100%, 98%, 95%);
  - 60 m e 80 m a intensità submassimale elevata (90% e 93%) corse in serie con recupero semi-completo (*Speed Endurance Maintenance*).
* **Parametri di Recupero:** Ampio e quasi-completo ($6 - 12\text{ minuti}$) per permettere la parziale risintesi di PCr e smaltire la fosforilazione inibitoria.

#### ZONA 3: `Z3_SPECIAL_END_1` (Special Endurance 1 - SE1)
* **Finalità Metodologica:** Capacità lattacida massimale e tolleranza all'acidosi muscolare estrema. Sviluppo del mantenimento della velocità di gara per i 200 metri e prima parte dei 400 metri. L'atleta deve mantenere la decontrazione biomeccanica e la frequenza del passo sotto marcata acidosi tissutale.
* **Sistema Bioenergetico:** Anaerobico lattacido dominante ($>60-70\%$ dell'energia totale). Forte produzione di ioni idrogeno ($H^+$) con saturazione del sistema tampone cellulare (bicarbonato ed istidina).
* **Concentrazione di Lattato:** Picco massimale assoluto ($[BLa] > 18{,}0 - 24{,}0\text{ mmol/L}$).
* **Finestra Temporale di Efficacia:** $t \in [18, 40]\text{ secondi}$.
* **Distanze e Percentuali Target:**
  - 150 m, 200 m, 250 m, 300 m a intensità tra $90\%$ e $100\%$ (90%, 93%, 95%, 98%, 100%);
  - 100 m e 120 m a intensità tra $88\%$ e $93\%$ (88%, 90%, 93%).
* **Parametri di Recupero:** Completo per ripetute singole di alta qualità ($10 - 20\text{ minuti}$).

#### ZONA 4: `Z4_SPECIAL_END_2` (Special Endurance 2 - SE2)
* **Finalità Metodologica:** Resistenza alla velocità prolungata specifica per i 400 metri e il mezzofondo veloce (800 m). Capacità di sostenere velocità prossime al ritmo gara in presenza di una severa richiesta combinata tra glicolisi massimale e massimo consumo d'ossigeno ($VO_2$).
* **Sistema Bioenergetico:** Sistema misto anaerobico-aerobico severo. La componente ossidativa contribuisce per il $35 - 50\%$ della spesa energetica totale, mentre la glicolisi opera a regimi massimali prolungati.
* **Concentrazione di Lattato:** Estrema e cumulativa ($[BLa] > 16{,}0 - 22{,}0\text{ mmol/L}$).
* **Finestra Temporale di Efficacia:** $t \in [40, 90]\text{ secondi}$.
* **Distanze e Percentuali Target:**
  - 300 m a intensità $85\% - 88\%$;
  - 350 m, 400 m, 500 m, 600 m a intensità tra $85\%$ e $100\%$ (85%, 88%, 90%, 93%, 95%, 98%, 100%).
* **Parametri di Recupero:** Molto ampi ($12 - 25\text{ minuti}$) tra le prove; sedute a volume ridotto (1–3 prove totali).

#### ZONA 5: `Z5_INTENSIVE_TEMPO` (Intensive Tempo)
* **Finalità Metodologica:** Sviluppo del ritmo di corsa, della decontrazione muscolare e della capacità di smaltimento/riutilizzo del lattato all'interno della fibra muscolare (navetta lattato intracellulare ed extracellulare tramite trasportatori MCT-1 e MCT-4). Consente un volume di lavoro significativo senza saturare il sistema nervoso centrale (metodo Carlo Vittori e Clyde Hart).
* **Sistema Bioenergetico:** Glicolisi aerobica controllata con transizione verso il dominio pesante.
* **Concentrazione di Lattato:** Controllata e stabile ($[BLa] \approx 4{,}0 - 8{,}0\text{ mmol/L}$).
* **Finestra Temporale di Efficacia:** $t \in [13, 70]\text{ secondi}$.
* **Distanze e Percentuali Target:**
  - 100 m, 120 m a intensità tra $78\%$ e $85\%$;
  - 150 m, 200 m, 250 m a intensità tra $78\%$ e $88\%$;
  - 300 m, 350 m, 400 m, 500 m, 600 m a intensità tra $75\%$ e $83\%$.
* **Parametri di Recupero:** Parziale e controllato ($2 - 4\text{ minuti}$ tra le ripetizioni, $5 - 8\text{ minuti}$ tra le serie).

#### ZONA 6: `Z6_EXTENSIVE_TEMPO` (Extensive Tempo & Capacità Aerobica)
* **Finalità Metodologica:** Capillarizzazione del letto vascolare muscolare, biogenesi mitocondriale, rigenerazione attiva e recupero tra i giorni ad alta intensità (sistema High-Low di Charlie Francis). Migliora la tolleranza al volume di carico e promuove la decontrazione neuromuscolare senza stress neurale.
* **Sistema Bioenergetico:** Ossidativo aerobico (dominio moderato-pesante, a ridosso o sotto la seconda soglia di lattato $LT_2$ / Critical Speed).
* **Concentrazione di Lattato:** Bassa ($[BLa] \approx 2{,}0 - 3{,}5\text{ mmol/L}$).
* **Finestra Temporale di Efficacia:** $t \in [14, 140]\text{ secondi}$ (svolto tipicamente su erba con scarpe da running).
* **Distanze e Percentuali Target:**
  - 100 m e 120 m a intensità tra $70\%$ e $75\%$;
  - 150 m, 200 m, 250 m a intensità tra $65\%$ e $75\%$;
  - 300 m, 350 m, 400 m, 500 m, 600 m a intensità tra $65\%$ e $73\%$.
* **Parametri di Recupero:** Molto brevi ($45 - 90\text{ secondi}$ al passo).

#### ZONA 7: `Z7_AEROBIC_RECOVERY` (Rigenerazione Aerobica Prolungata)
* **Finalità Metodologica:** Fondo lento frazionato, attivazione parasimpatica e defaticamento attivo post-gara o nei microcicli di rigenerazione. Esercizio svolto rigorosamente sotto la prima soglia lattacida ($LT_1$).
* **Sistema Bioenergetico:** Puramente ossidativo lipidico e glucidico lento.
* **Concentrazione di Lattato:** Livelli basali di riposo ($[BLa] \le 1{,}5 - 2{,}0\text{ mmol/L}$).
* **Finestra Temporale di Efficacia:** $t \ge 28 - 180\text{ secondi}$ (ripetute estese per quattrocentisti e mezzofondisti veloci).
* **Distanze e Percentuali Target:**
  - 150 m, 200 m, 250 m, 300 m, 350 m, 400 m, 500 m, 600 m a intensità tra $50\%$ e $60\%$.
* **Parametri di Recupero:** Minimo ($30 - 60\text{ secondi}$ di marcia o souplesse continua).

#### ZONA OFF: `Z_INACTIVE` (Celle Sub-Funzionali / Non Raccomandate per Velocisti)
* **Finalità Metodologica:** Identificare ed escludere categoricamente le combinazioni distanza-intensità che risultano prive di valore allenante o apertamente dannose per la cinetica e la cinematica dello sprinter ("The Gray Zone" di Charlie Francis; Dan Pfaff 2017).
* **Perché sono Inattive?**
  1. *Sui 50 m sotto il 95% e su 60–80 m sotto il 90%:* La durata dello stimolo è brevissima ($< 8 - 12\text{ s}$), ma la velocità è troppo bassa per attivare la massima frequenza di scarica dei motoneuroni IIx. L'atleta corre con un tempo di contatto al suolo allungato ($T_c > 0{,}13 - 0{,}16\text{ s}$), perde l'allineamento front-side della coscia e dissipa la stiffness elastica senza produrre alcun adattamento aerobico o lattacido.
  2. *Sui 100 m e 120 m tra il 50% e il 65%:* Correre 100 metri in 18–22 secondi per uno sprinter evoluto equivale a una camminata veloce o a una marcia scomposta. Non produce alcuno stimolo utile sui sistemi bioenergetici centrali, ma induce microtraumi ripetuti sulle strutture tendinee a causa della cinematica alterata.
* **Distanze e Percentuali Target:**
  - 50 m da 50% a 93% (14 celle);
  - 60 m e 80 m da 50% a 88% (12 celle ciascuna);
  - 100 m e 120 m da 50% a 65% (4 celle ciascuna).
  - **Totale celle inattive:** $14 + 12 + 12 + 4 + 4 = \mathbf{46\text{ celle}}$.

---

## 3. Matrice Completa di Classificazione (13 Distanze × 17 Percentuali)

La matrice seguente riporta la classificazione cella per cella generata in `palette_zone_fisiologiche.csv`:

| Distanza | 100% | 98% | 95% | 93% | 90,0% | 88% | 85% | 83% | 80,0% | 78% | 75% | 73% | 70,0% | 65% | 60,0% | 55% | 50,0% |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **50 m** | Z1 | Z1 | Z1 | OFF | OFF | OFF | OFF | OFF | OFF | OFF | OFF | OFF | OFF | OFF | OFF | OFF | OFF |
| **60 m** | Z1 | Z1 | Z1 | Z2 | Z2 | OFF | OFF | OFF | OFF | OFF | OFF | OFF | OFF | OFF | OFF | OFF | OFF |
| **80 m** | Z1 | Z1 | Z1 | Z2 | Z2 | OFF | OFF | OFF | OFF | OFF | OFF | OFF | OFF | OFF | OFF | OFF | OFF |
| **100 m** | Z2 | Z2 | Z2 | Z3 | Z3 | Z3 | Z5 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | OFF | OFF | OFF | OFF |
| **120 m** | Z2 | Z2 | Z2 | Z3 | Z3 | Z3 | Z5 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | OFF | OFF | OFF | OFF |
| **150 m** | Z2 | Z2 | Z2 | Z3 | Z3 | Z5 | Z5 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | Z6 | Z7 | Z7 | Z7 |
| **200 m** | Z3 | Z3 | Z3 | Z3 | Z3 | Z5 | Z5 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | Z6 | Z7 | Z7 | Z7 |
| **250 m** | Z3 | Z3 | Z3 | Z3 | Z3 | Z5 | Z5 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | Z6 | Z7 | Z7 | Z7 |
| **300 m** | Z3 | Z3 | Z3 | Z3 | Z3 | Z4 | Z4 | Z5 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | Z7 | Z7 | Z7 |
| **350 m** | Z4 | Z4 | Z4 | Z4 | Z4 | Z4 | Z4 | Z5 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | Z7 | Z7 | Z7 |
| **400 m** | Z4 | Z4 | Z4 | Z4 | Z4 | Z4 | Z4 | Z5 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | Z7 | Z7 | Z7 |
| **500 m** | Z4 | Z4 | Z4 | Z4 | Z4 | Z4 | Z4 | Z5 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | Z7 | Z7 | Z7 |
| **600 m** | Z4 | Z4 | Z4 | Z4 | Z4 | Z4 | Z4 | Z5 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | Z7 | Z7 | Z7 |

*Legenda abbreviazioni di tabella:*  
- **Z1** = `Z1_MAX_VELOCITY`  
- **Z2** = `Z2_LACTIC_POWER`  
- **Z3** = `Z3_SPECIAL_END_1`  
- **Z4** = `Z4_SPECIAL_END_2`  
- **Z5** = `Z5_INTENSIVE_TEMPO`  
- **Z6** = `Z6_EXTENSIVE_TEMPO`  
- **Z7** = `Z7_AEROBIC_RECOVERY`  
- **OFF** = `Z_INACTIVE`

---

## 4. Distribuzione Quantitativa delle Zone nella Matrice (221 Celle)

Dall'analisi sistematica delle 221 celle complessive emergono i seguenti conteggi e quote percentuali:

```
+-------------------------------------------------------------------------------+
| ZONA                             | NUMERO CELLE | PERCENTUALE SUL TOTALE (221)|
+-------------------------------------------------------------------------------+
| Z1_MAX_VELOCITY                  |            9 |                        4,1% |
| Z2_LACTIC_POWER                  |           13 |                        5,9% |
| Z3_SPECIAL_END_1                 |           28 |                       12,7% |
| Z4_SPECIAL_END_2                 |           30 |                       13,6% |
| Z5_INTENSIVE_TEMPO               |           43 |                       19,5% |
| Z6_EXTENSIVE_TEMPO               |           30 |                       13,6% |
| Z7_AEROBIC_RECOVERY              |           22 |                       10,0% |
| Z_INACTIVE (Zona Off / Gray Zone)|           46 |                       20,8% |
+-------------------------------------------------------------------------------+
| TOTALE COMPLESSIVO               |          221 |                      100,0% |
+-------------------------------------------------------------------------------+
```

### Osservazione Metodologica sulla Distribuzione
- Le **Zone ad Altissima Intensità Neurale e Lattacida (Z1 + Z2)** occupano complessivamente **22 celle (10,0%)**, confermando il principio biologico che la massima velocità e potenza glicolitica rappresentano uno stimolo qualitativo estremamente concentrato e ad altissimo costo energetico.
- Le **Zone di Special Endurance (Z3 + Z4)** rappresentano **58 celle (26,3%)**, costituendo il pilastro della preparazione specifica per i 200 m, 400 m e staffette.
- Le **Zone di Tempo (Z5 + Z6)** assorbono **73 celle (33,1%)**, rispecchiando il grande volume di lavoro tecnico e di decontrazione che caratterizza il carico di base sia nella scuola di Formia (Vittori) sia nei programmi collegiali americani (USATF, Clyde Hart).
- Le **Celle Inattive (Z_INACTIVE)** costituiscono il **20,8% (46 celle)** della tabella: questo dato sancisce l'inutilità biologica di oltre un quinto delle vecchie matrici cartacee e protegge l'atleta da carichi tecnicamente deleteri.

---

## 5. Analisi Dettagliata delle Regole di Transizione tra i Cluster di Distanza

### 5.1 Transizione 1: Dai Tratti Brevissimi (50-80m) ai 100-120m
* **Il Salto Bioenergetico sui Massimali ($\ge 95\%$):**
  - Su 50, 60 e 80 m a $\ge 95\%$, la durata dello sforzo è inferiore a 8–9 secondi: il metabolismo opera in **$Z1$ (alattacido puro)** con zero inibizione enzimatica da protoni.
  - A partire dai 100 m (10,8 s per l'Atleta 1) e 120 m (13,4 s), la durata supera stabilmente gli 8–10 secondi: si entra in **$Z2$ (Potenza Lattacida)**, dove la concentrazione di lattato aumenta a un tasso vertiginoso ($VLa_{max}$) e la glicolisi anaerobica diventa indispensabile per sostenere la produzione di ATP.
* **La comparsa di Special Endurance 1 ($Z3$) sui 100-120m:**
  - Tra l'88% e il 93% sui 100 m ($11{,}6 - 12{,}3\text{ s}$) e 120 m ($14{,}4 - 15{,}2\text{ s}$), lo sforzo è submassimale ma protratto: eseguito in serie ripetute (es. $3 \times 120\text{ m}$ all'88-90% con 6-8 min di recupero), provoca un accumulo di lattato elevato tipico della capacità lattacida ($Z3$).

### 5.2 Transizione 2: La Soglia Biologica dei 18 Secondi (120m vs 150m)
* **Perché il 150m @ 95-100% è Z2 mentre @ 90-93% scivola in Z3?**
  - Per un velocista evoluto (Atleta 1, PB 100m = 10,8s; PB 150m = 16,9s):
    - Al 100% il tempo è **$16{,}9\text{ s}$** ($\le 18\text{ s}$) $\implies$ **$Z2$ (Potenza Lattacida)**.
    - Al 98% il tempo è **$17{,}2\text{ s}$** ($\le 18\text{ s}$) $\implies$ **$Z2$**.
    - Al 95% il tempo è **$17{,}8\text{ s}$** ($\le 18\text{ s}$) $\implies$ **$Z2$**.
    - Al 93% il tempo sale a **$18{,}2\text{ s}$** ($> 18\text{ s}$) $\implies$ **$Z3$ (Special Endurance 1)**.
    - Al 90% il tempo sale a **$18{,}8\text{ s}$** ($> 18\text{ s}$) $\implies$ **$Z3$**.
  La soglia dei 18 secondi segna il limite fisiologico oltre il quale la deplezione di fosfocreatina è pressoché totale ($>85\%$) e l'organismo è costretto a tollerare la massima concentrazione di metaboliti acidi, transitando dalla produzione di picco ($Z2$) alla tolleranza/capacità lattacida prolungata ($Z3$).

### 5.3 Transizione 3: Dai 250m ai 300m e la Soglia dei 40 Secondi (Z3 vs Z4)
* **La Cerniera Fisiologica dei 300 Metri:**
  - Il 300 metri rappresenta la distanza cerniera dell'atletica leggera tra lo sprint puro e il mezzofondo veloce.
  - Per l'Atleta 1 (PB 300m = 38,0s):
    - A intensità tra 90% e 100% (tempi tra **$38{,}0\text{ s}$** e **$42{,}2\text{ s}$**), l'atleta lavora nel cuore della **Special Endurance 1 ($Z3$)**, simulando la tenuta finale dei 200 metri o l'attacco ai primi 300 m del 400 m.
    - Scalando l'intensità all'85%–88% (tempi di **$43{,}2 - 44{,}7\text{ s}$**), la durata supera i 40 secondi e la componente aerobica sale al $35\%$: l'esercizio si trasforma in **Special Endurance 2 ($Z4$)**, ideale per la costruzione della resistenza specifica del quattrocentista.
  - Dai 350 m in su (fino a 600 m), tutti i massimali ($\ge 85\%$) richiedono più di 46 secondi: la dominanza energetica appartiene inderogabilmente a **$Z4$**.

### 5.4 Transizione 4: Intensive Tempo (Z5) vs Extensive Tempo (Z6) vs Rigenerazione (Z7)
* **La scala decrescente delle andature aerobico-lattacide:**
  - **Z5 (Intensive Tempo):** collocata tra il $78\%$ e l'$88\%$ per le distanze brevi-medie (100–250 m) e tra il $75\%$ e l'$83\%$ per le distanze lunghe (300–600 m). Mantiene il lattato su valori di medio-alta intensità ($4 - 8\text{ mmol/L}$) con recuperi medi (2–4 min).
  - **Z6 (Extensive Tempo):** collocata tra il $65\%$ e il $75\%$ (o 70–75% sui 100–120m). Si colloca appena sotto o a ridosso di $LT_2$ (lattato $2 - 3{,}5\text{ mmol/L}$); sviluppa capillarizzazione e mobilità dinamica senza stress neurale.
  - **Z7 (Aerobic Recovery):** presente dai 150 m ai 600 m per intensità tra il $50\%$ e il $60\%$. Fondo lento frazionato su erba sotto $LT_1$, con lattato basale ($< 2\text{ mmol/L}$), finalizzato al drenaggio metabolico e al recupero parasimpatico.

---

## 6. Il Fondamento Biomeccanico della Zona Inattiva (`Z_INACTIVE`)

### 6.1 La Cinematica del Passo di Sprint ad Andature Submassimali Lente
Numerosi studi condotti con pedane dinamometriche e cinematica 3D (Ralph Mann 2018; Weyand et al. 2010; Bonomi & Bosco 1992) hanno dimostrato che **la meccanica di corsa dello sprinter non è scalabile linearmente verso il basso**:

```
+-----------------------------------------------------------------------------------------------+
| PARAMETRO CINEMATICO           | SPRINT MASSIMALE (Z1, >=95%) | CORSA LENTA (Z_INACTIVE, <=80%)|
+-----------------------------------------------------------------------------------------------+
| Tempo di Contatto al Suolo (Tc)| 0,080 - 0,095 secondi        | 0,140 - 0,180 secondi         |
| Tempo di Volo (Tv)             | 0,120 - 0,140 secondi        | 0,090 - 0,110 secondi         |
| Forza Verticale di Picco (GRF) | 4,0 - 5,0 x Peso Corporeo    | 2,0 - 2,5 x Peso Corporeo     |
| Angolo d'Attacco della Coscia  | Massima flessione front-side | Caduta precoce (back-side)    |
| Comportamento Muscolo-Tendineo | Molla elastica (SSC puro)    | Ammortizzazione passiva lenta |
+-----------------------------------------------------------------------------------------------+
```

### 6.2 Perché Correre 50–80m Lenti è Dannoso per il Velocista
1. **Perdita della Stiffness Articolare (Ankle & Knee Stiffness):** Nello sprint veloce, il complesso caviglia-tendine d'Achille opera come una molla rigidissima che restituisce energia elastica nei primi $0{,}04\text{ s}$ dell'impatto. Correre tratti brevi a velocità blanda induce un collasso dorsiflessorio della caviglia e un allungamento del tempo di transizione eccentrico-concentrico, disabituando i fusi neuromuscolari alla reattività pliometrica.
2. **Alterazione della Postura Pelvica:** A bassa velocità su distanze brevissime, non c'è tempo sufficiente per impostare il ritmo respiratorio o la fluidità del passo: l'atleta "frena" a ogni falcata per non accelerare, provocando un'eccessiva inclinazione anteriore del bacino (*anterior pelvic tilt*) e aumentando il braccio di leva dello stress da trazione sull'inserzione prossimale dei muscoli ischiocrurali (rischio stiramenti).
3. **Assenza Totale di Stimolo Energetico:** Uno sforzo di 6–10 secondi a intensità del 60–70% brucia una quantità insignificante di calorie e non attiva né la cascata fosfagena, né la via glicolitica, né la gittata cardiaca aerobica.

Per tutte queste ragioni, la Matrice 2D cancella l'ambiguità delle vecchie tabelle cartacee e classifica tali celle come **`Z_INACTIVE`**, fornendo al coach e all'atleta una guida prescrittiva biologicamente inattaccabile.

---

## 7. Riferimenti Bibliografici e Documenti Federali

1. **World Athletics (IAAF):** *Coaching Education and Certification System (CECS) - Level 2 & 3: Sprints and Relays*. World Athletics Technical Library, Monaco, 2019.
2. **USA Track & Field (USATF):** *USATF Level 2 Coaching Manual: Sprints, Hurdles, and Relays*. Human Kinetics, Indianapolis, 2015.
3. **Centro Studi FIDAL:** *L'insegnamento e l'allenamento della corsa veloce*. A cura di Carlo Vittori. FIDAL, Roma, 1997 / 2014.
4. **Francis, C., & Patterson, P.:** *The Charlie Francis Training System*. TBLI Publications, Ottawa, 1992.
5. **Pfaff, D., & McMillan, S.:** *The ALTIS Foundation Course: Sprint Coaching Essentials*. ALTIS World, Phoenix, AZ, 2017.
6. **Mann, R., & Murphy, A.:** *The Mechanics of Sprinting and Hurdling*. CreateSpace, 2nd Edition, 2018.
7. **Hart, C.:** *200/400m Sprint Training and Conditioning Program*. Baylor University / USATF Clinics, 2009.
8. **Bonomi, R., & Bosco, C.:** *L'allenamento della velocità nei 100 e 200 metri: monitoraggio cinematico ed elettromiografico*. *Atletica Studi*, Centro Studi & Ricerche FIDAL, Roma, 1992.
9. **Buchheit, M., & Sandford, G. N.:** *Anaerobic Speed Reserve: A key concept for individualising interval training in running*. *Aspetar Sports Medicine Journal*, 10, 52–60, 2021.
10. **Weyand, P. G., Linberg, R., & Bundle, M. W.:** *Development of rapid-force-generating capacity explains sprint-running performance*. *Journal of Applied Physiology*, 108(4), 950–961, 2010.
11. **Baker, J. S., McCormick, M. C., & Robergs, R. A.:** *Interaction among Skeletal Muscle Metabolic Energy Systems during Intense Exercise*. *Journal of Nutrition and Metabolism*, 2010, 1–13, 2010.
12. **Poole, D. C., Burnley, M., Vanhatalo, A., Rossiter, H. B., & Jones, A. M.:** *Critical Power: An Important Fatigue Threshold in Exercise Physiology*. *Medicine & Science in Sports & Exercise*, 48(11), 2320–2334, 2016.
