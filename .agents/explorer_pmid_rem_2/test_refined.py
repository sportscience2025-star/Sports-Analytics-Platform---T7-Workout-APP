import urllib.request
import urllib.parse
import json
import time
import re
from difflib import SequenceMatcher

def search_ncbi(query):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(query)}&retmode=json&retmax=10"
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
                return []
        except Exception:
            time.sleep(1.0)
    return []

def get_summaries(pmids):
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
        except Exception:
            time.sleep(1.0)
    return {}

def test_query(q):
    ids = search_ncbi(q)
    time.sleep(0.35)
    if ids:
        summ = get_summaries(ids[:3])
        time.sleep(0.35)
        for i in ids[:3]:
            if i in summ:
                print(f"  [{i}] {summ[i].get('title')}")
    else:
        print("  No IDs found")

print("Testing Morin:")
test_query('Morin[Author] AND "Technical ability"')
test_query('Morin[Author] AND "ground force application"')

print("Testing Clark:")
test_query('Clark[Author] AND "force-velocity trajectories"')

print("Testing Weyand:")
test_query('Weyand[Author] AND "Faster top speeds"')

print("Testing Balsalobre-Fernandez:")
test_query('Balsalobre-Fernandez[Author] AND "bench press"')
test_query('Balsalobre-Fernandez[Author] AND "barbell velocity"')

print("Testing Gonzalez-Badillo 2010:")
test_query('Gonzalez-Badillo[Author] AND "load-velocity" AND 2010[Date - Publication]')
test_query('Gonzalez-Badillo[Author] AND Sanchez-Medina[Author]')

print("Testing Soriano Lower-Body 2015:")
test_query('Soriano[Author] AND "Optimal Load" AND "Lower-Body"')

print("Testing Nagahara 2014:")
test_query('Nagahara[Author] AND "Association of Acceleration"')
