# Analisi Scientifica e Piano di Ottimizzazione: Ritmi di Corsa per Atlete 400entiste (Donne 20-25 anni, Livello Medio-Alto)

**Data di redazione:** 28 Novembre 2026  
**Ambito:** Estensione e verifica del modello `ritmi_atleti.xlsx` ($T = T_{100}(d)/p$, zone `Z7 -> Z1`) per atlete donne 400entiste (20-25 anni, ~52.5-56.5 s).  
**File collegati:**
- Generatore Excel: [build_ergonomic_excel.py](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/sidequests/sprint-ritmi-excel/tools/build_ergonomic_excel.py)
- Profilo 400m Donne: [profile_400m_women.py](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/sidequests/sprint-ritmi-excel/tools/profile_400m_women.py)
- Matrice Zone 400m Donne: [palette_zone_fisiologiche_400f.csv](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/sidequests/sprint-ritmi-excel/output/palette_zone_fisiologiche_400f.csv)
- Workbook finale: [ritmi_atleti.xlsx](file:///e:/Nuove%20App%20Installate/Sports-Analytics-Platform---T7-Workout-APP/sidequests/sprint-ritmi-excel/output/ritmi_atleti.xlsx)

---

## 1. Quesito e Sintesi del Verdetto (Go / No-Go)

**Domanda:** La formula di calcolo $T(d,p) = T_{100}(d)/p$, le percentuali (`50%-100%`) e la matrice delle zone `Z7 -> Z1` valgono identicamente anche per atlete donne 400entiste di medio-alto livello (20-25 anni)? Esiste un margine reale per migliorare le formule e la tabella?

### Verdetto su due livelli
1. **Livello A — Formula base di cella `=$B{riga}/{col}$8` ($T = T_{100}(d)/p$): NESSUN MARGINE DI MIGLIORAMENTO (MANTENUTA)**
   - Sostituire `=$B{riga}/{col}$8` nelle celle `C9:R21` con modelli più complessi (`ASR`, `Critical Speed + D'`, `Power-Law`, `Morin-Samozino`) **peggiorerebbe** l'affidabilità pratica introducendo **pseudo-precisione** e rumore statistico ($CV$ di `MAS` $\approx 2.5\text{--}3.5\%$; $CV$ di $D' > 10\text{--}12\%$).
   - A parità di massimale $T_{100}(d)$ misurato sulla singola riga, $T_{100}(d)/p$ rappresenta esattamente la frazione $p$ della velocità media massimale; lo scarto meccanico dovuto alla fase di accelerazione ($\tau \approx 0.90\text{--}1.15\text{ s}$ nelle donne) sui `80–400 m` è $\le 0.04\text{--}0.15\text{ s}$, inferiore alla variabilità biologica giornaliera ($CV \approx 1.0\text{--}1.5\%$, Haugen et al., 2019).
   - Unici interventi algebrici/metrologici giustificati sulle celle base: guardia su zero/vuoto `=IF($B{row}<=0,"",$B{row}/{col}$8)` e risoluzione `"0.00"` uniforme su `50–80 m` (eliminando l'anomalia della sola cella `I9`).

2. **Livello B — Architettura 400m Donne, Integrità Colonna B, Zone `Z7 -> Z1` e Recuperi: VERO MARGINE DI MIGLIORAMENTO (OTTIMIZZAZIONE MIRATA ATTUATA)**
   - Introdotte colonne di audit `S` (`v100 m/s`) e `T` (`Check Curva`) per intercettare inversioni di velocità nei dati di input (es. `250m=32.5s` vs `300m=38.0s`, o `400m=59.0s` vs `500m=72.0s`).
   - Aggiunto il foglio dedicato **`400m Donne (20-25)`** con profilo campione pulito (~54.5 s), riquadro ancore fisiologiche (`PB 200m`, `Goal 400m`, `MAS`, `MSS`, `CRS` Vittori, esponente individuale `b_ind`, `SRR = MSS/MAS` secondo Rappelt et al., 2025) e stima assistita dei massimali `250–350 m` in Colonna `U` tramite Power-Law locale ($b_{\text{ind}} \approx 1.153$, errore $\le 0.3\text{--}0.8\text{ s}$ contro i $-2.3\text{ a }-5.4\text{ s}$ di Riegel standard $b=1.06$).
   - Aggiunta **Formattazione Condizionale dinamica** su `B9:H21` ($\ge 85\%$) basata sulle soglie temporali (`<=8s` Z7, `8-18s` Z6, `18-40s` Z5, `>40s` Z4), azzerando lo sfasamento del `30.3%` (`67/221` celle) rispetto alle finestre fisiologiche.
   - Riallineati i confini submassimali femminili (`65–73%` su `50–200 m` $\to$ `Z2`; `73–75%` su `350–600 m` $\to$ `Z3 bassa` per l'alta `MAS` delle 400entiste; `Z4` estesa a `40–110 s`) e i recuperi/note su ciclo mestruale in `Legenda e Guida Mobile`.

---

## 2. Evidenze della Letteratura Scientifica (Regola 04)

1. **Energetica 400m Donne (~45% Aerobico / 55% Anaerobico):**
   - *Duffield, Dawson & Goodman (2005)* (*J Sports Sci*, PMID `15966348`): su pista (metodo AOD), il contributo energetico nei 400m è **45% aerobico / 55% anaerobico nelle donne** vs **41% / 59% negli uomini**; picco lattato ~`13.3 mmol/L` nelle donne.
   - *Spencer & Gastin (2001)* (*MSSE*, PMID `11194103`): crossover aerobico ($>50\%$ istantaneo) già tra **15 e 30 s**; un 400m da 52.5–56.5 s trascorre ~30–35 s dopo il crossover.
   - *Hanon et al. (2010)* (*Eur J Appl Physiol*, PMID `20063105`): $\dot{V}\text{O}_2$ raggiunge il $93.9 \pm 3.9\%$ del $\dot{V}\text{O}_2\max$ ai `192 m` (`24.4 s`), seguito da calo finale per acidosi.
2. **Sesso-specificità, Fatica Ripetuta e Recupero:**
   - *Esbjörnsson-Liljedahl et al. (1999, 2002)* (PMID `10517759`, `12183505`); *Hunter (2014, 2016)* (PMID `24433272`, `26440505`); *Ansdell et al. (2020)* (PMID `33002256`); *Billaut & Bishop (2009)* (PMID `19317516`): nelle prove ripetute le donne mostrano minore deplezione netta di ATP e minor calo percentuale tra serie (legato soprattutto al minor lavoro meccanico assoluto per prova).
   - *Lievens et al. (2021)* (PMID `34473575`): la carnosina muscolare è inferiore del ~20–28% nelle donne rispetto agli uomini, rendendo importante l'allenamento lattacido specifico (`Z5 SEM` e `Z4`).
3. **Speed Reserve Ratio (`SRR`) e Curva Velocità-Durata:**
   - *Rappelt et al. (2025)* (*J Sci Med Sport*, PMID `40222867`, coorte comprensiva di 13 donne `55.1 ± 3.0 s` sui 400m): `MSS` e `MAS` spiegano il **90% della varianza** sui 400m ($R^2_{\text{adj}} = 0.90$); distinzione tra *Sprint-type* ($\text{SRR} \ge 1.81$) ed *Endurance-type* ($\text{SRR} \le 1.77$).
   - *Sandford, Laursen & Buchheit (2021)* (*Sports Med*, PMID `34398445`) & *Bundle, Hoyt & Weyand (2003)* (*J Appl Physiol*, PMID `14555668`): sopra la `MAS` la velocità decade esponenzialmente ($k_{\text{run}} = 0.013\text{ s}^{-1}$).
4. **Biomeccanica 400m Femminili:**
   - *Hanon & Gajer (2009)* (*JSCR*) & *World Athletics Biomechanical Reports (London 2017 / Doha 2019)*: picco di velocità tra 50 e 100 m, passaggio ai 200 m al `96.3%` del PB 200m (world-class), decelerazione negli ultimi 100 m del **14–20%** (livello nazionale/sub-élite) guidata principalmente dal calo di frequenza del passo ($SF$).
5. **Ciclo Mestruale:**
   - *McNulty et al. (2020)* (*Sports Med*) & *Meignié et al. (2021)* (*Front Physiol*, PMID `34093223`): effetto medio sulle prestazioni triviale, ampia variabilità interindividuale; *Oosthuyse & Bosch (2010)* (PMID `20199120`): temperatura basale $+0.3\text{–}0.5\,^\circ\text{C}$ e maggiore ossidazione lipidica in fase medio-luteale. Ancorare le sedute a **velocità meccanica + RPE**, non a FC o lattato fisso.
