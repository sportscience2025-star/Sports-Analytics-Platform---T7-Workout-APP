import json
import urllib.request
import urllib.parse
import re
import time
from difflib import SequenceMatcher

def clean_title(title):
    # Remove subtitles or special chars
    title = re.sub(r'[:\-\?,\."\']', ' ', title)
    words = [w for w in title.split() if len(w) > 2 and w.lower() not in {'the', 'and', 'for', 'with', 'during', 'from'}]
    return " ".join(words)

def get_first_author_lastname(authors_str):
    # Authors like "Morin, J. B., Bourdin, M...." or "Weyand, P. G...." or "Ramirez-Campillo, R...."
    match = re.match(r'^([A-Za-z\-]+)', authors_str.strip())
    if match:
        return match.group(1)
    return ""

def query_ncbi_esearch(term):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(term)}&retmode=json&retmax=5"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (PMID-Remediation; sports-science)'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            return data.get('esearchresult', {}).get('idlist', [])
    except Exception as e:
        print(f"Error in esearch for '{term}': {e}")
        return []

def get_summaries(pmid_list):
    if not pmid_list:
        return {}
    ids_str = ",".join(pmid_list)
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={ids_str}&retmode=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (PMID-Remediation; sports-science)'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            return data.get('result', {})
    except Exception as e:
        print(f"Error in esummary for '{ids_str}': {e}")
        return {}

def similarity(a, b):
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()

def find_pmid_for_study(study):
    title = study.get('title', '')
    authors = study.get('authors', '')
    first_author = get_first_author_lastname(authors)
    year = str(study.get('year', ''))
    
    candidates = []
    
    # Strategy 1: exact title in Title
    s1 = f'"{title}"[Title]'
    res1 = query_ncbi_esearch(s1)
    time.sleep(0.35)
    candidates.extend(res1)
    
    # Strategy 2: First author + title words in Title
    if not candidates and first_author:
        keywords = clean_title(title)[:80]
        s2 = f'{first_author}[Author] AND ({keywords})'
        res2 = query_ncbi_esearch(s2)
        time.sleep(0.35)
        candidates.extend(res2)
        
    # Strategy 3: Cleaned title in Title/Abstract
    if not candidates:
        keywords = clean_title(title)[:80]
        s3 = f'({keywords})[Title]'
        res3 = query_ncbi_esearch(s3)
        time.sleep(0.35)
        candidates.extend(res3)

    # Strategy 4: first author + title substring
    if not candidates and first_author:
        first_words = " ".join(title.split()[:5])
        s4 = f'{first_author}[Author] AND "{first_words}"'
        res4 = query_ncbi_esearch(s4)
        time.sleep(0.35)
        candidates.extend(res4)

    # Deduplicate candidate IDs
    unique_candidates = list(dict.fromkeys(candidates))
    if not unique_candidates:
        return None, "No search results"

    summaries = get_summaries(unique_candidates)
    time.sleep(0.35)

    best_pmid = None
    best_score = 0.0
    best_summary = None

    for pmid in unique_candidates:
        summ = summaries.get(pmid)
        if not summ or not isinstance(summ, dict):
            continue
        c_title = summ.get('title', '')
        score = similarity(title, c_title)
        
        # Check if first author matches
        c_authors = [a.get('name', '') for a in summ.get('authors', [])]
        author_match = any(first_author.lower() in ca.lower() for ca in c_authors) if first_author else True
        
        total_score = score + (0.2 if author_match else 0.0)
        
        if total_score > best_score:
            best_score = total_score
            best_pmid = pmid
            best_summary = summ

    return best_pmid, best_summary, best_score

# Test on first 5 studies
with open(r"e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_2/to_resolve.json", 'r', encoding='utf-8') as f:
    data = json.load(f)

items = [m['source'] for m in data['mismatches']] + data['not_found']

for item in items[:5]:
    res = find_pmid_for_study(item)
    if res[0]:
        pmid, summ, score = res
        print(f"MATCH: {item['id']}")
        print(f"  Orig title : {item['title']}")
        print(f"  Found PMID : {pmid}")
        print(f"  Found title: {summ.get('title')}")
        print(f"  Score      : {score:.3f}")
    else:
        print(f"FAIL: {item['id']} -> {res[1]}")
    print("-" * 50)
