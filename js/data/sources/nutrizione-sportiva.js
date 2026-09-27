/**
 * js/data/sources/nutrizione-sportiva.js
 * Scientific Sources Database — Nutrizione Sportiva e Supplementazione
 * Timing proteico, creatina, idratazione, risintesi glicogenica, composizione corporea.
 */
(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);
    root.App = root.App || {};
    root.App.Sources = root.App.Sources || {};

    /**
     * Peer-reviewed scientific studies for Nutrizione Sportiva.
     * 13 high-impact studies across ISSN position stands, protein distribution, creatine, hydration, and energy availability.
     */
    const NUTRIZIONE_SOURCES = [
        {
            "id": "sci_nutr_jager_2017",
            "title": "International Society of Sports Nutrition Position Stand: protein and exercise",
            "authors": "Jäger, R., Kerksick, C. M., Campbell, B. I., Cribb, P. J., Wells, S. D., Skwiat, T. M., ... & Antonio, J.",
            "journal": "Journal of the International Society of Sports Nutrition",
            "year": 2017,
            "area": "Nutrizione Sportiva",
            "studyType": "Linee Guida",
            "abstract": "Position stand ufficiale dell'ISSN sul fabbisogno proteico negli individui attivi e atleti. L'introito ottimale per massimizzare la sintesi proteica muscolare (MPS) varia da 1.4 a 2.0 g/kg/die per la maggior parte dei soggetti che si allenano. Dosi acute di 20-40 g di proteine ad alto valore biologico (con 700-3000 mg di leucina) distribuite uniformemente ogni 3-4 ore ottimizzano la risposta anabolica durante la giornata. In periodi di restrizione calorica per atleti di forza, apporti superiori fino a 2.3-3.1 g/kg/massa magra preservano efficacemente il tessuto muscolare.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28642676/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Generic", "Sollevamento Pesi", "Bodybuilding"],
                "goals": ["Hypertrophy", "Strength"]
            }
        },
        {
            "id": "sci_nutr_kreider_2017",
            "title": "International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation in exercise, sport, and medicine",
            "authors": "Kreider, R. B., Kalman, D. S., Antonio, J., Ziegenfuss, T. N., Wildman, R., Collins, R., ... & Lopez, H. L.",
            "journal": "Journal of the International Society of Sports Nutrition",
            "year": 2017,
            "area": "Nutrizione Sportiva",
            "studyType": "Linee Guida",
            "abstract": "Consenso scientifico di riferimento sulla supplementazione di creatina monoidrato. Rappresenta il supplemento ergogenico nutrizionale più efficace e supportato dalla letteratura per aumentare la capacità di lavoro ad alta intensità, la massa magra e la forza massimale. Il protocollo di carico standard prevede 0.3 g/kg/die per 5-7 giorni seguito da un mantenimento di 3-5 g/die; in alternativa, un'assunzione costante di 3-5 g/die raggiunge la saturazione muscolare in 3-4 settimane senza necessità di fase di carico o sospensione ciclica.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28615996/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Generic", "Sollevamento Pesi", "Atletica Leggera", "Sport di Squadra"],
                "goals": ["Strength", "Power", "Hypertrophy"]
            }
        },
        {
            "id": "sci_nutr_morton_2018",
            "title": "A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults",
            "authors": "Morton, R. W., Murphy, K. T., McKellar, S. R., Schoenfeld, B. J., Henselmans, M., Helms, E., ... & Phillips, S. M.",
            "journal": "British Journal of Sports Medicine",
            "year": 2018,
            "area": "Nutrizione Sportiva",
            "studyType": "Meta-analisi",
            "abstract": "Meta-analisi su 49 studi e 1863 partecipanti che definisce il punto di saturazione per i guadagni di massa muscolare indotti dall'allenamento contro resistenza. L'apporto proteico totale oltre 1.62 g/kg/die non conferisce ulteriori incrementi statisticamente significativi nell'ipertrofia della massa priva di grasso in condizioni di bilancio energetico neutro o positivo. La supplementazione proteica aumenta l'1RM e la sezione trasversa muscolare in misura significativamente superiore rispetto al solo allenamento senza adeguamento proteico.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28698222/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Sollevamento Pesi", "Generic"],
                "goals": ["Hypertrophy", "Strength"]
            }
        },
        {
            "id": "sci_nutr_kerksick_2018",
            "title": "ISSN exercise & sports nutrition review update: research & recommendations",
            "authors": "Kerksick, C. M., Wilborn, C. D., Roberts, M. D., Smith-Ryan, A., Kleiner, S. M., Jäger, R., ... & Kreider, R. B.",
            "journal": "Journal of the International Society of Sports Nutrition",
            "year": 2018,
            "area": "Nutrizione Sportiva",
            "studyType": "Linee Guida",
            "abstract": "Revisione globale della letteratura scientifica sulla nutrizione sportiva che classifica integratori ed evidenze in base al livello di efficacia e sicurezza. Tra i supplementi con forte evidenza per la prestazione e il recupero figurano creatina monoidrato, caffeina, beta-alanina, bicarbonato di sodio e carboidrati/proteine per il peri-workout. Fornisce indicazioni pratiche sull'idratazione (reintegro di circa il 150% del peso perso durante l'esercizio) e sull'assunzione di sodio durante sforzi prolungati ad alte temperature.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/30068354/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Generic", "Sport di Squadra", "Resistenza"],
                "goals": ["Endurance", "Strength", "Power"]
            }
        },
        {
            "id": "sci_nutr_schoenfeld_2018",
            "title": "How much protein can the body use in a single meal for muscle-building? Implications for daily protein distribution",
            "authors": "Schoenfeld, B. J., & Aragon, A. A.",
            "journal": "Journal of the International Society of Sports Nutrition",
            "year": 2018,
            "area": "Nutrizione Sportiva",
            "studyType": "Revisione Sistematica",
            "abstract": "Analisi critica sulla dose ottimale di proteine per singolo pasto in funzione dell'anabolismo muscolare. Sebbene dosi di 0.4 g/kg per pasto massimizzino la sintesi proteica a riposo, dosi superiori vengono utilizzate per il turnover proteico sistemico e la gluconeogenesi. Gli autori raccomandano come strategia ottimale per l'ipertrofia l'assunzione di almeno quattro pasti quotidiani contenenti ciascuno 0.4-0.55 g/kg di proteine ad alto valore biologico, raggiungendo un totale giornaliero compreso tra 1.6 e 2.2 g/kg.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29497353/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Generic", "Bodybuilding"],
                "goals": ["Hypertrophy"]
            }
        },
        {
            "id": "sci_nutr_burke_2011",
            "title": "Carbohydrates for training and competition",
            "authors": "Burke, L. M., Hawley, J. A., Wong, S. H., & Jeukendrup, A. E.",
            "journal": "Journal of Sports Sciences",
            "year": 2011,
            "area": "Nutrizione Sportiva",
            "studyType": "Linee Guida",
            "abstract": "Linee guida nutrizionali per la prescrizione dei carboidrati negli atleti. Si passa da un concetto statico di percentuale calorica a raccomandazioni dinamiche basate sulla massa corporea e sul carico di allenamento: 3-5 g/kg/die per carichi leggeri, 5-7 g/kg/die per carichi moderati (circa 1 ora/giorno), fino a 8-12 g/kg/die per atleti di endurance estrema. Durante sforzi superiori a 60-90 minuti, l'ingestione di 30-60 g/h di carboidrati (fino a 90 g/h con miscele glucosio/fruttosio 2:1) preserva l'ossidazione dei carboidrati e ritarda l'affaticamento neuromuscolare.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/21660838/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Ciclismo", "Corsa", "Sport di Squadra", "Calcio"],
                "goals": ["Endurance", "Power"]
            }
        },
        {
            "id": "sci_nutr_trexler_2015",
            "title": "International society of sports nutrition position stand: Beta-Alanine",
            "authors": "Trexler, E. T., Smith-Ryan, A. E., Stout, J. R., Hoffman, J. R., Wilborn, C. D., Sale, C., ... & Antonio, J.",
            "journal": "Journal of the International Society of Sports Nutrition",
            "year": 2015,
            "area": "Nutrizione Sportiva",
            "studyType": "Linee Guida",
            "abstract": "Position stand sulla supplementazione con beta-alanina per incrementare la carnosina intramuscolare e la capacità tampone contro l'acidosi lattica. L'assunzione quotidiana di 4-6 g/die per almeno 4 settimane aumenta significativamente la carnosina muscolare, migliorando le prestazioni in esercizi ad alta intensità della durata compresa tra 60 e 240 secondi. L'assunzione frazionata in dosi da 1.6 g o formulazioni a rilascio prolungato attenua l'effetto collaterale transitorio della parestesia senza comprometterne l'efficacia.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26175657/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Atletica Leggera", "Canottaggio", "Nuoto", "Sport di Squadra"],
                "goals": ["Power", "Endurance"]
            }
        },
        {
            "id": "sci_nutr_thomas_2016",
            "title": "American College of Sports Medicine Joint Position Statement. Nutrition and Athletic Performance",
            "authors": "Thomas, D. T., Erdman, K. A., & Burke, L. M.",
            "journal": "Medicine & Science in Sports & Exercise",
            "year": 2016,
            "area": "Nutrizione Sportiva",
            "studyType": "Linee Guida",
            "abstract": "Consenso congiunto tra ACSM, AND (Academy of Nutrition and Dietetics) e Dietitians of Canada sulla nutrizione e prestazione atletica. Fornisce raccomandazioni basate sull'evidenza su disponibilità energetica (evitare la REDs sotto i 30 kcal/kg di massa magra/die), timing dei macronutrienti, idratazione pre, durante e post-gara, e monitoraggio degli elettroliti. Sottolinea l'importanza di periodizzare l'apporto nutrizionale in sincrono con i microcicli di carico, competizione e recupero.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26891141/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Generic"],
                "goals": ["Endurance", "Strength", "Power"]
            }
        },
        {
            "id": "sci_nutr_mountjoy_2018",
            "title": "International Olympic Committee (IOC) consensus statement on relative energy deficiency in sport (RED-S): 2018 update",
            "authors": "Mountjoy, M., Sundgot-Borgen, J., Burke, L., Ackerman, K. E., Blauwet, C., Constantini, N., ... & Budgett, R.",
            "journal": "British Journal of Sports Medicine",
            "year": 2018,
            "area": "Nutrizione Sportiva",
            "studyType": "Linee Guida",
            "abstract": "Aggiornamento del consensus statement del CIO sulla Sindrome da Deficit Energetico Relativo nello Sport (RED-S). Una bassa disponibilità energetica (LEA < 30 kcal/kg FFM/die), intenzionale o accidentale, compromette non solo la salute riproduttiva e ossea (triade dell'atleta), ma altera il metabolismo basale, l'immunità, la sintesi proteica, la coordinazione neuromuscolare e aumenta notevolmente il rischio di infortuni muscolari e fratture da stress. È essenziale il monitoraggio nutrizionale precoce negli atleti di resistenza e sport con categorie di peso.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29773536/",
            "rules": {
                "patientTypes": ["Atleta", "Clinico"],
                "sports": ["Corsa", "Ginnastica", "Ciclismo", "Generic"],
                "goals": ["Endurance", "Rehab"]
            }
        },
        {
            "id": "sci_nutr_guest_2021",
            "title": "International society of sports nutrition position stand: caffeine and exercise performance",
            "authors": "Guest, N. S., VanDusseldorp, T. A., Nelson, M. T., Grgic, J., Schoenfeld, B. J., Jenkins, N. D. M., ... & Campbell, B. I.",
            "journal": "Journal of the International Society of Sports Nutrition",
            "year": 2021,
            "area": "Nutrizione Sportiva",
            "studyType": "Linee Guida",
            "abstract": "Position stand completo dell'ISSN sulla caffeina come supplemento ergogenico. Dosi comprese tra 3 e 6 mg/kg di massa corporea assunte circa 60 minuti prima dell'esercizio migliorano in modo consistente la resistenza aerobica, la forza muscolare massimale, la velocità dello sprint e la capacità di salto. Dosi superiori (>9 mg/kg) non offrono benefici aggiuntivi e aumentano il rischio di effetti collaterali quali tremori, tachicardia e ansia da prestazione.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33388079/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Generic", "Sport di Squadra", "Atletica Leggera", "Ciclismo"],
                "goals": ["Power", "Strength", "Endurance"]
            }
        },
        {
            "id": "sci_nutr_owens_2018",
            "title": "Vitamin D and the Athlete: Current Perspectives and New Challenges",
            "authors": "Owens, D. J., Allison, R., & Close, G. L.",
            "journal": "Sports Medicine",
            "year": 2018,
            "area": "Nutrizione Sportiva",
            "studyType": "Revisione Sistematica",
            "abstract": "Revisione critica sullo stato della vitamina D negli atleti professionisti e amatori. La carenza di 25(OH)D (<50 nmol/L) è diffusa tra gli atleti che si allenano indoor o durante i mesi invernali ed è associata a un aumentato rischio di fratture da stress, compromissione della funzione contrattile delle fibre muscolari di tipo II e incremento delle infezioni delle alte vie respiratorie. Livelli ematici ottimali per la salute muscolo-scheletrica e immunitaria si collocano tra 75 e 100 nmol/L.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/29344467/",
            "rules": {
                "patientTypes": ["Atleta", "Clinico"],
                "sports": ["Generic", "Sport di Squadra", "Pallacanestro", "Nuoto"],
                "goals": ["Rehab", "Strength"]
            }
        },
        {
            "id": "sci_nutr_sawka_2007",
            "title": "American College of Sports Medicine position stand. Exercise and fluid replacement",
            "authors": "Sawka, M. N., Burke, L. M., Eichner, E. R., Maughan, R. J., Montain, S. J., & Stachenfeld, N. S.",
            "journal": "Medicine & Science in Sports & Exercise",
            "year": 2007,
            "area": "Nutrizione Sportiva",
            "studyType": "Linee Guida",
            "abstract": "Position stand dell'ACSM sull'idratazione e il bilancio idroelettrolitico nell'esercizio fisico. Un livello di disidratazione che superi il 2% della massa corporea compromette marcatamente la capacità termoregolatoria, la gittata sistolica e la resistenza aerobica, aumentando la frequenza cardiaca e lo sforzo percepito. L'assunzione programmata di liquidi ed elettroliti deve essere personalizzata misurando le variazioni di peso pre-post allenamento per prevenire sia la disidratazione che l'iponatriemia da iperidratazione.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/17277604/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Generic", "Corsa", "Ciclismo", "Calcio"],
                "goals": ["Endurance"]
            }
        },
        {
            "id": "sci_nutr_helms_2014",
            "title": "Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation",
            "authors": "Helms, E. R., Aragon, A. A., & Fitschen, P. J.",
            "journal": "Journal of the International Society of Sports Nutrition",
            "year": 2014,
            "area": "Nutrizione Sportiva",
            "studyType": "Linee Guida",
            "abstract": "Linee guida basate sulle evidenze per la preparazione a gare di bodybuilding natural e la perdita di grasso con massima ritenzione di massa magra. Il deficit calorico deve essere graduale, mirando a una perdita di peso corporeo dello 0.5-1.0% a settimana per prevenire il catabolismo muscolare. Il fabbisogno proteico in deficit calorico elevato sale a 2.3-3.1 g/kg di massa magra, accompagnato da un apporto di grassi del 15-30% delle calorie totali e carboidrati sufficienti a sostenere l'intensità delle sessioni di resistance training.",
            "url": "https://pubmed.ncbi.nlm.nih.gov/24864135/",
            "rules": {
                "patientTypes": ["Atleta"],
                "sports": ["Bodybuilding", "Sollevamento Pesi"],
                "goals": ["Hypertrophy", "Strength"]
            }
        }
    ];

    root.App.Sources.nutrizioneSportiva = NUTRIZIONE_SOURCES;
    if (typeof window !== 'undefined' && window.App) {
        window.App.Sources = window.App.Sources || {};
        window.App.Sources.nutrizioneSportiva = NUTRIZIONE_SOURCES;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = root.App.Sources.nutrizioneSportiva;
    }
})();
