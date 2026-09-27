import re, json

with open('js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Match exercises
# We can find all exercise patterns
ex_matches = re.findall(r"\{\s*id:\s*['\"]([^'\"]+)['\"].*?name:\s*['\"]([^'\"]+)['\"].*?primaryMuscle:\s*['\"]([^'\"]+)['\"]", content, re.DOTALL)

by_primary = {}
for ex_id, name, prim in ex_matches:
    by_primary.setdefault(prim, []).append((ex_id, name))

for prim, items in sorted(by_primary.items()):
    print(f"=== {prim} ({len(items)} exercises) ===")
    for ex_id, name in items[:10]:
        print(f"  [{ex_id}] {name}")
    if len(items) > 10:
        print(f"  ... and {len(items)-10} more")
