/**
 * js/logic/session-builder.js
 * AI Workout Generator - Clinical Knee Protocols, Dynamic Athletic Sessions & Selection Logic
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
     * Verifica compatibilità esercizio con l'attrezzatura selezionata dall'utente.
     */
    window.WorkoutGeneratorAI.prototype._checkEquipment = function (ex, userEq) {
        const eq = ex.equipment || 'Corpo Libero';
        if (userEq === 'Calisthenics') return eq === 'Corpo Libero' || eq === 'Sbarra Trazioni';
        if (userEq === 'Minimal') return ['Corpo Libero', 'Manubri', 'Bilanciere', 'Panca'].includes(eq);
        return true;
    };

    /**
     * Selezione casuale controllata senza duplicati all'interno della stessa seduta.
     */
    window.WorkoutGeneratorAI.prototype._pickRandom = function (arr, session = []) {
        const available = arr.filter(ex => !session.some(s => s.id === ex.id));
        if (available.length === 0) return null; // Pool esaurito — nessun duplicato
        return available[Math.floor(Math.random() * available.length)];
    };

    /**
     * Generatore chirurgico di protocolli riabilitativi per patologie di ginocchio.
     */
    window.WorkoutGeneratorAI.prototype._buildClinicalKneeSession = function (phaseId, focus, pool, phaseBlueprint) {
        let session = [];
        if (phaseId === 1) {
            if (focus.includes('Glutei') || focus.includes('Core')) {
                session.push(
                    { id: 'cli_01', name: 'Isometric Wall Sit (Angolo limitato a 60° flessione)', primaryMuscle: 'Gambe', type: 'Isometrico', specs: { sets: 3, reps: '30s', rest: '60s', rpe: 6, tempo: 'Isometria', load: 'A corpo libero' }, note: 'Limitare flessione ginocchio a 60°. Schiaccia una pallina morbida tra le ginocchia.' },
                    { id: 'cli_02', name: 'Ponte Glutei Monolaterale (a terra)', primaryMuscle: 'Glutei', type: 'Isolamento', specs: { sets: 3, reps: '10/lato', rest: '60s', rpe: 6, tempo: '2-1-2', load: 'A corpo libero' }, note: 'Spingi dal tallone, contrai il gluteo attivamente senza inarcare la schiena.' },
                    { id: 'cli_03', name: 'Standard Plank sui gomiti', primaryMuscle: 'Core', type: 'Isometrico', specs: { sets: 3, reps: '45s', rest: '60s', rpe: 6, tempo: 'Isometria', load: 'A corpo libero' }, note: 'Mantieni allineamento neutro spalle-bacino-caviglie.' }
                );
            } else if (focus.includes('Mobilità') || focus.includes('Gambe')) {
                session.push(
                    { id: 'cli_04', name: 'Goblet Squat su Box Alto (Angolo ginocchio max 60°)', primaryMuscle: 'Gambe', type: 'Multiarticolare', specs: { sets: 3, reps: '10', rest: '75s', rpe: 5, tempo: '3-1-1', load: 'Manubrio 6-8kg' }, note: 'Limitare flessione ginocchio a 60°. Box alto funge da blocco meccanico di sicurezza. Spingi le ginocchia in fuori.' },
                    { id: 'cli_05', name: 'Stacco Rumeno leggero con Manubri', primaryMuscle: 'Gambe', specs: { sets: 3, reps: '10', rest: '60s', rpe: 6, tempo: '3-0-2', load: 'Manubri 8+8kg' }, note: 'Sblocca le ginocchia solo di 10-15° e spingi il bacino indietro.' },
                    { id: 'cli_06', name: 'Straight Leg Raise (Supine, anca flessa 45°)', primaryMuscle: 'Gambe', type: 'Isolamento', specs: { sets: 3, reps: '12/lato', rest: '45s', rpe: 6, tempo: '2-0-2', load: 'Cavigliera 1.5kg' }, note: 'Mantieni il ginocchio teso attivamente durante tutto il sollevamento.' }
                );
            } else {
                session.push(
                    { id: 'cli_07', name: 'Pallof Press in piedi (Cavi o elastico)', primaryMuscle: 'Core', type: 'Isometrico', specs: { sets: 3, reps: '12/lato', rest: '60s', rpe: 7, tempo: '2-2-2', load: 'Cavo leggero' }, note: 'Resisti alla rotazione del busto, ginocchia sbloccate, no valgo.' },
                    { id: 'cli_08', name: 'Step-up su Box Basso (Altezza 10cm, discesa lenta)', primaryMuscle: 'Gambe', type: 'Multiarticolare', specs: { sets: 3, reps: '10/lato', rest: '60s', rpe: 5, tempo: '3-0-1', load: 'A corpo libero' }, note: 'Focalizzati sulla discesa controllata di 3 secondi. Il ginocchio deve seguire il piede.' },
                    { id: 'cli_09', name: 'Rematore Manubri su Panca Inclinata', primaryMuscle: 'Schiena', type: 'Multiarticolare', specs: { sets: 3, reps: '10', rest: '60s', rpe: 7, tempo: '2-0-2', load: 'Manubri 10+10kg' }, note: 'Petto in appoggio a 45° per azzerare il carico assiale.' }
                );
            }
        } else if (phaseId === 2 || phaseId === 4 || phaseId === 8) {
            if (focus.includes('Mobilità') || focus.includes('Allungamento')) {
                session.push(
                    { id: 'cli_d01', name: 'Wall Slide a muro (Postura spalle e torace)', primaryMuscle: 'Spalle', type: 'Isolamento', specs: { sets: 3, reps: '10', rest: '45s', rpe: 4, tempo: '3-1-3', load: 'A corpo libero' }, note: 'Schiena piatta contro il muro, fai scorrere le braccia.' },
                    { id: 'cli_d02', name: 'Ponte Glutei con Elastico sopra il ginocchio', primaryMuscle: 'Glutei', type: 'Isolamento', specs: { sets: 3, reps: '8 (con tenuta 5s in alto)', rest: '60s', rpe: 5, tempo: '2-5-2', load: 'Mini-band' }, note: 'Spingi leggermente le ginocchia all\'esterno contro l\'elastico.' },
                    { id: 'cli_d03', name: 'Mobilizzazione Dorsiflessione Caviglia (a muro)', primaryMuscle: 'Gambe', type: 'Mobilità', specs: { sets: 3, reps: '12/lato', rest: '45s', rpe: 4, tempo: '2-1-2', load: 'A corpo libero' }, note: 'Spingi il ginocchio verso il muro tenendo il tallone adeso a terra.' }
                );
            } else {
                session.push(
                    { id: 'cli_d04', name: 'Foam Rolling arti inferiori (Quad, Bende, Polpacci)', primaryMuscle: 'Gambe', type: 'Mobilità', specs: { sets: 1, reps: '60s per zona', rest: '0', rpe: 4, tempo: 'Lento', load: 'Foam Roller' }, note: 'Non rollare mai sulle ferite chirurgiche o direttamente sul ginocchio.' },
                    { id: 'cli_d05', name: 'Allungamento Psoas in ginocchio (Dinamico)', primaryMuscle: 'Gambe', type: 'Mobilità', specs: { sets: 3, reps: '10/lato', rest: '45s', rpe: 4, tempo: '2-2-2', load: 'A corpo libero' }, note: 'Retroversion del bacino attiva prima di spingere in avanti.' },
                    { id: 'cli_d06', name: 'Bird-dog controllato con tenuta 5s', primaryMuscle: 'Core', type: 'Isometrico', specs: { sets: 3, reps: '6/lato', rest: '45s', rpe: 5, tempo: '2-5-2', load: 'A corpo libero' }, note: 'Allinea braccio e gamba opposta senza inarcare la schiena.' }
                );
            }
        } else if (phaseId === 3) {
            if (focus.includes('Gambe') && focus.includes('Petto')) {
                session.push(
                    { id: 'cli_10', name: 'Leg Press Eccentrica (Discesa lenta 4s, ROM limitato a 80°)', primaryMuscle: 'Gambe', type: 'Multiarticolare', specs: { sets: 3, reps: '8', rest: '90s', rpe: 7, tempo: '4-0-1', load: 'Carico moderato' }, note: 'Fase eccentrica controllata in 4 secondi. ROM max 80° di flessione di ginocchio.' },
                    { id: 'cli_11', name: 'Single-Leg Romanian Deadlift (SL RDL con appoggio a muro)', primaryMuscle: 'Gambe', type: 'Multiarticolare', specs: { sets: 3, reps: '8/lato', rest: '60s', rpe: 7, tempo: '3-1-1', load: 'Manubrio 8kg (mano opposta)' }, note: 'Usa una mano a muro per la stabilità totale ed evitare torsioni del ginocchio.' },
                    { id: 'cli_12', name: 'Swiss Ball Wall Squat (ROM ridotto a 80°)', primaryMuscle: 'Gambe', type: 'Multiarticolare', specs: { sets: 3, reps: '10', rest: '75s', rpe: 6, tempo: '3-2-1', load: 'Manubri 6+6kg' }, note: 'Schiaccia una palla tra le ginocchia per attivare il VMO (Vastus Medialis Obliquus).' }
                );
            } else if (focus.includes('Schiena') || focus.includes('Bicipiti')) {
                session.push(
                    { id: 'cli_13', name: 'Trazioni facilitate all\'elastico o macchina pull-up', primaryMuscle: 'Schiena', type: 'Multiarticolare', specs: { sets: 3, reps: '8-10', rest: '90s', rpe: 7, tempo: '3-0-1', load: 'Scarico assistito' }, note: 'Nessun movimento balistico o oscillazione brusca.' },
                    { id: 'cli_14', name: 'Dumbbell Arnold Press seduto con schienale', primaryMuscle: 'Spalle', type: 'Multiarticolare', specs: { sets: 3, reps: '10', rest: '75s', rpe: 7, tempo: '2-0-2', load: 'Manubri 10+10kg' }, note: 'Mantieni la schiena bene aderente allo schienale inclinato a 85°.' },
                    { id: 'cli_15', name: 'Woodchopper ai cavi con bacino bloccato', primaryMuscle: 'Core', type: 'Multiarticolare', specs: { sets: 3, reps: '12/lato', rest: '60s', rpe: 7, tempo: '2-1-2', load: 'Cavo leggero' }, note: 'Ruota solo la parte toracica, piedi saldi. Proteggi il ginocchio operato eliminando torsioni.' }
                );
            } else {
                session.push(
                    { id: 'cli_16', name: 'Equilibrio Monopodalico su Airex Pad propriocettivo', primaryMuscle: 'Gambe', type: 'Isometrico', specs: { sets: 3, reps: '45s/lato', rest: '60s', rpe: 6, tempo: 'Isometria', load: 'A corpo libero' }, note: 'Mantieni il ginocchio sbloccato (5°). Evita oscillazioni in valgo.' },
                    { id: 'cli_17', name: 'Box Step-down eccentrico (da box di 15cm)', primaryMuscle: 'Gambe', type: 'Multiarticolare', specs: { sets: 3, reps: '8/lato', rest: '75s', rpe: 7, tempo: '3-0-1', load: 'A corpo libero' }, note: 'Scendi controllando il ginocchio. Sfiora il tallone a terra e risali.' },
                    { id: 'cli_18', name: 'Copenhagen Plank semplificato (sul ginocchio)', primaryMuscle: 'Core', type: 'Isometrico', specs: { sets: 3, reps: '20s/lato', rest: '45s', rpe: 7, tempo: 'Isometria', load: 'A corpo libero' }, note: 'Appoggia il ginocchio della gamba sopraelevata sulla sedia per accorciare la leva.' }
                );
            }
        } else if (phaseId === 5 || phaseId === 7) {
            if (focus.includes('Gambe') && focus.includes('Petto')) {
                session.push(
                    { id: 'cli_19', name: 'Box Squat al Parallelo (ROM rigoroso 90°)', primaryMuscle: 'Gambe', type: 'Multiarticolare', specs: { sets: 4, reps: '8', rest: '90s', rpe: 7.5, tempo: '3-1-1', load: 'Bilanciere o DBs pesanti' }, note: 'Siediti sul box sfiorandolo ed elimina il riflesso elastico prima di risalire.' },
                    { id: 'cli_20', name: 'Stacco Rumeno con Bilanciere (RDL)', primaryMuscle: 'Gambe', type: 'Multiarticolare', specs: { sets: 3, reps: '8', rest: '75s', rpe: 7.5, tempo: '3-0-1', load: 'Bilanciere 30-40kg' }, note: 'Spingi i piedi a terra, focus sulla contrazione di glutei e femorali.' },
                    { id: 'cli_21', name: 'Affondi Retrogradi alternati (solo indietro)', primaryMuscle: 'Gambe', type: 'Multiarticolare', specs: { sets: 3, reps: '10/lato', rest: '60s', rpe: 7, tempo: '2-0-1', load: 'Manubri 10+10kg' }, note: 'Passo indietro controllato. Gli affondi all\'indietro creano meno taglio patellare.' }
                );
            } else if (focus.includes('Spalle') || focus.includes('Core')) {
                session.push(
                    { id: 'cli_22', name: 'Kettlebell Deadlift esplosivo (Decelerazione eccentrica)', primaryMuscle: 'Gambe', type: 'Multiarticolare', specs: { sets: 3, reps: '8', rest: '75s', rpe: 7, tempo: '2-0-X', load: 'Kettlebell 16kg' }, note: 'Estensione dell\'anca esplosiva, arresto perfetto al top.' },
                    { id: 'cli_23', name: 'Leg Press Monolaterale guidata (Setup bilaterale)', primaryMuscle: 'Gambe', type: 'Multiarticolare', specs: { sets: 3, reps: '8/lato', rest: '75s', rpe: 7.5, tempo: '3-1-1', load: 'Carico medio' }, note: 'Spingi con una sola gamba, controlla eccentrica. Limita a 85° di flessione.' },
                    { id: 'cli_24', name: 'Camminate Laterali con Banda al metatarso (Monster Walks)', primaryMuscle: 'Glutei', type: 'Isolamento', specs: { sets: 3, reps: '15 passi/lato', rest: '60s', rpe: 6, tempo: 'Controllato', load: 'Elastico medio-forte' }, note: 'Tieni i piedi dritti e ginocchia spinte all\'esterno. Recluta il gluteo medio.' }
                );
            } else {
                session.push(
                    { id: 'cli_25', name: 'Cicloergometro/Cyclette (Endurance Zona 2)', primaryMuscle: 'Gambe', type: 'Cardio', specs: { sets: '1 set', reps: '20 min', rest: '-', rpe: 6, tempo: '80-90 RPM', load: 'Resistenza mod.' }, note: 'Sella alta per evitare angoli di flessione di ginocchio superiori a 80°.' },
                    { id: 'cli_26', name: 'Leg Extension a ROM limitato (90° a 30° - NO LOCKOUT)', primaryMuscle: 'Gambe', type: 'Isolamento', specs: { sets: 3, reps: '15', rest: '60s', rpe: 6, tempo: '2-1-2', load: 'Carico leggero-medio' }, note: 'Evita gli ultimi 30° di estensione completa per tutelare il crociato operato.' },
                    { id: 'cli_27', name: 'Leg Curl Seduto (Isolamento Ischiocrurali)', primaryMuscle: 'Gambe', type: 'Isolamento', specs: { sets: 3, reps: '12', rest: '60s', rpe: 7, tempo: '2-0-2', load: 'Carico medio' }, note: 'Flessione del ginocchio fluida. Il rinforzo dei flessori protegge l\'ACL.' }
                );
            }
        } else if (phaseId === 6) {
            if (focus.includes('Gambe') || focus.includes('Mobilità')) {
                session.push(
                    { id: 'cli_28', name: 'Test di Forza Submassimale Leg Press Monolaterale (ROM 80°)', primaryMuscle: 'Gambe', type: 'Multiarticolare', specs: { sets: 3, reps: '5 (prog. fino RPE 7.5)', rest: '90s', rpe: 7.5, tempo: '3-1-1', load: 'Carico progressivo' }, note: 'Valutazione submassimale per verificare differenze di forza tra gli arti.' },
                    { id: 'cli_29', name: 'Test di Flessibilità Caviglia (Dorsiflessione a muro)', primaryMuscle: 'Gambe', type: 'Mobilità', specs: { sets: 3, reps: '5/lato (tenuta 5s)', rest: '45s', rpe: 4, tempo: 'Lento', load: 'A corpo libero' }, note: 'Misura la simmetria del ROM di caviglia.' }
                );
            } else if (focus.includes('Core') || focus.includes('Spalle')) {
                session.push(
                    { id: 'cli_30', name: 'Test di Equilibrio Monopodalico Occhi Chiusi (Propriocezione fine)', primaryMuscle: 'Gambe', type: 'Isometrico', specs: { sets: 3, reps: '30s/lato', rest: '60s', rpe: 6, tempo: 'Isometria', load: 'A corpo libero' }, note: 'Posizionati vicino a un muro per sicurezza. Testa la propriocezione pura.' },
                    { id: 'cli_31', name: 'Transizioni Plank -> Cane a Faccia in Giù (Downward Dog)', primaryMuscle: 'Core', type: 'Multiarticolare', specs: { sets: 3, reps: '10', rest: '60s', rpe: 6, tempo: 'Lento controllato', load: 'A corpo libero' }, note: 'Allunga la catena posteriore in modo fluido coordinando la respirazione.' }
                );
            } else {
                session.push(
                    { id: 'cli_32', name: 'Camminata veloce tapis roulant / Cyclette leggero scarico', primaryMuscle: 'Gambe', type: 'Cardio', specs: { sets: '1 set', reps: '15 min', rest: '-', rpe: 6, tempo: 'Lento', load: 'Inclinazione 2%' }, note: 'Verifica l\'assenza di dolore nell\'impatto ripetuto al suolo.' }
                );
            }
        }
        return session;
    };

    /**
     * Generatore di sessioni dinamiche per atleti o soggetti non vincolati a protocollo di ginocchio.
     */
    window.WorkoutGeneratorAI.prototype._buildDynamicSession = function (phaseId, focus, pool, params, phaseBlueprint) {
        let session = [];
        const isDeload = phaseBlueprint.isDeload;

        const isClinical = params.patientType === 'Clinico' || params.patientType === 'Clinico_Anziano';
        const sport = params.sportPraticato || params.sport;
        const isEndurance = !isClinical && sport === 'Endurance';

        const muscleKeywords = ['Petto', 'Schiena', 'Gambe', 'Spalle', 'Braccia', 'Core', 'Glutei', 'Polpacci', 'Piedi', 'Cardio', 'Mobilità', 'Allungamento'];
        const targetMuscles = focus.filter(f => muscleKeywords.includes(f));
        
        // If targetMuscles is empty (e.g. no standard muscle keywords found), fallback to all focus items
        const musclesToUse = targetMuscles.length > 0 ? targetMuscles : focus;

        musclesToUse.forEach(muscle => {
            let cands = pool.filter(ex =>
                (ex.primaryMuscle?.includes(muscle) || ex.muscles?.some(m => m.includes(muscle)))
            );

            if (isEndurance) {
                const onlyCompounds = cands.filter(ex => ex.type === 'Multiarticolare');
                if (onlyCompounds.length > 0) {
                    cands = onlyCompounds;
                }
            }

            if ((params.patientType === 'Clinico' || params.patientType === 'Clinico_Anziano') && phaseBlueprint.kneeROM < 120) {
                cands = cands.filter(ex => {
                    const nameLower = (ex.name || '').toLowerCase();
                    if (phaseBlueprint.kneeROM <= 60 && (nameLower.includes('squat') || nameLower.includes('affond') || nameLower.includes('press') || nameLower.includes('pistol') || nameLower.includes('lunge'))) {
                        if (nameLower.includes('isometric') || nameLower.includes('box alto') || nameLower.includes('wall sit')) return true;
                        return false;
                    }
                    if (phaseBlueprint.kneeROM <= 80 && (nameLower.includes('deep squat') || nameLower.includes('pistol') || nameLower.includes('bulgarian') || nameLower.includes('sissy'))) {
                        return false;
                    }
                    return true;
                });
            }

            if (isDeload) {
                cands = cands.filter(ex => ex.type !== 'Heavy' && ex.quality !== 'Potenza');
                if (cands.length === 0) {
                    cands = pool.filter(ex => isEndurance ? ex.type === 'Multiarticolare' : (ex.type === 'Isometrico' || ex.type === 'Isolamento'));
                }
            } else {
                const hasForza = focus.includes('Forza') || focus.includes('ME');
                const hasPotenza = focus.includes('Potenza') || focus.includes('DE');
                
                if (hasForza) {
                    const forceCands = cands.filter(ex => ex.quality === 'Forza' || ex.type === 'Multiarticolare');
                    if (forceCands.length > 0) cands = forceCands;
                } else if (hasPotenza) {
                    const powerCands = cands.filter(ex => ex.quality === 'Potenza' || ex.name.toLowerCase().includes('esplosiv') || ex.name.toLowerCase().includes('jump'));
                    if (powerCands.length > 0) cands = powerCands;
                } else {
                    if ((phaseId === 5 || phaseId === 7) && params.goal !== 'Kettlebell') {
                        const powerOrForce = cands.filter(ex => ex.quality === 'Forza' || ex.quality === 'Potenza');
                        if (powerOrForce.length > 0) cands = powerOrForce;
                    }
                }
            }

            const compounds = cands.filter(ex => ex.type === 'Multiarticolare');
            const isolations = cands.filter(ex => ex.type !== 'Multiarticolare');

            if (compounds.length) {
                const pick = this._pickRandom(compounds, session);
                if (pick) {
                    session.push({ ...pick, isMain: true });
                }
            }
            
            if (isolations.length && (params.level !== 'Beginner' || isDeload) && !isEndurance) {
                const pick = this._pickRandom(isolations, session);
                if (pick) {
                    session.push({ ...pick, isMain: false });
                }
            }
        });

        if (session.length < 3) {
            const extras = pool.filter(ex => 
                !session.some(s => s.id === ex.id) && 
                (isEndurance ? ex.type === 'Multiarticolare' : (ex.type === 'Isolamento' || ex.type === 'Isometrico'))
            );
            const needed = 3 - session.length;
            for (let i = 0; i < needed; i++) {
                if (extras[i]) {
                    session.push({ ...extras[i], isMain: false });
                }
            }
        }

        return session;
    };

})();
