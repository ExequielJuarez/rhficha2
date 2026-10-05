// Verifica que los datos de ejemplo (pruebasdb/copiaseguridad.sql) sean coherentes entre sí:
// estados vs. asignaciones/órdenes/siniestros, importes, stock, kilometrajes, fechas, etc.
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mysql = require("mysql2/promise");
const { reiniciarBase } = require("./preparar");

let db;

before(async () => {
  await reiniciarBase({ demo: true });
  db = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || undefined,
    database: process.env.DB_NAME,
  });
});
after(async () => db.end());

const filas = async (sql) => (await db.query(sql))[0];
const sinFilas = async (descripcion, sql) => {
  const r = await filas(sql);
  assert.equal(r.length, 0, `${descripcion}: ${JSON.stringify(r).slice(0, 400)}`);
};

test("vehículo 'En uso' ⇔ tiene exactamente una asignación activa", async () => {
  await sinFilas("En uso sin asignación activa", `SELECT v.id_vehiculo FROM vehiculo v WHERE v.estado_actual='En uso' AND (SELECT COUNT(*) FROM asignacion_vehiculo a WHERE a.id_vehiculo=v.id_vehiculo AND a.estado='Activo')<>1`);
  await sinFilas("asignación activa con vehículo que no está En uso", `SELECT a.id_asignacion FROM asignacion_vehiculo a JOIN vehiculo v USING(id_vehiculo) WHERE a.estado='Activo' AND v.estado_actual<>'En uso'`);
});

test("las asignaciones activas son de choferes activos, con licencia vigente y sin repetirse", async () => {
  await sinFilas("chofer no activo con asignación", `SELECT a.id_asignacion FROM asignacion_vehiculo a JOIN chofer c USING(id_chofer) WHERE a.estado='Activo' AND c.estado<>'Activo'`);
  await sinFilas("chofer con licencia vencida asignado", `SELECT a.id_asignacion FROM asignacion_vehiculo a WHERE a.estado='Activo' AND NOT EXISTS (SELECT 1 FROM licencia_chofer l WHERE l.id_chofer=a.id_chofer AND l.fecha_vencimiento>=DATE(UTC_TIMESTAMP()-INTERVAL 3 HOUR))`);
  await sinFilas("chofer con más de una asignación activa", `SELECT id_chofer FROM asignacion_vehiculo WHERE estado='Activo' GROUP BY id_chofer HAVING COUNT(*)>1`);
  await sinFilas("finalizada sin fecha de devolución (o activa con ella)", `SELECT id_asignacion FROM asignacion_vehiculo WHERE (estado='Finalizado' AND fecha_devolucion IS NULL) OR (estado='Activo' AND fecha_devolucion IS NOT NULL)`);
  await sinFilas("devolución anterior a la salida", `SELECT id_asignacion FROM asignacion_vehiculo WHERE fecha_devolucion < fecha_salida`);
});

test("vehículo 'En mantenimiento' ⇔ tiene una orden en proceso; 'En siniestro' ⇔ siniestro abierto", async () => {
  await sinFilas("En mantenimiento sin orden en proceso", `SELECT v.id_vehiculo FROM vehiculo v WHERE v.estado_actual='En mantenimiento' AND NOT EXISTS (SELECT 1 FROM mantenimiento m WHERE m.id_vehiculo=v.id_vehiculo AND m.estado='En proceso')`);
  await sinFilas("orden en proceso con vehículo que no está en taller", `SELECT m.id_mantenimiento FROM mantenimiento m JOIN vehiculo v USING(id_vehiculo) WHERE m.estado='En proceso' AND v.estado_actual<>'En mantenimiento'`);
  await sinFilas("En siniestro sin siniestro abierto", `SELECT v.id_vehiculo FROM vehiculo v WHERE v.estado_actual='En siniestro' AND NOT EXISTS (SELECT 1 FROM siniestro s WHERE s.id_vehiculo=v.id_vehiculo AND s.estado='EN PROCESO')`);
  await sinFilas("siniestro abierto con vehículo operativo", `SELECT s.id_siniestro FROM siniestro s JOIN vehiculo v USING(id_vehiculo) WHERE s.estado='EN PROCESO' AND v.estado_actual NOT IN ('En siniestro','Baja')`);
});

