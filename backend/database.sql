-- Base de datos para el TP N.º 3 - Gestión de vehículos, conductores y viajes
-- Ejecutar con: mysql -u root -p < database.sql

CREATE DATABASE IF NOT EXISTS transporte_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE transporte_db;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    es_admin BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    patente VARCHAR(20) NOT NULL UNIQUE,
    anio INT NOT NULL,
    capacidad_de_carga DECIMAL(10, 2) NOT NULL,
    CONSTRAINT chk_vehiculo_anio CHECK (anio >= 1900),
    CONSTRAINT chk_vehiculo_capacidad CHECK (capacidad_de_carga >= 0)
);

CREATE TABLE IF NOT EXISTS conductores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    numero_de_documento VARCHAR(20) NOT NULL UNIQUE,
    numero_de_licencia VARCHAR(30) NOT NULL UNIQUE,
    fecha_de_alta_de_licencia DATE NOT NULL,
    fecha_de_vencimiento_de_licencia DATE NOT NULL,
    CONSTRAINT chk_conductor_fechas CHECK (
        fecha_de_vencimiento_de_licencia > fecha_de_alta_de_licencia
    )
);

CREATE TABLE IF NOT EXISTS viajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehiculo_id INT NOT NULL,
    conductor_id INT NOT NULL,
    fecha_de_salida DATETIME NOT NULL,
    fecha_de_llegada DATETIME NOT NULL,
    origen VARCHAR(100) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    kilometros DECIMAL(10, 2) NOT NULL,
    observaciones TEXT,
    CONSTRAINT chk_viaje_kilometros CHECK (kilometros >= 0),
    CONSTRAINT chk_viaje_fechas CHECK (fecha_de_llegada > fecha_de_salida),
    CONSTRAINT fk_viaje_vehiculo FOREIGN KEY (vehiculo_id)
        REFERENCES vehiculos(id) ON DELETE CASCADE,
    CONSTRAINT fk_viaje_conductor FOREIGN KEY (conductor_id)
        REFERENCES conductores(id) ON DELETE CASCADE
);

CREATE INDEX idx_viajes_vehiculo ON viajes(vehiculo_id);
CREATE INDEX idx_viajes_conductor ON viajes(conductor_id);

-- Usuario administrador de ejemplo.
-- Email: admin@transporte.com
-- Contraseña: admin123 (guardada con hash bcrypt, nunca en texto plano)
INSERT INTO usuarios (nombre, email, password, es_admin)
VALUES (
    'Administrador',
    'admin@transporte.com',
    '$2b$10$6J1GVYG2xl91Xjh8sjMqe.LvKA80clP..RhOE8XIaQW0M.BDzx/J2',
    TRUE
)
ON DUPLICATE KEY UPDATE email = VALUES(email);
