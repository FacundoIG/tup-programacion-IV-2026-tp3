import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import RutaProtegida from './components/RutaProtegida';
import Home from './pages/Home';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Vehiculos from './pages/Vehiculos';
import Conductores from './pages/Conductores';
import Viajes from './pages/Viajes';
import Historial from './pages/Historial';
import './index.css';

function NoEncontrada() {
    return (
        <section className="formulario-pagina">
            <div className="panel panel--angosto">
                <h1>Página no encontrada</h1>
                <p className="panel__subtitulo">La dirección que ingresaste no existe.</p>
                <Link to="/" className="btn btn--primario">Volver al inicio</Link>
            </div>
        </section>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="login" element={<Login />} />
                        <Route path="registro" element={<Registro />} />
                        <Route
                            path="vehiculos"
                            element={
                                <RutaProtegida>
                                    <Vehiculos />
                                </RutaProtegida>
                            }
                        />
                        <Route
                            path="conductores"
                            element={
                                <RutaProtegida>
                                    <Conductores />
                                </RutaProtegida>
                            }
                        />
                        <Route
                            path="viajes"
                            element={
                                <RutaProtegida>
                                    <Viajes />
                                </RutaProtegida>
                            }
                        />
                        <Route
                            path="historial"
                            element={
                                <RutaProtegida>
                                    <Historial />
                                </RutaProtegida>
                            }
                        />
                        <Route path="*" element={<NoEncontrada />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>
);
