import { pool } from '../config/db.js';

const SELECT_VIAJES = `
    SELECT
        v.*,
        veh.patente,
        veh.marca AS vehiculo_marca,
        veh.modelo AS vehiculo_modelo,
        c.nombre AS conductor_nombre,
        c.apellido AS conductor_apellido,
        c.numero_de_documento AS conductor_documento
    FROM viajes v
    INNER JOIN vehiculos veh ON veh.id = v.vehiculo_id
    INNER JOIN conductores c ON c.id = v.conductor_id
`;

const calcularTotalKilometros = (viajes) =>
    viajes.reduce((total, viaje) => total + Number(viaje.kilometros), 0);

// GET /api/viajes?vehiculo_id=1&conductor_id=2
export const listarViajes = async (req, res) => {
    const { vehiculo_id, conductor_id } = req.query;
    const condiciones = [];
    const valores = [];

    if (vehiculo_id !== undefined) {
        condiciones.push('v.vehiculo_id = ?');
        valores.push(vehiculo_id);
    }

    if (conductor_id !== undefined) {
        condiciones.push('v.conductor_id = ?');
        valores.push(conductor_id);
    }

    const where = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

    try {
        const [filas] = await pool.query(
            `${SELECT_VIAJES} ${where} ORDER BY v.fecha_de_salida DESC, v.id DESC`,
            valores
        );

        return res.json({
            success: true,
            data: filas,
            totalKilometros: calcularTotalKilometros(filas),
            cantidad: filas.length
        });
    } catch (error) {
        console.error('Error al listar viajes:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al obtener los viajes'
        });
    }
};

// GET /api/viajes/resumen/vehiculos
export const resumenPorVehiculo = async (req, res) => {
    try {
        const [filas] = await pool.query(`
            SELECT
                veh.id AS vehiculo_id,
                veh.patente,
                veh.marca,
                veh.modelo,
                COUNT(v.id) AS cantidad_viajes,
                COALESCE(SUM(v.kilometros), 0) AS total_kilometros
            FROM vehiculos veh
            LEFT JOIN viajes v ON v.vehiculo_id = veh.id
            GROUP BY veh.id, veh.patente, veh.marca, veh.modelo
            ORDER BY total_kilometros DESC
        `);

        return res.json({ success: true, data: filas });
    } catch (error) {
        console.error('Error al obtener resumen por vehículo:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al obtener el resumen por vehículo'
        });
    }
};

// GET /api/viajes/resumen/conductores
export const resumenPorConductor = async (req, res) => {
    try {
        const [filas] = await pool.query(`
            SELECT
                c.id AS conductor_id,
                c.nombre,
                c.apellido,
                c.numero_de_documento,
                COUNT(v.id) AS cantidad_viajes,
                COALESCE(SUM(v.kilometros), 0) AS total_kilometros
            FROM conductores c
            LEFT JOIN viajes v ON v.conductor_id = c.id
            GROUP BY c.id, c.nombre, c.apellido, c.numero_de_documento
            ORDER BY total_kilometros DESC
        `);

        return res.json({ success: true, data: filas });
    } catch (error) {
        console.error('Error al obtener resumen por conductor:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al obtener el resumen por conductor'
        });
    }
};

// GET /api/viajes/vehiculo/:id/historial
export const historialPorVehiculo = async (req, res) => {
    const { id } = req.params;

    try {
        const [vehiculo] = await pool.query(
            'SELECT id, marca, modelo, patente FROM vehiculos WHERE id = ?',
            [id]
        );

        if (vehiculo.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }

        const [viajes] = await pool.query(
            `${SELECT_VIAJES} WHERE v.vehiculo_id = ? ORDER BY v.fecha_de_salida DESC`,
            [id]
        );

        return res.json({
            success: true,
            data: viajes,
            vehiculo: vehiculo[0],
            totalKilometros: calcularTotalKilometros(viajes),
            cantidad: viajes.length
        });
    } catch (error) {
        console.error('Error al obtener historial por vehículo:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al obtener el historial del vehículo'
        });
    }
};

// GET /api/viajes/conductor/:id/historial
export const historialPorConductor = async (req, res) => {
    const { id } = req.params;

    try {
        const [conductor] = await pool.query(
            `SELECT id, nombre, apellido, numero_de_documento
             FROM conductores WHERE id = ?`,
            [id]
        );

        if (conductor.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Conductor no encontrado'
            });
        }

        const [viajes] = await pool.query(
            `${SELECT_VIAJES} WHERE v.conductor_id = ? ORDER BY v.fecha_de_salida DESC`,
            [id]
        );

        return res.json({
            success: true,
            data: viajes,
            conductor: conductor[0],
            totalKilometros: calcularTotalKilometros(viajes),
            cantidad: viajes.length
        });
    } catch (error) {
        console.error('Error al obtener historial por conductor:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al obtener el historial del conductor'
        });
    }
};

