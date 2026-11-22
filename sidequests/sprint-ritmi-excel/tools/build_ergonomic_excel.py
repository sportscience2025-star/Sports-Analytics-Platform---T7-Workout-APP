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
import math

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
        "system": "Glicolisi rapida / VLamax picco (8 - 18s)",
        "bg_hex": "6C3483",   # Viola prugna nobile
        "font_hex": "FFFFFF", # Bianco puro (Contrasto 8.55:1 AAA)
        "bold": False,
    },
    "Z5": {
        "name": "Special Endurance 1 (SE1) - Potenza & Capacità",
        "system": "Potenza Lattacida (rec. >=12-20') / Capacità (rec. 4-8') (18 - 40s)",
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
    ws_notes.merge_cells("A1:E1")
    ws_notes.row_dimensions[1].height = 28.0
    ws_notes["A1"].alignment = Alignment(vertical="center", horizontal="left")
    
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
        ("Z5", "Z5", "7.03:1 (AAA)", "150m-300m @ 90-98%, 100m-120m @ 88-93% (SE1)"),
        ("Z4", "Z4", "11.10:1 (AAA)", "300m-600m @ 85-98% (SE2)"),
        ("Z3", "Z3", "13.46:1 (AAA)", "50m-250m @ 78-88%, 300m-600m @ 75-83%"),
        ("Z2", "Z2", "11.11:1 (AAA)", "50m-600m @ 65-75% (Extensive Tempo Tecnico)"),
        ("Z1", "Z1", "10.87:1 (AAA)", "50m-600m @ 50-60% (Rigenerazione, Riscaldamento & Flush Runs)"),
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
        
    ws_notes.column_dimensions["A"].width = 8.5
    ws_notes.column_dimensions["B"].width = 38.0
    ws_notes.column_dimensions["C"].width = 52.0
    ws_notes.column_dimensions["D"].width = 16.0
    ws_notes.column_dimensions["E"].width = 50.0

    # Nuova Sezione: Tabella Matrice di Sforzo e Recupero (SEP vs SEM)
    ws_notes["A14"] = "MATRICE METODOLOGICA: SFORZO, TEMPO DI RECUPERO E SISTEMI ENERGETICI (SEP vs SEM)"
    ws_notes["A14"].font = font_title
    ws_notes.merge_cells("A14:E14")
    ws_notes.row_dimensions[14].height = 26.0
    ws_notes["A14"].alignment = Alignment(vertical="center", horizontal="left")

    rec_headers = [
        ("A16", "Zona"),
        ("B16", "Distanze Tipiche"),
        ("C16", "Intensità"),
        ("D16", "Tempo di Recupero"),
        ("E16", "Effetto Fisiologico Bersaglio & Adattamento Molecolare"),
    ]
    for cell_id, text in rec_headers:
        c = ws_notes[cell_id]
        c.value = text
        c.font = font_header_bold
        c.fill = fill_header
        c.border = header_border
        c.alignment = align_left if cell_id != "A16" and cell_id != "C16" else align_center

    recovery_matrix_data = [
        ("Z7", "Z7", "50m - 80m", "95 - 100%", "Completo (4 - 8 min)", "Velocità Massima & Accelerazione Alattacida (ATP-PCr puro, fibre rapide IIx)"),
        ("Z6", "Z6", "100m - 150m", "95 - 100%", "Completo (8 - 12 min)", "Potenza Lattacida Breve / Speed Endurance (VLamax picco, glicolisi rapida)"),
        ("Z5", "Z5 (SEP)", "150m - 300m", "95 - 100%", "COMPLETO (12 - 20+ min)", "POTENZA LATTACIDA PROLUNGATA (Speed Endurance Production - Prova singola o time trial 250m/300m)"),
        ("Z5", "Z5 (SEM)", "150m - 300m", "90 - 95%", "INCOMPLETO (4 - 8 min)", "CAPACITÀ LATTACIDA & BUFFERING (Speed Endurance Maintenance - Serie ripetute in acidosi)"),
        ("Z4", "Z4", "300m - 600m", "85 - 98%", "Ampio (12 - 25 min)", "Special Endurance 2 / Misto Lattacido-Aerobico Severo (Tenuta 400m/800m)"),
        ("Z3", "Z3", "50m - 250m", "78 - 88%", "Breve (1.5 - 3 min)", "Intensive Tempo (Glicolisi controllata 4-8 mM, Fast SSC, decontrazione neurale)"),
        ("Z2", "Z2", "50m - 600m", "65 - 75%", "Molto breve (45s - 2 min)", "Extensive Tempo Tecnico & Capillarizzazione (Ossidativo sub-LT2, recupero attivo)"),
        ("Z1", "Z1", "50m - 600m", "50 - 60%", "Minimo / Continuo", "Rigenerazione Aerobica, Strides Riscaldamento & Flush Runs su erba (Sub-LT1)"),
    ]

    for r_offset, (zid, label, d_str, int_str, rec_str, eff_str) in enumerate(recovery_matrix_data):
        curr_row = 17 + r_offset
        ws_notes.row_dimensions[curr_row].height = 21.0
        cfg = PALETTE_FIELD_ELITE[zid]

        # Col A
        cA = ws_notes[f"A{curr_row}"]
        cA.value = label
        cA.font = Font(name="Calibri", size=8.5, bold=True, color=cfg["font_hex"])
        cA.fill = PatternFill(start_color=cfg["bg_hex"], end_color=cfg["bg_hex"], fill_type="solid")
        cA.alignment = align_center
        cA.border = thin_border

        # Col B
        cB = ws_notes[f"B{curr_row}"]
        cB.value = d_str
        cB.font = font_body
        cB.alignment = align_left
        cB.border = thin_border

        # Col C
        cC = ws_notes[f"C{curr_row}"]
        cC.value = int_str
        cC.font = font_body
        cC.alignment = align_center
        cC.border = thin_border

        # Col D
        cD = ws_notes[f"D{curr_row}"]
        cD.value = rec_str
        cD.font = Font(name="Calibri", size=9.5, bold=True if "COMPLETO" in rec_str or "INCOMPLETO" in rec_str else False, color="1E1E1E")
        cD.alignment = align_left
        cD.border = thin_border

        # Col E
        cE = ws_notes[f"E{curr_row}"]
        cE.value = eff_str
        cE.font = font_body
        cE.alignment = align_left
        cE.border = thin_border
    
    # Note di Campo e Funzionalità Mobile con Nomenclatura Z7->Z1 e Correzione Submassimali
    notes_text = [
        ("IL RUOLO CRUCIALE DEL TEMPO DI RECUPERO: POTENZA LATTACIDA VS CAPACITÀ LATTACIDA SUI 150m-300m",
         "- La distanza percorsa NON determina da sola il sistema energetico bersaglio: è la combinazione di Distanza (Tempo sotto tensione) "
         "x Intensità x TEMPO DI RECUPERO a stabilire se si allena la Potenza o la Capacità.\n"
         "- POTENZA LATTACIDA (SEP - Speed Endurance Production): se un velocista (es. centometrista o duecentista) corre un singolo 250m o 300m "
         "massimale al 100% (o 2 prove con recupero completo >= 15-20 min), alla partenza il pH è neutro (~7.1) e la fosfocreatina è al 100%. "
         "L'enzima PFK-1 lavora alla massima velocità catalitica, sprigionando il massimo picco glicolitico (VLamax) e accumulo di lattato "
         "oltre 18-22 mM. Questo stimolo allena la massima potenza erogabile per reggere gli ultimi 30-50m di un 200m.\n"
         "- CAPACITÀ LATTACIDA (SEM - Speed Endurance Maintenance): se la stessa distanza (200m-300m) viene corsa con recupero incompleto (4-8 min), "
         "l'atleta riparte in piena acidosi (pH ~6.80). Come dimostrato da Bogdanis (1996), la PFK-1 viene inibita del 45% dai protoni H+ residui; "
         "la massima potenza non può essere espressa e l'organismo è forzato ad allenare la capacità tampone muscolare (bicarbonati, carnosina) "
         "e l'efficienza dei trasportatori MCT1/MCT4.\n"
         "- Pertanto, la Special Endurance 1 (Z5) possiede una doppia natura metodologica: con recupero completo è Potenza Lattacida Prolungata; "
         "con recupero parziale è Capacità Lattacida e tolleranza all'acidosi."),

        ("FUNZIONALITÀ SMART PER PICCOLI SCHERMI (MOBILE & TABLET)",
         "1. Blocco Riquadri Bidirezionale (Freeze Panes 'C9'): quando scorri a destra verso le percentuali estensive, "
         "la colonna della distanza (A) e la colonna del massimale 100% (B) restano sempre visibili sul lato sinistro dello schermo.\n"
         "2. Quando scorri verso il basso verso i 600m, l'intestazione delle percentuali (riga 8) resta sempre visibile in alto.\n"
         "3. Touch Targets (Altezza 21.5 pt): righe più alte per evitare tocchi accidentali con dita sudate o guanti in pista.\n"
         "4. Larghezza Colonne Compatta (6.4): permette di vedere fino a 11-12 colonne simultaneamente su smartphone senza dover continuamente scorrere."),
        
        ("STRUTTURA DIDATTICA E GERARCHIA DELLE ZONE (Z7 TOP -> Z1 BASE)",
         "- Z7 (Rosso Mattone): Massima Velocità ed Accelerazione Alattacida (50-80m @ 95-100%, t <= 8s, ATP-PCr puro, fibre rapide IIx).\n"
         "- Z6 (Viola Prugna): Potenza Lattacida & Speed Endurance (100-150m @ 95-100%, 50-80m @ 90-93%, VLamax, glicolisi rapida).\n"
         "- Z5 (Terracotta): Special Endurance 1 - SE1 (150-300m @ 90-98%, Potenza con rec. completo >=12-20', Capacità con rec. incompleto 4-8').\n"
         "- Z4 (Ambra Chiaro): Special Endurance 2 - SE2 (300-600m @ 85-98%, resistenza alla velocità prolungata, misto severo 40-90s).\n"
         "- Z3 (Giallo Sabbia): Intensive Tempo (50-250m @ 78-88%, 300-600m @ 75-83%, decontrazione neurale, glicolisi controllata 4-8 mM).\n"
         "- Z2 (Verde Salvia): Extensive Tempo Tecnico & Capillarizzazione (50-600m @ 65-75%, recupero attivo, ossidativo sub-LT2, postura e capillarizzazione).\n"
         "- Z1 (Azzurro Polvere): Rigenerazione Aerobica, Strides Riscaldamento & Flush Runs (50-600m @ 50-60%, riscaldamento pre-gara, flush su erba, riatletizzazione)."),

        ("IL VALORE METODOLOGICO DEI TRATTI BREVI SUBMASSIMALI (50m-120m @ 50%-65%): RISCALDAMENTO, FLUSH RUNS E RECUPERO ATTIVO",
         "- La tesi secondo cui correre tratti brevi sotto il 65% 'distrugge la stiffness reattiva' è un mito dogmatico smentito dalla fisiologia e dalla biomeccanica:\n"
         "- 1. Spring-Mass Model 'Tunable': Il corpo umano adatta la stiffness in millisecondi via feed-forward (Farley & McMahon). Allunghi controllati "
         "non de-calibrano l'arco riflesso; al contrario, la stiffness cala a causa della fatica cronica del SNC e dell'infiammazione tendinea, che vengono prevenute proprio dal lavoro rigenerativo.\n"
         "- 2. Extensive Tempo di Charlie Francis: Francis costruiva l'80% del volume settimanale dei suoi velocisti olimpici su 1.500-3.000m di Extensive Tempo "
         "fatto di serie da 100m su erba in 18-22s (esattamente il 50%-55% del massimale), per stimolare il letto capillare (VEGF) e favorire il recupero del SNC.\n"
         "- 3. Pratica dei Grandi Tecnici: Carlo Vittori ('allunghi di riscaldamento a scioltezza elastica'), Dan Pfaff ad ALTIS ('barefoot grass flush runs'), "
         "Clyde Hart ('warm-up strides') e Ryan Banta ('return-to-play post hamstring injury') utilizzano quotidianamente i 50m-120m al 50%-65% come "
         "ponte termico preparatorio, decontrazione muscolare e ricircolo del lattato (George Brooks Lactate Shuttle MCT1/MCT4)."),
          
        ("LINEE GUIDA SCIENTIFICHE D'USO SUL CAMPO",
         "- Regola di Stop del 3% (SNC Fatigue Cutoff): nelle sedute di velocità pura e potenza lattacida (Z7/Z6/Z5 SEP), interrompere la serie "
         "non appena il crono registrato sale di oltre il 3% rispetto al target (es. da 10.80s a oltre 11.12s), per evitare fatica neurale parassita.\n"
         "- Flying Start su Z3: per prove tecniche di ritmo su 50m, 60m e 80m al 78-88% (Z3), adottare un avvio lanciato di 10-15m per evitare che "
         "la fase di accelerazione statica iniziale alteri la velocità di crociera e la biomeccanica front-side.\n"
         "- Autoregolazione dinamica: modificando un massimale in Colonna B, tutte le 16 percentuali submassimali (da Z7 a Z1) si ricalcolano istantaneamente.")
    ]
    
    r_idx = 28
    for title, desc in notes_text:
        ws_notes[f"A{r_idx}"] = title
        ws_notes[f"A{r_idx}"].font = font_sec
        ws_notes.merge_cells(start_row=r_idx, start_column=1, end_row=r_idx, end_column=5)
        ws_notes.row_dimensions[r_idx].height = 24.0
        ws_notes[f"A{r_idx}"].alignment = Alignment(vertical="center", horizontal="left")

        ws_notes[f"A{r_idx+1}"] = desc
        ws_notes[f"A{r_idx+1}"].font = font_body
        ws_notes.merge_cells(start_row=r_idx+1, start_column=1, end_row=r_idx+1, end_column=5)
        ws_notes[f"A{r_idx+1}"].alignment = Alignment(wrap_text=True, vertical="top", horizontal="left")
        
        # Stima accurata delle linee considerando la larghezza aggregata di ~164 caratteri (A..E)
        total_lines = sum(max(1, math.ceil(len(p) / 120)) for p in desc.split("\n"))
        ws_notes.row_dimensions[r_idx+1].height = max(total_lines * 17 + 10, 36)
        r_idx += 3

    out_file = "sidequests/sprint-ritmi-excel/output/ritmi_atleti.xlsx"
    wb.save(out_file)
    print(f"Workbook ergonomico v2 salvato con successo in: {out_file}")

if __name__ == "__main__":
    build_ergonomic_workbook()
