# MODELLAZIONE MATEMATICA E TRANSIZIONI FISIOLOGICHE DEI RITMI DI CORSA: DALLA ZONA ESTENSIVA ALLO SPRINT PURO (ZONA 9)

**Data di redazione:** 21 Novembre 2026  
**Autore:** Multidisciplinary Research Team (Exercise Physiology, Biomechanics & Applied Mathematics)  
**Ambito:** Fisiologia dello Sprint, Modelli Bioenergetici e Prescrizione dell'Intensità

---

## 1. Verdetto Scientifico Diretto sull'Ipotesi

### Risposta al quesito centrale
L'ipotesi che esista una **formula matematica isolata, chiusa e disgiunta per ciascuna singola zona** è **SCIENTIFICAMENTE CONFUTATA**.  
Parallelamente, l'ipotesi che la fisiologia utilizzi **MODELLI INTEGRATI/IBRIDI FONDATI SU ANCORE FISIOLOGICHE DISCRETE (Boundary-Anchored Multi-Domain Framework)** è **SCIENTIFICAMENTE CONFERMATA**.

### Spiegazione epistemologica
Il corpo umano non opera attraverso interruttori matematici discreti che attivano un'equazione e ne spengono un'altra. I sistemi bioenergetici (ossidativo, glicolitico, fosfageno) coesistono in un continuum dinamico (Baker et al. 2010; Gastin 2001). Tuttavia, le transizioni di fase nel controllo metabolico e neuromuscolare sono regolate da **soglie biologiche invalicabili (ancore fisiologiche)**.
La letteratura scientifica internazionale (Poole et al. 2016; Burnley & Jones 2007; Buchheit & Sandford 2021; Weyand et al. 2010) suddivide l'intensità di corsa in **4 Domini Fisiologici Fondamentali**, ciascuno caratterizzato da una specifica equazione biofisica:

1. **Dominio Moderato (Sotto LT1):** Cinetica rapida del VO2, stabilità del lattato sui valori basali. Modello: lineare frazionario ancorato a $vLT_1$ o $\%CS$.
2. **Dominio Pesante (Tra LT1 e LT2 / Critical Speed):** Comparsa della "slow component" del VO2, ma con stabilizzazione del lattato ematico ($[BLa]$). Modello: frazionario ancorato a $CS$ o $vMLSS$.
3. **Dominio Severo (Da Critical Speed a MAS / vVO2max):** Inesorabile deplezione della capacità anaerobica finita ($D'$) e raggiungimento del VO2max. Modello: **Iperbolico a due o tre parametri ($v(t) = CS + D'/t$)**.
4. **Dominio Estremo (Da MAS a MSS / Vmax):** Intervallo sovramassimale in cui la fatica sopraggiunge prima del raggiungimento del VO2max; predominio assoluto delle riserve fosfagene, della potenza glicolitica e del reclutamento neuromuscolare (fibre IIx). Modello: **Anaerobic Speed Reserve ($ASR$)**, **Algoritmo APE di Weyand & Bundle ($v(t) = V_{aer} + (V_{max}-V_{aer})e^{-kt}$)** e **Modello Meccanico Sprint ($v(t) = v_{max}(1 - e^{-t/\tau})$)**.

Tentare di estrapolare la formula di un dominio all'interno di un altro genera aberrazioni matematiche (es. la Critical Speed che prevede velocità infinite a $t \to 0$, o la %MAS che fallisce completamente nello sprint).

---

## 2. Analisi della Precisione "al Millesimo" vs Variabilità Biologica Reale

La pretesa di calcolare o prescrivere i ritmi di corsa con una precisione al centesimo o millesimo di secondo ($0{,}01\text{ s} - 0{,}001\text{ s}$) costituisce una **falsa precisione matematica (mathematical pseudo-precision)**. Sebbene un computer o una formula Excel possano calcolare $T = 10{,}8 / 0{,}93 = 11{,}612903\dots\text{ s}$, la realtà fisiologica e biomeccanica di campo presenta un margine d'errore incomprimibile:

