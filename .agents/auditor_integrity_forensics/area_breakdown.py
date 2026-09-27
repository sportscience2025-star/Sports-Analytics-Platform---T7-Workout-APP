import json

with open('.agents/auditor_integrity_forensics/pubmed_verification_results.json', 'r', encoding='utf-8') as f:
    res = json.load(f)

with open('.agents/auditor_integrity_forensics/all_sources_dump.json', 'r', encoding='utf-8') as f:
    all_data = json.load(f)

mismatch_by_area = {}
notfound_by_area = {}
matched_by_area = {}
total_by_area = {}

for area, items in all_data.items():
    total_by_area[area] = len(items)
    mismatch_by_area[area] = 0
    notfound_by_area[area] = 0
    matched_by_area[area] = 0

for m in res['mismatches']:
    area = m['source']['area']
    mismatch_by_area[area] = mismatch_by_area.get(area, 0) + 1

for nf in res['not_found']:
    area = nf['area']
    notfound_by_area[area] = notfound_by_area.get(area, 0) + 1

for area in total_by_area:
    non_pmid = 1 if area == 'sollevamentoPesi' else 0
    matched_by_area[area] = total_by_area[area] - mismatch_by_area[area] - notfound_by_area[area] - non_pmid

print(f"{'Area':<20} | {'Total':<6} | {'Matched':<8} | {'Mismatch':<9} | {'Not Found':<9} | {'Non-PMID':<8}")
print("-" * 75)
for area in total_by_area:
    non_pmid = 1 if area == 'sollevamentoPesi' else 0
    print(f"{area:<20} | {total_by_area[area]:<6} | {matched_by_area[area]:<8} | {mismatch_by_area[area]:<9} | {notfound_by_area[area]:<9} | {non_pmid:<8}")