test("baja: fecha de baja sólo en vehículos de baja y nunca anterior al alta", async () => {
  await sinFilas("Baja sin fecha / fecha de baja sin Baja", `SELECT id_vehiculo FROM vehiculo WHERE (estado_actual='Baja') <> (fecha_baja IS NOT NULL)`);
  await sinFilas("baja anterior al alta o alta futura", `SELECT id_vehiculo FROM vehiculo WHERE fecha_baja < fecha_alta OR fecha_alta > DATE(UTC_TIMESTAMP())`);
  await sinFilas("vehículo de baja con asignación activa u orden abierta", `SELECT v.id_vehiculo FROM vehiculo v WHERE v.estado_actual='Baja' AND (EXISTS (SELECT 1 FROM asignacion_vehiculo a WHERE a.id_vehiculo=v.id_vehiculo AND a.estado='Activo') OR EXISTS (SELECT 1 FROM mantenimiento m WHERE m.id_vehiculo=v.id_vehiculo AND m.estado IN ('Programado','En proceso')))`);
});

test("mantenimientos: importes, fechas y estados coherentes", async () => {
  await sinFilas("total <> mano de obra + repuestos", `SELECT id_mantenimiento FROM mantenimiento WHERE ROUND(costo_total,2) <> ROUND(mano_obra+costo_repuestos,2)`);
  await sinFilas("repuestos <> suma del detalle", `SELECT m.id_mantenimiento FROM mantenimiento m WHERE ROUND(m.costo_repuestos,2) <> ROUND(COALESCE((SELECT SUM(d.cantidad*d.costo_unitario) FROM detalle_mantenimiento d WHERE d.id_mantenimiento=m.id_mantenimiento),0),2)`);
  await sinFilas("fecha de fin incoherente con el estado", `SELECT id_mantenimiento FROM mantenimiento WHERE (estado='Realizado') <> (fecha_fin IS NOT NULL)`);
  await sinFilas("fin anterior al inicio", `SELECT id_mantenimiento FROM mantenimiento WHERE fecha_fin < fecha_inicio`);
  await sinFilas("km del servicio mayor al km actual del vehículo (salvo programados)", `SELECT m.id_mantenimiento FROM mantenimiento m JOIN vehiculo v USING(id_vehiculo) WHERE m.estado NOT IN ('Programado','Cancelado') AND m.km_servicio > v.km_actual`);
  await sinFilas("próximo km no mayor al km del servicio", `SELECT id_mantenimiento FROM mantenimiento WHERE estado='Realizado' AND proximo_km IS NOT NULL AND proximo_km <= km_servicio`);
  await sinFilas("programado sin km objetivo", `SELECT id_mantenimiento FROM mantenimiento WHERE estado='Programado' AND (proximo_km IS NULL OR proximo_km<>km_servicio)`);
  await sinFilas("estado inválido", `SELECT id_mantenimiento FROM mantenimiento WHERE estado NOT IN ('Programado','En proceso','Realizado','Cancelado')`);
  await sinFilas("programado superado por un service posterior (debería estar cancelado)", `SELECT m.id_mantenimiento FROM mantenimiento m WHERE m.estado='Programado' AND m.proximo_km <= COALESCE((SELECT MAX(r.km_servicio) FROM mantenimiento r WHERE r.id_vehiculo=m.id_vehiculo AND r.estado='Realizado'),0)`);
  await sinFilas("repuestos con stock negativo", `SELECT id_repuesto FROM repuestos WHERE stock < 0`);
});

test("kilometraje: historial creciente y consistente con el km actual", async () => {
  await sinFilas("km nuevo menor al anterior", `SELECT id_historial FROM historial_km WHERE km_nuevo < km_anterior`);
  await sinFilas("historial por encima del km actual", `SELECT h.id_historial FROM historial_km h JOIN vehiculo v USING(id_vehiculo) WHERE h.km_nuevo > v.km_actual`);
  await sinFilas("cadena de lecturas rota", `SELECT h.id_historial FROM historial_km h JOIN historial_km p ON p.id_vehiculo=h.id_vehiculo AND p.id_historial=h.id_historial-1 WHERE p.km_nuevo <> h.km_anterior`);
});