### 1. Variabilità Biologica Intra-Individuale Giornaliera (CV)
- La massima velocità di sprint ($MSS$) presenta un coefficiente di variazione ($CV$) giornaliero nell'atleta d'élite compreso tra l'**$1{,}0\%$ e l'$1{,}5\%$** (Haugen et al. 2019; Hopkins 2000).
- Su un 100 m corso in $10{,}80\text{ s}$, l'$1{,}0\%$ corrisponde a una fluttuazione naturale di **$\pm 0{,}11\text{ s}$**.
- Su un 60 m lanciato in $6{,}00\text{ s}$, l'$1{,}0\%$ corrisponde a **$\pm 0{,}06\text{ s}$**.
- Nelle intensità submassimali attorno alle soglie aerobiche/lattacide ($LT_1, LT_2$), la variabilità della concentrazione di lattato per una data velocità è del **$3\% - 5\%$** a causa dello stato di idratazione, deplezione di glicogeno, temperatura corporea e ritmo circadiano.

### 2. Fattori Ambientali Esterni
- **Vento:** Una variazione di vento di soli $\pm 1{,}0\text{ m/s}$ altera il crono sui 100 m di circa **$0{,}10 - 0{,}12\text{ s}$** (Mureika 2001; Linthorne 1994).
- **Temperatura e Pressione Barometrica:** Una variazione di temperatura di 10 °C modifica la densità dell'aria dell'ordine del $3\%$, modificando la resistenza aerodinamica e incidendo per circa $0{,}03 - 0{,}05\text{ s}$ sui 100 m.

### 3. Strumenti di Misurazione
- Il cronometraggio manuale ha un errore sistematico umano di **$\pm 0{,}20 - 0{,}25\text{ s}$**.
- I sistemi di fotocellule a singolo fascio presentano un errore di parallasse/interruzione braccio-torso di **$\pm 0{,}04 - 0{,}06\text{ s}$** (Haugen & Buchheit 2016). Solo le fotocellule a doppio fascio o i sistemi a fotofinish ad alta frequenza raggiungono una risoluzione di $\pm 0{,}01\text{ s}$.

### Conclusione Metodologica sulla Precisione
La **risoluzione biologica reale del corpo umano nello sprint e nella corsa non supera il decimo di secondo ($\pm 0{,}1\text{ s}$)**. La prescrizione scientifica non deve mai richiedere valori scalari puntiformi al millesimo, ma deve operare per **finestre target di precisione** (es. $14{,}4 \pm 0{,}1\text{ s}$ o range di velocità $\pm 0{,}1\text{ m/s}$).

---

## 3. Analisi Dettagliata Zona per Zona

### Zona: Corsa Estensiva / Capacità Aerobica (Dominio Moderato)
- **Sistema Energetico Dominante:** Ossidativo (lipolisi e glicolisi lenta aerobica).
- **Ancora Fisiologica:** Prima Soglia Lattacida ($LT_1$) / Prima Soglia Ventilatoria ($VT_1$).
- **Modello Matematico Scientifico:**
  $$v_{target} = \% \cdot vLT_1 \quad (\text{tipicamente } 80\% - 95\% vLT_1)$$
  oppure rispetto a Critical Speed:
  $$v_{target} = (0{,}65 - 0{,}75) \cdot CS$$
- **Errore Tipico di Prescrizione:** Calcolare il ritmo di corsa estensiva scalando semplicemente il massimale di sprint ($T_{100}/p$ al 50-60%). Due atleti con lo stesso tempo sui 100 m (10.8s) possono avere una $LT_1$ di 3.2 m/s o 4.0 m/s; usare una percentuale fissa dello sprint produce un carico metabolico completamente scorrelato dalla soglia aerobica.

### Zona: Soglie Lattacide / Capacità Sub-Massimale (Dominio Pesante)
- **Sistema Energetico Dominante:** Ossidativo ad alta frazione, comparsa della slow component del VO2, ma con stato stazionario del lattato ($[BLa] \approx 2{,}5 - 4{,}0\text{ mmol/L}$).
- **Ancora Fisiologica:** Massima Concentrazione Stazionaria di Lattato ($MLSS$) / Critical Speed ($CS$) / Seconda Soglia ($LT_2$).
- **Modello Matematico Scientifico:**
  $$v_{target} = (0{,}90 - 1{,}00) \cdot CS$$
- **Errore Tipico di Prescrizione:** Utilizzare percentuali arbitrarie della frequenza cardiaca massima ($FC_{max}$) o della MAS (es. "corri all'85% MAS"). La posizione di $LT_2$ rispetto a MAS varia enormemente tra atleti (dal 75% al 90% MAS), determinando per alcuni un lavoro in stato stazionario e per altri un rapido accumulo di acido lattico.

