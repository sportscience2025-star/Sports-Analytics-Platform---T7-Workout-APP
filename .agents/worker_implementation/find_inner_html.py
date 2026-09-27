import os

da_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../js/data-analysis.js"))
with open(da_path, "r", encoding="utf-8") as f:
    content = f.read()

lines = content.splitlines()
with open("inner_html_out.txt", "w", encoding="utf-8") as out:
    for idx, line in enumerate(lines):
        if ".innerHTML =" in line:
            out.write(f"Line {idx+1}: {line}\n")
