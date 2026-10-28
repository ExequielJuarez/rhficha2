@echo off
rem --- Se ejecuta dentro de una ventana que NUNCA se cierra sola (cmd /k): asi siempre se puede leer cualquier mensaje o error
if /i not "%~1"=="dentro" (
  cmd /k ""%~f0" dentro %*"
  exit /b
)
setlocal EnableExtensions
cd /d "%~dp0"
title Detener Ficha Tecnica - Docker
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

echo  Apagando el sistema ^(los datos se conservan^)...
docker compose down
echo.
echo  Listo. Para volver a encenderlo: Iniciar-Docker.bat
