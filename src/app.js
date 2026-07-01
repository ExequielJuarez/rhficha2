require("dotenv").config();
const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const cron = require("node-cron"); // ← AGREGAR

const db = require("./model/database/models");
const alertaService = require("./data/alertaService"); // ← AGREGAR

const app = express();

const indexRouter = require("./routes/index.Routes");

const puerto = 3000;

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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

app.use((req, res, next) => {
  res.locals.usuarioLocal = req.session.usuarioLogueado || null;
  next();
});

app.get("/reset", (req, res) => {
  req.session.destroy();
  res.send("Sesión destruida. Ahora vuelve a /InicioSesion");
});

app.use("/", indexRouter);

db.sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Conexión a la base de datos MySQL establecida con éxito.");

    db.sequelize.sync({ force: false });

    // ── GENERAR ALERTAS AL ARRANCAR ──────────────────────────
    console.log("🔔 Generando alertas iniciales...");
    alertaService.generarAlertasLicencias();
    alertaService.generarAlertasVehiculos();

    // ── CRON: TODOS LOS DÍAS A LAS 6AM ───────────────────────
    cron.schedule("0 6 * * *", () => {
      console.log("🔔 Generando alertas automáticas diarias...");
      alertaService.generarAlertasLicencias();
      alertaService.generarAlertasVehiculos();
    });

    app.listen(puerto, () => {
      console.log(`🚀 Servidor Express corriendo en el puerto ${puerto}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error al conectar con la base de datos:", error);
  });