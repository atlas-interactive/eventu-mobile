import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import { CLAVE_SESION } from '@/constants/session';

// Cliente HTTP único: centraliza la URL base, el timeout y el token JWT.
// Los errores llegan sin cambios; cada pantalla obtiene el mensaje con mensajeDeError()
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