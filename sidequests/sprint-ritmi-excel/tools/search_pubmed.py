import urllib.request
import urllib.parse
import json
import xml.etree.ElementTree as ET
import time

def fetch_data(url):
    time.sleep(0.5)
    req = urllib.request.Request(url, headers={'User-Agent': 'SportsScienceResearch/1.0 (mailto:researcher@example.com)'})
    with urllib.request.urlopen(req) as resp:
        return resp.read().decode('utf-8', errors='replace')

def search_pubmed(term, retmax=5):
    params = {
        'db': 'pubmed',
        'term': term,
        'retmode': 'json',
        'retmax': retmax,
        'sort': 'relevance'
    }
    url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?' + urllib.parse.urlencode(params)
    data = json.loads(fetch_data(url))
    return data['esearchresult']['idlist']

def fetch_summaries(pmids):
    if not pmids:
        return []
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(pmids)}&retmode=json"
    data = json.loads(fetch_data(url))
    results = []
    for pmid in pmids:
        item = data['result'].get(pmid, {})
        title = item.get('title', '')
        authors = [a.get('name', '') for a in item.get('authors', [])]
        source = item.get('source', '')
        pubdate = item.get('pubdate', '')
        volume = item.get('volume', '')
        issue = item.get('issue', '')
        pages = item.get('pages', '')
        articleids = {ai.get('idtype'): ai.get('value') for ai in item.get('articleids', [])}
        doi = articleids.get('doi', '')
        results.append({
            'pmid': pmid,
            'title': title,
            'authors': authors,
            'source': source,
            'pubdate': pubdate,
            'volume': volume,
            'issue': issue,
            'pages': pages,
            'doi': doi
        })
    return results

def fetch_abstracts(pmids):
    if not pmids:
        return {}
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id={','.join(pmids)}&retmode=xml"
    xml_text = fetch_data(url)
    root = ET.fromstring(xml_text)
    abstracts = {}
    for article in root.findall('.//PubmedArticle'):
        pmid_elem = article.find('.//MedlineCitation/PMID')
        pmid = pmid_elem.text if pmid_elem is not None else ''
        abstract_texts = article.findall('.//Abstract/AbstractText')
        text_parts = []
        for at in abstract_texts:
            lbl = at.attrib.get('Label', '')
            txt = at.text or ''
            if lbl:
                text_parts.append(f"{lbl}: {txt}")
            else:
                text_parts.append(txt)
        abstracts[pmid] = "\n".join(text_parts)
    return abstracts

# Let's inspect our core list of candidate papers
core_pmids = [
    '35916747', # Darrall-Jones 2022 - Can Team-Sport Athletes Accurately Run at Submaximal Sprinting Speeds?
    '30380362', # Jimenez-Reyes 2019 - Jump height loss as an indicator of fatigue during sprint training
    '27286181', # Jimenez-Reyes 2016 - Mechanical, Metabolic and Perceptual Response during Sprint Training
    '31754845', # Haugen 2019 - The Training and Development of Elite Sprint Performance
    '26660758', # Haugen & Buchheit 2016 - Sprint running performance monitoring
    '25998238', # Samozino 2016 - A simple method for measuring power, force, velocity properties
    '35151419', # Healy 2022 - Profiling elite male 100-m sprint performance
    '11053354', # Weyand 2000 - Faster top running speeds are achieved with greater ground forces
    '37229404', # Clark 2023 - Horizontal Foot Speed During Submaximal and Maximal Running
    '38447429', # Whitacre / Clark 2024 - Effects of running skill and speed on limb coordination
    '23832851', # Buchheit & Laursen 2013 - HIIT Part II: Anaerobic Energy, Neuromuscular Load
    '20840558', # Iaia & Bangsbo 2010 - Speed endurance training is a powerful stimulus
    '21780851'  # Girard 2011 - Repeated-Sprint Ability Part I
]

if __name__ == '__main__':
    sums = fetch_summaries(core_pmids)
    absts = fetch_abstracts(core_pmids)
    for s in sums:
        pmid = s['pmid']
        print(f"==================================================")
        print(f"PMID: {pmid} | DOI: {s['doi']}")
        print(f"Authors: {', '.join(s['authors'])}")
        print(f"Title: {s['title']}")
        print(f"Source: {s['source']} ({s['pubdate']}); {s['volume']}({s['issue']}): {s['pages']}")
        print(f"Abstract preview:\n{absts.get(pmid, 'NO ABSTRACT')[:500]}...")
        print()
