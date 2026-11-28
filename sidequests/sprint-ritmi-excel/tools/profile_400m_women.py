# -*- coding: utf-8 -*-
"""
Modulo dedicato al profilo fisiologico, biomeccanico e metrologico per
atlete donne 400entiste di medio-alto livello (20-25 anni, ~52.5-56.5 s).

Riferimenti scientifici principali (Regola 04):
- Duffield et al. (2005): ripartizione energetica 400m donne (~45% aerobico / 55% anaerobico).
- Hanon et al. (2010) & Hanon & Gajer (2009): cinetica VO2 e decelerazione finale 14-20%.
- Rappelt et al. (2025): Speed Reserve Ratio (SRR = MSS/MAS; >=1.81 Sprint-type, <=1.77 Endurance-type).
- Sandford et al. (2021) & Bundle/Weyand (2003): ASR e decadimento esponenziale sopra MAS.
- McNulty et al. (2020) & Oosthuyse & Bosch (2010): stabilita della velocita rispetto a FC/lattato nel ciclo mestruale.
"""

import csv
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.formatting.rule import FormulaRule
from openpyxl.utils import get_column_letter

SHEET_NAME_400F = "400m Donne (20-25)"
CSV_400F_ZONES_PATH = "sidequests/sprint-ritmi-excel/output/palette_zone_fisiologiche_400f.csv"

# Soglie temporali (s) per la classificazione dinamica ad alta intensita (>= 85%)
Z7_MAX_SECONDS = 8.0
Z6_MAX_SECONDS = 18.0
Z5_MAX_SECONDS = 40.0

# Costanti di riferimento per il profilo campione 400m donne (modificabili a mano in Excel)
DEFAULT_PB_200M_S = 24.5
DEFAULT_GOAL_400M_S = 54.5
DEFAULT_MAS_MPS = 5.05
DEFAULT_MSS_MPS = 8.70
HART_200M_RACE_OFFSET_S = 1.5

# Soglie di classificazione Speed Reserve Ratio (Rappelt et al., 2025)
SRR_SPRINT_TYPE_MIN = 1.81
SRR_ENDURANCE_TYPE_MAX = 1.77

# Profilo campione coerente (velocita media decrescente da 100m a 600m, zero inversioni)
ATHLETE_400F_REFERENCE = [
    ("50", 6.50),
    ("60", 7.60),
    ("80", 9.70),
    ("100", 12.0),
    ("120", 14.5),
    ("150", 18.2),
    ("200", 24.5),
    ("250", 31.7),
    ("300", 39.1),
    ("350", 46.7),
    ("400", 54.5),
    ("500", 71.5),
    ("600", 90.0),
]


def load_400f_zone_matrix():
    """Carica la matrice 2D specifica per 400entiste donne da CSV."""
    matrix = {}
    with open(CSV_400F_ZONES_PATH, "r", encoding="utf-8") as f:
        reader = csv.reader(f, delimiter=";")
        header = next(reader)
        pct_names = header[1:]
        for row in reader:
            dist_str = row[0]
            matrix[dist_str] = {}
            for col_idx, pct_name in enumerate(pct_names):
                matrix[dist_str][pct_name] = row[col_idx + 1]
    return matrix


