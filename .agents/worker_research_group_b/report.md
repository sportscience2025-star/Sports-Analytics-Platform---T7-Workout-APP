# Scientific Research Report — Group B (Biomeccanica, Fisiologia)

**Agent**: Worker Research Group B  
**Working Directory**: `e:/Nuove App Installate/App esercizi scienze motorie/.agents/worker_research_group_b`  
**Date**: 2026-09-14T15:02:00+02:00  
**Target File**: `sources_group_b.json` (28 peer-reviewed sources)  

---

## 1. Executive Summary

Worker Research Group B was tasked with expanding the scientific knowledge base of the T7 Workout PWA by generating exactly **28 authentic, peer-reviewed scientific studies** indexed on PubMed:
- **14 sources for Biomeccanica** (focusing on rate of force development kinetics, force-vector theory, moment arms, surface EMG interpretation, hex vs straight bar deadlift, stance width in squats, and anterior cruciate ligament unloading mechanics).
- **14 sources for Fisiologia** (focusing on muscle protein synthesis, satellite cell dynamics, metabolic stress, myonuclear domain accretion, hormonal responses, fiber type transitions, concurrent training molecular interference, mitochondrial biogenesis, HRV autonomic recovery, eccentric muscle damage, and blood flow restriction).

All 28 sources were validated via automated queries against NCBI PubMed (E-utilities). Zero duplicates were introduced against the 161 pre-existing sources in `js/knowledge-base.js`.

---

## 2. Biomeccanica Sources (14 Sources)

