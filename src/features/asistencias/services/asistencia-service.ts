import { api } from '@/api/client';

export interface RespuestaAsistencia {
    mensaje: string;
    asistenciaId: number;
    usuario: string;
    evento: string;
    fechaRegistro: string;
}

// El backend valida el código y registra la asistencia en el mismo paso
export const registrarAsistencia = async (codigoQr: string): Promise<RespuestaAsistencia> => {
    const { data } = await api.post<RespuestaAsistencia>('/asistencias/validar-qr', { codigoQr });
    if (
        !data ||
        typeof data.mensaje !== 'string' ||
        typeof data.asistenciaId !== 'number' ||
        typeof data.usuario !== 'string' ||
        typeof data.evento !== 'string' ||
        typeof data.fechaRegistro !== 'string'
    ) {
        throw new Error('La respuesta del registro de asistencia no es válida.');
    }

    return data;
};
