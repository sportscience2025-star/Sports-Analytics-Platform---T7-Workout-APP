import json

path = r"e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_2/to_resolve.json"
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

items = [m['source'] for m in data['mismatches']] + data['not_found']

for idx, it in enumerate(items[:28], 1):
    print(f"[{idx:02d}] {it['area']} | {it['id']} | {it.get('pmid')} | {it.get('year')} | {it.get('authors')[:30]}... | {it.get('title')}")
