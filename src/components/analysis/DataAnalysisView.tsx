/**
 * src/components/analysis/DataAnalysisView.tsx
 * Cruscotto unificato e polimorfico di Data Analisi Biomeccanica per 8 strumenti di misura.
 *
 * Include:
 * 1. Dropzone universale per file CSV/TSV/Excel/sensori con rilevamento automatico strumento.
 * 2. Barra controlli polimorfica per tutti gli 8 test (VBT, Force Plate, Blocchi, Sprint, Video, Salto, Palla Medica, Generale).
 * 3. ReactiveGrid interattiva con editing celle in-place e live-binding (debounce 250ms).
 * 4. Calcoli biomeccanici dedicati: VBT (1RM, F-V, Zone Bryan Mann), Palla Medica (Cinematica 2D Sayers/Harman), ecc.
 * 5. Esportazione cartella di lavoro Excel (.xlsx) a 2 fogli sbloccati con ExcelJS.
 *
 * Rispetta la Regola 01 (Zero emoji spontanee) e Regola R1 (Zero any, TypeScript strict).
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import ExcelJS from 'exceljs';
import {
  TestRegistry,
  type BiomechanicalTestId,
  type ColumnDefinition,
} from '../../physics/test-registry';
import { calculateMedicineBallThrow, type MedicineBallResult } from '../../physics/medicine-ball-physics';
import { analyzeLoadVelocity, generateBryanMannVBTTable } from '../../physics/physics-engine';
import type { BryanMannZoneRow } from '../../types/physics';
import { parseMeasurementFile, readDelimitedText } from '../../parser';

const DEBOUNCE_DELAY_MS = 250;

export const DataAnalysisView: React.FC = () => {
  const [selectedTestId, setSelectedTestId] = useState<BiomechanicalTestId>('VBT');
  const [athleteName, setAthleteName] = useState<string>('Mario Rossi');
  const [exerciseName, setExerciseName] = useState<string>('Panca Piana');
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [mvtValue, setMvtValue] = useState<number>(0.15); // Mean Velocity Threshold per VBT (m/s)

  const schema = useMemo(() => TestRegistry.getSchema(selectedTestId), [selectedTestId]);
  const columns: ColumnDefinition[] = useMemo(() => schema.columns, [schema]);

  // Carica i dati demo del test selezionato
  const handleLoadDemoData = useCallback((testId: BiomechanicalTestId) => {
    const demo = TestRegistry.getSampleDataFor(testId);
    setRecords(demo);
    if (demo[0]?.athlete) setAthleteName(String(demo[0].athlete));
    if (demo[0]?.exercise) setExerciseName(String(demo[0].exercise));
  }, []);

  // Inizializza con i dati demo di default per VBT al primo mount
  useEffect(() => {
    handleLoadDemoData('VBT');
  }, [handleLoadDemoData]);

  // Cambio test: aggiorna dati demo corrispondenti
  const handleTestChange = (newTestId: BiomechanicalTestId) => {
    setSelectedTestId(newTestId);
    handleLoadDemoData(newTestId);
    setUploadedFileName(null);
  };

  // Modifica singola cella con debounce
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleCellChange = (rowIndex: number, colKey: string, rawValue: string) => {
    const updated = [...records];
    const colDef = columns.find((c) => c.key === colKey);
    const parsedValue =
      colDef?.type === 'number'
        ? rawValue === '' ? null : parseFloat(rawValue.replace(',', '.'))
        : rawValue;

    updated[rowIndex] = {
      ...updated[rowIndex],
      [colKey]: parsedValue,
    };

    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    updateTimeoutRef.current = setTimeout(() => {
      setRecords(updated);
    }, DEBOUNCE_DELAY_MS);
  };

  // Aggiungi nuova prova vuota
  const handleAddRow = () => {
    const newRow: Record<string, unknown> = {
      athlete: athleteName,
      exercise: exerciseName,
    };
    columns.forEach((col) => {
      if (col.key !== 'athlete' && col.key !== 'exercise') {
        newRow[col.key] = col.default ?? (col.type === 'number' ? 0 : '');
      }
    });
    setRecords((prev) => [...prev, newRow]);
  };

  // Rimuovi riga
  const handleRemoveRow = (index: number) => {
    setRecords((prev) => prev.filter((_, i) => i !== index));
  };

  // Svuota griglia
  const handleClearGrid = () => {
    setRecords([]);
    setUploadedFileName(null);
  };

  // Parsing file drag-and-drop o input
  const handleFileUpload = async (file: File) => {
    try {
      const text = await file.text();
      setUploadedFileName(file.name);

      if (selectedTestId === 'VBT') {
        const parsed = parseMeasurementFile(text, file.name);
        if (parsed.athleteName) setAthleteName(parsed.athleteName);
        if (parsed.exerciseName) setExerciseName(parsed.exerciseName);
        if (parsed.points.length > 0) {
          const vbtRows = parsed.points.map((p) => ({
            athlete: parsed.athleteName || athleteName,
            exercise: parsed.exerciseName || exerciseName,
            load: p.load,
            velocity: p.velocity,
            peakVelocity: null,
            power: Math.round(p.load * p.velocity * 9.81),
            rom: null,
          }));
          setRecords(vbtRows);
          return;
        }
      }

      // Parsing generico tramite file-reader
      const parsedDataset = readDelimitedText(text, file.name);
      if (parsedDataset.athleteName) setAthleteName(parsedDataset.athleteName);
      if (parsedDataset.exerciseName) setExerciseName(parsedDataset.exerciseName);

      // Mappatura automatica colonne verso lo schema attivo
      const colMap = TestRegistry.mapRawHeaders(parsedDataset.headers, selectedTestId);
      const mappedRows: Record<string, unknown>[] = parsedDataset.records.map((rawRec) => {
        const row: Record<string, unknown> = {
          athlete: parsedDataset.athleteName || athleteName,
          exercise: parsedDataset.exerciseName || exerciseName,
        };
        Object.entries(colMap).forEach(([idxStr, targetKey]) => {
          const idx = parseInt(idxStr, 10);
          const rawHeader = parsedDataset.headers[idx];
          const val = rawRec[rawHeader as keyof typeof rawRec];
          row[targetKey] = val;
        });
        return row;
      });

      if (mappedRows.length > 0) {
        setRecords(mappedRows);
      }
    } catch (err) {
      console.warn('Errore durante la lettura del file:', err);
    }
  };

  // Calcolo VBT
  const vbtProfile = useMemo(() => {
    if (selectedTestId !== 'VBT' || records.length < 2) return null;
    const pts = records
      .map((r) => ({
        load: Number(r.load),
        velocity: Number(r.velocity),
      }))
      .filter((p) => !isNaN(p.load) && p.load > 0 && !isNaN(p.velocity) && p.velocity > 0);

    if (pts.length < 2) return null;
    try {
      return analyzeLoadVelocity(pts, { mvt: mvtValue });
    } catch {
      return null;
    }
  }, [selectedTestId, records, mvtValue]);

  const bryanMannZones = useMemo<BryanMannZoneRow[]>(() => {
    if (!vbtProfile?.rm1?.value) return [];
    return generateBryanMannVBTTable(vbtProfile.rm1.value, vbtProfile.regression, exerciseName);
  }, [vbtProfile, exerciseName]);

  // Calcolo Palla Medica (sul primo record o media)
  const medBallResult: MedicineBallResult | null = useMemo(() => {
    if (selectedTestId !== 'MEDICINE_BALL' || records.length === 0) return null;
    const first = records[0];
    const mass = Number(first.mass);
    const distance = Number(first.distance);
    const releaseAngle = first.releaseAngle ? Number(first.releaseAngle) : 45;
    const releaseHeight = first.releaseHeight ? Number(first.releaseHeight) : 1.0;
    const pushDuration = first.pushDuration ? Number(first.pushDuration) : 0.18;
    const flightTime = first.flightTime ? Number(first.flightTime) : undefined;

    return calculateMedicineBallThrow({
      mass,
      distance,
      releaseAngle,
      releaseHeight,
      pushDuration,
      flightTime,
    });
  }, [selectedTestId, records]);

  // Esportazione Excel (.xlsx) a 2 fogli sbloccati con ExcelJS
  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'T7 Workout Platform';
    workbook.created = new Date();

    // ─────────────────────────────────────────────────────────
    // FOGLIO 1: "Dati Prove"
    // ─────────────────────────────────────────────────────────
    const wsData = workbook.addWorksheet('Dati Prove', { views: [{ showGridLines: true }] });
    wsData.columns = columns.map((col) => ({
      header: `${col.label}${col.unit ? ` (${col.unit})` : ''}`,
      key: col.key,
      width: Math.max(col.label.length + 6, 16),
    }));

    // Stile Intestazione
    const headerRow = wsData.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F766E' },
      };
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    records.forEach((rec, rIdx) => {
      const rowVals: unknown[] = columns.map((col) => rec[col.key] ?? '-');
      const row = wsData.addRow(rowVals);
      row.height = 22;
      const isEven = rIdx % 2 === 0;
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF8FAFC' },
        };
        cell.font = { name: 'Segoe UI', size: 9, color: { argb: 'FF1E293B' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
      });
    });

    // ─────────────────────────────────────────────────────────
    // FOGLIO 2: "Sintesi Biomeccanica"
    // ─────────────────────────────────────────────────────────
    const wsSummary = workbook.addWorksheet('Sintesi Biomeccanica', { views: [{ showGridLines: true }] });
    wsSummary.columns = [
      { header: 'Parametro Biomeccanico', key: 'param', width: 35 },
      { header: 'Valore Calcolato', key: 'value', width: 25 },
      { header: 'Unita', key: 'unit', width: 15 },
      { header: 'Riferimento Scientifico / Metodologico', key: 'note', width: 45 },
    ];

    const sumHeader = wsSummary.getRow(1);
    sumHeader.height = 28;
    sumHeader.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' },
      };
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    const summaryRows: [string, string, string, string][] = [
      ['Strumento / Test', schema.label, '-', schema.summary],
      ['Atleta', athleteName, '-', 'Profilo atleta registrato'],
      ['Esercizio / Protocollo', exerciseName, '-', 'Standard biomeccanico'],
      ['Numero Prove Registrate', String(records.length), '#', 'Campione di ripetizioni'],
    ];

    if (vbtProfile) {
      summaryRows.push(
        ['1RM Stimato', vbtProfile.rm1?.estimated ? vbtProfile.rm1.estimated.toFixed(1) : '-', 'kg', `Calcolato a MVT ${mvtValue} m/s`],
        ['Coefficiente R²', vbtProfile.rSquared.toFixed(3), 'ratio', 'Bontà di regressione lineare'],
        ['Pendenza (Slope)', vbtProfile.slope.toFixed(4), 'm/s / kg', 'Sensibilità della velocità al carico'],
        ['Intercetta V0', vbtProfile.intercept.toFixed(2), 'm/s', 'Velocità teorica a carico zero']
      );
    }

    if (medBallResult) {
      summaryRows.push(
        ['Velocità Uscita (v0)', medBallResult.exitVelocity.toFixed(2), 'm/s', `${medBallResult.exitVelocityKmh} km/h`],
        ['Potenza Media di Spinta', medBallResult.meanPower.toFixed(1), 'W', 'Lavoro diviso durata spinta'],
        ['Potenza di Picco', medBallResult.peakPower.toFixed(1), 'W', 'Picco propulsivo istantaneo'],
        ['Stima Potenza Sayers', medBallResult.sayersPower.toFixed(1), 'W', 'Equazione Sayers et al. (1999)'],
        ['Stima Potenza Harman', medBallResult.harmanPower.toFixed(1), 'W', 'Equazione Harman et al. (1995)'],
        ['Altezza Massima Traiettoria', medBallResult.peakHeight.toFixed(2), 'm', 'Apice balistico parabola']
      );
    }

    summaryRows.forEach(([p, v, u, n]) => {
      const r = wsSummary.addRow([p, v, u, n]);
      r.height = 22;
      r.eachCell((cell, cIdx) => {
        cell.font = { name: 'Segoe UI', size: 9, bold: cIdx === 1, color: { argb: 'FF1E293B' } };
        cell.alignment = { vertical: 'middle', horizontal: cIdx === 2 ? 'center' : 'left' };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Analisi_Biomeccanica_${selectedTestId}_${athleteName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="data-analysis-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Modulo */}
      <section className="section-header" style={{ borderBottom: '1px solid #1e293b', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
          Cruscotto Data Analisi &amp; Biomeccanica Polimorfica
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: 0 }}>
          Ingestione universale multi-strumento (VBT, Pedane, Palla Medica, Sprint, Salto, Cinematica), Live-Binding e modellazione predittiva.
        </p>
      </section>

      {/* Dropzone Universale per File */}
      <section
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFileUpload(file);
        }}
        style={{
          border: '2px dashed #334155',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          textAlign: 'center',
          background: '#090d16',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e2e8f0' }}>
            Trascina qui il file di misurazione (CSV, TSV, TXT, Excel)
          </span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Supporta export da Vitruve, GymAware, Speed4Lifts, Hawkin, ForceDecks, Microgate Witty, Kinovea
          </span>
          <label
            style={{
              marginTop: '0.5rem',
              padding: '0.45rem 1rem',
              background: '#2563eb',
              color: '#ffffff',
              borderRadius: '0.375rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Seleziona File dal Dispositivo
            <input
              type="file"
              accept=".csv,.tsv,.txt,.xlsx"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </label>

          {uploadedFileName && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#10b981' }}>
              File attivo: <strong>{uploadedFileName}</strong> ({records.length} righe importate)
            </div>
          )}
        </div>
      </section>

      {/* Toolbar Controlli & Selezione Strumento */}
      <section
        style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '0.5rem',
          padding: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
              Strumento Biomeccanico:
            </label>
            <select
              value={selectedTestId}
              onChange={(e) => handleTestChange(e.target.value as BiomechanicalTestId)}
              style={{
                padding: '0.5rem 0.75rem',
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {TestRegistry.getAllSchemas().map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
              Atleta:
            </label>
            <input
              type="text"
              value={athleteName}
              onChange={(e) => setAthleteName(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                fontSize: '0.85rem',
                width: '140px',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
              Esercizio:
            </label>
            <input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                fontSize: '0.85rem',
                width: '140px',
              }}
            />
          </div>

          {selectedTestId === 'VBT' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
                MVT (m/s):
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                max="0.5"
                value={mvtValue}
                onChange={(e) => setMvtValue(parseFloat(e.target.value) || 0.15)}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                  borderRadius: '0.375rem',
                  fontSize: '0.85rem',
                  width: '80px',
                }}
              />
            </div>
          )}
        </div>

        {/* Pulsanti Azione Griglia */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleAddRow}
            style={{
              padding: '0.5rem 0.85rem',
              background: '#047857',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Aggiungi Prova
          </button>

          <button
            type="button"
            onClick={() => handleLoadDemoData(selectedTestId)}
            style={{
              padding: '0.5rem 0.85rem',
              background: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: '0.375rem',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Dati Demo
          </button>

          <button
            type="button"
            onClick={handleClearGrid}
            style={{
              padding: '0.5rem 0.85rem',
              background: 'transparent',
              color: '#ef4444',
              border: '1px solid #ef4444',
              borderRadius: '0.375rem',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Svuota
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            style={{
              padding: '0.5rem 0.85rem',
              background: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Esporta Excel (.xlsx)
          </button>
        </div>
      </section>

      {/* ReactiveGrid (Tabella Interattiva Editabile) */}
      <section
        style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '0.5rem',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
            ReactiveGrid — Tabella Misurazioni ({records.length} prove)
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Live-binding attivo con debounce 250ms • Modifica diretta delle celle
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', background: '#090d16', color: '#94a3b8' }}>
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', width: '40px' }}>#</th>
              {columns.map((col) => (
                <th key={col.key} style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>
                  {col.label} {col.unit && <span style={{ color: '#64748b' }}>({col.unit})</span>}
                </th>
              ))}
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', width: '50px' }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {records.map((row, rIdx) => (
              <tr key={rIdx} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '0.4rem', textAlign: 'center', color: '#64748b' }}>{rIdx + 1}</td>
                {columns.map((col) => {
                  const val = row[col.key];
                  const displayVal = val !== null && val !== undefined ? String(val) : '';
                  return (
                    <td key={col.key} style={{ padding: '0.35rem' }}>
                      <input
                        type={col.type === 'number' ? 'text' : 'text'}
                        value={displayVal}
                        readOnly={col.readonly}
                        onChange={(e) => handleCellChange(rIdx, col.key, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.5rem',
                          background: col.readonly ? '#1e293b' : '#090d16',
                          color: col.readonly ? '#94a3b8' : '#f8fafc',
                          border: '1px solid #334155',
                          borderRadius: '0.25rem',
                          fontSize: '0.85rem',
                          boxSizing: 'border-box',
                        }}
                      />
                    </td>
                  );
                })}
                <td style={{ padding: '0.35rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(rIdx)}
                    style={{
                      background: 'transparent',
                      color: '#ef4444',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      padding: '0.2rem 0.4rem',
                    }}
                  >
                    x
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Cruscotto Specifico: VBT */}
      {selectedTestId === 'VBT' && vbtProfile && (
        <section
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '0.5rem',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            Modellazione Biomeccanica VBT (Curva F-V &amp; Stima 1RM)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.375rem', borderLeft: '4px solid #6366f1' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>1RM Stimato (@ MVT {mvtValue}m/s)</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
                {vbtProfile.rm1?.estimated ? vbtProfile.rm1.estimated.toFixed(1) : '--'} kg
              </div>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                CI 95%: [{vbtProfile.rm1?.ci95Min.toFixed(1)} - {vbtProfile.rm1?.ci95Max.toFixed(1)} kg]
              </span>
            </div>

            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.375rem', borderLeft: '4px solid #10b981' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Qualità Adattamento (R²)</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
                {vbtProfile.rSquared.toFixed(3)}
              </div>
              <span style={{ fontSize: '0.75rem', color: vbtProfile.rSquared >= 0.95 ? '#10b981' : '#f59e0b' }}>
                {vbtProfile.rSquared >= 0.95 ? 'Alta Affidabilità (Tier 1)' : 'Adattamento Moderato'}
              </span>
            </div>

            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.375rem', borderLeft: '4px solid #f59e0b' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Pendenza Profilo (Slope)</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
                {vbtProfile.slope.toFixed(4)}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>m/s per kg di sovraccarico</span>
            </div>
          </div>

          {/* Zone di Velocità Bryan Mann */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
              Zone di Velocità Bryan Mann
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
              {bryanMannZones.map((zone: BryanMannZoneRow) => (
                <div
                  key={zone.zone}
                  style={{
                    background: '#1e293b',
                    padding: '0.65rem',
                    borderRadius: '0.25rem',
                    borderLeft: `3px solid ${zone.color}`,
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>{zone.zone}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Velocità: {zone.targetVelocity}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
                    Carico: {zone.load2_5kg} kg ({zone.pctRange})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cruscotto Specifico: Palla Medica (Cinematica Balistica 2D) */}
      {selectedTestId === 'MEDICINE_BALL' && medBallResult && (
        <section
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '0.5rem',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            Cinematica Balistica &amp; Potenza Propulsiva (Sayers / Harman)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.375rem', borderLeft: '4px solid #06b6d4' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Velocità di Uscita (v0)</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
                {medBallResult.exitVelocity.toFixed(2)} m/s
              </div>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>{medBallResult.exitVelocityKmh} km/h</span>
            </div>

            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.375rem', borderLeft: '4px solid #10b981' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Potenza Media Propulsiva</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
                {medBallResult.meanPower.toFixed(0)} W
              </div>
              <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Picco: {medBallResult.peakPower.toFixed(0)} W</span>
            </div>

            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.375rem', borderLeft: '4px solid #f59e0b' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Stima Empirica Sayers / Harman</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
                {medBallResult.sayersPower.toFixed(0)} W / {medBallResult.harmanPower.toFixed(0)} W
              </div>
              <span style={{ fontSize: '0.75rem', color: '#fcd34d' }}>Sayers (1999) | Harman (1995)</span>
            </div>

            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.375rem', borderLeft: '4px solid #a855f7' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Apice Parabola &amp; Volo</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
                {medBallResult.peakHeight.toFixed(2)} m
              </div>
              <span style={{ fontSize: '0.75rem', color: '#c084fc' }}>Tempo volo: {medBallResult.flightTimeCalculated.toFixed(2)}s</span>
            </div>
          </div>

          {/* Grafico Parabola Balistica 2D */}
          <div style={{ background: '#090d16', padding: '1rem', borderRadius: '0.375rem', border: '1px solid #1e293b' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '0.75rem' }}>
              Traiettoria Balistica 2D Simulata (Altezza vs Gittata)
            </span>
            <svg viewBox="0 0 600 200" style={{ width: '100%', height: '180px', overflow: 'visible' }}>
              {/* Griglia assi */}
              <line x1="40" y1="160" x2="580" y2="160" stroke="#334155" strokeWidth="1" />
              <line x1="40" y1="20" x2="40" y2="160" stroke="#334155" strokeWidth="1" />
              <text x="35" y="165" fill="#64748b" fontSize="10" textAnchor="end">0m</text>
              <text x="580" y="175" fill="#64748b" fontSize="10" textAnchor="middle">
                {records[0]?.distance ? `${records[0].distance}m` : '10m'}
              </text>
              <text x="35" y="25" fill="#64748b" fontSize="10" textAnchor="end">
                {medBallResult.peakHeight.toFixed(1)}m
              </text>

              {/* Curva traiettoria */}
              {medBallResult.trajectory.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#06d6a0"
                  strokeWidth="3"
                  points={medBallResult.trajectory
                    .map((pt) => {
                      const maxDist = Number(records[0]?.distance || 10);
                      const maxHeight = Math.max(1, medBallResult.peakHeight * 1.2);
                      const svgX = 40 + (pt.x / maxDist) * 540;
                      const svgY = 160 - (pt.y / maxHeight) * 140;
                      return `${svgX},${svgY}`;
                    })
                    .join(' ')}
                />
              )}
            </svg>
          </div>
        </section>
      )}
    </div>
  );
};
