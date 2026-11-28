# -*- coding: utf-8 -*-
"""
Auditing and verification script for ritmi_atleti.xlsx (3 Fogli + Regole 2D Continue).
Validates:
1. Exact 3-sheet structure: ['Atleta 1', '400m Donne (20-25)', 'Legenda e Guida Mobile'].
2. Formulas integrity (416 live formulas =IF($B{row}<=0,"",$B{row}/{col}$8)).
3. Metrological consistency: '0.00' on 50-80m, '0.0' on 100-600m, '0%' on row 8.
4. Unlocked sheets (Regola 05: ws.protection.sheet is False) and Freeze Panes 'C9'.
5. 2D Conditional Formatting rules on BOTH athlete sheets (using both duration & intensity).
6. Static fill/font WCAG AAA parity with classify_zone_2d and aligned fallback CSVs.
7. Zero zone jumps >= 2 across ALL 13 rows on Atleta 1, 400m Donne (ref 12.0s) and user test 100m=11.6s.
"""
import csv
import openpyxl
from openpyxl.utils import get_column_letter

from profile_400m_women import (
    SHEET_NAME_400F,
    CSV_BASE_ZONES_PATH,
    CSV_400F_ZONES_PATH,
    classify_zone_2d,
)

EXCEL_PATH = r"sidequests\sprint-ritmi-excel\output\ritmi_atleti.xlsx"

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

ZONE_ORDER_NUM = {"Z7": 7, "Z6": 6, "Z5": 5, "Z4": 4, "Z3": 3, "Z2": 2, "Z1": 1}


def load_expected_matrix(csv_path):
    """Carica la matrice di zone attese da file CSV fallback."""
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


def assert_row_continuity(zones_row, label):
    """Verifica monotonicita non-crescente e assenza di salti >= 2 zone lungo una riga."""
    for idx in range(len(zones_row) - 1):
        z_cur = ZONE_ORDER_NUM[zones_row[idx]]
        z_nxt = ZONE_ORDER_NUM[zones_row[idx + 1]]
        diff = z_cur - z_nxt
        assert 0 <= diff <= 1, (
            f"Jump violation in {label} between col {idx} ({zones_row[idx]}) "
            f"and col {idx+1} ({zones_row[idx+1]}): diff={diff}"
        )


