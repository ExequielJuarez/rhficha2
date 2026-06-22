const db = require("../model/database/models");
const { Op } = require("sequelize");

const alertaService = {
  getAll: async function (filtros = {}) {
    try {
      const where = {};

      if (filtros.tipo) where.tipo = filtros.tipo;
      if (filtros.prioridad) where.prioridad = filtros.prioridad;

      if (filtros.estado === "leida") where.leida = true;
      if (filtros.estado === "no_leida") where.leida = false;

      if (filtros.buscar) {
        where[Op.or] = [
          { mensaje: { [Op.like]: `%${filtros.buscar}%` } },
          { entidad_nombre: { [Op.like]: `%${filtros.buscar}%` } },
        ];
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

      const limite = parseInt(filtros.limite) || 10;
      const pagina = parseInt(filtros.pagina) || 1;
      const offset = (pagina - 1) * limite;

      const { count, rows } = await db.Alerta.findAndCountAll({
        where,
        order: [["createdAt", "DESC"]],
        limit: limite,
        offset: offset,
        distinct: true,
      });

      return {
        alertas: rows,
        totalRegistros: count,
        totalPaginas: Math.ceil(count / limite),
        paginaActual: pagina,
        limite,
      };
    } catch (error) {
      console.log(error);
      return { alertas: [], totalRegistros: 0, totalPaginas: 0, paginaActual: 1, limite: 10 };
    }
  },

  getRecientes: async function (limite = 8) {
    try {
      return await db.Alerta.findAll({
        where: { leida: false },
        order: [["createdAt", "DESC"]],
        limit: limite,
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  },

  contarNoLeidas: async function () {
    try {
      return await db.Alerta.count({ where: { leida: false } });
    } catch (error) {
      console.log(error);
      return 0;
    }
  },

  getResumen: async function () {
    try {
      const [licVencidas, licProximas, docsVencidas] = await Promise.all([
        db.Alerta.count({ where: { tipo: "licencia_vencida", leida: false } }),
        db.Alerta.count({ where: { tipo: "licencia_proxima", leida: false } }),
        db.Alerta.count({ where: { tipo: "documentacion_vencida", leida: false } })
      ]);

      // LÓGICA SENIOR: Buscamos la verdad absoluta directamente en la tabla Siniestros
      let siniestrosActivos = 0;
      if (db.Siniestro) {
         siniestrosActivos = await db.Siniestro.count({
             where: {
                 estado: { [Op.in]: ['EN PROCESO', 'En Proceso', 'En proceso'] }
             }
         });
      }

      return { licVencidas, licProximas, docsVencidas, siniestrosActivos };
    } catch (error) {
      console.log("Error en getResumen:", error);
      return { licVencidas: 0, licProximas: 0, docsVencidas: 0, siniestrosActivos: 0 };
    }
  },

  getEstadisticasGraficos: async function () {
    try {
      const [vehiculos, choferes] = await Promise.all([
        db.Vehiculo.findAll({ attributes: ["estado_actual"] }),
        db.Chofer.findAll({ attributes: ["estado"] }),
      ]);

      const statsVehiculos = { disponible: 0, uso: 0, mantenimiento: 0, baja: 0 };
      vehiculos.forEach((v) => {
        if (v.estado_actual === "Disponible") statsVehiculos.disponible++;
        else if (v.estado_actual === "En uso") statsVehiculos.uso++;
        else if (v.estado_actual === "En mantenimiento") statsVehiculos.mantenimiento++;
        else if (v.estado_actual === "Baja") statsVehiculos.baja++;
      });

      const statsChoferes = { activo: 0, inactivo: 0 };
      choferes.forEach((c) => {
        if (c.estado === "Activo") statsChoferes.activo++;
        else statsChoferes.inactivo++;
      });

      return { vehiculos: statsVehiculos, choferes: statsChoferes };
    } catch (error) {
      console.log(error);
      return { vehiculos: { disponible: 0, uso: 0, mantenimiento: 0, baja: 0 }, choferes: { activo: 0, inactivo: 0 } };
    }
  },

  marcarLeida: async function (id) {
    try {
      await db.Alerta.update({ leida: true }, { where: { id_alerta: id } });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  marcarTodasLeidas: async function () {
    try {
      await db.Alerta.update({ leida: true }, { where: { leida: false } });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  generarAlertasLicencias: async function () {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const en30dias = new Date(hoy);
      en30dias.setDate(hoy.getDate() + 30);

      const licencias = await db.LicenciaChofer.findAll({
        include: [{ model: db.Chofer, as: "Chofer" }],
        where: { fecha_vencimiento: { [Op.lte]: en30dias } },
      });

      for (const lic of licencias) {
        const venc = new Date(lic.fecha_vencimiento);
        const diffDias = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
        const nombre = `${lic.Chofer.nombre} ${lic.Chofer.apellido}`;
        const vencida = diffDias < 0;

        const existe = await db.Alerta.findOne({
          where: { tipo: vencida ? "licencia_vencida" : "licencia_proxima", entidad_id: lic.id_licencia, leida: false },
        });
        if (existe) continue;

        await db.Alerta.create({
          tipo: vencida ? "licencia_vencida" : "licencia_proxima",
          prioridad: vencida ? "alta" : "media",
          mensaje: vencida ? `Licencia de ${nombre} vencida hace ${Math.abs(diffDias)} días` : `Licencia de ${nombre} vence en ${diffDias} días`,
          entidad_tipo: "Chofer",
          entidad_id: lic.id_chofer,
          entidad_nombre: nombre,
          generada_automaticamente: true,
        });
      }
    } catch (error) {
      console.log("Error generando alertas de licencias:", error);
    }
  },

  generarAlertasVehiculos: async function () {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const en30dias = new Date(hoy);
      en30dias.setDate(hoy.getDate() + 30);

      const vehiculos = await db.Vehiculo.findAll({
        where: {
          estado_actual: { [Op.ne]: "Baja" },
          [Op.or]: [
            { rto_vencimiento: { [Op.lte]: en30dias, [Op.ne]: null } },
            { seguro_vencimiento: { [Op.lte]: en30dias, [Op.ne]: null } },
          ],
        },
      });

      for (const v of vehiculos) {
        if (v.rto_vencimiento) {
          const vencRto = new Date(v.rto_vencimiento);
          const diffRto = Math.ceil((vencRto - hoy) / (1000 * 60 * 60 * 24));
          if (diffRto <= 30) {
            const vencida = diffRto < 0;
            const msg = vencida ? `RTO/VTV vencida hace ${Math.abs(diffRto)} días` : `RTO/VTV vence en ${diffRto} días`;

            const existeRto = await db.Alerta.findOne({
              where: { tipo: "documentacion_vencida", entidad_id: v.id_vehiculo, mensaje: msg, leida: false },
            });
            if (!existeRto) {
              await db.Alerta.create({
                tipo: "documentacion_vencida",
                prioridad: vencida ? "alta" : "media",
                mensaje: msg,
                entidad_tipo: "Vehiculo",
                entidad_id: v.id_vehiculo,
                entidad_nombre: `${v.marca} ${v.modelo} (${v.patente})`,
                generada_automaticamente: true,
              });
            }
          }
        }

        if (v.seguro_vencimiento) {
          const vencSeguro = new Date(v.seguro_vencimiento);
          const diffSeguro = Math.ceil((vencSeguro - hoy) / (1000 * 60 * 60 * 24));
          if (diffSeguro <= 30) {
            const vencida = diffSeguro < 0;
            const msg = vencida ? `Póliza de seguro vencida hace ${Math.abs(diffSeguro)} días` : `Póliza de seguro vence en ${diffSeguro} días`;

            const existeSeguro = await db.Alerta.findOne({
              where: { tipo: "documentacion_vencida", entidad_id: v.id_vehiculo, mensaje: msg, leida: false },
            });
            if (!existeSeguro) {
              await db.Alerta.create({
                tipo: "documentacion_vencida",
                prioridad: vencida ? "alta" : "media",
                mensaje: msg,
                entidad_tipo: "Vehiculo",
                entidad_id: v.id_vehiculo,
                entidad_nombre: `${v.marca} ${v.modelo} (${v.patente})`,
                generada_automaticamente: true,
              });
            }
          }
        }
      }

      // Escáner silencioso de Siniestros Activos para la tabla de alertas
      if (db.Siniestro) {
        const siniestrosActivos = await db.Siniestro.findAll({
          where: { estado: { [Op.in]: ['EN PROCESO', 'En Proceso', 'En proceso'] } },
          include: [{ model: db.Vehiculo, as: 'vehiculo' }]
        });

        for (const s of siniestrosActivos) {
          const msg = `Siniestro en proceso no resuelto: ${s.ubicacion}`;
          const patente = s.vehiculo ? `(${s.vehiculo.patente})` : '';
          
          const existeSiniestro = await db.Alerta.findOne({
            where: { tipo: "siniestro_activo", entidad_id: s.id_siniestro, leida: false }
          });
          
          if (!existeSiniestro) {
            await db.Alerta.create({
              tipo: "siniestro_activo",
              prioridad: "alta",
              mensaje: msg,
              entidad_tipo: "Siniestro",
              entidad_id: s.id_siniestro,
              entidad_nombre: `Choque ${patente} - ${s.chofer_involucrado}`,
              generada_automaticamente: true,
            });
          }
        }
      }
      
    } catch (error) {
      console.log("Error generando alertas de vehículos y siniestros:", error);
    }
  },
};

module.exports = alertaService;