import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { CLAVE_ACCESIBILIDAD } from '@/constants/session';

export type TamanoLetra = 'pequena' | 'normal' | 'grande';

export interface PreferenciasAccesibilidad {
    altoContraste: boolean;
    daltonismo: boolean;
    tamanoLetra: TamanoLetra;
}

interface AccesibilidadContextType extends PreferenciasAccesibilidad {
    cambiarPreferencias: (cambios: Partial<PreferenciasAccesibilidad>) => void;
}

const PREFERENCIAS_INICIALES: PreferenciasAccesibilidad = {
    altoContraste: false,
    daltonismo: false,
    tamanoLetra: 'normal',
};

const AccesibilidadContext = createContext<AccesibilidadContextType | null>(null);

export function AccesibilidadProvider({ children }: { children: ReactNode }) {
    const [preferencias, setPreferencias] = useState<PreferenciasAccesibilidad>(PREFERENCIAS_INICIALES);

    // Las preferencias son del celular, no de la cuenta, por eso se leen antes del login
    useEffect(() => {
        SecureStore.getItemAsync(CLAVE_ACCESIBILIDAD)
            .then((guardado) => {
                if (guardado) setPreferencias({ ...PREFERENCIAS_INICIALES, ...JSON.parse(guardado) });
            })
            .catch(() => {});
    }, []);

    // Se aplican al instante y se guardan para la próxima vez que se abra la app
    const cambiarPreferencias = (cambios: Partial<PreferenciasAccesibilidad>) => {
        const nuevas = { ...preferencias, ...cambios };
        setPreferencias(nuevas);
        SecureStore.setItemAsync(CLAVE_ACCESIBILIDAD, JSON.stringify(nuevas)).catch((err: unknown) => {
            console.error('No se pudieron guardar las preferencias de accesibilidad:', err);
        });
    };

    return (
        <AccesibilidadContext.Provider value={{ ...preferencias, cambiarPreferencias }}>
            {children}
        </AccesibilidadContext.Provider>
    );
}

export function useAccesibilidad() {
    const ctx = useContext(AccesibilidadContext);
    if (!ctx) throw new Error('useAccesibilidad debe usarse dentro de AccesibilidadProvider');
    return ctx;
}
