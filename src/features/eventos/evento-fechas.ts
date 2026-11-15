// El evento ya empezó según su fecha de inicio
export const yaInicio = (fechaInicio: string) => new Date(fechaInicio).getTime() <= new Date().getTime();

// Pasada la medianoche del día del evento la entrada ya no sirve
export const terminoElDia = (fechaInicio: string) => {
    const fin = new Date(fechaInicio);
    fin.setHours(23, 59, 59, 999);
    return fin.getTime() < new Date().getTime();
};

export type EstadoTemporal = 'futuro' | 'en-curso' | 'finalizado';

// En curso desde que inicia hasta la medianoche de ese día, después queda finalizado
export const estadoTemporal = (fechaInicio: string): EstadoTemporal =>
    !yaInicio(fechaInicio) ? 'futuro' : terminoElDia(fechaInicio) ? 'finalizado' : 'en-curso';
