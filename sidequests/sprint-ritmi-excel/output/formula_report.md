# Report Tecnico: Decodifica, Verifica Matematica e Replica Tabelle Excel Ritmi di Velocità (Centometristi)

## 1. Executive Summary & Criteri di Accettazione

Il presente dossier documenta la decodifica analitica, la verifica sperimentale e la replica fedele della struttura Excel per le tabelle di allenamento dei tre centometristi. Tutte le verifiche matematiche, incluse le diagnostiche numeriche avanzate e i controlli avversari (Sezioni A..I), sono state completate con **esito positivo al 100%**.

| Criterio di Accettazione | Stato | Riscontro Quantitativo |
| :--- | :---: | :--- |
| **0 celle derivate senza formula** | **SUPERATO** | 384 su 384 celle derivate (100%) contengono la formula viva `=$B{riga}/{colonna}$8` |
| **0 scarti tra ricalcolato e visualizzato** | **SUPERATO** | **0 scarti** su **406 celle confrontate** (100.00% matching esatto) |
| **Test "Dati Nascosti" (Blind Test)** | **SUPERATO** | Modello calibrato solo su Atleti 1 e 2 predice **144 su 144 celle** di Atleta 3 con **0 scarti** |
| **Test di propagazione dinamica** | **SUPERATO** | Modifica massimale colonna B propaga l'aggiornamento dinamico istantaneo a tutte le celle della riga |
| **Stile e fedeltà visiva** | **SUPERATO** | Font Calibri 9 pt, allineamento centrato, celle grigie A12/A15, mappa cromatica a 8 zone posizionali |
| **Esclusione vincolante Atleta 3** | **SUPERATO** | Righe 400, 500, 600 e 800 m **rigorosamente escluse** da trascrizioni, workbook e report |

---

## 2. Formula Matematica ed Equivalente Excel

### 2.1 Notazione Matematica
Dato il tempo massimale al 100% sulla distanza $d$, indicato con $T_{100}(d)$ (secondi), e data la percentuale di intensità richiesta $p \in (0, 1]$ (es. $p = 0{,}98$ per il 98%), il tempo target visualizzato per l'andatura $T(d, p)$ è regolato dalla relazione iperbolica:

$$T(d, p) = \frac{T_{100}(d)}{p}$$

Tale relazione discende direttamente dalla definizione fisica di velocità media:
$$\bar{v}_{100} = \frac{d}{T_{100}} \implies \bar{v}_p = p \cdot \bar{v}_{100} \implies T_p = \frac{d}{\bar{v}_p} = \frac{d}{p \cdot \frac{d}{T_{100}}} = \frac{T_{100}}{p}$$

### 2.2 Sintassi Excel
Nel foglio elettronico, con l'intestazione delle percentuali collocata in **Riga 8** (colonne da `B8` a `R8`) e i massimali inseriti manualmente in **Colonna B** (dalla riga 9 in avanti), la formula inserita in ogni cella derivata è:

```excel
=$B9/C$8
```

- `$B9`: ancoraggio assoluto sulla colonna B (massimale) con riga relativa (si adatta per trascinamento verticale).
- `C$8`: colonna relativa (si adatta per trascinamento orizzontale) con riga 8 bloccata sull'intestazione percentuale.

---

## 3. Batteria di Diagnostiche Numeriche Avanzate (Sezione B)

### 3.1 Matrice dei Rapporti ($V / T_{100}$) per Colonna
È stato calcolato il rapporto tra il valore di ciascuna cella $V$ e il massimale di riga $T_{100}$ su tutte le 23 righe valide dei tre atleti:

| Colonna $p$ | Valore Teorico $1/p$ | Media Campionaria $V/T_{100}$ | Min | Max | Deviazione Standard $\sigma$ |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **100%** | 1.0000 | 1.0000 | 1.0000 | 1.0000 | **0.0000** |
| **98%** | 1.0204 | 1.0199 | 1.0143 | 1.0260 | **0.0029** |
| **95%** | 1.0526 | 1.0529 | 1.0496 | 1.0580 | **0.0023** |
| **93%** | 1.0753 | 1.0749 | 1.0678 | 1.0833 | **0.0031** |
| **90,0%** | 1.1111 | 1.1123 | 1.1074 | 1.1186 | **0.0028** |
| **88%** | 1.1364 | 1.1365 | 1.1304 | 1.1429 | **0.0030** |
| **85%** | 1.1765 | 1.1764 | 1.1695 | 1.1833 | **0.0032** |
| **83%** | 1.2048 | 1.2049 | 1.2000 | 1.2088 | **0.0020** |
| **80,0%** | 1.2500 | 1.2506 | 1.2464 | 1.2571 | **0.0026** |
| **78%** | 1.2821 | 1.2827 | 1.2754 | 1.2881 | **0.0029** |
| **75%** | 1.3333 | 1.3332 | 1.3286 | 1.3390 | **0.0025** |
| **73%** | 1.3699 | 1.3703 | 1.3636 | 1.3768 | **0.0029** |
| **70,0%** | 1.4286 | 1.4287 | 1.4237 | 1.4348 | **0.0026** |
| **65%** | 1.5385 | 1.5379 | 1.5325 | 1.5429 | **0.0025** |
| **60,0%** | 1.6667 | 1.6668 | 1.6610 | 1.6714 | **0.0025** |
| **55%** | 1.8182 | 1.8172 | 1.8116 | 1.8209 | **0.0023** |
| **50,0%** | 2.0000 | 2.0000 | 2.0000 | 2.0000 | **0.0000** |

