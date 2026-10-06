import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import type { LoginResponse } from '@/types/auth';
import { CLAVE_SESION } from '@/constants/session';

interface AuthContextType {
    usuario: LoginResponse | null;
    loading: boolean;
    iniciarSesion: (datos: LoginResponse) => Promise<void>;
    cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<LoginResponse | null>(null);
    const [loading, setLoading] = useState(true);

    // Al abrir la app, recupera la sesión guardada en el teléfono
    useEffect(() => {
        SecureStore.getItemAsync(CLAVE_SESION)
            .then((guardado) => {
                if (guardado) setUsuario(JSON.parse(guardado));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // Guarda la sesión en el teléfono y en memoria tras un login exitoso
    const iniciarSesion = async (datos: LoginResponse) => {
        await SecureStore.setItemAsync(CLAVE_SESION, JSON.stringify(datos));
        setUsuario(datos);
    };

    // Borra la sesión del teléfono y de memoria
    const cerrarSesion = async () => {
        await SecureStore.deleteItemAsync(CLAVE_SESION);
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ usuario, loading, iniciarSesion, cerrarSesion }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook para acceder a la sesión desde cualquier pantalla
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return ctx;
}
