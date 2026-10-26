// Las pruebas BORRAN y recrean bases (vehiculos_test, etc.). Solo se permiten contra un MySQL local
// para no tocar jamás una base real/remota. (Para forzarlo: TEST_PERMITIR_REMOTO=1.)
require("dotenv").config({ quiet: true });
const host = String(process.env.DB_HOST || "127.0.0.1").toLowerCase();
const local = ["127.0.0.1", "localhost", "::1"].includes(host);
if (!local && process.env.TEST_PERMITIR_REMOTO !== "1") {
  throw new Error(
    `Por seguridad las pruebas no corren contra un MySQL remoto (DB_HOST=${host}). ` +
      "Usá un MySQL local (DB_HOST=127.0.0.1) o definí TEST_PERMITIR_REMOTO=1 bajo tu responsabilidad.",
  );
}
