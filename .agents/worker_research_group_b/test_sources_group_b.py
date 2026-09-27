import json
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('.agents/worker_research_group_b/sources_group_b.json', 'r', encoding='utf-8') as f:
    sources = json.load(f)

print(f"Loaded {len(sources)} sources from sources_group_b.json")

# Extract PMIDs
pmid_map = {}
for s in sources:
    import re
    m = re.search(r'pubmed\.ncbi\.nlm\.nih\.gov/(\d+)', s['url'])
    if not m:
        print(f"ERROR: No valid PubMed URL in {s['id']}: {s['url']}")
        sys.exit(1)
    pmid = m.group(1)
    pmid_map[pmid] = s

print(f"Validating all {len(pmid_map)} PMIDs against NCBI E-utilities...")

params = {
    'db': 'pubmed',
    'id': ','.join(pmid_map.keys()),
    'retmode': 'xml'
}
url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?{urllib.parse.urlencode(params)}"
req = urllib.request.Request(url, headers={'User-Agent': 'T7Auditor/1.0'})

with urllib.request.urlopen(req, timeout=20) as resp:
    root = ET.fromstring(resp.read())
    found_articles = root.findall('.//PubmedArticle')
    print(f"NCBI returned {len(found_articles)} articles.")
    
    verified_count = 0
    for article in found_articles:
        pmid_el = article.find('.//MedlineCitation/PMID')
        pmid = pmid_el.text if pmid_el is not None else ''
        title_el = article.find('.//ArticleTitle')
        title = "".join(title_el.itertext()).strip() if title_el is not None else ''
        if title.endswith('.'):
            title = title[:-1]
        
        if pmid in pmid_map:
            local_title = pmid_map[pmid]['title']
            print(f"[VERIFIED] PMID {pmid}:")
            print(f"  Local Title: {local_title}")
            print(f"  NCBI Title:  {title}")
            verified_count += 1

    if verified_count == len(sources):
        print(f"\nSUCCESS: All {verified_count}/28 sources are genuine, indexed NCBI papers!")
    else:
        print(f"\nERROR: Only {verified_count}/28 verified!")
        sys.exit(1)
