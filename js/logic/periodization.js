/**
 * js/logic/periodization.js
 * AI Workout Generator - Periodization Selection & Split Taxonomy
 */

(function () {
    'use strict';

    window.WorkoutGeneratorAI = window.WorkoutGeneratorAI || class {
        constructor() {
            this.riskLevels = {
                LOW: { color: '#10b981', label: 'Basso Rischio' },
                MEDIUM: { color: '#f59e0b', label: 'Rischio Moderato' },
                HIGH: { color: '#ef4444', label: 'Alto Rischio' }
            };
            this.thresholds = { HIGH: 4, MEDIUM: 2 };
        }
    };

    /**
     * Seleziona il metodo di periodizzazione ideale in base al profilo dell'utente.
     */
    window.WorkoutGeneratorAI.prototype._selectPeriodizationMethod = function (params) {
        if (params.patientType === 'Clinico' || params.patientType === 'Clinico_Anziano') return 'CLINICAL';
        
        const sport = params.sportPraticato || params.sport;
        const level = params.level;
        const goal = params.goal;
        const parsedWeeks = parseInt(params.weeks);
        const weeksTotal = (isNaN(parsedWeeks) || parsedWeeks <= 0) ? 12 : parsedWeeks;

        if (sport === 'Endurance') return 'POLARIZED';
        if (level === 'Beginner' || level === 'Junior') return 'LINEAR';
        if (level === 'Intermediate' && (goal === 'Hypertrophy' || goal === 'Definition' || goal === 'Resistenza')) return 'DUP';
        if (level === 'Intermediate' && goal === 'Strength' && weeksTotal < 10) return 'LINEAR';
        if ((level === 'Advanced' || level === 'Elite') && (goal === 'Strength' || goal === 'Power') && weeksTotal >= 12) return 'BLOCK';
        if ((level === 'Advanced' || level === 'Elite') && (goal === 'Strength' || goal === 'Power') && weeksTotal < 12) return 'CONJUGATE';
        if ((level === 'Advanced' || level === 'Elite') && goal === 'Hypertrophy') return 'CONJUGATE';
        if ((level === 'Advanced' || level === 'Elite') && goal === 'Resistenza') return 'POLARIZED';
        return 'DUP'; // Fallback
    };

    /**
     * Dettagli descrittivi, rationale e riferimenti accademici per ciascun metodo.
     */
    window.WorkoutGeneratorAI.prototype.periodizationDetails = {
        CLINICAL: {
            method: 'CLINICAL',
            name: 'Periodizzazione Clinica Riabilitativa',
            rationale: 'Il programma segue una progressione clinica strutturata per fasi riabilitative specifiche, minimizzando il rischio di sovraccarico articolare e rispettando i tempi fisiologici di guarigione tessutale.',
            progressionPattern: 'Passaggio graduale da contrazioni isometriche a dinamiche, con controllo del ROM e dell\'RPE.',
            keyResearchers: 'Bompa & Haff (2009), Kisner & Colby (2012)'
        },
        LINEAR: {
            method: 'LINEAR',
            name: 'Periodizzazione Lineare',
            rationale: 'La periodizzazione lineare è il metodo più studiato e validato per atleti principianti. Zatsiorsky & Kraemer (2006) e Bompa & Haff (2009) dimostrano che la progressione semplice del carico è ottimale quando le riserve di adattamento sono ancora ampie. La sequenza Adattamento → Ipertrofia → Forza → Picco massimizza l\'efficienza nei primi anni di allenamento.',
            progressionPattern: 'Progressione lineare con aumento graduale dell\'intensità (% 1RM) e riduzione sistematica del volume settimana dopo settimana.',
            keyResearchers: 'Zatsiorsky & Kraemer (2006), Bompa & Haff (2009)'
        },
        BLOCK: {
            method: 'BLOCK',
            name: 'Periodizzazione a Blocchi (Block Periodization)',
            rationale: 'La periodizzazione a blocchi di Issurin (2008) concentra un singolo stimolo dominante per blocco, massimizzando l\'adattamento specifico prima di passare al successivo. Per atleti avanzati, questo approccio supera la periodizzazione lineare perché evita l\'interferenza tra qualità fisiche diverse sviluppate simultaneamente.',
            progressionPattern: 'Tre blocchi sequenziali: Accumulazione (alto volume) → Intensificazione (alta intensità) → Realizzazione (tapering e test/picco). Ogni blocco termina con una settimana di scarico.',
            keyResearchers: 'Issurin (2008), Verkhoshansky (2009)'
        },
        DUP: {
            method: 'DUP',
            name: 'Periodizzazione Ondulante Giornaliera (DUP)',
            rationale: 'La DUP (Rhea et al. 2002, Schoenfeld 2016) varia volume e intensità ogni seduta, prevenendo la stagnazione e massimizzando il segnale anabolico. Colquhoun et al. (2017) hanno dimostrato che la DUP produce guadagni di forza e ipertrofia superiori alla periodizzazione lineare negli atleti intermedi.',
            progressionPattern: 'Variazione giornaliera delle variabili (Giorno Forza, Giorno Ipertrofia, Giorno Resistenza/Potenza) all\'interno del microciclo settimanale, con un incremento graduale del carico del 2.5-5% ogni settimana.',
            keyResearchers: 'Rhea et al. (2002), Schoenfeld (2016), Colquhoun et al. (2017)'
        },
        CONJUGATE: {
            method: 'CONJUGATE',
            name: 'Periodizzazione Coniugata',
            rationale: 'Il metodo coniugato di Simmons (1999) sviluppa simultaneamente forza massima (giorni ME) e velocità di reclutamento (giorni DE), evitando la stagnazione tipica dei metodi sequenziali. La ricerca di Thibaudeau e Westside Barbell documenta adattamenti neuromuscolari superiori rispetto ai metodi tradizionali negli atleti avanzati.',
            progressionPattern: 'Rotazione tra giorni Max Effort (ME - intensità massimale) e Dynamic Effort (DE - velocità esplosiva), combinando carichi pesanti e carichi submassimali esplosivi.',
            keyResearchers: 'Simmons (1999), Thibaudeau (2006)'
        },
        POLARIZED: {
            method: 'POLARIZED',
            name: 'Periodizzazione Polarizzata',
            rationale: 'La periodizzazione polarizzata di Seiler (2010) si basa sull\'analisi di atleti d\'elite di endurance: l\'80% degli allenamenti deve essere a bassa intensità (Zone 1-2) e il 20% ad alta intensità (Zone 4-5). La zona grigia di intensità moderata (RPE 7-8) va evitata perché troppo faticosa per adattarsi, troppo blanda per stimolare le vie ad alta intensità.',
            progressionPattern: 'Ripartizione bimodalmente polarizzata del volume settimanale: ~80% a bassa intensità (RPE <= 6) e ~20% ad intensità massimale (RPE >= 9). Nessun allenamento a media intensità.',
            keyResearchers: 'Seiler (2010), Foster et al. (2015)'
        }
    };

    /**
     * Denominazione standard dello split settimanale.
     */
    window.WorkoutGeneratorAI.prototype._getSplitName = function (days) {
        return { 2: 'Full Body x2', 3: 'Push-Pull-Legs', 4: 'Upper / Lower', 5: 'PHAT 5-Day', 6: 'PPL x2' }[days] || 'Custom';
    };

    /**
     * Denominazione specifica dello split per la fase corrente.
     */
    window.WorkoutGeneratorAI.prototype._getPhaseSplitName = function (phaseId, days, isClinical, method = 'LINEAR') {
        if (isClinical) {
            if (phaseId === 2 || phaseId === 4 || phaseId === 8) return "Scarico & Mobilità Funzionale";
            if (phaseId === 1) return days === 2 ? "Full Body Isometrico" : "Mobilità & Isometria";
            if (phaseId === 3 || phaseId === 7) return days === 2 ? "Upper/Lower Controllato" : "Forza Eccentrica & Stabilità";
            if (phaseId === 5) return days === 2 ? "Full Body Dinamico" : "Forza Dinamica & Endurance";
            return "Valutazione Funzionale & Tapering";
        } else {
            if (method === 'DUP') {
                if (phaseId === 2 || phaseId === 4 || phaseId === 6 || phaseId === 8) return "Scarico DUP Ondulato";
                return days === 2 ? "DUP Full Body Alternato" : (days === 3 ? "DUP Total Body Split" : "DUP Upper/Lower Split");
            }
            if (method === 'CONJUGATE') {
                if (phaseId === 2 || phaseId === 4 || phaseId === 6 || phaseId === 8) return "Scarico Coniugato Tecnico";
                return days === 2 ? "ME/DE Total Body Rotante" : "Coniugato ME/DE Split";
            }
            if (method === 'POLARIZED') {
                if (phaseId === 2 || phaseId === 4 || phaseId === 6 || phaseId === 8) return "Scarico Polarizzato Rigenerativo";
                return "Polarizzato 80/20";
            }
            
            if (phaseId === 2 || phaseId === 4 || phaseId === 6 || phaseId === 8) return "Scarico Rigenerativo";
            if (phaseId === 1) return days === 2 ? "Full Body Adattamento" : "Full Body GPP";
            if (phaseId === 3 || phaseId === 7) return days === 3 ? "Push-Pull-Legs Accumulo" : "Upper/Lower Split";
            if (phaseId === 5) return days === 3 ? "Upper/Lower/Arms Picco" : "Power / Hypertrophy PHAT";
            return "Tapering & Test Massimali";
        }
    };

})();
