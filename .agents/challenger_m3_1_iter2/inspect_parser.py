import os, re

parser_path = os.path.join(os.path.dirname(__file__), '..', '..', 'js', 'parser.js')
with open(parser_path, 'r', encoding='utf-8') as f:
    code = f.read()

print("Searching for athlete handling in parser.js...")
for i, line in enumerate(code.splitlines()):
    if any(k in line for k in ['athleteIdMap', 'isEncodedId', 'extractReadableName', 'athleteRaw']):
        print(f"Line {i+1}: {line.strip()}")
