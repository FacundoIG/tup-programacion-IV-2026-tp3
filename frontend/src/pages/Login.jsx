import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login, error, estaAutenticado } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState({ email: '', contraseña: '' });
    const [errorLocal, setErrorLocal] = useState('');
    const [enviando, setEnviando] = useState(false);

    if (estaAutenticado) {
        return <Navigate to="/" replace />;
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((anterior) => ({ ...anterior, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorLocal('');

        if (!form.email.trim() || !form.contraseña.trim()) {
            setErrorLocal('Completá el email y la contraseña');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setErrorLocal('Ingresá un email válido');
            return;
        }

        setEnviando(true);
        const ok = await login(form.email, form.contraseña);
        setEnviando(false);

        if (ok) {
            navigate(location.state?.desde || '/', { replace: true });
        }
    };

    return (
        <section className="formulario-pagina">
            <div className="panel panel--angosto">
                <h1>Iniciar sesión</h1>
                <p className="panel__subtitulo">
                    Ingresá con tu cuenta para administrar vehículos, conductores y viajes.
                </p>

                {(errorLocal || error) && (
                    <div className="alerta alerta--error">{errorLocal || error}</div>
                )}

                <form className="formulario" onSubmit={handleSubmit} noValidate>
                    <label>
                        Email
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="admin@transporte.com"
                            autoComplete="email"
                        />
                    </label>

                    <label>
                        Contraseña
                        <input
                            type="password"
                            name="contraseña"
                            value={form.contraseña}
                            onChange={handleChange}
                            placeholder="Tu contraseña"
                            autoComplete="current-password"
                        />
                    </label>

                    <button type="submit" className="btn btn--primario" disabled={enviando}>
                        {enviando ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <p className="panel__pie">
                    ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
                </p>
            </div>
        </section>
    );
}
