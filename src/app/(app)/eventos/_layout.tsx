import { Stack } from 'expo-router';

// Pila de la pestaña Eventos
export default function EventosLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Eventos' }} />
        </Stack>
    );
}
