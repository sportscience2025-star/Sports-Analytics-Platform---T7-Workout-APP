import urllib.request
import json
import xml.etree.ElementTree as ET

def test_pubmed():
    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=Schoenfeld+Vigotsky+biomechanics&retmode=json&retmax=5"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print("NCBI search works! IDs:", data['esearchresult']['idlist'])
    except Exception as e:
        print("Error accessing NCBI:", e)

if __name__ == '__main__':
    test_pubmed()
