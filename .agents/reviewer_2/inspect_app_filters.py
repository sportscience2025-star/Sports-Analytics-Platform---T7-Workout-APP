import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('js/app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("=== js/app.js lines 140-200 ===")
for i in range(139, min(200, len(lines))):
    print(f"{i+1}: {lines[i]}", end='')

