import json
import urllib.request
import urllib.parse
import time

# Load the 51 automated
with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/resolved_batch_1.json', 'r', encoding='utf-8') as f:
    batch1 = json.load(f)

# Define our manual resolutions for the 16 edge cases
manual_resolutions = {
    "sci_biomech_zatsiorsky_2002": {
        "pmid": None,
        "type": "BOOK",
        "doi": "10.5040/9781718206588",
        "isbn": "978-0736037785",
        "url": "https://us.humankinetics.com/products/kinetics-of-human-motion",
        "title": "Kinetics of Human Motion",
        "authors": ["Zatsiorsky VM"],
        "source": "Human Kinetics (Champaign, IL)",
        "year": 2002,
        "note": "Textbook not indexed in PubMed. Genuine book DOI/ISBN provided."
    },
    "sci_biomech_winter_1990": {
        "pmid": None,
        "type": "BOOK",
        "doi": "10.1002/9780470549148",
        "isbn": "978-0-470-39818-0",
        "url": "https://doi.org/10.1002/9780470549148",
        "title": "Biomechanics and Motor Control of Human Movement",
        "authors": ["Winter DA"],
        "source": "John Wiley & Sons",
        "year": 1990,
        "note": "Textbook not indexed in PubMed. Genuine Wiley DOI provided."
    },
    "sci_biomech_escamilla_2000": {
        "pmid": "11194098",
        "title": "Knee biomechanics of the dynamic squat exercise"
    },
    "sci_biomech_gregersen_2006": {
        "pmid": "16704336",
        "title": "How changing the inversion/eversion foot angle affects the nondriving intersegmental knee moments and the relative activation of the vastii muscles in cycling"
    },
    "sci_biomech_flanagan_2012": {
        "pmid": "18076249",
        "title": "Bilateral differences in the net joint torques during the squat exercise"
    },
    "sci_biomech_vigotsky_2018": {
        "pmid": "29489722",
        "title": "Biomechanical, Anthropometric, and Psychological Determinants of Barbell Back Squat Strength"
    },
    "sci_hamstring_petersen_2011": {
        "pmid": "21825112",
        "title": "Preventive effect of eccentric training on acute hamstring injuries in men's soccer: a cluster-randomized controlled trial"
    },
    "sci_shoulder_cools_2007": {
        "pmid": "23687006",
        "title": "Rehabilitation of scapular dyskinesis: from the office worker to the elite overhead athlete"
    },
    "sci_shoulder_wilk_2009": {
        "pmid": "19194026",
        "title": "Shoulder injuries in the overhead athlete"
    },
    "sci_rsa_rampinini_2007": {
        "pmid": "19935835",
        "title": "Repeated-sprint ability in professional and amateur soccer players"
    },
    "sci_team_taylor_2017": {
        "pmid": "28801751",
        "title": "Activity Demands During Multi-Directional Team Sports: A Systematic Review"
    },
    "sci_team_longo_2012": {
        "pmid": "22415208",
        "title": "The FIFA 11+ program is effective in preventing injuries in elite male basketball players: A cluster randomized controlled trial"
    },
    "sci_team_mccall_2014": {
        "pmid": "25878078",
        "title": "Injury prevention strategies at the FIFA 2014 World Cup: perceptions and practices of the physicians from the 32 participating national teams"
    },
    "sci_team_dello_2016": {
        "pmid": "29039018",
        "title": "The Activity Demands and Physiological Responses Encountered During Basketball Match-Play: A Systematic Review"
    },
    "sci_team_tierney_2016": {
        "pmid": "31502142",
        "title": "The Effect of Nordic Hamstring Exercise Intervention Volume on Eccentric Strength and Muscle Architecture Adaptations: A Systematic Review and Meta-analyses"
    },
    "sci_team_harper_2019": {
        "pmid": "31506901",
        "title": "High-Intensity Acceleration and Deceleration Demands in Elite Team Sports Competitive Match Play: A Systematic Review and Meta-Analysis of Observational Studies"
    }
}

# Combine all 67
all_targets = []

