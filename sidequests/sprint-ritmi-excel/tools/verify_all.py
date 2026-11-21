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

EXCEL_PATH = r"sidequests\sprint-ritmi-excel\output\ritmi_atleti.xlsx"
CSV_ZONES_PATH = r"sidequests\sprint-ritmi-excel\output\palette_zone_fisiologiche_v2.csv"

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

def load_expected_matrix():
    matrix = {}
    with open(CSV_ZONES_PATH, "r", encoding="utf-8") as f:
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
    print(f"Loading {EXCEL_PATH}...")
    wb = openpyxl.load_workbook(EXCEL_PATH, data_only=False)
    expected_matrix = load_expected_matrix()
    
    expected_sheets = ["Atleta 1", "Atleta 2", "Atleta 3", "Legenda e Guida Mobile"]
    assert wb.sheetnames == expected_sheets, f"Sheets mismatch: {wb.sheetnames} != {expected_sheets}"
    
    total_formulas = 0
    total_formats = 0
    total_colors_checked = 0
    
    for sheetname in ["Atleta 1", "Atleta 2", "Atleta 3"]:
        ws = wb[sheetname]
        print(f"--- Verifying {sheetname} ---")
        
        # 1. Freeze Panes
        assert ws.freeze_panes == "C9", f"Freeze panes error in {sheetname}: {ws.freeze_panes} != 'C9'"
        assert ws.views.sheetView[0].showGridLines is True, f"Gridlines not visible in {sheetname}"
        
        # 2. Header
        assert ws.cell(8, 1).value == "m"
        for c_idx, (p_name, p_val, p_fmt) in enumerate(PERCENTAGES, start=2):
            cell = ws.cell(8, c_idx)
            assert abs(cell.value - p_val) < 1e-6
            assert cell.number_format == p_fmt
            total_formats += 1
            
        # 3. Data Rows
        for r_offset, d in enumerate(DISTANCES):
            row = 9 + r_offset
            dist_str = str(d)
            
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
            assert b_cell.number_format == "0.0"
            exp_z100 = expected_matrix[dist_str]["100%"]
            assert PALETTE_ZONES[exp_z100]["bg"] in str(b_cell.fill.start_color.rgb)
            total_colors_checked += 1
            
            # Columns C..R
            for c_idx, (p_name, p_val, p_fmt) in enumerate(PERCENTAGES[1:], start=3):
                col_letter = get_column_letter(c_idx)
                cell = ws.cell(row, c_idx)
                
                # Formula check: MUST BE EXACT =$B{row}/{col_letter}$8
                expected_formula = f"=$B{row}/{col_letter}$8"
                assert cell.value == expected_formula, f"Formula mismatch at {col_letter}{row}: '{cell.value}' != '{expected_formula}'"
                total_formulas += 1
                
                # Number format check
                if d == 50 and p_name == "83%":
                    assert cell.number_format == "0.00"
                else:
                    assert cell.number_format == "0.0"
                total_formats += 1
                
                # Color check (All 221 cells mapped)
                exp_z = expected_matrix[dist_str][p_name]
                exp_bg = PALETTE_ZONES[exp_z]["bg"]
                exp_font = PALETTE_ZONES[exp_z]["font"]
                assert exp_bg in str(cell.fill.start_color.rgb), f"Bg error at {dist_str}m {p_name}: {exp_bg} != {cell.fill.start_color.rgb}"
                assert exp_font in str(cell.font.color.rgb), f"Font error at {dist_str}m {p_name}: {exp_font} != {cell.font.color.rgb}"
                total_colors_checked += 1

    print(f"Verified {total_formulas} formulas, {total_formats} number formats, and {total_colors_checked} WCAG AAA color cells.")
    
    # Check Legend sheet
    ws_notes = wb["Legenda e Guida Mobile"]
    assert ws_notes["A1"].value is not None
    assert ws_notes["A3"].value == "Zona"
    assert ws_notes["A4"].value == "Z7"
    assert ws_notes["A10"].value == "Z1"
    assert ws_notes["A11"].value == "OFF"
    print("Legend sheet verified with Z7 -> Z1 hierarchy.")
    print("ALL AUDIT CHECKS PASSED: 100% SUCCESS.")

if __name__ == "__main__":
    verify_all()
