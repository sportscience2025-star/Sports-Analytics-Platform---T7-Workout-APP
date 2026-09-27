import json

with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/full_remediation_table.json', 'r', encoding='utf-8') as f:
    table = json.load(f)

remediation_dict = {}

for it in table:
    remediation_dict[it["id"]] = {
        "id": it["id"],
        "area": it["area"],
        "current_url": it["current_url"],
        "current_pmid": it["current_pmid"],
        "correct_pmid": it["correct_pmid"],
        "correct_url": it["correct_url"],
        "doi": it.get("doi"),
        "type": it.get("type", "JOURNAL_ARTICLE"),
        "verified_title": it["verified_title"],
        "verified_authors": it["verified_authors"],
        "verified_journal": it["verified_journal"],
        "verified_date": it.get("verified_date")
    }

with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/remediation_dict.json', 'w', encoding='utf-8') as f_out:
    json.dump(remediation_dict, f_out, indent=2, ensure_ascii=False)

print(f"Generated remediation_dict.json with {len(remediation_dict)} entries.")