### Zona: Potenza Aerobica / VO2max (Dominio Severo)
- **Sistema Energetico Dominante:** Massimo consumo d'ossigeno con progressiva deplezione della capacità anaerobica di lavoro ($D'$). Il lattato sale continuamente fino all'esaurimento.
- **Ancora Fisiologica:** Massima Velocità Aerobica ($MAS$) / Critical Speed ($CS$) e parametro $D'$.
- **Modello Matematico Scientifico (Modello Iperbolico di Monod & Scherrer / Poole & Jones):**
  $$t = \frac{D'}{v - CS} \iff v(t) = CS + \frac{D'}{t}$$
  dove $CS$ è la velocità asintotica (m/s) e $D'$ è la capacità finita di corsa sopra CS (metri).
- **Errore Tipico di Prescrizione:** Tentare di usare il modello Critical Speed a 2 parametri per durate inferiori a 60-90 secondi. Per $t \to 0$, l'equazione prevede velocità asintotiche infinite (es. 48 m/s a 5s).

### Sottoclassificazione: Special Endurance 2 (SE2, 300m - 600m)
- **Sistema Energetico Dominante:** Transizione anaerobica-aerobica estrema ($40\text{ s} - 90\text{ s}$). Massimo accumulo di metaboliti ($[BLa] > 15-22\text{ mmol/L}$) in presenza di una frazione aerobica che copre il 35-50% del fabbisogno totale.
- **Ancora Fisiologica:** Velocità Massimale sulla Distanza ($v_{max}(d)$) o Anaerobic Speed Reserve ($10\% - 25\% ASR$).
- **Modello Matematico Scientifico:**
  Modello di Weyand & Bundle (Algoritmo APE):
  $$v(t) = V_{aer} + (V_{max} - V_{aer}) \cdot e^{-k \cdot t}$$
  con $k \approx 0{,}045\text{ s}^{-1}$.  
  Nella prassi di World Athletics / USATF: differenziale dal primato personale:
  $$T_{target} = T_{pb}(d) + \Delta t$$
  (es. per i 300m: $T_{target} = T_{100}(300) / p$ con $p \in [0{,}88, 0{,}95]$).
- **Errore Tipico di Prescrizione:** Prescrivere con percentuali di MAS (es. "corri al 120% MAS"). Un centometrista veloce a 120% MAS corre a ritmi di rigenerazione, mentre per un fondista rappresenta uno sforzo estenuante.

### Sottoclassificazione: Special Endurance 1 (SE1, 150m - 300m)
- **Sistema Energetico Dominante:** Anaerobico lattacido massimale ($15\text{ s} - 40\text{ s}$). Massima attivazione della glicolisi anaerobica e massima acidosi tissutale con crollo del pH intramuscolare ($pH < 6{,}8$).
- **Ancora Fisiologica:** Massimale specifico della distanza ($T_{100}(d)$) e riserva anaerobica ($25\% - 60\% ASR$).
- **Modello Matematico Scientifico:**
  $$T_{target}(d, p) = \frac{T_{100}(d)}{p} \quad \text{con } p \in [0{,}90, 0{,}98]$$
  oppure basato su %ASR:
  $$v_{target} = MAS + \left(\frac{\%ASR}{100}\right) \cdot (MSS - MAS)$$
- **Errore Tipico di Prescrizione:** Recuperi incompleti. Se il recupero scende sotto gli 8-15 minuti, l'atleta non lavora più sulla capacità lattacida pura ma entra in esaurimento precoce per blocco enzimatico della fosfofruttochinasi (PFK).

### Sottoclassificazione: Speed Endurance (Produzione vs Mantenimento, 60m - 150m)
- **Sistema Energetico Dominante:** Transizione alattacido-glicolitica ad altissima velocità ($7\text{ s} - 20\text{ s}$).
  - *Speed Endurance Production:* Massima velocità, recuperi ampi (5-8 min), stimolo al tasso di produzione di lattato.
  - *Speed Endurance Maintenance:* Mantenimento della velocità sotto accumulo di fatica, recuperi ridotti (90s - 3 min).
- **Ancora Fisiologica:** Maximal Sprinting Speed ($MSS$) o tempo sui parziali lanciati.
- **Modello Matematico Scientifico:**
  $$v_{target} = p \cdot MSS \quad \text{oppure} \quad T_{target} = \frac{T_{100}(d)}{p} \quad (p \in [0{,}93, 0{,}98])$$
