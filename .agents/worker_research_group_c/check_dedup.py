import json
import re

# Load existing sources from js/knowledge-base.js
with open('../../js/knowledge-base.js', 'r', encoding='utf-8') as f:
    kb_text = f.read()

# Extract all PMIDs, titles, and IDs from knowledge-base.js
existing_pmids = set(re.findall(r'pubmed\.ncbi\.nlm\.nih\.gov/(\d+)/', kb_text))
existing_titles = [t.strip().lower() for t in re.findall(r'"title":\s*"([^"]+)"', kb_text)]
existing_ids = set(re.findall(r'"id":\s*"([^"]+)"', kb_text))

print(f"Existing in knowledge-base.js: {len(existing_pmids)} PMIDs, {len(existing_titles)} titles, {len(existing_ids)} IDs")

# Load fetched 28 records
with open('fetched_metadata.json', 'r', encoding='utf-8') as f:
    fetched = json.load(f)

print(f"Fetched candidates: {len(fetched)}")

collisions = []
for item in fetched:
    p = item['pmid']
    t = item['title'].strip().lower()
    if p in existing_pmids:
        collisions.append(f"PMID COLLISION: {p} ({item['title']})")
    for et in existing_titles:
        if t == et or (len(t) > 20 and t in et) or (len(et) > 20 and et in t):
            collisions.append(f"TITLE COLLISION: {item['title']} vs {et}")

if collisions:
    print("COLLISIONS FOUND:")
    for c in collisions:
        print(" ", c)
else:
    print("ZERO COLLISIONS! All 28 candidates are 100% distinct from the 161 existing sources!")
