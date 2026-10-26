// Prepara la base (la crea si no existe) y deja listos los dos usuarios base:
//   admin   (ve todo)  ·  usuario (solo lo operativo, sin reportes/gastos ni auditoría)
//   node scripts/crear-usuarios.js            → crea lo que falte (no toca contraseñas existentes)
//   node scripts/crear-usuarios.js --resetear → vuelve a dejar las contraseñas por defecto
require("dotenv").config({ quiet: true });
const { prepararBaseDeDatos } = require("../src/model/database/preparar");
const { asegurarUsuarios, asegurarTiposBase } = require("../src/model/database/usuariosBase");

const CLAVE_ADMIN = process.env.ADMIN_PASSWORD || "Ficha2026!";
const CLAVE_USUARIO = process.env.USUARIO_PASSWORD || "Usuario2026!";

(async () => {
  await prepararBaseDeDatos();
  const r = await asegurarUsuarios({ adminPassword: CLAVE_ADMIN, usuarioPassword: CLAVE_USUARIO, resetear: process.argv.includes("--resetear") });
  const tipos = await asegurarTiposBase();
  console.log("");
  console.log("  Usuarios del sistema");
  console.log("  --------------------");
  console.log(`  admin   (ve TODO)                        -> ${r.admin}`);
  console.log(`  usuario (sin reportes ni auditoria)      -> ${r.usuario}`);
  console.log("");
  if (tipos) console.log(`  Se cargaron ${tipos} tipos de vehiculo base (Camioneta, Camion, Maquinaria, etc.). Vehiculos y choferes: sin datos, los cargas vos.`);
  console.log(`  Si se crearon ahora, las contrasenas son:  admin = ${CLAVE_ADMIN}   usuario = ${CLAVE_USUARIO}`);
  console.log("");
})().catch((e) => {
  console.error("");
  console.error("  [ERROR] No se pudo preparar la base de datos: " + e.message);
  console.error("  Verifica que MySQL este encendido y que los datos DB_* del archivo .env sean correctos.");
  console.error("");
  process.exit(1);
});
