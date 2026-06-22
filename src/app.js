require("dotenv").config();
// ... el resto de tus requires/imports (express, rutas, etc.) abajo
const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session"); // PASO 1: Importamos la librería de sesiones

// 1. Importar la base de datos (esto llama al index.js de models)
const db = require("./model/database/models");

const app = express();

// Importar rutas
const indexRouter = require("./routes/index.Routes");

// Puerto
const puerto = 3000;

// Archivos estáticos
app.use(express.static(path.join(__dirname, "../public")));

// Procesar formularios
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Permitir métodos PUT y DELETE
app.use(methodOverride("_method"));

// Configuración de EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Configuración de Sesiones (PASO 1: Debe ir ANTES de las rutas)
app.use(
  session({
    secret: "Secreto_FichaTecnica_123",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// Megáfono global: Pasa los datos de la sesión a todas las vistas EJS
app.use((req, res, next) => {
  // Creamos una variable global llamada "usuarioLocal" que el HTML podrá leer
  res.locals.usuarioLocal = req.session.usuarioLogueado || null;
  next();
});

// RUTA DE EMERGENCIA: Borra la sesión actual
app.get("/reset", (req, res) => {
  req.session.destroy();
  res.send("Sesión destruida. Ahora vuelve a /InicioSesion");
});

// Rutas
app.use("/", indexRouter);

// 2. Autenticar la conexión a la base de datos y luego iniciar el servidor
db.sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Conexión a la base de datos MySQL establecida con éxito.");

    // Opcional: Si quieres que Sequelize cree las tablas por ti si no existen, descomenta la siguiente línea:
    db.sequelize.sync({ force: false });

    // Iniciar servidor
    app.listen(puerto, () => {
      console.log(`🚀 Servidor Express corriendo en el puerto ${puerto}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error al conectar con la base de datos:", error);
  });
