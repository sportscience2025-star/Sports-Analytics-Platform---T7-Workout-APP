@echo off
title T7 Workout Platform - Avvio Applicazione
echo ======================================================================
echo    T7 Workout Platform - Sports Analytics & Biomechanics
echo ======================================================================
echo.
echo Avvio del server locale Vite in corso...
echo L'applicazione si aprira' automaticamente nel browser predefinito.
echo.
echo Per arrestare l'applicazione, chiudi semplicemente questa finestra.
echo ======================================================================
echo.

start "" http://localhost:5173
npm run dev
