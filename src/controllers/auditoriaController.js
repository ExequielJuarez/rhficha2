const db = require("../model/database/models");
const { Op } = require("sequelize"); // Importamos los operadores matemáticos de Sequelize

const auditoriaController = {
  ListarAuditoria: async (req, res) => {
    try {
      // 1. Capturamos las fechas que el usuario elige en el filtro (si es que elige alguna)
      let { fechaDesde, fechaHasta } = req.query;
      let whereClause = {}; // Objeto vacío por si no hay filtros

      // 2. Armamos la lógica de la consulta
      if (fechaDesde && fechaHasta) {
        // Si puso ambas fechas, buscamos "Entre" (Between)
        whereClause.fecha = { [Op.between]: [fechaDesde, fechaHasta] };
      } else if (fechaDesde) {
        // Si solo puso Desde, buscamos "Mayor o igual a" (gte)
        whereClause.fecha = { [Op.gte]: fechaDesde };
      } else if (fechaHasta) {
        // Si solo puso Hasta, buscamos "Menor o igual a" (lte)
        whereClause.fecha = { [Op.lte]: fechaHasta };
      }

      // 3. Ejecutamos la búsqueda con el filtro y un límite de seguridad
      let registrosAuditoria = await db.Auditoria.findAll({
        where: whereClause,
        order: [
          ["fecha", "DESC"],
          ["hora", "DESC"],
        ],
        limit: 500, // Límite profesional para no ahogar el servidor con miles de datos
      });

      // 4. Limpieza de datos (fechas y usuarios)
      for (let registro of registrosAuditoria) {
        if (registro.fecha) {
          let f = new Date(registro.fecha);
          f.setMinutes(f.getMinutes() + f.getTimezoneOffset());
          registro.fechaLimpia = f.toLocaleDateString("es-AR");
        } else {
          registro.fechaLimpia = "Sin fecha";
        }

        if (registro.id_usuario) {
          try {
            let usuario = await db.Usuario.findOne({
              where: { id_usuario: registro.id_usuario },
            });
            if (usuario) {
              registro.nombreUsuario = `${usuario.nombre} ${usuario.apellido}`;
            } else {
              registro.nombreUsuario = `ID: ${registro.id_usuario} (Borrado)`;
            }
          } catch (e) {
            registro.nombreUsuario = `ID: ${registro.id_usuario}`;
          }
        }
      }

      // 5. Enviamos todo a la vista (incluyendo los filtros para que no se borren de la pantalla)
      res.render("Auditoria", {
        registros: registrosAuditoria,
        filtros: { fechaDesde, fechaHasta },
      });
    } catch (error) {
      console.log(error);
      res.send("Error al cargar el módulo de Auditoría");
    }
  },
};

module.exports = auditoriaController;
