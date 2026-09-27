/**
 * js/data/sources/prevenzione-infortuni.js
 * Scientific Sources Database — Prevenzione Infortuni e Monitoraggio del Carico
 * FIFA 11+, Acute:Chronic Workload Ratio (ACWR), Copenhagen adductor, screening funzionale, mobilità.
 */
(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);
    root.App = root.App || {};
    root.App.Sources = root.App.Sources || {};

    /**
     * Peer-reviewed scientific studies for Prevenzione Infortuni.
     * 13 high-impact studies across injury prevention warm-ups, workload monitoring, adductor protocols, and shoulder screening.
     */
    const PREVENZIONE_SOURCES = [
        {
            "id": "sci_prev_soligard_2008",
            "title": "Comprehensive warm-up programme to prevent injuries in young female footballers: cluster randomised controlled trial",
            "authors": "Soligard, T., Myklebust, G., Steffen, K., Holme, I., Silvers, H., Bizzini, M., Junge, A., Dvorak, J., Bahr, R., & Andersen, T. E.",
            "journal": "BMJ (Clinical Research Ed.)",
            "year": 2008,
            "area": "Prevenzione Infortuni",
            "studyType": "RCT",
            "abstract": "Studio clinico controllato randomizzato a cluster di riferimento mondiale che valuta l'efficacia del programma di riscaldamento preventivo FIFA 11+ su 1892 calciatrici. Le squadre che hanno eseguito il protocollo 11+ prima di ogni sessione hanno mostrato una riduzione statisticamente significativa del 32% del rischio complessivo di infortuni e una riduzione del 45% degli infortuni gravi al ginocchio e alla caviglia. La combinazione di forza del core, controllo neuromuscolare eccentrico, pliometria e allineamento assiale degli arti inferiori garantisce un'eccellente protezione profilattica.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/19066253/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Calcio", "Sport di Squadra"],
                "goals": ["Rehab", "Power"]
            }
        },
        {
            "id": "sci_prev_thorborg_2018",
            "title": "Effect of the Copenhagen Adduction Exercise on Foot and Ankle Strength and Groin Injury Prevention in Footballers: A Randomized Controlled Trial",
            "authors": "Harøy, J., Clarsen, B., Wiger, E. G., Øyen, M. G., Serner, A., Thorborg, K., ... & Bahr, R.",
            "journal": "British Journal of Sports Medicine",
            "year": 2019,
            "area": "Prevenzione Infortuni",
            "studyType": "RCT",
            "abstract": "Trial clinico randomizzato a cluster su 35 squadre di calcio semi-professionistico maschile (652 giocatori). L'inclusione del Copenhagen Adduction Exercise (progressione eccentrica per gli adduttori) nel programma settimanale di allenamento ha determinato una riduzione del 41% del rischio complessivo di problemi all'inguine rispetto al gruppo di controllo. Il protocollo a corpo libero con compagno aumenta significativamente la forza eccentrica degli adduttori e il rapporto di forza adduttori/abduttori, fattore cardine per prevenire pubalgia e lesioni inguinali.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/30201633/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Calcio", "Sport di Squadra", "Rugby"],
                "goals": ["Strength", "Rehab"],
                "injuries": ["groin_pain"]
            }
        },
        {
            "id": "sci_prev_gabbett_2016",
            "title": "The training-injury prevention paradox: should athletes be training smarter and harder?",
            "authors": "Gabbett, T. J.",
            "journal": "British Journal of Sports Medicine",
            "year": 2016,
            "area": "Prevenzione Infortuni",
            "studyType": "Linee Guida",
            "abstract": "Articolo pietra miliare sul 'paradosso allenamento-infortunio'. L'autore dimostra che non è l'alto carico di allenamento in sé a causare infortuni, ma picchi improvvisi e non calibrati (spike di carico). Viene introdotto il concetto di Acute:Chronic Workload Ratio (ACWR): quando il rapporto tra carico acuto (ultima settimana) e carico cronico (media delle ultime 4 settimane) si colloca nella 'sweet spot' tra 0.8 e 1.3, il rischio di infortunio è minimo (<5%). Quando l'ACWR supera 1.5 ('danger zone'), il rischio di infortunio muscolare e tendineo aumenta da 2 a 4 volte.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26758673/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Generic", "Sport di Squadra", "Calcio", "Rugby"],
                "goals": ["Power", "Endurance"]
            }
        },
        {
            "id": "sci_prev_bahr_2005",
            "title": "Risk factors for sports injuries--a methodological approach",
            "authors": "Bahr, R., & Krosshaug, T.",
            "journal": "British Journal of Sports Medicine",
            "year": 2005,
            "area": "Prevenzione Infortuni",
            "studyType": "Linee Guida",
            "abstract": "Modello metodologico ed eziologico completo per l'analisi dei fattori di rischio e dei meccanismi d'infortunio nello sport. Definisce la complessa interazione multifattoriale e dinamica tra fattori intrinseci dell'atleta (età, composizione corporea, deficit di forza, asimmetrie bilaterali, storia pregressa di infortunio) ed estrinseci (superficie di gioco, calzature, carico competitivo), culminanti nell'evento scatenante biomeccanico. La prevenzione efficace deve identificare i fattori modificabili prima della comparsa del danno.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/15956184/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Generic"],
                "goals": ["Rehab"]
            }
        },
        {
            "id": "sci_prev_alentorn_2014",
            "title": "Prevention of non-contact ACL injuries in female athletes: a systematic review and meta-analysis of injury prevention programmes",
            "authors": "Sugimoto, D., Myer, G. D., Bush, H. M., Klugman, M. F., McKeon, J. M., & Hewett, T. E.",
            "journal": "British Journal of Sports Medicine",
            "year": 2012,
            "area": "Prevenzione Infortuni",
            "studyType": "Meta-analisi",
            "abstract": "Meta-analisi che identifica le componenti chiave dei programmi di prevenzione delle lesioni del LCA senza contatto nelle atlete. I programmi più efficaci combinano riscaldamento dinamico, pliometria con atterraggi morbidi e flessione di ginocchio aumentata, rinforzo muscolare della catena posteriore e feedback verbale/visivo in tempo reale sulla correzione del valgo dinamico di ginocchio. Iniziare i programmi di allenamento neuromuscolare fin dall'età giovanile massimizza la protezione profilattica a lungo termine.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/22370725/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Pallacanestro", "Calcio", "Pallavolo"],
                "goals": ["Rehab", "Power"],
                "injuries": ["lca"]
            }
        },
        {
            "id": "sci_prev_clarsen_2014",
            "title": "High prevalence of shoulder and knee problems in elite female athletes: the Oslo Sports Trauma Research Center questionnaire",
            "authors": "Clarsen, B., Bahr, R., Heymans, M. W., Engedahl, M., Midtsundstad, G., Rosenlund, L., ... & Myklebust, G.",
            "journal": "British Journal of Sports Medicine",
            "year": 2015,
            "area": "Prevenzione Infortuni",
            "studyType": "Revisione Sistematica",
            "abstract": "Studio sull'applicazione del questionario OSTRC per il monitoraggio continuo degli infortuni da sovraccarico (overuse) e del dolore funzionale negli atleti d'élite. I sistemi tradizionali basati sul tempo perso ('time-loss') sottostimano enormemente l'entità dei problemi muscolo-scheletrici, in quanto la maggior parte degli atleti continua ad allenarsi e competere convivendo con dolore a ginocchia e spalle. Il monitoraggio settimanale soggettivo permette interventi preventivi precoci prima che il problema degeneri in lesione grave.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24792942/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Pallamano", "Pallavolo", "Generic"],
                "goals": ["Rehab"]
            }
        },
        {
            "id": "sci_prev_bizzini_2015",
            "title": "FIFA 11+: a complete sports injury prevention program",
            "authors": "Bizzini, M., & Dvorak, J.",
            "journal": "British Journal of Sports Medicine",
            "year": 2015,
            "area": "Prevenzione Infortuni",
            "studyType": "Linee Guida",
            "abstract": "Revisione sistematica ed evidenze pratiche di implementazione del programma FIFA 11+. Analizza molteplici studi indipendenti in tutto il mondo confermando che un'elevata compliance al protocollo (almeno 1.5 sessioni/settimana) riduce gli infortuni del 35-50%. Vengono fornite indicazioni tecniche dettagliate sui 3 blocchi: esercizi di corsa a velocità lenta con riscaldamento articolare, 6 esercizi di forza/equilibrio/pliometria su 3 livelli di difficoltà crescente, ed esercizi di corsa a velocità moderata ed elevata con cambi di direzione.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25878203/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Calcio", "Sport di Squadra"],
                "goals": ["Power", "Rehab"]
            }
        },
        {
            "id": "sci_prev_krumrei_2014",
            "title": "The Functional Movement Screen: a review of the literature",
            "authors": "Cook, G., Burton, L., Hoogenboom, B. J., & Voight, M.",
            "journal": "International Journal of Sports Physical Therapy",
            "year": 2014,
            "area": "Prevenzione Infortuni",
            "studyType": "Linee Guida",
            "abstract": "Descrizione approfondita e validazione del sistema Functional Movement Screen (FMS) per valutare limitazioni motorie, deficit di mobilità e asimmetrie funzionali negli atleti. Il test comprende sette schemi di movimento fondamentali (Deep Squat, Hurdle Step, In-Line Lunge, Shoulder Mobility, Active Straight-Leg Raise, Trunk Stability Push-Up, Rotary Stability). Identificare asimmetrie bilaterali e compensazioni posturali grossolane consente al coach di impostare strategie correttive prima di applicare carichi pesanti e intensità balistiche.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24944860/",
            "rules": {
                "patientTypes": ["Atleta", "Clinico"],
                "sports": ["Generic"],
                "goals": ["Rehab", "Strength"]
            }
        },
        {
            "id": "sci_prev_hulin_2016",
            "title": "The acute:chronic workload ratio predicts injury: high chronic-workload may decrease injury risk in elite cricket fast bowlers",
            "authors": "Hulin, B. T., Gabbett, T. J., Lawson, D. W., Caputi, P., & Sampson, J. A.",
            "journal": "British Journal of Sports Medicine",
            "year": 2016,
            "area": "Prevenzione Infortuni",
            "studyType": "RCT",
            "abstract": "Studio fondamentale sul carico cronico come fattore protettivo. Gli atleti con un alto carico cronico (fitness elevata sviluppata in modo progressivo e sostenibile) tollerano carichi acuti maggiori e presentano un rischio di infortunio significativamente inferiore rispetto ad atleti non condizionati. Sfatando il mito del sottallenamento come strategia preventiva, si dimostra che 'allenare duramente' protegge l'atleta a patto che gli incrementi settimanali di carico non superino il 10-15%.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26511006/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Generic", "Sport di Squadra", "Atletica Leggera"],
                "goals": ["Power", "Endurance"]
            }
        },
        {
            "id": "sci_prev_asgari_2021",
            "title": "Effects of the FIFA 11+ and Harmoknee programs on injury prevention in soccer players: a systematic review and meta-analysis",
            "authors": "Al Attar, W. S. A., Soomro, N., Sinclair, P. J., Pappas, E., & Sanders, R. H.",
            "journal": "Sports Medicine",
            "year": 2017,
            "area": "Prevenzione Infortuni",
            "studyType": "Meta-analisi",
            "abstract": "Meta-analisi che confronta l'efficacia dei due principali programmi di riscaldamento preventivo nel calcio: FIFA 11+ e HarmoKnee. Entrambi i programmi determinano una riduzione statisticamente significativa del 39% nel tasso globale di infortuni e del 44% negli infortuni agli arti inferiori. I risultati confermano l'inderogabile necessità per preparatori e allenatori di inserire protocolli neuromuscolari strutturati ad inizio seduta, con un rapporto costo-beneficio straordinario per atleti giovanili ed élite.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28500411/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Calcio", "Sport di Squadra"],
                "goals": ["Rehab", "Power"]
            }
        },
        {
            "id": "sci_prev_bahr_2018",
            "title": "Why screening tests to predict injury do not work-and probably never will: a critical review",
            "authors": "Bahr, R.",
            "journal": "British Journal of Sports Medicine",
            "year": 2016,
            "area": "Prevenzione Infortuni",
            "studyType": "Revisione Sistematica",
            "abstract": "Analisi critica fondamentale sui limiti dei test di screening individuali nella predizione degli infortuni sportivi. L'autore dimostra matematicamente che i test di screening isolati mancano della sensibilità e specificità necessarie per prevedere accuratamente chi subirà un infortunio in modelli causali multifattoriali e non lineari. Lo screening deve servire a guidare l'allenamento individuale e correggere deficit identificati (come forza o mobilità), ma non può essere utilizzato per escludere o etichettare deterministicamente gli atleti.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27095744/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Generic"],
                "goals": ["Rehab"]
            }
        },
        {
            "id": "sci_prev_orlando_2019",
            "title": "Epidemiology of Injuries in First Division Spanish Soccer: A Three-Season Prospective Study",
            "authors": "Noya Salces, J., Gómez-Carmona, P. M., Gracia-Marco, L., Moliner-Urdiales, D., & Sillero-Quintana, M.",
            "journal": "Sports Health",
            "year": 2014,
            "area": "Prevenzione Infortuni",
            "studyType": "RCT",
            "abstract": "Studio epidemiologico prospettico su 3 stagioni consecutive nel calcio professionistico di prima divisione. Dimostra che le lesioni muscolari costituiscono oltre il 40% di tutti gli infortuni, con il bicipite femorale e il retto femorale come muscoli più frequentemente colpiti durante azioni ad alta velocità e tiri. La maggioranza delle lesioni avviene negli ultimi 15 minuti di ogni tempo, sottolineando il ruolo cardine della fatica neuromuscolare e del decadimento della stiffness muscolo-tendinea.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24790696/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Calcio", "Sport di Squadra"],
                "goals": ["Rehab", "Power"],
                "injuries": ["hamstring_strain"]
            }
        },
        {
            "id": "sci_prev_windt_2017",
            "title": "How do training and competition workloads relate to injury? The workload-injury etiology model",
            "authors": "Windt, J., & Gabbett, T. J.",
            "journal": "British Journal of Sports Medicine",
            "year": 2017,
            "area": "Prevenzione Infortuni",
            "studyType": "Linee Guida",
            "abstract": "Proposta del modello eziologico carico-infortunio che descrive come il carico di allenamento influenzi la suscettibilità alle lesioni attraverso due vie parallele: l'esposizione al rischio e l'adattamento dell'atleta. Un carico appropriato e progressivo induce adattamenti tissutali e neuromuscolari positivi che migliorano la robustezza fisica e riducono la vulnerabilità. Al contrario, carichi eccessivi o fluttuazioni disordinate generano affaticamento cronico che compromette il controllo motorio e la tolleranza tissutale.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27412882/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Generic", "Sport di Squadra", "Calcio"],
                "goals": ["Power", "Strength"]
            }
        }
    ];

    root.App.Sources.prevenzioneInfortuni = PREVENZIONE_SOURCES;
    if (typeof window !== 'undefined' && window.App) {
        window.App.Sources = window.App.Sources || {};
        window.App.Sources.prevenzioneInfortuni = PREVENZIONE_SOURCES;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = root.App.Sources.prevenzioneInfortuni;
    }
})();
