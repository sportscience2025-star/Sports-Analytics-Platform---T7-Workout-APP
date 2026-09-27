import json
import os

with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/auditor_integrity_forensics/pubmed_verification_results.json', 'r', encoding='utf-8') as f:
    auditor_data = json.load(f)

# Also let's inspect the files directly to make sure we have the exact entry in the JS file
files = {
    'biomeccanica': r'e:/Nuove App Installate/App esercizi scienze motorie/js/data/sources/biomeccanica.js',
    'clinico': r'e:/Nuove App Installate/App esercizi scienze motorie/js/data/sources/clinico.js',
    'sportSquadra': r'e:/Nuove App Installate/App esercizi scienze motorie/js/data/sources/sport-squadra.js',
}

target_items = []

for nf in auditor_data.get("not_found", []):
    if nf.get("area") in files:
        target_items.append({
            "id": nf["id"],
            "area": nf["area"],
            "title": nf["title"],
            "authors": nf["authors"],
            "year": nf["year"],
            "journal": nf["journal"],
            "current_pmid": nf["pmid"],
            "issue": "NOT_FOUND",
            "mismatch_detail": "NCBI cannot get document summary"
        })

for m in auditor_data.get("mismatches", []):
    s = m["source"]
    if s.get("area") in files:
        target_items.append({
            "id": s["id"],
            "area": s["area"],
            "title": s["title"],
            "authors": s["authors"],
            "year": s["year"],
            "journal": s["journal"],
            "current_pmid": s["pmid"],
            "issue": "MISMATCH",
            "mismatch_detail": f"Returns: {m['ncbi_title']} ({m['ncbi_source']}) [{m.get('ncbi_authors', [])}]"
        })

print(f"Total target items to resolve: {len(target_items)}")
with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/scope_items.json', 'w', encoding='utf-8') as f_out:
    json.dump(target_items, f_out, indent=2, ensure_ascii=False)

print("Saved to scope_items.json")
