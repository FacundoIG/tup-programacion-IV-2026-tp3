import express from 'express';
import { body, query } from 'express-validator';
import {
    listarViajes,
    obtenerViaje,
    crearViaje,
    actualizarViaje,
    eliminarViaje,
    resumenPorVehiculo,
    resumenPorConductor,
    historialPorVehiculo,
    historialPorConductor
} from '../controllers/viajes.controller.js';
import { verificarAutenticacion } from '../middlewares/auth.js';
import {
    verificarValidaciones,
    validarId,
    fechaPosterior
} from '../middlewares/validaciones.js';

const router = express.Router();

const validarViaje = [
    body('vehiculo_id')
        .isInt({ min: 1 })
        .withMessage('Debe seleccionar un vehículo válido'),
    body('conductor_id')
        .isInt({ min: 1 })
        .withMessage('Debe seleccionar un conductor válido'),
    body('fecha_de_salida')
        .isISO8601()
        .withMessage('La fecha de salida no es válida'),
    body('fecha_de_llegada')
        .isISO8601()
        .withMessage('La fecha de llegada no es válida')
        .custom(fechaPosterior('fecha_de_salida'))
        .withMessage('La fecha de llegada debe ser posterior a la fecha de salida'),
    body('origen')
        .trim()
        .notEmpty()
        .withMessage('El origen es obligatorio')
        .isLength({ max: 100 })
        .withMessage('El origen no puede tener más de 100 caracteres'),
    body('destino')
        .trim()
        .notEmpty()
        .withMessage('El destino es obligatorio')
        .isLength({ max: 100 })
        .withMessage('El destino no puede tener más de 100 caracteres'),
    body('kilometros')
        .isFloat({ min: 0 })
        .withMessage('Los kilómetros no pueden ser negativos')
        .toFloat(),
    body('observaciones')
        .optional({ values: 'falsy' })
        .isString()
        .withMessage('Las observaciones deben ser texto')
        .isLength({ max: 1000 })
        .withMessage('Las observaciones no pueden tener más de 1000 caracteres'),
    verificarValidaciones
];

const validarFiltros = [
    query('vehiculo_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El filtro vehiculo_id debe ser un entero positivo'),
    query('conductor_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El filtro conductor_id debe ser un entero positivo'),
    verificarValidaciones
];

// Todas las rutas de viajes requieren autenticación
router.use(verificarAutenticacion);

router.get('/', validarFiltros, listarViajes);

// Rutas específicas (deben ir antes de /:id)
router.get('/resumen/vehiculos', resumenPorVehiculo);
router.get('/resumen/conductores', resumenPorConductor);
router.get('/vehiculo/:id/historial', validarId, historialPorVehiculo);
router.get('/conductor/:id/historial', validarId, historialPorConductor);

router.get('/:id', validarId, obtenerViaje);
router.post('/', validarViaje, crearViaje);
router.put('/:id', validarId, validarViaje, actualizarViaje);
router.delete('/:id', validarId, eliminarViaje);

export default router;
