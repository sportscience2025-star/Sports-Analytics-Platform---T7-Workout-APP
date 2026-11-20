import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

wb = openpyxl.Workbook()

# Stili generali
font_title = Font(name="Calibri", size=14, bold=True, color="1F497D")
font_section = Font(name="Calibri", size=11, bold=True, color="000000")
font_header = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
font_data = Font(name="Calibri", size=10, bold=False)
font_bold = Font(name="Calibri", size=10, bold=True)
font_formula = Font(name="Calibri", size=10, bold=True, color="002060")

fill_header = PatternFill(start_color="1F497D", end_color="1F497D", fill_type="solid")
fill_subhdr = PatternFill(start_color="DCE6F1", end_color="DCE6F1", fill_type="solid")
fill_excel = PatternFill(start_color="E2EFDA", end_color="E2EFDA", fill_type="solid") # Verde tenue
fill_mecc = PatternFill(start_color="FFF2CC", end_color="FFF2CC", fill_type="solid")  # Giallo tenue
fill_linear = PatternFill(start_color="FCE4D6", end_color="FCE4D6", fill_type="solid") # Rosso/Arancio tenue

thin_border = Border(
    left=Side(style='thin', color='BFBFBF'),
    right=Side(style='thin', color='BFBFBF'),
    top=Side(style='thin', color='BFBFBF'),
    bottom=Side(style='thin', color='BFBFBF')
)

align_center = Alignment(horizontal="center", vertical="center")
align_left = Alignment(horizontal="left", vertical="center")
align_right = Alignment(horizontal="right", vertical="center")

# -------------------------------------------------------------
# FOGLIO 1: Confronto Modelli Numerici
# -------------------------------------------------------------
ws1 = wb.active
ws1.title = "Confronto Modelli"
ws1.views.sheetView[0].showGridLines = True

ws1["A1"] = "CONFRONTO DEI MODELLI DI PRESCRIZIONE DEI RITMI DI SPRINT"
ws1["A1"].font = font_title
ws1["A2"] = "Simulazione numerica: Modello Iperbolico Excel (T100/p) vs Modello Meccanico (tau) vs Modello Lineare (2-p)"
ws1["A2"].font = Font(name="Calibri", size=10, italic=True, color="595959")

# Parametri Atleta Tipo
ws1["A4"] = "PARAMETRI ATLETA GUIDA (Livello Regionale / Nazionale Avanzato)"
ws1["A4"].font = font_section

params = [
    ("Massimale 100m (T100)", 11.00, "s", "B5"),
    ("Massimale 200m (T100)", 23.50, "s", "B6"),
    ("Massimale 300m (T100)", 40.50, "s", "B7"),
    ("Costante di accelerazione tau stimata", 1.25, "s", "B8"),
]

for idx, (label, val, unit, cell_ref) in enumerate(params, start=5):
    ws1[f"A{idx}"] = label
    ws1[f"A{idx}"].font = font_bold
    ws1[f"B{idx}"] = val
    ws1[f"B{idx}"].font = font_formula
    ws1[f"B{idx}"].number_format = "0.00"
    ws1[f"C{idx}"] = unit
    ws1[f"C{idx}"].font = font_data

# Tabella 100 Metri
start_row = 10
ws1[f"A{start_row}"] = "DISTANZA: 100 METRI (T100 = 11,00 s | vMax = 10,26 m/s)"
ws1[f"A{start_row}"].font = font_section

headers = [
    "Intensità (p)", "Percentuale", "Tempo Excel (T100/p)", 
    "Modello Meccanico (tau)", "Modello Lineare (2-p)", 
    "Delta Meccanico (s)", "Delta Lineare (s)", "Valutazione Fisiologica e Pratica"
]

