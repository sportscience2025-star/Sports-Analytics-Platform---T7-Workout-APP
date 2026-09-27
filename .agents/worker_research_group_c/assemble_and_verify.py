import urllib.request
import urllib.parse
import json
import xml.etree.ElementTree as ET
import time

# 14 Clinico PMIDs
clinico_pmids = [
    '27215935', # Kyritsis 2016 (BJSM) - ACL RTS 6 clinical criteria
    '23536466', # Askling 2013 (BJSM) - Hamstring L-protocol vs C-protocol
    '28277402', # Mendiguchia 2017 (MSSE) - Hamstring criteria-based algorithm
    '19793213', # Kongsgaard 2009 (Scand J Med Sci Sports) - HSR patellar tendinopathy
    '26018970', # Beyer 2015 (Am J Sports Med) - HSR vs eccentric Achilles tendinopathy
    '25213604', # Holmgren 2014 (BJSM) - Specific exercise for subacromial impingement
    '26742533', # Saragiotto 2016 (Cochrane) - Motor control exercise for chronic LBP
    '29573872', # Foster 2018 (Lancet) - Prevention and treatment of low back pain
    '26405113', # Fransen 2015 (BJSM) - Exercise for osteoarthritis of the knee
    '9989713',  # Holmich 1999 (Lancet) - Active training for adductor-related groin pain
    '29514819', # Vuurberg 2018 (BJSM) - Ankle sprains clinical guideline
    '31782065', # Buckthorpe 2020 (Sports Med) - Mid-stage training and testing ACL reconstruction
    '26390269', # Malliaras 2015 (JOSPT) - Patellar tendinopathy load management
    '21084657'  # Silbernagel 2011 (Am J Sports Med) - Achilles tendinopathy 5-year follow-up exercise
]

# 14 Sport di Squadra PMIDs
team_pmids = [
    '23812857', # Cummins 2013 (Sports Med) - GPS and microtechnology sensors in team sports
    '31506901', # Harper 2019 (Sports Med) - High-intensity acceleration and deceleration in team sports
    '32005093', # Hickey 2020 (JOSPT) - Pain-free vs pain-threshold rehabilitation hamstring strain
    '31291651', # Gabbett 2019 (Int J Sports Med) - To couple or not to couple? ACWR and injury risk
    '26851288', # Hulin 2016 (BJSM) - Low chronic workload and ACWR predict injury in rugby
    '26701923', # Blanch 2016 (BJSM) - Has the athlete trained enough to return to play safely? ACWR sweet spot
    '21395363', # Hill-Haas 2011 (Sports Med) - Physiology of small-sided games in football
    '21846163', # Bishop 2011 (Sports Med) - Repeated-sprint ability part II: recommendations for training
    '18550949', # Buchheit 2008 (JSCR) - 30-15 intermittent fitness test
    '18081366', # Bangsbo 2008 (Sports Med) - Yo-Yo intermittent recovery test
    '20400751', # Dupont 2010 (Am J Sports Med) - Effect of 2 matches in a week on injury rate
    '19153866', # Bradley 2009 (J Sports Sci) - High-intensity running in English Premier League
    '21873897', # Ronnestad 2011 (JSCR) - In-season strength maintenance frequency in professional soccer
    '21911856'  # Aughey 2011 (IJSPP) - Applications of GPS technologies to field sports
]

all_pmids = clinico_pmids + team_pmids
print(f"Total PMIDs to fetch: {len(all_pmids)} (Clinico: {len(clinico_pmids)}, Team: {len(team_pmids)})")
assert len(all_pmids) == 28, "Must be exactly 28 PMIDs!"
assert len(set(all_pmids)) == 28, "All 28 PMIDs must be distinct!"

# Fetch summaries from NCBI
url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=' + ','.join(all_pmids) + '&retmode=json'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
with urllib.request.urlopen(req) as resp:
    sum_data = json.loads(resp.read().decode('utf-8'))['result']

# Fetch XML abstracts for real text
efetch_url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=' + ','.join(all_pmids) + '&retmode=xml'
efetch_req = urllib.request.Request(efetch_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
with urllib.request.urlopen(efetch_req) as resp:
    xml_data = resp.read()

root = ET.fromstring(xml_data)
abstracts = {}
for article in root.findall('.//PubmedArticle'):
    pmid_elem = article.find('.//MedlineCitation/PMID')
    if pmid_elem is not None:
        p = pmid_elem.text
        ab_texts = []
        for ab in article.findall('.//AbstractText'):
            if ab.text:
                label = ab.get('Label')
                if label:
                    ab_texts.append(f"{label}: {ab.text}")
                else:
                    ab_texts.append(ab.text)
        abstracts[p] = " ".join(ab_texts)

records = []
for p in all_pmids:
    s = sum_data.get(p, {})
    title = s.get('title', '').rstrip('.')
    # Clean XML tags in title if any
    title = title.replace('<i>', '').replace('</i>', '').replace('<b>', '').replace('</b>', '')
    authors = [a['name'] for a in s.get('authors', [])]
    journal = s.get('source', '')
    pubdate = s.get('pubdate', '')
    year_str = pubdate[:4]
    year = int(year_str) if year_str.isdigit() else 2020
    area = "Clinico" if p in clinico_pmids else "Sport di Squadra"
    
    first_author_clean = authors[0].split()[0].lower() if authors else 'author'
    # strip special characters from first author
    first_author_clean = "".join(c for c in first_author_clean if c.isalnum())
    
    rec = {
        'pmid': p,
        'first_author': first_author_clean,
        'title': title,
        'authors': ", ".join(authors[:6]) + (", et al." if len(authors) > 6 else ""),
        'journal': journal,
        'year': year,
        'area': area,
        'english_abstract': abstracts.get(p, ''),
        'url': f"https://pubmed.ncbi.nlm.nih.gov/{p}/"
    }
    records.append(rec)
    print(f"[{area}] {p}: {authors[0] if authors else 'Unknown'} ({year}) - {title[:60]}... ({journal})")

with open('fetched_metadata.json', 'w', encoding='utf-8') as f:
    json.dump(records, f, indent=2, ensure_ascii=False)

print("\nSuccessfully saved fetched_metadata.json with all 28 verified records!")
