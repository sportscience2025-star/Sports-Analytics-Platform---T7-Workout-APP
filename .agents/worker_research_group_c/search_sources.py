import urllib.request
import urllib.parse
import json
import time

existing_pmids = set([
    '443443', '2275521', '3057316', '3523107', '3770020', '4761272', '5075868', '7400379', '7851956', '8437146',
    '8827400', '8887768', '8897392', '8923631', '8961451', '9068094', '9414013', '10776897', '10917766', '10978496',
    '10999422', '11056116', '11176141', '11265986', '11708871', '11738952', '11796676', '11932598', '12629688', '12937557',
    '14636093', '14636098', '15064696', '15094144', '15292746', '15519971', '15722363', '15799745', '15831061', '15890807',
    '16084801', '16287367', '16503678', '16553066', '16672361', '16679036', '16706012', '16731809', '16802251', '16888457',
    '16931758', '16935793', '16973704', '17052063', '17196020', '17241104', '17347316', '17497576', '17685679', '17923728',
    '17991697', '18515989', '19066253', '19077735', '19182317', '19453205', '19776044', '19945969', '20024937', '20146162',
    '20182386', '20371559', '20689453', '20710093', '21198303', '21198305', '21317862', '21586354', '21688903', '21803979',
    '21993027', '22002517', '22082073', '22219258', '22344055', '22356851', '22442232', '22884568', '22897427', '23136270',
    '23539301', '23539308', '23625465', '23728984', '23745671', '23832851', '23914664', '24077376', '24149526', '24509711',
    '24737762', '24809472', '25417157', '25452613', '25640466', '25702468', '25853914', '25979840', '26002938', '26197614',
    '26199192', '26214739', '26672828', '26694507', '26732397', '26741119', '26758673', '26791930', '26792335', '26838985',
    '26888237', '26982400', '26997718', '27102424', '27162233', '27405944', '27433960', '27554923', '27633948', '27747846',
    '27845943', '28122797', '28247103', '28326043', '28362127', '28463642', '28488884', '28698222', '28957942', '29092658',
    '29249083', '29281917', '29282680', '29450822', '29503474', '29503625', '29698322', '30100827', '30413448', '30746294',
    '30819786', '30946269', '31009432', '31168817', '31512147', '31782009', '32417711', '33433845', '36399261'
])

def search_pubmed(query):
    params = {
        'db': 'pubmed',
        'term': query,
        'retmode': 'json',
        'retmax': 3
    }
    url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data.get('esearchresult', {}).get('idlist', [])
    except Exception as e:
        print(f"Error searching {query}: {e}", flush=True)
        return []

def get_summary(pmids):
    if not pmids:
        return {}
    url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=' + ','.join(pmids) + '&retmode=json'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data.get('result', {})
    except Exception as e:
        print(f"Error summary {pmids}: {e}", flush=True)
        return {}

def resolve_paper(name, query):
    idlist = search_pubmed(query)
    for p in idlist:
        if p in existing_pmids:
            continue
        sums = get_summary([p])
        item = sums.get(p, {})
        if item and 'title' in item:
            authors = [a['name'] for a in item.get('authors', [])]
            year = item.get('pubdate', '')[:4]
            title = item.get('title', '').rstrip('.')
            journal = item.get('source', '')
            print(f"MATCH [{name}]: PMID={p} | Year={year} | Journal={journal} | Title={title} | 1stAuthor={authors[0] if authors else 'N/A'}", flush=True)
            return {
                'pmid': p,
                'title': title,
                'authors': authors,
                'journal': journal,
                'year': int(year) if year.isdigit() else 2020,
                'query_name': name
            }
    print(f"NO UNIQUE MATCH for [{name}] with query '{query}'", flush=True)
    return None

