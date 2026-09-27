import urllib.request
import urllib.parse
import json
import time

def search_pubmed(title, author):
    # Try multiple strategies
    clean_title = title.replace('"', '').replace("'", "").strip()
    first_author = author.split(',')[0].strip().split()[-1]
    
    strategies = [
        f'"{clean_title}"[Title] AND {first_author}[Author]',
        f'{clean_title}[Title] AND {first_author}[Author]',
    ]
    if ':' in clean_title:
        main_title = clean_title.split(':')[0].strip()
        strategies.append(f'"{main_title}"[Title] AND {first_author}[Author]')
        strategies.append(f'{main_title}[Title] AND {first_author}[Author]')
        
    for q_term in strategies:
        url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(q_term)}&retmode=json"
        req = urllib.request.Request(url, headers={'User-Agent': 'T7Workout-PMIDResolver/1.0 (pmid-audit@t7workout.org)'})
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                id_list = data.get('esearchresult', {}).get('idlist', [])
                if id_list:
                    return id_list[0], q_term
        except Exception as e:
            pass
        time.sleep(0.35)
    return None, None

def verify_pmid(pmid):
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={pmid}&retmode=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'T7Workout-PMIDResolver/1.0 (pmid-audit@t7workout.org)'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            item = data.get('result', {}).get(str(pmid), {})
            return {
                'title': item.get('title', ''),
                'source': item.get('source', ''),
                'pubdate': item.get('pubdate', ''),
                'authors': [a.get('name') for a in item.get('authors', [])]
            }
    except Exception as e:
        return {'error': str(e)}

test_papers = [
    ("Technical ability of elite sprinters: ground force application orientation", "Morin, J. B., Bourdin, M., Edouard, P., Peyrot, N., Samozino, P., & Lacour, J. R."),
    ("Faster top speeds of human sprinters are achieved with greater ground forces not longer contact times", "Weyand, P. G., Sternlight, D. B., Bellizzi, M. J., & Wright, S."),
    ("General force-velocity trajectories describe maximal running accelerations in humans", "Clark, K. P., & Weyand, P. G."),
    ("Developing maximal neuromuscular power: Part 1 - biological basis of maximal power production", "Cormie, P., McGuigan, M. R., & Newton, R. U."),
    ("Validity and reliability of a novel iPhone app for the measurement of barbell velocity and 1RM on the bench-press exercise", "Balsalobre-Fernandez, C., Marchante, D., Baz-Valle, E., Alonso-Molero, I., Jimenez, S. L., & Munoa, M."),
    ("Association of Acceleration with Spatiotemporal Variables in Maximal Sprinting", "Nagahara, R., Matsubayashi, T., Matsuo, A., & Zushi, K."),
    ("The Optimal Load for Maximal Power Production During Lower-Body Resistance Exercises: A Meta-Analysis", "Soriano, M. A., Jimenez-Reyes, P., Rhea, M. R., & Marin, P. J."),
    ("Olympic weightlifting training improves vertical jump height in sportspeople: a systematic review with meta-analysis", "Hackett, D., Davies, T., Soomro, N., & Halaki, M."),
    ("Olympic weightlifting training causes different knee muscle-coactivation adaptations compared with traditional weight training", "Arabatzi, F., & Kellis, E."),
    ("Short biceps femoris long head fascicle length and eccentric knee flexor weakness increase the risk of hamstring injury in elite football players", "Timmins, R. G., Bourne, M. N., Shield, A. J., Williams, M. D., Lorenzen, C., & Opar, D. A."),
]

for title, author in test_papers:
    pmid, strategy = search_pubmed(title, author)
    if pmid:
        summary = verify_pmid(pmid)
        print(f"FOUND: {pmid} | Strategy: {strategy}")
        print(f"  Summary Title: {summary['title']}")
        print(f"  Summary Source: {summary['source']} ({summary['pubdate']})")
    else:
        print(f"NOT FOUND: {title} ({author})")
    print("-" * 60)
    time.sleep(0.35)