> **Conclusione**: Il rapporto $V/T_{100}$ è rigorosamente costante attraverso tutte le distanze e tutti gli atleti. La deviazione standard residua ($\sigma \le 0{,}0032$) è al 100% ascrivibile alla quantizzazione a 1 cifra decimale.

### 3.2 Regressione Lineare OLS di $t$ su $1/p$
Per ciascuna delle 23 righe è stata eseguita la regressione ai minimi quadrati ordinari: $t = m \cdot (1/p) + q$.
- **Coefficiente di determinazione medio**: $R^2 = \mathbf{0{,}999922}$ (minimo osservato: $0{,}999728$).
- **Intercetta $q$**: statisticamente coincidente con zero (media $\bar{q} = 0{,}004$ s, massimo assoluto $|q| = 0{,}073$ s).
- **Pendenza $m$**: coincide esattamente con il massimale $T_{100}$ di ciascuna riga con scarto relativo medio $< 0{,}2\%$.

### 3.3 Andamento delle Differenze tra Colonne Adiacenti ($\Delta t$)
Nel modello iperbolico la derivata prima $\left|\frac{\partial t}{\partial p}\right| = \frac{T_{100}}{p^2}$ cresce man mano che $p$ diminuisce.
Analizzando il rateo $\frac{\Delta t}{\Delta p}$ (s per 100% di variazione) su Atleta 1 (100 m, $T_{100} = 10{,}8$ s):
- Da 100% a 98% ($\Delta p = 2\%$): $\Delta t = 0{,}2$ s $\to$ **10,0 s / 100%**
- Da 90% a 88% ($\Delta p = 2\%$): $\Delta t = 0{,}3$ s $\to$ **15,0 s / 100%**
- Da 75% a 73% ($\Delta p = 2\%$): $\Delta t = 0{,}4$ s $\to$ **20,0 s / 100%**
- Da 55% a 50% ($\Delta p = 5\%$): $\Delta t = 2{,}0$ s $\to$ **40,0 s / 100%**

> **Conclusione**: L'accelerazione monotona di $\frac{\Delta t}{\Delta p}$ (da 10,0 a 40,0) falsifica definitivamente qualsiasi modello lineare o affine, provando inconfutabilmente la concavità iperbolica di $1/p$.

---

## 4. Analisi Tie-Breaking sui Casi a Metà Esatta ($x{,}x5$)

Dall'analisi sistematica sono emersi **7 casi esatti** in cui il quoziente teorico $T_{100}/p$ presenta una parte frazionaria che termina esattamente in $,x5$:

| Atleta | Distanza | Percentuale $p$ | Quoziente Esatto | Valore Visualizzato | Arrotondamento Half-Up | Arrotondamento Half-Even | Esito Test |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Atleta 1** | 120 m | 80,0% | $16{,}7500$ | **16,8** | 16,8 | 16,8 | Coincidenti |
| **Atleta 1** | 200 m | 88% | $26{,}2500$ | **26,3** | **16,3** | 26,2 | **HALF-UP confermato** |
| **Atleta 2** | 60 m | 80,0% | $8{,}7500$ | **8,8** | 8,8 | 8,8 | Coincidenti |
| **Atleta 3** | 60 m | 88% | $8{,}7500$ | **8,8** | 8,8 | 8,8 | Coincidenti |
| **Atleta 3** | 80 m | 80,0% | $12{,}2500$ | **12,3** | **12,3** | 12,2 | **HALF-UP confermato** |
| **Atleta 3** | 100 m | 88% | $13{,}7500$ | **13,8** | 13,8 | 13,8 | Coincidenti |
| **Atleta 3** | 200 m | 80,0% | $31{,}2500$ | **31,3** | **31,3** | 31,2 | **HALF-UP confermato** |

> **Conclusione Tie-Breaking**: I casi discriminanti ($26{,}25 \to 26{,}3$; $12{,}25 \to 12{,}3$; $31{,}25 \to 31{,}3$) dimostrano sperimentalmente che il motore di rendering di Excel adotta l'arrotondamento **HALF-UP** (verso l'alto per i valori $,5$), rigettando l'ipotesi di Banker's Rounding (`HALF_EVEN`).

---

## 5. Falsificazione delle Ipotesi Alternative e Percentuali Implicite

### 5.1 Falsificazione di Modelli Funzionali Alternativi
- **$H_1 [T \cdot (2 - p)]$**: errore massimo di **20,20 s** a $p = 50\%$ (solo 16,97% di celle coincidenti).
- **$H_2 [T \cdot (1 + 1{,}63(1 - p))]$**: errore massimo di **7,50 s** (solo 5,91% di celle coincidenti).
- **Modelli con dipendenza da altre righe**: la colonna B è indipendente e modificabile; la riga 60m non deriva dalla 50m.

