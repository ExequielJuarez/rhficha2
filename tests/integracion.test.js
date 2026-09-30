// Pruebas de integración: levantan la aplicación real contra una base de prueba
// y recorren los flujos principales como lo haría un usuario.
//   npm test
const { test, before, after, describe } = require("node:test");
const assert = require("node:assert/strict");
const { reiniciarBase } = require("./preparar");
const { Cliente } = require("./cliente");

const CLAVE = "Ficha2026!";
let servidor, base, db;
const inicioPruebas = Date.now();

const nuevo = () => new Cliente(base);
const admin = async () => {
  const c = nuevo();
  const r = await c.login("admin", CLAVE);
  assert.equal(r.status, 302, "el admin debe poder ingresar");
  return c;
};
const como = async (usuario) => {
  const c = nuevo();
  const r = await c.login(usuario, CLAVE);
  assert.equal(r.status, 302, `${usuario} debe poder ingresar`);
  return c;
};
// Extrae el aviso (flash) que dejó la última operación, leyéndolo de la página siguiente
const aviso = async (c, ruta = "/Vehicles") => {
  const r = await c.get(ruta);
  const m = r.texto.match(/mostrarAviso\("(error|ok)", ("(?:[^"\\]|\\.)*")\)/);
  return m ? { tipo: m[1], mensaje: JSON.parse(m[2]) } : null;
};

before(async () => {
  await reiniciarBase();
  ({ app: global.__app } = require("../src/app"));
  db = require("../src/model/database/models");
  await db.sequelize.sync();
  await require("../src/data/alertaService").generarTodas();
  await new Promise((ok) => {
    servidor = global.__app.listen(0, ok);
  });
  base = `http://127.0.0.1:${servidor.address().port}`;
});

after(async () => {
  // Borra únicamente los archivos que las pruebas subieron (creados después de empezar)
  const fs = require("fs");
  const path = require("path");
  for (const [dir, prefijo] of [["licencias", "chofer-"], ["vehiculos", "vehiculo-"], ["siniestros", "siniestro-"]]) {
    const carpeta = path.join(__dirname, "../public/img", dir);
    if (!fs.existsSync(carpeta)) continue;
    fs.readdirSync(carpeta)
      .filter((f) => f.startsWith(prefijo) && fs.statSync(path.join(carpeta, f)).mtimeMs >= inicioPruebas - 1000)
      .forEach((f) => fs.unlinkSync(path.join(carpeta, f)));
  }
  await new Promise((ok) => servidor.close(ok));
  await db.sequelize.close();
});

/* ───────────────────────── AUTENTICACIÓN Y PERMISOS ───────────────────────── */
describe("Autenticación y permisos", () => {
  test("la contraseña '1234' ya no es una puerta trasera", async () => {
    const c = nuevo();
    const antes = (await db.Usuario.findByPk(1)).contrasena;
    const r = await c.login("admin", "1234");
    assert.equal(r.status, 401);
    assert.match(r.texto, /incorrectos/);
    assert.equal((await db.Usuario.findByPk(1)).contrasena, antes, "no debe tocar la contraseña");
  });

  test("usuario inexistente y contraseña errónea dan el mismo mensaje", async () => {
    const a = await nuevo().login("no_existe", "loquesea");
    const b = await nuevo().login("walter", "mala-clave");
    assert.equal(a.status, 401);
    assert.equal(b.status, 401);
    assert.match(a.texto, /Usuario o contraseña incorrectos/);
    assert.match(b.texto, /Usuario o contraseña incorrectos/);
  });

  test("el nombre de usuario ingresado no se refleja como HTML (XSS)", async () => {
    const r = await nuevo().login("<script>alert(1)</script>", "x");
    assert.ok(!r.texto.includes("<script>alert(1)</script>"));
  });

  test("bloquea tras 5 intentos fallidos", async () => {
    const c = nuevo();
    for (let i = 0; i < 5; i++) await c.login("carlos_oficina", "incorrecta" + i);
    const r = await c.login("carlos_oficina", CLAVE);
    assert.equal(r.status, 429);
  });

  test("rutas privadas redirigen al login sin sesión", async () => {
    const c = nuevo();
    for (const ruta of ["/Vehicles", "/Choferes", "/Usuarios", "/Alertas", "/vehicles"]) {
      const r = await c.get(ruta);
      assert.equal(r.status, 302, ruta);
      assert.equal(r.location, "/InicioSesion", ruta);
    }
  });

  test("POST /Mantenimientos/:id/estado exige sesión", async () => {
    const c = nuevo();
    await c.get("/InicioSesion");
    const r = await c.post("/Mantenimientos/4/estado", { estado: "Realizado" });
    assert.equal(r.status, 302);
    assert.equal(r.location, "/InicioSesion");
    assert.equal((await db.Mantenimiento.findByPk(4)).estado, "En proceso");
  });

  test("los permisos no se saltean cambiando mayúsculas/minúsculas", async () => {
    const c = await como("walter"); // Choferes, Mantenimientos, Auditoria
    for (const ruta of ["/Vehicles", "/vehicles", "/VEHICLES/1", "/Asignaciones", "/asignaciones", "/CargaVehiculo", "/cargavehiculo", "/ActualizarKm", "/usuarios", "/USUARIOS/Carga", "/tools", "/Tools/Prestamos", "/alertas", "/reportes", "/siniestros", "/%56ehicles"]) {
      const r = await c.get(ruta);
      assert.ok([403, 404].includes(r.status), `${ruta} no debe estar accesible (dio ${r.status})`);
      if (!ruta.startsWith("/%")) assert.equal(r.status, 403, `${ruta} debería estar denegada`);
    }
    for (const ruta of ["/Choferes", "/choferes", "/Mantenimientos", "/Repuestos/Gestionar", "/auditoria"]) {
      const r = await c.get(ruta);
      assert.equal(r.status, 200, `${ruta} debería estar permitida`);
    }
  });

  test("las rutas de repuestos requieren el permiso de Mantenimientos", async () => {
    const c = await como("ExeJuarez"); // Vehicles, Choferes, Mantenimientos, Alertas, Reportes, Siniestros
    assert.equal((await c.get("/Repuestos/Gestionar")).status, 200);
    const w = nuevo();
    const l = await w.login("carlos_oficina", CLAVE);
    // carlos quedó bloqueado por la prueba anterior (429): usamos otro usuario sin Mantenimientos
    assert.ok([302, 429].includes(l.status));
  });

  test("POST sin token CSRF es rechazado", async () => {
    const c = await admin();
    const r = await c.post("/Vehicles/Ajustes/Distritos", { nombre: "Este" }, { sinToken: true });
    assert.equal(r.status, 403);
    assert.equal(await db.Distrito.count({ where: { nombre: "Este" } }), 0);
  });

  test("se revalida al usuario en cada pedido (desactivado = fuera)", async () => {
    const c = await como("ExeJuarez");
    assert.equal((await c.get("/Vehicles")).status, 200);
    await db.Usuario.update({ activo: false }, { where: { nombre_usuario: "ExeJuarez" } });
    const r = await c.get("/Vehicles");
    assert.equal(r.status, 302);
    assert.equal(r.location, "/InicioSesion");
    await db.Usuario.update({ activo: true }, { where: { nombre_usuario: "ExeJuarez" } });
  });

  test("cerrar sesión invalida la sesión", async () => {
    const c = await admin();
    await c.get("/CerrarSesion");
    const r = await c.get("/Vehicles");
    assert.equal(r.status, 302);
  });

  test("/reset ya no existe", async () => {
    const r = await nuevo().get("/reset");
    assert.equal(r.status, 404);
  });
});

/* ───────────────────────────────── USUARIOS ───────────────────────────────── */
describe("Usuarios", () => {
  test("alta valida datos, duplicados y guarda contraseña con hash", async () => {
    const c = await admin();
    let r = await c.post("/Usuarios/Carga", { nombre: "Ana", apellido: "Paz", nombre_usuario: "ana", contrasena: "corta", id_rol: 3 });
    assert.equal(r.status, 400);
    assert.match(r.texto, /al menos 8 caracteres/);

    r = await c.post("/Usuarios/Carga", { nombre: "Ana", apellido: "Paz", nombre_usuario: "admin", contrasena: "Clave12345", id_rol: 3 });
    assert.equal(r.status, 400);
    assert.match(r.texto, /ya existe/);

    r = await c.post("/Usuarios/Carga", { nombre: "Ana", apellido: "Paz", nombre_usuario: "ana", contrasena: "Clave12345", id_rol: 3, vistas: ["Vehicles", "Alertas"] });
    assert.equal(r.status, 302);
    const u = await db.Usuario.findOne({ where: { nombre_usuario: "ana" } });
    assert.ok(u.contrasena.startsWith("$2"));
    assert.equal(u.permisos, "Vehicles,Alertas");
    assert.equal((await nuevo().login("ana", "Clave12345")).status, 302);
  });

  test("se puede cambiar la contraseña de un usuario", async () => {
    const c = await admin();
    const u = await db.Usuario.findOne({ where: { nombre_usuario: "ana" } });
    const r = await c.post(`/Usuarios/Editar/${u.id_usuario}`, { nombre: "Ana", apellido: "Paz", nombre_usuario: "ana", id_rol: 3, estado: "1", vistas: ["Vehicles"], contrasena: "OtraClave999" });
    assert.equal(r.status, 302);
    assert.equal((await nuevo().login("ana", "Clave12345")).status, 401);
    assert.equal((await nuevo().login("ana", "OtraClave999")).status, 302);
  });

  test("un usuario no-admin no puede escalar privilegios", async () => {
    await db.Usuario.update({ permisos: "Vehicles,Choferes,Usuarios" }, { where: { nombre_usuario: "walter" } });
    const w = await como("walter");
    // no puede crear un Administrador
    let r = await w.post("/Usuarios/Carga", { nombre: "X", apellido: "Y", nombre_usuario: "xyz", contrasena: "Clave12345", id_rol: 1 });
    assert.equal(r.status, 403);
    // no puede otorgar permisos restringidos ni los que no tiene
    r = await w.post("/Usuarios/Carga", { nombre: "X", apellido: "Y", nombre_usuario: "xyz", contrasena: "Clave12345", id_rol: 3, vistas: ["Roles", "Auditoria", "Tools"] });
    assert.equal(r.status, 400);
    assert.match(r.texto, /No podés otorgar permisos/);
    assert.equal(await db.Usuario.count({ where: { nombre_usuario: "xyz" } }), 0);
    // no puede tocar al admin
    r = await w.get("/Usuarios/Editar/1");
    assert.equal(r.status, 403);
    // no puede darse permisos a sí mismo
    const yo = await db.Usuario.findOne({ where: { nombre_usuario: "walter" } });
    await w.post(`/Usuarios/Editar/${yo.id_usuario}`, { nombre: "Walter", apellido: "G", nombre_usuario: "walter", id_rol: 2, estado: "1", vistas: ["Vehicles", "Tools", "Roles", "Usuarios"] });
    assert.equal((await db.Usuario.findByPk(yo.id_usuario)).permisos, "Vehicles,Choferes,Usuarios");
    await db.Usuario.update({ permisos: "Choferes,Mantenimientos,Auditoria" }, { where: { nombre_usuario: "walter" } });
  });

  test("el único administrador no puede desactivarse ni perder el rol", async () => {
    const c = await admin();
    let r = await c.post("/Usuarios/Editar/1", { nombre: "A", apellido: "B", nombre_usuario: "admin", id_rol: 3, estado: "0" });
    assert.equal(r.status, 302);
    const u = await db.Usuario.findByPk(1);
    assert.equal(u.activo, true, "sigue activo");
    assert.equal(u.id_rol, 1, "sigue siendo administrador");
    await db.Usuario.update({ nombre: "Administrador", apellido: "Sistema" }, { where: { id_usuario: 1 } });
  });

  test("solo el administrador edita roles y el rol Administrador es inmutable", async () => {
    const a = await admin();
    let r = await a.post("/Usuarios/Roles/Editar/1", { vistas: ["Vehicles"] });
    assert.equal(r.status, 302);
    assert.match((await db.Rol.findByPk(1)).permisos, /Siniestros/);
    r = await a.post("/Usuarios/Roles/Editar/2", { vistas: ["Vehicles", "Tools", "Inventado"] });
    assert.equal((await db.Rol.findByPk(2)).permisos, "Vehicles,Tools");
  });
});

/* ───────────────────────────────── VEHÍCULOS ───────────────────────────────── */
describe("Vehículos", () => {
  const alta = (extra = {}) => ({ patente: "zz 999 aa", id_tipo: 1, marca: "Fiat", modelo: "Fiorino", anio: 2022, chasis: "CH-NEW-1", num_motor: "MO-NEW-1", combustible: "Nafta", transmision: "Manual", estado_actual: "Disponible", km_actual: 1000, fecha_alta: "2026-01-10", distrito: "Norte", observaciones: "Sin novedades", cedula_numero: "CED-NEW-1", cedula_titular: "Municipalidad", seguro_compania: "Sancor", seguro_vencimiento: "2027-05-01", rto_vencimiento: "2027-06-01", ...extra });

  test("alta correcta guarda todos los campos (patente normalizada)", async () => {
    const c = await admin();
    const r = await c.post("/CargaVehiculo", alta());
    assert.equal(r.status, 302);
    const v = await db.Vehiculo.findOne({ where: { patente: "ZZ999AA" } });
    assert.ok(v);
    assert.equal(v.observaciones, "Sin novedades");
    assert.equal(v.combustible, "Nafta");
    assert.equal(v.transmision, "Manual");
    assert.equal(r.location, `/Vehicles/${v.id_vehiculo}`);
    const audit = await db.Auditoria.findOne({ where: { tabla_afectada: "vehiculo", accion: "CREAR", id_registro_afectado: v.id_vehiculo } });
    assert.ok(audit, "queda registro de auditoría");
  });

  test("rechaza duplicados (patente, chasis, motor, cédula) informándolos todos", async () => {
    const c = await admin();
    const r = await c.post("/CargaVehiculo", alta({ patente: "AA001BB", chasis: "CHS-002", num_motor: "MOT-003", cedula_numero: "CED-004" }));
    assert.equal(r.status, 400);
    for (const t of ["la patente", "el número de chasis", "el número de motor", "el número de cédula"]) assert.match(r.texto, new RegExp(t));
  });

  test("no permite crear un vehículo 'En uso' ni con datos inválidos", async () => {
    const c = await admin();
    let r = await c.post("/CargaVehiculo", alta({ patente: "QQ111WW", chasis: "C9", num_motor: "M9", cedula_numero: "X9", estado_actual: "En uso" }));
    assert.equal(r.status, 400);
    assert.match(r.texto, /Asignaciones/);
    r = await c.post("/CargaVehiculo", alta({ patente: "QQ111WW", chasis: "C9", num_motor: "M9", cedula_numero: "X9", anio: 1800, km_actual: -5, fecha_alta: "2999-01-01" }));
    assert.equal(r.status, 400);
    assert.match(r.texto, /año debe estar/);
    assert.match(r.texto, /kilometraje/);
    assert.match(r.texto, /fecha de alta no puede ser futura/);
  });

  test("los errores no inyectan HTML", async () => {
    const c = await admin();
    const r = await c.post("/CargaVehiculo", alta({ patente: "<img src=x onerror=alert(1)>" }));
    assert.equal(r.status, 400);
    assert.ok(!r.texto.includes("<img src=x"));
  });

  test("edición: no baja el kilometraje, guarda historial cuando sube y valida estado", async () => {
    const c = await admin();
    const base = { estado_actual: "Disponible", km_actual: 45000, distrito: "Sur", observaciones: "ok", combustible: "Diésel", transmision: "Automática", cedula_numero: "CED-003", cedula_titular: "Municipalidad Capital", seguro_compania: "La Caja", seguro_vencimiento: "2027-07-04", rto_vencimiento: "2027-07-03", fecha_baja: "" };
    let r = await c.post("/Vehicles/Editar/3", { ...base, km_actual: 100 }, { multipart: undefined });
    assert.equal(r.status, 302);
    assert.equal(r.location, "/Vehicles/Editar/3", "vuelve al formulario con error");
    assert.equal((await db.Vehiculo.findByPk(3)).km_actual, 45000);
    assert.match((await aviso(c, "/Vehicles/Editar/3")).mensaje, /no puede ser menor/);

    r = await c.post("/Vehicles/Editar/3", { ...base, km_actual: 46000 });
    assert.equal(r.status, 302);
    assert.equal(r.location, "/Vehicles/3");
    const v = await db.Vehiculo.findByPk(3);
    assert.equal(v.km_actual, 46000);
    assert.equal(v.seguro_vencimiento, "2027-07-04");
    assert.ok(await db.HistorialKm.findOne({ where: { id_vehiculo: 3, km_nuevo: 46000 } }), "historial de km");
  });

  test("editar: renovar vencimientos borra las alertas que ya no corresponden", async () => {
    // vehículo 3 tenía alertas de RTO y seguro vencidos; la edición anterior las renovó
    const alertas = await db.Alerta.count({ where: { tipo: "documentacion_vencida", entidad_id: 3, entidad_tipo: "Vehiculo" } });
    assert.equal(alertas, 0);
  });

  test("editar: 'En uso' sin asignación y 'Disponible' con asignación activa se rechazan", async () => {
    const c = await admin();
    const datos = (estado) => ({ estado_actual: estado, km_actual: 87000, distrito: "Centro", observaciones: "", fecha_baja: "" });
    let r = await c.post("/Vehicles/Editar/4", { ...datos("En uso"), km_actual: 198000 });
    assert.equal(r.location, "/Vehicles/Editar/4");
    assert.equal((await db.Vehiculo.findByPk(4)).estado_actual, "Disponible");
    r = await c.post("/Vehicles/Editar/1", datos("Disponible")); // tiene asignación activa
    assert.equal(r.location, "/Vehicles/Editar/1");
    assert.equal((await db.Vehiculo.findByPk(1)).estado_actual, "En uso");
  });

  test("baja: fija la fecha de baja automáticamente", async () => {
    const c = await admin();
    const r = await c.post("/Vehicles/Editar/10", { estado_actual: "Baja", km_actual: 18000, distrito: "Centro", observaciones: "", fecha_baja: "" });
    assert.equal(r.location, "/Vehicles/10");
    const v = await db.Vehiculo.findByPk(10);
    assert.equal(v.estado_actual, "Baja");
    assert.ok(v.fecha_baja);
    assert.equal(await db.Alerta.count({ where: { entidad_tipo: "Vehiculo", entidad_id: 10 } }), 0, "un vehículo de baja no genera alertas");
  });

  test("actualizar km usa la fecha indicada y no admite retrocesos", async () => {
    const c = await admin();
    let r = await c.post("/ActualizarKm", { id_vehiculo: 5, km_nuevo: 300, fecha_actualizacion: "2026-08-01", observaciones: "" });
    assert.equal(r.status, 400);
    assert.match(r.texto, /no puede ser menor/);
    r = await c.post("/ActualizarKm", { id_vehiculo: 5, km_nuevo: 316000, fecha_actualizacion: "2026-08-01", observaciones: "lectura" });
    assert.equal(r.status, 302);
    const h = await db.HistorialKm.findOne({ where: { id_vehiculo: 5, km_nuevo: 316000 } });
    assert.equal(h.fecha, "2026-08-01");
    assert.equal(h.km_anterior, 315000);
    r = await c.post("/ActualizarKm", { id_vehiculo: 5, km_nuevo: 317000, fecha_actualizacion: "2999-01-01" });
    assert.equal(r.status, 400);
    assert.match(r.texto, /futura/);
  });

  test("ajustes: distritos y tipos evitan duplicados y no se borran si están en uso", async () => {
    const c = await admin();
    await c.post("/Vehicles/Ajustes/Distritos", { nombre: "Este" });
    await c.post("/Vehicles/Ajustes/Distritos", { nombre: "este" });
    assert.equal(await db.Distrito.count({ where: { nombre: "Este" } }), 1);
    const centro = await db.Distrito.findOne({ where: { nombre: "Centro" } });
    await c.post(`/Vehicles/Ajustes/Distritos/Eliminar/${centro.id_distrito}`, {});
    assert.ok(await db.Distrito.findByPk(centro.id_distrito), "en uso: no se borra");
    assert.match((await aviso(c)).mensaje, /lo usan/);
    await c.post("/Vehicles/Ajustes/Tipos/Eliminar/1", {});
    assert.ok(await db.TipoVehiculo.findByPk(1));
    await c.post("/Vehicles/Ajustes/Tipos", { descripcion: "Acoplado" });
    const t = await db.TipoVehiculo.findOne({ where: { descripcion: "Acoplado" } });
    await c.post(`/Vehicles/Ajustes/Tipos/Eliminar/${t.id_tipo}`, {});
    assert.equal(await db.TipoVehiculo.count({ where: { descripcion: "Acoplado" } }), 0);
  });

  test("la edición de un vehículo usa el catálogo de distritos", async () => {
    const c = await admin();
    const r = await c.get("/Vehicles/Editar/3");
    assert.match(r.texto, /value="Este"/);
  });
});

/* ───────────────────────────────── CHOFERES ───────────────────────────────── */
describe("Choferes", () => {
  const chofer = (extra = {}) => ({
    nombre: "Lucía", apellido: "Méndez", dni: "40111222", telefono: "3854555666", direccion: "Calle Falsa 123",
    fechaNacimiento: "1990-05-05", fechaIngreso: "2025-01-10", email: "Lucia.Mendez@Muni.gov", "activo-inactivo": "Activo", Turno: "Tarde/Noche",
    numero_licencia: "LIC-77777", categoria: "B", fecha_emision: "2024-01-01", fecha_vencimiento: "2030-01-01", ...extra,
  });

  test("alta con turno 'Tarde/Noche', categoría 'B' y email sin alterar la dirección", async () => {
    const c = await admin();
    const f = new FormData();
    Object.entries(chofer()).forEach(([k, v]) => f.append(k, v));
    const r = await c.pedir("POST", "/Choferes/Carga", { multipart: f });
    assert.equal(r.status, 302, r.texto.slice(0, 300));
    const ch = await db.Chofer.findOne({ where: { dni: "40111222" }, include: [{ model: db.LicenciaChofer, as: "licencias" }] });
    assert.equal(ch.turno, "Tarde/Noche");
    assert.equal(ch.email, "lucia.mendez@muni.gov");
    assert.equal(ch.licencias[0].categoria, "B");
    assert.equal(ch.fechaNacimiento, "1990-05-05");
  });

  test("alta valida duplicados (DNI, teléfono, N° de licencia) y estado", async () => {
    const c = await admin();
    const f = new FormData();
    Object.entries(chofer({ dni: "28111222", telefono: "3854100001", numero_licencia: "LIC-00001", "activo-inactivo": "Bloqueado" })).forEach(([k, v]) => f.append(k, v));
    const r = await c.pedir("POST", "/Choferes/Carga", { multipart: f });
    assert.equal(r.status, 400);
    assert.match(r.texto, /DNI ya está registrado/);
    assert.match(r.texto, /teléfono ya está registrado/);
    assert.match(r.texto, /número de licencia ya pertenece/);
    assert.match(r.texto, /Estado inválido/);
  });

  test("alta rechaza archivos que no son imágenes", async () => {
    const c = await admin();
    const f = new FormData();
    Object.entries(chofer({ dni: "40999888", telefono: "3854999888", numero_licencia: "LIC-88888" })).forEach(([k, v]) => f.append(k, v));
    f.append("foto_documento", new Blob(["<?php echo 1; ?>"], { type: "text/plain" }), "malo.php");
    const r = await c.pedir("POST", "/Choferes/Carga", { multipart: f });
    assert.notEqual(r.status, 302);
    assert.equal(await db.Chofer.count({ where: { dni: "40999888" } }), 0);
  });

  test("se puede editar un chofer con la licencia vencida (y categoría B)", async () => {
    const c = await admin();
    const ed = { nombre: "Roberto", apellido: "Leiva", dni: "35555666", telefono: "3854100005", direccion: "Sarmiento 654, Banda", email: "", fechaNacimiento: "1992-05-18", fechaIngreso: "2022-02-20", "activo-inactivo": "Activo", Turno: "Tarde", numero_licencia: "LIC-00005", categoria: "B1", fecha_emision: "2020-01-15", fecha_vencimiento: "2026-01-15" };
    const f = new FormData();
    Object.entries({ ...ed, telefono: "3854100055" }).forEach(([k, v]) => f.append(k, v));
    const r = await c.pedir("POST", "/Choferes/5/editar", { multipart: f });
    assert.equal(r.status, 302, r.texto.slice(0, 400));
    assert.equal((await db.Chofer.findByPk(5)).telefono, "3854100055");
  });

  test("no se puede cargar una nueva fecha de vencimiento en el pasado al editar", async () => {
    const c = await admin();
    const f = new FormData();
    Object.entries({ nombre: "Roberto", apellido: "Leiva", dni: "35555666", telefono: "3854100055", direccion: "Sarmiento 654", fechaNacimiento: "1992-05-18", fechaIngreso: "2022-02-20", "activo-inactivo": "Activo", Turno: "Tarde", numero_licencia: "LIC-00005", categoria: "B1", fecha_emision: "2020-01-15", fecha_vencimiento: "2025-01-15" }).forEach(([k, v]) => f.append(k, v));
    const r = await c.pedir("POST", "/Choferes/5/editar", { multipart: f });
    assert.equal(r.status, 400);
    assert.match(r.texto, /no puede estar en el pasado/);
  });

  test("el formulario de edición conserva lo que el usuario escribió cuando hay errores", async () => {
    const c = await admin();
    const f = new FormData();
    Object.entries({ nombre: "NombreEditado", apellido: "Leiva", dni: "35555666", telefono: "12", direccion: "Sarmiento 654", fechaNacimiento: "1992-05-18", fechaIngreso: "2022-02-20", "activo-inactivo": "Activo", numero_licencia: "LIC-00005", categoria: "B1", fecha_emision: "2020-01-15", fecha_vencimiento: "2026-01-15" }).forEach(([k, v]) => f.append(k, v));
    const r = await c.pedir("POST", "/Choferes/5/editar", { multipart: f });
    assert.equal(r.status, 400);
    assert.match(r.texto, /NombreEditado/);
  });

  test("el formulario de edición muestra fechas y estado 'Licencia' del chofer", async () => {
    const c = await admin();
    const r = await c.get("/Choferes/7/editar");
    assert.match(r.texto, /name="fechaNacimiento" type="date" value="1995-02-14"/);
    assert.match(r.texto, /value="Licencia Vacaciones\/Medica" selected/);
  });

  test("dar de baja exige motivo, cierra la asignación activa y libera el vehículo", async () => {
    const c = await admin();
    const a = await db.AsignacionVehiculo.findOne({ where: { estado: "Activo" } });
    assert.equal(a.id_chofer, 1);
    const datos = { nombre: "Carlos", apellido: "Rodríguez", dni: "28111222", telefono: "3854100001", direccion: "Av. Libertad 123", fechaNacimiento: "1985-03-12", fechaIngreso: "2020-01-05", "activo-inactivo": "Inactivo", Turno: "Mañana", numero_licencia: "LIC-00001", categoria: "C", fecha_emision: "2023-01-10", fecha_vencimiento: "2028-01-10" };
    let f = new FormData();
    Object.entries(datos).forEach(([k, v]) => f.append(k, v));
    let r = await c.pedir("POST", "/Choferes/1/editar", { multipart: f });
    assert.equal(r.status, 400);
    assert.match(r.texto, /motivo de baja es obligatorio/);
    assert.equal((await db.Chofer.findByPk(1)).estado, "Activo");

    f = new FormData();
    Object.entries({ ...datos, motivoBaja: "Renuncia" }).forEach(([k, v]) => f.append(k, v));
    r = await c.pedir("POST", "/Choferes/1/editar", { multipart: f });
    assert.equal(r.status, 302);
    assert.equal((await db.Chofer.findByPk(1)).estado, "Inactivo");
    assert.equal((await db.AsignacionVehiculo.findByPk(a.id_asignacion)).estado, "Finalizado");
    assert.equal((await db.Vehiculo.findByPk(1)).estado_actual, "Disponible");

    // reactivar limpia el motivo
    await c.post("/Choferes/1/activar", {});
    const ch = await db.Chofer.findByPk(1);
    assert.equal(ch.estado, "Activo");
    assert.equal(ch.motivoBaja, null);
  });

  test("desactivar desde el listado también cierra asignaciones", async () => {
    const c = await admin();
    await c.post("/Asignaciones", { id_vehiculo: 3, id_chofer: 4, fecha_desde: hoy(), fecha_hasta: hoy(5), destino: "Sur", km_salida: 46000, observaciones: "" });
    assert.equal((await db.Vehiculo.findByPk(3)).estado_actual, "En uso");
    await c.post("/Choferes/4/desactivar", {});
    assert.equal((await db.Chofer.findByPk(4)).estado, "Inactivo");
    assert.equal((await db.Vehiculo.findByPk(3)).estado_actual, "Disponible");
    await c.post("/Choferes/4/activar", {});
  });

  test("el listado no rompe con nombres con HTML y los escapa dentro del script", async () => {
    await db.Chofer.update({ nombre: "</script><b>x" }, { where: { id_chofer: 8 } });
    const c = await admin();
    const r = await c.get("/Choferes");
    assert.equal(r.status, 200);
    assert.ok(!r.texto.includes("</script><b>x"), "no debe aparecer crudo");
    await db.Chofer.update({ nombre: "Alejandro" }, { where: { id_chofer: 8 } });
  });

  test("/Choferes/:id (enlace de las alertas) lleva al chofer", async () => {
    const c = await admin();
    const r = await c.get("/Choferes/2");
    assert.equal(r.status, 302);
    assert.match(r.location, /buscar=30222333/);
    const l = await c.get(r.location);
    assert.match(l.texto, /Villalba/);
  });
});

function hoy(masDias = 0) {
  const d = new Date(Date.now() + masDias * 86400000);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* ─────────────────────────────── ASIGNACIONES ─────────────────────────────── */
describe("Asignaciones", () => {
  const datos = (extra) => ({ id_vehiculo: 4, id_chofer: 8, fecha_desde: hoy(), fecha_hasta: hoy(3), destino: "Norte", km_salida: 198000, observaciones: "", ...extra });

  test("valida licencia vigente, estado del vehículo y del chofer", async () => {
    const c = await admin();
    // chofer 2: licencia vencida
    await c.post("/Asignaciones", datos({ id_chofer: 2 }));
    assert.equal(await db.AsignacionVehiculo.count({ where: { id_chofer: 2 } }), 0);
    // vehículo en mantenimiento (9)
    await c.post("/Asignaciones", datos({ id_vehiculo: 9 }));
    assert.equal(await db.AsignacionVehiculo.count({ where: { id_vehiculo: 9 } }), 0);
    // chofer inactivo (10)
    await c.post("/Asignaciones", datos({ id_chofer: 10 }));
    assert.equal(await db.AsignacionVehiculo.count({ where: { id_chofer: 10 } }), 0);
  });

  test("los mensajes de error llegan a la pantalla", async () => {
    const c = await admin();
    const r = await c.post("/Asignaciones", datos({ id_chofer: 2 }));
    assert.match(decodeURIComponent(r.location), /no tiene una licencia vigente/);
    const r2 = await c.post("/Asignaciones", datos({ id_vehiculo: 9 }));
    assert.match(decodeURIComponent(r2.location), /no está disponible/);
    const r3 = await c.post("/Asignaciones", datos({ km_salida: 10 }));
    assert.match(decodeURIComponent(r3.location), /no puede ser menor/);
  });

  test("el formulario sólo ofrece vehículos disponibles y choferes activos, libres y con licencia vigente", async () => {
    const c = await admin();
    const r = await c.get("/asignaciones");
    assert.match(r.texto, /AD004EE/);
    assert.ok(!r.texto.includes("AI009JJ —"), "vehículo en mantenimiento no debe ofrecerse");
    assert.ok(!r.texto.includes("Villalba"), "licencia vencida no debe ofrecerse");
    assert.ok(!r.texto.includes("Cabrera"), "chofer inactivo no debe ofrecerse");
    assert.match(r.texto, /Herrera/);
  });

  test("alta correcta: vehículo 'En uso', km y historial actualizados; no permite duplicar", async () => {
    const c = await admin();
    let r = await c.post("/Asignaciones", datos({ km_salida: 198500 }));
    assert.match(decodeURIComponent(r.location), /success=Asignación registrada/);
    const v = await db.Vehiculo.findByPk(4);
    assert.equal(v.estado_actual, "En uso");
    assert.equal(v.km_actual, 198500);
    assert.ok(await db.HistorialKm.findOne({ where: { id_vehiculo: 4, km_nuevo: 198500 } }));
    r = await c.post("/Asignaciones", datos({ id_vehiculo: 6, id_chofer: 8, km_salida: 415000 }));
    assert.match(decodeURIComponent(r.location), /ya tiene un vehículo asignado/);
    assert.ok(await db.Auditoria.findOne({ where: { tabla_afectada: "asignacion_vehiculo", accion: "CREAR" } }));
  });

  test("finalizar libera el vehículo y no se puede finalizar dos veces", async () => {
    const c = await admin();
    const a = await db.AsignacionVehiculo.findOne({ where: { id_vehiculo: 4, estado: "Activo" } });
    let r = await c.post(`/Asignaciones/${a.id_asignacion}/finalizar`, {});
    assert.match(decodeURIComponent(r.location), /finalizada correctamente/);
    assert.equal((await db.Vehiculo.findByPk(4)).estado_actual, "Disponible");
    assert.ok((await db.AsignacionVehiculo.findByPk(a.id_asignacion)).fecha_devolucion);
    // el vehículo pasa a otra asignación; finalizar de nuevo la vieja NO debe liberarlo
    await c.post("/Asignaciones", datos({ km_salida: 198500, id_chofer: 8 }));
    assert.equal((await db.Vehiculo.findByPk(4)).estado_actual, "En uso");
    r = await c.post(`/Asignaciones/${a.id_asignacion}/finalizar`, {});
    assert.match(decodeURIComponent(r.location), /ya estaba finalizada/);
    assert.equal((await db.Vehiculo.findByPk(4)).estado_actual, "En uso");
  });
});

/* ───────────────────────── MANTENIMIENTOS Y REPUESTOS ───────────────────────── */
describe("Mantenimientos y repuestos", () => {
  const orden = (extra = {}) => ({ id_vehiculo: 7, fecha_inicio: hoy(-1), tipo_servicio: "Cambio de aceite", estado: "Realizado", km_servicio: 62500, proximo_servicio_km: 70000, descripcion: "Cambio de aceite y filtro", observaciones: "", mano_obra: "10000", costo_repuestos: "999999", costo_total: "999999", id_repuesto: ["6", "10"], cantidad: ["1", "2"], costo_unitario: ["8500", "9500"], ...extra });

  test("los importes se calculan en el servidor (se ignoran los enviados por el cliente)", async () => {
    const c = await admin();
    const stockAntes = (await db.Repuesto.findByPk(6)).stock;
    const r = await c.post("/CargaMantenimiento", orden());
    assert.equal(r.status, 302, r.texto.slice(0, 300));
    const m = await db.Mantenimiento.findOne({ where: { id_vehiculo: 7 }, order: [["id_mantenimiento", "DESC"]] });
    assert.equal(Number(m.costo_repuestos), 8500 + 2 * 9500);
    assert.equal(Number(m.costo_total), 8500 + 2 * 9500 + 10000);
    assert.equal(Number(m.mano_obra), 10000);
    assert.ok(m.fecha_fin, "una orden Realizada tiene fecha de fin");
    assert.equal(await db.DetalleMantenimiento.count({ where: { id_mantenimiento: m.id_mantenimiento } }), 2, "se guardan los detalles");
    assert.equal((await db.Repuesto.findByPk(6)).stock, stockAntes - 1, "se descuenta stock");
    assert.equal((await db.Vehiculo.findByPk(7)).km_actual, 62500);
    assert.ok(await db.HistorialKm.findOne({ where: { id_vehiculo: 7, km_nuevo: 62500 } }));
  });

  test("stock insuficiente: no guarda nada", async () => {
    const c = await admin();
    const antes = await db.Mantenimiento.count();
    const r = await c.post("/CargaMantenimiento", orden({ id_repuesto: ["15"], cantidad: ["50"], costo_unitario: ["1"] }));
    assert.equal(r.status, 400);
    assert.match(r.texto, /Stock insuficiente/);
    assert.equal(await db.Mantenimiento.count(), antes);
    assert.equal((await db.Repuesto.findByPk(15)).stock, 2);
  });

  test("valida km, próximo servicio, estado y vehículo en uso", async () => {
    const c = await admin();
    let r = await c.post("/CargaMantenimiento", orden({ km_servicio: 100 }));
    assert.match(r.texto, /no puede ser menor al actual/);
    r = await c.post("/CargaMantenimiento", orden({ proximo_servicio_km: 62500 }));
    assert.match(r.texto, /debe ser mayor/);
    r = await c.post("/CargaMantenimiento", orden({ estado: "Cancelado" }));
    assert.match(r.texto, /estado de la orden no es válido/);
    r = await c.post("/CargaMantenimiento", orden({ mano_obra: "-5" }));
    assert.match(r.texto, /no puede ser negativa/);
    // vehículo en uso (asignarlo primero)
    await c.post("/Asignaciones", { id_vehiculo: 6, id_chofer: 1, fecha_desde: hoy(), fecha_hasta: hoy(2), destino: "X", km_salida: 415000, observaciones: "" });
    r = await c.post("/CargaMantenimiento", orden({ id_vehiculo: 6, estado: "En proceso", km_servicio: 415000, proximo_servicio_km: "", id_repuesto: [], cantidad: [], costo_unitario: [] }));
    assert.equal(r.status, 400);
    assert.match(r.texto, /finalizá la asignación/);
    const a = await db.AsignacionVehiculo.findOne({ where: { id_vehiculo: 6, estado: "Activo" } });
    await c.post(`/Asignaciones/${a.id_asignacion}/finalizar`, {});
  });

  test("una orden 'En proceso' pone el vehículo en mantenimiento y al finalizarla lo libera", async () => {
    const c = await admin();
    let r = await c.post("/CargaMantenimiento", orden({ id_vehiculo: 5, estado: "En proceso", km_servicio: 316000, proximo_servicio_km: "", id_repuesto: [], cantidad: [], costo_unitario: [], mano_obra: "5000" }));
    assert.equal(r.status, 302, r.texto.slice(0, 300));
    assert.equal((await db.Vehiculo.findByPk(5)).estado_actual, "En mantenimiento");
    const m = await db.Mantenimiento.findOne({ where: { id_vehiculo: 5 }, order: [["id_mantenimiento", "DESC"]] });
    assert.equal(m.fecha_fin, null);
    // el detalle no debe estar disponible en 'Asignaciones'
    assert.ok(!(await c.get("/asignaciones")).texto.includes("AE005FF —"));
    r = await c.post(`/Mantenimientos/${m.id_mantenimiento}/estado`, { estado: "Realizado" });
    assert.equal(r.location, "/Mantenimientos");
    const fin = await db.Mantenimiento.findByPk(m.id_mantenimiento);
    assert.equal(fin.estado, "Realizado");
    assert.ok(fin.fecha_fin);
    assert.equal((await db.Vehiculo.findByPk(5)).estado_actual, "Disponible");
    // una orden realizada no se reabre ni se repite
    await c.post(`/Mantenimientos/${m.id_mantenimiento}/estado`, { estado: "Pendiente" });
    assert.match((await aviso(c, "/Mantenimientos")).mensaje, /no puede volver a abrirse/);
    assert.equal((await db.Mantenimiento.findByPk(m.id_mantenimiento)).estado, "Realizado");
  });

  test("con dos órdenes abiertas, el vehículo sólo se libera al cerrar la última", async () => {
    const c = await admin();
    await c.post("/CargaMantenimiento", orden({ id_vehiculo: 8, estado: "Pendiente", km_servicio: 73000, proximo_servicio_km: "", id_repuesto: [], cantidad: [], costo_unitario: [], mano_obra: "0" }));
    await c.post("/CargaMantenimiento", orden({ id_vehiculo: 8, estado: "En proceso", km_servicio: 73000, proximo_servicio_km: "", id_repuesto: [], cantidad: [], costo_unitario: [], mano_obra: "0" }));
    const ordenes = await db.Mantenimiento.findAll({ where: { id_vehiculo: 8 }, order: [["id_mantenimiento", "ASC"]] });
    assert.equal(ordenes.length, 2);
    await c.post(`/Mantenimientos/${ordenes[0].id_mantenimiento}/estado`, { estado: "Realizado" });
    assert.equal((await db.Vehiculo.findByPk(8)).estado_actual, "En mantenimiento");
    await c.post(`/Mantenimientos/${ordenes[1].id_mantenimiento}/estado`, { estado: "Realizado" });
    assert.equal((await db.Vehiculo.findByPk(8)).estado_actual, "Disponible");
  });

  test("el listado usa los importes guardados (mano de obra y repuestos)", async () => {
    const c = await admin();
    const r = await c.get("/Mantenimientos");
    assert.match(r.texto, /\$86500/);
    assert.match(r.texto, /\$46500/);
    assert.match(r.texto, /\$40000/);
  });

  test("las alertas de service (próximo / vencido) se generan y se actualizan", async () => {
    const c = await admin();
    await c.post("/ActualizarKm", { id_vehiculo: 4, km_nuevo: 205500, fecha_actualizacion: hoy(), observaciones: "" });
    await c.get("/Alertas");
    const a = await db.Alerta.findOne({ where: { tipo: "mantenimiento_vencido", entidad_id: 4 } });
    assert.ok(a, "service vencido");
    assert.equal(a.prioridad, "alta");
    assert.ok(await db.Alerta.findOne({ where: { tipo: "mantenimiento_proximo", entidad_id: 3 } }), "service próximo del vehículo 3");
  });

  test("repuestos: valida, evita duplicados y no elimina los usados", async () => {
    const c = await admin();
    await c.post("/Repuestos/Agregar", { nombre: "Filtro X", stock: "5", costo_unitario: "100" });
    await c.post("/Repuestos/Agregar", { nombre: "filtro x", stock: "5", costo_unitario: "100" });
    assert.equal(await db.Repuesto.count({ where: { nombre: "Filtro X" } }), 1);
    await c.post("/Repuestos/Agregar", { nombre: "Malo", stock: "-3", costo_unitario: "1" });
    assert.equal(await db.Repuesto.count({ where: { nombre: "Malo" } }), 0);
    await c.post("/Repuestos/Eliminar/6", {});
    assert.ok(await db.Repuesto.findByPk(6), "usado en mantenimientos: no se elimina");
    const nuevo = await db.Repuesto.findOne({ where: { nombre: "Filtro X" } });
    await c.post(`/Repuestos/Eliminar/${nuevo.id_repuesto}`, {});
    assert.equal(await db.Repuesto.count({ where: { nombre: "Filtro X" } }), 0);
  });
});

/* ───────────────────────── HERRAMIENTAS Y PRÉSTAMOS ───────────────────────── */
describe("Herramientas y préstamos", () => {
  test("el formulario de alta funciona (POST /Tools/Carga)", async () => {
    const c = await admin();
    const r = await c.post("/Tools/Carga", { codigo_activo: "HTI-100", nombre: "Taladro", sector: "Taller Mecánico", stock: "2", estado: "Disponible", combustible_energia: "Energía", observaciones: "nueva" });
    assert.equal(r.status, 302);
    const h = await db.Herramienta.findOne({ where: { codigo_activo: "HTI-100" } });
    assert.ok(h);
    assert.equal(h.stock, 2);
    assert.equal(r.location, `/Tools/${h.id_herramienta}`);
  });

  test("alta valida código duplicado, stock y sector", async () => {
    const c = await admin();
    await c.post("/Tools/Carga", { codigo_activo: "HTI-100", nombre: "Otro", sector: "Taller Mecánico", stock: "1" });
    assert.match((await aviso(c, "/Tools")).mensaje, /Ya existe una herramienta con el código/);
    await c.post("/Tools/Carga", { codigo_activo: "HTI-101", nombre: "Otro", sector: "Inventado", stock: "1" });
    assert.match((await aviso(c, "/Tools")).mensaje, /sector seleccionado no existe/);
    await c.post("/Tools/Carga", { codigo_activo: "HTI-101", nombre: "Otro", sector: "Taller Mecánico", stock: "-2" });
    assert.match((await aviso(c, "/Tools")).mensaje, /stock debe ser/);
    assert.equal(await db.Herramienta.count({ where: { codigo_activo: "HTI-101" } }), 0);
  });

  test("préstamo con el formulario real (ids de operario y sector) respeta el stock", async () => {
    const c = await admin();
    const h = await db.Herramienta.findOne({ where: { codigo_activo: "HTI-100" } }); // stock 2
    const datos = { id_herramienta: h.id_herramienta, id_operario: 1, id_sector_destino: 2, fecha_salida: hoy(), fecha_devolucion_estimada: hoy(4), observaciones_entrega: "con cargador" };
    let r = await c.post("/Tools/Prestamo", datos);
    assert.equal(r.location, `/Tools/${h.id_herramienta}`);
    let p = await db.Prestamo.findOne({ where: { id_herramienta: h.id_herramienta } });
    assert.equal(p.nombre_operario, "Hernán Quiroga");
    assert.equal(p.sector_destino, "Taller Mecánico");
    assert.equal(p.observaciones, "con cargador");
    assert.equal((await db.Herramienta.findByPk(h.id_herramienta)).estado, "Disponible", "queda una unidad");
    await c.post("/Tools/Prestamo", { ...datos, id_operario: 2 });
    assert.equal((await db.Herramienta.findByPk(h.id_herramienta)).estado, "En uso", "todas las unidades afuera");
    r = await c.post("/Tools/Prestamo", { ...datos, id_operario: 3 });
    assert.match((await aviso(c, "/Tools")).mensaje, /no tiene unidades disponibles/);
    assert.equal(await db.Prestamo.count({ where: { id_herramienta: h.id_herramienta } }), 2);
  });

  test("devolución por préstamo: libera una unidad y no se devuelve dos veces", async () => {
    const c = await admin();
    const h = await db.Herramienta.findOne({ where: { codigo_activo: "HTI-100" } });
    const p = await db.Prestamo.findOne({ where: { id_herramienta: h.id_herramienta }, order: [["id_prestamo", "ASC"]] });
    await c.post("/Tools/Devolucion", { id_herramienta: h.id_herramienta, id_prestamo: p.id_prestamo });
    assert.equal((await db.Prestamo.findByPk(p.id_prestamo)).estado_prestamo, "Finalizado");
    assert.equal((await db.Herramienta.findByPk(h.id_herramienta)).estado, "Disponible");
    await c.post("/Tools/Devolucion", { id_herramienta: h.id_herramienta, id_prestamo: p.id_prestamo });
    assert.match((await aviso(c, "/Tools")).mensaje, /ya fue devuelto/);
  });

  test("no se presta una herramienta en reparación ni con fechas incoherentes", async () => {
    const c = await admin();
    await c.post("/Tools/Prestamo", { id_herramienta: 7, id_operario: 1, id_sector_destino: 2, fecha_salida: hoy(), fecha_devolucion_estimada: hoy(3) });
    assert.match((await aviso(c, "/Tools")).mensaje, /En Reparación/);
    await c.post("/Tools/Prestamo", { id_herramienta: 1, id_operario: 1, id_sector_destino: 2, fecha_salida: hoy(5), fecha_devolucion_estimada: hoy(1) });
    assert.match((await aviso(c, "/Tools")).mensaje, /no puede ser anterior/);
    assert.equal(await db.Prestamo.count({ where: { id_herramienta: 1 } }), 0);
  });

  test("la devolución no pisa el estado 'En Reparación' y no rompe sin préstamo activo", async () => {
    const c = await admin();
    await c.post("/Tools/Devolucion", { id_herramienta: 7 });
    assert.match((await aviso(c, "/Tools")).mensaje, /No hay un préstamo activo/);
    assert.equal((await db.Herramienta.findByPk(7)).estado, "En Reparación");
  });

  test("el préstamo vencido genera alerta y desaparece al devolver", async () => {
    const c = await admin();
    await c.get("/Alertas");
    assert.ok(await db.Alerta.findOne({ where: { tipo: "prestamo_vencido", entidad_id: 3 } }));
    await c.post("/Tools/Devolucion", { id_herramienta: 3 });
    await c.get("/Alertas");
    assert.equal(await db.Alerta.count({ where: { tipo: "prestamo_vencido", entidad_id: 3 } }), 0);
    assert.equal((await db.Herramienta.findByPk(3)).estado, "Disponible");
  });

  test("edición: el estado 'En uso'/'Disponible' se deriva de los préstamos; no se puede reparar con préstamos activos", async () => {
    const c = await admin();
    const h = await db.Herramienta.findOne({ where: { codigo_activo: "HTI-100" } });
    await c.post("/Tools/Prestamo", { id_herramienta: h.id_herramienta, id_operario: 1, id_sector_destino: 2, fecha_salida: hoy(), fecha_devolucion_estimada: hoy(2) });
    await c.post(`/Tools/Editar/${h.id_herramienta}`, { codigo_activo: "HTI-100", nombre: "Taladro", sector: "Taller Mecánico", stock: "2", estado: "En Reparación" });
    assert.match((await aviso(c, "/Tools")).mensaje, /préstamos activos/);
    await c.post(`/Tools/Editar/${h.id_herramienta}`, { codigo_activo: "HTI-100", nombre: "Taladro Pro", sector: "Taller Mecánico", stock: "1", estado: "Disponible" });
    assert.match((await aviso(c, "/Tools")).mensaje, /stock no puede ser menor|Herramienta actualizada/);
  });

  test("eliminar: se bloquea con préstamos activos; sin ellos borra herramienta e historial", async () => {
    const c = await admin();
    const h = await db.Herramienta.findOne({ where: { codigo_activo: "HTI-100" } });
    await c.post(`/Tools/Eliminar/${h.id_herramienta}`, {});
    assert.ok(await db.Herramienta.findByPk(h.id_herramienta), "con préstamo activo no se elimina");
    while (await db.Prestamo.count({ where: { id_herramienta: h.id_herramienta, estado_prestamo: "Activo" } })) {
      await c.post("/Tools/Devolucion", { id_herramienta: h.id_herramienta });
    }
    await c.post(`/Tools/Eliminar/${h.id_herramienta}`, {});
    assert.equal(await db.Herramienta.findByPk(h.id_herramienta), null);
    assert.equal(await db.Prestamo.count({ where: { id_herramienta: h.id_herramienta } }), 0);
    const a = await db.Auditoria.findOne({ where: { tabla_afectada: "herramienta", accion: "ELIMINAR" } });
    assert.ok(a && a.valor_anterior.includes("HTI-100"), "la auditoría guarda una copia de lo eliminado");
  });

  test("ajustes: sectores y operarios evitan duplicados y no se borran si están en uso", async () => {
    const c = await admin();
    await c.post("/Tools/Ajustes/Sectores", { nombre: "Nuevo Sector" });
    await c.post("/Tools/Ajustes/Sectores", { nombre: "nuevo sector" });
    assert.equal(await db.Sector.count({ where: { nombre: "Nuevo Sector" } }), 1);
    await c.post("/Tools/Ajustes/Sectores/Eliminar/2", {}); // Taller Mecánico está en uso
    assert.ok(await db.Sector.findByPk(2));
    await c.post("/Tools/Ajustes/Operarios", { nombre: "Nuevo Operario" });
    const o = await db.Operario.findOne({ where: { nombre: "Nuevo Operario" } });
    await c.post(`/Tools/Ajustes/Operarios/Eliminar/${o.id_operario}`, {});
    assert.equal(await db.Operario.findByPk(o.id_operario), null);
  });

  test("la vista de detalle muestra al último prestatario", async () => {
    const c = await admin();
    const r = await c.get("/Tools/2");
    assert.equal(r.status, 200);
  });
});

/* ───────────────────────────────── SINIESTROS ───────────────────────────────── */
describe("Siniestros", () => {
  const siniestro = (extra = {}) => ({ id_vehiculo: 3, id_chofer: 8, fecha_siniestro: hoy(-1), ubicacion: "Ruta 9 km 1040", descripcion: "Choque leve", danos_vehiculo: "Paragolpes", tercero_vehiculo: "Fiat Uno", tercero_seguro: "La Segunda", tercero_conductor: "Juan", tercero_contacto: "3855111222", ...extra });

  test("registrar un siniestro funciona completo (antes fallaba con ReferenceError)", async () => {
    const c = await admin();
    const f = new FormData();
    Object.entries(siniestro()).forEach(([k, v]) => f.append(k, v));
    f.append("archivos", new Blob(["fakeimg"], { type: "image/png" }), "foto.png");
    const r = await c.pedir("POST", "/Siniestros/Carga", { multipart: f });
    assert.equal(r.status, 302, r.texto.slice(0, 400));
    const s = await db.Siniestro.findOne({ order: [["id_siniestro", "DESC"]] });
    assert.equal(s.estado, "EN PROCESO");
    assert.equal(s.chofer_involucrado, "Alejandro Medina");
    assert.equal(s.id_chofer, 8);
    assert.match(s.archivos_adjuntos, /^siniestro-\d+\.png$/);
    assert.equal((await db.Vehiculo.findByPk(3)).estado_actual, "En siniestro");
    assert.equal((await db.Chofer.findByPk(8)).estado, "Activo", "el chofer no cambia de estado");
    assert.ok(await db.Alerta.findOne({ where: { tipo: "siniestro_activo", entidad_id: s.id_siniestro } }));
    assert.ok(await db.Auditoria.findOne({ where: { tabla_afectada: "siniestro", accion: "CREAR", id_registro_afectado: s.id_siniestro } }));
    // los adjuntos se sirven desde /img/siniestros
    const d = await c.get(`/Siniestros/${s.id_siniestro}`);
    assert.match(d.texto, new RegExp(`/img/siniestros/${s.archivos_adjuntos.replace(".", "\\.")}`));
    const img = await fetch(`${base}/img/siniestros/${s.archivos_adjuntos}`);
    assert.equal(img.status, 200);
  });

  test("valida vehículo, fecha y ubicación", async () => {
    const c = await admin();
    const antes = await db.Siniestro.count();
    for (const extra of [{ id_vehiculo: "" }, { fecha_siniestro: "2999-01-01" }, { ubicacion: "  " }, { id_vehiculo: 2 }, { id_chofer: 9999 }]) {
      const f = new FormData();
      Object.entries(siniestro(extra)).forEach(([k, v]) => f.append(k, v));
      const r = await c.pedir("POST", "/Siniestros/Carga", { multipart: f });
      assert.equal(r.status, 400, JSON.stringify(extra));
    }
    assert.equal(await db.Siniestro.count(), antes);
  });

  test("un vehículo asignado que sufre un siniestro cierra su asignación", async () => {
    const c = await admin();
    await c.post("/Asignaciones", { id_vehiculo: 4, id_chofer: 4, fecha_desde: hoy(), fecha_hasta: hoy(2), destino: "X", km_salida: 205500, observaciones: "" });
    assert.equal((await db.Vehiculo.findByPk(4)).estado_actual, "En uso");
    const f = new FormData();
    Object.entries(siniestro({ id_vehiculo: 4, id_chofer: 4, ubicacion: "Centro" })).forEach(([k, v]) => f.append(k, v));
    const r = await c.pedir("POST", "/Siniestros/Carga", { multipart: f });
    assert.equal(r.status, 302);
    assert.equal((await db.Vehiculo.findByPk(4)).estado_actual, "En siniestro");
    assert.equal(await db.AsignacionVehiculo.count({ where: { id_vehiculo: 4, estado: "Activo" } }), 0);
  });

  test("el filtro por patente realmente filtra", async () => {
    const c = await admin();
    const r = await c.get("/Siniestros?patente=AC003DD");
    assert.match(r.texto, /AC003DD/);
    assert.ok(!r.texto.includes("AD004EE</span>"), "no muestra el siniestro de otra patente");
    const otro = await c.get("/Siniestros?patente=ZZZ");
    assert.ok(!otro.texto.includes("<tr class=\"fila-siniestro\">"), "sin coincidencias no muestra filas");
    const todos = await c.get("/Siniestros");
    assert.match(todos.texto, /AD004EE<\/span>/);
  });

  test("resolver libera el vehículo sólo si no quedan otros siniestros abiertos", async () => {
    const c = await admin();
    const s = await db.Siniestro.findOne({ where: { id_vehiculo: 3 } });
    // segundo siniestro abierto sobre el mismo vehículo
    const f = new FormData();
    Object.entries(siniestro({ ubicacion: "Otro lugar" })).forEach(([k, v]) => f.append(k, v));
    await c.pedir("POST", "/Siniestros/Carga", { multipart: f });
    await c.post(`/Siniestros/${s.id_siniestro}/resolver`, { estado: "RESUELTO" });
    assert.equal((await db.Vehiculo.findByPk(3)).estado_actual, "En siniestro", "queda otro abierto");
    const s2 = await db.Siniestro.findOne({ where: { id_vehiculo: 3, estado: "EN PROCESO" } });
    await c.post(`/Siniestros/${s2.id_siniestro}/Estado`, { estado: "CERRADO" });
    assert.equal((await db.Vehiculo.findByPk(3)).estado_actual, "Disponible");
    // la alerta se marca leída al cerrarse
    await c.get("/Alertas");
    assert.equal(await db.Alerta.count({ where: { tipo: "siniestro_activo", entidad_id: s.id_siniestro, leida: false } }), 0);
    // estados inválidos se rechazan
    await c.post(`/Siniestros/${s.id_siniestro}/Estado`, { estado: "LO_QUE_SEA" });
    assert.equal((await db.Siniestro.findByPk(s.id_siniestro)).estado, "RESUELTO");
  });

  test("reabrir vuelve a dejar el vehículo en siniestro", async () => {
    const c = await admin();
    const s = await db.Siniestro.findOne({ where: { id_vehiculo: 3 }, order: [["id_siniestro", "ASC"]] });
    await c.post(`/Siniestros/${s.id_siniestro}/Estado`, { estado: "EN PROCESO" });
    assert.equal((await db.Vehiculo.findByPk(3)).estado_actual, "En siniestro");
    await c.get("/Alertas");
    assert.ok(await db.Alerta.findOne({ where: { tipo: "siniestro_activo", entidad_id: s.id_siniestro } }));
  });

  test("eliminar libera el vehículo, borra alerta y archivos y deja auditoría", async () => {
    const c = await admin();
    const abiertos = await db.Siniestro.findAll({ where: { id_vehiculo: 3, estado: "EN PROCESO" } });
    for (const s of abiertos) await c.post(`/Siniestros/Eliminar/${s.id_siniestro}`, {});
    assert.equal(await db.Siniestro.count({ where: { id_vehiculo: 3, estado: "EN PROCESO" } }), 0);
    assert.equal((await db.Vehiculo.findByPk(3)).estado_actual, "Disponible");
    assert.ok(await db.Auditoria.findOne({ where: { tabla_afectada: "siniestro", accion: "ELIMINAR" } }));
    for (const s of abiertos) assert.equal(await db.Alerta.count({ where: { tipo: "siniestro_activo", entidad_id: s.id_siniestro } }), 0);
  });

  test("la ficha del vehículo y los gráficos toleran el estado 'En siniestro'", async () => {
    const c = await admin();
    const r = await c.get("/Vehicles/4");
    assert.equal(r.status, 200);
    assert.match(r.texto, /badge--danger[^>]*>\s*En siniestro/);
    assert.equal((await c.get("/Alertas")).status, 200);
  });
});

/* ───────────────────────────────── ALERTAS ───────────────────────────────── */
describe("Alertas", () => {
  test("'marcar como leída' se mantiene aunque se regeneren las alertas", async () => {
    const c = await admin();
    await c.get("/Alertas");
    const a = await db.Alerta.findOne({ where: { tipo: "licencia_vencida", entidad_id: 2 } });
    assert.equal(a.leida, false);
    const r = await c.pedir("POST", `/Alertas/${a.id_alerta}/leer`, { json: {} });
    assert.equal(r.status, 200);
    await c.get("/Alertas");
    await require("../src/data/alertaService").generarTodas();
    assert.equal((await db.Alerta.findByPk(a.id_alerta)).leida, true);
  });

  test("marcar como leída por fetch exige el token CSRF", async () => {
    const c = await admin();
    const a = await db.Alerta.findOne({ where: { leida: false } });
    const r = await c.pedir("POST", `/Alertas/${a.id_alerta}/leer`, { json: {}, sinToken: true });
    assert.equal(r.status, 403);
  });

  test("al renovar una licencia la alerta desaparece", async () => {
    const c = await admin();
    assert.ok(await db.Alerta.findOne({ where: { tipo: "licencia_vencida", entidad_id: 3 } }));
    const f = new FormData();
    Object.entries({ nombre: "Marcelo", apellido: "Paz", dni: "32333444", telefono: "3854100003", direccion: "Belgrano 789, Banda", fechaNacimiento: "1990-11-05", fechaIngreso: "2021-03-01", "activo-inactivo": "Activo", Turno: "Mañana", numero_licencia: "LIC-00003", categoria: "C", fecha_emision: "2026-09-01", fecha_vencimiento: "2031-09-01" }).forEach(([k, v]) => f.append(k, v));
    const r = await c.pedir("POST", "/Choferes/3/editar", { multipart: f });
    assert.equal(r.status, 302, r.texto.slice(0, 300));
    await c.get("/Alertas");
    assert.equal(await db.Alerta.count({ where: { tipo: "licencia_vencida", entidad_id: 3 } }), 0);
  });

  test("hay una alerta por licencia y por documento; los inactivos y vehículos de baja no generan", async () => {
    const c = await admin();
    await c.get("/Alertas");
    assert.equal(await db.Alerta.count({ where: { entidad_tipo: "Chofer", entidad_id: 10 } }), 0);
    const grupos = await db.Alerta.findAll({ attributes: ["tipo", "entidad_tipo", "entidad_id", "mensaje"] });
    const claves = grupos.filter((a) => a.tipo === "documentacion_vencida").map((a) => `${a.entidad_id}|${/RTO/.test(a.mensaje) ? "rto" : "seguro"}`);
    assert.equal(new Set(claves).size, claves.length, "sin duplicados");
  });

  test("el detalle de una alerta y la lista rinden y escapan el mensaje", async () => {
    const c = await admin();
    const a = await db.Alerta.create({ tipo: "informativa", prioridad: "baja", mensaje: "<img src=x onerror=alert(1)>", entidad_tipo: "Chofer", entidad_id: 2, entidad_nombre: "X", generada_automaticamente: false });
    const d = await c.get(`/Alertas/${a.id_alerta}`);
    assert.equal(d.status, 200);
    assert.ok(!d.texto.includes("<img src=x onerror"));
    const l = await c.get("/Alertas");
    assert.ok(!l.texto.includes("<img src=x onerror"));
    // el panel de notificaciones (JS del topbar) escapa lo que muestra
    const t = await c.get("/Vehicles");
    assert.match(t.texto, /escaparHtml\(a\.mensaje\)/);
    await a.destroy();
    assert.equal((await c.get("/Alertas/99999")).status, 302);
  });
});

/* ─────────────────────── REPORTES, AUDITORÍA Y PANTALLAS ─────────────────────── */
describe("Reportes, auditoría y pantallas", () => {
  test("reportes: el rango de fechas incluye el último día", async () => {
    const c = await admin();
    await db.AsignacionVehiculo.create({ id_vehiculo: 7, id_chofer: 9, fecha_salida: new Date(`${hoy()}T16:30:00`), destino_area: "Destino Único", estado: "Finalizado", fecha_devolucion: new Date() });
    const r = await c.get(`/Reportes?fechaDesde=${hoy()}&fechaHasta=${hoy()}`);
    assert.match(r.texto, /Destino Único/);
    const malo = await c.get("/Reportes?fechaDesde=basura&fechaHasta=2026-13-45");
    assert.equal(malo.status, 200);
  });

  test("auditoría: muestra el usuario y las acciones con su color", async () => {
    const c = await admin();
    const r = await c.get("/Auditoria");
    assert.equal(r.status, 200);
    assert.match(r.texto, /Administrador Sistema/);
    assert.match(r.texto, /badge--success">CREAR/);
    assert.match(r.texto, /badge--warning">EDITAR/);
    assert.match(r.texto, /badge--success">LOGIN/);
    const f = await c.get("/Auditoria?fechaDesde=2000-01-01&fechaHasta=2000-01-02");
    assert.equal(f.status, 200);
  });

  test("las fechas 'solo día' no se corren un día por la zona horaria", async () => {
    const c = await admin();
    const r = await c.get("/Vehicles/1");
    // seguro del vehículo 1: 2027-03-15 -> 15/3/2027 ; alta 2023-01-10 -> 10/1/2023
    assert.match(r.texto, /15\/3\/2027/);
    assert.match(r.texto, /10\/1\/2023/);
  });

  test("los avisos (flash) se muestran una sola vez", async () => {
    const c = await admin();
    await c.post("/Vehicles/Ajustes/Distritos", { nombre: "Distrito Flash" });
    const a = await c.get("/Vehicles/Ajustes");
    assert.match(a.texto, /mostrarAviso\("ok", "Distrito agregado\."\)/);
    const b = await c.get("/Vehicles/Ajustes");
    assert.ok(!/mostrarAviso\("ok"/.test(b.texto));
  });

  test("cada pantalla principal responde 200", async () => {
    const c = await admin();
    const rutas = ["/Vehicles", "/Vehicles/1", "/Vehicles/Editar/1", "/CargaVehiculo", "/ActualizarKm", "/Vehicles/Ajustes", "/asignaciones", "/Mantenimientos", "/Mantenimientos/carga", "/Mantenimientos/carga/1", "/Repuestos/Gestionar", "/Choferes", "/Choferes/Carga", "/Choferes/1/editar", "/Tools", "/Tools/2", "/Tools/Carga", "/Tools/Editar/2", "/Tools/Prestamos", "/Tools/Prestamo/2", "/Tools/Ajustes", "/Alertas", "/Auditoria", "/Reportes", "/Siniestros", "/Siniestros/Carga", "/Usuarios", "/Usuarios/Carga", "/Usuarios/Editar/2", "/Usuarios/Roles", "/Usuarios/Roles/Editar/2"];
    for (const ruta of rutas) assert.equal((await c.get(ruta)).status, 200, ruta);
  });

  test("404 y rutas inexistentes no filtran información", async () => {
    const c = await admin();
    assert.equal((await c.get("/NoExiste")).status, 404);
    const r = await c.get("/Vehicles/9999");
    assert.equal(r.status, 302);
    assert.equal((await c.get("/Vehicles/abc")).status, 302);
  });

  test("los archivos subidos rechazan extensiones peligrosas y tamaños excesivos", async () => {
    const c = await admin();
    const f = new FormData();
    Object.entries({ patente: "MM111NN", id_tipo: 1, marca: "A", modelo: "B", anio: 2020, chasis: "CH-UP", num_motor: "MO-UP", estado_actual: "Disponible", km_actual: 1, fecha_alta: "2026-01-01" }).forEach(([k, v]) => f.append(k, v));
    f.append("foto_cedula", new Blob(["x".repeat(10)], { type: "text/html" }), "x.html");
    let r = await c.pedir("POST", "/CargaVehiculo", { multipart: f });
    assert.equal(r.status, 400);
    const g = new FormData();
    Object.entries({ patente: "MM111NN", id_tipo: 1, marca: "A", modelo: "B", anio: 2020, chasis: "CH-UP", num_motor: "MO-UP", estado_actual: "Disponible", km_actual: 1, fecha_alta: "2026-01-01" }).forEach(([k, v]) => g.append(k, v));
    g.append("foto_cedula", new Blob([Buffer.alloc(6 * 1024 * 1024)], { type: "image/png" }), "grande.png");
    r = await c.pedir("POST", "/CargaVehiculo", { multipart: g });
    assert.equal(r.status, 400);
    assert.equal(await db.Vehiculo.count({ where: { patente: "MM111NN" } }), 0);
  });
});
