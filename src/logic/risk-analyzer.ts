/**
 * src/logic/risk-analyzer.ts
 * Motore di Analisi del Rischio Clinico e Classificazione di Sicurezza degli Esercizi.
 *
 * Conforme a:
 * - Regola R1: Zero any, tipizzazione TypeScript strict con interfacce da src/types/clinical.ts.
 * - Regola R2: Interfacce condivise.
 * - Regola 01: Zero emoji spontanee nei log e note.
 * - Costanti in MAIUSCOLO.
 */

import type {
  ClinicalCondition,
  ClinicalCategory,
  ClinicalRiskLevel,
  RiskAnalysisProfile
} from '../types/clinical';
import type { Exercise } from '../types/exercise';
import { clinicalConditions } from '../data/conditions';

// ============================================================================
// COSTANTI DI VALUTAZIONE DEL RISCHIO E SOGLIE
// ============================================================================

export const HIGH_RISK_WEIGHT = 3;
export const MEDIUM_RISK_WEIGHT = 2;
export const LOW_RISK_WEIGHT = 1;

export const COMORBIDITY_THRESHOLD = 2;
export const DEFAULT_HIGH_THRESHOLD = 4;
export const DEFAULT_MEDIUM_THRESHOLD = 2;

export const CRITICAL_CATEGORIES: readonly ClinicalCategory[] = [
  'neurologiche',
  'post_chirurgiche',
  'speciali'
] as const;

export const SEMI_CRITICAL_CATEGORIES: readonly ClinicalCategory[] = [
  'sistemiche',
  'reumatologiche'
] as const;

export interface ClassifiedExerciseCollection {
  excluded: Array<Exercise & { reason: string }>;
  adapted: Array<Exercise & { modification: string }>;
  available: Exercise[];
}

/**
 * Confronta un esercizio con un pattern di esclusione/adattamento clinico.
 */
export function matchesExerciseRule(exercise: Exercise, rulePattern: string): boolean {
  if (!rulePattern || rulePattern === 'General' || rulePattern.trim().length === 0) {
    return true;
  }
  const normalize = (str: string): string => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const searchCorpus = `${exercise.name} ${exercise.type} ${exercise.primaryMuscle} ${(exercise.tags ?? []).join(' ')}`;
  return normalize(searchCorpus).includes(normalize(rulePattern));
}

/**
 * Calcola il profilo di rischio clinico pesato, identificando comorbilità
 * e categorie critiche di salute.
 */
export function analyzeRiskProfile(
  selectedConditions: Array<string | ClinicalCondition>,
  allConditions: ClinicalCondition[] = clinicalConditions
): RiskAnalysisProfile {
  if (!Array.isArray(selectedConditions) || selectedConditions.length === 0) {
    return {
      score: 0,
      level: 'low',
      activePathologyCount: 0,
      criticalCategoryPresent: false,
      comorbidityBonusApplied: false,
      notes: []
    };
  }

  // Normalizza gli ID selezionati
  const idSet = new Set<string>();
  for (const item of selectedConditions) {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (trimmed.length > 0) idSet.add(trimmed);
    } else if (item && typeof item === 'object' && typeof item.id === 'string') {
      const trimmed = item.id.trim();
      if (trimmed.length > 0) idSet.add(trimmed);
    }
  }

  // Risolve le patologie uniche attive
  const activePathologies: ClinicalCondition[] = [];
  const seenIds = new Set<string>();
  for (const cond of allConditions) {
    const normId = cond.id.trim();
    if (idSet.has(normId) && !seenIds.has(normId)) {
      seenIds.add(normId);
      activePathologies.push(cond);
    }
  }

  if (activePathologies.length === 0) {
    return {
      score: 0,
      level: 'low',
      activePathologyCount: 0,
      criticalCategoryPresent: false,
      comorbidityBonusApplied: false,
      notes: []
    };
  }

  let riskScore = 0;
  let hasHighRiskPathology = false;
  let criticalCategoryPresent = false;

  for (const p of activePathologies) {
    const riskLvl = p.riskLevel.toLowerCase().trim();
    let weight = LOW_RISK_WEIGHT;
    if (riskLvl === 'high') {
      weight = HIGH_RISK_WEIGHT;
      hasHighRiskPathology = true;
    } else if (riskLvl === 'medium') {
      weight = MEDIUM_RISK_WEIGHT;
    }
    riskScore += weight;

    const cat = p.category.toLowerCase().trim() as ClinicalCategory;
    if (CRITICAL_CATEGORIES.includes(cat)) {
      criticalCategoryPresent = true;
    } else if (SEMI_CRITICAL_CATEGORIES.includes(cat) && riskLvl !== 'low') {
      criticalCategoryPresent = true;
    }
  }

  // Bonus Comorbilità: +1 score per ogni categoria con 2 o più patologie attive
  const categoryCounts: Record<string, number> = {};
  for (const p of activePathologies) {
    const cat = p.category.toLowerCase().trim();
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  let comorbidityBonusApplied = false;
  for (const cat in categoryCounts) {
    if (categoryCounts[cat] >= COMORBIDITY_THRESHOLD) {
      riskScore += 1;
      comorbidityBonusApplied = true;
    }
  }

  // Determinazione del livello di rischio complessivo
  let level: ClinicalRiskLevel = 'low';
  if (hasHighRiskPathology || criticalCategoryPresent || riskScore >= DEFAULT_HIGH_THRESHOLD) {
    level = 'high';
  } else if (riskScore >= DEFAULT_MEDIUM_THRESHOLD) {
    level = 'medium';
  } else {
    level = 'low';
  }

  const notes = activePathologies.map(
    (p) => `${p.name}: ${p.description}`
  );

  return {
    score: riskScore,
    level,
    activePathologyCount: activePathologies.length,
    criticalCategoryPresent,
    comorbidityBonusApplied,
    notes
  };
}

/**
 * Classifica gli esercizi rispetto alle esclusioni e agli adattamenti delle patologie attive.
 */
export function classifyExercises(
  exercises: Exercise[],
  activeConditions: ClinicalCondition[]
): ClassifiedExerciseCollection {
  const result: ClassifiedExerciseCollection = {
    excluded: [],
    adapted: [],
    available: []
  };

  for (const ex of exercises) {
    let status: 'AVAILABLE' | 'ADAPTED' | 'EXCLUDED' = 'AVAILABLE';
    const exclusionReasons: string[] = [];
    const adaptationNotes: string[] = [];

    for (const cond of activeConditions) {
      if (cond.exclusions && cond.exclusions.some((pattern) => matchesExerciseRule(ex, pattern))) {
        status = 'EXCLUDED';
        exclusionReasons.push(`${cond.name}: Escluso`);
        break;
      }

      if (cond.adaptations) {
        for (const adapt of cond.adaptations) {
          if (matchesExerciseRule(ex, adapt.pattern)) {
            status = 'ADAPTED';
            adaptationNotes.push(`${cond.name}: ${adapt.modification}`);
          }
        }
      }
    }

    if (status === 'EXCLUDED') {
      result.excluded.push({ ...ex, reason: exclusionReasons.join(', ') });
    } else if (status === 'ADAPTED') {
      result.adapted.push({ ...ex, modification: adaptationNotes.join('; ') });
    } else {
      result.available.push(ex);
    }
  }

  return result;
}
