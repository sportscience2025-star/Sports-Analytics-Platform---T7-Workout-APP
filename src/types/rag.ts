/**
 * src/types/rag.ts
 * Interfacce condivise per il Knowledge Hub, le Fonti Scientifiche e il RAG in-browser.
 * Rispetta la Regola R1 (Divieto di any) e Regola R2 (Interfacce condivise).
 */

export interface ScientificSourceRules {
  patientTypes?: string[];
  sports?: string[];
  goals?: string[];
  injuries?: string[];
}

export interface ScientificSource {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  area: string;
  abstract: string;
  url: string;
  rules?: ScientificSourceRules;
  studyType?: string;
}

export interface DocumentChunk {
  id?: number | string;
  documentId: string;
  chunkIndex: number;
  totalChunks: number;
  text: string;
  embedding: number[] | null;
  metadata?: {
    documentName: string;
    sectionTitle?: string;
    pageNumber?: number;
  };
}

export interface RAGSearchResult {
  chunk: DocumentChunk;
  score: number;
  vectorScore: number;
  lexicalScore: number;
  documentName: string;
  highlightedText?: string;
  chunkId?: string;
  content?: string;
  similarity?: number;
  source?: {
    title: string;
    authors: string;
    year: number;
    journal: string;
    discipline: string;
    studyDesign: string;
    keyFindings: string[];
  };
}

export interface ExecutiveSummary {
  overviewText: string;
  physiologicalMechanisms: string[];
  practicalTakeaways: string[];
  extractedMetrics: Array<{ label: string; value: string }>;
  sourceCount: number;
}

export interface RagDocument {
  id: string;
  name: string;
  sizeBytes: number;
  tokenCount: number;
  uploadedAt: string;
  status: 'processing' | 'ready' | 'error';
  fileType: 'pdf' | 'docx' | 'xlsx' | 'txt' | 'csv' | 'md' | 'json';
  rawText: string;
  chunksCount: number;
}

