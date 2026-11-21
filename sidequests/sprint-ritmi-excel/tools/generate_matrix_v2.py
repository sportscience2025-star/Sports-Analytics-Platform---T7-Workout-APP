# -*- coding: utf-8 -*-
"""
Generatore della matrice fisiologica unificata completa a 7 Zone (Z1 -> Z7),
senza alcuna cella bianca o disattivata, mantenendo rigorosamente al 100%
le formule Excel vive =$B{riga}/C$8 e i valori numerici.
"""
import csv

DISTANCES = ["50", "60", "80", "100", "120", "150", "200", "250", "300", "350", "400", "500", "600"]
PERCENTAGES = ["100%", "98%", "95%", "93%", "90,0%", "88%", "85%", "83%", "80,0%", "78%", "75%", "73%", "70,0%", "65%", "60,0%", "55%", "50,0%"]

def get_zone_id(d_int, p_float):
    """
    Ritorna la zona fisiologica da Z1 a Z7 secondo la gerarchia:
    Z7: Velocita Massima & Accel. Alattacida (50-80m @ 95-100%)
    Z6: Potenza Lattacida & Speed Endurance (100-150m @ 95-100%, 50-80m @ 90-93%)
    Z5: Special Endurance 1 (150-300m @ 90-98%, 100-120m @ 88-93%)
    Z4: Special Endurance 2 (300-600m @ 85-98%)
    Z3: Intensive Tempo (50-250m @ 78-88%, 300-600m @ 75-83%)
    Z2: Extensive Tempo & Allunghi Tecnici (50-600m @ 65-75%)
    Z1: Rigenerazione Aerobica & Scarico Attivo (50-600m @ 50-60%)
    """
    # 1. Zona 7: Velocita Massima Alattacida
    if d_int <= 80 and p_float >= 0.95:
        return "Z7"
        
    # 2. Zona 6: Potenza Lattacida & Speed Endurance
    if (d_int <= 80 and p_float >= 0.90) or (100 <= d_int <= 150 and p_float >= 0.95):
        return "Z6"
        
    # 3. Zona 5: Special Endurance 1 (SE1)
    if (100 <= d_int <= 120 and 0.88 <= p_float <= 0.93) or \
       (150 <= d_int <= 250 and p_float >= 0.90) or \
       (d_int == 300 and p_float >= 0.90):
        return "Z5"
        
    # 4. Zona 4: Special Endurance 2 (SE2)
    if (d_int == 300 and 0.85 <= p_float <= 0.88) or \
       (d_int >= 350 and p_float >= 0.85):
        return "Z4"
        
    # 5. Zona 3: Intensive Tempo & Ritmo Tecnico (include 80m @ 83% e 60-100m @ 78-88%)
    if (d_int <= 250 and 0.78 <= p_float <= 0.88) or \
       (d_int >= 300 and 0.75 <= p_float <= 0.83):
        return "Z3"
        
    # 6. Zona 2: Extensive Tempo & Allunghi Tecnici di Riscaldamento (65-75%)
    if 0.65 <= p_float <= 0.75:
        return "Z2"
        
    # 7. Zona 1: Rigenerazione Aerobica & Scarico Attivo su Erba (50-60%)
    return "Z1"

def generate_csv():
    rows = [["distanza"] + PERCENTAGES]
    pct_map = {
        "100%": 1.00, "98%": 0.98, "95%": 0.95, "93%": 0.93, "90,0%": 0.90,
        "88%": 0.88, "85%": 0.85, "83%": 0.83, "80,0%": 0.80, "78%": 0.78,
        "75%": 0.75, "73%": 0.73, "70,0%": 0.70, "65%": 0.65, "60,0%": 0.60,
        "55%": 0.55, "50,0%": 0.50
    }
    
    for d_str in DISTANCES:
        d_val = int(d_str)
        row = [d_str]
        for p_name in PERCENTAGES:
            p_val = pct_map[p_name]
            zid = get_zone_id(d_val, p_val)
            row.append(zid)
        rows.append(row)
        
    out_csv = "sidequests/sprint-ritmi-excel/output/palette_zone_fisiologiche_v2.csv"
    with open(out_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerows(rows)
    print(f"Matrice unificata salvata in: {out_csv}")

if __name__ == "__main__":
    generate_csv()
