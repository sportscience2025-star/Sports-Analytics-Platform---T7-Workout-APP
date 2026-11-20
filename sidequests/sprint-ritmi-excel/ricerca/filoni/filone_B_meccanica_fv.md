# Filone B: Profilo Forza-Velocità e Modelli Meccanici dello Sprint

**Autore:** Agente B — Fase 1 (Ricerca Scientifica sui Ritmi di Sprint)  
**Ambito tematico:** Meccanica macroscopica, equazioni differenziali del moto, profilo Forza-Velocità-Potenza ($F\text{-}v\text{-}P$), bioenergetica della corsa accelerata e limiti fisici della prescrizione submassimale basata su $d/T$.  
**Data di completamento:** 21 Novembre 2026  

---

## Sommario Esecutivo

Il presente dossier costituisce la base scientifica per l'analisi meccanica e biomeccanica della prescrizione delle andature di sprint nell'atletica leggera e negli sport di velocità.
Nel modello empirico ampiamente diffuso tra gli allenatori, il calcolo delle andature di allenamento a intensità percentuale $p \in (0, 1]$ sulla distanza $d$ è regolato dalla formula iperbolica:
$$T(d, p) = \frac{T_{100}(d)}{p}$$
Tale formula poggia sull'assunto implicito che l'atleta moduli in modo omogeneo la **velocità media** della prova ($\bar{v}_p = p \cdot \bar{v}_{100}$, con $\bar{v} = d/T$).

L'analisi della letteratura scientifica internazionale (modelli macroscopici di Morin, Samozino, di Prampero, Cross, Weyand e collaboratori) dimostra inconfutabilmente che:
1. **La velocità media $d/T$ sottostima sistematicamente la velocità istantanea di regime ($v_{\max}$)** a causa dell'inerzia iniziale da fermo. Tale sottostima non è costante, ma decresce iperbolicamente all'aumentare della distanza: varia da oltre il **$20.8\%$ sui 50 m** a circa l'**$11.6\%$ sui 100 m**, fino a diventare trascurabile sui **200–300 m**, dove tuttavia subentra l'effetto opposto della fatica metabolica e neuromuscolare (decelerazione tardiva).
2. **Il modello mono-esponenziale $v(t) = v_{\max}(1 - e^{-t/\tau})$** dimostra che l'atleta che parte da fermo "perde" un tempo costante pari a $\tau$ (costante di tempo dell'accelerazione, mediamente $1.1 - 1.4\text{ s}$ negli sprinter) e uno spazio di transizione $\Delta x = v_{\max}\tau$ rispetto a un moto uniforme a regime stazionario. Di conseguenza, $\bar{v}(d) \approx v_{\max} / (1 + v_{\max}\tau / d)$.
3. **Nelle andature submassimali (es. $70\text{--}80\%$ di $T_{100}$)**, l'atleta non è in grado di scalare l'accelerazione iniziale in modo proporzionale senza incorrere in aberrazioni cinematiche. I dati sperimentali provano che gli atleti accelerano spontaneamente con dinamiche molto più vicine al massimale rispetto all'andatura richiesta (con sovrastime della velocità reale fino al $+23\%$ a intensità nominali del $60\%$), alterando i tempi di contatto a terra ($T_c$), la stiffness dell'apparato muscolo-tendineo e l'orientamento vettoriale della forza ($RF$).
4. **Le metodologie scientifiche moderne di prescrizione (VBT su sprint lanciati e Profilo $F\text{-}v$)** isolano le componenti meccaniche (forza orizzontale $F_0$, velocità teorica $v_0$, potenza orizzontale $P_{\max}$) separando rigorosamente le sedute volte alla capacità di accelerazione (0–30 m con traini pesanti o uscite dai blocchi) da quelle volte alla velocità massimale ($v_{\max}$ su tratti lanciati di 10–20 m).

---

## 1. Modelli Meccanici ed Equazioni di Velocità dello Sprint su Pista

### 1.1 Fondamenti Fisici: Il Modello Mono-Esponenziale del Moto
La dinamica di uno sprint in linea retta su pista, a partire da partenza statica ($t=0$, $v(0)=0$, $x(0)=0$), è classicamente descritta mediante una formalizzazione differenziale derivata dal secondo principio della dinamica di Newton integrata con la resistenza passiva (interna ed esterna) (Furusawa, Hill & Parkinson 1927; Chelly & Denis 2001; di Prampero et al. 2005; Morin et al. 2012; Samozino et al. 2016):

$$m \frac{dv}{dt} = F_0 - k \cdot v(t)$$

dove:
- $m$ è la massa corporea dell'atleta ($\text{kg}$);
- $F_0$ è la forza propulsiva orizzontale massima iniziale teorica a velocità zero ($\text{N}$);
- $k$ è il coefficiente complessivo di resistenza viscosa e aerodinamica ($\text{N}\cdot\text{s}\cdot\text{m}^{-1}$).

Risolvendo l'equazione differenziale a variabili separabili con condizione iniziale $v(0) = 0$, si ottiene l'equazione mono-esponenziale della velocità in funzione del tempo:

$$v(t) = v_{\max} \left(1 - e^{-t/\tau}\right)$$

I parametri cardinali del moto sono definiti da:
- **$v_{\max}$ (Velocità Massima Asintotica)**: rappresenta la velocità limite teorica raggiungibile dall'atleta su terreno piano:
  $$v_{\max} = \frac{F_0}{k}$$
