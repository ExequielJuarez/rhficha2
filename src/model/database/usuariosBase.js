// Usuarios base del sistema (se crean solos al usar el ejecutable de Windows o `npm run usuarios`):
//   · admin   → rol Administrador: ve TODO (incluye Reportes/gastos, Auditoría, Usuarios y Roles).
//   · usuario → rol "Usuario": solo lo operativo (Vehículos, Choferes, Mantenimientos, Herramientas,
//               Alertas y Siniestros). NO ve Reportes (panel de gastos), Auditoría, Usuarios ni Roles.
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const { credenciales } = require("./preparar");

const ROL_USUARIO = "Usuario";
const PERMISOS_USUARIO = ["Vehicles", "Choferes", "Mantenimientos", "Tools", "Alertas", "Siniestros"];

// Asegura el rol y los dos usuarios. No pisa contraseñas de usuarios que ya existen,
// salvo que se pida `resetear`.
async function asegurarUsuarios({ adminPassword, usuarioPassword, resetear = false } = {}) {
  const conexion = await mysql.createConnection({ ...credenciales(), multipleStatements: false });
  try {
    const resultado = { admin: "sin cambios", usuario: "sin cambios" };

    const [[rolAdmin]] = await conexion.query("SELECT id_rol, permisos FROM rol WHERE nombre = 'Administrador' LIMIT 1");
    if (!rolAdmin) throw new Error("Falta el rol Administrador en la base de datos.");

    // Rol "Usuario" (operativo)
    let [[rolUsuario]] = await conexion.query("SELECT id_rol FROM rol WHERE nombre = ? LIMIT 1", [ROL_USUARIO]);
    if (!rolUsuario) {
      const [r] = await conexion.query("INSERT INTO rol (nombre, descripcion, permisos) VALUES (?, ?, ?)", [
        ROL_USUARIO,
        "Uso diario: vehículos, choferes, mantenimientos, herramientas, alertas y siniestros (sin reportes, auditoría ni usuarios)",
        PERMISOS_USUARIO.join(","),
      ]);
      rolUsuario = { id_rol: r.insertId };
    }

    const asegurar = async (nombreUsuario, nombre, apellido, idRol, permisos, clave, etiqueta) => {
      const [[existente]] = await conexion.query("SELECT id_usuario FROM usuario WHERE nombre_usuario = ?", [nombreUsuario]);
      const hash = bcrypt.hashSync(clave, 10);
      if (!existente) {
        await conexion.query(
          "INSERT INTO usuario (nombre_usuario, contrasena, nombre, apellido, activo, id_rol, permisos) VALUES (?, ?, ?, ?, 1, ?, ?)",
          [nombreUsuario, hash, nombre, apellido, idRol, permisos],
        );
        resultado[etiqueta] = "creado";
      } else if (resetear) {
        await conexion.query("UPDATE usuario SET contrasena = ?, activo = 1, id_rol = ?, permisos = ? WHERE id_usuario = ?", [hash, idRol, permisos, existente.id_usuario]);
        resultado[etiqueta] = "restablecido";
      }
    };

    // admin: hereda todos los permisos del rol Administrador (permisos NULL → siempre ve todo)
    await asegurar("admin", "Administrador", "Sistema", rolAdmin.id_rol, rolAdmin.permisos, adminPassword, "admin");
    // usuario: hereda los permisos del rol "Usuario"
    await asegurar("usuario", "Usuario", "Operativo", rolUsuario.id_rol, null, usuarioPassword, "usuario");
    return resultado;
  } finally {
    await conexion.end();
  }
}

module.exports = { asegurarUsuarios, ROL_USUARIO, PERMISOS_USUARIO };
