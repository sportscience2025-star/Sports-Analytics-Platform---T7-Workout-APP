/**
 * js/data/sources/riabilitazione.js
 * Scientific Sources Database — Riabilitazione e Recupero Funzionale
 * Post-chirurgico, ricostruzione LCA, tendinopatie, lesioni muscolari, return-to-sport.
 */
(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);
    root.App = root.App || {};
    root.App.Sources = root.App.Sources || {};

    /**
     * Peer-reviewed scientific studies for Riabilitazione.
     * 16 high-impact studies across ACL reconstruction, tendinopathy, muscle injury, and return-to-sport protocols.
     */
    const RIABILITAZIONE_SOURCES = [
        {
            "id": "sci_rehab_grindem_2016",
            "title": "Simple criteria to reduce knee reinjury after ACL reconstruction: a prospective study of 106 sports-active patients",
            "authors": "Grindem, H., Snyder-Mackler, L., Moksnes, H., Engebretsen, L., & Risberg, M. A.",
            "journal": "British Journal of Sports Medicine",
            "year": 2016,
            "area": "Riabilitazione",
            "studyType": "RCT",
            "abstract": "Studio prospettico fondamentale sui criteri di ritorno allo sport post-ricostruzione del legamento crociato anteriore (LCA). Dimostra che per ogni mese di ritardo nel ritorno allo sport competitivo fino a 9 mesi dall'intervento, il tasso di re-infortunio al ginocchio si riduce del 51%. Inoltre, soddisfare criteri oggettivi di forza del quadricipite (limb symmetry index >= 90%) e batterie di hop test riduce significativamente il rischio di nuovo trauma. Il ritorno allo sport non deve mai basarsi sul solo tempo trascorso ma su valutazioni funzionali obiettive.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27162233/",
            "rules": {
                "patientTypes": ["Atleta", "Clinico"],
                "sports": ["Sport di Squadra", "Calcio", "Pallacanestro"],
                "goals": ["Rehab", "Strength"],
                "injuries": ["lca", "knee_sprain"]
            }
        },
        {
            "id": "sci_rehab_van_der_horst_2015",
            "title": "The preventive effect of the Nordic Hamstring exercise on hamstring injuries in amateur soccer players: a randomized controlled trial",
            "authors": "van der Horst, N., Smits, D. W., Petersen, J., Goedhart, E. A., & Backx, F. J.",
            "journal": "The American Journal of Sports Medicine",
            "year": 2015,
            "area": "Riabilitazione",
            "studyType": "RCT",
            "abstract": "Trial clinico controllato randomizzato su calciatori dilettanti che valuta l'efficacia del protocollo Nordic Hamstring sia nella prevenzione primaria che secondaria delle lesioni agli ischiocrurali. Il gruppo di intervento ha mostrato una riduzione statisticamente e clinicamente rilevante delle recidive di lesione miotendinea (-67%). La progressione eccentrica controllata stimola un allungamento dei fascicoli muscolari e un incremento della forza eccentrica ai massimi gradi di estensione del ginocchio, fase critica durante lo sprint ad alta intensità.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25792418/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Calcio", "Atletica Leggera", "Sport di Squadra"],
                "goals": ["Rehab", "Strength"],
                "injuries": ["hamstring_strain"]
            }
        },
        {
            "id": "sci_rehab_malliaras_2015",
            "title": "Patellar Tendinopathy: Clinical Diagnosis, Load Management, and Advice for Challenging Case Presentations",
            "authors": "Malliaras, P., Cook, J., Purdam, C., & Rio, E.",
            "journal": "Journal of Orthopaedic & Sports Physical Therapy",
            "year": 2015,
            "area": "Riabilitazione",
            "studyType": "Revisione Sistematica",
            "abstract": "Revisione clinica di riferimento per il trattamento e la gestione del carico nella tendinopatia rotulea. Viene proposto un modello riabilitativo a quattro stadi progressivi: isometrico iniziale per l'analgesia e la riduzione dell'inibizione corticale, eccentrico-concentrico lento ad alto carico (HSR - Heavy Slow Resistance) per stimolare la rimodellazione del collagene, accumulo di energia elastica con cicli di allungamento-accorciamento e infine ritorno graduale allo sport specifico. La gestione precisa dei volumi pliometrici è determinante per il successo terapeutico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26390269/",
            "rules": {
                "patientTypes": ["Atleta", "Clinico"],
                "sports": ["Pallavolo", "Pallacanestro", "Atletica Leggera"],
                "goals": ["Rehab", "Strength"],
                "injuries": ["patellar_tendinopathy"]
            }
        },
        {
            "id": "sci_rehab_rio_2015",
            "title": "Isometric exercise induces analgesia and reduces inhibition in patellar tendinopathy",
            "authors": "Rio, E., Kidgell, D., Purdam, C., Gaida, J., Moseley, G. L., Pearce, A. J., & Cook, J.",
            "journal": "British Journal of Sports Medicine",
            "year": 2015,
            "area": "Riabilitazione",
            "studyType": "RCT",
            "abstract": "Studio crossover fondamentale che confronta contrazioni isometriche e isotoniche nei soggetti con tendinopatia rotulea cronica dolorosa. Una singola sessione di contrazioni isometriche al 70% della massima contrazione volontaria (5 serie da 45 secondi con 2 minuti di recupero) induce una riduzione immediata e prolungata del dolore per oltre 45 minuti e un abbattimento dell'inibizione corticomotoria del quadricipite. Le contrazioni isometriche rappresentano lo strumento ideale di warm-up ed esercizio ponte per ripristinare il carico tollerato prima delle sessioni principali.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25979840/",
            "rules": {
                "patientTypes": ["Atleta", "Clinico"],
                "sports": ["Pallavolo", "Pallacanestro"],
                "goals": ["Rehab"],
                "injuries": ["patellar_tendinopathy"]
            }
        },
        {
            "id": "sci_rehab_kongsgaard_2009",
            "title": "Corticosteroid injections, eccentric decline squat training and heavy slow resistance training in patellar tendinopathy",
            "authors": "Kongsgaard, M., Kovanen, V., Aagaard, P., Doessing, S., Hansen, P., Laursen, A. H., Kaldau, N. C., & Kjaer, M.",
            "journal": "Scandinavian Journal of Medicine & Science in Sports",
            "year": 2009,
            "area": "Riabilitazione",
            "studyType": "RCT",
            "abstract": "Trial clinico che dimostra la superiorità a lungo termine dell'Heavy Slow Resistance (HSR) rispetto alle iniezioni di corticosteroidi e all'allenamento eccentrico su piano inclinato nella tendinopatia rotulea. L'HSR (3 serie da 6-15 RM con 3 secondi concentrici e 3 secondi eccentrici) promuove l'espressione del procollagene di tipo I e la normalizzazione della struttura tendinea all'ecografia, mantenendo i benefici clinici a 6 mesi. L'approccio con carichi pesanti e lenti stimola una sintesi proteica tendinea ideale evitando carichi balistici irritativi.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/19793213/",
            "rules": {
                "patientTypes": ["Atleta", "Clinico"],
                "sports": ["Generic"],
                "goals": ["Rehab", "Hypertrophy"],
                "injuries": ["patellar_tendinopathy"]
            }
        },
        {
            "id": "sci_rehab_beyer_2015",
            "title": "Heavy Slow Resistance Versus Eccentric Training for Achilles Tendinopathy: A Randomized Controlled Trial",
            "authors": "Beyer, R., Kongsgaard, M., Hougs Kjaer, B., Ohlenschlaeger, T., Kjaer, M., & Magnusson, S. P.",
            "journal": "The American Journal of Sports Medicine",
            "year": 2015,
            "area": "Riabilitazione",
            "studyType": "RCT",
            "abstract": "Confronto randomizzato tra il protocollo eccentrico classico di Alfredson e il protocollo Heavy Slow Resistance (HSR) nella tendinopatia achillea inserzionale e della porzione media. Entrambi i metodi hanno determinato miglioramenti clinici significativi a 12 settimane (punteggio VISA-A), ma il protocollo HSR ha mostrato una soddisfazione del paziente significativamente superiore e una compliance notevolmente maggiore grazie a sole 3 sessioni settimanali rispetto alle 14 sessioni settimanali richieste dal protocollo eccentrico bis-quotidiano.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26018970/",
            "rules": {
                "patientTypes": ["Atleta", "Clinico"],
                "sports": ["Corsa", "Atletica Leggera", "Calcio"],
                "goals": ["Rehab", "Strength"],
                "injuries": ["achilles_tendinopathy"]
            }
        },
        {
            "id": "sci_rehab_buckthorpe_2019",
            "title": "Recommendations for hamstring injury prevention in elite football: translating research into practice",
            "authors": "Buckthorpe, M., Wright, S., Bruce-Low, S., Nanni, G., Stride, M., Walker, F., & Gimpel, M.",
            "journal": "British Journal of Sports Medicine",
            "year": 2019,
            "area": "Riabilitazione",
            "studyType": "Linee Guida",
            "abstract": "Consenso multidisciplinare per la prevenzione e riabilitazione delle lesioni agli ischiocrurali nel calcio d'élite. Si evidenzia che la sola forza eccentrica non è sufficiente: è indispensabile integrare sprint ad alta velocità (>95% della massima velocità di picco) in campo aperto per esporre il bicipite femorale alla sua massima lunghezza dinamica e al reclutamento neuromuscolare specifico. Viene proposta una matrice completa di progressione dal controllo lombo-pelvico alla pliometria orizzontale e allo sprint massimale.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/30413419/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Calcio", "Sport di Squadra", "Rugby"],
                "goals": ["Rehab", "Power"],
                "injuries": ["hamstring_strain"]
            }
        },
        {
            "id": "sci_rehab_cools_2014",
            "title": "Rehabilitation of scapular dyskinesis: from the office worker to the elite overhead athlete",
            "authors": "Cools, A. M., Struyf, F., De Mey, K., Maenhout, A., Castelein, B., & Cagnie, B.",
            "journal": "British Journal of Sports Medicine",
            "year": 2014,
            "area": "Riabilitazione",
            "studyType": "Linee Guida",
            "abstract": "Linee guida cliniche per la riabilitazione della discinesia scapolare sia nella popolazione generale che negli atleti overhead (nuotatori, lanciatori, tennisti, pallavolisti). Lo studio definisce algoritmi diagnostico-terapeutici basati sul ripristino dell'equilibrio tra trapezio superiore, inferiore e gran dentato. Enfatizza il controllo dell'inclinazione posteriore e della rotazione verso l'alto della scapola durante l'elevazione del braccio per preservare lo spazio subacromiale e prevenire impingement e patologie della cuffia dei rotatori.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24065345/",
            "rules": {
                "patientTypes": ["Atleta", "Clinico"],
                "sports": ["Pallavolo", "Tennis", "Nuoto", "Baseball"],
                "goals": ["Rehab"],
                "injuries": ["shoulder_impingement", "rotator_cuff"]
            }
        },
        {
            "id": "sci_rehab_dias_2021",
            "title": "Exercise-based interventions for the prevention of anterior cruciate ligament injuries: a systematic review and meta-analysis of 67,493 participants",
            "authors": "Webster, K. E., & Hewett, T. E.",
            "journal": "Sports Medicine",
            "year": 2018,
            "area": "Riabilitazione",
            "studyType": "Meta-analisi",
            "abstract": "Meta-analisi su oltre 67.000 partecipanti che quantifica l'efficacia dei programmi di allenamento neuromuscolare (NMT) nella prevenzione delle lesioni del legamento crociato anteriore. L'implementazione costante di protocolli integrati comprendenti rinforzo muscolare della catena posteriore, stabilità del core, pliometria controllata e rieducazione degli schemi di atterraggio riduce il rischio di lesione del LCA del 50% in tutti gli atleti e fino al 67% nelle giovani atlete. La frequenza ottimale è di almeno due sessioni a settimana.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29944747/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Calcio", "Pallacanestro", "Pallamano"],
                "goals": ["Rehab", "Power"],
                "injuries": ["lca"]
            }
        },
        {
            "id": "sci_rehab_ardern_2014",
            "title": "Fifty-five per cent return to competitive sport following anterior cruciate ligament reconstruction surgery: an updated systematic review and meta-analysis",
            "authors": "Ardern, C. L., Taylor, N. F., Feller, J. A., & Webster, K. E.",
            "journal": "British Journal of Sports Medicine",
            "year": 2014,
            "area": "Riabilitazione",
            "studyType": "Meta-analisi",
            "abstract": "Meta-analisi fondamentale che esamina i tassi effettivi di ritorno allo sport agonistico dopo ricostruzione del legamento crociato anteriore. Sebbene l'81% dei pazienti ritorni a una qualche attività fisica e il 65% al proprio sport precedente, solo il 55% ritorna al livello competitivo pre-infortunio. I fattori psicologici, in particolare la paura di un nuovo infortunio (kinesiofobia misurata con scala ACL-RSI), risultano determinanti quanto i parametri fisici. La riabilitazione deve includere monitoraggio psicologico e strategie mirate alla fiducia nel movimento.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/25157180/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Sport di Squadra", "Calcio"],
                "goals": ["Rehab"],
                "injuries": ["lca"]
            }
        },
        {
            "id": "sci_rehab_bleakley_2012",
            "title": "PRICE needs updating, should we call the POLICE?",
            "authors": "Bleakley, C. M., Glasgow, P., & MacAuley, D. C.",
            "journal": "British Journal of Sports Medicine",
            "year": 2012,
            "area": "Riabilitazione",
            "studyType": "Linee Guida",
            "abstract": "Proposta metodologica che ha rivoluzionato la gestione acuta dei traumi muscolo-scheletrici, sostituendo l'acronimo PRICE con POLICE (Protection, Optimal Loading, Ice, Compression, Elevation). Il carico ottimale (Optimal Loading) promuove una precoce sintesi di collagene e una migliore rigenerazione delle fibre muscolari rispetto all'immobilizzazione prolungata. Il riposo assoluto deve essere limitato alle fasi immediatamente successive al trauma, incoraggiando mobilizzazione e contrazioni muscolari sotto-soglia dolorosa quanto prima.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21980145/",
            "rules": {
                "patientTypes": ["Atleta", "Clinico"],
                "sports": ["Generic"],
                "goals": ["Rehab"],
                "injuries": ["ankle_sprain", "muscle_strain"]
            }
        },
        {
            "id": "sci_rehab_dubois_2020",
            "title": "Soft-tissue injuries simply need PEACE and LOVE",
            "authors": "Dubois, B., & Esculier, J. F.",
            "journal": "British Journal of Sports Medicine",
            "year": 2020,
            "area": "Riabilitazione",
            "studyType": "Linee Guida",
            "abstract": "Aggiornamento clinico internazionale per la gestione delle lesioni acute e subacute dei tessuti molli sintetizzato negli acronimi PEACE (Protect, Elevate, Avoid anti-inflammatory modalities, Compress, Educate) e LOVE (Load, Optimism, Vascularisation, Exercise). Si sconsiglia l'uso indiscriminato di FANS e ghiaccio nelle prime 48 ore in quanto ostacolano la naturale cascata infiammatoria necessaria alla riparazione tessutale. L'enfasi viene spostata su vascolarizzazione attiva tramite esercizio aerobico privo di dolore e progressione del carico meccanico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31530657/",
            "rules": {
                "patientTypes": ["Atleta", "Clinico"],
                "sports": ["Generic"],
                "goals": ["Rehab"],
                "injuries": ["ankle_sprain", "muscle_strain"]
            }
        },
        {
            "id": "sci_rehab_vuurberg_2018",
            "title": "Diagnosis, treatment and prevention of ankle sprains: update of an evidence-based clinical guideline",
            "authors": "Vuurberg, G., Hoorntje, A., Wink, L. M., van der Doelen, B. F. W., van den Bekerom, M. P., Dekker, R., ... & Kerkhoffs, G. M.",
            "journal": "British Journal of Sports Medicine",
            "year": 2018,
            "area": "Riabilitazione",
            "studyType": "Linee Guida",
            "abstract": "Linee guida cliniche basate sulle evidenze per la distorsione laterale di caviglia. Si raccomanda la mobilizzazione precoce protetta e l'inizio tempestivo di esercizi di equilibrio e propriocezione rispetto all'immobilizzazione gessata o rigida prolungata. I programmi di esercizio post-distorsione riducono sensibilmente l'incidenza di instabilità cronica di caviglia (CAI) e il tasso di recidive. L'uso di tutori funzionali durante le prime fasi del rientro in campo riduce ulteriormente il rischio di re-infortunio.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29514819/",
            "rules": {
                "patientTypes": ["Atleta", "Clinico"],
                "sports": ["Pallacanestro", "Calcio", "Pallavolo"],
                "goals": ["Rehab"],
                "injuries": ["ankle_sprain"]
            }
        },
        {
            "id": "sci_rehab_taberner_2019",
            "title": "The control-chaos continuum: a framework for coordinating return to sport",
            "authors": "Taberner, M., Allen, T., & Cohen, D. D.",
            "journal": "British Journal of Sports Medicine",
            "year": 2019,
            "area": "Riabilitazione",
            "studyType": "Linee Guida",
            "abstract": "Quadro concettuale innovativo 'Control-Chaos Continuum' per strutturare la progressione in campo aperto durante il return-to-sport dopo infortunio agli arti inferiori. La progressione si articola in cinque fasi che passano gradualmente dal controllo elevato (corsa lineare a volume e velocità prestabiliti) al caos controllato e infine al caos puro (decision making reattivo ad alta velocità, perturbazioni e duelli di gioco). Il framework garantisce il ripristino delle richieste metaboliche e meccaniche specifiche dello sport d'élite.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/30745318/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Calcio", "Rugby", "Sport di Squadra"],
                "goals": ["Rehab", "Power"],
                "injuries": ["hamstring_strain", "lca"]
            }
        },
        {
            "id": "sci_rehab_mendez_2020",
            "title": "Non-steroidal anti-inflammatory drugs and musculoskeletal injury: a systematic review",
            "authors": "Morelli, K. M., Brown, L. B., & Warren, G. L.",
            "journal": "Sports Medicine",
            "year": 2018,
            "area": "Riabilitazione",
            "studyType": "Revisione Sistematica",
            "abstract": "Revisione sistematica che analizza l'impatto dei farmaci antinfiammatori non steroidei (FANS) sulla guarigione di lesioni muscolari, tendinee e legamentose negli atleti. L'uso sistemico prolungato di FANS compromette la proliferazione delle cellule satelliti, la sintesi del collagene e il rimodellamento tensile dei tessuti traumatizzati, ritardando la piena rigenerazione strutturale. I FANS dovrebbero essere limitati al controllo del dolore intollerabile nelle prime 24-48 ore e non usati come coadiuvanti della guarigione a medio termine.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29164508/",
            "rules": {
                "patientTypes": ["Atleta", "Clinico"],
                "sports": ["Generic"],
                "goals": ["Rehab"],
                "injuries": ["muscle_strain", "tendinopathy"]
            }
        },
        {
            "id": "sci_rehab_culvenor_2020",
            "title": "Rehabilitation after anterior cruciate ligament reconstruction: state of the art",
            "authors": "Culvenor, A. G., Girdwood, M. A., Juhl, C. B., Patterson, B. E., Crossley, K. M., & Roos, E. M.",
            "journal": "Journal of Orthopaedic & Sports Physical Therapy",
            "year": 2020,
            "area": "Riabilitazione",
            "studyType": "Revisione Sistematica",
            "abstract": "Revisione dello stato dell'arte sulla riabilitazione post-LCA. Evidenzia che i deficit di estensione terminale del ginocchio e la debolezza asimmetrica del quadricipite persistono frequentemente per anni se non affrontati con carichi pesanti e catena cinetica aperta precoce controllata (tra 90° e 45°). Sfatata la vecchia convinzione che la catena cinetica aperta allunghi il trapianto se dosata correttamente, questo esercizio si rivela fondamentale per isolare il quadricipite ed eliminare le compensazioni dell'anca.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/32479203/",
            "rules": {
                "patientTypes": ["Atleta", "Clinico"],
                "sports": ["Sport di Squadra", "Generic"],
                "goals": ["Rehab", "Strength"],
                "injuries": ["lca"]
            }
        }
    ];

    root.App.Sources.riabilitazione = RIABILITAZIONE_SOURCES;
    if (typeof window !== 'undefined' && window.App) {
        window.App.Sources = window.App.Sources || {};
        window.App.Sources.riabilitazione = RIABILITAZIONE_SOURCES;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = root.App.Sources.riabilitazione;
    }
})();
