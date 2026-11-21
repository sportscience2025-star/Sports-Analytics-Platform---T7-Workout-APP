# -*- coding: utf-8 -*-
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from update_palette import get_zone_color, COLORS

PERCENTAGES = [
    ("100%", 1.00, "0%"),
    ("98%", 0.98, "0%"),
    ("95%", 0.95, "0%"),
    ("93%", 0.93, "0%"),
    ("90,0%", 0.90, "0.0%"),
    ("88%", 0.88, "0%"),
    ("85%", 0.85, "0%"),
    ("83%", 0.83, "0%"),
    ("80,0%", 0.80, "0.0%"),
    ("78%", 0.78, "0%"),
    ("75%", 0.75, "0%"),
    ("73%", 0.73, "0%"),
    ("70,0%", 0.70, "0.0%"),
    ("65%", 0.65, "0%"),
    ("60,0%", 0.60, "0.0%"),
    ("55%", 0.55, "0%"),
    ("50,0%", 0.50, "0.0%"),
]

# Extended athlete data (including 300, 350, 400, 500, 600m)
ATHLETE_DATA_EXTENDED = {
    "Atleta 1": [
        ("50", 5.9),
        ("60", 6.9),
        ("80", 8.8),
        ("100", 10.8),
        ("120", 13.4),
        ("150", 16.9),
        ("200", 23.1),
        ("250", 32.5),
        ("300", 38.0),
        ("350", 46.0),
        ("400", 54.0),
        ("500", 72.0),
        ("600", 91.0),
    ],
    "Atleta 2": [
        ("50", 6.0),
        ("60", 7.0),
        ("80", 9.1),
        ("100", 11.1),
        ("120", 13.6),
        ("150", 17.6),
        ("200", 23.6),
        ("250", 32.5),
        ("300", 39.5),
        ("350", 47.5),
        ("400", 56.0),
        ("500", 75.0),
        ("600", 95.0),
    ],
    "Atleta 3": [
        ("50", 0.0),
        ("60", 7.7),
        ("80", 9.8),
        ("100", 12.1),
        ("120", 15.3),
        ("150", 18.4),
        ("200", 25.0),
        ("250", 32.0),
        ("300", 40.5), # Exact from Photo 3
        ("350", 49.5), # Interpolated between 300m and 400m
        ("400", 58.8), # Exact from Photo 3
        ("500", 78.0), # Calibrated athletic progression
        ("600", 98.5), # Calibrated athletic progression
    ]
}

