import math
import json
import sys
import os

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

print("=== STARTING EMPIRICAL STRESS HARNESS FOR REQUIREMENT R2 & REGRESSION FUNCTIONS ===")

class PythonPhysicsEngine:
    """
    Python reference implementation strictly matching js/physics-engine.js logic
    to empirically verify formulas, edge cases, sfvp, fvBias, and UI binding safety.
    """
    @staticmethod
    def _median(sorted_arr):
        length = len(sorted_arr)
        if length == 0:
            return 0
        mid = length // 2
        return sorted_arr[mid] if length % 2 != 0 else (sorted_arr[mid - 1] + sorted_arr[mid]) / 2.0

    @staticmethod
    def _removeOutliersIQR(data):
        n = len(data)
        if n < 4:
            return data
        sumX = sum(pt['load'] for pt in data)
        sumY = sum(pt['velocity'] for pt in data)
        sumXY = sum(pt['load'] * pt['velocity'] for pt in data)
        sumXX = sum(pt['load'] * pt['load'] for pt in data)
        denom = n * sumXX - sumX * sumX
        if abs(denom) < 1e-9:
            return data
        slope = (n * sumXY - sumX * sumY) / denom
        intercept = (sumY - slope * sumX) / n
        residuals = [abs(pt['velocity'] - (slope * pt['load'] + intercept)) for pt in data]
        sorted_res = sorted(residuals)
        q1 = sorted_res[int(n * 0.25)]
        q3 = sorted_res[int(n * 0.75)]
        iqr = q3 - q1
        fence = q3 + 1.5 * iqr
        filtered = [pt for i, pt in enumerate(data) if residuals[i] <= fence]
        return filtered if len(filtered) >= 3 else data

    @staticmethod
    def _removeOutliersMAD(data):
        if not data or len(data) < 4:
            return data
        n = len(data)
        sumX = sum(pt['load'] for pt in data)
        sumY = sum(pt['velocity'] for pt in data)
        sumXY = sum(pt['load'] * pt['velocity'] for pt in data)
        sumXX = sum(pt['load'] * pt['load'] for pt in data)
        denom = n * sumXX - sumX * sumX
        if abs(denom) < 1e-9:
            return data
        slope = (n * sumXY - sumX * sumY) / denom
        intercept = (sumY - slope * sumX) / n
        residuals = [pt['velocity'] - (slope * pt['load'] + intercept) for pt in data]
        sorted_res = sorted(residuals)
        median_res = PythonPhysicsEngine._median(sorted_res)
        abs_devs = [abs(r - median_res) for r in residuals]
        sorted_devs = sorted(abs_devs)
        mad = PythonPhysicsEngine._median(sorted_devs)
        if mad < 1e-9:
            return data
        filtered = []
        for i, pt in enumerate(data):
            modZ = (0.6745 * abs(residuals[i] - median_res)) / mad
            if modZ <= 2.5:
                filtered.append(pt)
        return filtered if len(filtered) >= 3 else data

    @staticmethod
    def _findEmpiricalPmaxLoad(data, slope, intercept):
        loads = [d['load'] for d in data]
        min_load = min(loads) if loads else 0
        max_load = max(loads) if loads else 0
        maxP = 0
        bestLoad = (min_load + max_load) / 2.0
        step = max(0.1, (max_load - min_load) / 500.0) if max_load > min_load else 1.0
        L = min_load
        while L <= max_load + 1e-9:
            V = slope * L + intercept
            if V <= 0:
                break
            P = L * 9.81 * V
            if P > maxP:
                maxP = P
                bestLoad = L
            L += step
        return bestLoad

    @staticmethod
    def _findEmpiricalPmaxLoadQuad(data, c2, c1, c0):
        loads = [d['load'] for d in data]
        min_load = min(loads) if loads else 0
        max_load = max(loads) if loads else 0
        maxP = 0
        bestLoad = (min_load + max_load) / 2.0
        step = max(0.1, (max_load - min_load) / 500.0) if max_load > min_load else 1.0
        L = min_load
        while L <= max_load + 1e-9:
            V = c2 * L * L + c1 * L + c0
            if V <= 0:
                break
            P = L * 9.81 * V
            if P > maxP:
                maxP = P
                bestLoad = L
            L += step
        return bestLoad

    @staticmethod
    def _solve3x3(A, B):
        def det3(M):
            return (M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) -
                    M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) +
                    M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]))
        d = det3(A)
        if abs(d) < 1e-12:
            return None
        def replaceCol(M, col, V):
            return [[V[i] if j == col else M[i][j] for j in range(3)] for i in range(3)]
        c0 = det3(replaceCol(A, 0, B)) / d
        c1 = det3(replaceCol(A, 1, B)) / d
        c2 = det3(replaceCol(A, 2, B)) / d
        return [c0, c1, c2]

    @staticmethod
    def linearRegressionVBT(data):
        if not data or len(data) < 2:
            return None
        clean_input = []
        for pt in data:
            if isinstance(pt, dict) and 'load' in pt and 'velocity' in pt:
                l, v = pt['load'], pt['velocity']
                if isinstance(l, (int, float)) and math.isfinite(l) and isinstance(v, (int, float)) and math.isfinite(v):
                    clean_input.append({'load': float(l), 'velocity': float(v)})
        if len(clean_input) < 2:
            return None
        cleanData = clean_input
        if len(clean_input) >= 5:
            cleanData = PythonPhysicsEngine._removeOutliersIQR(clean_input)
            if len(cleanData) < 3:
                cleanData = clean_input
        n = len(cleanData)
        sumX = sum(pt['load'] for pt in cleanData)
        sumY = sum(pt['velocity'] for pt in cleanData)
        sumXY = sum(pt['load'] * pt['velocity'] for pt in cleanData)
        sumXX = sum(pt['load'] * pt['load'] for pt in cleanData)
        sumYY = sum(pt['velocity'] * pt['velocity'] for pt in cleanData)

        denominator = n * sumXX - sumX * sumX
        if abs(denominator) < 1e-9:
            return {
                'slope': 0.0, 'intercept': 0.0, 'rSquared': 0.0,
                'v0': 0.0, 'f0': 0.0, 'f0_N': 0.0, 'pmax': 0.0, 'pmaxLoad': 0.0,
                'pmaxVelocity': 0.0, 'sfvp': 0.0,
                'n': n, 'outlierCount': len(clean_input) - n,
                'equation': 'Dati insufficienti (carichi identici)',
                'qualityLabel': 'Profilo non valido',
                'fvBias': 'Profilo Bilanciato (0%) → Ottimale per la potenza',
                'residuals': []
            }

        slope = (n * sumXY - sumX * sumY) / denominator
        if abs(slope) < 1e-4:
            slope = 0.0
        intercept = (sumY - slope * sumX) / n

        yMean = sumY / n
        totalSS = sum((pt['velocity'] - yMean)**2 for pt in cleanData)
        residualSS = sum((pt['velocity'] - (slope * pt['load'] + intercept))**2 for pt in cleanData)
        
        rSquared = 1.0 if totalSS < 1e-12 else max(0.0, min(1.0, 1.0 - residualSS / totalSS))
        see = math.sqrt(residualSS / (n - 2)) if n > 2 else 0.0

        v0 = intercept
        f0 = -intercept / slope if (abs(slope) > 1e-6 and intercept > 1e-6) else 0.0
        f0_N = f0 * 9.81
        pmax = (f0_N * v0) / 4.0 if (f0_N > 0 and v0 > 0) else 0.0
        pmaxLoad = f0 / 2.0
        pmaxVelocity = v0 / 2.0

        loadAtMaxPower = PythonPhysicsEngine._findEmpiricalPmaxLoad(cleanData, slope, intercept)
        sfvp = ((loadAtMaxPower - pmaxLoad) / pmaxLoad) * 100.0 if pmaxLoad > 0 else 0.0
        if not math.isfinite(sfvp):
            sfvp = 0.0

        if rSquared >= 0.98: qualityLabel = '⭐ Eccellente (R²≥0.98)'
        elif rSquared >= 0.95: qualityLabel = '✅ Ottima (R²≥0.95)'
        elif rSquared >= 0.90: qualityLabel = '⚠️ Buona (R²≥0.90)'
        elif rSquared >= 0.80: qualityLabel = '⚠️ Accettabile (R²≥0.80)'
        else: qualityLabel = '❌ Bassa (R²<0.80) – Rieseguire test'

        if sfvp > 15: fvBias = f'Orientato alla Forza (+{sfvp:.0f}%) → Lavorare sulla velocità/potenza'
        elif sfvp < -15: fvBias = f'Orientato alla Velocità ({sfvp:.0f}%) → Lavorare sulla forza massimale'
        else: fvBias = f'Profilo Bilanciato ({sfvp:.0f}%) → Ottimale per la potenza'

        rSquaredAdj = max(0.0, 1.0 - ((1.0 - rSquared) * (n - 1)) / (n - 2)) if n > 2 else rSquared

        return {
            'modelType': 'linear',
            'slope': slope, 'intercept': intercept,
            'rSquared': rSquared, 'rSquaredAdj': rSquaredAdj, 'see': see,
            'v0': v0, 'f0': f0, 'f0_N': f0_N, 'pmax': pmax,
            'pmaxLoad': pmaxLoad, 'pmaxVelocity': pmaxVelocity,
            'sfvp': sfvp, 'n': n, 'outlierCount': len(clean_input) - n,
            'equation': f"V = {slope:.4f}·L + {intercept:.4f}",
            'qualityLabel': qualityLabel, 'fvBias': fvBias
        }

    @staticmethod
    def quadraticRegressionVBT(data):
        if not data or len(data) < 3:
            return None
        clean_input = []
        for pt in data:
            if isinstance(pt, dict) and 'load' in pt and 'velocity' in pt:
                l, v = pt['load'], pt['velocity']
                if isinstance(l, (int, float)) and math.isfinite(l) and isinstance(v, (int, float)) and math.isfinite(v):
                    clean_input.append({'load': float(l), 'velocity': float(v)})
        if len(clean_input) < 3:
            return None
        cleanData = clean_input
        if len(clean_input) >= 4:
            cleanData = PythonPhysicsEngine._removeOutliersMAD(clean_input)
            if len(cleanData) < 3:
                cleanData = clean_input
        n = len(cleanData)
        sL0 = float(n)
        sL1 = sum(pt['load'] for pt in cleanData)
        sL2 = sum(pt['load']**2 for pt in cleanData)
        sL3 = sum(pt['load']**3 for pt in cleanData)
        sL4 = sum(pt['load']**4 for pt in cleanData)
        sV0 = sum(pt['velocity'] for pt in cleanData)
        sLV = sum(pt['load'] * pt['velocity'] for pt in cleanData)
        sL2V = sum((pt['load']**2) * pt['velocity'] for pt in cleanData)

        A = [[sL0, sL1, sL2], [sL1, sL2, sL3], [sL2, sL3, sL4]]
        B = [sV0, sLV, sL2V]
        coeffs = PythonPhysicsEngine._solve3x3(A, B)
        if not coeffs:
            return None
        c0, c1, c2 = coeffs

        yMean = sV0 / n
        totalSS = sum((pt['velocity'] - yMean)**2 for pt in cleanData)
        residualSS = sum((pt['velocity'] - (c2*pt['load']**2 + c1*pt['load'] + c0))**2 for pt in cleanData)
        rSquared = 1.0 if totalSS < 1e-12 else max(0.0, min(1.0, 1.0 - residualSS / totalSS))
        p = 2
        rSquaredAdj = max(0.0, 1.0 - ((1.0 - rSquared) * (n - 1)) / (n - p - 1)) if n > (p + 1) else rSquared
        see = math.sqrt(residualSS / (n - p - 1)) if n > (p + 1) else 0.0

        v0 = c0
        f0 = 0.0
        if abs(c2) < 1e-7:
            f0 = -c0 / c1 if (abs(c1) > 1e-6 and c0 > 1e-6) else 0.0
        else:
            disc = c1*c1 - 4*c2*c0
            if disc >= 0:
                r1 = (-c1 - math.sqrt(disc)) / (2*c2)
                r2 = (-c1 + math.sqrt(disc)) / (2*c2)
                valid = [r for r in [r1, r2] if r > 0]
                f0 = min(valid) if valid else 0.0

        f0_N = f0 * 9.81
        pmaxLoad = f0 / 2.0 if f0 > 0 else 0.0
        pDisc = 4*c1*c1 - 12*c2*c0
        if abs(c2) > 1e-7 and pDisc >= 0:
            pr1 = (-2*c1 - math.sqrt(pDisc)) / (6*c2)
            pr2 = (-2*c1 + math.sqrt(pDisc)) / (6*c2)
            validP = [r for r in [pr1, pr2] if 0 < r < (f0 if f0 > 0 else 1000)]
            if validP:
                pmaxLoad = validP[0]

        pmaxVel = c2*pmaxLoad**2 + c1*pmaxLoad + c0
        pmax = (pmaxLoad * 9.81 * pmaxVel) if (f0_N > 0 and pmaxVel > 0) else 0.0

        loadAtMaxPower = PythonPhysicsEngine._findEmpiricalPmaxLoadQuad(cleanData, c2, c1, c0)
        sfvp = ((loadAtMaxPower - pmaxLoad) / pmaxLoad) * 100.0 if pmaxLoad > 0 else 0.0
        if not math.isfinite(sfvp):
            sfvp = 0.0

        if rSquaredAdj >= 0.98: qualityLabel = '⭐ Eccellente (R²adj≥0.98)'
        elif rSquaredAdj >= 0.95: qualityLabel = '✅ Ottima (R²adj≥0.95)'
        elif rSquaredAdj >= 0.90: qualityLabel = '⚠️ Buona (R²adj≥0.90)'
        elif rSquaredAdj >= 0.80: qualityLabel = '⚠️ Accettabile (R²adj≥0.80)'
        else: qualityLabel = '❌ Bassa (R²adj<0.80) – Rieseguire test'

        if sfvp > 15: fvBias = f'Orientato alla Forza (+{sfvp:.0f}%) → Lavorare sulla velocità/potenza'
        elif sfvp < -15: fvBias = f'Orientato alla Velocità ({sfvp:.0f}%) → Lavorare sulla forza massimale'
        else: fvBias = f'Profilo Bilanciato ({sfvp:.0f}%) → Ottimale per la potenza'

        sign_c2 = '+' if c2 >= 0 else ''
        sign_c1 = '+' if c1 >= 0 else ''
        return {
            'modelType': 'quadratic',
            'slope': c1, 'intercept': c0,
            'rSquared': rSquared, 'rSquaredAdj': rSquaredAdj, 'see': see,
            'v0': v0, 'f0': f0, 'f0_N': f0_N, 'pmax': pmax,
            'pmaxLoad': pmaxLoad, 'pmaxVelocity': pmaxVel,
            'sfvp': sfvp, 'n': n, 'outlierCount': len(clean_input) - n,
            'equation': f"V = {sign_c2}{c2:.5f}·L² {sign_c1}{c1:.4f}·L + {c0:.4f}",
            'qualityLabel': qualityLabel, 'fvBias': fvBias
        }

    @staticmethod
    def autoSelectRegressionVBT(data):
        if not data or len(data) < 2:
            return None
        clean_input = []
        for pt in data:
            if isinstance(pt, dict) and 'load' in pt and 'velocity' in pt:
                l, v = pt['load'], pt['velocity']
                if isinstance(l, (int, float)) and math.isfinite(l) and isinstance(v, (int, float)) and math.isfinite(v):
                    clean_input.append({'load': float(l), 'velocity': float(v)})
        if len(clean_input) < 2:
            return None
        cleanData = clean_input
        if len(clean_input) >= 4:
            cleanData = PythonPhysicsEngine._removeOutliersMAD(clean_input)
            if len(cleanData) < 3:
                cleanData = clean_input
        n = len(cleanData)
        linReg = PythonPhysicsEngine.linearRegressionVBT(cleanData)
        if n < 4 or not linReg:
            return linReg
        quadReg = PythonPhysicsEngine.quadraticRegressionVBT(cleanData)
        if not quadReg:
            return linReg
        r2Gain = quadReg['rSquaredAdj'] - linReg['rSquaredAdj']
        isPhysical = quadReg['f0'] > 0 and quadReg['v0'] > 0
        if r2Gain > 0.003 and isPhysical:
            return quadReg
        return linReg

