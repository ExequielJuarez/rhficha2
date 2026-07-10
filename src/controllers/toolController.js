const db = require("../model/database/models");
const toolService = require("../data/toolService");
const prestamoService = require("../data/prestamoService");

const toolController = {
  // =========================
  // LISTAR HERRAMIENTAS
  // =========================
  ListTools: async (req, res) => {
    try {
      const herramientas = await toolService.getAll();
      res.render("listadoHerramientas", {
        herramientas,
        herramientaSeleccionada: null,
      });
    } catch (error) {
      console.log(error);
      console.log("ERROR COMPLETO:");
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
      res.send("Error al obtener herramientas");
    }
  },

  // =========================
  // LISTAR TODOS LOS PRÉSTAMOS (GLOBAL)
  // =========================
  ListPrestamos: async (req, res) => {
    try {
      const prestamos = await db.Prestamo.findAll({
        include: [{ association: "herramienta" }],
        order: [["fecha_salida", "DESC"]],
      });

      res.render("listadoPrestamos", { prestamos });
    } catch (error) {
      console.log("ERROR COMPLETO:");
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
      res.send("Error al obtener el historial global de préstamos");
    }
  },

  // =========================
  // DETALLE DE HERRAMIENTA
  // =========================
  getToolById: async (req, res) => {
    try {
      const id = req.params.id;

      const herramienta = await db.Herramienta.findByPk(id, {
        include: [{ association: "prestamos" }],
      });

      const herramientas = await toolService.getAll();

      res.render("listadoHerramientas", {
        herramientas,
        herramientaSeleccionada: herramienta,
      });
    } catch (error) {
      console.log(error);
      console.log("ERROR COMPLETO:");
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
      res.send("Error al obtener la herramienta y su historial");
    }
  },

  // =========================
  // FORMULARIO CARGA HERRAMIENTA (Actualizado con Sectores)
  // =========================
  CargaHerramienta: async (req, res) => {
    try {
      const sectores = await db.Sector.findAll();
      res.render("CargaFichaHerramienta", { sectores });
    } catch (error) {
      console.log(error);
      console.log("ERROR COMPLETO:");
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
      res.send("Error al cargar formulario");
    }
  },

  // =========================
  // PROCESAR NUEVA HERRAMIENTA
  // =========================
  processTool: async (req, res) => {
    try {
      await toolService.create(req);
      res.redirect("/Tools");
    } catch (error) {
      console.log(error);
      console.log("ERROR COMPLETO:");
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
      res.send("Error al guardar la herramienta");
    }
  },

  // =========================
  // FORMULARIO EDITAR HERRAMIENTA (Actualizado con Sectores)
  // =========================
  EditHerramienta: async (req, res) => {
    try {
      const id = req.params.id;
      const herramienta = await toolService.getOne(id);
      const sectores = await db.Sector.findAll();
      res.render("EditarHerramienta", { herramienta, sectores });
    } catch (error) {
      console.log(error);
      console.log("ERROR COMPLETO:");
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
      res.send("Error al cargar formulario de edición");
    }
  },

  // =========================
  // PROCESAR EDICIÓN HERRAMIENTA
  // =========================
  processEditTool: async (req, res) => {
    try {
      await toolService.update(req);
      res.redirect("/Tools/" + req.params.id);
    } catch (error) {
      console.log(error);
      console.log("ERROR COMPLETO:");
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
      res.send("Error al actualizar la herramienta");
    }
  },

  // =========================
  // ELIMINAR HERRAMIENTA
  // =========================
  deleteTool: async (req, res) => {
    try {
      const id = req.params.id;
      await toolService.delete(id);
      res.redirect("/Tools");
    } catch (error) {
      console.log(error);
      console.log("ERROR COMPLETO:");
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
      res.send("Error al eliminar la herramienta");
    }
  },

  // =========================
  // FORMULARIO DE PRÉSTAMO (Actualizado con Operarios y Sectores)
  // =========================
  CargaPrestamo: async (req, res) => {
    try {
      const id = req.params.id;
      const herramienta = await toolService.getOne(id);
      const operarios = await db.Operario.findAll();
      const sectores = await db.Sector.findAll(); // <-- Ahora sí buscamos los sectores
      res.render("CargaPrestamo", { herramienta, operarios, sectores }); // <-- Y los enviamos a la vista
    } catch (error) {
      console.log(error);
      console.log("ERROR COMPLETO:");
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
      res.send("Error al cargar formulario de préstamo");
    }
  },

  // =========================
  // PROCESAR PRÉSTAMO
  // =========================
  processPrestamo: async (req, res) => {
    try {
      await prestamoService.create(req);
      res.redirect("/Tools/" + req.body.id_herramienta);
    } catch (error) {
      console.log("ERROR COMPLETO:");
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
      res.send("Error al procesar el préstamo: " + error.message);
    }
  },

  // =========================
  // PROCESAR DEVOLUCIÓN
  // =========================
  processDevolucion: async (req, res) => {
    try {
      await prestamoService.devolver(req.body.id_herramienta);
      res.redirect("/Tools/" + req.body.id_herramienta);
    } catch (error) {
      console.log("ERROR COMPLETO:");
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
      res.send("Error al procesar la devolución");
    }
  },

  // =========================
  // PANTALLA DE AJUSTES
  // =========================
  Ajustes: async (req, res) => {
    try {
      const sectores = await db.Sector.findAll();
      const operarios = await db.Operario.findAll();

      res.render("Ajustes", { sectores, operarios });
    } catch (error) {
      console.log("ERROR COMPLETO:");
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
      res.send("Error al cargar la configuración");
    }
  },

  // ==========================================
  // FUNCIONES PARA AGREGAR Y BORRAR CATÁLOGOS
  // ==========================================
  createSector: async (req, res) => {
    try {
      await db.Sector.create({ nombre: req.body.nombre });
      res.redirect("/Tools/Ajustes");
    } catch (error) {
      console.log("ERROR COMPLETO:");
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
      res.send("Error al crear sector");
    }
  },

  deleteSector: async (req, res) => {
    try {
      await db.Sector.destroy({ where: { id_sector: req.params.id } });
      res.redirect("/Tools/Ajustes");
    } catch (error) {
      console.log("ERROR COMPLETO:");
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
      res.send("Error al eliminar sector");
    }
  },

  createOperario: async (req, res) => {
    try {
      await db.Operario.create({ nombre: req.body.nombre, estado: "Activo" });
      res.redirect("/Tools/Ajustes");
    } catch (error) {
      console.log("ERROR COMPLETO:");
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
      res.send("Error al crear operario");
    }
  },

  deleteOperario: async (req, res) => {
    try {
      await db.Operario.destroy({ where: { id_operario: req.params.id } });
      res.redirect("/Tools/Ajustes");
    } catch (error) {console.log("ERROR COMPLETO:");
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
      res.send("Error al eliminar operario");
    }
  },

  // ============================================================
  // EXPORTACIÓN JSON: TODAS las herramientas para Excel/Imprimir
  // ============================================================
  exportarJSON: async (req, res) => {
    try {
      const herramientas = await toolService.getAll();
      res.json(herramientas);
    } catch (error) {
      console.log("Error exportarJSON herramientas:", error);
      res.json([]);
    }
  },

  // ============================================================
  // EXPORTACIÓN JSON: TODOS los préstamos para Excel/Imprimir
  // ============================================================
  prestamosJSON: async (req, res) => {
    try {
      const prestamos = await db.Prestamo.findAll({
        include: [{ association: "herramienta" }],
        order: [["fecha_salida", "DESC"]],
      });
      res.json(prestamos);
    } catch (error) {
      console.log("Error prestamosJSON:", error);
      res.json([]);
    }
  },
};

module.exports = toolController;
