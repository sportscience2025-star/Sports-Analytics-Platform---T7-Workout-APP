import json

with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/flagged_entries.json', 'r', encoding='utf-8') as f:
    flags = json.load(f)

with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/flags_clean.txt', 'w', encoding='utf-8') as out:
    for idx, fl in enumerate(flags):
        out.write(f"[{idx+1}] ID: {fl['id']} ({fl['area']})\n")
        out.write(f"  Exp: '{fl['expected_title']}' by {fl['expected_authors']}\n")
        out.write(f"  Cand: PMID {fl['candidate_pmid']} -> '{fl['verified_title']}' by {fl['verified_authors'][:3]}\n\n")

print("Wrote flags_clean.txt")
