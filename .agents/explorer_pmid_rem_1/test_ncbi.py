import urllib.request
import urllib.parse
import json

title = "Technical ability of elite sprinters: ground force application orientation"
query = f"{title}[Title] AND Morin[Author]"
url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(query)}&retmode=json"

try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print("Response:", data)
except Exception as e:
    print("Error:", e)
