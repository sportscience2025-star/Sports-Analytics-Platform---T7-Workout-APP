import json

with open('.agents/worker_research_group_b/candidates.json', 'r', encoding='utf-8') as f:
    cand1 = json.load(f)

with open('.agents/worker_research_group_b/more_biomech.json', 'r', encoding='utf-8') as f:
    cand_bio = json.load(f)

with open('.agents/worker_research_group_b/more_physiol.json', 'r', encoding='utf-8') as f:
    cand_phy = json.load(f)

with open('.agents/worker_research_group_b/existing_sources.json', 'r', encoding='utf-8') as f:
    existing = json.load(f)

existing_pmids = set(existing['pmids'])
existing_titles = set(existing['titles'])

all_bio = {}
for a in cand1.get('biomeccanica', []) + cand_bio:
    pmid = a['pmid']
    if pmid not in existing_pmids and a['title'].lower() not in existing_titles and pmid not in all_bio:
        all_bio[pmid] = a

all_phy = {}
for a in cand1.get('fisiologia', []) + cand_phy:
    pmid = a['pmid']
    if pmid not in existing_pmids and a['title'].lower() not in existing_titles and pmid not in all_phy:
        all_phy[pmid] = a

print(f"Available unique Biomeccanica: {len(all_bio)}")
for pmid, a in all_bio.items():
    print(f"  [BIO] PMID {pmid} | {a['year']} | {a['authors'][:30]} | {a['title']}")

print(f"\nAvailable unique Fisiologia: {len(all_phy)}")
for pmid, a in all_phy.items():
    print(f"  [PHY] PMID {pmid} | {a['year']} | {a['authors'][:30]} | {a['title']}")
