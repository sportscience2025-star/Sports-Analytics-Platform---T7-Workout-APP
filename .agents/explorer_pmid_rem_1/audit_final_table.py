import json

with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/full_remediation_table.json', 'r', encoding='utf-8') as f:
    table = json.load(f)

print(f"Total entries in table: {len(table)}")

by_area = {}
for entry in table:
    a = entry["area"]
    by_area.setdefault(a, []).append(entry)

for area, items in by_area.items():
    print(f"\n==================== AREA: {area} ({len(items)} items) ====================")
    for idx, it in enumerate(items):
        if it["type"] == "BOOK":
            print(f"{idx+1}. [{it['id']}] BOOK: '{it['verified_title']}' by {it['verified_authors']} | DOI: {it['doi']} | ISBN: {it['isbn']}")
            print(f"   Old URL: {it['current_url']} -> New URL: {it['correct_url']}")
        else:
            print(f"{idx+1}. [{it['id']}]")
            print(f"   Expected: '{it['expected_title']}' ({it['expected_authors'][:30]}...) [{it['expected_year']}]")
            print(f"   Verified: '{it['verified_title']}' ({it['verified_journal']}, {it['verified_date']})")
            print(f"   Verified Authors: {it['verified_authors'][:3]}")
            print(f"   PMID: {it['current_pmid']} -> {it['correct_pmid']}")
            print(f"   URL:  {it['current_url']} -> {it['correct_url']}")
            print(f"   DOI:  {it['doi']}")
            print(f"   Status: {it['verification_status']}")
            print("-" * 50)
