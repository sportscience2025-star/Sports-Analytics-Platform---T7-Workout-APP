import sys, re

sys.stdout.reconfigure(encoding='utf-8')

print("=== TESTING SEARCH & FILTER COVERAGE ACROSS ALL MUSCLE TERMS ===")

with open('js/data.js', 'r', encoding='utf-8') as f:
    data_content = f.read()

# Extract taxonomy
tax_start = data_content.find('MUSCLE_TAXONOMY =')
tax_end = data_content.find('};', tax_start)
tax_str = data_content[tax_start:tax_end+2]

# Extract exercises from window.App.exercises initialization in initData
ex_start = data_content.find('window.App.exercises = [')
ex_end = data_content.find('];\n\n    window.App._dataInitialized', ex_start)
if ex_end == -1:
    ex_end = data_content.find('];', ex_start)

ex_content = data_content[ex_start:ex_end]

# Let's extract muscle terms by category
categories = {}
current_cat = None
for line in tax_str.splitlines():
    if ':' in line and '{' in line and 'label' not in line:
        cat_key = line.split(':')[0].strip().strip("'\"")
        current_cat = cat_key
        categories[current_cat] = []
    if 'muscles:' in line and current_cat:
        arr_str = line[line.find('['):line.find(']')+1]
        items = re.findall(r"['\"]([^'\"]+)['\"]", arr_str)
        categories[current_cat] = items

print("Taxonomy categories found:", list(categories.keys()))

# Parse basic exercise objects (primaryMuscle, muscles list)
# We can find all { id: ..., primaryMuscle: ..., muscles: [...] }
exercises = []
# Find each exercise object pattern
blocks = re.split(r"\{\s*id:", data_content)
for b in blocks[1:]:
    # extract primaryMuscle
    pm_m = re.search(r"primaryMuscle:\s*['\"]([^'\"]+)['\"]", b)
    # extract muscles
    m_m = re.search(r"muscles:\s*\[([^\]]*)\]", b)
    # extract name
    nm_m = re.search(r"name:\s*['\"]([^'\"]+)['\"]", b)
    
    if pm_m and m_m and nm_m:
        pm = pm_m.group(1)
        muscles_raw = m_m.group(1)
        muscles_list = re.findall(r"['\"]([^'\"]+)['\"]", muscles_raw)
        name = nm_m.group(1)
        exercises.append({'name': name, 'primaryMuscle': pm, 'muscles': muscles_list})

print(f"Parsed {len(exercises)} exercises for testing filtering logic.")

# Let's simulate getExercises filtering for each muscle term in taxonomy
missing_results = []
term_counts = {}

for cat, terms in categories.items():
    print(f"\n--- Category: {cat} ({len(terms)} muscles) ---")
    for term in terms:
        # simulate getExercises filter for term
        matching = [ex for ex in exercises if ex['primaryMuscle'] == term or term in ex['muscles']]
        term_counts[term] = len(matching)
        if len(matching) == 0:
            missing_results.append((cat, term))
            print(f"  ❌ {term:<40}: 0 exercises found!")
        else:
            print(f"  ✅ {term:<40}: {len(matching)} exercises found.")

print("\n=== SUMMARY OF FILTER TEST ===")
if missing_results:
    print(f"WARNING: {len(missing_results)} muscle terms have 0 matching exercises in the database!")
    for cat, term in missing_results:
        print(f"  - [{cat}] {term}")
else:
    print("ALL muscle terms in MUSCLE_TAXONOMY have at least one matching exercise!")

