// Los dos usuarios base: "admin" ve todo y "usuario" solo lo operativo (sin reportes/gastos ni auditoría).
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { reiniciarBase } = require("./preparar");
const { Cliente } = require("./cliente");

let servidor, base, db;

before(async () => {
  await reiniciarBase();
  const { asegurarUsuarios } = require("../src/model/database/usuariosBase");
  const r1 = await asegurarUsuarios({ adminPassword: "ClaveAdmin1!", usuarioPassword: "ClaveUsuario1!" });
  assert.equal(r1.usuario, "creado");
  ({ app: global.__app } = require("../src/app"));
  db = require("../src/model/database/models");
  await db.sequelize.sync();
  await new Promise((ok) => {
    servidor = global.__app.listen(0, ok);
  });
  base = `http://127.0.0.1:${servidor.address().port}`;
});

after(async () => {
  await new Promise((ok) => servidor.close(ok));
  await db.sequelize.close();
});

const entrar = async (usuario, clave) => {
  const c = new Cliente(base);
  const r = await c.login(usuario, clave);
  assert.equal(r.status, 302, `${usuario} debe poder ingresar`);
  return c;
};

test("el script es idempotente: no pisa contraseñas ni duplica usuarios, y `resetear` las restablece", async () => {
  const { asegurarUsuarios } = require("../src/model/database/usuariosBase");
  const r = await asegurarUsuarios({ adminPassword: "OtraClave9!", usuarioPassword: "OtraClave9!" });
  assert.deepEqual(r, { admin: "sin cambios", usuario: "sin cambios" });
  assert.equal(await db.Usuario.count({ where: { nombre_usuario: "usuario" } }), 1);
  assert.equal(await db.Rol.count({ where: { nombre: "Usuario" } }), 1);
  await entrar("usuario", "ClaveUsuario1!"); // la contraseña original sigue vigente
  const r2 = await asegurarUsuarios({ adminPassword: "ClaveAdmin1!", usuarioPassword: "ClaveUsuario1!", resetear: true });
  assert.deepEqual(r2, { admin: "restablecido", usuario: "restablecido" });
});

test("admin ve TODO", async () => {
  const c = await entrar("admin", "ClaveAdmin1!");
  for (const ruta of ["/Vehicles", "/Choferes", "/Mantenimientos", "/Tools", "/Alertas", "/Siniestros", "/Reportes", "/Auditoria", "/Usuarios", "/Usuarios/Roles", "/asignaciones", "/Mantenimientos/Historial"]) {
    assert.equal((await c.get(ruta)).status, 200, `admin debe ver ${ruta}`);
  }
  const menu = (await c.get("/Vehicles")).texto;
  assert.match(menu, /Reportes y Análisis/);
  assert.match(menu, /Log de Auditoría/);
});

test("usuario ve lo operativo y NO ve reportes (gastos), auditoría, usuarios ni roles", async () => {
  const c = await entrar("usuario", "ClaveUsuario1!");
  for (const ruta of ["/Vehicles", "/Vehicles/Ajustes", "/CargaVehiculo", "/Choferes", "/asignaciones", "/Mantenimientos", "/Mantenimientos/carga", "/Mantenimientos/Historial", "/Repuestos/Gestionar", "/Tools", "/Alertas", "/Siniestros"]) {
    assert.equal((await c.get(ruta)).status, 200, `usuario debe ver ${ruta}`);
  }
  for (const ruta of ["/Reportes", "/Auditoria", "/Usuarios", "/Usuarios/Roles", "/Usuarios/Carga", "/Usuarios/Roles/Editar/1"]) {
    assert.equal((await c.get(ruta)).status, 403, `usuario NO debe ver ${ruta}`);
  }
  // el menú lateral tampoco muestra esas secciones
  const menu = (await c.get("/Vehicles")).texto;
  assert.ok(!/Reportes y Análisis/.test(menu), "sin enlace a Reportes");
  assert.ok(!/Log de Auditoría/.test(menu), "sin enlace a Auditoría");
  assert.ok(!/Control de Acceso/.test(menu), "sin enlace a Control de Acceso");
  assert.match(menu, /Mantenimientos/);
  assert.match(menu, /Plantilla Choferes/);
});
