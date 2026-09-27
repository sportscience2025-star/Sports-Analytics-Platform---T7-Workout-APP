---
trigger: always_on
---

# Project Guidelines & Rules

## Multi-Agent Safety Rules (Progetto T7 Workout PWA)

- **Chirurgia precisa**: modifica solo i file strettamente necessari alla task assegnata. Non fare refactoring strutturale di file che non rientrano nel perimetro della richiesta. Lavora, inserisci e modifica file sempre e solo nei limiti della tua zona di lavoro che è la cartella: "App esercizi scienze motorie". Non ti è concesso andare a modificare altri file dentro al computer, se per un qualsiasi motivo dovessi fare un operazione del genere dovrai richiederlo in modo chiaro ed esplicito.
- **Bump SW cache**: ogni volta che si modificano file JS, CSS o asset, incrementa il numero di versione della cache in `sw.js` (es: `t7-workout-v14` → `t7-workout-v15`) per invalidare la cache browser.
- **Nessun conflitto cross-agent**: se un file è stato modificato di recente da un'altra IA (visibile dai diff nel contesto), non riscrivere quelle sezioni — integra solo le modifiche necessarie.
- **Test dopo ogni modifica**: eseguire `py test_check.py` dopo ogni modifica a file `.js`. Riportare sempre i risultati all'utente in modo riassuntivo ma chiaro: file modificati, esito del test, eventuali errori. Non eseguire altri script di test a meno che l'utente non lo richieda esplicitamente per iscritto oppure se ne sono necessari altri di altro tipo l'agente lo deve richiedere esplicitamente specificando il motivo per cui vorrebbe fare quei test.
- **Validazione Sintattica Obbligatoria (JavaScript)**: Se `py test_check.py` riporta un errore (es. "Unclosed {" o "Mismatched ("), l'agente deve risolvere immediatamente il problema sintattico prima di procedere oltre.

## Rules Relative al Progetto

- **Protocollo Esaurimento Contesto / Token (Handoff):** Se il task non può essere completato nella sessione attiva perché si sta quasi per finire i token: arrestarsi in stato stabile e fare un recap di quello che si è fatto in modo che quando i token torneranno attivi l'agente che riprendere in mano il lavoro che è stato interrotto riuscirà a capire meglio cosa deve fare, cosa è stato fatto, come deve farlo e quindi a concludere in modo più efficiente e veloce. Nel riassunto mettere:
  1. `Stato completamento`: file modificati ed esito dei test.
  2. `Punto di blocco`: riga o funzione esatta interrotta.
  3. `Next Steps puntuali`: i comandi esatti e i file che l'agente successivo dovrà prendere in carico.

- **Utilizzare sempre più agenti per ogni task specifica:** Se si riceve un compito complesso si deve assegnare per ogni mansioni un sub-agente creato e pensato appositamente per svolgere quel compito. Bisogna essere assolutamente efficaci ed efficienti nel portare a termine la task.

- **Emoji:** Non utilizzare emoji, figure o immagini in modo spontaneo nell'applicazione durante un operazione che ti ho assegnato a meno che non sia io a richiedertelo in modo esplicito.
