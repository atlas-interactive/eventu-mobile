// Respuesta del backend para un evento (EventoResponseDTO)
export interface Evento {
    id: number;
    titulo: string;
    descripcion: string;
    fechaInicio: string;
    ubicacion: string;
    cupoMaximos: number;
    cuposDisponibles: number;
    estado: string;
    organizadorId: number;
    orfanizadorNombre: string;
    categoriaId: number;
    categoriaNombre: string;
}

export interface FiltroEvent0 {
    categoriaId?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    texto?: string;
}