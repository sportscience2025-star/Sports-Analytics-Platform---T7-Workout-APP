import json
import urllib.request
import urllib.parse
import time
import re
from difflib import SequenceMatcher

# Load 71 target studies
path = r"e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_2/to_resolve.json"
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

items = [m['source'] for m in data['mismatches']] + data['not_found']
print(f"Total target studies to resolve: {len(items)}")

def clean_str(s):
    if not s:
        return ""
    # replace non-ascii
    s = s.encode('ascii', 'ignore').decode('ascii')
    return re.sub(r'[^a-zA-Z0-9\s]', ' ', s)

def extract_first_author(authors_str):
    if not authors_str:
        return ""
    # Handle forms like "Morin, J. B.", "Gonzalez-Badillo, J. J.", "Jimenez-Reyes, P."
    clean = clean_str(authors_str).strip()
    parts = clean.split()
    if parts:
        return parts[0]
    return ""

def extract_last_author(authors_str):
    if not authors_str:
        return ""
    clean = clean_str(authors_str).strip()
    # If there's an '&', take after &
    if '&' in authors_str:
        after_amp = authors_str.split('&')[-1]
        c = clean_str(after_amp).strip().split()
        if c:
            return c[0]
    parts = clean.split()
    if len(parts) > 2:
        return parts[-2] # likely last author surname
    return ""

def search_ncbi(query, retmax=5):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(query)}&retmode=json&retmax={retmax}"
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SportsSciResearch/2.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                d = json.loads(resp.read().decode())
                return d.get('esearchresult', {}).get('idlist', [])
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
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SportsSciResearch/2.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                d = json.loads(resp.read().decode())
                return d.get('result', {})
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(1.5 * (attempt + 1))
            else:
                return {}
        except Exception:
            time.sleep(1.0)
    return {}

def similarity(a, b):
    return SequenceMatcher(None, clean_str(a).lower().strip(), clean_str(b).lower().strip()).ratio()

def resolve_study(st):
    title = st.get('title', '')
    authors = st.get('authors', '')
    first_auth = extract_first_author(authors)
    last_auth = extract_last_author(authors)
    year = str(st.get('year', ''))
    journal = st.get('journal', '')
    orig_pmid = st.get('pmid', '')

    stopwords = {'the', 'and', 'for', 'with', 'during', 'from', 'between', 'into', 'that', 'this', 'effect', 'effects', 'study', 'evaluation', 'analysis'}
    title_words = [w for w in clean_str(title).split() if len(w) > 3 and w.lower() not in stopwords]

    candidate_ids = []

    # Query 1: exact title phrase in Title
    # Take first 6 words
    first_title_phrase = " ".join(clean_str(title).split()[:6])
    if first_title_phrase:
        q1 = f'"{first_title_phrase}"[Title]'
        ids1 = search_ncbi(q1)
        time.sleep(0.35)
        candidate_ids.extend(ids1)

    # Query 2: first author + 3 distinct title words
    if not candidate_ids and first_auth and len(title_words) >= 2:
        distinct_words = " AND ".join(title_words[:4])
        q2 = f"{first_auth}[Author] AND ({distinct_words})"
        ids2 = search_ncbi(q2)
        time.sleep(0.35)
        candidate_ids.extend(ids2)

    # Query 3: first author + year + 2 title words
    if not candidate_ids and first_auth and len(title_words) >= 2:
        distinct_words = " AND ".join(title_words[:2])
        q3 = f"{first_auth}[Author] AND ({distinct_words}) AND {year}[Date - Publication]"
        ids3 = search_ncbi(q3)
        time.sleep(0.35)
        candidate_ids.extend(ids3)

    # Query 4: first author + last author + year
    if not candidate_ids and first_auth and last_auth and first_auth != last_auth:
        q4 = f"{first_auth}[Author] AND {last_auth}[Author] AND {year}[Date - Publication]"
        ids4 = search_ncbi(q4)
        time.sleep(0.35)
        candidate_ids.extend(ids4)

    # Query 5: title words only
    if not candidate_ids and len(title_words) >= 3:
        q5 = f"({' AND '.join(title_words[:4])})[Title]"
        ids5 = search_ncbi(q5)
        time.sleep(0.35)
        candidate_ids.extend(ids5)

    # Query 6: if orig_pmid is numeric, check neighborhood +/- 15 (for legacy typos)
    if not candidate_ids and orig_pmid and orig_pmid.isdigit():
        base_num = int(orig_pmid)
        near_pmids = [str(base_num + offset) for offset in range(-15, 16) if offset != 0]
        candidate_ids.extend(near_pmids[:10])

    candidate_ids = list(dict.fromkeys(candidate_ids))
    if not candidate_ids:
        return None

    # Fetch summaries
    summaries = get_summaries(candidate_ids)
    time.sleep(0.35)

    best_cand = None
    best_score = 0.0

    for cid in candidate_ids:
        s = summaries.get(cid)
        if not s or not isinstance(s, dict):
            continue
        c_title = s.get('title', '')
        sim = similarity(title, c_title)

        # Check author
        c_authors = [a.get('name', '') for a in s.get('authors', [])]
        auth_match = any(first_auth.lower() in ca.lower() for ca in c_authors) if first_auth else False

        # Check year
        c_year = s.get('pubdate', '')[:4]
        year_match = (year and year in c_year)

        score = sim
        if auth_match:
            score += 0.25
        if year_match:
            score += 0.1

        if score > best_score:
            best_score = score
            best_cand = {
                'pmid': cid,
                'title': c_title,
                'authors': c_authors,
                'journal': s.get('source', ''),
                'pubdate': s.get('pubdate', ''),
                'score': score,
                'auth_match': auth_match,
                'sim': sim
            }

    return best_cand

