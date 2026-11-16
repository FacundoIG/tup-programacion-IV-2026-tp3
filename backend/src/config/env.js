import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Carga siempre backend/.env, sin importar desde qué carpeta se ejecute el servidor
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = process.env;
