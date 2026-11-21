# -*- coding: utf-8 -*-
"""
Builder del file Excel definitivo con:
1. Palette cromatica ergonomica WCAG AAA ("Field High-Contrast Elite").
2. Matrice di suddivisione fisiologica bidimensionale V2 (Nomenclatura invertita Z7 -> Z1 + OFF).
3. Ottimizzazioni per schermi piccoli / dispositivi mobili:
   - Freeze Panes su 'C9' (blocco bidirezionale intestazioni e massimale A-B).
   - Larghezza colonne ottimizzata (6.4 per C..R) per visualizzare 11-12 colonne su smartphone.
   - Altezza righe tattile (21.5 pt) per schermi touch.
   - Griglia visibile anti-riverbero.
4. Formule Excel vive: =$B{riga}/C$8 su tutte le celle C..R.
5. Foglio dedicato "Legenda e Guida Mobile" con gerarchia Z7 (Max Velocità) -> Z1 (Rigenerazione).
"""

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import csv
import os

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
        ("350", 49.5), # Calibrated
        ("400", 58.8), # Exact from Photo 3
        ("500", 78.0), # Calibrated
        ("600", 98.5), # Calibrated
    ]
}

PALETTE_FIELD_ELITE = {
    "Z7": {
        "name": "Velocità Massima & Accel. Alattacida",
        "system": "ATP-PCr puro, fibre rapide IIx (<= 8s)",
        "bg_hex": "9E2A2B",   # Rosso mattone / corallo profondo
        "font_hex": "FFFFFF", # Bianco puro (Contrasto 7.45:1 AAA)
        "bold": True,
    },
    "Z6": {
        "name": "Potenza Lattacida & Speed Endurance",
        "system": "Glicolisi max / VLamax (8 - 18s)",
        "bg_hex": "6C3483",   # Viola prugna nobile
        "font_hex": "FFFFFF", # Bianco puro (Contrasto 8.55:1 AAA)
        "bold": False,
    },
    "Z5": {
        "name": "Special Endurance 1 (SE1)",
        "system": "Capacità lattacida, acidosi max (18 - 40s)",
        "bg_hex": "93401A",   # Terracotta calda brunita
        "font_hex": "FFFFFF", # Bianco puro (Contrasto 7.03:1 AAA)
        "bold": False,
    },
    "Z4": {
        "name": "Special Endurance 2 (SE2)",
        "system": "Misto lattacido-aerobico severo (40 - 90s)",
        "bg_hex": "F5CBA7",   # Ambra vellutata / ocra morbida
        "font_hex": "1E1E1E", # Dark charcoal (Contrasto 11.10:1 AAA)
        "bold": False,
    },
    "Z3": {
        "name": "Intensive Tempo (Vittori / Hart)",
        "system": "Glicolisi controllata 4-8 mM (13 - 70s)",
        "bg_hex": "F9E79F",   # Giallo sabbia dorato
        "font_hex": "1E1E1E", # Dark charcoal (Contrasto 13.46:1 AAA)
        "bold": False,
    },
    "Z2": {
        "name": "Extensive Tempo & Capillarizzazione",
        "system": "Ossidativo sub-LT2, recupero attivo (14 - 140s)",
        "bg_hex": "A9DFBF",   # Verde salvia rilassante
        "font_hex": "1E1E1E", # Dark charcoal (Contrasto 11.11:1 AAA)
        "bold": False,
    },
    "Z1": {
        "name": "Rigenerazione Aerobica Prolungata",
        "system": "Ossidativo puro sub-LT1 (28 - 180s)",
        "bg_hex": "AED6F1",   # Azzurro polvere
        "font_hex": "1E1E1E", # Dark charcoal (Contrasto 10.87:1 AAA)
        "bold": False,
    },
    "OFF": {
        "name": "Zona Inattiva / Sub-Funzionale",
        "system": "Non raccomandata: altera la stiffness del piede",
        "bg_hex": "EEEEEE",   # Grigio perla neutro
        "font_hex": "616161", # Grigio medio leggibile (Contrasto 5.34:1 AA)
        "bold": False,
    },
}

