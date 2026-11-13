import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { mensajeDeError } from '@/api/mensajeDeError';
import { listarCategorias } from '@/features/categorias/services/categoria-service';
import { listarEventos, listarMisEventos } from '@/features/eventos/services/evento-service';
import type { Categoria } from '@/types/categoria';
import type { Evento, FiltrosEvento } from '@/types/evento';

const fechasInvalidas = (filtros: FiltrosEvento) =>
    Boolean(filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta);

// Con soloMios se piden los eventos del organizador, que incluyen los que ya iniciaron
export function useCatalogoEventos(soloMios = false) {
    const [resultado, setResultado] = useState<{
        para: FiltrosEvento;
        mios: boolean;
        eventos: Evento[];
        error: string;
    } | null>(null);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [filtros, setFiltros] = useState<FiltrosEvento>({});
    const [errorCategorias, setErrorCategorias] = useState('');
    const [recarga, setRecarga] = useState(0);
    const primeraVez = useRef(true);
    const rangoFechasInvalido = fechasInvalidas(filtros);
    // Esta cargando mientras la última respuesta no corresponda a los filtros actuales
    const respuestaActual = resultado?.para === filtros && resultado.mios === soloMios;
    const cargando = !rangoFechasInvalido && !respuestaActual;
    const eventos = resultado?.eventos ?? [];
    const errorEventos = respuestaActual ? resultado.error : '';
    const hayFiltrosActivos = Boolean(
        filtros.texto?.trim() || filtros.categoriaId || filtros.fechaDesde || filtros.fechaHasta,
    );

    useEffect(() => {
        let vigente = true;
        listarCategorias(true)
            .then((datos) => {
                if (vigente) setCategorias(datos);
            })
            .catch((err: unknown) => {
                console.error('No se pudieron cargar las categorías de eventos:', err);
                if (vigente) setErrorCategorias('No se pudieron cargar las categorías.');
            });
        return () => {
            vigente = false;
        };
    }, []);

    // Al volver al catálogo se piden los eventos otra vez para ver los cupos al día
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
        if (rangoFechasInvalido) return;
        let vigente = true;

        const espera = filtros.texto?.trim() ? 300 : 0;
        const temporizador = setTimeout(() => {
            const consulta = soloMios ? listarMisEventos : listarEventos;
            consulta(filtros)
                .then((datos) => {
                    if (vigente) setResultado({ para: filtros, mios: soloMios, eventos: datos, error: '' });
                })
                .catch((err: unknown) => {
                    console.error('No se pudo cargar el catálogo de eventos:', err);
                    if (vigente) {
                        setResultado({ para: filtros, mios: soloMios, eventos: [], error: mensajeDeError(err) });
                    }
                });
        }, espera);

        return () => {
            vigente = false;
            clearTimeout(temporizador);
        };
    }, [filtros, rangoFechasInvalido, recarga, soloMios]);

    return {
        eventos,
        categorias,
        filtros,
        setFiltros,
        cargando,
        errorEventos,
        errorCategorias,
        rangoFechasInvalido,
        hayFiltrosActivos,
    };
}
