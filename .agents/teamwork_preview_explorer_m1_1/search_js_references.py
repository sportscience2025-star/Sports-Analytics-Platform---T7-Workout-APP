import os
import re

js_files = []
for root, dirs, files in os.walk("."):
    if ".git" in root or "node_modules" in root or ".agents" in root:
        continue
    for f in files:
        if f.endswith(".js"):
            js_files.append(os.path.join(root, f))

print("Found JS files:", js_files)

categories_to_check = [
    "colonna", "spalla", "ginocchio", "anca", "caviglia_piede", "gomito_polso", 
    "sistemica_metabolica", "cardiovascolare", "speciale_fisiologica",
    "arti_inferiori", "arti_superiori", "altri_distretti", "sistemiche", 
    "neurologiche", "reumatologiche", "post_chirurgiche", "speciali"
]

risk_levels_to_check = ["lieve", "moderato", "elevato", "low", "medium", "high"]

print("\n--- Search Results for Categories across JS Files ---")
for file in js_files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    found_cats = [cat for cat in categories_to_check if cat in content]
    found_risks = [rk for rk in risk_levels_to_check if rk in content]
    print(f"\nFile: {file}")
    if found_cats:
        print(f"  Categories matched: {found_cats}")
    if found_risks:
        print(f"  Risk levels matched: {found_risks}")
