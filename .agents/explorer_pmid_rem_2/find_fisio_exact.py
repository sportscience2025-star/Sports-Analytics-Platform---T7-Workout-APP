import urllib.request
import urllib.parse
import json

def get_pmid(q):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(q)}&retmode=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as r:
        ids = json.loads(r.read().decode())['esearchresult']['idlist']
    if not ids:
        return "Not found"
    url2 = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(ids[:3])}&retmode=json"
    req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req2) as r2:
        res = json.loads(r2.read().decode())['result']
    return [(i, res[i].get('pubdate', '')[:4], res[i].get('source', ''), res[i].get('title', '')) for i in ids[:3] if i in res]

print("Ronnestad & Mujika:", get_pmid("Ronnestad[Author] AND Mujika[Author] AND running"))
print("\nMidgley VO2max:", get_pmid("Midgley AW[Author] AND maximal oxygen uptake"))
print("\nCrewther fatigue potentiation:", get_pmid("Crewther B[Author] AND potentiation"))
print("\nWasserman anaerobic threshold:", get_pmid("Wasserman K[Author] AND anaerobic threshold AND 1973[Date - Publication]"))
print("\nGibala 2006 sprint interval:", get_pmid("Gibala MJ[Author] AND sprint interval training AND 2006[Date - Publication]"))
print("\nGollnick 1972:", get_pmid("Gollnick PD[Author] AND Enzyme activity AND 1972[Date - Publication]"))
print("\nHawley Cell 2014:", get_pmid("Hawley JA[Author] AND Cell[Journal] AND 2014[Date - Publication]"))
print("\nMillet neuromuscular fatigue:", get_pmid("Millet GY[Author] AND ultra endurance AND Sports Med[Journal]"))
print("\nSchoenfeld frequency 2016:", get_pmid("Schoenfeld BJ[Author] AND resistance training frequency AND Sports Med[Journal]"))
print("\nMcGuigan monitoring load:", get_pmid("McGuigan MR[Author] AND monitoring AND resistance training"))
