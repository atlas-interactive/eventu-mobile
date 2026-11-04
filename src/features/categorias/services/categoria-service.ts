import { api } from '@/api/client';
import type { Categoria } from '@/types/categoria';

// soloActivas=true deja fuera las categorías desactivadas
export const listarCategorias = async (soloActivas = false): Promise<Categoria[]> => {
    const { data } = await api.get<Categoria[]>('/categorias', { params: { soloActivas } });
    if (!Array.isArray(data)) {
        throw new Error('La respuesta de /categorias no es una lista.');
    }
    return data;
};
