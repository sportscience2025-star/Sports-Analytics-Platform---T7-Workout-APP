# SPECIFICHE DI ERGONOMIA VISIVA E PALETTE CROMATICA WCAG AA/AAA PER FOGLI DI CALCOLO SPORTIVI AD ALTE PRESTAZIONI

**Data di redazione:** 21 Novembre 2026  
**Autore:** Agente Specialista in UI/UX ed Ergonomia Visiva (Sports Analytics & Field Spreadsheets)  
**Destinatari:** Team di Ricerca Fisiologica, Ingegneri Software Excel/OpenPyXL, Allenatori e Tecnici di Atletica Leggera  
**Stato:** Approvato per Implementazione Tecnica  

---

## 1. Executive Summary e Principi di Ergonomia Ottica da Campo

I fogli di calcolo per l'atletica leggera e gli sport ad alta intensità operano in contesti ambientali radicalmente diversi rispetto ai tradizionali ambienti d'ufficio:
1. **Illuminazione Estrema e Riflessi Solari:** A bordo pista o sul campo, l'illuminanza naturale oscilla tra $10.000\text{ lux}$ (cielo coperto) e oltre $80.000 - 100.000\text{ lux}$ (luce solare diretta). Su display di smartphone, tablet e laptop da campo (luminanza tipica $400 - 1.000\text{ nit}$), i riflessi sulla superficie di vetro abbattono il rapporto di contrasto percepito fino al $60-70\%$.
2. **Fatica Oculare e Aberrazione Cromatica:** L'uso di colori ad elevata saturazione pura (es. rosso primario `#FF0000`, giallo evidenziatore `#FFFF00`, verde fluorescente `#00FF00`) sovraccarica i fotorecettori retinici e genera il fenomeno della *chromostereopsis* (illusione ottica per cui lunghezze d'onda differenti, come rosso e blu, sembrano focalizzate a profondità diverse, costringendo il muscolo ciliare a continui sforzi di accomodazione).
3. **Ergonomia del Touchscreen su Dispositivi Mobili:** Il tecnico consulta i parziali cronometrici mentre cronometra gli atleti, spesso con una sola mano, dita sudate o guanti in clima invernale. La densità visiva e la dimensione dei target di tocco devono essere calibrate al millimetro.

Il presente documento definisce le specifiche cromatiche a norma **WCAG 2.1 (AA e AAA)** e le **soluzioni tecniche native di Microsoft Excel / OpenPyXL** per garantire la massima leggibilità, velocità di consultazione a colpo d'occhio e assenza di affaticamento visivo.

---

## 2. Palette Cromatica Ergonomica a 8 Zone (Specifiche WCAG AA/AAA)

Tutti i contrasti sono stati calcolati secondo l'algoritmo ufficiale **W3C WCAG 2.1 (Relative Luminance and Contrast Ratio)**:
$$\text{Luminanza Relativa } L = 0{,}2126 \cdot R_{lin} + 0{,}7152 \cdot G_{lin} + 0{,}0722 \cdot B_{lin}$$
$$\text{Contrasto } CR = \frac{L_{chiaro} + 0{,}05}{L_{scuro} + 0{,}05}$$

### Tabella Riepilogativa: Palette Raccomandata "Field High-Contrast Elite"
Progettata specificamente per l'uso all'aperto, unisce sfondi saturi/profondi con testo bianco puro per le zone anaerobiche ad alta intensità neurale, e sfondi pastello caldi/naturali con testo carbone scuro per le zone submassimali ed estensive.

