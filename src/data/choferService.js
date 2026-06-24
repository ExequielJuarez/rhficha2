const db = require("../model/database/models");
const { Op } = require("sequelize");

const choferService = {
  getAll: async function (filtros = {}) {
    try {
      const where = {};

      if (filtros.buscar) {
        where[Op.or] = [
          { nombre: { [Op.like]: `%${filtros.buscar}%` } },
          { apellido: { [Op.like]: `%${filtros.buscar}%` } },
          { dni: { [Op.like]: `%${filtros.buscar}%` } },
        ];
      }

      if (filtros.estado) {
        where.estado = filtros.estado;
      }

      if (filtros.fechaDesde && filtros.fechaHasta) {
        where.createdAt = {
          [Op.gte]: new Date(filtros.fechaDesde),
          [Op.lt]: new Date(
            new Date(filtros.fechaHasta).setDate(
              new Date(filtros.fechaHasta).getDate() + 1,
            ),
          ),
        };
      }

      const includeLicencias = {
        model: db.LicenciaChofer,
        as: "licencias",
        required: !!filtros.categoriaLicencia,
      };

      if (filtros.categoriaLicencia) {
        includeLicencias.where = { categoria: filtros.categoriaLicencia };
      }

      const includeAsignaciones = {
        model: db.AsignacionVehiculo,
        as: "asignaciones",
        required: false,
        include: [
          {
            model: db.Vehiculo,
            as: "vehiculo",
            required: false,
          },
        ],
      };

      const limite = parseInt(filtros.limite) || 8;
      const pagina = parseInt(filtros.pagina) || 1;
      const offset = (pagina - 1) * limite;

      const { count, rows } = await db.Chofer.findAndCountAll({
        where,
        include: [includeLicencias, includeAsignaciones],
        limit: limite,
        offset: offset,
        distinct: true,
      });

      return {
        choferes: rows,
        totalRegistros: count,
        totalPaginas: Math.ceil(count / limite),
        paginaActual: pagina,
        limite,
      };
    } catch (error) {
      console.log(error);
      return {
        choferes: [],
        totalRegistros: 0,
        totalPaginas: 0,
        paginaActual: 1,
        limite: 8,
      };
    }
  },

  getOneConLicencia: async function (id) {
    try {
      const chofer = await db.Chofer.findByPk(id, {
        include: [
          {
            model: db.LicenciaChofer,
            as: "licencias",
          },
        ],
      });
      return chofer;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  create: async function (req) {
    try {
      const body = req.body;
      const estado = body["activo-inactivo"];

      const fotoDocumento = req.files?.foto_documento?.[0]?.filename || null;
      const fotoLicencia  = req.files?.foto_licencia?.[0]?.filename  || null;

      let newChofer = await db.Chofer.create({
        nombre: body.nombre,
        apellido: body.apellido,
        dni: body.dni,
        telefono: body.telefono,
        direccion: body.direccion,
        estado: estado,
        email: body.email || null,
        fechaNacimiento: body.fechaNacimiento || null,
        fechaIngreso: body.fechaIngreso || null,
        turno: body.Turno || null,
        foto_documento: fotoDocumento,
      });

      await db.LicenciaChofer.create({
        id_chofer: newChofer.id_chofer,
        numero: body.numero_licencia,
        categoria: body.categoria,
        fecha_emision: body.fecha_emision,
        fecha_vencimiento: body.fecha_vencimiento,
        imagen: fotoLicencia,
      });

      return newChofer;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  update: async function (id, data) {
    try {
      await db.Chofer.update(data, {
        where: { id_chofer: id },
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
};

module.exports = choferService;