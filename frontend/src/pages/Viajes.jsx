import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    API_URL,
    sinNegativos,
    obtenerMensajeError,
    aDatetimeLocal
} from '../utils/validaciones';

const FORM_VACIO = {
    vehiculo_id: '',
    conductor_id: '',
    fecha_de_salida: '',
    fecha_de_llegada: '',
    origen: '',
    destino: '',
    kilometros: '',
    observaciones: ''
};

const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return Number.isNaN(date.getTime())
        ? String(fecha)
        : date.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
};

export default function Viajes() {
    const { fetchOut } = useAuth();
    const [vehiculos, setVehiculos] = useState([]);
    const [conductores, setConductores] = useState([]);
    const [viajes, setViajes] = useState([]);
    const [totalKilometros, setTotalKilometros] = useState(0);
    const [filtro, setFiltro] = useState({ vehiculo_id: '', conductor_id: '' });
    const [form, setForm] = useState(FORM_VACIO);
    const [editandoId, setEditandoId] = useState(null);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const cargarCatalogos = async () => {
        try {
            const [resVehiculos, resConductores] = await Promise.all([
                fetchOut(`${API_URL}/vehiculos`),
                fetchOut(`${API_URL}/conductores`)
            ]);

            if (!resVehiculos.ok) throw new Error(await obtenerMensajeError(resVehiculos));
            if (!resConductores.ok) throw new Error(await obtenerMensajeError(resConductores));

            const dataVehiculos = await resVehiculos.json();
            const dataConductores = await resConductores.json();

            setVehiculos(dataVehiculos.data);
            setConductores(dataConductores.data);
        } catch (err) {
            setError(err.message);
        }
    };

    const cargarViajes = async () => {
        try {
            setCargando(true);
            const params = new URLSearchParams();
            if (filtro.vehiculo_id) params.append('vehiculo_id', filtro.vehiculo_id);
            if (filtro.conductor_id) params.append('conductor_id', filtro.conductor_id);

            const query = params.toString() ? `?${params.toString()}` : '';
            const response = await fetchOut(`${API_URL}/viajes${query}`);

            if (!response.ok) throw new Error(await obtenerMensajeError(response));

            const data = await response.json();
            setViajes(data.data);
            setTotalKilometros(data.totalKilometros);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarCatalogos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        cargarViajes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtro.vehiculo_id, filtro.conductor_id]);

    const handleFiltro = (event) => {
        const { name, value } = event.target;
        setFiltro((anterior) => ({ ...anterior, [name]: value }));
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        const nuevoValor = name === 'kilometros' ? sinNegativos(value) : value;
        setForm((anterior) => ({ ...anterior, [name]: nuevoValor }));
    };

    const limpiarFormulario = () => {
        setForm(FORM_VACIO);
        setEditandoId(null);
    };

    const validar = () => {
        if (
            !form.vehiculo_id ||
            !form.conductor_id ||
            !form.fecha_de_salida ||
            !form.fecha_de_llegada ||
            !form.origen.trim() ||
            !form.destino.trim() ||
            form.kilometros === ''
        ) {
            return 'Completá todos los campos obligatorios';
        }

        if (new Date(form.fecha_de_llegada) <= new Date(form.fecha_de_salida)) {
            return 'La fecha de llegada debe ser posterior a la fecha de salida';
        }

        const kilometros = Number(form.kilometros);
        if (Number.isNaN(kilometros) || kilometros < 0) {
            return 'Los kilómetros no pueden ser negativos';
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
                ? `${API_URL}/viajes/${editandoId}`
                : `${API_URL}/viajes`;

            const response = await fetchOut(url, {
                method: editandoId ? 'PUT' : 'POST',
                body: JSON.stringify({
                    vehiculo_id: Number(form.vehiculo_id),
                    conductor_id: Number(form.conductor_id),
                    fecha_de_salida: form.fecha_de_salida,
                    fecha_de_llegada: form.fecha_de_llegada,
                    origen: form.origen,
                    destino: form.destino,
                    kilometros: Number(form.kilometros),
                    observaciones: form.observaciones
                })
            });

            if (!response.ok) throw new Error(await obtenerMensajeError(response));

            setExito(editandoId ? 'Viaje actualizado correctamente' : 'Viaje registrado correctamente');
            limpiarFormulario();
            await cargarViajes();
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    const editar = (viaje) => {
        setEditandoId(viaje.id);
        setForm({
            vehiculo_id: String(viaje.vehiculo_id),
            conductor_id: String(viaje.conductor_id),
            fecha_de_salida: aDatetimeLocal(viaje.fecha_de_salida),
            fecha_de_llegada: aDatetimeLocal(viaje.fecha_de_llegada),
            origen: viaje.origen,
            destino: viaje.destino,
            kilometros: String(viaje.kilometros),
            observaciones: viaje.observaciones || ''
        });
        setError('');
        setExito('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const eliminar = async (viaje) => {
        const confirmado = window.confirm(
            `¿Eliminar el viaje ${viaje.origen} → ${viaje.destino}?`
        );
        if (!confirmado) return;

        setError('');
        setExito('');

        try {
            const response = await fetchOut(`${API_URL}/viajes/${viaje.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error(await obtenerMensajeError(response));

            setExito('Viaje eliminado correctamente');
            if (editandoId === viaje.id) limpiarFormulario();
            await cargarViajes();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <section>
            <div className="seccion__encabezado">
                <div>
                    <h1>Viajes</h1>
                    <p>Registrá viajes asociando un vehículo y un conductor.</p>
                </div>
            </div>

            {error && <div className="alerta alerta--error">{error}</div>}
            {exito && <div className="alerta alerta--exito">{exito}</div>}

            <div className="grid-dos">
                <div className="panel">
                    <h2>{editandoId ? 'Editar viaje' : 'Nuevo viaje'}</h2>

                    {vehiculos.length === 0 || conductores.length === 0 ? (
                        <div className="alerta alerta--info">
                            Para registrar un viaje primero tenés que cargar al menos un
                            vehículo y un conductor.
                        </div>
                    ) : (
                        <form className="formulario" onSubmit={handleSubmit} noValidate>
                            <label>
                                Vehículo
                                <select name="vehiculo_id" value={form.vehiculo_id} onChange={handleChange}>
                                    <option value="">Seleccioná un vehículo</option>
                                    {vehiculos.map((vehiculo) => (
                                        <option key={vehiculo.id} value={vehiculo.id}>
                                            {vehiculo.patente} – {vehiculo.marca} {vehiculo.modelo}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Conductor
                                <select name="conductor_id" value={form.conductor_id} onChange={handleChange}>
                                    <option value="">Seleccioná un conductor</option>
                                    {conductores.map((conductor) => (
                                        <option key={conductor.id} value={conductor.id}>
                                            {conductor.apellido}, {conductor.nombre} (DNI {conductor.numero_de_documento})
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Fecha y hora de salida
                                <input
                                    type="datetime-local"
                                    name="fecha_de_salida"
                                    value={form.fecha_de_salida}
                                    onChange={handleChange}
                                />
                            </label>

                            <label>
                                Fecha y hora de llegada
                                <input
                                    type="datetime-local"
                                    name="fecha_de_llegada"
                                    value={form.fecha_de_llegada}
                                    onChange={handleChange}
                                />
                            </label>

                            <label>
                                Origen
                                <input
                                    type="text"
                                    name="origen"
                                    value={form.origen}
                                    onChange={handleChange}
                                    maxLength={100}
                                    placeholder="Ej.: La Rioja"
                                />
                            </label>

                            <label>
                                Destino
                                <input
                                    type="text"
                                    name="destino"
                                    value={form.destino}
                                    onChange={handleChange}
                                    maxLength={100}
                                    placeholder="Ej.: Córdoba"
                                />
                            </label>

                            <label>
                                Kilómetros recorridos
                                <input
                                    type="number"
                                    name="kilometros"
                                    value={form.kilometros}
                                    onChange={handleChange}
                                    min={0}
                                    step="0.01"
                                    placeholder="No puede ser negativo"
                                />
                            </label>

                            <label>
                                Observaciones (opcional)
                                <textarea
                                    name="observaciones"
                                    value={form.observaciones}
                                    onChange={handleChange}
                                    maxLength={1000}
                                    rows={3}
                                    placeholder="Detalles del viaje"
                                />
                            </label>

                            <div className="formulario__acciones">
                                <button type="submit" className="btn btn--primario" disabled={guardando}>
                                    {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Registrar viaje'}
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
                    )}
                </div>

                <div className="panel">
                    <h2>Historial de viajes</h2>

                    <div className="filtros">
                        <label>
                            Filtrar por vehículo
                            <select name="vehiculo_id" value={filtro.vehiculo_id} onChange={handleFiltro}>
                                <option value="">Todos los vehículos</option>
                                {vehiculos.map((vehiculo) => (
                                    <option key={vehiculo.id} value={vehiculo.id}>
                                        {vehiculo.patente} – {vehiculo.marca} {vehiculo.modelo}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Filtrar por conductor
                            <select name="conductor_id" value={filtro.conductor_id} onChange={handleFiltro}>
                                <option value="">Todos los conductores</option>
                                {conductores.map((conductor) => (
                                    <option key={conductor.id} value={conductor.id}>
                                        {conductor.apellido}, {conductor.nombre}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="resumen">
                        <div>
                            <span className="resumen__valor">{viajes.length}</span>
                            <span className="resumen__etiqueta">viajes</span>
                        </div>
                        <div>
                            <span className="resumen__valor">
                                {Number(totalKilometros).toLocaleString('es-AR')}
                            </span>
                            <span className="resumen__etiqueta">km totales</span>
                        </div>
                    </div>

                    {cargando ? (
                        <p className="estado">Cargando viajes...</p>
                    ) : viajes.length === 0 ? (
                        <p className="estado">No hay viajes que coincidan con el filtro.</p>
                    ) : (
                        <div className="tabla-contenedor">
                            <table className="tabla">
                                <thead>
                                    <tr>
                                        <th>Salida</th>
                                        <th>Vehículo</th>
                                        <th>Conductor</th>
                                        <th>Recorrido</th>
                                        <th>Km</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viajes.map((viaje) => (
                                        <tr key={viaje.id}>
                                            <td>{formatearFecha(viaje.fecha_de_salida)}</td>
                                            <td>{viaje.patente}</td>
                                            <td>{viaje.conductor_apellido}, {viaje.conductor_nombre}</td>
                                            <td>{viaje.origen} → {viaje.destino}</td>
                                            <td>{Number(viaje.kilometros).toLocaleString('es-AR')}</td>
                                            <td className="acciones">
                                                <button
                                                    type="button"
                                                    className="btn btn--chico btn--secundario"
                                                    onClick={() => editar(viaje)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn--chico btn--peligro"
                                                    onClick={() => eliminar(viaje)}
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
