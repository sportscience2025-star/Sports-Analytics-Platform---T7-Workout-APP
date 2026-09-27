import urllib.request
import urllib.parse
import json
import time
import re

def search_ncbi(query):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(query)}&retmode=json&retmax=5"
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SportsSci/1.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode())
                return data.get('esearchresult', {}).get('idlist', [])
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(1.5 * (attempt + 1))
            else:
                print(f"HTTP error {e.code} for query {query}")
                return []
        except Exception as e:
            print(f"Exception for query {query}: {e}")
            time.sleep(1.0)
    return []

def get_summary(pmids):
    if not pmids:
        return {}
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(pmids)}&retmode=json"
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SportsSci/1.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode())
                return data.get('result', {})
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(1.5 * (attempt + 1))
            else:
                return {}
        except Exception as e:
            time.sleep(1.0)
    return {}

# Test query for Weyand 2000, Morin 2011, Clark 2014
test_cases = [
    ("Morin", "Technical ability of elite sprinters: ground force application orientation"),
    ("Weyand", "Faster top speeds of human sprinters are achieved with greater ground forces"),
    ("Clark", "General force-velocity trajectories describe maximal running accelerations in humans"),
    ("Cross", "Training at maximal power output in sprint acceleration"),
    ("Nagahara", "Association of Acceleration with Spatiotemporal Variables in Maximal Sprinting"),
    ("Soriano", "The Optimal Load for Maximal Power Production During Lower-Body Resistance Exercises"),
    ("Hackett", "Olympic weightlifting training improves vertical jump height in sportspeople"),
    ("Arabatzi", "Olympic weightlifting training causes different knee muscle-coactivation adaptations"),
    ("Balsalobre-Fernandez", "Validity and reliability of a novel iPhone app for the measurement of barbell velocity"),
    ("Gonzalez-Badillo", "Predictive accuracy of the load-velocity relationship for bench press")
]

for author, title in test_cases:
    # Pick 4-5 words from title
    words = [w for w in re.sub(r'[^a-zA-Z0-9\s]', '', title).split() if len(w) > 3][:5]
    q = f"{author}[Author] AND ({' '.join(words)})"
    ids = search_ncbi(q)
    time.sleep(0.4)
    if ids:
        summ = get_summary(ids[:1])
        time.sleep(0.4)
        info = summ.get(ids[0], {})
        print(f"FOUND: {author} -> PMID {ids[0]}: {info.get('title')}")
    else:
        print(f"NOT FOUND: {q}")
