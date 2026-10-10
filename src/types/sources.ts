/**
 * src/types/sources.ts
 * Interfacce condivise per il modulo Libreria Fonti Scientifiche.
 * Rispetta la Regola R1 (Strict TypeScript, zero any).
 */

export type ScientificArea =
  | 'Biomeccanica'
  | 'Fisiologia'
  | 'VBT'
  | 'Atletica'
  | 'Atletica Leggera'
  | 'Sollevamento Pesi'
  | 'Clinico'
  | 'Sport di Squadra'
  | 'Riabilitazione'
  | 'Nutrizione Sportiva'
  | 'Prevenzione Infortuni'
  | 'Psicologia dello Sport'
  | 'Sport Individuali';

export interface ScientificPaper {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  area: string;
  abstract: string;
  keyFindings: string[];
  practicalTakeaways?: string[];
  url: string;
  doi?: string;
  studyType?: string;
}
