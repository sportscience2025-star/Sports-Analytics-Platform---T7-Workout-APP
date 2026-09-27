import math
import sys

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from empirical_stress_harness import PythonPhysicsEngine

print("=== EMPIRICAL INVESTIGATION OF SFV FORMULA & BEHAVIOR ===")

# Case A: F0/2 is inside sampled load range
# e.g., F0 = 160 kg -> F0/2 = 80 kg. Sampled loads: 40, 60, 80, 100, 120
dataset_balanced = [
    {'load': 40, 'velocity': 0.75},
    {'load': 60, 'velocity': 0.625},
    {'load': 80, 'velocity': 0.50},
    {'load': 100, 'velocity': 0.375},
    {'load': 120, 'velocity': 0.25}
]
res_balanced = PythonPhysicsEngine.linearRegressionVBT(dataset_balanced)
print("\n[Case A: F0/2 inside sampled range]")
print(f"F0: {res_balanced['f0']:.2f} kg | PmaxLoad (F0/2): {res_balanced['pmaxLoad']:.2f} kg")
print(f"Sfv: {res_balanced['sfvp']:.2f}% | fvBias: '{res_balanced['fvBias']}'")

# Case B: Light loads tested (F0/2 is above max tested load)
# Athlete with high force capacity (F0 = 200kg -> F0/2 = 100kg), but tested only up to 60kg
dataset_light_range = [
    {'load': 20, 'velocity': 1.35},
    {'load': 30, 'velocity': 1.275},
    {'load': 40, 'velocity': 1.20},
    {'load': 50, 'velocity': 1.125},
    {'load': 60, 'velocity': 1.05}
]
res_light = PythonPhysicsEngine.linearRegressionVBT(dataset_light_range)
print("\n[Case B: Light loads tested (F0/2 = 100kg, max load tested = 60kg)]")
print(f"F0: {res_light['f0']:.2f} kg | PmaxLoad (F0/2): {res_light['pmaxLoad']:.2f} kg")
print(f"Sfv: {res_light['sfvp']:.2f}% | fvBias: '{res_light['fvBias']}'")

# Case C: Heavy loads tested (F0/2 is below min tested load)
# Athlete tested only near 1RM (120kg to 160kg, where F0/2 = 90kg)
dataset_heavy_range = [
    {'load': 120, 'velocity': 0.40},
    {'load': 130, 'velocity': 0.333},
    {'load': 140, 'velocity': 0.267},
    {'load': 150, 'velocity': 0.20},
    {'load': 160, 'velocity': 0.133}
]
res_heavy = PythonPhysicsEngine.linearRegressionVBT(dataset_heavy_range)
print("\n[Case C: Heavy loads tested (F0/2 = 90kg, min load tested = 120kg)]")
print(f"F0: {res_heavy['f0']:.2f} kg | PmaxLoad (F0/2): {res_heavy['pmaxLoad']:.2f} kg")
print(f"Sfv: {res_heavy['sfvp']:.2f}% | fvBias: '{res_heavy['fvBias']}'")

# Case D: Verify quadratic model Sfv behavior
dataset_quad_curved = [
    {'load': 30, 'velocity': 1.15},
    {'load': 50, 'velocity': 0.98},
    {'load': 70, 'velocity': 0.82},
    {'load': 90, 'velocity': 0.64},
    {'load': 110, 'velocity': 0.44},
    {'load': 130, 'velocity': 0.21}
]
res_quad = PythonPhysicsEngine.quadraticRegressionVBT(dataset_quad_curved)
print("\n[Case D: Quadratic Model Curvilinear Profile]")
print(f"F0: {res_quad['f0']:.2f} kg | PmaxLoad: {res_quad['pmaxLoad']:.2f} kg")
print(f"Sfv: {res_quad['sfvp']:.2f}% | fvBias: '{res_quad['fvBias']}'")
