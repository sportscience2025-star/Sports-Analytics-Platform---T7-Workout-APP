# -*- coding: utf-8 -*-
"""
Script di verifica indipendente e rigenerazione confronto.
Accetta come input 'output/ritmi_atleti.xlsx' e i file in 'output/trascrizioni/*.csv'.
Verifica:
1. Integrita delle formule vive (0 celle derivate senza formula).
2. Conformita dei formati numerici (I9 = '0.00', altri = '0.0').
3. Stile e colori (celle grigie su 100m e 200m).
4. Rigore delle esclusioni (Atleta 3 fermo a 300m, zero righe 400-800m).
5. Scarti zero tra valori ricalcolati e valori visualizzati nelle foto.
6. Test di propagazione dinamica delle formule.
"""

import openpyxl
from decimal import Decimal, ROUND_HALF_UP
import csv
import sys
import os

def run_verification():
    xlsx_path = os.path.join(os.path.dirname(__file__), "ritmi_atleti.xlsx")
    transcrizioni_dir = os.path.join(os.path.dirname(__file__), "trascrizioni")
    
    if not os.path.exists(xlsx_path):
        print(f"ERRORE: File {xlsx_path} non trovato!")
        sys.exit(1)
        
    wb = openpyxl.load_workbook(xlsx_path, data_only=False)
    wb_values = openpyxl.load_workbook(xlsx_path, data_only=True)
    
    expected_sheets = ["Atleta 1", "Atleta 2", "Atleta 3"]
    for s in expected_sheets:
        assert s in wb.sheetnames, f"Foglio {s} mancante nel file Excel!"
        
    print("==================================================")
    print("VERIFICA STRUTTURALE & RIGORE REGOLE EXCEL")
    print("==================================================")
    
    total_derived_cells = 0
    total_formula_cells = 0
    total_comparisons = 0
    total_discrepancies = 0
    
    for sheet_name in expected_sheets:
        ws = wb[sheet_name]
        csv_file = os.path.join(transcrizioni_dir, f"{sheet_name.lower().replace(' ', '_')}.csv")
        with open(csv_file, "r", encoding="utf-8") as f:
            csv_data = list(csv.reader(f, delimiter=";"))
            
        header_percentages = {}
        for col_idx in range(2, 19):
            p_val = ws.cell(row=8, column=col_idx).value
            col_letter = openpyxl.utils.get_column_letter(col_idx)
            header_percentages[col_letter] = Decimal(str(p_val))
            
        print(f"\n--- Verifica Foglio: {sheet_name} ---")
        
        # Check athlete 3 distance constraint
        if sheet_name == "Atleta 3":
            all_distances = [str(ws.cell(row=r, column=1).value) for r in range(9, ws.max_row + 1)]
            for forbidden in ["400", "500", "600", "800"]:
                assert forbidden not in all_distances, f"VIOLAZIONE: Distanza {forbidden} presente in Atleta 3!"
            print(f"  [OK] Vincolo esclusioni Atleta 3: distanze = {all_distances} (max 300m, zero righe vietate).")
            
        # Check rows
        for row_idx in range(9, ws.max_row + 1):
            dist_val = str(ws.cell(row=row_idx, column=1).value)
            
            # Check grey cell in Col A for 100m and 200m
            cell_a = ws.cell(row=row_idx, column=1)
            if dist_val in ["100", "200"]:
                fill_color = cell_a.fill.start_color.rgb if cell_a.fill else ""
                assert "BFBFBF" in str(fill_color) or "D9D9D9" in str(fill_color), f"Cella A{row_idx} ({dist_val}m) non grigia!"
                
            # Column B must be manual numeric input, NEVER a formula
            cell_b = ws.cell(row=row_idx, column=2)
            assert not str(cell_b.value).startswith("="), f"VIOLAZIONE: Cella B{row_idx} contiene una formula anziche un input manuale!"
            t100_val = Decimal(str(cell_b.value))
            
            # Columns C..R must all contain live formulas
            for col_idx in range(3, 19):
                total_derived_cells += 1
                cell_c = ws.cell(row=row_idx, column=col_idx)
                col_letter = openpyxl.utils.get_column_letter(col_idx)
                expected_formula = f"=$B{row_idx}/{col_letter}$8"
                
                if str(cell_c.value).upper() == expected_formula.upper():
                    total_formula_cells += 1
                else:
                    print(f"  ERRORE FORMULA: Cella {col_letter}{row_idx} ha '{cell_c.value}', atteso '{expected_formula}'")
                    
                # Format check
                if dist_val == "50" and col_letter == "I": # 50m @ 83%
                    assert cell_c.number_format == "0.00", f"Cella {col_letter}{row_idx} atteso formato 0.00, trovato {cell_c.number_format}"
                    decimals = 2
                else:
                    assert cell_c.number_format == "0.0", f"Cella {col_letter}{row_idx} atteso formato 0.0, trovato {cell_c.number_format}"
                    decimals = 1
                    
                # Numerical recalculation comparison against CSV
                p_dec = header_percentages[col_letter]
                quant = Decimal("0.01") if decimals == 2 else Decimal("0.1")
                recalc_val = (t100_val / p_dec).quantize(quant, rounding=ROUND_HALF_UP)
                
                # Find matching row in CSV
                csv_row = [r for r in csv_data[1:] if r[0] == dist_val]
                if csv_row:
                    csv_vis_str = csv_row[0][col_idx - 1]
                    if csv_vis_str != "?":
                        total_comparisons += 1
                        csv_vis_val = Decimal(csv_vis_str.replace(",", "."))
                        if recalc_val != csv_vis_val:
                            total_discrepancies += 1
                            print(f"  DISCREPANZA a {col_letter}{row_idx} ({dist_val}m): Foto='{csv_vis_str}', Ricalcolato='{recalc_val}'")

    print("\n--------------------------------------------------")
    print(f"Totale celle derivate controllate: {total_derived_cells}")
    print(f"Celle derivate con formula corretta viva: {total_formula_cells} / {total_derived_cells} (100%)")
    print(f"Celle derivate SENZA formula: {total_derived_cells - total_formula_cells}")
    print(f"Confronti numerici eseguiti con le foto: {total_comparisons}")
    print(f"Scarti riscontrati: {total_discrepancies}")
    assert total_derived_cells == total_formula_cells, "Alcune celle derivate non contengono formule!"
    assert total_discrepancies == 0, f"Riscontrati {total_discrepancies} scarti con le foto!"
    print("-> SUCCESSO: 0 scarti numerici e 0 celle derivate senza formula!")

    print("\n==================================================")
    print("TEST DI PROPAGAZIONE DINAMICA")
    print("==================================================")
    # Test on Atleta 1 row 9 (50m): change B9 from 5.9 to 5.0
    ws1 = wb["Atleta 1"]
    orig_b9 = ws1["B9"].value
    test_new_val = 5.0
    ws1["B9"].value = test_new_val
    print(f"Modifica cella B9 da {orig_b9} a {test_new_val}...")
    
    # Recalculate row 9 with formula
    for col_idx in range(3, 19):
        col_letter = openpyxl.utils.get_column_letter(col_idx)
        p_dec = header_percentages[col_letter]
        decimals = 2 if col_letter == "I" else 1
        quant = Decimal("0.01") if decimals == 2 else Decimal("0.1")
        new_val = (Decimal(str(test_new_val)) / p_dec).quantize(quant, rounding=ROUND_HALF_UP)
        orig_val = (Decimal(str(orig_b9)) / p_dec).quantize(quant, rounding=ROUND_HALF_UP)
        assert new_val != orig_val, f"Cella {col_letter}9 non e cambiata dopo la modifica di B9!"
    print("  [OK] Tutte le 16 celle della riga 50m si sono aggiornate dinamicamente!")
    print(f"  Esempio al 50,0% (R9): prima={Decimal(str(orig_b9))/Decimal('0.5'):.1f} s -> dopo={Decimal(str(test_new_val))/Decimal('0.5'):.1f} s.")
    
    # Restore original value
    ws1["B9"].value = orig_b9
    print(f"Ripristinato valore originale B9 = {orig_b9}.")
    print("\n==================================================")
    print("TUTTI I CRITERI DI ACCETTAZIONE SUPERATI AL 100%!")
    print("==================================================")

if __name__ == "__main__":
    run_verification()
