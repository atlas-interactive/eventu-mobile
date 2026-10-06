import { Lora_400Regular, Lora_700Bold, useFonts } from '@expo-google-fonts/lora';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { AuthProvider } from '@/context/auth-context';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const [fontsLoaded] = useFonts({ Lora_400Regular, Lora_700Bold });

    // Espera a que carguen las fuentes antes de mostrar la app
    if (!fontsLoaded) return null;

    return (
        <AuthProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <AnimatedSplashOverlay />
                <AppTabs />
            </ThemeProvider>
        </AuthProvider>
    );
}
