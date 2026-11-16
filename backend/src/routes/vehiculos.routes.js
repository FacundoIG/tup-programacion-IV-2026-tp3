import express from 'express';
import { body } from 'express-validator';
import {
    listarVehiculos,
    obtenerVehiculo,
    crearVehiculo,
    actualizarVehiculo,
    eliminarVehiculo
} from '../controllers/vehiculos.controller.js';
import { verificarAutenticacion } from '../middlewares/auth.js';
import {
    verificarValidaciones,
    validarId
} from '../middlewares/validaciones.js';

const router = express.Router();

const validarVehiculo = [
    body('marca')
        .trim()
        .notEmpty()
        .withMessage('La marca es obligatoria')
        .isLength({ max: 50 })
        .withMessage('La marca no puede tener más de 50 caracteres'),
    body('modelo')
        .trim()
        .notEmpty()
        .withMessage('El modelo es obligatorio')
        .isLength({ max: 50 })
        .withMessage('El modelo no puede tener más de 50 caracteres'),
    body('patente')
        .trim()
        .notEmpty()
        .withMessage('La patente es obligatoria')
        .matches(/^[A-Za-z0-9-]{5,10}$/)
        .withMessage('La patente debe tener entre 5 y 10 caracteres alfanuméricos'),
    body('anio')
        .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
        .withMessage('El año debe ser un número entero válido'),
    body('capacidad_de_carga')
        .isFloat({ min: 0 })
        .withMessage('La capacidad de carga no puede ser negativa')
        .toFloat(),
    verificarValidaciones
];

// Todas las rutas de vehículos requieren autenticación
router.use(verificarAutenticacion);

router.get('/', listarVehiculos);
router.get('/:id', validarId, obtenerVehiculo);
router.post('/', validarVehiculo, crearVehiculo);
router.put('/:id', validarId, validarVehiculo, actualizarVehiculo);
router.delete('/:id', validarId, eliminarVehiculo);

export default router;
