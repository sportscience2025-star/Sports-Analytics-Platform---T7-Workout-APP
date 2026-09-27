/**
 * js/data/sources/fisiologia.js
 * Scientific Sources Database — Fisiologia (Exercise Physiology)
 * Hypertrophy mechanisms, muscle protein synthesis, bioenergetics, autonomic recovery, and fatigue kinetics.
 */
(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);
    root.App = root.App || {};
    root.App.Sources = root.App.Sources || {};

    /**
     * Peer-reviewed scientific studies for Fisiologia.
     * Contains 47 sources (33 baseline + 14 specialized studies).
     */
    const FISIOLOGIA_SOURCES = [
        {
            "id": "sci_endurance_ronnestad_2014",
            "title": "Optimizing strength training for running and cycling performance: A review",
            "authors": "Rønnestad, B. R., & Mujika, I.",
            "journal": "Scandinavian Journal of Medicine & Science in Sports",
            "year": 2014,
            "area": "Fisiologia",
            "abstract": "Revisione sistematica fondamentale che mostra come l'inserimento dell'allenamento di forza pesante e concentrato su esercizi multiarticolari (es. Squat) migliori l'economia di corsa e di pedalata negli atleti di endurance senza causare ipertrofia ipertrofica indesiderata. Gli adattamenti derivano da un aumento della stiffness muscolo-tendinea e dal ritardo nel reclutamento delle fibre di tipo II.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/23914664/",
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
            "id": "sci_endurance_midgley_2007",
            "title": "Training to enhance maximal oxygen uptake: how to maximize time at or near VO2max",
            "authors": "Midgley, A. W., McNaughton, L. R., & Jones, A. M.",
            "journal": "Sports Medicine",
            "year": 2007,
            "area": "Fisiologia",
            "abstract": "Esamina i metodi di allenamento per massimizzare il tempo trascorso a percentuali prossime al VO2max (vVO2max). Analizza l'efficacia dei protocolli di intervalli ad alta intensità e il ruolo della durata delle ripetizioni per stimolare adattamenti cardiaci primari (gittata sistolica) e periferici nei mezzofondisti e fondisti.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/17196020/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera",
                    "Endurance"
                ],
                "goals": [
                    "Resistenza"
                ]
            }
        },
        {
            "id": "sci_endurance_jones_2006",
            "title": "The physiology of the world record holder for the women's marathon: a case study",
            "authors": "Jones, A. M.",
            "journal": "International Journal of Sports Science & Coaching",
            "year": 2006,
            "area": "Fisiologia",
            "abstract": "Studio longitudinale sulla fisiologia di Paula Radcliffe durante il suo percorso verso il record mondiale di maratona. Dimostra che mentre il VO2max è rimasto relativamente costante negli anni, il fattore chiave che ha guidato i continui miglioramenti prestazionali è stato l'incremento impressionante dell'economia di corsa (Running Economy) e della soglia del lattato.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/16931758/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Atletica Leggera",
                    "Endurance"
                ],
                "goals": [
                    "Resistenza"
                ]
            }
        },
        {
            "id": "sci_detraining_mujika_2000",
            "title": "Detraining: loss of training-induced physiological and performance adaptations. Part I: short-term insufficient training stimulus",
            "authors": "Mujika, I., & Padilla, S.",
            "journal": "Sports Medicine",
            "year": 2000,
            "area": "Fisiologia",
            "abstract": "Studio di riferimento sulle risposte di decondizionamento a breve termine (meno di 4 settimane) negli atleti. Descrive il rapido calo del VO2max causato dalla riduzione del volume ematico e della gittata sistolica, mantenendo invece inalterata la forza muscolare per tempi più lunghi. Fondamentale per la gestione dei periodi di taper, di transizione e di recupero post-infortunio.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/10999422/",
            "rules": {
                "patientTypes": [
                    "Atleta",
                    "Clinico"
                ],
                "sports": [
                    "Atletica Leggera",
                    "Bodybuilding",
                    "Sport di Squadra",
                    "Endurance"
                ],
                "goals": [
                    "Definition",
                    "Rehab"
                ]
            }
        },
        {
            "id": "sci_physiol_fleck_2004",
            "title": "Designing Resistance Training Programs (4th Edition)",
            "authors": "Fleck, S. J., & Kraemer, W. J.",
            "journal": "Human Kinetics",
            "year": 2014,
            "area": "Fisiologia",
            "abstract": "Testo di riferimento mondiale per la progettazione dei programmi di allenamento con i pesi. Approfondisce le risposte ormonali, cardiovascolari e neurologiche sia a breve che a lungo termine. Delinea i modelli di periodizzazione lineare, ondulata e a blocchi per ottimizzare la prestazione atletica evitando la sindrome da sovrallenamento.",
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
            "id": "sci_physiol_ahtiainen_2003",
            "title": "Muscle hypertrophy, hormonal adaptation and strength development during strength training in strength-trained and untrained men",
            "authors": "Ahtiainen, J. P., Pakarinen, A., Alen, M., Kraemer, W. J., & Häkkinen, K.",
            "journal": "European Journal of Applied Physiology",
            "year": 2003,
            "area": "Fisiologia",
            "abstract": "Esamina gli adattamenti ormonali acuti e cronici (testosterone e ormone della crescita) indotti da carichi pesanti in soggetti allenati e non allenati. Mostra come gli atleti avanzati richiedano variazioni di volume e intensità più marcate per stimolare ulteriormente la secrezione ormonale e la sintesi proteica muscolare rispetto ai soggetti novizi.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/12629688/",
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
                    "Hypertrophy"
                ]
            }
        },
        {
            "id": "sci_physiol_crewther_2006",
            "title": "Two emerging concepts in physical training: Neuromuscular fatigue and postactivation potentiation from fatigue to potentiation",
            "authors": "Crewther, B., Keogh, J., Cronin, J., & Cook, C.",
            "journal": "Sports Medicine",
            "year": 2006,
            "area": "Fisiologia",
            "abstract": "Analizza il delicato equilibrio tra fatica neuromuscolare e potenziamento post-attivazione durante le sessioni di allenamento complesso. Vengono esaminati gli indicatori di fatica (come il calo del tasso di sviluppo della forza) e i tempi ottimale di recupero inter-serie per sfruttare al massimo il potenziamento nella produzione di potenza esplosiva.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/17052063/",
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
            "id": "sci_monitoring_mcguigan_2012",
            "title": "Monitoring training load and fatigue in resistance training",
            "authors": "McGuigan, M. R., Al-Curry, M., & Foster, C.",
            "journal": "International Journal of Sports Physiology and Performance",
            "year": 2012,
            "area": "Fisiologia",
            "abstract": "Fornisce le basi scientifiche e metodologiche per l'utilizzo del Session-RPE (scala di percezione dello sforzo di sessione) e del carico interno nel monitoraggio dell'allenamento di forza e potenza. Dimostra che il Session-RPE si correla fortemente con i parametri fisiologici e biomeccanici, aiutando i preparatori a prevenire il sovrallenamento negli atleti.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/23136270/",
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
                    "Definition"
                ]
            }
        },
        {
            "id": "sci_physiol_tabata_1996",
            "title": "Effects of moderate-intensity endurance and high-intensity intermittent training on anaerobic capacity and VO2max",
            "authors": "Tabata, I., et al.",
            "journal": "Medicine & Science in Sports & Exercise",
            "year": 1996,
            "area": "Fisiologia",
            "abstract": "Dimostrazione che un protocollo ad altissima intensità ad intervalli (20s sforzo a 170% VO2max, 10s pausa per 4 minuti) migliora contemporaneamente la capacità aerobica (VO2max) e la capacità anaerobica lattacida. Il debito di ossigeno accumulato durante le frazioni di lavoro stimola sia il reclutamento delle fibre veloci che gli adattamenti cardiovascolari periferici. Rappresenta il benchmark fisiologico per l'allenamento HIIT ad alta densità.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/8897392/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Endurance"
                ],
                "goals": [
                    "Power",
                    "Resistenza"
                ]
            }
        },
        {
            "id": "sci_physiol_bangsbo_1994",
            "title": "Physiological response to intermittent exercise",
            "authors": "Bangsbo, J.",
            "journal": "International Journal of Sports Medicine",
            "year": 1994,
            "area": "Fisiologia",
            "abstract": "Analisi della cinetica del lattato e del consumo di ossigeno durante l'esercizio intermittente ad alta intensità tipico dei giochi di squadra. Durante le pause di recupero attivo o passivo, il ripristino della fosfocreatina (PCr) e la rimozione del lattato dipendono fortemente dalla capacità ossidativa mitocondriale. Un'elevata potenza aerobica di base accelera il recupero tra sprint ripetuti.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/7851956/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra"
                ]
            }
        },
        {
            "id": "sci_physiol_buchheit_2013",
            "title": "High-intensity interval training, solutions to the programming puzzle: Part I: cardiopulmonary / neuromuscular responses",
            "authors": "Buchheit, M., & Laursen, P. B.",
            "journal": "Sports Medicine",
            "year": 2013,
            "area": "Fisiologia",
            "abstract": "Framework fisiologico per la programmazione dell'allenamento ad intervalli ad alta intensità (HIIT). Per ottimizzare gli adattamenti cardiocircolatori è necessario stimolare il sistema a percentuali prossime al VO2max (vVO2max) per un tempo accumulato sufficiente. La manipolazione di durata dell'intervallo, intensità e tipo di recupero regola accuratamente il carico neuromuscolare e metabolico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/23539308/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Endurance"
                ]
            }
        },
        {
            "id": "sci_physiol_izquierdo_2006",
            "title": "Differential effects of strength training leading to failure versus not to failure on hormonal responses, strength, and muscle power",
            "authors": "Izquierdo, M., et al.",
            "journal": "Journal of Applied Physiology",
            "year": 2006,
            "area": "Fisiologia",
            "abstract": "Confronto tra allenamento con sovraccarichi condotto a cedimento muscolare e non a cedimento. L'allenamento costantemente a cedimento provoca una soppressione prolungata delle concentrazioni basali di IGF-1 e un aumento del cortisolo a riposo, inducendo fatica neuromuscolare cronica. Evitare il cedimento sistematico permette di mantenere più elevate le capacità di potenza ed esplosività.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/16672361/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
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
            "id": "sci_physiol_wasserman_1973",
            "title": "Anaerobic threshold and respiratory gas exchange during exercise",
            "authors": "Wasserman, K., et al.",
            "journal": "Journal of Applied Physiology",
            "year": 1973,
            "area": "Fisiologia",
            "abstract": "Articolo storico che ha introdotto il concetto di soglia anaerobica (soglia ventilatoria) determinata attraverso lo scambio dei gas respiratori. Identifica il punto di intensità dell'esercizio in cui la produzione di acido lattico supera la capacità di tampone ematico, causando un aumento sproporzionato della ventilazione. Fondamentale per la personalizzazione delle zone di allenamento aerobico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/4761272/",
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
            "id": "sci_physiol_brooks_1986",
            "title": "The lactate shuttle: carbohydrate metabolism during exercise",
            "authors": "Brooks, G. A.",
            "journal": "Medicine & Science in Sports & Exercise",
            "year": 1986,
            "area": "Fisiologia",
            "abstract": "Introduzione della teoria del Lactate Shuttle, che ha rivoluzionato la comprensione del metabolismo del lattato. Il lattato non è un semplice sottoprodotto di scarto della glicolisi anaerobica, ma un importante substrato energetico e una molecola di segnalazione che viene trasportata dalle fibre glicolitiche a quelle ossidative (e al cuore e cervello) per essere ossidato.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/3523107/",
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
            "id": "sci_physiol_seiler_2006",
            "title": "Autonomic recovery after exercise in trained athletes: intensity and duration effects",
            "authors": "Seiler, S., Haugen, O., & Kuffel, E.",
            "journal": "Medicine & Science in Sports & Exercise",
            "year": 2006,
            "area": "Fisiologia",
            "abstract": "Studio sull'impatto dell'intensità dell'allenamento sul ripristino dell'equilibrio autonomico tramite la variabilità della frequenza cardiaca (HRV). Sessioni eseguite al di sotto della prima soglia lattacida (LT1) provocano uno stress autonomo minimo e consentono un rapido recupero simpato-vagale. Sessioni sopra la soglia anaerobica richiedono tempi di recupero significativamente più lunghi.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/16888457/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Endurance"
                ],
                "goals": [
                    "Resistenza",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_physiol_gibala_2006",
            "title": "Short-term sprint interval training increases human skeletal muscle oxidative capacity and endurance performance",
            "authors": "Gibala, M. J., et al.",
            "journal": "Journal of Physiology",
            "year": 2006,
            "area": "Fisiologia",
            "abstract": "Dimostrazione che un basso volume di sprint interval training (SIT, es. 4-6 sprint Wingate di 30 secondi) induce aumenti nella capacità ossidativa muscolare (enzima citrato sintasi) e nel contenuto di glicogeno equivalenti a sessioni tradizionali di endurance ad alto volume. Dimostra l'efficienza temporale degli stimoli ad altissima intensità negli adattamenti mitocondriali.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/16973704/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "goals": [
                    "Resistenza",
                    "Definition"
                ]
            }
        },
        {
            "id": "sci_physiol_gollnick_1972",
            "title": "Enzyme activity and fiber composition in skeletal muscle of untrained and trained men",
            "authors": "Gollnick, P. D., et al.",
            "journal": "Journal of Applied Physiology",
            "year": 1972,
            "area": "Fisiologia",
            "abstract": "Studio classico sul profilo enzimatico e la tipizzazione delle fibre muscolari nell'uomo. Mostra che l'allenamento di resistenza aumenta drasticamente l'attività degli enzimi ossidativi del ciclo di Krebs (come succinato deidrogenasi) sia nelle fibre di Tipo I che di Tipo II, dimostrando la notevole plasticità metabolica del muscolo scheletrico in risposta allo stress fisiologico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/5075868/",
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
            "id": "sci_physiol_hawley_2014",
            "title": "Integrative biology of exercise",
            "authors": "Hawley, J. A., Hargreaves, M., Joyner, M. J., & Zierath, J. R.",
            "journal": "Cell",
            "year": 2014,
            "area": "Fisiologia",
            "abstract": "Revisione di alto livello sulle vie di segnalazione molecolare attivate dall'esercizio fisico. L'aumento del calcio intracellulare, il rapporto AMP/ATP e lo stress meccanico attivano chinasi chiave come AMPK e PGC-1alfa, regolatrici primarie della biogenesi mitocondriale e dell'assunzione di glucosio GLUT4. Evidenzia la specificità cellulare della risposta all'allenamento.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25417157/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ]
            }
        },
        {
            "id": "sci_physiol_millet_2011",
            "title": "Neuromuscular fatigue in ultra-endurance exercise",
            "authors": "Millet, G. Y.",
            "journal": "Sports Medicine",
            "year": 2011,
            "area": "Fisiologia",
            "abstract": "Analisi dell'origine della fatica neuromuscolare negli sforzi di ultra-endurance. Nelle gare di lunga durata, la riduzione della forza massima è causata prevalentemente da fatica centrale (diminuzione del drive motorio cerebrale e spinale) e dall'alterazione dell'accoppiamento eccitazione-contrazione nei ponti trasversi. La protezione articolare e il mantenimento dell'attivazione neurale diventano prioritari.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/22082073/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Endurance"
                ],
                "goals": [
                    "Resistenza"
                ]
            }
        },
        {
            "id": "sci_physiol_fry_1997",
            "title": "Overtraining in athletes: an update",
            "authors": "Fry, A. C., & Kraemer, W. J.",
            "journal": "Sports Medicine",
            "year": 1997,
            "area": "Fisiologia",
            "abstract": "Esame dei meccanismi neuroendocrini e fisiologici della sindrome da sovrallenamento (Overtraining Syndrome). L'allenamento ad intensità eccessiva senza adeguato recupero altera l'asse ipotalamo-ipofisi-surrene, riduce i livelli di testosterone e degrada la risposta simpatica. Sottolinea l'importanza della periodizzazione e del monitoraggio del carico di lavoro.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/9068094/",
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
            "id": "sci_physiol_schoenfeld_2016",
            "title": "Dose-response relationship between weekly resistance training volume and increases in muscle mass: A systematic review and meta-analysis",
            "authors": "Schoenfeld, B. J., Ogborn, D., & Krieger, J. W.",
            "journal": "Journal of Sports Sciences",
            "year": 2016,
            "area": "Fisiologia",
            "abstract": "Meta-analisi che dimostra una relazione dose-risposta tra il volume di allenamento settimanale (numero di serie per gruppo muscolare) e l'ipertrofia muscolare. Protocolli con 10 o più serie settimanali per gruppo muscolare producono guadagni di massa muscolare significativamente superiori rispetto a volumi più bassi. Il volume è un driver primario dell'ipertrofia quando l'intensità è controllata.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27433960/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding"
                ],
                "goals": [
                    "Hypertrophy"
                ]
            }
        },
        {
            "id": "sci_physiol_morton_2018",
            "title": "A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults",
            "authors": "Morton, R. W., et al.",
            "journal": "British Journal of Sports Medicine",
            "year": 2018,
            "area": "Fisiologia",
            "abstract": "Studio di sintesi sull'impatto dell'apporto proteico sugli adattamenti muscolari e di forza durante l'allenamento contro resistenza. L'assunzione complessiva di proteine fino a ~1.6 g/kg/giorno ottimizza l'ipertrofia e i guadagni di forza indotti dall'allenamento, con benefici trascurabili oltre questa soglia nei soggetti sani. La disponibilità amminoacidica è necessaria per sostenere la sintesi proteica muscolare indotta dal carico meccanico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28698222/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "goals": [
                    "Hypertrophy",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_physiol_gundersen_2016",
            "title": "Muscle memory and a new cellular model for sarcopenia and atrophy",
            "authors": "Gundersen, K.",
            "journal": "Journal of Experimental Biology",
            "year": 2016,
            "area": "Fisiologia",
            "abstract": "Presentazione del modello cellulare della memoria muscolare basato sull'acquisizione permanente di mionuclei durante l'ipertrofia. Quando le fibre muscolari vanno incontro ad atrofia per inattività o disuso, i mionuclei acquisiti rimangono intatti all'interno del sincizio muscolare. Ciò consente un rapido ri-apprendimento e ri-accrescimento della massa muscolare quando l'allenamento viene ripreso.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26792335/",
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
            "id": "sci_physiol_tesch_1986",
            "title": "Muscle metabolism during intense resistance exercise",
            "authors": "Tesch, P. A., et al.",
            "journal": "European Journal of Applied Physiology and Occupational Physiology",
            "year": 1986,
            "area": "Fisiologia",
            "abstract": "Caratterizzazione delle risposte metaboliche intramuscolari durante sessioni di allenamento con manubri e bilancieri ad alta intensità. L'esercizio intenso contro resistenza causa una drastica deplezione del glicogeno muscolare e della fosfocreatina, accompagnata da un marcato accumulo di lattato e idrogenioni intracellulari. La risposta glicolitica è essenziale per sostenere le contrazioni ad alto sforzo.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/3770020/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding"
                ],
                "goals": [
                    "Hypertrophy",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_physiol_joyner_2008",
            "title": "Endurance exercise performance: the physiology of champions",
            "authors": "Joyner, M. J., & Coyle, E. F.",
            "journal": "Journal of Physiology",
            "year": 2008,
            "area": "Fisiologia",
            "abstract": "Revisione dei tre principali determinanti fisiologici della prestazione negli sport di endurance: il consumo massimo di ossigeno (VO2max), la percentuale di VO2max sostenibile alla soglia lattacida (LT) e l'efficienza grossolana o economia del movimento (Running/Cycling Economy). L'interazione integrata di questi tre fattori definisce la capacità prestazionale dell'atleta d'élite.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/17991697/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Endurance"
                ],
                "goals": [
                    "Resistenza"
                ]
            }
        },
        {
            "id": "sci_physiol_schoenfeld_freq_2016",
            "title": "Effects of resistance training frequency on measures of muscle hypertrophy: a systematic review and meta-analysis",
            "authors": "Schoenfeld, B. J., Ogborn, D., & Krieger, J. W.",
            "journal": "Sports Medicine",
            "year": 2016,
            "area": "Fisiologia",
            "abstract": "Questa metanalisi esamina l'effetto della frequenza dell'allenamento con i pesi sull'ipertrofia muscolare a parità di volume settimanale. I risultati indicano che allenare un gruppo muscolare due volte a settimana produce una crescita muscolare significativamente superiore rispetto a una sola volta a settimana. Non ci sono evidenze chiare che tre o più sessioni a settimana siano superiori a due. Offre linee guida chiare per la strutturazione della split routine settimanale.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27102424/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "goals": [
                    "Hypertrophy"
                ]
            }
        },
        {
            "id": "sci_physiol_schoenfeld_2015",
            "title": "Effects of low- versus high-load resistance training on muscle strength and hypertrophy in well-trained men",
            "authors": "Schoenfeld, B. J., Peterson, M. D., Ogborn, D., Contreras, B., & Sonmez, G. T.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2015,
            "area": "Fisiologia",
            "abstract": "Studio randomizzato che confronta allenamento a basso carico (25-35 ripetizioni) con alto carico (8-12 ripetizioni) in uomini allenati. Entrambi i protocolli hanno prodotto ipertrofia comparabile, ma il gruppo ad alto carico ha ottenuto guadagni di forza massima significativamente superiori. Conferma che la prossimità al cedimento muscolare, più che il carico assoluto, è il driver primario della risposta ipertrofica.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25853914/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "goals": [
                    "Hypertrophy",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_physiol_damas_2015",
            "title": "A review of resistance training-induced changes in skeletal muscle protein synthesis and their contribution to hypertrophy",
            "authors": "Damas, F., Phillips, S., Vechin, F. C., & Ugrinowitsch, C.",
            "journal": "Sports Medicine",
            "year": 2015,
            "area": "Fisiologia",
            "abstract": "Revisione critica dei meccanismi di sintesi proteica muscolare indotti dall'allenamento con i pesi e del loro contributo all'ipertrofia. Chiarisce che la risposta acuta della sintesi proteica post-esercizio non è sempre proporzionale all'ipertrofia a lungo termine, e che l'adattamento cronico dipende dall'accumulo progressivo di stimoli di sovraccarico meccanico. Essenziale per comprendere la periodizzazione del volume e dell'intensità.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25702468/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "goals": [
                    "Hypertrophy"
                ]
            }
        },
        {
            "id": "sci_physiol_folland_2007",
            "title": "The adaptations to strength training: morphological and neurological contributions to increased strength",
            "authors": "Folland, J. P., & Williams, A. G.",
            "journal": "Sports Medicine",
            "year": 2007,
            "area": "Fisiologia",
            "abstract": "Revisione completa degli adattamenti morfologici e neurologici all'allenamento di forza. Documenta che i guadagni iniziali di forza (prime 4-8 settimane) sono prevalentemente di natura neurale (miglioramento del reclutamento delle unità motorie, sincronizzazione, riduzione della co-contrazione antagonista), mentre gli adattamenti ipertrofici diventano dominanti nelle fasi successive. Fondamentale per la periodizzazione a lungo termine dell'allenamento di forza.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/17241104/",
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
            "id": "sci_physiol_kraemer_2002",
            "title": "Hormonal responses and adaptations to resistance exercise and training",
            "authors": "Kraemer, W. J., & Ratamess, N. A.",
            "journal": "Sports Medicine",
            "year": 2005,
            "area": "Fisiologia",
            "abstract": "Revisione sulle risposte ormonali acute e croniche all'allenamento con sovraccarico. Documenta come testosterone, GH e IGF-1 rispondano in modo dose-dipendente al volume e all'intensità dell'esercizio. Chiarisce che le risposte ormonali acute fungono più da segnali per il rimodellamento tissutale che da driver diretti dell'ipertrofia, e che la programmazione deve considerare il rapporto testosterone/cortisolo come indicatore di stress cumulativo.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/15831061/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "goals": [
                    "Hypertrophy",
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_physiol_hoppeler_2011",
            "title": "Molecular mechanisms of muscle plasticity with exercise",
            "authors": "Hoppeler, H., Baum, O., Lurman, G., & Mueller, M.",
            "journal": "Comprehensive Physiology",
            "year": 2011,
            "area": "Fisiologia",
            "abstract": "Analisi approfondita dei meccanismi molecolari della plasticità muscolare in risposta all'esercizio fisico. Descrive le vie di segnalazione (mTOR, AMPK, PGC-1alpha) che mediano gli adattamenti ipertrofici e mitocondriali, spiegando perché l'allenamento di forza e quello di endurance attivano pathway distinti e talvolta antagonisti (concurrent training interference). Essenziale per la programmazione di programmi misti.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/23728984/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "goals": [
                    "Hypertrophy",
                    "Resistenza"
                ]
            }
        },
        {
            "id": "sci_physiol_behm_2010",
            "title": "Effect of acute static stretching on force, balance, reaction time, and movement time",
            "authors": "Behm, D. G., Bambury, A., Cahill, F., & Power, K.",
            "journal": "Medicine & Science in Sports & Exercise",
            "year": 2004,
            "area": "Fisiologia",
            "abstract": "Studio sugli effetti acuti dello stretching statico sulla forza, l'equilibrio, il tempo di reazione e il tempo di movimento. I risultati dimostrano una riduzione significativa della forza massima e della potenza dopo lo stretching statico prolungato (>60 secondi), senza benefici aggiuntivi per l'equilibrio o il tempo di reazione. Fornisce la base scientifica per evitare lo stretching statico nel riscaldamento pre-gara e preferire protocolli di attivazione dinamica.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/15292746/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "goals": [
                    "Rehab",
                    "Resistenza",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_physiol_wilson_2012",
            "title": "Concurrent training: a meta-analysis examining interference of aerobic and resistance exercises",
            "authors": "Wilson, J. M., Marin, P. J., Rhea, M. R., Wilson, S. M., Loenneke, J. P., & Anderson, J. C.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2012,
            "area": "Fisiologia",
            "abstract": "Metanalisi che quantifica l'interferenza dell'allenamento concorrente (combinazione di esercizio aerobico e di forza). Conferma che l'allenamento aerobico eccessivo compromette i guadagni di forza e potenza, con l'effetto interferenza che aumenta proporzionalmente al volume e alla frequenza dell'attività aerobica. La corsa produce maggiore interferenza rispetto al ciclismo. Fornisce linee guida per minimizzare l'effetto di interferenza nella programmazione periodizzata.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/22002517/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "goals": [
                    "Strength",
                    "Resistenza",
                    "Hypertrophy"
                ]
            }
        },
        {
            "id": "sci_physiol_morton_2015",
            "title": "Nutritional interventions to augment resistance training-induced skeletal muscle hypertrophy",
            "authors": "Morton, R. W., McGlory, C., Phillips, S. M.",
            "journal": "Frontiers in Physiology",
            "year": 2015,
            "area": "Fisiologia",
            "abstract": "Rassegna fisiologica fondamentale sui determinanti cellulari della sintesi proteica muscolare (Muscle Protein Synthesis - MPS) e dell'ipertrofia indotta dall'allenamento con sovraccarichi. Gli autori illustrano il concetto di 'leucine trigger' e saturazione del pathway mTORC1, evidenziando che una dose di proteine ad alto valore biologico contenente ~2.5-3g di leucina (pari a circa 0.3-0.4 g/kg di peso corporeo per pasto) e sufficiente per massimizzare la risposta anabolica post-esercizio. Viene inoltre analizzato il ruolo della distribuzione temporale dell'introito proteico (pasti equi-distanziati ogni 3-4 ore) rispetto a strategie pulsate sbilanciate, fornendo le linee guida nutrizionali e fisiologiche per ottimizzare il bilancio proteico netto positivo durante blocchi ad alto volume di lavoro con carichi.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26388782/",
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
            "id": "sci_physiol_schoenfeld_2013",
            "title": "Potential mechanisms for a role of metabolic stress in hypertrophic adaptations to resistance training",
            "authors": "Schoenfeld, B. J.",
            "journal": "Sports Medicine",
            "year": 2013,
            "area": "Fisiologia",
            "abstract": "Revisione scientifica sistematica che scompone e dettaglia i meccanismi fisiologici attraverso cui lo stress metabolico concorre all'ipertrofia muscolare scheletrica in aggiunta alla tensione meccanica. L'accumulo di sottoprodotti glicolitici anaerobici (lattato, ioni H+, fosfati inorganici) stimola un marcato aumento del reclutamento delle fibre veloci di tipo II per compensare l'affaticamento delle fibre lente, provoca rigonfiamento cellulare (cell swelling con idratazione sarcolamellare che attiva percorsi anabolici MAPK/mTOR) e induce la produzione locale di miokine autocrine e paracrine. Nella periodizzazione dell'ipertrofia, questo giustifica l'alternanza tra mesocicli ad alta tensione meccanica (carichi >80% 1RM) e fasi di accumulo lattacido con carichi moderati (60-70% 1RM, recuperi ridotti o tecniche BFR) per massimizzare la segnalazione ipertrofica globale.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/23338987/",
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
                    "Definition"
                ]
            }
        },
        {
            "id": "sci_physiol_west_2010",
            "title": "Human exercise-mediated skeletal muscle hypertrophy is an intrinsic process",
            "authors": "West, D. W., Burd, N. A., Staples, A. W., Phillips, S. M.",
            "journal": "The International Journal of Biochemistry & Cell Biology",
            "year": 2010,
            "area": "Fisiologia",
            "abstract": "Studio fisiologico fondamentale che confuta la teoria endocrina classica secondo cui i picchi ormonali sistemici transitori post-allenamento (ormone della crescita GH, testosterone totale, IGF-1) guidano l'ipertrofia e la sintesi proteica muscolare. Gli autori dimostrano che la risposta ipertrofica e primariamente un processo intrinseco intramuscolare, regolato dalla meccano-trasduzione focale, dalla tensione sui complessi costamerici e dall'attivazione locale della cascata p70S6K/mTORC1. Ne consegue che non e necessario strutturare le schede di allenamento per ricercare picchi ormonali acuti sistemici (es. schede con tempi di recupero artificialmente brevi), ma bisogna invece ottimizzare il volume settimanale efficace, la prossimita al cedimento (RPE/RIR) e il carico progressivo sul singolo distretto muscolare target.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/20541030/",
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
            "id": "sci_physiol_snijders_2017",
            "title": "Muscle fibre capillarization is a critical factor in muscle fibre hypertrophy during resistance exercise training in older men",
            "authors": "Snijders, T., Nederveen, J. P., Joanisse, S., Leenders, M., Verdijk, L. B., van Loon, L. J., Parise, G.",
            "journal": "Journal of Cachexia, Sarcopenia and Muscle",
            "year": 2017,
            "area": "Fisiologia",
            "abstract": "Studio bioptico innovativo sul ruolo della capillarizzazione basale delle fibre muscolari nell'ipertrofia indotta dal sovraccarico. Gli autori dimostrano che una bassa capillarizzazione delle fibre di tipo II (basso indice capillare per perimetro della fibra - CFPE) inibisce severamente la risposta ipertrofica e la proliferazione delle cellule satellite durante 24 settimane di allenamento con pesi. Al contrario, soggetti con elevata capillarizzazione mostrano aumenti significativi della sezione trasversa (+38% nelle fibre II) e del pool di cellule satellite. Questa scoperta fisiologica evidenzia l'importanza clinica e atletica di inserire blocchi di ricondizionamento aerobico e lavoro a densita lattacida moderata prima dei mesocicli di ipertrofia pura per migliorare l'angiogenesi, la perfusione capillare e la sensibilita anabolica delle fibre.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27897408/",
            "rules": {
                "patientTypes": [
                    "Atleta",
                    "Clinico"
                ],
                "sports": [
                    "Bodybuilding",
                    "Endurance",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Hypertrophy",
                    "Rehab",
                    "Resistenza"
                ]
            }
        },
        {
            "id": "sci_physiol_damas_2018",
            "title": "Early- and later-phases satellite cell responses and myonuclear content with resistance training in young men",
            "authors": "Damas, F., Libardi, C. A., Ugrinowitsch, C., Vechin, F. C., Lixandao, M. E., Snijders, T., Nederveen, J. P., Bacurau, A. V., Brum, P., Tricoli, V., Roschel, H., Parise, G., Phillips, S. M.",
            "journal": "PLoS ONE",
            "year": 2018,
            "area": "Fisiologia",
            "abstract": "Studio longitudinale con biopsie muscolari seriali (1a, 3a e 10a settimana) che chiarifica il ruolo temporale delle cellule satellite (SC) e della sintesi proteica durante le varie fasi dell'allenamento con sovraccarichi. Nelle fasi iniziali (1a settimana), l'attivazione massiva delle cellule satellite e l'elevata sintesi proteica sono primariamente dirette alla riparazione del danno sarcolamellare (EIMD) e non alla crescita netta. Solo dopo l'attenuazione del danno tramite repeated bout effect (dalla 3a-10a settimana), l'espansione del pool delle cellule satellite e la sintesi proteica si traducono in reale ipertrofia miofibrillare. Questa evidenza impone una progressione cauta dei volumi all'inizio dei cicli per non sprecare risorse proteiche ed energetiche nella mera riparazione di microtraumi invalidanti.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29324825/",
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
            "id": "sci_physiol_andersen_2010",
            "title": "Effects of strength training on muscle fiber types and size; consequences for athletes training for high-intensity sport",
            "authors": "Andersen, J. L., Aagaard, P.",
            "journal": "Scandinavian Journal of Medicine & Science in Sports",
            "year": 2010,
            "area": "Fisiologia",
            "abstract": "Pietra miliare sulla plasticita fenotipica delle fibre muscolari scheletriche umane in risposta all'allenamento di forza e al successivo scarico/tapering. L'allenamento pesante induce una rapida transizione delle catene pesanti della miosina (MHC) dalle fibre puramente veloci glicolitiche IIX verso le fibre veloci ossidative IIA, riducendo le frazioni pure di IIX. Tuttavia, durante un periodo di tapering controllato o breve detraining (scarico pre-gara), si verifica un fenomeno di 'overshoot' in cui la proporzione di fibre veloci IIX rimbalza a livelli significativamente superiori rispetto al basale pre-allenamento, accompagnandosi a un picco assoluto di potenza contrattile e velocita di accorciamento. Questo meccanismo cellulare costituisce il fondamento fisiologico della periodizzazione del picco di forma negli sport di potenza e sprint.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/20840560/",
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
            "id": "sci_physiol_coffey_2017",
            "title": "Concurrent exercise training: do opposites distract?",
            "authors": "Coffey, V. G., Hawley, J. A.",
            "journal": "The Journal of Physiology",
            "year": 2017,
            "area": "Fisiologia",
            "abstract": "Analisi magistrale dei meccanismi molecolari alla base dell'effetto interferenza (concurrent training interference effect). L'attivazione contemporanea delle vie dell'endurance mediate da AMPK e PGC-1alpha (stimolate da delezioni di glicogeno e turnover di ATP) puo inibire l'attivazione della via anabolica mTORC1/p70S6K tramite fosforilazione di TSC2 e Raptor, compromettendo l'ipertrofia e lo sviluppo di forza massima. Gli autori identificano finestre temporali critiche e strategie per minimizzare il conflitto intracellulare: distanziare le sessioni di cardio e forza di almeno 6-8 ore, privilegiare forme di condizionamento a basso impatto eccentrico (come il cicloergometro rispetto alla corsa), e assumere carboidrati e aminoacidi per ripristinare il glicogeno e disattivare precocemente il blocco mediato da AMPK.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27506998/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Endurance",
                    "Sport di Squadra",
                    "Bodybuilding",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Strength",
                    "Resistenza",
                    "Hypertrophy"
                ]
            }
        },
        {
            "id": "sci_physiol_bishop_2014",
            "title": "Can we optimise the exercise training prescription to maximise improvements in mitochondria function and content?",
            "authors": "Bishop, D. J., Granata, C., Eynon, N.",
            "journal": "Sports Medicine",
            "year": 2014,
            "area": "Fisiologia",
            "abstract": "Rassegna sistematica sulle risposte di biogenesi mitocondriale in funzione dei parametri di carico (intensita vs volume). L'evidenza dimostra che l'intensita dell'allenamento (es. intervalli sovramassimali HIIT e SIT >90% VO2max) e il primario driver per aumentare la capacita respiratoria mitocondriale intrinseca e l'attivazione acuta di PGC-1alpha via fosforilazione di AMPK e CaMKII. D'altro canto, il volume totale di allenamento (lavoro continuo a bassa/media intensita) e essenziale per incrementare il contenuto mitocondriale complessivo e l'attivita della citrato sintasi. Ne deriva il modello fisiologico di periodizzazione polarizzata: combinare grandi volumi di lavoro a bassa intensita con sessioni selettive di sprint interval training ad altissima intensita per massimizzare sia il contenuto che l'efficienza mitocondriale.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24128929/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Endurance",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Resistenza"
                ]
            }
        },
        {
            "id": "sci_physiol_plews_2013",
            "title": "Training adaptation and heart rate variability in elite endurance athletes: opening the door to effective monitoring",
            "authors": "Plews, D. J., Laursen, P. B., Stanley, J., Kilding, A. E., Buchheit, M.",
            "journal": "Sports Medicine",
            "year": 2013,
            "area": "Fisiologia",
            "abstract": "Lavoro fondamentale sull'impiego della variabilita della frequenza cardiaca (Heart Rate Variability - HRV) per il monitoraggio dell'adattamento autonomico e dello stato di fatica negli atleti. Lo studio identifica nell'indice rMSSD (root mean square of successive differences) log-trasformato e calcolato su medie mobili di 7 giorni il marcatore piu robusto di modulazione parasimpatica cardiaca. Gli autori descrivono le traiettorie dell'HRV: una soppressione cronica di rMSSD segnala sovrallenamento simpatico non compensato, mentre un aumento anomalo associato a bradicardia estrema puo indicare sovrallenamento parasimpatico. L'autoregolazione dei carichi basata su deviazioni standard di rMSSD rispetto alla linea di base individuale previene sindromi da overreaching non funzionale.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/23852425/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Endurance",
                    "Sport di Squadra",
                    "Atletica Leggera"
                ],
                "goals": [
                    "Resistenza",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_physiol_stanley_2013",
            "title": "Cardiac parasympathetic reactivation following exercise: implications for training prescription",
            "authors": "Stanley, J., Peake, J. M., Buchheit, M.",
            "journal": "Sports Medicine",
            "year": 2013,
            "area": "Fisiologia",
            "abstract": "Revisione clinico-fisiologica che esamina la cinetica della riattivazione parasimpatica post-esercizio cardiaco. Lo studio dimostra che l'intensita dell'esercizio, la presenza di acidosi metabolica e la componente di danno muscolare eccentrico prolungano significativamente il tempo necessario al sistema nervoso autonomo per ripristinare il tono vagale (fino a 24-48 ore dopo sessioni intense di sprint o pesi pesanti). Questa comprensione biologica guida la pianificazione dei microcicli: sessioni neurali ad alta intensita o sessioni ad alto stress metabolico devono essere distanziate da almeno 48 ore o intervallate da sessioni rigenerative a bassissima intensita per consentire la ripresa del bilancio autonomo e prevenire accumuli di stress sistemico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/23912805/",
            "rules": {
                "patientTypes": [
                    "Atleta",
                    "Clinico"
                ],
                "sports": [
                    "Endurance",
                    "Sport di Squadra",
                    "Atletica Leggera",
                    "Bodybuilding"
                ],
                "goals": [
                    "Resistenza",
                    "Power",
                    "Rehab"
                ]
            }
        },
        {
            "id": "sci_physiol_hyldahl_2014",
            "title": "Lengthening our perspective: morphological, cellular, and molecular responses to eccentric exercise",
            "authors": "Hyldahl, R. D., Hubal, M. J.",
            "journal": "Sports Medicine",
            "year": 2014,
            "area": "Fisiologia",
            "abstract": "Revisione critica sui processi morfologici, immunitari e cellulari secondari alle contrazioni muscolari eccentriche (danno muscolare indotto dall'esercizio - EIMD). Le contrazioni eccentriche generano deformazione della linea Z, apertura dei canali meccanosensibili dello stiramento e rilascio di citochine pro-infiammatorie (TNF-alfa, IL-6), seguite da infiltrazione di macrofagi e rimodellamento connettivale (fibulina e collagene). Lo studio illustra il meccanismo molecolare del 'repeated bout effect' (RBE), che conferisce protezione sarcolamellare duratura gia dopo una singola esposizione controllata all'esercizio eccentrico. Sul piano pratico, la gradualita dell'introduzione di contrazioni eccentriche ad alto carico protegge l'atleta da indolenzimento prolungato (DOMS) e favorisce la sarcomerogenesi in serie.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24030935/",
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
                ],
                "injuries": [
                    "lesione_muscolare",
                    "hamstring_strain"
                ]
            }
        },
        {
            "id": "sci_physiol_scott_2015",
            "title": "Exercise with blood flow restriction: an updated evidence-based approach for enhanced muscular development",
            "authors": "Scott, B. R., Loenneke, J. P., Slattery, K. M., Dascombe, B. J.",
            "journal": "Sports Medicine",
            "year": 2015,
            "area": "Fisiologia",
            "abstract": "Linee guida metodologiche e fisiologiche per l'applicazione dell'allenamento con occlusione vascolare parziale (Blood Flow Restriction - BFR). L'applicazione di una pressione di occlusione arteriosa parziale (40-80% AOP) combinata con carichi minimi (20-30% 1RM) stimola aumenti di ipertrofia e forza sovrapponibili all'allenamento pesante tradizionale (>70% 1RM). I fattori chiave sono l'accumulo di ioni H+ e lattato in condizioni ipossiche che recluta precocemente le unita motorie a soglia elevata di tipo II, l'attivazione della sintesi proteica e la soppressione della miostatina, senza indurre stress meccanico distruttivo o forze compressive elevate sui tendini e sulle articolazioni. Rappresenta uno strumento di programmazione elettivo per la riabilitazione post-traumatica o per cicli di scarico articolare in atleti agonisti.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25430600/",
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
                ],
                "injuries": [
                    "knee_generic",
                    "post_op_lca",
                    "tendinopatia"
                ]
            }
        },
        {
            "id": "sci_physiol_petrella_2008",
            "title": "Potent myofiber hypertrophy during resistance training in humans is associated with satellite cell-mediated myonuclear addition: a cluster analysis",
            "authors": "Petrella, J. K., Kim, J. S., Mayhew, D. L., Cross, J. M., Bamman, M. M.",
            "journal": "Journal of Applied Physiology",
            "year": 2008,
            "area": "Fisiologia",
            "abstract": "Studio clinico fondamentale che esamina la grande eterogeneita della risposta ipertrofica all'allenamento con sovraccarichi (cluster analysis: extreme responders, moderate responders, non-responders). Gli autori dimostrano che gli 'extreme responders' (con aumenti della sezione trasversa delle fibre fino a oltre il 50%) possiedono una spiccata capacita di espansione del pool di cellule satellite e di incorporazione di nuovi mionuclei (mionuclear accretion), mantenendo costante la dimensione del dominio mionucleare. Nei 'non-responders', l'incapacita di incorporare mionuclei frena l'ipertrofia a lungo termine oltre il tetto biologico del dominio mionucleare esistente. Questa evidenza fisiologica sottolinea la necessita di individualizzare la periodizzazione del volume di lavoro in base alla risposta fenotipica del soggetto.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/18436694/",
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
            "id": "sci_physiol_egan_2016",
            "title": "SnapShot: Exercise Metabolism",
            "authors": "Egan, B., Hawley, J. A., Zierath, J. R.",
            "journal": "Cell Metabolism",
            "year": 2016,
            "area": "Fisiologia",
            "abstract": "Mappatura sintetica e biochimica integrata del metabolismo dell'esercizio fisico a livello molecolare. Il lavoro descrive la modulazione dell'utilizzo dei substrati energetici (glicogenolisi, lipolisi, ossidazione mitocondriale) in funzione dell'intensita e della durata dell'attivita, dettagliando le reti di trasduzione del segnale intracellulare attivate dai flussi di calcio, dal rapporto AMP/ATP e dallo stress ossidativo. Viene illustrata la regolazione incrociata tra pathways anabolici e catabolici che orienta le risposte fenotipiche cellulari a breve e lungo termine. Fornisce un quadro di riferimento molecolare per sincronizzare le strategie di nutrizione e periodizzazione energetica (carico di carboidrati, digiuno intermittente o periodizzazione dei macronutrienti) con i cicli di allenamento metabolico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27508878/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Endurance",
                    "Sport di Squadra",
                    "Atletica Leggera",
                    "Bodybuilding"
                ],
                "goals": [
                    "Resistenza",
                    "Definition",
                    "Hypertrophy"
                ]
            }
        }
    ];

    root.App.Sources.fisiologia = FISIOLOGIA_SOURCES;
    if (typeof window !== 'undefined' && window.App) {
        window.App.Sources = window.App.Sources || {};
        window.App.Sources.fisiologia = FISIOLOGIA_SOURCES;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = root.App.Sources.fisiologia;
    }
})();
