const assignmentService = require("../data/assignmentService");
const db = require("../model/database/models"); // Agregado para poder consultar la BD directamente

const assignmentController = {
  showForm: async (req, res) => {
    try {
      const { vehiculos, choferes } = await assignmentService.getFormData();
      const asignaciones = await assignmentService.getActiveAssignments();

      res.render("AsignacionVehiculo", {
        vehiculos,
        choferes,
        asignaciones,
        error: req.query.error || null,
        success: req.query.success || null,
      });
    } catch (error) {
      console.log(error);
      res.send("Error al cargar el formulario de asignación");
    }
  },

  create: async (req, res) => {
    try {
      const { id_vehiculo, id_chofer, fecha_desde, fecha_hasta } = req.body;

      if (!id_vehiculo || !id_chofer || !fecha_desde || !fecha_hasta) {
        return res.redirect(
          "/Asignaciones?error=Completá todos los campos obligatorios",
        );
      }

      if (new Date(fecha_hasta) < new Date(fecha_desde)) {
        return res.redirect(
          "/Asignaciones?error=La fecha de fin debe ser posterior a la de inicio",
        );
      }

      // --- LÓGICA SENIOR: Validación de Kilometraje ---
      // 1. Buscamos el vehículo en la base de datos para saber su KM real
      const vehiculoDB = await db.Vehiculo.findByPk(id_vehiculo);

      if (vehiculoDB) {
        // 2. Tomamos el KM que viene del formulario.
        // NOTA: Asumo que el input en tu EJS se llama "km_salida". Si se llama distinto,
        // cambialo en el req.body correspondientemente.
        const kmIngresado = Number(
          req.body.km_salida || req.body.km_actual || 0,
        );

        // 3. Comparamos
        if (kmIngresado < vehiculoDB.km_actual) {
          // Si el número es menor, abortamos el guardado y mandamos el error a la vista
          return res.redirect(
            `/Asignaciones?error=Error: El kilometraje de salida (${kmIngresado} km) no puede ser menor al kilometraje actual del vehículo (${vehiculoDB.km_actual} km).`,
          );
        }
      }
      // ------------------------------------------------

      await assignmentService.create(req.body);
      res.redirect("/Asignaciones?success=Asignación registrada correctamente");
    } catch (error) {
      console.log(error);
      // Si el error viene del service, mostrar el mensaje directamente
      const mensaje = error.message || "Error al guardar la asignación";
      res.redirect(`/Asignaciones?error=${encodeURIComponent(mensaje)}`);
    }
  },

  finalize: async (req, res) => {
    console.log("ID recibido:", req.params.id); // agregá esto para debuggear
    try {
      await assignmentService.finalize(req.params.id);
      res.redirect("/Asignaciones?success=Asignación finalizada correctamente");
    } catch (error) {
      console.log(error);
      res.redirect("/Asignaciones?error=Error al finalizar la asignación");
    }
  },
};

module.exports = assignmentController;
