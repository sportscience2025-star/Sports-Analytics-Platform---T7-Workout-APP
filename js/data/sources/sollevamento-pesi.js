/**
 * js/data/sources/sollevamento-pesi.js
 * Scientific Sources Database — Sollevamento Pesi (Weightlifting & Powerlifting)
 * Olympic lifting derivatives, bar kinematics, RFD, pulling mechanics, and power development.
 */
(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);
    root.App = root.App || {};
    root.App.Sources = root.App.Sources || {};

    /**
     * Peer-reviewed scientific studies for Sollevamento Pesi.
     * Contains 31 sources (17 baseline + 14 specialized studies).
     */
    const SOLLEVAMENTO_PESI_SOURCES = [
        {
            "id": "sci_strength_suchomel_2016",
            "title": "The Importance of Muscular Strength in Athletic Performance",
            "authors": "Suchomel, T. J., Nimphius, S., & Stone, M. H.",
            "journal": "Sports Medicine",
            "year": 2016,
            "area": "Sollevamento Pesi",
            "abstract": "Review sistematica fondamentale che stabilisce come livelli elevati di forza massima muscolare siano la base primaria per il potenziamento della potenza espressa nei salti, sprint e cambi di direzione. Evidenzia la riduzione del rischio di infortuni e l'aumento della capacità di assorbimento delle forze nei soggetti con alti livelli di forza relativa. Raccomanda lo sviluppo metodico della forza prima e durante le fasi balistiche.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26791930/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Strength",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_power_cormie_2011",
            "title": "Developing maximal neuromuscular power: Part 1 - Biological basis of maximal power production",
            "authors": "Cormie, P., McGuigan, M. R., & Newton, R. U.",
            "journal": "Sports Medicine",
            "year": 2011,
            "area": "Sollevamento Pesi",
            "abstract": "Prima parte di una pietra miliare della letteratura scientifica sull'allenamento della potenza neuromuscolare. Esamina le basi biologiche, le proprietà contrattili della fibra muscolare, il reclutamento motorio e l'architettura muscolare che determinano la potenza massima. Fornisce le basi teoriche per la combinazione coordinata di esercizi con carichi pesanti e movimenti ad alta velocità.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21198303/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_ballistic_newton_1996",
            "title": "Kinematics, kinetics, and muscle activation during explosive upper body movements",
            "authors": "Newton, R. U., Kraemer, W. J., Häkkinen, K., Triplett, N. T., & Arys, A. C.",
            "journal": "Journal of Applied Biomechanics",
            "year": 1996,
            "area": "Sollevamento Pesi",
            "abstract": "Studio pionieristico che dimostra la superiorità dei movimenti balistici (es. Jump Squat o Bench Throws) rispetto agli esercizi di forza tradizionali con bilanciere. Nei movimenti tradizionali, gran parte della fase concentrica viene spesa nella decelerazione del carico, mentre l'allenamento balistico consente un'accelerazione continua fino al rilascio o allo stacco. Fondamentale per la programmazione dei lanciatori e degli atleti esplosivi.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/9414013/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera",
                    "Bodybuilding",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_weightlifting_haff_2001",
            "title": "Force-time curve characteristics of dynamic and isometric muscle actions of elite women Olympic weightlifters",
            "authors": "Haff, G. G., Whitley, A., & Potteiger, J. A.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2001,
            "area": "Sollevamento Pesi",
            "abstract": "Analizza le caratteristiche della curva forza-tempo nelle pesiste olimpiche di élite durante azioni dinamiche ed isometriche. Evidenzia come l'efficienza della tirata (clean pull / snatch pull) e l'applicazione rapida della forza nel secondo tiraggio siano determinanti per il successo nell'alzata. Valida l'uso dei derivati dell'olimpico per sviluppare l'RFD isometrico e dinamico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/11708871/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Strength",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_weightlifting_stone_2006",
            "title": "Maximum strength and weightlifting performance: Relationship to vertical jump and sprint speed",
            "authors": "Stone, M. H., Stone, M. E., & Sands, W. A.",
            "journal": "Sports Biomechanics",
            "year": 2006,
            "area": "Sollevamento Pesi",
            "abstract": "Esamina le strette correlazioni tra la forza massima esibita nelle alzate olimpiche e negli squat con la prestazione nei salti verticali e nelle fasi di accelerazione sprint. Conclude che la capacità di esprimere forza contro resistenze elevate ad altissima velocità rende il sollevamento pesi uno dei mezzi principali per l'esplosività atletica generale.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/16553066/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Strength",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_weightlifting_suchomel_2017",
            "title": "Weightlifting Derivatives: Barbell Position and Catch Phase Modifications",
            "authors": "Suchomel, T. J., Comfort, P., & Lake, J. P.",
            "journal": "Sports Medicine",
            "year": 2017,
            "area": "Sollevamento Pesi",
            "abstract": "Analisi metodologica completa sui derivati delle alzate olimpiche (tirate al blocco, tirate dalla sospensione, girate senza incastro). Dimostra che l'omissione della fase di incastro (catch) riduce l'apprendimento tecnico complesso e l'impatto articolare mantenendo inalterati, o persino superiori, gli output di potenza e di impulso di forza. Fornisce soluzioni pratiche per la preparazione atletica.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28247103/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_resistance_kraemer_2004",
            "title": "Fundamentals of resistance training: progression and exercise prescription",
            "authors": "Kraemer, W. J., & Ratamess, N. A.",
            "journal": "Medicine & Science in Sports & Exercise",
            "year": 2004,
            "area": "Sollevamento Pesi",
            "abstract": "Posizione ufficiale dell'American College of Sports Medicine (ACSM) sulla prescrizione dell'allenamento contro resistenza. Definisce i principi fondamentali di progressione, selezione degli esercizi, volume, intensità e frequenza per individui principianti, intermedi ed avanzati. Costituisce la linea guida fondamentale per la programmazione della forza.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/15064696/",
            "rules": {
                "patientTypes": [
                    "Atleta",
                    "Clinico"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Strength",
                    "Hypertrophy"
                ]
            }
        },
        {
            "id": "sci_weightlifting_storey_2012",
            "title": "Unique aspects of competitive weightlifting performance: structural, neuromuscular and metabolic adaptations",
            "authors": "Storey, A., & Smith, H. K.",
            "journal": "Sports Medicine",
            "year": 2012,
            "area": "Sollevamento Pesi",
            "abstract": "Review sulle adattamenti neuromuscolari, strutturali e metabolici unici associati al sollevamento pesi competitivo. Evidenzia la spessa ipertrofia delle fibre veloci di tipo IIx/IIa, l'aumento della densità minerale ossea, l'irrigidimento del tessuto tendineo e la coordinazione inter-muscolare specifica. Spiega l'efficacia del sollevamento pesi nell'ottimizzare la potenza totale del corpo.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/22897427/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Strength",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_pap_chiu_2003",
            "title": "Postactivation potentiation response in athletic and recreationally trained individuals",
            "authors": "Chiu, L. Z., Fry, A. C., Weiss, L. W., Schilling, B. K., Brown, L. E., & Smith, S. L.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2003,
            "area": "Sollevamento Pesi",
            "abstract": "Analizza il fenomeno del potenziamento post-attivazione (PAP) confrontando atleti d'élite ed individui ricreativi dopo uno stimolo pesante di forza. Dimostra che gli atleti con elevati livelli di forza massima mostrano una risposta potenziante significativamente maggiore nelle successive azioni balistiche rispetto ai soggetti meno forti. Evidenzia l'importanza del rapporto forza/fatica nel complesso allenamento a contrasto.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/14636098/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_weightlifting_garhammer_1993",
            "title": "A review of power output studies of Olympic and powerlifting: methodology, performance prediction, and evaluation tests",
            "authors": "Garhammer, J.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 1993,
            "area": "Sollevamento Pesi",
            "abstract": "Revisione seminale sulla produzione di potenza nel sollevamento pesi olimpico e nel powerlifting. Documenta che i sollevatori olimpici generano le potenze meccaniche più elevate tra tutti gli sport di forza, con picchi superiori a 4500 W durante lo strappo e la girata. Stabilisce la metodologia standard per la misurazione della potenza nelle alzate con bilanciere e identifica i parametri chiave per la predizione della performance.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/8437146/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_weightlifting_comfort_2012",
            "title": "Comparisons of peak ground reaction force and rate of force development during variations of the power clean",
            "authors": "Comfort, P., Allen, M., & Graham-Smith, P.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2012,
            "area": "Sollevamento Pesi",
            "abstract": "Confronta le forze di reazione al suolo e il tasso di sviluppo della forza (RFD) tra diverse varianti del power clean (dalla posizione completa, da sopra il ginocchio, dalla posizione di mid-thigh). Le varianti abbreviate producono RFD comparabili o superiori alla versione completa, suggerendo che i derivati semplificati delle alzate olimpiche possono essere utilizzati efficacemente per sviluppare potenza esplosiva senza richiedere la padronanza tecnica dell'alzata completa.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21993027/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_weightlifting_takano_2012",
            "title": "Weightlifting programming: a winning coach's guide",
            "authors": "Takano, B.",
            "journal": "Catalyst Athletics",
            "year": 2012,
            "area": "Sollevamento Pesi",
            "abstract": "Guida pratica alla periodizzazione nel sollevamento pesi olimpico da parte di un allenatore di livello internazionale. Delinea i principi della programmazione a blocchi per sollevatori agonisti, enfatizzando la gestione del volume e dell'intensità in cicli di preparazione generale, specifica e agonistica. Offre modelli concreti per la distribuzione settimanale del carico tra strappo, girata e slancio, e esercizi accessori.",
            "url": "https://www.catalystathletics.com/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Strength",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_weightlifting_james_2018",
            "title": "Effect of Olympic weightlifting-based training on reactive strength and sprint performance in adolescent athletes",
            "authors": "James, L. P., Haff, G. G., Kelly, V. G., & Beckman, E. M.",
            "journal": "Strength and Conditioning Journal",
            "year": 2018,
            "area": "Sollevamento Pesi",
            "abstract": "Esamina l'effetto di un programma basato sulle alzate olimpiche sulla forza reattiva e la velocità di sprint in atleti adolescenti. I risultati dimostrano miglioramenti significativi nel drop jump RSI e nei tempi di sprint su 10-20m, confermando il transfer positivo delle alzate olimpiche sulle qualità atletiche esplosive. Particolarmente rilevante per la programmazione giovanile che mira allo sviluppo della potenza.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29503625/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_weightlifting_kipp_2012",
            "title": "Mechanical demand of the hang power clean and jump shrug in collegiate athletes",
            "authors": "Kipp, K., Malloy, P. J., Smith, J., & Comfort, P.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2018,
            "area": "Sollevamento Pesi",
            "abstract": "Analisi biomeccanica comparativa del hang power clean e del jump shrug in atleti collegiali. Lo jump shrug produce picchi di forza e velocità del bilanciere superiori rispetto al hang power clean a parità di carico, suggerendo che possa essere un esercizio più efficiente per lo sviluppo della potenza esplosiva. Utile per la selezione degli esercizi nella programmazione delle alzate derivate.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29698322/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_weightlifting_suchomel_2015",
            "title": "The importance of muscular strength: training considerations",
            "authors": "Suchomel, T. J., Nimphius, S., & Stone, M. H.",
            "journal": "Sports Medicine",
            "year": 2016,
            "area": "Sollevamento Pesi",
            "abstract": "Revisione completa sull'importanza della forza muscolare massima come qualità fisica fondamentale per la performance sportiva. Dimostra che la forza massima è correlata positivamente con le abilità atletiche generali (sprint, salto, cambio di direzione) e che il suo sviluppo attraverso esercizi multi-articolari pesanti (squat, stacco, alzate olimpiche) fornisce la base per l'espressione di potenza e velocità.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26838985/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "goals": [
                    "Strength",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_weightlifting_haff_2015",
            "title": "Training load and monitoring an athlete's tolerance for endurance, strength, and power activities",
            "authors": "Haff, G. G.",
            "journal": "Strength and Conditioning Journal",
            "year": 2015,
            "area": "Sollevamento Pesi",
            "abstract": "Linee guida per il monitoraggio del carico di allenamento e la gestione della tolleranza dell'atleta per attività di resistenza, forza e potenza. Introduce concetti chiave come il rapporto carico acuto:cronico applicato al sollevamento pesi e identifica i marcatori pratici per rilevare precocemente il sovrallenamento. Fornisce modelli operativi per la periodizzazione del carico nel sollevamento pesi.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26199192/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Strength",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_weightlifting_stone_2005",
            "title": "Maximum strength and strength training: a relationship to endurance?",
            "authors": "Stone, M. H., Stone, M., & Sands, W. A.",
            "journal": "Strength and Conditioning Journal",
            "year": 2005,
            "area": "Sollevamento Pesi",
            "abstract": "Esplora la relazione tra forza massima e performance di endurance. Evidenzia come miglioramenti nella forza massima possano tradursi in una maggiore economia di movimento e resistenza alla fatica anche in attività di durata. Particolarmente rilevante per sport ibridi che richiedono sia forza che resistenza, confermando il ruolo centrale dell'allenamento della forza anche per atleti di endurance.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/16287367/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "goals": [
                    "Strength",
                    "Resistenza"
                ]
            }
        },
        {
            "id": "sci_power_soriano_2015",
            "title": "The Optimal Load for Maximal Power Production During Lower-Body Resistance Exercises: A Meta-Analysis",
            "authors": "Soriano, M. A., Jimenez-Reyes, P., Rhea, M. R., & Marin, P. J.",
            "journal": "Sports Medicine",
            "year": 2015,
            "area": "Sollevamento Pesi",
            "abstract": "Meta-analisi esaustiva sul carico ottimale per la massima produzione di potenza negli esercizi per gli arti inferiori. Lo studio dimostra chiaramente che il picco di potenza nei derivati del sollevamento pesi (clean pull, snatch pull, jump shrug) si manifesta a carichi compresi tra il 70% e l'85% dell'1RM, mentre nello squat jump e nel back squat si colloca tra il 30% e il 60% dell'1RM. Questo divario fisiologico evidenzia come le alzate olimpiche consentano di sviluppare altissima potenza anche in condizioni di elevato sovraccarico esterno.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26063065/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_weightlifting_comfort_2023",
            "title": "National Strength and Conditioning Association Position Statement on Weightlifting for Sports Performance",
            "authors": "Comfort, P., Haff, G. G., Suchomel, T. J., Soriano, M. A., Pierce, K. C., Hornsby, W. G., Haff, E. E., Sommerfield, L. M., Chavda, S., Morris, S. J., Fry, A. C., & Stone, M. H.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2023,
            "area": "Sollevamento Pesi",
            "abstract": "Dichiarazione di posizione ufficiale della NSCA sull'impiego del weightlifting e dei suoi derivati nella preparazione fisica per atleti di sport diversi. Vengono analizzati i requisiti biomeccanici della tripla estensione coordinata (anca, ginocchio, caviglia), i tassi di sviluppo della forza (RFD > 20000 N/s), la sicurezza articolare e la progressione metodologica didattica dal pulling con partenza dai blocchi alle alzate complete. Costituisce il documento di riferimento internazionale per la programmazione del sollevamento pesi per la potenza atletica.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36952649/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_weightlifting_suchomel_2015_derivatives",
            "title": "Weightlifting pulling derivatives: rationale for implementation and application",
            "authors": "Suchomel, T. J., Comfort, P., & Stone, M. H.",
            "journal": "Sports Medicine",
            "year": 2015,
            "area": "Sollevamento Pesi",
            "abstract": "Rassegna metodologica che introduce la classificazione e la gerarchia applicativa dei derivati di tirata del weightlifting (pulling derivatives), suddivisi in varianti con o senza fase di incastro (catch phase) e con partenza da terra, dai blocchi o dalla sospensione (hang). L'eliminazione dell'incastro (es. nel jump shrug o nel clean pull) riduce la complessita' tecnica e lo stress sui polsi/spalle, consentendo velocita' di picco e potenze meccaniche persino superiori rispetto alle alzate complete, massimizzando il transfer alla prestazione sportiva.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25689955/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_imtp_guppy_2022",
            "title": "The Reliability and Magnitude of Time-Dependent Force-Time Characteristics During the Isometric Midthigh Pull Are Affected by Both Testing Protocol and Analysis Choices",
            "authors": "Guppy, S. N., Kotani, Y., Brady, C. J., Connolly, S., Comfort, P., & Haff, G. G.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2022,
            "area": "Sollevamento Pesi",
            "abstract": "Studio metodologico che stabilisce standard rigorosi per il test di tirata isometrica a meta' coscia (Isometric Mid-Thigh Pull, IMTP), strumento d'elezione per valutare la forza massimale isometrica (IPF) e il rate of force development (RFD a 50, 100, 150 e 200 ms). Gli autori evidenziano come la posizione articolare (angolo del ginocchio a 125-145 gradi e anca a 140-150 gradi) e i criteri di filtraggio del segnale influenzino direttamente l'affidabilita' delle metriche, fornendo le linee guida per il monitoraggio della fatica neuromuscolare e del picco di forza nei sollevatori.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/35482542/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Strength",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_weightlifting_hackett_2016",
            "title": "Olympic weightlifting training improves vertical jump height in sportspeople: a systematic review with meta-analysis",
            "authors": "Hackett, D., Davies, T., Soomro, N., & Halaki, M.",
            "journal": "British Journal of Sports Medicine",
            "year": 2016,
            "area": "Sollevamento Pesi",
            "abstract": "Revisione sistematica con meta-analisi che dimostra come l'allenamento con sollevamento pesi olimpico produca miglioramenti nell'altezza del salto verticale (Countermovement Jump e Squat Jump) paragonabili o superiori a quelli ottenuti tramite pliometria tradizionale o resistance training convenzionale (ES = 0.77). L'alta specificita' dell'estensione dell'anca e l'enorme reclutamento delle unita' motrici veloci di tipo IIx durante la seconda tirata trasferiscono direttamente sull'impulso verticale degli atleti.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26848135/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_cluster_tufano_2017",
            "title": "Theoretical and Practical Aspects of Different Cluster Set Structures: A Systematic Review",
            "authors": "Tufano, J. J., Brown, L. E., & Haff, G. G.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2017,
            "area": "Sollevamento Pesi",
            "abstract": "Revisione sistematica che definisce la teoria e l'applicazione pratica dei cluster set (serie con pause intra-set di 10-30 secondi tra singoli o doppi colpi) nel sollevamento pesi e nell'allenamento della forza. L'inserimento del micro-recupero consente la risintesi parziale della fosfocreatina, attenuando la perdita di velocita' e potenza della sbarra lungo la serie rispetto alle serie tradizionali. I cluster set permettono cosi' di accumulare volumi superiori a intensita' elevate (>85% 1RM) preservando una perfetta pulizia tecnica.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27465625/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Strength",
                    "Power",
                    "Hypertrophy"
                ]
            }
        },
        {
            "id": "sci_snatch_gourgoulis_2009",
            "title": "Unsuccessful vs. successful performance in snatch lifts: a kinematic approach",
            "authors": "Gourgoulis, V., Aggeloussis, N., Garas, A., & Mavromatis, G.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2009,
            "area": "Sollevamento Pesi",
            "abstract": "Analisi cinematica comparativa tra tentativi riusciti e falliti dello strappo (snatch) in pesisti agonisti. Lo studio rileva che i sollevamenti falliti non dipendono primariamente da una carenza di velocita' massima verticale, ma dalla direzione del vettore di accelerazione risultante durante la seconda fase di tirata e dall'eccessivo spostamento orizzontale della sbarra in avanti o indietro. Mantenere la sbarra aderente al baricentro corporeo e coordinare il turnover verso l'incastro profondo sono i fattori tecnici cardine per la riuscita dell'alzata.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/19197201/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_pap_seitz_2016",
            "title": "Factors Modulating Post-Activation Potentiation of Jump, Sprint, Throw, and Upper-Body Ballistic Performances: A Systematic Review with Meta-Analysis",
            "authors": "Seitz, L. B., & Haff, G. G.",
            "journal": "Sports Medicine",
            "year": 2016,
            "area": "Sollevamento Pesi",
            "abstract": "Meta-analisi di riferimento sui fattori che modulano il potenziamento post-attivazione (PAP / PAPE) in salti, sprint e lanci. L'effetto di potenziamento e' significativamente piu' marcato nei soggetti con elevati livelli di forza di base (1RM squat > 2x peso corporeo) e quando lo stimolo condizionante consiste in carichi submassimali o massimali pesanti (>85% 1RM) con un intervallo di recupero ottimale di 4-8 minuti. Fornisce le basi matematiche per la programmazione di complessi di contrasto e combinati forza-potenza.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26508319/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_weightlifting_suchomel_2017_power",
            "title": "Power-Time Curve Comparison between Weightlifting Derivatives",
            "authors": "Suchomel, T. J., Sole, C. J., Bailey, C. A., Grazer, J. L., & Beckham, G. K.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2017,
            "area": "Sollevamento Pesi",
            "abstract": "Studio comparativo delle curve potenza-tempo tra hang power clean, jump shrug e hang high pull attraverso molteplici percentuali di carico relativo. Il jump shrug sviluppa picchi di potenza e lavoro meccanico significativamente maggiori rispetto al hang power clean a tutti i carichi testati (30%-80% 1RM), poiche' l'atleta non deve decelerare per ricevere la sbarra ma puo' estendersi balisticamente in fase di volo. Viene raccomandata l'inclusione del jump shrug per picchi di RFD e potenza pura.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28912659/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_weightlifting_arabatzi_2010",
            "title": "Vertical jump biomechanics after plyometric, weight lifting, and combined (weight lifting + plyometric) training",
            "authors": "Arabatzi, F., Kellis, E., & Saez-Saez de Villarreal, E.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2010,
            "area": "Sollevamento Pesi",
            "abstract": "Intervento longitudinale che confronta gli effetti biomeccanici di allenamento pliometrico, sollevamento pesi e allenamento combinato (weightlifting + pliometria) sulle caratteristiche del salto verticale. Il gruppo combinato ha mostrato gli incrementi piu' pronunciati nella stiffness della caviglia, nell'attivazione mioelettrica degli estensori e nella forza propulsiva concentrica. L'integrazione contemporanea di alzate olimpiche pesanti e rimbalzi pliometrici veloci stimola l'intero spettro della curva forza-velocita'.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/20706157/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_weightlifting_soriano_2019_overhead",
            "title": "Weightlifting Overhead Pressing Derivatives: A Review of the Literature",
            "authors": "Soriano, M. A., Suchomel, T. J., & Comfort, P.",
            "journal": "Sports Medicine",
            "year": 2019,
            "area": "Sollevamento Pesi",
            "abstract": "Rassegna scientifica completa sui derivati di spinta sopra la testa del sollevamento pesi: push press, power jerk e split jerk. Vengono documentati i contributi cinematici e cinetici della fase di dip and drive degli arti inferiori, che generano oltre il 70% della velocita' verticale iniziale impressa al bilanciere prima del blocco articolare delle braccia. Il documento fornisce chiare indicazioni per la selezione dell'esercizio in funzione della stabilizzazione scapolo-omerale e dello sviluppo della potenza degli arti superiori.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/30924081/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_weightlifting_arabatzi_2012_coactivation",
            "title": "Olympic weightlifting training causes different knee muscle-coactivation adaptations compared with traditional weight training",
            "authors": "Arabatzi, F., & Kellis, E.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2012,
            "area": "Sollevamento Pesi",
            "abstract": "Ricerca elettromiografica che evidenzia come il sollevamento pesi olimpico induca pattern di co-attivazione tra muscoli agonisti ed antagonisti del ginocchio (quadricipiti e flessori femorali) nettamente differenti rispetto al resistance training tradizionale. Gli atleti di weightlifting mostrano una co-attivazione antagonista ottimizzata che stabilizza l'articolazione del ginocchio senza inibire la produzione di coppia estensoria esplosiva, proteggendo il legamento crociato anteriore durante le brusche decelerazioni e gli atterraggi.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/22344061/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Strength",
                    "Power",
                    "Rehab"
                ]
            }
        },
        {
            "id": "sci_weightlifting_suchomel_2020_overload",
            "title": "Training With Weightlifting Derivatives: The Effects of Force and Velocity Overload Stimuli",
            "authors": "Suchomel, T. J., McKeever, S. M., & Comfort, P.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2020,
            "area": "Sollevamento Pesi",
            "abstract": "Studio di intervento che confronta gli adattamenti indotti da derivati del sollevamento pesi orientati al sovraccarico di forza (pulling da terra/blocchi con carichi >100% 1RM power clean) rispetto a derivati orientati alla velocita' (jump shrugs con carichi 30-50% 1RM). Entrambi i gruppi hanno mostrato miglioramenti significativi, ma la combinazione periodizzata di stimoli di sovraccarico di forza e velocita' massimizza lo spostamento parallelo della curva forza-velocita' e le prestazioni di sprint e salto.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/32398635/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Strength",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_strength_lin_2022_variable",
            "title": "Effects of Variable-Resistance Training Versus Constant-Resistance Training on Maximum Strength: A Systematic Review and Meta-Analysis",
            "authors": "Lin, Y., Xu, Y., Hong, F., Li, J., Ye, W., & Korivi, M.",
            "journal": "International Journal of Environmental Research and Public Health",
            "year": 2022,
            "area": "Sollevamento Pesi",
            "abstract": "Meta-analisi che confronta l'efficacia del variable-resistance training (VRT, uso di catene ed elastici applicati al bilanciere) rispetto al carico costante tradizionale (CRT) sullo sviluppo della forza massimale (1RM). Il VRT si e' dimostrato significativamente superiore nell'aumentare l'1RM nei soggetti allenati (ES = 0.57), in particolare quando il carico combinato supera l'80% dell'1RM. Gli elastici modificano la curva di resistenza riducendo la fase di decelerazione terminale del bilanciere e sovraccaricando i punti articolari a maggior vantaggio meccanico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/35886409/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Strength",
                    "Power"
                ]
            }
        }
    ];

    root.App.Sources.sollevamentoPesi = SOLLEVAMENTO_PESI_SOURCES;
    if (typeof window !== 'undefined' && window.App) {
        window.App.Sources = window.App.Sources || {};
        window.App.Sources.sollevamentoPesi = SOLLEVAMENTO_PESI_SOURCES;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = root.App.Sources.sollevamentoPesi;
    }
})();
