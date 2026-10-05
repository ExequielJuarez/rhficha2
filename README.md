# Ficha Técnica de Vehículos

Sistema web (Node.js + Express + EJS + Sequelize/MySQL) para gestionar la flota municipal:
vehículos, choferes y licencias, asignaciones, mantenimientos y repuestos, herramientas y préstamos,
siniestros, alertas automáticas, reportes y auditoría.

## Puesta en marcha

1. Requisitos: Node.js 20+ y MySQL/MariaDB.
2. Instalar dependencias: `npm install`
3. Crear la base de datos con los datos de ejemplo (**borra y recrea `vehiculos_db`**):
   `mysql -u root -p < pruebasdb/copiaseguridad.sql`
4. Copiar `.env.example` a `.env` y completar los datos de conexión y `SESSION_SECRET`.
5. Iniciar: `npm start` (o `npm run dev` con recarga automática) y abrir http://localhost:3000

Usuarios de ejemplo (contraseña temporal `Ficha2026!`, cambiarla al ingresar): `admin`, `carlos_oficina`, `walter`, `ExeJuarez`.

### Producción

- `NODE_ENV=production` exige `SESSION_SECRET` y las variables `DB_*` (no hay credenciales en el código).
- Detrás de un proxy HTTPS la cookie de sesión es `secure`. Las sesiones se guardan en la tabla `sessions`.
- La zona horaria de la aplicación es `America/Argentina/Buenos_Aires` (variable `TZ` para cambiarla).

## Pruebas

`npm test` recrea una base **aparte** (`vehiculos_test`) desde `pruebasdb/copiaseguridad.sql`, levanta la
aplicación y recorre los flujos (login/permisos, usuarios, vehículos, choferes, asignaciones,
mantenimientos, herramientas, siniestros, alertas, reportes). No toca la base real.

## Notas de diseño

- Permisos por módulo (`Vehicles`, `Choferes`, `Mantenimientos`, `Tools`, `Alertas`, `Reportes`, `Usuarios`, `Roles`,
  `Auditoria`, `Siniestros`). Se revalidan contra la base en cada pedido. Los permisos del **usuario** prevalecen;
  los del rol sólo se usan si el usuario no tiene ninguno propio.
- Todo formulario/fetch de escritura lleva token CSRF (lo agrega `public/js/csrf.js`).
- Alertas: licencias (≤30 días), RTO/seguro, service por km, préstamos vencidos y siniestros abiertos. Se recalculan al
  iniciar, cada día a las 6:00, al abrir el Panel de Alertas y tras los cambios relevantes; las que dejan de corresponder se eliminan.
- Mantenimientos: **Programado** (próximo service por km, sin fecha; no mueve el vehículo), **En proceso** (en el taller) y **Realizado** (también para cargar services viejos). La alerta de service usa el service programado más cercano o el "próximo km" del último service realizado.
- Estados de vehículo: `Disponible`, `En uso` (sólo vía Asignaciones), `En mantenimiento`, `En siniestro` (sólo vía Siniestros) y `Baja`.
- Las imágenes subidas se guardan en `public/img/*` (sólo JPG/PNG/WEBP/GIF, y PDF en siniestros; máx. 5 MB) y no se versionan.
