# -*- coding: utf-8 -*-
import glob
import os
import re
import subprocess
import tempfile

files = sorted(glob.glob("architecture-blueprint/00-capitolato-tecnico-e-glossario/[0-1][0-9]-*.md"))
flow_files = [f for f in files if not f.endswith("00-GLOSSARIO-TERMINI-TECNICI.md")]

print(f"Validating Mermaid sequence diagrams across {len(flow_files)} files...")

temp_dir = os.path.join(os.getcwd(), ".browser-env", "temp")
os.makedirs(temp_dir, exist_ok=True)

errors = []
for f in flow_files:
    fname = os.path.basename(f)
    with open(f, encoding="utf-8") as fp:
        content = fp.read()
    
    # Extract mermaid sequenceDiagram block
    m = re.search(r"```mermaid\s+(sequenceDiagram[\s\S]*?)```", content)
    if not m:
        errors.append((fname, "No sequenceDiagram block found!"))
        continue
    
    seq_code = m.group(1).strip()
    
    # Write to a temp .mmd file in temp_dir
    mmd_path = os.path.join(temp_dir, f"test_{fname}.mmd")
    svg_path = os.path.join(temp_dir, f"test_{fname}.svg")
    with open(mmd_path, "w", encoding="utf-8") as tf:
        tf.write(seq_code)
    
    # Run npx @mermaid-js/mermaid-cli
    cmd = ["cmd", "/c", "npx", "@mermaid-js/mermaid-cli", "-i", mmd_path, "-o", svg_path]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if res.returncode != 0:
            errors.append((fname, f"Mermaid compile error: {res.stderr or res.stdout}"))
        else:
            print(f"OK: {fname}")
    except Exception as e:
        errors.append((fname, str(e)))

print("\n--- RESULTS ---")
print(f"Total files checked: {len(flow_files)}")
print(f"Errors found: {len(errors)}")
for fname, err in errors:
    print(f"FAIL {fname}: {err}")

if not errors:
    print("ALL 18 MERMAID SEQUENCE DIAGRAMS COMPILED CLEANLY!")