def add_audit_columns(ws, start_row=9, num_rows=13, include_col_u_400f=False):
    """
    Aggiunge colonne di audit metrologico fuori dalla finestra mobile (S, T, opz. U):
    - S: v100 (m/s) al 100%
    - T: Check Curva (rileva inversioni di velocita media dai 120m ai 600m)
    - U (solo foglio 400F): Stima B assistita per 250-350m tramite Power-Law locale b_ind
    """
    thin_side = Side(border_style="thin", color="B0B0B0")
    header_bottom = Side(border_style="medium", color="707070")
    thin_border = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)
    header_border = Border(left=thin_side, right=thin_side, top=thin_side, bottom=header_bottom)
    fill_header = PatternFill(start_color="F2F4F4", end_color="F2F4F4", fill_type="solid")
    font_header = Font(name="Calibri", size=9.5, bold=True, color="1E1E1E")
    font_body = Font(name="Calibri", size=9, color="1E1E1E")
    align_center = Alignment(horizontal="center", vertical="center")

    headers = [("S", "v100 m/s", 9.5), ("T", "Check Curva", 12.0)]
    if include_col_u_400f:
        headers.append(("U", "Stima B (250-350)", 16.5))

    for col_letter, title, width in headers:
        cell = ws[f"{col_letter}8"]
        cell.value = title
        cell.font = font_header
        cell.fill = fill_header
        cell.border = header_border
        cell.alignment = align_center
        ws.column_dimensions[col_letter].width = width

    for offset in range(num_rows):
        row = start_row + offset
        # Velocita media massimale (m/s)
        c_s = ws[f"S{row}"]
        c_s.value = f'=IF($B{row}>0,A{row}/$B{row},"")'
        c_s.font = font_body
        c_s.alignment = align_center
        c_s.border = thin_border
        c_s.number_format = "0.00"

        # Verifica monotonicita decrescente dai 120m (riga 13) in poi
        c_t = ws[f"T{row}"]
        if row >= 13:
            c_t.value = f'=IF(OR($B{row}<=0,$B{row-1}<=0),"",IF(S{row}>=S{row-1},"ANOMALIA","OK"))'
        else:
            c_t.value = f'=IF($B{row}<=0,"VUOTO","ACCEL")'
        c_t.font = font_body
        c_t.alignment = align_center
        c_t.border = thin_border

        if include_col_u_400f:
            c_u = ws[f"U{row}"]
            # 250m=riga 16, 300m=riga 17, 350m=riga 18; 500-600m=righe 20-21
            # Nota: le celle unite A4:B4, C4:D4 ed E6:F6 memorizzano il valore nella prima cella a sinistra (A4, C4, E6)
            if row in (16, 17, 18):
                c_u.value = f'=IF(AND($A$4>0,$C$4>0),$A$4*(A{row}/200)^$E$6,"")'
                c_u.number_format = "0.0"
            elif row in (20, 21):
                c_u.value = "Test 600m o MAS"
            else:
                c_u.value = "-"
            c_u.font = font_body
            c_u.alignment = align_center
            c_u.border = thin_border


