@echo off
rem --- Se ejecuta dentro de una ventana que NUNCA se cierra sola (cmd /k): asi siempre se puede leer cualquier mensaje o error
if /i not "%~1"=="dentro" (
  cmd /k ""%~f0" dentro %*"
  exit /b
)
setlocal EnableExtensions
cd /d "%~dp0"
title Ficha Tecnica de Vehiculos - Docker
echo.
echo  ==========================================================
echo    FICHA TECNICA DE VEHICULOS - Iniciando con Docker
echo  ==========================================================
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

set "PUERTO=3000"
if exist ".env" for /f "tokens=2 delims==" %%p in ('findstr /B "FICHA_PUERTO=" .env 2^>nul') do set "PUERTO=%%p"

echo  [1/3] Construyendo e iniciando los contenedores ^(la primera vez tarda varios minutos^)...
docker compose up -d --build
if errorlevel 1 (
  echo.
  echo  [ERROR] No se pudo iniciar. Mira el mensaje de arriba.
  pause
  exit /b 1
)

echo  [2/3] Esperando a que el sistema este listo...
set /a intentos=0
:esperar
docker compose ps --format "{{.Status}}" app 2>nul | findstr /C:"(healthy)" >nul
if not errorlevel 1 goto listo
set /a intentos+=1
if %intentos% GEQ 60 goto tardo
timeout /t 3 /nobreak >nul
goto esperar

:tardo
echo.
echo  [AVISO] Esta tardando mas de lo normal. Mira lo que pasa con:  docker compose logs app
pause
exit /b 1

:listo
echo  [3/3] Listo. Abriendo el navegador...
echo.
echo   Sistema:   http://localhost:%PUERTO%
echo   admin    -  clave: Ficha2026!    ^(ve todo^)
echo   usuario  -  clave: Usuario2026!  ^(sin reportes ni auditoria^)
echo.
echo   Para apagar:        Detener-Docker.bat
echo   Copia de seguridad: Respaldo-Docker.bat
echo.
start "" "http://localhost:%PUERTO%"
echo  Podes cerrar esta ventana: el sistema sigue funcionando en segundo plano.
