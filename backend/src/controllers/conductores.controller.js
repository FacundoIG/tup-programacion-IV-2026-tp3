import { pool } from '../config/db.js';

// GET /api/conductores
export const listarConductores = async (req, res) => {
    try {
        const [filas] = await pool.query(
            'SELECT * FROM conductores ORDER BY id ASC'
        );

        return res.json({ success: true, data: filas });
    } catch (error) {
        console.error('Error al listar conductores:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al obtener los conductores'
        });
    }
};

// GET /api/conductores/:id
export const obtenerConductor = async (req, res) => {
    const { id } = req.params;

    try {
        const [filas] = await pool.query(
            'SELECT * FROM conductores WHERE id = ?',
            [id]
        );

        if (filas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Conductor no encontrado'
            });
        }

        return res.json({ success: true, data: filas[0] });
    } catch (error) {
        console.error('Error al obtener conductor:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al obtener el conductor'
        });
    }
};

// POST /api/conductores
export const crearConductor = async (req, res) => {
    const {
        nombre,
        apellido,
        numero_de_documento,
        numero_de_licencia,
        fecha_de_alta_de_licencia,
        fecha_de_vencimiento_de_licencia
    } = req.body;

    try {
        const [resultado] = await pool.query(
            `INSERT INTO conductores
             (nombre, apellido, numero_de_documento, numero_de_licencia,
              fecha_de_alta_de_licencia, fecha_de_vencimiento_de_licencia)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                nombre.trim(),
                apellido.trim(),
                numero_de_documento.trim(),
                numero_de_licencia.trim(),
                fecha_de_alta_de_licencia,
                fecha_de_vencimiento_de_licencia
            ]
        );

        const [filas] = await pool.query(
            'SELECT * FROM conductores WHERE id = ?',
            [resultado.insertId]
        );

        return res.status(201).json({
            success: true,
            message: 'Conductor creado correctamente',
            data: filas[0]
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'El documento o el número de licencia ya están registrados'
            });
        }

        console.error('Error al crear conductor:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al crear el conductor'
        });
    }
};

// PUT /api/conductores/:id
export const actualizarConductor = async (req, res) => {
    const { id } = req.params;
    const {
        nombre,
        apellido,
        numero_de_documento,
        numero_de_licencia,
        fecha_de_alta_de_licencia,
        fecha_de_vencimiento_de_licencia
    } = req.body;

    try {
        const [resultado] = await pool.query(
            `UPDATE conductores
             SET nombre = ?, apellido = ?, numero_de_documento = ?,
                 numero_de_licencia = ?, fecha_de_alta_de_licencia = ?,
                 fecha_de_vencimiento_de_licencia = ?
             WHERE id = ?`,
            [
                nombre.trim(),
                apellido.trim(),
                numero_de_documento.trim(),
                numero_de_licencia.trim(),
                fecha_de_alta_de_licencia,
                fecha_de_vencimiento_de_licencia,
                id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Conductor no encontrado'
            });
        }

        const [filas] = await pool.query(
            'SELECT * FROM conductores WHERE id = ?',
            [id]
        );

        return res.json({
            success: true,
            message: 'Conductor actualizado correctamente',
            data: filas[0]
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'El documento o el número de licencia ya están registrados'
            });
        }

        console.error('Error al actualizar conductor:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al actualizar el conductor'
        });
    }
};

// DELETE /api/conductores/:id
export const eliminarConductor = async (req, res) => {
    const { id } = req.params;

    try {
        const [resultado] = await pool.query(
            'DELETE FROM conductores WHERE id = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Conductor no encontrado'
            });
        }

        return res.json({
            success: true,
            message: 'Conductor eliminado correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar conductor:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al eliminar el conductor'
        });
    }
};
