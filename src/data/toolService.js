const db = require("../model/database/models");

const toolService = {
  getAll: async function () {
    try {
      return await db.Herramienta.findAll();
    } catch (error) {
      console.log("Error en toolService.getAll:", error);
      return [];
    }
  },

  getOne: async function (id) {
    try {
      return await db.Herramienta.findByPk(id);
    } catch (error) {
      console.log("Error en toolService.getOne:", error);
      return null;
    }
  },

  create: async function (req) {
    try {
      const data = req.body;
      const nuevaHerramienta = await db.Herramienta.create({
        codigo_activo: data.codigo_activo,
        nombre: data.nombre,
        sector: data.sector,
        estado: data.estado || "Disponible",
        stock: data.stock || 1,
        combustible_energia: data.combustible_energia,
        observaciones: data.observaciones,
        imagen_url: data.imagen,
        fecha_alta: new Date(),
      });
      return nuevaHerramienta;
    } catch (error) {
      console.log("Error en toolService.create:", error);
      throw error;
    }
  },

  // Actualizar una herramienta existente
  update: async function (req) {
    try {
      const id = req.params.id;
      const data = req.body;

      await db.Herramienta.update(
        {
          codigo_activo: data.codigo_activo,
          nombre: data.nombre,
          sector: data.sector,
          stock: data.stock,
          estado: data.estado,
          combustible_energia: data.combustible_energia,
          observaciones: data.observaciones,
        },
        {
          where: { id_herramienta: id },
        },
      );

      return true;
    } catch (error) {
      console.log("Error en toolService.update:", error);
      throw error;
    }
  },

  // Eliminar una herramienta y su historial
  delete: async function (id) {
    let transaction;
    try {
      transaction = await db.sequelize.transaction();

      // 1. Borrar primero los préstamos asociados para evitar error de MySQL
      await db.Prestamo.destroy({
        where: { id_herramienta: id },
        transaction,
      });

      // 2. Ahora sí, borrar la herramienta
      await db.Herramienta.destroy({
        where: { id_herramienta: id },
        transaction,
      });

      await transaction.commit();
      return true;
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.log("Error en toolService.delete:", error);
      throw error;
    }
  },
};

module.exports = toolService;
