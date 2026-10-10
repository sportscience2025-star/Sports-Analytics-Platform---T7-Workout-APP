/**
 * src/features/programming/ProgrammingView.tsx
 * Visualizzatore e Generatore di Programmazione & Macrocicli (Cockpit Dark Theme).
 *
 * Conforme a:
 * - Modulo 3: Header programma, razionale scientifico DUP/VBT con citazioni Rhea, Schoenfeld, Badillo;
 *             timeline 12 settimane su 6 fasi, navigazione tab fasi, griglia parametri seduta,
 *             riscaldamento, defaticamento e cardio, esportazione reale Excel (.xlsx) e PDF.
 * - Regola 01: Zero emoji spontanee.
 * - Regola 02: Zero numeri magici.
 * - Regola R1: Strict TypeScript, zero any.
 */

import React from 'react';
import { WorkoutWizardView } from '../../components/wizard/WorkoutWizardView';

/**
 * Componente principale della Programmazione & Macrocicli.
 */
export const ProgrammingView: React.FC = () => {
  return <WorkoutWizardView />;
};

export default ProgrammingView;
