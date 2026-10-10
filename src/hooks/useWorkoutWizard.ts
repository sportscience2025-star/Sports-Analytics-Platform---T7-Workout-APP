/**
 * src/hooks/useWorkoutWizard.ts
 * Custom Hook per la gestione dello stato reattivo del Workout Generator.
 *
 * Conforme a:
 * - Regola R3: Tutta la logica di calcolo, state management e reattivita e incapsulata nel hook.
 * - Regola R1: Zero any, tipizzazione con interfacce condivise.
 * - Regola 01: Zero emoji spontanee.
 */

import { useState, useMemo, useCallback } from 'react';
import type { PeriodizationMethod, WorkoutProgram } from '../types/program';
import type { RiskAnalysisProfile, ClinicalCondition, ClinicalCategory } from '../types/clinical';
import { clinicalConditions } from '../data/conditions';
import {
  analyzeRiskProfile,
  selectPeriodizationMethod,
  generateWorkoutProgram,
  PERIODIZATION_DETAILS,
  type PeriodizationDetail
} from '../logic';

export interface AthleteFormData {
  athleteName: string;
  patientType: 'Atleta' | 'Clinico' | 'Clinico_Anziano';
  level: 'Principiante' | 'Intermedio' | 'Avanzato';
  goal: 'Forza' | 'Ipertrofia' | 'Potenza' | 'Resistenza' | 'Definizione';
  sport: string;
  durationWeeks: number;
  daysPerWeek: number;
}

export interface UseWorkoutWizardReturn {
  // Form State & Setters
  formData: AthleteFormData;
  setAthleteName: (name: string) => void;
  setPatientType: (type: 'Atleta' | 'Clinico' | 'Clinico_Anziano') => void;
  setLevel: (level: 'Principiante' | 'Intermedio' | 'Avanzato') => void;
  setGoal: (goal: 'Forza' | 'Ipertrofia' | 'Potenza' | 'Resistenza' | 'Definizione') => void;
  setSport: (sport: string) => void;
  setDurationWeeks: (weeks: number) => void;
  setDaysPerWeek: (days: number) => void;

  // Clinical conditions selection
  selectedConditionIds: string[];
  selectedConditions: ClinicalCondition[];
  toggleCondition: (conditionId: string) => void;
  clearConditions: () => void;
  allConditions: ClinicalCondition[];
  categories: ClinicalCategory[];

  // Reactive clinical & periodization profile
  riskProfile: RiskAnalysisProfile;
  periodizationMethod: PeriodizationMethod;
  periodizationDetail: PeriodizationDetail;

  // Generated program
  program: WorkoutProgram | null;
  isGenerating: boolean;
  generateProgram: () => void;
  resetProgram: () => void;
  updateProgram: (updated: WorkoutProgram | ((prev: WorkoutProgram | null) => WorkoutProgram | null)) => void;
}

const INITIAL_FORM_DATA: AthleteFormData = {
  athleteName: 'Atleta Esempio',
  patientType: 'Atleta',
  level: 'Intermedio',
  goal: 'Forza',
  sport: 'Powerlifting & Preparazione Atletica',
  durationWeeks: 12,
  daysPerWeek: 3
};

