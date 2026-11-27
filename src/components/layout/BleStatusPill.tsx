/**
 * src/components/layout/BleStatusPill.tsx
 * Pillola compatta per il monitoraggio dello stato della sensoristica hardware Bluetooth (BLE).
 * Mostra stato connessione, telemetria SI in tempo reale a 10 Hz (`tabular-nums`) e controllo dispositivi.
 * Conforme ad ADR-03 (Rigore Metrologico SI), Regola 01 (zero emoji, solo SVG) e Regola 02.
 */

import React, { useState, useCallback, useId } from 'react';
import { useBle } from '../../hooks/useBle';
import { useDismissiblePopover, isKeyboardFocusTarget } from '../../hooks/useDismissiblePopover';
import { BleDeviceInfo, BleDeviceType } from '../../types';
import {
  formatVelocity,
  formatPower,
  formatForce,
  formatHeartRate
} from '../../utils/number-format';

export const Z_INDEX_BLE_POPOVER = 60;
export const BLE_POPOVER_WIDTH_PX = 280;
export const BLE_POPOVER_VIEWPORT_MARGIN_PX = 24;
export const BLE_POPOVER_OFFSET_PX = 8;
export const BLE_POPOVER_BLUR_PX = 20;
export const BLE_PILL_MIN_HEIGHT_PX = 32;
export const BLE_ICON_SIZE_PX = 12;
export const BLE_STATUS_DOT_SIZE_PX = 6;
export const BLE_TRANSITION_MS = 150;
export const BLE_BORDER_RADIUS_PILL_PX = 999;
export const BLE_BORDER_RADIUS_POPOVER_PX = 12;
export const BLE_BORDER_RADIUS_CARD_PX = 8;
export const BLE_BORDER_RADIUS_BUTTON_PX = 6;
export const BLE_DISABLED_OPACITY = 0.55;

export const BLE_STATUS_COLOR_IDLE = '#64748b';
export const BLE_STATUS_COLOR_CONNECTED = '#10b981';
export const BLE_STATUS_COLOR_ACTIVE = '#f59e0b';
export const BLE_PILL_BG = 'rgba(15, 23, 42, 0.75)';
export const BLE_POPOVER_GLASS_BG = 'rgba(15, 23, 42, 0.88)';
export const BLE_TELEMETRY_CARD_BG = 'rgba(15, 23, 42, 0.72)';
export const BLE_DEVICE_ROW_BG = 'rgba(30, 41, 59, 0.5)';
export const BLE_FOCUS_RING_OUTLINE = '2px solid #38bdf8';
export const BLE_FOCUS_RING_SHADOW = '0 0 0 3px rgba(56, 189, 248, 0.35)';
export const BLE_ACTION_ERROR_FALLBACK = 'Operazione BLE non riuscita. Riprova.';

export type BleExtendedDeviceType = BleDeviceType | 't7_wearable';

export const BLE_DEVICE_TYPE_LABELS: Readonly<Record<BleExtendedDeviceType, string>> = Object.freeze({
  vbt_encoder: 'Encoder VBT',
  heart_rate_strap: 'Cardiofrequenzimetro',
  t7_wearable: 'Wearable T7',
  smart_scale: 'Bilancia Smart BIA',
  lactate_analyzer: 'Analizzatore Lattato',
  gps_tracker: 'Tracker GPS',
  optical_sensor: 'Sensore Ottico',
  generic_sensor: 'Sensore Generico'
});

export interface BleStatusPillProps {
  /** Permette di aprire il popover al primo render per test statici. */
  defaultOpen?: boolean;
}

/**
 * Risolve l'etichetta italiana leggibile per qualsiasi tipologia di sensore BLE supportata.
 * @param deviceType Tipologia hardware del dispositivo BLE
 * @returns Etichetta descrittiva localizzata in italiano
 */
export function getBleDeviceTypeLabel(deviceType: BleExtendedDeviceType): string {
  return BLE_DEVICE_TYPE_LABELS[deviceType] ?? BLE_DEVICE_TYPE_LABELS.generic_sensor;
}

