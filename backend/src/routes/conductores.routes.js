import express from 'express';
import { body } from 'express-validator';
import {
    listarConductores,
    obtenerConductor,
    crearConductor,
    actualizarConductor,
    eliminarConductor
} from '../controllers/conductores.controller.js';
import { verificarAutenticacion } from '../middlewares/auth.js';
import {
    verificarValidaciones,
    validarId,
    REGEX_SOLO_LETRAS,
    fechaPosterior
} from '../middlewares/validaciones.js';

const router = express.Router();

const validarConductor = [
    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ max: 50 })
        .withMessage('El nombre no puede tener más de 50 caracteres')
        .matches(REGEX_SOLO_LETRAS)
        .withMessage('El nombre no puede contener números ni caracteres especiales'),
    body('apellido')
        .trim()
        .notEmpty()
        .withMessage('El apellido es obligatorio')
        .isLength({ max: 50 })
        .withMessage('El apellido no puede tener más de 50 caracteres')
        .matches(REGEX_SOLO_LETRAS)
        .withMessage('El apellido no puede contener números ni caracteres especiales'),
    body('numero_de_documento')
        .trim()
        .matches(/^\d{7,8}$/)
        .withMessage('El documento debe contener solo números (7 u 8 dígitos)'),
    body('numero_de_licencia')
        .trim()
        .notEmpty()
        .withMessage('El número de licencia es obligatorio')
        .isLength({ max: 30 })
        .withMessage('El número de licencia no puede tener más de 30 caracteres'),
    body('fecha_de_alta_de_licencia')
        .isISO8601()
        .withMessage('La fecha de alta de la licencia no es válida'),
    body('fecha_de_vencimiento_de_licencia')
        .isISO8601()
        .withMessage('La fecha de vencimiento de la licencia no es válida')
        .custom(fechaPosterior('fecha_de_alta_de_licencia'))
        .withMessage('La fecha de vencimiento debe ser posterior a la fecha de alta'),
    verificarValidaciones
];

// Todas las rutas de conductores requieren autenticación
router.use(verificarAutenticacion);

router.get('/', listarConductores);
router.get('/:id', validarId, obtenerConductor);
router.post('/', validarConductor, crearConductor);
router.put('/:id', validarId, validarConductor, actualizarConductor);
router.delete('/:id', validarId, eliminarConductor);

export default router;
