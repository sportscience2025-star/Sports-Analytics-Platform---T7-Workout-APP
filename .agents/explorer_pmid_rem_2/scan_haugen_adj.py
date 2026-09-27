import urllib.request
import urllib.parse
import json

base = 24509711
ids = [str(base + i) for i in range(-50, 51)]

url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(ids)}&retmode=json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode())['result']

for i in ids:
    p = res.get(i, {})
    if 'Haugen' in str(p.get('authors', [])) or 'sprint' in str(p.get('title', '')).lower():
        print(f"[{i}] ({p.get('pubdate')}) {p.get('source')}: {p.get('title')}")
