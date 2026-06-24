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
        include: [
          {
            model: db.Vehiculo,
            as: 'Vehiculo',
            where: Object.keys(vehiculoWhere).length > 0 ? vehiculoWhere : undefined,
            required: false
          },
          {
            model: db.Chofer,
            as: 'Chofer',
            required: false
          }
        ],
        order: [['fecha_siniestro', 'DESC']]
      });

      const vehiculos = await db.Vehiculo.findAll({ order: [['patente', 'ASC']] });

      res.render("ListadoSiniestros", { siniestros, vehiculos, filtros: req.query });
    } catch (error) {
      console.error(error);
      res.send("Error al cargar modulo de siniestros");
    }
  },

  DetalleSiniestro: async (req, res) => {
    try {
      const siniestro = await db.Siniestro.findByPk(req.params.id, {
        include: [
          { model: db.Vehiculo, as: 'Vehiculo' },
          { model: db.Chofer, as: 'Chofer', required: false }
        ]
      });
  
      if (!siniestro) return res.redirect('/Siniestros');
  
      res.render("DetalleSiniestro", { siniestro });
    } catch (error) {
      console.error(error);
      res.redirect('/Siniestros');
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
      const { 
        id_vehiculo, 
        id_chofer,
        fecha_siniestro, 
        ubicacion, 
        descripcion,
        danos_vehiculo,
        tercero_vehiculo,
        tercero_seguro,
        tercero_conductor,
        tercero_contacto
      } = req.body;
  
      let archivosNombres = [];
      if (req.files && req.files.length > 0) {
        archivosNombres = req.files.map(file => file.filename);
      }
  
      const nuevoSiniestro = await db.Siniestro.create({
        id_vehiculo,
        id_chofer: id_chofer || null,
        fecha_siniestro,
        ubicacion,
        relato: descripcion,
        danos_vehiculo: danos_vehiculo || null,
        tercero_vehiculo: tercero_vehiculo || null,
        tercero_seguro: tercero_seguro || null,
        tercero_conductor: tercero_conductor || null,
        tercero_contacto: tercero_contacto || null,
        estado: 'EN PROCESO',
        archivos_adjuntos: archivosNombres.join(",")
      });

  
        await db.Vehiculo.update(
          { estado_actual: 'En siniestro' },
          { where: { id_vehiculo } }
        );

        if (id_chofer) {
          await db.Chofer.update(
            { estado: 'En siniestro' },
            { where: { id_chofer } }
          );
        }

        // Lógica de tu compañero: crear alerta automática
        const vehiculo = await db.Vehiculo.findByPk(id_vehiculo);
        const patente = vehiculo ? `(${vehiculo.patente})` : '';

        await db.Alerta.create({
          tipo:                     'siniestro_activo',
          prioridad:                'alta',
          mensaje:                  `Nuevo siniestro registrado en: ${ubicacion}`,
          entidad_tipo:             'Siniestro',
          entidad_id:               nuevoSiniestro.id_siniestro,
          entidad_nombre:           `${patente} - ${chofer_involucrado}`,
          generada_automaticamente: false
        });

        let userId = req.session?.usuarioLogueado?.id || 1;

      await registrarAuditoria(userId, "siniestro", nuevoSiniestro.id_siniestro, "CREAR", `Siniestro registrado en: ${ubicacion}`);
  
      res.redirect("/Siniestros");
    } catch (error) {
      console.error(error);
      res.send("Error al guardar el siniestro: " + error.message);
    }
  },

  CambiarEstado: async (req, res) => {
    try {
      const estado = req.body.estado || 'RESUELTO';
  
      const siniestro = await db.Siniestro.findByPk(req.params.id);
      if (!siniestro) return res.redirect('/Siniestros');
  
      await siniestro.update({ estado });
  
      // Tu lógica: liberar vehículo y chofer al resolver
      if (estado === 'RESUELTO') {
        const vehiculo = await db.Vehiculo.findByPk(siniestro.id_vehiculo);
        if (vehiculo && vehiculo.estado_actual === 'En siniestro') {
          await vehiculo.update({ estado_actual: 'Disponible' });
        }
  
        if (siniestro.id_chofer) {
          const chofer = await db.Chofer.findByPk(siniestro.id_chofer);
          if (chofer && chofer.estado === 'En siniestro') {
            await chofer.update({ estado: 'Activo' });
          }
        }
      }
  
      // Lógica de tu compañero: marcar alerta como leída al cerrar
      const estadoNormalizado = estado.toUpperCase();
      if (estadoNormalizado === 'CERRADO' || estadoNormalizado === 'RESUELTO') {
        await db.Alerta.update(
          { leida: true },
          { where: { tipo: 'siniestro_activo', entidad_id: req.params.id, leida: false } }
        );
      }
  
      let userId = req.session?.usuarioLogueado?.id || 1;
      await registrarAuditoria(userId, "siniestro", req.params.id, "EDITAR_ESTADO", `Siniestro ID ${req.params.id} cambió a: ${estado}`);
  
      res.redirect('/Siniestros');
    } catch (error) {
      console.error(error);
      res.redirect('/Siniestros');
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