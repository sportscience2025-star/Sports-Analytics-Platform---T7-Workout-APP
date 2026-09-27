with open("js/data.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

cc_lines = lines[42:958] # 0-indexed, line 43 to 958

id_matches = []
for idx, line in enumerate(cc_lines):
    if "id:" in line:
        id_matches.append((idx + 43, line.strip()))

print(f"Total 'id:' occurrences in clinicalConditions array: {len(id_matches)}")
print("First 5 id occurrences:")
for item in id_matches[:5]:
    print(item)
print("Last 5 id occurrences:")
for item in id_matches[-5:]:
    print(item)
