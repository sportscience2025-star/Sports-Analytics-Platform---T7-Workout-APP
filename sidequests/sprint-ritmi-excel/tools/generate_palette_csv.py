# -*- coding: utf-8 -*-
import csv

# Palette colors (hex)
COLORS = {
    "HEADER": "FFFFFF",
    "GREY_COL_A": "BFBFBF",
    "DARK_RED": "793B2E",      # Zone 1: Neural max sprint (50-80m @ 95-100%)
    "RED_ORANGE": "B24A2D",    # Zone 2: Lactic speed max (100-300m @ 95-100% & 80m @ 95%)
    "ORANGE": "ECA62D",        # Zone 3: Intensive tempo / speed maintenance (83-93%)
    "YELLOW": "F4D135",        # Zone 4: Specific speed endurance (70-80%, extended on 250-300m)
    "LIGHT_GREEN": "6BAE47",    # Zone 5: Submaximal aerobic-anaerobic (65-70%)
    "DARK_GREEN": "386840",     # Zone 6: Extensive tempo / recovery (55-60%)
    "CYAN_BLUE": "0574BB",      # Zone 7: Extended aerobic 250m @ 50%
    "ROYAL_BLUE": "0170BF",     # Zone 8: Extended aerobic 300m @ 50%
}

columns = ["100%", "98%", "95%", "93%", "90,0%", "88%", "85%", "83%", "80,0%", "78%", "75%", "73%", "70,0%", "65%", "60,0%", "55%", "50,0%"]
distances = ["50", "60", "80", "100", "120", "150", "200", "250", "300"]

def get_zone_color(dist, col):
    if dist in ["50", "60"]:
        if col in ["100%", "98%", "95%"]: return COLORS["DARK_RED"]
        if col in ["93%", "90,0%", "88%", "85%", "83%"]: return COLORS["ORANGE"]
        if col in ["80,0%", "78%", "75%", "73%", "70,0%"]: return COLORS["YELLOW"]
        if col == "65%": return COLORS["LIGHT_GREEN"]
        if col in ["60,0%", "55%", "50,0%"]: return COLORS["DARK_GREEN"]
        
    elif dist == "80":
        if col in ["100%", "98%"]: return COLORS["DARK_RED"]
        if col == "95%": return COLORS["RED_ORANGE"]
        if col in ["93%", "90,0%", "88%", "85%", "83%"]: return COLORS["ORANGE"]
        if col in ["80,0%", "78%", "75%", "73%", "70,0%"]: return COLORS["YELLOW"]
        if col == "65%": return COLORS["LIGHT_GREEN"]
        if col in ["60,0%", "55%", "50,0%"]: return COLORS["DARK_GREEN"]
        
    elif dist in ["100", "120", "150"]:
        if col in ["100%", "98%", "95%"]: return COLORS["RED_ORANGE"]
        if col in ["93%", "90,0%", "88%", "85%", "83%"]: return COLORS["ORANGE"]
        if col in ["80,0%", "78%", "75%", "73%", "70,0%", "65%"]: return COLORS["YELLOW"]
        if col == "60,0%": return COLORS["LIGHT_GREEN"]
        if col in ["55%", "50,0%"]: return COLORS["DARK_GREEN"]
        
    elif dist == "200":
        if col in ["100%", "98%", "95%"]: return COLORS["RED_ORANGE"]
        if col in ["93%", "90,0%", "88%", "85%", "83%"]: return COLORS["ORANGE"]
        if col in ["80,0%", "78%", "75%", "73%", "70,0%"]: return COLORS["YELLOW"]
        if col == "65%": return COLORS["LIGHT_GREEN"]
        if col in ["60,0%", "55%", "50,0%"]: return COLORS["DARK_GREEN"]
        
    elif dist == "250":
        if col in ["100%", "98%", "95%"]: return COLORS["RED_ORANGE"]
        if col in ["93%", "90,0%", "88%", "85%", "83%", "80,0%", "78%", "75%", "73%"]: return COLORS["YELLOW"]
        if col in ["70,0%", "65%"]: return COLORS["LIGHT_GREEN"]
        if col in ["60,0%", "55%"]: return COLORS["DARK_GREEN"]
        if col == "50,0%": return COLORS["CYAN_BLUE"]
        
    elif dist == "300":
        if col in ["100%", "98%", "95%"]: return COLORS["RED_ORANGE"]
        if col in ["93%", "90,0%", "88%", "85%", "83%", "80,0%", "78%", "75%", "73%"]: return COLORS["YELLOW"]
        if col in ["70,0%", "65%"]: return COLORS["LIGHT_GREEN"]
        if col in ["60,0%", "55%"]: return COLORS["DARK_GREEN"]
        if col == "50,0%": return COLORS["ROYAL_BLUE"]
        
    return "FFFFFF"

# Write palette_zone.csv
csv_rows = [["distanza"] + columns]
for d in distances:
    row = [d]
    for c in columns:
        row.append("#" + get_zone_color(d, c))
    csv_rows.append(row)

out_path = "sidequests/sprint-ritmi-excel/output/palette_zone.csv"
with open(out_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f, delimiter=";")
    writer.writerows(csv_rows)

print(f"Generato {out_path} con la mappa colori per {len(distances)} distanze e 17 percentuali.")
