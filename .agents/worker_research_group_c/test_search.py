import urllib.request
import urllib.parse
import json
import time

def search_pubmed(query):
    params = {
        'db': 'pubmed',
        'term': query,
        'retmode': 'json',
        'retmax': 5
    }
    url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            idlist = data.get('esearchresult', {}).get('idlist', [])
            return idlist
    except Exception as e:
        print(f"Error searching for {query}: {e}")
        return []

def get_summary(pmids):
    if not pmids:
        return {}
    url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=' + ','.join(pmids) + '&retmode=json'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data.get('result', {})
    except Exception as e:
        print(f"Error getting summary for {pmids}: {e}")
        return {}

queries = [
    # Clinico
    'Kyritsis Likelihood of ACL graft rupture',
    'Askling acute hamstring injuries Swedish elite football prospective randomised L-protocol',
    'Mendiguchia criteria-based progressive algorithm hamstring injury',
    'Kongsgaard Heavy slow resistance training in patellar tendinopathy',
    'Beyer Heavy Slow Resistance Versus Eccentric Training Achilles Tendinopathy',
    'Holmgren subacromial impingement specific exercise strategy BMJ',
    'Saragiotto Motor control exercise chronic non-specific low-back pain',
    'Foster Prevention and treatment of low back pain Lancet',
    'Fransen Exercise for osteoarthritis of the knee Cochrane',
    'Holmich active physical training adductor-related groin pain',
    'Vuurberg Diagnosis treatment and prevention of ankle sprains',
    'Buckthorpe Restoring Knee Extensor Strength After Anterior Cruciate Ligament',
    'Malliaras Patellar Tendinopathy Clinical Diagnosis Load Management',
    'Cools Rehabilitation of scapular dyskinesis',
    'van Dyk Nordic hamstring exercise',
    'Silbernagel Achilles tendinopathy eccentric-concentric'
]

for q in queries:
    ids = search_pubmed(q)
    print(f"Query: {q} -> IDs: {ids[:3]}")
    if ids:
        time.sleep(0.3)
        sums = get_summary([ids[0]])
        if ids[0] in sums:
            item = sums[ids[0]]
            authors = [a['name'] for a in item.get('authors', [])]
            print(f"   Top: PMID={ids[0]} | Title={item.get('title')} | Authors={', '.join(authors[:3])} | Year={item.get('pubdate')}")
    time.sleep(0.3)