def add_400f_profile_header(ws):
    """
    Inserisce il riquadro profilo atleta 400m donne nelle righe 2-6 (sopra riga 8)
    con parametri modificabili e indicatori derivati (CRS, b_ind, SRR, passo 200m).
    Nota Excel: nelle celle unite X:Y il valore risiede sempre nella cella di sinistra X.
    """
    thin_side = Side(border_style="thin", color="B0B0B0")
    thin_border = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)
    fill_title = PatternFill(start_color="EBF5FB", end_color="EBF5FB", fill_type="solid")
    fill_input = PatternFill(start_color="FEF9E7", end_color="FEF9E7", fill_type="solid")
    fill_calc = PatternFill(start_color="F4F6F7", end_color="F4F6F7", fill_type="solid")

    font_title = Font(name="Calibri", size=10.5, bold=True, color="1F497D")
    font_label = Font(name="Calibri", size=8.5, bold=True, color="333333")
    font_val = Font(name="Calibri", size=9.5, bold=True, color="1E1E1E")
    align_c = Alignment(horizontal="center", vertical="center")
    align_l = Alignment(horizontal="left", vertical="center")

    ws.merge_cells("A2:U2")
    ws["A2"] = "PROFILO 400m DONNE (20-25 ANNI) - ANCORE FISIOLOGICHE & CONTROLLO CURVA"
    ws["A2"].font = font_title
    ws["A2"].fill = fill_title
    ws["A2"].alignment = align_l
    ws.row_dimensions[2].height = 20.0

    # Riga 3-4: Input modificabili (sfondo crema chiaro, celle sbloccate per Regola 05)
    # A4 = PB 200m, C4 = Goal 400m, E4 = MAS, G4 = MSS
    inputs = [
        ("A3", "B3", "A4", "B4", "PB 200m (s)", DEFAULT_PB_200M_S, "0.00"),
        ("C3", "D3", "C4", "D4", "Goal 400m (s)", DEFAULT_GOAL_400M_S, "0.00"),
        ("E3", "F3", "E4", "F4", "MAS (m/s)", DEFAULT_MAS_MPS, "0.00"),
        ("G3", "H3", "G4", "H4", "MSS (m/s)", DEFAULT_MSS_MPS, "0.00"),
    ]
    ws.row_dimensions[3].height = 16.0
    ws.row_dimensions[4].height = 19.0
    for l1, l2, v1, v2, label, val, num_fmt in inputs:
        ws.merge_cells(f"{l1}:{l2}")
        ws[l1] = label
        ws[l1].font = font_label
        ws[l1].alignment = align_c
        ws[l1].fill = fill_calc
        ws[l1].border = thin_border
        ws[l2].border = thin_border

        ws.merge_cells(f"{v1}:{v2}")
        ws[v1] = val
        ws[v1].font = font_val
        ws[v1].alignment = align_c
        ws[v1].fill = fill_input
        ws[v1].number_format = num_fmt
        ws[v1].border = thin_border
        ws[v2].border = thin_border

    # Riga 5-6: Indicatori scientifici derivati automaticamente dalle celle sinistre (A4, C4, E4, G4)
    derived = [
        ("A5", "B5", "A6", "B6", "CRS (400-2x200)", '=IF(AND(A4>0,C4>0),C4-2*A4,"")', "0.00"),
        ("C5", "D5", "C6", "D6", "Pass. 200m Gara", f'=IF(A4>0,A4+{HART_200M_RACE_OFFSET_S},"")', "0.00"),
        ("E5", "F5", "E6", "F6", "b_ind (200->400)", '=IF(AND(A4>0,C4>0),LN(C4/A4)/LN(2),"")', "0.000"),
        ("G5", "H5", "G6", "H6", "SRR (MSS/MAS)", '=IF(AND(E4>0,G4>0),G4/E4,"")', "0.00"),
        ("I5", "K5", "I6", "K6", "Profilo Rappelt", f'=IF(G6="","",IF(G6>={SRR_SPRINT_TYPE_MIN},"Sprint-type",IF(G6<={SRR_ENDURANCE_TYPE_MAX},"Endurance-type","Bilanciata")))', "@"),
    ]
    ws.row_dimensions[5].height = 16.0
    ws.row_dimensions[6].height = 19.0
    for l1, l2, v1, v2, label, formula, num_fmt in derived:
        ws.merge_cells(f"{l1}:{l2}")
        ws[l1] = label
        ws[l1].font = font_label
        ws[l1].alignment = align_c
        ws[l1].fill = fill_calc
        ws[l1].border = thin_border
        ws[l2].border = thin_border

        ws.merge_cells(f"{v1}:{v2}")
        ws[v1] = formula
        ws[v1].font = font_val
        ws[v1].alignment = align_c
        ws[v1].fill = fill_calc
        ws[v1].number_format = num_fmt
        ws[v1].border = thin_border
        ws[v2].border = thin_border


def apply_high_intensity_conditional_formatting(ws, palette):
    """
    Applica la Formattazione Condizionale sulle celle ad alta intensita (B9:H21, >=85%)
    cosi che i colori Z7/Z6/Z5/Z4 si adattino dinamicamente al tempo reale calcolato
    quando l'allenatore modifica i massimali in Colonna B.
    """
    target_range = "B9:H21"
    rules = [
        ("Z7", f"=AND(ISNUMBER(B9),B9>0,B9<={Z7_MAX_SECONDS})"),
        ("Z6", f"=AND(ISNUMBER(B9),B9>{Z7_MAX_SECONDS},B9<={Z6_MAX_SECONDS})"),
        ("Z5", f"=AND(ISNUMBER(B9),B9>{Z6_MAX_SECONDS},B9<={Z5_MAX_SECONDS})"),
        ("Z4", f"=AND(ISNUMBER(B9),B9>{Z5_MAX_SECONDS})"),
    ]
    for z_id, formula in rules:
        cfg = palette[z_id]
        fill = PatternFill(start_color=cfg["bg_hex"], end_color=cfg["bg_hex"], fill_type="solid")
        font = Font(name="Calibri", size=9, bold=cfg["bold"], color=cfg["font_hex"])
        ws.conditional_formatting.add(
            target_range,
            FormulaRule(formula=[formula], stopIfTrue=True, fill=fill, font=font),
        )
