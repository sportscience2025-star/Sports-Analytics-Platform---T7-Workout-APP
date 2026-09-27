import sys, re, json

sys.stdout.reconfigure(encoding='utf-8')

print("=== EXERCISE DATABASE & UI BINDING INTEGRITY TEST ===")

with open('js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's extract all exercise objects by scanning for id: '...' or similar
# Or let's use python to extract the EXERCISES array or objects
print("Analyzing exercise objects in js/data.js...")

# Let's count how many exercises exist and check their properties
ex_blocks = re.findall(r"\{\s*id:\s*['\"]([^'\"]+)['\"][\s\S]*?\n\s*\}", content)
print(f"Found {len(ex_blocks)} exercise IDs matching standard pattern.")

# Let's check for any undefined or missing properties in exercises
# Required fields according to UI rendering in ui.js:
# ex.name, ex.primaryMuscle, ex.muscles, ex.level, ex.equipment, ex.type (or category), ex.description

# Let's do a regex check on all exercise blocks to ensure no undefined values or missing primaryMuscle/muscles
id_matches = re.finditer(r"id:\s*['\"]([^'\"]+)['\"]", content)
exercise_starts = [m.start() for m in id_matches]

undefined_issues = []
missing_primary = []
missing_muscles = []
missing_name = []

for i, start_idx in enumerate(exercise_starts):
    end_idx = exercise_starts[i+1] if i+1 < len(exercise_starts) else len(content)
    block = content[start_idx:end_idx]
    
    # Extract ID
    ex_id = re.search(r"id:\s*['\"]([^'\"]+)['\"]", block).group(1)
    
    # Check for name
    name_m = re.search(r"name:\s*['\"]([^'\"]+)['\"]", block)
    if not name_m:
        missing_name.append(ex_id)
    
    # Check primaryMuscle
    pm_m = re.search(r"primaryMuscle:\s*['\"]([^'\"]+)['\"]", block)
    if not pm_m:
        missing_primary.append(ex_id)
    else:
        pm_val = pm_m.group(1)
        if pm_val == 'undefined' or pm_val == 'null' or pm_val == '':
            undefined_issues.append((ex_id, 'primaryMuscle', pm_val))
            
    # Check muscles array
    m_m = re.search(r"muscles:\s*\[([^\]]*)\]", block)
    if not m_m:
        missing_muscles.append(ex_id)

print(f"Total exercises checked: {len(exercise_starts)}")
print(f"Missing name: {len(missing_name)}")
print(f"Missing primaryMuscle: {len(missing_primary)}")
print(f"Missing muscles array: {len(missing_muscles)}")
print(f"Undefined issues in primaryMuscle: {len(undefined_issues)}")

if missing_primary:
    print("Exercises missing primaryMuscle:", missing_primary[:10])
if missing_muscles:
    print("Exercises missing muscles array:", missing_muscles[:10])
if undefined_issues:
    print("Undefined issues:", undefined_issues)

