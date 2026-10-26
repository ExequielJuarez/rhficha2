@echo off
setlocal EnableExtensions
title Ficha Tecnica de Vehiculos - NO CERRAR mientras se usa
cd /d "%~dp0"
set "RAIZ=%~dp0"
set "NODE=%RAIZ%node\node.exe"
set "BIN=%RAIZ%mariadb\bin"
set "DATOS=%RAIZ%datos\mysql"
set "PUERTO_DB=3307"
set "PUERTO_WEB=3000"

if not exist "%NODE%" goto falta
if not exist "%BIN%\mariadbd.exe" goto falta

rem --- Si el sistema ya esta abierto, solo abrimos el navegador
netstat -ano | findstr ":%PUERTO_WEB% " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
  echo El sistema ya esta funcionando. Abriendo el navegador...
  start "" "http://localhost:%PUERTO_WEB%"
  timeout /t 3 >nul
  exit /b 0
)

rem --- Base de datos: la primera vez se prepara sola
if not exist "%RAIZ%datos" mkdir "%RAIZ%datos"
"%BIN%\mariadb-admin.exe" --protocol=tcp --host=127.0.0.1 --port=%PUERTO_DB% -uroot ping >nul 2>&1
if not errorlevel 1 goto db_lista

if exist "%DATOS%\mysql" goto db_arrancar
echo Preparando la base de datos por primera vez. Puede tardar un minuto...
"%BIN%\mariadb-install-db.exe" --datadir="%DATOS%" > "%RAIZ%datos\instalacion.log" 2>&1
if errorlevel 1 goto error_instalacion

:db_arrancar
echo Iniciando la base de datos...
start "Base de datos (no cerrar)" /min "%BIN%\mariadbd.exe" --datadir="%DATOS%" --port=%PUERTO_DB% --bind-address=127.0.0.1 --character-set-server=utf8mb4 --collation-server=utf8mb4_general_ci --console
set /a intentos=0
:esperar_db
"%BIN%\mariadb-admin.exe" --protocol=tcp --host=127.0.0.1 --port=%PUERTO_DB% -uroot ping >nul 2>&1
if not errorlevel 1 goto db_lista
set /a intentos+=1
if %intentos% GEQ 45 goto error_db
timeout /t 1 /nobreak >nul
goto esperar_db

:db_lista
rem --- Configuracion (la clave de sesiones se crea una sola vez)
if not exist "%RAIZ%datos\secreto.txt" "%NODE%" -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))" > "%RAIZ%datos\secreto.txt"
set /p SESSION_SECRET=<"%RAIZ%datos\secreto.txt"
set "PORT=%PUERTO_WEB%"
set "DB_HOST=127.0.0.1"
set "DB_PORT=%PUERTO_DB%"
set "DB_USER=root"
set "DB_PASSWORD="
set "DB_NAME=vehiculos_db"
set "TZ=America/Argentina/Buenos_Aires"
set "UPLOADS_DIR=%RAIZ%datos\archivos"

rem --- Crea la base, las tablas y los usuarios (admin y usuario) si todavia no existen
cd /d "%RAIZ%app"
"%NODE%" scripts\crear-usuarios.js
if errorlevel 1 goto error_usuarios

cls
echo ============================================================
echo   FICHA TECNICA DE VEHICULOS FUNCIONANDO
echo ============================================================
echo.
echo   En esta PC:        http://localhost:%PUERTO_WEB%
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do for /f "tokens=* delims= " %%b in ("%%a") do echo   Desde otra PC/cel: http://%%b:%PUERTO_WEB%
echo.
echo   admin    -  clave: Ficha2026!    (ve todo)
echo   usuario  -  clave: Usuario2026!  (sin reportes ni auditoria)
echo   (cambiar las claves al entrar: Control de Acceso ^> Usuarios)
echo.
echo   Para terminar el dia: abri  detener.bat  (guarda una copia de
echo   seguridad y apaga todo). Esta ventana debe seguir abierta.
echo ============================================================
echo.
start "" cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:%PUERTO_WEB%"

"%NODE%" src\app.js

rem --- Al terminar: copia de seguridad y apagado ordenado de la base
echo.
echo Guardando copia de seguridad...
call "%RAIZ%respaldo.bat" silencioso
"%BIN%\mariadb-admin.exe" --protocol=tcp --host=127.0.0.1 --port=%PUERTO_DB% -uroot shutdown >nul 2>&1
exit /b 0

:falta
echo No se encuentran los archivos del programa. Copia de nuevo la carpeta completa.
pause
exit /b 1

:error_instalacion
echo No se pudo preparar la base de datos. Revisa datos\instalacion.log
echo Si dice VCRUNTIME140.dll instala "Visual C++ Redistributable" de Microsoft y proba de nuevo.
pause
exit /b 1

:error_db
echo La base de datos no arranco. Si es la primera vez, proba cerrar y abrir de nuevo.
echo Si el problema sigue, borra la carpeta "datos" (SOLO si todavia no cargaste datos) y reintenta.
pause
exit /b 1

:error_usuarios
echo No se pudo preparar la base de datos del sistema. Cerra esta ventana, abri detener.bat y volve a probar.
pause
exit /b 1