- **Errore Tipico di Prescrizione:** Partenza da fermo con sforzo parziale distorto. Nei tratti brevi ($<80\text{ m}$), partire da fermo a intensità submassimale altera l'angolo di uscita dai blocchi e la cinematica della spinta. È imperativo utilizzare la **partenza lanciata (flying start)**.

### Zona 8: Potenza Lattacida (Glycolytic Power)
- **Sistema Energetico Dominante:** Massimo tasso di produzione di acido lattico nell'unità di tempo ($VLa_{max}$). Coinvolge la massima espressione di glicolisi anaerobica per 10-15 secondi.
- **Ancora Fisiologica:** Massima Velocità di Sprint ($MSS$) e $VLa_{max}$.
- **Modello Matematico Scientifico:**
  Sprint all-out da 80-120m ad intensità $\ge 98\% MSS$ con recupero completo ($\ge 12 - 15\text{ min}$) per azzerare l'inibizione acida e consentire la massima gittata glicolitica.
- **Errore Tipico di Prescrizione:** Scambiare la potenza lattacida con la capacità lattacida: se si riduce il recupero a 2 minuti, il lattato accumulato inibisce la glicolisi e il tasso di produzione precipita del 40%.

### Zona 9: Sprint Puro / Velocità Massima (MSS / Vmax)
- **Sistema Energetico Dominante:** Anaerobico alattacido puro ($\le 5 - 6\text{ s}$). Scissione di fosfocreatina (PCr) e ATP intramuscolare, massima frequenza di scarica neurale del SNC, reclutamento del 100% delle unità motorie a contrazione rapida (tipo IIx).
- **Ancora Fisiologica:** Maximal Sprinting Speed ($MSS$) e Profilo Meccanico Forza-Velocità ($F\text{-}v$, Morin & Samozino).
- **Modello Matematico Scientifico:**
  1. *Per tratti lanciati (flying sprint 20-30m):*
     $$v_{target} = p \cdot MSS \quad (p \in [0{,}95, 1{,}00])$$
  2. *Per partenza da fermo (standing start):*
     Modello mono-esponenziale macroscopico:
     $$v(t) = v_{max} \cdot \left(1 - e^{-t/\tau}\right)$$
     $$x(t) = v_{max} \cdot \left[t - \tau \cdot \left(1 - e^{-t/\tau}\right)\right]$$
     dove $\tau = \frac{v_{max}}{a_{max}}$ rappresenta la costante di tempo dell'accelerazione ($\tau \approx 1{,}1 - 1{,}3\text{ s}$).
- **Errore Tipico di Prescrizione:** Usare la velocità media ($d/T$) per prescrivere la velocità massima istantanea. Su un 50m corso in 5.9s, la velocità media è $8{,}47\text{ m/s}$, ma l'atleta raggiunge una $v_{max}$ di $10{,}5\text{ m/s}$. Prescrivere un parziale ignorando la perdita temporale fissa d'inerzia $\tau$ porta a sottostimare o sovrastimare drasticamente il carico neurale.

---

## 4. Tabella Comparativa di Sintesi dei Modelli di Calcolo

