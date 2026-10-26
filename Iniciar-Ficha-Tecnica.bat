@echo off
setlocal EnableExtensions
chcp 65001 >nul
title Ficha Tecnica de Vehiculos
cd /d "%~dp0"

echo.
echo  ==========================================================
echo    FICHA TECNICA DE VEHICULOS - Iniciando el sistema
echo  ==========================================================
echo.

rem ---------- 1) Node.js instalado? ----------
where node >nul 2>nul
if errorlevel 1 (
  echo  [ERROR] No se encontro Node.js en esta computadora.
  echo          Instalalo desde https://nodejs.org  ^(version LTS^) y volve a abrir este archivo.
  echo.
  pause
  exit /b 1
)

rem ---------- 2) Dependencias ----------
if not exist "node_modules\express\package.json" goto instalar
if not exist "node_modules\exceljs\package.json" goto instalar
goto dependencias_ok
:instalar
echo  [1/4] Instalando dependencias ^(solo la primera vez, puede tardar unos minutos^)...
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo.
  echo  [ERROR] No se pudieron instalar las dependencias. Revisa tu conexion a internet.
  pause
  exit /b 1
)
:dependencias_ok

rem ---------- 3) Configuracion (.env) ----------
if not exist ".env" (
  echo  [2/4] Creando el archivo de configuracion .env ^(base local: usuario root, sin contrasena^)...
  copy /y ".env.example" ".env" >nul
  echo        Si tu MySQL tiene contrasena, abri el archivo .env con el Bloc de notas
  echo        y completa la linea DB_PASSWORD=  ^(despues volve a ejecutar este archivo^).
) else (
  echo  [2/4] Configuracion .env encontrada.
)

rem ---------- 4) Base de datos y usuarios ----------
echo  [3/4] Preparando la base de datos y los usuarios ^(MySQL debe estar encendido^)...
call node scripts\crear-usuarios.js
if errorlevel 1 (
  echo  No se pudo continuar. Corregi lo indicado arriba y volve a ejecutar este archivo.
  pause
  exit /b 1
)

rem ---------- 5) Abrir el navegador y arrancar ----------
echo  [4/4] Iniciando el servidor en http://localhost:3000
echo        ^(para detener el sistema cerra esta ventana o presiona Ctrl + C^)
echo.
start "" /b cmd /c "ping -n 7 127.0.0.1 >nul & start http://localhost:3000"
call node src\app.js

echo.
echo  El sistema se detuvo.
pause
endlocal
