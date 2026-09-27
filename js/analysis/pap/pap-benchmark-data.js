/**
 * js/analysis/pap/pap-benchmark-data.js
 * Ingestion e Parsing Dati del Protocollo PAP e Misure di Salto.
 *
 * Responsabilità:
 * 1. Parser avanzato per file CSV multi-sezione esportati da Optojump/Microgate
 *    (anagrafica atleti, salti singoli SJ, CMJ, ABK, e salti reattivi continui RJ).
 * 2. Rilevamento euristico di tracciati PAP da colonne e metadati.
 * 3. Alimentazione pulita e dinamica della suite di analisi PAP senza dipendenze da dati hardcoded.
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    /**
     * Classe di gestione e alimentazione dati del protocollo sperimentale PAP.
     */
    class PAPBenchmarkData {

        /**
         * Restituisce un dataset vuoto. Il dataset benchmark era a scopo di sviluppo.
         * L'applicazione elabora esclusivamente dati caricati dall'utente.
         * @returns {Array<Object>}
         */
        static getBenchmarkDataset() {
            return [];
        }

        /**
         * Ricerca di fallback per atleta (ritorna null poiché i dati sono caricati dinamicamente).
         * @returns {null}
         */
        static getAthleteByIdentifier() {
            return null;
        }

        /**
         * Verifica se un dataset o una serie di intestazioni appartiene a un protocollo PAP.
         * Rileva la presenza di metadati specifici del protocollo (pre/post, salti, stiffness).
         * @param {Array<Object>} records - Record estratti.
         * @param {Array<string>} headers - Intestazioni.
         * @returns {boolean}
         */
        static isPAPDataset(records, headers) {
            const hStr = Array.isArray(headers) ? headers.join(' ').toLowerCase() : '';
            if (hStr.includes('pap') || hStr.includes('post activation potentiation') || hStr.includes('post-activation') || hStr.includes('potentiation')) {
                return true;
            }

            if (hStr.includes('pre') && hStr.includes('post') && (hStr.includes('rsi') || hStr.includes('cmj') || hStr.includes('sj') || hStr.includes('stiffness'))) {
                return true;
            }

            return false;
        }

        /**
         * Effettua il parsing avanzato di un file CSV multi-sezione esportato da Optojump
         * contenente anagrafica atleti, salti singoli (SJ, CMJ, ABK) e salti reattivi continui (RJ).
         * Applica automaticamente validazione cinematica balistica ed estrazione delle serie
         * PRE e POST con cronometraggio reale.
         * @param {string} csvText - Contenuto testuale del file CSV.
         * @returns {Array<Object>} Lista di oggetti atleta strutturati per la dashboard PAP.
         */
        static parseOptojumpCSV(csvText) {
            if (!csvText || typeof csvText !== 'string') return [];

            const Validator = root.PAPIntegrityValidator;
            const lines = csvText.split(/\r?\n/);
            let currentSection = '';

            const personsMap = new Map();
            const singleJumps = [];
            const reactiveTrialsByAthlete = new Map();
            let currentReboundTrial = null;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                if (line.startsWith('****')) {
                    if (line.includes('Persone')) currentSection = 'PERSONE';
                    else if (line.includes('Salti singoli')) currentSection = 'SINGOLI';
                    else if (line.includes('Salti reattivi')) currentSection = 'REATTIVI';
                    else currentSection = 'OTHER';
                    continue;
                }

                const cols = line.split(';').map(c => c.trim().replace(',', '.'));

                if (currentSection === 'PERSONE') {
                    if (cols[0] === 'ID' || !cols[0] || isNaN(cols[0])) continue;
                    const id = parseInt(cols[0], 10);
                    const name = cols[1];

                    personsMap.set(id, {
                        id,
                        name,
                        mass: parseFloat(cols[6]) || 0,
                        sport: cols[7] || 'Atletica Leggera',
                        specialty: cols[8] || ''
                    });
                } else if (currentSection === 'SINGOLI') {
                    if (cols[0] === 'ID Persona' || !cols[0] || isNaN(cols[0])) continue;
                    singleJumps.push({
                        athleteId: parseInt(cols[0], 10),
                        athleteName: cols[1],
                        jumpId: parseInt(cols[2], 10),
                        type: (cols[3] || '').trim().toUpperCase(),
                        tc: parseFloat(cols[4]) || 0,
                        tf: parseFloat(cols[5]) || 0,
                        height: parseFloat(cols[8]) || 0,
                        power: parseFloat(cols[9]) || 0,
                        velocity: parseFloat(cols[11]) || 0,
                        timestamp: cols[13] || ''
                    });
                } else if (currentSection === 'REATTIVI') {
                    if (!isNaN(cols[0]) && cols[1] && (cols[3] || '').includes('RJ')) {
                        const athId = parseInt(cols[0], 10);
                        currentReboundTrial = {
                            athleteId: athId,
                            athleteName: cols[1],
                            trialId: parseInt(cols[2], 10),
                            timestamp: cols[19] || '',
                            rebounds: []
                        };
                        if (!reactiveTrialsByAthlete.has(athId)) {
                            reactiveTrialsByAthlete.set(athId, []);
                        }
                        reactiveTrialsByAthlete.get(athId).push(currentReboundTrial);
                    } else if (currentReboundTrial && !isNaN(cols[0]) && cols.length >= 7) {
                        const idx = parseInt(cols[0], 10);
                        if (idx > 0) {
                            currentReboundTrial.rebounds.push({
                                tc: parseFloat(cols[1]),
                                tf: parseFloat(cols[2]),
                                height: parseFloat(cols[3]),
                                rsi: parseFloat(cols[4]),
                                power: parseFloat(cols[5]) || 0,
                                stiffness: parseFloat(cols[6]) || 0
                            });
                        }
                    }
                }
            }

            // 1. Filtro salti singoli con validatore cinematico balistico
            const validSingles = (Validator && typeof Validator.filterSingleJumps === 'function')
                ? Validator.filterSingleJumps(singleJumps).validJumps
                : singleJumps;

            const athletesResult = [];

            // Costruzione lista atleti dinamica
            personsMap.forEach((person, athleteId) => {
                // Recupero salti singoli per atleta
                const athSingles = validSingles.filter(j => j.athleteId === athleteId);
                const groupByType = (typeKey) => athSingles.filter(j => j.type === typeKey);

                const getBestPrePost = (typeKey) => {
                    const group = groupByType(typeKey);
                    if (group.length === 0) {
                        return { pre: 0, post: 0, powerWkg: 0 };
                    }
                    const half = Math.ceil(group.length / 2);
                    const preGroup = group.slice(0, half);
                    const postGroup = group.slice(half);

                    const maxPre = Math.max(...preGroup.map(j => j.height));
                    const maxPost = postGroup.length > 0 ? Math.max(...postGroup.map(j => j.height)) : maxPre;

                    let powerWkg = 0;
                    if (typeKey === 'SJ' && preGroup.length > 0 && person.mass > 0) {
                        const bestSj = preGroup.find(j => j.height === maxPre);
                        if (bestSj && bestSj.power > 0) {
                            powerWkg = parseFloat((bestSj.power / person.mass).toFixed(2));
                        }
                    }

                    return { pre: maxPre, post: maxPost, powerWkg };
                };

                const sjStats = getBestPrePost('SJ');
                const cmjStats = getBestPrePost('CMJ');
                const abkStats = getBestPrePost('ABK');

                // Recupero prove reattive PRE e POST
                const rTrials = reactiveTrialsByAthlete.get(athleteId) || [];
                let rebPre = [];
                let rebPost = [];
                let tsPre = '';
                let tsPost = '';
                let recMinutes = null;

                if (rTrials.length >= 2) {
                    rebPre = rTrials[0].rebounds;
                    rebPost = rTrials[1].rebounds;
                    tsPre = rTrials[0].timestamp;
                    tsPost = rTrials[1].timestamp;
                    if (Validator && typeof Validator.computeRealRecoveryMinutes === 'function') {
                        recMinutes = Validator.computeRealRecoveryMinutes(tsPre, tsPost);
                    }
                } else if (rTrials.length === 1) {
                    rebPre = rTrials[0].rebounds;
                }

                athletesResult.push({
                    id: athleteId,
                    name: person.name,
                    fullName: person.name,
                    age: person.age || 18,
                    mass: person.mass || 70,
                    sport: person.sport || 'Atletica Leggera',
                    specialty: person.specialty || '',
                    morphology: person.morphology || 'Atleta esaminato nel protocollo di salto.',
                    protocol: person.protocol || {
                        name: 'Protocollo di Salto',
                        fullDescription: 'Test salti e rimbalzi reattivi',
                        category: 'Standard',
                        sets: 2,
                        reps: 6,
                        contacts: 12,
                        restBetweenSetsMin: 3.0
                    },
                    recoveryTimeMin: recMinutes !== null ? recMinutes : 18.0,
                    timestampPre: tsPre,
                    timestampPost: tsPost,
                    singleJumps: {
                        sjPre: sjStats.pre,
                        sjPost: sjStats.post,
                        cmjPre: cmjStats.pre,
                        cmjPost: cmjStats.post,
                        abkPre: abkStats.pre,
                        abkPost: abkStats.post,
                        powerSjWkg: sjStats.powerWkg
                    },
                    reactiveReboundsPre: rebPre,
                    reactiveReboundsPost: rebPost
                });
            });

            return athletesResult;
        }
    }

    // Esposizione globale
    root.PAPBenchmarkData = PAPBenchmarkData;
})();
