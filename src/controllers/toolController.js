const db = require("../model/database/models");
const toolService = require("../data/toolService");
const prestamoService = require("../data/prestamoService");
const auditoriaService = require("../data/auditoriaService");
const alertaService = require("../data/alertaService");
const { ErrorNegocio } = require("../utils/errores");

// Ejecuta una acción, muestra el resultado con un aviso y vuelve a `destino`
const conAviso = (destino, accion, mensajeError) => async (req, res) => {
  try {
    const mensajeOk = await accion(req, res);
    if (mensajeOk) req.flash("ok", mensajeOk);
    return res.redirect(typeof destino === "function" ? destino(req) : destino);
  } catch (error) {
    if (!(error instanceof ErrorNegocio)) console.log(error);
    req.flash("error", error instanceof ErrorNegocio ? error.message : mensajeError);
    return res.redirect(typeof destino === "function" ? destino(req, true) : destino);
  }
};

const toolController = {
  // =========================
  // LISTAR HERRAMIENTAS
  // =========================
  ListTools: async (req, res) => {
    try {
      const herramientas = await toolService.getAll();
      res.render("listadoHerramientas", { herramientas, herramientaSeleccionada: null });
    } catch (error) {
      console.log(error);
      req.flash("error", "Error al obtener herramientas.");
      res.redirect("/Vehicles");
    }
  },

  // =========================
  // LISTAR TODOS LOS PRÉSTAMOS (GLOBAL)
  // =========================
  ListPrestamos: async (req, res) => {
    try {
      const prestamos = await db.Prestamo.findAll({
        include: [{ association: "herramienta" }],
        order: [["fecha_salida", "DESC"], ["id_prestamo", "DESC"]],
      });
      res.render("listadoPrestamos", { prestamos });
    } catch (error) {
      console.log(error);
      req.flash("error", "Error al obtener el historial de préstamos.");
      res.redirect("/Tools");
    }
  },

  // =========================
  // DETALLE DE HERRAMIENTA
  // =========================
  getToolById: async (req, res) => {
    try {
      const herramienta = await toolService.getWithPrestamos(req.params.id);
      if (!herramienta) {
        req.flash("error", "La herramienta no existe.");
        return res.redirect("/Tools");
      }
      const herramientas = await toolService.getAll();
      res.render("listadoHerramientas", { herramientas, herramientaSeleccionada: herramienta });
    } catch (error) {
      console.log(error);
      req.flash("error", "Error al obtener la herramienta y su historial.");
      res.redirect("/Tools");
    }
  },

  // =========================
  // FORMULARIO CARGA HERRAMIENTA
  // =========================
  CargaHerramienta: async (req, res) => {
    try {
      const sectores = await db.Sector.findAll({ order: [["nombre", "ASC"]] });
      res.render("CargaFichaHerramienta", { sectores });
    } catch (error) {
      console.log(error);
      req.flash("error", "Error al cargar el formulario.");
      res.redirect("/Tools");
    }
  },

  processTool: async (req, res) => {
    try {
      const herramienta = await toolService.create(req);
      await auditoriaService.desdeRequest(req, "herramienta", herramienta.id_herramienta, "CREAR", null, herramienta.toJSON(), `Alta de herramienta: ${herramienta.nombre} (${herramienta.codigo_activo})`);
      req.flash("ok", "Herramienta registrada correctamente.");
      res.redirect("/Tools/" + herramienta.id_herramienta);
    } catch (error) {
      if (!(error instanceof ErrorNegocio)) console.log(error);
      req.flash("error", error instanceof ErrorNegocio ? error.message : "No se pudo guardar la herramienta.");
      res.redirect("/Tools/Carga");
    }
  },

  // =========================
  // EDICIÓN
  // =========================
  EditHerramienta: async (req, res) => {
    try {
      const herramienta = await toolService.getOne(req.params.id);
      if (!herramienta) {
        req.flash("error", "La herramienta no existe.");
        return res.redirect("/Tools");
      }
      const sectores = await db.Sector.findAll({ order: [["nombre", "ASC"]] });
      res.render("EditarHerramienta", { herramienta, sectores });
    } catch (error) {
      console.log(error);
      req.flash("error", "Error al cargar el formulario de edición.");
      res.redirect("/Tools");
    }
  },

  processEditTool: conAviso(
    (req) => "/Tools/" + req.params.id,
    async (req) => {
      const { anterior, nuevo } = await toolService.update(req);
      await auditoriaService.desdeRequest(req, "herramienta", req.params.id, "EDITAR", anterior, nuevo, `Edición de herramienta ID: ${req.params.id} (${nuevo.nombre})`);
      return "Herramienta actualizada.";
    },
    "No se pudo actualizar la herramienta.",
  ),

  // =========================
  // ELIMINAR
  // =========================
  deleteTool: conAviso(
    "/Tools",
    async (req) => {
      const { snapshot, historial } = await toolService.delete(req.params.id);
      await auditoriaService.desdeRequest(
        req,
        "herramienta",
        snapshot.id_herramienta,
        "ELIMINAR",
        snapshot,
        null,
        `Baja de herramienta: ${snapshot.nombre} (${snapshot.codigo_activo}). Se eliminaron ${historial} préstamo(s) de su historial.`,
      );
      return "Herramienta eliminada.";
    },
    "No se pudo eliminar la herramienta.",
  ),

  // =========================
  // PRÉSTAMOS
  // =========================
  CargaPrestamo: async (req, res) => {
    try {
      const herramienta = await toolService.getOne(req.params.id);
      if (!herramienta) {
        req.flash("error", "La herramienta no existe.");
        return res.redirect("/Tools");
      }
      const operarios = await db.Operario.findAll({ where: { estado: "Activo" }, order: [["nombre", "ASC"]] });
      const sectores = await db.Sector.findAll({ order: [["nombre", "ASC"]] });
      res.render("CargaPrestamo", { herramienta, operarios, sectores });
    } catch (error) {
      console.log(error);
      req.flash("error", "Error al cargar el formulario de préstamo.");
      res.redirect("/Tools");
    }
  },

  processPrestamo: conAviso(
    (req, error) => (error ? "/Tools/Prestamo/" + req.body.id_herramienta : "/Tools/" + req.body.id_herramienta),
    async (req) => {
      const { prestamo, herramienta } = await prestamoService.create(req.body);
      await auditoriaService.desdeRequest(
        req,
        "prestamo",
        prestamo.id_prestamo,
        "CREAR",
        null,
        prestamo.toJSON(),
        `Préstamo de ${herramienta.nombre} a ${prestamo.nombre_operario} (${prestamo.sector_destino})`,
      );
      alertaService.generarAlertasPrestamos();
      return "Préstamo registrado.";
    },
    "No se pudo registrar el préstamo.",
  ),

  processDevolucion: conAviso(
    (req) => (req.headers.referer && req.headers.referer.includes("/Tools/Prestamos") ? "/Tools/Prestamos" : "/Tools/" + req.body.id_herramienta),
    async (req) => {
      const { prestamo, herramienta } = await prestamoService.devolver({
        id_herramienta: req.body.id_herramienta,
        id_prestamo: req.body.id_prestamo,
      });
      await auditoriaService.desdeRequest(
        req,
        "prestamo",
        prestamo.id_prestamo,
        "EDITAR",
        { estado_prestamo: "Activo" },
        { estado_prestamo: "Finalizado" },
        `Devolución de ${herramienta ? herramienta.nombre : "herramienta"} por ${prestamo.nombre_operario}`,
      );
      alertaService.generarAlertasPrestamos();
      return "Devolución registrada.";
    },
    "No se pudo registrar la devolución.",
  ),

  // =========================
  // AJUSTES (SECTORES Y OPERARIOS)
  // =========================
  Ajustes: async (req, res) => {
    try {
      const sectores = await db.Sector.findAll({ order: [["nombre", "ASC"]] });
      const operarios = await db.Operario.findAll({ order: [["nombre", "ASC"]] });
      res.render("Ajustes", { sectores, operarios });
    } catch (error) {
      console.log(error);
      req.flash("error", "Error al cargar la configuración.");
      res.redirect("/Tools");
    }
  },

  createSector: conAviso(
    "/Tools/Ajustes",
    async (req) => {
      const nombre = String(req.body.nombre || "").trim();
      if (!nombre || nombre.length > 100) throw new ErrorNegocio("Ingresá el nombre del sector (hasta 100 caracteres).");
      if (await db.Sector.findOne({ where: { nombre } })) throw new ErrorNegocio(`El sector "${nombre}" ya existe.`);
      const sector = await db.Sector.create({ nombre });
      await auditoriaService.desdeRequest(req, "sector", sector.id_sector, "CREAR", null, { nombre }, `Alta de sector: ${nombre}`);
      return "Sector agregado.";
    },
    "No se pudo crear el sector.",
  ),

  deleteSector: conAviso(
    "/Tools/Ajustes",
    async (req) => {
      const sector = await db.Sector.findByPk(req.params.id);
      if (!sector) throw new ErrorNegocio("El sector no existe.");
      const usos = (await db.Herramienta.count({ where: { sector: sector.nombre } })) + (await db.Prestamo.count({ where: { sector_destino: sector.nombre } }));
      if (usos > 0) throw new ErrorNegocio(`No se puede eliminar "${sector.nombre}": está en uso en herramientas o préstamos.`);
      await sector.destroy();
      await auditoriaService.desdeRequest(req, "sector", sector.id_sector, "ELIMINAR", { nombre: sector.nombre }, null, `Baja de sector: ${sector.nombre}`);
      return "Sector eliminado.";
    },
    "No se pudo eliminar el sector.",
  ),

  createOperario: conAviso(
    "/Tools/Ajustes",
    async (req) => {
      const nombre = String(req.body.nombre || "").trim();
      if (!nombre || nombre.length > 100) throw new ErrorNegocio("Ingresá el nombre del operario (hasta 100 caracteres).");
      if (await db.Operario.findOne({ where: { nombre } })) throw new ErrorNegocio(`El operario "${nombre}" ya existe.`);
      const operario = await db.Operario.create({ nombre, estado: "Activo" });
      await auditoriaService.desdeRequest(req, "operario", operario.id_operario, "CREAR", null, { nombre }, `Alta de operario: ${nombre}`);
      return "Operario agregado.";
    },
    "No se pudo crear el operario.",
  ),

  deleteOperario: conAviso(
    "/Tools/Ajustes",
    async (req) => {
      const operario = await db.Operario.findByPk(req.params.id);
      if (!operario) throw new ErrorNegocio("El operario no existe.");
      const activos = await db.Prestamo.count({ where: { nombre_operario: operario.nombre, estado_prestamo: "Activo" } });
      if (activos > 0) throw new ErrorNegocio(`No se puede eliminar a "${operario.nombre}": tiene ${activos} préstamo(s) activo(s).`);
      await operario.destroy();
      await auditoriaService.desdeRequest(req, "operario", operario.id_operario, "ELIMINAR", { nombre: operario.nombre }, null, `Baja de operario: ${operario.nombre}`);
      return "Operario eliminado.";
    },
    "No se pudo eliminar el operario.",
  ),
};

module.exports = toolController;