# Mapping retrocompatibile con ID lunghi
PALETTE_FIELD_ELITE["Z7_MAX_VELOCITY"] = PALETTE_FIELD_ELITE["Z7"]
PALETTE_FIELD_ELITE["Z6_LACTIC_POWER"] = PALETTE_FIELD_ELITE["Z6"]
PALETTE_FIELD_ELITE["Z5_SPECIAL_END_1"] = PALETTE_FIELD_ELITE["Z5"]
PALETTE_FIELD_ELITE["Z4_SPECIAL_END_2"] = PALETTE_FIELD_ELITE["Z4"]
PALETTE_FIELD_ELITE["Z3_INTENSIVE_TEMPO"] = PALETTE_FIELD_ELITE["Z3"]
PALETTE_FIELD_ELITE["Z2_EXTENSIVE_TEMPO"] = PALETTE_FIELD_ELITE["Z2"]
PALETTE_FIELD_ELITE["Z1_AEROBIC_RECOVERY"] = PALETTE_FIELD_ELITE["Z1"]
PALETTE_FIELD_ELITE["Z_INACTIVE"] = PALETTE_FIELD_ELITE["OFF"]

def load_zone_matrix():
    matrix = {}
    csv_path = "sidequests/sprint-ritmi-excel/output/palette_zone_fisiologiche_v2.csv"
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f, delimiter=";")
        header = next(reader)
        pct_names = header[1:]
        for row in reader:
            dist_str = row[0]
            matrix[dist_str] = {}
            for col_idx, pct_name in enumerate(pct_names):
                matrix[dist_str][pct_name] = row[col_idx + 1]
    return matrix

