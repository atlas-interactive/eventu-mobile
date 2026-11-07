export type EstadoInscripcion = 'ACTIVA' | 'CANCELADA';

// Inscripción del usuario con los datos básicos del evento
export interface Inscripcion {
    id: number;
    estado: EstadoInscripcion;
    codigoQr: string | null;
    fechaInscripcion: string;
    eventoId: number;
    eventoTitulo: string;
    eventoFechaInicio: string;
    eventoUbicacion: string;
}

export interface RespuestaCancelacionInscripcion {
    mensaje: string;
    inscripcionId: number;
}
