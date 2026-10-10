/**
 * src/rag/document-parser.ts
 * Parser ed estrattore di testo per documenti caricati nel Knowledge Hub locale.
 * Supporta formati di testo strutturato (.txt, .md, .csv, .tsv, .json).
 *
 * Rispetta la Regola 01 (Zero emoji) e Regola R1 (Zero any, TypeScript strict).
 */

import ExcelJS from 'exceljs';

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
 *
 * @param text - Stringa di testo grezza
 * @returns Testo normalizzato e pulito
 */
function cleanExtractedText(text: string): string {
  if (!text) return '';
  return text.replace(/\0/g, '').replace(/\r\n/g, '\n').trim();
}

/**
 * Converte il contenuto testuale di un file in un oggetto ParsedDocument.
 *
 * @param content - Stringa di testo del file
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
 * Estrae il contenuto testuale da un foglio Excel (.xlsx/.xls) tramite ExcelJS.
 *
 * @param buffer - Buffer binario del file Excel
 * @returns Testo strutturato estratto da tutti i fogli di lavoro
 */
export async function extractTextFromExcelBuffer(buffer: ArrayBuffer): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const textParts: string[] = [];

  workbook.eachSheet((worksheet) => {
    textParts.push(`--- Foglio: ${worksheet.name} ---`);
    worksheet.eachRow((row) => {
      const values: string[] = [];
      row.eachCell({ includeEmpty: false }, (cell) => {
        let valStr = '';
        if (cell.value !== null && cell.value !== undefined) {
          if (typeof cell.value === 'object') {
            if ('result' in cell.value && cell.value.result !== undefined) {
              valStr = String(cell.value.result);
            } else if ('text' in cell.value && typeof cell.value.text === 'string') {
              valStr = cell.value.text;
            } else {
              valStr = JSON.stringify(cell.value);
            }
          } else {
            valStr = String(cell.value);
          }
        }
        if (valStr.trim()) {
          values.push(valStr.trim());
        }
      });
      if (values.length > 0) {
        textParts.push(values.join(' | '));
      }
    });
    textParts.push('');
  });

  return textParts.join('\n');
}

/**
 * Legge un oggetto File nativo del browser ed estrae il testo, supportando file Excel (.xlsx/.xls) e file testuali.
 *
 * @param file - File selezionato tramite input HTML
 * @returns Promessa che restituisce il ParsedDocument
 */
export async function parseUploadedFile(file: File): Promise<ParsedDocument> {
  const fileNameLower = file.name.toLowerCase();
  let text = '';
  if (fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls')) {
    const buffer = await file.arrayBuffer();
    text = await extractTextFromExcelBuffer(buffer);
  } else {
    text = await file.text();
  }
  return parseTextDocument(text, file.name);
}