def build_ergonomic_workbook():
    zone_matrix = load_zone_matrix()
    wb = openpyxl.Workbook()
    wb.remove(wb.active) # Remove default sheet
    
    # Styles
    font_header = Font(name="Calibri", size=10, bold=False, color="1E1E1E")
    font_header_bold = Font(name="Calibri", size=10, bold=True, color="1E1E1E")
    font_dist = Font(name="Calibri", size=9, bold=True, color="1E1E1E")
    
    align_center = Alignment(horizontal="center", vertical="center")
    align_left = Alignment(horizontal="left", vertical="center")
    
    border_thin_side = Side(border_style="thin", color="B0B0B0")
    thin_border = Border(left=border_thin_side, right=border_thin_side, top=border_thin_side, bottom=border_thin_side)
    
    border_header_bottom = Side(border_style="medium", color="707070")
    header_border = Border(left=border_thin_side, right=border_thin_side, top=border_thin_side, bottom=border_header_bottom)
    
    border_b_side = Side(border_style="medium", color="303030")
    b_input_border = Border(left=border_b_side, right=border_b_side, top=border_thin_side, bottom=border_thin_side)
    
    fill_header = PatternFill(start_color="F2F4F4", end_color="F2F4F4", fill_type="solid")
    fill_grey_dist = PatternFill(start_color="D6DBDF", end_color="D6DBDF", fill_type="solid") # Official championship distances (100, 200, 400)
    fill_white = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")
    
    for athlete_name, athlete_rows in ATHLETE_DATA_EXTENDED.items():
        ws = wb.create_sheet(title=athlete_name)
        
        # 1. Excel Small Screen & Grid Configuration
        ws.views.sheetView[0].showGridLines = True
        ws.views.sheetView[0].zoomScale = 100
        # FREEZE PANES BIDIREZIONALE: blocca riga 8 (intestazioni) e colonne A-B (distanza e massimale)
        ws.freeze_panes = "C9"
        
        # Row 8: Header
        ws.row_dimensions[8].height = 25.0
        
        cell_a8 = ws.cell(row=8, column=1, value="m")
        cell_a8.font = font_header_bold
        cell_a8.alignment = align_center
        cell_a8.border = header_border
        cell_a8.fill = fill_header
        
        for c_idx, (p_name, p_val, p_fmt) in enumerate(PERCENTAGES, start=2):
            cell = ws.cell(row=8, column=c_idx, value=p_val)
            cell.font = font_header_bold if c_idx == 2 else font_header
            cell.alignment = align_center
            cell.border = header_border
            cell.number_format = p_fmt
            cell.fill = fill_header
            
        # Data rows (9 to 21)
        for offset, (dist_str, t100_val) in enumerate(athlete_rows):
            row_idx = 9 + offset
            ws.row_dimensions[row_idx].height = 21.5 # Tattile touch target
            
            # Col A: Distanza
            cell_a = ws.cell(row=row_idx, column=1, value=int(dist_str))
            cell_a.font = font_dist
            cell_a.alignment = align_center
            cell_a.border = thin_border
            if dist_str in ["100", "200", "400"]:
                cell_a.fill = fill_grey_dist
            else:
                cell_a.fill = fill_white
                
            # Col B: Massimale T100 (Input manuale evidenziato)
            cell_b = ws.cell(row=row_idx, column=2, value=t100_val)
            z_id_100 = zone_matrix[dist_str]["100%"]
            cfg_100 = PALETTE_FIELD_ELITE[z_id_100]
            cell_b.font = Font(name="Calibri", size=9, bold=True, color=cfg_100["font_hex"])
            cell_b.alignment = align_center
            cell_b.border = b_input_border
            cell_b.number_format = "0.0"
            cell_b.fill = PatternFill(start_color=cfg_100["bg_hex"], end_color=cfg_100["bg_hex"], fill_type="solid")
            
            # Colonne C..R: Formule Vive =$B{riga}/C$8 con mappatura 2D WCAG AAA
            for col_idx, (p_name, p_val, p_fmt) in enumerate(PERCENTAGES[1:], start=3):
                col_letter = get_column_letter(col_idx)
                formula_str = f"=$B{row_idx}/{col_letter}$8"
                cell_der = ws.cell(row=row_idx, column=col_idx, value=formula_str)
                
                z_id = zone_matrix[dist_str][p_name]
                cfg = PALETTE_FIELD_ELITE[z_id]
                
                cell_der.font = Font(name="Calibri", size=9, bold=cfg["bold"], color=cfg["font_hex"])
                cell_der.alignment = align_center
                cell_der.border = thin_border
                cell_der.fill = PatternFill(start_color=cfg["bg_hex"], end_color=cfg["bg_hex"], fill_type="solid")
                
                # Number format: 0.00 for 50m @ 83%, 0.0 for others
                if dist_str == "50" and p_name == "83%":
                    cell_der.number_format = "0.00"
                else:
                    cell_der.number_format = "0.0"

        # Larghezza Colonne Ottimizzata per Display Mobili
        ws.column_dimensions["A"].width = 6.8
        ws.column_dimensions["B"].width = 7.2
        for col_idx in range(3, 19):
            ws.column_dimensions[get_column_letter(col_idx)].width = 6.4

    # Foglio 4: Legenda Ergonomica e Guida Mobile
    ws_notes = wb.create_sheet(title="Legenda e Guida Mobile")
    ws_notes.views.sheetView[0].showGridLines = True
    
    font_title = Font(name="Calibri", size=13, bold=True, color="1F497D")
    font_sec = Font(name="Calibri", size=11, bold=True, color="1E1E1E")
    font_body = Font(name="Calibri", size=9.5, color="333333")
    
    ws_notes["A1"] = "GUIDA OPERATIVA & LEGENDA ERGONOMICA WCAG AAA DELLE ZONE DI ALLENAMENTO"
    ws_notes["A1"].font = font_title
    
    # Tabella Legenda Zone Visiva (Gerarchia Decrescente: Z7 Top -> Z1 Min + OFF)
    ws_notes["A3"] = "Zona"
    ws_notes["B3"] = "Nome della Zona"
    ws_notes["C3"] = "Sistema Energetico & Finestra Temporale"
    ws_notes["D3"] = "Contrasto WCAG"
    ws_notes["E3"] = "Distanze & Percentuali Tipiche"
    
    for c in ["A3", "B3", "C3", "D3", "E3"]:
        ws_notes[c].font = font_header_bold
        ws_notes[c].fill = fill_header
        ws_notes[c].border = header_border
        ws_notes[c].alignment = align_left if c != "A3" and c != "D3" else align_center
        
    zone_order = [
        ("Z7", "Z7", "7.45:1 (AAA)", "50m, 60m, 80m @ 95-100%"),
        ("Z6", "Z6", "8.55:1 (AAA)", "100m-150m @ 95-100%, 50m-80m @ 90-93%"),
        ("Z5", "Z5", "7.03:1 (AAA)", "150m-300m @ 90-98%, 100m-120m @ 88-93%"),
        ("Z4", "Z4", "11.10:1 (AAA)", "300m-600m @ 85-98%"),
        ("Z3", "Z3", "13.46:1 (AAA)", "50m-250m @ 78-88%, 300m-600m @ 75-83%"),
        ("Z2", "Z2", "11.11:1 (AAA)", "50m-600m @ 65-75% (50m-120m @ 70-75%)"),
        ("Z1", "Z1", "10.87:1 (AAA)", "150m-600m @ 50-60%"),
        ("OFF", "OFF", "5.34:1 (AA)", "50m-120m @ <= 65% (Disattivata)"),
    ]
    
    for idx, (zid, short_code, contrast_val, dist_desc) in enumerate(zone_order, start=4):
        cfg = PALETTE_FIELD_ELITE[zid]
        ws_notes.row_dimensions[idx].height = 22.0
        
        # Col A: Campione Colore Reale
        cA = ws_notes[f"A{idx}"]
        cA.value = short_code
        cA.font = Font(name="Calibri", size=9, bold=True, color=cfg["font_hex"])
        cA.fill = PatternFill(start_color=cfg["bg_hex"], end_color=cfg["bg_hex"], fill_type="solid")
        cA.alignment = align_center
        cA.border = thin_border
        
        # Col B: Nome
        cB = ws_notes[f"B{idx}"]
        cB.value = cfg["name"]
        cB.font = Font(name="Calibri", size=9.5, bold=True, color="1E1E1E")
        cB.alignment = align_left
        cB.border = thin_border
        
        # Col C: Sistema
        cC = ws_notes[f"C{idx}"]
        cC.value = cfg["system"]
        cC.font = font_body
        cC.alignment = align_left
        cC.border = thin_border
        
        # Col D: Contrasto
        cD = ws_notes[f"D{idx}"]
        cD.value = contrast_val
        cD.font = font_body
        cD.alignment = align_center
        cD.border = thin_border
        
        # Col E: Distanze
        cE = ws_notes[f"E{idx}"]
        cE.value = dist_desc
        cE.font = font_body
        cE.alignment = align_left
        cE.border = thin_border
        
    ws_notes.column_dimensions["A"].width = 8.0
    ws_notes.column_dimensions["B"].width = 38.0
    ws_notes.column_dimensions["C"].width = 46.0
    ws_notes.column_dimensions["D"].width = 16.0
    ws_notes.column_dimensions["E"].width = 46.0
    
    # Note di Campo e Funzionalità Mobile con Nomenclatura Z7->Z1 e Correzione Submassimali
    notes_text = [
        ("FUNZIONALITÀ SMART PER PICCOLI SCHERMI (MOBILE & TABLET)",
         "1. Blocco Riquadri Bidirezionale (Freeze Panes 'C9'): quando scorri a destra verso le percentuali estensive, "
         "la colonna della distanza (A) e la colonna del massimale 100% (B) restano sempre visibili sul lato sinistro dello schermo.\n"
         "2. Quando scorri verso il basso verso i 600m, l'intestazione delle percentuali (riga 8) resta sempre visibile in alto.\n"
         "3. Touch Targets (Altezza 21.5 pt): righe più alte per evitare tocchi accidentali con dita sudate o guanti in pista.\n"
         "4. Larghezza Colonne Compatta (6.4): permette di vedere fino a 11-12 colonne simultaneamente su smartphone senza dover continuamente scorrere."),
        
        ("STRUTTURA DIDATTICA E GERARCHIA DELLE ZONE (Z7 TOP -> Z1 BASE)",
         "- Z7 (Rosso Mattone): Massima Velocità ed Accelerazione Alattacida (50-80m @ 95-100%, t <= 8s, ATP-PCr puro, fibre rapide IIx).\n"
         "- Z6 (Viola Prugna): Potenza Lattacida & Speed Endurance (100-150m @ 95-100%, 50-80m @ 90-93%, VLamax, glicolisi rapida).\n"
         "- Z5 (Terracotta): Special Endurance 1 - SE1 (150-300m @ 90-98%, 100-120m @ 88-93%, acidosi max, capacità lattacida 18-40s).\n"
         "- Z4 (Ambra Chiaro): Special Endurance 2 - SE2 (300-600m @ 85-98%, resistenza alla velocità prolungata, misto severo 40-90s).\n"
         "- Z3 (Giallo Sabbia): Intensive Tempo (50-250m @ 78-88%, 300-600m @ 75-83%, decontrazione neurale, glicolisi controllata 4-8 mM).\n"
         "- Z2 (Verde Salvia): Extensive Tempo & Capillarizzazione (50-600m @ 65-75%, recupero attivo, ossidativo sub-LT2, capillarizzazione).\n"
         "- Z1 (Azzurro Polvere): Rigenerazione Aerobica Prolungata (150-600m @ 50-60%, ossidativo puro sub-LT1, drenaggio metabolico).\n"
         "- OFF (Grigio Perla): Zona Inattiva / Sub-Funzionale (50-120m @ <= 65%, disattivata per prevenire alterazione della stiffness)."),

        ("PERCHÉ LE CELLE <= 65% SUI TRATTI BREVI SONO DISATTIVATE (ZONA OFF) E IL VALORE DI Z3 (80m @ 83%)",
         "- Sotto il 65% sui tratti brevi (50m-120m), un atleta corre a meno di 4.5-5.0 m/s (16-18 km/h). A questa andatura il tempo di contatto "
         "raddoppia (Tc > 0.16s), l'appoggio rulla sul tallone e si distrugge la stiffness reattiva senza ottenere alcuno stimolo aerobico "
         "(che richiede sforzi continui prolungati o ripetute estese >= 200m). Tali celle sono desaturate in grigio (OFF).\n"
         "- Al contrario, le prove submassimali al 78-88% sui 50-100m (incluso l'80m all'83%, che per un velocista da 10.8s corrisponde a 27.2 km/h "
         "e Tc ~ 0.115s) appartengono a pieno titolo alla ZONA 3 (Intensive Tempo): mantengono il Fast SSC, educano alla decontrazione muscolare "
         "senza co-contrazioni antagoniste parassite (metodo Carlo Vittori e Dan Pfaff) e stimolano la capacità lattacida controllata (4-8 mM)."),
          
        ("LINEE GUIDA SCIENTIFICHE D'USO SUL CAMPO",
         "- Regola di Stop del 3% (SNC Fatigue Cutoff): nelle sedute di velocità pura e potenza lattacida (Z7/Z6), interrompere la serie "
         "non appena il crono registrato sale di oltre il 3% rispetto al target (es. da 10.80s a oltre 11.12s), per evitare fatica neurale parassita.\n"
         "- Flying Start su Z3: per prove tecniche di ritmo su 50m, 60m e 80m al 78-88% (Z3), adottare un avvio lanciato di 10-15m per evitare che "
         "la fase di accelerazione statica iniziale alteri la velocità di crociera e la biomeccanica front-side.\n"
         "- Autoregolazione dinamica: modificando un massimale in Colonna B, tutte le 16 percentuali submassimali (da Z7 a Z1) si ricalcolano istantaneamente.")
    ]
    
    r_idx = 14
    for title, desc in notes_text:
        ws_notes[f"A{r_idx}"] = title
        ws_notes[f"A{r_idx}"].font = font_sec
        ws_notes[f"A{r_idx+1}"] = desc
        ws_notes[f"A{r_idx+1}"].font = font_body
        ws_notes[f"A{r_idx+1}"].alignment = Alignment(wrap_text=True)
        lines_count = desc.count("\n") + len(desc) // 100 + 1
        ws_notes.row_dimensions[r_idx+1].height = max(lines_count * 18, 36)
        r_idx += 3

    out_file = "sidequests/sprint-ritmi-excel/output/ritmi_atleti.xlsx"
    wb.save(out_file)
    print(f"Workbook ergonomico v2 salvato con successo in: {out_file}")

if __name__ == "__main__":
    build_ergonomic_workbook()
