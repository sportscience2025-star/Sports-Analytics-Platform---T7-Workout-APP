import urllib.request
import urllib.parse
import json
import time

def search_pubmed(term):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(term)}&retmode=json&retmax=5"
    req = urllib.request.Request(url, headers={'User-Agent': 'ExplorerPMID/1.0 (mailto:ptomm@example.com)'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            ids = data.get('esearchresult', {}).get('idlist', [])
            if not ids:
                return []
            time.sleep(0.35)
            sum_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(ids)}&retmode=json"
            req2 = urllib.request.Request(sum_url, headers={'User-Agent': 'ExplorerPMID/1.0 (mailto:ptomm@example.com)'})
            with urllib.request.urlopen(req2, timeout=10) as resp2:
                sdata = json.loads(resp2.read().decode('utf-8'))
                res = []
                for i in ids:
                    doc = sdata.get('result', {}).get(i, {})
                    res.append({
                        'pmid': i,
                        'title': doc.get('title'),
                        'source': doc.get('source'),
                        'pubdate': doc.get('pubdate'),
                        'authors': [a.get('name') for a in doc.get('authors', [])]
                    })
                return res
    except Exception as e:
        print(f"Err on {term}: {e}")
        return []

tests = [
    ("sci_biomech_escamilla_2000", "Escamilla RF knee biomechanics squat"),
    ("sci_biomech_gregersen_2006", "Gregersen CS Hull ML"),
    ("sci_biomech_flanagan_2012", "Flanagan SP Salem GJ squat"),
    ("sci_biomech_vigotsky_2018", "Vigotsky AD Bryanton MA"),
    ("sci_biomech_vigotsky_2018_b", "Vigotsky AD squat biomechanics internal external"),
    ("sci_hamstring_petersen_2011", "Petersen J Thorborg K Nielsen MB hamstring football"),
    ("sci_shoulder_cools_2007", "Cools AM Struyf F scapular dyskinesis"),
    ("sci_shoulder_wilk_2009", "Wilk KE Reinold MM baseball shoulder"),
    ("sci_rsa_rampinini_2007", "Rampinini E Sassi A repeated-sprint football"),
    ("sci_rsa_rampinini_2007_b", "Rampinini E repeated-sprint ability in football players"),
    ("sci_team_taylor_2017", "Taylor JB Wright AA basketball systematic review"),
    ("sci_team_longo_2012", "Longo UG Loppini M prevention injuries football"),
    ("sci_team_mccall_2014", "McCall A Dupont G injury prevention football"),
    ("sci_team_mccall_2014_b", "McCall A Andersen TE FIFA 11+"),
    ("sci_team_tierney_2016", "Tierney GJ rugby hamstring"),
    ("sci_team_tierney_2016_b", "Tierney GJ hamstring injury prevention"),
    ("sci_team_harper_2019", "Harper DJ Kiely J deceleration"),
    ("sci_team_harper_2019_b", "Harper DJ Carling C Kiely J")
]

for label, term in tests:
    time.sleep(0.4)
    res = search_pubmed(term)
    print(f"\n=== {label}: Query '{term}' ===")
    for r in res:
        print(f"  PMID {r['pmid']}: {r['title']}")
        print(f"    Source: {r['source']} ({r['pubdate']}) | Authors: {r['authors'][:4]}")
