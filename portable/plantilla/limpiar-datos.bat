@echo off
setlocal EnableExtensions
title Limpiar datos - Ficha Tecnica
cd /d "%~dp0"
set "RAIZ=%~dp0"
set "NODE=%RAIZ%node\node.exe"
set "BIN=%RAIZ%mariadb\bin"
set "PUERTO_DB=3308"

"%BIN%\mariadb-admin.exe" --protocol=tcp --host=127.0.0.1 --port=%PUERTO_DB% -uroot ping >nul 2>&1
if errorlevel 1 (
  echo La base de datos no esta encendida. Abri primero iniciar.bat y luego proba de nuevo.
  pause
  exit /b 1
)
echo.
echo  Se van a BORRAR vehiculos, choferes y todo lo asociado (asignaciones,
echo  mantenimientos, repuestos, herramientas, siniestros, documentos, alertas
echo  y auditoria). Se conservan los usuarios, roles y tipos de vehiculo.
echo  Esta accion NO se puede deshacer.
echo.
set /p CONFIRMA=  Escribi SI (en mayusculas) para continuar: 
if /i not "%CONFIRMA%"=="SI" (
  echo Cancelado. No se borro nada.
  pause
  exit /b 0
)
set "DB_HOST=127.0.0.1"
set "DB_PORT=%PUERTO_DB%"
set "DB_USER=root"
set "DB_PASSWORD="
set "DB_NAME=vehiculos_db"
set "UPLOADS_DIR=%RAIZ%datos\archivos"
cd /d "%RAIZ%app"
"%NODE%" scripts\limpiar-datos.js --confirmar
pause
