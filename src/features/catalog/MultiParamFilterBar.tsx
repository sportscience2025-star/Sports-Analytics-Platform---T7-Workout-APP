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

import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  const [isMuscleOpen, setIsMuscleOpen] = useState<boolean>(false);
  const [isLevelOpen, setIsLevelOpen] = useState<boolean>(false);
  const [isEquipmentOpen, setIsEquipmentOpen] = useState<boolean>(false);
  const [isQualityOpen, setIsQualityOpen] = useState<boolean>(false);

  const [muscleSearch, setMuscleSearch] = useState<string>('');
  const muscleDropdownRef = useRef<HTMLDivElement>(null);
  const levelDropdownRef = useRef<HTMLDivElement>(null);
  const equipmentDropdownRef = useRef<HTMLDivElement>(null);
  const qualityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (muscleDropdownRef.current && !muscleDropdownRef.current.contains(target)) {
        setIsMuscleOpen(false);
      }
      if (levelDropdownRef.current && !levelDropdownRef.current.contains(target)) {
        setIsLevelOpen(false);
      }
      if (equipmentDropdownRef.current && !equipmentDropdownRef.current.contains(target)) {
        setIsEquipmentOpen(false);
      }
      if (qualityDropdownRef.current && !qualityDropdownRef.current.contains(target)) {
        setIsQualityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const filteredMuscleGroups = useMemo(() => {
    const q = muscleSearch.trim().toLowerCase();
    if (!q) return MUSCLE_GROUPS_NESTED;
    return MUSCLE_GROUPS_NESTED.map((group) => {
      const groupMatches = group.group.toLowerCase().includes(q);
      const items = groupMatches
        ? group.items
        : group.items.filter((item) => item.toLowerCase().includes(q));
      return { group: group.group, items };
    }).filter((group) => group.items.length > 0);
  }, [muscleSearch]);
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

      {/* Dropdown Muscolo Target con Categorie Annidate e Ricerca Testuale Interna */}
      <div
        ref={muscleDropdownRef}
        style={{
          position: 'relative',
          flex: '1 1 180px',
        }}
      >
        <button
          type="button"
          onClick={() => setIsMuscleOpen((prev) => !prev)}
          title="Filtra per muscolo target o distretto anatomico con ricerca interna"
          style={{
            width: '100%',
            background: 'var(--bg-body, #0b0e14)',
            border: isMuscleOpen ? '1px solid #6366f1' : '1px solid var(--border, #1f293d)',
            borderRadius: '0.375rem',
            padding: '0.55rem 0.75rem',
            color: selectedMuscle !== 'Tutti' ? '#a5b4fc' : 'var(--text-primary, #f1f5f9)',
            fontSize: '0.85rem',
            outline: 'none',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'left',
            fontWeight: selectedMuscle !== 'Tutti' ? 600 : 400,
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedMuscle === 'Tutti' ? 'Tutti i Muscoli' : selectedMuscle}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isMuscleOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
              flexShrink: 0,
              marginLeft: '0.5rem',
              color: '#94a3b8',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {isMuscleOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              width: '280px',
              maxWidth: '90vw',
              background: 'var(--bg-surface, #111827)',
              border: '1px solid var(--border, #1f293d)',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '340px',
              overflow: 'hidden',
            }}
          >
            {/* Ricerca Testuale Interna */}
            <div
              style={{
                padding: '0.5rem',
                borderBottom: '1px solid var(--border, #1f293d)',
                background: 'var(--bg-body, #0b0e14)',
              }}
            >
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  autoFocus
                  placeholder="Cerca distretto o capo..."
                  value={muscleSearch}
                  onChange={(e) => setMuscleSearch(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.25rem',
                    padding: '0.35rem 0.5rem 0.35rem 1.85rem',
                    color: '#f8fafc',
                    fontSize: '0.8rem',
                    outline: 'none',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    left: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Lista Opzioni con Categorie Annidate */}
            <div style={{ overflowY: 'auto', padding: '0.35rem 0' }}>
              <button
                type="button"
                onClick={() => {
                  onMuscleChange('Tutti');
                  setIsMuscleOpen(false);
                  setMuscleSearch('');
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: selectedMuscle === 'Tutti' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: selectedMuscle === 'Tutti' ? '#a5b4fc' : '#e2e8f0',
                  border: 'none',
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.825rem',
                  fontWeight: selectedMuscle === 'Tutti' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>Tutti i Muscoli</span>
                {selectedMuscle === 'Tutti' && (
                  <span style={{ fontSize: '0.75rem', color: '#818cf8' }}>✓</span>
                )}
              </button>

              {filteredMuscleGroups.map((group) => (
                <div key={group.group} style={{ marginTop: '0.35rem' }}>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: '#64748b',
                      padding: '0.25rem 0.75rem 0.15rem 0.75rem',
                    }}
                  >
                    {group.group}
                  </div>
                  {group.items.map((item) => {
                    const isSelected = selectedMuscle === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          onMuscleChange(item);
                          setIsMuscleOpen(false);
                          setMuscleSearch('');
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                          color: isSelected ? '#a5b4fc' : '#cbd5e1',
                          border: 'none',
                          padding: '0.35rem 0.75rem 0.35rem 1.15rem',
                          fontSize: '0.8rem',
                          fontWeight: isSelected ? 700 : 400,
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = '#1e293b';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <span>{item}</span>
                        {isSelected && (
                          <span style={{ fontSize: '0.75rem', color: '#818cf8' }}>✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}

              {filteredMuscleGroups.length === 0 && (
                <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                  Nessun muscolo o capo corrispondente
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dropdown Livello Personalizzato Dark Cockpit */}
      <div ref={levelDropdownRef} style={{ position: 'relative', flex: '0 1 140px', minWidth: '130px' }}>
        <button
          type="button"
          onClick={() => {
            setIsLevelOpen((prev) => !prev);
            setIsMuscleOpen(false);
            setIsEquipmentOpen(false);
            setIsQualityOpen(false);
          }}
          title="Filtra per livello atletico"
          style={{
            width: '100%',
            background: 'var(--bg-body, #0b0e14)',
            border: isLevelOpen ? '1px solid #6366f1' : '1px solid var(--border, #1f293d)',
            borderRadius: '0.375rem',
            padding: '0.55rem 0.75rem',
            color: 'var(--text-primary, #f1f5f9)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.35rem',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedLevel === 'Tutti' ? 'Tutti i Livelli' : selectedLevel}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              flexShrink: 0,
              transform: isLevelOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s ease',
              color: '#94a3b8',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {isLevelOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              minWidth: '100%',
              width: 'max-content',
              background: '#111827',
              border: '1px solid #1f293d',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.7)',
              zIndex: 60,
              padding: '0.35rem 0',
            }}
          >
            {CANONICAL_LEVELS.map((lvl) => {
              const isSelected = selectedLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    onLevelChange(lvl);
                    setIsLevelOpen(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    color: isSelected ? '#a5b4fc' : '#e2e8f0',
                    border: 'none',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.825rem',
                    fontWeight: isSelected ? 700 : 400,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#1e293b';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span>{lvl === 'Tutti' ? 'Tutti i Livelli' : lvl}</span>
                  {isSelected && <span style={{ fontSize: '0.75rem', color: '#818cf8' }}>✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Dropdown Attrezzatura Personalizzato Dark Cockpit */}
      <div ref={equipmentDropdownRef} style={{ position: 'relative', flex: '0 1 155px', minWidth: '145px' }}>
        <button
          type="button"
          onClick={() => {
            setIsEquipmentOpen((prev) => !prev);
            setIsMuscleOpen(false);
            setIsLevelOpen(false);
            setIsQualityOpen(false);
          }}
          title="Filtra per attrezzatura disponibile"
          style={{
            width: '100%',
            background: 'var(--bg-body, #0b0e14)',
            border: isEquipmentOpen ? '1px solid #6366f1' : '1px solid var(--border, #1f293d)',
            borderRadius: '0.375rem',
            padding: '0.55rem 0.75rem',
            color: 'var(--text-primary, #f1f5f9)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.35rem',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedEquipment === 'Tutta' ? 'Tutta Attrezzatura' : selectedEquipment}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              flexShrink: 0,
              transform: isEquipmentOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s ease',
              color: '#94a3b8',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {isEquipmentOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              minWidth: '100%',
              width: 'max-content',
              background: '#111827',
              border: '1px solid #1f293d',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.7)',
              zIndex: 60,
              padding: '0.35rem 0',
              maxHeight: '260px',
              overflowY: 'auto',
            }}
          >
            {CANONICAL_EQUIPMENTS.map((eq) => {
              const isSelected = selectedEquipment === eq;
              return (
                <button
                  key={eq}
                  type="button"
                  onClick={() => {
                    onEquipmentChange(eq);
                    setIsEquipmentOpen(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    color: isSelected ? '#a5b4fc' : '#e2e8f0',
                    border: 'none',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.825rem',
                    fontWeight: isSelected ? 700 : 400,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#1e293b';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span>{eq === 'Tutta' ? 'Tutta Attrezzatura' : eq}</span>
                  {isSelected && <span style={{ fontSize: '0.75rem', color: '#818cf8' }}>✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Dropdown Qualità Neuromuscolare Personalizzato Dark Cockpit */}
      <div ref={qualityDropdownRef} style={{ position: 'relative', flex: '0 1 145px', minWidth: '135px' }}>
        <button
          type="button"
          onClick={() => {
            setIsQualityOpen((prev) => !prev);
            setIsMuscleOpen(false);
            setIsLevelOpen(false);
            setIsEquipmentOpen(false);
          }}
          title="Filtra per qualità neuromuscolare"
          style={{
            width: '100%',
            background: 'var(--bg-body, #0b0e14)',
            border: isQualityOpen ? '1px solid #6366f1' : '1px solid var(--border, #1f293d)',
            borderRadius: '0.375rem',
            padding: '0.55rem 0.75rem',
            color: 'var(--text-primary, #f1f5f9)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.35rem',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedQuality === 'Tutte' ? 'Tutte le Qualità' : selectedQuality}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              flexShrink: 0,
              transform: isQualityOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s ease',
              color: '#94a3b8',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {isQualityOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              minWidth: '100%',
              width: 'max-content',
              background: '#111827',
              border: '1px solid #1f293d',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.7)',
              zIndex: 60,
              padding: '0.35rem 0',
            }}
          >
            {CANONICAL_QUALITIES.map((q) => {
              const isSelected = selectedQuality === q;
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    onQualityChange(q);
                    setIsQualityOpen(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    color: isSelected ? '#a5b4fc' : '#e2e8f0',
                    border: 'none',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.825rem',
                    fontWeight: isSelected ? 700 : 400,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#1e293b';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span>{q === 'Tutte' ? 'Tutte le Qualità' : q}</span>
                  {isSelected && <span style={{ fontSize: '0.75rem', color: '#818cf8' }}>✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

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
