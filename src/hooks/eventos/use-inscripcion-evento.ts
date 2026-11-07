import { useEffect, useState } from 'react';

import { mensajeDeError } from '@/api/mensajeDeError';
import {
    inscribirEnEvento,
    tieneInscripcionActiva,
} from '@/features/inscripciones/services/inscripcion-service';

interface Verificacion {
    para: number;
    intento: number;
    yaInscrito: boolean;
    error: string;
}

export function useInscripcionEvento(eventoId: number, habilitado = true) {
    const [verificacion, setVerificacion] = useState<Verificacion | null>(null);
    const [intentoVerificacion, setIntentoVerificacion] = useState(0);
    const [inscribiendo, setInscribiendo] = useState(false);
    const [error, setError] = useState('');
    const [inscripcionRealizada, setInscripcionRealizada] = useState(false);

    const valido = habilitado && Number.isSafeInteger(eventoId) && eventoId > 0;
    // Solo cuenta la verificación hecha para este evento y este intento
    const actual =
        verificacion?.para === eventoId && verificacion.intento === intentoVerificacion ? verificacion : null;
    const verificando = valido && !actual;
    const yaInscrito = valido && !!actual?.yaInscrito;
    const errorVerificacion = valido ? (actual?.error ?? '') : '';

    useEffect(() => {
        if (!valido) return;
        let vigente = true;
        tieneInscripcionActiva(eventoId)
            .then((activa) => {
                if (vigente) {
                    setVerificacion({ para: eventoId, intento: intentoVerificacion, yaInscrito: activa, error: '' });
                }
            })
            .catch((err: unknown) => {
                console.error('No se pudo verificar la inscripción al evento:', err);
                if (vigente) {
                    setVerificacion({
                        para: eventoId,
                        intento: intentoVerificacion,
                        yaInscrito: false,
                        error: mensajeDeError(err),
                    });
                }
            });

        return () => {
            vigente = false;
        };
    }, [eventoId, valido, intentoVerificacion]);

    const reintentarVerificacion = () => setIntentoVerificacion((intento) => intento + 1);

    const inscribir = async () => {
        if (verificando || errorVerificacion || yaInscrito || inscribiendo || inscripcionRealizada) return;
        setInscribiendo(true);
        setError('');
        try {
            await inscribirEnEvento(eventoId);
            setInscripcionRealizada(true);
        } catch (err: unknown) {
            console.error('No se pudo realizar la inscripción al evento:', err);
            setError(mensajeDeError(err));
        } finally {
            setInscribiendo(false);
        }
    };

    return {
        verificando,
        yaInscrito,
        errorVerificacion,
        reintentarVerificacion,
        inscribiendo,
        error,
        inscripcionRealizada,
        inscribir: () => inscribir(),
    };
}
