import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { mensajeDeError } from '@/api/mensajeDeError';
import { listarMisInscripciones } from '@/features/inscripciones/services/inscripcion-service';
import type { EstadoInscripcion, Inscripcion } from '@/types/inscripcion';

export type FiltroInscripcion = 'TODAS' | EstadoInscripcion;

export function useMisInscripciones() {
    const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [filtro, setFiltro] = useState<FiltroInscripcion>('TODAS');
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

    return {
        inscripciones: visibles,
        conteos,
        cargando,
        error,
        filtro,
        setFiltro,
    };
}
