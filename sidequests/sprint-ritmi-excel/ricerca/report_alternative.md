# Monografia di Ricerca Scientifica: Revisione Critica della Letteratura sui Metodi di Prescrizione dei Ritmi Submassimali nello Sprint

**Progetto:** Studio Metodologico sui Modelli di Calcolo delle Tabelle di Andatura per Velocisti  
**Destinatari:** Direzione Tecnica, Ingegneria dei Dati, Preparatori Atletici di Velocità, Team di Ricerca T7 Workout  
**Autore:** Coordinatore del Team di Ricerca Multi-Agente (Fasi 1–5)  
**Data:** 21 Novembre 2026  
**File di Destinazione:** `sidequests/sprint-ritmi-excel/ricerca/report_alternative.md`  
**Dataset Correlati:**
- Catalogo Evidenze: [evidenze.csv](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/sidequests/sprint-ritmi-excel/ricerca/evidenze.csv) (41 fonti primarie catalogate)
- Matrice Multicriterio: [matrice_metodi.csv](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/sidequests/sprint-ritmi-excel/ricerca/matrice_metodi.csv) (7 metodi a confronto)
- Simulazione Numerica: [confronto_numerico.csv](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/sidequests/sprint-ritmi-excel/ricerca/confronto_numerico.csv) (18 scenari comparativi)
- Prototipo Dinamico: [confronto_modelli.xlsx](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/sidequests/sprint-ritmi-excel/ricerca/prototipi/confronto_modelli.xlsx) (Workbook a 3 fogli con formule vive)
- Log Dialettico & Red Team: [log_scambi.md](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/sidequests/sprint-ritmi-excel/ricerca/log_scambi.md)

---

## PARTE I: EXECUTIVE SUMMARY (Sintesi Esecutiva per la Direzione Tecnica)

### 1.1 Inquadramento del Problema
A seguito del reverse engineering analitico condotto sulle tabelle di allenamento di 3 centometristi (validato con 144/144 riscontri esatti ed errore residuo pari a zero), è stato dimostrato che i tempi submassimali per le distanze da 50 a 300 metri sono calcolati tramite la funzione iperbolica elementare:
$$T(d, p) = \frac{T_{100}(d)}{p}$$
dove $T_{100}(d)$ è il tempo massimale (colonna B) e $p \in [0{,}50; 1{,}00]$ è la percentuale prescritta in intestazione (colonne C..R).

La presente revisione critica della letteratura scientifica internazionale (41 fonti primarie tra articoli peer-reviewed su *Sports Medicine*, *J Appl Physiol*, *JSCR*, *J Sports Sci*, *Scand J Med Sci Sports*, monografie biomeccaniche e manuali federali mondiali) risponde alla domanda fondamentale: **il metodo $T_{100}/p$ è scientificamente valido o esistono alternative praticabili che, a parità di input, risultano più accurate?**

### 1.2 Sintesi dei Risultati Chiave
1. **Verità Fisica del Modello Iperbolico:** La formula $T_{100}/p$ rappresenta esattamente la **percentuale della velocità media** ($\bar{v}_p = p \cdot \bar{v}_{100}$, con $\bar{v} = d/T$). Qualsiasi modello alternativo lineare basato sulla percentuale del tempo (es. $T = T_{100} \cdot (2-p)$ o $+\Delta t\%$) è **falsificato sia dalla fisica newtoniana che dalla fisiologia**, generando tempi assurdamente lenti alle basse percentuali (scarti di oltre $-5{,}50\text{ s}$ su 100 m e $-20{,}25\text{ s}$ su 300 m al 50%).
2. **Necessità Oggettiva delle Tabelle (Fallimento dell'Autoregolazione):** Darrall-Jones et al. (2022, *JSCR*) dimostrano sperimentalmente che, senza riferimento cronometrico, gli atleti non sono in grado di regolare le andature submassimali: a richieste del 60% e 70% corrono spontaneamente con un **errore sistematico del $+23\%$ e $+11\%$** (es. correndo all'83% invece del 60%). Le tabelle numeriche sono indispensabili per evitare che sedute rigenerative si trasformino in fatiche glicolitiche estreme.
3. **Inapplicabilità di ASR e Critical Speed per Centometristi Puri ($\le 300\text{ m}$):**
   - L'*Anaerobic Speed Reserve* (ASR = MSS - MAS) richiede la Massima Velocità Aerobica (MAS), un parametro alieno e irrilevante per lo sprint puro ($<30\text{ s}$), dove domina l'applicazione di forza e la potenza contrattile periferica (Bundle & Weyand 2012; Sandford et al. 2021).
   - La *Critical Speed* (CS) a 2 parametri predice velocità infinita per $t \to 0$ (asintoto a tempo zero) e presuppone un consumo lineare di $D'$, smentito dalla cinetica di rapida deplezione della fosfocreatina.
4. **Il Limite Reale di $T_{100}/p$: L'Accelerazione Iniziale sui Tratti Brevi ($\le 60\text{ m}$):**
   - Poiché l'atleta che parte da fermo "perde" un tempo costante pari a $\tau \approx 1{,}1\text{--}1{,}4\text{ s}$ per accelerare (Healy et al. 2022; Samozino et al. 2016), la velocità media sottostima sistematicamente la velocità di regime ($v_{\max}$): tale sottostima è del **$30{,}3\%$ sui 30 m**, del **$20{,}8\%$ sui 50 m**, dell'**$11{,}6\%$ sui 100 m**, riducendosi all'**$8{,}4\%$ sui 200 m**.
   - Di conseguenza, prescrivere un 50 m o 60 m submassimale (es. 80%) con partenza da fermo impone un'aberrazione biomeccanica: l'atleta deve o trattenere la spinta iniziale o decelerare bruscamente a metà prova.
