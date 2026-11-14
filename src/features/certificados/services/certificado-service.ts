import { isAxiosError } from 'axios';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { api } from '@/api/client';

// Con responseType arraybuffer el error del backend también llega en bytes, se pasa a JSON para leer su mensaje
const leerError = (datos: ArrayBuffer): unknown => {
    try {
        return JSON.parse(new TextDecoder().decode(datos));
    } catch {
        return undefined;
    }
};

// Descarga el PDF del certificado y lo guarda en la caché de la app
export const descargarCertificado = async (eventoId: number): Promise<File> => {
    try {
        const { data } = await api.get<ArrayBuffer>(`/certificados/evento/${eventoId}`, {
            responseType: 'arraybuffer',
        });
        const archivo = new File(Paths.cache, `certificado-evento-${eventoId}.pdf`);
        archivo.create({ overwrite: true });
        archivo.write(new Uint8Array(data));
        return archivo;
    } catch (err: unknown) {
        if (isAxiosError(err) && err.response?.data instanceof ArrayBuffer) {
            err.response.data = leerError(err.response.data);
        }
        throw err;
    }
};

//Abre el menú del sistema para ver, guardar o compartir el PDF
export const abrirCertificado = async (archivo: File) => {
    await Sharing.shareAsync(archivo.uri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: 'Certificado de participación',
    });
};
