import urllib.request
import urllib.parse
import json
import time

def find_study(query):
    time.sleep(0.5)
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(query)}&retmode=json&retmax=5"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SportsSci/1.0'})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req) as r:
                ids = json.loads(r.read().decode())['esearchresult']['idlist']
            if not ids:
                return "None"
            time.sleep(0.5)
            url2 = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(ids)}&retmode=json"
            req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SportsSci/1.0'})
            with urllib.request.urlopen(req2) as r2:
                res = json.loads(r2.read().decode())['result']
            return [(i, res[i].get('pubdate', '')[:4], res[i].get('source', ''), res[i].get('title', ''), [a['name'] for a in res[i].get('authors', [])[:3]]) for i in ids if i in res]
        except Exception as e:
            time.sleep(1.5)
    return "Error"

queries = [
    ("Gibala 2006", 'Gibala MJ[Author] AND "endurance performance" AND 2006[Date - Publication]'),
    ("Midgley 2007", 'Midgley AW[Author] AND McNaughton LR[Author] AND 2007[Date - Publication]'),
    ("Crewther 2006", 'Crewther B[Author] AND Cronin J[Author] AND 2006[Date - Publication]'),
    ("Millet 2011", 'Millet GY[Author] AND "ultra-marathons"'),
    ("Millet 2011 b", 'Millet GY[Author] AND "Neuromuscular fatigue in"'),
    ("McGuigan 2012", 'McGuigan MR[Author] AND "Monitoring training load and fatigue"'),
    ("Jones 2006", 'Jones AM[Author] AND "marathon" AND "case study"')
]

with open(r"e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_2/fisio_results.txt", 'w', encoding='utf-8') as out:
    for name, q in queries:
        res = find_study(q)
        out.write(f"\n{name} ({q}):\n")
        if isinstance(res, list):
            for item in res:
                out.write(f"  PMID: {item[0]} | Year: {item[1]} | Journal: {item[2]} | Title: {item[3]} | Authors: {item[4]}\n")
        else:
            out.write(f"  Result: {res}\n")

print("Finished writing fisio_results.txt")