export function useWorkoutWizard(): UseWorkoutWizardReturn {
  const [formData, setFormData] = useState<AthleteFormData>(INITIAL_FORM_DATA);
  const [selectedConditionIds, setSelectedConditionIds] = useState<string[]>([]);
  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Setters dedicati
  const setAthleteName = useCallback((athleteName: string) => {
    setFormData((prev) => ({ ...prev, athleteName }));
  }, []);

  const setPatientType = useCallback((patientType: 'Atleta' | 'Clinico' | 'Clinico_Anziano') => {
    setFormData((prev) => ({ ...prev, patientType }));
  }, []);

  const setLevel = useCallback((level: 'Principiante' | 'Intermedio' | 'Avanzato') => {
    setFormData((prev) => ({ ...prev, level }));
  }, []);

  const setGoal = useCallback((goal: 'Forza' | 'Ipertrofia' | 'Potenza' | 'Resistenza' | 'Definizione') => {
    setFormData((prev) => ({ ...prev, goal }));
  }, []);

  const setSport = useCallback((sport: string) => {
    setFormData((prev) => ({ ...prev, sport }));
  }, []);

  const setDurationWeeks = useCallback((durationWeeks: number) => {
    setFormData((prev) => ({ ...prev, durationWeeks }));
  }, []);

  const setDaysPerWeek = useCallback((daysPerWeek: number) => {
    setFormData((prev) => ({ ...prev, daysPerWeek }));
  }, []);

  // Gestione patologie cliniche
  const toggleCondition = useCallback((conditionId: string) => {
    setSelectedConditionIds((prev) => {
      const exists = prev.includes(conditionId);
      if (exists) {
        return prev.filter((id) => id !== conditionId);
      } else {
        return [...prev, conditionId];
      }
    });
  }, []);

  const clearConditions = useCallback(() => {
    setSelectedConditionIds([]);
  }, []);

  // Risolve gli oggetti patologia selezionati
  const selectedConditions = useMemo(() => {
    const idSet = new Set(selectedConditionIds);
    return clinicalConditions.filter((c) => idSet.has(c.id));
  }, [selectedConditionIds]);

  // Lista categorie uniche disponibili
  const categories = useMemo(() => {
    const set = new Set<ClinicalCategory>();
    clinicalConditions.forEach((c) => set.add(c.category));
    return Array.from(set);
  }, []);

  // Profilo di rischio calcolato reattivamente
  const riskProfile = useMemo(() => {
    return analyzeRiskProfile(selectedConditionIds, clinicalConditions);
  }, [selectedConditionIds]);

  // Metodo di periodizzazione calcolato reattivamente
  const periodizationMethod = useMemo<PeriodizationMethod>(() => {
    const effectivePatientType =
      selectedConditionIds.length > 0 || formData.patientType === 'Clinico' || formData.patientType === 'Clinico_Anziano'
        ? 'Clinico'
        : formData.patientType;

    return selectPeriodizationMethod({
      patientType: effectivePatientType,
      sport: formData.sport,
      level: formData.level,
      goal: formData.goal,
      weeks: formData.durationWeeks
    });
  }, [
    selectedConditionIds.length,
    formData.patientType,
    formData.sport,
    formData.level,
    formData.goal,
    formData.durationWeeks
  ]);

  const periodizationDetail = useMemo(() => {
    return PERIODIZATION_DETAILS[periodizationMethod];
  }, [periodizationMethod]);

  // Generazione del programma
  const generateProgram = useCallback(() => {
    setIsGenerating(true);

    const effectivePatientType =
      selectedConditionIds.length > 0 || formData.patientType === 'Clinico' || formData.patientType === 'Clinico_Anziano'
        ? 'Clinico'
        : formData.patientType;

    const generated = generateWorkoutProgram(
      {
        athleteName: formData.athleteName,
        patientType: effectivePatientType,
        sport: formData.sport,
        level: formData.level,
        goal: formData.goal,
        weeks: formData.durationWeeks,
        days: formData.daysPerWeek
      },
      riskProfile
    );

    setProgram(generated);
    setIsGenerating(false);
  }, [formData, riskProfile, selectedConditionIds.length]);

  const resetProgram = useCallback(() => {
    setProgram(null);
  }, []);

  const updateProgram = useCallback(
    (updated: WorkoutProgram | ((prev: WorkoutProgram | null) => WorkoutProgram | null)) => {
      setProgram(updated);
    },
    []
  );

  return {
    formData,
    setAthleteName,
    setPatientType,
    setLevel,
    setGoal,
    setSport,
    setDurationWeeks,
    setDaysPerWeek,

    selectedConditionIds,
    selectedConditions,
    toggleCondition,
    clearConditions,
    allConditions: clinicalConditions,
    categories,

    riskProfile,
    periodizationMethod,
    periodizationDetail,

    program,
    isGenerating,
    generateProgram,
    resetProgram,
    updateProgram
  };
}
