import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r'e:/Nuove App Installate/App esercizi scienze motorie/js/logic.js', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

for i, line in enumerate(lines, 1):
    if 'generatefullprogram' in line.lower():
        print(f"Start around line {i}")
        for j in range(i, min(i+400, len(lines))):
            if 'return {' in lines[j] or 'return program' in lines[j] or 'meta:' in lines[j]:
                print(f"Line {j+1}: {lines[j].strip()}")
