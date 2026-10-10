/**
 * src/features/catalog/MultiParamFilterBar.tsx
 * Barra multi-filtro del catalogo esercizi con ricerca full-text, distretti muscolari annidati,
 * qualità neuromuscolare, livello, attrezzatura e pulsante per aggiunta nuovo esercizio.
 *
 * Conforme a:
 * - Regola 01: Zero emoji spontanee (icone SVG lineari).
 * - Regola 02: Zero numeri magici, costanti in MAIUSCOLO.
 * - Regola R1: Strict TypeScript, zero any.
 */

import React from 'react';
import type { ExerciseLevel, ExerciseQuality } from '../../types/exercise';

export interface MultiParamFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedMuscle: string;
  onMuscleChange: (muscle: string) => void;
  selectedLevel: string;
  onLevelChange: (level: string) => void;
  selectedEquipment: string;
  onEquipmentChange: (equipment: string) => void;
  selectedQuality: string;
  onQualityChange: (quality: string) => void;
  onOpenAddModal?: () => void;
  onResetFilters: () => void;
  isFilterActive: boolean;
}

const MUSCLE_GROUPS_NESTED = [
  {
    group: 'Pettorali',
    items: ['Pettorali', 'Pettorale Clavicolare', 'Pettorale Sternocostale', 'Pettorale Minore'],
  },
  {
    group: 'Dorsali & Schiena',
    items: ['Dorsali', 'Gran Dorsale', 'Erettori Spinali', 'Grande Rotondo', 'Romboidi', 'Trapezio', 'Sottospinato'],
  },
  {
    group: 'Spalle & Cingolo Scapolare',
    items: ['Deltoidi', 'Deltoide Anteriore', 'Deltoide Laterale', 'Deltoide Posteriore', 'Cuffia dei Rotatori'],
  },
  {
    group: 'Arti Inferiori',
    items: ['Quadricipiti', 'Ischiocrurali', 'Femorali', 'Glutei', 'Grande Gluteo', 'Medio Gluteo', 'Polpacci', 'Gastrocnemio', 'Soleo', 'Adduttori', 'Abduttori'],
  },
  {
    group: 'Braccia',
    items: ['Bicipiti', 'Bicipite Brachiale', 'Brachiale', 'Tricipiti', 'Capo Lungo Tricipite', 'Avambracci', 'Flessori Polso', 'Estensori Polso'],
  },
  {
    group: 'Core & Tronco',
    items: ['Core', 'Retto Addominale', 'Obliqui', 'Trasverso', 'Lombari'],
  },
];

const CANONICAL_EQUIPMENTS = [
  'Tutta',
  'Bilanciere',
  'Manubri',
  'Corpo Libero',
  'Macchine',
  'Cavi',
  'Kettlebell',
  'Elastici',
  'Altri Attrezzi',
];

const CANONICAL_LEVELS: Array<'Tutti' | ExerciseLevel> = [
  'Tutti',
  'Principiante',
  'Intermedio',
  'Avanzato',
  'Elite/Pro',
];

const CANONICAL_QUALITIES: Array<'Tutte' | ExerciseQuality> = [
  'Tutte',
  'Forza',
  'Ipertrofia',
  'Potenza',
  'Stabilità',
  'Resistenza',
];

/**
 * Componente Barra Filtri Multi-Parametro per il Catalogo.
 */
