import urllib.request
import urllib.parse
import json

def test_p(q):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(q)}&retmode=json&retmax=10"
    req = urllib.request.Request(url, headers={'User-Agent': 'ExplorerPMID/1.0 (mailto:ptomm@example.com)'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        ids = data.get('esearchresult', {}).get('idlist', [])
        print(f"Query: {q} -> IDs: {ids}")
        if ids:
            sum_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(ids)}&retmode=json"
            req2 = urllib.request.Request(sum_url, headers={'User-Agent': 'ExplorerPMID/1.0 (mailto:ptomm@example.com)'})
            with urllib.request.urlopen(req2, timeout=10) as resp2:
                sdata = json.loads(resp2.read().decode('utf-8'))
                for i in ids:
                    doc = sdata.get('result', {}).get(i, {})
                    print(f"  {i}: {doc.get('title')} | {doc.get('source')} | {doc.get('pubdate')}")

test_p("Herzog W J Electromyogr Kinesiol 2004")
test_p("Herzog W history-dependent properties of skeletal muscle")
