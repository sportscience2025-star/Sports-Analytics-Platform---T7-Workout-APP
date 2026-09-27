/**
 * js/parser/header-mapper.js
 * CSV/TSV delimited row parsing and 29-family semantic header mapping.
 * Converte intestazioni grezze multilingue in chiavi interne standardizzate.
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    /**
     * Indice sentinella che indica un elemento o colonna non trovata.
     */
    const INDEX_NOT_FOUND = -1;

    /**
     * Numero minimo di righe per considerare valido il contenuto delimitato.
     */
    const MIN_LINES_COUNT = 0;

    /**
     * Indice della prima riga nella matrice di testo delimitato.
     */
    const FIRST_LINE_INDEX = 0;

    /**
     * Parole chiave e intestazioni per la mappatura del carico e del peso bilanciere.
     * Include varianti internazionali e notazioni con unità di misura esplicite.
     */
    const LOAD_KEYWORDS = Object.freeze([
        'weight', 'weights', 'wt', 'peso (kg)', 'carico (kg)', 'peso [kg]', 'carico [kg]',
        'pesi', 'kg load', 'kg_load', 'load (kg)', 'load [kg]', 'weight (kg)', 'weight [kg]',
        'load', 'carico', 'peso', 'carga', 'kg'
    ]);

    /**
     * Parole chiave e intestazioni per la velocità media o velocità di esecuzione.
     * Include varianti VBT, sprint e denominazioni in lingua italiana, inglese e spagnola.
     */
    const VELOCITY_KEYWORDS = Object.freeze([
        'speed', 'speeds', 'velocita (m/s)', 'velocità (m/s)', 'vel (m/s)', 'speed (m/s)',
        'velocità media', 'velocita media', 'mean speed', 'mean velocity', 'velocity (m/s)',
        'velocita [m/s]', 'velocità [m/s]', 'vel [m/s]', 'speed [m/s]', 'velocity [m/s]',
        'vm', 'vmean', 'v_mean', 'mean_v', 'vel', 'velocity', 'velocita', 'velocità', 'velocidad'
    ]);

    /**
     * Parole chiave e intestazioni per il conteggio delle ripetizioni.
     */
    const REPS_KEYWORDS = Object.freeze([
        'reps', 'ripetizioni', 'repetitions', 'reps_count', 'n_reps', 'rip', 'rep',
        'n_ripetizioni', 'ripetizione', 'count', 'n reps', 'n ripetizioni',
        'n. reps', 'n. ripetizioni', 'reps count', 'rep count', 'reps_cnt',
        'num reps', 'numero ripetizioni', 'ripetizioni totali'
    ]);

    /**
     * Parole chiave e intestazioni per il numero o indice di serie (set).
     */
    const SET_KEYWORDS = Object.freeze([
        'sets', 'serie', 'set', 'n_serie', 'n_set', 'set_number', 'set_idx',
        'n serie', 'n set', 'n. serie', 'n. set', 'set no', 'set_no', 'set num',
        'set_num', 'numero serie', 'numero set', 'set index', 'set idx'
    ]);

    /**
     * Parole chiave e intestazioni per lo sforzo percepito (RPE / RIR).
     */
    const RPE_KEYWORDS = Object.freeze([
        'rpe', 'rir', 'sforzo', 'fatica percepita', 'perceived exertion', 'rating',
        'rpe (1-10)', 'rpe [1-10]', 'rpe target', 'rpe reale', 'rating of perceived exertion',
        'sforzo percepito', 'scala rpe', 'rir target'
    ]);

    /**
     * Numero massimo di righe campionate per rilevare il delimitatore CSV/TSV.
     */
    const CSV_SAMPLE_LINES_COUNT = 25;

    /**
     * Parole chiave e intestazioni per note, annotazioni e commenti tecnici.
     */
    const NOTES_KEYWORDS = Object.freeze([
        'note', 'notes', 'commenti', 'comments', 'osservazioni',
        'comment', 'commento', 'nota', 'osservazione', 'note coach', 'coach notes',
        'annotazioni', 'note allenamento'
    ]);

    /**
     * Effettua il parsing di testo grezzo delimitato (CSV, TSV, punto e virgola) in righe strutturate.
     * Rileva automaticamente il delimitatore prevalente e converte date e valori numerici.
     * @param {string} text - Testo grezzo da convertire in righe.
     * @returns {Array<Array<string|number|null>>} Matrice di celle analizzate.
     */
    function readCSVRows(text) {
        if (!text || typeof text !== 'string') return [];
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length === MIN_LINES_COUNT) return [];

        // Ispezione su un campione iniziale di righe per rilevare il delimitatore prevalente
        const sampleLines = lines.slice(FIRST_LINE_INDEX, Math.min(lines.length, CSV_SAMPLE_LINES_COUNT)).join('\n');
        const commaCount = (sampleLines.match(/,/g) || []).length;
        const semiCount = (sampleLines.match(/;/g) || []).length;
        const tabCount = (sampleLines.match(/\t/g) || []).length;
        let delim = ',';
        if (semiCount > commaCount && semiCount > tabCount) delim = ';';
        else if (tabCount > commaCount && tabCount > semiCount) delim = '\t';

        return lines.map(line => {
            return line.split(delim).map(cell => {
                const trimmed = cell.trim().replace(/^["']|["']$/g, '');
                if (trimmed === '') return null;
                if (/^\d{4}[-/.]\d{2}[-/.]\d{2}$/.test(trimmed)) return trimmed;
                const norm = trimmed.replace(',', '.');
                return /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(norm) ? parseFloat(norm) : trimmed;
            });
        });
    }

    /**
     * Mappa le intestazioni di colonna grezze verso le chiavi semantiche interne (29 famiglie).
     * Gestisce la precedenza gerarchica tra metriche sovrapposte (es. drop height vs jump height, release angle vs joint angle).
     * @param {Array<string>} headers - Array delle intestazioni delle colonne.
     * @returns {Object} Mappa da indice di colonna a chiave normalizzata interna.
     */
    function mapHeaders(headers) {
        const colMap = {};
        if (!headers || !Array.isArray(headers)) return colMap;
        let vmpIndex = INDEX_NOT_FOUND;

        headers.forEach((header, idx) => {
            if (header === null || header === undefined) return;
            const lower = String(header).toLowerCase().trim();
            if (!lower) return;

            // 1. Session ID (e.g. session_id, id_session, sessionid, idsessione) - MAI a 'exercise' o 'date'
            if (lower === 'session_id' || lower === 'id_session' || lower === 'sessionid' || lower === 'id_sessione' || lower === 'idsessione' ||
                (lower.includes('session') && (lower.includes('id') || lower.includes('ident') || lower.includes('cod')))) {
                colMap[idx] = 'sessionId';
            }
            // 2. Exercise ID (e.g. idejercicio, id_ejercicio, exercise_id, id_esercizio) - MAI a 'exercise'
            else if (lower === 'idejercicio' || lower === 'id_ejercicio' || lower === 'id_exercise' || lower === 'exercise_id' || lower === 'exerciseid' ||
                     lower === 'idesercizio' || lower === 'id_esercizio' || lower === 'lift_id' || lower === 'id_lift' ||
                     ((lower.includes('ejercicio') || lower.includes('exercise') || lower.includes('esercizio') || lower.includes('lift')) &&
                      (lower.includes('id') || lower.includes('cod')))) {
                colMap[idx] = 'exerciseId';
            }
            // 3. Athlete ID (e.g. idusuario, id_usuario, user_id, athlete_id, id_atleta) - MAI a 'athlete'
            else if (lower === 'idusuario' || lower === 'id_usuario' || lower === 'user_id' || lower === 'userid' ||
                     lower === 'athlete_id' || lower === 'athleteid' || lower === 'idatleta' || lower === 'id_atleta' || lower === 'id_athlete' ||
                     lower === 'id_name' || lower === 'name_id' ||
                     (['usuario', 'atleta', 'athlete', 'user', 'nome', 'jugador', 'soggetto', 'paziente', 'cliente'].some(k => lower.includes(k)) &&
                      (lower.includes('id') || lower.includes('cod')))) {
                colMap[idx] = 'athleteRawId';
            }
            // 4. Device ID
            else if (lower === 'device_id' || lower === 'id_device' || lower === 'deviceid' || lower === 'dispositivo_id' || lower === 'id_dispositivo' ||
                     ((lower.includes('device') || lower.includes('dispositivo') || lower.includes('encoder') || lower.includes('sensore') || lower.includes('sensor')) && lower.includes('id'))) {
                colMap[idx] = 'deviceId';
            }
            // 5. Athlete in chiaro (senza 'id')
            else if (['usuario', 'atleta', 'athlete', 'name', 'user', 'nome', 'cognome', 'jugador', 'soggetto', 'paziente', 'cliente'].some(k => lower.includes(k)) &&
                     !lower.includes('exercise') && !lower.includes('esercizio') && !lower.includes('ejercicio') && !lower.includes('file') &&
                     !lower.includes('id') && !lower.includes('cod') && !lower.includes('livello') && !lower.includes('tipo') &&
                     !lower.includes('sport') && !lower.includes('parametro') && !lower.includes('valore')) {
                if (!Object.values(colMap).includes('athlete')) {
                    colMap[idx] = 'athlete';
                }
            }
            // 6. Date
            else if (lower.includes('data') || lower.includes('date') || lower.includes('fecha') || lower.includes('timestamp') ||
                     (lower.includes('sessione') && !lower.includes('id'))) {
                colMap[idx] = 'date';
            }
            // Medicine Ball - Release Height (MUST precede generic Jump Height)
            else if (["altezza rilascio", "release height", "altezza di rilascio", "launch height", "h_rilascio", "h0", "h_release"].some(t => lower.includes(t))) {
                colMap[idx] = 'releaseHeight';
            }
            // Medicine Ball - Flight Time (MUST precede Jump Height which checks 'volo')
            else if (["tempo di volo", "tempo volo", "flight time", "flight_time", "t_volo", "t volo", "tof", "time of flight", "volo (s)"].some(t => lower.includes(t))) {
                colMap[idx] = 'flightTime';
            }
            // Medicine Ball - Release Angle (MUST precede Video Kinematics 'angolo')
            else if (["angolo rilascio", "release angle", "launch angle", "angolo di rilascio", "angolo lancio", "angolo di lancio", "angolo_rilascio", "release_angle"].some(t => lower.includes(t))) {
                colMap[idx] = 'releaseAngle';
            }
            // Medicine Ball - Ball Mass (MUST precede VBT 'load/peso')
            else if (["peso palla", "ball mass", "ball_mass", "ball weight", "peso_palla", "massa palla", "massa_palla", "medball mass", "medball weight", "palla medica", "peso attrezzo", "massa attrezzo"].some(t => lower.includes(t))) {
                colMap[idx] = 'ballMass';
            }
            // Medicine Ball - Throw Distance (MUST precede generic 'distance')
            else if (["distanza lancio", "throw distance", "throw_distance", "distanza_lancio", "lunghezza lancio", "lancio (m)", "gittata", "gettata", "mb distance", "ball distance", "distanza palla"].some(t => lower.includes(t))) {
                colMap[idx] = 'throwDistance';
            }
            // Medicine Ball / Physics - Estimated Velocity & Power
            else if (["velocita stimata", "velocità stimata", "estimated velocity", "velocita lancio", "velocità lancio", "v0 (m/s)", "v0"].some(t => lower.includes(t))) {
                colMap[idx] = 'exitVelocity';
            }
            else if (["potenza stimata", "potenza stimata (w)", "potenza media palla", "sayers power", "harman power", "estimated power"].some(t => lower.includes(t))) {
                colMap[idx] = 'power';
            }
            // 7. Drop height (must come before generic height)
            else if (["altezza caduta", "drop height", "altura caida", "caduta", "drop_height", "drop_h"].some(t => lower.includes(t))) {
                colMap[idx] = 'dropHeight';
            }
            // 8. Jump height
            else if (["altezza salto", "jump height", "altura salto", "volo", "h(cm)", "h (cm)", "jump_h", "h_salto"].some(t => lower.includes(t)) ||
                lower === 'h' || lower === 'altezza' || lower === 'altura' || lower === 'height' || lower === 'salto') {
                colMap[idx] = 'jumpHeight';
            }
            // 9. Contact time
            else if (["tempo contatto", "contact time", "tiempo contacto", "contatto", "contact_time", "tiempo_contacto", "tc (s)", "tc(s)", "ct (s)", "ct(s)"].some(t => lower.includes(t)) ||
                lower === 'tc' || lower === 'ct') {
                colMap[idx] = 'contactTime';
            }
            // 10. Force Plate - Peak & Mean Force
            else if (["peak force", "picco forza", "picco di forza", "fmax", "f_max", "max force", "forza max", "forza massima"].some(t => lower.includes(t))) {
                colMap[idx] = 'peakForce';
            }
            else if (["mean force", "forza media", "fmean", "f_mean", "average force"].some(t => lower.includes(t))) {
                colMap[idx] = 'meanForce';
            }
            // 11. Force Plate - Left & Right Force / Asymmetry
            else if (["forza sx", "forza sinistra", "left force", "force left", "fz left", "f_sx", "f_left", "fz_l"].some(t => lower.includes(t))) {
                colMap[idx] = 'leftForce';
            }
            else if (["forza dx", "forza destra", "right force", "force right", "fz right", "f_dx", "f_right", "fz_r"].some(t => lower.includes(t))) {
                colMap[idx] = 'rightForce';
            }
            else if (["asymmetry", "asimmetria", "l/r asymmetry", "asi %", "asym"].some(t => lower.includes(t))) {
                colMap[idx] = 'asymmetry';
            }
            // 12. Force Plate - RFD, Impulse, RSImod
            else if (["rfd", "rate of force development", "sviluppo forza", "tasso forza"].some(t => lower.includes(t))) {
                colMap[idx] = 'rfd';
            }
            else if (["impulso", "impulse"].some(t => lower.includes(t))) {
                colMap[idx] = 'impulse';
            }
            else if (["rsimod", "rsi_mod", "rsi mod", "rsi-mod", "modified rsi"].some(t => lower.includes(t))) {
                colMap[idx] = 'rsimod';
            }
            // 13. Force Plate - Vertical Force (Fz)
            else if (["fz", "force_z", "force z", "f_z", "vertical force", "forza verticale", "forza z", "force(n)", "force (n)", "fz (n)", "fz(n)", "forza (n)", "force_n"].some(t => lower.includes(t)) ||
                lower === 'fz' || lower === 'forza' || (lower.includes('forza') && !lower.includes('reattiva'))) {
                colMap[idx] = 'forceZ';
            }
            // 14. Accelerometer (Block Starts) - Reaction Time & Push Duration
            else if (["tempo reazione", "reaction time", "tempo di reazione", "rt (ms)", "rt (s)"].some(t => lower.includes(t)) || lower === 'rt') {
                colMap[idx] = 'reactionTime';
            }
            else if (["tempo spinta", "push time", "push duration", "block time", "tempo sui blocchi", "durata spinta"].some(t => lower.includes(t))) {
                colMap[idx] = 'pushDuration';
            }
            else if (["velocita uscita", "exit velocity", "v_exit", "v exit", "velocita blocco"].some(t => lower.includes(t))) {
                colMap[idx] = 'exitVelocity';
            }
            // 15. Accelerometer (Block Starts) - Horizontal & Resultant
            else if (["accel orizzontale", "horizontal accel", "a_horiz", "ahoriz", "accel_h", "ax_horiz", "accel horiz"].some(t => lower.includes(t))) {
                colMap[idx] = 'horizontalAccel';
            }
            else if (["accel risultante", "resultant accel", "ares", "a_res", "accel_res", "total accel", "acc totale"].some(t => lower.includes(t))) {
                colMap[idx] = 'resultantAccel';
            }
            else if (["accel_x", "accel x", "acceleration x", "acc x", "ax (m/s2)", "ax (g)"].some(t => lower.includes(t)) || lower === 'ax') {
                colMap[idx] = 'accelX';
            }
            else if (["accel_y", "accel y", "acceleration y", "acc y", "ay (m/s2)", "ay (g)"].some(t => lower.includes(t)) || lower === 'ay') {
                colMap[idx] = 'accelY';
            }
            else if (["accel_z", "accel z", "acceleration z", "acc z", "az (m/s2)", "az (g)"].some(t => lower.includes(t)) || lower === 'az') {
                colMap[idx] = 'accelZ';
            }
            // 16. Timing Gates / Fotocellule (Sprint)
            else if (lower === '5' || lower === '5m' || lower === '5 m' || ["0-5m", "split 5m", "split 5 m", "t 5m", "t5m"].some(t => lower === t || lower.includes(t))) {
                colMap[idx] = 'split_5m';
            }
            else if (lower === '10' || lower === '10m' || lower === '10 m' || ["0-10m", "split 10m", "split 10 m", "t 10m", "t10m"].some(t => lower === t || lower.includes(t))) {
                colMap[idx] = 'split_10m';
            }
            else if (lower === '20' || lower === '20m' || lower === '20 m' || ["0-20m", "split 20m", "split 20 m", "t 20m", "t20m"].some(t => lower === t || lower.includes(t))) {
                colMap[idx] = 'split_20m';
            }
            else if (lower === '30' || lower === '30m' || lower === '30 m' || ["0-30m", "split 30m", "split 30 m", "t 30m", "t30m"].some(t => lower === t || lower.includes(t))) {
                colMap[idx] = 'split_30m';
            }
            else if (lower === '60' || lower === '60m' || lower === '60 m' || ["0-60m", "split 60m", "split 60 m", "t 60m", "t60m"].some(t => lower === t || lower.includes(t))) {
                colMap[idx] = 'split_60m';
            }
            else if (["distanza split", "split distance", "traguardo", "distanza (m)", "dist (m)", "distanza parziale"].some(t => lower.includes(t))) {
                colMap[idx] = 'splitDistance';
            }
            else if (["tempo parziale", "split time", "intertempo", "t_split", "tempo split"].some(t => lower.includes(t)) || lower === 'split') {
                colMap[idx] = 'splitTime';
            }
            else if (["tempo totale", "cumulative time", "total time", "tempo cumulativo", "t_tot"].some(t => lower.includes(t))) {
                colMap[idx] = 'cumulativeTime';
            }
            else if (["velocita split", "split velocity", "v_split", "velocità tratta"].some(t => lower.includes(t))) {
                colMap[idx] = 'splitVelocity';
            }
            // 17. Video Analysis Kinematics (Kinovea / Dartfish / Tracker)
            else if (["angolo ginocchio", "knee angle", "knee_angle", "ginocchio (°)", "ginocchio (deg)"].some(t => lower.includes(t)) || lower === 'knee') {
                colMap[idx] = 'kneeAngle';
            }
            else if (["angolo anca", "hip angle", "hip_angle", "anca (°)", "anca (deg)"].some(t => lower.includes(t)) || lower === 'hip') {
                colMap[idx] = 'hipAngle';
            }
            else if (["angolo caviglia", "ankle angle", "ankle_angle", "caviglia (°)", "caviglia (deg)"].some(t => lower.includes(t)) || lower === 'ankle') {
                colMap[idx] = 'ankleAngle';
            }
            else if (["angolo tronco", "trunk angle", "trunk_angle", "tronco (°)", "tronco (deg)"].some(t => lower.includes(t)) || lower === 'trunk') {
                colMap[idx] = 'trunkAngle';
            }
            else if (["velocita angolare", "angular velocity", "ang_vel", "omega", "deg/s", "°/s"].some(t => lower.includes(t))) {
                colMap[idx] = 'angularVelocity';
            }
            else if (["angolo", "angle", "joint angle", "angolo articolare", "angolo (°)", "angle (deg)"].some(t => lower.includes(t))) {
                colMap[idx] = 'jointAngle';
            }
            else if (["frame", "fotogramma", "quadro", "n_frame", "frame_idx"].some(t => lower.includes(t))) {
                colMap[idx] = 'frame';
            }
            else if (["coord_x", "coord x", "pos_x", "x (px)", "x (m)", "pos x"].some(t => lower.includes(t)) || lower === 'x') {
                colMap[idx] = 'coordX';
            }
            else if (["coord_y", "coord y", "pos_y", "y (px)", "y (m)", "pos y"].some(t => lower.includes(t)) || lower === 'y') {
                colMap[idx] = 'coordY';
            }
            else if (["velocita lineare", "linear velocity", "vel_lineare"].some(t => lower.includes(t))) {
                colMap[idx] = 'linearVelocity';
            }
            // 18. VBT Encoders - Peak Velocity (Vmax)
            else if (["vmax", "v_max", "peak velocity", "velocita picco", "v picco", "vpeak", "v_picco", "peak v", "velocidad maxima", "velocidad máxima"].some(t => lower === t || lower.includes(t))) {
                colMap[idx] = 'peakVelocity';
            }
            // 19. VBT Encoders - Propulsive Velocity (Vmp / MPV)
            else if (lower === 'vmp' || lower === 'v_mp' || lower.includes('vmp') || lower.includes('v_mp') ||
                     ["mpv", "mean propulsive velocity", "v_prop", "vprop", "velocita propulsiva", "velocidad propulsiva", "velocidad media propulsiva"].some(t => lower === t || lower.includes(t))) {
                colMap[idx] = 'propulsiveVelocity';
                vmpIndex = idx;
            }
            // 20. Power (Potencia / Watt)
            else if (["potencia", "power", "watt", "pmean", "ppotenza", "potenza media", "potenza picco", "peak power", "potencia media", "potencia pico"].some(t => lower === t || lower.includes(t)) || lower === 'w') {
                colMap[idx] = 'power';
            }
            // 21. ROM (Range of Motion / Spostamento / Recorrido)
            else if (lower === 'rom' || lower === 'rom (cm)' || lower === 'rom (mm)' || lower.startsWith('rom ') || lower.startsWith('rom_') || lower.endsWith(' rom') ||
                     ["range di movimento", "range of motion", "spostamento", "displacement", "recorrido"].some(t => lower.includes(t))) {
                colMap[idx] = 'rom';
            }
            // 22. Sforzo Percepito (RPE / RIR) - Precede la fatica generica
            else if (RPE_KEYWORDS.some(k => lower === k || lower.includes(k)) ||
                     lower.includes('fatica percepita') || lower.includes('perceived exertion') ||
                     lower.includes('sforzo') || lower === 'rpe' || lower === 'rir' || lower === 'rating' ||
                     /\b(rpe|rir)\b/i.test(lower)) {
                colMap[idx] = 'rpe';
            }
            // 23. Fatigue / Fatiga / Perdita Velocità
            else if (lower === 'fatiga' || lower === 'fatigue' ||
                     ["fatiga", "fatigue", "perdida vel", "loss of velocity", "velocity loss", "perdida de velocidad", "pérdida de velocidad", "% fatiga", "% fatica", "% fatigue"].some(t => lower.includes(t))) {
                colMap[idx] = 'fatigue';
            }
            // 24. % 1RM (must come before 1RM)
            else if (lower === '% 1rm' || lower === '%1rm' || lower === '% 1 rm' || lower === '%1 rm' ||
                     ["% 1rm", "%1rm", "% de 1rm", "porcentaje 1rm", "pct 1rm", "%1 rm", "% 1 rm"].some(t => lower.includes(t))) {
                colMap[idx] = 'percentOneRm';
            }
            // 25. 1RM
            else if (lower === '1rm' || lower === '1 rm' || lower === 'e1rm' || lower === 'one rm' || lower === 'one-rm' ||
                     ["1rm", "1 rm", "e1rm", "est 1rm", "est. 1rm", "rm stimato", "1rm stimato"].some(t => lower === t || lower.includes(t))) {
                colMap[idx] = 'oneRm';
            }
            // 26. Exercise (Human readable, NO 'id')
            else if ((lower.includes('ejercicio') || lower.includes('exercise') || lower.includes('esercizio') ||
                      lower.includes('lift') || lower.includes('attività') ||
                      lower === 'tipo' || lower.includes('tipo esercizio') || lower.includes('exercise type') || lower.includes('lift type') ||
                      lower === 'jump type' || lower.includes('drill') || lower.includes('test')) &&
                     !lower.includes('id') && !lower.includes('cod') && !lower.includes('soggetto') && !lower.includes('paziente')) {
                colMap[idx] = 'exercise';
            }
            // 27. Numero di Serie (Set Number / Serie)
            else if (SET_KEYWORDS.some(k => lower === k || lower.startsWith(k + ' ') || lower.endsWith(' ' + k)) ||
                     lower === 'serie' || lower === 'sets' || lower === 'set' ||
                     /\b(sets?|serie|n_serie|n_set|set_number|set_idx)\b/i.test(lower)) {
                colMap[idx] = 'setNumber';
            }
            // 28. Conteggio Ripetizioni (Reps Count / Ripetizioni)
            else if (REPS_KEYWORDS.some(k => lower === k || lower.startsWith(k + ' ') || lower.endsWith(' ' + k)) ||
                     lower === 'rep' || lower === 'reps' || lower === 'rip' || lower === 'count' ||
                     /\b(reps?|ripetizioni|repetitions|reps_count|n_reps|ripetizione)\b/i.test(lower)) {
                colMap[idx] = 'repsCount';
            }
            // 29. Load / Weight / Carico (VBT)
            else if (LOAD_KEYWORDS.some(k => lower === k || lower.includes(k)) ||
                     lower === 'kg' || lower === 'carga' || lower === 'load' || lower === 'weight' || lower === 'wt' || lower === 'pesi' ||
                     lower.includes('carga') || lower.includes('peso') || lower.includes('load') || lower.includes('carico') ||
                     lower.includes('weight') ||
                     (lower.includes('kg') && !lower.includes('m/s') && !lower.includes('velocit') && !lower.includes('velocid'))) {
                colMap[idx] = 'load';
            }
            // 30. Mean Velocity (Vm) / Speed
            else if (VELOCITY_KEYWORDS.some(k => lower === k || lower.includes(k)) ||
                     lower === 'vm' || lower === 'vmean' || lower === 'v_mean' || lower === 'mean_v' || lower === 'vel' ||
                     lower.includes('mean speed') || lower.includes('mean v') ||
                     lower.includes('velocit') || lower.includes('velocity') || lower.includes('velocidad') ||
                     lower.includes('speed') || lower.includes('m/s')) {
                if (!Object.values(colMap).includes('velocity') || lower === 'vm' || lower === 'vmean') {
                    colMap[idx] = 'velocity';
                }
            }
            // 31. Note / Commenti / Osservazioni
            else if (NOTES_KEYWORDS.some(k => lower === k || lower.includes(k)) ||
                     lower.includes('note') || lower.includes('comment') || lower.includes('osservazion') || lower.includes('annotazion')) {
                colMap[idx] = 'notes';
            }
            // 32. General Distance, Time, Pace
            else if (lower.includes('distanza') || lower.includes('distance') || lower === 'km' || lower.includes('metri')) {
                colMap[idx] = 'distance';
            }
            else if (lower.includes('tempo') || lower.includes('time') || lower.includes('durata')) {
                colMap[idx] = 'time';
            }
            else if (lower.includes('ritmo') || lower.includes('pace') || lower.includes('min/km') || lower === 'passo') {
                colMap[idx] = 'pace';
            }
            // 33. Jump indices
            else if (lower === 'rsi' || lower.includes('forza reattiva')) {
                colMap[idx] = 'rsi';
            }
            else if (lower === 'eur') {
                colMap[idx] = 'eur';
            }
        });

        // Se vm non è presente ma vmp sì, vmp funge da fallback
        if (!Object.values(colMap).includes('velocity') && vmpIndex !== INDEX_NOT_FOUND) {
            colMap._velocityFallback = vmpIndex;
        }

        return colMap;
    }

    const headerMapper = {
        readCSVRows,
        mapHeaders
    };

    // Esposizione per ambiente browser e test runner Node.js
    root._parserHeaderMapper = headerMapper;
    if (typeof window !== 'undefined') {
        window._parserHeaderMapper = headerMapper;
    }
})();
