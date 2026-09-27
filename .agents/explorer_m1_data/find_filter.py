import re

def find_filtering_logic():
    for fname in ['js/app.js', 'js/logic.js', 'js/ui.js']:
        with open(fname, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print(f"\n==================== {fname} ====================")
        lines = content.splitlines()
        for i, line in enumerate(lines, 1):
            if any(term in line.lower() for term in ['filter', 'search', 'primarymuscle', 'muscles.includes', 'muscle ===', 'muscle.includes']):
                print(f"  Line {i:4d}: {line[:120]}")

if __name__ == '__main__':
    find_filtering_logic()
