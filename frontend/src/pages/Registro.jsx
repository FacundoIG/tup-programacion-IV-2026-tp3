import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { soloLetras } from '../utils/validaciones';

export default function Registro() {
    const { registrar, login, error, estaAutenticado } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nombre: '',
        email: '',
        contraseña: '',
        confirmar: ''
    });
    const [errorLocal, setErrorLocal] = useState('');
    const [enviando, setEnviando] = useState(false);

    if (estaAutenticado) {
        return <Navigate to="/" replace />;
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        const nuevoValor = name === 'nombre' ? soloLetras(value) : value;
        setForm((anterior) => ({ ...anterior, [name]: nuevoValor }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorLocal('');

        if (!form.nombre.trim() || !form.email.trim() || !form.contraseña) {
            setErrorLocal('Todos los campos son obligatorios');
            return;
        }

        if (/\d/.test(form.nombre)) {
            setErrorLocal('El nombre no puede contener números');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setErrorLocal('Ingresá un email válido');
            return;
        }

        if (form.contraseña.length < 6) {
            setErrorLocal('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (form.contraseña !== form.confirmar) {
            setErrorLocal('Las contraseñas no coinciden');
            return;
        }

        setEnviando(true);
        const registrado = await registrar(form.nombre, form.email, form.contraseña);

        if (registrado) {
            const ingreso = await login(form.email, form.contraseña);
            setEnviando(false);

            if (ingreso) {
                navigate('/', { replace: true });
            }
            return;
        }

        setEnviando(false);
    };

    return (
        <section className="formulario-pagina">
            <div className="panel panel--angosto">
                <h1>Crear cuenta</h1>
                <p className="panel__subtitulo">
                    Registrate para acceder a la gestión de la empresa de transporte.
                </p>

                {(errorLocal || error) && (
                    <div className="alerta alerta--error">{errorLocal || error}</div>
                )}

                <form className="formulario" onSubmit={handleSubmit} noValidate>
                    <label>
                        Nombre
                        <input
                            type="text"
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            placeholder="Solo letras, sin números"
                            autoComplete="name"
                        />
                    </label>

                    <label>
                        Email
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="correo@ejemplo.com"
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
                            placeholder="Mínimo 6 caracteres"
                            autoComplete="new-password"
                        />
                    </label>

                    <label>
                        Confirmar contraseña
                        <input
                            type="password"
                            name="confirmar"
                            value={form.confirmar}
                            onChange={handleChange}
                            placeholder="Repetí la contraseña"
                            autoComplete="new-password"
                        />
                    </label>

                    <button type="submit" className="btn btn--primario" disabled={enviando}>
                        {enviando ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                <p className="panel__pie">
                    ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
                </p>
            </div>
        </section>
    );
}
