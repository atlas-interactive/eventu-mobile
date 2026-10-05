export interface LoginRequest {
    correo: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    usuarioId: number;
    nombre: string;
    correo: string;
    rol: string;
}

export interface RegistroRequest {
    nombre: string;
    correo: string;
    password: string;
}

export interface RegistroResponse {
    mensaje: string;
    usuarioId: number;
    correo: string;
    rol: string;
}

