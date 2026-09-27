import urllib.request
import urllib.parse
import json

def get_pubmed(query):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(query)}&retmode=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as r:
        ids = json.loads(r.read().decode())['esearchresult']['idlist']
    if not ids:
        return []
    url2 = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(ids[:5])}&retmode=json"
    req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req2) as r2:
        res = json.loads(r2.read().decode())['result']
    return [(i, res[i].get('source', ''), res[i].get('pubdate', ''), res[i].get('title', '')) for i in ids[:5] if i in res]

print("Suchomel 2017:")
for x in get_pubmed('Suchomel[Author] AND "Weightlifting Derivatives" AND Sports Med[Journal]'):
    print(" ", x)

print("\nGarhammer:")
for x in get_pubmed('Garhammer J[Author]'):
    print(" ", x)

print("\nKipp jump shrug:")
for x in get_pubmed('Kipp K[Author] AND "jump shrug"'):
    print(" ", x)

print("\nNewton 1996:")
for x in get_pubmed('Newton RU[Author] AND Hakkinen K[Author] AND 1996[Date - Publication]'):
    print(" ", x)

print("\nHaff 2001:")
for x in get_pubmed('Haff GG[Author] AND Potteiger[Author]'):
    print(" ", x)
