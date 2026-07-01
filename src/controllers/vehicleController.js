const path = require("path");
const fs = require("fs");

const vehicleService = require("../data/vehicleService");
const db = require("../model/database/models");
const alertaService = require("../data/alertaService");

const vehicleController = {
  ListVehicles: async (req, res) => {
    try {
      let vehiculos = await vehicleService.getAll();
      res.render("listadoVehiculos", {
        vehiculos,
        vehiculoSeleccionado: null,
        ultimosMantenimientos: [],
        ultimasAsignaciones: [],
        asignacionActiva: null,
        siniestrosVehiculo: []
      });
    } catch (error) {
      console.log(error);
      res.send("Error al cargar lista de vehículos");
    }
  },

  // ================= METODOS NUEVOS: GESTION DE REPUESTOS =================
  GestionarRepuestos: async (req, res) => {
    try {
      let repuestos = [];
      if (db.Repuesto) repuestos = await db.Repuesto.findAll({ order: [['nombre', 'ASC']] });
      res.render("GestionRepuestos", { repuestos });
    } catch (error) {
      console.log("Error cargando repuestos:", error);
      res.render("GestionRepuestos", { repuestos: [] });
    }
  },

  createRepuesto: async (req, res) => {
    try {
      const { nombre, stock, costo_unitario } = req.body;
      if (db.Repuesto) {
        await db.Repuesto.create({
          nombre,
          stock: Number(stock) || 0,
          costo_unitario: Number(costo_unitario) || 0.00
        });
      }
      res.redirect("/Repuestos/Gestionar");
    } catch (error) {
      console.log("Error guardando repuesto:", error);
      res.redirect("/Repuestos/Gestionar");
    }
  },

  deleteRepuesto: async (req, res) => {
    try {
      if (db.Repuesto) await db.Repuesto.destroy({ where: { id_repuesto: req.params.id } });
      res.redirect("/Repuestos/Gestionar");
    } catch (error) {
      console.log("Error eliminando repuesto:", error);
      res.redirect("/Repuestos/Gestionar");
    }
  },
  // ========================================================================

  // ================= MANTENIMIENTOS =================
  CargaVMantenimiento: async (req, res) => {
    try {
      const vehiculos = await db.Vehiculo.findAll({ where: { estado_actual: ['Disponible', 'En uso'] } });
      let repuestos = [];
      try { repuestos = await db.Repuesto.findAll(); } catch(e) { console.log("Aún no existe tabla repuestos"); }
      
      res.render("cargaMantenimiento", {
        vehiculos: vehiculos,
        repuestos: repuestos,
        id_vehiculo_preseleccionado: req.params.id_vehiculo || null,
      });
    } catch (error) {
      console.log("Fallback service:", error);
      const data = await vehicleService.getCreateData();
      res.render("cargaMantenimiento", {
        vehiculos: data.vehiculos,
        repuestos: data.repuestos || [],
        id_vehiculo_preseleccionado: req.params.id_vehiculo || null,
      });
    }
  },

  Mantenimientos: async (req, res) => {
    try {
      const mantenimientos = await vehicleService.getAllMantenimientos();
      res.render("Mantenimientos", { mantenimientos });
    } catch (error) {
      console.error(error);
      res.render("Mantenimientos", { mantenimientos: [] }); 
    }
  },

  updateEstadoMantenimiento: async (req, res) => {
    try {
      const mantenimiento = await db.Mantenimiento.findByPk(req.params.id);
      if (!mantenimiento) return res.redirect('/Mantenimientos');
  
      await mantenimiento.update({ estado: req.body.estado });
  
      if (req.body.estado === 'Realizado') {
        const kmServicio = parseInt(req.body.km_servicio) || 0;
        const vehiculo = await db.Vehiculo.findByPk(mantenimiento.id_vehiculo);
        if (vehiculo) {
          const updates = {};
          if (kmServicio > vehiculo.km_actual) updates.km_actual = kmServicio;
  
          // Verificar si tiene otro mantenimiento activo antes de liberar
          const otroActivo = await db.Mantenimiento.findOne({
            where: {
              id_vehiculo: mantenimiento.id_vehiculo,
              estado: ['Pendiente', 'En proceso'],
              id_mantenimiento: { [db.Sequelize.Op.ne]: mantenimiento.id_mantenimiento }
            }
          });
  
          if (!otroActivo && vehiculo.estado_actual === 'En mantenimiento') {
            updates.estado_actual = 'Disponible';
          }
  
          if (Object.keys(updates).length > 0) await vehiculo.update(updates);
        }
      }
  
      res.redirect('/Mantenimientos');
    } catch (error) {
      console.error(error);
      res.redirect('/Mantenimientos');
    }
  },

  processMaintenance: async (req, res) => {
  try {
    let idUsuario = 1;
    if (req.session && req.session.usuarioLogueado) {
      idUsuario = req.session.usuarioLogueado.id_usuario || req.session.usuarioLogueado.id || 1;
    }

    const repuestosCalc = parseFloat(req.body.costo_repuestos) || 0;
    const manoObraCalc = parseFloat(req.body.mano_obra) || 0;
    const totalCalc = parseFloat(req.body.costo_total) || 0;
    const proxKm = req.body.proximo_servicio_km ? parseInt(req.body.proximo_servicio_km) : null;
    const kmServicio = parseInt(req.body.km_servicio) || 0;
    const estadoMantenimiento = req.body.estado;

    const nuevoMantenimiento = await db.Mantenimiento.create({
      id_vehiculo: req.body.id_vehiculo,
      id_usuario: idUsuario,
      fecha_inicio: req.body.fecha_inicio,
      tipo_servicio: req.body.tipo_servicio,
      estado: estadoMantenimiento,
      km_servicio: kmServicio,
      proximo_km: proxKm,
      descripcion: req.body.descripcion,
      observaciones: req.body.observaciones,
      costo_repuestos: repuestosCalc,
      mano_obra: manoObraCalc,
      costo_total: totalCalc
    });

    // ── actualizar estado del vehículo según estado del mantenimiento ──
    const vehiculo = await db.Vehiculo.findByPk(req.body.id_vehiculo);
    if (vehiculo) {
      if (estadoMantenimiento === 'Pendiente' || estadoMantenimiento === 'En proceso') {
        await vehiculo.update({ estado_actual: 'En mantenimiento' });
      } else if (estadoMantenimiento === 'Realizado') {
        // Si se carga directo como Realizado, actualizar km y mantener/liberar estado
        if (kmServicio > vehiculo.km_actual) {
          await vehiculo.update({ km_actual: kmServicio });
        }
        // Solo liberar si actualmente estaba En mantenimiento (no tocar si está En uso)
        if (vehiculo.estado_actual === 'En mantenimiento') {
          await vehiculo.update({ estado_actual: 'Disponible' });
        }

        // Recalcular alertas de mantenimiento (fuera del if de km, siempre que se cierre como Realizado)
        await alertaService.generarAlertasMantenimiento();
      }
    }

    // repuestos — igual que antes
    if (req.body.id_repuesto) {
      let repuestosIds = req.body.id_repuesto;
      let cantidades = req.body.cantidad;
      let costos = req.body.costo_unitario;

      if (!Array.isArray(repuestosIds)) repuestosIds = [repuestosIds];
      if (!Array.isArray(cantidades)) cantidades = [cantidades];
      if (!Array.isArray(costos)) costos = [costos];

      for (let i = 0; i < repuestosIds.length; i++) {
        if (repuestosIds[i]) {
          try {
            await db.DetalleMantenimiento.create({
              id_mantenimiento: nuevoMantenimiento.id_mantenimiento,
              id_repuesto: repuestosIds[i],
              cantidad: cantidades[i] || 1,
              costo_unitario: costos[i] || 0
            });

            const repuestoInventario = await db.Repuesto.findByPk(repuestosIds[i]);
            if (repuestoInventario) {
              await repuestoInventario.update({ stock: repuestoInventario.stock - (cantidades[i] || 1) });
            }
          } catch (errDetalle) {
            console.log("No se pudo guardar el detalle/descontar stock:", errDetalle.message);
          }
        }
      }
    }

    res.redirect("/Mantenimientos");
  } catch (error) {
    console.error("Error Crítico al guardar mantenimiento:", error);
    res.send(`
      <div style="font-family:sans-serif; padding:40px; text-align:center;">
        <h2 style="color:#dc2626;">Error al guardar la orden de mantenimiento</h2>
        <p style="background:#fef2f2; padding:15px; border:1px solid #fecaca; border-radius:8px; display:inline-block;">${error.message}</p>
        <br><br>
        <button onclick="history.back()" style="padding:10px 20px; cursor:pointer;">Volver e intentar nuevamente</button>
      </div>
    `);
  }
},

  // ================= OTROS METODOS DEL CONTROLADOR =================
  getVehicleById: async (req, res) => {
    try {
      const id = req.params.id;
      const vehiculo = await vehicleService.getOne(id);
      const vehiculos = await vehicleService.getAll();
      const ultimosMantenimientos = await vehicleService.getLastMantenimientos(id);
      const ultimasAsignaciones = await vehicleService.getLastAsignaciones(id);
      const asignacionActiva = await vehicleService.getAsignacionActiva(id);

      let siniestrosVehiculo = [];
      if (db.Siniestro) {
        try {
          siniestrosVehiculo = await db.Siniestro.findAll({
            where: { id_vehiculo: id },
            order: [['fecha_siniestro', 'DESC']]
          });
        } catch (e) {}
      }

      res.render("listadoVehiculos", {
        vehiculos,
        vehiculoSeleccionado: vehiculo,
        ultimosMantenimientos,
        ultimasAsignaciones,
        asignacionActiva: asignacionActiva || null,
        siniestrosVehiculo
      });
    } catch (error) {
      res.send("Error al obtener el vehículo");
    }
  },

  Ajustes: async (req, res) => {
    try {
      let distritos = [];
      let tiposVehiculo = [];
      if (db.Distrito) distritos = await db.Distrito.findAll();
      if (db.TipoVehiculo) tiposVehiculo = await db.TipoVehiculo.findAll();
      res.render("AjustesVehiculos", { distritos, tiposVehiculo });
    } catch (error) {
      res.render("AjustesVehiculos", { distritos: [], tiposVehiculo: [] });
    }
  },

  createDistrito: async (req, res) => {
    try {
      if (db.Distrito) await db.Distrito.create({ nombre: req.body.nombre });
      res.redirect("/Vehicles/Ajustes");
    } catch (error) { res.redirect("/Vehicles/Ajustes"); }
  },

  deleteDistrito: async (req, res) => {
    try {
      if (db.Distrito) await db.Distrito.destroy({ where: { id_distrito: req.params.id } });
      res.redirect("/Vehicles/Ajustes");
    } catch (error) { res.redirect("/Vehicles/Ajustes"); }
  },

  createTipo: async (req, res) => {
    try {
      if (db.TipoVehiculo) await db.TipoVehiculo.create({ descripcion: req.body.descripcion });
      res.redirect("/Vehicles/Ajustes");
    } catch (error) { res.redirect("/Vehicles/Ajustes"); }
  },

  deleteTipo: async (req, res) => {
    try {
      if (db.TipoVehiculo) await db.TipoVehiculo.destroy({ where: { id_tipo: req.params.id } });
      res.redirect("/Vehicles/Ajustes");
    } catch (error) { res.redirect("/Vehicles/Ajustes"); }
  },

  CargaVehiculo: async (req, res) => {
    try {
      let distritos = [];
      let tiposVehiculo = [];
      if (db.Distrito) distritos = await db.Distrito.findAll();
      if (db.TipoVehiculo) tiposVehiculo = await db.TipoVehiculo.findAll();
      res.render("CargaFichaVehiculo", { distritos, tiposVehiculo });
    } catch (error) {
      res.render("CargaFichaVehiculo", { distritos: [], tiposVehiculo: [] });
    }
  },

  processVehicle: async (req, res) => {
    try {
      const { patente, id_tipo, marca, modelo, anio, chasis, num_motor, estado_actual, km_actual, fecha_alta, distrito, cedula_numero } = req.body;
      const errores = [];
      const anioNum = parseInt(anio);
      const anioActual = new Date().getFullYear();

      if (!patente?.trim()) errores.push("La patente es obligatoria.");
      if (!id_tipo) errores.push("El tipo de vehículo es obligatorio.");
      if (!marca?.trim()) errores.push("La marca es obligatoria.");
      if (!modelo?.trim()) errores.push("El modelo es obligatorio.");
      if (!anio || anioNum < 1900 || anioNum > anioActual) errores.push(`El año debe estar entre 1900 y ${anioActual}.`);
      if (!chasis?.trim()) errores.push("El número de chasis es obligatorio.");
      if (!num_motor?.trim()) errores.push("El número de motor es obligatorio.");
      if (!estado_actual) errores.push("El estado es obligatorio.");
      if (km_actual === "" || km_actual === undefined || Number(km_actual) < 0) errores.push("El kilometraje es obligatorio y no puede ser negativo.");
      if (!fecha_alta) errores.push("La fecha de alta es obligatoria.");

      if (fecha_alta && anioNum) {
        const anioAlta = new Date(fecha_alta).getFullYear();
        if (anioAlta < anioNum) errores.push("La fecha de alta no puede ser anterior al año del vehículo.");
      }

      if (errores.length > 0) {
        return res.status(400).send(`<h3>Errores:</h3><ul>${errores.map((e) => `<li>${e}</li>`).join("")}</ul><a href="javascript:history.back()">Volver</a>`);
      }

      await vehicleService.create(req);
      res.redirect("/Vehicles");
    } catch (error) {
      res.send("Error al guardar el vehículo");
    }
  },

  EditVehiculo: async (req, res) => {
    try {
      const vehiculo = await vehicleService.getOne(req.params.id);
      res.render("EditarFichaVehiculo", { vehiculo });
    } catch (error) { res.send("Error"); }
  },

  processEditVehiculo: async (req, res) => {
    try {
      await vehicleService.update(req.params.id, req.body, req.files || {});
      res.redirect(`/Vehicles/${req.params.id}`);
    } catch (error) { res.send("Error al actualizar"); }
  },

  CargaActualizarKm: async (req, res) => {
    try {
      const asignaciones = await vehicleService.getVehiculosAsignados();
      const historial = await vehicleService.getHistorialKm();
      const vehiculosConHistorial = await vehicleService.getVehiculosConHistorial();
      const todosVehiculos = await db.Vehiculo.findAll({          // <-- NUEVO
        attributes: ['id_vehiculo', 'patente', 'marca', 'modelo', 'km_actual'],
        order: [['patente', 'ASC']]
      });
      res.render("ActualizarKm", { asignaciones, historial, vehiculosConHistorial, todosVehiculos });
    } catch (error) { res.send("Error al cargar la vista"); }
  },

  processActualizarKm: async (req, res) => {
    try {
      const { id_vehiculo, km_nuevo, fecha_actualizacion, observaciones } = req.body;
      const errores = [];

      if (!id_vehiculo) errores.push("Seleccioná un vehículo asignado.");
      if (km_nuevo === "" || km_nuevo === undefined || Number(km_nuevo) < 0) errores.push("Ingresá un kilometraje válido (mayor o igual a 0).");
      if (!fecha_actualizacion) errores.push("La fecha de actualización es obligatoria.");

      if (errores.length > 0) {
        return res.status(400).send(`<h3>Errores de validación:</h3><ul>${errores.map((e) => `<li>${e}</li>`).join("")}</ul><a href="javascript:history.back()">Volver</a>`);
      }

      await vehicleService.actualizarKm(id_vehiculo, Number(km_nuevo), observaciones);
      await vehicleService.actualizarKm(id_vehiculo, Number(km_nuevo), observaciones);
      await alertaService.generarAlertasMantenimiento(); // <-- agregar
      res.redirect("/Vehicles");
    } catch (error) { res.send("Error al actualizar el kilometraje"); }
  },
};

module.exports = vehicleController;