const db = require('../model/database/models');
const { body } = require('express-validator');
const { Op } = require('sequelize');

// ─────────────────────────────────────────────
// VALIDACIÓN DE CREACIÓN
// ─────────────────────────────────────────────
const choferVAlidation = () => [

    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 2 }).withMessage('Mínimo 2 caracteres'),

    body('apellido')
        .notEmpty().withMessage('El apellido es obligatorio')
        .isLength({ min: 2 }).withMessage('Mínimo 2 caracteres'),

    // CORREGIDO: Ahora valida que el DNI no exista en la base al crear, sin pedir ID
    body('dni')
        .notEmpty().withMessage('El DNI es obligatorio').bail()
        .isNumeric().withMessage('El DNI debe contener solo números').bail()
        .custom(async (value) => {
            const chofer = await db.Chofer.findOne({ where: { dni: value } });
            if (chofer) throw new Error('Este DNI ya está registrado en el sistema');
            return true;
        }),

    body('fechaNacimiento')
        .notEmpty().withMessage('La fecha de nacimiento es obligatoria').bail()
        .isDate().withMessage('Fecha de nacimiento inválida').bail()
        .custom((value) => {
            const hoy = new Date();
            const nacimiento = new Date(value);
            if (nacimiento >= hoy) throw new Error('La fecha de nacimiento debe ser anterior a hoy');
            const edad = hoy.getFullYear() - nacimiento.getFullYear();
            const cumplioEsteAnio =
                hoy.getMonth() > nacimiento.getMonth() ||
                (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() >= nacimiento.getDate());
            const edadReal = cumplioEsteAnio ? edad : edad - 1;
            if (edadReal < 18) throw new Error('El chofer debe ser mayor de 18 años');
            return true;
    }),

    // CORREGIDO: Límite extendido a 20 caracteres y arreglada la búsqueda de duplicados
    body('telefono')
        .notEmpty().withMessage('El teléfono es obligatorio')
        .isNumeric().withMessage('El teléfono debe contener solo números')
        .isLength({ min: 8, max: 20 }).withMessage('Teléfono inválido (debe tener entre 8 y 20 números)')
        .custom(async (value) => {
            const chofer = await db.Chofer.findOne({ where: { telefono: value } });
            if (chofer) throw new Error('El teléfono ya está registrado');
            return true;
        }),

    body('direccion')
        .notEmpty().withMessage('La dirección es obligatoria')
        .isLength({ min: 5 }).withMessage('Ingrese una dirección válida'),

    body('email')
        .optional({ checkFalsy: true })
        .isEmail().withMessage('El email ingresado no es válido')
        .normalizeEmail(),

    body('fechaIngreso')
        .notEmpty().withMessage('La fecha de ingreso es obligatoria').bail()
        .isDate().withMessage('Fecha de ingreso inválida').bail()
        .custom((value) => {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const ingreso = new Date(value);
            if (ingreso > hoy) throw new Error('La fecha de ingreso no puede ser futura');
            return true;
        }),

    body('activo-inactivo')
        .notEmpty().withMessage('El estado es obligatorio')
        .isIn(['Activo', 'Inactivo']).withMessage('Estado inválido'),

    body('numero_licencia')
        .notEmpty().withMessage('El número de licencia es obligatorio')
        .isLength({ min: 8, max: 16 }).withMessage('Número de licencia inválido'),

    body('categoria')
        .notEmpty().withMessage('La categoría de licencia es obligatoria')
        .isIn(['A', 'B1', 'B2', 'C', 'D', 'E', 'G']).withMessage('Categoría inválida'),

    body('fecha_emision')
        .notEmpty().withMessage('La fecha de emisión es obligatoria').bail()
        .isDate().withMessage('Fecha de emisión inválida').bail()
        .custom((value) => {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const emision = new Date(value);
            if (emision > hoy) throw new Error('La fecha de emisión no puede ser futura');
            return true;
        }),

    body('fecha_vencimiento')
        .notEmpty().withMessage('La fecha de vencimiento es obligatoria').bail()
        .isDate().withMessage('Fecha de vencimiento inválida').bail()
        .custom((value, { req }) => {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const vencimiento = new Date(value);
            if (vencimiento < hoy) throw new Error('La licencia está vencida');
            if (req.body.fecha_emision) {
                const emision = new Date(req.body.fecha_emision);
                if (vencimiento <= emision) throw new Error('El vencimiento debe ser posterior a la fecha de emisión');
        }
        return true;
        }),
];

