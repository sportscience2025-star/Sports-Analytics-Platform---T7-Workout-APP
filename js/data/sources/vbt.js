/**
 * js/data/sources/vbt.js
 * Scientific Sources Database — VBT (Velocity-Based Training)
 * Linear encoders, mean propulsive velocity, velocity loss thresholds, 1RM prediction, and autoregulation.
 */
(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);
    root.App = root.App || {};
    root.App.Sources = root.App.Sources || {};

    /**
     * Peer-reviewed scientific studies for VBT.
     * Contains 28 sources (13 baseline + 15 specialized studies).
     */
    const VBT_SOURCES = [
        {
            "id": "sci_vbt_badillo_2010",
            "title": "Movement velocity as a measure of loading intensity in resistance training",
            "authors": "González-Badillo, J. J., & Sánchez-Medina, L.",
            "journal": "International Journal of Sports Medicine",
            "year": 2010,
            "area": "VBT",
            "abstract": "Studio cardine che definisce la relazione estremamente precisa tra la velocità della prima ripetizione concentrica e la percentuale reale di 1RM nello squat e in altri esercizi con bilanciere. Dimostra che la velocità di esecuzione consente di monitorare con precisione l'intensità di carico reale in tempo reale, evitando test ad esaurimento potenzialmente infortunistici.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/20146162/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra",
                    "Atletica Leggera",
                    "Endurance",
                    "Calcio",
                    "Basketball"
                ],
                "goals": [
                    "Strength",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_vbt_sanchez_2011",
            "title": "Velocity loss as an indicator of neuromuscular fatigue during resistance training",
            "authors": "Sánchez-Medina, L., & González-Badillo, J. J.",
            "journal": "Medicine & Science in Sports & Exercise",
            "year": 2011,
            "area": "VBT",
            "abstract": "Dimostra che la percentuale di perdita di velocità all'interno di una serie è fortemente correlata alla fatica neuromuscolare e all'accumulo di lattato e ammoniaca nel sangue. Controllare la perdita di velocità (es. fermando la serie al 10-20% di calo) consente di stimolare la forza e la potenza evitando l'eccessivo affaticamento e i lunghi tempi di recupero richiesti dalle serie a cedimento.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/20689453/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra",
                    "Atletica Leggera",
                    "Endurance",
                    "Calcio",
                    "Basketball"
                ],
                "goals": [
                    "Strength",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_vbt_pareja_2017",
            "title": "Effects of velocity loss during resistance training on athletic performance, strength, and muscle hypertrophy",
            "authors": "Pareja-Blanco, F., Rodríguez-Rosell, D., Sánchez-Medina, L., Sanchis-Moysi, J., Dorado, C., Mora-Custodio, R., Yáñez-García, J. M., Morales-Alamo, D., Calbet, J. A. L., & González-Badillo, J. J.",
            "journal": "Medicine & Science in Sports & Exercise",
            "year": 2017,
            "area": "VBT",
            "abstract": "Confronta gli adattamenti prodotti da perdite di velocità basse (30% vs 20% vs 40%) durante l'allenamento di forza. Dimostra che perdite di velocità inferiori (20%) inducono miglioramenti superiori o uguali nella forza massima e nei salti, preservando la proporzione di fibre veloci IIx, mentre il 40% causa maggiore ipertrofia ma trasforma le fibre veloci in intermedie.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27845943/",
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
            "id": "sci_vbt_weakley_2021",
            "title": "Velocity-Based Training: From Theory to Application",
            "authors": "Weakley, J., Mann, B., Banyard, H., McLaren, S., Scott, T., & Garcia-Ramos, A.",
            "journal": "Sports Medicine",
            "year": 2021,
            "area": "VBT",
            "abstract": "Guida metodologica e review completa sull'applicazione pratica del Velocity-Based Training (VBT) nello sport di alto livello. Delinea le zone di velocità target per le diverse qualità (forza massima, forza accelerativa, potenza, velocità), la regolazione automatica del carico giornaliero (autoregulation) e il feedback in tempo reale per motivare l'atleta.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33433845/",
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
            "id": "sci_vbt_garcia_2018",
            "title": "The Force-Velocity Relationship in Resistance Exercises: Technical Aspects and Methodology",
            "authors": "García-Ramos, A., & Jaric, S.",
            "journal": "Sports Biomechanics",
            "year": 2018,
            "area": "VBT",
            "abstract": "Review metodologica sulla valutazione della relazione forza-velocità negli esercizi contro resistenza con bilanciere. Valida l'uso di metodi a 2 carichi (two-point method) rispetto a profilazioni multi-carico per determinare in modo rapido e accurato la forza massima teorica (F0) e la velocità massima teorica (V0) dell'atleta in palestra.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29092658/",
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
            "id": "sci_vbt_dorrell_2020",
            "title": "Comparison of velocity-based and traditional percentage-based loading methods on maximal strength and power adaptations",
            "authors": "Dorrell, H. F., Smith, M. F., & Sheridan, G. J.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2020,
            "area": "VBT",
            "abstract": "Confronto diretto tra VBT e allenamento basato su percentuali tradizionali. I risultati dimostrano che il gruppo VBT ha ottenuto miglioramenti comparabili in forza massima e potenza, ma con un volume totale di lavoro significativamente inferiore. Questo suggerisce che l'autoregolazione tramite velocità permette di raggiungere adattamenti ottimali con meno fatica accumulata, riducendo il rischio di sovrallenamento.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31009432/",
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
            "id": "sci_vbt_jovanovic_2014",
            "title": "The load-velocity relationship in the back squat: individualized vs. generalized load-velocity profiles",
            "authors": "Jovanovic, M., & Flanagan, E. P.",
            "journal": "International Journal of Sports Physiology and Performance",
            "year": 2014,
            "area": "VBT",
            "abstract": "Studio fondamentale che confronta i profili carico-velocità individuali con quelli generalizzati nello squat. I risultati dimostrano che i profili individualizzati predicono con maggiore accuratezza il 1RM rispetto alle equazioni generalizzate. Questo ha implicazioni pratiche dirette per la programmazione VBT: raccogliere dati individuali migliora significativamente la precisione della prescrizione del carico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24809472/",
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
            "id": "sci_vbt_gonzalez_2017",
            "title": "Predictive accuracy of the load-velocity relationship for bench press",
            "authors": "Gonzalez-Badillo, J. J., & Sanchez-Medina, L.",
            "journal": "International Journal of Sports Medicine",
            "year": 2010,
            "area": "VBT",
            "abstract": "Studio pioneristico che stabilisce la relazione carico-velocità nella panca piana, dimostrando che la velocità di esecuzione è un predittore altamente affidabile dell'intensità relativa (%1RM). La velocità media propulsiva decresce linearmente con l'aumento del carico relativo. Questa relazione consente di stimare il 1RM senza test massimali, riducendo i rischi per l'atleta.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/20024937/",
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
            "id": "sci_vbt_banyard_2017",
            "title": "The reliability of individualized load-velocity profiles in the free-weight back squat",
            "authors": "Banyard, H. G., Nosaka, K., & Haff, G. G.",
            "journal": "International Journal of Sports Physiology and Performance",
            "year": 2017,
            "area": "VBT",
            "abstract": "Analisi sull'affidabilità dei profili carico-velocità individuali nello squat libero. I risultati confermano un'elevata ripetibilità test-retest dei profili individuali, validando l'uso della velocità come strumento quotidiano di monitoraggio del carico. Il profilo individuale risulta stabile nel breve termine ma necessita di aggiornamenti periodici per riflettere i progressi di forza dell'atleta.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27633948/",
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
            "id": "sci_vbt_perez_2020",
            "title": "Effects of different velocity loss thresholds on passive recovery time",
            "authors": "Perez-Castilla, A., Piepoli, A., Delgado-Garcia, G., Garrido-Blanca, G., & Garcia-Ramos, A.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2020,
            "area": "VBT",
            "abstract": "Indaga l'effetto di diverse soglie di perdita di velocità (10%, 20%, 30%, 40%) sul tempo di recupero necessario tra le serie. Soglie più basse (10-20%) permettono un recupero completo in tempi significativamente inferiori, confermando che limitare la perdita di velocità intra-serie riduce la fatica neuromuscolare accumulata e consente sessioni con maggiore qualità meccanica complessiva.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/30946269/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "goals": [
                    "Strength",
                    "Power",
                    "Hypertrophy"
                ]
            }
        },
        {
            "id": "sci_vbt_mann_2015",
            "title": "Velocity-based training in football",
            "authors": "Mann, J. B., Ivey, P. A., & Sayers, S. P.",
            "journal": "Strength and Conditioning Journal",
            "year": 2015,
            "area": "VBT",
            "abstract": "Applicazione pratica del VBT nel football americano di Division I NCAA. Lo studio documenta come l'implementazione di soglie di velocità per regolare il carico giornaliero abbia prodotto miglioramenti significativi nella forza massima e nella potenza esplosiva degli atleti, superando i risultati ottenuti con metodi tradizionali basati su percentuali nel periodo precedente.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26197614/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Sport di Squadra",
                    "Calcio"
                ],
                "goals": [
                    "Strength",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_vbt_conceicao_2016",
            "title": "Movement velocity as a measure of exercise intensity in three lower limb exercises",
            "authors": "Conceicao, F., Fernandes, J., Lewis, M., Gonzalez-Badillo, J. J., & Jimenez-Reyes, P.",
            "journal": "Journal of Sports Sciences",
            "year": 2016,
            "area": "VBT",
            "abstract": "Valida l'uso della velocità di movimento come misura dell'intensità in squat, hip thrust e leg press. Conferma che la relazione carico-velocità è specifica per ogni esercizio e che le equazioni predittive devono essere calibrate separatamente. Per una programmazione VBT accurata, è essenziale costruire profili carico-velocità esercizio-specifici anziché utilizzare tabelle universali.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26732397/",
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
            "id": "sci_vbt_thompson_2023",
            "title": "Velocity-based training: a systematic review and meta-analysis",
            "authors": "Thompson, S. W., Rogerson, D., Dorrell, H. F., Ruddock, A., & Barnes, A.",
            "journal": "Sports Medicine",
            "year": 2023,
            "area": "VBT",
            "abstract": "Metanalisi sistematica che sintetizza le evidenze sull'efficacia del VBT rispetto ai metodi tradizionali. I risultati mostrano che il VBT produce adattamenti di forza e potenza almeno equivalenti, con il vantaggio aggiuntivo di una migliore gestione della fatica e della possibilità di autoregolare il carico in tempo reale sulla base della readiness giornaliera dell'atleta.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/36399261/",
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
            "id": "sci_vbt_balsalobre_2018_app",
            "title": "Validity and reliability of a novel iPhone app for the measurement of barbell velocity and 1RM on the bench-press exercise",
            "authors": "Balsalobre-Fernandez, C., Marchante, D., Baz-Valle, E., Alonso-Molero, I., Jimenez, S. L., & Munoa, M.",
            "journal": "Journal of Sports Sciences",
            "year": 2018,
            "area": "VBT",
            "abstract": "Validazione scientifica dell'applicazione mobile PowerLift rispetto al trasduttore di posizione lineare (gold standard). Lo studio dimostra una correlazione quasi perfetta (r = 0.94, bias medio trascurabile) per la misurazione della velocita' media propulsiva (MPV) e per la stima dell'1RM nella panca piana. Permette ai preparatori di implementare il Velocity-Based Training sul campo senza costosa strumentazione di laboratorio, garantendo l'autoregolazione quotidiana del carico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28098522/",
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
            "id": "sci_vbt_balsalobre_2016_push",
            "title": "Validity and Reliability of the PUSH Wearable Device to Measure Movement Velocity During the Back Squat Exercise",
            "authors": "Balsalobre-Fernandez, C., Kuzdub, M., Poveda-Ortiz, P., & del Campo-Vecino, J.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2016,
            "area": "VBT",
            "abstract": "Studio di validazione e affidabilita' dell'accelerometro indossabile (PUSH band) per il monitoraggio della velocita' media e di picco durante il back squat. Il dispositivo ha mostrato elevata concordanza con il trasduttore lineare (ICC > 0.85), sebbene presenti una leggera tendenza alla sovrastima alle velocita' piu' basse. I dati supportano l'uso pratico di sensori inerziali per monitorare l'intento di massima velocita' esecutiva e prevenire la fatica eccessiva nelle sessioni di squat.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26670993/",
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
            "id": "sci_vbt_garcia_ramos_2023_twopoint",
            "title": "The 2-Point Method: Theoretical Basis, Methodological Considerations, Experimental Support, and Its Application Under Field Conditions",
            "authors": "Garcia-Ramos, A., & Jaric, S.",
            "journal": "International Journal of Sports Physiology and Performance",
            "year": 2023,
            "area": "VBT",
            "abstract": "Sintesi metodologica e teorica del 'metodo a due punti' per determinare la relazione carico-velocita' e stimare l'1RM. Gli autori dimostrano che testare due soli carichi distanziati (uno leggero a ~45% 1RM e uno pesante a ~80-85% 1RM) produce un'accuratezza predittiva indistinguibile dai protocolli esaustivi a 5-6 carichi, eliminando la fatica accumulata e abbreviando il tempo di testing. Rappresenta l'approccio piu' efficiente per il monitoraggio continuativo nel VBT.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/37541677/",
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
            "id": "sci_vbt_pareja_blanco_2020_critical",
            "title": "Velocity Loss as a Critical Variable Determining the Adaptations to Strength Training",
            "authors": "Pareja-Blanco, F., Alcazar, J., Sanchez-Valdepenas, J., Cornejo-Daza, P. J., Piqueras-Sanchiz, F., Mora-Vela, R., Sanchez-Moreno, M., Bachero-Mena, B., Ortega-Becerra, M., & Alegre, L. M.",
            "journal": "Medicine & Science in Sports & Exercise",
            "year": 2020,
            "area": "VBT",
            "abstract": "Studio di riferimento che isola la perdita di velocita' intra-serie (VL: 0%, 10%, 20%, 40%) come variabile indipendente nel controllo degli adattamenti all'allenamento della forza. Soglie di perdita di velocita' basse o moderate (10-20% VL) massimizzano l'ipertrofia funzionale, la preservazione delle fibre veloci IIX e l'incremento di potenza esplosiva e salto verticale, mentre soglie elevate (40% VL o cedimento) provocano eccessivo stress metabolico, affaticamento neuromuscolare prolungato e conversione delle fibre veloci in forme piu' lente.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/32049887/",
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
            "id": "sci_vbt_pareja_blanco_2020_bench",
            "title": "Effects of velocity loss in the bench press exercise on strength gains, neuromuscular adaptations, and muscle hypertrophy",
            "authors": "Pareja-Blanco, F., Alcazar, J., Cornejo-Daza, P. J., Sanchez-Valdepenas, J., Rodriguez-Lopez, C., Hidalgo-de Mora, J., Sanchez-Moreno, M., Bachero-Mena, B., Alegre, L. M., & Ortega-Becerra, M.",
            "journal": "Scandinavian Journal of Medicine & Science in Sports",
            "year": 2020,
            "area": "VBT",
            "abstract": "Valutazione degli adattamenti di forza, ipertrofia del pettorale e attivita' elettromiografica in risposta a quattro soglie di perdita di velocita' nella panca piana (0%, 15%, 25%, 50% VL). La soglia al 15% VL ha prodotto i migliori adattamenti nell'attivazione neuromuscolare e nel rate of force development (RFD precoce) con meta' delle ripetizioni totali rispetto al 50% VL. La soglia al 50% VL ha massimizzato l'ipertrofia strutturale del gran pettorale a scapito pero' della velocita' di contrazione balistica.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/32681665/",
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
                    "Hypertrophy",
                    "Power"
                ]
            }
        },
        {
            "id": "sci_vbt_weakley_2019_feedback",
            "title": "Visual feedback attenuates mean concentric barbell velocity loss and improves motivation, competitiveness, and perceived workload in male adolescent athletes",
            "authors": "Weakley, J. J. S., Wilson, K. M., Till, K., Read, D. B., Darrall-Jones, J., Roe, G. A. B., Phibbs, P. J., & Jones, B.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2019,
            "area": "VBT",
            "abstract": "Indagine sull'effetto acuto del feedback visivo istantaneo della velocita' del bilanciere durante serie di squat. Gli atleti che hanno ricevuto feedback numerico in tempo reale dopo ogni ripetizione hanno mostrato una significativa attenuazione della perdita di velocita' intra-serie, una maggiore velocita' media concentrica (+6-9%) e livelli significativamente piu' elevati di motivazione e competitivita' rispetto al gruppo di controllo senza feedback. Convalida il ruolo psicologico e neuromuscolare del biofeedback nel VBT.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28704314/",
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
            "id": "sci_vbt_pearson_2020_thresholds",
            "title": "Velocity Loss Thresholds Reliably Control Kinetic and Kinematic Outputs during Free Weight Resistance Training",
            "authors": "Pearson, M., Garcia-Ramos, A., Morrison, M., Ramirez-Lopez, C., Dalton-Barron, N., & Weakley, J.",
            "journal": "International Journal of Environmental Research and Public Health",
            "year": 2020,
            "area": "VBT",
            "abstract": "Studio di riproducibilita' tra sessioni delle soglie di perdita di velocita' (10%, 20%, 30% VLT) nello squat libero. I risultati confermano che le uscite cinetiche e cinematiche (velocita' media, potenza di picco e lavoro totale per ripetizione) sono altamente stabili e riproducibili quando le serie vengono interrotte in base alla velocita', nonostante il numero di ripetizioni completate vari significativamente tra le sessioni per effetto della fatica fluttuante dell'atleta. Dimostra la superiorita' del VBT rispetto alle serie a ripetizioni fisse.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/32906825/",
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
            "id": "sci_vbt_rodriguez_rosell_2018_effort",
            "title": "Effort Index as a Novel Variable for Monitoring the Level of Effort During Resistance Exercises",
            "authors": "Rodriguez-Rosell, D., Yanez-Garcia, J. M., Sanchez-Medina, L., Mora-Custodio, R., & Gonzalez-Badillo, J. J.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2018,
            "area": "VBT",
            "abstract": "Introduzione e validazione dell'Indice di Sforzo (Effort Index, EI), una metrica composita che moltiplica la velocita' della prima ripetizione per la percentuale di perdita di velocita' nella serie. L'EI ha dimostrato correlazioni quasi perfette (r = 0.91-0.95) con la concentrazione ematica di lattato e con la perdita di altezza nel salto verticale post-allenamento. L'Indice di Sforzo consente ai coach di quantificare con precisione matematica lo stress metabolico e neuromuscolare interno senza necessita' di prelievi ematici invasivi.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29781942/",
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
            "id": "sci_vbt_garcia_ramos_2021_mvt",
            "title": "Bench Press 1-Repetition Maximum Estimation Through the Individualized Load-Velocity Relationship: Comparison of Different Regression Models and Minimal Velocity Thresholds",
            "authors": "Garcia-Ramos, A., Pestana-Melero, F. L., Perez-Castilla, A., Rojas, F. J., & Haff, G. G.",
            "journal": "International Journal of Sports Physiology and Performance",
            "year": 2021,
            "area": "VBT",
            "abstract": "Confronto tra modelli di regressione lineare e polinomiale e diverse soglie di velocita' minima (Minimal Velocity Threshold, MVT: individualizzata vs fissa a ~0.17 m/s) per la stima dell'1RM nella panca piana. L'uso di un modello lineare combinato con l'MVT individualizzata o standardizzata a 0.17 m/s fornisce una stima accurata dell'1RM (errore tipico < 3.5%), confermando che la velocita' all'1RM e' una caratteristica fisiologica altamente stabile nell'atleta allenato.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33771947/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_vbt_banyard_2017_validity",
            "title": "Reliability and Validity of the Load-Velocity Relationship to Predict the 1RM Back Squat",
            "authors": "Banyard, H. G., Nosaka, K., & Haff, G. G.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2017,
            "area": "VBT",
            "abstract": "Valutazione critica dell'accuratezza della predizione dell'1RM nel back squat libero tramite la curva carico-velocita'. Gli autori riscontrano una variabilita' inter-individuale nella velocita' all'1RM (compresa tra 0.25 e 0.38 m/s), suggerendo cautela nell'applicare soglie fisse universali per lo squat libero rispetto alla panca piana o alla Smith Machine. Lo studio raccomanda di calibrare regolarmente il profilo individuale dell'atleta per evitare errori di prescrizione del carico di lavoro.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27669192/",
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
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_vbt_pareja_blanco_2017_scand",
            "title": "Effects of velocity loss during resistance training on athletic performance, strength gains and muscle adaptations",
            "authors": "Pareja-Blanco, F., Rodriguez-Rosell, D., Sanchez-Medina, L., Gorostiaga, E. M., & Gonzalez-Badillo, J. J.",
            "journal": "Scandinavian Journal of Medicine & Science in Sports",
            "year": 2017,
            "area": "VBT",
            "abstract": "Confronto tra un protocollo con perdita di velocita' del 20% (VL20) e uno con perdita del 40% (VL40) nello squat su atleti. Il gruppo VL20 ha ottenuto guadagni di forza massimale identici al VL40 e miglioramenti tripli nell'altezza di salto CMJ (+9.5% vs +3.5%), eseguendo il 40% in meno di ripetizioni totali. L'analisi bioptica ha evidenziato che il protocollo VL40 ha provocato una conversione sfavorevole delle fibre veloci MHC-IIX in IIA, provando che la fatica non necessaria compromette l'esplosivita' muscolare.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27038416/",
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
            "id": "sci_vbt_perez_castilla_2021_pulling",
            "title": "Validity of Different Velocity-Based Methods and Repetitions-to-Failure Equations for Predicting the 1 Repetition Maximum During 2 Upper-Body Pulling Exercises",
            "authors": "Perez-Castilla, A., Garcia-Ramos, A., Padial, P., Morales-Artacho, A. J., & Feriche, B.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2021,
            "area": "VBT",
            "abstract": "Studio sulla validita' predittiva del VBT e delle equazioni di ripetizioni a cedimento nel prone bench pull e nelle trazioni alla sbarra. I metodi basati sulla velocita' (in particolare il metodo a carico multiplo e il metodo a due punti) hanno mostrato un errore di stima significativamente inferiore rispetto alle equazioni basate sulle ripetizioni a cedimento, confermando l'applicabilita' e la superiorita' del monitoraggio cinematico anche negli esercizi di tirata per la parte superiore del corpo.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/30741875/",
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
            "id": "sci_vbt_tillaar_2010_sticking",
            "title": "The 'sticking period' in a maximum bench press",
            "authors": "van den Tillaar, R., & Ettema, G.",
            "journal": "Journal of Sports Sciences",
            "year": 2010,
            "area": "VBT",
            "abstract": "Analisi cinematica ed elettromiografica del 'punto critico' o 'sticking region' nella panca piana massimale. La decelerazione della sbarra ha inizio a circa 5-7 cm dal petto e raggiunge la minima velocita' a circa 12-15 cm, corrispondente a una configurazione geometrica svantaggiosa dei bracci di leva articolari e ad una riduzione del potenziamento elastico iniziale. La misurazione della velocita' attraverso il passaggio del punto critico e' il parametro cardine per identificare l'MVT e programmare esercizi parziali di sblocco.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/20373201/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Strength"
                ]
            }
        },
        {
            "id": "sci_vbt_orange_2022_meta",
            "title": "Comparison of the effects of velocity-based vs. traditional resistance training methods on adaptations in strength, power, and sprint speed: A systematic review, meta-analysis, and quality of evidence appraisal",
            "authors": "Orange, S. T., Metcalfe, J. W., Robinson, A., Applegarth, P. J., & Liefeith, A.",
            "journal": "Journal of Sports Sciences",
            "year": 2022,
            "area": "VBT",
            "abstract": "Meta-analisi esaustiva di trial controllati randomizzati che confronta l'allenamento basato sulla velocita' rispetto alla prescrizione tradizionale a percentuali fisse dell'1RM (%1RM). Il VBT si dimostra superiore nel migliorare la prestazione di salto verticale (SMD = 0.36) e la velocita' di sprint, con guadagni equivalenti o superiori nella forza massimale (1RM) ma con un volume totale di sollevamento marcatamente inferiore. Dimostra una maggiore efficienza temporale e minore affaticamento cronico per gli atleti.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/35380511/",
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
            "id": "sci_vbt_jidovtseff_2011_prediction",
            "title": "Using the load-velocity relationship for 1RM prediction",
            "authors": "Jidovtseff, B., Harris, N. K., Crielaard, J. M., & Cronin, J. B.",
            "journal": "Journal of Strength and Conditioning Research",
            "year": 2011,
            "area": "VBT",
            "abstract": "Studio fondamentale che ha introdotto l'estrapolazione lineare della relazione carico-velocita' per la stima dell'1RM senza giungere al cedimento concentrico. Analizzando le velocita' medie e di picco a carichi progressivi, gli autori hanno rilevato una correlazione r = 0.95 tra il carico teorico estrapolato a velocita' zero/minima e l'1RM reale nella panca piana. L'approccio riduce il rischio di infortuni da sovraccarico massimale acuto e consente una valutazione continua della forma fisica.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/19966589/",
            "rules": {
                "patientTypes": [
                    "Atleta"
                ],
                "sports": [
                    "Bodybuilding",
                    "Sport di Squadra"
                ],
                "goals": [
                    "Strength"
                ]
            }
        }
    ];

    root.App.Sources.vbt = VBT_SOURCES;
    if (typeof window !== 'undefined' && window.App) {
        window.App.Sources = window.App.Sources || {};
        window.App.Sources.vbt = VBT_SOURCES;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = root.App.Sources.vbt;
    }
})();
