import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { pool } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'SECRETO_JWT_SUPER_SEGURO';

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
};

passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            const [rows] = await pool.query(
                'SELECT id, nombre, email, es_admin FROM usuarios WHERE id = ?',
                [jwt_payload.id]
            );

            if (rows.length > 0) {
                return done(null, rows[0]);
            }

            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    })
);

// Middleware de Passport: exige un JWT válido en el header Authorization.
// Se personaliza la respuesta para que un 401 siempre devuelva JSON.
export const verificarAutenticacion = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (error, usuario) => {
        if (error) return next(error);

        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado. Token ausente, inválido o expirado.'
            });
        }

        req.user = usuario;
        return next();
    })(req, res, next);
};

// Middleware opcional para rutas exclusivas de administradores
export const verificarAdmin = (req, res, next) => {
    if (req.user && req.user.es_admin) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren privilegios de administrador.'
    });
};
