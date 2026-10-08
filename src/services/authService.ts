import { api } from '@/api/client';
import type { LoginRequestDTO, LoginResponse } from '@/types/auth';

// Inicia sesión con correo y contraseña
export const login = (data: LoginRequestDTO) =>
    api.post<LoginResponse>('/auth/login', data).then((response) => response.data);