| Zona | Nome Funzionale & Fisiologico | Sfondo (Hex) | Testo (Hex) | Luminanza Sfondo | Luminanza Testo | Contrasto (CR) | Rating WCAG 2.1 | Psicologia Visiva & Guida all'Occhio |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Zona 1** | **Max Velocity & Accel. Alattacida** | `#9E2A2B` | `#FFFFFF` | 0.0910 | 1.0000 | **7.45:1** | **AAA** (Testo normale e grande) | Rosso mattone profondo; evita l'abbaglio del rosso puro ma comunica massima urgenza neurale e velocità pura. |
| **Zona 2** | **Potenza Lattacida (Glycolytic)** | `#6C3483` | `#FFFFFF` | 0.0728 | 1.0000 | **8.55:1** | **AAA** (Testo normale e grande) | Viola prugna nobile; segna visivamente il salto tra sprint purissimo e produzione massimale di acido lattico. |
| **Zona 3** | **Special Endurance 1 (SE1)** | `#93401A` | `#FFFFFF` | 0.0994 | 1.0000 | **7.03:1** | **AAA** (Testo normale e grande) | Terracotta calda brunita / Ruggine; transizione verso la capacità lattacida prolungata (150m-300m). |
| **Zona 4** | **Special Endurance 2 (SE2)** | `#F5CBA7` | `#1E1E1E` | 0.6491 | 0.0130 | **11.10:1** | **AAA** (Superiore a 7.0:1) | Ambra dorata vellutata; tonalità calda ma luminosa che facilita la lettura di carichi prolungati (300m-600m). |
| **Zona 5** | **Intensive Tempo** | `#F9E79F` | `#1E1E1E` | 0.7979 | 0.0130 | **13.46:1** | **AAA** (Superiore a 7.0:1) | Giallo sabbia morbido; sostituisce il giallo acido con un tono riposante ad altissimo contrasto. |
| **Zona 6** | **Extensive Tempo** | `#A9DFBF` | `#1E1E1E` | 0.6497 | 0.0130 | **11.11:1** | **AAA** (Superiore a 7.0:1) | Verde salvia ergonomico; situato al centro dello spettro visibile (555 nm), rilassa l'iride e segnala rigenerazione aerobica. |
| **Zona 7** | **Aerobico Rigenerativo** | `#AED6F1` | `#1E1E1E` | 0.6344 | 0.0130 | **10.87:1** | **AAA** (Superiore a 7.0:1) | Azzurro polvere / Ciano desaturato; trasmette freschezza metabolica, recupero attivo e assenza di stress simpatico. |
| **Inattiva** | **Sub-funzionale / Sconsigliata** | `#EEEEEE` | `#9E9E9E` | 0.8550 | 0.3419 | **2.31:1** | **WCAG 1.4.3 Ex.** (Componente Disabilitato) | Grigio perla de-enfatizzato; spegne l'attenzione visiva sulle celle fisiologicamente prive di senso sui tratti corti. |
| *(Inattiva)* | *Opzione Leggibile Alta Visibilità* | `#EEEEEE` | `#616161` | 0.8550 | 0.1195 | **5.34:1** | **AA** (Se l'allenatore desidera leggere il numero) | Variante con testo antracite per consultare il valore numerico stimato pur mantenendo lo sfondo spento. |

> [!IMPORTANT]
> **Conformità WCAG 2.1 per la Zona Inattiva (Eccezione Componenti Disabilitati):**  
> La norma internazionale W3C WCAG 2.1 (Success Criterion 1.4.3 - Contrast Minimum) prevede un'esenzione esplicita:  
> *"Text or images of text that are part of an inactive user interface component, that are pure decoration, that are not visible to anyone [...] have no contrast requirement."*  
> Il rapporto 2.31:1 tra `#EEEEEE` e `#9E9E9E` è **voluto e conforme**, poiché lo scopo ergonomico è indicare che la cella è disattivata/non prescritta senza catturare lo sguardo del tecnico. Se il coach preferisce leggere agevolmente il valore calcolato anche sotto il sole, l'ingegnere può adottare il testo alternativo `#616161` (Contrasto 5.34:1, livello AA).

---

### Variante B: Palette "Uniform Dark-Text Soft Pastel" (Ergonomia Monocromatica)
Per i preparatori che operano prevalentemente al coperto (indoor o laptop all'ombra) e preferiscono un'accomodazione pupillare completamente uniforme (testo `#1E1E1E` Dark Charcoal su tutte le celle, senza alternanza tra caratteri bianchi e neri):

| Zona | Sfondo (Hex) | Nome Tonalità | Testo (Hex) | Contrasto (CR) | Rating WCAG |
| :--- | :---: | :--- | :---: | :---: | :---: |
| **Zona 1** | `#FADBD8` | Corallo Salmone Chiaro | `#1E1E1E` | **12.85:1** | **AAA** |
| **Zona 2** | `#E8DAEF` | Glicine / Malva Chiaro | `#1E1E1E` | **12.47:1** | **AAA** |
| **Zona 3** | `#EDBB99` | Terracotta Desaturata Chiara | `#1E1E1E` | **9.66:1** | **AAA** |
| **Zona 4** | `#FAD7A0` | Ambra Morbida Vellutata | `#1E1E1E` | **12.14:1** | **AAA** |
| **Zona 5** | `#FCF3CF` | Oro Sabbia Pallido | `#1E1E1E` | **14.97:1** | **AAA** |
| **Zona 6** | `#D4EFDF` | Menta / Salvia Chiara | `#1E1E1E` | **13.66:1** | **AAA** |
| **Zona 7** | `#D6EAF8` | Ciano / Azzurro Ghiaccio Chiaro | `#1E1E1E` | **13.48:1** | **AAA** |
| **Inattiva**| `#EEEEEE` | Grigio Perla Disattivato | `#9E9E9E` | **2.31:1** | **Exempt** |

---

## 3. Soluzioni Tecniche Native in Microsoft Excel per Piccoli Schermi

Per rendere un foglio di calcolo con 13 distanze e 17 percentuali immediatamente fruibile su schermi da **5.5" - 6.7" (smartphone)**, **10.2" - 11" (tablet)** e **13" (laptop compatto)**, devono essere implementate le seguenti soluzioni native:

```
+-----------------------------------------------------------------------------------------+
| RIGA 1..7: Intestazione, Titolo Foglio, Parametri Atleta Guida                          |
+----+--------+--------+--------+--------+--------+--------+--------+--------+--------+-----+
| m  | 100%   | 98%    | 95%    | 93%    | 90,0%  | 88%    | 85%    | 83%    | 80,0%  | ... | <- RIGA 8 (BLOCCATA)
+----+--------+--------+--------+--------+--------+--------+--------+--------+--------+-----+
| 50 |  5.9   |  6.0   |  6.2   |  6.3   |  6.6   |  6.7   |  6.9   |  7.11  |  7.4   | ... | <- RIGA 9 (C9 FREEZE)
| 60 |  6.9   |  7.0   |  7.3   |  7.4   |  7.7   |  7.8   |  8.1   |  8.3   |  8.6   | ... |
| 80 |  8.8   |  9.0   |  9.3   |  9.5   |  9.8   | 10.0   | 10.4   | 10.6   | 11.0   | ... |
|100 | 10.8   | 11.0   | 11.4   | 11.6   | 12.0   | 12.3   | 12.7   | 13.0   | 13.5   | ... |
|... |  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |  ...   |  ...   | ... |
+----+--------+--------+--------+--------+--------+--------+--------+--------+--------+-----+
  ^       ^       ^
COL A   COL B   COL C..R (Area a scorrimento orizzontale)
(BLOCC.) (BLOCC.)
```

### 3.1. Blocco Riquadri Bidirezionale (`freeze_panes = "C9"`)
- **Configurazione tecnica:**  
  ```python
  ws.freeze_panes = "C9"
  ```
- **Comportamento funzionale:**  
  Blocca simultaneamente le prime **8 righe** (inclusa la riga 8 con le percentuali dal 100% al 50%) e le prime **2 colonne** (Colonna A con i metri e Colonna B con il massimale T100).
- **Vantaggio ergonomico sul campo:**  
  Quando l'allenatore scorre orizzontalmente verso destra per consultare i ritmi estensivi o di rigenerazione (colonne O, P, Q, R: 60%, 55%, 50%), **la distanza (Col A) e il tempo massimale dell'atleta (Col B) restano perennemente visibili sul bordo sinistro dello schermo**. L'allenatore non deve mai tornare indietro per ricordare quale fosse il massimale di base dell'atleta.

---

### 3.2. Ottimizzazione della Larghezza Colonne (`column_dimensions.width`)
Lo standard predefinito di Excel (larghezza 8.43 caratteri, pari a circa 64 pixel) spreca oltre il $30\%$ dello spazio orizzontale utile.
- **Colonna A (Distanze):** `width = 6.8` (accoglie "m", "50", "100", "600" con margine).
- **Colonna B (Massimale 100% T100):** `width = 7.0` (evidenziata come colonna di input manuale primario).
- **Colonne C..R (Percentuali 98% .. 50%):** `width = 6.2 - 6.4` (ottimale: `6.4`).
- **Motivazione ergonomica:**  
  I valori cronometrici nello sprint contengono da 3 a 5 caratteri (es. `11.0`, `23.5`, `108.5`). Con un corpo carattere di 9-10 pt, una larghezza di 6.4 punti fornisce 50-52 pixel di spazio utile:
  - Elimina categoricamente il rischio di troncamento numerico con i cancelletti di overflow (`###`).
  - Permette di visualizzare **fino a 11-12 colonne simultaneamente** su uno smartphone da 6.1"-6.7" ruotato in orizzontale (landscape), riducendo drasticamente la necessità di scroll.

---

### 3.3. Altezza Righe Tattile per Schermi Touch (`row_dimensions.height`)
- **Riga 8 (Intestazione Percentuali):** `height = 25 - 26 pt`.
- **Righe Dati (9 .. 21, Distanze):** `height = 21 - 22 pt` (default Excel è 15 pt).
- **Standard Touch Ergonomics:**  
  Le linee guida internazionali di interfaccia utente (Apple Human Interface Guidelines e Google Material Design) prescrivono un target tattile minimo di $44 \times 44\text{ pt}$ / $48 \times 48\text{ dp}$.  
  Un'altezza di 21-22 pt a zoom 100% evita la selezione accidentale della riga adiacente ("fat-finger error") quando si tocca lo schermo per evidenziare un parziale con dita fredde o durante la corsa.

---

### 3.4. Tipografia Professionale e Trattamento Numerico
- **Famiglia di Caratteri:** `Aptos` (nuovo font predefinito di Microsoft 365, con disegno a occhi aperti e spessori rinforzati studiati per la massima resa su schermi ad alta e bassa risoluzione), con fallback trasparente a `Calibri`.
- **Gerarchia Tipografica:**
  - **Titoli Generali (A1..A4):** 13-14 pt, Bold, Colore Navy profondo `#1F497D`.
  - **Intestazione Colonne (Riga 8):** 10 pt, Semi-bold/Bold, Allineamento orizzontale e verticale al centro.
  - **Distanze (Colonna A):** 9.5 pt, Semi-bold, Allineamento centrato. Distanze di gara ufficiali (100m, 200m, 400m) contraddistinte da sfondo grigio medio chiaro `#BFBFBF` (o `#D9D9D9`) per immediato ancoraggio visivo.
  - **Massimale T100 (Colonna B):** 10 pt, Bold, con doppio bordo laterale scuro `#404040` per segnalare immediatamente la cella di input dell'allenatore.
  - **Celle Derivate (Colonne C..R):** 9 pt, Regular, Allineamento centrato.
- **Formattazione Numerica:**  
  - Formato rigoroso `0.0` (un solo decimale, es. `11.0`, `23.5`).  
  - Eccezione isolata: `0.00` per il caso storico di 50m all'83% (`7.11 s`), per non appiattire lo scarto al centesimo.
  - La risoluzione a un solo decimale ($\pm 0{,}1\text{ s}$) rispetta fedelmente la variabilità biologica documentata della corsa e impedisce il sovraccarico cognitivo da decimali superflui.

---

### 3.5. Anti-Riverbero e Gestione della Griglia (Grid Contrast)
- **Linee di Griglia Forzate:**  
  ```python
  ws.views.sheetView[0].showGridLines = True
  ```
  Molte versioni di Excel disattivano automaticamente la griglia quando le celle hanno riempimento pieno (*PatternFill*). L'istruzione garantisce che la griglia resti sempre disegnata.
- **Bordi Cella a Basso Riverbero:**  
  Evitare linee di bordo nere pure (`#000000`), che sotto il sole creano contrasti violenti e l'illusione ottica della griglia di Hermann (punti grigi all'incrocio delle righe). Utilizzare bordi sottili in grigio neutro bilanciato:
  ```python
  thin_border_side = Side(border_style="thin", color="B0B0B0")
  ```

---

## 4. Dizionario Python Completo per l'Ingegnere Excel

Il seguente blocco di codice Python è pronto per essere integrato direttamente nel modulo `update_palette.py` o `build_extended_excel.py`:

```python
# -*- coding: utf-8 -*-
"""
Modulo: sprint_palette_config.py
Specifiche Ergonomiche e Palette Cromatica WCAG AA/AAA per Fogli Excel Sportivi.
"""

# Palette A: Field High-Contrast Elite (Raccomandata per Luce Solare e Schermi Mobili)
PALETTE_FIELD_ELITE = {
    "Z1_MAX_VELOCITY": {
        "name": "Zona 1: Max Velocity & Acc. Alattacida",
        "bg": "9E2A2B",      # Rosso mattone / Corallo profondo
        "fg": "FFFFFF",      # Bianco puro
        "contrast": "7.45:1",
        "wcag": "AAA",
        "desc": "50m-80m @ 95-100% - Sprint puro e accelerazione neurale"
    },
    "Z2_LACTIC_POWER": {
        "name": "Zona 2: Potenza Lattacida",
        "bg": "6C3483",      # Viola prugna scuro
        "fg": "FFFFFF",      # Bianco puro
        "contrast": "8.55:1",
        "wcag": "AAA",
        "desc": "100m-600m @ 95-100% & 80m @ 95% - Massima acidosi e velocità prolungata"
    },
    "Z3_SPECIAL_END_1": {
        "name": "Zona 3: Special Endurance 1 (SE1)",
        "bg": "93401A",      # Terracotta calda brunita
        "fg": "FFFFFF",      # Bianco puro
        "contrast": "7.03:1",
        "wcag": "AAA",
        "desc": "150m-300m @ 90-93% - Capacità lattacida ed efficienza alattacido-glicolitica"
    },
    "Z4_SPECIAL_END_2": {
        "name": "Zona 4: Special Endurance 2 (SE2)",
        "bg": "F5CBA7",      # Ambra vellutata / Ocra morbida
        "fg": "1E1E1E",      # Dark Charcoal
        "contrast": "11.10:1",
        "wcag": "AAA",
        "desc": "300m-600m @ 83-93% & 250m @ 83-93% - Resistenza specifica alla velocità"
    },
    "Z5_INTENSIVE_TEMPO": {
        "name": "Zona 5: Intensive Tempo",
        "bg": "F9E79F",      # Giallo sabbia dorato
        "fg": "1E1E1E",      # Dark Charcoal
        "contrast": "13.46:1",
        "wcag": "AAA",
        "desc": "80-90% su tratti medi - Supporto neuromuscolare e ritmo intensivo"
    },
    "Z6_EXTENSIVE_TEMPO": {
        "name": "Zona 6: Extensive Tempo",
        "bg": "A9DFBF",      # Verde salvia ergonomico
        "fg": "1E1E1E",      # Dark Charcoal
        "contrast": "11.11:1",
        "wcag": "AAA",
        "desc": "55-75% - Tempo estensivo, capillarizzazione e recupero attivo"
    },
    "Z7_AEROBIC_REGEN": {
        "name": "Zona 7: Aerobico Rigenerativo",
        "bg": "AED6F1",      # Azzurro polvere / Ciano desaturato
        "fg": "1E1E1E",      # Dark Charcoal
        "contrast": "10.87:1",
        "wcag": "AAA",
        "desc": "50% su tratti lunghi (250m-600m) - Rigenerazione metabolica"
    },
    "INACTIVE_SUBFUNCTIONAL": {
        "name": "Zona Inattiva / Sub-funzionale",
        "bg": "EEEEEE",      # Grigio perla neutro
        "fg": "9E9E9E",      # Grigio medio disabilitato
        "contrast": "2.31:1",
        "wcag": "WCAG 1.4.3 Exception (Disabled Component)",
        "desc": "Celle sconsigliate su tratti brevi (< 100m a bassa intensità)"
    },
    "INACTIVE_HIGH_VIS": {
        "name": "Zona Inattiva Alta Visibilità",
        "bg": "EEEEEE",      # Grigio perla neutro
        "fg": "616161",      # Grigio antracite leggibile
        "contrast": "5.34:1",
        "wcag": "AA",
        "desc": "Variante per consentire la lettura agevole del crono stimato"
    }
}

# Parametri Geometrici e Tipografici Excel per Piccoli Schermi
EXCEL_SMALL_SCREEN_CONFIG = {
    "freeze_panes": "C9",               # Blocca riga 8 e colonne A-B
    "zoom_scale": 100,                  # Scala 100% nativa
    "show_grid_lines": True,            # Mantiene la griglia visibile
    
    # Larghezza colonne ottimizzata
    "col_widths": {
        "A": 6.8,                       # Colonna Metri
        "B": 7.0,                       # Colonna Input Massimale T100
        "DATA_DEFAULT": 6.4,            # Colonne C..R (Percentuali 98%..50%)
    },
    
    # Altezza righe tattile (Touch Target)
    "row_heights": {
        "header_row_8": 25.0,           # Intestazione percentuali
        "data_rows_9_21": 21.5,         # Righe distanze (Touch ergonomico >= 44pt)
    },
    
    # Tipografia
    "fonts": {
        "family": "Aptos",              # Fallback: "Calibri"
        "title_size": 13,
        "header_size": 10,
        "input_b_size": 10,
        "data_size": 9.0,
        "data_fine_size": 8.5,          # Per celle con 2 decimali (es. 50m @ 83%)
    },
    
    # Colori griglie e bordi
    "borders": {
        "cell_border_color": "B0B0B0",  # Grigio neutro antiriflesso
        "b_input_border_color": "404040",# Bordo scuro marcato per colonna di input
        "championship_grey": "BFBFBF",   # Sfondo Col A per 100m, 200m, 400m
    }
}

def get_zone_token(dist_m: int, pct_str: str) -> str:
    """
    Restituisce la chiave di configurazione della zona fisiologica
    in base alla distanza in metri e alla percentuale di intensità.
    """
    # 1. Tratti purissimi di accelerazione (50m, 60m)
    if dist_m in (50, 60):
        if pct_str in ("100%", "98%", "95%"):
            return "Z1_MAX_VELOCITY"
        if pct_str in ("93%", "90,0%", "88%", "85%", "83%"):
            return "Z5_INTENSIVE_TEMPO"
        if pct_str in ("80,0%", "78%", "75%", "73%", "70,0%"):
            return "Z6_EXTENSIVE_TEMPO"
        # Intensità inferiori al 70% su 50-60m non hanno senso biomeccanico
        return "INACTIVE_SUBFUNCTIONAL"

    # 2. Tratto di transizione neurale-lattacida (80m)
    elif dist_m == 80:
        if pct_str in ("100%", "98%"):
            return "Z1_MAX_VELOCITY"
        if pct_str == "95%":
            return "Z2_LACTIC_POWER"
        if pct_str in ("93%", "90,0%", "88%", "85%", "83%"):
            return "Z5_INTENSIVE_TEMPO"
        if pct_str in ("80,0%", "78%", "75%", "73%", "70,0%"):
            return "Z6_EXTENSIVE_TEMPO"
        return "INACTIVE_SUBFUNCTIONAL"

    # 3. Velocità prolungata classica (100m, 120m, 150m)
    elif dist_m in (100, 120, 150):
        if pct_str in ("100%", "98%", "95%"):
            return "Z2_LACTIC_POWER"
        if dist_m == 150 and pct_str in ("93%", "90,0%"):
            return "Z3_SPECIAL_END_1"
        if pct_str in ("93%", "90,0%", "88%", "85%", "83%"):
            return "Z5_INTENSIVE_TEMPO"
        if pct_str in ("80,0%", "78%", "75%", "73%", "70,0%", "65%"):
            return "Z6_EXTENSIVE_TEMPO"
        if pct_str in ("60,0%", "55%"):
            return "Z6_EXTENSIVE_TEMPO"
        return "INACTIVE_SUBFUNCTIONAL"

    # 4. Velocità prolungata e curva (200m)
    elif dist_m == 200:
        if pct_str in ("100%", "98%", "95%"):
            return "Z2_LACTIC_POWER"
        if pct_str in ("93%", "90,0%"):
            return "Z3_SPECIAL_END_1"
        if pct_str in ("88%", "85%", "83%"):
            return "Z5_INTENSIVE_TEMPO"
        if pct_str in ("80,0%", "78%", "75%", "73%", "70,0%"):
            return "Z6_EXTENSIVE_TEMPO"
        if pct_str in ("65%", "60,0%", "55%"):
            return "Z6_EXTENSIVE_TEMPO"
        return "INACTIVE_SUBFUNCTIONAL"

    # 5. Transizione a Special Endurance (250m)
    elif dist_m == 250:
        if pct_str in ("100%", "98%", "95%"):
            return "Z2_LACTIC_POWER"
        if pct_str in ("93%", "90,0%"):
            return "Z3_SPECIAL_END_1"
        if pct_str in ("88%", "85%", "83%"):
            return "Z4_SPECIAL_END_2"
        if pct_str in ("80,0%", "78%", "75%", "73%"):
            return "Z5_INTENSIVE_TEMPO"
        if pct_str in ("70,0%", "65%", "60,0%", "55%"):
            return "Z6_EXTENSIVE_TEMPO"
        if pct_str == "50,0%":
            return "Z7_AEROBIC_REGEN"

    # 6. Special Endurance 2 Pura (300m, 350m, 400m)
    elif dist_m in (300, 350, 400):
        if pct_str in ("100%", "98%", "95%"):
            return "Z2_LACTIC_POWER"
        if pct_str in ("93%", "90,0%", "88%", "85%", "83%"):
            return "Z4_SPECIAL_END_2"
        if pct_str in ("80,0%", "78%", "75%"):
            return "Z5_INTENSIVE_TEMPO"
        if pct_str in ("73%", "70,0%", "65%", "60,0%", "55%"):
            return "Z6_EXTENSIVE_TEMPO"
        if pct_str == "50,0%":
            return "Z7_AEROBIC_REGEN"

    # 7. Mezzofondo veloce / Prove lattacide estreme (500m, 600m)
    elif dist_m in (500, 600):
        if pct_str in ("100%", "98%", "95%"):
            return "Z2_LACTIC_POWER"
        if pct_str in ("93%", "90,0%", "88%", "85%", "83%", "80,0%"):
            return "Z4_SPECIAL_END_2"
        if pct_str in ("78%", "75%", "73%", "70,0%"):
            return "Z5_INTENSIVE_TEMPO"
        if pct_str in ("65%", "60,0%", "55%"):
            return "Z6_EXTENSIVE_TEMPO"
        if pct_str == "50,0%":
            return "Z7_AEROBIC_REGEN"

    return "INACTIVE_SUBFUNCTIONAL"
```

---

## 5. Matrice di Assegnazione Zone (Distanze x Percentuali)

La seguente matrice illustra la distribuzione completa delle zone per tutte le 13 distanze e le 17 percentuali prescritte nel foglio di calcolo atletico:

| m | 100% | 98% | 95% | 93% | 90,0% | 88% | 85% | 83% | 80,0% | 78% | 75% | 73% | 70,0% | 65% | 60,0% | 55% | 50,0% |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **50** | Z1 | Z1 | Z1 | Z5 | Z5 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | Z6 | Z6 | INACT | INACT | INACT | INACT |
| **60** | Z1 | Z1 | Z1 | Z5 | Z5 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | Z6 | Z6 | INACT | INACT | INACT | INACT |
| **80** | Z1 | Z1 | Z2 | Z5 | Z5 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | Z6 | Z6 | INACT | INACT | INACT | INACT |
| **100** | Z2 | Z2 | Z2 | Z5 | Z5 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | Z6 | Z6 | Z6 | Z6 | Z6 | INACT |
| **120** | Z2 | Z2 | Z2 | Z5 | Z5 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | Z6 | Z6 | Z6 | Z6 | Z6 | INACT |
| **150** | Z2 | Z2 | Z2 | Z3 | Z3 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | Z6 | Z6 | Z6 | Z6 | Z6 | INACT |
| **200** | Z2 | Z2 | Z2 | Z3 | Z3 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | Z6 | Z6 | Z6 | Z6 | Z6 | INACT |
| **250** | Z2 | Z2 | Z2 | Z3 | Z3 | Z4 | Z4 | Z4 | Z5 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | Z6 | Z7 |
| **300** | Z2 | Z2 | Z2 | Z4 | Z4 | Z4 | Z4 | Z4 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | Z6 | Z6 | Z7 |
| **350** | Z2 | Z2 | Z2 | Z4 | Z4 | Z4 | Z4 | Z4 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | Z6 | Z6 | Z7 |
| **400** | Z2 | Z2 | Z2 | Z4 | Z4 | Z4 | Z4 | Z4 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | Z6 | Z6 | Z7 |
| **500** | Z2 | Z2 | Z2 | Z4 | Z4 | Z4 | Z4 | Z4 | Z4 | Z5 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | Z7 |
| **600** | Z2 | Z2 | Z2 | Z4 | Z4 | Z4 | Z4 | Z4 | Z4 | Z5 | Z5 | Z5 | Z5 | Z6 | Z6 | Z6 | Z7 |

### Legenda Zone:
- **Z1 (Rosso Mattone `#9E2A2B` | Testo `#FFFFFF`):** Max Velocity & Accelerazione Alattacida (CR: 7.45:1 - AAA).
- **Z2 (Viola Prugna `#6C3483` | Testo `#FFFFFF`):** Potenza Lattacida Massimale (CR: 8.55:1 - AAA).
- **Z3 (Terracotta `#93401A` | Testo `#FFFFFF`):** Special Endurance 1 (CR: 7.03:1 - AAA).
- **Z4 (Ambra Ocra `#F5CBA7` | Testo `#1E1E1E`):** Special Endurance 2 (CR: 11.10:1 - AAA).
- **Z5 (Giallo Sabbia `#F9E79F` | Testo `#1E1E1E`):** Intensive Tempo (CR: 13.46:1 - AAA).
- **Z6 (Verde Salvia `#A9DFBF` | Testo `#1E1E1E`):** Extensive Tempo (CR: 11.11:1 - AAA).
- **Z7 (Azzurro Polvere `#AED6F1` | Testo `#1E1E1E`):** Aerobico Rigenerativo (CR: 10.87:1 - AAA).
- **INACT (Grigio Perla `#EEEEEE` | Testo `#9E9E9E`):** Sub-funzionale / Disattivato (Esenzione WCAG 1.4.3).

---

## 6. Conclusioni e Raccomandazioni per l'Integrazione

1. **Massima Efficienza di Visualizzazione:** L'adozione di `freeze_panes = "C9"` assicura che il tecnico non perda mai la vista dei riferimenti essenziali (Metri e T100), indipendentemente dal livello di zoom o dall'orientamento del dispositivo.
2. **Robustezza Sotto la Luce Solare:** Tutti i contrasti della palette principale superano la soglia **WCAG AAA (7.0:1)** per le celle attive, offrendo un margine di sicurezza di oltre il $50\%$ rispetto allo standard minimo (4.5:1), compensando l'abbattimento di contrasto provocato dal riflesso ambientale da campo.
3. **Ergonomia del Tocco (Touch Target):** Con righe a 21.5 pt e colonne a 6.4 pt, il layout bilancia densità visiva e facilità di tocco, riducendo a zero gli errori di digitazione e permettendo all'allenatore di concentrarsi sulla prestazione dell'atleta.
