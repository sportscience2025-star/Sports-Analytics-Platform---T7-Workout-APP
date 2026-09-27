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

print(f"Loaded {len(existing_pmids)} existing PMIDs and {len(existing_titles)} existing titles.")

def search_pubmed(query, max_results=10):
    params = {
        'db': 'pubmed',
        'term': query,
        'retmode': 'json',
        'retmax': str(max_results),
        'sort': 'pub_date'
    }
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data['esearchresult']['idlist']
    except Exception as e:
        print(f"Search error for {query}: {e}")
        return []

def fetch_details(pmids):
    if not pmids:
        return []
    params = {
        'db': 'pubmed',
        'id': ','.join(pmids),
        'retmode': 'xml'
    }
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            xml_data = resp.read()
            root = ET.fromstring(xml_data)
            articles = []
            for article in root.findall('.//PubmedArticle'):
                pmid_el = article.find('.//MedlineCitation/PMID')
                pmid = pmid_el.text if pmid_el is not None else ''
                
                title_el = article.find('.//ArticleTitle')
                title = "".join(title_el.itertext()).strip() if title_el is not None else ''
                # Remove trailing period if present
                if title.endswith('.'):
                    title = title[:-1]
                
                # Authors
                authors = []
                for author in article.findall('.//AuthorList/Author'):
                    last_name = author.find('LastName')
                    fore_name = author.find('ForeName')
                    initials = author.find('Initials')
                    if last_name is not None and last_name.text:
                        ln = last_name.text
                        init = initials.text if initials is not None and initials.text else (fore_name.text if fore_name is not None and fore_name.text else '')
                        authors.append(f"{ln}, {init}")
                authors_str = ", ".join(authors) if authors else "Unknown"
                first_author = authors[0].split(',')[0].strip().lower() if authors else "unknown"
                
                # Journal
                journal_el = article.find('.//Journal/Title')
                if journal_el is None or not journal_el.text:
                    journal_el = article.find('.//Journal/ISOAbbreviation')
                journal = journal_el.text.strip() if journal_el is not None and journal_el.text else 'Unknown Journal'
                
                # Year
                year_el = article.find('.//JournalIssue/PubDate/Year')
                if year_el is None or not year_el.text:
                    year_el = article.find('.//JournalIssue/PubDate/MedlineDate')
                    if year_el is not None and year_el.text:
                        m = re.search(r'\b(19\d\d|20\d\d)\b', year_el.text)
                        year = int(m.group(1)) if m else 2020
                    else:
                        year = 2020
                else:
                    year = int(year_el.text.strip())
                
                # Abstract
                abstract_texts = []
                for ab in article.findall('.//Abstract/AbstractText'):
                    lbl = ab.attrib.get('Label', '')
                    txt = "".join(ab.itertext()).strip()
                    if lbl:
                        abstract_texts.append(f"{lbl}: {txt}")
                    else:
                        abstract_texts.append(txt)
                abstract = " ".join(abstract_texts)
                
                articles.append({
                    'pmid': pmid,
                    'title': title,
                    'authors': authors_str,
                    'first_author': first_author,
                    'journal': journal,
                    'year': year,
                    'abstract': abstract,
                    'url': f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
                })
            return articles
    except Exception as e:
        print(f"Fetch error for {pmids}: {e}")
        return []

biomech_queries = [
    "Vigotsky biomechanics squat moment arms",
    "Contreras hip thrust back squat force vector",
    "Aagaard rate of force development neural adaptations",
    "Maffiuletti rate of force development assessment",
    "Swinton biomechanical analysis straight bar hex bar deadlift",
    "Escamilla biomechanics powerlifting squat stance width",
    "Cleather articular contact force knee joint squat",
    "Schoenfeld muscle activation internal external focus",
    "Vigotsky surface electromyography misuse interpretation",
    "Blazevich architectural changes muscle tendon unit hypertrophy",
    "Seynnes rapid architectural adaptations eccentric training",
    "Cronin stretch shortening cycle stiffness rebound",
    "Flanagan concentric eccentric force squat biomechanics",
    "Loturco force vector vertical horizontal jump sprint"
]

physiol_queries = [
    "Phillips muscle protein synthesis resistance exercise leucine",
    "Morton protein distribution resistance exercise hypertrophy",
    "Snijders satellite cells skeletal muscle hypertrophy resistance",
    "Petrella myonuclear permanent hypertrophy human skeletal muscle",
    "West resistance exercise systemic hormones muscle hypertrophy",
    "Plotkin fiber type transitions resistance training endurance",
    "Plews heart rate variability autonomic athletic performance monitoring",
    "Stanley cardiac autonomic recovery post exercise review",
    "Egan molecular regulation skeletal muscle adaptation exercise AMPK PGC1",
    "Bishop mitochondria biogenesis high intensity training volume",
    "Coffey molecular bases training adaptation concurrent exercise",
    "Hyldahl muscle damage repeated bout effect inflammatory response",
    "Patterson blood flow restriction exercise methodology safety",
    "Loenneke blood flow restriction physiological mechanisms hypertrophy"
]

print("=== SEARCHING BIOMECCANICA CANDIDATES ===")
biomech_candidates = []
for q in biomech_queries:
    ids = search_pubmed(q, max_results=3)
    time.sleep(0.4)
    articles = fetch_details(ids)
    for a in articles:
        if a['pmid'] in existing_pmids or a['title'].lower() in existing_titles:
            print(f"Skipping duplicate: {a['pmid']} - {a['title']}")
            continue
        biomech_candidates.append(a)
    print(f"Query '{q}' returned {len(articles)} articles.")

print(f"Total unique Biomeccanica candidates fetched: {len(biomech_candidates)}")

print("\n=== SEARCHING FISIOLOGIA CANDIDATES ===")
physiol_candidates = []
for q in physiol_queries:
    ids = search_pubmed(q, max_results=3)
    time.sleep(0.4)
    articles = fetch_details(ids)
    for a in articles:
        if a['pmid'] in existing_pmids or a['title'].lower() in existing_titles:
            print(f"Skipping duplicate: {a['pmid']} - {a['title']}")
            continue
        physiol_candidates.append(a)
    print(f"Query '{q}' returned {len(articles)} articles.")

print(f"Total unique Fisiologia candidates fetched: {len(physiol_candidates)}")

with open('.agents/worker_research_group_b/candidates.json', 'w', encoding='utf-8') as f:
    json.dump({
        'biomeccanica': biomech_candidates,
        'fisiologia': physiol_candidates
    }, f, indent=2, ensure_ascii=False)
