import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import LoginScreen from './login';

export default function HomeScreen() {
    const { usuario, loading, cerrarSesion } = useAuth();

    if (loading) {
        return (
            <ThemedView style={styles.centeredContainer}>
                <ThemedText>Cargando...</ThemedText>
            </ThemedView>
        );
    }

    if (!usuario) return <LoginScreen />;

    return (
        <ThemedView style={styles.flex}>
            <SafeAreaView style={styles.content}>
                <ThemedText type="subtitle">Hola, {usuario.nombre}</ThemedText>
                <ThemedText themeColor="textSecondary">
                    {usuario.correo} · {usuario.rol}
                </ThemedText>
                <Pressable
                    onPress={cerrarSesion}
                    accessibilityRole="button"
                    accessibilityLabel="Cerrar sesión"
                    style={styles.logoutButton}>
                    <ThemedText type="linkPrimary">Cerrar sesión</ThemedText>
                </Pressable>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { flex: 1, padding: Spacing.four, gap: Spacing.three },
    // Objetivo táctil mínimo de 44 px
    logoutButton: { minHeight: 44, justifyContent: 'center' },
});
