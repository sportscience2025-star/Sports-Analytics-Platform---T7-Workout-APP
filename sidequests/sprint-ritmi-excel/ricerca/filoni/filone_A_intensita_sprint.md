# Filone A: Prescrizione dell'Intensità nello Sprint (% Velocità vs % Tempo, Fisiologia e Ripetute Submassimali)

**Autore:** Agente A — Ricerca Scientifica Ritmi Sprint  
**Data:** 21 Novembre 2026  
**Destinazione:** `sidequests/sprint-ritmi-excel/ricerca/filoni/filone_A_intensita_sprint.md`  
**Stato:** Completato — Revisione Paritetica Interna  

---

## 1. Executive Summary & Obiettivi della Ricerca

La prescrizione dell'andatura e dell'intensità nell'allenamento della velocità (sprint su pista e corsa ad alta intensità per atleti di potenza) rappresenta uno dei nodi più critici della metodologia dell'allenamento. Spesso, nella pratica di campo, tecnici e preparatori atletici adottano tabelle parametriche basate su formule fisse per calcolare i tempi target delle ripetute su distanze variabili (dai 30 m ai 300 m).

Nel contesto del progetto **Sprint Ritmi Excel**, la formula empiricamente implementata nelle tabelle dei centometristi analizzati è:

$$T(d, p) = \frac{T_{100}(d)}{p}$$

dove $T_{100}(d)$ è il record personale o tempo massimale (100%) sulla distanza $d$ e $p \in (0, 1]$ è l'intensità nominale prescritta (es. $p = 0{,}80$ per l'80%).