| Zona / Fascia | Dominio Fisiologico | Variabile Ancora | Modello Matematico Ottimale | Range Validità Modello | Risoluzione Biologica Reale |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Zona 9 – Sprint Puro (Vmax)** | Dominio Estremo | $MSS$ ($v_{max}$) & $\tau$ | $v(t) = v_{max}(1 - e^{-t/\tau})$ (partenza da fermo)<br>$v = p \cdot MSS$ (lanciato) | $0\text{ s} - 6\text{ s}$ | $\pm 0{,}05 - 0{,}10\text{ s}$ |
| **Zona 8 – Potenza Lattacida** | Dominio Estremo | $MSS$ & $T_{100}(d)$ | $T_{target} = T_{100}(d) / p$ ($p \ge 98\%$) | $7\text{ s} - 15\text{ s}$ | $\pm 0{,}10\text{ s}$ |
| **Speed Endurance (Prod/Maint)** | Dominio Estremo | $MSS$ & $ASR$ | $v = MAS + (\%ASR) \cdot (MSS - MAS)$ | $10\text{ s} - 20\text{ s}$ | $\pm 0{,}10 - 0{,}15\text{ s}$ |
| **Zona 7 – Capacità Lattacida (SE1)** | Dominio Estremo | $T_{100}(d)$ & $ASR$ | $T_{target} = T_{100}(d) / p$ ($p \in 90-98\%$) | $15\text{ s} - 40\text{ s}$ | $\pm 0{,}15 - 0{,}20\text{ s}$ |
| **Special Endurance 2 (SE2)** | Dominio Severo/Estremo | $T_{pb}(d)$ o Bundle-Weyand | $v(t) = V_{aer} + (V_{max}-V_{aer})e^{-kt}$ | $40\text{ s} - 90\text{ s}$ | $\pm 0{,}20 - 0{,}30\text{ s}$ |
| **Potenza Aerobica / VO2max** | Dominio Severo | $CS$ & $D'$ (o $MAS$) | $v(t) = CS + D'/t$ (Critical Speed) | $2\text{ min} - 15\text{ min}$ | $\pm 0{,}10\text{ m/s}$ |
| **Soglie Lattacide (LT2 / MLSS)** | Dominio Pesante | $CS$ o $vMLSS$ | $v = (0{,}90 - 1{,}00) \cdot CS$ | $15\text{ min} - 45\text{ min}$ | $\pm 0{,}15\text{ m/s}$ |
| **Corsa Estensiva (Sotto LT1)** | Dominio Moderato | $vLT_1$ o $CS$ | $v = (0{,}65 - 0{,}75) \cdot CS$ | $> 30\text{ min}$ | $\pm 0{,}20\text{ m/s}$ |

---

## 5. Esempio Numerico Applicato (Dimostrazione di Divergenza Matematica)

Confrontiamo due atleti con la **stessa Massima Velocità Aerobica ($MAS = 5{,}0\text{ m/s} = 18{,}0\text{ km/h}$)**:
- **Atleta A (Velocista Puro):** $MSS = 10{,}5\text{ m/s}$ ($37{,}8\text{ km/h}$), $ASR = 5{,}5\text{ m/s}$.
- **Atleta B (Mezzofondista 800/1500m):** $MSS = 8{,}0\text{ m/s}$ ($28{,}8\text{ km/h}$), $ASR = 3{,}0\text{ m/s}$.

### Scenario 1: Prescrizione Generica basata su formula unica %MAS (120% MAS sui 200m)
- Velocità target: $v = 1{,}20 \times 5{,}0 = 6{,}00\text{ m/s}$ ($21{,}6\text{ km/h}$).
- Tempo target sui 200m: $T = 200 / 6{,}00 = 33{,}33\text{ s}$.

**Effetto Fisiologico Reale:**
- **Atleta A (Velocista):** lavora a una percentuale di riserva anaerobica pari a:
  $$\%ASR_A = \frac{6{,}00 - 5{,}0}{10{,}5 - 5{,}0} \times 100 = \mathbf{18{,}2\% ASR}$$
  *Sforzo fisiologico:* Lieve, accumulo di lattato minimo ($[BLa] \approx 4 - 5\text{ mmol/L}$), stress neuromuscolare trascurabile, percezione dello sforzo ($RPE$) = 4/10.
- **Atleta B (Mezzofondista):** lavora a una percentuale di riserva anaerobica pari a:
  $$\%ASR_B = \frac{6{,}00 - 5{,}0}{8{,}0 - 5{,}0} \times 100 = \mathbf{33{,}3\% ASR}$$
  *Sforzo fisiologico:* Severo, marcato accumulo di lattato ($[BLa] \approx 10 - 12\text{ mmol/L}$), deplezione rapida di $D'$, $RPE$ = 8/10.

**Risultato:** Applicare una formula fissa basata su un'unica variabile ($MAS$) produce una discrepanza di carico biologico del **$15{,}1\%$ di ASR**, portando uno dei due atleti a fallire l'adattamento desiderato.

### Scenario 2: Prescrizione con Modello ad Ancora Fisiologica (%ASR a 25% ASR)
- Per l'Atleta A: $v = 5{,}0 + 0{,}25 \times 5{,}5 = 6{,}38\text{ m/s}$ $\implies$ Tempo 200m = **$31{,}35\text{ s}$**.
- Per l'Atleta B: $v = 5{,}0 + 0{,}25 \times 3{,}0 = 5{,}75\text{ m/s}$ $\implies$ Tempo 200m = **$34{,}78\text{ s}$**.
- **Differenziale cronometrico personalizzato:** **$3{,}43\text{ secondi}$** di differenza sui 200m per ottenere **lo stesso identico impatto metabolico e neuromuscolare**!

