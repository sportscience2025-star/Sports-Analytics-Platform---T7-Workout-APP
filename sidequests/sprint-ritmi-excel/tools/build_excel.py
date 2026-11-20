# -*- coding: utf-8 -*-
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Colors from palette
from generate_palette_csv import get_zone_color, COLORS

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

# Athlete data for manual column B (T100)
# (distance, t100)
ATHLETE_DATA = {
    "Atleta 1": [
        ("50", 5.9),
        ("60", 6.9),
        ("80", 8.8),
        ("100", 10.8),
        ("120", 13.4),
        ("150", 16.9),
        ("200", 23.1),
        ("250", 32.5),
    ],
    "Atleta 2": [
        ("50", 6.0),
        ("60", 7.0),
        ("80", 9.1),
        ("100", 11.1),
        ("120", 13.6),
        ("150", 17.6),
        ("200", 23.6),
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
        ("300", 40.5),
    ]
}

def create_workbook():
    wb = openpyxl.Workbook()
    # Remove default sheet
    default_sheet = wb.active
    wb.remove(default_sheet)
    
    # Styles
    font_header = Font(name="Calibri", size=10, bold=False)
    font_header_bold = Font(name="Calibri", size=10, bold=True)
    font_data = Font(name="Calibri", size=9, bold=False)
    font_b_input = Font(name="Calibri", size=9, bold=True) # Distinct style for manual input
    
    align_center = Alignment(horizontal="center", vertical="center")
    
    thin_border_side = Side(border_style="thin", color="B0B0B0")
    thin_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
    
    # Header border: slightly darker bottom
    header_border_side_bottom = Side(border_style="medium", color="808080")
    header_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=header_border_side_bottom)
    
    # Input border for Col B: medium left and right border to emphasize input column
    b_input_side = Side(border_style="medium", color="404040")
    b_input_border = Border(left=b_input_side, right=b_input_side, top=thin_border_side, bottom=thin_border_side)

    fill_header = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")
    fill_grey_col_a = PatternFill(start_color="BFBFBF", end_color="BFBFBF", fill_type="solid")
    fill_white = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")

    for athlete_name, rows_data in ATHLETE_DATA.items():
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
            # Grey cell on 100m and 200m
            if dist_str in ["100", "200"]:
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
            
            # Columns C..R: Dynamic Formulas
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

    out_file = "sidequests/sprint-ritmi-excel/output/ritmi_atleti.xlsx"
    wb.save(out_file)
    print(f"File salvato con successo in: {out_file}")

if __name__ == "__main__":
    create_workbook()
