const path = require("path");
const fs = require("fs");
const db = require("../model/database/models");

const vehicleService = {
  getAll: async function () {
    try {
      return await db.Vehiculo.findAll({
        include: [
          {
            association: "TipoVehiculo",
          },
        ],
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  },

  getOne: async function (id) {
    try {
      let Vehicle = await db.Vehiculo.findByPk(id, {
        include: [
          {
            association: "TipoVehiculo",
          },
        ],
      });
      return Vehicle;
    } catch (error) {
      console.log(error);
    }
  },

  findByPk: async function (id) {
    try {
      let allVehicles = await this.getAll();
      let OneVehicle = allVehicles.find((onevehicle) => onevehicle.id === id);
      return OneVehicle;
    } catch (error) {
      console.log(error);
    }
  },

  create: async function (req) {
    try {
      let newVehicle = await db.Vehiculo.create({
        patente: req.body.patente,
        id_tipo: req.body.id_tipo,
        marca: req.body.marca,
        modelo: req.body.modelo,
        anio: req.body.anio,
        num_chasis: req.body.chasis,
        num_motor: req.body.num_motor,
        transmision: req.body.transmision,
        estado_actual: req.body.estado_actual,
        km_actual: req.body.km_actual,
        distrito: req.body.distrito,
        fecha_alta: req.body.fecha_alta,
        cedula_numero: req.body.cedula_numero || null,
        cedula_titular: req.body.cedula_titular || null,
        seguro_compania: req.body.seguro_compania || null,
        seguro_vencimiento: req.body.seguro_vencimiento || null,
        rto_vencimiento: req.body.rto_vencimiento || null,
        foto_cedula: req.files?.foto_cedula?.[0]?.filename || null,
        foto_titulo: req.files?.foto_titulo?.[0]?.filename || null,
        foto_rto:    req.files?.foto_rto?.[0]?.filename    || null,
      });
      return newVehicle;
    } catch (error) {
      console.log(error);
    }
  },

  /* =========================================================
       MANTENIMIENTOS
    ========================================================= */

  getCreateData: async function () {
    try {
      const vehiculos = await db.Vehiculo.findAll();
      const repuestos = await db.Repuesto.findAll();
      return { vehiculos, repuestos };
    } catch (error) {
      console.log(error);
    }
  },

  createMaintenance: async function (data) {
    try {
      let costoFinal = data.costo_total || data.costo || 0;
      if (typeof costoFinal === "string") {
        costoFinal = parseFloat(costoFinal.replace(/[^0-9.-]+/g, "")) || 0;
      }

      const mantenimiento = await db.Mantenimiento.create({
        id_vehiculo: data.id_vehiculo,
        id_usuario: 1,
        tipo_servicio: data.tipo_servicio,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin || null,
        km_servicio: data.km_servicio,
        costo_total: costoFinal,
        descripcion: data.descripcion || data.trabajo_realizado || null,
        observaciones: data.observaciones || null,
        proximo_km: data.proximo_km || data.proximo_servicio_km || null,
        proxima_fecha: data.proxima_fecha || null,
        estado: data.estado || "Realizado",
      });
      console.log("Mantenimiento guardado:", mantenimiento.id_mantenimiento);

      let idRepuestos = data["id_repuesto[]"] || data.id_repuesto;
      let cantidades = data["cantidad[]"] || data.cantidad;
      let costosUnitarios = data["costo_unitario[]"] || data.costo_unitario;

      if (idRepuestos) {
        if (!Array.isArray(idRepuestos)) idRepuestos = [idRepuestos];
        if (!Array.isArray(cantidades)) cantidades = [cantidades];
        if (!Array.isArray(costosUnitarios)) costosUnitarios = [costosUnitarios];

        for (let i = 0; i < idRepuestos.length; i++) {
          if (idRepuestos[i] && idRepuestos[i] !== "") {
            await db.DetalleMantenimiento.create({
              id_mantenimiento: mantenimiento.id_mantenimiento,
              id_repuesto: idRepuestos[i],
              cantidad: cantidades[i] || 1,
              costo_unitario: costosUnitarios[i] || 0,
            });
          }
        }
      }

      return mantenimiento;
    } catch (error) {
      console.log(error);
    }
  },

  update: async function (id, body, files = {}) {
    try {
      // 👈 NUEVO: snapshot del vehículo antes de modificarlo, para poder auditar el "antes"
      const vehiculoAnterior = await db.Vehiculo.findByPk(id);
      const valorAnteriorPlano = vehiculoAnterior ? vehiculoAnterior.toJSON() : null;

      const datos = {
        estado_actual: body.estado_actual,
        km_actual: body.km_actual,
        distrito: body.distrito,
        observaciones: body.observaciones,
        fecha_baja: body.fecha_baja || null,
        cedula_numero: body.cedula_numero || null,
        cedula_titular: body.cedula_titular || null,
        seguro_compania: body.seguro_compania || null,
        seguro_vencimiento: body.seguro_vencimiento || null,
        rto_vencimiento: body.rto_vencimiento || null,
      };

      if (files?.foto_cedula?.[0]) datos.foto_cedula = files.foto_cedula[0].filename;
      if (files?.foto_titulo?.[0]) datos.foto_titulo = files.foto_titulo[0].filename;
      if (files?.foto_rto?.[0])    datos.foto_rto    = files.foto_rto[0].filename;

      await db.Vehiculo.update(datos, { where: { id_vehiculo: id } });

      // 👈 NUEVO: devolvemos antes/después para que el controller pueda auditar
      return { valorAnterior: valorAnteriorPlano, valorNuevo: datos };
    } catch (error) {
      console.log(error);
    }
  },

  getAllMantenimientos: async () => {
    try {
      const mantenimientos = await db.Mantenimiento.findAll({
        include: [
          { association: "vehiculo" },
          { association: "detalles" },
        ],
        order: [["fecha_inicio", "DESC"]],
      });

      return mantenimientos.map((m) => {
        const mant = m.toJSON();
        mant.proximo_servicio_km = mant.proximo_km;

        let costoRepuestos = 0;
        if (mant.detalles && mant.detalles.length > 0) {
          costoRepuestos = mant.detalles.reduce((total, detalle) => {
            return total + Number(detalle.cantidad) * Number(detalle.costo_unitario);
          }, 0);
        }

        mant.costo_repuestos = costoRepuestos;
        mant.mano_obra = Math.max(0, Number(mant.costo_total) - costoRepuestos);

        return mant;
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  },

  getLastMantenimientos: async function (id_vehiculo, limit = 3) {
    try {
      return await db.Mantenimiento.findAll({
        where: { id_vehiculo },
        order: [["fecha_inicio", "DESC"]],
        limit,
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  },

  getLastAsignaciones: async function (id_vehiculo, limit = 3) {
    try {
      return await db.AsignacionVehiculo.findAll({
        where: { id_vehiculo },
        order: [["fecha_salida", "DESC"]],
        limit,
        include: [{ association: "Chofer" }],
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  },

  getVehiculosAsignados: async function () {
    try {
      const asignaciones = await db.AsignacionVehiculo.findAll({
        where: { estado: "Activo" },
        include: [
          {
            association: "vehiculo",
            attributes: ["id_vehiculo", "patente", "marca", "modelo", "anio", "km_actual"],
          },
          {
            model: db.Chofer,
            attributes: ["id_chofer", "nombre", "apellido"],
          },
        ],
      });

      return asignaciones.map((asig) => ({
        id_vehiculo: asig.vehiculo.id_vehiculo,
        patente: asig.vehiculo.patente,
        marca: asig.vehiculo.marca,
        modelo: asig.vehiculo.modelo,
        anio: asig.vehiculo.anio,
        km_actual: asig.vehiculo.km_actual,
        chofer_nombre: asig.Chofer.nombre,
        chofer_apellido: asig.Chofer.apellido,
        destino_area: asig.destino_area || null,
        fecha_salida: asig.fecha_salida || null,
        id_asignacion: asig.id_asignacion,
      }));
    } catch (error) {
      console.log(error);
      return [];
    }
  },

  getAsignacionActiva: async function (id_vehiculo) {
    try {
      return await db.AsignacionVehiculo.findOne({
        where: { id_vehiculo, estado: "Activo" },
        include: [{ association: "Chofer" }],
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  actualizarKm: async function (id_vehiculo, km_nuevo, observaciones) {
    try {
      const vehiculo = await db.Vehiculo.findByPk(id_vehiculo, {
        attributes: ["km_actual"],
      });

      const km_anterior = vehiculo.km_actual;

      await db.Vehiculo.update(
        { km_actual: km_nuevo },
        { where: { id_vehiculo } },
      );

      await db.HistorialKm.create({
        id_vehiculo,
        km_anterior,
        km_nuevo,
        fecha: new Date().toISOString().split("T")[0],
        observaciones: observaciones?.trim() || null,
      });
    } catch (error) {
      console.log(error);
    }
  },

  getHistorialKm: async function (id_vehiculo = null) {
    try {
      const where = id_vehiculo ? { id_vehiculo } : {};

      return await db.HistorialKm.findAll({
        where,
        order: [
          ["fecha", "DESC"],
          ["id_historial", "DESC"],
        ],
        include: [
          {
            association: "vehiculo",
            attributes: ["patente", "marca", "modelo"],
          },
        ],
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  },

  getVehiculosConHistorial: async function () {
    try {
      const vehiculos = await db.Vehiculo.findAll({
        include: [
          {
            model: db.HistorialKm,
            as: "historial_km",
            required: true,
            attributes: [],
          },
        ],
        attributes: ["id_vehiculo", "patente", "marca", "modelo", "km_actual"],
        group: ["Vehiculo.id_vehiculo"],
      });
      return vehiculos;
    } catch (error) {
      console.log(error);
      return [];
    }
  },
};

module.exports = vehicleService;