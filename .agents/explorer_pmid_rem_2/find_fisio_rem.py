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
    ("Wasserman 1973", 'Wasserman K[Author] AND Whipp BJ[Author] AND 1973[Date - Publication]'),
    ("Gibala 2006", 'Gibala MJ[Author] AND "skeletal muscle oxidative capacity"'),
    ("Midgley 2007", 'Midgley AW[Author] AND "maximal oxygen uptake" AND 2007[Date - Publication]'),
    ("Crewther 2006", 'Crewther[Author] AND Cronin[Author] AND 2006[Date - Publication]'),
    ("Millet 2011", 'Millet GY[Author] AND "Neuromuscular fatigue" AND 2011[Date - Publication]'),
    ("McGuigan", 'McGuigan MR[Author] AND "monitoring" AND "resistance training" AND "fatigue"')
]

for name, q in queries:
    res = find_study(q)
    print(f"\n{name} ({q}):")
    if isinstance(res, list):
        for item in res:
            print(f"  PMID: {item[0]} | Year: {item[1]} | Journal: {item[2]} | Title: {item[3]} | Authors: {item[4]}")
    else:
        print(f"  Result: {res}")
