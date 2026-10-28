#!/bin/sh
# Arranque del contenedor de la aplicación:
#   1) genera (una sola vez) la clave de sesiones si no se indicó una
#   2) espera a la base de datos, la prepara (crea tablas, usuarios y tipos de vehículo) — es idempotente
#   3) inicia el servidor
set -e

# Clave de sesiones: la que se indique, o una aleatoria que se guarda en el volumen para no cambiarla en cada reinicio
if [ -z "$SESSION_SECRET" ]; then
  ARCHIVO_SECRETO="${UPLOADS_DIR:-/data/uploads}/.secreto-sesiones"
  if [ ! -s "$ARCHIVO_SECRETO" ]; then
    node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))" > "$ARCHIVO_SECRETO"
    chmod 600 "$ARCHIVO_SECRETO"
    echo "🔑 Se generó la clave de sesiones (se guarda en el volumen de datos)."
  fi
  SESSION_SECRET="$(cat "$ARCHIVO_SECRETO")"
  export SESSION_SECRET
fi

# La base puede tardar unos segundos en aceptar conexiones: se reintenta antes de rendirse
INTENTOS=0
until node scripts/crear-usuarios.js; do
  INTENTOS=$((INTENTOS + 1))
  if [ "$INTENTOS" -ge 20 ]; then
    echo "❌ No se pudo preparar la base de datos después de $INTENTOS intentos."
    exit 1
  fi
  echo "⏳ Esperando a la base de datos (intento $INTENTOS de 20)..."
  sleep 3
done

echo "🚀 Iniciando el sistema en el puerto ${PORT:-3000}..."
exec node src/app.js
