import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { mensajeDeError } from '@/api/mensajeDeError';
import {
    cancelarInscripcion,
    listarMisInscripciones,
} from '@/features/inscripciones/services/inscripcion-service';
import type { EstadoInscripcion, Inscripcion } from '@/types/inscripcion';

export type FiltroInscripcion = 'TODAS' | EstadoInscripcion;

export function useMisInscripciones() {
    const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [filtro, setFiltro] = useState<FiltroInscripcion>('TODAS');
    const [aCancelar, setACancelar] = useState<Inscripcion | null>(null);
    const [cancelando, setCancelando] = useState(false);
    const [errorCancelacion, setErrorCancelacion] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const [recarga, setRecarga] = useState(0);
    const primeraVez = useRef(true);

    // Al volver a la pestaña se piden otra vez por si hubo una inscripción nueva
    useFocusEffect(
        useCallback(() => {
            if (primeraVez.current) {
                primeraVez.current = false;
                return;
            }
            setRecarga((n) => n + 1);
        }, []),
    );

    useEffect(() => {
        let vigente = true;
        listarMisInscripciones()
            .then((datos) => {
                if (vigente) {
                    setInscripciones(datos);
                    setError('');
                }
            })
            .catch((err: unknown) => {
                console.error('No se pudieron cargar las inscripciones:', err);
                if (vigente) setError(mensajeDeError(err));
            })
            .finally(() => {
                if (vigente) setCargando(false);
            });

        return () => {
            vigente = false;
        };
    }, [recarga]);

    const conteos = inscripciones.reduce(
        (total, inscripcion) => {
            total.TODAS += 1;
            total[inscripcion.estado] += 1;
            return total;
        },
        { TODAS: 0, ACTIVA: 0, CANCELADA: 0 },
    );
    const visibles = filtro === 'TODAS'
        ? inscripciones
        : inscripciones.filter((inscripcion) => inscripcion.estado === filtro);

    const solicitarCancelacion = (inscripcion: Inscripcion) => {
        setErrorCancelacion('');
        setMensajeExito('');
        setACancelar(inscripcion);
    };

    const cerrarConfirmacion = () => {
        if (cancelando) return;
        setACancelar(null);
        setErrorCancelacion('');
    };

    const confirmarCancelacion = async () => {
        const inscripcion = aCancelar;
        if (!inscripcion || cancelando) return;

        setCancelando(true);
        setErrorCancelacion('');
        try {
            const respuesta = await cancelarInscripcion(inscripcion.id);
            setInscripciones((actuales) =>
                actuales.map((actual) =>
                    actual.id === inscripcion.id
                        ? { ...actual, estado: 'CANCELADA' }
                        : actual,
                ),
            );
            setMensajeExito(respuesta.mensaje);
            setACancelar(null);
        } catch (err: unknown) {
            console.error('No se pudo cancelar la inscripción:', err);
            setErrorCancelacion(mensajeDeError(err));
        } finally {
            setCancelando(false);
        }
    };

    return {
        inscripciones: visibles,
        conteos,
        cargando,
        error,
        filtro,
        setFiltro,
        aCancelar,
        cancelando,
        errorCancelacion,
        mensajeExito,
        solicitarCancelacion,
        cerrarConfirmacion,
        confirmarCancelacion,
    };
}
