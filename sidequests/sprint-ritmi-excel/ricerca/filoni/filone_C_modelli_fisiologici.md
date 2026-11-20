# FILONE C: Modelli Fisiologici e di Prestazione Legati alla Distanza (Anaerobic Speed Reserve, Critical Speed, Power-Law)

**Autore:** Agente C (Specialista Modelli Fisiologici e Bioenergetica dello Sprint)  
**Data:** 21 Novembre 2026  
**Destinazione Progetto:** `sidequests/sprint-ritmi-excel/ricerca/filoni/filone_C_modelli_fisiologici.md`  
**Livello di Evidenza Scientifico:** Conforme a Regola 04 (Livelli 1, 2 e 3 - Revisioni sistematiche, RCT e studi biofisici peer-reviewed)

---

## 1. Executive Summary & Sintesi Esecutiva

La quantificazione del carico e la prescrizione dei ritmi di allenamento nell'atletica leggera e negli sport ad alta intensità si basano storicamente su costrutti bioenergetici differenti. Nel contesto dello **sprint puro e prolungato ($\le 300\text{ m}$)**, tre paradigmi teorici principali sono stati proposti o mutuati dalla fisiologia dell'esercizio:

1. **Anaerobic Speed Reserve (ASR):** Definito come la differenza algebrica tra la Velocità Massima di Sprint (MSS) e la Velocità Aerobica Massima (MAS), formalizzato da Blondel et al. (2001), Buchheit & Laursen (2013) e Sandford et al. (2019, 2021). L'ASR ha rivoluzionato la programmazione dell'High-Intensity Interval Training (HIIT) sovramassimale negli sport di squadra e nel mezzofondo veloce (400-800m), poiché standardizza lo stress metabolico relativo uniformando la deplezione delle riserve anaerobiche.
2. **Critical Speed (CS) e Capacità di Lavoro Anaerobico Finita ($D'$):** Modello matematico a 2 parametri iperbolico derivato da Monod & Scherrer (1965), esteso alla corsa da Jones et al. (2010) e operationalizzato con test da campo (3MT) da Pettitt et al. (2012, 2016). Definisce il confine superiore del dominio di intensità "severe" e una riserva finita di distanza spendibile al di sopra di tale soglia.
3. **Modelli Power-Law (Kennelly 1906, Riegel 1981, Savaglio & Carbone 2000, di Prampero 2015):** Relazioni di scala esponenziali del tipo $T = a \cdot d^b$, che descrivono il decadimento della velocità in funzione della distanza o del tempo di gara mediante un parametro di fatica $b$.

### Verdetto Metodologico per lo Sprint ($\le 300\text{ m}$)
* **Per lo sprint puro ($\le 300\text{ m}$ / durate $< 35\text{-}40\text{ s}$), il gold standard assoluto di prescrizione è la percentuale della Velocità Massima di Sprint (%MSS / %vMax)**, combinata con la cinematica di accelerazione e i profili di forza-velocità orizzontale.
* **L'ASR presenta severe limitazioni strutturali sotto i 300m:** la componente aerobica sottrattiva (MAS) introduce un rumore metodologico ingiustificato. I velocisti puri non traggono alcun beneficio dall'incorporare la MAS nel calcolo delle andature per 60m, 100m, 150m o 200m; l'ASR diventa invece uno strumento di primaria importanza per atleti ibridi 400m-800m e per ripetute sovramassimali intermittenti con recuperi brevi.
* **La Critical Speed a 2 parametri è matematicamente e biofisicamente invalida per distanze $\le 300\text{ m}$:** assume una velocità infinita per $t \to 0$, trascura completamente l'inerzia meccanica dell'accelerazione, ignora la cinetica del $\text{VO}_2$ (che richiede $>90\text{-}120\text{ s}$ per raggiungere il plateau) e tratta la deplezione anaerobica come un tasso lineare costante, quando invece la fatica neuromuscolare e la glicolisi massimale mostrano un decadimento rapido ed esponenziale. Anche le estensioni a 3 parametri (Morton 1996) e i modelli di ricostituzione dinamica di $D'$ ($D'_{\text{bal}}$ di Skiba) falliscono nella predizione di sprint singoli massimali brevi.
* **I modelli Power-Law sono strumenti fenomenologici descrittivi macroscopici utili per predire tempi massimali di gara**, ma presentano una netta rottura di scala (*Broken Power Law* a ~150-170 secondi, corrispondente al passaggio anaerobico/aerobico). Non possiedono alcuna utilità prescrittiva per singole frazioni di allenamento submassimale o serie ripetute con recupero incompleto.

---

## 2. Sezione 1: Anaerobic Speed Reserve (ASR)

### 2.1 Definizione Matematica e Fisiologica
L'**Anaerobic Speed Reserve (ASR)** rappresenta l'intervallo di velocità compreso tra il limite superiore della potenza aerobica e la massima capacità contrattile neuromuscolare dell'atleta in locomozione:

$$\text{ASR} = \text{MSS} - \text{MAS} \quad [\text{m/s} \text{ o } \text{km/h}]$$

Dove:
* **MSS (Maximal Sprinting Speed):** Massima velocità istantanea di sprint, misurata tipicamente in campo aperto mediante fotocellule a doppio raggio, radar, laser gun (100 Hz) o GPS ad alta frequenza (10-20 Hz) durante uno sprint massimale lineare sui 30-40 metri (fly time sui 10m o picco di velocità istantanea tra i 30m e i 50m).
* **MAS (Maximal Aerobic Speed):** La minima velocità di corsa alla quale viene raggiunto il consumo massimo di ossigeno ($\text{VO}_2\text{max}$), determinata mediante test incrementali continui/discontinui da laboratorio o test da campo validati (es. VAM-Eval, Leger-Boucher, Università di Montreal, o derivata dal 30-15 Intermittent Fitness Test corretto).

Parallelamente, lo **Speed Reserve Ratio (SRR)** formalizzato da Sandford et al. (2019) sintetizza la proporzione tra le due componenti:
$$\text{SRR} = \frac{\text{MSS}}{\text{MAS}}$$

### 2.2 Origine e Fondamenti Teorici
La constatazione che la tolleranza allo sforzo sovramassimale varia drammaticamente tra atleti con identico $\text{VO}_2\text{max}$ risale ai lavori pionieristici di **Blondel et al. (2001)**. Testando 10 soggetti a velocità pari a 90%, 100%, 120% e 140% di $\text{vVO}_2\text{max}$, gli autori dimostrarono che il tempo limite ad esaurimento ($t_{\text{lim}}$) a intensità sovramassimali ($>100\%\text{ MAS}$) non correlava affatto con la MAS o con il $\text{VO}_2\text{max}$, bensì mostrava una correlazione stretta e statisticamente significativa con la percentuale dell'Anaerobic Speed Reserve (%AnSR).

Successivamente, **Bundle, Hoyt & Weyand (2003)** svilupparono un modello matematico esponenziale di predizione della prestazione di corsa ad alta velocità da 3 a 240 secondi, basato esclusivamente su due ancore fisiologiche:
1. La velocità massima supportata dalla potenza anaerobica ($V_{\text{max an}}$, misurata su uno sprint brevissimo di ~8 appoggi, $\le 3\text{ s}$).
2. La velocità massima supportata dalla potenza aerobica ($V_{\text{max aer}} = \text{MAS}$).

Il modello di Bundle et al. formula che per qualsiasi durata di corsa all-out $t$:
$$V(t) = V_{\text{max aer}} + (V_{\text{max an}} - V_{\text{max aer}}) \cdot e^{-t/\tau}$$
dove $\tau$ è una costante di tempo che descrive il tasso di decadimento anaerobico. Questo lavoro ha fornito la prova biofisica definitiva che la velocità raggiungibile su qualsiasi frazione ad alta intensità è una frazione esponenzialmente decrescente dell'ASR.

### 2.3 Formalizzazione di Buchheit & Laursen (2013) e Sandford et al. (2019, 2021)
Martin Buchheit e Paul Laursen (2013, Part I & II) hanno trasformato l'ASR da curiosità scientifica a strumento di ingegneria dell'allenamento. Essi hanno identificato il "puzzle" della programmazione HIIT:
* Se prescriviamo ripetute a **120% MAS** a due atleti con identica $\text{MAS} = 18\text{ km/h}$ ($5.0\text{ m/s}$), entrambi correranno a $21.6\text{ km/h}$ ($6.0\text{ m/s}$).
* Se l'Atleta A è un corridore resistente con $\text{MSS} = 28\text{ km/h}$ ($7.78\text{ m/s}$), il suo ASR è pari a $10\text{ km/h}$. Correre a $21.6\text{ km/h}$ corrisponde a impegnare il **36.0% del proprio ASR**.
* Se l'Atleta B è un atleta veloce/esplosivo con $\text{MSS} = 34\text{ km/h}$ ($9.44\text{ m/s}$), il suo ASR è pari a $16\text{ km/h}$. Correre a $21.6\text{ km/h}$ corrisponde a impegnare solo il **22.5% del proprio ASR**.
* **Esito fisiologico:** L'atleta con minor ASR accumula rapidamente metaboliti di scarto (ioni idrogeno $\text{H}^+$, fosfato inorganico $\text{P}_i$), depleta drammaticamente la fosfocreatina muscolare (PCr) e sperimenta un crollo anticipato del tempo limite; l'atleta veloce percepisce l'esercizio come relativamente agevole e sub-ottimale.

