import re

def extract_key_sections():
    for fname in ['js/ui.js', 'js/app.js']:
        with open(fname, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print(f"\n==================== {fname} ====================")
        lines = content.splitlines()
        for i, line in enumerate(lines, 1):
            if 'MUSCLE_TAXONOMY' in line or 'filterBy' in line or 'renderMuscle' in line or 'populateMuscle' in line or 'filterExercises' in line or 'currentFilters' in line:
                start = max(1, i - 5)
                end = min(len(lines), i + 15)
                print(f"\n--- Context around line {i} in {fname} ---")
                for j in range(start, end):
                    print(f"{j+1:4d}: {lines[j]}")

if __name__ == '__main__':
    extract_key_sections()
