import os
import sys
import re
from collections import Counter

PROJECT_ROOT = r"e:\Nuove App Installate\App esercizi scienze motorie"
DATA_JS = os.path.join(PROJECT_ROOT, "js", "data.js")

with open(DATA_JS, 'r', encoding='utf-8') as f:
    data_content = f.read()

# Parse exercise objects with full regex to get all keys
ex_array_match = re.search(r'window\.App\.exercises\s*=\s*\[([\s\S]*?)\n\s*\];', data_content)
ex_raw = ex_array_match.group(1)
blocks = re.split(r'\n\s*\{\s*id\s*:', ex_raw)

all_primary = Counter()
all_muscles = Counter()
all_secondary = Counter()
all_keys = Counter()

for b in blocks:
    if not b.strip(): continue
    block_text = "id:" + b if not b.strip().startswith("id:") else b
    
    # Extract keys
    keys = re.findall(r"([a-zA-Z0-9_$]+)\s*:", block_text)
    for k in keys:
        all_keys[k] += 1
        
    pm = re.search(r"primaryMuscle\s*:\s*['\"]([^'\"]+)['\"]", block_text)
    if pm: all_primary[pm.group(1)] += 1
    
    m = re.search(r"muscles\s*:\s*\[([^\]]+)\]", block_text)
    if m:
        for item in re.findall(r"['\"]([^'\"]+)['\"]", m.group(1)):
            all_muscles[item] += 1

    sm = re.search(r"secondaryMuscles\s*:\s*\[([^\]]+)\]", block_text)
    if sm:
        for item in re.findall(r"['\"]([^'\"]+)['\"]", sm.group(1)):
            all_secondary[item] += 1

print("--- EXERCISE OBJECT KEYS FOUND ACROSS CATALOG ---")
for k, count in all_keys.most_common(30):
    print(f"  {k}: {count}")

print("\n--- TOP 15 PRIMARY MUSCLES ---")
for m, count in all_primary.most_common(15):
    print(f"  {m}: {count}")

print("\n--- TOP 20 MUSCLES IN 'muscles' ARRAY ---")
for m, count in all_muscles.most_common(20):
    print(f"  {m}: {count}")

print("\n--- CHECKING RETTO ADDOMINAL VS RETTO DELL'ADDOME ---")
retto_add = [m for m in all_muscles if 'retto' in m.lower() or 'addome' in m.lower()]
print("Matching muscle items:", retto_add)

