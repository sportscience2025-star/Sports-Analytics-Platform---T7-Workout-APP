import re, json

def search_in_file(filepath, pattern):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    matches = [m.start() for m in re.finditer(pattern, content, re.IGNORECASE)]
    results = []
    lines = content.splitlines()
    for m in matches:
        line_num = content[:m].count('\n')
        start = max(0, line_num - 2)
        end = min(len(lines), line_num + 3)
        results.append((line_num + 1, "\n".join(f"{i+1}: {lines[i]}" for i in range(start, end))))
    return results

print("Searching in js/ui.js for muscle/category/dropdown handling:")
res = search_in_file("js/ui.js", "muscle|category|Piedi|select|dropdown")
print(f"Found {len(res)} occurrences in ui.js")
for r in res[:5]:
    print(f"--- Around line {r[0]} ---")
    print(r[1])
