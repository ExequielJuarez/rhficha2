// La aplicación debe poder crear sola la base de datos, las tablas y el administrador inicial.
const { test, after } = require("node:test");
const assert = require("node:assert/strict");

require("dotenv").config({ quiet: true });
process.env.DB_NAME = "vehiculos_auto_test";
process.env.NODE_ENV = "test";
process.env.ADMIN_PASSWORD = "ClaveInicial123";

const mysql = require("mysql2/promise");
const { prepararBaseDeDatos } = require("../src/model/database/preparar");

const conectar = (database) =>
  mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || undefined,
    database,
  });

after(async () => {
  const c = await conectar(undefined);
  await c.query("DROP DATABASE IF EXISTS vehiculos_auto_test");
  await c.end();
});

test("crea la base, las 19 tablas y el administrador sobre una base inexistente (y es idempotente)", async () => {
  const raiz = await conectar(undefined);
  await raiz.query("DROP DATABASE IF EXISTS vehiculos_auto_test");
  await raiz.end();

  const r1 = await prepararBaseDeDatos();
  assert.equal(r1.baseNueva, true);

  const c = await conectar("vehiculos_auto_test");
  const [tablas] = await c.query("SHOW TABLES");
  assert.equal(tablas.length, 19);
  const [usuarios] = await c.query("SELECT u.nombre_usuario, u.contrasena, r.nombre rol FROM usuario u JOIN rol r USING(id_rol)");
  assert.equal(usuarios.length, 1);
  assert.equal(usuarios[0].nombre_usuario, "admin");
  assert.equal(usuarios[0].rol, "Administrador");
  assert.ok(require("bcryptjs").compareSync("ClaveInicial123", usuarios[0].contrasena));
  const [roles] = await c.query("SELECT COUNT(*) n FROM rol");
  assert.equal(roles[0].n, 3);

  const r2 = await prepararBaseDeDatos();
  assert.equal(r2.baseNueva, false, "la segunda vez no recrea nada");
  const [[{ n }]] = await c.query("SELECT COUNT(*) n FROM usuario");
  assert.equal(n, 1);
  await c.end();
});
