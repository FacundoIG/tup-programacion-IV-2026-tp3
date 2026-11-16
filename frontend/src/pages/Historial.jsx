import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL, obtenerMensajeError } from '../utils/validaciones';

const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return Number.isNaN(date.getTime())
        ? String(fecha)
        : date.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
};

export default function Historial() {
    const { fetchOut } = useAuth();
    const [porVehiculo, setPorVehiculo] = useState([]);
    const [porConductor, setPorConductor] = useState([]);
    const [detalle, setDetalle] = useState(null);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(true);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);

    useEffect(() => {
        const cargarResumenes = async () => {
            try {
                const [resVehiculos, resConductores] = await Promise.all([
                    fetchOut(`${API_URL}/viajes/resumen/vehiculos`),
                    fetchOut(`${API_URL}/viajes/resumen/conductores`)
                ]);

                if (!resVehiculos.ok) throw new Error(await obtenerMensajeError(resVehiculos));
                if (!resConductores.ok) throw new Error(await obtenerMensajeError(resConductores));

                const dataVehiculos = await resVehiculos.json();
                const dataConductores = await resConductores.json();

                setPorVehiculo(dataVehiculos.data);
                setPorConductor(dataConductores.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        };

        cargarResumenes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const verHistorial = async (tipo, item) => {
        setError('');
        setCargandoDetalle(true);

        try {
            const id = tipo === 'vehiculo' ? item.vehiculo_id : item.conductor_id;
            const response = await fetchOut(
                `${API_URL}/viajes/${tipo}/${id}/historial`
            );

            if (!response.ok) throw new Error(await obtenerMensajeError(response));

            const data = await response.json();

            setDetalle({
                titulo:
                    tipo === 'vehiculo'
                        ? `Historial del vehículo ${item.patente} (${item.marca} ${item.modelo})`
                        : `Historial del conductor ${item.apellido}, ${item.nombre}`,
                viajes: data.data,
                totalKilometros: data.totalKilometros
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setCargandoDetalle(false);
        }
    };

    return (
        <section>
            <div className="seccion__encabezado">
                <div>
                    <h1>Historial y kilómetros recorridos</h1>
                    <p>
                        Consultá los totales de kilómetros recorridos por cada vehículo y
                        por cada conductor.
                    </p>
                </div>
            </div>

            {error && <div className="alerta alerta--error">{error}</div>}

            {cargando ? (
                <p className="estado">Cargando resúmenes...</p>
            ) : (
                <>
                    <div className="panel">
                        <h2>Total por vehículo</h2>
                        <div className="tabla-contenedor">
                            <table className="tabla">
                                <thead>
                                    <tr>
                                        <th>Patente</th>
                                        <th>Vehículo</th>
                                        <th>Viajes</th>
                                        <th>Kilómetros totales</th>
                                        <th>Historial</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {porVehiculo.map((item) => (
                                        <tr key={item.vehiculo_id}>
                                            <td>{item.patente}</td>
                                            <td>{item.marca} {item.modelo}</td>
                                            <td>{item.cantidad_viajes}</td>
                                            <td>{Number(item.total_kilometros).toLocaleString('es-AR')} km</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn--chico btn--secundario"
                                                    onClick={() => verHistorial('vehiculo', item)}
                                                >
                                                    Ver historial
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="panel">
                        <h2>Total por conductor</h2>
                        <div className="tabla-contenedor">
                            <table className="tabla">
                                <thead>
                                    <tr>
                                        <th>Conductor</th>
                                        <th>DNI</th>
                                        <th>Viajes</th>
                                        <th>Kilómetros totales</th>
                                        <th>Historial</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {porConductor.map((item) => (
                                        <tr key={item.conductor_id}>
                                            <td>{item.apellido}, {item.nombre}</td>
                                            <td>{item.numero_de_documento}</td>
                                            <td>{item.cantidad_viajes}</td>
                                            <td>{Number(item.total_kilometros).toLocaleString('es-AR')} km</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn--chico btn--secundario"
                                                    onClick={() => verHistorial('conductor', item)}
                                                >
                                                    Ver historial
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {cargandoDetalle && <p className="estado">Cargando historial...</p>}

            {detalle && (
                <div className="panel">
                    <h2>{detalle.titulo}</h2>
                    <p className="panel__subtitulo">
                        Total recorrido: <strong>{Number(detalle.totalKilometros).toLocaleString('es-AR')} km</strong>
                    </p>

                    {detalle.viajes.length === 0 ? (
                        <p className="estado">Este registro todavía no tiene viajes.</p>
                    ) : (
                        <div className="tabla-contenedor">
                            <table className="tabla">
                                <thead>
                                    <tr>
                                        <th>Salida</th>
                                        <th>Llegada</th>
                                        <th>Recorrido</th>
                                        <th>Vehículo</th>
                                        <th>Conductor</th>
                                        <th>Km</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detalle.viajes.map((viaje) => (
                                        <tr key={viaje.id}>
                                            <td>{formatearFecha(viaje.fecha_de_salida)}</td>
                                            <td>{formatearFecha(viaje.fecha_de_llegada)}</td>
                                            <td>{viaje.origen} → {viaje.destino}</td>
                                            <td>{viaje.patente}</td>
                                            <td>{viaje.conductor_apellido}, {viaje.conductor_nombre}</td>
                                            <td>{Number(viaje.kilometros).toLocaleString('es-AR')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