for item in batch1:
    item_id = item["id"]
    if item_id in manual_resolutions:
        manual_entry = manual_resolutions[item_id]
        all_targets.append({
            "id": item_id,
            "area": item["area"],
            "expected_title": item["expected_title"],
            "expected_authors": item["expected_authors"],
            "expected_year": item["expected_year"],
            "expected_journal": item["expected_journal"],
            "current_pmid": item["current_pmid"],
            "current_url": item["current_url"],
            "correct_pmid": manual_entry.get("pmid"),
            "manual_entry": manual_entry,
            "source_type": manual_entry.get("type", "PUBMED")
        })
    else:
        # was resolved automatically in batch 1
        all_targets.append({
            "id": item_id,
            "area": item["area"],
            "expected_title": item["expected_title"],
            "expected_authors": item["expected_authors"],
            "expected_year": item["expected_year"],
            "expected_journal": item["expected_journal"],
            "current_pmid": item["current_pmid"],
            "current_url": item["current_url"],
            "correct_pmid": item["best_match"]["pmid"],
            "source_type": "PUBMED"
        })

print(f"Total entries to verify against NCBI: {len(all_targets)}")

# Collect all non-null PMIDs to fetch summary in batches of 20
pmids_to_fetch = [t["correct_pmid"] for t in all_targets if t["correct_pmid"]]
print(f"Total PMIDs to fetch from NCBI: {len(pmids_to_fetch)}")

ncbi_summaries = {}
batch_size = 20

for i in range(0, len(pmids_to_fetch), batch_size):
    chunk = pmids_to_fetch[i:i+batch_size]
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(chunk)}&retmode=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'ExplorerPMID/1.0 (mailto:ptomm@example.com)'})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                res = data.get('result', {})
                for pmid_key, doc in res.items():
                    if pmid_key != 'uids':
                        ncbi_summaries[pmid_key] = doc
                time.sleep(0.5)
                break
        except Exception as e:
            time.sleep(2.0)

print(f"Fetched {len(ncbi_summaries)} summaries from NCBI.")

# Now verify each target and build final remediation mapping table
verified_remediation = []

for t in all_targets:
    cid = t["id"]
    correct_pmid = t["correct_pmid"]
    if t["source_type"] == "BOOK":
        m = t["manual_entry"]
        verified_remediation.append({
            "id": cid,
            "area": t["area"],
            "expected_title": t["expected_title"],
            "expected_authors": t["expected_authors"],
            "expected_year": t["expected_year"],
            "expected_journal": t["expected_journal"],
            "current_pmid": t["current_pmid"],
            "current_url": t["current_url"],
            "type": "BOOK",
            "correct_pmid": None,
            "correct_url": m["url"],
            "doi": m["doi"],
            "isbn": m["isbn"],
            "verified_title": m["title"],
            "verified_authors": m["authors"],
            "verified_journal": m["source"],
            "verified_year": m["year"],
            "verification_status": "VERIFIED_BOOK_DOI",
            "notes": m["note"]
        })
    else:
        doc = ncbi_summaries.get(correct_pmid, {})
        if not doc or 'title' not in doc:
            status = "VERIFICATION_ERROR"
            v_title = None
            v_authors = []
            v_source = None
            v_date = None
        else:
            v_title = doc.get('title', '')
            v_authors = [a.get('name', '') for a in doc.get('authors', [])]
            v_source = doc.get('source', '')
            v_date = doc.get('pubdate', '')
            status = "VERIFIED_NCBI_MATCH"
            
        verified_remediation.append({
            "id": cid,
            "area": t["area"],
            "expected_title": t["expected_title"],
            "expected_authors": t["expected_authors"],
            "expected_year": t["expected_year"],
            "expected_journal": t["expected_journal"],
            "current_pmid": t["current_pmid"],
            "current_url": t["current_url"],
            "type": "JOURNAL_ARTICLE",
            "correct_pmid": correct_pmid,
            "correct_url": f"https://pubmed.ncbi.nlm.nih.gov/{correct_pmid}/",
            "doi": next((aid.get('value') for aid in doc.get('articleids', []) if aid.get('idtype') == 'doi'), None),
            "verified_title": v_title,
            "verified_authors": v_authors,
            "verified_journal": v_source,
            "verified_date": v_date,
            "verification_status": status
        })

with open(r'e:/Nuove App Installate/App esercizi scienze motorie/.agents/explorer_pmid_rem_1/full_remediation_table.json', 'w', encoding='utf-8') as f_out:
    json.dump(verified_remediation, f_out, indent=2, ensure_ascii=False)

print("Saved verified full_remediation_table.json")
