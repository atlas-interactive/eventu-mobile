import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { login } from '@/services/authService';

export default function LoginScreen() {
    const theme = useTheme();
    const { iniciarSesion } = useAuth();

    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Valida los campos, consulta el backend y guarda la sesión
    const handleLogin = async () => {
        if (!correo.trim() || !password) {
            setError('Ingresa tu correo y contraseña.');
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const datos = await login({ correo: correo.trim(), password });
            await iniciarSesion(datos);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = [
        styles.input,
        { backgroundColor: theme.backgroundElement, color: theme.text },
    ];

    return (
        <ThemedView style={styles.flex}>
            <SafeAreaView style={styles.flex}>
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <ScrollView
                        contentContainerStyle={styles.container}
                        keyboardShouldPersistTaps="handled">
                        <ThemedText type="subtitle" style={[styles.loraBold, styles.centered]}>
                            EventU
                        </ThemedText>
                        <ThemedText type="subtitle" style={[styles.loraBold, styles.centered]}>
                            Inicia sesión
                        </ThemedText>
                        <ThemedText
                            themeColor="textSecondary"
                            style={[styles.loraBold, styles.centered]}>
                            Ingresa con tu correo institucional
                        </ThemedText>

                        <View style={styles.field}>
                            <ThemedText type="smallBold">Correo institucional</ThemedText>
                            <TextInput
                                style={inputStyle}
                                placeholder="nombre@unillanos.edu.co"
                                placeholderTextColor={theme.textSecondary}
                                value={correo}
                                onChangeText={setCorreo}
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="email"
                                textContentType="emailAddress"
                                keyboardType="email-address"
                                editable={!loading}
                                accessibilityLabel="Correo institucional"
                            />
                        </View>

                        <View style={styles.field}>
                            <ThemedText type="smallBold">Contraseña</ThemedText>
                            <TextInput
                                style={inputStyle}
                                placeholder="Mínimo 8 caracteres"
                                placeholderTextColor={theme.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                autoComplete="password"
                                textContentType="password"
                                editable={!loading}
                                onSubmitEditing={handleLogin}
                                accessibilityLabel="Contraseña"
                            />
                        </View>

                        {error && (
                            <ThemedText
                                themeColor="error"
                                accessibilityRole="alert"
                                accessibilityLiveRegion="polite">
                                {error}
                            </ThemedText>
                        )}

                        <Pressable
                            onPress={handleLogin}
                            disabled={loading}
                            accessibilityRole="button"
                            accessibilityLabel="Iniciar sesión"
                            accessibilityState={{ disabled: loading, busy: loading }}
                            style={[
                                styles.button,
                                { backgroundColor: theme.primary },
                                loading && styles.buttonDisabled,
                            ]}>
                            {loading ? (
                                <ActivityIndicator color={theme.onPrimary} />
                            ) : (
                                <ThemedText themeColor="onPrimary" style={styles.buttonText}>
                                    Iniciar sesión
                                </ThemedText>
                            )}
                        </Pressable>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    field: { gap: Spacing.two },
    centered: { textAlign: 'center' },
    loraBold: { fontFamily: 'Lora_700Bold' },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: Spacing.four,
        gap: Spacing.three,
        width: '100%',
        maxWidth: MaxContentWidth,
        alignSelf: 'center',
    },
    input: {
        minHeight: 52,
        borderRadius: 12,
        paddingHorizontal: Spacing.three,
        fontSize: 16,
    },
    button: {
        minHeight: 52,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { fontWeight: '600' },
});
