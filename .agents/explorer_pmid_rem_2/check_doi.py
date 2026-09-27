import urllib.request
import urllib.parse
import json

url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=10.1519/SSC.0000000000000375%5BDOI%5D&retmode=json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    ids = json.loads(resp.read().decode())['esearchresult']['idlist']
print("PMID for DOI 10.1519/SSC.0000000000000375:", ids)
