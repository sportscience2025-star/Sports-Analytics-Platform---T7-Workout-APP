import glob
import os
import re
import sys

# Ensure UTF-8 output stdout
sys.stdout.reconfigure(encoding='utf-8')

print("Starting deep forensic scan of project files...")

js_files = glob.glob("js/*.js") + glob.glob("*.js")
print(f"Found {len(js_files)} JS files.")

prohibited_found = []

for filepath in js_files:
    filename = os.path.relpath(filepath)
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    # Check 1: Hardcoded test passes or fabricated outputs
    if "return 'PASS'" in content or 'return "PASS"' in content:
        prohibited_found.append((filename, "Hardcoded 'PASS' return string"))

    # Check 2: Unconditional true assertions
    fake_asserts = re.findall(r'assert\(\s*true\s*,\s*[\'"](.*?)[\'"]\)', content)
    if fake_asserts:
        for fa in fake_asserts:
            prohibited_found.append((filename, f"Fake unconditional assertion: assert(true, '{fa}')"))

    # Check 3: Empty functions / facade implementations
    facades = re.findall(r'function\s+\w+\s*\([^)]*\)\s*\{\s*return\s+(?:true|false|0|""|\'\')[;\s]*\}', content)
    if facades:
        for fac in facades:
            prohibited_found.append((filename, f"Possible facade function: {fac}"))

print(f"Audit scan completed. Total suspicious findings: {len(prohibited_found)}")
for fname, issue in prohibited_found:
    print(f"  [X] {fname}: {issue}")
