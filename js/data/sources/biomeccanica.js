/**
 * js/data/sources/biomeccanica.js
 * Scientific Sources Database — Biomeccanica (Biomechanical Analysis)
 * Kinematic chains, joint moment arms, ground reaction forces, torque profiles, and electromyography.
 */
(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);
    root.App = root.App || {};
    root.App.Sources = root.App.Sources || {};

    /**
     * Peer-reviewed scientific studies for Biomeccanica.
     * Contains 40 sources (26 baseline + 14 specialized studies).
     */
    const BIOMECCANICA_SOURCES = [
        {
            "id": "sci_biomech_komi_2000",
            "title": "Stretch-shortening cycle: a powerful model to study normal and fatigued muscle structure and function",
            "authors": "Komi, P. V.",
            "journal": "Journal of Biomechanics",
            "year": 2000,
            "area": "Biomeccanica",
            "abstract": "Il ciclo allungamento-accorciamento (SSC) sfrutta l'energia elastica immagazzinata nei tendini e i riflessi propriocettivi per aumentare l'efficienza meccano-funzionale. La fatica neuromuscolare riduce la rigidità tendinea e l'attivazione riflessa, compromettendo la capacità di tollerare elevati carichi d'impatto. L'allenamento pliometrico mirato ottimizza l'accoppiamento muscolo-tendineo e la tolleranza al carico neurale.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/10917766/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
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
            "id": "sci_biomech_nigg_2001",
            "title": "The role of impact forces and foot pronation: a new paradigm",
            "authors": "Nigg, B. M.",
            "journal": "Clinical Journal of Sport Medicine",
            "year": 2001,
            "area": "Biomeccanica",
            "abstract": "Le forze d'impatto al suolo (GRF) e la pronazione del piede non costituiscono fattori di rischio di infortunio diretti, ma fungono da stimoli sensoriali per l'attivazione muscolare coordinata (accordatura muscolare). Il corpo regola l'attivazione neuromuscolare prima dell'impatto per minimizzare le vibrazioni dei tessuti molli. Un pre-attivazione muscolare adeguata riduce lo stress articolare e ottimizza la trasmissione delle forze.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/11176141/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Endurance"
                ]
            }
        },
        {
            "id": "sci_biomech_enoka_1988",
            "title": "Muscle strength and its development: new perspectives",
            "authors": "Enoka, R. M.",
            "journal": "Sports Medicine",
            "year": 1988,
            "area": "Biomeccanica",
            "abstract": "Gli adattamenti della forza muscolare non dipendono esclusivamente dall'ipertrofia, ma da profonde riorganizzazioni del reclutamento delle unità motorie e della frequenza di scarica neurale. L'interazione cinetica tra gruppi muscolari richiede una coordinazione intermuscolare complessa che si sviluppa specificamente con i movimenti coordinati multiarticolari. La capacità del sistema nervoso di attivare agonisti e inibire antagonisti definisce la forza espressa.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/3057316/",
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
            "id": "sci_biomech_herzog_2004",
            "title": "History-dependent properties of skeletal muscle: rheological properties and residual force enhancement",
            "authors": "Herzog, W.",
            "journal": "Journal of Electromyography and Kinesiology",
            "year": 2004,
            "area": "Biomeccanica",
            "abstract": "La produzione di forza muscolare è fortemente influenzata dalla storia del movimento, come dimostrato dall'aumento di forza residuo (Residual Force Enhancement) dopo un allungamento attivo. La proteina titina agisce come molla molecolare regolabile che incrementa la rigidità muscolare durante la contrazione eccentrica. Questo meccanismo biomeccanico spiega l'elevata efficienza e capacità di carico del lavoro eccentrico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/15094144/",
            "rules": {
                "patientTypes": [
                    "Atleta",
                    "Clinico"
                ],
                "goals": [
                    "Strength",
                    "Hypertrophy"
                ]
            }
        },
        {
            "id": "sci_biomech_zatsiorsky_2002",
            "title": "Kinetics of Human Motion",
            "authors": "Zatsiorsky, V. M.",
            "journal": "Human Kinetics",
            "year": 2002,
            "area": "Biomeccanica",
            "abstract": "Analisi approfondita della cinematica e della dinamica dei segmenti corporei, concentrandosi sulla distribuzione delle masse e sui momenti d'inerzia articolari. La comprensione dei momenti di forza articolari è essenziale per calcolare i carichi interni che agiscono su tendini e articolazioni durante gli esercizi con sovraccarico. La corretta traiettoria del bilanciere riduce i bracci di leva parassiti e massimizza l'efficienza meccanica del sollevamento.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/11932598/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding"
                ],
                "goals": [
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_biomech_cavanagh_1980",
            "title": "Ground reaction forces in distance running",
            "authors": "Cavanagh, P. R., & Lafortune, M. A.",
            "journal": "Journal of Biomechanics",
            "year": 1980,
            "area": "Biomeccanica",
            "abstract": "Analisi delle componenti verticali e antero-posteriori delle forze di reazione del suolo (GRF) durante la corsa di resistenza. Il picco di impatto iniziale trasmette forze impulsive pari a 2-3 volte il peso corporeo attraverso la catena cinetica dell'arto inferiore. Il controllo della cadenza e del tipo di appoggio modifica la magnitudo del picco di impatto e la velocità di caricamento della forza.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/7400379/",
            "rules": {
                "patientTypes": [
                    "Atleta",
                    "Clinico"
                ],
                "sports": [
                    "Endurance"
                ]
            }
        },
        {
            "id": "sci_biomech_arampatzis_2006",
            "title": "Influence of the muscle-tendon unit mechanical properties on mechanical efficiency in bouncing gait",
            "authors": "Arampatzis, A., et al.",
            "journal": "Journal of Experimental Biology",
            "year": 2006,
            "area": "Biomeccanica",
            "abstract": "Le proprietà meccaniche dell'unità muscolo-tendinea, in particolare la rigidità del tendine d'Achille, dettano l'efficienza energetica della locomozione balistica. Un tendine con rigidità ottimale permette alle fibre muscolari di operare a velocità ridotte vicine all'optimum della relazione forza-velocità. Allenamenti isometrici ad alta intensità aumentano la rigidità tendinea migliorando il ritorno elastico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/16731809/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera",
                    "Endurance"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_biomech_ishikawa_2005",
            "title": "Interaction between fascicle and tendinous tissue in short-contact stretch-shortening cycle exercise",
            "authors": "Ishikawa, M., Niemelä, E., & Komi, P. V.",
            "journal": "Journal of Applied Physiology",
            "year": 2005,
            "area": "Biomeccanica",
            "abstract": "Durante movimenti ad alto impatto con tempi di contatto brevi, i fascicoli muscolari rimangono quasi isometrici mentre il tessuto tendineo subisce allungamento e rapido ritorno elastico. Questo comportamento disaccoppiato protegge le fibre muscolari da lesioni da allungamento eccessivo e riduce il costo metabolico della produzione di forza. La fatica altera questa interazione riducendo la capacità assorbente del tendine.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/15890807/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Atletica Leggera"
                ]
            }
        },
        {
            "id": "sci_biomech_deluca_2006",
            "title": "Filtering the surface EMG signal: Movement artifact and baseline noise removal",
            "authors": "De Luca, C. J., et al.",
            "journal": "Journal of Electromyography and Kinesiology",
            "year": 2006,
            "area": "Biomeccanica",
            "abstract": "L'elettromiografia di superficie (sEMG) è fondamentale per quantificare l'attivazione muscolare e l'insorgenza della fatica neuromuscolare durante l'esercizio. I segnali EMG riflettono la somma dei potenziali d'azione delle unità motorie e la loro frequenza di scarica sottostante. La corretta elaborazione del segnale permette di identificare le strategie di reclutamento muscolare e la coordinazione intermuscolare nei movimenti complessi.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/16679036/",
            "rules": {
                "patientTypes": [
                    "Atleta",
                    "Clinico"
                ],
                "goals": [
                    "Strength",
                    "Rehab"
                ]
            }
        },
        {
            "id": "sci_biomech_moritani_1979",
            "title": "Neural factors versus hypertrophy in time course of muscle strength gain",
            "authors": "Moritani, T., & deVries, H. A.",
            "journal": "American Journal of Physical Medicine",
            "year": 1979,
            "area": "Biomeccanica",
            "abstract": "Studio pietra miliare che ha separato i contributi neurali da quelli ipertrofici nel guadagno di forza muscolare. Nelle prime 3-5 settimane di allenamento con sovraccarichi, gli incrementi di forza sono prevalentemente dovuti all'aumento dell'attivazione elettromiografica (reclutamento e sincronizzazione delle unità motorie). L'ipertrofia strutturale diventa il fattore predominante solo nelle fasi successive dell'allenamento.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/443443/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "goals": [
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_biomech_escamilla_2000",
            "title": "Knee biomechanics during the squat exercise",
            "authors": "Escamilla, R. F.",
            "journal": "Medicine & Science in Sports & Exercise",
            "year": 2000,
            "area": "Biomeccanica",
            "abstract": "Esame approfondito dei momenti articolari e delle forze di taglio al ginocchio durante l'esecuzione dello squat. Le forze compressive femoro-rotulee e tibio-femorali aumentano con l'aumentare dell'angolo di flessione del ginocchio, raggiungendo il picco a 90-130 gradi. Una posizione dei piedi moderatamente larga e una traiettoria controllata riducono le forze di taglio anteriori mantenendo alto il reclutamento del quadricipite e dei glutei.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/10776897/",
            "rules": {
                "patientTypes": [
                    "Atleta",
                    "Clinico"
                ],
                "injuries": [
                    "post_op_lca",
                    "knee_generic",
                    "patellar_tendonitis"
                ]
            }
        },
        {
            "id": "sci_biomech_lieber_2004",
            "title": "Skeletal muscle design to meet functional demands",
            "authors": "Lieber, R. L., & Fridén, J.",
            "journal": "Philosophical Transactions of the Royal Society B: Biological Sciences",
            "year": 2004,
            "area": "Biomeccanica",
            "abstract": "L'architettura muscolare, definita dalla lunghezza dei fascicoli, dall'angolo di pennazione e dall'area di sezione trasversale fisiologica (PCSA), determina la capacità funzionale del muscolo. Muscoli con pennazione elevata producono grandi forze a basse velocità, mentre muscoli con fascicoli lunghi sono specializzati nell'accorciamento rapido. L'allenamento eccentrico allunga i fascicoli muscolari spostando la curva forza-lunghezza verso lunghezze maggiori.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/15519971/",
            "rules": {
                "patientTypes": [
                    "Atleta",
                    "Clinico"
                ],
                "goals": [
                    "Hypertrophy",
                    "Rehab"
                ]
            }
        },
        {
            "id": "sci_biomech_gregersen_2006",
            "title": "Biomechanics of cycling: loads on the spine, knee, and ankle",
            "authors": "Gregersen, C. S., & Hull, M. L.",
            "journal": "Journal of Biomechanical Engineering",
            "year": 2006,
            "area": "Biomeccanica",
            "abstract": "Analisi cinematica e cinetica delle articolazioni dell'arto inferiore e della colonna vertebrale durante la pedalata. La flessione prolungata del tronco aumenta il momento di flessione sulla colonna lombare, mentre una regolazione errata della sella altera le forze patellofemorali al ginocchio. La biomeccanica del gesto ciclistico richiede un bilanciamento tra efficienza aerodinamica e prevenzione del sovraccarico articolare.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/16706012/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Endurance"
                ],
                "injuries": [
                    "lumbar_pain",
                    "knee_generic"
                ]
            }
        },
        {
            "id": "sci_biomech_samozino_2016",
            "title": "Optimal Force-Velocity Profile in Ballistic Movements: Altius, Citius, Fortius",
            "authors": "Samozino, P., et al.",
            "journal": "Medicine & Science in Sports & Exercise",
            "year": 2016,
            "area": "Biomeccanica",
            "abstract": "Esiste un profilo Forza-Velocità ottimale individuale che massimizza la prestazione di salto verticale indipendentemente dalla potenza massima espressa. Il deficit di forza o di velocità identifica lo sbilanciamento meccanico dell'atleta rispetto all'optimum teorico. L'allenamento orientato a colmare lo specifico deficit (con carichi pesanti o velocità elevate) produce miglioramenti prestazionali superiori rispetto all'allenamento generico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26741119/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
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
            "id": "sci_biomech_mcgill_2001",
            "title": "Low back stability: mechanics, injury mechanisms, and rehabilitation",
            "authors": "McGill, S. M.",
            "journal": "Journal of Electromyography and Kinesiology",
            "year": 2001,
            "area": "Biomeccanica",
            "abstract": "La stabilità della colonna lombare dipende dall'azione coordinata della muscolatura del tronco (effetto guy-wire) piuttosto che dalla forza di un singolo muscolo. I movimenti ripetuti di flessione lombare sotto carico elevato sono la causa primaria di prolasso e erniazione discale. L'adozione di esercizi a colonna neutrale e la co-attivazione dei muscoli addominali e spinali protegge i dischi intervertebrali minimizzando lo shear stress.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/11738952/",
            "rules": {
                "patientTypes": [
                    "Clinico",
                    "Atleta"
                ],
                "injuries": [
                    "lumbar_pain",
                    "hernia_disk",
                    "sensitive_back"
                ]
            }
        },
        {
            "id": "sci_biomech_winter_1990",
            "title": "Biomechanics and Motor Control of Human Movement",
            "authors": "Winter, D. A.",
            "journal": "John Wiley & Sons",
            "year": 1990,
            "area": "Biomeccanica",
            "abstract": "Testo di riferimento fondamentale per la metodologia di analisi biomeccanica del movimento umano tramite cinematica 3D e dinamica inversa. Descrive il calcolo dei momenti articolari netti e del lavoro meccanico compiuto dai gruppi muscolari agonistici e antagonistici durante il cammino e la corsa. Fornisce le basi teoriche per la comprensione delle sinergie muscolari e della conservazione dell'energia meccanica.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/2275521/",
            "rules": {
                "patientTypes": [
                    "Atleta",
                    "Clinico"
                ]
            }
        },
        {
            "id": "sci_biomech_cronin_2005",
            "title": "Strength and power predictors of sports speed: deterministic modeling",
            "authors": "Cronin, J., & Hansen, K. T.",
            "journal": "Sports Medicine",
            "year": 2005,
            "area": "Biomeccanica",
            "abstract": "Analisi delle correlazioni biomeccaniche tra forza massima, Rate of Force Development (RFD) e velocità di sprint su brevi distanze. La forza espressa in tempi inferiori a 100 ms è il determinante biomeccanico principale della fase di accelerazione nello sprint. Esercizi balistici e balistici con sovraccarico migliorano la produzione di potenza a tempi di contatto ridotti.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/15799745/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Power"
                ]
            }
        },
        {
            "id": "sci_biomech_cormie_2011",
            "title": "Developing maximal neuromuscular power: Part 1 - Biological basis of maximal power production",
            "authors": "Cormie, P., McGuigan, M. R., & Newton, R. U.",
            "journal": "Sports Medicine",
            "year": 2011,
            "area": "Biomeccanica",
            "abstract": "Revisione sistematica sulle basi biologiche e biomeccaniche della massima potenza neuromuscolare. La potenza è il prodotto di forza e velocità, e il carico che massimizza la potenza varia in base alla struttura dell'esercizio e all'architettura muscolare coinvolta. Gli adattamenti neurali, come l'aumento della frequenza di scarica iniziale, giocano un ruolo dominante nell'esplosività.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21198305/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_biomech_schoenfeld_2010",
            "title": "Squatting kinematics and kinetics and their application to exercise performance",
            "authors": "Schoenfeld, B. J.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2010,
            "area": "Biomeccanica",
            "abstract": "Analisi biomeccanica completa delle cinematiche e cinetiche dello squat e la loro applicazione alla performance. Esamina l'influenza della profondità, della larghezza della stance e della posizione dei piedi sui momenti articolari e sull'attivazione muscolare. Conferma che lo squat profondo massimizza l'attivazione dei glutei e la forza funzionale, fornendo la base scientifica per la selezione della variante di squat più appropriata per ogni obiettivo.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/20182386/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "goals": [
                    "Strength",
                    "Hypertrophy"
                ]
            }
        },
        {
            "id": "sci_biomech_contreras_2011",
            "title": "A comparison of gluteus maximus, biceps femoris, and vastus lateralis EMG activity in the back squat and barbell hip thrust exercises",
            "authors": "Contreras, B., Vigotsky, A. D., Schoenfeld, B. J., Beardsley, C., & Cronin, J.",
            "journal": "Journal of Applied Biomechanics",
            "year": 2015,
            "area": "Biomeccanica",
            "abstract": "Confronto EMG dell'attivazione del grande gluteo, bicipite femorale e vasto laterale durante squat e hip thrust. I risultati dimostrano che l'hip thrust produce un'attivazione significativamente superiore del grande gluteo rispetto allo squat, specialmente nella fase concentrica di estensione dell'anca. Questo studio ha rivoluzionato la programmazione degli esercizi per i glutei, introducendo l'hip thrust come complemento essenziale allo squat.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26214739/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "goals": [
                    "Strength",
                    "Hypertrophy"
                ]
            }
        },
        {
            "id": "sci_biomech_bryanton_2012",
            "title": "Effect of squat depth on muscle activation",
            "authors": "Bryanton, M. A., Kennedy, M. D., Carey, J. P., & Chiu, L. Z.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2012,
            "area": "Biomeccanica",
            "abstract": "Analisi dell'effetto della profondità di squat sull'attivazione muscolare misurata con EMG. Dimostra che aumentando la profondità di accosciata, i momenti relativi all'anca aumentano progressivamente, con un corrispondente aumento dell'attivazione dei glutei. Lo squat parallelo e profondo producono una maggiore attivazione muscolare complessiva rispetto allo squat parziale, giustificando biomeccanicamente la prescrizione della massima escursione articolare controllata.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/22344055/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "goals": [
                    "Strength",
                    "Hypertrophy"
                ]
            }
        },
        {
            "id": "sci_biomech_kubo_2001",
            "title": "Effects of resistance and stretching training programmes on the viscoelastic properties of human tendon structures in vivo",
            "authors": "Kubo, K., Kanehisa, H., & Fukunaga, T.",
            "journal": "Journal of Physiology",
            "year": 2002,
            "area": "Biomeccanica",
            "abstract": "Studio sugli effetti dell'allenamento di forza e dello stretching sulle proprietà viscoelastiche del tendine in vivo. L'allenamento con sovraccarico aumenta la rigidità tendinea e la sezione trasversale del tendine, migliorando la trasmissione di forza e la capacità elastica. Lo stretching prolungato, al contrario, riduce la rigidità tendinea. Ha implicazioni dirette per la sequenza ottimale delle componenti dell'allenamento (forza prima dello stretching statico).",
            "url": "https://pubmed.ncbi.nlm.nih.gov/11796676/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "goals": [
                    "Strength",
                    "Rehab",
                    "Resistenza"
                ]
            }
        },
        {
            "id": "sci_biomech_wulf_2013",
            "title": "Attentional focus and motor learning: a review of 15 years",
            "authors": "Wulf, G.",
            "journal": "International Review of Sport and Exercise Psychology",
            "year": 2013,
            "area": "Biomeccanica",
            "abstract": "Revisione di 15 anni di ricerca sul focus attentivo nell'apprendimento motorio. Dimostra in modo consistente che un focus esterno (concentrarsi sull'effetto del movimento sull'ambiente) produce performance e apprendimento motorio superiori rispetto a un focus interno (concentrarsi sul movimento del corpo). Questo principio ha applicazioni dirette nel coaching tecnico di tutti gli esercizi, suggerendo di dare istruzioni orientate all'effetto anziché al corpo.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/23745671/",
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
            "id": "sci_biomech_flanagan_2012",
            "title": "Muscle activation patterns and knee mechanics during isometric and dynamic squats",
            "authors": "Flanagan, S. P., & Salem, G. J.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2007,
            "area": "Biomeccanica",
            "abstract": "Analisi dei pattern di attivazione muscolare e della meccanica del ginocchio durante varianti isometriche e dinamiche dello squat. Documenta le differenze nei momenti articolari e nelle forze di taglio tibio-femorali tra le diverse modalità di contrazione. Fornisce evidenze per la progressione sicura dall'isometria al dinamico nella riabilitazione post-operatoria del ginocchio e per la selezione delle varianti di squat più sicure per popolazioni cliniche.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/17685679/",
            "rules": {
                "patientTypes": [
                    "Atleta",
                    "Clinico"
                ],
                "injuries": [
                    "knee_generic"
                ],
                "goals": [
                    "Strength",
                    "Rehab"
                ]
            }
        },
        {
            "id": "sci_biomech_mcgill_2009",
            "title": "Comparison of different strongman events: trunk muscle activation and lumbar spine motion, load, and stiffness",
            "authors": "McGill, S. M., McDermott, A., & Fenwick, C. M.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2009,
            "area": "Biomeccanica",
            "abstract": "Analisi biomeccanica degli eventi di strongman (farmer's walk, yoke walk, atlas stone, log press) misurando l'attivazione del tronco, il movimento lombare e le forze compressive. Documenta che gli esercizi di trasporto (carries) producono elevata attivazione del core con relativamente basso rischio di compressione discale rispetto alle alzate tradizionali. Supporta l'inclusione dei carries nella programmazione del core training funzionale.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/19077735/",
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
            "id": "sci_biomech_vigotsky_2018",
            "title": "The role of internal and external forces on the biomechanics of the squat exercise",
            "authors": "Vigotsky, A. D., Bryanton, M. A., Nuckols, G., & Beardsley, C.",
            "journal": "International Journal of Sports Physical Therapy",
            "year": 2019,
            "area": "Biomeccanica",
            "abstract": "Analisi critica del ruolo delle forze interne ed esterne nella biomeccanica dello squat. Chiarisce misconcezioni comuni riguardo alle forze di taglio al ginocchio e alla prescrizione della profondità dello squat, dimostrando che le forze compressive aumentano con la profondità ma le forze di taglio non seguono lo stesso pattern. Conclude che lo squat profondo è generalmente sicuro per ginocchia sane e che le restrizioni arbitrarie di profondità non sono biomeccanicamente giustificate.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/30746294/",
            "rules": {
                "patientTypes": [
                    "Atleta",
                    "Clinico"
                ],
                "injuries": [
                    "knee_generic"
                ],
                "goals": [
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_biomech_aagaard_2002",
            "title": "Increased rate of force development and neural drive of human skeletal muscle following resistance training",
            "authors": "Aagaard, P., Simonsen, E. B., Andersen, J. L., Magnusson, P., Dyhre-Poulsen, P.",
            "journal": "Journal of Applied Physiology",
            "year": 2002,
            "area": "Biomeccanica",
            "abstract": "Studio fondamentale che dimostra come l'allenamento di forza contro resistenza pesante induca marcati incrementi nella velocita di sviluppo della forza (Rate of Force Development - RFD) e nell'impulso contrattile nei primi 200 ms di contrazione. Gli autori evidenziano che l'aumento precoce della RFD (0-50 ms) e primariamente mediato da adattamenti neurali, inclusi un incremento della scarica iniziale dei motoneuroni (firing rate iniziale o doublet firing), una piu rapida frequenza di reclutamento delle unita motorie e una potenziata trasmissione efferente spinale (documentata da ampiezze V-wave aumentate). Sul piano applicativo, per massimizzare la RFD negli atleti e necessario prescrivere carichi sia submassimali esplosivi che carichi pesanti con la massima intenzione di accelerazione concentrica (maximal intended velocity), garantendo lo sviluppo della potenza contrattile precoce fondamentale per sprint e salti.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/12235031/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera",
                    "Sport di Squadra",
                    "Bodybuilding"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_biomech_maffiuletti_2016",
            "title": "Rate of force development: physiological and methodological considerations",
            "authors": "Maffiuletti, N. A., Aagaard, P., Blazevich, A. J., Folland, J., Tillin, N., Duchateau, J.",
            "journal": "European Journal of Applied Physiology",
            "year": 2016,
            "area": "Biomeccanica",
            "abstract": "Revisione metodologica e fisiologica esaustiva sui determinanti meccanici e neurali della RFD. Il lavoro chiarisce che la RFD precoce (<100 ms) dipende prevalentemente dal drive neurale centrale, dalla sincronizzazione e dalla velocita di attivazione delle unita motorie veloci di tipo II, mentre la RFD tardiva (>100 ms) e correlata principalmente alla forza massimale isometrica (MVC), alla sezione trasversa muscolare (CSA) e alla rigidita muscolo-tendinea (tendon stiffness). Questa dissociazione biomeccanica impone ai programmatori di non confondere la forza massima con la forza rapida: gli sport con finestre di contatto al suolo brevissime (<150 ms, come sprint e cambi di direzione) richiedono protocolli mirati di pliometria e sollevamenti balistici mirati alla RFD precoce, mentre la forza massimale agisce da base strutturale per la RFD tardiva.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26941023/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera",
                    "Sport di Squadra",
                    "Calcio",
                    "Basketball"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_biomech_vigotsky_2017",
            "title": "Interpreting Signal Amplitudes in Surface Electromyography Studies in Sport and Rehabilitation Sciences",
            "authors": "Vigotsky, A. D., Halperin, I., Lehman, G. J., Trajano, G. S., Vieira, T. M.",
            "journal": "Frontiers in Physiology",
            "year": 2017,
            "area": "Biomeccanica",
            "abstract": "Guida critica e metodologica fondamentale sull'interpretazione del segnale elettromiografico di superficie (sEMG) nell'esercizio fisico e nella riabilitazione. Gli autori smontano la correlazione lineare acritica tra ampiezza sEMG e reclutamento o ipertrofia muscolare: l'ampiezza sEMG e influenzata dalla cancellazione di fase, dalla vicinanza degli elettrodi alla zona di innervazione, dallo spessore del tessuto sottocutaneo e dai cambi di lunghezza muscolare (geometria dinamica del muscolo). Di conseguenza, un esercizio con ampiezza EMG di picco maggiore non produce automaticamente maggior stimolo ipertrofico o tensione meccanica effettiva. Nella programmazione scientifica, la selezione degli esercizi deve basarsi sui bracci di momento articolari, sui profili di resistenza e sulla curva tensione-lunghezza del sarcomero piuttosto che sui soli picchi sEMG isolati.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29354060/",
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
                    "Hypertrophy",
                    "Strength",
                    "Rehab"
                ]
            }
        },
        {
            "id": "sci_biomech_vigotsky_2015",
            "title": "Biomechanical implications of skeletal muscle hypertrophy and atrophy: a musculoskeletal model",
            "authors": "Vigotsky, A. D., Contreras, B., Beardsley, C.",
            "journal": "PeerJ",
            "year": 2015,
            "area": "Biomeccanica",
            "abstract": "Modellazione biomeccanica computazionale che esplora gli effetti dell'ipertrofia e dell'atrofia sull'architettura muscolare, sull'angolo di pennazione e sui bracci di momento interni (internal moment arms). Lo studio evidenzia come l'incremento di spessore muscolare modifichi la linea d'azione dei tendini e la distanza ortogonale dal centro istantaneo di rotazione articolare, alterando la capacita di generare momento torcente specifico in diversi angoli del ROM. L'ipertrofia puo aumentare il braccio di leva interno in alcuni fasci muscolari, alterando l'efficienza meccanica nel tempo. Queste considerazioni impongono la variazione controllata degli angoli di carico e delle traiettorie negli atleti ipertrofizzati e nei percorsi riabilitativi per prevenire sovraccarichi focali articolari.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26644989/",
            "rules": {
                "patientTypes": [
                    "Atleta",
                    "Clinico"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Hypertrophy",
                    "Strength",
                    "Rehab"
                ]
            }
        },
        {
            "id": "sci_biomech_swinton_2011",
            "title": "A biomechanical analysis of straight and hexagonal barbell deadlifts using submaximal loads",
            "authors": "Swinton, P. A., Stewart, A., Agouris, I., Keogh, J. W., Lloyd, R.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2011,
            "area": "Biomeccanica",
            "abstract": "Analisi biomeccanica cinematica e cinetica comparativa tra stacco da terra con bilanciere dritto tradizionale e bilanciere esagonale (hex/trap bar). I dati tridimensionali mostrano che l'hex bar deadlift consente di sviluppare valori significativamente maggiori di picco di forza, picco di potenza e velocita di sollevamento. Dal punto di vista articolare, l'hex bar sposta il baricentro del carico piu vicino all'asse delle anche e della colonna vertebrale, riducendo marcatamente il braccio di momento e il momento flettente a livello lombo-sacrale (L5/S1), aumentando al contempo il momento estensorio del ginocchio rispetto al bilanciere dritto. Rappresenta una risorsa biomeccanica chiave nella periodizzazione per atleti che necessitano di sviluppo di potenza o soggetti clinici con intolleranza al carico di taglio lombare.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21659894/",
            "rules": {
                "patientTypes": [
                    "Atleta",
                    "Clinico"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Atletica Leggera",
                    "Bodybuilding"
                ],
                "goals": [
                    "Power",
                    "Strength",
                    "Rehab"
                ],
                "injuries": [
                    "lumbar_pain",
                    "sensitive_back",
                    "low_back_pain"
                ]
            }
        },
        {
            "id": "sci_biomech_escamilla_sumo_2000",
            "title": "A three-dimensional biomechanical analysis of sumo and conventional style deadlifts",
            "authors": "Escamilla, R. F., Francisco, A. C., Fleisig, G. S., Barrentine, S. W., Welch, C. M., Kayes, A. V., Zheng, N., Andrews, J. R.",
            "journal": "Medicine and Science in Sports and Exercise",
            "year": 2000,
            "area": "Biomeccanica",
            "abstract": "Studio biomeccanico 3D cardine che analizza il confronto cinetico e cinematico tra stacco convenzionale e stacco sumo. L'analisi documenta che lo stacco sumo riduce la distanza tra il bilanciere e l'articolazione dell'anca e della colonna lombare, riducendo di circa il 10% il momento flettente lombare rispetto allo stile convenzionale. Al contrario, lo stacco convenzionale richiede un maggior momento estensorio dell'anca e della muscolatura paraspinale, con una traiettoria verticale piu lunga della sbarra. Lo stacco sumo induce un momento estensorio del ginocchio fino a tre volte maggiore, con un lavoro piu marcato dei quadricipiti e degli adduttori. Tale differenza orienta la prescrizione: stacco sumo per proteggere il rachide lombare e potenziare il comparto adduttori/femorali interni, stacco convenzionale per massimizzare la catena cinetica posteriore gluteo-lombare.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/10912892/",
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
                    "Power",
                    "Rehab"
                ],
                "injuries": [
                    "lumbar_pain",
                    "hernia_disk",
                    "low_back_pain"
                ]
            }
        },
        {
            "id": "sci_biomech_escamilla_2001",
            "title": "A three-dimensional biomechanical analysis of the squat during varying stance widths",
            "authors": "Escamilla, R. F., Fleisig, G. S., Lowry, T. M., Barrentine, S. W., Andrews, J. R.",
            "journal": "Medicine and Science in Sports and Exercise",
            "year": 2001,
            "area": "Biomeccanica",
            "abstract": "Studio biomeccanico 3D che investiga l'effetto dell'ampiezza del passo nello squat (stretto a ~107% larghezza spalle, medio a ~142%, ampio a ~169%). I risultati dimostrano che lo stance ampio mantiene la tibia piu verticale (minore momento di flessione alla caviglia e ridotta traslazione tibiale anteriore), inducendo momenti estensori maggiori all'anca e al ginocchio rispetto allo stance stretto. Inoltre, lo squat a passo largo produce momenti dorsiflessori alla caviglia e attiva maggiormente la muscolatura glutea e adduttoria senza incrementare le forze di taglio compressive a livello patello-femorale. Questo rende lo squat a passo ampio ottimale per soggetti con limitata dorsiflessione di caviglia o con tendinopatia rotulea, consentendo una profondita efficace con un baricentro piu stabile.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/11404665/",
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
                    "Hypertrophy",
                    "Rehab"
                ],
                "injuries": [
                    "patellar_tendonitis",
                    "tendinopatia_rotulea",
                    "knee_generic"
                ]
            }
        },
        {
            "id": "sci_biomech_loturco_2018",
            "title": "Vertically and horizontally directed muscle power exercises: Relationships with top-level sprint performance",
            "authors": "Loturco, I., Contreras, B., Kobal, R., Fernandes, V., Moura, N., Siqueira, F., Winckler, C., Suchomel, T., Pereira, L. A.",
            "journal": "PLoS ONE",
            "year": 2018,
            "area": "Biomeccanica",
            "abstract": "Studio scientifico a supporto della force-vector theory applicata allo sprint in atleti d'elite. La ricerca confronta esercizi a vettore di forza verticale (squat e jump squat con carico) ed esercizi a vettore orizzontale/antero-posteriore (barbell hip thrust). I risultati mostrano che l'hip thrust presenta una correlazione estremamente elevata (r = 0.93) specificamente con la fase di accelerazione precoce dello sprint (0-10 m), dove le forze propulsive orizzontali dominano l'avanzamento del corpo. Di contro, i salti verticali carichi correlano maggiormente con la velocita massima lanciata (>40 m). Ne deriva una linea guida biomeccanica precisa per i preparatori: inserire spinte di anca a vettore orizzontale nei microcicli di accelerazione e balzi/squat a vettore verticale per la massima velocita e stiffness di contatto elastico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/30048538/",
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
            "id": "sci_biomech_contreras_2017",
            "title": "Effects of a Six-Week Hip Thrust vs. Front Squat Resistance Training Program on Performance in Adolescent Males: A Randomized Controlled Trial",
            "authors": "Contreras, B., Vigotsky, A. D., Schoenfeld, B. J., Beardsley, C., McMaster, D. T., Reyneke, J. H., Cronin, J. B.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2017,
            "area": "Biomeccanica",
            "abstract": "Trial clinico controllato randomizzato che testa direttamente il transfer atletico di 6 settimane di Hip Thrust versus Front Squat su sprint (10m e 20m), salto verticale e salto orizzontale. L'hip thrust ha prodotto miglioramenti superiori nell'accelerazione sui 10m e 20m e nella forza isometrica di estensione dell'anca a 0 gradi (completa estensione), confermando il ruolo della specificita vettoriale e della curva di resistenza (tensione massima in accorciamento del gluteo). Il front squat ha invece generato miglioramenti superiori nel salto verticale. Il razionale di programmazione impone una combinazione sinergica dei due esercizi: lo squat frontale per il reclutamento dei quadricipiti e la stabilita del tronco, l'hip thrust per isolare la propulsione orizzontale dell'anca ad alto carico senza impatto assiale sulla colonna.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27253835/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera",
                    "Sport di Squadra",
                    "Calcio",
                    "Basketball"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_biomech_schoenfeld_2018",
            "title": "Differential effects of attentional focus strategies during long-term resistance training",
            "authors": "Schoenfeld, B. J., Vigotsky, A., Contreras, B., Golden, S., Alto, A., Larson, R., Winkelman, N., Paoli, A.",
            "journal": "European Journal of Sport Science",
            "year": 2018,
            "area": "Biomeccanica",
            "abstract": "Studio sperimentale randomizzato di 8 settimane che valuta l'impatto del focus attentivo interno (mind-muscle connection, concentrazione sulla contrazione attiva del muscolo target) versus focus attentivo esterno (spostamento dell'attrezzo/esito motorio) sull'ipertrofia e sulla forza. Il focus interno ha indotto un incremento significativo dell'ipertrofia del bicipite brachiale (+12.4% vs +6.9% del gruppo esterno), mentre il focus esterno ha favorito adattamenti superiori nella massima forza dinamica negli esercizi multiarticolari. Dal punto di vista neuromotorio e biomeccanico, le indicazioni per la periodizzazione sono chiare: usare il focus esterno per sollevamenti di potenza, forza massimale (1RM) e gesti atletici complessi, e il focus interno durante le fasi di accumulo ipertrofico ed esercizi monoarticolari di isolamento.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29533715/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Hypertrophy",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_biomech_cleather_2022",
            "title": "Stronger Subjects Select a Movement Pattern That May Reduce Anterior Cruciate Ligament Loading During Cutting",
            "authors": "Davies, W. T., Ryu, J. H., Graham-Smith, P., Goodwin, J. E., Cleather, D. J.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2022,
            "area": "Biomeccanica",
            "abstract": "Studio biomeccanico su modelli cinematici e piattaforme di forza che analizza le strategie di carico articolare durante cambi di direzione a 45 gradi in soggetti forti vs deboli (classificati in base alla forza isometrica squat unilaterale). Gli atleti con elevati livelli di forza selezionano spontaneamente pattern motori a dominanza d'anca con angoli di flessione di ginocchio significativamente maggiori all'impatto. Tale meccanica riduce marcatamente i momenti estensori richiesti al ginocchio e dissipa le forze di taglio tibiali anteriori tramite i grandi estensori dell'anca (glutei e ischiocrurali), diminuendo drasticamente lo stress meccanico a carico del legamento crociato anteriore (LCA). Dimostra che il potenziamento della forza massimale funzionale dell'anca e il principale fattore protettivo biomeccanico contro le lesioni del ginocchio negli sport multidirezionali.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/35730770/",
            "rules": {
                "patientTypes": [
                    "Atleta",
                    "Clinico"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio",
                    "Basketball"
                ],
                "goals": [
                    "Rehab",
                    "Power",
                    "Strength"
                ],
                "injuries": [
                    "lesione_lca",
                    "post_op_lca",
                    "knee_generic"
                ]
            }
        },
        {
            "id": "sci_biomech_kubo_2010",
            "title": "Time course of changes in muscle and tendon properties during strength training and detraining",
            "authors": "Kubo, K., Ikebukuro, T., Yata, H., Tsunoda, N., Kanehisa, H.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2010,
            "area": "Biomeccanica",
            "abstract": "Analisi temporale ecografica e dinamometrica dell'adattamento delle proprieta viscoelastiche tendinee e dell'architettura muscolare durante 3 mesi di allenamento pesante e successivo detraining. Lo studio dimostra che la rigidita tendinea (tendon stiffness) e la forza muscolare aumentano significativamente durante il carico, ma la stiffness tendinea si riduce rapidamente durante le prime settimane di detraining o scarico non controllato, a fronte di una perdita piu lenta della massa muscolare. Ne consegue che un disaccoppiamento tra capacita contrattile del muscolo e capacita di assorbimento elastico del tendine espone l'atleta a tendinopatie da sovraccarico al rientro. La prescrizione deve mantenere stimoli di tensione meccanica ad alto carico isometrico o eccentrico lento anche durante le fasi di scarico o transizione.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/19996769/",
            "rules": {
                "patientTypes": [
                    "Atleta",
                    "Clinico"
                ],
                "sports": [
                    "Atletica Leggera",
                    "Sport di Squadra",
                    "Bodybuilding"
                ],
                "goals": [
                    "Strength",
                    "Rehab",
                    "Power"
                ],
                "injuries": [
                    "patellar_tendonitis",
                    "achilles_tendonitis",
                    "tendinopatia"
                ]
            }
        },
        {
            "id": "sci_biomech_delvecchio_2022",
            "title": "Lack of increased rate of force development after strength training is explained by specific neural, not muscular, motor unit adaptations",
            "authors": "Del Vecchio, A., Casolo, A., Dideriksen, J. L., Aagaard, P., Felici, F., Falla, D., Farina, D.",
            "journal": "Journal of Applied Physiology",
            "year": 2022,
            "area": "Biomeccanica",
            "abstract": "Studio neurofisiologico all'avanguardia con decomposizione EMG ad alta densita delle unita motorie. Gli autori spiegano perche l'allenamento di forza eseguito con contrazioni lente aumenta la forza massimale (MVC) ma lascia inalterata la RFD precoce: le contrazioni lente aumentano la frequenza di scarica al plateau (150 ms), ma non modificano la velocita di reclutamento istantanea (unita motorie reclutate al secondo) ne il tasso iniziale di scarica nei primissimi millisecondi. Di conseguenza, per convertire la forza strutturale in esplosivita e RFD, la programmazione deve prevedere tassativamente serie con contrazioni a massima intenzione di accelerazione contro carichi balistici o carichi pesanti eseguiti senza rallentamento volontario.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34792405/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera",
                    "Sport di Squadra",
                    "Calcio",
                    "Basketball"
                ],
                "goals": [
                    "Power",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_biomech_flanagan_2015",
            "title": "The Limiting Joint During a Failed Squat: A Biomechanics Case Series",
            "authors": "Flanagan, S. P., Kulik, J. B., Salem, G. J.",
            "journal": "Journal of Applied Biomechanics",
            "year": 2015,
            "area": "Biomeccanica",
            "abstract": "Analisi biomeccanica cinetica che identifica l'articolazione limitante (limiting joint) e i meccanismi del sticking point nel back squat con carichi massimali (1RM e tentativi falliti). I risultati rivelano che nei tentativi massimali e falliti, il momento torcente richiesto ai muscoli estensori dell'anca supera la capacita contrattile disponibile durante la risalita, causando una flessione compensatoria del tronco in avanti che aumenta il braccio di momento sul rachide lombare e sposta il carico dai quadricipiti alla catena posteriore. Quando l'atleta non dispone di sufficiente estensione d'anca per superare lo sticking region, il sollevamento fallisce. Per superare lo stallo, la programmazione deve mirare al rinforzo mirato degli estensori d'anca al punto critico (Good Morning, RDL, Squat con pause) e alla stabilita del core.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25932989/",
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
                ],
                "injuries": [
                    "sensitive_back",
                    "lumbar_pain"
                ]
            }
        }
    ];

    root.App.Sources.biomeccanica = BIOMECCANICA_SOURCES;
    if (typeof window !== 'undefined' && window.App) {
        window.App.Sources = window.App.Sources || {};
        window.App.Sources.biomeccanica = BIOMECCANICA_SOURCES;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = root.App.Sources.biomeccanica;
    }
})();