# Execute Test Scenarios
test_cases = [
    ("Standard Bench Press Profile", [
        {'load': 40, 'velocity': 0.95}, {'load': 60, 'velocity': 0.78},
        {'load': 80, 'velocity': 0.60}, {'load': 100, 'velocity': 0.42}, {'load': 120, 'velocity': 0.25}
    ]),
    ("Velocity Oriented Profile", [
        {'load': 30, 'velocity': 1.40}, {'load': 50, 'velocity': 1.00},
        {'load': 70, 'velocity': 0.65}, {'load': 90, 'velocity': 0.35}
    ]),
    ("Force Oriented Profile", [
        {'load': 60, 'velocity': 0.70}, {'load': 90, 'velocity': 0.65},
        {'load': 120, 'velocity': 0.58}, {'load': 150, 'velocity': 0.48}, {'load': 180, 'velocity': 0.35}
    ]),
    ("Vertical Collinear (Denom 0)", [
        {'load': 80, 'velocity': 1.0}, {'load': 80, 'velocity': 0.5}
    ]),
    ("Horizontal Collinear (Zero Slope)", [
        {'load': 50, 'velocity': 0.8}, {'load': 80, 'velocity': 0.8}, {'load': 100, 'velocity': 0.8}
    ]),
    ("Single Point (Invalid)", [{'load': 50, 'velocity': 1.0}]),
    ("Null Input", None),
    ("NaN / Inf inputs", [{'load': float('nan'), 'velocity': 1.0}, {'load': 50, 'velocity': float('inf')}, {'load': 60, 'velocity': 0.5}])
]

