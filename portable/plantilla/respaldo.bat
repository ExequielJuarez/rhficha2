@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "RAIZ=%~dp0"
set "BIN=%RAIZ%mariadb\bin"
set "PUERTO_DB=3307"

"%BIN%\mariadb-admin.exe" --protocol=tcp --host=127.0.0.1 --port=%PUERTO_DB% -uroot ping >nul 2>&1
if errorlevel 1 (
  if not "%~1"=="silencioso" echo La base de datos no esta encendida. Abri primero iniciar.bat
  if not "%~1"=="silencioso" pause
  exit /b 1
)

for /f %%i in ('powershell -nologo -noprofile -command "Get-Date -Format yyyy-MM-dd_HH-mm"') do set "FECHA=%%i"
if not exist "%RAIZ%respaldos" mkdir "%RAIZ%respaldos"
"%BIN%\mariadb-dump.exe" --protocol=tcp --host=127.0.0.1 --port=%PUERTO_DB% -uroot --databases vehiculos_db --single-transaction --routines --default-character-set=utf8mb4 --result-file="%RAIZ%respaldos\fichatecnica_%FECHA%.sql" >nul 2>&1
if errorlevel 1 (
  if not "%~1"=="silencioso" echo No se pudo hacer la copia de seguridad.
  if not "%~1"=="silencioso" pause
  exit /b 1
)
if not "%~1"=="silencioso" (
  echo Copia guardada en: respaldos\fichatecnica_%FECHA%.sql
  echo Guarda tambien una copia de las carpetas "respaldos" y "datos\archivos" en un pendrive o en la nube.
  pause
)
exit /b 0
