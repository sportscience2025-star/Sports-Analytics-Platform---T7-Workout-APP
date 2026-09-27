import json

with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/scope_items.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print(f"Total: {len(items)}")
areas = {}
for item in items:
    a = item['area']
    areas.setdefault(a, []).append(item)

for a, list_items in areas.items():
    print(f"\n=== Area: {a} ({len(list_items)} items) ===")
    for it in list_items:
        print(f"[{it['id']}] {it['authors'].split(',')[0]} ({it['year']}) - '{it['title'][:60]}' | PMID: {it['current_pmid']}")
