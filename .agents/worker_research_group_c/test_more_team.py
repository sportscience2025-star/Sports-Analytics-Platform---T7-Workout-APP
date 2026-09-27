import urllib.request
import urllib.parse
import json
import time

queries = [
    ("Dupont_Wisloff", "Dupont Wisloff football 2 matches"),
    ("Bradley_Krustrup", "Bradley Krustrup Premier League high-intensity running"),
    ("Carling_Congested", "Carling congested calendar football"),
    ("Thorpe_Morning_Ratings", "Thorpe Strudwick Monitoring fatigue football morning"),
    ("Impellizzeri_RPE", "Impellizzeri RPE internal training load football"),
    ("Malone_Hurling", "Malone Gabbett training load injury hurling Gaelic"),
    ("Ronnestad_Soccer_Micro", "Ronnestad in-season strength training soccer professional"),
    ("Gastin_AFL", "Gastin athlete monitoring Australian football GPS fatigue")
]

for label, term in queries:
    time.sleep(1.0)
    params = {'db': 'pubmed', 'term': term, 'retmode': 'json', 'retmax': 3}
    url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            ids = data.get('esearchresult', {}).get('idlist', [])
            for p in ids:
                time.sleep(0.5)
                sum_url = f'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={p}&retmode=json'
                with urllib.request.urlopen(urllib.request.Request(sum_url, headers={'User-Agent': 'Mozilla/5.0'})) as s_resp:
                    s_data = json.loads(s_resp.read().decode('utf-8'))['result'][str(p)]
                    print(f"[{label}]: PMID={p} | {s_data.get('source')} ({s_data.get('pubdate', '')[:4]}) | {s_data.get('title', '').rstrip('.')}", flush=True)
    except Exception as e:
        print(f"ERR [{label}]: {e}", flush=True)
