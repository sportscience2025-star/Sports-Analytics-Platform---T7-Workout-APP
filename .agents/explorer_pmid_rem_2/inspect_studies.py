import json

results_path = r"e:/Nuove App Installate/App esercizi scienze motorie/.agents/auditor_integrity_forensics/pubmed_verification_results.json"
with open(results_path, 'r', encoding='utf-8') as f:
    results = json.load(f)

target_areas = {'atletica', 'sollevamentoPesi', 'fisiologia', 'vbt'}

mismatches = results.get('mismatches', [])
not_found = results.get('not_found', [])

our_mismatches = [m for m in mismatches if m['source']['area'] in target_areas]
our_not_found = [nf for nf in not_found if nf['area'] in target_areas]

print(f"Our mismatches: {len(our_mismatches)}")
print(f"Our not found: {len(our_not_found)}")

by_area = {}
for m in our_mismatches:
    a = m['source']['area']
    by_area.setdefault(a, []).append(m)

for nf in our_not_found:
    a = nf['area']
    by_area.setdefault(a, []).append({'source': nf, 'is_not_found': True})

for a, items in by_area.items():
    print(f"Area {a}: {len(items)} items needing remediation")

# Let's write out a list of all studies we need to resolve
with open(r"e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_2/to_resolve.json", 'w', encoding='utf-8') as f:
    json.dump({'mismatches': our_mismatches, 'not_found': our_not_found}, f, indent=2)

print("Saved to_resolve.json successfully")
