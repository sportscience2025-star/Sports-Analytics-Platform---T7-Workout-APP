import json

with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/full_remediation_table.json', 'r', encoding='utf-8') as f:
    table = json.load(f)

# Fix sci_team_ekstrand_2011 immediately
for it in table:
    if it["id"] == "sci_team_ekstrand_2011":
        it["correct_pmid"] = "19553225"
        it["correct_url"] = "https://pubmed.ncbi.nlm.nih.gov/19553225/"
        it["verified_title"] = "Injury incidence and injury patterns in professional football: the UEFA injury study."
        it["verified_authors"] = ["Ekstrand J", "Hägglund M", "Waldén M"]
        it["verified_journal"] = "Br J Sports Med"
        it["verified_date"] = "2011 Jun"
        it["doi"] = "10.1136/bjsm.2009.060582"
        it["verification_status"] = "VERIFIED_NCBI_MATCH"

# Now let's write the complete detailed log to full_verification_check.txt
with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/full_verification_check.txt', 'w', encoding='utf-8') as out:
    for idx, it in enumerate(table):
        out.write(f"[{idx+1}/67] ID: {it['id']} | Area: {it['area']}\n")
        out.write(f"  Codebase Title:   {it['expected_title']}\n")
        out.write(f"  Codebase Authors: {it['expected_authors']}\n")
        out.write(f"  Codebase Year:    {it['expected_year']}\n")
        out.write(f"  Codebase Current PMID: {it['current_pmid']}\n")
        out.write(f"  Correct PMID:     {it['correct_pmid']}\n")
        out.write(f"  Correct URL:      {it['correct_url']}\n")
        out.write(f"  Verified Title:   {it['verified_title']}\n")
        out.write(f"  Verified Authors: {', '.join(it['verified_authors']) if isinstance(it['verified_authors'], list) else it['verified_authors']}\n")
        out.write(f"  Verified Source:  {it['verified_journal']} ({it.get('verified_date', '')})\n")
        out.write(f"  DOI:              {it.get('doi', 'N/A')}\n")
        out.write(f"  Status:           {it['verification_status']}\n")
        out.write("-" * 75 + "\n")

# Re-save the updated json table
with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/full_remediation_table.json', 'w', encoding='utf-8') as f_out:
    json.dump(table, f_out, indent=2, ensure_ascii=False)

print("Saved full_verification_check.txt and updated full_remediation_table.json")