def create_extended_workbook():
    wb = openpyxl.Workbook()
    default_sheet = wb.active
    wb.remove(default_sheet)
    
    font_header = Font(name="Calibri", size=10, bold=False)
    font_header_bold = Font(name="Calibri", size=10, bold=True)
    font_data = Font(name="Calibri", size=9, bold=False)
    font_b_input = Font(name="Calibri", size=9, bold=True) # Manual input
    font_title = Font(name="Calibri", size=13, bold=True, color="1F497D")
    font_sec = Font(name="Calibri", size=11, bold=True, color="000000")
    
    align_center = Alignment(horizontal="center", vertical="center")
    align_left = Alignment(horizontal="left", vertical="center")
    
    thin_border_side = Side(border_style="thin", color="B0B0B0")
    thin_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
    
    header_border_side_bottom = Side(border_style="medium", color="808080")
    header_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=header_border_side_bottom)
    
    b_input_side = Side(border_style="medium", color="404040")
    b_input_border = Border(left=b_input_side, right=b_input_side, top=thin_border_side, bottom=thin_border_side)

    fill_header = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")
    fill_grey_col_a = PatternFill(start_color="BFBFBF", end_color="BFBFBF", fill_type="solid")
    fill_white = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")

    for athlete_name, rows_data in ATHLETE_DATA_EXTENDED.items():
        ws = wb.create_sheet(title=athlete_name)
        ws.views.sheetView[0].showGridLines = True
        
        # Row 8: Header
        ws.row_dimensions[8].height = 24
        
        # Cell A8: "m"
        cell_a8 = ws.cell(row=8, column=1, value="m")
        cell_a8.font = font_header_bold
        cell_a8.alignment = align_center
        cell_a8.border = header_border
        cell_a8.fill = fill_header
        
        # Columns B..R: Percentages
        for col_idx, (p_name, p_val, p_fmt) in enumerate(PERCENTAGES, start=2):
            cell = ws.cell(row=8, column=col_idx, value=p_val)
            cell.font = font_header_bold if col_idx == 2 else font_header # 100% is bold
            cell.alignment = align_center
            cell.border = header_border
            cell.number_format = p_fmt
            cell.fill = fill_header
            
        # Data rows (starting at row 9)
        for offset, (dist_str, t100_val) in enumerate(rows_data):
            row_idx = 9 + offset
            ws.row_dimensions[row_idx].height = 20
            
            # Column A: Distance
            cell_a = ws.cell(row=row_idx, column=1, value=int(dist_str))
            cell_a.font = font_data
            cell_a.alignment = align_center
            cell_a.border = thin_border
            # Grey cell on 100m, 200m, and 400m (competition championship sprint distances)
            if dist_str in ["100", "200", "400"]:
                cell_a.fill = fill_grey_col_a
            else:
                cell_a.fill = fill_white
                
            # Column B: Manual input (T100)
            cell_b = ws.cell(row=row_idx, column=2, value=t100_val)
            cell_b.font = font_b_input
            cell_b.alignment = align_center
            cell_b.border = b_input_border
            cell_b.number_format = "0.0"
            color_hex = get_zone_color(dist_str, "100%")
            cell_b.fill = PatternFill(start_color=color_hex, end_color=color_hex, fill_type="solid")
            
            # Columns C..R: Dynamic Live Formulas (T100 / p)
            for col_idx, (p_name, p_val, p_fmt) in enumerate(PERCENTAGES[1:], start=3):
                col_letter = get_column_letter(col_idx)
                formula_str = f"=$B{row_idx}/{col_letter}$8"
                cell_derived = ws.cell(row=row_idx, column=col_idx, value=formula_str)
                cell_derived.font = font_data
                cell_derived.alignment = align_center
                cell_derived.border = thin_border
                
                # Number format: 0.00 for 50m @ 83% (I9), 0.0 for all others
                if dist_str == "50" and p_name == "83%":
                    cell_derived.number_format = "0.00"
                else:
                    cell_derived.number_format = "0.0"
                    
                # Zone Color
                cz_hex = get_zone_color(dist_str, p_name)
                cell_derived.fill = PatternFill(start_color=cz_hex, end_color=cz_hex, fill_type="solid")

        # Column widths
        ws.column_dimensions["A"].width = 7.0
        for col_idx in range(2, 19):
            ws.column_dimensions[get_column_letter(col_idx)].width = 6.8

    # Sheet 4: Guida Metodologica e Istruzioni d'Uso
    ws_notes = wb.create_sheet(title="Istruzioni e Note")
    ws_notes.views.sheetView[0].showGridLines = True
    
    ws_notes["A1"] = "GUIDA OPERATIVA: TABELLE DEI RITMI ESTESE (50m - 600m)"
    ws_notes["A1"].font = font_title
    
    notes_data = [
        ("1. METODO DI CALCOLO DINAMICO (GOLD STANDARD CONFERMATO)",
         "Tutte le celle delle colonne C..R contengono formule Excel vive del tipo '=$B{riga}/C$8'. "
         "La colonna B rappresenta il tempo massimale (100%) inserito a mano. "
         "Modificando un valore in colonna B, tutte le 16 percentuali submassimali della riga si aggiornano all'istante."),
        
        ("2. ESTENSIONE ALLE NUOVE DISTANZE (300m, 350m, 400m, 500m, 600m)",
         "Le tabelle sono state estese a tutte le distanze richieste. "
         "Per l'Atleta 3, i massimali sui 300m (40,5 s) e sui 400m (58,8 s) provengono esattamente dalla foto originale. "
         "I massimali sui 350m, 500m e 600m sono stati calibrati sulla curva di decadimento di velocità e possono essere "
         "sovrascritti in qualsiasi momento dal tecnico con i tempi reali misurati in pista."),
        
        ("3. CELLE GRIGIE DI COLONNA A (100m, 200m, 400m)",
         "In conformità con lo stile originale e con la prassi atletica, le distanze di gara ufficiali (100m, 200m e 400m) "
         "hanno la cella della distanza evidenziata con sfondo grigio per un immediato orientamento visivo del tecnico."),
         
        ("4. MAPPA DEI COLORI E ZONE DI INTENSITÀ (PALETTE A 8 ZONE)",
         "- Rosso Scuro (#793B2E): Velocità pura alattacida neurale (50-80m @ 95-100%).\n"
         "- Rosso-Arancio (#B24A2D): Potenza lattacida / velocità prolungata (100-600m @ 95-100%).\n"
         "- Arancio (#ECA62D): Mantenimento della velocità / tempo intensivo (83-93%).\n"
         "- Giallo (#F4D135): Resistenza specifica alla velocità (70-80% su 50-200m; estesa a 78-93% su 250-600m).\n"
         "- Verde Chiaro (#6BAE47): Capacità sub-massimale di transizione (65-75%).\n"
         "- Verde Scuro (#386840): Tempo estensivo e rigenerazione attiva (55-65%).\n"
         "- Blu Reale (#0170BF) / Ciano (#0574BB): Andatura estensiva su 250-600m @ 50%."),
         
        ("5. RACCOMANDAZIONI DELLA RICERCA SCIENTIFICA SUL CAMPO",
         "- Partenze lanciate (Flying Start): per distanze <= 60m a ritmi submassimali (<=85%), eseguire le prove con rincorsa libera per evitare la distorsione dell'accelerazione iniziale.\n"
         "- Regola di Stop (Drop-off 3-5%): nelle sedute di velocità (>90%), interrompere la serie non appena il crono reale decade oltre il 3% del target.\n"
         "- Capacità Attuale: impostare in colonna B la prestazione attuale dell'atleta (ultime 2-4 settimane) per garantire la corretta intensità fisiologica.")
    ]
    
    r_idx = 3
    for title, text in notes_data:
        ws_notes[f"A{r_idx}"] = title
        ws_notes[f"A{r_idx}"].font = font_sec
        ws_notes[f"A{r_idx+1}"] = text
        ws_notes[f"A{r_idx+1}"].font = font_data
        ws_notes[f"A{r_idx+1}"].alignment = Alignment(wrap_text=True)
        # Dynamic row height
        lines = text.count("\n") + len(text) // 100 + 1
        ws_notes.row_dimensions[r_idx+1].height = max(lines * 18, 36)
        r_idx += 3
        
    ws_notes.column_dimensions["A"].width = 115

    out_file = "sidequests/sprint-ritmi-excel/output/ritmi_atleti.xlsx"
    wb.save(out_file)
    print(f"File esteso salvato con successo in: {out_file}")

if __name__ == "__main__":
    create_extended_workbook()
