import {
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_700Bold,
    useFonts,
} from '@expo-google-fonts/atkinson-hyperlegible';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/context/auth-context';

// Mantiene el splash nativo hasta saber si hay una sesión guardada
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [fontsLoaded] = useFonts({ AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold });

    // Espera a que carguen las fuentes antes de mostrar la app
    if (!fontsLoaded) return null;

    return (
        <AuthProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <NavegacionRaiz />
            </ThemeProvider>
        </AuthProvider>
    );
}

// con sesión solo se entra a (app) y sin sesión solo al login

function NavegacionRaiz() {
    const { usuario, loading } = useAuth();

    return (
        <>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Protected guard={!!usuario}>
                    <Stack.Screen name="(app)" />
                </Stack.Protected>
                <Stack.Protected guard={!usuario}>
                    <Stack.Screen name="login" />
                </Stack.Protected>
            </Stack>
            {/* El splash se oculta solo despues de leer la sesion para que no se alcance a ver el login */}
            {!loading && <AnimatedSplashOverlay />}
        </>
    );
}
