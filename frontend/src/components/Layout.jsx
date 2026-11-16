import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const { estaAutenticado, username, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="app">
            <header className="navbar">
                <div className="navbar__contenido">
                    <Link to="/" className="navbar__marca">
                        🚚 Transporte La Rioja
                    </Link>

                    <nav className="navbar__links" aria-label="Navegación principal">
                        <NavLink to="/" end>Inicio</NavLink>

                        {estaAutenticado && (
                            <>
                                <NavLink to="/vehiculos">Vehículos</NavLink>
                                <NavLink to="/conductores">Conductores</NavLink>
                                <NavLink to="/viajes">Viajes</NavLink>
                                <NavLink to="/historial">Historial</NavLink>
                            </>
                        )}
                    </nav>

                    <div className="navbar__sesion">
                        {estaAutenticado ? (
                            <>
                                <span className="navbar__usuario">Hola, {username}</span>
                                <button
                                    type="button"
                                    className="btn btn--peligro btn--chico"
                                    onClick={handleLogout}
                                >
                                    Salir
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn--secundario btn--chico">
                                    Ingresar
                                </Link>
                                <Link to="/registro" className="btn btn--primario btn--chico">
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="contenido">
                <Outlet />
            </main>

            <footer className="pie">
                <p>Programación IV – TP N.º 3 – Gestión de vehículos, conductores y viajes</p>
            </footer>
        </div>
    );
}
