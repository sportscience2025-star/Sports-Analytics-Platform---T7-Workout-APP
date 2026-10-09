/**
 * src/components/exercises/AddExerciseModal.tsx
 * Modale per l'inserimento di un esercizio personalizzato (Custom Exercise).
 * Convalida i dati secondo l'interfaccia Exercise e persiste nei custom exercises.
 * Rispetta la Regola 01 (Zero emoji spontanee) e Regola R1 (Zero any).
 */

import React, { useState, useCallback, useEffect } from 'react';
import type {
  Exercise,
  ExerciseLevel,
  ExerciseQuality,
  ExerciseType,
} from '../../types/exercise';

export interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exercise: Exercise) => void;
}

const MUSCLE_OPTIONS = [
  'Pettorale Maggiore (Capo Sternocostale)',
  'Pettorale Maggiore (Capo Clavicolare)',
  'Gran Dorsale',
  'Trapezio (Medio/Inferiore)',
  'Erettori Spinali',
  'Deltoide Anteriore',
  'Deltoide Laterale',
  'Deltoide Posteriore',
  'Bicipite Brachiale (Capo Lungo)',
  'Bicipite Brachiale (Capo Breve)',
  'Tricipite Brachiale (Capo Laterale)',
  'Tricipite Brachiale (Capo Lungo)',
  'Brachioradiale',
  'Vasto Laterale',
  'Retto Femorale',
  'Bicipite Femorale',
  'Grande Gluteo',
  'Medio Gluteo',
  'Gastrocnemio',
  'Soleo',
  "Retto dell'Addome",
  "Traverso dell'Addome",
  'Obliquo Esterno',
];

const EQUIPMENT_OPTIONS = [
  'Bilanciere',
  'Manubri',
  'Macchine',
  'Cavi',
  'Corpo Libero',
  'Sbarra Trazioni',
  'Kettlebell',
  'Elastici',
  'Panca',
];

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState<string>('');
  const [nameEn, setNameEn] = useState<string>('');
  const [primaryMuscle, setPrimaryMuscle] = useState<string>(MUSCLE_OPTIONS[0]);
  const [secondaryMusclesStr, setSecondaryMusclesStr] = useState<string>('');
  const [type, setType] = useState<ExerciseType>('Multiarticolare');
  const [level, setLevel] = useState<ExerciseLevel>('Intermedio');
  const [equipment, setEquipment] = useState<string>(EQUIPMENT_OPTIONS[0]);
  const [quality, setQuality] = useState<ExerciseQuality>('Ipertrofia');
  const [description, setDescription] = useState<string>('');
  const [setupStr, setSetupStr] = useState<string>('');
  const [stepsStr, setStepsStr] = useState<string>('');
  const [cuesStr, setCuesStr] = useState<string>('');
  const [commonError, setCommonError] = useState<string>('');
  const [errorFix, setErrorFix] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError('Il nome dell esercizio è obbligatorio.');
      return;
    }

    const secondaryMuscles = secondaryMusclesStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const setup = setupStr
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const steps = stepsStr
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const cues = cuesStr
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const errors = commonError.trim()
      ? [
          {
            error: commonError.trim(),
            why: 'Movimento scorretto o compensazione cinematica.',
            fix: errorFix.trim() || 'Correggi l assetto tecnico riducendo il carico.',
          },
        ]
      : [];

    const newExercise: Exercise = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      nameEn: nameEn.trim() || undefined,
      primaryMuscle,
      secondaryMuscles: secondaryMuscles.length > 0 ? secondaryMuscles : undefined,
      muscles: [primaryMuscle, ...secondaryMuscles],
      type,
      level,
      equipment,
      quality,
      description: description.trim() || `Esercizio personalizzato per ${primaryMuscle}.`,
      execution: {
        setup: setup.length > 0 ? setup : undefined,
        steps: steps.length > 0 ? steps : ['Esecuzione controllata del movimento.'],
        cues: cues.length > 0 ? cues : undefined,
      },
      errors,
    };

    onSave(newExercise);
    // Reset form
    setName('');
    setNameEn('');
    setSecondaryMusclesStr('');
    setDescription('');
    setSetupStr('');
    setStepsStr('');
    setCuesStr('');
    setCommonError('');
    setErrorFix('');
    setValidationError(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#0b1329',
          border: '1px solid #1e293b',
          borderRadius: '0.75rem',
          maxWidth: '650px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#0f172a',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            Aggiungi Nuovo Esercizio Personalizzato
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#334155',
              color: '#f8fafc',
              border: 'none',
              borderRadius: '0.375rem',
              width: '32px',
              height: '32px',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            X
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {validationError && (
            <div style={{ background: '#7f1d1d', color: '#fecaca', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.85rem' }}>
              {validationError}
            </div>
          )}

          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              Nome Esercizio *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Spinte con Manubri su Panca Inclinata"
              style={{
                width: '100%',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#f8fafc',
                padding: '0.5rem 0.75rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                Gruppo Muscolare Primario *
              </label>
              <select
                value={primaryMuscle}
                onChange={(e) => setPrimaryMuscle(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '0.375rem',
                  color: '#f8fafc',
                  padding: '0.5rem 0.75rem',
                  boxSizing: 'border-box',
                }}
              >
                {MUSCLE_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                Attrezzatura *
              </label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '0.375rem',
                  color: '#f8fafc',
                  padding: '0.5rem 0.75rem',
                  boxSizing: 'border-box',
                }}
              >
                {EQUIPMENT_OPTIONS.map((eq) => (
                  <option key={eq} value={eq}>{eq}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                Tipologia *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ExerciseType)}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '0.375rem',
                  color: '#f8fafc',
                  padding: '0.5rem 0.75rem',
                  boxSizing: 'border-box',
                }}
              >
                <option value="Multiarticolare">Multiarticolare</option>
                <option value="Isolamento">Isolamento</option>
                <option value="Isometrico">Isometrico</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                Livello *
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as ExerciseLevel)}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '0.375rem',
                  color: '#f8fafc',
                  padding: '0.5rem 0.75rem',
                  boxSizing: 'border-box',
                }}
              >
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzato">Avanzato</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                Qualità Atletica *
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as ExerciseQuality)}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '0.375rem',
                  color: '#f8fafc',
                  padding: '0.5rem 0.75rem',
                  boxSizing: 'border-box',
                }}
              >
                <option value="Forza">Forza</option>
                <option value="Ipertrofia">Ipertrofia</option>
                <option value="Potenza">Potenza</option>
                <option value="Stabilità">Stabilità</option>
                <option value="Resistenza">Resistenza</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              Descrizione Biomeccanica
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Focalizzazione biomeccanica e piano del movimento..."
              style={{
                width: '100%',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#f8fafc',
                padding: '0.5rem 0.75rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#334155',
                color: '#f8fafc',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
              }}
            >
              Annulla
            </button>
            <button
              type="submit"
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.5rem 1.25rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Salva Esercizio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
