/**
 * js/knowledge-base.js
 * Scientific Sources & Rationale Database for AI Workout Generator.
 * Used for dynamic explanation generation based on user inputs.
 */

(function () {
    'use strict';

    window.App = window.App || {};

    // Concrete Data Schema for Scientific Sources
    window.App.scientificSources = [
        {
            id: "sci_periodization_001",
            title: "Periodization: Theory and Methodology of Training",
            authorsJournalYear: "Bompa, T. O., & Buzzichelli, C. (2018). Human Kinetics.",
            scientificArea: "Periodizzazione",
            abstractTakeaway: "Il programma segue un modello di periodizzazione ondulata con blocchi di 4 settimane (3 di carico progressivo e 1 di scarico). Lo scarico sistematico permette il ripristino delle riserve di glicogeno, la rigenerazione del sistema nervoso centrale (SNC) e il rimodellamento dei tessuti connettivi, prevenendo il sovrallenamento e promuovendo la supercompensazione.",
            pubmedDoiLink: "https://www.humankinetics.com/products/all-products/periodization-6th-edition",
            rules: {} // Empty rules = Always matched (General Periodization explanation)
        },
        {
            id: "sci_endurance_strength_2014",
            title: "Strength training improves cycling and running economy in distance runners and cyclists",
            authorsJournalYear: "Rønnestad, B. R., & Mujika, I. (2014). Scandinavian Journal of Medicine & Science in Sports.",
            scientificArea: "Sport: Endurance",
            abstractTakeaway: "Per gli atleti di endurance, l'uso di carichi submassimali (>85% 1RM) con basse ripetizioni (3-6) e recuperi completi (2-3 min) migliora l'economia del gesto atletico (running/cycling economy) e la rigidità tendinea (tendon stiffness) senza indurre ipertrofia sarcoplasmatica disfunzionale. La scelta di soli esercizi multiarticolari massimizza il transfer motorio.",
            pubmedDoiLink: "https://pubmed.ncbi.nlm.nih.gov/23914909/",
            rules: {
                patientTypes: ["Atleta"],
                sports: ["Endurance"]
            }
        },
        {
            id: "sci_team_sports_rfd_2016",
            title: "The Importance of Rate of Force Development in Team Sports Performance",
            authorsJournalYear: "Suchomel, T. J., et al. (2016). Sports Medicine.",
            scientificArea: "Sport: Sport di Squadra",
            abstractTakeaway: "Nei giochi di squadra, la priorità è lo sviluppo del Rate of Force Development (tasso di sviluppo della forza) tramite tempi esplosivi (es. X-0-1). Il focus su esercizi pliometrici e monolaterali rispecchia le richieste bio-meccaniche dello sport (accelerazioni, decelerazioni, cambi di direzione) e riduce i deficit di forza bilaterali.",
            pubmedDoiLink: "https://pubmed.ncbi.nlm.nih.gov/27377252/",
            rules: {
                patientTypes: ["Atleta"],
                sports: ["Sport di Squadra"]
            }
        },
        {
            id: "sci_hypertrophy_mechanisms_2010",
            title: "The Mechanisms of Muscle Hypertrophy and Their Application to Resistance Training",
            authorsJournalYear: "Schoenfeld, B. J. (2010). Journal of Strength and Conditioning Research.",
            scientificArea: "Sport: Bodybuilding",
            abstractTakeaway: "Il protocollo per il bodybuilding si focalizza sul range ipertrofico classico (8-12 rep, 70-80% 1RM) con tempi sotto tensione controllati (2-0-2) e pause ridotte (60-90s). Questo approccio ottimizza i due stimoli primari dell'ipertrofia muscolare: la tensione meccanica sulle fibre e lo stress metabolico locale (accumulo di idrogenioni e lattato).",
            pubmedDoiLink: "https://pubmed.ncbi.nlm.nih.gov/20847704/",
            rules: {
                patientTypes: ["Atleta"],
                sports: ["Bodybuilding"]
            }
        },
        {
            id: "sci_knee_isometric_analgesia_2015",
            title: "Isometric exercise induces analgesic effects on patellar tendinopathy in-season",
            authorsJournalYear: "Rio, E., et al. (2015). British Journal of Sports Medicine.",
            scientificArea: "Clinico: Ginocchio",
            abstractTakeaway: "Nelle prime fasi cliniche del ginocchio, l'uso di contrazioni isometriche (es. Wall Sit a 60°) ha un documentato effetto analgesico sul tendine rotuleo e attiva il quadricipite (in particolare il vasto mediale obliquo) senza indurre stress da taglio articolare o compressione femoro-rotulea eccessiva.",
            pubmedDoiLink: "https://pubmed.ncbi.nlm.nih.gov/25979940/",
            rules: {
                patientTypes: ["Clinico"],
                injuries: ["post_op_lca", "lesione_lca", "knee_generic", "gonarthrosis", "patellar_tendonitis", "condromalacia_rotulea", "meniscus"]
            }
        },
        {
            id: "sci_eccentric_tendinopathy_2000",
            title: "Eccentrics for Tendinopathy: A Review of Rationale and Clinical Efficacy",
            authorsJournalYear: "Alfredson, H., & Lorentzon, R. (2000). Sports Medicine.",
            scientificArea: "Clinico: Ginocchio",
            abstractTakeaway: "La transizione al lavoro eccentrico controllato (Fase 3, tempo 4-0-1) promuove il corretto allineamento delle fibre di collagene nel tendine/legamento in via di guarigione, aumenta la lunghezza dei fascicoli muscolari (prevenendo recidive) e migliora la capacità di decelerazione dell'arto.",
            pubmedDoiLink: "https://pubmed.ncbi.nlm.nih.gov/11104327/",
            rules: {
                patientTypes: ["Clinico"],
                injuries: ["post_op_lca", "lesione_lca", "knee_generic", "gonarthrosis", "patellar_tendonitis", "condromalacia_rotulea", "meniscus"]
            }
        },
        {
            id: "sci_spine_stability_2017",
            title: "Core Stability Exercise in Chronic Low Back Pain: A Systematic Review",
            authorsJournalYear: "Coulombe, B. J., et al. (2017). Journal of Athletic Training.",
            scientificArea: "Clinico: Colonna",
            abstractTakeaway: "L'uso di esercizi di stabilizzazione isometrica per il core (come Plank e Bird-dog) per pazienti con patologie spinali recluta selettivamente il trasverso dell'addome e i multifidi, riducendo lo shear stress sulle vertebre lombari ed erigendo una cintura attiva protettiva in allineamento neutro.",
            pubmedDoiLink: "https://pubmed.ncbi.nlm.nih.gov/28281387/",
            rules: {
                patientTypes: ["Clinico"],
                injuries: ["lumbar_pain", "hernia_disk", "spinal_stenosis", "sensitive_back", "spondylolysis", "faccette_articolari", "scoliosi_idiopatica"]
            }
        }
    ];

})();
