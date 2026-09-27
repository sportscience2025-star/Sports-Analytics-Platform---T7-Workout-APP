import re
import json

with open('js/knowledge-base.js', 'r', encoding='utf-8') as f:
    content = f.read()

ids = re.findall(r'"id":\s*"([^"]+)"', content)
titles = re.findall(r'"title":\s*"([^"]+)"', content)
urls = re.findall(r'"url":\s*"([^"]+)"', content)

pmids = []
for u in urls:
    m = re.search(r'pubmed\.ncbi\.nlm\.nih\.gov/(\d+)', u)
    if m:
        pmids.append(m.group(1))

print(f"Extracted {len(ids)} IDs, {len(titles)} titles, {len(urls)} URLs, {len(pmids)} PMIDs.")

with open('.agents/worker_research_group_b/existing_sources.json', 'w', encoding='utf-8') as out:
    json.dump({
        'ids': ids,
        'titles': [t.lower().strip() for t in titles],
        'pmids': pmids
    }, out, indent=2)
