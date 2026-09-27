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

fisio_searches = [
    ("sci_endurance_ronnestad_2014", 'Ronnestad BR[Author] AND Mujika I[Author] AND "Optimizing strength training"'),
    ("sci_endurance_midgley_2007", 'Midgley AW[Author] AND "how to maximize time at or near VO2max"'),
    ("sci_endurance_jones_2006", 'Jones AM[Author] AND "world record holder" AND "marathon"'),
    ("sci_physiol_ahtiainen_2003", 'Ahtiainen JP[Author] AND "Muscle hypertrophy, hormonal adaptation"'),
    ("sci_physiol_crewther_2006", 'Crewther[Author] AND "Two emerging concepts in physical training"'),
    ("sci_monitoring_mcguigan_2012", 'McGuigan MR[Author] AND Foster C[Author] AND "Monitoring training load"'),
    ("sci_physiol_bangsbo_1994", 'Bangsbo J[Author] AND 1994[Date - Publication] AND "intermittent"'),
    ("sci_physiol_wasserman_1973", 'Wasserman K[Author] AND "Anaerobic threshold and respiratory gas exchange"'),
    ("sci_physiol_gibala_2006", 'Gibala MJ[Author] AND "Short-term sprint interval training increases"'),
    ("sci_physiol_gollnick_1972", 'Gollnick PD[Author] AND "Enzyme activity and fiber composition"'),
    ("sci_physiol_hawley_2014", 'Hawley JA[Author] AND "Integrative biology of exercise"'),
    ("sci_physiol_millet_2011", 'Millet GY[Author] AND "Neuromuscular fatigue in ultra-endurance"'),
    ("sci_physiol_fry_1997", 'Fry AC[Author] AND Kraemer WJ[Author] AND "Overtraining in athletes"'),
    ("sci_physiol_schoenfeld_freq_2016", 'Schoenfeld BJ[Author] AND "resistance training frequency on measures of muscle hypertrophy"'),
    ("sci_physiol_behm_2010", 'Behm DG[Author] AND "Effect of acute static stretching on force, balance"')
]

for sid, q in fisio_searches:
    time.sleep(0.4)
    r = find_study(q)
    print(f"\n{sid}:")
    if isinstance(r, list):
        for item in r:
            print(f"  PMID: {item[0]} | Year: {item[1]} | Journal: {item[2]} | Title: {item[3]} | Authors: {item[4]}")
    else:
        print(f"  Result: {r}")
