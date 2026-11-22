/**
 * src/components/layout/BleStatusPill.tsx
 * Pillola compatta per il monitoraggio dello stato della sensoristica hardware Bluetooth (BLE).
 * Mostra stato connessione, telemetria in tempo reale e controllo simulatore locale a 10 Hz.
 * Conforme ad ADR-03 (Rigore Metrologico SI) e Regola 01 (zero emoji spontanee, solo SVG).
 */

import React, { useState, useRef, useEffect } from 'react';
import { useBle } from '../../hooks/useBle';

export const Z_INDEX_BLE_POPOVER = 60;

export const BleStatusPill: React.FC = () => {
  const {
    devices,
    isAnyConnected,
    isVbtConnected,
    isHeartRateConnected,
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

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  let statusColor = '#64748b'; // Grigio di default
  if (isAnyConnected) {
    statusColor = '#10b981'; // Verde connesso
  } else if (isScanning || isSimulatorActive) {
    statusColor = '#f59e0b'; // Ambra scansione / simulatore
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Pillola Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Stato sensori Bluetooth e telemetria, premi per dettagli"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          minHeight: '32px',
          padding: '0.25rem 0.65rem',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          border: `1px solid ${statusColor}44`,
          borderRadius: '999px',
          color: '#f1f5f9',
          cursor: 'pointer',
          fontSize: '0.75rem',
          fontWeight: 600,
          outline: 'none',
          transition: 'all 150ms ease-in-out'
        }}
      >
        {/* Icona Bluetooth SVG */}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="2.5">
          <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5" />
        </svg>

        {/* Dot di stato */}
        <span
          style={{
            width: '6px',
            height: '6px',
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
          role="dialog"
          aria-label="Pannello telemetria BLE e sensori"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '280px',
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.7)',
            padding: '0.75rem',
            zIndex: Z_INDEX_BLE_POPOVER,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              Telemetria Hardware
            </span>
            <span style={{ fontSize: '0.7rem', color: statusColor, fontWeight: 600 }}>
              {connectionStatusLabel}
            </span>
          </div>

          {/* Elenco Dispositivi */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
            {devices.map((dev) => {
              const isConnected = dev.connectionStatus === 'connected';
              const isConnecting = dev.connectionStatus === 'connecting';

              return (
                <div
                  key={dev.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0.5rem',
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    borderRadius: '8px',
                    fontSize: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>{dev.name}</span>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                      {dev.type === 'vbt_encoder' ? 'Encoder VBT' : 'Cardiofrequenzimetro'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isConnected) {
                        disconnectDevice(dev.id);
                      } else {
                        connectDevice(dev.id);
                      }
                    }}
                    style={{
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: isConnected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: isConnected ? '#ef4444' : '#10b981',
                      cursor: 'pointer'
                    }}
                  >
                    {isConnecting ? '...' : isConnected ? 'Disconnetti' : 'Connetti'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Telemetria Live se attiva */}
          {(isSimulatorActive || isAnyConnected) && (
            <div
              style={{
                padding: '0.5rem',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '0.75rem',
                fontSize: '0.72rem'
              }}
            >
              <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: '0.3rem' }}>Metriche Live:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                <div>Velocita: <strong>{vbtVelocity !== null ? `${vbtVelocity} m/s` : '--'}</strong></div>
                <div>Potenza: <strong>{vbtPower !== null ? `${vbtPower} W` : '--'}</strong></div>
                <div>Forza: <strong>{vbtForce !== null ? `${vbtForce} N` : '--'}</strong></div>
                <div>Cardio: <strong>{heartRateBpm !== null ? `${heartRateBpm} bpm` : '--'}</strong></div>
              </div>
            </div>
          )}

          {/* Azioni rapide di testing / simulazione */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={() => toggleSimulator()}
              style={{
                width: '100%',
                padding: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: isSimulatorActive ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                color: isSimulatorActive ? '#f59e0b' : '#38bdf8',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {isSimulatorActive ? 'Arresta Simulatore' : 'Avvia Simulatore 10 Hz'}
            </button>

            <button
              type="button"
              onClick={() => generateMockRepetition()}
              style={{
                width: '100%',
                padding: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Genera Ripetizione VBT Mock
            </button>

            <button
              type="button"
              onClick={() => startScan()}
              style={{
                width: '100%',
                padding: '0.35rem',
                fontSize: '0.75rem',
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                cursor: 'pointer'
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
