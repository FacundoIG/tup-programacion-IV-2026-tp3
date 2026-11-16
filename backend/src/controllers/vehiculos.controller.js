import { pool } from '../config/db.js';

// GET /api/vehiculos
export const listarVehiculos = async (req, res) => {
    try {
        const [filas] = await pool.query(
            'SELECT * FROM vehiculos ORDER BY id ASC'
        );

        return res.json({ success: true, data: filas });
    } catch (error) {
        console.error('Error al listar vehículos:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al obtener los vehículos'
        });
    }
};

// GET /api/vehiculos/:id
export const obtenerVehiculo = async (req, res) => {
    const { id } = req.params;

    try {
        const [filas] = await pool.query(
            'SELECT * FROM vehiculos WHERE id = ?',
            [id]
        );

        if (filas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }

        return res.json({ success: true, data: filas[0] });
    } catch (error) {
        console.error('Error al obtener vehículo:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al obtener el vehículo'
        });
    }
};

// POST /api/vehiculos
export const crearVehiculo = async (req, res) => {
    const { marca, modelo, patente, anio, capacidad_de_carga } = req.body;

    try {
        const [resultado] = await pool.query(
            `INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_de_carga)
             VALUES (?, ?, ?, ?, ?)`,
            [
                marca.trim(),
                modelo.trim(),
                patente.toUpperCase().trim(),
                Number(anio),
                Number(capacidad_de_carga)
            ]
        );

        const [filas] = await pool.query(
            'SELECT * FROM vehiculos WHERE id = ?',
            [resultado.insertId]
        );

        return res.status(201).json({
            success: true,
            message: 'Vehículo creado correctamente',
            data: filas[0]
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'La patente ya está registrada'
            });
        }

        console.error('Error al crear vehículo:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al crear el vehículo'
        });
    }
};

// PUT /api/vehiculos/:id
export const actualizarVehiculo = async (req, res) => {
    const { id } = req.params;
    const { marca, modelo, patente, anio, capacidad_de_carga } = req.body;

    try {
        const [resultado] = await pool.query(
            `UPDATE vehiculos
             SET marca = ?, modelo = ?, patente = ?, anio = ?, capacidad_de_carga = ?
             WHERE id = ?`,
            [
                marca.trim(),
                modelo.trim(),
                patente.toUpperCase().trim(),
                Number(anio),
                Number(capacidad_de_carga),
                id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }

        const [filas] = await pool.query(
            'SELECT * FROM vehiculos WHERE id = ?',
            [id]
        );

        return res.json({
            success: true,
            message: 'Vehículo actualizado correctamente',
            data: filas[0]
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'La patente ya está registrada'
            });
        }

        console.error('Error al actualizar vehículo:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al actualizar el vehículo'
        });
    }
};

// DELETE /api/vehiculos/:id
export const eliminarVehiculo = async (req, res) => {
    const { id } = req.params;

    try {
        const [resultado] = await pool.query(
            'DELETE FROM vehiculos WHERE id = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }

        return res.json({
            success: true,
            message: 'Vehículo eliminado correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar vehículo:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al eliminar el vehículo'
        });
    }
};
