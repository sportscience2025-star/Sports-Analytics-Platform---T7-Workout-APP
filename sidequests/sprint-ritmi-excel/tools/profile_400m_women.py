# -*- coding: utf-8 -*-
"""
Modulo dedicato al profilo fisiologico, biomeccanico e metrologico per:
- Classificazione continua 2D (Intensita % x Durata t) priva di salti >= 2 zone
  su entrambi i fogli ('Atleta 1' 100/200m e '400m Donne (20-25)').
- Cruscotto profilo 400m donne (CRS Vittori, Passaggio 200m Hart, b_ind, SRR Rappelt 2025).
- Colonne di audit curva (S, T, U) e Formattazione Condizionale 2D Excel pura.

Riferimenti scientifici principali (Regola 04):
- Duffield et al. (2005): ripartizione energetica 400m donne (~45% aerobico / 55% anaerobico).
- Hanon et al. (2010) & Hanon & Gajer (2009): cinetica VO2 e decelerazione finale 14-20%.
- Rappelt et al. (2025): Speed Reserve Ratio (SRR = MSS/MAS; >=1.81 Sprint-type, <=1.77 Endurance-type).
- Sandford et al. (2021) & Bundle/Weyand (2003): ASR e decadimento esponenziale sopra MAS.
- Mader & Heck (1986) / Haugen et al. (2019): intensita minima per VLamax (Z6) e velocita max (Z7).
- McNulty et al. (2020) & Oosthuyse & Bosch (2010): stabilita velocita vs FC/lattato nel ciclo mestruale.
"""

import csv
import math
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.formatting.rule import FormulaRule

SHEET_NAME_400F = "400m Donne (20-25)"
CSV_BASE_ZONES_PATH = "sidequests/sprint-ritmi-excel/output/palette_zone_fisiologiche_v2.csv"
CSV_400F_ZONES_PATH = "sidequests/sprint-ritmi-excel/output/palette_zone_fisiologiche_400f.csv"

# Costanti modello continuo 2D - Regime Alta Intensita (p >= 0.845)
Z7_MAX_SECONDS = 8.0
LN_ZONE_STEP = 0.807
S_MAX_CEIL = 7.35
S_MAX_FLOOR = 4.20
SCORE_Z4_BASE = 4.0
HIGH_INT_MIN_PCT = 0.845
HIGH_INT_SPAN_PCT = 0.105

# Costanti modello continuo 2D - Regime Tempo/Aerobico (p < 0.845), profilo Base (Atleta 1)
BASE_T0 = 12.0
BASE_T_SPAN = 5.0
BASE_P3_MIN = 0.680
BASE_P3_DELTA = 0.075
BASE_P2_MIN = 0.605
BASE_P2_DELTA = 0.050

# Costanti modello continuo 2D - Regime Tempo/Aerobico (p < 0.845), profilo 400m Donne
W400_T0 = 15.0
W400_T_SPAN = 4.0
W400_P3_MAX = 0.745
W400_P3_DELTA = 0.025
W400_P2_MAX = 0.625
W400_P2_DELTA = 0.035

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


def classify_zone_2d(pct_val, time_s, profile="base"):
    """
    Classifica una prova nella scala Z7..Z1 (oppure OFF se time_s <= 0) combinando
    intensita relativa (pct_val in [0.50, 1.00]) e durata (time_s in secondi).
    Garantisce continuita matematica (nessun salto >= 2 zone tra colonne adiacenti).
    """
    if time_s is None or not isinstance(time_s, (int, float)) or time_s <= 0:
        return "OFF"

    if pct_val >= HIGH_INT_MIN_PCT:
        # Tetto energetico in funzione logaritmica della durata (ancorato a 8s / 18s / 40s)
        raw_s_max = 7.0 - (math.log(time_s / Z7_MAX_SECONDS) / LN_ZONE_STEP)
        s_max = min(S_MAX_CEIL, max(S_MAX_FLOOR, raw_s_max))
        # Modulazione continua con la percentuale p: impedisce che 85% diventi Z6/Z7
        pct_factor = min(1.0, (pct_val - HIGH_INT_MIN_PCT) / HIGH_INT_SPAN_PCT)
        score = SCORE_Z4_BASE + pct_factor * (s_max - SCORE_Z4_BASE)

        if score >= 7.0:
            return "Z7"
        if score >= 6.0:
            return "Z6"
        if score >= 5.0:
            return "Z5"
        return "Z4"

    # Regime submassimale (p < 84.5%): curve calibrate sul profilo metabolico
    if profile == "400f":
        u = min(1.0, max(0.0, math.log(time_s / W400_T0) / math.log(W400_T_SPAN)))
        p3 = W400_P3_MAX - W400_P3_DELTA * u
        p2 = W400_P2_MAX - W400_P2_DELTA * u
    else:
        u = min(1.0, max(0.0, math.log(time_s / BASE_T0) / math.log(BASE_T_SPAN)))
        p3 = BASE_P3_MIN + BASE_P3_DELTA * u
        p2 = BASE_P2_MIN + BASE_P2_DELTA * u

    if pct_val >= p3:
        return "Z3"
    if pct_val >= p2:
        return "Z2"
    return "Z1"


