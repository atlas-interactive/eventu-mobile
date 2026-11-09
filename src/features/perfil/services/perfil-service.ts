import { api } from '@/api/client';
import type { ActualizacionPerfil, PerfilUsuario } from '@/types/perfil';

export interface SolicitudCambioContrasena {
    passwordActual: string;
    passwordNueva: string;
}

export interface RespuestaCambioContrasena {
    mensaje: string;
    token: string;
}

export interface RespuestaDesactivacionCuenta {
    mensaje: string;
}

export const obtenerPerfil = async (): Promise<PerfilUsuario> =>
    (await api.get<PerfilUsuario>('/perfil')).data;

export const actualizarPerfil = async (datos: ActualizacionPerfil): Promise<PerfilUsuario> =>
    (await api.put<PerfilUsuario>('/perfil', datos)).data;

// El backend devuelve un token nuevo, el anterior deja de servir
export const cambiarContrasena = async (
    datos: SolicitudCambioContrasena,
): Promise<RespuestaCambioContrasena> => {
    const { data } = await api.put<RespuestaCambioContrasena>('/perfil/contrasena', datos);
    if (typeof data.token !== 'string' || !data.token.trim()) {
        throw new Error('El servidor no devolvió un token válido después del cambio de contraseña.');
    }
    return data;
};

export const desactivarCuenta = async (password: string): Promise<RespuestaDesactivacionCuenta> => {
    const { data } = await api.patch<RespuestaDesactivacionCuenta>('/perfil/desactivar', {
        password,
    });
    if (!data || typeof data.mensaje !== 'string' || !data.mensaje.trim()) {
        throw new Error('El servidor no devolvió un mensaje válido al desactivar la cuenta.');
    }
    return data;
};
