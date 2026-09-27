import urllib.request
import urllib.parse
import json
import re
import time

def search_ncbi(query, retmax=5):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(query)}&retmode=json&retmax={retmax}"
    req = urllib.request.Request(url, headers={'User-Agent': 'ExplorerPMID/1.0 (mailto:ptomm@example.com)'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data.get('esearchresult', {}).get('idlist', [])
    except Exception as e:
        print(f"Error searching '{query}': {e}")
        return []

def get_summaries(pmids):
    if not pmids:
        return {}
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(pmids)}&retmode=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'ExplorerPMID/1.0 (mailto:ptomm@example.com)'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data.get('result', {})
    except Exception as e:
        print(f"Error fetching summaries: {e}")
        return {}

test_queries = [
    ("sci_biomech_komi_2000", "Komi PV stretch shortening cycle"),
    ("sci_biomech_nigg_2001", "Nigg BM impact forces foot pronation new paradigm"),
    ("sci_biomech_enoka_1988", "Enoka RM muscle strength and its development new perspectives"),
    ("sci_biomech_herzog_2004", "Herzog W history dependent properties skeletal muscle"),
    ("sci_hamstring_timmins_2016", "Timmins RG short biceps femoris fascicle length eccentric knee flexor weakness"),
]

for item_id, q in test_queries:
    ids = search_ncbi(q)
    print(f"=== {item_id}: Query '{q}' -> found {ids}")
    if ids:
        sums = get_summaries(ids[:2])
        for pmid in ids[:2]:
            doc = sums.get(pmid, {})
            print(f"  PMID {pmid}: {doc.get('title')} ({doc.get('source')}, {doc.get('pubdate')}) - Authors: {[a.get('name') for a in doc.get('authors', [])]}")
    time.sleep(0.3)
