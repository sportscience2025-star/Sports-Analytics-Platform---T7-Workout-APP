import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Parse taxonomy
tax_match = re.search(r'window\.App\.MUSCLE_TAXONOMY\s*=\s*(\{[\s\S]*?\n\s*\});', content)
tax_code = tax_match.group(1)

# Extract taxonomy categories and muscles accurately
taxonomy = {}
category_blocks = re.findall(r"['\"](\w+)['\"]:\s*\{\s*label:\s*['\"]([^'\"]+)['\"],\s*muscles:\s*\[([^\]]+)\]\s*\}", tax_code)
for cat_key, label, muscles_raw in category_blocks:
    muscles_list = [m.strip("'\" \n") for m in muscles_raw.split(',')]
    taxonomy[cat_key] = {
        'label': label,
        'muscles': muscles_list
    }

print("Taxonomy parsed:")
for k, v in taxonomy.items():
    print(f"  {k} ({v['label']}): {v['muscles']}")

# Extract exercise catalog
# Let's write a python snippet to extract each exercise object from window.App.exercises
# Or parse using JS regex for objects { id: ..., primaryMuscle: ..., muscles: [...] }
ex_matches = re.finditer(r"\{\s*id:\s*['\"]([^'\"]+)['\"],[\s\S]*?primaryMuscle:\s*['\"]([^'\"]+)['\"][\s\S]*?muscles:\s*\[([^\]]*)\]", content)
exercises = []
for m in ex_matches:
    ex_id = m.group(1)
    pm = m.group(2)
    muscles_raw = m.group(3)
    muscles = [x.strip("'\" \n") for x in muscles_raw.split(',') if x.strip("'\" \n")]
    exercises.append({
        'id': ex_id,
        'primaryMuscle': pm,
        'muscles': muscles
    })

print(f"\nTotal exercises parsed from js/data.js: {len(exercises)}")

# Simulation of window.App.getExercises(filters) for each muscle option
def get_exercises(filters_muscle):
    target_muscles = [filters_muscle]
    if filters_muscle in taxonomy:
        target_muscles = taxonomy[filters_muscle]['muscles']
    else:
        for group in taxonomy.values():
            if filters_muscle.lower() in group['label'].lower():
                target_muscles = group['muscles']
                break
    
    results = []
    for ex in exercises:
        # check match: targetMuscles includes ex.primaryMuscle or ex.primaryMuscle == filters_muscle
        # or ex.muscles has matching muscle
        match = False
        if ex['primaryMuscle'] in target_muscles or ex['primaryMuscle'] == filters_muscle:
            match = True
        elif any(m in target_muscles or m == filters_muscle for m in ex['muscles']):
            match = True
        # Also let's check substring matching (e.g. if ex.primaryMuscle or ex.muscles contains filters_muscle or vice versa)
        elif any(filters_muscle.lower() in m.lower() or m.lower() in filters_muscle.lower() for m in [ex['primaryMuscle']] + ex['muscles']):
            match = True
            
        if match:
            results.append(ex)
    return results

# Check all individual muscles and category keys
all_options = list(taxonomy.keys())
for cat in taxonomy.values():
    all_options.extend(cat['muscles'])

zero_matches = []
print("\nTesting filter matching for each option in dropdown:")
for opt in all_options:
    res = get_exercises(opt)
    print(f"  [{'OK' if len(res)>0 else 'FAIL'}] '{opt}': {len(res)} matching exercises")
    if len(res) == 0:
        zero_matches.append(opt)

if zero_matches:
    print(f"\nCRITICAL: The following {len(zero_matches)} options returned 0 exercises: {zero_matches}")
else:
    print("\nSUCCESS: All options returned at least 1 exercise!")
