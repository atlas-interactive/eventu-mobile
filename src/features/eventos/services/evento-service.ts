import { api } from '@/api/client';
import type { Evento, FiltrosEvento, InscritoEvento } from '@/types/evento';

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

// Eventos creados por el organizador en cualquier estado, también los que ya iniciaron
export const listarMisEventos = async (filtros: FiltrosEvento = {}): Promise<Evento[]> => {
    const { data } = await api.get<Evento[]>('/eventos/mios', { params: obtenerParametros(filtros) });
    if (!Array.isArray(data)) {
        throw new Error('La respuesta de /eventos/mios no es una lista.');
    }
    return data;
};

//Para obtener los detalles de un evento específico
export const obtenerEvento = async (id: number): Promise<Evento> => {
    const { data } = await api.get<Evento>(`/eventos/${id}`);
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('La respuesta de /eventos/{id} no es un evento válido.');
    }
    return data;
};

// Solo el organizador del evento o un admin pueden verlos
export const listarInscritosEvento = async (id: number): Promise<InscritoEvento[]> => {
    const url = `/eventos/${id}/inscritos`;
    const { data } = await api.get<InscritoEvento[]>(url);
    if (
        !Array.isArray(data) ||
        data.some(
            (inscrito) =>
                !inscrito ||
                typeof inscrito.inscripcionId !== 'number' ||
                typeof inscrito.usuarioId !== 'number' ||
                typeof inscrito.nombre !== 'string' ||
                typeof inscrito.correo !== 'string' ||
                typeof inscrito.fechaInscripcion !== 'string' ||
                typeof inscrito.asistio !== 'boolean',
        )
    ) {
        throw new Error(`La respuesta de ${url} no es una lista válida de inscritos.`);
    }
    return data;
};
