@echo off
rem --- Se ejecuta dentro de una ventana que NUNCA se cierra sola (cmd /k): asi siempre se puede leer cualquier mensaje o error
if /i not "%~1"=="dentro" (
  cmd /k ""%~f0" dentro %*"
  exit /b
)
setlocal EnableExtensions
cd /d "%~dp0"
title Restaurar copia de seguridad - Docker
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

if "%~2"=="" (
  echo  Arrastra un archivo .sql de la carpeta "respaldos" encima de este archivo Restaurar-Docker.bat
  pause
  exit /b 1
)
echo  ATENCION: se van a REEMPLAZAR todos los datos actuales por los del archivo:
echo    %~2
set /p OK="  Escribi SI para continuar: "
if /i not "%OK%"=="SI" (
  echo  Cancelado.
  pause
  exit /b 0
)
docker compose exec -T db sh -c "mariadb -uroot -p$MARIADB_ROOT_PASSWORD --default-character-set=utf8mb4" < "%~2"
if errorlevel 1 (
  echo  [ERROR] No se pudo restaurar el archivo.
) else (
  echo  Copia restaurada correctamente.
)
