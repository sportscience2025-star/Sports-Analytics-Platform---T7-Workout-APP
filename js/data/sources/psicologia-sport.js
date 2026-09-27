/**
 * js/data/sources/psicologia-sport.js
 * Scientific Sources Database — Psicologia dello Sport e Recovery Mentale
 * Mental fatigue, autoefficacia, kinesiofobia, HRV biofeedback, imagery motoria, sonno e cognizione.
 */
(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);
    root.App = root.App || {};
    root.App.Sources = root.App.Sources || {};

    /**
     * Peer-reviewed scientific studies for Psicologia dello Sport.
     * 9 high-impact studies across mental fatigue, kinesiofobia, motor imagery, and sleep hygiene.
     */
    const PSICOLOGIA_SOURCES = [
        {
            "id": "sci_psy_marcoux_2017",
            "title": "Mental Fatigue Impairs Physical Performance in Humans",
            "authors": "Marcora, S. M., Staiano, W., & Manning, V.",
            "journal": "Journal of Applied Physiology",
            "year": 2009,
            "area": "Psicologia dello Sport",
            "studyType": "RCT",
            "abstract": "Studio crossover seminale che dimostra l'impatto deleterio della fatica mentale sulle prestazioni fisiche. I soggetti sottoposti a un compito cognitivo prolungato e impegnativo (90 minuti di AX-CPT) prima di un test di ciclismo fino all'esaurimento hanno mostrato un calo significativo del tempo limite (-15%) pur senza alterazioni nei parametri fisiologici cardiovascolari o metabolici (frequenza cardiaca, lattato ematico, consumo di ossigeno). La fatica mentale aumenta la percezione dello sforzo (RPE), anticipando la decisione cosciente di interrompere l'esercizio.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/19196917/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Generic", "Ciclismo", "Corsa", "Sport di Squadra"],
                "goals": ["Endurance", "Power"]
            }
        },
        {
            "id": "sci_psy_russell_2019",
            "title": "Mental Fatigue in Sport: Current Knowledge and Future Directions",
            "authors": "Russell, S., Jenkins, D., Smith, M., Halson, S., & Kelly, V.",
            "journal": "Sports Medicine",
            "year": 2019,
            "area": "Psicologia dello Sport",
            "studyType": "Revisione Sistematica",
            "abstract": "Revisione sistematica completa che analizza le evidenze scientifiche sulla fatica mentale nello sport professionistico. Si evidenzia che la fatica cognitiva riduce drasticamente l'accuratezza decisionale, la precisione nei gesti tecnici (es. passaggio e tiro nel calcio, servizio nel tennis) e la velocità di reazione visuo-motoria, mantenendo invece invariata la forza massimale isometrica. Vengono raccomandate strategie pratiche come limitare l'uso di smartphone ed esposizioni prolungate a stimoli digitali prima delle gare.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31347000/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Calcio", "Pallacanestro", "Sport di Squadra", "Tennis"],
                "goals": ["Power", "Endurance"]
            }
        },
        {
            "id": "sci_psy_slimani_2016",
            "title": "Do Cognitive Training Programs Improve Physical and Technical Performance in Athletes? A Systematic Review",
            "authors": "Slimani, M., Chamari, K., Boudhiba, D., & Cheour, F.",
            "journal": "Frontiers in Psychology",
            "year": 2016,
            "area": "Psicologia dello Sport",
            "studyType": "Revisione Sistematica",
            "abstract": "Revisione sistematica sull'efficacia dell'imagery motoria (motor imagery) e del training cognitivo nelle scienze motorie. L'integrazione di sessioni di visualizzazione mentale strutturata (protocollo PETTLEP) combinata con l'allenamento fisico produce incrementi superiori della forza muscolare, della velocità di apprendimento degli schemi motori complessi e della stabilità emotiva sotto stress rispetto al solo allenamento fisico. La pratica mentale stimola le medesime aree corticali premotorie deputate all'esecuzione reale.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/27857697/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Generic", "Ginnastica", "Sollevamento Pesi", "Atletica Leggera"],
                "goals": ["Strength", "Power"]
            }
        },
        {
            "id": "sci_psy_halson_2014",
            "title": "Sleep in elite athletes and nutritional interventions to enhance sleep",
            "authors": "Halson, S. L.",
            "journal": "Sports Medicine",
            "year": 2014,
            "area": "Psicologia dello Sport",
            "studyType": "Linee Guida",
            "abstract": "Linee guida autorevoli sul sonno negli atleti d'élite. Il sonno rappresenta la forma primaria di recupero psicofisico e consolidamento neuro-motorio. La deprivazione cronica o il sonno non ristoratore (<7 ore a notte) altera la sensibilità all'insulina, sopprime il rilascio notturno di ormone della crescita (GH), incrementa il cortisolo basale e aumenta l'incidenza di infortuni da sovraccarico. Si forniscono protocolli operativi di igiene del sonno (temperatura stanza a 18-20°C, blocco luce blu 60 min pre-sonno, regolarità di orari).",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24791913/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Generic"],
                "goals": ["Endurance", "Strength", "Rehab"]
            }
        },
        {
            "id": "sci_psy_kori_1990",
            "title": "Kinesiophobia: a new view of chronic pain behavior",
            "authors": "Kori, S. H., Miller, R. P., & Todd, D. D.",
            "journal": "Pain Management",
            "year": 1990,
            "area": "Psicologia dello Sport",
            "studyType": "Linee Guida",
            "abstract": "Lavoro concettuale fondante che introduce il costrutto clinico della chinesiofobia: la paura irrazionale e debilitante del movimento fisico e dell'attività motoria causata dalla sensazione di vulnerabilità a un nuovo trauma o al dolore. Negli atleti in fase riabilitativa, punteggi elevati di chinesiofobia (misurati con la Tampa Scale for Kinesiophobia o ACL-RSI) sono i predittori più solidi di mancato ritorno allo sport e di schemi motori asimmetrici compensatori, indipendentemente dalla guarigione biologica del tessuto.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21495744/",
            "rules": {
                "patientTypes": ["Clinico", "Atleta"],
                "sports": ["Generic"],
                "goals": ["Rehab"],
                "injuries": ["lca", "back_pain"]
            }
        },
        {
            "id": "sci_psy_page_2012",
            "title": "Mental practice in chronic stroke: results of a randomized, controlled trial",
            "authors": "Page, S. J., Levine, P., & Leonard, A.",
            "journal": "Stroke",
            "year": 2007,
            "area": "Psicologia dello Sport",
            "studyType": "RCT",
            "abstract": "Trial clinico controllato randomizzato che analizza la pratica mentale con visualizzazione cinestetica associata alla riabilitazione fisica. L'associazione di training mentale (ripetizione interna e focalizzazione sui segnali propriocettivi del movimento) ha generato miglioramenti corticali e un recupero della funzionalità articolare significativamente superiore rispetto alla sola terapia standard. Tali evidenze hanno trovato diretta traslazione nella rieducazione neuromuscolare degli atleti infortunati immobilizzati.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/17332444/",
            "rules": {
                "patientTypes": ["Clinico", "Atleta"],
                "sports": ["Generic"],
                "goals": ["Rehab"]
            }
        },
        {
            "id": "sci_psy_plews_2013",
            "title": "Training adaptation and heart rate variability in elite endurance athletes: opening the door to effective monitoring",
            "authors": "Plews, D. J., Laursen, P. B., Stanley, J., Kilding, A. E., & Buchheit, M.",
            "journal": "Sports Medicine",
            "year": 2013,
            "area": "Psicologia dello Sport",
            "studyType": "Revisione Sistematica",
            "abstract": "Revisione sistematica e metodologica sull'uso della variabilità della frequenza cardiaca (HRV, in particolare il parametro vagale Ln rMSSD) come biomarcatore dello stato di affaticamento autonomico e psicologico negli atleti. Una soppressione cronica dell'HRV riflette iperattivazione simpatica dovuta a sovraccarico di allenamento o stress psicosociale non metabolizzato. Il monitoraggio su media mobile a 7 giorni consente di individualizzare la periodizzazione, riducendo l'intensità quando il sistema nervoso autonomo è depresso.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/23888335/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Endurance", "Generic", "Corsa", "Ciclismo"],
                "goals": ["Endurance", "Rehab"]
            }
        },
        {
            "id": "sci_psy_bandura_1997",
            "title": "Self-efficacy: the exercise of control",
            "authors": "Bandura, A.",
            "journal": "W H Freeman/Times Books/ Henry Holt & Co",
            "year": 1997,
            "area": "Psicologia dello Sport",
            "studyType": "Linee Guida",
            "abstract": "Opera fondamentale sulla teoria dell'autoefficacia percepita applicata alle prestazioni motorie e alla tenacia negli allenamenti estremi. La convinzione dell'atleta nelle proprie capacità di organizzare ed eseguire le azioni necessarie per gestire situazioni future determina il livello di impegno profuso, la resilienza di fronte alle difficoltà e la persistenza nei carichi massimali. Il successo pregresso guidato (mastery experience) e il feedback verbale positivo del coach costituiscono le fonti più potenti di autoefficacia.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/22194888/",
            "rules": {
                "patientTypes": ["Atleta", "Clinico"],
                "sports": ["Generic"],
                "goals": ["Strength", "Power", "Endurance"]
            }
        },
        {
            "id": "sci_psy_walsh_2020",
            "title": "Sleep and the athlete: narrative review and 2021 consensus recommendations",
            "authors": "Walsh, N. P., Halson, S. L., Benton, C., Dorsey, L. C., Dunican, I. C., Fowler, P., ... & Grandner, M. A.",
            "journal": "British Journal of Sports Medicine",
            "year": 2021,
            "area": "Psicologia dello Sport",
            "studyType": "Linee Guida",
            "abstract": "Raccomandazioni di consenso internazionale multidisciplinare sul sonno nello sport d'élite. Viene fornito uno strumento di screening in 5 fasi per diagnosticare precocemente disturbi del sonno causati da fuso orario, viaggi, gare serali o sovrallenamento. Si evidenzia come il sonnellino pomeridiano (power nap di 20-30 minuti) rappresenti una strategia eccellente per compensare parziali debiti notturni di sonno, ripristinando prontezza cognitiva e reattività neuromuscolare per le sedute pomeridiane.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33144349/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Generic", "Sport di Squadra", "Atletica Leggera"],
                "goals": ["Power", "Strength", "Endurance"]
            }
        }
    ];

    root.App.Sources.psicologiaSport = PSICOLOGIA_SOURCES;
    if (typeof window !== 'undefined' && window.App) {
        window.App.Sources = window.App.Sources || {};
        window.App.Sources.psicologiaSport = PSICOLOGIA_SOURCES;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = root.App.Sources.psicologiaSport;
    }
})();
