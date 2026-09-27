import json

with open(r"e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_2/to_resolve.json", 'r', encoding='utf-8') as f:
    data = json.load(f)

items = [m['source'] for m in data['mismatches']] + data['not_found']
sp_items = [it for it in items if it['area'] == 'sollevamentoPesi']

print(f"Total Sollevamento Pesi items: {len(sp_items)}")
for idx, it in enumerate(sp_items, 1):
    print(f"[{idx:02d}] ID: {it['id']}")
    print(f"     Title:   {it.get('title')}")
    print(f"     Authors: {it.get('authors')}")
    print(f"     Year:    {it.get('year')} | Journal: {it.get('journal')}")
    print(f"     OldPMID: {it.get('pmid')}")