def export_2d_palette_csv(athlete_rows, percentages, csv_path, profile="base"):
    """
    Genera deterministicamente il CSV fallback della matrice 2D tramite classify_zone_2d
    cosi che i riempimenti statici combacino al 100% con la Formattazione Condizionale.
    """
    header = ["distanza"] + [p_name for p_name, _, _ in percentages]
    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerow(header)
        for dist_str, t100_val in athlete_rows:
            row_zones = [dist_str]
            for _, p_val, _ in percentages:
                t_calc = t100_val / p_val if t100_val > 0 else 0.0
                row_zones.append(classify_zone_2d(p_val, t_calc, profile=profile))
            writer.writerow(row_zones)


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
        c_s = ws[f"S{row}"]
        c_s.value = f'=IF($B{row}>0,A{row}/$B{row},"")'
        c_s.font = font_body
        c_s.alignment = align_center
        c_s.border = thin_border
        c_s.number_format = "0.00"

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
            # Le celle unite A4:B4, C4:D4 ed E6:F6 memorizzano il valore nella prima cella a sinistra (A4, C4, E6)
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


def _build_2d_cf_rules(anchor_cell, pct_header, profile):
    """
    Costruisce le 8 regole Excel 2D (OFF, Z7..Z1) per una coppia (cella attiva, header colonna).
    Usa IF(AND(ISNUMBER(...), ...), ..., FALSE) per prevenire errori LN su celle vuote.
    """
    valid_guard = f"AND(ISNUMBER({anchor_cell}),{anchor_cell}>0,ISNUMBER({pct_header}))"
    score_expr = (
        f"{SCORE_Z4_BASE}+MIN(1,({pct_header}-{HIGH_INT_MIN_PCT})/{HIGH_INT_SPAN_PCT})"
        f"*(MIN({S_MAX_CEIL},MAX({S_MAX_FLOOR},7-LN({anchor_cell}/{Z7_MAX_SECONDS})/{LN_ZONE_STEP}))-{SCORE_Z4_BASE})"
    )

    if profile == "400f":
        u_expr = f"MIN(1,MAX(0,LN({anchor_cell}/{W400_T0})/LN({W400_T_SPAN})))"
        z3_cond = f"{pct_header}>={W400_P3_MAX}-{W400_P3_DELTA}*{u_expr}"
        z2_cond = f"{pct_header}>={W400_P2_MAX}-{W400_P2_DELTA}*{u_expr}"
    else:
        u_expr = f"MIN(1,MAX(0,LN({anchor_cell}/{BASE_T0})/LN({BASE_T_SPAN})))"
        z3_cond = f"{pct_header}>={BASE_P3_MIN}+{BASE_P3_DELTA}*{u_expr}"
        z2_cond = f"{pct_header}>={BASE_P2_MIN}+{BASE_P2_DELTA}*{u_expr}"

    return [
        ("OFF", f"=OR(NOT(ISNUMBER({anchor_cell})),{anchor_cell}<=0)"),
        ("Z7", f"=IF({valid_guard},AND({pct_header}>={HIGH_INT_MIN_PCT},{score_expr}>=7),FALSE)"),
        ("Z6", f"=IF({valid_guard},AND({pct_header}>={HIGH_INT_MIN_PCT},{score_expr}>=6),FALSE)"),
        ("Z5", f"=IF({valid_guard},AND({pct_header}>={HIGH_INT_MIN_PCT},{score_expr}>=5),FALSE)"),
        ("Z4", f"=IF({valid_guard},{pct_header}>={HIGH_INT_MIN_PCT},FALSE)"),
        ("Z3", f"=IF({valid_guard},{z3_cond},FALSE)"),
        ("Z2", f"=IF({valid_guard},{z2_cond},FALSE)"),
        ("Z1", f"={valid_guard}"),
    ]


def apply_2d_zone_conditional_formatting(ws, palette, profile="base"):
    """
    Applica la Formattazione Condizionale 2D (Intensita x Durata) su B9:B21 e C9:R21
    su entrambi i fogli atleti, preservando bold=True sulla Colonna B.
    """
    ranges = [
        ("B9:B21", "B9", "B$8", True),
        ("C9:R21", "C9", "C$8", False),
    ]
    for target_range, anchor_cell, pct_header, force_bold in ranges:
        rules = _build_2d_cf_rules(anchor_cell, pct_header, profile=profile)
        for z_id, formula in rules:
            cfg = palette[z_id]
            fill = PatternFill(start_color=cfg["bg_hex"], end_color=cfg["bg_hex"], fill_type="solid")
            font = Font(
                name="Calibri",
                size=9,
                bold=True if force_bold else cfg["bold"],
                color=cfg["font_hex"],
            )
            ws.conditional_formatting.add(
                target_range,
                FormulaRule(formula=[formula], stopIfTrue=True, fill=fill, font=font),
            )
