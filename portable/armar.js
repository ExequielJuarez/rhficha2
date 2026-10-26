// Arma la carpeta portable (sin instalar nada en la PC de destino):
//   dist/FichaTecnicaPortable/   → Node.js + MariaDB + el sistema + iniciar.bat
//   dist/FichaTecnicaPortable.zip
//
// Uso (con internet):   npm run portable
// Si la descarga automática falla, bajá los .zip a mano y dejalos en portable/descargas/
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const RAIZ = path.join(__dirname, "..");
const NOMBRE = "FichaTecnicaPortable";
const DIST = path.join(RAIZ, "dist", NOMBRE);
const CACHE = path.join(__dirname, "descargas");
const TMP = path.join(RAIZ, "dist", "_tmp");
const ES_WIN = process.platform === "win32";

const NODE_VERSION = process.version; // la misma que usás vos
const MARIADB_VERSION = process.env.MARIADB_VERSION || "10.11.14"; // serie LTS 10.11

const ZIPS = {
  node: {
    archivo: `node-${NODE_VERSION}-win-x64.zip`,
    urls: [`https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-win-x64.zip`],
  },
  mariadb: {
    archivo: `mariadb-${MARIADB_VERSION}-winx64.zip`,
    urls: [`https://archive.mariadb.org/mariadb-${MARIADB_VERSION}/winx64-packages/mariadb-${MARIADB_VERSION}-winx64.zip`],
  },
};

const log = (m) => console.log(`\n▶ ${m}`);
const borrar = (p) => fs.rmSync(p, { recursive: true, force: true });
const ejecutar = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: ES_WIN, ...opts });
  if (r.status !== 0) throw new Error(`Falló: ${cmd} ${args.join(" ")}`);
};

