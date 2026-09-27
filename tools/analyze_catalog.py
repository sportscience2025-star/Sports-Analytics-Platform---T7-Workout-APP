with open('js/logic.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if any(k in l.lower() for k in ['muscle', 'gambe', 'petto', 'schiena', 'spalle', 'braccia', 'core', 'glutei', 'polpacci', 'femorali']):
        print(f"Line {i+1}: {l.strip()}")
