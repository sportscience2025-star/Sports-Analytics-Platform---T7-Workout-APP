with open("js/data.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "clinicalConditions" in line or "CLINICAL" in line or "category:" in line:
        if i < 200 or "clinicalConditions" in line or "// ---" in line:
            print(f"Line {i+1}: {line.strip()[:100]}")
