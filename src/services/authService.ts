import {api} from '@/api/client';
import type {
    LoginRequest,
    LoginResponse,
    RegistroRequest,
    RegistroResponse,
} from '@/types/auth'

export const login = (data: LoginRequest) =>
    api<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const registro = (data: RegistroRequest) =>
    api<RegistroResponse>('/auth/registro', {
        method: 'POST',
        body: JSON.stringify(data),
    });