test("herramientas y préstamos: estado según unidades afuera", async () => {
  await sinFilas("'En uso' sin todas las unidades prestadas / disponible con todo afuera", `SELECT h.id_herramienta FROM herramienta h WHERE h.estado IN ('En uso','Disponible') AND ((SELECT COUNT(*) FROM prestamo p WHERE p.id_herramienta=h.id_herramienta AND p.estado_prestamo='Activo') >= h.stock) <> (h.estado='En uso')`);
  await sinFilas("préstamos activos que superan el stock", `SELECT h.id_herramienta FROM herramienta h WHERE (SELECT COUNT(*) FROM prestamo p WHERE p.id_herramienta=h.id_herramienta AND p.estado_prestamo='Activo') > h.stock`);
  await sinFilas("en reparación o de baja con préstamo activo", `SELECT h.id_herramienta FROM herramienta h WHERE h.estado IN ('En Reparación','Baja') AND EXISTS (SELECT 1 FROM prestamo p WHERE p.id_herramienta=h.id_herramienta AND p.estado_prestamo='Activo')`);
  await sinFilas("préstamo finalizado sin devolución (o activo con ella)", `SELECT id_prestamo FROM prestamo WHERE (estado_prestamo='Finalizado') <> (fecha_devolucion_real IS NOT NULL)`);
  await sinFilas("devolución estimada o real anterior a la salida", `SELECT id_prestamo FROM prestamo WHERE fecha_devolucion_estimada < fecha_salida OR fecha_devolucion_real < fecha_salida`);
  await sinFilas("operario o sector inexistente", `SELECT p.id_prestamo FROM prestamo p WHERE NOT EXISTS (SELECT 1 FROM operarios o WHERE o.nombre=p.nombre_operario) OR NOT EXISTS (SELECT 1 FROM sectores s WHERE s.nombre=p.sector_destino)`);
  await sinFilas("sector de la herramienta inexistente", `SELECT id_herramienta FROM herramienta h WHERE sector IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sectores s WHERE s.nombre=h.sector)`);
});

test("choferes y licencias", async () => {
  await sinFilas("motivo de baja fuera de lugar", `SELECT id_chofer FROM chofer WHERE (estado='Inactivo') <> (motivoBaja IS NOT NULL)`);
  await sinFilas("chofer sin licencia", `SELECT id_chofer FROM chofer c WHERE NOT EXISTS (SELECT 1 FROM licencia_chofer l WHERE l.id_chofer=c.id_chofer)`);
  await sinFilas("vencimiento anterior a la emisión", `SELECT id_licencia FROM licencia_chofer WHERE fecha_vencimiento <= fecha_emision`);
  await sinFilas("estado o categoría fuera de catálogo", `SELECT id_chofer FROM chofer WHERE estado NOT IN ('Activo','Inactivo','Licencia Vacaciones/Medica') UNION SELECT id_licencia FROM licencia_chofer WHERE categoria NOT IN ('A','B','B1','B2','C','D','E','G')`);
  await sinFilas("menor de edad o ingreso antes de los 18", `SELECT id_chofer FROM chofer WHERE fechaNacimiento > DATE(UTC_TIMESTAMP()) - INTERVAL 18 YEAR OR fechaIngreso < fechaNacimiento + INTERVAL 18 YEAR`);
});

test("referencias y catálogos", async () => {
  await sinFilas("distrito de vehículo inexistente", `SELECT id_vehiculo FROM vehiculo v WHERE distrito IS NOT NULL AND NOT EXISTS (SELECT 1 FROM distritos d WHERE d.nombre=v.distrito)`);
  await sinFilas("siniestro: nombre de chofer distinto al del chofer", `SELECT s.id_siniestro FROM siniestro s LEFT JOIN chofer c USING(id_chofer) WHERE (s.id_chofer IS NULL AND s.chofer_involucrado IS NOT NULL) OR (s.id_chofer IS NOT NULL AND s.chofer_involucrado <> CONCAT(c.nombre,' ',c.apellido))`);
  await sinFilas("siniestro con fecha futura o estado inválido", `SELECT id_siniestro FROM siniestro WHERE fecha_siniestro > DATE(UTC_TIMESTAMP()) OR estado NOT IN ('EN PROCESO','RESUELTO','CERRADO')`);
  await sinFilas("más de un siniestro abierto por vehículo", `SELECT id_vehiculo FROM siniestro WHERE estado='EN PROCESO' GROUP BY id_vehiculo HAVING COUNT(*)>1`);
  await sinFilas("estado de vehículo inválido", `SELECT id_vehiculo FROM vehiculo WHERE estado_actual NOT IN ('Disponible','En uso','En mantenimiento','En siniestro','Baja')`);
  await sinFilas("usuario con permisos desconocidos", `SELECT id_usuario FROM usuario WHERE permisos REGEXP '(^|,)(Vehiculos|Admin|Todo)(,|$)'`);
});

test("catálogos y configuración nuevos", async () => {
  await sinFilas("unidad de tipo de vehículo inválida", `SELECT id_tipo FROM tipo_vehiculo WHERE unidad NOT IN ('km','hs')`);
  await sinFilas("stock mínimo negativo", `SELECT id_repuesto FROM repuestos WHERE stock_minimo < 0`);
  await sinFilas("auditoría sin usuario que no sea de login", `SELECT id_auditoria FROM auditoria WHERE id_usuario IS NULL AND accion NOT LIKE 'LOGIN%'`);
  await sinFilas("maquinaria pesada sin unidad en horas", `SELECT id_tipo FROM tipo_vehiculo WHERE descripcion LIKE '%aquinaria%' AND unidad<>'hs'`);
});

