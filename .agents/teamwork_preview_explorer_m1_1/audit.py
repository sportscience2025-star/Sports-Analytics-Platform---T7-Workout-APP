import re
import json

with open("js/data.js", "r", encoding="utf-8") as f:
    content = f.read()

# Find window.App.clinicalConditions array
start_match = re.search(r'window\.App\.clinicalConditions\s*=\s*\[', content)
if not start_match:
    print("Could not find window.App.clinicalConditions start")
    exit(1)

start_pos = start_match.end()

# Extract the array block by matching brackets
bracket_count = 1
end_pos = start_pos
while end_pos < len(content) and bracket_count > 0:
    if content[end_pos] == '[':
        bracket_count += 1
    elif content[end_pos] == ']':
        bracket_count -= 1
    end_pos += 1

array_str = content[start_pos:end_pos-1]
print(f"Extracted array string length: {len(array_str)}")

# Parse top-level objects out of array_str
objects = []
idx = 0
while idx < len(array_str):
    if array_str[idx] == '{':
        obj_start = idx
        brace_count = 1
        idx += 1
        in_string = False
        string_char = None
        while idx < len(array_str) and brace_count > 0:
            c = array_str[idx]
            if in_string:
                if c == string_char and array_str[idx-1] != '\\':
                    in_string = False
            else:
                if c in ('"', "'", '`'):
                    in_string = True
                    string_char = c
                elif c == '{':
                    brace_count += 1
                elif c == '}':
                    brace_count -= 1
            idx += 1
        obj_str = array_str[obj_start:idx]
        objects.append(obj_str)
    else:
        idx += 1

print(f"Total objects found: {len(objects)}")

parsed_conditions = []
for i, raw_obj in enumerate(objects):
    def get_field(field_name, text):
        m = re.search(rf'{field_name}\s*:\s*(?:"([^"\\]*(?:\\.[^"\\]*)*)"|\'([^\'\\]*(?:\\.[^\'\\]*)*)\')', text)
        if m:
            return m.group(1) if m.group(1) is not None else m.group(2)
        return None

    cid = get_field("id", raw_obj)
    cname = get_field("name", raw_obj)
    cnameEn = get_field("nameEn", raw_obj)
    cat = get_field("category", raw_obj)
    desc = get_field("description", raw_obj)
    icon = get_field("icon", raw_obj)
    risk = get_field("riskLevel", raw_obj)

    parsed_conditions.append({
        "raw_index": i,
        "id": cid,
        "name": cname,
        "nameEn": cnameEn,
        "category": cat,
        "description": desc,
        "icon": icon,
        "riskLevel": risk,
    })

# Save parsed conditions as json
with open(".agents/teamwork_preview_explorer_m1_1/parsed_conditions.json", "w", encoding="utf-8") as f:
    json.dump(parsed_conditions, f, ensure_ascii=False, indent=2)

print("Parsed data saved successfully.")
