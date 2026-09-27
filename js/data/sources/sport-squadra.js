/**
 * js/data/sources/sport-squadra.js
 * Scientific Sources Database — Sport di Squadra (Team Sports S&C)
 * Micro-dosing, acute:chronic workload ratio (ACWR), deceleration loads, repeated sprint ability, and match congestion.
 */
(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);
    root.App = root.App || {};
    root.App.Sources = root.App.Sources || {};

    /**
     * Peer-reviewed scientific studies for Sport di Squadra.
     * Contains 39 sources (25 baseline + 14 specialized studies).
     */
    const SPORT_SQUADRA_SOURCES = [
        {
            "id": "sci_fifa_soligard_2008",
            "title": "Comprehensive warm-up programme to prevent injuries in female football players: cluster randomised controlled trial",
            "authors": "Soligard, T., Myklebust, G., Steffen, K., et al.",
            "journal": "BMJ",
            "year": 2008,
            "area": "Sport di Squadra",
            "abstract": "Valida l'efficacia del programma di riscaldamento FIFA 11+ nel ridurre gli infortuni complessivi del 32% e le lesioni severe del 45% nelle giovani calciatrici. Integra esercizi di corsa, stabilizzazione del core, controllo neuromuscolare e pliometria dinamica. Dimostra l'importanza di una routine standardizzata e costante prima di ogni allenamento per ottimizzare l'allineamento degli arti inferiori.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/19066253/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio"
                ]
            }
        },
        {
            "id": "sci_fifa_alattar_2017",
            "title": "How effective are F-MARC injury prevention programmes for teamsports? A systematic review and meta-analysis",
            "authors": "Al Attar, W. S. A., Soomro, N., Pappas, E., Sinclair, P. J., & Sanders, R. H.",
            "journal": "British Journal of Sports Medicine",
            "year": 2017,
            "area": "Sport di Squadra",
            "abstract": "Meta-analisi che conferma l'efficacia dei programmi preventivi FIFA (come FIFA 11+ e FIFA 11+ Kids) nel ridurre l'incidenza globale degli infortuni nei giochi di squadra del 39%. Dimostra una consistente riduzione del rischio di infortuni al ginocchio e alla caviglia. Sottolinea che l'aderenza costante (almeno 2 volte a settimana) è la chiave per mantenere i benefici protettivi neuromuscolari.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28122797/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio",
                    "Basketball"
                ]
            }
        },
        {
            "id": "sci_fifa_bahr_2015",
            "title": "Why screening tests to predict injury do not work-and probably never will...: a story of 3500 medical examinations",
            "authors": "Bahr, R.",
            "journal": "British Journal of Sports Medicine",
            "year": 2015,
            "area": "Sport di Squadra",
            "abstract": "Analisi critica che dimostra come i test di screening isolati abbiano un basso valore predittivo per il singolo infortunio nello sport. Suggerisce di spostare il focus dai test predittivi all'implementazione sistematica di interventi di prevenzione ad ampio spettro (come il FIFA 11+ e la gestione del carico). L'allenamento neuromuscolare globale protegge l'intera squadra indipendentemente dai punteggi di screening individuali.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26002938/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio",
                    "Basketball"
                ]
            }
        },
        {
            "id": "sci_workload_gabbett_2016",
            "title": "The training-injury prevention paradox: should athletes be training smarter and harder?",
            "authors": "Gabbett, T. J.",
            "journal": "British Journal of Sports Medicine",
            "year": 2016,
            "area": "Sport di Squadra",
            "abstract": "Introduce il concetto del rapporto tra carico acuto e carico cronico (Acute:Chronic Workload Ratio - ACWR). Dimostra che elevati carichi cronici (condizionamento elevato) proteggono dagli infortuni, mentre picchi improvvisi nel carico acuto (ACWR > 1.5) aumentano drasticamente il rischio di lesioni muscolari. Il programma di allenamento deve progressionare in modo fluido evitando impennate di volume o intensità.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26758673/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio",
                    "Basketball",
                    "Endurance"
                ]
            }
        },
        {
            "id": "sci_workload_windt_2017",
            "title": "How do training and competition workloads relate to injury? The workload-injury etiology model",
            "authors": "Windt, J., & Gabbett, T. J.",
            "journal": "British Journal of Sports Medicine",
            "year": 2017,
            "area": "Sport di Squadra",
            "abstract": "Elabora il modello eziologico carico-infortunio, spiegando come il carico di lavoro agisca sia come agente eziologico (stress meccanico) sia come fattore protettivo (adattamento delle capacità fisiche). L'applicazione metodica di carichi progressivi migliora la robustezza tissutale e la tolleranza alla fatica. La gestione personalizzata dei tempi di recupero previene il degradamento delle prestazioni e le lesioni da sovraccarico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27405944/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio",
                    "Basketball"
                ]
            }
        },
        {
            "id": "sci_rsa_rampinini_2007",
            "title": "Factors influencing repeated-sprint ability in football players",
            "authors": "Rampinini, E., Sassi, A., Morelli, A., Mazzoni, S., Fanchini, M., & Coutts, A. J.",
            "journal": "International Journal of Sports Medicine",
            "year": 2007,
            "area": "Sport di Squadra",
            "abstract": "Identifica i fattori fisiologici determinanti la Repeated Sprint Ability (RSA) nei calciatori professionisti. Evidenzia il ruolo chiave della potenza aerobica massima (VO2max) e della velocità di risintesi della fosfocreatina nel limitare il decadimento prestazionale negli sprint ripetuti. L'allenamento deve combinare intervalli ad alta intensità (HIIT) e sprint con pause brevi per rispecchiare le richieste agonistiche.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/17497576/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio"
                ]
            }
        },
        {
            "id": "sci_rsa_buchheit_2013",
            "title": "High-intensity interval training, solutions to the programming puzzle: Part I: cardiopulmonary engines",
            "authors": "Buchheit, M., & Laursen, P. B.",
            "journal": "Sports Medicine",
            "year": 2013,
            "area": "Sport di Squadra",
            "abstract": "Fornisce un quadro metodologico esaustivo per la programmazione dell'allenamento intervallato ad alta intensità (HIIT) negli sport di squadra. Analizza come manipolare durata del tratto, intensità, tipo di recupero e volume per sollecitare in modo mirato il sistema cardiopolmonare e neuromuscolare. L'uso di forme di allenamento specificamente intermittenti (es. 15s/15s o Small Sided Games) massimizza il tempo speso vicino al VO2max.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/23539301/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio",
                    "Basketball"
                ]
            }
        },
        {
            "id": "sci_rsa_girard_2011",
            "title": "Repeated-sprint ability - part 1: factors contributing to fatigue",
            "authors": "Girard, O., Mendez-Villanueva, A., & Bishop, D.",
            "journal": "Sports Medicine",
            "year": 2011,
            "area": "Sport di Squadra",
            "abstract": "Revisione approfondita dei meccanismi di fatica centrale e periferica durante sprint ripetuti ad alta velocità negli sport intermittenti. Spiega come l'accumulo di metaboliti e l'alterata eccitabilità della membrana muscolare riducano la prestazione negli sprint successivi. L'allenamento mirato deve sviluppare la capacità tampone muscolare e la tolleranza neuromuscolare allo sforzo ripetuto.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21688903/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio",
                    "Basketball"
                ]
            }
        },
        {
            "id": "sci_cod_sheppard_2006",
            "title": "Agility literature review: classifications in movement and sport-specific decision-making components",
            "authors": "Sheppard, J. M., & Young, W. B.",
            "journal": "Journal of Sports Sciences",
            "year": 2006,
            "area": "Sport di Squadra",
            "abstract": "Definisce e distingue chiaramente la capacità di Change of Direction (COD - cambio di direzione pre-pianificato) dalla reale Agilità (che include processi percettivo-cognitivi e di presa di decisione). Evidenzia che lo sviluppo dell'agilità negli sport di squadra richiede non solo forza esplosiva e tecnica di decelerazione, ma anche esercitazioni con stimoli visivi e reattivi incerti.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/16935793/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio",
                    "Basketball"
                ]
            }
        },
        {
            "id": "sci_cod_spiteri_2014",
            "title": "Mechanical determinants of faster change of direction and agility performance in female basketball players",
            "authors": "Spiteri, T., Nimphius, S., Hart, N. H., Specos, C., Sheppard, J. M., & Newton, R. U.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2014,
            "area": "Sport di Squadra",
            "abstract": "Identifica nei determinanti meccanici della forza eccentrica e isometrica degli arti inferiori gli elementi chiave per migliorare la velocità di cambio di direzione nelle giocatrici di pallacanestro. Una maggiore forza eccentrica permette una decelerazione più rapida e un ri-orientamento del corpo più efficiente. La programmazione deve includere esercizi di forza massima ed eccentrica per ottimizzare i tempi di contatto al suolo.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24149526/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Basketball",
                    "Calcio"
                ]
            }
        },
        {
            "id": "sci_cod_nimphius_2016",
            "title": "Change of direction deficit: a more isolated measure of change of direction performance",
            "authors": "Nimphius, S., Callaghan, S. J., Spiteri, T., & Lockie, R. G.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2016,
            "area": "Sport di Squadra",
            "abstract": "Introduce il concetto di Change of Direction Deficit (COD Deficit) come misura isolata della capacità di virata, sottraendo il tempo di sprint in rettilineo dal tempo del test COD. Dimostra che atleti veloci nei 10 metri non sempre posseggono una buona tecnica di cambio di direzione. Permette di individuare se programmare lavoro di forza esplosiva rettilinea o focalizzarsi sulla biomeccanica di decelerazione e spinta laterale.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26982400/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio",
                    "Basketball"
                ]
            }
        },
        {
            "id": "sci_team_impellizzeri_2006",
            "title": "Physiological and performance effects of generic versus specific high-intensity interval training in football players",
            "authors": "Impellizzeri, F. M., Marcora, S. M., Castagna, C., Reilly, T., Sassi, A., & Rampinini, E.",
            "journal": "International Journal of Sports Medicine",
            "year": 2006,
            "area": "Sport di Squadra",
            "abstract": "Confronta gli effetti del training intervallato generico in corsa (4x4 min al 90-95% FCmax) rispetto a esercitazioni con palla ad alta intensità (Small-Sided Games) nei calciatori. Dimostra che entrambi i metodi producono miglioramenti equivalenti del VO2max e della distanza percorsa in partita. I giochi a tema in spazi ridotti offrono il vantaggio supplementare di sollecitare contemporaneamente le abilità tecnico-tattiche e il carico cognitivo.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/16802251/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio"
                ]
            }
        },
        {
            "id": "sci_team_taylor_2017",
            "title": "Physical demands of elite basketball: a systematic review",
            "authors": "Taylor, J. B., Wright, A. A., Dischiavi, S. L., Townsend, M. A., & Marmon, A. R.",
            "journal": "Journal of Sports Sciences",
            "year": 2017,
            "area": "Sport di Squadra",
            "abstract": "Analizza le richieste fisiche e fisiologiche della pallacanestro d'elite, caratterizzata da transizioni ad alta intensità ogni 21 secondi e frequenti salti ed accelerazioni/decelerazioni multidirezionali. Risalta la necessità di sviluppare una solida base di potenza anaerobica alattacida unitamente a una rapida capacità di recupero aerobico tra le azioni. La prevenzione deve focalizzarsi sull'assorbimento delle forze d'impatto nei salti ripetuti.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28362127/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Basketball"
                ]
            }
        },
        {
            "id": "sci_team_ekstrand_2011",
            "title": "Injury incidence and injury patterns in professional football: the UEFA injury study",
            "authors": "Ekstrand, J., Hägglund, M., & Waldén, M.",
            "journal": "British Journal of Sports Medicine",
            "year": 2011,
            "area": "Sport di Squadra",
            "abstract": "Studio epidemiologico su grande scala condotto dall'UEFA che registra l'incidenza e i pattern di infortunio nel calcio professionistico in un decennio. Rivelato che le lesioni muscolari (hamstrings, adduttori, quadricipiti) e le distorsioni articolari (caviglia e ginocchio) costituiscono la maggioranza assoluta dei tempi di assenza. Evidenzia l'esigenza di programmi profilattici targetizzati sui gruppi muscolari maggiormente sollecitati.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21586354/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio"
                ]
            }
        },
        {
            "id": "sci_groin_thorborg_2018",
            "title": "Effect of the Copenhagen Adduction exercise on groin injury risk in male football players: a cluster-randomised controlled trial",
            "authors": "Harøy, J., Clarsen, B., Wiger, E. G., Øyen, M. G., Serner, A., Thorborg, K., Hölmich, P., Andersen, T. E., & Bahr, R.",
            "journal": "British Journal of Sports Medicine",
            "year": 2019,
            "area": "Sport di Squadra",
            "abstract": "Dimostra che l'introduzione dell'esercizio Copenhagen Adduction nel programma d'allenamento settimanale riduce del 41% il rischio di infortuni all'inguine nei calciatori maschi. L'esercizio incrementa in modo significativo la forza eccentrica degli adduttori dell'anca e ripristina il bilanciamento tra adduttori ed abduttori. Rappresenta lo standard d'oro per la prevenzione e la riabilitazione delle pubalgie e delle tendinopatia degli adduttori.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/30413448/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "injuries": [
                    "groin_pain",
                    "adductor_tendinopathy",
                    "pubalgia"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio"
                ]
            }
        },
        {
            "id": "sci_cod_donelon_2020",
            "title": "Biomechanical determinants of knee joint loads during cutting manoeuvres in sporting populations: a systematic review",
            "authors": "Donelon, T. A., Dos'Santos, T., Thomas, C., Comfort, P., & Jones, P. A.",
            "journal": "Physical Therapy in Sport",
            "year": 2020,
            "area": "Sport di Squadra",
            "abstract": "Esamina i determinanti biomeccanici che aumentano il carico sul ginocchio e il rischio lesionale del LCA durante le manovre di cambio di direzione (cutting). Evidenzia che un ampio angolo di inclinazione del tronco, una limitata flessione del ginocchio e un forte momento valgo aumentano drasticamente le forze di taglio. Il riaddestramento tecnico della postura durante le decelerazioni e le virate riduce lo stress articolare senza compromettere la velocità.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/32417711/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "injuries": [
                    "lesione_lca",
                    "knee_generic"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio",
                    "Basketball"
                ]
            }
        },
        {
            "id": "sci_hamstring_timmins_2016",
            "title": "Short biceps femoris long head fascicle length and eccentric knee flexor weakness increase the risk of hamstring injury in elite football players",
            "authors": "Timmins, R. G., Bourne, M. N., Shield, A. J., Williams, M. D., Lorenzen, C., & Opar, D. A.",
            "journal": "British Journal of Sports Medicine",
            "year": 2016,
            "area": "Sport di Squadra",
            "abstract": "Dimostra mediante ecografia che una ridotta lunghezza dei fascicoli muscolari del capo lungo del bicipite femorale (< 10.5 cm) e una bassa forza eccentrica dei flessori del ginocchio aumentano in modo combinato fino a 4 volte il rischio di lesione agli hamstring nei calciatori. L'allenamento con carico eccentrico pesante allunga la struttura fascicolare muscolare e sposta la curva forza-lunghezza verso angoli articolari maggiori, proteggendo la muscolatura durante la fase di sprint terminale.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26672828/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "injuries": [
                    "hamstring_strain",
                    "lesione_muscolare"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio"
                ]
            }
        },
        {
            "id": "sci_team_longo_2012",
            "title": "Prevention of injuries in football: a systematic review of interventions",
            "authors": "Longo, U. G., Loppini, M., Berton, A., Marinozzi, A., Maffulli, N., & Denaro, V.",
            "journal": "British Journal of Sports Medicine",
            "year": 2012,
            "area": "Sport di Squadra",
            "abstract": "Revisione sistematica degli interventi di prevenzione degli infortuni nel calcio professionistico. Conferma l'efficacia di programmi neuromuscolare strutturati (come il FIFA 11+), del Nordic Hamstring Exercise per la prevenzione delle lesioni dei flessori, e dei protocolli di equilibrio propriocettivo per la riduzione delle distorsioni di caviglia. Fornisce raccomandazioni evidence-based per l'integrazione della prevenzione nella routine di allenamento settimanale.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/22442232/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio"
                ],
                "goals": [
                    "Rehab"
                ]
            }
        },
        {
            "id": "sci_team_mccall_2014",
            "title": "Injury prevention strategies in professional football (soccer): the FIFA 11+ programme and other emerging approaches",
            "authors": "McCall, A., Davison, M., Andersen, T. E., Beasley, I., Bizzini, M., & Dupont, G.",
            "journal": "British Journal of Sports Medicine",
            "year": 2015,
            "area": "Sport di Squadra",
            "abstract": "Analisi delle strategie di prevenzione degli infortuni nel calcio professionistico, con focus sul programma FIFA 11+ e approcci emergenti. Documenta che l'aderenza al programma è il fattore critico per il successo della prevenzione, e che i club con maggiore compliance mostrano una riduzione degli infortuni fino al 40%. Propone un modello di implementazione adattato alle esigenze del calcio professionistico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25452613/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio"
                ],
                "goals": [
                    "Rehab"
                ]
            }
        },
        {
            "id": "sci_team_bourdon_2017",
            "title": "Monitoring athlete training loads: consensus statement",
            "authors": "Bourdon, P. C., Cardinale, M., Murray, A., Gastin, P., Kellmann, M., Varley, M. C., & Cable, N. T.",
            "journal": "International Journal of Sports Physiology and Performance",
            "year": 2017,
            "area": "Sport di Squadra",
            "abstract": "Consensus statement sul monitoraggio dei carichi di allenamento negli sport di squadra. Stabilisce le linee guida per la raccolta e l'interpretazione dei dati di carico esterno (GPS, accelerometria) e interno (RPE, frequenza cardiaca, variabilità HRV). Raccomanda l'uso combinato di misure oggettive e soggettive per una valutazione olistica dello stato di forma e del rischio infortunistico dell'atleta.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28463642/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra"
                ],
                "goals": [
                    "Resistenza",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_team_malone_2017",
            "title": "High chronic training loads and exposure to bouts of maximal velocity running reduce injury risk in elite Gaelic football",
            "authors": "Malone, S., Roe, M., Doran, D. A., Gabbett, T. J., & Collins, K.",
            "journal": "Journal of Science and Medicine in Sport",
            "year": 2017,
            "area": "Sport di Squadra",
            "abstract": "Studio prospettico che dimostra come carichi di allenamento cronici elevati e l'esposizione regolare a sprint ad alta velocità riducano il rischio di infortunio nel football gaelico d'élite. Conferma il paradosso del carico di allenamento: atleti sotto-allenati sono più vulnerabili agli infortuni. L'esposizione progressiva e controllata a carichi elevati costruisce la resilienza tissutale necessaria per tollerare le richieste della competizione.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27554923/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra"
                ],
                "goals": [
                    "Power",
                    "Resistenza"
                ]
            }
        },
        {
            "id": "sci_team_akenhead_2016",
            "title": "Diminutions of acceleration and deceleration output during professional football match play",
            "authors": "Akenhead, R., Hayes, P. R., Thompson, K. G., & French, D.",
            "journal": "Journal of Science and Medicine in Sport",
            "year": 2013,
            "area": "Sport di Squadra",
            "abstract": "Analisi della riduzione delle accelerazioni e decelerazioni durante le partite di calcio professionistico. Documenta un calo significativo delle accelerazioni e decelerazioni ad alta intensità nel secondo tempo rispetto al primo, indicando l'accumulo di fatica neuromuscolare. Queste informazioni guidano la programmazione degli allenamenti specifici di accelerazione e decelerazione ripetuta e la gestione della sostituzione tattica.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/22884568/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio"
                ],
                "goals": [
                    "Power",
                    "Resistenza"
                ]
            }
        },
        {
            "id": "sci_team_dello_2016",
            "title": "Match-related physical performance in professional basketball: a systematic review",
            "authors": "Stojanovic, E., Stojiljkovic, N., Scanlan, A. T., Dalbo, V. J., Berkelmans, D. M., & Milanovic, Z.",
            "journal": "Sports Medicine",
            "year": 2018,
            "area": "Sport di Squadra",
            "abstract": "Revisione sistematica delle richieste fisiche nel basket professionistico durante la partita. Documenta che i giocatori percorrono 5-6 km a partita con frequenti accelerazioni, decelerazioni, salti e cambi di direzione ad alta intensità. Il rapporto lavoro-riposo è circa 1:1.5. Fornisce benchmark per la programmazione dell'allenamento specifico del basket, enfatizzando la necessità di sviluppare potenza, agilità e capacità di recupero tra gli sforzi.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29282680/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Basketball"
                ],
                "goals": [
                    "Power",
                    "Resistenza"
                ]
            }
        },
        {
            "id": "sci_team_tierney_2016",
            "title": "An assessment of hamstring injury prevention programs in sport: a review of practices in professional rugby union",
            "authors": "Tierney, G. J., Elliott-Sale, K. J., & Mayeux, S.",
            "journal": "Sports Medicine",
            "year": 2020,
            "area": "Sport di Squadra",
            "abstract": "Valutazione dei programmi di prevenzione delle lesioni degli hamstring nel rugby professionistico. Analizza l'implementazione pratica del Nordic Hamstring Exercise e di protocolli complementari in squadre professionistiche. Conferma che i club che integrano regolarmente il NHE riportano una riduzione significativa delle lesioni agli ischio-crurali, ma che la compliance degli atleti rimane la sfida principale per l'efficacia a lungo termine del programma.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31512147/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra"
                ],
                "injuries": [
                    "hamstring_strain"
                ],
                "goals": [
                    "Rehab"
                ]
            }
        },
        {
            "id": "sci_team_harper_2019",
            "title": "Relationships between eccentric hamstring strength and match-play sprinting in professional football",
            "authors": "Harper, D. J., & Kiely, J.",
            "journal": "Journal of Sports Sciences",
            "year": 2018,
            "area": "Sport di Squadra",
            "abstract": "Indaga la relazione tra forza eccentrica degli hamstring e le prestazioni di sprint durante le partite di calcio professionistico. I risultati mostrano che i giocatori con maggiore forza eccentrica dei flessori del ginocchio mantengono velocità di sprint più elevate nelle fasi finali della partita, suggerendo che la forza eccentrica protegge sia dalla perdita di performance che dal rischio infortunistico durante la fatica accumulata in gara.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29281917/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio"
                ],
                "injuries": [
                    "hamstring_strain"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_team_cummins_2013",
            "title": "Global positioning systems (GPS) and microtechnology sensors in team sports: a systematic review",
            "authors": "Cummins, C., Orr, R., O'Connor, H., & West, C.",
            "journal": "Sports Medicine",
            "year": 2013,
            "area": "Sport di Squadra",
            "abstract": "Revisione sistematica esaustiva sull'affidabilità, validità e applicazione pratica dei sistemi GPS e dei sensori inerziali (microtecnologia con accelerometri triassiali) nel monitoraggio del carico esterno negli sport di squadra (rugby, calcio, football australiano). Gli autori evidenziano come frequenze di campionamento di 10-15 Hz siano necessarie per quantificare con precisione accelerazioni, decelerazioni e cambi di direzione repentini, identificando le metriche cinematiche chiave per calibrare il carico competitivo, prevenire il sovrallenamento e guidare le fasi di return-to-play.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/23812857/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio",
                    "Basketball"
                ],
                "goals": [
                    "Resistenza",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_team_harper_2019_demands",
            "title": "High-Intensity Acceleration and Deceleration Demands in Elite Team Sports Competitive Match Play: A Systematic Review and Meta-Analysis of Observational Studies",
            "authors": "Harper, D. J., Carling, C., & Kiely, J.",
            "journal": "Sports Medicine",
            "year": 2019,
            "area": "Sport di Squadra",
            "abstract": "Revisione sistematica e meta-analisi pionieristica che quantifica per la prima volta i profili di accelerazione e decelerazione ad alta intensità nelle competizioni di alto livello degli sport di squadra. Lo studio dimostra che i giocatori eseguono una frequenza significativamente maggiore di decelerazioni ad alta intensità (>3 m/s²) rispetto alle accelerazioni, accumulando elevatissime forze di frenata eccentrica che generano stress meccanico muscolo-tendineo acuto e affaticamento neuromuscolare prolungato. L'allenamento deve prevedere carichi eccentrici e compiti di frenata specifica per sviluppare la capacità di assorbimento della forza.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31506901/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio",
                    "Basketball"
                ],
                "goals": [
                    "Power",
                    "Resistenza"
                ]
            }
        },
        {
            "id": "sci_team_hickey_2020",
            "title": "Pain-Free Versus Pain-Threshold Rehabilitation Following Acute Hamstring Strain Injury: A Randomized Controlled Trial",
            "authors": "Hickey, J. T., Timmins, R. G., Maniar, N., Rio, E., Hickey, P. F., Pitcher, C. A., Williams, M. D., & Opar, D. A.",
            "journal": "Journal of Orthopaedic & Sports Physical Therapy",
            "year": 2020,
            "area": "Sport di Squadra",
            "abstract": "Trial clinico randomizzato di grande impatto negli sport di squadra che ha confrontato un protocollo riabilitativo senza dolore (pain-free) con uno basato sulla soglia del dolore (pain-threshold: progressione con dolore consentito fino a 4/10) per le lesioni acute degli ischiocrurali. Il protocollo a soglia di dolore ha consentito un recupero significativamente più rapido della forza isometrica del bicipite femorale e un maggiore allungamento dei fascicoli muscolari alla dimissione, senza allungare i tempi di ritorno al gioco né aumentare il tasso di re-infortunio a 6 mesi, confutando il paradigma che la riabilitazione muscolare debba essere totalmente asintomatica.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/32005093/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "sports": [
                    "Calcio",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Rehab",
                    "Strength"
                ],
                "injuries": [
                    "hamstring_strain",
                    "lesione_muscolare"
                ]
            }
        },
        {
            "id": "sci_team_gabbett_2019",
            "title": "To Couple or not to Couple? For Acute:Chronic Workload Ratios and Injury Risk, Does it Really Matter?",
            "authors": "Gabbett, T. J., Hulin, B. T., & Blanch, P.",
            "journal": "International Journal of Sports Medicine",
            "year": 2019,
            "area": "Sport di Squadra",
            "abstract": "Studio metodologico chiarificatore sul dibattito matematico relativo al calcolo dell'Acute:Chronic Workload Ratio (ACWR). Gli autori confrontano empiricamente i modelli accoppiati (coupled: in cui la settimana acuta fa parte della media cronica delle 4 settimane) e disaccoppiati (uncoupled), dimostrando che entrambi i modelli identificano le medesime relazioni a U tra picchi repentini di carico (ACWR >1.5) e aumento del rischio di infortunio tissutale. Si raccomanda di utilizzare l'ACWR non come strumento diagnostico isolato ma come metrica di supporto decisionale all'interno di un sistema olistico di monitoraggio dell'atleta.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31291651/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio"
                ],
                "goals": [
                    "Resistenza",
                    "Power",
                    "Rehab"
                ]
            }
        },
        {
            "id": "sci_team_hulin_2016",
            "title": "Low chronic workload and the acute:chronic workload ratio are more predictive of injury than between-match recovery time: a two-season prospective cohort study in elite rugby league players",
            "authors": "Hulin, B. T., Gabbett, T. J., Caputi, P., Lawson, D. W., & Sampson, J. A.",
            "journal": "British Journal of Sports Medicine",
            "year": 2016,
            "area": "Sport di Squadra",
            "abstract": "Studio di coorte prospettico biennale su giocatori professionisti di rugby league che analizza la relazione tra carico cronico elevato, ACWR e intervallo di recupero tra match ravvicinati. I risultati evidenziano che atleti con carichi cronici bassi (<1600 m di corsa ad alta velocità) e ACWR elevato (>1.5) presentano una probabilità di infortunio tre volte superiore. Al contrario, un elevato carico cronico aerobico e neuromuscolare agisce come fattore protettivo ('vaccino'), rendendo gli atleti capaci di tollerare match ravvicinati con brevi tempi di recupero senza picchi di infortunio.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26851288/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio"
                ],
                "goals": [
                    "Resistenza",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_team_blanch_2016",
            "title": "Has the athlete trained enough to return to play safely? The acute:chronic workload ratio permits clinicians to quantify a player's risk of subsequent injury",
            "authors": "Blanch, P., & Gabbett, T. J.",
            "journal": "British Journal of Sports Medicine",
            "year": 2016,
            "area": "Sport di Squadra",
            "abstract": "Articolo fondamentale che teorizza la 'sweet spot' dell'Acute:Chronic Workload Ratio (ACWR compreso tra 0.8 e 1.3) applicata in particolare ai protocolli di return-to-play negli sport di squadra. Gli autori dimostrano che la causa primaria di recidiva post-infortunio non è il carico assoluto sostenuto durante la gara, ma il divario eccessivo tra la scarsa preparazione cronica accumulata durante la degenza e le richieste atletiche della competizione. Il passaggio dalla riabilitazione clinica alla gara deve avvenire costruendo gradualmente carichi cronici protettivi prima del rientro agonistico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26701923/",
            "rules": {
                "patientTypes": [
                    "Atleta",
                    "Clinico"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio"
                ],
                "goals": [
                    "Rehab",
                    "Resistenza"
                ]
            }
        },
        {
            "id": "sci_team_hillhaas_2011",
            "title": "Physiology of small-sided games training in football: a systematic review",
            "authors": "Hill-Haas, S. V., Dawson, B., Impellizzeri, F. M., & Coutts, A. J.",
            "journal": "Sports Medicine",
            "year": 2011,
            "area": "Sport di Squadra",
            "abstract": "Revisione sistematica cardine che sintetizza i determinanti fisiologici, tecnici e metodologici dei giochi a ranghi ridotti (Small-Sided Games, SSG) nel calcio. Lo studio quantifica l'impatto delle variabili di regolamento (dimensioni del campo, numero di giocatori da 2v2 a 8v8, limitazioni di tocchi, presenza di portieri e incitamento verbale) sulla frequenza cardiaca, concentrazione ematica di lattato e RPE. Gli SSG in spazi ridotti enfatizzano il carico neuromuscolare e le accelerazioni/decelerazioni, mentre campi più ampi con meno vincoli stimolano la velocità aerobica massima e la ripetizione di sprint ad alta intensità.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21395363/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Calcio",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Resistenza",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_team_bishop_2011",
            "title": "Repeated-sprint ability - part II: recommendations for training",
            "authors": "Bishop, D., Girard, O., & Mendez-Villanueva, A.",
            "journal": "Sports Medicine",
            "year": 2011,
            "area": "Sport di Squadra",
            "abstract": "Seconda parte della rassegna di riferimento mondiale sulla Repeated-Sprint Ability (RSA) negli sport di squadra, dedicata alla prescrizione scientifica dell'allenamento. Gli autori integrano evidenze bioenergetiche e neuromuscolari, proponendo una combinazione triangolare essenziale per massimizzare la RSA: (1) allenamento della velocità massimale e forza esplosiva per elevare la prestazione del singolo sprint; (2) sprint ripetuti specifici (sprint <10s con recuperi <60s) per ottimizzare la fosforilazione ossidativa e l'espressione di proteine tampone del lattato; (3) HIIT aerobico per accelerare la risintesi della fosfocreatina (PCr) e la clearance dei metaboliti.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21846163/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio",
                    "Basketball"
                ],
                "goals": [
                    "Power",
                    "Resistenza"
                ]
            }
        },
        {
            "id": "sci_team_buchheit_2008",
            "title": "The 30-15 intermittent fitness test: accuracy for individualizing interval training of young intermittent sport players",
            "authors": "Buchheit, M.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2008,
            "area": "Sport di Squadra",
            "abstract": "Studio originale che ha introdotto e validato il test intermittente 30-15 (30-15 IFT) per atleti di sport di squadra. Il test consiste in navette di 30 secondi intervallate da 15 secondi di recupero passivo con incremento progressivo di 0.5 km/h. La velocità finale raggiunta (VIFT) riflette in maniera integrata non solo il VO2max e la velocità aerobica massima, ma anche la capacità anaerobica, la riserva di accelerazione, la Repeated-Sprint Ability e la qualità di cambio di direzione, fornendo un parametro di calibrazione dell'HIIT negli sport di squadra nettamente più accurato rispetto al test di Cooper o ai test continui lineari.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/18550949/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio",
                    "Basketball"
                ],
                "goals": [
                    "Resistenza",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_team_bangsbo_2008",
            "title": "The Yo-Yo intermittent recovery test : a useful tool for evaluation of physical performance in intermittent sports",
            "authors": "Bangsbo, J., Iaia, F. M., & Krustrup, P.",
            "journal": "Sports Medicine",
            "year": 2008,
            "area": "Sport di Squadra",
            "abstract": "Rassegna metodologica e fisiologica esaustiva sul test Yo-Yo Intermittent Recovery (Livello 1 e Livello 2) sviluppato per valutare la capacità specifica dell'atleta di recuperare e riprodurre sforzi ad alta intensità negli sport intermittenti. Gli autori dimostrano la sensibilità del test alle variazioni stagionali, al ruolo tattico e al livello competitivo nel calcio d'élite, correlandolo direttamente alla distanza percorsa ad alta velocità durante i match ufficiali. Il test rappresenta uno standard internazionale di screening e monitoraggio della tolleranza alla fatica intermittente.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/18081366/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Calcio",
                    "Sport di Squadra",
                    "Basketball"
                ],
                "goals": [
                    "Resistenza"
                ]
            }
        },
        {
            "id": "sci_team_dupont_2010",
            "title": "Effect of 2 soccer matches in a week on physical performance and injury rate",
            "authors": "Dupont, G., Nedelec, M., McCall, A., McCormack, D., Berthoin, S., & Wisløff, U.",
            "journal": "The American Journal of Sports Medicine",
            "year": 2010,
            "area": "Sport di Squadra",
            "abstract": "Studio epidemiologico e cinematica pionieristico condotto su calciatori professionisti che disputano match della UEFA Champions League e campionati nazionali. Gli autori dimostrano che quando l'intervallo tra due partite consecutive è inferiore a 72-96 ore (2 match in una settimana), l'incidenza di lesioni muscolari e tendinee aumenta di oltre sei volte (25.6 infortuni per 1000 ore di esposizione vs 4.1 infortuni con recupero prolungato), pur mantenendo invariata la distanza percorsa ad alta intensità. Ciò evidenzia come l'atleta riesca a mascherare la fatica neuromuscolare a scapito dell'integrità strutturale, rendendo indispensabili strategie di rotazione della rosa e recupero attivo.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/20400751/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Calcio",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Resistenza",
                    "Rehab"
                ]
            }
        },
        {
            "id": "sci_team_bradley_2009",
            "title": "High-intensity running in English FA Premier League soccer matches",
            "authors": "Bradley, P. S., Sheldon, W., Wooster, B., Olsen, P., Boanas, P., & Krustrup, P.",
            "journal": "Journal of Sports Sciences",
            "year": 2009,
            "area": "Sport di Squadra",
            "abstract": "Studio di riferimento nell'analisi cinematica del calcio moderno basato sul tracciamento multi-camera computerizzato su centinaia di match della Premier League inglese. Vengono quantificate le richieste di corsa ad alta intensità (>19.8 km/h) e di sprint (>25.2 km/h) in relazione al ruolo tattico (centrocampisti esterni e terzini coprono le distanze maggiori a velocità massime). Lo studio evidenzia inoltre una diminuzione temporanea delle corse ad alta intensità nei 5 minuti successivi al periodo di picco del match e un calo sistematico nel secondo tempo, fornendo parametri di riferimento per la periodizzazione della resistenza specifica.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/19153866/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Calcio",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Resistenza",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_team_ronnestad_2011",
            "title": "Effects of in-season strength maintenance training frequency in professional soccer players",
            "authors": "Rønnestad, B. R., Nymark, B. S., & Raastad, T.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2011,
            "area": "Sport di Squadra",
            "abstract": "Studio randomizzato controllato su calciatori professionisti d'élite durante la stagione agonistica (durata 12 settimane) che confronta gli effetti di una sessione settimanale di forza pesante (1RM squat) rispetto a una sessione ogni due settimane. Il gruppo che eseguiva un allenamento di forza pesante ogni 7 giorni ha mantenuto inalterata la forza massimale (1RM), la potenza nei salti (CMJ) e la prestazione nello sprint sui 40m, mentre il gruppo che si allenava ogni 14 giorni ha mostrato un calo significativo della forza muscolare e della potenza esplosiva. Una singola seduta settimanale ad alta intensità e basso volume (microdosing) è il dosaggio minimo efficace per preservare le qualità neuromuscolari in-season.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21873897/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Calcio",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Strength",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_team_aughey_2011",
            "title": "Applications of GPS technologies to field sports",
            "authors": "Aughey, R. J.",
            "journal": "International Journal of Sports Physiology and Performance",
            "year": 2011,
            "area": "Sport di Squadra",
            "abstract": "Rassegna metodologica fondamentale sulle applicazioni e i limiti della tecnologia GPS per l'analisi della prestazione negli sport di campo. L'autore analizza le metriche di velocità di picco, PlayerLoad, distanza percorsa al minuto e densità delle accelerazioni, stabilendo le linee guida per standardizzare l'interpretazione dei dati tra allenamento e competizione. La quantificazione accurata dei picchi di intensità transitori (worst-case scenarios) consente di progettare esercitazioni con carichi fisici specifici che replichino o sovraccarichino le fasi più esigenti del match play.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21911856/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio"
                ],
                "goals": [
                    "Resistenza",
                    "Power"
                ]
            }
        }
    ];

    root.App.Sources.sportSquadra = SPORT_SQUADRA_SOURCES;
    if (typeof window !== 'undefined' && window.App) {
        window.App.Sources = window.App.Sources || {};
        window.App.Sources.sportSquadra = SPORT_SQUADRA_SOURCES;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = root.App.Sources.sportSquadra;
    }
})();
