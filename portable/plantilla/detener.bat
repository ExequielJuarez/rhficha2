@echo off
setlocal EnableExtensions
title Detener Ficha Tecnica de Vehiculos
cd /d "%~dp0"
set "RAIZ=%~dp0"
set "BIN=%RAIZ%mariadb\bin"
set "PUERTO_DB=3307"
set "PUERTO_WEB=3000"

echo Guardando copia de seguridad...
call "%RAIZ%respaldo.bat" silencioso

echo Cerrando el sistema...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%PUERTO_WEB% " ^| findstr "LISTENING"') do taskkill /PID %%p /F >nul 2>&1

echo Cerrando la base de datos...
"%BIN%\mariadb-admin.exe" --protocol=tcp --host=127.0.0.1 --port=%PUERTO_DB% -uroot shutdown >nul 2>&1

echo.
echo Listo. Ya se puede apagar la PC.
timeout /t 4 >nul
exit /b 0
