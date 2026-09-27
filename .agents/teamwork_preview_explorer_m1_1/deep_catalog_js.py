import re
import json

with open("js/data.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

cc_lines = lines[42:958]
cc_text = "".join(cc_lines)

# Parse JS objects
objects_raw = []
current_obj = []
in_obj = False
brace_depth = 0
start_line = 0

for line_idx, line in enumerate(cc_lines, start=43):
    for char in line:
        if char == '{':
            if brace_depth == 0:
                in_obj = True
                current_obj = []
                start_line = line_idx
            brace_depth += 1
        if in_obj:
            current_obj.append(char)
        if char == '}':
            brace_depth -= 1
            if brace_depth == 0:
                in_obj = False
                objects_raw.append((start_line, "".join(current_obj)))

conditions = []
for start_line, raw in objects_raw:
    id_m = re.search(r'\bid\s*:\s*["\']([^"\']+)["\']', raw)
    name_m = re.search(r'\bname\s*:\s*["\']([^"\']+)["\']', raw)
    nameEn_m = re.search(r'\bnameEn\s*:\s*["\']([^"\']+)["\']', raw)
    cat_m = re.search(r'\bcategory\s*:\s*["\']([^"\']+)["\']', raw)
    desc_m = re.search(r'\bdescription\s*:\s*["\']([^"\']+)["\']', raw)
    icon_m = re.search(r'\bicon\s*:\s*["\']([^"\']+)["\']', raw)
    risk_m = re.search(r'\briskLevel\s*:\s*["\']([^"\']+)["\']', raw)
    
    cond = {
        "line": start_line,
        "id": id_m.group(1) if id_m else None,
        "name": name_m.group(1) if name_m else None,
        "nameEn": nameEn_m.group(1) if nameEn_m else None,
        "category": cat_m.group(1) if cat_m else None,
        "description": desc_m.group(1) if desc_m else None,
        "icon": icon_m.group(1) if icon_m else None,
        "riskLevel": risk_m.group(1) if risk_m else None,
        "has_exclusions": "exclusions" in raw,
        "has_adaptations": "adaptations" in raw,
    }
    conditions.append(cond)

print(f"Total conditions in window.App.clinicalConditions: {len(conditions)}")

# Duplicate ID check
id_map = {}
duplicates = []
for c in conditions:
    cid = c['id']
    if cid in id_map:
        duplicates.append((cid, id_map[cid]['line'], c['line']))
    else:
        id_map[cid] = c

print(f"Duplicate IDs found: {len(duplicates)}")
if duplicates:
    for d in duplicates:
        print(f"  Duplicate ID '{d[0]}' at lines {d[1]} and {d[2]}")

# Categories breakdown
cat_dict = {}
for c in conditions:
    cat = c['category']
    if cat not in cat_dict:
        cat_dict[cat] = []
    cat_dict[cat].append(c)

print("\n--- CATEGORY BREAKDOWN ---")
for cat, item_list in cat_dict.items():
    print(f"\nCategory: '{cat}' ({len(item_list)} items)")
    for item in item_list:
        print(f"  L{item['line']:<4} ID: {item['id']:<32} Risk: {item['riskLevel']:<7} Icon: {item['icon']:<10} Name: {item['name']}")

# Check risk level values
risk_levels_found = set(c['riskLevel'] for c in conditions)
print(f"\nUnique riskLevel values: {risk_levels_found}")

# Check icon values
icons_found = set(c['icon'] for c in conditions)
print(f"Unique icon values: {icons_found}")

# Check missing fields
missing_fields = []
for c in conditions:
    missing = [k for k, v in c.items() if v is None and k not in ('has_exclusions', 'has_adaptations')]
    if missing:
        missing_fields.append((c['id'], missing))

print(f"\nMissing required fields: {len(missing_fields)}")
if missing_fields:
    for mf in missing_fields:
        print(f"  Condition '{mf[0]}' missing: {mf[1]}")

# Analysis of ID structure and maximum numbers / ranges
print("\n--- ID STRUCTURE & MAX NUMBERS PER CATEGORY ---")
for cat, item_list in cat_dict.items():
    numeric_ids = []
    text_ids = []
    for item in item_list:
        cid = item['id']
        # Extract trailing digits if any
        m = re.search(r'(\d+)$', cid)
        if m:
            numeric_ids.append((int(m.group(1)), cid))
        else:
            text_ids.append(cid)
    max_num = max([n[0] for n in numeric_ids]) if numeric_ids else None
    print(f"Category '{cat}':")
    print(f"  Count: {len(item_list)}")
    print(f"  Text IDs ({len(text_ids)}): {text_ids}")
    print(f"  Numeric IDs ({len(numeric_ids)}): {numeric_ids}")
    print(f"  Max Numeric ID: {max_num}")
