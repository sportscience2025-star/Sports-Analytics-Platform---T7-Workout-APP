import glob

def find_on_filter_change():
    for fname in ['js/app.js', 'js/ui.js', 'js/logic.js']:
        with open(fname, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.splitlines()
        for i, line in enumerate(lines):
            if 'renderFilters' in line or 'filters.muscle' in line or 'filterExercises' in line or 'filteredExercises' in line or 'currentFilters' in line:
                print(f"File {fname}, line {i+1}: {line}")

if __name__ == '__main__':
    find_on_filter_change()