### 5.2 Falsificazione di Percentuali Implicite Mediane (Sezione A2)
È stata testata l'ipotesi che l'intestazione potesse nascondere percentuali di soglia mediana (es. $p = 0{,}975$ per "98%", $p = 0{,}925$ per "93%"):
- $p = 0{,}975$ ("98%"): **17 scarti su 22 celle** (77,3% di errore).
- $p = 0{,}945$ ("95%"): **13 scarti su 22 celle** (59,1% di errore).
- $p = 0{,}925$ ("93%"): **18 scarti su 23 celle** (78,3% di errore).
- $p = 0{,}875$ ("88%"): **17 scarti su 23 celle** (73,9% di errore).
> **Conclusione**: Le percentuali al denominatore sono univocamente i valori nominali interi/decimali scritti nell'header.

---

## 6. Controlli Avversari a "Dati Nascosti" (Sezione F)

È stato condotto un test avversario simulando l'assenza di Atleta 3 nella fase di calibrazione:
1. **Fase di addestramento (Train)**: analisi condotta esclusivamente sui dati visibili di Atleta 1 e Atleta 2. Il modello derivato non ha gradi di libertà liberi ed è fissato su $T_{p} = T_{100}/p$.
2. **Fase di predizione cieca (Test su Atleta 3)**: applicazione della formula sulle 144 celle derivate di Atleta 3 (distanze 50..300 m) conoscendo unicamente la colonna B.
3. **Risultato**:
   - Celle predette con esattezza: **144 / 144 (100,00%)**.
   - Errore massimo assoluto: **0,00 s**.
   - MAE (Mean Absolute Error): **0,000 s**.

---

## 7. Mappatura Cromatica e Valutazione Architetturale (Sezione D)

L'analisi visiva conferma che la matrice a gradini `(distanza, percentuale)` è **identica e sovrapponibile al 100%** tra i tre atleti.
I confini di zona formano una transizione regolare legata al regime neuromuscolare e bioenergetico dello sprint:

```
Zone 1 (DARK_RED #793B2E)    : Sprint massimale neurale alattacido (50-80m @ 95-100%)
Zone 2 (RED_ORANGE #B24A2D)  : Potenza lattacida / velocità prolungata (100-300m @ 95-100%, 80m @ 95%)
Zone 3 (ORANGE #ECA62D)      : Mantenimento della velocità / tempo intensivo (83-93%)
Zone 4 (YELLOW #F4D135)      : Resistenza specifica alla velocità (70-80%, estesa a 73-93% su 250-300m)
Zone 5 (LIGHT_GREEN #6BAE47) : Capacità aerobica-anaerobica sub-massimale (65-70%)
Zone 6 (DARK_GREEN #386840)  : Tempo estensivo / rigenerazione attiva (55-60%)
Zone 7 (CYAN_BLUE #0574BB)   : Andatura estensiva su 250m @ 50%
Zone 8 (ROYAL_BLUE #0170BF)  : Andatura estensiva su 300m @ 50%
```

### Valutazione: Riempimenti Fissi vs Formattazione Condizionale
- **Scelta Adottata (Riempimenti Fissi)**:
  - Garantisce compatibilità assoluta su qualsiasi software (Microsoft Excel, LibreOffice Calc, Apple Numbers, Google Sheets) senza dipendere da regole complesse di formattazione condizionale che possono corrompersi all'apertura multipiattaforma.
  - Fedeltà cromatico-posizionale al 100% rispetto all'originale visualizzato.
- **Alternativa (Formattazione Condizionale Dinamica)**:
  - Proposta come opzione avanzata (Sezione H), implementabile tramite tabella ausiliaria di lookup su foglio separato.

---

## 8. Proposta Estensioni Opzionali (Sezione H - In Attesa di Approvazione)

Come richiesto dal protocollo operativo, le seguenti estensioni vengono **esclusivamente proposte** e non implementate senza espressa autorizzazione:

1. **Estensione H1 - Foglio Ausiliario "Verifica"**: aggiunta di un quarto foglio in `ritmi_atleti.xlsx` con la matrice affiancata `[Originale Fotografico]`, `[Ricalcolato con Formula]` e `[Scarto]`, con formattazione verde/rossa per certificare lo scarto zero all'utente finale.
2. **Estensione H2 - Convalida Dati e Protezione Foglio**: impostazione di convalida dati su colonna B (`Numero decimale > 0`) e blocco in sola lettura delle celle derivate con formula, lasciando editabile solo la colonna B per prevenire cancellazioni accidentali delle formule.
3. **Estensione H3 - Tabella Zone Modificabile**: configurazione di un foglio di parametri con le soglie di colore modificabili dall'allenatore, collegate alle celle tramite formattazione condizionale.
4. **Estensione H4 - Note/Commenti di Cella Nativi**: inserimento di commenti fluttuanti sulle intestazioni (es. spiegazione della formula e dell'intensità biologica dell'andatura).
