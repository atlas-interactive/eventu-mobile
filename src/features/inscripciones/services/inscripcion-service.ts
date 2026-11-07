import { api } from '@/api/client';

interface InscripcionDelUsuario {
    eventoId: number;
    estado: string;
}

export interface RespuestaInscripcion {
    mensaje: string;
    inscripcionId: number;
    codigoQr: string;
}

// El eventoId va como parámetro de la URL, no en el cuerpo
export const inscribirEnEvento = async (eventoId: number): Promise<RespuestaInscripcion> =>
    (await api.post<RespuestaInscripcion>('/inscripciones', undefined, { params: { eventoId } })).data;

//Revisa si el usuario ya tiene una inscripción activa en el evento.
export const tieneInscripcionActiva = async (eventoId: number): Promise<boolean> => {
    const { data } = await api.get<InscripcionDelUsuario[]>('/inscripciones/mias');
    if (
        !Array.isArray(data) ||
        data.some(
            (inscripcion) =>
                !inscripcion ||
                typeof inscripcion.eventoId !== 'number' ||
                typeof inscripcion.estado !== 'string',
        )
    ) {
        throw new Error('La respuesta de /inscripciones/mias no es una lista válida.');
    }

    return data.some(
        (inscripcion) =>
            inscripcion.eventoId === eventoId && inscripcion.estado.toUpperCase() === 'ACTIVA',
    );
};
