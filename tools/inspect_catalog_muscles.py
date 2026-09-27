import re

with open('js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

pms = set(re.findall(r"primaryMuscle:\s*['\"]([^'\"]+)['\"]", content))
muscles_arrays = re.findall(r"muscles:\s*\[([^\]]+)\]", content)
all_m = set()
for ma in muscles_arrays:
    for item in ma.split(','):
        cleaned = item.strip("'\" \n")
        if cleaned:
            all_m.add(cleaned)

print("Unique primaryMuscle values in exercises:")
for p in sorted(pms):
    print("  -", p)

print("\nUnique muscles array values in exercises:")
for m in sorted(all_m):
    print("  -", m)
