import json

with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/resolved_batch_1.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

unresolved = [it for it in items if not it["resolved"]]
print(f"Unresolved count: {len(unresolved)}")

for u in unresolved:
    print(f"\nID: {u['id']} ({u['area']})")
    print(f"  Expected: {u['expected_title']} | {u['expected_authors']} ({u['expected_year']}) | {u['expected_journal']}")
    print(f"  Current PMID: {u['current_pmid']}")
    if u['best_match']:
        print(f"  Best Match PMID: {u['best_match']['pmid']} (Score: {u['best_score']:.2f})")
        print(f"    Title: {u['best_match']['title']}")
        print(f"    Authors: {u['best_match']['authors']}")
        print(f"    Source: {u['best_match']['journal']} ({u['best_match']['pubdate']})")
    else:
        print("  NO MATCH")
