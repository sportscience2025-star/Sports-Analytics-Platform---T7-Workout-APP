---
trigger: model_decision
description: "Attivare solo quando si adotta un nuovo tool o estensione IDE, quando l'utente chiede di verificare/allineare le estensioni o quando un git pull modifica .vscode/extensions.json."
---

# Regola 07: Sincronizzazione Estensioni IDE (VS Code / Antigravity)

## Scopo
Mantenere identiche le estensioni dell'editor tra PC Fisso e Portatile usando `.vscode/extensions.json` come elenco condiviso su Git, senza appesantire le normali sessioni di lavoro.

## Cosa l'AI NON può fare (Divieti assoluti)
- **Zero controlli inutili:** non interrogare né controllare le estensioni via terminale a ogni messaggio.
- **Nessuna installazione forzata:** non installare estensioni in silenzio o con forza da terminale (il comando `code --install-extension <id>` è ammesso solo su richiesta esplicita dell'utente o se la grafica dell'IDE è bloccata).

## Cosa l'AI DEVE fare (Obblighi operativi)
- **Aggiornare l'elenco condiviso:** quando si adotta un nuovo tool o l'utente segnala una nuova estensione installata su fisso o portatile, aggiungere il suo ID nell'array `recommendations` di `.vscode/extensions.json`.
- **Attivarsi solo su eventi precisi:** intervenire esclusivamente se (1) `git pull` aggiorna `.vscode/extensions.json`, (2) l'utente chiede esplicitamente un controllo estensioni, oppure (3) l'AI stessa ha appena modificato `.vscode/extensions.json`.
- **Avvisare l'utente in chat:** quando `.vscode/extensions.json` viene aggiornato o scaricato con novità, mostrare questo messaggio:
  > *"La lista delle estensioni raccomandate è stata aggiornata in `.vscode/extensions.json`. Clicca su **'Install All'** nel pop-up in basso a destra dell'IDE, oppure apri il pannello Estensioni (`Ctrl+Shift+X`), digita `@recommended` e clicca su Installa per allineare l'ambiente."*
