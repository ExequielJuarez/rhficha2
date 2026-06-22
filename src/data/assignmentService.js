const db = require('../model/database/models');

const assignmentService = {

    getFormData: async function () {
    const vehiculos = await db.Vehiculo.findAll({
        where: { estado_actual: 'Disponible' }
        // sin include por ahora
    });

    const asignacionesActivas = await db.AsignacionVehiculo.findAll({
        where: { estado: 'Activo' },
        attributes: ['id_chofer']
    });

    const choferesOcupados = asignacionesActivas.map(a => a.id_chofer);

    const choferes = await db.Chofer.findAll({
        where: {
            estado: 'Activo',
            id_chofer: { [db.Sequelize.Op.notIn]: choferesOcupados.length ? choferesOcupados : [0] }
        },
        order: [['apellido', 'ASC'], ['nombre', 'ASC']]
    });

    return { vehiculos, choferes };
},

    getActiveAssignments: async function () {
        try {
            return await db.AsignacionVehiculo.findAll({
                where: { estado: 'Activo' },
                include: [
                    { model: db.Vehiculo, as: 'vehiculo' },
                    { model: db.Chofer }
                ],
                order: [['fecha_salida', 'DESC']]
            });
        } catch (error) {
            console.log(error);
            return [];
        }
    },

    create: async function (data) {
        try {
             // Verificar que el chofer no tenga ya una asignación activa
            const asignacionExistente = await db.AsignacionVehiculo.findOne({
                where: {
                    id_chofer: data.id_chofer,
                    estado: 'Activo'
                }
            });

            if (asignacionExistente) {
                throw new Error('El chofer ya tiene un vehículo asignado actualmente');
            }
            const asignacion = await db.AsignacionVehiculo.create({
                id_vehiculo:               data.id_vehiculo,
                id_chofer:                 data.id_chofer,
                fecha_salida:              data.fecha_desde,
                fecha_estimada_devolucion: data.fecha_hasta || null,
                destino_area:              data.destino     || null,
                observaciones:             data.observaciones || null,
                estado:                    'Activo'
            });

            await db.Vehiculo.update(
                { estado_actual: 'En uso' },
                { where: { id_vehiculo: data.id_vehiculo } }
            );

            if (data.km_salida && data.km_salida !== '') {
                await db.Vehiculo.update(
                    { km_actual: data.km_salida },
                    { where: { id_vehiculo: data.id_vehiculo } }
                );
            }

            return asignacion;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    finalize: async function (id) {
        try {
            const asignacion = await db.AsignacionVehiculo.findByPk(Number(id));
            if (!asignacion) throw new Error('Asignación no encontrada');
    
            await db.AsignacionVehiculo.update(
                { 
                    estado: 'Finalizado',
                    fecha_devolucion: new Date() 
                },
                { where: { id_asignacion: Number(id) } }
            );
    
            await db.Vehiculo.update(
                { estado_actual: 'Disponible' },
                { where: { id_vehiculo: asignacion.id_vehiculo } }
            );
    
            return true;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
};

module.exports = assignmentService;