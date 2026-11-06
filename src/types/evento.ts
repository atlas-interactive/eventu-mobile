// Respuesta del backend para un evento (EventoResponseDTO)
export interface Evento {
    id: number;
    titulo: string;
    descripcion: string;
    // LocalDateTime sin zona horaria, por ejemplo "2026-10-20T14:30:00"
    fechaInicio: string;
    ubicacion: string;
    cuposMaximos: number;
    cuposDisponibles: number;
    estado: string;
    organizadorId: number;
    organizadorNombre: string;
    categoriaId: number;
    categoriaNombre: string;
}

export interface FiltrosEvento {
    categoriaId?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    texto?: string;
}
