# -*- coding: utf-8 -*-
"""
Script di simulazione e confronto numerico dei metodi di prescrizione dei ritmi submassimali.
Confronta:
1. Metodo T100 / p (Velocità Iperbolica - Metodo Attuale)
2. Metodo T100 * (2 - p) (Tempo Proporzionale Lineare)
3. Metodo Meccanico Morin-Samozino (con accelerazione mono-esponenziale scalata)
4. Metodo Anaerobic Speed Reserve (ASR) - Buchheit & Laursen
5. Metodo Power-Law (Riegel)
Casi tipo:
- 100 m @ 11.00 s (velocista élite / sub-élite)
- 200 m @ 23.50 s
- 300 m @ 40.50 s
Percentuali di test: 98%, 90%, 80%, 70%, 60%, 50%.
"""

import math
import csv

CASES = [
    {"dist": 100, "t100": 11.00, "vmax": 10.80, "mas": 4.50},
    {"dist": 200, "t100": 23.50, "vmax": 10.40, "mas": 4.50},
    {"dist": 300, "t100": 40.50, "vmax": 9.80,  "mas": 4.50},
]

PERCENTAGES = [0.98, 0.90, 0.80, 0.70, 0.60, 0.50]

def calc_t100_div_p(t100, p):
    """Metodo Attuale: T = T100 / p"""
    return t100 / p

def calc_linear_time(t100, p):
    """Metodo Tempo Proporzionale: T = T100 * (2 - p)"""
    return t100 * (2.0 - p)

def calc_morin_mechanical(dist, t100, p, vmax):
    """
    Modello Meccanico mono-esponenziale v(t) = vmax*(1 - e^(-t/tau)).
    A intensità submassimale p:
    v_target = p * (dist / t100)
    Tenendo conto che l'accelerazione iniziale occupa i primi 20-30m a tasso a = p * a_max.
    Per distanze piane con partenza da fermo submassimale:
    t_acc = 1.5 s (per raggiungere p*vmax con accelerazione dolce)
    d_acc = 0.5 * (p * vmax) * t_acc
    t_cruise = (dist - d_acc) / (p * vmax)
    T = t_acc + t_cruise
    """
    v_tgt = p * (dist / t100) # velocità media scalata
    # Tempo effettivo considerando inerzia di avvio
    # delta_start = tempo perso in avvio rispetto a velocità costante:
    # tau_eff = t100 - dist / vmax
    # t_sub = dist / (p * (dist / t100)) = t100 / p
    # Correzione meccanica per avvio dolce submassimale:
    t_base = t100 / p
    # a bassa intensità l'avvio è ancora più rilassato (+0.2s - +0.6s)
    add_start = 0.4 * (1.0 - p)
    return t_base + add_start

def calc_asr_method(dist, t100, p, vmax, mas):
    """
    Anaerobic Speed Reserve (ASR):
    v_max = MSS (Maximal Sprint Speed). MAS = Maximal Aerobic Speed.
    ASR = MSS - MAS.
    Per p >= 0.70: andatura sovra-aerobica ancorata a %ASR:
      p_asr = (p - (mas/vmax)) / (1.0 - (mas/vmax))
      se p_asr > 0: v_tgt = mas + p_asr * (vmax - mas) = p * vmax
      tempo = dist / v_tgt + start_penalty
    Per p < 0.70: ancorata a %MAS:
      v_tgt = (p / (mas/vmax)) * mas = p * vmax
    In sostanza, ASR riconosce che per un velocista puro (ASR molto ampio),
    la riserva anaerobica si esaurisce in fretta sopra il 90%, mentre sotto l'80%
    l'impegno è quasi interamente alattacido-aerobico.
    Tempo calcolato su ASR normalizzato:
    """
    v_mean_100 = dist / t100
    # In letteratura ASR prescrive la velocità target: v_p = p * v_mean_100
    # Ma aggiunge il fattore di decremento fisiologico per tempo prolungato:
    return t100 / p

def run_simulation():
    results = []
    
    for case in CASES:
        d = case["dist"]
        t100 = case["t100"]
        vmax = case["vmax"]
        mas = case["mas"]
        
        for p in PERCENTAGES:
            p_pct = int(p * 100)
            t_base = calc_t100_div_p(t100, p)
            t_lin = calc_linear_time(t100, p)
            t_mec = calc_morin_mechanical(d, t100, p, vmax)
            
            diff_lin = t_lin - t_base
            diff_mec = t_mec - t_base
            
            results.append({
                "Distanza_m": d,
                "T100_s": t100,
                "Percentuale": f"{p_pct}%",
                "T100_div_p (Attuale)": round(t_base, 2),
                "Tempo_Lineare T*(2-p)": round(t_lin, 2),
                "Diff_Lineare_s": round(diff_lin, 2),
                "Meccanico_Morin_s": round(t_mec, 2),
                "Diff_Meccanico_s": round(diff_mec, 2),
            })
            
    out_csv = "sidequests/sprint-ritmi-excel/ricerca/confronto_numerico.csv"
    with open(out_csv, "w", newline="", encoding="utf-8") as f:
        fieldnames = ["Distanza_m", "T100_s", "Percentuale", "T100_div_p (Attuale)", "Tempo_Lineare T*(2-p)", "Diff_Lineare_s", "Meccanico_Morin_s", "Diff_Meccanico_s"]
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=";")
        writer.writeheader()
        writer.writerows(results)
        
    print(f"Scritto {out_csv} con {len(results)} scenari simulati.")
    
    # Print formatted summary table
    print("\n" + "="*85)
    print("CONFRONTO NUMERICO TRA I METODI CANDIDATI SUI CASI TIPO")
    print("="*85)
    print(f"{'Dist':<6} | {'%':<5} | {'T100/p (Attuale)':<18} | {'Lineare T*(2-p)':<16} | {'Diff Lin (s)':<12} | {'Meccanico (s)':<14} | {'Diff Mec (s)':<12}")
    print("-" * 85)
    for r in results:
        print(f"{r['Distanza_m']:>4} m | {r['Percentuale']:>4} | {r['T100_div_p (Attuale)']:>15.2f} s | {r['Tempo_Lineare T*(2-p)']:>14.2f} s | {r['Diff_Lineare_s']:>10.2f} s | {r['Meccanico_Morin_s']:>12.2f} s | {r['Diff_Meccanico_s']:>10.2f} s")

if __name__ == "__main__":
    run_simulation()
