/**
 * Exercise Filtering & Favorites Module
 * Motore di ricerca multi-parametro (search, muscolo, livello, attrezzatura, qualità)
 * e gestione preferiti con persistenza localStorage
 */
(function () {
    'use strict';

    window.App = window.App || {};

    /**
     * Dizionario di radici, sinonimi e termini anatomici per il matching flessibile dei distretti muscolari
     * Risolve le discrepanze tra singolare/plurale e denominazioni scientifiche (es. Pettorali vs Pettorale)
     */
    const MUSCLE_STEMS = {
        'pettorali': ['pettor', 'petto'],
        'petto': ['pettor', 'petto'],
        'chest': ['pettor', 'petto'],
        'pettorale (capo clavicolare)': ['clavicolar', 'petto alto', 'pettorale alto'],
        'pettorale (capo sternocostale)': ['sternocostal', 'pettorale', 'petto'],
        'gran dorsale': ['gran dorsale', 'dorsal'],
        'trapezio': ['trapezio'],
        'trapezio superiore': ['trapezio superiore'],
        'trapezio (medio/inferiore)': ['trapezio medio', 'trapezio (medio/inferiore)', 'trapezio inferiore', 'trapezio 3'],
        'trapezio medio': ['trapezio medio', 'trapezio (medio/inferiore)', 'trapezio inferiore'],
        'romboidi': ['romboid'],
        'erettori spinali': ['erettor'],
        'schiena': ['schiena', 'dorsal', 'trapezio', 'romboid', 'erettor'],
        'back': ['schiena', 'dorsal', 'trapezio', 'romboid', 'erettor'],
        'quadricipiti': ['quadricipit', 'retto femorale', 'vasto laterale', 'vasto mediale'],
        'retto femorale': ['retto femorale'],
        'femorali (bicipite femorale)': ['bicipite femorale', 'femorali', 'ischiocrural'],
        'femorali': ['bicipite femorale', 'femorali', 'ischiocrural'],
        'gastrocnemio': ['gastrocnem', 'gemelli'],
        'soleo': ['soleo'],
        'polpacci': ['polpacc', 'gastrocnem', 'soleo'],
        'adduttori': ['adduttor', 'gracile', 'pettineo'],
        'tibiale anteriore': ['tibiale anteriore', 'tibial'],
        'tibiale': ['tibial'],
        'gambe': ['gambe', 'quadricipit', 'femorali', 'polpacc', 'retto femorale', 'vasto', 'gastrocnem', 'soleo', 'adduttori', 'tibiale'],
        'legs': ['gambe', 'quadricipit', 'femorali', 'polpacc', 'adduttor'],
        'grande gluteo': ['grande gluteo', 'glutei'],
        'medio gluteo': ['medio gluteo', 'glutei'],
        'glutei': ['glute'],
        'glutes': ['glute'],
        'deltoide anteriore': ['deltoide anteriore'],
        'deltoide laterale': ['deltoide laterale'],
        'deltoide posteriore': ['deltoide posteriore'],
        'cuffia dei rotatori': ['rotator', 'infraspinato', 'sovraspinato', 'sottoscapolare', 'piccolo rotondo'],
        'rotatori': ['rotator', 'infraspinato', 'sovraspinato', 'sottoscapolare'],
        'spalle': ['deltoide', 'spall', 'rotatori'],
        'shoulders': ['deltoide', 'spall', 'rotatori'],
        'bicipite brachiale': ['bicipit', 'brachiale'],
        'bicipite': ['bicipit'],
        'bicipiti': ['bicipit'],
        'tricipite brachiale': ['tricipit'],
        'tricipite': ['tricipit'],
        'tricipiti': ['tricipit'],
        'avambracci': ['avambracc', 'brachioradiale'],
        'braccia': ['bicipit', 'tricipit', 'avambracc', 'braccia'],
        'arms': ['bicipit', 'tricipit', 'avambracc', 'braccia'],
        'retto dell\'addome': ['retto dell\'addome', 'retto addominale'],
        'obliqui': ['obliqu'],
        'traverso dell\'addome': ['traverso'],
        'core (stabilizzatori)': ['core', 'traverso dell\'addome', 'stabilizzatori'],
        'core / addome': ['core', 'addom', 'obliqu', 'traverso'],
        'core': ['core', 'addom', 'obliqu', 'stabilizzatori']
    };

    /**
     * Valuta se un esercizio corrisponde al distretto muscolare target specificato
     * @param {Object} ex - Oggetto esercizio da valutare
     * @param {string} targetMuscle - Denominazione o tag muscolare selezionato
     * @returns {boolean} True se l'esercizio coinvolge il muscolo target
     */
    window.App.matchExerciseMuscle = function (ex, targetMuscle) {
        if (!ex || !targetMuscle || targetMuscle === 'all') return true;
        const target = targetMuscle.toLowerCase().trim();
        const prim = (ex.primaryMuscle || '').toLowerCase();
        const muscles = Array.isArray(ex.muscles) ? ex.muscles.map(m => (m || '').toLowerCase()) : [];
        const allMuscles = [prim, ...muscles];

        // 1. Corrispondenza diretta esatta o per inclusione di sottostringa
        if (allMuscles.some(m => m === target || m.includes(target) || target.includes(m))) {
            return true;
        }

        // 2. Corrispondenza semantica tramite radici anatomiche
        const stems = MUSCLE_STEMS[target];
        if (stems && stems.length > 0) {
            const combinedText = allMuscles.join(' ');
            if (stems.some(s => combinedText.includes(s))) {
                return true;
            }
        }

        // 3. Fallback tassonomia macro-gruppi
        const tax = window.App.MUSCLE_TAXONOMY || {};
        if (tax[targetMuscle]) {
            const subMuscles = tax[targetMuscle].muscles || [];
            return subMuscles.some(sub => window.App.matchExerciseMuscle(ex, sub));
        }

        return false;
    };

    /**
     * Restituisce l'elenco degli esercizi filtrati in base ai criteri specificati
     * @param {Object} [filters] - Criteri di filtro (search, muscle, level, equipment, quality)
     * @returns {Array<Object>} Array di esercizi corrispondenti ai filtri attivi
     */
    window.App.getExercises = function (filters) {
        if (!window.App._dataInitialized) window.App.initData();

        let results = window.App.exercises || [];

        if (filters) {
            // 1. Filtro testuale di ricerca (Nome, Descrizione o Muscolo target)
            if (filters.search) {
                const term = filters.search.toLowerCase().trim();
                results = results.filter(ex => {
                    if (!ex) return false;
                    const name = (ex.name || '').toLowerCase();
                    const desc = (ex.description || '').toLowerCase();
                    if (name.includes(term) || desc.includes(term)) return true;
                    if (window.App.matchExerciseMuscle(ex, term)) return true;
                    return false;
                });
            }

            // 2. Filtro per Distretto Muscolare tramite matcher anatomico
            if (filters.muscle && filters.muscle !== 'all') {
                results = results.filter(ex => window.App.matchExerciseMuscle(ex, filters.muscle));
            }

            // 3. Filtro per Livello di Esperienza
            if (filters.level && filters.level !== 'all') {
                results = results.filter(ex => ex && ex.level === filters.level);
            }

            // 4. Filtro per Attrezzatura (con gestione intelligente per Panca)
            if (filters.equipment && filters.equipment !== 'all') {
                if (filters.equipment.toLowerCase() === 'panca') {
                    results = results.filter(ex => {
                        if (!ex) return false;
                        const txt = ((ex.name || '') + ' ' + (ex.description || '') + ' ' + (ex.equipment || '')).toLowerCase();
                        return txt.includes('panca') || (ex.execution && JSON.stringify(ex.execution).toLowerCase().includes('panca'));
                    });
                } else {
                    results = results.filter(ex => ex && ex.equipment === filters.equipment);
                }
            }

            // 5. Filtro per Qualità Atletica (Forza, Ipertrofia, Potenza, Stabilità)
            if (filters.quality && filters.quality !== 'all') {
                const targetQuality = filters.quality.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                results = results.filter(ex => {
                    if (!ex || !ex.quality) return false;
                    const exQuality = ex.quality.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    return exQuality.includes(targetQuality);
                });
            }

            // 6. Ordinamento degli esercizi
            if (filters.sortBy && filters.sortBy !== 'default') {
                const sortKey = filters.sortBy;
                const LEVEL_ORDER = { 'Principiante': 1, 'Intermedio': 2, 'Avanzato': 3 };
                const TYPE_ORDER = { 'Multiarticolare': 1, 'Isolamento': 2, 'Isometrico': 3 };

                results = [...results].sort((a, b) => {
                    if (!a && !b) return 0;
                    if (!a) return 1;
                    if (!b) return -1;

                    switch (sortKey) {
                        case 'name_asc':
                            return (a.name || '').localeCompare(b.name || '', 'it', { sensitivity: 'base' });
                        case 'name_desc':
                            return (b.name || '').localeCompare(a.name || '', 'it', { sensitivity: 'base' });
                        case 'muscle_asc':
                            return (a.primaryMuscle || '').localeCompare(b.primaryMuscle || '', 'it', { sensitivity: 'base' });
                        case 'level_asc':
                            return (LEVEL_ORDER[a.level] || 99) - (LEVEL_ORDER[b.level] || 99);
                        case 'type_asc':
                            return (TYPE_ORDER[a.type] || 99) - (TYPE_ORDER[b.type] || 99);
                        default:
                            return 0;
                    }
                });
            }
        }

        return results;
    };

    // Inizializzazione sicura dei preferiti con persistenza localStorage
    try {
        const stored = (typeof localStorage !== 'undefined') ? localStorage.getItem('t7_favorites') : null;
        window.App.favorites = stored ? JSON.parse(stored) : [];
    } catch (_) {
        window.App.favorites = [];
    }

    /**
     * Aggiunge o rimuove un esercizio dai preferiti
     * @param {string} id - ID univoco dell'esercizio
     * @returns {boolean} True se l'esercizio è ora nei preferiti, false altrimenti
     */
    window.App.toggleFavorite = function (id) {
        if (!Array.isArray(window.App.favorites)) window.App.favorites = [];
        const index = window.App.favorites.indexOf(id);
        if (index === -1) {
            window.App.favorites.push(id);
        } else {
            window.App.favorites.splice(index, 1);
        }
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('t7_favorites', JSON.stringify(window.App.favorites));
            }
        } catch (_) {}
        return index === -1;
    };

    /**
     * Verifica se un esercizio è salvato nei preferiti
     * @param {string} id - ID univoco dell'esercizio
     * @returns {boolean} True se l'esercizio è presente nei preferiti
     */
    window.App.isFavorite = function (id) {
        if (!Array.isArray(window.App.favorites)) return false;
        return window.App.favorites.includes(id);
    };

    /**
     * Restituisce tutti gli esercizi presenti nei preferiti
     * @returns {Array<Object>} Array di esercizi salvati dall'utente
     */
    window.App.getFavoriteExercises = function () {
        if (!window.App._dataInitialized) window.App.initData();
        const favIds = Array.isArray(window.App.favorites) ? window.App.favorites : [];
        return (window.App.exercises || []).filter(ex => ex && favIds.includes(ex.id));
    };

})();
