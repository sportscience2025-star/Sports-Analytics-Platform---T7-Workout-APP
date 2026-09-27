import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open(r'e:/Nuove App Installate/App esercizi scienze motorie/js/logic.js', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Find generateFullProgram or AI object methods
matches = [m.start() for m in re.finditer(r'generateFullProgram', content)]
print(f"generateFullProgram occurrences in logic.js: {len(matches)}")
for idx, pos in enumerate(matches):
    start = max(0, pos - 100)
    end = min(len(content), pos + 500)
    print(f"--- Occurrence {idx+1} ---")
    print(content[start:end])
