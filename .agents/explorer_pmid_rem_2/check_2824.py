import urllib.request
import json

url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=28247103&retmode=json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode())['result']
p = res.get('28247103', {})
print("PMID 28247103:", p.get('source'), p.get('title'), p.get('authors'))
