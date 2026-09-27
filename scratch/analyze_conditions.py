
with open('js/data.js', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

cond_lines = lines[41:1260]
import re
ids = []
comments = []
for i, l in enumerate(cond_lines):
    if '//' in l:
        comments.append((i+42, l.strip()))
    m = re.search(r" id:\s*["]([^\\]+)['\\]\, l)
    if m:
        ids.append((i+42, m.group(1)))

print('Found', len(ids), 'condition IDs.')
print('Unique IDs:', len(set([x[1] for x in ids])))
duplicates = {}
for line_no, cid in ids:
    duplicates.setdefault(cid, []).append(line_no)
dups = {k: v for k, v in duplicates.items() if len(v) > 1}
print('Duplicate IDs:', dups)

print('\nComments in conditions section:')
for line_no, c in comments[:30]:
    print(f'Line {line_no}: {c}')
