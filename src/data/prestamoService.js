const db = require("../model/database/models");

const prestamoService = {
  // Registrar un nuevo préstamo con validación de duplicados
  create: async function (req) {
    let transaction;
    try {
      transaction = await db.sequelize.transaction();
      const data = req.body;

      // VALIDACIÓN: Verificar si la herramienta ya tiene un préstamo "Activo"
      const prestamoExistente = await db.Prestamo.findOne({
        where: {
          id_herramienta: data.id_herramienta,
          estado_prestamo: "Activo",
        },
      });

      if (prestamoExistente) {
        throw new Error("Esta herramienta ya se encuentra en préstamo activo.");
      }

      // 1. Creamos el registro del préstamo
      const nuevoPrestamo = await db.Prestamo.create(
        {
          id_herramienta: data.id_herramienta,
          nombre_operario: data.nombre_operario,
          fecha_salida: data.fecha_salida || new Date(),
          fecha_devolucion_estimada: data.fecha_devolucion_estimada,
          sector_destino: data.sector_destino,
          estado_prestamo: "Activo",
        },
        { transaction },
      );

      // 2. Actualizamos el estado de la herramienta a 'En uso'
      await db.Herramienta.update(
        { estado: "En uso" },
        { where: { id_herramienta: data.id_herramienta }, transaction },
      );

      await transaction.commit();
      return nuevoPrestamo;
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.log("Error en prestamoService.create:", error.message);
      throw error;
    }
  },

  // Obtener préstamos de una herramienta específica
  getByTool: async function (id_herramienta) {
    try {
      return await db.Prestamo.findAll({
        where: { id_herramienta },
        order: [["fecha_salida", "DESC"]],
      });
    } catch (error) {
      console.log("Error en getByTool:", error);
      return [];
    }
  },

  // Registrar la devolución de una herramienta
  devolver: async function (id_herramienta) {
    let transaction;
    try {
      transaction = await db.sequelize.transaction();

      // 1. Buscamos el préstamo activo
      const prestamoActivo = await db.Prestamo.findOne({
        where: { id_herramienta: id_herramienta, estado_prestamo: "Activo" },
      });

      if (prestamoActivo) {
        // Marcamos el préstamo como Finalizado y le ponemos fecha de hoy
        await prestamoActivo.update(
          {
            estado_prestamo: "Finalizado",
            fecha_devolucion_real: new Date(),
          },
          { transaction },
        );
      }

      // 2. Volvemos a poner la herramienta como Disponible
      await db.Herramienta.update(
        { estado: "Disponible" },
        { where: { id_herramienta: id_herramienta }, transaction },
      );

      await transaction.commit();
      return true;
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.log("Error en prestamoService.devolver:", error.message);
      throw error;
    }
  },
};

module.exports = prestamoService;
