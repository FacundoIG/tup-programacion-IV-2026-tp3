import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    API_URL,
    soloLetras,
    soloNumeros,
    obtenerMensajeError
} from '../utils/validaciones';

const FORM_VACIO = {
    nombre: '',
    apellido: '',
    numero_de_documento: '',
    numero_de_licencia: '',
    fecha_de_alta_de_licencia: '',
    fecha_de_vencimiento_de_licencia: ''
};

const aFechaInput = (fecha) => (fecha ? String(fecha).slice(0, 10) : '');

export default function Conductores() {
    const { fetchOut } = useAuth();
    const [conductores, setConductores] = useState([]);
    const [form, setForm] = useState(FORM_VACIO);
    const [editandoId, setEditandoId] = useState(null);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const cargarConductores = async () => {
        try {
            const response = await fetchOut(`${API_URL}/conductores`);
            if (!response.ok) throw new Error(await obtenerMensajeError(response));
            const data = await response.json();
            setConductores(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarConductores();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        let nuevoValor = value;

        if (name === 'nombre' || name === 'apellido') {
            nuevoValor = soloLetras(value);
        }

        if (name === 'numero_de_documento') {
            nuevoValor = soloNumeros(value).slice(0, 8);
        }

        setForm((anterior) => ({ ...anterior, [name]: nuevoValor }));
    };

    const limpiarFormulario = () => {
        setForm(FORM_VACIO);
        setEditandoId(null);
    };

    const validar = () => {
        const camposObligatorios = Object.values(form).every((valor) => String(valor).trim() !== '');
        if (!camposObligatorios) return 'Todos los campos son obligatorios';

        if (/\d/.test(form.nombre) || /\d/.test(form.apellido)) {
            return 'El nombre y el apellido no pueden contener números';
        }

        if (!/^\d{7,8}$/.test(form.numero_de_documento)) {
            return 'El DNI debe contener solo números (7 u 8 dígitos)';
        }

        if (form.fecha_de_vencimiento_de_licencia <= form.fecha_de_alta_de_licencia) {
            return 'La fecha de vencimiento debe ser posterior a la fecha de alta';
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
                ? `${API_URL}/conductores/${editandoId}`
                : `${API_URL}/conductores`;

            const response = await fetchOut(url, {
                method: editandoId ? 'PUT' : 'POST',
                body: JSON.stringify(form)
            });

            if (!response.ok) throw new Error(await obtenerMensajeError(response));

            setExito(editandoId ? 'Conductor actualizado correctamente' : 'Conductor creado correctamente');
            limpiarFormulario();
            await cargarConductores();
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    const editar = (conductor) => {
        setEditandoId(conductor.id);
        setForm({
            nombre: conductor.nombre,
            apellido: conductor.apellido,
            numero_de_documento: conductor.numero_de_documento,
            numero_de_licencia: conductor.numero_de_licencia,
            fecha_de_alta_de_licencia: aFechaInput(conductor.fecha_de_alta_de_licencia),
            fecha_de_vencimiento_de_licencia: aFechaInput(conductor.fecha_de_vencimiento_de_licencia)
        });
        setError('');
        setExito('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const eliminar = async (conductor) => {
        const confirmado = window.confirm(
            `¿Eliminar al conductor ${conductor.nombre} ${conductor.apellido}?`
        );
        if (!confirmado) return;

        setError('');
        setExito('');

        try {
            const response = await fetchOut(`${API_URL}/conductores/${conductor.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error(await obtenerMensajeError(response));

            setExito('Conductor eliminado correctamente');
            if (editandoId === conductor.id) limpiarFormulario();
            await cargarConductores();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <section>
            <div className="seccion__encabezado">
                <div>
                    <h1>Conductores</h1>
                    <p>Alta, modificación y eliminación de los conductores de la empresa.</p>
                </div>
            </div>

            {error && <div className="alerta alerta--error">{error}</div>}
            {exito && <div className="alerta alerta--exito">{exito}</div>}

            <div className="grid-dos">
                <div className="panel">
                    <h2>{editandoId ? 'Editar conductor' : 'Nuevo conductor'}</h2>

                    <form className="formulario" onSubmit={handleSubmit} noValidate>
                        <label>
                            Nombre
                            <input
                                type="text"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                maxLength={50}
                                placeholder="Solo letras, sin números"
                            />
                        </label>

                        <label>
                            Apellido
                            <input
                                type="text"
                                name="apellido"
                                value={form.apellido}
                                onChange={handleChange}
                                maxLength={50}
                                placeholder="Solo letras, sin números"
                            />
                        </label>

                        <label>
                            DNI
                            <input
                                type="text"
                                name="numero_de_documento"
                                value={form.numero_de_documento}
                                onChange={handleChange}
                                inputMode="numeric"
                                maxLength={8}
                                placeholder="Solo números (7 u 8 dígitos)"
                            />
                        </label>

                        <label>
                            Número de licencia
                            <input
                                type="text"
                                name="numero_de_licencia"
                                value={form.numero_de_licencia}
                                onChange={handleChange}
                                maxLength={30}
                                placeholder="Ej.: LIC-2026-001"
                            />
                        </label>

                        <label>
                            Fecha de alta de la licencia
                            <input
                                type="date"
                                name="fecha_de_alta_de_licencia"
                                value={form.fecha_de_alta_de_licencia}
                                onChange={handleChange}
                            />
                        </label>

                        <label>
                            Fecha de vencimiento de la licencia
                            <input
                                type="date"
                                name="fecha_de_vencimiento_de_licencia"
                                value={form.fecha_de_vencimiento_de_licencia}
                                onChange={handleChange}
                            />
                        </label>

                        <div className="formulario__acciones">
                            <button type="submit" className="btn btn--primario" disabled={guardando}>
                                {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear conductor'}
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
                    <h2>Listado de conductores</h2>

                    {cargando ? (
                        <p className="estado">Cargando conductores...</p>
                    ) : conductores.length === 0 ? (
                        <p className="estado">Todavía no hay conductores registrados.</p>
                    ) : (
                        <div className="tabla-contenedor">
                            <table className="tabla">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Apellido</th>
                                        <th>DNI</th>
                                        <th>Licencia</th>
                                        <th>Vence</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {conductores.map((conductor) => (
                                        <tr key={conductor.id}>
                                            <td>{conductor.nombre}</td>
                                            <td>{conductor.apellido}</td>
                                            <td>{conductor.numero_de_documento}</td>
                                            <td>{conductor.numero_de_licencia}</td>
                                            <td>{aFechaInput(conductor.fecha_de_vencimiento_de_licencia)}</td>
                                            <td className="acciones">
                                                <button
                                                    type="button"
                                                    className="btn btn--chico btn--secundario"
                                                    onClick={() => editar(conductor)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn--chico btn--peligro"
                                                    onClick={() => eliminar(conductor)}
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
