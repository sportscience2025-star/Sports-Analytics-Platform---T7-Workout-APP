import json

with open('.agents/auditor_integrity_forensics/pubmed_verification_results.json', 'r', encoding='utf-8') as f:
    res = json.load(f)

print('=== NOT FOUND PMIDs ===')
for nf in res['not_found']:
    print(f"ID: {nf['id']} | Area: {nf['area']} | PMID: {nf['pmid']} | Title: {nf['title']}")

print('\n=== SAMPLE OF MISMATCHES (First 20) ===')
for m in res['mismatches'][:20]:
    s = m['source']
    print(f"ID: {s['id']} [{s['area']}]")
    print(f"  Expected (Codebase): {s['title']} ({s['authors']}, {s['year']})")
    print(f"  PMID: {s['pmid']}")
    print(f"  Actual (PubMed):     {m['ncbi_title']} ({m['ncbi_source']}) - Authors: {m['ncbi_authors']}")
    print('-' * 70)