async function descargar({ archivo, urls }) {
  const destino = path.join(CACHE, archivo);
  if (fs.existsSync(destino) && fs.statSync(destino).size > 1e6) {
    console.log(`  (ya descargado: ${archivo})`);
    return destino;
  }
  fs.mkdirSync(CACHE, { recursive: true });
  for (const url of urls) {
    try {
      console.log(`  Descargando ${url}`);
      const r = await fetch(url, { redirect: "follow" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const total = Number(r.headers.get("content-length")) || 0;
      const salida = fs.createWriteStream(destino + ".parcial");
      let bajado = 0,
        ultimo = 0;
      for await (const trozo of r.body) {
        salida.write(trozo);
        bajado += trozo.length;
        if (total && bajado - ultimo > 5e6) {
          ultimo = bajado;
          process.stdout.write(`\r  ${(bajado / 1e6).toFixed(0)} / ${(total / 1e6).toFixed(0)} MB`);
        }
      }
      await new Promise((ok) => salida.end(ok));
      fs.renameSync(destino + ".parcial", destino);
      console.log("\n  Listo.");
      return destino;
    } catch (e) {
      console.log(`  No se pudo (${e.message}).`);
    }
  }
  throw new Error(
    `No se pudo descargar ${archivo}.\n` +
      `Bajalo a mano desde ${urls[0]} (o desde mariadb.org/download → Windows ZIP) y dejalo en:\n  ${destino}\nLuego volvé a correr el comando.`,
  );
}

// En Windows se usa SIEMPRE el tar.exe del sistema: en Git Bash el "tar" es el de GNU y
// confunde "C:\carpeta" con una computadora remota ("Cannot connect to C").
const TAR_WINDOWS = path.join(process.env.SystemRoot || "C:\\Windows", "System32", "tar.exe");

function descomprimir(zip, destino) {
  fs.mkdirSync(destino, { recursive: true });
  if (ES_WIN) ejecutar(TAR_WINDOWS, ["-xf", zip, "-C", destino], { shell: false });
  else ejecutar("unzip", ["-q", "-o", zip, "-d", destino]);
}

const copiarCarpeta = (de, a, filtro) => fs.cpSync(de, a, { recursive: true, filter: filtro || (() => true) });

// Archivos de texto de Windows: finales de línea CRLF
const copiarWindows = (de, a) => fs.writeFileSync(a, fs.readFileSync(de, "utf8").replace(/\r?\n/g, "\r\n"));

// Fotos subidas durante el desarrollo: no se entregan al cliente
const SUBIDOS = /(^|[\\/])(chofer|vehiculo|siniestro)-\d+\.[a-z0-9]+$/i;

(async () => {
  console.log(`Armando el paquete portable (Node ${NODE_VERSION} · MariaDB ${MARIADB_VERSION})`);
  borrar(DIST);
  borrar(TMP);
  fs.mkdirSync(DIST, { recursive: true });

  log("1/6 Descargando Node.js y MariaDB para Windows");
  const zipNode = await descargar(ZIPS.node);
  const zipMaria = await descargar(ZIPS.mariadb);

  log("2/6 Node.js portable");
  descomprimir(zipNode, path.join(TMP, "node"));
  const carpetaNode = fs.readdirSync(path.join(TMP, "node"))[0];
  fs.mkdirSync(path.join(DIST, "node"));
  fs.copyFileSync(path.join(TMP, "node", carpetaNode, "node.exe"), path.join(DIST, "node", "node.exe"));

  log("3/6 MariaDB portable");
  descomprimir(zipMaria, path.join(TMP, "mariadb"));
  const carpetaMaria = fs.readdirSync(path.join(TMP, "mariadb"))[0];
  const destinoMaria = path.join(DIST, "mariadb");
  fs.renameSync(path.join(TMP, "mariadb", carpetaMaria), destinoMaria);
  for (const sobrante of ["mysql-test", "sql-bench", "include", "data"]) borrar(path.join(destinoMaria, sobrante));
  // Los .bat usan los nombres "mariadb-*.exe"; en algunas versiones solo existen los "mysql*.exe"
  const bin = path.join(destinoMaria, "bin");
  for (const [nuevo, viejo] of [
    ["mariadbd.exe", "mysqld.exe"],
    ["mariadb-admin.exe", "mysqladmin.exe"],
    ["mariadb-dump.exe", "mysqldump.exe"],
    ["mariadb.exe", "mysql.exe"],
    ["mariadb-install-db.exe", "mysql_install_db.exe"],
  ]) {
    if (!fs.existsSync(path.join(bin, nuevo)) && fs.existsSync(path.join(bin, viejo))) fs.copyFileSync(path.join(bin, viejo), path.join(bin, nuevo));
  }
  const faltan = ["mariadbd.exe", "mariadb-admin.exe", "mariadb-dump.exe", "mariadb.exe", "mariadb-install-db.exe"].filter((f) => !fs.existsSync(path.join(bin, f)));
  if (faltan.length) throw new Error(`El zip de MariaDB no trae: ${faltan.join(", ")}`);

  log("4/6 El sistema (código + dependencias de producción)");
  const app = path.join(DIST, "app");
  fs.mkdirSync(app);
  const permitido = (origen) => {
    const rel = path.relative(RAIZ, origen).split(path.sep).join("/");
    if (SUBIDOS.test(rel)) return false;
    if (rel.startsWith("pruebasdb/") && rel !== "pruebasdb/esquema.sql") return false; // solo el esquema (la base se crea sola)
    if (rel.startsWith("scripts/") && !["scripts/crear-usuarios.js", "scripts/limpiar-datos.js"].includes(rel)) return false;
    return true;
  };
  for (const carpeta of ["src", "public", "pruebasdb", "scripts"]) copiarCarpeta(path.join(RAIZ, carpeta), path.join(app, carpeta), permitido);
  const pk = JSON.parse(fs.readFileSync(path.join(RAIZ, "package.json"), "utf8"));
  const minimo = { name: "ficha-tecnica", version: pk.version, private: true, main: "src/app.js", dependencies: pk.dependencies };
  fs.writeFileSync(path.join(app, "package.json"), JSON.stringify(minimo, null, 2));
  if (fs.existsSync(path.join(RAIZ, "package-lock.json"))) fs.copyFileSync(path.join(RAIZ, "package-lock.json"), path.join(app, "package-lock.json"));
  ejecutar("npm", ["install", "--omit=dev", "--no-audit", "--no-fund"], { cwd: app });

  log("5/6 Scripts de inicio y guía");
  for (const f of fs.readdirSync(path.join(__dirname, "plantilla"))) copiarWindows(path.join(__dirname, "plantilla", f), path.join(DIST, f));
  fs.mkdirSync(path.join(DIST, "datos"));
  fs.mkdirSync(path.join(DIST, "respaldos"));

  log("6/6 Comprimiendo");
  borrar(TMP);
  const zip = path.join(RAIZ, "dist", `${NOMBRE}.zip`);
  borrar(zip);
  if (ES_WIN) ejecutar(TAR_WINDOWS, ["-a", "-c", "-f", zip, "-C", path.join(RAIZ, "dist"), NOMBRE], { shell: false });
  else ejecutar("zip", ["-qr", zip, NOMBRE], { cwd: path.join(RAIZ, "dist") });

  console.log(`\n✅ Listo:\n   Carpeta: ${DIST}\n   Zip:     ${zip}\n   Descomprimilo en C:\\FichaTecnica y abrí iniciar.bat (no hay que instalar nada).`);
})().catch((e) => {
  console.error("\n❌", e.message);
  process.exit(1);
});