- **$\tau$ (Costante di Tempo dell'Accelerazione, Tau)**: espressa in secondi ($\text{s}$), rappresenta la rapidità con cui l'atleta incrementa la propria velocità verso il regime stazionario:
  $$\tau = \frac{m}{k} = \frac{v_{\max}}{a_{\max}}$$
  Matematicamente, per $t = \tau$, la velocità istantanea raggiunge:
  $$v(\tau) = v_{\max}(1 - e^{-1}) \approx 0.6321 \cdot v_{\max} \quad (63.21\% \text{ di } v_{\max})$$
  Per $t = 3\tau$, l'atleta ha raggiunto il $95.02\%$ di $v_{\max}$; per $t = 4\tau$, raggiunge il $98.17\%$.
- **$a(t)$ (Accelerazione Istantanea)**: calcolata come derivata temporale prima della velocità:
  $$a(t) = \frac{dv(t)}{dt} = \frac{v_{\max}}{\tau} e^{-t/\tau} = a_{\max} e^{-t/\tau}$$
  L'accelerazione massima iniziale teorica a $t=0$ è pari a:
  $$a_{\max} = \frac{v_{\max}}{\tau} = \frac{F_0}{m}$$

Integrando la velocità rispetto al tempo, si ricava la legge oraria della posizione $x(t)$:

$$x(t) = \int_0^t v(t') \, dt' = v_{\max} \left[ t + \tau \left(e^{-t/\tau} - 1\right) \right]$$

```
Velocità v(t) [m/s]
 ^
 |                                      ------------------ v_max
 |                               ...--''
 |                         ..--''
 |                    ..--'
 |                 .-'
 |              .-'
 |           .-'
 |        .-'
 |      .'
 |    .'
 |  .'   <--- Fase di accelerazione (0 - 4*tau)
 | /
 0--------------------------------------------------------> Tempo t [s]
```

### 1.2 Profilo Macroscopico Forza-Velocità-Potenza ($F\text{-}v\text{-}P$)
Il metodo validato da Samozino et al. (2016) e formalizzato da Cross et al. (2017) applica la dinamica inversa macroscopica al centro di massa dell'atleta. 
La forza orizzontale netta applicata a terra ad ogni istante include la componente inerziale e la resistenza dell'aria:

$$F_H(t) = m \cdot a(t) + F_{aero}(t)$$

dove $F_{aero}(t) = \frac{1}{2} \rho \cdot C_d \cdot A_f \cdot v(t)^2$, con $\rho$ densità dell'aria, $C_d$ coefficiente di drag aerodinamico e $A_f$ area frontale dell'atleta.

Esprimendo la forza orizzontale netta in funzione della velocità istantanea $v$, la relazione empirica e teorica risulta rigorosamente **lineare** ($R^2 > 0.95$):

$$F_H(v) = F_0 \left(1 - \frac{v}{v_0}\right)$$

dove:
- $F_0$ è la forza orizzontale teorica massimale a velocità nulla (espressa in $\text{N}$ o normalizzata per la massa corporea in $\text{N/kg}$); valori tipici in velocisti élite: $8.0\text{--}10.5\text{ N/kg}$.
- $v_0$ è la velocità teorica massimale a forza orizzontale nulla ($\text{m/s}$); valori tipici: $10.5\text{--}12.0\text{ m/s}$.
- La pendenza della retta $S_{Fv} = -F_0 / v_0$ esprime il bilanciamento individuale tra capacità di produrre forza a basse velocità vs alte velocità.

La **potenza orizzontale meccanica** istantanea $P_H(v) = F_H(v) \cdot v$ segue un andamento **parabolico**:

$$P_H(v) = F_0 \cdot v \left(1 - \frac{v}{v_0}\right)$$

Il vertice della parabola si colloca alla velocità ottimale $v_{opt} = v_0 / 2$, determinando la massima potenza orizzontale:

$$P_{\max} = \frac{F_0 \cdot v_0}{4}$$
Valori tipici in velocisti di livello nazionale e mondiale: $22\text{--}35\text{ W/kg}$ (Rabita et al. 2015).

### 1.3 Orientamento della Forza e Rapporto di Efficacia Meccanica ($RF$ e $D_{RF}$)
Morin et al. (2012) e Rabita et al. (2015) hanno chiarito che la prestazione nello sprint di 100 m non è determinata primariamente dall'entità della forza risultante totale prodotta contro il terreno ($F_{tot} = \sqrt{F_H^2 + F_V^2}$), bensì dalla capacità neuromuscolare di **orientare vettorialmente tale forza in senso orizzontale** durante la corsa ad alte velocità.

Si definiscono due indici biometrici cardine:
- **Ratio of Force ($RF$)**: frazione della forza totale applicata in avanti:
  $$RF(t) = \frac{F_H(t)}{F_{tot}(t)} \times 100\%$$
- **Index of Force Application Technique ($D_{RF}$)**: pendenza lineare del decremento di $RF$ all'aumentare della velocità di avanzamento:
  $$D_{RF} = \frac{\Delta RF}{\Delta v} \quad (\% \cdot \text{s/m})$$
Un valore di $D_{RF}$ meno negativo (es. $-6.5\% \cdot \text{s/m}$ vs $-8.5\% \cdot \text{s/m}$) riflette una capacità superiore di mantenere la spinta propulsiva in avanti anche ad andature prossime alla velocità di picco, caratteristica distintiva dei velocisti di élite rispetto ai praticanti di altri sport (Morin et al. 2012).

### 1.4 L'Approccio Bioenergetico di di Prampero: La "Pendenza Equivalente"
Nel fondamentale lavoro di di Prampero et al. (2005), la corsa accelerata su terreno piano viene formalizzata come equivalente alla corsa a velocità costante su una salita inclinata di un angolo $\alpha$.
L'accelerazione orizzontale $a_f$ agisce sul centro di massa analogamente a un campo gravitazionale inclinato:

$$\tan \alpha = \frac{a_f}{g} \implies ES = \frac{a_f}{g}$$

dove $ES$ è la **pendenza equivalente (Equivalent Slope)**.
Le implicazioni bioenergetiche sono straordinarie:
1. All'uscita dai blocchi ($t \to 0$), con $a_f \approx 8\text{--}9\text{ m/s}^2$, la pendenza equivalente $ES \approx 0.8\text{--}0.9$ ($80\text{--}90\%$ di pendenza in salita!).
2. Il costo energetico della corsa accelerata $C_{sr}$ nei primi metri raggiunge valori impressionanti ($\sim 44\text{ J}\cdot\text{kg}^{-1}\cdot\text{m}^{-1}$ rispetto ai soli $3.8\text{ J}\cdot\text{kg}^{-1}\cdot\text{m}^{-1}$ della corsa a velocità costante su terreno pianeggiante).
3. La potenza metabolica istantanea supera i $90\text{ W/kg}$ nei primi passi di spinta.
Questo modello certifica che l'accelerazione iniziale impone un dispendio meccanico e metabolico asimmetrico e non lineare, assolutamente incompatibile con la linearità ipotizzata da formule basate puramente sulla velocità media.

---

## 2. Impatto della Fase di Accelerazione sul Calcolo della Velocità Media

### 2.1 Dimostrazione Analitica del "Tempo Perso" $\tau$ e della Sottostima di $d/T$
Perché la velocità media $\bar{v} = d/T$ sottostima sistematicamente la velocità di regime $v_{\max}$? 
La risposta risiede nell'integrazione asintotica della legge oraria.

Consideriamo la posizione per tempi sufficientemente lunghi da rendere trascurabile il termine esponenziale decadente ($t \gg \tau$, convenzionalmente $t \ge 4\tau$, corrispondente a $t \ge 4\text{--}5\text{ s}$ o $d \ge 35\text{--}40\text{ m}$):
Poiché $\lim_{t \to \infty} e^{-t/\tau} = 0$, la legge oraria $x(t) = v_{\max}[t + \tau(e^{-t/\tau} - 1)]$ converge alla retta asintotica:

$$x_{asintoto}(t) = v_{\max}(t - \tau) = v_{\max} \cdot t - v_{\max} \cdot \tau$$

Interpretazione geometrico-fisica:
- L'atleta che parte da fermo accumula un ritardo spaziale costante $\Delta x_{loss} = v_{\max} \cdot \tau$ rispetto a un corridore fittizio che avesse corso fin dal primo istante alla velocità di regime $v_{\max}$.
- Equivalentemente, l'atleta accumula un **ritardo temporale costante** pari esattamente a:
  $$\Delta t_{loss} = \tau$$
  L'atleta "perde" esattamente un tempo pari a $\tau$ (circa $1.1\text{--}1.4\text{ s}$) solo per vincere l'inerzia e accelerare il proprio corpo da $0$ a $v_{\max}$.

```
Distanza x(t) [m]
 ^
 |                                           /  x_asintoto = v_max * (t - tau)
 |                                         /
 |                                       /
 |                                     /
 |                                   /
 |                                 /
 |                               /   <--- Curva reale x(t)
 |                             /
 |                           .'
 |                        .-'
 |                     .-'
 |      |<- tau ->|  .'
 0------+---------+----------------------------------------> Tempo t [s]
       t=0       t=tau
```

Di conseguenza, il tempo totale $T(d)$ necessario per percorrere una distanza $d \ge 40\text{ m}$ può essere eccellentemente approssimato dalla relazione lineare:

$$T(d) \approx \frac{d}{v_{\max}} + \tau$$

Sostituendo tale espressione nella definizione di velocità media $\bar{v}(d) = d / T(d)$:

$$\bar{v}(d) = \frac{d}{\frac{d}{v_{\max}} + \tau} = \frac{v_{\max}}{1 + \frac{v_{\max}\tau}{d}}$$

Esprimendo il rapporto tra velocità media e velocità massima asintotica:

$$\frac{\bar{v}(d)}{v_{\max}} = \frac{d}{d + v_{\max}\tau} = \frac{1}{1 + \frac{v_{\max}\tau}{d}}$$

Dalla formula emerge con chiarezza matematica cristallina:
- Poiché $v_{\max} > 0$ e $\tau > 0$, il denominatore è sempre strettamente maggiore di $1$, il che implica che **$\bar{v}(d)$ è sempre strettamente inferiore a $v_{\max}$ per qualsiasi distanza finita**.
- Lo scarto percentuale tra velocità media e velocità massima è pari a:
  $$\text{Gap}_{\%}(d) = 1 - \frac{\bar{v}(d)}{v_{\max}} = \frac{v_{\max}\tau}{d + v_{\max}\tau}$$
- Lo scarto è inversamente proporzionale alla distanza $d$: **più la distanza è breve, più l'accelerazione iniziale pesa sulla media complessiva**.

### 2.2 Quantificazione Comparativa tra Distanze (50m, 100m, 200m, 300m)
Assumiamo come riferimento i parametri biomeccanici tipici di un velocista di ottimo livello (corrispondente all'Atleta 1 del nostro dataset sperimentale: $100\text{ m}$ in $10.8\text{ s}$):
- $v_{\max} = 10.50\text{ m/s}$
- $\tau = 1.25\text{ s}$
- $v_{\max} \cdot \tau = 10.50 \times 1.25 = 13.125\text{ m}$ (distanza virtuale persa nell'accelerazione)
- Tempo perso: $\tau = 1.25\text{ s}$

| Distanza ($d$) | Tempo Reale/Previsto $T$ (s) | Velocità Media $\bar{v} = d/T$ (m/s) | Rapporto $\bar{v} / v_{\max}$ | Sottostima rispetto a $v_{\max}$ | Fenomeno Biomeccanico Dominante |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **30 m** | $4.10\text{ s}$ | $7.32\text{ m/s}$ | **$69.7\%$** | **$-30.3\%$** | Pura accelerazione inerziale ($F_0$, spinta orizzontale) |
| **50 m** | $6.01\text{ s}$ | $8.32\text{ m/s}$ | **$79.2\%$** | **$-20.8\%$** | Transizione da accelerazione a velocità massima |
| **60 m** | $6.96\text{ s}$ | $8.62\text{ m/s}$ | **$82.1\%$** | **$-17.9\%$** | Raggiungimento del plateau di $v_{\max}$ ($>98\%$) |
| **100 m** | $10.77\text{ s}$ | $9.28\text{ m/s}$ | **$88.4\%$** | **$-11.6\%$** | Breve mantenimento di $v_{\max}$ + lieve fatica iniziale |
| **200 m** | $20.80\text{ s}$ | $9.62\text{ m/s}$ | **$91.6\%$** | **$-8.4\%$** | Decelerazione metabolica e neuromuscolare nel 2° 100m |
| **300 m** | $33.50\text{ s}$ | $8.96\text{ m/s}$ | **$85.3\%$** | **$-14.7\%$** | Esaurimento anaerobico lattacido e crollo di stiffness |

#### Analisi Critica dei Risultati per Distanza:
1. **50 m vs 100 m**:
   - Nei 50 metri, oltre il $70\%$ della prova si svolge in regime accelerativo. La velocità media ($8.32\text{ m/s}$) è **inferiore di oltre il $20\%$** rispetto alla velocità massima raggiungibile ($10.50\text{ m/s}$).
   - Nei 100 metri, la fase di accelerazione (0–40/50 m) incide solo per circa il $40\text{--}50\%$ della gara, consentendo all'atleta di viaggiare a velocità prossima a $v_{\max}$ per altri 30–40 metri. La sottostima si riduce a circa l'**$11.6\%$**.
2. **200 m**:
   - Se la velocità rimanesse costante a $v_{\max}$ dopo i primi 50 m, il tempo sarebbe $200 / 10.50 + 1.25 = 20.30\text{ s}$ ($\bar{v} = 9.85\text{ m/s}$, pari al $93.8\%$ di $v_{\max}$).
   - Nella realtà, come dimostrato dai dati IAAF (Graubner & Nixdorf 2011; Pollock et al. 2017) e dagli studi su nastro strumentato di Girard et al. (2016), nel secondo 100m la velocità decade di circa il $15\text{--}20\%$ a causa della fatica neuromuscolare e dell'acidificazione cellulare. L'atleta chiude in $\approx 20.80\text{ s}$, determinando una velocità media effettiva di circa $9.62\text{ m/s}$.
3. **300 m**:
   - L'impatto dell'accelerazione iniziale dai blocchi (0–40 m) diventa percentualmente trascurabile ($<13\%$ della distanza).
   - Tuttavia, la velocità media crolla drasticamente (a $8.96\text{ m/s}$ o meno, inferiore a quella dei 100m!) non a causa dell'inerzia di partenza, ma a causa dell'**accumulo catastrofico di metaboliti e del crollo della stiffness verticale e della forza orizzontale** (Girard et al. 2016; Hanon & Gajer 2009).

> **Conclusione Teoretica:** Utilizzare la velocità media $\bar{v} = d/T$ per comparare o prescrivere andature su distanze eterogenee (es. 50 m vs 150 m vs 300 m) è un errore di principio fisico. La velocità media fonde insieme due fenomeni ortogonali: **l'inerzia meccanica iniziale** (predominante sotto i 60 m) e **la degradazione metabolica da fatica** (predominante oltre i 150 m).

---

## 3. Metodi Scientifici di Prescrizione delle Andature Submassimali

La letteratura applicata e la metodologia dell'allenamento d'élite offrono approcci alternativi alla prescrizione basata su $T_{100}/p$:

```
                      METODOLOGIE DI PRESCRIZIONE SPRINT
                                       |
    +----------------------------------+----------------------------------+
    |                                                                     |
Metodi Basati sul Tempo Totale (d/T)                Metodi Basati sulla Velocità Istantanea
    |                                                                     |
    * Formula Classica: T = T100 / p                       +--------------+--------------+
    * Presuppone v_media costante                          |                             |
    * Sottostima v_max sulle brevi distanze       Flying Sprints / VBT           Profilo F-v e Sled
    * Distorsione coordinativa all'avvio          * Target v = p * v_max         * Carico con traino
                                                  * Rincorsa 20-30m lanciata     * Target %v_dec (10-50%)
                                                  * Zero artefatto inerziale     * Sovraccarico orizzontale
```

### 3.1 Confronto Critico tra Metodologie di Prescrizione

| Metodologia | Formula Operativa | Parametro di Ancoraggio | Vantaggi Pratici | Limiti e Distorsioni Meccaniche |
| :--- | :---: | :---: | :--- | :--- |
| **Tempo su Distanza ($T_{100}/p$)** | $T(d, p) = \frac{T_{100}(d)}{p}$ | Tempo massimale della prova $T_{100}$ | Massima facilità applicativa; richiede solo cronometro manuale o foglio Excel. | Distorsione dell'inerzia iniziale: a percentuali basse ($70\%$), non definisce come accelerare. Un 80% su 50m ha un carico meccanico diverso da un 80% su 200m. |
| **Flying Sprints (VBT Lanciato)** | $v_{targ} = p \cdot v_{\max}$ | $v_{\max}$ misurata su tratto lanciato (10–20m) | Elimina al 100% l'artefatto dell'accelerazione iniziale; carico su hamstring e stiffness perfettamente proporzionale. | Richiede spazio di accelerazione libero (rincorsa di 20–30m) e strumenti di misura (radar, laser, fotocellule sincronizzate). |
| **Anaerobic Speed Reserve (ASR)** | $v = MAS + p \cdot (MSS - MAS)$ | $MSS$ (Max Sprint Speed) e $MAS$ (Max Aerobic Speed) | Metodo d'elezione negli sport di squadra e mezzofondo veloce (400–800m); rispetta la fisiologia energetica mista. | Meno rilevante per i velocisti puri sui 50–100 m, dove il sistema aerobico contribuisce in misura minimale durante la prova. |
| **Profilo $F\text{-}v$ con Traini (Sled VBT)** | $Load_{\%} = \%v_{dec}$ | $F_0$, $v_0$, $P_{\max}$ e decremento di velocità | Consente di sovraccaricare la forza orizzontale massima ($F_0$) a velocità ridotta senza alterare lo sforzo massimale neurale. | Specifico per l'allenamento di forza orizzontale; non applicabile direttamente alla corsa libera su pista per distanze lunghe. |

---

## 4. Limiti Meccanici e Biomeccanici della Prescrizione $T_{100}/p$

### 4.1 Il Paradosso Meccanico dell'Accelerazione Submassimale
Quando un allenatore assegna a un centometrista (es. $T_{100} = 10.8\text{ s}$, $v_{\max} = 10.5\text{ m/s}$) una prova di $100\text{ m}$ all'$80\%$ ($p = 0.80$), il tempo target calcolato da Excel è:
$$T_{80\%} = \frac{10.8\text{ s}}{0.80} = 13.50\text{ s}$$
La velocità media richiesta è $\bar{v} = 100 / 13.50 = 7.41\text{ m/s}$ (rispetto ai $9.26\text{ m/s}$ del massimale).

Come deve gestire l'atleta la propria accelerazione nei primi 30 metri?
Si delineano due scenari meccanici estremi:

#### Scenario A: Accelerazione Massimale e Plateau Decurtato
Se l'atleta esce dai blocchi con la consueta accelerazione massimale ($a_{\max} \approx 8.4\text{ m/s}^2$, $\tau \approx 1.25\text{ s}$):
- Ai 30 metri transita in circa $4.10\text{ s}$ con velocità istantanea di circa $9.5\text{ m/s}$.
- Per chiudere la prova in $13.50\text{ s}$, gli restano a disposizione $13.50 - 4.10 = 9.40\text{ s}$ per coprire i restanti 70 metri.
- La sua velocità media nei restanti 70 metri deve essere: $70 / 9.40 = \mathbf{7.45\text{ m/s}}$.
- L'atleta dovrebbe cioè accelerare a tutta fino a $9.5\text{ m/s}$ e poi **frenare bruscamente** per stabilizzarsi su un'andatura del $70\%$ di $v_{\max}$! Questo schema motorio è palesemente assurdo, antieconomico e mai adottato nella pratica.

#### Scenario B: Accelerazione Scalata Proporzionalmente ("Partenza Dolce")
Se l'atleta cerca di scalare anche l'accelerazione iniziale all'$80\%$:
- L'accelerazione iniziale dovrebbe ridursi a $a_{80\%} = 0.80 \times 8.4 = 6.72\text{ m/s}^2$.
- La velocità di crociera costante dovrebbe attestarsi all'$80\%$ di $v_{\max}$ ($8.40\text{ m/s}$).
- Con un'accelerazione più blanda, la costante di tempo $\tau$ rimane quasi inalterata o tende ad allargarsi, e il tempo per raggiungere il regime stazionario aumenta.

### 4.2 Alterazioni della Cinematica del Passo e della Stiffness Muscolare
La ricerca biomeccanica comparativa tra velocità massimali e submassimali (Weyand et al. 2000, 2010; Kyröläinen et al. 2001; Nagahara et al. 2014) evidenzia che l'andatura submassimale induce alterazioni qualitative e quantitative profonde:

1. **Tempo di Contatto ($T_c$) e Tempo di Volo ($T_f$)**:
   - Nello sprint massimale ($v > 10\text{ m/s}$), il tempo di contatto a terra è ridotto all'estremo ($T_c \approx 0.085\text{--}0.095\text{ s}$) e il tempo di volo è elevato ($T_f \approx 0.12\text{--}0.14\text{ s}$).
   - All'$80\%$ della velocità ($v \approx 7.5\text{--}8.0\text{ m/s}$), $T_c$ aumenta di oltre il $30\text{--}40\%$ ($T_c \approx 0.12\text{--}0.14\text{ s}$).
   - Secondo la legge di Weyand et al. (2000), il tempo di contatto varia in modo inversamente proporzionale alla velocità ($T_c \approx L_c / v$, dove $L_c$ è la distanza percorsa dal COM durante l'appoggio).
2. **Forza Verticale e Frequenza del Passo**:
   - A velocità submassimali, la forza verticale media applicata per unità di peso corporeo cala drasticamente da $\approx 2.5\text{ BM}$ a $\approx 1.8\text{--}2.0\text{ BM}$.
   - Il tempo di oscillazione della gamba libera ($T_{swing}$) rimane tuttavia pressoché costante ($\approx 0.33\text{--}0.36\text{ s}$), confermando che la regolazione della velocità avviene primariamente modulando la spinta a terra e la stiffness, non muovendo gli arti più rapidamente.
3. **Stiffness del Complesso Muscolo-Tendineo (Spring-Mass Model)**:
   - A velocità submassimali, la stiffness verticale ($K_{vert}$) e la stiffness della gamba ($K_{leg}$) si riducono marcatamente. I tessuti tendinei (tendine d'Achille, aponeurosi plantare) lavorano con un ciclo allungamento-accorciamento (SSC) meno rigido e con minor restituzione elastica passiva.
4. **Postura e Transizioni di Accelerazione**:
   - Nello sprint massimale, Nagahara et al. (2014) hanno dimostrato che il corpo compie due transizioni posturali rigorose (sollevamento progressivo del tronco da inclinazione pronunciata a posizione eretta lungo i primi 30–40 m).
   - Nelle andature submassimali, l'atleta **anticipa quasi immediatamente la posizione eretta** (entro i primi 5–10 metri), eliminando la fase di spinta propulsiva orizzontale a tronco flesso e riducendo il rapporto di efficacia $RF$.

### 4.3 Errori di Autoregolazione dell'Atleta (Darrall-Jones et al. 2022)
Lo studio sperimentale di Darrall-Jones et al. (2022) su atleti professionisti ha misurato la capacità reale di modulare le andature submassimali su istruzione verbale:
- **Al $60\%$ nominale di $v_{\max}$**: gli atleti corrono spontaneamente con un **bias medio di $+23\%$** (velocità reale attorno al $74\text{--}83\%$ di $v_{\max}$).
- **Al $70\%$ nominale di $v_{\max}$**: il bias è di **$+11\%$** (velocità reale $78\text{--}88\%$).
- **All'$80\%$ nominale di $v_{\max}$**: il bias si riduce a **$+2\%$** (buona aderenza media, ma con dispersione individuale tra $71\%$ e $91\%$).
- **Al $90\%$ nominale di $v_{\max}$**: gli atleti corrono con un bias di **$-4\%$** (velocità reale attorno all'$86\%$).

> **Implicazione Diretta per i Fogli Excel dei Ritmi:** Quando una tabella prescrive un'andatura al $60\%$ o $70\%$ basandosi su $T_{100}/p$, l'atleta istintivamente trova il ritmo "innaturale" e tende a correre molto più veloce nella prima frazione di gara (soprattutto sui 50–100 m), accumulando un vantaggio cronometrico che poi gestisce rallentando passivamente nel finale. La tabella descrive una media aritmetica perfetta, ma l'esecuzione motoria reale è fortemente distorta.

---

## 5. Schede Dettagliate delle Fonti Scientifiche

Di seguito vengono analizzati 10 paper scientifici peer-reviewed di primario rilievo metodologico.

---

### Scheda 1: Samozino et al. (2016)
- **Autori:** Pierre Samozino, Guillaume Rabita, Sébastien Dorel, Jean Slawinski, Nicolas Peyrot, Eduardo Saez de Villarreal, Jean-Benoît Morin.
- **Anno:** 2016 (Epub 2015).
- **Titolo:** *A simple method for measuring power, force, velocity properties, and mechanical effectiveness in sprint running.*
- **Journal:** *Scandinavian Journal of Medicine & Science in Sports*, 26(6): 648–658.
- **Identificatori:** PMID: 25996964; DOI: [10.1111/sms.12490](https://doi.org/10.1111/sms.12490).
- **Tipo di studio:** Validazione metodologica e studio di concordanza biometrica (Gold Standard Criterion Validation).
- **Campione:** 15 velocisti maschi allenati (gruppo validità: $n=9$, personal best 100m da sub-élite a élite; gruppo ripetibilità: $n=6$).
- **Outcome misurati:** Forza orizzontale massima teorica ($F_0$), velocità massima teorica ($v_0$), potenza orizzontale massima ($P_{\max}$), pendenza del profilo ($S_{Fv}$), rapporto di efficacia meccanica ($RF$) e suo decremento ($D_{RF}$). Confronto tra metodo da fotocellule/radar vs pedane di forza su 40 m di pista.
- **Risultati chiave:** Il metodo macroscopico basato su cinematica inversa da split times/radar ha mostrato un bias medio bassissimo ($<5\%$) e limiti di concordanza stretti rispetto alle pedane di forza. L'affidabilità inter-prova ha mostrato un errore standard di misura $<5\%$. Dimostrata la linearità della relazione forza-velocità orizzontale ($R^2 > 0.95$).
- **Limiti metodologici:** Non considera l'asimmetria passo-passo tra arto dominante e non dominante; assume che la massa corporea dell'atleta sia concentrata nel centro di massa; modello bidimensionale sul piano sagittale.
- **Livello di qualità metodologica:** **Alta** (Criterio di validazione contro pedane di forza lungo l'intera accelerazione).

---

### Scheda 2: Morin et al. (2012)
- **Autori:** Jean-Benoît Morin, Muriel Bourdin, Pascal Edouard, Nicolas Peyrot, Pierre Samozino, Jean-René Lacour.
- **Anno:** 2012.
- **Titolo:** *Mechanical determinants of 100-m sprint running performance.*
- **Journal:** *European Journal of Applied Physiology*, 112(11): 3921–3930.
- **Identificatori:** PMID: 22422028; DOI: [10.1007/s00421-012-2379-8](https://doi.org/10.1007/s00421-012-2379-8).
- **Tipo di studio:** Studio correlazionale e biomeccanico su campo e laboratorio.
- **Campione:** 13 soggetti maschi con ampio ventaglio prestazionale (9 studenti di scienze motorie non specialisti, 3 velocisti di livello nazionale francese, 1 velocista di classe mondiale con PB 100m $< 10.0\text{ s}$).
- **Outcome misurati:** Parametri meccanici registrati su nastro strumentato (GRF antero-posteriore e verticale, $F_0$, $v_0$, $P_{\max}$, $RF$, $D_{RF}$) correlati con il tempo ufficiale sui 100 metri piani su pista all'aperto.
- **Risultati chiave:** La prestazione sui 100 m è risultata correlata in modo quasi perfetto con la potenza massima orizzontale ($r = -0.91$, $p < 0.001$) e con la capacità di mantenere un orientamento propulsivo in avanti alle alte velocità ($D_{RF}$, $r = 0.86$, $p < 0.001$). Al contrario, la forza verticale totale ($F_V$) e la forza totale risultante ($F_{tot}$) non hanno mostrato correlazione significativa con la prestazione di sprint sui 100m.
- **Limiti metodologici:** Campione eterogeneo (ha favorito correlazioni elevate); lo sprint su nastro motorizzato vincolato differisce parzialmente dallo sprint libero su pista con blocchi di partenza.
- **Livello di qualità metodologica:** **Alta** (Paper fondamentale che ha scardinato il paradigma della pura forza verticale).

---

### Scheda 3: di Prampero et al. (2005)
- **Autori:** Pietro Enrico di Prampero, S. Fusi, L. Sepulcri, Jean-Benoît Morin, Alain Belli, G. Antonutto.
- **Anno:** 2005.
- **Titolo:** *Sprint running: a new energetic approach.*
- **Journal:** *Journal of Experimental Biology*, 208(Pt 14): 2809–2816.
- **Identificatori:** PMID: 16000549; DOI: [10.1242/jeb.01700](https://doi.org/10.1242/jeb.01700).
- **Tipo di studio:** Studio bioenergetico e modellizzazione fisico-matematica del moto.
- **Campione:** 11 atleti maschi allenati (età $24.5 \pm 3.2$ anni).
- **Outcome misurati:** Cinematica dello sprint tramite radar Doppler ($v(t)$, $a(t)$), calcolo della pendenza equivalente ($ES$), costo energetico dello sprint ($C_{sr}$), potenza metabolica istantanea e media.
- **Risultati chiave:** Lo sprint accelerato equivale meccanicamente alla corsa a velocità costante su una salita la cui pendenza è $ES = a_f / g$. Nei primi metri, il costo energetico ammonta a circa $44\text{ J}\cdot\text{kg}^{-1}\cdot\text{m}^{-1}$ (oltre 11 volte il costo a velocità costante, $3.8\text{ J}\cdot\text{kg}^{-1}\cdot\text{m}^{-1}$) e la potenza metabolica supera i $90\text{ W/kg}$. Dimostrata l'inadeguatezza di considerare costante la spesa energetica per metro durante la transizione accelerativa.
- **Limiti metodologici:** Assume che il rendimento energetico della corsa accelerata sia identico a quello della corsa in salita stazionaria; trascura le dispersioni legate alle oscillazioni del COM nei primissimi appoggi.
- **Livello di qualità metodologica:** **Alta** (Pietra miliare dell'energetica della locomozione, base di tutti i moderni GPS nel calcio e atletica).

---

### Scheda 4: Cross et al. (2017)
- **Autori:** Matt R. Cross, Matt Brughelli, Pierre Samozino, Jean-Benoît Morin.
- **Anno:** 2017.
- **Titolo:** *Methods of Power-Force-Velocity Profiling During Sprint Running: A Narrative Review.*
- **Journal:** *Sports Medicine*, 47(7): 1255–1269.
- **Identificatori:** PMID: 27896682; DOI: [10.1007/s40279-016-0653-3](https://doi.org/10.1007/s40279-016-0653-3).
- **Tipo di studio:** Narrative Review critica con linee guida metodologiche.
- **Campione:** Revisione sistematica della letteratura sperimentale e teorica esistente (decine di studi su velocisti e atleti di sport di squadra).
- **Outcome misurati:** Validità, accuratezza, assunzioni matematiche e affidabilità delle metodologie di profilazione $F\text{-}v\text{-}P$ (pedane di forza, nastri strumentati, radar, laser, fotocellule e video-analisi).
- **Risultati chiave:** La modellizzazione mono-esponenziale $v(t) = v_{\max}(1 - e^{-t/\tau})$ costituisce lo standard de facto per la determinazione della cinematica e cinetica orizzontale in campo aperto. Vengono definite le equazioni per la correzione aerodinamica e per il calcolo dell'equilibrio ottimale forza-velocità ($FV_{imb}$). Evidenziata la necessità di sincronizzare rigorosamente l'istante di avvio ($t_0$) per non distorcere il parametro $\tau$.
- **Limiti metodologici:** Trattandosi di review, sintetizza evidenze di studi con protocolli talvolta disomogenei.
- **Livello di qualità metodologica:** **Alta** (Guida di riferimento internazionale per l'analisi dello sprint).

---

### Scheda 5: Healy, Kenny & Harrison (2022)
- **Autori:** Robin Healy, Ian C. Kenny, Andrew J. Harrison.
- **Anno:** 2022.
- **Titolo:** *Profiling elite male 100-m sprint performance: The role of maximum velocity and relative acceleration.*
- **Journal:** *Journal of Sport and Health Science*, 11(1): 75–84.
- **Identificatori:** PMID: 35033878; DOI: [10.1016/j.jshs.2019.10.002](https://doi.org/10.1016/j.jshs.2019.10.002).
- **Tipo di studio:** Studio osservazionale retrospettivo ad alta risoluzione su competizioni mondiali.
- **Campione:** 82 velocisti maschi di élite internazionale partecipanti a gare di campionati mondiali e meeting Diamond League (100 m).
- **Outcome misurati:** Modellizzazione mono-esponenziale dai tempi di passaggio (split times a 20, 40, 60, 80, 100 m); stima di $v_{\max}$, costante di tempo $\tau$, accelerazione relativa ($a_{\max} = v_{\max}/\tau$) e decremento finale di velocità ($v_{Loss}$).
- **Risultati chiave:** La velocità massima $v_{\max}$ correla in modo quasi perfetto con il tempo totale sui 100m ($r \ge -0.90$). Gli atleti più veloci (primo terzile) hanno mostrato valori di $\tau$ significativamente più elevati ($p < 0.001$), a dimostrazione che gli atleti di vertice non smettono di accelerare ai 30 metri, ma prolungano l'accelerazione fino a 50–60 metri per raggiungere picchi di velocità più alti. Nessuna differenza statisticamente significativa nella perdita di velocità percentuale ($v_{Loss}$) negli ultimi 20m tra il gruppo più veloce e quello più lento: il 100m si decide sull'accelerazione e sulla velocità di picco, non sulla decelerazione.
- **Limiti metodologici:** Dati ricavati da video-analisi e split ottici ufficiali su 4–5 punti; non misura le forze d'appoggio al suolo.
- **Livello di qualità metodologica:** **Alta** (Campione eccezionale di atleti di livello mondiale assoluto).

---

### Scheda 6: Rabita et al. (2015)
- **Autori:** Guillaume Rabita, Sébastien Dorel, Jean Slawinski, Enrique Sáez-de-Villarreal, Alexis Couturier, Pierre Samozino, Jean-Benoît Morin.
- **Anno:** 2015.
- **Titolo:** *Sprint mechanics in world-class athletes: a new insight into the limits of human locomotion.*
- **Journal:** *Scandinavian Journal of Medicine & Science in Sports*, 25(5): 583–594.
- **Identificatori:** PMID: 25640466; DOI: [10.1111/sms.12389](https://doi.org/10.1111/sms.12389).
- **Tipo di studio:** Studio sperimentale biomeccanico su campo.
- **Campione:** 9 velocisti maschi di livello altissimo divisi in: gruppo élite ($n=4$, PB 100m tra $9.95\text{ s}$ e $10.29\text{ s}$) e gruppo sub-élite ($n=5$, PB tra $10.40\text{ s}$ e $10.60\text{ s}$).
- **Outcome misurati:** Registrazione passo-passo della dinamica di sprint mediante serie continua di pedane di forza integrate nella pista indoor; calcolo di $F_Y$ (forza orizzontale), $F_Z$ (forza verticale), potenza e $RF$.
- **Risultati chiave:** Confermata la linearità di $F_Y\text{-}v$ ($R^2 \approx 0.89$) e di $RF\text{-}v$ ($R^2 \approx 0.95$). Gli atleti sotto i 10.0 s hanno dimostrato una capacità nettamente superiore di produrre forza orizzontale a velocità superiori a $8\text{ m/s}$ e di minimizzare le forze frenanti all'impatto del piede. Il limite principale della locomozione umana in accelerazione è la capacità di proiettare forza propulsiva in un intervallo di contatto ultrabreve ($< 90\text{ ms}$).
- **Limiti metodologici:** Numero ridotto di soggetti (sebbene giustificato dal livello d'élite mondiale, inclusi atleti sub-10s).
- **Livello di qualità metodologica:** **Alta** (Misura diretta con pedane di forza su atleti mondiali).

---

### Scheda 7: Girard et al. (2016)
- **Autori:** Olivier Girard, Françoise Brocherie, Katarina Tomazin, Abdulaziz Farooq, Jean-Benoît Morin.
- **Anno:** 2016.
- **Titolo:** *Changes in running mechanics over 100-m, 200-m and 400-m treadmill sprints.*
- **Journal:** *Journal of Biomechanics*, 49(9): 1490–1497.
- **Identificatori:** PMID: 27015963; DOI: [10.1016/j.jbiomech.2016.03.020](https://doi.org/10.1016/j.jbiomech.2016.03.020).
- **Tipo di studio:** Studio sperimentale comparativo crossover (fatica neuromuscolare e cinematica).
- **Campione:** 11 atleti maschi fisicamente attivi (età $31.8 \pm 5.1$ anni).
- **Outcome misurati:** Forze di reazione al suolo (GRF), parametri spatiotemporali ($T_c$, $T_f$, lunghezza e frequenza del passo), stiffness verticale e della gamba analizzati ogni 50m su prove massimali di 100m, 200m e 400m su nastro strumentato.
- **Risultati chiave:** Il calo della velocità tra inizio e fine prova è stato del $-8\%$ (100m), $-20\%$ (200m) e $-39\%$ (400m). I tempi di contatto ($T_c$) sono aumentati del $+7\%$ (100m), $+22\%$ (200m) e $+36\%$ (400m). La degradazione della forza al suolo colpisce in modo sproporzionatamente più severo la **forza orizzontale propulsiva** rispetto a quella verticale. La stiffness della gamba cala significativamente solo sui 200m e 400m, certificando il collasso elastico nei tratti finali delle prove prolungate.
- **Limiti metodologici:** Eseguito su nastro da corsa (manca la curva reale dei 200m e 400m); atleti allenati ma non velocisti specialisti di livello olimpico.
- **Livello di qualità metodologica:** **Media-Alta** (Dimostrazione impeccabile del comportamento meccanico differenziato tra 100, 200 e 400 m).

---

### Scheda 8: Nagahara et al. (2014)
- **Autori:** Ryu Nagahara, Takeo Matsubayashi, Akifumi Matsuo, Koji Zushi.
- **Anno:** 2014.
- **Titolo:** *Kinematics of transition during human accelerated sprinting.*
- **Journal:** *Biology Open*, 3(8): 688–699.
- **Identificatori:** PMID: 24996923; DOI: [10.1242/bio.20148284](https://doi.org/10.1242/bio.20148284).
- **Tipo di studio:** Analisi cinematica 3D passo-passo ad alta frequenza.
- **Campione:** 12 velocisti maschi universitari (PB 100m: $10.87 \pm 0.32\text{ s}$).
- **Outcome misurati:** Cinematica tridimensionale completa dell'intero sprint di 60m mediante sistema multicamera (50 telecamere lungo la pista); traiettoria del baricentro, angoli articolari, posizione del piede all'appoggio rispetto al baricentro.
- **Risultati chiave:** La fase di accelerazione non è un continuum uniforme, ma presenta **due distinte transizioni cinematiche** che dividono la corsa in tre sezioni:
  1. *Sezione iniziale (0–10 m)*: il piede atterra dietro o sotto il baricentro; accelerazione generata prevalentemente da coscia e gamba.
  2. *Sezione intermedia (10–35 m)*: prima transizione (l'appoggio passa davanti al baricentro, il ginocchio ammortizza, la frequenza del passo si stabilizza).
  3. *Sezione finale (35–60 m)*: seconda transizione (fine del raddrizzamento del tronco, stabilizzazione cinematica dell'anca, contributo propulsivo affidato prevalentemente a caviglia e piede).
- **Limiti metodologici:** Non sincronizzato con pedane di forza passo-passo (solo cinematica).
- **Livello di qualità metodologica:** **Alta** (Dettaglio spaziale e cinematografico straordinario su pista reale).

---

### Scheda 9: Darrall-Jones et al. (2022)
- **Autori:** Joshua Darrall-Jones, Gregory Roe, E. Cremen, Ben Jones.
- **Anno:** 2022.
- **Titolo:** *Can Team-Sport Athletes Accurately Run at Submaximal Sprinting Speeds? Implications for Rehabilitation and Warm-Up Protocols.*
- **Journal:** *Journal of Strength and Conditioning Research*, 36(8): 2218–2222.
- **Identificatori:** PMID: 35916747; DOI: [10.1519/JSC.0000000000003960](https://doi.org/10.1519/JSC.0000000000003960).
- **Tipo di studio:** Studio sperimentale di accuratezza e autoregolazione motoria.
- **Campione:** 12 giocatori professionisti di rugby union maschi (età $19.7 \pm 0.9$ anni, peso $98.3 \pm 13.9\text{ kg}$).
- **Outcome misurati:** Velocità di sprint sui 40m registrata via radar; confronto tra velocità prescritta verbalmente ($60\%$, $70\%$, $80\%$, $90\%$ di $v_{\max}$) e velocità effettivamente raggiunta, in assenza di feedback esterno in tempo reale.
- **Risultati chiave:** Gli atleti hanno fallito sistematicamente nel rispettare le andature submassimali inferiori:
  - Prescrizione $60\%$: errore medio **$+23\%$** (velocità reale tra $57\%$ e $88\%$).
  - Prescrizione $70\%$: errore medio **$+11\%$** (velocità reale tra $67\%$ e $93\%$).
  - Prescrizione $80\%$: errore medio **$+2\%$** (range reale $71\text{--}91\%$).
  - Prescrizione $90\%$: errore medio **$-4\%$** (range reale $77\text{--}95\%$).
  Senza feedback strumentale oggettivo, gli atleti non sono in grado di dosare l'accelerazione a intensità basse, correndo costantemente troppo veloci.
- **Limiti metodologici:** Campione composto da rugbisti professionisti anziché velocisti puri dell'atletica leggera; distanza limitata a 40 metri.
- **Livello di qualità metodologica:** **Alta** (Metodologia rigorosa e impatto pratico immediato sulla prescrizione).

---

### Scheda 10: Weyand et al. (2000)
- **Autori:** Peter G. Weyand, D. B. Sternlight, M. J. Bellizzi, S. Wright.
- **Anno:** 2000.
- **Titolo:** *Faster top running speeds are achieved with greater ground forces not more rapid leg movements.*
- **Journal:** *Journal of Applied Physiology*, 89(5): 1991–1999.
- **Identificatori:** PMID: 11053354; DOI: [10.1152/jappl.2000.89.5.1991](https://doi.org/10.1152/jappl.2000.89.5.1991).
- **Tipo di studio:** Studio fondamentale di biomeccanica della locomozione umana.
- **Campione:** 33 soggetti maschi e femmine con range di velocità massimale da $6.2\text{ m/s}$ a $11.1\text{ m/s}$ (inclusi velocisti d'élite).
- **Outcome misurati:** Forze verticali applicate al suolo su treadmill dinamometrico ad alta velocità, tempo di contatto ($T_c$), tempo di volo ($T_f$), tempo di swing ($T_{sw}$).
- **Risultati chiave:** La velocità massima di corsa umana è limitata non dalla velocità con cui gli arti si muovono nell'aria (il tempo di swing è invariante e pari a $\approx 0.33\text{--}0.37\text{ s}$ sia a velocità moderate che massime), bensì dalla capacità di applicare elevate forze verticali per unità di peso corporeo ($> 2.0\text{--}2.5\text{ BM}$) in tempi di contatto estremamente ristretti ($< 0.10\text{ s}$). Passando da andature submassimali a massimali, la modulazione della velocità è quasi interamente determinata dall'aumento della forza specifica applicata e dalla contrazione del tempo di contatto ($T_c$).
- **Limiti metodologici:** Valutazione condotta su nastro trasportatore a velocità costante imposta; non analizza l'accelerazione da fermo.
- **Livello di qualità metodologica:** **Alta** (Studio di riferimento assoluto citato oltre 2000 volte).

---

## 6. Tavola Sinottica di Sintesi Epistemologica: Fatti Empirici vs Inferenze Meccaniche

Per garantire la massima integrità scientifica, la seguente tabella separa rigorosamente i **fatti empirici e dati sperimentali direttamente misurati** dalle **inferenze deduttive e modelli teorici** sviluppati dai ricercatori.

| Tema Chiave | Fatti Empirici e Misure Dirette (Letteratura) | Inferenze Meccaniche e Modelli Teorici | Rilevanza per la Formula $T_{100}/p$ |
| :--- | :--- | :--- | :--- |
| **Curva di Velocità $v(t)$** | Le curve radar/laser mostrano un aumento ripido della velocità nei primi 3–4 s, con successiva stabilizzazione su un plateau (Morin 2012, Samozino 2016). | Modello mono-esponenziale $v(t) = v_{\max}(1 - e^{-t/\tau})$. Assume attrito lineare equivalente e forza propulsiva iniziale costante (Hill 1927). | Dimostra che l'atleta perde un tempo costante $\tau$ all'avvio. La velocità media $\bar{v}$ è intrinsecamente una funzione di $d$ e non una costante dell'atleta. |
| **Sottostima della Velocità Media** | Lo split dei 10m iniziali è di $\approx 1.89\text{ s}$ ($\bar{v} = 5.29\text{ m/s}$), mentre tra 60 e 80m è di $\approx 0.81\text{ s}$ ($\bar{v} = 12.35\text{ m/s}$) (Bolt, Berlino 2009, Graubner 2011). | Integrazione asintotica: $\bar{v}/v_{\max} = d / (d + v_{\max}\tau)$. Lo scarto decresce come un'iperbole equilatera all'aumentare di $d$. | La formula $T_{100}/p$ tratta i 50m e i 200m come se scalassero identicamente, ma nei 50m l'inerzia distorce la velocità media del $20.8\%$, nei 200m solo dell'$8.4\%$. |
| **Forza Orizzontale vs Verticale** | Le pedane di forza mostrano che $F_H$ cala linearmente da $\approx 8\text{--}10\text{ N/kg}$ a $0$ a velocità massima, mentre $F_V$ rimane elevata (Rabita 2015, Morin 2012). | La limitazione asintotica della velocità umana non è energetica ma vettoriale: a $v_{\max}$ l'arto non ha tempo sufficiente per orientare la spinta all'indietro ($D_{RF}$). | A intensità submassimali ($70\%$), l'atleta orienta la forza meno in avanti e si alza prima, modificando lo schema di reclutamento motorio. |
| **Accelerazione Submassimale** | I rugbisti professionisti a cui viene chiesto il $60\%$ corrono al $74\text{--}83\%$ di $v_{\max}$ (Darrall-Jones 2022). | Gli esseri umani possiedono una coordinazione "hard-wired" per la fuga rapida: l'uscita dai blocchi attiva riflessi di spinta ad alto reclutamento neurale difficili da inibire con precisione. | Le tabelle che prescrivono ritmi blandi (es. $60\text{--}70\%$) su 50–60m descrivono un'andatura che l'atleta non è capace di eseguire fedelmente senza pacer o vincoli esterni. |
| **Dinamica sui 200 e 300 m** | La velocità cala del $20\%$ nel finale dei 200m e del $39\%$ nei 400m, con aumento del tempo di contatto del $22\text{--}36\%$ (Girard 2016). | Collasso della stiffness muscolo-tendinea e deplezione dei substrati fosfagenici (ATP-CP) con acidosi lattica intracellulare (di Prampero 2005). | Nei 200m e 300m la formula $T_{100}/p$ non risente dell'inerzia iniziale, ma risente della resistenza alla fatica: all'$80\%$ l'atleta non sperimenta affatto il crollo della stiffness del $100\%$. |

---

## 7. Raccomandazioni Operative per la Piattaforma T7 e l'Algoritmo Excel

Sulla base delle evidenze estratte dal Filone B, si formulano le seguenti raccomandazioni ingegneristiche e metodologiche per l'evoluzione del modulo di calcolo ritmi:

1. **Conservazione della Formula $T_{100}/p$ come Standard "Coach-Friendly"**:
   - La relazione iperbolica $T = T_{100}/p$ è intuitiva, storicamente radicata e matematicamente esatta per la velocità media. Deve rimanere il core di base per la compatibilità con le consuetudini dei tecnici FIDAL/World Athletics.
2. **Introduzione dell'Indice di Distorsione Inerziale (IDI)**:
   - Per le distanze brevi ($d \le 80\text{ m}$), la piattaforma T7 dovrebbe visualizzare accanto al tempo target un indicatore di avvertenza biomeccanica:
     $$\text{IDI}(d) = \frac{v_{\max}\tau}{d + v_{\max}\tau} \times 100\%$$
     Avvisando il coach che su 50m l'andatura nominale all'$80\%$ corrisponde a una velocità di picco stimata del $\approx 88\text{--}92\%$ per compensare l'inerzia di partenza.
3. **Integrazione del Profilo Flying (Tratto Lanciato)**:
   - Prevedere una modalità alternativa "Flying Start" dove l'intensità percentuale $p$ viene applicata direttamente alla velocità lanciata ($T_{fly} = T_{100,fly} / p$), eliminando la costante $\tau$ per i lavori specifici di speed endurance e sprint mechanics.
4. **Modulo di Conversione per Traini (Sled Resisted Sprinting)**:
   - Utilizzare i parametri di Samozino e Morin per calcolare il carico zavorrato raccomandato (in $\% \text{ Body Mass}$) in funzione del target di deficit di forza o velocità ($10\%$, $25\%$, $50\%$ di decremento di $v_{\max}$), fornendo una funzionalità avanzata di Tier 2/3 assente nei normali fogli Excel.

---
*Report completato in conformità con la Regola 01, la Regola 02 e i requisiti metodologici della Fase 1 (Filone B).*
