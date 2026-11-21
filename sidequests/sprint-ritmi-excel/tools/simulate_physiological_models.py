# -*- coding: utf-8 -*-
"""
Simulazione quantitativa dei modelli fisiologici e matematici di transizione tra zone.
Confronto tra Critical Speed (2P e 3P), Bundle & Weyand (APE), ASR (Buchheit & Sandford).
"""
import math

def simulate():
    # Profilo Atleta Modello
    # MSS (Velocità Massima Sprint lanciata) = 10.0 m/s (36.0 km/h)
    # MAS (Massima Velocità Aerobica) = 5.0 m/s (18.0 km/h)
    # ASR = MSS - MAS = 5.0 m/s
    # CS (Critical Speed) = 4.25 m/s (85% MAS, 15.3 km/h)
    # D' (Capacità di lavoro sopra CS) = 220 m
    # LT1 (Soglia Aerobica) = 3.60 m/s (72% MAS, 13.0 km/h)

    # 1. Modello Critical Speed a 2 parametri (Monod & Scherrer):
    # v(t) = CS + D' / t
    def v_cs_2p(t, cs=4.25, d_prime=220):
        return cs + d_prime / t

    # 2. Modello Critical Speed a 3 parametri (Morton 1996):
    # v(t) = CS + D' / (t - t0), dove t0 = -18 s per evitare asintoto a 0
    def v_cs_3p(t, cs=4.25, d_prime=220, t0=-18):
        return cs + d_prime / (t - t0)

    # 3. Modello Esponenziale Bundle & Weyand (2012) - Algoritmo APE:
    # v(t) = V_aer + (V_max - V_aer) * exp(-k * t)
    # V_aer = MAS = 5.0 m/s, V_max = 10.0 m/s, k = 0.045 s^-1
    def v_bundle_weyand(t, v_max=10.0, v_aer=5.0, k=0.045):
        return v_aer + (v_max - v_aer) * math.exp(-k * t)

    # 4. Modello ASR (Buchheit & Sandford 2019, 2021):
    # v(%ASR) = MAS + (%ASR / 100) * (MSS - MAS)
    def v_asr(pct, mas=5.0, mss=10.0):
        return mas + (pct / 100.0) * (mss - mas)

    # Durate tipiche di prova per ciascuna zona
    scenarios = [
        ("Zona 9 - Vmax / Alattacido", 5, "Sprint puro lanciato 40-50m"),
        ("Zona 8 - Potenza Lattacida", 15, "Sprint 120-150m all-out"),
        ("Zona 7 - Capacità Lattacida (SE1)", 30, "Ripetuta 250m ad acidosi elevata"),
        ("Special Endurance 2 (SE2)", 50, "Ripetuta 400m specifica"),
        ("Zona VO2max / Severe Domain", 120, "Intervallo corto ad alta intensità (HIIT)"),
        ("Heavy Domain / Sopra LT2", 300, "Corsa continua veloce (soglia anaerobica)"),
        ("Moderate Domain / Sotto LT1", 1200, "Corsa continua estensiva / fondo lento"),
    ]

    print("=" * 95)
    print(f"{'Zona / Dominio':<32} | {'t (s)':<5} | {'CS 2P':<8} | {'CS 3P':<8} | {'Bundle-W':<9} | {'%ASR':<7} | {'%MAS':<7}")
    print("=" * 95)

    for name, t, desc in scenarios:
        v_2p = v_cs_2p(t)
        v_3p = v_cs_3p(t)
        v_bw = v_bundle_weyand(t)
        
        # Calcolo %ASR equivalente di Bundle-Weyand
        if v_bw >= 5.0:
            pct_asr = ((v_bw - 5.0) / 5.0) * 100.0
            str_asr = f"{pct_asr:5.1f}%"
        else:
            str_asr = "< 0%"
            
        pct_mas = (v_bw / 5.0) * 100.0
        
        print(f"{name:<32} | {t:5d} | {v_2p:7.2f}m | {v_3p:7.2f}m | {v_bw:8.2f}m | {str_asr:<7} | {pct_mas:5.1f}%")

    print("=" * 95)

if __name__ == "__main__":
    simulate()
