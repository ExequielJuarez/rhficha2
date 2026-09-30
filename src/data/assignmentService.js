const db = require("../model/database/models");
const { Op } = require("sequelize");
const { hoyISO, aISO } = require("../utils/fechas");

const { ErrorNegocio } = require("../utils/errores");

const assignmentService = {
  ErrorNegocio,

  getFormData: async function () {
    const vehiculos = await db.Vehiculo.findAll({
      where: { estado_actual: "Disponible" },
      order: [["patente", "ASC"]],
    });

    const asignacionesActivas = await db.AsignacionVehiculo.findAll({
      where: { estado: "Activo" },
      attributes: ["id_chofer"],
    });
    const choferesOcupados = asignacionesActivas.map((a) => a.id_chofer);

    // Sólo choferes activos, sin vehículo asignado y con licencia vigente
    const candidatos = await db.Chofer.findAll({
      where: {
        estado: "Activo",
        id_chofer: { [Op.notIn]: choferesOcupados.length ? choferesOcupados : [0] },
      },
      include: [{ model: db.LicenciaChofer, as: "licencias" }],
      order: [
        ["apellido", "ASC"],
        ["nombre", "ASC"],
      ],
    });
    const hoy = hoyISO();
    const choferes = candidatos.filter(
      (c) => c.licencias.length > 0 && c.licencias.some((l) => aISO(l.fecha_vencimiento) >= hoy),
    );

    return { vehiculos, choferes };
  },

  getActiveAssignments: async function () {
    try {
      return await db.AsignacionVehiculo.findAll({
        where: { estado: "Activo" },
        include: [{ model: db.Vehiculo, as: "vehiculo" }, { model: db.Chofer }],
        order: [["fecha_salida", "DESC"]],
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  },

  create: async function (data) {
    const transaction = await db.sequelize.transaction();
    try {
      const vehiculo = await db.Vehiculo.findByPk(data.id_vehiculo, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!vehiculo) throw new ErrorNegocio("El vehículo seleccionado no existe.");
      if (vehiculo.estado_actual !== "Disponible") {
        throw new ErrorNegocio(`El vehículo ${vehiculo.patente} no está disponible (estado: ${vehiculo.estado_actual}).`);
      }

      const chofer = await db.Chofer.findByPk(data.id_chofer, {
        include: [{ model: db.LicenciaChofer, as: "licencias" }],
        transaction,
      });
      if (!chofer) throw new ErrorNegocio("El chofer seleccionado no existe.");
      if (chofer.estado !== "Activo") throw new ErrorNegocio("El chofer seleccionado no está activo.");

      const desde = aISO(data.fecha_desde) || hoyISO();
      const licenciaVigente = chofer.licencias.some((l) => aISO(l.fecha_vencimiento) >= desde);
      if (!licenciaVigente) {
        throw new ErrorNegocio(`El chofer ${chofer.nombre} ${chofer.apellido} no tiene una licencia vigente a la fecha de salida.`);
      }

      const choferOcupado = await db.AsignacionVehiculo.findOne({
        where: { id_chofer: data.id_chofer, estado: "Activo" },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (choferOcupado) throw new ErrorNegocio("El chofer ya tiene un vehículo asignado actualmente.");

      const vehiculoOcupado = await db.AsignacionVehiculo.findOne({
        where: { id_vehiculo: data.id_vehiculo, estado: "Activo" },
        transaction,
      });
      if (vehiculoOcupado) throw new ErrorNegocio("El vehículo ya tiene una asignación activa.");

      const kmSalida = data.km_salida === undefined || data.km_salida === "" ? null : Number(data.km_salida);
      if (kmSalida !== null && (!Number.isInteger(kmSalida) || kmSalida < vehiculo.km_actual)) {
        throw new ErrorNegocio(
          `El kilometraje de salida (${data.km_salida} km) no puede ser menor al kilometraje actual del vehículo (${vehiculo.km_actual} km).`,
        );
      }

      const asignacion = await db.AsignacionVehiculo.create(
        {
          id_vehiculo: data.id_vehiculo,
          id_chofer: data.id_chofer,
          fecha_salida: data.fecha_desde,
          fecha_estimada_devolucion: data.fecha_hasta || null,
          destino_area: data.destino || null,
          observaciones: data.observaciones || null,
          estado: "Activo",
        },
        { transaction },
      );

      const cambiosVehiculo = { estado_actual: "En uso" };
      if (kmSalida !== null && kmSalida > vehiculo.km_actual) {
        cambiosVehiculo.km_actual = kmSalida;
        await db.HistorialKm.create(
          {
            id_vehiculo: vehiculo.id_vehiculo,
            km_anterior: vehiculo.km_actual,
            km_nuevo: kmSalida,
            fecha: hoyISO(),
            observaciones: "Kilometraje de salida al asignar el vehículo",
          },
          { transaction },
        );
      }
      await vehiculo.update(cambiosVehiculo, { transaction });

      await transaction.commit();
      return { asignacion, vehiculo, chofer };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  finalize: async function (id, opciones = {}) {
    const transaction = await db.sequelize.transaction();
    try {
      const asignacion = await db.AsignacionVehiculo.findByPk(Number(id), {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!asignacion) throw new ErrorNegocio("Asignación no encontrada.");
      if (asignacion.estado !== "Activo") throw new ErrorNegocio("La asignación ya estaba finalizada.");

      const cambios = { estado: "Finalizado", fecha_devolucion: new Date() };
      if (opciones.observacion) {
        cambios.observaciones = [asignacion.observaciones, opciones.observacion].filter(Boolean).join(" | ");
      }
      await asignacion.update(cambios, { transaction });

      // Sólo se libera el vehículo si seguía "En uso" (no si pasó a mantenimiento, siniestro o baja)
      const vehiculo = await db.Vehiculo.findByPk(asignacion.id_vehiculo, { transaction });
      if (vehiculo && vehiculo.estado_actual === "En uso") {
        await vehiculo.update({ estado_actual: "Disponible" }, { transaction });
      }

      await transaction.commit();
      return asignacion;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Cierra las asignaciones activas de un chofer (por ejemplo, cuando se lo da de baja)
  finalizarActivasDeChofer: async function (id_chofer, observacion) {
    const activas = await db.AsignacionVehiculo.findAll({ where: { id_chofer, estado: "Activo" } });
    for (const a of activas) await assignmentService.finalize(a.id_asignacion, { observacion });
    return activas.length;
  },

  // Cierra las asignaciones activas de un vehículo (por ejemplo, ante un siniestro)
  finalizarActivasDeVehiculo: async function (id_vehiculo, observacion) {
    const activas = await db.AsignacionVehiculo.findAll({ where: { id_vehiculo, estado: "Activo" } });
    for (const a of activas) await assignmentService.finalize(a.id_asignacion, { observacion });
    return activas.length;
  },
};

module.exports = assignmentService;
