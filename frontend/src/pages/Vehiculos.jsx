import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    API_URL,
    sinNegativos,
    obtenerMensajeError
} from '../utils/validaciones';

const FORM_VACIO = {
    marca: '',
    modelo: '',
    patente: '',
    anio: '',
    capacidad_de_carga: ''
};

export default function Vehiculos() {
    const { fetchOut } = useAuth();
    const [vehiculos, setVehiculos] = useState([]);
    const [form, setForm] = useState(FORM_VACIO);
    const [editandoId, setEditandoId] = useState(null);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const cargarVehiculos = async () => {
        try {
            const response = await fetchOut(`${API_URL}/vehiculos`);
            if (!response.ok) throw new Error(await obtenerMensajeError(response));
            const data = await response.json();
            setVehiculos(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarVehiculos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        const nuevoValor =
            name === 'capacidad_de_carga' ? sinNegativos(value) : value;
        setForm((anterior) => ({ ...anterior, [name]: nuevoValor }));
    };

    const limpiarFormulario = () => {
        setForm(FORM_VACIO);
        setEditandoId(null);
    };

    const validar = () => {
        if (
            !form.marca.trim() ||
            !form.modelo.trim() ||
            !form.patente.trim() ||
            !form.anio ||
            form.capacidad_de_carga === ''
        ) {
            return 'Todos los campos son obligatorios';
        }

        const anio = Number(form.anio);
        if (!Number.isInteger(anio) || anio < 1900 || anio > new Date().getFullYear() + 1) {
            return 'El año debe ser un número entero válido';
        }

        const capacidad = Number(form.capacidad_de_carga);
        if (Number.isNaN(capacidad) || capacidad < 0) {
            return 'La capacidad de carga no puede ser negativa';
        }

        return '';
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setExito('');

        const mensajeValidacion = validar();
        if (mensajeValidacion) {
            setError(mensajeValidacion);
            return;
        }

        setGuardando(true);

        try {
            const url = editandoId
                ? `${API_URL}/vehiculos/${editandoId}`
                : `${API_URL}/vehiculos`;

            const response = await fetchOut(url, {
                method: editandoId ? 'PUT' : 'POST',
                body: JSON.stringify({
                    marca: form.marca,
                    modelo: form.modelo,
                    patente: form.patente,
                    anio: Number(form.anio),
                    capacidad_de_carga: Number(form.capacidad_de_carga)
                })
            });

            if (!response.ok) throw new Error(await obtenerMensajeError(response));

            setExito(editandoId ? 'Vehículo actualizado correctamente' : 'Vehículo creado correctamente');
            limpiarFormulario();
            await cargarVehiculos();
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    const editar = (vehiculo) => {
        setEditandoId(vehiculo.id);
        setForm({
            marca: vehiculo.marca,
            modelo: vehiculo.modelo,
            patente: vehiculo.patente,
            anio: String(vehiculo.anio),
            capacidad_de_carga: String(vehiculo.capacidad_de_carga)
        });
        setError('');
        setExito('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const eliminar = async (vehiculo) => {
        const confirmado = window.confirm(
            `¿Eliminar el vehículo ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.patente})?`
        );
        if (!confirmado) return;

        setError('');
        setExito('');

        try {
            const response = await fetchOut(`${API_URL}/vehiculos/${vehiculo.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error(await obtenerMensajeError(response));

            setExito('Vehículo eliminado correctamente');
            if (editandoId === vehiculo.id) limpiarFormulario();
            await cargarVehiculos();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <section>
            <div className="seccion__encabezado">
                <div>
                    <h1>Vehículos</h1>
                    <p>Alta, modificación y eliminación de los vehículos de la flota.</p>
                </div>
            </div>

            {error && <div className="alerta alerta--error">{error}</div>}
            {exito && <div className="alerta alerta--exito">{exito}</div>}

            <div className="grid-dos">
                <div className="panel">
                    <h2>{editandoId ? 'Editar vehículo' : 'Nuevo vehículo'}</h2>

                    <form className="formulario" onSubmit={handleSubmit} noValidate>
                        <label>
                            Marca
                            <input
                                type="text"
                                name="marca"
                                value={form.marca}
                                onChange={handleChange}
                                maxLength={50}
                                placeholder="Ej.: Mercedes-Benz"
                            />
                        </label>

                        <label>
                            Modelo
                            <input
                                type="text"
                                name="modelo"
                                value={form.modelo}
                                onChange={handleChange}
                                maxLength={50}
                                placeholder="Ej.: Sprinter 515"
                            />
                        </label>

                        <label>
                            Patente
                            <input
                                type="text"
                                name="patente"
                                value={form.patente}
                                onChange={handleChange}
                                maxLength={10}
                                placeholder="Ej.: AB123CD"
                            />
                        </label>

                        <label>
                            Año
                            <input
                                type="number"
                                name="anio"
                                value={form.anio}
                                onChange={handleChange}
                                min={1900}
                                max={new Date().getFullYear() + 1}
                                step={1}
                                placeholder="Ej.: 2022"
                            />
                        </label>

                        <label>
                            Capacidad de carga (kg)
                            <input
                                type="number"
                                name="capacidad_de_carga"
                                value={form.capacidad_de_carga}
                                onChange={handleChange}
                                min={0}
                                step="0.01"
                                placeholder="No puede ser negativa"
                            />
                        </label>

                        <div className="formulario__acciones">
                            <button type="submit" className="btn btn--primario" disabled={guardando}>
                                {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear vehículo'}
                            </button>

                            {editandoId && (
                                <button
                                    type="button"
                                    className="btn btn--secundario"
                                    onClick={limpiarFormulario}
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="panel">
                    <h2>Listado de vehículos</h2>

                    {cargando ? (
                        <p className="estado">Cargando vehículos...</p>
                    ) : vehiculos.length === 0 ? (
                        <p className="estado">Todavía no hay vehículos registrados.</p>
                    ) : (
                        <div className="tabla-contenedor">
                            <table className="tabla">
                                <thead>
                                    <tr>
                                        <th>Marca</th>
                                        <th>Modelo</th>
                                        <th>Patente</th>
                                        <th>Año</th>
                                        <th>Carga (kg)</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vehiculos.map((vehiculo) => (
                                        <tr key={vehiculo.id}>
                                            <td>{vehiculo.marca}</td>
                                            <td>{vehiculo.modelo}</td>
                                            <td>{vehiculo.patente}</td>
                                            <td>{vehiculo.anio}</td>
                                            <td>{Number(vehiculo.capacidad_de_carga).toLocaleString('es-AR')}</td>
                                            <td className="acciones">
                                                <button
                                                    type="button"
                                                    className="btn btn--chico btn--secundario"
                                                    onClick={() => editar(vehiculo)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn--chico btn--peligro"
                                                    onClick={() => eliminar(vehiculo)}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
