/**
 * js/logic/phase-builder.js
 * AI Workout Generator - Multi-Phase Blueprints, Split Structure & Progression Matrix
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
     * Motore di generazione delle fasi e dei macrocicli (fino a 16 settimane, 4-8 fasi).
     */
    window.WorkoutGeneratorAI.prototype._generatePhases = function (params, validExercises, classification, riskProfile) {
        const isClinical = params.patientType === 'Clinico' || params.patientType === 'Clinico_Anziano';
        const method = this._selectPeriodizationMethod(params);
        const sport = params.sportPraticato || params.sport;
        const isEndurance = !isClinical && sport === 'Endurance';
        const daysCount = isEndurance ? Math.min(2, parseInt(params.days) || 2) : parseInt(params.days) || 3;
        const hasKneePathology = (params.injuries || []).some(id => 
            ['post_op_lca', 'lesione_lca', 'knee_generic', 'gonarthrosis', 'patellar_tendonitis', 'condromalacia_rotulea', 'meniscus'].includes(id)
        );
        let weeksTotal = parseInt(params.weeks);
        if (isNaN(weeksTotal) || weeksTotal <= 0) {
            weeksTotal = 12;
        } else if (weeksTotal > 16) {
            weeksTotal = 16;
        }
        
        const phaseBlueprints = [];

        if (isClinical) {
            const numPhases = Math.ceil(weeksTotal / 4) * 2;
            const getWeeksString = (id) => {
                if (id % 2 === 1) {
                    const start = (id - 1) * 2 + 1;
                    const end = (id - 1) * 2 + 3;
                    return `Settimane ${start}-${end}`;
                } else {
                    const w = id * 2;
                    return `Settimana ${w}`;
                }
            };
            
            for (let i = 1; i <= numPhases; i++) {
                const weeksStr = getWeeksString(i);
                const isDeload = (i % 2 === 0);
                if (i === 1) {
                    phaseBlueprints.push({ id: 1, weeks: weeksStr, name: "Fase 1: Mobilità & Adattamento Isometrico", focus: "Stabilità, Isometrica, Basso Carico", isDeload, rpeCap: 6, kneeROM: 60, objective: "Costruzione di stabilità core, attivazione glutei e isometrica per il controllo articolare con ROM ridotto a 60°." });
                } else if (i === 2) {
                    phaseBlueprints.push({ id: 2, weeks: weeksStr, name: "Fase 2: Scarico Attivo & Allungamento", focus: "Scarico, Allungamento, Mobilità", isDeload, rpeCap: 5, kneeROM: 60, objective: "Fase di recupero attivo ed allungamento fasciale. Focus sul ripristino della deambulazione fluida." });
                } else if (i === 3) {
                    phaseBlueprints.push({ id: 3, weeks: weeksStr, name: "Fase 3: Forza Eccentrica Controllata", focus: "Eccentrico, Propriocezione, ROM 80°", isDeload, rpeCap: 7, kneeROM: 80, objective: "Condizionamento eccentrico dei tessuti (quadricipiti/ischio) e miglioramento della propriocezione monopodalica. ROM a 80°." });
                } else if (i === 4) {
                    phaseBlueprints.push({ id: 4, weeks: weeksStr, name: "Fase 4: Scarico Clinico & Propriocezione", focus: "Rilascio Miofasciale, Propriocezione, Rigenerazione", isDeload, rpeCap: 5, kneeROM: 80, objective: "Scarico clinico rigenerativo profondo post-eccentrico. Focus su propriocezione articolare fine." });
                } else if (i === 5) {
                    phaseBlueprints.push({ id: 5, weeks: weeksStr, name: "Fase 5: Forza Muscolare Dinamica & Ipertrofia", focus: "Forza Dinamica, Ipertrofia, ROM 90°", isDeload, rpeCap: 8, kneeROM: 90, objective: "Ripristino della forza dinamica bilaterale e monolaterale. ROM ginocchio fino a 90° (parallelo). RPE massimo 8." });
                } else if (i === 6) {
                    phaseBlueprints.push({ id: 6, weeks: weeksStr, name: "Fase 6: Test Funzionale & Transizione", focus: "Test di Forza, Test Stabilità, Transizione", isDeload, rpeCap: 7.5, kneeROM: 90, objective: "Tapering e test submassimali di simmetria e mobilità per verificar l'idoneità al ritorno alle attività generali." });
                } else if (i === 7) {
                    phaseBlueprints.push({ id: 7, weeks: weeksStr, name: "Fase 7: Forza Funzionale & Propriocezione Avanzata", focus: "Forza Funzionale, Propriocezione Dinamica, Agilità", isDeload, rpeCap: 8, kneeROM: 90, objective: "Integrazione di compiti motori complessi, stabilità dinamica avanzata e propriocezione in contesti instabili controllati." });
                } else if (i === 8) {
                    phaseBlueprints.push({ id: 8, weeks: weeksStr, name: "Fase 8: Ritorno all'Attività & Scarico", focus: "Ritorno Attività, Scarico, Test Funzionali Finali", isDeload, rpeCap: 6, kneeROM: 90, objective: "Scarico clinico finale e test di dimissione funzionale per il rientro in sicurezza all'attività sportiva o quotidiana." });
                }
            }
        } else {
            if (method === 'LINEAR') {
                const numPhases = Math.ceil(weeksTotal / 4) * 2;
                for (let i = 1; i <= numPhases; i++) {
                    const pWeeks = Math.floor(weeksTotal / numPhases) || 1;
                    const start = (i - 1) * pWeeks + 1;
                    const end = i === numPhases ? weeksTotal : i * pWeeks;
                    const weeksStr = start === end ? `Settimana ${start}` : `Settimane ${start}-${end}`;
                    
                    if (i === 1) {
                        phaseBlueprints.push({ id: 1, periodizationMethod: 'LINEAR', weeks: weeksStr, name: "Fase 1: Adattamento Neuromuscolare", focus: "Adattamento, Tecnica, Volume Moderato", isDeload: false, rpeCap: 7, kneeROM: 120, sets: 3, reps: "12-15", rest: "60s", load: "60% RM", vol: "Alto", int: "60% RM", objective: "Costruzione di una solida base articolare e muscolare. Focus sull'apprendimento motorio e stabilità." });
                    } else if (i === 2) {
                        phaseBlueprints.push({ id: 2, periodizationMethod: 'LINEAR', weeks: weeksStr, name: "Fase 2: Ipertrofia di Base", focus: "Ipertrofia, Volume Moderato-Alto, Intensità Media", isDeload: false, rpeCap: 7.5, kneeROM: 120, sets: 4, reps: "10-12", rest: "75s", load: "67% RM", vol: "Moderato", int: "67% RM", objective: "Aumento della sezione trasversa del muscolo (ipertrofia) e consolidamento degli schemi di spinta/trazione." });
                    } else if (i === 3) {
                        phaseBlueprints.push({ id: 3, periodizationMethod: 'LINEAR', weeks: weeksStr, name: "Fase 3: Forza Funzionale", focus: "Forza Generale, Volume Moderato, Intensità Alta", isDeload: false, rpeCap: 8, kneeROM: 120, sets: 4, reps: "6-8", rest: "90-120s", load: "75% RM", vol: "Medio-Basso", int: "75% RM", objective: "Miglioramento della forza massima e della coordinazione intermuscolare tramite carichi submassimali." });
                    } else if (i === 4) {
                        phaseBlueprints.push({ id: 4, periodizationMethod: 'LINEAR', weeks: weeksStr, name: "Fase 4: Picco e Test", focus: "Intensità Massima, Volume Basso, Picco", isDeload: false, rpeCap: 9, kneeROM: 120, sets: 5, reps: "3-5", rest: "3-5 min", load: "85% RM", vol: "Basso", int: "85% RM", objective: "Massima espressione di forza con carichi elevati. Tapering del volume per ridurre la fatica e test finale." });
                    }

                    if (!phaseBlueprints[i-1]) {
                        const isDeload = (i % 2 === 0);
                        const phaseName = isDeload ? `Fase ${i}: Scarico Funzionale` : `Fase ${i}: Consolidamento`;
                        const phaseFocus = isDeload ? "Scarico Attivo, Recupero" : "Consolidamento, Carichi Medi";
                        const phaseVol = isDeload ? "Basso" : "Moderato";
                        const phaseInt = isDeload ? "Carichi Leggeri" : "70% RM";
                        phaseBlueprints.push({
                            id: i,
                            periodizationMethod: 'LINEAR',
                            weeks: weeksStr,
                            name: phaseName,
                            focus: phaseFocus,
                            isDeload,
                            rpeCap: isDeload ? 6 : 8,
                            kneeROM: 120,
                            sets: isDeload ? 2 : 3,
                            reps: "10",
                            rest: "90s",
                            load: isDeload ? "60% RM" : "70% RM",
                            vol: phaseVol,
                            int: phaseInt,
                            objective: isDeload ? "Fase di scarico attivo per recuperare fatica sistemica." : "Fase di consolidamento degli adattamenti neuromuscolari."
                        });
                    }
                }
            } else {
                const numPhases = Math.ceil(weeksTotal / 4) * 2;
                const getWeeksString = (id) => {
                    if (id % 2 === 1) {
                        const start = Math.floor((id - 1) / 2) * 4 + 1;
                        const end = start + 2;
                        return `Settimane ${start}-${end}`;
                    } else {
                        const w = Math.floor((id - 1) / 2) * 4 + 4;
                        return `Settimana ${w}`;
                    }
                };
                
                for (let i = 1; i <= numPhases; i++) {
                    const weeksStr = getWeeksString(i);
                    const isDeload = (i % 2 === 0);
                    
                    if (method === 'BLOCK') {
                        if (i === 1) {
                            phaseBlueprints.push({ id: 1, periodizationMethod: 'BLOCK', weeks: weeksStr, name: "Fase 1: Accumulazione (Carico)", focus: "Accumulo Volume, Intensità Moderata, RPE 7", isDeload, rpeCap: 7, kneeROM: 120, sets: 5, reps: "10-12", rest: "90s", load: "67% RM", vol: "Molto Alto", int: "67% RM", objective: "Fase di accumulo concentrata sul volume di lavoro per indurre adattamenti ipertrofici e capacità di lavoro. RPE 7." });
                        } else if (i === 2) {
                            phaseBlueprints.push({ id: 2, periodizationMethod: 'BLOCK', weeks: weeksStr, name: "Fase 2: Scarico Accumulazione", focus: "Scarico Attivo, Rigenerazione, RPE 6", isDeload, rpeCap: 6, kneeROM: 120, sets: 3, reps: "10-12", rest: "90s", load: "60% RM", vol: "Basso", int: "60% RM (Scarico)", objective: "Scarico attivo al termine del blocco di accumulazione per smaltire la fatica accumulata. Volume ridotto del 40%." });
                        } else if (i === 3) {
                            phaseBlueprints.push({ id: 3, periodizationMethod: 'BLOCK', weeks: weeksStr, name: "Fase 3: Intensificazione (Carico)", focus: "Forza Submassimale, Volume Moderato, RPE 8.5", isDeload, rpeCap: 8.5, kneeROM: 120, sets: 4, reps: "5-7", rest: "2-3 min", load: "82% RM", vol: "Medio-Alto", int: "82% RM", objective: "Transizione verso carichi più pesanti per convertire l'ipertrofia in forza massima. RPE 8.5." });
                        } else if (i === 4) {
                            phaseBlueprints.push({ id: 4, periodizationMethod: 'BLOCK', weeks: weeksStr, name: "Fase 4: Scarico Intensificazione", focus: "Scarico Attivo, Recupero Centrale, RPE 6", isDeload, rpeCap: 6, kneeROM: 120, sets: 2, reps: "5-7", rest: "2-3 min", load: "70% RM", vol: "Basso", int: "70% RM (Scarico)", objective: "Scarico attivo post-intensificazione per rigenerare il sistema nervoso centrale e prepararsi al blocco di picco." });
                        } else if (i === 5) {
                            phaseBlueprints.push({ id: 5, periodizationMethod: 'BLOCK', weeks: weeksStr, name: "Fase 5: Realizzazione (Picco di Forza)", focus: "Forza Massima, Reclutamento Neuromuscolare, RPE 9.5", isDeload, rpeCap: 9.5, kneeROM: 120, sets: 3, reps: "1-3", rest: "4-5 min", load: "93% RM", vol: "Basso", int: "93% RM", objective: "Fase di realizzazione con carichi massimali per esprimere il picco di forza e potenza neurale. RPE 9.5." });
                        } else if (i === 6) {
                            phaseBlueprints.push({ id: 6, periodizationMethod: 'BLOCK', weeks: weeksStr, name: "Fase 6: Tapering & Scarico Finale", focus: "Supercompensazione, Tapering, Recupero, RPE 6", isDeload, rpeCap: 6, kneeROM: 120, sets: 2, reps: "1-3", rest: "4-5 min", load: "80% RM", vol: "Basso-Minimo", int: "80% RM (Scarico)", objective: "Tapering finale del volume con intensità controllata per promuovere la supercompensazione delle capacità atletiche." });
                        } else if (i === 7) {
                            phaseBlueprints.push({ id: 7, periodizationMethod: 'BLOCK', weeks: weeksStr, name: "Fase 7: Potenza Dinamica", focus: "Esplosività, RFD, RPE 8.5", isDeload, rpeCap: 8.5, kneeROM: 120, sets: 3, reps: "3-5", rest: "3 min", load: "60% RM", vol: "Moderato", int: "60% RM", objective: "Sviluppo della potenza specifica e della velocità di contrazione con carichi esplosivi." });
                        } else if (i === 8) {
                            phaseBlueprints.push({ id: 8, periodizationMethod: 'BLOCK', weeks: weeksStr, name: "Fase 8: Scarico & Test Finale", focus: "Tapering, Test Funzionale, RPE 6", isDeload, rpeCap: 6, kneeROM: 120, sets: 2, reps: "3-5", rest: "3 min", load: "50% RM", vol: "Basso", int: "50% RM (Scarico)", objective: "Scarico e test dei massimali per validare i progressi ottenuti nel macrociclo." });
                        }
                    } else if (method === 'DUP') {
                        if (i === 1) {
                            phaseBlueprints.push({ id: 1, periodizationMethod: 'DUP', weeks: weeksStr, name: "Fase 1: DUP Accumulo", focus: "Ondulazione Volume/Intensità, Accumulo", isDeload, rpeCap: 8, kneeROM: 120, vol: "Alto (Ondulato)", int: "Variabile (55-85% RM)", objective: "Periodizzazione Ondulata Giornaliera. Ogni seduta varia lo stimolo per massimizzare forza e ipertrofia prevenendo l'adattamento." });
                        } else if (i === 2) {
                            phaseBlueprints.push({ id: 2, periodizationMethod: 'DUP', weeks: weeksStr, name: "Fase 2: DUP Scarico Attivo", focus: "Scarico Ondulato, Rigenerazione", isDeload, rpeCap: 6, kneeROM: 120, vol: "Basso (Scarico)", int: "Variabile Leggera", objective: "Scarico attivo ondulato. Riduzione del volume del 40-50% con mantenimento della variabilità degli stimoli." });
                        } else if (i === 3) {
                            phaseBlueprints.push({ id: 3, periodizationMethod: 'DUP', weeks: weeksStr, name: "Fase 3: DUP Intensificazione", focus: "Ondulazione Avanzata, Intensificazione", isDeload, rpeCap: 8.5, kneeROM: 120, vol: "Molto Alto", int: "Variabile (+3% Carico)", objective: "Incremento dell'intensità media settimanale con progressione dei carichi (+2.5-5%) su tutti i giorni di allenamento." });
                        } else if (i === 4) {
                            phaseBlueprints.push({ id: 4, periodizationMethod: 'DUP', weeks: weeksStr, name: "Fase 4: DUP Scarico Rigenerativo", focus: "Scarico Rigenerativo, Mobilità", isDeload, rpeCap: 6, kneeROM: 120, vol: "Basso (Scarico)", int: "Variabile Leggera", objective: "Scarico rigenerativo profondo per dissipare la fatica accumulata e preparare il picco neurale." });
                        } else if (i === 5) {
                            phaseBlueprints.push({ id: 5, periodizationMethod: 'DUP', weeks: weeksStr, name: "Fase 5: DUP Realizzazione & Picco", focus: "Picco Ondulato, Massima Intensità", isDeload, rpeCap: 9.5, kneeROM: 120, vol: "Medio (Picco)", int: "Variabile (+5% Carico)", objective: "Picco di intensità neuromuscolare. Alternanza di giornate a bassissime ripetizioni pesanti e giornate esplosive." });
                        } else if (i === 6) {
                            phaseBlueprints.push({ id: 6, periodizationMethod: 'DUP', weeks: weeksStr, name: "Fase 6: DUP Test & Tapering", focus: "Tapering, Test Funzionali", isDeload, rpeCap: 6, kneeROM: 120, vol: "Basso (Taper)", int: "Test Massimali", objective: "Tapering finale e test dei massimali sui tre giorni di allenamento con carichi crescenti." });
                        } else if (i === 7) {
                            phaseBlueprints.push({ id: 7, periodizationMethod: 'DUP', weeks: weeksStr, name: "Fase 7: DUP Potenza & RFD", focus: "Potenza, Esplosività", isDeload, rpeCap: 8, kneeROM: 120, vol: "Moderato", int: "Carichi Esplosivi", objective: "DUP orientata allo sviluppo della potenza reattiva e velocità di reclutamento motorio." });
                        } else if (i === 8) {
                            phaseBlueprints.push({ id: 8, periodizationMethod: 'DUP', weeks: weeksStr, name: "Fase 8: DUP Scarico Finale", focus: "Scarico & Valutazione Finale", isDeload, rpeCap: 6, kneeROM: 120, vol: "Basso", int: "Carichi Leggeri", objective: "Valutazione finale e de-attivazione sistematica per supercompensazione finale." });
                        }
                    } else if (method === 'CONJUGATE') {
                        if (i === 1) {
                            phaseBlueprints.push({ id: 1, periodizationMethod: 'CONJUGATE', weeks: weeksStr, name: "Fase 1: Accumulazione Coniugata", focus: "ME/DE Rotation, Forza e Velocità", isDeload, rpeCap: 9, kneeROM: 120, vol: "Alto (Combinato)", int: "ME (>85%) / DE (60%)", objective: "Sviluppo simultaneo di Forza Massima (giorni ME) e Velocità (giorni DE) per prevenire la stagnazione neuromuscolare." });
                        } else if (i === 2) {
                            phaseBlueprints.push({ id: 2, periodizationMethod: 'CONJUGATE', weeks: weeksStr, name: "Fase 2: Scarico Coniugato", focus: "Scarico Tecnico, Rigenerazione", isDeload, rpeCap: 6, kneeROM: 120, vol: "Basso (Scarico)", int: "DE Tecnica", objective: "Fase di scarico attivo. Riduzione del volume del 40%, mantenimento dei carichi di velocità ma senza giorni ME per caricarsi." });
                        } else if (i === 3) {
                            phaseBlueprints.push({ id: 3, periodizationMethod: 'CONJUGATE', weeks: weeksStr, name: "Fase 3: Intensificazione Coniugata", focus: "Rotazione ME, Velocità Reattiva", isDeload, rpeCap: 9.5, kneeROM: 120, vol: "Molto Alto", int: "ME Avanzato / DE Esplosivo", objective: "Intensificazione del lavoro ME con carichi submassimali e pliometria avanzata nei giorni DE." });
                        } else if (i === 4) {
                            phaseBlueprints.push({ id: 4, periodizationMethod: 'CONJUGATE', weeks: weeksStr, name: "Fase 4: Scarico Coniugato Rigenerativo", focus: "Scarico Articolare, Mobilità", isDeload, rpeCap: 6, kneeROM: 120, vol: "Basso (Scarico)", int: "DE Tecnica", objective: "Scarico per articolazioni e colonna vertebrale dopo il blocco di intensità. Focus su mobilità e flessibilità." });
                        } else if (i === 5) {
                            phaseBlueprints.push({ id: 5, periodizationMethod: 'CONJUGATE', weeks: weeksStr, name: "Fase 5: Realizzazione Coniugata", focus: "Picco Massimale, Massima Potenza", isDeload, rpeCap: 9.5, kneeROM: 120, vol: "Medio (Picco)", int: "Max Effort Picco", objective: "Picco massimale del macrociclo. Rotazione settimanale delle alzate ME per testare il picco di forza." });
                        } else if (i === 6) {
                            phaseBlueprints.push({ id: 6, periodizationMethod: 'CONJUGATE', weeks: weeksStr, name: "Fase 6: Tapering & Test Coniugato", focus: "Tapering, Test 1RM", isDeload, rpeCap: 6, kneeROM: 120, vol: "Basso (Taper)", int: "Test 1RM", objective: "Tapering e test finale 1RM per verificare il guadagno complessivo di forza." });
                        } else if (i === 7) {
                            phaseBlueprints.push({ id: 7, periodizationMethod: 'CONJUGATE', weeks: weeksStr, name: "Fase 7: Coniugata Picco Potenza", focus: "Power & Explosiveness", isDeload, rpeCap: 8.5, kneeROM: 120, vol: "Medio", int: "Carichi Esplosivi", objective: "Fase orientata allo sviluppo della potenza massima coniugata con carichi medio-bassi e massima accelerazione." });
                        } else if (i === 8) {
                            phaseBlueprints.push({ id: 8, periodizationMethod: 'CONJUGATE', weeks: weeksStr, name: "Fase 8: Scarico Finale & Test 1RM", focus: "Valutazione Finale 1RM", isDeload, rpeCap: 6, kneeROM: 120, vol: "Basso", int: "Scarico", objective: "Valutazione finale delle alzate base e scarico complessivo per compensazione neuromuscolare." });
                        }
                    } else if (method === 'POLARIZED') {
                        if (i === 1) {
                            phaseBlueprints.push({ id: 1, periodizationMethod: 'POLARIZED', weeks: weeksStr, name: "Fase 1: Accumulazione Polarizzata", focus: "Endurance & Bimodalità, RPE 5-6 / 9", isDeload, rpeCap: 9.5, kneeROM: 120, vol: "Molto Alto", int: "80% Zone 1-2 / 20% Zone 4-5", objective: "Fase di accumulo basata sul modello 80/20. Massima enfasi sul volume a bassa intensità per gli adattamenti mitocondriali." });
                        } else if (i === 2) {
                            phaseBlueprints.push({ id: 2, periodizationMethod: 'POLARIZED', weeks: weeksStr, name: "Fase 2: Scarico Polarizzato", focus: "Scarico Rigenerativo, Recupero Attivo", isDeload, rpeCap: 6, kneeROM: 120, vol: "Basso", int: "100% Zone 1-2 Leggere", objective: "Fase di scarico attivo. Rimozione delle sessioni ad alta intensità, solo lavoro a bassissima intensità per recupero completo." });
                        } else if (i === 3) {
                            phaseBlueprints.push({ id: 3, periodizationMethod: 'POLARIZED', weeks: weeksStr, name: "Fase 3: Intensificazione Polarizzata", focus: "Progressione Volume Aerobico & Picco Potenza", isDeload, rpeCap: 9.5, kneeROM: 120, vol: "Massimo", int: "80% Zone 1-2 / 20% VO2 Max", objective: "Intensificazione. Progressione delle sessioni Zone 4-5 ad alta intensità per migliorare il VO2 Max e la soglia lattacida." });
                        } else if (i === 4) {
                            phaseBlueprints.push({ id: 4, periodizationMethod: 'POLARIZED', weeks: weeksStr, name: "Fase 4: Scarico Polarizzato Rigenerativo", focus: "Scarico Rigenerativo, Flessibilità", isDeload, rpeCap: 6, kneeROM: 120, vol: "Basso", int: "100% Zone 1-2 Leggere", objective: "Scarico profondo per dissipare la fatica accumulata a livello cardiaco e muscolare. Solo Zone 1-2 leggere." });
                        } else if (i === 5) {
                            phaseBlueprints.push({ id: 5, periodizationMethod: 'POLARIZED', weeks: weeksStr, name: "Fase 5: Realizzazione Polarizzata", focus: "Massima Polarizzazione, VO2 Max", isDeload, rpeCap: 10, kneeROM: 120, vol: "Medio (Picco)", int: "80% Zone 1-2 / 20% Max Potenza", objective: "Massima polarizzazione degli stimoli. Sedute ad alta intensità spinte al limite neuromuscolare con recuperi completi." });
                        } else if (i === 6) {
                            phaseBlueprints.push({ id: 6, periodizationMethod: 'POLARIZED', weeks: weeksStr, name: "Fase 6: Tapering & Test Finale", focus: "Tapering, Test de Performance", isDeload, rpeCap: 6, kneeROM: 120, vol: "Basso (Taper)", int: "Test Aerobici", objective: "Tapering finale e test di performance aerobica o submassimale per validare i guadagni di endurance." });
                        } else if (i === 7) {
                            phaseBlueprints.push({ id: 7, periodizationMethod: 'POLARIZED', weeks: weeksStr, name: "Fase 7: Polarizzata Picco Capacità", focus: "Performance Capacità Aerobica", isDeload, rpeCap: 9, kneeROM: 120, vol: "Medio", int: "Zone 4-5", objective: "Integrazione di carichi ad altissima frequenza per lo sviluppo del VO2 Max in preparazione di eventi specifici." });
                        } else if (i === 8) {
                            phaseBlueprints.push({ id: 8, periodizationMethod: 'POLARIZED', weeks: weeksStr, name: "Fase 8: Scarico Finale Aerobico", focus: "Scarico Finale, Rigenerazione", isDeload, rpeCap: 6, kneeROM: 120, vol: "Basso", int: "Zone 1-2", objective: "Tapering e recupero profondo delle riserve di glicogeno muscolare per completare l'adattamento polarizzato." });
                        }
                    }

                    // Safety fallback for i > 8
                    if (!phaseBlueprints[i-1]) {
                        const phaseName = isDeload ? `Fase ${i}: Scarico Funzionale` : `Fase ${i}: Consolidamento`;
                        const phaseFocus = isDeload ? "Scarico Attivo, Recupero" : "Consolidamento, Carichi Medi";
                        const phaseVol = isDeload ? "Basso" : "Moderato";
                        const phaseInt = isDeload ? "Carichi Leggeri" : "70% RM";
                        phaseBlueprints.push({
                            id: i,
                            periodizationMethod: method,
                            weeks: weeksStr,
                            name: phaseName,
                            focus: phaseFocus,
                            isDeload,
                            rpeCap: isDeload ? 6 : 8,
                            kneeROM: 120,
                            sets: isDeload ? 2 : 3,
                            reps: "10",
                            rest: "90s",
                            load: isDeload ? "60% RM" : "70% RM",
                            vol: phaseVol,
                            int: phaseInt,
                            objective: isDeload ? "Fase di scarico attivo per recuperare fatica sistemica." : "Fase di consolidamento degli adattamenti neuromuscolari."
                        });
                    }
                }
            }
        }

        return phaseBlueprints.map(blueprint => {
            const phaseSplitStructure = this._getSplitStructureForPhase(blueprint.id, daysCount, isClinical, method);
            
            const phaseSchedule = phaseSplitStructure.map(day => {
                if (day.type === 'Rest') return { name: day.name, isRest: true, exercises: [] };

                let session = [];
                if (isClinical && hasKneePathology) {
                    session = this._buildClinicalKneeSession(blueprint.id, day.focus, validExercises, blueprint);
                } else {
                    session = this._buildDynamicSession(blueprint.id, day.focus, validExercises, params, blueprint);
                }
                return { name: day.name, focus: day.focus, exercises: session };
            });

            phaseSchedule.forEach(day => {
                if (day.isRest) return;
                
                day.exercises = this._addWarmupByPhase(blueprint.id, day.exercises, day.focus, isClinical, params);
                day.exercises = this._addCooldownByPhase(blueprint.id, day.exercises, isClinical, params);

                day.exercises.forEach(ex => {
                    if (ex.isWarmup || ex.isCardio) return;

                    const formattedEx = this._formatExerciseForPhase(ex, ex.isMain ? 'Main' : 'Accessory', params, blueprint, day);
                    
                    ex.specs = formattedEx.specs;
                    ex.isadapted = formattedEx.isadapted;
                    ex.note = formattedEx.note;
                });
                
                day.estDuration = this._calculateDuration(day.exercises);
            });

            return {
                id: blueprint.id,
                name: blueprint.name,
                weeks: blueprint.weeks,
                objective: blueprint.objective,
                focus: blueprint.focus,
                vol: blueprint.vol,
                int: blueprint.int,
                splitName: this._getPhaseSplitName(blueprint.id, daysCount, isClinical, method),
                isDeload: blueprint.isDeload,
                schedule: phaseSchedule
            };
        });
    };

    /**
     * Struttura dello split per ciascuna fase e metodo.
     */
    window.WorkoutGeneratorAI.prototype._getSplitStructureForPhase = function (phaseId, days, isClinical, method = 'LINEAR') {
        if (isClinical) {
            if (phaseId === 2 || phaseId === 4 || phaseId === 8) {
                return [
                    { name: 'Giorno 1: Mobilità & Allungamento', type: 'Work', focus: ['Mobilità', 'Allungamento'] },
                    { name: 'Giorno 2: Stabilità & Core', type: 'Work', focus: ['Core', 'Spalle'] }
                ];
            }

            switch (days) {
                case 2:
                    return (phaseId === 3 || phaseId === 7)
                        ? [
                            { name: 'Giorno A: Catena Anteriore', type: 'Work', focus: ['Gambe', 'Petto'] },
                            { name: 'Giorno B: Catena Posteriore', type: 'Work', focus: ['Schiena', 'Glutei'] }
                          ]
                        : [
                            { name: 'Giorno A: Full Body Clinico', type: 'Work', focus: ['Gambe', 'Petto', 'Schiena'] },
                            { name: 'Giorno B: Core & Propriocezione', type: 'Work', focus: ['Core', 'Spalle', 'Gambe'] }
                          ];
                case 3:
                    if (phaseId === 1) {
                        return [
                            { name: 'Lunedì: Stabilità Core e Catena Posteriore', type: 'Work', focus: ['Glutei', 'Core', 'Schiena'] },
                            { name: 'Mercoledì: Mobilità Anca-Caviglia e Attivazione Ginocchio', type: 'Work', focus: ['Gambe', 'Mobilità'] },
                            { name: 'Venerdì: Rinforzo Core e Glutei (Basso Carico)', type: 'Work', focus: ['Core', 'Spalle', 'Glutei'] }
                        ];
                    } else if (phaseId === 3) {
                        return [
                            { name: 'Lunedì: Spinta & Catena Anteriore (Eccentrico)', type: 'Work', focus: ['Gambe', 'Petto', 'Tricipiti'] },
                            { name: 'Mercoledì: Trazione & Catena Posteriore', type: 'Work', focus: ['Schiena', 'Bicipiti'] },
                            { name: 'Venerdì: Stabilità Monopodalica & Core', type: 'Work', focus: ['Gambe', 'Core', 'Spalle'] }
                        ];
                    } else if (phaseId === 5 || phaseId === 7) {
                        return [
                            { name: 'Lunedì: Forza Muscolare Dinamica (Stance Simmetrica)', type: 'Work', focus: ['Gambe', 'Petto', 'Schiena'] },
                            { name: 'Mercoledì: Potenza & Coordinazione Monopodalica', type: 'Work', focus: ['Gambe', 'Spalle', 'Core'] },
                            { name: 'Venerdì: Ricondizionamento Zone 2 & Endurance', type: 'Work', focus: ['Cardio', 'Glutei', 'Gambe'] }
                        ];
                    } else {
                        return [
                            { name: 'Lunedì: Test di Forza & Flessibilità', type: 'Work', focus: ['Gambe', 'Mobilità'] },
                            { name: 'Mercoledì: Test di Stabilità & Core', type: 'Work', focus: ['Core', 'Spalle'] },
                            { name: 'Venerdì: Transizione & Recupero Attivo', type: 'Work', focus: ['Mobilità', 'Cardio'] }
                        ];
                    }
                case 4:
                case 5:
                case 6:
                    return (phaseId === 3 || phaseId === 7)
                        ? [
                            { name: 'Day 1: Upper Body Clinico', type: 'Work', focus: ['Petto', 'Schiena', 'Spalle'] },
                            { name: 'Day 2: Lower Body Clinico', type: 'Work', focus: ['Gambe', 'Glutei'] },
                            { name: 'Day 3: Core & Cardio', type: 'Work', focus: ['Core', 'Cardio'] },
                            { name: 'Day 4: Total Body Mobilità', type: 'Work', focus: ['Gambe', 'Spalle'] }
                          ]
                        : [
                            { name: 'Day 1: Spinta Clinica', type: 'Work', focus: ['Petto', 'Spalle'] },
                            { name: 'Day 2: Trazione Clinica', type: 'Work', focus: ['Schiena', 'Spalle'] },
                            { name: 'Day 3: Gambe Clinica', type: 'Work', focus: ['Gambe', 'Glutei'] },
                            { name: 'Day 4: Core & Stabilità', type: 'Work', focus: ['Core', 'Spalle'] }
                          ];
            }
        } else {
            if (method === 'DUP') {
                if (days === 2) {
                    return [
                        { name: 'Giorno A: Forza (Full Body)', type: 'Work', focus: ['Petto', 'Schiena', 'Gambe', 'Forza'] },
                        { name: 'Giorno B: Ipertrofia (Full Body)', type: 'Work', focus: ['Spalle', 'Braccia', 'Gambe', 'Ipertrofia'] }
                    ];
                } else if (days === 3) {
                    return [
                        { name: 'Lunedì: Giorno Forza (Total Body)', type: 'Work', focus: ['Petto', 'Schiena', 'Gambe', 'Forza'] },
                        { name: 'Mercoledì: Giorno Ipertrofia (Total Body)', type: 'Work', focus: ['Spalle', 'Braccia', 'Gambe', 'Ipertrofia'] },
                        { name: 'Venerdì: Giorno Potenza/Resistenza (Total Body)', type: 'Work', focus: ['Petto', 'Schiena', 'Core', 'Potenza'] }
                    ];
                } else if (days === 4) {
                    return [
                        { name: 'Lunedì: Upper Body Forza', type: 'Work', focus: ['Petto', 'Schiena', 'Spalle', 'Forza'] },
                        { name: 'Martedì: Lower Body Forza', type: 'Work', focus: ['Gambe', 'Core', 'Forza'] },
                        { name: 'Giovedì: Upper Body Ipertrofia', type: 'Work', focus: ['Petto', 'Schiena', 'Spalle', 'Ipertrofia'] },
                        { name: 'Venerdì: Lower Body Ipertrofia', type: 'Work', focus: ['Gambe', 'Core', 'Ipertrofia'] }
                    ];
                } else {
                    return [
                        { name: 'Giorno 1: Upper Body Forza', type: 'Work', focus: ['Petto', 'Schiena', 'Spalle', 'Forza'] },
                        { name: 'Giorno 2: Lower Body Forza', type: 'Work', focus: ['Gambe', 'Core', 'Forza'] },
                        { name: 'Giorno 3: Upper Body Ipertrofia', type: 'Work', focus: ['Petto', 'Schiena', 'Spalle', 'Ipertrofia'] },
                        { name: 'Giorno 4: Lower Body Ipertrofia', type: 'Work', focus: ['Gambe', 'Core', 'Ipertrofia'] },
                        { name: 'Giorno 5: Total Body Potenza/Resistenza', type: 'Work', focus: ['Gambe', 'Petto', 'Schiena', 'Potenza'] }
                    ];
                }
            }

            if (method === 'CONJUGATE') {
                if (days === 2) {
                    return [
                        { name: 'Giorno A: Max Effort (ME) Total Body', type: 'Work', focus: ['Petto', 'Schiena', 'Gambe', 'ME'] },
                        { name: 'Giorno B: Dynamic Effort (DE) Total Body', type: 'Work', focus: ['Spalle', 'Braccia', 'Gambe', 'DE'] }
                    ];
                } else if (days === 3) {
                    return [
                        { name: 'Lunedì: Max Effort (ME) Upper Body', type: 'Work', focus: ['Petto', 'Schiena', 'Spalle', 'ME'] },
                        { name: 'Mercoledì: Max Effort (ME) Lower Body', type: 'Work', focus: ['Gambe', 'Core', 'ME'] },
                        { name: 'Venerdì: Dynamic Effort (DE) Total Body', type: 'Work', focus: ['Petto', 'Schiena', 'Gambe', 'DE'] }
                    ];
                } else if (days === 4) {
                    return [
                        { name: 'Lunedì: Max Effort (ME) Lower Body', type: 'Work', focus: ['Gambe', 'Core', 'ME'] },
                        { name: 'Martedì: Max Effort (ME) Upper Body', type: 'Work', focus: ['Petto', 'Schiena', 'Spalle', 'ME'] },
                        { name: 'Giovedì: Dynamic Effort (DE) Lower Body', type: 'Work', focus: ['Gambe', 'Core', 'DE'] },
                        { name: 'Venerdì: Dynamic Effort (DE) Upper Body', type: 'Work', focus: ['Petto', 'Schiena', 'Spalle', 'DE'] }
                    ];
                } else {
                    return [
                        { name: 'Giorno 1: Max Effort (ME) Lower Body', type: 'Work', focus: ['Gambe', 'Core', 'ME'] },
                        { name: 'Giorno 2: Max Effort (ME) Upper Body', type: 'Work', focus: ['Petto', 'Schiena', 'Spalle', 'ME'] },
                        { name: 'Giorno 3: Dynamic Effort (DE) Lower Body', type: 'Work', focus: ['Gambe', 'Core', 'DE'] },
                        { name: 'Giorno 4: Dynamic Effort (DE) Upper Body', type: 'Work', focus: ['Petto', 'Schiena', 'Spalle', 'DE'] },
                        { name: 'Giorno 5: Accessory & Core Focus', type: 'Work', focus: ['Spalle', 'Braccia', 'Core'] }
                    ];
                }
            }

            if (method === 'POLARIZED') {
                if (days === 2) {
                    return [
                        { name: 'Giorno A: Zona 1-2 (Endurance & Stabilità)', type: 'Work', focus: ['Gambe', 'Core', 'Zona1-2'] },
                        { name: 'Giorno B: Zona 4-5 (Forza Massima)', type: 'Work', focus: ['Petto', 'Schiena', 'Gambe', 'Zona4-5'] }
                    ];
                } else if (days === 3) {
                    return [
                        { name: 'Lunedì: Zona 1-2 (Endurance & Stabilità)', type: 'Work', focus: ['Gambe', 'Core', 'Zona1-2'] },
                        { name: 'Mercoledì: Zona 1-2 (Capacità Aerobica)', type: 'Work', focus: ['Schiena', 'Braccia', 'Zona1-2'] },
                        { name: 'Venerdì: Zona 4-5 (Forza Neuromuscolare)', type: 'Work', focus: ['Petto', 'Schiena', 'Gambe', 'Zona4-5'] }
                    ];
                } else if (days === 4) {
                    return [
                        { name: 'Lunedì: Zona 1-2 (Endurance & Stabilità)', type: 'Work', focus: ['Gambe', 'Core', 'Zona1-2'] },
                        { name: 'Martedì: Zona 1-2 (Capacità Aerobica)', type: 'Work', focus: ['Schiena', 'Braccia', 'Zona1-2'] },
                        { name: 'Giovedì: Zona 4-5 (VO2 Max & Forza)', type: 'Work', focus: ['Petto', 'Schiena', 'Gambe', 'Zona4-5'] },
                        { name: 'Venerdì: Zona 1-2 (Recupero Attivo)', type: 'Work', focus: ['Mobilità', 'Core', 'Zona1-2'] }
                    ];
                } else {
                    return [
                        { name: 'Giorno 1: Zona 1-2 (Endurance & Stabilità)', type: 'Work', focus: ['Gambe', 'Core', 'Zona1-2'] },
                        { name: 'Giorno 2: Zona 1-2 (Capacità Aerobica)', type: 'Work', focus: ['Schiena', 'Braccia', 'Zona1-2'] },
                        { name: 'Giorno 3: Zona 4-5 (VO2 Max & Forza)', type: 'Work', focus: ['Petto', 'Schiena', 'Gambe', 'Zona4-5'] },
                        { name: 'Giorno 4: Zona 1-2 (Recupero Attivo)', type: 'Work', focus: ['Mobilità', 'Core', 'Zona1-2'] },
                        { name: 'Giorno 5: Zona 1-2 (Tolleranza Lattato)', type: 'Work', focus: ['Gambe', 'Spalle', 'Zona1-2'] }
                    ];
                }
            }

            if (phaseId === 2 || phaseId === 4 || phaseId === 6 || phaseId === 8) {
                return [
                    { name: 'Giorno 1: Rigenerazione Catena Anteriore', type: 'Work', focus: ['Petto', 'Spalle', 'Tricipiti'] },
                    { name: 'Giorno 2: Rigenerazione Catena Posteriore', type: 'Work', focus: ['Schiena', 'Bicipiti', 'Gambe'] }
                ];
            }

            switch (days) {
                case 2:
                    return (phaseId === 3 || phaseId === 7)
                        ? [
                            { name: 'Day A: Upper Body Strength', type: 'Work', focus: ['Petto', 'Schiena', 'Spalle'] },
                            { name: 'Day B: Lower Body Strength', type: 'Work', focus: ['Gambe', 'Core'] }
                          ]
                        : [
                            { name: 'Day A: Full Body Power', type: 'Work', focus: ['Petto', 'Schiena', 'Gambe'] },
                            { name: 'Day B: Full Body Hypertrophy', type: 'Work', focus: ['Spalle', 'Braccia', 'Gambe'] }
                          ];
                case 3:
                    if (phaseId === 1) {
                        return [
                            { name: 'Lunedì: Full Body A (Adattamento)', type: 'Work', focus: ['Petto', 'Schiena', 'Gambe'] },
                            { name: 'Mercoledì: Full Body B (Adattamento)', type: 'Work', focus: ['Spalle', 'Braccia', 'Gambe'] },
                            { name: 'Venerdì: Full Body C (Adattamento)', type: 'Work', focus: ['Petto', 'Schiena', 'Core'] }
                        ];
                    } else if (phaseId === 3 || phaseId === 7) {
                        return [
                            { name: 'Lunedì: Day 1 - Spinta (Push)', type: 'Work', focus: ['Petto', 'Spalle', 'Tricipiti'] },
                            { name: 'Mercoledì: Day 2 - Trazione (Pull)', type: 'Work', focus: ['Schiena', 'Bicipiti'] },
                            { name: 'Venerdì: Day 3 - Gambe (Legs)', type: 'Work', focus: ['Gambe', 'Polpacci'] }
                        ];
                    } else {
                        return [
                            { name: 'Lunedì: Day 1 - Upper Body (Picco)', type: 'Work', focus: ['Petto', 'Schiena', 'Spalle'] },
                            { name: 'Mercoledì: Day 2 - Lower Body (Picco)', type: 'Work', focus: ['Gambe', 'Glutei'] },
                            { name: 'Venerdì: Day 3 - Braccia & Core (Picco)', type: 'Work', focus: ['Spalle', 'Braccia', 'Core'] }
                        ];
                    }
                case 4:
                    return (phaseId === 3 || phaseId === 7)
                        ? [
                            { name: 'Lunedì: Spinta A', type: 'Work', focus: ['Petto', 'Spalle'] },
                            { name: 'Martedì: Trazione A', type: 'Work', focus: ['Schiena', 'Bicipiti'] },
                            { name: 'Giovedì: Gambe A', type: 'Work', focus: ['Gambe'] },
                            { name: 'Venerdì: Upper Body Focus', type: 'Work', focus: ['Petto', 'Schiena'] }
                          ]
                        : [
                            { name: 'Lunedì: Upper Power', type: 'Work', focus: ['Petto', 'Schiena'] },
                            { name: 'Martedì: Lower Power', type: 'Work', focus: ['Gambe'] },
                            { name: 'Giovedì: Upper Hypertrophy', type: 'Work', focus: ['Spalle', 'Braccia'] },
                            { name: 'Venerdì: Lower Hypertrophy', type: 'Work', focus: ['Gambe', 'Glutei'] }
                          ];
                default:
                    return (phaseId === 3 || phaseId === 7)
                        ? [
                            { name: 'Giorno 1: Upper Power', type: 'Work', focus: ['Petto', 'Schiena'] },
                            { name: 'Giorno 2: Lower Power', type: 'Work', focus: ['Gambe'] },
                            { name: 'Giorno 3: Push Hyper', type: 'Work', focus: ['Petto', 'Spalle'] },
                            { name: 'Giorno 4: Pull Hyper', type: 'Work', focus: ['Schiena'] },
                            { name: 'Giorno 5: Legs Hyper', type: 'Work', focus: ['Gambe'] }
                          ]
                        : [
                            { name: 'Giorno 1: Push A', type: 'Work', focus: ['Petto', 'Spalle', 'Tricipiti'] },
                            { name: 'Giorno 2: Pull A', type: 'Work', focus: ['Schiena', 'Bicipiti'] },
                            { name: 'Giorno 3: Legs A', type: 'Work', focus: ['Gambe'] },
                            { name: 'Giorno 4: Push B', type: 'Work', focus: ['Spalle', 'Petto'] },
                            { name: 'Giorno 5: Pull B', type: 'Work', focus: ['Schiena'] }
                          ];
            }
        }
    };

    /**
     * Matrice riassuntiva della progressione del macrociclo.
     */
    window.WorkoutGeneratorAI.prototype._getProgressionTable = function (params, phases) {
        return phases.map(phase => {
            let vol = phase.vol || "Medio";
            let intensity = phase.int || "70-75% RM";
            
            if (!phase.vol) {
                if (phase.isDeload) {
                    vol = "Basso";
                    intensity = "RPE 5 (Scarico)";
                } else {
                    if (phase.id === 1) {
                        vol = "Moderato";
                        intensity = (params.patientType === 'Clinico' || params.patientType === 'Clinico_Anziano') ? "RPE 6 (Isometria)" : "65-70% RM";
                    } else if (phase.id === 3 || phase.id === 7) {
                        vol = "Alto";
                        intensity = (params.patientType === 'Clinico' || params.patientType === 'Clinico_Anziano') ? "RPE 7 (Eccentrico)" : "75-80% RM";
                    } else if (phase.id === 5) {
                        vol = "Molto Alto";
                        intensity = (params.patientType === 'Clinico' || params.patientType === 'Clinico_Anziano') ? "RPE 7.5-8 (Dinamico)" : "80-90% RM";
                    }
                }
            }
            
            const phaseNameStr = phase.name.includes(':') ? phase.name.split(':')[1].trim() : phase.name;
            return { weeks: phase.weeks, phase: phaseNameStr, vol, int: intensity, note: phase.focus };
        });
    };

})();
