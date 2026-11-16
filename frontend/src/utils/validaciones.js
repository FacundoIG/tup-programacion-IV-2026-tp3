export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Deja únicamente letras (incluye acentos, ñ y ü), espacios, apóstrofes y guiones.
export const soloLetras = (valor) =>
    valor.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]/g, '');

// Deja únicamente dígitos (para el DNI).
export const soloNumeros = (valor) => valor.replace(/\D/g, '');

// Rechaza valores negativos en campos numéricos (peso/capacidad y kilómetros).
export const sinNegativos = (valor) => {
    if (valor === '') return '';
    return Number(valor) < 0 ? '' : valor;
};

// Obtiene el mensaje de error devuelto por el backend.
export const obtenerMensajeError = async (response) => {
    try {
        const data = await response.json();

        if (Array.isArray(data.errores) && data.errores.length > 0) {
            return data.errores.map((error) => error.msg).join('. ');
        }

        return data.message || 'Ocurrió un error inesperado';
    } catch {
        return 'Ocurrió un error inesperado al comunicarse con el servidor';
    }
};

// Convierte una fecha de la base de datos al formato de <input type="datetime-local">.
export const aDatetimeLocal = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
};