// ─────────────────────────────────────────────
// VALIDACIÓN DE EDICIÓN
// ─────────────────────────────────────────────
const choferEditValidation = () => [

    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 2 }).withMessage('Mínimo 2 caracteres'),

    body('apellido')
        .notEmpty().withMessage('El apellido es obligatorio')
        .isLength({ min: 2 }).withMessage('Mínimo 2 caracteres'),

    // DNI: solo se verifica que no venga manipulado desde el front.
    // No se permite modificarlo — si difiere del registrado se rechaza.
    body('dni')
        .notEmpty().withMessage('El DNI es obligatorio')
        .custom(async (value, { req }) => {
            const chofer = await db.Chofer.findByPk(req.params.id);
            if (!chofer) throw new Error('Chofer no encontrado');
            if (String(chofer.dni) !== String(value)) {
                throw new Error('El DNI no puede modificarse');
        }
        return true;
    }),

    body('fechaNacimiento')
        .notEmpty().withMessage('La fecha de nacimiento es obligatoria').bail()
        .isDate().withMessage('Fecha de nacimiento inválida').bail()
        .custom((value) => {
            const hoy = new Date();
            const nacimiento = new Date(value);
            if (nacimiento >= hoy) throw new Error('La fecha de nacimiento debe ser anterior a hoy');
            const edad = hoy.getFullYear() - nacimiento.getFullYear();
            const cumplioEsteAnio =
                hoy.getMonth() > nacimiento.getMonth() ||
                (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() >= nacimiento.getDate());
            const edadReal = cumplioEsteAnio ? edad : edad - 1;
            if (edadReal < 18) throw new Error('El chofer debe ser mayor de 18 años');
            return true;
        }),

    // CORREGIDO: Límite extendido a 20 caracteres
    body('telefono')
        .notEmpty().withMessage('El teléfono es obligatorio')
        .isNumeric().withMessage('El teléfono debe contener solo números')
        .isLength({ min: 8, max: 20 }).withMessage('Teléfono inválido (debe tener entre 8 y 20 números)')
        .custom(async (value, { req }) => {
            // Excluye el propio registro del chequeo de unicidad
            const chofer = await db.Chofer.findOne({
                where: {
                    telefono: value,
                    id_chofer: { [Op.ne]: req.params.id }
                }
            });
            if (chofer) throw new Error('El teléfono ya está registrado');
            return true;
        }),

    body('direccion')
        .notEmpty().withMessage('La dirección es obligatoria')
        .isLength({ min: 5 }).withMessage('Ingrese una dirección válida'),

    body('email')
        .optional({ checkFalsy: true })
        .isEmail().withMessage('El email ingresado no es válido')
        .normalizeEmail(),

    body('fechaIngreso')
        .notEmpty().withMessage('La fecha de ingreso es obligatoria').bail()
        .isDate().withMessage('Fecha de ingreso inválida').bail()
        .custom((value) => {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const ingreso = new Date(value);
            if (ingreso > hoy) throw new Error('La fecha de ingreso no puede ser futura');
            return true;
        }),

    body('activo-inactivo')
        .notEmpty().withMessage('El estado es obligatorio')
        .isIn(['Activo', 'Inactivo']).withMessage('Estado inválido'),

    body('numero_licencia')
        .notEmpty().withMessage('El número de licencia es obligatorio')
        .isLength({ min: 8, max: 16 }).withMessage('Número de licencia inválido'),

    body('categoria')
        .notEmpty().withMessage('La categoría de licencia es obligatoria')
        .isIn(['A', 'B1', 'B2', 'C', 'D', 'E', 'G']).withMessage('Categoría inválida'),

    body('fecha_emision')
        .notEmpty().withMessage('La fecha de emisión es obligatoria').bail()
        .isDate().withMessage('Fecha de emisión inválida').bail()
        .custom((value) => {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const emision = new Date(value);
            if (emision > hoy) throw new Error('La fecha de emisión no puede ser futura');
            return true;
        }),

    body('fecha_vencimiento')
        .notEmpty().withMessage('La fecha de vencimiento es obligatoria').bail()
        .isDate().withMessage('Fecha de vencimiento inválida').bail()
        .custom((value, { req }) => {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const vencimiento = new Date(value);
            if (vencimiento < hoy) throw new Error('La licencia está vencida');
            if (req.body.fecha_emision) {
                const emision = new Date(req.body.fecha_emision);
                if (vencimiento <= emision) throw new Error('El vencimiento debe ser posterior a la fecha de emisión');
            }
            return true;
        }),
];

module.exports = { choferVAlidation, choferEditValidation };