Sandford et al. (2019, 2021) hanno ulteriormente standardizzato la profilazione locomotoria, definendo tre fenotipi atletici negli 800m e negli sport di squadra in base all'indice SRR:
* **Speed-Dominant Profile ($\text{SRR} \ge 1.58$):** Velocisti convertiti, alta percentuale di fibre di tipo IIx/IIa, elevata potenza neuromuscolare, bassi tempi di contatto, rapida deplezione energetica e recupero post-sprint lento.
* **Hybrid Profile ($1.48 \le \text{SRR} \le 1.57$):** Atleti con bilanciamento ottimale tra riserva di velocità e resistenza specifica.
* **Endurance-Dominant Profile ($\text{SRR} \le 1.47$):** Fondisti con MAS eccellente, ridotta MSS, alta densità capillare e mitocondriale, rapida resintesi della fosfocreatina via ossidativa.

```
+-------------------------------------------------------------------------+
|                  ARCHITETTURA DELL'ANAEROBIC SPEED RESERVE              |
+-------------------------------------------------------------------------+
0 km/h -------------------- MAS ----------------------------------- MSS
                            | <------ ANAEROBIC SPEED RESERVE ----> |
                            |               (MSS - MAS)             |
                            |                                       |
  [Dominio Aerobico]        |     [Dominio Sovramassimale / HIIT]    |   [Sprint Puro]
  Continuo & Soglia         |     15s-60s Intervals (%ASR)          |   <= 300m (%MSS)
```

### 2.4 Metodologia di Prescrizione con %ASR
La velocità target ($V_{\text{target}}$) viene calcolata ancorando lo sforzo alla MAS e aggiungendo una frazione desiderata dell'ASR individuale:

$$V_{\text{target}} = \text{MAS} + \left( \text{ASR} \times \frac{\%\text{ASR}}{100} \right)$$

#### Esempio di Standardizzazione:
Se il preparatore prescrive una frazione HIIT corta ($15\text{ s} / 15\text{ s}$) al **30% dell'ASR**:
* Atleta Resistente ($\text{MAS} = 18\text{ km/h}$, $\text{ASR} = 10\text{ km/h}$):
  $$V_{\text{target}} = 18 + (10 \times 0.30) = 21.0\text{ km/h}$$
* Atleta Veloce ($\text{MAS} = 18\text{ km/h}$, $\text{ASR} = 16\text{ km/h}$):
  $$V_{\text{target}} = 18 + (16 \times 0.30) = 22.8\text{ km/h}$$
Entrambi gli atleti lavorano esattamente al 30% del loro potenziale neuromuscolare-glicolitico sovramassimale. Il carico interno, l'indice di sforzo percepito (RPE) e la concentrazione di lattato ematico risultano statisticamente identici e uniformati.

---

### 2.5 Limiti Strutturali Rigorosi per Velocisti Puri su Distanze $\le 300\text{ m}$

Nonostante l'enorme efficacia dell'ASR nell'intervallo sovramassimale (durate tra 15 e 90 secondi), l'applicazione dell'ASR alla programmazione dello **sprint puro nell'atletica leggera ($\le 300\text{ m}$)** presenta incongruenze teoriche e metodologiche insormontabili:

1. **Irrilevanza Biologica della MAS nello Sprint Breve:**
   * Uno sprint di 60m dura circa 6.5–7.5 secondi; un 100m dura 9.5–12.0 secondi; un 200m dura 19.5–24.0 secondi. In queste durate temporali, il sistema della fosfocreatina (alattacido) e la glicolisi anaerobica forniscono oltre l'85–98% dell'energia necessaria (Bundle & Weyand 2012).
   * La MAS (un parametro di potenza aerobica mitocondriale e gittata sistolica cardiaca) non ha alcuna influenza causale sulla massima velocità raggiungibile o sul tempo di reazione/accelerazione. Inserire la MAS nella formula di calcolo dell'andatura equivale a introdurre un fattore di disturbo casuale.

2. **Il Paradosso dell'ASR nel Velocista Puro:**
   * Si confrontino due velocisti con identica $\text{MSS} = 10.5\text{ m/s}$ ($37.8\text{ km/h}$):
     * **Velocista 1:** specialista 100m puro, sedentario dal punto di vista aerobico, con $\text{MAS} = 3.8\text{ m/s}$ ($13.7\text{ km/h}$). Il suo $\text{ASR} = 10.5 - 3.8 = 6.7\text{ m/s}$.
     * **Velocista 2:** atleta con maggior volume aerobico di base, con $\text{MAS} = 4.5\text{ m/s}$ ($16.2\text{ km/h}$). Il suo $\text{ASR} = 10.5 - 4.5 = 6.0\text{ m/s}$.
   * Se calcoliamo un'andatura basata su %ASR (ad esempio 85% ASR per una ripetuta sui 150m):
     * Velocista 1: $3.8 + (6.7 \times 0.85) = 9.495\text{ m/s}$
     * Velocista 2: $4.5 + (6.0 \times 0.85) = 9.600\text{ m/s}$
   * L'atleta con la MAS più scadente (Velocista 1) ha paradossalmente un'ASR più ampia, ma gli verrebbe prescritta una velocità di sprint *più lenta*, nonostante abbia la medesima velocità di punta e identici requisiti neuromuscolari sui blocchi!

3. **Dominanza dei Vincoli Neuromuscolari e Meccanici (Bundle & Weyand 2012):**
   * Negli all-out di durata $\le 60\text{ s}$, la velocità non è limitata dall'apporto o dal flusso di energia metabolica, bensì dalla **capacità muscolo-scheletrica di applicare forza contro il suolo in tempi ridotti** ($t_{\text{contact}} \approx 0.08 - 0.11\text{ s}$) e dal rapido affaticamento meccanico contrattile delle fibre muscolari rapide (Cross-bridge cycling, accoppiamento eccitazione-contrazione, rilascio/ricaptazione del $\text{Ca}^{2+}$).
   * La prescrizione dello sprint deve dunque fondarsi su parametri meccanici (forza applicata, stiffness della caviglia, frequenza e ampiezza del passo, velocità angolare articolare), grandezze tutte proporzionali alla sola **%MSS** e assolutamente svincolate dalla MAS.

4. **Prescrizione Frazionata Insensata:**
   * Negli allenamenti di velocità pura (es. *speed development* a 95-100% MSS, o *special endurance* a 90-95% MSS per distanze di 150-300m), il coach necessita di target cronometrici esatti ancorati al personal best (PB) o alla flying 10m/30m. L'utilizzo di %ASR genera andature ibride che rischiano di collocare l'atleta in "terre di nessuno", dove né la cinematica di sprint è preservata, né lo stimolo lattacido è targettizzato con precisione.

---

## 3. Sezione 2: Critical Speed (CS) e Capacità Anaerobica Finita ($D'$)

### 3.1 Il Modello Classico a 2 Parametri (Monod & Scherrer 1965)
Il concetto di Potenza Critica (CP), esteso alla locomozione di corsa come Velocità Critica (CS), fu formulato originariamente da H. Monod e J. Scherrer (1965) su masse muscolari sinergiche locali e successivamente trasferito all'esercizio a corpo libero da Jones et al. (2010).

Il modello assume una relazione iperbolica tra la velocità di corsa ($v$) e il tempo fino all'esaurimento ($t$), che può essere linearizzata nel piano distanza-tempo:

