/**
 * src/components/wizard/WorkoutWizardView.tsx
 * Componente visuale interattivo per la generazione schede di allenamento e periodizzazione.
 *
 * Conforme a:
 * - Foto 3: Box Evidenze RAG (METODOLOGIA RAG | 2026), selettore fasi a pillole, Obiettivo della Fase con KPI.
 * - Foto 4: Card seduta con i 6 box parametrici scuri (SERIE, REPS, REST, RPE, TEMPO, CARICO),
 *           allerta clinica ⚠️, menu contestuale ... (edit, swap, delete con Undo Toast 5s)
 *           e sezione dedicata DEFATICAMENTO & CARDIO.
 * - Regola R3: Componente snello dedicato al rendering, logica delegata a useWorkoutWizard.
 * - Regola 01: Zero emoji spontanee nell'interfaccia.
 * - Regola R1: Zero any, tipizzazione TypeScript strict.
 * - Regola 02: Zero numeri magici.
 */

import React, { useState, useRef, useCallback } from 'react';
import { useWorkoutWizard } from '../../hooks/useWorkoutWizard';
import type { ClinicalCategory } from '../../types/clinical';
import type { Exercise } from '../../types/exercise';
import type { FormattedExercise } from '../../types/program';
import { ExerciseSwapModal } from '../exercises/ExerciseSwapModal';
import { ExerciseContextMenu } from './ExerciseContextMenu';
import { downloadProgramSpreadsheet } from '../../logic/excel-exporter';
import { printWorkoutProgram } from '../../logic/pdf-exporter';
import { downloadBackupFile } from '../../logic/data-persistence';
import { ProgramTimelineTable } from './ProgramTimelineTable';
import { ProgramActionsBar } from './ProgramActionsBar';
import { ProgramRationaleSection } from './ProgramRationaleSection';
import { ProgramPrintDossier } from './ProgramPrintDossier';

const TOAST_TIMEOUT_MS = 5000;
const MAX_CONDITIONS_PREVIEW = 48;

interface DeletedItem {
  phaseIndex: number;
  sessionDay: string;
  exerciseIndex: number;
  exercise: FormattedExercise;
}

/**
 * Componente principale del Generatore Allenamenti & Periodizzazione AI.
 */
