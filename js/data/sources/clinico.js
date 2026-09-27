/**
 * js/data/sources/clinico.js
 * Scientific Sources Database — Clinico (Clinical Exercise & Rehabilitation)
 * Musculoskeletal rehab, return to play, tendon loading, spine stabilization, and pathology management.
 */
(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);
    root.App = root.App || {};
    root.App.Sources = root.App.Sources || {};

    /**
     * Peer-reviewed scientific studies for Clinico.
     * Contains 40 sources (26 baseline + 14 specialized studies).
     */
    const CLINICO_SOURCES = [
        {
            "id": "sci_lca_myer_2006",
            "title": "Targeted neuromuscular training improves performance and neuromuscular biomechanics in female athletes",
            "authors": "Myer, G. D., Ford, K. R., Palumbo, J. P., & Hewett, T. E.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2006,
            "area": "Clinico",
            "abstract": "Il training neuromuscolare mirato riduce significativamente i deficit di asimmetria di carico e il valgismo dinamico del ginocchio nelle atlete. Questo approccio integra esercizi pliometrici, stabilità del core e rinforzo della catena posteriore per prevenire lesioni non da contatto del LCA. Nei percorsi riabilitativi post-operatori, ripristina la meccanica d'atterraggio sicura prima del ritorno allo sport.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/16503678/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "injuries": [
                    "lesione_lca",
                    "post_op_lca",
                    "knee_generic"
                ]
            }
        },
        {
            "id": "sci_lca_grindem_2016",
            "title": "Simple decision rules reduce reinjury risk after anterior cruciate ligament reconstruction: the Delaware-Oslo ACL cohort study",
            "authors": "Grindem, H., Snyder-Mackler, L., Moksnes, H., Engebretsen, L., & Risberg, M. A.",
            "journal": "British Journal of Sports Medicine",
            "year": 2016,
            "area": "Clinico",
            "abstract": "Dimostra che ritardare il ritorno allo sport fino a 9 mesi dopo la ricostruzione del LCA e soddisfare criteri oggettivi di forza e simmetria muscolare (LSI > 90%) riduce il tasso di re-infortunio dell'84%. Ogni mese aggiuntivo di riabilitazione prima del rientro agonistico riduce significativamente il rischio di nuova lesione. L'allenamento deve concentrarsi sul ripristino completo della forza del quadricipite e della potenza esplosiva.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27162233/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "injuries": [
                    "post_op_lca",
                    "lesione_lca"
                ]
            }
        },
        {
            "id": "sci_lca_buckthorpe_2019",
            "title": "Optimising the early-stage rehabilitation process after anterior cruciate ligament reconstruction",
            "authors": "Buckthorpe, M., Della Villa, F., Della Villa, S., & Roi, G. S.",
            "journal": "Sports Medicine",
            "year": 2019,
            "area": "Clinico",
            "abstract": "Fornisce linee guida dettagliate per la fase iniziale di riabilitazione dopo la ricostruzione del LCA, enfatizzando il controllo del versamento, l'estensione completa del ginocchio e l'attivazione precoce del quadricipite. Evita carichi di taglio eccessivi in catena cinetica aperta nei gradi terminali per proteggere il graft. Promuove l'uso di esercizio isometrico e a catena cinetica chiusa per stabilizzare l'articolazione femoro-rotulea.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31168817/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "injuries": [
                    "post_op_lca",
                    "lesione_lca"
                ]
            }
        },
        {
            "id": "sci_lca_hewett_2005",
            "title": "Biomechanical measures of neuromuscular control and valgus loading of the knee predict anterior cruciate ligament injury risk in female athletes",
            "authors": "Hewett, T. E., Myer, G. D., Ford, K. R., et al.",
            "journal": "The American Journal of Sports Medicine",
            "year": 2005,
            "area": "Clinico",
            "abstract": "Studio prospettico pietra miliare che dimostra come il momento di valgo del ginocchio e l'inadeguato controllo neuromuscolare durante i salti predicano direttamente il rischio di lesione del LCA. La correzione dei pattern di movimento errati attraverso il rinforzo dei glutei e degli hamstring è fondamentale per la prevenzione. La riabilitazione deve includere il riaddestramento al biofeedback motorio per eliminare il valgo dinamico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/15722363/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "injuries": [
                    "lesione_lca",
                    "post_op_lca",
                    "knee_generic"
                ]
            }
        },
        {
            "id": "sci_tendon_malliaras_2013",
            "title": "Achilles and patellar tendinopathy loading programmes : a systematic review comparing clinical outcomes and identifying potential mechanisms for effectiveness",
            "authors": "Malliaras, P., Barton, C. J., Reeves, N. D., & Langberg, H.",
            "journal": "Sports Medicine",
            "year": 2013,
            "area": "Clinico",
            "abstract": "Revisione sistematica che confronta i programmi di carico isometrico, eccentrico e pesante lento (HSR - Heavy Slow Resistance) per la tendinopatia Achillea e rotulea. Evidenzia che il carico progressivo adattato al dolore è superiore al semplice riposo o alle terapie passive. L'allenamento pesante e lento stimola il rimodellamento del collagene e migliora la tolleranza al carico del tendine in modo sicuro.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/23625465/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "injuries": [
                    "patellar_tendonitis",
                    "achilles_tendonitis",
                    "tendinopatia"
                ]
            }
        },
        {
            "id": "sci_tendon_cook_2009",
            "title": "Is tendon pathology a continuum? A clinical model to explain the clinical presentation of load-induced tendinopathy",
            "authors": "Cook, J. L., & Purdam, C. R.",
            "journal": "British Journal of Sports Medicine",
            "year": 2009,
            "area": "Clinico",
            "abstract": "Propone il modello del continuum della patologia tendinea (reattiva, disfunzione strutturale, degenerativa) per guidare la gestione clinica dell'allenamento. Nelle fasi reattive, la priorità è ridurre i carichi di compressione e accumulo di energia mediante contrazioni isometriche. Nelle fasi degenerative, è necessario un carico progressivo meccanico a velocità controllata per stimolare l'adattamento del tessuto sano circostante.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/19776044/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "injuries": [
                    "patellar_tendonitis",
                    "achilles_tendonitis",
                    "tendinopatia"
                ]
            }
        },
        {
            "id": "sci_tendon_bohm_2015",
            "title": "Human tendon adaptation to mechanical loading: a systematic review and meta-analysis of physiological determinants in vivo",
            "authors": "Bohm, S., Mersmann, F., & Arampatzis, A.",
            "journal": "Sports Medicine - Open",
            "year": 2015,
            "area": "Clinico",
            "abstract": "Meta-analisi che individua le caratteristiche ottimali del carico per indurre l'adattamento morfo-meccanico del tendine umano. Dimostra che contrazioni ad alta tensione (circa 85% MVIC) con un tempo di deformazione sostenuto (3-4 secondi per rep) stimolano al massimo la rigidità e il modulo di elasticità tendineo. Modelli ad alta frequenza o bassa intensità non producono cambiamenti strutturali significativi.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27747846/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "injuries": [
                    "patellar_tendonitis",
                    "achilles_tendonitis",
                    "tendinopatia"
                ]
            }
        },
        {
            "id": "sci_hamstring_ekstrand_2012",
            "title": "Hamstring muscle strain recurrence and time loss in professional football",
            "authors": "Ekstrand, J., Hägglund, M., & Waldén, M.",
            "journal": "British Journal of Sports Medicine",
            "year": 2012,
            "area": "Clinico",
            "abstract": "Analisi prospettica sugli infortuni ai muscoli posteriori della coscia (hamstring) nel calcio professionistico europeo. Rivela un alto tasso di recidiva legato a una riabilitazione incompleta o al rientro prematuro in campo senza adeguata preparazione eccentrica. Sottolinea l'importanza di protocolli rigidi per il ripristino della forza in allungamento prima del Return to Play.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/22219258/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "injuries": [
                    "hamstring_strain",
                    "lesione_muscolare",
                    "thigh_strain"
                ]
            }
        },
        {
            "id": "sci_hamstring_vandyk_2019",
            "title": "Including the Nordic hamstring exercise in injury prevention programmes halves the rate of hamstring injuries: a systematic review and meta-analysis of 8459 athletes",
            "authors": "van Dyk, N., Behan, F. P., & Whiteley, R.",
            "journal": "British Journal of Sports Medicine",
            "year": 2019,
            "area": "Clinico",
            "abstract": "Dimostra su oltre 8400 atleti che l'inclusione costante dell'esercizio Nordic Hamstring Curl riduce del 51% l'incidenza complessiva delle lesioni agli hamstring. L'esercizio aumenta la lunghezza dei fascicoli muscolari del bicipite femorale e la forza eccentrica a lunghi angoli articolari. Costituisce un pilastro insostituibile sia nei programmi di prevenzione che nelle fasi finali di riabilitazione clinica.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/30819786/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "injuries": [
                    "hamstring_strain",
                    "lesione_muscolare",
                    "thigh_strain"
                ]
            }
        },
        {
            "id": "sci_hamstring_petersen_2011",
            "title": "Preventing hamstring strains in football players: a randomized controlled trial",
            "authors": "Petersen, J., Thorborg, K., Nielsen, M. B., Budtz-Jørgensen, E., & Holmich, P.",
            "journal": "The American Journal of Sports Medicine",
            "year": 2011,
            "area": "Clinico",
            "abstract": "Studio clinico controllato randomizzato in calciatori maschi che dimostra l'efficacia di un programma di allenamento eccentrico di 10 settimane nel prevenire lesioni primarie e recidive degli hamstring. Dimostra una riduzione fino all'85% dei re-infortuni rispetto al gruppo di controllo. Evidenzia l'importanza del carico eccentrico progressivo integrato nella preparazione settimanale.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21803979/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "injuries": [
                    "hamstring_strain",
                    "lesione_muscolare"
                ]
            }
        },
        {
            "id": "sci_hamstring_bourne_2018",
            "title": "Impact of exercise selection on hamstring muscle activation and architectural adaptations: a systematic review",
            "authors": "Bourne, M. N., Timmins, R. G., Opar, D. A., et al.",
            "journal": "Sports Medicine",
            "year": 2018,
            "area": "Clinico",
            "abstract": "Esamina l'impatto di diversi esercizi (Nordic Hamstring, Romanian Deadlift, Hip Extension, Razor Curl) sull'attivazione muscolare e sull'architettura del bicipite femorale. L'esercizio Nordic Hamstring allunga principalmente i fascicoli del capo lungo del bicipite femorale, mentre le estensioni d'anca guidano l'ipertrofia regionale. La combinazione di esercizi basati sul ginocchio e sull'anca garantisce una protezione completa contro le lesioni da sprint.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29450822/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "injuries": [
                    "hamstring_strain",
                    "lesione_muscolare"
                ]
            }
        },
        {
            "id": "sci_shoulder_cools_2007",
            "title": "Rehabilitation of scapular dyskinesis: from the office to the field",
            "authors": "Cools, A. M., Struyf, F., De Mey, K., Danneels, L., & Cambier, D.",
            "journal": "Journal of Sport Rehabilitation",
            "year": 2007,
            "area": "Clinico",
            "abstract": "Presenta un algoritmo progressivo per il trattamento della discinesi scapolare negli atleti sopra-capo (overhead). Risalta la necessità di ripristinare il bilanciamento muscolare tra Trapezio Inferiore/Dentato Anteriore e Trapezio Superiore per evitare la sindrome da conflitto subacromiale. Propone esercizi selettivi a bassa intensità iniziale prima di introdurre gesti atletici ad alta velocità.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/17923728/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "injuries": [
                    "shoulder_impingement",
                    "rotator_cuff",
                    "scapular_dyskinesis",
                    "shoulder_instability"
                ]
            }
        },
        {
            "id": "sci_shoulder_kibler_2010",
            "title": "Current concepts: scapular dyskinesis",
            "authors": "Kibler, W. B., & Sciascia, A.",
            "journal": "British Journal of Sports Medicine",
            "year": 2010,
            "area": "Clinico",
            "abstract": "Analizza il ruolo centrale della scapola come anello di congiunzione nella catena cinetica per il trasferimento di energia dalle gambe al braccio negli atleti lanciatori. La disfunzione scapolare altera la biomeccanica della spalla aumentando lo stress sulla cuffia dei ruotatori e sul labbro glenoideo. La riabilitazione deve integrare l'attivazione del core e degli arti inferiori insieme al rinforzo stabilizzatore della spalla.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/20371559/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "injuries": [
                    "shoulder_impingement",
                    "rotator_cuff",
                    "shoulder_instability"
                ]
            }
        },
        {
            "id": "sci_shoulder_wilk_2009",
            "title": "The shoulder in baseball: rehabilitation principles",
            "authors": "Wilk, K. E., Reinold, M. M., & Dugas, J. R.",
            "journal": "Journal of Orthopaedic & Sports Physical Therapy",
            "year": 2009,
            "area": "Clinico",
            "abstract": "Delinea i principi di riabilitazione ed esercizio per le lesioni della spalla negli atleti lanciatori. Sottolinea l'importanza del ripristino dell'escursione articolare in rotazione interna (GIRD) e del rinforzo dinamico degli eccentrici della cuffia dei ruotatori posteriore. L'allenamento pliometrico specifico per l'arto superiore è essenziale prima del ritorno all'attività agonistica.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/19182317/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "injuries": [
                    "rotator_cuff",
                    "shoulder_instability",
                    "shoulder_impingement"
                ]
            }
        },
        {
            "id": "sci_spine_mcgill_2001",
            "title": "Low back stability: from formal description to issues for performance and rehabilitation",
            "authors": "McGill, S. M.",
            "journal": "Exercise and Sport Sciences Reviews",
            "year": 2001,
            "area": "Clinico",
            "abstract": "Definisce il concetto di stabilità della colonna vertebrale basato sulla co-attivazione isometrica di tutti i muscoli della parete addominale e dorsale (effetto bracing). Sconsiglia vivamente esercizi di flessione o torsione sotto carico (come i classici crunch) che aumentano le forze di taglio sui dischi intervertebrali lombari. Propone i Big Three (Bird-Dog, Side Plank, Curl-up modificato) per creare rigidezza e proteggere il rachide.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/11265986/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "injuries": [
                    "lumbar_pain",
                    "hernia_disk",
                    "spinal_stenosis",
                    "sensitive_back"
                ]
            }
        },
        {
            "id": "sci_spine_cholewicki_1996",
            "title": "Mechanical stability of the in vivo lumbar spine: implications for injury and chronic low back pain",
            "authors": "Cholewicki, J., & McGill, S. M.",
            "journal": "Journal of Biomechanics",
            "year": 1996,
            "area": "Clinico",
            "abstract": "Dimostra che la stabilità meccanica della colonna lombare richiede una coordinazione precisa e una costante contrazione di sottofondo di tutti i muscoli del tronco, piuttosto che la sola forza di singoli muscoli estensori o flessori. Evidenzia che micro-instabilità possono verificarsi a bassi carichi se la sintonizzazione motoria fallisce. Il protocollo riabilitativo deve puntare sulla resistenza muscolare e sul controllo motorio rigido in posizione neutra.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/8827400/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "injuries": [
                    "lumbar_pain",
                    "hernia_disk",
                    "spondylolysis"
                ]
            }
        },
        {
            "id": "sci_spine_hodges_1996",
            "title": "Inefficient muscular stabilization of the lumbar spine associated with low back pain: a motor control evaluation of transversus abdominis",
            "authors": "Hodges, P. W., & Richardson, C. A.",
            "journal": "Spine",
            "year": 1996,
            "area": "Clinico",
            "abstract": "Studio fondamentale che rivela la risposta anticipatoria (feedforward) del trasverso dell'addome prima del movimento degli arti nelle persone sane, e il suo ritardo di attivazione nei pazienti con lombalgia. Evidenzia l'importanza del riaddestramento del controllo motorio profondo prima di passare a carichi globali elevati. La contrazione isolata e controllata riduce l'instabilità segmentale lombare.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/8923631/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "injuries": [
                    "lumbar_pain",
                    "sensitive_back",
                    "hernia_disk"
                ]
            }
        },
        {
            "id": "sci_spine_hides_1996",
            "title": "Multifidus muscle recovery is not automatic after resolution of acute, first-episode low back pain",
            "authors": "Hides, J. A., Richardson, C. A., & Jull, G. A.",
            "journal": "Spine",
            "year": 1996,
            "area": "Clinico",
            "abstract": "Dimostra mediante ecografia che l'atrofia del muscolo multifido dopo un primo episodio di lombalgia acuta non regredisce spontaneamente anche se il dolore scompare. L'assenza di un allenamento specifico di stabilizzazione porta a tassi di recidiva del 84% rispetto al 30% dei soggetti trattati. Rimarca la necessità di riattivare selettivamente i multifidi con esercizi di controllo isometrico in neutro.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/8961451/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "injuries": [
                    "lumbar_pain",
                    "sensitive_back",
                    "hernia_disk"
                ]
            }
        },
        {
            "id": "sci_lca_ardern_2016",
            "title": "2016 Consensus statement on return to sport from the first world congress in sports physical therapy",
            "authors": "Ardern, C. L., Glasgow, P., Schneiders, A., Witvrouw, E., Clarsen, B., Cools, A., & Bizzini, M.",
            "journal": "British Journal of Sports Medicine",
            "year": 2016,
            "area": "Clinico",
            "abstract": "Consensus statement del primo congresso mondiale di fisioterapia sportiva sul return to sport. Stabilisce che la decisione di rientro allo sport deve essere basata su criteri multidimensionali oggettivi (forza, funzionalità, prontezza psicologica) anziché su tempistiche arbitrarie. Introduce un framework decisionale a tre livelli (return to participation, return to sport, return to performance) che guida la progressione riabilitativa.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26888237/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "injuries": [
                    "lesione_lca",
                    "knee_generic"
                ],
                "goals": [
                    "Rehab"
                ]
            }
        },
        {
            "id": "sci_tendon_rio_2015",
            "title": "Isometric exercise induces analgesia and reduces inhibition in patellar tendinopathy",
            "authors": "Rio, E., Kidgell, D., Purdam, C., Gaida, J., Moseley, G. L., Pearce, A. J., & Cook, J.",
            "journal": "British Journal of Sports Medicine",
            "year": 2015,
            "area": "Clinico",
            "abstract": "Studio fondamentale che dimostra come l'esercizio isometrico prolungato (45 secondi a 70% MVC) produca un effetto analgesico immediato e duraturo nella tendinopatia rotulea, riducendo contemporaneamente l'inibizione corticale del quadricipite. Questo protocollo ha rivoluzionato la gestione acuta del dolore tendineo in-season, permettendo agli atleti di allenarsi e competere con dolore ridotto senza farmaci.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25979840/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "injuries": [
                    "tendinopatia_rotulea",
                    "tendon_generic"
                ],
                "goals": [
                    "Rehab"
                ]
            }
        },
        {
            "id": "sci_spine_hicks_2005",
            "title": "Preliminary development of a clinical prediction rule for determining which patients with low back pain will respond to a stabilization exercise program",
            "authors": "Hicks, G. E., Fritz, J. M., Delitto, A., & McGill, S. M.",
            "journal": "Archives of Physical Medicine and Rehabilitation",
            "year": 2005,
            "area": "Clinico",
            "abstract": "Sviluppo di una regola di predizione clinica per identificare i pazienti con lombalgia che risponderanno a un programma di esercizi di stabilizzazione del core. Identifica quattro fattori predittivi: età inferiore a 40 anni, straight leg raise superiore a 91 gradi, movimenti aberranti durante la flessione del tronco e test di instabilità prona positivo. Fornisce un framework basato sull'evidenza per la prescrizione personalizzata degli esercizi di core stability.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/16084801/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "injuries": [
                    "low_back_pain",
                    "spine_generic"
                ],
                "goals": [
                    "Rehab"
                ]
            }
        },
        {
            "id": "sci_ankle_hertel_2002",
            "title": "Functional anatomy, pathomechanics, and pathophysiology of lateral ankle instability",
            "authors": "Hertel, J.",
            "journal": "Journal of Athletic Training",
            "year": 2002,
            "area": "Clinico",
            "abstract": "Revisione completa dell'anatomia funzionale, della patomeccanica e della patofisiologia dell'instabilità laterale della caviglia. Descrive i meccanismi di lesione dei legamenti laterali, le conseguenze propriocettive e neuromuscolari della distorsione, e le basi per la riabilitazione progressiva. Fondamentale per comprendere la programmazione degli esercizi di rinforzo e propriocezione nella prevenzione delle recidive di distorsione della caviglia.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/12937557/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "injuries": [
                    "ankle_sprain",
                    "ankle_instability"
                ],
                "goals": [
                    "Rehab"
                ]
            }
        },
        {
            "id": "sci_shoulder_escamilla_2009",
            "title": "Shoulder muscle recruitment patterns and related biomechanics during upper extremity sports",
            "authors": "Escamilla, R. F., & Andrews, J. R.",
            "journal": "Sports Medicine",
            "year": 2009,
            "area": "Clinico",
            "abstract": "Revisione dettagliata dei pattern di reclutamento muscolare della spalla durante le attività sportive dell'arto superiore (lancio, nuoto, tennis). Analizza l'attivazione EMG della cuffia dei rotatori e dei muscoli scapolari nelle diverse fasi del gesto atletico. Fornisce le basi scientifiche per la progettazione di programmi di prevenzione e riabilitazione delle lesioni della spalla nello sportivo.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/19453205/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "injuries": [
                    "shoulder_impingement",
                    "rotator_cuff"
                ],
                "goals": [
                    "Rehab"
                ]
            }
        },
        {
            "id": "sci_knee_powers_2010",
            "title": "The influence of abnormal hip mechanics on knee injury: a biomechanical perspective",
            "authors": "Powers, C. M.",
            "journal": "Journal of Orthopaedic & Sports Physical Therapy",
            "year": 2010,
            "area": "Clinico",
            "abstract": "Analisi biomeccanica dell'influenza delle anomalie meccaniche dell'anca sulle lesioni del ginocchio. Dimostra come la debolezza dei muscoli abduttori e rotatori esterni dell'anca contribuisca al valgo dinamico del ginocchio, aumentando il rischio di lesione del LCA e di sindrome femoro-rotulea. Fondamentale per la programmazione di esercizi di rinforzo prossimale nella prevenzione delle lesioni al ginocchio.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/20710093/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "injuries": [
                    "lesione_lca",
                    "knee_generic",
                    "patellofemoral"
                ],
                "goals": [
                    "Rehab"
                ]
            }
        },
        {
            "id": "sci_muscle_opar_2012",
            "title": "Hamstring strain injuries: factors that lead to injury and re-injury",
            "authors": "Opar, D. A., Williams, M. D., & Shield, A. J.",
            "journal": "Sports Medicine",
            "year": 2012,
            "area": "Clinico",
            "abstract": "Revisione completa dei fattori di rischio per le lesioni muscolari degli hamstring e le relative recidive. Identifica la debolezza eccentrica, la ridotta lunghezza fascicolare, lo squilibrio di forza bilaterale e la precedente lesione come fattori predittivi principali. Raccomanda protocolli di prevenzione basati sull'allenamento eccentrico pesante (Nordic Hamstring Exercise) e sull'allungamento fascicolare progressivo.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/22356851/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "injuries": [
                    "hamstring_strain",
                    "lesione_muscolare"
                ],
                "goals": [
                    "Rehab"
                ]
            }
        },
        {
            "id": "sci_rehab_blanchard_2000",
            "title": "The effects of cold water immersion on recovery from exercise-induced muscle damage",
            "authors": "Bleakley, C. M., & Davison, G. W.",
            "journal": "British Journal of Sports Medicine",
            "year": 2010,
            "area": "Clinico",
            "abstract": "Metanalisi sull'efficacia dell'immersione in acqua fredda per il recupero dal danno muscolare indotto dall'esercizio. I risultati mostrano una riduzione significativa dell'indolenzimento muscolare post-esercizio (DOMS) a 24-72 ore, con effetti moderati sulla riduzione del marcatore ematico CK. Fornisce linee guida pratiche per l'implementazione della crioterapia nel programma di recupero dell'atleta.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/19945969/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "goals": [
                    "Rehab"
                ]
            }
        },
        {
            "id": "sci_acl_kyritsis_2016",
            "title": "Likelihood of ACL graft rupture: not meeting six clinical discharge criteria before return to sport is associated with a four times greater risk of rupture",
            "authors": "Kyritsis, P., Bahr, R., Landreau, P., Miladi, R., & Witvrouw, E.",
            "journal": "British Journal of Sports Medicine",
            "year": 2016,
            "area": "Clinico",
            "abstract": "Studio clinico prospettico fondamentale che dimostra come il mancato superamento di sei criteri oggettivi di dimissione clinica (forza isocinetica dei quadricipiti con simmetria >90%, quattro test di salto monopodalico con LSI >90%, e completamento di test di agilità sul campo) prima del ritorno allo sport quadruplica il rischio di nuova rottura del trapianto di LCA. Per ogni mese di ritardo nel ritorno allo sport fino a nove mesi dall'intervento, il tasso di re-infortunio si riduce del 51%. La riabilitazione deve abbandonare criteri basati unicamente sul tempo per adottare verifiche funzionali basate su criteri quantitativi.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27215935/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio"
                ],
                "goals": [
                    "Rehab"
                ],
                "injuries": [
                    "lesione_lca",
                    "post_op_lca",
                    "knee_generic"
                ]
            }
        },
        {
            "id": "sci_hamstring_askling_2013",
            "title": "Acute hamstring injuries in Swedish elite football: a prospective randomised controlled clinical trial comparing two rehabilitation protocols",
            "authors": "Askling, C. M., Tengvar, M., & Thorstensson, A.",
            "journal": "British Journal of Sports Medicine",
            "year": 2013,
            "area": "Clinico",
            "abstract": "Trial clinico randomizzato prospettico che confronta due protocolli riabilitativi per lesioni acute dei flessori del ginocchio nel calcio professionistico: il protocollo L (focalizzato sull'allungamento eccentrico e contrazioni a lunghezze muscolari estreme: Extender, Diver, Glider) rispetto al protocollo convenzionale C. Il gruppo del protocollo L ha mostrato un tempo significativamente inferiore per il ritorno al gioco (media 28 giorni vs 51 giorni) senza aumento del tasso di recidiva. Il carico eccentrico a lunghezze elevate è cruciale per la riparazione strutturale e il ripristino dell'angolo di picco di coppia.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/23536466/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "sports": [
                    "Calcio",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Rehab"
                ],
                "injuries": [
                    "hamstring_strain",
                    "lesione_muscolare",
                    "thigh_strain"
                ]
            }
        },
        {
            "id": "sci_hamstring_mendiguchia_2017",
            "title": "A Multifactorial, Criteria-based Progressive Algorithm for Hamstring Injury Treatment",
            "authors": "Mendiguchia, J., Martinez-Ruiz, E., Edouard, P., Morin, J. B., Martinez-Martinez, F., Idoate, F., & Mendez-Villanueva, A.",
            "journal": "Medicine & Science in Sports & Exercise",
            "year": 2017,
            "area": "Clinico",
            "abstract": "Studio prospettico controllato che valida un algoritmo progressivo multifattoriale per la riabilitazione delle lesioni agli ischiocrurali, strutturato su criteri oggettivi e mirato a correggere i deficit specifici: forza eccentrica del bicipite femorale, controllo lombo-pelvico, flessibilità attiva e meccanica di sprint ad alta velocità. Gli atleti riabilitati con questo protocollo hanno mostrato una riduzione statisticamente significativa del tempo di ritorno allo sport e un tasso di recidiva a 6 mesi dimezzato rispetto ai controlli convenzionali.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28277402/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "sports": [
                    "Calcio",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Rehab"
                ],
                "injuries": [
                    "hamstring_strain",
                    "lesione_muscolare"
                ]
            }
        },
        {
            "id": "sci_tendon_kongsgaard_2009",
            "title": "Corticosteroid injections, eccentric decline squat training and heavy slow resistance training in patellar tendinopathy",
            "authors": "Kongsgaard, M., Kovanen, V., Aagaard, P., Doessing, S., Hansen, P., Laursen, A. H., Kaldau, N. C., Longo, U. F., Heinemeier, K. M., & Kjaer, M.",
            "journal": "Scandinavian Journal of Medicine & Science in Sports",
            "year": 2009,
            "area": "Clinico",
            "abstract": "Trial clinico randomizzato di riferimento che ha introdotto il concetto di Heavy Slow Resistance (HSR) nel trattamento della tendinopatia rotulea, confrontandolo con squat eccentrico su piano inclinato e iniezioni di corticosteroidi. A 6 mesi di follow-up, sia l'HSR (3 serie da 6-15 RM al 70-85% 1RM con cadenza 3s concentrica e 3s eccentrica) che l'allenamento eccentrico hanno mostrato miglioramenti clinici superiori e duraturi rispetto ai corticosteroidi. Tuttavia, solo il protocollo HSR ha indotto un significativo aumento della sintesi di collagene e un rimodellamento positivo della matrice tendinea e della vascolarizzazione anomala, risultando maggiormente tollerato dai pazienti.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/19793213/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Basketball",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Rehab",
                    "Strength"
                ],
                "injuries": [
                    "patellar_tendonitis",
                    "tendinopatia_rotulea",
                    "tendon_generic"
                ]
            }
        },
        {
            "id": "sci_tendon_beyer_2015",
            "title": "Heavy Slow Resistance Versus Eccentric Training as Treatment for Achilles Tendinopathy: A Randomized Controlled Trial",
            "authors": "Beyer, R., Kongsgaard, M., Hougs Kjær, B., Øhlenschlæger, T., Kjær, M., & Magnusson, S. P.",
            "journal": "The American Journal of Sports Medicine",
            "year": 2015,
            "area": "Clinico",
            "abstract": "Studio controllato randomizzato che confronta l'allenamento eccentrico tradizionale (protocollo Alfredson: 180 ripetizioni al giorno, 7 giorni su 7) con l'Heavy Slow Resistance (HSR: 3 sedute settimanali con carichi progressivi dal 15RM al 6RM su calf raise seduto e in piedi) in pazienti con tendinopatia achillea cronica inserzionale e della porzione media. Entrambi i gruppi hanno ottenuto miglioramenti sovrapponibili nel punteggio VISA-A a 12 settimane e a 1 anno, ma il gruppo HSR ha riportato una soddisfazione del paziente significativamente superiore (100% vs 80%) e una maggiore aderenza alla terapia grazie al minor volume giornaliero e alla maggiore stimolazione meccanica del tessuto connettivo.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26018970/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "sports": [
                    "Endurance",
                    "Atletica Leggera",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Rehab",
                    "Strength"
                ],
                "injuries": [
                    "achilles_tendonitis",
                    "tendinopatia",
                    "tendon_generic"
                ]
            }
        },
        {
            "id": "sci_shoulder_holmgren_2014",
            "title": "Effect of specific exercise strategy on need for surgery in patients with subacromial impingement syndrome: randomised controlled study",
            "authors": "Holmgren, T., Hallgren, H. B., Öberg, B., Adolfsson, L., & Johansson, K.",
            "journal": "British Journal of Sports Medicine",
            "year": 2014,
            "area": "Clinico",
            "abstract": "Trial clinico randomizzato pragmatico che dimostra come un programma di esercizi mirato al rinforzo eccentrico dei rotatori della cuffia e alla stabilità periscapolare riduca significativamente la necessità di intervento chirurgico di decompressione subacromiale nei pazienti con conflitto subacromiale persistente. L'intervento basato su carichi progressivi ed esercizi mirati al trapezio inferiore e al dentato anteriore ha prodotto miglioramenti clinici marcati e duraturi nel dolore e nella funzione a 1 anno di follow-up rispetto a un programma di controllo aspecifico, evitando la chirurgia nell'80% dei partecipanti.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25213604/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Rehab",
                    "Strength"
                ],
                "injuries": [
                    "shoulder_impingement",
                    "rotator_cuff",
                    "scapular_dyskinesis"
                ]
            }
        },
        {
            "id": "sci_spine_saragiotto_2016",
            "title": "Motor control exercise for chronic non-specific low-back pain",
            "authors": "Saragiotto, B. T., Maher, C. G., Yamato, T. P., Costa, L. O., Menezes Costa, L. C., Ostelo, R. W., & Macedo, L. G.",
            "journal": "Cochrane Database of Systematic Reviews",
            "year": 2016,
            "area": "Clinico",
            "abstract": "Revisione sistematica Cochrane con meta-analisi che valuta l'efficacia degli esercizi di controllo motorio (MCE) nei pazienti con lombalgia cronica non specifica. L'intervento focalizzato sulla riattivazione selettiva dei muscoli stabilizzatori profondi (trasverso dell'addome, multifido lombare e pavimento pelvico) e sulla successiva integrazione funzionale in catene cinetiche complesse produce miglioramenti clinicamente rilevanti del dolore e della disabilità a breve, medio e lungo termine rispetto a terapie passive o cure minime, risultando un pilastro essenziale nella riabilitazione vertebrale.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26742533/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "goals": [
                    "Rehab"
                ],
                "injuries": [
                    "lumbar_pain",
                    "low_back_pain",
                    "hernia_disk",
                    "sensitive_back",
                    "spine_generic"
                ]
            }
        },
        {
            "id": "sci_spine_foster_2018",
            "title": "Prevention and treatment of low back pain: evidence, challenges, and promising directions",
            "authors": "Foster, N. E., Anema, J. R., Cherkin, D., Chou, R., Cohen, S. P., Gross, D. P., Ferreira, P. H., et al.",
            "journal": "The Lancet",
            "year": 2018,
            "area": "Clinico",
            "abstract": "Pubblicazione cardine della serie Lancet sul Low Back Pain che sintetizza le linee guida internazionali basate sull'evidenza. Gli autori condannano l'abuso di riposo a letto, imaging precoce, oppioidi e chirurgia non necessaria, stabilendo che la terapia di prima linea assoluta per la lombalgia cronica deve essere l'esercizio fisico attivo combinato con l'educazione biopsicosociale e il mantenimento delle normali attività quotidiane. I programmi di ricondizionamento progressivo, forza ed endurance del tronco mostrano il più elevato rapporto costo-efficacia e la massima prevenzione delle recidive.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29573872/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "goals": [
                    "Rehab"
                ],
                "injuries": [
                    "lumbar_pain",
                    "low_back_pain",
                    "hernia_disk",
                    "sensitive_back",
                    "spine_generic"
                ]
            }
        },
        {
            "id": "sci_knee_fransen_2015",
            "title": "Exercise for osteoarthritis of the knee: a Cochrane systematic review",
            "authors": "Fransen, M., McConnell, S., Harmer, A. R., Van der Esch, M., Simic, M., & Bennell, K. L.",
            "journal": "British Journal of Sports Medicine",
            "year": 2015,
            "area": "Clinico",
            "abstract": "Sintesi della revisione sistematica Cochrane che include 54 trial clinici randomizzati e oltre 3900 pazienti, confermando con elevata qualità dell'evidenza che l'esercizio terapeutico per il ginocchio (rinforzo muscolare dei quadricipiti, mobilità articolare ed esercizio aerobico a basso impatto) riduce significativamente il dolore e migliora la qualità della vita e la funzionalità articolare nei pazienti con osteoartrite del ginocchio. I benefici analgesici e funzionali dell'esercizio strutturato sono equiparabili a quelli dei FANS ma con un profilo di sicurezza incomparabilmente superiore e assenza di effetti collaterali sistemici.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26405113/",
            "rules": {
                "patientTypes": [
                    "Clinico"
                ],
                "goals": [
                    "Rehab",
                    "Strength"
                ],
                "injuries": [
                    "knee_generic",
                    "patellofemoral"
                ]
            }
        },
        {
            "id": "sci_groin_holmich_1999",
            "title": "Effectiveness of active physical training as treatment for long-standing adductor-related groin pain in athletes: randomised trial",
            "authors": "Hölmich, P., Uhrskou, P., Ulnits, L., Kanstrup, I. L., Bachmann Nielsen, M., Bjerg, A. M., & Krogsgaard, M.",
            "journal": "The Lancet",
            "year": 1999,
            "area": "Clinico",
            "abstract": "Trial clinico randomizzato pionieristico pubblicato su The Lancet che ha rivoluzionato il trattamento della pubalgia e del dolore inguinale cronico correlato agli adduttori negli atleti. Lo studio ha confrontato un programma di allenamento fisico attivo (esercizi isometrici ed eccentrici per gli adduttori, rinforzo degli addominali, stabilità pelvica e coordinazione posturale senza elettroterapia) rispetto alla fisioterapia passiva convenzionale. Il 79% degli atleti nel gruppo di esercizio attivo è tornato con successo allo sport agonistico senza dolore, contro solo il 14% del gruppo di terapia passiva, dimostrando che il carico meccanico mirato è indispensabile per la risoluzione dell'entesopatia adduttoria.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/9989713/",
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
                    "groin_pain",
                    "adductor_tendinopathy",
                    "pubalgia"
                ]
            }
        },
        {
            "id": "sci_ankle_vuurberg_2018",
            "title": "Diagnosis, treatment and prevention of ankle sprains: update of an evidence-based clinical guideline",
            "authors": "Vuurberg, G., Hoorntje, A., Wink, L. M., van der Doelen, B. F. W., van den Bekerom, M. P., Dekker, R., et al.",
            "journal": "British Journal of Sports Medicine",
            "year": 2018,
            "area": "Clinico",
            "abstract": "Linea guida clinica internazionale della Dutch Association of Sports Medicine e approvata dal BJSM sulla gestione delle distorsioni laterali di caviglia e dell'instabilità cronica. Il panel raccomanda fortemente l'avvio precoce di mobilizzazione attiva e carico tollerato supportato da tutore funzionale, sconsigliando l'immobilizzazione rigida prolungata oltre i 10 giorni. L'allenamento neuromuscolare e propriocettivo combinato con esercizi di forza dinamica per i peronieri e la catena cinetica riduce del 40-50% il rischio di distorsioni ricorrenti e instabilità cronica di caviglia negli atleti.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29514819/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Basketball",
                    "Calcio"
                ],
                "goals": [
                    "Rehab"
                ],
                "injuries": [
                    "ankle_sprain",
                    "ankle_instability"
                ]
            }
        },
        {
            "id": "sci_acl_buckthorpe_2020",
            "title": "Optimising the 'Mid-Stage' Training and Testing Process After ACL Reconstruction",
            "authors": "Buckthorpe, M., & Della Villa, F.",
            "journal": "Sports Medicine",
            "year": 2020,
            "area": "Clinico",
            "abstract": "Revisione clinico-metodologica fondamentale sulla fase intermedia (mid-stage) della riabilitazione post-ricostruzione del legamento crociato anteriore. Gli autori identificano come priorità assoluta il recupero completo dell'ipertrofia e della forza massimale del quadricipite (con enfasi su carichi pesanti in catena cinetica aperta e chiusa tra 90° e 45°), la re-atletizzazione delle capacità di frenata e decelerazione eccentrica, e lo sviluppo della stiffness tendinea. Vengono stabiliti criteri oggettivi di progressione basati su forza isometrica, dinamometria e simmetria cinematica prima di passare alla fase sul campo.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31782065/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "sports": [
                    "Calcio",
                    "Sport di Squadra",
                    "Basketball"
                ],
                "goals": [
                    "Rehab",
                    "Strength",
                    "Power"
                ],
                "injuries": [
                    "lesione_lca",
                    "post_op_lca",
                    "knee_generic"
                ]
            }
        },
        {
            "id": "sci_tendon_malliaras_2015",
            "title": "Patellar Tendinopathy: Clinical Diagnosis, Load Management, and Advice for Challenging Case Presentations",
            "authors": "Malliaras, P., Cook, J., Purdam, C., & Rio, E.",
            "journal": "Journal of Orthopaedic & Sports Physical Therapy",
            "year": 2015,
            "area": "Clinico",
            "abstract": "Guida clinica di riferimento per la gestione e la progressione di carico nella tendinopatia rotulea nell'atleta. Si articola una progressione in quattro fasi basata sull'irritabilità tissutale: (1) contrazioni isometriche prolungate pesanti (45 secondi al 70% MVC) per indurre analgesia immediata e abbassare l'inibizione corticale; (2) carico isotonico lento pesante (HSR) concentrico-eccentrico per stimolare l'adattamento della matrice; (3) accumulo di energia elastica e ciclo allungamento-accorciamento (salti progressivi); (4) ritorno specifico allo sport con carichi pliometrici ad alta intensità e monitoraggio del dolore nelle 24 ore successive.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26390269/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "sports": [
                    "Basketball",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Rehab",
                    "Power"
                ],
                "injuries": [
                    "patellar_tendonitis",
                    "tendinopatia_rotulea",
                    "tendon_generic"
                ]
            }
        },
        {
            "id": "sci_tendon_silbernagel_2011",
            "title": "The majority of patients with Achilles tendinopathy recover fully when treated with exercise alone: a 5-year follow-up",
            "authors": "Silbernagel, K. G., Brorsson, A., & Lundberg, M.",
            "journal": "The American Journal of Sports Medicine",
            "year": 2011,
            "area": "Clinico",
            "abstract": "Studio clinico prospettico longitudinale con follow-up a 5 anni che dimostra l'eccellente prognosi a lungo termine della tendinopatia achillea trattata con un modello di progressione dell'esercizio basato sul monitoraggio del dolore (pain-monitoring model: dolore tollerabile fino a 5/10 durante o dopo l'esercizio che regredisce entro la mattina seguente). Il 94% dei pazienti ha mantenuto il recupero clinico e funzionale completo senza ricorrere a chirurgia o terapie invasive, confermando che il continuo stimolo meccanico controllato preserva la capacità di carico del tendine e previene le ricadute nel tempo.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21084657/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "sports": [
                    "Endurance",
                    "Atletica Leggera",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Rehab"
                ],
                "injuries": [
                    "achilles_tendonitis",
                    "tendinopatia",
                    "tendon_generic"
                ]
            }
        }
    ];

    root.App.Sources.clinico = CLINICO_SOURCES;
    if (typeof window !== 'undefined' && window.App) {
        window.App.Sources = window.App.Sources || {};
        window.App.Sources.clinico = CLINICO_SOURCES;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = root.App.Sources.clinico;
    }
})();
