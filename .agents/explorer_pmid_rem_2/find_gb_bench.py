import urllib.request
import urllib.parse
import json

def search(q):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(q)}&retmode=json&retmax=15"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as r:
        ids = json.loads(r.read().decode())['esearchresult']['idlist']
    if not ids:
        return []
    url2 = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(ids)}&retmode=json"
    req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req2) as r2:
        res = json.loads(r2.read().decode())['result']
    return [(i, res[i].get('pubdate', '')[:4], res[i].get('source', ''), res[i].get('title', '')) for i in ids if i in res]

print("Gonzalez-Badillo Bench Press papers:")
for item in search('Gonzalez-Badillo[Author] AND "bench press"'):
    print(item)
