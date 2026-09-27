import urllib.request
import json

url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=20180176&retmode=json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    with urllib.request.urlopen(req, timeout=10) as response:
        data = json.loads(response.read().decode())
        print("Connected to NCBI successfully!")
        print("Title for 20180176:", data['result']['20180176']['title'])
except Exception as e:
    print("Error connecting to NCBI:", e)
