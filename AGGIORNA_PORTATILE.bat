@echo off
title T7 Workout - Aggiornamento e Sincronizzazione Portatile
echo ======================================================================
echo    T7 Workout Platform - Sincronizzazione Multi-Dispositivo
echo ======================================================================
echo.
echo [1/2] Scaricamento ultimi aggiornamenti da GitHub (origin/main)...
git pull origin main
echo.
echo [2/2] Installazione / allineamento dipendenze e librerie npm...
call npm install
echo.
echo ======================================================================
echo Sincronizzazione repository completata con successo!
echo.
echo Per allineare le estensioni dell'IDE (React + TypeScript):
echo 1. Apri la schermata Estensioni con la combinazione tasti: Ctrl+Shift+X
echo 2. Digita nella barra di ricerca: @recommended
echo 3. Clicca sul pulsante 'Installa' / 'Install All'
echo.
echo Per avviare l'applicazione fai doppio clic su AVVIA_APP.bat
echo ======================================================================
echo.
pause
