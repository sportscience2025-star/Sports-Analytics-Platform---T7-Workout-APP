import os
import re

for root, dirs, files in os.walk("."):
    if ".git" in root or "node_modules" in root:
        continue
    for f in files:
        if f.endswith((".js", ".md", ".json", ".py", ".html")):
            path = os.path.join(root, f)
            try:
                with open(path, "r", encoding="utf-8") as file:
                    content = file.read()
                    if "385" in content:
                        print(f"Found '385' in {path}")
            except Exception as e:
                pass
