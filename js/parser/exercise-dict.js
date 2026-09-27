/**
 * js/parser/exercise-dict.js
 * Multi-language exercise dictionary and normalization utilities.
 * Mappa varianti di nomi in IT/ES/EN verso la nomenclatura canonica italiana.
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    /**
     * Dizionario canonico degli esercizi con chiavi di ricerca multilingue.
     * Ordine gerarchico: varianti specifiche prima delle forme generiche per prevenire falsi positivi.
     */
    const EXERCISE_DICT = [
        // Squat specifici per evitare match generico anticipato
        { keys: ['front squat', 'squat frontale', 'sentadilla frontal', 'frontsquat'], label: 'Front Squat' },
        { keys: ['mezzo squat', 'mezzosquat', 'half squat', 'half-squat', 'media sentadilla', 'mediasentadilla', 'half back squat'], label: 'Mezzo Squat' },
        { keys: ['squat', 'sentadilla', 'sentadillaparalela', 'sentadilla paralela', 'squat parallelo', 'squatparallelo', 'squat parallela', 'parallel squat', 'squato', 'back squat', 'full squat', 'squatparalelo', 'squat completo', 'backsquat'], label: 'Squat' },
        // Stacco specifico prima di stacco generico
        { keys: ['romanian deadlift', 'rdl', 'stacco rumeno', 'peso muerto rumano', 'stacco a gambe tese', 'straight leg deadlift'], label: 'RDL' },
        { keys: ['stacco', 'deadlift', 'peso muerto', 'pesomuerto', 'esomuerto', 'deadl', 'conventional deadlift', 'stacco da terra', 'staccoterra', 'stacco convenzionale', 'dead lift', 'deadlifts', 'stacco completo'], label: 'Stacco' },
        // Panca specifica prima di panca generica
        { keys: ['panca inclinata', 'incline bench', 'incline bench press', 'press banca inclinada', 'incline press'], label: 'Panca Inclinata' },
        { keys: ['panca declinata', 'decline bench', 'decline bench press', 'press banca declinada'], label: 'Panca Declinata' },
        { keys: ['panca', 'bench press', 'bench', 'press banca', 'pressbanca', 'chest press', 'panca piana', 'distensioni panca', 'flat bench', 'benchpress'], label: 'Panca Piana' },
        { keys: ['push press', 'pushpress', 'slancio con spinta'], label: 'Push Press' },
        { keys: ['shoulder press', 'press spalle', 'overhead press', 'ohp', 'military press', 'lento avanti', 'press militar', 'military'], label: 'Press Spalle' },
        { keys: ['dip', 'dips', 'parallele', 'fondi alle parallele', 'chest dip'], label: 'Dip' },
        { keys: ['trap bar deadlift', 'hex bar deadlift', 'stacco quadra bar', 'stacco trap bar', 'trap bar'], label: 'Trap Bar Deadlift' },
        { keys: ['affondi', 'lunges', 'lunge', 'zancadas', 'affondo'], label: 'Affondi' },
        { keys: ['leg press', 'pressa', 'press gambe', 'prensa', 'prensa de piernas'], label: 'Leg Press' },
        { keys: ['leg extension', 'estensione ginocchio', 'extension de pierna'], label: 'Leg Extension' },
        { keys: ['leg curl', 'flessione ginocchio', 'curl femoral'], label: 'Leg Curl' },
        { keys: ['hip thrust', 'hip extension', 'estensione anca', 'empuje de cadera', 'hipthrust'], label: 'Hip Thrust' },
        { keys: ['rematore', 'barbell row', 'bent over row', 'remo con barra', 'remo', 'seal row'], label: 'Rematore' },
        { keys: ['trazioni', 'pull up', 'pull-up', 'chin up', 'chin-up', 'dominadas', 'lat machine', 'lat pulldown'], label: 'Trazioni' },
        { keys: ['good morning', 'good mornings', 'buenos dias'], label: 'Good Morning' },
        { keys: ['strappo', 'snatch', 'arrancada', 'power snatch'], label: 'Strappo' },
        { keys: ['girata', 'clean', 'power clean', 'caricamento'], label: 'Girata' },
        { keys: ['cmj', 'countermovement jump', 'contromovimento', 'salto con contromovimento', 'salto contromovimento'], label: 'CMJ' },
        { keys: ['sj', 'squat jump', 'salto squat'], label: 'SJ' },
        { keys: ['dj', 'drop jump', 'salto caduta', 'depth jump'], label: 'DJ' }
    ];

    /**
     * Normalizza il nome di un esercizio usando il dizionario multilingue.
     * Restituisce l'etichetta canonica italiana o il testo originale formattato in Title Case.
     * @param {string} raw - Nome grezzo dell'esercizio.
     * @returns {string} Nome canonico normalizzato o fallback Title Case.
     */
    function normalizeExercise(raw) {
        if (!raw || typeof raw !== 'string') return 'Sconosciuto';
        const trimmed = raw.trim();
        if (!trimmed) return 'Sconosciuto';
        const lower = trimmed.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
        if (!lower) return 'Sconosciuto';

        // Pass 1: Corrispondenza esatta
        for (const entry of EXERCISE_DICT) {
            if (entry.keys.includes(lower)) {
                return entry.label;
            }
        }

        // Pass 2: Corrispondenza per sottostringa
        for (const entry of EXERCISE_DICT) {
            for (const key of entry.keys) {
                if (lower.includes(key)) {
                    return entry.label;
                }
            }
        }

        // Fallback: Title Case del testo ripulito
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    }

    // Esposizione per ambiente browser e test runner Node.js
    root._parserExerciseDict = EXERCISE_DICT;
    root._parserNormalizeExercise = normalizeExercise;
    if (typeof window !== 'undefined') {
        window._parserExerciseDict = EXERCISE_DICT;
        window._parserNormalizeExercise = normalizeExercise;
    }
})();
