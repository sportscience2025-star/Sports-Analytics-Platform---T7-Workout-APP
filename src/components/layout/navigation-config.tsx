/**
 * src/components/layout/navigation-config.tsx
 * Configurazione centralizzata dei 7 moduli canonici, costanti dimensionali responsive,
 * iconografia SVG minimale (zero emoji) e helper puri per badge e focus ring (WCAG 2.1).
 * Conforme a Regola 01 (zero emoji, strict TS) e Regola 02 (zero duplicazioni, costanti in MAIUSCOLO).
 */

import React from 'react';
import {
  AppModuleId,
  Athlete,
  AVAILABILITY_CAUTION,
  AVAILABILITY_INJURED,
  AVAILABILITY_REHAB,
  TierLevel
} from '../../types';

export const SIDEBAR_WIDTH_PX = 240;
export const BOTTOM_NAV_HEIGHT_PX = 60;
export const BREAKPOINT_DESKTOP_PX = 1024;
export const DESKTOP_MEDIA_QUERY = `(min-width: ${BREAKPOINT_DESKTOP_PX}px)`;

export const Z_INDEX_NAV = 40;
export const Z_INDEX_BOTTOM_SHEET = 65;
export const Z_INDEX_MODAL = 70;

export const MIN_TOUCH_TARGET_PX = 44;
export const MOBILE_TOUCH_HEIGHT_PX = 48;
export const MOBILE_PRIMARY_TAB_COUNT = 5;
export const MAX_BADGE_COUNT = 99;
export const NAV_ICON_SIZE_PX = 20;
export const LOCK_ICON_SIZE_PX = 14;
export const NAV_BLUR_PX = 20;
export const NAV_TRANSITION_MS = 150;

export const SAFE_AREA_BOTTOM_CSS = 'env(safe-area-inset-bottom, 0px)';
export const NAV_GLASS_BG = 'rgba(11, 14, 20, 0.88)';
export const NAV_SHEET_GLASS_BG = 'rgba(15, 23, 42, 0.94)';
export const NAV_BORDER_SUBTLE = 'rgba(255, 255, 255, 0.08)';
export const NAV_ACTIVE_BG = 'rgba(56, 189, 248, 0.14)';
export const NAV_ACTIVE_COLOR = '#38bdf8';
export const NAV_TEXT_PRIMARY = '#f8fafc';
export const NAV_TEXT_SECONDARY = '#94a3b8';
export const NAV_LOCKED_COLOR = '#64748b';
export const NAV_ALERT_BG = '#f43f5e';
export const NAV_BADGE_BG = 'rgba(56, 189, 248, 0.2)';
export const NAV_FOCUS_OUTLINE = '2px solid #38bdf8';
export const NAV_FOCUS_SHADOW = '0 0 0 3px rgba(56, 189, 248, 0.35)';

export const OVERFLOW_BUTTON_ID = 't7-bottom-nav-more-btn';
export const OVERFLOW_SHEET_ID = 't7-bottom-nav-more-sheet';

const SVG_VIEWBOX = '0 0 24 24';
const SVG_STROKE_WIDTH = 2;

export interface CanonicalModuleItem {
  readonly id: AppModuleId;
  readonly label: string;
  readonly shortLabel: string;
  readonly description: string;
  readonly requiredTier: TierLevel;
  readonly isMobilePrimary: boolean;
  readonly upgradeBenefits: readonly string[];
}

export const CANONICAL_MODULES: readonly CanonicalModuleItem[] = Object.freeze([
  {
    id: 'cockpit',
    label: 'Cockpit Dashboard',
    shortLabel: 'Cockpit',
    description: 'Panoramica readiness, carico giornaliero e segnalazioni prioritarie.',
    requiredTier: 'tier1',
    isMobilePrimary: true,
    upgradeBenefits: Object.freeze(['Monitoraggio readiness quotidiano', 'Alert prioritari atleti'])
  },
  {
    id: 'catalog',
    label: 'Catalogo Esercizi & Anamnesi',
    shortLabel: 'Catalogo',
    description: 'Archivio tecnico 296 esercizi, varianti biomeccaniche e triage 119 condizioni.',
    requiredTier: 'tier1',
    isMobilePrimary: true,
    upgradeBenefits: Object.freeze(['Catalogo esercizi 3D', 'Filtro clinico per limitazioni articolari'])
  },
  {
    id: 'programming',
    label: 'Programmazione & Workout',
    shortLabel: 'Workout',
    description: 'Creazione schede personalizzate, progressioni periodizzate e player sessione.',
    requiredTier: 'tier1',
    isMobilePrimary: true,
    upgradeBenefits: Object.freeze(['Wizard periodizzazione guidata', 'Workout Player offline-first'])
  },
  {
    id: 'analysis',
    label: 'Data Analisi, Wearable & VBT',
    shortLabel: 'Analisi',
    description: 'Telemetria encoder lineare, potenza meccanica, curva forza-velocita e wearable.',
    requiredTier: 'tier1',
    isMobilePrimary: true,
    upgradeBenefits: Object.freeze(['Metriche SI forza/potenza/velocita', 'Storico sessioni VBT'])
  },
  {
    id: 'community',
    label: 'Fonti Scientifiche & AI Studio',
    shortLabel: 'AI Studio',
    description: 'Spazio collaborativo coach-ricerca, confronto evidenze peer-reviewed e AI Studio.',
    requiredTier: 'tier2',
    isMobilePrimary: false,
    upgradeBenefits: Object.freeze([
      'Accesso completo ad AI Studio ed evidenze guidate',
      'Gestione fino a 50 atleti attivi con export Excel sbloccati',
      'Profilazione avanzata VBT, carico-velocita e condivisione staff'
    ])
  },
  {
    id: 'favorites',
    label: 'Preferiti Multi-Tier',
    shortLabel: 'Preferiti',
    description: 'Raccolta rapida di esercizi salvati, varianti personalizzate e protocolli rapidi.',
    requiredTier: 'tier1',
    isMobilePrimary: true,
    upgradeBenefits: Object.freeze(['Accesso istantaneo ai preferiti', 'Sincronizzazione esercizi custom'])
  },
  {
    id: 'nutrition',
    label: 'Diario Nutrizione & Stile di Vita',
    shortLabel: 'Nutrizione',
    description: 'Educazione alimentare, idratazione, timing peri-workout e monitoraggio massa.',
    requiredTier: 'tier1',
    isMobilePrimary: false,
    upgradeBenefits: Object.freeze(['Diario alimentare e idratazione', 'Monitoraggio peso corporeo'])
  }
]);

