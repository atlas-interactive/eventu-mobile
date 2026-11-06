import { Image } from 'expo-image';
import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { mensajeDeError } from '@/api/mensajeDeError';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconoAviso } from '@/components/ui/icono-aviso';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { login } from '@/features/auth/services/auth-service';
import { esAdministrador } from '@/features/sesion/sesion';

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
            if (esAdministrador(datos)) {
                setError('Esta app es para estudiantes y organizadores. Ingresa desde el panel web de EventU.');
                return;
            }
            await iniciarSesion(datos);
        } catch (e) {
            setError(mensajeDeError(e));
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
                    behavior="padding">
                    <ScrollView
                        contentContainerStyle={styles.container}
                        keyboardShouldPersistTaps="handled">
                        <Image
                            source={require('@/assets/images/iconoEventU.png')}
                            style={styles.logo}
                            contentFit="contain"
                            accessible={false}
                        />
                        <ThemedText type="subtitle" style={styles.centered}>
                            EventU
                        </ThemedText>
                        <ThemedText type="subtitle" style={styles.centered}>
                            Inicia sesión
                        </ThemedText>
                        <ThemedText
                            themeColor="textSecondary"
                            style={styles.centered}>
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
                            <View
                                accessibilityRole="alert"
                                accessibilityLiveRegion="polite"
                                style={[
                                    styles.alertaError,
                                    { backgroundColor: theme.errorBackground, borderColor: theme.softRedBackground },
                                ]}>
                                <IconoAviso tipo="error" style={styles.iconoAlerta} />
                                <ThemedText type="small" themeColor="error" style={styles.textoAlerta}>
                                    {error}
                                </ThemedText>
                            </View>
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
    logo: { width: 42, height: 41, alignSelf: 'center' },
    field: { gap: Spacing.two },
    centered: { textAlign: 'center' },
    alertaError: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.two,
        borderWidth: 1,
        borderRadius: 4,
        padding: Spacing.two,
    },
    iconoAlerta: { marginTop: 2 },
    textoAlerta: { flex: 1 },
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
