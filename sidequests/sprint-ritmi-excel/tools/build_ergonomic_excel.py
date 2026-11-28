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
import math

from profile_400m_women import (
    SHEET_NAME_400F,
    CSV_BASE_ZONES_PATH,
    CSV_400F_ZONES_PATH,
    ATHLETE_400F_REFERENCE,
    classify_zone_2d,
    export_2d_palette_csv,
    add_audit_columns,
    add_400f_profile_header,
    apply_2d_zone_conditional_formatting,
)

PERCENTAGES = [
    ("100%", 1.00, "0%"),
    ("98%", 0.98, "0%"),
    ("95%", 0.95, "0%"),
    ("93%", 0.93, "0%"),
    ("90,0%", 0.90, "0%"),
    ("88%", 0.88, "0%"),
    ("85%", 0.85, "0%"),
    ("83%", 0.83, "0%"),
    ("80,0%", 0.80, "0%"),
    ("78%", 0.78, "0%"),
    ("75%", 0.75, "0%"),
    ("73%", 0.73, "0%"),
    ("70,0%", 0.70, "0%"),
    ("65%", 0.65, "0%"),
    ("60,0%", 0.60, "0%"),
    ("55%", 0.55, "0%"),
    ("50,0%", 0.50, "0%"),
]

SHORT_PRECISE_DISTANCES = ("50", "60", "80")

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
        "system": "Misto lattacido-aerobico severo (40 - 110s)",
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

def populate_athlete_sheet(ws, athlete_rows, styles, is_400f=False):
    """
    Popola un foglio atleta con freeze panes C9, formule T100/p protette,
    colorazione 2D continua (Intensita x Durata) e Formattazione Condizionale live.
    """
    profile = "400f" if is_400f else "base"
    ws.protection.sheet = False
    ws.views.sheetView[0].showGridLines = True
    ws.views.sheetView[0].zoomScale = 100
    ws.freeze_panes = "C9"

    if is_400f:
        add_400f_profile_header(ws)

    # Row 8: Header
    ws.row_dimensions[8].height = 25.0
    cell_a8 = ws.cell(row=8, column=1, value="m")
    cell_a8.font = styles["font_header_bold"]
    cell_a8.alignment = styles["align_center"]
    cell_a8.border = styles["header_border"]
    cell_a8.fill = styles["fill_header"]

    for c_idx, (p_name, p_val, p_fmt) in enumerate(PERCENTAGES, start=2):
        cell = ws.cell(row=8, column=c_idx, value=p_val)
        cell.font = styles["font_header_bold"] if c_idx == 2 else styles["font_header"]
        cell.alignment = styles["align_center"]
        cell.border = styles["header_border"]
        cell.number_format = p_fmt
        cell.fill = styles["fill_header"]

    # Data rows (9 to 21)
    for offset, (dist_str, t100_val) in enumerate(athlete_rows):
        row_idx = 9 + offset
        ws.row_dimensions[row_idx].height = 21.5  # Tattile touch target
        num_fmt = "0.00" if dist_str in SHORT_PRECISE_DISTANCES else "0.0"

        # Col A: Distanza
        cell_a = ws.cell(row=row_idx, column=1, value=int(dist_str))
        cell_a.font = styles["font_dist"]
        cell_a.alignment = styles["align_center"]
        cell_a.border = styles["thin_border"]
        cell_a.fill = styles["fill_grey_dist"] if dist_str in ["100", "200", "400"] else styles["fill_white"]

        # Col B: Massimale T100 (Input manuale evidenziato)
        cell_b = ws.cell(row=row_idx, column=2, value=t100_val)
        z_id_100 = classify_zone_2d(1.0, t100_val, profile=profile)
        cfg_100 = PALETTE_FIELD_ELITE[z_id_100]
        cell_b.font = Font(name="Calibri", size=9, bold=True, color=cfg_100["font_hex"])
        cell_b.alignment = styles["align_center"]
        cell_b.border = styles["b_input_border"]
        cell_b.number_format = num_fmt
        cell_b.fill = PatternFill(start_color=cfg_100["bg_hex"], end_color=cfg_100["bg_hex"], fill_type="solid")

        # Colonne C..R: Formule Vive con guardia <=0 (=IF($B{riga}<=0,"",$B{riga}/C$8))
        for col_idx, (p_name, p_val, p_fmt) in enumerate(PERCENTAGES[1:], start=3):
            col_letter = get_column_letter(col_idx)
            formula_str = f'=IF($B{row_idx}<=0,"",$B{row_idx}/{col_letter}$8)'
            cell_der = ws.cell(row=row_idx, column=col_idx, value=formula_str)

            t_calc = t100_val / p_val if t100_val > 0 else 0.0
            z_id = classify_zone_2d(p_val, t_calc, profile=profile)
            cfg = PALETTE_FIELD_ELITE[z_id]

            cell_der.font = Font(name="Calibri", size=9, bold=cfg["bold"], color=cfg["font_hex"])
            cell_der.alignment = styles["align_center"]
            cell_der.border = styles["thin_border"]
            cell_der.fill = PatternFill(start_color=cfg["bg_hex"], end_color=cfg["bg_hex"], fill_type="solid")
            cell_der.number_format = num_fmt

    # Larghezza Colonne Ottimizzata per Display Mobili
    ws.column_dimensions["A"].width = 6.8
    ws.column_dimensions["B"].width = 7.2
    for col_idx in range(3, 19):
        ws.column_dimensions[get_column_letter(col_idx)].width = 6.4

    # Colonne Audit S, T (+ U su 400F)
    add_audit_columns(ws, start_row=9, num_rows=len(athlete_rows), include_col_u_400f=is_400f)

    # Formattazione Condizionale 2D attiva su ENTRAMBI i fogli atleti
    apply_2d_zone_conditional_formatting(ws, PALETTE_FIELD_ELITE, profile=profile)


