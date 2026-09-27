import urllib.request
import json

base = 23136270
ids = [str(base + i) for i in range(-5, 6)]
url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(ids)}&retmode=json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode())['result']

for i in ids:
    p = res.get(i, {})
    print(f"[{i}] ({p.get('pubdate')}) {p.get('source')}: {p.get('title')}")
