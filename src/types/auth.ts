// Datos que se envían al backend para iniciar sesión
export interface LoginRequestDTO {
    correo: string;
    password: string;
}

// Respuesta del backend cuando el login es exitoso
export interface LoginResponse {
    token: string;
    usuarioId: number;
    nombre: string;
    correo: string;
    rol: string;
    // El backend reactiva la cuenta si estaba desactivada y lo indica aquí
    cuentaReactivada?: boolean;
}
