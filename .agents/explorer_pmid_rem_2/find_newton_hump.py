import urllib.request
import urllib.parse
import json

url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote('Newton RU[Author] AND Humphries BJ[Author]')}&retmode=json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    ids = json.loads(resp.read().decode())['esearchresult']['idlist']

url2 = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(ids)}&retmode=json"
req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req2) as resp:
    res = json.loads(resp.read().decode())['result']

for i in ids:
    p = res.get(i, {})
    print(f"[{i}] ({p.get('pubdate')}) {p.get('source')}: {p.get('title')}")
