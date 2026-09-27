import os
import re

files = ['js/ui.js', 'js/data.js', 'js/logic.js']
root = 'e:/Nuove App Installate/App esercizi scienze motorie'

print("--- DETAILED FUNCTION IMPLEMENTATION CHECK ---")
for rel_path in files:
    full_path = os.path.join(root, rel_path)
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Match function signatures
    # matches function name(...) { body }
    func_pattern = r'function\s+([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*\{([^}]*)\}'
    matches = re.findall(func_pattern, content)
    
    facades = []
    for name, body in matches:
        clean_body = body.strip()
        # check if body is empty or just return constant/true/false/null/undefined/{}/[]
        if not clean_body or re.match(r'^(return\s+[^;]+;?|console\.log\([^)]*\);?)$', clean_body):
            facades.append((name, clean_body))
            
    print(f"\nFile: {rel_path} - Total functions analyzed: {len(matches)}")
    if facades:
        print(f"  [POTENTIAL FACADES] {len(facades)} simple/one-liner functions:")
        for name, body in facades[:10]:
            print(f"    - {name}(): {body}")
    else:
        print("  [OK] No trivial facade functions found.")
