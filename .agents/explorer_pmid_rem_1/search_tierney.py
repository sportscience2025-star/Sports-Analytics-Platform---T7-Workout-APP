import urllib.request
import urllib.parse
import json
import time

def q(term):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(term)}&retmode=json&retmax=10"
    req = urllib.request.Request(url, headers={'User-Agent': 'ExplorerPMID/1.0 (mailto:ptomm@example.com)'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        ids = json.loads(resp.read().decode('utf-8'))['esearchresult']['idlist']
    time.sleep(0.5)
    if not ids:
        print(f"No results for {term}")
        return
    s_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(ids)}&retmode=json"
    req2 = urllib.request.Request(s_url, headers={'User-Agent': 'ExplorerPMID/1.0 (mailto:ptomm@example.com)'})
    with urllib.request.urlopen(req2, timeout=10) as resp2:
        res = json.loads(resp2.read().decode('utf-8'))['result']
        for i in ids:
            doc = res[i]
            print(f"PMID {i}: {doc.get('title')} | {doc.get('source')} ({doc.get('pubdate')}) | Auth: {[a.get('name') for a in doc.get('authors', [])]}")

print("--- Tierney + rugby ---")
q("Tierney[Author] AND rugby")
time.sleep(1.0)
print("--- Tierney + hamstring ---")
q("Tierney[Author] AND hamstring")
