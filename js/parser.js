/**
 * js/parser.js - Intelligent Multi-Athlete VBT & Sports Science Data Parser (Root Orchestrator)
 * Carica e integra in sequenza i 6 moduli specialistici da js/parser/:
 * - exercise-dict.js, athlete-resolver.js, load-aggregator.js,
 * - header-mapper.js, instrument-detector.js, file-readers.js.
 * Mantiene la piena compatibilità con browser e ambienti di test Node.js.
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    // Supporto per esecuzione in ambienti Node.js / test runner (eval via loadModule)
    if (typeof require !== 'undefined') {
        const fs = require('fs');
        const path = require('path');
        const baseDir = typeof __dirname !== 'undefined' ? __dirname : '.';
        const candidates = [
            path.join(baseDir, 'parser'), path.join(baseDir, 'js', 'parser'),
            path.join(baseDir, '..', 'js', 'parser'), 'js/parser', 'parser'
        ];
        let parserDir = null;
        for (const c of candidates) {
            try {
                if (fs.existsSync(path.join(c, 'exercise-dict.js'))) {
                    parserDir = c;
                    break;
                }
            } catch (e) {}
        }
        if (parserDir) {
            const files = [
                'exercise-dict.js', 'athlete-resolver.js', 'load-aggregator.js',
                'header-mapper.js', 'instrument-detector.js', 'file-readers.js'
            ];
            for (const f of files) {
                const p = path.join(parserDir, f);
                try {
                    if (fs.existsSync(p)) {
                        eval(fs.readFileSync(p, 'utf8'));
                    }
                } catch (e) {
                    console.error('[Parser Loader] Errore caricamento', p, e);
                }
            }
        }
    }

    /**
     * Classe principale DataParser.
     * Funge da facciata pubblica statica unificata per tutti i moduli specializzati.
     */
    class DataParser {
        // Parsing file Excel / CSV multipiattaforma a 3 livelli
        static async parseExcel(file) {
            return (root._parserFileReaders || window._parserFileReaders).parseExcel(file);
        }

        // Parsing file PDF con estrazione testo e metriche biomeccaniche
        static async parsePDF(file) {
            return (root._parserFileReaders || window._parserFileReaders).parsePDF(file);
        }

        // Parsing immagini tramite OCR Tesseract.js
        static async parseImageOCR(file, progressCallback) {
            return (root._parserFileReaders || window._parserFileReaders).parseImageOCR(file, progressCallback);
        }

        // Parsing euristico testo grezzo (da OCR o PDF)
        static _parseTextData(text) {
            const fr = root._parserFileReaders || window._parserFileReaders;
            return (fr._parseTextData || fr.parseTextData)(text);
        }
        static parseTextData(text) { return DataParser._parseTextData(text); }

        // Estrazione coppie carico-velocità da testo grezzo
        static _extractPairsFromText(text) {
            const fr = root._parserFileReaders || window._parserFileReaders;
            return (fr._extractPairsFromText || fr.extractPairsFromText)(text);
        }
        static extractPairsFromText(text) { return DataParser._extractPairsFromText(text); }

        // Parsing righe CSV/TSV con rilevamento automatico delimitatore
        static _readCSVRows(text) {
            return (root._parserHeaderMapper || window._parserHeaderMapper).readCSVRows(text);
        }
        static readCSVRows(text) { return DataParser._readCSVRows(text); }

        // Mappatura intestazioni verso chiavi interne standardizzate
        static _mapHeaders(headers) {
            return (root._parserHeaderMapper || window._parserHeaderMapper).mapHeaders(headers);
        }
        static mapHeaders(headers) { return DataParser._mapHeaders(headers); }

        // Classificazione automatica dello strumento di misura
        static detectInstrumentType(records, headers, extraContext) {
            return (root._parserInstrumentDetector || window._parserInstrumentDetector).detectInstrumentType(records, headers, extraContext);
        }

        // Verifica se una stringa è un ID codificato da dispositivo
        static isEncodedId(name) {
            return (root._parserAthleteResolver || window._parserAthleteResolver).isEncodedId(name);
        }

        // Estrae nome atleta leggibile da ID codificato
        static extractReadableName(name) {
            return (root._parserAthleteResolver || window._parserAthleteResolver).extractReadableName(name);
        }

        // Verifica se il nome è un segnaposto generico
        static isGenericAthlete(name) {
            return (root._parserAthleteResolver || window._parserAthleteResolver).isGenericAthlete(name);
        }

        // Estrae nome atleta dal nome del file caricato
        static extractAthleteFromFilename(filename) {
            return (root._parserAthleteResolver || window._parserAthleteResolver).extractAthleteFromFilename(filename);
        }

        // Verifica se un token rappresenta un componente hardware
        static isDeviceToken(part) {
            return (root._parserAthleteResolver || window._parserAthleteResolver).isDeviceToken(part);
        }

        // Aggrega ripetizioni multiple dello stesso carico (VBT)
        static aggregateByLoad(records) {
            return (root._parserAggregateByLoad || window._parserAggregateByLoad)(records);
        }

        // Normalizza il nome dell'esercizio tramite dizionario multilingue
        static normalizeExercise(raw) {
            return (root._parserNormalizeExercise || window._parserNormalizeExercise)(raw);
        }
    }

    /**
     * Esportazione globale multi-ambiente di DataParser:
     * Assegna l'orchestratore DataParser sui vari oggetti di ambito globale disponibili:
     * - root.DataParser: contesto primario risolto (window in browser, global in Node.js, globalThis come fallback)
     * - window.DataParser: contesto standard DOM del browser
     * - globalThis.DataParser: standard ECMAScript per ambienti moderni
     * - self.DataParser: contesti isolati Web Worker, Service Worker e finestre
     */
    root.DataParser = DataParser;
    if (typeof window !== 'undefined') {
        window.DataParser = DataParser;
    }
    if (typeof globalThis !== 'undefined') {
        globalThis.DataParser = DataParser;
    }
    if (typeof self !== 'undefined') {
        self.DataParser = DataParser;
    }
})();
