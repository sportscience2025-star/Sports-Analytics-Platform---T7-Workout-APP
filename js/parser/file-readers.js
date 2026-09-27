/**
 * js/parser/file-readers.js
 * Multi-format file ingestion: Excel (SheetJS/ExcelJS/CSV), PDF (PDF.js) and Image OCR (Tesseract.js).
 * Include parser euristico testuale per estrazione dati da stringhe non strutturate.
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    /**
     * Numero massimo di righe iniziali da ispezionare per individuare l'intestazione.
     */
    const MAX_HEADER_SEARCH_ROWS = 50;

    /**
     * Punteggio minimo per considerare valida un'intestazione individuata.
     */
    const MIN_HEADER_SCORE = 4;

    /**
     * Moltiplicatore di peso per colonne semantiche mappate nel calcolo punteggio header.
     */
    const MAPPED_HEADER_WEIGHT = 10;

    /**
     * Moltiplicatore di peso per celle testuali non vuote nel calcolo punteggio header.
     */
    const STRING_HEADER_WEIGHT = 2;

    /**
     * Numero minimo di celle testuali non vuote per considerare una riga come header valido.
     */
    const MIN_STRING_CELLS_FOR_HEADER = 2;

    /**
     * Lunghezza minima del testo decodificato per tentare il fallback CSV.
     */
    const MIN_CSV_TEXT_LENGTH = 3;

    /**
     * Numero minimo di righe CSV valide per accettare la conversione testuale.
     */
    const MIN_CSV_ROWS = 1;

    /**
     * Soglia temporale massima plausibile in secondi per il tempo di volo della palla medica.
     */
    const MAX_FLIGHT_TIME_SECONDS = 10;

    /**
     * Carico minimo in kg per filtro euristico estrazione coppie.
     */
    const MIN_EXTRACT_LOAD_KG = 5;

    /**
     * Velocità minima in m/s per filtro euristico estrazione coppie.
     */
    const MIN_EXTRACT_VELOCITY_MPS = 0.01;

    /**
     * Velocità massima in m/s per filtro euristico estrazione coppie.
     */
    const MAX_EXTRACT_VELOCITY_MPS = 3.0;

    /**
     * Nome predefinito per atleta non identificato.
     */
    const DEFAULT_ATHLETE_NAME = 'Sconosciuto';

    /**
     * Nome predefinito per esercizio non identificato.
     */
    const DEFAULT_EXERCISE_NAME = 'Sconosciuto';

    // Helper di risoluzione riferimenti modulari dinamici
    const getResolver = () => (root._parserAthleteResolver || root.DataParser || (typeof window !== 'undefined' ? window._parserAthleteResolver : null) || {});
    const getHeaderMapper = () => (root._parserHeaderMapper || root.DataParser || (typeof window !== 'undefined' ? window._parserHeaderMapper : null) || {});
    const getInstrumentDetector = () => (root._parserInstrumentDetector || root.DataParser || (typeof window !== 'undefined' ? window._parserInstrumentDetector : null) || {});
    const getNormalizeExercise = () => (root._parserNormalizeExercise || (root.DataParser && root.DataParser.normalizeExercise) || (typeof window !== 'undefined' ? window._parserNormalizeExercise : null) || (raw => raw));
    const getAggregateByLoad = () => (root._parserAggregateByLoad || (root.DataParser && root.DataParser.aggregateByLoad) || (typeof window !== 'undefined' ? window._parserAggregateByLoad : null) || (recs => ({ aggregated: recs, wasAggregated: false })));

    /**
     * Effettua il parsing a 3 livelli di un file Excel o CSV (SheetJS -> ExcelJS -> Native CSV).
     * Normalizza i dati, classifica lo strumento ed aggrega carichi ripetuti.
     * @param {File|Blob|Uint8Array|ArrayBuffer|Buffer} file - File caricato o buffer di memoria.
     * @returns {Promise<Object>} Dataset strutturato con rawData, athletes, exercises e metadati.
     */
    async function parseExcel(file) {
        return new Promise(async (resolve, reject) => {
            if (!file) {
                return reject(new Error("Nessun file fornito per il parsing."));
            }
            const processDataBuffer = async (data) => {
                try {
                    let workbookSheets = null;

                    // 1. Livello primario: SheetJS (window.XLSX o global.XLSX)
                    const xlsxLib = (typeof window !== 'undefined' && window.XLSX) ? window.XLSX : (typeof global !== 'undefined' && global.XLSX ? global.XLSX : null);
                    if (xlsxLib && typeof xlsxLib.read === 'function') {
                        try {
                            const bufferData = (data && data.buffer)
                                ? (data.byteOffset === 0 && data.byteLength === data.buffer.byteLength
                                    ? data.buffer
                                    : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength))
                                : data;
                            const workbook = xlsxLib.read(bufferData, { type: 'array' });
                            if (workbook && workbook.SheetNames && workbook.SheetNames.length > 0) {
                                workbookSheets = {};
                                workbook.SheetNames.forEach(sheetName => {
                                    const sheet = workbook.Sheets[sheetName];
                                    if (xlsxLib.utils && typeof xlsxLib.utils.sheet_to_json === 'function') {
                                        workbookSheets[sheetName] = xlsxLib.utils.sheet_to_json(sheet, { header: 1 });
                                    }
                                });
                            }
                        } catch (xlsxErr) {
                            console.warn('[DataParser] SheetJS parse failed, attempting fallback:', xlsxErr);
                        }
                    }

                    // 2. Livello secondario: ExcelJS (window.ExcelJS o global.ExcelJS)
                    const excelJsLib = (typeof window !== 'undefined' && window.ExcelJS) ? window.ExcelJS : (typeof global !== 'undefined' && global.ExcelJS ? global.ExcelJS : null);
                    if (!workbookSheets && excelJsLib && typeof excelJsLib.Workbook === 'function') {
                        try {
                            const wb = new excelJsLib.Workbook();
                            const bufferData = (data && data.buffer)
                                ? (data.byteOffset === 0 && data.byteLength === data.buffer.byteLength
                                    ? data.buffer
                                    : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength))
                                : data;
                            await wb.xlsx.load(bufferData);
                            workbookSheets = {};
                            wb.eachSheet((worksheet) => {
                                const rows = [];
                                worksheet.eachRow({ includeEmpty: false }, (row) => {
                                    const values = Array.isArray(row.values) ? row.values.slice(1) : [];
                                    const cleanValues = values.map(v => {
                                        if (v === null || v === undefined) return null;
                                        if (typeof v === 'object') {
                                            if (v.result !== undefined) return v.result;
                                            if (v.text !== undefined) return v.text;
                                            if (v instanceof Date) return v.toISOString().split('T')[0];
                                        }
                                        return v;
                                    });
                                    rows.push(cleanValues);
                                });
                                workbookSheets[worksheet.name] = rows;
                            });
                        } catch (excelJsErr) {
                            console.warn('[DataParser] ExcelJS parse failed, attempting CSV fallback:', excelJsErr);
                        }
                    }

                    // 3. Livello terziario: Decoder CSV testuale nativo (UTF-8 con fallback a Windows-1252)
                    const headerMapper = getHeaderMapper();
                    const readCSVFn = headerMapper.readCSVRows || (root.DataParser && root.DataParser._readCSVRows);

                    if (!workbookSheets) {
                        try {
                            let text = '';
                            try {
                                text = new TextDecoder('utf-8', { fatal: false }).decode(data);
                            } catch (_) {
                                text = '';
                            }
                            if ((!text || text.includes('\uFFFD')) && typeof TextDecoder !== 'undefined') {
                                try {
                                    const win1252Text = new TextDecoder('windows-1252').decode(data);
                                    if (win1252Text && !win1252Text.includes('\uFFFD')) {
                                        text = win1252Text;
                                    }
                                } catch (_) {}
                            }
                            if (text && text.length > MIN_CSV_TEXT_LENGTH && typeof readCSVFn === 'function') {
                                const rows = readCSVFn(text);
                                if (rows.length >= MIN_CSV_ROWS) {
                                    workbookSheets = { 'Sheet1': rows };
                                }
                            }
                        } catch (csvErr) {
                            console.warn('[DataParser] CSV text fallback failed:', csvErr);
                        }
                    }

                    if (!workbookSheets || Object.keys(workbookSheets).length === 0) {
                        throw new Error("Impossibile leggere il file: formato non valido o librerie di lettura Excel non disponibili.");
                    }

                    const resolver = getResolver();
                    const isGenericAthleteFn = resolver.isGenericAthlete || (root.DataParser && root.DataParser.isGenericAthlete) || (name => !name);
                    const isEncodedIdFn = resolver.isEncodedId || (root.DataParser && root.DataParser.isEncodedId) || (() => false);
                    const extractReadableNameFn = resolver.extractReadableName || (root.DataParser && root.DataParser.extractReadableName) || (n => n);
                    const extractAthleteFromFilenameFn = resolver.extractAthleteFromFilename || (root.DataParser && root.DataParser.extractAthleteFromFilename) || (() => null);
                    const normalizeExerciseFn = getNormalizeExercise();
                    const aggregateByLoadFn = getAggregateByLoad();
                    const mapHeadersFn = headerMapper.mapHeaders || (root.DataParser && root.DataParser._mapHeaders);
                    const detector = getInstrumentDetector();
                    const detectInstrumentFn = detector.detectInstrumentType || (root.DataParser && root.DataParser.detectInstrumentType);

                    let allRecords = [];
                    let bestSheetHeaders = [];
                    let maxHeaderScore = -1;

                    Object.keys(workbookSheets).forEach(sheetName => {
                        const rows = workbookSheets[sheetName];
                        if (!rows || rows.length === 0) return;

                        // Ricerca riga header con calcolo punteggio semantico e testuale
                        let headerRowIdx = -1;
                        let headers = [];
                        let currentSheetMaxScore = -1;
                        const maxScan = Math.min(MAX_HEADER_SEARCH_ROWS, rows.length);

                        for (let i = 0; i < maxScan; i++) {
                            const row = rows[i];
                            if (!row || !Array.isArray(row)) continue;
                            const stringCount = row.filter(cell => typeof cell === 'string' && cell.trim().length > 0).length;
                            const tempColMap = typeof mapHeadersFn === 'function' ? mapHeadersFn(row) : {};
                            const mappedCount = Object.keys(tempColMap).filter(k => !k.startsWith('_')).length;
                            const score = (mappedCount * MAPPED_HEADER_WEIGHT) + (stringCount * STRING_HEADER_WEIGHT);

                            if (score > currentSheetMaxScore) {
                                currentSheetMaxScore = score;
                                headerRowIdx = i;
                                headers = row;
                            }
                        }

                        // Se il punteggio massimo non raggiunge la soglia minima, crea intestazioni sintetiche
                        if (currentSheetMaxScore < MIN_HEADER_SCORE) {
                            headerRowIdx = -1;
                            const firstRowLen = (rows[0] && Array.isArray(rows[0])) ? rows[0].length : 1;
                            headers = Array.from({ length: firstRowLen }, (_, idx) => `Colonna ${idx + 1}`);
                        } else {
                            // Normalizza headers rimuovendo valori nulli o vuoti
                            headers = headers.map((h, idx) => {
                                const str = (h !== null && h !== undefined) ? String(h).trim() : '';
                                return str.length > 0 ? str : `Colonna ${idx + 1}`;
                            });
                        }

                        // Registra come bestSheetHeaders il foglio con la migliore mappatura
                        if (currentSheetMaxScore > maxHeaderScore || bestSheetHeaders.length === 0) {
                            maxHeaderScore = currentSheetMaxScore;
                            bestSheetHeaders = headers;
                        }

                        const colMap = typeof mapHeadersFn === 'function' ? mapHeadersFn(headers) : {};
                        const startRow = (headerRowIdx >= 0) ? (headerRowIdx + 1) : 0;

                        for (let i = startRow; i < rows.length; i++) {
                            const row = rows[i];
                            if (!row || !Array.isArray(row) || row.length === 0) continue;
                            if (row.every(cell => cell === null || cell === undefined || String(cell).trim() === '')) continue;

                            const record = {
                                athlete: DEFAULT_ATHLETE_NAME, athleteRaw: null, athleteRawId: null,
                                exercise: DEFAULT_EXERCISE_NAME, exerciseId: null, sessionId: null, deviceId: null,
                                date: null,
                                // VBT Encoders
                                load: null, velocity: null, peakVelocity: null, propulsiveVelocity: null, power: null, rom: null, fatigue: null,
                                oneRm: null, percentOneRm: null, repsCount: 1, setNumber: null, rpe: null, notes: null,
                                // Force Plates
                                forceZ: null, peakForce: null, meanForce: null, rfd: null, impulse: null, rsimod: null, leftForce: null, rightForce: null, asymmetry: null,
                                // Block Start Accelerometers
                                accelX: null, accelY: null, accelZ: null, horizontalAccel: null, resultantAccel: null, reactionTime: null, pushDuration: null, exitVelocity: null,
                                // Timing Gates / Fotocellule
                                splitDistance: null, splitTime: null, cumulativeTime: null, splitVelocity: null,
                                split_5m: null, split_10m: null, split_20m: null, split_30m: null, split_60m: null,
                                // Kinematics / Video Analysis
                                frame: null, time: null, kneeAngle: null, hipAngle: null, ankleAngle: null, trunkAngle: null, jointAngle: null, angularVelocity: null, coordX: null, coordY: null, linearVelocity: null,
                                // Vertical Jump
                                jumpHeight: null, contactTime: null, dropHeight: null, rsi: null, eur: null,
                                // Medicine Ball Throws
                                ballMass: null, throwDistance: null, flightTime: null, releaseAngle: null, releaseHeight: null,
                                // Running / General
                                distance: null, pace: null,
                                // Memorizzazione grezza per tabelle generiche
                                _rawRow: row,
                                _cells: {}
                            };

                            headers.forEach((header, idx) => {
                                const rawValue = row[idx];
                                if (rawValue === undefined || rawValue === null || rawValue === '') return;

                                record._cells[header] = rawValue;
                                if (!(header in record)) {
                                    record[header] = rawValue;
                                }

                                const mappedKey = colMap[idx];
                                if (!mappedKey) return;

                                if (mappedKey === 'athlete') {
                                    const strVal = String(rawValue).trim();
                                    if (strVal && (!record.athlete || record.athlete === DEFAULT_ATHLETE_NAME || isGenericAthleteFn(record.athlete) || !isGenericAthleteFn(strVal))) {
                                        record.athlete = strVal;
                                        record.athleteRaw = strVal;
                                    }
                                } else if (mappedKey === 'athleteRawId') {
                                    const strVal = String(rawValue).trim();
                                    record.athleteRawId = strVal;
                                    if (!record.athlete || record.athlete === DEFAULT_ATHLETE_NAME || isGenericAthleteFn(record.athlete)) {
                                        if (isEncodedIdFn(strVal)) {
                                            const extracted = extractReadableNameFn(strVal);
                                            if (extracted && !isGenericAthleteFn(extracted)) {
                                                record.athlete = extracted;
                                                record.athleteRaw = strVal;
                                            }
                                        } else if (strVal && !isGenericAthleteFn(strVal) && isNaN(Number(strVal))) {
                                            record.athlete = strVal;
                                            record.athleteRaw = strVal;
                                        }
                                    }
                                } else if (mappedKey === 'exercise') {
                                    const strVal = String(rawValue).trim();
                                    if (strVal && (!record.exercise || record.exercise === DEFAULT_EXERCISE_NAME)) {
                                        record.exercise = strVal;
                                    }
                                } else if (mappedKey === 'exerciseId') {
                                    record.exerciseId = String(rawValue).trim();
                                } else if (mappedKey === 'sessionId') {
                                    record.sessionId = String(rawValue).trim();
                                } else if (mappedKey === 'deviceId') {
                                    record.deviceId = String(rawValue).trim();
                                } else if (mappedKey === 'date') {
                                    record.date = String(rawValue).trim();
                                } else if (mappedKey === 'notes') {
                                    record.notes = String(rawValue).trim();
                                } else if (mappedKey === 'rpe') {
                                    const num = parseFloat(String(rawValue).replace(',', '.'));
                                    if (!isNaN(num)) record.rpe = num;
                                    else record.notes = (record.notes ? record.notes + ' | ' : '') + String(rawValue).trim();
                                } else if (mappedKey === 'setNumber') {
                                    const num = parseInt(String(rawValue).replace(/\D/g, ''), 10);
                                    if (!isNaN(num)) record.setNumber = num;
                                } else if (mappedKey === 'repsCount') {
                                    const num = parseInt(String(rawValue).replace(/\D/g, ''), 10);
                                    if (!isNaN(num)) record.repsCount = num;
                                } else {
                                    const num = parseFloat(String(rawValue).replace(',', '.'));
                                    if (!isNaN(num)) record[mappedKey] = num;
                                }
                            });

                            // Fallback: se velocity è assente ma propulsiveVelocity (Vmp) è presente, usa Vmp
                            if ((record.velocity === null || record.velocity === undefined) && record.propulsiveVelocity !== null && record.propulsiveVelocity !== undefined) {
                                record.velocity = record.propulsiveVelocity;
                            }

                            if (record.athlete && record.athlete !== DEFAULT_ATHLETE_NAME && !record.athleteRaw) {
                                record.athleteRaw = record.athlete;
                            }

                            if (record.exercise && record.exercise !== DEFAULT_EXERCISE_NAME) {
                                record.exercise = normalizeExerciseFn(record.exercise);
                            }

                            // Filtro scientifico: se sono presenti metriche biomeccaniche numeriche esplicite e sono tutte <= 0, scarta la riga
                            const numericMetricKeys = ['ballMass', 'throwDistance', 'load', 'velocity', 'jumpHeight', 'dropHeight', 'peakForce', 'meanForce'];
                            const presentMetrics = numericMetricKeys.filter(k => typeof record[k] === 'number');
                            if (presentMetrics.length > 0 && presentMetrics.every(k => record[k] <= 0)) {
                                continue;
                            }

                            allRecords.push(record);
                        }
                    });

                    if (allRecords.length === 0) {
                        throw new Error("Nessun dato utile trovato nel file Excel o fogli privi di righe compilate.");
                    }

                    // Fallback atleta da nome file se non specificato nei record
                    const fallbackAthlete = (file && file.name) ? extractAthleteFromFilenameFn(file.name) : null;
                    if (fallbackAthlete) {
                        allRecords.forEach(r => {
                            if (isGenericAthleteFn(r.athlete)) {
                                r.athlete = fallbackAthlete;
                            }
                        });
                    }

                    // Costruzione mappa ID codificati -> nomi leggibili
                    const athleteIdMap = {};
                    const rawAthletes = new Set();
                    allRecords.forEach(r => {
                        if (r.athlete && !isGenericAthleteFn(r.athlete)) rawAthletes.add(r.athlete);
                    });
                    rawAthletes.forEach(name => {
                        if (isEncodedIdFn(name)) {
                            athleteIdMap[name] = extractReadableNameFn(name);
                        } else {
                            athleteIdMap[name] = name;
                        }
                    });

                    // Applicazione nomi leggibili ai record
                    allRecords.forEach(r => {
                        if (r.athlete && athleteIdMap[r.athlete]) {
                            if (!r.athleteRaw) r.athleteRaw = r.athlete;
                            r.athlete = athleteIdMap[r.athlete];
                        }
                        if (!r.athleteRaw && r.athlete) {
                            r.athleteRaw = r.athlete;
                        }
                        if (!r.repsCount) {
                            r.repsCount = 1;
                        }
                    });

                    // Aggregazione carichi ripetuti (solo se VBT con almeno 2 punti validi)
                    let finalRecords = allRecords;
                    let aggResult = { wasAggregated: false };
                    const vbtValidPoints = allRecords.filter(r => typeof r.load === 'number' && r.load > 0 && typeof r.velocity === 'number' && r.velocity > 0);
                    if (vbtValidPoints.length >= 2) {
                        aggResult = aggregateByLoadFn(allRecords);
                        if (aggResult && Array.isArray(aggResult.aggregated) && aggResult.aggregated.length > 0) {
                            finalRecords = aggResult.aggregated;
                        }
                    }

                    // Estrazione insiemi univoci di atleti ed esercizi
                    const athletes = new Set();
                    const exercises = new Set();
                    finalRecords.forEach(r => {
                        if (r.athlete && !isGenericAthleteFn(r.athlete)) athletes.add(r.athlete);
                        if (r.exercise && r.exercise !== DEFAULT_EXERCISE_NAME) exercises.add(r.exercise);
                    });

                    // Classificazione adattiva dello strumento
                    const extraContext = {
                        sheetNames: Object.keys(workbookSheets || {}),
                        filename: (file && file.name) ? file.name : ''
                    };
                    const detected = typeof detectInstrumentFn === 'function'
                        ? detectInstrumentFn(finalRecords, bestSheetHeaders, extraContext)
                        : { type: 'GENERAL_TABULAR', label: 'Dati Tabellari Grezzi', summary: '', metrics: [] };

                    // Integrazione fisica balistica per lancio palla medica
                    if (detected.type === 'MEDICINE_BALL') {
                        finalRecords.forEach(r => {
                            if ((r.ballMass === null || r.ballMass === undefined) && typeof r.load === 'number' && r.load > 0) {
                                r.ballMass = r.load;
                            }
                            if ((r.throwDistance === null || r.throwDistance === undefined) && typeof r.distance === 'number' && r.distance > 0) {
                                r.throwDistance = r.distance;
                            }
                            if ((r.flightTime === null || r.flightTime === undefined) && typeof r.time === 'number' && r.time > 0 && r.time < MAX_FLIGHT_TIME_SECONDS) {
                                r.flightTime = r.time;
                            }
                            const medPhysics = (typeof window !== 'undefined' && window.MedicineBallPhysics) || (typeof global !== 'undefined' && global.MedicineBallPhysics);
                            if (medPhysics && typeof medPhysics.calculate === 'function') {
                                if (typeof r.ballMass === 'number' && r.ballMass > 0 && typeof r.throwDistance === 'number' && r.throwDistance > 0) {
                                    const physics = medPhysics.calculate({
                                        mass: r.ballMass,
                                        distance: r.throwDistance,
                                        flightTime: r.flightTime || undefined,
                                        releaseAngle: r.releaseAngle || undefined,
                                        releaseHeight: r.releaseHeight || undefined,
                                        pushDuration: r.pushDuration || undefined
                                    });
                                    if (physics && physics.valid) {
                                        if (r.exitVelocity === null || r.exitVelocity === undefined) r.exitVelocity = physics.exitVelocity;
                                        if (r.power === null || r.power === undefined) r.power = physics.meanPower;
                                        r.meanPower = physics.meanPower;
                                        r.peakPower = physics.peakPower;
                                    }
                                }
                            }
                        });
                    }

                    resolve({
                        rawData: finalRecords,
                        athletes: Array.from(athletes),
                        exercises: Array.from(exercises),
                        athleteIdMap,
                        hasEncodedIds: Object.values(athleteIdMap).some((v, _, arr) => v !== arr[0]),
                        encodedAthletes: Object.entries(athleteIdMap)
                            .filter(([k]) => isEncodedIdFn(k))
                            .map(([raw, readable]) => ({ raw, readable })),
                        aggregationInfo: aggResult.wasAggregated
                            ? `${aggResult.originalN} ripetizioni grezze → ${aggResult.aggregatedN} punti medi per carico`
                            : null,
                        instrumentType: detected.type,
                        instrumentLabel: detected.label,
                        instrumentSummary: detected.summary,
                        detectedMetrics: detected.metrics,
                        headers: (bestSheetHeaders || []).filter(h => typeof h === 'string' && h.trim().length > 0)
                    });

                } catch (err) {
                    reject(err);
                }
            };

            // Smistamento per Buffer/Uint8Array, file.arrayBuffer() o FileReader browser
            if (file instanceof Uint8Array || (typeof Buffer !== 'undefined' && Buffer.isBuffer(file))) {
                await processDataBuffer(new Uint8Array(file));
            } else if (file instanceof ArrayBuffer) {
                await processDataBuffer(new Uint8Array(file));
            } else if (typeof file.arrayBuffer === 'function') {
                try {
                    const ab = await file.arrayBuffer();
                    await processDataBuffer(new Uint8Array(ab));
                } catch (abErr) {
                    console.warn('[DataParser] file.arrayBuffer fallito, fallback a FileReader:', abErr);
                    if (typeof FileReader !== 'undefined') {
                        const reader = new FileReader();
                        reader.onload = async (e) => {
                            await processDataBuffer(new Uint8Array(e.target.result));
                        };
                        reader.onerror = (err) => reject(err);
                        reader.readAsArrayBuffer(file);
                    } else {
                        reject(abErr);
                    }
                }
            } else if (typeof FileReader !== 'undefined') {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    await processDataBuffer(new Uint8Array(e.target.result));
                };
                reader.onerror = (err) => reject(err);
                reader.readAsArrayBuffer(file);
            } else {
                reject(new Error("Formato file non supportato o ambiente privo di FileReader."));
            }
        });
    }

    /**
     * Estrae coppie carico/velocità da stringhe di testo grezzo numerico.
     * @param {string} text - Testo grezzo contenente righe numeriche.
     * @returns {Array<Object>} Array di coppie { load, velocity }.
     */
    function _extractPairsFromText(text) {
        if (!text || typeof text !== 'string') return [];
        const lines = text.split('\n');
        const data = [];
        const numRegex = /[0-9]+[.,]?[0-9]*/g;
        lines.forEach(line => {
            const matches = line.match(numRegex);
            if (matches && matches.length >= 2) {
                let n1 = parseFloat(matches[0].replace(',', '.'));
                let n2 = parseFloat(matches[1].replace(',', '.'));
                let load, vel;
                if (n1 > n2) { load = n1; vel = n2; }
                else { load = n2; vel = n1; }
                if (load > MIN_EXTRACT_LOAD_KG && vel > MIN_EXTRACT_VELOCITY_MPS && vel < MAX_EXTRACT_VELOCITY_MPS) {
                    data.push({ load, velocity: vel });
                }
            }
        });
        return data;
    }

    /**
     * Effettua il parsing di dati testuali non strutturati (da PDF o OCR) per estrarre record VBT/biomeccanici.
     * @param {string} text - Testo grezzo estratto.
     * @returns {Object} { rawData, athletes, exercises }.
     */
    function _parseTextData(text) {
        if (!text || typeof text !== 'string') return { rawData: [], athletes: [], exercises: [] };

        const normalizeExerciseFn = getNormalizeExercise();

        const keywordPattern = /\b(athlete|atleta|name|nome|usuario|user|date|data|fecha|exercise|esercizio|ejercicio|jump\s+type|salto|tipo\s+salto|cmj|sj|dj|squat|bench\s+press|stacco|deadlift|countermovement\s+jump|squat\s+jump|drop\s+jump|load|carga|peso|kg|height|altura|altezza|volo|h|distance|distanza|time|tempo|durata|pace|ritmo|passo|min\/km)\b/gi;
        text = text.replace(keywordPattern, '\n$1');

        const lines = text.split('\n');
        const records = [];
        let currentAthlete = DEFAULT_ATHLETE_NAME;
        let currentExercise = DEFAULT_EXERCISE_NAME;
        let currentDate = null;

        const dateRegex = /\b(\d{4}[-/.]\d{2}[-/.]\d{2})|(\d{2}[-/.]\d{2}[-/.]\d{4})\b/;
        const athleteLabelRegex = /(?:athlete|atleta|name|nome|usuario|user)\s*[:=]\s*([^\n\r,|]+)/i;
        const exerciseLabelRegex = /(?:exercise|esercizio|ejercicio|jump type|salto|tipo salto)\s*[:=]\s*([^\n\r,|]+)/i;
        const knownExercises = ['squat', 'bench press', 'panca', 'stacco', 'deadlift', 'shoulder press', 'cmj', 'sj', 'dj', 'countermovement jump', 'squat jump', 'drop jump'];

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            const dateMatch = line.match(dateRegex);
            if (dateMatch) currentDate = dateMatch[0];

            const athleteMatch = line.match(athleteLabelRegex);
            if (athleteMatch) currentAthlete = athleteMatch[1].trim().replace(/^[-:|\s]+|[-:|\s]+$/g, '');

            const exerciseMatch = line.match(exerciseLabelRegex);
            if (exerciseMatch) {
                currentExercise = normalizeExerciseFn(exerciseMatch[1].trim());
            } else {
                const lowerLine = line.toLowerCase();
                for (const ke of knownExercises) {
                    if (lowerLine === ke || lowerLine.startsWith(ke + ' ') || lowerLine.startsWith(ke + ':')) {
                        currentExercise = normalizeExerciseFn(ke);
                        break;
                    }
                }
            }

            let load = null, velocity = null, jumpHeight = null, contactTime = null;
            let dropHeight = null, distance = null, time = null, pace = null;

            const lowerLine = line.toLowerCase();
            const loadMatch = line.match(/(?:load|carga|peso|kg)\s*[:=]?\s*([0-9]+[.,]?[0-9]*)/i);
            const velocityMatch = line.match(/(?:velocity|velocità|velocita|vm|m\/s)\s*[:=]?\s*([0-9]+[.,]?[0-9]*)/i);
            let jumpHeightMatch = line.match(/(?:height|altura|altezza|volo|h|jumpHeight)\s*[:=]?\s*([0-9]+[.,]?[0-9]*)/i);
            if (jumpHeightMatch && (lowerLine.includes('drop') || lowerLine.includes('caduta') || lowerLine.includes('caida'))) jumpHeightMatch = null;
            const contactTimeMatch = line.match(/(?:contact|contatto|tc|contactTime)\s*[:=]?\s*([0-9]+[.,]?[0-9]*)/i);
            const dropHeightMatch = line.match(/(?:dropHeight|altezza caduta|drop height|altura caida|caduta)\s*[:=]?\s*([0-9]+[.,]?[0-9]*)/i);
            const distanceMatch = line.match(/(?:distance|distanza|km|metri)\s*[:=]?\s*([0-9]+[.,]?[0-9]*)/i);
            let timeMatch = line.match(/(?:time|tempo|durata)\s*[:=]?\s*([0-9]+[.,]?[0-9]*)/i);
            if (timeMatch && (lowerLine.includes('contact') || lowerLine.includes('contatto') || lowerLine.includes('tc'))) timeMatch = null;
            const paceMatch = line.match(/(?:pace|ritmo|min\/km|passo)\s*[:=]?\s*([0-9]+[.,]?[0-9]*)/i);

            if (loadMatch) load = parseFloat(loadMatch[1].replace(',', '.'));
            if (velocityMatch) velocity = parseFloat(velocityMatch[1].replace(',', '.'));
            if (jumpHeightMatch) jumpHeight = parseFloat(jumpHeightMatch[1].replace(',', '.'));
            if (contactTimeMatch) contactTime = parseFloat(contactTimeMatch[1].replace(',', '.'));
            if (dropHeightMatch) dropHeight = parseFloat(dropHeightMatch[1].replace(',', '.'));
            if (distanceMatch) distance = parseFloat(distanceMatch[1].replace(',', '.'));
            if (timeMatch) time = parseFloat(timeMatch[1].replace(',', '.'));
            if (paceMatch) pace = parseFloat(paceMatch[1].replace(',', '.'));

            // Fallback: cerca due numeri per carico e velocità su riga non intestazione
            if (load === null && velocity === null && jumpHeight === null && contactTime === null && distance === null && time === null && pace === null) {
                const isHeaderOrDate = dateRegex.test(line) || athleteLabelRegex.test(line) || exerciseLabelRegex.test(line);
                if (!isHeaderOrDate) {
                    const numRegex = /\b[0-9]+[.,]?[0-9]*\b/g;
                    const matches = line.match(numRegex);
                    if (matches && matches.length >= 1) {
                        const isJumpExercise = ['cmj', 'sj', 'dj', 'jump', 'salto'].some(term => currentExercise.toLowerCase().includes(term) || lowerLine.includes(term));
                        if (isJumpExercise) {
                            const n1 = parseFloat(matches[0].replace(',', '.'));
                            if (!isNaN(n1)) jumpHeight = n1;
                            if (matches.length >= 2) { const n2 = parseFloat(matches[1].replace(',', '.')); if (!isNaN(n2)) contactTime = n2; }
                            if (matches.length >= 3) { const n3 = parseFloat(matches[2].replace(',', '.')); if (!isNaN(n3)) dropHeight = n3; }
                        } else if (matches.length >= 2) {
                            const n1 = parseFloat(matches[0].replace(',', '.'));
                            const n2 = parseFloat(matches[1].replace(',', '.'));
                            if (!isNaN(n1) && !isNaN(n2)) {
                                if (n1 > n2) { load = n1; velocity = n2; } else { load = n2; velocity = n1; }
                            }
                        }
                    }
                }
            }

            const hasValidMetric = (load !== null && load > 0) || (velocity !== null && velocity > 0) ||
                (jumpHeight !== null && jumpHeight > 0) || (contactTime !== null && contactTime > 0) ||
                (dropHeight !== null && dropHeight > 0) || (distance !== null && distance > 0) ||
                (time !== null && time > 0) || (pace !== null && pace > 0);

            if (hasValidMetric) {
                records.push({
                    athlete: currentAthlete,
                    exercise: currentExercise,
                    load,
                    velocity,
                    date: currentDate,
                    jumpHeight,
                    contactTime,
                    dropHeight,
                    distance,
                    time,
                    pace
                });
            }
        }

        const resolver = getResolver();
        const isGenericAthleteFn = resolver.isGenericAthlete || (root.DataParser && root.DataParser.isGenericAthlete) || (name => !name);

        const athletes = new Set();
        const exercises = new Set();
        records.forEach(r => {
            if (r.athlete && r.athlete !== DEFAULT_ATHLETE_NAME && !isGenericAthleteFn(r.athlete)) athletes.add(r.athlete);
            if (r.exercise && r.exercise !== DEFAULT_EXERCISE_NAME) exercises.add(r.exercise);
        });

        return {
            rawData: records,
            athletes: Array.from(athletes),
            exercises: Array.from(exercises)
        };
    }

    /**
     * Estrae dati VBT da un file immagine tramite OCR (Tesseract.js).
     * @param {File|Blob} file - File immagine da analizzare.
     * @param {Function} [progressCallback] - Callback opzionale per monitorare l'avanzamento.
     * @returns {Promise<Object>} Dataset strutturato con rawData, athletes ed exercises.
     */
    async function parseImageOCR(file, progressCallback) {
        return new Promise(async (resolve, reject) => {
            if (!file) return reject(new Error("Nessun file fornito per il parsing."));
            const tess = (typeof window !== 'undefined' && window.Tesseract) || (typeof global !== 'undefined' && global.Tesseract);
            if (!tess) return reject(new Error("Tesseract.js non caricato."));

            try {
                const worker = await tess.createWorker({
                    logger: m => {
                        if (progressCallback && m.status === 'recognizing text') {
                            progressCallback(m.progress);
                        }
                    }
                });
                await worker.loadLanguage('ita+eng+spa');
                await worker.initialize('ita+eng+spa');
                const { data: { text } } = await worker.recognize(file);
                await worker.terminate();

                const parsed = _parseTextData(text);
                const resolver = getResolver();
                const extractAthleteFromFilenameFn = resolver.extractAthleteFromFilename || (root.DataParser && root.DataParser.extractAthleteFromFilename);
                const isGenericAthleteFn = resolver.isGenericAthlete || (root.DataParser && root.DataParser.isGenericAthlete) || (name => !name);

                const fallbackAthlete = (file && file.name && typeof extractAthleteFromFilenameFn === 'function')
                    ? extractAthleteFromFilenameFn(file.name)
                    : null;

                if (fallbackAthlete) {
                    parsed.rawData.forEach(r => {
                        if (isGenericAthleteFn(r.athlete)) r.athlete = fallbackAthlete;
                    });
                    const athletes = new Set();
                    parsed.rawData.forEach(r => {
                        if (r.athlete && !isGenericAthleteFn(r.athlete)) athletes.add(r.athlete);
                    });
                    parsed.athletes = Array.from(athletes);
                }

                resolve(parsed);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Estrae testo e dati strutturati da un file PDF tramite PDF.js.
     * @param {File|Blob|ArrayBuffer|Uint8Array} file - File PDF o buffer binario.
     * @returns {Promise<Object>} Dataset strutturato estratto dal documento PDF.
     */
    async function parsePDF(file) {
        return new Promise((resolve, reject) => {
            if (!file) return reject(new Error("Nessun file fornito per il parsing."));
            const processArrayBuffer = async (arrayBuffer) => {
                try {
                    const pdfLib = (typeof window !== 'undefined' && window.pdfjsLib) || (typeof global !== 'undefined' && global.pdfjsLib);
                    if (!pdfLib) throw new Error("PDF.js non caricato.");
                    if (pdfLib.GlobalWorkerOptions) {
                        pdfLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
                    }
                    const loadingTask = pdfLib.getDocument({ data: arrayBuffer });
                    const pdf = await loadingTask.promise;
                    let fullText = "";
                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                        const page = await pdf.getPage(pageNum);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => item.str).join("\n");
                        fullText += pageText + "\n";
                    }

                    const parsed = _parseTextData(fullText);
                    const resolver = getResolver();
                    const extractAthleteFromFilenameFn = resolver.extractAthleteFromFilename || (root.DataParser && root.DataParser.extractAthleteFromFilename);
                    const isGenericAthleteFn = resolver.isGenericAthlete || (root.DataParser && root.DataParser.isGenericAthlete) || (name => !name);

                    const fallbackAthlete = (file && file.name && typeof extractAthleteFromFilenameFn === 'function')
                        ? extractAthleteFromFilenameFn(file.name)
                        : null;

                    if (fallbackAthlete) {
                        parsed.rawData.forEach(r => {
                            if (isGenericAthleteFn(r.athlete)) r.athlete = fallbackAthlete;
                        });
                        const athletes = new Set();
                        parsed.rawData.forEach(r => {
                            if (r.athlete && !isGenericAthleteFn(r.athlete)) athletes.add(r.athlete);
                        });
                        parsed.athletes = Array.from(athletes);
                    }

                    resolve(parsed);
                } catch (err) {
                    reject(err);
                }
            };

            if (file instanceof ArrayBuffer) {
                processArrayBuffer(file);
            } else if (file instanceof Uint8Array || (typeof Buffer !== 'undefined' && Buffer.isBuffer(file))) {
                processArrayBuffer(new Uint8Array(file).buffer);
            } else if (typeof FileReader !== 'undefined') {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    await processArrayBuffer(e.target.result);
                };
                reader.onerror = (err) => reject(err);
                reader.readAsArrayBuffer(file);
            } else {
                reject(new Error("Formato file non supportato o FileReader assente."));
            }
        });
    }

    const fileReaders = {
        parseExcel,
        parsePDF,
        parseImageOCR,
        parseTextData: _parseTextData,
        _parseTextData,
        extractPairsFromText: _extractPairsFromText,
        _extractPairsFromText
    };

    // Esposizione per ambiente browser e test runner Node.js
    root._parserFileReaders = fileReaders;
    if (typeof window !== 'undefined') {
        window._parserFileReaders = fileReaders;
    }

    /**
     * Registrazione preventiva di fallback immediato per DataParser:
     * Garantisce la presenza immediata dei metodi di parsing principali (parseExcel, parsePDF, parseImageOCR)
     * su root, window, globalThis e self qualora non siano già stati registrati.
     * Questa registrazione preventiva previene errori di invocazione immediata in caso di latenza di rete,
     * caricamento asincrono o disallineamento della cache di parser.js.
     * Quando parser.js viene eseguito, sovrascrive DataParser con la classe orchestratore completa.
     */
    if (!root.DataParser) {
        root.DataParser = fileReaders;
    }
    if (typeof window !== 'undefined' && !window.DataParser) {
        window.DataParser = fileReaders;
    }
    if (typeof globalThis !== 'undefined' && !globalThis.DataParser) {
        globalThis.DataParser = fileReaders;
    }
    if (typeof self !== 'undefined' && !self.DataParser) {
        self.DataParser = fileReaders;
    }
})();
