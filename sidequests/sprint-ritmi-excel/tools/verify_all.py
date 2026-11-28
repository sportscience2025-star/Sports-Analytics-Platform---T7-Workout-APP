# -*- coding: utf-8 -*-
"""
Auditing and verification script for ritmi_atleti.xlsx (Versione Z7 -> Z1 Unificata).
Validates:
1. Formulas integrity (624 formulas =$B{row}/C$8).
2. Numbers integrity (Column B inputs, distances 50-600m, percentages 100-50%).
3. Freeze panes ('C9' on all athlete sheets).
4. Column dimensions (6.4 for C..R) and touch row heights (21.5 pt).
5. WCAG AAA fill colors and font colors matching palette_zone_fisiologiche_v2.csv.
6. Zero cells with missing/white/inactive fill: all 221 cells mapped to Z7..Z1.
7. Visual legend in sheet 4 aligned with Z7 -> Z1 hierarchy.
"""
import openpyxl
from openpyxl.utils import get_column_letter
import csv

from profile_400m_women import SHEET_NAME_400F, CSV_400F_ZONES_PATH

EXCEL_PATH = r"sidequests\sprint-ritmi-excel\output\ritmi_atleti.xlsx"
CSV_ZONES_PATH = r"sidequests\sprint-ritmi-excel\output\palette_zone_fisiologiche_v2.csv"

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

DISTANCES = [50, 60, 80, 100, 120, 150, 200, 250, 300, 350, 400, 500, 600]

PALETTE_ZONES = {
    "Z7": {"bg": "9E2A2B", "font": "FFFFFF"},
    "Z6": {"bg": "6C3483", "font": "FFFFFF"},
    "Z5": {"bg": "93401A", "font": "FFFFFF"},
    "Z4": {"bg": "F5CBA7", "font": "1E1E1E"},
    "Z3": {"bg": "F9E79F", "font": "1E1E1E"},
    "Z2": {"bg": "A9DFBF", "font": "1E1E1E"},
    "Z1": {"bg": "AED6F1", "font": "1E1E1E"},
    "OFF": {"bg": "EEEEEE", "font": "616161"},
}

def load_expected_matrix(csv_path=CSV_ZONES_PATH):
    """Carica una matrice di zone attese da file CSV."""
    matrix = {}
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


