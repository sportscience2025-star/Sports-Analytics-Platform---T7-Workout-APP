import urllib.request
import urllib.parse
import json
import time

def find_study(query):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(query)}&retmode=json&retmax=5"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as r:
            ids = json.loads(r.read().decode())['esearchresult']['idlist']
        if not ids:
            return None
        url2 = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(ids)}&retmode=json"
        req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req2) as r2:
            res = json.loads(r2.read().decode())['result']
        return [(i, res[i].get('pubdate', '')[:4], res[i].get('source', ''), res[i].get('title', ''), [a['name'] for a in res[i].get('authors', [])[:3]]) for i in ids if i in res]
    except Exception as e:
        return f"Error: {e}"

sp_searches = [
    ("sci_ballistic_newton_1996", 'Newton RU[Author] AND "explosive upper body"'),
    ("sci_ballistic_newton_1996_b", 'Newton RU[Author] AND Kraemer WJ[Author] AND 1996[Date - Publication]'),
    ("sci_weightlifting_haff_2001", 'Haff GG[Author] AND Whitley[Author] AND Potteiger[Author]'),
    ("sci_weightlifting_stone_2006", 'Stone MH[Author] AND Sands WA[Author] AND "weightlifting performance"'),
    ("sci_weightlifting_stone_2006_b", 'Stone MH[Author] AND "vertical jump and sprint speed"'),
    ("sci_weightlifting_suchomel_2017", 'Suchomel TJ[Author] AND Comfort P[Author] AND "Weightlifting Derivatives"'),
    ("sci_weightlifting_garhammer_1993", 'Garhammer J[Author] AND "power output studies"'),
    ("sci_weightlifting_garhammer_1993_b", 'Garhammer J[Author] AND 1993[Date - Publication]'),
    ("sci_weightlifting_james_2018", 'James LP[Author] AND Haff GG[Author] AND Beckman EM[Author]'),
    ("sci_weightlifting_kipp_2012", 'Kipp K[Author] AND Comfort P[Author] AND ("power clean" OR "jump shrug")'),
    ("sci_weightlifting_haff_2015", 'Haff GG[Author] AND "monitoring an athlete"'),
    ("sci_weightlifting_stone_2005", 'Stone MH[Author] AND Sands WA[Author] AND "relationship to endurance"')
]

for sid, q in sp_searches:
    time.sleep(0.35)
    r = find_study(q)
    print(f"\n{sid} (Query: {q}):")
    if isinstance(r, list):
        for item in r:
            print(f"  PMID: {item[0]} | Year: {item[1]} | Journal: {item[2]} | Title: {item[3]} | Authors: {item[4]}")
    else:
        print(f"  Result: {r}")