export const MultiParamFilterBar: React.FC<MultiParamFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedMuscle,
  onMuscleChange,
  selectedLevel,
  onLevelChange,
  selectedEquipment,
  onEquipmentChange,
  selectedQuality,
  onQualityChange,
  onOpenAddModal,
  onResetFilters,
  isFilterActive,
}) => {
  return (
    <div
      className="catalog-toolbar"
      style={{
        background: 'var(--bg-surface, #111827)',
        border: '1px solid var(--border, #1f293d)',
        borderRadius: '0.5rem',
        padding: '0.875rem 1rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
      }}
    >
      {/* Campo di ricerca full-text con icona lente SVG */}
      <div
        className="search-input-wrap"
        style={{
          position: 'relative',
          flex: '1 1 240px',
          minWidth: '200px',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          className="search-input"
          placeholder="Cerca per nome o pattern motorio (es. Squat, Panca)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--bg-body, #0b0e14)',
            border: '1px solid var(--border, #1f293d)',
            borderRadius: '0.375rem',
            padding: '0.55rem 0.75rem 0.55rem 2.25rem',
            color: 'var(--text-primary, #f1f5f9)',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        />
      </div>

      {/* Dropdown Muscolo Target con Categorie Annidate */}
      <select
        className="filter-select"
        value={selectedMuscle}
        onChange={(e) => onMuscleChange(e.target.value)}
        title="Filtra per muscolo target o distretto anatomico"
        style={{
          flex: '1 1 150px',
          background: 'var(--bg-body, #0b0e14)',
          border: '1px solid var(--border, #1f293d)',
          borderRadius: '0.375rem',
          padding: '0.55rem 0.75rem',
          color: 'var(--text-primary, #f1f5f9)',
          fontSize: '0.85rem',
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        <option value="Tutti">Tutti i Muscoli</option>
        {MUSCLE_GROUPS_NESTED.map((group) => (
          <optgroup key={group.group} label={group.group}>
            {group.items.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {/* Dropdown Livello */}
      <select
        className="filter-select"
        value={selectedLevel}
        onChange={(e) => onLevelChange(e.target.value)}
        title="Filtra per livello atletico"
        style={{
          flex: '0 1 125px',
          background: 'var(--bg-body, #0b0e14)',
          border: '1px solid var(--border, #1f293d)',
          borderRadius: '0.375rem',
          padding: '0.55rem 0.75rem',
          color: 'var(--text-primary, #f1f5f9)',
          fontSize: '0.85rem',
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        {CANONICAL_LEVELS.map((lvl) => (
          <option key={lvl} value={lvl}>
            {lvl === 'Tutti' ? 'Tutti i Livelli' : lvl}
          </option>
        ))}
      </select>

      {/* Dropdown Attrezzatura */}
      <select
        className="filter-select"
        value={selectedEquipment}
        onChange={(e) => onEquipmentChange(e.target.value)}
        title="Filtra per attrezzatura disponibile"
        style={{
          flex: '0 1 135px',
          background: 'var(--bg-body, #0b0e14)',
          border: '1px solid var(--border, #1f293d)',
          borderRadius: '0.375rem',
          padding: '0.55rem 0.75rem',
          color: 'var(--text-primary, #f1f5f9)',
          fontSize: '0.85rem',
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        {CANONICAL_EQUIPMENTS.map((eq) => (
          <option key={eq} value={eq}>
            {eq === 'Tutta' ? 'Tutta Attrezzatura' : eq}
          </option>
        ))}
      </select>

      {/* Dropdown Qualità Neuromuscolare */}
      <select
        className="filter-select"
        value={selectedQuality}
        onChange={(e) => onQualityChange(e.target.value)}
        title="Filtra per qualità neuromuscolare"
        style={{
          flex: '0 1 130px',
          background: 'var(--bg-body, #0b0e14)',
          border: '1px solid var(--border, #1f293d)',
          borderRadius: '0.375rem',
          padding: '0.55rem 0.75rem',
          color: 'var(--text-primary, #f1f5f9)',
          fontSize: '0.85rem',
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        {CANONICAL_QUALITIES.map((q) => (
          <option key={q} value={q}>
            {q === 'Tutte' ? 'Tutte le Qualità' : q}
          </option>
        ))}
      </select>

      {/* Pulsante Reset Filtri (visibile solo se attivi) */}
      {isFilterActive && (
        <button
          type="button"
          onClick={onResetFilters}
          title="Ripristina tutti i filtri"
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.375rem',
            padding: '0.55rem 0.75rem',
            color: '#f87171',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <span>Reset</span>
        </button>
      )}

      {/* Pulsante Aggiunta Nuovo Esercizio */}
      {onOpenAddModal && (
        <button
          type="button"
          onClick={onOpenAddModal}
          title="Aggiungi manualmente un nuovo esercizio"
          style={{
            background: '#10b981',
            border: 'none',
            borderRadius: '0.375rem',
            padding: '0.55rem 0.95rem',
            color: '#0b0e14',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginLeft: 'auto',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Aggiungi</span>
        </button>
      )}
    </div>
  );
};
