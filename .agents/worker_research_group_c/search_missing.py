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

def query_pubmed(term):
    params = {'db': 'pubmed', 'term': term, 'retmode': 'json', 'retmax': 5}
    url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data.get('esearchresult', {}).get('idlist', [])
    except Exception as e:
        print(f"Error {term}: {e}", flush=True)
        return []

def get_summaries(id_list):
    if not id_list:
        return {}
    url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=' + ','.join(id_list) + '&retmode=json'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data.get('result', {})
    except Exception as e:
        print(f"Error summaries: {e}", flush=True)
        return {}

queries = [
    # Clinico additions
    ("Kyritsis_2016", "Kyritsis Likelihood of ACL graft rupture"),
    ("Holmich_1999", "Holmich active physical training adductor Lancet 1999"),
    ("Weir_2015_Doha", "Weir Doha agreement meeting on terminology groin pain"),
    ("Skou_2015_NEJM", "Skou Randomized Controlled Trial 12-Week Medical Therapy Exercise Knee Osteoarthritis"),
    ("Edwards_2016_RC", "Edwards Exercise rehabilitation non-operative management rotator cuff tears"),

    # Sport di Squadra candidates
    ("Cummins_2013", "Cummins Global positioning systems microtechnology team sports Sports Med"),
    ("Hulin_2016", "Hulin acute:chronic workload ratio cricket fast bowlers"),
    ("Blanch_2016", "Blanch Gabbett Has the athlete trained enough return to play sweet spot"),
    ("Harper_2019", "Harper Deceleration in Team Sports Systematic Review Sports Med"),
    ("Bishop_2011", "Bishop Girard Repeated-sprint ability part 2 recommendations training"),
    ("Dos_Santos_2018", "Dos'Santos Mechanical Demands Cutting Systematic Review Sports Med"),
    ("Carling_2012", "Carling match congestion professional soccer team competition"),
    ("Dupont_2010", "Dupont Effect of 2 matches one week physical performance football"),
    ("Beato_2021", "Beato Implementing strength training professional soccer"),
    ("Cormack_2008", "Cormack Neuromuscular fatigue accelerometer load Australian Football"),
    ("Hickey_2020", "Hickey Pain-Free Versus Pain-Threshold Rehabilitation Hamstring"),
    ("Moran_2019", "Moran small-sided games interval training soccer systematic review meta-analysis"),
    ("Aughey_2011", "Aughey Applications of GPS technologies to field sports"),
    ("Bradley_2009", "Bradley High-intensity running English FA Premier League soccer")
]

for label, q in queries:
    time.sleep(1.0)
    ids = query_pubmed(q)
    new_ids = [i for i in ids if i not in existing_pmids]
    if not new_ids:
        print(f"FAILED: {label} ({q}) -> ids={ids}", flush=True)
        continue
    time.sleep(1.0)
    sums = get_summaries(new_ids[:1])
    p = new_ids[0]
    item = sums.get(p, {})
    title = item.get('title', '').rstrip('.')
    pubdate = item.get('pubdate', '')
    journal = item.get('source', '')
    authors = [a['name'] for a in item.get('authors', [])]
    print(f"SUCCESS [{label}]: PMID={p} | {journal} ({pubdate}) | {title} | Authors: {', '.join(authors[:3])}", flush=True)
