/**
 * src/logic/scientific-sources-matcher.ts
 * Motore di matching semantico e tassonomico per l'estrazione di evidenze scientifiche peer-reviewed
 * dal database delle 322 fonti (scientificSources) in base ai parametri individuali dell'atleta/paziente.
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee.
 * - Regola 02: Single responsibility, costanti in MAIUSCOLO e commenti chiari.
 * - Regola R1: Strict TypeScript, zero any.
 */

import { scientificSources } from '../data/sources';
import type { ScientificEvidenceCard } from '../types/program';

const MAX_MATCHED_SOURCES = 6;
const DEFAULT_ABSTRACT_FALLBACK =
  'Evidenza scientifica accreditata sui meccanismi di adattamento neuromuscolare e dosaggio del carico.';

export interface MatchSourcesParams {
  isClinical: boolean;
  sport: string;
  goal: string;
  level: string;
  injuries?: string[];
}

/**
 * Seleziona deterministicamente le pubblicazioni scientifiche pertinenti per l'atleta.
 *
 * @param params - Parametri di profilazione dell'atleta/paziente
 * @returns Array di card scientifiche con metadati, takeaway applicativo e link PubMed
 */
export function selectMatchingScientificSources(params: MatchSourcesParams): ScientificEvidenceCard[] {
  const sportLower = (params.sport || '').toLowerCase();
  const goalLower = (params.goal || '').toLowerCase();
  const currentType = params.isClinical ? 'Clinico' : 'Atleta';
  const injuries = params.injuries || [];

  const matched: ScientificEvidenceCard[] = [];

  for (const source of scientificSources) {
    if (matched.length >= MAX_MATCHED_SOURCES) break;

    const rules = source.rules;
    let isMatch = true;

    if (rules) {
      // 1. Filtro Tipo Soggetto
      if (rules.patientTypes && rules.patientTypes.length > 0) {
        if (!rules.patientTypes.includes(currentType)) {
          isMatch = false;
        }
      }

      // 2. Filtro Sport
      if (isMatch && rules.sports && rules.sports.length > 0) {
        const matchesSport = rules.sports.some((s) => {
          const sLower = s.toLowerCase();
          return (
            sportLower.includes(sLower) ||
            sLower.includes(sportLower) ||
            (sportLower.includes('powerlifting') && sLower.includes('sollevamento')) ||
            (sportLower.includes('corsa') && sLower.includes('atletica'))
          );
        });
        if (!matchesSport && !sportLower.includes('generale')) {
          isMatch = false;
        }
      }

      // 3. Filtro Obiettivo
      if (isMatch && rules.goals && rules.goals.length > 0) {
        const matchesGoal = rules.goals.some((g) => {
          const gLower = g.toLowerCase();
          return (
            goalLower.includes(gLower) ||
            gLower.includes(goalLower) ||
            (goalLower.includes('forza') && gLower.includes('strength')) ||
            (goalLower.includes('ipertrofia') && gLower.includes('hypertrophy')) ||
            (goalLower.includes('potenza') && gLower.includes('power'))
          );
        });
        if (!matchesGoal) {
          isMatch = false;
        }
      }

      // 4. Filtro Patologie Cliniche (se attive)
      if (isMatch && rules.injuries && rules.injuries.length > 0) {
        const hasInjury = injuries.some((inj) => rules.injuries?.includes(inj));
        if (!hasInjury) {
          isMatch = false;
        }
      }
    }

    if (isMatch) {
      matched.push({
        id: source.id,
        category: source.area,
        title: source.title,
        authors: source.authors,
        journal: source.journal,
        year: source.year,
        takeaway: source.abstract || DEFAULT_ABSTRACT_FALLBACK,
        url: source.url,
      });
    }
  }

  // Se non sono state trovate abbastanza fonti specifiche, inserisci fonti cardine di periodizzazione e VBT
  if (matched.length < 3) {
    const fallbackIds = ['sci_sprint_morin_2011', 'sci_hypertrophy_schoenfeld_2010', 'sci_vbt_gonzalez_2017'];
    for (const fbId of fallbackIds) {
      if (matched.length >= MAX_MATCHED_SOURCES) break;
      const found = scientificSources.find((s) => s.id === fbId);
      if (found && !matched.some((m) => m.id === found.id)) {
        matched.push({
          id: found.id,
          category: found.area,
          title: found.title,
          authors: found.authors,
          journal: found.journal,
          year: found.year,
          takeaway: found.abstract || DEFAULT_ABSTRACT_FALLBACK,
          url: found.url,
        });
      }
    }
  }

  return matched;
}