results = []
resolved_count = 0
unresolved = []

print("Starting resolution...")
for idx, item in enumerate(items, 1):
    cand = resolve_study(item)
    if cand and cand['score'] >= 0.65:
        resolved_count += 1
        results.append({
            'status': 'RESOLVED',
            'id': item['id'],
            'area': item['area'],
            'orig_title': item['title'],
            'orig_authors': item.get('authors', ''),
            'orig_year': item.get('year', ''),
            'orig_pmid': item.get('pmid', ''),
            'found_pmid': cand['pmid'],
            'found_title': cand['title'],
            'found_authors': cand['authors'][:3],
            'found_journal': cand['journal'],
            'found_pubdate': cand['pubdate'],
            'match_score': round(cand['score'], 3),
            'url': f"https://pubmed.ncbi.nlm.nih.gov/{cand['pmid']}/"
        })
        print(f"[{idx:02d}/71] RESOLVED: {item['id']} -> PMID {cand['pmid']} (Score: {cand['score']:.2f})")
    else:
        unresolved.append(item)
        score_val = cand['score'] if cand else 0.0
        cand_pmid = cand['pmid'] if cand else "None"
        cand_title = cand['title'] if cand else "None"
        results.append({
            'status': 'UNRESOLVED',
            'id': item['id'],
            'area': item['area'],
            'orig_title': item['title'],
            'orig_authors': item.get('authors', ''),
            'orig_year': item.get('year', ''),
            'orig_pmid': item.get('pmid', ''),
            'best_cand_pmid': cand_pmid,
            'best_cand_title': cand_title,
            'best_score': round(score_val, 3)
        })
        print(f"[{idx:02d}/71] UNRESOLVED: {item['id']} (best score: {score_val:.2f})")

# Save results
out_path = r"e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_2/resolved_stage1.json"
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump({'resolved_count': resolved_count, 'unresolved_count': len(unresolved), 'results': results}, f, indent=2)

print(f"\nStage 1 Finished: {resolved_count}/71 resolved, {len(unresolved)} unresolved.")