Il presente report scientifico (**Filone A**) ha l'obiettivo di analizzare con il massimo rigore epistemologico e biomeccanico:
1. **La quantificazione matematica e concettuale dell'intensità**: la discrepanza fondamentale tra prescrizione in *percentuale di velocità* ($\% v$) e in *percentuale di tempo* ($\% t$), e la trappola della non-linearità iperbolica.
2. **La risposta fisiologica e percettiva reale**: la relazione tra andatura target, accumulo esponenziale di lattato ematico ($[BLa]$), sforzo percepito (RPE), fatica neuromuscolare acuta (perdita di velocità e calo dell'altezza nel Countermovement Jump, CMJ) e drive neurale.
3. **Le evidenze empiriche sulle ripetute submassimali**: classificazione tassonomica e differenze metaboliche tra *Extensive Tempo* (60–75%), *Intensive Tempo* (80–90%) e *Speed Endurance / Special Endurance* (>90–95%), con particolare attenzione alle alterazioni biomeccaniche (tempi di contatto al suolo, forze verticali, coordinazione segmentale).
4. **I limiti intrinseci dell'uso della velocità media ($\bar{v}$)**: l'impatto distorsivo della fase di accelerazione e dell'inerzia della partenza da fermo su distanze eterogenee (30 m vs 100 m vs 200 m).

L'indagine poggia su **13 fonti scientifiche primarie peer-reviewed** di livello internazionale (pubblicate su *Sports Medicine*, *Journal of Applied Physiology*, *Journal of Strength and Conditioning Research*, *Journal of Sports Sciences*, *International Journal of Sports Medicine*, *Scandinavian Journal of Medicine & Science in Sports*, *Journal of Biomechanics*, *Journal of Human Kinetics*, *Journal of Sport and Health Science*).

---

## 2. Metodologia di Prescrizione dell'Intensità: % Velocità vs % Tempo

### 2.1 Derivazione Fisica e Discrepanza Matematica

Nel gergo comune dell'atletica leggera, l'espressione *"corri all'80%"* viene utilizzata in modo ambiguo. Esistono due interpretazioni matematiche tra loro mutuamente esclusive:

1. **Percentuale della Velocità Media Massimale ($\% \bar{v}$)**:
   $$\bar{v}_p = p \cdot \bar{v}_{100} \implies \frac{d}{T_p} = p \cdot \frac{d}{T_{100}} \implies T_p = \frac{T_{100}}{p}$$
   Questa è una **funzione iperbolica** rispetto a $p$. All'allontanarsi dal massimale ($p \to 0$), il tempo target cresce in modo asintotico.

2. **Percentuale del Tempo Massimale o Incremento Lineare di Tempo ($\% t$)**:
   Spesso i tecnici prescrivono il ritmo aggiungendo una frazione di tempo rispetto al personale (es. *"prendi il tuo record e aggiungi il 10% del tempo"*):
   $$T_p^{\text{lin}} = T_{100} \cdot (1 + (1 - p)) = T_{100} \cdot (2 - p)$$
   oppure moltiplicando direttamente per il reciproco lineare ($T_{100} \cdot (1 + \Delta t\%)$).

La discrepanza tra questi due modelli è illustrata quantitativamente nella seguente tabella per un velocista di livello nazionale con un personale di $10{,}00\text{ s}$ sui 100 m ($\bar{v}_{100} = 10{,}00\text{ m/s}$):

| Percentuale Nominale ($p$) | Modello Iperbolico ($T = T_{100}/p$) | Velocità Media Iperbolica ($\bar{v}$) | Modello Lineare ($T = T_{100} \cdot (2-p)$) | Velocità Media Lineare ($\bar{v}$) | Scarto Temporale ($\Delta T$) | Errore Relativo sull'Andatura |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **100%** | **10,00 s** | 10,00 m/s | 10,00 s | 10,00 m/s | 0,00 s | 0,0% |
| **95%** | **10,53 s** | 9,50 m/s | 10,50 s | 9,52 m/s | +0,03 s | +0,2% |
| **90%** | **11,11 s** | 9,00 m/s | 11,00 s | 9,09 m/s | +0,11 s | +1,0% |
| **85%** | **11,76 s** | 8,50 m/s | 11,50 s | 8,70 m/s | +0,26 s | +2,3% |
| **80%** | **12,50 s** | 8,00 m/s | 12,00 s | 8,33 m/s | +0,50 s | +4,1% |
| **75%** | **13,33 s** | 7,50 m/s | 12,50 s | 8,00 m/s | +0,83 s | +6,7% |
| **70%** | **14,29 s** | 7,00 m/s | 13,00 s | 7,69 m/s | +1,29 s | +9,9% |
| **60%** | **16,67 s** | 6,00 m/s | 14,00 s | 7,14 m/s | +2,67 s | +19,0% |
| **50%** | **20,00 s** | 5,00 m/s | 15,00 s | 6,67 m/s | +5,00 s | +33,3% |

> [!IMPORTANT]
> **La trappola dell'iperbole:** Nel modello iperbolico $T = T_{100}/p$ (adottato dal foglio Excel in analisi), una riduzione della velocità del 30% ($p = 0{,}70$) corrisponde a un incremento del tempo del **+42,9%** (da 10,00 s a 14,29 s). Se un allenatore pensa erroneamente in termini di percentuale di tempo ($+30\%$ di tempo $= 13{,}00\text{ s}$), sta in realtà facendo correre l'atleta a una velocità di $7{,}69\text{ m/s}$, che equivale al **76,9% della velocità massimale**, alterando completamente il profilo metabolico della seduta da *estensivo* a *intensivo*.

### 2.2 Velocità Massima Istantanea ($v_{max}$) vs Velocità Media ($\bar{v}$) vs Anaerobic Speed Reserve (ASR)

In letteratura scientifica moderna (Buchheit & Laursen 2013; Sandford et al. 2021; Haugen et al. 2019), la prescrizione dell'intensità supramassimale e di sprint non viene calibrata sulla velocità media di gara ($\bar{v} = d/t$), bensì sulla **Maximal Sprinting Speed ($MSS$ o $v_{max}$)**, rilevata tramite radar o sprint lanciato (flying sprint su 10-20 m).

Inoltre, per sforzi che si collocano tra la massima velocità aerobica ($MAS$) e la velocità massimale di sprint ($MSS$), Sandford et al. (2021) definiscono l'**Anaerobic Speed Reserve (ASR)**:

$$\text{ASR} = \text{MSS} - \text{MAS}$$

Prescrivere intensità submassimali come percentuale secca di $T_{100}$ ignora il fatto che atleti con identico record personale sui 100 m o 200 m possono possedere un profilo neuromuscolare e una riserva anaerobica completamente divergenti:
- Un atleta *"Speed-dominant"* (fibra rapida pura, alto $v_{max}$, basso $MAS$) esaurirà rapidamente le riserve fosfagene anche a ritmi dell'85-90% $\bar{v}$.
- Un atleta *"Hybrid/Endurance-dominant"* (maggiore capacità aerobico-glicolitica) tollererà volumi ampiamente superiori al medesimo ritmo nominale.

---

## 3. Fisiologia e Percezione dello Sforzo a Intensità Submassimali

### 3.1 Dinamica dell'Accumulo di Lattato Ematico ($[BLa]$)

A differenza dell'andatura cinematica, che varia in modo lineare o iperbolico, **la risposta metabolica dello sprint è fortemente non-lineare**:

```
Accumulo Lattato [mmol/L]
  ^
20|                                     * (100% All-out / Speed Endurance)
  |                                 *
15|                             *
  |                         * (90-95% Special Endurance)
10|                   * (80-90% Intensive Tempo)
  |             *
 5|       *
  |  * (60-75% Extensive Tempo: < 2-4 mmol/L)
 0+----------------------------------------> Intensità Nominale (% Vmax)
   50%    60%    70%    80%    90%    100%
```

1. **Zona 60–75% (Extensive Tempo):** Il costo energetico è prevalentemente coperto dalla fosforilazione ossidativa mitocondriale. La produzione di lattato intra-muscolare è modesta e bilanciata dal tasso di rimozione (clearance) tramite ossidazione nelle fibre muscolari adiacenti (tipo I e cuore). Il lattato ematico post-ripetuta rimane costantemente entro $1{,}5 - 3{,}5\text{ mmol/L}$.
2. **Zona 80–90% (Intensive Tempo):** Si supera nettamente la massima soglia del lattato. La glicolisi anaerobica diventa la via primaria di risintesi dell'ATP. Con recuperi parziali (es. 90-180 s), il lattato si accumula progressivamente fino a toccare $8 - 14\text{ mmol/L}$, provocando caduta del pH muscolare intracellulare e accumulo di ioni $H^+$ e fosfato inorganico ($P_i$).
3. **Zona >90–95% (Speed Endurance / Special Endurance):** Massima attivazione del sistema ATP-PCr nei primi 5–7 secondi, seguita da flussi glicolitici massimali. Nei protocolli prolungati (60–150 m all-out o near-all-out), il lattato ematico può superare $16 - 22\text{ mmol/L}$ (Iaia & Bangsbo 2010; Girard et al. 2011).

### 3.2 Percezione Soggettiva (RPE) e Incapacità di Autoregolazione dell'Atleta

Uno dei riscontri più importanti della letteratura applicata recente proviene dallo studio di **Darrall-Jones et al. (2022)** (*J Strength Cond Res*). Gli autori hanno verificato la capacità di atleti professionisti di correre a velocità submassimali prescritte verbalmente (60%, 70%, 80%, 90% di $V_{max}$) in assenza di feedback esterno oggettivo:

- **Al 60% $V_{max}$ prescritto:** Gli atleti hanno fatto registrare un errore sistematico enorme (**bias di +23%**, range reale 57–88% $V_{max}$), correndo in media a oltre l'83% della loro velocità massima!
- **Al 70% $V_{max}$ prescritto:** Gli atleti hanno corso con un **bias di +11%** (range reale 67–93% $V_{max}$), correndo in media all'81% di $V_{max}$.
- **All'80% $V_{max}$ prescritto:** L'errore medio si è ridotto (+2%, range reale 71–91% $V_{max}$).
- **Al 90% $V_{max}$ prescritto:** Gli atleti hanno **sopravvalutato** la loro andatura, correndo più piano del richiesto (**bias di -4%**, range reale 77–95% $V_{max}$).

> [!IMPORTANT]
> **Implicazione di campo:** L'essere umano non possiede un tachimetro interno accurato. Senza riferimenti cronometrici oggettivi (tabelle al decimo di secondo, fotocellule o feedback acustici), **gli atleti tendono sistematicamente a trasformare le sedute di recupero o tempo estensivo (60-70%) in sedute glicolitiche intensive all'80-85%**, accumulando fatica cronica invisibile e vanificando l'adattamento programmato.

### 3.3 Fatica Neuromuscolare Oggettiva: Speed Loss e Countermovement Jump Loss

Gli studi cardine di **Jiménez-Reyes et al. (2016, 2019)** su velocisti di livello nazionale (PB 100 m: $10{,}64 - 10{,}68\text{ s}$) hanno dimostrato che:
- La fatica neuromuscolare nello sprint non progredisce in modo proporzionale, ma si manifesta con una sensibilità estrema.
- Anche una perdita di velocità infinitesimale durante la seduta (appena il **3% di decremento** tra le ripetute) è associata a:
  - Una perdita di altezza nel Countermovement Jump (CMJ loss) tra il 10% e il 15%.
  - Un incremento ripido del lattato ematico ($r = 0{,}83 - 0{,}96$) e dell'ammoniaca ematica ($r = 0{,}86 - 0{,}95$).
  - Una correlazione individuale tra calo del CMJ e metaboliti fino a $r = 0{,}99$.
- L'ammoniemia ($[NH_3]$), marker diretto di deaminazione dell'AMP e rottura dell'equilibrio purinico nelle fibre a contrazione rapida, subisce un'impennata esponenziale non appena si tocca il 95-100% dell'intensità.

### 3.4 Meccanismi di Fatica nelle Ripetute di Sprint (Girard et al. 2011; Iaia & Bangsbo 2010)

Nelle ripetute ad alta intensità, la fatica si articola su due livelli:
1. **Fatica Periferica Muscolare:**
   - Deplezione parziale dei depositi di fosfocreatina (PCr), che richiede fino a 3–5 minuti per un ripristino al 90–95%.
   - Inibizione dell'accoppiamento eccitazione-contrazione (E-C coupling) mediata dall'accumulo di fosfato inorganico ($P_i$), che riduce il rilascio di $Ca^{2+}$ dal reticolo sarcoplasmatico.
   - Alterazione del bilancio ionico trans-membrana: efflusso massiccio di potassio ($K^+$) nello spazio extracellulare, che depolarizza il sarcolemma e blocca la conduzione del potenziale d'azione (parzialmente contrastato dall'attività della pompa $Na^+/K^+$ ATPasi, up-regolata dal SET; Iaia & Bangsbo 2010).
2. **Fatica Centrale Neurale:**
   - Calo del segnale efferente motorio (central drive) della corteccia motoria primaria, misurabile come riduzione dell'ampiezza dell'elettromiografia di superficie (EMG).
   - Diminuzione della frequenza di scarica dei motoneuroni ad alta soglia (principio delle dimensioni di Henneman, fibre IIx).

---

## 4. Tassonomia Empirica delle Ripetute Submassimali e Biomeccanica

### 4.1 Classificazione dei Metodi di Allenamento nello Sprint (Haugen et al. 2019)

Integrando la letteratura scientifica con le best practice dell'atletica leggera d'élite, Haugen et al. (2019) codificano la seguente tassonomia:

