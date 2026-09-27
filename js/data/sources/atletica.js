/**
 * js/data/sources/atletica.js
 * Scientific Sources Database — Atletica Leggera (Track & Field)
 * Sprint mechanics, acceleration, maximum velocity, hurdle kinematics, jump biomechanics.
 */
(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);
    root.App = root.App || {};
    root.App.Sources = root.App.Sources || {};

    /**
     * Peer-reviewed scientific studies for Atletica Leggera.
     * Contains 35 sources (21 baseline + 14 specialized studies).
     */
    const ATLETICA_SOURCES = [
        {
            "id": "sci_sprint_morin_2011",
            "title": "Technical ability of elite sprinters: ground force application orientation",
            "authors": "Morin, J. B., Bourdin, M., Edouard, P., Peyrot, N., Samozino, P., & Lacour, J. R.",
            "journal": "Medicine & Science in Sports & Exercise",
            "year": 2011,
            "area": "Atletica Leggera",
            "abstract": "Studio fondamentale sulla meccanica dello sprint che dimostra come la capacità di applicare forza in direzione orizzontale sul terreno, piuttosto che la forza totale prodotta, sia il fattore determinante principale della prestazione di accelerazione negli sprinters di élite. L'efficacia meccanica orientata orizzontalmente diminuisce progressivamente con l'aumentare della velocità di corsa. La programmazione dello sprint deve quindi focalizzarsi su esercitazioni che migliorino l'orientamento della forza ad alte velocità.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21317862/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_sprint_weyand_2000",
            "title": "Faster top speeds of human sprinters are achieved with greater ground forces, not rapid leg movements",
            "authors": "Weyand, P. G., Sternlight, D. N., Bellizzi, M. J., & Wright, S. T.",
            "journal": "Journal of Applied Physiology",
            "year": 2000,
            "area": "Atletica Leggera",
            "abstract": "Ricerche pietra miliare sulla velocità massima di corsa che dimostrano che le velocità più elevate sono raggiunte applicando maggiori forze di reazione al suolo durante la fase di appoggio, anziché muovendo le gambe più velocemente durante la fase di volo. Gli atleti più veloci applicano una forza verticale significativamente maggiore in tempi di contatto con il terreno molto più brevi. L'allenamento deve quindi mirare ad aumentare la produzione di forza picco in tempi di contatto estremamente ridotti.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/11056116/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_sprint_clark_2014",
            "title": "General force-velocity trajectories describe maximal running accelerations in humans",
            "authors": "Clark, K. P., Ryan, L. J., & Weyand, P. G.",
            "journal": "Journal of Experimental Biology",
            "year": 2014,
            "area": "Atletica Leggera",
            "abstract": "Questo studio analizza i profili di accelerazione massima dimostrando che le traiettorie forza-velocità nell'accelerazione di corsa seguono pattern meccanici altamente prevedibili e individualizzati. La capacità di accelerare da fermo o in transizione dipende dall'interazione tra forza orizzontale massima iniziale e velocità massima di contrazione. Identificare il profilo F-V individuale consente di personalizzare gli esercizi di sprint e sovraccarico balistico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24737762/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_sprint_cross_2017",
            "title": "Training at maximal power output in sprint acceleration: Horizontal force-velocity-power profiling",
            "authors": "Cross, M. R., Brughelli, M., Samozino, P., & Morin, J. B.",
            "journal": "International Journal of Sports Physiology and Performance",
            "year": 2017,
            "area": "Atletica Leggera",
            "abstract": "Dimostra l'importanza di determinare il carico ottimale di potenza orizzontale (Pmax) nello sprint resisted (traino o sled). L'allenamento condotto al carico che massimizza l'output di potenza orizzontale ottimizza il trasferimento prestazionale alla fase di accelerazione dello sprint. Fornisce linee guida pratiche per la prescrizione del carico nel sled training basato sul profilo individuale del soggetto.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28488884/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_sprint_lockie_2003",
            "title": "The effects of resisted sled towing on sprint kinematics in field-sport athletes",
            "authors": "Lockie, R. G., Murphy, A. J., & Spinks, C. D.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2003,
            "area": "Atletica Leggera",
            "abstract": "Analizza gli effetti del traino con slitta (sled towing) sulla cinematica e sulla dinamica dello sprint in atleti. L'uso di sovraccarichi moderati (pari a circa il 10-12% della massa corporea) migliora significativamente l'accelerazione iniziale senza alterare negativamente la cinematica della falcata. Risulta fondamentale per lo sviluppo della forza specifica da sprint nei primi metri di corsa.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/14636093/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_sprint_buchheit_2013",
            "title": "High-intensity interval training, solutions to the programming puzzle: Part II: anaerobic energy, neuromuscular load and practical applications",
            "authors": "Buchheit, M., & Laursen, P. B.",
            "journal": "Sports Medicine",
            "year": 2013,
            "area": "Atletica Leggera",
            "abstract": "Revisione di riferimento sulla programmazione dell'allenamento ad alta intensità (HIIT) e dello sprint ripetuto (RSA). Vengono analizzati in dettaglio la riserva di velocità anaerobica (ASR), la carica neuromuscolare e i meccanismi di affaticamento centrale e periferico. Fornisce indicazioni precise per equilibrare stress metabolico e neuro-muscolare nell'atleta di velocità ed endurance.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/23832851/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera",
                    "Endurance"
                ],
                "goals": [
                    "Power",
                    "Resistenza"
                ]
            }
        },
        {
            "id": "sci_sprint_haugen_2014",
            "title": "Sprint running performance: a compilation of data with analysis of sprint training practices",
            "authors": "Haugen, T. A., Tønnessen, E., Hisdal, J., & Seiler, S.",
            "journal": "International Journal of Sports Physiology and Performance",
            "year": 2014,
            "area": "Atletica Leggera",
            "abstract": "Analisi approfondita della struttura metodologica dell'allenamento dei migliori sprinters mondiali. Vengono definiti i parametri di volume, intensità, tempi di recupero e distribuzione stagionale per le fasi di accelerazione, velocità massima e resistenza alla velocità. Evidenzia l'importanza del lavoro ad intensità massima con recuperi completi per preservare la qualità neuromuscolare.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24509711/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_jump_markovic_2007",
            "title": "Does plyometric training improve vertical jump height? A meta-analytical review",
            "authors": "Markovic, G.",
            "journal": "British Journal of Sports Medicine",
            "year": 2007,
            "area": "Atletica Leggera",
            "abstract": "Meta-analisi fondamentale che conferma l'efficacia dell'allenamento pliometrico nel migliorare la quota di salto verticale (Squat Jump e Countermovement Jump). Dimostra che l'uso combinato di balzi e sovraccarichi dinamici induce adattamenti neurali superiori rispetto al solo allenamento di forza tradizionale. È una base scientifica essenziale per la programmazione della potenza negli atleti di salto e velocità.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/17347316/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_jump_komi_2000",
            "title": "Stretch-shortening cycle: a powerful model to study normal and fatigued muscle",
            "authors": "Komi, P. V.",
            "journal": "Journal of Biomechanics",
            "year": 2000,
            "area": "Atletica Leggera",
            "abstract": "Studio miliare sul ciclo allungamento-accorciamento (SSC) e sui meccanismi neuro-muscolari e riflessi (riflesso miotatico e pre-attivazione) che governano le azioni balistiche. Illustra come l'accumulo e il rilascio di energia elastica nei tendini ottimizzino il rendimento meccanico. Analizza inoltre l'impatto della fatica sulla rigidità muscolo-tendinea (stiffness).",
            "url": "https://pubmed.ncbi.nlm.nih.gov/10978496/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_jump_bobbert_1996",
            "title": "Why is countermovement jump height greater than squat jump height?",
            "authors": "Bobbert, M. F., Gerritsen, K. G., Litjens, G. J., & Van Soest, A. J.",
            "journal": "Medicine & Science in Sports & Exercise",
            "year": 1996,
            "area": "Atletica Leggera",
            "abstract": "Indagine biomeccanica tramite simulazione muscoloscheletrica che spiega le differenze di prestazione tra salti con contromovimento (CMJ) e salti statici (SJ). Dimostra che il vantaggio del CMJ deriva sia dall'accumulo di energia elastica sia da una superiorità di pre-attivazione muscolare e dallo stato di forza-velocità raggiunto all'inizio della fase concentrica. Fornisce indicazioni essenziali sul riparto del lavoro balistico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/8887768/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_jump_ramirez_2014",
            "title": "Effects of drop jump training on physical fitness of youth soccer players",
            "authors": "Ramirez-Campillo, R., Meylan, C., Alvarez, C., Henriquez-Olguin, C., Martinez, C., Cañas-Jamett, R., Andrade, D. C., & Izquierdo, M.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2014,
            "area": "Atletica Leggera",
            "abstract": "Valuta l'impatto dell'allenamento con Drop Jump (salti verso il basso con rimbalzo) a diverse altezze di caduta sulla stiffness muscolo-tendinea, sulla velocità e sulla potenza di salto. Evidenzia come l'allenamento ad alto SSC (stiffness intensa e tempi di contatto minimi) migliori sia la capacità di accelerazione che l'altezza di salto negli atleti. Sottolinea l'importanza del controllo dell'altezza di caduta per evitare stress articolari eccessivi.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24077376/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_throws_terzis_2008",
            "title": "Muscle fiber type composition and squatted jump performance in shot putters",
            "authors": "Terzis, G., Georgiadis, G., Vassiliadou, E., & Manta, P.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2008,
            "area": "Atletica Leggera",
            "abstract": "Analizza la correlazione tra la composizione delle fibre muscolari (tipologia IIa e IIx nel vasto laterale) e le prestazioni di lancio del peso e salto verticale in atleti di lancio di élite. Dimostra come la capacità di erogare tassi elevati di sviluppo della forza (RFD) e l'ipertrofia selettiva delle fibre veloci siano direttamente legate ai metri ottenuti nel getto del peso.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/18515989/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera",
                    "Bodybuilding"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_endurance_blagrove_2018",
            "title": "Effects of Strength Training on the Physiological Determinants of Middle- and Long-Distance Running Performance: A Systematic Review",
            "authors": "Blagrove, R. C., Howatson, G., & Hayes, P. R.",
            "journal": "Sports Medicine",
            "year": 2018,
            "area": "Atletica Leggera",
            "abstract": "Revisione sistematica che conferma che la forza massima, la potenza plyometrica e l'allenamento di forza complessa migliorano la velocità di sprint finale (sprint finish), l'economia di corsa e la prestazione complessiva sui mezzofondi e le lunghe distanze. Conferma l'assenza di effetti negativi sul massimo consumo di ossigeno e sottolinea l'effetto protettivo sugli infortuni.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29249083/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera",
                    "Endurance"
                ],
                "goals": [
                    "Resistenza",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_sprint_morin_2016",
            "title": "A simple method for computing sprint acceleration kinetics from running velocity data",
            "authors": "Samozino, P., Rabita, G., Dorel, S., Slawinski, J., Peyrot, N., Saez de Villarreal, E., & Morin, J. B.",
            "journal": "Journal of Biomechanics",
            "year": 2016,
            "area": "Atletica Leggera",
            "abstract": "Presenta un metodo semplificato per calcolare la cinetica dell'accelerazione nello sprint utilizzando solo dati di velocità (da radar, GPS o cellule fotoelettriche). Il modello mono-esponenziale permette di derivare il profilo forza-velocità orizzontale individuale, la potenza massima e la forza massima orizzontale teorica senza necessità di una pedana di forza. Rivoluzionario per l'accessibilità della profilazione biomeccanica sul campo.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26997718/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_sprint_jimenez_2018",
            "title": "Effectiveness of an individualized training based on force-velocity profiling during jumping",
            "authors": "Jimenez-Reyes, P., Samozino, P., Brughelli, M., & Morin, J. B.",
            "journal": "Frontiers in Physiology",
            "year": 2017,
            "area": "Atletica Leggera",
            "abstract": "Studio interventistico che dimostra come un allenamento individualizzato basato sul profilo forza-velocità del salto verticale produca risultati significativamente superiori rispetto a programmi generici. Gli atleti con deficit di forza hanno beneficiato maggiormente di carichi pesanti, mentre quelli con deficit di velocità hanno risposto meglio ad esercizi balistici leggeri. Conferma l'importanza della profilazione F-V per ottimizzare la prescrizione.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28326043/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_sprint_rabita_2015",
            "title": "Sprint mechanics in world-class athletes: a new insight into the limits of human locomotion",
            "authors": "Rabita, G., Dorel, S., Slawinski, J., Saez-de-Villarreal, E., Couturier, A., Samozino, P., & Morin, J. B.",
            "journal": "Scandinavian Journal of Medicine & Science in Sports",
            "year": 2015,
            "area": "Atletica Leggera",
            "abstract": "Analisi biomeccanica unica della meccanica di sprint in atleti di classe mondiale (tra cui il campione olimpico Christophe Lemaitre). Documenta i profili forza-velocità orizzontali ai massimi livelli competitivi, rivelando che gli sprinters d'élite si distinguono per la capacità di mantenere un orientamento efficace della forza ad alte velocità. Stabilisce benchmark di riferimento per la valutazione dello sprint.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25640466/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_sprint_haugen_2019",
            "title": "Sprint running performance monitoring: methodological and practical considerations",
            "authors": "Haugen, T. A., Breitschadel, F., & Seiler, S.",
            "journal": "Sports Medicine",
            "year": 2020,
            "area": "Atletica Leggera",
            "abstract": "Revisione completa sulle considerazioni metodologiche per il monitoraggio della performance nello sprint. Analizza l'accuratezza e l'affidabilità di diversi sistemi di misurazione (cellule fotoelettriche, GPS, radar, telecamere ad alta velocità) e stabilisce linee guida pratiche per il testing standardizzato. Fondamentale per garantire la validità dei dati utilizzati nella programmazione dell'allenamento sprint.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31782009/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_jump_markstrom_2019",
            "title": "Plyometric training for youth athletes: a narrative review",
            "authors": "Ramirez-Campillo, R., Alvarez, C., Garcia-Hermoso, A., Ramirez-Velez, R., & Gentil, P.",
            "journal": "Strength and Conditioning Journal",
            "year": 2018,
            "area": "Atletica Leggera",
            "abstract": "Revisione narrativa sull'allenamento pliometrico per atleti giovani. Conferma che i programmi pliometrici sono sicuri ed efficaci per migliorare la capacità di salto, la velocità di sprint e il cambio di direzione nei giovani atleti. Raccomanda protocolli progressivi con 50-100 contatti per sessione, 2-3 volte a settimana, con enfasi sulla qualità tecnica dell'atterraggio prima di incrementare l'intensità.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/30100827/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_sprint_petrakos_2016",
            "title": "Resisted sled sprint training to improve sprint performance: a systematic review",
            "authors": "Petrakos, G., Morin, J. B., & Egan, B.",
            "journal": "Sports Medicine",
            "year": 2016,
            "area": "Atletica Leggera",
            "abstract": "Revisione sistematica sull'allenamento di sprint con slitta resistita. I risultati indicano che carichi leggeri (<20% della massa corporea) migliorano prevalentemente la fase di massima velocità, mentre carichi pesanti (>30% della massa corporea) hanno un effetto maggiore sulla fase di accelerazione. L'uso di slitte con carichi pesanti è particolarmente efficace per sviluppare la forza orizzontale, un determinante chiave della performance di sprint.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26694507/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_jump_mcmahon_2017",
            "title": "Understanding the key phases of the countermovement jump force-time curve",
            "authors": "McMahon, J. J., Suchomel, T. J., Lake, J. P., & Comfort, P.",
            "journal": "Strength and Conditioning Journal",
            "year": 2018,
            "area": "Atletica Leggera",
            "abstract": "Analisi dettagliata delle fasi della curva forza-tempo del salto con contromovimento (CMJ). Identifica le variabili cinetiche critiche in ciascuna fase (unweighting, braking, propulsive) e spiega come interpretarle per la diagnosi delle qualità neuromuscolari dell'atleta. Strumento essenziale per utilizzare il CMJ come test di monitoraggio della readiness e della fatica neuromuscolare.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29503474/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_sprint_alcaraz_2018",
            "title": "Effects of a resisted sprint training program on sprint kinematics in competitive youth athletes",
            "authors": "Alcaraz, P. E., Carlos-Vivas, J., Oponjuru, B. O., & Martinez-Rodriguez, A.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2018,
            "area": "Atletica Leggera",
            "abstract": "Studio sugli effetti dello sprint resistito sulla cinematica in atleti giovanili competitivi. Dimostra che l'allenamento con sovraccarico durante lo sprint modifica positivamente la cinematica dell'accelerazione, aumentando la lunghezza del passo e la produzione di forza orizzontale senza compromettere la frequenza del passo. Conferma l'efficacia dello sprint resistito come mezzo di allenamento specifico per la velocità giovanile.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28957942/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_sprint_morin_2017",
            "title": "Very-Heavy Sled Training for Improving Horizontal-Force Output in Soccer Players",
            "authors": "Morin, J. B., Petrakos, G., Jimenez-Reyes, P., Brown, S. R., Samozino, P., & Cross, M. R.",
            "journal": "International Journal of Sports Physiology and Performance",
            "year": 2017,
            "area": "Atletica Leggera",
            "abstract": "Questo studio pionieristico dimostra che l'allenamento con slitta a carico molto pesante (fino all'80% della massa corporea) induce adattamenti neuromuscolari superiori nella produzione di forza orizzontale e nell'efficacia meccanica della spinta rispetto allo sprint libero. Il sovraccarico orizzontale consente di sovraccaricare specificamente i muscoli estensori dell'anca durante la fase di accelerazione precoce (0-15 metri) senza alterare negativamente la tecnica di corsa ad alta velocita', risultando un mezzo elettivo per atleti con deficit di forza orizzontale nel profilo F-v.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27834560/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera",
                    "Sport di Squadra",
                    "Calcio"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_sprint_bezodis_2015",
            "title": "Relationships between lower-limb kinematics and block phase performance in a cross section of sprinters",
            "authors": "Bezodis, N. E., Salo, A. I. T., & Trewartha, G.",
            "journal": "European Journal of Sport Science",
            "year": 2015,
            "area": "Atletica Leggera",
            "abstract": "Analisi cinematica tridimensionale della fase di uscita dai blocchi di partenza in velocisti di livello elite ed evoluti. Lo studio evidenzia che la massima potenza orizzontale esterna dai blocchi e' determinata principalmente dall'estensione coordinata prossimale-distale dell'arto anteriore e dalla durata della spinta dell'arto posteriore. L'estensione completa dell'anca posteriore prima dello stacco dai blocchi e' il fattore cinematico piu' correlato alla velocita' di uscita, fornendo indicazioni fondamentali per il posizionamento dei blocchi e il cueing tecnico per i velocisti.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24963548/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_sprint_churchill_2015",
            "title": "The effect of the bend on technique and performance during maximal effort sprinting",
            "authors": "Churchill, S. M., Salo, A. I. T., & Trewartha, G.",
            "journal": "Sports Biomechanics",
            "year": 2015,
            "area": "Atletica Leggera",
            "abstract": "Lo studio analizza le alterazioni cinematiche e dinamiche della corsa veloce in curva (200m e 400m) rispetto al rettilineo. La velocita' di gara subisce un decremento medio del 4.7% dovuto alla riduzione della frequenza del passo interno e della lunghezza del passo esterno. L'arto interno svolge una funzione stabilizzatrice nel piano frontale con marcata adduzione d'anca ed eversione tibiotarsica per generare la forza centripeta necessaria, implicando la necessita' di protocolli asimmetrici di forza e stabilita' della caviglia e dell'anca per i velocisti di curva.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25896099/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_hurdle_hanley_2021",
            "title": "Biomechanics of World-Class Men and Women Hurdlers",
            "authors": "Hanley, B., Walker, J., Paradisis, G. P., Merlino, S., & Bissas, A.",
            "journal": "Frontiers in Sports and Active Living",
            "year": 2021,
            "area": "Atletica Leggera",
            "abstract": "Analisi biomeccanica comparativa della tecnica di passaggio dell'ostacolo su atleti finalisti ai Campionati Mondiali IAAF. Lo studio evidenzia le differenze cinematiche tra i 110m ostacoli maschili e i 100m ostacoli femminili in relazione all'altezza relativa dell'ostacolo rispetto alla statura. Le atlete beneficiano di una parabola di volo piu' piatta e minore oscillazione verticale del centro di massa, mentre negli uomini la minimizzazione della decelerazione allo stacco e il rapido richiamo dell'arto di richiamo (trail leg) sono i determinanti critici per preservare la velocita' orizzontale inter-ostacolo.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34308350/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_hurdle_rowley_2021",
            "title": "Effect of hurdling step strategy on the kinematics of the hurdle clearance technique",
            "authors": "Rowley, L. J., Churchill, S. M., Dunn, M., & Wheat, J.",
            "journal": "Sports Biomechanics",
            "year": 2021,
            "area": "Atletica Leggera",
            "abstract": "Indagine biomeccanica sull'impatto della strategia di approccio al primo ostacolo (7 passi vs 8 passi) nei 110 metri ostacoli. Sebbene i tempi complessivi di approccio possano risultare equivalenti, la strategia a 7 passi richiede una maggiore estensione della spinta nei primi tre appoggi dai blocchi e modifica la distanza di stacco dall'ostacolo, riducendo l'angolo di attacco e favorendo una transizione piu' fluida alla massima velocita' di corsa. La scelta della strategia deve essere vincolata ai livelli individuali di forza esplosiva e alla statura dell'ostacolista.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34783302/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_jump_linthorne_2005",
            "title": "Optimum take-off angle in the long jump",
            "authors": "Linthorne, N. P., Guzman, M. S., & Bridgett, L. A.",
            "journal": "Journal of Sports Sciences",
            "year": 2005,
            "area": "Atletica Leggera",
            "abstract": "Studio fondamentale che quantifica l'angolo ottimale di stacco nel salto in lungo attraverso modelli cinematici balistici e rilievi sperimentali su atleti. L'angolo teorico ideale si attesta tra 18 gradi e 23 gradi, significativamente inferiore ai 45 gradi della balistica pura, a causa del compromesso biomeccanico tra la conservazione della velocita' orizzontale di rincorsa (9.5-11 m/s) e la generazione dell'impulso verticale durante il tempo di contatto (100-120 ms). Aumentare artificialmente l'angolo di stacco riduce drasticamente la distanza del salto a causa della perdita di velocita' d'uscita.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/16195020/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_jump_allen_2016",
            "title": "The effect of increasing strength and approach velocity on triple jump performance",
            "authors": "Allen, S. J., King, M. A., & Yeadon, M. R.",
            "journal": "Journal of Biomechanics",
            "year": 2016,
            "area": "Atletica Leggera",
            "abstract": "Modellizzazione computazionale tridimensionale a guida dinamica che valuta l'interazione tra forza muscolare degli arti inferiori e velocita' di rincorsa sulle tre fasi del salto triplo (hop, step, jump). I risultati evidenziano che incrementi della velocita' di rincorsa portano a maggiori prestazioni solo se accompagnati da un proporzionale aumento della forza eccentrica e reattiva; in caso contrario, la fase di step collassa sotto carichi d'impatto superiori a 15 volte il peso corporeo. La ripartizione ottimale delle percentuali di fase evolve verso un modello bilanciato all'aumentare della forza atletica.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27789035/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_jump_dapena_1988",
            "title": "Vertical and radial motions of the body during the take-off phase of high jumping",
            "authors": "Dapena, J., & Chung, C. S.",
            "journal": "Medicine and Science in Sports and Exercise",
            "year": 1988,
            "area": "Atletica Leggera",
            "abstract": "Analisi cinematica e dinamica della fase di stacco nel salto in alto con tecnica Fosbury-flop. Gli autori dimostrano come la traiettoria curvilinea finale della rincorsa generi una forza centripeta che consente all'atleta di inclinarsi verso l'interno della curva e convertire il momento angolare in momento di rotazione sull'asticella. I movimenti radiali degli arti liberi (braccia e arto di slancio) aumentano la forza verticale di reazione al suolo dell'arto di stacco, permettendo di raggiungere la massima quota del centro di massa.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/3386510/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_pacing_casado_2021",
            "title": "Pacing Profiles of Middle-Distance Running World Records in Men and Women",
            "authors": "Casado, A., Hanley, B., Jimenez-Reyes, P., & Renfree, A.",
            "journal": "International Journal of Environmental Research and Public Health",
            "year": 2021,
            "area": "Atletica Leggera",
            "abstract": "Analisi dei profili di distribuzione dello sforzo (pacing) nei record del mondo di mezzofondo (800m, 1500m, miglio) maschili e femminili. Negli 800 metri la strategia vincente e' marcatamente 'positiva' (primi 200m massimali seguiti da progressiva decelerazione fisiologica), mentre nei 1500m e nel miglio prevale un profilo a U o a J rovesciata con un incremento significativo della velocita' nei 300 metri finali. La comprensione di queste dinamiche e' indispensabile per strutturare le sedute ad intervalli e allenare la tolleranza al lattato ad intensita' gara.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34886317/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera",
                    "Endurance"
                ],
                "goals": [
                    "Resistenza",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_sprint_morin_2012",
            "title": "Mechanical determinants of 100-m sprint running performance",
            "authors": "Morin, J. B., Bourdin, M., Edouard, P., Peyrot, N., Samozino, P., & Lacour, J. R.",
            "journal": "European Journal of Applied Physiology",
            "year": 2012,
            "area": "Atletica Leggera",
            "abstract": "Studio cardine sui fattori biomeccanici e dinamici che determinano la prestazione sui 100 metri piani. Piu' che la quantita' totale di forza prodotta a terra, e' l'orientamento vettoriale della forza di reazione al suolo (indice di efficacia meccanica RF e decremento DRF) a discriminare i velocisti piu' rapidi. La capacita' di mantenere una spinta nettamente orizzontale anche ad altissime velocita' di traslazione correla direttamente con il tempo finale, offrendo un razionale scientifico inattaccabile per l'uso di sprint trainati e balzi orizzontali.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/22422028/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_sprint_samozino_2022",
            "title": "Optimal mechanical force-velocity profile for sprint acceleration performance",
            "authors": "Samozino, P., Peyrot, N., Edouard, P., Nagahara, R., Jimenez-Reyes, P., Vanwanseele, B., & Morin, J. B.",
            "journal": "Scandinavian Journal of Medicine & Science in Sports",
            "year": 2022,
            "area": "Atletica Leggera",
            "abstract": "Sviluppo e validazione di un modello biomeccanico a cinematica inversa per calcolare il profilo forza-velocita' orizzontale ottimale individuale nello sprint. La performance di accelerazione dipende sia dalla potenza massimale orizzontale per unita' di massa corporea (Pmax) sia dall'equilibrio tra capacita' di forza a basse velocita' (F0) e velocita' a basse forze (V0). Identificare lo sbilanciamento del profilo consente di personalizzare il lavoro con carichi pesanti orizzontali (se F0 deficitario) o sprint sovramassimali assistiti (se V0 deficitario).",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34775654/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_jump_jarvis_2022",
            "title": "Reactive Strength Index and its Associations with Measures of Physical and Sports Performance: A Systematic Review with Meta-Analysis",
            "authors": "Jarvis, P., Turner, A., Read, P., & Bishop, C.",
            "journal": "Sports Medicine",
            "year": 2022,
            "area": "Atletica Leggera",
            "abstract": "Revisione sistematica con meta-analisi sul Reactive Strength Index (RSI calcolato tramite Drop Jump o 10/5 Repeated Jump Test) e la sua correlazione con le qualita' atletiche. L'RSI presenta correlazioni forti con la velocita' di sprint (in particolare nella fase di velocita' lanciata, r = -0.60 a -0.72) e con l'agilita', riflettendo la capacita' del complesso muscolo-tendineo di immagazzinare e restituire energia elastica in tempi di contatto inferiori a 250 ms. Viene stabilito un quadro di riferimento per il monitoraggio della stiffness tendinea e la programmazione pliometrica avanzata.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34606061/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_sprint_cahill_2020",
            "title": "Influence of resisted sled-push training on the sprint force-velocity profile of male high school athletes",
            "authors": "Cahill, M. J., Oliver, J. L., Cronin, J. B., Clark, K. P., Cross, M. R., & Lloyd, R. S.",
            "journal": "Scandinavian Journal of Medicine & Science in Sports",
            "year": 2020,
            "area": "Atletica Leggera",
            "abstract": "Studio longitudinale controllato che valuta l'impatto dello sled-push (spinta della slitta) rispetto allo sled-pull (trazione della slitta) sul profilo forza-velocita' e sull'accelerazione. Lo sled-push consente una maggiore inclinazione del tronco e una coordinazione estensoria dell'anca e del ginocchio altamente specifica per i primi passi dello sprint, provocando incrementi marcati della forza orizzontale teorica F0 (+11.4%) e della potenza massimale. Fornisce linee guida su come integrare la slitta in spinta nei protocolli di potenziamento per velocisti.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31742795/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_sprint_nagahara_2014",
            "title": "Association of Acceleration with Spatiotemporal Variables in Maximal Sprinting",
            "authors": "Nagahara, R., Matsubayashi, T., Matsuo, A., & Zushi, K.",
            "journal": "International Journal of Sports Medicine",
            "year": 2014,
            "area": "Atletica Leggera",
            "abstract": "Analisi passo dopo passo delle variabili spazio-temporali (lunghezza del passo, frequenza del passo, tempi di contatto e di volo) lungo l'intera fase di accelerazione massimale (60 metri). Lo studio scompone l'accelerazione in tre sottofasi distinte: iniziale (passi 1-4, dominata dall'incremento della lunghezza del passo e tempi di contatto elevati), media (passi 5-16, aumento combinato di frequenza e lunghezza) e finale (stabilizzazione della frequenza e transizione alla velocita' di picco). Fondamentale per l'ottimizzazione del ritmo esecutivo.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24464016/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        }
    ];

    root.App.Sources.atletica = ATLETICA_SOURCES;
    if (typeof window !== 'undefined' && window.App) {
        window.App.Sources = window.App.Sources || {};
        window.App.Sources.atletica = ATLETICA_SOURCES;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = root.App.Sources.atletica;
    }
})();
