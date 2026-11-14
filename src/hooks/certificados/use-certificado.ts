import { isAxiosError } from 'axios';
import { useState } from 'react';

import { mensajeDeError } from '@/api/mensajeDeError';
import { abrirCertificado, descargarCertificado } from '@/features/certificados/services/certificado-service';

export interface AvisoCertificado {
    tipo: 'pendiente' | 'error';
    mensaje: string;
}

export function useCertificado(eventoId: number) {
    const [descargando, setDescargando] = useState(false);
    const [aviso, setAviso] = useState<AvisoCertificado | null>(null);

    const descargar = async () => {
        if (descargando) return;
        setDescargando(true);
        setAviso(null);
        const archivo = await descargarCertificado(eventoId).catch((err: unknown) => {
            console.error('No se pudo descargar el certificado:', err);
            // El botón solo aparece en eventos certificables, así que un 409 es que aún no hay asistencia
            if (isAxiosError(err) && err.response?.status === 409) {
                setAviso({ tipo: 'pendiente', mensaje: 'Disponible cuando se verifique tu asistencia.' });
            } else {
                setAviso({ tipo: 'error', mensaje: mensajeDeError(err) });
            }
            return null;
        });
        // Se apaga antes de abrir el menú, que se queda abierto hasta que el usuario lo cierre
        setDescargando(false);
        if (!archivo) return;

        try {
            await abrirCertificado(archivo);
        } catch (err: unknown) {
            console.error('No se pudo abrir el certificado:', err);
            setAviso({ tipo: 'error', mensaje: 'No se pudo abrir el certificado.' });
        }
    };

    return { descargando, aviso, descargar };
}
