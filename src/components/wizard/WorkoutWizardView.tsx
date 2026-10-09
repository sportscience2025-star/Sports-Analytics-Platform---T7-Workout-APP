/**
 * src/components/wizard/WorkoutWizardView.tsx
 * Componente visuale interattivo per la generazione schede di allenamento e periodizzazione.
 *
 * Conforme a:
 * - Regola R3: Componente snello dedicato al rendering, logica delegata a useWorkoutWizard.
 * - Regola 01: Zero emoji spontanee nell'interfaccia.
 * - Regola R1: Zero any, tipizzazione TypeScript strict.
 */

import React, { useState } from 'react';
import { useWorkoutWizard } from '../../hooks/useWorkoutWizard';
import type { ClinicalCategory } from '../../types/clinical';
import type { Exercise } from '../../types/exercise';
import { ExerciseSwapModal } from '../exercises/ExerciseSwapModal';
import { downloadProgramSpreadsheet } from '../../logic/excel-exporter';
import { printWorkoutProgram } from '../../logic/pdf-exporter';
import { downloadBackupFile } from '../../logic/data-persistence';

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
    resetProgram
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

  return (
    <div className="workout-wizard-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Intestazione modulo */}
      <section className="section-header" style={{ borderBottom: '1px solid #1e293b', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
          Generatore Allenamenti AI &amp; Periodizzazione Scientifica
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: 0 }}>
          Architettura deterministica di programmazione sportiva e riabilitazione clinica evidence-based.
        </p>
      </section>

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
                Nome Atleta / Paziente
              </label>
              <input
                id="wizard-athlete-name"
                type="text"
                value={formData.athleteName}
                onChange={(e) => setAthleteName(e.target.value)}
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
                  <option value="Atleta">Atleta Sano</option>
                  <option value="Clinico">Paziente Clinico / Riabilitativo</option>
                  <option value="Clinico_Anziano">Clinico Senior (&gt;65 anni)</option>
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
                  <option value="Principiante">Principiante (&lt;1 anno)</option>
                  <option value="Intermedio">Intermedio (1-3 anni)</option>
                  <option value="Avanzato">Avanzato / Agonista (&gt;3 anni)</option>
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
                    setGoal(e.target.value as 'Forza' | 'Ipertrofia' | 'Potenza' | 'Resistenza' | 'Definizione')
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
                  <option value="Forza">Forza Massima</option>
                  <option value="Ipertrofia">Ipertrofia Muscolare</option>
                  <option value="Potenza">Potenza &amp; RFD Esplosivo</option>
                  <option value="Resistenza">Resistenza Muscolare / Endurance</option>
                  <option value="Definizione">Definizione &amp; Densita</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="wizard-sport"
                  style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}
                >
                  Disciplina Sportiva
                </label>
                <input
                  id="wizard-sport"
                  type="text"
                  value={formData.sport}
                  onChange={(e) => setSport(e.target.value)}
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
                  htmlFor="wizard-weeks"
                  style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}
                >
                  Durata Macrociclo (Settimane)
                </label>
                <input
                  id="wizard-weeks"
                  type="number"
                  min="4"
                  max="16"
                  value={formData.durationWeeks}
                  onChange={(e) => setDurationWeeks(parseInt(e.target.value) || 12)}
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

              <div>
                <label
                  htmlFor="wizard-days"
                  style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}
                >
                  Frequenza Settimanale (Giorni)
                </label>
                <select
                  id="wizard-days"
                  value={formData.daysPerWeek}
                  onChange={(e) => setDaysPerWeek(parseInt(e.target.value) || 3)}
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
              {riskProfile.criticalCategoryPresent ? 'Presenti' : 'Assenti'} | Bonus Comorbilita:{' '}
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
            onClick={generateProgram}
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
                background: 'transparent',
                color: '#ef4444',
                border: '1px solid #ef4444',
                borderRadius: '0.25rem',
                padding: '0.3rem 0.6rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Azzera Patologie ({selectedConditionIds.length})
            </button>
          )}
        </div>

        {/* Filtri categoria & Ricerca */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Cerca condizione clinica (es. LCA, menisco, cervicale)..."
            value={conditionSearchText}
            onChange={(e) => setConditionSearchText(e.target.value)}
            style={{
              flex: '1 1 240px',
              padding: '0.45rem 0.75rem',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '0.375rem',
              color: '#f8fafc',
              fontSize: '0.85rem'
            }}
          />

          <select
            value={activeCategoryFilter}
            onChange={(e) => setActiveCategoryFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '0.375rem',
              color: '#f8fafc',
              fontSize: '0.85rem'
            }}
          >
            <option value="Tutte">Tutte le Categorie ({allConditions.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Badge patologie selezionate */}
        {selectedConditions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', borderTop: '1px solid #1e293b', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', alignSelf: 'center' }}>Attive:</span>
            {selectedConditions.map((cond) => {
              const b = getRiskBadgeColor(cond.riskLevel);
              return (
                <span
                  key={cond.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: b.bg,
                    border: `1px solid ${b.border}`,
                    color: b.text,
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '0.25rem'
                  }}
                >
                  {cond.name}
                  <button
                    type="button"
                    onClick={() => toggleCondition(cond.id)}
                    aria-label={`Rimuovi ${cond.name}`}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: b.text,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      lineHeight: 1,
                      padding: 0
                    }}
                  >
                    x
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Griglia condizioni disponibili */}
        <div
          style={{
            maxHeight: '220px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '0.5rem',
            borderTop: '1px solid #1e293b',
            paddingTop: '0.75rem'
          }}
        >
          {filteredConditions.slice(0, 48).map((cond) => {
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
          {/* Header Programma */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
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

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => downloadProgramSpreadsheet(program)}
                style={{
                  padding: '0.45rem 0.85rem',
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Esporta Excel (CSV)
              </button>

              <button
                type="button"
                onClick={() => printWorkoutProgram(program)}
                style={{
                  padding: '0.45rem 0.85rem',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Stampa / PDF
              </button>

              <button
                type="button"
                onClick={downloadBackupFile}
                style={{
                  padding: '0.45rem 0.85rem',
                  background: '#475569',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Backup JSON
              </button>

              <button
                type="button"
                onClick={resetProgram}
                style={{
                  padding: '0.45rem 0.85rem',
                  background: '#1e293b',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  borderRadius: '0.375rem',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Chiudi
              </button>
            </div>
          </div>

          {/* Rationale Scientifico - 4 Pilastri */}
          <div
            style={{
              background: '#090d16',
              border: '1px solid #1e293b',
              borderRadius: '0.5rem',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Rationale Scientifico &amp; Evidenze di Riferimento
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
              <div style={{ background: '#1e293b', padding: '0.75rem', borderRadius: '0.375rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', display: 'block' }}>
                  1. Profilo &amp; Contesto
                </span>
                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '0.25rem 0 0' }}>
                  {program.rationale.athleteProfile}
                </p>
              </div>

              <div style={{ background: '#1e293b', padding: '0.75rem', borderRadius: '0.375rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', display: 'block' }}>
                  2. Architettura di Periodizzazione
                </span>
                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '0.25rem 0 0' }}>
                  {program.rationale.periodizationArchitecture}
                </p>
              </div>

              <div style={{ background: '#1e293b', padding: '0.75rem', borderRadius: '0.375rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', display: 'block' }}>
                  3. Prescrizioni Biomeccaniche
                </span>
                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '0.25rem 0 0' }}>
                  {program.rationale.biomechanicalPrescriptions}
                </p>
              </div>

              <div style={{ background: '#1e293b', padding: '0.75rem', borderRadius: '0.375rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f472b6', display: 'block' }}>
                  4. Strategia Velocity-Based Training
                </span>
                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '0.25rem 0 0' }}>
                  {program.rationale.vbtStrategy}
                </p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #1e293b', paddingTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Bibliografia:</span>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                {program.rationale.citations.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Navigazione Fasi */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {program.phases.map((phase) => (
              <button
                key={phase.phaseIndex}
                type="button"
                onClick={() => setActivePhaseIndex(phase.phaseIndex)}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  background: activePhaseIndex === phase.phaseIndex ? '#6366f1' : '#1e293b',
                  color: activePhaseIndex === phase.phaseIndex ? '#ffffff' : '#94a3b8',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {phase.name} ({phase.durationWeeks} sett.)
              </button>
            ))}
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
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                      {currentPhase.name}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{currentPhase.weeklyFocus}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#1e293b', borderRadius: '0.25rem', color: '#38bdf8' }}>
                      Intensita: {currentPhase.intensityPctRange[0]} - {currentPhase.intensityPctRange[1]}% 1RM
                    </span>
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#1e293b', borderRadius: '0.25rem', color: '#fcd34d' }}>
                      Cap RPE: {currentPhase.rpeCap}
                    </span>
                    {currentPhase.kneeRomLimitDeg && (
                      <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#1e293b', borderRadius: '0.25rem', color: '#34d399' }}>
                        ROM Ginocchio: {currentPhase.kneeRomLimitDeg} deg
                      </span>
                    )}
                  </div>
                </div>

                {/* Sessioni della Fase */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                  {currentPhase.sessions.map((sess, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: '0.375rem',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
                        <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>{sess.dayName}</strong>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8' }}>
                          {sess.focus}
                        </span>
                      </div>

                      {/* Esercizi della Seduta */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {sess.exercises.map((ex, eIdx) => (
                          <div
                            key={eIdx}
                            style={{
                              background: '#1e293b',
                              borderRadius: '0.25rem',
                              padding: '0.6rem',
                              fontSize: '0.8rem'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ color: '#f8fafc' }}>{ex.name}</strong>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600 }}>
                                  {ex.sets} x {ex.reps} @ {ex.loadPct1RM}%
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSwapTarget({
                                      phaseIndex: currentPhase.phaseIndex,
                                      sessionDay: sess.dayName,
                                      exerciseIndex: eIdx,
                                      exerciseName: ex.name,
                                    })
                                  }
                                  style={{
                                    background: '#334155',
                                    color: '#38bdf8',
                                    border: 'none',
                                    borderRadius: '0.25rem',
                                    padding: '0.2rem 0.45rem',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Sostituisci
                                </button>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                              <span>RPE: {ex.rpe}</span>
                              <span>Pausa: {ex.restSec}s</span>
                              <span>Tempo: {ex.tempo}</span>
                            </div>
                            {ex.notes && (
                              <div style={{ marginTop: '0.25rem', color: '#cbd5e1', fontSize: '0.7rem' }}>
                                Note: {ex.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* Modale Sostituzione Esercizio */}
      {swapTarget && (
        <ExerciseSwapModal
          isOpen={true}
          targetExerciseName={swapTarget.exerciseName}
          onClose={() => setSwapTarget(null)}
          onSelectReplacement={(replacement: Exercise) => {
            if (program) {
              const targetPhase = program.phases.find((p) => p.phaseIndex === swapTarget.phaseIndex);
              if (targetPhase) {
                const targetSession = targetPhase.sessions.find((s) => s.dayName === swapTarget.sessionDay);
                if (targetSession && targetSession.exercises[swapTarget.exerciseIndex]) {
                  targetSession.exercises[swapTarget.exerciseIndex].name = replacement.name;
                  targetSession.exercises[swapTarget.exerciseIndex].id = replacement.id;
                  targetSession.exercises[swapTarget.exerciseIndex].exerciseRef = replacement;
                }
              }
            }
            setSwapTarget(null);
          }}
        />
      )}
    </div>
  );
};
