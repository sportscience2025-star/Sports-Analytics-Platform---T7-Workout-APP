import json
import os

with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/auditor_integrity_forensics/pubmed_verification_results.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("Not found count:", len(data.get("not_found", [])))
print("Mismatches count:", len(data.get("mismatches", [])))

target_areas = {'biomeccanica', 'clinico', 'sportSquadra', 'sport-squadra', 'sport_squadra'}

not_found_targets = [item for item in data.get("not_found", []) if item.get("area") in target_areas]
mismatch_targets = [item for item in data.get("mismatches", []) if item.get("source", {}).get("area") in target_areas]

print(f"Target Not Found: {len(not_found_targets)}")
for nf in not_found_targets:
    print(f"  - {nf['id']}: {nf['pmid']} ({nf['title'][:40]}...)")

print(f"Target Mismatches: {len(mismatch_targets)}")
by_area = {}
for m in mismatch_targets:
    a = m['source']['area']
    by_area[a] = by_area.get(a, 0) + 1

print("By area:", by_area)
