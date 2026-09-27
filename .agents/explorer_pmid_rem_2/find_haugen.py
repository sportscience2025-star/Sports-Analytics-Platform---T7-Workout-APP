import urllib.request
import urllib.parse
import json

def get_author_papers(query):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(query)}&retmode=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        ids = data.get('esearchresult', {}).get('idlist', [])
    if not ids:
        print("No papers for", query)
        return
    url2 = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(ids)}&retmode=json"
    req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req2) as resp:
        data2 = json.loads(resp.read().decode()).get('result', {})
    for i in ids:
        p = data2.get(i, {})
        print(f"[{i}] ({p.get('pubdate')}) {p.get('source')}: {p.get('title')}")

print("Papers by Haugen AND Tonnessen:")
get_author_papers("Haugen T[Author] AND Tonnessen E[Author]")