---

## 6. Bibliografia Scientifica Verificata

1. **Baker, J. S., McCormick, M. C., & Robergs, R. A. (2010).** Interaction among Skeletal Muscle Metabolic Energy Systems during Intense Exercise. *Journal of Nutrition and Metabolism*, 2010, 1–13. DOI: 10.1155/2010/212017.
2. **Buchheit, M., & Laursen, P. B. (2013).** High-intensity interval training, solutions to the programming puzzle: Part I: Cardiopulmonary emphasis. *Sports Medicine*, 43(5), 313–338. DOI: 10.1007/s40279-013-0029-x.
3. **Buchheit, M., & Sandford, G. N. (2021).** Anaerobic Speed Reserve: A key concept for individualising interval training in running and team sports. *Aspetar Sports Medicine Journal*, 10, 52–60.
4. **Bundle, M. W., & Weyand, P. G. (2012).** Sprint exercise performance: does metabolic power decide the outcome? *Exercise and Sport Sciences Reviews*, 40(3), 174–182. DOI: 10.1097/JES.0b013e318258e1c6.
5. **Burnley, M., & Jones, A. M. (2007).** Oxygen uptake kinetics as a determinant of sports performance. *European Journal of Sport Science*, 7(2), 63–79. DOI: 10.1080/17461390701456148.
6. **Gastin, P. B. (2001).** Energy system interaction and relative contribution during maximal exercise. *Sports Medicine*, 31(10), 725–741. DOI: 10.2165/00007256-200131100-00003.
7. **Haugen, T. A., Breitschädel, F., & Seiler, S. (2019).** Sprint mechanical variables in elite athletes: Are force-velocity-power profiles reliable? *International Journal of Sports Physiology and Performance*, 14(9), 1204–1210. DOI: 10.1123/ijspp.2018-0678.
8. **Haugen, T., & Buchheit, M. (2016).** Sprint running performance monitoring: Methodological and practical considerations. *Sports Medicine*, 46(5), 641–656. DOI: 10.1007/s40279-015-0446-0.
9. **Jones, A. M., Vanhatalo, A., Burnley, M., Morton, R. H., & Poole, D. C. (2010).** Critical power: Implications for determination of V̇O2max and exercise tolerance. *Medicine and Science in Sports and Exercise*, 42(10), 1876–1890. DOI: 10.1249/MSS.0b013e3181d9cf7f.
10. **Monod, H., & Scherrer, J. (1965).** The work capacity of a synergic muscular group. *Ergonomics*, 8(3), 329–338. DOI: 10.1080/00140136508930810.
11. **Morin, J. B., & Samozino, P. (2016).** Interpreting power-force-velocity profiles for individualized and specific training. *International Journal of Sports Physiology and Performance*, 11(2), 267–272. DOI: 10.1123/ijspp.2015-0638.
12. **Morton, R. H. (1996).** A 3-parameter critical power model. *Ergonomics*, 39(4), 611–619. DOI: 10.1080/00140139608964484.
13. **Poole, D. C., Burnley, M., Vanhatalo, A., Rossiter, H. B., & Jones, A. M. (2016).** Critical Power: An Important Fatigue Threshold in Exercise Physiology. *Medicine and Science in Sports and Exercise*, 48(11), 2320–2334. DOI: 10.1249/MSS.0000000000000939.
14. **Samozino, P., Rabita, G., Dorel, S., Slawinski, J., Peyrot, N., Saez de Villarreal, E., & Morin, J. B. (2016).** A simple method for measuring force, velocity and power capabilities during sprint running. *Medicine and Science in Sports and Exercise*, 48(2), 348–358. DOI: 10.1249/MSS.0000000000000764.
15. **Sandford, G. N., Allen, S. V., Kilding, A. E., Ross, A., & Laursen, P. B. (2019).** Anaerobic speed/power reserve and sport performance: Scientific basis, current applications and future directions. *Sports Medicine*, 49(10), 1589–1602. DOI: 10.1007/s40279-019-01140-2.
16. **Weyand, P. G., Linberg, R., & Bundle, M. W. (2010).** Development of rapid-force-generating capacity explains sprint-running performance. *Journal of Applied Physiology*, 108(4), 950–961. DOI: 10.1152/japplphysiol.00942.2009.
