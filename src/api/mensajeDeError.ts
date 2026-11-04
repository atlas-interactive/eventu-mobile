import { isAxiosError } from "axios";

const MENSAJE_INESPERADO = "Ocurrió un error inesperado al conectar con el servidor.";
const MENSAJE_TIEMPO_AGOTADO = "El servidor tardó demasiado en responder, intenta nuevamente.";
const MENSAJE_SIN_CONEXION = "No se pudo conectar con el servidor";

export const mensajeDeError = (err: unknown): string => {
    if (isAxiosError<{ error?: string }>(err)) {
        if (err.response?.data?.error) return err.response.data.error;
        if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") return MENSAJE_TIEMPO_AGOTADO;
        if (!err.response) return MENSAJE_SIN_CONEXION;
    }
    return MENSAJE_INESPERADO;
}