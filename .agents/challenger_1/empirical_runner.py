import os
import sys
import re

print("==================================================")
print("EMPIRICAL CHALLENGER 1 VERIFICATION HARNESS")
print("==================================================")

PROJECT_ROOT = r"e:\Nuove App Installate\App esercizi scienze motorie"
DATA_JS = os.path.join(PROJECT_ROOT, "js", "data.js")
LOGIC_JS = os.path.join(PROJECT_ROOT, "js", "logic.js")

with open(DATA_JS, 'r', encoding='utf-8') as f:
    data_content = f.read()

with open(LOGIC_JS, 'r', encoding='utf-8') as f:
    logic_content = f.read()

# ---------------------------------------------------------
# TARGET 1 & 2: EXERCISE CATALOG & MUSCLE MAPPING ANALYSIS
# ---------------------------------------------------------
print("\n--- TARGET 1 & 2: Parsing Exercises & Muscle Mappings ---")

# Extract window.App.MUSCLE_TAXONOMY
taxonomy = {}
tax_match = re.search(r'window\.App\.MUSCLE_TAXONOMY\s*=\s*(\{[\s\S]*?\n\s*\});', data_content)
if tax_match:
    tax_str = tax_match.group(1)
    # Simple regex parsing for groups and muscles
    groups = re.findall(r"['\"](\w+)['\"]\s*:\s*\{\s*label\s*:\s*['\"]([^'\"]+)['\"]\s*,\s*muscles\s*:\s*\[([^\]]+)\]", tax_str)
    for grp, lbl, musc in groups:
        m_list = [m.strip(" '\"\t\n") for m in musc.split(',') if m.strip()]
        taxonomy[grp] = {'label': lbl, 'muscles': m_list}

print(f"Taxonomy loaded: {len(taxonomy)} muscle groups.")
for k, v in taxonomy.items():
    print(f"  Group '{k}' ({v['label']}): {len(v['muscles'])} anatomical muscles")

# Extract exercise definitions
# Find the array window.App.exercises = [ ... ];
ex_array_match = re.search(r'window\.App\.exercises\s*=\s*\[([\s\S]*?)\n\s*\];', data_content)
if not ex_array_match:
    print("[FATAL] Could not find window.App.exercises array!")
    sys.exit(1)

ex_raw = ex_array_match.group(1)

# Split by exercise blocks starting with { id: or {id:
blocks = re.split(r'\n\s*\{\s*id\s*:', ex_raw)
exercises = []

for idx, b in enumerate(blocks):
    if not b.strip():
        continue
    # Re-add 'id:' prefix unless it's already there
    block_text = "id:" + b if not b.strip().startswith("id:") else b
    
    # Extract fields
    def get_val(key):
        m = re.search(r"\b" + key + r"\s*:\s*['\"]([^'\"]+)['\"]", block_text)
        return m.group(1) if m else None

    def get_list(key):
        m = re.search(r"\b" + key + r"\s*:\s*\[([^\]]+)\]", block_text)
        if m:
            items = re.findall(r"['\"]([^'\"]+)['\"]", m.group(1))
            return items
        return []

    ex_id = get_val("id")
    name = get_val("name")
    primaryMuscle = get_val("primaryMuscle")
    muscles = get_list("muscles")
    secondaryMuscles = get_list("secondaryMuscles")
    anatomicalBellies = get_list("anatomicalBellies")
    targetMuscles = get_list("targetMuscles")
    ex_type = get_val("type")
    level = get_val("level")
    equipment = get_val("equipment")
    quality = get_val("quality")

    if ex_id and name:
        exercises.append({
            'id': ex_id,
            'name': name,
            'primaryMuscle': primaryMuscle,
            'muscles': muscles,
            'secondaryMuscles': secondaryMuscles,
            'anatomicalBellies': anatomicalBellies,
            'targetMuscles': targetMuscles,
            'type': ex_type,
            'level': level,
            'equipment': equipment,
            'quality': quality
        })

print(f"Total parsed exercises: {len(exercises)}")

# Verify all exercises retain valid muscle mappings
missing_primary = []
missing_muscles = []
exercises_with_bellies = []

for ex in exercises:
    if not ex['primaryMuscle']:
        missing_primary.append(ex['id'])
    if not ex['muscles']:
        missing_muscles.append(ex['id'])
    if ex['anatomicalBellies']:
        exercises_with_bellies.append(ex['id'])

print(f"Exercises missing primaryMuscle: {len(missing_primary)}")
print(f"Exercises missing muscles array: {len(missing_muscles)}")
print(f"Exercises explicitly defining anatomicalBellies property: {len(exercises_with_bellies)}")

# ---------------------------------------------------------
# TARGET 2: STRESS TEST ANATOMICAL BELLY QUERYING
# ---------------------------------------------------------
print("\n--- TARGET 2: Testing Filtering Logic & Anatomical Belly Search ---")

# Simulate window.App.getExercises(filters) implementation from data.js:11748
def getExercises_simulated(filters):
    results = exercises
    if not filters:
        return results

    # 1. Search filter
    if filters.get('search'):
        term = filters['search'].lower()
        results = [ex for ex in results if (
            term in ex['name'].lower() or
            any(term in m.lower() for m in ex['muscles'])
        )]

    # 2. Muscle group filter
    if filters.get('muscle') and filters['muscle'] != 'all':
        group_key = filters['muscle']
        target_muscles = [group_key]
        if group_key in taxonomy:
            target_muscles = taxonomy[group_key]['muscles']
        else:
            for grp in taxonomy.values():
                if group_key.lower() in grp['label'].lower():
                    target_muscles = grp['muscles']
                    break
        
        results = [ex for ex in results if (
            ex['primaryMuscle'] in target_muscles or
            ex['primaryMuscle'] == group_key or
            any(m in target_muscles or m == group_key for m in ex['muscles'])
        )]

    return results

# Test querying specific anatomical bellies requested by user: "Vasto Laterale", "Bicipite Femorale", "Retto dell'Addome"
test_queries = ["Vasto Laterale", "Bicipite Femorale", "Retto dell'Addome", "Dentato Anteriore", "Soleo"]

for q in test_queries:
    res = getExercises_simulated({'search': q})
    print(f"Query '{q}' returned {len(res)} exercises.")
    if len(res) == 0:
        print(f"  [WARNING/DEFECT] Query '{q}' returned ZERO results!")
        # Let's check how many exercises contain 'q' in any muscle field across all exercises
        matching_primary = [ex['name'] for ex in exercises if ex['primaryMuscle'] and q.lower() in ex['primaryMuscle'].lower()]
        matching_muscles = [ex['name'] for ex in exercises if any(q.lower() in m.lower() for m in ex['muscles'])]
        matching_secondary = [ex['name'] for ex in exercises if any(q.lower() in m.lower() for m in ex['secondaryMuscles'])]
        matching_bellies = [ex['name'] for ex in exercises if any(q.lower() in m.lower() for m in ex['anatomicalBellies'])]
        print(f"  [DIAGNOSTIC] Matches in primaryMuscle: {len(matching_primary)}, muscles: {len(matching_muscles)}, secondaryMuscles: {len(matching_secondary)}, anatomicalBellies: {len(matching_bellies)}")

