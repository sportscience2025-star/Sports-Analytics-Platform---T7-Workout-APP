import os
import re

files = ['js/ui.js', 'js/data.js', 'js/logic.js']
root = 'e:/Nuove App Installate/App esercizi scienze motorie'

print("--- ADVANCED ES6 METHOD & FUNCTION ANALYSIS ---")
for rel_path in files:
    full_path = os.path.join(root, rel_path)
    with open(full_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    empty_methods = []
    return_constant_methods = []
    
    for i, line in enumerate(lines):
        # look for method signatures or arrow functions
        if re.search(r'(\w+)\s*\([^)]*\)\s*\{', line) or re.search(r'(\w+)\s*:\s*function', line) or re.search(r'(\w+)\s*=\s*\([^)]*\)\s*=>', line):
            # check the next few lines for immediate return or empty body
            block = "".join(lines[i:min(len(lines), i+5)]).replace('\n', ' ')
            if re.search(r'\{\s*\}', block):
                empty_methods.append((i+1, line.strip()))
            elif re.search(r'\{\s*return\s+(true|false|null|undefined|\d+|"[^"]*"|' + r"'[^']*');?\s*\}", block):
                return_constant_methods.append((i+1, line.strip(), block.strip()))

    print(f"\nFile: {rel_path} ({len(lines)} lines)")
    print(f"  Empty methods found: {len(empty_methods)}")
    for line_no, stmt in empty_methods[:5]:
        print(f"    Line {line_no}: {stmt}")
    print(f"  Constant return methods found: {len(return_constant_methods)}")
    for line_no, stmt, blk in return_constant_methods[:5]:
        print(f"    Line {line_no}: {blk}")
