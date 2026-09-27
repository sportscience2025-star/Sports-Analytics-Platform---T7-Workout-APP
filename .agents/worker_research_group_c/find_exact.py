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

titles_to_find = [
    ("Cummins_2013", 'Global positioning systems (GPS) and microtechnology sensors in team sports[Title]'),
    ("Bishop_2011", 'Repeated-sprint ability - part II: recommendations for training[Title]'),
    ("Dos_Santos_2018", 'Mechanical Demands of Cutting[Title] AND Dos Santos[Author]'),
    ("Dupont_2010", 'Effect of 2 matches one week on physical performance[Title]'),
    ("Bradley_2009", 'High-intensity running in English FA Premier League soccer matches[Title]'),
    ("Bangsbo_2008", 'The Yo-Yo intermittent recovery test: a useful tool for evaluation[Title]'),
    ("Buchheit_2008", 'The 30-15 intermittent fitness test: accuracy for individualizing[Title]'),
    ("Hulin_2016", 'acute:chronic workload ratio predicts injury[Title] AND Hulin[Author]'),
    ("Blanch_2016", 'trained enough to return to play safely[Title] AND Blanch[Author]'),
    ("Carling_2012", 'Are physical performance and injury risk in a professional soccer team in competition disrupted by a congested calendar[Title]'),
    ("Beato_2021", 'Implementing strength training in professional soccer[Title]'),
    ("Silva_2018", 'eccentric training hamstring soccer[Title] AND Silva[Author]')
]

for label, term in titles_to_find:
    time.sleep(1.0)
    params = {'db': 'pubmed', 'term': term, 'retmode': 'json'}
    url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            ids = data.get('esearchresult', {}).get('idlist', [])
            if ids:
                p = ids[0]
                time.sleep(0.5)
                sum_url = f'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={p}&retmode=json'
                with urllib.request.urlopen(urllib.request.Request(sum_url, headers={'User-Agent': 'Mozilla/5.0'})) as s_resp:
                    s_data = json.loads(s_resp.read().decode('utf-8'))['result'][str(p)]
                    print(f"FOUND EXACT [{label}]: PMID={p} | {s_data.get('source')} ({s_data.get('pubdate', '')[:4]}) | {s_data.get('title', '').rstrip('.')} | Dup={p in existing_pmids}", flush=True)
            else:
                print(f"NOT FOUND: [{label}] -> {term}", flush=True)
    except Exception as e:
        print(f"ERROR [{label}]: {e}", flush=True)
