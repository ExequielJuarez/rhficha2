// Prepara la base de datos al arrancar la aplicación:
//   1. crea la base si no existe,
//   2. si está vacía, crea las tablas (pruebasdb/esquema.sql),
//   3. si no hay usuarios, crea el administrador inicial.
// Así la aplicación arranca sola en una máquina nueva, sin importar nada a mano.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const ARCHIVO_ESQUEMA = path.join(__dirname, "../../../pruebasdb/esquema.sql");

const credenciales = () => {
  const dev = require("./config/database.json").development;
  return {
    host: process.env.DB_HOST || dev.host || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || dev.username,
    password: process.env.DB_PASSWORD || dev.password || undefined,
    database: process.env.DB_NAME || dev.database,
  };
};

// Migraciones idempotentes: actualizan bases creadas con versiones anteriores del esquema.
async function migrar(conexion) {
  const existeColumna = async (tabla, columna) => {
    const [r] = await conexion.query(`SHOW COLUMNS FROM \`${tabla}\` LIKE ?`, [columna]);
    return r.length > 0;
  };
  const tipoColumna = async (tabla, columna) => {
    const [r] = await conexion.query(`SHOW COLUMNS FROM \`${tabla}\` LIKE ?`, [columna]);
    return r.length ? String(r[0].Type) : "";
  };

  // Alertas: nuevos tipos (asignaciones vencidas y stock bajo de repuestos)
  const tiposAlerta = await tipoColumna("alerta", "tipo");
  if (tiposAlerta && (!tiposAlerta.includes("asignacion_vencida") || !tiposAlerta.includes("stock_bajo"))) {
    await conexion.query(
      "ALTER TABLE alerta MODIFY tipo ENUM('licencia_vencida','licencia_proxima','mantenimiento_pendiente','mantenimiento_finalizado','mantenimiento_proximo','mantenimiento_vencido','documentacion_vencida','vehiculo_fuera_servicio','vehiculo_en_mantenimiento','herramienta_devuelta','prestamo_vencido','asignacion_vencida','stock_bajo','siniestro_activo','critica','informativa') NOT NULL",
    );
  }

  // Repuestos: stock mínimo para avisar cuando queda poco
  if (!(await existeColumna("repuestos", "stock_minimo"))) {
    await conexion.query("ALTER TABLE repuestos ADD COLUMN stock_minimo INT NOT NULL DEFAULT 3 AFTER stock");
  }

  // Tipos de vehículo: unidad de medida de uso (km u horas)
  if (!(await existeColumna("tipo_vehiculo", "unidad"))) {
    await conexion.query("ALTER TABLE tipo_vehiculo ADD COLUMN unidad VARCHAR(10) NOT NULL DEFAULT 'km'");
    await conexion.query("UPDATE tipo_vehiculo SET unidad='hs' WHERE descripcion LIKE '%aquinaria%'");
  }

  // Auditoría: permite registrar eventos sin usuario (intentos de login con un usuario inexistente)
  const [colAud] = await conexion.query("SHOW COLUMNS FROM auditoria LIKE 'id_usuario'");
  if (colAud.length && colAud[0].Null === "NO") {
    await conexion.query("ALTER TABLE auditoria MODIFY id_usuario INT NULL");
  }

  // Usuarios: sin permisos propios = heredan los del rol
  const [colPerm] = await conexion.query("SHOW COLUMNS FROM usuario LIKE 'permisos'");
  if (colPerm.length && colPerm[0].Default !== null) {
    await conexion.query("ALTER TABLE usuario MODIFY permisos VARCHAR(255) NULL DEFAULT NULL");
  }

  // Mantenimientos: "Pendiente" pasó a llamarse "Programado"
  await conexion.query("UPDATE mantenimiento SET estado='Programado' WHERE estado='Pendiente'");
}

async function prepararBaseDeDatos() {
  const { database, ...conexionSinBase } = credenciales();
  if (!/^[A-Za-z0-9_]+$/.test(database)) throw new Error("Nombre de base de datos inválido: " + database);

  // 1) Crear la base si no existe
  const admin = await mysql.createConnection(conexionSinBase);
  try {
    await admin.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
  } finally {
    await admin.end();
  }

  const conexion = await mysql.createConnection({ ...conexionSinBase, database, multipleStatements: true });
  try {
    // 2) Crear las tablas si la base está vacía
    const [tablas] = await conexion.query("SHOW TABLES LIKE 'usuario'");
    let baseNueva = false;
    if (tablas.length === 0) {
      console.log("🛠️  Base de datos vacía: creando las tablas...");
      await conexion.query(fs.readFileSync(ARCHIVO_ESQUEMA, "utf8"));
      baseNueva = true;
    }

    // 2b) Actualizar bases creadas con versiones anteriores
    await migrar(conexion);

    // 3) Crear el administrador inicial si no hay usuarios
    const [[{ total }]] = await conexion.query("SELECT COUNT(*) AS total FROM usuario");
    if (total === 0) {
      let clave = process.env.ADMIN_PASSWORD;
      let generada = false;
      if (!clave) {
        if (process.env.NODE_ENV === "production") {
          clave = crypto.randomBytes(9).toString("base64url");
          generada = true;
        } else {
          clave = "Ficha2026!";
        }
      }
      const [[rol]] = await conexion.query("SELECT id_rol, permisos FROM rol WHERE nombre = 'Administrador' LIMIT 1");
      if (!rol) throw new Error("Falta el rol Administrador en la base de datos (cargá pruebasdb/esquema.sql).");
      await conexion.query(
        "INSERT INTO usuario (nombre_usuario, contrasena, nombre, apellido, activo, id_rol, permisos) VALUES ('admin', ?, 'Administrador', 'Sistema', 1, ?, ?)",
        [bcrypt.hashSync(clave, 10), rol.id_rol, rol.permisos],
      );
      console.log(`👤 Usuario administrador creado → usuario: admin | contraseña: ${clave}${generada ? " (generada: guardala y cambiala)" : ""}`);
      if (!process.env.ADMIN_PASSWORD && !generada) console.log("   Cambiá esa contraseña al ingresar (Usuarios > Editar).");
    }
    return { baseNueva };
  } finally {
    await conexion.end();
  }
}

module.exports = { prepararBaseDeDatos };
