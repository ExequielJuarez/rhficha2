@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "RAIZ=%~dp0"
set "BIN=%RAIZ%mariadb\bin"
set "PUERTO_DB=3308"
title Restaurar copia de seguridad

if "%~1"=="" (
  echo Arrastra un archivo .sql de la carpeta "respaldos" encima de este archivo restaurar.bat
  pause
  exit /b 1
)
"%BIN%\mariadb-admin.exe" --protocol=tcp --host=127.0.0.1 --port=%PUERTO_DB% -uroot ping >nul 2>&1
if errorlevel 1 (
  echo La base de datos no esta encendida. Abri primero iniciar.bat y luego proba de nuevo.
  pause
  exit /b 1
)
echo ATENCION: se van a REEMPLAZAR todos los datos actuales por los del archivo:
echo   %~1
set /p OK="Escribi SI para continuar: "
if /i not "%OK%"=="SI" exit /b 0
"%BIN%\mariadb-admin.exe" --protocol=tcp --host=127.0.0.1 --port=%PUERTO_DB% -uroot --force drop vehiculos_db >nul 2>&1
"%BIN%\mariadb.exe" --protocol=tcp --host=127.0.0.1 --port=%PUERTO_DB% -uroot --default-character-set=utf8mb4 < "%~1"
if errorlevel 1 (echo No se pudo restaurar el archivo.) else (echo Copia restaurada correctamente. Cerra y volve a abrir iniciar.bat.)
pause