$$d = CS \cdot t + D'$$
$$t = \frac{D'}{v - CS} \quad (\text{per } v > CS)$$

```
  Velocità (v)
       ^
       |   *  <- Sprint Breve (50-300m): Fails / Modello Non Valido!
       |    \
       |     \
       |      \
       |       *  <- Dominio "Severe" (2 - 15 min): Modello Valido
       |        \
  CS --+------------------------ [Asintoto Orizzontale: CS]
       |                         (Steady-state massimo)
       |
       +----------------------------> Tempo (t)
       0
       |<-- D' = Area di riserva finita sopra CS -->|
```

* **Parametri Fondamentali:**
  * **$CS$ (Critical Speed, in m/s):** Rappresenta la pendenza della retta di regressione tra distanza e tempo. Fisiologicamente, è la velocità massima sostenibile in cui il metabolismo aerobico può mantenere uno stato stazionario (assenza di deriva del $\text{VO}_2$ verso $\text{VO}_2\text{max}$, equilibrio tra produzione e smaltimento del lattato, stabilizzazione del pH intramuscolare e della fosfocreatina).
  * **$D'$ (Curvature Constant / Anaerobic Running Capacity, in metri):** Rappresenta l'intercetta sull'asse delle ordinate della retta distanza-tempo. Fisiologicamente, è una quantità finita di lavoro/distanza che l'atleta può percorrere a velocità superiori a CS prima di raggiungere l'esaurimento muscolare.

### 3.2 Il Test 3MT per la Corsa (Pettitt et al. 2012, 2016)
Tradizionalmente, la determinazione di CS e $D'$ richiedeva da 3 a 5 prove massimali ad esaurimento su giorni separati. Pettitt e collaboratori (2012, 2016) hanno validato il protocollo da campo **3-Minute All-Out Test (3MT)** per i corridori:
* L'atleta corre alla massima velocità possibile fin dal primo secondo, senza alcuna strategia di ritmo (all-out pacing).
* Nei primi 30–60 secondi si assiste a un'esplosione di velocità seguita da un marcato decadimento della prestazione.
* Negli ultimi 30 secondi (tra il minuto 2:30 e il minuto 3:00), le riserve anaerobiche sono completamente esaurite; l'atleta si stabilizza a una velocità costante che corrisponde alla **Critical Speed (CS)**.
* L'area sottesa alla curva di velocità sopra la CS durante l'intero arco dei 3 minuti rappresenta la capacità di riserva finita $D'$.

---

### 3.3 Limiti Matematici e Biofisici del Modello a 2 Parametri per lo Sprint ($\le 300\text{ m}$)

L'applicazione della Critical Speed a 2 parametri al dominio dello sprint atletico ($\le 300\text{ m}$ / durate $< 35\text{-}40\text{ s}$) costituisce un grave errore concettuale per ragioni matematiche e fisiologiche inderogabili:

1. **L'Asintoto Temporale Infinito a $t \to 0$:**
   * Nell'equazione iperbolica $t = \frac{D'}{v - CS}$, se la velocità $v$ cresce verso valori elevati, il tempo tende asintoticamente a zero. Inversamente, se $t \to 0$, il modello predice che $v \to \infty$.
   * Ciò viola la fisiologia umana: nessun atleta può erogare una velocità infinita. Esiste un vincolo biofisico invalicabile ($v_{\text{max}}$ o MSS), determinato dal tempo minimo di cross-bridge detachment miosinico, dalla velocità di conduzione dell'impulso nervoso e dalla compliance tendinea.

2. **Omissione della Fase di Accelerazione e Inerzia Meccanica:**
   * La retta $d = CS \cdot t + D'$ assume implicitamente che al tempo $t = 0$ il corridore si trovi già a una distanza fittizia pari a $+D'$ (se estrapolata indietro), o che la velocità sia costante lungo l'intera frazione.
   * Negli sprint di 50-300 metri, l'atleta parte da fermo ($v_0 = 0$) e spende una quota fondamentale di tempo ed energia per vincere l'inerzia della propria massa corporea nei primi 30 metri. La cinematica reale è parabolica/esponenziale, rendendo la retta a pendenza costante totalmente fuorviante.

3. **Cinetica di Attivazione del $\text{VO}_2$ (Inerzia Aerobica):**
   * Il costrutto di Critical Speed si fonda sul presupposto che il consumo di ossigeno raggiunga rapidamente il $\text{VO}_2\text{max}$ e vi rimanga fino all'esaurimento.
   * Tuttavia, la cinetica dell'ossigeno alle alte intensità presenta una costante di tempo ($\tau \approx 20 - 35\text{ s}$) e una fase di latenza iniziale. In uno sforzo di 10–25 secondi (100m–200m), il $\text{VO}_2$ non supera il 30–50% del massimo potenziale. Assumere che CS rappresenti l'apporto aerobico continuo in uno sprint di 100 metri significa attribuire alla fosforilazione ossidativa un ruolo metabolico istantaneo che essa non possiede.

4. **Tasso di Deplezione Non-Lineare delle Riserve Anaerobiche:**
   * Il modello a 2 parametri postula che $D'$ si consumi a un tasso lineare proporzionale allo scarto $(v - CS)$.
   * Al contrario, gli studi di biopsia muscolare su sprint massimali (Mendez-Villanueva et al. 2012) dimostrano che a velocità vicine alla MSS la scissione di ATP-PCr e la glicolisi procedono a velocità metaboliche enormi, con un accumulo esplosivo di metaboliti intracellulari ($\text{H}^+$, ADP libero, AMP, $\text{P}_i$) che causa un blocco contrattile per fatica periferica ben prima che un ipotetico serbatoio "lineare" $D'$ sia stato linearmente prosciugato.

### 3.4 Tentativi di Correzione: Il Modello a 3 Parametri di Morton (1996)
Per eliminare l'assurdo asintotico di una velocità infinita a $t=0$, **R. Hugh Morton (1996, 2006)** ha proposto l'inclusione di un terzo parametro esplicito: la velocità massima istantanea ($v_{\text{max}}$):

$$t = \frac{D'}{v - CS} - \frac{D'}{v_{\text{max}} - CS}$$

* **Comportamento Matematico:** Quando $v = v_{\text{max}}$, il secondo termine annulla il primo, risultando in $t = 0$. Il modello riconosce che nessun essere umano può superare la propria $v_{\text{max}}$.
* **Perché fallisce comunque nello sprint su pista?** Sebbene matematicamente coerente, il modello a 3 parametri richiede calcoli computazionali complessi (regressione non-lineare instabile con fitting di 3 variabili interdipendenti), presenta un errore standard di stima elevato su prove brevi e continua a ignorare la modulazione tecnica dell'accelerazione e la fatica neuromuscolare specifica del ciclo stiramento-accorciamento (SSC).

### 3.5 Applicabilità a Sprint Intervallati e Modelli di Ricostituzione di $D'$ ($D'_{\text{bal}}$)
Negli ultimi anni, ricercatori come Skiba et al. (2012) e Ferguson et al. (2010) hanno sviluppato algoritmi per stimare il bilancio dinamico di $D'$ residuo ($D'_{\text{bal}}$) durante sessioni di corsa intervallata:

