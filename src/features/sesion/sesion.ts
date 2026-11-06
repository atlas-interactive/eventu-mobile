export const esAdministrador = (sesion: { rol: string } | null): boolean =>
    sesion?.rol.toUpperCase() === 'ADMIN';
