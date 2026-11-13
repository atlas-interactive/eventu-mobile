import { isAxiosError } from 'axios';
import { useRef, useState } from 'react';

import { mensajeDeError } from '@/api/mensajeDeError';
import { registrarAsistencia } from '@/features/asistencias/services/asistencia-service';

export type ResultadoAsistencia =
    | { tipo: 'exito'; usuario: string; evento: string; hora: string }
    | { tipo: 'error'; titulo: string; mensaje: string };

const formatoHora = new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit' });

// Los títulos siguen las pantallas de Figma según lo que responde el backend
const tituloError = (err: unknown): string => {
    if (!isAxiosError<{ error?: string }>(err)) return 'No se pudo registrar la asistencia';
    const estado = err.response?.status;
    const texto = (err.response?.data?.error ?? '').toLowerCase();
    if (estado === 404) return 'Código QR inválido';
    if (estado === 403) return 'Sin permiso';
    if (estado === 409) {
        if (texto.includes('ya fue registrada')) return 'Asistencia ya registrada';
        if (texto.includes('inscripción')) return 'Inscripción cancelada';
        if (texto.includes('evento')) return 'Evento cancelado';
    }
    return 'No se pudo registrar la asistencia';
};

export function useRegistroAsistencia() {
    const [procesando, setProcesando] = useState(false);
    const [resultado, setResultado] = useState<ResultadoAsistencia | null>(null);
    // La cámara lee el mismo código varias veces seguidas, así que se bloquea mientras se procesa
    const ocupado = useRef(false);
    const ultimoCodigo = useRef<{ codigo: string; momento: number } | null>(null);

    const registrar = async (codigo: string, manual = false) => {
        const limpio = codigo.trim();
        if (!limpio || ocupado.current) return;
        const repetido =
            ultimoCodigo.current?.codigo === limpio && Date.now() - ultimoCodigo.current.momento < 3000;
        if (repetido && !manual) return;

        ocupado.current = true;
        setProcesando(true);
        try {
            const respuesta = await registrarAsistencia(limpio);
            const fecha = new Date(respuesta.fechaRegistro);
            setResultado({
                tipo: 'exito',
                usuario: respuesta.usuario,
                evento: respuesta.evento,
                hora: Number.isNaN(fecha.getTime()) ? '' : formatoHora.format(fecha),
            });
        } catch (err: unknown) {
            console.error('No se pudo registrar la asistencia:', err);
            setResultado({ tipo: 'error', titulo: tituloError(err), mensaje: mensajeDeError(err) });
        } finally {
            ultimoCodigo.current = { codigo: limpio, momento: Date.now() };
            ocupado.current = false;
            setProcesando(false);
        }
    };

    return { procesando, resultado, registrar };
}