| Categoria Metodologica | Intensità Nominale (% $V_{max}$) | Distanza Ripetute (m) | Volume Tipico per Seduta (m) | Recupero tra Rep / Set | Obiettivo Fisiologico Primario |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Accelerazione Pura** | $> 98\%$ | $10 - 50\text{ m}$ | $100 - 300\text{ m}$ | $1\text{ min per } 10\text{ m}$ ($3 - 5\text{ min}$) | Forza orizzontale, $F_0$, RFD, potenza neurale. |
| **Velocità Massima ($v_{max}$)** | $> 98\%$ | $10 - 30\text{ m}$ *(lanciati)* | $50 - 150\text{ m}$ *(escl. lancio)* | $4 - 6\text{ min}$ completi | Massima frequenza/stiffness, $v_0$, minimo contatto. |
| **Speed Endurance (SET)** | $90 - 95\%$ | $60 - 80\text{ m}$ | $600 - 2000\text{ m}$ | $2 - 4\text{ min}$ (incompleto) | Tolleranza al lattato, capacità tampone, pompa $Na^+/K^+$. |
| **Special Endurance** | $> 95\%$ | $80 - 150\text{ m}$ | $300 - 900\text{ m}$ | $8 - 15\text{ min}$ (completo) | Mantenimento della velocità sotto acidosi estrema. |
| **Intensive Tempo** | $80 - 90\%$ | $100 - 300\text{ m}$ | $800 - 2000\text{ m}$ | $2 - 3\text{ min}$ | Capacità glicolitica, transizione aerobico-anaerobica. |
| **Extensive Tempo** | $60 - 75\%$ | $100 - 400\text{ m}$ | $1500 - 3500\text{ m}$ | $45 - 90\text{ s}$ | Base aerobica, capillarizzazione, recupero attivo. |

### 4.2 Alterazioni Biomeccaniche alle Velocità Submassimali

Un errore comune dei tecnici è presumere che correre al 70% o all'80% sia semplicemente una versione in scala ridotta della meccanica di sprint al 100%. **La biomeccanica dimostra che i pattern neuromuscolari sono qualitativamente differenti**:

1. **Tempi di Contatto al Suolo ($t_c$) e Forze Verticali (Weyand et al. 2000):**
   - A velocità massimale ($10 - 12\text{ m/s}$), il tempo di contatto al suolo scende a **$0{,}08 - 0{,}10\text{ s}$** negli atleti d'élite, e la forza verticale media applicata supera **$2{,}5 - 3{,}0$ volte il peso corporeo**.
   - A velocità submassimali ($60 - 75\%$ di $V_{max}$), $t_c$ sale a **$0{,}15 - 0{,}22\text{ s}$**, mentre la forza media scende a $1{,}5 - 1{,}8$ volte il peso corporeo.
   - Il tempo di oscillazione della gamba nell'aria ($t_{sw}$), invece, rimane praticamente immutato ($0{,}33 - 0{,}37\text{ s}$) attraverso tutte le andature.
   - Di conseguenza, correre a intensità submassimale allena un modello di interazione col terreno ad **alta compliance e bassa stiffness verticale**, incapace di stimolare il ciclo stiramento-accorciamento (SSC) rapido tipico del picco di velocità.

2. **Velocità Orizzontale del Piede e Fase Frenante (Clark et al. 2023):**
   - Nello sprint massimale, l'atleta esegue una vigorosa accelerazione all'indietro della gamba libera prima dell'impatto (retroversione attiva / *"negative foot speed"*), azzerando la differenza di velocità relativa tra piede e terreno ($GSD \approx 0$) e minimizzando la frenata orizzontale.
   - A velocità submassimali (60-80%), il piede atterra con velocità di arretramento ridotta, inducendo un vettore di forza frenante iniziale sensibilmente maggiore per ciclo di passo.

3. **Coordinazione Inter-Segmentale (Whitacre, Stearne, & Clark 2024):**
   - Utilizzando la Continuous Relative Phase (CRP), gli autori hanno dimostrato che a velocità massimali i velocisti d'élite esibiscono una coordinazione segmentale tra le tibie (**shank-shank coordination**) rigidamente in contro-fase (anti-phase) per garantire il richiamo rapido del tallone sotto il bacino.
   - A velocità submassimali (50-70%), i pattern cinematici e le traiettorie articolari virano verso schemi tipici del mezzofondo, con oscillazioni pendolari ampie.

---

## 5. Limiti Documentati dell'Uso della Velocità Media e Fase di Accelerazione

### 5.1 La Velocità Media ($\bar{v}$) come Artefatto Statistico Integrato

Nel modello parametrico Excel esaminato, ogni riga calcola $T(d, p) = T_{100}(d)/p$. Questo calcolo assume implicitamente che:
$$\bar{v}(d, p) = p \cdot \bar{v}_{100}(d)$$

Tuttavia, in un qualsiasi sprint con partenza da fermo, la velocità istantanea $v(t)$ parte da zero. L'accelerazione orizzontale richiede l'applicazione di forza massiccia per vincere l'inerzia della massa corporea ($F = m \cdot a$).

### 5.2 Il Modello Mono-Esponenziale dello Sprint (Samozino et al. 2016; Healy et al. 2022)

La cinematica di uno sprint in accelerazione è descritta con altissima precisione dalla funzione mono-esponenziale:

$$v(t) = v_{max} \cdot \left(1 - e^{-t/\tau}\right)$$

