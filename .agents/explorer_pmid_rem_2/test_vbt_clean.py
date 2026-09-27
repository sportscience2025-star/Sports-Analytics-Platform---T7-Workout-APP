import urllib.request
import urllib.parse
import json
import time

def search(q):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(q)}&retmode=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SportsSci/1.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            ids = json.loads(resp.read().decode())['esearchresult']['idlist']
        if not ids:
            return None
        url2 = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(ids[:3])}&retmode=json"
        req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SportsSci/1.0'})
        with urllib.request.urlopen(req2) as resp2:
            res = json.loads(resp2.read().decode())['result']
        return [(i, res[i].get('title'), res[i].get('source'), res[i].get('pubdate')) for i in ids[:3] if i in res]
    except Exception as e:
        return f"Error: {e}"

vbt_queries = [
    ("sci_vbt_badillo_2010", 'Gonzalez-Badillo[Author] AND "Movement velocity as a measure"'),
    ("sci_vbt_sanchez_2011", 'Sanchez-Medina[Author] AND "Velocity loss as an indicator"'),
    ("sci_vbt_pareja_2017", 'Pareja-Blanco[Author] AND "Effects of velocity loss during resistance training"'),
    ("sci_vbt_weakley_2021", 'Weakley[Author] AND "Velocity-Based Training: From Theory to Application"'),
    ("sci_vbt_garcia_2018", 'Garcia-Ramos[Author] AND "Force-Velocity Relationship in Resistance Exercises"'),
    ("sci_vbt_dorrell_2020", 'Dorrell[Author] AND "Comparison of velocity-based and traditional percentage-based"'),
    ("sci_vbt_jovanovic_2014", 'Jovanovic[Author] AND Flanagan[Author] AND "load-velocity"'),
    ("sci_vbt_banyard_2017", 'Banyard[Author] AND "reliability of individualized load-velocity profiles"'),
    ("sci_vbt_perez_2020", 'Perez-Castilla[Author] AND "velocity loss thresholds"'),
    ("sci_vbt_mann_2015", 'Mann JB[Author] AND "Velocity-based training in football"'),
    ("sci_vbt_conceicao_2016", 'Conceicao[Author] AND "Movement velocity as a measure of exercise intensity"'),
    ("sci_vbt_thompson_2023", 'Thompson SW[Author] AND "Velocity-based training" AND "systematic review"'),
    ("sci_vbt_balsalobre_2018_app", 'Balsalobre-Fernandez[Author] AND "novel iPhone app" AND "barbell velocity"'),
    ("sci_vbt_gonzalez_2017", 'Gonzalez-Badillo[Author] AND Sanchez-Medina[Author] AND 2010[Date - Publication]')
]

for sid, q in vbt_queries:
    time.sleep(0.4)
    r = search(q)
    print(f"\n{sid}:")
    if isinstance(r, list):
        for pmid, title, journal, pubdate in r:
            print(f"  PMID: {pmid} | ({pubdate}) {journal} | {title}")
    else:
        print(f"  Result: {r}")
