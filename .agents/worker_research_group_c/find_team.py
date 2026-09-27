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

def search_one(q):
    params = {'db': 'pubmed', 'term': q, 'retmode': 'json', 'retmax': 3}
    url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        return data.get('esearchresult', {}).get('idlist', [])

def get_sum(pmid):
    url = f'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={pmid}&retmode=json'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        return data.get('result', {}).get(str(pmid), {})

queries = [
    ("Cummins_GPS", "Cummins Global positioning systems team sports Sports Med"),
    ("Bishop_RSA_pt2", "Bishop Repeated-sprint ability part 2"),
    ("Dos_Santos_Cutting", "Dos Santos Mechanical Demands of Cutting Sports Med"),
    ("Dupont_Congestion", "Dupont Effect 2 matches one week football"),
    ("Aughey_GPS", "Aughey Applications of GPS technologies field sports"),
    ("Bradley_High_Intensity", "Bradley High-intensity running Premier League"),
    ("Carling_Congestion", "Carling match congestion professional soccer"),
    ("Thorpe_Fatigue", "Thorpe Monitoring Fatigue in Football Players"),
    ("Buchheit_30_15", "Buchheit The 30-15 intermittent fitness test"),
    ("Bangsbo_Yo_Yo", "Bangsbo The Yo-Yo intermittent recovery test"),
    ("Halson_Monitoring", "Halson Monitoring training status fatigue and recovery")
]

for label, q in queries:
    time.sleep(1.0)
    try:
        ids = search_one(q)
        valid_ids = [i for i in ids if i not in existing_pmids]
        if valid_ids:
            p = valid_ids[0]
            time.sleep(0.5)
            s = get_sum(p)
            print(f"FOUND [{label}]: PMID={p} | {s.get('source')} ({s.get('pubdate', '')[:4]}) | {s.get('title', '').rstrip('.')} | Authors: {[a['name'] for a in s.get('authors', [])][:3]}", flush=True)
        else:
            print(f"NONE for [{label}]: ids={ids}", flush=True)
    except Exception as e:
        print(f"ERR [{label}]: {e}", flush=True)
