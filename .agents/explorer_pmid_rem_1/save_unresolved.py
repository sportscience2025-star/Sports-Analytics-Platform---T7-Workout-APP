import json
import sys

with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/resolved_batch_1.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

unresolved = [it for it in items if not it["resolved"]]
with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/unresolved_list.txt', 'w', encoding='utf-8') as out:
    out.write(f"Unresolved count: {len(unresolved)}\n\n")
    for u in unresolved:
        out.write(f"ID: {u['id']} ({u['area']})\n")
        out.write(f"  Expected Title:   {u['expected_title']}\n")
        out.write(f"  Expected Authors: {u['expected_authors']}\n")
        out.write(f"  Expected Year:    {u['expected_year']}\n")
        out.write(f"  Expected Journal: {u['expected_journal']}\n")
        out.write(f"  Current PMID:     {u['current_pmid']}\n")
        if u['best_match']:
            out.write(f"  Best Match PMID:  {u['best_match']['pmid']} (Score: {u['best_score']:.2f})\n")
            out.write(f"  Best Match Title: {u['best_match']['title']}\n")
            out.write(f"  Best Match Source:{u['best_match']['journal']} ({u['best_match']['pubdate']})\n")
            out.write(f"  Best Match Auth:  {u['best_match']['authors']}\n")
        else:
            out.write("  Best Match: None\n")
        out.write("-" * 60 + "\n")

print("Wrote unresolved_list.txt")
