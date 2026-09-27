import os
import re

files = ['js/ui.js', 'js/data.js', 'js/logic.js', 'css/style.css', 'sw.js']
root = 'e:/Nuove App Installate/App esercizi scienze motorie'

print("--- FORENSIC CODE ANALYSIS ---")
for rel_path in files:
    full_path = os.path.join(root, rel_path)
    if not os.path.exists(full_path):
        print(f"MISSING FILE: {rel_path}")
        continue
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    print(f"\nFile: {rel_path} ({len(content.splitlines())} lines, {len(content)} bytes)")
    
    # Check suspicious keywords
    keywords = ['mock', 'dummy', 'todo', 'fixme', 'hardcoded', 'fake', 'bypass', 'notimplemented']
    found_any = False
    for kw in keywords:
        matches = list(re.finditer(r'\b' + kw + r'\b', content, re.IGNORECASE))
        if matches:
            found_any = True
            print(f"  [WARNING] Keyword '{kw}' found {len(matches)} times")
            for m in matches[:5]:
                # Print snippet around match
                start = max(0, m.start() - 30)
                end = min(len(content), m.end() + 30)
                snippet = content[start:end].replace('\n', ' ')
                print(f"    Snippet: ...{snippet}...")
    if not found_any:
        print("  [OK] No suspicious keywords found.")

print("\n--- CHECKING SW.JS CACHE VERSION ---")
with open(os.path.join(root, 'sw.js'), 'r', encoding='utf-8') as f:
    sw_content = f.read()
cache_match = re.search(r"const\s+CACHE_NAME\s*=\s*['\"]([^'\"]+)['\"]", sw_content)
if cache_match:
    print(f"  Current CACHE_NAME: {cache_match.group(1)}")
else:
    print("  [ERROR] CACHE_NAME not found in sw.js")
