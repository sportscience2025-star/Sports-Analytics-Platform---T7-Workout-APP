with open("js/data.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"Total lines in js/data.js: {len(lines)}")

cc_assignments = []
for i, line in enumerate(lines):
    if "clinicalConditions" in line:
        print(f"Line {i+1}: {line.strip()[:120]}")
