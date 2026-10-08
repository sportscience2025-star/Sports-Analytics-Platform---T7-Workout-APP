/**
 * src/hooks/useVBTAnalysis.ts
 * Custom Hook per l'analisi del profilo Carico-Velocità (VBT).
 * Rispetta la Regola R3 (isolamento totale della logica di calcolo dai componenti visivi).
 * Zero any: interfacce rigorose tipizzate da src/types/physics.ts.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  LoadVelocityPoint,
  VBTAnalysisResult,
  BryanMannZoneRow,
  VBTProgressionItem
} from '../types/physics';
import { PhysicsEngine } from '../physics/physics-engine';

export interface UseVBTAnalysisReturn {
  points: LoadVelocityPoint[];
  addPoint: (point: LoadVelocityPoint) => void;
  removePoint: (index: number) => void;
  clearPoints: () => void;
  setPoints: (points: LoadVelocityPoint[]) => void;
  mvt: number;
  setMvt: (mvt: number) => void;
  analysisResult: VBTAnalysisResult | null;
  zones: BryanMannZoneRow[];
  progression: VBTProgressionItem[];
}

const DEFAULT_POINTS: LoadVelocityPoint[] = [
  { load: 40, velocity: 1.0 },
  { load: 60, velocity: 0.8 },
  { load: 80, velocity: 0.6 }
];

const DEFAULT_MVT = 0.30;

export function useVBTAnalysis(
  initialPoints: LoadVelocityPoint[] = DEFAULT_POINTS,
  initialMvt: number = DEFAULT_MVT
): UseVBTAnalysisReturn {
  const [points, setPointsState] = useState<LoadVelocityPoint[]>(initialPoints);
  const [mvt, setMvtState] = useState<number>(initialMvt);

  const addPoint = useCallback((point: LoadVelocityPoint) => {
    if (point.load <= 0 || point.velocity <= 0) return;
    setPointsState((prev) => [...prev, point]);
  }, []);

  const removePoint = useCallback((index: number) => {
    setPointsState((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearPoints = useCallback(() => {
    setPointsState([]);
  }, []);

  const setPoints = useCallback((newPoints: LoadVelocityPoint[]) => {
    setPointsState(newPoints);
  }, []);

  const setMvt = useCallback((newMvt: number) => {
    if (newMvt > 0 && newMvt < 2.0) {
      setMvtState(newMvt);
    }
  }, []);

  const analysisResult = useMemo<VBTAnalysisResult | null>(() => {
    if (points.length < 2) return null;
    return PhysicsEngine.analyzeLoadVelocity(points, { mvt });
  }, [points, mvt]);

  const zones = useMemo<BryanMannZoneRow[]>(() => {
    if (!analysisResult || !analysisResult.rm1 || analysisResult.rm1.value <= 0) {
      return [];
    }
    return PhysicsEngine.generateBryanMannVBTTable(
      analysisResult.rm1.value,
      analysisResult.regression
    );
  }, [analysisResult]);

  const progression = useMemo<VBTProgressionItem[]>(() => {
    if (!analysisResult || !analysisResult.rm1 || analysisResult.rm1.value <= 0) {
      return [];
    }
    return PhysicsEngine.generateVBTProgression(
      analysisResult.rm1.value,
      analysisResult.regression,
      4
    );
  }, [analysisResult]);

  return {
    points,
    addPoint,
    removePoint,
    clearPoints,
    setPoints,
    mvt,
    setMvt,
    analysisResult,
    zones,
    progression
  };
}
