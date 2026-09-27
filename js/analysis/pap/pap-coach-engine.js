/**
 * js/analysis/pap/pap-coach-engine.js
 * Motore Prescrittivo e Decisionale per Allenatori ("Coach AI Engine").
 *
 * Responsabilità:
 * 1. Diagnosi automatica dello stato PAP dell'atleta (Potenziamento Reale, Fatica Reale, Invariato / Rumore).
 * 2. Classificazione della tipologia di fatica: Concentrica, Reattiva/Stiffness o Ammortizzativa.
 * 3. Alert e indicazioni di dosaggio volumetrico (es. prevenzione sovraccarico pliometrico su atleti leggeri).
 * 4. Raccomandazione personalizzata della finestra di recupero pre-gara in base a morfologia ed età.
 * 5. Direttive di correzione tecnica con prescrizione di esercizi di campo concreti.
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    // --- Soglie Decisionali e Costanti di Prescrizione di Default ---
    const DEFAULT_BODY_MASS_LIGHT_KG = 65.0;
    const DEFAULT_BODY_MASS_HEAVY_KG = 80.0;
    const DEFAULT_JUNIOR_AGE_LIMIT = 18;
    const DEFAULT_HIGH_VOLUME_CONTACTS_LIMIT = 12;
    const DEFAULT_FAST_SSC_TIME_LIMIT_MS = 180;
    const DEFAULT_SIGNIFICANT_P_VALUE = 0.05;
    const DEFAULT_HIGH_RSI_BASELINE = 2.40;
    const DEFAULT_LOW_RSI_BASELINE = 1.80;

    // --- Preset Specifici per Tipologia / Contesto Sportivo ---
    const SPORT_PRESETS = {
        ATLETICA_LEGGERA: {
            bodyMassLightKg: 65.0,
            bodyMassHeavyKg: 80.0,
            juniorAgeLimit: 18,
            highVolumeContactsLimit: 12,
            fastSscTimeLimitMs: 180,
            significantPValue: 0.05,
            highRsiBaseline: 2.40,
            lowRsiBaseline: 1.80
        },
        SPORT_DI_SQUADRA: {
            bodyMassLightKg: 70.0,
            bodyMassHeavyKg: 88.0,
            juniorAgeLimit: 18,
            highVolumeContactsLimit: 14,
            fastSscTimeLimitMs: 200,
            significantPValue: 0.05,
            highRsiBaseline: 2.20,
            lowRsiBaseline: 1.60
        },
        RUGBY_COMBAT: {
            bodyMassLightKg: 75.0,
            bodyMassHeavyKg: 95.0,
            juniorAgeLimit: 19,
            highVolumeContactsLimit: 10,
            fastSscTimeLimitMs: 220,
            significantPValue: 0.05,
            highRsiBaseline: 2.00,
            lowRsiBaseline: 1.50
        },
        NUOTO: {
            bodyMassLightKg: 62.0,
            bodyMassHeavyKg: 82.0,
            juniorAgeLimit: 17,
            highVolumeContactsLimit: 10,
            fastSscTimeLimitMs: 220,
            significantPValue: 0.05,
            highRsiBaseline: 1.80,
            lowRsiBaseline: 1.30
        },
        GINNASTICA_ARTISTICA: {
            bodyMassLightKg: 52.0,
            bodyMassHeavyKg: 68.0,
            juniorAgeLimit: 16,
            highVolumeContactsLimit: 16,
            fastSscTimeLimitMs: 160,
            significantPValue: 0.05,
            highRsiBaseline: 2.80,
            lowRsiBaseline: 2.10
        },
        SOLLEVAMENTO_PESI: {
            bodyMassLightKg: 67.0,
            bodyMassHeavyKg: 95.0,
            juniorAgeLimit: 19,
            highVolumeContactsLimit: 8,
            fastSscTimeLimitMs: 250,
            significantPValue: 0.05,
            highRsiBaseline: 1.70,
            lowRsiBaseline: 1.20
        },
        SPRINT_VELOCITA: {
            bodyMassLightKg: 65.0,
            bodyMassHeavyKg: 80.0,
            juniorAgeLimit: 18,
            highVolumeContactsLimit: 12,
            fastSscTimeLimitMs: 170,
            significantPValue: 0.05,
            highRsiBaseline: 2.60,
            lowRsiBaseline: 2.00
        }
    };

    /**
     * Motore decisionale sport science per staff tecnici e preparatori atletici.
     */
    class PAPCoachEngine {

        /**
         * Restituisce i preset di soglie predefiniti per ciascun ambito sportivo.
         * @returns {Object} Dizionario con i preset sportivi.
         */
        static getSportPresets() {
            return { ...SPORT_PRESETS };
        }

        /**
         * Risolve e calcola dinamicamente le soglie decisionali combinando:
         * 1. Default di sistema
         * 2. Preset specifico della disciplina/sport
         * 3. Override configurati nel profilo atleta (athlete.thresholds o athlete.sportConfig)
         * 4. Parametri personalizzati passati direttamente a runtime
         * @param {Object} [athlete={}] - Dati anagrafici e sportivi dell'atleta.
         * @param {Object} [customThresholds={}] - Soglie personalizzate forzate a runtime.
         * @returns {Object} Oggetto con tutte le soglie operative finali.
         */
        static resolveThresholds(athlete = {}, customThresholds = {}) {
            const sportStr = (athlete && (athlete.sport || athlete.sportContext || athlete.discipline) || '').toUpperCase().trim();

            let sportPreset = {};
            if (sportStr) {
                if (sportStr.includes('SPRINT') || sportStr.includes('VELOCITÀ') || sportStr.includes('VELOCITA') || sportStr.includes('100M') || sportStr.includes('200M')) {
                    sportPreset = SPORT_PRESETS.SPRINT_VELOCITA;
                } else if (sportStr.includes('GINNASTICA') || sportStr.includes('ARTISTICA') || sportStr.includes('GYMNASTIC')) {
                    sportPreset = SPORT_PRESETS.GINNASTICA_ARTISTICA;
                } else if (sportStr.includes('NUOTO') || sportStr.includes('SWIM') || sportStr.includes('PALLANUOTO')) {
                    sportPreset = SPORT_PRESETS.NUOTO;
                } else if (sportStr.includes('PESI') || sportStr.includes('WEIGHTLIFT') || sportStr.includes('POWERLIFT') || sportStr.includes('SOLLEVAMENTO')) {
                    sportPreset = SPORT_PRESETS.SOLLEVAMENTO_PESI;
                } else if (sportStr.includes('ATLETICA') || sportStr.includes('SALTI') || sportStr.includes('TRACK')) {
                    sportPreset = SPORT_PRESETS.ATLETICA_LEGGERA;
                } else if (sportStr.includes('CALCIO') || sportStr.includes('BASKET') || sportStr.includes('VOLLEY') || sportStr.includes('PALLAVOLO') || sportStr.includes('SOCCER')) {
                    sportPreset = SPORT_PRESETS.SPORT_DI_SQUADRA;
                } else if (sportStr.includes('RUGBY') || sportStr.includes('COMBAT') || sportStr.includes('LOTTA') || sportStr.includes('JUDO')) {
                    sportPreset = SPORT_PRESETS.RUGBY_COMBAT;
                }
            }

            const athleteOverrides = (athlete && (athlete.thresholds || athlete.customThresholds || athlete.sportConfig)) || {};

            return {
                bodyMassLightKg: customThresholds.bodyMassLightKg ?? athleteOverrides.bodyMassLightKg ?? sportPreset.bodyMassLightKg ?? DEFAULT_BODY_MASS_LIGHT_KG,
                bodyMassHeavyKg: customThresholds.bodyMassHeavyKg ?? athleteOverrides.bodyMassHeavyKg ?? sportPreset.bodyMassHeavyKg ?? DEFAULT_BODY_MASS_HEAVY_KG,
                juniorAgeLimit: customThresholds.juniorAgeLimit ?? athleteOverrides.juniorAgeLimit ?? sportPreset.juniorAgeLimit ?? DEFAULT_JUNIOR_AGE_LIMIT,
                highVolumeContactsLimit: customThresholds.highVolumeContactsLimit ?? athleteOverrides.highVolumeContactsLimit ?? sportPreset.highVolumeContactsLimit ?? DEFAULT_HIGH_VOLUME_CONTACTS_LIMIT,
                fastSscTimeLimitMs: customThresholds.fastSscTimeLimitMs ?? athleteOverrides.fastSscTimeLimitMs ?? sportPreset.fastSscTimeLimitMs ?? DEFAULT_FAST_SSC_TIME_LIMIT_MS,
                significantPValue: customThresholds.significantPValue ?? athleteOverrides.significantPValue ?? sportPreset.significantPValue ?? DEFAULT_SIGNIFICANT_P_VALUE,
                highRsiBaseline: customThresholds.highRsiBaseline ?? athleteOverrides.highRsiBaseline ?? sportPreset.highRsiBaseline ?? DEFAULT_HIGH_RSI_BASELINE,
                lowRsiBaseline: customThresholds.lowRsiBaseline ?? athleteOverrides.lowRsiBaseline ?? sportPreset.lowRsiBaseline ?? DEFAULT_LOW_RSI_BASELINE
            };
        }

        /**
         * Genera la diagnosi clinico-funzionale dello stato PAP dell'atleta fondendo
         * i salti singoli (validati con MDC95%) e i salti reattivi (validati con inferenza p-value/Hedges' g).
         * @param {Object} athleteProfile - Dati anagrafici e prestativi dell'atleta.
         * @param {Object} mdcResults - Esiti salti singoli contro soglie MDC (SJ, CMJ, ABK).
         * @param {Object} rsiTest - Esito inferenziale sui saltelli reattivi (delta%, p, g, decomp).
         * @param {Object} [customThresholds={}] - Eventuali soglie parametriche personalizzate.
         * @returns {Object} Diagnosi strutturata con etichette, badge cromatico e spiegazione biomeccanica.
         */
        static diagnosePAPStatus(athleteProfile, mdcResults, rsiTest, customThresholds = {}) {
            const thresholds = PAPCoachEngine.resolveThresholds(athleteProfile, customThresholds);
            const sjRes = (mdcResults && mdcResults.SJ) || { isRealChange: false, deltaPercent: 0 };
            const cmjRes = (mdcResults && mdcResults.CMJ) || { isRealChange: false, deltaPercent: 0 };
            const rsiP = (rsiTest && typeof rsiTest.p === 'number') ? rsiTest.p : 1.0;
            const rsiDelta = (rsiTest && typeof rsiTest.deltaPercent === 'number') ? rsiTest.deltaPercent : 0;
            const rsiDecomp = (rsiTest && rsiTest.decomposition) || {};

            let status = 'INVARIATO';
            let badgeColor = 'neutral'; // 'positive' | 'fatigue' | 'neutral'
            let category = 'Rumore / Invariato';
            let summaryText = '';
            let detailedMechanism = '';

            // 1. Rilevamento Potenziamento Reale con soglia p-value parametrica
            const hasRealRsiPotentiation = (rsiP < thresholds.significantPValue && rsiDelta > 0);
            const hasRealSjPotentiation = (sjRes.isRealChange && sjRes.deltaPercent > 0);
            const hasRealCmjPotentiation = (cmjRes.isRealChange && cmjRes.deltaPercent > 0);

            // 2. Rilevamento Fatica Reale con soglia p-value parametrica
            const hasRealSjFatigue = (sjRes.isRealChange && sjRes.deltaPercent < 0);
            const hasRealCmjFatigue = (cmjRes.isRealChange && cmjRes.deltaPercent < 0);
            const hasRealRsiFatigue = (rsiP < thresholds.significantPValue && rsiDelta < 0);

            if (hasRealRsiPotentiation || (hasRealSjPotentiation && !hasRealRsiFatigue) || (hasRealCmjPotentiation && !hasRealRsiFatigue)) {
                status = 'POTENZIAMENTO_REALE';
                badgeColor = 'positive';
                category = 'Potenziamento Reale (PAP Efficace)';
                if (hasRealRsiPotentiation && hasRealSjPotentiation) {
                    summaryText = 'Risposta PAP globale eccellente: incremento contemporaneo sia della spinta concentrica che della reattività elastica.';
                } else if (hasRealRsiPotentiation) {
                    summaryText = `Potenziamento reattivo d'impulso (+${rsiDelta.toFixed(1)}% RSI, p=${rsiP.toFixed(3)}): stiffness aumentata e tempo di contatto preservato.`;
                } else if (hasRealSjPotentiation) {
                    summaryText = `Potenziamento della forza concentrica pura (+${sjRes.deltaPercent.toFixed(1)}% SJ): facilitazione neurale del reclutamento motorio ad alta soglia.`;
                } else {
                    summaryText = `Potenziamento elastico-esplosivo CMJ (+${cmjRes.deltaPercent.toFixed(1)}% CMJ): incremento reale del ciclo stiramento-accorciamento oltre soglia MDC.`;
                }
                detailedMechanism = rsiDecomp.description || 'Incremento dell\'impulso meccanico verticale utile.';
            } else if (hasRealSjFatigue || hasRealCmjFatigue || hasRealRsiFatigue) {
                status = 'FATICA_REALE';
                badgeColor = 'fatigue';

                if (hasRealSjFatigue && !hasRealRsiFatigue) {
                    category = 'Fatica Concentrica Periferica';
                    summaryText = `Fatica selettiva concentrica (${sjRes.deltaPercent.toFixed(1)}% SJ oltre soglia MDC): esaurimento transitorio della capacità contrattile a monte.`;
                    detailedMechanism = 'Stimolo condizionante con sovraccarico troppo tassante per le componenti contrattili o recupero insufficiente per ripristinare i ponti actomiosinici.';
                } else if (hasRealRsiFatigue && !hasRealSjFatigue) {
                    category = 'Fatica da Stiffness Tendinea';
                    summaryText = `Fatica reattiva significativa (${rsiDelta.toFixed(1)}% RSI, p=${rsiP.toFixed(3)}): allungamento del tempo di contatto e cedimento elastico.`;
                    detailedMechanism = 'Cedimento transitorio del pre-stiramento e della rigidità della caviglia (fast-SSC). L\'eccesso di contatti o l\'ammortizzazione prolungata dissipano energia.';
                } else {
                    category = 'Fatica Neuromuscolare Globale';
                    summaryText = 'Fatica estesa concentrica ed elastica: decadimento evidente sia nella spinta statica che nei rimbalzi reattivi.';
                    detailedMechanism = 'Sovraccarico sistemico acuto non compensato; tempo di recupero o intensità dello stimolo inadeguati per l\'atleta.';
                }
            } else {
                status = 'INVARIATO';
                badgeColor = 'neutral';
                category = 'Invariato / Rumore Biologico';
                summaryText = `Tutte le variazioni registrate oscillano entro la naturale variabilità strumentale e biologica dell'atleta (MDC non superato e p > ${thresholds.significantPValue}).`;
                detailedMechanism = 'L\'intervento condizionante non ha prodotto né un potenziamento dimostrabile né un affaticamento significativo. Profilo metrologicamente stabile.';
            }

            return {
                status,
                badgeColor,
                category,
                summaryText,
                detailedMechanism,
                hasRealRsiPotentiation,
                hasRealSjPotentiation,
                hasRealSjFatigue,
                hasRealRsiFatigue,
                appliedThresholds: thresholds
            };
        }

        /**
         * Fornisce consigli personalizzati di dosaggio volumetrico per il protocollo.
         * Rileva errori di somministrazione (es. volume eccessivo rispetto alla massa/età).
         * Linee guida volumetriche basate su Robbins & Young (2010), JSCR.
         * @param {Object} athlete - Dati atleta (peso, età, sport).
         * @param {Object} protocol - Dati protocollo (serie, reps, volume contatti).
         * @param {Object} diagnosis - Diagnosi PAP calcolata.
         * @param {Object} [customThresholds={}] - Eventuali soglie parametriche personalizzate.
         * @returns {Object} { alertLevel, recommendation, rationale }
         */
        static suggestVolumetricDosage(athlete, protocol, diagnosis, customThresholds = {}) {
            const thresholds = PAPCoachEngine.resolveThresholds(athlete, customThresholds);
            const massKg = typeof athlete.mass === 'number' ? athlete.mass : 70;
            const age = typeof athlete.age === 'number' ? athlete.age : 18;
            const contacts = typeof protocol.contacts === 'number' ? protocol.contacts : (typeof protocol.reps === 'number' ? protocol.reps : 6);
            const series = typeof protocol.sets === 'number' ? protocol.sets : 2;
            const totalLoad = contacts * series;

            let alertLevel = 'OPTIMAL'; // 'OPTIMAL' | 'WARNING' | 'CRITICAL'
            let recommendation = '';
            let rationale = '';

            if (massKg <= thresholds.bodyMassLightKg && totalLoad >= thresholds.highVolumeContactsLimit && diagnosis.hasRealRsiFatigue) {
                alertLevel = 'CRITICAL';
                recommendation = `Ridurre drasticamente il volume pliometrico a massimo 6-8 rimbalzi complessivi (1 serie anziché ${series}), allungando la pausa tra serie a >= 3-4 minuti (Robbins & Young, 2010).`;
                rationale = `Su atleti leggeri ed altamente elastici (${massKg} kg <= soglia ${thresholds.bodyMassLightKg} kg), un volume cumulativo elevato (${totalLoad} contatti >= soglia ${thresholds.highVolumeContactsLimit}) genera affaticamento da ammortizzazione e dissipa la stiffness tendinea (Robbins & Young, 2010 JSCR).`;
            } else if (massKg >= thresholds.bodyMassHeavyKg && diagnosis.hasRealSjFatigue) {
                alertLevel = 'WARNING';
                recommendation = 'Limitare le serie con carichi > 80% RM a 1 singola serie da 2-3 reps, riducendo l\'intensità all\'80% per evitare affaticamento contrattile residuo.';
                rationale = `La massa corporea elevata (${massKg} kg >= soglia ${thresholds.bodyMassHeavyKg} kg) impone inerzie elevate; 2 serie pesanti inducono affaticamento periferico marcato che richiede oltre 20 minuti per essere smaltito.`;
            } else if (age <= thresholds.juniorAgeLimit && series > 1 && diagnosis.status === 'FATICA_REALE') {
                alertLevel = 'WARNING';
                recommendation = `Su atleti junior (under ${thresholds.juniorAgeLimit}) prediligere 1 singola serie condizionante ad alta intenzione neuromuscolare senza accumulare fatica metabolica.`;
                rationale = 'I soggetti giovani hanno apparati tendinei reattivi ma minore tolleranza acuta alle serie multiple con carichi massimali o rimbalzi ad alto impatto (Robbins & Young, 2010).';
            } else {
                alertLevel = 'OPTIMAL';
                recommendation = 'Volume somministrato idoneo per l\'atleta. Mantenere 1-2 serie brevi ad altissima velocità esecutiva.';
                rationale = 'Il rapporto tra volume somministrato e risposta di stiffness/forza risulta bilanciato senza segnali di sovraccarico volumetrico (Robbins & Young, 2010).';
            }

            return { alertLevel, recommendation, rationale, appliedThresholds: thresholds };
        }

        /**
         * Calcola la raccomandazione della finestra temporale ottimale di recupero pre-gara/seduta
         * basandosi sui tempi reali osservati e sulle caratteristiche dell'atleta.
         * @param {Object} athlete - Dati atleta (massa, età, pattern di attivazione).
         * @param {Object} dynamics - Dinamica intra-serie (es. accensione tardiva).
         * @param {number|null} observedRecoveryMin - Minuti reali trascorsi nello studio di campo.
         * @param {Object} [customThresholds={}] - Eventuali soglie parametriche personalizzate.
         * @returns {Object} { recommendedWindowMin: [min, max], rationale, prepStrategy, appliedThresholds }
         */
        static recommendRecoveryWindow(athlete, dynamics, observedRecoveryMin, customThresholds = {}) {
            const thresholds = PAPCoachEngine.resolveThresholds(athlete, customThresholds);
            const massKg = typeof athlete.mass === 'number' ? athlete.mass : 70;
            const isLateActivation = dynamics && dynamics.pattern === 'ACCENSIONE_TARDIVA';

            let minMinutes = 10;
            let maxMinutes = 14;
            let rationale = '';
            let prepStrategy = '';

            if (isLateActivation) {
                minMinutes = 8;
                maxMinutes = 12;
                rationale = 'L\'atleta manifesta accensione tardiva (pendenza positiva dell\'RSI nei primi rimbalzi). Un recupero troppo lungo (>15 min) fa svanire lo stato di priming neuromuscolare.';
                prepStrategy = 'Inserire 2-3 salti o balzi preparatori ad alta intenzione a 3-4 minuti dall\'inizio della prova per accelerare la stiffness ottimale senza attendere la serie di gara.';
            } else if (massKg <= thresholds.bodyMassLightKg) {
                minMinutes = 10;
                maxMinutes = 15;
                rationale = `Atleta leggero (${massKg} kg <= soglia ${thresholds.bodyMassLightKg} kg): rapido smaltimento della fatica periferica. La finestra ideale post-stimolo pliometrico si colloca attorno ai 12 minuti.`;
                prepStrategy = 'Mantenere attivazione elastica con skip rapidi a terra a basso impatto durante l\'attesa.';
            } else if (massKg >= thresholds.bodyMassHeavyKg) {
                minMinutes = 14;
                maxMinutes = 18;
                rationale = `Atleta pesante (${massKg} kg >= soglia ${thresholds.bodyMassHeavyKg} kg): lo stimolo con sovraccarico richiede tempi di clearance della fatica contrattile superiori a 14 minuti prima di esprimere il potenziamento.`;
                prepStrategy = 'Evitare rimbalzi durante l\'attesa e favorire mobilità articolare dinamica prima dell\'ingresso.';
            } else {
                minMinutes = 10;
                maxMinutes = 14;
                rationale = 'Finestra standard bilanciata tra dissipazione della fatica e persistenza della facilitazione neurale.';
                prepStrategy = 'Riscaldamento specifico standard con 1 balzo esplosivo di recall a 8 minuti.';
            }

            const contextNote = (observedRecoveryMin !== null && observedRecoveryMin !== undefined)
                ? `Nota cronometrica campo: nello studio sperimentale sono trascorsi ${observedRecoveryMin.toFixed(1)} min reali tra PRE e POST. L'intervallo reale era di 18-25 min e non di 7-8 min.`
                : '';

            return {
                recommendedWindowMin: [minMinutes, maxMinutes],
                rationale,
                prepStrategy,
                contextNote,
                appliedThresholds: thresholds
            };
        }

        /**
         * Formula direttive di correzione tecnica ed esercizi mirati da campo in base ai deficit biomeccanici rilevati.
         * @param {Object} dynamics - Dinamica rimbalzi (spinta vs elastica, r TC-Altezza).
         * @param {Object} neuromuscular - Profilo EUR, transfer braccia e deficit concentrico.
         * @param {Object} rsiDecomposition - Meccanismo RSI (stiffness vs concentrico).
         * @param {Object} [customThresholds={}] - Eventuali soglie parametriche personalizzate.
         * @returns {Array<Object>} Lista di prescrizioni tecniche ed esercizi consigliati.
         */
        static generateTechnicalCorrectives(dynamics, neuromuscular, rsiDecomposition, customThresholds = {}) {
            const thresholds = PAPCoachEngine.resolveThresholds({}, customThresholds);
            const prescriptions = [];

            // 1. Correzione Strategia di Spinta (atleta che piega le ginocchia e allunga il TC)
            if (dynamics && dynamics.strategy === 'STRATEGIA_DI_SPINTA') {
                prescriptions.push({
                    area: 'Stiffness di Caviglia & Fast-SSC',
                    priority: 'ALTA',
                    issue: 'Strategia di spinta concentrica compensatoria: l\'atleta allunga il tempo a terra per cercare quota, dissipando la restituzione elastica tendinea.',
                    targetConstraint: `Tempo di contatto vincolato a < ${thresholds.fastSscTimeLimitMs} ms`,
                    exercises: [
                        `Ankle Pogo Hops su pedana con vincolo acustico di contatto breve (< ${thresholds.fastSscTimeLimitMs - 10} ms)`,
                        'Drop Jump da box basso (20-30 cm) focalizzati sulla massima velocità di uscita senza cedimento del tallone',
                        'Balzi orizzontali tra mini-over con rimbalzo reattivo immediato'
                    ]
                });
            }

            // 2. Correzione Deficit Concentrico Mascherato (EUR elevato ma SJ deficitario)
            if (neuromuscular && neuromuscular.hasConcentricDeficit) {
                prescriptions.push({
                    area: 'Forza Concentrica Pura (RFD Iniziale)',
                    priority: 'ALTA',
                    issue: 'Falso picco elastico: l\'EUR appare elevato non per straordinaria elasticità, ma per un deficit marcato della forza pura concentrica statica (SJ < 36 cm).',
                    targetConstraint: 'Spinta esplosiva da fermo senza contro-movimento preparatorio',
                    exercises: [
                        'Pin Squat concentrico al multipower con partenza da fermo (3 sec isometria a 90°)',
                        'Squat Jump con sovraccarico leggero (15-20% del peso corporeo) con arresto rigoroso in buca',
                        'Stacco da terra concentrico sui blocchi ad accelerazione massimale'
                    ]
                });
            }

            // 3. Correzione Fatica da Stiffness (cedimento dell'ammortizzazione)
            if (rsiDecomposition && rsiDecomposition.mechanism === 'FATICA_STIFFNESS') {
                prescriptions.push({
                    area: 'Rigidità Strutturale della Caviglia',
                    priority: 'MEDIA',
                    issue: 'Cedimento elastico rapido sotto carico ripetuto: allungamento progressivo della fase di decelerazione a terra.',
                    targetConstraint: 'Rinforzo isometrico e reattivo del complesso gastrocnemio-soleo',
                    exercises: [
                        'Calf Raise isometrico monopodalico su gradino con carico elevato (3 serie x 30 sec)',
                        'Saltelli con la corda ad alta cadenza con caviglia bloccata in dorsiflessione attiva',
                        'Balzi pliometrici su superficie rigida (mai materassi morbidi che inducono isteresi)'
                    ]
                });
            }

            // 4. Ottimizzazione Transfer Arti Superiori (se ABK - CMJ ridotto)
            if (neuromuscular && neuromuscular.armsTransferQuality === 'RIDOTTO_LIMITATO') {
                prescriptions.push({
                    area: 'Coordinazione e Transfer Arti Superiori',
                    priority: 'BASSA',
                    issue: 'Contributo braccia scarso (< 5 cm): mancata sincronizzazione tra oscillazione degli arti superiori e inizio della fase di spinta degli arti inferiori.',
                    targetConstraint: 'Timing di anticipo dell\'oscillazione delle braccia',
                    exercises: [
                        'Salti con slancio braccia su box con focus sul punto morto superiore',
                        'Slanci con bastone o manubri leggeri (1-2 kg) sincronizzati con flessione di ginocchia'
                    ]
                });
            }

            if (prescriptions.length === 0) {
                prescriptions.push({
                    area: 'Mantenimento Biomeccanico',
                    priority: 'MANTENIMENTO',
                    issue: 'Nessun deficit strutturale grave riscontrato. L\'atleta presenta un profilo armonico tra forza concentrica e stiffness elastica.',
                    targetConstraint: 'Mantenimento della reattività specifica',
                    exercises: [
                        'Mantenimento routine pliometrica fast-SSC (2x6 Drop Jumps settimanali)',
                        'Richiami di forza esplosiva concentrica (Trap Bar Deadlift 3x3 @75-80%)'
                    ]
                });
            }

            return prescriptions;
        }
    }

    // Esposizione globale
    root.PAPCoachEngine = PAPCoachEngine;
})();

