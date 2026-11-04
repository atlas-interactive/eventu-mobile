import { api } from '@/api/client';
import type { Evento, FiltrosEvento } from '@/types/evento';

// Quita los filtros vacíos para no enviarlos como parámetros
const obtenerParametros = (filtros: FiltrosEvento) =>
    Object.fromEntries(
        Object.entries(filtros)
            .map(([clave, valor]) => [clave, typeof valor === 'string' ? valor.trim() : valor])
            .filter(([, valor]) => valor !== undefined && valor !== ''),
    );

//El backend limita los eventos visibles según el rol del token.
export const listarEventos = async (filtros: FiltrosEvento = {}): Promise<Evento[]> => {
    const { data } = await api.get<Evento[]>('/eventos', { params: obtenerParametros(filtros) });
    if (!Array.isArray(data)) {
        throw new Error('La respuesta de /eventos no es una lista.');
    }
    return data;
};
