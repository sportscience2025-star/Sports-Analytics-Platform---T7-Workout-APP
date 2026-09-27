import urllib.request
import urllib.parse
import json

url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=Terzis+G%5BAuthor%5D+AND+Michalopoulos%5BAuthor%5D&retmode=json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    ids = json.loads(resp.read().decode())['esearchresult']['idlist']
print("Terzis AND Michalopoulos IDs:", ids)
