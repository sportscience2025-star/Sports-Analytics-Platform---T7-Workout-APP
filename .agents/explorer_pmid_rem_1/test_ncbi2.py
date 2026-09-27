import urllib.request
import urllib.parse
import json

title = '"Technical ability of elite sprinters"'
query = f"{title} AND Morin JB[Author]"
url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(query)}&retmode=json"

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
with urllib.request.urlopen(req, timeout=10) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    print("Response:", data['esearchresult'])

if data['esearchresult']['idlist']:
    pmid = data['esearchresult']['idlist'][0]
    sum_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={pmid}&retmode=json"
    req2 = urllib.request.Request(sum_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req2, timeout=10) as resp2:
        sum_data = json.loads(resp2.read().decode('utf-8'))
        print("Summary:", sum_data['result'][pmid]['title'])
