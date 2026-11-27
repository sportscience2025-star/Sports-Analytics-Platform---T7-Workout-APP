/**
 * src/context/index.ts
 * Barrel file per tutti i React Context globali della piattaforma T7 Workout.
 *
 * Nota sulle esportazioni AthleteContext:
 * - Questo barrel espone `AthleteProvider` e il hook grezzo `useAthleteRawContext`.
 * - Il hook ergonomico con scorciatoie UI `useAthleteContext` e esportato in `src/hooks/useAthleteContext.ts`
 *   per evitare collisioni di nome nei barrel import.
 *
 * Conforme a Regola 02 (un file = una responsabilita, barrel exports ordinati).
 */

export * from './TierContext';
export * from './AthleteContext';
export * from './BleContext';
