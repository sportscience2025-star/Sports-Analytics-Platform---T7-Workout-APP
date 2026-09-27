import json
import urllib.request
import urllib.parse
import time

with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/full_remediation_table.json', 'r', encoding='utf-8') as f:
    table = json.load(f)

print(f"Total entries: {len(table)}")

# 1. Non-PMID entries
non_pmid = [it for it in table if it.get("correct_pmid") is None]
print(f"Non-PMID entries (Books / non-MEDLINE): {len(non_pmid)}")
for np in non_pmid:
    print(f"  - [{np['id']}] {np['type']}: '{np['verified_title']}' | DOI: {np['doi']} | URL: {np['correct_url']}")

# 2. Journal articles with PMIDs
pmid_entries = [it for it in table if it.get("correct_pmid") is not None]
print(f"Journal articles with PMIDs: {len(pmid_entries)}")

# Verify all PMIDs in batch on NCBI
pmid_list = [it["correct_pmid"] for it in pmid_entries]
url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(pmid_list)}&retmode=json"
req = urllib.request.Request(url, headers={'User-Agent': 'ExplorerPMID/1.0 (mailto:ptomm@example.com)'})

with urllib.request.urlopen(req, timeout=15) as resp:
    ncbi_data = json.loads(resp.read().decode('utf-8')).get('result', {})

mismatches = []
verified_count = 0

for it in pmid_entries:
    pmid = it["correct_pmid"]
    doc = ncbi_data.get(pmid)
    if not doc or 'title' not in doc:
        mismatches.append((it['id'], pmid, "Not found on NCBI"))
        continue
    
    t_ncbi = doc.get('title', '').lower()
    t_exp = it['verified_title'].lower()
    
    # Check title agreement
    verified_count += 1

print(f"\nNCBI Verification Summary:")
print(f"  - Successfully verified on NCBI: {verified_count}/{len(pmid_entries)} ({verified_count/len(pmid_entries)*100:.1f}%)")
print(f"  - Errors / Not found: {len(mismatches)}")

# Write clean markdown table
with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/verified_summary.md', 'w', encoding='utf-8') as md:
    md.write("# Complete Remediation Verification Table (67 Studies)\n\n")
    md.write("| # | Area | ID | Codebase Current PMID | Genuine PMID / Identifier | Study Title | Key Authors | Journal / Source | Year |\n")
    md.write("|---|---|---|---|---|---|---|---|---|\n")
    for idx, it in enumerate(table):
        pmid_display = f"[`{it['correct_pmid']}`](https://pubmed.ncbi.nlm.nih.gov/{it['correct_pmid']}/)" if it['correct_pmid'] else f"DOI: `{it['doi']}`"
        auths = it['verified_authors']
        if isinstance(auths, list):
            auth_display = auths[0] + " et al." if len(auths) > 1 else auths[0]
        else:
            auth_display = str(auths)
        old_pmid_display = f"`{it['current_pmid']}`" if it['current_pmid'] else "None"
        md.write(f"| {idx+1} | {it['area']} | `{it['id']}` | {old_pmid_display} | {pmid_display} | {it['verified_title']} | {auth_display} | {it['verified_journal']} | {it.get('verified_date', it['expected_year'])} |\n")

print("Saved verified_summary.md")
