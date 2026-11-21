# -*- coding: utf-8 -*-
import openpyxl
import csv
import os

wb = openpyxl.load_workbook("sidequests/sprint-ritmi-excel/output/ritmi_atleti.xlsx", data_only=True)
os.makedirs("sidequests/sprint-ritmi-excel/output/tabelle_estese", exist_ok=True)

headers_pct = ["100%", "98%", "95%", "93%", "90,0%", "88%", "85%", "83%", "80,0%", "78%", "75%", "73%", "70,0%", "65%", "60,0%", "55%", "50,0%"]
col_headers = ["m"] + headers_pct

for sheet_name in ["Atleta 1", "Atleta 2", "Atleta 3"]:
    ws = wb[sheet_name]
    csv_rows = [col_headers]
    for r in range(9, ws.max_row + 1):
        dist = ws.cell(row=r, column=1).value
        row_vals = [dist]
        for c in range(2, 19):
            val = ws.cell(row=r, column=c).value
            if val is not None:
                if dist == 50 and c == 9: # 50m @ 83%
                    formatted = f"{val:.2f}".replace(".", ",")
                else:
                    formatted = f"{val:.1f}".replace(".", ",")
            else:
                formatted = ""
            row_vals.append(formatted)
        csv_rows.append(row_vals)
        
    safe_name = sheet_name.lower().replace(" ", "_")
    out_csv = f"sidequests/sprint-ritmi-excel/output/tabelle_estese/{safe_name}_esteso.csv"
    with open(out_csv, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerows(csv_rows)
    print(f"Esportato: {out_csv} ({len(csv_rows)-1} distanze)")
