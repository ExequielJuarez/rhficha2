const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const uploadDir = path.join(__dirname, "../../public/img/licencias");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, "chofer-" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

const uploadSiniestrosDir = path.join(__dirname, "../../public/img/siniestros");

const storageSiniestros = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(uploadSiniestrosDir)) {
      fs.mkdirSync(uploadSiniestrosDir, { recursive: true });
    }
    cb(null, uploadSiniestrosDir);
  },
  filename: function (req, file, cb) {
    cb(null, "siniestro-" + Date.now() + path.extname(file.originalname));
  },
});
const uploadSiniestro = multer({ storage: storageSiniestros });

const auditoriaController = require("../controllers/auditoriaController");
const vehicleController = require("../controllers/vehicleController");
const userController = require("../controllers/userController");
const choferController = require("../controllers/choferController");
const toolController = require("../controllers/toolController");
const assignmentController = require("../controllers/assignmentController");
const authMiddleware = require("../middlewares/authMiddleware");
const { choferVAlidation, choferEditValidation } = require("../validations/choferValidation");
const alertaController = require("../controllers/alertaController");
const reporteController = require("../controllers/reporteController");
const siniestroController = require("../controllers/siniestroController");

router.use((req, res, next) => {
  if (req.session && req.session.usuarioLogueado) {
    res.locals.usuarioLogueado = req.session.usuarioLogueado;
  } else {
    res.locals.usuarioLogueado = null;
  }
  next();
});

router.get("/InicioSesion", userController.InicioSesion);
router.post("/InicioSesion", userController.ProcesoIniciarSesion);
router.get("/CerrarSesion", userController.CerrarSesion);

router.get("/Usuarios", authMiddleware, userController.ListarUsuarios);
router.get("/Usuarios/Roles", authMiddleware, userController.ListarRoles);
router.get("/Usuarios/Carga", authMiddleware, userController.CargaUsuario);
router.post("/Usuarios/Carga", authMiddleware, userController.ProcesoCargaUsuario);
router.get("/Usuarios/Editar/:id", authMiddleware, userController.EditarUsuario);
router.post("/Usuarios/Editar/:id", authMiddleware, userController.ProcesoEditarUsuario);
router.get("/Usuarios/Roles/Editar/:id", authMiddleware, userController.EditarRol);
router.post("/Usuarios/Roles/Editar/:id", authMiddleware, userController.ProcesoEditarRol);

router.get("/Vehicles/Ajustes", authMiddleware, vehicleController.Ajustes);
router.post("/Vehicles/Ajustes/Distritos", authMiddleware, vehicleController.createDistrito);
router.post("/Vehicles/Ajustes/Distritos/Eliminar/:id", authMiddleware, vehicleController.deleteDistrito);
router.post("/Vehicles/Ajustes/Tipos", authMiddleware, vehicleController.createTipo);
router.post("/Vehicles/Ajustes/Tipos/Eliminar/:id", authMiddleware, vehicleController.deleteTipo);

router.get("/Vehicles/Editar/:id", authMiddleware, vehicleController.EditVehiculo);
router.post("/Vehicles/Editar/:id", authMiddleware, vehicleController.processEditVehiculo);
router.get("/Vehicles", authMiddleware, vehicleController.ListVehicles);
router.get("/Vehicles/:id", authMiddleware, vehicleController.getVehicleById);
router.get("/CargaVehiculo", authMiddleware, vehicleController.CargaVehiculo);
router.post("/CargaVehiculo", authMiddleware, vehicleController.processVehicle);
router.get("/ActualizarKm", authMiddleware, vehicleController.CargaActualizarKm);
router.post("/ActualizarKm", authMiddleware, vehicleController.processActualizarKm);

// ================= RUTAS NUEVAS: REPUESTOS =================
router.get("/Repuestos/Gestionar", authMiddleware, vehicleController.GestionarRepuestos);
router.post("/Repuestos/Agregar", authMiddleware, vehicleController.createRepuesto);
router.post("/Repuestos/Eliminar/:id", authMiddleware, vehicleController.deleteRepuesto);
// =========================================================