# Clinico candidates (target 14)
clinico_candidates = [
    ("Kyritsis_2016", "Kyritsis Likelihood of ACL graft rupture not meeting six clinical discharge criteria"),
    ("Askling_2013", "Askling Acute hamstring injuries in Swedish elite football two rehabilitation protocols"),
    ("Mendiguchia_2017", "Mendiguchia criteria-based progressive algorithm hamstring injury treatment"),
    ("Kongsgaard_2009", "Kongsgaard Corticosteroid injections eccentric decline squat training heavy slow resistance patellar tendinopathy"),
    ("Beyer_2015", "Beyer Heavy Slow Resistance Versus Eccentric Training Achilles Tendinopathy"),
    ("Holmgren_2012", "Holmgren Effect of specific exercise strategy need for surgery subacromial impingement"),
    ("Saragiotto_2016", "Saragiotto Motor control exercise chronic non-specific low-back pain Cochrane"),
    ("Foster_2018", "Foster Prevention and treatment of low back pain evidence challenges Lancet"),
    ("Fransen_2015", "Fransen Exercise for osteoarthritis of the knee Cochrane systematic review"),
    ("Holmich_1999", "Holmich active physical training long-standing adductor-related groin pain Lancet"),
    ("Vuurberg_2018", "Vuurberg Diagnosis treatment and prevention of ankle sprains update of an evidence-based clinical guideline"),
    ("Buckthorpe_2020", "Buckthorpe Optimising the Mid-Stage Training and Testing Process After ACL Reconstruction"),
    ("Malliaras_2015", "Malliaras Patellar Tendinopathy Clinical Diagnosis Load Management JOSPT"),
    ("Silbernagel_2007", "Silbernagel Continued sports activity pain-monitoring model Achilles tendinopathy")
]

# Sport di Squadra candidates (target 14)
team_candidates = [
    ("Cummins_2013", "Cummins Global positioning systems team sports athlete monitoring review Sports Med"),
    ("Hulin_2016", "Hulin The acute chronic workload ratio predicts injury high-risk cricket fast bowlers"),
    ("Blanch_2016", "Blanch Gabbett How much is too much healthy training-load Sweet spot"),
    ("Harper_2019", "Harper Mechanical Demands of Deceleration in Team Sports Systematic Review"),
    ("Hill_Haas_2011", "Hill-Haas Physiology of small-sided games in football Sports Med"),
    ("Bishop_2011", "Bishop Girard Repeated-sprint ability part 2 recommendations for training"),
    ("Dos_Santos_2018", "Dos'Santos Mechanical Demands of Cutting Manoeuvres sports injury and performance"),
    ("Carling_2015", "Carling Match congestion in professional football injuries and performance"),
    ("Dupont_2010", "Dupont Effect of 2 matches one week on physical performance and injury rate in football"),
    ("Beato_2021", "Beato Implementing strength training in professional soccer sprint power in-season"),
    ("Cormack_2008", "Cormack Neuromuscular fatigue neuromuscular system Australian Football"),
    ("Hickey_2020", "Hickey Pain-Free Versus Pain-Threshold Rehabilitation Hamstring Strain Injuries RCT"),
    ("Moran_2019", "Moran Effects of small-sided games versus interval training sprint repeated sprint soccer"),
    ("Aughey_2011", "Aughey Applications of GPS technologies to field sports Int J Sports Physiol Perform")
]

print("--- RESOLVING CLINICO PAPERS ---", flush=True)
clin_results = []
for name, q in clinico_candidates:
    res = resolve_paper(name, q)
    if res:
        clin_results.append(res)
    time.sleep(0.3)

print(f"\nTotal Clinico resolved: {len(clin_results)} / 14\n", flush=True)

print("--- RESOLVING SPORT DI SQUADRA PAPERS ---", flush=True)
team_results = []
for name, q in team_candidates:
    res = resolve_paper(name, q)
    if res:
        team_results.append(res)
    time.sleep(0.3)

print(f"\nTotal Sport di Squadra resolved: {len(team_results)} / 14\n", flush=True)

with open('resolved_candidates.json', 'w', encoding='utf-8') as f:
    json.dump({'clinico': clin_results, 'team': team_results}, f, indent=2)
print("Saved resolved_candidates.json successfully!", flush=True)
