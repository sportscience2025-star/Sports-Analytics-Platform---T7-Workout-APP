/**
 * Muscle Taxonomy Module
 * Catalogo dei distretti muscolari, etichette e muscoli specifici
 * Raggruppamento macro a 7 distretti anatomici semplificati per filtri utente
 */
(function () {
    'use strict';

    window.App = window.App || {};

    // Tassonomia muscolare macro articolata su 7 gruppi per interfaccia utente
    window.App.MUSCLE_TAXONOMY = {
        'Chest': {
            label: 'Petto',
            muscles: [
                'Pettorale (Capo Sternocostale)',
                'Pettorale (Capo Clavicolare)',
                'Pettorali'
            ]
        },
        'Back': {
            label: 'Schiena',
            muscles: [
                'Gran Dorsale',
                'Trapezio Superiore',
                'Trapezio (Medio/Inferiore)',
                'Trapezio',
                'Romboidi',
                'Erettori Spinali'
            ]
        },
        'Legs': {
            label: 'Gambe',
            muscles: [
                'Quadricipiti',
                'Retto Femorale',
                'Femorali (Bicipite Femorale)',
                'Gastrocnemio',
                'Soleo',
                'Polpacci',
                'Adduttori',
                'Tibiale Anteriore'
            ]
        },
        'Glutes': {
            label: 'Glutei',
            muscles: [
                'Grande Gluteo',
                'Medio Gluteo'
            ]
        },
        'Shoulders': {
            label: 'Spalle',
            muscles: [
                'Deltoide Anteriore',
                'Deltoide Laterale',
                'Deltoide Posteriore',
                'Cuffia dei Rotatori'
            ]
        },
        'Arms': {
            label: 'Braccia',
            muscles: [
                'Bicipite Brachiale',
                'Bicipite',
                'Tricipite Brachiale',
                'Tricipite',
                'Avambracci'
            ]
        },
        'Core': {
            label: 'Core / Addome',
            muscles: [
                "Retto dell'Addome",
                'Obliqui',
                "Traverso dell'Addome",
                'Core (Stabilizzatori)'
            ]
        }
    };

})();

