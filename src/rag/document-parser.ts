/**
 * src/rag/document-parser.ts
 * Parser ed estrattore di testo per documenti caricati nel Knowledge Hub locale.
 * Supporta formati di testo strutturato (.txt, .md, .csv, .tsv, .json).
 *
 * Rispetta la Regola 01 (Zero emoji) e Regola R1 (Zero any, TypeScript strict).
 */

export interface ParsedDocument {
  id: string;
  fileName: string;
  fileType: string;
  title: string;
  rawText: string;
  charCount: number;
  lineCount: number;
  uploadedAt: string;
}

/**
 * Pulisce il testo rimuovendo caratteri nulli e normalizzando i ritorni a capo.
 */
function cleanExtractedText(text: string): string {
  if (!text) return '';
  return text.replace(/\0/g, '').replace(/\r\n/g, '\n').trim();
}

/**
 * Converte il contenuto testuale di un file in un oggetto ParsedDocument.
 *
 * @param content - Stringa o ArrayBuffer del file
 * @param fileName - Nome del file caricato
 * @returns Oggetto ParsedDocument con metadati
 */
export function parseTextDocument(content: string, fileName: string = 'documento.txt'): ParsedDocument {
  const clean = cleanExtractedText(content);
  const lines = clean.split('\n');
  const fileExtension = (fileName.split('.').pop() || 'txt').toLowerCase();
  const title = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');

  return {
    id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    fileName,
    fileType: fileExtension,
    title,
    rawText: clean,
    charCount: clean.length,
    lineCount: lines.length,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Legge un oggetto File nativo del browser e ne estrae il testo.
 *
 * @param file - File selezionato tramite input HTML
 * @returns Promessa che restituisce il ParsedDocument
 */
export async function parseUploadedFile(file: File): Promise<ParsedDocument> {
  const text = await file.text();
  return parseTextDocument(text, file.name);
}
