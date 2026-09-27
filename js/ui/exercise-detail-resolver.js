/**
 * js/ui/exercise-detail-resolver.js
 * Modulo per la risoluzione multi-livello dei dettagli esercizio nella vista Programmazione
 * Livello 1: Corrispondenza per ID a catalogo
 * Livello 2: Corrispondenza per Nome Esatto a catalogo
 * Livello 3: Corrispondenza Normalizzata (pulizia parentesi/varianti) a catalogo
 * Livello 4: Generatore Sintetico Avanzato e Strutturato per esercizi clinici, warmup e cardio
 */

(function () {
    'use strict';

    // Inizializzazione namespace globale App
    window.App = window.App || {};

    // Costanti descrittive per evitare numeri magici
    const DEFAULT_SETS = 3;
    const DEFAULT_REST_SEC = 60;
    const DEFAULT_RPE = 7;
    const DEFAULT_WARMUP_RPE = 5;
    const DEFAULT_CARDIO_RPE = 4;
    const DEFAULT_CLINICAL_RPE = 6;
    const MIN_CLEAN_NAME_LEN = 3;
    const MAX_STEPS_COUNT = 4;
    const MAX_ERRORS_COUNT = 3;

    // Costanti di scoring per la risoluzione normalizzata a catalogo
    const SCORE_DIRECT_MATCH = 100;
    const SCORE_STOPWORD_MATCH = 80;
    const SCORE_SUBSTRING_MATCH = 50;
    const SCORE_SUBSTRING_STOPWORD_MATCH = 40;
    const SCORE_TOKEN_MATCH_BASE = 30;
    const SCORE_TOKEN_RATIO_WEIGHT = 40;
    const MIN_TOKEN_MATCH_RATIO = 0.6;
    const MIN_TOKEN_COMMON_COUNT = 2;

    // Identificatori dei pattern motori principali
    const PATTERN_KNEE_DOMINANT = 'KNEE_DOMINANT';
    const PATTERN_HIP_DOMINANT = 'HIP_DOMINANT';
    const PATTERN_CORE_STABILITY = 'CORE_STABILITY';
    const PATTERN_UPPER_PULL = 'UPPER_PULL';
    const PATTERN_UPPER_PUSH = 'UPPER_PUSH';
    const PATTERN_MOBILITY_WARMUP = 'MOBILITY_WARMUP';
    const PATTERN_CARDIO_COOLDOWN = 'CARDIO_COOLDOWN';
    const PATTERN_PROPRIOCEPTION = 'PROPRIOCEPTION';
    const PATTERN_GENERAL = 'GENERAL';

    /**
     * Inferisce il pattern motorio di un esercizio basandosi su muscoli target e tipo.
     * Usa la stessa logica interna del resolver senza richiedere un campo "pattern"
     * nel database degli esercizi.
     * @param {Object} exercise - Esercizio con campi primaryMuscle, muscles, type
     * @returns {string} Pattern identificato (KNEE_DOMINANT, HIP_DOMINANT, UPPER_PUSH, etc.)
     */
    window.App.inferMovementPattern = function (exercise) {
        if (!exercise) return PATTERN_GENERAL;
        const pm = (exercise.primaryMuscle || '').toLowerCase();
        const muscles = (exercise.muscles || []).map(m => String(m || '').toLowerCase());
        const type = (exercise.type || '').toLowerCase();

        // Pattern KNEE_DOMINANT: quadricipiti, gambe, ginocchio
        if (pm.includes('quadricip') || pm.includes('gambe') || muscles.some(m => m.includes('quadricip') || m.includes('gambe'))) return PATTERN_KNEE_DOMINANT;
        // Pattern HIP_DOMINANT: glutei, femorali, bicipite femorale, ischiocrurali
        if (pm.includes('glute') || pm.includes('femor') || pm.includes('ischiocrural') || muscles.some(m => m.includes('glute') || m.includes('femor') || m.includes('ischiocrural'))) return PATTERN_HIP_DOMINANT;
        // Pattern UPPER_PUSH: petto, pettorali, pettorale, tricipiti, deltoide anteriore, spalle
        if (pm.includes('petto') || pm.includes('pettoral') || pm.includes('tricip') || pm.includes('deltoide anteriore') || muscles.some(m => m.includes('petto') || m.includes('pettoral') || m.includes('tricip'))) return PATTERN_UPPER_PUSH;
        // Pattern UPPER_PULL: schiena, dorsale, dorsali, bicipiti, romboidi, trapezio
        if (pm.includes('dorsal') || pm.includes('schiena') || pm.includes('bicipit') || pm.includes('rombo') || pm.includes('trapezio') || muscles.some(m => m.includes('dorsal') || m.includes('schiena') || m.includes('bicipit') || m.includes('rombo'))) return PATTERN_UPPER_PULL;
        // Pattern CORE_STABILITY: core, addome, addominali, obliqui, isometrico
        if (pm.includes('core') || pm.includes('addom') || pm.includes('obliqu') || type === 'isometrico' || muscles.some(m => m.includes('core') || m.includes('addom') || m.includes('obliqu'))) return PATTERN_CORE_STABILITY;
        return PATTERN_GENERAL;
    };

    // Parole vuote e connettori preposizionali italiani per la normalizzazione semantica
    const ITALIAN_STOPWORDS = new Set([
        'con', 'al', 'alla', 'allo', 'alle', 'ai', 'agli',
        'da', 'di', 'del', 'dello', 'della', 'dei', 'degli', 'delle',
        'in', 'su', 'sul', 'sulla', 'sullo', 'sulle', 'sui', 'sugli',
        'per', 'a', 'tra', 'fra'
    ]);

    /**
     * Verifica che una stringa o valore sia sicuro e non contenga 'undefined', 'null', 'N/A', 'NaN' o '[object Object]'
     * @param {*} val - Valore da validare
     * @returns {boolean} True se il valore è valido e utilizzabile
     */
    function isSafeValue(val) {
        if (val === undefined || val === null) return false;
        const s = String(val).trim().toLowerCase();
        return s !== '' && s !== 'undefined' && s !== 'null' && s !== 'n/a' && s !== '-' && s !== 'nan' && s !== '[object object]';
    }

    /**
     * Normalizza e fonde le specifiche di carico con valori di default coerenti,
     * garantendo la totale assenza di proprietà undefined o placeholder non validi.
     * @param {Object} [rawSpecs] - Oggetto specs originale
     * @param {string} pattern - Pattern motorio identificato
     * @param {boolean} isClinical - Flag esercizio clinico o adattato
     * @param {string} equipment - Attrezzatura identificata
     * @returns {Object} Oggetto specs completo con sets, reps, rest, rpe, tempo, load
     */
    function normalizeSpecs(rawSpecs, pattern, isClinical, equipment) {
        const raw = (rawSpecs && typeof rawSpecs === 'object') ? rawSpecs : {};
        const isWarmup = (pattern === PATTERN_MOBILITY_WARMUP);
        const isCardio = (pattern === PATTERN_CARDIO_COOLDOWN);

        let defaultSets = DEFAULT_SETS;
        let defaultReps = '10-12';
        let defaultRest = DEFAULT_REST_SEC + 's';
        let defaultRpe = DEFAULT_RPE;
        let defaultTempo = '2-0-2';
        let defaultLoad = 'A corpo libero';

        if (isWarmup) {
            defaultSets = 1;
            defaultReps = '45-60s';
            defaultRest = 'Attivo';
            defaultRpe = DEFAULT_WARMUP_RPE;
            defaultTempo = 'Fluido';
            defaultLoad = 'A corpo libero';
        } else if (isCardio) {
            defaultSets = 1;
            defaultReps = '5-10 min';
            defaultRest = 'Continuo';
            defaultRpe = DEFAULT_CARDIO_RPE;
            defaultTempo = 'Costante';
            defaultLoad = equipment === 'Macchina Cardio' ? 'Resistenza controllata' : 'A corpo libero';
        } else if (isClinical) {
            defaultSets = DEFAULT_SETS;
            defaultReps = '10-12';
            defaultRest = '60-90s';
            defaultRpe = DEFAULT_CLINICAL_RPE;
            defaultTempo = '3-0-2';
            defaultLoad = 'Carico naturale / adattato';
        }

        const safeSets = isSafeValue(raw.sets) ? raw.sets : defaultSets;
        const safeReps = isSafeValue(raw.reps) ? raw.reps : defaultReps;
        const safeRest = isSafeValue(raw.rest) ? raw.rest : defaultRest;
        const safeRpe = isSafeValue(raw.rpe) ? raw.rpe : defaultRpe;
        const safeTempo = isSafeValue(raw.tempo) ? raw.tempo : defaultTempo;
        const safeLoad = isSafeValue(raw.load) ? raw.load : defaultLoad;

        return {
            sets: safeSets,
            reps: safeReps,
            rest: safeRest,
            rpe: safeRpe,
            tempo: safeTempo,
            load: safeLoad
        };
    }

    /**
     * Identifica il pattern motorio prevalente in base al nome, tipo e flag dell'esercizio
     * @param {string} name - Nome dell'esercizio
     * @param {string} [type] - Tipo dell'esercizio
     * @param {boolean} [isWarmup] - Flag esercizio riscaldamento
     * @param {boolean} [isCardio] - Flag esercizio cardio o defaticamento
     * @returns {string} Identificatore costante del pattern motorio
     */
    function detectPattern(name, type, isWarmup, isCardio) {
        const lower = String(name || '').toLowerCase();
        const lowerType = String(type || '').toLowerCase();

        // Controllo prioritario su flag espliciti
        if (isCardio || lower.includes('cardio') || lower.includes('cyclette') || lower.includes('cicloergometro') || lower.includes('tapis') || lower.includes('corsa') || lower.includes('camminat') || lower.includes('defaticament')) {
            return PATTERN_CARDIO_COOLDOWN;
        }

        if (isWarmup || lower.includes('mobilit') || lower.includes('cat-cow') || lower.includes('gatto') || lower.includes('foam roll') || lower.includes('allungament') || lower.includes('stretch') || lower.includes('circonduzion') || lower.includes('clamshell') || lower.includes('slide')) {
            return PATTERN_MOBILITY_WARMUP;
        }

        if (lower.includes('airex') || lower.includes('equilibrio') || lower.includes('balance') || lower.includes('propriocez') || (lower.includes('monopodalico') && lower.includes('occhi'))) {
            return PATTERN_PROPRIOCEPTION;
        }

        if (lower.includes('plank') || lower.includes('core') || lower.includes('bird-dog') || lower.includes('pallof') || lower.includes('woodchopper') || lower.includes('copenhagen') || lower.includes('addominal') || lower.includes('hollow')) {
            return PATTERN_CORE_STABILITY;
        }

        if (lower.includes('squat') || lower.includes('wall sit') || lower.includes('leg press') || lower.includes('step-up') || lower.includes('step-down') || lower.includes('affond') || lower.includes('lunge') || lower.includes('leg extension') || lower.includes('quadricip')) {
            return PATTERN_KNEE_DOMINANT;
        }

        if (lower.includes('stacco') || lower.includes('deadlift') || lower.includes('rdl') || lower.includes('ponte glutei') || lower.includes('hip thrust') || lower.includes('leg curl') || lower.includes('femorali') || lower.includes('ischiocrurali') || lower.includes('straight leg')) {
            return PATTERN_HIP_DOMINANT;
        }

        if (lower.includes('remator') || lower.includes('row') || lower.includes('trazion') || lower.includes('pull-up') || lower.includes('lat machine') || lower.includes('pulldown') || lower.includes('dorsal')) {
            return PATTERN_UPPER_PULL;
        }

        if (lower.includes('panca') || lower.includes('bench') || lower.includes('push-up') || lower.includes('piegament') || lower.includes('dip') || lower.includes('press') || lower.includes('arnold') || lower.includes('spinte') || lower.includes('distension')) {
            return PATTERN_UPPER_PUSH;
        }

        if (lowerType.includes('isometric')) {
            return PATTERN_CORE_STABILITY;
        }

        return PATTERN_GENERAL;
    }

    /**
     * Deduce l'attrezzatura richiesta in base al nome e alle specifiche di carico
     * @param {string} name - Nome dell'esercizio
     * @param {Object} [specs] - Specifiche di serie, reps e carico
     * @returns {string} Attrezzatura tradotta in italiano
     */
    function inferEquipment(name, specs) {
        const text = (String(name || '') + ' ' + String(specs && specs.load ? specs.load : '')).toLowerCase();

        if (text.includes('bilanciere') || text.includes('barbell')) return 'Bilanciere';
        if (text.includes('manubri') || text.includes('manubrio') || text.includes('dumbbell') || text.includes('db')) return 'Manubri';
        if (text.includes('kettlebell') || text.includes('kb')) return 'Kettlebell';
        if (text.includes('cavi') || text.includes('cavo') || text.includes('cable')) return 'Cavi';
        if (text.includes('elastico') || text.includes('band') || text.includes('mini-band')) return 'Elastico';
        if (text.includes('leg press') || text.includes('leg extension') || text.includes('leg curl') || text.includes('lat machine') || text.includes('macchina')) return 'Macchina';
        if (text.includes('cyclette') || text.includes('cicloergometro') || text.includes('tapis') || text.includes('bike')) return 'Macchina Cardio';
        if (text.includes('foam roller') || text.includes('foam')) return 'Foam Roller';
        if (text.includes('box') || text.includes('step')) return 'Box / Rialzo';
        if (text.includes('airex') || text.includes('pad')) return 'Pedana Propriocettiva';
        if (text.includes('swiss ball') || text.includes('palla') || text.includes('pallina')) return 'Swiss Ball';
        if (text.includes('cavigliera')) return 'Cavigliere';

        return 'A corpo libero';
    }

    /**
     * Deduce il gruppo muscolare primario
     * @param {string} name - Nome dell'esercizio
     * @param {string} pattern - Pattern motorio associato
     * @param {string|Array} [dayFocus] - Focus muscolare della seduta
     * @returns {string} Nome del muscolo primario
     */
    function inferPrimaryMuscle(name, pattern, dayFocus) {
        const lower = String(name || '').toLowerCase();

        if (lower.includes('glute') || lower.includes('ponte') || lower.includes('clamshell') || lower.includes('monster walk')) return 'Glutei';
        if (lower.includes('core') || lower.includes('plank') || lower.includes('bird-dog') || lower.includes('pallof') || lower.includes('woodchopper') || lower.includes('copenhagen')) return 'Core';
        if (lower.includes('schiena') || lower.includes('dorsal') || lower.includes('remator') || lower.includes('trazion') || lower.includes('pull')) return 'Schiena';
        if (lower.includes('petto') || lower.includes('panca') || lower.includes('push-up') || lower.includes('piegament')) return 'Pettorali';
        if (lower.includes('spall') || lower.includes('deltoid') || lower.includes('arnold') || lower.includes('slide')) return 'Spalle';
        if (lower.includes('bicipit') || lower.includes('tricipit') || lower.includes('braccia') || lower.includes('curl')) return 'Braccia';
        if (lower.includes('quadricip') || lower.includes('coscia') || lower.includes('femoral') || lower.includes('ischiocrural') || lower.includes('adduttor') || lower.includes('abduttor')) return 'Gambe';
        if (lower.includes('cavigli') || lower.includes('polpacc')) return 'Polpacci';

        switch (pattern) {
            case PATTERN_KNEE_DOMINANT:
            case PATTERN_HIP_DOMINANT:
                return 'Gambe';
            case PATTERN_CORE_STABILITY:
                return 'Core';
            case PATTERN_UPPER_PULL:
                return 'Schiena';
            case PATTERN_UPPER_PUSH:
                return 'Pettorali';
            case PATTERN_CARDIO_COOLDOWN:
                return 'Sistema Cardiovascolare';
            case PATTERN_MOBILITY_WARMUP:
                return 'Mobilità Articolare';
            case PATTERN_PROPRIOCEPTION:
                return 'Stabilizzatori e Gambe';
            default:
                if (dayFocus) {
                    if (Array.isArray(dayFocus) && dayFocus.length > 0) return dayFocus[0];
                    if (typeof dayFocus === 'string' && dayFocus.trim().length > 0) {
                        return dayFocus.split('•')[0].trim();
                    }
                }
                return 'Condizionamento Globale';
        }
    }

    /**
     * Costruisce la lista di muscoli primari e secondari
     * @param {string} primary - Muscolo principale
     * @param {string} pattern - Pattern motorio associato
     * @returns {Array<string>} Lista ordinata e deduplicata di muscoli
     */
    function inferMusclesList(primary, pattern) {
        const list = [primary];

        switch (pattern) {
            case PATTERN_KNEE_DOMINANT:
                list.push('Quadricipiti', 'Glutei', 'Core');
                break;
            case PATTERN_HIP_DOMINANT:
                list.push('Glutei', 'Ischiocrurali', 'Lombari');
                break;
            case PATTERN_CORE_STABILITY:
                list.push('Retto Addominale', 'Obliqui', 'Stabilizzatori Rachide');
                break;
            case PATTERN_UPPER_PULL:
                list.push('Gran Dorsale', 'Romboidi', 'Bicipiti');
                break;
            case PATTERN_UPPER_PUSH:
                list.push('Deltoidi Anteriori', 'Tricipiti', 'Fascio Clavicolare');
                break;
            case PATTERN_MOBILITY_WARMUP:
                list.push('Catena Cinetica Globale', 'Articolazioni', 'Tessuti Connettivi');
                break;
            case PATTERN_CARDIO_COOLDOWN:
                list.push('Gambe', 'Resistenza Generale');
                break;
            case PATTERN_PROPRIOCEPTION:
                list.push('Stabilizzatori Caviglia', 'Gluteo Medio', 'Core');
                break;
            default:
                list.push('Stabilizzatori');
                break;
        }

        // Filtro elementi unici mantenendo l'ordine
        const seen = {};
        const result = [];
        for (const m of list) {
            if (m && !seen[m]) {
                seen[m] = true;
                result.push(m);
            }
        }
        return result;
    }

    /**
     * Determina la tipologia dell'esercizio (Multiarticolare, Isolamento, Isometrico, etc.)
     * @param {string} name - Nome dell'esercizio
     * @param {string} pattern - Pattern motorio associato
     * @param {Object} [progEx] - Oggetto esercizio dal programma
     * @returns {string} Tipologia descrittiva
     */
    function inferType(name, pattern, progEx) {
        if (progEx && progEx.type && progEx.type !== 'N/A' && progEx.type !== 'undefined') {
            if (progEx.type === 'Mobilità') return 'Attivazione / Mobilità';
            if (progEx.type === 'Cardio') return 'Cardio / Defaticamento';
            return progEx.type;
        }

        const lower = String(name || '').toLowerCase();
        if (lower.includes('isometri') || lower.includes('plank') || lower.includes('wall sit') || lower.includes('tenuta') || lower.includes('equilibrio')) {
            return 'Isometrico';
        }

        switch (pattern) {
            case PATTERN_CARDIO_COOLDOWN:
                return 'Cardio / Defaticamento';
            case PATTERN_MOBILITY_WARMUP:
                return 'Attivazione / Mobilità';
            case PATTERN_CORE_STABILITY:
            case PATTERN_PROPRIOCEPTION:
                return 'Isometrico';
            case PATTERN_KNEE_DOMINANT:
            case PATTERN_HIP_DOMINANT:
            case PATTERN_UPPER_PULL:
            case PATTERN_UPPER_PUSH:
                if (lower.includes('extension') || lower.includes('curl') || lower.includes('alzate') || lower.includes('clamshell') || lower.includes('slide')) {
                    return 'Isolamento';
                }
                return 'Multiarticolare';
            default:
                return 'Attivazione Funzionale';
        }
    }

    /**
     * Genera i dettagli esecutivi completi (context, setup, steps, cues, criteria)
     * @param {string} name - Nome esercizio
     * @param {string} pattern - Pattern motorio
     * @param {string} primaryMuscle - Muscolo target
     * @param {string} equipment - Attrezzatura
     * @param {Object} [specs] - Parametri di carico prescritti
     * @param {string} [note] - Note cliniche o specifiche dell'esercizio
     * @returns {Object} Oggetto con context, setup, steps, cues, criteria
     */
    function generateExecution(name, pattern, primaryMuscle, equipment, specs, note) {
        const tempoStr = specs && specs.tempo ? specs.tempo : 'controllato';
        const repsStr = specs && specs.reps ? specs.reps : 'ripetizioni prescritte';

        // 1. Context
        let context = 'Esercizio strutturato per il reclutamento ottimale di ' + primaryMuscle + ' con enfasi sulla sicurezza articolare e sul controllo del pattern biomeccanico.';
        if (note && note.trim().length > 0) {
            context += ' Indicazione clinica: ' + note.trim();
        }
        if (specs && specs.sets && specs.reps) {
            const setsLabel = String(specs.sets).toLowerCase().includes('set') ? String(specs.sets) : (specs.sets + ' serie');
            context += ' Prescrizione: ' + setsLabel + ' per ' + specs.reps;
            if (specs.load && specs.load !== 'A corpo libero' && specs.load !== 'Corpo libero') {
                context += ' con carico ' + specs.load;
            }
            if (specs.rest && specs.rest !== 'Attivo' && specs.rest !== 'Continuo') {
                context += ', recupero ' + specs.rest;
            }
            context += '.';
        }

        // 2. Setup
        let setup = [
            'Posizionati stabilmente verificando l\'assetto di partenza e l\'aderenza al suolo.',
            'Allinea il rachide mantenendo le fisiologiche curve lombari e cervicali.',
            'Attiva preventivamente la muscolatura stabilizzatrice del tronco e del core.'
        ];

        if (pattern === PATTERN_KNEE_DOMINANT) {
            setup = [
                'Posiziona i piedi alla larghezza delle spalle con le punte leggermente extraruotate.',
                'Verifica l\'altezza di appoggio o il blocco di sicurezza (box o parete) per tutelare l\'angolo articolare.',
                'Distribuisci il carico equamente sull\'intero arco plantare prima di avviare il movimento.'
            ];
        } else if (pattern === PATTERN_HIP_DOMINANT) {
            setup = [
                'Imposta i piedi a larghezza bacino con le ginocchia sbloccate di circa 10-15 gradi.',
                'Impugna l\'attrezzo o posiziona il corpo garantendo la completa retrazione scapolare.',
                'Attiva glutei e parete addominale per sigillare il rachide in posizione neutra.'
            ];
        } else if (pattern === PATTERN_CORE_STABILITY || pattern === PATTERN_PROPRIOCEPTION) {
            setup = [
                'Stabilisci i punti di ancoraggio al suolo (gomiti, mani o appoggio monopodalico).',
                'Allinea con precisione spalle, bacino e caviglie creando un asse rigido.',
                'Respira in modo diaframmatico mantenendo una leggera retroversione pelvica.'
            ];
        } else if (pattern === PATTERN_MOBILITY_WARMUP || pattern === PATTERN_CARDIO_COOLDOWN) {
            setup = [
                'Regola l\'attrezzatura (' + equipment + ') o predisponi lo spazio a terra in modo confortevole.',
                'Assumi una postura rilassata ma vigile, eliminando tensioni parassite al collo.',
                'Avvia gradualmente il ritmo senza imprimere accelerazioni improvvise.'
            ];
        }

        // 3. Steps
        let steps = [
            'Avvia la fase eccentrica in modo fluido e controllato secondo il tempo indicato (' + tempoStr + ').',
            'Raggiungi l\'ampiezza di lavoro prestabilita senza perdere la tensione muscolare attiva.',
            'Inverti il movimento imprimendo forza controllata nella fase concentrica ed espirando.',
            'Completa le ' + repsStr + ' mantenendo sempre la precisione tecnica fino all\'ultimo secondo.'
        ];

        if (pattern === PATTERN_CORE_STABILITY || pattern === PATTERN_PROPRIOCEPTION || (specs && specs.tempo === 'Isometria')) {
            steps = [
                'Raggiungi la posizione di contrazione isometrica target in modo progressivo.',
                'Mantieni la tensione muscolare statica e costante per l\'intera durata indicata (' + repsStr + ').',
                'Respira fluidamente a glottide aperta, scongiurando qualsiasi apnea.',
                'Ritorna alla postura di riposo con cautela e controllo al termine della serie.'
            ];
        } else if (pattern === PATTERN_MOBILITY_WARMUP) {
            steps = [
                'Muoviti con dolcezza verso la massima escursione fisiologica confortevole.',
                'Mantieni l\'allungamento o l\'apertura articolare per alcuni secondi accompagnando il respiro.',
                'Rilascia lentamente la tensione muscolare tornando al punto di partenza.',
                'Ripeti la sequenza con ritmo uniforme per riscaldare i tessuti connettivi.'
            ];
        } else if (pattern === PATTERN_CARDIO_COOLDOWN) {
            steps = [
                'Pedala o muoviti a cadenza costante nel rispetto della zona aerobica prescritta.',
                'Controlla la frequenza respiratoria sincronizzandola con il ciclo di lavoro.',
                'Mantieni il busto rilassato evitando carichi anomali sul tratto cervicale.',
                'Concludi con una fase di decelerazione graduale per favorire il recupero emodinamico.'
            ];
        }

        // 4. Cues
        let cues = [
            'Espira nella fase di maggiore sforzo e mantieni il torace aperto.',
            'Controlla la traiettoria: il movimento deve essere fluido, senza scatti.',
            'Attenzione continua alla stabilità delle articolazioni portanti.'
        ];

        if (pattern === PATTERN_KNEE_DOMINANT) {
            cues = [
                'Ginocchia sempre allineate sul secondo dito del piede, vietato il cedimento in valgo.',
                'Spingi uniformemente attraverso il tallone e l\'avampiede senza sollevare la pianta.',
                'Rispetta con rigore l\'angolo articolare limite per proteggere il compartimento patellare.'
            ];
        } else if (pattern === PATTERN_HIP_DOMINANT) {
            cues = [
                'Spingi indietro il bacino immaginando di toccare una parete posteriore.',
                'Colonna vertebrale rigorosamente dritta, nessun incurvamento lombare.',
                'Contrai i glutei alla chiusura del movimento senza iperestendere la schiena.'
            ];
        } else if (pattern === PATTERN_CORE_STABILITY) {
            cues = [
                'Glutei e addome contratti in sinergia per bloccare la lordosi lombare.',
                'Spalle distanti dalle orecchie con scapole stabilizzate.',
                'Respira ritmicamente mantenendo la rigidità addominale (brace).'
            ];
        }

        // Se è presente una nota specifica, inietta un cue dedicato
        if (note && note.trim().length > 0) {
            cues.unshift('Focus prescritto: ' + note.trim());
        }

        // 5. Criteria
        const criteria = [
            'Mantenimento costante del controllo motorio per tutte le ripetizioni.',
            'Rispetto fedele del range di movimento (ROM) e del tempo esecutivo prescritto.',
            'Assenza totale di sensazioni dolorose o compensi anomali a carico di altri distretti.'
        ];

        return {
            context: context,
            setup: setup,
            steps: steps.slice(0, MAX_STEPS_COUNT),
            cues: cues,
            criteria: criteria
        };
    }

    /**
     * Genera una lista di errori comuni e relative correzioni per il pattern motorio
     * @param {string} pattern - Pattern motorio associato
     * @param {string} name - Nome dell'esercizio
     * @returns {Array<Object>} Lista di errori strutturati con error, why, fix
     */
    function generateErrors(pattern, name) {
        const lower = String(name || '').toLowerCase();

        if (pattern === PATTERN_KNEE_DOMINANT) {
            return [
                {
                    error: 'Collasso in valgo del ginocchio',
                    why: 'La convergenza mediale del ginocchio moltiplica le forze di taglio sul legamento crociato anteriore e sulla rotula.',
                    fix: 'Spingi attivamente le ginocchia all\'esterno in linea con l\'asse del piede durante l\'intera escursione.'
                },
                {
                    error: 'Superamento del ROM di sicurezza',
                    why: 'Flettere il ginocchio oltre i gradi raccomandati sovraccarica le strutture legamentose e cartilaginee.',
                    fix: 'Utilizza un box alto, la parete o un arresto visivo per invertire il moto alla quota prefissata.'
                },
                {
                    error: 'Sollevamento dei talloni dal suolo',
                    why: 'Spostare il peso solo sull\'avampiede scarica una tensione abnorme sul tendine rotuleo.',
                    fix: 'Spiana il piede distribuendo il peso sui tre punti d\'appoggio plantare.'
                }
            ];
        }

        if (pattern === PATTERN_HIP_DOMINANT) {
            return [
                {
                    error: 'Flessione del rachide lombare',
                    why: 'Incurvare la parte bassa della schiena trasforma l\'anca in una leva svantaggiosa comprimendo i dischi intervertebrali.',
                    fix: 'Mantieni il petto fiero, fletti l\'anca arretrando il bacino e fissa lo sguardo in avanti a terra.'
                },
                {
                    error: 'Squattare il movimento di stacco',
                    why: 'Piegare eccessivamente le ginocchia riduce il reclutamento di ischiocrurali e glutei alterando la traiettoria.',
                    fix: 'Conserva le tibie quasi verticali e focalizzati solo sullo scivolamento posteriore del bacino.'
                }
            ];
        }

        if (pattern === PATTERN_CORE_STABILITY || pattern === PATTERN_PROPRIOCEPTION) {
            return [
                {
                    error: 'Inarcamento lombare con bacino cadente',
                    why: 'La perdita della tenuta addominale comprime le faccette articolari lombari e annulla lo stimolo sul core.',
                    fix: 'Attiva con decisione i glutei ed esegui una modesta retroversione del bacino verso l\'ombelico.'
                },
                {
                    error: 'Apnea prolungata durante la contrazione',
                    why: 'Bloccare l\'aria alza improvvisamente la pressione sanguigna senza apportare benefici di tenuta posturale.',
                    fix: 'Mantieni una respirazione controllata a diaframma libero durante tutto il tempo di esecuzione.'
                }
            ];
        }

        if (pattern === PATTERN_MOBILITY_WARMUP) {
            return [
                {
                    error: 'Molleggio rapido o movimenti balistici',
                    why: 'Uno stiramento brusco attiva il riflesso miotatico protettivo causando contrazione invece di rilassamento.',
                    fix: 'Raggiungi la tensione di allungamento in maniera progressiva e mantienila respirando a fondo.'
                },
                {
                    error: 'Compensi articolari su segmenti adiacenti',
                    why: 'Ruotare il tronco o inarcare il bacino bypassa l\'articolazione bersaglio vanificando l\'esercizio.',
                    fix: 'Isola il distretto motorio e riduci l\'ampiezza se compaiono rotazioni indesiderate.'
                }
            ];
        }

        if (pattern === PATTERN_CARDIO_COOLDOWN) {
            return [
                {
                    error: 'Intensità troppo elevata rispetto al target',
                    why: 'Superare la soglia aerobica programmata per il recupero produce affaticamento residuo e acido lattico.',
                    fix: 'Modera la resistenza o la cadenza verificando di poter conversare agevolmente durante l\'attività.'
                },
                {
                    error: 'Assetto posturale scorretto sulla macchina',
                    why: 'Insellarsi con spalle contratte o sella troppo bassa sovraccarica schiena e ginocchia.',
                    fix: 'Regola la sella in modo da avere il ginocchio solo leggermente flesso al punto morto inferiore.'
                }
            ];
        }

        if (pattern === PATTERN_UPPER_PUSH) {
            return [
                {
                    error: 'Perdita del setting scapolare (spalle anteriorizzate)',
                    why: 'Abdurre o anteporre le spalle sotto carico sposta lo stress meccanico sulla cuffia dei rotatori e sui tendini anteriori.',
                    fix: 'Mantieni le scapole retratte e depresse (spalle lontane dalle orecchie) durante l\'intero arco di movimento.'
                },
                {
                    error: 'Gomiti eccessivamente aperti a 90 gradi',
                    why: 'Allineare i gomiti perpendicolarmente al tronco genera impingement sub-acromiale e sovraccarico articolare.',
                    fix: 'Incurva leggermente i gomiti mantenendoli a un angolo di circa 45-60 gradi rispetto al busto.'
                }
            ];
        }

        if (pattern === PATTERN_UPPER_PULL) {
            return [
                {
                    error: 'Tirata d\'inerzia con compensi lombari',
                    why: 'Dondolare con il tronco sfrutta l\'inerzia, riducendo lo stimolo sui dorsali e caricando i dischi vertebrali.',
                    fix: 'Blocca la postura con il core attivo e concentrati sull\'avvicinare i gomiti indietro verso i fianchi.'
                },
                {
                    error: 'Spalle sollevate verso le orecchie in chiusura',
                    why: 'L\'attivazione dominante del trapezio superiore inibisce il gran dorsale e irrigidisce il rachide cervicale.',
                    fix: 'Deprimi attivamente le scapole prima di iniziare a piegare le braccia.'
                }
            ];
        }

        return [
            {
                error: 'Esecuzione accelerata e incontrollata',
                why: 'L\'inerzia riduce il lavoro muscolare utile e moltiplica il rischio di traumi articolari.',
                fix: 'Rallenta la fase di discesa a circa 2-3 secondi ed esegui ogni ripetizione con pieno controllo.'
            },
            {
                error: 'Perdita della postura e compensi articolari',
                why: 'I compensi alterano la distribuzione del carico sollecitando strutture non bersaglio.',
                fix: 'Riduci il carico o l\'escursione e mantieni l\'allineamento posturale neutro.'
            }
        ];
    }

    /**
     * Genera una tagline sintetica per l'header della scheda
     * @param {string} pattern - Pattern motorio
     * @param {string} primaryMuscle - Muscolo target
     * @param {boolean} isClinical - Flag esercizio adattato o clinico
     * @returns {string} Frase tagline descrittiva
     */
    function generateTagline(pattern, primaryMuscle, isClinical) {
        if (pattern === PATTERN_MOBILITY_WARMUP) {
            return 'Attivazione dinamica, mobilità articolare e riscaldamento preparatorio';
        }
        if (pattern === PATTERN_CARDIO_COOLDOWN) {
            return 'Rigenerazione metabolica, ritorno venoso e defaticamento aerobico';
        }
        if (isClinical) {
            return 'Controllo neuromuscolare, sicurezza articolare e tutela ortopedica';
        }
        switch (pattern) {
            case PATTERN_CORE_STABILITY:
                return 'Stabilità lombo-pelvica, anti-rotazione e controllo posturale del tronco';
            case PATTERN_PROPRIOCEPTION:
                return 'Sensibilità propriocettiva, equilibrio e reattività stabilizzatrice';
            default:
                return 'Controllo biomeccanico rigoroso e tensione muscolare mirata su ' + primaryMuscle;
        }
    }

    /**
     * Scansiona l'intero programma per estrarre l'oggetto esercizio, il giorno e la fase di appartenenza
     * @param {string} exId - ID esercizio
     * @param {string} exName - Nome esercizio
     * @param {Object} [program] - Programma completo
     * @param {number|string} [preferredPhaseId] - ID fase attiva preferita per disambiguazione multi-fase
     * @returns {Object|null} Oggetto con { exercise, day, phase } o null se non individuato
     */
    function findExerciseInProgram(exId, exName, program, preferredPhaseId) {
        if (!program || !Array.isArray(program.phases)) return null;

        const targetName = isSafeValue(exName) ? String(exName).trim().toLowerCase() : '';
        const cleanId = isSafeValue(exId) ? String(exId).trim() : '';

        // Ordina le fasi mettendo per prima quella attiva o preferita, se specificata e valida
        let phasesList = program.phases;
        if (preferredPhaseId !== undefined && preferredPhaseId !== null && !Number.isNaN(preferredPhaseId)) {
            const prefIdStr = String(preferredPhaseId);
            phasesList = [...program.phases].sort((a, b) => {
                const aMatch = (String(a.id) === prefIdStr) ? -1 : 0;
                const bMatch = (String(b.id) === prefIdStr) ? -1 : 0;
                return aMatch - bMatch;
            });
        }

        // 1. Controllo esatto (ID prioritario, poi nome esatto)
        for (const phase of phasesList) {
            if (!phase.schedule || !Array.isArray(phase.schedule)) continue;
            for (const day of phase.schedule) {
                const exercisesList = Array.isArray(day.exercises) ? day.exercises : (Array.isArray(day.workout) ? day.workout : []);
                for (const ex of exercisesList) {
                    if (cleanId && ex.id && String(ex.id) === cleanId) {
                        return { exercise: ex, day: day, phase: phase };
                    }
                    if (targetName && ex.name && ex.name.trim().toLowerCase() === targetName) {
                        return { exercise: ex, day: day, phase: phase };
                    }
                }
            }
        }

        // 2. Controllo secondario per sottostringa nel programma se non trovato esattamente
        if (targetName && targetName.length >= MIN_CLEAN_NAME_LEN) {
            for (const phase of phasesList) {
                if (!phase.schedule || !Array.isArray(phase.schedule)) continue;
                for (const day of phase.schedule) {
                    const exercisesList = Array.isArray(day.exercises) ? day.exercises : (Array.isArray(day.workout) ? day.workout : []);
                    for (const ex of exercisesList) {
                        const exLower = String(ex.name || '').toLowerCase();
                        if (exLower && (exLower.includes(targetName) || targetName.includes(exLower))) {
                            return { exercise: ex, day: day, phase: phase };
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
     * Rimuove stopword, connettori preposizionali e punteggiatura per il matching semantico
     * @param {string} str - Stringa originale
     * @returns {string} Stringa pulita senza stopword
     */
    function cleanStopwords(str) {
        if (!str) return '';
        const tokens = String(str).toLowerCase()
            .replace(/[^\w\s\u00e0\u00e8\u00e9\u00ec\u00f2\u00f9]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 0 && !ITALIAN_STOPWORDS.has(w));
        return tokens.join(' ');
    }

    /**
     * Estrae i token di parole significative (lunghezza minima >= MIN_CLEAN_NAME_LEN)
     * @param {string} str - Stringa da tokenizzare
     * @returns {Array<string>} Lista di token significativi
     */
    function extractSignificantWords(str) {
        if (!str) return [];
        return String(str).toLowerCase()
            .replace(/[^\w\s\u00e0\u00e8\u00e9\u00ec\u00f2\u00f9]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length >= MIN_CLEAN_NAME_LEN && !ITALIAN_STOPWORDS.has(w));
    }

    /**
     * Tenta la corrispondenza nel catalogo rimuovendo varianti tra parentesi o prefissi.
     * Adotta confronto su nome pulito, varianti ufficiali, rimozione stopword e sovrapposizione token.
     * @param {string} name - Nome esercizio con possibili annotazioni
     * @param {Array<Object>} catalog - Elenco esercizi a catalogo
     * @returns {Object|null} Esercizio genitore a catalogo o null
     */
    function findInCatalogNormalized(name, catalog) {
        if (!name || !Array.isArray(catalog) || catalog.length === 0) return null;

        // Pulizia espressioni tra parentesi tonde e quadre mantenendo il bilanciamento dei delimitatori
        const PAREN_REGEX = new RegExp('\\s*\\' + String.fromCharCode(40) + '[^' + String.fromCharCode(41) + ']*\\' + String.fromCharCode(41), 'g');
        const BRACKET_REGEX = new RegExp('\\s*\\' + String.fromCharCode(91) + '[^' + String.fromCharCode(93) + ']*\\' + String.fromCharCode(93), 'g');
        let cleanName = name.replace(PAREN_REGEX, '').replace(BRACKET_REGEX, '').trim();
        if (!cleanName || cleanName.length < MIN_CLEAN_NAME_LEN) return null;

        const cleanLower = cleanName.toLowerCase();
        const cleanNoStop = cleanStopwords(cleanName);
        const rawNoStop = cleanStopwords(name);

        // 1. Corrispondenza esatta dopo pulizia parentesi
        let directMatch = catalog.find(item => item && item.name && item.name.trim().toLowerCase() === cleanLower);
        if (directMatch) return directMatch;

        // 2. Corrispondenza diretta su array varianti ufficiali
        for (const item of catalog) {
            if (!item || !Array.isArray(item.variants)) continue;
            if (item.variants.some(v => v && v.trim().toLowerCase() === cleanLower)) return item;
        }

        // 3. Corrispondenza con rimozione di stopword/connettori (es. Panca Piana con Bilanciere -> Panca Piana Bilanciere)
        if (cleanNoStop.length >= MIN_CLEAN_NAME_LEN) {
            const stopMatch = catalog.find(item => item && item.name && cleanStopwords(item.name) === cleanNoStop);
            if (stopMatch) return stopMatch;

            for (const item of catalog) {
                if (!item || !Array.isArray(item.variants)) continue;
                if (item.variants.some(v => v && cleanStopwords(v) === cleanNoStop)) return item;
            }
        }

        // 4. Corrispondenza su nome completo (inclusa la variante tra parentesi) contro varianti a catalogo
        if (rawNoStop.length >= MIN_CLEAN_NAME_LEN && rawNoStop !== cleanNoStop) {
            const rawMatch = catalog.find(item => item && item.name && cleanStopwords(item.name) === rawNoStop);
            if (rawMatch) return rawMatch;

            for (const item of catalog) {
                if (!item || !Array.isArray(item.variants)) continue;
                if (item.variants.some(v => v && cleanStopwords(v) === rawNoStop)) return item;
            }
        }

        // 5. Corrispondenza con prefisso o inclusione reciproca
        const candidates = [];
        for (const item of catalog) {
            if (!item || !item.name) continue;
            const itemLower = item.name.trim().toLowerCase();
            const itemNoStop = cleanStopwords(item.name);

            if (itemLower === cleanLower) {
                return item;
            }
            if (cleanLower.startsWith(itemLower) || itemLower.startsWith(cleanLower)) {
                candidates.push({ item: item, score: SCORE_DIRECT_MATCH + (item.name ? item.name.length : 0) });
            } else if (cleanNoStop && itemNoStop && (cleanNoStop.startsWith(itemNoStop) || itemNoStop.startsWith(cleanNoStop))) {
                candidates.push({ item: item, score: SCORE_STOPWORD_MATCH + (item.name ? item.name.length : 0) });
            } else if (cleanLower.includes(itemLower) || itemLower.includes(cleanLower)) {
                candidates.push({ item: item, score: SCORE_SUBSTRING_MATCH + (item.name ? item.name.length : 0) });
            } else if (cleanNoStop && itemNoStop && (cleanNoStop.includes(itemNoStop) || itemNoStop.includes(cleanNoStop))) {
                candidates.push({ item: item, score: SCORE_SUBSTRING_STOPWORD_MATCH + (item.name ? item.name.length : 0) });
            }
        }

        // 6. Corrispondenza basata su sovrapposizione di parole chiave (token overlap)
        const rawWords = extractSignificantWords(name);
        const cleanWords = extractSignificantWords(cleanName);
        const wordSets = [rawWords, cleanWords];

        for (const qWords of wordSets) {
            if (qWords.length < MIN_TOKEN_COMMON_COUNT) continue;
            for (const item of catalog) {
                if (!item || !item.name) continue;
                const itemWords = extractSignificantWords(item.name);
                if (itemWords.length === 0) continue;

                let common = 0;
                for (const qw of qWords) {
                    if (itemWords.includes(qw)) common++;
                }

                if (common >= MIN_TOKEN_COMMON_COUNT && common >= Math.ceil(itemWords.length * MIN_TOKEN_MATCH_RATIO)) {
                    const ratio = common / itemWords.length;
                    const tokenScore = SCORE_TOKEN_MATCH_BASE + Math.round(ratio * SCORE_TOKEN_RATIO_WEIGHT) + common;
                    candidates.push({ item: item, score: tokenScore });
                }
            }
        }

        if (candidates.length > 0) {
            // Ordina per punteggio decrescente
            candidates.sort((a, b) => b.score - a.score);
            return candidates[0].item;
        }

        return null;
    }

    /**
     * Costruisce una scheda sintetica avanzata completa per esercizi non presenti a catalogo
     * @param {string} exId - ID dell'esercizio
     * @param {string} exName - Nome dell'esercizio
     * @param {Object} [progEx] - Oggetto esercizio dal programma
     * @param {Object} [progDay] - Giorno della seduta
     * @param {Object} [progPhase] - Fase del programma
     * @param {Object} [program] - Programma complessivo
     * @returns {Object} Oggetto esercizio compatibile al 100% con renderDetail
     */
    function buildSyntheticExercise(exId, exName, progEx, progDay, progPhase, program) {
        const finalName = (isSafeValue(exName) ? String(exName).trim() : '') ||
            (progEx && isSafeValue(progEx.name) ? String(progEx.name).trim() : '') ||
            'Esercizio Fisico';

        const finalId = (isSafeValue(exId))
            ? String(exId).trim()
            : ((progEx && isSafeValue(progEx.id)) ? String(progEx.id).trim() : ('syn_' + Math.random().toString(36).substring(2, 8)));

        const isClinical = (finalId && String(finalId).startsWith('cli_')) ||
            Boolean(progEx && (progEx.isadapted || progEx.isAdapted)) ||
            Boolean(program && program.meta && (program.meta.patientType === 'Clinico' || program.meta.patientType === 'Clinico_Anziano'));

        const note = (progEx && isSafeValue(progEx.note)) ? String(progEx.note).trim() : '';
        const dayFocus = (progDay && progDay.focus) ? progDay.focus : '';

        // Determinazione pattern e qualità biomeccaniche
        const pattern = detectPattern(
            finalName,
            progEx ? progEx.type : '',
            progEx ? Boolean(progEx.isWarmup) : false,
            progEx ? Boolean(progEx.isCardio) : false
        );

        let rawPrimary = (progEx && progEx.primaryMuscle && isSafeValue(progEx.primaryMuscle))
            ? (Array.isArray(progEx.primaryMuscle) ? progEx.primaryMuscle[0] : String(progEx.primaryMuscle))
            : null;
        const primaryMuscle = (rawPrimary && isSafeValue(rawPrimary))
            ? rawPrimary
            : inferPrimaryMuscle(finalName, pattern, dayFocus);

        const muscles = (progEx && Array.isArray(progEx.muscles) && progEx.muscles.length > 0)
            ? progEx.muscles.filter(m => isSafeValue(m))
            : inferMusclesList(primaryMuscle, pattern);
        const type = inferType(finalName, pattern, progEx);
        const equipment = inferEquipment(finalName, progEx && progEx.specs);
        const specs = normalizeSpecs(progEx ? progEx.specs : null, pattern, isClinical, equipment);

        let level = 'Principiante';
        if (isClinical) {
            level = 'Adattato Clinico';
        } else if (program && program.meta && program.meta.level) {
            level = program.meta.level;
        }

        // Descrizione narrativa priva di campi vuoti, undefined o N/A
        let description = '';
        const setsLabel = String(specs.sets).toLowerCase().includes('set') ? String(specs.sets) : (specs.sets + ' serie');

        if (note && note.length > 0) {
            description = note;
            if (specs && specs.sets && specs.reps) {
                description += ' Prescrizione: ' + setsLabel + ' x ' + specs.reps;
                if (specs.load && specs.load !== 'A corpo libero' && specs.load !== 'Corpo libero') {
                    description += ' con carico ' + specs.load;
                }
                if (specs.rest && specs.rest !== 'Attivo' && specs.rest !== 'Continuo') {
                    description += ', recupero: ' + specs.rest;
                }
                description += '.';
            }
        } else if (pattern === PATTERN_MOBILITY_WARMUP) {
            description = 'Esercizio di riscaldamento e mobilità articolare per ' + primaryMuscle + '. Eseguire ' + setsLabel + ' per ' + specs.reps + ' a ritmo ' + String(specs.tempo).toLowerCase() + ' con recupero ' + specs.rest + '.';
        } else if (pattern === PATTERN_CARDIO_COOLDOWN) {
            description = 'Attività di defaticamento e ricondizionamento cardiovascolare per ' + primaryMuscle + ' con ' + equipment + '. Prescrizione: ' + setsLabel + ' per ' + specs.reps + ', intensità ' + specs.load + ', recupero ' + specs.rest + '.';
        } else {
            description = 'Esercizio mirato al distretto ' + primaryMuscle + ' (' + type + ') con ' + equipment + '. Prescrizione: ' + setsLabel + ' per ' + specs.reps + ', carico: ' + specs.load + ', tempo: ' + specs.tempo + ', recupero: ' + specs.rest + '.';
        }

        const tagline = generateTagline(pattern, primaryMuscle, isClinical);
        const execution = generateExecution(finalName, pattern, primaryMuscle, equipment, specs, note);
        const errors = generateErrors(pattern, finalName);

        return {
            id: finalId,
            name: finalName,
            primaryMuscle: primaryMuscle,
            muscles: muscles,
            type: type,
            equipment: equipment,
            level: level,
            tagline: tagline,
            description: description,
            execution: execution,
            errors: errors,
            specs: specs,
            note: note
        };
    }

    /**
     * Arricchisce un esercizio di catalogo con le specifiche di carico, note,
     * tagline descrittiva e dettagli esecutivi dal programma corrente.
     * @param {Object} catalogItem - Esercizio estratto dal catalogo
     * @param {Object} [progEx] - Esercizio dal programma generato
     * @param {string} [customName] - Nome variante personalizzato (es. per match normalizzato)
     * @param {string} [customId] - ID personalizzato (se fornito)
     * @returns {Object} Esercizio completo, privo di undefined o campi vuoti
     */
    function enrichCatalogMatch(catalogItem, progEx, customName, customId) {
        const enriched = JSON.parse(JSON.stringify(catalogItem));
        if (isSafeValue(customName)) enriched.name = String(customName).trim();
        if (isSafeValue(customId)) enriched.id = String(customId).trim();

        const pattern = detectPattern(enriched.name, enriched.type);
        const isAdapted = Boolean(progEx && (progEx.isadapted || progEx.isAdapted));
        const equipment = enriched.equipment || inferEquipment(enriched.name, progEx ? progEx.specs : null);
        enriched.equipment = equipment;

        // Normalizzazione rigorosa delle specifiche di carico
        enriched.specs = normalizeSpecs(progEx ? progEx.specs : null, pattern, isAdapted, equipment);

        if (isAdapted) {
            enriched.level = 'Adattato Clinico';
        }

        // Tagline sempre valorizzata (il catalogo ufficiale ne è privo)
        if (!enriched.tagline || enriched.tagline.trim() === '') {
            enriched.tagline = generateTagline(pattern, enriched.primaryMuscle || 'Target Muscolare', isAdapted);
        }

        // Garanzia difensiva sull'integrità dei blocchi di execution prima di arricchire
        if (!enriched.execution) {
            enriched.execution = generateExecution(enriched.name, pattern, enriched.primaryMuscle, equipment, enriched.specs, enriched.note);
        } else {
            if (!Array.isArray(enriched.execution.setup) || enriched.execution.setup.length === 0) {
                enriched.execution.setup = [
                    'Posizionati in modo stabile verificando l\'assetto di partenza e l\'aderenza al suolo.',
                    'Allinea il rachide mantenendo le fisiologiche curve lombari e cervicali.',
                    'Attiva preventivamente la muscolatura stabilizzatrice del tronco e del core.'
                ];
            }
            if (!Array.isArray(enriched.execution.steps) || enriched.execution.steps.length === 0) {
                enriched.execution.steps = [
                    'Avvia la fase concentrica esprimendo forza in modo controllato.',
                    'Mantieni la posizione di massima contrazione per un breve istante.',
                    'Ritorna alla posizione di partenza controllando lentamente la fase eccentrica.'
                ];
            }
            if (!Array.isArray(enriched.execution.cues) || enriched.execution.cues.length === 0) {
                enriched.execution.cues = [
                    'Respira con regolarità espirando nella fase di sforzo.',
                    'Mantieni costante la tensione muscolare ed il controllo articolare.'
                ];
            }
            if (!Array.isArray(enriched.execution.criteria) || enriched.execution.criteria.length === 0) {
                enriched.execution.criteria = [
                    'Range di movimento (ROM) completo e fluido.',
                    'Assenza di compensi posturali scorretti.'
                ];
            }
        }

        // Garanzia difensiva su muscles
        if (!Array.isArray(enriched.muscles) || enriched.muscles.length === 0) {
            enriched.muscles = inferMusclesList(enriched.primaryMuscle || inferPrimaryMuscle(enriched.name, pattern), pattern);
        }

        // Se presente una nota di programma o adattamento clinico, integrala in note, description, execution.context e cues
        if (progEx && isSafeValue(progEx.note)) {
            const noteStr = String(progEx.note).trim();
            if (noteStr) {
                enriched.note = noteStr;
                enriched.description = (enriched.description ? enriched.description + ' ' : '') + 'Nota programma: ' + noteStr;
                if (enriched.execution) {
                    enriched.execution.context = (enriched.execution.context ? enriched.execution.context + ' ' : '') + 'Indicazione specifica: ' + noteStr;
                    if (Array.isArray(enriched.execution.cues) && !enriched.execution.cues.some(c => c.includes(noteStr))) {
                        enriched.execution.cues.unshift('Focus programma: ' + noteStr);
                    }
                }
            }
        }

        // Se l'esercizio ha specifiche di carico dal programma, arricchisci anche il context esecutivo per renderDetail
        if (progEx && progEx.specs && enriched.execution && enriched.execution.context) {
            const setsLabel = String(enriched.specs.sets).toLowerCase().includes('set') ? String(enriched.specs.sets) : (enriched.specs.sets + ' serie');
            let paramStr = 'Parametri di lavoro: ' + setsLabel + ' x ' + enriched.specs.reps;
            if (enriched.specs.load && enriched.specs.load !== 'A corpo libero' && enriched.specs.load !== 'Corpo libero') {
                paramStr += ' con carico ' + enriched.specs.load;
            }
            if (enriched.specs.rest && enriched.specs.rest !== 'Attivo' && enriched.specs.rest !== 'Continuo') {
                paramStr += ', recupero ' + enriched.specs.rest;
            }
            if (enriched.specs.tempo) {
                paramStr += ' (tempo ' + enriched.specs.tempo + ')';
            }
            paramStr += '.';
            if (!enriched.execution.context.includes(paramStr)) {
                enriched.execution.context += ' ' + paramStr;
            }
        }

        // Garanzia difensiva su errors
        if (!Array.isArray(enriched.errors) || enriched.errors.length === 0) {
            enriched.errors = generateErrors(pattern, enriched.name);
        }

        return enriched;
    }

    /**
     * Risolve in modo esaustivo la scheda di dettaglio per qualsiasi esercizio
     * Adotta 4 livelli di risoluzione progressiva:
     * 1. Match per ID a catalogo
     * 2. Match per Nome Esatto a catalogo
     * 3. Match Normalizzato (varianti/parentesi) a catalogo
     * 4. Generatore Sintetico Avanzato per clinici, warmup e cardio
     *
     * @param {string} exId - ID dell'esercizio
     * @param {string} exName - Nome dell'esercizio
     * @param {Object} [context] - Contesto opzionale { result, container, program, exercise, day, phase, phaseId }
     * @returns {Object} Oggetto esercizio arricchito e privo di N/A o undefined
     */
    window.App.resolveExerciseDetail = function (exId, exName, context) {
        // Recupero istanza del programma attuale dal contesto o dallo stato applicativo
        const program = (context && (context.result || context.program)) ||
            (window.App && window.App.currentProgram) ||
            (window.App && window.App.state && window.App.state.currentProgram) ||
            null;

        const preferredPhaseId = context && (context.phaseId !== undefined ? context.phaseId : context.activePhaseId);

        // Ricerca dell'esercizio all'interno delle fasi del programma
        let progEx = null;
        let progDay = null;
        let progPhase = null;

        if (context && context.exercise) {
            progEx = context.exercise;
            progDay = context.day || null;
            progPhase = context.phase || null;
        } else if (program) {
            const foundInProg = findExerciseInProgram(exId, exName, program, preferredPhaseId);
            if (foundInProg) {
                progEx = foundInProg.exercise;
                progDay = foundInProg.day;
                progPhase = foundInProg.phase;
            }
        }

        // Accesso al catalogo ufficiale con filtro difensivo contro elementi sparsi o undefined
        const rawCatalog = typeof window.App.getExercises === 'function'
            ? window.App.getExercises()
            : (window.App.exercises || []);
        const catalog = Array.isArray(rawCatalog)
            ? rawCatalog.filter(item => item && typeof item === 'object')
            : [];

        const effectiveId = isSafeValue(exId) ? String(exId).trim() : (progEx && isSafeValue(progEx.id) ? String(progEx.id).trim() : '');
        const effectiveName = isSafeValue(exName) ? String(exName).trim() : (progEx && isSafeValue(progEx.name) ? String(progEx.name).trim() : '');

        // ── LIVELLO 1: Ricerca per ID a catalogo ──
        if (effectiveId && catalog.length > 0) {
            const matchById = catalog.find(item => item && item.id && item.id === effectiveId);
            if (matchById) {
                return enrichCatalogMatch(matchById, progEx, null, effectiveId);
            }
        }

        // ── LIVELLO 2: Ricerca per Nome Esatto a catalogo ──
        if (effectiveName && catalog.length > 0) {
            const cleanTarget = effectiveName.trim().toLowerCase();
            const matchByName = catalog.find(item => item && item.name && item.name.trim().toLowerCase() === cleanTarget);
            if (matchByName) {
                return enrichCatalogMatch(matchByName, progEx, matchByName.name, effectiveId || matchByName.id);
            }
        }

        // ── LIVELLO 3: Ricerca Normalizzata / Esercizio Genitore a catalogo ──
        // Riservata a varianti atletiche, lasciando i codici clinici cli_ e warmup/cardio al generatore sintetico dedicato
        const isClinicalId = effectiveId && String(effectiveId).startsWith('cli_');
        const isSpecialProgEx = progEx && (progEx.isWarmup || progEx.isCardio);

        if (!isClinicalId && !isSpecialProgEx && effectiveName && catalog.length > 0) {
            const matchNormalized = findInCatalogNormalized(effectiveName, catalog);
            if (matchNormalized) {
                return enrichCatalogMatch(matchNormalized, progEx, effectiveName, effectiveId || matchNormalized.id);
            }
        }

        // ── LIVELLO 4: Fallback Sintetico Avanzato e Strutturato ──
        return buildSyntheticExercise(effectiveId || exId, effectiveName || exName, progEx, progDay, progPhase, program);
    };

    // Esportazione per ambienti CommonJS / Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            resolveExerciseDetail: window.App.resolveExerciseDetail,
            detectPattern: detectPattern,
            inferEquipment: inferEquipment,
            inferPrimaryMuscle: inferPrimaryMuscle,
            buildSyntheticExercise: buildSyntheticExercise
        };
    }
})();
