/**
 * src/rag/rag-worker.ts
 * Gestore dell'elaborazione asincrona in background per la pipeline RAG.
 * Coordina parsing, chunking e indicizzazione senza bloccare il thread principale della UI.
 *
 * Rispetta la Regola 01 (Zero emoji) e Regola R1 (Zero any, TypeScript strict).
 */

import { chunkText, type TextChunk } from './chunker';
import { parseTextDocument, type ParsedDocument } from './document-parser';
import { saveDocumentToStore, searchChunksInStore } from './vector-store';
import type { RAGSearchResult } from '../types/rag';

export interface IngestDocumentRequest {
  content: string;
  fileName: string;
  chunkSize?: number;
  overlap?: number;
}

export interface IngestDocumentResponse {
  document: ParsedDocument;
  chunksCount: number;
}

/**
 * Esegue l'ingestion completa di un documento: estrazione testo, chunking semantico e salvataggio nel vector store.
 *
 * @param request - Dati del documento da indicizzare
 * @returns Risposta con documento e conteggio chunk
 */
export async function ingestDocumentAsync(
  request: IngestDocumentRequest
): Promise<IngestDocumentResponse> {
  const document = parseTextDocument(request.content, request.fileName);
  const chunks: TextChunk[] = chunkText(
    document.rawText,
    document.id,
    request.chunkSize,
    request.overlap
  );

  await saveDocumentToStore(document, chunks);

  return {
    document,
    chunksCount: chunks.length,
  };
}

/**
 * Esegue la query di ricerca e retrieval nel vector store locale.
 *
 * @param query - Stringa di ricerca
 * @param limit - Numero massimo di risultati
 * @returns Array di risultati ordinati per similarità
 */
export async function queryRAGAsync(
  query: string,
  limit: number = 5
): Promise<RAGSearchResult[]> {
  return await searchChunksInStore(query, limit);
}
