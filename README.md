# TP N.º 3 – Gestión de vehículos, conductores y viajes

Trabajo Práctico N.º 3 de **Programación IV** (Tecnicatura Universitaria en Programación – UTN Facultad Regional La Rioja).

Aplicación web para registrar vehículos, conductores y viajes de una empresa de transporte, con autenticación mediante JWT, contraseñas encriptadas con bcrypt y persistencia en MySQL.

## Tecnologías

- **Frontend:** Vite + React (JavaScript) + React Router + CSS puro (sin librerías).
- **Backend:** Express.js + MySQL (`mysql2`) + `express-validator` + Passport + JWT + bcrypt.

## Estructura del proyecto

```
.
├── backend
│   ├── index.js
│   ├── database.sql
│   ├── auth.http
│   ├── vehiculos.http
│   ├── conductores.http
│   ├── viajes.http
│   ├── package.json
│   ├── .env.example
│   └── src
│       ├── config
│       │   ├── db.js
│       │   └── env.js
│       ├── controllers
│       │   ├── auth.controller.js
│       │   ├── conductores.controller.js
│       │   ├── vehiculos.controller.js
│       │   └── viajes.controller.js
│       ├── middlewares
│       │   ├── auth.js
│       │   └── validaciones.js
│       └── routes
│           ├── auth.routes.js
│           ├── conductores.routes.js
│           ├── vehiculos.routes.js
│           └── viajes.routes.js
└── frontend
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── .env.example
    └── src
        ├── components
        │   ├── Layout.jsx
        │   └── RutaProtegida.jsx
        ├── context
        │   └── AuthContext.jsx
        ├── pages
        │   ├── Conductores.jsx
        │   ├── Historial.jsx
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   ├── Registro.jsx
        │   ├── Vehiculos.jsx
        │   └── Viajes.jsx
        ├── utils
        │   └── validaciones.js
        ├── index.css
        └── main.jsx
```

## Puesta en marcha

### 1. Base de datos

Crear la base y las tablas ejecutando el script `backend/database.sql`:

```bash
mysql -u root -p < backend/database.sql
```

El script crea la base `transporte_db`, las tablas `usuarios`, `vehiculos`, `conductores` y `viajes`, y un usuario administrador de prueba:

- **Email:** `admin@transporte.com`
- **Contraseña:** `admin123`

### 2. Backend

```bash
cd backend
npm install
copy .env.example .env
# Editar .env con los datos de conexión a MySQL y un JWT_SECRET propio
npm run dev
```

El servidor se ejecuta en `http://localhost:3000`.

### 3. Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

La aplicación se abre en `http://localhost:5173`.

## Endpoints principales

Todas las rutas de vehículos, conductores y viajes requieren el header:

```
Authorization: Bearer <token>
```

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Inicio de sesión (devuelve JWT de 4 horas) |
| GET | `/api/auth/me` | Perfil del usuario autenticado |
| GET | `/api/auth/usuarios` | Listar usuarios (solo administrador, 403 para usuarios comunes) |
| GET | `/api/vehiculos` | Listar vehículos |
| GET | `/api/vehiculos/:id` | Obtener vehículo |
| POST | `/api/vehiculos` | Crear vehículo |
| PUT | `/api/vehiculos/:id` | Actualizar vehículo |
| DELETE | `/api/vehiculos/:id` | Eliminar vehículo |
| GET | `/api/conductores` | Listar conductores |
| GET | `/api/conductores/:id` | Obtener conductor |
| POST | `/api/conductores` | Crear conductor |
| PUT | `/api/conductores/:id` | Actualizar conductor |
| DELETE | `/api/conductores/:id` | Eliminar conductor |
| GET | `/api/viajes` | Listar viajes (filtros `vehiculo_id` y `conductor_id`) |
| GET | `/api/viajes/:id` | Obtener viaje |
| POST | `/api/viajes` | Registrar viaje |
| PUT | `/api/viajes/:id` | Actualizar viaje |
| DELETE | `/api/viajes/:id` | Eliminar viaje |
| GET | `/api/viajes/resumen/vehiculos` | Total de kilómetros por vehículo |
| GET | `/api/viajes/resumen/conductores` | Total de kilómetros por conductor |
| GET | `/api/viajes/vehiculo/:id/historial` | Historial y total de km de un vehículo |
| GET | `/api/viajes/conductor/:id/historial` | Historial y total de km de un conductor |

Los archivos `.http` del backend permiten probar todos los endpoints desde VS Code (extensión REST Client) o IntelliJ.

## Validaciones implementadas

- **Nombre y apellido:** solo letras, espacios, apóstrofes y guiones. No se pueden ingresar números ni en el frontend ni en el backend.
- **DNI:** solo dígitos, con 7 u 8 caracteres. El frontend bloquea las letras y el backend rechaza cualquier documento no numérico.
- **Capacidad de carga (peso) y kilómetros:** deben ser números mayores o iguales a cero. Se bloquean los valores negativos en los inputs y se validan con `express-validator` (`isFloat({ min: 0 })`).
- **Fechas:** la fecha de vencimiento de la licencia debe ser posterior a la de alta; la llegada del viaje debe ser posterior a la salida.
- **Año del vehículo:** entero entre 1900 y el año siguiente al actual.
- **Patente, email, contraseña y campos obligatorios:** validados en frontend y backend.
- **Errores HTTP:** 400 (validación), 401 (no autenticado), 403 (sin permisos), 404 (no encontrado) y 500 (error interno).

## Seguridad

- Contraseñas almacenadas con hash **bcrypt** (nunca en texto plano).
- Autenticación con **JWT** y middleware de **Passport**.
- Tokens con expiración de **4 horas**.
- Rutas CRUD protegidas: solo usuarios autenticados pueden acceder.
- El token se envía en el header `Authorization: Bearer <token>`.
