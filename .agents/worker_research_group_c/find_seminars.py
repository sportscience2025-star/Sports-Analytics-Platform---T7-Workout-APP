import urllib.request
import urllib.parse
import json
import time

queries = [
    ("Dos_Santos_Cutting", "Mechanical Demands of Cutting Sports Medicine"),
    ("Dupont_2matches", "Dupont Effect of 2 matches one week on physical performance"),
    ("Bangsbo_YoYo", "Bangsbo Iaia Krustrup The Yo-Yo intermittent recovery test Sports Med"),
    ("Bradley_2009_EPL", "Bradley Sheldon High-intensity running English FA Premier League"),
    ("Carling_Congested", "Carling Le Gall Dupont congested calendar Sports Med")
]

for label, term in queries:
    time.sleep(1.0)
    params = {'db': 'pubmed', 'term': term, 'retmode': 'json'}
    url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            ids = data.get('esearchresult', {}).get('idlist', [])
            if ids:
                for p in ids[:3]:
                    time.sleep(0.5)
                    sum_url = f'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={p}&retmode=json'
                    with urllib.request.urlopen(urllib.request.Request(sum_url, headers={'User-Agent': 'Mozilla/5.0'})) as s_resp:
                        s_data = json.loads(s_resp.read().decode('utf-8'))['result'][str(p)]
                        print(f"[{label}]: PMID={p} | {s_data.get('source')} ({s_data.get('pubdate', '')[:4]}) | {s_data.get('title', '').rstrip('.')}", flush=True)
            else:
                print(f"NOT FOUND: [{label}]", flush=True)
    except Exception as e:
        print(f"ERR [{label}]: {e}", flush=True)