// GET /api/viajes/:id
export const obtenerViaje = async (req, res) => {
    const { id } = req.params;

    try {
        const [filas] = await pool.query(
            `${SELECT_VIAJES} WHERE v.id = ?`,
            [id]
        );

        if (filas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Viaje no encontrado'
            });
        }

        return res.json({ success: true, data: filas[0] });
    } catch (error) {
        console.error('Error al obtener viaje:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al obtener el viaje'
        });
    }
};

const verificarRelaciones = async (vehiculo_id, conductor_id) => {
    const [vehiculo] = await pool.query(
        'SELECT id FROM vehiculos WHERE id = ?',
        [vehiculo_id]
    );

    if (vehiculo.length === 0) {
        return 'El vehículo indicado no existe';
    }

    const [conductor] = await pool.query(
        'SELECT id FROM conductores WHERE id = ?',
        [conductor_id]
    );

    if (conductor.length === 0) {
        return 'El conductor indicado no existe';
    }

    return null;
};

// POST /api/viajes
export const crearViaje = async (req, res) => {
    const {
        vehiculo_id,
        conductor_id,
        fecha_de_salida,
        fecha_de_llegada,
        origen,
        destino,
        kilometros,
        observaciones
    } = req.body;

    try {
        const errorRelacion = await verificarRelaciones(vehiculo_id, conductor_id);

        if (errorRelacion) {
            return res.status(400).json({ success: false, message: errorRelacion });
        }

        const [resultado] = await pool.query(
            `INSERT INTO viajes
             (vehiculo_id, conductor_id, fecha_de_salida, fecha_de_llegada,
              origen, destino, kilometros, observaciones)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                vehiculo_id,
                conductor_id,
                fecha_de_salida,
                fecha_de_llegada,
                origen.trim(),
                destino.trim(),
                Number(kilometros),
                observaciones ? observaciones.trim() : null
            ]
        );

        const [filas] = await pool.query(
            `${SELECT_VIAJES} WHERE v.id = ?`,
            [resultado.insertId]
        );

        return res.status(201).json({
            success: true,
            message: 'Viaje registrado correctamente',
            data: filas[0]
        });
    } catch (error) {
        console.error('Error al crear viaje:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al registrar el viaje'
        });
    }
};

// PUT /api/viajes/:id
export const actualizarViaje = async (req, res) => {
    const { id } = req.params;
    const {
        vehiculo_id,
        conductor_id,
        fecha_de_salida,
        fecha_de_llegada,
        origen,
        destino,
        kilometros,
        observaciones
    } = req.body;

    try {
        const errorRelacion = await verificarRelaciones(vehiculo_id, conductor_id);

        if (errorRelacion) {
            return res.status(400).json({ success: false, message: errorRelacion });
        }

        const [resultado] = await pool.query(
            `UPDATE viajes
             SET vehiculo_id = ?, conductor_id = ?, fecha_de_salida = ?,
                 fecha_de_llegada = ?, origen = ?, destino = ?, kilometros = ?,
                 observaciones = ?
             WHERE id = ?`,
            [
                vehiculo_id,
                conductor_id,
                fecha_de_salida,
                fecha_de_llegada,
                origen.trim(),
                destino.trim(),
                Number(kilometros),
                observaciones ? observaciones.trim() : null,
                id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Viaje no encontrado'
            });
        }

        const [filas] = await pool.query(
            `${SELECT_VIAJES} WHERE v.id = ?`,
            [id]
        );

        return res.json({
            success: true,
            message: 'Viaje actualizado correctamente',
            data: filas[0]
        });
    } catch (error) {
        console.error('Error al actualizar viaje:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al actualizar el viaje'
        });
    }
};

// DELETE /api/viajes/:id
export const eliminarViaje = async (req, res) => {
    const { id } = req.params;

    try {
        const [resultado] = await pool.query(
            'DELETE FROM viajes WHERE id = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Viaje no encontrado'
            });
        }

        return res.json({
            success: true,
            message: 'Viaje eliminado correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar viaje:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al eliminar el viaje'
        });
    }
};
