# Dispatch Log

## 2026-09-12T19:44:21Z
Implementare la correzione del pulsante tn-ex-detail nella vista Programmazione (js/ui/wizard.js), creando un modulo dedicato js/ui/exercise-detail-resolver.js che adotta una strategia di risoluzione multi-livello (ID, nome esatto normalizzato, sottostringa/base) e un generatore di scheda sintetica avanzata e strutturata per tutti gli esercizi (warmup, clinici, cardio) non presenti nel catalogo locale, garantendo che al click di ogni freccetta si apra sempre il modal enderDetail completo, informativo e privo di campi vuoti o N/A.

Requirements:
- R1. Modulo Dedicato di Risoluzione (js/ui/exercise-detail-resolver.js)
- R2. Integrazione nel Listener di wizard.js
- R3. Integrazione PWA, Orchestratore UI & Service Worker (sw.js cache t7-workout-v68)
- R4. Suite di Test Automatizzata & Validazione (	ests/test_exercise_detail_resolver.js e py test_check.py)
