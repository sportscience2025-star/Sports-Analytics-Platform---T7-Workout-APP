# Implementation Plan - VBT Complete Table & Biomechanical Calculations

## Overview
Implement the new "Tabella Completa VBT" in the Data Analysis view of Progetto T7 Workout PWA.

## Key Requirements
1. **R1. Creazione Tabella Completa VBT**: Add a new table below existing "Tabella di Allenamento VBT" classifying load & velocity into 5 standard Bryan Mann force zones:
   - Absolute Strength: >90% 1RM, <0.50 m/s
   - Accelerative Strength: 80%-90% 1RM, 0.50-0.75 m/s
   - Strength-Speed: 60%-80% 1RM, 0.75-1.00 m/s
   - Speed-Strength: 30%-60% 1RM, 1.00-1.30 m/s
   - Starting Strength: <30% 1RM, >1.30 m/s
   Adapt threshold velocities dynamically based on exercise type if MVT profile is supported.
2. **R2. Calcoli Biomeccanici**: For each row, compute:
   - Force (N) = mass(kg) * 9.81
   - Power (W) = Force * velocity(m/s)
   Ensure no undefined or NaN values, with proper fallback and rounding logic (e.g. 2.5kg plate steps).
3. **R3. Preservare layout esistente**: Append as a new independent module/card below existing components without altering existing tables/graphics.

## Milestones
- **Milestone 1**: VBT Complete Table UI Module & Bryan Mann Force Zone Classification (R1 & R3).
- **Milestone 2**: Biomechanical Calculations (Force, Power) & Dynamic MVT Integration (R2). Verification and safety rule audits.
