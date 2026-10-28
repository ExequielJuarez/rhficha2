# syntax=docker/dockerfile:1
# ──────────────────────────────────────────────────────────────────────────────
#  Ficha Técnica de Vehículos · imagen de la aplicación (Node.js + Express)
#  La base de datos NO va acá: corre en su propio contenedor (ver docker-compose.yml).
# ──────────────────────────────────────────────────────────────────────────────

# Etapa 1: instala solo las dependencias de producción (aprovecha la caché de capas)
FROM node:22-alpine AS dependencias
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# Etapa 2: imagen final, liviana y sin herramientas de desarrollo
FROM node:22-alpine
# tzdata: necesario en Alpine para que la hora sea la de Argentina (la app lo exige para fechas y alertas)
RUN apk add --no-cache tzdata
ENV NODE_ENV=production \
    TZ=America/Argentina/Buenos_Aires \
    PORT=3000 \
    UPLOADS_DIR=/data/uploads
WORKDIR /app

COPY --from=dependencias /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY public ./public
COPY pruebasdb/esquema.sql ./pruebasdb/esquema.sql
COPY scripts/crear-usuarios.js scripts/limpiar-datos.js ./scripts/
COPY docker/entrypoint.sh ./docker/entrypoint.sh

# El script de arranque puede venir con finales de línea de Windows (CRLF): se normaliza.
# Se prepara la carpeta de documentos subidos y se entrega todo a un usuario sin privilegios (no root).
RUN sed -i 's/\r$//' ./docker/entrypoint.sh \
 && mkdir -p /data/uploads \
 && chown -R node:node /app /data
USER node

EXPOSE 3000

# "Sano" = la pantalla de login responde
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/InicioSesion').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["sh", "./docker/entrypoint.sh"]