def verify_all():
    """Esegue l'audit completo del workbook ritmi_atleti.xlsx a 3 fogli."""
    print(f"Loading {EXCEL_PATH}...")
    wb = openpyxl.load_workbook(EXCEL_PATH, data_only=False)
    expected_matrix_base = load_expected_matrix(CSV_BASE_ZONES_PATH)
    expected_matrix_400f = load_expected_matrix(CSV_400F_ZONES_PATH)

    expected_sheets = ["Atleta 1", SHEET_NAME_400F, "Legenda e Guida Mobile"]
    assert wb.sheetnames == expected_sheets, f"Sheets mismatch: {wb.sheetnames} != {expected_sheets}"

    total_formulas = 0
    total_formats = 0
    total_colors_checked = 0

    for sheetname in ["Atleta 1", SHEET_NAME_400F]:
        ws = wb[sheetname]
        is_400f = sheetname == SHEET_NAME_400F
        profile = "400f" if is_400f else "base"
        expected_matrix = expected_matrix_400f if is_400f else expected_matrix_base
        print(f"--- Verifying {sheetname} (profile={profile}) ---")

        # 1. Regola 05 & Freeze Panes
        assert ws.protection.sheet is False, f"Sheet protected in {sheetname}"
        assert ws.freeze_panes == "C9", f"Freeze panes error in {sheetname}: {ws.freeze_panes}"
        assert ws.views.sheetView[0].showGridLines is True

        # 2. Formattazione Condizionale 2D presente su B9:B21 e C9:R21 in ENTRAMBI i fogli
        cf_sqrefs = {str(cf.sqref) for cf in ws.conditional_formatting}
        assert "B9:B21" in cf_sqrefs and "C9:R21" in cf_sqrefs, f"Missing 2D CF ranges in {sheetname}: {cf_sqrefs}"
        for cf in ws.conditional_formatting:
            assert len(cf.rules) == 8, f"Expected 8 CF rules (OFF + Z7..Z1), got {len(cf.rules)}"
            anchor = "B9" if str(cf.sqref) == "B9:B21" else "C9"
            pct_ref = "B$8" if str(cf.sqref) == "B9:B21" else "C$8"
            for rule in cf.rules[1:-1]:
                assert rule.stopIfTrue is True
                formula_txt = rule.formula[0]
                assert anchor in formula_txt and pct_ref in formula_txt, (
                    f"CF rule not 2D in {sheetname} {cf.sqref}: {formula_txt}"
                )

        # 3. Header riga 8
        assert ws.cell(8, 1).value == "m"
        for c_idx, (p_name, p_val, p_fmt) in enumerate(PERCENTAGES, start=2):
            cell = ws.cell(8, c_idx)
            assert abs(cell.value - p_val) < 1e-6
            assert cell.number_format == p_fmt
            total_formats += 1

        # Audit columns S, T (+ U su 400F)
        assert ws["S8"].value == "v100 m/s"
        assert ws["T8"].value == "Check Curva"
        if is_400f:
            assert ws["U8"].value == "Stima B (250-350)"
            assert ws["A6"].value == '=IF(AND(A4>0,C4>0),C4-2*A4,"")'
            assert ws["C6"].value == '=IF(A4>0,A4+1.5,"")'
            assert ws["E6"].value == '=IF(AND(A4>0,C4>0),LN(C4/A4)/LN(2),"")'
            assert ws["G6"].value == '=IF(AND(E4>0,G4>0),G4/E4,"")'
            assert ws["U16"].value == '=IF(AND($A$4>0,$C$4>0),$A$4*(A16/200)^$E$6,"")'

        # 4. Data rows 9..21
        for r_offset, d in enumerate(DISTANCES):
            row = 9 + r_offset
            dist_str = str(d)
            expected_num_fmt = "0.00" if d in (50, 60, 80) else "0.0"
            assert ws.row_dimensions[row].height == 21.5

            b_cell = ws.cell(row, 2)
            t100_val = b_cell.value
            assert isinstance(t100_val, (int, float))
            assert b_cell.font.bold is True
            assert b_cell.number_format == expected_num_fmt

            row_zones = []
            z100 = classify_zone_2d(1.0, t100_val, profile=profile)
            assert z100 == expected_matrix[dist_str]["100%"]
            assert PALETTE_ZONES[z100]["bg"] in str(b_cell.fill.start_color.rgb)
            row_zones.append(z100)
            total_colors_checked += 1

            for c_idx, (p_name, p_val, _) in enumerate(PERCENTAGES[1:], start=3):
                col_letter = get_column_letter(c_idx)
                cell = ws.cell(row, c_idx)
                expected_formula = f'=IF($B{row}<=0,"",$B{row}/{col_letter}$8)'
                assert cell.value == expected_formula
                total_formulas += 1
                assert cell.number_format == expected_num_fmt
                total_formats += 1

                t_calc = t100_val / p_val
                z_2d = classify_zone_2d(p_val, t_calc, profile=profile)
                assert z_2d == expected_matrix[dist_str][p_name], (
                    f"CSV mismatch at {sheetname} {dist_str}m {p_name}: {z_2d} != {expected_matrix[dist_str][p_name]}"
                )
                assert PALETTE_ZONES[z_2d]["bg"] in str(cell.fill.start_color.rgb)
                assert PALETTE_ZONES[z_2d]["font"] in str(cell.font.color.rgb)
                row_zones.append(z_2d)
                total_colors_checked += 1

            # Zero salti >= 2 zone lungo tutta la riga
            assert_row_continuity(row_zones, f"{sheetname} {dist_str}m")

            # Verifica esplicita anti-regressione 100m @ 85% -> 83% e 50m @ 85% -> 83%
            if d == 100:
                assert row_zones[6] == "Z4" and row_zones[7] == "Z3", f"100m 85%->83% error: {row_zones[6:8]}"
            if d == 50:
                assert row_zones[6] == "Z4" and row_zones[7] == "Z3", f"50m 85%->83% error: {row_zones[6:8]}"

    # 5. Test regressione esplicito sul caso utente 100m = 11.6s (400F)
    user_100m_zones = [classify_zone_2d(p_val, 11.6 / p_val, profile="400f") for _, p_val, _ in PERCENTAGES]
    assert_row_continuity(user_100m_zones, "User test 400F 100m=11.6s")
    assert user_100m_zones[6] == "Z4" and user_100m_zones[7] == "Z3", (
        f"User 11.6s 85%->83% regression: {user_100m_zones[6:8]}"
    )

    print(f"Verified {total_formulas} formulas, {total_formats} number formats, and {total_colors_checked} WCAG AAA color cells.")

    # 6. Legenda e Guida Mobile
    ws_notes = wb["Legenda e Guida Mobile"]
    assert ws_notes.protection.sheet is False
    assert ws_notes["A3"].value == "Zona"
    assert ws_notes["A4"].value == "Z7"
    assert ws_notes["A10"].value == "Z1"
    assert ws_notes["A11"].value is None
    print("Legend sheet verified (3-sheet structure + 2D continuous rules).")
    print("ALL AUDIT CHECKS PASSED: 100% SUCCESS.")


if __name__ == "__main__":
    verify_all()
