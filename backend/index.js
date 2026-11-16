import './src/config/env.js';
import express from 'express';
import cors from 'cors';
import passport from 'passport';

// Carga la estrategia JWT de Passport
import './src/middlewares/auth.js';

import authRoutes from './src/routes/auth.routes.js';
import vehiculosRoutes from './src/routes/vehiculos.routes.js';
import conductoresRoutes from './src/routes/conductores.routes.js';
import viajesRoutes from './src/routes/viajes.routes.js';
import { probarConexion } from './src/config/db.js';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ mensaje: 'API Backend de Gestión de Transporte funcionando correctamente' });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/conductores', conductoresRoutes);
app.use('/api/viajes', viajesRoutes);

// Ruta no encontrada (404)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
});

// Manejo centralizado de errores
app.use((error, req, res, next) => {
    const status = error.status || error.statusCode || 500;

    if (status >= 500) {
        console.error('Error no controlado:', error);
    }

    res.status(status).json({
        success: false,
        message:
            status === 400
                ? 'El cuerpo de la solicitud no contiene un JSON válido'
                : 'Error interno del servidor'
    });
});

const PORT = Number(process.env.PORT) || 3000;

const iniciarServidor = async () => {
    try {
        await probarConexion();
        console.log('Conexión a MySQL establecida correctamente');

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo conectar a MySQL:', error.message);

        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('');
            console.error('El usuario o la contraseña de MySQL son incorrectos.');
            console.error('Abrí backend/.env y revisá DB_USER y DB_PASSWORD.');
            console.error('Ejemplo: DB_USER=root y DB_PASSWORD=tu_contraseña_de_mysql');
        } else {
            console.error('Verificá las variables de entorno del archivo backend/.env');
        }

        process.exit(1);
    }
};

iniciarServidor();
