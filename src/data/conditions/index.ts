/**
 * src/data/conditions/index.ts
 * Barrel file e aggregatore del Data Layer Condizioni Cliniche di T7 Workout Platform.
 * Esporta il catalogo unificato allConditions e funzioni di lookup/filtro pure.
 * Rispetta la Regola R1 (Zero any, TypeScript strict) e Regola R2 (Single Source of Truth).
 */

import type {
  ClinicalCategory,
  ClinicalCondition,
  ClinicalRiskLevel,
} from '../../types/clinical';
import { spineConditions, colonnaConditions } from './colonna';
import { upperLimbConditions, artiSuperioriConditions } from './arti-superiori';
import { lowerLimbConditions, artiInferioriConditions } from './arti-inferiori';
import { systemicConditions, sistemicheConditions } from './sistemiche';
import {
  neurologicalAndSpecialConditions,
  neurologicheSpecialiConditions,
} from './neurologiche-speciali';

// Esportazione dei sottomoduli tematici
export {
  spineConditions,
  colonnaConditions,
  upperLimbConditions,
  artiSuperioriConditions,
  lowerLimbConditions,
  artiInferioriConditions,
  systemicConditions,
  sistemicheConditions,
  neurologicalAndSpecialConditions,
  neurologicheSpecialiConditions,
};

/**
 * Catalogo globale aggregato di tutte le condizioni cliniche tipizzate del sistema.
 */
export const allConditions: ClinicalCondition[] = [
  ...spineConditions,
  ...upperLimbConditions,
  ...lowerLimbConditions,
  ...systemicConditions,
  ...neurologicalAndSpecialConditions,
];

/**
 * Alias retrocompatibile con la precedente nomenclatura.
 */
export const clinicalConditions: ClinicalCondition[] = allConditions;

/**
 * Costanti descrittive per prevenire numeri magici nelle funzioni di filtro e ricerca.
 */
const MIN_SEARCH_QUERY_LENGTH = 1;
const MATCH_NOT_FOUND_INDEX = -1;

/**
 * Mappa interna indicizzata per ID per garantire lookup a tempo costante O(1).
 */
const conditionsByIdMap: ReadonlyMap<string, ClinicalCondition> = new Map(
  allConditions.map((condition: ClinicalCondition) => [
    condition.id.toLowerCase(),
    condition,
  ])
);

/**
 * Restituisce l'array completo di tutte le condizioni cliniche tipizzate a catalogo.
 *
 * @returns Array contenente tutte le condizioni cliniche aggregate.
 *
 * @example
 * ```ts
 * const conditions = getAllConditions();
 * console.log(conditions.length); // 119
 * ```
 */
export function getAllConditions(): ClinicalCondition[] {
  return allConditions;
}

/**
 * Cerca e restituisce una condizione clinica corrispondente all'identificatore univoco specificato.
 * Il confronto viene eseguito in modalità case-insensitive e ignora spaziature accidentali.
 *
 * @param id - Identificatore univoco della condizione clinica (es. 'cervical_pain', 'gonarthrosis')
 * @returns L'oggetto ClinicalCondition corrispondente se presente, altrimenti undefined.
 *
 * @example
 * ```ts
 * const cond = getConditionById('cervical_pain');
 * console.log(cond?.name); // 'Cervicalgia'
 * ```
 */
export function getConditionById(id: string): ClinicalCondition | undefined {
  if (!id || id.trim().length === 0) {
    return undefined;
  }
  const normalizedId = id.trim().toLowerCase();
  return conditionsByIdMap.get(normalizedId);
}

/**
 * Restituisce l'elenco di tutte le condizioni cliniche appartenenti alla categoria clinica specificata.
 *
 * @param category - Categoria clinica target (es. 'colonna', 'arti_inferiori', 'sistemiche', ecc.)
 * @returns Array di condizioni cliniche appartenenti alla categoria richiesta.
 *
 * @example
 * ```ts
 * const spineIssues = getConditionsByCategory('colonna');
 * ```
 */
export function getConditionsByCategory(
  category: ClinicalCategory
): ClinicalCondition[] {
  return allConditions.filter(
    (condition: ClinicalCondition) => condition.category === category
  );
}

/**
 * Restituisce l'elenco di tutte le condizioni cliniche caratterizzate dal livello di rischio specificato.
 *
 * @param risk - Livello di rischio clinico ('low' | 'medium' | 'high')
 * @returns Array di condizioni cliniche corrispondenti al livello di rischio indicato.
 *
 * @example
 * ```ts
 * const highRiskConditions = getConditionsByRisk('high');
 * ```
 */
export function getConditionsByRisk(
  risk: ClinicalRiskLevel
): ClinicalCondition[] {
  return allConditions.filter(
    (condition: ClinicalCondition) => condition.riskLevel === risk
  );
}

/**
 * Esegue una ricerca full-text multi-termine nel catalogo delle condizioni cliniche.
 * Ispeziona nome (italiano ed inglese), descrizione, esclusioni, adattamenti (pattern e modifiche) e categoria.
 * La corrispondenza richiede la presenza di tutti i token di ricerca (logica AND).
 *
 * @param query - Stringa di ricerca immessa dall'utente o dal sistema
 * @returns Array di condizioni cliniche corrispondenti a tutti i token della query. Restituisce array vuoto se query non valida.
 *
 * @example
 * ```ts
 * const results = searchConditions('spalla press');
 * ```
 */
export function searchConditions(query: string): ClinicalCondition[] {
  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery.length < MIN_SEARCH_QUERY_LENGTH) {
    return [];
  }

  const queryTokens = cleanQuery
    .split(/\s+/)
    .filter((token: string) => token.length > 0);

  if (queryTokens.length === 0) {
    return [];
  }

  return allConditions.filter((condition: ClinicalCondition) => {
    const adaptationsContent = condition.adaptations
      .map(
        (adaptation) => `${adaptation.pattern} ${adaptation.modification}`
      )
      .join(' ');

    const searchableContent = [
      condition.id,
      condition.name,
      condition.nameEn ?? '',
      condition.category,
      condition.description,
      condition.riskLevel,
      ...condition.exclusions,
      adaptationsContent,
    ]
      .join(' ')
      .toLowerCase();

    return queryTokens.every(
      (token: string) =>
        searchableContent.indexOf(token) !== MATCH_NOT_FOUND_INDEX
    );
  });
}
