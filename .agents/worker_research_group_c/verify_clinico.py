import urllib.request
import json

pmids_to_check = [
    '27215918', # Kyritsis 2016 ACL RTS criteria
    '23535282', # Askling 2013 L-protocol hamstring
    '28437318', # Mendiguchia 2017 Hamstring rehab algorithm
    '19793213', # Kongsgaard 2009 HSR patellar tendinopathy
    '26018970', # Beyer 2015 HSR vs eccentric Achilles
    '22718875', # Holmgren 2012 Subacromial impingement exercise BMJ
    '26742533', # Saragiotto 2016 Motor control chronic LBP Cochrane
    '29573872', # Foster 2018 Lancet LBP series
    '25574992', # Fransen 2015 Exercise knee osteoarthritis Cochrane
    '10023947', # Holmich 1999 Active training adductor groin pain Lancet
    '29514819', # Vuurberg 2018 Ankle sprain clinical guideline BJSM
    '30746296', # Buckthorpe 2019 Restoring Knee Extensor Strength ACL IJSPT
    '26390269', # Malliaras 2015 Patellar Tendinopathy Load Management JOSPT
    '24986160', # Cools 2014 Rehabilitation of scapular dyskinesis JOSPT or similar
]

url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=' + ','.join(pmids_to_check) + '&retmode=json'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
res = urllib.request.urlopen(req)
data = json.loads(res.read().decode('utf-8'))['result']

for p in pmids_to_check:
    if p in data:
        item = data[p]
        authors = [a['name'] for a in item.get('authors', [])]
        print(f"PMID: {p} | Journal: {item.get('source')} | Date: {item.get('pubdate')} | Title: {item.get('title')}")
        print(f"  Authors: {', '.join(authors[:4])}")
    else:
        print(f"PMID {p} NOT FOUND")
