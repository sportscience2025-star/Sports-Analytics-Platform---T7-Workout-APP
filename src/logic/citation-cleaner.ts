/**
 * src/logic/citation-cleaner.ts
 * Modulo di sanitizzazione editoriale per citazioni bibliografiche e fonti RAG.
 * Rimuove frammenti di debug interni (score di similarita, estensioni file, prefissi grezzi).
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee.
 * - Regola 02: Single responsibility, nessun numero magico.
 * - Regola R1: Zero any, TypeScript strict.
 */

// Pattern di debug da rimuovere dalle fonti scientifiche (supporta parentesi tonde e quadre, cosine similarity, score, ecc.)
const RAG_DEBUG_SCORE_PATTERN = /[\[\(]?\s*\b(?:similarity\s+score|cosine\s+similarity|similarity|rag\s+score|score)\s*:\s*[\d.]+\s*[\]\)]?/gi;
const RAG_PREFIX_PATTERN = /^\s*(?:\[\s*RAG\s*\]\s*|(?:\b(?:Evidenza\s+RAG|Fonte\s+RAG|RAG\s+Evidence|RAG|Evidenza)\s*:\s*))/gi;
const DOC_EXT_PATTERN = /\.(?:docx|pdf|txt|md|doc|rtf)\b/gi;
const MULTI_SPACE_PATTERN = /\s{2,}/g;
const LEADING_TRAILING_PUNCT_PATTERN = /^[-:,;\[\]\s]+|[-:,;\[\]\s]+$/g;

/**
 * Pulisce una singola citazione bibliografica rimuovendo artefatti di debug RAG.
 *
 * @param rawCitation - Stringa grezza della fonte o citazione
 * @returns Citazione sanitizzata e pulita in veste editoriale
 */
export function cleanCitation(rawCitation: string): string {
  if (!rawCitation || typeof rawCitation !== 'string') {
    return '';
  }

  let cleaned = rawCitation
    .replace(RAG_DEBUG_SCORE_PATTERN, '')
    .replace(RAG_PREFIX_PATTERN, '')
    .replace(DOC_EXT_PATTERN, '');

  // Se la stringa contiene trattini bassi (es. nome file tipo 400_METRI_PIANI), converti in spazi
  if (cleaned.includes('_')) {
    cleaned = cleaned.replace(/_/g, ' ');
  }

  cleaned = cleaned
    .replace(MULTI_SPACE_PATTERN, ' ')
    .trim()
    .replace(LEADING_TRAILING_PUNCT_PATTERN, '')
    .trim();

  return cleaned;
}

/**
 * Sanitizza un array di citazioni, eliminando duplicati e stringhe vuote.
 *
 * @param citations - Array di citazioni grezze
 * @returns Array ordinato di citazioni uniche e pulite
 */
export function cleanCitationList(citations: string[]): string[] {
  if (!Array.isArray(citations)) {
    return [];
  }

  const cleanedSet = new Set<string>();

  for (const item of citations) {
    const cleaned = cleanCitation(item);
    if (cleaned.length > 0) {
      cleanedSet.add(cleaned);
    }
  }

  return Array.from(cleanedSet);
}