/**
 * Pillola di stato BLE nella GlobalHeader con popover diagnostico e telemetria SI a 10 Hz.
 * @param props Proprieta opzionali del componente (es. `defaultOpen`)
 * @returns Elemento React con trigger BLE e pannello di controllo dispositivi
 */
export const BleStatusPill: React.FC<BleStatusPillProps> = ({
  defaultOpen = false
}) => {
  const {
    devices,
    isAnyConnected,
    isScanning,
    isSimulatorActive,
    connectionStatusLabel,
    vbtVelocity,
    vbtPower,
    vbtForce,
    heartRateBpm,
    startScan,
    connectDevice,
    disconnectDevice,
    toggleSimulator,
    generateMockRepetition
  } = useBle();

  const [actionError, setActionError] = useState<string | null>(null);
  const [focusedElementId, setFocusedElementId] = useState<string | null>(null);
  const popoverId = useId();

  /**
   * Pulisce eventuali errori transienti e stato focus alla chiusura del popover.
   */
  const handlePopoverClose = useCallback((): void => {
    setActionError(null);
    setFocusedElementId(null);
  }, []);

  const {
    isOpen,
    toggle,
    containerRef,
    triggerRef
  } = useDismissiblePopover({
    initialOpen: defaultOpen,
    onClose: handlePopoverClose
  });

  /**
   * Gestisce in sicurezza connessione o disconnessione asincrona di un sensore BLE.
   * @param device Informazioni correnti del dispositivo target
   */
  const handleDeviceToggle = useCallback(
    async (device: BleDeviceInfo): Promise<void> => {
      if (device.connectionStatus === 'connecting' || device.connectionStatus === 'disconnecting') {
        return;
      }
      setActionError(null);
      try {
        if (device.connectionStatus === 'connected') {
          await disconnectDevice(device.id);
        } else {
          await connectDevice(device.id);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : BLE_ACTION_ERROR_FALLBACK;
        setActionError(message);
      }
    },
    [connectDevice, disconnectDevice]
  );

  /**
   * Avvia in sicurezza la scansione BLE gestendo eventuali promise rifiutate.
   */
  const handleStartScan = useCallback(async (): Promise<void> => {
    if (isScanning) {
      return;
    }
    setActionError(null);
    try {
      await startScan();
    } catch (err) {
      const message = err instanceof Error ? err.message : BLE_ACTION_ERROR_FALLBACK;
      setActionError(message);
    }
  }, [isScanning, startScan]);

  /**
   * Evidenzia il controllo con anello focus visibile solo su navigazione da tastiera.
   * @param elementId Identificativo logico del bottone
   * @param event Evento focus React
   */
  const handleControlFocus = useCallback(
    (elementId: string, event: React.FocusEvent<HTMLButtonElement>): void => {
      if (isKeyboardFocusTarget(event.currentTarget)) {
        setFocusedElementId(elementId);
      }
    },
    []
  );

  /**
   * Rimuove l'anello focus al blur del controllo.
   * @param elementId Identificativo logico del bottone
   */
  const handleControlBlur = useCallback((elementId: string): void => {
    setFocusedElementId((prev) => (prev === elementId ? null : prev));
  }, []);

  /**
   * Restituisce lo stile `:focus-visible` per il controllo indicato.
   * @param elementId Identificativo logico del bottone
   * @returns Oggetto CSS parziale di evidenziazione focus
   */
  const getFocusStyle = useCallback(
    (elementId: string): React.CSSProperties => {
      if (focusedElementId !== elementId) {
        return {};
      }
      return {
        outline: BLE_FOCUS_RING_OUTLINE,
        outlineOffset: '2px',
        boxShadow: BLE_FOCUS_RING_SHADOW
      };
    },
    [focusedElementId]
  );

  let statusColor = BLE_STATUS_COLOR_IDLE;
  if (isAnyConnected) {
    statusColor = BLE_STATUS_COLOR_CONNECTED;
  } else if (isScanning || isSimulatorActive) {
    statusColor = BLE_STATUS_COLOR_ACTIVE;
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Pillola Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        onFocus={(e) => handleControlFocus('trigger', e)}
        onBlur={() => handleControlBlur('trigger')}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? popoverId : undefined}
        aria-label="Stato sensori Bluetooth e telemetria, premi per dettagli"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          minHeight: `${BLE_PILL_MIN_HEIGHT_PX}px`,
          padding: '0.25rem 0.65rem',
          backgroundColor: BLE_PILL_BG,
          border: `1px solid ${statusColor}44`,
          borderRadius: `${BLE_BORDER_RADIUS_PILL_PX}px`,
          color: '#f1f5f9',
          cursor: 'pointer',
          fontSize: '0.75rem',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          transition: `all ${BLE_TRANSITION_MS}ms ease-in-out`,
          ...getFocusStyle('trigger')
        }}
      >
        {/* Icona Bluetooth SVG */}
        <svg
          width={BLE_ICON_SIZE_PX}
          height={BLE_ICON_SIZE_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke={statusColor}
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5" />
        </svg>

        {/* Dot di stato */}
        <span
          style={{
            width: `${BLE_STATUS_DOT_SIZE_PX}px`,
            height: `${BLE_STATUS_DOT_SIZE_PX}px`,
            borderRadius: '50%',
            backgroundColor: statusColor,
            boxShadow: `0 0 6px ${statusColor}`
          }}
        />

        <span>{isSimulatorActive ? 'SIM 10Hz' : isAnyConnected ? 'BLE ATTIVO' : 'BLE'}</span>
      </button>

      {/* Popover Dettaglio Telemetria & Controllo Dispositivi */}
      {isOpen && (
        <div
          id={popoverId}
          role="dialog"
          aria-label="Pannello telemetria BLE e sensori"
          style={{
            position: 'absolute',
            top: `calc(100% + ${BLE_POPOVER_OFFSET_PX}px)`,
            right: 0,
            width: `min(${BLE_POPOVER_WIDTH_PX}px, calc(100vw - ${BLE_POPOVER_VIEWPORT_MARGIN_PX}px))`,
            maxWidth: `calc(100vw - ${BLE_POPOVER_VIEWPORT_MARGIN_PX}px)`,
            backgroundColor: BLE_POPOVER_GLASS_BG,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: `${BLE_BORDER_RADIUS_POPOVER_PX}px`,
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.7)',
            padding: '0.75rem',
            zIndex: Z_INDEX_BLE_POPOVER,
            backdropFilter: `blur(${BLE_POPOVER_BLUR_PX}px)`,
            WebkitBackdropFilter: `blur(${BLE_POPOVER_BLUR_PX}px)`
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              Telemetria Hardware
            </span>
            <span style={{ fontSize: '0.7rem', color: statusColor, fontWeight: 600, textAlign: 'right' }}>
              {connectionStatusLabel}
            </span>
          </div>

          {/* Messaggio di errore operativo se una chiamata BLE fallisce */}
          {actionError && (
            <div
              role="alert"
              style={{
                marginBottom: '0.5rem',
                padding: '0.35rem 0.5rem',
                borderRadius: `${BLE_BORDER_RADIUS_BUTTON_PX}px`,
                backgroundColor: 'rgba(244, 63, 94, 0.16)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                color: '#fda4af',
                fontSize: '0.7rem'
              }}
            >
              {actionError}
            </div>
          )}

          {/* Elenco Dispositivi */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
            {devices.map((dev) => {
              const isConnected = dev.connectionStatus === 'connected';
              const isTransitioning =
                dev.connectionStatus === 'connecting' || dev.connectionStatus === 'disconnecting';
              const controlId = `ble-dev-${dev.id}`;

              return (
                <div
                  key={dev.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    padding: '0.4rem 0.5rem',
                    backgroundColor: BLE_DEVICE_ROW_BG,
                    borderRadius: `${BLE_BORDER_RADIUS_CARD_PX}px`,
                    fontSize: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontWeight: 600, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {dev.name}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                      {getBleDeviceTypeLabel(dev.type)}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isTransitioning}
                    onClick={() => {
                      void handleDeviceToggle(dev);
                    }}
                    onFocus={(e) => handleControlFocus(controlId, e)}
                    onBlur={() => handleControlBlur(controlId)}
                    style={{
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      borderRadius: `${BLE_BORDER_RADIUS_BUTTON_PX}px`,
                      border: 'none',
                      flexShrink: 0,
                      backgroundColor: isConnected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: isConnected ? '#ef4444' : '#10b981',
                      opacity: isTransitioning ? BLE_DISABLED_OPACITY : 1,
                      cursor: isTransitioning ? 'not-allowed' : 'pointer',
                      ...getFocusStyle(controlId)
                    }}
                  >
                    {isTransitioning ? '...' : isConnected ? 'Disconnetti' : 'Connetti'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Telemetria Live SI a 10 Hz con cifre tabellari anti-jitter */}
          {(isSimulatorActive || isAnyConnected) && (
            <div
              style={{
                padding: '0.5rem',
                backgroundColor: BLE_TELEMETRY_CARD_BG,
                borderRadius: `${BLE_BORDER_RADIUS_CARD_PX}px`,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '0.75rem',
                fontSize: '0.72rem'
              }}
            >
              <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: '0.3rem' }}>Metriche Live:</div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.3rem',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                <div>Velocita: <strong>{formatVelocity(vbtVelocity)}</strong></div>
                <div>Potenza: <strong>{formatPower(vbtPower)}</strong></div>
                <div>Forza: <strong>{formatForce(vbtForce)}</strong></div>
                <div>Cardio: <strong>{formatHeartRate(heartRateBpm)}</strong></div>
              </div>
            </div>
          )}

          {/* Azioni rapide di testing / simulazione */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={() => toggleSimulator()}
              onFocus={(e) => handleControlFocus('btn-sim', e)}
              onBlur={() => handleControlBlur('btn-sim')}
              style={{
                width: '100%',
                padding: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: isSimulatorActive ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                color: isSimulatorActive ? '#f59e0b' : '#38bdf8',
                border: 'none',
                borderRadius: `${BLE_BORDER_RADIUS_BUTTON_PX}px`,
                cursor: 'pointer',
                ...getFocusStyle('btn-sim')
              }}
            >
              {isSimulatorActive ? 'Arresta Simulatore' : 'Avvia Simulatore 10 Hz'}
            </button>

            <button
              type="button"
              onClick={() => generateMockRepetition()}
              onFocus={(e) => handleControlFocus('btn-mock-rep', e)}
              onBlur={() => handleControlBlur('btn-mock-rep')}
              style={{
                width: '100%',
                padding: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: 'none',
                borderRadius: `${BLE_BORDER_RADIUS_BUTTON_PX}px`,
                cursor: 'pointer',
                ...getFocusStyle('btn-mock-rep')
              }}
            >
              Genera Ripetizione VBT Mock
            </button>

            <button
              type="button"
              disabled={isScanning}
              onClick={() => {
                void handleStartScan();
              }}
              onFocus={(e) => handleControlFocus('btn-scan', e)}
              onBlur={() => handleControlBlur('btn-scan')}
              style={{
                width: '100%',
                padding: '0.35rem',
                fontSize: '0.75rem',
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: `${BLE_BORDER_RADIUS_BUTTON_PX}px`,
                opacity: isScanning ? BLE_DISABLED_OPACITY : 1,
                cursor: isScanning ? 'not-allowed' : 'pointer',
                ...getFocusStyle('btn-scan')
              }}
            >
              {isScanning ? 'Scansione in corso...' : 'Cerca Nuovi Dispositivi BLE'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BleStatusPill;
