/**
 * js/parser/athlete-resolver.js
 * Athlete name resolution, hardware ID decoding, and filename cleansing.
 * Risolve identificativi codificati da sensori (encoder/dispositivi) in nomi atleti leggibili.
 */

(function () {
    'use strict';

    const root = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);

    /**
     * Lunghezza minima per token esadecimale rappresentante ID dispositivo.
     */
    const MIN_HEX_TOKEN_LENGTH = 8;

    /**
     * Parole chiave per identificare token hardware o nomi tecnici dei dispositivi.
     */
    const DEVICE_KEYWORDS = ['encoder', 'sensor', 'device', 'vbt', 'id', 'mac', 'dispositivo', 'sensore', 'test', 'lineare'];

    /**
     * Verifica se una stringa corrisponde a un atleta generico o segnaposto predefinito.
     * @param {string} name - Nome atleta grezzo.
     * @returns {boolean} True se il nome è generico o non specificato.
     */
    function isGenericAthlete(name) {
        if (!name || typeof name !== 'string') return true;
        const lower = name.trim().toLowerCase();
        return lower === '' || lower === 'sconosciuto' || lower === 'unknown' || lower === 'encoder' || lower === 'default' || lower === 'atleta' || lower === 'soggetto';
    }

    /**
     * Rileva se un token di stringa appartiene a un ID hardware o dispositivo.
     * @param {string} part - Sottostringa/token da esaminare.
     * @returns {boolean} True se il frammento è riconducibile a un ID hardware.
     */
    function isDeviceToken(part) {
        if (!part || typeof part !== 'string') return false;
        const lower = part.trim().toLowerCase();
        if (!lower) return false;
        if (DEVICE_KEYWORDS.includes(lower)) return true;
        if (/\d/.test(lower)) return true;
        if (lower.length >= MIN_HEX_TOKEN_LENGTH && /^[a-f0-9]+$/i.test(lower)) return true;
        return false;
    }

    /**
     * Verifica se una stringa è un identificativo codificato (es. encoder_Mario_3936...).
     * @param {string} name - Nome o ID grezzo.
     * @returns {boolean} True se presenta delimitatori e token hardware.
     */
    function isEncodedId(name) {
        if (!name || typeof name !== 'string') return false;
        const trimmed = name.trim();
        if (!trimmed || (!trimmed.includes('_') && !trimmed.includes('-'))) return false;

        const parts = trimmed.split(/[-_]+/);
        return parts.some(p => isDeviceToken(p));
    }

    /**
     * Estrae un nome atleta leggibile e formattato da un ID codificato da dispositivo.
     * @param {string} encodedId - Stringa ID codificata (es. 'encoder_Riccardo_393636313639').
     * @returns {string} Nome leggibile estratto o 'Atleta' come fallback.
     */
    function extractReadableName(encodedId) {
        if (!encodedId || typeof encodedId !== 'string') return "Atleta";
        const trimmed = encodedId.trim();
        if (!trimmed) return "Atleta";

        const parts = trimmed.split(/[-_]+/);
        const nameParts = parts.filter(p => !isDeviceToken(p));

        const extracted = nameParts
            .filter(p => p.trim().length > 0)
            .map(p => {
                const clean = p.trim();
                return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
            })
            .join(' ')
            .trim();

        if (!extracted || isGenericAthlete(extracted)) {
            return "Atleta";
        }
        return extracted;
    }

    /**
     * Estrae il nome dell'atleta dal nome del file ripulendo estensioni, date e termini di rumore.
     * @param {string} filename - Nome del file caricato (es. 'Mario_Rossi_vbt_2026-06-15.xlsx').
     * @returns {string|null} Nome atleta formattato o null se non individuabile.
     */
    function extractAthleteFromFilename(filename) {
        if (!filename || typeof filename !== 'string') return null;
        let clean = filename.replace(/\.[^/.]+$/, '');
        clean = clean.replace(/(?:^|[-_.\s])\d{4}[-/._]\d{2}[-/._]\d{2}(?:[-_.\s]|$)/g, ' ')
                     .replace(/(?:^|[-_.\s])\d{2}[-/._]\d{2}[-/._]\d{4}(?:[-_.\s]|$)/g, ' ')
                     .replace(/(?:^|[-_.\s])\d{8}(?:[-_.\s]|$)/g, ' ')
                     .replace(/(?:^|[-_.\s])(19|20)\d{2}(?:[-_.\s]|$)/g, ' ');
        clean = clean.replace(/[-_.]/g, ' ');
        const noiseRegex = /\b(encoder|dati|data|export|report|vbt|test|session|sessione|allenamento|workout|backup|raw|file|profilo|mvt|1rm|load|velocity)\b/gi;
        clean = clean.replace(noiseRegex, '');
        clean = clean.replace(/\s+/g, ' ').trim();
        if (!clean || !/[a-zA-Z]/.test(clean) || isGenericAthlete(clean)) return null;
        return clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }

    const athleteResolver = {
        isGenericAthlete,
        isEncodedId,
        extractReadableName,
        extractAthleteFromFilename,
        isDeviceToken
    };

    // Esposizione per ambiente browser e test runner Node.js
    root._parserAthleteResolver = athleteResolver;
    if (typeof window !== 'undefined') {
        window._parserAthleteResolver = athleteResolver;
    }
})();
