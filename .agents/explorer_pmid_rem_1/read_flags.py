import json

with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/flagged_entries.json', 'r', encoding='utf-8') as f:
    flags = json.load(f)

print(f"Total flags: {len(flags)}")
for idx, fl in enumerate(flags):
    print(f"\n[{idx+1}] ID: {fl['id']} ({fl['area']})")
    print(f"  Exp: '{fl['expected_title']}' by {fl['expected_authors']}")
    print(f"  Cand: PMID {fl['candidate_pmid']} -> '{fl['verified_title']}' by {fl['verified_authors'][:3]}")