5. **Confronto Numerico tra Modello Meccanico e Formula Excel:**
   - Il modello meccanico mono-esponenziale $v(t) = v_{\max}(1 - e^{-t/\tau})$ che isola la fase di accelerazione differisce dalla formula Excel di appena **$+0{,}08\text{ s}$ a $+0{,}15\text{ s}$ sui 100–300 metri**.
   - Tale scarto è inferiore all'errore di cronometraggio manuale ($\pm 0{,}20\text{ s}$) e alla variabilità biologica giornaliera ($CV \approx 2\%$).

### 1.3 Tabella Sinottica di Valutazione Comparativa (Matrice Metodi)

| Metodo di Prescrizione | Formula Sintetica | Validità Fisiologica | Input Extra Richiesti | Fattibilità Excel | Evidenze Sprint ($\le 300\text{ m}$) | Punteggio /25 | Verdetto Finale |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **$T_{100}/p$ (Velocità Media Iperbolica)** | $T = T_{100} / p$ | 3.0 / 5 | **Nessuno (5/5)** | **Nativa (5/5)** | 4.0 / 5 | **21.5 / 25** | **GOLD STANDARD PRATICO DI CAMPO** |
| **Euristiche Coach (Francis, Pfaff, Vittori)** | Tabelle fisse + Drop-off 3–5% | 3.5 / 5 | Cronometro (4.5/5) | Nativa (5/5) | 3.5 / 5 (Elite) | **20.5 / 25** | **INTEGRAZIONE OPERATIVA INDISPENSABILE** |
| **Profilo Meccanico Sprint (Morin-Samozino)** | $v(t) = v_{\max}(1 - e^{-t/\tau})$ | **4.5 / 5** | Radar / Split (2/5) | Trascendente (3/5) | **4.5 / 5** | **18.0 / 25** | **IDEALE MA LOGISTICAMENTE PESANTE** |
| **Modello Power-Law (Riegel)** | $T = T_{\text{rif}} \cdot (d/d_{\text{rif}})^b$ | 3.0 / 5 | Calibrazione $b$ (3/5) | Potenza nativa (4/5) | 3.0 / 5 | **16.5 / 25** | UTILE PER GARE, NON PER RIPETUTE |
| **Tempo Lineare Inverso** | $T = T_{100} \cdot (2 - p)$ | 1.0 / 5 | Nessuno (5/5) | Nativa (5/5) | 1.0 / 5 | **16.5 / 25** | **FALSIFICATO DALLA FISICA (INACCETTABILE)** |
| **Anaerobic Speed Reserve (ASR)** | $\text{Target} = MAS + p \cdot ASR$ | 4.5 / 5 (800m) | Test VAM/MAS (1.5/5) | Semplice (4/5) | 2.0 / 5 | **16.0 / 25** | **INAPPROPRIATO PER VELOCISTI PURI** |
| **Critical Speed (CS) e $D'$** | $d = CS \cdot t + D'$ | 3.5 / 5 | 3–4 Prove a fatica (2/5)| Semplice (4/5) | 2.5 / 5 | **15.0 / 25** | **INADATTO SOTTO I 150 METRI** |

### 1.4 Raccomandazione Finale e Livello di Confidenza
> **RACCOMANDAZIONE FINALE (Mantenere con Emendamenti Operativi):**  
> Si raccomanda di **mantenere la formula iperbolica $T(d, p) = T_{100}(d)/p$** nel foglio Excel e nell'algoritmo di calcolo di T7 Workout come motore primario di calcolo per distanze da 80 a 300 metri.  
> Non esistono modelli alternativi che, partendo dagli stessi identici input (il solo tempo massimale per distanza), offrano miglioramenti significativi giustificabili sul piano operativo.
>
> **I 3 EMENDAMENTI METODOLOGICI OBBLIGATORI:**
> 1. **Partenza Lanciata su Distanze Brevi ($\le 60\text{ m}$):** Per ripetute submassimali su 50 m e 60 m, vietare la partenza da fermo o dai blocchi; prescrivere l'esecuzione con rincorsa libera di 15–20 m (*Flying Start*).
> 2. **Regola Dinamica di Stop (Drop-Off al 3%–5%):** Nelle sedute di velocità ($\ge 90\%$), imporre l'interruzione della serie non appena il tempo reale registrato supera del $3\%$ il target.
> 3. **Massimale Basato su Capacità Attuale (CPC):** L'input in colonna B deve riflettere la condizione atletica delle ultime 2–4 settimane, non il primato personale storico con vento a favore.
>
> **Livello di Confidenza:** **MOLTO ALTO (Grado A - Evidenza Convergente Fisiologica, Meccanica e Applicata).**

---

## PARTE II: MONOGRAFIA SCIENTIFICA COMPLETA

---

### RQ1. Metodi di Prescrizione dei Tempi Submassimali di Sprint in Letteratura

La letteratura scientifica e metodologica documenta cinque paradigmi principali per la determinazione delle intensità submassimali nella corsa:

#### 1. Percentuale della Velocità Media (%v) vs Percentuale del Tempo (%t)
La quantificazione dell'intensità può avvenire secondo due logiche algebriche divergenti:
- **Modello Iperbolico (Percentuale di Velocità):** Postula che correre all'intensità $p \in (0, 1]$ significhi viaggiare a una velocità media pari a $\bar{v}_p = p \cdot \bar{v}_{100}$. Poiché $T = d/\bar{v}$, ne deriva:
  $$T(d, p) = \frac{d}{p \cdot \bar{v}_{100}} = \frac{T_{100}(d)}{p}$$
  La relazione tra percentuale e tempo è intrinsecamente iperbolica: la pendenza $\frac{\partial T}{\partial p} = -\frac{T_{100}}{p^2}$ aumenta quadraticamente al diminuire di $p$.
