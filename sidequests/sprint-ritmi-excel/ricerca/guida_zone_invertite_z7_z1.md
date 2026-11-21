# GUIDA DIDATTICA E ARCHITETTURA GERARCHICA DELLE ZONE DI SPRINT (Z7 TOP -> Z1 BASE + OFF)
## Revisione Metodologica, Allineamento WCAG AAA e Integrazione dei Ritmi Submassimali (60–100m all'80–88%)

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
Su esplicita e corretta indicazione dell'utente, l'architettura delle zone di allenamento per la corsa veloce è stata allineata alla convenzione didattica piramidale decrescente:
- **ZONA 7 (Vertice, Massima Intensità):** Velocità Massima ed Accelerazione Alattacida (ATP-PCr puro, $t \le 8\text{ s}$).
- **ZONA 6:** Potenza Lattacida & Speed Endurance (Glicolisi anaerobica massimale / $VLa_{\max}$, $8 - 18\text{ s}$).
- **ZONA 5:** Special Endurance 1 - SE1 (Capacità lattacida e massima acidosi, $18 - 40\text{ s}$).
- **ZONA 4:** Special Endurance 2 - SE2 (Resistenza alla velocità prolungata, misto lattacido-aerobico, $40 - 90\text{ s}$).
- **ZONA 3:** Intensive Tempo (Glicolisi controllata $4 - 8\text{ mM}$, decontrazione neurale a ritmo gara, $13 - 70\text{ s}$).
- **ZONA 2:** Extensive Tempo & Capillarizzazione (Ossidativo sub-$LT_2$, recupero attivo, capillarizzazione muscolare, $14 - 140\text{ s}$).
- **ZONA 1 (Base, Minima Intensità):** Rigenerazione Aerobica Prolungata (Ossidativo puro sub-$LT_1$, drenaggio metabolico, $28 - 180\text{ s}$).
- **ZONA OFF:** Zona Inattiva / Sub-Funzionale (Disattivata su tratti brevi $\le 65\%$ per prevenire alterazioni biomeccaniche della stiffness).

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
| **Z5** | **Special Endurance 1 (SE1)** | Capacità lattacida, acidosi max ($18 - 40\text{ s}$) | `#93401A` | `#FFFFFF` | **7.03:1** (AAA) | $150\text{m} - 300\text{ m} \ @ \ 90 - 98\%$, $100 - 120\text{ m} \ @ \ 88 - 93\%$ |
| **Z4** | **Special Endurance 2 (SE2)** | Misto lattacido-aerobico severo ($40 - 90\text{ s}$) | `#F5CBA7` | `#1E1E1E` | **11.10:1** (AAA) | $300\text{m} - 600\text{ m} \ @ \ 85 - 98\%$ |
| **Z3** | **Intensive Tempo** | Glicolisi controllata $4 - 8\text{ mM}$ ($13 - 70\text{ s}$) | `#F9E79F` | `#1E1E1E` | **13.46:1** (AAA) | $50\text{m} - 250\text{ m} \ @ \ 78 - 88\%$, $300 - 600\text{ m} \ @ \ 75 - 83\%$ *(include 80m @ 83%)* |
| **Z2** | **Extensive Tempo & Capillarizzazione** | Ossidativo sub-$LT_2$, recupero attivo ($14 - 140\text{ s}$) | `#A9DFBF` | `#1E1E1E` | **11.11:1** (AAA) | $50\text{m} - 600\text{ m} \ @ \ 65 - 75\%$ *(con $50 - 120\text{ m} \ @ \ 70 - 75\%$)* |
| **Z1** | **Rigenerazione Aerobica Prolungata** | Ossidativo puro sub-$LT_1$ ($28 - 180\text{ s}$) | `#AED6F1` | `#1E1E1E` | **10.87:1** (AAA) | $150\text{m} - 600\text{ m} \ @ \ 50 - 60\%$ |
| **OFF** | **Zona Inattiva / Sub-Funzionale** | Non raccomandata: altera la stiffness del piede | `#EEEEEE` | `#616161` | **5.34:1** (AA) | $50\text{m} - 120\text{ m} \ @ \ \le 65\%$ *(Disattivata per perdita reattività)* |

---

