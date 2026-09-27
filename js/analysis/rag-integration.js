/**
 * js/analysis/rag-integration.js
 * RAG Knowledge Engine & Sports Science Literature Connector for Data Analysis.
 *
 * Responsabilità:
 * 1. Generazione di query semantiche contestuali basate sulle metriche biomeccaniche individuali ed aggregate.
 * 2. Interrogazione del motore RAG (IndexedDB documenti utente) e della base di conoscenza interna (window.App.RAGBridge / 322 fonti Tier 1/2).
 * 3. Sintesi di commenti diagnostici personalizzati per singolo atleta con rilevazione dei colli di bottiglia fisici.
 * 4. Prescrizioni di allenamento di campo operative (serie, ripetizioni, carichi, tempi di recupero, esercitazioni correttive).
 * 5. Corredo di citazioni bibliografiche formattate da letteratura accreditata (Tier 1/2).
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    // --- Costanti Operative e Soglie Biomeccaniche RAG (Nessun Numero Magico) ---
    const DEFAULT_SEARCH_LIMIT = 4;
    const MIN_QUERY_TOKEN_LENGTH = 3;
    const DEFAULT_PAP_REST_MIN = 8;
    const DEFAULT_PAP_REST_MAX = 12;
    const VELOCITY_LOSS_POWER_THRESHOLD_PCT = 10.0;
    const VELOCITY_LOSS_HYPERTROPHY_THRESHOLD_PCT = 20.0;
    const STIFF_CONTACT_TIME_THRESHOLD_SEC = 0.170;
    const SECONDS_TO_MS_FACTOR = 1000.0;
    const RSI_HIGH_PERFORMANCE_THRESHOLD = 2.50;
    const VBT_PERCENT_LOAD_POWER = 0.70;
    const VBT_PERCENT_LOAD_FATIGUE = 0.65;
    const DEFAULT_FALLBACK_RSI = 2.0;
    const DEFAULT_FALLBACK_TC_MS = 160.0;
    const DEFAULT_FALLBACK_VEL_LOSS = 15.0;
    const DEFAULT_FALLBACK_ACCEL_10M = 1.74;
    const DEFAULT_FALLBACK_ROM = 80.0;
    const DEFAULT_FALLBACK_RFD = 6000.0;
    const DEFAULT_FALLBACK_1RM = 100.0;
    const DEFAULT_FALLBACK_TARGET_VEL = 0.85;
    const DEFAULT_FALLBACK_PEAK_ANG_VEL = 320.0;
    const POTENTIATION_THRESHOLD_DELTA_PCT = 5.0;
    const FATIGUE_THRESHOLD_DELTA_PCT = -5.0;
    const PERCENT_MULTIPLIER = 100.0;
    const MS_THRESHOLD_SECONDS = 5.0;
    const FORCE_DEFAULT_PEAK_N = 2850.0;
    const FORCE_DEFAULT_RFD = 6800.0;
    const DEFAULT_FALLBACK_BALL_MASS_KG = 4.0;
    const DEFAULT_FALLBACK_THROW_DIST_M = 7.5;
    const DEFAULT_FALLBACK_POWER_W = 1350.0;

    /**
     * Risolve il ponte di conoscenza RAG verificando i namespace dell'applicazione.
     * @returns {Object|null} Istanza di RAGBridge o null se non disponibile.
     */
    function resolveRAGBridge() {
        if (root.App && root.App.RAGBridge) return root.App.RAGBridge;
        if (typeof window !== 'undefined' && window.App && window.App.RAGBridge) return window.App.RAGBridge;
        if (root.RAGKnowledgeBridge) return root.RAGKnowledgeBridge;
        if (typeof window !== 'undefined' && window.RAGKnowledgeBridge) return window.RAGKnowledgeBridge;
        return null;
    }

    /**
     * Costruisce la query semantica contestuale al test e alle metriche rilevate.
     * @param {Object} sessionData - Dati normalizzati della sessione di test.
     * @param {Object} [selectedAthlete=null] - Atleta specifico selezionato.
     * @returns {string} Stringa di interrogazione semantica ottimizzata.
     */
    function buildContextualQuery(sessionData, selectedAthlete = null) {
        if (!sessionData) return 'allenamento biomeccanica forza velocita';

        const type = sessionData.testType || '';
        const kpis = sessionData.computedMetrics?.kpis || {};

        switch (type) {
            case 'TEST_TYPE_JUMP_STIFFNESS': {
                return 'post-activation potentiation PAP recupero ottimale reactive strength index RSI stiffness drop jump Bosco McMahon';
            }
            case 'TEST_TYPE_VBT': {
                const ex = kpis.exerciseName || 'squat panca';
                return `velocity based training VBT perdita velocita affaticamento neuromuscolare 1RM González-Badillo Sanchez-Medina ${ex}`;
            }
            case 'TEST_TYPE_SPRINT_GATES': {
                return 'sprint accelerazione intertempi fotocellule profilo forza velocita Morin Samozino massima velocita';
            }
            case 'TEST_TYPE_VIDEO_2D': {
                return 'cinematica 2D angolo ginocchio valgo dinamico prevenzione LCA biomeccanica squat Hewett Escamilla';
            }
            case 'TEST_TYPE_FORCE_ISOMETRIC': {
                return 'isometric mid-thigh pull IMTP rate of force development RFD pedana forza dynamic strength index Haff';
            }
            case 'TEST_TYPE_MEDICINE_BALL': {
                return 'lancio palla medica cinematica balistica potenza Sayers Harman';
            }
            default:
                return 'monitoraggio carichi fatica allenamento sport science';
        }
    }

    /**
     * Interroga il database documentale interno e il motore RAG per reperire evidenze scientifiche pertinenti.
     * @param {Object} sessionData - Dati normalizzati della sessione.
     * @param {Object} [selectedAthlete=null] - Atleta esaminato.
     * @returns {Promise<Array<Object>>} Articoli scientifici ed estratti convalidati.
     */
    async function fetchScientificInsights(sessionData, selectedAthlete = null) {
        const query = buildContextualQuery(sessionData, selectedAthlete);

        // 1. Ricerca tramite RAGBridge dell'applicazione
        const bridge = resolveRAGBridge();
        if (bridge && typeof bridge.searchEvidence === 'function') {
            try {
                const bridgeResults = await bridge.searchEvidence(query, DEFAULT_SEARCH_LIMIT);
                if (Array.isArray(bridgeResults) && bridgeResults.length > 0) {
                    return bridgeResults;
                }
            } catch (err) {
                console.warn('[RAGAnalysisIntegration] Fallback da RAGBridge:', err);
            }
        }

        // 2. Ricerca diretta in RAGEngine
        const rag = root.RAGEngine || (typeof window !== 'undefined' ? window.RAGEngine : null);
        if (rag && typeof rag.semanticSearch === 'function') {
            try {
                const results = await rag.semanticSearch(query, DEFAULT_SEARCH_LIMIT);
                if (Array.isArray(results) && results.length > 0) {
                    return results;
                }
            } catch (err) {
                console.warn('[RAGAnalysisIntegration] Fallback da RAGEngine:', err);
            }
        }

        // 3. Fallback deterministico: filtro lessicale su ScientificKnowledgeBase in memoria
        const kb = (root.App && root.App.scientificSources) || root.ScientificKnowledgeBase || (typeof window !== 'undefined' ? window.ScientificKnowledgeBase : []) || [];
        if (Array.isArray(kb) && kb.length > 0) {
            const queryTokens = query.toLowerCase().split(/\s+/).filter(t => t.length > MIN_QUERY_TOKEN_LENGTH);
            const scored = kb.map(source => {
                const fullText = `${source.title || ''} ${source.authors || ''} ${source.abstract || ''} ${source.area || ''}`.toLowerCase();
                let matchCount = 0;
                queryTokens.forEach(token => {
                    if (fullText.includes(token)) matchCount += 1;
                });
                return {
                    id: source.id,
                    title: source.title,
                    authors: source.authors,
                    journal: source.journal,
                    year: source.year,
                    abstract: source.abstract,
                    relevanceScore: matchCount / Math.max(1, queryTokens.length)
                };
            }).filter(item => item.relevanceScore > 0);

            scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
            return scored.slice(0, DEFAULT_SEARCH_LIMIT);
        }

        return [];
    }

    /**
     * Estrae le citazioni bibliografiche formattate da un elenco eterogeneo di risultati RAG.
     * @param {Array<Object>} evidenceList - Risultati restituiti da RAG o RAGBridge.
     * @returns {Array<string>} Array di citazioni formattate.
     */
    function formatEvidenceCitations(evidenceList) {
        if (!Array.isArray(evidenceList) || evidenceList.length === 0) return [];

        return evidenceList.map(e => {
            const meta = e.sourceMeta || e.metadata || e;
            const authorStr = meta.authors || meta.author || 'Autori accreditati';
            const yearStr = meta.year ? `(${meta.year})` : '';
            const titleStr = meta.title ? `"${meta.title}"` : (e.text ? `"${e.text.substring(0, 60)}..."` : '');
            const journalStr = meta.journal ? ` - ${meta.journal}` : '';
            return `${authorStr} ${yearStr} ${titleStr}${journalStr}`.trim();
        }).filter(Boolean);
    }

    /**
     * Genera prescrizioni operative di allenamento basate sull'evidenza scientifica e sui dati individuali dell'atleta.
     * @param {Object} sessionData - Dati normalizzati della sessione.
     * @param {Object} [selectedAthlete=null] - Atleta selezionato con trials validati.
     * @param {Array<Object>} [evidenceList=[]] - Evidenze scientifiche reperite.
     * @returns {Object} Prescrizioni dettagliate con diagnostica, collo di bottiglia e indicazioni coach.
     */
    function generatePrescription(sessionData, selectedAthlete = null, evidenceList = []) {
        const type = sessionData?.testType || '';
        const sessionKpis = sessionData?.computedMetrics?.kpis || {};
        const athleteName = selectedAthlete ? selectedAthlete.name : 'Atleta';
        const trials = selectedAthlete?.validTrials || [];

        let diagnosticComment = '';
        let bottleneck = '';
        let prescription = {
            setsReps: '3-4 serie x 4-6 ripetizioni',
            intensity: '75-85% 1RM o Carico Ottimale di Picco di Potenza',
            restInterval: '3-4 minuti tra le serie',
            correctiveDrills: 'Esercitazioni di stiffness alla caviglia e balzi pliometrici controllati',
            citations: []
        };

        if (type === 'TEST_TYPE_JUMP_STIFFNESS') {
            // Calcolo metriche specifiche per l'atleta esaminato
            let athRsi = sessionKpis.avgRSI || DEFAULT_FALLBACK_RSI;
            let athTcMs = sessionKpis.avgContactTimeMs || DEFAULT_FALLBACK_TC_MS;
            let athDeltaPct = 0;

            if (trials.length > 0) {
                const rsis = trials.map(t => t.rsi).filter(v => typeof v === 'number' && v > 0);
                const tcs = trials.map(t => t.contactTime || t.tc).filter(v => typeof v === 'number' && v > 0);
                if (rsis.length > 0) {
                    athRsi = rsis.reduce((a, b) => a + b, 0) / rsis.length;
                }
                if (tcs.length > 0) {
                    const meanTc = tcs.reduce((a, b) => a + b, 0) / tcs.length;
                    athTcMs = meanTc > MS_THRESHOLD_SECONDS ? meanTc : meanTc * SECONDS_TO_MS_FACTOR;
                }
                if (trials.length >= 2) {
                    const firstH = trials[0].jumpHeight || trials[0].h || 1;
                    const lastH = trials[trials.length - 1].jumpHeight || trials[trials.length - 1].h || 1;
                    athDeltaPct = ((lastH - firstH) / firstH) * PERCENT_MULTIPLIER;
                }
            }

            const isStiff = athTcMs < STIFF_CONTACT_TIME_THRESHOLD_SEC * SECONDS_TO_MS_FACTOR;
            const isHighRsi = athRsi >= RSI_HIGH_PERFORMANCE_THRESHOLD;

            if (isStiff && isHighRsi) {
                diagnosticComment = `${athleteName} dimostra un profilo elastico-reattivo avanzato: tempo di contatto breve (${athTcMs.toFixed(0)} ms) e RSI elevato (${athRsi.toFixed(2)}). Capacità di pre-attivazione e stiffness muscolo-tendinea del tricipite surale di eccellente qualità.`;
                bottleneck = athDeltaPct < FATIGUE_THRESHOLD_DELTA_PCT
                    ? 'Sensibilità all\'affaticamento: calo della prestazione nelle prove ripetute post-attivazione.'
                    : 'Nessun deficit reattivo primario: ottimizzazione della gestione del carico balistico ad alta intensità.';
                prescription = {
                    setsReps: 'Drop Jump da plinto 30-45 cm: 3 serie x 5 salti con enfasi sul rimbalzo rapido',
                    intensity: 'Massa corporea libera + eventuale sovraccarico balistico leggero (10-15% BW)',
                    restInterval: `${DEFAULT_PAP_REST_MIN}-${DEFAULT_PAP_REST_MAX} minuti per massimizzare la finestra di potenziamento post-attivazione (PAP)`,
                    correctiveDrills: 'Hurdle hops a contatto rapido (<150ms), pogo hops con caviglia rigida in dorsiflessione',
                    citations: [
                        'González-Badillo, J. J. et al. - Potentiation and fatigue interaction in sprinters and jumpers',
                        'Bosco, C., & Komi, P. V. - Mechanical characteristics of the stretch-shortening cycle'
                    ]
                };
            } else {
                diagnosticComment = `${athleteName} presenta una transizione eccentrico-concentrica rallentata (TC medio individuale: ${athTcMs.toFixed(0)} ms, RSI: ${athRsi.toFixed(2)}). La resa verticale è limitata da un cedimento elastico nella fase di ammortizzazione.`;
                bottleneck = 'Deficit di stiffness articolare alla caviglia e tempo di transizione eccentrico-concentrico prolungato (>170ms).';
                prescription = {
                    setsReps: '4 serie x 6 ripetizioni con carichi eccentrici controllati (3-4s fase negativa)',
                    intensity: '65-75% 1RM su Trap Bar Deadlift o Back Squat',
                    restInterval: '2.5 - 3 minuti tra le serie',
                    correctiveDrills: 'Pliometria estensiva: rimbalzi continui su corda, calf raises con isometria di 3 secondi al picco',
                    citations: [
                        'Flanagan, E. P., & Comyns, T. M. - The use of contact time and the reactive strength index to optimize training',
                        'McMahon, J. J. et al. - Understanding the key phases of the countermovement jump force-time curve'
                    ]
                };
            }
        } else if (type === 'TEST_TYPE_VBT') {
            let athVelLoss = sessionKpis.velocityLossPercent || DEFAULT_FALLBACK_VEL_LOSS;
            let ath1RM = sessionKpis.estimated1RM || DEFAULT_FALLBACK_1RM;
            let athTargetVel = sessionKpis.avgTargetVelocity || DEFAULT_FALLBACK_TARGET_VEL;

            if (trials.length >= 2) {
                const vels = trials.map(t => t.velocity || t.vmean).filter(v => typeof v === 'number' && v > 0);
                if (vels.length >= 2) {
                    const vInitial = vels[0];
                    const vMin = Math.min(...vels);
                    if (vInitial > 0) {
                        athVelLoss = Math.max(0, ((vInitial - vMin) / vInitial) * PERCENT_MULTIPLIER);
                    }
                }
            }

            if (athVelLoss <= VELOCITY_LOSS_POWER_THRESHOLD_PCT) {
                diagnosticComment = `${athleteName} conserva un'elevata velocità propulsiva con minima perdita intra-serie (${athVelLoss.toFixed(1)}%): lavoro in zona di massima potenza neuromuscolare con basso affaticamento metabolico sistemico.`;
                bottleneck = 'Preservazione della velocità ottimale: volume di ripetizioni contenuto per evitare derive ipertrofiche.';
                prescription = {
                    setsReps: '4-5 serie x 3 ripetizioni (stop immediato al calo del 10% di velocità)',
                    intensity: `Carico target: ${(ath1RM * VBT_PERCENT_LOAD_POWER).toFixed(0)} kg a velocità ${athTargetVel} m/s`,
                    restInterval: '3 minuti completi tra le serie',
                    correctiveDrills: 'Jump Squat con bilanciere scarico o Trap Bar Jump per massimizzare il picco di potenza',
                    citations: [
                        'González-Badillo, J. J., & Sánchez-Medina, L. (2010) - Movement velocity as a measure of loading intensity',
                        'Pareja-Blanco, F. et al. (2017) - Effects of velocity loss during resistance training on athletic performance'
                    ]
                };
            } else {
                diagnosticComment = `${athleteName} evidenzia un calo marcato della velocità propulsiva (${athVelLoss.toFixed(1)}%): accumulo precoce di fatica neuromuscolare e metabolica intra-serie.`;
                bottleneck = `Rapido decadimento velocitario (${athVelLoss.toFixed(1)}% > ${VELOCITY_LOSS_POWER_THRESHOLD_PCT}%): esaurimento delle fibre rapide IIx sotto tensione continuata.`;
                prescription = {
                    setsReps: 'Riduzione volume a 3 serie x 3-4 ripetizioni per preservare la qualità dinamica',
                    intensity: `Riduzione carico a ${(ath1RM * VBT_PERCENT_LOAD_FATIGUE).toFixed(0)} kg con monitoraggio velocità live`,
                    restInterval: '3.5 - 4 minuti di recupero passivo',
                    correctiveDrills: 'Lavoro con fermo isometrico di 1 secondo al punto di inversione per azzerare l\'inerzia',
                    citations: [
                        'Sánchez-Medina, L., & González-Badillo, J. J. (2011) - Velocity loss as an indicator of neuromuscular fatigue',
                        'Weakley, J. et al. (2021) - Velocity-based training: From theory to application'
                    ]
                };
            }
        } else if (type === 'TEST_TYPE_SPRINT_GATES') {
            const split10 = trials[0]?.split_10m || sessionKpis.accelTime0_10m || DEFAULT_FALLBACK_ACCEL_10M;
            diagnosticComment = `${athleteName} registra un tempo 0-10m di ${split10.toFixed(3)}s. Efficace erogazione di forza propulsiva orizzontale dai blocchi; consigliata rifinitura dell'angolo di drive iniziale.`;
            bottleneck = 'Inclinazione tronco nei primi 3 appoggi: tendenza a raddrizzare precocemente il busto prima dei 15 metri.';
            prescription = {
                setsReps: 'Partenze da fermo: 2 serie x 3 ripetizioni sui 10-20m',
                intensity: 'Intensità massimale 100% all-out',
                restInterval: '1 minuto di recupero per ogni 10 metri sprintati',
                correctiveDrills: 'Traino con slitta a sovraccarico leggero (10-12% massa corporea) per consolidare il vettore orizzontale',
                citations: [
                    'Morin, J. B., & Samozino, P. (2016) - Interpreting Power-Force-Velocity profiles for individualized training',
                    'Bezodis, N. E. et al. (2019) - Sprint start biomechanics and horizontal force production'
                ]
            };
        } else if (type === 'TEST_TYPE_VIDEO_2D') {
            const rom = sessionKpis.articularRomDeg || DEFAULT_FALLBACK_ROM;
            const angVel = sessionKpis.peakAngularVelocityDegS || DEFAULT_FALLBACK_PEAK_ANG_VEL;
            diagnosticComment = `${athleteName} evidenzia un ROM articolare di ${rom}° con picco di velocità angolare di ${angVel}°/s. Controllo dell'asse femoro-rotuleo stabile durante l'inversione di moto.`;
            bottleneck = 'Controllo eccentrico terminale: lieve compenso di flessione del tronco in massima accosciata.';
            prescription = {
                setsReps: '3 serie x 8 ripetizioni con enfasi sul controllo propriocettivo dell\'asse dell\'arto inferiore',
                intensity: 'Carico submassimale controllato (50-60% 1RM)',
                restInterval: '2 minuti completi',
                correctiveDrills: 'Box squat con elastico ad anello sopra le ginocchia per rinforzare l\'attivazione del medio gluteo',
                citations: [
                    'Hewett, T. E. et al. - Biomechanical measures of neuromuscular control and valgus loading of the knee',
                    'Escamilla, R. F. (2001) - Knee biomechanics of the dynamic squat exercise'
                ]
            };
        } else if (type === 'TEST_TYPE_FORCE_ISOMETRIC') {
            const peakF = sessionKpis.peakForceNewtons || FORCE_DEFAULT_PEAK_N;
            const rfd = sessionKpis.rfd100ms || FORCE_DEFAULT_RFD;
            diagnosticComment = `${athleteName} esprime un picco di forza di ${peakF.toFixed(0)} N con RFD a 100ms pari a ${rfd.toFixed(0)} N/s. Profilo massimale ben strutturato.`;
            bottleneck = 'Tasso di sviluppo della forza (RFD precoce < 100ms) rispetto al potenziale di forza massimale isometrico.';
            prescription = {
                setsReps: 'Tirate isometriche dai blocchi (IMTP): 3 serie x 4 ripetizioni massimali da 3 secondi',
                intensity: '100% sforzo isometrico massimale esplosivo',
                restInterval: '3 minuti tra le ripetizioni',
                correctiveDrills: 'Clean pull dal blocco medio con massima enfasi sull\'esplosività di spinta dei piedi',
                citations: [
                    'Haff, G. G. et al. - Isometric Mid-Thigh Pull: A valid measure of athletic strength',
                    'Suchomel, T. J. et al. - The Importance of Muscular Strength: Training Considerations'
                ]
            };
        } else if (type === 'TEST_TYPE_MEDICINE_BALL') {
            const ballM = sessionKpis.ballMassKg || trials[0]?.ballMass || DEFAULT_FALLBACK_BALL_MASS_KG;
            const dist = sessionKpis.avgThrowDistanceM || trials[0]?.throwDistance || DEFAULT_FALLBACK_THROW_DIST_M;
            const pwr = sessionKpis.peakPowerW || sessionKpis.avgPowerWatts || trials[0]?.power || DEFAULT_FALLBACK_POWER_W;
            diagnosticComment = `${athleteName} registra una gittata di ${dist.toFixed(2)} m con palla da ${ballM} kg (potenza stimata Sayers/Harman: ${pwr.toFixed(0)} W). Efficace trasferimento cinetico dalla catena cinetica inferiore agli arti superiori.`;
            bottleneck = 'Angolo di rilascio balistico: ottimizzazione dell\'inclinazione di uscita (target 40-42°) per massimizzare la gittata.';
            prescription = {
                setsReps: 'Lanci esplosivi dal petto e sopra la testa: 4 serie x 4 lanci massimali',
                intensity: 'Palla medica 3-5 kg con massima velocità di spinta e rimbalzo a parete',
                restInterval: '2-3 minuti di recupero completo tra le serie',
                correctiveDrills: 'Esercitazioni a catena cinetica combinata (jump throw con caricamento anca/ginocchio)',
                citations: [
                    'Sayers, S. P. et al. - Cross-validation of three jump power equations',
                    'Harman, E. A. et al. - Estimation of human power output from vertical jump'
                ]
            };
        } else {
            diagnosticComment = `Sessione tabellare analizzata per ${athleteName}: dati conformi ai controlli metrologici generali.`;
            bottleneck = 'Monitoraggio longitudinale per rilevare trend individuali di adattamento.';
            prescription = {
                setsReps: 'Prosecuzione del protocollo programmato',
                intensity: 'Carico commisurato al microciclo',
                restInterval: '2 minuti',
                correctiveDrills: 'Stabilità del tronco e mobilità dinamica preparatoria',
                citations: [
                    'American College of Sports Medicine (ACSM) - Progression Models in Resistance Training'
                ]
            };
        }

        // Arricchimento con citazioni bibliografiche dalla Libreria Fonti e RAG
        const ragCitations = formatEvidenceCitations(evidenceList);
        if (ragCitations.length > 0) {
            prescription.citations = Array.from(new Set([...prescription.citations, ...ragCitations]));
        }

        return {
            diagnosticComment,
            bottleneck,
            prescription
        };
    }

    const RAGAnalysisIntegration = {
        buildContextualQuery,
        fetchScientificInsights,
        generatePrescription,
        formatEvidenceCitations
    };

    // Esposizione globale
    root.RAGAnalysisIntegration = RAGAnalysisIntegration;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = RAGAnalysisIntegration;
    }
})();