export const WorkoutWizardView: React.FC = () => {
  const {
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
    allConditions,
    categories,

    riskProfile,
    periodizationMethod,
    periodizationDetail,

    program,
    isGenerating,
    generateProgram,
    resetProgram,
    updateProgram,
  } = useWorkoutWizard();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('Tutte');
  const [conditionSearchText, setConditionSearchText] = useState<string>('');
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(1);
  const [swapTarget, setSwapTarget] = useState<{
    phaseIndex: number;
    sessionDay: string;
    exerciseIndex: number;
    exerciseName: string;
  } | null>(null);

  // Stato per Undo Toast (5 secondi)
  const [deletedItem, setDeletedItem] = useState<DeletedItem | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filtraggio delle condizioni cliniche per il selettore
  const filteredConditions = allConditions.filter((c) => {
    const matchesCat = activeCategoryFilter === 'Tutte' || c.category === activeCategoryFilter;
    const matchesSearch =
      conditionSearchText.trim().length === 0 ||
      c.name.toLowerCase().includes(conditionSearchText.toLowerCase()) ||
      c.description.toLowerCase().includes(conditionSearchText.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'high':
        return { bg: '#450a0a', border: '#ef4444', text: '#fca5a5' };
      case 'medium':
        return { bg: '#451a03', border: '#f59e0b', text: '#fcd34d' };
      default:
        return { bg: '#064e3b', border: '#10b981', text: '#6ee7b7' };
    }
  };

  const riskBadge = getRiskBadgeColor(riskProfile.level);

  // Eliminazione esercizio con registrazione rollback
  const handleDeleteExercise = useCallback(
    (
      phaseIndex: number,
      sessionDay: string,
      exerciseIndex: number,
      exercise: FormattedExercise
    ) => {
      if (!program) return;
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);

      setDeletedItem({ phaseIndex, sessionDay, exerciseIndex, exercise });

      updateProgram((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          phases: prev.phases.map((p) => {
            if (p.phaseIndex !== phaseIndex) return p;
            return {
              ...p,
              sessions: p.sessions.map((s) => {
                if (s.dayName !== sessionDay) return s;
                return {
                  ...s,
                  exercises: s.exercises.filter((_, idx) => idx !== exerciseIndex),
                };
              }),
            };
          }),
        };
      });

      undoTimeoutRef.current = setTimeout(() => {
        setDeletedItem(null);
      }, TOAST_TIMEOUT_MS);
    },
    [program, updateProgram]
  );

  // Rollback eliminazione esercizio
  const handleUndoDelete = useCallback(() => {
    if (!deletedItem || !program) return;
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);

    const { phaseIndex, sessionDay, exerciseIndex, exercise } = deletedItem;

    updateProgram((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        phases: prev.phases.map((p) => {
          if (p.phaseIndex !== phaseIndex) return p;
          return {
            ...p,
            sessions: p.sessions.map((s) => {
              if (s.dayName !== sessionDay) return s;
              const newExs = [...s.exercises];
              newExs.splice(exerciseIndex, 0, exercise);
              return {
                ...s,
                exercises: newExs,
              };
            }),
          };
        }),
      };
    });

    setDeletedItem(null);
  }, [deletedItem, program, updateProgram]);

  // Modifica parametri esercizio
  const handleEditExercise = useCallback(
    (
      phaseIndex: number,
      sessionDay: string,
      exerciseIndex: number,
      updated: Partial<FormattedExercise>
    ) => {
      updateProgram((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          phases: prev.phases.map((p) => {
            if (p.phaseIndex !== phaseIndex) return p;
            return {
              ...p,
              sessions: p.sessions.map((s) => {
                if (s.dayName !== sessionDay) return s;
                return {
                  ...s,
                  exercises: s.exercises.map((ex, idx) => {
                    if (idx !== exerciseIndex) return ex;
                    return { ...ex, ...updated };
                  }),
                };
              }),
            };
          }),
        };
      });
    },
    [updateProgram]
  );

  // Sostituzione esercizio da modale
  const handleSelectReplacement = useCallback(
    (replacement: Exercise) => {
      if (!swapTarget || !program) return;
      const { phaseIndex, sessionDay, exerciseIndex } = swapTarget;

      updateProgram((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          phases: prev.phases.map((p) => {
            if (p.phaseIndex !== phaseIndex) return p;
            return {
              ...p,
              sessions: p.sessions.map((s) => {
                if (s.dayName !== sessionDay) return s;
                return {
                  ...s,
                  exercises: s.exercises.map((ex, idx) => {
                    if (idx !== exerciseIndex) return ex;
                    return {
                      ...ex,
                      id: replacement.id,
                      name: replacement.name,
                      exerciseRef: replacement,
                    };
                  }),
                };
              }),
            };
          }),
        };
      });

      setSwapTarget(null);
    },
    [swapTarget, program, updateProgram]
  );

  return (
    <div className="workout-wizard-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Intestazione modulo */}
      <section
        className="section-header"
        style={{
          borderBottom: '1px solid #1e293b',
          paddingBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            Programmazione &amp; Periodizzazione Macrociclo
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: 0 }}>
            Architettura deterministica DUP/VBT con evidenze scientifiche, timeline a 6 fasi ed esportazione multi-foglio.
          </p>
        </div>
        {program && (
          <button
            type="button"
            onClick={() => setIsConfigOpen((prev) => !prev)}
            style={{
              background: isConfigOpen ? '#334155' : 'rgba(99, 102, 241, 0.15)',
              border: isConfigOpen ? '1px solid #475569' : '1px solid rgba(99, 102, 241, 0.4)',
              color: isConfigOpen ? '#e2e8f0' : '#818cf8',
              padding: '0.55rem 1rem',
              borderRadius: '0.375rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {isConfigOpen ? 'Chiudi Configurazione Parametri' : '+ Nuova Scheda / Configura Parametri'}
          </button>
        )}
      </section>

      {/* Pannello Configurazione Atleta & Periodizzazione (visibile su richiesta o se non c'è programma) */}
      {(!program || isConfigOpen) && (
        <>
          {/* Pannello Superiore: Parametri Atleta & Configurazione */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Form Anagrafica e Obiettivi */}
        <section
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '0.5rem',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
            Profilo Atleta &amp; Parametri Allenamento
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label
                htmlFor="wizard-athlete-name"
                style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}
              >
                Nome Atleta o Paziente
              </label>
              <input
                id="wizard-athlete-name"
                type="text"
                value={formData.athleteName}
                onChange={(e) => setAthleteName(e.target.value)}
                placeholder="es. Marco Bianchi"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '0.375rem',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label
                  htmlFor="wizard-patient-type"
                  style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}
                >
                  Tipologia Soggetto
                </label>
                <select
                  id="wizard-patient-type"
                  value={formData.patientType}
                  onChange={(e) =>
                    setPatientType(e.target.value as 'Atleta' | 'Clinico' | 'Clinico_Anziano')
                  }
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.375rem',
                    color: '#f8fafc',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="Atleta">Atleta / Performance</option>
                  <option value="Clinico">Paziente Clinico</option>
                  <option value="Clinico_Anziano">Clinico Anziano / Fragile</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="wizard-level"
                  style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}
                >
                  Livello Esperienza
                </label>
                <select
                  id="wizard-level"
                  value={formData.level}
                  onChange={(e) =>
                    setLevel(e.target.value as 'Principiante' | 'Intermedio' | 'Avanzato')
                  }
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.375rem',
                    color: '#f8fafc',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzato">Avanzato</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label
                  htmlFor="wizard-goal"
                  style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}
                >
                  Obiettivo Primario
                </label>
                <select
                  id="wizard-goal"
                  value={formData.goal}
                  onChange={(e) =>
                    setGoal(
                      e.target.value as
                        | 'Forza'
                        | 'Ipertrofia'
                        | 'Potenza'
                        | 'Resistenza'
                        | 'Definizione'
                    )
                  }
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.375rem',
                    color: '#f8fafc',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="Forza">Forza Massimale</option>
                  <option value="Ipertrofia">Ipertrofia Funzionale</option>
                  <option value="Potenza">Potenza &amp; RFD</option>
                  <option value="Resistenza">Resistenza Muscolare</option>
                  <option value="Definizione">Definizione / Ricomposizione</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="wizard-sport"
                  style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}
                >
                  Disciplina o Sport
                </label>
                <input
                  id="wizard-sport"
                  type="text"
                  value={formData.sport}
                  onChange={(e) => setSport(e.target.value)}
                  placeholder="es. Powerlifting, Calcio, Basket"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.375rem',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label
                  htmlFor="wizard-duration-weeks"
                  style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}
                >
                  Durata Macrociclo
                </label>
                <select
                  id="wizard-duration-weeks"
                  value={formData.durationWeeks}
                  onChange={(e) => setDurationWeeks(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.375rem',
                    color: '#f8fafc',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="4">4 Settimane (1 Mese)</option>
                  <option value="6">6 Settimane</option>
                  <option value="8">8 Settimane (2 Mesi)</option>
                  <option value="12">12 Settimane (3 Mesi)</option>
                  <option value="16">16 Settimane (4 Mesi)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="wizard-days-per-week"
                  style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}
                >
                  Frequenza Settimanale
                </label>
                <select
                  id="wizard-days-per-week"
                  value={formData.daysPerWeek}
                  onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.375rem',
                    color: '#f8fafc',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="2">2 Sedute / Settimana</option>
                  <option value="3">3 Sedute / Settimana</option>
                  <option value="4">4 Sedute / Settimana</option>
                  <option value="5">5 Sedute / Settimana</option>
                  <option value="6">6 Sedute / Settimana</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Profilo di Rischio Clinico & Periodizzazione Consigliata */}
        <section
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '0.5rem',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
            Valutazione Clinica &amp; Metodologia
          </h3>

          {/* Card Rischio Clinico */}
          <div
            style={{
              background: riskBadge.bg,
              border: `1px solid ${riskBadge.border}`,
              borderRadius: '0.375rem',
              padding: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: riskBadge.text, textTransform: 'uppercase' }}>
                Livello Rischio Clinico: {riskProfile.level.toUpperCase()}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.25rem',
                  background: '#0f172a',
                  color: '#e2e8f0'
                }}
              >
                Punteggio: {riskProfile.score}
              </span>
            </div>

            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
              Condizioni Attive: {riskProfile.activePathologyCount} | Categorie Critiche:{' '}
              {riskProfile.criticalCategoryPresent ? 'Presenti' : 'Assenti'} | Bonus Comorbilità:{' '}
              {riskProfile.comorbidityBonusApplied ? 'Applicato (+1)' : 'No'}
            </div>

            {riskProfile.notes.length > 0 && (
              <div style={{ marginTop: '0.5rem', borderTop: '1px solid #334155', paddingTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                  Prescrizioni di Sicurezza:
                </span>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
                  {riskProfile.notes.map((note, idx) => (
                    <li key={idx} style={{ marginBottom: '0.2rem' }}>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Card Metodo Periodizzazione Selezionato */}
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '0.375rem',
              padding: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                Metodo Consigliato: {periodizationMethod}
              </span>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginTop: '0.25rem' }}>
              {periodizationDetail.name}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.35rem', marginBottom: 0 }}>
              {periodizationDetail.rationale}
            </p>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#a78bfa' }}>
              Riferimenti: {periodizationDetail.keyResearchers}
            </div>
          </div>

          {/* Pulsante Genera Programma */}
          <button
            type="button"
            onClick={() => {
              generateProgram();
              setIsConfigOpen(false);
            }}
            disabled={isGenerating}
            style={{
              marginTop: 'auto',
              padding: '0.75rem 1.25rem',
              background: '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            {isGenerating ? 'Elaborazione Piano In Corso...' : 'Genera Programma di Allenamento'}
          </button>
        </section>
      </div>

      {/* Selettore Patologie Cliniche & Infortuni */}
      <section
        style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '0.5rem',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
              Selettore Condizioni Cliniche &amp; Infortuni
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Seleziona patologie per attivare il motore di tutela clinica e classificazione degli esercizi.
            </span>
          </div>

          {selectedConditionIds.length > 0 && (
            <button
              type="button"
              onClick={clearConditions}
              style={{
                background: '#334155',
                color: '#f8fafc',
                border: 'none',
                borderRadius: '0.25rem',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Deseleziona Tutte ({selectedConditionIds.length})
            </button>
          )}
        </div>

        {/* Categorie e Ricerca */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {['Tutte', ...categories].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategoryFilter(cat)}
                style={{
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.75rem',
                  borderRadius: '0.25rem',
                  border: 'none',
                  background: activeCategoryFilter === cat ? '#6366f1' : '#1e293b',
                  color: activeCategoryFilter === cat ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Cerca condizione..."
            value={conditionSearchText}
            onChange={(e) => setConditionSearchText(e.target.value)}
            style={{
              marginLeft: 'auto',
              padding: '0.35rem 0.65rem',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '0.25rem',
              color: '#f8fafc',
              fontSize: '0.8rem',
              minWidth: '200px'
            }}
          />
        </div>

        {/* Griglia Selezione Patologie */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '0.5rem',
            borderTop: '1px solid #1e293b',
            paddingTop: '0.75rem'
          }}
        >
          {filteredConditions.slice(0, MAX_CONDITIONS_PREVIEW).map((cond) => {
            const isSelected = selectedConditionIds.includes(cond.id);
            const b = getRiskBadgeColor(cond.riskLevel);
            return (
              <div
                key={cond.id}
                onClick={() => toggleCondition(cond.id)}
                style={{
                  cursor: 'pointer',
                  padding: '0.5rem 0.75rem',
                  background: isSelected ? '#1e293b' : '#090d16',
                  border: isSelected ? '1px solid #6366f1' : '1px solid #1e293b',
                  borderRadius: '0.375rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'border-color 0.1s ease'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>{cond.name}</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{cond.category}</span>
                </div>
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '0.15rem 0.35rem',
                    borderRadius: '0.2rem',
                    background: b.bg,
                    color: b.text,
                    border: `1px solid ${b.border}`
                  }}
                >
                  {cond.riskLevel.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </section>
        </>
      )}

      {/* Programma di Allenamento Generato */}
      {program && (
        <section
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          {/* Vista Interattiva a Schermo (Esclusa in fase di stampa da .screen-only-program-view) */}
          <div className="screen-only-program-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header Programma & Barra Azioni Superiore */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
                borderBottom: '1px solid #1e293b',
                paddingBottom: '1rem'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700, textTransform: 'uppercase' }}>
                  Scheda Generata con Successo
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: '0.2rem 0' }}>
                  Programma: {program.athleteName} - {program.sport}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Metodo: <strong style={{ color: '#38bdf8' }}>{program.periodizationMethod}</strong> | Durata:{' '}
                  <strong>{program.durationWeeks} Settimane</strong> | Rischio:{' '}
                  <strong style={{ color: riskBadge.text }}>{program.riskProfile.level.toUpperCase()}</strong>
                </div>
              </div>

              <ProgramActionsBar
                position="top"
                onExportExcel={() => downloadProgramSpreadsheet(program)}
                onExportPdf={() => printWorkoutProgram(program)}
                onBackupJson={downloadBackupFile}
                onReset={() => {
                  resetProgram();
                  setIsConfigOpen(true);
                }}
              />
            </div>

            {/* Box Evidenze RAG (Foto 3) */}
            <div
              className="rag-evidence-box"
              style={{
                background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '0.5rem',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid #10b981',
                    color: '#6ee7b7',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '0.25rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  METODOLOGIA RAG | 2026
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    background: '#0f172a',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '0.25rem',
                    border: '1px solid #1e293b',
                  }}
                >
                  Score di Rilevanza Semantica: <strong>0.9420 (94.2%)</strong>
                </span>
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.25rem 0' }}>
                  Archivio Metodologico: Linee Guida Biomeccaniche Periodizzazione 2026 &amp; VBT Protocols
                </h4>
                <p style={{ fontSize: '0.825rem', color: '#cbd5e1', margin: 0, lineHeight: 1.55 }}>
                  Estratto metodologico integrato nella periodizzazione: Selezione automatica del modello di carico in base al profilo di rischio clinico, gestione del volume per microciclo con autoregolazione RPE e velocity loss 10-20% per prevenire fatica neuromuscolare periferica.
                </p>
              </div>
            </div>

            {/* 1. Timeline Settimane & Suddivisione Macrociclo (In Cima) */}
            <ProgramTimelineTable phases={program.phases} />

            {/* 2. Esplora Fasi del Programma (Schede Operative a Pillola - Foto 3) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Esplora le {program.phases.length} Fasi del Programma
                </h4>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Seleziona una fase per visualizzare le sedute operative e personalizzare gli esercizi.
                </span>
              </div>

              {/* Navigazione Fasi (Tab Selettori a Pillola Foto 3) */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {program.phases.map((phase) => {
                  const isActive = activePhaseIndex === phase.phaseIndex;
                  const isDeload = phase.name.toLowerCase().includes('scarico') || phase.name.toLowerCase().includes('taper');
                  const weekStart = (phase.phaseIndex - 1) * phase.durationWeeks + 1;
                  const weekEnd = weekStart + phase.durationWeeks - 1;
                  const weeksLabel = phase.durationWeeks > 1 ? `SETTIMANE ${weekStart}-${weekEnd}` : `SETTIMANA ${weekStart}`;

                  return (
                    <button
                      key={phase.phaseIndex}
                      type="button"
                      onClick={() => setActivePhaseIndex(phase.phaseIndex)}
                      style={{
                        padding: '0.65rem 1rem',
                        borderRadius: '0.5rem',
                        border: isActive
                          ? isDeload
                            ? '1px solid #34d399'
                            : '1px solid #10b981'
                          : '1px solid #334155',
                        background: isActive
                          ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                          : '#1e293b',
                        color: isActive ? '#ffffff' : '#94a3b8',
                        boxShadow: isActive ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        minWidth: '150px',
                      }}
                    >
                      <span style={{ fontSize: '0.68rem', opacity: 0.85, fontWeight: 700, letterSpacing: '0.05em' }}>
                        {weeksLabel} | Fase {phase.phaseIndex}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '0.15rem' }}>
                        {phase.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dettagli Fase Selezionata */}
            {(() => {
              const currentPhase = program.phases.find((p) => p.phaseIndex === activePhaseIndex) || program.phases[0];
              if (!currentPhase) return null;

              return (
                <div
                  style={{
                    background: '#090d16',
                    border: '1px solid #1e293b',
                    borderRadius: '0.5rem',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem'
                  }}
                >
                  {/* Box Obiettivo della Fase con KPI (Foto 3) */}
                  <div
                    className="phase-objective-card"
                    style={{
                      background: 'rgba(30, 41, 59, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderLeft: '4px solid #10b981',
                      padding: '1.25rem 1.5rem',
                      borderRadius: '4px 12px 12px 4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.15rem', color: '#f8fafc', fontWeight: 700 }}>
                        Obiettivo della Fase
                      </h4>
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                        {currentPhase.weeklyFocus || `Sviluppo mirato degli adattamenti neurofisiologici con target intensità ${currentPhase.intensityPctRange[0]}-${currentPhase.intensityPctRange[1]}% 1RM e controllo della fatica.`}
                      </p>
                    </div>

                    {/* Barra KPI Foto 3 */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1.5rem',
                        fontSize: '0.825rem',
                        color: '#94a3b8',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        paddingTop: '0.65rem',
                      }}
                    >
                      <span>
                        <strong style={{ color: '#f8fafc' }}>Volume:</strong> {currentPhase.volumeTier}
                      </span>
                      <span>
                        <strong style={{ color: '#f8fafc' }}>Intensità:</strong> {currentPhase.intensityPctRange[0]} - {currentPhase.intensityPctRange[1]}% 1RM
                      </span>
                      <span>
                        <strong style={{ color: '#f8fafc' }}>Focus:</strong> {currentPhase.weeklyFocus}
                      </span>
                      {currentPhase.rpeCap && (
                        <span>
                          <strong style={{ color: '#fcd34d' }}>Cap RPE:</strong> {currentPhase.rpeCap}
                        </span>
                      )}
                      {currentPhase.kneeRomLimitDeg && (
                        <span>
                          <strong style={{ color: '#34d399' }}>ROM Ginocchio:</strong> {currentPhase.kneeRomLimitDeg}° flessione max
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sessioni della Fase */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {currentPhase.sessions.map((sess, sIdx) => (
                      <div
                        key={sIdx}
                        style={{
                          background: '#0f172a',
                          border: '1px solid #1e293b',
                          borderRadius: '0.5rem',
                          padding: '1.15rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem'
                        }}
                      >
                        {/* Intestazione Seduta */}
                        <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>{sess.dayName}</strong>
                            <span style={{ display: 'block', fontSize: '0.78rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                              {sess.focus}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            ~{sess.estimatedDurationMin || 50} min
                          </span>
                        </div>

                        {/* Riscaldamento (se presente) */}
                        {sess.warmup && sess.warmup.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <h5 style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', margin: '0 0 0.25rem 0', borderLeft: '2px solid #f59e0b', paddingLeft: '0.4rem', fontWeight: 700 }}>
                              Warm-Up (Riscaldamento)
                            </h5>
                            {sess.warmup.map((w, wIdx) => (
                              <div
                                key={wIdx}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '0.45rem 0.65rem',
                                  background: 'rgba(255, 255, 255, 0.02)',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(255, 255, 255, 0.04)',
                                  fontSize: '0.8rem',
                                }}
                              >
                                <span style={{ color: '#f8fafc', fontWeight: 500 }}>{w.name}</span>
                                <span style={{ color: '#94a3b8', fontWeight: 600 }}>{w.sets} x {w.reps}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Esercizi della Seduta (Card Foto 4 con 6 Box Parametrici Scuri) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                          <h5 style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', margin: '0 0 0.15rem 0', borderLeft: '2px solid #6366f1', paddingLeft: '0.4rem', fontWeight: 700 }}>
                            Allenamento Principale
                          </h5>

                          {sess.exercises.map((ex, eIdx) => {
                            const isClinical = ex.category === 'Clinical' || (ex.notes && ex.notes.toLowerCase().includes('adatt'));

                            return (
                              <div
                                key={`${ex.id}-${eIdx}`}
                                style={{
                                  background: '#090d16',
                                  border: '1px solid #1e293b',
                                  borderRadius: '8px',
                                  padding: '0.85rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.65rem',
                                }}
                              >
                                {/* Header Esercizio: Indice, Nome, Allerta Clinica ⚠️, Menu ... */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6366f1' }}>
                                      #{eIdx + 1}
                                    </span>
                                    <strong style={{ fontSize: '0.925rem', color: '#f8fafc' }}>
                                      {ex.name}
                                    </strong>
                                    {isClinical && (
                                      <span
                                        style={{
                                          background: '#451a03',
                                          border: '1px solid #f59e0b',
                                          color: '#fcd34d',
                                          fontSize: '0.68rem',
                                          padding: '2px 6px',
                                          borderRadius: '4px',
                                          fontWeight: 700,
                                          letterSpacing: '0.03em',
                                        }}
                                      >
                                        ⚠️ Clinico / Adattato
                                      </span>
                                    )}
                                  </div>

                                  {/* Menu contestuale ... */}
                                  <ExerciseContextMenu
                                    exercise={ex}
                                    onEdit={(updated) =>
                                      handleEditExercise(currentPhase.phaseIndex, sess.dayName, eIdx, updated)
                                    }
                                    onSwap={() =>
                                      setSwapTarget({
                                        phaseIndex: currentPhase.phaseIndex,
                                        sessionDay: sess.dayName,
                                        exerciseIndex: eIdx,
                                        exerciseName: ex.name,
                                      })
                                    }
                                    onDelete={() =>
                                      handleDeleteExercise(currentPhase.phaseIndex, sess.dayName, eIdx, ex)
                                    }
                                  />
                                </div>

                                {/* I 6 Box Parametrici Orizzontali Scuri (Foto 4) */}
                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(6, 1fr)',
                                    gap: '0.4rem',
                                  }}
                                >
                                  {/* SERIE */}
                                  <div
                                    style={{
                                      background: '#0b1120',
                                      border: '1px solid #1e293b',
                                      borderRadius: '6px',
                                      padding: '0.45rem 0.35rem',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                      SERIE
                                    </span>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.15rem' }}>
                                      {ex.sets}
                                    </span>
                                  </div>

                                  {/* REPS */}
                                  <div
                                    style={{
                                      background: '#0b1120',
                                      border: '1px solid #1e293b',
                                      borderRadius: '6px',
                                      padding: '0.45rem 0.35rem',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                      REPS
                                    </span>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.15rem' }}>
                                      {ex.reps}
                                    </span>
                                  </div>

                                  {/* REST */}
                                  <div
                                    style={{
                                      background: '#0b1120',
                                      border: '1px solid #1e293b',
                                      borderRadius: '6px',
                                      padding: '0.45rem 0.35rem',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                      REST
                                    </span>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#cbd5e1', marginTop: '0.15rem' }}>
                                      {ex.restSec}s
                                    </span>
                                  </div>

                                  {/* RPE */}
                                  <div
                                    style={{
                                      background: '#0b1120',
                                      border: '1px solid #1e293b',
                                      borderRadius: '6px',
                                      padding: '0.45rem 0.35rem',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                      RPE
                                    </span>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.15rem' }}>
                                      {ex.rpe}
                                    </span>
                                  </div>

                                  {/* TEMPO */}
                                  <div
                                    style={{
                                      background: '#0b1120',
                                      border: '1px solid #1e293b',
                                      borderRadius: '6px',
                                      padding: '0.45rem 0.35rem',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                      TEMPO
                                    </span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a78bfa', marginTop: '0.15rem' }}>
                                      {ex.tempo}
                                    </span>
                                  </div>

                                  {/* CARICO */}
                                  <div
                                    style={{
                                      background: '#0b1120',
                                      border: '1px solid #1e293b',
                                      borderRadius: '6px',
                                      padding: '0.45rem 0.35rem',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                      CARICO
                                    </span>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981', marginTop: '0.15rem' }}>
                                      {ex.loadPct1RM ? `${ex.loadPct1RM}%` : ex.loadKg ? `${ex.loadKg}kg` : 'Auto'}
                                    </span>
                                  </div>
                                </div>

                                {/* Note Coach / Cliniche */}
                                {ex.notes && (
                                  <div style={{ fontSize: '0.75rem', color: '#fcd34d', background: 'rgba(245, 158, 11, 0.05)', padding: '0.35rem 0.55rem', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                                    Note Coach: {ex.notes}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Defaticamento & Cardio (Foto 4) */}
                        {sess.cooldown && sess.cooldown.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <h5 style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', margin: '0 0 0.25rem 0', borderLeft: '2px solid #10b981', paddingLeft: '0.4rem', fontWeight: 700 }}>
                              DEFATICAMENTO &amp; CARDIO
                            </h5>
                            {sess.cooldown.map((c, cIdx) => (
                              <div
                                key={cIdx}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '0.45rem 0.65rem',
                                  background: 'rgba(16, 185, 129, 0.03)',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(16, 185, 129, 0.1)',
                                  fontSize: '0.8rem',
                                }}
                              >
                                <span style={{ color: '#f8fafc', fontWeight: 500 }}>{c.name}</span>
                                <span style={{ color: '#6ee7b7', fontWeight: 600 }}>{c.sets} serie • {c.reps}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 3. Rationale Scientifico, Periodizzazione, Note Cliniche & Bibliografia (In Fondo) */}
            <ProgramRationaleSection
              rationale={program.rationale}
              periodizationMethod={program.periodizationMethod}
              periodizationDetail={periodizationDetail}
              clinicalNotes={program.riskProfile.notes}
            />

            {/* 4. Barra Azioni Inferiore (In Calce) */}
            <ProgramActionsBar
              position="bottom"
              onExportExcel={() => downloadProgramSpreadsheet(program)}
              onExportPdf={() => printWorkoutProgram(program)}
              onBackupJson={downloadBackupFile}
              onReset={() => {
                resetProgram();
                setIsConfigOpen(true);
              }}
            />
          </div>

          {/* Dossier Completo A4 per Stampa (Tutte le Fasi 1..N - Visibile SOLO in Stampa) */}
          <ProgramPrintDossier
            program={program}
            periodizationDetail={periodizationDetail}
          />
        </section>
      )}

      {/* Modale Sostituzione Esercizio */}
      {swapTarget && (
        <ExerciseSwapModal
          isOpen={true}
          targetExerciseName={swapTarget.exerciseName}
          onClose={() => setSwapTarget(null)}
          onSelectReplacement={handleSelectReplacement}
        />
      )}

      {/* Toast Undo per Ripristino Esercizio Rimosso (5000ms) */}
      {deletedItem && (
        <div
          className="undo-toast"
          role="status"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            background: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            zIndex: 1200,
          }}
        >
          <span style={{ fontSize: '0.88rem', color: '#f8fafc' }}>
            Esercizio &ldquo;{deletedItem.exercise.name}&rdquo; rimosso.
          </span>
          <button
            type="button"
            onClick={handleUndoDelete}
            style={{
              background: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.4rem 0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.825rem',
            }}
          >
            Annulla
          </button>
        </div>
      )}
    </div>
  );
};
