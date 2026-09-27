import os, re

js_dir = 'js'
files = [os.path.join(js_dir, f) for f in os.listdir(js_dir) if f.endswith('.js')]

print("Searching JS files for key taxonomy & dropdown keywords:")
for fpath in files:
    with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # search for MUSCLE_TAXONOMY or dropdown or category or Piedi
    matches = re.findall(r'(MUSCLE_TAXONOMY|render[A-Za-z0-9_]*|populate[A-Za-z0-9_]*|filter[A-Za-z0-9_]*|Feet|Piedi)', content)
    if matches:
        print(f"\nFile: {fpath}")
        lines = content.splitlines()
        for i, line in enumerate(lines):
            if any(k in line for k in ['MUSCLE_TAXONOMY', 'populate', 'renderExercise', 'renderCatalog', 'filter', 'Piedi', 'Feet']):
                print(f"  Line {i+1}: {line.strip()[:120]}")
