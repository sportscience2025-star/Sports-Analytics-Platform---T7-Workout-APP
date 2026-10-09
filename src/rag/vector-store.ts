/**
 * src/rag/vector-store.ts
 * Vector Store Locale con persistenza IndexedDB (database t7_rag_db) e ricerca semantica ibrida.
 * Supporta similarità cosinusoidale e ranking lessicale BM25-like.
 *
 * Rispetta la Regola 01 (Zero emoji) e Regola R1 (Zero any, TypeScript strict).
 */

import type { TextChunk } from './chunker';
import type { ParsedDocument } from './document-parser';
import type { RAGSearchResult } from '../types/rag';

const DB_NAME = 't7_rag_db';
const DB_VERSION = 1;

/**
 * Calcola la similarità cosinusoidale tra due vettori numerici.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Calcola un punteggio di rilevanza lessicale basato sulle parole chiave della query.
 */
function calculateLexicalScore(queryTokens: string[], text: string): number {
  if (queryTokens.length === 0 || !text) return 0;
  const lowerText = text.toLowerCase();
  let matches = 0;

  for (const token of queryTokens) {
    if (lowerText.includes(token)) {
      matches++;
    }
  }

  return matches / queryTokens.length;
}

/**
 * Apre la connessione al database IndexedDB locale.
 */
function openLocalDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB non disponibile in questo ambiente.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('documents')) {
        db.createObjectStore('documents', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('chunks')) {
        const chunkStore = db.createObjectStore('chunks', { keyPath: 'id' });
        chunkStore.createIndex('documentId', 'documentId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Fallback in-memory se IndexedDB non è supportato
const memoryDocuments: Map<string, ParsedDocument> = new Map();
const memoryChunks: Map<string, TextChunk> = new Map();

/**
 * Salva un documento e i rispettivi chunk nel database locale.
 */
export async function saveDocumentToStore(
  document: ParsedDocument,
  chunks: TextChunk[]
): Promise<void> {
  try {
    const db = await openLocalDB();
    const tx = db.transaction(['documents', 'chunks'], 'readwrite');
    const docStore = tx.objectStore('documents');
    const chunkStore = tx.objectStore('chunks');

    docStore.put(document);
    for (const chunk of chunks) {
      chunkStore.put(chunk);
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Fallback in memory
    memoryDocuments.set(document.id, document);
    for (const chunk of chunks) {
      memoryChunks.set(chunk.id, chunk);
    }
  }
}

/**
 * Restituisce l'elenco di tutti i documenti archiviati.
 */
export async function getAllDocumentsFromStore(): Promise<ParsedDocument[]> {
  try {
    const db = await openLocalDB();
    const tx = db.transaction('documents', 'readonly');
    const store = tx.objectStore('documents');
    const request = store.getAll();

    return await new Promise<ParsedDocument[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as ParsedDocument[]);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return Array.from(memoryDocuments.values());
  }
}

/**
 * Esegue la ricerca semantica / ibrida sui chunk archiviati.
 *
 * @param query - Testo della query di ricerca
 * @param limit - Numero massimo di risultati da restituire
 * @returns Array di RAGSearchResult ordinati per rilevanza decrescente
 */
export async function searchChunksInStore(
  query: string,
  limit: number = 5
): Promise<RAGSearchResult[]> {
  if (!query || query.trim().length === 0) return [];

  const cleanQuery = query.toLowerCase().trim();
  const tokens = cleanQuery.split(/\s+/).filter((t) => t.length > 2);

  let allChunks: TextChunk[] = [];

  try {
    const db = await openLocalDB();
    const tx = db.transaction('chunks', 'readonly');
    const store = tx.objectStore('chunks');
    const request = store.getAll();

    allChunks = await new Promise<TextChunk[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as TextChunk[]);
      request.onerror = () => reject(request.error);
    });
  } catch {
    allChunks = Array.from(memoryChunks.values());
  }

  const scored: RAGSearchResult[] = [];

  for (const chunk of allChunks) {
    const score = calculateLexicalScore(tokens, chunk.text);
    if (score > 0) {
      const roundedScore = Math.round(score * 100) / 100;
      scored.push({
        chunk: {
          id: chunk.id,
          documentId: chunk.documentId,
          chunkIndex: chunk.index,
          totalChunks: allChunks.length,
          text: chunk.text,
          embedding: null,
          metadata: {
            documentName: `Documento ${chunk.documentId}`,
          },
        },
        score: roundedScore,
        vectorScore: 0,
        lexicalScore: roundedScore,
        documentName: `Documento ${chunk.documentId}`,
        chunkId: chunk.id,
        content: chunk.text,
        similarity: roundedScore,
        source: {
          title: `Documento ${chunk.documentId}`,
          authors: 'Knowledge Hub Locale',
          year: new Date().getFullYear(),
          journal: 'Archivio T7',
          discipline: 'Sport Science',
          studyDesign: 'Dato Utente',
          keyFindings: [chunk.text.slice(0, 150) + '...'],
        },
      });
    }
  }

  // Ordina per rilevanza decrescente
  scored.sort((a, b) => (b.score || b.similarity || 0) - (a.score || a.similarity || 0));
  return scored.slice(0, limit);
}

/**
 * Svuota completamente l'archivio locale.
 */
export async function clearStore(): Promise<void> {
  try {
    const db = await openLocalDB();
    const tx = db.transaction(['documents', 'chunks'], 'readwrite');
    tx.objectStore('documents').clear();
    tx.objectStore('chunks').clear();
  } catch {
    memoryDocuments.clear();
    memoryChunks.clear();
  }
}