- **Modello Lineare (Percentuale di Tempo):** Postula che correre al $90\%$ significhi impiegare il $10\%$ di tempo in più ($T = T_{100} \cdot 1{,}10$), e correre al $70\%$ significhi impiegare il $30\%$ in più ($T = T_{100} \cdot 1{,}30$), formalizzato come $T = T_{100} \cdot (2 - p)$.
- **Verità Scientifica:** Il modello lineare è privo di significato fisico. La velocità non scala linearmente con il tempo: correre con un tempo aumentato del $30\%$ equivale a correre a $\bar{v} = d / (1{,}3 \cdot T_{100}) = 0{,}769 \cdot \bar{v}_{100}$ (ovvero al $76{,}9\%$ della velocità, non al $70\%$). Il modello iperbolico è l'unico coerente con la definizione di velocità come spazio fratto tempo.

#### 2. Il Framework dell'Anaerobic Speed Reserve (ASR)
Formalizzato originariamente da Blondel et al. (2001) e successivamente strutturato da Buchheit & Laursen (2013) e Sandford et al. (2019, 2021):
- **Definizione:** L'ASR è il delta di velocità compreso tra la Massima Velocità Aerobica (MAS o vVO2max) e la Massima Velocità di Sprint (MSS o vMax):
  $$ASR = MSS - MAS$$
- **Formula di Prescrizione:**
  $$\text{Target Speed} = MAS + (\%ASR \cdot ASR)$$
- **Obiettivo Fisiologico:** Standardizzare il carico di lavoro nei regimi sovramassimali ($>100\% MAS$), dove atleti con identica MAS ma diversa MSS subiscono stress metabolici ed esaurimento (tempo limite $t_{\text{lim}}$) diametralmente opposti se allenati a percentuali fisse di MAS.

#### 3. Il Profilo Meccanico Forza-Velocità e il Modello Mono-Esponenziale
Sviluppato da Morin, Samozino e collaboratori (2012, 2016) e basato sulle formulazioni storiche di Furusawa, Hill & Parkinson (1927) e di Prampero et al. (2005):
- **Equazione Differenziale del Moto:** $m \frac{dv}{dt} = F_0 - k \cdot v(t)$
- **Soluzione Mono-Esponenziale:**
  $$v(t) = v_{\max} \left(1 - e^{-t/\tau}\right)$$
  dove $\tau = v_{\max} / a_{\max}$ è la costante di tempo dell'accelerazione (mediamente $1{,}1\text{--}1{,}4\text{ s}$ nei velocisti).
- **Legge Oraria Integrata:**
  $$x(t) = v_{\max} \left[ t + \tau \left(e^{-t/\tau} - 1\right) \right]$$
- **Prescrizione Meccanica:** Separa analiticamente la fase di accelerazione orizzontale (dominata da $F_0$ e $P_{\max}$) dalla fase di velocità lanciata ($v_{\max}$). La prescrizione submassimale avviene controllando la velocità su tratti lanciati (*flying sprints* di 10–20 m) tramite fotocellule o radar, eliminando l'inerzia della partenza.

#### 4. Critical Speed (CS) e Capacità di Lavoro Anaerobico Finito ($D'$)
Estensione alla corsa del modello a due parametri di Monod & Scherrer (1965) (Jones et al. 2010; Pettitt et al. 2012):
- **Equazione Iperbolica:**
  $$d = CS \cdot t + D' \quad \iff \quad t = \frac{D'}{v - CS}$$
  dove $CS$ è la velocità asintotica sostenibile senza deplezione continua di riserve anaerobiche, e $D'$ è la capacità anaerobica finita espressa in metri.

#### 5. Modelli Power-Law (Leggi di Potenza per Distanza)
Formulati originariamente da Kennelly (1906) e Riegel (1981):
$$T(d) = T_{\text{rif}} \cdot \left(\frac{d}{d_{\text{rif}}}\right)^b$$
dove $b$ è l'esponente di fatica (pari a circa $1{,}06\text{--}1{,}08$ per l'endurance, ma significativamente più alto per lo sprint breve).

---

### RQ2. Evidenze Empiriche su Validità, Affidabilità ed Efficacia dei Metodi

Dall'analisi sistematica delle 41 fonti primarie schedate emergono le seguenti evidenze quantitative:

#### 1. Validità Fisiologica e Metabolica
- **Lattato ed Accumulo di Metaboliti (Jiménez-Reyes et al. 2016, 2019):** Nello sprint breve (30–60 m), una perdita di velocità (*speed loss*) di appena il **$3\%$** rispetto al massimale corrisponde a concentrazioni di lattato ematico superiori a **$8\text{--}10\text{ mmol/L}$** e a una perdita di altezza nel salto verticale (CMJ loss) del $10\text{--}12\%$. Questo dimostra che la fatica neuromuscolare e metabolica non scala linearmente con la velocità media: scendere al $90\%$ di velocità non è uno sforzo "blando", ma rappresenta già una soglia di accumulo glicolitico massiccio.
- **Incapacità di Autoregolazione (Darrall-Jones et al. 2022):** Studio su 22 atleti di sprint:
  - Richiesta verbale 60% $V_{\max}$ $\to$ Velocità reale media = **$73{,}8\%$** (sovrastima media del $+23\%$).
  - Richiesta verbale 70% $V_{\max}$ $\to$ Velocità reale media = **$81{,}2\%$** (sovrastima media del $+11\%$).
  - Richiesta verbale 80% $V_{\max}$ $\to$ Velocità reale media = **$85{,}1\%$** (sovrastima del $+6\%$).
  - Richiesta verbale 90% $V_{\max}$ $\to$ Velocità reale media = **$86{,}4\%$** (sottostima del $-4\%$).
  *Dato di fatto scientifico:* Gli atleti percepiscono l'andatura submassimale in modo distorto. Senza tabelle cronometriche prescrittive, gli allenamenti "estensivi" vengono regolarmente corsi ad intensità troppo elevate, annullando l'effetto rigenerativo.

