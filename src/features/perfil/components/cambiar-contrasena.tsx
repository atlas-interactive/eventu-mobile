import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { mensajeDeError } from '@/api/mensajeDeError';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { cambiarContrasena } from '@/features/perfil/services/perfil-service';
import { useTheme } from '@/hooks/use-theme';

interface CambiarContrasenaProps {
    // La pantalla muestra arriba el mensaje de éxito
    onMensajeExito: (mensaje: string) => void;
}

export function CambiarContrasena({ onMensajeExito }: CambiarContrasenaProps) {
    const theme = useTheme();
    const { actualizarToken } = useAuth();
    const [passwordActual, setPasswordActual] = useState('');
    const [passwordNueva, setPasswordNueva] = useState('');
    const [confirmacionContrasena, setConfirmacionContrasena] = useState('');
    const [cambiandoContrasena, setCambiandoContrasena] = useState(false);
    const [errorContrasena, setErrorContrasena] = useState('');

    const guardarContrasena = async () => {
        setErrorContrasena('');
        onMensajeExito('');

        if (passwordNueva.length < 8 || passwordNueva.length > 72) {
            setErrorContrasena('La contraseña debe tener entre 8 y 72 caracteres.');
            return;
        }
        if (passwordNueva !== confirmacionContrasena) {
            setErrorContrasena('La confirmación no coincide con la nueva contraseña.');
            return;
        }

        setCambiandoContrasena(true);
        try {
            const respuesta = await cambiarContrasena({ passwordActual, passwordNueva });
            await actualizarToken(respuesta.token);
            setPasswordActual('');
            setPasswordNueva('');
            setConfirmacionContrasena('');
            onMensajeExito(respuesta.mensaje || 'Tu contraseña se actualizó correctamente.');
        } catch (error: unknown) {
            console.error('No se pudo cambiar la contraseña:', error);
            setErrorContrasena(mensajeDeError(error));
        } finally {
            setCambiandoContrasena(false);
        }
    };

    const estiloInput = [
        styles.input,
        { borderColor: theme.fieldBorder, backgroundColor: theme.surface, color: theme.text },
    ];

    return (
        <View
            style={[
                styles.tarjeta,
                { backgroundColor: theme.surface, borderColor: theme.border, borderTopColor: theme.primary },
            ]}>
            <View style={styles.titulo}>
                <SymbolView name={{ ios: 'key', android: 'key', web: 'key' }} size={18} tintColor={theme.text} />
                <ThemedText type="smallBold" accessibilityRole="header" style={styles.textoTitulo}>
                    Cambiar contraseña
                </ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
                Usa tu contraseña actual para confirmar el cambio.
            </ThemedText>

            <View style={styles.campo}>
                <ThemedText type="small">Contraseña actual</ThemedText>
                <TextInput
                    accessibilityLabel="Contraseña actual"
                    value={passwordActual}
                    onChangeText={setPasswordActual}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="current-password"
                    textContentType="password"
                    editable={!cambiandoContrasena}
                    placeholder="Ingresa tu contraseña actual"
                    placeholderTextColor={theme.textSecondary}
                    style={estiloInput}
                />
            </View>
            <View style={styles.campo}>
                <ThemedText type="small">Nueva contraseña</ThemedText>
                <TextInput
                    accessibilityLabel="Nueva contraseña"
                    value={passwordNueva}
                    onChangeText={setPasswordNueva}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="new-password"
                    textContentType="newPassword"
                    maxLength={72}
                    editable={!cambiandoContrasena}
                    placeholder="Entre 8 y 72 caracteres"
                    placeholderTextColor={theme.textSecondary}
                    style={estiloInput}
                />
            </View>
            <View style={styles.campo}>
                <ThemedText type="small">Confirmar nueva contraseña</ThemedText>
                <TextInput
                    accessibilityLabel="Confirmar nueva contraseña"
                    value={confirmacionContrasena}
                    onChangeText={setConfirmacionContrasena}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="new-password"
                    textContentType="newPassword"
                    maxLength={72}
                    editable={!cambiandoContrasena}
                    placeholder="Repite tu nueva contraseña"
                    placeholderTextColor={theme.textSecondary}
                    style={estiloInput}
                />
            </View>

            {!!errorContrasena && (
                <ThemedText type="small" themeColor="error" accessibilityRole="alert">
                    {errorContrasena}
                </ThemedText>
            )}
            <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: cambiandoContrasena, busy: cambiandoContrasena }}
                disabled={cambiandoContrasena}
                onPress={guardarContrasena}
                style={[styles.boton, { backgroundColor: theme.primary }, cambiandoContrasena && styles.deshabilitado]}>
                <ThemedText type="smallBold" themeColor="onPrimary">
                    {cambiandoContrasena ? 'Actualizando…' : 'Actualizar contraseña'}
                </ThemedText>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    tarjeta: { gap: 12, borderWidth: 1, borderTopWidth: 6, borderRadius: 8, padding: Spacing.three },
    titulo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
    textoTitulo: { fontSize: 16, lineHeight: 24 },
    campo: { gap: Spacing.one },
    input: {
        minHeight: 44,
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 12,
        fontFamily: 'AtkinsonHyperlegible_400Regular',
        fontSize: 14,
    },
    boton: { minHeight: 44, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
    deshabilitado: { opacity: 0.6 },
});
