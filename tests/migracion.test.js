// Una base creada con la versión anterior del esquema debe actualizarse sola al arrancar la aplicación.
const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

require("dotenv").config({ quiet: true });
process.env.DB_NAME = "vehiculos_migra_test";
process.env.NODE_ENV = "test";

const mysql = require("mysql2/promise");
const { prepararBaseDeDatos } = require("../src/model/database/preparar");

const conectar = (database, multi = false) =>
  mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || undefined,
    database,
    multipleStatements: multi,
  });

after(async () => {
  const c = await conectar(undefined);
  await c.query("DROP DATABASE IF EXISTS vehiculos_migra_test");
  await c.end();
});

test("migra una base de la versión anterior sin perder datos", async () => {
  const sql = fs.readFileSync(path.join(__dirname, "fixtures/base_anterior.sql"), "utf8").replace(/`vehiculos_db`/g, "`vehiculos_migra_test`");
  const raiz = await conectar(undefined, true);
  await raiz.query(sql);
  await raiz.query("USE vehiculos_migra_test; UPDATE mantenimiento SET estado='Pendiente' WHERE id_mantenimiento=1");
  await raiz.end();

  const c = await conectar("vehiculos_migra_test");
  const [[antes]] = await c.query("SELECT (SELECT COUNT(*) FROM vehiculo) v, (SELECT COUNT(*) FROM chofer) c, (SELECT COUNT(*) FROM mantenimiento) m");
  const [[colAntes]] = await c.query("SHOW COLUMNS FROM repuestos LIKE 'stock_minimo'").then(([r]) => [r]);
  assert.equal(colAntes, undefined, "la base anterior no tenía stock_minimo");

  const r = await prepararBaseDeDatos();
  assert.equal(r.baseNueva, false);
  await prepararBaseDeDatos(); // idempotente

  const [[despues]] = await c.query("SELECT (SELECT COUNT(*) FROM vehiculo) v, (SELECT COUNT(*) FROM chofer) c, (SELECT COUNT(*) FROM mantenimiento) m");
  assert.deepEqual(despues, antes, "no se pierden datos");

  const [[tipo]] = await c.query("SHOW COLUMNS FROM alerta LIKE 'tipo'").then(([r]) => [r]);
  assert.match(tipo.Type, /asignacion_vencida/);
  assert.match(tipo.Type, /stock_bajo/);
  const [minimo] = await c.query("SELECT stock_minimo FROM repuestos LIMIT 1");
  assert.equal(minimo[0].stock_minimo, 3);
  const [tipos] = await c.query("SELECT descripcion, unidad FROM tipo_vehiculo");
  assert.ok(tipos.find((t) => /aquinaria/.test(t.descripcion)).unidad === "hs");
  assert.ok(tipos.filter((t) => !/aquinaria/.test(t.descripcion)).every((t) => t.unidad === "km"));
  const [[aud]] = await c.query("SHOW COLUMNS FROM auditoria LIKE 'id_usuario'").then(([r]) => [r]);
  assert.equal(aud.Null, "YES");
  const [[perm]] = await c.query("SHOW COLUMNS FROM usuario LIKE 'permisos'").then(([r]) => [r]);
  assert.equal(perm.Default, null);
  const [[orden]] = await c.query("SELECT estado FROM mantenimiento WHERE id_mantenimiento=1");
  assert.equal(orden.estado, "Programado", "Pendiente pasó a Programado");

  // ya se pueden guardar alertas de los tipos nuevos y auditoría sin usuario
  await c.query("INSERT INTO alerta (tipo, prioridad, mensaje, generada_automaticamente, createdAt, updatedAt) VALUES ('stock_bajo','media','x',1,NOW(),NOW()), ('asignacion_vencida','alta','y',1,NOW(),NOW())");
  await c.query("INSERT INTO auditoria (id_usuario, tabla_afectada, accion, fecha, hora) VALUES (NULL,'usuario','LOGIN_FALLIDO',CURDATE(),CURTIME())");
  await c.end();
});
