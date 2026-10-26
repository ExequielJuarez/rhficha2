// "Limpiar datos": deja el sistema vacío (sin vehículos ni choferes) conservando usuarios, roles y tipos de vehículo.
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { reiniciarBase } = require("./preparar");
const { Cliente } = require("./cliente");

let servidor, base, db;

before(async () => {
  await reiniciarBase({ demo: true });
  ({ app: global.__app } = require("../src/app"));
  db = require("../src/model/database/models");
  await db.sequelize.sync();
});

after(async () => {
  if (servidor) await new Promise((ok) => servidor.close(ok));
  await db.sequelize.close();
});

test("con datos de ejemplo hay de todo, y 'limpiar' lo deja vacío salvo usuarios, roles y tipos", async () => {
  const { limpiarDatos, TABLAS } = require("../src/model/database/limpieza");
  const { DIR_DOCUMENTOS } = require("../src/utils/documentos");
  assert.ok((await db.Vehiculo.count()) > 10);
  assert.ok((await db.Chofer.count()) > 10);
  assert.ok(fs.readdirSync(DIR_DOCUMENTOS).some((f) => f.startsWith("demo-")), "hay PDFs de ejemplo");
  const usuarios = await db.Usuario.count();
  const tipos = await db.TipoVehiculo.count();

  const r = await limpiarDatos();
  assert.ok(r.tablas.includes("vehiculo") && r.tablas.includes("chofer"));
  for (const t of TABLAS) {
    const [[{ n }]] = await db.sequelize.query(`SELECT COUNT(*) n FROM \`${t}\``);
    assert.equal(n, 0, `${t} debe quedar vacía`);
  }
  assert.equal(await db.Usuario.count(), usuarios, "los usuarios se conservan");
  assert.equal(await db.TipoVehiculo.count(), tipos, "los tipos de vehículo se conservan");
  assert.ok(await db.Rol.count() >= 3, "los roles se conservan");
  assert.ok(await db.Distrito.count() > 0, "los distritos se conservan por defecto");
  assert.ok(!fs.readdirSync(DIR_DOCUMENTOS).some((f) => f.startsWith("demo-")), "los PDFs de ejemplo se borran");

  // con `catalogos` también se vacían distritos, sectores y operarios
  await limpiarDatos({ catalogos: true });
  assert.equal(await db.Distrito.count(), 0);
  assert.equal(await db.Sector.count(), 0);
  assert.equal(await db.Operario.count(), 0);
});

test("después de limpiar, el sistema funciona y se puede cargar un vehículo y un chofer desde cero", async () => {
  const { asegurarTiposBase } = require("../src/model/database/usuariosBase");
  assert.equal(await asegurarTiposBase(), 0, "ya hay tipos: no se duplican");
  await db.TipoVehiculo.destroy({ where: {} }).catch(() => {});
  // si la tabla de tipos estuviera vacía, se cargan los 6 tipos base
  const sinTipos = await db.TipoVehiculo.count();
  if (sinTipos === 0) assert.equal(await asegurarTiposBase(), 6);
  assert.ok((await db.TipoVehiculo.count()) >= 6);

  await new Promise((ok) => {
    servidor = global.__app.listen(0, ok);
  });
  base = `http://127.0.0.1:${servidor.address().port}`;
  const c = new Cliente(base);
  assert.equal((await c.login("admin", "Ficha2026!")).status, 302);
  const tipo = await db.TipoVehiculo.findOne({ where: { descripcion: "Camioneta" } });

  const hoy = new Date().toISOString().slice(0, 10);
  let r = await c.post("/CargaVehiculo", { patente: "AB123CD", id_tipo: tipo.id_tipo, marca: "Toyota", modelo: "Hilux", anio: 2022, chasis: "CH-1", num_motor: "MO-1", estado_actual: "Disponible", km_actual: 1000, fecha_alta: "2026-01-01" });
  assert.equal(r.status, 302, r.texto.slice(0, 200));
  assert.equal(await db.Vehiculo.count(), 1);
  assert.equal((await c.get("/Vehicles")).status, 200);
  assert.equal((await c.get("/Choferes")).status, 200);
  assert.equal((await c.get("/Alertas")).status, 200);
  assert.equal((await c.get("/Reportes")).status, 200);
  assert.equal((await c.get("/Mantenimientos/Historial")).status, 200);
  assert.ok(hoy);
});