/**
 * Formatta un contatore badge applicando il tetto visivo a 99+ per evitare overflow grafici.
 * @param count Valore numerico grezzo del contatore
 * @returns Stringa formattata (`1`..`99` oppure `99+`)
 */
export function formatBadgeCount(count: number): string {
  if (!Number.isFinite(count) || count <= 0) {
    return '0';
  }
  const safeCount = Math.floor(count);
  return safeCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : String(safeCount);
}

/**
 * Calcola il numero di alert sportivi attivi nel roster selezionato (`caution`, `rehab`, `injured`).
 * @param roster Lista atleti appartenenti al contesto attivo
 * @returns Conteggio atleti non pienamente disponibili
 */
export function computeRosterAlertCount(roster: readonly Athlete[]): number {
  let count = 0;
  for (const athlete of roster) {
    const status = athlete.availabilityStatus;
    if (
      status === AVAILABILITY_CAUTION ||
      status === AVAILABILITY_REHAB ||
      status === AVAILABILITY_INJURED
    ) {
      count += 1;
    }
  }
  return count;
}

/**
 * Restituisce il valore di badge associato a uno specifico modulo canonico.
 * @param moduleId Identificativo del modulo canonico
 * @param alertCount Numero alert clinici/sportivi del roster attivo
 * @param favoritesCount Numero preferiti salvati dall'utente
 * @returns Conteggio numerico da visualizzare sul modulo (0 se assente)
 */
export function getModuleBadgeCount(
  moduleId: AppModuleId,
  alertCount: number,
  favoritesCount: number
): number {
  if (moduleId === 'cockpit') {
    return Math.max(0, Math.floor(alertCount));
  }
  if (moduleId === 'favorites') {
    return Math.max(0, Math.floor(favoritesCount));
  }
  return 0;
}

/**
 * Restituisce gli stili inline di focus accessibile preservando la compatibilita con `:focus-visible`.
 * @param isFocused Indica se il controllo ha focus da tastiera attivo
 * @returns Oggetto stili CSS con outline e boxShadow ad alto contrasto
 */
export function getKeyboardFocusStyle(isFocused: boolean): React.CSSProperties {
  if (!isFocused) {
    return {};
  }
  return {
    outline: NAV_FOCUS_OUTLINE,
    outlineOffset: '2px',
    boxShadow: NAV_FOCUS_SHADOW
  };
}

export interface ModuleNavIconProps {
  readonly moduleId: AppModuleId;
  readonly sizePx?: number;
}

/**
 * Icona SVG geometrica minimale per ciascuno dei 7 moduli canonici (zero emoji).
 * @param props Identificativo del modulo e dimensione opzionale in pixel
 * @returns Elemento SVG vettoriale inline accessibile
 */
export const ModuleNavIcon: React.FC<ModuleNavIconProps> = ({
  moduleId,
  sizePx = NAV_ICON_SIZE_PX
}) => {
  const commonProps = {
    width: sizePx,
    height: sizePx,
    viewBox: SVG_VIEWBOX,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: SVG_STROKE_WIDTH,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const
  };

  switch (moduleId) {
    case 'cockpit':
      return (
        <svg {...commonProps}>
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      );
    case 'catalog':
      return (
        <svg {...commonProps}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case 'programming':
      return (
        <svg {...commonProps}>
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="M9 12h6" />
          <path d="M9 16h6" />
        </svg>
      );
    case 'analysis':
      return (
        <svg {...commonProps}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case 'community':
      return (
        <svg {...commonProps}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case 'favorites':
      return (
        <svg {...commonProps}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case 'nutrition':
    default:
      return (
        <svg {...commonProps}>
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      );
  }
};

/**
 * Icona SVG lucchetto minimale per segnalare moduli riservati a Tier superiori.
 * @returns Elemento SVG vettoriale inline
 */
export const LockNavIcon: React.FC = () => (
  <svg
    width={LOCK_ICON_SIZE_PX}
    height={LOCK_ICON_SIZE_PX}
    viewBox={SVG_VIEWBOX}
    fill="none"
    stroke="currentColor"
    strokeWidth={SVG_STROKE_WIDTH}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/**
 * Icona SVG a tre punti orizzontali per il pulsante menu overflow "Altro" su mobile.
 * @returns Elemento SVG vettoriale inline
 */
export const MoreNavIcon: React.FC = () => (
  <svg
    width={NAV_ICON_SIZE_PX}
    height={NAV_ICON_SIZE_PX}
    viewBox={SVG_VIEWBOX}
    fill="none"
    stroke="currentColor"
    strokeWidth={SVG_STROKE_WIDTH}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);
