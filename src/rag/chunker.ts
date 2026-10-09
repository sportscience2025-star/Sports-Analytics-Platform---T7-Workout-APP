/**
 * src/rag/chunker.ts
 * Algoritmo di Chunking Semantico con sliding window e rispetto dei confini frasali.
 * Conforme alle linee guida Anthropic Contextual Retrieval e OpenAI embeddings.
 *
 * Rispetta la Regola 01 (Zero emoji) e Regola R1 (Zero any, TypeScript strict).
 */

export interface TextChunk {
  id: string;
  documentId: string;
  text: string;
  index: number;
  charStart: number;
  charEnd: number;
  tokenEstimate: number;
}

const DEFAULT_CHUNK_SIZE_CHARS = 1000;
const DEFAULT_OVERLAP_CHARS = 150;
const CHARS_PER_TOKEN_ESTIMATE = 4.0;

/**
 * Divide un testo in chunk semantici rispettando paragrafi, frasi e parole.
 *
 * @param text - Testo sorgente completo da suddividere
 * @param documentId - Identificativo univoco del documento padre
 * @param chunkSize - Dimensione massima consigliata del chunk in caratteri
 * @param overlap - Sovrapposizione in caratteri tra chunk consecutivi
 * @returns Array di TextChunk strutturati e tipizzati
 */
export function chunkText(
  text: string,
  documentId: string,
  chunkSize: number = DEFAULT_CHUNK_SIZE_CHARS,
  overlap: number = DEFAULT_OVERLAP_CHARS
): TextChunk[] {
  if (!text || typeof text !== 'string') return [];

  const actualChunkSize = Math.max(100, chunkSize);
  const actualOverlap = Math.max(0, Math.min(overlap, actualChunkSize - 1));

  const separators = ['\n\n', '\n', '. ', '? ', '! ', ' '];

  function splitRecursive(block: string, sepIndex: number): string[] {
    if (sepIndex >= separators.length) {
      const pieces: string[] = [];
      for (let i = 0; i < block.length; i += actualChunkSize) {
        pieces.push(block.substring(i, i + actualChunkSize));
      }
      return pieces;
    }

    const sep = separators[sepIndex];
    const parts = block.split(sep);
    const units: string[] = [];

    for (let i = 0; i < parts.length; i++) {
      let part = parts[i];
      if (part === '') continue;

      if (i < parts.length - 1) {
        part += sep;
      }

      if (part.length <= actualChunkSize) {
        units.push(part);
      } else {
        units.push(...splitRecursive(part, sepIndex + 1));
      }
    }
    return units;
  }

  const units = splitRecursive(text, 0);
  if (units.length === 0) return [];

  const chunks: TextChunk[] = [];
  let startIdx = 0;
  let charCounter = 0;

  while (startIdx < units.length) {
    let currentChunk = '';
    let endIdx = startIdx;

    while (endIdx < units.length && (currentChunk + units[endIdx]).length <= actualChunkSize) {
      currentChunk += units[endIdx];
      endIdx++;
    }

    if (endIdx === startIdx) {
      currentChunk = units[startIdx];
      endIdx = startIdx + 1;
    }

    const trimmed = currentChunk.trim();
    if (trimmed.length > 0) {
      const charStart = charCounter;
      const charEnd = charStart + trimmed.length;

      chunks.push({
        id: `${documentId}_chunk_${chunks.length}`,
        documentId,
        text: trimmed,
        index: chunks.length,
        charStart,
        charEnd,
        tokenEstimate: Math.round(trimmed.length / CHARS_PER_TOKEN_ESTIMATE),
      });

      charCounter = charEnd;
    }

    if (endIdx >= units.length) {
      break;
    }

    let overlapLength = 0;
    let nextStartIdx = endIdx;

    for (let j = endIdx - 1; j >= startIdx; j--) {
      if (overlapLength + units[j].length <= actualOverlap) {
        overlapLength += units[j].length;
        nextStartIdx = j;
      } else {
        break;
      }
    }

    if (nextStartIdx <= startIdx) {
      startIdx = startIdx + 1;
    } else {
      startIdx = nextStartIdx;
    }
  }

  return chunks;
}