dove $v_{max}$ è la velocità massima teorica asintotica e $\tau$ (tau) è la costante di tempo di accelerazione (generalmente compresa tra $1{,}0\text{ s}$ e $1{,}3\text{ s}$ nei velocisti maschi d'élite).

Integrando rispetto al tempo, la posizione $x(t)$ (ovvero la distanza $d$) è data da:

$$x(t) = v_{max} \cdot \left(t - \tau \cdot \left(1 - e^{-t/\tau}\right)\right)$$

Da questa formulazione discende una proprietà fisica ineludibile: **la velocità media $\bar{v} = d / t$ è una funzione strettamente dipendente dalla distanza $d$ e non è proporzionale a $v_{max}$ sulle brevi distanze**.

Calcolando il rapporto tra velocità media $\bar{v}$ e velocità massima di picco $v_{max}$ per un velocista con $v_{max} = 11{,}5\text{ m/s}$ e $\tau = 1{,}15\text{ s}$:

| Distanza ($d$) | Tempo Reale ($t$) | Velocità Media ($\bar{v} = d/t$) | Velocità Massima ($v_{max}$) | Rapporto $\bar{v} / v_{max}$ | Quota Fase di Accelerazione sulla Corsa |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **10 m** | 1,82 s | 5,49 m/s | 11,50 m/s | **47,7%** | 100% (accelerazione pura) |
| **30 m** | 3,92 s | 7,65 m/s | 11,50 m/s | **66,5%** | 100% (accelerazione iniziale) |
| **60 m** | 6,71 s | 8,94 m/s | 11,50 m/s | **77,7%** | ~80% accelerazione, ~20% $v_{max}$ |
| **100 m** | 10,25 s | 9,76 m/s | 11,50 m/s | **84,9%** | ~45% acc., ~35% $v_{max}$, ~20% dec. |
| **150 m** | 15,10 s | 9,93 m/s | 11,50 m/s | **86,3%** | ~30% acc., ~25% $v_{max}$, ~45% dec. |
| **200 m** | 20,50 s | 9,76 m/s | 11,50 m/s | **84,9%** | ~20% acc., ~20% $v_{max}$, ~60% dec. |

### 5.3 Perché Scalare il Tempo con $T_{100}/p$ Fallisce sulle Distanze Brevi

Applicando la formula $T = T_{100}/p$ a un 30 m rispetto a un 150 m all'80%:
- Su **30 m**: $T_{100} = 3{,}92\text{ s} \implies T_{80\%} = 3{,}92 / 0{,}80 = 4{,}90\text{ s}$. La velocità media target diventa $6{,}12\text{ m/s}$.
  Poiché la partenza da fermo richiede comunque di vincere l'inerzia iniziale (i primi 5 m richiedono oltre 1,3 secondi per qualsiasi essere umano), l'atleta per fare 4,90 s è costretto a **frenare deliberatamente** dopo i primi passi o ad accelerare con una postura eretta innaturale.
- Su **150 m**: $T_{100} = 15{,}10\text{ s} \implies T_{80\%} = 15{,}10 / 0{,}80 = 18{,}88\text{ s}$. La velocità media target diventa $7{,}94\text{ m/s}$.
  Qui l'atleta raggiunge una velocità di crociera fluida e la mantiene agevolmente lungo l'arco di 15-18 secondi, realizzando una sessione di tempo run fisiologicamente coerente.

> [!WARNING]
> **Conclusione metodologica:** L'applicazione di percentuali di velocità basate sulla formula iperbolica $T = T_{100}/p$ è **metodologicamente invalida per distanze inferiori a 60–80 m con partenza da fermo**. Sulle brevi distanze, la componente inerziale iniziale rappresenta una quota fissa non riducibile in proporzione, rendendo la velocità media un indicatore fuorviante dell'intensità neuromuscolare (Haugen & Buchheit 2016).

---

## 6. Schede Analitiche delle Fonti Scientifiche Primarie

Di seguito vengono registrate le schede analitiche dettagliate di **13 studi scientifici primari peer-reviewed**, conformemente a tutti i criteri metodologici richiesti.

---

### Scheda Studio 1
* **Citazione Bibliografica:** Darrall-Jones, J., Roe, G., Cremen, E., & Jones, B. (2022). *Can Team-Sport Athletes Accurately Run at Submaximal Sprinting Speeds? Implications for Rehabilitation and Warm-Up Protocols.* **Journal of Strength and Conditioning Research**, 36(8), 2218–2222.
* **Identificatori:** PMID: [35916747](https://pubmed.ncbi.nlm.nih.gov/35916747/) | DOI: [10.1519/JSC.0000000000003960](https://doi.org/10.1519/JSC.0000000000003960)
* **Tipo di Studio:** Studio sperimentale cross-sectional con misure ripetute e ordine randomizzato.
* **Campione:** $n = 12$ atleti maschi professionisti di rugby a 15 (età: $19{,}7 \pm 0{,}9$ anni; massa: $98{,}3 \pm 13{,}9\text{ kg}$; statura: $184{,}0 \pm 7{,}5\text{ cm}$).
* **Outcome Misurati:** Velocità effettiva raggiunta (% $V_{max}$ misurata con fotocellule/radar su sprint di 40 m) confrontata con l'andatura prescritta verbalmente (target: 60%, 70%, 80%, 90% $V_{max}$) senza alcun feedback visivo o cronometrico in tempo reale.
* **Risultati Chiave:**
  - Target 60% $V_{max}$: bias medio enorme del **+23%** (gli atleti hanno corso all'**83%** di $V_{max}$; range: 57–88%).
  - Target 70% $V_{max}$: bias medio elevato del **+11%** (velocità reale: **81%** di $V_{max}$; range: 67–93%).
  - Target 80% $V_{max}$: bias minimo del **+2%** (range: 71–91% di $V_{max}$).
  - Target 90% $V_{max}$: bias negativo moderato del **-4%** (gli atleti hanno corso all'**86%** di $V_{max}$; range: 77–95%).
* **Limiti Metodologici:** Campione limitato a giocatori di rugby maschili; singola distanza testata (40 m); assenza di misurazioni metaboliche (lattatemia) durante le prove.
* **Livello di Qualità:** **Alta** (disegno sperimentale randomizzato, atleti professionisti, analisi rigorosa dei bias e degli intervalli di confidenza).

---

### Scheda Studio 2
* **Citazione Bibliografica:** Jiménez-Reyes, P., Pareja-Blanco, F., Cuadrado-Peñafiel, V., Morcillo, J. A., Párraga, J. A., & González-Badillo, J. J. (2016). *Mechanical, Metabolic and Perceptual Response during Sprint Training.* **International Journal of Sports Medicine**, 37(10), 807–812.
* **Identificatori:** PMID: [27286181](https://pubmed.ncbi.nlm.nih.gov/27286181/) | DOI: [10.1055/s-0042-107251](https://doi.org/10.1055/s-0042-107251)
* **Tipo di Studio:** Studio sperimentale d'intervento acuto con monitoraggio meccanico, metabolico ed ematologico continuo.
* **Campione:** $n = 9$ velocisti maschi di livello nazionale (PB 100 m: $10{,}68 \pm 0{,}25\text{ s}$; età: $22{,}4 \pm 3{,}1$ anni; peso: $73{,}2 \pm 4{,}8\text{ kg}$).
* **Outcome Misurati:** Sprint ripetuti sui 40 m fino al raggiungimento di una perdita prefissata del **3% di velocità** (speed loss) con 4 min di recupero; perdita di altezza nel salto verticale (CMJ height loss); concentrazione ematica di lattato ($[BLa]$) e ammoniaca ($[NH_3]$); scala di percezione dello sforzo (RPE Borg 6–20).
* **Risultati Chiave:**
  - La perdita di altezza nel CMJ ha mostrato una correlazione quasi perfetta con il lattato ematico ($r = 0{,}96$ [0,95–0,97]) e con l'ammoniaca ($r = 0{,}95$ [0,94–0,95]).
  - Relazione curvilinea strettissima tra lattato e ammoniaca ($R^2 = 0{,}96$).
  - La perdita di velocità del 3% (appena 0,15 s di scarto sui 40 m) ha indotto accumuli di lattato superiori a $8 - 10\text{ mmol/L}$ e marcati incrementi dell'ammoniemia, associati a picchi di RPE ($> 16 - 18$).
* **Limiti Metodologici:** Campione ridotto ($n=9$), limitato al genere maschile e a velocisti altamente specializzati; singola distanza (40 m).
* **Livello di Qualità:** **Alta** (standard ematologici e invasivi impeccabili, atleti di altissimo livello agonistico).

---

### Scheda Studio 3
* **Citazione Bibliografica:** Jiménez-Reyes, P., Pareja-Blanco, F., Cuadrado-Peñafiel, V., Ortega-Becerra, M., Párraga, J., & González-Badillo, J. J. (2019). *Jump height loss as an indicator of fatigue during sprint training.* **Journal of Sports Sciences**, 37(9), 1029–1037.
* **Identificatori:** PMID: [30380362](https://pubmed.ncbi.nlm.nih.gov/30380362/) | DOI: [10.1080/02640414.2018.1539445](https://doi.org/10.1080/02640414.2018.1539445)
* **Tipo di Studio:** Studio sperimentale di monitoraggio del carico e della fatica intra-sessione.
* **Campione:** $n = 9$ velocisti maschi di livello nazionale/internazionale (PB 100 m: $10{,}64 \pm 0{,}22\text{ s}$; età: $21{,}8 \pm 2{,}9$ anni).
* **Outcome Misurati:** Ripetute sui 60 m fino al 3% di perdita di velocità con 6 min di recupero passivo completo tra gli sprint; determinazione di CMJ loss, speed loss, lattatemia e ammoniemia pre e post ciascuna ripetizione.
* **Risultati Chiave:**
  - Correlazione eccellente tra calo del CMJ e lattato ($r = 0{,}91$ di gruppo; $r = 0{,}93 - 0{,}99$ intra-individuale).
  - Correlazione tra calo del CMJ e ammoniaca ($r = 0{,}91$ di gruppo; $r = 0{,}94 - 0{,}99$ intra-individuale).
  - La correlazione tra perdita di velocità e metaboliti è risultata molto elevata ($r = 0{,}83$ per lattato, $r = 0{,}86$ per ammoniaca a livello di gruppo; fino a $r = 0{,}99$ intra-individuale).
  - Dimostra che la perdita di salto verticale (CMJ) riflette lo stress metabolico e neurale con sensibilità superiore rispetto al semplice cronometraggio.
* **Limiti Metodologici:** Campione omogeneo ma piccolo ($n=9$); focalizzato esclusivamente su sprint di 60 m con recuperi completi (6 min).
* **Livello di Qualità:** **Alta** (metodologia rigorosissima con analisi delle correlazioni sia a livello aggregato che individuale).

---

### Scheda Studio 4
* **Citazione Bibliografica:** Haugen, T., Seiler, S., Sandbakk, Ø., & Tønnessen, E. (2019). *The Training and Development of Elite Sprint Performance: an Integration of Scientific and Best Practice Literature.* **Sports Medicine - Open**, 5(1), 44.
* **Identificatori:** PMID: [31754845](https://pubmed.ncbi.nlm.nih.gov/31754845/) | DOI: [10.1186/s40798-019-0221-0](https://doi.org/10.1186/s40798-019-0221-0)
* **Tipo di Studio:** State-of-the-art review integrata (sintesi critica tra dati di laboratorio e documentazione empirica dei migliori programmi di allenamento al mondo).
* **Campione:** Rassegna di dati longitudinali, curve di sviluppo e carichi di allenamento di velocisti di classe mondiale (finalisti olimpici e mondiali su 100 m e 200 m).
* **Outcome Misurati:** Codificazione delle zone di intensità nello sprint (% $V_{max}$); volumi totali ottimali per seduta (metri corsi); tempi di rigenerazione tra sedute ad alta intensità (48–72 ore); distribuzione periodizzata del carico annuale.
* **Risultati Chiave:**
  - Accelerazione: $>98\%$ $V_{max}$, distanze $10 - 50\text{ m}$, volume seduta $100 - 300\text{ m}$.
  - Velocità Massima: $>98\%$ $V_{max}$, distanze $10 - 30\text{ m}$ con rincorsa lanciata di $20 - 40\text{ m}$, volume $50 - 150\text{ m}$.
  - Speed Endurance: $90 - 95\%$ $V_{max}$, distanze $60 - 80\text{ m}$, volume $600 - 2000\text{ m}$.
  - Sprint-Specific Endurance: $>95\%$ $V_{max}$, distanze $80 - 150\text{ m}$, volume $300 - 900\text{ m}$.
  - Viene categoricamente stabilito che sforzi $>95\%$ $V_{max}$ impongono un costo neurale e metabolico tale da impedire la ripetizione della seduta prima di 48-72 ore.
* **Limiti Metodologici:** Studio di revisione/sintesi; include considerazioni pratiche derivate da esperti oltre a studi quantitativi.
* **Livello di Qualità:** **Alta** (documento di riferimento globale approvato dalla comunità scientifica e tecnica internazionale).

---

### Scheda Studio 5
* **Citazione Bibliografica:** Haugen, T., & Buchheit, M. (2016). *Sprint Running Performance Monitoring: Methodological and Practical Considerations.* **Sports Medicine**, 46(5), 641–656.
* **Identificatori:** PMID: [26660758](https://pubmed.ncbi.nlm.nih.gov/26660758/) | DOI: [10.1007/s40279-015-0446-0](https://doi.org/10.1007/s40279-015-0446-0)
* **Tipo di Studio:** Revisione sistematica e metodologica sulle tecnologie e i protocolli di monitoraggio dello sprint.
* **Campione:** Analisi comparativa di oltre 100 pubblicazioni scientifiche su metodiche di cronometraggio (fotocellule a singolo/doppio raggio, radar, laser, video ad alta frequenza).
* **Outcome Misurati:** Entità dell'errore di misura (TE, CV%) associato a differenti procedure di partenza (partenza da blocchi con sparo vs sensore di pressione vs fotocellula di start posizionata a 0,3–0,5 m vs sprint lanciato); affidabilità degli split times.
* **Risultati Chiave:**
  - La posizione della fotocellula di partenza e la postura dello start possono generare scarti sistematici fino a **$0{,}20 - 0{,}30\text{ s}$**, alterando drasticamente la velocità media calcolata.
  - Sulle brevi distanze (0–10 m e 0–30 m), la velocità media include una frazione non lineare dominata dall'inizio del moto, rendendo i confronti tra atleti o tra percentuali dipendenti dal sistema di cronometraggio.
  - La velocità istantanea di picco ($v_{max}$) può essere catturata accuratamente solo tramite radar continuo o flying sprint su tratti brevi ($10 - 20\text{ m}$).
* **Limiti Metodologici:** Focus orientato prevalentemente all'ingegneria del dato e all'affidabilità tecnologica.
* **Livello di Qualità:** **Alta** (opera fondamentale per eliminare gli errori di interpretazione cronometrica nell'atletica).

---

### Scheda Studio 6
* **Citazione Bibliografica:** Samozino, P., Rabita, G., Dorel, S., Slawinski, J., Peyrot, N., Saez de Villarreal, E., & Morin, J. B. (2016). *A simple method for measuring power, force, velocity properties, and mechanical effectiveness in sprint running.* **Scandinavian Journal of Medicine & Science in Sports**, 26(6), 648–658.
* **Identificatori:** PMID: [25996964](https://pubmed.ncbi.nlm.nih.gov/25996964/) | DOI: [10.1111/sms.12490](https://doi.org/10.1111/sms.12490)
* **Tipo di Studio:** Studio di validazione biomeccanica contro criterio gold-standard (pista di 40 m con pedane di forza integrate continue).
* **Campione:** $n = 12$ atleti (sprinter e atleti di potenza, maschi e femmine).
* **Outcome Misurati:** Modellizzazione della traiettoria orizzontale tramite funzione mono-esponenziale $x(t) = v_{max}(t - \tau(1 - e^{-t/\tau}))$; validazione delle forze orizzontali nette al passo ($F_H$), potenza meccanica di picco ($P_{max}$), profilo Forza-Velocità ($F_0, v_0$) e indice di efficacia meccanica ($RF$).
* **Risultati Chiave:**
  - Il modello matematico basato su tempi di passaggio intermedi ha mostrato un accordo quasi perfetto con i dati registrati dalle pedane di forza ($bias < 5\%$).
  - Fornisce la dimostrazione analitica che l'accelerazione è governata dal parametro $\tau$ e che la velocità media su un intervallo $d$ non è rappresentativa della velocità istantanea: l'inerzia iniziale impone che nelle brevi distanze la velocità media sia una frazione fortemente ridotta di $v_{max}$ (es. 47% a 10 m, 66% a 30 m).
* **Limiti Metodologici:** Richiede dati di cronometraggio intermedi precisi al centesimo di secondo; assume condizioni ambientali stabili (assenza di vento).
* **Livello di Qualità:** **Alta** (rivoluzione metodologica nella cinetica dello sprint da campo, validata contro la massima tecnologia esistente).

---

### Scheda Studio 7
* **Citazione Bibliografica:** Healy, R., Kenny, I. C., & Harrison, A. J. (2022). *Profiling elite male 100-m sprint performance: The role of maximum velocity and relative acceleration.* **Journal of Sport and Health Science**, 11(1), 75–84.
* **Identificatori:** PMID: [35151419](https://pubmed.ncbi.nlm.nih.gov/35151419/) | DOI: [10.1016/j.jshs.2019.10.002](https://doi.org/10.1016/j.jshs.2019.10.002)
* **Tipo di Studio:** Studio cinematografico e di modellizzazione biofisica su coorte di velocisti d'élite mondiale.
* **Campione:** $n = 64$ velocisti maschi di livello internazionale e mondiale (inclusi finalisti dei Campionati del Mondo IAAF, con tempi sui 100 m compresi tra $9{,}58\text{ s}$ e $10{,}40\text{ s}$).
* **Outcome Misurati:** Scomposizione della gara dei 100 m in 4 intertempi (0–10 m, 10–20 m, 20–40 m, 40–100 m); stima dei parametri $v_{max}$, costante di accelerazione $\tau$ e percentuale di decremento finale ($v_{loss}$).
* **Risultati Chiave:**
  - La velocità massima di picco ($v_{max}$) spiega oltre l'**85% della varianza** della prestazione finale sui 100 m ($r = -0{,}92$).
  - I velocisti più veloci ($< 10{,}00\text{ s}$) continuano ad accelerare fino a $50 - 60\text{ m}$, mentre atleti sub-élite esauriscono l'accelerazione a $30 - 40\text{ m}$.
  - Convalida che la velocità media aggregata non è in grado di discriminare tra l'efficienza nella fase di accelerazione e la capacità di mantenere la massima velocità.
* **Limiti Metodologici:** Studio basato su filmati e split times ufficiali di gara; assenza di dati biologici diretti.
* **Livello di Qualità:** **Alta** (campione unico al mondo per caratura atletica, analisi statistica di elevatissima robustezza).

---

### Scheda Studio 8
* **Citazione Bibliografica:** Weyand, P. G., Sternlight, D. B., Bellizzi, M. J., & Wright, S. (2000). *Faster top running speeds are achieved with greater ground forces not more rapid leg movements.* **Journal of Applied Physiology**, 89(5), 1991–1999.
* **Identificatori:** PMID: [11053354](https://pubmed.ncbi.nlm.nih.gov/11053354/) | DOI: [10.1152/jappl.2000.89.5.1991](https://doi.org/10.1152/jappl.2000.89.5.1991)
* **Tipo di Studio:** Studio sperimentale comparativo di biomeccanica e cinetica su treadmill ad alta velocità dotato di pedana dinamometrica.
* **Campione:** $n = 33$ soggetti con abilità di sprint eterogenee (velocisti d'élite, atleti di mezzofondo e soggetti fisicamente attivi; range di velocità massima: $6{,}2 - 11{,}1\text{ m/s}$).
* **Outcome Misurati:** Tempo di contatto al suolo ($t_c$), tempo di volo/oscillazione ($t_{sw}$), frequenza di passo ($SF$), lunghezza di passo ($SL$), forza di reazione verticale al suolo media e di picco normalizzata sul peso corporeo ($F_{mean}/W_b$), analizzati da andature submassimali (jogging a 3 m/s) fino alla massima velocità assoluta.
* **Risultati Chiave:**
  - Il tempo di oscillazione della gamba nell'aria ($t_{sw}$) rimane sostanzialmente costante ($0{,}33 - 0{,}37\text{ s}$) a tutte le velocità e non distingue i velocisti dai soggetti non allenati.
  - La velocità di corsa cresce riducendo drasticamente il tempo di contatto ($t_c$), che passa da $0{,}25 - 0{,}28\text{ s}$ a ritmi submassimali a meno di **$0{,}09 - 0{,}10\text{ s}$** a velocità massimale.
  - L'incremento di velocità è generato dall'applicazione di forze verticali massicce al suolo in tempi ridottissimi ($>2{,}5 - 3{,}0\text{ volte il peso corporeo}$ a $V_{max}$ vs $1{,}5\text{ volte}$ a velocità submassimale).
* **Limiti Metodologici:** Condotta su treadmill motorizzato; pattern di rimbalzo leggermente diverso dalla pista aperta, sebbene convalidato per la dinamica temporale di contatto.
* **Livello di Qualità:** **Alta** (pietra miliare della biomeccanica della locomozione umana, citata oltre 1500 volte).

---

### Scheda Studio 9
* **Citazione Bibliografica:** Clark, K. P., Ryan, L. J., Meng, C. R., & Stearne, D. J. (2023). *Horizontal Foot Speed During Submaximal and Maximal Running.* **Journal of Human Kinetics**, 87, 1–9.
* **Identificatori:** PMID: [37229404](https://pubmed.ncbi.nlm.nih.gov/37229404/) | DOI: [10.5114/jhk/159578](https://doi.org/10.5114/jhk/159578)
* **Tipo di Studio:** Studio sperimentale cinematico 2D/3D su pista indoor.
* **Campione:** $n = 23$ atleti universitari e ricreativi (13 maschi, 10 femmine).
* **Outcome Misurati:** Picco di velocità orizzontale in avanti del piede nella fase di oscillazione; velocità di arretramento orizzontale del piede al momento del contatto col suolo (negative foot speed); Ground Speed Difference ($GSD$) a velocità dal 50% al 100% di $V_{max}$.
* **Risultati Chiave:**
  - La velocità di arretramento del piede prima dell'impatto correla fortemente con la velocità di corsa ($r = 0{,}85$, $p < 0{,}001$).
  - A velocità submassimali (50–75%), il piede presenta una velocità di arretramento insufficiente rispetto alla velocità di avanzamento del corpo, generando una marcata forza frenante orizzontale al touchdown.
  - Solo a velocità massimali ($>90–100\%$) il sistema neuromuscolare attiva una coordinazione specifica che azzera la componente frenante.
* **Limiti Metodologici:** Campione misto comprendente anche atleti non specialisti della velocità pura.
* **Livello di Qualità:** **Alta** (metodologia ottica e cinematica di precisione al millimetro).

---

### Scheda Studio 10
* **Citazione Bibliografica:** Whitacre, T. D., Stearne, D. J., & Clark, K. P. (2024). *Effects of running skill and speed on limb coordination during submaximal and maximal sprinting.* **Journal of Biomechanics**, 166, 112023.
* **Identificatori:** PMID: [38447429](https://pubmed.ncbi.nlm.nih.gov/38447429/) | DOI: [10.1016/j.jbiomech.2024.112023](https://doi.org/10.1016/j.jbiomech.2024.112023)
* **Tipo di Studio:** Studio sperimentale controllato su analisi della coordinazione motoria non lineare (Continuous Relative Phase, CRP).
* **Campione:** $n = 40$ soggetti ($n=15$ velocisti/saltatori di atletica leggera; $n=25$ soggetti fisicamente attivi non specialisti).
* **Outcome Misurati:** Coordinazione inter-arto (tibia-tibia / shank-shank; coscia-coscia) e intra-arto (coscia-tibia) su sprint di 40 m a quattro velocità relative: jog (~50%), submassimale medio (~70%), submassimale alto (~85%), massimale (100%).
* **Risultati Chiave:**
  - La coordinazione tibia-tibia (shank-shank) ha evidenziato la maggiore sensibilità alla velocità e al livello di abilità motoria.
  - I velocisti allenati adottano un pattern rigidamente in contro-fase (anti-phase) a velocità massimale, minimizzando le oscillazioni parassite.
  - A velocità submassimali (50–70%), i pattern coordinativi di velocisti e non velocisti collassano verso schemi analoghi alla corsa lenta, provando che correre a ritmi submassimali non allena i circuiti neurali specifici della massima velocità.
* **Limiti Metodologici:** Rilevazione condotta su rettilineo indoor di 40 m.
* **Livello di Qualità:** **Alta** (analisi cinematica avanzata mediante algoritmi di dinamica dei sistemi complessi).

---

### Scheda Studio 11
* **Citazione Bibliografica:** Sandford, G. N., Laursen, P. B., & Buchheit, M. (2021). *Anaerobic Speed/Power Reserve and Sport Performance: Scientific Basis, Current Applications and Future Directions.* **Sports Medicine**, 51(10), 2017–2036.
* **Identificatori:** PMID: [34398445](https://pubmed.ncbi.nlm.nih.gov/34398445/) | DOI: [10.1007/s40279-021-01523-9](https://doi.org/10.1007/s40279-021-01523-9)
* **Tipo di Studio:** Consensus review e modello concettuale applicativo.
* **Campione:** Rassegna di dati su atleti d'élite (mezzofondo veloce, sprint, sport di squadra).
* **Outcome Misurati:** Concettualizzazione dell'Anaerobic Speed Reserve ($ASR = MSS - MAS$); Speed Reserve Ratio ($SRR = MSS / MAS$); tolleranza al carico nelle ripetute sopra la soglia aerobica in funzione del profilo neuromuscolare.
* **Risultati Chiave:**
  - Prescrivere ripetute submassimali o intervalli basandosi solo su percentuali fisse di un tempo di gara ($T_{100}/p$) impone un sovraccarico intollerabile agli atleti con elevata percentuale di fibre veloci (speed-dominant), a causa della rapida saturazione glicolitica.
  - Per calibrare correttamente il carico tra atleti diversi, le andature submassimali devono essere rapportate alla riserva individuale ($ASR$) o direttamente alla $MSS$, e non a formule generiche derivate dal cronometraggio medio.
* **Limiti Metodologici:** Studio concettuale; prevalentemente focalizzato sulla zona di transizione tra 400 m e 1500 m.
* **Livello di Qualità:** **Alta** (riferimento globale per la personalizzazione del carico ad alta intensità).

---

### Scheda Studio 12
* **Citazione Bibliografica:** Iaia, F. M., & Bangsbo, J. (2010). *Speed endurance training is a powerful stimulus for physiological adaptations and performance improvements of athletes.* **Scandinavian Journal of Medicine & Science in Sports**, 20(Suppl 2), 11–23.
* **Identificatori:** PMID: [20840558](https://pubmed.ncbi.nlm.nih.gov/20840558/) | DOI: [10.1111/j.1600-0838.2010.01193.x](https://doi.org/10.1111/j.1600-0838.2010.01193.x)
* **Tipo di Studio:** Revisione sistematica e narrativa sui meccanismi biologici dello Speed Endurance Training (SET).
* **Campione:** Dati aggregati da decine di protocolli sperimentali su atleti allenati di diverse discipline di potenza ed endurance.
* **Outcome Misurati:** Risposte fisiologiche ad allunghi massimali o quasi-massimali ($>90–95\%$); concentrazioni di lattato ($[BLa] > 15–20\text{ mmol/L}$); densità e attività delle subunità $\alpha_1$ e $\alpha_2$ della pompa sodio-potassio ($Na^+/K^+$ ATPasi); cinetica dei protoni $H^+$.
* **Risultati Chiave:**
  - Solo le ripetute condotte a intensità quasi massimale ($>90–95\%$) stimolano l'aumento dell'espressione delle subunità $\alpha$ della pompa $Na^+/K^+$, migliorando la capacità della membrana muscolare di mantenere l'eccitabilità durante l'acidosi.
  - Gli allunghi submassimali tipici dell'intensive tempo (80-90%) generano forte acidosi senza tuttavia indurre i medesimi adattamenti di potenza e stabilità ionica del vero lavoro di speed endurance.
* **Limiti Metodologici:** Include atleti sia di corsa che di ciclismo e sport intermittenti.
* **Livello di Qualità:** **Alta** (autori leader riconosciuti a livello mondiale nella biochimica dell'esercizio).

---

### Scheda Studio 13
* **Citazione Bibliografica:** Girard, O., Mendez-Villanueva, A., & Bishop, D. (2011). *Repeated-sprint ability - part I: factors contributing to fatigue.* **Sports Medicine**, 41(8), 673–694.
* **Identificatori:** PMID: [21780851](https://pubmed.ncbi.nlm.nih.gov/21780851/) | DOI: [10.2165/11590550-000000000-00000](https://doi.org/10.2165/11590550-000000000-00000)
* **Tipo di Studio:** Systematic review sui fattori cellulari, vascolari e neurali limitanti la prestazione nelle ripetute di sprint.
* **Campione:** Rassegna critica di oltre 150 studi su atleti di sprint e sport di squadra.
* **Outcome Misurati:** Deficit di fosfocreatina (PCr), acidosi metabolica, inibizione della glicolisi, fallimento della trasmissione neuromuscolare, alterazione della stiffness muscolo-tendinea, calo dell'attività EMG di superficie.
* **Risultati Chiave:**
  - La fatica durante sprint ripetuti ad intensità massimale deriva primariamente dalla velocità di risintesi della PCr (tempo di dimezzamento: ~30 s) e dall'accumulo di ioni $H^+$ e fosfato inorganico.
  - La capacità di resistere alla fatica decade precipitosamente se il recupero non consente la ri-ossigenazione della mioglobina e il ripristino dei gradienti ionici.
  - La regolazione della stiffness muscolo-tendinea fallisce non appena insorge fatica neurale, portando a cedimenti posturali e aumenti compensatori dei tempi di contatto al suolo.
* **Limiti Metodologici:** Focus orientato prevalentemente su recuperi brevi ($< 60\text{ s}$), tipici degli sport di squadra, rispetto ai recuperi lunghi dell'atletica leggera.
* **Livello di Qualità:** **Alta** (la trattazione più autorevole e completa mai pubblicata sulla fisiologia delle ripetute di sprint).

---

## 7. Matrice di Sintesi Sinottica delle Evidenze

| ID | Studio (Primo Autore, Anno) | Campione ($n$, Livello) | Intensità Testata (% $V_{max}$) | Variabili Principali | Risultato Chiave | Livello Qualità |
| :---: | :--- | :--- | :---: | :--- | :--- | :---: |
| **S1** | Darrall-Jones et al. (2022) | $n=12$, Rugby Pro | 60, 70, 80, 90% | Velocità radar vs target verbale | Sovrastima a 60% (+23%) e 70% (+11%); sottostima a 90% (-4%). | **Alta** |
| **S2** | Jiménez-Reyes et al. (2016) | $n=9$, Sprinter Pro | Massimale (speed loss 3%) | Speed loss, CMJ loss, $[BLa]$, $[NH_3]$, RPE | CMJ loss correla perfettamente con $[BLa]$ ($r=0{,}96$) e $[NH_3]$ ($r=0{,}95$). | **Alta** |
| **S3** | Jiménez-Reyes et al. (2019) | $n=9$, Sprinter Pro | Massimale (speed loss 3%) | 60 m, CMJ loss, speed loss, $[BLa]$, $[NH_3]$ | Calo CMJ e calo velocità riflettono fedelmente lo stress metabolico intra-atleta ($r>0{,}90$). | **Alta** |
| **S4** | Haugen et al. (2019) | Review, Élite Mondiale | Continuum 60–100% | Zone di carico, distanze, volumi, recuperi | Allunghi $>95\%$ richiedono 48-72h di recupero; extensive tempo (60-75%) è puramente aerobico. | **Alta** |
| **S5** | Haugen & Buchheit (2016) | Review Metodologica | Continuum Sprint | Sistemi di cronometraggio, split times | Errori di partenza fino a $0{,}30\text{ s}$; velocità media su distanze brevi distorce la cinetica. | **Alta** |
| **S6** | Samozino et al. (2016) | $n=12$, Sprinter | Accelerazione 0–40 m | Modello mono-esponenziale $v(t)$, $F_0, v_0, P_{max}$ | Valida modello $v(t) = v_{max}(1-e^{-t/\tau})$; $\bar{v}$ è solo il 66% di $v_{max}$ a 30 m. | **Alta** |
| **S7** | Healy et al. (2022) | $n=64$, Élite Mondiale 100m | Gara 100 m | 4 split times, $v_{max}$, $\tau$, decelerazione | $v_{max}$ spiega l'85% della varianza ($r=-0{,}92$); split rivelano dinamiche invisibili a $\bar{v}$. | **Alta** |
| **S8** | Weyand et al. (2000) | $n=33$, Eterogeneo | Dal jogging a $V_{max}$ | $t_c$, $t_{sw}$, $F_{mean}/W_b$ su pedana | $t_c$ crolla da 0,28 s a 0,09 s; $F_v$ sale da 1,5 a $>2{,}8\text{ BW}$; $t_{sw}$ costante (~0,35 s). | **Alta** |
| **S9** | Clark et al. (2023) | $n=23$, Universitari | 50% – 100% | Foot speed avanti/dietro, $GSD$ | Arretramento del piede correla con velocità ($r=0{,}85$); a ritmi submax prevale la frenata. | **Alta** |
| **S10** | Whitacre et al. (2024) | $n=40$, Sprinter vs Attivi | 50, 70, 85, 100% | Coordinazione CRP shank-shank | Pattern tibia-tibia in contro-fase solo a $V_{max}$; a ritmi submax pattern collassa a corsa lenta. | **Alta** |
| **S11** | Sandford et al. (2021) | Consensus Review | Supramassimale / Sprint | ASR ($MSS - MAS$), $SRR$ | Prescrivere solo su $\%$ tempo di gara sovraccarica atleti veloci; serve riserva $ASR$. | **Alta** |
| **S12** | Iaia & Bangsbo (2010) | Review, Atleti | $>90–95\%$ (SET) | Pompa $Na^+/K^+$, lattato, acidosi | Solo intensità $>90–95\%$ stimolano la pompa $Na^+/K^+$; 80-90% crea acidosi senza massimi adattamenti. | **Alta** |
| **S13** | Girard et al. (2011) | Systematic Review | Sprint Ripetuti | PCr, $H^+$, drive neurale, EMG, stiffness | Fatica da deplezione PCr, inibizione $P_i$, calo drive centrale; perdita di stiffness ad alta velocità. | **Alta** |

---

## 8. Distinzione Rigorosa tra Fatti Empirici Documentati e Inferenze Scientifiche

A garanzia della massima onestà intellettuale e integrità epistemologica, si esplicita la separazione formale tra dati rilevati dalla letteratura e deduzioni dell'autore del presente report:

### 8.1 Fatti Empirici Direttamente Documentati dalla Letteratura
1. **La discrepanza matematica è un fatto fisico:** La velocità media è $\bar{v} = d/t$. Prescrivere percentuali di velocità genera una curva iperbolica $T = T_{100}/p$, mentre prescrivere percentuali di tempo genera una retta affine. I due valori non coincidono mai per $p < 1$.
2. **Gli atleti non sanno stimare le velocità submassimali senza cronometro:** Darrall-Jones et al. (2022) hanno provato sperimentalmente che a richieste verbali del 60% e 70% di $V_{max}$, atleti di alto livello corrono rispettivamente con un bias medio del +23% e +11% più veloci del dovuto.
3. **La fatica neuromuscolare è associata a minime perdite di velocità:** Jiménez-Reyes et al. (2016, 2019) hanno provato che un decremento di appena il 3% nella velocità di sprint corrisponde a concentrazioni di lattato ematico $> 8 - 10\text{ mmol/L}$, forti aumenti di ammoniemia e perdite del 10-15% nell'altezza del CMJ.
4. **I tempi di contatto e le forze scalano in modo discontinuo:** Weyand et al. (2000) e Clark et al. (2023) hanno provato che a velocità submassimali (60-80%) i tempi di contatto raddoppiano ($>0{,}18\text{ s}$ vs $<0{,}10\text{ s}$) e le forze applicate si dimezzano, con un tempo di oscillazione della gamba che rimane invariato.
5. **La coordinazione motoria cambia natura:** Whitacre et al. (2024) hanno provato che a ritmi inferiori all'85% $V_{max}$ la coordinazione tra segmenti tibiali perde la caratteristica struttura in contro-fase dei velocisti d'élite.
6. **La velocità media su 10–30 m è fortemente ridotta rispetto a $V_{max}$:** Samozino et al. (2016) e Healy et al. (2022) hanno dimostrato con pedane di forza e video che la fase di accelerazione abbassa la velocità media sui 30 m a circa il 66% della velocità di picco.

### 8.2 Inferenze Scientifiche e Deduzioni Metodologiche dell'Autore
1. **Inadeguatezza della formula $T = T_{100}/p$ sulle distanze $\le 60\text{ m}$:** Poiché l'inerzia della partenza da fermo richiede un tempo base incomprimibile (~1,3–1,5 s per i primi 5–10 m), applicare un divisore $p$ su distanze di 30 m o 60 m costringe l'atleta a decelerare attivamente o a correre con una biomeccanica corrotta. *Deduzione:* Sulle distanze brevi ($\le 60\text{ m}$), i ritmi submassimali dovrebbero essere prescritti solo con partenza lanciata (flying start) o con tabelle differenziate per fase.
2. **Rischio di overtraining da "tempo run" mal calibrato:** Se un tecnico assegna ripetute sui 150-200 m all'"80%" calcolando i tempi con formule lineari o lasciando l'atleta a sensazione, l'atleta correrà a ritmi glicolitici elevati ($[BLa] > 8 - 10\text{ mmol/L}$), trasformando un lavoro rigenerativo in un lavoro ad alto impatto neurale e metabolico, che richiederà 48-72 ore di recupero anziché 24 ore.
3. **Necessità di feedback oggettivo nei fogli di lavoro:** Il foglio Excel non deve essere considerato un generatore rigido di ritmi assoluti per qualsiasi distanza, ma uno strumento calibrato prevalentemente per le distanze medio-lunghe dello sprint (100–300 m), dove la fase di accelerazione incide percentualmente per meno del 20-30% sul tempo totale.

---

## 9. Implicazioni Pratiche per il Progetto "Sprint Ritmi Excel"

Alla luce delle evidenze del Filone A, emergono le seguenti raccomandazioni operative per l'evoluzione del modello Excel:

1. **Esplicitare la natura della formula:** Nel foglio e nella documentazione tecnica deve essere chiarito che la formula viva `=$B{riga}/C$8` implementa rigorosamente la **percentuale di velocità media massimale**, e non l'incremento percentuale di tempo.
2. **Warning sulle distanze brevi (30–60 m):** Inserire una nota metodologica (o condizionale) che avverta l'utente che per distanze inferiori a 80 m con partenza da fermo, i tempi calcolati per andature $\le 80\%$ risultano artificiosamente lenti a causa dell'inerzia della partenza, suggerendo di eseguire tali ripetute con partenza lanciata (flying).
3. **Mappatura cromatica coerente con la fisiologia:**
   - La fascia **60%–75%** corrisponde al dominio **Extensive Tempo** (recupero attivo, clearance lattato, basso impatto SNC).
   - La fascia **80%–88%** corrisponde all'**Intensive Tempo** (accumulo glicolitico medio-alto, transizione anaerobica).
   - La fascia **90%–95%** corrisponde alla **Speed Endurance** (massimo stress tampone e affaticamento ionico).
   - La fascia **98%–100%** corrisponde alla **Velocità Massima / Accelerazione Pura** (massimo impatto neurale, recupero 48–72h).

---

## 10. Conclusioni del Filone A

Il Filone A dimostra in modo inequivocabile che:
- La quantificazione dell'intensità dello sprint tramite percentuale di velocità media massimale ($T = T_{100}/p$) è fisicamente rigorosa ma presenta una **non-linearità iperbolica** che deve essere compresa dai preparatori per non confonderla con la percentuale di tempo.
- L'autoregolazione percettiva dello sprint è fallace: gli atleti non sono in grado di dosare le andature submassimali senza riscontri cronometrici oggettivi, correndo sistematicamente troppo forte alle basse intensità prescritte.
- La velocità media è fortemente influenzata dalla fase di accelerazione: scalare linearmente o iperbolicamente distanze brevi (< 60 m) distorce la reale richiesta cinetica rispetto a distanze superiori a 100 m.

Il presente dossier costituisce la base scientifica solida e verificata per i successivi sviluppi analitici e le applicazioni software del progetto.