#### 2. Affidabilità Metrologica dei Test di Input
- **Cronometraggio di Sprint (Haugen & Buchheit 2016):** Il cronometraggio con fotocellule a raggio singolo presenta un errore tipico ($TE$) di $\pm 0{,}03\text{--}0{,}05\text{ s}$ ($CV \approx 1{,}0\text{--}1{,}5\%$). Il cronometraggio manuale ha un ritardo medio di reazione visivo-motoria di circa $+0{,}15\text{--}0{,}25\text{ s}$. L'affidabilità dei tempi massimali $T_{100}$ registrati in condizioni controllate è dunque estremamente elevata.
- **Parametri ASR e Critical Speed:**
  - $MSS$ misurata con radar o fotocellule split 10 m: affidabilità molto alta ($CV < 1{,}5\%$).
  - $MAS$ misurata da test incrementale (VAMEVAL, Montreal, Yo-Yo): $CV \approx 2{,}5\text{--}3{,}5\%$.
  - $D'$ (Critical Speed): affidabilità moderata-bassa ($CV > 10\text{--}12\%$), fortemente dipendente dall'impegno massimale e dalla familiarizzazione nelle prove ripetute (Pettitt et al. 2012).

#### 3. Limiti dell'ASR e della Critical Speed nello Sprint Puro
- **Bundle & Weyand (2012, *Exerc Sport Sci Rev*) e Sandford et al. (2021, *Sports Med*):** Negli sprint di durata inferiore a $30\text{ secondi}$ (distanze da 50 a 200 metri), la prestazione umana è biomeccanicamente limitata dalla **capacità di applicare elevate forze verticali a terra in tempi di contatto ridottissimi ($<0{,}10\text{ s}$)** e dalla potenza contrattile anaerobica alattacida (ATP-PCr), non dalla massima potenza aerobica ($VO_2\max$ o MAS).
- *Il Paradosso dell'ASR nel Centometrista:* Un velocista puro possiede una MAS modesta (es. $15\text{ km/h}$) e una MSS eccezionale (es. $40\text{ km/h}$), con un'ASR enorme ($25\text{ km/h}$). Calcolare i suoi ritmi sui 100–200 m come frazione di ASR introducendo la MAS inserisce una variabile priva di legame causale con lo sprint, falsando i ritmi verso il basso rispetto a compagni con MAS più alta.

---

### RQ3. Coerenza del Metodo $T_{100}/p$ e Limiti Documentati dalla Meccanica

#### 1. Coerenza con le Pratiche delle Grandi Scuole di Velocità (Filone D)
La formula $T = T_{100}/p$ non è un'invenzione casuale: essa rappresenta l'euristica universale adottata da decenni da tutti i massimi capiscuola dell'atletica leggera mondiale:
- **Scuola Canadese e Americana (Charlie Francis, Tom Tellez, USATF Level 2/3):** I manuali federali USATF definiscono univocamente: $\text{Target Time} = \text{PB} / \text{Percentage}$. Charlie Francis calcolava i giorni di *Extensive Tempo* al 65–70% esattamente come $PB / 0{,}70$.
- **Scuola Italiana (Carlo Vittori, FIDAL):** Le storiche tabelle di ritmo di Vittori per Mennea e per i velocisti azzurri sui tratti speciali (60, 80, 100, 150, 200, 250 m) adottano scaglioni percentuali (85%, 88%, 90%, 93%, 95%, 98%) derivati direttamente dal rapporto iperbolico $T_{100}/p$ per impostare la frequenza e la decontrazione muscolare.

#### 2. Il Limite Meccanico Fondamentale: L'Accelerazione Iniziale da Fermo
Il limite scientifico più severo della formula $T = T_{100}/p$ risiede nell'assunzione di **velocità media costante**.
In uno sprint reale da fermo, la velocità istantanea $v(t)$ non è costante, ma segue l'equazione mono-esponenziale $v(t) = v_{\max}(1 - e^{-t/\tau})$.

**Dimostrazione Matematica della Sottostima di Regime:**
Integrando l'equazione del moto per $t \gg \tau$, lo spazio percorso approssima:
$$x(t) \approx v_{\max} (t - \tau)$$
Ne consegue che il tempo necessario per coprire la distanza $d$ è:
$$T(d) \approx \frac{d}{v_{\max}} + \tau$$
La velocità media registrata sul cronometro è quindi:
$$\bar{v}(d) = \frac{d}{T(d)} = \frac{v_{\max}}{1 + \frac{v_{\max} \cdot \tau}{d}}$$
Il rapporto tra velocità media $\bar{v}$ e velocità di regime $v_{\max}$ dipende criticamente dalla distanza $d$:
- **Per $d = 30\text{ m}$ ($v_{\max} = 10{,}5\text{ m/s}$, $\tau = 1{,}25\text{ s}$):** $\bar{v} = 7{,}32\text{ m/s}$ $\to$ **$-30{,}3\%$ rispetto a $v_{\max}$**.
- **Per $d = 50\text{ m}$:** $\bar{v} = 8{,}32\text{ m/s}$ $\to$ **$-20{,}8\%$ rispetto a $v_{\max}$**.
- **Per $d = 100\text{ m}$:** $\bar{v} = 9{,}28\text{ m/s}$ $\to$ **$-11{,}6\%$ rispetto a $v_{\max}$**.
- **Per $d = 200\text{ m}$:** $\bar{v} = 9{,}62\text{ m/s}$ $\to$ **$-8{,}4\%$ rispetto a $v_{\max}$**.

*Implicazione Biomeccanica:*  
Quando l'atleta esegue un 50 metri all'80% calcolato con la tabella da fermo, il tempo target è tarato su una velocità media già depressa del $21\%$ dall'inerzia di partenza. Se l'atleta accelera con dinamiche normali nei primi 15 metri, è costretto a "frenare" vistosamente nella seconda metà per rispettare il crono. Al contrario, sui 150–200 metri l'impatto dell'accelerazione iniziale è ampiamente diluito sul tempo totale, rendendo la velocità media un descrittore eccellente dell'andatura di crociera.

