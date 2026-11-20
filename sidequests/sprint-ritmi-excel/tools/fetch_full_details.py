import urllib.request
import urllib.parse
import json
import xml.etree.ElementTree as ET
import time

pmids = [
    '35916747', # Darrall-Jones 2022
    '30380362', # Jimenez-Reyes 2019
    '27286181', # Jimenez-Reyes 2016
    '31754845', # Haugen 2019
    '26660758', # Haugen & Buchheit 2016
    '25996964', # Samozino 2016
    '35151419', # Healy 2022
    '11053354', # Weyand 2000
    '37229404', # Clark 2023
    '38447429', # Whitacre / Clark 2024
    '34398445', # Sandford 2021
    '20840558', # Iaia & Bangsbo 2010
    '21780851'  # Girard 2011
]

url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id={','.join(pmids)}&retmode=xml"
req = urllib.request.Request(url, headers={'User-Agent': 'SportsScienceResearch/1.0'})
with urllib.request.urlopen(req) as resp:
    xml_text = resp.read().decode('utf-8', errors='replace')

root = ET.fromstring(xml_text)
for article in root.findall('.//PubmedArticle'):
    pmid = article.find('.//MedlineCitation/PMID').text
    title = article.find('.//ArticleTitle').text
    journal = article.find('.//Journal/Title').text
    pub_date = article.find('.//JournalIssue/PubDate')
    year = pub_date.find('Year').text if pub_date.find('Year') is not None else 'N/A'
    
    author_list = article.findall('.//AuthorList/Author')
    authors = []
    for a in author_list:
        last = a.find('LastName')
        fore = a.find('ForeName')
        if last is not None and fore is not None:
            authors.append(f"{last.text} {fore.text}")
        elif last is not None:
            authors.append(last.text)
            
    doi = ''
    for aid in article.findall('.//ArticleIdList/ArticleId'):
        if aid.attrib.get('IdType') == 'doi':
            doi = aid.text
            
    abstract_texts = article.findall('.//Abstract/AbstractText')
    abstract_parts = []
    for at in abstract_texts:
        lbl = at.attrib.get('Label', '')
        txt = at.text or ''
        if lbl:
            abstract_parts.append(f"[{lbl}] {txt}")
        else:
            abstract_parts.append(txt)
            
    print("="*70)
    print(f"PMID: {pmid} | DOI: {doi} | Year: {year}")
    print(f"Authors: {', '.join(authors)}")
    print(f"Title: {title}")
    print(f"Journal: {journal}")
    print("ABSTRACT:")
    print("\n".join(abstract_parts))
    print()
