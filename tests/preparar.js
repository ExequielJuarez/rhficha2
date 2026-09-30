require("dotenv").config({ quiet: true });
// Prepara una base de datos de PRUEBA (vehiculos_test) a partir de pruebasdb/copiaseguridad.sql.
// Nunca toca la base real: fuerza el nombre de la base antes de cargar la aplicación.
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

process.env.DB_NAME = process.env.TEST_DB_NAME || "vehiculos_test";
process.env.DB_USER = process.env.DB_USER || "root";
process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "secreto-de-pruebas";

async function reiniciarBase() {
  const sql = fs
    .readFileSync(path.join(__dirname, "../pruebasdb/copiaseguridad.sql"), "utf8")
    .replace(/`vehiculos_db`/g, "`" + process.env.DB_NAME + "`");

  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || undefined,
    multipleStatements: true,
  });
  await conexion.query(sql);
  await conexion.end();
}

module.exports = { reiniciarBase };
