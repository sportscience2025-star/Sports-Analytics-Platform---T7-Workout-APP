import re

with open('js/data.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Let's extract MUSCLE_TAXONOMY using python regex or evaluation
taxonomy_match = re.search(r'window\.App\.MUSCLE_TAXONOMY\s*=\s*(\{[\s\S]*?\n\s*\});', code)
if taxonomy_match:
    print("Found MUSCLE_TAXONOMY match")

# Let's find all muscle names in MUSCLE_TAXONOMY
muscles_in_tax = re.findall(r"'([A-Za-z\s\(\)/]+)'|\"([A-Za-z\s\(\)/']+)\"", taxonomy_match.group(1) if taxonomy_match else "")
# Let's write a python script to parse exercises and check matching for each muscle