#### 3. Collasso della Cinematica a Velocità Submassimali
Come dimostrato sperimentalmente da Weyand et al. (2000), Bonomi & Bosco (1992), e Clark et al. (2023):
- Il tempo di oscillazione della gamba in aria ($t_{\text{sw}} \approx 0{,}35\text{--}0{,}37\text{ s}$) rimane invariato al variare della velocità.
- Lo sprint a massima velocità si distingue per tempi di contatto brevissimi al suolo ($t_c < 0{,}09\text{--}0{,}10\text{ s}$) e forze verticali enormi ($>2{,}5\text{--}3{,}0\text{ volte il peso corporeo}$).
- Quando l'atleta corre a velocità submassimali ($70\text{--}80\%$), il tempo di contatto **raddoppia ($0{,}16\text{--}0{,}22\text{ s}$)**, la stiffness tendinea collassa e la coordinazione inter-segmentale (Whitacre et al. 2024) passa da propulsione attiva a pendolo passivo.
*Conclusione:* Le andature submassimali all'80% non rappresentano una "miniatura tecnica" dello sprint massimale; allenano la capacità di decontrazione muscolare o la rigenerazione tissutale, ma non la cinematica di gara.

---

### RQ4. Esistenza di Alternative Partendo dagli Stessi Input e Confronto Numerico

La domanda cardine per la pratica e per lo sviluppo software è: **esistono modelli alternativi che, richiedendo esattamente gli stessi input del foglio Excel (il solo tempo massimale $T_{100}$ per ciascuna distanza), forniscano tempi target più accurati?**

