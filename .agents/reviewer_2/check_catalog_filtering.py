import sys, re

sys.stdout.reconfigure(encoding='utf-8')

with open('js/ui.js', 'r', encoding='utf-8') as f:
    ui_code = f.read()

with open('js/app.js', 'r', encoding='utf-8') as f:
    app_code = f.read()

print("=== Searching catalog rendering and filter change listener in ui.js & app.js ===")

# In app.js or ui.js, search for renderCatalog or filter catalog call
for fname, code in [('js/ui.js', ui_code), ('js/app.js', app_code)]:
    for line_no, line in enumerate(code.splitlines()):
        if any(k in line for k in ['renderCatalog', 'filterCatalog', 'onFilterChange', 'applyFilters', 'filterExercises']):
            print(f"{fname}:{line_no+1}: {line.strip()}")

