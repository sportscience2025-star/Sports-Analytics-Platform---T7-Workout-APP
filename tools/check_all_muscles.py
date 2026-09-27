import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract taxonomy
tax_str = re.search(r'window\.App\.MUSCLE_TAXONOMY\s*=\s*(\{[\s\S]*?\n\s*\});', content).group(1)

# Extract muscles from tax_str
muscles = []
for line in tax_str.split('\n'):
    if 'muscles:' in line:
        # extract items in array
        m_list = re.findall(r"['\"]([^'\"]+)['\"]", line)
        muscles.extend(m_list)

print(f"Total muscles in taxonomy: {len(muscles)}")
print("Muscles:", muscles)

# Extract all exercise primaryMuscle and muscles fields from data.js
# Simple extraction of primaryMuscle: '...' and muscles: [...]
exercises = []
# Let's find all exercise blocks or objects
ex_blocks = re.findall(r'\{\s*id:\s*[\'"]([^\'"]+)[\'"][\s\S]*?\}', content)

# Better: let's extract all primaryMuscle values and muscles arrays
primary_muscles = re.findall(r"primaryMuscle:\s*['\"]([^'\"]+)['\"]", content)
muscles_arrays = re.findall(r"muscles:\s*\[([^\]]+)\]", content)

print(f"Found {len(primary_muscles)} primaryMuscle entries")

# For each muscle in taxonomy, check how many exercises match
# Matching logic in getExercises:
# ex matches if ex.primaryMuscle == m or ex.muscles contains m (or partial/fuzzy if implemented)
for m in muscles:
    count = 0
    # Let's check direct matches in primary_muscles and muscles_arrays
    for pm in primary_muscles:
        if pm == m or m in pm or pm in m:
            count += 1
    for ma in muscles_arrays:
        ma_items = [x.strip("'\" ") for x in ma.split(',')]
        if m in ma_items or any(m in item or item in m for item in ma_items if item != 'Core' and item != 'Chest'):
            count += 1
    print(f"Muscle '{m}': ~{count} matches")
