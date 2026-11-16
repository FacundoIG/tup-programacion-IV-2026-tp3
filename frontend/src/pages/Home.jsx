import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { estaAutenticado, username } = useAuth();

    return (
        <div className="home">
            <section className="hero">
                <span className="hero__etiqueta">Sistema de gestión</span>
                <h1>Gestión de vehículos, conductores y viajes</h1>
                <p>
                    Administrá la flota de tu empresa de transporte: vehículos, conductores,
                    viajes realizados y kilómetros recorridos, todo en un solo lugar.
                </p>

                <div className="hero__acciones">
                    {estaAutenticado ? (
                        <>
                            <p className="hero__saludo">Bienvenido nuevamente, {username}.</p>
                            <Link to="/vehiculos" className="btn btn--primario">Ver vehículos</Link>
                            <Link to="/viajes" className="btn btn--secundario">Registrar viaje</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn--primario">Iniciar sesión</Link>
                            <Link to="/registro" className="btn btn--secundario">Crear cuenta</Link>
                        </>
                    )}
                </div>
            </section>

            <section className="tarjetas">
                <article className="tarjeta">
                    <h2>🚛 Vehículos</h2>
                    <p>Alta, modificación y eliminación de vehículos con patente, año y capacidad de carga.</p>
                </article>
                <article className="tarjeta">
                    <h2>👤 Conductores</h2>
                    <p>Administración de conductores, documento y vigencia de la licencia.</p>
                </article>
                <article className="tarjeta">
                    <h2>🗺️ Viajes</h2>
                    <p>Registro de viajes asociando un vehículo y un conductor, con origen y destino.</p>
                </article>
                <article className="tarjeta">
                    <h2>📊 Historial</h2>
                    <p>Consulta de viajes y cálculo total de kilómetros recorridos por vehículo o conductor.</p>
                </article>
            </section>
        </div>
    );
}
