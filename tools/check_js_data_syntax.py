with open('js/data.js', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

for i in range(35, 42):
    print(f"Line {i+1}: {repr(lines[i])}")
