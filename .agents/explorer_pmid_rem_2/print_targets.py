import json

with open(r"e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_2/to_resolve.json", 'r', encoding='utf-8') as f:
    data = json.load(f)

mismatches = data['mismatches']
not_found = data['not_found']

items = []
for m in mismatches:
    items.append(m['source'])
for nf in not_found:
    items.append(nf)

print(f"Total target studies: {len(items)}")

for idx, it in enumerate(items, 1):
    print(f"[{idx:02d}] {it['area']} | {it['id']} | {it.get('pmid')} | {it.get('year')} | {it.get('authors')[:30]}... | {it.get('title')}")
