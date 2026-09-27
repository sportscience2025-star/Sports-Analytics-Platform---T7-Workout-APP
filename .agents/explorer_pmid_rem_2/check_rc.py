import urllib.request
import json

url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=24751658,25559903,24077376&retmode=json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode())['result']

for pmid in ['24751658', '25559903', '24077376']:
    p = res.get(pmid, {})
    print(f"[{pmid}] {p.get('source')}: {p.get('title')}")
    print("  Authors:", [a['name'] for a in p.get('authors', [])])
