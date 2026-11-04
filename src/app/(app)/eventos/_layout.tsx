import { Stack } from 'expo-router';

import { BotonCerrarSesion } from '@/components/boton-cerrar-sesion';

// El cierre de sesión va en el encabezado
export default function EventosLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{ title: 'Eventos', headerRight: () => <BotonCerrarSesion /> }}
            />
        </Stack>
    );
}
