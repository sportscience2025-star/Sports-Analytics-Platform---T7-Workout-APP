import os

da_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../js/data-analysis.js"))
with open(da_path, "r", encoding="utf-8") as f:
    content = f.read()

lines = content.splitlines()
for idx, line in enumerate(lines):
    if "cleanup()" in line or "cleanup =" in line:
        print(f"Line {idx+1}: {line}")
