import { Stack } from 'expo-router';

// Pantallas que exigen sesión iniciada; el detalle se abre encima de las pestañas
export default function AppLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="evento/[id]" />
        </Stack>
    );
}
