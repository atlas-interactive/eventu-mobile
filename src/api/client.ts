const BASE_URL = process.env.EXPO_PUBLIC_API_URL

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            ...options,
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json', ...options.headers }
        });
        
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error ?? 'Error en el servidor'); 
        return data as T;
    } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') {
            throw new Error('El servidor tardó demasiado en responder. Intenta de nuevo.');
        }
        throw e;
    } finally {
        clearTimeout(timeout);
    }   
}