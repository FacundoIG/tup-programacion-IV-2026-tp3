import { param, validationResult } from 'express-validator';

// Solo letras (con acentos y ñ), espacios, apóstrofes y guiones.
// Se usa en nombres y apellidos para impedir el ingreso de números.
export const REGEX_SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$/;

// Devuelve los errores generados por express-validator
export const verificarValidaciones = (req, res, next) => {
    const validacion = validationResult(req);

    if (!validacion.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Falla de validación',
            errores: validacion.array()
        });
    }

    next();
};

// Validación reutilizable del parámetro :id
export const validarId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),
    verificarValidaciones
];

// Valida que una fecha de vencimiento sea posterior a la de alta
export const fechaPosterior = (campoAnterior) => (valor, { req }) => {
    if (!valor || !req.body[campoAnterior]) return true;

    return new Date(valor) > new Date(req.body[campoAnterior]);
};
