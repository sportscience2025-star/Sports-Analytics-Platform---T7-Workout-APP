import urllib.request
import urllib.parse
import json
import time

def get_pmid(q):
    time.sleep(0.5)
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(q)}&retmode=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SportsSci/1.0'})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req) as r:
                ids = json.loads(r.read().decode())['esearchresult']['idlist']
            if not ids:
                return "Not found"
            time.sleep(0.5)
            url2 = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(ids[:3])}&retmode=json"
            req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SportsSci/1.0'})
            with urllib.request.urlopen(req2) as r2:
                res = json.loads(r2.read().decode())['result']
            return [(i, res[i].get('pubdate', '')[:4], res[i].get('source', ''), res[i].get('title', '')) for i in ids[:3] if i in res]
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(2.0 * (attempt + 1))
            else:
                return f"Error: {e}"
        except Exception as e:
            return f"Error: {e}"
    return "Failed after retries"

print("Midgley VO2max:", get_pmid("Midgley AW[Author] AND Sports Med[Journal] AND VO2max"))
print("\nCrewther fatigue potentiation:", get_pmid("Crewther B[Author] AND Sports Med[Journal] AND potentiation"))
print("\nWasserman anaerobic threshold:", get_pmid("Wasserman K[Author] AND J Appl Physiol[Journal] AND anaerobic threshold"))
print("\nGibala 2006 sprint interval:", get_pmid("Gibala MJ[Author] AND J Physiol[Journal] AND sprint interval training"))
print("\nGollnick 1972:", get_pmid("Gollnick PD[Author] AND J Appl Physiol[Journal] AND 1972[Date - Publication]"))
print("\nHawley Cell 2014:", get_pmid("Hawley JA[Author] AND Cell[Journal] AND Integrative biology of exercise"))
print("\nMillet neuromuscular fatigue:", get_pmid("Millet GY[Author] AND Sports Med[Journal] AND ultra-endurance"))
print("\nSchoenfeld frequency 2016:", get_pmid("Schoenfeld BJ[Author] AND Sports Med[Journal] AND 2016[Date - Publication] AND frequency"))
print("\nMcGuigan monitoring load:", get_pmid("McGuigan MR[Author] AND Int J Sports Physiol Perform[Journal] AND resistance training AND monitoring"))