| # | ID | Title | Authors | Journal (Year) | PMID | Practical / Biomechanical Impact |
|---|---|---|---|---|---|---|
| 1 | `sci_biomech_aagaard_2002` | Increased rate of force development and neural drive of human skeletal muscle following resistance training | Aagaard, P., Simonsen, E. B., Andersen, J. L., et al. | J Appl Physiol (2002) | [12235031](https://pubmed.ncbi.nlm.nih.gov/12235031/) | Neural basis of early RFD (<50 ms); motoneuron firing rates and V-wave efferent drive. |
| 2 | `sci_biomech_maffiuletti_2016` | Rate of force development: physiological and methodological considerations | Maffiuletti, N. A., Aagaard, P., Blazevich, A. J., et al. | Eur J Appl Physiol (2016) | [26941023](https://pubmed.ncbi.nlm.nih.gov/26941023/) | Early RFD (<100 ms) vs late RFD (>100 ms); neural vs structural/stiffness determinants. |
| 3 | `sci_biomech_vigotsky_2017` | Interpreting Signal Amplitudes in Surface Electromyography Studies in Sport and Rehabilitation Sciences | Vigotsky, A. D., Halperin, I., Lehman, G. J., et al. | Front Physiol (2017) | [29354060](https://pubmed.ncbi.nlm.nih.gov/29354060/) | Methodological debunking of naive EMG-to-hypertrophy inferences; role of moment arms and geometry. |
| 4 | `sci_biomech_vigotsky_2015` | Biomechanical implications of skeletal muscle hypertrophy and atrophy: a musculoskeletal model | Vigotsky, A. D., Contreras, B., Beardsley, C. | PeerJ (2015) | [26644989](https://pubmed.ncbi.nlm.nih.gov/26644989/) | Architectural changes, pennation angles, and shifts in internal moment arms during muscle growth. |
| 5 | `sci_biomech_swinton_2011` | A biomechanical analysis of straight and hexagonal barbell deadlifts using submaximal loads | Swinton, P. A., Stewart, A., Agouris, I., et al. | J Strength Cond Res (2011) | [21659894](https://pubmed.ncbi.nlm.nih.gov/21659894/) | Hex bar reduces L5/S1 lumbar moment while increasing knee extensor moment and peak power/velocity. |
| 6 | `sci_biomech_escamilla_sumo_2000` | A three-dimensional biomechanical analysis of sumo and conventional style deadlifts | Escamilla, R. F., Francisco, A. C., Fleisig, G. S., et al. | Med Sci Sports Exerc (2000) | [10912892](https://pubmed.ncbi.nlm.nih.gov/10912892/) | 3D kinematics: sumo reduces lumbar moment by ~10% and increases knee moment threefold vs conventional. |
| 7 | `sci_biomech_escamilla_2001` | A three-dimensional biomechanical analysis of the squat during varying stance widths | Escamilla, R. F., Fleisig, G. S., Lowry, T. M., et al. | Med Sci Sports Exerc (2001) | [11404665](https://pubmed.ncbi.nlm.nih.gov/11404665/) | Stance width effects on tibia verticality, ankle dorsiflexion, and gluteal/hip moments without patellofemoral shear increase. |
| 8 | `sci_biomech_loturco_2018` | Vertically and horizontally directed muscle power exercises: Relationships with top-level sprint performance | Loturco, I., Contreras, B., Kobal, R., et al. | PLoS ONE (2018) | [30048538](https://pubmed.ncbi.nlm.nih.gov/30048538/) | Force-vector theory: hip thrust correlates (r=0.93) with sprint acceleration (0-10m); vertical jumps correlate with max velocity. |
| 9 | `sci_biomech_contreras_2017` | Effects of a Six-Week Hip Thrust vs. Front Squat Resistance Training Program on Performance in Adolescent Males: A Randomized Controlled Trial | Contreras, B., Vigotsky, A. D., Schoenfeld, B. J., et al. | J Strength Cond Res (2017) | [27253835](https://pubmed.ncbi.nlm.nih.gov/27253835/) | RCT confirming horizontal vector specificity for horizontal sprint transfer vs vertical jump transfer for front squat. |
| 10 | `sci_biomech_schoenfeld_2018` | Differential effects of attentional focus strategies during long-term resistance training | Schoenfeld, B. J., Vigotsky, A., Contreras, B., et al. | Eur J Sport Sci (2018) | [29533715](https://pubmed.ncbi.nlm.nih.gov/29533715/) | Internal focus (mind-muscle) enhances hypertrophy (+12.4% vs +6.9%), while external focus maximizes force production. |
| 11 | `sci_biomech_cleather_2022` | Stronger Subjects Select a Movement Pattern That May Reduce Anterior Cruciate Ligament Loading During Cutting | Davies, W. T., Ryu, J. H., Graham-Smith, P., Cleather, D. J. | J Strength Cond Res (2022) | [35730770](https://pubmed.ncbi.nlm.nih.gov/35730770/) | Stronger athletes adopt hip-dominant cut mechanics with greater knee flexion, mitigating ACL peak loads. |
| 12 | `sci_biomech_kubo_2010` | Time course of changes in muscle and tendon properties during strength training and detraining | Kubo, K., Ikebukuro, T., Yata, H., et al. | J Strength Cond Res (2010) | [19996769](https://pubmed.ncbi.nlm.nih.gov/19996769/) | Tendon stiffness kinetics: rapid loss during detraining decoupled from muscle size; need for heavy loading during deloads. |
| 13 | `sci_biomech_delvecchio_2022` | Lack of increased rate of force development after strength training is explained by specific neural, not muscular, motor unit adaptations | Del Vecchio, A., Casolo, A., Dideriksen, J. L., Aagaard, P., Farina, D. | J Appl Physiol (2022) | [34792405](https://pubmed.ncbi.nlm.nih.gov/34792405/) | HD-sEMG motor unit recruitment speed vs plateau firing rates; necessity of ballistic intent for explosive gains. |
| 14 | `sci_biomech_flanagan_2015` | The Limiting Joint During a Failed Squat: A Biomechanics Case Series | Flanagan, S. P., Kulik, J. B., Salem, G. J. | J Appl Biomech (2015) | [25932989](https://pubmed.ncbi.nlm.nih.gov/25932989/) | Hip extensor moment deficit as the primary limiter causing the sticking region in 1RM back squats. |

---

## 3. Fisiologia Sources (14 Sources)

| # | ID | Title | Authors | Journal (Year) | PMID | Practical / Physiological Impact |
|---|---|---|---|---|---|---|
| 15 | `sci_physiol_morton_2015` | Nutritional interventions to augment resistance training-induced skeletal muscle hypertrophy | Morton, R. W., McGlory, C., Phillips, S. M. | Front Physiol (2015) | [26388782](https://pubmed.ncbi.nlm.nih.gov/26388782/) | Leucine trigger, mTORC1 saturation threshold (~2.5-3g leucine), and optimal protein feeding distribution (0.3-0.4 g/kg/meal). |
| 16 | `sci_physiol_schoenfeld_2013` | Potential mechanisms for a role of metabolic stress in hypertrophic adaptations to resistance training | Schoenfeld, B. J. | Sports Med (2013) | [23338987](https://pubmed.ncbi.nlm.nih.gov/23338987/) | Anaerobic metabolite accumulation, cell swelling, autocrine myokines, and high-threshold motor unit recruitment. |
| 17 | `sci_physiol_west_2010` | Human exercise-mediated skeletal muscle hypertrophy is an intrinsic process | West, D. W., Burd, N. A., Staples, A. W., Phillips, S. M. | Int J Biochem Cell Biol (2010) | [20541030](https://pubmed.ncbi.nlm.nih.gov/20541030/) | Intramuscular intrinsic meccano-signaling (p70S6K) drives hypertrophy, refuting dependence on transient systemic endocrine spikes. |
| 18 | `sci_physiol_snijders_2017` | Muscle fibre capillarization is a critical factor in muscle fibre hypertrophy during resistance exercise training in older men | Snijders, T., Nederveen, J. P., Joanisse, S., et al. | J Cachexia Sarcopenia Muscle (2017) | [27897408](https://pubmed.ncbi.nlm.nih.gov/27897408/) | Basal type II capillary-to-fiber perimeter exchange index (CFPE) dictates satellite cell proliferation and muscle growth. |
| 19 | `sci_physiol_damas_2018` | Early- and later-phases satellite cell responses and myonuclear content with resistance training in young men | Damas, F., Libardi, C. A., Ugrinowitsch, C., et al. | PLoS ONE (2018) | [29324825](https://pubmed.ncbi.nlm.nih.gov/29324825/) | Time course of satellite cells: initial phase dedicated to EIMD muscle damage repair; later phase fuels true myofibrillar hypertrophy. |
| 20 | `sci_physiol_andersen_2010` | Effects of strength training on muscle fiber types and size; consequences for athletes training for high-intensity sport | Andersen, J. L., Aagaard, P. | Scand J Med Sci Sports (2010) | [20840560](https://pubmed.ncbi.nlm.nih.gov/20840560/) | Heavy training triggers MHC IIX to IIA transition; subsequent tapering produces IIX overshoot for peak power/speed. |
| 21 | `sci_physiol_coffey_2017` | Concurrent exercise training: do opposites distract? | Coffey, V. G., Hawley, J. A. | J Physiol (2017) | [27506998](https://pubmed.ncbi.nlm.nih.gov/27506998/) | Molecular interference: AMPK-mediated inhibition of mTORC1 via TSC2/Raptor; temporal spacing (>6-8h) and nutritional mitigations. |
| 22 | `sci_physiol_bishop_2014` | Can we optimise the exercise training prescription to maximise improvements in mitochondria function and content? | Bishop, D. J., Granata, C., Eynon, N. | Sports Med (2014) | [24128929](https://pubmed.ncbi.nlm.nih.gov/24128929/) | Polarized model: training intensity drives mitochondrial respiratory efficiency; volume drives total mitochondrial content. |
| 23 | `sci_physiol_plews_2013` | Training adaptation and heart rate variability in elite endurance athletes: opening the door to effective monitoring | Plews, D. J., Laursen, P. B., Stanley, J., et al. | Sports Med (2013) | [23852425](https://pubmed.ncbi.nlm.nih.gov/23852425/) | 7-day rolling average Ln-rMSSD for tracking parasympathetic status and autoregulating training load against non-functional overreaching. |
| 24 | `sci_physiol_stanley_2013` | Cardiac parasympathetic reactivation following exercise: implications for training prescription | Stanley, J., Peake, J. M., Buchheit, M. | Sports Med (2013) | [23912805](https://pubmed.ncbi.nlm.nih.gov/23912805/) | Post-exercise parasympathetic recovery kinetics (up to 48h after severe eccentric or anaerobic bouts); scheduling recovery windows. |
| 25 | `sci_physiol_hyldahl_2014` | Lengthening our perspective: morphological, cellular, and molecular responses to eccentric exercise | Hyldahl, R. D., Hubal, M. J. | Sports Med (2014) | [24030935](https://pubmed.ncbi.nlm.nih.gov/24030935/) | Sarcolemmal strain, mechanosensitive channels, repeated bout effect, and eccentric protective remodelling (sarcomerogenesis). |
| 26 | `sci_physiol_scott_2015` | Exercise with blood flow restriction: an updated evidence-based approach for enhanced muscular development | Scott, B. R., Loenneke, J. P., Slattery, K. M., Dascombe, B. J. | Sports Med (2015) | [25430600](https://pubmed.ncbi.nlm.nih.gov/25430600/) | Blood flow restriction (40-80% AOP) with light loads (20-30% 1RM) matches high-load hypertrophy with minimal articular stress. |
| 27 | `sci_physiol_petrella_2008` | Potent myofiber hypertrophy during resistance training in humans is associated with satellite cell-mediated myonuclear addition: a cluster analysis | Petrella, J. K., Kim, J. S., Mayhew, D. L., et al. | J Appl Physiol (2008) | [18436694](https://pubmed.ncbi.nlm.nih.gov/18436694/) | Extreme responders vs non-responders: satellite cell myonuclear accretion enables growth beyond myonuclear domain limits. |
| 28 | `sci_physiol_egan_2016` | SnapShot: Exercise Metabolism | Egan, B., Hawley, J. A., Zierath, J. R. | Cell Metab (2016) | [27508878](https://pubmed.ncbi.nlm.nih.gov/27508878/) | Fuel selection, glycogen turnover, calcium-calmodulin kinase signaling, and metabolic adaptation mapping during exercise. |

---

## 4. Verification and Quality Assurance

1. **NCBI E-Utilities Verification**: All 28 papers were directly verified against NCBI PubMed via `test_sources_group_b.py`. Every single paper returned status `[VERIFIED]` with matching article metadata.
2. **Deduplication**: Cross-checked against the 161 existing sources from `js/knowledge-base.js` and `.agents/explorer_sources_inventory/report.md`. Result: 0 collisions in PMIDs, 0 collisions in titles, 0 collisions in IDs.
3. **Controlled Vocabularies**:
   - `area`: exactly `"Biomeccanica"` or `"Fisiologia"`.
   - `patientTypes`: strictly `"Atleta"` and/or `"Clinico"`.
   - `sports`: values chosen exclusively from the standard list (`"Atletica Leggera"`, `"Sport di Squadra"`, `"Calcio"`, `"Basketball"`, `"Endurance"`, `"Bodybuilding"`).
   - `goals`: values chosen exclusively from the standard list (`"Power"`, `"Strength"`, `"Hypertrophy"`, `"Resistenza"`, `"Rehab"`, `"Definition"`).
   - `injuries`: standard clinical tags used where appropriate (`"lumbar_pain"`, `"sensitive_back"`, `"hernia_disk"`, `"patellar_tendonitis"`, `"achilles_tendonitis"`, `"lesione_lca"`, `"knee_generic"`, `"lesione_muscolare"`).
4. **Emoji Hygiene**: Zero emojis in all IDs, titles, abstracts, journals, and rules fields.
5. **Project Syntax Check**: `py test_check.py` executed and passed cleanly with Exit 0.
