import json

with open(r"e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_2/resolved_stage1.json", 'r', encoding='utf-8') as f:
    data = json.load(f)

results = data['results']

unresolved = [r for r in results if r['status'] == 'UNRESOLVED']
low_score_resolved = [r for r in results if r['status'] == 'RESOLVED' and r['match_score'] < 1.0]

print(f"Total results: {len(results)}")
print(f"Unresolved: {len(unresolved)}")
print(f"Resolved with score < 1.0: {len(low_score_resolved)}")

print("\n--- UNRESOLVED ITEMS ---")
for idx, u in enumerate(unresolved, 1):
    print(f"[{idx:02d}] {u['id']} ({u['area']}) | {u['orig_year']} | {u['orig_authors']} | Title: {u['orig_title']}")

print("\n--- LOW SCORE RESOLVED ITEMS (Potential false positives) ---")
for idx, l in enumerate(low_score_resolved, 1):
    print(f"[{idx:02d}] {l['id']} ({l['area']}) | Score: {l['match_score']} | Found PMID: {l['found_pmid']}")
    print(f"     Orig: {l['orig_title']}")
    print(f"    Found: {l['found_title']}")