print("\n--- STRESS TEST RESULTS ---")
passed_tests = 0
failed_tests = 0

for name, dataset in test_cases:
    print(f"\nEvaluating dataset: {name}")
    lin = PythonPhysicsEngine.linearRegressionVBT(dataset)
    quad = PythonPhysicsEngine.quadraticRegressionVBT(dataset)
    auto = PythonPhysicsEngine.autoSelectRegressionVBT(dataset)
    
    for label, res in [('Linear', lin), ('Quadratic', quad), ('AutoSelect', auto)]:
        if res is None:
            print(f"  {label:<12}: None (Expected for < 2/3 points or null)")
            continue
        
        # Check safety properties
        sfvp = res.get('sfvp')
        fvBias = res.get('fvBias')
        
        has_nan = any(isinstance(v, float) and math.isnan(v) for v in res.values() if isinstance(v, (int, float)))
        has_undefined_str = any("undefined" in str(v) for v in res.values())
        
        status = "FAIL" if (sfvp is None or fvBias is None or has_nan or has_undefined_str) else "PASS"
        if status == "PASS":
            passed_tests += 1
        else:
            failed_tests += 1
            
        print(f"  {label:<12}: [{status}] Sfv={sfvp:.2f}% | fvBias='{fvBias}' | R2={res.get('rSquared'):.4f}")

print(f"\nSummary: {passed_tests} assertions passed, {failed_tests} failed.")