def build_ergonomic_workbook():
    """Genera ritmi_atleti.xlsx con esattamente 3 fogli (Atleta 1, 400m Donne, Legenda)."""
    # Rigenera deterministicamente i CSV fallback allineati al modello continuo 2D
    export_2d_palette_csv(ATHLETE_DATA_EXTENDED["Atleta 1"], PERCENTAGES, CSV_BASE_ZONES_PATH, profile="base")
    export_2d_palette_csv(ATHLETE_400F_REFERENCE, PERCENTAGES, CSV_400F_ZONES_PATH, profile="400f")

    wb = openpyxl.Workbook()
    wb.remove(wb.active)  # Remove default sheet

    border_thin_side = Side(border_style="thin", color="B0B0B0")
    border_header_bottom = Side(border_style="medium", color="707070")
    border_b_side = Side(border_style="medium", color="303030")

    styles = {
        "font_header": Font(name="Calibri", size=10, bold=False, color="1E1E1E"),
        "font_header_bold": Font(name="Calibri", size=10, bold=True, color="1E1E1E"),
        "font_dist": Font(name="Calibri", size=9, bold=True, color="1E1E1E"),
        "align_center": Alignment(horizontal="center", vertical="center"),
        "align_left": Alignment(horizontal="left", vertical="center"),
        "thin_border": Border(left=border_thin_side, right=border_thin_side, top=border_thin_side, bottom=border_thin_side),
        "header_border": Border(left=border_thin_side, right=border_thin_side, top=border_thin_side, bottom=border_header_bottom),
        "b_input_border": Border(left=border_b_side, right=border_b_side, top=border_thin_side, bottom=border_thin_side),
        "fill_header": PatternFill(start_color="F2F4F4", end_color="F2F4F4", fill_type="solid"),
        "fill_grey_dist": PatternFill(start_color="D6DBDF", end_color="D6DBDF", fill_type="solid"),
        "fill_white": PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid"),
    }

    # Foglio 1: Atleta 1 (Velocisti 100m / 200m)
    ws_base = wb.create_sheet(title="Atleta 1")
    populate_athlete_sheet(ws_base, ATHLETE_DATA_EXTENDED["Atleta 1"], styles, is_400f=False)

    # Foglio 2: 400m Donne (20-25 anni, medio-alto livello)
    ws_400f = wb.create_sheet(title=SHEET_NAME_400F)
    populate_athlete_sheet(ws_400f, ATHLETE_400F_REFERENCE, styles, is_400f=True)

    # Foglio 3: Legenda Ergonomica e Guida Mobile (ultima pagina)
    ws_notes = wb.create_sheet(title="Legenda e Guida Mobile")
    ws_notes.protection.sheet = False
    ws_notes.views.sheetView[0].showGridLines = True

    font_title = Font(name="Calibri", size=13, bold=True, color="1F497D")
    font_sec = Font(name="Calibri", size=11, bold=True, color="1E1E1E")
    font_body = Font(name="Calibri", size=9.5, color="333333")

    font_header_bold = styles["font_header_bold"]
    fill_header = styles["fill_header"]
    header_border = styles["header_border"]
    thin_border = styles["thin_border"]
    align_center = styles["align_center"]
    align_left = styles["align_left"]

    ws_notes["A1"] = "GUIDA OPERATIVA & LEGENDA ERGONOMICA WCAG AAA DELLE ZONE DI ALLENAMENTO"
    ws_notes["A1"].font = font_title
    ws_notes.merge_cells("A1:E1")
    ws_notes.row_dimensions[1].height = 28.0
    ws_notes["A1"].alignment = Alignment(vertical="center", horizontal="left")

    # Tabella Legenda Zone Visiva (Gerarchia Decrescente: Z7 Top -> Z1 Min)
    ws_notes["A3"] = "Zona"
    ws_notes["B3"] = "Nome della Zona"
    ws_notes["C3"] = "Sistema Energetico & Finestra Temporale"
    ws_notes["D3"] = "Contrasto WCAG"
    ws_notes["E3"] = "Come nasce il colore (Intensita % x Tempo)"

    for c in ["A3", "B3", "C3", "D3", "E3"]:
        ws_notes[c].font = font_header_bold
        ws_notes[c].fill = fill_header
        ws_notes[c].border = header_border
        ws_notes[c].alignment = align_left if c != "A3" and c != "D3" else align_center

    zone_order = [
        ("Z7", "Z7", "7.45:1 (AAA)", "95-100% E tempo <= 8.0 s (velocita massima / accelerazione alattacida pura)"),
        ("Z6", "Z6", "8.55:1 (AAA)", "95-100% con tempo 8.1-18.0 s, oppure 93% su sprint brevi molto rapidi"),
        ("Z5", "Z5", "7.03:1 (AAA)", "95-100% con tempo 18.1-40.0 s, oppure transizione 88-93% su sprint brevi/medi"),
        ("Z4", "Z4", "11.10:1 (AAA)", ">=85% sopra i 40.0 s (300-600m), oppure fascia ponte 85-88% su 50-250m (es. 100m @ 85% = ritmo 400m)"),
        ("Z3", "Z3", "13.46:1 (AAA)", "78-83% sempre; su prove brevi fino a 70-75% (Atleta 1) / 75% (400F); su 350-600m 73-83% su 400F"),
        ("Z2", "Z2", "11.11:1 (AAA)", "Atleta 1: 65% breve -> 70-75% su 350-600m | 400F: 65-73% breve -> 60-70% su 350-600m"),
        ("Z1", "Z1", "10.87:1 (AAA)", "50-60% (fino a 65% su 350-600m Atleta 1; 50-55% su 500-600m 400F = recupero su erba)"),
    ]

    for idx, (zid, short_code, contrast_val, dist_desc) in enumerate(zone_order, start=4):
        cfg = PALETTE_FIELD_ELITE[zid]
        ws_notes.row_dimensions[idx].height = 24.0

        cA = ws_notes[f"A{idx}"]
        cA.value = short_code
        cA.font = Font(name="Calibri", size=9, bold=True, color=cfg["font_hex"])
        cA.fill = PatternFill(start_color=cfg["bg_hex"], end_color=cfg["bg_hex"], fill_type="solid")
        cA.alignment = align_center
        cA.border = thin_border

        cB = ws_notes[f"B{idx}"]
        cB.value = cfg["name"]
        cB.font = Font(name="Calibri", size=9.5, bold=True, color="1E1E1E")
        cB.alignment = align_left
        cB.border = thin_border

        cC = ws_notes[f"C{idx}"]
        cC.value = cfg["system"]
        cC.font = font_body
        cC.alignment = align_left
        cC.border = thin_border

        cD = ws_notes[f"D{idx}"]
        cD.value = contrast_val
        cD.font = font_body
        cD.alignment = align_center
        cD.border = thin_border

        cE = ws_notes[f"E{idx}"]
        cE.value = dist_desc
        cE.font = font_body
        cE.alignment = Alignment(wrap_text=True, vertical="center", horizontal="left")
        cE.border = thin_border

    ws_notes.column_dimensions["A"].width = 11.0
    ws_notes.column_dimensions["B"].width = 38.0
    ws_notes.column_dimensions["C"].width = 52.0
    ws_notes.column_dimensions["D"].width = 20.0
    ws_notes.column_dimensions["E"].width = 62.0

    # Sezione 2: Tabella Matrice di Sforzo e Recupero (SEP vs SEM + Ponte 400m)
    ws_notes["A14"] = "MATRICE METODOLOGICA: SFORZO, TEMPO DI RECUPERO E SISTEMI ENERGETICI (SEP vs SEM & 400F)"
    ws_notes["A14"].font = font_title
    ws_notes.merge_cells("A14:E14")
    ws_notes.row_dimensions[14].height = 26.0
    ws_notes["A14"].alignment = Alignment(vertical="center", horizontal="left")

    rec_headers = [
        ("A16", "Zona"),
        ("B16", "Distanze Tipiche"),
        ("C16", "Intensita"),
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
        ("Z7", "Z7", "50m - 60m (<=8s)", "95 - 100%", "Completo (4 - 8 min)", "Velocita Massima & Accelerazione Alattacida (ATP-PCr puro, fibre IIx; non ridurre rec. alle donne)"),
        ("Z6", "Z6", "80m - 150m (8-18s; 93% brevi)", "93 - 100%", "Completo (8 - 12 min)", "Potenza Lattacida Breve / Speed Endurance (VLamax picco, glicolisi rapida)"),
        ("Z5", "Z5 (SEP)", "150m - 300m (18-40s)", "95 - 100%", "COMPLETO (12 - 20+ min)", "POTENZA LATTACIDA PROLUNGATA (Speed Endurance Production - Prova singola o 2 prove)"),
        ("Z5", "Z5 (SEM)", "50m - 300m (transizione)", "88 - 93%", "INCOMPLETO (4 - 8 min; 400F 4-6')", "CAPACITA LATTACIDA & BUFFERING (Speed Endurance Maintenance - Serie ripetute; stop 3%)"),
        ("Z4", "Z4 (Submax/Ponte)", "50m - 600m", "85 - 90%", "Medio-Ampio (6 - 12 min)", "Ponte ritmo specifico 400m su 100-250m (es. 100m @ 85%) e SE2 submassimale 300-600m (Vittori/Hart)"),
        ("Z4", "Z4 (Gara)", "300m - 600m (>40s)", "92 - 100%", "Ampio (15 - 25 min)", "Special Endurance 2 / Tenuta 400m-800m vicino al ritmo gara (USATF/UKA)"),
        ("Z3", "Z3", "50m - 600m", "70 - 83% (400F 73-83%)", "Breve (1.5-2.5' <=300m; 2-4' >350m)", "Intensive Tempo (Glicolisi controllata 4-8 mM, Fast SSC, decontrazione; 5-8' tra serie lunghe)"),
        ("Z2", "Z2", "50m - 600m", "60 - 75% (400F 60-73%)", "Molto breve (45s - 2 min)", "Extensive Tempo Tecnico & Capillarizzazione (Ossidativo sub-LT2, recupero attivo)"),
        ("Z1", "Z1", "50m - 600m", "50 - 60% (65% base 350-600)", "Minimo / Continuo", "Rigenerazione Aerobica, Strides Riscaldamento & Flush Runs su erba (Sub-LT1)"),
    ]

    for r_offset, (zid, label, d_str, int_str, rec_str, eff_str) in enumerate(recovery_matrix_data):
        curr_row = 17 + r_offset
        ws_notes.row_dimensions[curr_row].height = 22.0
        cfg = PALETTE_FIELD_ELITE[zid]

        cA = ws_notes[f"A{curr_row}"]
        cA.value = label
        cA.font = Font(name="Calibri", size=8.5, bold=True, color=cfg["font_hex"])
        cA.fill = PatternFill(start_color=cfg["bg_hex"], end_color=cfg["bg_hex"], fill_type="solid")
        cA.alignment = align_center
        cA.border = thin_border

        cB = ws_notes[f"B{curr_row}"]
        cB.value = d_str
        cB.font = font_body
        cB.alignment = align_left
        cB.border = thin_border

        cC = ws_notes[f"C{curr_row}"]
        cC.value = int_str
        cC.font = font_body
        cC.alignment = align_center
        cC.border = thin_border

        cD = ws_notes[f"D{curr_row}"]
        cD.value = rec_str
        cD.font = Font(name="Calibri", size=9.5, bold=True if "COMPLETO" in rec_str or "INCOMPLETO" in rec_str else False, color="1E1E1E")
        cD.alignment = align_left
        cD.border = thin_border

        cE = ws_notes[f"E{curr_row}"]
        cE.value = eff_str
        cE.font = font_body
        cE.alignment = align_left
        cE.border = thin_border

    # Note Operative Chiare per il Campo
    notes_text = [
        ("COME LEGGERE TEMPI E COLORI IN PISTA (MODELLO 2D CONTINUO)",
         "1. Tempo della cella: si calcola sempre come Massimale (Colonna B) / Intensita (Riga 8) (es. 11.6s / 0.85 = 13.65s).\n"
         "2. Regola 2D (Intensita % x Tempo): su entrambi i fogli ('Atleta 1' e '400m Donne (20-25)'), il colore NON guarda solo i secondi ma combina QUANTO FORTE corri (%) e QUANTO DURA la prova (s). "
         "Al 95-100% comanda la durata (<=8s Rosso Z7, 8-18s Viola Z6, 18-40s Terracotta Z5, >40s Ambra Z4). Appena scendi sotto il 95%, l'intensita modula la zona un gradino alla volta: "
         "ad esempio sui 100m (11.6s), l'85% (13.65s, ritmo gara 400m) e Ambra Z4 (non Viola Z6) e prosegue all'83% (13.98s) in Giallo Z3, senza salti bruschi.\n"
         "3. Aggiornamento automatico: modificando qualsiasi tempo in Colonna B si aggiornano subito sia i ritmi sia i colori (se una cella e vuota o <=0 diventa grigio neutro OFF)."),

        ("IL RUOLO CRUCIALE DEL TEMPO DI RECUPERO: POTENZA LATTACIDA VS CAPACITA LATTACIDA",
         "- La distanza percorsa NON determina da sola il sistema energetico bersaglio: e la combinazione di Distanza x Intensita x TEMPO DI RECUPERO a stabilire se si allena la Potenza o la Capacita.\n"
         "- POTENZA LATTACIDA (SEP): recupero completo >= 12-20 min; pH neutro (~7.1), PFK-1 al 100%, picco glicolitico VLamax (>18-22 mM).\n"
         "- CAPACITA LATTACIDA (SEM): recupero incompleto (4-8 min); ripartenza in acidosi (pH ~6.80), inibizione PFK-1 del 45% (Bogdanis, 1996), stimolo su potere tampone e trasportatori MCT1/MCT4."),

        ("SPECIFICITA PER ATLETE 400m DONNE (20-25 ANNI) & CICLO MESTRUALE",
         "- Ripartizione energetica (Duffield et al., 2005): nei 400m femminili il contributo aerobico sale al ~45% (crossover >50% tra 15 e 30s, Spencer & Gastin 2001). Per questo tra 83% e 50% il foglio 400F adatta le soglie Z3/Z2/Z1 al profilo piu aerobico delle 400entiste.\n"
         "- Speed Reserve Ratio (Rappelt et al., 2025): MSS/MAS >= 1.81 = Sprint-type, <= 1.77 = Endurance-type. In Colonna U la stima di 250-350m usa b_ind locale tra 200m e 400m (mai Riegel fisso 1.06); per 500-600m serve test diretto o MAS.\n"
         "- Ciclo Mestruale (McNulty et al., 2020; Oosthuyse & Bosch, 2010): effetto medio triviale; ancorare le sedute a velocita target + RPE (piu stabili di FC o lattato fisso in fase medio-luteale)."),

        ("LINEE GUIDA DI CAMPO & MODIFICABILITA (REGOLA 05)",
         "- Regola di Stop del 3%: in Z7/Z6/Z5 SEP interrompere la serie se il crono peggiora oltre il +3% rispetto al target.\n"
         "- Partenza Lanciata (Flying Start) su 50-80m submassimali (<90%): evita di falsare accelerazione e tempo di contatto.\n"
         "- Audit Curva (Colonne S e T): mostra v100 (m/s) e segnala 'ANOMALIA' dai 120m ai 600m se la velocita media non decresce.\n"
         "- File 100% sbloccato: nessuna password o cella protetta su tutti e 3 i fogli.")
    ]

    r_idx = 29
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

        total_lines = sum(max(1, math.ceil(len(p) / 120)) for p in desc.split("\n"))
        ws_notes.row_dimensions[r_idx+1].height = max(total_lines * 17 + 10, 36)
        r_idx += 3

    out_file = "sidequests/sprint-ritmi-excel/output/ritmi_atleti.xlsx"
    wb.save(out_file)
    print(f"Workbook ergonomico v4 (3 fogli + CF 2D continua) salvato in: {out_file}")


if __name__ == "__main__":
    build_ergonomic_workbook()