router.get("/Mantenimientos", authMiddleware, vehicleController.Mantenimientos);
router.post('/Mantenimientos/:id/estado', vehicleController.updateEstadoMantenimiento);
router.get("/Mantenimientos/carga/:id_vehiculo", authMiddleware, vehicleController.CargaVMantenimiento);
router.get("/Mantenimientos/carga", authMiddleware, vehicleController.CargaVMantenimiento);
router.post("/CargaMantenimiento", authMiddleware, vehicleController.processMaintenance);

router.get("/Choferes", authMiddleware, choferController.ListChoferes);
router.get("/Choferes/Carga", authMiddleware, choferController.createChofer);
router.post("/Choferes/Carga", authMiddleware, upload.single("imagen"), choferVAlidation(), choferController.processChofer);
router.get("/Choferes/:id/editar", authMiddleware, choferController.editChofer);
router.post("/Choferes/:id/editar", authMiddleware, upload.single("imagen"), choferEditValidation(), choferController.processEdit);
router.post("/Choferes/:id/desactivar", authMiddleware, choferController.desactivarChofer);
router.post("/Choferes/:id/activar", authMiddleware, choferController.activarChofer);

router.get("/asignaciones", authMiddleware, assignmentController.showForm);
router.post("/asignaciones", authMiddleware, assignmentController.create);
router.post("/asignaciones/:id/finalizar", authMiddleware, assignmentController.finalize);

router.get("/Tools", authMiddleware, toolController.ListTools);
router.get("/Tools/Carga", authMiddleware, toolController.CargaHerramienta);
router.post("/Tools/ProcessCarga", authMiddleware, toolController.processTool);
router.get("/Tools/Editar/:id", authMiddleware, toolController.EditHerramienta);
router.post("/Tools/Editar/:id", authMiddleware, toolController.processEditTool);
router.post("/Tools/Eliminar/:id", authMiddleware, toolController.deleteTool);
router.get("/Tools/Prestamos", authMiddleware, toolController.ListPrestamos);
router.get("/Tools/Prestamo/:id", authMiddleware, toolController.CargaPrestamo);
router.post("/Tools/Prestamo", authMiddleware, toolController.processPrestamo);
router.post("/Tools/Devolucion", authMiddleware, toolController.processDevolucion);
router.get("/Tools/Ajustes", authMiddleware, toolController.Ajustes);
router.post("/Tools/Ajustes/Sectores", authMiddleware, toolController.createSector);
router.post("/Tools/Ajustes/Sectores/Eliminar/:id", authMiddleware, toolController.deleteSector);
router.post("/Tools/Ajustes/Operarios", authMiddleware, toolController.createOperario);
router.post("/Tools/Ajustes/Operarios/Eliminar/:id", authMiddleware, toolController.deleteOperario);
router.get("/Tools/:id", authMiddleware, toolController.getToolById);

router.get("/", (req, res) => res.redirect("/InicioSesion"));

router.get("/Alertas", authMiddleware, alertaController.ListAlertas);
router.get("/Alertas/recientes", authMiddleware, alertaController.getRecientes);
router.post("/Alertas/leer-todas", authMiddleware, alertaController.marcarTodasLeidas);
router.post("/Alertas/:id/leer", authMiddleware, alertaController.marcarLeida);
router.get("/Alertas/:id", authMiddleware, alertaController.detalleAlerta);

router.get("/Auditoria", authMiddleware, auditoriaController.ListarAuditoria);

router.get("/Reportes", authMiddleware, reporteController.vistaReportes);

router.get("/Siniestros", authMiddleware, siniestroController.ListarSiniestros);
router.get("/Siniestros/Carga", authMiddleware, siniestroController.CargaSiniestro);
router.post("/Siniestros/Carga", authMiddleware, uploadSiniestro.array("archivos", 5), siniestroController.ProcesoCarga);
router.post("/Siniestros/:id/Estado", authMiddleware, siniestroController.CambiarEstado);
router.post("/Siniestros/Eliminar/:id", authMiddleware, siniestroController.Eliminar);

module.exports = router;