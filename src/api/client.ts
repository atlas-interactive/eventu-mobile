import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import { CLAVE_SESION } from '@/constants/session';

// Cliente HTTP único: centraliza la URL base, el timeout y el token JWT
export const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    // Render (plan gratuito) tarda en despertar la primera vez, por eso el timeout es de 60 segundos
    timeout: 60000,
    headers: { 'Content-Type': 'application/json' },
});

// Agrega el token JWT a cada petición cuando hay una sesión guardada
api.interceptors.request.use(async (config) => {
    const guardado = await SecureStore.getItemAsync(CLAVE_SESION);
    const token = guardado ? JSON.parse(guardado).token : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Convierte los errores del backend en mensajes en español
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isAxiosError<{ error?: string }>(error)) {
            if (error.code === 'ECONNABORTED') {
                return Promise.reject(
                    new Error('El servidor tardó demasiado en responder. Intenta de nuevo.'),
                );
            }
            const mensaje = error.response?.data?.error;
            return Promise.reject(new Error(mensaje ?? 'No se pudo conectar con el servidor.'));
        }
        return Promise.reject(error);
    },
);
