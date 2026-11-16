import { createContext, useContext, useState } from 'react';
import { API_URL } from '../utils/validaciones';

const AuthContext = createContext(null);

const guardarSesion = (token, nombre, es_admin) => {
    localStorage.setItem('token', token);
    localStorage.setItem('nombre', nombre);
    localStorage.setItem('es_admin', String(es_admin));
};

const limpiarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    localStorage.removeItem('es_admin');
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [username, setUsername] = useState(() => localStorage.getItem('nombre'));
    const [esAdmin, setEsAdmin] = useState(
        () => localStorage.getItem('es_admin') === 'true'
    );
    const [error, setError] = useState(null);

    const login = async (email, contraseña) => {
        try {
            setError(null);
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, contraseña })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al iniciar sesión');
            }

            guardarSesion(data.token, data.nombre, data.es_admin);
            setToken(data.token);
            setUsername(data.nombre);
            setEsAdmin(Boolean(data.es_admin));
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const registrar = async (nombre, email, contraseña) => {
        try {
            setError(null);
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, contraseña })
            });

            const data = await response.json();

            if (!response.ok) {
                const mensaje = Array.isArray(data.errores)
                    ? data.errores.map((e) => e.msg).join('. ')
                    : data.message;
                throw new Error(mensaje || 'Error al registrar el usuario');
            }

            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const logout = () => {
        limpiarSesion();
        setToken(null);
        setUsername(null);
        setEsAdmin(false);
        setError(null);
    };

    // fetch autenticado: agrega el token JWT a cada petición protegida
    const fetchOut = async (url, options = {}) => {
        if (!token) {
            throw new Error('No hay una sesión activa');
        }

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
            Authorization: `Bearer ${token}`
        };

        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            logout();
            throw new Error('La sesión expiró. Volvé a iniciar sesión.');
        }

        return response;
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                username,
                esAdmin,
                error,
                login,
                registrar,
                logout,
                fetchOut,
                estaAutenticado: Boolean(token)
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
