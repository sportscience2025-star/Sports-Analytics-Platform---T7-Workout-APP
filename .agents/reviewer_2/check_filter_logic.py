import sys, glob, re

sys.stdout.reconfigure(encoding='utf-8')

print("=== CHECKING SEARCH AND FILTERING LOGIC FOR EXERCISES ===")

with open('js/app.js', 'r', encoding='utf-8') as f:
    app_code = f.read()

with open('js/logic.js', 'r', encoding='utf-8') as f:
    logic_code = f.read()

with open('js/ui.js', 'r', encoding='utf-8') as f:
    ui_code = f.read()

# Let's find where exercise filtering happens in app.js or logic.js or ui.js
print("--- Searching filter implementation ---")
for fname, code in [('js/app.js', app_code), ('js/logic.js', logic_code), ('js/ui.js', ui_code)]:
    for line in code.splitlines():
        if any(term in line for term in ['filterExercises', 'filterCatalog', 'currentFilters', 'ex.primaryMuscle', 'ex.muscles']):
            if len(line.strip()) < 120:
                print(f"{fname}: {line.strip()}")