for col_idx, h in enumerate(headers, start=1):
    cell = ws1.cell(row=start_row+1, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = align_center

percentages = [
    (1.00, "100,0%"), (0.98, "98,0%"), (0.95, "95,0%"), (0.93, "93,0%"),
    (0.90, "90,0%"), (0.85, "85,0%"), (0.80, "80,0%"), (0.75, "75,0%"),
    (0.70, "70,0%"), (0.60, "60,0%"), (0.50, "50,0%")
]

row_curr = start_row + 2
for p_val, p_str in percentages:
    ws1.cell(row=row_curr, column=1, value=p_val).number_format = "0.00"
    ws1.cell(row=row_curr, column=2, value=p_str)
    
    # Formule Excel Vive
    c_excel = ws1.cell(row=row_curr, column=3, value=f"=$B$5/A{row_curr}")
    c_excel.number_format = "0.00"
    c_excel.font = font_formula
    c_excel.fill = fill_excel
    
    # Modello Meccanico: d / (p * vMax) + tau * (1 - p) approssimato o analitico
    # vMax_100 = 100 / (11.0 - 1.25) = 10.256 m/s
    c_mecc = ws1.cell(row=row_curr, column=4, value=f"=ROUND((100/(A{row_curr}*(100/($B$5-$B$8))))+$B$8*(1-0.2*(1-A{row_curr})), 2)")
    c_mecc.number_format = "0.00"
    c_mecc.fill = fill_mecc
    
    # Modello Lineare
    c_lin = ws1.cell(row=row_curr, column=5, value=f"=$B$5*(2-A{row_curr})")
    c_lin.number_format = "0.00"
    c_lin.fill = fill_linear
    
    # Delta
    c_dmecc = ws1.cell(row=row_curr, column=6, value=f"=D{row_curr}-C{row_curr}")
    c_dmecc.number_format = "+0.00;-0.00;0.00"
    
    c_dlin = ws1.cell(row=row_curr, column=7, value=f"=E{row_curr}-C{row_curr}")
    c_dlin.number_format = "+0.00;-0.00;0.00"
    
    # Commento
    if p_val >= 0.95:
        comm = "Velocità Massimale / Special Endurance (Reclutamento IIx massimale)"
    elif p_val >= 0.85:
        comm = "Intensive Tempo / Lattacido (Attenzione alla fatica neuromuscolare)"
    elif p_val >= 0.70:
        comm = "Extensive Tempo (Rigenerazione aerobica, decontrazione muscolare)"
    else:
        comm = "Recupero Attivo / Bassa intensità estensiva"
    ws1.cell(row=row_curr, column=8, value=comm)
    
    for c_idx in range(1, 9):
        ws1.cell(row=row_curr, column=c_idx).border = thin_border
        if c_idx not in [3, 4, 5]:
            ws1.cell(row=row_curr, column=c_idx).font = font_data
        if c_idx in [1, 2, 3, 4, 5, 6, 7]:
            ws1.cell(row=row_curr, column=c_idx).alignment = align_center
            
    row_curr += 1

# Tabella 200 Metri
start_row_200 = row_curr + 2
ws1[f"A{start_row_200}"] = "DISTANZA: 200 METRI (T100 = 23,50 s | vMax = 9,80 m/s con fatica tardiva)"
ws1[f"A{start_row_200}"].font = font_section

for col_idx, h in enumerate(headers, start=1):
    cell = ws1.cell(row=start_row_200+1, column=col_idx, value=h)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = align_center

row_curr = start_row_200 + 2
for p_val, p_str in percentages:
    ws1.cell(row=row_curr, column=1, value=p_val).number_format = "0.00"
    ws1.cell(row=row_curr, column=2, value=p_str)
    
    c_excel = ws1.cell(row=row_curr, column=3, value=f"=$B$6/A{row_curr}")
    c_excel.number_format = "0.00"
    c_excel.font = font_formula
    c_excel.fill = fill_excel
    
    c_mecc = ws1.cell(row=row_curr, column=4, value=f"=ROUND((200/(A{row_curr}*(200/($B$6-$B$8))))+$B$8*(1-0.15*(1-A{row_curr})), 2)")
    c_mecc.number_format = "0.00"
    c_mecc.fill = fill_mecc
    
    c_lin = ws1.cell(row=row_curr, column=5, value=f"=$B$6*(2-A{row_curr})")
    c_lin.number_format = "0.00"
    c_lin.fill = fill_linear
    
    c_dmecc = ws1.cell(row=row_curr, column=6, value=f"=D{row_curr}-C{row_curr}")
    c_dmecc.number_format = "+0.00;-0.00;0.00"
    
    c_dlin = ws1.cell(row=row_curr, column=7, value=f"=E{row_curr}-C{row_curr}")
    c_dlin.number_format = "+0.00;-0.00;0.00"
    
    if p_val >= 0.95:
        comm = "Velocità Prolungata Massimale (Elevatissima acidosi)"
    elif p_val >= 0.85:
        comm = "Resistenza alla Velocità / Special Endurance 1"
    elif p_val >= 0.70:
        comm = "Tempo Run Estensivo (Capillarizzazione e ritmo)"
    else:
        comm = "Lavoro di capacità aerobica generale"
    ws1.cell(row=row_curr, column=8, value=comm)
    
    for c_idx in range(1, 9):
        ws1.cell(row=row_curr, column=c_idx).border = thin_border
        if c_idx not in [3, 4, 5]:
            ws1.cell(row=row_curr, column=c_idx).font = font_data
        if c_idx in [1, 2, 3, 4, 5, 6, 7]:
            ws1.cell(row=row_curr, column=c_idx).alignment = align_center
            
    row_curr += 1

# Regola larghezza colonne ws1
for col in ws1.columns:
    max_len = max(len(str(cell.value or '')) for cell in col)
    col_letter = get_column_letter(col[0].column)
    ws1.column_dimensions[col_letter].width = max(max_len + 3, 12)

ws1.column_dimensions["H"].width = 50

# -------------------------------------------------------------
# FOGLIO 2: Matrice Metodi Sintetica
# -------------------------------------------------------------
ws2 = wb.create_sheet(title="Matrice Metodi")
ws2.views.sheetView[0].showGridLines = True

ws2["A1"] = "MATRICE COMPARATIVA DEI METODI DI PRESCRIZIONE DELLO SPRINT"
ws2["A1"].font = font_title
ws2["A2"] = "Valutazione multicriterio (Validità, Affidabilità, Requisiti Input, Fattibilità Excel, Qualità Evidenze)"
ws2["A2"].font = Font(name="Calibri", size=10, italic=True, color="595959")

matrice_data = [
    ("T100 / p (Velocità Media Iperbolica)", "T = T100 / p", "3.0/5", "4.5/5", "5.0/5 (Zero input extra)", "5.0/5 (Formula nativa)", "4.0/5", "21.5/25", "GOLD STANDARD PRATICO DI CAMPO"),
    ("Tempo Lineare Inverso", "T = T100 * (2 - p)", "1.0/5", "4.5/5", "5.0/5", "5.0/5", "1.0/5", "16.5/25", "FALSIFICATO E NON VALIDO"),
    ("Profilo Meccanico Sprint (Morin/Samozino)", "v(t) = vMax*(1 - exp(-t/tau))", "4.5/5", "4.0/5", "2.0/5 (Split o radar richiesti)", "3.0/5 (Equazioni trascendenti)", "4.5/5", "18.0/25", "IDEALE MA LOGISTICAMENTE PESANTE"),
    ("Anaerobic Speed Reserve (ASR)", "Target = MAS + p*(MSS - MAS)", "4.5/5", "4.0/5", "1.5/5 (Test VAM/MAS alieno)", "4.0/5", "2.0/5 (Non per velocisti 100m)", "16.0/25", "INAPPROPRIATO PER CENTOMETRISTI"),
    ("Critical Speed (CS) e D'", "d = CS * t + D'", "3.5/5", "3.0/5", "2.0/5 (Prove multiple a fatica)", "4.0/5", "2.5/5 (Asintoto a v=inf)", "15.0/25", "INADATTO SOTTO I 150 METRI"),
    ("Modello Power-Law (Riegel)", "T = T1 * (d/d1)^b", "3.0/5", "3.5/5", "3.0/5 (Calibrazione b)", "4.0/5", "3.0/5 (Broken power law)", "16.5/25", "UTILE PER GARE, NON PER FRAZIONATI"),
    ("Euristiche Coach (Francis, Vittori, Hart)", "Tabelle fisse + Stop Rule 3-5%", "3.5/5", "4.0/5", "4.5/5 (Cronometro da campo)", "5.0/5 (Tabelle precompilate)", "3.5/5 (Osservazionale d elite)", "20.5/25", "INTEGRAZIONE OPERATIVA RACCOMANDATA")
]

ws2_headers = ["Metodo di Prescrizione", "Formula / Algoritmo", "Validità Fisiologica", "Affidabilità Test", "Requisiti Input", "Fattibilità Excel", "Qualità Evidenze", "Punteggio /25", "Verdetto Finale"]

start_r = 4
for c_idx, h in enumerate(ws2_headers, start=1):
    c = ws2.cell(row=start_r, column=c_idx, value=h)
    c.font = font_header
    c.fill = fill_header
    c.alignment = align_center

for r_idx, row in enumerate(matrice_data, start=start_r+1):
    for c_idx, val in enumerate(row, start=1):
        cell = ws2.cell(row=r_idx, column=c_idx, value=val)
        cell.font = font_data
        cell.border = thin_border
        if c_idx in [3, 4, 5, 6, 7, 8]:
            cell.alignment = align_center
        else:
            cell.alignment = align_left
        if c_idx == 1:
            cell.font = font_bold
        if c_idx == 8:
            cell.font = font_bold
            cell.fill = fill_subhdr
        if c_idx == 9:
            cell.font = font_bold
            if "GOLD" in val or "RACCOMANDATA" in val:
                cell.fill = fill_excel
            elif "FALSIFICATO" in val or "INAPPROPRIATO" in val or "INADATTO" in val:
                cell.fill = fill_linear

for col in ws2.columns:
    max_len = max(len(str(cell.value or '')) for cell in col)
    col_letter = get_column_letter(col[0].column)
    ws2.column_dimensions[col_letter].width = max(max_len + 3, 14)

# -------------------------------------------------------------
# FOGLIO 3: Regole di Prescrizione sul Campo
# -------------------------------------------------------------
ws3 = wb.create_sheet(title="Linee Guida Prescrizione")
ws3.views.sheetView[0].showGridLines = True

ws3["A1"] = "LINEE GUIDA OPERATIVE PER L'ALLENATORE E PER IL SOFTWARE T7"
ws3["A1"].font = font_title

guidelines = [
    ("1. DISTANZE BREVI (<= 60 METRI) E PARTENZA LANCIATA",
     "Sui 50 e 60 metri la componente di accelerazione iniziale da fermo distorce fortemente la velocità media (sottostima fino al 20-30%). Per queste distanze, se si utilizzano ritmi submassimali (es. 80-90%), l'atleta NON deve partire dai blocchi o da fermo, ma con rincorsa libera lanciata di 15-20 metri (Flying Start), misurando il tempo sul solo tratto target."),
    
    ("2. REGOLA DEL DROP-OFF (INTERRUZIONE DINAMICA AL 3% - 5%)",
     "Una tabella statica non previene il sovrallenamento neuromuscolare. Nelle sedute di velocità (>90%), la serie di ripetute deve essere tassativamente interrotta non appena il tempo registrato supera del 3% il target prefissato. Studi dimostrano che oltre il 3% di perdita di velocità il lattato sale oltre 8-10 mmol/L e l'altezza del salto verticale (CMJ) crolla, provocando fatica neurale protratta per 48-72 ore."),
    
    ("3. INPUT DEL MASSIMALE: CAPACITÀ ATTUALE (CPC) E NON PB STORICO",
     "La colonna B (T100) deve contenere la Current Performance Capacity (prestazione realistica nelle ultime 2-4 settimane) e non il primato personale storico ottenuto in condizioni di vento a favore. Un errore di 0,3s sul massimale trasla tutte le andature submassimali di oltre una categoria di intensità."),
    
    ("4. POLARIZZAZIONE HIGH-LOW PER CENTOMETRISTI PURI",
     "Per i velocisti puri dei 100 metri, evitare l'accumulo eccessivo di volume nella 'zona grigia' (80-90%). Concentrare il lavoro sui giorni HIGH (>95% con recuperi ampi di 8-12 minuti) e giorni LOW (<75% estensivo con decontrazione su erba), riservando le andature intermedie (85-93%) a duecentisti e quattrocentisti per la resistenza alla velocità.")
]

r_g = 3
for title, text in guidelines:
    ws3[f"A{r_g}"] = title
    ws3[f"A{r_g}"].font = font_section
    ws3[f"A{r_g+1}"] = text
    ws3[f"A{r_g+1}"].font = font_data
    ws3[f"A{r_g+1}"].alignment = Alignment(wrap_text=True)
    ws3.row_dimensions[r_g+1].height = 45
    r_g += 3

ws3.column_dimensions["A"].width = 110

# Salvataggio
output_file = "sidequests/sprint-ritmi-excel/ricerca/prototipi/confronto_modelli.xlsx"
wb.save(output_file)
print(f"Workbook {output_file} creato con successo!")