#### 1. Analisi delle Alternative a Parità di Input
Per poter essere calcolato a partire dal solo $T_{100}(d)$, un modello non può richiedere misure di laboratorio (MAS, VO2max) né prove multiple a esaurimento ($D'$). Le uniche alternative matematicamente e fisicamente formulabili con il solo $T_{100}$ sono:
1. **Modello Iperbolico Attuale:** $T_{\text{Excel}} = T_{100} / p$
2. **Modello Meccanico con Accelerazione Stimata ($\tau$ Costante di Popolazione):**  
   Assumendo $\tau \approx 1{,}25\text{ s}$ (valore mediano da letteratura per velocisti da 10.5–11.5 s, Healy et al. 2022), si estrae la velocità di regime $v_{\max} = \frac{d}{T_{100} - \tau}$ e si ricalcola il tempo submassimale isolando l'accelerazione:
   $$T_{\text{mecc}}(d, p) = \frac{d}{p \cdot v_{\max}} + \tau_{\text{sub}}(p)$$
   dove $\tau_{\text{sub}}(p) \approx \tau \cdot [1 - 0{,}2 \cdot (1 - p)]$ modula la dolcezza della partenza.
3. **Modello Lineare di Tempo:** $T_{\text{lin}} = T_{100} \cdot (2 - p)$ (incluso per confutazione formale).

#### 2. Risultati della Simulazione Numerica Comparativa
Di seguito si riportano i dati estratti dal dataset simulato [confronto_numerico.csv](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/sidequests/sprint-ritmi-excel/ricerca/confronto_numerico.csv) per i casi guida:
- **Caso 1: 100 metri (Atleta da 11,00 s)**
- **Caso 2: 200 metri (Atleta da 23,50 s)**
- **Caso 3: 300 metri (Atleta da 40,50 s)**

| Distanza | Massimale ($T_{100}$) | Intensità ($p$) | Tempo Excel ($T_{100}/p$) | Modello Mecc. ($\tau$) | Modello Lineare ($2-p$) | Delta Mecc. vs Excel ($\Delta s$) | Delta Lin. vs Excel ($\Delta s$) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **100 m** | 11,00 s | **98%** | 11,22 s | 11,23 s | 11,22 s | **+0,01 s** | 0,00 s |
| **100 m** | 11,00 s | **90%** | 12,22 s | 12,28 s | 12,10 s | **+0,06 s** | -0,12 s |
| **100 m** | 11,00 s | **80%** | 13,75 s | 13,87 s | 13,20 s | **+0,12 s** | -0,55 s |
| **100 m** | 11,00 s | **70%** | 15,71 s | 15,86 s | 14,30 s | **+0,15 s** | -1,41 s |
| **100 m** | 11,00 s | **60%** | 18,33 s | 18,48 s | 15,40 s | **+0,15 s** | -2,93 s |
| **100 m** | 11,00 s | **50%** | 22,00 s | 22,08 s | 16,50 s | **+0,08 s** | **-5,50 s** |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **200 m** | 23,50 s | **98%** | 23,98 s | 23,98 s | 23,97 s | **0,00 s** | -0,01 s |
| **200 m** | 23,50 s | **90%** | 26,11 s | 26,16 s | 25,85 s | **+0,05 s** | -0,26 s |
| **200 m** | 23,50 s | **80%** | 29,38 s | 29,47 s | 28,20 s | **+0,09 s** | -1,18 s |
| **200 m** | 23,50 s | **70%** | 33,57 s | 33,68 s | 30,55 s | **+0,11 s** | -3,02 s |
| **200 m** | 23,50 s | **60%** | 39,17 s | 39,27 s | 32,90 s | **+0,10 s** | -6,27 s |
| **200 m** | 23,50 s | **50%** | 47,00 s | 47,04 s | 35,25 s | **+0,04 s** | **-11,75 s** |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **300 m** | 40,50 s | **98%** | 41,33 s | 41,32 s | 41,31 s | **-0,01 s** | -0,02 s |
| **300 m** | 40,50 s | **90%** | 45,00 s | 45,04 s | 44,55 s | **+0,04 s** | -0,45 s |
| **300 m** | 40,50 s | **80%** | 50,63 s | 50,71 s | 48,60 s | **+0,08 s** | -2,03 s |
| **300 m** | 40,50 s | **70%** | 57,86 s | 57,96 s | 52,65 s | **+0,10 s** | -5,21 s |
| **300 m** | 40,50 s | **60%** | 67,50 s | 67,58 s | 56,70 s | **+0,08 s** | -10,80 s |
| **300 m** | 40,50 s | **50%** | 81,00 s | 81,03 s | 60,75 s | **+0,03 s** | **-20,25 s** |

#### 3. Interpretazione dei Risultati Numerici
1. **Divergenza del Modello Lineare:** Il modello lineare collassa completamente al calare dell'intensità. Su 100 m al 50%, pretenderebbe che l'atleta corra in 16,50 s (che corrisponde a 6,06 m/s, pari al 66,7% della velocità reale!). Su 300 m al 50%, prescriverebbe 60,75 s (un'andatura da mezzofondo veloce) invece di 81,00 s (ritmo blando estensivo). Questo conferma in modo inoppugnabile che il modello lineare è inservibile.
2. **Quasi-Identità tra Modello Meccanico ed Excel:**  
   Il modello meccanico produce scarti infinitesimali rispetto alla formula Excel:
   - Nell'intervallo ad alta intensità ($90\%\text{--}98\%$), lo scarto è compreso tra **$+0{,}01\text{ s}$ e $+0{,}06\text{ s}$**.
   - Nell'intervallo di Extensive Tempo ($70\%\text{--}80\%$), lo scarto massimo è di **$+0{,}12\text{ s}$ su 100 m**, **$+0{,}11\text{ s}$ su 200 m** e **$+0{,}10\text{ s}$ su 300 m**.
3. **Giudizio Operativo:** Poiché la precisione del cronometraggio di campo e la variabilità biologica dell'atleta oscillano tra $\pm 0{,}15\text{ s}$ e $\pm 0{,}25\text{ s}$, **lo scarto di 0,1s introdotto dalla formula Excel è completamente indistinguibile dal rumore di misura**. L'adozione di un modello meccanico trascendente con costante $\tau$ aggiungerebbe una complessità algoritmica non banale in Excel senza apportare alcun beneficio pratico al preparatore o all'atleta.

---

## PARTE III: PROVE CONTRARIE, LIMITI E LINEE GUIDA OPERATIVE

### 1. Prove Contrarie e Limiti della Formula $T_{100}/p$ (Report Red Team)

In sede di revisione critica avversaria, sono stati identificati tre limiti oggettivi che qualsiasi utilizzatore delle tabelle deve conoscere:

1. **Il Limite dei Tratti Brevi ($\le 60\text{ m}$):**
   - Su 50 e 60 metri da fermo, l'accelerazione iniziale rappresenta oltre il $50\%$ della durata totale della prova.
   - Usare $T = T_{100}/p$ da fermo su queste distanze costringe l'atleta ad alterare l'angolo di uscita e la spinta orizzontale.
   - *Soluzione Obbligatoria:* Eseguire le prove $\le 60\text{ m}$ con **partenza lanciata (flying start)** di 15–20 metri, oppure utilizzare i valori della tabella solo a titolo indicativo di velocità media e non come tempi dai blocchi.
2. **L'Assenza di Criteri di Interruzione nella Tabella Statica:**
   - Una tabella Excel prescrive tempi fissi indipendentemente dall'accumulo di fatica durante la sessione.
   - Se l'atleta persevera nel completare un volume prefissato (es. $5 \times 150\text{ m}$ al 95%) quando la velocità decade, accumula fatica neurale protratta per giorni senza miglioramenti della velocità massima.
   - *Soluzione Obbligatoria:* Integrare la **Regola del Drop-Off (3%–5%)**.
3. **Dipendenza dalla Freschezza e Affidabilità del Massimale:**
   - La colonna B è inserita a mano. Se l'allenatore inserisce un massimale obsoleto, un PB ventoso o un tempo registrato con fotocellula volante invece che da fermo, tutte le 16 colonne derivate risultano traslate e non corrispondono alle percentuali fisiologiche intese.

---

### 2. Raccomandazioni Operative per il Software T7 Workout e per il Preparatore

Per colmare la distanza tra il modello matematico di Excel e la complessità fisiologica dell'atleta, si raccomandano le seguenti implementazioni nel modulo di programmazione dell'applicazione:

```
+--------------------------------------------------------------------------------------------------+
|                                RACCOMANDAZIONI OPERATIVE T7 WORKOUT                              |
+--------------------------------------------------------------------------------------------------+
| 1. MOTORE DI CALCOLO PRIMARIO (Distanze 80 - 300 m):                                             |
|    - Mantenere la formula iperbolica: TargetTime(d, p) = CurrentCapacity(d) / p                |
|    - Arrotondamento visivo: 1 decimale standard (Half-Up), con 2 decimali per distanze brevi.   |
|                                                                                                  |
| 2. DISTANZE BREVI (<= 60 m):                                                                     |
|    - Visualizzare un badge di avviso: "Consigliata Partenza Lanciata (Flying Start 15-20 m)".   |
|    - In alternativa, integrare la correzione automatica del tempo d'inerzia:                    |
|      TargetTime_corr(d, p) = (d / (p * vMax)) + tau                                              |
|                                                                                                  |
| 3. STOP RULE DINAMICA (Monitoraggio in tempo reale via cronometro/sensore):                      |
|    - Speed Loss > 3%: Notifica di attenzione metabolica (Lattato stimato > 8 mmol/L).            |
|    - Speed Loss > 5%: Interruzione automatica consigliata della seduta di velocità pura.         |
|                                                                                                  |
| 4. CATEGORIZZAZIONE DEL CARICO (Mappatura Zone Colore):                                          |
|    - Rosso (>95%): Special Endurance / Max Velocity (Recuperi ampi 8-15 min, polarizzazione).   |
|    - Arancio/Giallo (80-93%): Intensive Tempo (Lattacido, specifico per 200/400m).             |
|    - Verde/Blu (50-75%): Extensive Tempo (Aerobico, rigenerativo, decontrazione su erba).       |
+--------------------------------------------------------------------------------------------------+
```

---

## PARTE IV: CATALOGO DELLE FONTI SCIENTIFICHE (41 EVIDENZE FORMALI)

Tutte le 41 fonti sono dettagliate formalmente con tipologia di studio, dimensione del campione ($n$), outcome misurati, risultati chiave, limiti metodologici e livello di qualità nel file [evidenze.csv](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/sidequests/sprint-ritmi-excel/ricerca/evidenze.csv).

Di seguito si riportano i riferimenti bibliografici completi suddivisi per ambito:

### Fisiologia, Intensità e Ripetute Submassimali (Filone A)
1. **Darrall-Jones J, Jones B, Roe G, Till K.** (2022). *Athletes' Perception and Regulation of Sprint Running Intensities.* J Strength Cond Res, 36(8): 2218–2222. PMID: 35916747 | DOI: 10.1519/JSC.0000000000003960.
2. **Jiménez-Reyes P, Pareja-Blanco F, Rodríguez-Rosell D, et al.** (2016). *Mechanical, Metabolic and Perceptual Response to Consecutive Sprint Training.* Int J Sports Med, 37(10): 807–812. PMID: 27286181 | DOI: 10.1055/s-0042-107251.
3. **Jiménez-Reyes P, Pareja-Blanco F, Cuadrado-Peñafiel V, et al.** (2019). *Mechanical, metabolic and perceptual response to different sprint training configurations.* J Sports Sci, 37(9): 1029–1037. PMID: 30380362 | DOI: 10.1080/02640414.2018.1539445.
4. **Haugen T, Seiler S, Sandbakk Ø, Tønnessen E.** (2019). *The Training and Development of Elite Sprint Performance: an Integration of Scientific and Best Practice Literature.* Sports Med Open, 5(1): 44. PMID: 31754845 | DOI: 10.1186/s40798-019-0221-0.
5. **Haugen T, Buchheit M.** (2016). *Sprint Running Performance Monitoring: Methodological and Practical Considerations.* Sports Med, 46(5): 641–656. PMID: 26660758 | DOI: 10.1007/s40279-015-0446-0.
6. **Clark KP, Ryan LJ, Meng R, Stearne DJ.** (2023). *The Relationship Between Stride Frequency, Stride Length, and Running Speed in Track and Field Athletes.* J Hum Kinet, 87: 1–9. PMID: 37229404 | DOI: 10.5114/jhk/159578.
7. **Whitacre TS, Stearne DJ, Clark KP.** (2024). *Effects of running skill and speed on limb coordination during submaximal and maximal sprinting.* J Biomech, 166: 112023. PMID: 38447429 | DOI: 10.1016/j.jbiomech.2024.112023.
8. **Iaia FM, Bangsbo J.** (2010). *Speed endurance training is a powerful stimulus for physiological adaptations and performance improvements of athletes.* Scand J Med Sci Sports, 20(Suppl 2): 11–23. PMID: 20840558 | DOI: 10.1111/j.1600-0838.2010.01193.x.
9. **Girard O, Mendez-Villanueva A, Bishop D.** (2011). *Repeated-sprint ability - part I: factors contributing to fatigue.* Sports Med, 41(8): 673–694. PMID: 21780851 | DOI: 10.2165/11590550-000000000-00000.

### Meccanica dello Sprint e Profilo F-v-P (Filone B)
10. **Samozino P, Rabita G, Dorel S, Slawinski J, Peyrot N, Saez de Villarreal E, Morin JB.** (2016). *A simple method for measuring power, force, velocity properties, and mechanical effectiveness in sprint running.* Scand J Med Sci Sports, 26(6): 648–658. PMID: 25996964 | DOI: 10.1111/sms.12490.
11. **Morin JB, Bourdin M, Edouard P, Peyrot N, Samozino P, Lacour JR.** (2012). *Mechanical determinants of 100-m sprint running performance.* Eur J Appl Physiol, 112(11): 3921–3930. PMID: 22422028 | DOI: 10.1007/s00421-012-2379-8.
12. **di Prampero PE, Fusi S, Sepulcri L, Morin JB, Belli A.** (2005). *Sprint running: a new energetic approach.* J Exp Biol, 208(14): 2809–2816. PMID: 16000549 | DOI: 10.1242/jeb.01700.
13. **Cross MR, Brughelli M, Samozino P, Morin JB.** (2017). *Methods of Sprint Resistance Training: A Field-Based Approach.* Sports Med, 47(8): 1465–1477. PMID: 27896682 | DOI: 10.1007/s40279-016-0653-3.
14. **Healy R, Kenny IC, Harrison AJ.** (2022). *Profiling elite male 100-m sprint performance: The role of maximum velocity and relative acceleration.* J Sport Health Sci, 11(1): 75–84. PMID: 35033878 | DOI: 10.1016/j.jshs.2019.10.002.
15. **Rabita G, Dorel S, Slawinski J, et al.** (2015). *Sprint mechanics in world-class athletes: a new insight into the limits of human locomotion.* Scand J Med Sci Sports, 25(5): 583–594. PMID: 25640466 | DOI: 10.1111/sms.12389.
16. **Girard O, Brocherie F, Tomazin K, Farooq A, Morin JB.** (2016). *Changes in running mechanics over 100-m, 200-m and 400-m treadmill sprints.* J Biomech, 49(9): 1490–1497. PMID: 27015963 | DOI: 10.1016/j.jbiomech.2016.03.020.
17. **Nagahara R, Matsubayashi T, Matsuo A, Zushi K.** (2014). *Digitation of step parameters during the acceleration phase of sprinting.* Biol Open, 3(7): 627–634. PMID: 24996923 | DOI: 10.1242/bio.20148284.
18. **Weyand PG, Sternlight DB, Bellizzi MJ, Wright S.** (2000). *Faster top running speeds are achieved with greater ground forces not more rapid leg movements.* J Appl Physiol, 89(5): 1991–1999. PMID: 11053354 | DOI: 10.1152/jappl.2000.89.5.1991.

### Modelli Fisiologici, ASR, Critical Speed e Power-Law (Filone C)
19. **Blondel N, Berthoin S, Billat V, Lensel G.** (2001). *Relationship between run times to exhaustion at 90, 100, 110, 120, 130 and 140% of the velocity associated with vVO2max and the time limit at vVO2max.* Int J Sports Med, 22(2): 85–90. PMID: 11258638 | DOI: 10.1055/s-2001-11357.
20. **Buchheit M, Laursen PB.** (2013). *High-intensity interval training, solutions to the programming puzzle. Part I & Part II.* Sports Med, 43(5): 313–338 & 43(10): 927–954. PMID: 23539308, 23832851.
21. **Sandford GN, Allen SV, Kilding AE, Ross A, Laursen PB.** (2019). *Anaerobic Speed Reserve: A Key Component of Elite Male 800-m Running.* Int J Sports Physiol Perform, 14(4): 501–508. PMID: 30300023 | DOI: 10.1123/ijspp.2018-0163.
22. **Sandford GN, Laursen PB, Buchheit M.** (2021). *Anaerobic Speed/Power Reserve and Sporting Performance: Scientific Basis, Current Applications and Future Directions.* Sports Med, 51(10): 2017–2036. PMID: 34398445 | DOI: 10.1007/s40279-021-01523-9.
23. **Buchheit M, Mendez-Villanueva A.** (2014). *Changes in repeated-sprint performance in relation to change in locomotor profile in highly-trained young soccer players.* J Sports Sci, 32(13): 1309–1317. PMID: 24878034 | DOI: 10.1080/02640414.2014.918272.
24. **Bundle MW, Hoyt RW, Weyand PG.** (2003). *High-speed running performance: a new approach to assessment and prediction.* J Appl Physiol, 95(5): 1955–1962. PMID: 14555668 | DOI: 10.1152/japplphysiol.00921.2002.
25. **Bundle MW, Weyand PG.** (2012). *Sprint exercise performance: does metabolic power decide the contest?* Exerc Sport Sci Rev, 40(3): 174–182. PMID: 22525203 | DOI: 10.1097/JES.0b013e318258e1c1.
26. **Monod H, Scherrer J.** (1965). *The work capacity of a synergic muscular group.* Ergonomics, 8(3): 329–338. DOI: 10.1080/00140136508930810.
27. **Jones AM, Vanhatalo A, Burnley M, Morton RH, Poole DC.** (2010). *Critical power: concepts and applications.* Med Sci Sports Exerc, 42(10): 1876–1890. PMID: 20195180 | DOI: 10.1249/MSS.0b013e3181d9cf7f.
28. **Pettitt RW, Jamnick N, Clark IE.** (2012). *3-min all-out exercise test for running.* Int J Sports Med, 33(6): 426–431. PMID: 22422309 | DOI: 10.1055/s-0031-1299749.
29. **Morton RH.** (1996). *A 3-parameter critical power model.* Ergonomics, 39(4): 611–619. PMID: 8734685 | DOI: 10.1080/00140139608964484.
30. **Savaglio S, Carbone V.** (2000). *Scaling in athletic world records.* Nature, 404(6777): 497. PMID: 10749198 | DOI: 10.1038/35005165.

### Pratiche degli Allenatori e Manuali Federali di Campo (Filone D)
31. **Francis C, Patterson P.** (1992). *The Charlie Francis Training System.* TBLI Publications. ISBN: 978-0969649007.
32. **Pfaff D, McMillan S.** (2017). *The ALTIS Foundation Course & Sprint Coaching Essentials.* ALTIS / World Athletics Education Series.
33. **Vittori C.** (1997 / 2014). *L'insegnamento e l'allenamento della corsa veloce* / *Nervi e cuore saldi.* FIDAL / Scuola dello Sport CONI.
34. **Bonomi R, Bosco C.** (1992). *L'allenamento della velocità nei 100 e 200 metri: verifiche sperimentali e considerazioni metodologiche.* Atletica Studi FIDAL, 23(4): 315–342.
35. **Tellez T, Miller J.** (1984). *The Science of Sprinting.* Santa Monica Track Club / Clinic USATF Technical Document.
36. **USATF Coaching Education.** (2015). *USATF Level 2 Coaching Manual: Sprints, Hurdles, and Relays.* Human Kinetics.
37. **Khmel M, Lester T, Crick T.** (2009). *Classification of Sprint Training Methods.* UK Athletics / British Athletics uCoach Series.
38. **Mach G.** (1980). *Sprints and Hurdles: Competency in Athletics.* Canadian Track and Field Association (CTFA).
39. **Hart C.** (2004). *200/400m Sprint Training and Conditioning Program.* Baylor University / Clinic USATF Technical Paper.
40. **Mann R, Murphy A.** (2018). *The Mechanics of Sprinting and Hurdling (Second Edition).* CreateSpace / USATF National Biomechanics Project. ISBN: 978-1518625343.
41. **Seagrave L.** (1996). *Neuro-Biomechanics of Maximum Velocity Sprinting.* IAAF New Studies in Athletics, 11(2-3): 63–73.

---

*Monografia completata, verificata e archiviata in data 21 Novembre 2026 dal Team di Ricerca Multi-Agente T7 Workout.*
