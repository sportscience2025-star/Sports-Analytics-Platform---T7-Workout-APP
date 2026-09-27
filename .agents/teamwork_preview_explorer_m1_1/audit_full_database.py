import os
import re

print("=== SEARCH FOR CATEGORIES IN JS FILES ===")
js_dir = "js"
for fname in os.listdir(js_dir):
    if fname.endswith(".js") and not fname.endswith(".bak"):
        fpath = os.path.join(js_dir, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Look for category mentions or risk levels
        cats_found = []
        for cat in ["colonna", "spalla", "ginocchio", "anca", "caviglia_piede", "gomito_polso", 
                    "sistemica_metabolica", "cardiovascolare", "speciale_fisiologica",
                    "arti_inferiori", "arti_superiori", "altri_distretti", "sistemiche", 
                    "neurologiche", "reumatologiche", "post_chirurgiche", "speciali"]:
            if cat in content:
                cats_found.append(cat)
        
        risks_found = []
        for rk in ["lieve", "moderato", "elevato", "low", "medium", "high"]:
            if rk in content:
                risks_found.append(rk)
                
        print(f"\nFile: {fname}")
        print(f"  Categories: {cats_found}")
        print(f"  Risk levels: {risks_found}")
