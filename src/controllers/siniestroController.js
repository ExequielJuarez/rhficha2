const path = require("path");
const fs = require("fs");
const db = require("../model/database/models");
const { Op } = require("sequelize");

const registrarAuditoria = async (id_usuario, tabla, id_registro, accion, descripcion) => {
  try {
    const now = new Date();
    now.setHours(now.getHours() - 3);
    await db.Auditoria.create({
      id_usuario: id_usuario || 1,
      tabla_afectada: tabla,
      id_registro_afectado: id_registro,
      accion: accion,
      fecha: now.toISOString().split("T")[0],
      hora: now.toISOString().split("T")[1].split(".")[0],
      descripcion: descripcion,
    });
  } catch (error) {
    console.error("Error auditoria:", error);
  }
};

const siniestroController = {
  ListarSiniestros: async (req, res) => {
    try {
      let { patente, fechaDesde, fechaHasta } = req.query;
      let whereClause = {};
      let vehiculoWhere = {};

      if (fechaDesde && fechaHasta) {
        whereClause.fecha_siniestro = { [Op.between]: [fechaDesde, fechaHasta] };
      } else if (fechaDesde) {
        whereClause.fecha_siniestro = { [Op.gte]: fechaDesde };
      } else if (fechaHasta) {
        whereClause.fecha_siniestro = { [Op.lte]: fechaHasta };
      }

      if (patente && patente !== "" && patente !== "Todas las Patentes") {
         vehiculoWhere.patente = { [Op.like]: `%${patente}%` };
      }

      const siniestros = await db.Siniestro.findAll({
        where: whereClause,
        include: [{
          model: db.Vehiculo,
          as: 'vehiculo',
          where: Object.keys(vehiculoWhere).length > 0 ? vehiculoWhere : undefined
        }],
        order: [['fecha_siniestro', 'DESC']]
      });

      const vehiculos = await db.Vehiculo.findAll({ order: [['patente', 'ASC']] });

      res.render("ListadoSiniestros", { siniestros, vehiculos, filtros: req.query });
    } catch (error) {
      console.error(error);
      res.send("Error al cargar modulo de siniestros");
    }
  },

  CargaSiniestro: async (req, res) => {
    try {
      const vehiculos = await db.Vehiculo.findAll({ order: [['patente', 'ASC']] });
      const choferes = await db.Chofer.findAll({ where: { estado: 'Activo' } });

      res.render("CargaSiniestro", { vehiculos, choferes });
    } catch (error) {
      console.error(error);
      res.send("Error al cargar el formulario");
    }
  },

  ProcesoCarga: async (req, res) => {
    try {
      const { id_vehiculo, chofer_involucrado, fecha_siniestro, ubicacion, relato, tercero_nombre, tercero_patente, tercero_aseguradora, tercero_poliza } = req.body;

      let archivosNombres = [];
      if (req.files && req.files.length > 0) {
          archivosNombres = req.files.map(file => file.filename);
      }

      const nuevoSiniestro = await db.Siniestro.create({
        id_vehiculo,
        chofer_involucrado,
        fecha_siniestro,
        ubicacion,
        relato,
        tercero_nombre,
        tercero_patente,
        tercero_aseguradora,
        tercero_poliza,
        estado: 'EN PROCESO',
        archivos_adjuntos: archivosNombres.join(",") 
      });

      let userId = req.session && req.session.usuarioLogueado ? req.session.usuarioLogueado.id : 1;
      await registrarAuditoria(userId, "siniestro", nuevoSiniestro.id_siniestro, "CREAR", `Siniestro registrado en: ${ubicacion}`);

      res.redirect("/Siniestros");
    } catch (error) {
      console.error(error);
      res.send("Error al guardar el siniestro");
    }
  },

  CambiarEstado: async (req, res) => {
    try {
      const { estado } = req.body;
      await db.Siniestro.update({ estado }, { where: { id_siniestro: req.params.id } });

      let userId = req.session && req.session.usuarioLogueado ? req.session.usuarioLogueado.id : 1;
      await registrarAuditoria(userId, "siniestro", req.params.id, "EDITAR_ESTADO", `Siniestro ID ${req.params.id} cambió a: ${estado}`);

      res.redirect("/Siniestros");
    } catch (error) {
      console.error(error);
      res.redirect("/Siniestros");
    }
  },
  
  Eliminar: async (req, res) => {
    try {
      await db.Siniestro.destroy({ where: { id_siniestro: req.params.id } });
      let userId = req.session && req.session.usuarioLogueado ? req.session.usuarioLogueado.id : 1;
      await registrarAuditoria(userId, "siniestro", req.params.id, "ELIMINAR", `Se eliminó el siniestro ID ${req.params.id}`);
      res.redirect("/Siniestros");
    } catch (error) {
      console.error(error);
      res.redirect("/Siniestros");
    }
  }
};

module.exports = siniestroController;