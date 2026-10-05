# Ficha Técnica de Vehículos

Sistema web (Node.js + Express + EJS + Sequelize/MySQL) para gestionar la flota municipal:
vehículos, choferes y licencias, asignaciones, mantenimientos y repuestos, herramientas y préstamos,
siniestros, alertas automáticas, reportes y auditoría.

## Puesta en marcha

1. Requisitos: Node.js 20+ y MySQL/MariaDB en ejecución.
2. Instalar dependencias: `npm install`
3. Copiar `.env.example` a `.env` y completar los datos de conexión (`DB_*`) y `SESSION_SECRET`.
4. Iniciar: `npm start` (o `npm run dev` con recarga automática) y abrir http://localhost:3000

**La base se crea sola.** Al arrancar, la aplicación crea la base de datos si no existe, crea las tablas
(`pruebasdb/esquema.sql`) y, si no hay usuarios, el usuario `admin` (contraseña = `ADMIN_PASSWORD` del `.env`;
si no se define: `Ficha2026!` en desarrollo y una al azar —que se muestra en el log— en producción).

### Datos de ejemplo (para probar todo el sistema)

`npm run db:demo -- --confirmar` **borra y recrea** la base configurada con `pruebasdb/copiaseguridad.sql`: 18 vehículos
(en uso, en taller, en siniestro, de baja), 16 choferes (licencias vigentes, por vencer, vencidas), mantenimientos
programados / en proceso / realizados, herramientas y préstamos (vencidos, en reparación), siniestros, auditoría, etc.
Las fechas son relativas a "hoy", así que siempre hay alertas de todos los tipos.
También se puede importar a mano: `mysql -u root -p < pruebasdb/copiaseguridad.sql`.

Usuarios de ejemplo (contraseña temporal `Ficha2026!`, cambiarla al ingresar): `admin`, `carlos_oficina`, `walter`,
`ExeJuarez`, `taller_jefe` y `ex_empleado` (bloqueado, para probar el login).

Archivos de `pruebasdb/`: `esquema.sql` (tablas + roles), `datos_demo.sql` (datos de ejemplo) y `copiaseguridad.sql`
(los dos anteriores + recrear la base; se regenera con `npm run db:armar`).

### Producción

- `NODE_ENV=production` exige `SESSION_SECRET` y las variables `DB_*` (no hay credenciales en el código).
- Detrás de un proxy HTTPS la cookie de sesión es `secure`. Las sesiones se guardan en la tabla `sessions`.
- La zona horaria de la aplicación es `America/Argentina/Buenos_Aires` (variable `TZ` para cambiarla).

## Pruebas

`npm test` usa bases **aparte** (`vehiculos_test`, `vehiculos_auto_test`), levanta la
aplicación y recorre los flujos (login/permisos, usuarios, vehículos, choferes, asignaciones,
mantenimientos, herramientas, siniestros, alertas, reportes), comprueba que los datos de ejemplo sean coherentes y que
la base se cree sola. No toca la base real.

## Notas de diseño

- Permisos por módulo (`Vehicles`, `Choferes`, `Mantenimientos`, `Tools`, `Alertas`, `Reportes`, `Usuarios`, `Roles`,
  `Auditoria`, `Siniestros`). Se revalidan contra la base en cada pedido. Un usuario **hereda** los permisos de su rol (y
  sigue sus cambios) mientras no se le marquen permisos distintos; si se le personalizan, quedan como propios.
- Todo formulario/fetch de escritura lleva token CSRF (lo agrega `public/js/csrf.js`).
- Alertas: licencias (≤30 días), RTO/seguro, service por km u horas, préstamos vencidos, asignaciones vencidas, stock bajo de repuestos y siniestros abiertos. Se recalculan al
  iniciar, cada día a las 6:00, al abrir el Panel de Alertas y tras los cambios relevantes; las que dejan de corresponder se eliminan.
- Mantenimientos: **Programado** (próximo service por km, sin fecha; no mueve el vehículo), **En proceso** (en el taller) y **Realizado** (también para cargar services viejos). La alerta de service usa el service programado más cercano o el "próximo km" del último service realizado.
- Asignar un vehículo exige: estado Disponible, RTO y seguro vigentes, chofer activo y sin otro vehículo, y una licencia vigente cuya
  categoría habilite ese tipo de vehículo (moto = A, camión = C/E, maquinaria = G, resto = B/B1/B2/C/D/E).
- Mantenimientos: un service Programado superado por uno posterior se cancela solo; también se puede cancelar a mano.
  "En mantenimiento" y "En siniestro" los fija el sistema (órdenes En proceso / siniestros abiertos), no se editan a mano.
- Cada tipo de vehículo tiene su unidad de uso (km u horas, p. ej. maquinaria pesada); los repuestos tienen stock mínimo.
- Distritos, sectores y operarios se pueden renombrar (se actualizan vehículos, herramientas y préstamos).
- La auditoría registra también los intentos de ingreso fallidos, los bloqueos y los cierres de sesión.
- Las bases creadas con versiones anteriores se actualizan solas al arrancar (migraciones idempotentes).
- Estados de vehículo: `Disponible`, `En uso` (sólo vía Asignaciones), `En mantenimiento`, `En siniestro` (sólo vía Siniestros) y `Baja`.
- Las imágenes subidas se guardan en `public/img/*` (sólo JPG/PNG/WEBP/GIF, y PDF en siniestros; máx. 5 MB) y no se versionan.