test("el set de datos cubre todos los escenarios para probar", async () => {
  const cuenta = async (sql) => (await filas(sql))[0].n;
  const casos = {
    "vehículos de baja (≥3)": [`SELECT COUNT(*) n FROM vehiculo WHERE estado_actual='Baja'`, 3],
    "vehículos en uso (≥3)": [`SELECT COUNT(*) n FROM vehiculo WHERE estado_actual='En uso'`, 3],
    "vehículo en taller": [`SELECT COUNT(*) n FROM vehiculo WHERE estado_actual='En mantenimiento'`, 1],
    "vehículo en siniestro": [`SELECT COUNT(*) n FROM vehiculo WHERE estado_actual='En siniestro'`, 1],
    "RTO/seguro vencidos": [`SELECT COUNT(*) n FROM vehiculo WHERE estado_actual<>'Baja' AND (rto_vencimiento < DATE(UTC_TIMESTAMP()) OR seguro_vencimiento < DATE(UTC_TIMESTAMP()))`, 2],
    "RTO/seguro por vencer (≤30 días)": [`SELECT COUNT(*) n FROM vehiculo WHERE estado_actual<>'Baja' AND (rto_vencimiento BETWEEN DATE(UTC_TIMESTAMP()) AND DATE(UTC_TIMESTAMP())+INTERVAL 30 DAY OR seguro_vencimiento BETWEEN DATE(UTC_TIMESTAMP()) AND DATE(UTC_TIMESTAMP())+INTERVAL 30 DAY)`, 4],
    "choferes con licencia vencida": [`SELECT COUNT(*) n FROM licencia_chofer l JOIN chofer c USING(id_chofer) WHERE c.estado<>'Inactivo' AND l.fecha_vencimiento < DATE(UTC_TIMESTAMP())`, 2],
    "choferes con licencia por vencer": [`SELECT COUNT(*) n FROM licencia_chofer WHERE fecha_vencimiento BETWEEN DATE(UTC_TIMESTAMP()) AND DATE(UTC_TIMESTAMP())+INTERVAL 30 DAY`, 3],
    "choferes con licencia en buen estado": [`SELECT COUNT(*) n FROM licencia_chofer WHERE fecha_vencimiento > DATE(UTC_TIMESTAMP())+INTERVAL 60 DAY`, 6],
    "choferes inactivos / de licencia": [`SELECT COUNT(*) n FROM chofer WHERE estado<>'Activo'`, 3],
    "vehículos con más de 3 mantenimientos": [`SELECT COUNT(*) n FROM (SELECT id_vehiculo FROM mantenimiento GROUP BY id_vehiculo HAVING COUNT(*)>3) t`, 1],
    "mantenimientos programados": [`SELECT COUNT(*) n FROM mantenimiento WHERE estado='Programado'`, 2],
    "préstamos vencidos": [`SELECT COUNT(*) n FROM prestamo WHERE estado_prestamo='Activo' AND fecha_devolucion_estimada < UTC_TIMESTAMP()`, 2],
    "herramientas en reparación y de baja": [`SELECT COUNT(*) n FROM herramienta WHERE estado IN ('En Reparación','Baja')`, 3],
    "siniestros en los 3 estados": [`SELECT COUNT(DISTINCT estado) n FROM siniestro`, 3],
    "repuesto sin stock": [`SELECT COUNT(*) n FROM repuestos WHERE stock=0`, 1],
    "service cancelado": [`SELECT COUNT(*) n FROM mantenimiento WHERE estado='Cancelado'`, 1],
    "repuestos con stock bajo o sin stock": [`SELECT COUNT(*) n FROM repuestos WHERE stock <= stock_minimo`, 3],
    "asignación vencida": [`SELECT COUNT(*) n FROM asignacion_vehiculo WHERE estado='Activo' AND fecha_estimada_devolucion < UTC_TIMESTAMP()`, 1],
    "usuario que hereda los permisos del rol": [`SELECT COUNT(*) n FROM usuario WHERE permisos IS NULL AND id_rol<>1`, 1],
    "intentos de login fallidos auditados": [`SELECT COUNT(*) n FROM auditoria WHERE accion='LOGIN_FALLIDO'`, 2],
    "usuario bloqueado": [`SELECT COUNT(*) n FROM usuario WHERE activo=0`, 1],
  };
  for (const [nombre, [sql, minimo]] of Object.entries(casos)) {
    assert.ok((await cuenta(sql)) >= minimo, `faltan datos de ejemplo: ${nombre}`);
  }
});
