/**
 * src/hooks/usePAPAnalysis.ts
 * Custom Hook per la Suite Salto Verticale, Profilazione Neuromuscolare ed Effetto PAP.
 *
 * Conforme a:
 * - Regola R3: Isolamento della logica e dello state management dal rendering.
 * - Regola R1: Zero any, tipizzazione con interfacce da src/types/pap.ts.
 * - Regola 01: Zero emoji spontanee.
 */

import { useState, useMemo, useCallback } from 'react';
import type {
  NeuromuscularProfileResult,
  PotentiationResponse,
  TwoSampleTTestResult
} from '../types/pap';
import {
  computeNeuromuscularProfile,
  computeRelativePowerWkg,
  calculatePotentiationResponse,
  calculateTwoSampleTTest
} from '../physics/pap-stats-engine';

export interface UsePAPAnalysisReturn {
  // Input profilazione basale
  sjHeight: number;
  setSjHeight: (val: number) => void;
  cmjHeight: number;
  setCmjHeight: (val: number) => void;
  abkHeight: number;
  setAbkHeight: (val: number) => void;
  bodyMassKg: number;
  setBodyMassKg: (val: number) => void;
  contactTimeMs: number;
  setContactTimeMs: (val: number) => void;

  // Risultati biomeccanici
  neuromuscularProfile: NeuromuscularProfileResult;
  relativePowerWkg: number;
  rsiValue: number;

  // Input e calcolo protocollo PAP
  baselineJumps: number[];
  postJumps: number[];
  addBaselineJump: (h: number) => void;
  addPostJump: (h: number) => void;
  removeBaselineJump: (idx: number) => void;
  removePostJump: (idx: number) => void;
  clearPAPJumps: () => void;

  potentiationResult: PotentiationResponse;
  twoSampleTTest: TwoSampleTTestResult;

  // Preset rapidi
  loadPresetResponder: () => void;
  loadPresetFatigue: () => void;
}

export function usePAPAnalysis(): UsePAPAnalysisReturn {
  // Parametri salto singolo e profilo
  const [sjHeight, setSjHeight] = useState<number>(34.0);
  const [cmjHeight, setCmjHeight] = useState<number>(39.5);
  const [abkHeight, setAbkHeight] = useState<number>(45.2);
  const [bodyMassKg, setBodyMassKg] = useState<number>(75.0);
  const [contactTimeMs, setContactTimeMs] = useState<number>(210);

  // Misure serie PAP pre/post
  const [baselineJumps, setBaselineJumps] = useState<number[]>([38.5, 39.0, 38.7]);
  const [postJumps, setPostJumps] = useState<number[]>([41.5, 42.0, 41.8]);

  // Calcolo Profilo Neuromuscolare (EUR, deficit, transfer braccia)
  const neuromuscularProfile = useMemo<NeuromuscularProfileResult>(() => {
    return computeNeuromuscularProfile(sjHeight, cmjHeight, abkHeight);
  }, [sjHeight, cmjHeight, abkHeight]);

  // Potenza relativa di picco secondo Sayers (W/kg)
  const relativePowerWkg = useMemo<number>(() => {
    return computeRelativePowerWkg(sjHeight, bodyMassKg);
  }, [sjHeight, bodyMassKg]);

  // Reactive Strength Index (RSI = altezza volo m / tempo contatto s)
  const rsiValue = useMemo<number>(() => {
    if (contactTimeMs <= 0 || cmjHeight <= 0) return 0;
    const heightM = cmjHeight / 100.0;
    const tcSec = contactTimeMs / 1000.0;
    return parseFloat((heightM / tcSec).toFixed(2));
  }, [cmjHeight, contactTimeMs]);

  // Media delle serie e Risultato Potenziamento PAP
  const meanBaseline = useMemo<number>(() => {
    if (baselineJumps.length === 0) return 0;
    return parseFloat((baselineJumps.reduce((a, b) => a + b, 0) / baselineJumps.length).toFixed(2));
  }, [baselineJumps]);

  const meanPost = useMemo<number>(() => {
    if (postJumps.length === 0) return 0;
    return parseFloat((postJumps.reduce((a, b) => a + b, 0) / postJumps.length).toFixed(2));
  }, [postJumps]);

  const potentiationResult = useMemo<PotentiationResponse>(() => {
    return calculatePotentiationResponse(meanBaseline, meanPost);
  }, [meanBaseline, meanPost]);

  // Statistica inferenziale t-test
  const twoSampleTTest = useMemo<TwoSampleTTestResult>(() => {
    return calculateTwoSampleTTest(baselineJumps, postJumps);
  }, [baselineJumps, postJumps]);

  // Operazioni su vettori PAP
  const addBaselineJump = useCallback((h: number) => {
    if (h > 0) setBaselineJumps((prev) => [...prev, h]);
  }, []);

  const addPostJump = useCallback((h: number) => {
    if (h > 0) setPostJumps((prev) => [...prev, h]);
  }, []);

  const removeBaselineJump = useCallback((idx: number) => {
    setBaselineJumps((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const removePostJump = useCallback((idx: number) => {
    setPostJumps((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const clearPAPJumps = useCallback(() => {
    setBaselineJumps([]);
    setPostJumps([]);
  }, []);

  // Preset
  const loadPresetResponder = useCallback(() => {
    setSjHeight(35.0);
    setCmjHeight(41.0);
    setAbkHeight(47.5);
    setBodyMassKg(78.0);
    setContactTimeMs(195);
    setBaselineJumps([39.2, 39.5, 39.0]);
    setPostJumps([42.4, 43.1, 42.8]);
  }, []);

  const loadPresetFatigue = useCallback(() => {
    setSjHeight(33.0);
    setCmjHeight(36.5);
    setAbkHeight(40.0);
    setBodyMassKg(82.0);
    setContactTimeMs(240);
    setBaselineJumps([38.0, 38.4, 38.1]);
    setPostJumps([35.5, 35.0, 35.2]);
  }, []);

  return {
    sjHeight,
    setSjHeight,
    cmjHeight,
    setCmjHeight,
    abkHeight,
    setAbkHeight,
    bodyMassKg,
    setBodyMassKg,
    contactTimeMs,
    setContactTimeMs,

    neuromuscularProfile,
    relativePowerWkg,
    rsiValue,

    baselineJumps,
    postJumps,
    addBaselineJump,
    addPostJump,
    removeBaselineJump,
    removePostJump,
    clearPAPJumps,

    potentiationResult,
    twoSampleTTest,

    loadPresetResponder,
    loadPresetFatigue
  };
}
