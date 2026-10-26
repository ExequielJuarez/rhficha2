@echo off
setlocal EnableExtensions
chcp 65001 >nul
title Ficha Tecnica - Limpiar datos
cd /d "%~dp0"

echo.
echo  ==========================================================
echo    LIMPIAR DATOS  -  deja el sistema vacio para cargar todo
echo  ==========================================================
echo.
echo  Se van a BORRAR:  vehiculos, choferes, asignaciones, mantenimientos,
echo                    repuestos, herramientas, prestamos, siniestros,
echo                    documentos subidos, alertas y auditoria.
echo.
echo  Se CONSERVAN:     los usuarios (admin y usuario), los roles
echo                    y los tipos de vehiculo.
echo.
echo  Esta accion NO se puede deshacer.
echo.
set /p CONFIRMA=  Escribi SI (en mayusculas) para continuar: 
if /i not "%CONFIRMA%"=="SI" (
  echo.
  echo  Cancelado. No se borro nada.
  pause
  exit /b 0
)

where node >nul 2>nul
if errorlevel 1 (
  echo  [ERROR] No se encontro Node.js. Instalalo desde https://nodejs.org
  pause
  exit /b 1
)
if not exist ".env" (
  echo  [ERROR] No existe el archivo .env. Ejecuta primero Iniciar-Ficha-Tecnica.bat
  pause
  exit /b 1
)

echo.
call node scripts\limpiar-datos.js --confirmar
if errorlevel 1 (
  pause
  exit /b 1
)
pause
endlocal
