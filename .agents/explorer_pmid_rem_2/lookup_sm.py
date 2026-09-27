import urllib.request
import urllib.parse
import json

def get_pmid(q):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(q)}&retmode=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as r:
        ids = json.loads(r.read().decode())['esearchresult']['idlist']
    if not ids:
        return None
    url2 = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={ids[0]}&retmode=json"
    req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req2) as r2:
        res = json.loads(r2.read().decode())['result'][ids[0]]
    return ids[0], res.get('title'), res.get('source'), res.get('pubdate')

print("Sanchez-Medina 2011 DOI:", get_pmid("10.1249/MSS.0b013e318213f880[DOI]"))
print("Sanchez-Medina title:", get_pmid("Velocity loss as an indicator of neuromuscular fatigue[Title]"))
