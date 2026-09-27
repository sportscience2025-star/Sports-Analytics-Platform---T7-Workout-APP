import urllib.request
import urllib.parse
import json

def search(q):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(q)}&retmode=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as r:
        ids = json.loads(r.read().decode())['esearchresult']['idlist']
    if not ids:
        return []
    url2 = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(ids[:5])}&retmode=json"
    req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req2) as r2:
        res = json.loads(r2.read().decode())['result']
    return [(i, res[i].get('source', ''), res[i].get('title', ''), [a['name'] for a in res[i].get('authors', [])]) for i in ids[:5] if i in res]

print("Title: Predictive accuracy bench press load velocity:")
for x in search('"Predictive accuracy" AND "bench press" AND ("load-velocity" OR "velocity")'):
    print(x)

print("\nTitle words: load velocity relationship bench press:")
for x in search('"load-velocity relationship" AND "bench press" AND Sanchez-Medina[Author]'):
    print(x)
