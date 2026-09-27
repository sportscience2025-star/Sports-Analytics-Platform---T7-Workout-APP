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

atletica_searches = [
    ("sci_sprint_morin_2011", 'Morin JB[Author] AND "Technical ability of force application"'),
    ("sci_sprint_weyand_2000", 'Weyand[Author] AND "Faster top running speeds"'),
    ("sci_sprint_clark_2014", 'Clark KP[Author] AND Weyand PG[Author] AND 2014[Date - Publication]'),
    ("sci_sprint_cross_2017", 'Cross MR[Author] AND Morin JB[Author] AND 2017[Date - Publication]'),
    ("sci_sprint_cross_2017_b", 'Cross MR[Author] AND "sprint acceleration" AND "profiling"'),
    ("sci_sprint_lockie_2003", 'Lockie RG[Author] AND "resisted sled towing"'),
    ("sci_sprint_haugen_2014", 'Haugen[Author] AND "Sprint running performance" AND "compilation"'),
    ("sci_jump_komi_2000", 'Komi PV[Author] AND "Stretch-shortening cycle"'),
    ("sci_jump_bobbert_1996", 'Bobbert MF[Author] AND "countermovement jump height greater"'),
    ("sci_jump_ramirez_2014", 'Ramirez-Campillo[Author] AND "drop jump training" AND soccer'),
    ("sci_throws_terzis_2008", 'Terzis[Author] AND "shot putters"'),
    ("sci_sprint_morin_2016", 'Samozino[Author] AND Morin JB[Author] AND "simple method for computing sprint acceleration"'),
    ("sci_sprint_jimenez_2018", 'Jimenez-Reyes[Author] AND Samozino[Author] AND "force-velocity profiling" AND jumping'),
    ("sci_sprint_haugen_2019", 'Haugen[Author] AND "Sprint running performance monitoring"'),
    ("sci_jump_markstrom_2019", 'Ramirez-Campillo[Author] AND "Plyometric training for youth athletes"'),
    ("sci_jump_mcmahon_2017", 'McMahon JJ[Author] AND "Understanding the key phases of the countermovement jump"'),
    ("sci_sprint_alcaraz_2018", 'Alcaraz PE[Author] AND "resisted sprint" AND 2018[Date - Publication]'),
    ("sci_sprint_nagahara_2014", 'Nagahara[Author] AND "Association of acceleration with spatiotemporal variables"')
]

for sid, q in atletica_searches:
    time.sleep(0.35)
    r = find_study(q)
    print(f"\n{sid} (Query: {q}):")
    if isinstance(r, list):
        for item in r:
            print(f"  PMID: {item[0]} | Year: {item[1]} | Journal: {item[2]} | Title: {item[3]} | Authors: {item[4]}")
    else:
        print(f"  Result: {r}")
