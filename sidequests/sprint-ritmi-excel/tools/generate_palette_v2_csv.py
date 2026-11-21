# -*- coding: utf-8 -*-
"""
Generazione della nuova matrice fisiologica v2 (palette_zone_fisiologiche_v2.csv)
con nomenclatura invertita Z7 -> Z1 e correzione submassimali 60-100m.
"""

import csv
import os

PERCENTAGES = [
    "100%", "98%", "95%", "93%", "90,0%", "88%", "85%", "83%", "80,0%", 
    "78%", "75%", "73%", "70,0%", "65%", "60,0%", "55%", "50,0%"
]

DISTANCES = ["50", "60", "80", "100", "120", "150", "200", "250", "300", "350", "400", "500", "600"]

def get_zone_v2(dist_str, pct_str):
    d = int(dist_str)
    p = float(pct_str.replace("%", "").replace(",", "."))
    
    # 50m, 60m, 80m (Sprint brevissimo)
    if d in [50, 60, 80]:
        if p >= 95.0:
            return "Z7_MAX_VELOCITY"
        elif p >= 90.0:
            return "Z6_LACTIC_POWER"
        elif p >= 78.0:
            return "Z3_INTENSIVE_TEMPO"
        elif p >= 70.0:
            return "Z2_EXTENSIVE_TEMPO"
        else: # <= 65%
            return "Z_INACTIVE"
            
    # 100m, 120m (Sprint breve prolungato)
    if d in [100, 120]:
        if p >= 95.0:
            return "Z6_LACTIC_POWER"
        elif p >= 88.0:
            return "Z5_SPECIAL_END_1"
        elif p >= 78.0:
            return "Z3_INTENSIVE_TEMPO"
        elif p >= 70.0:
            return "Z2_EXTENSIVE_TEMPO"
        else: # <= 65%
            return "Z_INACTIVE"
            
    # 150m (Transizione 18s)
    if d == 150:
        if p >= 95.0:
            return "Z6_LACTIC_POWER"
        elif p >= 90.0:
            return "Z5_SPECIAL_END_1"
        elif p >= 78.0:
            return "Z3_INTENSIVE_TEMPO"
        elif p >= 65.0:
            return "Z2_EXTENSIVE_TEMPO"
        else:
            return "Z1_AEROBIC_RECOVERY"
            
    # 200m, 250m (Velocità prolungata)
    if d in [200, 250]:
        if p >= 90.0:
            return "Z5_SPECIAL_END_1"
        elif p >= 78.0:
            return "Z3_INTENSIVE_TEMPO"
        elif p >= 65.0:
            return "Z2_EXTENSIVE_TEMPO"
        else:
            return "Z1_AEROBIC_RECOVERY"
            
    # 300m (Cerniera fisiologica 40s)
    if d == 300:
        if p >= 90.0:
            return "Z5_SPECIAL_END_1"
        elif p >= 85.0:
            return "Z4_SPECIAL_END_2"
        elif p >= 75.0:
            return "Z3_INTENSIVE_TEMPO"
        elif p >= 65.0:
            return "Z2_EXTENSIVE_TEMPO"
        else:
            return "Z1_AEROBIC_RECOVERY"
            
    # 350m, 400m, 500m, 600m (Resistenza alla velocità / Mezzofondo veloce)
    if d >= 350:
        if p >= 85.0:
            return "Z4_SPECIAL_END_2"
        elif p >= 75.0:
            return "Z3_INTENSIVE_TEMPO"
        elif p >= 65.0:
            return "Z2_EXTENSIVE_TEMPO"
        else:
            return "Z1_AEROBIC_RECOVERY"

def generate_csv_v2(output_path):
    rows = []
    header = ["distanza"] + PERCENTAGES
    rows.append(header)
    
    zone_counts = {}
    
    for dist_str in DISTANCES:
        row = [dist_str]
        for pct_str in PERCENTAGES:
            zid = get_zone_v2(dist_str, pct_str)
            row.append(zid)
            zone_counts[zid] = zone_counts.get(zid, 0) + 1
        rows.append(row)
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerows(rows)
        
    print(f"Matrice v2 generata con successo in: {output_path}")
    print("\nDistribuzione celle:")
    total_cells = sum(zone_counts.values())
    for zid, count in sorted(zone_counts.items()):
        pct = (count / total_cells) * 100
        print(f"  {zid:<20}: {count:>3} celle ({pct:>5.1f}%)")
    print(f"  Totale: {total_cells} celle\n")

if __name__ == "__main__":
    out_csv = "sidequests/sprint-ritmi-excel/output/palette_zone_fisiologiche_v2.csv"
    generate_csv_v2(out_csv)
