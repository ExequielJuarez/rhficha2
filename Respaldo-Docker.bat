@echo off
rem --- Se ejecuta dentro de una ventana que NUNCA se cierra sola (cmd /k): asi siempre se puede leer cualquier mensaje o error
if /i not "%~1"=="dentro" (
  cmd /k ""%~f0" dentro %*"
  exit /b
)
setlocal EnableExtensions
cd /d "%~dp0"
title Copia de seguridad - Docker
echo.
where docker >nul 2>nul
if errorlevel 1 (
  echo  [ERROR] No se encontro Docker. Instala "Docker Desktop" desde https://www.docker.com/products/docker-desktop
  echo          y volve a abrir este archivo.
  pause
  exit /b 1
)
docker info >nul 2>nul
if errorlevel 1 (
  echo  [ERROR] Docker Desktop esta instalado pero apagado.
  echo          Abrilo, espera a que diga "Engine running" ^(abajo a la izquierda^) y volve a abrir este archivo.
  pause
  exit /b 1
)

docker compose ps --format "{{.Status}}" db 2>nul | findstr /C:"(healthy)" >nul
if errorlevel 1 (
  echo  [ERROR] El sistema no esta encendido. Abri primero Iniciar-Docker.bat
  pause
  exit /b 1
)
for /f %%i in ('powershell -nologo -noprofile -command "Get-Date -Format yyyy-MM-dd_HH-mm"') do set "FECHA=%%i"
if not exist "respaldos" mkdir "respaldos"
docker compose exec -T db sh -c "mariadb-dump -u$MARIADB_USER -p$MARIADB_PASSWORD --databases $MARIADB_DATABASE --single-transaction --default-character-set=utf8mb4" > "respaldos\fichatecnica_%FECHA%.sql"
if errorlevel 1 (
  echo  [ERROR] No se pudo hacer la copia de seguridad.
  pause
  exit /b 1
)
echo  Copia guardada en: respaldos\fichatecnica_%FECHA%.sql
echo  ^(Incluye la base de datos. Los documentos y fotos subidos viven en los volumenes de Docker:
echo   para copiarlos mira la seccion "Docker" del README.^)
echo  Guarda la carpeta "respaldos" tambien en un pendrive o en la nube.