## 3. Matrice 2D Aggiornata (13 Distanze × 17 Percentuali = 221 Celle)

La matrice bidimensionale $Z(d, p)$ è codificata nel file [palette_zone_fisiologiche_v2.csv](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/sidequests/sprint-ritmi-excel/output/palette_zone_fisiologiche_v2.csv) ed è applicata con formule vive in tutti i fogli atleta:

| Distanza | 100% | 98% | 95% | 93% | 90,0% | 88% | 85% | 83% | 80,0% | 78% | 75% | 73% | 70,0% | 65% | 60,0% | 55% | 50,0% |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **50 m** | **Z7** | **Z7** | **Z7** | **Z6** | **Z6** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z2** | **Z2** | OFF | OFF | OFF | OFF |
| **60 m** | **Z7** | **Z7** | **Z7** | **Z6** | **Z6** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z2** | **Z2** | OFF | OFF | OFF | OFF |
| **80 m** | **Z7** | **Z7** | **Z7** | **Z6** | **Z6** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z2** | **Z2** | OFF | OFF | OFF | OFF |
| **100 m** | **Z6** | **Z6** | **Z6** | **Z5** | **Z5** | **Z5** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z2** | **Z2** | OFF | OFF | OFF | OFF |
| **120 m** | **Z6** | **Z6** | **Z6** | **Z5** | **Z5** | **Z5** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z2** | **Z2** | OFF | OFF | OFF | OFF |
| **150 m** | **Z6** | **Z6** | **Z6** | **Z5** | **Z5** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z2** | **Z2** | **Z2** | **Z1** | **Z1** | **Z1** |
| **200 m** | **Z5** | **Z5** | **Z5** | **Z5** | **Z5** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z2** | **Z2** | **Z2** | **Z1** | **Z1** | **Z1** |
| **250 m** | **Z5** | **Z5** | **Z5** | **Z5** | **Z5** | **Z3** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z2** | **Z2** | **Z2** | **Z1** | **Z1** | **Z1** |
| **300 m** | **Z5** | **Z5** | **Z5** | **Z5** | **Z5** | **Z4** | **Z4** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z2** | **Z2** | **Z1** | **Z1** | **Z1** |
| **350 m** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z2** | **Z2** | **Z1** | **Z1** | **Z1** |
| **400 m** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z2** | **Z2** | **Z1** | **Z1** | **Z1** |
| **500 m** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z2** | **Z2** | **Z1** | **Z1** | **Z1** |
| **600 m** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z4** | **Z3** | **Z3** | **Z3** | **Z3** | **Z2** | **Z2** | **Z2** | **Z1** | **Z1** | **Z1** |

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
| Z3          | Intensive Tempo (Vittori / Hart)      |    58 |       26,2% | 13.46:1 AAA |
| Z2          | Extensive Tempo & Capillarizzazione   |    42 |       19,0% | 11.11:1 AAA |
| Z1          | Rigenerazione Aerobica Prolungata     |    24 |       10,9% | 10.87:1 AAA |
| OFF         | Zona Inattiva / Sub-Funzionale        |    20 |        9,0% | 5.34:1 AA   |
+---------------------------------------------------------------------------------------+
| TOTALE      | 13 Distanze x 17 Percentuali          |   221 |      100,0% | CONFORME    |
+---------------------------------------------------------------------------------------+
```

#### Considerazioni sulla Nuova Distribuzione
- **Riduzione delle Celle OFF dal 20,8% (46 celle) al 9,0% (20 celle):** La correzione ha restituito alla piena operatività didattica 26 celle di enorme valore sul campo (i tratti 50–80m tra il 70% e l'88%), eliminando l'errore di considerare "inutile" l'allenamento tecnico a ritmi submassimali sostenuti.
- **Predominanza dell'Intensive Tempo (Z3 - 26,2%):** Con 58 celle, Z3 diventa la zona quantitativamente più rilevante per volume di lavoro speciale: permette centinaia di metri di corsa senza saturare il sistema nervoso centrale.
- **Piramide Neurale Bilanciata:** La velocità massimale pura (Z7) e la potenza lattacida estrema (Z6) assorbono complessivamente il $10{,}9\%$ (24 celle), rispecchiando l'esatta proporzione biologica del carico ad alta intensità (High-Low di Charlie Francis).

---

## 4. Testo Riscritto delle Note di Campo nel Foglio Excel ("Legenda e Guida Mobile")

Tutti i testi esplicativi collocati a fondo pagina nel quarto foglio del file Excel sono stati integralmente riscritti per recepire:
1. La nuova nomenclatura invertita **Z7 (Top) -> Z1 (Base)**;
2. La sostituzione di ogni vecchio riferimento ("Z1/Z2 per la velocità pura" ora diventa espressamente **"Z7/Z6"**);
3. La spiegazione scientifica aggiornata sulla differenziazione tra **Z3 (80m @ 83%)** e **OFF ($\le 65\%$)**.

Di seguito il testo integrale implementato nel foglio:

### Blocco 1: Funzionalità Smart per Piccoli Schermi (Mobile & Tablet)
> 1. **Blocco Riquadri Bidirezionale (Freeze Panes `C9`):** quando scorri a destra verso le percentuali estensive, la colonna della distanza (A) e la colonna del massimale 100% (B) restano sempre ancorate e visibili sul lato sinistro dello schermo.  
> 2. Quando scorri verso il basso verso i 600m, l'intestazione delle percentuali (riga 8) resta sempre bloccata in alto.  
> 3. **Touch Targets (Altezza 21.5 pt):** righe rialzate per facilitare il tocco mirato con un solo dito, anche con guanti in pista o display bagnato.  
> 4. **Larghezza Colonne Compatta (6.4):** calibrata per consentire la visualizzazione simultanea di 11–12 colonne su display smartphone standard senza scrolling continuo.

---

### Blocco 2: Struttura Didattica e Gerarchia delle Zone (Z7 Top -> Z1 Base)
> - **Z7 (Rosso Mattone):** Massima Velocità ed Accelerazione Alattacida ($50 - 80\text{ m} \ @ \ 95 - 100\%$, $t \le 8\text{ s}$, ATP-PCr puro, fibre rapide IIx).  
> - **Z6 (Viola Prugna):** Potenza Lattacida & Speed Endurance ($100 - 150\text{ m} \ @ \ 95 - 100\%$, $50 - 80\text{ m} \ @ \ 90 - 93\%$, $VLa_{\max}$, glicolisi rapida).  
> - **Z5 (Terracotta):** Special Endurance 1 - SE1 ($150 - 300\text{ m} \ @ \ 90 - 98\%$, $100 - 120\text{ m} \ @ \ 88 - 93\%$, acidosi max, capacità lattacida $18 - 40\text{ s}$).  
> - **Z4 (Ambra Chiaro):** Special Endurance 2 - SE2 ($300 - 600\text{ m} \ @ \ 85 - 98\%$, resistenza alla velocità prolungata, misto severo $40 - 90\text{ s}$).  
> - **Z3 (Giallo Sabbia):** Intensive Tempo ($50 - 250\text{ m} \ @ \ 78 - 88\%$, $300 - 600\text{ m} \ @ \ 75 - 83\%$, decontrazione neurale, glicolisi controllata $4 - 8\text{ mM}$).  
> - **Z2 (Verde Salvia):** Extensive Tempo & Capillarizzazione ($50 - 600\text{ m} \ @ \ 65 - 75\%$, recupero attivo, ossidativo sub-$LT_2$, capillarizzazione).  
> - **Z1 (Azzurro Polvere):** Rigenerazione Aerobica Prolungata ($150 - 600\text{ m} \ @ \ 50 - 60\%$, ossidativo puro sub-$LT_1$, drenaggio metabolico).  
> - **OFF (Grigio Perla):** Zona Inattiva / Sub-Funzionale ($50 - 120\text{ m} \ @ \ \le 65\%$, disattivata per prevenire alterazione della stiffness).

---

### Blocco 3: Perché le Celle <= 65% sui Tratti Brevi Sono Disattivate (Zona OFF) e il Valore di Z3 (80m @ 83%)
> - Sotto il $65\%$ sui tratti brevi ($50 - 120\text{ m}$), un atleta corre a meno di $4{,}5 - 5{,}0\text{ m/s}$ ($16 - 18\text{ km/h}$). A questa andatura il tempo di contatto raddoppia ($T_c > 0{,}16\text{ s}$), l'appoggio rulla sul tallone e si distrugge la stiffness reattiva senza ottenere alcuno stimolo aerobico (che richiede sforzi continui prolungati o ripetute estese $\ge 200\text{ m}$). Tali celle sono desaturate in grigio (`OFF`).  
> - Al contrario, le prove submassimali al $78 - 88\%$ sui $50 - 100\text{ m}$ (incluso l'80m all'83%, che per un velocista da 10.8s corrisponde a $27{,}2\text{ km/h}$ e $T_c \approx 0{,}115\text{ s}$) appartengono a pieno titolo alla **ZONA 3 (Intensive Tempo)**: mantengono il Fast SSC, educano alla decontrazione muscolare senza co-contrazioni antagoniste parassite (metodo Carlo Vittori e Dan Pfaff) e stimolano la capacità lattacida controllata ($4 - 8\text{ mM}$).

---

### Blocco 4: Linee Guida Scientifiche d'Uso sul Campo
> - **Regola di Stop del 3% (SNC Fatigue Cutoff):** nelle sedute di velocità pura e potenza lattacida (**Z7/Z6**), interrompere la serie o aumentare il recupero non appena il crono registrato sale di oltre il $3\%$ rispetto al target (es. da $10{,}80\text{ s}$ a oltre $11{,}12\text{ s}$), per evitare fatica neurale parassita e deterioramento motorio.  
> - **Flying Start su Z3:** per prove tecniche di ritmo su $50\text{ m}, 60\text{ m}$ e $80\text{ m}$ al $78 - 88\%$ (**Z3**), adottare un avvio lanciato di $10 - 15\text{ m}$ per evitare che la fase di accelerazione statica iniziale alteri la velocità di crociera e la biomeccanica front-side.  
> - **Autoregolazione Dinamica:** modificando un massimale in Colonna B, tutte le 16 percentuali submassimali (da **Z7** a **Z1**) si ricalcolano istantaneamente tramite formula viva Excel (`=$B{riga}/C$8`).

---

## 5. Verifica Meccanica e Integrità del File Excel

L'audit automatico eseguito tramite lo script `sidequests/sprint-ritmi-excel/tools/verify_all.py` ha certificato:
1. **Formule Vive (624 celle):** Tutte le celle delle colonne `C..R` su Atleta 1, Atleta 2 e Atleta 3 contengono la formula esatta `=$B{riga}/C$8`. Zero valori statici o sovrascritti.
2. **Formattazione Numerica (675 celle):** Tutte le celle riportano `0.0` (un decimale), ad eccezione dei 50m all'83% che riportano `0.00` per visualizzare la risoluzione centesimale ($7{,}11\text{ s}$ vs $7{,}1\text{ s}$).
3. **Mappatura Cromatica WCAG AAA (663 celle):** Tutte le celle sono colorate esattamente in conformità ai codici HEX della palette v2 (`#9E2A2B`, `#6C3483`, `#93401A`, `#F5CBA7`, `#F9E79F`, `#A9DFBF`, `#AED6F1`, `#EEEEEE`).
4. **Foglio Legenda:** Verificato con gerarchia decrescente Z7 (riga 4) -> Z1 (riga 10) + OFF (riga 11).

---

## 6. Conclusioni Metodologiche per lo Staff Tecnico

La presente revisione didattica e funzionale risolve definitivamente ogni incoerenza tra teoria scientifica e pratica di campo:
1. Soddisfa la preferenza didattica dell'utente di porre **Z7 come massima intensità** e **Z1 come minima intensità**, standardizzando il linguaggio tra atleti e tecnici.
2. Riscatta la dignità dell'**80m all'83%** e delle prove submassimali brevi ($50 - 100\text{ m}$ al $78 - 88\%$), collocandole nel cuore dell'**Intensive Tempo (Z3)** quale strumento insostituibile di ritmizzazione, decontrazione muscolare e prevenzione degli infortuni agli ischiocrurali.
3. Mantiene la protezione biologica della **Zona OFF**, confinandola con rigore a ciò che è realmente privo di valore allenante ($\le 65\%$ sui tratti brevi).
4. Consegna uno strumento Excel nativo, reattivo, ergonomico e leggibile in qualsiasi condizione atmosferica a bordo pista.