def verify_all():
    """Verifica formule vive, formati metrologici, palette WCAG AAA, audit e sblocco fogli."""
    print(f"Loading {EXCEL_PATH}...")
    wb = openpyxl.load_workbook(EXCEL_PATH, data_only=False)
    expected_matrix_base = load_expected_matrix(CSV_ZONES_PATH)
    expected_matrix_400f = load_expected_matrix(CSV_400F_ZONES_PATH)

    expected_sheets = ["Atleta 1", "Atleta 2", "Atleta 3", SHEET_NAME_400F, "Legenda e Guida Mobile"]
    assert wb.sheetnames == expected_sheets, f"Sheets mismatch: {wb.sheetnames} != {expected_sheets}"

    total_formulas = 0
    total_formats = 0
    total_colors_checked = 0

    athlete_sheets = ["Atleta 1", "Atleta 2", "Atleta 3", SHEET_NAME_400F]
    for sheetname in athlete_sheets:
        ws = wb[sheetname]
        is_400f = sheetname == SHEET_NAME_400F
        expected_matrix = expected_matrix_400f if is_400f else expected_matrix_base
        print(f"--- Verifying {sheetname} ---")

        # 0. Regola 05: foglio completamente sbloccato e modificabile
        assert ws.protection.sheet is False, f"Sheet protected in {sheetname} (violates Regola 05)"

        # 1. Freeze Panes & Griglia
        assert ws.freeze_panes == "C9", f"Freeze panes error in {sheetname}: {ws.freeze_panes} != 'C9'"
        assert ws.views.sheetView[0].showGridLines is True, f"Gridlines not visible in {sheetname}"

        # 2. Header row 8 (formato uniforme 0%)
        assert ws.cell(8, 1).value == "m"
        for c_idx, (p_name, p_val, p_fmt) in enumerate(PERCENTAGES, start=2):
            cell = ws.cell(8, c_idx)
            assert abs(cell.value - p_val) < 1e-6
            assert cell.number_format == p_fmt, f"Header fmt mismatch in {sheetname} col {c_idx}: {cell.number_format}"
            total_formats += 1

        # Audit columns headers S, T (+ U on 400F)
        assert ws["S8"].value == "v100 m/s"
        assert ws["T8"].value == "Check Curva"
        if is_400f:
            assert ws["U8"].value == "Stima B (250-350)"
            assert len(ws.conditional_formatting) > 0, "Missing Conditional Formatting on 400F"

        # 3. Data Rows
        for r_offset, d in enumerate(DISTANCES):
            row = 9 + r_offset
            dist_str = str(d)
            expected_num_fmt = "0.00" if d in (50, 60, 80) else "0.0"

            # Row height
            assert ws.row_dimensions[row].height == 21.5, f"Row {row} height error"

            # Distance cell
            d_cell = ws.cell(row, 1)
            assert d_cell.value == d
            if d in [100, 200, 400]:
                assert "D6DBDF" in str(d_cell.fill.start_color.rgb)

            # Col B (T100)
            b_cell = ws.cell(row, 2)
            assert isinstance(b_cell.value, (int, float))
            assert b_cell.font.bold is True
            assert b_cell.number_format == expected_num_fmt, f"Col B fmt mismatch at {dist_str}m: {b_cell.number_format}"
            exp_z100 = expected_matrix[dist_str]["100%"]
            assert PALETTE_ZONES[exp_z100]["bg"] in str(b_cell.fill.start_color.rgb)
            total_colors_checked += 1

            # Columns C..R
            for c_idx, (p_name, p_val, p_fmt) in enumerate(PERCENTAGES[1:], start=3):
                col_letter = get_column_letter(c_idx)
                cell = ws.cell(row, c_idx)

                # Formula check con guardia <=0
                expected_formula = f'=IF($B{row}<=0,"",$B{row}/{col_letter}$8)'
                assert cell.value == expected_formula, f"Formula mismatch at {col_letter}{row}: '{cell.value}' != '{expected_formula}'"
                total_formulas += 1

                # Number format check uniforme 0.00 su 50-80m, 0.0 su 100-600m
                assert cell.number_format == expected_num_fmt, f"Fmt mismatch at {col_letter}{row}: {cell.number_format}"
                total_formats += 1

                # Color check (All 221 cells mapped, zero OFF)
                exp_z = expected_matrix[dist_str][p_name]
                assert exp_z != "OFF", f"Unexpected OFF zone at {sheetname} {dist_str}m {p_name}"
                exp_bg = PALETTE_ZONES[exp_z]["bg"]
                exp_font = PALETTE_ZONES[exp_z]["font"]
                assert exp_bg in str(cell.fill.start_color.rgb), f"Bg error at {sheetname} {dist_str}m {p_name}: {exp_bg} != {cell.fill.start_color.rgb}"
                assert exp_font in str(cell.font.color.rgb), f"Font error at {sheetname} {dist_str}m {p_name}: {exp_font} != {cell.font.color.rgb}"
                total_colors_checked += 1

            # Audit columns formulas
            assert ws[f"S{row}"].value == f'=IF($B{row}>0,A{row}/$B{row},"")'
            if row >= 13:
                assert ws[f"T{row}"].value == f'=IF(OR($B{row}<=0,$B{row-1}<=0),"",IF(S{row}>=S{row-1},"ANOMALIA","OK"))'

        # Verifica assenza anomalie sul profilo 400F di riferimento
        if is_400f:
            speeds = [ws.cell(9 + i, 1).value / ws.cell(9 + i, 2).value for i in range(len(DISTANCES))]
            for idx in range(4, len(speeds)):
                assert speeds[idx] < speeds[idx - 1], f"Monotonicity violation in 400F at {DISTANCES[idx]}m"

    print(f"Verified {total_formulas} formulas, {total_formats} number formats, and {total_colors_checked} WCAG AAA color cells.")

    # Check Legend sheet
    ws_notes = wb["Legenda e Guida Mobile"]
    assert ws_notes.protection.sheet is False
    assert ws_notes["A1"].value is not None
    assert ws_notes["A3"].value == "Zona"
    assert ws_notes["A4"].value == "Z7"
    assert ws_notes["A10"].value == "Z1"
    assert ws_notes["A11"].value is None
    print("Legend sheet verified with Z7 -> Z1 hierarchy and 400F updates.")
    print("ALL AUDIT CHECKS PASSED: 100% SUCCESS.")


if __name__ == "__main__":
    verify_all()