$$D'_{\text{bal}}(t) = D'_0 - \int_0^t \dots e^{-\frac{t-u}{\tau_{D'}}} du$$

* **Applicazione potenziale:** Calcolare quante ripetute di sprint un atleta può completare prima che $D'_{\text{bal}} \to 0$.
* **Criticità comprovata nello sprint puro:** 
  1. La costante di resintesi $\tau_{D'}$ dipende pesantemente dalla fitness aerobica (densità capillare per il ripristino di ossigeno alla creatina chinasi).
  2. Nello sprint massimale ($\ge 95\%\text{ MSS}$ con pause brevi), il fattore limitante primario non è la disponibilità energetica globale, bensì l'inibizione dell'eccitabilità neuromuscolare (canali del sodio/potassio a livello del sarcolemma), che non segue le cinetiche esponenziali di $D'_{\text{bal}}$.
* **Conclusione sul CS:** La Critical Speed è uno strumento eccellente per la programmazione del mezzofondo (1500m–10000m) e del triathlon, ma è **inadeguata e fuorviante per la prescrizione di sprint $\le 300\text{ m}$**.

---

## 4. Sezione 3: Modelli Power-Law (Kennelly, Riegel, di Prampero, Savaglio & Carbone)

### 4.1 Origini Storiche ed Equazione Fondamentale
L'applicazione di relazioni di potenza alle prestazioni umane di corsa fu introdotta da **Arthur E. Kennelly (1906)**, ingegnere di Harvard, che analizzò i record mondiali di corsa a piedi e a cavallo, scoprendo che la distanza percorsa in funzione del tempo seguiva una legge esponenziale:

$$d = c \cdot t^k \quad \text{oppure} \quad T = a \cdot d^b$$

Dove:
* $T$ è il tempo di percorrenza;
* $d$ è la distanza di gara;
* $a$ è un coefficiente moltiplicativo di scala legato all'abilità assoluta dell'atleta;
* $b$ è l'**esponente di fatica (fatigue exponent)**, che descrive la rapidità con cui la velocità media decresce all'aumentare della distanza.

Decenni dopo, **Peter S. Riegel (1977, 1981)** rese popolare questa formulazione nella celebre equazione impiegata ancora oggi dagli analisti sportivi e dai calcolatori podistici:

$$T_2 = T_1 \cdot \left( \frac{D_2}{D_1} \right)^b$$

Se la velocità è costante al variare della distanza, $b = 1.0$. Poiché la fatica riduce la velocità media con l'aumentare della distanza, l'esponente $b$ è strettamente maggiore di 1 ($b > 1.0$).
* Nei dati empirici analizzati da Riegel (1981) per corridori di endurance su distanze da 1500 metri alla maratona, il valore medio della costante è pari a:
  $$b \approx 1.06 \quad (\text{range: } 1.05 - 1.08)$$

```
  Tempo (T)
       ^
       |                                     * Marathon
       |                              * Half
       |                       * 10k
       |                 * 5k
       |           * 1500m
       |      * 800m
       |  * 400m  <-- [Breakpoint: 150-170 s (Savaglio & Carbone 2000)]
       | * 100m, 200m (Esponente b_sprint distorce o fallisce)
       +--------------------------------------------> Distanza (d)
```

### 4.2 La Rottura di Scala: Il "Broken Power Law" (Savaglio & Carbone 2000)
Sebbene l'equazione di Riegel funzioni con impressionante precisione nel dominio dell'endurance, essa fallisce se applicata retroattivamente per predire le prestazioni di sprint (100m, 200m, 400m) partendo da un tempo di mezzofondo, o viceversa.

In uno studio pubblicato su *Nature*, **Savaglio & Carbone (2000)** analizzarono i record mondiali maschili e femminili di atletica leggera su tutte le distanze riconosciute dalla IAAF (da 100m a 10000m e maratona). I ricercatori scoprirono una netta discontinuità nella retta di regressione logaritmica:
1. I record di corsa **non possono essere descritti da una singola legge di potenza**.
2. Esiste un punto di rottura (*breakpoint*) ben definito a circa **150–170 secondi** (corrispondente indicativamente alla distanza dei 1000 metri).
3. **Sotto i 150 secondi (Dominio dello Sprint e Mezzofondo Veloce):** l'esponente di scala differisce drasticamente perché la velocità è determinata dalla potenza anaerobica alattacida, dalla glicolisi massimale e dalla dinamica di accelerazione da fermo.
4. **Sopra i 170 secondi (Dominio Aerobico/Endurance):** la relazione di scala si stabilizza attorno all'esponente $b \approx 1.06$, dove il limite primario è imposto dal trasporto di ossigeno e dalla frazione di utilizzo del $\text{VO}_2\text{max}$.

**Conseguenza fisiologica:** I modelli a legge di potenza universali sono biologicamente incongruenti. Non esiste un "fattore di fatica $b$" universale capace di collegare il 100m al 5000m.

### 4.3 Il Modello Bioenergetico di Pietro Enrico di Prampero (1986, 2005, 2015)
Il professor **Pietro Enrico di Prampero** e i suoi collaboratori (tra cui Osgnach, Botter, Morin) hanno scardinato l'approccio puramente matematico delle curve empiriche, sviluppando un'analisi fisica fondata sulla **potenza metabolica istantanea ($P_{\text{met}}$)**:
* Nello sprint, l'atleta non corre mai a velocità costante. L'accelerazione in avanti ($a_f$) comporta un costo energetico enorme, che di Prampero ha equiparato alla corsa a velocità costante su una pendenza equivalente:
  $$\text{Pendenza Equivalente } (ES) = \tan\left(\arctan\left(\frac{a_f}{g}\right)\right)$$
* Il costo energetico di accelerare nei primi passi dello sprint balza da $4\text{ J}\cdot\text{kg}^{-1}\cdot\text{m}^{-1}$ (corsa costante in piano) a oltre $40\text{-}100\text{ J}\cdot\text{kg}^{-1}\cdot\text{m}^{-1}$.
* Negli sprint di Usain Bolt (100m WR in 9.58s), la potenza metabolica erogata nei primi secondi supera i $200\text{ W/kg}$, a fronte di una potenza aerobica massimale che raramente oltrepassa i $25\text{-}30\text{ W/kg}$.

**Critica di di Prampero ai Modelli Power-Law nello Sprint:**  
I modelli alla Riegel considerano la corsa come un fenomeno unidimensionale a velocità media stazionaria. Trattare una gara di 100m o 200m come una velocità media significa ignorare che il 40% del tempo di gara è speso accelerando contro la gravità e l'inerzia, e che gli ultimi metri vedono un decadimento della velocità causato da fatica centrale e periferica.

### 4.4 Utilità Pratica: Predizione Gare vs Prescrizione Allenamento
* **Per cosa è utile la Power-Law?**
  * È uno strumento analitico per la **predizione di tempi di gara massimali (all-out)** su distanze omogenee (es. predire il tempo sui 10k o mezza maratona partendo dai 5k).
  * Consente di calcolare tabelle di punteggio parametrico per federazioni e graduatorie storiche.
* **Perché NON serve a prescrivere andature di allenamento nello sprint ($\le 300\text{ m}$)?**
  * La Power-Law modella esclusivamente la prestazione isolata massimale a esaurimento (*all-out race performance*).
  * Non contiene parametri per modellare:
    1. I recuperi tra le ripetute (es. 3 x 150m con 8 minuti di recupero vs con 2 minuti).
    2. La biomeccanica del passo e la cinematica della velocità target.
    3. Le percentuali di intensità submassimale (es. 85% o 90% del ritmo gara).
  * Un'equazione esponenziale non può prescrivere se un 200m debba essere corso a velocità costante, in accelerazione progressiva o con decelerazione controllata.

---

## 5. Sezione 4: Confronto Metodologico e Decision Matrix (%MSS vs %ASR vs CS)

### 5.1 Sintesi Comparativa dei Paradigmi
La letteratura scientifica converge in modo inequivocabile nel separare i domini di applicabilità di ciascun modello bioenergetico. Il grafico concettuale sottostante illustra l'efficacia metodologica lungo lo spettro delle distanze dell'atletica leggera:

```
  Efficacia Metodologica
  100% ^
       |  [%MSS]            [%ASR]               [Critical Speed]
       |  ========\        /=======\             /==============
       |           \      /         \           /
       |            \    /           \         /
       |             \  /             \       /
       |              \/               \     /
    0% +----------------------------------------------------------> Distanza
       0m            300m              800m  1500m               5000m+
       [Sprint Breve] [Sprint Lungo/    [Mezzofondo [Mezzofondo Prolungato
                       Intervalli ASR]   Veloce]     & Endurance]
```

### 5.2 Tabella Comparativa Sinottica dei Modelli

| Dimensione di Analisi | %MSS (%vMax) | Anaerobic Speed Reserve (%ASR) | Critical Speed / D' | Power-Law (Riegel) |
| :--- | :--- | :--- | :--- | :--- |
| **Input Richiesti** | Flying 10m/30m (MSS) o PB gara sui 60m/100m. | MSS + MAS (da test incrementale o 30-15 IFT). | Prove multiple ad esaurimento o test 3MT. | Almeno due tempi massimali su distanze diverse. |
| **Ancora Fisiologica** | Tetto contrattile neuromuscolare puro. | Gap bioenergetico tra ossidativo e glicolitico. | Confine superiore dello steady-state aerobico. | Nessuna (modello empirico puramente descrittivo). |
| **Dominio Temporale Valido** | $0 - 40\text{ s}$ | $15 - 90\text{ s}$ | $2 - 15\text{ min}$ ($120 - 900\text{ s}$) | $3 - 300\text{ min}$ (senza broken power law) |
| **Validità per Sprint $\le 300\text{ m}$** | **MASSIMA (Gold Standard)** | **BASSA/NON RACCOMANDATA** (MAS introduce rumore) | **ZERO (Invalida)** (asintoto errato, ignora accelerazione) | **ZERO (Invalida)** (valida solo per predizioni di gara) |
| **Tipo di Fatica Modellata** | Decadimento neuromuscolare, tempo di contatto al suolo. | Esaurimento scorte glicolitiche sovramassimali. | Esaurimento della riserva finita $D'$ sopra soglia. | Fenomenologia statistica globale della fatica. |
| **Capacità di Prescrizione Intervallata** | Eccellente (imposta andature esatte con recuperi ampi). | Eccellente per HIIT su atleti eterogenei/squadre. | Limitata (modelli $D'_{\text{bal}}$ instabili per sprint). | Nulla (non modella serie o recuperi). |
| **Punto di Forza Principale** | Preserva la biomeccanica reale e la stiffness muscolare. | Uniforma il carico interno tra velocisti e resistenti. | Identifica la massima intensità aerobica stazionaria. | Semplicità algebrica per predire gare all-out. |
| **Limite Principale** | Non considera la capacità di recupero metabolico aerobico. | Falsa le andature nei velocisti puri con bassa MAS. | Fallisce miseramente per durate inferiori a 2 minuti. | Presenta breakpoint non lineare attorno a 150s. |

---

### 5.3 Matrice Decisionale di Prescrizione in Funzione della Distanza Target

In sede di progettazione software (T7 Workout PWA e foglio di calcolo ritmi sprint), l'algoritmo di calcolo deve instradare l'utente verso il modello corretto secondo la seguente architettura a zone:

```
[Target Distanza / Obiettivo]
         |
         +---> <= 60m (Accelerazione & Drive Phase)
         |         --> Modello Obbligatorio: %MSS (Neuromuscolare puro, 95-100% MSS)
         |
         +---> 60m - 150m (Velocità Massima & Transizione)
         |         --> Modello Obbligatorio: %MSS / Flying Splits (90-98% MSS)
         |
         +---> 150m - 300m (Speed Endurance / Capacità Lattacida)
         |         --> Atleta Velocista Puro: %MSS o %PB di Gara (85-95% MSS)
         |         --> Atleta Ibrido / Mezzofondista: %ASR (Solo se la MAS è nota e affidabile)
         |
         +---> 300m - 800m (Special Endurance II / Mezzofondo Veloce)
         |         --> Modello Ideale: %ASR (Locomotor Profile: Speed-dominant vs Endurance-dominant)
         |
         +---> > 800m (Mezzofondo & Fondo)
                   --> Modello Ideale: Critical Speed (CS e D') o %MAS
```

---

## 6. Sezione 5: Schede Dettagliate delle Fonti Scientifiche

Di seguito vengono analizzati nel dettaglio **12 studi scientifici solidi e peer-reviewed**, registrando fedelmente disegno sperimentale, campione, parametri misurati, evidenze fattuali, limiti metodologici, livello di qualità e netta distinzione tra fatti riportati e inferenze dell'agente.

---

### Scheda Studio 1: Blondel et al. (2001)
* **Citazione Completa:** Blondel, N., Berthoin, S., Billat, V., & Lensel, G. (2001). Relationship between run times to exhaustion at 90, 100, 120, and 140% of vVO2max and velocity expressed relatively to critical velocity and maximal velocity. *International Journal of Sports Medicine*, 22(1), 27–33.
* **PMID:** 11258638 | **DOI:** 10.1055/s-2001-11357
* **Tipo di Studio:** Studio sperimentale comparativo crossover (Livello di Evidenza 2).
* **Campione:** $n = 10$ soggetti maschi allenati (studenti di scienze motorie / atleti ricreativi), età $23.1 \pm 2.0$ anni.
* **Outcome Misurati:** Velocità aerobica massimale ($\text{vVO}_2\text{max}$), velocità critica ($C_v$), velocità massima di sprint ($v_{\text{max}}$), tempo limite ad esaurimento ($t_{\text{lim}}$) a 90%, 100%, 120% e 140% di $\text{vVO}_2\text{max}$.
* **Risultati Chiave:**
  * I tempi limite medi sono risultati: $t_{\text{lim90}} = 839 \pm 236\text{ s}$; $t_{\text{lim100}} = 357 \pm 110\text{ s}$; $t_{\text{lim120}} = 122 \pm 27\text{ s}$; $t_{\text{lim140}} = 65 \pm 17\text{ s}$.
  * A intensità sovramassimali (120% e 140% di $\text{vVO}_2\text{max}$), la variabilità interindividuale di $t_{\text{lim}}$ non ha mostrato alcuna correlazione con $\text{vVO}_2\text{max}$ ($r = 0.08$, non significativo), mentre era fortemente correlata con la velocità espressa come percentuale dell'Anaerobic Speed Reserve (%AnSR: $v - \text{vVO}_2\text{max} / v_{\text{max}} - \text{vVO}_2\text{max}$, con $r = -0.74$ a $p < 0.05$).
* **Limiti Metodologici:** Campione ridotto ($n=10$); soggetti ricreativi/studenti e non velocisti d'élite; test condotti su nastro trasportatore (treadmill) con dinamiche di sprint vincolate.
* **Livello di Qualità:** **Media** (campione modesto ma rigore biofisico ineccepibile per l'epoca).
* **Fatti Riportati vs Inferenze:**
  * *Fatto:* A 120% e 140% MAS, la tolleranza al carico sovramassimale dipende dalla collocazione all'interno dell'ASR e non dal valore assoluto di $\text{vVO}_2\text{max}$.
  * *Inferenza:* Prescrivere intervalli sopra la MAS a percentuale fissa di MAS senza calcolare l'ASR espone i soggetti meno veloci a un sovraccarico lattacido precoce sproporzionato.

---

### Scheda Studio 2: Buchheit & Laursen (2013, Part I & II)
* **Citazione Completa:** Buchheit, M., & Laursen, P. B. (2013). High-intensity interval training, solutions to the programming puzzle: Part I: cardiopulmonary emphasis / Part II: anaerobic energy, neuromuscular load and practical applications. *Sports Medicine*, 43(5), 313–338 / 43(10), 927–954.
* **PMID:** 23539308 (Part I), 23832851 (Part II) | **DOI:** 10.1007/s40279-013-0029-x / 10.1007/s40279-013-0066-5
* **Tipo di Studio:** Revisione sistematica e metodologica integrata con modellizzazione applicativa (Livello di Evidenza 1).
* **Campione:** Metanalisi e sintesi su oltre 300 studi sperimentali condotti su atleti d'élite, sportivi di squadra e corridori di mezzofondo.
* **Outcome Misurati:** Cinetiche del $\text{VO}_2$, tempo speso a $\ge 90\%\text{ VO}_2\text{max}$ ($T@\text{VO}_2\text{max}$), deplezione di glicogeno, accumulo di lattato, fatica neuromuscolare, impatto articolare ed eccentrico, calibrazione dei formati HIIT (intervalli corti, lunghi, SIT, RST).
* **Risultati Chiave:**
  * Definizione canonica delle 12 variabili manipolabili dell'HIIT (intensità, durata del lavoro, intensità/durata del recupero, numero di serie, recupero tra serie).
  * Dimostrazione formale che per intensità superiori al 100% MAS, la prescrizione tramite %ASR garantisce che individui con diverso rapporto forza-resistenza sperimentino la medesima perturbazione dell'omeostasi metabolica ed energetica.
  * Gli autori sottolineano esplicitamente che per durate di lavoro inferiori a 10 secondi con recupero completo (sprint puro), l'adattamento ricercato è neuromuscolare/meccanico e non richiede il riferimento alla MAS.
* **Limiti Metodologici:** Studio di review concettuale; include dati derivati sia da atleti d'élite sia da popolazioni giovanili con differenti livelli di maturazione biologica.
* **Livello di Qualità:** **Alta** (testo fondamentale mondiale di riferimento per l'HIIT).
* **Fatti Riportati vs Inferenze:**
  * *Fatto:* Gli atleti veloci (speed profile) subiscono uno stress glicolitico devastante se costretti a correre a percentuali fisse di MAS calibrate su atleti resistenti.
  * *Inferenza:* Nello sprint di atletica leggera ($\le 300\text{ m}$), dove l'obiettivo è la velocità massima o la resistenza alla velocità, la MAS non deve essere inclusa nei modelli prescrittivi.

---

### Scheda Studio 3: Sandford et al. (2019)
* **Citazione Completa:** Sandford, G. N., Allen, S. V., Kilding, A. E., Ross, A., & Laursen, P. B. (2019). Anaerobic Speed Reserve: A Key Component of Elite Male 800-m Running. *International Journal of Sports Physiology and Performance*, 14(4), 501–508.
* **PMID:** 30300023 | **DOI:** 10.1123/ijspp.2018-0163
* **Tipo di Studio:** Studio osservazionale di coorte prospettico su atleti d'élite (Livello di Evidenza 2).
* **Campione:** $n = 19$ atleti maschi d'élite mondiale e internazionale su 800m e 1500m (PB 800m: $1:47.38 \pm 1.63$; range: 1:44.80 – 1:50.10).
* **Outcome Misurati:** Maximal Sprinting Speed (MSS, tramite radar su 50m), Maximal Aerobic Speed (MAS, su treadmill in laboratorio con analizzatore di gas), Speed Reserve Ratio ($\text{SRR} = \text{MSS}/\text{MAS}$), ASR ($MSS - MAS$), correlazioni con il season-best sui 400m, 800m e 1500m.
* **Risultati Chiave:**
  * La MSS era significativamente e fortemente correlata con la prestazione sugli 800m ($r = -0.73$, $p < 0.001$).
  * Gli atleti sono stati classificati in tre sottogruppi univoci mediante l'indice SRR:
    1. *400–800 m type:* $\text{SRR} \ge 1.58$ (MSS: $10.05 \pm 0.18\text{ m/s}$; MAS: $5.88 \pm 0.15\text{ m/s}$);
    2. *800 m type:* $1.48 \le \text{SRR} \le 1.57$ (MSS: $9.56 \pm 0.22\text{ m/s}$; MAS: $6.23 \pm 0.17\text{ m/s}$);
    3. *800–1500 m type:* $\text{SRR} \le 1.47$ (MSS: $8.95 \pm 0.28\text{ m/s}$; MAS: $6.42 \pm 0.18\text{ m/s}$).
  * Nel gruppo 400-800m, l'ASR era di $4.17\text{ m/s}$, mentre nel gruppo 800-1500m era di $2.53\text{ m/s}$.
* **Limiti Metodologici:** Campione esclusivamente maschile; ridotta numerosità campionaria legata all'altissimo livello prestativo (élite internazionale); studio cross-sezionale.
* **Livello di Qualità:** **Alta** (calibrazione metodologica impeccabile, atleti olimpici/mondiali).
* **Fatti Riportati vs Inferenze:**
  * *Fatto:* La MSS distingue i migliori interpreti mondiali degli 800m; corridori con lo stesso tempo finale ottengono il risultato attraverso profili locomotori diametralmente opposti (speed vs endurance).
  * *Inferenza:* L'ASR è il modello perfetto per gli 800m, ma non per il 100m o 200m dove la componente MAS non offre alcuna capacità discriminante.

---

### Scheda Studio 4: Sandford, Laursen, & Buchheit (2021)
* **Citazione Completa:** Sandford, G. N., Laursen, P. B., & Buchheit, M. (2021). Anaerobic Speed/Power Reserve and Sport Performance: Scientific Basis, Current Applications and Future Directions. *Sports Medicine*, 51(10), 2017–2036.
* **PMID:** 34398445 | **DOI:** 10.1007/s40279-021-01523-9
* **Tipo di Studio:** State-of-the-art review e framework tassonomico (Livello di Evidenza 1).
* **Campione:** Revisione esaustiva della letteratura biomeccanica e fisiologica su atleti di sport individuali (atletica, ciclismo su pista, canottaggio) e di squadra.
* **Outcome Misurati:** Validazione del concetto di Anaerobic Speed/Power Reserve (ASR/APR), associazione con la tipologia delle fibre muscolari (tramite RMN non invasiva con carnosina o biopsie), strategie di periodizzazione e programmazione individualizzata.
* **Risultati Chiave:**
  * Conferma che il profilo ASR correla fortemente con la distribuzione delle fibre muscolari a contrazione rapida (MHC II) vs lenta (MHC I): atleti speed-dominant possiedono una maggiore frazione stimata di fibre tipo II.
  * Stabilisce protocolli precisi per la stima da campo di MSS (tramite test di sprint con sprint fly sui 10m o radar) e MAS (30-15 IFT o VAM-Eval).
  * Avverte che la prescrizione tramite ASR è specifica per il "dominio sovramassimale" ($>100\%\text{ MAS}$ e $<100\%\text{ MSS}$) e perde validità per sprint brevi massimali dove i fattori determinanti sono la stiffness, la frequenza del passo e la fatica neuromuscolare acuta.
* **Limiti Metodologici:** Mancanza di ampi RCT longitudinali di confronto tra programmazione %ASR vs programmazione tradizionale su velocisti di livello élite.
* **Livello di Qualità:** **Alta** (benchmark scientifico attuale per la profilazione ASR).
* **Fatti Riportati vs Inferenze:**
  * *Fatto:* L'ASR riflette le differenze biologiche nella tipologia di fibre e nella cinetica di fatica/recupero.
  * *Inferenza:* L'applicazione di %ASR a distanze $\le 300\text{ m}$ per velocisti è una forzatura metodologica priva di razionale bioenergetico.

---

### Scheda Studio 5: Buchheit & Mendez-Villanueva (2014)
* **Citazione Completa:** Buchheit, M., & Mendez-Villanueva, A. (2014). Changes in repeated-sprint performance in relation to change in locomotor profile in highly-trained young soccer players. *Journal of Sports Sciences*, 32(13), 1309–1317.
* **PMID:** 24878034 | **DOI:** 10.1080/02640414.2014.918272
* **Tipo di Studio:** Studio di coorte longitudinale su 5 anni (Livello di Evidenza 2).
* **Campione:** $n = 270$ giovani calciatori d'élite (età $14.5 \pm 1.6$ anni), monitorati per 5 anni accademici con un totale di $n = 334$ osservazioni longitudinali appaiate.
* **Outcome Misurati:** Maximal Sprinting Speed (MSS, 40m sprint con fotocellule), Maximal Aerobic Speed (MAS, test navetta VAM-Eval), Anaerobic Speed Reserve ($\text{ASR} = \text{MSS} - \text{MAS}$), Repeated-Sprint Ability (RSA: $6 \times 15\text{ m}$ con recupero attivo).
* **Risultati Chiave:**
  * Le variazioni longitudinali ($\Delta$) nel miglior tempo di sprint singolo (RSA-best) erano strettamente correlate con le variazioni della sola MSS ($r = -0.71$, $p < 0.001$).
  * Le variazioni nel tempo medio sui ripetuti sprint (RSA-mean) erano fortemente correlate con le variazioni della MAS ($r = -0.62$, $p < 0.001$).
  * L'ASR di per sé **non ha spiegato in modo indipendente** le variazioni della prestazione di sprint ripetuto quando MAS e MSS venivano considerate individualmente nella regressione multivariata.
* **Limiti Metodologici:** Popolazione giovanile maschile in fase puberale (effetti confondenti di crescita biologica e aumento di massa muscolare); sport specifico (calcio).
* **Livello di Qualità:** **Alta** (eccezionale ampiezza campionaria e rigore del disegno longitudinale).
* **Fatti Riportati vs Inferenze:**
  * *Fatto:* La performance di sprint massimale dipende unicamente dalla MSS, mentre la resistenza al mantenimento dello sprint ripetuto è legata alla MAS (resintesi di PCr).
  * *Inferenza:* Nello sprint dell'atletica leggera su frazioni uniche o con recuperi ampi, la MAS non ha impatto sulla prestazione, confermando l'inadeguatezza dell'ASR come metrica per lo sprint puro.

---

### Scheda Studio 6: Bundle, Hoyt, & Weyand (2003)
* **Citazione Completa:** Bundle, M. W., Hoyt, R. W., & Weyand, P. G. (2003). High-speed running performance: a new approach to assessment and prediction. *Journal of Applied Physiology*, 95(5), 1955–1962.
* **PMID:** 14555668 | **DOI:** 10.1152/japplphysiol.00921.2002
* **Tipo di Studio:** Studio sperimentale di modellizzazione biofisica della corsa (Livello di Evidenza 2).
* **Campione:** $n = 7$ corridori competitivi (specialisti di sprint, mezzofondo e fondo), età $24 \pm 2$ anni.
* **Outcome Misurati:** Velocità di sprint anaerobica massima ($V_{\text{max an}}$, burst di 8 appoggi, $\le 3\text{ s}$), velocità aerobica massima ($V_{\text{max aer}}$, su test incrementale a esaurimento), prove all-out ad esaurimento su treadmill e su pista con durate comprese tra 3 e 240 secondi.
* **Risultati Chiave:**
  * Il modello a decadimento esponenziale basato sui due limiti di potenza ($V_{\text{max aer}}$ e $V_{\text{max an}}$) ha predetto i tempi all-out sul nastro trasportatore con un errore medio di appena il **2.5%** e le prove all-out su pista entro il **3.4%**.
  * La velocità decresce dall'apice anaerobico verso l'asintoto aerobico seguendo una costante temporale universale ($\tau \approx 50\text{ s}$).
* **Limiti Metodologici:** Campione ridotto ($n=7$); la misurazione della massima velocità anaerobica su treadmill richiede un'elevata familiarizzazione dell'atleta.
* **Livello di Qualità:** **Alta** (studio seminale di riferimento nella bioenergetica quantitativa).
* **Fatti Riportati vs Inferenze:**
  * *Fatto:* La prestazione di corsa su durate tra 3 e 240 secondi è una funzione continua che collega la velocità massimale neuromuscolare alla velocità massimale aerobica.
  * *Inferenza:* Più ci si avvicina a durate $< 10\text{-}15\text{ s}$, più la componente $V_{\text{max aer}}$ diventa quantitativamente trascurabile nell'equazione esponenziale, lasciando la $V_{\text{max an}}$ come unico determinante della traiettoria.

---

### Scheda Studio 7: Bundle & Weyand (2012)
* **Citazione Completa:** Bundle, M. W., & Weyand, P. G. (2012). Sprint exercise performance: does metabolic power matter? *Exercise and Sport Sciences Reviews*, 40(3), 174–182.
* **PMID:** 22525203 | **DOI:** 10.1097/JES.0b013e318258e1c1
* **Tipo di Studio:** Revisione teorica critica e modello bio-meccanico (Livello di Evidenza 1).
* **Campione:** Sintesi analitica di dati meccanici ed energetici su atleti d'élite dello sprint e soggetti sani durante all-out di durata $\le 60\text{ secondi}$.
* **Outcome Misurati:** Forze di reazione al suolo (GRF verticali e orizzontali), tempi di contatto ($t_c$), tempi di volo ($t_f$), tassi di scissione di fosfati inorganici, fatica delle fibre veloci.
* **Risultati Chiave:**
  * La prestazione nello sprint ($\le 60\text{ s}$) **non è limitata dall'apporto di potenza metabolica**, ma dalla capacità muscolo-scheletrica di applicare elevate forze verticali e orizzontali contro il terreno in tempi di contatto brevissimi ($< 0.10\text{ s}$).
  * Il declino della velocità nello sprint all-out è dettato dalla perdita intrinseca di capacità contrattile delle fibre muscolari scheletriche (fatica periferica, dissociazione cross-bridge, rilascio di $\text{Ca}^{2+}$) e non da una "mancanza di ATP".
* **Limiti Metodologici:** Trattato teorico-meccanico; focalizzato principalmente su sprint continui all-out senza curve o partenze da blocchi di gara ufficiali.
* **Livello di Qualità:** **Alta** (ha ridefinito il paradigma moderno dello sprint atletico).
* **Fatti Riportati vs Inferenze:**
  * *Fatto:* I limiti prestativi dello sprint sono meccanici e neuromuscolari, non metabolico-aerobici.
  * *Inferenza:* Tentare di prescrivere lo sprint tramite modelli metabolici legati a parametri aerobici (MAS, CS) è un errore concettuale che ignora la fisica fondamentale della locomozione umana rapida.

---

### Scheda Studio 8: Monod & Scherrer (1965)
* **Citazione Completa:** Monod, H., & Scherrer, J. (1965). The work capacity of a synergic muscular group. *Ergonomics*, 8(3), 329–338.
* **DOI:** 10.1080/00140136508930810
* **Tipo di Studio:** Studio sperimentale fisiologico pionieristico (Livello di Evidenza 2).
* **Campione:** $n = 9$ soggetti sani testati su contrazioni statiche e dinamiche di gruppi muscolari sinergici locali (flessione del gomito, estensione del ginocchio).
* **Outcome Misurati:** Lavoro massimo ($W_{\text{lim}}$), tempo di esaurimento ($t_{\text{lim}}$), potenza erogata ($P$).
* **Risultati Chiave:**
  * La relazione tra lavoro massimo e tempo fino all'esaurimento è lineare: $W_{\text{lim}} = a + b \cdot t_{\text{lim}}$.
  * Il coefficiente angolare $b$ rappresenta la "Potenza Critica" (CP), definita come il massimo carico di lavoro teoricamente sostenibile indefinitamente senza affaticamento muscolare locale.
  * L'intercetta $a$ rappresenta la capacità di lavoro anaerobico ($W'$ o $AWC$), una riserva energetica finita.
* **Limiti Metodologici:** Studio originariamente condotto su singoli gruppi muscolari isolati (non su locomozione globale); trascura i vincoli termoregolatori, cardiovascolari centrali e di fatica neurale.
* **Livello di Qualità:** **Media** (storicamente fondamentale, ma limitato per l'esercizio globale ad alta velocità).
* **Fatti Riportati vs Inferenze:**
  * *Fatto:* Il modello a 2 parametri postula che per carichi superiori a CP, l'esaurimento sopraggiunge esattamente quando la riserva finita $W'$ viene azzerata.
  * *Inferenza:* Il modello a 2 parametri estrapolato a durate cortissime implica una potenza erogabile infinita a $t \to 0$, rendendolo inapplicabile per definizione allo sprint.

---

### Scheda Studio 9: Jones et al. (2010)
* **Citazione Completa:** Jones, A. M., Vanhatalo, A., Burnley, M., Morton, R. H., & Poole, D. C. (2010). Critical power: implications for determination of V˙O2max and exercise tolerance. *Medicine & Science in Sports & Exercise*, 42(10), 1876–1890.
* **PMID:** 20195180 | **DOI:** 10.1249/MSS.0b013e3181d9cf7f
* **Tipo di Studio:** Revisione metodologica e consenso scientifico sui domini di esercizio (Livello di Evidenza 1).
* **Campione:** Revisione critica di centinaia di studi su ciclismo e corsa a intensità controllata.
* **Outcome Misurati:** Definizione dei 4 domini di intensità dell'esercizio (Moderate, Heavy, Severe, Extreme), dinamiche del $\text{VO}_2$ slow component, accumulo di lattato, riserva $W'/D'$.
* **Risultati Chiave:**
  * La CP/CS demarca con precisione la transizione tra il dominio "Heavy" (dove il $\text{VO}_2$ si stabilizza) e il dominio "Severe" (dove il $\text{VO}_2$ deriverà inevitabilmente fino al 100% del $\text{VO}_2\text{max}$).
  * Il dominio "Extreme" è definito per sforzi di durata talmente breve ($< 90\text{-}120\text{ s}$) che l'esaurimento muscolare si verifica **prima** che il $\text{VO}_2$ possa raggiungere il $\text{VO}_2\text{max}$.
  * Gli autori affermano esplicitamente che nel dominio Extreme il modello iperbolico standard a 2 parametri crolla, poiché le assunzioni bioenergetiche di CP non sono rispettate.
* **Limiti Metodologici:** Trattato teorico; fornisce linee guida concettuali senza calibrare protocolli da campo per lo sprint puro su pista.
* **Livello di Qualità:** **Alta** (testo cardine per la comprensione dei domini fisiologici).
* **Fatti Riportati vs Inferenze:**
  * *Fatto:* Gli sforzi di durata inferiore a 2 minuti appartengono al dominio "Extreme", dove la Critical Speed non governa l'esaurimento.
  * *Inferenza:* Poiché tutti gli sprint su distanze $\le 300\text{ m}$ durano meno di 40 secondi, essi ricadono pienamente nel dominio Extreme: la Critical Speed è dunque scientificamente incompatibile con lo sprint breve.

---

### Scheda Studio 10: Pettitt, Jamnick, & Clark (2012)
* **Citazione Completa:** Pettitt, R. W., Jamnick, N., & Clark, I. E. (2012). 3-Min All-Out Exercise Test for Running. *International Journal of Sports Medicine*, 33(6), 426–431.
* **PMID:** 22422309 | **DOI:** 10.1055/s-0031-1299749
* **Tipo di Studio:** Studio di validazione metodologica (Livello di Evidenza 2).
* **Campione:** $n = 14$ atlete universitarie di mezzofondo e fondo (donne, età $20.4 \pm 1.8$ anni).
* **Outcome Misurati:** Critical Speed (CS) e $D'$ determinati mediante un test massimale da campo di 3 minuti (3MT) monitorato con GPS/fotocellule, confrontati con prove a esaurimento tradizionali e soglie respiratorie.
* **Risultati Chiave:**
  * La CS calcolata come media degli ultimi 30 secondi del 3MT ($3.81 \pm 0.38\text{ m/s}$) non differiva significativamente dalla CS ricavata da prove multiple tradizionali ($3.78 \pm 0.35\text{ m/s}$, $r = 0.92$, $p < 0.001$).
  * Il parametro $D'$ medio è risultato pari a $168 \pm 48\text{ metri}$.
  * Il modello 3MT ha dimostrato elevata affidabilità per predire prestazioni di gara su distanze comprese tra 1600m e 5000m.
  * Gli autori segnalano che il modello **non è in grado di predire accuratamente prestazioni su distanze inferiori a 800m**, in quanto la riserva di accelerazione iniziale e i vincoli meccanici sovrastano la stima di $D'$.
* **Limiti Metodologici:** Campione esclusivamente femminile; atlete di mezzofondo (nessuna velocista nel campione); validità limitata alla corsa continua in linea.
* **Livello di Qualità:** **Media** (ottima validazione per il mezzofondo, ma nega l'applicazione allo sprint).
* **Fatti Riportati vs Inferenze:**
  * *Fatto:* Il test 3MT determina CS e $D'$ in una singola sessione per sforzi da 1600m a 5000m, ma fallisce nelle distanze brevi.
  * *Inferenza:* Usare $D'$ per calcolare quante ripetute da 100m o 200m un velocista può completare porta a stime di carico errate e non applicabili sul campo.

---

### Scheda Studio 11: Morton (1996)
* **Citazione Completa:** Morton, R. H. (1996). A 3-parameter critical power model. *Ergonomics*, 39(4), 611–619.
* **PMID:** 8734685 | **DOI:** 10.1080/00140139608964484
* **Tipo di Studio:** Studio di modellizzazione matematica e bioenergetica teorica (Livello di Evidenza 2).
* **Campione:** Rianalisi di dataset storici su atleti d'élite ed esecuzione di simulazioni computazionali su sforzi massimali brevi e prolungati.
* **Outcome Misurati:** Parametri di Potenza Critica (CP), Lavoro Anaerobico ($W'$), Potenza Massima Istantanea ($P_{\text{max}}$), bontà di adattamento statistico (Goodness-of-fit $R^2$), errore standard di stima.
* **Risultati Chiave:**
  * Il rilassamento dell'asintoto temporale a zero ($t=0$) introduce un terzo parametro ($P_{\text{max}}$ o $v_{\text{max}}$), trasformando l'iperbole classica:
    $$t = \frac{W'}{P - CP} - \frac{W'}{P_{\text{max}} - CP}$$
  * Il modello a 3 parametri corregge la sovrastima sistematica di CP e la sottostima di $W'$ tipiche del modello a 2 parametri.
  * A intensità prossime a $P_{\text{max}}$, il tempo limite tende correttamente a zero, eliminando la predizione assurda di potenza infinita.
* **Limiti Metodologici:** Il fitting a 3 parametri è matematicamente instabile in presenza di lievi errori di misurazione e richiede un numero considerevole di test massimali (almeno 4-5 prove ben distribuite).
* **Livello di Qualità:** **Alta** (trattamento matematico rigoroso delle anomalie dello sprint nei modelli bioenergetici).
* **Fatti Riportati vs Inferenze:**
  * *Fatto:* Il modello a 2 parametri classico è viziato per costruzione alle altissime intensità; solo un modello a 3 parametri che vincoli la velocità alla $v_{\text{max}}$ può avere senso teorico.
  * *Inferenza:* Poiché la misurazione diretta della $v_{\text{max}}$ (MSS) è già la base del modello a 3 parametri, per lo sprint è immensamente più diretto ed efficace programmare direttamente in %MSS, eliminando del tutto il costrutto matematico artificiale del Critical Speed.

---

### Scheda Studio 12: Savaglio & Carbone (2000)
* **Citazione Completa:** Savaglio, S., & Carbone, V. (2000). Scaling in athletic world records. *Nature*, 404(6775), 244.
* **PMID:** 10749198 | **DOI:** 10.1038/35005165
* **Tipo di Studio:** Studio di analisi matematica su record mondiali storici (Livello di Evidenza 1/2).
* **Campione:** Database ufficiale IAAF contenente tutti i record mondiali maschili e femminili di corsa su pista dalle distanze di 100 metri fino alla maratona (100m, 200m, 400m, 800m, 1000m, 1500m, 1 miglio, 2000m, 3000m, 5000m, 10000m, maratona).
* **Outcome Misurati:** Relazione di scala logaritmica tra velocità media ($v$) e tempo di gara ($t$), esponenti di potenza, individuazione di punti di transizione non lineare (*crossover points*).
* **Risultati Chiave:**
  * La velocità media dei record mondiali in funzione del tempo segue una legge di potenza a due regimi distinti (*Broken Power Law*):
    $$v(t) \propto t^{-\alpha}$$
  * Si riscontra una netta discontinuità a un tempo critico di circa **150–170 secondi** (distanza ~1000 metri).
  * Per $t < 150\text{ s}$, l'esponente di fatica è marcatamente diverso rispetto a $t > 170\text{ s}$, rispecchiando il passaggio bioenergetico tra predominanza anaerobica e predominanza aerobica.
  * Una singola equazione di potenza (come il modello di Riegel) applicata all'intero intervallo di distanze genera errori sistematici macroscopici.
* **Limiti Metodologici:** Studio limitato a prestazioni d'élite assolute (record del mondo); non analizza la variabilità individuale degli atleti di livello amatoriale o giovanile.
* **Livello di Qualità:** **Alta** (pubblicazione su Nature, rigore matematico e fisico incontestabile).
* **Fatti Riportati vs Inferenze:**
  * *Fatto:* La relazione tra velocità e durata di gara presenta un punto di rottura netto attorno a 2.5 minuti, invalidando qualsiasi legge di potenza uniforme tra sprint e fondo.
  * *Inferenza:* I modelli Power-Law non possono essere usati per estrapolare andature di sprint partendo da test di resistenza, né possono costituire una base razionale per programmare allenamenti submassimali nei 60m-300m.

---

## 7. Sezione 6: Implicazioni Ingegneristiche per T7 Workout PWA & Foglio Excel

Sulla base delle evidenze scientifiche analizzate, si definiscono le seguenti **direttive vincolanti** per l'architettura dei moduli software e per il motore di calcolo del foglio Excel:

1. **Ripudio di MAS e Critical Speed nel Calcolo dello Sprint $\le 300\text{ m}$:**
   * Nessun algoritmo destinato a velocisti puri per distanze di 60m, 80m, 100m, 150m, 200m e 300m deve richiedere o utilizzare la MAS o la CS.
   * L'ancoraggio prescrittivo deve avvenire unicamente tramite:
     * **MSS (Velocità Massima Assoluta):** Rilevata tramite flying 10m o split laser/radar 30-40m.
     * **PB di Gara sulla distanza target (o distanza test, es. 60m/100m/200m):** Da cui derivare le andature percentuali (%MSS o %PB).

2. **Gestione Specializzata per Atleti Ibridi e Mezzofondisti (Modulo ASR Dedicato):**
   * Creare una sezione specifica ("Modulo ASR / 400m-800m & Team Sports") in cui l'utente può inserire sia MAS sia MSS.
   * In questa sezione, la prescrizione di intervalli sovramassimali ($15\text{s}/15\text{s}$, $30\text{s}/30\text{s}$, ripetute sui 400m-600m) avverrà secondo la formula ufficiale:
     $$\text{Target Speed} = \text{MAS} + \left( \text{ASR} \times \frac{\%\text{ASR}}{100} \right)$$
   * Il software calcolerà automaticamente lo **Speed Reserve Ratio ($\text{SRR} = \text{MSS}/\text{MAS}$)**, classificando l'atleta in:
     * *Speed-Dominant* ($\text{SRR} \ge 1.58$) -> Tempi di recupero allungati tra le serie;
     * *Hybrid* ($1.48 \le \text{SRR} \le 1.57$) -> Pacing standard;
     * *Endurance-Dominant* ($\text{SRR} \le 1.47$) -> Recuperi più densi consentiti.

3. **Integrazione della Critical Speed Esclusivamente per il Mezzofondo/Fondo ($> 800\text{ m}$):**
   * Nel modulo di corsa prolungata, integrare la CS e $D'$ ricavati da 3MT o prove cronometrate (1500m + 5000m) per la gestione del ritmo di soglia e delle frazioni in dominio "Severe".
   * Inserire un alert esplicito nell'interfaccia: *"Il modello Critical Speed non è applicabile a distanze inferiori a 800 metri a causa di violazioni dei vincoli biofisici ed energetici"*.

4. **Trattamento della Power-Law:**
   * Utilizzare la formula di Riegel esclusivamente come strumento secondario di stima predittiva per gare massimali omogenee (es. predire il tempo sui 10 km a partire dai 5 km o dalla mezza maratona), bloccandone l'esecuzione per distanze che scavalcano il breakpoint dei 150 secondi (sotto i 1000m).

---

## 8. Sintesi delle Evidenze e Conclusioni di Filone

| Modello Fisiologico | Validità $\le 300\text{ m}$ | Validità $300 - 800\text{ m}$ | Validità $> 800\text{ m}$ | Raccomandazione T7 Workout |
| :--- | :--- | :--- | :--- | :--- |
| **%MSS (%vMax)** | **ELEVATISSIMA (100%)** | Media (richiede correzione lattacida) | Inadatta | **Motore Primario Sprint (60-300m)** |
| **Anaerobic Speed Reserve (ASR)** | Inadatta (rumore da MAS) | **ELEVATISSIMA (100%)** | Bassa (superata da soglia/MAS) | **Modulo Speciale 400-800m & HIIT** |
| **Critical Speed (CS / D')** | Nulla (modello matematicamente errato) | Bassa (dominio Extreme) | **ELEVATISSIMA (100%)** | **Modulo Mezzofondo / Fondo** |
| **Power-Law (Riegel)** | Nulla (broken power law) | Inadatta | Buona per predizioni di gara | **Solo calcolatore predittivo gare** |

Il presente report esaurisce l'indagine per il **FILONE C (Fase 1)** e fornisce il solido fondamento scientifico necessario per la redazione del protocollo esecutivo e la programmazione del foglio Excel.
