/**
 * Data Initialization Lifecycle Module
 * Inizializzazione dati e applicazione della funzione enrichExercise su tutti gli esercizi
 */
(function () {
    'use strict';

    window.App = window.App || {};

    // INIT
    window.App.initData = function () {
        if (!window.App.exercises) return;
        if (window.App._dataInitialized) return;
        
        const enrichFn = window.App._enrichExercise || (typeof enrichExercise === 'function' ? enrichExercise : function(ex) { return ex; });
        window.App.exercises = window.App.exercises.map(enrichFn);
        window.App._dataInitialized = true;
    };

    // Auto-init immediately
    window.App.initData();

})();
