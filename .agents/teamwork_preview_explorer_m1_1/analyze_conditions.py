import re
import json

with open("js/data.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Extract lines from 43 to 958
cc_lines = lines[42:958]
cc_text = "".join(cc_lines)

# Parse JS objects using JS evaluator or regex parser
# Let's parse objects by finding id: "..." or id: '...' and extract all properties per object block.

# Split by objects
# Each condition object starts with `{` and ends with `}`.
# Let's find object boundaries.
objects_raw = []
current_obj = []
in_obj = False
brace_depth = 0

for line in cc_lines:
    for char in line:
        if char == '{':
            if brace_depth == 0:
                in_obj = True
                current_obj = []
            brace_depth += 1
        if in_obj:
            current_obj.append(char)
        if char == '}':
            brace_depth -= 1
            if brace_depth == 0:
                in_obj = False
                objects_raw.append("".join(current_obj))

print(f"Extracted raw condition object blocks: {len(objects_raw)}")

conditions = []
for idx, raw in enumerate(objects_raw):
    # Regex extractors
    id_m = re.search(r'\bid\s*:\s*["\']([^"\']+)["\']', raw)
    name_m = re.search(r'\bname\s*:\s*["\']([^"\']+)["\']', raw)
    nameEn_m = re.search(r'\bnameEn\s*:\s*["\']([^"\']+)["\']', raw)
    cat_m = re.search(r'\bcategory\s*:\s*["\']([^"\']+)["\']', raw)
    desc_m = re.search(r'\bdescription\s*:\s*["\']([^"\']+)["\']', raw)
    icon_m = re.search(r'\bicon\s*:\s*["\']([^"\']+)["\']', raw)
    risk_m = re.search(r'\briskLevel\s*:\s*["\']([^"\']+)["\']', raw)
    
    cond = {
        "index": idx + 1,
        "id": id_m.group(1) if id_m else None,
        "name": name_m.group(1) if name_m else None,
        "nameEn": nameEn_m.group(1) if nameEn_m else None,
        "category": cat_m.group(1) if cat_m else None,
        "description": desc_m.group(1) if desc_m else None,
        "icon": icon_m.group(1) if icon_m else None,
        "riskLevel": risk_m.group(1) if risk_m else None,
        "has_exclusions": "exclusions" in raw,
        "has_adaptations": "adaptations" in raw,
        "raw": raw
    }
    conditions.append(cond)

print(f"Total parsed condition objects: {len(conditions)}")

# Check for duplicate IDs
id_counts = {}
for c in conditions:
    cid = c['id']
    id_counts[cid] = id_counts.get(cid, 0) + 1

duplicates = {k: v for k, v in id_counts.items() if v > 1}
print(f"Duplicate IDs: {duplicates}")

# Categories breakdown
cat_counts = {}
for c in conditions:
    cat = c['category']
    cat_counts[cat] = cat_counts.get(cat, 0) + 1

print("\nCategories Count Breakdown:")
for cat, count in sorted(cat_counts.items(), key=lambda x: x[1], reverse=True):
    print(f"  {cat}: {count}")

# Risk levels breakdown
risk_counts = {}
for c in conditions:
    r = c['riskLevel']
    risk_counts[r] = risk_counts.get(r, 0) + 1

print("\nRisk Levels Breakdown:")
for r, count in risk_counts.items():
    print(f"  {r}: {count}")

# Icon breakdown
icon_counts = {}
for c in conditions:
    icon = c['icon']
    icon_counts[icon] = icon_counts.get(icon, 0) + 1

print("\nIcons Breakdown:")
for icon, count in sorted(icon_counts.items(), key=lambda x: x[1], reverse=True):
    print(f"  {icon}: {count}")

# ID format breakdown
print("\nID Formats Analysis:")
id_patterns = {}
for c in conditions:
    cid = c['id']
    cat = c['category']
    # Check prefix
    parts = cid.split("_")
    prefix = parts[0]
    num_part = parts[-1] if parts[-1].isdigit() else None
    print(f"ID: {cid:<30} Cat: {cat:<22} Name: {c['name']}")

with open(".agents/teamwork_preview_explorer_m1_1/all_conditions_detailed.json", "w", encoding="utf-8") as f:
    json.dump(conditions, f, ensure_ascii=False, indent=2)
