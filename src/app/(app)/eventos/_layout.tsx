import { Stack } from 'expo-router';

// Pila de la pestaña Eventos
export default function EventosLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Eventos', headerShown: false }} />
            <Stack.Screen name="[id]" options={{ headerShown: false }} />
        </Stack>
    );
}
