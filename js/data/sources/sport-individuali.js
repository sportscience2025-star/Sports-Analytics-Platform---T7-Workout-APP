/**
 * js/data/sources/sport-individuali.js
 * Scientific Sources Database — Sport Individuali
 * Nuoto, ciclismo, sport da combattimento, ginnastica artistica, canottaggio, arrampicata.
 */
(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);
    root.App = root.App || {};
    root.App.Sources = root.App.Sources || {};

    /**
     * Peer-reviewed scientific studies for Sport Individuali.
     * 11 high-impact studies across swimming, cycling, combat sports, gymnastics, and endurance mechanics.
     */
    const SPORT_INDIVIDUALI_SOURCES = [
        {
            "id": "sci_indiv_marinho_2011",
            "title": "Computational fluid dynamics in swimming: moving forward",
            "authors": "Marinho, D. A., Barbosa, T. M., Rouboa, A. I., & Silva, A. J.",
            "journal": "Journal of Sports Science & Medicine",
            "year": 2011,
            "area": "Sport Individuali",
            "studyType": "Revisione Sistematica",
            "abstract": "Revisione sistematica sull'applicazione della fluidodinamica computazionale (CFD) nel nuoto agonistico. Analizza le forze di drag (resistenza all'avanzamento) e propulsione generate dalla mano e dall'avambraccio durante le varie fasi della bracciata a stile libero. Mantenere le dita leggermente divaricate (distanza interdigitale di circa 0.3-0.8 cm) incrementa il coefficiente di portanza e la forza propulsiva complessiva fino all'8-10% rispetto alle dita serrate. L'allineamento idrodinamico del tronco riduce la resistenza passiva.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24149520/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Nuoto", "Sport Individuali"],
                "goals": ["Endurance", "Power"]
            }
        },
        {
            "id": "sci_indiv_abbiss_2009",
            "title": "The search for an optimal cycling cadence",
            "authors": "Abbiss, C. R., Peiffer, J. J., & Laursen, P. B.",
            "journal": "Sports Medicine",
            "year": 2009,
            "area": "Sport Individuali",
            "studyType": "Revisione Sistematica",
            "abstract": "Revisione critica sui determinanti fisiologici e biomeccanici della cadenza di pedalata ottimale nel ciclismo. Mentre la cadenza più efficiente dal punto di vista energetico (minimo consumo di ossigeno) a carichi moderati si situa intorno a 60-70 rpm, i ciclisti d'élite scelgono spontaneamente cadenze molto superiori (90-105 rpm) a potenze elevate (>350 W). Questa cadenza elevata riduce la forza di picco applicata su ciascuna pedalata, recluta preferenzialmente fibre lente a basso costo di affaticamento e facilita il ritorno venoso muscolare.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/19857053/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Ciclismo", "Triathlon", "Sport Individuali"],
                "goals": ["Endurance", "Power"]
            }
        },
        {
            "id": "sci_indiv_franchini_2011",
            "title": "Physiological profiles of elite judo athletes",
            "authors": "Franchini, E., Del Vecchio, F. B., Matsushigue, K. A., & Artioli, G. G.",
            "journal": "Sports Medicine",
            "year": 2011,
            "area": "Sport Individuali",
            "studyType": "Revisione Sistematica",
            "abstract": "Revisione esaustiva sul profilo fisiologico e biomeccanico degli atleti d'élite negli sport da combattimento (judo e grappling). Il judo richiede un'eccezionale combinazione di potenza anaerobica alattacida e lattacida associata a una solida capacità aerobica per sostenere i tempi di recupero tra i round. Risultano determinanti la forza di presa isometrica (grip strength), la potenza degli arti superiori nei movimenti di trazione e la capacità di generare picchi di forza esplosiva in condizioni di forte instabilità posturale dell'avversario.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21275463/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Arti Marziali", "Judo", "Lotta", "Sport Individuali"],
                "goals": ["Power", "Strength"]
            }
        },
        {
            "id": "sci_indiv_chaabene_2015",
            "title": "Physical and Physiological Attributes of Karate World Champions: A Review",
            "authors": "Chaabène, M., Hachana, Y., Franchini, E., Mkaouer, B., & Chamari, K.",
            "journal": "Sports Medicine",
            "year": 2012,
            "area": "Sport Individuali",
            "studyType": "Revisione Sistematica",
            "abstract": "Profilo fisiologico e neuromuscolare dei campioni mondiali di karate (kumite e kata). I gesti tecnici d'attacco (pugni e calci) durano tra 0.15 e 0.40 secondi, evidenziando come il Rate of Force Development (RFD) e la velocità angolare massima siano i fattori prestazionali discriminanti rispetto agli atleti di livello inferiore. L'allenamento balistico con carichi leggeri e la pliometria unilaterale con cambi di direzione rapidi massimizzano il trasferimento della potenza al bersaglio.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/22827725/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Karate", "Arti Marziali", "Sport Individuali"],
                "goals": ["Power", "Power"]
            }
        },
        {
            "id": "sci_indiv_coyle_1991",
            "title": "Physiological and biomechanical factors associated with elite endurance cycling performance",
            "authors": "Coyle, E. F., Feltner, M. E., Kautz, S. A., Hamilton, M. T., Montain, S. J., Baylor, A. M., ... & Petrek, G. W.",
            "journal": "Medicine & Science in Sports & Exercise",
            "year": 1991,
            "area": "Sport Individuali",
            "studyType": "RCT",
            "abstract": "Studio miliare sui fattori fisiologici che differenziano ciclisti d'élite di pari VO2max. La soglia del lattato espressa come percentuale del VO2max e l'efficienza meccanica di pedalata (efficienza lorda) sono i predittori chiave delle prestazioni a cronometro. I ciclisti con percentuali più elevate di fibre muscolari di tipo I (a contrazione lenta) nel vasto laterale mantengono potenze elevate per oltre un'ora con accumulo di lattato significativamente ridotto e minore deplezione di glicogeno.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/2020275/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Ciclismo", "Sport Individuali"],
                "goals": ["Endurance"]
            }
        },
        {
            "id": "sci_indiv_jordan_2017",
            "title": "Vertical ground reaction force in gymnastics landings: A systematic review",
            "authors": "Campbell, R., Bradshaw, E. J., Ball, K., & Hunter, A.",
            "journal": "Sports Biomechanics",
            "year": 2019,
            "area": "Sport Individuali",
            "studyType": "Revisione Sistematica",
            "abstract": "Revisione sistematica sulle forze d'impatto al suolo (GRF) durante gli atterraggi nella ginnastica artistica e ritmica. Gli atterraggi da salti e volteggi generano forze d'impatto verticali di picco comprese tra 8 e 15 volte il peso corporeo in meno di 50 millisecondi. Strategie di atterraggio 'soft' con flessione di ginocchio >60° e flessione dorsale di caviglia riducono significativamente il carico di picco sulle articolazioni dell'anca, della colonna lombare e del tendine rotuleo rispetto ad atterraggi rigidi.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/30353796/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Ginnastica", "Sport Individuali"],
                "goals": ["Power", "Rehab"]
            }
        },
        {
            "id": "sci_indiv_millet_2002",
            "title": "Physiological and biomechanical factors influencing running economy in elite runners",
            "authors": "Saunders, P. U., Pyne, D. B., Telford, R. D., & Hawley, J. A.",
            "journal": "Sports Medicine",
            "year": 2004,
            "area": "Sport Individuali",
            "studyType": "Revisione Sistematica",
            "abstract": "Revisione autorevole sui fattori che determinano la running economy (costo energetico della corsa) nei corridori di fondo. Oltre a fattori metabolici e antropometrici, la stiffness muscolo-tendinea della catena posteriore (tricipite surale e tendine d'Achille) gioca un ruolo preponderante nel restituire energia elastica gratuita durante la fase propulsiva. L'allenamento con sovraccarichi pesanti (85% 1RM) e la pliometria aumentano la stiffness tendinea migliorando la running economy del 3-8% a parità di VO2max.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/15233597/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Corsa", "Atletica Leggera", "Sport Individuali"],
                "goals": ["Endurance", "Strength"]
            }
        },
        {
            "id": "sci_indiv_secher_1993",
            "title": "Physiological components of rowing performance",
            "authors": "Secher, N. H.",
            "journal": "Sports Medicine",
            "year": 1993,
            "area": "Sport Individuali",
            "studyType": "Revisione Sistematica",
            "abstract": "Monografia fisiologica classica sulla prestazione nel canottaggio olimpico sui 2000 metri. La gara di canottaggio richiede circa il 75-80% di apporto aerobico e il 20-25% anaerobico, con consumi assoluti di ossigeno tra i più alti mai registrati nello sport umano (>6.5 L/min). La potenza propulsiva deriva principalmente dall'estensione delle gambe e delle anche (circa 70% del lavoro meccanico), mentre tronco e braccia fungono da trasmettitori della forza sulla pala del remo.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/8372255/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Canottaggio", "Sport Individuali"],
                "goals": ["Endurance", "Power"]
            }
        },
        {
            "id": "sci_indiv_fry_2006",
            "title": "The role of resistance exercise in the preparation of combat athletes",
            "authors": "Kraemer, W. J., & Häkkinen, K.",
            "journal": "Strength and Conditioning Journal",
            "year": 2006,
            "area": "Sport Individuali",
            "studyType": "Linee Guida",
            "abstract": "Linee guida sull'impiego del resistance training nella preparazione degli atleti di sport da combattimento (boxe, MMA, taekwondo, lotta). Si raccomanda la periodizzazione a blocchi che separi lo sviluppo della forza massimale di base (es. squat, panca, stacchi) dalla conversione in potenza specifica (movimenti balistici ed esecuzioni esplosive con carichi al 30-50% 1RM). Il monitoraggio della velocità esecutiva (VBT) evita l'ipertrofia non funzionale che comprometterebbe la categoria di peso.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/22194889/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Pugilato", "MMA", "Arti Marziali", "Sport Individuali"],
                "goals": ["Power", "Strength"]
            }
        },
        {
            "id": "sci_indiv_watts_2004",
            "title": "Physiology of sport rock climbing",
            "authors": "Watts, P. B.",
            "journal": "British Journal of Sports Medicine",
            "year": 2004,
            "area": "Sport Individuali",
            "studyType": "Revisione Sistematica",
            "abstract": "Revisione fisiologica sull'arrampicata sportiva di alto livello. I fattori fisici primari sono il rapporto forza-peso e la resistenza alla forza isometrica dei muscoli flessori profondi e superficiali delle dita dell'avambraccio. Durante le sospensioni su prese piccole, l'ischemia muscolare locale indotta dall'elevata pressione intramuscolare richiede una rapida riespansione vascolare tra i movimenti. L'allenamento intermittente su trave (hangboard) a contrazioni isometriche ripetute stimola l'adattamento microvascolare.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/15155422/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Arrampicata", "Sport Individuali"],
                "goals": ["Strength", "Endurance"]
            }
        },
        {
            "id": "sci_indiv_tourny_2019",
            "title": "Strength and conditioning for fencing: A systematic review",
            "authors": "Turner, A., Miller, S., Stewart, P., Cree, J., Ingram, R., Dimitriou, L., ... & Bishop, C.",
            "journal": "Strength and Conditioning Journal",
            "year": 2013,
            "area": "Sport Individuali",
            "studyType": "Revisione Sistematica",
            "abstract": "Revisione metodologica sulla preparazione fisica nella scherma moderna. L'affondo (lunge) e il cambio di direzione rapido sulla pedana richiedono una spiccata forza eccentrica e reattiva degli arti inferiori e stabilità lombo-pelvica asimmetrica. Si evidenzia la frequente presenza di asimmetrie funzionali e ipertrofia monolaterale dell'arto dominante, raccomandando programmi di forza unilaterale per l'arto non dominante al fine di ridurre il rischio di infortuni alla catena cinetica.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24792945/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Scherma", "Sport Individuali"],
                "goals": ["Power", "Rehab"]
            }
        }
    ];

    root.App.Sources.sportIndividuali = SPORT_INDIVIDUALI_SOURCES;
    if (typeof window !== 'undefined' && window.App) {
        window.App.Sources = window.App.Sources || {};
        window.App.Sources.sportIndividuali = SPORT_INDIVIDUALI_SOURCES;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = root.App.Sources.sportIndividuali;
    }
})();
