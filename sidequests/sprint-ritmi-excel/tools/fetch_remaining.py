import urllib.request
import xml.etree.ElementTree as ET

pmids = ['25996964', '35151419', '11053354', '37229404', '38447429', '26660758', '31754845']
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
    doi = ''
    for aid in article.findall('.//ArticleIdList/ArticleId'):
        if aid.attrib.get('IdType') == 'doi':
            doi = aid.text
    abstract = ' '.join([at.text or '' for at in article.findall('.//Abstract/AbstractText')])
    print(f"PMID: {pmid} | DOI: {doi} | Year: {year}")
    print(f"Title: {title}")
    print(f"Journal: {journal}")
    print(f"Abstract preview: {abstract[:400]}...\n")
