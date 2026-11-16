import express from 'express';
import { body } from 'express-validator';
import {
    registrarUsuario,
    iniciarSesion,
    obtenerPerfil,
    listarUsuarios
} from '../controllers/auth.controller.js';
import {
    verificarValidaciones,
    REGEX_SOLO_LETRAS
} from '../middlewares/validaciones.js';
import {
    verificarAutenticacion,
    verificarAdmin
} from '../middlewares/auth.js';

const router = express.Router();

const validarRegistro = [
    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ max: 100 })
        .withMessage('El nombre no puede tener más de 100 caracteres')
        .matches(REGEX_SOLO_LETRAS)
        .withMessage('El nombre no puede contener números ni caracteres especiales'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Debe ingresar un email válido')
        .normalizeEmail(),
    body('contraseña')
        .isLength({ min: 6, max: 72 })
        .withMessage('La contraseña debe tener entre 6 y 72 caracteres'),
    verificarValidaciones
];

const validarLogin = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Debe ingresar un email válido')
        .normalizeEmail(),
    body('contraseña')
        .notEmpty()
        .withMessage('La contraseña es obligatoria'),
    verificarValidaciones
];

// Rutas públicas
router.post('/register', validarRegistro, registrarUsuario);
router.post('/login', validarLogin, iniciarSesion);

// Rutas protegidas con JWT + Passport
router.get('/me', verificarAutenticacion, obtenerPerfil);

// Ruta exclusiva para administradores: un usuario común recibe 403
router.get(
    '/usuarios',
    verificarAutenticacion,
    verificarAdmin,
    listarUsuarios
);

export default router;
