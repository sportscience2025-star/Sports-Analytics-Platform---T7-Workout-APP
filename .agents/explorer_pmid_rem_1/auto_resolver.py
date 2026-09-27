import json
import urllib.request
import urllib.parse
import re
import time

STOPWORDS = {
    'the', 'of', 'and', 'in', 'to', 'a', 'is', 'for', 'from', 'on', 'with', 'by',
    'at', 'an', 'be', 'this', 'that', 'which', 'or', 'as', 'between', 'during',
    'after', 'before', 'versus', 'vs', 'effect', 'effects', 'study', 'role'
}

def clean_text(text):
    text = re.sub(r'[^\w\s]', ' ', text.lower())
    return [w for w in text.split() if len(w) > 2 and w not in STOPWORDS]

def get_first_author(authors_str):
    # authors_str e.g. "Timmins, R. G., Bourne, M. N." or "Al Attar, W. S."
    parts = authors_str.split(',')
    first = parts[0].strip()
    # If first is something like "Harøy", handle unicode
    return first

def search_ncbi(query, retmax=5):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(query)}&retmode=json&retmax={retmax}"
    req = urllib.request.Request(url, headers={'User-Agent': 'ExplorerPMID/1.0 (mailto:ptomm@example.com)'})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                return data.get('esearchresult', {}).get('idlist', [])
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(2.0 * (attempt + 1))
            else:
                return []
        except Exception as e:
            time.sleep(1.0)
    return []

def get_summaries(pmids):
    if not pmids:
        return {}
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(pmids)}&retmode=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'ExplorerPMID/1.0 (mailto:ptomm@example.com)'})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                return data.get('result', {})
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(2.0 * (attempt + 1))
            else:
                return {}
        except Exception as e:
            time.sleep(1.0)
    return {}

def compute_similarity(title_words, cand_title, first_author, cand_authors):
    cand_words = set(clean_text(cand_title))
    target_words = set(title_words)
    if not target_words or not cand_words:
        return 0.0, False
    
    overlap = len(target_words.intersection(cand_words))
    jaccard = overlap / len(target_words.union(cand_words))
    containment = overlap / len(target_words)
    
    # check author
    fa_norm = clean_text(first_author)
    fa_matched = False
    cand_authors_str = " ".join([a.get('name', '') for a in cand_authors]).lower()
    for fa in fa_norm:
        if fa in cand_authors_str:
            fa_matched = True
            break
            
    score = (jaccard * 0.5) + (containment * 0.5)
    if fa_matched:
        score += 0.3
    return score, fa_matched

with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/scope_items.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

results = []

print(f"Starting resolution of {len(items)} items...")

for idx, item in enumerate(items):
    first_author = get_first_author(item['authors'])
    title_words = clean_text(item['title'])
    
    # Formulate candidate queries
    queries = []
    # Q1: First author + top 5 distinctive title words
    queries.append(f"{first_author} {' '.join(title_words[:5])}")
    # Q2: First author + title words 2:7
    if len(title_words) > 5:
        queries.append(f"{first_author} {' '.join(title_words[1:6])}")
    # Q3: Distinctive title phrase without author
    queries.append(f"{' '.join(title_words[:6])}")
    # Q4: First author + journal words + year
    j_words = clean_text(item['journal'])
    queries.append(f"{first_author} {' '.join(j_words[:3])} {item['year']}")
    
    best_match = None
    best_score = 0.0
    candidate_pmids_seen = set()
    
    for q in queries:
        time.sleep(0.35)
        pmid_list = search_ncbi(q, retmax=5)
        new_pmids = [p for p in pmid_list if p not in candidate_pmids_seen]
        if not new_pmids:
            continue
        candidate_pmids_seen.update(new_pmids)
        
        time.sleep(0.35)
        summaries = get_summaries(new_pmids)
        
        for pmid in new_pmids:
            doc = summaries.get(pmid)
            if not doc or 'title' not in doc:
                continue
            cand_title = doc.get('title', '')
            cand_authors = doc.get('authors', [])
            score, fa_matched = compute_similarity(title_words, cand_title, first_author, cand_authors)
            
            if score > best_score:
                best_score = score
                best_match = {
                    "pmid": pmid,
                    "title": cand_title,
                    "journal": doc.get('source', ''),
                    "pubdate": doc.get('pubdate', ''),
                    "authors": [a.get('name', '') for a in cand_authors],
                    "score": score,
                    "fa_matched": fa_matched,
                    "query_used": q
                }
        
        # If high confidence match, no need to try more queries
        if best_score >= 0.7:
            break

    res_entry = {
        "id": item["id"],
        "area": item["area"],
        "expected_title": item["title"],
        "expected_authors": item["authors"],
        "expected_year": item["year"],
        "expected_journal": item["journal"],
        "current_pmid": item["current_pmid"],
        "current_url": f"https://pubmed.ncbi.nlm.nih.gov/{item['current_pmid']}/",
        "best_match": best_match,
        "best_score": best_score,
        "resolved": best_score >= 0.55
    }
    results.append(res_entry)
    
    status_str = "RESOLVED" if res_entry["resolved"] else "NEEDS REVIEW"
    print(f"[{idx+1}/{len(items)}] {item['id']} -> {status_str} (score: {best_score:.2f})")
    if best_match:
        print(f"    Found PMID: {best_match['pmid']} - '{best_match['title'][:70]}'")
    else:
        print(f"    NO MATCH FOUND")

resolved_count = sum(1 for r in results if r["resolved"])
print(f"\nCompleted: {resolved_count}/{len(items)} resolved automatically (score >= 0.55).")

with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/resolved_batch_1.json', 'w', encoding='utf-8') as f_out:
    json.dump(results, f_out, indent=2, ensure_ascii=False)

print("Saved to resolved_batch_1.json")
