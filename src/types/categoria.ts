// Respuesta del backend para una categoría (CategoriaResponseDTO)
export interface Categoria {
    id: number;
    nombre: string;
    activo: boolean;
    creadoEn: string;
    // Solo cuenta eventos en estado PUBLICADO
    eventosActivos: number;
}
