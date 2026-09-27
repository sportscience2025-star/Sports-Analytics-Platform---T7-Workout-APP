import json
import re

STOPWORDS = {'the', 'of', 'and', 'in', 'to', 'a', 'is', 'for', 'from', 'on', 'with', 'by', 'at', 'an', 'be', 'this', 'that', 'which', 'or', 'as', 'during', 'after', 'before'}

def clean(text):
    text = re.sub(r'[^\w\s]', ' ', (text or '').lower())
    return set(w for w in text.split() if len(w) > 2 and w not in STOPWORDS)

with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/full_remediation_table.json', 'r', encoding='utf-8') as f:
    table = json.load(f)

print(f"Auditing {len(table)} entries...")

flags = []

for idx, it in enumerate(table):
    if it["type"] == "BOOK":
        continue
    exp_words = clean(it["expected_title"])
    ver_words = clean(it["verified_title"])
    overlap = len(exp_words.intersection(ver_words))
    jaccard = overlap / len(exp_words.union(ver_words)) if exp_words and ver_words else 0
    containment = overlap / len(exp_words) if exp_words else 0
    
    first_exp_author = clean(it["expected_authors"].split(',')[0])
    ver_authors_str = " ".join(it.get("verified_authors", [])).lower()
    fa_match = any(fa in ver_authors_str for fa in first_exp_author)
    
    score = (jaccard * 0.5) + (containment * 0.5)
    
    if score < 0.5 or not fa_match:
        flags.append({
            "idx": idx + 1,
            "id": it["id"],
            "area": it["area"],
            "score": score,
            "fa_match": fa_match,
            "expected_title": it["expected_title"],
            "expected_authors": it["expected_authors"],
            "expected_year": it["expected_year"],
            "current_pmid": it["current_pmid"],
            "candidate_pmid": it["correct_pmid"],
            "verified_title": it["verified_title"],
            "verified_authors": it.get("verified_authors", [])
        })

print(f"Total flagged entries: {len(flags)}")
with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/flagged_entries.json', 'w', encoding='utf-8') as f_out:
    json.dump(flags, f_out, indent=2, ensure_ascii=False)

for fl in flags:
    print(f"\n[{fl['idx']}] {fl['id']} ({fl['area']}) | Score: {fl['score']:.2f} | FA match: {fl['fa_match']}")
    print(f"  Exp: '{fl['expected_title']}' by {fl['expected_authors']} ({fl['expected_year']})")
    print(f"  Cand PMID: {fl['candidate_pmid']}")
    print(f"  Ver: '{fl['verified_title']}' by {fl['verified_authors'][:3]}")
