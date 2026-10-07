/**
 * src/types/clinical.ts
 * Interfacce condivise per il dominio Clinico e Valutazione del Rischio.
 * Rispetta la Regola R1 (Divieto di any) e Regola R2 (Interfacce condivise).
 */

export type ClinicalRiskLevel = 'low' | 'medium' | 'high';

export type ClinicalCategory =
  | 'arti_inferiori'
  | 'sistemiche'
  | 'colonna'
  | 'arti_superiori'
  | 'neurologiche'
  | 'post_chirurgiche'
  | 'speciali'
  | 'altri_distretti'
  | 'reumatologiche';

export interface ClinicalAdaptation {
  pattern: string;
  modification: string;
}

export interface ClinicalCondition {
  id: string;
  name: string;
  nameEn?: string;
  category: ClinicalCategory;
  description: string;
  icon?: string;
  riskLevel: ClinicalRiskLevel;
  exclusions: string[];
  adaptations: ClinicalAdaptation[];
}

export interface RiskAnalysisProfile {
  score: number;
  level: ClinicalRiskLevel;
  activePathologyCount: number;
  criticalCategoryPresent: boolean;
  comorbidityBonusApplied: boolean;
  notes: string[];
}
