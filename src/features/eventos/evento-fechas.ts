// El evento ya empezó según su fecha de inicio
export const yaInicio = (fechaInicio: string) => new Date(fechaInicio).getTime() <= new Date().getTime();
