import urllib.request
import urllib.parse
import json
import xml.etree.ElementTree as ET
import time
import re

with open('.agents/worker_research_group_b/existing_sources.json', 'r', encoding='utf-8') as f:
    existing = json.load(f)

existing_pmids = set(existing['pmids'])
existing_titles = set(existing['titles'])

def search_pubmed(term, retmax=5):
    params = {'db': 'pubmed', 'term': term, 'retmode': 'json', 'retmax': str(retmax)}
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'T7ResearchAgent/1.0 (mailto:t7@example.com)'})
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data['esearchresult']['idlist']
    except Exception as e:
        print(f"Error searching {term}: {e}")
        return []

def fetch_details(pmids):
    if not pmids:
        return []
    params = {'db': 'pubmed', 'id': ','.join(pmids), 'retmode': 'xml'}
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'T7ResearchAgent/1.0 (mailto:t7@example.com)'})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            root = ET.fromstring(resp.read())
            results = []
            for article in root.findall('.//PubmedArticle'):
                pmid_el = article.find('.//MedlineCitation/PMID')
                pmid = pmid_el.text if pmid_el is not None else ''
                
                title_el = article.find('.//ArticleTitle')
                title = "".join(title_el.itertext()).strip() if title_el is not None else ''
                if title.endswith('.'):
                    title = title[:-1]
                
                authors = []
                for author in article.findall('.//AuthorList/Author'):
                    ln = author.find('LastName')
                    fn = author.find('ForeName')
                    init = author.find('Initials')
                    if ln is not None and ln.text:
                        in_val = init.text if init is not None and init.text else (fn.text if fn is not None and fn.text else '')
                        authors.append(f"{ln.text}, {in_val}")
                authors_str = ", ".join(authors) if authors else "Unknown"
                first_author = authors[0].split(',')[0].strip().lower() if authors else "unknown"
                
                j_el = article.find('.//Journal/Title')
                if j_el is None or not j_el.text:
                    j_el = article.find('.//Journal/ISOAbbreviation')
                journal = j_el.text.strip() if j_el is not None and j_el.text else 'Unknown Journal'
                
                y_el = article.find('.//JournalIssue/PubDate/Year')
                if y_el is None or not y_el.text:
                    y_el = article.find('.//JournalIssue/PubDate/MedlineDate')
                    if y_el is not None and y_el.text:
                        m = re.search(r'\b(19\d\d|20\d\d)\b', y_el.text)
                        year = int(m.group(1)) if m else 2020
                    else:
                        year = 2020
                else:
                    year = int(y_el.text.strip())
                
                abstract_texts = []
                for ab in article.findall('.//Abstract/AbstractText'):
                    lbl = ab.attrib.get('Label', '')
                    txt = "".join(ab.itertext()).strip()
                    if lbl:
                        abstract_texts.append(f"{lbl}: {txt}")
                    else:
                        abstract_texts.append(txt)
                abstract = " ".join(abstract_texts)
                
                results.append({
                    'pmid': pmid,
                    'title': title,
                    'authors': authors_str,
                    'first_author': first_author,
                    'journal': journal,
                    'year': year,
                    'abstract': abstract,
                    'url': f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
                })
            return results
    except Exception as e:
        print(f"Error fetching {pmids}: {e}")
        return []

specific_biomech = [
    "Swinton PA deadlift hexagonal",
    "Escamilla RF sumo conventional deadlift",
    "Aagaard P rate of force development neural drive",
    "Cleather DJ hamstrings rectus femoris squat",
    "Vigotsky AD electromyography interpretation",
    "Kubo K tendon stiffness resistance training",
    "Beardsley C muscle moment arm",
    "Seynes OR rapid architectural adaptations",
    "Flanagan SP biomechanics squat",
    "Contreras B horizontal vertical force vector",
    "Maffiuletti NA rate of force development physiological"
]

results = []
for term in specific_biomech:
    print(f"Searching: {term}")
    ids = search_pubmed(term, retmax=3)
    time.sleep(0.8)
    if ids:
        arts = fetch_details(ids)
        time.sleep(0.8)
        for a in arts:
            if a['pmid'] in existing_pmids or a['title'].lower() in existing_titles:
                print(f"  [DUP] {a['pmid']} - {a['title']}")
                continue
            print(f"  [OK] PMID {a['pmid']}: {a['title']} ({a['year']}) - {a['authors'][:40]}...")
            results.append(a)

print(f"\nFetched {len(results)} additional biomech papers.")

with open('.agents/worker_research_group_b/more_biomech.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
