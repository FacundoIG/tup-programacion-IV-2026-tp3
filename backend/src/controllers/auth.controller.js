import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'SECRETO_JWT_SUPER_SEGURO';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '4h';

// POST /api/auth/register
export const registrarUsuario = async (req, res) => {
    const { nombre, email, contraseña } = req.body;

    try {
        const [existe] = await pool.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // La contraseña nunca se guarda en texto plano
        const contraseñaHash = await bcrypt.hash(contraseña, 10);

        const [resultado] = await pool.query(
            'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
            [nombre.trim(), email.toLowerCase().trim(), contraseñaHash]
        );

        return res.status(201).json({
            success: true,
            message: 'Usuario registrado correctamente',
            data: {
                id: resultado.insertId,
                nombre: nombre.trim(),
                email: email.toLowerCase().trim()
            }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        console.error('Error al registrar usuario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al registrar el usuario'
        });
    }
};

// POST /api/auth/login
export const iniciarSesion = async (req, res) => {
    const { email, contraseña } = req.body;

    try {
        const [filas] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email.toLowerCase().trim()]
        );

        if (filas.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Email o contraseña incorrectos'
            });
        }

        const usuario = filas[0];
        const passwordValido = await bcrypt.compare(contraseña, usuario.password);

        if (!passwordValido) {
            return res.status(401).json({
                success: false,
                message: 'Email o contraseña incorrectos'
            });
        }

        const payload = {
            id: usuario.id,
            nombre: usuario.nombre,
            es_admin: Boolean(usuario.es_admin)
        };

        // El enunciado exige una expiración de 4 horas
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        return res.json({
            success: true,
            token,
            nombre: usuario.nombre,
            es_admin: Boolean(usuario.es_admin)
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al iniciar sesión'
        });
    }
};

// GET /api/auth/me (ruta protegida)
export const obtenerPerfil = async (req, res) => {
    return res.json({
        success: true,
        data: req.user
    });
};

// GET /api/auth/usuarios (ruta protegida, solo administradores)
export const listarUsuarios = async (req, res) => {
    try {
        const [filas] = await pool.query(
            'SELECT id, nombre, email, es_admin, creado_en FROM usuarios ORDER BY id ASC'
        );

        return res.json({ success: true, data: filas });
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al obtener los usuarios'
        });
    }
};
